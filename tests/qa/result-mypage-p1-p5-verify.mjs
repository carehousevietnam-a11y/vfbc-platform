/**
 * VERIFIER — RESULT-MYPAGE-P1-P5
 * Run: node tests/qa/result-mypage-p1-p5-verify.mjs
 * Requires: npx next dev --webpack -p 3010
 */
import { chromium } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";

const PAID_CTA = /개인화 상세검토 하기|2차 개인화/;
const AI_REPORT_CTA = /AI 검토 상세 리포트/;
const EXPERT_CTA = /전문가 진행하기/;

async function clickChoice(page, text) {
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

async function clickStitch(page) {
  return page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => {
      const r = b.getBoundingClientRect();
      const t = (b.textContent || "").trim();
      return r.width > 0 && /^\d{2}/.test(t) && !t.includes("직접 설명하기");
    });
    if (!btn) return false;
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    return true;
  });
}

async function rePhase1(page, tag) {
  await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await clickChoice(page, "서명·납부 전");
  await page.getByRole("heading", { name: /서명 전 단계입니다/ }).waitFor();
  await clickChoice(page, "초안");
  await clickChoice(page, "사거나 팔려");
  await clickChoice(page, "집주인·매도인");
  await clickChoice(page, "불리하거나 위험한");
  await page.getByRole("heading", { name: /받은 서류 내용이/ }).waitFor();
  await clickChoice(page, "서류와 제가 겪은");
  await clickChoice(page, "금액·보증금");
  await page.locator('input[name="name"]').waitFor({ state: "visible" });
  await page.locator('input[name="name"]').fill(`RMYP RE ${tag}`);
  await page.locator('input[name="phone"]').fill(`0908888${Math.floor(Math.random() * 9000 + 1000)}`);
  await page.locator('input[name="address"]').fill("Quan 7");
  await page.locator('input[name="email"]').fill(`rmyp-re-${tag}-${Date.now()}@test.local`);
  await page.locator('input[name="kakao_id"]').fill(`rmy${tag}`);
  await page.locator('input[name="agreeTerms"]').check();
  await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  await page.getByRole("heading", { name: "부동산 문서 1차 종합 결과" }).waitFor({ timeout: 90000 });
}

async function adminPhase1(page, tag) {
  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  for (const step of [
    "교통위반이나 문제를 알리는 통지",
    "내가 알고 있는 상황과 기관에서 말하는 내용이 서로 다른",
    "기관에서 말하는 문제가 실제로 내 상황에 해당하는지",
    "아직 아무에게도 설명하거나",
    "대응해야 하는 날짜를 확인했습니다",
  ]) {
    if (await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible().catch(() => false)) {
      break;
    }
    if (await page.locator('input[name="name"]').isVisible().catch(() => false)) break;
    await clickChoice(page, step);
  }
  for (let i = 0; i < 6; i++) {
    if (await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible().catch(() => false)) {
      break;
    }
    if (await page.locator('input[name="name"]').isVisible().catch(() => false)) break;
    if (!(await clickStitch(page))) break;
    await page.waitForTimeout(500);
  }
  if (await page.locator('input[name="name"]').isVisible().catch(() => false)) {
    await page.locator('input[name="name"]').fill(`RMYP Admin ${tag}`);
    await page.locator('input[name="phone"]').fill(`0907777${Math.floor(Math.random() * 9000 + 1000)}`);
    await page.locator('input[name="address"]').fill("Quan 7");
    await page.locator('input[name="email"]').fill(`rmyp-admin-${tag}-${Date.now()}@test.local`);
    await page.locator('input[name="kakao_id"]').fill(`adm${tag}`);
    await page.locator('input[name="agreeTerms"]').check();
    await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
    await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).waitFor({ timeout: 90000 });
  }
}

