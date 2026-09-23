/**
 * IMPLEMENTER — P1a PRE Phase 2 adaptive questions smoke
 * Run: node tests/qa/pilot-real-estate-phase2-p1a-pre.mjs
 */
import { chromium } from "@playwright/test";

const ENTRY_Q1 = "지금 부동산 관련해서 어떤 일이 진행 중인가요?";

async function clickChoiceByText(page, text) {
  await page.waitForFunction(
    (needle) => {
      const btns = [...document.querySelectorAll("button")];
      const b = btns.find((x) => x.textContent?.includes(needle));
      if (!b) return false;
      b.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      return true;
    },
    text,
    { timeout: 20_000 },
  );
  await page.waitForTimeout(500);
}

async function runPreDraftRiskToPhase2(page) {
  await page.goto("http://localhost:3010/verify/real-estate", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await clickChoiceByText(page, "서명·납부 전");
  await page.getByRole("heading", { name: /서명 전 단계입니다/ }).waitFor({ timeout: 20_000 });
  await clickChoiceByText(page, "초안");
  await page.waitForTimeout(400);
  await clickChoiceByText(page, "사거나 팔려");
  await clickChoiceByText(page, "집주인·매도인");
  await clickChoiceByText(page, "불리하거나 위험한");
  await page.getByRole("heading", { name: /받은 서류 내용이/ }).waitFor({ timeout: 20_000 });
  await clickChoiceByText(page, "서류와 제가 겪은");
  await clickChoiceByText(page, "금액·보증금");
  await page.locator('input[name="name"]').waitFor({ state: "visible", timeout: 30_000 });
  await page.locator('input[name="name"]').fill("P1a PRE QA");
  await page.locator('input[name="phone"]').fill("0904444100");
  await page.locator('input[name="address"]').fill("Quan 7, TP.HCM");
  await page.locator('input[name="email"]').fill("p1a-pre-qa@test.vfbcai.local");
  await page.locator('input[name="kakao_id"]').fill("p1apreqa");
  await page.locator('input[name="agreeTerms"]').check();
  await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  await page
    .getByRole("heading", { name: "부동산 문서 1차 종합 결과" })
    .waitFor({ timeout: 90_000 });
  await page.getByRole("button", { name: /개인 상세 검토하기|2차 개인화/ }).first().click();
  await page.getByText("2차 · 개인화 검토").waitFor({ timeout: 20_000 });
  await page.getByRole("heading", { name: "추가 상황 확인" }).waitFor({ timeout: 20_000 });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  try {
    await runPreDraftRiskToPhase2(page);

    const state = await page.evaluate(({ entryQ1 }) => {
      const visible = (el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
      };
      const bodyText = document.body.innerText;
      const entryVisible = [...document.querySelectorAll("*")].some(
        (el) => visible(el) && el.textContent?.includes(entryQ1),
      );
      const phase2RegQ = bodyText.includes("등기·소유권 쪽에서 가장 먼저 확인");
      const phase2MasterUi =
        bodyText.includes("2차 · 개인화 검토") && bodyText.includes("추가 상황 확인");
      const removedGateShell = [...document.querySelectorAll("h3,h4")].some(
        (el) => el.textContent?.trim() === "1차에서 확인한 내용",
      );
      const freeReask = entryVisible;
      return { phase2RegQ, phase2MasterUi, removedGateShell, freeReask, bodySnippet: bodyText.slice(0, 1200) };
    }, { entryQ1: ENTRY_Q1 });

    console.log("P1a PRE Phase2 state:", JSON.stringify(state, null, 2));

    if (state.freeReask) throw new Error("FAIL: Entry Q1 visible in Phase 2");
    if (state.removedGateShell) throw new Error("FAIL: removed Phase2 gate shell heading still visible");
    if (!state.phase2MasterUi) throw new Error("FAIL: Master Phase2 banner/heading missing");
    if (!state.phase2RegQ) throw new Error("FAIL: PRE registrationConcern question not shown");

    await clickChoiceByText(page, "근저당·가압류");
    await page.waitForTimeout(600);

    const clauseQ = await page.evaluate(() =>
      document.body.innerText.includes("가장 걸리는 조항 유형"),
    );
    if (!clauseQ) throw new Error("FAIL: clauseFocus question not shown after registrationConcern");

    console.log("PASS: P1a PRE Phase 2 adaptive flow (registrationConcern → clauseFocus)");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
