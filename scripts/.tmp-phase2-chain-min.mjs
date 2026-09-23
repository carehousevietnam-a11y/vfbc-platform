import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  buildAdminVerifyProfileQuestions,
  isCase03PathComplete,
  isCase04PathComplete,
  isCase05PathComplete,
  isCase06PathComplete,
} from "../src/lib/adminVerifyProfiling.ts";

const emptyFollow = {};
const emptyDocs = { mismatch: [], unknown: [], other: [] };

function phase2CaseQuestionIds(answers, casePrefix) {
  const p1 = buildAdminVerifyProfileQuestions(answers, emptyFollow, emptyDocs, 1);
  const p1Ids = new Set(p1.map((q) => q.id));
  return buildAdminVerifyProfileQuestions(answers, emptyFollow, emptyDocs, 2)
    .filter((q) => q.id.startsWith(casePrefix) && !p1Ids.has(q.id))
    .map((q) => q.id);
}

function firstOpenPhase2Question(answers, casePrefix) {
  const p1 = buildAdminVerifyProfileQuestions(answers, emptyFollow, emptyDocs, 1);
  const p1Ids = new Set(p1.map((q) => q.id));
  const qs = buildAdminVerifyProfileQuestions(answers, emptyFollow, emptyDocs, 2).filter(
    (q) => q.id.startsWith(casePrefix) && !p1Ids.has(q.id),
  );
  for (const q of qs) {
    if (!answers[q.id]) return q;
  }
  return null;
}

function simulatePath(base, isComplete, casePrefix, picks) {
  const answers = { ...base, ...picks };
  const asked = phase2CaseQuestionIds(answers, casePrefix);
  return { complete: isComplete(answers), phase2Ids: asked, answers };
}

const paths = [
  {
    name: "CASE03_min_repeat_deadline_none",
    casePrefix: "case03",
    isComplete: isCase03PathComplete,
    base: {
      [ADMIN_CASE_ENTRY_Q1_KEY]: "attendance_demand",
      case03_authorityDemand: "repeat_demand",
      case03_confirmGoal: "deadline_attendance",
      case03_customerResponse: "none",
      case03_deadline: "specific_date",
    },
    picks: {
      case03_factRelationship: "match",
      case03_prepRequired: "id_documents",
    },
  },
  {
    name: "CASE04_min_deadline_modify_notstarted",
    casePrefix: "case04",
    isComplete: isCase04PathComplete,
    base: {
      [ADMIN_CASE_ENTRY_Q1_KEY]: "supplement_demand",
      case04_supplementTarget: "modify_existing",
      case04_confirmGoal: "deadline",
      case04_customerResponse: "not_started",
      case04_deadline: "specific_date",
    },
    picks: {
      case04_initialSubmission: "complete",
      case04_submissionRelation: "add_missing",
      case04_modifyDetail: "format_issue",
    },
  },
  {
    name: "CASE05_min_effective_suspended_none",
    casePrefix: "case05",
    isComplete: isCase05PathComplete,
    base: {
      [ADMIN_CASE_ENTRY_Q1_KEY]: "disposition_notice",
      case05_dispositionType: "business_suspended",
      case05_confirmGoal: "understand_effective",
      case05_customerResponse: "none",
      case05_deadline: "specific_date",
    },
    picks: { case05_factRelationship: "match" },
  },
  {
    name: "CASE06_min_zero_phase2",
    casePrefix: "case06",
    isComplete: isCase06PathComplete,
    base: {
      [ADMIN_CASE_ENTRY_Q1_KEY]: "unclear",
      case06_documentNature: "violation_notice",
      profilePerceivedIssue: "deadline_unclear",
      profileDocumentSource: "government_agency",
      profileCurrentGoal: "respond_violation",
      profileAuthorityGuidance: "specific_date",
    },
    picks: {},
  },
];

for (const p of paths) {
  const r = simulatePath(p.base, p.isComplete, p.casePrefix, p.picks);
  console.log(p.name, {
    complete: r.complete,
    phase2Count: r.phase2Ids.length,
    phase2Ids: r.phase2Ids,
  });
  let q = firstOpenPhase2Question({ ...p.base, ...p.picks }, p.casePrefix);
  console.log("  nextOpen:", q?.id ?? "(none)");
}
