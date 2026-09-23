/**
 * Supplement — hasAiReportRequest + RE phase2 meta check
 */
import { chromium } from "@playwright/test";

const BASE = "http://localhost:3010";
const PAID_CTA = /개인화 상세검토 하기|2차 개인화/;

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

async function clickStitch(page) {
  return page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => {
      const r = b.getBoundingClientRect();
      const t = (b.textContent || "").trim();
      return r.width > 0 && /^\d{2}/.test(t) && !t.includes("직접 설명하기");
    });
    if (!btn) return false;
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    return true;
  });
}

async function getAccessToken(page) {
  return page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (!key.includes("auth-token")) continue;
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || "");
        const token = parsed?.access_token ?? parsed?.currentSession?.access_token;
        if (typeof token === "string") return token;
      } catch {}
    }
    return null;
  });
}

async function adminPhase1(page, tag) {
  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  for (const step of [
    "교통위반이나 문제를 알리는 통지",
    "내가 알고 있는 상황과 기관에서 말하는 내용이 서로 다른",
    "기관에서 말하는 문제가 실제로 내 상황에 해당하는지",
    "아직 아무에게도 설명하거나",
    "대응해야 하는 날짜를 확인했습니다",
  ]) {
    if (await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible().catch(() => false)) break;
    if (await page.locator('input[name="name"]').isVisible().catch(() => false)) break;
    await clickChoice(page, step);
  }
  for (let i = 0; i < 6; i++) {
    if (await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible().catch(() => false)) break;
    if (await page.locator('input[name="name"]').isVisible().catch(() => false)) break;
    if (!(await clickStitch(page))) break;
    await page.waitForTimeout(500);
  }
  if (await page.locator('input[name="name"]').isVisible().catch(() => false)) {
    await page.locator('input[name="name"]').fill(`AIRPT Admin ${tag}`);
    await page.locator('input[name="phone"]').fill(`0906666${Math.floor(Math.random() * 9000 + 1000)}`);
    await page.locator('input[name="address"]').fill("Quan 7");
    await page.locator('input[name="email"]').fill(`airpt-${tag}-${Date.now()}@test.local`);
    await page.locator('input[name="kakao_id"]').fill(`air${tag}`);
    await page.locator('input[name="agreeTerms"]').check();
    await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
    await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).waitFor({ timeout: 90000 });
  }
}

async function advanceAdminPersonalized(page) {
  for (let i = 0; i < 40; i++) {
    if (await page.getByRole("heading", { name: "행정문서 개인화 검토 결과" }).isVisible().catch(() => false)) return true;
    const skip = page.getByRole("button", { name: /자료 없이 계속하기/ });
    if (await skip.isVisible().catch(() => false)) { await skip.click(); await page.waitForTimeout(800); continue; }
    if (!(await clickStitch(page))) break;
    await page.waitForTimeout(500);
  }
  return false;
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const crmPosts = [];
page.on("request", (req) => {
  if (req.url().includes("/rest/v1/crm_activities") && req.method() === "POST") {
    try { crmPosts.push(req.postDataJSON()); } catch {}
  }
});

await adminPhase1(page, "x");
await page.getByRole("button", { name: PAID_CTA }).first().click();
await page.waitForTimeout(800);
for (let i = 0; i < 8; i++) {
  if (await page.getByRole("heading", { name: "행정문서 개인화 검토 결과" }).isVisible().catch(() => false)) break;
  if (!(await clickStitch(page))) break;
  await page.waitForTimeout(500);
}
await advanceAdminPersonalized(page);
await page.getByRole("button", { name: "AI 검토 상세 리포트" }).click();
await page.waitForURL(/\/documents/, { timeout: 20000 }).catch(() => null);
const docsUrl = page.url();
await page.waitForTimeout(12000);

let hasAi = null;
for (let i = 0; i < 8; i++) {
  await page.goto(`${BASE}/mypage`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const token = await getAccessToken(page);
  if (!token) continue;
  const data = await page.evaluate(async ({ token }) => {
    const res = await fetch("/api/mypage-data", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessToken: token }) });
    return res.ok ? res.json() : null;
  }, { token });
  hasAi = data?.items?.[0]?.hasAiReportRequest;
  if (hasAi === true) break;
  await page.waitForTimeout(2000);
}

console.log(JSON.stringify({
  docsUrl,
  onDocuments: docsUrl.includes("mode=ai_report"),
  crmPosts: crmPosts.map((p) => p?.action),
  hasAiReportRequest: hasAi,
}, null, 2));

await browser.close();
