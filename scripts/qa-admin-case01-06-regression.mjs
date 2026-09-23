import { chromium } from "playwright";

const BASE = "http://localhost:3010/verify/admin";
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
    firstQ: /통지서에는 어떤 문제/,
    phase1: [
      /특정 교통위반/,
      /실제 상황과 대체로/,
      /벌금·과태료/,
      /아직 아무것도/,
      /기한은 있지만 정확한 날짜/,
    ],
    phase2: [/왜 이런 통지를 받았는지/],
    cross: [/교통국에서는 무엇을 납부/, /보완 요구서에는/, /처분·조치 통지서에는/, /이 문서·통지는 어디/],
  },
  CASE_02: {
    q1: /벌금이나 비용을 납부하라는 내용/,
    firstQ: /교통국에서는 무엇을 납부/,
    phase1: [
      /교통위반에 대한 벌금/,
      /교통국·교통 관련/,
      /특정 교통위반/,
      /납부할 금액이 명확하게/,
      /일부 내용이나 금액/,
      /기한은 있지만 정확한 날짜/,
      /아직 납부하지 않았습니다/,
    ],
    phase2: "auto",
    cross: [/통지서에는 어떤 문제/, /보완 요구서에는/, /처분·조치 통지서에는/],
  },
  CASE_03: {
    q1: /출석하거나 설명하라는 내용/,
    firstQ: /출석·소명·제출/,
    phase1: "auto",
    phase2: "auto",
    cross: [/통지서에는 어떤 문제/, /교통국에서는 무엇을 납부/, /보완 요구서에는/],
  },
  CASE_04: {
    q1: /추가 서류나 보완을 요구하는 내용/,
    firstQ: /보완 요구서에는/,
    phase1: "auto",
    phase2: "auto",
    cross: [/통지서에는 어떤 문제/, /교통국에서는 무엇을 납부/, /처분·조치 통지서에는/],
  },
  CASE_05: {
    q1: /면허의 정지·취소·거부 등 조치/,
    firstQ: /처분·조치 통지서/,
    phase1: "auto",
    phase2: "auto",
    cross: [/통지서에는 어떤 문제/, /교통국에서는 무엇을 납부/, /보완 요구서에는/],
  },
  CASE_06: {
    q1: /무슨 내용인지 잘 모르겠습니다/,
    firstQ: /이 문서·통지는 어디/,
    phase1: [
      /출입국·외국인등록/,
      /무엇을 해야 하는지 먼저 알아야/,
      /기한 안내를 찾지 못했습니다/,
      /문서에 적힌 내용이 무엇을 의미하는지/,
    ],
    phase2: [/본문의 핵심 문장/, /받은 문서·통지 원본/],
    cross: [/통지서에는 어떤 문제/, /교통국에서는 무엇을 납부/, /보완 요구서에는/],
  },
};

function findLegacy(body) {
  return LEGACY.filter((s) => body.includes(s));
}

function findCross(body, patterns) {
  return patterns.filter((p) => p.test(body));
}

