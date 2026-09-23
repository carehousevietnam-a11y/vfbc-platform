/**
 * Admin VERIFY — strict full trace (CASE_01~06 + CASE_03 regression + mobile)
 * No blind clickFirstStitch in Phase2 — engine label match + explicit option click
 */
import { chromium } from "@playwright/test";
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  attachCaseResolutionSnapshot,
  buildAdminVerifyProfileQuestions,
  buildCaseResolutionProfile,
  getQ1ResolvedCase,
  isAdminVerifyPhase2PathComplete,
  selectNextCaseResolutionFocus,
} from "../../src/lib/adminVerifyProfiling.ts";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";
const EMPTY_FOLLOW = {};
const EMPTY_DOCS = { mismatch: [], unknown: [], other: [] };

const CASE03_REGRESSION_CHAIN = [
  "case03_factRelationship",
  "case03_inquiryFocus",
  "case03_prepRequired",
  "case03_blockage",
  "case03_evidence",
  "case03_finalGoal",
];

const CASE_SPECS = {
  CASE_01: {
    q1: "교통위반이나 문제를 알리는 통지",
    phase1: [
      "기관에서 말하는 문제가 실제로 내 상황에 해당하는지",
      "특정 날짜나 장소에서 있었던 일과 관련해",
      "아직 기관에 대응하지 않았습니다",
      "기한이 있다는 것은 알지만 정확한 날짜는",
    ],
  },
  CASE_02: {
    q1: "벌금이나 비용을 납부하라는 내용",
    phase1: [
      "교통위반에 대한 벌금",
      "기관에서 말하는 납부 의무가",
      "아직 이 납부 요구에 대해 납부하지 않았습니다",
      "납부해야 하는 날짜를 확인했습니다",
    ],
  },
  CASE_03: {
    q1: "출석하거나 설명하라는 내용",
    phase1: [
      "왜 출석하거나 설명해야 하는지",
      "정해진 날짜에 반드시 출석해야 하는지",
      "아직 기관에 설명하거나 직접 방문하지 않았습니다",
      "출석하거나 설명해야 하는 날짜를 확인했습니다",
    ],
    phase2Explicit: [
      "실제 상황과 기관이 확인하려는 내용이 상당히 다릅니다",
      "특정 날짜·사건·행동에 대해 확인하려는 것으로 이해했습니다",
      "지정된 날짜에 출석하는 것만으로 충분할 것 같습니다",
      "기관에 무엇을 어떻게 설명해야 하는지 모르겠습니다",
      "출석·소명 요구 통지서·안내문",
      "기관 요구를 이해하고 싶습니다",
    ],
  },
  CASE_04: {
    q1: "추가 서류나 보완을 요구하는 내용",
    phase1: [
      "어떤 서류를 보완",
      "어떤 자료를 제출해야 하는지",
      "아직 보완 서류를 제출하지 않았습니다",
      "보완 제출 기한이 있다는 것은 알지만",
    ],
  },
  CASE_05: {
    q1: "면허의 정지·취소·거부",
    phase1: [
      "처분·조치의 사유가 무엇인지",
      "처분·조치 내용이 실제 상황과 맞는지",
      "아직 기관에 대응하지 않았습니다",
      "처분·조치와 관련된 기한이 있다는 것은 알지만",
    ],
  },
  CASE_06: {
    q1: "무슨 내용인지 잘 모르겠습니다",
    phase1: [
      "특정 기관",
      "돈을 납부하라는 내용으로 보입니다",
      "돈을 납부하거나 비용을 처리해야 하는 것으로 보입니다",
      "기한이 있다는 것은 알지만",
      "무엇을 해야 하는지",
    ],
    tag: "case06_reclass",
  },
};

function getPhase1Ids(answers) {
  const p1 = buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, 1);
  return new Set(p1.map((q) => q.id));
}

function getPhase2Questions(answers) {
  const p1Ids = getPhase1Ids(answers);
  return buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, 2)
    .filter((q) => q.id !== ADMIN_CASE_ENTRY_Q1_KEY && !p1Ids.has(q.id));
}

