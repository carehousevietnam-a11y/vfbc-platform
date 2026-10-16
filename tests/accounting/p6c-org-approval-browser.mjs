/**
 * P6c browser — pending org → expert approve/reject → owner workspace (desktop, local 3020).
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { seedTestPostingRule } from "./testPostingFixture.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const base = process.env.P6C_BASE || "http://localhost:3020";
const parse = (s) =>
  Object.fromEntries(
    s
      .split(/\r?\n/)
      .map((l) => l.match(/^([A-Z0-9_]+)=(.*)$/))
      .filter(Boolean)
      .map((m) => [m[1], m[2].replace(/^"|"$/g, "")])
  );
const st = parse(execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }));
const storageKey = `sb-${new URL(st.API_URL).hostname.split(".")[0]}-auth-token`;
const service = createClient(st.API_URL, st.SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const checks = [];
const rec = (name, pass, detail = "") => {
  checks.push({ name, pass: Boolean(pass), detail: pass ? "" : String(detail).slice(0, 120) });
};

async function assertDev() {
  const res = await fetch(base, { method: "GET" }).catch(() => null);
  if (!res?.ok) {
    console.error(`P6C_DEV_DOWN: start ${base} (p3c-local-next.mjs)`);
    process.exit(2);
  }
}

const tag = `p6cb-${Date.now()}`;
const password = `Test-${tag}-Aa1!`;
const mk = async (n) => {
  const { data, error } = await service.auth.admin.createUser({
    email: `${n}-${tag}@t.local`,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  await service.from("users").upsert({ id: data.user.id, member_type: "company" });
  return data.user;
};

const expert = await mk("expert");
const ownerOk = await mk("ownerok");
const ownerRej = await mk("ownerrej");
const { data: staffOrg } = await service
  .from("accounting_organizations")
  .insert({ name_official: `Staff ${tag}`, approval_status: "approved" })
  .select("id")
  .single();
await service.from("accounting_org_members").insert({ org_id: staffOrg.id, user_id: expert.id, role: "vnk_expert" });

const approveOrgName = `P6C 승인조직 ${tag.slice(-6)}`;
const rejectOrgName = `P6C 반려조직 ${tag.slice(-6)}`;
const { data: orgApprove } = await service
  .from("accounting_organizations")
  .insert({ name_official: approveOrgName, approval_status: "pending" })
  .select("id")
  .single();
const { data: orgReject } = await service
  .from("accounting_organizations")
  .insert({ name_official: rejectOrgName, approval_status: "pending" })
  .select("id")
  .single();
await service.from("accounting_org_members").insert([
  { org_id: orgApprove.id, user_id: ownerOk.id, role: "company_owner" },
  { org_id: orgReject.id, user_id: ownerRej.id, role: "company_owner" },
]);

const sessions = {};
for (const [n, u] of [["expert", expert], ["ownerok", ownerOk], ["ownerrej", ownerRej]]) {
  const anon = createClient(st.API_URL, st.ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await anon.auth.signInWithPassword({ email: `${n}-${tag}@t.local`, password });
  if (error) throw error;
  sessions[n] = data.session;
}

async function withSession(who, fn) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addCookies([{ name: "vfbcai_locale", value: "ko", url: base }]);
  await context.addInitScript((p) => localStorage.setItem(p.k, p.v), {
    k: storageKey,
    v: JSON.stringify(sessions[who]),
  });
  const page = await context.newPage();
  try {
    await fn(page);
  } finally {
    await browser.close();
  }
}

await assertDev();

// warmup (#98)
await withSession("expert", async (page) => {
  await page.goto(`${base}/vnk/accounting/review-queue`, { waitUntil: "domcontentloaded", timeout: 90_000 });
});

// owner: pending workspace
await withSession("ownerok", async (page) => {
  await page.goto(`${base}/company/accounting/transactions`, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.getByTestId("accounting-workspace-pending-approval").waitFor({ timeout: 60_000 });
  rec("owner_pending_before_approve", true);
});

// expert: approve
await withSession("expert", async (page) => {
  await page.goto(`${base}/vnk/accounting/review-queue`, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.getByText(approveOrgName).first().waitFor({ timeout: 60_000 });
  const row = page.locator('[data-testid="expert-queue-org-pending"]').filter({ hasText: approveOrgName });
  await row.getByTestId("expert-org-approve").click();
  await page.getByText("승인했습니다").waitFor({ timeout: 30_000 });
  rec("expert_approves_in_queue", true);
});

await seedTestPostingRule(service, "sale");

// owner: workspace open
await withSession("ownerok", async (page) => {
  await page.goto(`${base}/company/accounting/transactions`, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.getByRole("button", { name: "매출", exact: true }).waitFor({ timeout: 60_000 });
  const pending = await page.getByTestId("accounting-workspace-pending-approval").count();
  rec("owner_workspace_ready_after_approve", pending === 0);
});

// reject path
await withSession("ownerrej", async (page) => {
  await page.goto(`${base}/company/accounting/transactions`, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.getByTestId("accounting-workspace-pending-approval").waitFor({ timeout: 60_000 });
  rec("owner_reject_path_pending_first", true);
});

await withSession("expert", async (page) => {
  await page.goto(`${base}/vnk/accounting/review-queue`, { waitUntil: "domcontentloaded", timeout: 90_000 });
  const row = page.locator('[data-testid="expert-queue-org-pending"]').filter({ hasText: rejectOrgName });
  await row.getByRole("button", { name: "반려" }).first().click();
  await row.locator("textarea").fill("서류 대조 불일치");
  await row.getByRole("button", { name: "반려" }).nth(1).click();
  await page.waitForTimeout(1500);
  rec("expert_rejects_with_reason", !(await page.getByText(rejectOrgName).isVisible().catch(() => false)));
});

await withSession("ownerrej", async (page) => {
  await page.goto(`${base}/company/accounting/transactions`, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.getByTestId("accounting-workspace-rejected-approval").waitFor({ timeout: 60_000 });
  const pending = await page.getByTestId("accounting-workspace-pending-approval").count();
  const saleBtn = await page.getByRole("button", { name: "매출", exact: true }).count();
  rec("owner_rejected_not_workspace", pending === 0 && saleBtn === 0);
});

const failed = checks.filter((c) => !c.pass);
console.log(JSON.stringify({ pass: checks.length - failed.length, fail: failed.length, failed, checks }, null, 2));
process.exit(failed.length ? 1 : 0);
