/**
 * VERIFIER — Real Estate Master Final QA Closure
 * Run: node tests/qa/real-estate-master-final-closure.mjs
 * Requires: npx next dev --webpack -p 3010
 */
import { chromium } from "@playwright/test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";
const FIRST_RESULT = "부동산 문서 1차 종합 결과";
const PERSONALIZED = "부동산 문서 2차 개인화 결과";
const ENTRY_Q1 = "지금 부동산 관련해서 어떤 일이 진행 중인가요?";
const DETAIL_TEXT =
  "계약서 조건과 실제 상황 차이를 확인해야 합니다. 보증금 반환 조건이 문서와 다릅니다.";
const PHASE2_DETAIL_MARKER = "보증금 반환 조건이 문서와 다릅니다";

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
    { timeout: 25_000 },
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

async function waitForFunnelReady(page) {
  await page.waitForFunction(
    () => {
      const t = document.body.innerText;
      return (
        t.includes("서명·납부 전") ||
        t.includes("문제가 생겼") ||
        t.includes("서류 내용을 확인") ||
        t.includes("제 상황부터 설명") ||
        !!document.querySelector('input[name="name"]')
      );
    },
    undefined,
    { timeout: 60_000 },
  );
  await page.waitForTimeout(600);
}

async function clickThroughPhase1(page, steps) {
  for (const step of steps) {
    if (await page.getByRole("heading", { name: FIRST_RESULT }).isVisible().catch(() => false)) {
      return;
    }
    if (await page.locator('input[name="name"]').isVisible().catch(() => false)) return;
    await clickChoiceByText(page, step);
  }
  for (let i = 0; i < 8; i++) {
    if (await page.getByRole("heading", { name: FIRST_RESULT }).isVisible().catch(() => false)) {
      return;
    }
    if (await page.locator('input[name="name"]').isVisible().catch(() => false)) return;
    if (!(await clickFirstStitch(page))) break;
    await page.waitForTimeout(500);
  }
}

/** Product flow: Phase1 questions → Phase1 evidence gate → signup */
async function advancePhase1ToSignup(page) {
  await page.waitForFunction(
    () => {
      const t = document.body.innerText;
      return (
        t.includes("1차 · 간단 자료") ||
        t.includes("간단한 자료가 있으면 함께 첨부") ||
        !!document.querySelector('input[name="name"]')
      );
    },
    undefined,
    { timeout: 60_000 },
  );
  if (await page.locator('input[name="name"]').isVisible().catch(() => false)) {
    return;
  }
  const skipped = await completeEvidenceIfVisible(page);
  if (!skipped) {
    throw new Error("Phase1 evidence gate visible but '자료 없이 계속하기' not found");
  }
  await page.locator('input[name="name"]').waitFor({ state: "visible", timeout: 30_000 });
}

async function submitSignup(page, tag) {
  await page.locator('input[name="name"]').waitFor({ state: "visible", timeout: 90_000 });
  await page.locator('input[name="name"]').fill(`Closure ${tag}`);
  await page.locator('input[name="phone"]').fill(`0909999${Math.floor(Math.random() * 900) + 100}`);
  await page.locator('input[name="address"]').fill("Quan 7, TP.HCM");
  await page.locator('input[name="email"]').fill(`${tag}-${Date.now()}@test.vfbcai.local`);
  await page.locator('input[name="kakao_id"]').fill(`${tag}${Date.now().toString().slice(-4)}`);
  await page.locator('input[name="agreeTerms"]').check();
  await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  await page.getByRole("heading", { name: FIRST_RESULT }).waitFor({ timeout: 90_000 });
}

async function enterPaidPhase2(page) {
  await page.getByRole("button", { name: /개인화 상세검토/ }).first().click();
  await page.getByText("2차 · 개인화 검토").waitFor({ timeout: 20_000 });
}

