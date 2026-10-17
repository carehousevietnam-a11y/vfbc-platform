/**
 * P9-5 — real browser nav + hub click audit (owner / member / pending).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "@playwright/test";
import { execSync } from "child_process";
import { createClient } from "@supabase/supabase-js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const base = process.env.P9_BASE || "http://localhost:3020";
const homeUrl = `${base}/company/accounting`;
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

const st = parseEnv(
  execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] })
);
const service = createClient(st.API_URL, st.SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const storageKey = `sb-${new URL(st.API_URL).hostname.split(".")[0]}-auth-token`;

const seed = JSON.parse(fs.readFileSync(path.join(repoRoot, "tests/accounting/.p5c-session.json"), "utf8"));

async function sessionForEmail(email) {
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

async function ensurePendingOwnerSession() {
  const email = "dev-p9-5-pending-owner@test.vfbcai.local";
  const tag = `p9-5-pending-${Date.now()}`;
  let user = (await service.auth.admin.listUsers({ page: 1, perPage: 200 })).data.users.find((u) => u.email === email);
  if (!user) {
    const { data, error } = await service.auth.admin.createUser({
      email,
      password: config.password,
      email_confirm: true,
    });
    if (error) throw error;
    user = data.user;
  } else {
    await service.auth.admin.updateUserById(user.id, { password: config.password });
  }
  await service.from("users").upsert({ id: user.id, member_type: "company" });
  const { data: org, error: orgErr } = await service
    .from("accounting_organizations")
    .insert({ name_official: `Pending ${tag}`, tax_code: `P9P${String(Date.now()).slice(-6)}`, approval_status: "pending" })
    .select("id")
    .single();
  if (orgErr) throw orgErr;
  await service.from("accounting_org_members").upsert({ org_id: org.id, user_id: user.id, role: "company_owner" });
  return sessionForEmail(email);
}

const NAV_ITEMS = [
  { label: "홈", key: "home", urlRe: /\/company\/accounting\/?$/ },
  { label: "거래 입력", key: "transactions", urlRe: /\/transactions/ },
  { label: "장부 조회", key: "ledger", urlRe: /\/ledger/ },
  { label: "세금 신고", key: "tax", urlRe: /\/vat/ },
  { label: "내 회사 정보", key: "company", urlRe: /\/profile/ },
];
const HUB_TILES = ["inquiry", "apply", "declare"];

function verdictFromPage(url, h1, body) {
  if (body.includes("이 화면은 준비 중") || body.includes("준비 중입니다")) return "안내만 있음";
  if (url.includes("/pending")) return "차단(승인 대기)";
  if (body.includes("승인된 조직")) return "차단(접근 거부)";
  if (h1) return "동작";
  return "동작";
}

async function auditAccount(label, session) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addCookies([{ name: "vfbcai_locale", value: "ko", url: base }]);
  await context.addInitScript(
    (p) => localStorage.setItem(p.key, p.raw),
    { key: storageKey, raw: JSON.stringify(session) }
  );
  const page = await context.newPage();
  const rows = [];

  await page.goto(homeUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  const hubVisible = (await page.getByTestId("accounting-home-hub").count()) > 0;

  const desktopNav = page.getByRole("navigation", { name: "세무·회계 메뉴" });
  if (await desktopNav.isVisible()) {
    for (const item of NAV_ITEMS) {
      await page.goto(homeUrl, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(800);
      if (item.key === "company" && label.includes("owner")) {
        await page.getByTestId("accounting-nav-link-company").waitFor({ state: "visible", timeout: 15000 });
      }
      const byTestId = page.getByTestId(`accounting-nav-link-${item.key}`);
      const link = (await byTestId.count()) > 0 ? byTestId : desktopNav.getByRole("link", { name: item.label });
      if ((await link.count()) === 0) {
        rows.push({ account: label, target: `상단:${item.label}`, url: "-", title: "-", verdict: "숨김", reason: "메뉴 미노출" });
        continue;
      }
      await link.first().click();
      await page.waitForURL(item.urlRe, { timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(400);
      const url = page.url();
      const h1 = (await page.locator("h1").first().innerText().catch(() => "")).trim();
      const body = await page.locator("main").innerText().catch(() => "");
      rows.push({
        account: label,
        target: `상단:${item.label}`,
        url,
        title: h1,
        verdict: verdictFromPage(url, h1, body),
        reason: "",
      });
    }
    const navText = await desktopNav.innerText();
    rows.push({
      account: label,
      target: "상단:증빙·서류(숨김확인)",
      url: "-",
      title: "-",
      verdict: !navText.includes("증빙") ? "숨김" : "노출오류",
      reason: navText,
    });
  }

  if (hubVisible) {
    for (const id of HUB_TILES) {
      await page.goto(homeUrl, { waitUntil: "domcontentloaded" });
      await page.getByTestId("accounting-home-hub").waitFor({ timeout: 60000 });
      await page.getByTestId(`accounting-home-hub-tile-${id}`).click();
      await page.waitForTimeout(1200);
      const url = page.url();
      const h1 = (await page.locator("h1").first().innerText().catch(() => "")).trim();
      const body = await page.locator("main").innerText().catch(() => "");
      rows.push({
        account: label,
        target: `허브:${id}`,
        url,
        title: h1,
        verdict: verdictFromPage(url, h1, body),
        reason: "",
      });
    }
    rows.push({
      account: label,
      target: "허브:consult(삭제확인)",
      url: "-",
      title: "-",
      verdict: (await page.getByTestId("accounting-home-hub-tile-consult").count()) === 0 ? "삭제됨" : "노출오류",
      reason: "",
    });
  } else {
    rows.push({
      account: label,
      target: "허브 전체",
      url: page.url(),
      title: (await page.locator("main").innerText()).slice(0, 60),
      verdict: "허브 미노출",
      reason: label.includes("pending") ? "승인 전" : "로딩/권한",
    });
  }

  if (label.includes("member") || label.includes("pending")) {
    await page.goto(`${base}/company/accounting/transactions`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    rows.push({
      account: label,
      target: "직접:거래 입력 URL",
      url: page.url(),
      title: (await page.locator("h1").first().innerText().catch(() => "")).trim(),
      verdict: page.url().includes("/pending") ? "차단(승인 대기)" : "동작",
      reason: "",
    });
  }

  await browser.close();
  return rows;
}

const ownerDev = await sessionForEmail(config.accounts.org_a_owner);

const pendingSession = await ensurePendingOwnerSession();

const all = [
  ...(await auditAccount("org_a_owner(dev)", ownerDev)),
  ...(await auditAccount("company_member(p5c)", seed.sessionMember)),
  ...(await auditAccount("pending_owner(p9-5)", pendingSession)),
];

const outPath = path.join(repoRoot, "tests/qa/_output/p9-5-nav-click-audit.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(all, null, 2));
console.log(JSON.stringify({ rows: all.length, outPath, sample: all.slice(0, 3) }, null, 2));
