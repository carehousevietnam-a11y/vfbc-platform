/**
 * IMPLEMENTER — P1+-1 Personalized Result smoke
 * Run: node tests/qa/pilot-real-estate-phase2-personalized-result.mjs
 */
import { chromium } from "@playwright/test";

const ENTRY_Q1 = "지금 부동산 관련해서 어떤 일이 진행 중인가요?";
const P1_PLACEHOLDER = "개인화 결과는 다음 단계(P1+)";
const PERSONALIZED_TITLE = "부동산 문서 2차 개인화 결과";
const DETAIL_TEXT =
  "계약서 조건과 실제 상황 차이를 확인해야 합니다. 보증금 반환 조건이 문서와 다릅니다.";
const DOC_CONFLICT_DETAIL =
  "번역본 보증금 금액이 원본과 다르게 적혀 있어 계약 전에 확인이 필요합니다.";

const PRE_NEEDLES = [
  "등기·소유권",
  "근저당·가압류",
  "등기 확인 전이라면",
  "걸리는 조항",
  "해지·위약",
  "보증금·계약금·중도금",
  "말로 한 금액·조건",
  "지급·반환 방식",
  "서류 금액·보증금",
  "서류와 실제 상황",
];

const POST_NEEDLES = [
  "상대가 보증금·계약금 반환 자체를 거부",
  "아직 서면·공식 연락을 보내지",
  "최근 발생했고 아직 초기",
  "서류 금액·보증금 표기와 실제 합의",
];

const DOCUMENT_NEEDLES = [
  "문서상 당사자·명의가 실제와 다릅니다",
  "금액·보증금 표현이 원본과 다릅니다",
  "서류 금액·보증금 표기와 실제 합의",
];

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
  await page.locator('input[name="name"]').fill(`P1plus ${tag}`);
  await page.locator('input[name="phone"]').fill(`0907777${Math.floor(Math.random() * 900) + 100}`);
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

function personalizedMetrics(bodyText) {
  return {
    personalizedTitle: bodyText.includes(PERSONALIZED_TITLE),
    section01: bodyText.includes("01 현재 상황"),
    section02: bodyText.includes("02 핵심 판단"),
    section03: bodyText.includes("03 주요 위험 요인"),
    section04: bodyText.includes("04 확인이 필요한 사항"),
    section05: bodyText.includes("05 지금 해야 할 일"),
    p1Placeholder: bodyText.includes(P1_PLACEHOLDER),
    phase1Result: bodyText.includes("부동산 문서 1차 종합 결과"),
    entryQ1: bodyText.includes(ENTRY_Q1),
    gateShell: [...document.querySelectorAll("h3,h4")].some(
      (el) => el.textContent?.trim() === "1차에서 확인한 내용",
    ),
  };
}

async function waitForPersonalized(page, timeoutMs = 60_000) {
  await page.waitForFunction(
    (title) => document.body.innerText.includes(title),
    PERSONALIZED_TITLE,
    { timeout: timeoutMs },
  );
}

async function submitStructuredDetail(page, text) {
  const textarea = page.locator("textarea").first();
  await textarea.waitFor({ state: "visible", timeout: 10_000 });
  await textarea.fill(text);
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find(
      (b) => !b.disabled && b.textContent?.trim() === "다음",
    );
    btn?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  });
  await page.waitForTimeout(600);
}

