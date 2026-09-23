/**
 * CASE_03 STEP2-1 — Audit H regression spot (other CASE entry Q1 + Phase1 first label).
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";
const OUT = path.join(process.cwd(), "test-results", "admin-regression-h-spot");
fs.mkdirSync(OUT, { recursive: true });

async function clickChoice(page, text) {
  await page.waitForFunction(
    (needle) => {
      const b = [...document.querySelectorAll("button")].find((x) =>
        x.textContent?.includes(needle),
      );
      if (!b) return false;
      b.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      return true;
    },
    text,
    { timeout: 45_000 },
  );
  await page.waitForTimeout(600);
}

async function activeQuestion(page) {
  return page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
    };
    const labels = [...document.querySelectorAll("h3, h4")]
      .filter(visible)
      .map((el) => (el.textContent ?? "").trim())
      .filter((t) => t.includes("?"));
    return labels[labels.length - 1] ?? "";
  });
}

const report = { base: BASE, cases: [] };

const browser = await chromium.launch({ headless: true });

async function spotCase(page, name, q1Needle, p1Needle) {
  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(600);
  await clickChoice(page, q1Needle);
  await page.waitForTimeout(400);
  const label = await activeQuestion(page);
  const pass = label.includes(p1Needle);
  report.cases.push({ name, q1Needle, label, p1Needle, pass });
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  return pass;
}

try {
  const p02 = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const p04 = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const ok02 = await spotCase(p02, "CASE_02", "벌금이나 비용", "납부");
  const ok04 = await spotCase(p04, "CASE_04", "추가 서류", "다시 하라고");
  await p02.close();
  await p04.close();
  report.pass = ok02 && ok04;
} catch (e) {
  report.error = String(e.message ?? e);
  report.pass = false;
} finally {
  await browser.close();
}

fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(report.pass ? 0 : 1);