async function readSnap(page) {
  return page.evaluate(
    ({ firstResult, personalized, entryQ1 }) => {
      const body = document.body.innerText;
      const progressMatch = body.match(/(\d{2})\s*\/\s*(\d{2})/);
      return {
        body,
        personalized: body.includes(personalized),
        firstResult: body.includes(firstResult),
        evidence: body.includes("간단한 자료가 있으면 함께 첨부"),
        hasTextarea: !!document.querySelector("textarea"),
        progress: progressMatch ? `${progressMatch[1]}/${progressMatch[2]}` : null,
        progressCurrent: progressMatch ? Number(progressMatch[1]) : null,
        progressTotal: progressMatch ? Number(progressMatch[2]) : null,
        overflow: document.documentElement.scrollWidth > window.innerWidth + 2,
        entryQ1: body.includes(entryQ1),
        gateShellHeading: [...document.querySelectorAll("h3,h4")].some(
          (el) => el.textContent?.trim() === "1차에서 확인한 내용",
        ),
        aiReport: body.includes("AI 정리 보기"),
        paidCta: body.includes("개인화 상세검토"),
        section02: body.includes("02") && body.includes("핵심"),
      };
    },
    { firstResult: FIRST_RESULT, personalized: PERSONALIZED, entryQ1: ENTRY_Q1 },
  );
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

/** Admin closure pattern: stitch loop until evidence or personalized */
async function advancePhase2ToPersonalized(page, maxSteps = 32) {
  const progressLog = [];
  for (let i = 0; i < maxSteps; i += 1) {
    const snap = await readSnap(page);
    if (snap.progress) progressLog.push(snap.progress);
    if (snap.personalized) {
      return { ok: true, progressLog, snap, steps: i + 1 };
    }
    if (snap.evidence) {
      await completeEvidenceIfVisible(page);
      continue;
    }
    if (snap.hasTextarea) {
      await submitTextareaIfVisible(page, DETAIL_TEXT);
      continue;
    }
    if (!(await clickFirstStitch(page))) {
      if (await completeEvidenceIfVisible(page)) continue;
      break;
    }
    await page.waitForTimeout(500);
  }
  const snap = await readSnap(page);
  return { ok: snap.personalized, progressLog, snap, steps: maxSteps };
}

const PATHS = {
  pre: {
    phase1: [
      "서명·납부 전",
      "초안",
      "사거나 팔려",
      "집주인·매도인",
      "불리하거나 위험한",
      "서류와 제가 겪은",
      "금액·보증금",
    ],
    phase2Prefill: [],
  },
  post: {
    phase1: [
      "문제가 생겼",
      "보증금·계약금을 받지 못",
      "집주인·매도인",
      "아직 공식 대응 전",
      "서류와 제가 겪은",
      "금액·보증금",
    ],
    phase2Prefill: [],
  },
  document: {
    phase1: [
      "서류 내용을 확인",
      "임대차·전세",
      "원본과 번역본",
      "서류와 제가 겪은",
      "번역본·문구",
    ],
    phase2Prefill: [],
  },
  unclear: {
    phase1DirectInput:
      "최recent 집주소와 연락처가 적힌 안내를 받았습니다. 무엇부터 확인해야 할지 정리가 되지 않습니다.",
    phase1: [],
    phase2Prefill: ["돈·보증금·계약금 상태", "아직 돈 문제를 분류하기 어렵"],
  },
};

async function runPath(page, pathKey) {
  const cfg = PATHS[pathKey];
  const result = {
    path: pathKey,
    status: "FAIL",
    checks: {},
    error: null,
  };

  try {
    await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
    await waitForFunnelReady(page);

    if (pathKey === "unclear") {
      await clickChoiceByText(page, "제 상황부터 설명");
      await submitTextareaIfVisible(
        page,
        "최근 집주소와 연락처가 적힌 안내를 받았습니다. 무엇부터 확인해야 할지 정리가 되지 않습니다.",
      );
    } else {
      await clickThroughPhase1(page, cfg.phase1);
    }

    await advancePhase1ToSignup(page);
    await submitSignup(page, pathKey);
    const firstSnap = await readSnap(page);
    result.checks.freeResult = {
      title: firstSnap.firstResult,
      aiReport: firstSnap.aiReport,
      paidCta: firstSnap.paidCta,
      entryQ1: firstSnap.entryQ1,
      gateShell: firstSnap.gateShellHeading,
    };
    result.checks.firstResultSnippet = firstSnap.body.slice(0, 400);

    await enterPaidPhase2(page);
    const phase2Start = await readSnap(page);
    result.checks.phase2Ui = {
      banner: phase2Start.body.includes("2차 · 개인화 검토"),
      heading: phase2Start.body.includes("추가 상황 확인"),
      gateShell: phase2Start.gateShellHeading,
      entryQ1: phase2Start.entryQ1,
      initialProgress: phase2Start.progress,
    };

    for (const prefill of cfg.phase2Prefill ?? []) {
      await clickChoiceByText(page, prefill);
    }

    const advance = await advancePhase2ToPersonalized(page);
    result.checks.phase2Advance = {
      ok: advance.ok,
      steps: advance.steps,
      progressLog: advance.progressLog,
      evidenceSeen: advance.progressLog.length > 0,
    };
    result.checks.finalSnap = {
      personalized: advance.snap.personalized,
      firstResultHidden: !advance.snap.firstResult,
      entryQ1: advance.snap.entryQ1,
      gateShell: advance.snap.gateShellHeading,
      section02: advance.snap.section02,
      overflow: advance.snap.overflow,
      hasPhase2Detail: advance.snap.body.includes(PHASE2_DETAIL_MARKER),
    };

    result.checks.densityDiff =
      result.checks.firstResultSnippet !== advance.snap.body.slice(0, 400) &&
      advance.snap.personalized &&
      !advance.snap.firstResult;

    const pass =
      result.checks.freeResult.title &&
      result.checks.freeResult.paidCta &&
      !result.checks.freeResult.gateShell &&
      result.checks.phase2Ui.banner &&
      result.checks.phase2Ui.heading &&
      !result.checks.phase2Ui.gateShell &&
      !result.checks.phase2Ui.entryQ1 &&
      advance.ok &&
      result.checks.finalSnap.personalized &&
      result.checks.finalSnap.firstResultHidden &&
      !result.checks.finalSnap.entryQ1 &&
      result.checks.densityDiff;

    result.status = pass ? "PASS" : "FAIL";
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    result.status = "FAIL";
  }

  return result;
}

async function verifyProgressIncrement(page) {
  await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
  await waitForFunnelReady(page);
  await clickThroughPhase1(page, PATHS.pre.phase1);
  await advancePhase1ToSignup(page);
  await submitSignup(page, "progress");
  await enterPaidPhase2(page);
  const logs = [];
  const first = await readSnap(page);
  logs.push(first.progress);
  await clickFirstStitch(page);
  await page.waitForTimeout(700);
  const second = await readSnap(page);
  logs.push(second.progress);
  await clickFirstStitch(page);
  await page.waitForTimeout(700);
  const third = await readSnap(page);
  logs.push(third.progress);
  const incrementing =
    logs[0] &&
    logs[1] &&
    logs[0] !== logs[1] &&
    (third.progress === null || third.progress !== logs[1] || third.progressCurrent > second.progressCurrent);
  return { logs, incrementing, first: logs[0], second: logs[1], third: logs[2] };
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
      re2_registrationConcern: "not_checked_yet",
      re2_registrationDetail: "등기 확인 상세 QA",
    },
    { review_check_stage: "prevent" },
  );
  const raw = meta.real_estate_expert_handoff_json;
  if (typeof raw !== "string") return { status: "FAIL", reason: "missing json" };
  const handoff = JSON.parse(raw);
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
  return { status: missing.length === 0 ? "PASS" : "FAIL", missing, hasExpertBriefLayer: true };
}

