/**
 * VERIFY Admin (행정문서) — P0 Product Closure E2E
 *
 * Run desktop:
 *   npx playwright test tests/qa/admin-verify-free-e2e.spec.ts --project=desktop
 * Run mobile:
 *   npx playwright test tests/qa/admin-verify-free-e2e.spec.ts --project=mobile
 */
import { test, expect, type Page } from "@playwright/test";

const QA_NAME = "Rentry QA VADM P0";
const QA_ADDRESS = "Quan 7, TP.HCM";
const QA_KAKAO = "rentryvadm001";
const QA_PHONE = "0904444101";

const ONE_RESULT_HEADING = "행정문서 1차 종합 결과";
const PERSONALIZED_HEADING = "행정문서 개인화 검토 결과";
const ENTRY_Q1_SNIPPET = "교통국에서 받은 운전면허";

async function clickChoiceByText(page: Page, text: string) {
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
  await page.waitForTimeout(500);
}

async function clickFirstStitchChoice(page: Page) {
  const clicked = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")].filter((btn) => {
      const t = (btn.textContent ?? "").trim();
      return /^\d{2}/.test(t) && !t.includes("직접 설명하기");
    });
    const btn = btns[0];
    if (!btn) return false;
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    return true;
  });
  if (clicked) await page.waitForTimeout(500);
  return clicked;
}

async function isSignupVisible(page: Page) {
  return page.locator('input[name="name"]').isVisible().catch(() => false);
}

async function isPhase1EvidenceVisible(page: Page) {
  return page
    .getByRole("heading", { name: /간단한 자료가 있으면 함께 첨부/ })
    .isVisible()
    .catch(() => false);
}

async function isPhase2EvidenceVisible(page: Page) {
  return page
    .getByRole("heading", { name: /2차 상세검토에 필요한 자료/ })
    .isVisible()
    .catch(() => false);
}

async function clickThroughSteps(page: Page, steps: string[]) {
  for (const step of steps) {
    if (await isOneResultVisible(page)) return;
    if (await isSignupVisible(page)) return;
    if (await isPhase1EvidenceVisible(page)) return;
    await clickChoiceByText(page, step);
  }
  for (let i = 0; i < 6; i++) {
    if (await isOneResultVisible(page)) return;
    if (await isSignupVisible(page)) return;
    if (await isPhase1EvidenceVisible(page)) return;
    if (!(await clickFirstStitchChoice(page))) break;
  }
}

async function isOneResultVisible(page: Page) {
  return page
    .getByRole("heading", { name: ONE_RESULT_HEADING })
    .isVisible()
    .catch(() => false);
}

async function isPersonalizedVisible(page: Page) {
  return page
    .getByRole("heading", { name: PERSONALIZED_HEADING })
    .isVisible()
    .catch(() => false);
}

async function expectOneResultSections(page: Page) {
  await expect(page.getByRole("heading", { name: ONE_RESULT_HEADING })).toBeVisible({
    timeout: 90_000,
  });
  await expect(page.getByRole("heading", { name: /01.*현재 상황/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /02.*핵심 확인 결과/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /03.*주요 위험 요인/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /04.*확인이 필요한 사항/ })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /05.*지금 확인해 보세요/ }),
  ).toBeVisible();
}

/** Phase2 meta persisted — restore lands on Phase2 evidence gate, not Phase1 ONE RESULT */
async function expectPhase2RestoreEvidenceGate(page: Page) {
  await expect(page.getByRole("heading", { name: /2차 상세검토에 필요한 자료/ })).toBeVisible({
    timeout: 90_000,
  });
  await expect(page.getByRole("heading", { name: ONE_RESULT_HEADING })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: PERSONALIZED_HEADING })).toHaveCount(0);
  await expectNoEntryQ1(page);
  await expect(page.getByRole("button", { name: "AI 1차 분석 결과 보기" })).toHaveCount(0);
}

async function expectNoEntryQ1(page: Page) {
  await expect(page.getByText(ENTRY_Q1_SNIPPET)).toHaveCount(0);
}

