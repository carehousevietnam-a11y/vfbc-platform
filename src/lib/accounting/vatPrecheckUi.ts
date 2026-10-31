/** Step ⑤ precheck UI — warn when the declaration period has no transactions (cancelled excluded). */
export function vatPrecheckNeedsNoTxnWarning(periodTxnCount: number): boolean {
  return periodTxnCount <= 0;
}

export type VatPrecheckStep5View = "loading" | "green_none" | "items" | "no_txn_only";

/** Pure view state for step ⑤ list (loading must not flash green). */
export function vatPrecheckStep5ViewState(
  loading: boolean,
  periodTxnCount: number | null,
  precheckItemCount: number,
): VatPrecheckStep5View {
  if (loading || periodTxnCount === null) return "loading";
  if (precheckItemCount > 0) return "items";
  if (vatPrecheckNeedsNoTxnWarning(periodTxnCount)) return "no_txn_only";
  return "green_none";
}

export function vatPrecheckShowNoTxnBanner(loading: boolean, periodTxnCount: number | null): boolean {
  if (loading || periodTxnCount === null) return false;
  return vatPrecheckNeedsNoTxnWarning(periodTxnCount);
}

/** Declaration status codes stored on accounting_declarations — keep in sync with uiCatalog decl.status keys. */
export const VAT_DECLARATION_STATUS_CODES = [
  "not_started",
  "drafting",
  "expert_review",
  "ready",
  "filed_manual",
  "amended",
] as const;

export type VatDeclarationStatusCode = (typeof VAT_DECLARATION_STATUS_CODES)[number];

export function vatDeclarationStatusMessageKey(status: string): `accounting.decl.status.${string}` {
  return `accounting.decl.status.${status}`;
}

/** True if label would expose raw user id (legacy 8-char uuid prefix fallback). */
export function isRawUserIdAuthorLabel(label: string): boolean {
  return /^[0-9a-f]{8}$/i.test(label.trim());
}

export const VAT_AUTHOR_ROLE_CODES = [
  "company_owner",
  "company_member",
  "vnk_expert",
  "vnk_admin",
] as const;

export type VatAuthorRoleCode = (typeof VAT_AUTHOR_ROLE_CODES)[number];

export function vatAuthorRoleMessageKey(role: string): `accounting.vat.author.role.${string}` {
  return `accounting.vat.author.role.${role}`;
}