function getNextEngineQuestion(answers) {
  const qs = getPhase2Questions(answers);
  return qs.find((q) => !answers[q.id]?.trim()) ?? null;
}

function pickOptionLabel(question) {
  const opt = question.options?.find((o) => o.value !== "other");
  return opt?.label ?? null;
}

function labelToId(label) {
  if (!label) return null;
  const norm = label.replace(/\s+/g, " ").trim();
  for (const caseId of Object.keys(CASE_SPECS)) {
    const allQs = [
      ...buildAdminVerifyProfileQuestions(
        { [ADMIN_CASE_ENTRY_Q1_KEY]: "attendance_demand", stage: "case" },
        EMPTY_FOLLOW,
        EMPTY_DOCS,
        1,
      ),
      ...buildAdminVerifyProfileQuestions(
        { [ADMIN_CASE_ENTRY_Q1_KEY]: "attendance_demand", stage: "case" },
        EMPTY_FOLLOW,
        EMPTY_DOCS,
        2,
      ),
    ];
    for (const q of allQs) {
      if (q.label === norm || norm.includes(q.label.slice(0, 12)) || q.label.includes(norm.slice(0, 12))) {
        return q.id;
      }
    }
  }
  return null;
}

function engineDigest(answers) {
  const profile = buildCaseResolutionProfile(answers);
  const next = selectNextCaseResolutionFocus(profile, answers);
  return {
    classification: profile.caseClassification?.value,
    unknowns: profile.unknowns ?? [],
    nextFocus: next ? { questionId: next.questionId, focus: next.focus } : null,
    pathComplete: isAdminVerifyPhase2PathComplete(answers),
    phase2Ids: getPhase2Questions(answers).map((q) => q.id),
  };
}

async function clickChoice(page, text) {
  await page.waitForFunction(
    (needle) => {
      const b = [...document.querySelectorAll("button")].find((x) => x.textContent?.includes(needle));
      if (!b) return false;
      b.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      return true;
    },
    text,
    { timeout: 30_000 },
  );
  await page.waitForTimeout(500);
}

async function getActiveQuestionLabel(page) {
  return page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
    };
    const h = [...document.querySelectorAll("h3")].filter(visible).find((x) => {
      const t = (x.textContent ?? "").trim();
      return t && !t.includes("검토 내용 체크") && !t.includes("행정문서 리뷰") && t.length > 10;
    });
    return h?.textContent?.trim() ?? null;
  });
}

async function getProgress(page) {
  return page.evaluate(() => {
    const m = document.body.innerText.match(/(\d{2})\s*\/\s*(\d{2})/);
    return m ? { current: m[1], total: m[2] } : null;
  });
}

async function bodyHas(page, ...snips) {
  const body = await page.evaluate(() => document.body.innerText);
  return snips.every((s) => body.includes(s));
}

async function advanceToFirstResult(page, spec, tag) {
  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(700);
  await clickChoice(page, spec.q1);
  for (const step of spec.phase1) {
    if (await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible().catch(() => false)) break;
    await clickChoice(page, step);
  }
  for (let i = 0; i < 10; i++) {
    if (await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible().catch(() => false)) break;
    if (await page.locator('input[name="name"]').isVisible().catch(() => false)) break;
    if (await bodyHas(page, "간단한 자료가 있으면")) break;
    const h = await getActiveQuestionLabel(page);
    if (!h) break;
    const btn = await page.evaluate(() => {
      const visible = (el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
      };
      const b = [...document.querySelectorAll("button")].find((x) => {
        if (!visible(x)) return false;
        const t = (x.textContent ?? "").trim();
        return /^\d{2}/.test(t) && !t.includes("직접 설명하기");
      });
      if (!b) return null;
      return (b.textContent ?? "").slice(0, 40);
    });
    if (!btn) break;
    await clickChoice(page, btn.replace(/^\d{2}\s*/, "").trim().slice(0, 20));
  }
  const skip = page.getByRole("button", { name: /자료 없이 계속하기/ });
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
    await page.waitForTimeout(600);
  }
  if (await page.locator('input[name="name"]').isVisible().catch(() => false)) {
    const suffix = String(Date.now()).slice(-8);
    await page.locator('input[name="name"]').fill(`Strict ${tag}`);
    await page.locator('input[name="phone"]').fill(`090${suffix}`);
    await page.locator('input[name="address"]').fill("Quan 7");
    await page.locator('input[name="email"]').fill(`strict-${tag}-${Date.now()}@test.vfbcai.local`);
    await page.locator('input[name="kakao_id"]').fill(`qa${suffix}`);
    await page.locator('input[name="agreeTerms"]').check();
    await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  }
  await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).waitFor({ timeout: 120_000 });
}

