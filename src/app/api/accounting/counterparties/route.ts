import { NextRequest, NextResponse } from "next/server";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";
import { listCounterparties } from "@/lib/accounting/transactionEntry";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const result = await listCounterparties(session.client, session.token);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ items: result.items });
}
