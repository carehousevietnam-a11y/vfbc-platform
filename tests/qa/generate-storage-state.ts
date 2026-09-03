/**
 * One-shot storageState generator for known QA accounts.
 * Run manually (not every QA):
 *   npx playwright test tests/qa/generate-storage-state.ts --project=desktop
 *
 * 지원 서비스: tamtru, trc
 * TODO: wp / driving-license
 */
import fs from "fs";
import path from "path";
import { test, expect } from "@playwright/test";

function readArg(name: string, fallback: string): string {
  const flag = `--${name}=`;
  const fromArgv = process.argv.find((a) => a.startsWith(flag));
  if (fromArgv) return fromArgv.slice(flag.length);
  const envKey = `QA_${name.toUpperCase()}`;
  return process.env[envKey] ?? fallback;
}

function accountSlug(email: string): string {
  return email.split("@")[0] ?? "account";
}

test.describe.configure({ mode: "serial" });
test.setTimeout(180_000);

test("generate storage state (tamtru)", async ({ browser, baseURL }) => {
  const service = readArg("service", "tamtru");
  if (service !== "tamtru") {
    test.skip(
      true,
      `service=${service} is not tamtru — skipping tamtru test`
    );
    return;
  }

  const email = readArg(
    "email",
    "reentry-qa-tamtru-existing-20260903@test.vfbcai.local"
  );
  const name = readArg("name", "Reentry QA Tamtru");
  const phone = readArg("phone", "0902222002");
  const address = readArg("address", "Quan 3, TP.HCM");
  const kakao = readArg("kakao", "reentrytamtru001");

  const authDir = path.join(__dirname, ".auth");
  fs.mkdirSync(authDir, { recursive: true });
  const outPath = path.join(authDir, `${service}-${accountSlug(email)}.json`);

  // Explicit clean context (no inherited storageState)
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    baseURL: baseURL ?? "http://localhost:3010",
  });
  const page = await context.newPage();

  try {
    await page.goto("/check/tamtru?start=check", { waitUntil: "domcontentloaded" });

    // Q1 rejection — title only ("아니요")
    await page.getByRole("button", { name: "아니요", exact: true }).click();
    // Q2 housing
    await page.getByRole("button", { name: /개인주택/ }).click();
    // Q3 landlord issue — accessible name includes description text
    await page.getByRole("button", { name: /^아니요/ }).click();
    // Q4 timing
    await page.getByRole("button", { name: /12시간 이내/ }).click();

    // Signup form
    await page.locator('input[name="name"]').waitFor({ state: "visible", timeout: 30_000 });
    await page.locator('input[name="name"]').fill(name);
    await page.locator('input[name="phone"]').fill(phone);
    await page.locator('input[name="address"]').fill(address);
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="kakao_id"]').fill(kakao);
    await page.locator('input[name="agreeTerms"]').check();

    const submit = page.getByRole("button", { name: "AI 분석 리포트 무료로 받기" });
    await expect(submit).toBeEnabled({ timeout: 10_000 });
    await submit.click();

    // Session failure must not appear
    await expect(page.getByText("로그인 세션 생성에 실패했습니다")).toHaveCount(0);

    // Wait until signup submit is gone and a result CTA appears
    // (do NOT match the submit label "AI 분석 리포트 무료로 받기")
    await expect(submit).toBeHidden({ timeout: 60_000 });
    await expect(
      page
        .getByRole("button", { name: "전문가 진행 요청하기" })
        .or(page.getByRole("button", { name: "AI 리포트 요청하기" }))
        .first()
    ).toBeVisible({ timeout: 60_000 });

    await expect(page.getByText("로그인 세션 생성에 실패했습니다")).toHaveCount(0);

    // Prove browser session exists before snapshot
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: /님/ })).toBeVisible({
      timeout: 20_000,
    });

    await context.storageState({ path: outPath });
    // eslint-disable-next-line no-console
    console.log(`[qa] storageState saved: ${outPath}`);
  } finally {
    await context.close();
  }
});

