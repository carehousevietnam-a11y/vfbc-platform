import type { ReviewAnswers } from "@/components/cost-check/MasterReviewQuotationReport";
import type { CaseResolutionProfile } from "@/lib/adminVerifyProfiling";
import {
  buildAdminVerifyProfileQuestions,
  getAdminVerifyPhase2ProductQuestionIds,
  getCase01Phase2ProductQuestionIds,
  getAdminChoiceNoteKey,
  getQ1ResolvedCase,
  isAdminVerifyChoiceFieldComplete,
  type MasterCaseId,
} from "@/lib/adminVerifyProfiling";
import { resolveCase06Phase2ManifestFieldOrder } from "@/lib/adminVerifyCase06Redesign";
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

const PHASE2_EMPTY_COPY =
  "2차 답변에서 추가로 확인된 위험 요인은 현재 보이지 않습니다.";

const PHASE2_PRODUCT_EMPTY_FOLLOW: Record<string, never> = {};
const PHASE2_PRODUCT_EMPTY_DOCS = {
  mismatch: [] as { value: string; title: string }[],
  unknown: [] as { value: string; title: string }[],
  other: [] as { value: string; title: string }[],
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

function caseAnswerIdPrefix(caseId: MasterCaseId): string {
  return `case${caseId.replace("CASE_", "").padStart(2, "0")}`;
}

function getPhase1ProductQuestionIds(answers: ReviewAnswers, caseId: MasterCaseId): Set<string> {
  const prefix = caseAnswerIdPrefix(caseId);
  const qs = buildAdminVerifyProfileQuestions(
    answers,
    PHASE2_PRODUCT_EMPTY_FOLLOW,
    PHASE2_PRODUCT_EMPTY_DOCS,
    1,
  );
  return new Set(qs.filter((q) => q.id.startsWith(prefix)).map((q) => q.id));
}

/** P1-3 — CASE별 2차 질문 경로 fieldId 순서. */
export function resolvePhase2ManifestFieldOrder(
  caseId: MasterCaseId,
  answers: ReviewAnswers,
): string[] {
  let rawIds: string[];
  if (caseId === "CASE_01") {
    rawIds = getCase01Phase2ProductQuestionIds(answers);
  } else if (caseId === "CASE_06") {
    rawIds = resolveCase06Phase2ManifestFieldOrder(answers);
  } else {
    rawIds = getAdminVerifyPhase2ProductQuestionIds(answers, caseId);
  }

  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const id of rawIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    deduped.push(id);
  }
  return deduped;
}

function normalizeClauseForPhase2Dedup(clause: string): string {
  return clause
    .replace(/^1차 확인에서는\s*/, "")
    .replace(/^2차 추가 확인에서는\s*/, "")
    .replace(/[\s·.,，、!?！？]+/g, " ")
    .trim();
}

function isPhase2ManifestFieldComplete(fieldId: string, answers: ReviewAnswers): boolean {
  const options = getAdminVerifyChoiceOptionsForField(fieldId);
  if (options?.length) {
    return isAdminVerifyChoiceFieldComplete(fieldId, answers, [...options]);
  }
  return Boolean(answers[fieldId]?.trim());
}

function shouldSkipPhase2SameAsPhase1(
  answers: ReviewAnswers,
  caseCode: string,
  fieldId: string,
  phase1QuestionIds: Set<string>,
  phase2QuestionIds: Set<string>,
): boolean {
  if (!phase1QuestionIds.has(fieldId) || !phase2QuestionIds.has(fieldId)) {
    return false;
  }
  const slug = effectiveAdminVerifyJudgmentSlug(fieldId, answers[fieldId]);
  if (!slug) return true;
  return Boolean(buildManifestClauseForField(answers, caseCode, "§03·1차", fieldId));
}

