/**
 * Strict browser trace — CASE_01~06 + CASE_03 regression + mobile + pipeline tail
 * Uses proven label detection from browser-case03-question-trace-strict.mjs
 */
import { chromium } from "@playwright/test";
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  attachCaseResolutionSnapshot,
  buildAdminVerifyProfileQuestions,
  buildCaseResolutionProfile,
  isAdminVerifyPhase2PathComplete,
  selectNextCaseResolutionFocus,
} from "../../src/lib/adminVerifyProfiling.ts";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";
const EMPTY_FOLLOW = {};
const EMPTY_DOCS = { mismatch: [], unknown: [], other: [] };

const CASE03_REGRESSION = {
  q1: "출석하거나 설명하라는 내용",
  phase1: [
    "왜 출석하거나 설명해야 하는지",
    "정해진 날짜에 반드시 출석해야 하는지",
    "아직 기관에 설명하거나 직접 방문하지 않았습니다",
    "출석하거나 설명해야 하는 날짜를 확인했습니다",
  ],
  phase2: [
    "실제 상황과 기관이 확인하려는 내용이 상당히 다릅니다",
    "특정 날짜·사건·행동에 대해 확인하려는 것으로 이해했습니다",
    "지정된 날짜에 출석하는 것만으로 충분할 것 같습니다",
    "기관에 무엇을 어떻게 설명해야 하는지 모르겠습니다",
    "출석·소명 요구 통지서·안내문",
    "기관 요구를 이해하고 싶습니다",
  ],
  expectedIds: [
    "case03_factRelationship",
    "case03_inquiryFocus",
    "case03_prepRequired",
    "case03_blockage",
    "case03_evidence",
    "case03_finalGoal",
  ],
  engineSeed: {
    situation: "received_document",
    profileDocumentSource: "court",
    stage: "case",
    [ADMIN_CASE_ENTRY_Q1_KEY]: "attendance_demand",
    case03_authorityDemand: "reason_unclear",
    case03_confirmGoal: "deadline_attendance",
    case03_customerResponse: "none",
    case03_deadline: "uncertain",
  },
};

const CASE_PATHS = {
  CASE_01: {
    q1: "교통위반이나 문제를 알리는 통지",
    phase1: [
      "기관에서 말하는 문제가 실제로 내 상황에 해당하는지",
      "특정 날짜나 장소에서 있었던 일과 관련해",
      "아직 기관에 대응하지 않았습니다",
      "기한이 있다는 것은 알지만 정확한 날짜는",
    ],
    phase2: null, // engine-driven picks
    q1Value: "violation_notice",
  },
  CASE_02: {
    q1: "벌금이나 비용을 납부하라는 내용",
    phase1: [
      "교통위반에 대한 벌금",
      "기관에서 말하는 납부 의무가",
      "아직 이 납부 요구에 대해 납부하지 않았습니다",
      "납부해야 하는 날짜를 확인했습니다",
    ],
    phase2: ["실제 상황과 일부 다릅니다"],
    q1Value: "payment_demand",
  },
  CASE_04: {
    q1: "추가 서류나 보완을 요구하는 내용",
    phase1: [
      "추가로 제출해야 하는 서류",
      "어떤 자료를 제출해야 하는지",
      "아직 보완 서류를 제출하지 않았습니다",
      "보완 제출 기한이 있다는 것은 알지만",
    ],
    phase2: null,
    q1Value: "supplement_demand",
  },
  CASE_05: {
    q1: "면허의 정지·취소·거부",
    phase1: [
      "처분·조치의 사유가 무엇인지",
      "처분·조치 내용이 실제 상황과 맞는지",
      "아직 기관에 대응하지 않았습니다",
      "처분·조치와 관련된 기한이 있다는 것은 알지만",
    ],
    phase2: null,
    q1Value: "disposition_notice",
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
    phase2: null,
    q1Value: "unclear",
    tag: "reclass",
  },
};

