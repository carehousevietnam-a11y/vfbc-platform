import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveAccountingActor } from "./accountingActor";
import {
  declarationWizardLocked,
  mergeWizardIntoComputed,
  parseVatWizard,
  stepMemoField,
  type VatWizardState,
} from "./vatWizard";
import { saveAccountingI18nField, type I18nLang } from "./accountingI18nTexts";
import { isPeriodBeforeGtgt01Tt89, type VatCalendarPeriod } from "./gtgt01FormPeriod";

export async function resolveMemberDisplayNames(
  client: SupabaseClient,
  orgId: string,
  userIds: string[]
): Promise<{ names: Map<string, string>; roles: Map<string, string> }> {
  const names = new Map<string, string>();
  const roles = new Map<string, string>();
  const unique = [...new Set(userIds.filter(Boolean))];
  if (unique.length === 0) return { names, roles };
  const { data: profiles } = await client
    .from("accounting_company_signup_profiles")
    .select("user_id, company_name")
    .in("user_id", unique);
  for (const row of profiles ?? []) {
    const name = (row.company_name as string)?.trim();
    if (name) names.set(row.user_id as string, name);
  }
  const { data: members } = await client
    .from("accounting_org_members")
    .select("user_id, role")
    .eq("org_id", orgId)
    .in("user_id", unique);
  for (const row of members ?? []) {
    const uid = row.user_id as string;
    const role = (row.role as string)?.trim();
    if (role) roles.set(uid, role);
  }
  return { names, roles };
}

async function loadDeclarationRow(
  client: SupabaseClient,
  orgId: string,
  declarationId: string
) {
  return client
    .from("accounting_declarations")
    .select("id, org_id, status, computed, period_key, updated_at")
    .eq("id", declarationId)
    .eq("org_id", orgId)
    .maybeSingle();
}

export async function loadDeclarationStepMemos(
  client: SupabaseClient,
  orgId: string,
  declarationId: string
): Promise<Record<string, { ko?: string; vi?: string }>> {
  const fields = [1, 2, 3, 4, 5, 6].map(stepMemoField);
  const { data } = await client
    .from("accounting_i18n_texts")
    .select("field, lang, text, version")
    .eq("org_id", orgId)
    .eq("entity_type", "declaration")
    .eq("entity_id", declarationId)
    .in("field", fields)
    .order("version", { ascending: false });

  const out: Record<string, { ko?: string; vi?: string }> = {};
  for (const row of data ?? []) {
    const field = row.field as string;
    const lang = row.lang as "ko" | "vi";
    const pack = out[field] ?? {};
    if (lang === "ko" && pack.ko === undefined) pack.ko = row.text as string;
    if (lang === "vi" && pack.vi === undefined) pack.vi = row.text as string;
    out[field] = pack;
  }
  return out;
}

async function ensureDeclarationId(
  client: SupabaseClient,
  orgId: string,
  periodKey: string
): Promise<{ id: string } | { error: string }> {
  const { data: existing } = await client
    .from("accounting_declarations")
    .select("id, status")
    .eq("org_id", orgId)
    .eq("form_code", "01/GTGT")
    .eq("period_key", periodKey)
    .maybeSingle();
  if (existing?.id) {
    if (existing.status === "filed_manual") return { error: "WIZARD_LOCKED" };
    return { id: existing.id as string };
  }
  const { data: formRow } = await client
    .from("accounting_form_versions")
    .select("id")
    .eq("form_code", "01/GTGT")
    .eq("portal_form_basis", "TT89")
    .maybeSingle();
  const { data: ins, error } = await client
    .from("accounting_declarations")
    .insert({
      org_id: orgId,
      form_code: "01/GTGT",
      form_version_id: formRow?.id ?? null,
      period_key: periodKey,
      status: "drafting",
    })
    .select("id")
    .single();
  if (error || !ins) return { error: "DECLARATION_INSERT_FAILED" };
  return { id: ins.id as string };
}

export async function saveVatWizard(
  client: SupabaseClient,
  accessToken: string,
  payload: {
    declarationId?: string;
    periodKey?: string;
    step: number;
    filingKind?: "regular" | "amended";
    stepMemo?: string;
    stepMemoLang?: I18nLang;
    expectedUpdatedAt?: string | null;
    expectedRevision?: number | null;
  }
): Promise<
  | {
      ok: true;
      wizard: VatWizardState;
      updatedAt: string;
      declarationId: string;
      status: string;
    }
  | { ok: false; status: number; error: string; server?: { wizard: VatWizardState | null; updatedAt: string | null } }
