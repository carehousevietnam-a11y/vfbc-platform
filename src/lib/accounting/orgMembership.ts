import type { SupabaseClient } from "@supabase/supabase-js";

export type AccountingOrgMembershipState =
  | { kind: "none" }
  | { kind: "pending"; orgId: string; role: string }
  | { kind: "approved"; orgId: string; role: string };

export async function resolveAccountingOrgMembershipState(
  client: SupabaseClient,
  userId: string,
): Promise<AccountingOrgMembershipState> {
  const { data: memberships, error: memberError } = await client
    .from("accounting_org_members")
    .select("org_id, role")
    .eq("user_id", userId);
  if (memberError || !memberships?.length) return { kind: "none" };

  const orgIds = memberships.map((m) => m.org_id as string);
  const { data: orgs, error: orgError } = await client
    .from("accounting_organizations")
    .select("id, approval_status")
    .in("id", orgIds);
  if (orgError || !orgs?.length) return { kind: "none" };

  const approved = orgs.find((o) => o.approval_status === "approved");
  if (approved) {
    const role = memberships.find((m) => m.org_id === approved.id)?.role as string;
    return { kind: "approved", orgId: approved.id as string, role };
  }

  const pending = orgs.find((o) => o.approval_status === "pending");
  if (pending) {
    const role = memberships.find((m) => m.org_id === pending.id)?.role as string;
    return { kind: "pending", orgId: pending.id as string, role };
  }

  return { kind: "none" };
}
