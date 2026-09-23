/**
 * Browser Restore E2E — VERIFY 부동산 FREE
 *
 * Each test runs setup + restore in the same browser session:
 * 1) Complete funnel + signup (lead with profile JSON)
 * 2) Reload ?restore=1
 * 3) Assert ONE RESULT with restored profile
 *
 * Run:
 *   npx playwright test tests/qa/real-estate-restore-e2e.spec.ts --project=desktop
 *   npx playwright test tests/qa/real-estate-restore-e2e.spec.ts --project=mobile
 */
import { test, expect, type Page } from "@playwright/test";

const QA_EMAIL = "rentry-qa-vre-20260903@test.vfbcai.local";
const QA_NAME = "Rentry QA VRE";
const QA_PHONE = "0904444004";
const QA_ADDRESS = "Quan 7, TP.HCM";
const QA_KAKAO = "rentryvre001";

async function clickChoice(page: Page, pattern: RegExp) {
  const btn = page.getByRole("button", { name: pattern }).first();
  await btn.waitFor({ state: "visible", timeout: 20_000 });
  await btn.scrollIntoViewIfNeeded();
  await btn.click({ delay: 50 });
  await page.waitForTimeout(500);
}

/** Fallback when React hydration delays standard clicks */
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
    { timeout: 20_000 },
  );
  await page.waitForTimeout(500);
}

async function completePrePathToEvidence(page: Page) {
  await page.goto("/verify/real-estate", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await clickChoiceByText(page, "서명·납부 전");
  await expect(
    page.getByRole("heading", { name: /서명 전 단계입니다/ }),
  ).toBeVisible({ timeout: 20_000 });
  await clickChoiceByText(page, "매물만 보고");
  await clickChoiceByText(page, "전세·월세");
  await clickChoiceByText(page, "집주인·매도인");
  await clickChoiceByText(page, "제출·계약 요건");
  await page
    .getByRole("button", { name: /자료 없이/ })
    .waitFor({ state: "visible", timeout: 30_000 });
}

async function completeUnclearPathToEvidence(page: Page) {
  await page.goto("/verify/real-estate", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await clickChoiceByText(page, "제 상황부터 설명");
  const textarea = page.locator("textarea").first();
  await textarea.waitFor({ state: "visible", timeout: 15_000 });
  await textarea.fill(
    "전세 만료 후 보증금 반환을 요청했는데 임대인이 거절했습니다. 계약서는 있는데 연락이 두절되었습니다.",
  );
  const nextBtn = page
    .getByRole("button", { name: /다음|확인|저장/ })
    .first();
  if (await nextBtn.isVisible().catch(() => false)) {
    await nextBtn.click();
  }
  await clickChoiceByText(page, "보증금·계약금을 받지");
  await clickChoiceByText(page, "집주인·매도인");
  await clickChoiceByText(page, "상대방·기관과 협의·조율");
  await clickChoiceByText(page, "서류에 적힌 내용과");
  await page
    .getByRole("button", { name: /자료 없이/ })
    .waitFor({ state: "visible", timeout: 30_000 });
}

async function submitSignupForm(page: Page) {
  await page.locator('input[name="name"]').waitFor({ state: "visible", timeout: 30_000 });
  await page.locator('input[name="name"]').fill(QA_NAME);
  await page.locator('input[name="phone"]').fill(QA_PHONE);
  await page.locator('input[name="address"]').fill(QA_ADDRESS);
  await page.locator('input[name="email"]').fill(QA_EMAIL);
  await page.locator('input[name="kakao_id"]').fill(QA_KAKAO);
  await page.locator('input[name="agreeTerms"]').check();

  const submit = page.getByRole("button", { name: "AI 1차 분석 결과 보기" });
  await expect(submit).toBeEnabled({ timeout: 10_000 });
  await submit.click();

  await expect(page.getByText("로그인 세션 생성에 실패했습니다")).toHaveCount(0);
  await page.waitForTimeout(1500);
}

async function expectOneResultWithSections(page: Page) {
  await expect(
    page.getByRole("heading", { name: "부동산 문서 1차 종합 결과" }),
  ).toBeVisible({ timeout: 90_000 });

  await expect(page.getByRole("heading", { name: /01.*현재 상황/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /02.*핵심 확인 결과/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /03.*주요 위험 요인/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /04.*확인이 필요한 사항/ })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /05.*지금 확인해 보세요/ }),
  ).toBeVisible();
}

