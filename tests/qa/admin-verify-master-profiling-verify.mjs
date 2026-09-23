/**
 * Admin VERIFY Master — Phase2 profiling QA (engine + browser)
 * Verification only — no product code changes.
 */
import { chromium } from "@playwright/test";
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  buildAdminVerifyProfileQuestions,
  buildCaseResolutionProfile,
  getAdminVerifyPhase1VisibleFields,
  getQ1ResolvedCase,
  isAdminVerifyPhase2PathComplete,
  runCase02QaScenario,
  runCase03QaScenario,
  runCase04QaScenario,
  runCase05QaScenario,
  attachCaseResolutionSnapshot,
  selectNextCaseResolutionFocus,
} from "../../src/lib/adminVerifyProfiling.ts";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";
const EMPTY_FOLLOW = {};
const EMPTY_DOCS = { mismatch: [], unknown: [], other: [] };
const CUSTOMER_KEY = "caseCustomerInput";

function getPhase2OnlyQuestions(answers) {
  const phase1 = buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, 1);
  const phase1Ids = new Set(phase1.map((q) => q.id));
  const all = buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, 2);
  return all
    .filter((q) => q.id !== ADMIN_CASE_ENTRY_Q1_KEY && !phase1Ids.has(q.id))
    .map((q) => ({ id: q.id, label: q.label }));
}

function case02Phase1Only(variant) {
  const base = {
    situation: "received_document",
    profileDocumentSource: "traffic",
    stage: "case",
    [ADMIN_CASE_ENTRY_Q1_KEY]: "payment_demand",
    [CUSTOMER_KEY]: "교통국에서 과태료 납부 요구를 받았습니다",
    case02_paymentSubject: "traffic_fine",
    case02_paymentStatus: "not_paid",
    case02_deadline: "uncertain",
  };
  if (variant === "A") {
    return attachCaseResolutionSnapshot({
      ...base,
      case02_confirmGoal: "verify_obligation",
    });
  }
  return attachCaseResolutionSnapshot({
    ...base,
    [CUSTOMER_KEY]: "납부 요구 통지를 받았는데 금액이 통지 내용과 다릅니다",
    case02_confirmGoal: "verify_amount",
  });
}

function case02ScenarioAnswers(variant) {
  const phase1 = case02Phase1Only(variant);
  if (variant === "A") {
    return attachCaseResolutionSnapshot({
      ...phase1,
      case02_demandAuthority: "traffic",
      case02_situationMatch: "hard_to_judge",
      case02_paymentAmount: "reason_unclear",
      case02_paymentBasis: "violation_stated",
      case02_paymentMethod: "online_portal",
      case02_nonPaymentNotice: "no_notice",
    });
  }
  return attachCaseResolutionSnapshot({
    ...phase1,
    case02_demandAuthority: "traffic",
    case02_situationMatch: "partial",
    case02_paymentAmount: "amount_differs",
    case02_paymentMethod: "online_portal",
    case02_nonPaymentNotice: "no_notice",
  });
}

function case03ScenarioAnswers(variant) {
  const base = {
    situation: "received_document",
    profileDocumentSource: "court",
    stage: "case",
    [ADMIN_CASE_ENTRY_Q1_KEY]: "attendance_demand",
    [CUSTOMER_KEY]: "기관에서 출석하라고만 통보를 받았습니다",
    case03_authorityDemand: "prep_unclear",
    case03_confirmGoal: "prepare_materials",
    case03_customerResponse: "none",
    case03_prepRequired: "attendance_only",
    case03_deadline: "uncertain",
    case03_paymentSubject: "traffic_fine",
    case03_paymentStatus: "not_paid",
  };
  if (variant === "A") {
    return attachCaseResolutionSnapshot({
      ...base,
      case03_confirmGoal: "deadline_attendance",
    });
  }
  return attachCaseResolutionSnapshot({
    ...base,
    [CUSTOMER_KEY]: "기관이 문제 삼는 내용이 실제 상황과 다릅니다",
    case03_authorityDemand: "specific_incident",
    case03_confirmGoal: "understand_agency_intent",
    case03_factRelationship: "mismatch",
  });
}

