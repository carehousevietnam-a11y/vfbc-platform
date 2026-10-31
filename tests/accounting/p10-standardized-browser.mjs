/**
 * P10 standardized list — desktop 1440 + mobile 390 (text assertions).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { chromium } from "@playwright/test";

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
const base = process.env.P10_BASE || "http://localhost:3020";
const listUrl = `${base}/company/accounting/vat/standardized`;
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

async function withSession(viewport, fn) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport });
  await context.addCookies([{ name: "vfbcai_locale", value: "ko", url: base }]);
  await context.addInitScript(
    (payload) => {
      localStorage.setItem(payload.key, payload.raw);
    },
    { key: storageKey, raw: JSON.stringify(seed.sessionOwner) }
  );
  const page = await context.newPage();
  try {
    await fn(page);
  } finally {
    await browser.close();
  }
}

await withSession({ width: 1440, height: 900 }, async (page) => {
  await page.goto(listUrl, { waitUntil: "domcontentloaded" });
  await page.getByTestId("standardized-forms-page").waitFor({ timeout: 45000 });
  await page.getByTestId("accounting-tax-subnav").waitFor({ timeout: 15000 });
  const title = await page.getByRole("heading", { name: "표준 제출 문서" }).innerText();
  record("desktop_title", title.includes("표준 제출 문서"), title);
  const disclaimer = await page.getByText("VIET-TAX 표준 서식입니다").count();
  record("desktop_disclaimer", disclaimer >= 1, listUrl);
  const subnav = await page.getByRole("link", { name: "표준 제출 문서" }).count();
  record("desktop_subnav_entry", subnav >= 1, listUrl);
  const empty = await page.getByTestId("standardized-empty-state").count();
  const list = await page.getByTestId("standardized-form-list").count();
  record("desktop_list_or_empty", empty === 1 || list === 1, `empty=${empty} list=${list}`);
});

await withSession({ width: 390, height: 844 }, async (page) => {
  await page.goto(listUrl, { waitUntil: "domcontentloaded" });
  await page.getByTestId("standardized-forms-page").waitFor({ timeout: 45000 });
  const title = await page.getByRole("heading", { name: "표준 제출 문서" }).innerText();
  record("mobile_title", title.includes("표준 제출 문서"), title);
  const subnav = await page.getByTestId("accounting-tax-subnav").count();
  record("mobile_subnav", subnav === 1, listUrl);
});

const failed = checks.filter((c) => !c.pass);
console.log(JSON.stringify({ pass: failed.length === 0, checks }, null, 0));
process.exit(failed.length === 0 ? 0 : 1);
