import type { AdminVerifyFirstResultData } from "@/components/cost-check/AdminVerifyFirstResultPanel";
import {
  aggregateJudgment,
  getNode as engineGetNode,
  phase1QuestionIds as enginePhase1QuestionIds,
  applyOptionToProfile,
  type RiskLevel,
} from "./engine/packRunner";
import type { AnswerMap, ContentPackNode, SituationProfile } from "./realEstate/types";
import type { RealEstateCaseId } from "./realEstate/types";
import { realEstatePackBundle } from "./realEstate/packBundle";
import { routeRe06DirectInput } from "./realEstate/re06";
import { buildFirstResultPayload } from "./realEstate/resultBuilder";
import {
  hasFirstResultVerdictFloor,
  hasPhase1VerdictBoost,
} from "./realEstate/phase1VerdictBoost";
import { realEstatePhase2QuestionIds } from "./realEstate/phase2Order";
import { nodeVisibleForPack } from "./realEstate/showIfNormalize";

export type { RealEstateCaseId } from "./realEstate/types";

const Q1_KEY = "re_entry";
const bundle = realEstatePackBundle();

const CASE_LABEL: Record<RealEstateCaseId, string> = {
  RE01: "계약 전 검토",
  RE02: "보증금·계약금 분쟁",
  RE03: "위반·해지·퇴거 통보",
  RE04: "거주 중 문제",
  RE05: "매매·권리 서류",
  RE06: "불명확·복합",
};

export function runPack(answers: AnswerMap, caseId: RealEstateCaseId) {
  return {
    phase1: phase1QuestionIds(caseId),
    phase2: phase2QuestionIds(caseId, answers),
    profile: buildProfile(caseId, answers),
    result: buildFirstResultData(caseId, answers),
  };
}

export function caseFromQ1Value(value: string): RealEstateCaseId {
  const row = bundle.q1.find((q) => q.value === value);
  return (row?.caseId as RealEstateCaseId) ?? "RE06";
}

export function getQ1Options() {
  return bundle.q1;
}

export function nodeVisible(node: ContentPackNode, answers: AnswerMap, caseId: RealEstateCaseId): boolean {
  return nodeVisibleForPack(node, answers, caseId);
}

export function phase1QuestionIds(caseId: RealEstateCaseId): string[] {
  return enginePhase1QuestionIds(bundle, caseId);
}

export function visiblePhase1QuestionIds(caseId: RealEstateCaseId, answers: AnswerMap): string[] {
  return phase1QuestionIds(caseId).filter((id) => {
    const node = getNode(caseId, id);
    if (!node) return false;
    return nodeVisibleForPack(node, answers, caseId);
  });
}

export function isPhase1Complete(caseId: RealEstateCaseId, answers: AnswerMap): boolean {
  const ids = visiblePhase1QuestionIds(caseId, answers);
  return ids.every((id) => {
    const v = answers[id];
    if (v == null || v === "") return false;
    if (Array.isArray(v)) return v.length > 0;
    return String(v).trim().length > 0;
  });
}

export function phase2QuestionIds(caseId: RealEstateCaseId, answers: AnswerMap): string[] {
  return realEstatePhase2QuestionIds(caseId, answers);
}

export function getNode(caseId: RealEstateCaseId, id: string): ContentPackNode | undefined {
  return engineGetNode(bundle, caseId, id);
}

export function optionLabel(node: ContentPackNode, value: string): string {
  const opt = node.options.find((o) => o.value === value);
  return opt?.label ?? value;
}

export function buildProfile(caseId: RealEstateCaseId, answers: AnswerMap) {
  const profile: SituationProfile = { fields: { case: caseId }, facts: [], caseId };
  const allIds = [...phase1QuestionIds(caseId), ...realEstatePhase2QuestionIds(caseId, answers)];
  for (const qid of allIds) {
    const node = getNode(caseId, qid);
    if (!node) continue;
    const ans = answers[qid];
    if (ans == null) continue;
    if (node.kind === "text") {
      const text = String(ans);
      for (const pf of node.profileFields) profile.fields[pf] = text;
      continue;
    }
    const values = Array.isArray(ans) ? ans : [String(ans)];
    for (const v of values) {
      const opt = node.options.find((o) => o.value === v);
      if (opt) applyOptionToProfile(profile, opt, node);
    }
  }
  return profile;
}

function gradeFromLevel(level: RiskLevel, expertHandoff: boolean): { filled: number; label: string; tone: "ok" | "caution" } {
  if (level === "special" || expertHandoff) {
    return { filled: 4, label: "VFBCAI 전문가팀 진행", tone: "caution" };
  }
  if (level === "expert") return { filled: 3, label: "전문가 권장", tone: "caution" };
  if (level === "caution") return { filled: 2, label: "주의", tone: "caution" };
  return { filled: 1, label: "확인 필요", tone: "ok" };
}

export function aggregateJudgmentForCase(
  caseId: RealEstateCaseId,
  answers: AnswerMap,
  directText?: string,
) {
  return aggregateJudgment(bundle, caseId, answers, { directText });
}

export function buildFirstResultData(
  caseId: RealEstateCaseId,
  answers: AnswerMap,
  directText?: string,
  opts?: { ignoreVerdictBoost?: boolean; ignoreVerdictFloor?: boolean },
): AdminVerifyFirstResultData {
  const judgment = aggregateJudgment(bundle, caseId, answers, { directText });
  const grade = gradeFromLevel(judgment.level, judgment.expertHandoff);
  const phase1VerdictBoost = !opts?.ignoreVerdictBoost && hasPhase1VerdictBoost(caseId, answers);
  const firstResultVerdictFloor =
    !opts?.ignoreVerdictFloor && hasFirstResultVerdictFloor(caseId);
  return buildFirstResultPayload(
    caseId,
    answers,
    { ...grade, expertHandoff: judgment.expertHandoff },
    judgment.cautions.slice(0, 6),
    getNode,
    CASE_LABEL[caseId],
    judgment.level,
    judgment.expertHandoff,
    phase1VerdictBoost,
    firstResultVerdictFloor,
  );
}

export function resolveCaseFromAnswers(answers: AnswerMap): RealEstateCaseId {
  const q1 = String(answers[Q1_KEY] ?? "");
  if (q1 === "other") {
    const note = String(answers[`${Q1_KEY}Note`] ?? "");
    const route = routeRe06DirectInput(note);
    if (route.expertHandoff || !route.caseId) return "RE06";
    return route.caseId as RealEstateCaseId;
  }
  return caseFromQ1Value(q1);
}

export function walkQuestionIds(
  caseId: RealEstateCaseId,
  answers: AnswerMap,
  options?: { includePhase2?: boolean; phase2Limit?: number },
): string[] {
  const out: string[] = [Q1_KEY];
  if (caseId === "RE06") return out;
  for (const id of phase1QuestionIds(caseId)) out.push(id);
  if (options?.includePhase2) {
    const p2 = phase2QuestionIds(caseId, answers);
    const limit = options.phase2Limit ?? p2.length;
    out.push(...p2.slice(0, limit));
  }
  return out;
}
