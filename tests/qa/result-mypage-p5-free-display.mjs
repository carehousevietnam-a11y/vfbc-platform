import { chromium } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";

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
    { timeout: 25_000 },
  );
  await page.waitForTimeout(450);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
let mypageData = null;
page.on("response", async (res) => {
  if (res.url().includes("/api/mypage-data") && res.request().method() === "POST" && res.ok()) {
    try {
      mypageData = await res.json();
    } catch {
      /* ignore */
    }
  }
});

await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);
await clickChoice(page, "서명·납부 전");
await page.getByRole("heading", { name: /서명 전 단계입니다/ }).waitFor();
for (const t of ["초안", "사거나 팔려", "집주인·매도인", "불리하거나 위험한"]) {
  await clickChoice(page, t);
}
await page.getByRole("heading", { name: /받은 서류 내용이/ }).waitFor();
await clickChoice(page, "서류와 제가 겪은");
await clickChoice(page, "금액·보증금");
await page.locator('input[name="name"]').waitFor({ state: "visible" });
await page.locator('input[name="name"]').fill("P5 Free Display");
await page.locator('input[name="phone"]').fill("09088881234");
await page.locator('input[name="address"]').fill("Quan 7");
await page.locator('input[name="email"]').fill(`p5free-${Date.now()}@test.local`);
await page.locator('input[name="kakao_id"]').fill("p5free");
await page.locator('input[name="agreeTerms"]').check();
await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
await page.getByRole("heading", { name: "부동산 문서 1차 종합 결과" }).waitFor({ timeout: 90000 });
await page.getByRole("button", { name: "AI 정리 보기" }).click();
await page.waitForTimeout(8000);

const body = await page.locator("body").innerText();
const item = mypageData?.items?.[0];
const headline = item?.caseSummaryHeadline ?? "";
console.log(
  JSON.stringify(
    {
      url: page.url(),
      hasRecentResult: body.includes("최근 확인 결과"),
      hasExpertTrack: body.includes("현재 진행 중인 서비스"),
      caseSummaryHeadline: headline,
      caseSummaryBullets: item?.caseSummaryBullets ?? null,
      verifyProfilePhase: item?.verifyProfilePhase ?? null,
      headlineOnPage: headline ? body.includes(headline.slice(0, 24)) : false,
      bulletOnPage: item?.caseSummaryBullets?.[0]
        ? body.includes(item.caseSummaryBullets[0].slice(0, 12))
        : false,
    },
    null,
    2,
  ),
);
await browser.close();