function case04ScenarioAnswers(variant) {
  const base = {
    situation: "received_document",
    profileDocumentSource: "immigration",
    stage: "case",
    [ADMIN_CASE_ENTRY_Q1_KEY]: "supplement_demand",
    [CUSTOMER_KEY]: "보완 서류를 제출하라는 안내를 받았습니다",
    case04_supplementTarget: "personal_docs",
    case04_confirmGoal: "what_to_submit",
    case04_submissionStatus: "not_submitted",
    case04_deadline: "uncertain",
    case04_blockage: "requirements",
  };
  if (variant === "A") return attachCaseResolutionSnapshot(base);
  return attachCaseResolutionSnapshot({
    ...base,
    [CUSTOMER_KEY]: "같은 보완 요구를 반복해서 받았습니다",
    case04_supplementTarget: "repeat_demand",
    case04_confirmGoal: "repeat_reason",
    case04_submissionStatus: "submitted_once",
  });
}

function case05ScenarioAnswers(variant) {
  const base = {
    situation: "received_document",
    profileDocumentSource: "immigration",
    profileReceivedReason: "review_request",
    stage: "case",
    [ADMIN_CASE_ENTRY_Q1_KEY]: "disposition_notice",
    [CUSTOMER_KEY]: "출입국에서 허가가 취소되었다는 처분 통지를 받았습니다",
    case05_confirmGoal: "understand_reason",
    case05_dispositionSource: "immigration",
    case05_dispositionReason: "violation_claimed",
    case05_factRelationship: "match",
    case05_customerResponse: "none",
    case05_authorityFollowUp: "no_response",
    case05_deadline: "not_stated",
    case05_blockage: "what_to_do",
    case05_evidence: "disposition_notice",
    case05_dispositionType: "license_revoked",
  };
  if (variant === "A") return attachCaseResolutionSnapshot(base);
  return attachCaseResolutionSnapshot({
    ...base,
    [CUSTOMER_KEY]: "처분 통지를 받았는데 기관이 말한 내용이 실제와 일부 다릅니다",
    case05_dispositionType: "other_disposition",
    case05_factRelationship: "partial",
    case05_blockage: "fact_match",
  });
}

