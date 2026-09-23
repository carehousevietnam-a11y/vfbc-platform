import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  attachCaseResolutionSnapshot,
  buildAdminVerifyProfileQuestions,
  buildCaseResolutionProfile,
  getEffectiveAdminVerifyCase,
  getQ1ResolvedCase,
  isAdminVerifyPhase2PathComplete,
  isCase06PathComplete,
  isCase02PathComplete,
  isCase03PathComplete,
} from "../src/lib/adminVerifyProfiling.ts";

const emptyFollow = {};
const emptyDocs = { mismatch: [], unknown: [], other: [] };

function phase2QuestionIds(answers) {
  const p1 = buildAdminVerifyProfileQuestions(answers, emptyFollow, emptyDocs, 1);
  const p1Ids = new Set(p1.map((q) => q.id));
  return buildAdminVerifyProfileQuestions(answers, emptyFollow, emptyDocs, 2)
    .filter((q) => q.id !== ADMIN_CASE_ENTRY_Q1_KEY && !p1Ids.has(q.id))
    .map((q) => q.id);
}

function firstOpenPhase2(answers) {
  const p1 = buildAdminVerifyProfileQuestions(answers, emptyFollow, emptyDocs, 1);
  const p1Ids = new Set(p1.map((q) => q.id));
  const qs = buildAdminVerifyProfileQuestions(answers, emptyFollow, emptyDocs, 2).filter(
    (q) => q.id !== ADMIN_CASE_ENTRY_Q1_KEY && !p1Ids.has(q.id),
  );
  for (const q of qs) {
    if (!answers[q.id]?.trim()) return q.id;
  }
  return null;
}

const base06Phase1 = {
  [ADMIN_CASE_ENTRY_Q1_KEY]: "unclear",
  situation: "received_document",
  stage: "case",
  profileDocumentSource: "specific_agency",
  case06_documentNature: "payment_demand",
  profileCurrentGoal: "pay_fee",
  profileAuthorityGuidance: "uncertain",
  profilePerceivedIssue: "what_to_do",
};

const scenarios = [
  { name: "06_p1_only_reclass_02", answers: attachCaseResolutionSnapshot(base06Phase1) },
  {
    name: "06_p1_plus_case06_p2_partial",
    answers: attachCaseResolutionSnapshot({
      ...base06Phase1,
      case06_keyPhrase: "main_body",
      case06_requiredAction: "pay_fee",
    }),
  },
  {
    name: "06_reclass_03_nature",
    answers: attachCaseResolutionSnapshot({
      [ADMIN_CASE_ENTRY_Q1_KEY]: "unclear",
      situation: "received_document",
      stage: "case",
      profileDocumentSource: "government_agency",
      case06_documentNature: "attendance_explain",
      profileCurrentGoal: "attend_explain",
      profileAuthorityGuidance: "specific_date",
      profilePerceivedIssue: "deadline_unclear",
    }),
  },
  {
    name: "06_stays_06_minimal",
    answers: attachCaseResolutionSnapshot({
      [ADMIN_CASE_ENTRY_Q1_KEY]: "unclear",
      situation: "received_document",
      stage: "case",
      profileDocumentSource: "government_agency",
      case06_documentNature: "violation_notice",
      profileCurrentGoal: "respond_violation",
      profileAuthorityGuidance: "specific_date",
      profilePerceivedIssue: "deadline_unclear",
    }),
  },
];

for (const s of scenarios) {
  const a = s.answers;
  const profile = buildCaseResolutionProfile(a);
  const eff = getEffectiveAdminVerifyCase(a, 2);
  const q1 = getQ1ResolvedCase(a);
  const p2Ids = phase2QuestionIds(a);
  const open = firstOpenPhase2(a);
  console.log(
    JSON.stringify(
      {
        scenario: s.name,
        q1Case: q1,
        profileClass: profile.caseClassification?.value,
        effectivePhase2Case: eff,
        isAdminVerifyPhase2PathComplete: isAdminVerifyPhase2PathComplete(a),
        isCase06PathComplete: isCase06PathComplete(a),
        isCase02PathComplete: isCase02PathComplete(a),
        isCase03PathComplete: isCase03PathComplete(a),
        phase2QuestionIds: p2Ids,
        firstOpenPhase2: open,
        uiPhase2AllAnswered: open === null,
        gateMismatch:
          open === null && !isAdminVerifyPhase2PathComplete(a) ? "UI_EMPTY_BUT_GATE_FALSE" : null,
        gateMismatch2:
          open !== null && isAdminVerifyPhase2PathComplete(a) ? "UI_OPEN_BUT_GATE_TRUE" : null,
      },
      null,
      0,
    ),
  );
}
