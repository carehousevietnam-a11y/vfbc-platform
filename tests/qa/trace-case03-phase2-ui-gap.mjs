/**
 * Trace CASE_03 Browser-equivalent path: why Phase2 stops at 2 questions
 */
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  buildAdminVerifyProfileQuestions,
  buildCaseResolutionProfile,
  isAdminVerifyPhase2PathComplete,
  isCase03PathComplete,
  selectNextCaseResolutionFocus,
} from "../../src/lib/adminVerifyProfiling.ts";

const EMPTY_FOLLOW = {};
const EMPTY_DOCS = { mismatch: [], unknown: [], other: [] };

function getPhase1Ids(answers) {
  const p1 = buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, 1);
  return new Set(p1.map((q) => q.id));
}

function getPhase2Only(answers) {
  const p1Ids = getPhase1Ids(answers);
  const all = buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, 2);
  return all
    .filter((q) => q.id !== ADMIN_CASE_ENTRY_Q1_KEY && !p1Ids.has(q.id))
    .map((q) => ({ id: q.id, label: q.label }));
}

function simulateUiGate(answers) {
  const phase2Only = getPhase2Only(answers);
  const incomplete = phase2Only.filter((q) => !answers[q.id]?.trim());
  const pathComplete = isAdminVerifyPhase2PathComplete(answers);
  const case03Complete = isCase03PathComplete(answers);
  const profile = buildCaseResolutionProfile(answers);
  const next = selectNextCaseResolutionFocus(profile, answers);
  const questionsOnlyComplete = incomplete.length === 0 && pathComplete;
  const awaitingEvidence = incomplete.length === 0 && pathComplete; // simplified UI gate
  return {
    phase2OnlyIds: phase2Only.map((q) => q.id),
    phase2OnlyLabels: phase2Only.map((q) => q.label),
    unanswered: incomplete.map((q) => q.id),
    pathComplete,
    case03Complete,
    questionsOnlyComplete,
    awaitingEvidence,
    nextFocus: next,
    unknowns: profile.unknown ?? [],
    classification: profile.caseClassification?.value,
  };
}

// Browser Phase1 equivalent (from pipeline traces)
let answers = {
  situation: "received_document",
  profileDocumentSource: "court",
  stage: "case",
  [ADMIN_CASE_ENTRY_Q1_KEY]: "attendance_demand",
  case03_authorityDemand: "reason_unclear",
  case03_confirmGoal: "deadline_attendance",
  case03_customerResponse: "none",
  case03_deadline: "uncertain",
};

const trace = [{ stage: "after_phase1", ...simulateUiGate(answers) }];

// Simulate answering phase2 one by one (browser picks)
const phase2Answers = [
  { case03_factRelationship: "mismatch" },
  { case03_inquiryFocus: "specific_incident" },
  { case03_prepRequired: "attendance_only" },
  { case03_blockage: "what_to_do" },
  { case03_evidence: "attendance_notice" },
  { case03_finalGoal: "understand" },
];

for (const patch of phase2Answers) {
  answers = { ...answers, ...patch };
  trace.push({ stage: `after_${Object.keys(patch)[0]}`, ...simulateUiGate(answers) });
}

// Also test: what if user only answers first 2 (browser observed)
const browserTwoOnly = {
  ...answers,
  case03_factRelationship: "mismatch",
  case03_inquiryFocus: "specific_incident",
};
delete browserTwoOnly.case03_prepRequired;
delete browserTwoOnly.case03_blockage;
delete browserTwoOnly.case03_evidence;
delete browserTwoOnly.case03_finalGoal;

const browserStuck = simulateUiGate({
  situation: "received_document",
  profileDocumentSource: "court",
  stage: "case",
  [ADMIN_CASE_ENTRY_Q1_KEY]: "attendance_demand",
  case03_authorityDemand: "reason_unclear",
  case03_confirmGoal: "deadline_attendance",
  case03_customerResponse: "none",
  case03_deadline: "uncertain",
  case03_factRelationship: "mismatch",
  case03_inquiryFocus: "specific_incident",
});

// Full library from engine (CASE03_ANSWER_KEYS phase2 fields)
const libraryPhase2 = [
  "case03_factRelationship",
  "case03_inquiryFocus",
  "case03_explanationDetail",
  "case03_authorityFollowUp",
  "case03_prepRequired",
  "case03_repeatFollowUp",
  "case03_blockage",
  "case03_evidence",
  "case03_finalGoal",
];

console.log(
  JSON.stringify(
    {
      libraryPhase2,
      browserAfterTwoAnswers: browserStuck,
      stepTrace: trace,
      diagnosis: {
        builderShowsAfter2: browserStuck.phase2OnlyIds,
        shouldStillNeed: browserStuck.unanswered,
        pathCompleteAfter2: browserStuck.pathComplete,
        uiWouldShowEvidence: browserStuck.awaitingEvidence,
        uiWouldStallWithEmptyList:
          browserStuck.unanswered.length === 0 && !browserStuck.pathComplete,
      },
    },
    null,
    2,
  ),
);
