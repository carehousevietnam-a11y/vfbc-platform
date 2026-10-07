import type { AnswerMap } from "./types";
import type { RealEstateCaseId } from "./types";
import { nodeVisibleForPack } from "./showIfNormalize";
import { realEstatePackBundle } from "./packBundle";
import { phase2ChainFromF } from "./fPathResolve";
import { REAL_ESTATE_RE01_GOAL_ADJUST_RAW } from "./generated/meta";

const bundle = realEstatePackBundle();

export function realEstatePhase2QuestionIds(caseId: RealEstateCaseId, answers: AnswerMap): string[] {
  const fromF = phase2ChainFromF(caseId, answers);
  const order =
    fromF.length > 0
      ? fromF
      : (bundle.nodes[caseId] ?? []).filter((n) => n.phase === 2).map((n) => n.id);
  const byId = new Map((bundle.nodes[caseId] ?? []).map((n) => [n.id, n]));
  const out: string[] = [];
  for (const id of order) {
    const node = byId.get(id);
    if (!node?.showIf) continue;
    if (nodeVisibleForPack(node, answers, caseId)) out.push(id);
  }
  return out;
}

export { phase2ChainFromF } from "./fPathResolve";

export function goalAdjustRaw(): string {
  return REAL_ESTATE_RE01_GOAL_ADJUST_RAW;
}