async function skipEvidenceIfVisible(page: Page) {
  const skipBtn = page.getByRole("button", { name: /자료 없이 계속하기/ });
  if (await skipBtn.isVisible().catch(() => false)) {
    await skipBtn.click();
    await page.waitForTimeout(800);
  }
}

async function submitSignup(page: Page, email: string) {
  await page.locator('input[name="name"]').waitFor({ state: "visible", timeout: 30_000 });
  await page.locator('input[name="name"]').fill(QA_NAME);
  await page.locator('input[name="phone"]').fill(QA_PHONE);
  await page.locator('input[name="address"]').fill(QA_ADDRESS);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="kakao_id"]').fill(QA_KAKAO);
  await page.locator('input[name="agreeTerms"]').check();
  const submit = page.getByRole("button", { name: "AI 1차 분석 결과 보기" });
  await expect(submit).toBeEnabled({ timeout: 10_000 });
  await submit.click();
  await expect(page.getByText("로그인 세션 생성에 실패했습니다")).toHaveCount(0);
  await page.waitForTimeout(1500);
}

async function completePhase1WithSignup(page: Page, email?: string) {
  await page.goto("/verify/admin", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await clickThroughSteps(page, [
    "교통위반이나 문제를 알리는 통지",
    "내가 알고 있는 상황과 기관에서 말하는 내용이 서로 다른",
    "기관에서 말하는 문제가 실제로 내 상황에 해당하는지",
    "아직 아무에게도 설명하거나",
    "대응해야 하는 날짜를 확인했습니다",
  ]);
  await skipEvidenceIfVisible(page);
  if (await isSignupVisible(page)) {
    await submitSignup(page, email ?? `p0-phase1-${Date.now()}@test.vfbcai.local`);
  }
  await expectOneResultSections(page);
}

async function completePhase2FromFirstResult(page: Page) {
  await page.getByRole("button", { name: /개인화?\s*상세\s*검토\s*하기/ }).click();
  await page.waitForTimeout(800);
  await expect(
    page.getByText(/실제 상황과 기관에서 문제라고 보는 내용이 다르다고/),
  ).toBeVisible({ timeout: 30_000 });
  for (let i = 0; i < 16; i++) {
    if (await isPersonalizedVisible(page)) break;
    if (await isPhase2EvidenceVisible(page)) break;
    if (await isOneResultVisible(page)) break;
    await clickFirstStitchChoice(page);
  }
  await expect(page.getByRole("heading", { name: /2차 상세검토에 필요한 자료/ })).toBeVisible({
    timeout: 15_000,
  });
  await skipEvidenceIfVisible(page);
  await expect(page.getByRole("heading", { name: PERSONALIZED_HEADING })).toBeVisible({
    timeout: 90_000,
  });
  await page.waitForTimeout(1500);
}

/** CASE_01 full path through Phase1 evidence → signup → 1차 → Phase2 → 2차 result */
async function completeFullFunnelToPersonalized(page: Page, email?: string) {
  await page.goto("/verify/admin", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await clickThroughSteps(page, [
    "교통위반이나 문제를 알리는 통지",
    "내가 알고 있는 상황과 기관에서 말하는 내용이 서로 다른",
    "기관에서 말하는 문제가 실제로 내 상황에 해당하는지",
    "아직 아무에게도 설명하거나",
    "대응해야 하는 날짜를 확인했습니다",
  ]);
  await expect(page.getByRole("heading", { name: /간단한 자료가 있으면 함께 첨부/ })).toBeVisible({
    timeout: 15_000,
  });
  await skipEvidenceIfVisible(page);
  if (await isSignupVisible(page)) {
    await submitSignup(page, email ?? `p0-full-${Date.now()}@test.vfbcai.local`);
  }
  await expectOneResultSections(page);
  await completePhase2FromFirstResult(page);
}

async function expectDocumentsHandoff(page: Page, mode: "ai_report" | "expert") {
  await page.waitForURL(new RegExp(`/documents.*mode=${mode}`), { timeout: 30_000 });
  await expect(page).toHaveURL(/leadId=/);
  const heading =
    mode === "ai_report"
      ? /행정문서 검토 · AI 리포트 진행/
      : /행정문서 검토 · 전문가 진행/;
  await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible({
    timeout: 15_000,
  });
}

async function completePhase2SignupForRestore(page: Page, email: string) {
  await completePhase1WithSignup(page, email);
  await completePhase2FromFirstResult(page);
}

async function completePhase2ToPersonalized(page: Page) {
  await completePhase2FromFirstResult(page);
}

async function expectNoQuestionFlashDuringTransition(page: Page, ms = 5000) {
  const questionMarkers = ["1. 검토 내용 체크", "QUESTION GUIDE", "OFFICIAL SOURCES"];
  const steps = Math.ceil(ms / 150);
  const flashSamples: { timeMs: number; marker: string }[] = [];
  for (let i = 0; i < steps; i++) {
    const body = await page.locator("body").innerText();
    if (/\b01\s*\/\s*03\b/.test(body)) {
      flashSamples.push({ timeMs: i * 150, marker: "01 / 03" });
    }
    for (const marker of questionMarkers) {
      if (body.includes(marker)) {
        flashSamples.push({ timeMs: i * 150, marker });
      }
    }
    await page.waitForTimeout(150);
  }
  expect(
    flashSamples,
    flashSamples.length
      ? `Question flash detected: ${JSON.stringify(flashSamples)}`
      : "no flash",
  ).toEqual([]);
}

async function expectNoMemberHandoffPanel(page: Page) {
  await expect(page.locator('[data-purpose="re-phase1-member-handoff"]')).toHaveCount(0);
  await expect(page.locator('[data-purpose="admin-phase1-member-handoff"]')).toHaveCount(0);
  await expect(
    page.getByText("제출하신 자료를 확인하고 1차 결과를 준비하고 있습니다"),
  ).toHaveCount(0);
  await expect(page.getByText("잠시만 기다려 주세요.")).toHaveCount(0);
}

async function expectNoMemberHandoffPanelDuringTransition(page: Page, ms = 60_000) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    await expectNoMemberHandoffPanel(page);
    if (await page.locator('input[name="name"]').isVisible()) {
      return;
    }
    await page.waitForTimeout(200);
  }
}

