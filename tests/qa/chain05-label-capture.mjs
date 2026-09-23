/**
 * CASE_06_CHAIN_05_EXPERT — capture DOM + screenshot at step-2 label read (LEVEL 3).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  ADMIN_CASE_ENTRY_Q1_OPTIONS,
  attachCaseResolutionSnapshot,
  buildAdminVerifyProfileQuestions,
  getAdminChoiceNoteKey,
} from "../../src/lib/adminVerifyProfiling.ts";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";
const OUT = join(process.cwd(), "tests", "qa", "_chain05-capture");
const EMPTY_FOLLOW = {};
const EMPTY_DOCS = { mismatch: [], unknown: [], other: [] };

const CFG = {
  q1: "unclear",
  seed: { situation: "received_document", stage: "case" },
  phase1Overrides: {
    case06_requiredActionCandidate: "problem_action_unclear",
    case06_knowledgeSource: "path_unclear",
    case06_sourceChannel: "source_unknown",
    case06_deadlineActionPair: "action_unclear_timing",
    case06_customerResponse: "no_response_yet",
  },
  case06ChainOverrides: {
    case06_unclearContentRecheck: "other",
    case06_unclearContentRecheckNote: "QA direct input — still unclear after recheck",
    case06_unclearFactRelation: "insufficient_info",
    case06_unclearResponse: "no_action",
  },
};

function getPhase1IdSet(answers) {
  const p1 = buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, 1);
  return new Set(p1.map((q) => q.id));
}

function nextPendingQuestion(answers, phase) {
  const qs = buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, phase);
  const p1Ids = phase === 2 ? getPhase1IdSet(answers) : new Set();
  for (const q of qs) {
    if (q.id === ADMIN_CASE_ENTRY_Q1_KEY && answers[ADMIN_CASE_ENTRY_Q1_KEY]?.trim()) continue;
    if (phase === 2 && (q.id === ADMIN_CASE_ENTRY_Q1_KEY || p1Ids.has(q.id))) continue;
    if (!answers[q.id]?.trim()) return q;
  }
  return null;
}

function buildClickPlan(initialAnswers, phase, valueOverrides = {}) {
  let answers = attachCaseResolutionSnapshot(initialAnswers);
  const steps = [];
  for (let guard = 0; guard < 40; guard++) {
    const q = nextPendingQuestion(answers, phase);
    if (!q) break;
    const opt =
      valueOverrides[q.id]
        ? q.options.find((o) => o.value === valueOverrides[q.id]) ??
          q.options.find((o) => o.value !== "other") ??
          q.options[0]
        : q.options.find((o) => o.value !== "other") ?? q.options[0];
    const noteKey = getAdminChoiceNoteKey(q.id);
    const noteOverride = valueOverrides[noteKey];
    steps.push({
      id: q.id,
      label: q.label,
      optionValue: opt.value,
      optionLabel: opt.label,
      noteKey: opt.value === "other" && noteOverride ? noteKey : undefined,
      noteValue: opt.value === "other" && noteOverride ? noteOverride : undefined,
    });
    const patch = { [q.id]: opt.value };
    if (opt.value === "other" && noteOverride) patch[noteKey] = noteOverride;
    answers = attachCaseResolutionSnapshot({ ...answers, ...patch });
  }
  return { steps, answers };
}

async function domSnapshot(page) {
  return page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
    };
    const headings = [...document.querySelectorAll("h3, h4")]
      .filter(visible)
      .map((el) => ({
        tag: el.tagName,
        text: (el.textContent ?? "").trim().slice(0, 200),
        rect: el.getBoundingClientRect(),
      }));
    const collapsed = [...document.querySelectorAll("li button")]
      .filter(visible)
      .map((b) => (b.textContent ?? "").trim().slice(0, 120))
      .filter((t) => t.length > 8);
    const activeTextarea = [...document.querySelectorAll("textarea")].filter(visible).length;
    const stitchActive = document.querySelector('[class*="QuestionSection"]')?.textContent?.slice(0, 300) ?? null;
    return {
      url: location.href,
      headings,
      collapsedAnswerButtons: collapsed.slice(0, 12),
      textareaCount: activeTextarea,
      bodySnippet: document.body.innerText.slice(0, 1200),
    };
  });
}

async function getHarnessLabel(page) {
  const labels = await page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
    };
    return [...document.querySelectorAll("h3, h4")]
      .filter(visible)
      .map((el) => (el.textContent ?? "").trim())
      .filter(
        (t) =>
          t.length > 12 &&
          !t.includes("검토 내용 체크") &&
          !t.includes("행정문서 리뷰") &&
          !t.includes("간단한 자료") &&
          !/^2\.\s*추가 상황 확인$/.test(t),
      );
  });
  return labels.find((t) => t.includes("?")) ?? labels[labels.length - 1] ?? null;
}

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

let sim = attachCaseResolutionSnapshot({
  ...CFG.seed,
  [ADMIN_CASE_ENTRY_Q1_KEY]: CFG.q1,
});
const p1 = buildClickPlan(sim, 1, CFG.phase1Overrides);
sim = p1.answers;
const p2 = buildClickPlan(sim, 2, CFG.case06ChainOverrides);

const report = { steps: p2.steps.map((s) => ({ id: s.id, label: s.label.slice(0, 80) })), captures: [] };

await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForTimeout(600);

const q1Opt = ADMIN_CASE_ENTRY_Q1_OPTIONS.find((o) => o.value === CFG.q1);
await page.evaluate((needle) => {
  const b = [...document.querySelectorAll("button")].find((x) => x.textContent?.includes(needle));
  b?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
}, q1Opt.label.slice(0, 20));
await page.waitForTimeout(500);

for (const s of p1.steps.filter((x) => x.id !== ADMIN_CASE_ENTRY_Q1_KEY)) {
  await page.evaluate((needle) => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent?.includes(needle));
    b?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  }, s.optionLabel.slice(0, 28));
  await page.waitForTimeout(450);
}

// signup skip + first result CTA
const skip = page.getByRole("button", { name: /자료 없이 계속하기/ });
if (await skip.isVisible().catch(() => false)) await skip.click();
if (await page.locator('input[name="name"]').isVisible().catch(() => false)) {
  const suffix = String(Date.now()).slice(-8);
  await page.locator('input[name="name"]').fill(`QA chain05`);
  await page.locator('input[name="phone"]').fill(`090${suffix}`);
  await page.locator('input[name="address"]').fill("Quan 7");
  await page.locator('input[name="email"]').fill(`qa-c05-${suffix}@test.vfbcai.local`);
  await page.locator('input[name="kakao_id"]').fill(`qa${suffix}`);
  await page.locator('input[name="agreeTerms"]').check();
  await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).waitFor({ timeout: 120_000 });
}
await page.getByRole("button", { name: /개인화 상세 검토하기/ }).click();
await page.waitForTimeout(900);

const step1 = p2.steps[0];
const step2 = p2.steps[1];

// Step 1 — DI
report.captures.push({
  phase: "before_step1",
  harnessLabel: await getHarnessLabel(page),
  dom: await domSnapshot(page),
});
await page.screenshot({ path: join(OUT, "01-before-recheck.png"), fullPage: true });

const directBtn = page.getByRole("button", { name: /직접 설명하기/ });
if (await directBtn.isVisible().catch(() => false)) {
  await directBtn.click();
  await page.waitForTimeout(400);
}
const textarea = page.locator("textarea").first();
await textarea.fill(step1.noteValue);
await page.getByRole("button", { name: "다음" }).click();

for (const delayMs of [0, 400, 1200, 2500]) {
  if (delayMs) await page.waitForTimeout(delayMs);
  const tag = delayMs === 0 ? "immediately_after_di_next" : `after_di_next_plus_${delayMs}ms`;
  const harnessLabel = await getHarnessLabel(page);
  const dom = await domSnapshot(page);
  const shot = join(OUT, `02-${tag}.png`);
  await page.screenshot({ path: shot, fullPage: true });
  report.captures.push({
    phase: tag,
    harnessLabel,
    engineStep2Label: step2?.label ?? null,
    labelsMatchStep2: step2 ? harnessLabel?.includes(step2.label.slice(0, 14)) : null,
    dom,
    screenshot: shot,
  });
}

// Step 2 attempt — what harness sees when clicking factRelation
if (step2) {
  report.captures.push({
    phase: "step2_read_label",
    harnessLabel: await getHarnessLabel(page),
    engineId: step2.id,
    engineLabel: step2.label,
  });
  await page.screenshot({ path: join(OUT, "03-step2-label-read.png"), fullPage: true });
}

writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ outDir: OUT, captures: report.captures.length }, null, 2));

await browser.close();
