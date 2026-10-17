import type { SupabaseClient } from "@supabase/supabase-js";
import { machineTranslateAccountingText } from "./accountingMachineTranslate";

export type I18nLang = "ko" | "vi";

type LatestRow = {
  version: number;
  text: string;
  status: string;
};

async function latestForLang(
  client: SupabaseClient,
  orgId: string,
  entityType: string,
  entityId: string,
  field: string,
  lang: I18nLang
): Promise<LatestRow | null> {
  const { data } = await client
    .from("accounting_i18n_texts")
    .select("version, text, status")
    .eq("org_id", orgId)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .eq("field", field)
    .eq("lang", lang)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return {
    version: data.version as number,
    text: data.text as string,
    status: data.status as string,
  };
}

async function insertRow(
  client: SupabaseClient,
  payload: {
    orgId: string;
    entityType: string;
    entityId: string;
    field: string;
    lang: I18nLang;
    text: string;
    status: "original" | "machine" | "human_verified";
    version: number;
    translatedFromVersion?: number;
    createdBy: string;
  }
): Promise<boolean> {
  const { error } = await client.from("accounting_i18n_texts").insert({
    org_id: payload.orgId,
    entity_type: payload.entityType,
    entity_id: payload.entityId,
    field: payload.field,
    lang: payload.lang,
    text: payload.text,
    status: payload.status,
    version: payload.version,
    translated_from_version: payload.translatedFromVersion ?? null,
    created_by: payload.createdBy,
  });
  return !error;
}

async function translateOpposite(
  client: SupabaseClient,
  orgId: string,
  entityType: string,
  entityId: string,
  field: string,
  sourceLang: I18nLang,
  sourceVersion: number,
  sourceText: string,
  createdBy: string
): Promise<void> {
  const targetLang: I18nLang = sourceLang === "ko" ? "vi" : "ko";
  const opposite = await latestForLang(client, orgId, entityType, entityId, field, targetLang);
  if (opposite?.status === "human_verified") return;

  const direction = sourceLang === "ko" ? "ko_to_vi" : "vi_to_ko";
  const translated = await machineTranslateAccountingText(direction, sourceText);
  if (!translated.ok) return;

  const nextVersion = (opposite?.version ?? 0) + 1;
  await insertRow(client, {
    orgId,
    entityType,
    entityId,
    field,
    lang: targetLang,
    text: translated.translated,
    status: "machine",
    version: nextVersion,
    translatedFromVersion: sourceVersion,
    createdBy,
  });
}

/** 자유 입력 칸 저장: original 삽입 후 반대 언어 기계번역(실패 시 반대 행 없음 → UI 번역 대기). */
export async function saveAccountingI18nField(
  client: SupabaseClient,
  params: {
    orgId: string;
    entityType: string;
    entityId: string;
    field: string;
    lang: I18nLang;
    text: string;
    createdBy: string;
    txnConfirmed?: boolean;
  }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = params.text.trim();
  if (!trimmed) return { ok: true };

  const latest = await latestForLang(
    client,
    params.orgId,
    params.entityType,
    params.entityId,
    params.field,
    params.lang
  );
  if (latest?.text === trimmed) return { ok: true };
  if (params.txnConfirmed && latest) {
    return { ok: false, error: "CONFIRMED_I18N_LOCKED" };
  }

  const nextVersion = (latest?.version ?? 0) + 1;
  const inserted = await insertRow(client, {
    orgId: params.orgId,
    entityType: params.entityType,
    entityId: params.entityId,
    field: params.field,
    lang: params.lang,
    text: trimmed,
    status: "original",
    version: nextVersion,
    createdBy: params.createdBy,
  });
  if (!inserted) return { ok: false, error: "I18N_INSERT" };

  await translateOpposite(
    client,
    params.orgId,
    params.entityType,
    params.entityId,
    params.field,
    params.lang,
    nextVersion,
    trimmed,
    params.createdBy
  );
  return { ok: true };
}

export async function loadTransactionI18nTexts(
  client: SupabaseClient,
  orgId: string,
  txnId: string
): Promise<Record<string, { ko?: string; vi?: string; koPending?: boolean; viPending?: boolean }>> {
  const { data } = await client
    .from("accounting_i18n_texts")
    .select("field, lang, text, version, status")
    .eq("org_id", orgId)
    .eq("entity_type", "transaction")
    .eq("entity_id", txnId)
    .in("field", ["memo", "description"])
    .order("version", { ascending: false });

  const out: Record<string, { ko?: string; vi?: string }> = {};
  for (const row of data ?? []) {
    const field = row.field as string;
    const lang = row.lang as I18nLang;
    const pack = out[field] ?? {};
    if (lang === "ko" && pack.ko === undefined) pack.ko = row.text as string;
    if (lang === "vi" && pack.vi === undefined) pack.vi = row.text as string;
    out[field] = pack;
  }
  const result: Record<string, { ko?: string; vi?: string; koPending?: boolean; viPending?: boolean }> = {};
  for (const [field, pack] of Object.entries(out)) {
    result[field] = {
      ...pack,
      koPending: Boolean(pack.vi && !pack.ko),
      viPending: Boolean(pack.ko && !pack.vi),
    };
  }
  return result;
}
