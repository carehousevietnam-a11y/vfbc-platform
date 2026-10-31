/**
 * P7a/P7c accounting funnel — production Pack, desktop + mobile.
 * Run: npx playwright install chromium && node tests/accounting/p7a-funnel-browser-check.mjs
 */
import { chromium } from "@playwright/test";

const base = process.env.P7A_BASE || "http://localhost:3020";

const scenarios = [
  {
    path: "/verify/accounting/vat-filing-check",
    q2Needle: "늦어진 적",
    stage2Needle: "늦어졌을 때",
  },
  {
    path: "/verify/accounting/invoice-processing-check",
    q2Needle: "받지 못했거나",
    stage2Needle: "받지 못했거나 찾지 못했다면",
  },
  {
    path: "/verify/accounting/corp-tax-closing-check",
    q2Needle: "늦어진 적",
    stage2Needle: "늦어졌다면",
  },
];

let fail = 0;

function assert(name, ok) {
  if (!ok) {
    console.error(`FAIL ${name}`);
    fail += 1;
  } else console.log(`PASS ${name}`);
}

async function finishFunnel(page) {
  await page.getByText("첨부 없이 다음").click();
  await page.getByTestId("accounting-funnel-first-result").waitFor();
  await page.getByTestId("accounting-funnel-expert-signup").click();
  await page.waitForURL("**/signup/company**", { timeout: 30_000 });
}

async function runViewport(page, width, height, label) {
  await page.setViewportSize({ width, height });
  for (const { path, q2Needle, stage2Needle } of scenarios) {
    await page.goto(`${base}${path}`, { waitUntil: "domcontentloaded", timeout: 90_000 }).catch(async () => {
      await page.goto(`${base}${path}`, { waitUntil: "load", timeout: 90_000 });
    });
    await page.waitForURL(`**${path}`, { timeout: 90_000 });
    await page.getByTestId("accounting-funnel-unavailable").waitFor({ state: "hidden", timeout: 90_000 }).catch(() => {});
    await page.getByTestId("accounting-funnel-active").waitFor({ timeout: 90_000 });
    const prefix = path.includes("invoice") ? "invoice" : path.includes("corp") ? "corp" : "vat";
    const qBox = page.locator('[data-testid="accounting-funnel-questions"]');
    await qBox.locator(`[data-question-id="${prefix}_s1_q1"]`).waitFor({ timeout: 15_000 });
    await qBox.locator(`[data-question-id="${prefix}_s1_q1"]`).locator("button").first().click();
    const q2Id = `${prefix}_s1_q2`;
    await qBox.locator(`[data-question-id="${q2Id}"]`).waitFor({ timeout: 15_000 });
    await qBox.locator(`[data-question-id="${q2Id}"]`).locator("button").filter({ hasText: q2Needle }).click();
    const q3Id = `${prefix}_s1_q3`;
    await qBox.locator(`[data-question-id="${q3Id}"]`).waitFor({ timeout: 15_000 });
    await qBox.locator(`[data-question-id="${q3Id}"]`).locator("button").first().click();
    let sawBranch = false;
    for (let i = 0; i < 10; i++) {
      if (await page.getByRole("heading", { name: stage2Needle }).isVisible().catch(() => false)) {
        sawBranch = true;
      }
      const btn = page.locator('[data-testid="accounting-funnel-questions"] button').first();
      if (await btn.isVisible().catch(() => false)) await btn.click();
      else break;
    }
    assert(`${label} ${path} stage2 branch`, sawBranch);
    await finishFunnel(page);
    assert(`${label} ${path} expert signup link`, page.url().includes("/signup/company"));
  }
}

const browser = await chromium.launch();
const page = await browser.newPage();
try {
  await runViewport(page, 1280, 800, "desktop");
  await runViewport(page, 375, 812, "mobile");
} finally {
  await browser.close();
}

process.exit(fail > 0 ? 1 : 0);
