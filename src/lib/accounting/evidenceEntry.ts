import { createHash, randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export const EVIDENCE_MAX_BYTES = 10 * 1024 * 1024;

async function resolveAccountingActor(
  client: SupabaseClient,
  accessToken: string
): Promise<{ ok: true; userId: string; orgId: string; role: string } | { ok: false; status: number; error: string }> {
  const { data: userData, error: userError } = await client.auth.getUser(accessToken);
  if (userError || !userData.user) return { ok: false, status: 401, error: "UNAUTHENTICATED" };
  const userId = userData.user.id;
  const { data: memberships, error: memberError } = await client
    .from("accounting_org_members")
    .select("org_id, role")
    .eq("user_id", userId);
  if (memberError) return { ok: false, status: 400, error: "MEMBERSHIP_LOOKUP" };
  const rows = memberships ?? [];
  if (rows.length === 0) return { ok: false, status: 403, error: "NO_ORG" };
  const { data: orgs, error: orgError } = await client
    .from("accounting_organizations")
    .select("id, approval_status")
    .in(
      "id",
      rows.map((row) => row.org_id as string)
    );
  if (orgError) return { ok: false, status: 400, error: "ORG_LOOKUP" };
  const approved = (orgs ?? []).filter((org) => org.approval_status === "approved");
  if (approved.length === 0) return { ok: false, status: 403, error: "ORG_NOT_APPROVED" };
  if (approved.length > 1) return { ok: false, status: 409, error: "ORG_AMBIGUOUS" };
  const orgId = approved[0].id as string;
  const role = rows.find((row) => row.org_id === orgId)?.role as string | undefined;
  if (!role) return { ok: false, status: 403, error: "NO_ORG" };
  return { ok: true, userId, orgId, role };
}
export const EVIDENCE_BUCKET = "accounting_evidence";
const SIGNED_URL_SECONDS = 60;

export type EvidenceKind = "pdf" | "jpeg" | "png";

export type EvidenceUploadResult =
  | { ok: true; id: string; sha256: string }
  | { ok: false; status: number; error: string };

export type EvidenceListResult =
  | { ok: true; items: { id: string; uploadedAt: string; displayName: string | null }[] }
  | { ok: false; status: number; error: string };

export type EvidenceSignedUrlResult =
  | { ok: true; url: string }
  | { ok: false; status: number; error: string };

export function detectEvidenceKind(buffer: Buffer): EvidenceKind | null {
  if (buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return "pdf";
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "png";
  }
  return null;
}

function mimeForKind(kind: EvidenceKind): string {
  if (kind === "pdf") return "application/pdf";
  if (kind === "jpeg") return "image/jpeg";
  return "image/png";
}

function extForKind(kind: EvidenceKind): string {
  if (kind === "pdf") return "pdf";
  if (kind === "jpeg") return "jpg";
  return "png";
}

function normalizeDisplayName(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.replace(/[\r\n]/g, " ").trim().slice(0, 200);
  return trimmed.length > 0 ? trimmed : null;
}

export async function uploadEvidence(
  userClient: SupabaseClient,
  adminClient: SupabaseClient,
  accessToken: string,
  txnId: string,
  body: Buffer,
  declaredMime: string | null,
  displayNameInput: string | null,
  spoofOrgId?: string | null
): Promise<EvidenceUploadResult> {
  void spoofOrgId;
  const actor = await resolveAccountingActor(userClient, accessToken);
  if (!actor.ok) return { ok: false, status: actor.status, error: actor.error };

  if (body.length > EVIDENCE_MAX_BYTES) {
    return { ok: false, status: 413, error: "FILE_TOO_LARGE" };
  }
  const kind = detectEvidenceKind(body);
  if (!kind) return { ok: false, status: 422, error: "FILE_TYPE_INVALID" };
  const mime = mimeForKind(kind);
  if (declaredMime && declaredMime !== mime && declaredMime !== "image/jpg") {
    return { ok: false, status: 422, error: "FILE_TYPE_MISMATCH" };
  }

  const { data: txn, error: txnError } = await userClient
    .from("accounting_transactions")
    .select("id, org_id")
    .eq("id", txnId)
    .eq("org_id", actor.orgId)
    .maybeSingle();
  if (txnError || !txn) return { ok: false, status: 404, error: "TXN_NOT_FOUND" };

  const fileId = randomUUID();
  const storagePath = `${actor.orgId}/${txnId}/${fileId}.${extForKind(kind)}`;
  const sha256 = createHash("sha256").update(body).digest("hex");
  const displayName = normalizeDisplayName(displayNameInput);

  const { error: storageError } = await adminClient.storage
    .from(EVIDENCE_BUCKET)
    .upload(storagePath, body, { contentType: mime, upsert: false });
  if (storageError) return { ok: false, status: 400, error: "STORAGE_FAILED" };

  const { data: row, error: insertError } = await userClient
    .from("accounting_evidence_files")
    .insert({
      id: fileId,
      org_id: actor.orgId,
      txn_id: txnId,
      storage_path: storagePath,
      sha256,
      mime,
      size: body.length,
      uploaded_by: actor.userId,
      display_name: displayName,
    })
    .select("id")
    .single();
  if (insertError || !row) {
    await adminClient.storage.from(EVIDENCE_BUCKET).remove([storagePath]);
    return { ok: false, status: 400, error: "INSERT_FAILED" };
  }

  const { count } = await userClient
    .from("accounting_audit_log")
    .select("id", { count: "exact", head: true })
    .eq("entity_id", fileId)
    .eq("entity", "accounting_evidence_files");
  if ((count ?? 0) < 1) {
    return { ok: false, status: 500, error: "AUDIT_MISSING" };
  }

  return { ok: true, id: row.id as string, sha256 };
}

export async function listEvidenceForTxn(
  userClient: SupabaseClient,
  accessToken: string,
  txnId: string
): Promise<EvidenceListResult> {
  const actor = await resolveAccountingActor(userClient, accessToken);
  if (!actor.ok) return { ok: false, status: actor.status, error: actor.error };

  const { data: txn } = await userClient
    .from("accounting_transactions")
    .select("id")
    .eq("id", txnId)
    .eq("org_id", actor.orgId)
    .maybeSingle();
  if (!txn) return { ok: false, status: 404, error: "TXN_NOT_FOUND" };

  const { data, error } = await userClient
    .from("accounting_evidence_files")
    .select("id, uploaded_at, display_name")
    .eq("org_id", actor.orgId)
    .eq("txn_id", txnId)
    .order("uploaded_at", { ascending: false });
  if (error) return { ok: false, status: 400, error: "LIST_FAILED" };
  return {
    ok: true,
    items: (data ?? []).map((row) => ({
      id: row.id as string,
      uploadedAt: row.uploaded_at as string,
      displayName: (row.display_name as string | null) ?? null,
    })),
  };
}

export async function createEvidenceSignedUrl(
  userClient: SupabaseClient,
  adminClient: SupabaseClient,
  accessToken: string,
  evidenceId: string
): Promise<EvidenceSignedUrlResult> {
  const actor = await resolveAccountingActor(userClient, accessToken);
  if (!actor.ok) return { ok: false, status: actor.status, error: actor.error };

  const { data: row, error } = await userClient
    .from("accounting_evidence_files")
    .select("id, storage_path, org_id")
    .eq("id", evidenceId)
    .eq("org_id", actor.orgId)
    .maybeSingle();
  if (error || !row) return { ok: false, status: 404, error: "NOT_FOUND" };

  const { data: signed, error: signError } = await adminClient.storage
    .from(EVIDENCE_BUCKET)
    .createSignedUrl(row.storage_path as string, SIGNED_URL_SECONDS);
  if (signError || !signed?.signedUrl) return { ok: false, status: 400, error: "SIGN_FAILED" };
  return { ok: true, url: signed.signedUrl };
}
