import type { SupabaseClient } from "@supabase/supabase-js";
import { saveAccountingI18nField } from "./accountingI18nTexts";
import { resolveAccountingActor } from "./accountingActor";
import { EVIDENCE_BUCKET } from "./evidenceEntry";
import { loadVatFormMeta } from "./vatDeclarationEntry";

const SIGNED_URL_SECONDS = 120;

export type ExpertActor =
  | { ok: true; userId: string; role: "vnk_expert" | "vnk_admin" }
  | { ok: false; status: number; error: string };

export type ExpertQueueItem =
  | {
      kind: "org_approval";
      orgId: string;
      orgDisplayName: string;
      requestedAt: string;
    }
  | {
      kind: "declaration";
      declarationId: string;
      orgId: string;
      orgDisplayName: string;
      periodKey: string;
      formCode: string;
      dueDateIso: string | null;
      dDay: number | null;
      formVerificationWaiting: boolean;
      warningCount: number;
      requestedAt: string;
    };

async function resolveExpertActor(
  client: SupabaseClient,
  accessToken: string
): Promise<ExpertActor> {
  const { data: userData, error: userError } = await client.auth.getUser(accessToken);
  if (userError || !userData.user) return { ok: false, status: 401, error: "UNAUTHENTICATED" };
  const userId = userData.user.id;
  const { data: memberships, error: memberError } = await client
    .from("accounting_org_members")
    .select("role")
    .eq("user_id", userId);
  if (memberError) return { ok: false, status: 400, error: "MEMBERSHIP_LOOKUP" };
  const roles = new Set((memberships ?? []).map((m) => m.role as string));
  if (roles.has("vnk_admin")) return { ok: true, userId, role: "vnk_admin" };
  if (roles.has("vnk_expert")) return { ok: true, userId, role: "vnk_expert" };
  return { ok: false, status: 403, error: "EXPERT_ONLY" };
}

async function assignedOrgIds(client: SupabaseClient, expertUserId: string): Promise<string[]> {
  const { data } = await client
    .from("accounting_expert_assignments")
    .select("org_id")
    .eq("expert_user_id", expertUserId);
  return (data ?? []).map((r) => r.org_id as string);
}

function warningCount(computed: unknown): number {
  const fields = (computed as { warnings?: string[] })?.warnings;
  return Array.isArray(fields) ? fields.length : 0;
}

function collectDeclarationTxnIds(computed: unknown): string[] {
  const fields = (computed as { fields?: Record<string, { txn_ids?: string[] }> })?.fields;
  if (!fields) return [];
  const ids = new Set<string>();
  for (const cell of Object.values(fields)) {
    for (const id of cell?.txn_ids ?? []) ids.add(id);
  }
  return [...ids];
}

type ReviewCommentBodyView = {
  ko?: string;
  vi?: string;
  translationPending: { ko: boolean; vi: boolean };
};

async function loadReviewCommentBodies(
  client: SupabaseClient,
  orgId: string,
  commentIds: string[]
): Promise<Record<string, ReviewCommentBodyView>> {
  const out: Record<string, ReviewCommentBodyView> = {};
  if (commentIds.length === 0) return out;
  const { data: texts } = await client
    .from("accounting_i18n_texts")
    .select("entity_id, lang, text, version")
    .eq("org_id", orgId)
    .eq("entity_type", "review_comment")
    .eq("field", "body")
    .in("entity_id", commentIds);
  const latest: Record<string, { ko?: { text: string; version: number }; vi?: { text: string; version: number } }> =
    {};
  for (const row of texts ?? []) {
    const id = row.entity_id as string;
    const lang = row.lang as "ko" | "vi";
    const version = row.version as number;
    const bucket = latest[id] ?? {};
    const prev = bucket[lang];
    if (!prev || version > prev.version) {
      bucket[lang] = { text: row.text as string, version };
      latest[id] = bucket;
    }
  }
  for (const id of commentIds) {
    const row = latest[id] ?? {};
    const ko = row.ko?.text;
    const vi = row.vi?.text;
    out[id] = {
      ko,
      vi,
      translationPending: { ko: !ko && !!vi, vi: !vi && !!ko },
    };
  }
  return out;
}

