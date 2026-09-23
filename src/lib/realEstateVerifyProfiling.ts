import type { ReviewAnswers } from "@/components/cost-check/MasterReviewQuotationReport";
import type { ProfileQuestion } from "@/lib/adminVerifyProfiling";

/** Internal Situation Profile — not shown to customers (v1.2 Fact Taxonomy) */
export type RealEstateProfileFieldStatus =
  | "confirmed"
  | "customer_claim"
  | "counterparty_claim"
  | "inferred"
  | "unknown"
  | "candidate";

export type RealEstateProfileField = {
  value: string | null;
  status: RealEstateProfileFieldStatus;
  source: string | null;
};

export type RealEstateResolutionPath =
  | "PRE_CONTRACT"
  | "POST_DISPUTE"
  | "DOCUMENT_REVIEW"
  | "UNCLEAR";

/** VERIFY 부동산 — FREE Phase 1 / PAID Phase 2 profiling stage */
export type RealEstateVerifyProfilePhase = 1 | 2;

export type RealEstateSituationProfile = {
  property: RealEstateProfileField;
  transaction: RealEstateProfileField;
  contractStage: RealEstateProfileField;
  parties: RealEstateProfileField;
  claims: RealEstateProfileField;
  facts: RealEstateProfileField;
  documents: RealEstateProfileField;
  money: RealEstateProfileField;
  dates: RealEstateProfileField;
  actions: RealEstateProfileField;
  responses: RealEstateProfileField;
  rights: RealEstateProfileField;
  evidence: RealEstateProfileField;
  risk: RealEstateProfileField;
  goal: RealEstateProfileField;
  resolutionPath: RealEstateResolutionPath | null;
  customerInput: string | null;
};

export const REAL_ESTATE_CUSTOMER_INPUT_KEY = "realEstateCustomerInput";
export const REAL_ESTATE_ENTRY_Q1_KEY = "realEstateSituationEntry";
export const REAL_ESTATE_ENTRY_Q1_LABEL =
  "지금 부동산 관련해서 어떤 일이 진행 중인가요?";

export const RE_PROPERTY_TYPE_KEY = "re_propertyType";
export const RE_GOAL_KEY = "re_goal";
export const RE_DOCS_MATCH_KEY = "re_docsMatch";
export const RE_PRE_STAGE_KEY = "re_preStage";
export const RE_DISPUTE_SUBJECT_KEY = "re_disputeSubject";
export const RE_DOC_SUBJECT_KEY = "re_docSubject";
export const RE_COUNTERPARTY_KEY = "re_counterparty";
export const RE_SITUATION_GAP_KEY = "re_situationGap";

/** Phase 1 pre-signup simple evidence filename — separate from Phase2 `_realEstateEvidence*`. */
export const RE_PHASE1_EVIDENCE_FILE_NAME_KEY = "_realEstatePhase1EvidenceFileName";

/** Phase 1 direct-input detail keys — non-numbered 직접 설명 (not choice values). */
export const RE_PRE_STAGE_DETAIL_KEY = "re_preStageDetail";
export const RE_DISPUTE_SUBJECT_DETAIL_KEY = "re_disputeSubjectDetail";
export const RE_DOC_SUBJECT_DETAIL_KEY = "re_docSubjectDetail";
export const RE_PROPERTY_TYPE_DETAIL_KEY = "re_propertyTypeDetail";
export const RE_COUNTERPARTY_DETAIL_KEY = "re_counterpartyDetail";
export const RE_GOAL_DETAIL_KEY = "re_goalDetail";
export const RE_DOCS_MATCH_DETAIL_KEY = "re_docsMatchDetail";
export const RE_SITUATION_GAP_DETAIL_KEY = "re_situationGapDetail";

/** Phase 1 choice → detail key for 직접 설명하기 (not numbered options). */
export const RE_PHASE1_DIRECT_EXPLAIN_CHOICE_TO_DETAIL: Record<string, string> = {
  [RE_PRE_STAGE_KEY]: RE_PRE_STAGE_DETAIL_KEY,
  [RE_DISPUTE_SUBJECT_KEY]: RE_DISPUTE_SUBJECT_DETAIL_KEY,
  [RE_DOC_SUBJECT_KEY]: RE_DOC_SUBJECT_DETAIL_KEY,
  [RE_PROPERTY_TYPE_KEY]: RE_PROPERTY_TYPE_DETAIL_KEY,
  [RE_COUNTERPARTY_KEY]: RE_COUNTERPARTY_DETAIL_KEY,
  [RE_GOAL_KEY]: RE_GOAL_DETAIL_KEY,
  [RE_DOCS_MATCH_KEY]: RE_DOCS_MATCH_DETAIL_KEY,
  [RE_SITUATION_GAP_KEY]: RE_SITUATION_GAP_DETAIL_KEY,
};

/** PAID Phase 2 answer keys — never collide with FREE `re_*` */
export const RE2_REGISTRATION_CONCERN_KEY = "re2_registrationConcern";
export const RE2_CLAUSE_FOCUS_KEY = "re2_clauseFocus";
export const RE2_MONEY_SITUATION_KEY = "re2_moneySituation";
export const RE2_REGISTRATION_DETAIL_KEY = "re2_registrationDetail";
export const RE2_MONEY_DETAIL_KEY = "re2_moneyDetail";
export const RE2_CLAUSE_DETAIL_KEY = "re2_clauseDetail";
export const RE2_MONEY_RECOVERY_KEY = "re2_moneyRecovery";
export const RE2_BREACH_FOCUS_KEY = "re2_breachFocus";
export const RE2_FORMAL_RESPONSE_KEY = "re2_formalResponse";
export const RE2_TIMELINE_STAGE_KEY = "re2_timelineStage";
export const RE2_AUTHORITY_STAGE_KEY = "re2_authorityStage";
export const RE2_DOC_RELIABILITY_KEY = "re2_docReliability";
export const RE2_TRANSLATION_ISSUE_KEY = "re2_translationIssue";
export const RE2_CONFLICT_FOCUS_KEY = "re2_conflictFocus";
export const RE2_CONFLICT_DETAIL_KEY = "re2_conflictDetail";
export const RE2_TIMELINE_DETAIL_KEY = "re2_timelineDetail";
export const RE2_UNCLEAR_FACT_LOCK_KEY = "re2_unclearFactLock";
export const RE2_UNCLEAR_MONEY_ISSUE_KEY = "re2_unclearMoneyIssue";
export const RE2_UNCLEAR_DOC_ANCHOR_KEY = "re2_unclearDocAnchor";
export const RE2_UNCLEAR_PARTY_FOCUS_KEY = "re2_unclearPartyFocus";
export const RE2_UNCLEAR_TIMELINE_FOCUS_KEY = "re2_unclearTimelineFocus";
export const RE2_UNCLEAR_MONEY_DETAIL_KEY = "re2_unclearMoneyDetail";
export const RE2_UNCLEAR_DOC_DETAIL_KEY = "re2_unclearDocDetail";
export const RE2_UNCLEAR_PARTY_DETAIL_KEY = "re2_unclearPartyDetail";
export const RE2_UNCLEAR_TIMELINE_DETAIL_KEY = "re2_unclearTimelineDetail";

export const RE2_CANNOT_CLASSIFY_YET = "cannot_classify_yet";

/** Phase 2 choice → detail key for 직접 설명하기 (not numbered options). */
export const RE2_PHASE2_DIRECT_EXPLAIN_CHOICE_TO_DETAIL: Record<string, string> = {
  [RE2_CLAUSE_FOCUS_KEY]: RE2_CLAUSE_DETAIL_KEY,
  [RE2_CONFLICT_FOCUS_KEY]: RE2_CONFLICT_DETAIL_KEY,
  [RE2_TIMELINE_STAGE_KEY]: RE2_TIMELINE_DETAIL_KEY,
};

export const REAL_ESTATE_SITUATION_META_JSON_KEY = "real_estate_situation_profile_json";
export const REAL_ESTATE_RESOLUTION_PATH_KEY = "real_estate_resolution_path";
export const REAL_ESTATE_VERIFY_PROFILE_PHASE_META_KEY = "real_estate_verify_profile_phase";
export const REAL_ESTATE_PHASE2_ANSWERS_META_JSON_KEY = "real_estate_phase2_answers_json";
export const REAL_ESTATE_PHASE2_COMPLETE_META_KEY = "real_estate_phase2_complete";
/** Phase 2 simple evidence — separate from Phase 1 signup `storagePath` / `file_name`. */
export const REAL_ESTATE_PHASE2_EVIDENCE_ATTACHED_META_KEY =
  "real_estate_phase2_evidence_attached";
export const REAL_ESTATE_PHASE2_EVIDENCE_FILE_NAME_META_KEY = "real_estate_phase2_file_name";
export const REAL_ESTATE_PHASE2_EVIDENCE_STORAGE_PATH_META_KEY =
  "real_estate_phase2_storage_path";
/** Restore seed hint only — not persisted to CRM */
export const REAL_ESTATE_RESTORED_PROFILE_PHASE_KEY = "_realEstateRestoredProfilePhase";

const REAL_ESTATE_PHASE2_ANSWER_KEYS: readonly string[] = [
  RE2_REGISTRATION_CONCERN_KEY,
  RE2_CLAUSE_FOCUS_KEY,
  RE2_MONEY_SITUATION_KEY,
  RE2_REGISTRATION_DETAIL_KEY,
  RE2_MONEY_DETAIL_KEY,
  RE2_CLAUSE_DETAIL_KEY,
  RE2_MONEY_RECOVERY_KEY,
  RE2_BREACH_FOCUS_KEY,
  RE2_FORMAL_RESPONSE_KEY,
  RE2_TIMELINE_STAGE_KEY,
  RE2_AUTHORITY_STAGE_KEY,
  RE2_DOC_RELIABILITY_KEY,
  RE2_TRANSLATION_ISSUE_KEY,
  RE2_CONFLICT_FOCUS_KEY,
  RE2_CONFLICT_DETAIL_KEY,
  RE2_TIMELINE_DETAIL_KEY,
  RE2_UNCLEAR_FACT_LOCK_KEY,
  RE2_UNCLEAR_MONEY_ISSUE_KEY,
  RE2_UNCLEAR_DOC_ANCHOR_KEY,
  RE2_UNCLEAR_PARTY_FOCUS_KEY,
  RE2_UNCLEAR_TIMELINE_FOCUS_KEY,
  RE2_UNCLEAR_MONEY_DETAIL_KEY,
  RE2_UNCLEAR_DOC_DETAIL_KEY,
  RE2_UNCLEAR_PARTY_DETAIL_KEY,
  RE2_UNCLEAR_TIMELINE_DETAIL_KEY,
];

const REAL_ESTATE_ENTRY_OPTIONS: { value: string; label: string }[] = [
  {
    value: "pre_contract",
    label: "아직 서명·납부 전인데, 계약 전에 서류를 먼저 보고 싶습니다",
  },
  {
    value: "post_dispute",
    label: "이미 문제가 생겼고, 다음에 무엇을 해야 할지 알고 싶습니다",
  },
  {
    value: "document_review",
    label: "상대나 기관에서 받은 계약서·서류 내용을 확인하고 싶습니다",
  },
  {
    value: "unsure",
    label: "어떤 검토가 맞는지 정리되지 않아, 제 상황부터 설명하고 싶습니다",
  },
];

const RE_PRE_STAGE_OPTIONS: { value: string; label: string }[] = [
  {
    value: "viewing_property",
    label: "매물만 보고 있고, 아직 계약 조건을 검토하고 있습니다",
  },
  {
    value: "deposit_agreed",
    label: "계약금·가계약을 두고 조건을 맞추는 중입니다",
  },
  {
    value: "draft_received",
    label: "계약서 초안이나 관련 서류를 받았습니다",
  },
  {
    value: "ready_to_sign",
    label: "곧 서명·납부하거나 물건을 인도받을 예정입니다",
  },
];

const RE_DISPUTE_SUBJECT_OPTIONS: { value: string; label: string }[] = [
  {
    value: "deposit_return",
    label: "보증금·계약금을 받지 못했거나 반환을 거절당했습니다",
  },
  {
    value: "contract_breach",
    label: "계약 조건 위반, 해지, 갱신 거절이 문제입니다",
  },
  {
    value: "rent_increase",
    label: "임대료·관리비·조건 변경으로 다퉜습니다",
  },
  {
    value: "ownership_dispute",
    label: "소유권, 등기, 명의, 인도 시점이 맞지 않습니다",
  },
  {
    value: "eviction",
    label: "퇴거 요구, 점유·사용권 문제가 생겼습니다",
  },
  {
    value: "damage_penalty",
    label: "손해배상, 위약금, 추가 과금을 요구받았습니다",
  },
];

const RE_DOC_SUBJECT_OPTIONS: { value: string; label: string }[] = [
  {
    value: "lease_contract",
    label: "임대차·전세·월세 계약서를 받았습니다",
  },
  {
    value: "sale_contract",
    label: "매매·매수·매도 계약서를 받았습니다",
  },
  {
    value: "notice_letter",
    label: "해지·통지·요구·답변 서한을 받았습니다",
  },
  {
    value: "registration_doc",
    label: "등기, 인허가, 명의 관련 서류를 받았습니다",
  },
  {
    value: "payment_receipt",
    label: "계약금·중도금·입금 확인 서류를 받았습니다",
  },
];

const RE_PROPERTY_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "매매", label: "집·토지를 사거나 팔려는 상황입니다" },
  { value: "임대", label: "전세·월세로 집을 빌리거나 빌려주는 상황입니다" },
  { value: "상가", label: "상가·사무실 등 비주거 공간 임대가 관련됩니다" },
  { value: "계약금", label: "계약금·중도금·보증금 조건이 핵심입니다" },
  { value: "소유권", label: "소유권 이전, 등기, 명의가 핵심입니다" },
];

const RE_COUNTERPARTY_OPTIONS: { value: string; label: string }[] = [
  {
    value: "owner_seller",
    label: "집주인·매도인과 직접 조건을 맞추고 있습니다",
  },
  {
    value: "tenant_buyer",
    label: "세입자·매수인과 직접 조건을 맞추고 있습니다",
  },
  {
    value: "agent_broker",
    label: "중개인·대리인·관리인을 통해 진행하고 있습니다",
  },
  {
    value: "company_developer",
    label: "법인·개발사·관리회사와 진행하고 있습니다",
  },
  {
    value: "authority_court",
    label: "경찰·검찰·법원·행정기관 절차가 이미 열려 있습니다",
  },
];

const RE_PRE_GOAL_OPTIONS: { value: string; label: string }[] = [
  {
    value: "requirements",
    label: "제출·계약 요건과 필수 형식이 맞는지 보고 싶습니다",
  },
  {
    value: "missing_docs",
    label: "누락된 조항이나 필요한 서류가 있는지 보고 싶습니다",
  },
  {
    value: "risk_terms",
    label: "나에게 불리하거나 위험한 조항이 있는지 보고 싶습니다",
  },
  {
    value: "translation",
    label: "원본과 번역본 내용이 같은지 보고 싶습니다",
  },
  {
    value: "notary",
    label: "공증·인증·영사확인이 필요한지 보고 싶습니다",
  },
  {
    value: "full_review",
    label: "처음부터 끝까지 전체 내용을 점검하고 싶습니다",
  },
];

const RE_POST_GOAL_OPTIONS: { value: string; label: string }[] = [
  {
    value: "before_response",
    label: "아직 공식 대응 전이라, 무엇부터 확인해야 할지 알고 싶습니다",
  },
  {
    value: "negotiating",
    label: "상대방·기관과 협의·조율 중입니다",
  },
  {
    value: "preparing_objection",
    label: "이의신청·반박·답변 서류를 준비 중입니다",
  },
  {
    value: "authority_filed",
    label: "경찰·검찰·법원·행정기관에 이미 접수된 상태입니다",
  },
  {
    value: "after_decision",
    label: "판결·결정이 나온 뒤 후속 대응이 필요합니다",
  },
];

const RE_DOCS_MATCH_OPTIONS: { value: string; label: string }[] = [
  {
    value: "match",
    label: "서류에 적힌 내용과 제가 알고 있는 상황이 같습니다",
  },
  {
    value: "mismatch",
    label: "서류와 제가 겪은 실제 상황이 다릅니다",
  },
  {
    value: "unknown",
    label: "아직 서류와 실제 상황을 나란히 비교하지 못했습니다",
  },
];

const RE_SITUATION_GAP_OPTIONS: { value: string; label: string }[] = [
  {
    value: "amount_diff",
    label: "서류의 금액·보증금·중도금이 실제 합의와 다릅니다",
  },
  {
    value: "party_denies",
    label: "상대가 말로 한 약속·합의를 인정하지 않습니다",
  },
  {
    value: "missing_doc",
    label: "필요한 서류나 증빙이 없거나 빠져 있습니다",
  },
  {
    value: "translation_error",
    label: "번역본·문구 해석이 실제 의미와 다릅니다",
  },
  {
    value: "deadline_dispute",
    label: "기한·인도·해지 시점이 서류와 다르게 적혀 있습니다",
  },
];

const DISPUTE_TO_PROPERTY: Record<string, string> = {
  deposit_return: "임대",
  rent_increase: "임대",
  ownership_dispute: "소유권",
  eviction: "임대",
};

const DOC_TO_PROPERTY: Record<string, string> = {
  lease_contract: "임대",
  sale_contract: "매매",
  registration_doc: "소유권",
  payment_receipt: "계약금",
};

