/**
 * P9-5b — profile nav + VAT period guard (owner PC/375, member nav hide).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "@playwright/test";
import { execSync } from "child_process";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const base = process.env.P9_BASE || "http://localhost:3020";
const outDir = path.join(repoRoot, "tests/qa/_output/p9-5b");
const config = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "src/lib/accounting/dev-local-login.config.json"), "utf8")
);
const seed = JSON.parse(fs.readFileSync(path.join(repoRoot, "tests/accounting/.p5c-session.json"), "utf8"));

function parseEnv(stdout) {
  const out = {};
  for (const line of stdout.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return out;
}

const st = parseEnv(
  execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] })
);
const storageKey = `sb-${new URL(st.API_URL).hostname.split(".")[0]}-auth-token`;

async function sessionForEmail(email) {
  const { createClient } = await import("@supabase/supabase-js");
  const anon = createClient(st.API_URL, st.ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await anon.auth.signInWithPassword({ email, password: config.password });
  if (error || !data.session) throw new Error(`signIn ${email}: ${error?.message}`);
  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    expires_in: data.session.expires_in,
    token_type: data.session.token_type,
    user: data.session.user,
  };
}

const checks = [];
const record = (name, pass, detail = "") => checks.push({ name, pass: Boolean(pass), detail });

fs.mkdirSync(outDir, { recursive: true });

async function withSession(session, viewport, fn) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport });
  await context.addCookies([{ name: "vfbcai_locale", value: "ko", url: base }]);
  await context.addInitScript(
    (p) => localStorage.setItem(p.key, p.raw),
    { key: storageKey, raw: JSON.stringify(session) }
  );
  const page = await context.newPage();
  try {
    await fn(page);
  } finally {
    await browser.close();
  }
}

const ownerSession = await sessionForEmail(config.accounts.org_a_owner);

await withSession(ownerSession, { width: 1440, height: 900 }, async (page) => {
  await page.goto(`${base}/company/accounting`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("accounting-home-hub").waitFor({ timeout: 45000 });
  await page.getByTestId("accounting-nav-link-company").waitFor({ state: "visible", timeout: 15000 });
  await page.getByTestId("accounting-nav-link-company").click();
  await page.waitForURL(/\/profile/, { timeout: 20000 });
  await page.getByTestId("accounting-company-profile").waitFor({ timeout: 15000 });
  record("owner_nav_profile_pc", page.url().includes("/profile"), page.url());
  await page.screenshot({ path: path.join(outDir, "owner-profile-nav-pc.png"), fullPage: true });

  await page.goto(`${base}/company/accounting`, { waitUntil: "domcontentloaded" });
  await page
    .locator('[data-testid="accounting-home-hub-shortcut-settings"][href*="/profile"]')
    .waitFor({ state: "visible", timeout: 15000 });
  await page.getByTestId("accounting-home-hub-shortcut-settings").click();
  await page.waitForURL(/\/profile/, { timeout: 20000 });
  record("owner_hub_settings_profile_pc", page.url().includes("/profile"), page.url());
  await page.screenshot({ path: path.join(outDir, "owner-profile-settings-pc.png"), fullPage: true });

  await page.goto(`${base}/company/accounting/vat`, { waitUntil: "domcontentloaded" });
  await page.locator('input').first().waitFor({ timeout: 20000 });
  await page.locator('input').first().fill("2026-06");
  await page.waitForTimeout(800);
  const guard = page.getByTestId("accounting-vat-period-guard");
  record("vat_guard_2026_06_pc", (await guard.count()) > 0, await guard.innerText().catch(() => ""));
  await page.screenshot({ path: path.join(outDir, "vat-guard-2026-06-pc.png"), fullPage: true });

  await page.locator('input').first().fill("2026-09");
  await page.waitForTimeout(800);
  record("vat_guard_2026_09_clear_pc", (await guard.count()) === 0, page.url());
});

await withSession(ownerSession, { width: 375, height: 812 }, async (page) => {
  await page.goto(`${base}/company/accounting`, { waitUntil: "domcontentloaded" });
  await page
    .locator('[data-testid="accounting-home-hub-shortcut-settings"][href*="/profile"]')
    .waitFor({ state: "visible", timeout: 15000 });
  await page.getByTestId("accounting-home-hub-shortcut-settings").click();
  await page.waitForURL(/\/profile/, { timeout: 20000 });
  record("owner_hub_settings_profile_375", page.url().includes("/profile"), page.url());
  await page.screenshot({ path: path.join(outDir, "owner-profile-settings-375.png"), fullPage: true });
});

await withSession(seed.sessionMember, { width: 1440, height: 900 }, async (page) => {
  await page.goto(`${base}/company/accounting`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  record(
    "member_company_nav_hidden",
    (await page.getByTestId("accounting-nav-link-company").count()) === 0,
    "company link"
  );
});

const failed = checks.filter((c) => !c.pass).length;
console.log(JSON.stringify({ pass: failed === 0, outDir, failed, checks }, null, 2));
process.exit(failed > 0 ? 1 : 0);
