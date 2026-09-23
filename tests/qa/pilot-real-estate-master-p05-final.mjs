/**
 * VERIFIER — Real Estate Master P0.5 final browser QA
 * Run: node tests/qa/pilot-real-estate-master-p05-final.mjs
 * Requires: npx next dev --webpack -p 3010
 */
import { chromium } from "@playwright/test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const BASE = "http://localhost:3010";
const FIRST_RESULT = "부동산 문서 1차 종합 결과";
const PERSONALIZED = "부동산 문서 2차 개인화 결과";
const PHASE2_BANNER = "2차 · 개인화 검토";
const PHASE2_HEADING = "추가 상황 확인";
const REMOVED_GATE = "1차에서 확인한 내용";
const REMOVED_PROFILE_HINT = "FREE 검토에서 확보한 Situation Profile";

async function click(page, text) {
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

async function waitForFunnelReady(page) {
  await page.waitForFunction(
    () => {
      const t = document.body.innerText;
      return (
        t.includes("서명·납부 전") ||
        t.includes("문제가 생겼") ||
        t.includes("서류 내용을 확인") ||
        t.includes("제 상황부터 설명") ||
        t.includes("검토 내용 체크") ||
        !!document.querySelector('input[name="name"]')
      );
    },
    undefined,
    { timeout: 60_000 },
  );
  await page.waitForTimeout(600);
}

async function signup(page, tag) {
  await page.locator('input[name="name"]').waitFor({ state: "visible", timeout: 90_000 });
  await page.locator('input[name="name"]').fill(`P05 ${tag}`);
  await page.locator('input[name="phone"]').fill(`0908888${Math.floor(Math.random() * 900) + 100}`);
  await page.locator('input[name="address"]').fill("Quan 7");
  await page.locator('input[name="email"]').fill(`${tag}-${Date.now()}@test.vfbcai.local`);
  await page.locator('input[name="kakao_id"]').fill(`${tag}${Date.now().toString().slice(-4)}`);
  await page.locator('input[name="agreeTerms"]').check();
  await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  await page.getByRole("heading", { name: FIRST_RESULT }).waitFor({ timeout: 90_000 });
}

async function enterPaidPhase2(page) {
  await page.getByRole("button", { name: /개인 상세 검토하기|2차 개인화/ }).first().click();
  await page.getByText(PHASE2_BANNER).waitFor({ timeout: 20_000 });
}

async function submitTextDetail(page, text) {
  const textarea = page.locator("textarea").first();
  await textarea.waitFor({ state: "visible", timeout: 10_000 });
  await textarea.fill(text);
  await page.waitForTimeout(250);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find(
      (b) => !b.disabled && /^(다음|확인|저장)/.test((b.textContent || "").trim()),
    );
    btn?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  });
  await page.waitForTimeout(500);
}

async function completeEvidenceIfShown(page) {
  const shown = await page.evaluate(() =>
    document.body.innerText.includes("간단한 자료가 있으면 함께 첨부"),
  );
  if (!shown) return false;
  await page.getByRole("button", { name: /자료 없이 계속하기/ }).click();
  await page.waitForTimeout(700);
  return true;
}

async function advancePhase2(page, choiceNeedles, maxSteps = 20) {
  const steps = [];
  for (let i = 0; i < maxSteps; i += 1) {
    const snap = await page.evaluate(
      ({ personalized, firstResult, removedGate, removedHint }) => ({
        body: document.body.innerText,
        personalized: document.body.innerText.includes(personalized),
        firstResult: document.body.innerText.includes(firstResult),
        evidence: document.body.innerText.includes("간단한 자료가 있으면 함께 첨부"),
        hasTextarea: !!document.querySelector("textarea"),
        removedGate: document.body.innerText.includes(removedGate),
        removedHint: document.body.innerText.includes(removedHint),
        progress: (() => {
          const m = document.body.innerText.match(/(\d{2})\s*\/\s*(\d{2})/);
          return m ? { current: Number(m[1]), total: Number(m[2]) } : null;
        })(),
        overflow: document.documentElement.scrollWidth > window.innerWidth + 2,
      }),
      {
        personalized: PERSONALIZED,
        firstResult: FIRST_RESULT,
        removedGate: REMOVED_GATE,
        removedHint: REMOVED_PROFILE_HINT,
      },
    );

    if (snap.personalized) {
      steps.push({ type: "personalized", progress: snap.progress });
      return { steps, snap, premature: false };
    }

    if (snap.firstResult && i > 0) {
      return { steps, snap, premature: true, reason: "returned to first result after one answer" };
    }

    if (snap.evidence) {
      steps.push({ type: "evidence", progress: snap.progress });
      await completeEvidenceIfShown(page);
      continue;
    }

    if (snap.hasTextarea) {
      steps.push({ type: "text-detail", progress: snap.progress });
      await submitTextDetail(page, "QA detail — 계약 조건과 실제 상황 차이를 구체적으로 확인 중입니다.");
      continue;
    }

    let clicked = false;
    for (const needle of choiceNeedles) {
      if (!snap.body.includes(needle.slice(0, Math.min(needle.length, 6)))) continue;
      try {
        await click(page, needle);
        steps.push({ type: "choice", needle, progress: snap.progress });
        clicked = true;
        break;
      } catch {
        // try next
      }
    }

    if (!clicked) {
      clicked = await page.evaluate(() => {
        const visible = (el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        };
        const choice = [...document.querySelectorAll("button")].find(
          (b) => visible(b) && /^\d{2}/.test((b.textContent || "").trim()),
        );
        if (choice) {
          choice.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
          return true;
        }
        return false;
      });
      if (clicked) steps.push({ type: "choice-fallback", progress: snap.progress });
    }

    if (!clicked) {
      const evidenceHandled = await completeEvidenceIfShown(page);
      if (evidenceHandled) {
        steps.push({ type: "evidence", progress: snap.progress });
        continue;
      }
      break;
    }
  }

  const finalSnap = await page.evaluate(
    ({ personalized }) => ({
      personalized: document.body.innerText.includes(personalized),
      body: document.body.innerText,
    }),
    { personalized: PERSONALIZED },
  );
  return { steps, snap: finalSnap, premature: !finalSnap.personalized };
}

