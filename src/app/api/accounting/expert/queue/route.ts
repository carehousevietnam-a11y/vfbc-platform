import { NextRequest, NextResponse } from "next/server";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";
import { denyNonExpertQueueAccess, listExpertReviewQueue } from "@/lib/accounting/expertReviewQueue";

export async function GET(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const gate = await denyNonExpertQueueAccess(session.client, session.token);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  if (gate.denied) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const result = await listExpertReviewQueue(session.client, session.token);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ items: result.items });
}
