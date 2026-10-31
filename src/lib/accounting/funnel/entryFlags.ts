import { accountingFunnelEntryReleaseFlag } from "./entryReleaseFlags";
import { loadAccountingFunnelPackBundle } from "./loadContentPacks";
import { isAccountingPackSlotEmpty, validateAccountingEntryContentPack } from "./validateContentPack";
import type { AccountingFunnelEntryId } from "./types";
import { ACCOUNTING_FUNNEL_ENTRY_IDS } from "./types";

export function isAccountingFunnelEntryEnabled(entryId: AccountingFunnelEntryId): boolean {
  if (!accountingFunnelEntryReleaseFlag(entryId)) return false;
  const pack = loadAccountingFunnelPackBundle()[entryId];
  if (isAccountingPackSlotEmpty(pack)) return false;
  return validateAccountingEntryContentPack(pack).ok;
}

export function accountingFunnelEntryFlags(): Record<AccountingFunnelEntryId, boolean> {
  const flags = {} as Record<AccountingFunnelEntryId, boolean>;
  for (const id of ACCOUNTING_FUNNEL_ENTRY_IDS) {
    flags[id] = isAccountingFunnelEntryEnabled(id);
  }
  return flags;
}