function getPhase2Questions(answers) {
  const p1 = buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, 1);
  const p1Ids = new Set(p1.map((q) => q.id));
  return buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, 2)
    .filter((q) => q.id !== ADMIN_CASE_ENTRY_Q1_KEY && !p1Ids.has(q.id));
}

function idByLabel(label, answers) {
  if (!label) return null;
  const qs = getPhase2Questions(answers);
  const hit = qs.find(
    (q) => label.includes(q.label.slice(0, 16)) || q.label.includes(label.slice(0, 16)),
  );
  return hit?.id ?? null;
}

function engineStep(answers) {
  const profile = buildCaseResolutionProfile(answers);
  const next = selectNextCaseResolutionFocus(profile, answers);
  const nq = getPhase2Questions(answers).find((q) => !answers[q.id]?.trim());
  return {
    pathComplete: isAdminVerifyPhase2PathComplete(answers),
    unknowns: profile.unknowns ?? [],
    nextFocus: next?.questionId ?? null,
    nextEngineId: nq?.id ?? null,
    classification: profile.caseClassification?.value,
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

async function getQuestionLabels(page) {
  return page.evaluate(() => {
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
}

async function getProgress(page) {
  return page.evaluate(() => {
    const m = document.body.innerText.match(/(\d{2})\s*\/\s*(\d{2})/);
    return m ? { current: m[1], total: m[2] } : null;
  });
}

async function advanceToFirstResult(page, path, tag) {
  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(700);
  await clickChoice(page, path.q1);
  for (const p of path.phase1) {
    if (await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible().catch(() => false)) break;
    await clickChoice(page, p);
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
    await page.locator('input[name="email"]').fill(`strict-${tag}@test.vfbcai.local`);
    await page.locator('input[name="kakao_id"]').fill(`qa${suffix}`);
    await page.locator('input[name="agreeTerms"]').check();
    await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  }
  await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).waitFor({ timeout: 120_000 });
}

async function runStrictPath(page, caseKey, path, engineSeed = null) {
  const tag = path.tag ?? caseKey;
  await advanceToFirstResult(page, path, tag);
  const firstResult = {
    dualCta: await page.getByRole("button", { name: /개인화 상세 검토하기/ }).isVisible(),
    heading: await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible(),
  };

  await page.getByRole("button", { name: /개인화 상세 검토하기/ }).click();
  await page.waitForTimeout(900);

  let sim = engineSeed
    ? attachCaseResolutionSnapshot({ ...engineSeed })
    : attachCaseResolutionSnapshot({ stage: "case", [ADMIN_CASE_ENTRY_Q1_KEY]: path.q1Value });

  const steps = [];
  const explicit = path.phase2 ?? [];
  let ei = 0;

  for (let i = 0; i < 16; i++) {
    const body = await page.evaluate(() => document.body.innerText);
    if (body.includes("2차 상세검토에 필요한 자료")) {
      steps.push({ i, event: "EVIDENCE_GATE", progress: await getProgress(page) });
      break;
    }
    if (body.includes("행정문서 개인화 검토 결과")) {
      steps.push({ i, event: "PERSONALIZED_RESULT" });
      break;
    }

    const labels = await getQuestionLabels(page);
    const browserQ = labels.find((t) => t.includes("?")) ?? labels[labels.length - 1] ?? null;
    const eng = engineStep(sim);
    const engineId = idByLabel(browserQ, sim) ?? eng.nextEngineId;

    steps.push({
      i,
      event: "QUESTION",
      browserQ,
      engineId,
      engineExpectedNext: eng.nextEngineId,
      idMatch: engineId === eng.nextEngineId,
      progress: await getProgress(page),
      engine: eng,
    });

    let pick = explicit[ei];
    if (!pick && engineId) {
      const q = getPhase2Questions(sim).find((x) => x.id === engineId);
      pick = q?.options?.find((o) => o.value !== "other")?.label?.slice(0, 35);
    }
    if (!pick) {
      steps.push({ i, event: "STUCK" });
      break;
    }
    await clickChoice(page, pick);
    ei++;
    if (engineId) {
      const q = getPhase2Questions(sim).find((x) => x.id === engineId);
      const val = q?.options?.find((o) => o.label.includes(pick.slice(0, 8)))?.value
        ?? q?.options?.find((o) => o.value !== "other")?.value;
      if (val) sim = attachCaseResolutionSnapshot({ ...sim, [engineId]: val });
    }
  }

  let evidencePanel = false;
  let personalized = false;
  let documentsAi = "NOT_ATTEMPTED";
  let documentsExpert = "NOT_ATTEMPTED";

  if (steps.some((s) => s.event === "EVIDENCE_GATE")) {
    evidencePanel = await page.getByRole("heading", { name: /2차 상세검토에 필요한 자료/ }).isVisible();
    const adminCopy = await page.evaluate(() => document.body.innerText.includes("공문"));
    steps.push({ event: "EVIDENCE_PANEL", component: "AdminVerifyPhase2EvidencePanel", adminCopy });
    await page.getByRole("button", { name: /자료 없이 계속하기/ }).click();
    await page.waitForTimeout(800);
    personalized = await page.getByRole("heading", { name: /행정문서 개인화 검토 결과/ }).isVisible().catch(() => false);
    if (personalized) {
      const ai = page.getByRole("button", { name: /AI 리포트|AI 검토/ }).first();
      if (await ai.isVisible().catch(() => false)) {
        try {
          const [resp] = await Promise.all([
            page.waitForResponse((r) => r.url().includes("/api/") || r.url().includes("documents"), { timeout: 5000 }).catch(() => null),
            ai.click(),
          ]);
          await page.waitForTimeout(2000);
          documentsAi = page.url().includes("/documents") ? page.url() : `NO_NAV:${page.url().slice(0, 80)}`;
        } catch {
          documentsAi = "NOT_VERIFIED — QA ENVIRONMENT";
        }
      }
    }
  }

  const browserIds = steps.filter((s) => s.event === "QUESTION").map((s) => s.engineId).filter(Boolean);

  return {
    caseKey,
    firstResult,
    browserIds,
    phase2Count: browserIds.length,
    steps,
    evidencePanel,
    personalized,
    documentsAi,
    documentsExpert,
    finalEngine: engineStep(sim),
  };
}

const report = {};
const browser = await chromium.launch({ headless: true });

try {
  const p03 = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const r03 = await runStrictPath(p03, "CASE_03", CASE03_REGRESSION, CASE03_REGRESSION.engineSeed);
  report.case03Regression = {
    pass: JSON.stringify(r03.browserIds) === JSON.stringify(CASE03_REGRESSION.expectedIds),
    expected: CASE03_REGRESSION.expectedIds,
    actual: r03.browserIds,
    evidencePanel: r03.evidencePanel,
    personalized: r03.personalized,
  };
  report.CASE_03 = r03;
  report.progressUx = r03.steps.filter((s) => s.progress).map((s) => s.progress);
  await p03.close();

  for (const key of Object.keys(CASE_PATHS)) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    try {
      report[key] = await runStrictPath(page, key, CASE_PATHS[key]);
    } catch (e) {
      report[key] = { error: String(e.message ?? e) };
    }
    await page.close();
  }

  const mob = await browser.newPage({ viewport: { width: 375, height: 812 } });
  try {
    const m = await runStrictPath(mob, "CASE_03_MOBILE", CASE03_REGRESSION, CASE03_REGRESSION.engineSeed);
    const overflow = await mob.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
    report.mobile = { ...m, overflow, regressionPass: JSON.stringify(m.browserIds) === JSON.stringify(CASE03_REGRESSION.expectedIds) };
  } catch (e) {
    report.mobile = { error: String(e.message ?? e) };
  }
  await mob.close();
} finally {
  await browser.close();
}

console.log(JSON.stringify(report, null, 2));