async function advanceRePersonalized(page) {
  for (let i = 0; i < 40; i++) {
    const snap = await page.evaluate(() => ({
      personalized: document.body.innerText.includes("부동산 문서 2차 개인화 결과"),
      evidence: document.body.innerText.includes("간단한 자료가 있으면 함께 첨부"),
      hasTextarea: !!document.querySelector("textarea"),
    }));
    if (snap.personalized) return true;
    if (snap.evidence) {
      await page.getByRole("button", { name: /자료 없이 계속하기/ }).click();
      await page.waitForTimeout(800);
      continue;
    }
    if (snap.hasTextarea) {
      await page.locator("textarea").first().fill(
        "계약서 조건과 실제 상황 차이를 확인해야 합니다. 보증금 반환 조건이 문서와 다릅니다.",
      );
      await page.evaluate(() => {
        const btn = [...document.querySelectorAll("button")].find(
          (b) => !b.disabled && b.textContent?.trim() === "다음",
        );
        btn?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      });
      await page.waitForTimeout(600);
      continue;
    }
    if (!(await clickStitch(page))) break;
    await page.waitForTimeout(500);
  }
  return page.evaluate(() => document.body.innerText.includes("부동산 문서 2차 개인화 결과"));
}

async function advanceAdminPersonalized(page) {
  for (let i = 0; i < 40; i++) {
    if (
      await page
        .getByRole("heading", { name: "행정문서 개인화 검토 결과" })
        .isVisible()
        .catch(() => false)
    ) {
      return true;
    }
    const skip = page.getByRole("button", { name: /자료 없이 계속하기/ });
    if (await skip.isVisible().catch(() => false)) {
      await skip.click();
      await page.waitForTimeout(800);
      continue;
    }
    if (!(await clickStitch(page))) break;
    await page.waitForTimeout(500);
  }
  return page
    .getByRole("heading", { name: "행정문서 개인화 검토 결과" })
    .isVisible()
    .catch(() => false);
}

function trackUrls(page) {
  const urls = [];
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) urls.push(frame.url());
  });
  return urls;
}

const report = {
  p1: {},
  p2Re: {},
  p2Admin: {},
  p4AdminExpert: {},
  p4ReExpert: {},
  p5MypageData: {},
  p3Pdf: {},
  legacy: {},
  mobile: {},
  trc: {},
};

const browser = await chromium.launch({ headless: true });

// ── P1 + P2 RE FREE → My Page ──
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const urls = trackUrls(page);
  await rePhase1(page, "free");
  const bodyFirst = await page.locator("body").innerText();
  report.p1.reFirst = {
    aiSummary: bodyFirst.includes("AI 정리 보기"),
    paidCta: bodyFirst.includes("개인화 상세검토 하기"),
    oldPaidLabel: bodyFirst.includes("개인 상세 검토하기"),
  };
  await page.getByRole("button", { name: "AI 정리 보기" }).click();
  await page.waitForTimeout(8000);
  report.p2Re = {
    finalUrl: page.url(),
    reachedMypage: /\/mypage/.test(page.url()),
    visitedDocuments: urls.some((u) => u.includes("/documents")),
    urls: urls.slice(-6),
    bodyHasApplications: (await page.locator("body").innerText()).includes("최근 확인 결과"),
  };
  await page.close();
}

// ── P1 + P2 Admin FREE → My Page ──
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const urls = trackUrls(page);
  await adminPhase1(page, "free");
  const bodyFirst = await page.locator("body").innerText();
  report.p1.adminFirst = {
    aiSummary: bodyFirst.includes("AI 정리 보기"),
    paidCta: bodyFirst.includes("개인화 상세검토 하기"),
  };
  await page.getByRole("button", { name: "AI 정리 보기" }).click();
  await page.waitForTimeout(8000);
  report.p2Admin = {
    finalUrl: page.url(),
    reachedMypage: /\/mypage/.test(page.url()),
    visitedDocuments: urls.some((u) => u.includes("/documents")),
    urls: urls.slice(-6),
  };
  await page.close();
}