async function clickIf(page, pattern) {
  const btn = page.getByRole("button", { name: pattern }).first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    await btn.click();
    await page.waitForTimeout(650);
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

async function getProgress(page) {
  const body = await page.locator("body").innerText();
  const m = body.match(/(\d{2})\s*\/\s*(\d{2})/);
  return m ? { num: Number(m[1]), denom: Number(m[2]), raw: `${m[1]}/${m[2]}` } : null;
}

async function getActiveQuestion(page) {
  const labels = await page.locator("h3").allTextContents();
  return labels.map((x) => x.trim()).find((l) => l.length > 8 && !l.includes("검토 내용 체크")) ?? "";
}

async function isFirstResult(page) {
  return (
    (await page.getByText("01 / 종합 판단").isVisible().catch(() => false)) ||
    (await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible().catch(() => false))
  );
}

async function isPersonalized(page) {
  return page.getByRole("heading", { name: "행정문서 개인화 결과" }).isVisible().catch(() => false);
}

async function completePhase1(page, steps) {
  const seen = [];
  const progressSamples = [];
  let lastDenom = null;

  if (steps === "auto") {
    for (let i = 0; i < 20; i++) {
      if (await isFirstResult(page)) break;
      const q = await getActiveQuestion(page);
      if (q) seen.push(q);
      const p = await getProgress(page);
      if (p) {
        progressSamples.push(p.raw);
        if (lastDenom !== null && p.denom !== lastDenom) progressSamples.push(`denom_change:${lastDenom}->${p.denom}`);
        lastDenom = p.denom;
      }
      if (!(await clickFirstStitch(page))) break;
    }
    return { seen, progressSamples };
  }

  for (const step of steps) {
    if (await isFirstResult(page)) break;
    const q = await getActiveQuestion(page);
    if (q) seen.push(q);
    const p = await getProgress(page);
    if (p) {
      progressSamples.push(p.raw);
      if (lastDenom !== null && p.denom !== lastDenom) progressSamples.push(`denom_change:${lastDenom}->${p.denom}`);
      lastDenom = p.denom;
    }
    await clickIf(page, step);
  }
  for (let i = 0; i < 8; i++) {
    if (await isFirstResult(page)) break;
    if (!(await clickFirstStitch(page))) break;
  }
  return { seen, progressSamples };
}

async function completePhase2(page, steps) {
  if (steps === "auto") {
    for (let i = 0; i < 25; i++) {
      if (await isPersonalized(page)) return true;
      if (!(await clickFirstStitch(page))) break;
    }
    return await isPersonalized(page);
  }
  for (const step of steps) {
    for (let i = 0; i < 12; i++) {
      if (await isPersonalized(page)) return true;
      if (await clickIf(page, step)) break;
      if (!(await clickFirstStitch(page))) return false;
    }
  }
  return await isPersonalized(page);
}

async function runDirectExplainCheck(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await clickIf(page, /교통위반이나 문제를 알리는 통지/);
  await page.waitForTimeout(600);
  const numbered = page.locator("button").filter({ hasText: /^\d{2}/ });
  const count = await numbered.count();
  for (let i = 0; i < count; i++) {
    const t = ((await numbered.nth(i).textContent()) ?? "").trim();
    if (t.includes("직접 설명하기")) {
      await context.close();
      return { ok: false, issue: "direct_explain_numbered" };
    }
  }
  const direct = page.getByRole("button", { name: /^직접 설명하기/ }).first();
  if (!(await direct.isVisible().catch(() => false))) {
    await context.close();
    return { ok: false, issue: "direct_explain_missing" };
  }
  await direct.click();
  await page.waitForTimeout(500);
  const textareaVisible = await page.locator("textarea").first().isVisible().catch(() => false);
  const back = page.getByRole("button", { name: /선택지로 돌아가기/ }).first();
  if (await back.isVisible().catch(() => false)) await back.click();
  await context.close();
  return { ok: textareaVisible, issue: textareaVisible ? null : "direct_explain_no_textarea" };
}

async function runCase(browser, caseId, viewport) {
  const spec = CASES[caseId];
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const issues = [];

  await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(900);

  if (findLegacy(await page.locator("body").innerText()).length) issues.push("legacy_start");

  const q1Clicked = await clickIf(page, spec.q1);
  if (!q1Clicked) issues.push("q1_not_clicked");
  await page.waitForTimeout(700);

  const bodyAfterQ1 = await page.locator("body").innerText();
  if (!spec.firstQ.test(bodyAfterQ1)) issues.push("wrong_case_after_q1");
  const crossAfterQ1 = findCross(bodyAfterQ1, spec.cross);
  if (crossAfterQ1.length) issues.push(`cross_after_q1`);

  const { seen: phase1Questions, progressSamples } = await completePhase1(page, spec.phase1);
  const firstResult = await isFirstResult(page);
  if (!firstResult) issues.push("no_first_result");

  let phase2Entered = false;
  let phase1Repeated = false;
  let personalized = false;
  let ctaNoLegacy = false;

  if (firstResult) {
    if (findLegacy(await page.locator("body").innerText()).length) issues.push("legacy_first_result");
    await clickIf(page, /내 상황 검토하기/);
    await page.waitForTimeout(800);
    phase2Entered = !(await isFirstResult(page));
    if (!phase2Entered) issues.push("phase2_not_entered");

    const activeQ = await getActiveQuestion(page);
    if (activeQ && phase1Questions.includes(activeQ)) {
      phase1Repeated = true;
      issues.push("phase1_repeat");
    }

    personalized = await completePhase2(page, spec.phase2);
    if (!personalized) issues.push("no_personalized");

    if (personalized) {
      const ctaClicked = await clickIf(page, /다음 단계 진행하기/);
      await page.waitForTimeout(900);
      const legacyAfter = findLegacy(await page.locator("body").innerText());
      if (legacyAfter.length) issues.push("legacy_after_cta");
      ctaNoLegacy = ctaClicked && legacyAfter.length === 0 && (await isPersonalized(page));
      if (!ctaNoLegacy) issues.push("cta_fail");
    }
  }

  if (findLegacy(await page.locator("body").innerText()).length) issues.push("legacy_end");

  await context.close();

  const pass =
    q1Clicked &&
    firstResult &&
    phase2Entered &&
    personalized &&
    ctaNoLegacy &&
    !phase1Repeated &&
    issues.length === 0;

  return {
    caseId,
    viewport: `${viewport.width}x${viewport.height}`,
    pass,
    issues,
    q1Clicked,
    firstResult,
    phase2Entered,
    personalized,
    ctaNoLegacy,
    phase1Repeated,
    progressSamples,
    phase1QuestionCount: phase1Questions.length,
  };
}

const browser = await chromium.launch({ headless: true });
const directExplain = await runDirectExplainCheck(browser);
const all = { directExplain };

for (const viewport of [
  { width: 1280, height: 900, key: "desktop" },
  { width: 375, height: 812, key: "mobile375" },
]) {
  for (const caseId of Object.keys(CASES)) {
    all[`${caseId}_${viewport.key}`] = await runCase(browser, caseId, viewport);
  }
}

await browser.close();
console.log(JSON.stringify(all, null, 2));
