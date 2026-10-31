/**
 * Canonical org/membership actor resolution for accounting (P2-b).
 * Next/API routes should import from here after P2 cleanup.
 * Node harness (`tests/accounting/*.mjs`) cannot resolve nested relative imports;
 * `transactionEntry.ts` and `evidenceEntry.ts` mirror this logic until import wiring.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export type AccountingActor = { userId: string; orgId: string; role: string };

async function loadActorCore(
  client: SupabaseClient,
  accessToken: string
): Promise<AccountingActor | { error: string; status: number }> {
  const { data: userData, error: userError } = await client.auth.getUser(accessToken);
  if (userError || !userData.user) return { error: "UNAUTHENTICATED", status: 401 };
  const userId = userData.user.id;
  const { data: memberships, error: memberError } = await client
    .from("accounting_org_members")
    .select("org_id, role")
    .eq("user_id", userId);
  if (memberError) return { error: "MEMBERSHIP_LOOKUP", status: 400 };
  const rows = memberships ?? [];
  if (rows.length === 0) return { error: "NO_ORG", status: 403 };
  const { data: orgs, error: orgError } = await client
    .from("accounting_organizations")
    .select("id, approval_status")
    .in(
      "id",
      rows.map((row) => row.org_id as string)
    );
  if (orgError) return { error: "ORG_LOOKUP", status: 400 };
  const approved = (orgs ?? []).filter((org) => org.approval_status === "approved");
  if (approved.length === 0) {
    const pending = (orgs ?? []).some((org) => org.approval_status === "pending");
    if (pending) return { error: "ORG_NOT_APPROVED", status: 403 };
    const rejected = (orgs ?? []).some((org) => org.approval_status === "rejected");
    if (rejected) return { error: "ORG_REJECTED", status: 403 };
    return { error: "ORG_NOT_APPROVED", status: 403 };
  }
  if (approved.length > 1) return { error: "ORG_AMBIGUOUS", status: 409 };
  const orgId = approved[0].id as string;
  const role = rows.find((row) => row.org_id === orgId)?.role as string | undefined;
  if (!role) return { error: "NO_ORG", status: 403 };
  return { userId, orgId, role };
}

function isActor(value: AccountingActor | { error: string; status: number }): value is AccountingActor {
  return "userId" in value;
}

export async function resolveAccountingActor(
  client: SupabaseClient,
  accessToken: string
): Promise<
  { ok: true; userId: string; orgId: string; role: string } | { ok: false; status: number; error: string }
> {
  const actor = await loadActorCore(client, accessToken);
  if (!isActor(actor)) return { ok: false, status: actor.status, error: actor.error };
  return { ok: true, userId: actor.userId, orgId: actor.orgId, role: actor.role };
}
