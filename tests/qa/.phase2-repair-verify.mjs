/** TEMP — Phase2 repair verification after fix */
import { chromium } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";
const DETAIL =
  "계약서 조건과 실제 상황 차이를 확인해야 합니다. 보증금 반환 조건이 문서와 다릅니다.";

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
    { timeout: 25000 },
  );
  await page.waitForTimeout(500);
}

async function clickFirstStitch(page) {
  return page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return (
        r.width > 0 &&
        r.height > 0 &&
        s.visibility !== "hidden" &&
        s.display !== "none" &&
        Number(s.opacity) > 0
      );
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

async function snap(page) {
  return page.evaluate(() => {
    const body = document.body.innerText;
    return {
      phase1Badge: body.includes("1차 · 간단 자료"),
      phase2Badge: body.includes("2차 · 상세 자료") || body.includes("2차 · 간단 자료"),
      phase2Banner: body.includes("2차 · 개인화 검토"),
      phase2Heading: body.includes("2차 상세검토에 필요한 자료"),
      phase1UploadHeading: body.includes("간단한 자료가 있으면 함께 첨부해주세요"),
      phase2QuestionHeading: body.includes("2. 추가 상황 확인"),
      entryQ1: body.includes("지금 부동산 관련해서"),
      personalized: body.includes("부동산 문서 2차 개인화 결과"),
      firstResult: body.includes("부동산 문서 1차 종합 결과"),
      firstResultPhase1Upload: body.includes("1차 · 간단 자료"),
    };
  });
}

async function advancePhase2(page, max = 32) {
  for (let i = 0; i < max; i++) {
    const s = await snap(page);
    if (s.personalized) return { ok: true, stage: "personalized", snap: s };
    if (s.phase2Badge || (s.phase1UploadHeading && !s.phase2Banner)) {
      return { ok: true, stage: "upload", snap: s };
    }
    const textarea = page.locator("textarea").first();
    if (await textarea.isVisible().catch(() => false)) {
      await textarea.fill(DETAIL);
      await page.evaluate(() => {
        const btn = [...document.querySelectorAll("button")].find(
          (b) => !b.disabled && /^(다음|확인|저장)/.test((b.textContent || "").trim()),
        );
        btn?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      });
      await page.waitForTimeout(700);
      continue;
    }
    if (!(await clickFirstStitch(page))) break;
    await page.waitForTimeout(700);
  }
  return { ok: false, stage: "stuck", snap: await snap(page) };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const result = { phase1: {}, phase2: {}, regression: {} };

try {
  // Phase1 regression: evidence badge before signup
  await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await clickChoice(page, "서명·납부 전");
  await clickChoice(page, "매물만 보고");
  await clickChoice(page, "전세·월세");
  await clickChoice(page, "집주인·매도인");
  await clickChoice(page, "제출·계약 요건");
  await page.getByRole("button", { name: /자료 없이/ }).waitFor({ timeout: 30000 });
  result.regression.phase1Upload = await snap(page);

  await page.getByRole("button", { name: /자료 없이/ }).click();
  await page.locator('input[name="name"]').fill("Repair Verify");
  await page.locator('input[name="phone"]').fill("0904444099");
  await page.locator('input[name="address"]').fill("Q7");
  await page.locator('input[name="email"]').fill(`repair-${Date.now()}@test.vfbcai.local`);
  await page.locator('input[name="kakao_id"]').fill("repairqa");
  await page.locator('input[name="agreeTerms"]').check();
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click({ timeout: 90000 });
  await page.getByRole("heading", { name: "부동산 문서 1차 종합 결과" }).waitFor({ timeout: 90000 });
  result.regression.firstResult = await snap(page);

  await page.getByRole("button", { name: /개인화 상세검토/ }).click();
  await page.getByText("2차 · 개인화 검토").waitFor({ timeout: 20000 });
  result.phase2.afterCta = await snap(page);

  const mid = await advancePhase2(page);
  result.phase2.advance = mid;

  if (mid.stage === "upload") {
    await page.getByRole("button", { name: /자료 없이 계속하기/ }).click();
    await page.waitForTimeout(1000);
    result.phase2.afterUpload = await snap(page);
  }

  result.pass = {
    phase2QuestionUi:
      result.phase2.afterCta?.phase2Banner &&
      result.phase2.afterCta?.phase2QuestionHeading &&
      !result.phase2.afterCta?.entryQ1,
    phase2Upload:
      mid.snap?.phase2Badge &&
      !mid.snap?.phase1Badge &&
      mid.snap?.phase2Heading,
    phase1Regression:
      result.regression.phase1Upload?.phase1Badge &&
      result.regression.phase1Upload?.phase1UploadHeading &&
      !result.regression.phase1Upload?.phase2Badge &&
      result.regression.firstResult?.firstResult,
    personalized: result.phase2.afterUpload?.personalized,
  };
} catch (e) {
  result.error = e.message;
  result.last = await snap(page);
} finally {
  await browser.close();
}

console.log(JSON.stringify(result, null, 2));
