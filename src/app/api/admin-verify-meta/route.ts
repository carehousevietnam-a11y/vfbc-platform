import { NextRequest, NextResponse } from "next/server";
import { verifyOwnedLead } from "@/lib/aiCaseContext";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY,
  ADMIN_PHASE2_EVIDENCE_ATTACHED_META_KEY,
  ADMIN_PHASE2_EVIDENCE_FILE_NAME_META_KEY,
  ADMIN_PHASE2_EVIDENCE_STORAGE_PATH_META_KEY,
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  ADMIN_VERIFY_PROFILE_PHASE_META_KEY,
} from "@/lib/adminVerifyProfiling";

const ADMIN_VERIFY_SERVICE_TYPE = "verify_admin";
const REAL_ESTATE_VERIFY_SERVICE_TYPE = "verify_real-estate";
const TAX_VERIFY_SERVICE_TYPE = "verify_tax";
const FRAUD_VERIFY_SERVICE_TYPE = "verify_fraud";
const UNCLEAR_VERIFY_SERVICE_TYPE = "verify_unclear";
const TRC_VERIFY_SERVICE_TYPE = "verify_trc";
const WP_VERIFY_SERVICE_TYPE = "verify_wp";
const TAMTRU_VERIFY_SERVICE_TYPE = "verify_tamtru";
const LICENSE_VERIFY_SERVICE_TYPE = "verify_license";
const COMPANY_VERIFY_SERVICE_TYPE = "verify_company";
const RESTAURANT_VERIFY_SERVICE_TYPE = "verify_restaurant";
const HYGIENE_VERIFY_SERVICE_TYPE = "verify_hygiene";
const FIRE_VERIFY_SERVICE_TYPE = "verify_fire";
const COSMETICS_VERIFY_SERVICE_TYPE = "verify_cosmetics";
const ENVIRONMENT_VERIFY_SERVICE_TYPE = "verify_environment";
const MEDICAL_VERIFY_SERVICE_TYPE = "verify_medical";
const FRANCHISE_VERIFY_SERVICE_TYPE = "verify_franchise";
const VERIFY_LEAD_ACTION = "verify_lead";
const MAX_META_VALUE_LENGTH = 200_000;

/** Keys produced by buildAdminPhase2PersistMeta / buildReviewPage1Meta / serializeCaseResolutionProfile */
const REAL_ESTATE_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS = new Set<string>([
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  ADMIN_VERIFY_PROFILE_PHASE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_META_KEY,
  "real_estate_pack_v1",
  "real_estate_pack_case_id",
  "real_estate_pack_grade2",
  "real_estate_pack_phase2_summary",
  "real_estate_pack_caution_count",
  "real_estate_pack_headline",
]);

const TAX_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS = new Set<string>([
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  ADMIN_VERIFY_PROFILE_PHASE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_META_KEY,
  "tax_pack_v1",
  "tax_pack_case_id",
  "tax_pack_grade2",
  "tax_pack_phase2_summary",
  "tax_pack_caution_count",
  "tax_pack_headline",
]);

const FRAUD_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS = new Set<string>([
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  ADMIN_VERIFY_PROFILE_PHASE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_META_KEY,
  "fraud_pack_v1",
  "fraud_pack_case_id",
  "fraud_pack_phase2_summary",
  "fraud_pack_headline",
]);

const UNCLEAR_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS = new Set<string>([
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  ADMIN_VERIFY_PROFILE_PHASE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_META_KEY,
  "unclear_pack_v1",
  "unclear_pack_case_id",
  "unclear_pack_phase2_summary",
  "unclear_pack_headline",
]);

const TRC_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS = new Set<string>([
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  ADMIN_VERIFY_PROFILE_PHASE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_META_KEY,
  "trc_pack_v1",
  "trc_pack_case_id",
  "trc_pack_phase2_summary",
  "trc_pack_headline",
]);

const WP_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS = new Set<string>([
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  ADMIN_VERIFY_PROFILE_PHASE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_META_KEY,
  "wp_pack_v1",
  "wp_pack_case_id",
  "wp_pack_phase2_summary",
  "wp_pack_headline",
]);

const TAMTRU_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS = new Set<string>([
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  ADMIN_VERIFY_PROFILE_PHASE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_META_KEY,
  "tamtru_pack_v1",
  "tamtru_pack_case_id",
  "tamtru_pack_phase2_summary",
  "tamtru_pack_headline",
]);

const LICENSE_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS = new Set<string>([
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  ADMIN_VERIFY_PROFILE_PHASE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_META_KEY,
  "license_pack_v1",
  "license_pack_case_id",
  "license_pack_phase2_summary",
  "license_pack_headline",
]);

const COMPANY_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS = new Set<string>([
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  ADMIN_VERIFY_PROFILE_PHASE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_META_KEY,
  "company_pack_v1",
  "company_pack_case_id",
  "company_pack_phase2_summary",
  "company_pack_headline",
]);

const RESTAURANT_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS = new Set<string>([
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  ADMIN_VERIFY_PROFILE_PHASE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_META_KEY,
  "restaurant_pack_v1",
  "restaurant_pack_case_id",
  "restaurant_pack_phase2_summary",
  "restaurant_pack_headline",
]);

const HYGIENE_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS = new Set<string>([
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  ADMIN_VERIFY_PROFILE_PHASE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_META_KEY,
  "hygiene_pack_v1",
  "hygiene_pack_case_id",
  "hygiene_pack_phase2_summary",
  "hygiene_pack_headline",
]);

