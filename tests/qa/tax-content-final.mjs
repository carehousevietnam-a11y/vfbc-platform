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
  taxRiskSentences,
} = await import("../../src/lib/contentPacks/tax/taxPack.ts");
const { buildTaxReportNoteModel } = await import("../../src/lib/contentPacks/tax/taxReportNotes.ts");
const {
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY,
} = await import("../../src/lib/adminVerifyProfiling.ts");

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
      const visible = option?.description ? `${option.label} ${option.description}` : option?.label;
      if (!option || visible !== choice.label) fail(`${question.code} choice ${index + 1} label`);
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
screenTexts.push(
  parsed.entry.prompt,
  parsed.entry.subtitle,
  ...parsed.entry.choices.flatMap((choice) => [choice.label, choice.description]),
);
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
  if (text.includes("VAT")) fail(`VAT on screen: ${text.slice(0, 80)}`);
  if (/[A-Za-z]/.test(text)) fail(`english on screen: ${text.slice(0, 80)}`);
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
if (parsed.entry.prompt !== "어떤 세금 문제인가요?") fail("entry title");
if (parsed.entry.subtitle !== "가장 가까운 것을 하나 골라 주세요. 서류가 없거나 잘 몰라도 괜찮습니다.") {
  fail("entry subtitle");
}
const shownEntry = bridge.buildReviewQuestions({}, 1)[0];
if (!shownEntry || shownEntry.kind !== "choice") fail("entry question");
if (shownEntry?.kind === "choice") {
  if (shownEntry.label !== parsed.entry.prompt || shownEntry.description !== parsed.entry.subtitle) {
    fail("entry title and subtitle are not separate");
  }
  parsed.entry.choices.forEach((choice, index) => {
    const option = shownEntry.options[index];
    if (option?.label !== choice.label || option?.description !== choice.description) {
      fail(`entry choice ${index + 1} title/description`);
    }
  });
}
const q1p = parsed.questions.find((question) => question.code === "Q1-P");
const shownQ1 = bridge.buildReviewQuestions({ re_entry: "o1" }, 1).find((question) => question.id === "re11_q1");
if (q1p && shownQ1?.kind === "choice") {
  const first = q1p.choices[0];
  const option = shownQ1.options[0];
  if (!option?.description || `${option.label} ${option.description}` !== first.label) {
    fail("Q1-P first choice was not split into title and description");
  }
}

for (const route of routes) {
  const entry = { re_entry: route === "V" ? "o2" : route === "C" ? "o3" : "o1" };
  const entryProgress = taxStitchProgress({}, 1, 0);
  const entered = taxStitchProgress(entry, 1, 0);
  const firstProgress = taxStitchProgress(entry, 1, 1);
  const lastPhase1 = taxStitchProgress(entry, 1, 4);
  const firstPhase2 = taxStitchProgress(entry, 2, 0);
  const lastPhase2 = taxStitchProgress(entry, 2, 6);
  if (entryProgress.current !== 1 || entryProgress.total !== 1) {
    fail(`${route} entry progress is not the entry list length`);
  }
  if (entered.current !== 1 || entered.total !== 5) {
    fail(`${route} entry is outside the phase-1 list`);
  }
  if (firstProgress.current !== 2 || firstProgress.total !== 5 || lastPhase1.current !== 5 || lastPhase1.total !== 5) {
    fail(`${route} phase1 progress is not the phase-1 list length`);
  }
  if (firstPhase2.current !== 1 || firstPhase2.total !== 7 || lastPhase2.current !== 7 || lastPhase2.total !== 7) {
    fail(`${route} phase2 progress does not restart like MASTER`);
  }
}

const documentsSource = fs.readFileSync(path.join(repoRoot, "src/app/documents/page.tsx"), "utf8");
if (documentsSource.includes("phase2_upload_return=1")) {
  fail("tax documents return still opens the personalized panel");
}
if (!documentsSource.includes("navigateToMypageWithResultToken")) {
  fail("documents does not go to mypage");
}
const taxPageSource = fs.readFileSync(path.join(repoRoot, "src/app/verify/tax/page.tsx"), "utf8");
if (!taxPageSource.includes("const TAX_PHASE2_PERSONALIZED_PANEL: boolean = false")) {
  fail("tax personalized panel path is still called");
}

