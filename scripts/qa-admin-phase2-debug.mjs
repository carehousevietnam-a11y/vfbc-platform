import { chromium } from "playwright";

const BASE = "http://localhost:3010/verify/admin";

async function clickIf(page, pattern) {
  const btn = page.getByRole("button", { name: pattern }).first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(600);
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
await page.waitForTimeout(800);

const buttons = await page.locator("button").allTextContents();
console.log("BUTTONS:", JSON.stringify(buttons.filter(Boolean), null, 2));
console.log("BODY SNIP:", (await page.locator("body").innerText()).slice(0, 2500));

// try clicking blockage option by label
await clickIf(page, /왜 이런 통지를 받았는지/);
await page.waitForTimeout(800);
console.log("AFTER CLICK personalized?", await page.getByText("행정문서 개인화 결과").isVisible().catch(() => false));
console.log("AFTER CLICK body has:", (await page.locator("body").innerText()).includes("개인화"));
console.log("NEXT Q?", (await page.locator("body").innerText()).includes("지금 확인할 수 있는 자료"));

await browser.close();