const FIRE_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS = new Set<string>([
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  ADMIN_VERIFY_PROFILE_PHASE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_META_KEY,
  "fire_pack_v1",
  "fire_pack_case_id",
  "fire_pack_phase2_summary",
  "fire_pack_headline",
]);

const COSMETICS_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS = new Set<string>([
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  ADMIN_VERIFY_PROFILE_PHASE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_META_KEY,
  "cosmetics_pack_v1",
  "cosmetics_pack_case_id",
  "cosmetics_pack_phase2_summary",
  "cosmetics_pack_headline",
]);

const ENVIRONMENT_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS = new Set<string>([
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  ADMIN_VERIFY_PROFILE_PHASE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_META_KEY,
  "environment_pack_v1",
  "environment_pack_case_id",
  "environment_pack_phase2_summary",
  "environment_pack_headline",
]);

const MEDICAL_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS = new Set<string>([
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  ADMIN_VERIFY_PROFILE_PHASE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_META_KEY,
  "medical_pack_v1",
  "medical_pack_case_id",
  "medical_pack_phase2_summary",
  "medical_pack_headline",
]);

const FRANCHISE_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS = new Set<string>([
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  ADMIN_VERIFY_PROFILE_PHASE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_META_KEY,
  "franchise_pack_v1",
  "franchise_pack_case_id",
  "franchise_pack_phase2_summary",
  "franchise_pack_headline",
]);

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
  ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_META_KEY,
]);

function sanitizePartialMeta(
  input: unknown,
  allowedKeys: Set<string>,
): { ok: true; meta: Record<string, string> } | { ok: false; message: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, message: "partialMeta must be an object." };
  }

  const meta: Record<string, string> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (!allowedKeys.has(key)) {
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

    const isAdminLead = lead.service_type === ADMIN_VERIFY_SERVICE_TYPE;
    const isRealEstateLead = lead.service_type === REAL_ESTATE_VERIFY_SERVICE_TYPE;
    const isTaxLead = lead.service_type === TAX_VERIFY_SERVICE_TYPE;
    const isFraudLead = lead.service_type === FRAUD_VERIFY_SERVICE_TYPE;
    const isUnclearLead = lead.service_type === UNCLEAR_VERIFY_SERVICE_TYPE;
    const isTrcLead = lead.service_type === TRC_VERIFY_SERVICE_TYPE;
    const isWpLead = lead.service_type === WP_VERIFY_SERVICE_TYPE;
    const isTamtruLead = lead.service_type === TAMTRU_VERIFY_SERVICE_TYPE;
    const isLicenseLead = lead.service_type === LICENSE_VERIFY_SERVICE_TYPE;
    const isCompanyLead = lead.service_type === COMPANY_VERIFY_SERVICE_TYPE;
    const isRestaurantLead = lead.service_type === RESTAURANT_VERIFY_SERVICE_TYPE;
    const isHygieneLead = lead.service_type === HYGIENE_VERIFY_SERVICE_TYPE;
    const isFireLead = lead.service_type === FIRE_VERIFY_SERVICE_TYPE;
    const isCosmeticsLead = lead.service_type === COSMETICS_VERIFY_SERVICE_TYPE;
    const isEnvironmentLead = lead.service_type === ENVIRONMENT_VERIFY_SERVICE_TYPE;
    const isMedicalLead = lead.service_type === MEDICAL_VERIFY_SERVICE_TYPE;
    const isFranchiseLead = lead.service_type === FRANCHISE_VERIFY_SERVICE_TYPE;
    if (!isAdminLead && !isRealEstateLead && !isTaxLead && !isFraudLead && !isUnclearLead && !isTrcLead && !isWpLead && !isTamtruLead && !isLicenseLead && !isCompanyLead && !isRestaurantLead && !isHygieneLead && !isFireLead && !isCosmeticsLead && !isEnvironmentLead && !isMedicalLead && !isFranchiseLead) {
      return NextResponse.json(
        {
          error: "지원하지 않는 검토 건입니다.",
          reason: "forbidden",
          message: "지원하지 않는 검토 건입니다.",
        },
        { status: 403 },
      );
    }

    const allowedKeys = isAdminLead
      ? ADMIN_PHASE2_PERSIST_ALLOWED_META_KEYS
      : isRealEstateLead
        ? REAL_ESTATE_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS
        : isFraudLead
          ? FRAUD_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS
          : isUnclearLead
            ? UNCLEAR_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS
            : isTrcLead
              ? TRC_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS
              : isWpLead
                ? WP_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS
                : isTamtruLead
                  ? TAMTRU_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS
                  : isLicenseLead
                    ? LICENSE_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS
                    : isCompanyLead
                      ? COMPANY_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS
                      : isRestaurantLead
                        ? RESTAURANT_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS
                        : isHygieneLead
                          ? HYGIENE_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS
                          : isFireLead
                            ? FIRE_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS
                            : isCosmeticsLead
                              ? COSMETICS_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS
                              : isEnvironmentLead
                                ? ENVIRONMENT_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS
                                : isMedicalLead
                                  ? MEDICAL_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS
                                  : isFranchiseLead
                                    ? FRANCHISE_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS
                                    : TAX_PACK_PHASE2_PERSIST_ALLOWED_META_KEYS;

    const sanitized = sanitizePartialMeta(body.partialMeta, allowedKeys);
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
