import { NextRequest, NextResponse } from "next/server";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";
import { requestOrgApprovalReview } from "@/lib/accounting/orgDocumentEntry";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const result = await requestOrgApprovalReview(session.client, session.token);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ approvalStatus: result.approvalStatus });
}