async function runCaseTrace(page, caseKey, spec, options = {}) {
  const tag = spec.tag ?? caseKey;
  await advanceToFirstResult(page, spec, tag);

  const firstResultChecks = {
    dualCta: await bodyHas(page, "개인화 상세 검토하기", "AI 정보 보기"),
    heading: await bodyHas(page, "행정문서 1차 종합 결과"),
  };

  await page.getByRole("button", { name: /개인화 상세 검토하기/ }).click();
  await page.waitForTimeout(900);

  const phase2Steps = [];
  let simulatedAnswers = attachCaseResolutionSnapshot({
    situation: "received_document",
    stage: "case",
    [ADMIN_CASE_ENTRY_Q1_KEY]: spec.q1.includes("출석") ? "attendance_demand" : spec.q1.includes("벌금") ? "payment_demand" : spec.q1.includes("보완") ? "supplement_demand" : spec.q1.includes("면허") ? "disposition_notice" : spec.q1.includes("교통") ? "violation_notice" : "unclear",
  });

  const explicitPicks = spec.phase2Explicit ?? [];
  let explicitIdx = 0;

  for (let step = 0; step < 20; step++) {
    const body = await page.evaluate(() => document.body.innerText);
    if (body.includes("행정문서 개인화 검토 결과") || body.includes("2차 개인화")) {
      phase2Steps.push({ step, event: "PERSONALIZED_RESULT" });
      break;
    }
    if (body.includes("2차 상세검토에 필요한 자료")) {
      phase2Steps.push({
        step,
        event: "EVIDENCE_GATE",
        progress: await getProgress(page),
        component: "AdminVerifyPhase2EvidencePanel",
        adminCopy: body.includes("공문") || body.includes("통지서"),
      });
      break;
    }

    const browserLabel = await getActiveQuestionLabel(page);
    const progress = await getProgress(page);
    const engineNext = getNextEngineQuestion(simulatedAnswers);
    const engineId = engineNext?.id ?? null;
    const labelMatch =
      browserLabel &&
      engineNext?.label &&
      (browserLabel.includes(engineNext.label.slice(0, 14)) || engineNext.label.includes(browserLabel.slice(0, 14)));

    phase2Steps.push({
      step,
      event: "QUESTION",
      browserLabel,
      engineId,
      engineLabel: engineNext?.label ?? null,
      labelMatch,
      progress,
      engineDigest: engineDigest(simulatedAnswers),
    });

    let pick = explicitPicks[explicitIdx];
    if (!pick && engineNext) {
      pick = pickOptionLabel(engineNext);
      if (pick) pick = pick.slice(0, 30);
    }
    if (!pick) {
      phase2Steps.push({ step, event: "STUCK_NO_PICK" });
      break;
    }

    await clickChoice(page, pick);
    explicitIdx += 1;
    if (engineId) {
      const val = engineNext.options?.find((o) => o.label.includes(pick.slice(0, 8)))?.value
        ?? engineNext.options?.find((o) => o.value !== "other")?.value;
      if (val) simulatedAnswers = attachCaseResolutionSnapshot({ ...simulatedAnswers, [engineId]: val });
    }
  }

  let evidenceContinue = false;
  let personalizedResult = false;
  let aiReportNav = null;
  let expertNav = null;

  if (phase2Steps.some((s) => s.event === "EVIDENCE_GATE")) {
    const cont = page.getByRole("button", { name: /자료 없이 계속하기/ });
    if (await cont.isVisible().catch(() => false)) {
      await cont.click();
      await page.waitForTimeout(800);
      evidenceContinue = true;
    }
    personalizedResult = await bodyHas(page, "행정문서 개인화 검토 결과");
    if (personalizedResult) {
      const aiBtn = page.getByRole("button", { name: /AI 리포트|AI 검토|AI 정보/ }).first();
      const expertBtn = page.getByRole("button", { name: /전문가/ }).first();
      if (await aiBtn.isVisible().catch(() => false)) {
        try {
          await Promise.all([
            page.waitForURL(/\/documents/, { timeout: 8000 }),
            aiBtn.click(),
          ]);
          aiReportNav = page.url();
        } catch {
          aiReportNav = "NOT_NAVIGATED";
        }
      }
      if (await expertBtn.isVisible().catch(() => false)) {
        try {
          await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle" }).catch(() => {});
          await advanceToFirstResult(page, spec, `${tag}-expert-retry`).catch(() => {});
          aiReportNav = aiReportNav ?? "SKIPPED_FOR_EXPERT";
        } catch {
          expertNav = "NOT_VERIFIED_RETRY";
        }
      }
    }
  }

  const browserIds = phase2Steps
    .filter((s) => s.event === "QUESTION")
    .map((s) => s.engineId)
    .filter(Boolean);

  return {
    caseKey,
    firstResultChecks,
    phase2QuestionCount: browserIds.length,
    phase2BrowserIds: browserIds,
    allLabelMatch: phase2Steps.filter((s) => s.event === "QUESTION").every((s) => s.labelMatch !== false),
    phase2Steps,
    evidenceContinue,
    personalizedResult,
    aiReportNav,
    expertNav,
    finalPathComplete: engineDigest(simulatedAnswers).pathComplete,
  };
}

