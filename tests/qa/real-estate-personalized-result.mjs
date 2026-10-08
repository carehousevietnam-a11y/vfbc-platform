/**
 * C2.3 / C2.3b / C2.3c — phase1 3125 × phase2 walk → personalized result integrity
 */
import { enumeratePhase1Combinations } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import { realEstatePackBundle } from "../../src/lib/contentPacks/realEstate/packBundle.ts";
import {
  isPhase2QuestionSetComplete,
  phase2QuestionIds,
  resolveCaseFromAnswers,
  buildFirstResultData,
} from "../../src/lib/contentPacks/runner.ts";
import { createRealEstateVerifyMasterPackBridge } from "../../src/lib/verifyMasterPackBridge.ts";
import { ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_ANSWERS_KEY } from "../../src/lib/adminVerifyProfiling.ts";
import {
  analyzePersonalizedSummaryForQa,
  detectPackPersonalizedSemanticConflict,
  packPersonalizedSummaryFailsOkHeadlineCheck,
  resolvePackPersonalizedFact2,
  resolvePackPersonalizedFact2Key,
  tracePackPersonalizedGrades,
} from "../../src/lib/contentPacks/realEstate/personalizedResultBuilder.ts";
import { REAL_ESTATE_FIRST_RESULT_PACK_META } from "../../src/lib/contentPacks/realEstate/generated/meta.ts";

const CASES = ["RE01", "RE02", "RE03", "RE04", "RE05"];
const bridge = createRealEstateVerifyMasterPackBridge();
const bundle = realEstatePackBundle();

const FORBIDDEN = [
  /\d{1,3}(,\d{3})+\s*원/,
  /USD\s*\d/i,
  /₫/,
  /변호사/,
  /법무법인/,
];

function phase1Subset(caseId, answers) {
  const out = { re_entry: answers.re_entry };
  if (answers.re_entryNote) out.re_entryNote = answers.re_entryNote;
  for (const n of bundle.nodes[caseId] ?? []) {
    if (n.phase === 1 && answers[n.id] != null) out[n.id] = answers[n.id];
  }
  return out;
}

function firstOptionFor(node) {
  if (node.kind === "text") return "sample text";
  return node.options[0]?.value ?? "01";
}

function countSubstring(haystack, needle) {
  let count = 0;
  let i = 0;
  while ((i = haystack.indexOf(needle, i)) >= 0) {
    count++;
    i += needle.length;
  }
  return count;
}

function hasRepeated4Gram(summary) {
  const words = summary.split(/\s+/).filter(Boolean);
  if (words.length < 8) return false;
  const seen = new Set();
  for (let i = 0; i <= words.length - 4; i++) {
    const gram = words.slice(i, i + 4).join(" ");
    if (seen.has(gram)) return true;
    seen.add(gram);
  }
  return false;
}

const FACT2_ALLOWED_END = /(다는 점|이다는 점|있다는 점|상태라는 점|상황이라는 점)$/;
const FACT2_FORBIDDEN_IN_SUMMARY = [
  /라다는/,
  /여서다는/,
  /여다는/,
  /므로다는/,
  /면다는/,
  /은다는 점/,
  /를다는/,
  /\.다는/,
  /전에다는/,
  /경우다는/,
  /상태다는/,
  /(?:수 있다|해야|좋습니다|안전|이어질|영향을 줄)/,
  /(?:이|하|되|겠|았|었|않)으면/,
  /려면/,
  /(?:할|될)\s*경우/,
];

function elevatedFact2Fragment(summary) {
  const m = summary.match(/2차 답변에서 (.+?)이 확인되어/);
  return m?.[1]?.trim() ?? "";
}

function summaryElevatedFact2LintFail(summary) {
  const frag = elevatedFact2Fragment(summary);
  if (!frag) return false;
  const probe = frag.endsWith("점") ? frag : `${frag}다는 점`;
  if (!FACT2_ALLOWED_END.test(probe)) return true;
  for (const re of FACT2_FORBIDDEN_IN_SUMMARY) {
    if (re.test(frag) || re.test(probe)) return true;
  }
  return false;
}

function phase2OnlyCautions(caseId, answers) {
  const p1 = buildFirstResultData(caseId, phase1Subset(caseId, answers));
  const full = buildFirstResultData(caseId, answers);
  return full.cautions.filter((c) => !p1.cautions.includes(c));
}

function walkPhase2Answers(caseId, phase1Answers) {
  const answers = { ...phase1Answers };
  for (let round = 0; round < 64; round++) {
    const ids = phase2QuestionIds(caseId, answers);
    let changed = false;
    for (const id of ids) {
      if (answers[id] != null && String(answers[id]).trim() !== "") continue;
      const node = bundle.nodes[caseId]?.find((n) => n.id === id);
      if (!node) continue;
      answers[id] = firstOptionFor(node);
      changed = true;
    }
    if (!changed && isPhase2QuestionSetComplete(caseId, answers)) break;
  }
  return answers;
}

const stats = {
  combinations: 0,
  inspected: 0,
  build_null: 0,
  grade_regression: 0,
  ok_headline_on_caution: 0,
  maintained_fragment: 0,
  caution_echo_in_summary: 0,
  sentence2_forbidden: 0,
  elevated_missing_fact2: 0,
  double_phase2_prefix: 0,
  forbidden_fallback_phrase: 0,
  fact2_dict_mismatch: 0,
  fact2_contains_prefix: 0,
  summary_4gram_repeat: 0,
  summary_fact2_lint: 0,
  empty_headline: 0,
  empty_summary: 0,
  empty_actions: 0,
  empty_personalized_context: 0,
  forbidden_hits: 0,
  label_echo: 0,
  semantic_conflict: 0,
  summary_dominance_fail: 0,
};

