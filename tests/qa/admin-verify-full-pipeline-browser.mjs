/**
 * Admin VERIFY full pipeline browser verification (A–F checklist evidence)
 */
import { chromium } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";

async function clickChoice(page, text) {
  await page.waitForFunction(
    (needle) => {
      const b = [...document.querySelectorAll("button")].find((x) => x.textContent?.includes(needle));
      if (!b) return false;
      b.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      return true;
    },
    text,
    { timeout: 30_000 },
  );
  await page.waitForTimeout(450);
}

async function clickFirstStitch(page) {
  return page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
    };
    const btn = [...document.querySelectorAll("button")].find((b) => {
      if (!visible(b)) return false;
      const t = (b.textContent ?? "").trim();
      return /^\d{2}/.test(t) && !t.includes("직접 설명하기");
    });
    if (!btn) return false;
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    return true;
  });
}

async function bodyHas(page, ...snips) {
  const body = await page.evaluate(() => document.body.innerText);
  return snips.every((s) => body.includes(s));
}

async function getActiveH3(page) {
  return page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
    };
    const h = [...document.querySelectorAll("h3,h4")].filter(visible).find((x) => {
      const t = (x.textContent ?? "").trim();
      return t && !t.includes("검토 내용 체크") && t.length > 8;
    });
    return h?.textContent?.trim()?.slice(0, 180) ?? null;
  });
}

const report = { steps: [], checks: {} };

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(800);

  // Q1
  await clickChoice(page, "출석하거나 설명하라는 내용");
  report.steps.push({ step: "Q1", question: await getActiveH3(page) });

  // Phase1 CASE_03
  const phase1 = [
    "왜 출석하거나 설명해야 하는지",
    "정해진 날짜에 반드시 출석해야 하는지",
    "아직 기관에 설명하거나 직접 방문하지 않았습니다",
    "출석하거나 설명해야 하는 날짜를 확인했습니다",
  ];
  for (const p of phase1) {
    await clickChoice(page, p);
    report.steps.push({ step: "phase1", pick: p, question: await getActiveH3(page) });
  }

  // advance to evidence/signup
  for (let i = 0; i < 8; i++) {
    if (await bodyHas(page, "행정문서 1차 종합 결과")) break;
    if (await bodyHas(page, "간단한 자료가 있으면")) break;
    if (!(await clickFirstStitch(page))) break;
    await page.waitForTimeout(400);
  }

  if (await bodyHas(page, "자료 없이 계속하기")) {
    await page.getByRole("button", { name: /자료 없이 계속하기/ }).click();
    await page.waitForTimeout(600);
  }

  if (await page.locator('input[name="name"]').isVisible().catch(() => false)) {
    const suffix = String(Date.now()).slice(-8);
    await page.locator('input[name="name"]').fill(`Pipeline ${suffix}`);
    await page.locator('input[name="phone"]').fill(`090${suffix}`);
    await page.locator('input[name="address"]').fill("Quan 7");
    await page.locator('input[name="email"]').fill(`pipe-${Date.now()}@test.vfbcai.local`);
    await page.locator('input[name="kakao_id"]').fill(`qa${suffix}`);
    await page.locator('input[name="agreeTerms"]').check();
    await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  }

  await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).waitFor({ timeout: 120_000 });
  report.checks.firstResult = {
    A: true,
    B: await bodyHas(page, "행정문서 1차 종합 결과"),
    dualCtaAi: await bodyHas(page, "AI 정보 보기"),
    dualCtaPaid: await bodyHas(page, "개인화 상세 검토하기"),
    dualCardLayout: await page.locator('[data-purpose="action-selection-section"]').count(),
  };

  await page.getByRole("button", { name: /개인화 상세 검토하기/ }).click();
  await page.waitForTimeout(1000);

  const phase2Trace = [];
  for (let i = 0; i < 12; i++) {
    const q = await getActiveH3(page);
    const body = await page.evaluate(() => document.body.innerText.slice(0, 600));
    phase2Trace.push({ i, q, hasBlockage: body.includes("막힌"), hasEvidenceQ: body.includes("증빙") || body.includes("자료") });
    if (body.includes("2차 상세검토에 필요한 자료")) break;
    if (body.includes("행정문서 개인화 검토 결과")) break;
    await clickFirstStitch(page);
    await page.waitForTimeout(500);
  }
  report.steps.push({ step: "phase2", trace: phase2Trace });

  if (await bodyHas(page, "2차 상세검토에 필요한 자료")) {
    report.checks.phase2EvidenceUpload = {
      A: true,
      B: true,
      adminCopy: await bodyHas(page, "공문", "통지서"),
      F: null,
    };
    await page.getByRole("button", { name: /자료 없이 계속하기/ }).click();
    await page.waitForTimeout(800);
  }

  report.checks.personalizedResult = {
    B: await bodyHas(page, "행정문서 개인화 검토 결과", "2차 개인화"),
    aiReportCta: await bodyHas(page, "AI 리포트", "AI 검토"),
    expertCta: await bodyHas(page, "전문가"),
  };

  // Mobile viewport CTA check
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle" });
  report.checks.mobileEntry = { loaded: await bodyHas(page, "행정문서") };
} finally {
  await browser.close();
}

console.log(JSON.stringify(report, null, 2));
