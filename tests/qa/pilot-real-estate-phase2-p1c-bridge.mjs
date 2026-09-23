/**
 * IMPLEMENTER — P1c UNCLEAR bridge + Material Stop smoke
 * Run: node tests/qa/pilot-real-estate-phase2-p1c-bridge.mjs
 */
import { chromium } from "@playwright/test";

const ENTRY_Q1 = "지금 부동산 관련해서 어떤 일이 진행 중인가요?";
const PERSONALIZED_TITLE = "부동산 문서 2차 개인화 결과";
const AMBIGUOUS_STORY =
  "최근 집주소와 연락처가 적힌 안내를 받았습니다. 무엇부터 확인해야 할지 정리가 되지 않습니다.";

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
  await page.locator('input[name="phone"]').fill(`0906666${Math.floor(Math.random() * 900) + 100}`);
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

async function runPureUnclearToPhase2(page) {
  await page.goto("http://localhost:3010/verify/real-estate", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await click(page, "제 상황부터 설명");
  const textarea = page.locator("textarea").first();
  await textarea.waitFor({ state: "visible", timeout: 15_000 });
  await textarea.fill(AMBIGUOUS_STORY);
  const nextBtn = page.getByRole("button", { name: /다음|확인|저장/ }).first();
  if (await nextBtn.isVisible().catch(() => false)) await nextBtn.click();
  await page.waitForTimeout(800);
  await signup(page, "unclear-base");
}

function metrics(bodyText) {
  return {
    unclearLock: bodyText.includes("가장 먼저 확인해야 할 사실"),
    moneyBridge: bodyText.includes("돈·보증금·계약금 문제에서"),
    docBridge: bodyText.includes("핵심으로 봐야 할 서류"),
    moneyRecovery: bodyText.includes("돌려받지 못한 상황"),
    docRel: bodyText.includes("서류 자체를 신뢰"),
    entryQ1: bodyText.includes(ENTRY_Q1),
    personalizedTitle: bodyText.includes(PERSONALIZED_TITLE),
    section01: bodyText.includes("01 현재 상황"),
    gateShell: bodyText.includes("FREE 검토에서 확보한 Situation Profile"),
  };
}

const browser = await chromium.launch({ headless: true });
const out = {};

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await runPureUnclearToPhase2(page);
  let t = await page.evaluate(() => document.body.innerText);
  out.pureLock = metrics(t);
  if (!out.pureLock.unclearLock) {
    console.error("FAIL: unclearFactLock not shown");
    process.exit(1);
  }
  await click(page, "돈·보증금·계약금 상태");
  t = await page.evaluate(() => document.body.innerText);
  out.pureMoneyBridge = metrics(t);
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await runPureUnclearToPhase2(page);
  await click(page, "돈·보증금·계약금 상태");
  await click(page, "보증금·계약금 반환을 받지");
  const t = await page.evaluate(() => document.body.innerText);
  out.uncPost = metrics(t);
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await runPureUnclearToPhase2(page);
  await click(page, "어떤 서류가 핵심");
  await click(page, "임대차·전세·월세 계약서");
  const t = await page.evaluate(() => document.body.innerText);
  out.uncDoc = metrics(t);
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await runPureUnclearToPhase2(page);
  await click(page, "돈·보증금·계약금 상태");
  await click(page, "아직 돈 문제를 분류하기 어렵");
  await page.waitForFunction(
    (title) => document.body.innerText.includes(title),
    PERSONALIZED_TITLE,
    { timeout: 60_000 },
  );
  const t = await page.evaluate(() => document.body.innerText);
  out.materialStop = metrics(t);
  await page.close();
}

await browser.close();
console.log(JSON.stringify(out, null, 2));

if (out.pureMoneyBridge?.entryQ1) process.exit(1);
if (!out.pureMoneyBridge?.moneyBridge) process.exit(1);
if (out.uncPost?.entryQ1 || !out.uncPost?.moneyRecovery) process.exit(1);
if (out.uncDoc?.entryQ1 || !out.uncDoc?.docRel) process.exit(1);
if (!out.materialStop?.personalizedTitle || out.materialStop.moneyRecovery) process.exit(1);
if (!out.materialStop?.section01 || out.materialStop.gateShell || out.materialStop.entryQ1) {
  process.exit(1);
}

console.log("PASS: P1c UNCLEAR bridge + POST/DOC re-entry + material stop");
