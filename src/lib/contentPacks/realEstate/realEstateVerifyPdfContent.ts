import {
  ADMIN_VERIFY_FREE_PDF_DASHBOARD_INPUT_SCOPE_NO_UPLOAD,
  ADMIN_VERIFY_FREE_PDF_DASHBOARD_REVIEW_SCOPE_NO_UPLOAD,
  ADMIN_VERIFY_FREE_PDF_SCOPE_GAP_LINE,
  ADMIN_VERIFY_PAID_PDF_KEY_RISK_CROSS_CHECK,
  ADMIN_VERIFY_PAID_PDF_KEY_RISK_UPLOAD_SCOPE,
  buildAdminVerifyFreeOriginalDocumentLabel,
  buildAdminVerifyPaidZeroRiskConclusionLine,
  countAdminVerifyPaidPdfMetricGapLines,
  isAdminPhase2DocumentsUploadComplete,
  listAdminPhase2DocumentUploadRefs,
  packAdminVerifyPaidEvidenceKeyFindings,
  type AdminVerifyAiReportContent,
  type CrmActivityLike,
} from "@/lib/adminVerifyMypageFields";
import { resolveCaseFromAnswers } from "../runner";
import { buildPackPersonalizedResult } from "./personalizedResultBuilder";
import {
  REAL_ESTATE_PACK_HEADLINE_META_KEY,
  parsePackAnswersFromActivities,
} from "./packPhase2Persist";
import {
  buildRealEstatePhase1SummaryLinesFromActivities,
  buildRealEstatePhase2SummaryLinesFromActivities,
} from "./realEstatePackMypageFields";

const REAL_ESTATE_FREE_PDF_MANDATORY_DOCUMENT_LINES = [
  "매매·임대 계약서 및 부속 약정 — 당사자·물건·조건 확인용",
  "등기·권리 관련 서류 — 소유·담보·제한 권리 대조용",
] as const;

function findLatestMetaString(activities: CrmActivityLike[], key: string): string | null {
  for (let i = activities.length - 1; i >= 0; i -= 1) {
    const meta = activities[i]?.meta;
    if (!meta || typeof meta !== "object") continue;
    const raw = (meta as Record<string, unknown>)[key];
    if (typeof raw === "string" && raw.trim()) return raw.trim();
  }
  return null;
}

export function isVerifyRealEstateFreeAiReportPdfActivities(activities: CrmActivityLike[]): boolean {
  return !isAdminPhase2DocumentsUploadComplete(activities);
}

export function isVerifyRealEstatePaidAiReportPdfActivities(activities: CrmActivityLike[]): boolean {
  if (!isAdminPhase2DocumentsUploadComplete(activities)) return false;
  const answers = parsePackAnswersFromActivities(activities);
  return Boolean(answers && Object.keys(answers).length > 0);
}