async function runCase01Phase1Questions(page: Page) {
  await page.goto("/verify/admin", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await clickThroughSteps(page, [
    "교통위반이나 문제를 알리는 통지",
    "내가 알고 있는 상황과 기관에서 말하는 내용이 서로 다른",
    "기관에서 말하는 문제가 실제로 내 상황에 해당하는지",
    "아직 아무에게도 설명하거나",
    "대응해야 하는 날짜를 확인했습니다",
  ]);
  await skipEvidenceIfVisible(page);
}

async function runCase01Phase1(page: Page) {
  await runCase01Phase1Questions(page);
  if (await isSignupVisible(page)) {
    await submitSignup(page, `p0-case01-${Date.now()}@test.vfbcai.local`);
  }
  await expectOneResultSections(page);
  await expectNoEntryQ1(page);
}

async function runCase02Phase1(page: Page) {
  await page.goto("/verify/admin", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await clickThroughSteps(page, [
    "벌금이나 비용을 납부하라는 내용",
    "교통위반에 대한 벌금",
    "기관에서 말하는 납부 의무가",
    "아직 이 납부 요구에 대해 납부하지 않았습니다",
    "납부해야 하는 날짜를 확인했습니다",
  ]);
  await skipEvidenceIfVisible(page);
  if (await isSignupVisible(page)) {
    await submitSignup(page, `p0-case02-${Date.now()}@test.vfbcai.local`);
  }
  await expectOneResultSections(page);
  const body = await page.locator("body").innerText();
  expect(body).toMatch(/납부|CASE_02|납부 요구/i);
}

async function runCase06Phase1(page: Page) {
  await page.goto("/verify/admin", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await clickThroughSteps(page, [
    "무슨 내용인지 잘 모르겠습니다",
    "정부기관이나 공공기관에서 보낸",
    "위 항목 중 어디에 해당하는지 판단하기 어렵습니다",
    "문제나 위반과 관련해 대응하거나",
    "대응 기한이 있다는 것은 알지만",
    "왜 이 문서를 받았는지 이해하기 어렵습니다",
  ]);
  await skipEvidenceIfVisible(page);
  if (await isSignupVisible(page)) {
    await submitSignup(page, `p0-case06-${Date.now()}@test.vfbcai.local`);
  }
  await expectOneResultSections(page);
}

async function expectMobileLayoutOk(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 2,
  );
  expect(overflow).toBe(false);
  expect(page.viewportSize()?.width).toBe(375);
}

test.describe("Admin VERIFY P0 — CASE fresh paths", () => {
  test("CASE_01 fresh → ONE RESULT", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop primary");
    test.setTimeout(120_000);
    await runCase01Phase1(page);
    await expectNoEntryQ1(page);
  });

  test("CASE_01 mobile fresh → ONE RESULT", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "mobile 375");
    await runCase01Phase1(page);
    await expectMobileLayoutOk(page);
    await expectNoEntryQ1(page);
  });

  test("CASE_02 fresh → ONE RESULT", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop primary");
    await runCase02Phase1(page);
  });

  test("CASE_02 mobile fresh → ONE RESULT", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "mobile 375");
    await runCase02Phase1(page);
    await expectMobileLayoutOk(page);
  });

  test("CASE_06 fresh → ONE RESULT", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop primary");
    await runCase06Phase1(page);
  });

  test("CASE_06 mobile fresh → ONE RESULT", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "mobile 375");
    await runCase06Phase1(page);
    await expectMobileLayoutOk(page);
  });
});

