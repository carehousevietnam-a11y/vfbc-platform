/**
 * P9-2 — accounting home hub (screenshots + navigation smoke).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "@playwright/test";
import { execSync } from "child_process";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const sessionPath = path.join(repoRoot, "tests/accounting/.p5c-session.json");
const outDir = path.join(repoRoot, "tests/qa/_output/p9-5-home");
fs.mkdirSync(outDir, { recursive: true });

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
const base = process.env.P9_BASE || "http://localhost:3020";
const homeUrl = `${base}/company/accounting`;
const checks = [];
const record = (name, pass, detail = "") => checks.push({ name, pass: Boolean(pass), detail });

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
  await page.getByTestId("accounting-home-hub").waitFor({ timeout: 60000 });
  record("hub_visible_ko_desktop", true);
  record("brand_viet_tax", (await page.getByTestId("accounting-home-hub-brand").innerText()).includes("VIET TAX"));
  record("brand_by_vfbcai", (await page.getByTestId("accounting-home-hub-brand").innerText()).includes("by VFBCAI"));
  const shieldSrc = await page.getByTestId("accounting-home-hub-shield").getAttribute("src");
  record("brand_shield_asset", shieldSrc === "/vfbcai-shield-logo.png", shieldSrc ?? "");
  record("no_my_viet_check", !(await page.locator("body").innerText()).includes("MY VIET CHECK"));
  record("hub_icons_three", (await page.getByTestId("accounting-home-hub-icons").locator("button").count()) === 3);
  record("hub_no_consult_tile", (await page.getByTestId("accounting-home-hub-tile-consult").count()) === 0);
  const desktopNav = page.getByRole("navigation", { name: "세무·회계 메뉴" });
  const navText = await desktopNav.innerText();
  record("nav_hides_placeholder", !navText.includes("증빙") && !navText.includes("신고 결과"), navText);
  record("hub_shortcuts_two", (await page.getByTestId("accounting-home-hub-shortcuts").locator("a").count()) === 2);
  record("funnel_hidden_when_logged_in", (await page.getByTestId("accounting-funnel-entry-links").count()) === 0);
  const body = await page.locator("body").innerText();
  record("no_vnk_string_ko", !/\bVNK\b/i.test(body));
  await page.screenshot({ path: path.join(outDir, "ko-desktop.png"), fullPage: true });

  await page.getByTestId("accounting-home-hub-tile-inquiry").click();
  await page.waitForURL(/\/company\/accounting\/ledger/, { timeout: 30000 });
  record("tile_inquiry_nav", true, page.url());

  await page.goto(homeUrl, { waitUntil: "load", timeout: 90000 });
  await page.getByTestId("accounting-home-hub-tile-apply").click();
  await page.waitForURL(/\/company\/accounting\/transactions/, { timeout: 30000 });
  record("tile_apply_nav", true, page.url());

  await page.goto(homeUrl, { waitUntil: "load", timeout: 90000 });
  await page.getByTestId("accounting-home-hub-shortcuts").getByRole("link", { name: "설정" }).click();
  await page.waitForURL(/\/company\/accounting\/company/, { timeout: 30000 });
  record("shortcut_settings_nav", true, page.url());
});

await withSession(seed.sessionOwner, "vi", { width: 375, height: 812 }, async (page) => {
  await page.goto(homeUrl, { waitUntil: "domcontentloaded" });
  await page.getByTestId("accounting-home-hub").waitFor({ timeout: 60000 });
  const body = await page.locator("body").innerText();
  record("no_vnk_string_vi", !/\bVNK\b/i.test(body));
  record("vi_hub_title", body.includes("Trang chủ thuế"), body.slice(0, 80));
  await page.screenshot({ path: path.join(outDir, "vi-375.png"), fullPage: true });
});

const failed = checks.filter((c) => !c.pass);
console.log(JSON.stringify({ pass: failed.length === 0, outDir, checks }, null, 2));
if (failed.length) process.exit(1);
