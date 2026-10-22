import type { SupabaseClient } from "@supabase/supabase-js";
import { confirmViText } from "./correctionEntry";
import { resolveAccountingActor } from "./accountingActor";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FIELDS = new Set(["memo", "description"]);

export type ConfirmViI18nInput = {
  entityType: string;
  entityId: string;
  field: string;
};

async function assertMayConfirmVi(
  client: SupabaseClient,
  orgId: string,
  role: string,
  userId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (role === "vnk_expert") return { ok: true };
  if (role !== "company_member") return { ok: false, error: "VI_CONFIRM_FORBIDDEN" };
  const { data: profile } = await client
    .from("accounting_profiles")
    .select("locale")
    .eq("user_id", userId)
    .maybeSingle();
  if (profile?.locale !== "vi") return { ok: false, error: "VI_CONFIRM_FORBIDDEN" };
  return { ok: true };
}

/** Shared by server action and harness tests (no UI). */
export async function confirmAccountingViI18nText(
  client: SupabaseClient,
  accessToken: string,
  input: ConfirmViI18nInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!UUID.test(input.entityId)) return { ok: false, error: "VALIDATION" };
  if (input.entityType !== "transaction" || !FIELDS.has(input.field)) {
    return { ok: false, error: "VALIDATION" };
  }

  const actor = await resolveAccountingActor(client, accessToken);
  if (!actor.ok) return { ok: false, error: actor.error };

  const gate = await assertMayConfirmVi(client, actor.orgId, actor.role, actor.userId);
  if (!gate.ok) return gate;

  const { data: txn } = await client
    .from("accounting_transactions")
    .select("id, org_id")
    .eq("id", input.entityId)
    .eq("org_id", actor.orgId)
    .maybeSingle();
  if (!txn) return { ok: false, error: "NOT_FOUND" };

  const { data: viRow } = await client
    .from("accounting_i18n_texts")
    .select("id")
    .eq("org_id", actor.orgId)
    .eq("entity_type", input.entityType)
    .eq("entity_id", input.entityId)
    .eq("field", input.field)
    .eq("lang", "vi")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!viRow) return { ok: false, error: "NOT_FOUND" };

  return confirmViText(client, input.entityId, input.field);
}
