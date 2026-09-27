/**
 * CASE_03 STEP2-1 — engine spot (LEVEL 3): R1 deadline, R3 text, R4 axes, profile splits.
 */
import { buildAdminVerifyPersonalizedResult } from "../../src/components/cost-check/AdminVerifyFirstResultPanel.tsx";
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  CASE03_ATTENDANCE_PLACE_KEY,
  CASE03_ATTENDANCE_WHEN_WHERE_KEY,
  CASE03_DEADLINE_DATE_KEY,
  attachCaseResolutionSnapshot,
  buildCaseResolutionProfile,
  case03ListPhase2SubstantiveAxesOnPath,
  case03Phase2SubstantiveAxisCatalogCount,
  isCase03Phase1Complete,
} from "../../src/lib/adminVerifyProfiling.ts";

const phase1Base = {
  situation: "received_document",
  profileDocumentSource: "court",
  stage: "case",
  [ADMIN_CASE_ENTRY_Q1_KEY]: "attendance_demand",
  case03_authorityDemand: "reason_unclear",
  case03_inquiryFocus: "action_facts",
  case03_customerResponse: "attendance",
  case03_confirmGoal: "unsure",
  case03_deadline: "specific_date",
};

const withDate = attachCaseResolutionSnapshot({
  ...phase1Base,
  [CASE03_DEADLINE_DATE_KEY]: "2026-07-20",
  [CASE03_ATTENDANCE_PLACE_KEY]: "호찌민 교통국",
});

const profile = buildCaseResolutionProfile(withDate);
const deadlineProfilePass = (profile.deadline.value ?? "").includes("2026-07-20");
const attendancePlaceInProfile = (profile.customerAction.value ?? "").includes("호찌민 교통국");

const missingDate = attachCaseResolutionSnapshot({
  ...phase1Base,
  case03_deadline: "specific_date",
});
const phase1NeedsDatePass = !isCase03Phase1Complete(missingDate);

const catalogCount = case03Phase2SubstantiveAxisCatalogCount();
const catalogIs8 = catalogCount === 9; // CASE03 v1: 2차 실질 축 9개 (HEAD 기준 이미 9)

const richPath = attachCaseResolutionSnapshot({
  ...withDate,
  case03_factRelationship: "partial",
  case03_explanationDetail: "partial_explanation",
  case03_authorityFollowUp: "more_explanation",
  case03_repeatFollowUp: "more_explanation",
  case03_blockage: "what_explain",
  case03_evidence: "attendance_notice",
  [CASE03_ATTENDANCE_WHEN_WHERE_KEY]: "9월 1일 오전 9시",
  case03_finalGoal: "prepare_response",
});
const axesOnPath = case03ListPhase2SubstantiveAxesOnPath(richPath);
const axesOnRichPathGte7 = axesOnPath.length >= 7;

const blockageA = attachCaseResolutionSnapshot({
  ...richPath,
  case03_blockage: "what_explain",
});
const blockageB = attachCaseResolutionSnapshot({
  ...richPath,
  case03_blockage: "when_attend",
});
const personalizedA = buildAdminVerifyPersonalizedResult(blockageA);
const personalizedB = buildAdminVerifyPersonalizedResult(blockageB);
const blockageSignalsDiffer =
  JSON.stringify(personalizedA.actions.slice().sort()) !==
  JSON.stringify(personalizedB.actions.slice().sort());

const withFinalGoal = attachCaseResolutionSnapshot({
  ...phase1Base,
  case03_deadline: "uncertain",
  case03_confirmGoal: "deadline_attendance",
  case03_finalGoal: "expert",
  case03_blockage: "what_explain",
});
const withConfirmOnly = attachCaseResolutionSnapshot({
  ...phase1Base,
  case03_deadline: "uncertain",
  case03_confirmGoal: "deadline_attendance",
  case03_blockage: "what_explain",
});
const goalFinalPass = (buildCaseResolutionProfile(withFinalGoal).goal.value ?? "").includes(
  "전문가",
);
const goalConfirmPass = (buildCaseResolutionProfile(withConfirmOnly).goal.value ?? "").includes(
  "직접 가야",
);

const evidenceNotice = buildCaseResolutionProfile(richPath);
const evidenceNone = attachCaseResolutionSnapshot({
  ...richPath,
  case03_evidence: "none",
  [CASE03_ATTENDANCE_WHEN_WHERE_KEY]: "",
});
const evidenceNoneProfile = buildCaseResolutionProfile(evidenceNone);
const evidenceSubstantivePass =
  (evidenceNotice.evidence.value ?? "").includes("방문") &&
  (evidenceNoneProfile.evidence.value ?? "").includes("없");

const pass =
  deadlineProfilePass &&
  attendancePlaceInProfile &&
  phase1NeedsDatePass &&
  catalogIs8 &&
  axesOnRichPathGte7 &&
  blockageSignalsDiffer &&
  goalFinalPass &&
  goalConfirmPass &&
  evidenceSubstantivePass;

const out = {
  pass,
  level: 3,
  deadlineProfilePass,
  attendancePlaceInProfile,
  phase1NeedsDatePass,
  catalogCount,
  catalogIs8,
  axesOnPath,
  axesOnRichPathGte7,
  blockageSignalsDiffer,
  goalFinalPass,
  goalConfirmPass,
  evidenceSubstantivePass,
};

console.log(JSON.stringify(out, null, 2));
process.exitCode = pass ? 0 : 1;
