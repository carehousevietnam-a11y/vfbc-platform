import { chromium } from "@playwright/test";

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

async function metrics(page) {
  return page.evaluate(() => {
    const t = document.body.innerText;
    return {
      reg: t.includes("등기·소유권 쪽에서"),
      clause: t.includes("가장 걸리는 조항 유형"),
      money: t.includes("계약금·보증금·중도금 조건을 다시"),
      moneyDetail: t.includes("지급·반환 방식이 불분명"),
      regDetail: t.includes("등기 확인 전이라면"),
      done: t.includes("2차 추가 확인 완료"),
      overflow: document.documentElement.scrollWidth > window.innerWidth + 2,
    };
  });
}

async function signup(page, tag) {
  await page.getByRole("button", { name: /자료 없이/ }).click();
  await page.locator('input[name="name"]').fill(`P1a ${tag}`);
  await page.locator('input[name="phone"]').fill("0904444200");
  await page.locator('input[name="address"]').fill("Quan 7");
  await page.locator('input[name="email"]').fill(`${tag}@test.vfbcai.local`);
  await page.locator('input[name="kakao_id"]').fill(tag);
  await page.locator('input[name="agreeTerms"]').check();
  await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  await page
    .getByRole("heading", { name: "부동산 문서 1차 종합 결과" })
    .waitFor({ timeout: 90_000 });
  await page.getByRole("button", { name: /2차 개인화/ }).click();
  await page.getByText("2차 · 개인화 검토").waitFor({ timeout: 20_000 });
  await page.getByRole("heading", { name: "추가 상황 확인" }).waitFor({ timeout: 20_000 });
}

const browser = await chromium.launch({ headless: true });
const out = {};

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto("http://localhost:3010/verify/real-estate", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await click(page, "서명·납부 전");
  await page.getByRole("heading", { name: /서명 전 단계입니다/ }).waitFor();
  await click(page, "매물만 보고");
  await click(page, "계약금·중도금");
  await click(page, "집주인·매도인");
  await click(page, "제출·계약 요건");
  await signup(page, "C-money");
  out.C_first = await metrics(page);
  await click(page, "말로 한 금액");
  await page.waitForTimeout(600);
  out.C_after = await metrics(page);
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page.goto("http://localhost:3010/verify/real-estate", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await click(page, "서명·납부 전");
  await page.getByRole("heading", { name: /서명 전 단계입니다/ }).waitFor();
  await click(page, "곧 서명");
  await click(page, "사거나 팔려");
  await click(page, "집주인·매도인");
  await click(page, "제출·계약 요건");
  await click(page, "서류에 적힌");
  await signup(page, "SD-reg");
  out.SD_first = await metrics(page);
  await click(page, "아직 등기 확인 전");
  await page.waitForTimeout(600);
  out.SD_detailPrompt = await metrics(page);
  if (out.SD_detailPrompt.regDetail) {
    await page
      .locator("textarea")
      .first()
      .fill(
        "등기부등본상 소유자 이름과 계약 상대 이름이 다릅니다. 위임장을 아직 받지 못했습니다.",
      );
    await page.getByRole("button", { name: "다음" }).click();
    await page.waitForTimeout(700);
  }
  out.SD_done = await metrics(page);
  await page.close();
}

await browser.close();
console.log(JSON.stringify(out, null, 2));

const cPass =
  out.C_first?.money &&
  !out.C_first.reg &&
  !out.C_first.clause &&
  out.C_after?.done;
const sdPass = out.SD_detailPrompt?.regDetail && out.SD_done?.done && !out.SD_done.overflow;
if (!cPass || !sdPass) process.exit(1);
