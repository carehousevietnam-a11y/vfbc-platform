import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto("http://localhost:3010/verify/admin", { waitUntil: "networkidle" });
await page.waitForTimeout(800);

async function clickIf(p, pattern) {
  const btn = p.getByRole("button", { name: pattern }).first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    await p.waitForTimeout(650);
    return true;
  }
  return false;
}

// CASE_03 unsure path: pick unsure options where available
await clickIf(page, /출석하거나 설명하라는 내용/);
const steps = [];
for (let i = 0; i < 15; i++) {
  const body = await page.locator("body").innerText();
  if (body.includes("행정문서 1차 종합 결과") || body.includes("01 / 종합 판단")) break;
  const unsure = page.getByRole("button", { name: /잘 모르겠습니다/ }).first();
  if (await unsure.isVisible().catch(() => false)) {
    await unsure.click();
    steps.push("unsure");
  } else {
    const stitch = page.locator("button").filter({ hasText: /^\d{2}/ }).first();
    if (await stitch.isVisible().catch(() => false)) await stitch.click();
    else break;
    steps.push("first");
  }
  await page.waitForTimeout(650);
}

const bodyMid = await page.locator("body").innerText();
const firstResult = bodyMid.includes("행정문서 1차 종합 결과") || bodyMid.includes("01 / 종합 판단");
const autoRisk = /HIGH RISK|위험 등급|Risk Score/i.test(bodyMid);

// direct explain save flow
const page2 = await browser.newPage();
await page2.goto("http://localhost:3010/verify/admin", { waitUntil: "networkidle" });
await page2.waitForTimeout(800);
await clickIf(page2, /교통위반이나 문제를 알리는 통지/);
await page2.getByRole("button", { name: /^직접 설명하기/ }).first().click();
await page2.waitForTimeout(500);
await page2.locator("textarea").first().fill("직접 설명 QA 저장 테스트");
const nextBtn = page2.getByRole("button", { name: /^다음$/ }).first();
const saved = await nextBtn.isVisible().catch(() => false);
if (saved) await nextBtn.click();
await page2.waitForTimeout(700);
const afterSaveQ = await page2.locator("body").innerText();
const advanced = /실제 상황|통지서에는/.test(afterSaveQ) && !afterSaveQ.includes("선택지로 돌아가기");

await browser.close();
console.log(JSON.stringify({ unsureSteps: steps.length, firstResult, autoRisk, directExplainSave: saved && advanced }, null, 2));
