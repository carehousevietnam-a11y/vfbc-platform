/**
 * P1-3 — Phase2 risk summary lines (manifest + order snapshots).
 * Run: npx tsx tests/qa/admin-phase2-risk-summary-lines.mjs
 */
import { buildAdminVerifyPersonalizedContext } from "../../src/components/cost-check/AdminVerifyFirstResultPanel.tsx";
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  attachCaseResolutionSnapshot,
  buildCaseResolutionProfile,
  getQ1ResolvedCase,
} from "../../src/lib/adminVerifyProfiling.ts";
import { resolvePhase2ManifestSummarySelection } from "../../src/lib/adminVerifyJudgmentRuntime.ts";

const CASE02_INTEREST_CLAUSE_SNIPPET = "이자·가산금";

const SNAPSHOTS = {
  "CASE_02 interest nonPayment": {
    answers: attachCaseResolutionSnapshot({
      situation: "received_document",
      stage: "case",
      profileDocumentSource: "traffic",
      [ADMIN_CASE_ENTRY_Q1_KEY]: "payment_demand",
      case02_paymentSubject: "traffic_fine",
      case02_paymentInfoSource: "written_notice",
      case02_situationMatch: "match",
      case02_paymentAmount: "amount_stated_basis_unclear",
      case02_paymentStatus: "not_paid",
      case02_confirmGoal: "verify_obligation",
      case02_demandAuthority: "traffic",
      case02_paymentMethod: "online_portal",
      case02_nonPaymentNotice: "interest_stated",
      case02_blockage: "obligation",
      case02_evidence: "partial",
    }),
    expectFieldIds: ["case02_situationMatch", "case02_paymentAmount", "case02_nonPaymentNotice"],
    expectSubstrings: ["납부 요구와 실제 상황", "산정 근거", CASE02_INTEREST_CLAUSE_SNIPPET],
    maxLines: 3,
    expectProfileFallback: false,
  },
  "CASE_02 partial interest": {
    answers: attachCaseResolutionSnapshot({
      situation: "received_document",
      stage: "case",
      profileDocumentSource: "traffic",
      [ADMIN_CASE_ENTRY_Q1_KEY]: "payment_demand",
      case02_paymentSubject: "traffic_fine",
      case02_paymentInfoSource: "written_notice",
      case02_situationMatch: "partial",
      case02_paymentAmount: "amount_stated_basis_unclear",
      case02_paymentStatus: "not_paid",
      case02_confirmGoal: "verify_obligation",
      case02_demandAuthority: "traffic",
      case02_paymentMethod: "online_portal",
      case02_nonPaymentNotice: "interest_stated",
    }),
    expectFieldIds: ["case02_situationMatch", "case02_paymentAmount", "case02_nonPaymentNotice"],
    expectSubstrings: ["다르게 느껴진", CASE02_INTEREST_CLAUSE_SNIPPET],
    maxLines: 3,
    expectProfileFallback: false,
  },
};

function runFixture(label, spec) {
  const { answers, expectFieldIds, expectSubstrings, maxLines, expectProfileFallback } = spec;
  const profile = buildCaseResolutionProfile(answers);
  const selection = resolvePhase2ManifestSummarySelection(answers, profile);
  const ctx = buildAdminVerifyPersonalizedContext(answers);
  const caseId = getQ1ResolvedCase(answers);

  const substringPass = expectSubstrings.every((sub) =>
    selection.lines.some((line) => line.includes(sub)),
  );
  const fieldOrderPass =
    selection.fieldIds.length === expectFieldIds.length &&
    expectFieldIds.every((id, i) => selection.fieldIds[i] === id);
  const lineCountPass = selection.lines.length <= maxLines;
  const ctxMatchesLines =
    ctx.phase2Additions.length === selection.lines.length &&
    ctx.phase2Additions.every((l, i) => l === selection.lines[i]);
  const noHardcodedInterest = !selection.lines.some((l) =>
    l.includes("미납 시 추가 조치 안내가 있음"),
  );
  const profileFallbackPass = selection.usedProfileFallback === expectProfileFallback;

  return {
    label,
    caseId,
    fieldIds: selection.fieldIds,
    lines: selection.lines,
    lineCount: selection.lines.length,
    usedProfileFallback: selection.usedProfileFallback,
    fieldOrderPass,
    substringPass,
    lineCountPass,
    ctxMatchesLines,
    noHardcodedInterest,
    profileFallbackPass,
    pass:
      fieldOrderPass &&
      substringPass &&
      lineCountPass &&
      ctxMatchesLines &&
      noHardcodedInterest &&
      profileFallbackPass,
  };
}

const results = Object.entries(SNAPSHOTS).map(([label, spec]) => runFixture(label, spec));
const pass = results.every((r) => r.pass);

console.log(JSON.stringify({ pass, results }, null, 2));
process.exit(pass ? 0 : 1);
