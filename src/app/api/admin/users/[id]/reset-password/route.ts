// src/app/api/admin/users/[id]/reset-password/route.ts
//
// 관리자 계정 관리(STEP 2) — 신규 파일.
//
// POST: super_admin이 특정 관리자에게 비밀번호 재설정 메일을 대신 발송한다.
// src/app/api/admin/forgot-password/route.ts와 로직은 동일하지만, 그 route는
// "본인이 이메일을 입력"하는 비로그인 상태 전용이라 그대로 재사용할 수 없어
// (여기서는 이미 인증된 super_admin이 target id로 특정 관리자를 지정) 별도
// 파일로 두되, **완전히 동일한 recovery 패턴**(generateLink({type:"recovery"})
// → hashed_token만 사용 → /admin/auth/callback?token_hash=...&type=recovery
// 조립 → Resend 발송)을 그대로 재사용한다. 새로운 recovery 로직을 만들지
// 않았다 — src/app/api/admin/forgot-password/route.ts,
// src/app/admin/auth/callback/route.ts, src/app/admin/reset-password/page.tsx는
// 전혀 수정하지 않았다.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireSuperAdmin } from "@/lib/adminAuth/requireSuperAdmin";
import { sendAdminPasswordResetEmail } from "@/lib/adminAuth/adminPasswordResetEmail";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return auth.response;

  const { id: targetId } = await params;

  const { data: target, error: targetError } = await supabaseAdmin
    .from("admin_users")
    .select("id, email, active")
    .eq("id", targetId)
    .maybeSingle();

  if (targetError) {
    console.error("admin users reset-password target lookup error:", targetError);
    return NextResponse.json({ error: "관리자 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
  if (!target) {
    return NextResponse.json({ error: "관리자를 찾을 수 없습니다." }, { status: 404 });
  }
  if (!target.active) {
    return NextResponse.json(
      { error: "비활성 관리자에게는 재설정 메일을 보낼 수 없습니다." },
      { status: 400 }
    );
  }

  const { data: linkData, error: generateLinkError } =
    await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: target.email,
      options: {
        redirectTo: `${req.nextUrl.origin}/admin/reset-password`,
      },
    });

  const hashedToken = linkData?.properties?.hashed_token;

  if (generateLinkError || !hashedToken) {
    console.error("admin users reset-password generateLink error:", generateLinkError);
    return NextResponse.json(
      { error: "재설정 링크 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  const resetUrl = `${req.nextUrl.origin}/admin/auth/callback?token_hash=${encodeURIComponent(
    hashedToken
  )}&type=recovery`;

  const sendResult = await sendAdminPasswordResetEmail({ email: target.email, resetUrl });
  if (!sendResult.success) {
    console.error("admin users reset-password send error:", sendResult.error);
    return NextResponse.json(
      { error: "재설정 메일 발송 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "비밀번호 재설정 메일을 발송했습니다." }, { status: 200 });
}
