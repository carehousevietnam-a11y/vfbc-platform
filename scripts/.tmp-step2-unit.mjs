import {
  buildAdminVerifyPersonalizedContext,
  buildAdminVerifyPersonalizedResult,
} from "../src/components/cost-check/AdminVerifyFirstResultPanel.tsx";
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  attachCaseResolutionSnapshot,
} from "../src/lib/adminVerifyProfiling.ts";

const PHASE2_INTEREST_SNIPPET = "이자·가산금";
const NO_NOTICE_ITEM = "미납 시 기관 안내·결과";

function baseCase02(overrides = {}) {
  return attachCaseResolutionSnapshot({
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
    ...overrides,
  });
}

const interest = baseCase02();
const ctx = buildAdminVerifyPersonalizedContext(interest);
const personalized = buildAdminVerifyPersonalizedResult(interest, ctx);

const partialInterest = baseCase02({
  case02_situationMatch: "partial",
  case02_nonPaymentNotice: "interest_stated",
});
const partialCtx = buildAdminVerifyPersonalizedContext(partialInterest);

const differsInterest = baseCase02({
  case02_paymentAmount: "amount_differs",
  case02_nonPaymentNotice: "interest_stated",
});
const differsCtx = buildAdminVerifyPersonalizedContext(differsInterest);

const noNotice = baseCase02({ case02_nonPaymentNotice: "no_notice" });
const noNoticeResult = buildAdminVerifyPersonalizedResult(noNotice);

const phase2Blob = (additions) => additions.join(" ");

console.log(
  JSON.stringify(
    {
      interest_phase2_count: ctx.phase2Additions.length,
      interest_phase2: phase2Blob(ctx.phase2Additions),
      interest_matches: ctx.phase2Additions.some((line) =>
        line.includes(PHASE2_INTEREST_SNIPPET),
      ),
      partial_phase2: phase2Blob(partialCtx.phase2Additions),
      partial_has_interest: partialCtx.phase2Additions.some((line) =>
        line.includes(PHASE2_INTEREST_SNIPPET),
      ),
      partial_has_partial_situation: partialCtx.phase2Additions.some((line) =>
        line.includes("다르게 느껴진"),
      ),
      differs_phase2: phase2Blob(differsCtx.phase2Additions),
      differs_has_amount_diff: differsCtx.phase2Additions.some((line) =>
        line.includes("금액의 차이"),
      ),
      no_notice_top3: noNoticeResult.unconfirmed.slice(0, 3),
      no_notice_first: noNoticeResult.unconfirmed[0] === NO_NOTICE_ITEM,
    },
    null,
    2,
  ),
);
