import type { AccountingFunnelEntryId } from "./types";
import { ACCOUNTING_FUNNEL_ENTRY_IDS } from "./types";

/** 진입점별 기능 플래그 — Content Pack·검수 승인 후에만 true 로 바꿉니다. */
export const ACCOUNTING_FUNNEL_ENTRY_RELEASE: Record<AccountingFunnelEntryId, boolean> = {
  vat_filing_check: false,
  invoice_processing_check: false,
  corp_tax_closing_check: false,
};

export function accountingFunnelEntryReleaseFlag(entryId: AccountingFunnelEntryId): boolean {
  return ACCOUNTING_FUNNEL_ENTRY_RELEASE[entryId] === true;
}

export function allAccountingFunnelReleaseFlags(): Record<AccountingFunnelEntryId, boolean> {
  const out = {} as Record<AccountingFunnelEntryId, boolean>;
  for (const id of ACCOUNTING_FUNNEL_ENTRY_IDS) {
    out[id] = accountingFunnelEntryReleaseFlag(id);
  }
  return out;
}
