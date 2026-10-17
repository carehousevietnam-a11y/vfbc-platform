export type AccountingNavKey =
  | "home"
  | "transactions"
  | "ledger"
  | "tax"
  | "filing"
  | "evidence"
  | "company"
  | "pending"
  | "more";

/** Approved owner read-only company profile (not onboarding /company). */
export const ACCOUNTING_COMPANY_PROFILE_PATH = "/company/accounting/profile";

export const ACCOUNTING_ROUTES: Record<AccountingNavKey, string> = {
  home: "/company/accounting",
  pending: "/company/accounting/pending",
  transactions: "/company/accounting/transactions",
  ledger: "/company/accounting/ledger",
  tax: "/company/accounting/vat",
  filing: "/company/accounting/filing-results",
  evidence: "/company/accounting/evidence",
  company: "/company/accounting/company",
  more: "/company/accounting/more",
};

export type AccountingCompanyInfoMembership =
  | { kind: "approved"; role: string }
  | { kind: "pending"; role: string }
  | { kind: "none" };

export function accountingCompanyInfoHref(membership: AccountingCompanyInfoMembership): string {
  if (membership.kind === "approved" && membership.role === "company_owner") {
    return ACCOUNTING_COMPANY_PROFILE_PATH;
  }
  return ACCOUNTING_ROUTES.company;
}

export function navKeyFromPath(pathname: string): AccountingNavKey {
  if (pathname === ACCOUNTING_ROUTES.home || pathname === `${ACCOUNTING_ROUTES.home}/`) return "home";
  if (pathname === ACCOUNTING_COMPANY_PROFILE_PATH || pathname.startsWith(`${ACCOUNTING_COMPANY_PROFILE_PATH}/`)) {
    return "company";
  }
  if (pathname.startsWith(ACCOUNTING_ROUTES.transactions)) return "transactions";
  if (pathname.startsWith(ACCOUNTING_ROUTES.ledger)) return "ledger";
  if (pathname.startsWith(ACCOUNTING_ROUTES.tax)) return "tax";
  if (pathname.startsWith(ACCOUNTING_ROUTES.filing)) return "filing";
  if (pathname.startsWith(ACCOUNTING_ROUTES.evidence)) return "evidence";
  if (pathname.startsWith(ACCOUNTING_ROUTES.company)) return "company";
  if (pathname.startsWith(ACCOUNTING_ROUTES.pending)) return "pending";
  if (pathname.startsWith(ACCOUNTING_ROUTES.more)) return "more";
  return "home";
}

export function canViewDeclarationHome(role: string): boolean {
  return role === "company_owner" || role === "vnk_expert" || role === "vnk_admin";
}

/** Placeholder screens — hidden from customer nav until product ships; routes stay for direct URL. */
export const ACCOUNTING_NAV_HIDDEN_PLACEHOLDER: AccountingNavKey[] = ["filing", "evidence"];

export function isAccountingCustomerNavVisible(key: AccountingNavKey): boolean {
  return !ACCOUNTING_NAV_HIDDEN_PLACEHOLDER.includes(key);
}

export const ACCOUNTING_SHELL_DESKTOP_NAV: AccountingNavKey[] = [
  "home",
  "transactions",
  "ledger",
  "tax",
  "company",
];

export const ACCOUNTING_MORE_PAGE_LINKS: AccountingNavKey[] = ["ledger", "company"];

/** Approved workspace: company onboarding is owner-only; members are redirected to transactions. */
export function isAccountingCompanyNavVisibleForRole(role: string | null | undefined): boolean {
  return role !== "company_member";
}

export function accountingShellDesktopNavForRole(role: string | null | undefined): AccountingNavKey[] {
  if (!isAccountingCompanyNavVisibleForRole(role)) {
    return ACCOUNTING_SHELL_DESKTOP_NAV.filter((k) => k !== "company");
  }
  return ACCOUNTING_SHELL_DESKTOP_NAV;
}

export function accountingMorePageLinksForRole(role: string | null | undefined): AccountingNavKey[] {
  if (!isAccountingCompanyNavVisibleForRole(role)) {
    return ACCOUNTING_MORE_PAGE_LINKS.filter((k) => k !== "company");
  }
  return ACCOUNTING_MORE_PAGE_LINKS;
}
