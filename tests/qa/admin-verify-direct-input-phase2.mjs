/**
 * Admin VERIFY Phase2 — Direct Input (other + note) browser QA
 * CASE_02~06: 직접 입력 UI → note 저장 → 다음 진행
 */
import { chromium } from "@playwright/test";
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  ADMIN_CASE_ENTRY_Q1_OPTIONS,
  ADMIN_DIRECT_EXPLAIN_LABEL,
  attachCaseResolutionSnapshot,
  buildAdminVerifyProfileQuestions,
  getAdminChoiceNoteKey,
  isAdminVerifyChoiceFieldComplete,
} from "../../src/lib/adminVerifyProfiling.ts";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";
const EMPTY_FOLLOW = {};
const EMPTY_DOCS = { mismatch: [], unknown: [], other: [] };
const DIRECT_NOTE =
  "교통국에서 받은 안내와 제가 알고 있는 실제 상황이 다릅니다. 직접 설명이 필요합니다.";

const SCENARIOS = [
  {
    caseKey: "CASE_02",
    q1: "payment_demand",
    seed: { situation: "received_document", stage: "case", profileDocumentSource: "traffic" },
    phase1: {
      case02_paymentSubject: "traffic_fine",
      case02_confirmGoal: "verify_obligation",
      case02_paymentStatus: "not_paid",
      case02_deadline: "uncertain",
    },
    phase2BeforeDirect: {
      case02_demandAuthority: "traffic",
    },
    directQuestionId: "case02_situationMatch",
  },
  {
    caseKey: "CASE_03",
    q1: "attendance_demand",
    seed: { situation: "received_document", stage: "case" },
    phase1: {
      case03_authorityDemand: "reason_unclear",
      case03_confirmGoal: "deadline_attendance",
      case03_customerResponse: "none",
      case03_deadline: "uncertain",
    },
    phase2BeforeDirect: {},
    directQuestionId: "case03_factRelationship",
  },
  {
    caseKey: "CASE_04",
    q1: "supplement_demand",
    seed: { situation: "received_document", stage: "case", profileDocumentSource: "immigration" },
    phase1: {
      case04_supplementTarget: "additional_docs",
      case04_confirmGoal: "understand_materials",
      case04_customerResponse: "not_started",
      case04_deadline: "uncertain",
    },
    phase2BeforeDirect: {
      case04_initialSubmission: "complete",
    },
    directQuestionId: "case04_submissionRelation",
  },
  {
    caseKey: "CASE_05",
    q1: "disposition_notice",
    seed: { situation: "received_document", stage: "case", profileDocumentSource: "immigration" },
    phase1: {
      case05_dispositionType: "rights_ended",
      case05_confirmGoal: "understand_reason",
      case05_customerResponse: "none",
      case05_deadline: "uncertain",
    },
    phase2BeforeDirect: {},
    directQuestionId: "case05_factRelationship",
  },
  {
    caseKey: "CASE_06",
    q1: "unclear",
    seed: { situation: "received_document", stage: "case" },
    phase1: {
      case06_documentNature: "hard_to_classify",
      profilePerceivedIssue: "overall_unclear",
      profileDocumentSource: "unknown_agency",
      profileCurrentGoal: "hard_to_tell",
      profileAuthorityGuidance: "not_stated",
    },
    phase2BeforeDirect: {
      case06_exactSource: "cannot_tell",
    },
    directQuestionId: "case06_keyPhrase",
  },
];

function getPhase1IdSet(answers) {
  return new Set(
    buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, 1).map((q) => q.id),
  );
}

function nextPendingQuestion(answers, phase) {
  const qs = buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, phase);
  const p1Ids = phase === 2 ? getPhase1IdSet(answers) : new Set();
  for (const q of qs) {
    if (q.id === ADMIN_CASE_ENTRY_Q1_KEY && answers[ADMIN_CASE_ENTRY_Q1_KEY]) continue;
    if (phase === 2 && p1Ids.has(q.id)) continue;
    const noteKey = getAdminChoiceNoteKey(q.id);
    const val = answers[q.id]?.trim() ?? "";
    if (!val) return q;
    if (val === "other" && q.options) {
      if (!isAdminVerifyChoiceFieldComplete(q.id, answers, q.options)) return q;
    }
  }
  return null;
}

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

async function skipEvidenceAndSignup(page, tag) {
  const skip = page.getByRole("button", { name: /자료 없이 계속하기/ });
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
    await page.waitForTimeout(600);
  }
  if (await page.locator('input[name="name"]').isVisible().catch(() => false)) {
    const suffix = String(Date.now()).slice(-8);
    await page.locator('input[name="name"]').fill(`QA DI ${tag}`);
    await page.locator('input[name="phone"]').fill(`090${suffix}`);
    await page.locator('input[name="address"]').fill("Quan 7");
    await page.locator('input[name="email"]').fill(`qa-di-${tag}-${suffix}@test.vfbcai.local`);
    await page.locator('input[name="kakao_id"]').fill(`qa${suffix}`);
    await page.locator('input[name="agreeTerms"]').check();
    await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
    await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).waitFor({ timeout: 120_000 });
  }
}

