/**
 * IMPLEMENTER — P1b POST / DOCUMENT / UNCLEAR Phase 2 smoke
 * Run: node tests/qa/pilot-real-estate-phase2-p1b-paths.mjs
 */
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
  await page.locator('input[name="name"]').waitFor({ state: "visible", timeout: 90_000 });
  await page.locator('input[name="name"]').fill(`P1b ${tag}`);
  await page.locator('input[name="phone"]').fill(`0905555${Math.floor(Math.random() * 900) + 100}`);
  await page.locator('input[name="address"]').fill("Quan 7");
  await page.locator('input[name="email"]').fill(`${tag}-${Date.now()}@test.vfbcai.local`);
  await page.locator('input[name="kakao_id"]').fill(`${tag}${Date.now().toString().slice(-4)}`);
  await page.locator('input[name="agreeTerms"]').check();
  await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  await page
    .getByRole("heading", { name: "부동산 문서 1차 종합 결과" })
    .waitFor({ timeout: 90_000 });
  await page.getByRole("button", { name: /개인 상세 검토하기|2차 개인화/ }).first().click();
  await page.getByText("2차 · 개인화 검토").waitFor({ timeout: 20_000 });
  await page.getByRole("heading", { name: "추가 상황 확인" }).waitFor({ timeout: 20_000 });
}

function metrics(bodyText) {
  return {
    moneyRecovery: bodyText.includes("돌려받지 못한 상황"),
    docRel: bodyText.includes("서류 자체를 신뢰"),
    unclearLock: bodyText.includes("가장 먼저 확인해야 할 사실"),
    regPre: bodyText.includes("등기·소유권 쪽에서"),
    entryQ1: bodyText.includes("지금 부동산 관련해서 어떤 일이 진행 중인가요?"),
    done: bodyText.includes("2차 추가 확인 완료"),
  };
}

const browser = await chromium.launch({ headless: true });
const out = {};

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto("http://localhost:3010/verify/real-estate", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await click(page, "문제가 생겼");
  await page.getByRole("heading", { name: /어떤 문제/ }).waitFor();
  await click(page, "보증금·계약금을 받지 못");
  await click(page, "집주인·매도인");
  await click(page, "아직 공식 대응 전");
  await click(page, "서류와 제가 겪은");
  await click(page, "금액·보증금");
  await signup(page, "post");
  const t = await page.evaluate(() => document.body.innerText);
  out.post = metrics(t);
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto("http://localhost:3010/verify/real-estate", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await click(page, "서류 내용을 확인");
  await page.getByRole("heading", { name: /받은 서류/ }).waitFor();
  await click(page, "임대차·전세");
  await click(page, "원본과 번역본");
  await page.waitForTimeout(500);
  await click(page, "서류와 제가 겪은");
  await click(page, "번역본·문구");
  await signup(page, "doc");
  const t = await page.evaluate(() => document.body.innerText);
  out.doc = metrics(t);
  await page.close();
}

await browser.close();
console.log(JSON.stringify(out, null, 2));

if (!out.post?.moneyRecovery || out.post.regPre || out.post.entryQ1) process.exit(1);
if (!out.doc?.docRel || out.doc.regPre || out.doc.entryQ1) process.exit(1);

console.log("PASS: P1b POST moneyRecovery + DOCUMENT docReliability smoke");
