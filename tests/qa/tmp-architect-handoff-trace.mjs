/**
 * TEMP — delete after MASTER-HANDOFF-LOADING-CROSS-DOMAIN-ROOT-CAUSE Mission
 */
import { chromium } from "playwright";

const BASE = process.env.QA_BASE_URL || "http://localhost:3010";

async function pollState(page, label, ms = 10000) {
  const samples = [];
  const steps = Math.ceil(ms / 500);
  for (let i = 0; i < steps; i++) {
    const body = await page.locator("body").innerText();
    samples.push({
      t: i * 500,
      loading: body.includes("제출하신 자료를 확인하고"),
      firstResult: /1차 종합 결과|1차 진단 결과/.test(body),
      signup: (await page.locator('input[name="name"]').count()) > 0,
      question: body.includes("1. 검토 내용 체크"),
      error: /접수 중 문제|접수 처리 중/.test(body),
      handoffEl: (await page.locator('[data-purpose="re-phase1-member-handoff"]').count()) > 0,
      bodySnippet: body.replace(/\s+/g, " ").slice(0, 120),
    });
    await page.waitForTimeout(500);
  }
  console.log(`\n=== ${label} ===`);
  console.log(JSON.stringify(samples, null, 2));
  return samples[samples.length - 1];
}

async function clickFirstGridChoice(page) {
  const btn = page.locator("main button, [data-screen01-content] button").filter({ hasNotText: /홈|Home|다음 단계|계속|자료/ }).first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(700);
    return true;
  }
  return false;
}

async function runAdminMemberHandoff(page, mockLead403 = false) {
  if (mockLead403) {
    await page.route("**/rest/v1/leads**", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 403,
          contentType: "application/json",
          body: JSON.stringify({ code: "42501", message: "rls" }),
        });
        return;
      }
      await route.continue();
    });
  }

  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const memberAtStart = (await page.locator('input[name="name"]').count()) === 0;
  console.log(`Admin member at start: ${memberAtStart}`);

  // Answer phase1 questions until handoff/result/signup
  for (let i = 0; i < 8; i++) {
    const body = await page.locator("body").innerText();
    if (/1차 종합 결과|1차 진단 결과/.test(body)) break;
    if (body.includes("제출하신 자료를 확인하고")) break;
    if ((await page.locator('input[name="name"]').count()) > 0 && !memberAtStart) break;
    const clicked = await clickFirstGridChoice(page);
    if (!clicked) break;
  }

  return pollState(page, mockLead403 ? "Admin member + leads403" : "Admin member handoff", 10000);
}

async function runReMemberHangSimulation(page) {
  // Abort leads POST to simulate hang-like stuck submitting (never resolves success path)
  await page.route("**/rest/v1/leads**", async (route) => {
    if (route.request().method() === "POST") {
      await new Promise((r) => setTimeout(r, 600_000));
      await route.continue();
    } else {
      await route.continue();
    }
  });

  await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  if ((await page.locator('input[name="name"]').count()) > 0) {
    console.log("RE hang sim SKIP — need member session");
    return;
  }
  const choices = [/서명·납부 전/, /매물만 보고/, /전세·월세/, /집주인·매도인/, /제출·계약 요건/];
  for (const c of choices) {
    await page.getByRole("button", { name: c }).first().click();
    await page.waitForTimeout(500);
  }
  await page.locator('input[type="file"]').first().setInputFiles("tests/qa/fixtures/qa-sample-contract.pdf");
  await page.getByRole("button", { name: /자료 포함하고 계속하기/ }).click();
  const last = await pollState(page, "RE member leads POST delayed (8s window)", 8000);
  console.log(`RE hang sim: loading persisted=${last.loading && last.handoffEl}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  try {
    await runAdminMemberHandoff(page, false);
    await runAdminMemberHandoff(await browser.newPage({ viewport: { width: 1280, height: 900 } }), true);
    await runReMemberHangSimulation(await browser.newPage({ viewport: { width: 1280, height: 900 } }));
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
