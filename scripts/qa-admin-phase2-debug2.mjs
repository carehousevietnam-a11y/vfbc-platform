import { chromium } from "playwright";

const BASE = "http://localhost:3010/verify/admin";

async function clickIf(page, pattern) {
  const btn = page.getByRole("button", { name: pattern }).first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(700);
    return true;
  }
  return false;
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(800);

for (const s of [
  /교통위반/,
  /특정 교통위반/,
  /실제 상황과 대체로/,
  /벌금·과태료/,
  /아직 아무것도/,
  /기한은 있지만 정확한 날짜/,
]) {
  if (await page.getByText("01 / 종합 판단").isVisible().catch(() => false)) break;
  await clickIf(page, s);
}

await clickIf(page, /내 상황 검토하기/);
await clickIf(page, /왜 이런 통지를 받았는지/);
await page.waitForTimeout(1000);

const body = await page.locator("body").innerText();
console.log("personalized visible", await page.getByText("행정문서 개인화 결과").isVisible());
console.log("first result visible", await page.getByText("행정문서 1차 종합 결과").isVisible());
console.log("종합 판단", await page.getByText("01 / 종합 판단").isVisible());
console.log("다음 단계", await page.getByText(/다음 단계 진행하기/).isVisible());
console.log("blockage q", body.includes("지금 가장 확인하기 어려운"));
console.log("idx 개인화", body.indexOf("개인화"));
console.log("snippet around 개인화", body.slice(Math.max(0, body.indexOf("개인화") - 80), body.indexOf("개인화") + 120));

await browser.close();
