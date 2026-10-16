export type AccountingNavKey =
  | "home"
  | "transactions"
  | "ledger"
  | "tax"
  | "filing"
  | "evidence"
  | "company"
  | "more";

export const ACCOUNTING_ROUTES: Record<AccountingNavKey, string> = {
  home: "/company/accounting",
  transactions: "/company/accounting/transactions",
  ledger: "/company/accounting/ledger",
  tax: "/company/accounting/vat",
  filing: "/company/accounting/filing-results",
  evidence: "/company/accounting/evidence",
  company: "/company/accounting/company",
  more: "/company/accounting/more",
};

export function navKeyFromPath(pathname: string): AccountingNavKey {
  if (pathname === ACCOUNTING_ROUTES.home || pathname === `${ACCOUNTING_ROUTES.home}/`) return "home";
  if (pathname.startsWith(ACCOUNTING_ROUTES.transactions)) return "transactions";
  if (pathname.startsWith(ACCOUNTING_ROUTES.ledger)) return "ledger";
  if (pathname.startsWith(ACCOUNTING_ROUTES.tax)) return "tax";
  if (pathname.startsWith(ACCOUNTING_ROUTES.filing)) return "filing";
  if (pathname.startsWith(ACCOUNTING_ROUTES.evidence)) return "evidence";
  if (pathname.startsWith(ACCOUNTING_ROUTES.company)) return "company";
  if (pathname.startsWith(ACCOUNTING_ROUTES.more)) return "more";
  return "home";
}

export function canViewDeclarationHome(role: string): boolean {
  return role === "company_owner" || role === "vnk_expert" || role === "vnk_admin";
}