const kMatch = md.match(/# K\. 리포트 고정 문구[\s\S]*?(서류를 첨부하면 더 정확히 확인할 수 있습니다)/);
if (!kMatch || parsed.reportFixed?.missingFileNotice !== kMatch[1]) {
  fail("K section sentence is missing from the content parse");
}
if (TAX_CONTENT_FINAL.reportFixed.missingFileNotice !== kMatch?.[1]) {
  fail("K section sentence is not in the tax content data");
}
const taxPackSource = fs.readFileSync(path.join(repoRoot, "src/lib/contentPacks/tax/taxPack.ts"), "utf8");
if (!taxPackSource.includes("TAX_CONTENT_FINAL.reportFixed.missingFileNotice")) {
  fail("K section sentence is not used by the tax PDF");
}

const pRules = TAX_CONTENT_FINAL.firstResult.P.risks;
const vRules = TAX_CONTENT_FINAL.firstResult.V.risks;
const cRules = TAX_CONTENT_FINAL.firstResult.C.risks;
const pR1 = pRules.rules[0].sentence;
const pR2 = pRules.rules[1].sentence;
const vR1 = vRules.rules[0].sentence;
const vR3 = vRules.rules[2].sentence;
const cR1 = cRules.rules[0].sentence;
const cR2 = cRules.rules[1].sentence;

const incomeVerifiedDeadline = taxRiskSentences({
  re_entry: "o1",
  re14_q4: "o1",
  re15_q5: "o1",
  re18_q8: "o1",
});
if (incomeVerifiedDeadline.includes(pR1)) fail("verified notice still selects P-R1");
if (!incomeVerifiedDeadline.includes(pR2)) fail("passed deadline does not select P-R2");

const incomeUnverified = taxRiskSentences({ re_entry: "o1", re14_q4: "o1", re15_q5: "o2" });
if (!incomeUnverified.includes(pR1)) fail("unverified notice lost P-R1");

const incomePhase1 = taxRiskSentences({ re_entry: "o1", re14_q4: "o1" });
if (!incomePhase1.includes(pR1)) fail("phase-1 only lost P-R1");

const tradeVerifiedNear = taxRiskSentences({
  re_entry: "o2",
  re14_q4: "o1",
  re15_q5: "o1",
  re18_q8: "o3",
});
if (tradeVerifiedNear.includes(vR1)) fail("verified VAT notice still selects V-R1");
if (!tradeVerifiedNear.includes(vR3)) fail("near VAT deadline does not select V-R3");

const companyVerifiedPassed = taxRiskSentences({
  re_entry: "o3",
  re14_q4: "o1",
  re15_q5: "o1",
  re18_q8: "o1",
});
if (companyVerifiedPassed.includes(cR1)) fail("verified company notice still selects C-R1");
if (!companyVerifiedPassed.includes(cR2)) fail("passed company deadline does not select C-R2");

const noRisk = taxRiskSentences({
  re_entry: "o1",
  re11_q1: "o1",
  re12_q2: "o1",
  re13_q3: "o1",
  re14_q4: "o5",
});
if (noRisk.length !== 1 || noRisk[0] !== pRules.fallback) {
  fail("empty risk match did not use the single fallback sentence");
}

const guide = TAX_CONTENT_FINAL.reportGuide;
const sectionKeys = ["checklist", "order", "compare", "timeline", "misses", "questions"];
const sectionMarks = ["①", "②", "③", "④", "⑤", "⑥"];
const allowedUrls = new Set([
  "https://www.pwc.com/vn/en/publications/news-brief/251212-new-personal-income-tax-law.html",
  "https://en.baochinhphu.vn/law-on-personal-income-tax-approved-111251210112819468.htm",
  "https://www.vietnam-briefing.com/news/personal-income-tax-vietnam-deadlines-requirements-preparation.html/",
  "https://www.vietnam-briefing.com/news/vietnam-tax-compliance-mistakes-foreign-companies.html/",
  "https://english.luatvietnam.vn/aw-no-38-2019-qh14-dated-june-13-2019-of-the-national-assembly-on-tax-administration-174969-Doc1.html",
  "https://english.luatvietnam.vn/law-on-enterprises-no-59-2020-qh14-dated-june-17-2020-of-the-national-assembly-186272-doc1.html",
  "https://english.haiquanonline.com.vn/continue-to-warn-about-forms-of-fraud-against-taxpayers-30696.html",
]);
const sourceIds = new Set(guide.sources.rows.map((row) => row.id));
const parsedUrls = guide.sources.rows.flatMap((row) => row.urls);
if (guide.sources.confirmedOn !== "2026.10.10") fail("source date is not the stored constant");
if (parsedUrls.some((url) => !allowedUrls.has(url)) || parsedUrls.length !== allowedUrls.size) {
  fail("source URL list does not match the allowed URLs");
}
if (!guide.notice?.title || guide.notice.items.length !== 3) fail("notice box is missing");

const guideSentences = [];
function takeSentence(text, chips) {
  guideSentences.push(text);
  if (!chips?.length) fail(`missing source chip: ${text}`);
  for (const chip of chips ?? []) {
    if (chip !== "일반 실무" && !sourceIds.has(chip)) fail(`chip ${chip} is not in the source table`);
    if (!/^[1-7]$/.test(chip) && chip !== "일반 실무") fail(`chip ${chip} is not an allowed source`);
  }
}
takeSentence(guide.notice.flow, guide.notice.chips);
for (const item of guide.notice.items) takeSentence(item.text, item.chips);
for (const route of Object.values(guide.routes)) {
  sectionKeys.forEach((key, index) => {
    if (!route[key]?.title?.startsWith(sectionMarks[index])) fail(`route section ${sectionMarks[index]} missing`);
  });
  for (const row of route.checklist.rows) takeSentence(`${row.name} ${row.why}`, row.chips);
  takeSentence(route.order.flow, route.order.chips);
  for (const row of route.compare.rows) takeSentence(`${row.left} ${row.right} ${row.point}`, row.chips);
  takeSentence(route.timeline.flow, route.timeline.chips);
  takeSentence(route.timeline.note, route.timeline.noteChips);
  for (const item of route.misses.items) takeSentence(item.text, item.chips);
  for (const item of route.questions.items) takeSentence(item.text, item.chips);
}
for (const text of [guide.title, guide.subtitle, guide.caption, guide.disclaimer, guide.notice.title, ...guideSentences]) {
  if ([...text].length > 110) fail(`sentence longer than 110: ${text}`);
  if (/[A-Za-z]{2,}_[A-Za-z0-9_]+/.test(text)) fail(`english code in guide sentence: ${text}`);
  if (/\d+\s*%/.test(text)) fail(`tax rate in guide sentence: ${text}`);
  if (/[\u{1F000}-\u{1FAFF}\u2600-\u27BF]/u.test(text.replaceAll("✓", ""))) fail(`emoji in guide sentence: ${text}`);
}
if ((guide.caption.match(/\d{4}\.\d{1,2}\.\d{1,2}/g) ?? []).join() !== "2026.10.10") {
  fail("caption date is not the stored constant");
}
for (const text of guideSentences) {
  if (/\d{4}\.\d{1,2}\.\d{1,2}/.test(text)) fail(`deadline date in guide sentence: ${text}`);
}

function noteActivities(answers, paid) {
  const meta = { [ADMIN_VERIFY_ANSWERS_META_JSON_KEY]: JSON.stringify(answers) };
  if (paid) meta[ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY] = "1";
  return [{ meta }];
}
const freeNotice = buildTaxReportNoteModel(noteActivities({ re_entry: "o1", re14_q4: "o1" }, false));
if (!freeNotice || freeNotice.paid || !freeNotice.showNotice || freeNotice.usedSourceIds.includes("5")) {
  fail("free income notice guide did not stay on the free sections");
}
const paidQuiet = buildTaxReportNoteModel(
  noteActivities({ re_entry: "o1", re14_q4: "o5", re18_q8: "o2" }, true),
);
if (!paidQuiet?.paid || paidQuiet.showNotice || !paidQuiet.usedSourceIds.includes("5")) {
  fail("paid guide without a notice trigger still opened the notice box");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("PASS tax-content-final");
console.log("first-result chars", JSON.stringify(lengths));