async function runAdminRegression() {
  const browser = await chromium.launch({ headless: true });
  const out = {};
  for (const [label, viewport] of [
    ["desktop", { width: 1280, height: 800 }],
    ["mobile375", { width: 375, height: 812 }],
  ]) {
    const page = await browser.newPage({ viewport });
    try {
      await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      const loaded = await page.evaluate(() =>
        document.body.innerText.includes("검토 내용 체크"),
      );
      out[label] = { loaded, status: loaded ? "PASS" : "FAIL" };
    } catch (error) {
      out[label] = {
        status: "FAIL",
        error: error instanceof Error ? error.message : String(error),
      };
    }
    await page.close();
  }
  await browser.close();
  return out;
}

const report = {
  harness:
    "real-estate-master-final-closure.mjs (Phase1 evidence skip → signup → 개인화 상세검토 CTA)",
  expertHandoffUnit: await expertHandoffUnit(),
  paths: {},
  progress: null,
  mobile: {},
  restore: { status: "NOT RUN" },
  admin: await runAdminRegression(),
  tsc: null,
};

const browser = await chromium.launch({ headless: true });

for (const key of ["pre", "post", "document", "unclear"]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  report.paths[key] = await runPath(page, key);
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  report.progress = await verifyProgressIncrement(page);
  await page.close();
}

for (const width of [375, 390, 430]) {
  const page = await browser.newPage({ viewport: { width, height: 812 } });
  const r = await runPath(page, "pre");
  report.mobile[width] = {
    status: r.status,
    overflow: r.checks.finalSnap?.overflow ?? null,
    personalized: r.checks.finalSnap?.personalized ?? false,
  };
  await page.close();
}

await browser.close();

console.log(JSON.stringify(report, null, 2));

const fails = [];
for (const key of ["pre", "post", "document", "unclear"]) {
  if (report.paths[key]?.status !== "PASS") fails.push(`path:${key}`);
}
if (!report.progress?.incrementing) fails.push("progress");
for (const w of [375, 390, 430]) {
  if (report.mobile[w]?.status !== "PASS") fails.push(`mobile:${w}`);
}
if (report.expertHandoffUnit.status !== "PASS") fails.push("expertHandoffUnit");

if (fails.length > 0) {
  console.error("FAILURES:", fails.join(", "));
  process.exit(1);
}
console.log("PASS: Real Estate Master Final Closure");
