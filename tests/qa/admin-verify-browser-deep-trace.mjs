/**
 * Browser deep trace — CASE_03/05/06 Phase2 + pipeline (verification only)
 */
import { chromium } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";

async function clickChoice(page, text) {
  await page.waitForFunction(
    (needle) => {
      const b = [...document.querySelectorAll("button")].find((x) => x.textContent?.includes(needle));
      if (!b) return false;
      b.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      return true;
    },
    text,
    { timeout: 30_000 },
  );
  await page.waitForTimeout(500);
}

async function clickFirstStitch(page) {
  const clicked = await page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
    };
    const btn = [...document.querySelectorAll("button")].find((b) => {
      if (!visible(b)) return false;
      const t = (b.textContent ?? "").trim();
      return /^\d{2}/.test(t) && !t.includes("직접 설명하기");
    });
    if (!btn) return false;
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    return true;
  });
  if (clicked) await page.waitForTimeout(500);
  return clicked;
}

async function getActiveQuestion(page) {
  return page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
    };
    const h = [...document.querySelectorAll("h3")].filter(visible).find((x) => {
      const t = (x.textContent ?? "").trim();
      return t && !t.includes("검토 내용 체크") && !t.includes("행정문서");
    });
    return h?.textContent?.trim()?.slice(0, 200) ?? null;
  });
}

async function advanceToFirstResult(page, q1, phase1Steps, tag) {
  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(800);
  await clickChoice(page, q1);
  for (const step of phase1Steps) {
    if (await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible().catch(() => false)) break;
    await clickChoice(page, step);
  }
  for (let i = 0; i < 12; i++) {
    if (await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible().catch(() => false)) break;
    if (await page.locator('input[name="name"]').isVisible().catch(() => false)) break;
    if (await page.getByRole("heading", { name: /간단한 자료가 있으면 함께 첨부/ }).isVisible().catch(() => false)) break;
    if (!(await clickFirstStitch(page))) break;
  }
  const skip = page.getByRole("button", { name: /자료 없이 계속하기/ });
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
    await page.waitForTimeout(700);
  }
  if (await page.locator('input[name="name"]').isVisible().catch(() => false)) {
    const suffix = String(Date.now()).slice(-8);
    await page.locator('input[name="name"]').fill(`QA ${tag}`);
    await page.locator('input[name="phone"]').fill(`090${suffix}`);
    await page.locator('input[name="address"]').fill("Quan 7");
    await page.locator('input[name="email"]').fill(`${tag}-${Date.now()}@test.vfbcai.local`);
    await page.locator('input[name="kakao_id"]').fill(`qa${suffix}`);
    await page.locator('input[name="agreeTerms"]').check();
    await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  }
  await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).waitFor({ timeout: 120_000 });
}

async function tracePhase2(page, phase2Clicks, maxSteps = 12) {
  await page.getByRole("button", { name: /개인화?\s*상세\s*검토\s*하기/ }).click();
  await page.waitForTimeout(1200);
  const trace = [];
  for (let i = 0; i < maxSteps; i++) {
    const q = await getActiveQuestion(page);
    const body = (await page.evaluate(() => document.body.innerText)).slice(0, 500);
    trace.push({
      step: i,
      question: q,
      hasBlockage: body.includes("막힌") || body.includes("막혀"),
      hasEvidence: body.includes("증빙") || body.includes("자료"),
      hasFinalGoal: body.includes("목표") && body.includes("확인"),
      hasEvidenceGate: body.includes("2차 상세검토에 필요한 자료"),
      hasSecondResult: body.includes("2차") && body.includes("종합"),
    });
    if (body.includes("2차 상세검토에 필요한 자료") || body.includes("2차 종합")) break;
    const pick = phase2Clicks[i];
    if (pick) await clickChoice(page, pick).catch(() => clickFirstStitch(page));
    else await clickFirstStitch(page);
    await page.waitForTimeout(700);
  }
  return trace;
}

const browser = await chromium.launch({ headless: true });
const out = {};

try {
  // CASE_03 A — prep_unclear path
  const p03 = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await advanceToFirstResult(
    p03,
    "출석하거나 설명하라는 내용",
    [
      "왜 출석하거나 설명해야 하는지",
      "정해진 날짜에 반드시 출석해야 하는지",
      "아직 기관에 설명하거나 직접 방문하지 않았습니다",
      "출석하거나 설명해야 하는 날짜를 확인했습니다",
    ],
    "case03A",
  );
  out.CASE_03_A = {
    firstResult: true,
    phase2: await tracePhase2(p03, [
      "출석만 하면 되는지",
      "무엇을 해야 하는지",
      "출석·소명 통지서",
    ]),
  };
  await p03.close();

  // CASE_03 C — mismatch path
  const p03c = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await advanceToFirstResult(
    p03c,
    "출석하거나 설명하라는 내용",
    [
      "특정 사건이나 행동에 대해 설명",
      "기관에서 정확히 무엇을 확인하려는지",
      "아직 기관에 설명하거나 직접 방문하지 않았습니다",
      "출석하거나 설명해야 하는 날짜를 확인했습니다",
    ],
    "case03C",
  );
  out.CASE_03_C = {
    firstResult: true,
    phase2: await tracePhase2(p03c, [
      "실제 상황과 기관이 확인하려는 내용이 상당히 다릅니다",
      "특정 사건·행동",
      "무엇을 해야 하는지",
      "출석·소명 통지서",
    ]),
  };
  await p03c.close();

  // CASE_05 A — disposition complete path
  const p05 = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await advanceToFirstResult(p05, "면허의 정지·취소·거부", [], "case05A");
  for (let i = 0; i < 14; i++) {
    if (await p05.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible().catch(() => false)) break;
    await clickFirstStitch(p05);
  }
  out.CASE_05_A = {
    firstResult: true,
    phase2: await tracePhase2(p05, [
      "처분 통지에 적힌 내용과 제가 알고 있는 실제 상황이 거의 같습니다",
      "지금 무엇을 해야 하는지",
      "처분 통지서",
    ]),
  };
  await p05.close();

  // CASE_06 — unclear → reclassification via other + text
  const p06 = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await p06.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle", timeout: 60_000 });
  await p06.waitForTimeout(800);
  await clickChoice(p06, "위에 없는 다른 행정문서");
  // direct input path if available
  const trace06 = [];
  for (let i = 0; i < 8; i++) {
    trace06.push({ step: i, question: await getActiveQuestion(p06) });
    await clickFirstStitch(p06);
    await p06.waitForTimeout(600);
  }
  out.CASE_06_unclear = { trace: trace06 };
  await p06.close();
} finally {
  await browser.close();
}

console.log(JSON.stringify(out, null, 2));
