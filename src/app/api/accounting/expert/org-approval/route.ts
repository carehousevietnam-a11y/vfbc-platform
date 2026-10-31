import { NextRequest, NextResponse } from "next/server";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";
import { denyNonExpertQueueAccess, resolveOrgApproval } from "@/lib/accounting/expertReviewQueue";

export async function POST(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const gate = await denyNonExpertQueueAccess(session.client, session.token);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  if (gate.denied) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const body = (await req.json()) as {
    orgId?: string;
    action?: "approve" | "reject";
    rejectReason?: string;
    lang?: "ko" | "vi";
  };
  if (!body.orgId || !body.action) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const result = await resolveOrgApproval(session.client, session.token, {
    orgId: body.orgId,
    action: body.action,
    rejectReason: body.rejectReason,
    lang: body.lang,
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ approvalStatus: result.approvalStatus });
}
