/**
 * P6b/P6a browser QA — local Supabase + dev server (default http://localhost:3020). Test org only.
 */
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { seedTestPostingRule } from "./testPostingFixture.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const parse = (s) => Object.fromEntries(s.split(/\r?\n/).map((l) => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2].replace(/^"|"$/g, "")]));
const st = parse(execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }));
const base = process.env.P6B_BASE || "http://localhost:3020";
const storageKey = `sb-${new URL(st.API_URL).hostname.split(".")[0]}-auth-token`;
const shotDir = path.join(os.tmpdir(), "p6b");
fs.mkdirSync(shotDir, { recursive: true });
const service = createClient(st.API_URL, st.SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const checks = [];
const rec = (name, pass, detail = "") => checks.push({ name, pass: Boolean(pass), detail: pass ? "" : String(detail).slice(0, 160) });

const tag = `p6bq-${Date.now()}`;
const password = `Test-${tag}-Aa1!`;
const mkUser = async (n) => {
  const { data, error } = await service.auth.admin.createUser({ email: `${n}-${tag}@t.local`, password, email_confirm: true });
  if (error) throw error;
  await service.from("users").upsert({ id: data.user.id, member_type: "company" });
  return data.user;
};
const U = {};
for (const n of ["owner", "memberko", "membervi", "expert", "expertu"]) U[n] = await mkUser(n);
const orgName = `P6B 검수조직 ${tag.slice(-5)}`;
const { data: org } = await service.from("accounting_organizations").insert({ name_official: orgName, tax_code: "0100000999", approval_status: "approved" }).select("id").single();
await service.from("accounting_org_members").insert([
  { org_id: org.id, user_id: U.owner.id, role: "company_owner" },
  { org_id: org.id, user_id: U.memberko.id, role: "company_member" },
  { org_id: org.id, user_id: U.membervi.id, role: "company_member" },
  { org_id: org.id, user_id: U.expert.id, role: "vnk_expert" },
  { org_id: org.id, user_id: U.expertu.id, role: "vnk_expert" },
]);
await service.from("accounting_profiles").upsert([
  { user_id: U.owner.id, locale: "ko" },
  { user_id: U.memberko.id, locale: "ko" },
  { user_id: U.membervi.id, locale: "vi" },
]);
await service.from("accounting_expert_assignments").insert({ expert_user_id: U.expert.id, org_id: org.id, assigned_by: U.owner.id });
await seedTestPostingRule(service, "sale");

const sessions = {};
for (const n of Object.keys(U)) {
  const anon = createClient(st.API_URL, st.ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await anon.auth.signInWithPassword({ email: `${n}-${tag}@t.local`, password });
  if (error) throw error;
  sessions[n] = data.session;
}
const ownerClient = createClient(st.API_URL, st.ANON_KEY, { global: { headers: { Authorization: `Bearer ${sessions.owner.access_token}` } }, auth: { persistSession: false } });

async function sale(period, amount, memo) {
  const { data: t } = await service.from("accounting_transactions").insert({ org_id: org.id, type: "sale", status: "draft", txn_date: `${period}-12`, period_key: period, amount_vnd: amount, created_by: U.owner.id }).select("id").single();
  await service.from("accounting_transaction_lines").insert({ txn_id: t.id, amount_net: Math.round(amount / 1.1), vat_rate: 10, vat_amount: amount - Math.round(amount / 1.1) });
  if (memo) {
    await service.from("accounting_i18n_texts").insert([
      { org_id: org.id, entity_type: "transaction", entity_id: t.id, field: "memo", lang: "ko", text: memo, status: "original", version: 1 },
      { org_id: org.id, entity_type: "transaction", entity_id: t.id, field: "memo", lang: "vi", text: `Ghi chu ${memo}`, status: "machine", version: 1 },
    ]);
  }
  const { error } = await ownerClient.rpc("accounting_confirm_transaction", { p_txn_id: t.id });
  if (error) throw error;
  return t.id;
}
const T1 = await sale("2026-11", 1_100_000, "P6B 정정 대상 메모");
const T2 = await sale("2026-10", 550_000, null);
const { data: decl } = await service.from("accounting_declarations").insert({
  org_id: org.id, form_code: "01/GTGT", period_key: "2026-10", status: "expert_review",
  computed: { warnings: [], fields: { "35": { value: "500000", source: "calc" }, "36": { value: "50000", source: "calc" } } },
}).select("id").single();

async function withSession(who, locale, viewport, fn) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport });
  await context.addCookies([{ name: "vfbcai_locale", value: locale, url: base }]);
  await context.addInitScript((p) => localStorage.setItem(p.k, p.v), { k: storageKey, v: JSON.stringify(sessions[who]) });
  const page = await context.newPage();
  try { await fn(page); } finally { await browser.close(); }
}
const noOverflow = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const shot = (page, name) => page.screenshot({ path: path.join(shotDir, `${name}.png`), fullPage: true });
const body = (page) => page.locator("body").innerText();
const fonts = {};

