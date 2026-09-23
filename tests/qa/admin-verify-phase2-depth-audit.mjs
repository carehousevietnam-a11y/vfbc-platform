/**
 * Phase2 Personalized Investigation Depth Audit — engine evidence only
 * No product code changes.
 */
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  attachCaseResolutionSnapshot,
  buildAdminVerifyProfileQuestions,
  buildCaseResolutionProfile,
  getAdminChoiceNoteKey,
  getEffectiveAdminVerifyCase,
  getQ1ResolvedCase,
  isAdminVerifyChoiceFieldComplete,
  isAdminVerifyPhase2PathComplete,
  runCase01QaScenario,
  runCase02QaScenario,
  runCase03QaScenario,
  runCase04QaScenario,
  runCase05QaScenario,
  runCase06QaScenario,
  selectNextCaseResolutionFocus,
} from "../../src/lib/adminVerifyProfiling.ts";

const EMPTY_FOLLOW = {};
const EMPTY_DOCS = { mismatch: [], unknown: [], other: [] };

function getPhase1Questions(answers) {
  return buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, 1).filter(
    (q) => q.id !== ADMIN_CASE_ENTRY_Q1_KEY,
  );
}

function getPhase2Questions(answers) {
  const p1Ids = new Set(getPhase1Questions(answers).map((q) => q.id));
  return buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, 2).filter(
    (q) => q.id !== ADMIN_CASE_ENTRY_Q1_KEY && !p1Ids.has(q.id),
  );
}

function profileDigest(profile) {
  return {
    classification: profile.caseClassification?.value ?? null,
    unknownCount: (profile.unknowns ?? []).length,
    unknowns: (profile.unknowns ?? []).slice(0, 6),
    authorityClaim: profile.authorityClaim?.value?.slice(0, 60) ?? null,
    customerAction: profile.customerAction?.value?.slice(0, 60) ?? null,
    actualSituation: profile.actualSituation?.value?.slice(0, 60) ?? null,
    currentBlockage: profile.currentBlockage?.value?.slice(0, 60) ?? null,
    evidence: profile.evidence?.value?.slice(0, 60) ?? null,
    goal: profile.goal?.value?.slice(0, 60) ?? null,
  };
}

function pickDefaultOption(question) {
  const nonOther = question.options?.find((o) => o.value !== "other");
  return nonOther ?? question.options?.[0];
}

function simulatePhase2Chain(phase1Answers, overrides = {}) {
  let answers = attachCaseResolutionSnapshot({ ...phase1Answers, ...overrides });
  const steps = [];
  const phase1Labels = new Map(
    getPhase1Questions(answers).map((q) => [q.id, q.label]),
  );

  for (let guard = 0; guard < 30; guard++) {
    const pending = getPhase2Questions(answers).find((q) => {
      const val = answers[q.id]?.trim() ?? "";
      if (!val) return true;
      if (val === "other" && q.options) {
        return !isAdminVerifyChoiceFieldComplete(q.id, answers, q.options);
      }
      return false;
    });
    if (!pending) break;

    const before = profileDigest(buildCaseResolutionProfile(answers));
    const focusBefore = selectNextCaseResolutionFocus(
      buildCaseResolutionProfile(answers),
      answers,
    )?.questionId;

    const opt =
      overrides[pending.id]
        ? pending.options.find((o) => o.value === overrides[pending.id])
        : pickDefaultOption(pending);

    const patch = { [pending.id]: opt.value };
    if (opt.value === "other") {
      const noteKey = getAdminChoiceNoteKey(pending.id);
      patch[noteKey] =
        overrides[noteKey] ??
        "교통국 안내와 제 실제 상황이 달라 직접 설명이 필요합니다. 날짜와 장소도 다릅니다.";
    }

    answers = attachCaseResolutionSnapshot({ ...answers, ...patch });
    const after = profileDigest(buildCaseResolutionProfile(answers));
    const focusAfter = selectNextCaseResolutionFocus(
      buildCaseResolutionProfile(answers),
      answers,
    )?.questionId;

    const phase1Dup =
      phase1Labels.has(pending.id) ||
      getPhase1Questions(phase1Answers).some((p1) => {
        const a = (p1.label ?? "").replace(/\s+/g, "").slice(0, 24);
        const b = (pending.label ?? "").replace(/\s+/g, "").slice(0, 24);
        return a === b;
      });

    steps.push({
      id: pending.id,
      label: pending.label,
      value: opt.value,
      phase1FieldRepeat: phase1Dup,
      profileChanged: JSON.stringify(before) !== JSON.stringify(after),
      unknownDelta: before.unknownCount - after.unknownCount,
      focusBefore,
      focusAfter,
      classification: after.classification,
    });
  }

  return {
    effectiveCase: getEffectiveAdminVerifyCase(answers, 2),
    q1Case: getQ1ResolvedCase(answers),
    chainIds: steps.map((s) => s.id),
    steps,
    pathComplete: isAdminVerifyPhase2PathComplete(answers),
    finalProfile: profileDigest(buildCaseResolutionProfile(answers)),
  };
}

