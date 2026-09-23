/**
 * CASE_01 B / CASE_05 A STOP root-cause audit — read-only engine trace
 */
import {
  attachCaseResolutionSnapshot,
  buildAdminVerifyProfileQuestions,
  buildCaseResolutionProfile,
  isAdminVerifyPhase2PathComplete,
  selectNextCaseResolutionFocus,
  ADMIN_CASE_ENTRY_Q1_KEY,
} from "../../src/lib/adminVerifyProfiling.ts";

const EMPTY_FOLLOW = {};
const EMPTY_DOCS = { mismatch: [], unknown: [], other: [] };

function getPhase2Pending(answers) {
  const p1Ids = new Set(
    buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, 1)
      .filter((q) => q.id !== ADMIN_CASE_ENTRY_Q1_KEY)
      .map((q) => q.id),
  );
  return buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, 2).filter(
    (q) => q.id !== ADMIN_CASE_ENTRY_Q1_KEY && !p1Ids.has(q.id),
  );
}

function profileSnapshot(profile) {
  return {
    classification: profile.caseClassification?.value ?? null,
    authorityClaim: profile.authorityClaim?.value ?? null,
    authorityReason: profile.authorityReason?.value ?? null,
    customerAction: profile.customerAction?.value ?? null,
    authorityResponse: profile.authorityResponse?.value ?? null,
    actualSituation: profile.actualSituation?.value ?? null,
    deadline: profile.deadline?.value ?? null,
    timeline: profile.timeline?.value ?? null,
    currentBlockage: profile.currentBlockage?.value ?? null,
    evidence: profile.evidence?.value ?? null,
    goal: profile.goal?.value ?? null,
    unknowns: (profile.unknowns ?? []).map((u) => u.field ?? u),
  };
}

function traceScenario(name, phase1Base, phase2Steps) {
  let answers = attachCaseResolutionSnapshot({ ...phase1Base });
  const trace = [];

  trace.push({
    step: "after_phase1",
    answers: { ...answers },
    profile: profileSnapshot(buildCaseResolutionProfile(answers)),
    pathComplete: isAdminVerifyPhase2PathComplete(answers),
    nextFocus: selectNextCaseResolutionFocus(buildCaseResolutionProfile(answers), answers),
    pendingP2: getPhase2Pending(answers).map((q) => q.id),
  });

  for (const { id, value, note } of phase2Steps) {
    const patch = { [id]: value };
    if (note) patch[`${id}Note`] = note;
    answers = attachCaseResolutionSnapshot({ ...answers, ...patch });
    trace.push({
      step: `after_${id}`,
      choice: { id, value },
      profile: profileSnapshot(buildCaseResolutionProfile(answers)),
      pathComplete: isAdminVerifyPhase2PathComplete(answers),
      nextFocus: selectNextCaseResolutionFocus(buildCaseResolutionProfile(answers), answers),
      pendingP2: getPhase2Pending(answers).map((q) => q.id),
    });
  }

  return { name, trace };
}

const case01B = traceScenario(
  "CASE_01_B",
  {
    [ADMIN_CASE_ENTRY_Q1_KEY]: "violation_notice",
    situation: "received_document",
    stage: "case",
    case01_violationContent: "traffic",
    case01_confirmGoal: "verify_applicability",
    case01_customerResponded: "none",
    case01_deadline: "uncertain",
  },
  [
    { id: "case01_authorityDemand", value: "payment" },
    { id: "case01_blockage", value: "facts_why" },
  ],
);

const case05A = traceScenario(
  "CASE_05_A",
  {
    [ADMIN_CASE_ENTRY_Q1_KEY]: "disposition_notice",
    situation: "received_document",
    stage: "case",
    profileDocumentSource: "immigration",
    case05_dispositionType: "license_revoked",
    case05_confirmGoal: "understand_reason",
    case05_customerResponse: "none",
    case05_deadline: "uncertain",
  },
  [
    { id: "case05_factRelationship", value: "match" },
    { id: "case05_dispositionReason", value: "violation_claimed" },
  ],
);

console.log(JSON.stringify({ case01B, case05A }, null, 2));
