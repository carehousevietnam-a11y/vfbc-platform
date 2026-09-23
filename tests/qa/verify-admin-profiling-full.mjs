/**
 * Full profiling verification — engine traces (no product changes)
 */
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  attachCaseResolutionSnapshot,
  buildAdminVerifyProfileQuestions,
  buildCaseResolutionProfile,
  getQ1ResolvedCase,
  isAdminVerifyPhase2PathComplete,
  isCase01PathComplete,
  isCase02PathComplete,
  isCase03PathComplete,
  isCase04PathComplete,
  isCase05PathComplete,
  isCase06PathComplete,
  resolveCaseReclassificationHandoff,
  runCase01QaScenario,
  runCase02QaScenario,
  runCase03QaScenario,
  runCase04QaScenario,
  runCase05QaScenario,
  runCase06QaScenario,
  selectNextCaseResolutionFocus,
  shouldActivateCase03Path,
} from "../../src/lib/adminVerifyProfiling.ts";

const EMPTY_FOLLOW = {};
const EMPTY_DOCS = { mismatch: [], unknown: [], other: [] };

function phase2Chain(answers) {
  const p1 = buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, 1);
  const p1Ids = new Set(p1.map((q) => q.id));
  return buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, 2)
    .filter((q) => q.id !== ADMIN_CASE_ENTRY_Q1_KEY && !p1Ids.has(q.id))
    .map((q) => q.id);
}

function missingForPath(caseId, answers) {
  const chain = phase2Chain(answers);
  const unanswered = chain.filter((id) => !answers[id]?.trim());
  const handoff = resolveCaseReclassificationHandoff(buildCaseResolutionProfile(answers), answers);
  const next = selectNextCaseResolutionFocus(buildCaseResolutionProfile(answers), answers);
  const pathFns = {
    CASE_01: isCase01PathComplete,
    CASE_02: isCase02PathComplete,
    CASE_03: isCase03PathComplete,
    CASE_04: isCase04PathComplete,
    CASE_05: isCase05PathComplete,
    CASE_06: isCase06PathComplete,
  };
  return {
    q1: answers[ADMIN_CASE_ENTRY_Q1_KEY] ?? null,
    q1Resolved: getQ1ResolvedCase(answers),
    shouldActivate03: shouldActivateCase03Path(answers),
    pathComplete: pathFns[caseId]?.(answers) ?? isAdminVerifyPhase2PathComplete(answers),
    handoffPathComplete: handoff.pathComplete,
    nextFocus: next,
    phase2Chain: chain,
    phase2Unanswered: unanswered,
    profile: {
      classification: buildCaseResolutionProfile(answers).caseClassification,
      unknowns: buildCaseResolutionProfile(answers).unknowns ?? [],
      riskSignals: buildCaseResolutionProfile(answers).riskSignals ?? [],
      goal: buildCaseResolutionProfile(answers).goal,
      evidence: buildCaseResolutionProfile(answers).evidence,
      currentBlockage: buildCaseResolutionProfile(answers).currentBlockage,
    },
  };
}

// CASE_03/05 gap — with vs without Q1
const case03ABase = {
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
const case03CBase = {
  ...case03ABase,
  caseCustomerInput: "기관이 문제 삼는 내용이 실제 상황과 다릅니다",
  case03_authorityDemand: "specific_incident",
  case03_confirmGoal: "understand_agency_intent",
  case03_factRelationship: "mismatch",
};

const case03Investigation = {
  qaScenarioA: runCase03QaScenario("A"),
  qaScenarioC: runCase03QaScenario("C"),
  withoutQ1_A: missingForPath("CASE_03", attachCaseResolutionSnapshot(case03ABase)),
  withQ1_A: missingForPath(
    "CASE_03",
    attachCaseResolutionSnapshot({ ...case03ABase, [ADMIN_CASE_ENTRY_Q1_KEY]: "attendance_demand" }),
  ),
  withoutQ1_C: missingForPath("CASE_03", attachCaseResolutionSnapshot(case03CBase)),
  withQ1_C: missingForPath(
    "CASE_03",
    attachCaseResolutionSnapshot({ ...case03CBase, [ADMIN_CASE_ENTRY_Q1_KEY]: "attendance_demand" }),
  ),
};

const case05Investigation = {
  qaScenarioA: runCase05QaScenario("A"),
  qaScenarioC: runCase05QaScenario("C"),
};

// CASE_01~06 QA scenario pathComplete sweep
const qaSweep = {};
for (const [caseNum, runFn, ids] of [
  ["01", runCase01QaScenario, ["A", "B", "C", "D", "E"]],
  ["02", runCase02QaScenario, ["A", "B", "C", "D", "E"]],
  ["03", runCase03QaScenario, ["A", "B", "C", "D", "E", "F", "G"]],
  ["04", runCase04QaScenario, ["A", "B", "C", "D", "E", "F", "G", "H"]],
  ["05", runCase05QaScenario, ["A", "B", "C", "D", "E", "F", "G"]],
  ["06", runCase06QaScenario, ["A", "B", "C", "D", "E", "F", "G", "H"]],
]) {
  qaSweep[`CASE_${caseNum}`] = {};
  for (const id of ids) {
    const r = runFn(id);
    qaSweep[`CASE_${caseNum}`][id] = {
      pathComplete: r.pathComplete,
      nextFocus: r.nextFocus,
      classification: r.profile.caseClassification?.value,
      unknowns: r.profile.unknowns?.length ?? 0,
      riskSignals: r.profile.riskSignals?.length ?? 0,
    };
  }
}

// UNIVERSAL path — no Q1, no case fields
const universalSamples = [
  {
    label: "pre_submission_only",
    answers: attachCaseResolutionSnapshot({
      situation: "pre_submission",
      stage: "profile",
      caseCustomerInput: "출입국 신청 전에 확인하고 싶습니다",
    }),
  },
  {
    label: "received_document_no_case",
    answers: attachCaseResolutionSnapshot({
      situation: "received_document",
      profileDocumentSource: "other",
      stage: "case",
      caseCustomerInput: "행정기관에서 받은 문서인데 무엇인지 모르겠습니다",
    }),
  },
];
const universal = universalSamples.map((s) => ({
  label: s.label,
  q1Resolved: getQ1ResolvedCase(s.answers),
  pathComplete: isAdminVerifyPhase2PathComplete(s.answers),
  phase1Chain: buildAdminVerifyProfileQuestions(s.answers, EMPTY_FOLLOW, EMPTY_DOCS, 1).map((q) => q.id),
  phase2Chain: phase2Chain(s.answers),
  classification: buildCaseResolutionProfile(s.answers).caseClassification,
}));

console.log(
  JSON.stringify({ case03Investigation, case05Investigation, qaSweep, universal }, null, 2),
);
