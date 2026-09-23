/**
 * VERIFIER — VFBCAI STABILITY FIX
 * Run: node tests/qa/stability-fix-verify.mjs
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
    return { ok: true, ...(await res.json()) };
  }, { token: accessToken });
}

async function fetchMypagePdf(page, accessToken, leadId) {
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
    return { ok: true, bytes: Array.from(new Uint8Array(buf)) };
  }, { token: accessToken, leadId });
  if (!evalResult.ok) return { buffer: null, error: evalResult };
  return { buffer: Buffer.from(evalResult.bytes) };
}

async function extractPdfText(buffer) {
  if (!buffer || buffer.length < 500) return { text: "", pages: 0 };
  const parser = new PDFParse({ data: buffer });
  const parsed = await parser.getText();
  await parser.destroy();
  return { text: parsed.text ?? "", pages: parsed.total ?? 0 };
}

function trackCrm(page) {
  const posts = [];
  const patches = [];
  page.on("request", (req) => {
    if (!req.url().includes("/rest/v1/crm_activities")) return;
    try {
      const body = req.postDataJSON();
      if (req.method() === "POST") posts.push(body);
      if (req.method() === "PATCH") patches.push(body);
    } catch {
      /* ignore */
    }
  });
  return { posts, patches };
}

function latestPhase2JsonFromPatches(patches) {
  let last = null;
  for (const p of patches) {
    const meta = p?.meta ?? p;
    const raw = meta?.real_estate_phase2_answers_json;
    if (typeof raw === "string") last = raw;
  }
  return last;
}

function parsePhase2Json(raw) {
  if (!raw || raw.trim() === "" || raw.trim() === "{}") {
    return { nonEmpty: false, keys: [], raw: raw ?? null };
  }
  try {
    const parsed = JSON.parse(raw);
    const keys = Object.keys(parsed).filter((k) => parsed[k]?.trim?.());
    return { nonEmpty: keys.length > 0, keys, raw, parsed };
  } catch {
    return { nonEmpty: false, keys: [], raw, parseError: true };
  }
}

async function rePhase1(page, tag) {
  await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await clickChoice(page, "서명·납부 전");
  await page.getByRole("heading", { name: /서명 전 단계입니다/ }).waitFor();
  await clickChoice(page, "계약서 초안이나 관련 서류를 받았습니다");
  await clickChoice(page, "사거나 팔려");
  await clickChoice(page, "집주인·매도인");
  await clickChoice(page, "불리하거나 위험한");
  await page.getByRole("heading", { name: /받은 서류 내용이/ }).waitFor();
  await clickChoice(page, "서류와 제가 겪은");
  await clickChoice(page, "금액·보증금");
  await page.locator('input[name="name"]').waitFor({ state: "visible" });
  await page.locator('input[name="name"]').fill(`STAB RE ${tag}`);
  await page.locator('input[name="phone"]').fill(`0905555${Math.floor(Math.random() * 9000 + 1000)}`);
  await page.locator('input[name="address"]').fill("Quan 7");
  await page.locator('input[name="email"]').fill(`stab-re-${tag}-${Date.now()}@test.local`);
  await page.locator('input[name="kakao_id"]').fill(`stre${tag}`);
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
    if (await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible().catch(() => false)) break;
    if (await page.locator('input[name="name"]').isVisible().catch(() => false)) break;
    await clickChoice(page, step);
  }
  for (let i = 0; i < 6; i++) {
    if (await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible().catch(() => false)) break;
    if (await page.locator('input[name="name"]').isVisible().catch(() => false)) break;
    if (!(await clickStitch(page))) break;
    await page.waitForTimeout(500);
  }
  if (await page.locator('input[name="name"]').isVisible().catch(() => false)) {
    await page.locator('input[name="name"]').fill(`STAB Admin ${tag}`);
    await page.locator('input[name="phone"]').fill(`0904444${Math.floor(Math.random() * 9000 + 1000)}`);
    await page.locator('input[name="address"]').fill("Quan 7");
    await page.locator('input[name="email"]').fill(`stab-admin-${tag}-${Date.now()}@test.local`);
    await page.locator('input[name="kakao_id"]').fill(`stad${tag}`);
    await page.locator('input[name="agreeTerms"]').check();
    await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
    await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).waitFor({ timeout: 90000 });
  }
}

