import { NextRequest, NextResponse } from "next/server";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  createOrgDocumentSignedUrl,
  listOrgDocuments,
  uploadOrgDocument,
  type OrgDocumentKind,
} from "@/lib/accounting/orgDocumentEntry";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const documentId = req.nextUrl.searchParams.get("id")?.trim() ?? "";
  if (documentId) {
    const result = await createOrgDocumentSignedUrl(
      session.client,
      supabaseAdmin,
      session.token,
      documentId,
    );
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ url: result.url });
  }

  const langParam = req.nextUrl.searchParams.get("lang");
  const lang = langParam === "vi" ? "vi" : "ko";
  const result = await listOrgDocuments(session.client, session.token, lang);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "VALIDATION" }, { status: 422 });

  const docKind = String(form.get("docKind") ?? "").trim() as OrgDocumentKind;
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "VALIDATION" }, { status: 422 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadOrgDocument(
    session.client,
    supabaseAdmin,
    session.token,
    docKind,
    buffer,
    file.type || null,
  );
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ id: result.id, sha256: result.sha256 });
}
