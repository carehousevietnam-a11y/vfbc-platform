import type {
  AdminVerifyFirstResultData,
  AdminVerifyPersonalizedContext,
} from "@/components/cost-check/AdminVerifyFirstResultPanel";
import type { AnswerMap, RealEstateCaseId } from "./types";
import {
  aggregateJudgmentForCase,
  buildFirstResultData,
  phase1QuestionIds,
  phase2QuestionIds,
} from "../runner";
import { buildResultMetrics } from "./m45Engine";
import { correctParticlesInSentence } from "./koreanParticle";
import { REAL_ESTATE_FIRST_RESULT_PACK_META } from "./generated/meta";
import { realEstatePackBundle } from "./packBundle";

const Q1_KEY = "re_entry";

const OK_HEADLINE_FORBIDDEN =
  /큰 문제가 보이지 않습니다|큰 불일치가 보이지 않습니다/;

const SUMMARY_SENTENCE2_FORBIDDEN =
  /~라면|라면,|수 있습니다|해야 합니다|안전합니다|좋습니다/;

const MAINTAINED_FRAGMENT_FORBIDDEN = /상태가 그대로 유지됩니다/;

export type PackPersonalizedBuildOptions = {
  documentsAnyUploaded?: boolean;
  evidenceFileName?: string;
};

function metaFor(caseId: RealEstateCaseId) {
  return REAL_ESTATE_FIRST_RESULT_PACK_META[caseId] ?? REAL_ESTATE_FIRST_RESULT_PACK_META.RE01;
}

function phase1AnswerSubset(caseId: RealEstateCaseId, answers: AnswerMap): AnswerMap {
  const out: AnswerMap = { [Q1_KEY]: answers[Q1_KEY] };
  const note = answers[`${Q1_KEY}Note`];
  if (note != null && String(note).trim() !== "") out[`${Q1_KEY}Note`] = note;
  for (const id of phase1QuestionIds(caseId)) {
    if (answers[id] != null && String(answers[id]).trim() !== "") out[id] = answers[id];
  }
  return out;
}

function phase2OnlyCautions(
  caseId: RealEstateCaseId,
  answers: AnswerMap,
  directText?: string,
): string[] {
  const p1 = aggregateJudgmentForCase(caseId, phase1AnswerSubset(caseId, answers), directText);
  const full = aggregateJudgmentForCase(caseId, answers, directText);
  return full.cautions.filter((c) => !p1.cautions.includes(c));
}

function applyTemplate(template: string, vars: Record<string, string>): string {
  let out = template;
  for (const [key, val] of Object.entries(vars)) {
    out = out.replaceAll(`{${key}}`, val);
  }
  return correctParticlesInSentence(out.replace(/\s+/g, " ").trim());
}

function riskMessage(line: string): string {
  const parts = line.split("|");
  return parts.length > 1 ? parts.slice(1).join("|").trim() : line.trim();
}

