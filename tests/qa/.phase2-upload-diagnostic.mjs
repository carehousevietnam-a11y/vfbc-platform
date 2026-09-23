/** TEMP — full Phase2 → upload diagnostic */
import { chromium } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";
const DETAIL =
  "계약서 조건과 실제 상황 차이를 확인해야 합니다. 보증금 반환 조건이 문서와 다릅니다.";

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
    { timeout: 25000 },
  );
  await page.waitForTimeout(500);
}

async function clickFirstStitch(page) {
  return page.evaluate(() => {
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
    const btn = [...document.querySelectorAll("button")].find((b) => {
      if (!visible(b)) return false;
      const t = (b.textContent ?? "").trim();
      return /^\d{2}/.test(t) && !t.includes("직접 설명하기");
    });
    if (!btn) return false;
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    return true;
  });
}

async function readSnap(page) {
  return page.evaluate(() => {
    const body = document.body.innerText;
    return {
      body: body.slice(0, 1200),
      phase1Badge: body.includes("1차 · 간단 자료"),
      phase2Badge: body.includes("2차 · 상세 자료") || body.includes("2차 · 간단 자료"),
      phase2Banner: body.includes("2차 · 개인화 검토"),
      phase2Heading: body.includes("추가 상황 확인"),
      phase1Heading: body.includes("1. 검토 내용 체크"),
      entryQ1: body.includes("지금 부동산 관련해서 어떤 일이 진행 중인가요"),
      evidence: body.includes("간단한 자료가 있으면 함께 첨부"),
      personalized: body.includes("부동산 문서 2차 개인화 결과"),
      firstResult: body.includes("부동산 문서 1차 종합 결과"),
      hasTextarea: !!document.querySelector("textarea"),
      re2Question: body.includes("re2_") || /등기·소유권|걸리는 조항|보증금·반환|분쟁 핵심/.test(body),
    };
  });
}

async function submitTextareaIfVisible(page, text) {
  const textarea = page.locator("textarea").first();
  if (!(await textarea.isVisible().catch(() => false))) return false;
  await textarea.fill(text);
  await page.waitForTimeout(250);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find(
      (b) => !b.disabled && /^(다음|확인|저장)/.test((b.textContent || "").trim()),
    );
    btn?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  });
  await page.waitForTimeout(600);
  return true;
}

async function completeEvidenceIfVisible(page) {
  const btn = page.getByRole("button", { name: /자료 없이 계속하기/ });
  if (!(await btn.isVisible().catch(() => false))) return false;
  await btn.click();
  await page.waitForTimeout(800);
  return true;
}

async function advancePhase2(page, maxSteps = 32) {
  const log = [];
  for (let i = 0; i < maxSteps; i++) {
    const snap = await readSnap(page);
    log.push({ step: i, snap });
    if (snap.personalized) return { ok: true, log, final: snap };
    if (snap.evidence) {
      return { ok: true, log, final: snap, atEvidence: true };
    }
    if (snap.hasTextarea) {
      await submitTextareaIfVisible(page, DETAIL);
      continue;
    }
    if (!(await clickFirstStitch(page))) {
      if (await completeEvidenceIfVisible(page)) continue;
      break;
    }
    await page.waitForTimeout(700);
  }
  return { ok: false, log, final: await readSnap(page) };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await clickChoiceByText(page, "서명·납부 전");
  await clickChoiceByText(page, "매물만 보고");
  await clickChoiceByText(page, "전세·월세");
  await clickChoiceByText(page, "집주인·매도인");
  await clickChoiceByText(page, "제출·계약 요건");
  await page.getByRole("button", { name: /자료 없이/ }).waitFor({ timeout: 30000 });
  await page.getByRole("button", { name: /자료 없이/ }).click();
  await page.locator('input[name="name"]').fill("Upload QA");
  await page.locator('input[name="phone"]').fill("0904444099");
  await page.locator('input[name="address"]').fill("Quan 7");
  await page.locator('input[name="email"]').fill(`upload-qa-${Date.now()}@test.vfbcai.local`);
  await page.locator('input[name="kakao_id"]').fill("uploadqa");
  await page.locator('input[name="agreeTerms"]').check();
  await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  await page
    .getByRole("heading", { name: "부동산 문서 1차 종합 결과" })
    .waitFor({ timeout: 90000 });

  await page.getByRole("button", { name: /개인화 상세검토/ }).click();
  await page.getByText("2차 · 개인화 검토").waitFor({ timeout: 20000 });

  const afterCta = await readSnap(page);
  console.log("AFTER_CTA", JSON.stringify(afterCta, null, 2));

  const result = await advancePhase2(page);
  console.log(
    "ADVANCE",
    JSON.stringify(
      {
        ok: result.ok,
        atEvidence: result.atEvidence,
        final: result.final,
        steps: result.log.length,
        lastSteps: result.log.slice(-3),
      },
      null,
      2,
    ),
  );

  if (result.atEvidence || result.final.evidence) {
    await completeEvidenceIfVisible(page);
    const afterEvidence = await readSnap(page);
    console.log("AFTER_EVIDENCE", JSON.stringify(afterEvidence, null, 2));
  }
} catch (e) {
  console.error("ERROR", e.message);
  console.log("LAST", JSON.stringify(await readSnap(page), null, 2));
} finally {
  await browser.close();
}
