import { createHash, randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { detectEvidenceKind, EVIDENCE_BUCKET, EVIDENCE_MAX_BYTES } from "./evidenceEntry";

export const ORG_DOC_KINDS = ["business_registration", "investment_registration"] as const;
export type OrgDocumentKind = (typeof ORG_DOC_KINDS)[number];

const SIGNED_URL_SECONDS = 120;

async function resolveOrgDocumentActor(
  client: SupabaseClient,
  accessToken: string,
): Promise<
  | { ok: true; userId: string; orgId: string; role: string }
  | { ok: false; status: number; error: string }
> {
  const { data: userData, error: userError } = await client.auth.getUser(accessToken);
  if (userError || !userData.user) return { ok: false, status: 401, error: "UNAUTHENTICATED" };
  const userId = userData.user.id;
  const { data: memberships, error: memberError } = await client
    .from("accounting_org_members")
    .select("org_id, role")
    .eq("user_id", userId);
  if (memberError) return { ok: false, status: 400, error: "MEMBERSHIP_LOOKUP" };
  const rows = memberships ?? [];
  if (rows.length !== 1) return { ok: false, status: 403, error: "ORG_AMBIGUOUS" };
  const orgId = rows[0].org_id as string;
  const role = rows[0].role as string;
  return { ok: true, userId, orgId, role };
}

function mimeForKind(kind: NonNullable<ReturnType<typeof detectEvidenceKind>>): string {
  if (kind === "pdf") return "application/pdf";
  if (kind === "jpeg") return "image/jpeg";
  return "image/png";
}

function extForKind(kind: NonNullable<ReturnType<typeof detectEvidenceKind>>): string {
  if (kind === "pdf") return "pdf";
  if (kind === "jpeg") return "jpg";
  return "png";
}

export async function listOrgDocuments(
  client: SupabaseClient,
  accessToken: string,
  lang: "ko" | "vi" = "ko",
  adminClient?: SupabaseClient,
) {
  const actor = await resolveOrgDocumentActor(client, accessToken);
  if (!actor.ok) return { ok: false as const, status: actor.status, error: actor.error };
  if (actor.role === "company_member") {
    return { ok: false as const, status: 403, error: "FORBIDDEN" };
  }

  const { data: org } = await client
    .from("accounting_organizations")
    .select("approval_status")
    .eq("id", actor.orgId)
    .maybeSingle();
  if (!org) return { ok: false as const, status: 404, error: "NOT_FOUND" };

  const { data, error } = await client
    .from("accounting_org_documents")
    .select("id, doc_kind, uploaded_at, size")
    .eq("org_id", actor.orgId);
  if (error) return { ok: false as const, status: 400, error: "LIST_FAILED" };

  let reviewNote: string | null = null;
  if (org.approval_status === "rejected" && actor.role === "company_owner") {
    const noteClient = adminClient ?? client;
    const { data: note } = await noteClient
      .from("accounting_i18n_texts")
      .select("text, lang")
      .eq("org_id", actor.orgId)
      .eq("entity_type", "organization")
      .eq("entity_id", actor.orgId)
      .eq("field", "review_note")
      .eq("lang", lang)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    reviewNote = (note?.text as string) ?? null;
  }

  return {
    ok: true as const,
    approvalStatus: org.approval_status as string,
    items: (data ?? []).map((row) => ({
      id: row.id as string,
      docKind: row.doc_kind as OrgDocumentKind,
      uploadedAt: row.uploaded_at as string,
      size: row.size as number,
    })),
    reviewNote,
  };
}

export async function uploadOrgDocument(
  userClient: SupabaseClient,
  adminClient: SupabaseClient,
  accessToken: string,
  docKind: OrgDocumentKind,
  body: Buffer,
  declaredMime: string | null,
) {
  if (!ORG_DOC_KINDS.includes(docKind)) {
    return { ok: false as const, status: 422, error: "INVALID_KIND" };
  }
  const actor = await resolveOrgDocumentActor(userClient, accessToken);
  if (!actor.ok) return { ok: false as const, status: actor.status, error: actor.error };
  if (actor.role !== "company_owner") {
    return { ok: false as const, status: 403, error: "OWNER_ONLY" };
  }
  if (body.length > EVIDENCE_MAX_BYTES) {
    return { ok: false as const, status: 413, error: "FILE_TOO_LARGE" };
  }
  const kind = detectEvidenceKind(body);
  if (!kind) return { ok: false as const, status: 415, error: "UNSUPPORTED_FORMAT" };

  const sha256 = createHash("sha256").update(body).digest("hex");
  const fileId = randomUUID();
  const storagePath = `${actor.orgId}/org-docs/${docKind}/${fileId}.${extForKind(kind)}`;
  const mime = declaredMime && declaredMime.length > 0 ? declaredMime : mimeForKind(kind);

  const { error: storageError } = await userClient.storage
    .from(EVIDENCE_BUCKET)
    .upload(storagePath, body, { contentType: mime, upsert: true });
  if (storageError) return { ok: false as const, status: 400, error: "STORAGE_FAILED" };

  const { data: row, error: upsertError } = await userClient
    .from("accounting_org_documents")
    .upsert(
      {
        org_id: actor.orgId,
        doc_kind: docKind,
        storage_path: storagePath,
        sha256,
        mime,
        size: body.length,
        uploaded_by: actor.userId,
      },
      { onConflict: "org_id,doc_kind" },
    )
    .select("id")
    .single();
  if (upsertError || !row) {
    await userClient.storage.from(EVIDENCE_BUCKET).remove([storagePath]);
    return { ok: false as const, status: 400, error: "INSERT_FAILED" };
  }

  return { ok: true as const, id: row.id as string, sha256 };
}

export async function createOrgDocumentSignedUrl(
  userClient: SupabaseClient,
  adminClient: SupabaseClient,
  accessToken: string,
  documentId: string,
  expiresIn = SIGNED_URL_SECONDS,
) {
  const { data: userData, error: userError } = await userClient.auth.getUser(accessToken);
  if (userError || !userData.user) return { ok: false as const, status: 401, error: "UNAUTHENTICATED" };

  const { data: row, error } = await userClient
    .from("accounting_org_documents")
    .select("id, storage_path, org_id")
    .eq("id", documentId)
    .maybeSingle();
  if (error || !row) return { ok: false as const, status: 404, error: "NOT_FOUND" };

  const { data: signed, error: signError } = await adminClient.storage
    .from(EVIDENCE_BUCKET)
    .createSignedUrl(row.storage_path as string, expiresIn);
  if (signError || !signed?.signedUrl) {
    return { ok: false as const, status: 400, error: "SIGN_FAILED" };
  }

  return { ok: true as const, url: signed.signedUrl };
}

export async function requestOrgApprovalReview(userClient: SupabaseClient, accessToken: string) {
  const actor = await resolveOrgDocumentActor(userClient, accessToken);
  if (!actor.ok) return { ok: false as const, status: actor.status, error: actor.error };
  if (actor.role !== "company_owner") {
    return { ok: false as const, status: 403, error: "OWNER_ONLY" };
  }
  const { error } = await userClient.rpc("accounting_org_request_review", { p_org_id: actor.orgId });
  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("both registration")) {
      return { ok: false as const, status: 422, error: "DOCUMENTS_REQUIRED" };
    }
    if (msg.includes("cannot request")) {
      return { ok: false as const, status: 409, error: "INVALID_STATUS" };
    }
    return { ok: false as const, status: 400, error: "REQUEST_FAILED" };
  }
  return { ok: true as const, approvalStatus: "in_review" as const };
}