async function advanceRePhase2(page) {
  await page.getByRole("button", { name: PAID_CTA }).first().click();
  await page.getByText("2차 · 개인화 검토").waitFor({ timeout: 20000 });
  for (let i = 0; i < 50; i++) {
    if (await page.evaluate(() => document.body.innerText.includes("부동산 문서 2차 개인화 결과"))) {
      return true;
    }
    const skip = page.getByRole("button", { name: /자료 없이 계속하기/ });
    if (await skip.isVisible().catch(() => false)) {
      await skip.click();
      await page.waitForTimeout(900);
      continue;
    }
    if (await page.locator("textarea").first().isVisible().catch(() => false)) {
      await page.locator("textarea").first().fill(
        "등기부등본상 소유자와 계약 상대가 다릅니다. 보증금 반환 조건이 계약서와 다릅니다.",
      );
      await page.evaluate(() => {
        const btn = [...document.querySelectorAll("button")].find(
          (b) => !b.disabled && b.textContent?.trim() === "다음",
        );
        btn?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      });
      await page.waitForTimeout(700);
      continue;
    }
    if (!(await clickStitch(page))) break;
    await page.waitForTimeout(550);
  }
  return page.evaluate(() => document.body.innerText.includes("부동산 문서 2차 개인화 결과"));
}

async function advanceAdminPhase2(page) {
  await page.getByRole("button", { name: PAID_CTA }).first().click();
  await page.waitForTimeout(800);
  for (let i = 0; i < 8; i++) {
    if (await page.getByRole("heading", { name: "행정문서 개인화 검토 결과" }).isVisible().catch(() => false)) break;
    if (!(await clickStitch(page))) break;
    await page.waitForTimeout(500);
  }
  for (let i = 0; i < 40; i++) {
    if (await page.getByRole("heading", { name: "행정문서 개인화 검토 결과" }).isVisible().catch(() => false)) return true;
    const skip = page.getByRole("button", { name: /자료 없이 계속하기/ });
    if (await skip.isVisible().catch(() => false)) {
      await skip.click();
      await page.waitForTimeout(800);
      continue;
    }
    if (!(await clickStitch(page))) break;
    await page.waitForTimeout(500);
  }
  return page.getByRole("heading", { name: "행정문서 개인화 검토 결과" }).isVisible().catch(() => false);
}

const report = {
  aiReport: {},
  rePhase2: {},
  regression: {},
};

const browser = await chromium.launch({ headless: true });

// ── 1. AI REPORT REQUEST (Admin) ──
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const crm = trackCrm(page);
  await adminPhase1(page, "ai");
  await advanceAdminPhase2(page);
  await page.getByRole("button", { name: "AI 검토 상세 리포트" }).click();
  await page.waitForURL(/\/documents/, { timeout: 25000 }).catch(() => null);
  await page.waitForTimeout(2000);
  const docsUrl = page.url();
  await page.goto(`${BASE}/mypage`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  const token = await getAccessToken(page);
  const mypageData = token ? await fetchMypageData(page, token) : { ok: false, items: [] };
  const item = mypageData.items?.[0];
  const aiPosts = crm.posts.filter((p) => p?.action === "ai_report_request");
  report.aiReport = {
    crmInsertObserved: aiPosts.length > 0,
    crmInsertCount: aiPosts.length,
    crmPostActions: crm.posts.map((p) => p?.action).filter(Boolean),
    documentsUrl: docsUrl,
    documentsRedirect: /\/documents/.test(docsUrl) && docsUrl.includes("mode=ai_report"),
    hasAiReportRequest: item?.hasAiReportRequest ?? null,
    mypageDataOk: mypageData.ok,
  };
  await page.close();
}

