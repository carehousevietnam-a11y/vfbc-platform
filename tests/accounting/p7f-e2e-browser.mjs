/**
 * P7f — funnel → company signup → login → pending workspace (desktop + mobile).
 * Requires: local Supabase + Next on 3020 (node tests/accounting/p3c-local-next.mjs).
 */
import { execSync } from "child_process";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const base = process.env.P7F_BASE || process.env.P7E_BASE || process.env.P7A_BASE || "http://localhost:3020";
const funnelPath = "/verify/accounting/vat-filing-check";
const password = "Test-P7f-E2e-1!Aa";

function parseEnv(stdout) {
  const out = {};
  for (const line of stdout.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return out;
}

async function assertDevServer() {
  const res = await fetch(base, { method: "GET" }).catch(() => null);
  if (!res || !res.ok) {
    console.error(
      `P7F_DEV_SERVER_DOWN: start Next on ${base} (e.g. node tests/accounting/p3c-local-next.mjs)`,
    );
    process.exit(2);
  }
}

const createdEmails = [];

let fail = 0;
let diagnosis = "";

function assert(name, ok) {
  if (!ok) {
    console.error(`FAIL ${name}`);
    fail += 1;
  } else console.log(`PASS ${name}`);
}

async function answerVatFunnel(page) {
  await page.goto(`${base}${funnelPath}`, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.getByTestId("accounting-funnel-active").waitFor({ timeout: 90_000 });
  const qBox = page.locator('[data-testid="accounting-funnel-questions"]');
  const q1 = qBox.locator('[data-question-id="vat_s1_q1"]').locator("button").first();
  const nextStep = page.locator('[data-question-id="vat_s1_q2"], [data-testid="accounting-funnel-documents"]');
  for (let attempt = 0; attempt < 5; attempt++) {
    if (await nextStep.first().isVisible().catch(() => false)) break;
    if (await q1.isVisible().catch(() => false)) await q1.click();
    await page.waitForTimeout(400);
  }
  await nextStep.first().waitFor({ timeout: 60_000 });
  if (await qBox.locator('[data-question-id="vat_s1_q2"]').isVisible().catch(() => false)) {
    await qBox.locator('[data-question-id="vat_s1_q2"]').locator("button").filter({ hasText: "늦어진 적" }).click();
  }
  await page
    .locator('[data-question-id="vat_s1_q3"], [data-testid="accounting-funnel-documents"]')
    .first()
    .waitFor({ timeout: 60_000 });
  if (await qBox.locator('[data-question-id="vat_s1_q3"]').isVisible().catch(() => false)) {
    await qBox.locator('[data-question-id="vat_s1_q3"]').locator("button").first().click();
  }
  let sawStage2 = false;
  for (let i = 0; i < 10; i++) {
    if (await page.getByRole("heading", { name: "늦어졌을 때" }).isVisible().catch(() => false)) {
      sawStage2 = true;
    }
    const btn = qBox.locator("button").first();
    if (await btn.isVisible().catch(() => false)) await btn.click();
    else break;
  }
  return sawStage2;
}

async function runSignupAndPending(page, label, captureDiagnosis) {
  const tag = `${label}-${Date.now()}`;
  const email = `p7f-e2e-${tag}@test.vfbcai.local`;
  const phone = `010${String(Date.now()).slice(-8)}`;
  createdEmails.push(email);

  const sawStage2 = await answerVatFunnel(page);
  assert(`${label} stage2 branch`, sawStage2);

  await page.getByText("첨부 없이 다음").click();
  await page.getByTestId("accounting-funnel-first-result").waitFor();
  await page.getByTestId("accounting-funnel-expert-signup").click();
  await page.waitForURL("**/signup/company**", { timeout: 30_000 });

  await page.getByRole("button", { name: "법인 운영 중" }).first().click();
  await page.getByPlaceholder('예비 창업자는 "미정"을 입력할 수 있습니다.').fill(`P7f E2E ${tag}`);
  await page.getByRole("button", { name: "대표" }).first().click();
  await page.getByPlaceholder("이름").fill("김테스트");
  await page.getByPlaceholder("전화번호").fill(phone);
  await page.getByPlaceholder("현재 거주지 주소").fill("Quan 1 Ho Chi Minh");
  await page.getByPlaceholder("이메일").fill(email);
  await page.getByPlaceholder("카카오톡 ID").fill(`kakao-${tag}`);
  await page.locator('input[type="password"]').first().fill(password);
  await page.locator('input[type="password"]').nth(1).fill(password);
  await page.locator('input[type="checkbox"]').check();

  const signupResponse = page.waitForResponse(
    (r) => r.url().includes("/api/company-member-signup") && r.request().method() === "POST",
    { timeout: 90_000 },
  );
  await page.getByRole("button", { name: "기업회원 가입하기" }).click();
  const res = await signupResponse;
  const status = res.status();
  const body = await res.json().catch(() => ({}));
  const errField = typeof body.field === "string" ? body.field : "";
  const errCode = typeof body.error === "string" ? body.error : "";

  if (captureDiagnosis && !diagnosis) {
    if (status >= 400) {
      diagnosis = `(b) 가입 API 오류 HTTP ${status} error=${errCode} field=${errField}`;
    } else if (status < 300 && body.prospective) {
      diagnosis = `(c) 성공 응답이 prospective 리다이렉트(운영 법인 아님)`;
    } else if (status < 300) {
      diagnosis = `(c) 가입 API 성공 — UI는 data-testid 대기`;
    }
  }

  if (status >= 400) {
    const formErr = await page.locator(".text-red-600, .text-xs.text-red-600").first().textContent().catch(() => "");
    if (captureDiagnosis && formErr && !diagnosis.startsWith("(a)")) {
      diagnosis = `(a) 폼 검증 또는 API 실패 field=${errField}`;
    }
    assert(`${label} signup api`, false, `status=${status}`);
    return;
  }

  await page.getByTestId("company-member-signup-done").waitFor({ timeout: 60_000 });

  const st = parseEnv(execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8" }));
  const authClient = createClient(st.API_URL, st.ANON_KEY, { auth: { persistSession: false } });
  const { data: signInData, error: signInError } = await authClient.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError || !signInData.session) {
    if (captureDiagnosis && !diagnosis) {
      diagnosis = `(b) 가입 후 signInWithPassword 실패`;
    }
    assert(`${label} auth session`, false);
    return;
  }
  const storageKey = `sb-${new URL(st.API_URL).hostname.split(".")[0]}-auth-token`;
  await page.goto(`${base}/login`, { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ({ key, session }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_in: session.expires_in,
          expires_at: session.expires_at,
          token_type: session.token_type,
          user: session.user,
        }),
      );
    },
    { key: storageKey, session: signInData.session },
  );
  await page.goto(`${base}/company/accounting/transactions`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("accounting-workspace-pending-approval").waitFor({ timeout: 60_000 });
  assert(
    `${label} pending workspace`,
    await page.getByTestId("accounting-workspace-pending-approval").isVisible(),
  );
}

async function cleanupTestUsers() {
  const st = parseEnv(execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8" }));
  const service = createClient(st.API_URL, st.SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  for (const email of createdEmails) {
    const { data } = await service.auth.admin.listUsers({ page: 1, perPage: 200 });
    const user = data?.users?.find((u) => u.email === email);
    if (user) {
      await service.from("users").delete().eq("id", user.id);
      await service.auth.admin.deleteUser(user.id);
    }
  }
}

await assertDevServer();
execSync("npx supabase db push --local", { cwd: repoRoot, stdio: "pipe" });

const browser = await chromium.launch();
try {
  for (const { w, h, label, capture } of [
    { w: 1280, h: 800, label: "desktop", capture: true },
    { w: 375, h: 812, label: "mobile", capture: false },
  ]) {
    const context = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await context.newPage();
    await runSignupAndPending(page, label, capture);
    await context.close();
  }
} finally {
  await browser.close();
  await cleanupTestUsers().catch(() => {});
}

if (diagnosis) console.log(`P7F_DIAGNOSIS ${diagnosis}`);
process.exit(fail > 0 ? 1 : 0);