export async function listCompanyDeclarationReviewComments(
  client: SupabaseClient,
  accessToken: string,
  declarationId: string
) {
  const actor = await resolveAccountingActor(client, accessToken);
  if (!actor.ok) return { ok: false as const, status: actor.status, error: actor.error };
  if (actor.role !== "company_owner" && actor.role !== "company_member") {
    return { ok: false as const, status: 403, error: "FORBIDDEN" };
  }

  const { data: decl } = await client
    .from("accounting_declarations")
    .select("id")
    .eq("id", declarationId)
    .eq("org_id", actor.orgId)
    .maybeSingle();
  if (!decl) return { ok: false as const, status: 404, error: "NOT_FOUND" };

  const { data: comments } = await client
    .from("accounting_review_comments")
    .select("id, author_id, kind, status, created_at")
    .eq("org_id", actor.orgId)
    .eq("target_type", "declaration")
    .eq("target_id", declarationId)
    .order("created_at", { ascending: true });

  const commentIds = (comments ?? []).map((c) => c.id as string);
  const bodies = await loadReviewCommentBodies(client, actor.orgId, commentIds);

  return {
    ok: true as const,
    role: actor.role,
    comments: (comments ?? []).map((c) => {
      const body = bodies[c.id as string] ?? { translationPending: { ko: false, vi: false } };
      return {
        ...c,
        body: { ko: body.ko, vi: body.vi },
        translationPending: body.translationPending,
      };
    }),
  };
}

function orgDisplayName(o: { name_ko_display?: string | null; name_official?: string | null }) {
  return (o.name_ko_display as string | null) || (o.name_official as string) || "—";
}

function dDayFromDue(dueIso: string | null | undefined): number | null {
  if (!dueIso) return null;
  const due = new Date(dueIso.slice(0, 10));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86400000);
}

async function formVerificationWaiting(client: SupabaseClient, formCode: string): Promise<boolean> {
  const { data } = await client
    .from("accounting_form_versions")
    .select("status")
    .eq("form_code", formCode)
    .eq("portal_form_basis", "TT89")
    .maybeSingle();
  const st = data?.status as string | undefined;
  return st === "pending_verification" || st === "blocked";
}

export async function listExpertReviewQueue(client: SupabaseClient, accessToken: string) {
  const actor = await resolveExpertActor(client, accessToken);
  if (!actor.ok) return { ok: false as const, status: actor.status, error: actor.error };

  const items: ExpertQueueItem[] = [];

  const { data: pendingOrgs, error: pendingErr } = await client
    .from("accounting_organizations")
    .select("id, name_official, name_ko_display, created_at")
    .eq("approval_status", "in_review")
    .order("created_at", { ascending: false });
  if (pendingErr) return { ok: false as const, status: 400, error: "PENDING_ORG_LOOKUP" };
  for (const o of pendingOrgs ?? []) {
    items.push({
      kind: "org_approval",
      orgId: o.id as string,
      orgDisplayName: orgDisplayName(o),
      requestedAt: (o.created_at as string) ?? new Date().toISOString(),
    });
  }

  const orgIds =
    actor.role === "vnk_admin"
      ? null
      : await assignedOrgIds(client, actor.userId);

  let declQuery = client
    .from("accounting_declarations")
    .select("id, org_id, period_key, form_code, due_date, computed, updated_at, status")
    .eq("status", "expert_review");
  if (orgIds !== null) {
    if (orgIds.length === 0) {
      declQuery = declQuery.in("org_id", ["00000000-0000-0000-0000-000000000000"]);
    } else {
      declQuery = declQuery.in("org_id", orgIds);
    }
  }
  const { data: decls, error } = await declQuery;
  if (error) return { ok: false as const, status: 400, error: "QUEUE_LOOKUP" };

  const orgIdSet = [...new Set((decls ?? []).map((d) => d.org_id as string))];
  const { data: orgs } = orgIdSet.length
    ? await client
        .from("accounting_organizations")
        .select("id, name_official, name_ko_display")
        .in("id", orgIdSet)
    : { data: [] };

  const orgName = new Map((orgs ?? []).map((o) => [o.id as string, orgDisplayName(o)]));

  for (const d of decls ?? []) {
    const formCode = (d.form_code as string) || "01/GTGT";
    const dueIso = (d.due_date as string | null) ?? null;
    items.push({
      kind: "declaration",
      declarationId: d.id as string,
      orgId: d.org_id as string,
      orgDisplayName: orgName.get(d.org_id as string) ?? "—",
      periodKey: d.period_key as string,
      formCode,
      dueDateIso: dueIso,
      dDay: dDayFromDue(dueIso),
      formVerificationWaiting: await formVerificationWaiting(client, formCode),
      warningCount: warningCount(d.computed),
      requestedAt: d.updated_at as string,
    });
  }
  items.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  return { ok: true as const, items };
}

