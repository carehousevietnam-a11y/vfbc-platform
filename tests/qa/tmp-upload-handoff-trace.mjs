/**
 * TEMP — MEMBER_UPLOAD_HANDOFF_PAGE_FIX_ONLY Step 1 trace (delete after Mission)
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const BASE = process.env.QA_BASE_URL || "http://localhost:3010";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(__dirname, "fixtures", "qa-sample-contract.pdf");

async function captureDomState(page) {
  return page.evaluate(() => {
    const body = document.body.innerText.replace(/\s+/g, " ").trim();
    const purposes = [...document.querySelectorAll("[data-purpose]")].map(
      (el) => el.getAttribute("data-purpose"),
    );
    return {
      url: location.href,
      pathname: location.pathname,
      hasQuotationReport: body.includes("QUOTATION REPORT"),
      hasReviewTitle: /리뷰 확인서/.test(body),
      hasLoadingText: body.includes("제출하신 자료를 확인하고"),
      hasWaitText: body.includes("잠시만 기다려 주세요"),
      hasQuestionCheck: body.includes("1. 검토 내용 체크"),
      hasFirstResult: /1차 종합 결과|1차 진단 결과/.test(body),
      hasSignup: !!document.querySelector('input[name="name"]'),
      dataPurposes: purposes,
      headerSnippet: body.slice(0, 280),
    };
  });
}

async function pollTransition(page, label, ms = 12000, stepMs = 300) {
  const samples = [];
  const steps = Math.ceil(ms / stepMs);
  for (let i = 0; i < steps; i++) {
    samples.push({ t: i * stepMs, ...(await captureDomState(page)) });
    await page.waitForTimeout(stepMs);
  }
  console.log(`\n=== ${label} ===`);
  console.log(JSON.stringify(samples, null, 2));
  return samples;
}

async function clickChoice(page, text) {
  await page.getByRole("button", { name: text }).first().click();
  await page.waitForTimeout(500);
}

async function guestSignupOnce(page, email) {
  await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await clickChoice(page, /서명·납부 전/);
  await clickChoice(page, /매물만 보고/);
  await clickChoice(page, /전세·월세/);
  await clickChoice(page, /집주인·매도인/);
  await clickChoice(page, /제출·계약 요건/);
  await page.getByRole("button", { name: /자료 없이/ }).click();
  await page.locator('input[name="name"]').waitFor({ state: "visible", timeout: 30000 });
  await page.locator('input[name="name"]').fill("Upload Handoff QA");
  await page.locator('input[name="phone"]').fill("0909999001");
  await page.locator('input[name="address"]').fill("Quan 7");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="kakao_id"]').fill("handoffqa");
  await page.locator('input[name="agreeTerms"]').check();
  await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  await page.waitForTimeout(2000);
}

async function traceReMemberUploadHandoff(page) {
  const email = `upload-handoff-re-${Date.now()}@test.vfbcai.local`;
  await guestSignupOnce(page, email);

  await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await clickChoice(page, /서명·납부 전/);
  await clickChoice(page, /매물만 보고/);
  await clickChoice(page, /전세·월세/);
  await clickChoice(page, /집주인·매도인/);
  await clickChoice(page, /제출·계약 요건/);

  await page.locator('input[type="file"]').first().setInputFiles(FIXTURE);
  await page.getByRole("button", { name: /자료 포함하고 계속하기/ }).click();

  return pollTransition(page, "RE member upload → handoff → FIRST_RESULT", 15000);
}

async function traceAdminMemberHandoff(page) {
  const email = `upload-handoff-adm-${Date.now()}@test.vfbcai.local`;
  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Phase1 once as guest to establish session
  for (let i = 0; i < 6; i++) {
    const body = await page.locator("body").innerText();
    if (/1차 종합 결과|1차 진단 결과/.test(body)) break;
    if ((await page.locator('input[name="name"]').count()) > 0) break;
    const btn = page.locator("main button").filter({ hasNotText: /홈|Home|다음|계속|자료/ }).first();
    if (!(await btn.isVisible().catch(() => false))) break;
    await btn.click();
    await page.waitForTimeout(600);
  }
  if (await page.locator('input[name="name"]').isVisible().catch(() => false)) {
    await page.locator('input[name="name"]').fill("Admin Handoff QA");
    await page.locator('input[name="phone"]').fill("0909999002");
    await page.locator('input[name="address"]').fill("Quan 7");
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="kakao_id"]').fill("admhandoff");
    await page.locator('input[name="agreeTerms"]').check();
    await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
    await page.waitForTimeout(2000);
  }

  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  for (let i = 0; i < 6; i++) {
    const body = await page.locator("body").innerText();
    if (/1차 종합 결과|1차 진단 결과/.test(body)) break;
    const btn = page.locator("main button").filter({ hasNotText: /홈|Home|다음|계속|자료/ }).first();
    if (!(await btn.isVisible().catch(() => false))) break;
    await btn.click();
    await page.waitForTimeout(600);
  }

  return pollTransition(page, "Admin member Phase1 → handoff → FIRST_RESULT", 12000);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const rePage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const reSamples = await traceReMemberUploadHandoff(rePage);
    const adminPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const adminSamples = await traceAdminMemberHandoff(adminPage);

    const reShell = reSamples.filter(
      (s) => s.hasQuotationReport && s.hasReviewTitle && !s.hasFirstResult && !s.hasSignup,
    );
    const adminShell = adminSamples.filter(
      (s) => s.hasQuotationReport && s.hasReviewTitle && !s.hasFirstResult && !s.hasSignup,
    );
    console.log("\n=== SUMMARY ===");
    console.log(
      JSON.stringify(
        {
          reEmptyQuotationShellSamples: reShell.length,
          adminEmptyQuotationShellSamples: adminShell.length,
          reFirstSampleWithShell: reShell[0] ?? null,
          adminFirstSampleWithShell: adminShell[0] ?? null,
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
