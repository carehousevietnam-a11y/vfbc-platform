import type { LayerJJudgmentFieldSpec } from "@/lib/adminVerifyJudgmentFieldRegistry";
import { LAYER_J_CLAUSE_MAP } from "@/lib/adminVerifyJudgmentClauses.data";

export function resolveLayerJClause(input: {
  spec: LayerJJudgmentFieldSpec;
  slug: string;
  choiceLabel: string;
}): string {
  const key = `${input.spec.caseCode}|${input.spec.outlet}|${input.spec.fieldId}|${input.slug}`;
  const mapped = LAYER_J_CLAUSE_MAP[key];
  if (mapped) return mapped;
  if (input.slug === "other" || input.slug === "direct_explain") {
    throw new Error(`J2 fallback required for ${key}`);
  }
  throw new Error(`Missing Layer J clause: ${key}`);
}
