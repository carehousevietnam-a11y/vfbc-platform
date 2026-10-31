import { NextRequest, NextResponse } from "next/server";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";
import { denyNonExpertQueueAccess } from "@/lib/accounting/expertReviewQueue";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const gate = await denyNonExpertQueueAccess(session.client, session.token);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  if (gate.denied) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const orgId = req.nextUrl.searchParams.get("orgId")?.trim() ?? "";
  if (!orgId) return NextResponse.json({ error: "VALIDATION" }, { status: 422 });

  const { data, error } = await session.client
    .from("accounting_org_documents")
    .select("id, doc_kind, uploaded_at")
    .eq("org_id", orgId);
  if (error) return NextResponse.json({ error: "LIST_FAILED" }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}
