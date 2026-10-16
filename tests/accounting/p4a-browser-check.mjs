/**
 * P4a legal-reviews admin UI — local Next + Playwright.
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = path.join(repoRoot, "tests/qa/_output/p4a-legal-reviews");
fs.mkdirSync(outDir, { recursive: true });

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
const service = createClient(st.API_URL, st.SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const tag = `p4a-ui-${Date.now()}`;
const password = `Test-${tag}-Aa1!`;
const email = `${tag}-admin@test.vfbcai.local`;

const { data: userData } = await service.auth.admin.createUser({ email, password, email_confirm: true });
const userId = userData.user.id;
await service.from("users").upsert({ id: userId, member_type: "company" }, { onConflict: "id" });
const { data: org } = await service
  .from("accounting_organizations")
  .insert({ name_official: `UI ${tag}`, approval_status: "approved" })
  .select("id")
  .single();
await service.from("accounting_org_members").insert({ org_id: org.id, user_id: userId, role: "vnk_admin" });

const anon = createClient(st.API_URL, st.ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: sess } = await anon.auth.signInWithPassword({ email, password });
const session = sess?.session;
if (!session) throw new Error("session bootstrap failed");

const base = process.env.P4A_BASE || "http://localhost:3020";
const checks = [];
const record = (name, pass, detail) => checks.push({ name, pass: Boolean(pass), detail: detail ?? "" });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await context.addCookies([{ name: "vfbcai_locale", value: "ko", url: base }]);
const storageKey = `sb-${new URL(st.API_URL).hostname.split(".")[0]}-auth-token`;
await context.addInitScript(
  (payload) => {
    localStorage.setItem(payload.key, payload.raw);
  },
  { key: storageKey, raw: JSON.stringify(session) }
);
const page = await context.newPage();
await page.goto(`${base}/company/accounting/legal-reviews`, { waitUntil: "domcontentloaded" });
await page.getByText("법령 월간 점검").waitFor({ timeout: 45000 });
const koText = await page.locator("body").innerText();
record("ko title", koText.includes("법령 월간 점검"), "");
record("ko form registry", koText.includes("서식 레지스트리") && koText.includes("검증 전"), "");
record("ko seed code", koText.includes("01/GTGT") && koText.includes("CIT_UNVERIFIED"), "");
await page.screenshot({ path: path.join(outDir, "ko-desktop.png"), fullPage: true });

await context.addCookies([{ name: "vfbcai_locale", value: "vi", url: base }]);
await page.goto(`${base}/company/accounting/legal-reviews`, { waitUntil: "networkidle" });
const viText = await page.locator("body").innerText();
record("vi title", viText.includes("Kiểm tra pháp lý hàng tháng"), "");
record("vi pending badge", viText.includes("Chưa xác minh"), "");
await page.screenshot({ path: path.join(outDir, "vi-desktop.png"), fullPage: true });

await page.setViewportSize({ width: 375, height: 812 });
await page.goto(`${base}/company/accounting/legal-reviews`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
record("mobile no horizontal scroll", !overflow, `overflow=${overflow}`);
await page.screenshot({ path: path.join(outDir, "vi-375.png"), fullPage: true });

await browser.close();
const report = { checks, allPass: checks.every((c) => c.pass), sessionEmail: email };
fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!report.allPass) process.exit(2);
