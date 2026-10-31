import type { SupabaseClient } from "@supabase/supabase-js";
import type { FormBasisKind, FormBasisPayload } from "./accountingFormBasis";

const LEDGER_LEGAL_BASIS = "Thông tư 99/2025/TT-BTC";

export async function loadFormBasis(
  client: SupabaseClient,
  kind: FormBasisKind
): Promise<FormBasisPayload> {
  if (kind === "ledger_tt99") {
    return {
      kind,
      status: "reference",
      legalBasis: LEDGER_LEGAL_BASIS,
      verifiedAt: null,
    };
  }

  const { data } = await client
    .from("accounting_form_versions")
    .select("status, legal_basis, verified_status, updated_at")
    .eq("form_code", "01/GTGT")
    .eq("portal_form_basis", "TT89")
    .maybeSingle();

  const status = (data?.status as string) ?? "pending_verification";
  const verifiedStatus = (data?.verified_status as string) ?? "unverified";
  const legalBasis = (data?.legal_basis as string | null) ?? "Thông tư 89/2026/TT-BTC";
  let verifiedAt: string | null = null;
  const formVerified = verifiedStatus === "verified" && status === "active";
  if (formVerified && data?.updated_at) {
    verifiedAt = String(data.updated_at).slice(0, 10).replace(/-/g, ".");
  }

  return {
    kind,
    status: formVerified ? "verified" : status,
    legalBasis,
    verifiedAt,
  };
}
