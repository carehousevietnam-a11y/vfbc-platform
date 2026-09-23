/**
 * CASE_03 STEP2-1 — product browser spot (LEVEL 3), no engine import.
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";
const OUT = path.join(process.cwd(), "test-results", "case03-step2-1-spot");
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
  await page.waitForTimeout(700);
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
  await page.waitForTimeout(800);

  await clickChoice(page, "출석하거나 설명");
  await page.waitForFunction(
    () => {
      const t = document.body.innerText;
      return t.includes("무엇을 하라고 안내했나요");
    },
    { timeout: 45_000 },
  );

  const phase1Expect = [
    "무엇을 하라고 안내했나요",
    "무엇을 확인하려는 것 같나요",
    "어떤 대응을 하셨나요",
    "가장 확인하고 싶은 것",
    "언제까지 무엇을 해야",
  ];

  const picks = [
    "이해하지 못한",
    "특정 날짜",
    "아직 기관",
    "출석해야",
    "확인하지 못",
  ];

  for (let i = 0; i < phase1Expect.length; i++) {
    const label = await activeQuestion(page);
    const ok = label.includes(phase1Expect[i].slice(0, 8));
    report.steps.push({ phase: 1, index: i + 1, label, expectSnippet: phase1Expect[i], pass: ok });
    if (!ok) break;
    await clickChoice(page, picks[i]);
    await page.screenshot({ path: path.join(OUT, `p1-${i + 1}.png`) });
  }

  report.phase1LabelOrderPass = report.steps.filter((s) => s.phase === 1).every((s) => s.pass);

  const skipEvidence = page.getByRole("button", { name: /자료 없이 계속하기/ });
  if (await skipEvidence.isVisible().catch(() => false)) {
    await skipEvidence.click();
    await page.waitForTimeout(500);
  }

  if (await page.locator('input[name="name"]').isVisible().catch(() => false)) {
    const suffix = String(Date.now()).slice(-8);
    await page.locator('input[name="name"]').fill(`QA C03 ${suffix}`);
    await page.locator('input[name="phone"]').fill(`090${suffix}`);
    await page.locator('input[name="address"]').fill("Quan 7");
    await page.locator('input[name="email"]').fill(`qa-c03-${suffix}@test.vfbcai.local`);
    await page.locator('input[name="kakao_id"]').fill(`qa${suffix}`);
    await page.locator('input[name="agreeTerms"]').check();
    await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
    await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).waitFor({ timeout: 120_000 });
  }

  await page.getByRole("button", { name: /개인화 상세 검토하기/ }).click();
  await page.waitForTimeout(900);

  const p2Label = await activeQuestion(page);
  report.phase2FirstLabel = p2Label;
  report.phase2FactRelationshipPass =
    p2Label.includes("실제 상황") || p2Label.includes("확인이 필요");
  report.phase2NoDuplicateInquiryFocus =
    !p2Label.includes("무엇을 확인하려는 것 같나요") || report.phase1LabelOrderPass;

  await page.screenshot({ path: path.join(OUT, "phase2-first.png"), fullPage: true });
  report.pass =
    report.phase1LabelOrderPass &&
    report.phase2FactRelationshipPass &&
    report.phase2NoDuplicateInquiryFocus;
} catch (e) {
  report.error = String(e.message ?? e);
  report.pass = false;
} finally {
  await browser.close();
}

fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(report.pass ? 0 : 1);
