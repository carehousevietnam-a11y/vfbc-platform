/** Playwright UI diag — booleans only, one screenshot. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = path.join(repoRoot, "tests/qa/_output/p9-carryover");
fs.mkdirSync(outDir, { recursive: true });
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

async function sessionForEmail(email) {
  const anon = createClient(st.API_URL, st.ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await anon.auth.signInWithPassword({ email, password: config.password });
  if (error || !data.session) throw new Error("sign_in");
  return data.session;
}
async function authCookiesFor(email) {
  const jar = [];
  const client = createServerClient(st.API_URL, st.ANON_KEY, {
    cookies: {
      getAll() {
        return jar;
      },
      setAll(cookiesToSet) {
        for (const c of cookiesToSet) {
          const idx = jar.findIndex((x) => x.name === c.name);
          if (idx >= 0) jar[idx] = c;
          else jar.push(c);
        }
      },
    },
  });
  const { error } = await client.auth.signInWithPassword({ email, password: config.password });
  if (error) throw error;
  return jar
    .filter((c) => c.name && typeof c.value === "string" && c.value.length > 0)
    .map((c) => ({
      name: c.name,
      value: c.value,
      domain: "localhost",
      path: c.options?.path || "/",
    }));
}

const session = await sessionForEmail(config.accounts.org_a_owner);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: "vfbcai_locale", value: "ko", domain: "localhost", path: "/" }]);
await ctx.addCookies(await authCookiesFor(config.accounts.org_a_owner));
await ctx.addInitScript((p) => localStorage.setItem(p.key, p.raw), {
  key: storageKey,
  raw: JSON.stringify(session),
});
const page = await ctx.newPage();
const consoleErrors = [];
const badResponses = [];
page.on("pageerror", (e) => consoleErrors.push(String(e.message || e).slice(0, 120)));
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 120));
});
page.on("response", (r) => {
  if (r.status() >= 400) {
    const u = r.url().replace(base, "");
    if (!badResponses.includes(u)) badResponses.push(u.slice(0, 100));
  }
});
await page.goto(`${base}/company/accounting/transactions?status=draft`, { waitUntil: "networkidle", timeout: 120000 });
let hydrated = false;
try {
  await page.waitForFunction(() => (document.body?.innerText || "").trim().length > 80, { timeout: 90000 });
  hydrated = true;
} catch {
  hydrated = false;
}
const shot = path.join(outDir, "diag-empty-list.png");
await page.screenshot({ path: shot, fullPage: true });
const body = await page.locator("body").innerText();
const lsKeyLen = await page.evaluate((key) => localStorage.getItem(key)?.length ?? 0, storageKey);
const out = {
  url: page.url(),
  storageKey,
  lsKeyLen,
  ulButtons: await page.locator("ul li button").count(),
  pendingApproval: await page.getByTestId("accounting-workspace-pending-approval").count(),
  signInPrompt: body.includes("로그인한 기업회원만"),
  emptyList: body.includes("조건에 맞는 거래가 없습니다"),
  txnLoading: body.includes("거래 정보를 불러오는 중"),
  gateLoadingEl: await page.getByTestId("accounting-workspace-gate-loading").count(),
  htmlLen: (await page.content()).length,
  bodyLen: body.length,
  hydrated,
  consoleErrorCount: consoleErrors.length,
  consoleErrorHead: consoleErrors[0] ?? null,
  badResponses,
};
await browser.close();
console.log(JSON.stringify(out));
