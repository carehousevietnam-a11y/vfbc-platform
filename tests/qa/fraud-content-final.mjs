/**
 * FRAUD_CONTENT_V3.md ↔ fraud pack.
 * Counts come from the document and the pack, not from fixed literals.
 * Run: node tests/qa/fraud-content-final.mjs
 */
import { ensureTsxRuntime } from "./_ensure-tsx-runtime.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

ensureTsxRuntime(import.meta.url);

const { parseFraudContentFinal, parseFraudAuditTable } = await import("../../scripts/parse-fraud-content-final.mjs");
const {
  FRAUD_CONTENT_FINAL,
  createFraudVerifyMasterPackBridge,
  buildFraudProfile,
  buildFraudVerifyAiReportContentFromActivities,
} = await import("../../src/lib/contentPacks/fraud/fraudPack.ts");
const { buildMypagePdfBytesForQaHarness } = await import("../../src/lib/mypagePdfExecutiveRender.ts");
const { ADMIN_VERIFY_ANSWERS_META_JSON_KEY, getAdminChoiceNoteKey } = await import("../../src/lib/adminVerifyProfiling.ts");

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const md = fs.readFileSync(path.join(repoRoot, "docs/master/content/FRAUD_CONTENT_V3.md"), "utf8");
const parsed = parseFraudContentFinal(md);
const audit = parseFraudAuditTable(md);
const bridge = createFraudVerifyMasterPackBridge();
const failures = [];
const fail = (message) => failures.push(message);

if (JSON.stringify(parsed) !== JSON.stringify(FRAUD_CONTENT_FINAL)) {
  fail("fraud pack data does not match FRAUD_CONTENT_V3.md");
}

const routes = [...new Set(parsed.questions.map((question) => question.route))];
const customerTexts = [];
const pushText = (value) => {
  if (typeof value === "string" && value.trim()) customerTexts.push(value);
};

function pairKey(fields) {
  return Object.entries(fields).map(([key, value]) => `${key}=${value}`).join("|");
}

function answersFor(route, choiceIndex, directQuestionCode) {
  const answers = {};
  const entry = parsed.entry.choices.find((choice) => choice.route === route) ?? parsed.entry.choices[0];
  answers[parsed.entry.id] = entry.value;
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
    if (Object.keys(question.directFields).length !== 2) fail(`${question.code} direct fields`);
    for (const choice of question.choices) {
      if (Object.keys(choice.fields).length !== 2) fail(`${question.code} stored fields`);
    }
  }
}

const schemeValues = new Set();
for (const question of parsed.questions) {
  for (const choice of question.choices) {
    if (choice.fields.fraud_scheme) schemeValues.add(choice.fields.fraud_scheme);
  }
}
for (const value of ["investment", "loan", "online_trade", "impersonation", "unsure_scheme"]) {
  if (!schemeValues.has(value)) fail(`missing scheme ${value}`);
}
if (schemeValues.has("romance") || schemeValues.has("partnership")) fail("retired scheme value is stored");

for (const question of [parsed.entry, ...parsed.questions]) {
  for (const choice of question.choices) {
    for (const value of Object.values(choice.fields)) {
      if (!parsed.labels[value]) fail(`label missing ${value}`);
    }
  }
}

pushText(parsed.entry.prompt, parsed.entry.subtitle);
parsed.entry.choices.forEach((choice) => {
  pushText(choice.label);
  pushText(choice.description);
});
for (const question of parsed.questions) {
  pushText(question.prompt);
  question.choices.forEach((choice) => {
    pushText(choice.label);
    pushText(choice.description);
  });
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
  ["B", 0, null],
  ["B", 1, null],
  ["B", 2, null],
  ["B", 0, "Q2-B"],
  ["A", 3, null],
  ["A", 4, null],
  ["A", 0, null],
  ["A", 1, "Q6-A"],
];
const seenSchemes = new Set();
let directSamples = 0;
for (const [route, index, directCode] of samples) {
  const answers = answersFor(route, index, directCode);
  if (directCode) directSamples += 1;
  const profile = buildFraudProfile(answers);
  if (profile.fraud_scheme && profile.fraud_scheme !== "direct_input") seenSchemes.add(profile.fraud_scheme);
  const first = bridge.buildFirstResult(answers);
  const second = bridge.buildPersonalizedResult(answers);
  if (!first || !second) {
    fail(`${route} sample ${index} missing result`);
    continue;
  }
  const blob = JSON.stringify({ first, second });
  if (/fraud_|investment|loan|online_trade|impersonation|unsure_scheme|direct_input/.test(blob)) {
    fail(`${route} sample ${index} leaked a code into the result`);
  }
  const activities = [{ action: "verify_lead", meta: { [ADMIN_VERIFY_ANSWERS_META_JSON_KEY]: JSON.stringify(answers) } }];
  const report = buildFraudVerifyAiReportContentFromActivities(activities);
  const reportBlob = JSON.stringify(report);
  if (/fraud_|investment|online_trade|unsure_scheme|direct_input/.test(reportBlob)) {
    fail(`${route} sample ${index} leaked a code into the report`);
  }
  const bytes = await buildMypagePdfBytesForQaHarness({
    leadId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    serviceType: "verify_fraud",
    result: "conditional",
    createdAt: "2026-10-10T00:00:00.000Z",
    activities,
  });
  if (!bytes || bytes.length < 1000) fail(`${route} sample ${index} pdf missing`);
}
for (const value of ["investment", "loan", "online_trade", "impersonation", "unsure_scheme"]) {
  if (!seenSchemes.has(value)) fail(`sample set missed scheme ${value}`);
}
if (directSamples < 2) fail("direct samples");

if (failures.length) {
  console.log(failures.join("\n"));
  process.exit(1);
}
console.log("PASS fraud-content-final");
