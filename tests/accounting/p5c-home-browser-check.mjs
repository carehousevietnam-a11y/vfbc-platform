/**
 * P5c home — Playwright + session injection (reads .p5c-session.json).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "@playwright/test";
import { execSync } from "child_process";
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const sessionPath = path.join(repoRoot, "tests/accounting/.p5c-session.json");
if (!fs.existsSync(sessionPath)) {
  console.error("Missing .p5c-session.json — run p5c-home-browser-seed.mjs first");
  process.exit(1);
}
const seed = JSON.parse(fs.readFileSync(sessionPath, "utf8"));

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
const storageKey = seed.storageKey || `sb-${new URL(st.API_URL).hostname.split(".")[0]}-auth-token`;
const base = process.env.P5C_BASE || "http://localhost:3020";
const homeUrl = `${base}/company/accounting`;
const checks = [];
const record = (name, pass, detail = "") => checks.push({ name, pass: Boolean(pass), detail });

try {
  const ping = await fetch(base, { signal: AbortSignal.timeout(8000) });
  record("dev_server_up", ping.ok || ping.status < 500, base);
} catch {
  record("dev_server_up", false, "run node tests/accounting/p3c-local-next.mjs");
  console.log(JSON.stringify({ pass: false, checks }, null, 0));
  process.exit(1);
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

await withSession(seed.sessionOwner, "ko", { width: 1440, height: 900 }, async (page) => {
  await page.goto(homeUrl, { waitUntil: "domcontentloaded" });
  await page.getByTestId("accounting-home").waitFor({ timeout: 45000 });
  await page.getByText("세무·회계 홈").waitFor({ timeout: 15000 });
  await page.getByTestId("home-recent").waitFor({ timeout: 45000 });
  await page.getByTestId("home-schedule").waitFor({ timeout: 45000 });

  record("desktop_home_schedule", (await page.getByTestId("home-schedule").count()) === 1, homeUrl);
  record("desktop_home_in_progress", (await page.getByTestId("home-in-progress").count()) === 1, homeUrl);
  record("desktop_home_alerts", (await page.getByTestId("home-alerts").count()) === 1, homeUrl);
  record("desktop_home_recent", (await page.getByTestId("home-recent").count()) === 1, homeUrl);

  const recentLinks = page.getByTestId("home-recent").locator("a");
  record("desktop_recent_five_max", (await recentLinks.count()) <= 5, String(await recentLinks.count()));

  const badge = page.getByTestId("due-unverified-badge");
  record("desktop_due_unverified_badge", (await badge.count()) >= 1, homeUrl);
  const badgeText = (await badge.first().innerText()).trim();
  record("desktop_no_false_certainty", badgeText.includes("미검증"), badgeText);

  const alertLink = page.getByTestId("home-alerts").locator("a").first();
  if (await alertLink.count()) {
    await alertLink.click();
    await page.waitForURL(/transactions/, { timeout: 15000 });
    const url = page.url();
    record("desktop_alert_nav_filter", url.includes("evidence=missing") || url.includes("status="), url);
  } else {
    record("desktop_alert_nav_filter", false, "no alert link");
  }

  const desktopNav = page.getByRole("navigation", { name: "세무·회계 메뉴" });
  record("desktop_nav_visible", await desktopNav.isVisible(), homeUrl);
});

await withSession(seed.sessionMember, "ko", { width: 1440, height: 900 }, async (page) => {
  const declReqs = [];
  page.on("request", (req) => {
    if (req.url().includes("accounting_declarations")) declReqs.push(req.url());
  });
  await page.goto(homeUrl, { waitUntil: "networkidle", timeout: 60000 });
  await page.getByTestId("accounting-home").waitFor({ timeout: 45000 });
  record("member_no_decl_requests", declReqs.length === 0, `count=${declReqs.length}`);
  record("member_no_schedule_dom", (await page.getByTestId("home-schedule").count()) === 0, homeUrl);
  record("member_no_in_progress_dom", (await page.getByTestId("home-in-progress").count()) === 0, homeUrl);
  record("member_alerts_visible", (await page.getByTestId("home-alerts").count()) === 1, homeUrl);
  record("member_recent_visible", (await page.getByTestId("home-recent").count()) === 1, homeUrl);
});

await withSession(seed.sessionOwner, "ko", { width: 375, height: 812 }, async (page) => {
  await page.goto(homeUrl, { waitUntil: "domcontentloaded" });
  await page.getByTestId("accounting-mobile-tabs").waitFor({ timeout: 45000 });
  const tabs = page.getByTestId("accounting-mobile-tabs");
  const tabText = await tabs.innerText();
  record("mobile375_tabs_four", /홈/.test(tabText) && /거래 입력/.test(tabText) && /세금 신고/.test(tabText) && /더보기/.test(tabText), tabText.slice(0, 80));
  record("mobile375_current_home", (await tabs.locator('[aria-current="page"]').count()) >= 1, homeUrl);
  const desktopNav = page.getByRole("navigation", { name: "세무·회계 메뉴" });
  record("mobile375_desktop_nav_hidden", !(await desktopNav.isVisible()), homeUrl);
  await page.getByRole("link", { name: "더보기" }).click();
  await page.waitForURL(/\/more/, { timeout: 15000 });
  record("mobile375_more_page", page.url().includes("/company/accounting/more"), page.url());
  const moreBody = await page.locator("body").innerText();
  record(
    "mobile375_more_visible_links",
    moreBody.includes("장부 조회") && moreBody.includes("내 회사") && !moreBody.includes("신고 결과") && !moreBody.includes("증빙·서류"),
    page.url()
  );
});

await withSession(seed.sessionC, "ko", { width: 1440, height: 900 }, async (page) => {
  await page.goto(homeUrl, { waitUntil: "domcontentloaded" });
  await page.getByTestId("accounting-home").waitFor({ timeout: 45000 });
  const body = await page.locator("body").innerText();
  record("empty_org_c_copy", body.includes("거래가 없습니다") || body.includes("거래 입력"), homeUrl);
  record(
    "empty_org_c_cta",
    (await page.getByRole("link", { name: "거래 입력" }).count()) >= 1,
    homeUrl
  );
});

await withSession(seed.sessionOwner, "ko", { width: 1440, height: 900 }, async (page) => {
  await page.goto(homeUrl, { waitUntil: "domcontentloaded" });
  await page.getByTestId("home-recent").waitFor({ timeout: 45000 });
  const body = await page.getByTestId("home-recent").innerText();
  record("locale_ko_date_amount", body.includes(seed.dateKo) && body.includes(seed.amountKo), body.slice(0, 120));
});

await withSession(seed.sessionVi, "vi", { width: 1440, height: 900 }, async (page) => {
  await page.goto(homeUrl, { waitUntil: "domcontentloaded" });
  await page.getByTestId("home-recent").waitFor({ timeout: 45000 });
  const body = await page.getByTestId("home-recent").innerText();
  record(
    "locale_vi_date_amount",
    body.includes(seed.dateVi) && body.includes(seed.amountVi),
    body.slice(0, 120)
  );
  const title = await page.getByRole("heading", { level: 1 }).innerText();
  record("locale_vi_labels", title.includes("thuế") || title.includes("Thuế") || title.includes("Trang chủ"), title);
});

const failed = checks.filter((c) => !c.pass);
console.log(JSON.stringify({ pass: failed.length === 0, total: checks.length, failed: failed.length, checks }, null, 0));
process.exit(failed.length ? 1 : 0);
