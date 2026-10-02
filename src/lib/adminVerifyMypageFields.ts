import type { ReviewAnswers } from "@/components/cost-check/MasterReviewQuotationReport";
import { buildAdminVerifyResponseSummaryBlock } from "@/lib/adminVerifyResponseSummary";
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

export const VERIFY_ADMIN_AI_REPORT_RECEIVE_LABEL = "AI 리포트 받기";
export const VERIFY_ADMIN_EXPERT_REVIEWING_LABEL = "담당 전문가가 검토 중입니다";

const EXPERT_TIMELINE_LABEL_MARKERS = ["전문가"];

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

/** F-5/F-6: 유료 CTA — AI는 AiResultCard, 전문가는 CurrentStatusCard, 상단 ActionRow 없음 */
export function verifyAdminPaidMypageShowsTopActionRow(): boolean {
  return false;
}

export function verifyAdminPaidMypageUsesDualCardLayout(): boolean {
  return true;
}

export function verifyAdminPaidAiReportCtaInAiResultCard(): boolean {
  return true;
}

export function verifyAdminPaidExpertCtaInCurrentStatusCard(): boolean {
  return true;
}

/** @deprecated use verifyAdminPaidAiReportCtaInAiResultCard */
export function verifyAdminPaidMypageUsesAiResultCardActions(): boolean {
  return verifyAdminPaidAiReportCtaInAiResultCard();
}

export const VERIFY_ADMIN_PAID_STATUS_TEAM_LABEL = "VFBCAI 법률전문가팀";
export const VERIFY_ADMIN_PAID_STATUS_GUIDE_BEFORE =
  "AI 분석 결과를 바탕으로 전문가가 직접 다음 대응 방향을 안내해 드립니다.";
export const VERIFY_ADMIN_PAID_STATUS_GUIDE_AFTER =
  "담당 전문가가 제출하신 자료를 검토하고 있습니다.";
export const VERIFY_ADMIN_PAID_STATUS_BADGE_BEFORE = "연결 대기";
export const VERIFY_ADMIN_PAID_STATUS_BADGE_AFTER = "담당 전문가";
export const VERIFY_ADMIN_PAID_STATUS_NEXT_STEP_BEFORE = "전문가 진행 요청";
export const VERIFY_ADMIN_PAID_STATUS_NEXT_STEP_AFTER = "전문가 안내 대기 준비";
export const VERIFY_ADMIN_PAID_STATUS_ESTIMATE_BEFORE = "요청 후 2~5 영업일";
export const VERIFY_ADMIN_PAID_STATUS_ESTIMATE_AFTER = "2~5 영업일";
export const VERIFY_ADMIN_PAID_STATUS_FOOTER_AFTER = "전문가에게 전달되어 진행 중입니다";

/** F-7: 요청 전·후 동일 카드 구조(전문가 박스 + 2칸 타일 + 하단 CTA/상태) */
export function verifyAdminPaidStatusCardUsesUnifiedStructure(): boolean {
  return true;
}

/** @deprecated F-7 single-line guide */
export const VERIFY_ADMIN_PAID_EXPERT_HOOK_LINE1 = VERIFY_ADMIN_PAID_STATUS_GUIDE_BEFORE;
/** @deprecated F-7 */
export const VERIFY_ADMIN_PAID_EXPERT_HOOK_LINE2 = "";

