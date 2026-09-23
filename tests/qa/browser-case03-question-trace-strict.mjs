/**
 * Strict CASE_03 Phase2 browser trace — no blind clickFirstStitch
 * Records every visible question before each intentional click
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

async function getVisibleQuestionTexts(page) {
  return page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
    };
    return [...document.querySelectorAll("h3, h4")]
      .filter(visible)
      .map((el) => (el.textContent ?? "").trim())
      .filter((t) => t.length > 10 && !t.includes("검토 내용 체크") && !t.includes("행정문서 리뷰"));
  });
}

async function getProgress(page) {
  return page.evaluate(() => {
    const m = document.body.innerText.match(/(\d{2})\s*\/\s*(\d{2})/);
    return m ? { current: m[1], total: m[2] } : null;
  });
}

async function advanceToFirstResult(page) {
  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(700);
  await clickChoice(page, "출석하거나 설명하라는 내용");
  for (const p of [
    "왜 출석하거나 설명해야 하는지",
    "정해진 날짜에 반드시 출석해야 하는지",
    "아직 기관에 설명하거나 직접 방문하지 않았습니다",
    "출석하거나 설명해야 하는 날짜를 확인했습니다",
  ]) {
    if (await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible().catch(() => false)) break;
    await clickChoice(page, p);
  }
  const skip = page.getByRole("button", { name: /자료 없이 계속하기/ });
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
    await page.waitForTimeout(600);
  }
  if (await page.locator('input[name="name"]').isVisible().catch(() => false)) {
    const suffix = String(Date.now()).slice(-8);
    await page.locator('input[name="name"]').fill(`Strict ${suffix}`);
    await page.locator('input[name="phone"]').fill(`090${suffix}`);
    await page.locator('input[name="address"]').fill("Quan 7");
    await page.locator('input[name="email"]').fill(`strict-${Date.now()}@test.vfbcai.local`);
    await page.locator('input[name="kakao_id"]').fill(`qa${suffix}`);
    await page.locator('input[name="agreeTerms"]').check();
    await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  }
  await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).waitFor({ timeout: 120_000 });
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const trace = [];

try {
  await advanceToFirstResult(page);
  await page.getByRole("button", { name: /개인화 상세 검토하기/ }).click();
  await page.waitForTimeout(900);

  const phase2Picks = [
    "실제 상황과 기관이 확인하려는 내용이 상당히 다릅니다",
    "특정 날짜·사건·행동에 대해 확인하려는 것으로 이해했습니다",
    "지정된 날짜에 출석하는 것만으로 충분할 것 같습니다",
    "기관에 무엇을 어떻게 설명해야 하는지 모르겠습니다",
    "출석·소명 요구 통지서·안내문",
    "기관 요구를 이해하고 싶습니다",
  ];

  for (let i = 0; i < 10; i++) {
    const body = await page.evaluate(() => document.body.innerText);
    if (body.includes("2차 상세검토에 필요한 자료")) {
      trace.push({ step: i, event: "EVIDENCE_GATE", questions: await getVisibleQuestionTexts(page), progress: await getProgress(page) });
      break;
    }
    if (body.includes("행정문서 개인화 검토 결과")) {
      trace.push({ step: i, event: "PERSONALIZED_RESULT", questions: await getVisibleQuestionTexts(page) });
      break;
    }
    const questions = await getVisibleQuestionTexts(page);
    const progress = await getProgress(page);
    trace.push({ step: i, event: "BEFORE_CLICK", questions, progress, pick: phase2Picks[i] ?? null });
    const pick = phase2Picks[i];
    if (!pick) break;
    await clickChoice(page, pick);
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify({ trace, questionCountBeforeEvidence: trace.filter((t) => t.event === "BEFORE_CLICK").length }, null, 2));
