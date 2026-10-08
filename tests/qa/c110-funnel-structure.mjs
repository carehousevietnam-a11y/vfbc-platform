/**
 * C1.10 — Admin vs RE funnel structure lines (90s step timeout).
 * Usage: node tests/qa/c110-funnel-structure.mjs [baseUrl]
 */
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.argv[2] ?? "http://localhost:3000";
const outDir =
  process.argv[3] ?? path.join("C:", "vfbcai-qa-output", "c110-structure");
const STEP_MS = 90_000;

const routes = [
  { id: "admin", path: "/verify/admin" },
  { id: "re", path: "/verify/real-estate" },
];

function extractStructure(pageText) {
  const lines = pageText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const pick = (re) => lines.filter((l) => re.test(l));
  return {
    choiceBadges: pick(/^0[1-9] /).length,
    directExplainHint: pick(/선택지에 없는 내용이 있다면|선택지로 설명하기 어려운/).length,
    directExplainBtn: pick(/직접 입력/).length,
    questionGuide: pick(/^QUESTION GUIDE$/i).length,
    officialSources: pick(/^OFFICIAL SOURCES$/i).length,
    quotationReport: pick(/^QUOTATION REPORT$/i).length,
    reviewCheck: pick(/검토 내용 체크/).length,
    activeQuestion: lines.find((l) => l.endsWith("?") && l.length < 120) ?? null,
    collapsedAnswers: pick(/^.+\s.{10,80}$/).slice(0, 5),
  };
}

async function withTimeout(promise, ms, label) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`TIMEOUT: ${label}`)), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function walkPath(page, pathMode) {
  const steps = [];
  const maxSteps = 25;
  for (let i = 0; i < maxSteps; i++) {
    const body = await withTimeout(
      page.locator("body").innerText(),
      STEP_MS,
      `read step ${i}`,
    );
    const structure = extractStructure(body);
    steps.push({ step: i, structure, sample: body.slice(0, 800) });

    const stitchButtons = page.locator(
      'button:has-text("01 "), button:has-text("02 "), button:has-text("03 ")',
    );
    const count = await stitchButtons.count();
    if (count === 0) break;

    const idx = pathMode === "first" ? 0 : Math.max(0, count - 1);
    const btn = stitchButtons.nth(idx);
    const name = await btn.innerText().catch(() => "");
    if (!name.trim()) break;
    await withTimeout(btn.click(), STEP_MS, `click step ${i}`);
    await page.waitForTimeout(400);
  }
  return steps;
}

await mkdir(outDir, { recursive: true });
const report = { base, capturedAt: new Date().toISOString(), routes: {} };

const browser = await chromium.launch({ headless: true });
for (const route of routes) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  try {
    await withTimeout(page.goto(`${base}${route.path}`), STEP_MS, "goto");
    await page.waitForTimeout(1500);
    const path1 = await walkPath(page, "first");
    report.routes[route.id] = { path1 };
  } catch (e) {
    report.routes[route.id] = { error: String(e) };
  }
  await context.close();
}
await browser.close();

const outFile = path.join(outDir, "structure-report.json");
await writeFile(outFile, JSON.stringify(report, null, 2), "utf8");
console.log(outFile);