test.describe("Admin VERIFY P0 — Phase 2 Personalized", () => {
  test("CASE_01 Phase 2 → Personalized (desktop)", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop primary");
    await runCase01Phase1(page);
    await completePhase2ToPersonalized(page);
    const body = await page.locator("body").innerText();
    expect(body).toMatch(/2차|개인화|추가 확인/);
  });
});

test.describe("Admin VERIFY P0 — FREE restore", () => {
  test("CASE_01 signup → ?restore=1 ONE RESULT (Phase1 only)", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop primary");
    test.setTimeout(180_000);
    const email = `rentry-qa-vadm-restore-p1-${Date.now()}@test.vfbcai.local`;
    await completePhase1WithSignup(page, email);

    await page.goto("/verify/admin?restore=1", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await expectOneResultSections(page);
    await expect(page.getByRole("heading", { name: /2차 상세검토에 필요한 자료/ })).toHaveCount(0);
    await expectNoEntryQ1(page);
    await expect(page.getByRole("button", { name: "AI 1차 분석 결과 보기" })).toHaveCount(0);
  });

  test("CASE_01 restore mobile ONE RESULT (Phase1 only)", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "mobile 375");
    test.setTimeout(180_000);
    const email = `rentry-qa-vadm-restore-p1-mobile-${Date.now()}@test.vfbcai.local`;
    await completePhase1WithSignup(page, email);

    await page.goto("/verify/admin?restore=1", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await expectOneResultSections(page);
    await expect(page.getByRole("heading", { name: /2차 상세검토에 필요한 자료/ })).toHaveCount(0);
    await expectMobileLayoutOk(page);
    await expectNoEntryQ1(page);
  });

  test("CASE_01 Phase2 persist → ?restore=1 Phase2 evidence gate", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop primary");
    test.setTimeout(180_000);
    const email = `rentry-qa-vadm-restore-p2-${Date.now()}@test.vfbcai.local`;
    await completePhase2SignupForRestore(page, email);

    await page.goto("/verify/admin?restore=1", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await expectPhase2RestoreEvidenceGate(page);
  });

  test("CASE_01 Phase2 persist restore mobile Phase2 evidence gate", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "mobile 375");
    test.setTimeout(180_000);
    const email = `rentry-qa-vadm-restore-p2-mobile-${Date.now()}@test.vfbcai.local`;
    await completePhase2SignupForRestore(page, email);

    await page.goto("/verify/admin?restore=1", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await expectPhase2RestoreEvidenceGate(page);
    await expectMobileLayoutOk(page);
  });
});

