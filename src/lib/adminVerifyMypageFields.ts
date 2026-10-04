import type { ReviewAnswers } from "@/components/cost-check/MasterReviewQuotationReport";
import { buildAdminVerifyResponseSummaryBlock } from "@/lib/adminVerifyResponseSummary";
import {
  ADMIN_PHASE1_EVIDENCE_FILE_NAME_KEY,
  ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY,
  ADMIN_PHASE2_EVIDENCE_STORAGE_PATH_META_KEY,
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  CASE_CUSTOMER_INPUT_KEY,
  CASE_RESOLUTION_META_JSON_KEY,
  buildCaseResolutionProfile,
  deserializeCaseResolutionProfile,
  getCase06FieldOptionLabel,
} from "@/lib/adminVerifyProfiling";
import {
  buildPhase1RiskSummaryLinesFromManifest,
  buildPhase2RiskSummaryLinesFromManifest,
} from "@/lib/adminVerifyJudgmentRuntime";
import { getRequiredDocuments } from "@/lib/requiredDocuments";

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

export function isVerifyAdminMypageItem(item: { serviceType?: string | null }): boolean {
  return item.serviceType === "verify_admin";
}

export const VERIFY_ADMIN_SUMMARY_STATUS_FREE = "분석 완료";
export const VERIFY_ADMIN_SUMMARY_STATUS_PAID_BEFORE = "전문가 연결 대기";
export const VERIFY_ADMIN_SUMMARY_STATUS_PAID_AFTER = "전문가 검토 중";

export function resolveVerifyAdminApplicationSummaryStatus(item: MypageLayoutItemLike): string | null {
  if (!isVerifyAdminMypageItem(item)) return null;
  if (isVerifyAdminPaidMypageItem(item)) {
    return item.hasExpertReview
      ? VERIFY_ADMIN_SUMMARY_STATUS_PAID_AFTER
      : VERIFY_ADMIN_SUMMARY_STATUS_PAID_BEFORE;
  }
  return VERIFY_ADMIN_SUMMARY_STATUS_FREE;
}

/** F-8/F-14: verify_admin 무료 결과 화면(aiOnly)만 슬림 패널·보관함 푸터·롤링 띠 */
export function shouldUseVerifyAdminMypageSlimAside(
  item: MypageLayoutItemLike | null | undefined
): boolean {
  if (!item || item.serviceType !== "verify_admin") return false;
  return shouldUseGeneralCustomerMypageLayout(item);
}

/** verify_admin 대시보드(expertFlow) 경로 — d2871f8 레이아웃 */
export function shouldUseVerifyAdminExpertFlowDashboard(
  item: MypageLayoutItemLike | null | undefined
): boolean {
  if (!item || item.serviceType !== "verify_admin") return false;
  return !shouldUseGeneralCustomerMypageLayout(item);
}

export const VERIFY_ADMIN_ROLLING_STRIP_SECTION_TITLE = "정부기관 바로가기";

export function verifyAdminMypageShowsMainWalletFooter(
  item: MypageLayoutItemLike | null | undefined
): boolean {
  return shouldUseVerifyAdminMypageSlimAside(item);
}

export function verifyAdminMypageShowsRollingStrip(
  item: MypageLayoutItemLike | null | undefined
): boolean {
  return shouldUseVerifyAdminMypageSlimAside(item);
}

export function shouldHideVerifyAdminWalletDocumentCount(documentCount: number): boolean {
  return documentCount === 0;
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
  /** F-18 free PDF — richer MANDATORY DOCUMENTS card lines (optional). */
  mandatoryDocumentLines?: string[];
  /** F-18 free PDF — extra lines appended under EXECUTIVE DASHBOARD card (metrics unchanged). */
  executiveDashboardSupplementLines?: string[];
};

export const ADMIN_VERIFY_FREE_PDF_PHASE1_UPLOAD_DISCLAIMER =
  "※ 이 리포트에서는 1차 입력 내용을 중심으로 정리합니다. 제출 자료의 상세 내용 비교·검토는 상세 검토에서 확인할 수 있습니다.";

