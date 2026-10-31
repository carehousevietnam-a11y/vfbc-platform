import { NextRequest, NextResponse } from "next/server";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";
import { getOrgProfileForOwner } from "@/lib/accounting/orgProfileEntry";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const result = await getOrgProfileForOwner(session.client, session.token);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ orgId: result.orgId, profile: result.profile });
}
