// src/app/api/admin/case-knowledge/[id]/unpublish/route.ts
//
// STEP21-1 — 신규 파일. 게시된 case_knowledge 행을 다시 비공개로
// 되돌린다(is_published=false). 검토·게시 이력(reviewed_*/published_*)은
// 지우지 않는다 — 감사 기록으로 남겨둔다.

import { NextRequest, NextResponse } from "next/server";
import { createAdminReadOnlyClient } from "@/lib/adminAuth/readOnlyClient";
import { verifyAdminUser } from "@/lib/adminAuth/verifyAdminUser";
import { unpublishCaseKnowledge } from "@/lib/caseKnowledge/reviewWorkflow";

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
    const result = await unpublishCaseKnowledge(id);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      id: result.row.id,
      isPublished: result.row.is_published,
    });
  } catch (err) {
    console.error("case-knowledge/[id]/unpublish route error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
