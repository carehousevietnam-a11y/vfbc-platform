/**
 * CASE_06 reclassification browser trace (verification only)
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
  await page.waitForTimeout(500);
}

async function clickFirstStitch(page) {
  const clicked = await page.evaluate(() => {
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
  if (clicked) await page.waitForTimeout(500);
  return clicked;
}

async function getActiveQuestion(page) {
  return page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
    };
    const h = [...document.querySelectorAll("h3")].filter(visible).find((x) => {
      const t = (x.textContent ?? "").trim();
      return t && !t.includes("검토 내용 체크") && !t.includes("행정문서");
    });
    return h?.textContent?.trim()?.slice(0, 200) ?? null;
  });
}

async function advanceToFirstResult(page, q1, phase1Steps, tag) {
  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(800);
  await clickChoice(page, q1);
  for (const step of phase1Steps) {
    if (await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible().catch(() => false)) break;
    await clickChoice(page, step);
  }
  for (let i = 0; i < 14; i++) {
    if (await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible().catch(() => false)) break;
    if (await page.locator('input[name="name"]').isVisible().catch(() => false)) break;
    if (await page.getByRole("heading", { name: /간단한 자료가 있으면 함께 첨부/ }).isVisible().catch(() => false)) break;
    if (!(await clickFirstStitch(page))) break;
  }
  const skip = page.getByRole("button", { name: /자료 없이 계속하기/ });
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
    await page.waitForTimeout(700);
  }
  if (await page.locator('input[name="name"]').isVisible().catch(() => false)) {
    const suffix = String(Date.now()).slice(-8);
    await page.locator('input[name="name"]').fill(`QA ${tag}`);
    await page.locator('input[name="phone"]').fill(`090${suffix}`);
    await page.locator('input[name="address"]').fill("Quan 7");
    await page.locator('input[name="email"]').fill(`${tag}-${Date.now()}@test.vfbcai.local`);
    await page.locator('input[name="kakao_id"]').fill(`qa${suffix}`);
    await page.locator('input[name="agreeTerms"]').check();
    await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  }
  await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).waitFor({ timeout: 120_000 });
}

const browser = await chromium.launch({ headless: true });
const out = {};

try {
  // CASE_06 unclear entry → Phase2 reclassification path (scenario E: payment)
  const p06e = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await advanceToFirstResult(
    p06e,
    "무슨 내용인지 잘 모르겠습니다",
    [
      "특정 기관",
      "돈을 납부하라는 내용으로 보입니다",
      "돈을 납부하거나 비용을 처리해야 하는 것으로 보입니다",
      "기한이 있다는 것은 알지만",
      "무엇을 해야 하는지",
    ],
    "case06E",
  );

  await p06e.getByRole("button", { name: /개인화?\s*상세\s*검토\s*하기/ }).click();
  await p06e.waitForTimeout(1200);
  const trace06 = [];
  for (let i = 0; i < 10; i++) {
    const body = await p06e.evaluate(() => document.body.innerText);
    trace06.push({
      step: i,
      question: await getActiveQuestion(p06e),
      hasActualCore: body.includes("해결해야 하는 핵심"),
      hasReclass: body.includes("사건") || body.includes("재분류"),
      hasPayment: body.includes("납부"),
    });
    if (body.includes("2차 상세검토에 필요한 자료")) break;
    await clickFirstStitch(p06e);
    await p06e.waitForTimeout(700);
  }
  out.CASE_06_E = { trace: trace06 };
  await p06e.close();
} finally {
  await browser.close();
}

console.log(JSON.stringify(out, null, 2));
