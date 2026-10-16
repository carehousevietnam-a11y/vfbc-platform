import { NextRequest, NextResponse } from "next/server";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";
import { applyTransactionCommand, listTransactions } from "@/lib/accounting/transactionEntry";

export const dynamic = "force-dynamic";

function queryValue(req: NextRequest, key: string): string {
  return req.nextUrl.searchParams.get(key)?.trim() ?? "";
}

export async function GET(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const result = await listTransactions(session.client, session.token, {
    period: queryValue(req, "period"),
    type: queryValue(req, "type"),
    status: queryValue(req, "status"),
    evidence: req.nextUrl.searchParams.has("evidence") ? (req.nextUrl.searchParams.get("evidence") ?? "") : null,
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ role: result.role, items: result.items, total: result.total });
}

export async function POST(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "VALIDATION" }, { status: 422 });
  }
  const result = await applyTransactionCommand(session.client, session.token, body, null);
  if (!result.ok) {
    return NextResponse.json({ error: result.error, checks: result.checks ?? [] }, { status: result.status });
  }
  return NextResponse.json(result);
}
