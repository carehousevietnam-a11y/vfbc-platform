import { buildRealEstateFirstResult } from "../src/lib/realEstateVerifyFirstResult";
import {
  attachRealEstateProfileSnapshot,
  restoreRealEstateProfilingAnswersFromMeta,
  REAL_ESTATE_ENTRY_Q1_KEY,
  RE_DISPUTE_SUBJECT_KEY,
  RE_COUNTERPARTY_KEY,
  RE_GOAL_KEY,
  RE_DOCS_MATCH_KEY,
  RE_DOC_SUBJECT_KEY,
  RE_SITUATION_GAP_KEY,
  REAL_ESTATE_CUSTOMER_INPUT_KEY,
  REAL_ESTATE_SITUATION_META_JSON_KEY,
  RE_PRE_STAGE_KEY,
  RE_PROPERTY_TYPE_KEY,
} from "../src/lib/realEstateVerifyProfiling";
import type { ReviewAnswers } from "../src/components/cost-check/MasterReviewQuotationReport";

function testPath(label: string, answers: ReviewAnswers) {
  const snap = attachRealEstateProfileSnapshot(answers);
  const meta = {
    [REAL_ESTATE_SITUATION_META_JSON_KEY]: snap[REAL_ESTATE_SITUATION_META_JSON_KEY],
  };
  const restored = restoreRealEstateProfilingAnswersFromMeta(meta);
  const orig = buildRealEstateFirstResult(snap);
  const rest = buildRealEstateFirstResult(restored ?? {});
  const ok = orig.situationSummary === rest.situationSummary;
  console.log(
    `${label}: restore-match=${ok} has-customer=${rest.situationSummary.includes("상황 설명")}`,
  );
  console.log(`  orig: ${orig.situationSummary.slice(0, 100)}`);
  console.log(`  rest: ${rest.situationSummary.slice(0, 100)}`);
}

testPath("PRE", {
  [REAL_ESTATE_ENTRY_Q1_KEY]: "pre_contract",
  [RE_PRE_STAGE_KEY]: "viewing_property",
  [RE_PROPERTY_TYPE_KEY]: "임대",
  [RE_COUNTERPARTY_KEY]: "owner_seller",
  [RE_GOAL_KEY]: "requirements",
});

testPath("POST", {
  [REAL_ESTATE_ENTRY_Q1_KEY]: "post_dispute",
  [RE_DISPUTE_SUBJECT_KEY]: "deposit_return",
  [RE_COUNTERPARTY_KEY]: "owner_seller",
  [RE_GOAL_KEY]: "before_response",
  [RE_DOCS_MATCH_KEY]: "match",
});

testPath("DOCUMENT", {
  [REAL_ESTATE_ENTRY_Q1_KEY]: "document_review",
  [RE_DOC_SUBJECT_KEY]: "lease_contract",
  [RE_GOAL_KEY]: "risk_terms",
  [RE_DOCS_MATCH_KEY]: "mismatch",
  [RE_SITUATION_GAP_KEY]: "amount_diff",
});

testPath("UNCLEAR", {
  [REAL_ESTATE_ENTRY_Q1_KEY]: "unsure",
  [REAL_ESTATE_CUSTOMER_INPUT_KEY]:
    "전세 만료 후 보증금 반환을 요청했는데 임대인이 거절했습니다. 계약서는 있는데 연락이 두절되었습니다.",
  [RE_DISPUTE_SUBJECT_KEY]: "deposit_return",
  [RE_COUNTERPARTY_KEY]: "owner_seller",
  [RE_GOAL_KEY]: "negotiating",
  [RE_DOCS_MATCH_KEY]: "mismatch",
  [RE_SITUATION_GAP_KEY]: "party_denies",
});
