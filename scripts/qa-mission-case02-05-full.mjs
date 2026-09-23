import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = "http://localhost:3010/verify/admin";
const OUT_DIR = path.join(process.cwd(), "scripts", ".qa-mission-screenshots");
fs.mkdirSync(OUT_DIR, { recursive: true });

const LEGACY = [
  "01/04",
  "02/04",
  "03/04",
  "04/04",
  "어떤 검토가 필요하신가요?",
  "어떤 서류를 검토하시나요?",
  "검토가 필요한 내용을 간단히 알려주세요.",
];

const CASES = {
  CASE_01: {
    q1: /교통위반이나 문제를 알리는 통지/,
    firstQ: /지금 본인에게 가장 가까운 상황/,
    phase1: [
      /내가 실제로 한 행동이나 상황/,
      /가장 먼저 확인하고 싶은 부분/,
      /아직 아무에게도 설명하거나/,
      /대응해야 하는 날짜를 확인했습니다/,
    ],
    phase2: [/실제 상황과 기관에서 문제라고 보는 내용/, /그 이후 어떤 일이 있었나요/],
    marker: "행동이나 상황",
    regressionOnly: true,
  },
  CASE_02: {
    q1: /벌금이나 비용을 납부하라는 내용/,
    firstQ: /가장 가까운 상황은 어떤 경우인가요/,
    phase1: [
      /벌금·과태료를 내라고 안내받은 것 같습니다/,
      /가장 먼저 확인하고 싶은 부분/,
      /아직 이 납부 요구에 대해 납부하지 않았습니다/,
      /납부해야 하는 날짜를 확인했습니다/,
    ],
    phase2: "auto",
    marker: "납부",
  },
  CASE_03: {
    q1: /출석하거나 설명하라는 내용/,
    firstQ: /기관에서 직접 방문하거나 상황을 설명해 달라는 안내/,
    phase1: "auto",
    phase2: "auto",
    marker: "출석",
  },
  CASE_04: {
    q1: /추가 서류나 보완을 요구하는 내용/,
    firstQ: /서류를 추가로 제출하거나 다시 보완하라는 안내/,
    phase1: "auto",
    phase2: "auto",
    marker: "보완",
  },
  CASE_05: {
    q1: /면허의 정지·취소·거부 등 조치/,
    firstQ: /기관에서 이 통지를 받은 뒤/,
    phase1: "auto",
    phase2: "auto",
    marker: "처분",
  },
  CASE_06: {
    q1: /무슨 내용인지 잘 모르겠습니다/,
    firstQ: /이 문서·통지는 어디/,
    phase1: [
      /정부기관이나 공공기관|경찰·교통·출입국|어떤 종류의 안내/,
      /무엇을 해야 하는지 알기 어렵습니다|돈을 납부하거나 비용을 처리/,
      /기한이 있는지 자체를 모르겠습니다|대응 기한이 있다는 것은 알지만/,
      /전체적으로 문서의 의미를 이해하기 어렵습니다|무엇을 해야 하는지 이해하기 어렵습니다/,
    ],
    phase2: [/기관이 요구한 내용·조치/, /받은 문서·통지 원본/],
    marker: "어떤 종류의 안내",
    regressionOnly: true,
  },
};

function findLegacy(body) {
  return LEGACY.filter((s) => body.includes(s));
}

async function shot(page, file) {
  const p = path.join(OUT_DIR, file);
  await page.screenshot({ path: p, fullPage: true });
  return p;
}

async function clickIf(page, pattern, settleMs = 650) {
  const btn = page.getByRole("button", { name: pattern }).first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    await btn.click();
    await page.waitForTimeout(settleMs);
    return true;
  }
  return false;
}

async function clickFirstStitch(page) {
  const btns = page.locator("button").filter({ hasText: /^\d{2}/ });
  const count = await btns.count();
  for (let i = 0; i < count; i++) {
    const t = ((await btns.nth(i).textContent()) ?? "").trim();
    if (t.includes("직접 설명하기")) continue;
    await btns.nth(i).scrollIntoViewIfNeeded().catch(() => {});
    await btns.nth(i).click();
    await page.waitForTimeout(650);
    return true;
  }
  return false;
}

