import { NextRequest, NextResponse } from "next/server";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";
import {
  createCompanyOwnerReviewComment,
  listCompanyDeclarationReviewComments,
} from "@/lib/accounting/expertReviewQueue";

export async function GET(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const declarationId = req.nextUrl.searchParams.get("declarationId") ?? "";
  if (!declarationId) return NextResponse.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
  const result = await listCompanyDeclarationReviewComments(session.client, session.token, declarationId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const body = (await req.json()) as {
    declarationId?: string;
    kind?: "comment" | "correction_request";
    text?: string;
    lang?: "ko" | "vi";
  };
  if (!body.declarationId || !body.text || !body.kind) {
    return NextResponse.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
  }
  const result = await createCompanyOwnerReviewComment(session.client, session.token, {
    declarationId: body.declarationId,
    kind: body.kind,
    body: body.text,
    lang: body.lang === "vi" ? "vi" : "ko",
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true, commentId: result.commentId });
}
