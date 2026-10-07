import type { AnswerMap, ContentPackNode } from "./types";
import type { RealEstateCaseId } from "./types";
import { realEstatePackBundle } from "./packBundle";
import { nodeVisibleForPack } from "./showIfNormalize";
import { REAL_ESTATE_Q1 } from "./generated/pack";

const bundle = realEstatePackBundle();
const Q1_KEY = "re_entry";

function q1ValueForCase(caseId: RealEstateCaseId): string {
  const row = REAL_ESTATE_Q1.find((q) => q.caseId === caseId);
  if (!row) throw new Error(`no Q1 for ${caseId}`);
  return row.value;
}

function visiblePhase1Ids(caseId: RealEstateCaseId, answers: AnswerMap): string[] {
  const order = bundle.phase1Order[caseId] ?? [];
  const out: string[] = [];
  for (const id of order) {
    const node = bundle.nodes[caseId]?.find((n) => n.id === id);
    if (!node) continue;
    if (nodeVisibleForPack(node, answers, caseId)) out.push(id);
  }
  return out;
}

function isDirectExplain(opt: { value: string; label: string }): boolean {
  return opt.value === "other" && opt.label.includes("직접 입력");
}

function assignmentsForNode(node: ContentPackNode): AnswerMap[string][] {
  if (node.kind === "text") return ["phase1-text-sample"];
  const opts = node.options.filter((o) => !isDirectExplain(o)).map((o) => o.value);
  if (node.kind === "multi") {
    const picks: AnswerMap[string][] = opts.map((v) => [v]);
    if (opts.length > 1) picks.push([...opts]);
    return picks;
  }
  return opts;
}

function dfs(caseId: RealEstateCaseId, answers: AnswerMap, sink: (a: AnswerMap) => void) {
  const ids = visiblePhase1Ids(caseId, answers);
  const nextId = ids.find((id) => {
    const v = answers[id];
    return v == null || v === "" || (Array.isArray(v) && v.length === 0);
  });
  if (!nextId) {
    sink({ ...answers });
    return;
  }
  const node = bundle.nodes[caseId]?.find((n) => n.id === nextId);
  if (!node) {
    sink({ ...answers });
    return;
  }
  const vals = assignmentsForNode(node);
  if (!vals.length) {
    dfs(caseId, answers, sink);
    return;
  }
  for (const val of vals) {
    dfs(caseId, { ...answers, [nextId]: val }, sink);
  }
}

export function enumeratePhase1Combinations(caseId: RealEstateCaseId): AnswerMap[] {
  const results: AnswerMap[] = [];
  const start: AnswerMap = { [Q1_KEY]: q1ValueForCase(caseId) };
  dfs(caseId, start, (a) => results.push(a));
  return results;
}

/** 각 Phase1 질문에서 마지막(비-직접입력) 선택지만 고른 단일 조합 */
/** 각 1차 선택 필드·선택지가 최소 1회 포함되도록 커버링 조합 생성 */
export function enumerateCoveringPhase1Combinations(caseId: RealEstateCaseId): AnswerMap[] {
  const base = enumeratePhase1Combinations(caseId);
  if (!base.length) return base;
  const ids = visiblePhase1Ids(caseId, base[0]);
  const fieldOptions = new Map<string, AnswerMap[string][]>();
  for (const id of ids) {
    const node = bundle.nodes[caseId]?.find((n) => n.id === id);
    if (!node) continue;
    fieldOptions.set(id, assignmentsForNode(node));
  }
  const seed = { ...base[0] };
  const combos: AnswerMap[] = [];
  for (const [field, vals] of fieldOptions) {
    for (const val of vals) {
      combos.push({ ...seed, [field]: val });
    }
  }
  const seen = new Set<string>();
  const uniq: AnswerMap[] = [];
  for (const c of combos) {
    const key = JSON.stringify(c);
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push(c);
  }
  return uniq.length ? uniq : base.slice(0, 1);
}

export function buildPath2Phase1Answers(caseId: RealEstateCaseId): AnswerMap {
  let answers: AnswerMap = { [Q1_KEY]: q1ValueForCase(caseId) };
  for (;;) {
    const ids = visiblePhase1Ids(caseId, answers);
    const nextId = ids.find((id) => {
      const v = answers[id];
      return v == null || v === "" || (Array.isArray(v) && v.length === 0);
    });
    if (!nextId) break;
    const node = bundle.nodes[caseId]?.find((n) => n.id === nextId);
    if (!node) break;
    const vals = assignmentsForNode(node);
    if (!vals.length) break;
    answers = { ...answers, [nextId]: vals[vals.length - 1] };
  }
  return answers;
}
