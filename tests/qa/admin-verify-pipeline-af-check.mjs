/**
 * A–F checklist evidence for admin VERIFY pipeline stages
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
  await page.waitForTimeout(450);
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
  if (clicked) await page.waitForTimeout(450);
  return clicked;
}

async function advanceToFirstResult(page, tag) {
  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(700);
  await clickChoice(page, "출석하거나 설명하라는 내용");
  for (const p of [
    "왜 출석하거나 설명해야 하는지",
    "정해진 날짜에 반드시 출석해야 하는지",
    "아직 기관에 설명하거나 직접 방문하지 않았습니다",
    "출석하거나 설명해야 하는 날짜를 확인했습니다",
  ]) {
    if (await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible().catch(() => false)) break;
    await clickChoice(page, p);
  }
  for (let i = 0; i < 8; i++) {
    if (await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible().catch(() => false)) break;
    if (await page.getByRole("heading", { name: /간단한 자료가 있으면/ }).isVisible().catch(() => false)) break;
    if (!(await clickFirstStitch(page))) break;
  }
  const skip = page.getByRole("button", { name: /자료 없이 계속하기/ });
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
    await page.waitForTimeout(600);
  }
  if (await page.locator('input[name="name"]').isVisible().catch(() => false)) {
    const suffix = String(Date.now()).slice(-8);
    await page.locator('input[name="name"]').fill(`AF ${tag}`);
    await page.locator('input[name="phone"]').fill(`090${suffix}`);
    await page.locator('input[name="address"]').fill("Quan 7");
    await page.locator('input[name="email"]').fill(`af-${Date.now()}@test.vfbcai.local`);
    await page.locator('input[name="kakao_id"]').fill(`qa${suffix}`);
    await page.locator('input[name="agreeTerms"]').check();
    await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  }
  await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).waitFor({ timeout: 120_000 });
}

function af(partial) {
  return { A: null, B: null, C: null, D: null, E: null, F: null, ...partial, note: partial.note ?? null };
}

const out = { desktop: {}, mobile: {} };
const browser = await chromium.launch({ headless: true });

// Desktop full path
const desk = await browser.newPage({ viewport: { width: 1280, height: 900 } });
try {
  await advanceToFirstResult(desk, "desk");
  out.desktop.firstResultCta = af({
    A: true,
    B: (await desk.locator('[data-purpose="action-selection-section"]').count()) > 0,
    F: (await desk.getByRole("button", { name: /개인화 상세 검토하기/ }).count()) > 0,
    note: `dualCards=${await desk.locator('[data-purpose="action-selection-section"]').count()}`,
  });

  await desk.getByRole("button", { name: /개인화 상세 검토하기/ }).click();
  await desk.waitForTimeout(900);

  const p2Questions = [];
  const p2Picks = [
    "실제 상황과 기관이 확인하려는 내용이 상당히 다릅니다",
    "특정 사건·행동",
    "무엇을 해야 하는지",
    "출석·소명 통지서",
  ];
  for (let i = 0; i < 10; i++) {
    const h3 = await desk.evaluate(() => {
      const hs = [...document.querySelectorAll("h3")].map((h) => h.textContent?.trim() ?? "");
      return hs.find((t) => t.includes("기관") || t.includes("막힌") || t.includes("증빙") || t.includes("목표")) ?? null;
    });
    if (h3) p2Questions.push(h3.slice(0, 100));
    const body = await desk.evaluate(() => document.body.innerText);
    if (body.includes("2차 상세검토에 필요한 자료")) break;
    if (body.includes("행정문서 개인화 검토 결과")) break;
    const pick = p2Picks[i];
    if (pick) await clickChoice(desk, pick).catch(() => clickFirstStitch(desk));
    else await clickFirstStitch(desk);
    await desk.waitForTimeout(500);
  }

  out.desktop.phase2Questions = af({
    A: true,
    B: p2Questions.length > 0,
    C: p2Questions.length >= 2,
    note: p2Questions,
  });

  if (await desk.getByRole("heading", { name: /2차 상세검토에 필요한 자료/ }).isVisible().catch(() => false)) {
    out.desktop.phase2Upload = af({
      A: true,
      B: true,
      note: await desk.evaluate(() =>
        document.body.innerText.includes("공문") && document.body.innerText.includes("/documents"),
      ),
    });
    await desk.getByRole("button", { name: /자료 없이 계속하기/ }).click();
    await desk.waitForTimeout(700);
  }

  const persBody = await desk.evaluate(() => document.body.innerText);
  out.desktop.personalizedResult = af({
    B: persBody.includes("행정문서 개인화 검토 결과") || persBody.includes("2차 개인화"),
    E: persBody.includes("확인") || persBody.includes("검토"),
    F: (await desk.getByRole("button", { name: /AI 검토|AI 리포트/ }).count()) > 0,
  });

  out.desktop.aiReportHandoff = af({
    A: true,
    B: (await desk.getByRole("button", { name: /AI 검토 상세 리포트|AI 리포트/ }).count()) > 0,
    note: "navigation not executed (no auth)",
  });
} finally {
  await desk.close();
}

// Mobile first-result CTA layout
const mob = await browser.newPage({ viewport: { width: 375, height: 812 } });
try {
  await advanceToFirstResult(mob, "mob");
  out.mobile.firstResultCta = af({
    B: (await mob.locator('[data-purpose="action-selection-section"]').count()) > 0,
    F: (await mob.getByRole("button", { name: /개인화 상세 검토하기/ }).isVisible()),
    note: `cardsVisible=${await mob.locator('[data-purpose="action-selection-section"]').isVisible()}`,
  });
} finally {
  await mob.close();
  await browser.close();
}

console.log(JSON.stringify(out, null, 2));
