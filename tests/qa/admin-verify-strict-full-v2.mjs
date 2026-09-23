/**
 * Admin VERIFY — engine-driven strict browser QA (product code frozen)
 * Phase1/2 clicks from Engine option labels only — no blind clickFirstStitch
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  ADMIN_CASE_ENTRY_Q1_OPTIONS,
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  getAdminChoiceNoteKey,
  applyCase06BridgeSnapshot,
  attachCaseResolutionSnapshot,
  buildAdminVerifyAnswersPersistMeta,
  buildAdminVerifyProfileQuestions,
  buildCaseResolutionProfile,
  getCase06FieldOptionLabel,
  getEffectiveAdminVerifyCase,
  isAdminCaseEntryQ1Complete,
  isAdminVerifyPhase1Complete,
  isAdminVerifyPhase2PathComplete,
  isCase06AwaitingBridgeSnapshot,
  maybeApplyCase06ExpertTerminalOnAnswer,
  restoreAdminProfilingAnswersFromMeta,
  selectNextCaseResolutionFocus,
} from "../../src/lib/adminVerifyProfiling.ts";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";
const EMPTY_FOLLOW = {};
const EMPTY_DOCS = { mismatch: [], unknown: [], other: [] };

const CASE03_REGRESSION_IDS = [
  "case03_factRelationship",
  "case03_inquiryFocus",
  "case03_prepRequired",
  "case03_blockage",
  "case03_evidence",
  "case03_finalGoal",
];

const CASE03_REGRESSION_IDS_WITHOUT_EVIDENCE = [
  "case03_factRelationship",
  "case03_inquiryFocus",
  "case03_prepRequired",
  "case03_blockage",
  "case03_finalGoal",
];

function case03RegressionPass(browserIds) {
  const serialized = JSON.stringify(browserIds);
  return (
    serialized === JSON.stringify(CASE03_REGRESSION_IDS) ||
    serialized === JSON.stringify(CASE03_REGRESSION_IDS_WITHOUT_EVIDENCE)
  );
}

function baseAnswers(extra = {}) {
  return {
    situation: "received_document",
    profileDocumentSource: "court",
    stage: "case",
    ...extra,
  };
}

function getPhase1IdSet(answers) {
  const p1 = buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, 1);
  return new Set(p1.map((q) => q.id));
}

function getQuestions(answers, phase) {
  return buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, phase);
}

function getPhase2Questions(answers) {
  const p1Ids = getPhase1IdSet(answers);
  return getQuestions(answers, 2).filter(
    (q) => q.id !== ADMIN_CASE_ENTRY_Q1_KEY && !p1Ids.has(q.id),
  );
}

function nextPendingQuestion(answers, phase) {
  const qs = getQuestions(answers, phase);
  const p1Ids = phase === 2 ? getPhase1IdSet(answers) : new Set();
  for (const q of qs) {
    if (q.id === ADMIN_CASE_ENTRY_Q1_KEY && isAdminCaseEntryQ1Complete(answers)) continue;
    if (phase === 2 && (q.id === ADMIN_CASE_ENTRY_Q1_KEY || p1Ids.has(q.id))) continue;
    if (!answers[q.id]?.trim()) return q;
  }
  return null;
}

function pickOption(question, valueOverride) {
  if (valueOverride) {
    const hit = question.options.find((o) => o.value === valueOverride);
    if (hit) return hit;
  }
  return question.options.find((o) => o.value !== "other") ?? question.options[0];
}

function buildClickPlan(initialAnswers, phase, valueOverrides = {}) {
  let answers = attachCaseResolutionSnapshot(initialAnswers);
  const steps = [];
  for (let guard = 0; guard < 40; guard++) {
    const q = nextPendingQuestion(answers, phase);
    if (!q) break;
    const opt = pickOption(q, valueOverrides[q.id]);
    const noteKey = getAdminChoiceNoteKey(q.id);
    const noteOverride = valueOverrides[noteKey];
    steps.push({
      id: q.id,
      label: q.label,
      optionValue: opt.value,
      optionLabel: opt.label,
      noteKey: opt.value === "other" && noteOverride ? noteKey : undefined,
      noteValue: opt.value === "other" && noteOverride ? noteOverride : undefined,
    });
    const patch = { [q.id]: opt.value };
    if (opt.value === "other" && noteOverride) {
      patch[noteKey] = noteOverride;
    }
    answers = attachCaseResolutionSnapshot({ ...answers, ...patch });
  }
  return { steps, answers };
}

function profileSnap(answers) {
  const p = buildCaseResolutionProfile(answers);
  const next = selectNextCaseResolutionFocus(p, answers);
  return {
    classification: p.caseClassification?.value ?? null,
    reclassificationHistory: (p.reclassificationHistory ?? []).map((r) => ({
      from: r.from ?? r.fromCase,
      to: r.to ?? r.toCase,
      reason: r.reason,
    })),
    unknowns: p.unknowns ?? [],
    knownFacts: {
      authorityClaim: p.authorityClaim?.value ?? null,
      customerAction: p.customerAction?.value ?? null,
      actualSituation: p.actualSituation?.value ?? null,
      currentBlockage: p.currentBlockage?.value ?? null,
      evidence: p.evidence?.value ?? null,
      goal: p.goal?.value ?? null,
    },
    nextFocus: next ? { questionId: next.questionId, focus: next.focus } : null,
    pathComplete: isAdminVerifyPhase2PathComplete(answers),
    phase1Complete: isAdminVerifyPhase1Complete(answers),
  };
}

const CASE_CONFIGS = {
  CASE_01: {
    q1: "violation_notice",
    seed: baseAnswers(),
    phase1Overrides: {
      case01_violationContent: "traffic",
      case01_confirmGoal: "verify_applicability",
      case01_customerResponded: "none",
      case01_deadline: "uncertain",
    },
    phase2Overrides: {
      case01_factRelationship: "date_place_wrong",
      case01_authorityDemand: "payment",
      case01_blockage: "facts_why",
      case01_evidence: "notice",
      case01_finalGoal: "verify_facts",
    },
  },
  CASE_02: {
    q1: "payment_demand",
    seed: baseAnswers({ profileDocumentSource: "traffic" }),
    phase1Overrides: {
      case02_paymentSubject: "traffic_fine",
      case02_confirmGoal: "verify_obligation",
      case02_paymentStatus: "not_paid",
      case02_deadline: "uncertain",
    },
    phase2Overrides: {
      case02_demandAuthority: "traffic",
      case02_situationMatch: "partial",
      case02_paymentAmount: "reason_unclear",
      case02_paymentBasis: "violation_stated",
      case02_paymentMethod: "online_portal",
      case02_nonPaymentNotice: "no_notice",
      case02_blockage: "obligation",
      case02_evidence: "yes",
      case02_finalGoal: "verify_obligation",
    },
  },
  CASE_03: {
    q1: "attendance_demand",
    seed: baseAnswers(),
    phase1Overrides: {
      case03_authorityDemand: "reason_unclear",
      case03_confirmGoal: "deadline_attendance",
      case03_customerResponse: "none",
      case03_deadline: "uncertain",
    },
    phase2Overrides: {
      case03_factRelationship: "mismatch",
      case03_inquiryFocus: "specific_event",
      case03_prepRequired: "attendance_only",
      case03_blockage: "what_explain",
      case03_evidence: "notice",
      case03_finalGoal: "understand_demand",
    },
    expectedPhase2Ids: CASE03_REGRESSION_IDS,
  },
  CASE_04: {
    q1: "supplement_demand",
    seed: baseAnswers({ profileDocumentSource: "immigration" }),
    phase1Overrides: {
      case04_supplementTarget: "additional_docs",
      case04_confirmGoal: "understand_materials",
      case04_customerResponse: "not_started",
      case04_deadline: "uncertain",
    },
    phase2Overrides: {},
  },
  CASE_05: {
    q1: "disposition_notice",
    seed: baseAnswers({ profileDocumentSource: "immigration" }),
    phase1Overrides: {
      case05_dispositionType: "rights_ended",
      case05_confirmGoal: "understand_reason",
      case05_customerResponse: "none",
      case05_deadline: "uncertain",
    },
    phase2Overrides: {},
  },
  CASE_06_E: {
    q1: "unclear",
    seed: { situation: "received_document", stage: "case" },
    phase1Overrides: {
      case06_requiredActionCandidate: "pay_demand",
      case06_knowledgeSource: "doc_read_understood",
      case06_sourceChannel: "gov_document_direct",
      case06_deadlineActionPair: "deadline_pay_by_date",
      case06_customerResponse: "no_response_yet",
    },
    case06ChainOverrides: {
      case06_paymentNature: "violation_fine",
      case06_paymentAmountKnown: "approx_amount_known",
      case06_paymentSituationMatch: "match",
      case06_paymentAuthorityCheck: "not_checked_yet",
      case06_paymentResponse: "no_action",
      case06_paymentNonPaymentNotice: "no_notice",
    },
    phase2Overrides: {
      case02_paymentSubject: "traffic_fine",
      case02_paymentInfoSource: "notice_letter",
      case02_situationMatch: "partial",
      case02_paymentAmount: "reason_unclear",
      case02_paymentStatus: "not_paid",
      case02_confirmGoal: "verify_obligation",
      case02_demandAuthority: "traffic",
      case02_paymentBasis: "violation_stated",
      case02_paymentMethod: "online_portal",
      case02_nonPaymentNotice: "no_notice",
      case02_blockage: "obligation",
      case02_evidence: "yes",
      case02_finalGoal: "verify_obligation",
      case02_deadline: "uncertain",
    },
    expectCase06Chain: true,
    expectReclassTo: "CASE_02",
  },
  CASE_06_CHAIN_02: {
    q1: "unclear",
    seed: { situation: "received_document", stage: "case" },
    phase1Overrides: {
      case06_requiredActionCandidate: "attend_explain",
      case06_knowledgeSource: "doc_read_not_understood",
      case06_sourceChannel: "gov_contact_direct",
      case06_deadlineActionPair: "deadline_attend_by_date",
      case06_customerResponse: "inquired_authority",
    },
    case06ChainOverrides: {
      case06_attendanceSubject: "specific_violation",
      case06_attendanceFactMatch: "partial",
      case06_attendanceNoticeDetail: "approx_time_only",
      case06_attendanceResponse: "no_response",
    },
    targetPhase1Overrides: {
      case03_authorityDemand: "reason_unclear",
      case03_confirmGoal: "deadline_attendance",
      case03_customerResponse: "none",
      case03_deadline: "uncertain",
    },
    phase2Overrides: {
      case03_factRelationship: "mismatch",
      case03_inquiryFocus: "specific_event",
      case03_prepRequired: "attendance_only",
      case03_blockage: "what_explain",
      case03_evidence: "notice",
      case03_finalGoal: "understand_demand",
    },
    expectCase06Chain: true,
    expectReclassTo: "CASE_03",
  },
  CASE_06_CHAIN_03: {
    q1: "unclear",
    seed: { situation: "received_document", stage: "case" },
    phase1Overrides: {
      case06_requiredActionCandidate: "submit_supplement",
      case06_knowledgeSource: "explained_without_doc",
      case06_sourceChannel: "via_agent_or_company",
      case06_deadlineActionPair: "deadline_submit_by_date",
      case06_customerResponse: "prepared_or_submitted_docs",
    },
    case06ChainOverrides: {
      case06_submissionRequirement: "add_missing_docs",
      case06_submissionReason: "doc_error_mismatch",
      case06_submissionRelation: "partial",
      case06_submissionResponse: "submitted_partial",
      case06_submissionAuthorityReaction: "more_docs_requested",
      case06_submissionEvidence: "has_messages",
    },
    targetPhase1Overrides: {
      case04_supplementTarget: "additional_docs",
      case04_confirmGoal: "understand_materials",
      case04_customerResponse: "not_started",
      case04_deadline: "uncertain",
    },
    expectCase06Chain: true,
    expectReclassTo: "CASE_04",
  },
  CASE_06_CHAIN_04: {
    q1: "unclear",
    seed: { situation: "received_document", stage: "case" },
    phase1Overrides: {
      case06_requiredActionCandidate: "disposition_notice",
      case06_knowledgeSource: "memory_only_no_doc_now",
      case06_sourceChannel: "gov_document_direct",
      case06_deadlineActionPair: "no_deadline_stated",
      case06_customerResponse: "no_response_yet",
    },
    case06ChainOverrides: {
      case06_dispositionTypeCandidate: "business_suspension",
      case06_dispositionReason: "specific_violation",
      case06_dispositionFactMatch: "insufficient_info",
      case06_dispositionEffectiveDate: "approx_effective_date",
      case06_dispositionResponse: "no_action",
    },
    targetPhase1Overrides: {
      case05_dispositionType: "rights_ended",
      case05_confirmGoal: "understand_reason",
      case05_customerResponse: "none",
      case05_deadline: "uncertain",
    },
    phase2Overrides: {
      case05_factRelationship: "partial",
      case05_dispositionReason: "violation_stated",
      case05_dispositionSource: "immigration",
      case05_authorityFollowUp: "none",
      case05_blockage: "reason",
      case05_evidence: "notice",
      case05_finalGoal: "understand_reason",
    },
    expectCase06Chain: true,
    expectReclassTo: "CASE_05",
  },
  CASE_06_CHAIN_05_EXPERT: {
    q1: "unclear",
    seed: { situation: "received_document", stage: "case" },
    phase1Overrides: {
      case06_requiredActionCandidate: "problem_action_unclear",
      case06_knowledgeSource: "path_unclear",
      case06_sourceChannel: "source_unknown",
      case06_deadlineActionPair: "action_unclear_timing",
      case06_customerResponse: "no_response_yet",
    },
    case06ChainOverrides: {
      case06_unclearContentRecheck: "other",
      case06_unclearContentRecheckNote: "QA direct input — still unclear after recheck",
      case06_unclearFactRelation: "insufficient_info",
      case06_unclearResponse: "no_action",
    },
    expectCase06Chain: true,
    expectExpertHandoff: true,
    phase2Overrides: {},
  },
};

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

async function getActiveQuestionLabel(page) {
  const labels = await page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
    };
    return [...document.querySelectorAll("h3, h4")]
      .filter(visible)
      .map((el) => (el.textContent ?? "").trim())
      .filter(
        (t) =>
          t.length > 12 &&
          !t.includes("검토 내용 체크") &&
          !t.includes("행정문서 리뷰") &&
          !t.includes("간단한 자료") &&
          !/^2\.\s*추가 상황 확인$/.test(t),
      );
  });
  const withQ = labels.filter((t) => t.includes("?"));
  return withQ[withQ.length - 1] ?? labels[labels.length - 1] ?? null;
}

async function fillReactTextarea(page, textarea, text) {
  await textarea.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.type(text, { delay: 3 });
}

async function captureLabelAssertEvidence(page, tag, meta) {
  const outDir = join(process.cwd(), "tests", "qa", "_chain05-capture");
  mkdirSync(outDir, { recursive: true });
  const shot = join(outDir, `${tag}.png`);
  await page.screenshot({ path: shot, fullPage: true });
  const dom = await page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
    };
    const headings = [...document.querySelectorAll("h3, h4")]
      .filter(visible)
      .map((el) => (el.textContent ?? "").trim());
    const nextBtn = [...document.querySelectorAll("button")].find(
      (b) => (b.textContent ?? "").trim() === "다음",
    );
    const ta = document.querySelector("textarea");
    return {
      url: location.href,
      headings,
      progress: (document.body.innerText.match(/\b\d{2}\s*\/\s*\d{2}\b/g) ?? []).slice(0, 4),
      nextButtonDisabled: nextBtn?.disabled ?? null,
      textareaValueLen: ta?.value?.length ?? 0,
      snippet: document.body.innerText.slice(0, 900),
    };
  });
  writeFileSync(
    join(outDir, `${tag}.json`),
    JSON.stringify({ ...meta, screenshot: shot, dom }, null, 2),
  );
  return { shot, dom };
}

function labelsMatch(browserLabel, engineLabel) {
  if (!browserLabel || !engineLabel) return false;
  const a = browserLabel.replace(/\s+/g, "").slice(0, 18);
  const b = engineLabel.replace(/\s+/g, "").slice(0, 18);
  return browserLabel.includes(engineLabel.slice(0, 14)) || engineLabel.includes(browserLabel.slice(0, 14)) || a === b;
}

async function commitAdminDirectExplainNote(page, step) {
  if (!step.noteValue?.trim()) return;

  const openDirectExplainPanel = async () => {
    const directBtn = page.getByRole("button", {
      name: /위에 내용이 없거나|직접 설명하기|직접 입력/,
    });
    if (await directBtn.first().isVisible().catch(() => false)) {
      await directBtn.first().click();
      await page.waitForTimeout(450);
      return;
    }
    await clickChoice(page, step.optionLabel.slice(0, 28));
    await page.waitForTimeout(450);
  };

  const beforeLabel = await getActiveQuestionLabel(page);
  let textarea = page.locator("textarea:visible").first();
  if (!(await textarea.isVisible().catch(() => false))) {
    await openDirectExplainPanel();
  }
  textarea = page.locator("textarea:visible").first();
  await textarea.waitFor({ state: "visible", timeout: 12_000 });
  await fillReactTextarea(page, textarea, step.noteValue);
  const nextBtn = page.getByRole("button", { name: "다음" });
  await page
    .waitForFunction(() => {
      const btn = [...document.querySelectorAll("button")].find(
        (b) => (b.textContent ?? "").trim() === "다음",
      );
      return btn && !btn.disabled;
    })
    .catch(() => undefined);
  await nextBtn.click();
  await page.waitForTimeout(400);
  await page
    .waitForFunction(
      (prev) => {
        const visible = (el) => {
          const r = el.getBoundingClientRect();
          const s = getComputedStyle(el);
          return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
        };
        const labels = [...document.querySelectorAll("h3, h4")]
          .filter(visible)
          .map((el) => (el.textContent ?? "").trim())
          .filter((t) => t.length > 12 && t.includes("?"));
        const active = labels[labels.length - 1] ?? "";
        return active && active !== prev;
      },
      beforeLabel ?? "",
      { timeout: 12_000 },
    )
    .catch(() => undefined);
  await page.waitForTimeout(300);
}

async function runQuestionSteps(page, steps, simAnswers, phase) {
  const trace = [];
  for (const step of steps) {
    const engQ = nextPendingQuestion(simAnswers, phase);
    if (!engQ || engQ.id !== step.id) {
      trace.push({ event: "ENGINE_MISMATCH", expected: step.id, engineNext: engQ?.id ?? null });
      break;
    }
    const browserLabel = await getActiveQuestionLabel(page);
    const labelOk = labelsMatch(browserLabel, step.label);
    const progress = await readProgressUx(page);
    trace.push({
      event: "QUESTION",
      browserLabel,
      engineId: step.id,
      engineLabel: step.label,
      labelMatch: labelOk,
      optionValue: step.optionValue,
      optionLabel: step.optionLabel,
      progress,
      profile: profileSnap(simAnswers),
    });
    if (!labelOk) {
      const evidence = await captureLabelAssertEvidence(page, `label-fail-${step.id}`, {
        event: "LABEL_ASSERT_FAIL",
        browserLabel,
        engineLabel: step.label,
        engineId: step.id,
        progress,
      });
      trace.push({
        event: "LABEL_ASSERT_FAIL",
        browserLabel,
        engineLabel: step.label,
        evidence: { screenshot: evidence.shot, dom: evidence.dom },
      });
      break;
    }
    if (step.noteValue) {
      await commitAdminDirectExplainNote(page, step);
      trace.push({
        event: "POST_DI_COMMIT",
        engineId: step.id,
        browserLabel: await getActiveQuestionLabel(page),
        progress: await readProgressUx(page),
      });
    } else {
      await clickChoice(page, step.optionLabel.slice(0, 28));
    }
    const patch = { [step.id]: step.optionValue };
    if (step.noteKey && step.noteValue) {
      patch[step.noteKey] = step.noteValue;
    }
    simAnswers = attachCaseResolutionSnapshot({ ...simAnswers, ...patch });
    simAnswers = attachCaseResolutionSnapshot(
      maybeApplyCase06ExpertTerminalOnAnswer(simAnswers, step.id),
    );
    trace.push({
      event: "AFTER_ANSWER",
      engineId: step.id,
      profile: profileSnap(simAnswers),
      nextFocus: profileSnap(simAnswers).nextFocus,
      pathComplete: profileSnap(simAnswers).pathComplete,
    });
  }
  return { trace, simAnswers };
}

async function skipPhase1EvidenceIfPresent(page) {
  const skip = page.getByRole("button", { name: /자료 없이 계속하기/ });
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
    await page.waitForTimeout(600);
    return true;
  }
  return false;
}

async function signupIfNeeded(page, tag) {
  await skipPhase1EvidenceIfPresent(page);
  if (await page.locator('input[name="name"]').isVisible().catch(() => false)) {
    const suffix = String(Date.now()).slice(-8);
    await page.locator('input[name="name"]').fill(`QA ${tag}`);
    await page.locator('input[name="phone"]').fill(`090${suffix}`);
    await page.locator('input[name="address"]').fill("Quan 7");
    await page.locator('input[name="email"]').fill(`qa-${tag}-${suffix}@test.vfbcai.local`);
    await page.locator('input[name="kakao_id"]').fill(`qa${suffix}`);
    await page.locator('input[name="agreeTerms"]').check();
    await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
    await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).waitFor({ timeout: 120_000 });
    return true;
  }
  return false;
}

function buildPersistSlugAudit(answers, cfg) {
  const expect = {
    ...(cfg.phase1Overrides ?? {}),
    ...(cfg.case06ChainOverrides ?? {}),
    ...(cfg.targetPhase1Overrides ?? {}),
    ...(cfg.phase2Overrides ?? {}),
  };
  const configuredFields = Object.keys(expect).filter((k) => !k.endsWith("Note"));
  const meta = buildAdminVerifyAnswersPersistMeta(answers);
  const json = meta[ADMIN_VERIFY_ANSWERS_META_JSON_KEY];
  if (!json) {
    return {
      persistSlugPass: configuredFields.length === 0,
      slugChecks: [],
      reason: configuredFields.length ? "empty_persist_payload" : "no_configured_slugs",
    };
  }
  const raw = JSON.parse(json);
  const restored = restoreAdminProfilingAnswersFromMeta({
    [ADMIN_VERIFY_ANSWERS_META_JSON_KEY]: json,
  });
  const profile = buildCaseResolutionProfile(answers);
  const slugChecks = [];
  for (const field of configuredFields) {
    const actualSlug = answers[field]?.trim();
    if (!actualSlug) {
      slugChecks.push({ field, skipped: true, reason: "not_in_sim_answers" });
      continue;
    }
    const effectiveLabel =
      field.startsWith("case06_") ? getCase06FieldOptionLabel(field, actualSlug) : null;
    const effectiveOk =
      !field.startsWith("case06_") ||
      (Boolean(effectiveLabel?.trim()) && effectiveLabel !== actualSlug);
    slugChecks.push({
      field,
      actualSlug,
      persistRaw: raw[field] ?? null,
      restoredRaw: restored?.[field] ?? null,
      effectiveLabel,
      effectiveOk,
      ok: raw[field] === actualSlug && restored?.[field] === actualSlug && effectiveOk,
    });
  }
  const active = slugChecks.filter((c) => !c.skipped);
  return {
    persistSlugPass: active.length > 0 && active.every((c) => c.ok),
    slugChecks,
    profileClassification: profile.caseClassification?.value ?? null,
  };
}

function countTraceEvents(report, eventName) {
  let n = 0;
  for (const value of Object.values(report)) {
    if (!value || typeof value !== "object" || !Array.isArray(value.phase2Trace)) continue;
    n += value.phase2Trace.filter((t) => t.event === eventName).length;
  }
  return n;
}

const LOCK_CASE_01_TO_06_KEYS = [
  "CASE_01",
  "CASE_02",
  "CASE_03",
  "CASE_04",
  "CASE_05",
  "CASE_06_E",
];

const LOCK_CASE_06_CHAIN_KEYS = [
  "CASE_06_CHAIN_02",
  "CASE_06_CHAIN_03",
  "CASE_06_CHAIN_04",
  "CASE_06_CHAIN_05_EXPERT",
];

function resolveLockCaseReport(report, key) {
  if (key === "CASE_03") {
    return report.D_CASE_03_regression ?? report.CASE_03 ?? null;
  }
  return report[key] ?? null;
}

function buildLockReadiness(report) {
  const summarize = (key) => {
    const r = resolveLockCaseReport(report, key);
    return {
      present: Boolean(r),
      error: r?.error ?? null,
      finalPathComplete: r?.finalPathComplete ?? false,
      allLabelMatch: r?.allLabelMatch ?? false,
      persistSlugPass: r?.persistAudit?.persistSlugPass ?? false,
    };
  };
  const cases = {};
  for (const key of [...LOCK_CASE_01_TO_06_KEYS, ...LOCK_CASE_06_CHAIN_KEYS]) {
    cases[key] = summarize(key);
  }
  const trackKeys = [...LOCK_CASE_01_TO_06_KEYS, ...LOCK_CASE_06_CHAIN_KEYS];
  return {
    generatedAt: new Date().toISOString(),
    coreCases: cases,
    engineMismatchCount: countTraceEvents(report, "ENGINE_MISMATCH"),
    labelAssertFailCount: countTraceEvents(report, "LABEL_ASSERT_FAIL"),
    finalPathCompleteAll: LOCK_CASE_01_TO_06_KEYS.every(
      (k) => resolveLockCaseReport(report, k)?.finalPathComplete === true,
    ),
    finalPathCompleteCase06ChainsAll: LOCK_CASE_06_CHAIN_KEYS.every(
      (k) => resolveLockCaseReport(report, k)?.finalPathComplete === true,
    ),
    allLabelMatchAll: trackKeys.every((k) => resolveLockCaseReport(report, k)?.allLabelMatch === true),
    persistSlugPassAll: trackKeys.every(
      (k) => resolveLockCaseReport(report, k)?.persistAudit?.persistSlugPass === true,
    ),
    lockReady:
      LOCK_CASE_01_TO_06_KEYS.every(
        (k) => resolveLockCaseReport(report, k)?.finalPathComplete === true,
      ) &&
      LOCK_CASE_06_CHAIN_KEYS.every(
        (k) => resolveLockCaseReport(report, k)?.finalPathComplete === true,
      ) &&
      trackKeys.every((k) => resolveLockCaseReport(report, k)?.allLabelMatch === true) &&
      trackKeys.every((k) => resolveLockCaseReport(report, k)?.persistAudit?.persistSlugPass === true) &&
      countTraceEvents(report, "ENGINE_MISMATCH") === 0 &&
      countTraceEvents(report, "LABEL_ASSERT_FAIL") === 0,
  };
}

async function readProgressUx(page) {
  return page.evaluate(() => {
    const t = document.body.innerText;
    const m = t.match(/\b(\d{2})\s*\/\s*(\d{2})\b/g);
    return m ? [...new Set(m)].slice(0, 3) : [];
  });
}

async function waitForFirstResultCta(page, timeoutMs = 60_000) {
  const heading = page.getByRole("heading", { name: "행정문서 1차 종합 결과" });
  const cta = page.getByRole("button", { name: /개인화 상세 검토하기/ });
  try {
    await heading.waitFor({ timeout: timeoutMs });
    await cta.waitFor({ timeout: 15_000 });
    return { ok: true };
  } catch {
    const diag = await page.evaluate(() => ({
      url: location.href,
      hasHeading: document.body.innerText.includes("행정문서 1차 종합 결과"),
      hasCta: [...document.querySelectorAll("button")].some((b) =>
        (b.textContent ?? "").includes("개인화"),
      ),
      hasSignup: !!document.querySelector('input[name="name"]'),
      hasEvidence: document.body.innerText.includes("간단한 자료"),
      activeQuestion: [...document.querySelectorAll("h3, h4")]
        .map((el) => (el.textContent ?? "").trim())
        .filter((t) => t.includes("?"))
        .pop(),
      snippet: document.body.innerText.slice(0, 400),
    }));
    return { ok: false, diag };
  }
}

async function runFullCase(page, caseKey, cfg, opts = {}) {
  const q1Opt = ADMIN_CASE_ENTRY_Q1_OPTIONS.find((o) => o.value === cfg.q1);
  const tag = opts.tag ?? caseKey;

  let sim = attachCaseResolutionSnapshot({
    ...cfg.seed,
    [ADMIN_CASE_ENTRY_Q1_KEY]: cfg.q1,
  });

  const phase1Plan = buildClickPlan(sim, 1, cfg.phase1Overrides);
  sim = phase1Plan.answers;

  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(700);

  const phase1Trace = [];
  await clickChoice(page, q1Opt.label.slice(0, 20));
  phase1Trace.push({ step: "Q1", label: q1Opt.label, value: cfg.q1 });

  let phase1LabelFail = null;
  for (const s of phase1Plan.steps.filter((x) => x.id !== ADMIN_CASE_ENTRY_Q1_KEY)) {
    const browserLabel = await getActiveQuestionLabel(page);
    const ok = labelsMatch(browserLabel, s.label);
    const progress = await readProgressUx(page);
    phase1Trace.push({
      id: s.id,
      browserLabel,
      engineLabel: s.label,
      labelMatch: ok,
      pick: s.optionLabel.slice(0, 40),
      progress,
    });
    if (!ok) {
      phase1LabelFail = { id: s.id, browserLabel, engineLabel: s.label };
      break;
    }
    await clickChoice(page, s.optionLabel.slice(0, 28));
    sim = attachCaseResolutionSnapshot({ ...sim, [s.id]: s.optionValue });
  }
  if (phase1LabelFail) {
    return {
      caseKey,
      phase1Trace,
      phase1LabelFail,
      error: "PHASE1_LABEL_ASSERT_FAIL",
    };
  }

  await signupIfNeeded(page, tag);
  if (!(await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible().catch(() => false))) {
    await skipPhase1EvidenceIfPresent(page);
    await signupIfNeeded(page, tag);
  }
  const firstResultGate = await waitForFirstResultCta(page);
  if (!firstResultGate.ok) {
    return {
      caseKey,
      phase1Trace,
      firstResult: { dualCta: false, heading: firstResultGate.diag?.hasHeading ?? false },
      firstResultBlocked: firstResultGate.diag,
      error: "FIRST_RESULT_OR_CTA_NOT_REACHED",
    };
  }

  const profileEntry = {
    point: "A_PHASE2_ENTRY_SIM",
    note: "engine sim after phase1 plan — browser phase2 entry uses live answers",
    profile: profileSnap(sim),
  };

  const firstResult = {
    dualCta: await page.getByRole("button", { name: /개인화 상세 검토하기/ }).isVisible(),
    heading: await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).isVisible(),
  };

  await page.getByRole("button", { name: /개인화 상세 검토하기/ }).click();
  await page.waitForTimeout(900);

  const chainOverrides = cfg.case06ChainOverrides ?? {};
  const phase2ValueOverrides = cfg.expectCase06Chain
    ? chainOverrides
    : { ...(cfg.phase2Overrides ?? {}) };
  const phase2Plan = buildClickPlan(sim, 2, phase2ValueOverrides);
  let { trace: phase2Trace, simAnswers: simAfterP2 } = await runQuestionSteps(
    page,
    phase2Plan.steps,
    sim,
    2,
  );

  if (cfg.expectCase06Chain && isCase06AwaitingBridgeSnapshot(simAfterP2)) {
    const bridgeBtn = page.getByRole("button", {
      name: /확인하고 다음 질문으로 진행|전문가 확인 경로로 진행/,
    });
    if (await bridgeBtn.isVisible().catch(() => false)) {
      await bridgeBtn.click();
      await page.waitForTimeout(800);
    }
    simAfterP2 = attachCaseResolutionSnapshot(
      applyCase06BridgeSnapshot(
        simAfterP2,
        getEffectiveAdminVerifyCase(simAfterP2, 2),
      ),
    );
    phase2Trace.push({ event: "BRIDGE_SNAPSHOT", committed: true });
  }

  const targetNativeOverrides = {
    ...(cfg.targetPhase1Overrides ?? {}),
    ...(cfg.phase2Overrides ?? {}),
  };
  if (Object.keys(targetNativeOverrides).length > 0) {
    const targetPlan = buildClickPlan(simAfterP2, 2, targetNativeOverrides);
    const second = await runQuestionSteps(page, targetPlan.steps, simAfterP2, 2);
    phase2Trace = [...phase2Trace, ...second.trace];
    simAfterP2 = second.simAnswers;
  }

  const profileMid =
    phase2Trace.find((t) => t.event === "AFTER_ANSWER" && t.engineId?.includes("fact") || t.engineId?.includes("situation") || t.engineId?.includes("paymentSubject"))
    ?? phase2Trace.find((t) => t.event === "AFTER_ANSWER");

  const body = await page.evaluate(() => document.body.innerText);
  let evidence = body.includes("2차 상세검토에 필요한 자료");
  let personalized = body.includes("행정문서 개인화 검토 결과");

  const profilePreEvidence = profileSnap(simAfterP2);

  let evidenceDetail = null;
  if (evidence) {
    evidenceDetail = {
      component: "AdminVerifyPhase2EvidencePanel",
      isExistingPanel: true,
      isSeparateDocumentsPage: false,
      adminCopy: body.includes("공문") || body.includes("통지서"),
      referencePageImplemented: false,
      note: "A=Panel in MasterReviewQuotationReport; B=standalone /documents upload UX not at this step",
    };
    await page.getByRole("button", { name: /자료 없이 계속하기/ }).click();
    await page.waitForTimeout(800);
    personalized = await page.getByRole("heading", { name: /행정문서 개인화 검토 결과/ }).isVisible().catch(() => false);
  }

  let documentsAi = null;
  let documentsExpert = null;
  const consoleLogs = [];
  page.on("console", (m) => consoleLogs.push(m.text()));

  if (personalized && opts.testDocumentsAi) {
    const aiBtn = page.getByRole("button", { name: /AI 리포트|AI 검토/ }).first();
    if (await aiBtn.isVisible().catch(() => false)) {
      try {
        await Promise.race([
          page.waitForURL(/\/documents/, { timeout: 12_000 }),
          aiBtn.click().then(() => page.waitForTimeout(12_000)),
        ]);
        documentsAi = page.url().includes("mode=ai_report") ? page.url() : `NO_MODE:${page.url()}`;
      } catch (e) {
        documentsAi = `NOT_VERIFIED — QA ENVIRONMENT: ${String(e.message ?? e).slice(0, 80)}`;
      }
    } else {
      documentsAi = "CTA_NOT_VISIBLE";
    }
  }

  if (personalized && opts.testDocumentsExpert) {
    const exBtn = page.getByRole("button", { name: /전문가/ }).first();
    if (await exBtn.isVisible().catch(() => false)) {
      try {
        await Promise.race([
          page.waitForURL(/\/documents/, { timeout: 12_000 }),
          exBtn.click().then(() => page.waitForTimeout(12_000)),
        ]);
        documentsExpert = page.url().includes("mode=expert") ? page.url() : `NO_MODE:${page.url()}`;
      } catch (e) {
        documentsExpert = `NOT_VERIFIED — QA ENVIRONMENT: ${String(e.message ?? e).slice(0, 80)}`;
      }
    } else {
      documentsExpert = "CTA_NOT_VISIBLE";
    }
  }

  const browserIds = phase2Trace.filter((t) => t.event === "QUESTION").map((t) => t.engineId);
  const reclass = profilePreEvidence.reclassificationHistory;
  const persistAudit = buildPersistSlugAudit(simAfterP2, cfg);

  return {
    caseKey,
    phase1Trace,
    firstResult,
    profileSnapshots: {
      A_phase2Entry: profileEntry,
      B_midPhase2: profileMid?.profile ?? null,
      C_preEvidence: profilePreEvidence,
    },
    phase2Trace,
    browserIds,
    phase2Count: browserIds.length,
    allLabelMatch: phase2Trace.filter((t) => t.event === "QUESTION").every((t) => t.labelMatch),
    evidence,
    evidenceDetail,
    personalized,
    documentsAi,
    documentsExpert,
    consoleSnippet: consoleLogs.slice(-5),
    reclassificationHistory: reclass,
    reclassToCase02: reclass.some((r) => r.to === "CASE_02"),
    case02Phase2InBrowser: browserIds.some((id) => id.startsWith("case02_")),
    case06Phase2InBrowser: browserIds.some((id) => id.startsWith("case06_")),
    expertHandoff: Boolean(cfg.expectExpertHandoff),
    finalPathComplete: profilePreEvidence.pathComplete,
    finalClassification: profilePreEvidence.classification,
    progressUx: [
      ...new Set(
        phase2Trace
          .filter((t) => t.event === "QUESTION" && t.progress?.length)
          .flatMap((t) => t.progress),
      ),
    ],
    persistAudit,
  };
}

const report = { script: "admin-verify-strict-full-v2.mjs", productCodeChanged: false };
const browser = await chromium.launch({ headless: true });

try {
  if (process.env.STRICT_CASE_FILTER) {
    const p06 = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const key = process.env.STRICT_CASE_FILTER;
    try {
      report[key] = await runFullCase(p06, key, CASE_CONFIGS[key]);
    } catch (e) {
      report[key] = { error: String(e.message ?? e) };
    }
    await p06.close();
  } else {
  // CASE_03 regression desktop
  const d03 = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  report.D_CASE_03_regression = await runFullCase(d03, "CASE_03", CASE_CONFIGS.CASE_03, {
    testDocumentsAi: true,
  });
  report.D_CASE_03_regression.regressionPass = case03RegressionPass(
    report.D_CASE_03_regression.browserIds,
  );
  await d03.close();

  const d03ex = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  try {
    const exRun = await runFullCase(d03ex, "CASE_03_EXPERT", CASE_CONFIGS.CASE_03, {
      tag: "d03ex",
      testDocumentsExpert: true,
    });
    report.J_documents_expert_desktop = {
      documentsExpert: exRun.documentsExpert,
      personalized: exRun.personalized,
      regressionIds: exRun.browserIds,
    };
  } catch (e) {
    report.J_documents_expert_desktop = { error: String(e.message ?? e) };
  }
  await d03ex.close();

  for (const key of ["CASE_01", "CASE_02", "CASE_03", "CASE_04", "CASE_05"]) {
    const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    try {
      report[key] = await runFullCase(p, key, CASE_CONFIGS[key]);
    } catch (e) {
      report[key] = { error: String(e.message ?? e) };
    }
    await p.close();
  }

  const case06Keys = process.env.STRICT_CASE_FILTER
    ? [process.env.STRICT_CASE_FILTER]
    : [
        "CASE_06_E",
        "CASE_06_CHAIN_02",
        "CASE_06_CHAIN_03",
        "CASE_06_CHAIN_04",
        "CASE_06_CHAIN_05_EXPERT",
      ];
  for (const case06Key of case06Keys) {
    const p06 = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    try {
      report[case06Key] = await runFullCase(p06, case06Key, CASE_CONFIGS[case06Key]);
    } catch (e) {
      report[case06Key] = { error: String(e.message ?? e) };
    }
    await p06.close();
  }

  const mob = await browser.newPage({ viewport: { width: 375, height: 812 } });
  try {
    report.L_mobile_CASE_03 = await runFullCase(mob, "CASE_03_MOBILE", CASE_CONFIGS.CASE_03, {
      tag: "m03",
      testDocumentsExpert: true,
    });
    report.L_mobile_CASE_03.overflow = await mob.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    );
    report.L_mobile_CASE_03.regressionPass = case03RegressionPass(
      report.L_mobile_CASE_03.browserIds,
    );
  } catch (e) {
    report.L_mobile_CASE_03 = { error: String(e.message ?? e) };
  }
  await mob.close();
  }
} finally {
  await browser.close();
}

report.LOCK_READINESS = buildLockReadiness(report);
const lockPath = join(process.cwd(), "tests", "qa", "_strict-v2-lock-final.json");
writeFileSync(lockPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ lockPath, LOCK_READINESS: report.LOCK_READINESS }, null, 2));
