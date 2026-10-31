/**
 * P7g — 1차 결과 화면 desktop + mobile.
 * Run: node tests/accounting/p7g-first-result-browser.mjs
 */
import { chromium } from "@playwright/test";

const base = process.env.P7G_BASE || "http://localhost:3020";

let fail = 0;
function assert(name, ok) {
  if (!ok) {
    console.error(`FAIL ${name}`);
    fail += 1;
  } else console.log(`PASS ${name}`);
}

async function reachFirstResult(page) {
  await page.goto(`${base}/verify/accounting/vat-filing-check`, {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  await page.getByTestId("accounting-funnel-active").waitFor({ timeout: 90_000 });
  const qBox = page.locator('[data-testid="accounting-funnel-questions"]');
  const q1 = qBox.locator('[data-question-id="vat_s1_q1"]').locator("button").first();
  const nextStep = page.locator('[data-question-id="vat_s1_q2"], [data-testid="accounting-funnel-documents"]');
  for (let i = 0; i < 5; i++) {
    if (await nextStep.first().isVisible().catch(() => false)) break;
    if (await q1.isVisible().catch(() => false)) await q1.click();
    await page.waitForTimeout(300);
  }
  await qBox.locator('[data-question-id="vat_s1_q2"]').locator("button").filter({ hasText: "늦어진 적" }).click();
  await qBox.locator('[data-question-id="vat_s1_q3"]').locator("button").first().click();
  for (let i = 0; i < 8; i++) {
    const btn = qBox.locator("button").first();
    if (await btn.isVisible().catch(() => false)) await btn.click();
    else break;
  }
  await page.getByText("첨부 없이 다음").click();
  await page.getByTestId("accounting-funnel-first-result").waitFor();
}

const browser = await chromium.launch();
try {
  for (const [w, h, label] of [
    [1280, 800, "desktop"],
    [375, 812, "mobile"],
  ]) {
    const context = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await context.newPage();
    await reachFirstResult(page);
    await page.getByTestId("accounting-funnel-first-result-summary").waitFor({ timeout: 30_000 });
    assert(`${label} first result summary`, await page.getByTestId("accounting-funnel-first-result-disclaimer").isVisible());
    await context.close();
  }
} finally {
  await browser.close();
}

process.exit(fail > 0 ? 1 : 0);
