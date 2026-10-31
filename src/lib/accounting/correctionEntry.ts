import type { SupabaseClient } from "@supabase/supabase-js";

export type TranslationSlot = {
  field: string;
  ko: { text: string; status: string; version: number } | null;
  vi: { text: string; status: string; version: number } | null;
  /** vi human_verified but ko source is newer → 「다른 언어본 재확인 필요」 */
  needsReconfirm: boolean;
  canConfirm: boolean;
};

type TextRow = {
  field: string;
  lang: "ko" | "vi";
  text: string;
  status: string;
  version: number;
  created_at: string;
};

export function needsViReconfirm(ko: TextRow | undefined, vi: TextRow | undefined): boolean {
  if (!ko || !vi || vi.status !== "human_verified") return false;
  return ko.created_at > vi.created_at;
}

async function txnContext(client: SupabaseClient, userId: string, txnId: string) {
  const { data: txn } = await client
    .from("accounting_transactions")
    .select("id, org_id, status, period_key, amount_vnd, corrects_txn_id")
    .eq("id", txnId)
    .maybeSingle();
  if (!txn) return null;
  const { data: member } = await client
    .from("accounting_org_members")
    .select("role")
    .eq("org_id", txn.org_id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!member) return null;
  return { txn, role: member.role as string };
}

export async function getTransactionExtras(client: SupabaseClient, accessToken: string, txnId: string) {
  const { data: userData, error } = await client.auth.getUser(accessToken);
  if (error || !userData.user) return { ok: false as const, status: 401, error: "UNAUTHENTICATED" };
  const userId = userData.user.id;
  const ctx = await txnContext(client, userId, txnId);
  if (!ctx) return { ok: false as const, status: 404, error: "NOT_FOUND" };
  const { txn, role } = ctx;

  const { data: filed } = await client
    .from("accounting_declarations")
    .select("id")
    .eq("org_id", txn.org_id)
    .eq("period_key", txn.period_key)
    .eq("status", "filed_manual")
    .limit(1);
  const periodFiled = (filed ?? []).length > 0;

  const { data: comments } = await client
    .from("accounting_review_comments")
    .select("id, status, kind, author_id, correction_payload, created_at")
    .eq("org_id", txn.org_id)
    .eq("target_type", "transaction")
    .eq("target_id", txnId)
    .eq("kind", "correction_request")
    .order("created_at", { ascending: true });

  const ids = (comments ?? []).map((c) => c.id as string);
  const bodies = new Map<string, string>();
  const rejects = new Map<string, string>();
  if (ids.length > 0) {
    const { data: texts } = await client
      .from("accounting_i18n_texts")
      .select("entity_id, field, text, version")
      .eq("org_id", txn.org_id)
      .eq("entity_type", "review_comment")
      .in("entity_id", ids)
      .order("version", { ascending: false });
    for (const row of texts ?? []) {
      const map = row.field === "reject_reason" ? rejects : bodies;
      if (!map.has(row.entity_id as string)) map.set(row.entity_id as string, row.text as string);
    }
  }

  const { data: corrected } = await client
    .from("accounting_transactions")
    .select("id")
    .eq("corrects_txn_id", txnId)
    .neq("status", "cancelled")
    .limit(1);
  const correctionTxnId = (corrected ?? [])[0]?.id as string | undefined;

  const { data: orgRow } = await client
    .from("accounting_organizations")
    .select("ledger_correction_method, ledger_correction_method_verified_status")
    .eq("id", txn.org_id)
    .maybeSingle();
  const ledgerCorrectionMethodVerified =
    orgRow?.ledger_correction_method_verified_status === "verified";

  let canRequest = role === "company_owner";
  if (role === "vnk_expert") {
    const { data: asn } = await client
      .from("accounting_expert_assignments")
      .select("id")
      .eq("org_id", txn.org_id)
      .eq("expert_user_id", userId)
      .maybeSingle();
    canRequest = Boolean(asn);
  }

  const { data: profile } = await client
    .from("accounting_profiles")
    .select("locale")
    .eq("user_id", userId)
    .maybeSingle();
  const isViMember = role === "company_member" && profile?.locale === "vi";
  const mayConfirmVi = role === "vnk_expert" || isViMember;

  const { data: texts } = await client
    .from("accounting_i18n_texts")
    .select("field, lang, text, status, version, created_at")
    .eq("org_id", txn.org_id)
    .eq("entity_type", "transaction")
    .eq("entity_id", txnId)
    .in("field", ["memo", "description"])
    .order("version", { ascending: false });
  const current = new Map<string, TextRow>();
  for (const row of (texts ?? []) as TextRow[]) {
    const key = `${row.field}|${row.lang}`;
    if (!current.has(key)) current.set(key, row);
  }
  const fields = [...new Set([...current.keys()].map((k) => k.split("|")[0]))];
  const translations: TranslationSlot[] = fields.map((field) => {
    const ko = current.get(`${field}|ko`);
    const vi = current.get(`${field}|vi`);
    return {
      field,
      ko: ko ? { text: ko.text, status: ko.status, version: ko.version } : null,
      vi: vi ? { text: vi.text, status: vi.status, version: vi.version } : null,
      needsReconfirm: needsViReconfirm(ko, vi),
      canConfirm: Boolean(vi && vi.status !== "human_verified" && mayConfirmVi),
    };
  });

  return {
    ok: true as const,
    role,
    status: txn.status as string,
    periodFiled,
    alreadyCorrected: (corrected ?? []).length > 0,
    isCorrection: Boolean(txn.corrects_txn_id),
    canApprove: role === "company_owner",
    canRequest,
    correctionTxnId: correctionTxnId ?? null,
    ledgerCorrectionMethod: (orgRow?.ledger_correction_method as string) ?? "reverse_entry",
    ledgerCorrectionMethodVerified,
    corrections: (comments ?? []).map((c) => ({
      id: c.id as string,
      status: c.status as string,
      amountVnd: Number((c.correction_payload as { amount_vnd?: number } | null)?.amount_vnd ?? 0),
      body: bodies.get(c.id as string) ?? "",
      rejectReason: rejects.get(c.id as string) ?? null,
      createdAt: c.created_at as string,
    })),
    translations,
  };
}

