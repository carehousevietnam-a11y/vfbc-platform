import { NextRequest, NextResponse } from "next/server";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";
import { denyNonExpertQueueAccess, getExpertDeclarationDetail } from "@/lib/accounting/expertReviewQueue";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const gate = await denyNonExpertQueueAccess(session.client, session.token);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  if (gate.denied) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const { id } = await ctx.params;
  const result = await getExpertDeclarationDetail(session.client, session.token, id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result);
}
