import { NextRequest, NextResponse } from "next/server";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";
import { applyTransactionCommand, getTransaction } from "@/lib/accounting/transactionEntry";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const { id } = await context.params;
  const result = await getTransaction(session.client, session.token, id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ role: result.role, item: result.item, checks: result.checks });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const { id } = await context.params;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "VALIDATION" }, { status: 422 });
  }
  const result = await applyTransactionCommand(session.client, session.token, body, id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error, checks: result.checks ?? [] }, { status: result.status });
  }
  return NextResponse.json(result);
}
