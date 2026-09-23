/**
 * IMPLEMENTER — P1c structuredDetail + direct explain smoke
 * Run: node tests/qa/pilot-real-estate-phase2-p1c-detail.mjs
 */
import { execFileSync } from "node:child_process";
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

async function signup(page, tag) {
  await page.getByRole("button", { name: /자료 없이/ }).click();
  await page.locator('input[name="name"]').fill(`P1c ${tag}`);
  await page.locator('input[name="phone"]').fill(`0907777${Math.floor(Math.random() * 900) + 100}`);
  await page.locator('input[name="address"]').fill("Quan 7");
  await page.locator('input[name="email"]').fill(`${tag}-${Date.now()}@test.vfbcai.local`);
  await page.locator('input[name="kakao_id"]').fill(`${tag}${Date.now().toString().slice(-4)}`);
  await page.locator('input[name="agreeTerms"]').check();
  await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  await page
    .getByRole("heading", { name: "부동산 문서 1차 종합 결과" })
    .waitFor({ timeout: 90_000 });
  await click(page, "2차 개인화");
  await page.getByText("2차 · 개인화 검토").waitFor({ timeout: 20_000 });
  await page.getByRole("heading", { name: "추가 상황 확인" }).waitFor({ timeout: 20_000 });
}

execFileSync("npx", ["tsx", "tests/qa/pilot-real-estate-phase2-p1c-detail-unit.ts"], {
  stdio: "inherit",
  cwd: process.cwd(),
  shell: true,
});

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto("http://localhost:3010/verify/real-estate", { waitUntil: "networkidle" });
await page.waitForTimeout(700);
await click(page, "서명·납부 전");
await page.getByRole("heading", { name: /서명 전 단계입니다/ }).waitFor({ timeout: 20_000 });
await click(page, "초안");
await click(page, "사거나 팔려");
await click(page, "집주인·매도인");
await click(page, "불리하거나 위험한");
await click(page, "서류와 제가 겪은");
await click(page, "금액·보증금");
await signup(page, "clause-direct");
await click(page, "근저당·가압류");
await page.waitForTimeout(700);
await page.getByRole("button", { name: "직접 설명하기" }).click();
const draft =
  "해지 시 보증금 전액 몰수 조항이 있고 입주 전 해지도 동일하게 적용됩니다.";
await page.locator("textarea").last().evaluate((el, value) => {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
  setter?.call(el, value);
  el.dispatchEvent(new InputEvent("input", { bubbles: true, data: value, inputType: "insertText" }));
}, draft);
await page.waitForFunction(() => {
  const btn = [...document.querySelectorAll("button")]
    .reverse()
    .find((b) => b.textContent?.includes("다음") && !b.disabled);
  if (!btn) return false;
  btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  return true;
}, { timeout: 20_000 });
await page.waitForTimeout(800);
const body = await page.evaluate(() => document.body.innerText);
await browser.close();

if (body.includes("가장 걸리는 조항 유형")) process.exit(1);

console.log("PASS: P1c structuredDetail unit + direct explain browser");