function profilePhase2FallbackLines(profile: CaseResolutionProfile): string[] {
  const rel = profile.actualSituation.value;
  const blockage = profile.currentBlockage.value;
  const evidence = profile.evidence.value;
  if (rel && rel !== "서류 내용과 실제 상황이 일치한다고 응답") {
    return [`2차 추가 확인에서는 ${rel} 쪽으로 정리됩니다.`];
  }
  if (blockage) {
    return [`2차 추가 확인에서는 ${blockage} 부분이 현재 가장 막혀 있는 상태입니다.`];
  }
  if (evidence && (evidence.includes("없") || evidence.includes("부족"))) {
    return ["2차 추가 확인에서는 확인 가능한 자료가 제한적인 상태입니다."];
  }
  return [];
}

export type Phase2ManifestSummarySelection = {
  fieldIds: string[];
  lines: string[];
  usedProfileFallback: boolean;
};

export function resolvePhase2ManifestSummarySelection(
  answers: ReviewAnswers,
  profile: CaseResolutionProfile,
): Phase2ManifestSummarySelection {
  const q1 = getQ1ResolvedCase(answers);
  if (!q1 || q1 === "UNIVERSAL") {
    return { fieldIds: [], lines: [PHASE2_EMPTY_COPY], usedProfileFallback: false };
  }
  const caseCode = caseCodeFromMaster(q1);
  const order = resolvePhase2ManifestFieldOrder(q1, answers);
  const phase1QuestionIds = getPhase1ProductQuestionIds(answers, q1);
  const phase2QuestionIds = new Set(order);
  const normalizedSeen = new Set<string>();
  const lines: string[] = [];
  const fieldIds: string[] = [];

  for (const fieldId of order) {
    if (lines.length >= 3) break;
    if (!phase2QuestionIds.has(fieldId)) continue;
    if (!isPhase2ManifestFieldComplete(fieldId, answers)) continue;
    if (!findSpec(caseCode, "§03·2차", fieldId)) continue;
    if (shouldSkipPhase2SameAsPhase1(answers, caseCode, fieldId, phase1QuestionIds, phase2QuestionIds)) {
      continue;
    }
    const clause = buildManifestClauseForField(answers, caseCode, "§03·2차", fieldId);
    if (!clause) continue;

    const phase1Clause = buildManifestClauseForField(answers, caseCode, "§03·1차", fieldId);
    const norm = normalizeClauseForPhase2Dedup(clause);
    if (phase1Clause && normalizeClauseForPhase2Dedup(phase1Clause) === norm) {
      continue;
    }
    if (normalizedSeen.has(norm)) continue;
    normalizedSeen.add(norm);
    lines.push(clause);
    fieldIds.push(fieldId);
  }

  if (lines.length === 0) {
    const fallback = profilePhase2FallbackLines(profile);
    if (fallback.length > 0) {
      return { fieldIds: [], lines: fallback, usedProfileFallback: true };
    }
    return { fieldIds: [], lines: [PHASE2_EMPTY_COPY], usedProfileFallback: false };
  }
  return { fieldIds, lines, usedProfileFallback: false };
}

export function buildPhase2RiskSummaryLinesFromManifest(
  answers: ReviewAnswers,
  profile: CaseResolutionProfile,
): string[] {
  return resolvePhase2ManifestSummarySelection(answers, profile).lines;
}

export function buildPhase1RiskSummaryLinesFromManifest(
  answers: ReviewAnswers,
  profile: CaseResolutionProfile,
): string[] {
  const q1 = getQ1ResolvedCase(answers);
  if (!q1 || q1 === "UNIVERSAL") {
    return ["1차 확인에서는 기본적인 상황 정리가 완료된 상태입니다."];
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
    return ["1차 확인에서는 기본적인 상황 정리가 완료된 상태입니다."];
  }
  return parts
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function buildPhase1RiskSummaryFromManifest(
  answers: ReviewAnswers,
  profile: CaseResolutionProfile,
): string {
  return buildPhase1RiskSummaryLinesFromManifest(answers, profile).join(" ");
}

export function buildPhase2RiskSummaryFromManifest(
  answers: ReviewAnswers,
  profile: CaseResolutionProfile,
): string {
  return buildPhase2RiskSummaryLinesFromManifest(answers, profile).join(" ");
}

export function resolveIntegratedSituationFragment(
  answers: ReviewAnswers,
  caseCode: string,
  fieldId: string,
): string | null {
  return buildManifestClauseForField(answers, caseCode, "§01·integrated", fieldId);
}
