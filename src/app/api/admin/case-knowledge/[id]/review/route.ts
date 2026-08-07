// src/app/api/admin/case-knowledge/[id]/review/route.ts
//
// STEP21-1 — 신규 파일. 관리자가 case_knowledge 한 건을 검토(필요하면
// 내용 수정)하고 needs_manual_review를 해제한다. 게시(publish)는 별도
// route에서 처리한다 — 검토와 게시를 분리한 이유는
// src/lib/caseKnowledge/reviewWorkflow.ts 상단 주석 참고.

import { NextRequest, NextResponse } from "next/server";
import { createAdminReadOnlyClient } from "@/lib/adminAuth/readOnlyClient";
import { verifyAdminUser } from "@/lib/adminAuth/verifyAdminUser";
import { reviewCaseKnowledge } from "@/lib/caseKnowledge/reviewWorkflow";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const readOnlySupabase = createAdminReadOnlyClient(req);
    const {
      data: { user },
    } = await readOnlySupabase.auth.getUser();
    const adminUser = user ? await verifyAdminUser(user.id) : null;
    if (!adminUser) {
      return NextResponse.json({ error: "관리자 인증이 필요합니다." }, { status: 401 });
    }

    const { id } = await params;
    const body = (await req.json().catch(() => ({}))) as {
      question?: string;
      aiAnswer?: string;
      expertReview?: string;
      finalResult?: string;
      rejectionReason?: string;
    };

    const result = await reviewCaseKnowledge(id, {
      reviewedBy: adminUser.name || adminUser.email || adminUser.id,
      question: body.question,
      aiAnswer: body.aiAnswer,
      expertReview: body.expertReview,
      finalResult: body.finalResult,
      rejectionReason: body.rejectionReason,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      id: result.row.id,
      needsManualReview: result.row.needs_manual_review,
      isPublished: result.row.is_published,
      reviewedBy: result.row.reviewed_by,
      reviewedAt: result.row.reviewed_at,
    });
  } catch (err) {
    console.error("case-knowledge/[id]/review route error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
