/**
 * Admin Phase2 persist + restore smoke — console/API verification
 */
import { chromium } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";

async function click(page, text) {
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
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => {
      const t = (b.textContent ?? "").trim();
      return /^\d{2}/.test(t) && !t.includes("직접 설명하기");
    });
    btn?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  });
  await page.waitForTimeout(500);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const consoleErrors = [];
const persistResponses = [];

page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("response", async (res) => {
  if (res.url().includes("/api/admin-verify-meta")) {
    persistResponses.push({ status: res.status(), ok: res.ok() });
  }
});

const report = {
  persistApiCalls: [],
  consoleErrors: [],
  rlsDenied: false,
  phase2Entered: false,
  personalized: false,
  restorePhase2: false,
  expertPath: false,
};

try {
  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  for (const step of [
    "교통위반이나 문제를 알리는 통지",
    "내가 알고 있는 상황과 기관에서 말하는 내용이 서로 다른",
    "기관에서 말하는 문제가 실제로 내 상황에 해당하는지",
    "아직 아무에게도 설명하거나",
    "대응해야 하는 날짜를 확인했습니다",
  ]) {
    await click(page, step);
  }

  const skip = page.getByRole("button", { name: /자료 없이 계속하기/ });
  if (await skip.isVisible().catch(() => false)) await skip.click();

  const suffix = Date.now();
  await page.locator('input[name="name"]').waitFor({ state: "visible", timeout: 30_000 });
  await page.locator('input[name="name"]').fill("Admin Persist QA");
  await page.locator('input[name="phone"]').fill(`090${String(suffix).slice(-7)}`);
  await page.locator('input[name="address"]').fill("Quan 7");
  await page.locator('input[name="email"]').fill(`admin-persist-${suffix}@test.vfbcai.local`);
  await page.locator('input[name="kakao_id"]').fill(`qa${suffix}`);
  await page.locator('input[name="agreeTerms"]').check();
  await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).waitFor({ timeout: 120_000 });

  await page.getByRole("button", { name: /개인화?\s*상세\s*검토\s*하기/ }).click();
  await page.waitForTimeout(1200);
  report.phase2Entered = await page.getByText("2차 · 개인화 검토").isVisible().catch(() => false);

  await clickFirstStitch(page);
  await page.waitForTimeout(1200);
  await clickFirstStitch(page);
  await page.waitForTimeout(1200);

  report.persistApiCalls = [...persistResponses];

  await page.reload({ waitUntil: "networkidle" });
  await page.goto(`${BASE}/verify/admin?restore=1`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const bodyAfterRestore = await page.locator("body").innerText();
  report.restorePhase2 =
    bodyAfterRestore.includes("2차 · 개인화 검토") ||
    bodyAfterRestore.includes("추가 상황 확인");

  for (let i = 0; i < 14; i++) {
    if (await page.getByRole("heading", { name: /2차 상세검토에 필요한 자료/ }).isVisible().catch(() => false)) {
      break;
    }
    if (await page.getByRole("heading", { name: "행정문서 개인화 검토 결과" }).isVisible().catch(() => false)) {
      report.personalized = true;
      break;
    }
    await clickFirstStitch(page);
  }

  const skip2 = page.getByRole("button", { name: /자료 없이 계속하기/ });
  if (await skip2.isVisible().catch(() => false)) {
    await skip2.click();
    await page.waitForTimeout(1500);
  }

  report.personalized =
    report.personalized ||
    (await page.getByRole("heading", { name: "행정문서 개인화 검토 결과" }).isVisible().catch(() => false));

  if (report.personalized) {
    const expertBtn = page.getByRole("button", { name: "전문가 진행하기" });
    if (await expertBtn.isVisible().catch(() => false)) {
      await expertBtn.click();
      await page.waitForURL(/\/documents.*mode=expert/, { timeout: 30_000 });
      report.expertPath = true;
    }
  }
} catch (e) {
  report.error = String(e);
} finally {
  report.consoleErrors = consoleErrors.filter(
    (t) => !t.includes("Failed to load resource") && !t.includes("favicon"),
  );
  report.rlsDenied = consoleErrors.some((t) => t.includes("rls_denied"));
  report.persistAllOk =
    persistResponses.length > 0 && persistResponses.every((r) => r.ok && r.status === 200);
  await browser.close();
}

console.log(JSON.stringify(report, null, 2));