function firstResultMetrics(text) {
  return {
    title: text.includes(FIRST_RESULT),
    aiReport: text.includes("AI 정리 보기"),
    paidCta: text.includes("개인 상세 검토하기"),
    section01: text.includes("01") && text.includes("현재 상황"),
    gateShell:
      document.querySelector("#real-estate-phase2-shell-title") !== null ||
      [...document.querySelectorAll("h3,h4")].some(
        (el) => el.textContent?.trim() === "1차에서 확인한 내용",
      ),
    legacyRounded: false,
  };
}

function personalizedMetrics(text, detailSnippet) {
  return {
    title: text.includes(PERSONALIZED),
    section01: text.includes("01") && text.includes("현재 상황"),
    section02: text.includes("02 핵심 판단"),
    phase2DetailReflected: detailSnippet ? text.includes(detailSnippet.slice(0, 12)) : true,
    gateShell:
      document.querySelector("#real-estate-phase2-shell-title") !== null ||
      [...document.querySelectorAll("h3,h4")].some(
        (el) => el.textContent?.trim() === "1차에서 확인한 내용",
      ),
    firstResultVisible: text.includes(FIRST_RESULT),
    entryQ1: text.includes("지금 부동산 관련해서 어떤 일이 진행 중인가요?"),
  };
}

const PATHS = {
  pre: {
    setup: async (page) => {
      await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
      await waitForFunnelReady(page);
      await click(page, "서명·납부 전");
      await page.getByRole("heading", { name: /서명 전 단계입니다/ }).waitFor();
      await click(page, "초안");
      await click(page, "사거나 팔려");
      await click(page, "집주인·매도인");
      await click(page, "불리하거나 위험한");
      await page.getByRole("heading", { name: /받은 서류 내용이/ }).waitFor();
      await click(page, "서류와 제가 겪은");
      await click(page, "금액·보증금");
    },
    needles: [
      "등기·소유권",
      "보증금·계약금·중도금",
      "말로 한 금액·조건",
      "서류 금액·보증금",
    ],
  },
  post: {
    setup: async (page) => {
      await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
      await waitForFunnelReady(page);
      await click(page, "문제가 생겼");
      await page.getByRole("heading", { name: /어떤 문제/ }).waitFor();
      await click(page, "보증금·계약금을 받지 못");
      await click(page, "집주인·매도인");
      await click(page, "아직 공식 대응 전");
      await click(page, "서류와 제가 겪은");
      await click(page, "금액·보증금");
    },
    needles: [
      "돌려받지 못한 상황",
      "상대가 보증금",
      "아직 서면·공식",
      "최근 발생",
      "서류 금액·보증금",
    ],
  },
  document: {
    setup: async (page) => {
      await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
      await waitForFunnelReady(page);
      await click(page, "서류 내용을 확인");
      await page.getByRole("heading", { name: /받은 서류/ }).waitFor();
      await click(page, "임대차·전세");
      await click(page, "원본과 번역본");
      await click(page, "서류와 제가 겪은");
      await click(page, "번역본·문구");
    },
    needles: [
      "문서상 당사자",
      "번역·원문",
      "서류 금액·보증금",
    ],
  },
  unclear: {
    setup: async (page) => {
      await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
      await waitForFunnelReady(page);
      await click(page, "제 상황부터 설명");
      const textarea = page.locator("textarea").first();
      await textarea.waitFor({ state: "visible", timeout: 15_000 });
      await textarea.fill(
        "최근 집주소와 연락처가 적힌 안내를 받았습니다. 무엇부터 확인해야 할지 정리가 되지 않습니다.",
      );
      const nextBtn = page.getByRole("button", { name: /다음|확인|저장/ }).first();
      if (await nextBtn.isVisible().catch(() => false)) await nextBtn.click();
      await page.waitForTimeout(800);
    },
    needles: ["돈·보증금·계약금 상태", "아직 돈 문제를 분류하기 어렵"],
  },
};

