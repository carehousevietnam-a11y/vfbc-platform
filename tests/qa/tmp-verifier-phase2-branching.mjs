/**
 * VERIFIER — Phase2 branching carry-over QA (ephemeral)
 */
import { chromium } from "@playwright/test";

const BASE = "http://localhost:3010";

const LABELS = {
  conflictFocus: "서류 내용과 실제 겪은 상황이 다를 때",
  conflictDetail: "불일치 부분 — 서류와 실제 상황이 어디서",
  regConcern: "등기·소유권 쪽에서 가장 먼저 확인",
  clauseFocus: "가장 걸리는 조항 유형",
  moneySituation: "계약금·보증금·중도금 조건을 다시",
  moneyRecovery: "돌려받지 못한 상황",
  formalResponse: "공식 대응을 어느 단계까지",
  timeline: "문제가 시작된 시점과 지금까지의 흐름",
  docReliability: "서류 자체를 신뢰",
  translationIssue: "원본과 번역본을 대조",
  docsMatchRepeat: "받은 서류 내용이",
  completion: "2차 추가 확인 완료",
};

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

async function passEvidenceAndSignup(page, tag) {
  const evidenceSkip = page.getByRole("button", { name: /자료 없이/ });
  await evidenceSkip.waitFor({ state: "visible", timeout: 90_000 });
  await evidenceSkip.click();
  await page.locator('input[name="name"]').waitFor({ state: "visible", timeout: 30_000 });
  await page.locator('input[name="name"]').fill(`QA ${tag}`);
  await page
    .locator('input[name="phone"]')
    .fill(`0907777${String(Math.floor(Math.random() * 900) + 100)}`);
  await page.locator('input[name="address"]').fill("Quan 7");
  await page
    .locator('input[name="email"]')
    .fill(`${tag}-${Date.now()}@test.vfbcai.local`);
  await page.locator('input[name="kakao_id"]').fill(`${tag}${Date.now().toString().slice(-4)}`);
  await page.locator('input[name="agreeTerms"]').check();
  await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  await page
    .getByRole("heading", { name: "부동산 문서 1차 종합 결과" })
    .waitFor({ timeout: 120_000 });
}

async function enterPhase2(page) {
  await page.getByRole("button", { name: "개인화 상세검토 하기" }).click();
  await page.getByText("2차 · 개인화 검토").waitFor({ timeout: 20_000 });
  await page.getByRole("heading", { name: "추가 상황 확인" }).waitFor({ timeout: 20_000 });
}

function detectFromBody(bodyText) {
  return Object.entries(LABELS)
    .filter(([, snip]) => bodyText.includes(snip))
    .map(([k]) => k);
}

async function collectPhase2Trace(page) {
  const seen = [];
  for (let i = 0; i < 10; i++) {
    const bodyText = await page.evaluate(() => document.body.innerText);
    const active =
      Object.entries(LABELS).find(([, snip]) => bodyText.includes(snip))?.[1] ??
      (bodyText.includes(LABELS.completion) ? LABELS.completion : null);
    seen.push({ step: i, active, detected: detectFromBody(bodyText) });
    if (bodyText.includes(LABELS.completion)) break;

    const clicked = await page.evaluate(() => {
      const visible = (el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
      };
      const btns = [...document.querySelectorAll("button")].filter(visible);
      const choice = btns.find((b) => {
        const t = b.textContent ?? "";
        return (
          t.includes("등기부등본") ||
          t.includes("근저당") ||
          t.includes("해지·위약") ||
          t.includes("말로 한 금액") ||
          t.includes("보증금·계약금") ||
          t.includes("아직 반환") ||
          t.includes("번역") ||
          t.includes("원본") ||
          t.includes("서류 자체") ||
          t.includes("금액 자체") ||
          t.includes("매도인·임대인") ||
          t.includes("문제가 생긴") ||
          t.includes("아직 협의") ||
          t.includes("부분만") ||
          t.includes("전액") ||
          t.includes("의미가") ||
          t.includes("문구가")
        );
      });
      if (choice) {
        choice.click();
        return choice.textContent?.trim().slice(0, 80);
      }
      const ta = document.querySelector("textarea");
      if (ta && visible(ta)) {
        ta.value = "QA detail: document says X but actual situation is Y.";
        ta.dispatchEvent(new Event("input", { bubbles: true }));
        const next = btns.find((b) => b.textContent?.includes("다음"));
        if (next) {
          next.click();
          return "FILLED_TEXTAREA";
        }
      }
      return null;
    });
    if (!clicked) break;
    await page.waitForTimeout(600);
  }
  return seen;
}

async function runBrowserCase(page, id, steps) {
  await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(900);
  for (const s of steps) {
    if (s.wait) {
      await page.getByRole("heading", { name: s.wait }).waitFor({ timeout: 20_000 }).catch(() => {});
    }
    await click(page, s.click);
  }
  await passEvidenceAndSignup(page, id);
  await enterPhase2(page);
  const firstBody = await page.evaluate(() => document.body.innerText);
  const trace = await collectPhase2Trace(page);
  const finalBody = await page.evaluate(() => document.body.innerText);
  const allActive = trace.map((t) => t.active).filter(Boolean);
  return {
    id,
    firstDetected: detectFromBody(firstBody),
    questionOrder: allActive,
    trace,
    hasCompletion: finalBody.includes(LABELS.completion),
    hasDocsRepeat: finalBody.includes(LABELS.docsMatchRepeat),
    hasUploadPanel: finalBody.includes("자료 없이 계속하기") || finalBody.includes("증빙"),
  };
}

const browser = await chromium.launch({ headless: true });
const browserOut = {};

const runOne = async (id, steps) => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  try {
    browserOut[id] = await runBrowserCase(page, id, steps);
  } catch (e) {
    browserOut[id] = { error: String(e) };
  } finally {
    await page.close();
  }
};

await runOne("A", [
  { click: "서명·납부 전" },
  { click: "초안", wait: /서명 전 단계/ },
  { click: "전세·월세" },
  { click: "집주인·매도인" },
  { click: "제출·계약 요건" },
  { click: "서류에 적힌 내용", wait: /받은 서류/ },
]);

await runOne("B", [
  { click: "서명·납부 전" },
  { click: "초안", wait: /서명 전 단계/ },
  { click: "소유권 이전" },
  { click: "집주인·매도인" },
  { click: "불리하거나 위험한" },
  { click: "서류와 제가 겪은", wait: /받은 서류/ },
  { click: "상대가 말로 한" },
]);

await runOne("C", [
  { click: "문제가 생겼" },
  { click: "보증금·계약금을 받지 못", wait: /어떤 문제/ },
  { click: "집주인·매도인" },
  { click: "아직 공식 대응 전" },
  { click: "서류와 제가 겪은" },
  { click: "상대가 말로 한" },
]);

await runOne("D", [
  { click: "서류 내용을 확인" },
  { click: "임대차·전세", wait: /받은 서류/ },
  { click: "원본과 번역본" },
  { click: "서류와 제가 겪은" },
  { click: "번역본·문구" },
]);

await browser.close();

console.log(JSON.stringify(browserOut, null, 2));
