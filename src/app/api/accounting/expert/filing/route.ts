import { NextRequest, NextResponse } from "next/server";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";
import { denyNonExpertQueueAccess, recordExpertManualFiling } from "@/lib/accounting/expertReviewQueue";

export async function POST(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const gate = await denyNonExpertQueueAccess(session.client, session.token);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  if (gate.denied) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const body = (await req.json()) as {
    declarationId?: string;
    portalFormBasis?: "TT89" | "TT80";
    filedAt?: string;
    filingReceiptPath?: string;
    warningsAcknowledged?: boolean;
  };
  if (!body.declarationId || !body.filedAt || !body.filingReceiptPath) {
    return NextResponse.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
  }
  const result = await recordExpertManualFiling(session.client, session.token, {
    declarationId: body.declarationId,
    portalFormBasis: body.portalFormBasis ?? "TT89",
    filedAt: body.filedAt,
    filingReceiptPath: body.filingReceiptPath,
    warningsAcknowledged: body.warningsAcknowledged,
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true });
}
