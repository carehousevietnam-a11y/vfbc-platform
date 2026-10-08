import { evalExpr } from "./showIf";
import type {
  AnswerMap,
  ContentPackBundle,
  ContentPackNode,
  ContentPackOption,
  SituationProfile,
} from "./types";

export type RiskLevel = "check" | "caution" | "expert" | "special";

export type PackRunnerConfig = {
  q1Key?: string;
  caseLabels?: Record<string, string>;
  pathChainAdjust?: (caseId: string, chain: string[], answers: AnswerMap) => string[];
  pathPriority?: Record<string, string[]>;
};

function nodesFor(bundle: ContentPackBundle, caseId: string): ContentPackNode[] {
  return bundle.nodes[caseId] ?? [];
}

function pathAliases(bundle: ContentPackBundle, caseId: string): Record<string, string> {
  return bundle.pathAliases[caseId] ?? {};
}

export function nodeVisible(
  bundle: ContentPackBundle,
  node: ContentPackNode,
  answers: AnswerMap,
  caseId: string,
): boolean {
  const raw = node.showIf.replace(/`/g, "");
  return evalExpr(raw, answers, pathAliases(bundle, caseId));
}

export function phase1QuestionIds(bundle: ContentPackBundle, caseId: string): string[] {
  const order = bundle.phase1Order[caseId] ?? [];
  if (order.length) return order;
  return nodesFor(bundle, caseId).filter((n) => n.phase === 1).map((n) => n.id);
}

function pathMatches(
  condition: string,
  answers: AnswerMap,
  caseId: string,
  bundle: ContentPackBundle,
): boolean {
  const cond = condition.replace(/`/g, "").trim();
  if (!cond) return false;
  return evalExpr(cond, answers, pathAliases(bundle, caseId));
}

function pickFPath(bundle: ContentPackBundle, caseId: string, answers: AnswerMap, priority?: string[]): string[] | null {
  const rows = bundle.fPaths[caseId];
  if (!rows?.length) return null;
  const ordered = [...rows].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
  if (priority?.length) {
    for (const pid of priority) {
      const row = ordered.find((r) => r.pathId === pid);
      if (row && pathMatches(row.condition, answers, caseId, bundle)) return row.chain;
    }
  }
  for (const row of ordered) {
    if (pathMatches(row.condition, answers, caseId, bundle)) return row.chain;
  }
  return rows[rows.length - 1]?.chain ?? null;
}

export function phase2ChainFromF(
  bundle: ContentPackBundle,
  caseId: string,
  answers: AnswerMap,
  config?: PackRunnerConfig,
): string[] {
  const chain = pickFPath(bundle, caseId, answers, config?.pathPriority?.[caseId]);
  if (!chain?.length) return [];
  if (config?.pathChainAdjust) return config.pathChainAdjust(caseId, chain, answers);
  return chain;
}

export function phase2QuestionIds(
  bundle: ContentPackBundle,
  caseId: string,
  answers: AnswerMap,
  config?: PackRunnerConfig,
): string[] {
  const fromF = phase2ChainFromF(bundle, caseId, answers, config);
  const order =
    fromF.length > 0
      ? fromF
      : nodesFor(bundle, caseId).filter((n) => n.phase === 2).map((n) => n.id);
  const byId = new Map(nodesFor(bundle, caseId).map((n) => [n.id, n]));
  const out: string[] = [];
  for (const id of order) {
    const node = byId.get(id);
    if (!node) continue;
    if (nodeVisible(bundle, node, answers, caseId)) out.push(id);
  }
  return out;
}

export function getNode(bundle: ContentPackBundle, caseId: string, id: string): ContentPackNode | undefined {
  return nodesFor(bundle, caseId).find((n) => n.id === id);
}

export function applyOptionToProfile(
  profile: SituationProfile,
  opt: ContentPackOption,
  node: ContentPackNode,
): void {
  if (!opt.meaning) return;
  for (const part of opt.meaning.split(";")) {
    const p = part.trim();
    const eq = p.match(/^([^=]+)=(.+)$/);
    if (!eq) continue;
    const key = eq[1].trim();
    const val = eq[2].trim();
    profile.fields[key] = val;
    profile.facts.push(`${key}=${val}`);
  }
  for (const pf of node.profileFields) {
    if (!(pf in profile.fields)) profile.fields[pf] = opt.value;
  }
}

