import { chromium } from "@playwright/test";

async function clickChoiceByText(page, text) {
  await page.waitForFunction(
    (needle) => {
      const btns = [...document.querySelectorAll("button")];
      const b = btns.find((x) => x.textContent?.includes(needle));
      if (!b) return false;
      b.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );
      return true;
    },
    text,
    { timeout: 20_000 },
  );
  await page.waitForTimeout(500);
}

async function runPreToEvidence(page) {
  await page.goto("http://localhost:3010/verify/real-estate", {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(800);
  await clickChoiceByText(page, "서명·납부 전");
  await page
    .getByRole("heading", { name: /서명 전 단계입니다/ })
    .waitFor({ timeout: 20_000 });
  await clickChoiceByText(page, "매물만 보고");
  await page
    .getByRole("heading", { name: /거래·물건|어떤 거래/ })
    .waitFor({ timeout: 15_000 });
  await clickChoiceByText(page, "전세·월세");
  await page
    .getByRole("heading", { name: /상대는 누구|함께 진행/ })
    .waitFor({ timeout: 15_000 });
  await clickChoiceByText(page, "집주인·매도인");
  await page
    .getByRole("heading", { name: /무엇을 가장 먼저 확인/ })
    .waitFor({ timeout: 15_000 });
  await clickChoiceByText(page, "제출·계약 요건");
  await page
    .getByRole("button", { name: /자료 없이/ })
    .waitFor({ timeout: 30_000 });
}

async function countQuestionGuides(page) {
  return page.evaluate(() => {
    const all = [...document.querySelectorAll("*")].filter(
      (el) =>
        el.childElementCount === 0 && el.textContent?.trim() === "QUESTION GUIDE",
    );
    const visible = all.filter((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return (
        r.width > 0 &&
        r.height > 0 &&
        s.visibility !== "hidden" &&
        s.display !== "none" &&
        Number(s.opacity) > 0
      );
    });
    const hiddenInDom = all.filter((el) => !visible.includes(el));
    const parentChains = all.map((el) => {
      let p = el.parentElement;
      const chain = [];
      for (let i = 0; i < 5 && p; i++) {
        chain.push(p.className || p.tagName);
        p = p.parentElement;
      }
      return chain.join(" > ");
    });
    return {
      domCount: all.length,
      visibleCount: visible.length,
      hiddenDomCount: hiddenInDom.length,
      parentChains,
    };
  });
}

const browser = await chromium.launch({ headless: true });
const results = [];

for (const [label, viewport] of [
  ["mobile", { width: 375, height: 812 }],
  ["desktop", { width: 1280, height: 800 }],
]) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await runPreToEvidence(page);
  const evidenceVisible = await page
    .getByRole("button", { name: /자료 없이/ })
    .isVisible();
  const counts = await countQuestionGuides(page);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 2,
  );
  results.push({ label, viewport, evidenceVisible, overflow, ...counts });
  await context.close();
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
