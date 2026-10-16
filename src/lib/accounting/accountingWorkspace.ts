import type { SupabaseClient } from "@supabase/supabase-js";
import { ACCOUNTING_ROUTES } from "./accountingNav";
import { resolveAccountingOrgMembershipState } from "./orgMembership";

/** 승인된 조직이 있어야 열 수 있는 작업공간 화면 */
export const ACCOUNTING_WORKSPACE_DATA_PREFIXES = [
  ACCOUNTING_ROUTES.transactions,
  ACCOUNTING_ROUTES.ledger,
  ACCOUNTING_ROUTES.tax,
  ACCOUNTING_ROUTES.filing,
  ACCOUNTING_ROUTES.evidence,
] as const;

export function isAccountingWorkspaceDataPath(pathname: string): boolean {
  return ACCOUNTING_WORKSPACE_DATA_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function isAccountingOnboardingPath(pathname: string): boolean {
  return pathname === ACCOUNTING_ROUTES.company || pathname.startsWith(`${ACCOUNTING_ROUTES.company}/`);
}

export function isAccountingPendingPath(pathname: string): boolean {
  return pathname === ACCOUNTING_ROUTES.pending;
}

export async function hasAccountingCompanySignupProfile(
  client: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await client
    .from("accounting_company_signup_profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return false;
  return Boolean(data?.user_id);
}

export type AccountingWorkspaceDestination =
  | { kind: "sign_in" }
  | { kind: "onboarding" }
  | { kind: "pending" }
  | { kind: "workspace"; href: string }
  | { kind: "prospective_guide" };

export async function resolveAccountingWorkspaceDestination(
  client: SupabaseClient,
  userId: string,
  memberType: string | null | undefined,
): Promise<AccountingWorkspaceDestination> {
  if (memberType !== "company") return { kind: "sign_in" };

  const membership = await resolveAccountingOrgMembershipState(client, userId);
  if (membership.kind === "approved") {
    return { kind: "workspace", href: ACCOUNTING_ROUTES.transactions };
  }
  if (membership.kind === "pending") {
    return { kind: "pending" };
  }

  const hasProfile = await hasAccountingCompanySignupProfile(client, userId);
  if (!hasProfile) return { kind: "onboarding" };

  const { data: profile } = await client
    .from("accounting_company_signup_profiles")
    .select("company_category")
    .eq("user_id", userId)
    .maybeSingle();
  if (profile?.company_category === "prospective") {
    return { kind: "prospective_guide" };
  }

  return { kind: "pending" };
}
