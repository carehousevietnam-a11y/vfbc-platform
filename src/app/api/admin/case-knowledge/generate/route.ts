// src/app/api/admin/case-knowledge/generate/route.ts
//
// STEP21 — 신규 파일. 관리자가 사건 종료 정보(결과/사유/소요기간 등)를
// 입력하면 case_knowledge 한 건을 생성/갱신한다.
//
// 왜 이 route가 필요한가: admin/cases에는 아직 "사건 종료"를 기록하는
// 기능 자체가 없다(승인/반려/철회 같은 최종 결과 입력 UI 없음 — 확인
// 결과 실제로 미착수 상태). "사건 종료 시 자동 생성"을 실제 이벤트에
// 연결할 수 없으므로, 관리자가 명시적으로 호출하는 API로 최소 구현했다.
// 화면(버튼)은 아직 admin/cases에 추가하지 않았다 — admin/cases 자체를
// 이번 스텝에서 수정하지 않기 위함(지시서: Admin 절대 수정 금지).
//
// [STEP21-1 변경]
// - resultStatus 목록에서 in_supplement 제거, caseStatus("ongoing"|"closed")
//   추가 지원 — "보완 중"은 이제 caseStatus="ongoing"으로 표현한다.
// - generateCaseKnowledge()가 이제 upsert(중복 방지)를 수행하므로, 같은
//   leadId로 여러 번 호출해도 행이 늘어나지 않고 갱신된다.
// - 이 route는 "생성/갱신"만 담당한다. 검토(review)·게시(publish)는
//   각각 별도 route([id]/review, [id]/publish, [id]/unpublish)로
//   분리했다 — "누가 생성했는지"와 "누가 검토·게시했는지"는 서로 다른
//   책임이므로 하나의 액션으로 합치지 않았다.
//
// 인증: middleware.ts가 이미 /api/admin/:path* 전체를 세션+admin_users.active
// 기준으로 보호한다. src/app/api/admin/case-pdf/route.ts와 동일하게,
// 이 route도 방어적으로 한 번 더 확인한다.

import { NextRequest, NextResponse } from "next/server";
import { createAdminReadOnlyClient } from "@/lib/adminAuth/readOnlyClient";
import { verifyAdminUser } from "@/lib/adminAuth/verifyAdminUser";
import { generateCaseKnowledge } from "@/lib/caseKnowledge/generator";
import type { CaseResultStatus, CaseStatus } from "@/lib/caseKnowledge/types";

const VALID_RESULT_STATUSES: CaseResultStatus[] = [
  "success",
  "rejected",
  "withdrawn",
  "success_after_supplement",
];
const VALID_CASE_STATUSES: CaseStatus[] = ["ongoing", "closed"];

export async function POST(req: NextRequest) {
  try {
    const readOnlySupabase = createAdminReadOnlyClient(req);
    const {
      data: { user },
    } = await readOnlySupabase.auth.getUser();
    const adminUser = user ? await verifyAdminUser(user.id) : null;
    if (!adminUser) {
      return NextResponse.json({ error: "관리자 인증이 필요합니다." }, { status: 401 });
    }

    const body = (await req.json()) as {
      leadId?: string;
      caseStatus?: string;
      resultStatus?: string;
      finalResult?: string;
      rejectionReason?: string;
      processingDays?: number;
      expertReview?: string;
      relatedDocuments?: string[];
      relatedLaws?: string[];
    };

    if (!body.leadId) {
      return NextResponse.json({ error: "leadId가 필요합니다." }, { status: 400 });
    }

    const caseStatus = (body.caseStatus as CaseStatus | undefined) ?? "closed";
    if (!VALID_CASE_STATUSES.includes(caseStatus)) {
      return NextResponse.json(
        { error: `caseStatus는 ${VALID_CASE_STATUSES.join(", ")} 중 하나여야 합니다.` },
        { status: 400 }
      );
    }

    if (caseStatus === "closed") {
      if (
        !body.resultStatus ||
        !VALID_RESULT_STATUSES.includes(body.resultStatus as CaseResultStatus)
      ) {
        return NextResponse.json(
          {
            error: `caseStatus가 closed이면 resultStatus가 필요합니다 (${VALID_RESULT_STATUSES.join(", ")} 중 하나).`,
          },
          { status: 400 }
        );
      }
    }

    const result = await generateCaseKnowledge({
      leadId: body.leadId,
      caseStatus,
      resultStatus: body.resultStatus as CaseResultStatus | undefined,
      finalResult: body.finalResult,
      rejectionReason: body.rejectionReason,
      processingDays: body.processingDays,
      expertReview: body.expertReview,
      relatedDocuments: body.relatedDocuments,
      relatedLaws: body.relatedLaws,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      id: result.row.id,
      caseStatus: result.row.case_status,
      resultStatus: result.row.result_status,
      needsManualReview: result.row.needs_manual_review,
      isPublished: result.row.is_published,
    });
  } catch (err) {
    console.error("case-knowledge/generate route error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
