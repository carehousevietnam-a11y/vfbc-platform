import { NextRequest, NextResponse } from "next/server";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";
import { insertExpertAdjustment, requestExpertReview } from "@/lib/accounting/vatDeclarationEntry";

export async function POST(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const body = (await req.json()) as {
    action?: "expert_review" | "adjustment";
    declarationId?: string;
    fieldCode?: string;
    amount?: string;
    reasonCode?: string;
    expertNote?: string;
  };

  if (body.action === "adjustment") {
    if (!body.declarationId || !body.fieldCode || !body.amount || !body.reasonCode) {
      return NextResponse.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
    }
    const result = await insertExpertAdjustment(session.client, session.token, {
      declarationId: body.declarationId,
      fieldCode: body.fieldCode,
      amount: body.amount,
      reasonCode: body.reasonCode,
      expertNote: body.expertNote,
    });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ ok: true });
  }

  if (!body.declarationId) {
    return NextResponse.json({ error: "DECLARATION_REQUIRED" }, { status: 400 });
  }
  const result = await requestExpertReview(session.client, session.token, body.declarationId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result);
}
