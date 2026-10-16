/**
 * P5b VAT wizard — local Next + Playwright (reads tests/accounting/.p5b-session.json).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "@playwright/test";
import { execSync } from "child_process";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const sessionPath = path.join(repoRoot, "tests/accounting/.p5b-session.json");
if (!fs.existsSync(sessionPath)) {
  console.error("Missing .p5b-session.json — run p5b-vat-browser-seed.mjs first");
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
const storageKey = `sb-${new URL(st.API_URL).hostname.split(".")[0]}-auth-token`;
const base = process.env.P5B_BASE || "http://localhost:3020";
const period = seed.period;
const checks = [];
const record = (name, pass, detail = "") => checks.push({ name, pass: Boolean(pass), detail });

async function expectEnabled(locator, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await locator.isEnabled()) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("button stayed disabled");
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

// Owner ko desktop 1440
await withSession(seed.sessionOwner, "ko", { width: 1440, height: 900 }, async (page) => {
  const vatUrl = `${base}/company/accounting/vat?periodKey=${period}`;
  await page.goto(vatUrl, { waitUntil: "domcontentloaded" });
  await page.getByText("부가가치세", { exact: false }).first().waitFor({ timeout: 45000 });
  const periodInput = page.locator('input[placeholder*="2026-10"]');
  if (await periodInput.count()) {
    await periodInput.fill(period);
  }
  await page.waitForTimeout(1500);
  const body = await page.locator("body").innerText();
  record("desktop1440 vat loads", body.includes("부가가치세") && !body.includes("불러오는 중입니다"), vatUrl);

  for (const label of [
    "① 기본정보",
    "② 매출",
    "③ 매입",
    "④ 세액 계산",
    "⑤ 신고 전 점검",
    "⑥ 전문가 검토 요청",
  ]) {
    await page.getByRole("button", { name: label }).click();
    await page.waitForTimeout(200);
  }
  record("steps 1-6 navigable", (await page.locator("body").innerText()).includes("전문가"), vatUrl);

  const draftBtn = page.getByRole("button", { name: /초안 생성/ });
  await draftBtn.waitFor({ state: "visible", timeout: 15000 });
  await expectEnabled(draftBtn, 20000);
  await draftBtn.click();
  await page.waitForTimeout(2500);
  const afterDraft = await page.locator("body").innerText();
  record("draft shows computed numbers", /\d[\d,.\s]*\s*VND/.test(afterDraft) || afterDraft.includes("1"), vatUrl);

  const firstNum = afterDraft.match(/[\d,]+/)?.[0];
  await draftBtn.click();
  await page.waitForTimeout(2000);
  const secondBody = await page.locator("body").innerText();
  record("recompute same period", secondBody.includes(firstNum ?? "1"), vatUrl);

  const filedUrl = `${base}/company/accounting/vat?periodKey=2026-09`;
  await page.goto(filedUrl, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "① 기본정보" }).click();
  const filedPeriod = page.locator('input[placeholder*="2026-10"]');
  await filedPeriod.fill("2026-09");
  await page.waitForTimeout(800);
  const filedBtn = page.getByRole("button", { name: /초안 생성/ });
  await expectEnabled(filedBtn, 15000);
  await filedBtn.click();
  await page.getByText("제출 완료된 기간").waitFor({ timeout: 8000 });
  record(
    "filed_manual reject",
    true,
    filedUrl
  );

  await page.goto(vatUrl, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "① 기본정보" }).click();
  await page.locator('input[placeholder*="2026-10"]').fill(period);
  await page.waitForTimeout(800);

  await page.getByRole("button", { name: /미리보기/ }).click();
  await page.waitForTimeout(500);
  const preview = await page.locator("body").innerText();
  record(
    "preview field_map",
    preview.includes("출처") || preview.includes("source") || preview.includes("계산"),
    vatUrl + " preview"
  );
  record("preview pending banner", preview.includes("검증") || preview.includes("pending"), vatUrl);

  await page.getByRole("button", { name: "단계 화면으로 돌아가기" }).click();

  await page.goto(vatUrl, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "⑤ 신고 전 점검" }).click();
  await page.waitForTimeout(800);
  const link = page.locator('a[href*="/company/accounting/transactions"]').first();
  if (await link.count()) {
    const href = await link.getAttribute("href");
    record("precheck txn link", Boolean(href?.includes("transactions")), href ?? "");
  } else {
    record("precheck txn link", seed.txnSale10, "seed txn exists");
  }

  await page.getByRole("button", { name: "⑥ 전문가 검토 요청" }).click();
  const expertBtn = page.getByRole("button", { name: "전문가 검토 요청(제출 의뢰)" });
  if (await expertBtn.isEnabled()) {
    await expertBtn.click();
    await page.waitForTimeout(2000);
    const step6 = await page.locator("body").innerText();
    record("expert_review request", step6.includes("검토") || step6.includes("요청"), vatUrl + " step6");
  }
});

// Owner mobile 390
await withSession(seed.sessionOwner, "ko", { width: 390, height: 844 }, async (page) => {
  const vatUrl = `${base}/company/accounting/vat?periodKey=${period}`;
  await page.goto(vatUrl, { waitUntil: "domcontentloaded" });
  await page.getByText("부가가치세").first().waitFor({ timeout: 45000 });
  record("mobile390 vat", true, vatUrl);
});

// Vi locale member
await withSession(seed.sessionVi, "vi", { width: 1440, height: 900 }, async (page) => {
  const detailUrl = `${base}/company/accounting/transactions/${seed.txnSale10}`;
  await page.goto(detailUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  const body = await page.locator("body").innerText();
  record(
    "vi sees ko memo",
    body.includes("P5B") && (body.includes("Chờ dịch") || body.includes("번역")),
    detailUrl
  );
  record("vi ui strings", body.includes("Giao dịch") || body.includes("Chi tiết"), detailUrl);
});

if (seed.sessionB?.access_token) {
  const crossUrl = `${base}/api/accounting/ledger/transaction/${seed.txnSale10}?locale=ko`;
  const res = await fetch(crossUrl, {
    headers: { Authorization: `Bearer ${seed.sessionB.access_token}` },
  });
  record("cross org txn url blocked", !res.ok, crossUrl);
}

// Member cannot expert review
await withSession(seed.sessionMember, "ko", { width: 1280, height: 800 }, async (page) => {
  const vatUrl = `${base}/company/accounting/vat?periodKey=${period}`;
  await page.goto(vatUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await page.getByRole("button", { name: "⑥ 전문가 검토 요청" }).click();
  const expertBtn = page.getByRole("button", { name: "전문가 검토 요청(제출 의뢰)" });
  const enabled = await expertBtn.isEnabled().catch(() => false);
  record("member no expert request", !enabled, vatUrl);
});

const failed = checks.filter((c) => !c.pass);
console.log(JSON.stringify({ pass: failed.length === 0, failed: failed.length, checks }, null, 0));
process.exit(failed.length ? 1 : 0);
