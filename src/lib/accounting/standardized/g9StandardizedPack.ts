import type { AccountingPackQuestion } from "../funnel/types";

/** G9 standardized form — structure only; ko/vi text slots stay empty until Content Pack arrives. */
export const G9_STANDARDIZED_PACK_ID = "G9_STANDARDIZED_PACK";

const emptyText = { ko: "", vi: "" };

function slotQuestion(id: string, choiceIds: string[]): AccountingPackQuestion {
  return {
    id,
    text: emptyText,
    allow_direct_input: true,
    sources: [],
    choices: choiceIds.map((choiceId) => ({ id: choiceId, label: emptyText })),
  };
}

/** One stage-1 question skeleton (max 5 choices + direct input). */
export const G9_STANDARDIZED_QUESTIONS: AccountingPackQuestion[] = [
  slotQuestion("g9_q1", ["g9_q1_c1", "g9_q1_c2", "g9_q1_c3", "g9_q1_c4", "g9_q1_c5"]),
];

export function isStandardizedSubmitEnabled(fieldMap: Record<string, unknown> | null | undefined): boolean {
  const gates = fieldMap?.gates;
  if (!gates || typeof gates !== "object") return false;
  const submit = (gates as Record<string, unknown>).standardized_submit;
  return submit === true;
}