function runEngineChecks() {
  const results = {};

  const case02A = case02ScenarioAnswers("A");
  const case02B = case02ScenarioAnswers("B");
  const case03A = case03ScenarioAnswers("A");
  const case03C = case03ScenarioAnswers("C");
  const case04A = case04ScenarioAnswers("A");
  const case04C = case04ScenarioAnswers("C");
  const case05A = case05ScenarioAnswers("A");
  const case05C = case05ScenarioAnswers("C");

  const phase2Sets = {};
  for (const [caseId, a, b] of [
    ["CASE_02", case02A, case02B],
    ["CASE_03", case03A, case03C],
    ["CASE_04", case04A, case04C],
    ["CASE_05", case05A, case05C],
  ]) {
    const qA = getPhase2OnlyQuestions(a);
    const qB = getPhase2OnlyQuestions(b);
    phase2Sets[caseId] = {
      variantA: { first: qA[0] ?? null, ids: qA.map((q) => q.id) },
      variantB: { first: qB[0] ?? null, ids: qB.map((q) => q.id) },
      differs: JSON.stringify(qA.map((q) => q.id)) !== JSON.stringify(qB.map((q) => q.id)),
    };
  }

  const firstByCase = {
    CASE_02: getFirst(getPhase2OnlyQuestions(case02A)),
    CASE_03: getFirst(getPhase2OnlyQuestions(case03A)),
    CASE_04: getFirst(getPhase2OnlyQuestions(case04A)),
    CASE_05: getFirst(getPhase2OnlyQuestions(case05A)),
  };

  results.item1 = {
    pass:
      Object.values(phase2Sets).every((s) => s.differs) &&
      new Set(Object.values(firstByCase).map((f) => f?.id)).size >= 3,
    phase2Sets,
    firstByCase,
  };

  const chainA = getPhase2OnlyQuestions(case02A).map((q) => q.id);
  const chainB = getPhase2OnlyQuestions(case02B).map((q) => q.id);
  const afterA = attachCaseResolutionSnapshot({ ...case02A, case02_situationMatch: "partial" });
  const afterB = attachCaseResolutionSnapshot({
    ...case02B,
    case02_situationMatch: "match",
    case02_paymentAmount: "stated_clear",
  });
  const nextAfterA = getFirst(getPhase2OnlyQuestions(afterA));
  const nextAfterB = getFirst(getPhase2OnlyQuestions(afterB));

  results.item2 = {
    pass: chainA.join("|") !== chainB.join("|") || nextAfterA?.id !== nextAfterB?.id,
    case02: {
      phase1A: { confirmGoal: case02A.case02_confirmGoal, chain: chainA, first: getFirst(getPhase2OnlyQuestions(case02A)) },
      phase1B: { confirmGoal: case02B.case02_confirmGoal, chain: chainB, first: getFirst(getPhase2OnlyQuestions(case02B)) },
      afterSituationMatchA: nextAfterA,
      afterSituationMatchB: nextAfterB,
    },
  };

  const knownRepeatFailures = [];
  for (const [caseId, answers] of [
    ["CASE_02", case02A],
    ["CASE_03", case03A],
    ["CASE_04", case04A],
    ["CASE_05", case05A],
  ]) {
    const q1Case = getQ1ResolvedCase(answers);
    const phase1Fields = getAdminVerifyPhase1VisibleFields(answers, q1Case ?? "");
    const phase2Ids = new Set(getPhase2OnlyQuestions(answers).map((q) => q.id));
    const repeated = phase1Fields.filter((f) => answers[f]?.trim() && phase2Ids.has(f));
    if (repeated.length) knownRepeatFailures.push({ caseId, repeated });
  }
  results.item3 = { pass: knownRepeatFailures.length === 0, failures: knownRepeatFailures };

  const before = buildCaseResolutionProfile(case02A);
  const afterAnswers = attachCaseResolutionSnapshot({ ...case02A, case02_situationMatch: "partial" });
  const after = buildCaseResolutionProfile(afterAnswers);
  const focusBefore = selectNextCaseResolutionFocus(before, case02A);
  const focusAfter = selectNextCaseResolutionFocus(after, afterAnswers);
  results.item4 = {
    pass:
      after.actualSituation?.status !== before.actualSituation?.status ||
      after.actualSituation?.value !== before.actualSituation?.value ||
      focusBefore?.questionId !== focusAfter?.questionId,
    before: {
      actualSituation: before.actualSituation,
      nextFocus: focusBefore?.questionId,
    },
    after: {
      actualSituation: after.actualSituation,
      nextFocus: focusAfter?.questionId,
    },
    qaScenarioCrossCheck: {
      case02A: runCase02QaScenario("A").nextFocus,
      case02B: runCase02QaScenario("B").nextFocus,
      case03C: runCase03QaScenario("C").nextFocus,
      case04C: runCase04QaScenario("C").nextFocus,
      case05C: runCase05QaScenario("C").nextFocus,
    },
  };

  const pathIncomplete = !isAdminVerifyPhase2PathComplete(case02Phase1Only("A"));
  const remaining = getPhase2OnlyQuestions(case02Phase1Only("A"));
  const nextFocus = selectNextCaseResolutionFocus(
    buildCaseResolutionProfile(case02Phase1Only("A")),
    case02Phase1Only("A"),
  );
  results.item5 = {
    pass: pathIncomplete && remaining.length > 0 && Boolean(nextFocus),
    pathComplete: isAdminVerifyPhase2PathComplete(case02Phase1Only("A")),
    remainingPhase2Count: remaining.length,
    nextFocus: nextFocus?.questionId ?? null,
    remainingIds: remaining.map((q) => q.id),
  };

  return results;
}

function getFirst(list) {
  return list[0] ?? null;
}

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

async function getBodySnippet(page) {
  return page.evaluate(() => document.body.innerText.slice(0, 2000));
}