async function clickFirstQuietChoice(page) {
  const btns = page.locator('button[aria-pressed="false"]');
  const count = await btns.count();
  for (let i = 0; i < count; i++) {
    const btn = btns.nth(i);
    const t = ((await btn.textContent()) ?? "").trim();
    if (
      !t ||
      t.includes("직접 설명하기") ||
      t.includes("자료 없이 계속하기") ||
      t.includes("자료 포함하고 계속하기") ||
      t.includes("내 상황 검토하기") ||
      t.includes("자료를 첨부하고")
    ) {
      continue;
    }
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    await btn.click();
    await page.waitForTimeout(650);
    return true;
  }
  return false;
}

async function clickFirstChoice(page) {
  if (await clickFirstStitch(page)) return true;
  return await clickFirstQuietChoice(page);
}

async function isFirstResult(page) {
  return (
    (await page.getByText("01 / 현재 상황 한눈에 보기").isVisible().catch(() => false)) ||
    (await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible().catch(() => false))
  );
}

async function isFirstResultReentry(page) {
  if (await isPersonalized(page)) return false;
  return page
    .getByRole("heading", { name: "행정문서 1차 종합 결과" })
    .isVisible()
    .catch(() => false);
}

async function isPersonalized(page) {
  const heading = await page
    .getByRole("heading", { name: /행정문서 개인화 검토 결과|2차 개인화 검토 결과|행정문서 개인화 결과/ })
    .isVisible()
    .catch(() => false);
  if (heading) return true;
  const body = await page.locator("body").innerText();
  return (
    (body.includes("행정문서 개인화 검토 결과") ||
      body.includes("2차 개인화 검토 결과") ||
      body.includes("행정문서 개인화 결과")) &&
    (body.includes("1차 기본 확인과 추가 상황을 결합한 맞춤 검토 소견") ||
      body.includes("1차에서 확인한 내용과 추가로 확인한 내용") ||
      body.includes("1차 답변과 2차 확인 내용을 바탕으로"))
  );
}

async function isEvidenceStep(page) {
  return page
    .getByRole("heading", { name: /간단한 자료가 있으면 함께 첨부해주세요/ })
    .isVisible()
    .catch(() => false);
}

async function completeEvidenceStep(page) {
  if (!(await isEvidenceStep(page))) return false;
  const skip = page.getByRole("button", { name: /자료 없이 계속하기|자료 포함하고 계속하기/ }).first();
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
    await page.waitForTimeout(700);
    return true;
  }
  return false;
}

async function isSignup(page) {
  return page.locator('input[name="name"]').isVisible().catch(() => false);
}

async function completePhase1(page, steps) {
  if (steps === "auto") {
    for (let i = 0; i < 20; i++) {
      if (await isFirstResult(page)) return true;
      if (!(await clickFirstChoice(page))) break;
    }
    return await isFirstResult(page);
  }
  for (const step of steps) {
    if (await isFirstResult(page)) return true;
    await clickIf(page, step);
  }
  for (let i = 0; i < 8; i++) {
    if (await isFirstResult(page)) return true;
    if (!(await clickFirstChoice(page))) break;
  }
  return await isFirstResult(page);
}

async function completePhase2UntilSignup(page, steps) {
  if (steps === "auto") {
    for (let i = 0; i < 25; i++) {
      if (await isSignup(page)) return true;
      if (await isPersonalized(page)) return true;
      if (await isEvidenceStep(page)) {
        await completeEvidenceStep(page);
        continue;
      }
      if (!(await clickFirstChoice(page))) break;
    }
    if (await isEvidenceStep(page)) await completeEvidenceStep(page);
    return (await isSignup(page)) || (await isPersonalized(page));
  }
  for (const step of steps) {
    for (let i = 0; i < 12; i++) {
      if (await isSignup(page)) return true;
      if (await isPersonalized(page)) return true;
      if (await isEvidenceStep(page)) {
        await completeEvidenceStep(page);
        break;
      }
      if (await clickIf(page, step)) break;
      if (!(await clickFirstChoice(page))) return false;
    }
  }
  if (await isEvidenceStep(page)) await completeEvidenceStep(page);
  return (await isSignup(page)) || (await isPersonalized(page));
}