function profileFieldValueFromResolution(field: unknown): string | null {
  if (!field || typeof field !== "object") return null;
  const value = (field as { value?: unknown }).value;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export type AdminVerifyAiReportContent = {
  execSummary: string[];
  keyFindings: string[];
  keyRisks: string[];
  recommendedAction: string[];
  riskCount: number;
  reviewedCount: number;
  satisfiedCount: number;
  includesPhase2Block: boolean;
};

/** verify_admin My Page AI 리포트 PDF 본문(기존 1차/2차 섹션 구조 유지). */
export function buildAdminVerifyAiReportContentFromActivities(
  activities: CrmActivityLike[],
  leadId: string,
): AdminVerifyAiReportContent | null {
  const profileRaw = findLatestMetaString(activities, CASE_RESOLUTION_META_JSON_KEY);
  if (!profileRaw) return null;
  try {
    const profile = JSON.parse(profileRaw) as Record<string, unknown>;
    const goal = profileFieldValueFromResolution(profile.goal);
    const riskSignals =
      Array.isArray(profile.riskSignals) && profile.riskSignals.length > 0
        ? (profile.riskSignals as string[]).slice(0, 3)
        : [];
    const execSummary = [
      riskSignals.length > 0
        ? `결론 · 확인이 필요한 위험요인 ${riskSignals.length}건이 있어 서류 원본 검토가 필요합니다.`
        : "결론 · 입력하신 내용 기준으로 즉시 대응이 필요한 위험요인은 확인되지 않았습니다.",
      goal ? `확인 목적 · ${goal}` : null,
      profileFieldValueFromResolution(profile.document)
        ? `문서 · ${profileFieldValueFromResolution(profile.document)}`
        : "문서 · 제출 정보 기준으로 1차 확인했습니다.",
    ].filter((line): line is string => Boolean(line));

    const keyFindings: string[] = ["■ 1차 확인 사항"];
    for (const [label, key] of [
      ["사건 앵커", "caseAnchor"],
      ["관련 기관", "authority"],
      ["문서", "document"],
      ["확인 목적", "goal"],
      ["현재 단계", "currentStage"],
    ] as const) {
      const val = profileFieldValueFromResolution(profile[key]);
      if (val) keyFindings.push(`✓ ${label} · ${val}`);
    }

    const answers = parseAdminVerifyAnswersFromActivities(activities);
    const resolutionProfile =
      deserializeCaseResolutionProfile({
        [CASE_RESOLUTION_META_JSON_KEY]: profileRaw,
      }) ?? buildCaseResolutionProfile(answers);
    for (const line of buildPhase1RiskSummaryLinesFromManifest(answers, resolutionProfile)) {
      const trimmed = line.trim();
      if (trimmed) keyFindings.push(`✓ ${trimmed}`);
    }

    let includesPhase2Block = false;
    const phase2Complete = isAdminPhase2DocumentsUploadComplete(activities);
    if (phase2Complete && Object.keys(answers).length > 0) {
      const responseLines = buildAdminVerifyResponseSummaryBlock(answers)
        .map((line) => line.trim())
        .filter(Boolean);
      const phase2RiskLines = buildPhase2RiskSummaryLinesFromManifest(answers, resolutionProfile)
        .map((line) => line.trim())
        .filter(Boolean);
      const uploadRefs = listAdminPhase2DocumentUploadRefs(activities, leadId);
      if (responseLines.length > 0 || phase2RiskLines.length > 0 || uploadRefs.length > 0) {
        includesPhase2Block = true;
        keyFindings.push("■ 2차 확인");
        for (const line of responseLines.slice(0, 12)) {
          keyFindings.push(`✓ ${line}`);
        }
        for (const line of phase2RiskLines.slice(0, 8)) {
          keyFindings.push(`✓ ${line}`);
        }
        for (const ref of uploadRefs.slice(0, 12)) {
          keyFindings.push(`✓ 제출 자료 · ${ref.fileName}`);
        }
      }
    }

    const keyRisks =
      riskSignals.length > 0
        ? riskSignals.map((r) => `[주의] ${r}`)
        : ["확인된 항목 기준으로 별도 위험요인이 발견되지 않았습니다."];
    if (phase2Complete && Object.keys(answers).length > 0) {
      for (const line of buildPhase2RiskSummaryLinesFromManifest(answers, resolutionProfile).slice(0, 5)) {
        const trimmed = line.trim();
        if (trimmed) keyRisks.push(`[2차] ${trimmed}`);
      }
    }

    const recommendedAction =
      riskSignals.length > 0
        ? ["① 다음 조치 · 위험요인으로 표시된 항목을 통지서 원본과 대조해 주세요."]
        : ["① 다음 조치 · 통지서 원본의 기한과 요구 내용을 다시 확인해 주세요."];
    const satisfiedCount = keyFindings.filter((line) => line.startsWith("✓")).length;
    return {
      execSummary,
      keyFindings,
      keyRisks,
      recommendedAction,
      riskCount: riskSignals.length,
      reviewedCount: satisfiedCount,
      satisfiedCount,
      includesPhase2Block,
    };
  } catch {
    return null;
  }
}

export function verifyAdminTimelineEntryAllowed(
  label: string,
  hasExpertReview: boolean,
): boolean {
  if (hasExpertReview) return true;
  return !EXPERT_TIMELINE_LABEL_MARKERS.some((marker) => label.includes(marker));
}

export function buildVerifyAdminMypageTimelineRecent(input: {
  activityLog: { label: string; createdAt: string }[];
  createdAt: string;
  hasDiagnosis: boolean;
  hasExpertReview: boolean;
  currentStepLabel: string;
}): { label: string; createdAt: string }[] {
  const fromLog = input.activityLog.filter((entry) =>
    verifyAdminTimelineEntryAllowed(entry.label, input.hasExpertReview),
  );
  if (fromLog.length >= 3) return fromLog.slice(-4);
  const fallback: { label: string; createdAt: string }[] = [
    { label: "신청 접수 완료", createdAt: input.createdAt },
  ];
  if (input.hasDiagnosis) {
    const aiEntry = input.activityLog.find((entry) => entry.label.includes("AI"));
    fallback.push({
      label: "AI 검토 완료",
      createdAt: aiEntry?.createdAt ?? input.createdAt,
    });
  }
  if (input.hasExpertReview) {
    fallback.push({
      label: "전문가 검토 시작",
      createdAt: input.createdAt,
    });
  }
  fallback.push({
    label: input.currentStepLabel || "진행 중",
    createdAt: input.createdAt,
  });
  return fallback.filter((entry) =>
    verifyAdminTimelineEntryAllowed(entry.label, input.hasExpertReview),
  );
}
