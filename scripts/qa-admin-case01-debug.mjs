import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto("http://localhost:3010/verify/admin", { waitUntil: "networkidle" });
await page.waitForTimeout(800);

async function clickIf(p, pattern) {
  const btn = p.getByRole("button", { name: pattern }).first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    await p.waitForTimeout(650);
    return true;
  }
  return false;
}

await clickIf(page, /교통위반이나 문제를 알리는 통지/);
const direct = page.getByRole("button", { name: /^직접 설명하기/ }).first();
await direct.click();
await page.waitForTimeout(500);
await page.locator("textarea").first().fill("QA direct explain test");
const save = page.getByRole("button", { name: /저장|다음|확인/ }).first();
if (await save.isVisible()) await save.click();
await page.waitForTimeout(700);

for (const s of [/실제 상황과 대체로/, /벌금·과태료/, /아직 아무것도/, /기한은 있지만 정확한 날짜/]) {
  console.log("step", s.toString(), await clickIf(page, s));
  console.log("progress", (await page.locator("body").innerText()).match(/\d{2}\s*\/\s*\d{2}/)?.[0]);
  console.log("first?", await page.getByText("01 / 종합 판단").isVisible().catch(() => false));
}

console.log("final body tail", (await page.locator("body").innerText()).slice(-500));
await browser.close();
