/**
 * FREE VERIFY 부동산 — 4경로 E2E (PRE / POST / DOCUMENT / UNCLEAR)
 *
 * Run all desktop:
 *   npx playwright test tests/qa/real-estate-free-e2e.spec.ts --project=desktop
 * Run all mobile:
 *   npx playwright test tests/qa/real-estate-free-e2e.spec.ts --project=mobile
 */
import path from "node:path";
import { test, expect, type Page } from "@playwright/test";

const EVIDENCE_FIXTURE = path.join(
  __dirname,
  "fixtures",
  "qa-sample-contract.pdf",
);

const QA_NAME = "Rentry QA VRE Free";
const QA_ADDRESS = "Quan 7, TP.HCM";
const QA_KAKAO = "rentryvre001";
const QA_EMAIL_RESTORE = "rentry-qa-vre-restore-20260919@test.vfbcai.local";

const ONE_RESULT_HEADING = "부동산 문서 1차 종합 결과";
const PERSONALIZED_HEADING = "부동산 문서 2차 개인화 결과";
const PHASE1_EVIDENCE_HEADING = /간단한 자료가 있으면 함께 첨부/;
const PHASE2_EVIDENCE_HEADING = /2차 상세검토에 필요한 자료/;
const ENTRY_Q1_SNIPPET = "지금 부동산 관련해서 어떤 일이 진행 중인가요";

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
    .getByRole("heading", { name: PHASE1_EVIDENCE_HEADING })
    .isVisible()
    .catch(() => false);
}

async function isPhase2EvidenceVisible(page: Page) {
  return page
    .getByRole("heading", { name: PHASE2_EVIDENCE_HEADING })
    .isVisible()
    .catch(() => false);
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

async function skipEvidenceIfVisible(page: Page) {
  const skipBtn = page.getByRole("button", { name: /자료 없이 계속하기/ });
  if (await skipBtn.isVisible().catch(() => false)) {
    await skipBtn.click();
    await page.waitForTimeout(800);
  }
}

async function expectNoPhase1EvidenceDuringPhase2(page: Page) {
  await expect(page.getByText("1차 · 간단 자료")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: PHASE1_EVIDENCE_HEADING })).toHaveCount(0);
}

async function completePhase2FromFirstResult(page: Page) {
  await page.getByRole("button", { name: /개인화?\s*상세\s*검토\s*하기/ }).click();
  await page.waitForTimeout(800);
  await expect(page.getByText(/2차 · 개인화 검토/)).toBeVisible({ timeout: 30_000 });
  await expectNoPhase1EvidenceDuringPhase2(page);

  let phase2QuestionCount = 0;
  for (let i = 0; i < 20; i++) {
    if (await isPersonalizedVisible(page)) break;
    if (await isPhase2EvidenceVisible(page)) break;
    if (await isOneResultVisible(page)) break;
    if (await clickFirstStitchChoice(page)) phase2QuestionCount += 1;
  }
  expect(phase2QuestionCount).toBeGreaterThan(0);

  await expect(page.getByRole("heading", { name: PHASE2_EVIDENCE_HEADING })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText("2차 · 상세 자료")).toBeVisible();
  await expectNoPhase1EvidenceDuringPhase2(page);
  await skipEvidenceIfVisible(page);
  await expect(page.getByRole("heading", { name: PERSONALIZED_HEADING })).toBeVisible({
    timeout: 90_000,
  });
  await page.waitForTimeout(1500);
}

async function completeFullFunnelToPersonalized(page: Page, email?: string) {
  await runPostToEvidence(page);
  await expect(page.getByRole("heading", { name: PHASE1_EVIDENCE_HEADING })).toBeVisible({
    timeout: 15_000,
  });
  await skipEvidenceIfVisible(page);
  if (await isSignupVisible(page)) {
    await submitSignup(page, email ?? `p0-re-full-${Date.now()}@test.vfbcai.local`, "0904444050");
  }
  await expectOneResultSections(page);
  await completePhase2FromFirstResult(page);
}