export async function resolveOrgApproval(
  client: SupabaseClient,
  accessToken: string,
  payload: { orgId: string; action: "approve" | "reject"; rejectReason?: string; lang?: "ko" | "vi" }
) {
  const actor = await resolveExpertActor(client, accessToken);
  if (!actor.ok) return { ok: false as const, status: actor.status, error: actor.error };

  const { data: org, error: orgErr } = await client
    .from("accounting_organizations")
    .select("id, approval_status")
    .eq("id", payload.orgId)
    .maybeSingle();
  if (orgErr || !org) return { ok: false as const, status: 404, error: "NOT_FOUND" };
  if (org.approval_status !== "in_review") {
    return { ok: false as const, status: 400, error: "NOT_IN_REVIEW" };
  }

  if (payload.action === "reject") {
    const reason = (payload.rejectReason ?? "").trim();
    if (!reason) return { ok: false as const, status: 400, error: "REJECT_REASON_REQUIRED" };
    const lang = payload.lang === "vi" ? "vi" : "ko";
    const { error: updErr } = await client
      .from("accounting_organizations")
      .update({ approval_status: "rejected" })
      .eq("id", payload.orgId);
    if (updErr) return { ok: false as const, status: 400, error: "REJECT_FAILED" };
    await client.from("accounting_i18n_texts").insert({
      org_id: payload.orgId,
      entity_type: "organization",
      entity_id: payload.orgId,
      field: "review_note",
      lang,
      text: reason,
      status: "original",
      version: 1,
      created_by: actor.userId,
    });
    return { ok: true as const, approvalStatus: "rejected" as const };
  }

  const { error: updErr } = await client
    .from("accounting_organizations")
    .update({ approval_status: "approved" })
    .eq("id", payload.orgId);
  if (updErr) return { ok: false as const, status: 400, error: "APPROVE_FAILED" };

  if (actor.role === "vnk_expert") {
    await client.from("accounting_org_members").insert({
      org_id: payload.orgId,
      user_id: actor.userId,
      role: "vnk_expert",
    });
    await client.from("accounting_expert_assignments").insert({
      expert_user_id: actor.userId,
      org_id: payload.orgId,
      assigned_by: actor.userId,
    });
  }
  return { ok: true as const, approvalStatus: "approved" as const };
}

export async function getExpertDeclarationDetail(
  client: SupabaseClient,
  accessToken: string,
  declarationId: string
) {
  const actor = await resolveExpertActor(client, accessToken);
  if (!actor.ok) return { ok: false as const, status: actor.status, error: actor.error };

  const { data: decl, error } = await client
    .from("accounting_declarations")
    .select(
      "id, org_id, period_key, status, computed, form_code, portal_form_basis, filed_at, filing_receipt_path"
    )
    .eq("id", declarationId)
    .maybeSingle();
  if (error || !decl) return { ok: false as const, status: 404, error: "NOT_FOUND" };

  if (actor.role === "vnk_expert") {
    const orgIds = await assignedOrgIds(client, actor.userId);
    if (!orgIds.includes(decl.org_id as string)) {
      return { ok: false as const, status: 403, error: "FORBIDDEN" };
    }
  }

  const form = await loadVatFormMeta(client);
  const formVerificationWaiting =
    !form.ok || form.status === "pending_verification" || form.status === "blocked";
  const { data: org } = await client
    .from("accounting_organizations")
    .select("name_official, name_ko_display, tax_code, vat_method, vat_period")
    .eq("id", decl.org_id)
    .single();

  const { data: comments } = await client
    .from("accounting_review_comments")
    .select("id, author_id, kind, status, target_type, created_at")
    .eq("org_id", decl.org_id)
    .eq("target_type", "declaration")
    .eq("target_id", declarationId)
    .order("created_at", { ascending: true });

  const commentIds = (comments ?? []).map((c) => c.id as string);
  const bodies = await loadReviewCommentBodies(client, decl.org_id as string, commentIds);

  const txnIds = collectDeclarationTxnIds(decl.computed);
  let linkedTransactions: {
    id: string;
    txn_date: string;
    type: string;
    status: string;
    amount_vnd: number | null;
  }[] = [];
  if (txnIds.length > 0) {
    const { data: txns } = await client
      .from("accounting_transactions")
      .select("id, txn_date, type, status, amount_vnd")
      .eq("org_id", decl.org_id)
      .in("id", txnIds)
      .order("txn_date", { ascending: true });
    linkedTransactions = (txns ?? []) as typeof linkedTransactions;
  }

  let receiptUrl: string | null = null;
  if (decl.filing_receipt_path) {
    const { data: signed } = await client.storage
      .from(EVIDENCE_BUCKET)
      .createSignedUrl(decl.filing_receipt_path as string, SIGNED_URL_SECONDS);
    receiptUrl = signed?.signedUrl ?? null;
  }

  return {
    ok: true as const,
    declaration: decl,
    org,
    form,
    comments: (comments ?? []).map((c) => {
      const body = bodies[c.id as string] ?? { translationPending: { ko: false, vi: false } };
      return {
        ...c,
        body: { ko: body.ko, vi: body.vi },
        translationPending: body.translationPending,
      };
    }),
    linkedTransactions,
    receiptUrl,
    warnings: warningCount(decl.computed),
    formVerificationWaiting,
  };
}