export const ADMIN_VERIFY_FREE_PDF_DEFAULT_CONCLUSION =
  "결론 · 1차 입력만으로는 위험 여부를 확정할 수 없어, 원본 통지서·안내와의 대조 확인이 필요합니다.";

export const ADMIN_VERIFY_FREE_PDF_SCOPE_GAP_LINE =
  "[공백] 이 리포트는 1차 입력과 제출 사실만 반영하므로, 사실관계는 원본 문서를 기준으로 확인이 필요합니다.";

const ADMIN_VERIFY_FREE_PDF_OMIT_FINDING_LINE =
  "1차 확인에서는 기본적인 상황 정리가 완료된 상태입니다.";

const VERIFY_ADMIN_MANDATORY_DOC_HINTS: Record<string, string> = {
  "교통국에서 받은 안내·통지 문서": "발신 기관·요구 내용·기한 확인용",
  "교통국에 제출했던 서류·자료": "이전 제출 내용·처리 결과 대조용",
};

function normalizeAdminVerifyPdfDedupKey(text: string): string {
  return text
    .replace(/^✓\s*/, "")
    .replace(/^[①②③]\s*(즉시|다음|최종)\s*조치\s*·\s*/, "")
    .replace(/^(결론|확인 목적|문서|지금 우선)\s*·\s*/, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function mapSubmittedDocumentTypeLabel(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^case06_/.test(trimmed)) {
    return getCase06FieldOptionLabel("case06_documentNature", trimmed);
  }
  return trimmed;
}

/** 1차 마지막 간단 업로드 — verify_lead meta storagePath (2차 document-upload 경로 제외). */
export function resolveAdminPhase1SimpleUploadFromActivities(
  activities: CrmActivityLike[],
  answers: ReviewAnswers,
): { count: number; typeLabel: string | null } | null {
  for (let i = activities.length - 1; i >= 0; i -= 1) {
    const row = activities[i];
    if (row.action !== "verify_lead") continue;
    const meta = asMeta(row.meta);
    if (!meta) continue;
    const storagePath =
      typeof meta.storagePath === "string" && meta.storagePath.trim()
        ? meta.storagePath.trim()
        : "";
    if (!storagePath || storagePath.includes("document-upload/")) continue;
    if (typeof meta[ADMIN_PHASE2_EVIDENCE_STORAGE_PATH_META_KEY] === "string") continue;

    let typeLabel: string | null = null;
    const submitted = meta.submitted_document;
    if (submitted && typeof submitted === "object") {
      const documentType = (submitted as { document_type?: unknown }).document_type;
      if (typeof documentType === "string") {
        typeLabel = mapSubmittedDocumentTypeLabel(documentType);
      }
    }
    return { count: 1, typeLabel };
  }

  if (answers[ADMIN_PHASE1_EVIDENCE_FILE_NAME_KEY]?.trim()) {
    return { count: 1, typeLabel: null };
  }
  return null;
}

function buildAdminVerifyPaidAiReportContent(
  profile: Record<string, unknown>,
  activities: CrmActivityLike[],
  leadId: string,
  answers: ReviewAnswers,
  resolutionProfile: ReturnType<typeof buildCaseResolutionProfile>,
  riskSignals: string[],
  goal: string | null,
): AdminVerifyAiReportContent {
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

  for (const line of buildPhase1RiskSummaryLinesFromManifest(answers, resolutionProfile)) {
    const trimmed = line.trim();
    if (trimmed) keyFindings.push(`✓ ${trimmed}`);
  }

  let includesPhase2Block = false;
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

  const keyRisks =
    riskSignals.length > 0
      ? riskSignals.map((r) => `[주의] ${r}`)
      : ["확인된 항목 기준으로 별도 위험요인이 발견되지 않았습니다."];
  for (const line of buildPhase2RiskSummaryLinesFromManifest(answers, resolutionProfile).slice(0, 5)) {
    const trimmed = line.trim();
    if (trimmed) keyRisks.push(`[2차] ${trimmed}`);
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
}

function buildAdminVerifyFreeAiReportContent(
  profile: Record<string, unknown>,
  activities: CrmActivityLike[],
  answers: ReviewAnswers,
  resolutionProfile: ReturnType<typeof buildCaseResolutionProfile>,
  riskSignals: string[],
  goal: string | null,
): AdminVerifyAiReportContent {
  const dedupKeys = new Set<string>();
  const registerDedup = (text: string) => {
    dedupKeys.add(normalizeAdminVerifyPdfDedupKey(text));
  };

  const conclusionLine =
    riskSignals.length > 0
      ? `결론 · 확인이 필요한 위험요인 ${riskSignals.length}건이 있어 원본 통지서·안내의 기재 내용을 기준으로 추가 확인이 필요합니다.`
      : ADMIN_VERIFY_FREE_PDF_DEFAULT_CONCLUSION;

  const priorityLine = goal
    ? "지금 우선 · 입력하신 확인 목표에 맞춰 통지서·안내 원본의 발신 기관·요구 문구부터 확인해 주세요."
    : "지금 우선 · 통지서·안내 원본에서 발신 기관·제목·기한이 적힌 부분을 먼저 확인해 주세요.";

  const execSummary = [
    conclusionLine,
    goal ? `확인 목적 · ${goal}` : null,
    priorityLine,
  ].filter((line): line is string => Boolean(line));
  for (const line of execSummary) registerDedup(line);

  const keyFindings: string[] = ["■ 1차 확인 사항"];
  const pushFinding = (line: string) => {
    const key = normalizeAdminVerifyPdfDedupKey(line);
    if (dedupKeys.has(key)) return;
    dedupKeys.add(key);
    keyFindings.push(`✓ ${line.replace(/^✓\s*/, "")}`);
  };

  for (const [label, key] of [
    ["사건 앵커", "caseAnchor"],
    ["관련 기관", "authority"],
    ["문서", "document"],
    ["현재 단계", "currentStage"],
  ] as const) {
    const val = profileFieldValueFromResolution(profile[key]);
    if (!val) continue;
    if (key === "document" && val.includes("제출 정보 기준")) continue;
    pushFinding(`${label} · ${val}`);
  }

  const customerInput = answers[CASE_CUSTOMER_INPUT_KEY]?.trim();
  if (customerInput) {
    const goalNorm = goal ? normalizeAdminVerifyPdfDedupKey(goal) : "";
    const inputNorm = normalizeAdminVerifyPdfDedupKey(customerInput);
    if (!goalNorm || inputNorm !== goalNorm) {
      pushFinding(`고객 상황 · ${customerInput}`);
    }
  }

  for (const line of buildPhase1RiskSummaryLinesFromManifest(answers, resolutionProfile)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed === ADMIN_VERIFY_FREE_PDF_OMIT_FINDING_LINE) continue;
    if (goal && normalizeAdminVerifyPdfDedupKey(trimmed) === normalizeAdminVerifyPdfDedupKey(goal)) {
      continue;
    }
    if (customerInput && trimmed.includes(customerInput)) continue;
    pushFinding(trimmed);
  }

  const phase1Upload = resolveAdminPhase1SimpleUploadFromActivities(activities, answers);
  if (phase1Upload) {
    const typePart = phase1Upload.typeLabel?.trim();
    const submitLine = typePart
      ? `제출 자료 · ${typePart} ${phase1Upload.count}건이 제출되었습니다.`
      : `제출 자료 · 자료 ${phase1Upload.count}건이 제출되었습니다.`;
    pushFinding(submitLine);
    pushFinding(ADMIN_VERIFY_FREE_PDF_PHASE1_UPLOAD_DISCLAIMER);
  }

  const keyRisks: string[] = [];
  if (riskSignals.length > 0) {
    for (const signal of riskSignals) {
      keyRisks.push(`[주의] ${signal}`);
    }
  }
  keyRisks.push(
    "[공백] 원본 통지서·안내에 적힌 기한·요구 내용·발신 기관이 아직 교차 확인되지 않았을 수 있습니다.",
  );
  keyRisks.push(ADMIN_VERIFY_FREE_PDF_SCOPE_GAP_LINE);

  const recommendedAction = [
    "① 즉시 조치 · 통지서·안내 원본에서 발신 기관·제목·기한·요구 문구가 적힌 부분을 표시해 두세요.",
    goal
      ? "② 다음 조치 · 확인 목표에 맞춰 아직 확인하지 못한 항목을 정리하고, 원본과 대조할 위치를 표시해 주세요."
      : "② 다음 조치 · 1차에 정리한 상황과 원본 통지서·안내를 나란히 놓고 아직 확인하지 못한 항목을 정리해 주세요.",
    "③ 최종 조치 · 필요하면 상세 검토를 통해 제출 자료와 답변을 함께 확인하고 다음 대응 방향을 정리해 주세요.",
  ];

  const requiredDocs = getRequiredDocuments("verify_admin");
  const mandatoryDocumentLines = requiredDocs.documents.map((docName) => {
    const hint = VERIFY_ADMIN_MANDATORY_DOC_HINTS[docName];
    return hint ? `${docName} — ${hint}` : `${docName} — 제출·확인 참고`;
  });

  const executiveDashboardSupplementLines = [
    "입력 범위 · 1차 질문 답변과 간단 업로드 제출 사실",
    "검토 범위 · 제출 파일 내용 분석·2차 확인은 상세 검토에서 진행",
  ];

  const satisfiedCount = keyFindings.filter((line) => line.startsWith("✓")).length;
  return {
    execSummary,
    keyFindings,
    keyRisks,
    recommendedAction,
    riskCount: riskSignals.length,
    reviewedCount: satisfiedCount,
    satisfiedCount,
    includesPhase2Block: false,
    mandatoryDocumentLines,
    executiveDashboardSupplementLines,
  };
}

export function formatAdminVerifyAiReportContentPlainText(
  content: AdminVerifyAiReportContent,
): string {
  const sections: string[] = [
    "EXECUTIVE SUMMARY",
    ...content.execSummary,
    "",
    "EVIDENCE & KEY FINDINGS",
    ...content.keyFindings,
    "",
    "KEY RISKS & GAPS",
    ...content.keyRisks,
    "",
    "RECOMMENDED ACTIONS",
    ...content.recommendedAction,
  ];
  if (content.mandatoryDocumentLines?.length) {
    sections.push("", "MANDATORY DOCUMENTS", ...content.mandatoryDocumentLines);
  }
  return sections.join("\n");
}

export function adminVerifyFreePdfTextContainsInternalCodes(text: string): boolean {
  return (
    /\bverify_admin\b/.test(text) ||
    /\badmin_phase2\b/.test(text) ||
    /\bphase2_upload\b/.test(text) ||
    /\bundefined\b/.test(text) ||
    /\bnull\b/.test(text)
  );
}

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

    const answers = parseAdminVerifyAnswersFromActivities(activities);
    const resolutionProfile =
      deserializeCaseResolutionProfile({
        [CASE_RESOLUTION_META_JSON_KEY]: profileRaw,
      }) ?? buildCaseResolutionProfile(answers);

    const phase2Complete = isAdminPhase2DocumentsUploadComplete(activities);
    if (phase2Complete && Object.keys(answers).length > 0) {
      return buildAdminVerifyPaidAiReportContent(
        profile,
        activities,
        leadId,
        answers,
        resolutionProfile,
        riskSignals,
        goal,
      );
    }

    return buildAdminVerifyFreeAiReportContent(
      profile,
      activities,
      answers,
      resolutionProfile,
      riskSignals,
      goal,
    );
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