async function waitForPersonalized(page, maxMs = 20000) {
  for (let elapsed = 0; elapsed <= maxMs; elapsed += 500) {
    if (await isPersonalized(page)) return { ok: true, ms: elapsed };
    await page.waitForTimeout(500);
  }
  return { ok: false, ms: maxMs };
}

async function fillReactInput(page, name, value) {
  const input = page.locator(`input[name="${name}"]`);
  await input.click();
  await input.fill(value);
  await input.dispatchEvent("input", { bubbles: true });
  await input.dispatchEvent("change", { bubbles: true });
  await input.blur();
}

async function fillSignup(page) {
  const suffix = String(Date.now()).slice(-8) + Math.floor(Math.random() * 100);
  await fillReactInput(page, "name", "QA Mission User");
  await fillReactInput(page, "phone", `010${suffix.slice(0, 8)}`);
  await fillReactInput(page, "address", "Ho Chi Minh City");
  await fillReactInput(page, "email", `qa-mission-${suffix}@example.com`);
  await fillReactInput(page, "kakao_id", `qa_kakao_${suffix}`);
  const consent = page.locator('input[name="agreeTerms"]');
  if (await consent.isVisible().catch(() => false)) {
    await consent.check({ force: true });
    await consent.dispatchEvent("change", { bubbles: true });
  }
  const submit = page.getByRole("button", { name: /AI 1차 분석 결과 보기/ });
  try {
    await submit.waitFor({ state: "visible", timeout: 5000 });
    await page.waitForFunction(
      () => {
        const btn = [...document.querySelectorAll("button")].find((b) =>
          /AI 1차 분석 결과 보기/.test(b.textContent || ""),
        );
        return btn && !btn.disabled;
      },
      { timeout: 10000 },
    );
  } catch {
    return { submitted: false, error: "submit_disabled" };
  }
  await submit.click();
  return { submitted: true, error: null };
}