const summaryCountsByCase = {};
for (const c of CASES) summaryCountsByCase[c] = new Map();

for (const caseId of CASES) {
  for (const phase1 of enumeratePhase1Combinations(caseId)) {
    stats.combinations++;
    const answers = walkPhase2Answers(caseId, phase1);
    answers[ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_ANSWERS_KEY] = "1";
    if (!isPhase2QuestionSetComplete(caseId, answers)) continue;
    stats.inspected++;
    const built = bridge.buildPersonalizedResult(answers);
    if (!built) {
      stats.build_null++;
      continue;
    }
    const { grade1, grade2 } = tracePackPersonalizedGrades(caseId, answers);
    if (grade2 < grade1) stats.grade_regression++;
    if (packPersonalizedSummaryFailsOkHeadlineCheck(built)) stats.ok_headline_on_caution++;
    const p1 = buildFirstResultData(caseId, phase1Subset(caseId, answers));
    if (built.gradeFilled < p1.gradeFilled) stats.grade_regression++;

    const qaFlags = analyzePersonalizedSummaryForQa(caseId, answers, built);
    if (qaFlags.maintained_fragment) stats.maintained_fragment++;
    if (qaFlags.caution_echo) stats.caution_echo_in_summary++;
    if (qaFlags.sentence2_forbidden) stats.sentence2_forbidden++;
    const p2Cautions = phase2OnlyCautions(caseId, answers);
    const elevated = p2Cautions.length > 0 || grade2 > grade1;
    const summary = built.situationSummary ?? "";
    if (countSubstring(summary, "2차 답변에서") >= 2) stats.double_phase2_prefix++;
    if (/추가로 짚어야 할|드러났다는 점이 추가로|추가로 확인되었고, 직접 대조할/.test(summary)) {
      stats.forbidden_fallback_phrase++;
    }
    if (elevated) {
      const fact2 = resolvePackPersonalizedFact2(caseId, answers, p2Cautions);
      const key = resolvePackPersonalizedFact2Key(caseId, answers, p2Cautions);
      if (!fact2.trim()) stats.elevated_missing_fact2++;
      else {
        const dict = REAL_ESTATE_FIRST_RESULT_PACK_META[caseId]?.phase2Fact2 ?? {};
        if (!key || dict[key] !== fact2) stats.fact2_dict_mismatch++;
        if (fact2.includes("2차 답변에서")) stats.fact2_contains_prefix++;
      }
    } else if (qaFlags.elevated_missing_fact2) stats.elevated_missing_fact2++;

    if (hasRepeated4Gram(summary)) stats.summary_4gram_repeat++;
    if (elevated && summaryElevatedFact2LintFail(summary)) stats.summary_fact2_lint++;

    if (!built.statusHeadline?.trim()) stats.empty_headline++;
    if (!built.situationSummary?.trim()) stats.empty_summary++;
    if (!built.actions?.length || built.actions.every((a) => !a.trim())) stats.empty_actions++;
    const ctx = built.personalizedContext;
    if (!ctx?.integratedSituation?.trim() || !ctx.documentsNeededNote?.trim()) {
      stats.empty_personalized_context++;
    }
    const blob = JSON.stringify(built);
    for (const re of FORBIDDEN) {
      if (re.test(blob)) stats.forbidden_hits++;
    }
    const resolved = resolveCaseFromAnswers(answers);
    if (resolved !== caseId) stats.build_null++;
    for (const q of bridge.buildReviewQuestions(answers, 2)) {
      if (q.kind !== "choice") continue;
      const raw = answers[q.id];
      const opt = q.options.find((o) => o.value === raw);
      if (opt && built.situationSummary.includes(opt.label)) stats.label_echo++;
    }
    const conflict = detectPackPersonalizedSemanticConflict(caseId, answers);
    if (conflict) stats.semantic_conflict++;

    const m = summaryCountsByCase[caseId];
    m.set(summary, (m.get(summary) ?? 0) + 1);
  }
}

for (const caseId of CASES) {
  const m = summaryCountsByCase[caseId];
  let max = 0;
  for (const n of m.values()) max = Math.max(max, n);
  const total = [...m.values()].reduce((a, b) => a + b, 0);
  if (total > 0 && max / total > 0.5) stats.summary_dominance_fail++;
}

console.log(JSON.stringify(stats, null, 2));
const fail =
  stats.build_null > 0 ||
  stats.grade_regression > 0 ||
  stats.ok_headline_on_caution > 0 ||
  stats.maintained_fragment > 0 ||
  stats.caution_echo_in_summary > 0 ||
  stats.sentence2_forbidden > 0 ||
  stats.elevated_missing_fact2 > 0 ||
  stats.double_phase2_prefix > 0 ||
  stats.forbidden_fallback_phrase > 0 ||
  stats.fact2_dict_mismatch > 0 ||
  stats.fact2_contains_prefix > 0 ||
  stats.summary_4gram_repeat > 0 ||
  stats.summary_fact2_lint > 0 ||
  stats.empty_headline > 0 ||
  stats.empty_summary > 0 ||
  stats.empty_actions > 0 ||
  stats.empty_personalized_context > 0 ||
  stats.forbidden_hits > 0 ||
  stats.label_echo > 0 ||
  stats.semantic_conflict > 0 ||
  stats.summary_dominance_fail > 0;
if (fail) process.exit(1);
