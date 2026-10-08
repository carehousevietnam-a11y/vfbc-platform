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
import type { PDFFont } from "pdf-lib";
import {
  countMypageExecutiveParagraphListRenderLines,
  MYPAGE_PDF_EXECUTIVE_EVIDENCE_LIST_SIZE,
  wrapMypageExecutiveParagraphListLine,
} from "@/lib/mypagePdfExecutiveParagraphWrap";

type AdminVerifyPaidEvidenceMeasureFonts = {
  regular: PDFFont;
  bold: PDFFont;
};

let adminVerifyPaidEvidenceMeasureFonts: AdminVerifyPaidEvidenceMeasureFonts | null = null;

/** Server/QA: call after ensureMypageExecutivePdfMeasureFonts() before paid PDF content build. */
export function bindAdminVerifyPaidEvidenceMeasureFonts(fonts: AdminVerifyPaidEvidenceMeasureFonts): void {
  adminVerifyPaidEvidenceMeasureFonts = fonts;
}

function requireAdminVerifyPaidEvidenceMeasureFonts(): AdminVerifyPaidEvidenceMeasureFonts {
  if (!adminVerifyPaidEvidenceMeasureFonts) {
    throw new Error(
      "Admin verify paid EVIDENCE measure fonts not bound — call bindAdminVerifyPaidEvidenceMeasureFonts() after ensureMypageExecutivePdfMeasureFonts()",
    );
  }
  return adminVerifyPaidEvidenceMeasureFonts;
}

export const VERIFY_ADMIN_AI_REPORT_RECEIVE_LABEL = "AI 리포트 받기";
export const VERIFY_ADMIN_EXPERT_REVIEWING_LABEL = "담당 전문가가 검토 중입니다";

/** H-3: expert dashboard — phase2 incomplete PDF gate + entry CTA (exact copy — do not edit). */
export const VERIFY_ADMIN_EXPERT_PHASE2_ENTRY_BUTTON_LABEL = "2차 개인화 질문 이어서 진행";
export const VERIFY_ADMIN_EXPERT_PHASE2_PDF_LOCKED_NOTICE =
  "2차 개인화 질문을 완료하면 2차 개인화 AI 리포트를 받을 수 있습니다.";
export const VERIFY_ADMIN_PHASE2_AI_REPORT_RECEIVE_LABEL = "2차 개인화 AI 리포트 받기";
export const VERIFY_ADMIN_EXPERT_PHASE2_PDF_GATE_ERROR_MESSAGE =
  "2차 개인화 질문을 완료한 후 이용할 수 있습니다.";
/** Existing member restore path — same as buildCaseRestoreHref(verify_admin). */
export const VERIFY_ADMIN_PHASE2_QUESTION_RESUME_HREF = "/verify/admin?restore=1";

export type VerifyAdminExpertAiReportPdfGateInput = {
  serviceType?: string | null;
  hasExpertReview?: boolean;
  phase2Complete?: boolean;
};

export function shouldGateVerifyAdminExpertPageAiReportPdf(
  input: VerifyAdminExpertAiReportPdfGateInput,
): boolean {
  return (
    input.serviceType === "verify_admin" &&
    Boolean(input.hasExpertReview) &&
    input.phase2Complete !== true
  );
}

export function shouldGateVerifyAdminExpertPageAiReportPdfFromActivities(
  serviceType: string | null | undefined,
  activities: CrmActivityLike[],
): boolean {
  if (serviceType !== "verify_admin") return false;
  const hasExpertReview = activities.some((row) => row.action === "expert_review_request");
  if (!hasExpertReview) return false;
  return !isAdminPhase2DocumentsUploadComplete(activities);
}

