/** TEMP diagnostic — leads 403 exit trace */
import { chromium } from "playwright";

const BASE = "http://localhost:3010";
const AUTH = "tests/qa/tmp-architect-auth-storage.json";
const EVIDENCE = "tests/qa/fixtures/qa-sample-contract.pdf";

async function clickChoice(page, text) {
  await page.evaluate((needle) => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent?.includes(needle));
    b?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  }, text);
  await page.waitForTimeout(450);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, storageState: AUTH })).newPage();
  await page.route("**/rest/v1/leads**", async (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({ code: "42501", message: "rls" }),
      });
    }
    return route.continue();
  });
  await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  for (const t of ["서명·납부 전", "매물만 보고", "전세·월세", "집주인·매도인", "제출·계약 요건"]) {
    await clickChoice(page, t);
  }
  await page.locator('input[type="file"]').first().setInputFiles(EVIDENCE);
  const click = Date.now();
  await page.getByRole("button", { name: /자료 포함하고 계속하기/ }).click();
  const samples = [];
  for (let i = 0; i < 80; i++) {
    const dom = await page.evaluate(() => ({
      loading: document.body.innerText.includes("제출하신 자료를 확인하고"),
      signup: document.querySelectorAll('input[name="name"]').length > 0,
      first: [...document.querySelectorAll("h1,h2,h3")].some((el) =>
        /부동산 문서 1차 종합 결과/.test(el.textContent ?? ""),
      ),
      err: /접수 중 문제/.test(document.body.innerText),
    }));
    samples.push({ ms: Date.now() - click, ...dom });
    if (dom.first || (dom.signup && dom.err)) break;
    await page.waitForTimeout(150);
  }
  console.log(JSON.stringify({ scenario: "RE_leads403", samples, final: samples.at(-1) }, null, 2));
  await browser.close();
}

main();
