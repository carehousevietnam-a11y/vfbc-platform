/** Quick check: CRM PATCH response status + PDF phase2 after RE flow */
import { chromium } from "@playwright/test";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");
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
const patchResults = [];
page.on("response", async (res) => {
  if (!res.url().includes("/rest/v1/crm_activities") || res.request().method() !== "PATCH") return;
  let body = null;
  try { body = res.request().postDataJSON(); } catch {}
  const phase2 = body?.meta?.real_estate_phase2_answers_json ?? body?.real_estate_phase2_answers_json;
  patchResults.push({ status: res.status(), ok: res.ok(), phase2Len: typeof phase2 === "string" ? phase2.length : 0 });
});

await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);
await clickChoice(page, "서명·납부 전");
await page.getByRole("heading", { name: /서명 전 단계입니다/ }).waitFor();
await clickChoice(page, "계약서 초안이나 관련 서류를 받았습니다");
await clickChoice(page, "사거나 팔려"); await clickChoice(page, "집주인·매도인");
await clickChoice(page, "불리하거나 위험한");
await page.getByRole("heading", { name: /받은 서류 내용이/ }).waitFor();
await clickChoice(page, "서류와 제가 겪은"); await clickChoice(page, "금액·보증금");
await page.locator('input[name="name"]').fill("DIAG RE");
await page.locator('input[name="phone"]').fill("09055559999");
await page.locator('input[name="address"]').fill("Quan 7");
await page.locator('input[name="email"]').fill(`diag-${Date.now()}@test.local`);
await page.locator('input[name="kakao_id"]').fill("diag");
await page.locator('input[name="agreeTerms"]').check();
await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
await page.getByRole("heading", { name: "부동산 문서 1차 종합 결과" }).waitFor({ timeout: 90000 });
await page.getByRole("button", { name: PAID_CTA }).first().click();
await page.getByText("2차 · 개인화 검토").waitFor({ timeout: 20000 });
for (let i = 0; i < 50; i++) {
  if (await page.evaluate(() => document.body.innerText.includes("부동산 문서 2차 개인화 결과"))) break;
  const skip = page.getByRole("button", { name: /자료 없이 계속하기/ });
  if (await skip.isVisible().catch(() => false)) { await skip.click(); await page.waitForTimeout(900); continue; }
  if (await page.locator("textarea").first().isVisible().catch(() => false)) {
    await page.locator("textarea").first().fill("보증금 반환 조건 확인 필요");
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) => !b.disabled && b.textContent?.trim() === "다음");
      btn?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    });
    await page.waitForTimeout(700); continue;
  }
  if (!(await clickStitch(page))) break;
  await page.waitForTimeout(550);
}
await page.waitForTimeout(4000);
await page.goto(`${BASE}/mypage`, { waitUntil: "networkidle" });
await page.waitForTimeout(4000);
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
const data = token ? await page.evaluate(async (token) => {
  const res = await fetch("/api/mypage-data", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessToken: token }) });
  return res.ok ? res.json() : null;
}, token) : null;
const leadId = data?.items?.[0]?.id;
const pdfRes = token && leadId ? await page.evaluate(async ({ token, leadId }) => {
  const res = await fetch("/api/mypage-pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessToken: token, leadId }) });
  const buf = await res.arrayBuffer();
  return { ok: res.ok, size: buf.byteLength };
}, { token, leadId }) : null;
console.log(JSON.stringify({ patchResults, verifyProfilePhase: data?.items?.[0]?.verifyProfilePhase, pdfRes }, null, 2));
await browser.close();
