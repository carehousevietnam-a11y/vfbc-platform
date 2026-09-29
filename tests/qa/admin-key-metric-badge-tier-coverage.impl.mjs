/**
 * P1-6 — Key metric badge tier slot coverage + tier snapshots.
 * Run: npx tsx tests/qa/admin-key-metric-badge-tier-coverage.mjs
 */
import { buildAdminVerifyPersonalizedResult } from "../../src/components/cost-check/AdminVerifyFirstResultPanel.tsx";
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  CASE01_DEADLINE_DATE_KEY,
  CASE02_DEADLINE_DATE_KEY,
  CASE03_DEADLINE_DATE_KEY,
  CASE04_DEADLINE_DATE_KEY,
  CASE05_DEADLINE_DATE_KEY,
  attachCaseResolutionSnapshot,
  getQ1ResolvedCase,
} from "../../src/lib/adminVerifyProfiling.ts";
import {
  resolveAdminVerifyStitchRibbonState,
  resolveKeyMetricBadgeTiers,
} from "../../src/lib/adminVerifyKeyMetricsBuild.ts";

/** 리본용 caution — 카드 tier 배정 제외(기한·날짜 확인 사실). */
const RIBBON_ONLY_CARD_SIGNALS = new Set([
  "납부 기한이 확인된 상태 — 기한 내 확인이 필요함",
  "출석·소명 기한이 확인된 상태 — 기한 내 대응이 필요함",
  "보완 제출 기한이 확인된 상태 — 기한 내 대응이 필요함",
  "처분 관련 대응 기한이 확인된 상태 — 기한 내 대응이 필요함",
  "대응 기한이 확인된 상태 — 기한 내 확인이 필요함",
  "통지서 기한 확인 필요",
]);

const TIER_SNAPSHOTS = {
  "CASE_01 phase2 path": ["caution", "unconfirmed", "ok"],
  "CASE_02 phase2 authority": ["unconfirmed", "caution", "unconfirmed", "unconfirmed"],
  "CASE_04 phase2": ["unconfirmed", "ok", "unconfirmed", "ok"],
};

function runFixture(label, answers) {
  const result = buildAdminVerifyPersonalizedResult(answers);
  const caseKey = getQ1ResolvedCase(answers);
  const resolved = resolveKeyMetricBadgeTiers({
    caseId: caseKey,
    answers,
    unconfirmed: result.unconfirmed,
    cautions: result.cautions,
  });

  const signals = [...result.unconfirmed, ...result.cautions];
  const mustAssign = signals.filter((s) => !RIBBON_ONLY_CARD_SIGNALS.has(s));
  const unassigned = mustAssign.filter((s) => resolved.assignmentBySignal[s] === undefined);

  const ribbon = resolveAdminVerifyStitchRibbonState(result.unconfirmed, result.cautions);

  const assignmentTable = signals.map((signal) => ({
    signal,
    kind: result.unconfirmed.includes(signal) ? "unconfirmed" : "caution",
    slot: resolved.assignmentBySignal[signal] ?? null,
    ribbonOnly: RIBBON_ONLY_CARD_SIGNALS.has(signal),
  }));

  const expectedTiers = TIER_SNAPSHOTS[label];
  const tierSnapshotPass =
    expectedTiers === undefined ||
    (expectedTiers.length === resolved.tiers.length &&
      expectedTiers.every((t, i) => t === resolved.tiers[i]));

  return {
    label,
    caseKey,
    signalCount: signals.length,
    fallbackCount: resolved.fallbackAssigned.length,
    fallbackAssigned: resolved.fallbackAssigned,
    unassigned,
    ribbonOnlySkipped: signals.filter((s) => RIBBON_ONLY_CARD_SIGNALS.has(s)),
    tiers: resolved.tiers,
    ribbon,
    assignmentTable,
    tierSnapshotPass,
    expectedTiers,
  };
}

