import { NextRequest, NextResponse } from "next/server";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";
import {
  approveCorrection,
  confirmViText,
  getTransactionExtras,
  rejectCorrection,
  requestCorrection,
} from "@/lib/accounting/correctionEntry";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const txnId = req.nextUrl.searchParams.get("txnId")?.trim() ?? "";
  if (!UUID.test(txnId)) return NextResponse.json({ error: "VALIDATION" }, { status: 422 });
  const result = await getTransactionExtras(session.client, session.token, txnId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "VALIDATION" }, { status: 422 });
  const lang = body.lang === "vi" ? "vi" : "ko";
  const id = (key: string) => (typeof body[key] === "string" && UUID.test(body[key] as string) ? (body[key] as string) : "");

  if (body.action === "request") {
    const txnId = id("txnId");
    if (!txnId) return NextResponse.json({ error: "VALIDATION" }, { status: 422 });
    const result = await requestCorrection(session.client, session.token, {
      txnId,
      amountVnd: Number(body.amountVnd),
      text: typeof body.text === "string" ? body.text : "",
      lang,
    });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json(result);
  }
  if (body.action === "approve") {
    const commentId = id("commentId");
    if (!commentId) return NextResponse.json({ error: "VALIDATION" }, { status: 422 });
    const result = await approveCorrection(session.client, commentId);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json(result);
  }
  if (body.action === "reject") {
    const commentId = id("commentId");
    if (!commentId) return NextResponse.json({ error: "VALIDATION" }, { status: 422 });
    const result = await rejectCorrection(
      session.client,
      commentId,
      typeof body.reason === "string" ? body.reason : "",
      lang
    );
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json(result);
  }
  if (body.action === "confirm_vi") {
    const txnId = id("txnId");
    const field = body.field === "description" ? "description" : "memo";
    if (!txnId) return NextResponse.json({ error: "VALIDATION" }, { status: 422 });
    const result = await confirmViText(session.client, txnId, field);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json(result);
  }
  return NextResponse.json({ error: "VALIDATION" }, { status: 422 });
}
