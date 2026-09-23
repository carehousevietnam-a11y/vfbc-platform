import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";
const OUT = path.join("qa-ui-final", "2026-09-20", "post-fix-v2");

const VIEWPORTS = [
  { id: "pc-1440", width: 1440, height: 900 },
  { id: "pc-1280", width: 1280, height: 800 },
  { id: "mobile-430", width: 430, height: 932 },
  { id: "mobile-390", width: 390, height: 844 },
  { id: "mobile-375", width: 375, height: 812 },
];

const SCREENS = [
  { id: "check-trc-landing", path: "/check/trc" },
  { id: "register-company-landing", path: "/register/company" },
  { id: "verify-admin-landing", path: "/verify/admin" },
  { id: "verify-re-landing", path: "/verify/real-estate" },
  { id: "register-company-q1", path: "/register/company?start=check" },
];

function measureOverflow() {
  const vw = document.documentElement.clientWidth;
  const sw = document.documentElement.scrollWidth;
  const overflowing = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) continue;
    if (r.right > vw + 2 || r.left < -2) {
      overflowing.push({
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60),
        right: Math.round(r.right),
        vw,
      });
      if (overflowing.length >= 8) break;
    }
  }
  return { horizontalScrollbar: sw > vw + 2, overflowing };
}

async function waitSettled(page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(2000);
  await page.waitForSelector("button", { timeout: 15000 }).catch(() => {});
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = [];

  try {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();

      for (const screen of SCREENS) {
        try {
          await page.goto(`${BASE}${screen.path}`, { waitUntil: "load", timeout: 60_000 });
        } catch {
          await page.goto(`${BASE}${screen.path}`, { waitUntil: "commit", timeout: 60_000 });
        }
        await waitSettled(page);
        const name = `${screen.id}__${vp.id}`;
        const vpPath = path.join(OUT, `${name}__viewport.png`);
        const fpPath = path.join(OUT, `${name}__full.png`);
        await page.screenshot({ path: vpPath });
        await page.screenshot({ path: fpPath, fullPage: true });
        const metrics = await page.evaluate(measureOverflow);
        report.push({ screen: screen.id, viewport: vp.id, ...metrics });
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  const jsonPath = path.join(OUT, "overflow-report.json");
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");
  const fails = report.filter((r) => r.horizontalScrollbar || r.overflowing.length);
  console.log(JSON.stringify({ out: OUT, captured: report.length, overflowHits: fails.length, fails }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
