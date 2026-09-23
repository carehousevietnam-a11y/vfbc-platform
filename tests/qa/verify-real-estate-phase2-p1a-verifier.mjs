/**
 * VERIFIER — P1a PRE Phase 2 formal QA
 * Run: node tests/qa/verify-real-estate-phase2-p1a-verifier.mjs
 */
import { chromium } from "@playwright/test";

const BASE = "http://localhost:3010";
const ENTRY_Q1 = "지금 부동산 관련해서 어떤 일이 진행 중인가요?";
const FREE_SNIPPETS = [
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
      b.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      return true;
    },
    text,
    { timeout: 25_000 },
  );
  await page.waitForTimeout(450);
}

async function completeSignup(page, tag) {
  await page.getByRole("button", { name: /자료 없이/ }).waitFor({ timeout: 30_000 });
  await page.getByRole("button", { name: /자료 없이/ }).click();
  await page.locator('input[name="name"]').waitFor({ state: "visible", timeout: 30_000 });
  await page.locator('input[name="name"]').fill(`P1a ${tag}`);
  await page.locator('input[name="phone"]').fill(`0904444${String(Math.floor(Math.random() * 900) + 100)}`);
  await page.locator('input[name="address"]').fill("Quan 7, TP.HCM");
  await page.locator('input[name="email"]').fill(`p1a-${tag}-${Date.now()}@test.vfbcai.local`);
  await page.locator('input[name="kakao_id"]').fill(`p1a${tag}${Date.now().toString().slice(-4)}`);
  await page.locator('input[name="agreeTerms"]').check();
  await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  await page
    .getByRole("heading", { name: "부동산 문서 1차 종합 결과" })
    .waitFor({ timeout: 90_000 });
}

async function enterPhase2(page) {
  await page.getByRole("button", { name: /2차 개인화 검토하기/ }).click();
  await page.getByText("2차 · 개인화 검토").waitFor({ timeout: 20_000 });
  await page.getByRole("heading", { name: "추가 상황 확인" }).waitFor({ timeout: 20_000 });
}

