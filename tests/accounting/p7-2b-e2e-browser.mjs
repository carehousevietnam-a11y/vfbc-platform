/**
 * P7-2b browser E2E — org docs, approval, expert queue.
 */
import { execSync } from "node:child_process";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const base = process.env.P72B_BASE || "http://localhost:3020";
const repoRoot = process.cwd();
const password = "Vfbcai-LocalDev-Accounting-2026!";
const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

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
function assert(n, ok, detail = "") {
  if (!ok) {
    fail++;
    console.error(`FAIL ${n}${detail ? ` (${detail})` : ""}`);
  } else console.log(`PASS ${n}`);
}

async function mkUser(svc, label) {
  const email = `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@t.local`;
  const { data, error } = await svc.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  await svc.from("users").upsert({ id: data.user.id, email, member_type: "company" });
  return { id: data.user.id, email };
}

async function signIn(email) {
  const anon = createClient(st.API_URL, st.ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw error ?? new Error("signIn");
  return data.session;
}

async function withSession(viewport, locale, session, fn) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport });
  await context.addCookies([{ name: "vfbcai_locale", value: locale, url: base }]);
  await context.addInitScript(
    (payload) => localStorage.setItem(payload.key, payload.raw),
    { key: storageKey, raw: JSON.stringify(session) },
  );
  const page = await context.newPage();
  try {
    await fn(page);
  } finally {
    await browser.close();
  }
}

async function onboardOperating(page) {
  await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
  await page.goto(`${base}/company/accounting/company`, { waitUntil: "networkidle" });
  const onboard = page.getByTestId("accounting-company-onboarding");
  await onboard.getByTestId("accounting-onboard-category-operating").locator("button").click();
  await onboard.getByTestId("accounting-onboard-company-name").fill("P72B E2E Co");
  await onboard.getByTestId("accounting-onboard-position-ceo").locator("button").click();
  await onboard.getByTestId("accounting-onboard-submit").click();
  await page.waitForURL("**/company/accounting/pending**", { timeout: 60_000 });
}

async function uploadDoc(page, kind) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "p72b-"));
  const f = path.join(tmp, `${kind}.png`);
  fs.writeFileSync(f, tinyPng);
  const waitPost = page.waitForResponse(
    (r) => r.url().includes("/api/accounting/org-documents") && r.request().method() === "POST",
    { timeout: 60_000 },
  );
  await page.getByTestId(`accounting-org-doc-input-${kind}`).setInputFiles(f);
  const res = await waitPost;
  const body = res.status() === 200 ? null : await res.json().catch(() => ({}));
  assert(`upload_${kind}_status`, res.status() === 200, `status=${res.status()} err=${body?.error ?? ""}`);
}

async function uploadDocs(page) {
  await uploadDoc(page, "business_registration");
  await uploadDoc(page, "investment_registration");
  for (let i = 0; i < 20; i++) {
    if (await page.getByTestId("accounting-org-request-approval").isEnabled()) break;
    await page.waitForTimeout(300);
  }
}

async function runFlow(viewport, locale, label) {
  const svc = createClient(st.API_URL, st.SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const owner = await mkUser(svc, `own-${label}`);
  const member = await mkUser(svc, `mem-${label}`);
  const expert = await mkUser(svc, `exp-${label}`);
  const outsider = await mkUser(svc, `out-${label}`);

  const { data: staffOrg } = await svc
    .from("accounting_organizations")
    .insert({ name_official: `Staff ${label}`, approval_status: "approved" })
    .select("id")
    .single();
  await svc.from("accounting_org_members").insert({ org_id: staffOrg.id, user_id: expert.id, role: "vnk_expert" });

  const ownerSession = await signIn(owner.email);
  await withSession(viewport, locale, ownerSession, async (page) => {
    await onboardOperating(page);
    const req = page.getByTestId("accounting-org-request-approval");
    assert(`${label} request_disabled_no_docs`, await req.isDisabled());
    await uploadDocs(page);
    assert(`${label} request_enabled`, await req.isEnabled());
    await req.click();
    await page.getByTestId("accounting-org-in-review").waitFor({ timeout: 30_000 });
  });

  const { data: ownerMem } = await svc.from("accounting_org_members").select("org_id").eq("user_id", owner.id).maybeSingle();
  if (ownerMem?.org_id) {
    await svc.from("accounting_org_members").insert({ org_id: ownerMem.org_id, user_id: member.id, role: "company_member" });
  }

  const memberSession = await signIn(member.email);
  await withSession(viewport, locale, memberSession, async (page) => {
    await page.goto(`${base}/company/accounting/pending`, { waitUntil: "networkidle" });
    assert(`${label} member_no_upload`, (await page.getByTestId("accounting-org-docs-upload").count()) === 0);
  });

  const outsiderSession = await signIn(outsider.email);
  await withSession(viewport, locale, outsiderSession, async (page) => {
    await page.goto(`${base}/vnk/accounting/review-queue`, { waitUntil: "networkidle" });
    await page.getByTestId("expert-queue-access-denied").waitFor({ timeout: 30_000 });
    assert(`${label} outsider_denied`, true);
  });

  const expertSession = await signIn(expert.email);
  await withSession(viewport, locale, expertSession, async (page) => {
    await page.goto(`${base}/vnk/accounting/review-queue`, { waitUntil: "networkidle" });
    await page.getByTestId("expert-org-approve").first().click();
  });

  await withSession(viewport, locale, ownerSession, async (page) => {
    await page.goto(`${base}/company/accounting/transactions`, { waitUntil: "domcontentloaded" });
    await page.waitForURL("**/transactions**", { timeout: 60_000 });
    assert(`${label} workspace_open`, page.url().includes("/transactions"));
  });

  const rejOwner = await mkUser(svc, `rej-${label}`);
  const rejSession = await signIn(rejOwner.email);
  await withSession(viewport, locale, rejSession, async (page) => {
    await onboardOperating(page);
    await uploadDocs(page);
    await page.getByTestId("accounting-org-request-approval").click();
    await page.getByTestId("accounting-org-in-review").waitFor({ timeout: 30_000 });
  });
  const { data: rejMem } = await svc.from("accounting_org_members").select("org_id").eq("user_id", rejOwner.id).maybeSingle();
  if (rejMem?.org_id) {
    await svc.from("accounting_organizations").update({ approval_status: "rejected" }).eq("id", rejMem.org_id);
    await svc.from("accounting_i18n_texts").insert({
      org_id: rejMem.org_id,
      entity_type: "organization",
      entity_id: rejMem.org_id,
      field: "review_note",
      lang: locale,
      text: locale === "vi" ? "Hồ sơ cần bổ sung." : "서류를 다시 확인합니다.",
      status: "original",
      version: 1,
      created_by: expert.id,
    });
  }
  await withSession(viewport, locale, rejSession, async (page) => {
    await page.goto(`${base}/company/accounting/pending`, { waitUntil: "networkidle" });
    await page.getByTestId("accounting-org-review-note").waitFor({ timeout: 30_000 });
    await page.getByTestId("accounting-org-docs-upload").waitFor({ timeout: 30_000 });
    assert(`${label} reject_reupload_ui`, true);
  });
}

try {
  const ping = await fetch(base, { signal: AbortSignal.timeout(8000) });
  assert("dev_server_up", ping.ok || ping.status < 500);
} catch {
  assert("dev_server_up", false);
  process.exit(1);
}

await runFlow({ width: 1280, height: 800 }, "ko", "desktop_ko");
await runFlow({ width: 375, height: 812 }, "vi", "mobile_vi");
process.exit(fail > 0 ? 1 : 0);
