import { chromium } from "playwright";

const LEGACY_PATTERNS = [
  /01\s*\/\s*04/,
  /어떤 검토가 필요하신가요/,
  /어떤 서류를 검토하시나요/,
  /검토가 필요한 내용을 간단히 알려주세요/,
];

async function clickBtn(page, pattern) {
  const btn = page.getByRole("button", { name: pattern }).first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(550);
    return true;
  }
  return false;
}

async function hasLegacyText(page) {
  const body = await page.locator("body").innerText();
  return LEGACY_PATTERNS.some((p) => p.test(body));
}

async function gridClick(page) {
  const btns = page.locator("button").filter({
    hasText: /^\d{2}\s/,
  });
  const count = await btns.count();
  for (let i = 0; i < count; i++) {
    const t = (await btns.nth(i).textContent())?.trim() ?? "";
    if (t.includes("직접 설명하기")) continue;
    await btns.nth(i).click();
    await page.waitForTimeout(550);
    return true;
  }
  return false;
}

async function runCaseFlow(page, caseIndex, label) {
  await page.goto("http://localhost:3010/verify/admin", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(800);
  const legacyAtStart = await hasLegacyText(page);
  const q1 = page.locator("button").filter({ hasText: /^\d{2}\s/ });
  await q1.nth(caseIndex).click();
  await page.waitForTimeout(600);

  let legacyHits = [];
  for (let step = 0; step < 40; step++) {
    if (await page.getByText("행정문서 개인화 결과").isVisible().catch(() => false)) break;
    if (await hasLegacyText(page)) legacyHits.push(`step${step}`);
    if (await page.getByText("01 / 종합 판단").isVisible().catch(() => false)) {
      const cont = page.getByRole("button", { name: /내 상황 검토하기/ }).first();
      if (await cont.isEnabled().catch(() => false)) {
        await cont.click();
        await page.waitForTimeout(700);
        continue;
      }
    }
    if (!(await gridClick(page))) break;
  }

  const firstResult = await page.getByText("01 / 종합 판단").isVisible().catch(() => false);
  if (firstResult) {
    const btn = page.getByRole("button", { name: /내 상황 검토하기/ }).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(700);
      for (let step = 0; step < 25; step++) {
        if (await page.getByText("행정문서 개인화 결과").isVisible().catch(() => false)) break;
        if (await hasLegacyText(page)) legacyHits.push(`phase2-step${step}`);
        if (!(await gridClick(page))) break;
      }
    }
  }

  const personalized = await page.getByText("행정문서 개인화 결과").isVisible().catch(() => false);
  const legacyEnd = await hasLegacyText(page);
  return {
    label,
    legacyAtStart,
    legacyHits,
    firstResult,
    personalized,
    legacyEnd,
    pass: !legacyAtStart && legacyHits.length === 0 && !legacyEnd && firstResult,
  };
}

async function checkStartCheck(page, width, label) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("http://localhost:3010/verify/admin?start=check", {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await page.waitForTimeout(800);
  const legacy = await hasLegacyText(page);
  const masterQ1 = await page
    .getByText(/교통국에서 받은 운전면허 관련 문서|어떤 내용에 가까운가요/)
    .isVisible()
    .catch(() => false);
  return { label, legacy, masterQ1, pass: !legacy && masterQ1 };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const startCheckDesktop = await checkStartCheck(page, 1280, "start-check-desktop");
const startCheckMobile = await checkStartCheck(page, 375, "start-check-mobile");
const case01Desktop = await runCaseFlow(page, 0, "case01-desktop");
await page.setViewportSize({ width: 375, height: 900 });
const case01Mobile = await runCaseFlow(page, 0, "case01-mobile");
await page.setViewportSize({ width: 1280, height: 900 });
const case06Desktop = await runCaseFlow(page, 5, "case06-desktop");

console.log(
  JSON.stringify(
    { startCheckDesktop, startCheckMobile, case01Desktop, case01Mobile, case06Desktop },
    null,
    2,
  ),
);
await browser.close();
