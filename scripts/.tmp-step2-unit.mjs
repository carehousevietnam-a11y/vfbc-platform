import {
  buildAdminVerifyPersonalizedContext,
  buildAdminVerifyPersonalizedResult,
} from "../src/components/cost-check/AdminVerifyFirstResultPanel.tsx";
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  attachCaseResolutionSnapshot,
} from "../src/lib/adminVerifyProfiling.ts";

const PHASE2_INTEREST =
  "2차 추가 확인에서는 미납 시 추가 조치 안내가 있음 — 기한·내용 확인이 필요합니다.";
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

console.log(
  JSON.stringify(
    {
      interest_phase2: ctx.phase2Additions[0],
      interest_matches: ctx.phase2Additions[0] === PHASE2_INTEREST,
      partial_phase2: partialCtx.phase2Additions[0],
      partial_not_interest: partialCtx.phase2Additions[0] !== PHASE2_INTEREST,
      differs_phase2: differsCtx.phase2Additions[0],
      differs_not_interest: differsCtx.phase2Additions[0] !== PHASE2_INTEREST,
      no_notice_top3: noNoticeResult.unconfirmed.slice(0, 3),
      no_notice_first: noNoticeResult.unconfirmed[0] === NO_NOTICE_ITEM,
    },
    null,
    2,
  ),
);
