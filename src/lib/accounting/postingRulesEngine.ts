import type { SupabaseClient } from "@supabase/supabase-js";

export type LedgerEntryEnriched = {
  id: string;
  org_id: string;
  txn_id: string;
  period_key: string;
  entry_date: string;
  account_code: string;
  debit: number;
  credit: number;
  posting_rule_id: string | null;
  uses_unverified_accounting_basis: boolean;
  fx_conversion_unverified: boolean;
};

export async function listLedgerEntriesEnriched(
  client: SupabaseClient,
  orgId: string,
  txnId?: string
): Promise<{ ok: true; items: LedgerEntryEnriched[] } | { ok: false; error: string }> {
  let q = client
    .from("accounting_ledger_entries_enriched")
    .select(
      "id, org_id, txn_id, period_key, entry_date, account_code, debit, credit, posting_rule_id, uses_unverified_accounting_basis, fx_conversion_unverified"
    )
    .eq("org_id", orgId);
  if (txnId) q = q.eq("txn_id", txnId);
  const { data, error } = await q.order("entry_date", { ascending: false });
  if (error) return { ok: false, error: "LEDGER_LIST_FAILED" };
  return { ok: true, items: (data ?? []) as LedgerEntryEnriched[] };
}