const fixtures = [
  runFixture("CASE_01 phase1 unsure", attachCaseResolutionSnapshot({
    situation: "received_document",
    stage: "case",
    profileDocumentSource: "traffic",
    [ADMIN_CASE_ENTRY_Q1_KEY]: "violation_notice",
    case01_violationContent: "unsure",
    case01_confirmGoal: "unsure",
    case01_customerResponded: "none",
    case01_deadline: "uncertain",
  })),
  runFixture("CASE_01 phase2 path", attachCaseResolutionSnapshot({
    situation: "received_document",
    stage: "case",
    profileDocumentSource: "traffic",
    [ADMIN_CASE_ENTRY_Q1_KEY]: "violation_notice",
    case01_violationContent: "situation_mismatch",
    case01_confirmGoal: "fact_difference",
    case01_customerResponded: "more_demand",
    case01_deadline: "confirmed",
    [CASE01_DEADLINE_DATE_KEY]: "2026-10-01",
    case01_authorityDemand: "attend_explain",
    case01_actualSituation: "deny",
    case01_evidence: "none",
    case01_blockage: "facts_why",
    case01_factRelationship: "hard_to_explain",
  })),
  runFixture("CASE_02 phase1 uncertain", attachCaseResolutionSnapshot({
    situation: "received_document",
    stage: "case",
    profileDocumentSource: "traffic",
    [ADMIN_CASE_ENTRY_Q1_KEY]: "payment_demand",
    case02_paymentSubject: "unclear",
    case02_paymentInfoSource: "recall_unclear",
    case02_confirmGoal: "unsure",
    case02_paymentStatus: "not_paid",
    case02_deadline: "uncertain",
  })),
  runFixture("CASE_02 phase2 authority", attachCaseResolutionSnapshot({
    situation: "received_document",
    stage: "case",
    profileDocumentSource: "traffic",
    [ADMIN_CASE_ENTRY_Q1_KEY]: "payment_demand",
    case02_paymentSubject: "traffic_fine",
    case02_paymentInfoSource: "written_notice",
    case02_confirmGoal: "verify_amount",
    case02_paymentStatus: "paid_unverified",
    case02_deadline: "confirmed",
    [CASE02_DEADLINE_DATE_KEY]: "2026-09-30",
    case02_situationMatch: "hard_to_judge",
    case02_paymentAmount: "reason_unclear",
    case02_authorityResponse: "no_reply_yet",
    case02_paymentMethod: "unclear",
    case02_nonPaymentNotice: "no_notice",
  })),
  runFixture("CASE_03 phase1", attachCaseResolutionSnapshot({
    situation: "received_document",
    stage: "case",
    profileDocumentSource: "court",
    [ADMIN_CASE_ENTRY_Q1_KEY]: "attendance_demand",
    case03_authorityDemand: "reason_unclear",
    case03_inquiryFocus: "unsure",
    case03_confirmGoal: "unsure",
    case03_customerResponse: "none",
    case03_deadline: "uncertain",
  })),
  runFixture("CASE_03 phase2", attachCaseResolutionSnapshot({
    situation: "received_document",
    stage: "case",
    profileDocumentSource: "court",
    [ADMIN_CASE_ENTRY_Q1_KEY]: "attendance_demand",
    case03_authorityDemand: "specific_incident",
    case03_inquiryFocus: "action_facts",
    case03_confirmGoal: "prepare_materials",
    case03_customerResponse: "attendance",
    case03_deadline: "specific_date",
    [CASE03_DEADLINE_DATE_KEY]: "2026-11-01",
    case03_factRelationship: "unknown",
    case03_authorityFollowUp: "no_response",
    case03_evidence: "none",
    case03_blockage: "why_attend",
  })),
  runFixture("CASE_04 phase1", attachCaseResolutionSnapshot({
    situation: "received_document",
    stage: "case",
    profileDocumentSource: "agency",
    [ADMIN_CASE_ENTRY_Q1_KEY]: "supplement_demand",
    case04_supplementTarget: "unclear",
    case04_confirmGoal: "unsure",
    case04_customerResponse: "not_started",
    case04_deadline: "uncertain",
  })),
  runFixture("CASE_04 phase2", attachCaseResolutionSnapshot({
    situation: "received_document",
    stage: "case",
    profileDocumentSource: "agency",
    [ADMIN_CASE_ENTRY_Q1_KEY]: "supplement_demand",
    case04_supplementTarget: "additional_docs",
    case04_confirmGoal: "prepare_materials",
    case04_customerResponse: "submitted",
    case04_deadline: "specific_date",
    [CASE04_DEADLINE_DATE_KEY]: "2026-12-01",
    case04_submissionRelation: "hard_to_judge",
    case04_supplementReason: "unsure",
    case04_authorityFollowUp: "no_response",
    case04_addDocDetail: "unsure",
  })),
  runFixture("CASE_05 phase1", attachCaseResolutionSnapshot({
    situation: "received_document",
    stage: "case",
    profileDocumentSource: "agency",
    [ADMIN_CASE_ENTRY_Q1_KEY]: "disposition_notice",
    case05_dispositionType: "reason_hard_to_understand",
    case05_confirmGoal: "unsure",
    case05_customerResponse: "none",
    case05_deadline: "uncertain",
  })),
  runFixture("CASE_05 phase2", attachCaseResolutionSnapshot({
    situation: "received_document",
    stage: "case",
    profileDocumentSource: "agency",
    [ADMIN_CASE_ENTRY_Q1_KEY]: "disposition_notice",
    case05_dispositionType: "situation_mismatch",
    case05_confirmGoal: "understand_impact",
    case05_customerResponse: "appeal_requested",
    case05_deadline: "specific_date",
    [CASE05_DEADLINE_DATE_KEY]: "2026-08-15",
    case05_factRelationship: "hard_to_judge",
    case05_dispositionDetail: "unsure",
    case05_authorityFollowUp: "no_response",
    case05_plannedNextStep: "no_concrete_plan",
  })),
];

const coverageFails = fixtures.filter((f) => f.unassigned.length > 0);
const fallbackFails = fixtures.filter((f) => f.fallbackCount > 0);
const snapshotFails = fixtures.filter((f) => !f.tierSnapshotPass);

const pass =
  coverageFails.length === 0 && fallbackFails.length === 0 && snapshotFails.length === 0;

const assignmentRollup = fixtures.flatMap((f) =>
  f.assignmentTable.map((row) => ({ fixture: f.label, ...row })),
);

console.log(
  JSON.stringify(
    {
      pass,
      fixtureCount: fixtures.length,
      totalFallbackUses: fixtures.reduce((n, f) => n + f.fallbackCount, 0),
      fallbackFails: fallbackFails.map((f) => ({
        label: f.label,
        fallbackAssigned: f.fallbackAssigned,
      })),
      coverageFails: coverageFails.map((f) => ({ label: f.label, unassigned: f.unassigned })),
      snapshotFails: snapshotFails.map((f) => ({
        label: f.label,
        expectedTiers: f.expectedTiers,
        actualTiers: f.tiers,
      })),
      assignmentRollup,
      fixtures: fixtures.map((f) => ({
        label: f.label,
        caseKey: f.caseKey,
        ribbon: f.ribbon,
        tiers: f.tiers,
        ribbonOnlySkipped: f.ribbonOnlySkipped,
      })),
    },
    null,
    2,
  ),
);

process.exitCode = pass ? 0 : 1;
