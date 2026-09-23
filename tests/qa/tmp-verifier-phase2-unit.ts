import {
  buildRealEstatePhase2ProfileQuestions,
  REAL_ESTATE_ENTRY_Q1_KEY,
  RE2_CONFLICT_DETAIL_KEY,
  RE2_CONFLICT_FOCUS_KEY,
  RE2_DOC_RELIABILITY_KEY,
  RE2_FORMAL_RESPONSE_KEY,
  RE2_MONEY_RECOVERY_KEY,
  RE2_TRANSLATION_ISSUE_KEY,
  selectRealEstatePhase2MissingInfo,
} from "../../src/lib/realEstateVerifyProfiling";

const out: Record<string, unknown> = {};

const a = {
  [REAL_ESTATE_ENTRY_Q1_KEY]: "pre_contract",
  re_preStage: "draft_received",
  re_propertyType: "임대",
  re_counterparty: "owner_seller",
  re_goal: "requirements",
  re_docsMatch: "match",
};
out.A = {
  missing: selectRealEstatePhase2MissingInfo(a),
  questions: buildRealEstatePhase2ProfileQuestions(a).map((q) => ({ id: q.id, label: q.label })),
};

const b = {
  [REAL_ESTATE_ENTRY_Q1_KEY]: "pre_contract",
  re_preStage: "draft_received",
  re_propertyType: "소유권",
  re_counterparty: "owner_seller",
  re_goal: "risk_terms",
  re_docsMatch: "mismatch",
  re_situationGap: "party_denies",
};
out.B = {
  missing: selectRealEstatePhase2MissingInfo(b),
  questions: buildRealEstatePhase2ProfileQuestions(b).map((q) => ({ id: q.id, label: q.label })),
  afterRegClause: buildRealEstatePhase2ProfileQuestions({
    ...b,
    re2_registrationConcern: "owner_mismatch",
    re2_clauseFocus: "termination_penalty",
  }).map((q) => ({ id: q.id, label: q.label })),
};

const c = {
  [REAL_ESTATE_ENTRY_Q1_KEY]: "post_dispute",
  re_disputeSubject: "deposit_return",
  re_counterparty: "owner_seller",
  re_goal: "before_response",
  re_docsMatch: "mismatch",
  re_situationGap: "party_denies",
};
out.C = {
  missing: selectRealEstatePhase2MissingInfo(c),
  questions: buildRealEstatePhase2ProfileQuestions(c).map((q) => ({ id: q.id, label: q.label })),
  afterMoney: selectRealEstatePhase2MissingInfo({ ...c, re2_moneyRecovery: "partial_paid" }),
};

const d = {
  [REAL_ESTATE_ENTRY_Q1_KEY]: "document_review",
  re_docSubject: "lease_contract",
  re_goal: "translation",
  re_docsMatch: "mismatch",
  re_situationGap: "translation_error",
};
out.D = {
  missing: selectRealEstatePhase2MissingInfo(d),
  questions: buildRealEstatePhase2ProfileQuestions(d).map((q) => ({ id: q.id, label: q.label })),
  afterDoc: buildRealEstatePhase2ProfileQuestions({
    ...d,
    re2_docReliability: "wrong_party",
  }).map((q) => ({ id: q.id, label: q.label })),
  afterTranslation: buildRealEstatePhase2ProfileQuestions({
    ...d,
    re2_docReliability: "wrong_party",
    re2_translationIssue: "meaning_shift",
  }).map((q) => ({ id: q.id, label: q.label })),
};

console.log(JSON.stringify(out, null, 2));
