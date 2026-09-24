/**
 * CASE_06 STEP2-1 — engine spot (LEVEL 3): native deadline, R04, signal_violation, payment text.
 */
import { buildAdminVerifyPersonalizedResult } from "../../src/components/cost-check/AdminVerifyFirstResultPanel.tsx";
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  attachCaseResolutionSnapshot,
  buildAdminVerifyProfileQuestions,
  buildCaseResolutionProfile,
  isCase06Phase1Complete,
} from "../../src/lib/adminVerifyProfiling.ts";
import {
  CASE06_DEADLINE_DATE_KEY,
  CASE06_PAYMENT_AMOUNT_TEXT_KEY,
  case06NeedsDeadlineDate,
  case06NeedsPaymentAmountText,
  isCase06Phase2ChainComplete,
  isCase06RedesignPhase1Complete,
  resolveCase06Phase2ChainId,
} from "../../src/lib/adminVerifyCase06Redesign.ts";

const EMPTY_FOLLOW = {};
const EMPTY_DOCS = { mismatch: [], unknown: [], other: [] };

const v11Phase1Base = {
  situation: "received_document",
  stage: "case",
  [ADMIN_CASE_ENTRY_Q1_KEY]: "unclear",
  case06_requiredActionCandidate: "pay_demand",
  case06_knowledgeSource: "doc_read_understood",
  case06_sourceChannel: "gov_document_direct",
  case06_deadlineActionPair: "deadline_pay_by_date",
  case06_customerResponse: "no_response_yet",
};

const withDeadline = attachCaseResolutionSnapshot({
  ...v11Phase1Base,
  [CASE06_DEADLINE_DATE_KEY]: "2026-10-01",
});
const profileDeadline = buildCaseResolutionProfile(withDeadline);
const deadlineProfilePass = (profileDeadline.deadline.value ?? "").includes("2026-10-01");

const missingDeadline = attachCaseResolutionSnapshot({
  ...v11Phase1Base,
});
const phase1NeedsDatePass =
  !isCase06RedesignPhase1Complete(missingDeadline) && case06NeedsDeadlineDate(missingDeadline);

const legacyR04 = attachCaseResolutionSnapshot({
  situation: "received_document",
  stage: "case",
  case06_documentNature: "payment_demand",
  profilePerceivedIssue: "deadline_unclear",
  profileDocumentSource: "specific_agency",
  profileCurrentGoal: "pay_fee",
  profileAuthorityGuidance: "specific_date",
});
const r04Pass = case06NeedsDeadlineDate(legacyR04) && !isCase06Phase1Complete(legacyR04);

const paymentChain = attachCaseResolutionSnapshot({
  ...v11Phase1Base,
  [CASE06_DEADLINE_DATE_KEY]: "2026-10-01",
  case06_paymentNature: "violation_fine",
  case06_paymentAmountKnown: "exact_amount_known",
});
const paymentTextGatePass = case06NeedsPaymentAmountText(paymentChain);

const signalViolationQs = buildAdminVerifyProfileQuestions(
  attachCaseResolutionSnapshot({
    ...v11Phase1Base,
    [CASE06_DEADLINE_DATE_KEY]: "2026-10-01",
    case06_requiredActionCandidate: "problem_action_unclear",
    case06_unclearContentRecheck: "signal_violation",
  }),
  EMPTY_FOLLOW,
  EMPTY_DOCS,
  2,
);
const signalViolationOpensPass = signalViolationQs.some((q) => q.id === "case06_unclearFactRelation");

const paymentResultA = buildAdminVerifyPersonalizedResult(
  attachCaseResolutionSnapshot({
    ...v11Phase1Base,
    [CASE06_DEADLINE_DATE_KEY]: "2026-10-01",
    case06_paymentNature: "violation_fine",
    case06_paymentAmountKnown: "exact_amount_known",
    [CASE06_PAYMENT_AMOUNT_TEXT_KEY]: "500000 VND",
    case06_paymentSituationMatch: "match",
    case06_paymentAuthorityCheck: "not_checked_yet",
    case06_paymentResponse: "no_action",
  }),
);
const paymentResultB = buildAdminVerifyPersonalizedResult(
  attachCaseResolutionSnapshot({
    ...v11Phase1Base,
    [CASE06_DEADLINE_DATE_KEY]: "2026-10-01",
    case06_paymentNature: "application_fee",
    case06_paymentAmountKnown: "approx_amount_known",
    case06_paymentSituationMatch: "match",
    case06_paymentAuthorityCheck: "not_checked_yet",
    case06_paymentResponse: "no_action",
  }),
);
const paymentResultDiffersPass =
  JSON.stringify(paymentResultA.cautions.sort()) !== JSON.stringify(paymentResultB.cautions.sort());

const chainIdPass = resolveCase06Phase2ChainId(
  attachCaseResolutionSnapshot({
    ...v11Phase1Base,
    case06_requiredActionCandidate: "attend_explain",
  }),
) === 2;

const pass =
  deadlineProfilePass &&
  phase1NeedsDatePass &&
  r04Pass &&
  paymentTextGatePass &&
  signalViolationOpensPass &&
  paymentResultDiffersPass &&
  chainIdPass;

const out = {
  pass,
  level: 3,
  deadlineProfilePass,
  phase1NeedsDatePass,
  r04Pass,
  paymentTextGatePass,
  signalViolationOpensPass,
  paymentResultDiffersPass,
  chainIdPass,
  paymentChainComplete: isCase06Phase2ChainComplete(
    attachCaseResolutionSnapshot({
      ...paymentChain,
      [CASE06_PAYMENT_AMOUNT_TEXT_KEY]: "1M",
      case06_paymentSituationMatch: "match",
      case06_paymentAuthorityCheck: "not_checked_yet",
      case06_paymentResponse: "no_action",
    }),
  ),
};

console.log(JSON.stringify(out, null, 2));
process.exitCode = pass ? 0 : 1;
