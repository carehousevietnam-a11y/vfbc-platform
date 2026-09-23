/**
 * VERIFIER — Admin VERIFY P0 Product Closure pilot
 * Run: node tests/qa/pilot-admin-verify-p0-closure.mjs
 */
import { chromium } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";

async function clickChoiceByText(page, text) {
  await page.waitForFunction(
    (needle) => {
      const btns = [...document.querySelectorAll("button")];
      const b = btns.find((x) => x.textContent?.includes(needle));
      if (!b) return false;
      b.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      return true;
    },
    text,
    { timeout: 25_000 },
  );
  await page.waitForTimeout(500);
}

async function clickFirstStitch(page) {
  return page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")].filter((btn) => {
      const t = (btn.textContent ?? "").trim();
      return /^\d{2}/.test(t) && !t.includes("직접 설명하기");
    });
    const btn = btns[0];
    if (!btn) return false;
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    return true;
  });
}

async function submitSignupIfVisible(page) {
  if (!(await page.locator('input[name="name"]').isVisible().catch(() => false))) return false;
  await page.locator('input[name="name"]').fill("Pilot Admin P0");
  await page.locator('input[name="phone"]').fill("0904444102");
  await page.locator('input[name="address"]').fill("Quan 7, TP.HCM");
  await page.locator('input[name="email"]').fill(`pilot-admin-${Date.now()}@test.vfbcai.local`);
  await page.locator('input[name="kakao_id"]').fill("pilotadmin");
  await page.locator('input[name="agreeTerms"]').check();
  await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  await page.waitForTimeout(2000);
  return true;
}

async function clickThrough(page, steps) {
  for (const step of steps) {
    const oneResult = await page
      .getByRole("heading", { name: "행정문서 1차 종합 결과" })
      .isVisible()
      .catch(() => false);
    if (oneResult) return;
    if (await page.locator('input[name="name"]').isVisible().catch(() => false)) return;
    await clickChoiceByText(page, step);
  }
  for (let i = 0; i < 6; i++) {
    const oneResult = await page
      .getByRole("heading", { name: "행정문서 1차 종합 결과" })
      .isVisible()
      .catch(() => false);
    if (oneResult) return;
    if (await page.locator('input[name="name"]').isVisible().catch(() => false)) return;
    if (!(await clickFirstStitch(page))) break;
    await page.waitForTimeout(500);
  }
}

async function runCase01OneResult(page) {
  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await clickThrough(page, [
    "교통위반이나 문제를 알리는 통지",
    "내가 알고 있는 상황과 기관에서 말하는 내용이 서로 다른",
    "기관에서 말하는 문제가 실제로 내 상황에 해당하는지",
    "아직 아무에게도 설명하거나",
    "대응해야 하는 날짜를 확인했습니다",
  ]);
  await submitSignupIfVisible(page);
  return page
    .getByRole("heading", { name: "행정문서 1차 종합 결과" })
    .isVisible();
}

async function runViewport(label, viewport) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const result = { label, viewport, steps: {} };

  try {
    result.steps.case01OneResult = await runCase01OneResult(page);
    result.steps.phase2Cta = await page
      .getByRole("button", { name: /개인 상세 검토하기/ })
      .isVisible();
    if (result.steps.phase2Cta) {
      await page.getByRole("button", { name: /개인 상세 검토하기/ }).click();
      await page.waitForTimeout(800);
      for (let i = 0; i < 8; i++) {
        if (
          await page
            .getByRole("heading", { name: "행정문서 개인화 검토 결과" })
            .isVisible()
            .catch(() => false)
        ) {
          break;
        }
        if (!(await clickFirstStitch(page))) break;
        await page.waitForTimeout(500);
      }
      const skip = page.getByRole("button", { name: /자료 없이 계속하기/ });
      if (await skip.isVisible().catch(() => false)) {
        await skip.click();
        await page.waitForTimeout(800);
      }
      result.steps.personalized = await page
        .getByRole("heading", { name: "행정문서 개인화 검토 결과" })
        .isVisible()
        .catch(() => false);
    }
    result.steps.overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 2,
    );
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
  }

  await context.close();
  await browser.close();
  return result;
}

const desktop = await runViewport("desktop", { width: 1280, height: 800 });
const mobile = await runViewport("mobile", { width: 375, height: 812 });
console.log(JSON.stringify({ desktop, mobile }, null, 2));
