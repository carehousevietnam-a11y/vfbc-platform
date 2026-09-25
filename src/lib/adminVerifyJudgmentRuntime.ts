import type { ReviewAnswers } from "@/components/cost-check/MasterReviewQuotationReport";
import type { CaseResolutionProfile } from "@/lib/adminVerifyProfiling";
import {
  CASE02_NON_PAYMENT_SANCTION_STATED,
  CASE03_DEADLINE_DATE_KEY,
  CASE04_DEADLINE_DATE_KEY,
  CASE05_DEADLINE_DATE_KEY,
  case02NormalizeNonPaymentNoticeValue,
  getAdminChoiceNoteKey,
  getQ1ResolvedCase,
  type MasterCaseId,
} from "@/lib/adminVerifyProfiling";
import {
  CASE06_PAYMENT_AMOUNT_TEXT_KEY,
  isCase06LegacyRestorePath,
  resolveCase06Phase2ChainId,
} from "@/lib/adminVerifyCase06Redesign";
import { effectiveAdminVerifyJudgmentSlug } from "@/lib/adminVerifyIntegratedSlug";
import { formatJudgmentClause } from "@/lib/adminVerifyJudgmentManifest";
import {
  LAYER_J_JUDGMENT_FIELD_SPECS,
  type LayerJOutlet,
  type LayerJJudgmentFieldSpec,
} from "@/lib/adminVerifyJudgmentFieldRegistry";
import { getAdminVerifyChoiceOptionsForField } from "@/lib/adminVerifyProfiling";

const PHASE1_FIELD_ORDER: Partial<Record<MasterCaseId, string[]>> = {
  CASE_01: [
    "case01_violationContent",
    "case01_authorityDemand",
    "case01_customerResponded",
    "case01_responseDetail",
    "case01_deadline",
  ],
  CASE_02: [
    "case02_paymentSubject",
    "case02_confirmGoal",
    "case02_demandAuthority",
    "case02_paymentStatus",
    "case02_deadline",
  ],
  CASE_03: [
    "case03_authorityDemand",
    "case03_confirmGoal",
    "case03_customerResponse",
    "case03_deadline",
  ],
  CASE_04: [
    "case04_supplementTarget",
    "case04_confirmGoal",
    "case04_customerResponse",
    "case04_deadline",
  ],
  CASE_05: [
    "case05_dispositionType",
    "case05_confirmGoal",
    "case05_customerResponse",
    "case05_deadline",
  ],
  CASE_06: [
    "case06_documentNature",
    "case06_requiredActionCandidate",
    "case06_confirmGoal",
    "case06_deadline",
  ],
};

const PHASE2_PRIMARY_FIELD: Partial<Record<MasterCaseId, string>> = {
  CASE_01: "case01_factRelationship",
  CASE_02: "case02_situationMatch",
  CASE_03: "case03_factRelationship",
  CASE_04: "case04_submissionRelation",
  CASE_05: "case05_factRelationship",
  CASE_06: "case06_paymentSituationMatch",
};

function findSpec(
  caseCode: string,
  outlet: LayerJOutlet,
  fieldId: string,
): LayerJJudgmentFieldSpec | undefined {
  return LAYER_J_JUDGMENT_FIELD_SPECS.find(
    (s) => s.caseCode === caseCode && s.outlet === outlet && s.fieldId === fieldId,
  );
}

function choiceLabelForSlug(fieldId: string, slug: string): string {
  const options = getAdminVerifyChoiceOptionsForField(fieldId);
  const hit = options?.find((o) => o.value === slug);
  return hit?.label ?? slug;
}

export function buildManifestClauseForField(
  answers: ReviewAnswers,
  caseCode: string,
  outlet: LayerJOutlet,
  fieldId: string,
  rawValue?: string,
): string | null {
  const spec = findSpec(caseCode, outlet, fieldId);
  if (!spec) return null;
  const raw = rawValue ?? answers[fieldId];
  const slug = effectiveAdminVerifyJudgmentSlug(fieldId, raw);
  if (!slug) return null;
  const noteKey = getAdminChoiceNoteKey(fieldId);
  const note = answers[noteKey]?.trim();
  try {
    return formatJudgmentClause({
      spec,
      slug,
      choiceLabel: choiceLabelForSlug(fieldId, slug),
      note,
    });
  } catch {
    return null;
  }
}

function caseCodeFromMaster(caseId: MasterCaseId): string {
  return caseId.replace("CASE_", "");
}

