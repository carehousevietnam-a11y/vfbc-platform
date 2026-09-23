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

function findLegacy(body) {
  return LEGACY.filter((s) => body.includes(s));
}

async function isPersonalizedVisible(page) {
  return page.getByRole("heading", { name: "행정문서 개인화 결과" }).isVisible().catch(() => false);
}

async function isFirstResultVisible(page) {
  return (
    (await page.getByText("01 / 종합 판단").isVisible().catch(() => false)) ||
    (await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible().catch(() => false))
  );
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

async function clickFirstStitchOption(page) {
  const stitch = page.locator("button").filter({ hasText: /^\d{2}/ }).first();
  if (await stitch.isVisible().catch(() => false)) {
    await stitch.scrollIntoViewIfNeeded().catch(() => {});
    await stitch.click();
    await page.waitForTimeout(650);
    return true;
  }
  return false;
}

async function runCaseFlow(page, { name, phase1Steps, phase2Marker, phase2Answers = [] }) {
  const legacyHits = [];

  await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(900);

  for (const step of phase1Steps) {
    legacyHits.push(...findLegacy(await page.locator("body").innerText()));
    if (await isFirstResultVisible(page)) break;
    await clickIf(page, step);
  }

  const firstResult = await isFirstResultVisible(page);

  let phase2Entered = false;
  let phase2Complete = false;
  let personalized = false;
  let ctaNoLegacy = false;

  if (firstResult) {
    legacyHits.push(...findLegacy(await page.locator("body").innerText()));
    await clickIf(page, /내 상황 검토하기/);
    await page.waitForTimeout(700);
    phase2Entered = await page.getByText(phase2Marker).isVisible().catch(() => false);

    const answerPatterns =
      phase2Answers.length > 0 ? phase2Answers : [null];
    for (const pattern of answerPatterns) {
      for (let i = 0; i < 15; i++) {
        legacyHits.push(...findLegacy(await page.locator("body").innerText()));
        if (await isPersonalizedVisible(page)) break;
        const clicked = pattern
          ? await clickIf(page, pattern)
          : await clickFirstStitchOption(page);
        if (!clicked) break;
      }
      if (await isPersonalizedVisible(page)) break;
    }

    personalized = await isPersonalizedVisible(page);
    phase2Complete = personalized;

    if (personalized) {
      legacyHits.push(...findLegacy(await page.locator("body").innerText()));
      const ctaClicked = await clickIf(page, /다음 단계 진행하기/);
      await page.waitForTimeout(900);
      const bodyAfterCta = await page.locator("body").innerText();
      const legacyAfter = findLegacy(bodyAfterCta);
      legacyHits.push(...legacyAfter);
      ctaNoLegacy =
        ctaClicked &&
        legacyAfter.length === 0 &&
        !(await page.getByText(/어떤 검토가 필요하신가요/).first().isVisible().catch(() => false)) &&
        !(await page.getByText(/01\s*\/\s*04/).first().isVisible().catch(() => false)) &&
        (await isPersonalizedVisible(page));
    }
  }

  legacyHits.push(...findLegacy(await page.locator("body").innerText()));
  const uniqueLegacy = [...new Set(legacyHits)];

  return {
    name,
    firstResult,
    phase2Entered,
    phase2Complete,
    personalized,
    ctaNoLegacy,
    legacy: uniqueLegacy,
  };
}

const CASE01 = {
  name: "CASE_01",
  phase1Steps: [
    /교통위반/,
    /특정 교통위반/,
    /실제 상황과 대체로/,
    /벌금·과태료/,
    /아직 아무것도/,
    /기한은 있지만 정확한 날짜/,
  ],
  phase2Marker: /지금 가장 확인하기 어려운 부분/,
  phase2Answers: [/왜 이런 통지를 받았는지/],
};

const CASE06 = {
  name: "CASE_06",
  phase1Steps: [
    /무슨 내용인지 잘 모르겠습니다/,
    /출입국·외국인등록/,
    /무엇을 해야 하는지 먼저 알아야/,
    /기한 안내를 찾지 못했습니다/,
    /문서에 적힌 내용이 무엇을 의미하는지/,
  ],
  phase2Marker: /문서에서 가장 먼저 확인해야 할 핵심 문구/,
  phase2Answers: [/본문의 핵심 문장/, /받은 문서·통지 원본/],
};

const browser = await chromium.launch({ headless: true });
const results = {};

for (const viewport of [
  { key: "pc", width: 1280, height: 900 },
  { key: "mobile375", width: 375, height: 812 },
]) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  results[`case01_${viewport.key}`] = await runCaseFlow(page, CASE01);
  await page.close();

  const page2 = await browser.newPage();
  await page2.setViewportSize({ width: viewport.width, height: viewport.height });
  results[`case06_${viewport.key}`] = await runCaseFlow(page2, CASE06);
  await page2.close();
}

// Legacy-only sweep on fresh load + ?start=check
const page3 = await browser.newPage();
await page3.setViewportSize({ width: 1280, height: 900 });
await page3.goto(BASE, { waitUntil: "networkidle" });
await page3.waitForTimeout(800);
const legacyDirect = findLegacy(await page3.locator("body").innerText());
await page3.goto(`${BASE}?start=check`, { waitUntil: "networkidle" });
await page3.waitForTimeout(800);
const legacyStartCheck = findLegacy(await page3.locator("body").innerText());
await page3.close();

await browser.close();

console.log(
  JSON.stringify({ ...results, legacyDirect, legacyStartCheck }, null, 2),
);
