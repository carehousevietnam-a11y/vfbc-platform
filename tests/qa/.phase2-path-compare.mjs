/** TEMP — compare phase2 entry across phase1 paths */
import { chromium } from "@playwright/test";
const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";

async function clickChoice(page, text) {
  await page.waitForFunction((needle) => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent?.includes(needle));
    if (!b) return false;
    b.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    return true;
  }, text, { timeout: 30000 });
  await page.waitForTimeout(400);
}

async function clickFirstStitch(page) {
  return page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
    };
    const btn = [...document.querySelectorAll("button")].find((b) => {
      if (!visible(b)) return false;
      const t = (b.textContent ?? "").trim();
      return /^\d{2}/.test(t) && !t.includes("직접 설명하기");
    });
    if (!btn) return false;
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    return true;
  });
}

async function runPath(label, phase1Clicks) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  try {
    await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    for (const c of phase1Clicks) {
      if (c === "__stitch__") {
        if (!(await clickFirstStitch(page))) break;
      } else {
        await clickChoice(page, c);
      }
    }
    if (await page.getByRole("button", { name: /자료 없이/ }).isVisible().catch(() => false)) {
      await page.getByRole("button", { name: /자료 없이/ }).click();
    }
    if (await page.locator('input[name="name"]').isVisible().catch(() => false)) {
      await page.locator('input[name="name"]').fill(`${label} QA`);
      await page.locator('input[name="phone"]').fill("0904444099");
      await page.locator('input[name="address"]').fill("Q7");
      await page.locator('input[name="email"]').fill(`${label}-${Date.now()}@test.vfbcai.local`);
      await page.locator('input[name="kakao_id"]').fill(`${label}qa`);
      await page.locator('input[name="agreeTerms"]').check();
      await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
      await page.getByRole("heading", { name: "부동산 문서 1차 종합 결과" }).waitFor({ timeout: 90000 });
    }
    await page.getByRole("button", { name: /개인화 상세검토/ }).click();
    await page.waitForTimeout(1200);
    const snap = await page.evaluate(() => {
      const h = [...document.querySelectorAll("h2,h3")].map((x) => x.textContent?.trim()).filter(Boolean);
      const body = document.body.innerText;
      return {
        headings: h.slice(0, 8),
        phase2Banner: body.includes("2차 · 개인화 검토"),
        phase1Check: body.includes("1. 검토 내용 체크"),
        phase2Check: body.includes("2. 추가 상황 확인"),
        entryQ1: body.includes("지금 부동산 관련해서"),
        firstQuestion: h.find((x) => x && x.length > 15 && !x.includes("추가 상황")),
      };
    });
    return { label, snap };
  } finally {
    await browser.close();
  }
}

const pre = await runPath("pre", [
  "서명·납부 전",
  "매물만 보고",
  "전세·월세",
  "집주인·매도인",
  "제출·계약 요건",
]);
const post = await runPath("post", [
  "문제가 생겼",
  "보증금",
  "__stitch__",
  "__stitch__",
  "__stitch__",
]);
const doc = await runPath("doc", [
  "서류 내용을 확인",
  "__stitch__",
  "__stitch__",
  "__stitch__",
]);
console.log(JSON.stringify({ pre, post, doc }, null, 2));
