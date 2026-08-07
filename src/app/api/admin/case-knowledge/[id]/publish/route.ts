// src/app/api/admin/case-knowledge/[id]/publish/route.ts
//
// STEP21-1 — 신규 파일. 검토가 끝난(needs_manual_review=false) + 종료된
// (case_status=closed) case_knowledge 행을 게시한다(is_published=true).
// 검토 전이거나 진행 중(ongoing)인 사건은 게시할 수 없다(reviewWorkflow.ts,
// DB CHECK 제약 이중 방어).

import { NextRequest, NextResponse } from "next/server";
import { createAdminReadOnlyClient } from "@/lib/adminAuth/readOnlyClient";
import { verifyAdminUser } from "@/lib/adminAuth/verifyAdminUser";
import { publishCaseKnowledge } from "@/lib/caseKnowledge/reviewWorkflow";

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
    const result = await publishCaseKnowledge(id, adminUser.name || adminUser.email || adminUser.id);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      id: result.row.id,
      isPublished: result.row.is_published,
      publishedBy: result.row.published_by,
      publishedAt: result.row.published_at,
    });
  } catch (err) {
    console.error("case-knowledge/[id]/publish route error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