async function getActiveQuestionLabel(page) {
  return page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
    };
    const labels = [...document.querySelectorAll("h3, h4")]
      .filter(visible)
      .map((el) => (el.textContent ?? "").trim())
      .filter((t) => t.includes("?"));
    return labels[labels.length - 1] ?? null;
  });
}

async function runDirectInputScenario(page, scenario) {
  const q1Opt = ADMIN_CASE_ENTRY_Q1_OPTIONS.find((o) => o.value === scenario.q1);
  let sim = attachCaseResolutionSnapshot({
    ...scenario.seed,
    [ADMIN_CASE_ENTRY_Q1_KEY]: scenario.q1,
  });

  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(700);
  await clickChoice(page, q1Opt.label.slice(0, 20));
  sim = attachCaseResolutionSnapshot({ ...sim, [ADMIN_CASE_ENTRY_Q1_KEY]: scenario.q1 });

  while (true) {
    const q = nextPendingQuestion(sim, 1);
    if (!q) break;
    const value = scenario.phase1[q.id];
    if (!value) {
      return { pass: false, step: "phase1_missing_override", expected: q.id };
    }
    const opt = q.options.find((o) => o.value === value);
    if (!opt) {
      return { pass: false, step: "phase1_option_missing", questionId: q.id, value };
    }
    await clickChoice(page, opt.label.slice(0, 28));
    sim = attachCaseResolutionSnapshot({ ...sim, [q.id]: value });
  }

  await skipEvidenceAndSignup(page, scenario.caseKey);
  await page.getByRole("button", { name: /개인화 상세 검토하기/ }).click();
  await page.waitForTimeout(900);

  for (const [id, value] of Object.entries(scenario.phase2BeforeDirect)) {
    const q = nextPendingQuestion(sim, 2);
    if (!q || q.id !== id) {
      return {
        pass: false,
        step: "phase2_pre_mismatch",
        expected: id,
        got: q?.id ?? null,
      };
    }
    const opt = q.options.find((o) => o.value === value);
    if (!opt) {
      return { pass: false, step: "phase2_option_missing", questionId: id, value };
    }
    await clickChoice(page, opt.label.slice(0, 28));
    sim = attachCaseResolutionSnapshot({ ...sim, [id]: value });
  }

  const targetQ = nextPendingQuestion(sim, 2);
  if (!targetQ || targetQ.id !== scenario.directQuestionId) {
    return {
      pass: false,
      step: "direct_question_mismatch",
      expected: scenario.directQuestionId,
      got: targetQ?.id ?? null,
    };
  }

  const browserLabelBefore = await getActiveQuestionLabel(page);
  const directBtn = page.getByRole("button", { name: ADMIN_DIRECT_EXPLAIN_LABEL });
  const directUiVisible = await directBtn.isVisible().catch(() => false);
  if (!directUiVisible) {
    return { pass: false, step: "direct_button_missing", questionId: scenario.directQuestionId };
  }

  await directBtn.click();
  await page.waitForTimeout(400);
  const textareaVisible = await page.locator("textarea").first().isVisible().catch(() => false);
  if (!textareaVisible) {
    return { pass: false, step: "textarea_missing" };
  }

  await page.locator("textarea").first().fill(DIRECT_NOTE);
  await page.getByRole("button", { name: "다음" }).click();
  await page.waitForTimeout(800);

  const noteKey = getAdminChoiceNoteKey(scenario.directQuestionId);
  sim = attachCaseResolutionSnapshot({
    ...sim,
    [scenario.directQuestionId]: "other",
    [noteKey]: DIRECT_NOTE,
  });

  const fieldComplete = isAdminVerifyChoiceFieldComplete(
    scenario.directQuestionId,
    sim,
    targetQ.options,
  );
  const nextQ = nextPendingQuestion(sim, 2);
  const browserLabelAfter = await getActiveQuestionLabel(page);
  const advanced =
    browserLabelAfter !== browserLabelBefore &&
    browserLabelAfter !== null &&
    !browserLabelAfter.includes(DIRECT_NOTE.slice(0, 12));

  return {
    pass: fieldComplete && advanced && Boolean(nextQ),
    caseKey: scenario.caseKey,
    questionId: scenario.directQuestionId,
    noteKey,
    noteSaved: sim[noteKey] === DIRECT_NOTE,
    valueIsOther: sim[scenario.directQuestionId] === "other",
    fieldComplete,
    advanced,
    browserLabelBefore,
    browserLabelAfter,
    nextEngineQuestion: nextQ?.id ?? null,
  };
}

const viewports = [
  { name: "desktop_1280", width: 1280, height: 900 },
  { name: "mobile_375", width: 375, height: 812 },
];

const browser = await chromium.launch({ headless: true });
const results = { directInput: {}, visual: {} };

try {
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    const scenario = SCENARIOS[0];
    await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle", timeout: 60_000 });
    await page.waitForTimeout(500);
    results.visual[vp.name] = {
      loaded: page.url().includes("/verify/admin"),
      viewport: vp,
      hasOverflow: await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      ),
    };
    await page.close();
  }

  for (const scenario of SCENARIOS) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    results.directInput[scenario.caseKey] = await runDirectInputScenario(page, scenario);
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify(results, null, 2));

const allPass = Object.values(results.directInput).every((r) => r.pass);
process.exit(allPass ? 0 : 1);
