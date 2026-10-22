import { NextRequest, NextResponse } from "next/server";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";
import { resolveOwnerReviewComment } from "@/lib/accounting/expertReviewQueue";

export async function POST(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const body = (await req.json()) as { commentId?: string };
  if (!body.commentId) return NextResponse.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
  const result = await resolveOwnerReviewComment(session.client, session.token, body.commentId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true });
}