export function buildPhase1RiskSummaryFromManifest(
  answers: ReviewAnswers,
  _profile: CaseResolutionProfile,
): string {
  const q1 = getQ1ResolvedCase(answers);
  if (!q1 || q1 === "UNIVERSAL") {
    return "1차 확인에서는 기본적인 상황 정리가 완료된 상태입니다.";
  }
  const caseCode = caseCodeFromMaster(q1);
  const fields = PHASE1_FIELD_ORDER[q1] ?? [];
  const parts: string[] = [];
  for (const fieldId of fields) {
    if (fieldId === "case01_customerResponded") {
      const responseDetailClause = buildManifestClauseForField(
        answers,
        caseCode,
        "§03·1차",
        "case01_responseDetail",
      );
      if (responseDetailClause) continue;
    }
    if (fieldId === "case01_responseDetail") {
      const responded = effectiveAdminVerifyJudgmentSlug(
        "case01_customerResponded",
        answers.case01_customerResponded,
      );
      if (responded !== "has_responded" && answers.case01_customerResponded !== "has_responded") {
        continue;
      }
    }
    const clause = buildManifestClauseForField(answers, caseCode, "§03·1차", fieldId);
    if (clause) parts.push(clause);
  }
  if (parts.length === 0) {
    return "1차 확인에서는 기본적인 상황 정리가 완료된 상태입니다.";
  }
  return parts.join(" ");
}

export function buildPhase2RiskSummaryFromManifest(
  answers: ReviewAnswers,
  profile: CaseResolutionProfile,
): string {
  const q1 = getQ1ResolvedCase(answers);
  if (!q1 || q1 === "UNIVERSAL") {
    return "2차 답변에서 추가로 확인된 위험 요인은 현재 보이지 않습니다.";
  }
  const caseCode = caseCodeFromMaster(q1);

  if (q1 === "CASE_02") {
    const noticeForPhase2Summary = case02NormalizeNonPaymentNoticeValue(
      answers.case02_nonPaymentNotice,
    );
    if (
      noticeForPhase2Summary === "interest_stated" ||
      noticeForPhase2Summary === CASE02_NON_PAYMENT_SANCTION_STATED
    ) {
      return "2차 추가 확인에서는 미납 시 추가 조치 안내가 있음 — 기한·내용 확인이 필요합니다.";
    }
  }

  if (q1 === "CASE_03") {
    const deadlineText = answers[CASE03_DEADLINE_DATE_KEY]?.trim();
    if (deadlineText) {
      return `2차 추가 확인에서는 응답에 정리한 출석·소명 기한(${deadlineText})이 핵심입니다.`;
    }
  }

  if (q1 === "CASE_04") {
    const deadlineText = answers[CASE04_DEADLINE_DATE_KEY]?.trim();
    if (deadlineText) {
      return `2차 추가 확인에서는 응답에 정리한 보완 제출 기한(${deadlineText})이 핵심입니다.`;
    }
  }

  if (q1 === "CASE_05") {
    const deadlineText = answers[CASE05_DEADLINE_DATE_KEY]?.trim();
    if (deadlineText) {
      return `2차 추가 확인에서는 응답에 정리한 처분 관련 대응 기한(${deadlineText})이 핵심입니다.`;
    }
  }

  if (q1 === "CASE_06") {
    if (!isCase06LegacyRestorePath(answers) && resolveCase06Phase2ChainId(answers) === 1) {
      const amountText = answers[CASE06_PAYMENT_AMOUNT_TEXT_KEY]?.trim();
      if (amountText) {
        return `2차 추가 확인에서는 응답에 정리한 납부 금액(${amountText})이 핵심입니다.`;
      }
    }
  }

  const primary = PHASE2_PRIMARY_FIELD[q1];
  if (primary) {
    const clause = buildManifestClauseForField(answers, caseCode, "§03·2차", primary);
    if (clause) return clause;
  }

  const rel = profile.actualSituation.value;
  const blockage = profile.currentBlockage.value;
  const evidence = profile.evidence.value;
  if (rel && rel !== "서류 내용과 실제 상황이 일치한다고 응답") {
    return `2차 추가 확인에서는 ${rel} 쪽으로 정리됩니다.`;
  }
  if (blockage) {
    return `2차 추가 확인에서는 ${blockage} 부분이 현재 가장 막혀 있는 상태입니다.`;
  }
  if (evidence && (evidence.includes("없") || evidence.includes("부족"))) {
    return "2차 추가 확인에서는 확인 가능한 자료가 제한적인 상태입니다.";
  }
  return "2차 답변에서 추가로 확인된 위험 요인은 현재 보이지 않습니다.";
}

export function resolveIntegratedSituationFragment(
  answers: ReviewAnswers,
  caseCode: string,
  fieldId: string,
): string | null {
  return buildManifestClauseForField(answers, caseCode, "§01·integrated", fieldId);
}
