import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveAccountingActor } from "./accountingActor";
import { isPeriodBeforeGtgt01Tt89, gtgt01Tt89PeriodGuardMessageKey } from "./gtgt01FormPeriod";
import { runVatGtgt01Draft } from "./vatDeclarationDraft";
import {
  loadDeclarationStepMemos,
  resolveMemberDisplayNames,
} from "./vatWizardEntry";
import { parseVatWizard, declarationWizardLocked } from "./vatWizard";

export type VatFieldMapEntry = {
  code: string;
  label_ko: string;
  label_vi: string;
  column: string;
  kind: string;
  formula?: string;
};

export async function loadVatFormMeta(client: SupabaseClient) {
  const { data } = await client
    .from("accounting_form_versions")
    .select("id, status, field_map, feature_enabled")
    .eq("form_code", "01/GTGT")
    .eq("portal_form_basis", "TT89")
    .maybeSingle();
  if (!data?.feature_enabled) return { ok: false as const, error: "FORM_DISABLED" };
  const raw = data.field_map as { fields?: VatFieldMapEntry[] };
  const fields = Array.isArray(raw?.fields) ? raw.fields : [];
  return {
    ok: true as const,
    formVersionId: data.id as string,
    status: data.status as string,
    fields,
  };
}

export async function getVatDeclaration(
  client: SupabaseClient,
  accessToken: string,
  periodKey: string
) {
  const actor = await resolveAccountingActor(client, accessToken);
  if (!actor.ok) return { ok: false as const, status: actor.status, error: actor.error };

  const { data: org } = await client
    .from("accounting_organizations")
    .select("name_official, tax_code, vat_method, vat_period")
    .eq("id", actor.orgId)
    .single();

  const { data: decl } = await client
    .from("accounting_declarations")
    .select("id, status, computed, due_date, period_key, updated_at")
    .eq("org_id", actor.orgId)
    .eq("form_code", "01/GTGT")
    .eq("period_key", periodKey)
    .maybeSingle();

  const form = await loadVatFormMeta(client);
  if (!form.ok) return { ok: false as const, status: 403, error: form.error };

  const vatPeriod = ((org?.vat_period as string) === "quarter" ? "quarter" : "month") as "month" | "quarter";
  const periodBeforeTt89 = isPeriodBeforeGtgt01Tt89(periodKey, vatPeriod);

  let wizard = null;
  let stepMemos: Record<string, { ko?: string; vi?: string }> = {};
  let displayNames: Record<string, string> = {};
  const wizardLocked = decl ? declarationWizardLocked(decl.status as string) : false;

  if (decl?.id) {
    wizard = parseVatWizard(decl.computed);
    stepMemos = await loadDeclarationStepMemos(client, actor.orgId, decl.id as string);
    const ids = wizard ? Object.values(wizard.steps).map((s) => s.savedBy) : [];
    const nameMap = await resolveMemberDisplayNames(client, ids);
    displayNames = Object.fromEntries(nameMap);
  }

  return {
    ok: true as const,
    orgId: actor.orgId,
    role: actor.role,
    org,
    declaration: decl,
    form,
    wizard,
    stepMemos,
    displayNames,
    wizardLocked,
    periodGuard: periodBeforeTt89
      ? { blocked: true, messageKey: gtgt01Tt89PeriodGuardMessageKey() }
      : { blocked: false },
  };
}

export async function draftVatDeclaration(
  client: SupabaseClient,
  accessToken: string,
  periodKey: string
) {
  const actor = await resolveAccountingActor(client, accessToken);
  if (!actor.ok) return { ok: false as const, status: actor.status, error: actor.error };

  const result = await runVatGtgt01Draft(client, {
    orgId: actor.orgId,
    periodKey,
    actorUserId: actor.userId,
  });
  if (!result.ok) {
    return { ok: false as const, status: 400, error: result.code, messageKey: result.messageKey };
  }
  return { ok: true as const, declarationId: result.declarationId, computed: result.computed };
}

export async function requestExpertReview(
  client: SupabaseClient,
  accessToken: string,
  declarationId: string
) {
  const actor = await resolveAccountingActor(client, accessToken);
  if (!actor.ok) return { ok: false as const, status: actor.status, error: actor.error };
  if (actor.role !== "company_owner") {
    return { ok: false as const, status: 403, error: "OWNER_ONLY" };
  }

  const { data: declRow } = await client
    .from("accounting_declarations")
    .select("period_key")
    .eq("id", declarationId)
    .eq("org_id", actor.orgId)
    .maybeSingle();
  if (!declRow?.period_key) return { ok: false as const, status: 400, error: "NOT_FOUND" };

  const { data: orgRow } = await client
    .from("accounting_organizations")
    .select("vat_period")
    .eq("id", actor.orgId)
    .single();
  const vatPeriod = ((orgRow?.vat_period as string) === "quarter" ? "quarter" : "month") as "month" | "quarter";
  if (isPeriodBeforeGtgt01Tt89(declRow.period_key as string, vatPeriod)) {
    return { ok: false as const, status: 400, error: "PERIOD_BEFORE_TT89" };
  }

  const { data: decl, error } = await client
    .from("accounting_declarations")
    .update({ status: "expert_review" })
    .eq("id", declarationId)
    .eq("org_id", actor.orgId)
    .neq("status", "filed_manual")
    .select("id, status")
    .single();
  if (error || !decl) return { ok: false as const, status: 400, error: "UPDATE_FAILED" };
  return { ok: true as const, status: decl.status as string };
}

export async function insertExpertAdjustment(
  client: SupabaseClient,
  accessToken: string,
  payload: {
    declarationId: string;
    fieldCode: string;
    amount: string;
    reasonCode: string;
    expertNote?: string;
  }
) {
  const actor = await resolveAccountingActor(client, accessToken);
  if (!actor.ok) return { ok: false as const, status: actor.status, error: actor.error };
  if (actor.role !== "vnk_expert") {
    return { ok: false as const, status: 403, error: "EXPERT_ONLY" };
  }

  const { error } = await client.from("accounting_declaration_adjustments").insert({
    org_id: actor.orgId,
    declaration_id: payload.declarationId,
    field_code: payload.fieldCode,
    amount: payload.amount,
    reason_code: payload.reasonCode,
    expert_note: payload.expertNote ?? null,
  });
  if (error) return { ok: false as const, status: 400, error: error.message };
  return { ok: true as const };
}