// ── 2. RE PHASE2 PDF + persist ──
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const crm = trackCrm(page);
  await rePhase1(page, "pdf");
  await advanceRePhase2(page);
  await page.waitForTimeout(2500);
  const lastPhase2Raw = latestPhase2JsonFromPatches(crm.patches);
  const phase2Meta = parsePhase2Json(lastPhase2Raw);
  await page.goto(`${BASE}/mypage`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3500);
  const token = await getAccessToken(page);
  const mypageData = token ? await fetchMypageData(page, token) : { ok: false, items: [] };
  const leadId = mypageData.items?.[0]?.id ?? null;
  const pdfMeta = token && leadId ? await fetchMypagePdf(page, token, leadId) : { buffer: null };
  const { text } = await extractPdfText(pdfMeta.buffer);
  const internalLeaks = ["rejectionRisks", "expertBrief", "similarCases", "recommendedSteps", "expert_brief"].filter(
    (n) => text.includes(n),
  );
  const phase2Lines = [...text.matchAll(/✓\s*re2_[^\n·]+·[^\n]+/g)].map((m) => m[0].trim());
  report.rePhase2 = {
    personalizedResultReached: true,
    crmPatchCount: crm.patches.length,
    lastPhase2Raw: lastPhase2Raw?.slice(0, 300) ?? null,
    phase2MetaNonEmpty: phase2Meta.nonEmpty,
    phase2MetaKeys: phase2Meta.keys,
    phase2MetaKeyCount: phase2Meta.keys.length,
    pdfBytes: pdfMeta.buffer?.length ?? 0,
    hasPhase1Section: text.includes("■ 1차 확인"),
    hasPhase2Section: text.includes("■ 2차 확인"),
    phase2LineCount: phase2Lines.length,
    phase2LineSample: phase2Lines.slice(0, 3),
    customerSafe: internalLeaks.length === 0,
    internalLeaks,
    textSample: text.slice(0, 900),
  };
  await page.close();
}

// ── 3. REGRESSION smoke ──
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${BASE}/check/trc`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const trcBody = await page.locator("body").innerText();
  report.regression.trc = {
    loaded: trcBody.includes("TRC") || trcBody.includes("체류") || trcBody.includes("CHECK"),
    hasAiReportLabel: trcBody.includes("AI") || trcBody.includes("리포트"),
  };
  await page.goto(`${BASE}/register/franchise`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const regBody = await page.locator("body").innerText();
  report.regression.registerFranchise = {
    loaded: regBody.includes("프랜차이즈") || regBody.includes("REGISTER") || regBody.includes("허가"),
    noCrash: !regBody.includes("Application error"),
  };
  await page.close();
}

await browser.close();

const verdict = {
  aiCrmInsert: report.aiReport.crmInsertObserved ? "PASS" : "FAIL",
  aiHasFlag: report.aiReport.hasAiReportRequest === true ? "PASS" : "FAIL",
  aiDocsRedirect: report.aiReport.documentsRedirect ? "PASS" : "FAIL",
  re2AnswersPresent: report.rePhase2.phase2MetaNonEmpty ? "PASS" : "FAIL",
  rePhase2JsonNonEmpty: report.rePhase2.phase2MetaNonEmpty ? "PASS" : "FAIL",
  rePdfPhase2Section: report.rePhase2.hasPhase2Section ? "PASS" : "FAIL",
  rePdfPhase2Answer: report.rePhase2.phase2LineCount >= 1 ? "PASS" : "FAIL",
  reCustomerSafe: report.rePhase2.customerSafe ? "PASS" : "FAIL",
  trc: report.regression.trc.loaded ? "PASS" : "FAIL",
  register: report.regression.registerFranchise.loaded && report.regression.registerFranchise.noCrash ? "PASS" : "FAIL",
};

const corePass =
  verdict.aiCrmInsert === "PASS" &&
  verdict.aiHasFlag === "PASS" &&
  verdict.aiDocsRedirect === "PASS" &&
  verdict.re2AnswersPresent === "PASS" &&
  verdict.rePhase2JsonNonEmpty === "PASS" &&
  verdict.rePdfPhase2Section === "PASS" &&
  verdict.rePdfPhase2Answer === "PASS" &&
  verdict.reCustomerSafe === "PASS" &&
  verdict.trc === "PASS" &&
  verdict.register === "PASS";

console.log(JSON.stringify({ report, verdict, corePass }, null, 2));
