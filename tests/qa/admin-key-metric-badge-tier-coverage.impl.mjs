/**
 * P1-6 — Key metric badge tier slot coverage + ribbon invariants.
 * Run: npx tsx tests/qa/admin-key-metric-badge-tier-coverage.mjs
 */
import { buildAdminVerifyPersonalizedResult } from "../../src/components/cost-check/AdminVerifyFirstResultPanel.tsx";
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  CASE01_DEADLINE_DATE_KEY,
  CASE02_DEADLINE_DATE_KEY,
  CASE02_PAYMENT_AMOUNT_DETAIL_KEY,
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

function assertInvariant(ribbon, tiers, label) {
  const hasUnconfirmed = tiers.some((t) => t === "unconfirmed");
  const hasCaution = tiers.some((t) => t === "caution");
  if (ribbon === "C") {
    if (hasUnconfirmed || hasCaution) {
      return { ok: false, reason: `${label}: ribbon C but tier has unconfirmed/caution`, ribbon, tiers };
    }
  } else if (ribbon === "A") {
    if (!hasUnconfirmed) {
      return { ok: false, reason: `${label}: ribbon A but no unconfirmed tier`, ribbon, tiers };
    }
  } else if (ribbon === "B") {
    if (hasUnconfirmed || !hasCaution) {
      return {
        ok: false,
        reason: `${label}: ribbon B needs caution≥1 & unconfirmed 0`,
        ribbon,
        tiers,
      };
    }
  }
  return { ok: true };
}

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
  const unassigned = signals.filter((s) => resolved.assignmentBySignal[s] === undefined);

  const ribbon = resolveAdminVerifyStitchRibbonState(result.unconfirmed, result.cautions);
  const inv = assertInvariant(ribbon, resolved.tiers, label);

  return {
    label,
    caseKey,
    signalCount: signals.length,
    fallbackCount: resolved.fallbackAssigned.length,
    fallbackAssigned: resolved.fallbackAssigned,
    unassigned,
    tiers: resolved.tiers,
    ribbon,
    invariantOk: inv.ok,
    invariantReason: inv.reason,
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
    case01_blockage: "how_respond",
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
const invariantFails = fixtures.filter((f) => !f.invariantOk);
const pass = coverageFails.length === 0 && invariantFails.length === 0;

const fallbackRollup = fixtures.flatMap((f) =>
  f.fallbackAssigned.map((signal) => ({ fixture: f.label, caseKey: f.caseKey, signal })),
);

console.log(
  JSON.stringify(
    {
      pass,
      fixtureCount: fixtures.length,
      totalFallbackUses: fallbackRollup.length,
      fallbackRollup,
      coverageFails: coverageFails.map((f) => ({ label: f.label, unassigned: f.unassigned })),
      invariantFails: invariantFails.map((f) => ({
        label: f.label,
        reason: f.invariantReason,
        tiers: f.tiers,
        ribbon: f.ribbon,
      })),
      fixtures: fixtures.map((f) => ({
        label: f.label,
        caseKey: f.caseKey,
        signalCount: f.signalCount,
        fallbackCount: f.fallbackCount,
        ribbon: f.ribbon,
        tiers: f.tiers,
      })),
    },
    null,
    2,
  ),
);

process.exitCode = pass ? 0 : 1;