const PRE_STAGE_TO_PROPERTY: Partial<Record<string, string>> = {
  deposit_agreed: "계약금",
};

const RE2_REGISTRATION_CONCERN_OPTIONS: { value: string; label: string }[] = [
  {
    value: "owner_mismatch",
    label: "등기부등본상 소유자·권리자와 계약 상대가 다릅니다",
  },
  {
    value: "encumbrance",
    label: "근저당·가압류·가등기 같은 제한이 걱정됩니다",
  },
  {
    value: "authority_unclear",
    label: "매도인·임대인의 처분권한(위임·대리)이 불분명합니다",
  },
  {
    value: "not_checked_yet",
    label: "아직 등기 확인 전이라 무엇을 봐야 할지 모르겠습니다",
  },
];

const RE2_CLAUSE_FOCUS_OPTIONS: { value: string; label: string }[] = [
  {
    value: "deposit_terms",
    label: "보증금·계약금·중도금 조건이 걱정됩니다",
  },
  {
    value: "termination_penalty",
    label: "해지·위약·손해배상 조항이 불리합니다",
  },
  {
    value: "delivery_handover",
    label: "인도·원상복구·특약 기준이 불명확합니다",
  },
  {
    value: "hidden_obligation",
    label: "추가 부담·관리비·수선 의무가 숨어 있습니다",
  },
];

const RE2_MONEY_SITUATION_OPTIONS: { value: string; label: string }[] = [
  {
    value: "verbal_vs_written",
    label: "말로 한 금액·조건과 서류 내용이 다릅니다",
  },
  {
    value: "extra_demand",
    label: "처음 합의와 달리 추가 납부를 요구받았습니다",
  },
  {
    value: "return_unclear",
    label: "반환·환불 조건·시점이 불명확합니다",
  },
  {
    value: "amount_unclear",
    label: "금액 자체는 맞지만 지급·반환 방식이 불분명합니다",
  },
];

const RE2_MONEY_RECOVERY_OPTIONS: { value: string; label: string }[] = [
  {
    value: "full_denial",
    label: "상대가 보증금·계약금 반환 자체를 거부합니다",
  },
  {
    value: "partial_paid",
    label: "약속한 금액 중 일부만 받았습니다",
  },
  {
    value: "offset_claim",
    label: "상대가 다른 채무·비용으로 상계·공제합니다",
  },
  {
    value: "deadline_passed",
    label: "약속한 반환일이 지났는데 돌려받지 못했습니다",
  },
];

const RE2_FORMAL_RESPONSE_OPTIONS: { value: string; label: string }[] = [
  {
    value: "no_formal_yet",
    label: "아직 서면·공식 연락을 보내지 않았습니다",
  },
  {
    value: "sent_notice",
    label: "내용증명·해지통지·요구서를 발송했습니다",
  },
  {
    value: "negotiating",
    label: "협의·조율 중이지만 합의가 나지 않았습니다",
  },
  {
    value: "received_counter",
    label: "상대·기관 답변을 받았으나 충분하지 않습니다",
  },
];

const RE2_TIMELINE_STAGE_OPTIONS: { value: string; label: string }[] = [
  {
    value: "just_started",
    label: "최근 발생했고 아직 초기 단계입니다",
  },
  {
    value: "weeks_ongoing",
    label: "수주간 연락·협의를 반복했습니다",
  },
  {
    value: "months_stalled",
    label: "수개월 이상 교착 상태입니다",
  },
  {
    value: "legal_started",
    label: "경찰·법원·행정기관 절차가 시작되었습니다",
  },
];

const RE2_AUTHORITY_STAGE_OPTIONS: { value: string; label: string }[] = [
  {
    value: "preparing_filing",
    label: "접수·신고 준비 중입니다",
  },
  {
    value: "filed_waiting",
    label: "접수 후 결과·회신을 기다리는 중입니다",
  },
  {
    value: "hearing_scheduled",
    label: "출석·심문·조사 일정이 잡혔습니다",
  },
  {
    value: "decision_issued",
    label: "결정·판결·처분 통보를 받았습니다",
  },
];

const RE2_DOC_RELIABILITY_OPTIONS: { value: string; label: string }[] = [
  {
    value: "wrong_party",
    label: "문서상 당사자·명의가 실제와 다릅니다",
  },
  {
    value: "outdated_record",
    label: "등기·날짜·버전이 오래되었거나 갱신되지 않았습니다",
  },
  {
    value: "unofficial_copy",
    label: "공식 원본·인증이 아닌 사본 같습니다",
  },
  {
    value: "content_surprise",
    label: "예상과 다른 의무·금액이 추가되어 있습니다",
  },
];

const RE2_TRANSLATION_ISSUE_OPTIONS: { value: string; label: string }[] = [
  {
    value: "amount_diff",
    label: "금액·보증금 표현이 원본과 다릅니다",
  },
  {
    value: "party_name_diff",
    label: "당사자·주소 표기가 원본과 다릅니다",
  },
  {
    value: "obligation_diff",
    label: "의무·해지 조항 해석이 원본과 다릅니다",
  },
  {
    value: "date_diff",
    label: "날짜·기한 표현이 원본과 다릅니다",
  },
];

const RE2_CONFLICT_FOCUS_OPTIONS: { value: string; label: string }[] = [
  {
    value: "verbal_promise_denied",
    label: "상대가 말로 한 약속·합의를 부인하는 부분이 가장 큽니다",
  },
  {
    value: "amount_written_diff",
    label: "서류 금액·보증금 표기와 실제 합의가 다른 부분이 가장 큽니다",
  },
  {
    value: "timeline_written_diff",
    label: "기한·인도·해지 시점 표기와 실제 흐름이 다른 부분이 가장 큽니다",
  },
  {
    value: "party_wrong_on_doc",
    label: "서류상 당사자·명의와 실제 관계가 다른 부분이 가장 큽니다",
  },
];

const RE2_UNCLEAR_FACT_LOCK_OPTIONS: { value: string; label: string }[] = [
  {
    value: "who_obligated",
    label: "누가 무엇을 해야 하는지부터 확인하고 싶습니다",
  },
  {
    value: "money_status",
    label: "돈·보증금·계약금 상태부터 확인하고 싶습니다",
  },
  {
    value: "document_status",
    label: "어떤 서류가 핵심인지부터 확인하고 싶습니다",
  },
  {
    value: "timeline_status",
    label: "언제·어떤 순서로 일이 벌어졌는지부터 확인하고 싶습니다",
  },
];

const RE2_UNCLEAR_MONEY_ISSUE_OPTIONS: { value: string; label: string }[] = [
  {
    value: "deposit_not_returned",
    label: "보증금·계약금 반환을 받지 못했거나 거절당했습니다",
  },
  {
    value: "payment_dispute",
    label: "납부·정산·추가 요구 금액이 맞지 않습니다",
  },
  {
    value: "penalty_or_fee",
    label: "위약금·손해배상·추가 비용 문제가 있습니다",
  },
  {
    value: RE2_CANNOT_CLASSIFY_YET,
    label: "아직 돈 문제를 분류하기 어렵습니다",
  },
];

const RE2_UNCLEAR_DOC_ANCHOR_OPTIONS: { value: string; label: string }[] = [
  {
    value: "lease_contract",
    label: "임대차·전세·월세 계약서가 핵심입니다",
  },
  {
    value: "sale_contract",
    label: "매매·매수·매도 계약서가 핵심입니다",
  },
  {
    value: "notice_or_letter",
    label: "해지·통지·요구·답변 서한이 핵심입니다",
  },
  {
    value: "registration_doc",
    label: "등기·명의·인허가 관련 서류가 핵심입니다",
  },
  {
    value: RE2_CANNOT_CLASSIFY_YET,
    label: "아직 어떤 서류가 핵심인지 분류하기 어렵습니다",
  },
];

const RE2_UNCLEAR_PARTY_FOCUS_OPTIONS: { value: string; label: string }[] = [
  {
    value: "landlord_seller",
    label: "집주인·매도인과의 관계·의무가 먼저 불분명합니다",
  },
  {
    value: "tenant_buyer",
    label: "세입자·매수인과의 관계·의무가 먼저 불분명합니다",
  },
  {
    value: "agent_manager",
    label: "중개인·관리인·대리인 역할이 먼저 불분명합니다",
  },
  {
    value: "authority",
    label: "기관·법원·행정 절차 상대가 먼저 불분명합니다",
  },
  {
    value: RE2_CANNOT_CLASSIFY_YET,
    label: "아직 상대·관계를 분류하기 어렵습니다",
  },
];

const RE2_UNCLEAR_TIMELINE_FOCUS_OPTIONS: { value: string; label: string }[] = [
  {
    value: "when_started",
    label: "문제가 시작된 시점부터 확인하고 싶습니다",
  },
  {
    value: "deadline_passed",
    label: "약속한 기한·반환일이 지난 부분부터 확인하고 싶습니다",
  },
  {
    value: "procedure_stage",
    label: "절차·연락·대응 순서부터 확인하고 싶습니다",
  },
  {
    value: RE2_CANNOT_CLASSIFY_YET,
    label: "아직 시간 순서를 분류하기 어렵습니다",
  },
];

function breachFocusOptionsForDispute(
  disputeSubject: string | null | undefined,
): { value: string; label: string }[] {
  if (disputeSubject === "contract_breach") {
    return [
      {
        value: "termination_dispute",
        label: "상대가 먼저 해지·취소를 주장하고 있습니다",
      },
      {
        value: "my_termination_denied",
        label: "제 해지·취소 통보를 상대가 부인하고 있습니다",
      },
      {
        value: "renewal_refused",
        label: "갱신·재계약 거절이 문제입니다",
      },
      {
        value: "delivery_refused",
        label: "인도·입주·명도 거부가 문제입니다",
      },
    ];
  }
  if (disputeSubject === "damage_penalty") {
    return [
      {
        value: "penalty_excessive",
        label: "요구 위약금·손해배상액이 과도하다고 느껴집니다",
      },
      {
        value: "penalty_unexpected",
        label: "계약에 없던 추가 과금·비용을 요구합니다",
      },
      {
        value: "penalty_disputed_cause",
        label: "손해 원인·귀책을 부인하고 있습니다",
      },
      {
        value: "penalty_threat_only",
        label: "아직 청구 전이나 위협·압박만 받고 있습니다",
      },
    ];
  }
  if (disputeSubject === "rent_increase") {
    return [
      {
        value: "increase_no_basis",
        label: "임대료·관리비 인상 근거가 불분명합니다",
      },
      {
        value: "increase_mid_lease",
        label: "계약 기간 중 조건 변경을 요구합니다",
      },
      {
        value: "increase_retaliatory",
        label: "분쟁·민원 이후 조건 변경을 요구합니다",
      },
      {
        value: "increase_vs_agreement",
        label: "말로 합의한 금액과 다르게 요구합니다",
      },
    ];
  }
  return [
    {
      value: "counterparty_claim",
      label: "상대 주장이 계약·합의와 다릅니다",
    },
    {
      value: "my_obligation_dispute",
      label: "제가 해야 할 의무 범위를 다투고 있습니다",
    },
    {
      value: "performance_dispute",
      label: "이행·인도·사용 조건이 맞지 않습니다",
    },
    {
      value: "payment_dispute",
      label: "납부·반환·정산 금액이 맞지 않습니다",
    },
  ];
}

export type RealEstatePhase2MissingId =
  | "registrationConcern"
  | "clauseFocus"
  | "moneySituation"
  | "moneyRecovery"
  | "breachFocus"
  | "formalResponse"
  | "disputeTimeline"
  | "authorityStage"
  | "docReliability"
  | "translationIssue"
  | "conflictFocus"
  | "unclearFactLock"
  | "unclearBridge"
  | "structuredDetail";

