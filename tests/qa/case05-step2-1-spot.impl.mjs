/**
 * CASE_05 STEP2-1 — engine spot (LEVEL 3): R01 deadline, R04, R06 axes, detail signals.
 */
import {
  CASE05_DEADLINE_DATE_KEY,
  attachCaseResolutionSnapshot,
  buildCaseResolutionProfile,
  case05ListPhase2SubstantiveAxesOnPath,
  case05NeedsDispositionReasonPhase2,
  case05Phase2SubstantiveAxisCatalogCount,
  deriveCase05DispositionSignals,
  isCase05Phase1Complete,
} from "../../src/lib/adminVerifyProfiling.ts";

const basePhase1 = {
  case05_dispositionType: "disposition_unclear",
  case05_confirmGoal: "unsure",
  case05_customerResponse: "documents_submitted",
  case05_deadline: "uncertain",
};

const withDate = attachCaseResolutionSnapshot({
  ...basePhase1,
  case05_deadline: "specific_date",
  [CASE05_DEADLINE_DATE_KEY]: "2026-12-15",
});

const profile = buildCaseResolutionProfile(withDate);
const deadlineProfilePass = (profile.deadline.value ?? "").includes("2026-12-15");

const missingDate = attachCaseResolutionSnapshot({
  ...basePhase1,
  case05_deadline: "specific_date",
});
const phase1NeedsDatePass = !isCase05Phase1Complete(missingDate);

const r04Answers = attachCaseResolutionSnapshot({
  case05_dispositionType: "application_denied",
  case05_confirmGoal: "understand_impact",
  case05_customerResponse: "none",
  case05_deadline: "uncertain",
});
const r04Pass = case05NeedsDispositionReasonPhase2(r04Answers);

const richPath = attachCaseResolutionSnapshot({
  case05_dispositionType: "reason_hard_to_understand",
  case05_confirmGoal: "maintain_reason",
  case05_customerResponse: "appeal_requested",
  case05_deadline: "uncertain",
});
const axesOnPath = case05ListPhase2SubstantiveAxesOnPath(richPath);
const catalogCount = case05Phase2SubstantiveAxisCatalogCount();

const factDetailBase = attachCaseResolutionSnapshot({
  case05_dispositionType: "application_denied",
  case05_confirmGoal: "what_to_do",
  case05_customerResponse: "none",
  case05_deadline: "uncertain",
  case05_factRelationship: "partial",
});
const sigFactA = deriveCase05DispositionSignals({
  ...factDetailBase,
  case05_factDetail: "date_place_certain",
});
const sigFactB = deriveCase05DispositionSignals({
  ...factDetailBase,
  case05_factDetail: "content_differs_clear",
});
const detailSignalPass =
  JSON.stringify([...sigFactA].sort()) !== JSON.stringify([...sigFactB].sort());

const pass =
  deadlineProfilePass &&
  phase1NeedsDatePass &&
  r04Pass &&
  catalogCount >= 10 &&
  axesOnPath.length >= 7 &&
  detailSignalPass;

const out = {
  pass,
  level: 3,
  deadlineProfilePass,
  phase1NeedsDatePass,
  r04Pass,
  catalogCount,
  axesOnPath,
  detailSignalPass,
};

console.log(JSON.stringify(out, null, 2));
process.exitCode = pass ? 0 : 1;
