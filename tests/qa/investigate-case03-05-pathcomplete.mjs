/**
 * Investigation only — CASE_03/05 pathComplete gap trace
 */
import {
  attachCaseResolutionSnapshot,
  buildAdminVerifyProfileQuestions,
  buildCaseResolutionProfile,
  runCase03QaScenario,
  runCase05QaScenario,
  selectNextCaseResolutionFocus,
  isCase03PathComplete,
  isCase05PathComplete,
} from "../../src/lib/adminVerifyProfiling.ts";

const EMPTY_FOLLOW = {};
const EMPTY_DOCS = { mismatch: [], unknown: [], other: [] };

function getPhase2Chain(answers) {
  const phase1 = buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, 1);
  const phase1Ids = new Set(phase1.map((q) => q.id));
  const all = buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, 2);
  return all
    .filter((q) => q.id !== "adminCaseEntryQ1" && !phase1Ids.has(q.id))
    .map((q) => ({ id: q.id, label: q.label }));
}

function listCaseAnswers(answers, prefix) {
  return Object.keys(answers)
    .filter((k) => k.startsWith(prefix) && answers[k]?.trim())
    .sort();
}

function analyze(label, rawAnswers, runFn) {
  const handoff = runFn(label);
  const answers = attachCaseResolutionSnapshot(rawAnswers);
  const profile = buildCaseResolutionProfile(answers);
  const next = selectNextCaseResolutionFocus(profile, answers);
  const chain = getPhase2Chain(answers);
  const missing = chain.filter((q) => !answers[q.id]?.trim()).map((q) => q.id);
  const pathFn =
    label.startsWith("03") ? isCase03PathComplete(answers) : isCase05PathComplete(answers);

  return {
    label,
    handoffPathComplete: handoff.pathComplete,
    handoffNextFocus: handoff.nextFocus,
    isPathComplete: pathFn,
    nextFocusDetail: next,
    classification: profile.caseClassification,
    knownFacts: {
      authorityClaim: profile.authorityClaim,
      authorityReason: profile.authorityReason,
      actualSituation: profile.actualSituation,
      customerAction: profile.customerAction,
      authorityResponse: profile.authorityResponse,
      deadline: profile.deadline,
      currentBlockage: profile.currentBlockage,
      evidence: profile.evidence,
      goal: profile.goal,
    },
    unknowns: profile.unknowns ?? [],
    riskSignals: profile.riskSignals ?? [],
    answersSet: listCaseAnswers(answers, label.startsWith("03") ? "case03_" : "case05_"),
    phase2Chain: chain.map((q) => q.id),
    phase2Missing: missing,
    factSignals: handoff.factSignals ?? handoff.dispositionSignals ?? null,
  };
}

const case03A = {
  situation: "received_document",
  profileDocumentSource: "court",
  stage: "case",
  caseCustomerInput: "기관에서 출석하라고만 통보를 받았습니다",
  case03_authorityDemand: "prep_unclear",
  case03_confirmGoal: "deadline_attendance",
  case03_customerResponse: "none",
  case03_prepRequired: "attendance_only",
  case03_deadline: "uncertain",
};

const case03C = {
  situation: "received_document",
  profileDocumentSource: "court",
  stage: "case",
  caseCustomerInput: "기관이 문제 삼는 내용이 실제 상황과 다릅니다",
  case03_authorityDemand: "specific_incident",
  case03_confirmGoal: "understand_agency_intent",
  case03_customerResponse: "none",
  case03_prepRequired: "attendance_only",
  case03_deadline: "uncertain",
  case03_factRelationship: "mismatch",
};

const case05A = {
  situation: "received_document",
  profileDocumentSource: "immigration",
  profileReceivedReason: "review_request",
  stage: "case",
  caseCustomerInput: "출입국에서 허가가 취소되었다는 처분 통지를 받았습니다",
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

const results = [
  analyze("03A", case03A, () => runCase03QaScenario("A")),
  analyze("03C", case03C, () => runCase03QaScenario("C")),
  analyze("05A", case05A, () => runCase05QaScenario("A")),
];

console.log(JSON.stringify(results, null, 2));