function triggerLookupKeys(trigger: string): string[] {
  const out: string[] = [];
  for (const chunk of trigger.split("+")) {
    const t = chunk.trim().replace(/`/g, "");
    if (!t) continue;
    if (t.includes("=")) {
      const [field, rhs] = t.split("=").map((s) => s.trim());
      for (const v of rhs.split("|")) {
        const x = v.trim();
        if (!x) continue;
        out.push(`${field}=${x}`, x);
      }
    } else {
      out.push(t);
    }
  }
  return out;
}

function findTriggerForCaution(caseId: RealEstateCaseId, caution: string): string | null {
  const tables = realEstatePackBundle().risks[caseId];
  if (!tables) return null;
  const tiers = ["special", "expert", "caution", "check"] as const;
  for (const tier of tiers) {
    for (const row of tables[tier] ?? []) {
      if (riskMessage(row.line) === caution) return row.trigger;
    }
  }
  return null;
}

function answerHasToken(answers: AnswerMap, token: string): boolean {
  for (const v of Object.values(answers)) {
    const s = String(v ?? "");
    if (s === token) return true;
    if (s.includes(token) && token.length > 4) return true;
  }
  return false;
}

function lookupFact2(caseId: RealEstateCaseId, key: string): string | undefined {
  const dict = metaFor(caseId).phase2Fact2 ?? {};
  return dict[key];
}

function dictKeysForAnswerToken(caseId: RealEstateCaseId, token: string): string[] {
  const keys = new Set<string>([token]);
  const nodes = realEstatePackBundle().nodes[caseId] ?? [];
  for (const n of nodes) {
    for (const o of n.options ?? []) {
      const v = o.value;
      const short = v.replace(/^r[0-9]+_/, "");
      if (v === token || short === token || v.endsWith(`_${token}`)) {
        keys.add(`${n.id}=${v}`);
        keys.add(v);
        keys.add(short);
      }
    }
  }
  return [...keys];
}

function resolveFact2FromDictKeys(caseId: RealEstateCaseId, keys: string[]): string {
  for (const key of keys) {
    for (const k of dictKeysForAnswerToken(caseId, key)) {
      const hit = lookupFact2(caseId, k);
      if (hit) return hit;
    }
  }
  return "";
}

export function resolvePackPersonalizedFact2Key(
  caseId: RealEstateCaseId,
  answers: AnswerMap,
  p2Cautions: string[],
): string {
  for (const caution of p2Cautions) {
    const trigger = findTriggerForCaution(caseId, caution);
    if (!trigger) continue;
    for (const key of triggerLookupKeys(trigger)) {
      for (const k of dictKeysForAnswerToken(caseId, key)) {
        if (lookupFact2(caseId, k)) return k;
      }
    }
  }
  for (const id of [...phase2QuestionIds(caseId, answers)].reverse()) {
    const val = String(answers[id] ?? "").trim();
    if (!val) continue;
    const candidates = [`${id}=${val}`, val];
    for (const k of candidates) {
      if (lookupFact2(caseId, k)) return k;
      for (const alias of dictKeysForAnswerToken(caseId, val)) {
        if (lookupFact2(caseId, alias)) return alias;
      }
    }
  }
  return "";
}

export function resolvePackPersonalizedFact2(
  caseId: RealEstateCaseId,
  answers: AnswerMap,
  p2Cautions: string[],
): string {
  const key = resolvePackPersonalizedFact2Key(caseId, answers, p2Cautions);
  if (!key) return "";
  return lookupFact2(caseId, key) ?? "";
}

function buildTwoSentenceSummary(
  caseId: RealEstateCaseId,
  phase1Core: string,
  fact2: string,
  isElevated: boolean,
): string {
  const m = metaFor(caseId);
  const s1 = phase1Core.trim();
  if (isElevated) {
    const s2 = correctParticlesInSentence(
      applyTemplate(
        m.personalizedPhase2ElevatedSentence2 ||
          "2차 답변에서 {fact2}이 확인되어, 추가 확인이 필요한 부분이 더 늘었습니다.",
        { fact2 },
      ).replace(/점가\s/, "점이 "),
    );
    return `${s1} ${s2}`;
  }
  const s2 =
    m.personalizedPhase2MaintainedSentence2 ||
    "2차 답변에서도 이보다 나빠진 사정은 확인되지 않아, 1차 판정이 유지됩니다.";
  return `${s1} ${s2}`;
}

export function gradeLabelFromFilled(filled: number): string {
  if (filled >= 4) return "VFBCAI 전문가팀 진행";
  if (filled >= 3) return "전문가 권장 (3단계)";
  if (filled >= 2) return "주의 요망 (2단계)";
  return "양호 (1단계)";
}

/** My Page AI 카드 — 등급 문구(퍼센트 대신) */
export function realEstateMypageGradeDisplayLabel(grade2: number): string {
  if (grade2 >= 4) return "VFBCAI 전문가팀 진행";
  if (grade2 >= 3) return "전문가 권장";
  if (grade2 >= 2) return "주의 요망";
  return "양호";
}

function headlineForGrade(
  caseId: RealEstateCaseId,
  gradeFilled: number,
  grade1Filled: number,
  elevated: boolean,
): string {
  const m = metaFor(caseId);
  if (gradeFilled >= 4) {
    return "VFBCAI 전문가팀 진행이 필요한 사건입니다";
  }
  if (gradeFilled >= 3) {
    return m.personalizedHeadlineElevated || "전문가 권장 단계로 점검이 필요합니다";
  }
  if (gradeFilled >= 2) {
    if (elevated) return m.personalizedHeadlineElevated || "추가 확인이 필요한 상태입니다";
    if (grade1Filled >= 2) {
      return m.personalizedHeadlineMaintained || "1차에서 확인된 주의 사항이 유지되는 상태입니다";
    }
    return m.personalizedHeadlineElevated || "추가 확인이 필요한 상태입니다";
  }
  return m.personalizedHeadlineOk || "현재 확인한 범위에서는 큰 문제가 보이지 않습니다";
}

function coreJudgmentFor(
  caseId: RealEstateCaseId,
  gradeFilled: number,
  expertHandoff: boolean,
): string | undefined {
  const m = metaFor(caseId);
  if (expertHandoff && m.personalizedCoreJudgmentExpert) return m.personalizedCoreJudgmentExpert;
  if (gradeFilled >= 2 && m.personalizedCoreJudgmentCaution) return m.personalizedCoreJudgmentCaution;
  if (gradeFilled < 2 && m.personalizedCoreJudgmentOk) return m.personalizedCoreJudgmentOk;
  return undefined;
}

function matchesFieldValue(answers: AnswerMap, spec: string): boolean {
  const eq = spec.indexOf("=");
  if (eq < 0) return answerHasToken(answers, spec);
  const field = spec.slice(0, eq).trim();
  const val = spec.slice(eq + 1).trim();
  return String(answers[field] ?? "") === val;
}

/** QA·REPORT용 1차/2차 등급 비교 */
export function tracePackPersonalizedGrades(
  caseId: RealEstateCaseId,
  answers: AnswerMap,
  directText?: string,
): { grade1: number; grade2: number } {
  const phase1 = buildFirstResultData(caseId, phase1AnswerSubset(caseId, answers), directText);
  const full = buildPackPersonalizedResult(caseId, answers, directText);
  return { grade1: phase1.gradeFilled, grade2: full.gradeFilled };
}

/** 1차↔2차 의미 모순 — Pack `personalizedSemanticConflict` 규칙 */
export function detectPackPersonalizedSemanticConflict(
  caseId: RealEstateCaseId,
  answers: AnswerMap,
): string | null {
  const rules = metaFor(caseId).semanticConflicts ?? [];
  for (const rule of rules) {
    if (matchesFieldValue(answers, rule.left) && matchesFieldValue(answers, rule.right)) {
      return rule.label;
    }
  }
  return null;
}

export type PersonalizedSummaryQaFlags = {
  maintained_fragment: boolean;
  caution_echo: boolean;
  sentence2_forbidden: boolean;
  elevated_missing_fact2: boolean;
};

export function analyzePersonalizedSummaryForQa(
  caseId: RealEstateCaseId,
  answers: AnswerMap,
  data: AdminVerifyFirstResultData,
  directText?: string,
): PersonalizedSummaryQaFlags {
  const phase1Data = buildFirstResultData(
    caseId,
    phase1AnswerSubset(caseId, answers),
    directText,
  );
  const p2 = phase2OnlyCautions(caseId, answers, directText);
  const elevated = p2.length > 0 || data.gradeFilled > phase1Data.gradeFilled;
  const summary = data.situationSummary ?? "";
  const parts = summary.split(/(?<=[.!?…])\s+/);
  const sentence1 = parts[0] ?? summary;
  const sentence2 = parts.length > 1 ? parts.slice(1).join(" ") : "";

  let caution_echo = false;
  for (const c of data.cautions ?? []) {
    const frag = c.slice(0, Math.min(24, c.length));
    if (frag.length >= 12 && sentence1.includes(frag)) caution_echo = true;
  }

  return {
    maintained_fragment: MAINTAINED_FRAGMENT_FORBIDDEN.test(summary),
    caution_echo,
    sentence2_forbidden: elevated && SUMMARY_SENTENCE2_FORBIDDEN.test(sentence2),
    elevated_missing_fact2:
      elevated && !resolvePackPersonalizedFact2(caseId, answers, p2).trim(),
  };
}

export function buildPackPersonalizedContext(
  caseId: RealEstateCaseId,
  answers: AnswerMap,
  directText?: string,
  opts?: PackPersonalizedBuildOptions,
  gradeFilled?: number,
  grade1Filled?: number,
): AdminVerifyPersonalizedContext {
  const m = metaFor(caseId);
  const [m1, m2, m3] = buildResultMetrics(caseId, phase1AnswerSubset(caseId, answers));
  const phase1Facts = [m1, m2, m3].map((line) => line.trim()).filter(Boolean);
  const phase1Core = phase1Facts[0] ?? "";
  const p2Cautions = phase2OnlyCautions(caseId, answers, directText);
  const g2 = gradeFilled ?? 1;
  const g1 = grade1Filled ?? g2;
  const isElevated = p2Cautions.length > 0 || g2 > g1;
  const fact2 = isElevated ? resolvePackPersonalizedFact2(caseId, answers, p2Cautions) : "";
  const integratedSituation = buildTwoSentenceSummary(caseId, phase1Core, fact2, isElevated);
  const phase2Additions = isElevated && fact2 ? [fact2] : [];

  const judgment = aggregateJudgmentForCase(caseId, answers, directText);

  return {
    integratedSituation,
    phase1Facts,
    phase2Additions,
    evidenceNote:
      opts?.documentsAnyUploaded || opts?.evidenceFileName
        ? `첨부 자료: ${opts.evidenceFileName ?? "제출 자료"}`
        : undefined,
    documentsNeededNote: m.personalizedDocumentsNeededNote,
    coreJudgment: coreJudgmentFor(caseId, g2, judgment.expertHandoff),
  };
}

export function buildPackPersonalizedResult(
  caseId: RealEstateCaseId,
  answers: AnswerMap,
  directText?: string,
  opts?: PackPersonalizedBuildOptions,
): AdminVerifyFirstResultData {
  const m = metaFor(caseId);
  const phase1Data = buildFirstResultData(
    caseId,
    phase1AnswerSubset(caseId, answers),
    directText,
  );
  const fullData = buildFirstResultData(caseId, answers, directText);
  const gradeFilled = Math.max(phase1Data.gradeFilled, fullData.gradeFilled);
  const p2Cautions = phase2OnlyCautions(caseId, answers, directText);
  const elevated = p2Cautions.length > 0 || gradeFilled > phase1Data.gradeFilled;
  const cautions = [...new Set([...phase1Data.cautions, ...fullData.cautions])].slice(0, 6);
  const statusTone = gradeFilled >= 2 ? "caution" : fullData.statusTone;
  const statusHeadline = headlineForGrade(
    caseId,
    gradeFilled,
    phase1Data.gradeFilled,
    elevated,
  );

  const personalizedContext = buildPackPersonalizedContext(
    caseId,
    answers,
    directText,
    opts,
    gradeFilled,
    phase1Data.gradeFilled,
  );

  const keyMetrics = fullData.keyMetrics.map((metric) => ({
    ...metric,
    status: gradeFilled >= 2 ? (metric.status === "ok" ? "caution" : metric.status) : metric.status,
  }));

  return {
    ...fullData,
    stageLabel: m.personalizedStageLabel ?? "2차 종합 검토",
    statusHeadline,
    statusTone,
    situationSummary: personalizedContext.integratedSituation,
    gradeFilled,
    gradeLabel: gradeLabelFromFilled(gradeFilled),
    keyMetrics,
    cautions,
    personalizedContext,
  };
}

export function packPersonalizedSummaryFailsOkHeadlineCheck(data: AdminVerifyFirstResultData): boolean {
  if (data.gradeFilled < 2) return false;
  const blob = `${data.statusHeadline} ${data.situationSummary} ${data.personalizedContext?.coreJudgment ?? ""}`;
  return OK_HEADLINE_FORBIDDEN.test(blob);
}
