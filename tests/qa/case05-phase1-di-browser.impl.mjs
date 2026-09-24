/**
 * CASE_05 Phase1 Direct Input — dispositionType + confirmGoal (LEVEL 3 Browser QA)
 */
import { chromium } from "@playwright/test";
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  ADMIN_CASE_ENTRY_Q1_OPTIONS,
  ADMIN_DIRECT_EXPLAIN_LABEL,
  attachCaseResolutionSnapshot,
  buildAdminVerifyProfileQuestions,
  CASE05_DEADLINE_DATE_KEY,
  case05NeedsDeadlineDateDetail,
  getAdminChoiceNoteKey,
  isAdminVerifyChoiceFieldComplete,
  isCase05Phase1Complete,
} from "../../src/lib/adminVerifyProfiling.ts";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";
const EMPTY_FOLLOW = {};
const EMPTY_DOCS = { mismatch: [], unknown: [], other: [] };
const DIRECT_NOTE = "QA CASE05 DI note 2026-09-23";

async function clickChoice(page, text) {
  await page.waitForFunction(
    (needle) => {
      const b = [...document.querySelectorAll("button")].find((x) =>
        x.textContent?.includes(needle),
      );
      if (!b) return false;
      b.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      return true;
    },
    text,
    { timeout: 30_000 },
  );
  await page.waitForTimeout(500);
}

function nextPhase1Question(answers) {
  const qs = buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, 1);
  for (const q of qs) {
    if (q.id === ADMIN_CASE_ENTRY_Q1_KEY && answers[ADMIN_CASE_ENTRY_Q1_KEY]) continue;
    const val = answers[q.id]?.trim() ?? "";
    if (!val) return q;
    if (val === "other" && q.options) {
      if (!isAdminVerifyChoiceFieldComplete(q.id, answers, q.options)) return q;
    }
  }
  return null;
}

async function runDiOnField(page, sim, fieldId) {
  const q = nextPhase1Question(sim);
  if (!q || q.id !== fieldId) {
    return { pass: false, step: "question_mismatch", expected: fieldId, got: q?.id ?? null };
  }
  const directBtn = page.getByRole("button", { name: ADMIN_DIRECT_EXPLAIN_LABEL });
  if (!(await directBtn.isVisible().catch(() => false))) {
    return { pass: false, step: "direct_button_missing", fieldId };
  }
  await directBtn.click();
  await page.waitForTimeout(400);
  const textarea = page.locator("textarea").first();
  if (!(await textarea.isVisible().catch(() => false))) {
    return { pass: false, step: "textarea_missing", fieldId };
  }
  await textarea.fill(DIRECT_NOTE);
  await page.getByRole("button", { name: "다음" }).click();
  await page.waitForTimeout(800);
  const noteKey = getAdminChoiceNoteKey(fieldId);
  const next = attachCaseResolutionSnapshot({
    ...sim,
    [fieldId]: "other",
    [noteKey]: DIRECT_NOTE,
  });
  const complete = isAdminVerifyChoiceFieldComplete(fieldId, next, q.options);
  if (!complete) {
    return { pass: false, step: "engine_incomplete_after_di", fieldId };
  }
  return { pass: true, sim: next };
}

async function answerPhase1Choice(page, sim, fieldId, value) {
  const q = nextPhase1Question(sim);
  if (!q || q.id !== fieldId) {
    return { pass: false, step: "question_mismatch", expected: fieldId, got: q?.id ?? null, sim };
  }
  const opt = q.options.find((o) => o.value === value);
  if (!opt) {
    return { pass: false, step: "option_missing", fieldId, value, sim };
  }
  await clickChoice(page, opt.label.slice(0, 28));
  const next = attachCaseResolutionSnapshot({ ...sim, [fieldId]: value });
  return { pass: true, sim: next };
}

const q1 = ADMIN_CASE_ENTRY_Q1_OPTIONS.find((o) => o.value === "disposition_notice");
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const results = [];