export async function requestCorrection(
  client: SupabaseClient,
  accessToken: string,
  payload: { txnId: string; amountVnd: number; text: string; lang: "ko" | "vi" }
) {
  const { data: userData, error } = await client.auth.getUser(accessToken);
  if (error || !userData.user) return { ok: false as const, status: 401, error: "UNAUTHENTICATED" };
  const ctx = await txnContext(client, userData.user.id, payload.txnId);
  if (!ctx) return { ok: false as const, status: 404, error: "NOT_FOUND" };
  if (!Number.isFinite(payload.amountVnd) || payload.amountVnd <= 0 || !payload.text.trim()) {
    return { ok: false as const, status: 422, error: "VALIDATION" };
  }
  const { data: comment, error: cErr } = await client
    .from("accounting_review_comments")
    .insert({
      org_id: ctx.txn.org_id,
      target_type: "transaction",
      target_id: payload.txnId,
      author_id: userData.user.id,
      kind: "correction_request",
      status: "open",
      correction_payload: { amount_vnd: payload.amountVnd },
    })
    .select("id")
    .single();
  if (cErr || !comment) return { ok: false as const, status: 403, error: "REQUEST_DENIED" };
  const { error: tErr } = await client.from("accounting_i18n_texts").insert({
    org_id: ctx.txn.org_id,
    entity_type: "review_comment",
    entity_id: comment.id,
    field: "body",
    lang: payload.lang,
    text: payload.text.trim(),
    status: "original",
    version: 1,
    created_by: userData.user.id,
  });
  if (tErr) return { ok: false as const, status: 400, error: "I18N_INSERT" };
  return { ok: true as const, commentId: comment.id as string };
}

function mapRpcError(message: string): { status: number; error: string } {
  if (message.includes("only company_owner")) return { status: 403, error: "OWNER_ONLY" };
  if (message.includes("filed_manual")) return { status: 409, error: "AMENDED_PROCEDURE_REQUIRED" };
  if (message.includes("already corrected")) return { status: 409, error: "ALREADY_CORRECTED" };
  if (message.includes("already resolved")) return { status: 409, error: "ALREADY_RESOLVED" };
  if (message.includes("vi confirm not allowed")) return { status: 403, error: "VI_CONFIRM_FORBIDDEN" };
  if (message.includes("forbidden")) return { status: 403, error: "FORBIDDEN" };
  if (message.includes("reason required")) return { status: 422, error: "REASON_REQUIRED" };
  return { status: 400, error: "RPC_FAILED" };
}

export async function approveCorrection(client: SupabaseClient, commentId: string) {
  const { data, error } = await client.rpc("accounting_approve_correction", { p_comment_id: commentId });
  if (error) return { ok: false as const, ...mapRpcError(error.message) };
  return { ok: true as const, newTxnId: data as string };
}

export async function rejectCorrection(
  client: SupabaseClient,
  commentId: string,
  reason: string,
  lang: "ko" | "vi"
) {
  const { error } = await client.rpc("accounting_reject_correction", {
    p_comment_id: commentId,
    p_reason: reason,
    p_lang: lang,
  });
  if (error) return { ok: false as const, ...mapRpcError(error.message) };
  return { ok: true as const };
}

export async function confirmViText(client: SupabaseClient, txnId: string, field: string) {
  return confirmViI18nEntity(client, "transaction", txnId, field);
}

export async function confirmViI18nEntity(
  client: SupabaseClient,
  entityType: string,
  entityId: string,
  field: string
) {
  const { error } = await client.rpc("accounting_confirm_vi_i18n_text", {
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_field: field,
  });
  if (error) {
    if (entityType === "transaction") {
      const legacy = await client.rpc("accounting_confirm_vi_text", {
        p_txn_id: entityId,
        p_field: field,
      });
      if (!legacy.error) return { ok: true as const };
    }
    return { ok: false as const, ...mapRpcError(error.message) };
  }
  return { ok: true as const };
}