const SCENARIOS = {
  CASE_01: {
    A: {
      [ADMIN_CASE_ENTRY_Q1_KEY]: "violation_notice",
      situation: "received_document",
      stage: "case",
      case01_violationContent: "situation_mismatch",
      case01_confirmGoal: "fact_difference",
      case01_customerResponded: "explained_unresolved",
      case01_deadline: "uncertain",
    },
    B: {
      [ADMIN_CASE_ENTRY_Q1_KEY]: "violation_notice",
      situation: "received_document",
      stage: "case",
      case01_violationContent: "traffic",
      case01_confirmGoal: "verify_applicability",
      case01_customerResponded: "none",
      case01_deadline: "uncertain",
    },
  },
  CASE_02: {
    A: {
      [ADMIN_CASE_ENTRY_Q1_KEY]: "payment_demand",
      situation: "received_document",
      stage: "case",
      profileDocumentSource: "traffic",
      case02_paymentSubject: "traffic_fine",
      case02_confirmGoal: "verify_obligation",
      case02_paymentStatus: "not_paid",
      case02_deadline: "uncertain",
    },
    B: {
      [ADMIN_CASE_ENTRY_Q1_KEY]: "payment_demand",
      situation: "received_document",
      stage: "case",
      profileDocumentSource: "traffic",
      case02_paymentSubject: "traffic_fine",
      case02_confirmGoal: "verify_amount",
      case02_paymentStatus: "partial",
      case02_deadline: "uncertain",
    },
  },
  CASE_03: {
    A: {
      [ADMIN_CASE_ENTRY_Q1_KEY]: "attendance_demand",
      situation: "received_document",
      stage: "case",
      case03_authorityDemand: "reason_unclear",
      case03_confirmGoal: "deadline_attendance",
      case03_customerResponse: "none",
      case03_deadline: "uncertain",
    },
    B: {
      [ADMIN_CASE_ENTRY_Q1_KEY]: "attendance_demand",
      situation: "received_document",
      stage: "case",
      case03_authorityDemand: "specific_incident",
      case03_confirmGoal: "understand_agency_intent",
      case03_customerResponse: "attendance",
      case03_deadline: "uncertain",
    },
  },
  CASE_04: {
    A: {
      [ADMIN_CASE_ENTRY_Q1_KEY]: "supplement_demand",
      situation: "received_document",
      stage: "case",
      profileDocumentSource: "immigration",
      case04_supplementTarget: "additional_docs",
      case04_confirmGoal: "understand_materials",
      case04_customerResponse: "not_started",
      case04_deadline: "uncertain",
    },
    B: {
      [ADMIN_CASE_ENTRY_Q1_KEY]: "supplement_demand",
      situation: "received_document",
      stage: "case",
      profileDocumentSource: "immigration",
      case04_supplementTarget: "repeat_demand",
      case04_confirmGoal: "repeat_reason",
      case04_customerResponse: "submitted",
      case04_deadline: "uncertain",
    },
  },
  CASE_05: {
    A: {
      [ADMIN_CASE_ENTRY_Q1_KEY]: "disposition_notice",
      situation: "received_document",
      stage: "case",
      profileDocumentSource: "immigration",
      case05_dispositionType: "license_revoked",
      case05_confirmGoal: "understand_reason",
      case05_customerResponse: "none",
      case05_deadline: "uncertain",
    },
    B: {
      [ADMIN_CASE_ENTRY_Q1_KEY]: "disposition_notice",
      situation: "received_document",
      stage: "case",
      profileDocumentSource: "immigration",
      case05_dispositionType: "unclear",
      case05_confirmGoal: "understand_reason",
      case05_customerResponse: "explanation_submitted",
      case05_deadline: "uncertain",
    },
  },
  CASE_06: {
    A: {
      [ADMIN_CASE_ENTRY_Q1_KEY]: "unclear",
      situation: "received_document",
      stage: "case",
      case06_documentNature: "hard_to_classify",
      profilePerceivedIssue: "overall_unclear",
      profileDocumentSource: "unknown_agency",
      profileCurrentGoal: "hard_to_tell",
      profileAuthorityGuidance: "not_stated",
    },
    B: {
      [ADMIN_CASE_ENTRY_Q1_KEY]: "unclear",
      situation: "received_document",
      stage: "case",
      case06_documentNature: "payment_demand",
      profilePerceivedIssue: "what_to_do",
      profileDocumentSource: "specific_agency",
      profileCurrentGoal: "pay_fee",
      profileAuthorityGuidance: "uncertain",
    },
  },
};

