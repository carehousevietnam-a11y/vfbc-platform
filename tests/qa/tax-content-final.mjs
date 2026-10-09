/**
 * TAX_CONTENT_FINAL.md ↔ tax pack.
 * Run: node tests/qa/tax-content-final.mjs
 */
import { ensureTsxRuntime } from "./_ensure-tsx-runtime.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

ensureTsxRuntime(import.meta.url);

const { parseTaxContentFinal } = await import("../../scripts/parse-tax-content-final.mjs");
const {
  TAX_CONTENT_FINAL,
  createTaxVerifyMasterPackBridge,
  selectedTaxRoute,
  taxConnectionFlags,
  taxFirstResultCustomerLength,
  taxStitchProgress,
  buildTaxProfile,
} = await import("../../src/lib/contentPacks/tax/taxPack.ts");

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const md = fs.readFileSync(path.join(repoRoot, "docs/master/content/TAX_CONTENT_FINAL.md"), "utf8");
const parsed = parseTaxContentFinal(md);
const bridge = createTaxVerifyMasterPackBridge();
const failures = [];

function fail(message) {
  failures.push(message);
}

if (JSON.stringify(parsed) !== JSON.stringify(TAX_CONTENT_FINAL)) {
  fail("taxPack data does not match TAX_CONTENT_FINAL.md");
}

const routes = ["P", "V", "C"];
for (const route of routes) {
  const phase1 = parsed.questions.filter((question) => question.route === route && question.phase === 1);
  const phase2 = parsed.questions.filter((question) => question.route === route && question.phase === 2);
  if (phase1.length !== 4) fail(`${route} phase1 ${phase1.length}`);
  if (phase2.length !== 7) fail(`${route} phase2 ${phase2.length}`);
  const answers = answersFor(route, 1);
  const shown1 = bridge.buildReviewQuestions(answers, 1).filter((question) => question.id !== "re_entry");
  const shown2 = bridge.buildReviewQuestions(answers, 2);
  if (shown1.length !== 4) fail(`${route} bridge phase1 ${shown1.length}`);
  if (shown2.length !== 7) fail(`${route} bridge phase2 ${shown2.length}`);
  for (const question of [...phase1, ...phase2]) {
    const shown = [...shown1, ...shown2].find((item) => item.id === question.id);
    if (!shown || shown.kind !== "choice") {
      fail(`${question.code} missing from bridge`);
      continue;
    }
    if (shown.label !== question.prompt) fail(`${question.code} prompt mismatch`);
    if (shown.options.length !== question.choices.length + 1) {
      fail(`${question.code} option count ${shown.options.length} != ${question.choices.length + 1}`);
    }
    question.choices.forEach((choice, index) => {
      const option = shown.options[index];
      if (!option || option.label !== choice.label) fail(`${question.code} choice ${index + 1} label`);
      if (Object.keys(choice.fields).length < 2) fail(`${question.code} choice ${index + 1} fields`);
    });
    const last = shown.options[shown.options.length - 1];
    if (last?.value !== "other") fail(`${question.code} direct input is not last`);
    if (Object.keys(question.directFields).length < 2) fail(`${question.code} direct fields`);
  }
}

for (const route of routes) {
  const first = parsed.firstResult[route];
  for (const question of parsed.questions.filter((item) => item.route === route && item.phase === 1)) {
    for (const choice of question.choices) {
      const key = Object.entries(choice.fields)
        .map(([field, value]) => `${field}=${value}`)
        .join("|");
      if (question.code.startsWith("Q4")) {
        if (!first.verdicts[key]?.headline || !first.verdicts[key]?.body) fail(`${question.code} verdict ${key}`);
      } else {
        const card = first.cards.find((item) => item.questionCode === question.code);
        if (!card?.sentences[key]) fail(`${question.code} card ${key}`);
      }
    }
  }
  for (const question of parsed.questions.filter((item) => item.route === route && item.phase === 2)) {
    const block = parsed.phase2Result[route].find((item) => item.questionCode === question.code);
    for (const choice of question.choices) {
      const key = Object.entries(choice.fields)
        .map(([field, value]) => `${field}=${value}`)
        .join("|");
      if (!block?.sentences[key]) fail(`${question.code} phase2 ${key}`);
    }
  }
  for (const card of first.cards) {
    for (const sentence of Object.values(card.sentences)) {
      if ([...sentence].length > 50) fail(`${route} card over 50: ${sentence}`);
    }
  }
}

const screenTexts = [];
screenTexts.push(parsed.entry.prompt, ...parsed.entry.choices.map((choice) => choice.label));
for (const question of parsed.questions) {
  screenTexts.push(question.prompt, ...question.choices.map((choice) => choice.label));
}
for (const route of routes) {
  for (const card of parsed.firstResult[route].cards) screenTexts.push(...Object.values(card.sentences));
  for (const verdict of Object.values(parsed.firstResult[route].verdicts)) {
    screenTexts.push(verdict.headline, verdict.body);
  }
  screenTexts.push(
    ...parsed.firstResult[route].risks.rules.map((rule) => rule.sentence),
    parsed.firstResult[route].risks.fallback,
  );
  for (const block of parsed.phase2Result[route]) screenTexts.push(...Object.values(block.sentences));
}
screenTexts.push(...Object.values(parsed.labels), parsed.directNotice);
for (const text of screenTexts) {
  if (/[A-Za-z]/.test(text.replace(/VAT/g, ""))) fail(`english on screen: ${text.slice(0, 80)}`);
}