test("generate storage state (trc)", async ({ browser, baseURL }) => {
  const service = readArg("service", "tamtru");
  if (service !== "trc") {
    test.skip(
      true,
      `service=${service} is not trc — skipping trc test`
    );
    return;
  }

  const email = readArg(
    "email",
    "reentry-qa-trc-20260903@test.vfbcai.local"
  );
  const name = readArg("name", "Reentry QA TRC");
  const phone = readArg("phone", "0903333003");
  const address = readArg("address", "Quan 1, TP.HCM");
  const kakao = readArg("kakao", "reentrytrc001");

  const authDir = path.join(__dirname, ".auth");
  fs.mkdirSync(authDir, { recursive: true });
  const outPath = path.join(authDir, `${service}-${accountSlug(email)}.json`);

  // Explicit clean context (no inherited storageState)
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    baseURL: baseURL ?? "http://localhost:3010",
  });
  const page = await context.newPage();

  try {
    // ?start=check → costEntryDone=true, Q1부터 직행
    await page.goto("/check/trc?start=check", { waitUntil: "domcontentloaded" });

    // Q1: 이전 거절·반려 여부 → 아니요 (exact: TRC 버튼 accessible name은 타이틀만)
    await page.getByRole("button", { name: "아니요", exact: true }).first().waitFor({ state: "visible", timeout: 30_000 });
    await page.getByRole("button", { name: "아니요", exact: true }).first().click();

    // Q2: 국적 → 대한민국
    await page.getByRole("button", { name: /대한민국/ }).first().waitFor({ state: "visible", timeout: 15_000 });
    await page.getByRole("button", { name: /대한민국/ }).first().click();

    // Q3: 비자 → 노동허가부 비자 (LD)
    await page.getByRole("button", { name: /노동허가부 비자/ }).first().waitFor({ state: "visible", timeout: 15_000 });
    await page.getByRole("button", { name: /노동허가부 비자/ }).first().click();

    // Q4: 직책 → 법인장 · 법정대표자
    await page.getByRole("button", { name: /법인장/ }).first().waitFor({ state: "visible", timeout: 15_000 });
    await page.getByRole("button", { name: /법인장/ }).first().click();

    // Q5: 회사형태 → 외국인투자법인 (FDI)
    await page.getByRole("button", { name: /외국인투자법인/ }).first().waitFor({ state: "visible", timeout: 15_000 });
    await page.getByRole("button", { name: /외국인투자법인/ }).first().click();

    // Signup form — wait for name input to appear
    await page.locator('input[name="name"]').waitFor({ state: "visible", timeout: 30_000 });
    await page.locator('input[name="name"]').fill(name);
    await page.locator('input[name="phone"]').fill(phone);
    await page.locator('input[name="address"]').fill(address);
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="kakao_id"]').fill(kakao);
    await page.locator('input[name="agreeTerms"]').check();

    const submit = page.getByRole("button", { name: "AI 분석 리포트 무료로 받기" });
    await expect(submit).toBeEnabled({ timeout: 10_000 });
    await submit.click();

    // Session failure must not appear
    await expect(page.getByText("로그인 세션 생성에 실패했습니다")).toHaveCount(0);

    // Wait until signup submit is gone and result CTAs appear
    await expect(submit).toBeHidden({ timeout: 60_000 });
    await expect(
      page
        .getByRole("button", { name: "전문가 진행 요청하기" })
        .or(page.getByRole("button", { name: "AI 리포트 요청하기" }))
        .first()
    ).toBeVisible({ timeout: 60_000 });

    await expect(page.getByText("로그인 세션 생성에 실패했습니다")).toHaveCount(0);

    // Prove browser session exists before snapshot
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: /님/ })).toBeVisible({
      timeout: 20_000,
    });

    await context.storageState({ path: outPath });
    // eslint-disable-next-line no-console
    console.log(`[qa] storageState saved: ${outPath}`);
  } finally {
    await context.close();
  }
});