try {
  let sim = attachCaseResolutionSnapshot({
    situation: "received_document",
    stage: "case",
    profileDocumentSource: "immigration",
    [ADMIN_CASE_ENTRY_Q1_KEY]: "disposition_notice",
  });

  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(700);
  await clickChoice(page, q1.label.slice(0, 18));

  const r1 = await runDiOnField(page, sim, "case05_dispositionType");
  results.push({ scenario: "dispositionType_DI", ...r1 });
  if (!r1.pass) throw new Error(JSON.stringify(r1));
  sim = r1.sim;

  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(700);
  await clickChoice(page, q1.label.slice(0, 18));
  sim = attachCaseResolutionSnapshot({
    situation: "received_document",
    stage: "case",
    profileDocumentSource: "immigration",
    [ADMIN_CASE_ENTRY_Q1_KEY]: "disposition_notice",
  });

  let step = await answerPhase1Choice(page, sim, "case05_dispositionType", "application_denied");
  if (!step.pass) throw new Error(JSON.stringify(step));
  sim = step.sim;

  const r2 = await runDiOnField(page, sim, "case05_confirmGoal");
  results.push({ scenario: "confirmGoal_DI", ...r2 });
  if (!r2.pass) throw new Error(JSON.stringify(r2));

  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(700);
  await clickChoice(page, q1.label.slice(0, 18));
  sim = attachCaseResolutionSnapshot({
    situation: "received_document",
    stage: "case",
    profileDocumentSource: "immigration",
    [ADMIN_CASE_ENTRY_Q1_KEY]: "disposition_notice",
  });
  step = await answerPhase1Choice(page, sim, "case05_dispositionType", "application_denied");
  if (!step.pass) throw new Error(JSON.stringify(step));
  sim = step.sim;
  step = await answerPhase1Choice(page, sim, "case05_confirmGoal", "what_to_do");
  if (!step.pass) throw new Error(JSON.stringify(step));
  sim = step.sim;
  step = await answerPhase1Choice(page, sim, "case05_customerResponse", "none");
  if (!step.pass) throw new Error(JSON.stringify(step));
  sim = step.sim;
  const deadlineQ = nextPhase1Question(sim);
  if (deadlineQ?.id !== "case05_deadline") {
    throw new Error(JSON.stringify({ step: "deadline_q_missing", got: deadlineQ?.id }));
  }
  const specificOpt = deadlineQ.options.find((o) => o.value === "specific_date");
  await clickChoice(page, specificOpt.label.slice(0, 24));
  sim = attachCaseResolutionSnapshot({ ...sim, case05_deadline: "specific_date" });
  const dateQ = nextPhase1Question(sim);
  const datePass =
    dateQ?.id === CASE05_DEADLINE_DATE_KEY &&
    dateQ.kind === "text" &&
    case05NeedsDeadlineDateDetail(sim);
    results.push({ scenario: "specific_date_text", pass: datePass, questionId: dateQ?.id });
    if (!datePass) throw new Error("specific_date text follow-up missing");
    const dateLabel = await page.evaluate(() => {
      const visible = (el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
      };
      const h = [...document.querySelectorAll("h3, h4")].filter(visible).pop();
      return (h?.textContent ?? "").trim();
    });
    results.push({
      scenario: "specific_date_label_visible",
      pass: dateLabel.includes("대응 기한"),
      label: dateLabel,
    });
    sim = attachCaseResolutionSnapshot({
      ...sim,
      [CASE05_DEADLINE_DATE_KEY]: "2026-12-01",
    });
    results.push({
      scenario: "phase1_complete_with_date",
      pass: isCase05Phase1Complete(sim),
    });

  console.log(JSON.stringify({ pass: true, level: 3, results }, null, 2));
} catch (e) {
  console.log(JSON.stringify({ pass: false, level: 3, error: String(e), results }, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
