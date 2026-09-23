import {
  buildRealEstatePhase2CompletionLines,
  getActiveRealEstatePhase2StructuredDetailKey,
  RE2_CLAUSE_DETAIL_KEY,
  RE2_CLAUSE_FOCUS_KEY,
  RE2_CONFLICT_DETAIL_KEY,
  RE2_CONFLICT_FOCUS_KEY,
  RE2_MONEY_SITUATION_KEY,
  RE2_REGISTRATION_CONCERN_KEY,
  RE2_REGISTRATION_DETAIL_KEY,
  RE2_TIMELINE_DETAIL_KEY,
  RE2_TIMELINE_STAGE_KEY,
  REAL_ESTATE_ENTRY_Q1_KEY,
  selectRealEstatePhase2MissingInfo,
} from "../../src/lib/realEstateVerifyProfiling";

const pre = {
  [REAL_ESTATE_ENTRY_Q1_KEY]: "pre_contract",
  re_preStage: "ready_to_sign",
  re_propertyType: "소유권",
  re_counterparty: "owner_seller",
  re_goal: "full_review",
  re_docsMatch: "mismatch",
  re_situationGap: "amount_diff",
};

let a: Record<string, string> = { ...pre, [RE2_REGISTRATION_CONCERN_KEY]: "not_checked_yet" };
if (selectRealEstatePhase2MissingInfo(a) !== "structuredDetail") {
  throw new Error("reg detail missing");
}
if (getActiveRealEstatePhase2StructuredDetailKey(a) !== RE2_REGISTRATION_DETAIL_KEY) {
  throw new Error("reg detail key");
}
a = {
  ...a,
  [RE2_REGISTRATION_DETAIL_KEY]:
    "매도인과 등기부등본상 소유자가 다릅니다. 위임장과 인감증명을 아직 받지 못했습니다.",
};
if (selectRealEstatePhase2MissingInfo(a) !== "clauseFocus") {
  throw new Error("after reg detail -> clauseFocus");
}

a = {
  ...pre,
  [RE2_REGISTRATION_CONCERN_KEY]: "owner_mismatch",
  [RE2_CLAUSE_FOCUS_KEY]: "termination_penalty",
  [RE2_MONEY_SITUATION_KEY]: "verbal_vs_written",
};
if (selectRealEstatePhase2MissingInfo(a) !== "structuredDetail") {
  throw new Error(`clause detail missing: ${selectRealEstatePhase2MissingInfo(a)}`);
}
if (getActiveRealEstatePhase2StructuredDetailKey(a) !== RE2_CLAUSE_DETAIL_KEY) {
  throw new Error("clause detail key");
}

const post = {
  [REAL_ESTATE_ENTRY_Q1_KEY]: "post_dispute",
  re_disputeSubject: "deposit_return",
  re_counterparty: "owner_seller",
  re_goal: "before_response",
  re_docsMatch: "mismatch",
  re_situationGap: "amount_diff",
  re2_moneyRecovery: "full_denial",
  re2_formalResponse: "no_formal_yet",
  re2_timelineStage: "months_stalled",
};
if (selectRealEstatePhase2MissingInfo(post) !== "structuredDetail") {
  throw new Error("timeline detail missing");
}
if (getActiveRealEstatePhase2StructuredDetailKey(post) !== RE2_TIMELINE_DETAIL_KEY) {
  throw new Error("timeline detail key");
}

const conflict = {
  ...post,
  re2_timelineStage: "weeks_ongoing",
  re2_timelineDetail:
    "2024년 3월 반환일이 지났고 5월부터 내용증명과 문자를 보냈으나 상대는 연락을 끊었습니다.",
  re2_conflictFocus: "amount_written_diff",
};
if (selectRealEstatePhase2MissingInfo(conflict) !== "structuredDetail") {
  throw new Error("conflict detail missing");
}
if (getActiveRealEstatePhase2StructuredDetailKey(conflict) !== RE2_CONFLICT_DETAIL_KEY) {
  throw new Error("conflict detail key");
}

const lines = buildRealEstatePhase2CompletionLines({
  ...pre,
  [RE2_REGISTRATION_CONCERN_KEY]: "not_checked_yet",
  [RE2_REGISTRATION_DETAIL_KEY]:
    "매도인과 등기부등본상 소유자가 다릅니다. 위임장과 인감증명을 아직 받지 못했습니다.",
  [RE2_CLAUSE_DETAIL_KEY]: "해지 시 보증금 전액 몰수 조항이 있습니다.",
});
if (!lines.some((l) => l.label === "등기 확인 상세")) throw new Error("completion reg detail");
if (!lines.some((l) => l.label === "조항 상세")) throw new Error("completion clause detail");

console.log("PASS: structuredDetail unit assertions");
