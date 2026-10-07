/**
 * C1.13+ — 렌더 수준 전수: Pack 1차 결과 + Admin 패널 SSR 텍스트
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { enumeratePhase1Combinations } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import { findJosaViolations } from "../../src/lib/contentPacks/realEstate/koreanParticle.ts";
import {
  countTripleWordRepeat,
  hasGerundTenseDefect,
  isRe01ViewingOriginalMatchSemanticFail,
} from "../../src/lib/contentPacks/realEstate/m45Engine.ts";
import { checkChoiceMeaningViolations } from "../../src/lib/contentPacks/realEstate/renderSemanticChecks.ts";
import { buildFirstResultData } from "../../src/lib/contentPacks/runner.ts";
import { createRealEstateVerifyMasterPackBridge } from "../../src/lib/verifyMasterPackBridge.ts";
import { AdminVerifyFirstResultPanel } from "../../src/components/cost-check/AdminVerifyFirstResultPanel.tsx";
import { realEstatePackBundle } from "../../src/lib/contentPacks/realEstate/packBundle.ts";

const CASES = ["RE01", "RE02", "RE03", "RE04", "RE05"];
const FORBIDDEN = [
  "행정문서",
  "교통국",
  "통지·안내",
  "베트남 행정서류",
  "행정문서 1차",
];

const bridge = createRealEstateVerifyMasterPackBridge();
const contentSlots = bridge.getContentSlots().firstResult;
const bundle = realEstatePackBundle();

function phase1ChoiceLabels(caseId) {
  const ids = bundle.phase1Order?.[caseId] ?? [];
  const labels = [];
  for (const qid of ids) {
    const node = bundle.nodes[caseId]?.find((n) => n.id === qid);
    if (!node?.options) continue;
    for (const opt of node.options) {
      if (opt.label && opt.label.length >= 24) labels.push(opt.label.trim());
    }
  }
  return labels;
}

const choiceLabelsByCase = Object.fromEntries(CASES.map((c) => [c, phase1ChoiceLabels(c)]));

function visibleMetricCount(data) {
  return data.keyMetrics.filter((metric) => (metric.footnote ?? "").trim()).length;
}

function renderFirstResultHtml(data, answers) {
  return renderToStaticMarkup(
    createElement(AdminVerifyFirstResultPanel, {
      data,
      onContinue: () => {},
      contentSlots,
      transitionHooks: bridge.resolveFirstResultTransition(answers, data),
    }),
  );
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function packSourcedText(data) {
  return [
    data.statusHeadline,
    data.situationSummary,
    ...data.keyMetrics.map((m) => m.footnote),
  ]
    .filter(Boolean)
    .join("\n");
}

function hasPackTextDefect(text) {
  if (!text.trim()) return true;
  if (/\bundefined\b/i.test(text) || /\bnull\b/i.test(text)) return true;
  if (text.includes("[") || text.includes("]")) return true;
  if (/\(분양이면/.test(text)) return true;
  if (text.includes(" / ") && /임대:|매매:|상가/.test(text)) return true;
  return false;
}

function hasGrammarDefect(text) {
  if (/습니다\.(를|을)/.test(text)) return true;
  if (/하고 싶습니다\.를/.test(text)) return true;
  if (/같습니다\.를/.test(text)) return true;
  if (text.includes("상태이 필요")) return true;
  if (hasGerundTenseDefect(text)) return true;
  return findJosaViolations(text).length > 0;
}

function embedsFullChoiceLabel(caseId, text) {
  if (caseId !== "RE01") return false;
  const labels = choiceLabelsByCase[caseId] ?? [];
  return labels.some((label) => label.length >= 40 && text.includes(label));
}

function verdictAligned(data) {
  const attention = data.statusTone === "caution";
  const headlineNeeds =
    data.statusHeadline.includes("확인이 필요") ||
    data.statusHeadline.includes("주의") ||
    data.statusHeadline.includes("전문가");
  const headlineOk = data.statusHeadline.includes("큰 문제가 보이지 않습니다");
  if (attention && !headlineNeeds) return false;
  if (!attention && !headlineOk) return false;
  const gradeOk = attention
    ? data.gradeLabel === "주의 요망 (2단계)"
    : data.gradeLabel === "양호 (1단계)";
  if (!gradeOk) return false;
  return data.keyMetrics.every((m) => (m.status === "caution") === attention);
}

function summaryDuplicatesFirstMetric(data) {
  const m1 = (data.keyMetrics[0]?.footnote ?? "").trim();
  const sum = (data.situationSummary ?? "").trim();
  return m1 && sum === m1;
}

let total = 0;
let cards3 = 0;
let headlineOk = 0;
let forbiddenHits = 0;
let defectTokens = 0;
let grammarDefects = 0;
let fullChoiceEmbed = 0;
let adminTransitionLabels = 0;
let transitionNotice = 0;
let verdictMismatch = 0;
let josaViolationHits = 0;
let summaryEqMetric1 = 0;
let re01ViewingOriginalSemanticFail = 0;
let tripleWordRepeatM2 = 0;
let gerundTenseDefects = 0;
const meaningViolationsByCase = Object.fromEntries(CASES.map((c) => [c, 0]));

for (const caseId of CASES) {
  for (const answers of enumeratePhase1Combinations(caseId)) {
    total++;
    const data = buildFirstResultData(caseId, answers);
    const html = renderFirstResultHtml(data, answers);
    const visibleText = stripTags(html);
    const packText = packSourcedText(data);

    if (visibleMetricCount(data) === 3) cards3++;
    if (data.statusHeadline?.trim() && data.situationSummary?.trim()) headlineOk++;
    if (FORBIDDEN.some((s) => visibleText.includes(s))) forbiddenHits++;
    if (hasPackTextDefect(packText)) defectTokens++;
    if (hasGrammarDefect(packText)) grammarDefects++;
    if (hasGerundTenseDefect(packText)) gerundTenseDefects++;
    if (embedsFullChoiceLabel(caseId, packText)) fullChoiceEmbed++;

    if (
      visibleText.includes("AI 정보 보기") &&
      visibleText.includes("개인화 상세 검토하기")
    ) {
      adminTransitionLabels++;
    }
    if (
      visibleText.includes("안내:") &&
      visibleText.includes("검토 범위·서류 유형에 따라 비용이 발생할 수 있습니다")
    ) {
      transitionNotice++;
    }
    if (!verdictAligned(data)) verdictMismatch++;
    if (findJosaViolations(packText).length > 0) josaViolationHits++;
    if (summaryDuplicatesFirstMetric(data)) summaryEqMetric1++;
    const m2line = (data.keyMetrics[1]?.footnote ?? "").trim();
    if (m2line && countTripleWordRepeat(m2line)) tripleWordRepeatM2++;
    if (caseId === "RE01") {
      const m2 = data.keyMetrics[1]?.footnote ?? "";
      if (isRe01ViewingOriginalMatchSemanticFail(answers, m2)) re01ViewingOriginalSemanticFail++;
    }
    const meaningHits = checkChoiceMeaningViolations(
      caseId,
      answers,
      data.keyMetrics.map((m) => m.footnote ?? ""),
    );
    meaningViolationsByCase[caseId] += meaningHits.length;
  }
}

console.log(
  JSON.stringify(
    {
      total,
      cards3_eq_3: cards3,
      headline_summary_nonempty: headlineOk,
      forbidden_string_hits: forbiddenHits,
      render_defect_hits: defectTokens,
      grammar_particle_defects: grammarDefects,
      full_choice_label_embeds: fullChoiceEmbed,
      admin_transition_labels: adminTransitionLabels,
      transition_notice_block: transitionNotice,
      verdict_grade_badge_mismatch: verdictMismatch,
      josa_violation_combos: josaViolationHits,
      situation_summary_eq_metric1: summaryEqMetric1,
      re01_viewing_original_semantic_fail: re01ViewingOriginalSemanticFail,
      metric2_triple_word_repeat: tripleWordRepeatM2,
      gerund_tense_defects: gerundTenseDefects,
      choice_meaning_violations_by_case: meaningViolationsByCase,
    },
    null,
    2,
  ),
);
