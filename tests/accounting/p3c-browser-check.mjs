/**
 * Browser evidence for the held P3c seed. Talks only to the local Next port.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "@playwright/test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = path.join(repoRoot, "tests/qa/_output/p3c-ledger");
const report = JSON.parse(fs.readFileSync(path.join(outDir, "report.json"), "utf8"));
const base = process.env.P3C_BASE || "http://localhost:3020";
const checks = [];

function record(name, pass, detail) {
  checks.push({ name, pass: Boolean(pass), detail: detail ?? "" });
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await context.addCookies([{ name: "vfbcai_locale", value: "ko", url: base }]);
await context.addInitScript((payload) => {
  localStorage.setItem(payload.key, payload.raw);
}, {
  key: "sb-127-auth-token",
  raw: JSON.stringify(report.session),
});
const page = await context.newPage();
const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 240));
});
page.on("pageerror", (err) => consoleErrors.push(String(err).slice(0, 240)));

await page.goto(`${base}/company/accounting/ledger`, { waitUntil: "networkidle" });
await page.getByText("1,000,000").first().waitFor({ timeout: 20000 }).catch(() => undefined);
const koText = await page.locator("body").innerText();
record("ko ledger title", koText.includes("장부 조회"), "");
record("ko confirmed amount", koText.includes("1,000,000"), "");
record("ko date", koText.includes("2026.10.16"), "");
record("ko totals", koText.includes("합계") && koText.includes("2,000,000"), "");
record("ko memo original", koText.includes(report.memoKo), "");
await page.screenshot({ path: path.join(outDir, "ko-ledger-desktop.png"), fullPage: true });

const hydrationKo = consoleErrors.filter((line) => /hydrat/i.test(line));
record("ko hydration", hydrationKo.length === 0, hydrationKo[0] || "none");

await context.addCookies([{ name: "vfbcai_locale", value: "vi", url: base }]);
consoleErrors.length = 0;
await page.goto(`${base}/company/accounting/ledger`, { waitUntil: "networkidle" });
await page.getByText("1.000.000").first().waitFor({ timeout: 20000 }).catch(() => undefined);
const viText = await page.locator("body").innerText();
record("vi title", viText.includes("Tra cứu sổ cái"), "");
record("vi amount", viText.includes("1.000.000"), "");
record("vi date", viText.includes("16/10/2026"), "");
record("vi memo original", viText.includes(report.memoKo), "");
record("vi translation badge", viText.includes("Chờ dịch"), "");
record("vi fx badge", viText.includes("Quy tắc quy đổi chưa kiểm chứng"), "");
await page.screenshot({ path: path.join(outDir, "vi-ledger-desktop.png"), fullPage: true });
const hydrationVi = consoleErrors.filter((line) => /hydrat/i.test(line));
record("vi hydration", hydrationVi.length === 0, hydrationVi[0] || "none");

await page.setViewportSize({ width: 375, height: 812 });
await page.goto(`${base}/company/accounting/ledger`, { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
const mobile = await page.locator("body").innerText();
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
record("mobile ledger visible", mobile.includes("16/10/2026") && mobile.includes("1.000.000"), "");
record("mobile fx badge", mobile.includes("Quy tắc quy đổi chưa kiểm chứng"), "");
record("mobile no horizontal scroll", !overflow, `scrollWidth=${overflow}`);
const tabLabels = ["홈", "거래 입력", "세금 신고", "더보기"];
const tabsFound = tabLabels.filter((label) => mobile.includes(label));
record("mobile bottom tabs 4", tabsFound.length === 4, `found=${tabsFound.join(",") || "none"}`);
await page.screenshot({ path: path.join(outDir, "vi-ledger-375.png"), fullPage: true });

await page.goto(`${base}/company/accounting/transactions/${report.vndTxnId}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const detail = await page.locator("body").innerText();
record("mobile detail memo", detail.includes(report.memoKo) && detail.includes("Chờ dịch"), "");
record("mobile detail amount", detail.includes("1.000.000"), "");
const detailOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
record("mobile detail no horizontal scroll", !detailOverflow, "");
await page.screenshot({ path: path.join(outDir, "vi-detail-375.png"), fullPage: true });

await browser.close();
const summary = { checks, allPass: checks.every((row) => row.pass) };
fs.writeFileSync(path.join(outDir, "browser-checks.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
if (!summary.allPass) process.exit(2);
