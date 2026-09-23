/** TEMP — admin Phase2 diagnostic */
import { chromium } from "@playwright/test";
const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";

async function clickChoice(page, text) {
  await page.waitForFunction((needle) => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent?.includes(needle));
    if (!b) return false;
    b.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    return true;
  }, text, { timeout: 30000 });
  await page.waitForTimeout(500);
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

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
try {
  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await clickChoice(page, "행정처분");
  for (let i = 0; i < 12; i++) {
    if (await page.getByRole("heading", { name: /1차 종합 결과/ }).isVisible().catch(() => false)) break;
    if (await page.locator('input[name="name"]').isVisible().catch(() => false)) break;
    if (!(await clickFirstStitch(page))) await clickChoice(page, "예");
  }
  if (await page.locator('input[name="name"]').isVisible()) {
    await page.locator('input[name="name"]').fill("Admin P2");
    await page.locator('input[name="phone"]').fill("0904444099");
    await page.locator('input[name="address"]').fill("Q7");
    await page.locator('input[name="email"]').fill(`admin-p2-${Date.now()}@test.vfbcai.local`);
    await page.locator('input[name="kakao_id"]').fill("adminp2");
    await page.locator('input[name="agreeTerms"]').check();
    await page.getByRole("button", { name: /1차 분석|종합 결과/ }).click();
    await page.getByRole("heading", { name: /1차 종합 결과/ }).waitFor({ timeout: 90000 });
  }
  await page.getByRole("button", { name: /개인화 상세검토|개인 상세/ }).first().click();
  await page.waitForTimeout(1500);
  const body = await page.evaluate(() => document.body.innerText);
  console.log(JSON.stringify({
    phase2Banner: body.includes("2차 · 개인화 검토"),
    phase2Heading: body.includes("추가 상황 확인"),
    phase1Heading: body.includes("1. 검토 내용 체크"),
    entryQ1: body.includes("어떤 행정"),
    evidence1: body.includes("1차 · 간단 자료"),
    evidence2: body.includes("2차 · 간단 자료"),
    snippet: body.slice(0, 900),
  }, null, 2));
} catch (e) {
  console.error(e.message);
} finally {
  await browser.close();
}