export async function createExpertReviewComment(
  client: SupabaseClient,
  accessToken: string,
  payload: {
    declarationId: string;
    kind: "comment" | "correction_request";
    body: string;
    lang: "ko" | "vi";
  }
) {
  const actor = await resolveExpertActor(client, accessToken);
  if (!actor.ok) return { ok: false as const, status: actor.status, error: actor.error };

  const { data: decl } = await client
    .from("accounting_declarations")
    .select("org_id, status")
    .eq("id", payload.declarationId)
    .maybeSingle();
  if (!decl) return { ok: false as const, status: 404, error: "NOT_FOUND" };
  const orgIds = await assignedOrgIds(client, actor.userId);
  if (!orgIds.includes(decl.org_id as string)) {
    return { ok: false as const, status: 403, error: "FORBIDDEN" };
  }

  const { data: comment, error: cErr } = await client
    .from("accounting_review_comments")
    .insert({
      org_id: decl.org_id,
      target_type: "declaration",
      target_id: payload.declarationId,
      author_id: actor.userId,
      kind: payload.kind,
      status: "open",
    })
    .select("id")
    .single();
  if (cErr || !comment) return { ok: false as const, status: 400, error: "COMMENT_INSERT" };

  const i18n = await saveAccountingI18nField(client, {
    orgId: decl.org_id as string,
    entityType: "review_comment",
    entityId: comment.id as string,
    field: "body",
    lang: payload.lang,
    text: payload.body,
    createdBy: actor.userId,
    deferTranslation: true,
  });
  if (!i18n.ok) return { ok: false as const, status: 400, error: i18n.error };
  return { ok: true as const, commentId: comment.id as string };
}

export async function createCompanyOwnerReviewComment(
  client: SupabaseClient,
  accessToken: string,
  payload: {
    declarationId: string;
    kind: "comment" | "correction_request";
    body: string;
    lang: "ko" | "vi";
  }
) {
  const actor = await resolveAccountingActor(client, accessToken);
  if (!actor.ok) return { ok: false as const, status: actor.status, error: actor.error };
  if (actor.role !== "company_owner") {
    return { ok: false as const, status: 403, error: "OWNER_ONLY" };
  }

  const { data: decl } = await client
    .from("accounting_declarations")
    .select("org_id, status")
    .eq("id", payload.declarationId)
    .eq("org_id", actor.orgId)
    .maybeSingle();
  if (!decl) return { ok: false as const, status: 404, error: "NOT_FOUND" };

  const { data: comment, error: cErr } = await client
    .from("accounting_review_comments")
    .insert({
      org_id: actor.orgId,
      target_type: "declaration",
      target_id: payload.declarationId,
      author_id: actor.userId,
      kind: payload.kind,
      status: "open",
    })
    .select("id")
    .single();
  if (cErr || !comment) return { ok: false as const, status: 400, error: "COMMENT_INSERT" };

  const i18n = await saveAccountingI18nField(client, {
    orgId: actor.orgId,
    entityType: "review_comment",
    entityId: comment.id as string,
    field: "body",
    lang: payload.lang,
    text: payload.body,
    createdBy: actor.userId,
    deferTranslation: true,
  });
  if (!i18n.ok) return { ok: false as const, status: 400, error: i18n.error };
  return { ok: true as const, commentId: comment.id as string };
}

