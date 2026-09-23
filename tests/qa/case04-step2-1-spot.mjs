/**
 * CASE_04 STEP2-1 — product browser spot (LEVEL 3).
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";
const OUT = path.join(process.cwd(), "test-results", "case04-step2-1-spot");
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
  await page.waitForTimeout(500);
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

const report = { base: BASE, steps: [] };

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle", timeout: 60_000 });
  await clickChoice(page, "추가 서류");
  await page.waitForFunction(
    () => document.body.innerText.includes("다시 하라고 안내했나요"),
    { timeout: 45_000 },
  );

  const expect = [
    "다시 하라고 안내했나요",
    "가장 확인하고 싶은 것",
    "어떻게 대응하셨나요",
    "언제까지 보완해야",
  ];
  const picks = ["빠진 자료", "어떤 자료를 더", "아직 보완", "확인하지 못"];

  for (let i = 0; i < expect.length; i++) {
    const label = await activeQuestion(page);
    const pass = label.includes(expect[i].slice(0, 6));
    report.steps.push({ index: i + 1, label, expect: expect[i], pass });
    if (!pass) break;
    await clickChoice(page, picks[i]);
  }

  report.phase1Pass = report.steps.every((s) => s.pass);
  report.pass = report.phase1Pass;
  await page.screenshot({ path: path.join(OUT, "p1-done.png"), fullPage: true });
} catch (e) {
  report.error = String(e.message ?? e);
  report.pass = false;
} finally {
  await browser.close();
}

fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(report.pass ? 0 : 1);
