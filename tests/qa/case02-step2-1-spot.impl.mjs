/**
 * CASE_02 STEP2-1 — engine spot (LEVEL 3): G1 deadline date, G2 amount detail, G3 paymentInfoSource.
 */
import { buildAdminVerifyPersonalizedResult } from "../../src/components/cost-check/AdminVerifyFirstResultPanel.tsx";
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  CASE02_DEADLINE_DATE_KEY,
  CASE02_PAYMENT_AMOUNT_DETAIL_KEY,
  attachCaseResolutionSnapshot,
  buildCaseResolutionProfile,
  case02NeedsEvidence,
  case02NeedsPaymentAmountDetail,
  getAdminChoiceNoteKey,
} from "../../src/lib/adminVerifyProfiling.ts";

const phase1Base = {
  situation: "received_document",
  stage: "case",
  profileDocumentSource: "traffic",
  [ADMIN_CASE_ENTRY_Q1_KEY]: "payment_demand",
  case02_paymentSubject: "traffic_fine",
  case02_paymentInfoSource: "written_notice",
  case02_confirmGoal: "verify_amount",
  case02_paymentStatus: "not_paid",
  case02_deadline: "uncertain",
};

const g1Answers = attachCaseResolutionSnapshot({
  ...phase1Base,
  case02_deadline: "confirmed",
  [CASE02_DEADLINE_DATE_KEY]: "2026-09-30",
  case02_paymentAmount: "amount_unknown",
  case02_blockage: "amount_unclear",
  case02_evidence: "notice",
});

const g1Profile = buildCaseResolutionProfile(g1Answers);
const g1DeadlinePass = (g1Profile.deadline.value ?? "").includes("2026-09-30");

const g2Answers = attachCaseResolutionSnapshot({
  ...phase1Base,
  case02_paymentAmount: "amount_differs",
  [CASE02_PAYMENT_AMOUNT_DETAIL_KEY]: "1,500,000 VND",
  case02_deadline: "uncertain",
  case02_blockage: "amount_unclear",
  case02_evidence: "notice",
});

const g2Profile = buildCaseResolutionProfile(g2Answers);
const g2AuthorityPass = (g2Profile.authorityClaim.value ?? "").includes("1,500,000");

const g2NeedsDetailPass = case02NeedsPaymentAmountDetail(
  attachCaseResolutionSnapshot({
    ...phase1Base,
    case02_paymentAmount: "amount_differs",
  }),
);

const otherNoteAnswers = attachCaseResolutionSnapshot({
  ...phase1Base,
  case02_paymentAmount: "other",
  [getAdminChoiceNoteKey("case02_paymentAmount")]: "통지서에 2백만 동",
  case02_blockage: "amount_unclear",
  case02_evidence: "notice",
});
const otherNoteProfile = buildCaseResolutionProfile(otherNoteAnswers);
const otherNoteRegressionPass = (otherNoteProfile.authorityClaim.value ?? "").includes("2백만");

const g3Phase1 = {
  ...phase1Base,
  case02_paymentInfoSource: "recall_unclear",
};
const g3EvidenceNeedsPass = case02NeedsEvidence(attachCaseResolutionSnapshot(g3Phase1));
const g3EventProfile = buildCaseResolutionProfile(attachCaseResolutionSnapshot(g3Phase1));
const g3EventPass = (g3EventProfile.event.value ?? "").includes("안내 인지:");

const personalizedG1 = buildAdminVerifyPersonalizedResult(g1Answers);
const g1ActionPass = personalizedG1.actions.some((a) => a.includes("2026-09-30"));

const pass =
  g1DeadlinePass &&
  g1ActionPass &&
  g2AuthorityPass &&
  g2NeedsDetailPass &&
  otherNoteRegressionPass &&
  g3EvidenceNeedsPass &&
  g3EventPass;

console.log(
  JSON.stringify(
    {
      pass,
      level: 3,
      g1DeadlinePass,
      g1ActionPass,
      g2AuthorityPass,
      g2NeedsDetailPass,
      otherNoteRegressionPass,
      g3EvidenceNeedsPass,
      g3EventPass,
    },
    null,
    2,
  ),
);
process.exitCode = pass ? 0 : 1;