test.describe("Admin VERIFY — Member handoff transition", () => {
  test("member Phase1 complete → handoff → ONE RESULT, zero question flash", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop only");
    test.setTimeout(360_000);

    const memberEmail = `rentry-qa-vadm-member-${Date.now()}@test.vfbcai.local`;

    await runCase01Phase1Questions(page);
    if (await isSignupVisible(page)) {
      await submitSignup(page, memberEmail);
    }
    await expectOneResultSections(page);

    await page.goto("/verify/admin", { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    await expect(page.locator('input[name="name"]')).toHaveCount(0, { timeout: 15_000 });

    await runCase01Phase1Questions(page);
    await expectNoMemberHandoffPanel(page);
    await expectNoQuestionFlashDuringTransition(page, 8000);
    await expect(page.getByRole("heading", { name: ONE_RESULT_HEADING })).toBeVisible({
      timeout: 90_000,
    });
    await expect(page.getByText("1. 검토 내용 체크")).toHaveCount(0);
  });

  test("member lead insert failure exits handoff to signup retry UX", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop only");
    test.setTimeout(360_000);

    const memberEmail = `rentry-qa-vadm-fail-${Date.now()}@test.vfbcai.local`;

    await runCase01Phase1Questions(page);
    if (await isSignupVisible(page)) {
      await submitSignup(page, memberEmail);
    }
    await expectOneResultSections(page);

    let blockLeadInsert = true;
    await page.route("**/rest/v1/leads**", async (route) => {
      if (blockLeadInsert && route.request().method() === "POST") {
        await route.fulfill({
          status: 403,
          contentType: "application/json",
          body: JSON.stringify({
            code: "42501",
            message: "new row violates row-level security policy",
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto("/verify/admin", { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    await runCase01Phase1Questions(page);

    await expectNoMemberHandoffPanelDuringTransition(page, 15_000);
    await expect(page.locator('input[name="name"]')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("접수 중 문제가 발생했습니다")).toBeVisible();
    await expectNoMemberHandoffPanel(page);
    await expect(page.getByText("1. 검토 내용 체크")).toHaveCount(0);
  });

  test("member lead insert hang times out → signup retry, no handoff panel", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop only");
    test.setTimeout(360_000);

    const memberEmail = `rentry-qa-vadm-hang-${Date.now()}@test.vfbcai.local`;

    await runCase01Phase1Questions(page);
    if (await isSignupVisible(page)) {
      await submitSignup(page, memberEmail);
    }
    await expectOneResultSections(page);

    await page.route("**/rest/v1/leads**", async (route) => {
      if (route.request().method() === "POST") {
        await new Promise((r) => setTimeout(r, 70_000));
        await route.continue();
      } else {
        await route.continue();
      }
    });

    await page.goto("/verify/admin", { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    await runCase01Phase1Questions(page);

    await expect(page.locator('[data-purpose="admin-phase1-member-handoff"]')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('input[name="name"]')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText("접수 중 문제가 발생했습니다")).toBeVisible();
    await expectNoMemberHandoffPanel(page);
    await expect(page.getByText("1. 검토 내용 체크")).toHaveCount(0);
  });
});

test.describe("Admin VERIFY — Full funnel closure", () => {
  test("CASE_01 personalized → AI Report → /documents", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop only");
    test.setTimeout(360_000);
    await completeFullFunnelToPersonalized(page);
    await page.getByRole("button", { name: "AI 검토 상세 리포트" }).click();
    await expectDocumentsHandoff(page, "ai_report");
  });

  test("CASE_01 personalized → Expert → /documents", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop only");
    test.setTimeout(360_000);
    await completeFullFunnelToPersonalized(page);
    await page.getByRole("button", { name: "전문가 진행하기" }).click();
    await expectDocumentsHandoff(page, "expert");
  });
});

test.describe("Regression smoke", () => {
  test("verify/admin first question loads", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop smoke");
    await page.goto("/verify/admin", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", {
        name: /교통국에서 받은 운전면허|어떤 내용에 가까운가요/,
      }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test("check/trc landing loads", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop smoke");
    await page.goto("/check/trc", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "거주증" })).toBeVisible({
      timeout: 20_000,
    });
  });
});
