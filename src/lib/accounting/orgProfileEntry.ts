import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveAccountingActor } from "./accountingActor";
import type { OrgDocumentKind } from "./orgDocumentEntry";

export type OrgProfileDocumentRow = {
  id: string;
  docKind: OrgDocumentKind;
  uploadedAt: string;
};

export type OrgProfilePayload = {
  nameOfficial: string;
  nameKoDisplay: string | null;
  taxCode: string;
  fiscalYearStart: string;
  vatPeriod: "month" | "quarter";
  approvalStatus: string;
  documents: OrgProfileDocumentRow[];
};

export async function getOrgProfileForOwner(client: SupabaseClient, accessToken: string) {
  const actor = await resolveAccountingActor(client, accessToken);
  if (!actor.ok) return { ok: false as const, status: actor.status, error: actor.error };
  if (actor.role !== "company_owner") {
    return { ok: false as const, status: 403, error: "FORBIDDEN" };
  }

  const { data: org, error: orgErr } = await client
    .from("accounting_organizations")
    .select(
      "name_official, name_ko_display, tax_code, fiscal_year_start, vat_period, approval_status"
    )
    .eq("id", actor.orgId)
    .maybeSingle();
  if (orgErr || !org) return { ok: false as const, status: 404, error: "NOT_FOUND" };
  if (org.approval_status !== "approved") {
    return { ok: false as const, status: 403, error: "ORG_NOT_APPROVED" };
  }

  const { data: docs, error: docErr } = await client
    .from("accounting_org_documents")
    .select("id, doc_kind, uploaded_at")
    .eq("org_id", actor.orgId)
    .order("uploaded_at", { ascending: false });
  if (docErr) return { ok: false as const, status: 400, error: "LIST_FAILED" };

  const profile: OrgProfilePayload = {
    nameOfficial: org.name_official as string,
    nameKoDisplay: (org.name_ko_display as string | null) ?? null,
    taxCode: org.tax_code as string,
    fiscalYearStart: org.fiscal_year_start as string,
    vatPeriod: ((org.vat_period as string) === "quarter" ? "quarter" : "month") as "month" | "quarter",
    approvalStatus: org.approval_status as string,
    documents: (docs ?? []).map((row) => ({
      id: row.id as string,
      docKind: row.doc_kind as OrgDocumentKind,
      uploadedAt: row.uploaded_at as string,
    })),
  };

  return { ok: true as const, orgId: actor.orgId, profile };
}
