/**
 * Trace Phase2 entry → builder → profile → next question chain
 * (Engine-only — mirrors Browser state after "개인화 상세 검토하기")
 */
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  attachCaseResolutionSnapshot,
  buildAdminVerifyProfileQuestions,
  buildCaseResolutionProfile,
  getQ1ResolvedCase,
  isAdminVerifyPhase2PathComplete,
  selectNextCaseResolutionFocus,
} from "../../src/lib/adminVerifyProfiling.ts";

const EMPTY_FOLLOW = {};
const EMPTY_DOCS = { mismatch: [], unknown: [], other: [] };

const LIBRARY_PHASE2 = [
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

function getPhase1Ids(answers) {
  const p1 = buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, 1);
  return new Set(p1.map((q) => q.id));
}

function getPhase2Only(answers) {
  const p1Ids = getPhase1Ids(answers);
  return buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, 2)
    .filter((q) => q.id !== ADMIN_CASE_ENTRY_Q1_KEY && !p1Ids.has(q.id))
    .map((q) => ({ id: q.id, label: q.label }));
}

function profileDigest(answers) {
  const profile = buildCaseResolutionProfile(answers);
  const next = selectNextCaseResolutionFocus(profile, answers);
  return {
    classification: profile.caseClassification?.value,
    unknowns: profile.unknown ?? [],
    factSignals: profile.factSignals ?? [],
    nextFocus: next
      ? { questionId: next.questionId, focus: next.focus, reason: next.reason }
      : null,
    pathComplete: isAdminVerifyPhase2PathComplete(answers),
    storedNextFocus: answers._caseNextFocus ?? "",
    case03Active: answers._case03Active,
  };
}

// Phase1 complete answers — browser_equiv path (before CTA click)
let answers = attachCaseResolutionSnapshot({
  situation: "received_document",
  profileDocumentSource: "court",
  stage: "case",
  [ADMIN_CASE_ENTRY_Q1_KEY]: "attendance_demand",
  case03_authorityDemand: "reason_unclear",
  case03_confirmGoal: "deadline_attendance",
  case03_customerResponse: "none",
  case03_deadline: "uncertain",
  _adminProfilingComplete: "1",
});

const phase2Entry = {
  uiStateAfterCta: {
    adminVerifyProfilePhase: 2,
    adminVerifyPhase2EvidenceDone: false,
    adminPhase1Stop: true,
    isAdminVerifyFirstResult: false,
    isAdminVerifyPhase2Review: true,
    isAdminVerifyPhase2QuestionFlow: true,
    builderCalled: "buildAdminVerifyProfileQuestions(answers, …, profilePhase=2)",
  },
  answersAtEntry: {
    q1Case: getQ1ResolvedCase(answers),
    phase1Keys: Object.keys(answers).filter((k) => k.startsWith("case03_")),
    profileSnapshotPresent: Boolean(answers._caseResolutionProfileJson),
  },
  profileAtEntry: profileDigest(answers),
  phase2BuilderOutput: getPhase2Only(answers),
  libraryExcluded: LIBRARY_PHASE2.filter(
    (id) => !getPhase2Only(answers).some((q) => q.id === id),
  ),
};

const answerChain = [];
const picks = [
  { id: "case03_factRelationship", value: "mismatch", labelPick: "실제 상황과 기관이 확인하려는 내용이 상당히 다릅니다" },
  { id: "case03_inquiryFocus", value: "specific_event", labelPick: "특정 날짜·사건·행동" },
  { id: "case03_prepRequired", value: "attendance_only", labelPick: "출석만으로 충분" },
  { id: "case03_blockage", value: "what_explain", labelPick: "무엇을 설명해야" },
  { id: "case03_evidence", value: "notice", labelPick: "통지서" },
  { id: "case03_finalGoal", value: "understand_demand", labelPick: "기관 요구 이해" },
];

for (const pick of picks) {
  const before = profileDigest(answers);
  const beforeQs = getPhase2Only(answers).map((q) => q.id);
  answers = attachCaseResolutionSnapshot({ ...answers, [pick.id]: pick.value });
  const after = profileDigest(answers);
  const afterQs = getPhase2Only(answers).map((q) => q.id);
  const newQs = afterQs.filter((id) => !beforeQs.includes(id));
  answerChain.push({
    answered: pick.id,
    value: pick.value,
    profileBefore: before,
    profileAfter: after,
    builderBefore: beforeQs,
    builderAfter: afterQs,
    newlyAddedToBuilder: newQs,
    nextQuestionFromFocus: after.nextFocus?.questionId ?? null,
    browserWouldShowActive: getPhase2Only(answers).find((q) => !answers[q.id]?.trim())?.id ?? "NONE",
  });
}

const stopState = {
  pathComplete: isAdminVerifyPhase2PathComplete(answers),
  awaitingEvidenceGate:
    isAdminVerifyPhase2PathComplete(answers) /* simplified: phase2OnlyIncomplete === -1 */,
  profile: profileDigest(answers),
  fullPhase2Chain: getPhase2Only(answers),
};

// Alternate entry: restored profile phase 2
const restoredEntry = {
  path: "verifyMasterSeedAnswers[ADMIN_RESTORED_PROFILE_PHASE_KEY]===2",
  alsoSets: "setAdminVerifyProfilePhase(2) + setAdminVerifyPhase2EvidenceDone(...)",
  sameBuilder: true,
};

// Check no alternate builder
const buildersFound = [
  "buildAdminVerifyProfileQuestions — MasterReviewQuotationReport questions useMemo",
  "buildAdminVerifyProfileQuestions — adminVerifyPhase1Questions useMemo (phase=1 only)",
  "buildRealEstatePhase2ProfileQuestions — real-estate only, NOT admin",
];

console.log(
  JSON.stringify(
    {
      phase2Entry,
      answerChain,
      stopState,
      alternateEntryPaths: restoredEntry,
      buildersFound,
      conclusion: {
        latestBuilderUsed: true,
        phase2AtEntryQuestionCount: phase2Entry.phase2BuilderOutput.length,
        stopsAfter2Answers: isAdminVerifyPhase2PathComplete(
          attachCaseResolutionSnapshot({
            ...answers,
            case03_factRelationship: "mismatch",
            case03_inquiryFocus: "specific_event",
            case03_prepRequired: undefined,
            case03_blockage: undefined,
            case03_evidence: undefined,
            case03_finalGoal: undefined,
          }),
        ),
      },
    },
    null,
    2,
  ),
);