export async function resolveOwnerReviewComment(
  client: SupabaseClient,
  accessToken: string,
  commentId: string
) {
  const actor = await resolveAccountingActor(client, accessToken);
  if (!actor.ok) return { ok: false as const, status: actor.status, error: actor.error };
  if (actor.role !== "company_owner") {
    return { ok: false as const, status: 403, error: "OWNER_ONLY" };
  }

  const { data: row } = await client
    .from("accounting_review_comments")
    .select("id, org_id, status")
    .eq("id", commentId)
    .eq("org_id", actor.orgId)
    .maybeSingle();
  if (!row) return { ok: false as const, status: 404, error: "NOT_FOUND" };
  if (row.status !== "open") return { ok: false as const, status: 409, error: "ALREADY_RESOLVED" };

  const { error } = await client
    .from("accounting_review_comments")
    .update({ status: "resolved" })
    .eq("id", commentId)
    .eq("org_id", actor.orgId)
    .eq("status", "open");
  if (error) return { ok: false as const, status: 400, error: "RESOLVE_FAILED" };
  return { ok: true as const };
}

export async function recordExpertManualFiling(
  client: SupabaseClient,
  accessToken: string,
  payload: {
    declarationId: string;
    portalFormBasis: "TT89" | "TT80";
    filedAt: string;
    filingReceiptPath: string;
    warningsAcknowledged?: boolean;
  }
) {
  const actor = await resolveExpertActor(client, accessToken);
  if (!actor.ok) return { ok: false as const, status: actor.status, error: actor.error };

  const { data: decl } = await client
    .from("accounting_declarations")
    .select("id, org_id, status, computed")
    .eq("id", payload.declarationId)
    .maybeSingle();
  if (!decl) return { ok: false as const, status: 404, error: "NOT_FOUND" };
  const orgIds = await assignedOrgIds(client, actor.userId);
  if (!orgIds.includes(decl.org_id as string)) {
    return { ok: false as const, status: 403, error: "FORBIDDEN" };
  }
  if (decl.status !== "expert_review") {
    return { ok: false as const, status: 400, error: "INVALID_STATUS" };
  }

  const wc = warningCount(decl.computed);
  if (wc > 0 && !payload.warningsAcknowledged) {
    return { ok: false as const, status: 400, error: "WARNINGS_NOT_ACKNOWLEDGED" };
  }
  if (!payload.portalFormBasis) {
    return { ok: false as const, status: 400, error: "PORTAL_BASIS_REQUIRED" };
  }

  const { error } = await client
    .from("accounting_declarations")
    .update({
      status: "filed_manual",
      portal_form_basis: payload.portalFormBasis,
      filed_at: payload.filedAt,
      filing_receipt_path: payload.filingReceiptPath,
    })
    .eq("id", payload.declarationId)
    .eq("org_id", decl.org_id);
  if (error) {
    const msg = error.message.includes("portal_form_basis")
      ? "PORTAL_BASIS_REQUIRED"
      : "FILING_FAILED";
    return { ok: false as const, status: 400, error: msg };
  }
  return { ok: true as const };
}

export async function denyNonExpertQueueAccess(
  client: SupabaseClient,
  accessToken: string
): Promise<{ ok: true; denied: boolean } | { ok: false; status: number; error: string }> {
  const { data: userData, error: userError } = await client.auth.getUser(accessToken);
  if (userError || !userData.user) return { ok: false, status: 401, error: "UNAUTHENTICATED" };
  const { data: memberships } = await client
    .from("accounting_org_members")
    .select("role")
    .eq("user_id", userData.user.id);
  const roles = new Set((memberships ?? []).map((m) => m.role as string));
  if (roles.has("company_member") || roles.has("company_owner")) {
    return { ok: true, denied: true };
  }
  if (roles.has("vnk_expert") || roles.has("vnk_admin")) {
    return { ok: true, denied: false };
  }
  return { ok: true, denied: true };
}
