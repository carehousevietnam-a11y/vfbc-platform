import { REAL_ESTATE_FIRST_RESULT_PACK_META } from "./generated/meta";
import type { AnswerMap, RealEstateCaseId } from "./types";

export function hasFirstResultVerdictFloor(caseId: RealEstateCaseId): boolean {
  return Boolean(REAL_ESTATE_FIRST_RESULT_PACK_META[caseId]?.firstResultVerdictFloor);
}

export function hasPhase1VerdictBoost(caseId: RealEstateCaseId, answers: AnswerMap): boolean {
  const values = REAL_ESTATE_FIRST_RESULT_PACK_META[caseId]?.phase1VerdictBoost ?? [];
  if (!values.length) return false;
  const selected = new Set(
    Object.values(answers)
      .flatMap((v) => (Array.isArray(v) ? v : [v]))
      .map(String),
  );
  return values.some((v) => selected.has(v));
}
