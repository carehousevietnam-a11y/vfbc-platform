/** Step ⑤ precheck UI — when to show "no transactions" warning vs green "no check items". */
export function vatPrecheckNeedsNoTxnWarning(
  confirmedTxnCount: number,
  computed: Record<string, { value?: string; txn_ids?: string[] }>,
): boolean {
  if (confirmedTxnCount <= 0) return true;
  const hasComputedSignal = Object.values(computed).some((cell) => {
    const ids = cell.txn_ids?.length ?? 0;
    if (ids > 0) return true;
    const v = cell.value?.trim();
    return v !== undefined && v !== "" && v !== "0";
  });
  return !hasComputedSignal;
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
