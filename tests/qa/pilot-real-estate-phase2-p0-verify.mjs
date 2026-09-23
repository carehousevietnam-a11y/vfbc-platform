/**
 * VERIFIER — P0 Phase 2 gate shell validation (PRE path)
 * Run: node tests/qa/pilot-real-estate-phase2-p0-verify.mjs
 */
import { chromium } from "@playwright/test";

const ENTRY_Q1 =
  "지금 부동산 관련해서 어떤 일이 진행 중인가요?";
const FREE_QUESTION_SNIPPETS = [
  ENTRY_Q1,
  "서명 전 단계입니다",
  "어떤 문제에 가장 가깝나요",
  "받은 서류를 검토합니다",
];

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

async function runPreToOneResult(page) {
  await page.goto("http://localhost:3010/verify/real-estate", {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(800);
  await clickChoiceByText(page, "서명·납부 전");
  await page
    .getByRole("heading", { name: /서명 전 단계입니다/ })
    .waitFor({ timeout: 20_000 });
  await clickChoiceByText(page, "매물만 보고");
  await clickChoiceByText(page, "전세·월세");
  await clickChoiceByText(page, "집주인·매도인");
  await clickChoiceByText(page, "제출·계약 요건");
  await page
    .getByRole("button", { name: /자료 없이/ })
    .waitFor({ timeout: 30_000 });
  await page.getByRole("button", { name: /자료 없이/ }).click();
  await page.locator('input[name="name"]').waitFor({ state: "visible", timeout: 30_000 });
  await page.locator('input[name="name"]').fill("P0 Phase2 QA");
  await page.locator('input[name="phone"]').fill("0904444099");
  await page.locator('input[name="address"]').fill("Quan 7, TP.HCM");
  await page.locator('input[name="email"]').fill("p0-phase2-qa@test.vfbcai.local");
  await page.locator('input[name="kakao_id"]').fill("p0phase2qa");
  await page.locator('input[name="agreeTerms"]').check();
  await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  await page
    .getByRole("heading", { name: "부동산 문서 1차 종합 결과" })
    .waitFor({ timeout: 90_000 });
}

async function collectPhase2State(page) {
  return page.evaluate(
    ({ entryQ1, freeSnippets }) => {
      const visibleText = (el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return (
          r.width > 0 &&
          r.height > 0 &&
          s.visibility !== "hidden" &&
          s.display !== "none" &&
          Number(s.opacity) > 0
        );
      };

      const bodyText = document.body.innerText;
      const allNodes = [...document.querySelectorAll("*")];

      const entryQ1Nodes = allNodes.filter(
        (el) =>
          el.childElementCount === 0 &&
          (el.textContent?.includes(entryQ1) ||
            el.textContent?.trim() === entryQ1),
      );
      const entryQ1Visible = entryQ1Nodes.filter(visibleText).length;

      const freeQuestionVisibleCounts = freeSnippets.map((snippet) => {
        const matches = allNodes.filter(
          (el) =>
            el.childElementCount <= 1 &&
            el.textContent?.includes(snippet) &&
            visibleText(el),
        );
        return { snippet, visibleCount: matches.length };
      });

      const choiceButtons = [...document.querySelectorAll("button")].filter(
        (btn) => {
          const t = btn.textContent ?? "";
          return (
            visibleText(btn) &&
            (t.includes("서명·납부 전") ||
              t.includes("매물만 보고") ||
              t.includes("전세·월세"))
          );
        },
      );

      return {
        hasOneResultHeading: bodyText.includes("부동산 문서 1차 종합 결과"),
        hasPhase2Banner: bodyText.includes("2차 · 개인화 검토"),
        hasPhase2Heading: bodyText.includes("추가 상황 확인"),
        hasRemovedGateShell: bodyText.includes("1차에서 확인한 내용"),
        hasP1Placeholder: bodyText.includes("다음 구현 단계(P1+)"),
        carryOverLabels: ["검토 경로", "거래·물건", "상대·관계", "확인 목적"].map(
          (label) => ({ label, present: bodyText.includes(label) }),
        ),
        entryQ1DomCount: entryQ1Nodes.length,
        entryQ1VisibleCount: entryQ1Visible,
        freeQuestionVisibleCounts,
        freeChoiceButtonCount: choiceButtons.length,
        overflow:
          document.documentElement.scrollWidth > window.innerWidth + 2,
      };
    },
    { entryQ1: ENTRY_Q1, freeSnippets: FREE_QUESTION_SNIPPETS },
  );
}

async function verifyViewport(label, viewport) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const result = { label, viewport, steps: {} };

  try {
    await runPreToOneResult(page);
    result.steps.oneResultVisible = await page
      .getByRole("heading", { name: "부동산 문서 1차 종합 결과" })
      .isVisible();
    result.steps.phase2CtaVisible = await page
      .getByRole("button", { name: "2차 개인화 검토하기 →" })
      .isVisible();

    await page.getByRole("button", { name: "2차 개인화 검토하기 →" }).click();
    await page.waitForTimeout(800);

    result.steps.afterClick = await collectPhase2State(page);
    result.steps.oneResultHiddenAfterClick =
      !(await page
        .getByRole("heading", { name: "부동산 문서 1차 종합 결과" })
        .isVisible()
        .catch(() => false));
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
  }

  await context.close();
  await browser.close();
  return result;
}

const desktop = await verifyViewport("desktop", { width: 1280, height: 800 });
const mobile = await verifyViewport("mobile", { width: 375, height: 812 });
console.log(JSON.stringify({ desktop, mobile }, null, 2));