async function expectDocumentsHandoff(page: Page, mode: "ai_report" | "expert") {
  await page.waitForURL(new RegExp(`/documents.*mode=${mode}`), { timeout: 30_000 });
  await expect(page).toHaveURL(/leadId=/);
  const heading =
    mode === "ai_report"
      ? /부동산 문서 검토 · AI 리포트 진행/
      : /부동산 문서 검토 · 전문가 진행/;
  await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible({
    timeout: 15_000,
  });
}

async function expectNoOneResult(page: Page) {
  await expect(
    page.getByRole("heading", { name: "부동산 문서 1차 종합 결과" }),
  ).toHaveCount(0);
}

async function expectEvidenceStep(page: Page) {
  await expect(
    page.getByRole("button", { name: /자료 없이/ }),
  ).toBeVisible({ timeout: 30_000 });
  await expect(
    page.getByText(/대표 자료 1개.*첨부/),
  ).toBeVisible();
}

async function submitSignup(page: Page, email: string, phone: string) {
  await page.locator('input[name="name"]').waitFor({ state: "visible", timeout: 30_000 });
  await page.locator('input[name="name"]').fill(QA_NAME);
  await page.locator('input[name="phone"]').fill(phone);
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

async function expectFirstResultRemovedUi(page: Page) {
  await expect(page.getByRole("button", { name: "미리보기" })).toHaveCount(0);
  await expect(
    page.getByText("검토 범위·서류 유형에 따라 비용이 발생할 수 있습니다"),
  ).toHaveCount(0);
  await expect(page.getByText("검토 항목 안내")).toHaveCount(0);
}

async function expectOneResultSections(page: Page) {
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

async function expectFirstResultCtas(page: Page) {
  await expect(page.getByRole("button", { name: "AI 정리 보기" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "개인화 상세검토 하기" }),
  ).toBeVisible();
}

async function expectMobileLayoutOk(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 2,
  );
  expect(overflow).toBe(false);
  expect(page.viewportSize()?.width).toBe(375);
}

async function runPreToEvidence(page: Page) {
  await page.goto("/verify/real-estate", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await clickChoiceByText(page, "서명·납부 전");
  await expect(
    page.getByRole("heading", { name: /서명 전 단계입니다/ }),
  ).toBeVisible({ timeout: 20_000 });
  await clickChoiceByText(page, "매물만 보고");
  await expect(
    page.getByRole("heading", { name: /거래·물건|어떤 거래/ }),
  ).toBeVisible({ timeout: 15_000 });
  await clickChoiceByText(page, "전세·월세");
  await expect(
    page.getByRole("heading", { name: /상대는 누구|함께 진행/ }),
  ).toBeVisible({ timeout: 15_000 });
  await clickChoiceByText(page, "집주인·매도인");
  await expect(
    page.getByRole("heading", { name: /무엇을 가장 먼저 확인/ }),
  ).toBeVisible({ timeout: 15_000 });
  await clickChoiceByText(page, "제출·계약 요건");
  await expectEvidenceStep(page);
}

async function runPostToEvidence(page: Page) {
  await page.goto("/verify/real-estate", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await clickChoiceByText(page, "이미 문제가 생겼고");
  await expect(
    page.getByRole("heading", { name: /어떤 문제에 가장 가깝나요/ }),
  ).toBeVisible({ timeout: 20_000 });
  await clickChoiceByText(page, "보증금·계약금을 받지");
  await expect(
    page.getByRole("heading", { name: /그 문제\(보증금/ }),
  ).toBeVisible({ timeout: 15_000 });
  await clickChoiceByText(page, "집주인·매도인");
  await expect(
    page.getByRole("heading", { name: /어떤 단계에서 대응/ }),
  ).toBeVisible({ timeout: 15_000 });
  await clickChoiceByText(page, "아직 공식 대응 전");
  await expect(
    page.getByRole("heading", { name: /서류·계약서 내용이/ }),
  ).toBeVisible({ timeout: 15_000 });
  await clickChoiceByText(page, "서류에 적힌 내용과 제가 알고");
  await expectEvidenceStep(page);
}

async function runDocumentToEvidence(page: Page) {
  await page.goto("/verify/real-estate", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await clickChoiceByText(page, "상대나 기관에서 받은");
  await expect(
    page.getByRole("heading", { name: /어떤 서류인가요/ }),
  ).toBeVisible({ timeout: 20_000 });
  await clickChoiceByText(page, "임대차·전세·월세");
  await expect(
    page.getByRole("heading", { name: /그 거래\(임대차|무엇을 가장 먼저/ }),
  ).toBeVisible({ timeout: 15_000 });
  await clickChoiceByText(page, "나에게 불리하거나 위험한");
  await expect(
    page.getByRole("heading", { name: /받은 서류\(임대차|알고 있는 상황/ }),
  ).toBeVisible({ timeout: 15_000 });
  await clickChoiceByText(page, "서류와 제가 겪은 실제");
  await expect(
    page.getByRole("heading", { name: /다른 부분은 무엇/ }),
  ).toBeVisible({ timeout: 15_000 });
  await clickChoiceByText(page, "서류의 금액·보증금");
  await expectEvidenceStep(page);
}

async function runUnclearToEvidence(page: Page) {
  await page.goto("/verify/real-estate", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await clickChoiceByText(page, "제 상황부터 설명");
  const textarea = page.locator("textarea").first();
  await textarea.waitFor({ state: "visible", timeout: 15_000 });
  const story =
    "전세 만료 후 보증금 반환을 요청했는데 임대인이 거절했습니다. 계약서는 있는데 연락이 두절되었습니다.";
  await textarea.fill(story);
  const nextBtn = page.getByRole("button", { name: /다음|확인|저장/ }).first();
  if (await nextBtn.isVisible().catch(() => false)) await nextBtn.click();
  await expect(
    page.getByRole("heading", { name: /어떤 문제에 가장 가깝나요/ }),
  ).toBeVisible({ timeout: 20_000 });
  await clickChoiceByText(page, "보증금·계약금을 받지");
  await clickChoiceByText(page, "집주인·매도인");
  await clickChoiceByText(page, "상대방·기관과 협의·조율");
  await clickChoiceByText(page, "서류에 적힌 내용과");
  await expectEvidenceStep(page);
}

type PathRunner = {
  label: string;
  email: string;
  phone: string;
  run: (page: Page) => Promise<void>;
  profilePatterns: RegExp[];
};

const PATHS: PathRunner[] = [
  {
    label: "PRE",
    email: "rentry-qa-vre-pre@test.vfbcai.local",
    phone: "0904444011",
    run: runPreToEvidence,
    profilePatterns: [/사전 검토|계약·서명 전/, /매물만 보고/, /임대/, /집주인/],
  },
  {
    label: "POST",
    email: "rentry-qa-vre-post@test.vfbcai.local",
    phone: "0904444012",
    run: runPostToEvidence,
    profilePatterns: [/사후 검토|문제 발생/, /보증금/, /임대/, /집주인/],
  },
  {
    label: "DOCUMENT",
    email: "rentry-qa-vre-doc@test.vfbcai.local",
    phone: "0904444013",
    run: runDocumentToEvidence,
    profilePatterns: [/서류 내용 확인/, /임대차|임대/, /불리하거나 위험/, /불일치|다릅니다|금액/],
  },
  {
    label: "UNCLEAR",
    email: "rentry-qa-vre-unclear@test.vfbcai.local",
    phone: "0904444014",
    run: runUnclearToEvidence,
    profilePatterns: [/보증금|임대|반환/, /상황 설명|전세 만료|집주인/],
  },
];

for (const path of PATHS) {
  test.describe(`FREE ${path.label}`, () => {
    test(`${path.label} — full funnel desktop`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "desktop", "desktop only");
      test.setTimeout(240_000);

      await path.run(page);
      await expectNoOneResult(page);
      await page.getByRole("button", { name: /자료 없이/ }).click();
      await expectNoQuestionFlashDuringTransition(page);
      await submitSignup(page, path.email, path.phone);
      await expectOneResultSections(page);
      await expectFirstResultRemovedUi(page);
      await expectFirstResultCtas(page);

      const body = await page.locator("body").innerText();
      for (const pattern of path.profilePatterns) {
        expect(body).toMatch(pattern);
      }
      expect(body).not.toContain("지금 부동산 관련해서 어떤 일이 진행 중인가요?");
      expect(body).not.toMatch(/견적|공식비용/);
    });

    test(`${path.label} — full funnel mobile 375`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "mobile", "mobile only");
      test.setTimeout(240_000);

      await path.run(page);
      await expectMobileLayoutOk(page);
      await expect(page.getByText("QUESTION GUIDE").first()).toBeVisible();
      await page.getByRole("button", { name: /자료 없이/ }).click();
      await submitSignup(page, path.email, path.phone);
      await expectOneResultSections(page);
      await expectMobileLayoutOk(page);

      const body = await page.locator("body").innerText();
      for (const pattern of path.profilePatterns) {
        expect(body).toMatch(pattern);
      }
    });
  });
}

test.describe("Evidence 1-file upload", () => {
  test("PRE — file attach → filename → signup → ONE RESULT with profile", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop only");
    test.setTimeout(240_000);

    const fileName = "qa-sample-contract.pdf";
    await runPreToEvidence(page);
    await page.locator('input[type="file"]').first().setInputFiles(EVIDENCE_FIXTURE);
    await expect(page.getByText(fileName)).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole("button", { name: /자료 포함하고 계속하기/ }),
    ).toBeVisible();
    await expectNoOneResult(page);
    await page.getByRole("button", { name: /자료 포함하고 계속하기/ }).click();
    await expectNoQuestionFlashDuringTransition(page);
    await submitSignup(
      page,
      "rentry-qa-vre-file@test.vfbcai.local",
      "0904444020",
    );
    await expectOneResultSections(page);
    await expectFirstResultRemovedUi(page);
    await expectFirstResultCtas(page);

    const body = await page.locator("body").innerText();
    expect(body).toMatch(/사전 검토|계약·서명 전/);
    expect(body).toMatch(/매물만 보고/);
    expect(body).toMatch(/임대/);
    expect(body).toMatch(/집주인/);
    expect(body).toMatch(new RegExp(`참고 자료[:：]?\\s*${fileName}|${fileName}`));
    expect(body).not.toContain("지금 부동산 관련해서 어떤 일이 진행 중인가요?");
  });
});

test.describe("Member handoff transition", () => {
  test("PRE — logged-in member file attach → handoff → ONE RESULT, zero question flash", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop only");
    test.setTimeout(360_000);

    const memberEmail = `rentry-qa-vre-member-${Date.now()}@test.vfbcai.local`;
    const fileName = "qa-sample-contract.pdf";

    // Establish logged-in session via guest signup once.
    await runPreToEvidence(page);
    await page.getByRole("button", { name: /자료 없이/ }).click();
    await submitSignup(page, memberEmail, "0904444099");
    await expectOneResultSections(page);

    // Fresh member case — no restore=1
    await page.goto("/verify/real-estate", { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    await expect(page.locator('input[name="name"]')).toHaveCount(0, { timeout: 15_000 });

    await runPreToEvidence(page);
    await page.locator('input[type="file"]').first().setInputFiles(EVIDENCE_FIXTURE);
    await expect(page.getByText(fileName)).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /자료 포함하고 계속하기/ }).click();

    await expectNoMemberHandoffPanel(page);
    await expectNoQuestionFlashDuringTransition(page, 8000);
    await expect(
      page.getByRole("heading", { name: "부동산 문서 1차 종합 결과" }),
    ).toBeVisible({ timeout: 90_000 });
    await expect(page.getByText("1. 검토 내용 체크")).toHaveCount(0);
    await expect(page.getByText("QUESTION GUIDE")).toHaveCount(0);
    await expect(page.getByText("OFFICIAL SOURCES")).toHaveCount(0);
  });

  test("PRE — member lead insert failure exits handoff to signup retry UX", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop only");
    test.setTimeout(360_000);

    const memberEmail = `rentry-qa-vre-fail-${Date.now()}@test.vfbcai.local`;

    await runPreToEvidence(page);
    await page.getByRole("button", { name: /자료 없이/ }).click();
    await submitSignup(page, memberEmail, "0904444098");
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

    await page.goto("/verify/real-estate", { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    await runPreToEvidence(page);
    await page.locator('input[type="file"]').first().setInputFiles(EVIDENCE_FIXTURE);
    await page.getByRole("button", { name: /자료 포함하고 계속하기/ }).click();

    await expectNoMemberHandoffPanelDuringTransition(page, 15_000);
    await expect(page.locator('input[name="name"]')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("접수 중 문제가 발생했습니다")).toBeVisible();
    await expectNoMemberHandoffPanel(page);
    await expect(page.getByText("1. 검토 내용 체크")).toHaveCount(0);
  });

  test("PRE — member lead insert hang times out → signup retry, no handoff panel", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop only");
    test.setTimeout(360_000);

    const memberEmail = `rentry-qa-vre-hang-${Date.now()}@test.vfbcai.local`;

    await runPreToEvidence(page);
    await page.getByRole("button", { name: /자료 없이/ }).click();
    await submitSignup(page, memberEmail, "0904444097");
    await expectOneResultSections(page);

    await page.route("**/rest/v1/leads**", async (route) => {
      if (route.request().method() === "POST") {
        await new Promise((r) => setTimeout(r, 70_000));
        await route.continue();
      } else {
        await route.continue();
      }
    });

    await page.goto("/verify/real-estate", { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    await runPreToEvidence(page);
    await page.locator('input[type="file"]').first().setInputFiles(EVIDENCE_FIXTURE);
    await page.getByRole("button", { name: /자료 포함하고 계속하기/ }).click();

    await expectNoMemberHandoffPanelDuringTransition(page, 60_000);
    await expect(page.locator('input[name="name"]')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText("접수 중 문제가 발생했습니다")).toBeVisible();
    await expectNoMemberHandoffPanel(page);
    await expect(page.getByText("1. 검토 내용 체크")).toHaveCount(0);
  });
});

test.describe("Real Estate VERIFY — Full funnel closure", () => {
  test("POST path → personalized → AI Report → /documents", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop only");
    test.setTimeout(360_000);
    await completeFullFunnelToPersonalized(page);
    await page.getByRole("button", { name: "AI 검토 상세 리포트" }).click();
    await expectDocumentsHandoff(page, "ai_report");
  });

  test("POST path → personalized → Expert → /documents", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop only");
    test.setTimeout(360_000);
    await completeFullFunnelToPersonalized(page);
    await page.getByRole("button", { name: "전문가 진행하기" }).click();
    await expectDocumentsHandoff(page, "expert");
  });

  test("Phase2 gate — no Phase2 evidence before questions complete", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop only");
    test.setTimeout(360_000);
    await runPostToEvidence(page);
    await skipEvidenceIfVisible(page);
    if (await isSignupVisible(page)) {
      await submitSignup(page, `p0-re-gate-${Date.now()}@test.vfbcai.local`, "0904444051");
    }
    await expectOneResultSections(page);
    await page.getByRole("button", { name: /개인화?\s*상세\s*검토\s*하기/ }).click();
    await page.waitForTimeout(800);
    await expectNoPhase1EvidenceDuringPhase2(page);
    await expect(page.getByRole("heading", { name: PHASE2_EVIDENCE_HEADING })).toHaveCount(0);
    await clickFirstStitchChoice(page);
    await expect(page.getByRole("heading", { name: PHASE2_EVIDENCE_HEADING })).toHaveCount(0);
  });
});

test.describe("Real Estate VERIFY — restore", () => {
  test("POST signup → ?restore=1 ONE RESULT", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop only");
    test.setTimeout(240_000);
    await runPostToEvidence(page);
    await skipEvidenceIfVisible(page);
    await submitSignup(page, QA_EMAIL_RESTORE, "0904444052");
    await expectOneResultSections(page);
    await completePhase2FromFirstResult(page);

    await page.goto("/verify/real-estate?restore=1", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await expect(
      page.getByRole("heading", { name: PERSONALIZED_HEADING }),
    ).toBeVisible({ timeout: 90_000 });
    await expect(page.getByRole("button", { name: "AI 1차 분석 결과 보기" })).toHaveCount(0);
    await expect(page.getByText(ENTRY_Q1_SNIPPET)).toHaveCount(0);
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