> {
  const actor = await resolveAccountingActor(client, accessToken);
  if (!actor.ok) return { ok: false, status: actor.status, error: actor.error };
  if (actor.role !== "company_owner" && actor.role !== "company_member") {
    return { ok: false, status: 403, error: "ROLE_FORBIDDEN" };
  }

  const step = payload.step;
  if (!Number.isInteger(step) || step < 1 || step > 6) {
    return { ok: false, status: 422, error: "VALIDATION" };
  }

  let declarationId = payload.declarationId ?? "";
  if (!declarationId) {
    const pk = payload.periodKey?.trim();
    if (!pk) return { ok: false, status: 422, error: "VALIDATION" };
    const ensured = await ensureDeclarationId(client, actor.orgId, pk);
    if ("error" in ensured) {
      const status = ensured.error === "WIZARD_LOCKED" ? 409 : 400;
      return { ok: false, status, error: ensured.error };
    }
    declarationId = ensured.id;
  }

  const { data: row, error: readErr } = await loadDeclarationRow(client, actor.orgId, declarationId);
  if (readErr || !row) return { ok: false, status: 404, error: "NOT_FOUND" };
  if (declarationWizardLocked(row.status as string)) {
    return { ok: false, status: 409, error: "WIZARD_LOCKED" };
  }

  const serverUpdatedAt = row.updated_at ? String(row.updated_at) : null;
  const currentWizard = parseVatWizard(row.computed);
  const currentRevision = currentWizard?.revision ?? 0;
  if (payload.expectedRevision != null && payload.expectedRevision !== currentRevision) {
    return {
      ok: false,
      status: 409,
      error: "CONCURRENT_SAVE",
      server: { wizard: currentWizard, updatedAt: serverUpdatedAt },
    };
  }

  const computed =
    row.computed && typeof row.computed === "object"
      ? { ...(row.computed as Record<string, unknown>) }
      : {};
  const prev = parseVatWizard(computed);
  const filingKind =
    payload.filingKind === "amended" || payload.filingKind === "regular"
      ? payload.filingKind
      : prev?.filingKind ?? "regular";
  const periodKey =
    payload.periodKey?.trim() || prev?.periodKey || (row.period_key as string) || "";

  if (periodKey) {
    const { data: orgRow } = await client
      .from("accounting_organizations")
      .select("vat_period")
      .eq("id", actor.orgId)
      .single();
    const vatPeriod = ((orgRow?.vat_period as string) === "quarter" ? "quarter" : "month") as VatCalendarPeriod;
    if (isPeriodBeforeGtgt01Tt89(periodKey, vatPeriod) && step > 1) {
      return { ok: false, status: 422, error: "PERIOD_BEFORE_TT89" };
    }
  }

  let actorLang: I18nLang = "ko";
  const { data: prof } = await client
    .from("accounting_profiles")
    .select("locale")
    .eq("user_id", actor.userId)
    .maybeSingle();
  if (prof?.locale === "vi") actorLang = "vi";

  const stepLang: I18nLang =
    payload.stepMemoLang === "vi"
      ? "vi"
      : payload.stepMemoLang === "ko"
        ? "ko"
        : prev?.steps[String(step)]?.lang ?? actorLang;

  const wizard: VatWizardState = {
    revision: currentRevision + 1,
    step,
    filingKind,
    periodKey,
    steps: { ...(prev?.steps ?? {}) },
  };
  wizard.steps[String(step)] = {
    savedAt: new Date().toISOString(),
    savedBy: actor.userId,
    lang: stepLang,
  };

  const nextComputed = mergeWizardIntoComputed(computed, wizard);
  const { data: updated, error: updErr } = await client
    .from("accounting_declarations")
    .update({
      computed: nextComputed,
      period_key: periodKey || row.period_key,
    })
    .eq("id", declarationId)
    .eq("org_id", actor.orgId)
    .select("id, status, updated_at, computed")
    .single();

  if (updErr || !updated) return { ok: false, status: 400, error: "WRITE_FAILED" };

  const memoLang: I18nLang =
    payload.stepMemoLang === "vi" ? "vi" : payload.stepMemoLang === "ko" ? "ko" : wizard.steps[String(step)]!.lang;

  if (payload.stepMemo !== undefined && payload.stepMemo.trim()) {
    const memoSave = await saveAccountingI18nField(client, {
      orgId: actor.orgId,
      entityType: "declaration",
      entityId: declarationId,
      field: stepMemoField(step),
      lang: memoLang,
      text: payload.stepMemo,
      createdBy: actor.userId,
      deferTranslation: true,
    });
    if (!memoSave.ok) return { ok: false, status: 400, error: memoSave.error };
  }

  const finalWizard = parseVatWizard(updated.computed) ?? wizard;
  return {
    ok: true,
    wizard: finalWizard,
    updatedAt: String(updated.updated_at),
    declarationId: updated.id as string,
    status: updated.status as string,
  };
}
