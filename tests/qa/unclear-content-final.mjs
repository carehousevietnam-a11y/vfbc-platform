/**
 * UNCLEAR_CONTENT_V2.md ↔ unclear pack.
 * Counts come from the document and the pack, not from fixed literals.
 * Run: node tests/qa/unclear-content-final.mjs
 */
import { ensureTsxRuntime } from "./_ensure-tsx-runtime.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

ensureTsxRuntime(import.meta.url);

const { parseUnclearContentFinal, parseUnclearAuditTable } = await import("../../scripts/parse-unclear-content-final.mjs");
const {
  UNCLEAR_CONTENT_FINAL,
  createUnclearVerifyMasterPackBridge,
  buildUnclearProfile,
  buildUnclearVerifyAiReportContentFromActivities,
} = await import("../../src/lib/contentPacks/unclear/unclearPack.ts");
const { buildMypagePdfBytesForQaHarness } = await import("../../src/lib/mypagePdfExecutiveRender.ts");
const { ADMIN_VERIFY_ANSWERS_META_JSON_KEY, getAdminChoiceNoteKey } = await import("../../src/lib/adminVerifyProfiling.ts");

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const md = fs.readFileSync(path.join(repoRoot, "docs/master/content/UNCLEAR_CONTENT_V2.md"), "utf8");
const parsed = parseUnclearContentFinal(md);
const audit = parseUnclearAuditTable(md);
const bridge = createUnclearVerifyMasterPackBridge();
const failures = [];
const fail = (message) => failures.push(message);

if (JSON.stringify(parsed) !== JSON.stringify(UNCLEAR_CONTENT_FINAL)) {
  fail("unclear pack data does not match UNCLEAR_CONTENT_V2.md");
}

const routes = [...new Set(parsed.questions.map((question) => question.route))];
const customerTexts = [];
const pushText = (value) => {
  if (typeof value === "string" && value.trim()) customerTexts.push(value);
};

function pairKey(fields) {
  return Object.entries(fields).map(([key, value]) => `${key}=${value}`).join("|");
}

function answersFor(route, choiceIndex, directQuestionCode, entryValue) {
  const answers = {};
  const entry = parsed.entry.choices.find((choice) => choice.route === route) ?? parsed.entry.choices[0];
  answers[parsed.entry.id] = entryValue || entry.value;
  for (const question of parsed.questions.filter((item) => item.route === route)) {
    if (question.code === directQuestionCode) {
      answers[question.id] = "other";
      answers[getAdminChoiceNoteKey(question.id)] = "직접 적은 상황";
      continue;
    }
    const choice = question.choices[choiceIndex % question.choices.length];
    answers[question.id] = choice.value;
  }
  return answers;
}

for (const route of routes) {
  const phase1 = parsed.questions.filter((question) => question.route === route && question.phase === 1);
  const phase2 = parsed.questions.filter((question) => question.route === route && question.phase === 2);
  const total = phase1.length + phase2.length;
  const ratio = total === 0 ? 0 : phase2.length / total;
  if (!(ratio >= 0.6)) fail(`${route} phase2 ratio ${ratio}`);
  if (!(phase2.length > phase1.length)) fail(`${route} phase2 ${phase2.length} not above phase1 ${phase1.length}`);
  const expectedPhase1 = Number(String(audit["1차 질문 수"]?.[route] ?? "").replace(/[^\d.]/g, ""));
  const expectedPhase2 = Number(String(audit["2차 질문 수"]?.[route] ?? "").replace(/[^\d.]/g, ""));
  const expectedOptions = Number(String(audit["선택지 총수(직접 입력 포함)"]?.[route] ?? "").replace(/[^\d.]/g, ""));
  if (phase1.length !== expectedPhase1) fail(`${route} phase1 ${phase1.length} != document ${expectedPhase1}`);
  if (phase2.length !== expectedPhase2) fail(`${route} phase2 ${phase2.length} != document ${expectedPhase2}`);
  const optionTotal = parsed.questions
    .filter((question) => question.route === route)
    .reduce((sum, question) => sum + question.choices.length + 1, 0);
  if (optionTotal !== expectedOptions) fail(`${route} options ${optionTotal} != document ${expectedOptions}`);
  for (const question of [...phase1, ...phase2]) {
    if (question.choices.length < 4) fail(`${question.code} choices ${question.choices.length}`);
    if (Object.keys(question.directFields).length < 2) fail(`${question.code} direct fields`);
    for (const choice of question.choices) {
      if (Object.keys(choice.fields).length < 2) fail(`${question.code} stored fields`);
    }
  }
}

