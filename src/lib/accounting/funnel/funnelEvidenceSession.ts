/** sessionStorage keys for pre-signup funnel evidence handoff at company signup. */
export const ACCOUNTING_FUNNEL_EVIDENCE_SESSION = {
  entryId: "accountingFunnelEntryId",
  storagePath: "accountingFunnelStoragePath",
} as const;

export function persistAccountingFunnelEvidenceSession(entryId: string, storagePath: string): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(ACCOUNTING_FUNNEL_EVIDENCE_SESSION.entryId, entryId);
  sessionStorage.setItem(ACCOUNTING_FUNNEL_EVIDENCE_SESSION.storagePath, storagePath);
}

export function readAccountingFunnelEvidenceSession(): {
  accountingFunnelEntryId: string;
  accountingFunnelStoragePath: string;
} | null {
  if (typeof sessionStorage === "undefined") return null;
  const entryId = sessionStorage.getItem(ACCOUNTING_FUNNEL_EVIDENCE_SESSION.entryId)?.trim() ?? "";
  const storagePath = sessionStorage.getItem(ACCOUNTING_FUNNEL_EVIDENCE_SESSION.storagePath)?.trim() ?? "";
  if (!entryId || !storagePath) return null;
  return { accountingFunnelEntryId: entryId, accountingFunnelStoragePath: storagePath };
}

export function clearAccountingFunnelEvidenceSession(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(ACCOUNTING_FUNNEL_EVIDENCE_SESSION.entryId);
  sessionStorage.removeItem(ACCOUNTING_FUNNEL_EVIDENCE_SESSION.storagePath);
}