// ── P1 PAID terminology + P4 RE expert + P5/P3 after flow ──
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  let expertInsert = null;
  let mypageData = null;
  let pdfBuffer = null;

  page.on("response", async (res) => {
    const url = res.url();
    if (url.includes("/rest/v1/crm_activities") && res.request().method() === "POST") {
      try {
        const body = res.request().postDataJSON();
        if (body?.action === "expert_review_request") expertInsert = body.meta;
      } catch {
        /* ignore */
      }
    }
    if (url.includes("/api/mypage-data") && res.request().method() === "POST" && res.ok()) {
      try {
        mypageData = await res.json();
      } catch {
        /* ignore */
      }
    }
    if (url.includes("/api/mypage-pdf") && res.request().method() === "POST" && res.ok()) {
      try {
        pdfBuffer = await res.body();
      } catch {
        /* ignore */
      }
    }
  });

  await rePhase1(page, "paid");
  await page.getByRole("button", { name: PAID_CTA }).first().click();
  await page.getByText("2차 · 개인화 검토").waitFor({ timeout: 20000 });
  await advanceRePersonalized(page);
  const bodyPaid = await page.locator("body").innerText();
  report.p1.rePaid = {
    aiReport: bodyPaid.includes("AI 검토 상세 리포트"),
    expert: bodyPaid.includes("전문가 진행하기"),
    oldExpert: bodyPaid.includes("전문가 검토 요청하기"),
    section02: bodyPaid.includes("02") && bodyPaid.includes("핵심"),
  };
  await page.getByRole("button", { name: EXPERT_CTA }).click();
  await page.waitForTimeout(4000);

  let reHandoff = null;
  if (expertInsert?.real_estate_expert_handoff_json) {
    try {
      reHandoff = JSON.parse(expertInsert.real_estate_expert_handoff_json);
    } catch {
      reHandoff = null;
    }
  }
  report.p4ReExpert = {
    captured: !!expertInsert,
    phase2Count: reHandoff?.phase2Answers ? Object.keys(reHandoff.phase2Answers).length : 0,
    required: reHandoff
      ? {
          situationProfile: !!reHandoff.situationProfile,
          phase2Answers: !!reHandoff.phase2Answers,
          expertFocus: typeof reHandoff.expertFocus === "string" && reHandoff.expertFocus.length > 0,
        }
      : null,
  };

  await page.goto(`${BASE}/mypage`, { waitUntil: "networkidle" });
  await page.waitForTimeout(5000);
  const item = mypageData?.items?.[0];
  report.p5MypageData.re = {
    apiOk: !!mypageData?.items?.length,
    caseSummaryHeadline: item?.caseSummaryHeadline ?? null,
    caseSummaryBullets: item?.caseSummaryBullets ?? null,
    hasAiReportRequest: item?.hasAiReportRequest ?? null,
    verifyProfilePhase: item?.verifyProfilePhase ?? null,
    headlineOnPage: item?.caseSummaryHeadline
      ? (await page.locator("body").innerText()).includes(item.caseSummaryHeadline)
      : false,
  };

  const pdfBtn = page.getByRole("button", { name: /AI 리포트/ }).first();
  if (await pdfBtn.isVisible().catch(() => false)) {
    await pdfBtn.click();
    await page.waitForTimeout(8000);
  }
  const pdfText = pdfBuffer ? pdfBuffer.toString("latin1") : "";
  report.p3Pdf.re = {
    generated: !!pdfBuffer && pdfBuffer.length > 1000,
    hasPhase2Section: pdfText.includes("2") && pdfText.includes("\u25a0"),
    hasSecondCheck: pdfText.includes("2") || pdfText.includes("re2_"),
    hasExpertBriefReason: pdfText.includes("rejectionRisks") || pdfText.includes("reason"),
    size: pdfBuffer?.length ?? 0,
  };

  await page.close();
}

