/** RE phase2 meta spot-check after personalized result */
import { chromium } from "@playwright/test";
const BASE = "http://localhost:3010";
const PAID_CTA = /개인화 상세검토 하기|2차 개인화/;

async function clickChoice(page, text) {
  await page.waitForFunction((needle) => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent?.includes(needle));
    if (!b) return false;
    b.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    return true;
  }, text, { timeout: 25000 });
  await page.waitForTimeout(450);
}
async function clickStitch(page) {
  return page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => {
      const r = b.getBoundingClientRect(); const t = (b.textContent || "").trim();
      return r.width > 0 && /^\d{2}/.test(t) && !t.includes("직접 설명하기");
    });
    if (!btn) return false;
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    return true;
  });
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
let crmMetaPosts = [];
page.on("request", (req) => {
  if (req.url().includes("/rest/v1/crm_activities") && ["POST","PATCH"].includes(req.method())) {
    try { crmMetaPosts.push({ method: req.method(), body: req.postDataJSON() }); } catch {}
  }
});

await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);
await clickChoice(page, "서명·납부 전");
await page.getByRole("heading", { name: /서명 전 단계입니다/ }).waitFor();
await clickChoice(page, "초안"); await clickChoice(page, "사거나 팔려"); await clickChoice(page, "집주인·매도인");
await clickChoice(page, "불리하거나 위험한");
await page.getByRole("heading", { name: /받은 서류 내용이/ }).waitFor();
await clickChoice(page, "서류와 제가 겪은"); await clickChoice(page, "금액·보증금");
await page.locator('input[name="name"]').fill("RE Phase2 Meta");
await page.locator('input[name="phone"]').fill("09088881234");
await page.locator('input[name="address"]').fill("Quan 7");
await page.locator('input[name="email"]').fill(`re-meta-${Date.now()}@test.local`);
await page.locator('input[name="kakao_id"]').fill("remeta");
await page.locator('input[name="agreeTerms"]').check();
await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
await page.getByRole("heading", { name: "부동산 문서 1차 종합 결과" }).waitFor({ timeout: 90000 });
await page.getByRole("button", { name: PAID_CTA }).first().click();
await page.getByText("2차 · 개인화 검토").waitFor({ timeout: 20000 });

for (let i = 0; i < 40; i++) {
  if (await page.evaluate(() => document.body.innerText.includes("부동산 문서 2차 개인화 결과"))) break;
  if (await page.getByRole("button", { name: /자료 없이 계속하기/ }).isVisible().catch(() => false)) {
    await page.getByRole("button", { name: /자료 없이 계속하기/ }).click(); await page.waitForTimeout(800); continue;
  }
  if (await page.locator("textarea").first().isVisible().catch(() => false)) {
    await page.locator("textarea").first().fill("보증금 반환 조건 확인");
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) => !b.disabled && b.textContent?.trim() === "다음");
      btn?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    });
    await page.waitForTimeout(600); continue;
  }
  if (!(await clickStitch(page))) break;
  await page.waitForTimeout(500);
}
await page.waitForTimeout(3000);

const token = await page.evaluate(() => {
  for (const key of Object.keys(localStorage)) {
    if (!key.includes("auth-token")) continue;
    try {
      const p = JSON.parse(localStorage.getItem(key) || "");
      return p?.access_token ?? p?.currentSession?.access_token ?? null;
    } catch {}
  }
  return null;
});
await page.goto(`${BASE}/mypage`, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
const data = token ? await page.evaluate(async (token) => {
  const res = await fetch("/api/mypage-data", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessToken: token }) });
  return res.ok ? res.json() : null;
}, token) : null;

const phase2Posts = crmMetaPosts.filter((p) => {
  const meta = p.body?.meta || p.body;
  const s = JSON.stringify(meta || p.body || "");
  return s.includes("real_estate_phase2_answers_json") || s.includes("verify_profile_phase");
});
const lastPhase2Raw = phase2Posts.at(-1)?.body?.meta?.real_estate_phase2_answers_json
  ?? phase2Posts.at(-1)?.body?.real_estate_phase2_answers_json
  ?? null;

console.log(JSON.stringify({
  verifyProfilePhase: data?.items?.[0]?.verifyProfilePhase,
  hasAiReportRequest: data?.items?.[0]?.hasAiReportRequest,
  crmActivityCount: crmMetaPosts.length,
  phase2PersistPosts: phase2Posts.length,
  lastPhase2Raw,
  consoleErrors: [],
}, null, 2));
await browser.close();
