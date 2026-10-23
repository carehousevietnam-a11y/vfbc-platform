import { NextRequest, NextResponse } from "next/server";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { exportLedgerExcel, signLedgerExportUrl, type LedgerExportFilters } from "@/lib/accounting/ledgerExport";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") return NextResponse.json({ error: "VALIDATION" }, { status: 422 });

  const counterpartyId = str(body.counterpartyId);
  if (counterpartyId && !UUID.test(counterpartyId)) {
    return NextResponse.json({ error: "VALIDATION" }, { status: 422 });
  }
  const filters: LedgerExportFilters = {
    period: str(body.period),
    dateFrom: str(body.dateFrom),
    dateTo: str(body.dateTo),
    accountCode: str(body.accountCode),
    counterpartyId,
    q: str(body.q),
  };

  const result = await exportLedgerExcel(
    session.client,
    supabaseAdmin,
    session.token,
    filters,
    body.preview === true
  );
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id")?.trim() ?? "";
  if (!UUID.test(id)) return NextResponse.json({ error: "VALIDATION" }, { status: 422 });
  const result = await signLedgerExportUrl(session.client, supabaseAdmin, session.token, id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ url: result.url });
}