export function buildProfile(
  bundle: ContentPackBundle,
  caseId: string,
  answers: AnswerMap,
  config?: PackRunnerConfig,
): SituationProfile {
  const profile: SituationProfile = { fields: { case: caseId }, facts: [], caseId };
  const allIds = [...phase1QuestionIds(bundle, caseId), ...phase2QuestionIds(bundle, caseId, answers, config)];
  for (const qid of allIds) {
    const node = getNode(bundle, caseId, qid);
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

function riskLevelRank(l: RiskLevel): number {
  if (l === "check") return 0;
  if (l === "caution") return 1;
  if (l === "expert") return 2;
  return 3;
}

function selectedValues(answers: AnswerMap): Set<string> {
  const selected = new Set<string>();
  for (const v of Object.values(answers)) {
    if (Array.isArray(v)) v.forEach((x) => selected.add(String(x)));
    else if (v) selected.add(String(v));
  }
  return selected;
}

export function matchTrigger(
  trigger: string,
  answers: AnswerMap,
  aliases: Record<string, string>,
): boolean {
  const t = trigger.replace(/`/g, "").trim();
  if (!t) return false;
  if (t.includes("+") && !t.includes("=")) {
    const parts = t.split("+").map((p) => p.trim());
    return parts.every((p) => matchTrigger(p, answers, aliases));
  }
  if (aliases[t]) return evalExpr(aliases[t], answers, aliases);
  if (t.includes("=") || t.includes("≠") || /\b(AND|OR|NOT)\b/i.test(t) || t.includes("|")) {
    if (t.includes(" AND ") || t.includes(" OR ") || /\bAND\b/i.test(t)) {
      return evalExpr(t, answers, aliases);
    }
    const plusParts = t.split("+").map((p) => p.trim());
    if (plusParts.length > 1 && plusParts.some((p) => p.includes("="))) {
      return plusParts.every((p) => matchTrigger(p, answers, aliases));
    }
    return evalExpr(t, answers, aliases);
  }
  const selected = selectedValues(answers);
  if (t.endsWith("_*") || (t.includes("_") && t.endsWith("*"))) {
    const prefix = t.replace(/\*$/, "");
    return [...selected].some((v) => v.startsWith(prefix));
  }
  if (t.startsWith("lg_")) {
    return [...selected].some((v) => v.startsWith("lg_") || v.includes("lg_"));
  }
  const vals = t.split("|").map((x) => x.trim());
  if (vals.length > 1) return vals.some((v) => selected.has(v) || [...selected].some((s) => s.endsWith(v) || s.includes(v)));
  return selected.has(t) || [...selected].some((s) => s.endsWith(`_${t}`) || s === t || s.endsWith(t));
}

export function aggregateJudgment(
  bundle: ContentPackBundle,
  caseId: string,
  answers: AnswerMap,
  opts?: { directText?: string; specialEvaluator?: (caseId: string, answers: AnswerMap, directText?: string) => boolean },
): { level: RiskLevel; cautions: string[]; expertHandoff: boolean } {
  const tables = bundle.risks[caseId];
  const cautions: string[] = [];
  let best: RiskLevel = "check";
  let cautionCount = 0;
  const aliases = pathAliases(bundle, caseId);

  if (opts?.specialEvaluator?.(caseId, answers, opts.directText)) {
    return { level: "special", cautions: [], expertHandoff: true };
  }

  if (!tables) return { level: "check", cautions: [], expertHandoff: false };

  const tiers: { key: RiskLevel; rows: { trigger: string; line: string }[] }[] = [
    { key: "special", rows: tables.special ?? [] },
    { key: "expert", rows: tables.expert },
    { key: "caution", rows: tables.caution },
    { key: "check", rows: tables.check },
  ];

  for (const tier of tiers) {
    for (const row of tier.rows) {
      const trig = row.trigger.replace(/`/g, "").trim();
      if (!matchTrigger(trig, answers, aliases)) continue;
      const msg = row.line.split("|").pop()?.trim() ?? "";
      if (msg && !cautions.includes(msg)) cautions.push(msg);
      if (tier.key === "caution") cautionCount += 1;
      if (riskLevelRank(tier.key) > riskLevelRank(best)) best = tier.key;
      if (tier.key === "special") best = "special";
    }
  }

  if (opts?.directText && /연락.*끊|공안|소송|분쟁.*진행|공동.*소유|여러.*호실|법인.*여러/i.test(opts.directText)) {
    return { level: "special", cautions: [], expertHandoff: true };
  }

  if (cautionCount >= 3 && best !== "special") best = "expert";
  return { level: best, cautions, expertHandoff: best === "special" };
}
