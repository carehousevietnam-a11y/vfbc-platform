import { NextRequest, NextResponse } from "next/server";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";
import { createExpertReviewComment, denyNonExpertQueueAccess } from "@/lib/accounting/expertReviewQueue";

export async function POST(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const gate = await denyNonExpertQueueAccess(session.client, session.token);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  if (gate.denied) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const body = (await req.json()) as {
    declarationId?: string;
    kind?: "comment" | "correction_request";
    text?: string;
    lang?: "ko" | "vi";
  };
  const text = (body.text ?? "").trim();
  if (!body.declarationId || !text || !body.kind) {
    return NextResponse.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
  }
  const result = await createExpertReviewComment(session.client, session.token, {
    declarationId: body.declarationId,
    kind: body.kind,
    body: text,
    lang: body.lang === "vi" ? "vi" : "ko",
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true, commentId: result.commentId, comment: result.comment });
}