// ---- A. assigned expert desktop 1440
await withSession("expert", "ko", { width: 1440, height: 900 }, async (page) => {
  await page.goto(`${base}/vnk/accounting/review-queue`, { waitUntil: "domcontentloaded" });
  await page.getByText(orgName).first().waitFor({ timeout: 60000 });
  const b = await body(page);
  rec("A1 queue shows org+period (no tax code)", b.includes(orgName) && b.includes("2026-10") && !b.includes("0100000999"));
  rec("A1 queue 1440 no overflow", await noOverflow(page));
  fonts.vnk = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  await shot(page, "queue-1440");
  await page.locator('a[href*="/vnk/accounting/review-queue/"]').first().click();
  try {
    await page.getByText("코멘트", { exact: true }).first().waitFor({ timeout: 60000 });
  } catch (e) {
    const api = await fetch(`${base}/api/accounting/expert/declarations/${decl.id}`, { headers: { Authorization: `Bearer ${sessions.expert.access_token}` } });
    console.log("DETAIL_DEBUG", api.status, (await api.text()).slice(0, 300), "| BODY:", (await body(page)).slice(0, 200));
    throw e;
  }
  rec("A2 detail readonly numbers (no numeric input in steps)", (await page.locator('main input[type="number"]').count()) === 0);

  await page.locator("textarea").fill("P6B 코멘트 본문");
  await page.getByRole("button", { name: "코멘트 저장" }).click();
  await page.getByText("P6B 코멘트 본문").waitFor({ timeout: 15000 });
  rec("A3 comment created", true);
  await page.getByRole("button", { name: "해결 처리" }).first().click();
  await page.waitForTimeout(1500);
  const { data: cm } = await service.from("accounting_review_comments").select("status").eq("target_id", decl.id).eq("target_type", "declaration");
  rec("A4 comment resolved", cm?.[0]?.status === "resolved", JSON.stringify(cm));

  await page.getByLabel("금액", { exact: true }).fill("1000");
  await page.getByLabel("항목").selectOption("37");
  await page.getByRole("button", { name: "조정 저장" }).click();
  await page.waitForTimeout(1500);
  const { count: adj } = await service.from("accounting_declaration_adjustments").select("id", { count: "exact", head: true }).eq("declaration_id", decl.id);
  rec("A5 expert adjustment with reason code", adj === 1);

  const pdf = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF");
  await page.locator('input[type="file"]').setInputFiles({ name: "receipt.pdf", mimeType: "application/pdf", buffer: pdf });
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: "제출 기록" }).click();
  await page.getByTestId("period-locked").waitFor({ timeout: 20000 });
  const { data: d2 } = await service.from("accounting_declarations").select("status, portal_form_basis, filing_receipt_path").eq("id", decl.id).single();
  rec("A6 filing recorded (basis+receipt)", d2.status === "filed_manual" && d2.portal_form_basis === "TT89" && d2.filing_receipt_path?.startsWith(`${org.id}/filing/`), JSON.stringify(d2));
  const lockedBody = await body(page);
  rec("A7 locked screen blocks edit", lockedBody.includes("잠겨") && (await page.getByRole("button", { name: "조정 저장" }).count()) === 0 && (await page.getByRole("button", { name: "제출 기록" }).count()) === 0);
  rec("A7 receipt via signed URL", (await page.locator('a:has-text("접수증 열람")').getAttribute("href"))?.includes("/sign/"));
  await shot(page, "detail-locked-1440");
  const { count: lockTxn } = await service.from("accounting_audit_log").select("id", { count: "exact", head: true }).eq("entity_id", decl.id);
  rec("A8 audit rows for declaration", (lockTxn ?? 0) >= 1);
});

