import { NextRequest, NextResponse } from "next/server";
import { verifyOwnedLead } from "@/lib/aiCaseContext";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  ADMIN_PHASE2_EVIDENCE_ATTACHED_META_KEY,
  ADMIN_PHASE2_EVIDENCE_FILE_NAME_META_KEY,
  ADMIN_PHASE2_EVIDENCE_STORAGE_PATH_META_KEY,
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  ADMIN_VERIFY_PROFILE_PHASE_META_KEY,
} from "@/lib/adminVerifyProfiling";

const ADMIN_VERIFY_SERVICE_TYPE = "verify_admin";
const VERIFY_LEAD_ACTION = "verify_lead";
const MAX_META_VALUE_LENGTH = 200_000;

/** Keys produced by buildAdminPhase2PersistMeta / buildReviewPage1Meta / serializeCaseResolutionProfile */
const ADMIN_PHASE2_PERSIST_ALLOWED_META_KEYS = new Set<string>([
  "review_check_stage",
  "review_check_docs",
  "review_check_translation",
  "review_check_deadline",
  "review_check_deadline_followup",
  "review_check_content",
  "review_check_content_followup",
  "review_check_docs_followup",
  "review_check_format_proof",
  "review_check_format_proof_followup",
  "review_check_submission",
  "review_check_submission_followup",
  "case_resolution_json",
  "case_resolution_classification",
  "case_resolution_anchor",
  "case_resolution_confidence",
  "case_customer_input",
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  ADMIN_VERIFY_PROFILE_PHASE_META_KEY,
  ADMIN_PHASE2_EVIDENCE_ATTACHED_META_KEY,
  ADMIN_PHASE2_EVIDENCE_FILE_NAME_META_KEY,
  ADMIN_PHASE2_EVIDENCE_STORAGE_PATH_META_KEY,
]);

function sanitizePartialMeta(
  input: unknown,
): { ok: true; meta: Record<string, string> } | { ok: false; message: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, message: "partialMeta must be an object." };
  }

  const meta: Record<string, string> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (!ADMIN_PHASE2_PERSIST_ALLOWED_META_KEYS.has(key)) {
      return { ok: false, message: `Disallowed meta key: ${key}` };
    }
    if (typeof value !== "string") {
      return { ok: false, message: `Meta value for ${key} must be a string.` };
    }
    if (value.length > MAX_META_VALUE_LENGTH) {
      return { ok: false, message: `Meta value for ${key} exceeds size limit.` };
    }
    meta[key] = value;
  }

  if (Object.keys(meta).length === 0) {
    return { ok: false, message: "partialMeta is empty." };
  }

  return { ok: true, meta };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      accessToken?: string;
      leadId?: string;
      partialMeta?: unknown;
    };

    const { accessToken, leadId } = body;
    const ownership = await verifyOwnedLead(accessToken, leadId);
    if (!ownership.ok) {
      return NextResponse.json(
        {
          error: ownership.error,
          reason: ownership.status === 401 ? "unauthorized" : "not_found",
          message: ownership.error,
        },
        { status: ownership.status },
      );
    }

    const { data: lead, error: leadError } = await supabaseAdmin
      .from("leads")
      .select("id, service_type")
      .eq("id", leadId as string)
      .eq("user_id", ownership.userId)
      .maybeSingle();

    if (leadError || !lead) {
      return NextResponse.json(
        {
          error: "신청 건을 찾을 수 없습니다.",
          reason: "not_found",
          message: "신청 건을 찾을 수 없습니다.",
        },
        { status: 404 },
      );
    }

    if (lead.service_type !== ADMIN_VERIFY_SERVICE_TYPE) {
      return NextResponse.json(
        {
          error: "행정문서 검토 건이 아닙니다.",
          reason: "forbidden",
          message: "행정문서 검토 건이 아닙니다.",
        },
        { status: 403 },
      );
    }

    const sanitized = sanitizePartialMeta(body.partialMeta);
    if (!sanitized.ok) {
      return NextResponse.json(
        {
          error: sanitized.message,
          reason: "validation_error",
          message: sanitized.message,
        },
        { status: 400 },
      );
    }

    const { data: activity, error: fetchError } = await supabaseAdmin
      .from("crm_activities")
      .select("id, meta")
      .eq("lead_id", leadId as string)
      .eq("action", VERIFY_LEAD_ACTION)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError || !activity?.id) {
      console.error("[admin-verify-meta] activity lookup failed:", fetchError);
      return NextResponse.json(
        {
          error: "verify_lead activity not found",
          reason: "no_activity",
          message: "Phase 2 진행 상태를 저장할 접수 기록을 찾을 수 없습니다.",
          serverError: fetchError?.message,
        },
        { status: 404 },
      );
    }

    const existingMeta =
      activity.meta && typeof activity.meta === "object"
        ? (activity.meta as Record<string, unknown>)
        : {};

    const { error: updateError } = await supabaseAdmin
      .from("crm_activities")
      .update({
        meta: {
          ...existingMeta,
          ...sanitized.meta,
        },
      })
      .eq("id", activity.id);

    if (updateError) {
      console.error("[admin-verify-meta] crm_activities update failed:", updateError);
      return NextResponse.json(
        {
          error: "crm_activities update failed",
          reason: "update_failed",
          message: "Phase 2 진행 상태 저장 중 서버 오류가 발생했습니다.",
          serverError: updateError.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin-verify-meta] route error:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        reason: "update_failed",
        message: "Phase 2 진행 상태 저장 중 서버 오류가 발생했습니다.",
        serverError: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