const PHASE2_QUESTION_MARKERS = [
  { id: "case02_demandAuthority", snip: "납부를 요구한 기관은" },
  { id: "case02_situationMatch", snip: "이 납부 요구가 실제로 본인 상황과" },
  { id: "case02_paymentAmount", snip: "지금 납부하라는 금액에 대해" },
  { id: "case02_paymentBasis", snip: "기관에서는 왜 이 금액을 납부" },
  { id: "case03_factRelationship", snip: "기관이 확인하려는 내용" },
  { id: "case03_inquiryFocus", snip: "기관에서는 무엇에 대해 출석" },
  { id: "case04_initialSubmission", snip: "처음 기관에 어떤 서류" },
  { id: "case04_submissionRelation", snip: "처음 제출했던 자료와 이번에 다시 요구받은" },
  { id: "case05_factRelationship", snip: "처분·조치 통지에 적힌 내용" },
  { id: "case03_authorityDemand", snip: "기관에서 요구하는 것" },
  { id: "case04_supplementTarget", snip: "어떤 서류를 보완" },
  { id: "case05_dispositionType", snip: "어떤 조치·처분" },
];

async function detectPhase2Question(body) {
  return PHASE2_QUESTION_MARKERS.filter((m) => body.includes(m.snip)).map((m) => m.id);
}

/** Item1 — wait until Phase2 question UI is rendered, then read the active first question. */
async function readActivePhase2QuestionFromDom(page) {
  return page.evaluate((markerDefs) => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
    };
    const headings = [...document.querySelectorAll("h3")].filter(visible);
    for (const h of headings) {
      const t = (h.textContent ?? "").trim();
      if (!t || t.includes("검토 내용 체크") || t.includes("행정문서 리뷰 확인서")) continue;
      for (const m of markerDefs) {
        if (t.includes(m.snip)) {
          return { id: m.id, label: t.slice(0, 160) };
        }
      }
      if (t.length >= 12 && !t.includes("QUESTION GUIDE")) {
        for (const m of markerDefs) {
          if (m.snip.includes(t.slice(0, 8)) || t.includes(m.snip.slice(0, 8))) {
            return { id: m.id, label: t.slice(0, 160) };
          }
        }
      }
    }
    const body = document.body.innerText;
    for (const m of markerDefs) {
      if (body.includes(m.snip)) {
        return { id: m.id, label: m.snip };
      }
    }
    return null;
  }, PHASE2_QUESTION_MARKERS);
}

async function waitForActivePhase2Question(page, timeout = 45_000) {
  await page
    .getByText(/2차 · 개인화 검토|추가 상황 확인/)
    .first()
    .waitFor({ state: "visible", timeout })
    .catch(() => {});

  const markerSnips = PHASE2_QUESTION_MARKERS.map((m) => m.snip);
  const deadline = Date.now() + timeout;
  let stitchAdvanceAttempts = 0;
  const maxStitchAdvances = 8;

  while (Date.now() < deadline) {
    const firstQuestion = await readActivePhase2QuestionFromDom(page);
    if (firstQuestion?.id) return firstQuestion;

    const body = await getBodySnippet(page);
    const hasPhase2Counter = /\d{2}\s*\/\s*\d{2}/.test(body);
    if (hasPhase2Counter) {
      const retry = await readActivePhase2QuestionFromDom(page);
      if (retry?.id) return retry;
    }

    if (stitchAdvanceAttempts < maxStitchAdvances) {
      const clicked = await clickFirstStitch(page);
      if (clicked) {
        stitchAdvanceAttempts += 1;
        await page
          .waitForFunction(
            (snips) => {
              const text = document.body.innerText;
              return snips.some((s) => text.includes(s)) || /\d{2}\s*\/\s*\d{2}/.test(text);
            },
            markerSnips,
            { timeout: 5000 },
          )
          .catch(() => {});
        continue;
      }
    }

    await page
      .waitForFunction(
        (snips) => {
          const text = document.body.innerText;
          return snips.some((s) => text.includes(s));
        },
        markerSnips,
        { timeout: 750 },
      )
      .catch(() => {});
  }

  throw new Error("Phase2 first question not detected after UI settle");
}

async function capturePhase2FirstQuestion(page) {
  const firstQuestion = await waitForActivePhase2Question(page);
  const body = await getBodySnippet(page);
  const firstDetected = firstQuestion?.id ? [firstQuestion.id] : await detectPhase2Question(body);
  return { firstQuestion, firstDetected, body };
}

function resolveFirstQuestionId(entry) {
  return entry?.firstQuestion?.id ?? entry?.firstDetected?.[0] ?? null;
}