function pageMetrics(page) {
  return page.evaluate(({ entryQ1, freeSnippets }) => {
    const visible = (el) => {
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
    const docEl = document.documentElement;
    const overflowX = docEl.scrollWidth > window.innerWidth + 2;

    const countVisibleSnippet = (snippet) =>
      [...document.querySelectorAll("*")].filter(
        (el) => visible(el) && el.textContent?.includes(snippet),
      ).length;

    const carryOverSection = [...document.querySelectorAll("section")].find((s) =>
      s.textContent?.includes("추가 상황 확인"),
    );
    const carryOverText = carryOverSection?.innerText ?? "";

    const phase2ChoiceButtons = [...document.querySelectorAll("button")].filter((b) => {
      if (!visible(b)) return false;
      const t = b.textContent ?? "";
      return (
        t.includes("등기부등본상") ||
        t.includes("보증금·계약금·중도금 조건") ||
        t.includes("해지·위약") ||
        t.includes("말로 한 금액")
      );
    });

    return {
      bodyText,
      overflowX,
      viewportW: window.innerWidth,
      scrollW: docEl.scrollWidth,
      entryQ1Visible: countVisibleSnippet(entryQ1),
      freeVisibleCounts: freeSnippets.map((s) => ({
        snippet: s,
        count: countVisibleSnippet(s),
      })),
      hasRemovedGateShell: bodyText.includes("1차에서 확인한 내용"),
      hasPhase2Heading: bodyText.includes("추가 상황 확인"),
      hasPhase2Banner: bodyText.includes("2차 · 개인화 검토"),
      hasRegQuestion: bodyText.includes("등기·소유권 쪽에서 가장 먼저 확인"),
      hasClauseQuestion: bodyText.includes("가장 걸리는 조항 유형"),
      hasMoneyQuestion: bodyText.includes("계약금·보증금·중도금 조건을 다시"),
      hasRegDetailQuestion: bodyText.includes("등기 확인 전이라면"),
      hasMoneyDetailQuestion: bodyText.includes("지급·반환 방식이 불분명"),
      hasCompletion: bodyText.includes("2차 추가 확인 완료"),
      phase2ChoiceCount: phase2ChoiceButtons.length,
      carryOverText,
    };
  }, { entryQ1: ENTRY_Q1, freeSnippets: FREE_SNIPPETS });
}

async function runFreePreFlow(page, steps) {
  await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  for (const step of steps) {
    if (step.waitHeading) {
      await page.getByRole("heading", { name: step.waitHeading }).waitFor({ timeout: 20_000 });
    }
    await clickChoiceByText(page, step.click);
  }
  await completeSignup(page, steps[0]?.tag ?? "flow");
}

async function scenarioD_viewingOnly(page, viewport) {
  await page.setViewportSize(viewport);
  await runFreePreFlow(page, [
    { click: "서명·납부 전", tag: "D" },
    { click: "매물만 보고", waitHeading: /서명 전 단계입니다/ },
    { click: "전세·월세" },
    { click: "집주인·매도인" },
    { click: "제출·계약 요건" },
  ]);
  await enterPhase2(page);
  const m = await pageMetrics(page);
  return {
    id: "D-viewing-only",
    viewport,
    metrics: m,
    expect: {
      zeroQuestions: !m.hasRegQuestion && !m.hasClauseQuestion && !m.hasMoneyQuestion,
      completion: m.hasCompletion,
      freeBlocked: m.entryQ1Visible === 0 && m.freeVisibleCounts.every((x) => x.count === 0),
    },
  };
}

async function scenarioA_registrationOnly(page, viewport) {
  await page.setViewportSize(viewport);
  await runFreePreFlow(page, [
    { click: "서명·납부 전", tag: "A" },
    { click: "곧 서명", waitHeading: /서명 전 단계입니다/ },
    { click: "사거나 팔려" },
    { click: "집주인·매도인" },
    { click: "제출·계약 요건" },
    { click: "서류에 적힌 내용" },
  ]);
  await enterPhase2(page);
  const first = await pageMetrics(page);
  await clickChoiceByText(page, "근저당·가압류");
  await page.waitForTimeout(600);
  const after = await pageMetrics(page);
  return {
    id: "A-registration-only",
    viewport,
    first,
    after,
    expect: {
      firstRegOnly:
        first.hasRegQuestion &&
        !first.hasClauseQuestion &&
        !first.hasMoneyQuestion,
      afterComplete:
        after.hasCompletion &&
        !after.hasRegQuestion &&
        !after.hasClauseQuestion &&
        !after.hasMoneyQuestion,
    },
  };
}

async function scenarioC_moneyOnly(page, viewport) {
  await page.setViewportSize(viewport);
  await runFreePreFlow(page, [
    { click: "서명·납부 전", tag: "C" },
    { click: "매물만 보고", waitHeading: /서명 전 단계입니다/ },
    { click: "전세·월세" },
    { click: "집주인·매도인" },
    { click: "제출·계약 요건" },
    { click: "서류와 제가 겪은", waitHeading: /받은 서류 내용이/ },
    { click: "금액·보증금" },
  ]);
  await enterPhase2(page);
  const first = await pageMetrics(page);
  await clickChoiceByText(page, "말로 한 금액");
  await page.waitForTimeout(600);
  const after = await pageMetrics(page);
  return {
    id: "C-money-only",
    viewport,
    first,
    after,
    expect: {
      firstMoneyOnly:
        first.hasMoneyQuestion &&
        !first.hasRegQuestion &&
        !first.hasClauseQuestion,
      afterComplete: after.hasCompletion,
    },
  };
}

async function scenarioB_clauseAfterReg(page, viewport) {
  await page.setViewportSize(viewport);
  await runFreePreFlow(page, [
    { click: "서명·납부 전", tag: "B" },
    { click: "초안", waitHeading: /서명 전 단계입니다/ },
    { click: "사거나 팔려" },
    { click: "집주인·매도인" },
    { click: "불리하거나 위험한" },
    { click: "서류에 적힌 내용", waitHeading: /받은 서류 내용이/ },
  ]);
  await enterPhase2(page);
  const first = await pageMetrics(page);
  await clickChoiceByText(page, "매도인·임대인의 처분권한");
  await page.waitForTimeout(600);
  const second = await pageMetrics(page);
  await clickChoiceByText(page, "해지·위약");
  await page.waitForTimeout(600);
  const third = await pageMetrics(page);
  return {
    id: "B-clause-chain",
    viewport,
    first,
    second,
    third,
    expect: {
      startsReg: first.hasRegQuestion && !first.hasClauseQuestion,
      thenClause: second.hasClauseQuestion && !second.hasRegQuestion,
      notFixedMoneyFirst: !first.hasMoneyQuestion,
    },
  };
}

async function scenarioStructuredDetail(page, viewport) {
  await page.setViewportSize(viewport);
  await runFreePreFlow(page, [
    { click: "서명·납부 전", tag: "SD" },
    { click: "매물만 보고", waitHeading: /서명 전 단계입니다/ },
    { click: "계약금·가계약" },
    { click: "계약금·중도금" },
    { click: "집주인·매도인" },
    { click: "제출·계약 요건" },
    { click: "서류와 제가 겪은", waitHeading: /받은 서류 내용이/ },
    { click: "금액·보증금" },
  ]);
  await enterPhase2(page);
  // deposit_agreed triggers clause + money; skip reg if possible - deposit_agreed + 계약금 property
  // registration: deposit not in stageNeedsReg - false; property 계약금 not 매매 - false; goal requirements - false
  // first should be clauseFocus
  const first = await pageMetrics(page);
  await clickChoiceByText(page, "보증금·계약금·중도금 조건");
  await page.waitForTimeout(500);
  const moneyQ = await pageMetrics(page);
  await clickChoiceByText(page, "금액 자체는 맞지만");
  await page.waitForTimeout(500);
  const detailQ = await pageMetrics(page);
  if (detailQ.hasMoneyDetailQuestion) {
    await page.locator("textarea").first().fill(
      "계약금 2천만 동은 입금했으나 반환 계좌와 시점이 계약서에 명시되어 있지 않습니다.",
    );
    await page.getByRole("button", { name: "다음" }).click();
    await page.waitForTimeout(700);
  }
  const done = await pageMetrics(page);
  return {
    id: "structuredDetail-money",
    viewport,
    first,
    moneyQ,
    detailQ,
    done,
    expect: {
      hadMoneyDetail: detailQ.hasMoneyDetailQuestion,
      completed: done.hasCompletion,
    },
  };
}

async function scenarioCarryOverStable(page) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await runFreePreFlow(page, [
    { click: "서명·납부 전", tag: "CO" },
    { click: "곧 서명", waitHeading: /서명 전 단계입니다/ },
    { click: "사거나 팔려" },
    { click: "집주인·매도인" },
    { click: "제출·계약 요건" },
    { click: "서류에 적힌 내용" },
  ]);
  await enterPhase2(page);
  const before = await pageMetrics(page);
  const carryBefore = before.carryOverText;
  await clickChoiceByText(page, "근저당·가압류");
  await page.waitForTimeout(600);
  const after = await pageMetrics(page);
  return {
    id: "carry-over-stable",
    before: carryBefore,
    after: after.carryOverText,
    expect: {
      stillHasPath: after.carryOverText.includes("사전 검토"),
      stillHasProperty: after.carryOverText.includes("매매"),
      stillHasGoal: after.carryOverText.includes("제출·계약 요건"),
      completionChip: after.carryOverText.includes("등기·소유권") || after.bodyText.includes("2차 추가 확인 완료"),
    },
  };
}

