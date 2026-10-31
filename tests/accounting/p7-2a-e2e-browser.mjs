/**
 * P7-2a E2E — onboarding, pending gate, approved workspace, prospective.
 */
import { execSync } from "node:child_process";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const base = process.env.P72A_BASE || "http://localhost:3020";
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
async function postCompanyProfile(accessToken, body) {
  const res = await fetch(`${base}/api/accounting/company-profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(body),
  });
  return res;
}

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

async function withPage(viewport, fn) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport });
  await context.addCookies([{ name: "vfbcai_locale", value: "ko", url: base }]);
  const page = await context.newPage();
  try {
    await fn(page, context);
  } finally {
    await browser.close();
  }
}

async function injectSession(context, session) {
  await context.addInitScript(
    (payload) => {
      localStorage.setItem(payload.key, payload.raw);
    },
    { key: storageKey, raw: JSON.stringify(session) },
  );
}

async function runViewport(viewport, label) {
  const svc = createClient(st.API_URL, st.SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  await withPage(viewport, async (page, context) => {
    const onboardEmail = `p72a-onb-${label}-${Date.now()}@test.vfbcai.local`;
    const { data: created } = await svc.auth.admin.createUser({
      email: onboardEmail,
      password,
      email_confirm: true,
    });
    const uid = created.user.id;
    await svc.from("users").insert({ id: uid, email: onboardEmail, member_type: "company", password_set: true });
    const session = await signIn(onboardEmail);
    await injectSession(context, session);

    const profileRes = await postCompanyProfile(session.access_token, {
      companyCategory: "operating",
      companyName: "P72A E2E Co",
      jobPosition: "ceo",
      org_id: "00000000-0000-4000-8000-000000000099",
    });
    assert(`${label} onboarding_api_ok`, profileRes.ok);
    await page.goto(`${base}/company/accounting/pending`, { waitUntil: "domcontentloaded" });
    await page.getByTestId("accounting-workspace-pending-approval").waitFor({ timeout: 60_000 });
    assert(`${label} onboarding_to_pending`, page.url().includes("/pending"));

    await page.goto(`${base}/company/accounting/transactions`, { waitUntil: "domcontentloaded" });
    await page.waitForURL("**/company/accounting/pending**", { timeout: 60_000 });
    assert(`${label} pending_blocks_transactions_url`, !page.url().includes("/transactions"));

    const { data: mem } = await svc.from("accounting_org_members").select("org_id").eq("user_id", uid).maybeSingle();
    if (mem?.org_id) {
      await svc.from("accounting_organizations").update({ approval_status: "approved" }).eq("id", mem.org_id);
    }
    await page.goto(`${base}/company/accounting/transactions`, { waitUntil: "domcontentloaded" });
    await page.waitForURL("**/company/accounting/transactions**", { timeout: 60_000 });
    assert(`${label} approved_workspace`, page.url().includes("/transactions"));

    const prosEmail = `p72a-pros-${label}-${Date.now()}@test.vfbcai.local`;
    const { data: prosCreated } = await svc.auth.admin.createUser({
      email: prosEmail,
      password,
      email_confirm: true,
    });
    const puid = prosCreated.user.id;
    await svc.from("users").insert({ id: puid, email: prosEmail, member_type: "company", password_set: true });
    const prosSession = await signIn(prosEmail);
    await injectSession(context, prosSession);
    const prosRes = await postCompanyProfile(prosSession.access_token, {
      companyCategory: "prospective",
      companyName: "미정",
      jobPosition: "ceo",
    });
    assert(`${label} prospective_api_ok`, prosRes.ok);
    await injectSession(context, prosSession);
    await page.goto(`${base}/company/accounting/transactions`, { waitUntil: "domcontentloaded" });
    await page.waitForURL((url) => !url.pathname.includes("/transactions"), { timeout: 60_000 });
    const { count } = await svc
      .from("accounting_org_members")
      .select("org_id", { count: "exact", head: true })
      .eq("user_id", puid);
    assert(`${label} prospective_no_org`, (count ?? 0) === 0);
    assert(
      `${label} prospective_guide_redirect`,
      /\/register\/company|\/verify\/company/.test(page.url()),
    );

    await svc.from("accounting_company_signup_profiles").delete().eq("user_id", uid);
    await svc.from("accounting_company_signup_profiles").delete().eq("user_id", puid);
    await svc.from("accounting_org_members").delete().eq("user_id", uid);
    await svc.from("accounting_org_members").delete().eq("user_id", puid);
    if (mem?.org_id) await svc.from("accounting_organizations").delete().eq("id", mem.org_id);
    await svc.from("users").delete().in("id", [uid, puid]);
    await svc.auth.admin.deleteUser(uid);
    await svc.auth.admin.deleteUser(puid);

    for (const seg of ["vat-filing-check"]) {
      await page.goto(`${base}/verify/accounting/${seg}`, { waitUntil: "domcontentloaded" });
      await page.getByTestId("accounting-funnel-locale-ko").click();
      const unavailable = page.getByTestId("accounting-funnel-unavailable");
      await unavailable.waitFor({ timeout: 30_000 });
      const ko = await unavailable.innerText();
      assert(`${label} funnel_ko_unavailable`, ko.includes("준비"));
      await page.getByTestId("accounting-funnel-locale-vi").click();
      const vi = await unavailable.innerText();
      assert(`${label} funnel_vi_unavailable`, vi.toLowerCase().includes("chuẩn") || vi.includes("chuẩn bị"));
    }
  });
}

try {
  const ping = await fetch(base, { signal: AbortSignal.timeout(8000) });
  assert("dev_server_up", ping.ok || ping.status < 500);
} catch {
  assert("dev_server_up", false);
  process.exit(1);
}

await runViewport({ width: 1280, height: 800 }, "desktop");
await runViewport({ width: 375, height: 812 }, "mobile");
process.exit(fail > 0 ? 1 : 0);