async function advanceToFirstResult(page, q1, phase1Steps, tag) {
  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(800);
  await clickChoice(page, q1);
  for (const step of phase1Steps) {
    if (await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible().catch(() => false)) {
      break;
    }
    await clickChoice(page, step);
  }
  for (let i = 0; i < 10; i++) {
    if (await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible().catch(() => false)) {
      break;
    }
    if (await page.locator('input[name="name"]').isVisible().catch(() => false)) break;
    if (
      await page
        .getByRole("heading", { name: /간단한 자료가 있으면 함께 첨부/ })
        .isVisible()
        .catch(() => false)
    ) {
      break;
    }
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

async function runBrowserPath(page, pathId, q1, phase1, phase2Clicks = []) {
  await advanceToFirstResult(page, q1, phase1, pathId);
  const ctaOk = await page
    .getByRole("button", { name: /개인화?\s*상세\s*검토\s*하기/ })
    .isVisible()
    .catch(() => false);
  await page.getByRole("button", { name: /개인화?\s*상세\s*검토\s*하기/ }).click();
  const { firstQuestion, firstDetected, body: firstBody } = await capturePhase2FirstQuestion(page);
  const phase1Repeated = phase1.filter((p) => firstBody.includes(p.slice(0, 10)));

  const trace = [{ step: 0, detected: firstDetected, body: firstBody.slice(0, 300) }];
  for (let i = 0; i < phase2Clicks.length + 3; i++) {
    const pick = phase2Clicks[i];
    if (pick) await clickChoice(page, pick).catch(() => {});
    else await clickFirstStitch(page);
    await page.waitForTimeout(700);
    const body = await getBodySnippet(page);
    trace.push({ step: i + 1, detected: await detectPhase2Question(body), body: body.slice(0, 300) });
    if (body.includes("2차 상세검토에 필요한 자료")) break;
  }

  const finalBody = await getBodySnippet(page);
  return {
    pathId,
    ctaOk,
    firstQuestion,
    firstDetected,
    phase1Repeated,
    trace,
    evidenceEarly: finalBody.includes("2차 상세검토에 필요한 자료") && trace.length <= 2,
  };
}

async function runBrowserChecks() {
  const browser = await chromium.launch({ headless: true });
  const out = {};
  try {
    const specs = [
      [
        "CASE_02_A",
        "벌금이나 비용을 납부하라는 내용",
        [
          "교통위반에 대한 벌금",
          "기관에서 말하는 납부 의무가",
          "아직 이 납부 요구에 대해 납부하지 않았습니다",
          "납부해야 하는 날짜를 확인했습니다",
        ],
        ["실제 상황과 일부 다릅니다"],
      ],
      [
        "CASE_02_B",
        "벌금이나 비용을 납부하라는 내용",
        [
          "교통위반에 대한 벌금",
          "통지된 금액이 맞는지",
          "아직 이 납부 요구에 대해 납부하지 않았습니다",
          "납부해야 하는 날짜를 확인했습니다",
        ],
        ["금액 자체가 맞는지"],
      ],
      [
        "CASE_03",
        "출석하거나 설명하라는 내용",
        [
          "왜 출석하거나 설명해야 하는지",
          "정해진 날짜에 반드시 출석해야 하는지",
          "아직 기관에 설명하거나 직접 방문하지 않았습니다",
          "출석하거나 설명해야 하는 날짜를 확인했습니다",
        ],
        [],
      ],
      [
        "CASE_04",
        "추가 서류나 보완을 요구하는 내용",
        [],
        [],
      ],
      [
        "CASE_05",
        "면허의 정지·취소·거부",
        [],
        [],
      ],
    ];

    for (const [pathId, q1, phase1, phase2Clicks] of specs) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      try {
        if (phase1.length === 0) {
          await advanceToFirstResult(page, q1, [], pathId);
          for (let i = 0; i < 12; i++) {
            if (await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible().catch(() => false)) {
              break;
            }
            await clickFirstStitch(page);
          }
          await page.getByRole("button", { name: /개인화?\s*상세\s*검토\s*하기/ }).click();
          const { firstQuestion, firstDetected, body } = await capturePhase2FirstQuestion(page);
          out[pathId] = {
            pathId,
            firstQuestion,
            firstDetected,
            body: body.slice(0, 400),
          };
        } else {
          out[pathId] = await runBrowserPath(page, pathId, q1, phase1, phase2Clicks);
        }
      } catch (e) {
        out[pathId] = { error: String(e) };
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  const firstQuestionIds = {
    CASE_02_A: resolveFirstQuestionId(out.CASE_02_A),
    CASE_02_B: resolveFirstQuestionId(out.CASE_02_B),
    CASE_03: resolveFirstQuestionId(out.CASE_03),
    CASE_04: resolveFirstQuestionId(out.CASE_04),
    CASE_05: resolveFirstQuestionId(out.CASE_05),
  };
  const crossCaseIds = [
    firstQuestionIds.CASE_02_A,
    firstQuestionIds.CASE_03,
    firstQuestionIds.CASE_04,
    firstQuestionIds.CASE_05,
  ].filter(Boolean);
  const distinctCrossCase = new Set(crossCaseIds);
  const case02FirstDiffers = firstQuestionIds.CASE_02_A !== firstQuestionIds.CASE_02_B;
  const case02TraceDiffers =
    JSON.stringify(out.CASE_02_A?.trace?.map((t) => t.detected)) !==
    JSON.stringify(out.CASE_02_B?.trace?.map((t) => t.detected));

  out.item2_browser = {
    pass:
      !out.CASE_02_A?.error &&
      !out.CASE_02_B?.error &&
      case02TraceDiffers,
    traces: {
      A: out.CASE_02_A?.trace?.map((t) => t.detected),
      B: out.CASE_02_B?.trace?.map((t) => t.detected),
    },
  };

  out.item1_browser = {
    pass:
      !out.CASE_02_A?.error &&
      !out.CASE_02_B?.error &&
      !out.CASE_03?.error &&
      !out.CASE_04?.error &&
      !out.CASE_05?.error &&
      Boolean(firstQuestionIds.CASE_02_A) &&
      Boolean(firstQuestionIds.CASE_02_B) &&
      Boolean(firstQuestionIds.CASE_03) &&
      Boolean(firstQuestionIds.CASE_04) &&
      Boolean(firstQuestionIds.CASE_05) &&
      distinctCrossCase.size >= 3 &&
      case02TraceDiffers,
    firstQuestions: {
      CASE_02_A: out.CASE_02_A?.firstQuestion ?? null,
      CASE_02_B: out.CASE_02_B?.firstQuestion ?? null,
      CASE_03: out.CASE_03?.firstQuestion ?? null,
      CASE_04: out.CASE_04?.firstQuestion ?? null,
      CASE_05: out.CASE_05?.firstQuestion ?? null,
    },
    firstQuestionIds,
    case02FirstDiffers,
    case02TraceDiffers,
    CASE_02_A: out.CASE_02_A?.firstDetected,
    CASE_02_B: out.CASE_02_B?.firstDetected,
    crossCase: {
      CASE_03: out.CASE_03?.firstDetected,
      CASE_04: out.CASE_04?.firstDetected,
      CASE_05: out.CASE_05?.firstDetected,
    },
  };
  out.item3_browser = {
    pass: ["CASE_02_A", "CASE_02_B", "CASE_03"].every(
      (k) => !out[k]?.phase1Repeated || out[k].phase1Repeated.length === 0,
    ),
    repeats: {
      CASE_02_A: out.CASE_02_A?.phase1Repeated,
      CASE_02_B: out.CASE_02_B?.phase1Repeated,
    },
  };
  out.item5_browser = {
    pass: !out.CASE_02_A?.evidenceEarly,
    CASE_02_A: out.CASE_02_A?.evidenceEarly,
    traceSteps: out.CASE_02_A?.trace?.length,
  };

  return out;
}

const engine = runEngineChecks();
const browser = await runBrowserChecks();

console.log(
  JSON.stringify(
    {
      engine,
      browser,
      summary: {
        item1: engine.item1.pass && browser.item1_browser.pass ? "PASS" : "FAIL",
        item2: engine.item2.pass && browser.item2_browser.pass ? "PASS" : "FAIL",
        item3: engine.item3.pass && browser.item3_browser.pass ? "PASS" : "FAIL",
        item4: engine.item4.pass ? "PASS" : "FAIL",
        item5: engine.item5.pass && browser.item5_browser.pass ? "PASS" : "FAIL",
      },
    },
    null,
    2,
  ),
);
