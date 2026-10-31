import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const DOCUMENTS_BUCKET = "documents";
export const PRE_SIGNUP_RETENTION_DAYS = 30;
/** 한 번의 cron 실행에서 처리하는 최대 객체 수 */
export const PRE_SIGNUP_PURGE_MAX_BATCH = 100;

const PURGE_META_FLAG = "storage_path_purged";
const AUDIT_ACTION = "purge_unsigned_pre_signup_documents";

const VERIFY_PATH_RE = /^verify-[a-z0-9-]+\/[0-9a-f-]{36}\.[a-z0-9]+$/i;
const DOCUMENT_UPLOAD_PATH_RE = /^document-upload\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.[a-z0-9]+$/i;
/** Accounting verify funnel (P7) — same 30-day pre-signup retention as verify-* paths. */
const ACCOUNTING_FUNNEL_PATH_RE =
  /^verify-accounting-funnel\/[a-z0-9_]+\/[a-zA-Z0-9-]+\.[a-z0-9]+$/i;

export function isPreSignupDocumentsObjectPath(path: string): boolean {
  if (!path || path.includes("..") || path.includes("\\")) return false;
  return (
    VERIFY_PATH_RE.test(path) ||
    DOCUMENT_UPLOAD_PATH_RE.test(path) ||
    ACCOUNTING_FUNNEL_PATH_RE.test(path)
  );
}

export function extractPreSignupStoragePaths(meta: unknown): string[] {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return [];
  const record = meta as Record<string, unknown>;
  if (record[PURGE_META_FLAG] === "1" || record[PURGE_META_FLAG] === true) {
    return [];
  }
  const paths: string[] = [];
  if (typeof record.storagePath === "string") paths.push(record.storagePath);
  const submitted = record.submitted_document;
  if (submitted && typeof submitted === "object" && !Array.isArray(submitted)) {
    const sub = submitted as Record<string, unknown>;
    if (typeof sub.storagePath === "string") paths.push(sub.storagePath);
  }
  return [...new Set(paths.filter(isPreSignupDocumentsObjectPath))];
}

export function buildPurgedActivityMeta(meta: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = { ...meta };
  delete next.storagePath;
  delete next.file_name;
  delete next.fileName;
  const submitted = next.submitted_document;
  if (submitted && typeof submitted === "object" && !Array.isArray(submitted)) {
    const sub = { ...(submitted as Record<string, unknown>) };
    delete sub.storagePath;
    delete sub.file_name;
    sub.purged = true;
    next.submitted_document = sub;
  }
  next[PURGE_META_FLAG] = "1";
  next.storage_path_purged_at = new Date().toISOString();
  return next;
}

type ActivityRow = {
  id: string;
  lead_id: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
};

export type PreSignupPurgeResult = {
  jobId: string;
  deletedCount: number;
  failedCount: number;
  skippedSignedUp: number;
};

export type PreSignupPurgeOptions = {
  jobId?: string;
  maxItems?: number;
  retentionDays?: number;
  now?: Date;
  client?: SupabaseClient;
  deleteObject?: (bucket: string, path: string) => Promise<{ error: Error | null }>;
};

function retentionCutoffIso(now: Date, retentionDays: number): string {
  const ms = retentionDays * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() - ms).toISOString();
}

async function defaultDeleteObject(
  bucket: string,
  path: string,
): Promise<{ error: Error | null }> {
  const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
  if (!error) return { error: null };
  const msg = error.message.toLowerCase();
  if (msg.includes("not found")) return { error: null };
  return { error: new Error(error.message) };
}

export async function runPreSignupDocumentPurge(
  options: PreSignupPurgeOptions = {},
): Promise<PreSignupPurgeResult> {
  const jobId = options.jobId ?? randomUUID();
  const maxItems = options.maxItems ?? PRE_SIGNUP_PURGE_MAX_BATCH;
  const retentionDays = options.retentionDays ?? PRE_SIGNUP_RETENTION_DAYS;
  const now = options.now ?? new Date();
  const client = options.client ?? supabaseAdmin;
  const deleteObject = options.deleteObject ?? defaultDeleteObject;

  const cutoff = retentionCutoffIso(now, retentionDays);
  let deletedCount = 0;
  let failedCount = 0;
  let skippedSignedUp = 0;

  const { data: activities, error: actErr } = await client
    .from("crm_activities")
    .select("id, lead_id, meta, created_at")
    .lt("created_at", cutoff)
    .order("created_at", { ascending: true })
    .limit(Math.max(maxItems * 5, 200));

  if (actErr) {
    throw new Error(`crm_activities query failed: ${actErr.message}`);
  }

  const rows = (activities ?? []) as ActivityRow[];
  const leadIds = [...new Set(rows.map((r) => r.lead_id).filter(Boolean))] as string[];
  const unsignedLeadIds = new Set<string>();

  if (leadIds.length > 0) {
    for (let i = 0; i < leadIds.length; i += 100) {
      const chunk = leadIds.slice(i, i + 100);
      const { data: leads, error: leadErr } = await client
        .from("leads")
        .select("id, user_id")
        .in("id", chunk);
      if (leadErr) {
        throw new Error(`leads query failed: ${leadErr.message}`);
      }
      for (const lead of leads ?? []) {
        if (!lead.user_id) unsignedLeadIds.add(lead.id);
      }
    }
  }

  const seenPaths = new Set<string>();

  for (const row of rows) {
    if (deletedCount + failedCount >= maxItems) break;
    if (!row.lead_id || !unsignedLeadIds.has(row.lead_id)) {
      if (row.lead_id && !unsignedLeadIds.has(row.lead_id)) {
        const paths = extractPreSignupStoragePaths(row.meta);
        if (paths.length > 0) skippedSignedUp += 1;
      }
      continue;
    }

    const paths = extractPreSignupStoragePaths(row.meta);
    if (paths.length === 0) continue;

    let rowFailed = false;
    for (const path of paths) {
      if (deletedCount + failedCount >= maxItems) break;
      if (seenPaths.has(path)) continue;
      seenPaths.add(path);

      const { error } = await deleteObject(DOCUMENTS_BUCKET, path);
      if (error) {
        failedCount += 1;
        rowFailed = true;
        continue;
      }
      deletedCount += 1;
    }

    if (!rowFailed && paths.length > 0) {
      const meta = (row.meta ?? {}) as Record<string, unknown>;
      const { error: updErr } = await client
        .from("crm_activities")
        .update({ meta: buildPurgedActivityMeta(meta) })
        .eq("id", row.id);
      if (updErr) {
        failedCount += 1;
      }
    }
  }

  const { error: auditErr } = await client.from("audit_log").insert({
    job_id: jobId,
    action: AUDIT_ACTION,
    meta: { deleted_count: deletedCount, failed_count: failedCount },
  });
  if (auditErr) {
    throw new Error(`audit_log insert failed: ${auditErr.message}`);
  }

  return { jobId, deletedCount, failedCount, skippedSignedUp };
}
