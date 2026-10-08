import { REAL_ESTATE_FIRST_RESULT_PACK_META } from "./generated/meta";
import type { AnswerMap, RealEstateCaseId } from "./types";

export type FirstResultNoRiskFloorCopy = { title: string; body: string };

/** Pack 메타 + (향후) 답변 분기 lookup — 엔진 하드코딩 문구 없음 */
export function resolveFirstResultNoRiskFloorCopy(
  caseId: RealEstateCaseId,
  _answers: AnswerMap,
): FirstResultNoRiskFloorCopy | null {
  const meta = REAL_ESTATE_FIRST_RESULT_PACK_META[caseId];
  const title = meta?.firstResultNoRiskFloorTitle?.trim() ?? "";
  const body = meta?.firstResultNoRiskFloorBody?.trim() ?? "";
  if (!title || !body) return null;
  return { title, body };
}
