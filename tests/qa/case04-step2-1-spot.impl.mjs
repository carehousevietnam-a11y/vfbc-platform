/**
 * CASE_04 STEP2-1 — engine spot (LEVEL 3): R1 deadline, R3 details + evidence, 4:9 axes.
 */
import { buildAdminVerifyPersonalizedResult } from "../../src/components/cost-check/AdminVerifyFirstResultPanel.tsx";
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  CASE04_DEADLINE_DATE_KEY,
  attachCaseResolutionSnapshot,
  buildCaseResolutionProfile,
  case04ListPhase2SubstantiveAxesOnPath,
  case04Phase2SubstantiveAxisCatalogCount,
  isCase04Phase1Complete,
} from "../../src/lib/adminVerifyProfiling.ts";

const phase1Base = {
  situation: "received_document",
  profileDocumentSource: "immigration",
  stage: "case",
  [ADMIN_CASE_ENTRY_Q1_KEY]: "supplement_demand",
  case04_supplementTarget: "additional_docs",
  case04_confirmGoal: "understand_materials",
  case04_customerResponse: "submitted",
  case04_deadline: "specific_date",
};

const withDate = attachCaseResolutionSnapshot({
  ...phase1Base,
  [CASE04_DEADLINE_DATE_KEY]: "2026-08-12",
});

const profile = buildCaseResolutionProfile(withDate);
const deadlineProfilePass = (profile.deadline.value ?? "").includes("2026-08-12");

const missingDate = attachCaseResolutionSnapshot({
  ...phase1Base,
  case04_deadline: "specific_date",
});
const phase1NeedsDatePass = !isCase04Phase1Complete(missingDate);

const catalogCount = case04Phase2SubstantiveAxisCatalogCount();
const catalogIs11 = catalogCount === 11;

const richPath = attachCaseResolutionSnapshot({
  ...withDate,
  case04_initialSubmission: "complete",
  case04_submissionRelation: "hard_to_judge",
  case04_addDocDetail: "financial_doc",
  case04_authorityFollowUp: "no_response",
  case04_evidence: "supplement_notice",
});
const axesOnPath = case04ListPhase2SubstantiveAxesOnPath(richPath);
const axesOnRichPathGte5 = axesOnPath.length >= 5;
const richProfile = buildCaseResolutionProfile(richPath);
const detailInAuthorityClaim = (richProfile.authorityClaim.value ?? "").includes("추가 서류");

const detailA = attachCaseResolutionSnapshot({
  ...richPath,
  case04_addDocDetail: "financial_doc",
});
const detailB = attachCaseResolutionSnapshot({
  ...richPath,
  case04_addDocDetail: "id_doc",
});
const personalizedA = buildAdminVerifyPersonalizedResult(detailA);
const personalizedB = buildAdminVerifyPersonalizedResult(detailB);
const detailSignalsDiffer =
  JSON.stringify(personalizedA.actions.slice().sort()) !==
  JSON.stringify(personalizedB.actions.slice().sort());

const evidenceNotice = buildCaseResolutionProfile(richPath);
const evidenceNone = attachCaseResolutionSnapshot({
  ...richPath,
  case04_evidence: "none",
});
const evidenceNoneProfile = buildCaseResolutionProfile(evidenceNone);
const evidenceSubstantivePass =
  (evidenceNotice.evidence.value ?? "").includes("안내문") &&
  (evidenceNoneProfile.evidence.value ?? "").includes("없");

const pass =
  deadlineProfilePass &&
  phase1NeedsDatePass &&
  catalogIs11 &&
  axesOnRichPathGte5 &&
  detailInAuthorityClaim &&
  detailSignalsDiffer &&
  evidenceSubstantivePass;

console.log(
  JSON.stringify(
    {
      pass,
      level: 3,
      deadlineProfilePass,
      phase1NeedsDatePass,
      catalogCount,
      catalogIs11,
      axesOnPath,
      axesOnRichPathGte5,
      detailInAuthorityClaim,
      detailSignalsDiffer,
      evidenceSubstantivePass,
    },
    null,
    2,
  ),
);
process.exitCode = pass ? 0 : 1;
