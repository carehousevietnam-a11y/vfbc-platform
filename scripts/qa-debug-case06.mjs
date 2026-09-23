import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto("http://localhost:3010/verify/admin", { waitUntil: "networkidle", timeout: 60000 });
await page.getByRole("button", { name: /무슨 내용인지 잘 모르겠습니다/ }).first().click();
await page.waitForTimeout(700);

for (let i = 0; i < 10; i++) {
  const h = await page.locator("h3").last().textContent().catch(() => "");
  const opts = await page
    .locator("button")
    .filter({ hasText: /^01/ })
    .allTextContents();
  console.log(`step ${i}:`, h?.slice(0, 80));
  console.log("  opt0:", opts[0]?.replace(/\s+/g, " ").slice(0, 80));
  if (await page.getByText("01 / 종합 판단").isVisible().catch(() => false)) {
    console.log("RESULT");
    break;
  }
  const btn = page.locator("button").filter({ hasText: /^01/ }).first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(600);
  } else break;
}
await browser.close();
