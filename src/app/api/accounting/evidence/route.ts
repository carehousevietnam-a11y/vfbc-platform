import { NextRequest, NextResponse } from "next/server";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  createEvidenceSignedUrl,
  listEvidenceForTxn,
  uploadEvidence,
} from "@/lib/accounting/evidenceEntry";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const evidenceId = req.nextUrl.searchParams.get("id")?.trim() ?? "";
  const txnId = req.nextUrl.searchParams.get("txnId")?.trim() ?? "";

  if (evidenceId) {
    const result = await createEvidenceSignedUrl(
      session.client,
      supabaseAdmin,
      session.token,
      evidenceId
    );
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ url: result.url });
  }

  if (txnId) {
    const result = await listEvidenceForTxn(session.client, session.token, txnId);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ items: result.items });
  }

  return NextResponse.json({ error: "VALIDATION" }, { status: 422 });
}

export async function POST(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "VALIDATION" }, { status: 422 });

  const txnId = String(form.get("txnId") ?? "").trim();
  const spoofOrgId = String(form.get("orgId") ?? form.get("org_id") ?? "").trim() || null;
  const displayName = String(form.get("displayName") ?? form.get("fileName") ?? "").trim() || null;
  const file = form.get("file");
  if (!txnId || !(file instanceof File)) {
    return NextResponse.json({ error: "VALIDATION" }, { status: 422 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadEvidence(
    session.client,
    supabaseAdmin,
    session.token,
    txnId,
    buffer,
    file.type || null,
    displayName,
    spoofOrgId
  );
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ id: result.id, sha256: result.sha256 });
}
