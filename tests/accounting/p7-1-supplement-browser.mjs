/**
 * P7-1 supplement browser QA — local 3020 + dev sessions.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { execSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const base = process.env.P71_BASE || "http://localhost:3020";
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const storageKey = "sb-127-auth-token";

let fail = 0;
function assert(name, ok) {
  if (!ok) {
    console.error(`FAIL ${name}`);
    fail += 1;
  } else console.log(`PASS ${name}`);
}

function parseSt() {
  const st = {};
  for (const line of execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8" }).split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) st[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return st;
}

async function sessionFor(email, password) {
  const st = parseSt();
  const anon = createClient(st.API_URL, st.ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw error ?? new Error("sign in failed");
  return data.session;
}

async function inject(page, session) {
  await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ({ storageKey, session }) => {
      localStorage.setItem(storageKey, JSON.stringify(session));
    },
    { storageKey, session },
  );
}

async function runViewport(page, w, h, label) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(`${base}/company/accounting`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("accounting-funnel-entry-links").waitFor({ timeout: 60_000 });
  assert(`${label} entry_links`, (await page.getByTestId("accounting-funnel-entry-link-vat_filing_check").count()) === 1);
  assert(`${label} entry_count_3`, (await page.locator("[data-testid^=accounting-funnel-entry-link-]").count()) === 3);

  for (const seg of ["vat-filing-check", "invoice-processing-check", "corp-tax-closing-check"]) {
    await page.goto(`${base}/verify/accounting/${seg}`, { waitUntil: "domcontentloaded" });
    await page.getByTestId("accounting-funnel-locale-ko").click();
    await page.getByTestId("accounting-funnel-unavailable").waitFor({ timeout: 60_000 });
    const ko = await page.getByTestId("accounting-funnel-unavailable").innerText();
    assert(`${label} unavailable_ko_${seg}`, ko.includes("준비"));
    await page.getByTestId("accounting-funnel-locale-vi").click();
    const vi = await page.getByTestId("accounting-funnel-unavailable").innerText();
    assert(`${label} unavailable_vi_${seg}`, vi.includes("chuẩn bị") || vi.includes("Chuẩn"));
  }

  await page.goto(`${base}/company/accounting`, { waitUntil: "domcontentloaded" });
  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${base}/company/accounting`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("accounting-funnel-expert-signed-out").waitFor({ timeout: 30_000 });
  const href = await page.getByTestId("accounting-funnel-expert-signup").getAttribute("href");
  assert(`${label} anon_signup_href`, Boolean(href?.includes("/signup/company")));
  assert(`${label} no_payment`, !(href ?? "").includes("/pay"));

  const cfg = JSON.parse(fs.readFileSync(path.join(repoRoot, "src/lib/accounting/dev-local-login.config.json"), "utf8"));
  const personalEmail = "dev-personal@test.vfbcai.local";
  const st = parseSt();
  const svc = createClient(st.API_URL, st.SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data: created } = await svc.auth.admin.createUser({
    email: personalEmail,
    password: cfg.password,
    email_confirm: true,
  }).catch(() => ({ data: null }));
  let personalId = created?.user?.id;
  if (!personalId) {
    const { data: list } = await svc.auth.admin.listUsers({ perPage: 200 });
    personalId = list?.users?.find((u) => u.email === personalEmail)?.id;
  }
  await svc.from("users").upsert(
    { id: personalId, email: personalEmail, member_type: "personal", password_set: true },
    { onConflict: "id" },
  );
  const personalSession = await sessionFor(personalEmail, cfg.password);
  await inject(page, personalSession);
  await page.goto(`${base}/company/accounting`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("accounting-funnel-expert-personal").waitFor({ timeout: 30_000 });
  assert(`${label} personal_signup_cta`, (await page.getByTestId("accounting-funnel-expert-signup").count()) === 1);

  const companySession = await sessionFor(cfg.accounts.org_a_owner, cfg.password);
  await inject(page, companySession);
  await page.goto(`${base}/company/accounting`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("accounting-funnel-expert-company-connected").waitFor({ timeout: 30_000 });
  assert(`${label} company_workspace_link`, (await page.getByTestId("accounting-funnel-expert-workspace").count()) === 1);
}

const browser = await chromium.launch();
const page = await browser.newPage();
await runViewport(page, 1280, 800, "desktop");
await runViewport(page, 375, 812, "mobile");
await browser.close();
process.exit(fail > 0 ? 1 : 0);
