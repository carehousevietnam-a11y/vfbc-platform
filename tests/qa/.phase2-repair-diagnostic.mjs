/** TEMP — PERSONALIZED_DETAILED_REVIEW_REPAIR diagnostic */
import { chromium } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";

async function click(page, text) {
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
    { timeout: 30000 },
  );
  await page.waitForTimeout(600);
}

async function collect(page) {
  return page.evaluate(() => {
    const body = document.body.innerText;
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return (
        r.width > 0 &&
        r.height > 0 &&
        s.visibility !== "hidden" &&
        s.display !== "none"
      );
    };
    const buttons = [...document.querySelectorAll("button")]
      .filter(visible)
      .map((b) => b.textContent?.trim())
      .filter(Boolean);
    const headings = [...document.querySelectorAll("h2,h3")]
      .filter(visible)
      .map((h) => h.textContent?.trim())
      .filter(Boolean);
    return {
      url: location.href,
      hasFirstResult: body.includes("부동산 문서 1차 종합 결과"),
      hasPhase2Banner: body.includes("2차 · 개인화 검토"),
      hasPhase2Heading: body.includes("추가 상황 확인"),
      hasPhase1EvidenceBadge: body.includes("1차 · 간단 자료"),
      hasPhase2EvidenceBadge: body.includes("2차 · 간단 자료"),
      hasEntryQ1: body.includes("지금 부동산 관련해서 어떤 일이 진행 중인가요"),
      hasRe2Registration: body.includes("등기·소유권"),
      hasRe2Clause: body.includes("걸리는 조항"),
      hasUploadHeading: body.includes("간단한 자료가 있으면 함께 첨부해주세요"),
      headings: headings.slice(0, 15),
      sampleButtons: buttons.filter((t) => t.length < 80).slice(0, 25),
    };
  });
}

async function clickFirstStitchCard(page) {
  const card = page.locator('[class*="cursor-pointer"]').filter({ hasText: /→/ }).first();
  if (await card.count()) {
    await card.click({ timeout: 15000 });
    await page.waitForTimeout(900);
    return true;
  }
  const alt = page.getByRole("button").filter({ hasText: /근저당|등기|조항|보증금|계약|서류|직접/ }).first();
  if (await alt.count()) {
    await alt.click({ timeout: 15000 });
    await page.waitForTimeout(900);
    return true;
  }
  return false;
}

async function answerPhase2UntilUpload(page, maxSteps = 12) {
  for (let i = 0; i < maxSteps; i++) {
    const state = await collect(page);
    if (state.hasPhase1EvidenceBadge || state.hasPhase2EvidenceBadge) {
      return { step: i, state, reason: "upload" };
    }
    const clicked = await clickFirstStitchCard(page);
    if (!clicked) return { step: i, state, reason: "no_card" };
  }
  return { step: maxSteps, state: await collect(page), reason: "max_steps" };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await click(page, "서명·납부 전");
  await click(page, "매물만 보고");
  await click(page, "전세·월세");
  await click(page, "집주인·매도인");
  await click(page, "제출·계약 요건");
  await page.getByRole("button", { name: /자료 없이/ }).waitFor({ timeout: 30000 });
  await page.getByRole("button", { name: /자료 없이/ }).click();
  await page.locator('input[name="name"]').fill("Phase2 Repair QA");
  await page.locator('input[name="phone"]').fill("0904444099");
  await page.locator('input[name="address"]').fill("Quan 7");
  await page.locator('input[name="email"]').fill("phase2-repair@test.vfbcai.local");
  await page.locator('input[name="kakao_id"]').fill("phase2repair");
  await page.locator('input[name="agreeTerms"]').check();
  await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  await page
    .getByRole("heading", { name: "부동산 문서 1차 종합 결과" })
    .waitFor({ timeout: 90000 });

  console.log("AFTER_FIRST_RESULT", JSON.stringify(await collect(page), null, 2));

  await click(page, "개인화 상세검토");
  await page.waitForTimeout(1500);
  console.log("AFTER_PHASE2_CTA", JSON.stringify(await collect(page), null, 2));

  const uploadState = await answerPhase2UntilUpload(page);
  console.log("AFTER_PHASE2_QUESTIONS", JSON.stringify(uploadState, null, 2));
} catch (e) {
  console.error("ERROR", e.message);
  console.log("LAST", JSON.stringify(await collect(page), null, 2));
} finally {
  await browser.close();
}
