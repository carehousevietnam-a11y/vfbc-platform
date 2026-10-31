/**
 * P7-2a A1 — company onboarding form (no API bypass), PC + 375, ko + vi.
 */
import { execSync } from "node:child_process";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const base = process.env.P72A_FORM_BASE || "http://localhost:3020";
const repoRoot = process.cwd();
const password = "Vfbcai-LocalDev-Accounting-2026!";

function env() {
  const out = {};
  for (const line of execSync("npx supabase status -o env", {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  }).split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return out;
}

const st = env();
const storageKey = `sb-${new URL(st.API_URL).hostname.split(".")[0]}-auth-token`;
let fail = 0;
function assert(n, ok) {
  if (!ok) {
    fail++;
    console.error(`FAIL ${n}`);
  } else console.log(`PASS ${n}`);
}

async function signIn(email) {
  const anon = createClient(st.API_URL, st.ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw error ?? new Error("signIn");
  return data.session;
}

async function runCase(viewport, locale, label) {
  const svc = createClient(st.API_URL, st.SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const email = `p72a-form-${label}-${Date.now()}@test.vfbcai.local`;
  const { data: created } = await svc.auth.admin.createUser({ email, password, email_confirm: true });
  const uid = created.user.id;
  await svc.from("users").insert({ id: uid, email, member_type: "company", password_set: true });
  const session = await signIn(email);

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport });
  await context.addCookies([{ name: "vfbcai_locale", value: locale, url: base }]);
  await context.addInitScript(
    (payload) => localStorage.setItem(payload.key, payload.raw),
    { key: storageKey, raw: JSON.stringify(session) },
  );
  const page = await context.newPage();
  await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
  await page.goto(`${base}/company/accounting/company`, { waitUntil: "networkidle" });

  const onboard = page.getByTestId("accounting-company-onboarding");
  await onboard.waitFor({ timeout: 60_000 });

  await onboard.getByTestId("accounting-onboard-category-operating").locator("button").click();
  await onboard.getByTestId("accounting-onboard-category-operating").locator('button[aria-pressed="true"]').waitFor({
    timeout: 10_000,
  });
  await onboard.getByTestId("accounting-onboard-company-name").fill("Form E2E Co");
  await onboard.getByTestId("accounting-onboard-position-ceo").locator("button").click();
  await onboard.getByTestId("accounting-onboard-position-ceo").locator('button[aria-pressed="true"]').waitFor({
    timeout: 10_000,
  });
  await onboard.getByTestId("accounting-onboard-submit").waitFor({ state: "visible", timeout: 10_000 });
  const enabled = await onboard.getByTestId("accounting-onboard-submit").isEnabled();
  assert(`${label} submit_enabled`, enabled);
  if (!enabled) {
    await browser.close();
    return;
  }
  await onboard.getByTestId("accounting-onboard-submit").click();
  await page.waitForURL("**/company/accounting/pending**", { timeout: 60_000 });
  assert(`${label} operating_to_pending`, page.url().includes("/pending"));

  for (const seg of ["vat-filing-check"]) {
    await page.goto(`${base}/verify/accounting/${seg}`, { waitUntil: "domcontentloaded" });
    await page.getByTestId(`accounting-funnel-locale-${locale}`).click();
    await page.getByTestId("accounting-funnel-unavailable").waitFor({ timeout: 30_000 });
    const txt = await page.getByTestId("accounting-funnel-unavailable").innerText();
    assert(`${label} funnel_unavailable`, locale === "ko" ? txt.includes("준비") : txt.toLowerCase().includes("chuẩn"));
  }

  const prosEmail = `p72a-pros-form-${label}-${Date.now()}@test.vfbcai.local`;
  const { data: pros } = await svc.auth.admin.createUser({ email: prosEmail, password, email_confirm: true });
  const puid = pros.user.id;
  await svc.from("users").insert({ id: puid, email: prosEmail, member_type: "company", password_set: true });
  const prosSession = await signIn(prosEmail);
  await context.addInitScript(
    (payload) => localStorage.setItem(payload.key, payload.raw),
    { key: storageKey, raw: JSON.stringify(prosSession) },
  );
  await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
  await page.goto(`${base}/company/accounting/company`, { waitUntil: "networkidle" });
  const prosForm = page.getByTestId("accounting-company-onboarding");
  await prosForm.getByTestId("accounting-onboard-category-prospective").locator("button").click();
  await prosForm.getByTestId("accounting-onboard-position-ceo").locator("button").click();
  await prosForm.getByTestId("accounting-onboard-submit").click();
  await page.waitForURL((url) => /\/register\/company|\/verify\/company/.test(url.pathname), { timeout: 60_000 });
  const { count } = await svc.from("accounting_org_members").select("org_id", { count: "exact", head: true }).eq("user_id", puid);
  assert(`${label} prospective_no_org`, (count ?? 0) === 0);

  await svc.from("accounting_company_signup_profiles").delete().eq("user_id", uid);
  await svc.from("accounting_org_members").delete().eq("user_id", uid);
  await svc.from("accounting_company_signup_profiles").delete().eq("user_id", puid);
  await svc.auth.admin.deleteUser(uid);
  await svc.auth.admin.deleteUser(puid);
  await browser.close();
}

await runCase({ width: 1280, height: 800 }, "ko", "desktop_ko");
await runCase({ width: 375, height: 812 }, "ko", "mobile_ko");
await runCase({ width: 1280, height: 800 }, "vi", "desktop_vi");
await runCase({ width: 375, height: 812 }, "vi", "mobile_vi");
process.exit(fail > 0 ? 1 : 0);
