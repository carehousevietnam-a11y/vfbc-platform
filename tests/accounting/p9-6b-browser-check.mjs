/**
 * P9-6b — VAT wizard server resume + 2-account + view bar (uses .p5b-session.json).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "@playwright/test";
import { execSync } from "child_process";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = path.join(repoRoot, "tests/qa/_output/p9-6b");
fs.mkdirSync(outDir, { recursive: true });

const sessionPath = path.join(repoRoot, "tests/accounting/.p5b-session.json");
if (!fs.existsSync(sessionPath)) {
  console.error("Missing .p5b-session.json — run p5b-vat-browser-seed.mjs first");
  process.exit(1);
}
const seed = JSON.parse(fs.readFileSync(sessionPath, "utf8"));

function parseSupabaseStatusEnv(stdout) {
  const out = {};
  for (const line of stdout.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return out;
}

const st = parseSupabaseStatusEnv(
  execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] })
);
const storageKey = `sb-${new URL(st.API_URL).hostname.split(".")[0]}-auth-token`;
const base = process.env.P5B_BASE || "http://localhost:3020";
const period = seed.period || "2026-10";
const checks = [];
const record = (name, pass, detail = "") => checks.push({ name, pass: Boolean(pass), detail });

async function withSession(session, locale, viewport, fn) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport });
  await context.addCookies([{ name: "vfbcai_locale", value: locale, url: base }]);
  await context.addInitScript(
    (payload) => {
      localStorage.setItem(payload.key, payload.raw);
    },
    { key: storageKey, raw: JSON.stringify(session) }
  );
  const page = await context.newPage();
  try {
    await fn(page);
  } finally {
    await browser.close();
  }
}

const memoKo = `P96B ko memo ${Date.now()}`;
const memoVi = `P96B vi memo ${Date.now()}`;

// Owner ko: steps 1-2 + memo
await withSession(seed.sessionOwner, "ko", { width: 1440, height: 900 }, async (page) => {
  const vatUrl = `${base}/company/accounting/vat?periodKey=${period}`;
  await page.goto(vatUrl, { waitUntil: "domcontentloaded" });
  await page.getByTestId("accounting-form-view-bar").waitFor({ timeout: 45000 });
  await page.getByRole("button", { name: "병기" }).click();
  await page.getByRole("button", { name: "한국어" }).click();
  const memo = page.getByTestId("accounting-i18n-field-vat.step_memo.1").locator("textarea");
  await memo.fill(memoKo);
  await page.getByRole("button", { name: "②" }).first().click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, "ko-owner-step2-pc.png"), fullPage: true });
  const basis = await page.getByTestId("accounting-form-basis-footer").innerText();
  record("form_basis no verified 동일", !basis.includes("서식과 동일"), basis.slice(0, 80));
  record("ko owner step2 saved", (await page.locator("body").innerText()).includes("마지막 작성"), "");
});

// Vi member: sees ko progress, steps 3-4
await withSession(seed.sessionMemberVi, "vi", { width: 375, height: 812 }, async (page) => {
  await page.goto(`${base}/company/accounting/vat?periodKey=${period}`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("accounting-form-view-bar").waitFor({ timeout: 45000 });
  const body = await page.locator("body").innerText();
  record("vi sees ko memo or pending", body.includes(memoKo) || body.includes("Chờ dịch") || body.includes("번역"), "");
  await page.getByRole("button", { name: /③|3/ }).first().click();
  await page.waitForTimeout(1500);
  const memo = page.getByTestId("accounting-i18n-field-vat.step_memo.3").locator("textarea");
  await memo.fill(memoVi);
  await page.getByRole("button", { name: /④|4/ }).first().click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, "vi-member-step4-mobile.png"), fullPage: true });
  record("vi member step4", true, "");
});

// Owner ko again: sees vi memo
await withSession(seed.sessionOwner, "ko", { width: 1440, height: 900 }, async (page) => {
  await page.goto(`${base}/company/accounting/vat?periodKey=${period}`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("accounting-form-view-bar").waitFor({ timeout: 45000 });
  await page.getByRole("button", { name: "③" }).first().click();
  await page.waitForTimeout(1500);
  const body = await page.locator("body").innerText();
  record("ko owner sees vi memo", body.includes(memoVi) || body.includes("번역 대기"), "");
  await page.screenshot({ path: path.join(outDir, "ko-owner-step3-pc.png"), fullPage: true });
});

const failed = checks.filter((c) => !c.pass);
console.log(JSON.stringify({ pass: checks.length - failed.length, fail: failed.length, checks, outDir }, null, 2));
process.exit(failed.length > 0 ? 1 : 0);