async function advancePhase2UntilPersonalized(page, _needles, maxSteps = 32) {
  for (let step = 0; step < maxSteps; step += 1) {
    const snap = await page.evaluate((title) => ({
      personalized: document.body.innerText.includes(title),
      evidence: document.body.innerText.includes("간단한 자료가 있으면 함께 첨부"),
      hasTextarea: !!document.querySelector("textarea"),
    }), PERSONALIZED_TITLE);
    if (snap.personalized) return;

    if (snap.evidence) {
      await page.getByRole("button", { name: /자료 없이 계속하기/ }).click();
      await page.waitForTimeout(800);
      continue;
    }

    if (snap.hasTextarea) {
      const detailText = (await page.evaluate(() => document.body.innerText)).includes(
        "서류와 실제 상황이 어디서",
      )
        ? DOC_CONFLICT_DETAIL
        : DETAIL_TEXT;
      await submitStructuredDetail(page, detailText);
      continue;
    }

    const clicked = await page.evaluate(() => {
      const visible = (el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
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
    if (!clicked) {
      const skip = page.getByRole("button", { name: /자료 없이 계속하기/ });
      if (await skip.isVisible().catch(() => false)) {
        await skip.click();
        await page.waitForTimeout(800);
        continue;
      }
      break;
    }
    await page.waitForTimeout(500);
  }
  await waitForPersonalized(page);
}

async function completePrePhase2(page) {
  await page.goto("http://localhost:3010/verify/real-estate", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await click(page, "서명·납부 전");
  await page.getByRole("heading", { name: /서명 전 단계입니다/ }).waitFor();
  await click(page, "초안");
  await click(page, "사거나 팔려");
  await click(page, "집주인·매도인");
  await click(page, "불리하거나 위험한");
  await page.getByRole("heading", { name: /받은 서류 내용이/ }).waitFor();
  await click(page, "서류와 제가 겪은");
  await click(page, "금액·보증금");
  await signup(page, "pre");
  await advancePhase2UntilPersonalized(page, PRE_NEEDLES);
}

async function completePostPhase2(page) {
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
  await advancePhase2UntilPersonalized(page, POST_NEEDLES);
}

async function completeDocumentPhase2(page) {
  await page.goto("http://localhost:3010/verify/real-estate", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await click(page, "서류 내용을 확인");
  await page.getByRole("heading", { name: /받은 서류/ }).waitFor();
  await click(page, "임대차·전세");
  await click(page, "원본과 번역본");
  await page.waitForTimeout(400);
  await click(page, "서류와 제가 겪은");
  await click(page, "번역본·문구");
  await signup(page, "doc");
  await advancePhase2UntilPersonalized(page, DOCUMENT_NEEDLES);
}

async function completeUnclearMaterialStop(page) {
  await page.goto("http://localhost:3010/verify/real-estate", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await click(page, "제 상황부터 설명");
  const textarea = page.locator("textarea").first();
  await textarea.waitFor({ state: "visible", timeout: 15_000 });
  await textarea.fill(
    "최근 집주소와 연락처가 적힌 안내를 받았습니다. 무엇부터 확인해야 할지 정리가 되지 않습니다.",
  );
  const nextBtn = page.getByRole("button", { name: /다음|확인|저장/ }).first();
  if (await nextBtn.isVisible().catch(() => false)) await nextBtn.click();
  await page.waitForTimeout(800);
  await signup(page, "unclear");
  await advancePhase2UntilPersonalized(page, []);
}

function assertPersonalized(label, metrics) {
  const fails = [];
  if (!metrics.personalizedTitle) fails.push("missing personalized title");
  if (!metrics.section01) fails.push("missing §01");
  if (!metrics.section02) fails.push("missing §02");
  if (!metrics.section03) fails.push("missing §03");
  if (!metrics.section04) fails.push("missing §04");
  if (!metrics.section05) fails.push("missing §05");
  if (metrics.p1Placeholder) fails.push("P1+ placeholder still visible");
  if (metrics.phase1Result) fails.push("Phase 1 ONE RESULT still visible");
  if (metrics.entryQ1) fails.push("Entry Q1 visible");
  if (metrics.gateShell) fails.push("Phase 2 gate shell still visible");
  if (fails.length > 0) {
    throw new Error(`FAIL ${label}: ${fails.join(", ")}`);
  }
  console.log(`PASS: ${label} personalized result`);
}

const browser = await chromium.launch({ headless: true });
const out = {};

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await completePrePhase2(page);
  out.preDesktop = personalizedMetrics(await page.evaluate(() => document.body.innerText));
  assertPersonalized("PRE desktop", out.preDesktop);
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await completePostPhase2(page);
  out.postDesktop = personalizedMetrics(await page.evaluate(() => document.body.innerText));
  assertPersonalized("POST desktop", out.postDesktop);
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await completeDocumentPhase2(page);
  out.docDesktop = personalizedMetrics(await page.evaluate(() => document.body.innerText));
  assertPersonalized("DOCUMENT desktop", out.docDesktop);
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await completeDocumentPhase2(page);
  out.docMobile = personalizedMetrics(await page.evaluate(() => document.body.innerText));
  assertPersonalized("DOCUMENT mobile 375", out.docMobile);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 2,
  );
  if (overflow) throw new Error("FAIL: mobile 375 overflowX on DOCUMENT personalized");
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await completeUnclearMaterialStop(page);
  out.unclearMobile = personalizedMetrics(await page.evaluate(() => document.body.innerText));
  assertPersonalized("UNCLEAR Material Stop mobile", out.unclearMobile);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 2,
  );
  if (overflow) throw new Error("FAIL: mobile 375 overflowX on UNCLEAR personalized");
  await page.close();
}

await browser.close();
console.log(JSON.stringify(out, null, 2));
console.log("PASS: P1+-1 Personalized Result smoke (PRE/POST/DOC/UNCLEAR)");
