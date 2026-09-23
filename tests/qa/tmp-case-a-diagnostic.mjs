import { chromium } from "@playwright/test";

const BASE = "http://localhost:3010";

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
    { timeout: 25_000 },
  );
  await page.waitForTimeout(450);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(`${BASE}/verify/real-estate`);
await page.waitForTimeout(900);
for (const s of [
  "서명·납부 전",
  "초안",
  "전세·월세",
  "집주인·매도인",
  "제출·계약 요건",
  "서류에 적힌 내용",
]) {
  await click(page, s);
}
await page.getByRole("button", { name: /자료 없이/ }).click();
await page.locator('input[name="name"]').fill("QA A2");
await page.locator('input[name="phone"]').fill("0901111222");
await page.locator('input[name="address"]').fill("Q7");
await page.locator('input[name="email"]').fill(`a2-${Date.now()}@test.vfbcai.local`);
await page.locator('input[name="kakao_id"]').fill("a2test");
await page.locator('input[name="agreeTerms"]').check();
await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
await page
  .getByRole("heading", { name: "부동산 문서 1차 종합 결과" })
  .waitFor({ timeout: 120_000 });
await page.getByRole("button", { name: "개인화 상세검토 하기" }).click();
await page.waitForTimeout(2500);
const text = await page.evaluate(() => document.body.innerText);
const snippets = [
  "추가 상황 확인",
  "2차 추가 확인 완료",
  "2차 · 개인화 검토",
  "자료 없이 계속하기",
  "등기·소유권",
  "가장 걸리는 조항",
  "돌려받지 못한",
  "증빙",
];
console.log(
  JSON.stringify(
    {
      found: snippets.filter((s) => text.includes(s)),
      hasPhase2Banner: text.includes("2차 · 개인화 검토"),
      hasCompletion: text.includes("2차 추가 확인 완료"),
      hasUpload: text.includes("자료 없이 계속하기"),
    },
    null,
    2,
  ),
);
await browser.close();