const report = {
  case03Regression: null,
  cases: {},
  mobile: null,
  progressUx: null,
};

const browser = await chromium.launch({ headless: true });

try {
  // 1. CASE_03 regression
  const p03 = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const r03 = await runCaseTrace(p03, "CASE_03", CASE_SPECS.CASE_03);
  const regressionMatch =
    JSON.stringify(r03.phase2BrowserIds) === JSON.stringify(CASE03_REGRESSION_CHAIN);
  report.case03Regression = {
    pass: regressionMatch && r03.personalizedResult,
    expected: CASE03_REGRESSION_CHAIN,
    actual: r03.phase2BrowserIds,
    personalizedResult: r03.personalizedResult,
    steps: r03.phase2Steps,
  };
  report.cases.CASE_03 = r03;
  report.progressUx = r03.phase2Steps
    .filter((s) => s.progress)
    .map((s) => ({ step: s.step, progress: s.progress }));
  await p03.close();

  // 2. Other cases
  for (const key of ["CASE_01", "CASE_02", "CASE_04", "CASE_05", "CASE_06"]) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    try {
      report.cases[key] = await runCaseTrace(page, key, CASE_SPECS[key]);
    } catch (e) {
      report.cases[key] = { error: String(e.message ?? e) };
    }
    await page.close();
  }

  // 3. Mobile CASE_03
  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 } });
  try {
    const m03 = await runCaseTrace(mobile, "CASE_03_MOBILE", CASE_SPECS.CASE_03);
    const overflow = await mobile.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth + 2;
    });
    report.mobile = {
      ...m03,
      horizontalOverflow: overflow,
      regressionMatch: JSON.stringify(m03.phase2BrowserIds) === JSON.stringify(CASE03_REGRESSION_CHAIN),
    };
  } catch (e) {
    report.mobile = { error: String(e.message ?? e) };
  }
  await mobile.close();
} finally {
  await browser.close();
}

console.log(JSON.stringify(report, null, 2));
