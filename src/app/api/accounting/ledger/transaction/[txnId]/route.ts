import { NextRequest, NextResponse } from "next/server";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";
import { getLedgerTransactionDetail } from "@/lib/accounting/ledgerEntry";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ txnId: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const localeRaw = req.nextUrl.searchParams.get("locale")?.trim() ?? "";
  const locale = localeRaw === "vi" ? "vi" : "ko";
  const { txnId } = await context.params;
  const result = await getLedgerTransactionDetail(session.client, session.token, locale, txnId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result);
}
