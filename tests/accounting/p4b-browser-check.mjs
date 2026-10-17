/**
 * P4b-1 ledger export UI check against the held P3c seed (local Next port only).
 * Usage: node tests/accounting/p3c-ledger-seed.mjs hold && node tests/accounting/p4b-browser-check.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "@playwright/test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const seedDir = path.join(repoRoot, "tests/qa/_output/p3c-ledger");
const outDir = path.join(repoRoot, "tests/qa/_output/p4b-export");
const report = JSON.parse(fs.readFileSync(path.join(seedDir, "report.json"), "utf8"));
const base = process.env.P3C_BASE || "http://localhost:3020";
const checks = [];
const record = (name, pass, detail) => checks.push({ name, pass: Boolean(pass), detail: detail ?? "" });
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });

async function run(locale, viewport, labels, shot) {
  const context = await browser.newContext({ viewport, acceptDownloads: true });
  await context.addCookies([{ name: "vfbcai_locale", value: locale, url: base }]);
  await context.addInitScript(
    (payload) => localStorage.setItem(payload.key, payload.raw),
    { key: "sb-127-auth-token", raw: JSON.stringify(report.session) }
  );
  const page = await context.newPage();
  await page.goto(`${base}/company/accounting/ledger`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: labels.button }).waitFor({ timeout: 20000 });
  await page.getByRole("button", { name: labels.button }).click();
  const warnTitle = page.getByText(labels.warnTitle);
  await warnTitle.waitFor({ timeout: 20000 });
  const body = await page.locator("body").innerText();
  record(`${shot} warning list shown`, body.includes(labels.missing) && body.includes(labels.open), "");
  const overflowWarn = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  record(`${shot} no horizontal scroll (warning)`, !overflowWarn, "");
  await page.screenshot({ path: path.join(outDir, `${shot}.png`), fullPage: true });
  const isMobile = viewport.width <= 375;
  const mobileTabs = page.getByTestId("accounting-mobile-tabs");
  const koTabs = ["홈", "거래 입력", "세금 신고", "더보기"];
  const viTabs = ["Trang chủ", "Nhập giao dịch", "Khai thuế", "Thêm"];
  if (isMobile) {
    await mobileTabs.waitFor({ timeout: 20000 });
    const tabText = await mobileTabs.innerText();
    const tabLabels = locale === "vi" ? viTabs : koTabs;
    const tabsFound = tabLabels.filter((label) => tabText.includes(label));
    record(`${shot} mobile bottom tabs 4`, tabsFound.length === 4, `found=${tabsFound.join(",") || "none"}`);
  } else {
    const visible = await mobileTabs.isVisible();
    record(`${shot} desktop no bottom tab`, !visible, visible ? "visible" : "hidden");
  }
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 30000 }),
    page.getByRole("button", { name: labels.proceed }).click(),
  ]);
  const saved = path.join(outDir, `${shot}.xlsx`);
  await download.saveAs(saved);
  const head = fs.readFileSync(saved).subarray(0, 2).toString("latin1");
  record(`${shot} download is xlsx(zip)`, head === "PK" && download.suggestedFilename().endsWith(".xlsx"), download.suggestedFilename());
  await page.waitForLoadState("networkidle").catch(() => undefined);
  await page.waitForTimeout(500);
  const overflowEnd = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  record(`${shot} no horizontal scroll (after)`, !overflowEnd, "");
  await context.close();
}

await run(
  "ko",
  { width: 1280, height: 900 },
  { button: "엑셀 다운", warnTitle: "베트남어 확정이 필요한 적요가 있습니다.", missing: "베트남어 없음", open: "거래 열기", proceed: "확인하고 내려받기" },
  "ko-desktop"
);
await run(
  "vi",
  { width: 375, height: 812 },
  { button: "Tải Excel", warnTitle: "Có diễn giải cần xác nhận tiếng Việt.", missing: "Chưa có tiếng Việt", open: "Mở giao dịch", proceed: "Đã hiểu, tải về" },
  "vi-375"
);

await browser.close();
const summary = { checks, allPass: checks.every((c) => c.pass) };
fs.writeFileSync(path.join(outDir, "browser-checks.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
if (!summary.allPass) process.exit(2);
