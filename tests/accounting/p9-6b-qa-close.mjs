/**
 * P9-6b 마감 QA — local only. Password never logged.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = path.join(repoRoot, "tests/qa/_output/p9-6b");
fs.mkdirSync(outDir, { recursive: true });
const reportPath = path.join(outDir, "qa-report.json");

const config = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "src/lib/accounting/dev-local-login.config.json"), "utf8")
);

function parseEnv(stdout) {
  const out = {};
  for (const line of stdout.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return out;
}

execSync("node tests/accounting/dev-local-login-seed.mjs", { cwd: repoRoot, stdio: "pipe" });
const st = parseEnv(execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8" }));
const base = process.env.P5B_BASE || "http://localhost:3020";
const storageKey = `sb-${new URL(st.API_URL).hostname.split(".")[0]}-auth-token`;
const periodKey = "2026-11";
const tag = `p96bqa-${Date.now()}`;
const partialRun = process.env.P96B_QA_PARTIAL === "1";

const service = createClient(st.API_URL, st.SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const results = {};
const set = (id, status, evidence) => {
  results[id] = { status, evidence };
};

async function loginViaDevPage(page, accountLabel) {
  await page.goto(`${base}/dev/accounting-login`, { waitUntil: "domcontentloaded" });
  const pwd = page.locator('input[type="password"]');
  await pwd.click();
  await pwd.pressSequentially(config.password, { delay: 10 });
  await page.getByRole("button", { name: accountLabel }).click();
  await page.waitForURL("**/company/accounting/**", { timeout: 60000 });
}

async function ensureViMember(orgId, ownerId) {
  const email = `dev-org-a-member-vi-${tag}@test.vfbcai.local`;
  const { data: created, error } = await service.auth.admin.createUser({
    email,
    password: config.password,
    email_confirm: true,
  });
  if (error) throw error;
  const uid = created.user.id;
  await service.from("users").upsert({ id: uid, member_type: "company" });
  await service.from("accounting_org_members").insert({
    org_id: orgId,
    user_id: uid,
    role: "company_member",
  });
  await service.from("accounting_profiles").upsert({ user_id: uid, locale: "vi" });
  await service.from("accounting_company_signup_profiles").upsert({
    user_id: uid,
    company_category: "operating",
    company_name: "DEV Org A Member Vi",
    job_position: "finance",
  });
  await service.from("accounting_company_signup_profiles").upsert({
    user_id: ownerId,
    company_category: "operating",
    company_name: "DEV Org A Owner Display",
    job_position: "ceo",
  });
  return { email, uid };
}

const orgRow = await service
  .from("accounting_organizations")
  .select("id")
  .eq("tax_code", config.orgs.a.tax_code)
  .single();
const orgAId = orgRow.data.id;
const ownerSign = await service.auth.admin.listUsers({ page: 1, perPage: 200 });
const ownerA = ownerSign.data.users.find((u) => u.email === config.accounts.org_a_owner);
const viMember = await ensureViMember(orgAId, ownerA.id);

async function sessionForEmail(email) {
  const anon = createClient(st.API_URL, st.ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await anon.auth.signInWithPassword({ email, password: config.password });
  if (error || !data.session) throw error ?? new Error("sign_in");
  return data.session;
}

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

async function withDevLogin(accountLabel, locale, viewport, fn) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport });
  await context.addCookies([{ name: "vfbcai_locale", value: locale, url: base }]);
  const page = await context.newPage();
  try {
    await loginViaDevPage(page, accountLabel);
    await fn(page);
  } finally {
    await browser.close();
  }
}

async function waitVatReady(page) {
  await page.getByText(/부가가치세|Khai thuế GTGT/).first().waitFor({ timeout: 45000 });
  await page.waitForTimeout(800);
}

const memoKo = `QA-KO-${tag}`;
const memoVi = `QA-VI-${tag}`;
const memoViResume = `QA-VI-RESUME-${tag}`;
let seededTxnId = "";
let seededTxnMemoKo = "";

async function ensureDeclarationId() {
  const { data: existing } = await service
    .from("accounting_declarations")
    .select("id, computed")
    .eq("org_id", orgAId)
    .eq("form_code", "01/GTGT")
    .eq("period_key", periodKey)
    .maybeSingle();
  if (existing?.id) return existing;
  const { data: created, error } = await service
    .from("accounting_declarations")
    .insert({
      org_id: orgAId,
      form_code: "01/GTGT",
      period_key: periodKey,
      status: "drafting",
      computed: { _wizard: { revision: 1, step: 1, filingKind: "regular", periodKey, steps: {} } },
    })
    .select("id, computed")
    .single();
  if (error) throw error;
  return created;
}

async function clearDeclarationStepMemos(declId) {
  const fields = ["step_memo_1", "step_memo_2", "step_memo_3", "step_memo_4", "step_memo_5", "step_memo_6"];
  await service
    .from("accounting_i18n_texts")
    .delete()
    .eq("org_id", orgAId)
    .eq("entity_type", "declaration")
    .eq("entity_id", declId)
    .in("field", fields);
}

async function seedWizardSteps12(declId, computed) {
  const now = new Date().toISOString();
  await service.from("accounting_i18n_texts").insert({
    org_id: orgAId,
    entity_type: "declaration",
    entity_id: declId,
    field: "step_memo_1",
    lang: "ko",
    text: memoKo,
    status: "original",
    version: 1,
    created_by: ownerA.id,
  });
  const wizard = {
    revision: (parseVatWizardRevision(computed) ?? 0) + 1,
    step: 2,
    filingKind: "regular",
    periodKey,
    steps: {
      "1": { savedAt: now, savedBy: ownerA.id, lang: "ko" },
      "2": { savedAt: now, savedBy: ownerA.id, lang: "ko" },
    },
  };
  await service
    .from("accounting_declarations")
    .update({ computed: { ...(computed ?? {}), _wizard: wizard } })
    .eq("id", declId);
}

function parseVatWizardRevision(computed) {
  const w = computed?._wizard;
  return typeof w?.revision === "number" ? w.revision : null;
}

async function seedTxnKoMemoOnly() {
  const txnMemoKo = `TXN-KO-PENDING-${tag}`;
  const amountVnd = 1_100_000;
  const { data: txn, error } = await service
    .from("accounting_transactions")
    .insert({
      org_id: orgAId,
      type: "sale",
      status: "draft",
      txn_date: `${periodKey}-15`,
      period_key: periodKey,
      amount_vnd: amountVnd,
      created_by: ownerA.id,
    })
    .select("id")
    .single();
  if (error) throw error;
  await service.from("accounting_transaction_lines").insert({
    txn_id: txn.id,
    amount_net: Math.round(amountVnd / 1.1),
    vat_rate: 10,
    vat_amount: amountVnd - Math.round(amountVnd / 1.1),
  });
  await service.from("accounting_i18n_texts").insert({
    org_id: orgAId,
    entity_type: "transaction",
    entity_id: txn.id,
    field: "memo",
    lang: "ko",
    text: txnMemoKo,
    status: "original",
    version: 1,
    created_by: ownerA.id,
  });
  const ownerClient = createClient(st.API_URL, st.ANON_KEY, {
    auth: { persistSession: false },
  });
  const { data: ownerSign } = await ownerClient.auth.signInWithPassword({
    email: config.accounts.org_a_owner,
    password: config.password,
  });
  const rpcClient = createClient(st.API_URL, st.ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${ownerSign.session.access_token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: confirmErr } = await rpcClient.rpc("accounting_confirm_transaction", { p_txn_id: txn.id });
  if (confirmErr) throw confirmErr;
  seededTxnId = txn.id;
  seededTxnMemoKo = txnMemoKo;
}

async function seedItem3Memos(declId) {
  await clearDeclarationStepMemos(declId);
  await service.from("accounting_i18n_texts").insert([
    {
      org_id: orgAId,
      entity_type: "declaration",
      entity_id: declId,
      field: "step_memo_1",
      lang: "ko",
      text: memoKo,
      status: "original",
      version: 1,
      created_by: ownerA.id,
    },
    {
      org_id: orgAId,
      entity_type: "declaration",
      entity_id: declId,
      field: "step_memo_3",
      lang: "vi",
      text: memoVi,
      status: "original",
      version: 1,
      created_by: viMember.uid,
    },
  ]);
}

const declRow = await ensureDeclarationId();
await clearDeclarationStepMemos(declRow.id);
await seedWizardSteps12(declRow.id, declRow.computed);
await seedTxnKoMemoOnly();

// --- 1 resume ---
try {
  const ownerSession = await sessionForEmail(config.accounts.org_a_owner);
  await withSession(ownerSession, "ko", { width: 1440, height: 900 }, async (page) => {
    await page.goto(`${base}/company/accounting/vat?periodKey=${periodKey}`, { waitUntil: "domcontentloaded" });
    await waitVatReady(page);
    await page.getByRole("button", { name: "② 매출" }).click({ timeout: 45000 });
    await page.getByText("마지막 작성").first().waitFor({ timeout: 20000 });
    await page.screenshot({ path: path.join(outDir, "1-owner-ko-step2-pc.png"), fullPage: true });
  });

  const viMemberSession = await sessionForEmail(viMember.email);
  await withSession(viMemberSession, "vi", { width: 375, height: 812 }, async (page) => {
    await page.goto(`${base}/company/accounting/vat?periodKey=${periodKey}`, { waitUntil: "domcontentloaded" });
    await waitVatReady(page);
    await page.getByRole("button", { name: "① Thông tin cơ bản" }).click({ timeout: 45000 });
    const memoField = page.getByTestId("accounting-i18n-field-vat.step_memo.1");
    await memoField.getByRole("button", { name: "Xem tiếng Việt" }).click();
    const memoText = await memoField.innerText();
    const stepOk = (await page.locator("body").innerText()).includes("② Doanh thu");
    const memoOk = memoText.includes(memoKo) && memoText.includes("Chờ dịch");
    await page.getByRole("button", { name: "③ Mua vào" }).click();
    await page.waitForTimeout(1200);
    const field3edit = page.getByTestId("accounting-i18n-field-vat.step_memo.3");
    await field3edit.getByRole("button", { name: "Xem khi nhập" }).click();
    await field3edit.locator("textarea").fill(memoViResume);
    await page.getByRole("button", { name: "④ Tính thuế" }).click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(outDir, "1-member-vi-step4-375.png"), fullPage: true });
    set("1", stepOk && memoOk ? "PASS" : "FAIL", `${outDir}/1-owner-ko-step2-pc.png, ${outDir}/1-member-vi-step4-375.png`);
  });
} catch (e) {
  set("1", "FAIL", String(e.message ?? e));
}

// --- 2 view switch ---
if (!partialRun)
try {
  const ownerSession = await sessionForEmail(config.accounts.org_a_owner);
  await withSession(ownerSession, "ko", { width: 1440, height: 900 }, async (page) => {
    await page.goto(`${base}/company/accounting/vat?periodKey=${periodKey}`, { waitUntil: "domcontentloaded" });
    await waitVatReady(page);
    await page.getByRole("button", { name: "① 기본정보" }).click();
    await page.getByTestId("accounting-form-view-bar").waitFor({ timeout: 45000 });
    const memo = page.getByTestId("accounting-i18n-field-vat.step_memo.1").locator("textarea");
    const draft = `draft-keep-${tag}`;
    await memo.fill(draft);
    await page.getByTestId("accounting-view-mode-bilingual").click();
    await page.getByTestId("accounting-view-mode-ko").click();
    await page.getByTestId("accounting-view-mode-vi").click();
    const val = await memo.inputValue();
    await page.screenshot({ path: path.join(outDir, "2-view-switch-pc.png"), fullPage: true });
    set("2", val === draft ? "PASS" : "FAIL", path.join(outDir, "2-view-switch-pc.png"));
  });
} catch (e) {
  set("2", "FAIL", String(e.message ?? e));
}

// --- 3 translation pending ---
await seedItem3Memos(declRow.id);
try {
  const viMemberSession = await sessionForEmail(viMember.email);
  await withSession(viMemberSession, "vi", { width: 375, height: 812 }, async (page) => {
    await page.goto(`${base}/company/accounting/vat?periodKey=${periodKey}`, { waitUntil: "domcontentloaded" });
    await waitVatReady(page);
    await page.getByRole("button", { name: "① Thông tin cơ bản" }).click({ timeout: 45000 });
    const field = page.getByTestId("accounting-i18n-field-vat.step_memo.1");
    await field.getByRole("button", { name: "Xem tiếng Việt" }).click();
    const step1View = await field.innerText();
    const pendingOk = step1View.includes(memoKo) && step1View.includes("Chờ dịch");
    await page.getByRole("button", { name: "③ Mua vào" }).click();
    await page.waitForTimeout(800);
    const field3 = page.getByTestId("accounting-i18n-field-vat.step_memo.3");
    await field3.getByRole("button", { name: "Xem tiếng Việt" }).click();
    const step3View = await field3.innerText();
    const directViOk = step3View.includes(memoVi) && !step3View.includes("Chờ dịch");
    await page.screenshot({ path: path.join(outDir, "3-translation-pending-375.png"), fullPage: true });
    results._item3 = { pendingOk, directViOk };
  });

  const ownerSession = await sessionForEmail(config.accounts.org_a_owner);
  let koPendingOnViMemo = false;
  await withSession(ownerSession, "ko", { width: 1440, height: 900 }, async (koPage) => {
    await koPage.goto(`${base}/company/accounting/vat?periodKey=${periodKey}`, { waitUntil: "domcontentloaded" });
    await waitVatReady(koPage);
    await koPage.getByRole("button", { name: "③ 매입" }).click();
    const f3ko = koPage.getByTestId("accounting-i18n-field-vat.step_memo.3");
    await f3ko.getByRole("button", { name: "한국어로 보기" }).click();
    const koView = await f3ko.innerText();
    koPendingOnViMemo = koView.includes(memoVi) && koView.includes("번역 대기");
  });
  const i3 = results._item3 ?? {};
  set(
    "3",
    i3.pendingOk && i3.directViOk && koPendingOnViMemo ? "PASS" : "FAIL",
    path.join(outDir, "3-translation-pending-375.png")
  );
  delete results._item3;
} catch (e) {
  set("3", "FAIL", String(e.message ?? e));
}

// --- 11-8 translation pending (txn, seeded ko-only) ---
try {
  const viMemberSession = await sessionForEmail(viMember.email);
  await withSession(viMemberSession, "vi", { width: 375, height: 812 }, async (page) => {
    const detailUrl = `${base}/company/accounting/transactions/${seededTxnId}`;
    await page.goto(detailUrl, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);
    const body = await page.locator("body").innerText();
    const ok = body.includes(seededTxnMemoKo) && body.includes("Chờ dịch");
    await page.screenshot({ path: path.join(outDir, "11-8-txn-translation-pending-375.png"), fullPage: true });
    set("11-8", ok ? "PASS" : "FAIL", path.join(outDir, "11-8-txn-translation-pending-375.png"));
  });
} catch (e) {
  set("11-8", "FAIL", String(e.message ?? e));
}

// --- 4 concurrent ---
if (!partialRun)
try {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const ctx1 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  for (const ctx of [ctx1, ctx2]) {
    await ctx.addCookies([{ name: "vfbcai_locale", value: "ko", url: base }]);
  }
  const ownerSession = await sessionForEmail(config.accounts.org_a_owner);
  for (const ctx of [ctx1, ctx2]) {
    await ctx.addInitScript(
      (payload) => {
        localStorage.setItem(payload.key, payload.raw);
      },
      { key: storageKey, raw: JSON.stringify(ownerSession) }
    );
  }
  const p1 = await ctx1.newPage();
  const p2 = await ctx2.newPage();
  await p1.goto(`${base}/company/accounting/vat?periodKey=${periodKey}`, { waitUntil: "domcontentloaded" });
  await p2.goto(`${base}/company/accounting/vat?periodKey=${periodKey}`, { waitUntil: "domcontentloaded" });
  await waitVatReady(p1);
  await waitVatReady(p2);
  await p1.getByRole("button", { name: "⑤ 신고 전 점검" }).click({ timeout: 45000 });
  await p2.getByRole("button", { name: "⑤ 신고 전 점검" }).click({ timeout: 45000 });
  await p1.waitForTimeout(1500);
  await p2.waitForTimeout(1500);
  await p1.getByRole("button", { name: "⑥ 전문가 검토 요청" }).click();
  await p1.waitForTimeout(2500);
  await p2.getByRole("button", { name: "⑥ 전문가 검토 요청" }).click();
  await p2.waitForTimeout(2500);
  const body2 = await p2.locator("body").innerText();
  await p2.screenshot({ path: path.join(outDir, "4-concurrent-conflict-pc.png"), fullPage: true });
  const ok =
    body2.includes("먼저 저장") ||
    body2.includes("비교용") ||
    body2.includes("lưu trước") ||
    body2.includes("tải lại");
  await browser.close();
  set("4", ok ? "PASS" : "FAIL", path.join(outDir, "4-concurrent-conflict-pc.png"));
} catch (e) {
  set("4", "FAIL", String(e.message ?? e));
}

// --- 5 form basis + display name ---
if (!partialRun)
try {
  const ownerSession = await sessionForEmail(config.accounts.org_a_owner);
  await withSession(ownerSession, "ko", { width: 1440, height: 900 }, async (page) => {
    await page.goto(`${base}/company/accounting/vat?periodKey=${periodKey}`, { waitUntil: "domcontentloaded" });
    await waitVatReady(page);
    await page.getByTestId("accounting-form-basis-footer").waitFor({ timeout: 45000 });
    const basis = await page.getByTestId("accounting-form-basis-footer").innerText();
    await page.getByRole("button", { name: "② 매출" }).click();
    await page.getByText("마지막 작성").first().waitFor({ timeout: 15000 }).catch(() => {});
    const body = await page.locator("body").innerText();
    const basisOk = basis.includes("원문 대조 진행 중") && !basis.includes("서식과 동일");
    const nameOk = body.includes("DEV Org A Owner Display") || body.includes("DEV Local Org A");
    await page.screenshot({ path: path.join(outDir, "5-basis-last-saved-pc.png"), fullPage: true });
    set(
      "5",
      basisOk && nameOk ? "PASS" : "FAIL",
      `${path.join(outDir, "5-basis-last-saved-pc.png")} basis=${basisOk} name=${nameOk}`
    );
  });
} catch (e) {
  set("5", "FAIL", String(e.message ?? e));
}

// --- 6 RLS cross org ---
if (!partialRun)
try {
  const anon = createClient(st.API_URL, st.ANON_KEY, { auth: { persistSession: false } });
  const { data: bSign } = await anon.auth.signInWithPassword({
    email: config.accounts.org_b_owner,
    password: config.password,
  });
  const bClient = createClient(st.API_URL, st.ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${bSign.session.access_token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: declA } = await service
    .from("accounting_declarations")
    .select("id")
    .eq("org_id", orgAId)
    .eq("period_key", periodKey)
    .single();
  const { data: leak } = await bClient
    .from("accounting_declarations")
    .select("id")
    .eq("id", declA.id);
  set("6", (leak ?? []).length === 0 ? "PASS" : "FAIL", `declA=${declA.id} rows=${(leak ?? []).length}`);
} catch (e) {
  set("6", "FAIL", String(e.message ?? e));
}

// --- 8 extra locale screenshots (if VAT reachable) ---
if (!partialRun)
try {
  const ownerSession = await sessionForEmail(config.accounts.org_a_owner);
  await withSession(ownerSession, "ko", { width: 375, height: 812 }, async (page) => {
    await page.goto(`${base}/company/accounting/vat?periodKey=${periodKey}`, { waitUntil: "domcontentloaded" });
    await waitVatReady(page);
    await page.screenshot({ path: path.join(outDir, "8-vat-ko-375.png"), fullPage: true });
  });
  await withSession(ownerSession, "vi", { width: 1440, height: 900 }, async (page) => {
    await page.goto(`${base}/company/accounting/vat?periodKey=${periodKey}`, { waitUntil: "domcontentloaded" });
    await waitVatReady(page);
    await page.screenshot({ path: path.join(outDir, "8-vat-vi-pc.png"), fullPage: true });
  });
  set(
    "8",
    fs.existsSync(path.join(outDir, "8-vat-ko-375.png")) && fs.existsSync(path.join(outDir, "8-vat-vi-pc.png"))
      ? "PASS"
      : "FAIL",
    `${outDir}/8-vat-ko-375.png, ${outDir}/8-vat-vi-pc.png (+ items 1–5 shots)`
  );
} catch (e) {
  set("8", "FAIL", String(e.message ?? e));
}

// cleanup
if (seededTxnId) {
  await service.from("accounting_i18n_texts").delete().eq("entity_id", seededTxnId);
  await service.from("accounting_transactions").delete().eq("id", seededTxnId);
}
await service.from("accounting_org_members").delete().eq("user_id", viMember.uid);
await service.auth.admin.deleteUser(viMember.uid);

fs.writeFileSync(reportPath, JSON.stringify({ results, outDir, periodKey }, null, 2));
console.log(JSON.stringify({ results, reportPath }, null, 2));

const keys = partialRun ? ["1", "3", "11-8"] : Object.keys(results);
const failed = keys.filter((k) => results[k]?.status === "FAIL").length;
process.exit(failed > 0 ? 1 : 0);
