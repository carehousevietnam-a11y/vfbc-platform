import { NextRequest, NextResponse } from "next/server";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";
import { listLedgerEntries } from "@/lib/accounting/ledgerEntry";

export const dynamic = "force-dynamic";

function queryValue(req: NextRequest, key: string): string {
  return req.nextUrl.searchParams.get(key)?.trim() ?? "";
}

function parsePage(raw: string): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

function parsePageSize(raw: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 25;
  return Math.min(100, Math.floor(n));
}

export async function GET(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const localeRaw = queryValue(req, "locale");
  const locale = localeRaw === "vi" ? "vi" : "ko";
  const result = await listLedgerEntries(session.client, session.token, locale, {
    period: queryValue(req, "period"),
    dateFrom: queryValue(req, "dateFrom"),
    dateTo: queryValue(req, "dateTo"),
    accountCode: queryValue(req, "accountCode"),
    counterpartyId: queryValue(req, "counterpartyId"),
    q: queryValue(req, "q"),
    page: parsePage(queryValue(req, "page")),
    pageSize: parsePageSize(queryValue(req, "pageSize")),
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result);
}
