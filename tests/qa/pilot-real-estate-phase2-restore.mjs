/**
 * P1+-2 Phase 2 Restore smoke
 * NOTE: Requires crm_activities.meta UPDATE RLS approval — fails with rls_denied until fixed.
 * Run: node tests/qa/pilot-real-estate-phase2-restore.mjs
 */
import { chromium } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";
const ONE_RESULT = "부동산 문서 1차 종합 결과";
const PERSONALIZED_TITLE = "부동산 문서 2차 개인화 결과";
const PHASE2_HEADING = "추가 상황 확인";
const PHASE2_BANNER = "2차 · 개인화 검토";
const ENTRY_Q1 = "지금 부동산 관련해서 어떤 일이 진행 중인가요?";

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

async function submitSignup(page, tag) {
  await page.locator('input[name="name"]').waitFor({ state: "visible", timeout: 90_000 });
  await page.locator('input[name="name"]').fill(`Restore ${tag}`);
  await page.locator('input[name="phone"]').fill(`0908888${Math.floor(Math.random() * 900) + 100}`);
  await page.locator('input[name="address"]').fill("Quan 7");
  await page.locator('input[name="email"]').fill(`${tag}-${Date.now()}@test.vfbcai.local`);
  await page.locator('input[name="kakao_id"]').fill(`${tag}${Date.now().toString().slice(-4)}`);
  await page.locator('input[name="agreeTerms"]').check();
  await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  await page.getByRole("heading", { name: ONE_RESULT }).waitFor({ timeout: 90_000 });
}

async function enterPhase2(page) {
  await page.getByRole("button", { name: /개인 상세 검토하기|2차 개인화/ }).first().click();
  await page.waitForFunction(
    (heading) => {
      const t = document.body.innerText;
      return t.includes(heading) || t.includes("부동산 문서 2차 개인화 결과");
    },
    PHASE2_HEADING,
    { timeout: 20_000 },
  );
}

async function waitPersist(page) {
  await page.waitForTimeout(2500);
}