const report = { cases: {}, directInput: {}, reclass: {}, qaScenarios: {} };

for (const [caseKey, variants] of Object.entries(SCENARIOS)) {
  const simA = simulatePhase2Chain(variants.A);
  const simB = simulatePhase2Chain(variants.B);
  const adaptiveDiff = simA.chainIds.join("|") !== simB.chainIds.join("|");
  const phase1Repeat = [...simA.steps, ...simB.steps].some((s) => s.phase1FieldRepeat);
  const allProfileChange = [...simA.steps, ...simB.steps].every((s) => s.profileChanged);
  const anyUnknownReduce = [...simA.steps, ...simB.steps].some((s) => s.unknownDelta > 0);

  report.cases[caseKey] = {
    scenarioA: { phase1: variants.A, ...simA },
    scenarioB: { phase1: variants.B, ...simB },
    adaptiveDiff,
    phase1RepeatInChain: phase1Repeat,
    allStepsProfileChange: allProfileChange,
    unknownReduced: anyUnknownReduce,
  };
}

// Direct input branch divergence — CASE_02 situationMatch other vs partial
{
  const base = SCENARIOS.CASE_02.A;
  const withPartial = simulatePhase2Chain(base, {
    case02_situationMatch: "partial",
  });
  const withDirect = simulatePhase2Chain(base, {
    case02_situationMatch: "other",
    case02_situationMatchNote:
      "통지 금액과 실제 과태료 고지 내용이 다르고 납부 기한도 다르게 안내 받았습니다.",
  });
  const afterPartialIdx = withPartial.chainIds.indexOf("case02_paymentBasis");
  const afterDirectIdx = withDirect.chainIds.indexOf("case02_paymentBasis");
  report.directInput = {
    partialChain: withPartial.chainIds,
    directChain: withDirect.chainIds,
    directNoteStored: Boolean(
      attachCaseResolutionSnapshot({
        ...base,
        case02_situationMatch: "other",
        case02_situationMatchNote: "test note long enough for profile",
      }).case02_situationMatchNote,
    ),
    profileDiffers:
      JSON.stringify(withPartial.finalProfile) !== JSON.stringify(withDirect.finalProfile),
    nextQuestionAfterMatch: {
      partial: withPartial.steps.find((s) => s.id === "case02_situationMatch")?.focusAfter,
      direct: withDirect.steps.find((s) => s.id === "case02_situationMatch")?.focusAfter,
    },
  };
}

// CASE_06 reclassification signals
{
  const e = runCase06QaScenario("E");
  const f = runCase06QaScenario("F");
  const b = runCase06QaScenario("B");
  report.reclass = {
    E_payment: {
      classification: e.profile.caseClassification?.value,
      nextFocus: e.nextFocus?.questionId,
      pathComplete: e.pathComplete,
    },
    F_attendance: {
      classification: f.profile.caseClassification?.value,
      nextFocus: f.nextFocus?.questionId,
    },
    B_supplement: {
      classification: b.profile.caseClassification?.value,
      nextFocus: b.nextFocus?.questionId,
    },
    simB: report.cases.CASE_06.scenarioB,
  };
}

report.qaScenarios = {
  case01A: runCase01QaScenario("A").profile.caseClassification?.value,
  case01D: runCase01QaScenario("D").profile.caseClassification?.value,
  case02A: runCase02QaScenario("A").nextFocus?.questionId,
  case02B: runCase02QaScenario("B").nextFocus?.questionId,
  case02D: runCase02QaScenario("D").nextFocus?.questionId,
  case03A: runCase03QaScenario("A").nextFocus?.questionId,
  case03C: runCase03QaScenario("C").nextFocus?.questionId,
  case04A: runCase04QaScenario("A").nextFocus?.questionId,
  case05B: runCase05QaScenario("B").nextFocus?.questionId,
  case06E: runCase06QaScenario("E").profile.caseClassification?.value,
};

console.log(JSON.stringify(report, null, 2));