const labelByValue = new Map();
function rememberLabel(value) {
  const label = parsed.labels[value];
  if (!label) {
    fail(`label missing ${value}`);
    return;
  }
  const previous = labelByValue.get(value);
  if (previous && previous !== label) fail(`label drift ${value}`);
  labelByValue.set(value, label);
}
for (const question of [parsed.entry, ...parsed.questions]) {
  for (const choice of question.choices) {
    for (const value of Object.values(choice.fields)) rememberLabel(value);
  }
  for (const value of Object.values(question.directFields ?? {})) rememberLabel(value);
}

pushText(parsed.entry.prompt, parsed.entry.subtitle);
parsed.entry.choices.forEach((choice) => {
  pushText(choice.label);
  pushText(choice.description);
});
for (const question of parsed.questions) {
  pushText(question.prompt);
  question.choices.forEach((choice) => pushText(choice.label));
}
for (const route of routes) {
  const first = parsed.firstResult[route];
  const seen = new Set();
  for (const card of first.cards) {
    for (const sentence of Object.values(card.sentences)) {
      pushText(sentence);
      if (seen.has(sentence)) fail(`${route} duplicate first sentence`);
      seen.add(sentence);
    }
  }
  for (const verdict of Object.values(first.verdicts)) {
    pushText(verdict.headline);
    pushText(verdict.body);
    if (seen.has(verdict.headline) || seen.has(verdict.body)) fail(`${route} duplicate verdict`);
    seen.add(verdict.headline);
    seen.add(verdict.body);
  }
  for (const rule of first.risks.rules) {
    pushText(rule.sentence);
    if (seen.has(rule.sentence)) fail(`${route} duplicate risk`);
    seen.add(rule.sentence);
  }
  pushText(first.risks.fallback);
  for (const block of parsed.phase2Result[route]) {
    for (const sentence of Object.values(block.sentences)) pushText(sentence);
  }
}
for (const row of parsed.connections) pushText(row.sentence);
pushText(...parsed.afterResultGuide.pre, ...parsed.afterResultGuide.post);
for (const label of Object.values(parsed.labels)) pushText(label);
pushText(parsed.directNotice, parsed.reportFixed.missingFileNotice);

const latin = /[A-Za-z]/;
const banned = /반드시|무조건|100%/;
for (const text of customerTexts) {
  if (latin.test(text)) fail(`latin in customer text: ${text.slice(0, 80)}`);
  if (banned.test(text)) fail(`banned phrase: ${text.slice(0, 80)}`);
}

const samples = [
  ["M", 0, null, null],
  ["M", 1, "Q2-M", null],
  ["M", 2, null, null],
  ["D", 0, null, null],
  ["D", 1, null, null],
  ["D", 3, null, null],
  ["N", 0, null, null],
  ["N", 1, null, "o4"],
  ["N", 2, "Q6-N", "other"],
];
let directSamples = 0;
let unsureEntry = 0;
let directEntry = 0;
for (const [route, index, directCode, entryValue] of samples) {
  const answers = answersFor(route, index, directCode, entryValue);
  if (directCode) directSamples += 1;
  if (entryValue === "o4") unsureEntry += 1;
  if (entryValue === "other") {
    directEntry += 1;
    answers[getAdminChoiceNoteKey(parsed.entry.id)] = "어떤 서류인지 적어 둔 메모";
  }
  const profile = buildUnclearProfile(answers);
  if (entryValue === "o4" && profile.unclear_routeSelectionMode !== "unsure") fail("unsure entry did not stay on N");
  if (entryValue === "other" && profile.unclear_routeSelectionMode !== "direct_input") fail("direct entry did not stay on N");
  const first = bridge.buildFirstResult(answers);
  const second = bridge.buildPersonalizedResult(answers);
  if (!first || !second) {
    fail(`${route} sample ${index} missing result`);
    continue;
  }
  const blob = JSON.stringify({ first, second });
  if (/unclear_|direct_input|pay|submit_or_appear|notice_only/.test(blob)) {
    fail(`${route} sample ${index} leaked a code into the result`);
  }
  const activities = [{ action: "verify_lead", meta: { [ADMIN_VERIFY_ANSWERS_META_JSON_KEY]: JSON.stringify(answers) } }];
  const report = buildUnclearVerifyAiReportContentFromActivities(activities);
  const reportBlob = JSON.stringify(report);
  if (/unclear_|direct_input|submit_or_appear|notice_only/.test(reportBlob)) {
    fail(`${route} sample ${index} leaked a code into the report`);
  }
  const bytes = await buildMypagePdfBytesForQaHarness({
    leadId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    serviceType: "verify_unclear",
    result: "conditional",
    createdAt: "2026-10-10T00:00:00.000Z",
    activities,
  });
  if (!bytes || bytes.length < 1000) fail(`${route} sample ${index} pdf missing`);
}
if (directSamples < 2) fail("direct samples");
if (unsureEntry < 1 || directEntry < 1) fail("entry N samples");

if (failures.length) {
  console.log(failures.join("\n"));
  process.exit(1);
}
console.log("PASS unclear-content-final");
