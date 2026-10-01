import type { ReviewAnswers } from "@/components/cost-check/MasterReviewQuotationReport";
import {
  ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY,
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  CASE_RESOLUTION_META_JSON_KEY,
  buildCaseResolutionProfile,
  deserializeCaseResolutionProfile,
} from "@/lib/adminVerifyProfiling";
import {
  buildPhase1RiskSummaryLinesFromManifest,
  buildPhase2RiskSummaryLinesFromManifest,
} from "@/lib/adminVerifyJudgmentRuntime";

export type CrmActivityLike = {
  action: string | null;
  meta: unknown;
  tag?: string | null;
  created_at?: string;
};

function asMeta(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function findLatestMetaString(activities: CrmActivityLike[], key: string): string | null {
  for (let i = activities.length - 1; i >= 0; i -= 1) {
    const raw = asMeta(activities[i]?.meta)?.[key];
    if (typeof raw === "string" && raw.trim()) return raw.trim();
  }
  return null;
}

export function isAdminPhase2DocumentsUploadComplete(activities: CrmActivityLike[]): boolean {
  return findLatestMetaString(activities, ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY) === "1";
}

export function shouldIncludeAdminPhase2PdfSection(activities: CrmActivityLike[]): boolean {
  return isAdminPhase2DocumentsUploadComplete(activities);
}

export function parseAdminVerifyAnswersFromActivities(
  activities: CrmActivityLike[],
): ReviewAnswers {
  const raw = findLatestMetaString(activities, ADMIN_VERIFY_ANSWERS_META_JSON_KEY);
  if (!raw || raw === "{}") return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function buildAdminPhase2SummaryLinesFromActivities(
  activities: CrmActivityLike[],
): string[] {
  const answers = parseAdminVerifyAnswersFromActivities(activities);
  if (Object.keys(answers).length === 0) return [];
  const profile =
    deserializeCaseResolutionProfile({
      [CASE_RESOLUTION_META_JSON_KEY]:
        findLatestMetaString(activities, CASE_RESOLUTION_META_JSON_KEY) ?? "",
    }) ?? buildCaseResolutionProfile(answers);
  return buildPhase2RiskSummaryLinesFromManifest(answers, profile)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function buildAdminPhase1SummaryLinesFromActivities(
  activities: CrmActivityLike[],
): string[] {
  const answers = parseAdminVerifyAnswersFromActivities(activities);
  if (Object.keys(answers).length === 0) return [];
  const profile =
    deserializeCaseResolutionProfile({
      [CASE_RESOLUTION_META_JSON_KEY]:
        findLatestMetaString(activities, CASE_RESOLUTION_META_JSON_KEY) ?? "",
    }) ?? buildCaseResolutionProfile(answers);
  return buildPhase1RiskSummaryLinesFromManifest(answers, profile);
}

export type AdminPhase2UploadRef = {
  tag: string;
  fileName: string;
  storagePath: string;
};

export function listAdminPhase2DocumentUploadRefs(
  activities: CrmActivityLike[],
  leadId: string,
): AdminPhase2UploadRef[] {
  const prefix = `document-upload/${leadId}/`;
  const refs: AdminPhase2UploadRef[] = [];
  for (const row of activities) {
    if (row.action !== "document_upload") continue;
    const meta = asMeta(row.meta);
    const storagePath = typeof meta?.storagePath === "string" ? meta.storagePath : "";
    const fileName = typeof meta?.fileName === "string" ? meta.fileName : "";
    if (!storagePath.startsWith(prefix) || !fileName.trim()) continue;
    refs.push({
      tag: typeof row.tag === "string" && row.tag.trim() ? row.tag : fileName,
      fileName,
      storagePath,
    });
  }
  return refs;
}

export function shouldSendAiReportConfirmEmail(
  tag: string,
  alreadyHadRequest: boolean,
): boolean {
  if (tag === "VERIFY_ADMIN" && alreadyHadRequest) return false;
  return true;
}

export function shouldInsertExpertReviewRequest(alreadyHadRequest: boolean): boolean {
  return !alreadyHadRequest;
}

export type MypageLayoutItemLike = {
  serviceType?: string | null;
  phase2Complete?: boolean;
  hasDiagnosis?: boolean;
  hasAgency?: boolean;
  hasExpertReview?: boolean;
  result?: string | null;
  feasibilityScore?: number | null;
};

export function isVerifyAdminPaidMypageItem(item: MypageLayoutItemLike): boolean {
  return item.serviceType === "verify_admin" && item.phase2Complete === true;
}

/** verify_admin 유료는 대시보드(expertFlow) 레이아웃을 사용한다. */
export function shouldUseGeneralCustomerMypageLayout(item: MypageLayoutItemLike): boolean {
  const ai =
    Boolean(item.hasDiagnosis) ||
    item.result != null ||
    typeof item.feasibilityScore === "number";
  const expert = Boolean(item.hasAgency) || Boolean(item.hasExpertReview);
  if (isVerifyAdminPaidMypageItem(item)) return false;
  return ai && !expert;
}

export function shouldUseVerifyAdminPaidDashboard(item: MypageLayoutItemLike): boolean {
  return isVerifyAdminPaidMypageItem(item);
}
