import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  attachCaseResolutionSnapshot,
  case02NormalizeNonPaymentNoticeValue,
} from "../src/lib/adminVerifyProfiling.ts";
import { buildAdminVerifyPersonalizedContext } from "../src/components/cost-check/AdminVerifyFirstResultPanel.tsx";

const EXPECT =
  "2차 추가 확인에서는 미납 시 추가 조치 안내가 있음 — 기한·내용 확인이 필요합니다.";

function base(noticeRaw) {
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
    case02_nonPaymentNotice: noticeRaw,
    case02_blockage: "obligation",
    case02_evidence: "partial",
  });
}

const cases = [
  "sanction_enforcement_stated",
  "penalty_stated",
  "enforcement_stated",
  "interest_stated",
];

const results = {};
for (const raw of cases) {
  const answers = base(raw);
  const norm = case02NormalizeNonPaymentNoticeValue(raw);
  const ctx = buildAdminVerifyPersonalizedContext(answers);
  results[raw] = {
    normalized: norm,
    phase2: ctx.phase2Additions[0],
    matches: ctx.phase2Additions[0] === EXPECT,
  };
}

console.log(JSON.stringify(results, null, 2));
