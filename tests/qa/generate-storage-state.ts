/**
 * One-shot storageState generator for known QA accounts.
 * Run manually (not every QA):
 *   npx playwright test tests/qa/generate-storage-state.ts --project=desktop
 *
 * 1차 구현: tamtru only.
 * TODO: wp / trc / driving-license
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
      `service=${service} is not implemented yet (TODO: wp / trc / driving-license)`
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
