/**
 * VERIFIER — RESULT-MYPAGE-P1-P5 (P3 HOLD only)
 * Run: node tests/qa/result-mypage-p3-pdf-hold-verify.mjs
 * Requires: npx next dev --webpack -p 3010
 */
import { chromium } from "@playwright/test";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";
const PAID_CTA = /개인화 상세검토 하기|2차 개인화/;

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

async function getAccessToken(page) {
  return page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (!key.includes("auth-token")) continue;
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        const token = parsed?.access_token ?? parsed?.currentSession?.access_token;
        if (typeof token === "string" && token.length > 20) return token;
      } catch {
        /* ignore */
      }
    }
    return null;
  });
}

async function fetchMypageData(page, accessToken) {
  return page.evaluate(async ({ token }) => {
    const res = await fetch("/api/mypage-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: token }),
    });
    if (!res.ok) return { ok: false, status: res.status, items: [] };
    const data = await res.json();
    return { ok: true, status: res.status, ...data };
  }, { token: accessToken });
}

async function fetchMypagePdf(page, accessToken, leadId) {
  let intercepted = null;
  const handler = async (res) => {
    if (
      res.url().includes("/api/mypage-pdf") &&
      res.request().method() === "POST" &&
      res.ok()
    ) {
      try {
        intercepted = await res.body();
      } catch {
        /* ignore */
      }
    }
  };
  page.on("response", handler);

  const btn = page.getByRole("button", { name: /^AI 리포트 보기$/ }).first();
  if (await btn.isVisible({ timeout: 8000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(6000);
  }

  page.off("response", handler);

  if (intercepted && intercepted.length > 500) {
    return { buffer: Buffer.from(intercepted), via: "button" };
  }

  const evalResult = await page.evaluate(async ({ token, leadId: id }) => {
    const res = await fetch("/api/mypage-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: token, leadId: id }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return { ok: false, status: res.status, error: err?.error ?? null };
    }
    const buf = await res.arrayBuffer();
    return {
      ok: true,
      status: res.status,
      bytes: Array.from(new Uint8Array(buf)),
      contentType: res.headers.get("content-type"),
    };
  }, { token: accessToken, leadId });

  if (!evalResult.ok) {
    return { buffer: null, via: "fetch-failed", error: evalResult };
  }
  return {
    buffer: Buffer.from(evalResult.bytes),
    via: "fetch",
    contentType: evalResult.contentType,
  };
}

async function extractPdfText(buffer) {
  if (!buffer || buffer.length < 500) return { text: "", pages: 0 };
  const parser = new PDFParse({ data: buffer });
  const parsed = await parser.getText();
  await parser.destroy();
  return { text: parsed.text ?? "", pages: parsed.total ?? 0 };
}

function analyzePdfText(text, kind) {
  const hasPhase1Section = text.includes("■ 1차 확인") || text.includes("1차 확인 사항");
  const hasPhase2Section = text.includes("■ 2차 확인");
  const hasPhase2Answers = /✓\s/.test(text) && hasPhase2Section;
  const internalLeaks = [
    "rejectionRisks",
    "expertBrief",
    "similarCases",
    "recommendedSteps",
    "riskLevel",
    "internal checklist",
    "expert_brief",
  ].filter((needle) => text.includes(needle));

  const snippets = [];
  for (const marker of ["■ 1차 확인", "■ 2차 확인", "결론 ·", "서류 ·", "문서 ·"]) {
    const idx = text.indexOf(marker);
    if (idx >= 0) snippets.push(text.slice(idx, idx + 120).replace(/\s+/g, " ").trim());
  }

  return {
    kind,
    size: text.length,
    hasPhase1Section,
    hasPhase2Section,
    hasPhase2Answers,
    internalLeaks,
    customerSafe: internalLeaks.length === 0,
    snippets: snippets.slice(0, 5),
  };
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
  await page.locator('input[name="name"]').fill(`P3PDF RE ${tag}`);
  await page.locator('input[name="phone"]').fill(`0908888${Math.floor(Math.random() * 9000 + 1000)}`);
  await page.locator('input[name="address"]').fill("Quan 7");
  await page.locator('input[name="email"]').fill(`p3pdf-re-${tag}-${Date.now()}@test.local`);
  await page.locator('input[name="kakao_id"]').fill(`p3re${tag}`);
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
    await page.locator('input[name="name"]').fill(`P3PDF Admin ${tag}`);
    await page.locator('input[name="phone"]').fill(`0907777${Math.floor(Math.random() * 9000 + 1000)}`);
    await page.locator('input[name="address"]').fill("Quan 7");
    await page.locator('input[name="email"]').fill(`p3pdf-admin-${tag}-${Date.now()}@test.local`);
    await page.locator('input[name="kakao_id"]').fill(`p3adm${tag}`);
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

async function gotoMypage(page) {
  await page.goto(`${BASE}/mypage`, { waitUntil: "networkidle" });
  await page.waitForTimeout(4000);
  await page.getByText("최근 확인 결과").first().waitFor({ timeout: 20000 }).catch(() => null);
}

function verdictPdf(analysis, pdfMeta) {
  if (!pdfMeta?.buffer || pdfMeta.buffer.length < 1000) return "HOLD";
  if (!analysis.hasPhase1Section || !analysis.hasPhase2Section) return "FAIL";
  if (!analysis.customerSafe) return "FAIL";
  if (!analysis.hasPhase2Answers) return "FAIL";
  return "PASS";
}

const report = {
  p3RePdf: {},
  p3AdminPdf: {},
  legacyFallback: { status: "NOT VERIFIED", note: "Master meta 없는 legacy lead 생성 경로 비활성(SHOW_LEGACY_VERIFY_FUNNEL=false)" },
  hasAiReportRequest: {},
};

const browser = await chromium.launch({ headless: true });

// ── P3 RE PDF ──
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await rePhase1(page, "p3");
  await page.getByRole("button", { name: PAID_CTA }).first().click();
  await page.getByText("2차 · 개인화 검토").waitFor({ timeout: 20000 });
  const phase2Ok = await advanceRePersonalized(page);
  await gotoMypage(page);

  const token = await getAccessToken(page);
  const mypageData = token ? await fetchMypageData(page, token) : { ok: false, items: [] };
  const leadId = mypageData.items?.[0]?.id ?? null;

  let pdfMeta = { buffer: null, via: null };
  if (token && leadId) {
    pdfMeta = await fetchMypagePdf(page, token, leadId);
  }

  const { text, pages } = await extractPdfText(pdfMeta.buffer);
  const analysis = analyzePdfText(text, "re");
  const verdict = verdictPdf(analysis, pdfMeta);

  report.p3RePdf = {
    verdict,
    phase2ResultReached: phase2Ok,
    sessionOk: !!token,
    mypageDataOk: mypageData.ok,
    leadId,
    pdfBytes: pdfMeta.buffer?.length ?? 0,
    pdfVia: pdfMeta.via,
    pdfPages: pages,
    ...analysis,
    sampleText: text.slice(0, 800),
  };
  await page.close();
}

// ── P3 Admin PDF ──
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await adminPhase1(page, "p3");
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
  const phase2Ok = await advanceAdminPersonalized(page);
  await gotoMypage(page);

  const token = await getAccessToken(page);
  const mypageData = token ? await fetchMypageData(page, token) : { ok: false, items: [] };
  const leadId = mypageData.items?.[0]?.id ?? null;

  let pdfMeta = { buffer: null, via: null };
  if (token && leadId) {
    pdfMeta = await fetchMypagePdf(page, token, leadId);
  }

  const { text, pages } = await extractPdfText(pdfMeta.buffer);
  const analysis = analyzePdfText(text, "admin");
  const verdict = verdictPdf(analysis, pdfMeta);

  report.p3AdminPdf = {
    verdict,
    phase2ResultReached: phase2Ok,
    sessionOk: !!token,
    mypageDataOk: mypageData.ok,
    leadId,
    pdfBytes: pdfMeta.buffer?.length ?? 0,
    pdfVia: pdfMeta.via,
    pdfPages: pages,
    ...analysis,
    sampleText: text.slice(0, 800),
  };
  await page.close();
}

// ── hasAiReportRequest=true (Admin small test) ──
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  let aiReportInsert = false;
  page.on("response", async (res) => {
    if (!res.url().includes("/rest/v1/crm_activities") || res.request().method() !== "POST") return;
    try {
      const body = res.request().postDataJSON();
      if (body?.action === "ai_report_request") aiReportInsert = true;
    } catch {
      /* ignore */
    }
  });

  await adminPhase1(page, "ai");
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

  const aiBtn = page.getByRole("button", { name: "AI 검토 상세 리포트" });
  await aiBtn.waitFor({ timeout: 15000 });
  await aiBtn.click();
  await page.waitForTimeout(8000);

  const onDocuments = /\/documents/.test(page.url()) && page.url().includes("mode=ai_report");
  await page.goto(`${BASE}/mypage`, { waitUntil: "networkidle" });
  await page.waitForTimeout(4000);

  const token = await getAccessToken(page);
  const mypageData = token ? await fetchMypageData(page, token) : { ok: false, items: [] };
  const item = mypageData.items?.[0];

  report.hasAiReportRequest = {
    status:
      aiReportInsert && onDocuments && item?.hasAiReportRequest === true ? "PASS" : "NOT VERIFIED",
    aiReportInsert,
    onDocuments,
    documentsUrl: page.url(),
    hasAiReportRequest: item?.hasAiReportRequest ?? null,
    verifyProfilePhase: item?.verifyProfilePhase ?? null,
  };
  await page.close();
}

await browser.close();

console.log(JSON.stringify(report, null, 2));
console.log("\n=== FINAL HOLD VERDICT ===");
console.log(`P3 RE PDF: ${report.p3RePdf.verdict ?? "HOLD"}`);
console.log(`P3 Admin PDF: ${report.p3AdminPdf.verdict ?? "HOLD"}`);
console.log(`Legacy fallback: ${report.legacyFallback.status}`);
console.log(`hasAiReportRequest=true: ${report.hasAiReportRequest.status}`);
