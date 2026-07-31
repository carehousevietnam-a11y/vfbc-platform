import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 이 파일은 서버에서만 실행됩니다. service role key는 절대 브라우저로 노출되지 않습니다.
//
// MyPage "내 서류 지갑" 실제 파일 연동 — 신규 API.
//
// 왜 새 라우트가 필요한가:
// - 기존 문서 업로드 흐름(src/app/documents/page.tsx)은 브라우저에서 Supabase Storage와
//   crm_activities에 직접 접근하지만, 저장한 storagePath를 화면에 다시 보여주기 위한
//   Signed URL은 생성하지 않는다(개인정보 서류라 getPublicUrl도 쓰지 않음).
// - Signed URL을 만드는 기존 코드는 admin/cases/[leadId]/page.tsx 단 한 곳뿐이며, 이는
//   서버 컴포넌트에서 supabaseAdmin(service role key)으로 렌더링 시점에만 실행된다.
//   MyPage는 "use client" 컴포넌트라 service role key를 절대 직접 쓸 수 없다.
// - 따라서 "로그인한 고객 본인 확인 → 해당 leadId가 본인 소유인지 재확인 → 그 리드의
//   문서만 Signed URL 발급"을 서버에서 처리하는 최소 라우트가 필요하다.
//
// 인증·소유권 검증 방식은 /api/mypage-data, /api/mypage-pdf와 완전히 동일하게 복제했다
// (accessToken → supabaseAdmin.auth.getUser → leads.user_id 매칭). 새 테이블/컬럼/버킷은
// 전혀 추가하지 않았고, 기존 documents 버킷 + crm_activities(action="document_upload")
// 구조만 읽는다.

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STORAGE_BUCKET = "documents";
// Signed URL 유효시간 — admin/cases/[leadId]/page.tsx의 기존 값(3600초)과 동일하게 맞춤.
const SIGNED_URL_EXPIRES_IN = 3600;

type DocumentMeta = {
  fileName?: string;
  storagePath?: string;
  fileSize?: number;
  expiryDate?: string | null;
};

export type MyPageDocumentEntry = {
  activityId: string;
  docType: string; // crm_activities.tag — 서류 종류 라벨(여권/비자/거주증(TRC)/증명사진/건강검진서/기타 서류)
  fileName: string;
  fileExt: string;
  fileSize: number | null;
  expiryDate: string | null;
  createdAt: string;
  viewUrl: string | null;
  downloadUrl: string | null;
};

function getExt(fileName: string): string {
  const parts = fileName.split(".");
  if (parts.length < 2) return "";
  return (parts.pop() || "").toLowerCase();
}

// storagePath 검증 — crm_activities.meta는 클라이언트가 insert하는 jsonb라 완전히
// 신뢰할 수 없다. Signed URL을 발급하기 전에, 저장된 storagePath가 실제로 "이 leadId
// 소유의 document-upload 폴더" 안에 있는 파일인지 반드시 재확인한다. 이 검증을
// 통과하지 못하면 목록에서 조용히 제외한다(다른 고객 경로·다른 Storage 폴더·경로
// 조작 문자열이 섞여 있어도 그 항목만 무시되고 나머지 정상 문서는 그대로 반환됨).
function isStoragePathAllowed(storagePath: string, leadId: string): boolean {
  const allowedPrefix = `document-upload/${leadId}/`;
  if (!storagePath.startsWith(allowedPrefix)) return false;
  if (storagePath.includes("..")) return false;
  if (storagePath.includes("\\")) return false;
  const rest = storagePath.slice(allowedPrefix.length);
  if (!rest || rest.length === 0) return false;
  if (rest.includes("/")) return false; // prefix 아래에 하위 폴더가 있으면(경로 조작 의심) 거부
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const { accessToken, leadId } = (await req.json()) as {
      accessToken?: string;
      leadId?: string;
    };

    if (!accessToken || !leadId) {
      return NextResponse.json({ error: "요청 정보가 올바르지 않습니다." }, { status: 400 });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "로그인이 만료되었습니다. 다시 로그인해주세요." }, { status: 401 });
    }
    const userId = userData.user.id;

    // 본인 소유 리드인지 반드시 확인 (leadId만으로 타인 서류 접근 방지) —
    // /api/mypage-pdf와 동일한 방식.
    const { data: lead, error: leadError } = await supabaseAdmin
      .from("leads")
      .select("id, user_id")
      .eq("id", leadId)
      .eq("user_id", userId)
      .maybeSingle();

    if (leadError || !lead) {
      return NextResponse.json({ error: "해당 신청 내역을 찾을 수 없습니다." }, { status: 404 });
    }

    const { data: activitiesRaw, error: activitiesError } = await supabaseAdmin
      .from("crm_activities")
      .select("id, tag, meta, created_at")
      .eq("lead_id", leadId)
      .eq("action", "document_upload")
      .order("created_at", { ascending: false });

    if (activitiesError) {
      console.error("mypage-documents crm_activities error:", activitiesError);
      return NextResponse.json({ error: "서류 목록을 불러오지 못했습니다." }, { status: 500 });
    }

    const rows = activitiesRaw ?? [];

    const documents: MyPageDocumentEntry[] = [];
    for (const row of rows) {
      const meta = (row.meta ?? {}) as DocumentMeta;
      if (!meta.storagePath || !meta.fileName) continue;
      if (!isStoragePathAllowed(meta.storagePath, leadId)) {
        console.error(
          "mypage-documents blocked out-of-scope storagePath:",
          row.id,
          meta.storagePath
        );
        continue;
      }

      let viewUrl: string | null = null;
      let downloadUrl: string | null = null;
      try {
        const [{ data: viewData }, { data: downloadData }] = await Promise.all([
          supabaseAdmin.storage.from(STORAGE_BUCKET).createSignedUrl(meta.storagePath, SIGNED_URL_EXPIRES_IN),
          supabaseAdmin.storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(meta.storagePath, SIGNED_URL_EXPIRES_IN, { download: meta.fileName }),
        ]);
        viewUrl = viewData?.signedUrl ?? null;
        downloadUrl = downloadData?.signedUrl ?? null;
      } catch (signError) {
        console.error("mypage-documents signed url error:", signError);
      }

      documents.push({
        activityId: row.id,
        docType: row.tag ?? "기타 서류",
        fileName: meta.fileName,
        fileExt: getExt(meta.fileName),
        fileSize: typeof meta.fileSize === "number" ? meta.fileSize : null,
        expiryDate: meta.expiryDate ?? null,
        createdAt: row.created_at,
        viewUrl,
        downloadUrl,
      });
    }

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("mypage-documents fatal error:", error);
    return NextResponse.json({ error: "서버와 통신 중 문제가 발생했습니다." }, { status: 500 });
  }
}
