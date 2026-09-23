/**
 * Spot Visual QA — Phase2 question UI at Desktop 1280 + Mobile 375
 * Checks overflow, direct-input affordance, long choice visibility
 */
import { chromium } from "@playwright/test";
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  ADMIN_CASE_ENTRY_Q1_OPTIONS,
  ADMIN_DIRECT_EXPLAIN_LABEL,
  attachCaseResolutionSnapshot,
  buildAdminVerifyProfileQuestions,
} from "../../src/lib/adminVerifyProfiling.ts";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";
const EMPTY_FOLLOW = {};
const EMPTY_DOCS = { mismatch: [], unknown: [], other: [] };

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

function nextPending(answers, phase) {
  const p1 = new Set(
    buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, 1).map((q) => q.id),
  );
  for (const q of buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, phase)) {
    if (q.id === ADMIN_CASE_ENTRY_Q1_KEY && answers[q.id]) continue;
    if (phase === 2 && p1.has(q.id)) continue;
    if (!answers[q.id]?.trim()) return q;
  }
  return null;
}

async function advanceToPhase2Question(page, seed, q1, phase1, phase2Id) {
  const q1Opt = ADMIN_CASE_ENTRY_Q1_OPTIONS.find((o) => o.value === q1);
  let sim = attachCaseResolutionSnapshot({ ...seed, [ADMIN_CASE_ENTRY_Q1_KEY]: q1 });
  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(600);
  await clickChoice(page, q1Opt.label.slice(0, 20));
  sim = attachCaseResolutionSnapshot({ ...sim, [ADMIN_CASE_ENTRY_Q1_KEY]: q1 });
  while (true) {
    const q = nextPending(sim, 1);
    if (!q) break;
    const v = phase1[q.id];
    if (!v) break;
    const opt = q.options.find((o) => o.value === v);
    await clickChoice(page, opt.label.slice(0, 28));
    sim = attachCaseResolutionSnapshot({ ...sim, [q.id]: v });
  }
  const skip = page.getByRole("button", { name: /자료 없이 계속하기/ });
  if (await skip.isVisible().catch(() => false)) await skip.click();
  if (await page.locator('input[name="name"]').isVisible().catch(() => false)) {
    const s = String(Date.now()).slice(-8);
    await page.locator('input[name="name"]').fill("QA Visual");
    await page.locator('input[name="phone"]').fill(`090${s}`);
    await page.locator('input[name="address"]').fill("Quan 7");
    await page.locator('input[name="email"]').fill(`qa-vis-${s}@test.vfbcai.local`);
    await page.locator('input[name="kakao_id"]').fill(`qv${s}`);
    await page.locator('input[name="agreeTerms"]').check();
    await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
    await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).waitFor({ timeout: 120_000 });
  }
  await page.getByRole("button", { name: /개인화 상세 검토하기/ }).click();
  await page.waitForTimeout(900);
  while (true) {
    const q = nextPending(sim, 2);
    if (!q || q.id === phase2Id) break;
    const opt = q.options.find((o) => o.value !== "other") ?? q.options[0];
    await clickChoice(page, opt.label.slice(0, 28));
    sim = attachCaseResolutionSnapshot({ ...sim, [q.id]: opt.value });
  }
  return sim;
}

async function inspectViewport(page, label) {
  return page.evaluate((lbl) => {
    const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2;
    const h3 = [...document.querySelectorAll("h3")].find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && (el.textContent ?? "").includes("?");
    });
    const cards = [...document.querySelectorAll("button,p")].filter((el) => {
      const r = el.getBoundingClientRect();
      const t = (el.textContent ?? "").trim();
      return r.width > 0 && t.length > 20 && r.width < 400;
    });
    const clipped = cards.filter((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return (
        s.overflow === "hidden" &&
        s.textOverflow === "ellipsis" &&
        el.scrollWidth > el.clientWidth + 2
      );
    });
    const directBtn = [...document.querySelectorAll("button")].some((b) =>
      (b.textContent ?? "").includes("직접 입력"),
    );
    const progress = (document.body.innerText.match(/\b\d{2}\s*\/\s*\d{2}\b/g) ?? []).slice(0, 2);
    return {
      label: lbl,
      overflow,
      questionVisible: Boolean(h3),
      questionText: h3 ? (h3.textContent ?? "").trim().slice(0, 80) : null,
      choiceCount: cards.length,
      clippedChoices: clipped.length,
      directInputButton: directBtn,
      progress,
    };
  }, label);
}

const CASE02 = {
  seed: { situation: "received_document", stage: "case", profileDocumentSource: "traffic" },
  q1: "payment_demand",
  phase1: {
    case02_paymentSubject: "traffic_fine",
    case02_confirmGoal: "verify_obligation",
    case02_paymentStatus: "not_paid",
    case02_deadline: "uncertain",
  },
  phase2Id: "case02_situationMatch",
};

const browser = await chromium.launch({ headless: true });
const out = { desktop_1280: null, mobile_375: null, mobile_directInput: null };

try {
  for (const [vpName, vp] of [
    ["desktop_1280", { width: 1280, height: 900 }],
    ["mobile_375", { width: 375, height: 812 }],
  ]) {
    const page = await browser.newPage({ viewport: vp });
    await advanceToPhase2Question(page, CASE02.seed, CASE02.q1, CASE02.phase1, CASE02.phase2Id);
    out[vpName] = await inspectViewport(page, vpName);
    await page.close();
  }

  const mPage = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await advanceToPhase2Question(mPage, CASE02.seed, CASE02.q1, CASE02.phase1, CASE02.phase2Id);
  await mPage.getByRole("button", { name: ADMIN_DIRECT_EXPLAIN_LABEL }).click();
  await mPage.waitForTimeout(400);
  out.mobile_directInput = {
    textarea: await mPage.locator("textarea").first().isVisible().catch(() => false),
    nextButton: await mPage.getByRole("button", { name: "다음" }).isVisible().catch(() => false),
    overflow: await mPage.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    ),
  };
  await mPage.close();
} finally {
  await browser.close();
}

console.log(JSON.stringify(out, null, 2));

const pass =
  out.desktop_1280?.overflow === false &&
  out.mobile_375?.overflow === false &&
  out.desktop_1280?.questionVisible &&
  out.mobile_375?.questionVisible &&
  out.mobile_directInput?.textarea &&
  out.mobile_directInput?.nextButton;
process.exit(pass ? 0 : 1);