async function restore(page) {
  await page.goto(`${BASE}/verify/real-estate?restore=1`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
}

async function completePreToSignup(page) {
  await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
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
}

async function completePostToSignup(page) {
  await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await click(page, "문제가 생겼");
  await page.getByRole("heading", { name: /어떤 문제/ }).waitFor();
  await click(page, "보증금·계약금을 받지 못");
  await click(page, "집주인·매도인");
  await click(page, "아직 공식 대응 전");
  await click(page, "서류와 제가 겪은");
  await click(page, "금액·보증금");
}

async function completeDocumentToSignup(page) {
  await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await click(page, "서류 내용을 확인");
  await page.getByRole("heading", { name: /받은 서류/ }).waitFor();
  await click(page, "임대차·전세");
  await click(page, "원본과 번역본");
  await page.waitForTimeout(400);
  await click(page, "서류와 제가 겪은");
  await click(page, "번역본·문구");
}

async function completeUnclearToSignup(page) {
  await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await click(page, "제 상황부터 설명");
  const textarea = page.locator("textarea").first();
  await textarea.waitFor({ state: "visible", timeout: 15_000 });
  await textarea.fill(
    "전세 만료 후 보증금 반환을 요청했는데 임대인이 거절했습니다. 계약서는 있는데 연락이 두절되었습니다.",
  );
  const nextBtn = page.getByRole("button", { name: /다음|확인|저장/ }).first();
  if (await nextBtn.isVisible().catch(() => false)) await nextBtn.click();
  await page.waitForTimeout(800);
  await click(page, "보증금·계약금을 받지");
  await click(page, "집주인·매도인");
  await click(page, "상대방·기관과 협의·조율");
  await click(page, "서류에 적힌 내용과");
}

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

const DETAIL_TEXT =
  "계약서 조건과 실제 상황 차이를 확인해야 합니다. 보증금 반환 조건이 문서와 다릅니다.";

async function submitStructuredDetail(page) {
  const textarea = page.locator("textarea").first();
  await textarea.waitFor({ state: "visible", timeout: 10_000 });
  await textarea.fill(DETAIL_TEXT);
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
      await submitStructuredDetail(page);
      continue;
    }

    const clicked = await page.evaluate(() => {
      const visible = (el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      };
      const choice = [...document.querySelectorAll("button")].find(
        (b) => visible(b) && /^\d{2}/.test((b.textContent || "").trim()),
      );
      if (choice) {
        choice.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
        return true;
      }
      return false;
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
  await page.waitForFunction(
    (title) => document.body.innerText.includes(title),
    PERSONALIZED_TITLE,
    { timeout: 60_000 },
  );
}

function assertMidRestore(body, label) {
  const fails = [];
  if (body.includes(ONE_RESULT) && !body.includes(PHASE2_BANNER) && !body.includes(PHASE2_HEADING)) {
    fails.push("showing ONE RESULT instead of Phase 2 resume");
  }
  if (body.includes(ENTRY_Q1)) fails.push("FREE Entry Q1 re-asked");
  if (body.includes(PERSONALIZED_TITLE)) fails.push("Personalized shown too early");
  if (!body.includes(PHASE2_BANNER) && !body.includes(PHASE2_HEADING)) {
    fails.push("Phase 2 gate or question flow missing");
  }
  if (fails.length) throw new Error(`FAIL ${label}: ${fails.join(", ")}`);
  console.log(`PASS: ${label} mid-progress restore`);
}

function assertPersonalizedRestore(body, label) {
  const fails = [];
  if (!body.includes(PERSONALIZED_TITLE)) fails.push("missing personalized title");
  if (body.includes(ONE_RESULT)) fails.push("Phase 1 ONE RESULT visible");
  if (body.includes(ENTRY_Q1)) fails.push("FREE Entry Q1 re-asked");
  if (body.includes("1차에서 확인한 내용")) fails.push("Phase 2 gate shell still visible");
  if (fails.length) throw new Error(`FAIL ${label}: ${fails.join(", ")}`);
  console.log(`PASS: ${label} personalized restore`);
}

const browser = await chromium.launch({ headless: true });

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await completePreToSignup(page);
  await submitSignup(page, "pre-mid");
  await enterPhase2(page);
  await click(page, "근저당·가압류");
  await waitPersist(page);
  await restore(page);
  const body = await page.locator("body").innerText();
  assertMidRestore(body, "PRE mid-progress desktop");
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await completePostToSignup(page);
  await submitSignup(page, "post-pers");
  await enterPhase2(page);
  await advancePhase2UntilPersonalized(page, POST_NEEDLES);
  await waitPersist(page);
  await restore(page);
  const body = await page.locator("body").innerText();
  assertPersonalizedRestore(body, "POST personalized desktop");
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await completeDocumentToSignup(page);
  await submitSignup(page, "doc-mid");
  await enterPhase2(page);
  await click(page, "문서상 당사자·명의가 실제와 다릅니다");
  await waitPersist(page);
  await restore(page);
  const body = await page.locator("body").innerText();
  assertMidRestore(body, "DOCUMENT mid-progress desktop");
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await completeUnclearToSignup(page);
  await submitSignup(page, "unclear-mid");
  await enterPhase2(page);
  await click(page, "돈·보증금·계약금 상태");
  await waitPersist(page);
  await restore(page);
  const body = await page.locator("body").innerText();
  assertMidRestore(body, "UNCLEAR mid-progress desktop");
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await completePostToSignup(page);
  await submitSignup(page, "post-mob");
  await enterPhase2(page);
  await advancePhase2UntilPersonalized(page, POST_NEEDLES);
  await waitPersist(page);
  await restore(page);
  const body = await page.locator("body").innerText();
  assertPersonalizedRestore(body, "POST personalized mobile 375");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 2,
  );
  if (overflow) throw new Error("FAIL: mobile 375 overflowX on personalized restore");
  await page.close();
}

await browser.close();
console.log("PASS: P1+-2 Phase 2 Restore smoke (PRE/POST/DOC/UNCLEAR + mobile)");
