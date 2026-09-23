import { chromium } from "playwright";

const LEGACY = [
  /01\s*\/\s*04/,
  /어떤 검토가 필요하신가요/,
  /어떤 서류를 검토하시나요/,
  /검토가 필요한 내용을 간단히 알려주세요/,
];

function hasLegacy(body) {
  return LEGACY.some((p) => p.test(body));
}

async function clickIf(page, pattern) {
  const btn = page.getByRole("button", { name: pattern }).first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(550);
    return true;
  }
  return false;
}

async function runCase01(page) {
  await page.goto("http://localhost:3010/verify/admin", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(800);
  const legacyHits = [];
  const steps = [
    /교통위반/,
    /특정 교통위반/,
    /실제 상황과 대체로/,
    /벌금·과태료/,
    /아직 아무것도/,
    /기한은 있지만 정확한 날짜/,
  ];
  for (const s of steps) {
    const body = await page.locator("body").innerText();
    if (hasLegacy(body)) legacyHits.push(s.toString());
    if (await page.getByText("01 / 종합 판단").isVisible().catch(() => false)) break;
    await clickIf(page, s);
  }
  const first = await page.getByText("01 / 종합 판단").isVisible().catch(() => false);
  if (first) {
    await clickIf(page, /내 상황 검토하기/);
    for (let i = 0; i < 20; i++) {
      const body = await page.locator("body").innerText();
      if (hasLegacy(body)) legacyHits.push(`p2-${i}`);
      if (await page.getByText("행정문서 개인화 결과").isVisible().catch(() => false)) break;
      const stitch = page.getByRole("button", { name: /^\d{2}\s/ }).first();
      if (await stitch.isVisible().catch(() => false)) {
        await stitch.click();
        await page.waitForTimeout(550);
      } else break;
    }
  }
  const personalized = await page.getByText("행정문서 개인화 결과").isVisible().catch(() => false);
  const bodyEnd = await page.locator("body").innerText();
  return {
    first,
    personalized,
    legacyHits,
    legacyEnd: hasLegacy(bodyEnd),
    pass: first && !legacyHits.length && !hasLegacy(bodyEnd),
  };
}

async function runCase06(page) {
  await page.goto("http://localhost:3010/verify/admin", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(800);
  const legacyHits = [];
  await clickIf(page, /무슨 내용인지 잘 모르겠습니다/);
  const phase1 = [
    /출입국·외국인등록/,
    /무엇을 해야 하는지 먼저 알아야/,
    /기한 안내를 찾지 못했습니다/,
    /문서에 적힌 내용이 무엇을 의미하는지/,
  ];
  for (const s of phase1) {
    const body = await page.locator("body").innerText();
    if (hasLegacy(body)) legacyHits.push(s.toString());
    if (await page.getByText("01 / 종합 판단").isVisible().catch(() => false)) break;
    await clickIf(page, s);
  }
  const first = await page.getByText("01 / 종합 판단").isVisible().catch(() => false);
  if (first) {
    await clickIf(page, /내 상황 검토하기/);
    for (let i = 0; i < 20; i++) {
      const body = await page.locator("body").innerText();
      if (hasLegacy(body)) legacyHits.push(`p2-${i}`);
      if (await page.getByText("행정문서 개인화 결과").isVisible().catch(() => false)) break;
      const btn = page.getByRole("button", { name: /^\d{2}\s/ }).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(550);
      } else break;
    }
  }
  const personalized = await page.getByText("행정문서 개인화 결과").isVisible().catch(() => false);
  const bodyEnd = await page.locator("body").innerText();
  return {
    first,
    personalized,
    legacyHits,
    legacyEnd: hasLegacy(bodyEnd),
    pass: first && !legacyHits.length && !hasLegacy(bodyEnd),
  };
}

async function runCase02Personalized(page) {
  await page.goto("http://localhost:3010/verify/admin", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(800);
  const legacyHits = [];
  const steps = [
    /벌금이나 비용/,
    /교통위반에 대한 벌금/,
    /교통국·교통 관련 행정기관/,
    /특정 교통위반이나 과태료/,
    /납부할 금액이 명확하게/,
    /일부 내용이나 금액이 실제 상황과 다릅니다/,
    /기한은 있지만 정확한 날짜를 모르겠습니다/,
    /아직 납부하지 않았습니다/,
  ];
  for (const s of steps) {
    const body = await page.locator("body").innerText();
    if (hasLegacy(body)) legacyHits.push(s.toString());
    if (await page.getByText("01 / 종합 판단").isVisible().catch(() => false)) break;
    await clickIf(page, s);
  }
  const first = await page.getByText("01 / 종합 판단").isVisible().catch(() => false);
  let phase2Entered = false;
  if (first) {
    await clickIf(page, /내 상황 검토하기/);
    phase2Entered = await page
      .getByText(/납부 요구를 받은 상황에서|지금 이 납부 사건에서/)
      .isVisible()
      .catch(() => false);
    for (let i = 0; i < 30; i++) {
      const body = await page.locator("body").innerText();
      if (hasLegacy(body)) legacyHits.push(`p2-${i}`);
      if (await page.getByText("행정문서 개인화 결과").isVisible().catch(() => false)) break;
      const stitch = page.getByRole("button", { name: /^\d{2}\s/ }).first();
      if (await stitch.isVisible().catch(() => false)) {
        await stitch.click();
        await page.waitForTimeout(550);
      } else break;
    }
  }
  const personalized = await page.getByText("행정문서 개인화 결과").isVisible().catch(() => false);
  const bodyEnd = await page.locator("body").innerText();
  return {
    first,
    phase2Entered,
    personalized,
    legacyHits,
    legacyEnd: hasLegacy(bodyEnd),
    pass:
      first &&
      phase2Entered &&
      !legacyHits.length &&
      !hasLegacy(bodyEnd),
  };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });
const case01Desktop = await runCase01(page);
await page.setViewportSize({ width: 375, height: 900 });
const case01Mobile = await runCase01(page);
await page.setViewportSize({ width: 1280, height: 900 });
const case06Desktop = await runCase06(page);
const case02Personalized = await runCase02Personalized(page);
console.log(
  JSON.stringify({ case01Desktop, case01Mobile, case06Desktop, case02Personalized }, null, 2),
);
await browser.close();