async function runCase(browser, caseId, viewportKey, width, height) {
  const spec = CASES[caseId];
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  const screenshots = {};
  const steps = {};

  const isMobile = width <= 420;
  const settleMs = isMobile ? 1100 : 650;

  await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(isMobile ? 1200 : 900);

  const legacyStart = findLegacy(await page.locator("body").innerText());
  steps.q1 = await clickIf(page, spec.q1, settleMs);
  await page.waitForTimeout(isMobile ? 1200 : 700);

  let bodyAfterQ1 = await page.locator("body").innerText();
  if (!spec.firstQ.test(bodyAfterQ1)) {
    steps.q1 = (await clickIf(page, spec.q1, settleMs)) || steps.q1;
    await page.waitForTimeout(isMobile ? 1200 : 900);
    bodyAfterQ1 = await page.locator("body").innerText();
  }
  if (!spec.firstQ.test(bodyAfterQ1)) {
    await page.reload({ waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(isMobile ? 1200 : 900);
    steps.q1 = await clickIf(page, spec.q1, settleMs);
    await page.waitForTimeout(isMobile ? 1200 : 900);
    bodyAfterQ1 = await page.locator("body").innerText();
  }
  steps.wrongCase = !spec.firstQ.test(bodyAfterQ1);

  steps.phase1 = await completePhase1(page, spec.phase1);
  screenshots.phase1_result = await shot(page, `${caseId}_${viewportKey}_01_first_result.png`);

  steps.reviewCta = false;
  steps.phase2 = false;
  steps.evidence = false;
  steps.signup = false;
  steps.signupSubmit = false;
  steps.personalized = false;
  steps.cta = false;
  steps.ctaNoLegacy = false;
  steps.backToFirst = false;
  steps.caseMatch = false;
  let personalizedWaitMs = 0;
  let signupError = null;

  if (steps.phase1) {
    steps.reviewCta = await clickIf(page, /내 상황 검토하기/);
    await page.waitForTimeout(800);
    steps.phase2 = steps.reviewCta && !(await isFirstResultReentry(page));
    screenshots.phase2 = await shot(page, `${caseId}_${viewportKey}_02_phase2.png`);

    if (steps.phase2) {
      await completePhase2UntilSignup(page, spec.phase2);
      steps.evidence = !(await isEvidenceStep(page));
      screenshots.before_signup = await shot(page, `${caseId}_${viewportKey}_03_before_signup.png`);

      steps.signup = await isSignup(page);
      if (steps.signup) {
        const submitResult = await fillSignup(page);
        steps.signupSubmit = submitResult.submitted;
        signupError = submitResult.error;
        if (steps.signupSubmit) {
          const wait = await waitForPersonalized(page, 12000);
          steps.personalized = wait.ok;
          personalizedWaitMs = wait.ms;
        }
      } else {
        const wait = await waitForPersonalized(page, 2000);
        steps.personalized = wait.ok;
        personalizedWaitMs = wait.ms;
      }

      screenshots.personalized = await shot(page, `${caseId}_${viewportKey}_04_personalized.png`);
      steps.backToFirst = await isFirstResultReentry(page);

      if (steps.personalized) {
        const body = await page.locator("body").innerText();
        steps.caseMatch = body.includes(spec.marker);
        steps.ctaAi = await page
          .getByRole("button", { name: /AI 리포트 준비하기/ })
          .isVisible()
          .catch(() => false);
        steps.ctaExpert = await page
          .getByRole("button", { name: /전문가 검토 요청하기/ })
          .isVisible()
          .catch(() => false);
        steps.ctaDirect = await page
          .getByRole("button", { name: /직접 (검토 )?진행하기|직접 진행하기/ })
          .isVisible()
          .catch(() => false);
        steps.cta = steps.ctaAi && steps.ctaExpert && !steps.ctaDirect;
        if (steps.ctaAi) {
          await clickIf(page, /AI 리포트 준비하기/);
        }
        await page.waitForTimeout(900);
        screenshots.after_cta = await shot(page, `${caseId}_${viewportKey}_05_after_cta.png`);
        const legacyAfter = findLegacy(await page.locator("body").innerText());
        const urlAfterCta = page.url();
        steps.ctaNoLegacy =
          steps.cta &&
          !steps.ctaDirect &&
          legacyAfter.length === 0 &&
          !(await page.getByText(/어떤 검토가 필요하신가요/).first().isVisible().catch(() => false)) &&
          (urlAfterCta.includes("/documents") ||
            urlAfterCta.includes("auto-login") ||
            urlAfterCta.includes("/verify/admin") ||
            (await isPersonalized(page)));
        steps.backToFirst = (await isFirstResultReentry(page)) || steps.backToFirst;
      }
    }
  }

  const legacyEnd = findLegacy(await page.locator("body").innerText());
  await context.close();

  const fullPass =
    steps.q1 &&
    !steps.wrongCase &&
    steps.phase1 &&
    steps.reviewCta &&
    steps.phase2 &&
    steps.evidence &&
    steps.signup &&
    steps.signupSubmit &&
    steps.personalized &&
    !steps.backToFirst &&
    steps.caseMatch &&
    steps.cta &&
    steps.ctaNoLegacy &&
    legacyStart.length === 0 &&
    legacyEnd.length === 0;

  const regressionPass =
    steps.q1 &&
    !steps.wrongCase &&
    steps.phase1 &&
    steps.reviewCta &&
    steps.phase2 &&
    legacyStart.length === 0 &&
    legacyEnd.length === 0;

  return {
    caseId,
    viewport: viewportKey,
    regressionOnly: !!spec.regressionOnly,
    pass: spec.regressionOnly ? regressionPass : fullPass,
    steps,
    legacyStart,
    legacyEnd,
    signupError,
    personalizedWaitMs,
    screenshots,
  };
}

const browser = await chromium.launch({ headless: true });
const results = {};

for (const vp of [
  { key: "desktop", width: 1280, height: 900 },
  { key: "mobile375", width: 375, height: 812 },
]) {
  for (const caseId of Object.keys(CASES)) {
    results[`${caseId}_${vp.key}`] = await runCase(browser, caseId, vp.key, vp.width, vp.height);
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
}

const page = await browser.newPage();
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const legacyDirect = findLegacy(await page.locator("body").innerText());
await page.goto(`${BASE}?start=check`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const legacyStartCheck = findLegacy(await page.locator("body").innerText());
await page.close();
await browser.close();

console.log(
  JSON.stringify(
    { results, legacyDirect, legacyStartCheck, screenshotDir: OUT_DIR },
    null,
    2,
  ),
);