export function buildRealEstateVerifyAiReportContentFromActivities(
  activities: CrmActivityLike[],
  leadId: string,
): AdminVerifyAiReportContent | null {
  const answers = parsePackAnswersFromActivities(activities);
  if (!answers || Object.keys(answers).length === 0) return null;

  const caseId = resolveCaseFromAnswers(answers);
  const personalized = buildPackPersonalizedResult(caseId, answers);
  const headline =
    findLatestMetaString(activities, REAL_ESTATE_PACK_HEADLINE_META_KEY)?.trim() ||
    personalized?.statusHeadline?.trim() ||
    personalized?.situationSummary?.split(/(?<=[.!?…])\s+/)[0]?.trim() ||
    null;

  const riskSignals = (personalized?.cautions ?? [])
    .map((c) => String(c).trim())
    .filter(Boolean);
  const originalDoc = buildAdminVerifyFreeOriginalDocumentLabel("부동산 관련 서류");

  if (isVerifyRealEstatePaidAiReportPdfActivities(activities)) {
    const phase1Lines = buildRealEstatePhase1SummaryLinesFromActivities(activities);
    const phase2Lines = buildRealEstatePhase2SummaryLinesFromActivities(activities);

    const execSummary = [
      riskSignals.length > 0
        ? `결론 · 확인이 필요한 위험요인 ${riskSignals.length}건이 있어 서류 원본 검토가 필요합니다.`
        : buildAdminVerifyPaidZeroRiskConclusionLine(originalDoc),
      headline ? `확인 목적 · ${headline}` : null,
      "문서 · 제출 정보 기준으로 1·2차 확인했습니다.",
    ].filter((line): line is string => Boolean(line));

    const uploadRefs = listAdminPhase2DocumentUploadRefs(activities, leadId);
    const evidencePack = packAdminVerifyPaidEvidenceKeyFindings({
      phase1ProfileLines: [],
      phase1ManifestLines: phase1Lines,
      phase2ResponseLines: phase2Lines,
      phase2ManifestLines: [],
      uploadRefs,
    });
    const keyFindings = evidencePack.lines;
    const includesPhase2Block = keyFindings.includes("■ 2차 확인");

    const keyRisks: string[] = [];
    for (const signal of riskSignals) {
      keyRisks.push(`[주의] ${signal}`);
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
      : [
          `① 즉시 조치 · ${immediateBody}`,
          "② 다음 조치 · 1차에 정리한 상황과 원본 문서를 나란히 놓고 아직 확인하지 못한 항목을 정리해 주세요.",
          "③ 최종 조치 · 필요하면 상세 검토를 통해 제출 자료와 답변을 함께 확인하고 다음 대응 방향을 정리해 주세요.",
        ];

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
      paidEvidenceOmittedItemCount: evidencePack.omittedItemCount,
      paidEvidenceOmittedItems: evidencePack.omittedItems,
    };
  }

  const phase1Lines = buildRealEstatePhase1SummaryLinesFromActivities(activities);
  const conclusionLine =
    riskSignals.length > 0
      ? `결론 · 확인이 필요한 위험요인 ${riskSignals.length}건이 있어 ${originalDoc}의 기재 내용을 기준으로 추가 확인이 필요합니다.`
      : `결론 · 1차 입력만으로는 위험 여부를 확정할 수 없어, ${originalDoc}와의 대조 확인이 필요합니다.`;

  const execSummary = [
    conclusionLine,
    headline ? `확인 목적 · ${headline}` : null,
    `지금 우선 · ${originalDoc}에서 당사자·물건·조건이 적힌 부분을 먼저 확인해 주세요.`,
  ].filter((line): line is string => Boolean(line));

  const keyFindings: string[] = ["■ 1차 확인 사항"];
  for (const line of phase1Lines) {
    const trimmed = line.trim();
    if (trimmed) keyFindings.push(`✓ ${trimmed}`);
  }
  if (keyFindings.filter((l) => l.startsWith("✓")).length === 0) {
    keyFindings.push("✓ 1차 질문 답변을 기준으로 상황을 정리했습니다.");
  }

  const keyRisks: string[] = [];
  for (const signal of riskSignals) {
    keyRisks.push(`[주의] ${signal}`);
  }
  keyRisks.push(
    `[공백] ${originalDoc}에 적힌 기한·조건·당사자 정보가 아직 교차 확인되지 않았을 수 있습니다.`,
  );
  keyRisks.push(ADMIN_VERIFY_FREE_PDF_SCOPE_GAP_LINE);

  const recommendedAction = [
    `① 즉시 조치 · ${originalDoc}에서 당사자·물건·조건이 적힌 부분을 표시해 두세요.`,
    "② 다음 조치 · 1차에 정리한 상황과 원본 문서를 나란히 놓고 아직 확인하지 못한 항목을 정리해 주세요.",
    "③ 최종 조치 · 필요하면 상세 검토를 통해 제출 자료와 답변을 함께 확인하고 다음 대응 방향을 정리해 주세요.",
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
    mandatoryDocumentLines: [...REAL_ESTATE_FREE_PDF_MANDATORY_DOCUMENT_LINES],
    executiveDashboardSupplementLines: [
      ADMIN_VERIFY_FREE_PDF_DASHBOARD_INPUT_SCOPE_NO_UPLOAD,
      ADMIN_VERIFY_FREE_PDF_DASHBOARD_REVIEW_SCOPE_NO_UPLOAD,
    ],
  };
}