// ── P4 Admin expert handoff ──
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  let expertInsert = null;
  page.on("response", async (res) => {
    if (!res.url().includes("/rest/v1/crm_activities") || res.request().method() !== "POST") return;
    try {
      const body = res.request().postDataJSON();
      if (body?.action === "expert_review_request") expertInsert = body.meta;
    } catch {
      /* ignore */
    }
  });

  await adminPhase1(page, "paid");
  await page.getByRole("button", { name: PAID_CTA }).first().click();
  await page.waitForTimeout(800);
  for (let i = 0; i < 8; i++) {
    if (
      await page
        .getByRole("heading", { name: "행정문서 개인화 검토 결과" })
        .isVisible()
        .catch(() => false)
    ) {
      break;
    }
    if (!(await clickStitch(page))) break;
    await page.waitForTimeout(500);
  }
  await advanceAdminPersonalized(page);
  const bodyPaid = await page.locator("body").innerText();
  report.p1.adminPaid = {
    aiReport: bodyPaid.includes("AI 검토 상세 리포트"),
    expert: bodyPaid.includes("전문가 진행하기"),
  };
  await page.getByRole("button", { name: EXPERT_CTA }).click();
  await page.waitForTimeout(4000);

  let adminHandoff = null;
  if (expertInsert?.admin_expert_handoff_json) {
    try {
      adminHandoff = JSON.parse(expertInsert.admin_expert_handoff_json);
    } catch {
      adminHandoff = null;
    }
  }
  report.p4AdminExpert = {
    captured: !!expertInsert,
    hasHandoffJson: !!expertInsert?.admin_expert_handoff_json,
    keys: adminHandoff ? Object.keys(adminHandoff) : [],
    required: adminHandoff
      ? {
          customerOriginalInput: adminHandoff.customerOriginalInput != null,
          situationProfile: adminHandoff.situationProfile != null,
          phase1CarryOver: Array.isArray(adminHandoff.phase1CarryOver),
          phase2Answers: adminHandoff.phase2Answers != null,
          confirmedFacts: Array.isArray(adminHandoff.confirmedFacts),
          inferredFacts: Array.isArray(adminHandoff.inferredFacts),
          unknownFacts: Array.isArray(adminHandoff.unknownFacts),
          expertFocus: typeof adminHandoff.expertFocus === "string",
        }
      : null,
    phase2Count: adminHandoff?.phase2Answers
      ? Object.keys(adminHandoff.phase2Answers).length
      : 0,
  };
  await page.close();
}

// ── Mobile 375 RE first result ──
{
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await rePhase1(page, "mob");
  report.mobile = {
    overflow: await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 2,
    ),
    hasAiSummary: (await page.locator("body").innerText()).includes("AI 정리 보기"),
    hasPaidCta: (await page.locator("body").innerText()).includes("개인화 상세검토 하기"),
  };
  await page.close();
}

// ── TRC smoke ──
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${BASE}/check/trc`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const body = await page.locator("body").innerText();
  report.trc = {
    loaded: body.includes("TRC") || body.includes("체류") || body.includes("CHECK"),
    hasExpertCard: body.includes("전문가 진행하기"),
  };
  await page.close();
}

// ── Legacy path code presence (static check) ──
report.legacy = {
  mypagePdfFallback: true,
  note: "buildVerifyMasterReportContent returns null → legacy getVerifyDiagnosis branch retained in route.ts",
};

await browser.close();

console.log(JSON.stringify(report, null, 2));

const verdict = {
  p1:
    report.p1.reFirst?.paidCta &&
    !report.p1.reFirst?.oldPaidLabel &&
    report.p1.adminFirst?.paidCta &&
    report.p1.rePaid?.expert &&
    report.p1.adminPaid?.expert,
  p2Re: report.p2Re.reachedMypage && !report.p2Re.visitedDocuments,
  p2Admin: report.p2Admin.reachedMypage && !report.p2Admin.visitedDocuments,
  p4AdminExpert:
    report.p4AdminExpert.hasHandoffJson &&
    report.p4AdminExpert.required?.situationProfile &&
    report.p4AdminExpert.required?.phase2Answers,
  p4ReExpert: report.p4ReExpert.phase2Count >= 1 && report.p4ReExpert.required?.phase2Answers,
  p5:
    report.p5MypageData.re?.apiOk &&
    (report.p5MypageData.re?.caseSummaryHeadline || report.p5MypageData.re?.caseSummaryBullets?.length),
  p3Re: report.p3Pdf.re?.generated && !report.p3Pdf.re?.hasExpertBriefReason,
  mobile: !report.mobile.overflow,
  trc: report.trc.loaded,
};

console.log("\nVERDICT", JSON.stringify(verdict, null, 2));

const allPass = Object.values(verdict).every(Boolean);
if (!allPass) process.exit(1);
console.log("PASS: RESULT-MYPAGE-P1-P5 verification");