async function submitSignupAndReachOneResult(page: Page) {
  await page.getByRole("button", { name: /자료 없이/ }).click();
  await submitSignupForm(page);
  await expectOneResultWithSections(page);
}

async function enterPhase2FromOneResult(page: Page) {
  await page.getByRole("button", { name: /2차 개인화 검토하기/ }).click();
  await page.waitForFunction(
    () => {
      const t = document.body.innerText;
      return (
        t.includes("1차에서 확인한 내용") ||
        t.includes("추가 상황 확인") ||
        t.includes("부동산 문서 2차 개인화 결과")
      );
    },
    undefined,
    { timeout: 20_000 },
  );
}

async function waitPhase2MetaPersist(page: Page) {
  await page.waitForTimeout(2500);
}

test.describe("VERIFY real-estate restore E2E", () => {
  test("desktop — PRE setup then ?restore=1 ONE RESULT", async ({ page }) => {
    test.skip(
      test.info().project.name !== "desktop",
      "desktop viewport only — run with --project=desktop",
    );
    test.setTimeout(240_000);

    await completePrePathToEvidence(page);
    await page.getByRole("button", { name: /자료 없이/ }).click();
    await submitSignupForm(page);
    await expectOneResultWithSections(page);

    let body = await page.locator("body").innerText();
    expect(body).toContain("임대");
    expect(body).toContain("매물만 보고");

    await page.goto("/verify/real-estate?restore=1", {
      waitUntil: "domcontentloaded",
    });

    await expectOneResultWithSections(page);
    body = await page.locator("body").innerText();
    expect(body).toContain("임대");
    expect(body).toMatch(/매물|사전 검토|계약·서명 전/);
    expect(body).not.toContain("지금 부동산 관련해서 어떤 일이 진행 중인가요?");
  });

  test("mobile 375 — UNCLEAR setup then ?restore=1 ONE RESULT", async ({
    page,
  }) => {
    test.skip(
      test.info().project.name !== "mobile",
      "mobile viewport only — run with --project=mobile",
    );
    test.setTimeout(240_000);

    await completeUnclearPathToEvidence(page);
    await page.getByRole("button", { name: /자료 없이/ }).click();
    await submitSignupForm(page);
    await expectOneResultWithSections(page);

    let body = await page.locator("body").innerText();
    expect(body).toMatch(/보증금|임대|반환/);

    let overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 2,
    );
    expect(overflow).toBe(false);

    await page.goto("/verify/real-estate?restore=1", {
      waitUntil: "domcontentloaded",
    });

    await expectOneResultWithSections(page);
    body = await page.locator("body").innerText();
    expect(body).toMatch(/보증금|임대|반환|상황 설명/);
    expect(body).not.toContain("지금 겪고 있는 상황을 시간 순서대로");

    overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 2,
    );
    expect(overflow).toBe(false);
  });

  test.skip(
    true,
    "BLOCKED: crm_activities.meta client UPDATE denied by RLS (rls_denied) — Ace approval required before Phase 2 restore QA",
  );
  test("desktop — PRE Phase 2 mid-progress then ?restore=1 resumes Phase 2", async ({
    page,
  }) => {
    test.skip(
      test.info().project.name !== "desktop",
      "desktop viewport only — run with --project=desktop",
    );
    test.setTimeout(300_000);

    await page.goto("/verify/real-estate", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await clickChoiceByText(page, "서명·납부 전");
    await expect(
      page.getByRole("heading", { name: /서명 전 단계입니다/ }),
    ).toBeVisible({ timeout: 20_000 });
    await clickChoiceByText(page, "초안");
    await clickChoiceByText(page, "사거나 팔려");
    await clickChoiceByText(page, "집주인·매도인");
    await clickChoiceByText(page, "불리하거나 위험한");
    await expect(
      page.getByRole("heading", { name: /받은 서류 내용이/ }),
    ).toBeVisible({ timeout: 20_000 });
    await clickChoiceByText(page, "서류와 제가 겪은");
    await clickChoiceByText(page, "금액·보증금");
    await submitSignupAndReachOneResult(page);
    await enterPhase2FromOneResult(page);
    await clickChoiceByText(page, "근저당·가압류");
    await waitPhase2MetaPersist(page);

    await page.goto("/verify/real-estate?restore=1", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(2000);

    const body = await page.locator("body").innerText();
    expect(body).toMatch(/1차에서 확인한 내용|추가 상황 확인/);
    expect(body).not.toContain("지금 부동산 관련해서 어떤 일이 진행 중인가요?");
    expect(body).not.toContain("부동산 문서 2차 개인화 결과");
  });
});
