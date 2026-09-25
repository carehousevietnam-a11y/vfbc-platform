/**
 * CASE_01 Phase2 실질 축 — Brief v3 §3 (DQ-V04 = C, 비율 보정 게이트 없음).
 * 비율 PASS: Phase2 실질 축 수 > Phase1 실질 축 수 (대표 승인 2026-09-25).
 */

import type { ReviewAnswers } from "../components/cost-check/MasterReviewQuotationReport";

const CASE01_FACT_COMPARE_GAP_KEY = "case01_factCompareGap";

const CASE01_PAYMENT_DEMANDS = new Set(["payment", "pay_core_traffic", "pay_bundled"]);
const CASE01_ATTEND_DEMANDS = new Set(["attend_explain", "attendance"]);
const CASE01_SUPPLEMENT_DEMANDS = new Set(["supplement", "supplement_core"]);

/** §3 기호 순서 — 조합 표 「기호 순」과 동일 */
export const CASE01_PHASE2_SUBSTANTIVE_AXIS_CATALOG: readonly {
  symbol: string;
  fieldId: string;
}[] = [
  { symbol: "A", fieldId: "case01_authorityDemand" },
  { symbol: "B", fieldId: "case01_actualSituation" },
  { symbol: "G", fieldId: "case01_evidence" },
  { symbol: "H", fieldId: "case01_blockage" },
  { symbol: "C", fieldId: "case01_factConflictFacet" },
  { symbol: "D", fieldId: "case01_spatiotemporalFacet" },
  { symbol: "J", fieldId: "case01_compareRecordGap" },
  { symbol: "K", fieldId: "case01_languageAccessFact" },
  { symbol: "E", fieldId: "case01_responseDetail" },
  { symbol: "Ff", fieldId: "case01_authorityFollowUpKind" },
  { symbol: "L", fieldId: "case01_noticeDeliveryFact" },
  { symbol: "Q", fieldId: "case01_procedureStageFact" },
  { symbol: "O", fieldId: "case01_officeIdentityFact" },
  { symbol: "P", fieldId: "case01_paymentInstructionFact" },
  { symbol: "M", fieldId: "case01_attendInstructionFact" },
  { symbol: "S", fieldId: "case01_supplementInstructionFact" },
  { symbol: "T", fieldId: "case01_correctTargetFact" },
  { symbol: "U", fieldId: "case01_unclearDemandFact" },
];

const SYMBOL_BY_FIELD = new Map(
  CASE01_PHASE2_SUBSTANTIVE_AXIS_CATALOG.map((row) => [row.fieldId, row.symbol]),
);

function case01CustomerRespondedIsNoContact(answers: ReviewAnswers): boolean {
  const v = answers.case01_customerResponded;
  return v === "no_contact_yet" || v === "none";
}

function case01CustomerRespondedIsHasResponded(answers: ReviewAnswers): boolean {
  return answers.case01_customerResponded === "has_responded";
}

/** Brief v3 §3 — 해당 Phase2 facet 질문 노출 여부 (A/B/G/H 등 기존 축 제외). */
export function case01IsPhase2FacetOnPath(fieldId: string, answers: ReviewAnswers): boolean {
  return case01Phase2AxisExposed(fieldId, answers);
}

function case01Phase2AxisExposed(fieldId: string, answers: ReviewAnswers): boolean {
  const rel = answers.case01_factRelationship;
  const demand = answers.case01_authorityDemand;
  const gap = answers[CASE01_FACT_COMPARE_GAP_KEY];
  const notice = answers.case01_noticeDeliveryFact;

  switch (fieldId) {
    case "case01_authorityDemand":
    case "case01_actualSituation":
    case "case01_evidence":
    case "case01_blockage":
      return true;
    case "case01_factConflictFacet":
      return rel === "date_place_wrong";
    case "case01_spatiotemporalFacet":
      return rel === "date_place_wrong" || rel === "cannot_compare_yet";
    case "case01_compareRecordGap":
      return rel === "cannot_compare_yet";
    case "case01_languageAccessFact":
      return (
        gap === "gap_hearsay_channel" ||
        gap === "gap_language_access" ||
        demand === "demand_unclear"
      );
    case "case01_responseDetail":
      return case01CustomerRespondedIsHasResponded(answers);
    case "case01_authorityFollowUpKind":
      return case01CustomerRespondedIsHasResponded(answers);
    case "case01_noticeDeliveryFact":
      return case01CustomerRespondedIsNoContact(answers);
    case "case01_procedureStageFact":
      return (
        case01CustomerRespondedIsNoContact(answers) &&
        (notice === "del_phone_message" || notice === "del_written_only")
      );
    case "case01_officeIdentityFact":
      return case01CustomerRespondedIsNoContact(answers) && rel === "match";
    case "case01_paymentInstructionFact":
      return CASE01_PAYMENT_DEMANDS.has(demand ?? "");
    case "case01_attendInstructionFact":
      return CASE01_ATTEND_DEMANDS.has(demand ?? "");
    case "case01_supplementInstructionFact":
      return CASE01_SUPPLEMENT_DEMANDS.has(demand ?? "");
    case "case01_correctTargetFact":
      return demand === "correct_record";
    case "case01_unclearDemandFact":
      return demand === "demand_unclear";
    default:
      return false;
  }
}

/** §3 조건 충족 Phase2 실질 축 id (기호 순). */
export function case01Phase2SubstantiveAxisIdsOnPath(answers: ReviewAnswers): string[] {
  const ids: string[] = [];
  for (const row of CASE01_PHASE2_SUBSTANTIVE_AXIS_CATALOG) {
    if (case01Phase2AxisExposed(row.fieldId, answers)) {
      ids.push(row.fieldId);
    }
  }
  return ids;
}

export function case01Phase2SubstantiveAxisSymbolsOnPath(answers: ReviewAnswers): string[] {
  return case01Phase2SubstantiveAxisIdsOnPath(answers).map(
    (id) => SYMBOL_BY_FIELD.get(id) ?? id,
  );
}

/** P1 실질 N — v3 §3 */
export function case01Phase1SubstantiveAxisCount(answers: ReviewAnswers): number {
  const rel = answers.case01_factRelationship;
  if (!rel) return 0;
  if (rel !== "cannot_compare_yet") return 5;
  if (answers[CASE01_FACT_COMPARE_GAP_KEY]?.trim()) return 6;
  return 5;
}

export function case01Phase2SubstantiveAxisCountOnPath(answers: ReviewAnswers): number {
  return case01Phase2SubstantiveAxisIdsOnPath(answers).length;
}

/** Phase2 실질 축 수 > Phase1 실질 축 수 */
export function case01Phase2ExceedsPhase1SubstantiveDepth(answers: ReviewAnswers): boolean {
  const p1 = case01Phase1SubstantiveAxisCount(answers);
  const p2 = case01Phase2SubstantiveAxisCountOnPath(answers);
  if (p1 <= 0) return false;
  return p2 > p1;
}