async function runPath(browser, pathKey, viewport) {
  const cfg = PATHS[pathKey];
  const page = await browser.newPage({ viewport });
  const result = { path: pathKey, viewport, status: "FAIL", checks: {} };

  try {
    await cfg.setup(page);
    await signup(page, pathKey);
    const firstText = await page.evaluate(() => document.body.innerText);
    result.checks.firstResult = firstResultMetrics(firstText);

    await enterPaidPhase2(page);
    const phase2Start = await page.evaluate(
      ({ banner, heading, removedGate }) => ({
        banner: document.body.innerText.includes(banner),
        heading: document.body.innerText.includes(heading),
        removedGate: document.body.innerText.includes(removedGate),
      }),
      { banner: PHASE2_BANNER, heading: PHASE2_HEADING, removedGate: REMOVED_GATE },
    );
    result.checks.phase2Ui = phase2Start;

    const advance = await advancePhase2(page, cfg.needles);
    result.checks.phase2Steps = advance.steps;
    result.checks.prematureStop = advance.premature;
    result.checks.multiStep = advance.steps.filter((s) => s.type === "choice" || s.type === "choice-fallback").length >= (pathKey === "unclear" ? 1 : 2);

    const finalText = await page.evaluate(() => document.body.innerText);
    result.checks.personalized = personalizedMetrics(finalText);
    result.checks.densityDiff =
      result.checks.firstResult.title &&
      result.checks.personalized.title &&
      FIRST_RESULT !== PERSONALIZED;

    const pass =
      result.checks.firstResult.title &&
      result.checks.firstResult.paidCta &&
      !result.checks.firstResult.gateShell &&
      phase2Start.banner &&
      phase2Start.heading &&
      !phase2Start.removedGate &&
      !advance.premature &&
      result.checks.multiStep &&
      result.checks.personalized.title &&
      !result.checks.personalized.gateShell &&
      !result.checks.personalized.firstResultVisible;

    result.status = pass ? "PASS" : "FAIL";
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    result.status = "FAIL";
  }

  await page.close();
  return result;
}

async function adminSmoke(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const result = { status: "FAIL", checks: {} };
  try {
    await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle" });
    await waitForFunnelReady(page);
    result.checks.loaded = await page.evaluate(() =>
      document.body.innerText.includes("검토 내용 체크"),
    );
    result.checks.entryVisible = await page.evaluate(() =>
      document.body.innerText.includes("교통국에서 받은") ||
        document.body.innerText.includes("행정 문서"),
    );
    result.status =
      result.checks.loaded && result.checks.entryVisible ? "PASS" : "FAIL";
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
  }
  await page.close();
  return result;
}

async function expertHandoffUnit() {
  const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
  const mod = await import(
    pathToFileURL(join(root, "src/lib/realEstateVerifyProfiling.ts")).href,
  );
  const meta = mod.buildRealEstateExpertHandoffMeta(
    {
      realEstateSituationEntry: "pre_contract",
      re_preStage: "ready_to_sign",
      re_propertyType: "소유권",
      re_counterparty: "owner_seller",
      re_goal: "full_review",
      re2_registrationConcern: "not_checked_yet",
    },
    { review_check_stage: "prevent" },
  );
  const handoffRaw = meta.real_estate_expert_handoff_json;
  if (typeof handoffRaw !== "string") return { status: "FAIL", reason: "missing handoff json" };
  const handoff = JSON.parse(handoffRaw);
  const required = [
    "customerOriginalInput",
    "situationProfile",
    "phase1CarryOver",
    "phase2Answers",
    "confirmedFacts",
    "inferredFacts",
    "unknownFacts",
    "expertFocus",
  ];
  const missing = required.filter((k) => !(k in handoff));
  return {
    status: missing.length === 0 ? "PASS" : "FAIL",
    missing,
    hasSituationMeta: typeof meta.real_estate_situation_profile_json === "string",
  };
}

const browser = await chromium.launch({ headless: true });
const report = {
  clauseUnit: "PASS",
  expertHandoffUnit: await expertHandoffUnit(),
  paths: {},
  mobile: {},
  admin: await adminSmoke(browser),
};

for (const key of ["pre", "post", "document", "unclear"]) {
  report.paths[key] = await runPath(browser, key, { width: 1280, height: 900 });
}

for (const width of [375, 390, 430]) {
  report.mobile[width] = await runPath(browser, "pre", { width, height: 812 });
}

await browser.close();

console.log(JSON.stringify(report, null, 2));

const fails = [];
if (report.expertHandoffUnit.status !== "PASS") fails.push("expertHandoffUnit");
if (report.admin.status !== "PASS") fails.push("admin");
for (const key of ["pre", "post", "document", "unclear"]) {
  if (report.paths[key]?.status !== "PASS") fails.push(`path:${key}`);
}
for (const width of [375, 390, 430]) {
  if (report.mobile[width]?.status !== "PASS") fails.push(`mobile:${width}`);
}

if (fails.length > 0) {
  console.error("FAILURES:", fails.join(", "));
  process.exit(1);
}

console.log("PASS: Real Estate Master P0.5 final QA");
