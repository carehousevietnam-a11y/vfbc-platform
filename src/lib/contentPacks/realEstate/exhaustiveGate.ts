import type { AnswerMap } from "./types";
import { enumeratePhase1Combinations } from "./exhaustivePhase1";
import { pickSinglePathId } from "./fPathResolve";
import { realEstatePackBundle } from "./packBundle";

const bundle = realEstatePackBundle();
import { evalExpr } from "../engine/showIf";
import { REAL_ESTATE_PATH_ALIASES } from "./generated/meta";

/** RE02 GATE_RENTAL_UNRETURNED 1차 조합 × re02_other_reason 전 선택지 (L-36) */
export function enumerateRe02GateCombinations(): AnswerMap[] {
  const aliases = REAL_ESTATE_PATH_ALIASES.RE02 ?? {};
  const gateExpr = aliases.GATE_RENTAL_UNRETURNED;
  const node = bundle.nodes.RE02?.find((n) => n.id === "re02_other_reason");
  const reasonValues =
    node?.options?.filter((o) => o.value !== "other").map((o) => o.value) ?? [];
  const out: AnswerMap[] = [];
  for (const phase1 of enumeratePhase1Combinations("RE02")) {
    if (!gateExpr || !evalExpr(gateExpr, phase1, aliases)) continue;
    for (const reason of reasonValues) {
      out.push({ ...phase1, re02_other_reason: reason });
    }
  }
  return out;
}

export function verifyRe02GatePaths(): {
  combos: number;
  pathErrors: { answers: AnswerMap; pathId: string | null }[];
  reached: Set<string>;
} {
  const pathErrors: { answers: AnswerMap; pathId: string | null }[] = [];
  const reached = new Set<string>();
  const combos = enumerateRe02GateCombinations();
  for (const answers of combos) {
    const pathId = pickSinglePathId("RE02", answers);
    if (!pathId || (pathId !== "PATH_A" && pathId !== "PATH_D1")) {
      pathErrors.push({ answers, pathId });
      continue;
    }
    reached.add(pathId);
    const damage = answers.re02_other_reason === "or_damage_claim";
    const expect = damage ? "PATH_A" : "PATH_D1";
    if (pathId !== expect) pathErrors.push({ answers, pathId });
  }
  return { combos: combos.length, pathErrors, reached };
}