async function smokePage(page, path, label) {
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  const title = await page.title();
  const ok = !title.toLowerCase().includes("error") && (await page.locator("body").innerText()).length > 100;
  return { label, path, ok, title };
}

function evaluateScenario(result) {
  const fails = [];
  if (result.expect) {
    for (const [k, v] of Object.entries(result.expect)) {
      if (!v) fails.push(k);
    }
  }
  const m = result.metrics ?? result.first ?? result.after ?? {};
  if (m.entryQ1Visible > 0) fails.push("entryQ1Visible");
  if (m.freeVisibleCounts?.some((x) => x.count > 0)) fails.push("freeSnippetVisible");
  if (m.overflowX) fails.push("horizontalOverflow");
  return fails;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = { scenarios: [], smoke: [], errors: [] };

  const runScenario = async (fn, viewport) => {
    const page = await browser.newPage();
    try {
      const r = await fn(page, viewport);
      r.fails = evaluateScenario(r);
      r.pass = r.fails.length === 0;
      results.scenarios.push(r);
    } catch (err) {
      results.errors.push({ fn: fn.name, viewport, message: String(err) });
    } finally {
      await page.close();
    }
  };

  await runScenario(scenarioD_viewingOnly, { width: 1280, height: 900 });
  await runScenario(scenarioD_viewingOnly, { width: 375, height: 812 });
  await runScenario(scenarioA_registrationOnly, { width: 1280, height: 900 });
  await runScenario(scenarioC_moneyOnly, { width: 1280, height: 900 });
  await runScenario(scenarioB_clauseAfterReg, { width: 1280, height: 900 });
  await runScenario(scenarioStructuredDetail, { width: 1280, height: 900 });
  await runScenario(scenarioStructuredDetail, { width: 375, height: 812 });

  const coPage = await browser.newPage();
  try {
    results.scenarios.push({
      ...(await scenarioCarryOverStable(coPage)),
      pass: true,
      fails: [],
    });
    const co = results.scenarios[results.scenarios.length - 1];
    co.fails = Object.entries(co.expect).filter(([, v]) => !v).map(([k]) => k);
    co.pass = co.fails.length === 0;
  } catch (err) {
    results.errors.push({ fn: "carryOver", message: String(err) });
  } finally {
    await coPage.close();
  }

  const smokePage_ = await browser.newPage();
  try {
    results.smoke.push(await smokePage(smokePage_, "/verify/admin", "admin"));
    results.smoke.push(await smokePage(smokePage_, "/check/trc", "trc"));
  } finally {
    await smokePage_.close();
  }

  await browser.close();

  console.log(JSON.stringify(results, null, 2));

  const anyFail =
    results.errors.length > 0 ||
    results.scenarios.some((s) => !s.pass) ||
    results.smoke.some((s) => !s.ok);

  if (anyFail) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