/** verify_admin + verify_real-estate — expertFlow PDF gate (동일 규칙, 서비스 키만 확장). */
export function shouldGateVerifyExpertPageAiReportPdfFromActivities(
  serviceType: string | null | undefined,
  activities: CrmActivityLike[],
): boolean {
  const key = serviceType?.replace(/-/g, "_");
  if (key !== "verify_admin" && key !== "verify_real_estate") return false;
  const hasExpertReview = activities.some((row) => row.action === "expert_review_request");
  if (!hasExpertReview) return false;
  return !isAdminPhase2DocumentsUploadComplete(activities);
}

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
  documentLabel: string | null;
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
    const rawLabel = meta?.documentLabel;
    const documentLabel =
      typeof rawLabel === "string" && rawLabel.trim() ? rawLabel.trim() : null;
    refs.push({
      tag: typeof row.tag === "string" && row.tag.trim() ? row.tag : fileName,
      fileName,
      storagePath,
      documentLabel,
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

/** verify_admin 유료 레이아웃과 동일 구조 — 부동산 Pack 2차 완료 */
export function isVerifyMasterPaidMypageItem(item: MypageLayoutItemLike): boolean {
  if (isVerifyAdminPaidMypageItem(item)) return true;
  const st = item.serviceType?.replace(/-/g, "_");
  return (st === "verify_real_estate" || st === "verify_tax") && item.phase2Complete === true;
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
  if (isVerifyMasterPaidMypageItem(item)) return false;
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

/** H-9 — verify_admin expertFlow (확정 문구, 변경 금지) */
export const VERIFY_ADMIN_EXPERT_PHASE2_INCOMPLETE_STATUS_GUIDE =
  "전문가 진행 요청이 접수되었습니다. 2차 개인화 질문을 완료해 주세요.";
export const VERIFY_ADMIN_EXPERT_REQUEST_TIMELINE_LABEL = "전문가 진행 요청";
export const VERIFY_ADMIN_MYPAGE_NOTIFICATION_EMPTY = "새로운 알림이 없습니다.";

const VERIFY_ADMIN_EXPERT_REVIEW_ACTIVITY_LOG_LABEL = "전문가 검토 시작";

export function mapVerifyAdminExpertMypageTimelineDisplayLabel(label: string): string {
  if (label === VERIFY_ADMIN_EXPERT_REVIEW_ACTIVITY_LOG_LABEL) {
    return VERIFY_ADMIN_EXPERT_REQUEST_TIMELINE_LABEL;
  }
  return label;
}

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
  /** G-2 QA: EVIDENCE 7-line budget에서 표시하지 못한 bullet 수 (PDF 본문 미출력). */
  paidEvidenceOmittedItemCount?: number;
  /** G-4 QA: 누락 항목 목록 (PDF 미출력). */
  paidEvidenceOmittedItems?: AdminVerifyPaidEvidenceOmittedItem[];
};

export type AdminVerifyPaidEvidenceOmittedKind =
  | "phase1_extra"
  | "phase2_customer_input"
  | "phase2_manifest"
  | "upload_filename";

export type AdminVerifyPaidEvidenceOmittedItem = {
  kind: AdminVerifyPaidEvidenceOmittedKind;
  text: string;
};

export const ADMIN_VERIFY_PAID_PHASE2_TEMPLATE_SNIPPET = "다음 조치를 보는 것이";

export function isAdminVerifyPaidPhase2TemplateManifestEvidenceLine(line: string): boolean {
  const bare = line.replace(/^✓\s*/, "").trim();
  return bare.includes(ADMIN_VERIFY_PAID_PHASE2_TEMPLATE_SNIPPET);
}

export const ADMIN_VERIFY_FREE_PDF_PHASE1_UPLOAD_DISCLAIMER =
  "※ 이 리포트에서는 1차 입력 내용을 중심으로 정리합니다. 제출 자료의 상세 내용 비교·검토는 상세 검토에서 확인할 수 있습니다.";

export const ADMIN_VERIFY_FREE_PDF_SCOPE_GAP_LINE =
  "[공백] 이 리포트는 1차 입력과 제출 사실만 반영하므로, 사실관계는 원본 문서를 기준으로 확인이 필요합니다.";

export const ADMIN_VERIFY_FREE_PDF_EMPTY_FINDINGS_LINE =
  "1차 입력에서 확인된 세부 항목이 없어, 확인 목적만 반영했습니다.";

/** F-18d: 무료 verify_admin PDF 상단 판정·지표·Dashboard 값 (유료/타 서비스 미적용) */
export const ADMIN_VERIFY_FREE_PDF_EXECUTIVE_HEADLINE = "1차 확인 완료";
export const ADMIN_VERIFY_FREE_PDF_EXECUTIVE_SUBLINE =
  "1차 입력 내용 기준으로 정리한 결과입니다. 원본 문서 대조는 포함되지 않았습니다.";
export const ADMIN_VERIFY_FREE_PDF_METRIC_REQUIREMENTS = "1차 기준";
export const ADMIN_VERIFY_FREE_PDF_METRIC_GAPS = "미확정";
export const ADMIN_VERIFY_FREE_PDF_METRIC_STATUS = "1차 확인";
export const ADMIN_VERIFY_FREE_PDF_DASHBOARD_NEXT_ACTION = "원본 문서와 대조 확인";

export const ADMIN_VERIFY_FREE_PDF_DASHBOARD_INPUT_SCOPE_WITH_UPLOAD =
  "입력 범위 · 1차 질문 답변과 간단 업로드 제출 사실";
export const ADMIN_VERIFY_FREE_PDF_DASHBOARD_INPUT_SCOPE_NO_UPLOAD = "입력 범위 · 1차 질문 답변";
export const ADMIN_VERIFY_FREE_PDF_DASHBOARD_REVIEW_SCOPE_WITH_UPLOAD =
  "검토 범위 · 파일 내용·2차 확인은 상세 검토";
export const ADMIN_VERIFY_FREE_PDF_DASHBOARD_REVIEW_SCOPE_NO_UPLOAD =
  "검토 범위 · 2차 확인은 상세 검토에서 진행";

const ADMIN_VERIFY_FREE_PDF_GENERIC_CUSTOMER_SITUATION_VALUES = new Set(["행정문서", "행정 문서"]);

export function isVerifyAdminFreeAiReportPdfActivities(activities: CrmActivityLike[]): boolean {
  return !isAdminPhase2DocumentsUploadComplete(activities);
}

/** G-2: paid verify_admin PDF (phase2 complete + answers). */
export function isVerifyAdminPaidAiReportPdfActivities(activities: CrmActivityLike[]): boolean {
  if (!isAdminPhase2DocumentsUploadComplete(activities)) return false;
  return Object.keys(parseAdminVerifyAnswersFromActivities(activities)).length > 0;
}

/** G-2/G-3b: paid verify_admin PDF 상단·Dashboard (무료·타 서비스 미적용) */
export const ADMIN_VERIFY_PAID_PDF_EXECUTIVE_HEADLINE = "1·2차 입력 확인 완료";
export const ADMIN_VERIFY_PAID_PDF_LEGACY_EXECUTIVE_HEADLINE = "1·2차 확인 완료";
export const ADMIN_VERIFY_PAID_PDF_EXECUTIVE_SUBLINE =
  "1차·2차 입력 내용 기준으로 정리한 결과입니다. 제출 자료의 내용 검토는 전문가 확인 단계에서 진행됩니다.";
export const ADMIN_VERIFY_PAID_PDF_METRIC_REQUIREMENTS = "1·2차 기준";
export const ADMIN_VERIFY_PAID_PDF_METRIC_STATUS = "2차 반영";
export const ADMIN_VERIFY_PAID_PDF_KEY_RISK_CROSS_CHECK =
  "[공백] 원본 문서와 2차 진술의 교차 확인이 필요합니다.";
export const ADMIN_VERIFY_PAID_PDF_KEY_RISK_UPLOAD_SCOPE =
  "[검토 범위] 제출 자료의 내용은 이 리포트에서 검토하지 않았으며, 파일명·종류·제출 사실만 반영했습니다.";

/** 5칸 보완항목 · Dashboard 위험·보완 — [주의]·[공백]만 집계 ([검토 범위] 제외). */
export function countAdminVerifyPaidPdfMetricGapLines(keyRisks: string[]): number {
  return keyRisks.filter(
    (line) => line.startsWith("[주의]") || line.startsWith("[공백]"),
  ).length;
}

export const ADMIN_VERIFY_PAID_PDF_EVIDENCE_MAX_RENDER_LINES = 7;
/** Matches mypagePdfExecutiveRender left column width (contentWidth * 0.62). */
export const ADMIN_VERIFY_PAID_PDF_EVIDENCE_CONTENT_WIDTH = Math.round(515.28 * 0.62);

const ADMIN_VERIFY_PAID_PDF_EVIDENCE_OMIT_SNIPPETS = [
  "1차 확인에서는 기본적인 상황 정리가 완료된 상태입니다.",
  "2차 답변에서 추가로 확인된 위험 요인은 현재 보이지 않습니다.",
] as const;

function paidEvidenceLineShouldOmit(text: string): boolean {
  const bare = text.replace(/^✓\s*/, "").trim();
  return ADMIN_VERIFY_PAID_PDF_EVIDENCE_OMIT_SNIPPETS.some(
    (snippet) => bare === snippet || bare.includes(snippet),
  );
}

function measurePaidEvidenceLineRenderCount(line: string): number {
  const fonts = requireAdminVerifyPaidEvidenceMeasureFonts();
  return wrapMypageExecutiveParagraphListLine(
    line,
    MYPAGE_PDF_EXECUTIVE_EVIDENCE_LIST_SIZE,
    fonts.regular,
    fonts.bold,
    ADMIN_VERIFY_PAID_PDF_EVIDENCE_CONTENT_WIDTH,
  ).length;
}

export function countPaidEvidenceRenderLines(lines: string[]): number {
  const fonts = requireAdminVerifyPaidEvidenceMeasureFonts();
  return countMypageExecutiveParagraphListRenderLines(
    lines,
    MYPAGE_PDF_EXECUTIVE_EVIDENCE_LIST_SIZE,
    fonts.regular,
    fonts.bold,
    ADMIN_VERIFY_PAID_PDF_EVIDENCE_CONTENT_WIDTH,
  );
}

export function buildAdminVerifyPaidZeroRiskConclusionLine(originalDoc: string): string {
  return `결론 · 1차·2차 입력만으로는 위험 여부를 확정할 수 없어, ${originalDoc}와의 대조 확인이 필요합니다.`;
}

type PaidEvidencePackResult = {
  lines: string[];
  omittedItemCount: number;
  omittedItems: AdminVerifyPaidEvidenceOmittedItem[];
};

function selectPhase1CoreProfileLines(profileLines: string[], maxCore: number): string[] {
  let authority: string | null = null;
  let document: string | null = null;
  let stage: string | null = null;
  for (const line of profileLines) {
    if (line.includes("관련 기관 ·")) authority = line;
    else if (/^✓\s*문서 ·/.test(line)) document = line;
    else if (line.includes("현재 단계 ·")) stage = line;
  }
  const picked: string[] = [];
  if (authority) picked.push(authority);
  if (document) picked.push(document);
  if (picked.length === 0 && stage) picked.push(stage);
  return picked.slice(0, maxCore);
}

function countPhase1BulletsInPacked(packed: string[]): number {
  const start = packed.indexOf("■ 1차 확인 사항");
  if (start < 0) return 0;
  const end = packed.findIndex((line, idx) => idx > start && line.startsWith("■ "));
  const slice = end >= 0 ? packed.slice(start + 1, end) : packed.slice(start + 1);
  return slice.filter((line) => line.startsWith("✓")).length;
}

type PaidEvidenceLinePhase = "phase1" | "phase2";

function assemblePaidEvidenceKeyFindingLines(
  phase1Bullets: string[],
  phase2Bullets: string[],
): string[] {
  const lines: string[] = ["■ 1차 확인 사항", ...phase1Bullets];
  const hasPhase2Item = phase2Bullets.some((line) => line.startsWith("✓"));
  if (hasPhase2Item) {
    lines.push("■ 2차 확인", ...phase2Bullets);
  }
  return lines;
}

function packLinesWithinBudget(lines: string[]): string[] | null {
  let used = 0;
  const packed: string[] = [];
  for (const line of lines) {
    const need = measurePaidEvidenceLineRenderCount(line);
    if (used + need > ADMIN_VERIFY_PAID_PDF_EVIDENCE_MAX_RENDER_LINES) return null;
    packed.push(line);
    used += need;
  }
  return packed;
}

export function packAdminVerifyPaidEvidenceKeyFindings(input: {
  phase1ProfileLines: string[];
  phase1ManifestLines: string[];
  phase2ResponseLines: string[];
  phase2ManifestLines: string[];
  uploadRefs: AdminPhase2UploadRef[];
}): PaidEvidencePackResult {
  const phase1ProfileLines = input.phase1ProfileLines.filter((line) => !paidEvidenceLineShouldOmit(line));
  const phase1ManifestItems: string[] = [];
  for (const raw of input.phase1ManifestLines) {
    const line = `✓ ${raw.trim()}`;
    if (paidEvidenceLineShouldOmit(line)) continue;
    phase1ManifestItems.push(line);
  }

  const phase2ResponseItems: string[] = [];
  for (const raw of input.phase2ResponseLines) {
    const line = `✓ ${raw.trim()}`;
    if (paidEvidenceLineShouldOmit(line)) continue;
    phase2ResponseItems.push(line);
  }
  const phase2ManifestItems: string[] = [];
  for (const raw of input.phase2ManifestLines) {
    const line = `✓ ${raw.trim()}`;
    if (paidEvidenceLineShouldOmit(line)) continue;
    phase2ManifestItems.push(line);
  }

  const uploadCountLine =
    input.uploadRefs.length > 0 ? `✓ 2차 제출 자료 ${input.uploadRefs.length}건` : null;
  const uploadFileLines: string[] = [];
  for (const ref of input.uploadRefs.slice(0, 12)) {
    const docKind = ref.documentLabel?.trim();
    uploadFileLines.push(
      docKind
        ? `✓ 제출 자료 · ${docKind} · ${ref.fileName}`
        : `✓ 제출 자료 · ${ref.fileName}`,
    );
  }

  const hasPhase2Section =
    phase2ResponseItems.length > 0 ||
    phase2ManifestItems.length > 0 ||
    uploadCountLine !== null ||
    uploadFileLines.length > 0;

  if (!hasPhase2Section) {
    const omittedItems: AdminVerifyPaidEvidenceOmittedItem[] = [];
    const packed: string[] = ["■ 1차 확인 사항"];
    let usedLines = measurePaidEvidenceLineRenderCount("■ 1차 확인 사항");
    const fullCore = selectPhase1CoreProfileLines(phase1ProfileLines, 2);
    for (const line of fullCore) {
      const need = measurePaidEvidenceLineRenderCount(line);
      if (usedLines + need > ADMIN_VERIFY_PAID_PDF_EVIDENCE_MAX_RENDER_LINES) {
        omittedItems.push({ kind: "phase1_extra", text: line.replace(/^✓\s*/, "") });
        continue;
      }
      packed.push(line);
      usedLines += need;
    }
    const phase1ExtraPool: AdminVerifyPaidEvidenceOmittedItem[] = [];
    const coreSet = new Set(fullCore);
    for (const line of phase1ProfileLines) {
      if (!coreSet.has(line)) {
        phase1ExtraPool.push({ kind: "phase1_extra", text: line.replace(/^✓\s*/, "") });
      }
    }
    for (const line of phase1ManifestItems) {
      phase1ExtraPool.push({ kind: "phase1_extra", text: line.replace(/^✓\s*/, "") });
    }
    for (const extra of phase1ExtraPool) {
      if (countPhase1BulletsInPacked(packed) >= 3) {
        omittedItems.push(extra);
        continue;
      }
      const line = `✓ ${extra.text}`;
      const need = measurePaidEvidenceLineRenderCount(line);
      if (usedLines + need > ADMIN_VERIFY_PAID_PDF_EVIDENCE_MAX_RENDER_LINES) {
        omittedItems.push(extra);
        continue;
      }
      packed.push(line);
      usedLines += need;
    }
    return { lines: packed, omittedItemCount: omittedItems.length, omittedItems };
  }

  const attemptWithCoreCount = (coreCount: number): PaidEvidencePackResult | null => {
    const omittedItems: AdminVerifyPaidEvidenceOmittedItem[] = [];
    const fullCoreMax2 = selectPhase1CoreProfileLines(phase1ProfileLines, 2);
    const coreLines = fullCoreMax2.slice(0, coreCount);
    for (let i = coreCount; i < fullCoreMax2.length; i += 1) {
      omittedItems.push({ kind: "phase1_extra", text: fullCoreMax2[i]!.replace(/^✓\s*/, "") });
    }
    const coreSet = new Set(coreLines);
    const phase1ExtraPool: AdminVerifyPaidEvidenceOmittedItem[] = [];
    for (const line of phase1ProfileLines) {
      if (!coreSet.has(line)) {
        phase1ExtraPool.push({ kind: "phase1_extra", text: line.replace(/^✓\s*/, "") });
      }
    }
    for (const line of phase1ManifestItems) {
      phase1ExtraPool.push({ kind: "phase1_extra", text: line.replace(/^✓\s*/, "") });
    }

    const phase1ExtraTexts = new Set(phase1ExtraPool.map((e) => e.text));

    const classifyPackedBulletPhase = (line: string): PaidEvidenceLinePhase => {
      if (coreSet.has(line)) return "phase1";
      const bare = line.replace(/^✓\s*/, "");
      if (phase1ExtraTexts.has(bare)) return "phase1";
      return "phase2";
    };

    const prefix: string[] = ["■ 1차 확인 사항", ...coreLines, "■ 2차 확인"];
    if (uploadCountLine) {
      prefix.push(uploadCountLine);
    }
    if (phase2ResponseItems.length > 0) {
      prefix.push(phase2ResponseItems[0]!);
    }

    const prefixPacked = packLinesWithinBudget(prefix);
    if (!prefixPacked) return null;
    if (phase2ResponseItems.length > 0 && !prefixPacked.includes(phase2ResponseItems[0]!)) {
      return null;
    }

    const packed = [...prefixPacked];
    let usedLines = countPaidEvidenceRenderLines(packed);

    const tryAppend = (line: string, kind: AdminVerifyPaidEvidenceOmittedKind): void => {
      const need = measurePaidEvidenceLineRenderCount(line);
      if (usedLines + need <= ADMIN_VERIFY_PAID_PDF_EVIDENCE_MAX_RENDER_LINES) {
        packed.push(line);
        usedLines += need;
      } else {
        omittedItems.push({ kind, text: line.replace(/^✓\s*/, "") });
      }
    };

    for (const line of phase2ResponseItems.slice(1)) {
      tryAppend(line, "phase2_customer_input");
    }

    for (const extra of phase1ExtraPool) {
      if (countPhase1BulletsInPacked(packed) >= 3) {
        omittedItems.push(extra);
        continue;
      }
      tryAppend(`✓ ${extra.text}`, "phase1_extra");
    }

    const hasCustomerInPack = phase2ResponseItems.some((line) => packed.includes(line));
    if (!hasCustomerInPack && phase2ManifestItems.length > 0) {
      tryAppend(phase2ManifestItems[0]!, "phase2_manifest");
      for (const line of phase2ManifestItems.slice(1)) {
        omittedItems.push({ kind: "phase2_manifest", text: line.replace(/^✓\s*/, "") });
      }
    } else {
      for (const line of phase2ManifestItems) {
        omittedItems.push({ kind: "phase2_manifest", text: line.replace(/^✓\s*/, "") });
      }
    }

    for (const line of uploadFileLines) {
      tryAppend(line, "upload_filename");
    }

    if (hasPhase2Section) {
      const phase2HeaderIdx = packed.indexOf("■ 2차 확인");
      if (phase2HeaderIdx >= 0) {
        const hasItemAfterPhase2 = packed.slice(phase2HeaderIdx + 1).some((l) => l.startsWith("✓"));
        if (!hasItemAfterPhase2) {
          while (packed.length > phase2HeaderIdx) packed.pop();
        }
      }
    }

    if (phase2ResponseItems.length > 0) {
      const shown = phase2ResponseItems.filter((line) => packed.includes(line)).length;
      if (shown < 1) return null;
    }

    const phase1Bullets: string[] = [];
    const phase2Bullets: string[] = [];
    for (const line of packed) {
      if (line.startsWith("■")) continue;
      if (classifyPackedBulletPhase(line) === "phase1") phase1Bullets.push(line);
      else phase2Bullets.push(line);
    }

    const lines = assemblePaidEvidenceKeyFindingLines(phase1Bullets, phase2Bullets);

    return {
      lines,
      omittedItemCount: omittedItems.length,
      omittedItems,
    };
  };

  for (const coreCount of [2, 1]) {
    const result = attemptWithCoreCount(coreCount);
    if (result) return result;
  }

  const fallbackOmitted: AdminVerifyPaidEvidenceOmittedItem[] = [];
  for (const line of phase1ManifestItems) {
    fallbackOmitted.push({ kind: "phase1_extra", text: line.replace(/^✓\s*/, "") });
  }
  for (const line of phase2ResponseItems) {
    fallbackOmitted.push({ kind: "phase2_customer_input", text: line.replace(/^✓\s*/, "") });
  }
  for (const line of phase2ManifestItems) {
    fallbackOmitted.push({ kind: "phase2_manifest", text: line.replace(/^✓\s*/, "") });
  }
  for (const line of uploadFileLines) {
    fallbackOmitted.push({ kind: "upload_filename", text: line.replace(/^✓\s*/, "") });
  }
  return {
    lines: ["■ 1차 확인 사항"],
    omittedItemCount: fallbackOmitted.length,
    omittedItems: fallbackOmitted,
  };
}

function isAdminVerifyFreePdfConcreteCustomerSituation(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (ADMIN_VERIFY_FREE_PDF_GENERIC_CUSTOMER_SITUATION_VALUES.has(trimmed)) return false;
  return true;
}

const ADMIN_VERIFY_FREE_PDF_OMIT_FINDING_LINE =
  "1차 확인에서는 기본적인 상황 정리가 완료된 상태입니다.";

const VERIFY_ADMIN_MANDATORY_DOC_TRAFFIC_LINES = [
  "교통국에서 받은 안내·통지 문서 — 발신 기관·요구 내용·기한 확인용",
  "교통국에 제출했던 서류·자료 — 이전 제출 내용·처리 결과 대조용",
] as const;

const VERIFY_ADMIN_MANDATORY_DOC_GENERIC_LINES = [
  "관련 기관에서 받은 안내·통지 문서 — 발신 기관·요구 내용·기한 확인용",
  "관련 기관에 제출했던 서류·자료 — 이전 제출 내용·처리 결과 대조용",
] as const;

/** @deprecated F-18b — use buildAdminVerifyFreeOriginalDocumentLabel */
export const ADMIN_VERIFY_FREE_PDF_DEFAULT_CONCLUSION =
  "결론 · 1차 입력만으로는 위험 여부를 확정할 수 없어, 원본 문서와의 대조 확인이 필요합니다.";

export function buildAdminVerifyFreeOriginalDocumentLabel(documentLabel: string | null): string {
  const trimmed = documentLabel?.trim();
  return trimmed ? `원본 문서(${trimmed})` : "원본 문서";
}

export function isAdminVerifyFreePdfTrafficAuthority(authority: string | null): boolean {
  if (!authority?.trim()) return false;
  return /교통|운전\s*면허|운전면허/.test(authority);
}

function buildAdminVerifyFreeMandatoryDocumentLines(authority: string | null): string[] {
  if (isAdminVerifyFreePdfTrafficAuthority(authority)) {
    return [...VERIFY_ADMIN_MANDATORY_DOC_TRAFFIC_LINES];
  }
  return [...VERIFY_ADMIN_MANDATORY_DOC_GENERIC_LINES];
}

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
  const documentLabel = profileFieldValueFromResolution(profile.document);
  const authorityLabel = profileFieldValueFromResolution(profile.authority);
  const originalDoc = buildAdminVerifyFreeOriginalDocumentLabel(documentLabel);
  const mandatoryDocumentLines = buildAdminVerifyFreeMandatoryDocumentLines(authorityLabel);

  const execSummary = [
    riskSignals.length > 0
      ? `결론 · 확인이 필요한 위험요인 ${riskSignals.length}건이 있어 서류 원본 검토가 필요합니다.`
      : buildAdminVerifyPaidZeroRiskConclusionLine(originalDoc),
    goal ? `확인 목적 · ${goal}` : null,
    documentLabel
      ? `문서 · ${documentLabel}`
      : "문서 · 제출 정보 기준으로 1차 확인했습니다.",
  ].filter((line): line is string => Boolean(line));

  const phase1ProfileLines: string[] = [];
  for (const [label, key] of [
    ["관련 기관", "authority"],
    ["문서", "document"],
    ["현재 단계", "currentStage"],
  ] as const) {
    const val = profileFieldValueFromResolution(profile[key]);
    if (val) phase1ProfileLines.push(`✓ ${label} · ${val}`);
  }

  const phase1ManifestLines = buildPhase1RiskSummaryLinesFromManifest(
    answers,
    resolutionProfile,
  )
    .map((line) => line.trim())
    .filter(Boolean);

  const responseLines = buildAdminVerifyResponseSummaryBlock(answers)
    .map((line) => line.trim())
    .filter(Boolean);
  let phase2ManifestLines: string[] = [];
  try {
    phase2ManifestLines = buildPhase2RiskSummaryLinesFromManifest(answers, resolutionProfile)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    phase2ManifestLines = [];
  }
  const uploadRefs = listAdminPhase2DocumentUploadRefs(activities, leadId);

  const evidencePack = packAdminVerifyPaidEvidenceKeyFindings({
    phase1ProfileLines,
    phase1ManifestLines,
    phase2ResponseLines: responseLines,
    phase2ManifestLines,
    uploadRefs,
  });
  const keyFindings = evidencePack.lines;
  const includesPhase2Block = keyFindings.includes("■ 2차 확인");

  const keyRisks: string[] = [];
  if (riskSignals.length > 0) {
    for (const signal of riskSignals) {
      keyRisks.push(`[주의] ${signal}`);
    }
  }
  keyRisks.push(ADMIN_VERIFY_PAID_PDF_KEY_RISK_CROSS_CHECK);
  if (uploadRefs.length > 0) {
    keyRisks.push(ADMIN_VERIFY_PAID_PDF_KEY_RISK_UPLOAD_SCOPE);
  }

  const immediateBody =
    riskSignals.length > 0
      ? `위험요인으로 표시된 항목을 ${originalDoc}과 대조해 주세요.`
      : `${originalDoc}의 기한과 요구 내용을 다시 확인해 주세요.`;
  const recommendedAction = includesPhase2Block
    ? [
        `① 즉시 조치 · ${immediateBody}`,
        "② 다음 조치 · 2차에 입력하신 내용과 원본 문서의 기재 내용을 대조해 주세요.",
        "③ 최종 조치 · 제출하신 자료와 답변을 함께 확인하고 전문가 안내를 받아 다음 대응을 정리해 주세요.",
      ]
    : [`① 즉시 조치 · ${immediateBody}`];

  const satisfiedCount = keyFindings.filter((line) => line.startsWith("✓")).length;
  return {
    execSummary,
    keyFindings,
    keyRisks,
    recommendedAction,
    riskCount: countAdminVerifyPaidPdfMetricGapLines(keyRisks),
    reviewedCount: satisfiedCount,
    satisfiedCount,
    includesPhase2Block,
    mandatoryDocumentLines,
    paidEvidenceOmittedItemCount: evidencePack.omittedItemCount,
    paidEvidenceOmittedItems: evidencePack.omittedItems,
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

  const documentLabel = profileFieldValueFromResolution(profile.document);
  const authorityLabel = profileFieldValueFromResolution(profile.authority);
  const originalDoc = buildAdminVerifyFreeOriginalDocumentLabel(documentLabel);

  const conclusionLine =
    riskSignals.length > 0
      ? `결론 · 확인이 필요한 위험요인 ${riskSignals.length}건이 있어 ${originalDoc}의 기재 내용을 기준으로 추가 확인이 필요합니다.`
      : `결론 · 1차 입력만으로는 위험 여부를 확정할 수 없어, ${originalDoc}와의 대조 확인이 필요합니다.`;

  const priorityLine = goal
    ? `지금 우선 · 입력하신 확인 목표에 맞춰 ${originalDoc}의 발신 기관·요구 문구부터 확인해 주세요.`
    : `지금 우선 · ${originalDoc}에서 발신 기관·제목·기한이 적힌 부분을 먼저 확인해 주세요.`;

  const execSummary = [
    conclusionLine,
    goal ? `확인 목적 · ${goal}` : null,
    priorityLine,
  ].filter((line): line is string => Boolean(line));
  for (const line of execSummary) registerDedup(line);

  const keyFindings: string[] = ["■ 1차 확인 사항"];
  const pushFinding = (line: string) => {
    const bare = line.replace(/^✓\s*/, "");
    if (goal) {
      const goalFinding = `확인 목적 · ${goal}`;
      if (
        bare === goalFinding ||
        bare === goal ||
        normalizeAdminVerifyPdfDedupKey(bare) === normalizeAdminVerifyPdfDedupKey(goalFinding)
      ) {
        return;
      }
    }
    if (/^고객 상황 · /.test(bare)) {
      const situationVal = bare.replace(/^고객 상황 ·\s*/, "");
      if (!isAdminVerifyFreePdfConcreteCustomerSituation(situationVal)) return;
    }
    const key = normalizeAdminVerifyPdfDedupKey(line);
    if (dedupKeys.has(key)) return;
    dedupKeys.add(key);
    keyFindings.push(`✓ ${bare}`);
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
  if (customerInput && isAdminVerifyFreePdfConcreteCustomerSituation(customerInput)) {
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
      : `제출 자료 · ${phase1Upload.count}건이 제출되었습니다.`;
    pushFinding(submitLine);
    pushFinding(ADMIN_VERIFY_FREE_PDF_PHASE1_UPLOAD_DISCLAIMER);
  }

  const findingBulletCount = keyFindings.filter((line) => line.startsWith("✓")).length;
  if (findingBulletCount === 0) {
    pushFinding(ADMIN_VERIFY_FREE_PDF_EMPTY_FINDINGS_LINE);
  }

  const keyRisks: string[] = [];
  if (riskSignals.length > 0) {
    for (const signal of riskSignals) {
      keyRisks.push(`[주의] ${signal}`);
    }
  }
  keyRisks.push(
    `[공백] ${originalDoc}에 적힌 기한·요구 내용·발신 기관이 아직 교차 확인되지 않았을 수 있습니다.`,
  );
  keyRisks.push(ADMIN_VERIFY_FREE_PDF_SCOPE_GAP_LINE);

  const recommendedAction = [
    `① 즉시 조치 · ${originalDoc}에서 발신 기관·제목·기한·요구 문구가 적힌 부분을 표시해 두세요.`,
    goal
      ? "② 다음 조치 · 확인 목표에 맞춰 아직 확인하지 못한 항목을 정리하고, 원본과 대조할 위치를 표시해 주세요."
      : `② 다음 조치 · 1차에 정리한 상황과 ${originalDoc}를 나란히 놓고 아직 확인하지 못한 항목을 정리해 주세요.`,
    "③ 최종 조치 · 필요하면 상세 검토를 통해 제출 자료와 답변을 함께 확인하고 다음 대응 방향을 정리해 주세요.",
  ];

  const mandatoryDocumentLines = buildAdminVerifyFreeMandatoryDocumentLines(authorityLabel);

  const executiveDashboardSupplementLines = [
    phase1Upload
      ? ADMIN_VERIFY_FREE_PDF_DASHBOARD_INPUT_SCOPE_WITH_UPLOAD
      : ADMIN_VERIFY_FREE_PDF_DASHBOARD_INPUT_SCOPE_NO_UPLOAD,
    phase1Upload
      ? ADMIN_VERIFY_FREE_PDF_DASHBOARD_REVIEW_SCOPE_WITH_UPLOAD
      : ADMIN_VERIFY_FREE_PDF_DASHBOARD_REVIEW_SCOPE_NO_UPLOAD,
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
  if (fromLog.length >= 3) {
    return fromLog.slice(-4).map((entry) => ({
      label: mapVerifyAdminExpertMypageTimelineDisplayLabel(entry.label),
      createdAt: entry.createdAt,
    }));
  }
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
    const expertEntry = input.activityLog.find(
      (entry) => entry.label === VERIFY_ADMIN_EXPERT_REVIEW_ACTIVITY_LOG_LABEL,
    );
    if (expertEntry) {
      fallback.push({
        label: VERIFY_ADMIN_EXPERT_REQUEST_TIMELINE_LABEL,
        createdAt: expertEntry.createdAt,
      });
    }
  }
  return fallback
    .map((entry) => ({
      label: mapVerifyAdminExpertMypageTimelineDisplayLabel(entry.label),
      createdAt: entry.createdAt,
    }))
    .filter((entry) => verifyAdminTimelineEntryAllowed(entry.label, input.hasExpertReview));
}
