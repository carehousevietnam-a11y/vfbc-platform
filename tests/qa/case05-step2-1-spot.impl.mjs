/**
 * CASE_05 STEP2-1 — engine spot (LEVEL 3): R01 deadline, R04, R06 axes, detail signals.
 */
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  CASE05_DEADLINE_DATE_KEY,
  attachCaseResolutionSnapshot,
  buildCaseResolutionProfile,
  case05ListPhase2SubstantiveAxesOnPath,
  case05NeedsDispositionReasonPhase2,
  case05Phase2SubstantiveAxisCatalogCount,
  deriveCase05DispositionSignals,
  isCase05Phase1Complete,
  buildAdminVerifyProfileQuestions,
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

/** 개인화 퍼널 v1: 기한은 2차(필요한 고객만)에서 묻고, 정확한 날짜면 날짜 입력으로 이어짐 */
const missingDate = attachCaseResolutionSnapshot({
  situation: "received_document",
  profileDocumentSource: "immigration",
  stage: "case",
  [ADMIN_CASE_ENTRY_Q1_KEY]: "disposition_notice",
  ...basePhase1,
  case05_submittedDocsDetail: "identity",
  case05_authorityFollowUp: "no_response",
  case05_deadline: "specific_date",
});
const phase1NeedsDatePass =
  isCase05Phase1Complete(missingDate) &&
  buildAdminVerifyProfileQuestions(missingDate, {}, {}, 2).some((q) => q.id === CASE05_DEADLINE_DATE_KEY);

const r04Answers = attachCaseResolutionSnapshot({
  case05_dispositionType: "application_denied",
  case05_confirmGoal: "understand_impact",
  case05_customerResponse: "none",
  case05_deadline: "uncertain",
});
const r04Pass = case05NeedsDispositionReasonPhase2(r04Answers);

/** 개인화 퍼널 v1: 복잡 고객(통지 내용이 실제와 다름 + 재검토 요청 + 순서 모름)은 2차가 깊어짐 */
const richPath = attachCaseResolutionSnapshot({
  case05_dispositionType: "situation_mismatch",
  case05_confirmGoal: "unsure",
  case05_customerResponse: "appeal_requested",
  case05_deadline: "uncertain",
  case05_factRelationship: "mismatch",
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