// ---- B. unassigned expert
await withSession("expertu", "ko", { width: 1440, height: 900 }, async (page) => {
  await page.goto(`${base}/vnk/accounting/review-queue`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "전문가 검토 대기열" }).waitFor({ timeout: 60000 });
  rec("B1 unassigned expert no assigned decl in queue", !(await body(page)).includes(orgName));
});

// ---- C. member (ko) denied queue
await withSession("memberko", "ko", { width: 1440, height: 900 }, async (page) => {
  await page.goto(`${base}/vnk/accounting/review-queue`, { waitUntil: "domcontentloaded" });
  await page.getByText("VNK 전문가·관리자만").waitFor({ timeout: 60000 });
  rec("C1 company member denied queue", !(await body(page)).includes(orgName));
});

// ---- D. correction flow
await withSession("memberko", "ko", { width: 1440, height: 900 }, async (page) => {
  await page.goto(`${base}/company/accounting/transactions/${T1}`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("corrections").waitFor({ timeout: 60000 });
  await page.getByLabel("정정 금액(VND)").fill("1000000");
  await page.getByLabel("정정 사유").fill("금액 오기");
  await page.getByRole("button", { name: "정정 요청 보내기" }).click();
  await page.getByText("대기", { exact: false }).first().waitFor({ timeout: 15000 });
  rec("D1 member requests correction", true);
  rec("D2 member has no approve button", (await page.getByRole("button", { name: "승인" }).count()) === 0);
});
let newTxnId = null;
await withSession("owner", "ko", { width: 1440, height: 900 }, async (page) => {
  await page.goto(`${base}/company/accounting/transactions/${T1}`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "승인" }).waitFor({ timeout: 60000 });
  await page.getByRole("button", { name: "승인" }).click();
  await page.getByTestId("new-txn-link").waitFor({ timeout: 20000 });
  const href = await page.getByTestId("new-txn-link").getAttribute("href");
  newTxnId = href.split("/").pop();
  const { data: nt } = await service.from("accounting_transactions").select("corrects_txn_id, amount_vnd").eq("id", newTxnId).single();
  const { data: ot } = await service.from("accounting_transactions").select("amount_vnd").eq("id", T1).single();
  rec("D3 owner approves → new txn", nt.corrects_txn_id === T1 && Number(nt.amount_vnd) === 1_000_000 && Number(ot.amount_vnd) === 1_100_000);
  await page.goto(`${base}${href}`, { waitUntil: "domcontentloaded" });
  await page.getByText("원본 분개").waitFor({ timeout: 60000 });
  rec("D4 new txn shows original+reversal ledger", (await body(page)).includes("현재 분개"));
  await shot(page, "txn-correction-1440");
  fonts.company = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  await page.goto(`${base}/company/accounting/transactions/${T2}`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("amended-required").waitFor({ timeout: 60000 });
  rec("D5 filed period shows amended-required", (await body(page)).includes("수정 신고(amended) 절차 필요") && (await page.getByLabel("정정 금액(VND)").count()) === 0);
});
rec("D6 same font family as company screens", fonts.vnk && fonts.vnk === fonts.company, `${fonts.vnk}|${fonts.company}`);

// ---- E. Vietnamese confirm + export check
async function exportPreview(token) {
  const res = await fetch(`${base}/api/accounting/exports/ledger`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ period: "2026-11", preview: true }) });
  return res.json();
}
const before = await exportPreview(sessions.owner.access_token);
rec("E1 export warns machine before confirm", (before.warnings ?? []).some((w) => w.txnId === T1 && w.reason === "machine"), JSON.stringify(before).slice(0, 120));
await withSession("memberko", "vi", { width: 1440, height: 900 }, async (page) => {
  await page.goto(`${base}/company/accounting/transactions/${T1}`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("translations").waitFor({ timeout: 60000 });
  rec("E2 ko-locale member has no confirm button", (await page.getByRole("button", { name: "Xác nhận tiếng Việt" }).count()) === 0);
});
await withSession("membervi", "vi", { width: 1440, height: 900 }, async (page) => {
  await page.goto(`${base}/company/accounting/transactions/${T1}`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Xác nhận tiếng Việt" }).waitFor({ timeout: 60000 });
  const pre = await body(page);
  await page.getByRole("button", { name: "Xác nhận tiếng Việt" }).click();
  await page.getByText("Đã xác nhận tiếng Việt").waitFor({ timeout: 15000 });
  rec("E3 vi screen label changes machine→verified", pre.includes("Dịch máy") && (await body(page)).includes("Đã xác nhận tiếng Việt"));
  await shot(page, "txn-vi-confirmed-1440");
});
const after = await exportPreview(sessions.owner.access_token);
rec("E4 export machine warning gone for confirmed text", !(after.warnings ?? []).some((w) => w.txnId === T1), JSON.stringify(after).slice(0, 120));
const real = await fetch(`${base}/api/accounting/exports/ledger`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessions.owner.access_token}` }, body: JSON.stringify({ period: "2026-11" }) });
const realJson = await real.json();
const { data: exp } = await service.from("accounting_exports").select("i18n_version_list, sha256").eq("org_id", org.id).order("created_at", { ascending: false }).limit(1);
const vlist = exp?.[0]?.i18n_version_list ?? [];
rec("E5 exports i18n_version_list has human_verified v2", real.ok && vlist.some((v) => v.entityId === T1 && v.lang === "vi" && v.status === "human_verified" && v.version === 2), `${real.status} ${JSON.stringify(realJson).slice(0, 80)}`);

// ---- F. mobile 390
await withSession("expert", "ko", { width: 390, height: 844 }, async (page) => {
  await page.goto(`${base}/vnk/accounting/review-queue`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "전문가 검토 대기열" }).waitFor({ timeout: 60000 });
  rec("F1 mobile queue no overflow", await noOverflow(page));
  await page.goto(`${base}/vnk/accounting/review-queue/${decl.id}`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("period-locked").waitFor({ timeout: 60000 });
  rec("F2 mobile locked detail no overflow", await noOverflow(page));
  await shot(page, "detail-locked-390");
});
const { data: decl2 } = await service.from("accounting_declarations").insert({ org_id: org.id, form_code: "01/GTGT", period_key: "2026-12", status: "expert_review", computed: { warnings: ["w1"], fields: {} } }).select("id").single();
await withSession("expert", "ko", { width: 390, height: 844 }, async (page) => {
  await page.goto(`${base}/vnk/accounting/review-queue`, { waitUntil: "domcontentloaded" });
  await page.getByText(orgName).first().waitFor({ timeout: 60000 });
  rec("F3 mobile queue no overflow", await noOverflow(page));
  await shot(page, "queue-390");
  await page.goto(`${base}/vnk/accounting/review-queue/${decl2.id}`, { waitUntil: "domcontentloaded" });
  await page.getByText("코멘트", { exact: true }).first().waitFor({ timeout: 60000 });
  rec("F4 mobile open detail no overflow", await noOverflow(page));
  await shot(page, "detail-open-390");
});
await withSession("owner", "ko", { width: 390, height: 844 }, async (page) => {
  await page.goto(`${base}/company/accounting/transactions/${T1}`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("corrections").waitFor({ timeout: 60000 });
  rec("F5 mobile txn detail no overflow", await noOverflow(page));
  await shot(page, "txn-390");
});

const failed = checks.filter((c) => !c.pass);
console.log(JSON.stringify({ pass: checks.length - failed.length, fail: failed.length, failed, shotDir }));
process.exit(failed.length ? 1 : 0);