const usedValues = new Set();
function collect(fields) {
  for (const value of Object.values(fields)) usedValues.add(value);
}
collect(parsed.entry.directFields);
for (const choice of parsed.entry.choices) collect(choice.fields);
for (const question of parsed.questions) {
  collect(question.directFields);
  for (const choice of question.choices) collect(choice.fields);
}
for (const value of usedValues) {
  if (!parsed.labels[value]) fail(`G label missing ${value}`);
}
if (Object.keys(parsed.labels).length !== Object.keys(TAX_CONTENT_FINAL.labels).length) {
  fail("G label count drifted");
}

function answersFor(route, choiceValue = "o1", overrides = {}) {
  const entryValue = route === "V" ? "o2" : route === "C" ? "o3" : "o1";
  const answers = { re_entry: entryValue };
  for (const question of parsed.questions.filter((item) => item.route === route)) {
    answers[question.id] = choiceValue;
  }
  return { ...answers, ...overrides };
}

const lengths = {};
for (const route of routes) {
  const answers = answersFor(route, "o1");
  const length = taxFirstResultCustomerLength(answers);
  lengths[route] = length;
  if (length === 0 || length >= 1700) fail(`${route} first result length ${length}`);
  const first = bridge.buildFirstResult(answers);
  if (!first || first.keyMetrics.length !== 3) fail(`${route} first cards`);
  const second = bridge.buildPersonalizedResult(answers);
  if (!second || second.keyMetrics.length !== 7) fail(`${route} phase2 blocks ${second?.keyMetrics.length}`);
}

const fraudAnswers = answersFor("P", "o1", { re15_q5: "o2" });
if (!taxConnectionFlags(fraudAnswers).fraud) fail("P document path did not show fraud guidance");
const expertAnswers = answersFor("V", "o1", { re12_q2: "o3", re18_q8: "o1" });
if (!taxConnectionFlags(expertAnswers).expert) fail("V imminent path did not show expert guidance");
const checkAnswers = answersFor("C", "o1", { re14_q4: "o5", re15_q5: "o5" });
const checkPhase1 = bridge.buildReviewQuestions({ re_entry: "o3" }, 1).filter((q) => q.id !== "re_entry");
const checkPhase2 = bridge.buildReviewQuestions(checkAnswers, 2);
if (checkPhase1.length !== 4 || checkPhase2.length !== 7) fail("C self-check skipped questions");
if (selectedTaxRoute({ re_entry: "other", re_entryNote: "직접 적은 세금 상황입니다." }) !== "P") {
  fail("direct entry did not start P");
}
const directProfile = buildTaxProfile({
  re_entry: "other",
  re_entryNote: "직접 적은 세금 상황입니다.",
});
if (directProfile.tax_route !== "unsure_default_personal" || directProfile.route_selection_mode !== "direct_input") {
  fail("direct entry fields");
}
if (!directProfile.route_selection_mode_detail) fail("direct detail missing");

const packSource = fs.readFileSync(
  path.join(repoRoot, "src/lib/contentPacks/tax/taxPack.ts"),
  "utf8",
);
if (packSource.includes("expert.slice(0, 4)") || packSource.includes("rest.slice(0, 4)")) {
  fail("phase2 result is still sliced to 4");
}
if (/phase2Questions\([^)]*\)\.slice\(/.test(packSource)) fail("phase2Questions is sliced");
for (const route of routes) {
  const entry = { re_entry: route === "V" ? "o2" : route === "C" ? "o3" : "o1" };
  const entryProgress = taxStitchProgress(entry, 1, 0);
  const firstProgress = taxStitchProgress(entry, 1, 1);
  const lastPhase1 = taxStitchProgress(entry, 1, 4);
  const firstPhase2 = taxStitchProgress(entry, 2, 0);
  const lastPhase2 = taxStitchProgress(entry, 2, 6);
  if (entryProgress.total !== 11 || firstProgress.total !== 11 || lastPhase2.total !== 11) {
    fail(`${route} progress total is not 11`);
  }
  if (entryProgress.current !== 0) fail(`${route} entry is counted in progress`);
  if (firstProgress.current !== 1 || lastPhase1.current !== 4) fail(`${route} phase1 progress`);
  if (firstPhase2.current !== 5 || lastPhase2.current !== 11) fail(`${route} phase2 progress`);
  if (bridge.stitchProgress?.(entry, 2, 6)?.total !== 11) fail(`${route} bridge progress`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("PASS tax-content-final");
console.log("first-result chars", JSON.stringify(lengths));