export const REAL_ESTATE_OPTION_LABELS: Record<string, string> = {
  pre_contract: "계약·서명 전 서류 검토",
  post_dispute: "문제 발생 후 대응",
  document_review: "받은 서류 내용 확인",
  unsure: "상황 설명 후 검토 방향 찾기",
  ...Object.fromEntries(RE_PRE_STAGE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(RE_DISPUTE_SUBJECT_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(RE_DOC_SUBJECT_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(RE_PROPERTY_TYPE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(RE_COUNTERPARTY_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(RE_PRE_GOAL_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(RE_POST_GOAL_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(RE_DOCS_MATCH_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(RE_SITUATION_GAP_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(RE2_REGISTRATION_CONCERN_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(RE2_CLAUSE_FOCUS_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(RE2_MONEY_SITUATION_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(RE2_MONEY_RECOVERY_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(RE2_FORMAL_RESPONSE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(RE2_TIMELINE_STAGE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(RE2_AUTHORITY_STAGE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(RE2_DOC_RELIABILITY_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(RE2_TRANSLATION_ISSUE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(RE2_CONFLICT_FOCUS_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(RE2_UNCLEAR_FACT_LOCK_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(RE2_UNCLEAR_MONEY_ISSUE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(RE2_UNCLEAR_DOC_ANCHOR_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(RE2_UNCLEAR_PARTY_FOCUS_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(RE2_UNCLEAR_TIMELINE_FOCUS_OPTIONS.map((o) => [o.value, o.label])),
  [RE2_CANNOT_CLASSIFY_YET]: "분류하기 어렵습니다",
  ...Object.fromEntries(
    (["contract_breach", "damage_penalty", "rent_increase", "other"] as const).flatMap(
      (dispute) => breachFocusOptionsForDispute(dispute === "other" ? null : dispute),
    ).map((o) => [o.value, o.label]),
  ),
};

type MissingInfoId =
  | "entry"
  | "preStage"
  | "disputeSubject"
  | "docSubject"
  | "propertyType"
  | "counterparty"
  | "goal"
  | "docsMatch"
  | "situationGap"
  | "customerInput";

function field(
  value: string | null,
  status: RealEstateProfileFieldStatus,
  source: string | null,
): RealEstateProfileField {
  return { value, status, source };
}

function emptyField(): RealEstateProfileField {
  return field(null, "unknown", null);
}

function isChoiceOrDetailAnswered(
  answers: ReviewAnswers,
  choiceKey: string,
  detailKey: string,
): boolean {
  return Boolean(answers[choiceKey]?.trim() || answers[detailKey]?.trim());
}

function resolvedChoiceOrDetailText(
  answers: ReviewAnswers,
  choiceKey: string,
  detailKey: string,
): string | null {
  const choiceLabel = optionLabel(answers[choiceKey]);
  if (choiceLabel) return choiceLabel;
  const detail = answers[detailKey]?.trim();
  return detail || null;
}

function customerClaimField(
  value: string | null,
  source: string | null,
): RealEstateProfileField {
  return field(value, value ? "customer_claim" : "unknown", source);
}

function counterpartyClaimField(
  value: string | null,
  source: string | null,
): RealEstateProfileField {
  return field(value, value ? "counterparty_claim" : "unknown", source);
}

function pushUnique(questions: ProfileQuestion[], question: ProfileQuestion): void {
  if (!questions.some((q) => q.id === question.id)) {
    questions.push(question);
  }
}

function customerText(answers: ReviewAnswers): string {
  return answers[REAL_ESTATE_CUSTOMER_INPUT_KEY]?.trim() ?? "";
}

function optionLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return REAL_ESTATE_OPTION_LABELS[value] ?? value;
}

/** 괄호 안 이전 답변 요약 — 명사형·압축형 (완전한 서술문 금지) */
const RE_PRE_STAGE_CONTEXT: Record<string, string> = {
  viewing_property: "매물 조건 검토",
  deposit_agreed: "계약금·가계약 단계",
  draft_received: "계약서 초안 수령",
  ready_to_sign: "서명·납부 직전",
};

const RE_DISPUTE_SUBJECT_CONTEXT: Record<string, string> = {
  deposit_return: "보증금 반환 거부",
  contract_breach: "계약 위반·해지",
  rent_increase: "임대료·조건 변경 다툼",
  ownership_dispute: "소유권·등기 분쟁",
  eviction: "퇴거·점유 분쟁",
  damage_penalty: "손해배상·위약금 분쟁",
};

const RE_DOC_SUBJECT_CONTEXT: Record<string, string> = {
  lease_contract: "임대차계약 내용 확인",
  sale_contract: "매매계약 내용 확인",
  notice_letter: "해지·통지 서한 확인",
  registration_doc: "등기·명의 서류 확인",
  payment_receipt: "계약금·입금 확인",
};

const RE_PROPERTY_TYPE_CONTEXT: Record<string, string> = {
  매매: "매매 거래",
  임대: "임대차 거래",
  상가: "상가·비주거 임대",
  계약금: "계약금·보증금 조건",
  소유권: "소유권·등기 이전",
};

function contextSummary(map: Record<string, string>, value: string | null | undefined): string | null {
  if (!value) return null;
  return map[value] ?? null;
}

function inferPropertyTypeFromText(text: string): string | null {
  if (/상가|사무실|비주거/.test(text)) return "상가";
  if (/매매|매수|매도/.test(text)) return "매매";
  if (/임대|전세|월세|임차|보증금/.test(text)) return "임대";
  if (/계약금|중도금/.test(text)) return "계약금";
  if (/소유권|등기|명의/.test(text)) return "소유권";
  return null;
}

function inferEntryFromText(text: string): string | null {
  if (/계약.?전|서명.?전|제출.?전|미리.?확인/.test(text)) return "pre_contract";
  if (/분쟁|문제.?발생|반려|거절|미반환|위반|다툼/.test(text)) return "post_dispute";
  if (/받은.?서류|통지|계약서/.test(text)) return "document_review";
  return null;
}

export function getRealEstateResolutionPath(answers: ReviewAnswers): RealEstateResolutionPath {
  const entry = answers[REAL_ESTATE_ENTRY_Q1_KEY];
  if (entry === "pre_contract") return "PRE_CONTRACT";
  if (entry === "post_dispute") return "POST_DISPUTE";
  if (entry === "document_review") return "DOCUMENT_REVIEW";
  const text = customerText(answers);
  const inferred = inferEntryFromText(text);
  if (entry === "unsure") {
    if (inferred === "pre_contract") return "PRE_CONTRACT";
    if (inferred === "post_dispute") return "POST_DISPUTE";
    if (inferred === "document_review") return "DOCUMENT_REVIEW";
    return "UNCLEAR";
  }
  if (inferred === "pre_contract") return "PRE_CONTRACT";
  if (inferred === "post_dispute") return "POST_DISPUTE";
  if (inferred === "document_review") return "DOCUMENT_REVIEW";
  return "UNCLEAR";
}

export function isRealEstateEntryComplete(answers: ReviewAnswers): boolean {
  return Boolean(answers[REAL_ESTATE_ENTRY_Q1_KEY]?.trim());
}

function inferredPropertyTypeFromPath(answers: ReviewAnswers): string | null {
  const dispute = answers[RE_DISPUTE_SUBJECT_KEY];
  if (dispute && DISPUTE_TO_PROPERTY[dispute]) return DISPUTE_TO_PROPERTY[dispute];
  const doc = answers[RE_DOC_SUBJECT_KEY];
  if (doc && DOC_TO_PROPERTY[doc]) return DOC_TO_PROPERTY[doc];
  const preStage = answers[RE_PRE_STAGE_KEY];
  if (preStage && PRE_STAGE_TO_PROPERTY[preStage]) return PRE_STAGE_TO_PROPERTY[preStage] ?? null;
  return null;
}

function resolvedPropertyType(answers: ReviewAnswers): string | null {
  const explicit = answers[RE_PROPERTY_TYPE_KEY]?.trim();
  if (explicit) return explicit;
  const detail = answers[RE_PROPERTY_TYPE_DETAIL_KEY]?.trim();
  if (detail) return detail;
  const fromPath = inferredPropertyTypeFromPath(answers);
  if (fromPath) return fromPath;
  return inferPropertyTypeFromText(customerText(answers));
}

function resolvedGoal(answers: ReviewAnswers): string | null {
  const explicit = answers[RE_GOAL_KEY]?.trim();
  if (explicit) return explicit;
  return answers[RE_GOAL_DETAIL_KEY]?.trim() || null;
}

function needsDocsMatchQuestion(answers: ReviewAnswers): boolean {
  const path = getRealEstateResolutionPath(answers);
  if (path === "POST_DISPUTE" || path === "DOCUMENT_REVIEW") return true;
  if (path === "PRE_CONTRACT") {
    const preStage = answers[RE_PRE_STAGE_KEY];
    return preStage === "draft_received" || preStage === "deposit_agreed" || preStage === "ready_to_sign";
  }
  return false;
}

function needsSituationGapQuestion(answers: ReviewAnswers): boolean {
  return answers[RE_DOCS_MATCH_KEY] === "mismatch";
}

function needsCounterpartyQuestion(answers: ReviewAnswers): boolean {
  const path = getRealEstateResolutionPath(answers);
  return path === "PRE_CONTRACT" || path === "POST_DISPUTE";
}

function needsCustomerInputQuestion(answers: ReviewAnswers): boolean {
  const path = getRealEstateResolutionPath(answers);
  const text = customerText(answers);

  if (path === "UNCLEAR") {
    return text.length < 20;
  }

  if (!resolvedPropertyType(answers)) {
    return text.length < 12;
  }

  if (answers[RE_DOCS_MATCH_KEY] === "unknown" && text.length < 12) {
    return true;
  }

  if (
    path === "POST_DISPUTE" &&
    answers[RE_DISPUTE_SUBJECT_KEY] === "contract_breach" &&
    !answers[RE_PROPERTY_TYPE_KEY]?.trim() &&
    text.length < 12
  ) {
    return true;
  }

  return false;
}

function hasJudgmentCore(answers: ReviewAnswers): boolean {
  const path = getRealEstateResolutionPath(answers);
  const propertyType = resolvedPropertyType(answers);
  const goal = resolvedGoal(answers);

  if (!propertyType || !goal) return false;

  if (path === "PRE_CONTRACT") {
    return Boolean(
      isChoiceOrDetailAnswered(answers, RE_PRE_STAGE_KEY, RE_PRE_STAGE_DETAIL_KEY) &&
        isChoiceOrDetailAnswered(answers, RE_COUNTERPARTY_KEY, RE_COUNTERPARTY_DETAIL_KEY) &&
        (!needsDocsMatchQuestion(answers) ||
          isChoiceOrDetailAnswered(answers, RE_DOCS_MATCH_KEY, RE_DOCS_MATCH_DETAIL_KEY)),
    );
  }

  if (path === "POST_DISPUTE") {
    return Boolean(
      isChoiceOrDetailAnswered(answers, RE_DISPUTE_SUBJECT_KEY, RE_DISPUTE_SUBJECT_DETAIL_KEY) &&
        isChoiceOrDetailAnswered(answers, RE_COUNTERPARTY_KEY, RE_COUNTERPARTY_DETAIL_KEY) &&
        isChoiceOrDetailAnswered(answers, RE_DOCS_MATCH_KEY, RE_DOCS_MATCH_DETAIL_KEY) &&
        (!needsSituationGapQuestion(answers) ||
          isChoiceOrDetailAnswered(answers, RE_SITUATION_GAP_KEY, RE_SITUATION_GAP_DETAIL_KEY)),
    );
  }

  if (path === "DOCUMENT_REVIEW") {
    return Boolean(
      isChoiceOrDetailAnswered(answers, RE_DOC_SUBJECT_KEY, RE_DOC_SUBJECT_DETAIL_KEY) &&
        isChoiceOrDetailAnswered(answers, RE_DOCS_MATCH_KEY, RE_DOCS_MATCH_DETAIL_KEY) &&
        (!needsSituationGapQuestion(answers) ||
          isChoiceOrDetailAnswered(answers, RE_SITUATION_GAP_KEY, RE_SITUATION_GAP_DETAIL_KEY)),
    );
  }

  return customerText(answers).length >= 20;
}

export function selectRealEstateMissingInfo(answers: ReviewAnswers): MissingInfoId | null {
  if (!isRealEstateEntryComplete(answers)) return "entry";

  const path = getRealEstateResolutionPath(answers);

  if (path === "UNCLEAR") {
    if (customerText(answers).length < 20) return "customerInput";
    if (!inferEntryFromText(customerText(answers))) return null;
  }

  if (path === "PRE_CONTRACT" && !isChoiceOrDetailAnswered(answers, RE_PRE_STAGE_KEY, RE_PRE_STAGE_DETAIL_KEY)) {
    return "preStage";
  }

  if (
    path === "POST_DISPUTE" &&
    !isChoiceOrDetailAnswered(answers, RE_DISPUTE_SUBJECT_KEY, RE_DISPUTE_SUBJECT_DETAIL_KEY)
  ) {
    return "disputeSubject";
  }

  if (
    path === "DOCUMENT_REVIEW" &&
    !isChoiceOrDetailAnswered(answers, RE_DOC_SUBJECT_KEY, RE_DOC_SUBJECT_DETAIL_KEY)
  ) {
    return "docSubject";
  }

  if (!resolvedPropertyType(answers)) {
    const canInfer = inferredPropertyTypeFromPath(answers);
    if (!canInfer && !answers[RE_PROPERTY_TYPE_DETAIL_KEY]?.trim()) return "propertyType";
  }

  if (
    needsCounterpartyQuestion(answers) &&
    !isChoiceOrDetailAnswered(answers, RE_COUNTERPARTY_KEY, RE_COUNTERPARTY_DETAIL_KEY)
  ) {
    return "counterparty";
  }

  if (!resolvedGoal(answers)) return "goal";

  if (
    needsDocsMatchQuestion(answers) &&
    !isChoiceOrDetailAnswered(answers, RE_DOCS_MATCH_KEY, RE_DOCS_MATCH_DETAIL_KEY)
  ) {
    return "docsMatch";
  }

  if (
    needsSituationGapQuestion(answers) &&
    !isChoiceOrDetailAnswered(answers, RE_SITUATION_GAP_KEY, RE_SITUATION_GAP_DETAIL_KEY)
  ) {
    return "situationGap";
  }

  if (needsCustomerInputQuestion(answers)) return "customerInput";

  if (!hasJudgmentCore(answers)) {
    return needsCustomerInputQuestion(answers) ? "customerInput" : null;
  }

  return null;
}

export function isRealEstateProfilingComplete(answers: ReviewAnswers): boolean {
  return selectRealEstateMissingInfo(answers) === null;
}

/** FREE Phase 1 complete — gate alias for PAID Phase 2 entry (P0+). */
export function isRealEstatePhase1Complete(answers: ReviewAnswers): boolean {
  return isRealEstateProfilingComplete(answers);
}

/** Read-only carry-over lines for Phase 2 gate shell — does not re-ask FREE answers. */
export function buildRealEstatePhase1CarryOverLines(
  answers: ReviewAnswers,
): { label: string; value: string }[] {
  const profile = buildRealEstateSituationProfile(answers);
  const lines: { label: string; value: string }[] = [];
  if (profile.transaction.value) {
    lines.push({ label: "검토 경로", value: profile.transaction.value });
  }
  if (profile.property.value) {
    lines.push({ label: "거래·물건", value: profile.property.value });
  }
  if (profile.parties.value) {
    lines.push({ label: "상대·관계", value: profile.parties.value });
  }
  if (profile.goal.value) {
    lines.push({ label: "확인 목적", value: profile.goal.value });
  }
  if (profile.claims.value) {
    lines.push({ label: "핵심 사안", value: profile.claims.value });
  }
  if (profile.documents.value) {
    lines.push({ label: "서류 상태", value: profile.documents.value });
  }
  if (profile.facts.value) {
    lines.push({ label: "차이·문제", value: profile.facts.value });
  }
  return lines;
}

export function buildRealEstateSituationProfile(answers: ReviewAnswers): RealEstateSituationProfile {
  const path = getRealEstateResolutionPath(answers);
  const propertyType = resolvedPropertyType(answers);
  const goal = resolvedGoal(answers);
  const input = customerText(answers) || null;
  const reviewStage =
    path === "PRE_CONTRACT" ? "pre" : path === "POST_DISPUTE" ? "post" : null;

  const transactionLabel =
    path === "PRE_CONTRACT"
      ? "사전 검토(계약·서명 전)"
      : path === "POST_DISPUTE"
        ? "사후 검토(문제 발생 후)"
        : path === "DOCUMENT_REVIEW"
          ? "서류 내용 확인"
          : null;

  const phase1EvidenceFileName = answers[RE_PHASE1_EVIDENCE_FILE_NAME_KEY]?.trim();
  const evidenceHasFile =
    answers._realEstateEvidenceAttached === "1" || Boolean(phase1EvidenceFileName);
  const evidenceSource = answers._realEstateEvidenceAttached === "1"
    ? "_realEstateEvidenceAttached"
    : phase1EvidenceFileName
      ? RE_PHASE1_EVIDENCE_FILE_NAME_KEY
      : "_realEstateEvidenceAttached";
  const docsMatch = answers[RE_DOCS_MATCH_KEY];
  const preStageLabel = resolvedChoiceOrDetailText(
    answers,
    RE_PRE_STAGE_KEY,
    RE_PRE_STAGE_DETAIL_KEY,
  );
  const disputeLabel =
    resolvedChoiceOrDetailText(answers, RE_DISPUTE_SUBJECT_KEY, RE_DISPUTE_SUBJECT_DETAIL_KEY) ??
    optionLabel(resolvedDisputeSubject(answers));
  const docSubjectLabel =
    resolvedChoiceOrDetailText(answers, RE_DOC_SUBJECT_KEY, RE_DOC_SUBJECT_DETAIL_KEY) ??
    optionLabel(resolvedDocSubject(answers));
  const counterpartyLabel =
    resolvedChoiceOrDetailText(answers, RE_COUNTERPARTY_KEY, RE_COUNTERPARTY_DETAIL_KEY) ??
    optionLabel(answers[RE2_UNCLEAR_PARTY_FOCUS_KEY]);
  const gapLabel = resolvedChoiceOrDetailText(
    answers,
    RE_SITUATION_GAP_KEY,
    RE_SITUATION_GAP_DETAIL_KEY,
  );
  const goalLabel =
    resolvedChoiceOrDetailText(answers, RE_GOAL_KEY, RE_GOAL_DETAIL_KEY) ?? optionLabel(goal);
  const docsMatchLabel = resolvedChoiceOrDetailText(
    answers,
    RE_DOCS_MATCH_KEY,
    RE_DOCS_MATCH_DETAIL_KEY,
  );
  const registrationConcernLabel = optionLabel(answers[RE2_REGISTRATION_CONCERN_KEY]);
  const registrationDetail = answers[RE2_REGISTRATION_DETAIL_KEY]?.trim() ?? "";
  const clauseFocusLabel = optionLabel(answers[RE2_CLAUSE_FOCUS_KEY]);
  const clauseDetail = answers[RE2_CLAUSE_DETAIL_KEY]?.trim() ?? "";
  const moneySituationLabel = optionLabel(answers[RE2_MONEY_SITUATION_KEY]);
  const moneyDetail = answers[RE2_MONEY_DETAIL_KEY]?.trim() ?? "";
  const moneyRecoveryLabel = optionLabel(answers[RE2_MONEY_RECOVERY_KEY]);
  const breachFocusLabel = optionLabel(answers[RE2_BREACH_FOCUS_KEY]);
  const formalResponseLabel = optionLabel(answers[RE2_FORMAL_RESPONSE_KEY]);
  const timelineStageLabel = optionLabel(answers[RE2_TIMELINE_STAGE_KEY]);
  const timelineDetail = answers[RE2_TIMELINE_DETAIL_KEY]?.trim() ?? "";
  const authorityStageLabel = optionLabel(answers[RE2_AUTHORITY_STAGE_KEY]);
  const docReliabilityLabel = optionLabel(answers[RE2_DOC_RELIABILITY_KEY]);
  const translationIssueLabel = optionLabel(answers[RE2_TRANSLATION_ISSUE_KEY]);
  const conflictFocusLabel = optionLabel(answers[RE2_CONFLICT_FOCUS_KEY]);
  const conflictDetail = answers[RE2_CONFLICT_DETAIL_KEY]?.trim() ?? "";
  const unclearMoneyLabel = optionLabel(answers[RE2_UNCLEAR_MONEY_ISSUE_KEY]);
  const unclearDocLabel = optionLabel(answers[RE2_UNCLEAR_DOC_ANCHOR_KEY]);

  let riskStatus: RealEstateProfileFieldStatus = "unknown";
  let riskValue: string | null = null;
  if (clauseFocusLabel) {
    riskStatus = "customer_claim";
    riskValue = clauseDetail ? `${clauseFocusLabel} · ${clauseDetail}` : clauseFocusLabel;
  } else if (clauseDetail) {
    riskStatus = "customer_claim";
    riskValue = clauseDetail;
  } else if (docReliabilityLabel) {
    riskStatus = "customer_claim";
    riskValue = docReliabilityLabel;
  } else if (docsMatch === "mismatch" || answers[RE_SITUATION_GAP_KEY] || gapLabel) {
    riskStatus = "customer_claim";
    riskValue = gapLabel ?? "서류와 실제 상황 불일치 가능";
  } else if (path === "POST_DISPUTE") {
    riskStatus = "candidate";
    riskValue = disputeLabel ?? "분쟁·대응 검토 필요";
  } else if (path === "PRE_CONTRACT") {
    riskStatus = "candidate";
    riskValue = preStageLabel ?? "계약 전 위험요인 확인";
  }

  const claimsValue = breachFocusLabel
    ? breachFocusLabel
    : disputeLabel ??
      unclearMoneyLabel ??
      docSubjectLabel ??
      unclearDocLabel ??
      preStageLabel ??
      input;
  const claimsStatus: RealEstateProfileFieldStatus = breachFocusLabel
    ? "counterparty_claim"
    : claimsValue
      ? "customer_claim"
      : "unknown";
  const claimsSource = breachFocusLabel
    ? RE2_BREACH_FOCUS_KEY
    : answers[RE_DISPUTE_SUBJECT_KEY]
      ? RE_DISPUTE_SUBJECT_KEY
      : answers[RE_DISPUTE_SUBJECT_DETAIL_KEY]
        ? RE_DISPUTE_SUBJECT_DETAIL_KEY
        : answers[RE2_UNCLEAR_MONEY_ISSUE_KEY]
          ? RE2_UNCLEAR_MONEY_ISSUE_KEY
          : RE_DISPUTE_SUBJECT_KEY;

  const factsValue =
    conflictDetail ??
    conflictFocusLabel ??
    translationIssueLabel ??
    gapLabel ??
    (docsMatch === "match"
      ? "서류와 상황 일치 응답"
      : docsMatch === "mismatch"
        ? "불일치 응답"
        : docsMatchLabel);

  const propertyExplicit =
    answers[RE_PROPERTY_TYPE_KEY]?.trim() || answers[RE_PROPERTY_TYPE_DETAIL_KEY]?.trim();
  const propertySource = answers[RE_PROPERTY_TYPE_KEY]
    ? RE_PROPERTY_TYPE_KEY
    : answers[RE_PROPERTY_TYPE_DETAIL_KEY]
      ? RE_PROPERTY_TYPE_DETAIL_KEY
      : RE_PROPERTY_TYPE_KEY;

  return {
    property: field(
      propertyType,
      propertyType
        ? propertyExplicit
          ? "customer_claim"
          : "inferred"
        : "unknown",
      propertySource,
    ),
    transaction: customerClaimField(
      transactionLabel,
      REAL_ESTATE_ENTRY_Q1_KEY,
    ),
    contractStage: customerClaimField(
      preStageLabel ?? reviewStage,
      answers[RE_PRE_STAGE_KEY]
        ? RE_PRE_STAGE_KEY
        : answers[RE_PRE_STAGE_DETAIL_KEY]
          ? RE_PRE_STAGE_DETAIL_KEY
          : RE_PRE_STAGE_KEY,
    ),
    parties: customerClaimField(
      counterpartyLabel,
      answers[RE_COUNTERPARTY_KEY]
        ? RE_COUNTERPARTY_KEY
        : answers[RE_COUNTERPARTY_DETAIL_KEY]
          ? RE_COUNTERPARTY_DETAIL_KEY
          : RE2_UNCLEAR_PARTY_FOCUS_KEY,
    ),
    claims: field(claimsValue, claimsStatus, claimsSource),
    facts: customerClaimField(
      factsValue,
      conflictDetail
        ? RE2_CONFLICT_DETAIL_KEY
        : answers[RE_SITUATION_GAP_KEY]
          ? RE_SITUATION_GAP_KEY
          : answers[RE_SITUATION_GAP_DETAIL_KEY]
            ? RE_SITUATION_GAP_DETAIL_KEY
            : RE2_CONFLICT_FOCUS_KEY,
    ),
    documents: customerClaimField(
      docReliabilityLabel ??
        unclearDocLabel ??
        docsMatchLabel ??
        (docsMatch ? optionLabel(docsMatch) : null) ??
        docSubjectLabel,
      docReliabilityLabel
        ? RE2_DOC_RELIABILITY_KEY
        : unclearDocLabel
          ? RE2_UNCLEAR_DOC_ANCHOR_KEY
          : answers[RE_DOCS_MATCH_DETAIL_KEY]
            ? RE_DOCS_MATCH_DETAIL_KEY
            : RE_DOCS_MATCH_KEY,
    ),
    money:
      moneySituationLabel || moneyRecoveryLabel || unclearMoneyLabel
        ? customerClaimField(
            moneySituationLabel
              ? moneyDetail
                ? `${moneySituationLabel} · ${moneyDetail}`
                : moneySituationLabel
              : moneyRecoveryLabel ?? unclearMoneyLabel,
            moneySituationLabel
              ? RE2_MONEY_SITUATION_KEY
              : moneyRecoveryLabel
                ? RE2_MONEY_RECOVERY_KEY
                : RE2_UNCLEAR_MONEY_ISSUE_KEY,
          )
        : propertyType === "계약금" || resolvedDisputeSubject(answers) === "deposit_return"
          ? field("계약금·보증금 관련", "inferred", RE_PROPERTY_TYPE_KEY)
          : emptyField(),
    dates: customerClaimField(
      timelineDetail
        ? timelineStageLabel
          ? `${timelineStageLabel} · ${timelineDetail}`
          : timelineDetail
        : timelineStageLabel ??
          (answers[RE_SITUATION_GAP_KEY] === "deadline_dispute"
            ? "기한·인도 시점 분쟁"
            : null),
      timelineDetail
        ? RE2_TIMELINE_DETAIL_KEY
        : timelineStageLabel
          ? RE2_TIMELINE_STAGE_KEY
          : RE_SITUATION_GAP_KEY,
    ),
    actions: customerClaimField(
      formalResponseLabel ?? goalLabel,
      formalResponseLabel ? RE2_FORMAL_RESPONSE_KEY : RE_GOAL_KEY,
    ),
    responses: customerClaimField(
      authorityStageLabel ??
        formalResponseLabel ??
        (path === "POST_DISPUTE" ? goalLabel : null),
      authorityStageLabel
        ? RE2_AUTHORITY_STAGE_KEY
        : formalResponseLabel
          ? RE2_FORMAL_RESPONSE_KEY
          : RE_GOAL_KEY,
    ),
    rights: customerClaimField(
      registrationConcernLabel
        ? registrationDetail
          ? `${registrationConcernLabel} · ${registrationDetail}`
          : registrationConcernLabel
        : answers[RE_DISPUTE_SUBJECT_KEY] === "ownership_dispute"
          ? "소유권·등기 관련"
          : null,
      registrationConcernLabel ? RE2_REGISTRATION_CONCERN_KEY : RE_DISPUTE_SUBJECT_KEY,
    ),
    evidence: field(
      evidenceHasFile ? "첨부 자료 있음" : null,
      evidenceHasFile ? "confirmed" : "unknown",
      evidenceSource,
    ),
    risk: field(riskValue, riskStatus, RE_DOCS_MATCH_KEY),
    goal: customerClaimField(
      goalLabel,
      answers[RE_GOAL_KEY] ? RE_GOAL_KEY : RE_GOAL_DETAIL_KEY,
    ),
    resolutionPath: path,
    customerInput: input,
  };
}

export function buildRealEstateDiagnosisDescription(answers: ReviewAnswers): string {
  const path = getRealEstateResolutionPath(answers);
  const profile = buildRealEstateSituationProfile(answers);
  const lines: string[] = [];

  const pathLabel =
    path === "PRE_CONTRACT"
      ? "계약·서명 전 검토"
      : path === "POST_DISPUTE"
        ? "문제 발생 후 대응"
        : path === "DOCUMENT_REVIEW"
          ? "받은 서류 확인"
          : "상황 파악 중";

  lines.push(`[검토 경로] ${pathLabel}`);

  if (profile.contractStage.value) {
    lines.push(`[진행 단계] ${profile.contractStage.value}`);
  }
  if (profile.claims.value && profile.claims.value !== profile.contractStage.value) {
    lines.push(`[핵심 사안] ${profile.claims.value}`);
  }
  if (profile.property.value) {
    lines.push(`[거래·물건] ${profile.property.value}`);
  }
  if (profile.parties.value) {
    lines.push(`[상대·관계] ${profile.parties.value}`);
  }
  if (profile.goal.value) {
    lines.push(`[확인 목적] ${profile.goal.value}`);
  }
  if (profile.documents.value) {
    lines.push(`[서류 상태] ${profile.documents.value}`);
  }
  if (profile.facts.value) {
    lines.push(`[차이·문제] ${profile.facts.value}`);
  }

  const input = customerText(answers);
  if (input) {
    lines.push(`[상황 설명] ${input}`);
  }

  return lines.join("\n");
}

export function mapRealEstateAnswersToLegacyState(answers: ReviewAnswers): {
  reviewStage: "pre" | "post" | null;
  incidentType: string | null;
  reviewFocus: string | null;
  incidentDescription: string;
} {
  const path = getRealEstateResolutionPath(answers);
  const reviewStage =
    path === "PRE_CONTRACT"
      ? "pre"
      : path === "POST_DISPUTE" || path === "DOCUMENT_REVIEW"
        ? "post"
        : null;
  const incidentType = resolvedPropertyType(answers);
  const goal = resolvedGoal(answers);
  const goalLabel = goal ? REAL_ESTATE_OPTION_LABELS[goal] ?? goal : null;
  const description = buildRealEstateDiagnosisDescription(answers);
  return {
    reviewStage,
    incidentType,
    reviewFocus: goalLabel,
    incidentDescription: description || customerText(answers),
  };
}

function propertyTypeQuestionLabel(answers: ReviewAnswers): string {
  const path = getRealEstateResolutionPath(answers);
  if (path === "PRE_CONTRACT") {
    const stage = contextSummary(RE_PRE_STAGE_CONTEXT, answers[RE_PRE_STAGE_KEY]);
    return stage
      ? `앞서 말씀하신 단계(${stage})에서, 어떤 거래·물건이 관련되나요?`
      : "이번에 검토하려는 거래·물건은 무엇인가요?";
  }
  if (path === "POST_DISPUTE") {
    const dispute = contextSummary(RE_DISPUTE_SUBJECT_CONTEXT, answers[RE_DISPUTE_SUBJECT_KEY]);
    return dispute
      ? `앞서 말씀하신 문제(${dispute})와 관련된 거래·물건은 무엇인가요?`
      : "이번 문제와 관련된 거래·물건은 무엇인가요?";
  }
  return "이번 사건과 가장 관련된 거래·물건은 무엇인가요?";
}

function goalQuestionLabel(answers: ReviewAnswers): string {
  const path = getRealEstateResolutionPath(answers);
  if (path === "PRE_CONTRACT" || path === "DOCUMENT_REVIEW") {
    const property = contextSummary(RE_PROPERTY_TYPE_CONTEXT, resolvedPropertyType(answers));
    return property
      ? `그 거래(${property})에서 무엇을 가장 먼저 확인하고 싶으신가요?`
      : "이 거래에서 무엇을 가장 먼저 확인하고 싶으신가요?";
  }
  const dispute = contextSummary(RE_DISPUTE_SUBJECT_CONTEXT, answers[RE_DISPUTE_SUBJECT_KEY]);
  return dispute
    ? `그 문제(${dispute})를 지금 어떤 단계에서 대응하고 있나요?`
    : "지금은 그 문제를 어떤 단계에서 대응하고 있나요?";
}

function counterpartyQuestionLabel(answers: ReviewAnswers): string {
  const path = getRealEstateResolutionPath(answers);
  if (path === "POST_DISPUTE") {
    const dispute = contextSummary(RE_DISPUTE_SUBJECT_CONTEXT, answers[RE_DISPUTE_SUBJECT_KEY]);
    return dispute
      ? `그 문제(${dispute})와 가장 직접 맞서고 있는 상대는 누구인가요?`
      : "이 문제와 가장 직접 맞서고 있는 상대는 누구인가요?";
  }
  const stage = contextSummary(RE_PRE_STAGE_CONTEXT, answers[RE_PRE_STAGE_KEY]);
  return stage
    ? `그 단계(${stage})에서 함께 진행하고 있는 상대는 누구인가요?`
    : "이 거래를 함께 진행하고 있는 상대는 누구인가요?";
}

function docsMatchQuestionLabel(answers: ReviewAnswers): string {
  const path = getRealEstateResolutionPath(answers);
  if (path === "PRE_CONTRACT") {
    const stage = contextSummary(RE_PRE_STAGE_CONTEXT, answers[RE_PRE_STAGE_KEY]);
    return stage
      ? `받은 서류 내용이, 실제로 합의한 조건(${stage})과 같은가요?`
      : "받은 서류 내용이 실제로 합의한 조건과 같은가요?";
  }
  if (path === "DOCUMENT_REVIEW") {
    const doc = contextSummary(RE_DOC_SUBJECT_CONTEXT, answers[RE_DOC_SUBJECT_KEY]);
    return doc
      ? `받은 서류(${doc})와 알고 있는 상황이 같은가요?`
      : "받은 서류와 알고 있는 상황이 같은가요?";
  }
  const dispute = contextSummary(RE_DISPUTE_SUBJECT_CONTEXT, answers[RE_DISPUTE_SUBJECT_KEY]);
  return dispute
    ? `서류·계약서 내용이, 실제로 겪은 상황(${dispute})과 같은가요?`
    : "서류·계약서 내용이 실제로 겪은 상황과 같은가요?";
}

function situationGapQuestionLabel(answers: ReviewAnswers): string {
  return "서류와 실제 상황이 다른 부분은 무엇에 가장 가깝나요?";
}

export function buildRealEstateVerifyProfileQuestions(answers: ReviewAnswers): ProfileQuestion[] {
  const questions: ProfileQuestion[] = [];
  const missing = selectRealEstateMissingInfo(answers);

  pushUnique(questions, {
    id: REAL_ESTATE_ENTRY_Q1_KEY,
    kind: "choice",
    label: REAL_ESTATE_ENTRY_Q1_LABEL,
    options: REAL_ESTATE_ENTRY_OPTIONS,
  });
  if (missing === "entry" || !isRealEstateEntryComplete(answers)) {
    return questions;
  }

  // UNCLEAR(entry=unsure): customerInput must precede propertyType and path-specific questions.
  // UI uses firstIncompleteIndex — order here must match selectRealEstateMissingInfo priority.
  if (answers[REAL_ESTATE_ENTRY_Q1_KEY] === "unsure") {
    pushUnique(questions, {
      id: REAL_ESTATE_CUSTOMER_INPUT_KEY,
      kind: "text",
      label: "지금 겪고 있는 상황을 시간 순서대로 간단히 적어 주세요",
      placeholder:
        "예: 전세 만료 후 보증금 반환을 요청했는데 임대인이 거절했습니다.",
    });
    if (missing === "customerInput") return questions;

    if (getRealEstateResolutionPath(answers) === "UNCLEAR") {
      return questions;
    }
  }

  const path = getRealEstateResolutionPath(answers);

  if (path === "PRE_CONTRACT") {
    pushUnique(questions, {
      id: RE_PRE_STAGE_KEY,
      kind: "choice",
      label: "서명 전 단계입니다 — 지금 어느 시점에 가깝나요?",
      options: RE_PRE_STAGE_OPTIONS,
    });
    if (missing === "preStage") return questions;
  }

  if (path === "POST_DISPUTE") {
    pushUnique(questions, {
      id: RE_DISPUTE_SUBJECT_KEY,
      kind: "choice",
      label: "문제가 생긴 상태입니다 — 어떤 문제에 가장 가깝나요?",
      options: RE_DISPUTE_SUBJECT_OPTIONS,
    });
    if (missing === "disputeSubject") return questions;
  }

  if (path === "DOCUMENT_REVIEW") {
    pushUnique(questions, {
      id: RE_DOC_SUBJECT_KEY,
      kind: "choice",
      label: "받은 서류를 검토합니다 — 어떤 서류인가요?",
      options: RE_DOC_SUBJECT_OPTIONS,
    });
    if (missing === "docSubject") return questions;
  }

  if (!resolvedPropertyType(answers) && !inferredPropertyTypeFromPath(answers)) {
    pushUnique(questions, {
      id: RE_PROPERTY_TYPE_KEY,
      kind: "choice",
      label: propertyTypeQuestionLabel(answers),
      options: RE_PROPERTY_TYPE_OPTIONS,
    });
    if (missing === "propertyType") return questions;
  }

  if (needsCounterpartyQuestion(answers)) {
    pushUnique(questions, {
      id: RE_COUNTERPARTY_KEY,
      kind: "choice",
      label: counterpartyQuestionLabel(answers),
      options: RE_COUNTERPARTY_OPTIONS,
    });
    if (missing === "counterparty") return questions;
  }

  const goalOptions =
    path === "PRE_CONTRACT" || path === "DOCUMENT_REVIEW"
      ? RE_PRE_GOAL_OPTIONS
      : RE_POST_GOAL_OPTIONS;

  if (!resolvedGoal(answers)) {
    pushUnique(questions, {
      id: RE_GOAL_KEY,
      kind: "choice",
      label: goalQuestionLabel(answers),
      options: goalOptions,
    });
    if (missing === "goal") return questions;
  }

  if (needsDocsMatchQuestion(answers) && !answers[RE_DOCS_MATCH_KEY]?.trim()) {
    pushUnique(questions, {
      id: RE_DOCS_MATCH_KEY,
      kind: "choice",
      label: docsMatchQuestionLabel(answers),
      options: RE_DOCS_MATCH_OPTIONS,
    });
    if (missing === "docsMatch") return questions;
  }

  if (needsSituationGapQuestion(answers) && !answers[RE_SITUATION_GAP_KEY]?.trim()) {
    pushUnique(questions, {
      id: RE_SITUATION_GAP_KEY,
      kind: "choice",
      label: situationGapQuestionLabel(answers),
      options: RE_SITUATION_GAP_OPTIONS,
    });
    if (missing === "situationGap") return questions;
  }

  if (needsCustomerInputQuestion(answers)) {
    pushUnique(questions, {
      id: REAL_ESTATE_CUSTOMER_INPUT_KEY,
      kind: "text",
      label: "아직 말씀하지 않은 핵심 사실이 있다면 적어 주세요",
      placeholder:
        "예: 상대가 약속한 반환일이 지났는데 연락이 두절되었습니다.",
    });
    if (missing === "customerInput") return questions;
  }

  return questions;
}

function phase2SituationProfile(answers: ReviewAnswers): RealEstateSituationProfile {
  return buildRealEstateSituationProfile(answers);
}

function profileFieldNeedsDepth(field: { status: RealEstateProfileFieldStatus }): boolean {
  return field.status === "unknown" || field.status === "inferred";
}

/** Phase 1 carry-over — read `re_*` only; never re-ask the same axis in Phase 2. */
function phase1DocsMatchValue(answers: ReviewAnswers): string | null {
  return answers[RE_DOCS_MATCH_KEY]?.trim() ?? null;
}

function phase1SituationGapValue(answers: ReviewAnswers): string | null {
  return answers[RE_SITUATION_GAP_KEY]?.trim() ?? null;
}

function phase1SituationGapDetail(answers: ReviewAnswers): string | null {
  return answers[RE_SITUATION_GAP_DETAIL_KEY]?.trim() ?? null;
}

function phase1HasDocsMismatchSignal(answers: ReviewAnswers): boolean {
  return phase1DocsMatchValue(answers) === "mismatch";
}

function phase1GapAlreadyCaptured(answers: ReviewAnswers): boolean {
  return Boolean(phase1SituationGapValue(answers) || phase1SituationGapDetail(answers));
}

/** PRE + docs match + low-risk goal — Phase 2 can complete without generic re2 stack. */
function phase1PreContractIsLowDepth(answers: ReviewAnswers): boolean {
  if (getRealEstateResolutionPath(answers) !== "PRE_CONTRACT") return false;
  if (phase1DocsMatchValue(answers) !== "match") return false;
  const goal = resolvedGoal(answers);
  if (goal === "risk_terms" || goal === "full_review" || goal === "notary") return false;
  const propertyType = resolvedPropertyType(answers);
  if (propertyType === "매매" || propertyType === "소유권" || propertyType === "계약금") {
    return false;
  }
  if (answers[RE_PRE_STAGE_KEY] === "deposit_agreed") return false;
  return true;
}

function phase1GoalNeedsClauseDepth(answers: ReviewAnswers): boolean {
  const goal = resolvedGoal(answers);
  return goal === "risk_terms" || goal === "full_review";
}

function phase1GoalNeedsRegistrationDepth(answers: ReviewAnswers): boolean {
  const goal = resolvedGoal(answers);
  return goal === "notary" || goal === "full_review" || goal === "risk_terms";
}

function isPhase2ChoiceAnswered(key: string, answers: ReviewAnswers): boolean {
  return Boolean(answers[key]?.trim());
}

function isPhase2TextAnswered(key: string, answers: ReviewAnswers): boolean {
  return Boolean(answers[key]?.trim());
}

function needsRegistrationConcernPhase2(answers: ReviewAnswers): boolean {
  if (answers[RE2_REGISTRATION_CONCERN_KEY]?.trim()) return false;

  const propertyType = resolvedPropertyType(answers);
  const goal = resolvedGoal(answers);
  const preStage = answers[RE_PRE_STAGE_KEY];
  const profile = phase2SituationProfile(answers);
  const propertyNeedsReg = propertyType === "매매" || propertyType === "소유권";
  const goalNeedsReg = phase1GoalNeedsRegistrationDepth(answers);
  const stageNeedsReg =
    (preStage === "draft_received" || preStage === "ready_to_sign") &&
    (propertyNeedsReg || goalNeedsReg);
  const rightsGap =
    getRealEstateResolutionPath(answers) === "PRE_CONTRACT" &&
    profileFieldNeedsDepth(profile.rights) &&
    (propertyNeedsReg || goalNeedsReg || phase1HasDocsMismatchSignal(answers));

  if (phase1DocsMatchValue(answers) === "match" && !propertyNeedsReg && !goalNeedsReg) {
    return false;
  }

  return propertyNeedsReg || goalNeedsReg || stageNeedsReg || rightsGap;
}

function needsClauseFocusPhase2(answers: ReviewAnswers): boolean {
  if (answers[RE2_CLAUSE_FOCUS_KEY]?.trim() || answers[RE2_CLAUSE_DETAIL_KEY]?.trim()) {
    return false;
  }

  const goal = resolvedGoal(answers);
  const preStage = answers[RE_PRE_STAGE_KEY];
  const gap = phase1SituationGapValue(answers);
  const regConcern = answers[RE2_REGISTRATION_CONCERN_KEY];

  if (phase1DocsMatchValue(answers) === "match" && !phase1GoalNeedsClauseDepth(answers)) {
    return false;
  }

  if (
    (regConcern === "owner_mismatch" || regConcern === "authority_unclear") &&
    !phase1GoalNeedsClauseDepth(answers)
  ) {
    return false;
  }

  if (gap === "party_denies" && !phase1GoalNeedsClauseDepth(answers)) {
    return false;
  }

  if (goal === "risk_terms" || goal === "full_review") return true;
  if (preStage === "deposit_agreed") return true;
  if (
    preStage === "draft_received" &&
    (phase1GoalNeedsClauseDepth(answers) || phase1HasDocsMismatchSignal(answers))
  ) {
    return true;
  }

  const profile = phase2SituationProfile(answers);
  return (
    getRealEstateResolutionPath(answers) === "PRE_CONTRACT" &&
    profileFieldNeedsDepth(profile.risk) &&
    !phase1GapAlreadyCaptured(answers)
  );
}

function needsMoneySituationPhase2(answers: ReviewAnswers): boolean {
  if (answers[RE2_MONEY_SITUATION_KEY]?.trim()) return false;

  const path = getRealEstateResolutionPath(answers);
  const gap = phase1SituationGapValue(answers);
  const clauseFocus = answers[RE2_CLAUSE_FOCUS_KEY];
  const regConcern = answers[RE2_REGISTRATION_CONCERN_KEY];

  if (clauseFocus === "deposit_terms") return true;
  if (clauseFocus === "termination_penalty" || clauseFocus === "delivery_handover") {
    return false;
  }

  if (
    gap === "party_denies" &&
    clauseFocus !== "deposit_terms" &&
    resolvedPropertyType(answers) !== "계약금" &&
    answers[RE_PRE_STAGE_KEY] !== "deposit_agreed"
  ) {
    return false;
  }

  if (
    (regConcern === "owner_mismatch" ||
      regConcern === "authority_unclear" ||
      regConcern === "encumbrance") &&
    gap !== "amount_diff" &&
    resolvedPropertyType(answers) !== "계약금"
  ) {
    return false;
  }

  if (
    resolvedPropertyType(answers) === "계약금" ||
    answers[RE_PRE_STAGE_KEY] === "deposit_agreed" ||
    gap === "amount_diff"
  ) {
    return true;
  }

  if (path === "PRE_CONTRACT") {
    if (phase1DocsMatchValue(answers) === "match" && gap !== "amount_diff") return false;
    return (
      profileFieldNeedsDepth(phase2SituationProfile(answers).money) &&
      (phase1GoalNeedsClauseDepth(answers) || gap === "party_denies")
    );
  }

  if (path === "POST_DISPUTE") {
    const dispute = resolvedDisputeSubject(answers);
    if (dispute === "deposit_return" || gap === "amount_diff") return true;
    if (dispute === "contract_breach" || dispute === "rent_increase") return false;
    return profileFieldNeedsDepth(phase2SituationProfile(answers).money);
  }

  return false;
}

function needsRegistrationDetailPhase2(answers: ReviewAnswers): boolean {
  return (
    answers[RE2_REGISTRATION_CONCERN_KEY] === "not_checked_yet" &&
    !answers[RE2_REGISTRATION_DETAIL_KEY]?.trim()
  );
}

function needsMoneyDetailPhase2(answers: ReviewAnswers): boolean {
  const situation = answers[RE2_MONEY_SITUATION_KEY];
  if (!situation || answers[RE2_MONEY_DETAIL_KEY]?.trim()) return false;
  return (
    situation === "amount_unclear" ||
    situation === "verbal_vs_written" ||
    situation === "return_unclear" ||
    situation === "extra_demand"
  );
}

function needsUnclearFactLockPhase2(answers: ReviewAnswers): boolean {
  return (
    getRealEstateResolutionPath(answers) === "UNCLEAR" &&
    !answers[RE2_UNCLEAR_FACT_LOCK_KEY]?.trim()
  );
}

/** Phase 2 composite resolvers — read FREE `re_*` (never write) + `re2_*` bridge. */
function resolvedDisputeSubject(answers: ReviewAnswers): string | null {
  const free = answers[RE_DISPUTE_SUBJECT_KEY]?.trim();
  if (free) return free;
  const moneyIssue = answers[RE2_UNCLEAR_MONEY_ISSUE_KEY];
  if (moneyIssue === "deposit_not_returned") return "deposit_return";
  if (moneyIssue === "payment_dispute") return "contract_breach";
  if (moneyIssue === "penalty_or_fee") return "damage_penalty";
  return null;
}

function resolvedDocSubject(answers: ReviewAnswers): string | null {
  const free = answers[RE_DOC_SUBJECT_KEY]?.trim();
  if (free) return free;
  const anchor = answers[RE2_UNCLEAR_DOC_ANCHOR_KEY];
  if (anchor === "lease_contract") return "lease_contract";
  if (anchor === "sale_contract") return "sale_contract";
  if (anchor === "notice_or_letter") return "notice_letter";
  if (anchor === "registration_doc") return "registration_doc";
  return null;
}

function resolvedCounterparty(answers: ReviewAnswers): string | null {
  const free = answers[RE_COUNTERPARTY_KEY]?.trim();
  if (free) return free;
  const focus = answers[RE2_UNCLEAR_PARTY_FOCUS_KEY];
  if (focus === "landlord_seller") return "owner_seller";
  if (focus === "tenant_buyer") return "tenant_buyer";
  if (focus === "agent_manager") return "agent_broker";
  if (focus === "authority") return "authority_court";
  return null;
}

function resolvedDocsMatch(answers: ReviewAnswers): string | null {
  return answers[RE_DOCS_MATCH_KEY]?.trim() ?? null;
}

type UnclearBridgeSpec = {
  key: string;
  label: string;
  options: { value: string; label: string }[];
};

function getUnclearBridgeSpec(answers: ReviewAnswers): UnclearBridgeSpec | null {
  if (getRealEstateResolutionPath(answers) !== "UNCLEAR") return null;
  const lock = answers[RE2_UNCLEAR_FACT_LOCK_KEY]?.trim();
  if (!lock) return null;

  if (lock === "money_status") {
    if (answers[RE2_UNCLEAR_MONEY_ISSUE_KEY]?.trim()) return null;
    if (resolvedDisputeSubject(answers)) return null;
    return {
      key: RE2_UNCLEAR_MONEY_ISSUE_KEY,
      label: "돈·보증금·계약금 문제에서 — 지금 가장 급한 쪽은 무엇에 가깝나요?",
      options: RE2_UNCLEAR_MONEY_ISSUE_OPTIONS,
    };
  }

  if (lock === "document_status") {
    if (answers[RE2_UNCLEAR_DOC_ANCHOR_KEY]?.trim()) return null;
    if (resolvedDocSubject(answers)) return null;
    return {
      key: RE2_UNCLEAR_DOC_ANCHOR_KEY,
      label: "지금 핵심으로 봐야 할 서류는 무엇에 가깝나요?",
      options: RE2_UNCLEAR_DOC_ANCHOR_OPTIONS,
    };
  }

  if (lock === "who_obligated") {
    if (answers[RE2_UNCLEAR_PARTY_FOCUS_KEY]?.trim()) return null;
    if (resolvedCounterparty(answers)) return null;
    return {
      key: RE2_UNCLEAR_PARTY_FOCUS_KEY,
      label: "누구와의 관계·의무가 먼저 불분명한가요?",
      options: RE2_UNCLEAR_PARTY_FOCUS_OPTIONS,
    };
  }

  if (lock === "timeline_status") {
    if (answers[RE2_UNCLEAR_TIMELINE_FOCUS_KEY]?.trim()) return null;
    if (answers[RE2_TIMELINE_STAGE_KEY]?.trim() || answers[RE2_TIMELINE_DETAIL_KEY]?.trim()) {
      return null;
    }
    return {
      key: RE2_UNCLEAR_TIMELINE_FOCUS_KEY,
      label: "시간 순서에서 — 가장 먼저 확인하고 싶은 것은 무엇인가요?",
      options: RE2_UNCLEAR_TIMELINE_FOCUS_OPTIONS,
    };
  }

  return null;
}

function needsUnclearBridgePhase2(answers: ReviewAnswers): boolean {
  return getUnclearBridgeSpec(answers) !== null;
}

function bridgeUsesMaterialStop(answers: ReviewAnswers): boolean {
  const bridgeValues = [
    answers[RE2_UNCLEAR_MONEY_ISSUE_KEY],
    answers[RE2_UNCLEAR_DOC_ANCHOR_KEY],
    answers[RE2_UNCLEAR_PARTY_FOCUS_KEY],
    answers[RE2_UNCLEAR_TIMELINE_FOCUS_KEY],
  ];
  return bridgeValues.some((v) => v === RE2_CANNOT_CLASSIFY_YET);
}

function getUnclearBridgeMaterialDetailKey(answers: ReviewAnswers): string | null {
  if (answers[RE2_UNCLEAR_MONEY_ISSUE_KEY] === RE2_CANNOT_CLASSIFY_YET) {
    if (!answers[RE2_UNCLEAR_MONEY_DETAIL_KEY]?.trim()) return RE2_UNCLEAR_MONEY_DETAIL_KEY;
  }
  if (answers[RE2_UNCLEAR_DOC_ANCHOR_KEY] === RE2_CANNOT_CLASSIFY_YET) {
    if (!answers[RE2_UNCLEAR_DOC_DETAIL_KEY]?.trim()) return RE2_UNCLEAR_DOC_DETAIL_KEY;
  }
  if (answers[RE2_UNCLEAR_PARTY_FOCUS_KEY] === RE2_CANNOT_CLASSIFY_YET) {
    if (!answers[RE2_UNCLEAR_PARTY_DETAIL_KEY]?.trim()) return RE2_UNCLEAR_PARTY_DETAIL_KEY;
  }
  if (answers[RE2_UNCLEAR_TIMELINE_FOCUS_KEY] === RE2_CANNOT_CLASSIFY_YET) {
    if (!answers[RE2_UNCLEAR_TIMELINE_DETAIL_KEY]?.trim()) return RE2_UNCLEAR_TIMELINE_DETAIL_KEY;
  }
  return null;
}

function needsUnclearBridgeMaterialDetailPhase2(answers: ReviewAnswers): boolean {
  return getUnclearBridgeMaterialDetailKey(answers) !== null;
}

/** Phase 2 bridge `cannot_classify_yet` — material missing until direct detail captured. */
export function realEstatePhase2UsesMaterialStop(answers: ReviewAnswers): boolean {
  return bridgeUsesMaterialStop(answers);
}

export function realEstatePhase2HasMaterialMissing(answers: ReviewAnswers): boolean {
  return needsUnclearBridgeMaterialDetailPhase2(answers);
}

/** Phase 2 chain path — UNCLEAR uses fact lock, never re-asks entry Q1. */
function effectivePhase2ResolutionPath(
  answers: ReviewAnswers,
): RealEstateResolutionPath | null {
  const path = getRealEstateResolutionPath(answers);
  if (path !== "UNCLEAR") return path;
  const lock = answers[RE2_UNCLEAR_FACT_LOCK_KEY];
  if (!lock) return null;
  if (lock === "document_status") return "DOCUMENT_REVIEW";
  return "POST_DISPUTE";
}

function needsMoneyRecoveryPhase2(answers: ReviewAnswers): boolean {
  if (answers[RE2_MONEY_RECOVERY_KEY]?.trim()) return false;
  const dispute = resolvedDisputeSubject(answers);
  if (dispute === "deposit_return") return true;
  if (
    dispute === "contract_breach" ||
    dispute === "damage_penalty" ||
    dispute === "rent_increase" ||
    dispute === "eviction" ||
    dispute === "ownership_dispute"
  ) {
    return false;
  }
  return (
    phase1SituationGapValue(answers) === "amount_diff" &&
    profileFieldNeedsDepth(phase2SituationProfile(answers).money)
  );
}

function needsBreachFocusPhase2(answers: ReviewAnswers): boolean {
  const dispute = resolvedDisputeSubject(answers);
  if (!dispute || answers[RE2_BREACH_FOCUS_KEY]?.trim()) return false;
  return (
    dispute === "contract_breach" ||
    dispute === "damage_penalty" ||
    dispute === "rent_increase"
  );
}

function needsFormalResponsePhase2(answers: ReviewAnswers): boolean {
  const goal = resolvedGoal(answers);
  if (!goal || answers[RE2_FORMAL_RESPONSE_KEY]?.trim()) return false;
  if (goal === "negotiating" || goal === "preparing_objection") return true;
  if (goal === "authority_filed" || goal === "after_decision") return true;
  if (goal === "before_response") {
    if (resolvedDisputeSubject(answers) === "deposit_return") return false;
    return phase1HasDocsMismatchSignal(answers) && !phase1GapAlreadyCaptured(answers);
  }
  return false;
}

function needsDisputeTimelinePhase2(answers: ReviewAnswers): boolean {
  if (answers[RE2_TIMELINE_STAGE_KEY]?.trim()) return false;
  if (answers[RE2_TIMELINE_DETAIL_KEY]?.trim()) return false;
  const gap = phase1SituationGapValue(answers);
  if (gap === "deadline_dispute") return true;

  const timelineFocus = answers[RE2_UNCLEAR_TIMELINE_FOCUS_KEY]?.trim();
  if (timelineFocus && timelineFocus !== RE2_CANNOT_CLASSIFY_YET) return true;

  const dispute = resolvedDisputeSubject(answers);
  if (dispute === "deposit_return") return true;
  if (dispute === "contract_breach" || dispute === "damage_penalty") {
    return Boolean(answers[RE2_BREACH_FOCUS_KEY]?.trim() || gap === "deadline_dispute");
  }

  if (
    effectivePhase2ResolutionPath(answers) === "POST_DISPUTE" &&
    profileFieldNeedsDepth(phase2SituationProfile(answers).dates)
  ) {
    return gap === "deadline_dispute" || Boolean(answers[RE2_MONEY_RECOVERY_KEY]?.trim());
  }

  return false;
}

function needsAuthorityStagePhase2(answers: ReviewAnswers): boolean {
  if (answers[RE2_AUTHORITY_STAGE_KEY]?.trim()) return false;
  const goal = resolvedGoal(answers);
  return (
    resolvedCounterparty(answers) === "authority_court" ||
    goal === "authority_filed" ||
    goal === "after_decision"
  );
}

function needsDocReliabilityPhase2(answers: ReviewAnswers): boolean {
  if (answers[RE2_DOC_RELIABILITY_KEY]?.trim()) return false;
  if (phase1DocsMatchValue(answers) === "match" && !phase1GapAlreadyCaptured(answers)) {
    return false;
  }

  const gap = phase1SituationGapValue(answers);
  if (gap === "missing_doc" || gap === "party_denies") return true;

  const doc = resolvedDocSubject(answers);
  if (!doc) return false;
  if (phase1DocsMatchValue(answers) === "match") return false;

  return (
    doc === "notice_letter" ||
    doc === "registration_doc" ||
    doc === "sale_contract" ||
    doc === "lease_contract"
  );
}

function needsTranslationIssuePhase2(answers: ReviewAnswers): boolean {
  if (answers[RE2_TRANSLATION_ISSUE_KEY]?.trim()) return false;
  return (
    resolvedGoal(answers) === "translation" ||
    phase1SituationGapValue(answers) === "translation_error"
  );
}

function needsConflictFocusPhase2(answers: ReviewAnswers): boolean {
  if (answers[RE2_CONFLICT_FOCUS_KEY]?.trim() || answers[RE2_CONFLICT_DETAIL_KEY]?.trim()) {
    return false;
  }
  if (resolvedDocsMatch(answers) !== "mismatch") return false;
  if (phase1GapAlreadyCaptured(answers)) return false;
  return true;
}

function needsClauseDetailPhase2(answers: ReviewAnswers): boolean {
  return (
    Boolean(answers[RE2_CLAUSE_FOCUS_KEY]?.trim()) &&
    !answers[RE2_CLAUSE_DETAIL_KEY]?.trim()
  );
}

function needsConflictDetailPhase2(answers: ReviewAnswers): boolean {
  if (answers[RE2_CONFLICT_DETAIL_KEY]?.trim()) return false;
  if (answers[RE2_CONFLICT_FOCUS_KEY]?.trim()) return true;
  if (resolvedDocsMatch(answers) === "mismatch" && phase1GapAlreadyCaptured(answers)) {
    return true;
  }
  return false;
}

function needsTimelineDetailPhase2(answers: ReviewAnswers): boolean {
  return (
    Boolean(answers[RE2_TIMELINE_STAGE_KEY]?.trim()) &&
    !answers[RE2_TIMELINE_DETAIL_KEY]?.trim()
  );
}

export function getActiveRealEstatePhase2StructuredDetailKey(
  answers: ReviewAnswers,
): string | null {
  const bridgeDetail = getUnclearBridgeMaterialDetailKey(answers);
  if (bridgeDetail) return bridgeDetail;
  if (needsRegistrationDetailPhase2(answers)) return RE2_REGISTRATION_DETAIL_KEY;
  if (needsClauseDetailPhase2(answers)) return RE2_CLAUSE_DETAIL_KEY;
  if (needsMoneyDetailPhase2(answers)) return RE2_MONEY_DETAIL_KEY;
  if (needsTimelineDetailPhase2(answers)) return RE2_TIMELINE_DETAIL_KEY;
  if (needsConflictDetailPhase2(answers)) return RE2_CONFLICT_DETAIL_KEY;
  return null;
}

function selectPrePhase2MissingInfo(answers: ReviewAnswers): RealEstatePhase2MissingId | null {
  if (needsRegistrationConcernPhase2(answers)) return "registrationConcern";
  if (needsRegistrationDetailPhase2(answers)) return "structuredDetail";
  if (needsClauseFocusPhase2(answers)) return "clauseFocus";
  if (needsClauseDetailPhase2(answers)) return "structuredDetail";
  if (needsMoneySituationPhase2(answers)) return "moneySituation";
  if (needsMoneyDetailPhase2(answers)) return "structuredDetail";
  if (needsConflictFocusPhase2(answers)) return "conflictFocus";
  if (needsConflictDetailPhase2(answers)) return "structuredDetail";
  return null;
}

function selectPostPhase2MissingInfo(answers: ReviewAnswers): RealEstatePhase2MissingId | null {
  if (needsMoneyRecoveryPhase2(answers)) return "moneyRecovery";
  if (needsBreachFocusPhase2(answers)) return "breachFocus";
  if (needsFormalResponsePhase2(answers)) return "formalResponse";
  if (needsDisputeTimelinePhase2(answers)) return "disputeTimeline";
  if (needsTimelineDetailPhase2(answers)) return "structuredDetail";
  if (needsAuthorityStagePhase2(answers)) return "authorityStage";
  if (needsConflictFocusPhase2(answers)) return "conflictFocus";
  if (needsConflictDetailPhase2(answers)) return "structuredDetail";
  return null;
}

function selectDocumentPhase2MissingInfo(answers: ReviewAnswers): RealEstatePhase2MissingId | null {
  if (needsDocReliabilityPhase2(answers)) return "docReliability";
  if (needsTranslationIssuePhase2(answers)) return "translationIssue";
  if (needsConflictFocusPhase2(answers)) return "conflictFocus";
  if (needsConflictDetailPhase2(answers)) return "structuredDetail";
  return null;
}

/** PAID Phase 2 — adaptive missing ID by Situation Profile gap (PRE/POST/DOCUMENT/UNCLEAR). */
export function selectRealEstatePhase2MissingInfo(
  answers: ReviewAnswers,
): RealEstatePhase2MissingId | null {
  if (!isRealEstatePhase1Complete(answers)) return null;

  if (needsUnclearFactLockPhase2(answers)) return "unclearFactLock";
  if (needsUnclearBridgePhase2(answers)) return "unclearBridge";
  if (needsUnclearBridgeMaterialDetailPhase2(answers)) return "structuredDetail";

  const path = effectivePhase2ResolutionPath(answers);
  if (path === "PRE_CONTRACT") {
    const pre = selectPrePhase2MissingInfo(answers);
    if (pre) return pre;
  } else if (path === "POST_DISPUTE") {
    const post = selectPostPhase2MissingInfo(answers);
    if (post) return post;
  } else if (path === "DOCUMENT_REVIEW") {
    const doc = selectDocumentPhase2MissingInfo(answers);
    if (doc) return doc;
  }

  if (getActiveRealEstatePhase2StructuredDetailKey(answers)) return "structuredDetail";

  return selectMinimumPhase2DeepeningMissing(answers);
}

/** Master parity — never exit Phase2 with zero deepening when path is active. */
function selectMinimumPhase2DeepeningMissing(
  answers: ReviewAnswers,
): RealEstatePhase2MissingId | null {
  const path = effectivePhase2ResolutionPath(answers);
  if (!path) return null;

  const hasPhase2Answer = REAL_ESTATE_PHASE2_ANSWER_KEYS.some((key) => answers[key]?.trim());
  if (hasPhase2Answer) return null;

  if (path === "PRE_CONTRACT") {
    if (needsConflictFocusPhase2(answers)) return "conflictFocus";
    return "clauseFocus";
  }
  if (path === "POST_DISPUTE") {
    if (needsMoneyRecoveryPhase2(answers)) return "moneyRecovery";
    return "breachFocus";
  }
  if (path === "DOCUMENT_REVIEW") {
    if (needsDocReliabilityPhase2(answers)) return "docReliability";
    return "conflictFocus";
  }

  return null;
}

function isRealEstatePhase2PathFieldsComplete(answers: ReviewAnswers): boolean {
  if (!isRealEstatePhase1Complete(answers)) return false;

  if (needsUnclearFactLockPhase2(answers)) return false;

  if (needsUnclearBridgePhase2(answers)) {
    const spec = getUnclearBridgeSpec(answers);
    if (spec && !answers[spec.key]?.trim()) return false;
  }
  if (needsUnclearBridgeMaterialDetailPhase2(answers)) return false;

  const path = effectivePhase2ResolutionPath(answers);
  if (path === "PRE_CONTRACT") {
    if (needsRegistrationConcernPhase2(answers)) return false;
    if (needsRegistrationDetailPhase2(answers)) return false;
    if (needsClauseFocusPhase2(answers)) return false;
    if (needsClauseDetailPhase2(answers)) return false;
    if (needsMoneySituationPhase2(answers)) return false;
    if (needsMoneyDetailPhase2(answers)) return false;
    if (needsConflictFocusPhase2(answers)) return false;
    if (needsConflictDetailPhase2(answers)) return false;
  } else if (path === "POST_DISPUTE") {
    if (needsMoneyRecoveryPhase2(answers)) return false;
    if (needsBreachFocusPhase2(answers)) return false;
    if (needsFormalResponsePhase2(answers)) return false;
    if (needsDisputeTimelinePhase2(answers)) return false;
    if (needsTimelineDetailPhase2(answers)) return false;
    if (needsAuthorityStagePhase2(answers)) return false;
    if (needsConflictFocusPhase2(answers)) return false;
    if (needsConflictDetailPhase2(answers)) return false;
  } else if (path === "DOCUMENT_REVIEW") {
    if (needsDocReliabilityPhase2(answers)) return false;
    if (needsTranslationIssuePhase2(answers)) return false;
    if (needsConflictFocusPhase2(answers)) return false;
    if (needsConflictDetailPhase2(answers)) return false;
  }

  if (getActiveRealEstatePhase2StructuredDetailKey(answers)) return false;

  return true;
}

export function isRealEstatePhase2Complete(answers: ReviewAnswers): boolean {
  if (!isRealEstatePhase1Complete(answers)) return false;
  return selectRealEstatePhase2MissingInfo(answers) === null;
}

/** Read-only Phase 2 completion lines for interim summary — does not re-ask. */
export function buildRealEstatePhase2CompletionLines(
  answers: ReviewAnswers,
): { label: string; value: string }[] {
  const lines: { label: string; value: string }[] = [];
  const registration = optionLabel(answers[RE2_REGISTRATION_CONCERN_KEY]);
  if (registration) {
    lines.push({ label: "등기·소유권 확인", value: registration });
  }
  const registrationDetail = answers[RE2_REGISTRATION_DETAIL_KEY]?.trim();
  if (registrationDetail) {
    lines.push({ label: "등기 확인 상세", value: registrationDetail });
  }
  const clause = optionLabel(answers[RE2_CLAUSE_FOCUS_KEY]);
  if (clause) {
    lines.push({ label: "걸리는 조항", value: clause });
  }
  const clauseDetail = answers[RE2_CLAUSE_DETAIL_KEY]?.trim();
  if (clauseDetail) {
    lines.push({ label: "조항 상세", value: clauseDetail });
  }
  const money = optionLabel(answers[RE2_MONEY_SITUATION_KEY]);
  if (money) {
    lines.push({ label: "금액·납부 조건", value: money });
  }
  const moneyDetail = answers[RE2_MONEY_DETAIL_KEY]?.trim();
  if (moneyDetail) {
    lines.push({ label: "금액·납부 상세", value: moneyDetail });
  }
  const moneyRecovery = optionLabel(answers[RE2_MONEY_RECOVERY_KEY]);
  if (moneyRecovery) {
    lines.push({ label: "보증금·반환 상태", value: moneyRecovery });
  }
  const breach = optionLabel(answers[RE2_BREACH_FOCUS_KEY]);
  if (breach) {
    lines.push({ label: "분쟁 핵심", value: breach });
  }
  const formal = optionLabel(answers[RE2_FORMAL_RESPONSE_KEY]);
  if (formal) {
    lines.push({ label: "공식 대응 단계", value: formal });
  }
  const timeline = optionLabel(answers[RE2_TIMELINE_STAGE_KEY]);
  if (timeline) {
    lines.push({ label: "문제 흐름", value: timeline });
  }
  const timelineDetail = answers[RE2_TIMELINE_DETAIL_KEY]?.trim();
  if (timelineDetail) {
    lines.push({ label: "문제 흐름 상세", value: timelineDetail });
  }
  const authority = optionLabel(answers[RE2_AUTHORITY_STAGE_KEY]);
  if (authority) {
    lines.push({ label: "기관 절차", value: authority });
  }
  const docRel = optionLabel(answers[RE2_DOC_RELIABILITY_KEY]);
  if (docRel) {
    lines.push({ label: "서류 신뢰", value: docRel });
  }
  const translation = optionLabel(answers[RE2_TRANSLATION_ISSUE_KEY]);
  if (translation) {
    lines.push({ label: "번역 대조", value: translation });
  }
  const conflict = optionLabel(answers[RE2_CONFLICT_FOCUS_KEY]);
  if (conflict) {
    lines.push({ label: "불일치 초점", value: conflict });
  }
  const conflictDetail = answers[RE2_CONFLICT_DETAIL_KEY]?.trim();
  if (conflictDetail) {
    lines.push({ label: "불일치 상세", value: conflictDetail });
  }
  const unclearLock = optionLabel(answers[RE2_UNCLEAR_FACT_LOCK_KEY]);
  if (unclearLock) {
    lines.push({ label: "우선 확인 사실", value: unclearLock });
  }
  const unclearMoney = optionLabel(answers[RE2_UNCLEAR_MONEY_ISSUE_KEY]);
  if (unclearMoney) {
    lines.push({ label: "돈·보증금 초점", value: unclearMoney });
  }
  const unclearDoc = optionLabel(answers[RE2_UNCLEAR_DOC_ANCHOR_KEY]);
  if (unclearDoc) {
    lines.push({ label: "핵심 서류", value: unclearDoc });
  }
  const unclearParty = optionLabel(answers[RE2_UNCLEAR_PARTY_FOCUS_KEY]);
  if (unclearParty) {
    lines.push({ label: "관계·의무 초점", value: unclearParty });
  }
  const unclearTimeline = optionLabel(answers[RE2_UNCLEAR_TIMELINE_FOCUS_KEY]);
  if (unclearTimeline) {
    lines.push({ label: "시간 순서 초점", value: unclearTimeline });
  }
  return lines;
}

function appendStructuredDetailQuestion(
  questions: ProfileQuestion[],
  answers: ReviewAnswers,
): boolean {
  const detailKey = getActiveRealEstatePhase2StructuredDetailKey(answers);
  if (!detailKey) return false;

  if (detailKey === RE2_REGISTRATION_DETAIL_KEY) {
    pushUnique(questions, {
      id: RE2_REGISTRATION_DETAIL_KEY,
      kind: "text",
      label: "등기 확인 전이라면 — 누구·어떤 서류·어떤 권리를 먼저 봐야 하는지 적어 주세요",
      placeholder:
        "예: 매도인과 등기부등본상 소유자가 다릅니다. 위임장·인감증명을 아직 받지 못했습니다.",
    });
  } else if (detailKey === RE2_MONEY_DETAIL_KEY) {
    pushUnique(questions, {
      id: RE2_MONEY_DETAIL_KEY,
      kind: "text",
      label: "지급·반환 방식이 불분명하다면 — 금액·시점·방식을 구체적으로 적어 주세요",
      placeholder:
        "예: 계약금 5천만 동은 입금했으나 반환 시점과 계좌가 계약서에 없습니다.",
    });
  } else if (detailKey === RE2_TIMELINE_DETAIL_KEY) {
    pushUnique(questions, {
      id: RE2_TIMELINE_DETAIL_KEY,
      kind: "text",
      label: "문제가 시작된 뒤 지금까지 — 언제·어떤 연락·대응이 있었는지 적어 주세요",
      placeholder:
        "예: 2024년 3월 반환일이 지났고, 5월부터 내용증명·문자를 보냈으나 상대는 연락을 끊었습니다.",
    });
  } else if (detailKey === RE2_CLAUSE_DETAIL_KEY) {
    pushUnique(questions, {
      id: RE2_CLAUSE_DETAIL_KEY,
      kind: "text",
      label: "걸리는 조항 — 어떤 문구·조건이 왜 불리한지 구체적으로 적어 주세요",
      placeholder:
        "예: 해지 시 보증금 전액 몰수 조항이 있고, 입주 전 해지도 동일하게 적용됩니다.",
    });
  } else if (detailKey === RE2_CONFLICT_DETAIL_KEY) {
    pushUnique(questions, {
      id: RE2_CONFLICT_DETAIL_KEY,
      kind: "text",
      label: "불일치 부분 — 서류와 실제 상황이 어디서·어떻게 다른지 적어 주세요",
      placeholder:
        "예: 계약서상 임대료는 800만 동인데, 최근 통지서에는 950만 동으로 기재되어 있습니다.",
    });
  } else if (detailKey === RE2_UNCLEAR_MONEY_DETAIL_KEY) {
    pushUnique(questions, {
      id: RE2_UNCLEAR_MONEY_DETAIL_KEY,
      kind: "text",
      label: "돈·보증금 문제를 분류하기 어렵다면 — 지금 상황을 직접 적어 주세요",
      placeholder:
        "예: 보증금 2억을 입금했는데, 임대인이 반환 시점과 금액을 부인하고 있습니다.",
    });
  } else if (detailKey === RE2_UNCLEAR_DOC_DETAIL_KEY) {
    pushUnique(questions, {
      id: RE2_UNCLEAR_DOC_DETAIL_KEY,
      kind: "text",
      label: "핵심 서류를 분류하기 어렵다면 — 어떤 서류인지 직접 적어 주세요",
      placeholder: "예: 전세계약서와 해지통지서가 각각 다른 금액으로 적혀 있습니다.",
    });
  } else if (detailKey === RE2_UNCLEAR_PARTY_DETAIL_KEY) {
    pushUnique(questions, {
      id: RE2_UNCLEAR_PARTY_DETAIL_KEY,
      kind: "text",
      label: "상대·관계가 불분명하다면 — 누구와 어떤 관계인지 직접 적어 주세요",
      placeholder: "예: 중개인 A와 집주인 B가 번갈아 연락하며 서로 다른 조건을 말합니다.",
    });
  } else if (detailKey === RE2_UNCLEAR_TIMELINE_DETAIL_KEY) {
    pushUnique(questions, {
      id: RE2_UNCLEAR_TIMELINE_DETAIL_KEY,
      kind: "text",
      label: "시간 순서가 불분명하다면 — 언제·어떤 일이 있었는지 직접 적어 주세요",
      placeholder:
        "예: 2024년 3월 입주 후 6월부터 보증금 반환을 요청했으나 아직 받지 못했습니다.",
    });
  }

  return true;
}

function appendUnclearPhase2QuestionChain(
  questions: ProfileQuestion[],
  answers: ReviewAnswers,
): void {
  if (needsUnclearFactLockPhase2(answers)) {
    pushUnique(questions, {
      id: RE2_UNCLEAR_FACT_LOCK_KEY,
      kind: "choice",
      label: "설명해 주신 내용을 바탕으로 — 지금 가장 먼저 확인해야 할 사실은 무엇인가요?",
      options: RE2_UNCLEAR_FACT_LOCK_OPTIONS,
    });
    if (!isPhase2ChoiceAnswered(RE2_UNCLEAR_FACT_LOCK_KEY, answers)) return;
  }

  if (needsUnclearBridgePhase2(answers)) {
    const spec = getUnclearBridgeSpec(answers);
    if (spec) {
      pushUnique(questions, {
        id: spec.key,
        kind: "choice",
        label: spec.label,
        options: spec.options,
      });
      if (!isPhase2ChoiceAnswered(spec.key, answers)) return;
    }
  }

  if (needsUnclearBridgeMaterialDetailPhase2(answers)) {
    appendStructuredDetailQuestion(questions, answers);
    const materialDetailKey = getUnclearBridgeMaterialDetailKey(answers);
    if (materialDetailKey && !isPhase2TextAnswered(materialDetailKey, answers)) return;
  }
}

function appendPrePhase2QuestionChain(
  questions: ProfileQuestion[],
  answers: ReviewAnswers,
): void {
  if (needsRegistrationConcernPhase2(answers)) {
    pushUnique(questions, {
      id: RE2_REGISTRATION_CONCERN_KEY,
      kind: "choice",
      label:
        "서명·납부 전에 등기·소유권 쪽에서 가장 먼저 확인하고 싶은 부분은 무엇인가요?",
      options: RE2_REGISTRATION_CONCERN_OPTIONS,
    });
    if (!isPhase2ChoiceAnswered(RE2_REGISTRATION_CONCERN_KEY, answers)) return;
  }
  if (needsRegistrationDetailPhase2(answers)) {
    appendStructuredDetailQuestion(questions, answers);
    if (!isPhase2TextAnswered(RE2_REGISTRATION_DETAIL_KEY, answers)) return;
  }
  if (needsClauseFocusPhase2(answers)) {
    pushUnique(questions, {
      id: RE2_CLAUSE_FOCUS_KEY,
      kind: "choice",
      label: "계약서·초안에서 지금 가장 걸리는 조항 유형은 무엇에 가깝나요?",
      options: RE2_CLAUSE_FOCUS_OPTIONS,
    });
    if (!isPhase2ChoiceAnswered(RE2_CLAUSE_FOCUS_KEY, answers)) return;
  }
  if (needsClauseDetailPhase2(answers)) {
    appendStructuredDetailQuestion(questions, answers);
    if (!isPhase2TextAnswered(RE2_CLAUSE_DETAIL_KEY, answers)) return;
  }
  if (needsMoneySituationPhase2(answers)) {
    pushUnique(questions, {
      id: RE2_MONEY_SITUATION_KEY,
      kind: "choice",
      label:
        "계약금·보증금·중도금 조건을 다시 짚어보면 — 지금 가장 걸리는 부분은 무엇인가요?",
      options: RE2_MONEY_SITUATION_OPTIONS,
    });
    if (!isPhase2ChoiceAnswered(RE2_MONEY_SITUATION_KEY, answers)) return;
  }
  if (needsMoneyDetailPhase2(answers)) {
    appendStructuredDetailQuestion(questions, answers);
    if (!isPhase2TextAnswered(RE2_MONEY_DETAIL_KEY, answers)) return;
  }
  if (needsConflictFocusPhase2(answers)) {
    pushUnique(questions, {
      id: RE2_CONFLICT_FOCUS_KEY,
      kind: "choice",
      label: "서류 내용과 실제 겪은 상황이 다를 때 — 무엇이 가장 크게 다릅니까?",
      options: RE2_CONFLICT_FOCUS_OPTIONS,
    });
    if (!isPhase2ChoiceAnswered(RE2_CONFLICT_FOCUS_KEY, answers)) return;
  }
  if (needsConflictDetailPhase2(answers)) {
    appendStructuredDetailQuestion(questions, answers);
    if (!isPhase2TextAnswered(RE2_CONFLICT_DETAIL_KEY, answers)) return;
  }
}

function appendPostPhase2QuestionChain(
  questions: ProfileQuestion[],
  answers: ReviewAnswers,
): void {
  if (needsMoneyRecoveryPhase2(answers)) {
    pushUnique(questions, {
      id: RE2_MONEY_RECOVERY_KEY,
      kind: "choice",
      label: "보증금·계약금을 돌려받지 못한 상황 — 지금 상태는 무엇에 가깝나요?",
      options: RE2_MONEY_RECOVERY_OPTIONS,
    });
    if (!isPhase2ChoiceAnswered(RE2_MONEY_RECOVERY_KEY, answers)) return;
  }
  if (needsBreachFocusPhase2(answers)) {
    pushUnique(questions, {
      id: RE2_BREACH_FOCUS_KEY,
      kind: "choice",
      label: "계약 위반·손해배상·조건 변경 문제에서 상대 주장의 핵심은 무엇인가요?",
      options: breachFocusOptionsForDispute(resolvedDisputeSubject(answers)),
    });
    if (!isPhase2ChoiceAnswered(RE2_BREACH_FOCUS_KEY, answers)) return;
  }
  if (needsFormalResponsePhase2(answers)) {
    pushUnique(questions, {
      id: RE2_FORMAL_RESPONSE_KEY,
      kind: "choice",
      label: "문제가 생긴 뒤 공식 대응을 어느 단계까지 하셨나요?",
      options: RE2_FORMAL_RESPONSE_OPTIONS,
    });
    if (!isPhase2ChoiceAnswered(RE2_FORMAL_RESPONSE_KEY, answers)) return;
  }
  if (needsDisputeTimelinePhase2(answers)) {
    pushUnique(questions, {
      id: RE2_TIMELINE_STAGE_KEY,
      kind: "choice",
      label: "문제가 시작된 시점과 지금까지의 흐름 — 어느 설명이 가장 가깝나요?",
      options: RE2_TIMELINE_STAGE_OPTIONS,
    });
    if (!isPhase2ChoiceAnswered(RE2_TIMELINE_STAGE_KEY, answers)) return;
  }
  if (needsTimelineDetailPhase2(answers)) {
    appendStructuredDetailQuestion(questions, answers);
    if (!isPhase2TextAnswered(RE2_TIMELINE_DETAIL_KEY, answers)) return;
  }
  if (needsAuthorityStagePhase2(answers)) {
    pushUnique(questions, {
      id: RE2_AUTHORITY_STAGE_KEY,
      kind: "choice",
      label: "경찰·검찰·법원·행정기관 관련 절차는 어느 단계인가요?",
      options: RE2_AUTHORITY_STAGE_OPTIONS,
    });
    if (!isPhase2ChoiceAnswered(RE2_AUTHORITY_STAGE_KEY, answers)) return;
  }
  if (needsConflictFocusPhase2(answers)) {
    pushUnique(questions, {
      id: RE2_CONFLICT_FOCUS_KEY,
      kind: "choice",
      label: "서류 내용과 실제 겪은 상황이 다를 때 — 무엇이 가장 크게 다릅니까?",
      options: RE2_CONFLICT_FOCUS_OPTIONS,
    });
    if (!isPhase2ChoiceAnswered(RE2_CONFLICT_FOCUS_KEY, answers)) return;
  }
  if (needsConflictDetailPhase2(answers)) {
    appendStructuredDetailQuestion(questions, answers);
    if (!isPhase2TextAnswered(RE2_CONFLICT_DETAIL_KEY, answers)) return;
  }
}

function appendDocumentPhase2QuestionChain(
  questions: ProfileQuestion[],
  answers: ReviewAnswers,
): void {
  if (needsDocReliabilityPhase2(answers)) {
    pushUnique(questions, {
      id: RE2_DOC_RELIABILITY_KEY,
      kind: "choice",
      label: "받은 서류 자체를 신뢰할 수 있는지 — 어떤 의심이 가장 큽니까?",
      options: RE2_DOC_RELIABILITY_OPTIONS,
    });
    if (!isPhase2ChoiceAnswered(RE2_DOC_RELIABILITY_KEY, answers)) return;
  }
  if (needsTranslationIssuePhase2(answers)) {
    pushUnique(questions, {
      id: RE2_TRANSLATION_ISSUE_KEY,
      kind: "choice",
      label: "원본과 번역본을 대조할 때 — 어떤 차이가 가장 걱정되나요?",
      options: RE2_TRANSLATION_ISSUE_OPTIONS,
    });
    if (!isPhase2ChoiceAnswered(RE2_TRANSLATION_ISSUE_KEY, answers)) return;
  }
  if (needsConflictFocusPhase2(answers)) {
    pushUnique(questions, {
      id: RE2_CONFLICT_FOCUS_KEY,
      kind: "choice",
      label: "서류 내용과 실제 겪은 상황이 다를 때 — 무엇이 가장 크게 다릅니까?",
      options: RE2_CONFLICT_FOCUS_OPTIONS,
    });
    if (!isPhase2ChoiceAnswered(RE2_CONFLICT_FOCUS_KEY, answers)) return;
  }
  if (needsConflictDetailPhase2(answers)) {
    appendStructuredDetailQuestion(questions, answers);
    if (!isPhase2TextAnswered(RE2_CONFLICT_DETAIL_KEY, answers)) return;
  }
}

/** Single-focus Phase2 question push — Admin Master `selectNextCaseResolutionFocus` parity. */
function pushRealEstatePhase2QuestionForMissing(
  questions: ProfileQuestion[],
  answers: ReviewAnswers,
  missing: RealEstatePhase2MissingId,
): void {
  switch (missing) {
    case "unclearFactLock":
      pushUnique(questions, {
        id: RE2_UNCLEAR_FACT_LOCK_KEY,
        kind: "choice",
        label: "설명해 주신 내용을 바탕으로 — 지금 가장 먼저 확인해야 할 사실은 무엇인가요?",
        options: RE2_UNCLEAR_FACT_LOCK_OPTIONS,
      });
      return;
    case "unclearBridge": {
      const spec = getUnclearBridgeSpec(answers);
      if (spec) {
        pushUnique(questions, {
          id: spec.key,
          kind: "choice",
          label: spec.label,
          options: spec.options,
        });
      }
      return;
    }
    case "structuredDetail":
      appendStructuredDetailQuestion(questions, answers);
      return;
    case "registrationConcern":
      pushUnique(questions, {
        id: RE2_REGISTRATION_CONCERN_KEY,
        kind: "choice",
        label:
          "서명·납부 전에 등기·소유권 쪽에서 가장 먼저 확인하고 싶은 부분은 무엇인가요?",
        options: RE2_REGISTRATION_CONCERN_OPTIONS,
      });
      return;
    case "clauseFocus":
      pushUnique(questions, {
        id: RE2_CLAUSE_FOCUS_KEY,
        kind: "choice",
        label: "계약서·초안에서 지금 가장 걸리는 조항 유형은 무엇에 가깝나요?",
        options: RE2_CLAUSE_FOCUS_OPTIONS,
      });
      return;
    case "moneySituation":
      pushUnique(questions, {
        id: RE2_MONEY_SITUATION_KEY,
        kind: "choice",
        label:
          "계약금·보증금·중도금 조건을 다시 짚어보면 — 지금 가장 걸리는 부분은 무엇인가요?",
        options: RE2_MONEY_SITUATION_OPTIONS,
      });
      return;
    case "moneyRecovery":
      pushUnique(questions, {
        id: RE2_MONEY_RECOVERY_KEY,
        kind: "choice",
        label: "보증금·계약금을 돌려받지 못한 상황 — 지금 상태는 무엇에 가깝나요?",
        options: RE2_MONEY_RECOVERY_OPTIONS,
      });
      return;
    case "breachFocus":
      pushUnique(questions, {
        id: RE2_BREACH_FOCUS_KEY,
        kind: "choice",
        label: "계약 위반·손해배상·조건 변경 문제에서 상대 주장의 핵심은 무엇인가요?",
        options: breachFocusOptionsForDispute(resolvedDisputeSubject(answers)),
      });
      return;
    case "formalResponse":
      pushUnique(questions, {
        id: RE2_FORMAL_RESPONSE_KEY,
        kind: "choice",
        label: "지금 공식 대응·협의·이의 단계는 어디에 가깝나요?",
        options: RE2_FORMAL_RESPONSE_OPTIONS,
      });
      return;
    case "disputeTimeline":
      pushUnique(questions, {
        id: RE2_TIMELINE_STAGE_KEY,
        kind: "choice",
        label: "문제가 시작된 뒤 지금까지 — 어느 단계에 가깝나요?",
        options: RE2_TIMELINE_STAGE_OPTIONS,
      });
      return;
    case "authorityStage":
      pushUnique(questions, {
        id: RE2_AUTHORITY_STAGE_KEY,
        kind: "choice",
        label: "경찰·법원·행정기관 절차는 어느 단계에 가깝나요?",
        options: RE2_AUTHORITY_STAGE_OPTIONS,
      });
      return;
    case "docReliability":
      pushUnique(questions, {
        id: RE2_DOC_RELIABILITY_KEY,
        kind: "choice",
        label: "받은 서류·계약서를 다시 보면 — 어떤 점이 가장 불안한가요?",
        options: RE2_DOC_RELIABILITY_OPTIONS,
      });
      return;
    case "translationIssue":
      pushUnique(questions, {
        id: RE2_TRANSLATION_ISSUE_KEY,
        kind: "choice",
        label: "원본과 번역본을 대조할 때 — 어떤 차이가 가장 걱정되나요?",
        options: RE2_TRANSLATION_ISSUE_OPTIONS,
      });
      return;
    case "conflictFocus":
      pushUnique(questions, {
        id: RE2_CONFLICT_FOCUS_KEY,
        kind: "choice",
        label: "서류 내용과 실제 겪은 상황이 다를 때 — 무엇이 가장 크게 다릅니까?",
        options: RE2_CONFLICT_FOCUS_OPTIONS,
      });
      return;
    default:
      return;
  }
}

/** PAID Phase 2 adaptive questions — Admin-style single focus early-return. */
export function buildRealEstatePhase2ProfileQuestions(
  answers: ReviewAnswers,
): ProfileQuestion[] {
  if (!isRealEstatePhase1Complete(answers)) return [];

  const missing = selectRealEstatePhase2MissingInfo(answers);
  if (!missing) return [];

  const questions: ProfileQuestion[] = [];
  pushRealEstatePhase2QuestionForMissing(questions, answers, missing);
  return questions;
}

export function seedRealEstateAnswersFromExternal(
  answers: ReviewAnswers,
  seed: {
    customerInput?: string;
    reviewStage?: "pre" | "post" | null;
    incidentType?: string | null;
    reviewFocus?: string | null;
    page1Stage?: string;
  },
): ReviewAnswers {
  const next = { ...answers };
  if (seed.customerInput?.trim() && !next[REAL_ESTATE_CUSTOMER_INPUT_KEY]?.trim()) {
    next[REAL_ESTATE_CUSTOMER_INPUT_KEY] = seed.customerInput.trim();
  }
  if (!next[REAL_ESTATE_ENTRY_Q1_KEY]) {
    if (seed.reviewStage === "pre" || seed.page1Stage === "prevent") {
      next[REAL_ESTATE_ENTRY_Q1_KEY] = "pre_contract";
    } else if (seed.reviewStage === "post" || seed.page1Stage === "case") {
      next[REAL_ESTATE_ENTRY_Q1_KEY] = "post_dispute";
    }
  }
  if (seed.incidentType && !next[RE_PROPERTY_TYPE_KEY]) {
    next[RE_PROPERTY_TYPE_KEY] = seed.incidentType;
  }
  if (seed.reviewFocus && !next[RE_GOAL_KEY]) {
    const focusToGoal: Record<string, string> = {
      "제출 요건과 형식": "requirements",
      "누락된 내용이나 서류": "missing_docs",
      "불리하거나 위험한 조항": "risk_terms",
      "원본과 번역본의 일치 여부": "translation",
      "공증·인증·영사확인 필요 여부": "notary",
      "전체 검토가 필요함": "full_review",
      "공식 대응 전": "before_response",
      "상대방·기관과 협의 중": "negotiating",
      "이의신청·통지 준비 중": "preparing_objection",
      "경찰·검찰·법원·행정기관 접수": "authority_filed",
      "판결·결정 후 후속 대응": "after_decision",
      "기타": "other_stage",
    };
    const mapped = focusToGoal[seed.reviewFocus];
    if (mapped) next[RE_GOAL_KEY] = mapped;
  }
  return next;
}

export function attachRealEstateProfileSnapshot(answers: ReviewAnswers): ReviewAnswers {
  const profile = buildRealEstateSituationProfile(answers);
  const missing = selectRealEstateMissingInfo(answers);
  const phase2Missing = isRealEstatePhase1Complete(answers)
    ? isRealEstatePhase2Complete(answers)
      ? null
      : selectRealEstatePhase2MissingInfo(answers) ?? "pending"
    : null;
  return {
    ...answers,
    [REAL_ESTATE_SITUATION_META_JSON_KEY]: JSON.stringify(profile),
    [REAL_ESTATE_RESOLUTION_PATH_KEY]: profile.resolutionPath ?? "",
    _realEstateProfilingComplete: missing ? "0" : "1",
    _realEstateNextMissing: missing ?? "",
    _realEstatePhase2Complete: phase2Missing === null ? "1" : "0",
    _realEstatePhase2NextMissing: phase2Missing === null ? "" : String(phase2Missing),
  };
}

export function buildRealEstateVerifyPageMeta(
  page1Meta: Record<string, string> | null,
  answers: ReviewAnswers,
): Record<string, string> {
  const profile = buildRealEstateSituationProfile(answers);
  const legacy = mapRealEstateAnswersToLegacyState(answers);
  const meta: Record<string, string> = {
    ...(page1Meta ?? {}),
    [REAL_ESTATE_SITUATION_META_JSON_KEY]: JSON.stringify(profile),
    [REAL_ESTATE_RESOLUTION_PATH_KEY]: profile.resolutionPath ?? "",
    review_stage: legacy.reviewStage ?? "",
    review_focus: legacy.reviewFocus ?? "",
    incident_type: legacy.incidentType ?? "",
    incident_description: legacy.incidentDescription,
    case_customer_input: legacy.incidentDescription,
  };
  if (answers[REAL_ESTATE_CUSTOMER_INPUT_KEY]) {
    meta.real_estate_customer_input = answers[REAL_ESTATE_CUSTOMER_INPUT_KEY];
  }
  return meta;
}

const RESOLUTION_PATH_TO_ENTRY: Record<RealEstateResolutionPath, string> = {
  PRE_CONTRACT: "pre_contract",
  POST_DISPUTE: "post_dispute",
  DOCUMENT_REVIEW: "document_review",
  UNCLEAR: "unsure",
};

function reverseOptionValue(
  sourceKey: string,
  label: string | null,
): string | null {
  if (!label?.trim()) return null;
  const trimmed = label.trim();
  if (sourceKey === RE_PROPERTY_TYPE_KEY) {
    const direct = RE_PROPERTY_TYPE_OPTIONS.find(
      (o) => o.value === trimmed || o.label === trimmed,
    );
    if (direct) return direct.value;
  }
  if (sourceKey === RE_DOCS_MATCH_KEY) {
    if (trimmed === "서류와 상황 일치 응답") return "match";
    if (trimmed === "불일치 응답") return "mismatch";
  }
  for (const [value, optionLabel] of Object.entries(REAL_ESTATE_OPTION_LABELS)) {
    if (optionLabel === trimmed) return value;
  }
  return null;
}

function tryAssignAnswerInto(
  answers: ReviewAnswers,
  key: string,
  label: string | null,
): boolean {
  if (answers[key]?.trim()) return true;
  const value = reverseOptionValue(key, label);
  if (value) {
    answers[key] = value;
    return true;
  }
  const trimmed = label?.trim();
  if (trimmed?.includes(" · ")) {
    const head = trimmed.split(" · ")[0]?.trim();
    if (head && tryAssignAnswerInto(answers, key, head)) return true;
  }
  return false;
}

function tryAssignAnswer(
  answers: ReviewAnswers,
  key: string,
  label: string | null,
): void {
  tryAssignAnswerInto(answers, key, label);
}

const PROFILE_ANSWER_FIELD_KEYS: (keyof Omit<
  RealEstateSituationProfile,
  "resolutionPath" | "customerInput"
>)[] = [
  "property",
  "transaction",
  "contractStage",
  "parties",
  "claims",
  "documents",
  "facts",
  "risk",
  "dates",
  "money",
  "actions",
  "responses",
  "rights",
  "evidence",
  "goal",
];

function restoreAnswerFromProfileField(
  answers: ReviewAnswers,
  profileField: RealEstateProfileField,
): void {
  const source = profileField.source?.trim();
  const rawValue = profileField.value?.trim();
  if (!source || !rawValue) return;
  if (source.startsWith("re2_")) return;

  if (source === "_realEstateEvidenceAttached") {
    answers._realEstateEvidenceAttached = "1";
    return;
  }

  if (source === RE_DOCS_MATCH_KEY) {
    if (rawValue === "서류와 상황 일치 응답") {
      answers[RE_DOCS_MATCH_KEY] = "match";
      return;
    }
    if (rawValue === "불일치 응답") {
      answers[RE_DOCS_MATCH_KEY] = "mismatch";
      return;
    }
    if (!tryAssignAnswerInto(answers, RE_DOCS_MATCH_KEY, rawValue)) {
      if (answers[RE_DOCS_MATCH_KEY] === "mismatch") {
        tryAssignAnswerInto(answers, RE_SITUATION_GAP_KEY, rawValue);
      }
    }
    return;
  }

  if (source === RE_SITUATION_GAP_KEY) {
    tryAssignAnswerInto(answers, RE_SITUATION_GAP_KEY, rawValue);
    return;
  }

  tryAssignAnswerInto(answers, source, rawValue);
}

/** Profile snapshot gap fields → `re_situationGap` when docs mismatch round-trip is incomplete. */
function fillMissingSituationGapFromProfile(
  answers: ReviewAnswers,
  profile: RealEstateSituationProfile,
): void {
  if (!needsSituationGapQuestion(answers) || answers[RE_SITUATION_GAP_KEY]?.trim()) return;

  for (const field of [profile.facts, profile.risk, profile.dates]) {
    if (!field.value?.trim()) continue;
    if (field.source === RE_SITUATION_GAP_KEY || field.source === RE_DOCS_MATCH_KEY) {
      tryAssignAnswerInto(answers, RE_SITUATION_GAP_KEY, field.value);
    } else {
      tryAssignAnswerInto(answers, RE_SITUATION_GAP_KEY, field.value);
    }
    if (answers[RE_SITUATION_GAP_KEY]?.trim()) return;
  }

  const riskText = profile.risk.value ?? "";
  if (/금액·보증금|보증금·중도금/.test(riskText)) {
    answers[RE_SITUATION_GAP_KEY] = "amount_diff";
  }
}

/** CRM meta의 `real_estate_situation_profile_json` → MASTER profiling answers 복원 */
export function restoreRealEstateProfilingAnswersFromMeta(
  meta: Record<string, unknown>,
): ReviewAnswers | null {
  const raw =
    typeof meta[REAL_ESTATE_SITUATION_META_JSON_KEY] === "string"
      ? meta[REAL_ESTATE_SITUATION_META_JSON_KEY]
      : null;
  if (!raw?.trim()) return null;

  let profile: RealEstateSituationProfile;
  try {
    profile = JSON.parse(raw) as RealEstateSituationProfile;
  } catch {
    return null;
  }

  const answers: ReviewAnswers = {};

  if (profile.resolutionPath && RESOLUTION_PATH_TO_ENTRY[profile.resolutionPath]) {
    answers[REAL_ESTATE_ENTRY_Q1_KEY] = RESOLUTION_PATH_TO_ENTRY[profile.resolutionPath];
  } else if (typeof meta[REAL_ESTATE_RESOLUTION_PATH_KEY] === "string") {
    const pathKey = meta[REAL_ESTATE_RESOLUTION_PATH_KEY] as RealEstateResolutionPath;
    if (RESOLUTION_PATH_TO_ENTRY[pathKey]) {
      answers[REAL_ESTATE_ENTRY_Q1_KEY] = RESOLUTION_PATH_TO_ENTRY[pathKey];
    }
  }

  const customerInput =
    profile.customerInput?.trim() ||
    (typeof meta.real_estate_customer_input === "string"
      ? meta.real_estate_customer_input.trim()
      : "");
  if (customerInput) {
    answers[REAL_ESTATE_CUSTOMER_INPUT_KEY] = customerInput;
  }

  for (const fieldKey of PROFILE_ANSWER_FIELD_KEYS) {
    restoreAnswerFromProfileField(answers, profile[fieldKey]);
  }
  fillMissingSituationGapFromProfile(answers, profile);

  const phase1FileName =
    typeof meta.file_name === "string" ? meta.file_name.trim() : "";
  if (phase1FileName) {
    answers[RE_PHASE1_EVIDENCE_FILE_NAME_KEY] = phase1FileName;
  } else if (typeof meta.storagePath === "string" || typeof meta.file_url === "string") {
    answers[RE_PHASE1_EVIDENCE_FILE_NAME_KEY] = "첨부 자료";
  }

  if (meta[REAL_ESTATE_PHASE2_EVIDENCE_ATTACHED_META_KEY] === "1") {
    answers._realEstateEvidenceAttached = "1";
    const phase2FileName =
      typeof meta[REAL_ESTATE_PHASE2_EVIDENCE_FILE_NAME_META_KEY] === "string"
        ? meta[REAL_ESTATE_PHASE2_EVIDENCE_FILE_NAME_META_KEY].trim()
        : "";
    if (phase2FileName) {
      answers._realEstateEvidenceFileName = phase2FileName;
    }
  }

  const withPhase2 = mergeRealEstatePhase2AnswersFromMeta(meta, answers);
  if (parseRealEstateRestoredProfilePhase(meta) === 2) {
    withPhase2[REAL_ESTATE_RESTORED_PROFILE_PHASE_KEY] = "2";
  }
  return attachRealEstateProfileSnapshot(withPhase2);
}

/** Whitelist `re2_*` raw answers for CRM meta persist (no FREE `re_*` duplication). */
export function extractRealEstatePhase2Answers(
  answers: ReviewAnswers,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of REAL_ESTATE_PHASE2_ANSWER_KEYS) {
    const value = answers[key]?.trim();
    if (value) out[key] = value;
  }
  for (const [key, value] of Object.entries(answers)) {
    if (!key.startsWith("re2_")) continue;
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (trimmed) out[key] = trimmed;
  }
  return out;
}

export function mergeRealEstatePhase2AnswersFromMeta(
  meta: Record<string, unknown>,
  answers: ReviewAnswers,
): ReviewAnswers {
  const raw = meta[REAL_ESTATE_PHASE2_ANSWERS_META_JSON_KEY];
  if (typeof raw !== "string" || !raw.trim()) return answers;
  try {
    const phase2 = JSON.parse(raw) as Record<string, unknown>;
    const next: ReviewAnswers = { ...answers };
    for (const [key, value] of Object.entries(phase2)) {
      if (key.startsWith("re2_") && typeof value === "string" && value.trim()) {
        next[key] = value.trim();
      }
    }
    return next;
  } catch {
    return answers;
  }
}

export function parseRealEstateRestoredProfilePhase(
  meta: Record<string, unknown>,
): RealEstateVerifyProfilePhase {
  if (meta[REAL_ESTATE_VERIFY_PROFILE_PHASE_META_KEY] === "2") return 2;
  const raw = meta[REAL_ESTATE_PHASE2_ANSWERS_META_JSON_KEY];
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed && trimmed !== "{}") return 2;
  }
  return 1;
}

function appendRealEstatePhase2EvidencePersistMeta(
  meta: Record<string, string>,
  answers: ReviewAnswers,
  storagePath?: string | null,
): void {
  if (answers._realEstateEvidenceAttached === "1") {
    meta[REAL_ESTATE_PHASE2_EVIDENCE_ATTACHED_META_KEY] = "1";
    const fileName = answers._realEstateEvidenceFileName?.trim();
    if (fileName) {
      meta[REAL_ESTATE_PHASE2_EVIDENCE_FILE_NAME_META_KEY] = fileName;
    }
  }
  if (storagePath) {
    meta[REAL_ESTATE_PHASE2_EVIDENCE_STORAGE_PATH_META_KEY] = storagePath;
  }
}

export function resolveRealEstatePhase2EvidenceFileName(
  answers: ReviewAnswers,
): string | null {
  const fromAnswers = answers._realEstateEvidenceFileName?.trim();
  return fromAnswers || null;
}

export function buildRealEstatePhase2PersistMeta(
  answers: ReviewAnswers,
  profilePhase: RealEstateVerifyProfilePhase,
  page1Meta?: Record<string, string> | null,
  phase2EvidenceStoragePath?: string | null,
): Record<string, string> {
  const profileMeta = buildRealEstateVerifyPageMeta(page1Meta ?? null, answers);
  const phase2Answers = extractRealEstatePhase2Answers(answers);
  const meta: Record<string, string> = {
    ...profileMeta,
    [REAL_ESTATE_VERIFY_PROFILE_PHASE_META_KEY]: String(profilePhase),
  };
  if (Object.keys(phase2Answers).length > 0) {
    meta[REAL_ESTATE_PHASE2_ANSWERS_META_JSON_KEY] = JSON.stringify(phase2Answers);
  }
  appendRealEstatePhase2EvidencePersistMeta(meta, answers, phase2EvidenceStoragePath);
  if (profilePhase === 2 && isRealEstatePhase2Complete(answers)) {
    meta[REAL_ESTATE_PHASE2_COMPLETE_META_KEY] = "1";
  }
  return meta;
}

export const REAL_ESTATE_EXPERT_HANDOFF_META_JSON_KEY = "real_estate_expert_handoff_json";

/** CRM expert_review_request meta — Case Profile + Phase answers (no schema change). */
export function buildRealEstateExpertHandoffMeta(
  answers: ReviewAnswers,
  page1Meta?: Record<string, string> | null,
): Record<string, unknown> {
  const profileMeta = buildRealEstateVerifyPageMeta(page1Meta ?? null, answers);
  const profile = buildRealEstateSituationProfile(answers);
  const phase2Answers = extractRealEstatePhase2Answers(answers);
  const phase1CarryOver = buildRealEstatePhase1CarryOverLines(answers);
  const phase2Completion = buildRealEstatePhase2CompletionLines(answers);

  const confirmedFacts: string[] = [];
  const customerClaims: string[] = [];
  const counterpartyClaims: string[] = [];
  const inferredFacts: string[] = [];
  const unknownFacts: string[] = [];
  for (const [key, field] of Object.entries(profile)) {
    if (key === "customerInput" || key === "resolutionPath") continue;
    if (!field || typeof field !== "object" || !("status" in field)) continue;
    const profileField = field as { value: string | null; status: RealEstateProfileFieldStatus };
    if (!profileField.value?.trim()) continue;
    const line = `${key}: ${profileField.value}`;
    if (profileField.status === "confirmed") confirmedFacts.push(line);
    else if (profileField.status === "customer_claim") customerClaims.push(line);
    else if (profileField.status === "counterparty_claim") counterpartyClaims.push(line);
    else if (profileField.status === "unknown") unknownFacts.push(line);
    else inferredFacts.push(line);
  }

  if (profile.customerInput?.trim()) {
    customerClaims.push(`customerInput: ${profile.customerInput.trim()}`);
  }

  const expertFocus =
    profile.goal.value ??
    profile.claims.value ??
    profile.risk.value ??
    profile.documents.value ??
    "";

  return {
    ...profileMeta,
    [REAL_ESTATE_PHASE2_ANSWERS_META_JSON_KEY]: JSON.stringify(phase2Answers),
    [REAL_ESTATE_EXPERT_HANDOFF_META_JSON_KEY]: JSON.stringify({
      customerOriginalInput: profile.customerInput ?? "",
      resolutionPath: profile.resolutionPath,
      situationProfile: profile,
      phase1CarryOver,
      phase2Answers,
      phase2Completion,
      confirmedFacts,
      customerClaims,
      counterpartyClaims,
      inferredFacts,
      unknownFacts,
      expertFocus,
      materialStop: realEstatePhase2HasMaterialMissing(answers),
    }),
  };
}

export function applyRealEstateCustomerInputSeed(
  answers: ReviewAnswers,
  customerInput: string,
): ReviewAnswers {
  const trimmed = customerInput.trim();
  if (!trimmed) return answers;
  const next: ReviewAnswers = { ...answers, [REAL_ESTATE_CUSTOMER_INPUT_KEY]: trimmed };
  if (!next[REAL_ESTATE_ENTRY_Q1_KEY]) {
    const inferredEntry = inferEntryFromText(trimmed);
    if (inferredEntry) next[REAL_ESTATE_ENTRY_Q1_KEY] = inferredEntry;
  }
  if (!next[RE_PROPERTY_TYPE_KEY]) {
    const inferredProperty = inferPropertyTypeFromText(trimmed);
    if (inferredProperty) next[RE_PROPERTY_TYPE_KEY] = inferredProperty;
  }
  return attachRealEstateProfileSnapshot(next);
}
