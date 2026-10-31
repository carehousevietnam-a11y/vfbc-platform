import type { SupabaseClient } from "@supabase/supabase-js";
import { isPreSignupDocumentsObjectPath } from "@/lib/security/preSignupDocumentRetention";

export type AccountingFunnelEvidenceHandoff = {
  entryId: string;
  storagePath: string;
};

export function parseAccountingFunnelEvidenceHandoff(
  body: Record<string, unknown>,
): AccountingFunnelEvidenceHandoff | null {
  const entryId = typeof body.accountingFunnelEntryId === "string" ? body.accountingFunnelEntryId.trim() : "";
  const storagePath =
    typeof body.accountingFunnelStoragePath === "string" ? body.accountingFunnelStoragePath.trim() : "";
  if (!entryId || !storagePath) return null;
  if (!isPreSignupDocumentsObjectPath(storagePath)) return null;
  if (!storagePath.startsWith(`verify-accounting-funnel/${entryId}/`)) return null;
  return { entryId, storagePath };
}

/** 가입 완료 후 퍼널 첨부를 lead·user_id에 연결( purge 시 signed-up 제외 ). */
export async function linkAccountingFunnelEvidenceOnSignup(
  admin: SupabaseClient,
  userId: string,
  handoff: AccountingFunnelEvidenceHandoff,
): Promise<void> {
  const leadId = crypto.randomUUID();
  const { error: leadError } = await admin.from("leads").insert({
    id: leadId,
    name: "기업회원 퍼널 첨부",
    phone: "0000000000",
    service_type: "accounting_funnel",
    source_page: `/verify/accounting/${handoff.entryId}`,
    user_id: userId,
    display_id: `ACCT-FUNNEL-${leadId.slice(0, 8)}`,
  });
  if (leadError) {
    throw new Error(`leads insert: ${leadError.message}`);
  }

  const { error: actError } = await admin.from("crm_activities").insert({
    lead_id: leadId,
    action: "accounting_funnel_evidence",
    tag: "ACCOUNTING_FUNNEL",
    meta: { storagePath: handoff.storagePath },
  });
  if (actError) {
    throw new Error(`crm_activities insert: ${actError.message}`);
  }
}
