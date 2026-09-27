import type { ReviewAnswers } from "@/components/cost-check/MasterReviewQuotationReport";
import {
  appendCase06RedesignPathQuestions,
  CASE06_BRIDGE_SNAPSHOT_COMMITTED_KEY,
  CASE06_BRIDGE_TARGET_CASE_KEY,
  CASE06_CANDIDATE_TO_TARGET_CASE,
  CASE06_V11_CHAIN_FIELD_KEYS,
  CASE06_V11_FIELD_OPTIONS,
  CASE06_V11_PERSIST_ANSWER_KEYS,
  CASE06_V11_PHASE1_FIELD_ORDER,
  isCase06BridgeSnapshotCommitted,
  isCase06ExpertTerminal,
  appendCase06DeadlineDateTextIfNeeded,
  CASE06_DEADLINE_DATE_KEY,
  case06NeedsDeadlineDate,
  getCase06RequiredActionCandidateLabel,
  isCase06LegacyRestorePath,
  isCase06Phase2ChainComplete,
  isCase06RedesignPhase1Complete,
  isCase06LaunchSimplifiedSession,
  maybeApplyCase06LaunchExpertHandoff,
  selectCase06RedesignResolutionFocus,
} from "./adminVerifyCase06Redesign";

export {
  applyCase06BridgeSnapshot,
  isCase06AwaitingBridgeSnapshot,
  isCase06ExpertTerminal,
  isCase06Phase2ChainComplete,
  maybeApplyCase06ExpertTerminalOnAnswer,
  maybeApplyCase06LaunchExpertHandoff,
  isCase06LaunchSimplifiedSession,
  CASE06_BRIDGE_SNAPSHOT_COMMITTED_KEY,
  CASE06_BRIDGE_TARGET_CASE_KEY,
} from "./adminVerifyCase06Redesign";
import {
  case01IsPhase2FacetOnPath,
} from "./adminVerifyCase01Ratio";
import {
  ADMIN_VERIFY_MULTI_CHOICE_FIELD_IDS,
  adminVerifyAnswerIncludesSlug,
  formatAdminVerifyMultiChoiceAnswerLabel,
  getAdminVerifyEffectiveChoiceSlugs,
  isAdminVerifyMultiChoiceField,
  isAdminVerifyMultiChoiceFieldComplete,
  normalizeAdminVerifyMultiChoiceRaw,
} from "./adminVerifyChoiceMultiValue";
import {
  canonicalizeAdminVerifyChoiceAnswer,
  canonicalizeAdminVerifyChoiceSlug,
  getLegacyChoiceLabel,
  resolveAdminVerifyChoiceSlugForJudgment,
  slugMatchesChoiceValue,
} from "./adminVerifyChoiceSlugCanonical";
import {
  CASE05_APPEAL_DETAIL_OPTIONS_V2,
  CASE05_AUTHORITY_FOLLOWUP_OPTIONS_V2,
  CASE05_BLOCKAGE_OPTIONS_V2,
  CASE05_CONFIRM_GOAL_OPTIONS_V2,
  CASE05_CUSTOMER_RESPONSE_OPTIONS_V2,
  CASE05_DEADLINE_OPTIONS_V2,
  CASE05_DISPOSITION_DETAIL_OPTIONS_V2,
  CASE05_DISPOSITION_REASON_OPTIONS_V2,
  CASE05_DISPOSITION_TYPE_OPTIONS_V2,
  CASE05_EVIDENCE_OPTIONS_V2,
  CASE05_EXPLANATION_DETAIL_OPTIONS_V2,
  CASE05_FACT_DETAIL_OPTIONS_V2,
  CASE05_FACT_RELATIONSHIP_OPTIONS_V2,
  CASE05_FINAL_GOAL_OPTIONS_V2,
  CASE05_LEGACY_APPEAL_DETAIL_LABELS,
  CASE05_LEGACY_DISPOSITION_REASON_LABELS,
  CASE05_LEGACY_EXPLANATION_DETAIL_LABELS,
  CASE05_LEGACY_AUTHORITY_FOLLOWUP_LABELS,
  CASE05_LEGACY_BLOCKAGE_LABELS,
  CASE05_LEGACY_EVIDENCE_LABELS,
  CASE05_LEGACY_FINAL_GOAL_LABELS,
  CASE05_SUBMITTED_DOCS_DETAIL_OPTIONS_V2,
  CASE05_V2_FIELD_OPTION_MAP,
  CASE05_V2_QUESTION_LABELS,
  case05EffectiveAppealDetail,
  case05EffectiveAuthorityFollowUp,
  case05EffectiveBlockageSlug,
} from "./adminVerifyCase05ChoiceFinalV2";
import {
  CASE04_ADD_DOC_DETAIL_OPTIONS_V3,
  CASE04_AUTHORITY_FOLLOWUP_OPTIONS_V3,
  CASE04_BLOCKAGE_OPTIONS_V3,
  CASE04_CONFIRM_GOAL_OPTIONS_V3,
  CASE04_CUSTOMER_RESPONSE_OPTIONS_V3,
  CASE04_DEADLINE_OPTIONS_V3,
  CASE04_EVIDENCE_DETAIL_OPTIONS_V3,
  CASE04_EVIDENCE_OPTIONS_V3,
  CASE04_FINAL_GOAL_OPTIONS_V3,
  CASE04_INITIAL_SUBMISSION_OPTIONS_V3,
  CASE04_LEGACY_AUTHORITY_FOLLOWUP_LABELS,
  CASE04_LEGACY_EVIDENCE_LABELS,
  CASE04_LEGACY_UNCLEAR_FOCUS_LABELS,
  CASE04_MODIFY_DETAIL_OPTIONS_V3,
  CASE04_REPEAT_SUPPLEMENT_OPTIONS_V3,
  CASE04_SUBMISSION_RELATION_OPTIONS_V3,
  CASE04_SUPPLEMENT_REASON_OPTIONS_V3,
  CASE04_SUPPLEMENT_TARGET_OPTIONS_V3,
  CASE04_UNCLEAR_FOCUS_OPTIONS_V3,
  CASE04_V3_FIELD_OPTION_MAP,
  CASE04_V3_QUESTION_LABELS,
  case04EffectiveAuthorityFollowUp,
} from "./adminVerifyCase04ChoiceFinalV3";
import {
  CASE01_PHASE2_FACET_FIELD_OPTION_MAP,
  CASE01_AUTHORITY_FOLLOW_UP_KIND_OPTIONS,
  CASE01_FACT_CONFLICT_FACET_OPTIONS,
  CASE01_SPATIOTEMPORAL_FACET_OPTIONS,
  CASE01_COMPARE_RECORD_GAP_OPTIONS,
  CASE01_LANGUAGE_ACCESS_FACT_OPTIONS,
  CASE01_UNCLEAR_DEMAND_FACT_OPTIONS,
  CASE01_NOTICE_DELIVERY_FACT_OPTIONS,
  CASE01_PROCEDURE_STAGE_FACT_OPTIONS,
  CASE01_OFFICE_IDENTITY_FACT_OPTIONS,
  CASE01_PAYMENT_INSTRUCTION_FACT_OPTIONS,
  CASE01_ATTEND_INSTRUCTION_FACT_OPTIONS,
  CASE01_SUPPLEMENT_INSTRUCTION_FACT_OPTIONS,
  CASE01_CORRECT_TARGET_FACT_OPTIONS,
} from "./adminVerifyCase01Phase2FacetOptions";

/** VERIFY 행정문서 — 1차(핵심) / 2차(개인화) 질문 단계 */
export type AdminVerifyProfilePhase = 1 | 2;

/** Internal profile — not shown to customers */
export type AdminSituation =
  | "pre_submission"
  | "received_document"
  | "post_submission_problem"
  | "unknown_problem"
  | "unsure";

export type ProfileQuestion =
  | {
      id: string;
      kind: "choice";
      label: string;
      options: { value: string; label: string }[];
    }
  | {
      id: string;
      kind: "text";
      label: string;
      placeholder: string;
    }
  | {
      id: string;
      kind: "followUpChoice";
      label: string;
      options: { value: string; title: string }[];
      placeholder: string;
    };

const ADMIN_OTHER_OPTION = { value: "other", title: "기타 · 직접 입력" };

export const ADMIN_DIRECT_EXPLAIN_LABEL =
  "위에 내용이 없거나 설명이 필요합니다 → 직접 입력";

/** CASE choice — 공식 직접 입력 선택지 (기타 ≠ 직접 입력) */
export const ADMIN_DIRECT_EXPLAIN_CHOICE = {
  value: "other",
  label: ADMIN_DIRECT_EXPLAIN_LABEL,
};

export function isAdminDirectExplainOption(opt: { value: string; label: string }): boolean {
  return opt.value === "other" && opt.label === ADMIN_DIRECT_EXPLAIN_LABEL;
}

export function getAdminChoiceNoteKey(questionId: string): string {
  return `${questionId}Note`;
}

export const ADMIN_SITUATION_OPTIONS: { value: AdminSituation; label: string }[] = [
  { value: "pre_submission", label: "서류를 제출하거나 계약하기 전에 확인하고 있어요" },
  { value: "received_document", label: "기관이나 상대방에게서 서류를 받았어요" },
  { value: "post_submission_problem", label: "서류를 제출했는데 문제가 생겼어요" },
  { value: "unknown_problem", label: "서류와 관련된 문제가 생겼는데 무엇이 문제인지 모르겠어요" },
  { value: "unsure", label: "잘 모르겠어요" },
];

/** VERIFY 행정문서 — 고객-facing Q1 (홈 최초 입력 이후 사건 좁히기) */
export const ADMIN_CASE_ENTRY_Q1_KEY = "adminCaseDocumentKind";
export const ADMIN_CASE_ENTRY_Q1_OTHER_KEY = "adminCaseDocumentKindNote";
/** docs/master/VFBCAI_ENTRY_Q1_CHOICE_FINAL_v1_CLAUDE.md (verbatim). 라우팅 로직 변경 없음. */
export const ADMIN_CASE_ENTRY_Q1_LABEL = "교통국으로부터 받은 안내는 어떤 내용이었나요?";

export const ADMIN_CASE_ENTRY_Q1_OPTIONS: { value: string; label: string }[] = [
  {
    value: "violation_notice",
    label: "교통위반이 있었다는 통지를 받았고, 아직 벌금이나 출석 요구는 받지 않았습니다.",
  },
  {
    value: "payment_demand",
    label: "위반이나 절차 문제로 벌금·비용을 납부하라는 안내를 받았습니다.",
  },
  {
    value: "attendance_demand",
    label: "교통국에 직접 방문하거나, 상황을 설명하라는 안내를 받았습니다.",
  },
  {
    value: "supplement_demand",
    label: "서류를 제출한 뒤, 추가 서류를 내거나 다시 준비하라는 안내를 받았습니다.",
  },
  {
    value: "disposition_notice",
    label: "면허나 허가가 정지·취소되었거나, 신청이 승인되지 않았다는 통지를 받았습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const ADMIN_CASE_ENTRY_Q1_TO_CASE: Record<string, string> = {
  violation_notice: "CASE_01",
  payment_demand: "CASE_02",
  attendance_demand: "CASE_03",
  supplement_demand: "CASE_04",
  disposition_notice: "CASE_05",
  unclear: "CASE_06",
};

export const ADMIN_CASE_ENTRY_Q1_OPTION_LABELS: Record<string, string> = {
  ...Object.fromEntries(ADMIN_CASE_ENTRY_Q1_OPTIONS.map((o) => [o.value, o.label])),
  /** 화면에서 제거된 옛 선택지 — 저장된 답의 요약 표시용 */
  unclear: "무슨 내용인지 잘 모르겠습니다.",
  other: "직접 설명하기",
};

export function isAdminCaseEntryQ1Complete(answers: ReviewAnswers): boolean {
  const entry = answers[ADMIN_CASE_ENTRY_Q1_KEY];
  if (!entry) return false;
  if (entry === "other") {
    return Boolean(answers[ADMIN_CASE_ENTRY_Q1_OTHER_KEY]?.trim());
  }
  return true;
}

const DOCUMENT_TYPE_OPTIONS = [
  { value: "admin_doc", label: "행정기관 제출서류" },
  { value: "contract", label: "계약서" },
  { value: "corporate", label: "법인·투자 서류" },
  { value: "labor", label: "노동·고용 서류" },
  { value: "permit", label: "인허가 서류" },
  { value: "tax", label: "세무 서류" },
  { value: "translation", label: "번역·공증·인증 서류" },
  { value: "other", label: "기타" },
];

const CHECK_GOAL_OPTIONS = [
  { value: "requirements", label: "제출 요건과 형식" },
  { value: "content", label: "서류 내용·기재사항" },
  { value: "format_proof", label: "서명·번역·공증·증빙" },
  { value: "submission", label: "제출기관·제출 방법" },
  { value: "deadline", label: "제출기한·유효기간" },
  { value: "full", label: "전체적으로 확인이 필요합니다" },
];

const SOURCE_OPTIONS = [
  { value: "immigration", label: "출입국·거주 관련 기관" },
  { value: "labor", label: "노동·고용 관련 기관" },
  { value: "tax", label: "세무 관련 기관" },
  { value: "court", label: "법원·수사·행정 통지" },
  { value: "counterparty", label: "상대방·거래처" },
  { value: "other", label: "기타" },
];

const RECEIVED_REASON_OPTIONS = [
  { value: "review_request", label: "검토·확인 요청을 받았습니다" },
  { value: "supplement", label: "보완·추가 제출 요청입니다" },
  { value: "rejection", label: "반려·불승인 통지입니다" },
  { value: "contract", label: "계약·거래 관련 서류입니다" },
  { value: "other", label: "기타" },
];

const PROCESS_STAGE_OPTIONS = [
  { value: "before_action", label: "아직 대응 전입니다" },
  { value: "in_review", label: "검토·협의 중입니다" },
  { value: "submitted", label: "이미 제출·접수했습니다" },
  { value: "waiting", label: "기관·상대방 답변을 기다리는 중입니다" },
  { value: "other", label: "기타" },
];

const ACTION_TAKEN_OPTIONS = [
  { value: "none", label: "아직 특별한 조치는 없습니다" },
  { value: "contacted", label: "기관·상대방에 문의했습니다" },
  { value: "resubmitted", label: "서류를 다시 제출했습니다" },
  { value: "lawyer", label: "전문가·대행에 문의했습니다" },
  { value: "other", label: "기타" },
];

const CURRENT_GOAL_OPTIONS = [
  { value: "understand", label: "무엇을 해야 하는지 알고 싶습니다" },
  { value: "prepare", label: "제출·대응 준비가 필요합니다" },
  { value: "fix", label: "문제를 해결하고 싶습니다" },
  { value: "deadline", label: "기한 안에 처리하고 싶습니다" },
  { value: "other", label: "기타" },
];

const PROBLEM_TYPE_OPTIONS = [
  { value: "rejected", label: "반려·불승인·보완 요청" },
  { value: "mismatch", label: "서류 내용이 실제와 다름" },
  { value: "missing", label: "누락·오류가 있음" },
  { value: "format", label: "형식·증빙 문제" },
  { value: "deadline", label: "기한·절차 문제" },
  { value: "other", label: "기타" },
];

const PROBLEM_DISCOVERY_OPTIONS = [
  { value: "notice", label: "기관·상대방 안내를 받았습니다" },
  { value: "portal", label: "온라인·접수 시스템에서 확인했습니다" },
  { value: "self", label: "직접 확인했습니다" },
  { value: "other", label: "기타" },
];

const AUTHORITY_GUIDANCE_OPTIONS = [
  { value: "yes_clear", label: "안내를 받았고 내용을 이해했습니다" },
  { value: "yes_unclear", label: "안내를 받았지만 내용이 불명확합니다" },
  { value: "no", label: "아직 안내를 받지 못했습니다" },
  { value: "unsure", label: "기관 안내 내용을 정확히 이해하지 못했습니다." },
];

const PERCEIVED_ISSUE_OPTIONS = [
  { value: "document", label: "서류 내용·형식이 문제일 수 있습니다" },
  { value: "procedure", label: "절차·제출 방법이 문제일 수 있습니다" },
  { value: "deadline", label: "기한·유효기간이 문제일 수 있습니다" },
  { value: "authority", label: "기관·상대방 대응이 문제일 수 있습니다" },
  { value: "unknown", label: "무엇이 문제인지 모르겠습니다" },
];

const HAS_DOCUMENT_OPTIONS = [
  { value: "yes", label: "네, 확인할 서류가 있습니다" },
  { value: "no", label: "아직 서류가 없거나 확정되지 않았습니다" },
  { value: "unknown", label: "서류가 있는지 아직 확인하지 못했습니다." },
];

export function deriveStageFromSituation(situation: string | undefined): string | undefined {
  if (situation === "pre_submission" || situation === "received_document") return "prevent";
  if (
    situation === "post_submission_problem" ||
    situation === "unknown_problem" ||
    situation === "unsure"
  ) {
    return "case";
  }
  return undefined;
}

export function markFieldAsked(answers: ReviewAnswers, fieldId: string): ReviewAnswers {
  return { ...answers, [`_asked_${fieldId}`]: "1" };
}

export function wasFieldAsked(answers: ReviewAnswers, fieldId: string): boolean {
  return answers[`_asked_${fieldId}`] === "1";
}

export function isProfileQuestionAnswered(
  question: ProfileQuestion,
  answers: ReviewAnswers,
): boolean {
  const value = answers[question.id]?.trim() ?? "";
  if (question.kind === "text") return value.length > 0;
  if (question.kind === "followUpChoice") return value.length > 0 && value !== "other";
  return value.length > 0;
}

function needsSituationNote(situation: string | undefined): boolean {
  return (
    situation === "unsure" ||
    situation === "unknown_problem" ||
    situation === "post_submission_problem"
  );
}

function goalNeeds(goal: string | undefined, token: string): boolean {
  if (!goal) return false;
  return goal === "full" || goal === token;
}

function shouldAskDocs(answers: ReviewAnswers): boolean {
  const situation = answers.situation;
  if (situation === "pre_submission") return answers.profileHasDocument === "yes";
  if (situation === "received_document" || situation === "post_submission_problem") return true;
  if (situation === "unknown_problem" || situation === "unsure") {
    const issue = answers.profilePerceivedIssue;
    return issue === "document" || issue === "mismatch" || answers.profileHasDocument === "yes";
  }
  return false;
}

function shouldAskContentCheck(answers: ReviewAnswers): boolean {
  const situation = answers.situation;
  if (situation === "pre_submission") return goalNeeds(answers.profileCheckGoal, "content");
  if (situation === "post_submission_problem") {
    const problem = answers.profileProblemType;
    return problem === "missing" || problem === "mismatch" || problem === "other";
  }
  if (situation === "unknown_problem" || situation === "unsure") {
    return answers.profilePerceivedIssue === "document";
  }
  if (situation === "received_document") {
    return (
      answers.profileReceivedReason === "supplement" || answers.profileReceivedReason === "rejection"
    );
  }
  return false;
}

function shouldAskFormatProof(answers: ReviewAnswers): boolean {
  const situation = answers.situation;
  if (situation === "pre_submission") {
    return (
      goalNeeds(answers.profileCheckGoal, "format_proof") ||
      answers.profileDocumentType === "translation"
    );
  }
  if (situation === "post_submission_problem") return answers.profileProblemType === "format";
  if (situation === "unknown_problem" || situation === "unsure") {
    return answers.profilePerceivedIssue === "document";
  }
  return false;
}

function shouldAskSubmission(answers: ReviewAnswers): boolean {
  const situation = answers.situation;
  if (situation === "pre_submission") return goalNeeds(answers.profileCheckGoal, "submission");
  if (situation === "post_submission_problem") {
    return answers.profileProblemType === "rejected" || answers.profileCurrentGoal === "prepare";
  }
  if (situation === "received_document") {
    return (
      answers.profileCurrentGoal === "prepare" || answers.profileReceivedReason === "supplement"
    );
  }
  if (situation === "unknown_problem" || situation === "unsure") {
    return answers.profilePerceivedIssue === "procedure";
  }
  return false;
}

function shouldAskDeadline(answers: ReviewAnswers): boolean {
  const situation = answers.situation;
  if (situation === "pre_submission") return goalNeeds(answers.profileCheckGoal, "deadline");
  if (situation === "post_submission_problem") {
    return (
      answers.profileProblemType === "deadline" ||
      answers.profileCurrentGoal === "deadline" ||
      answers.profileAuthorityGuidance === "yes_unclear"
    );
  }
  if (situation === "received_document") {
    return (
      answers.profileReceivedReason === "supplement" || answers.profileCurrentGoal === "deadline"
    );
  }
  if (situation === "unknown_problem" || situation === "unsure") {
    return answers.profilePerceivedIssue === "deadline";
  }
  return false;
}

function pushUnique(questions: ProfileQuestion[], question: ProfileQuestion): void {
  if (!questions.some((q) => q.id === question.id)) questions.push(question);
}

function appendDocsFollowUp(
  questions: ProfileQuestion[],
  docsAnswer: string | undefined,
  followUpOptions: {
    mismatch: { value: string; title: string }[];
    unknown: { value: string; title: string }[];
    other: { value: string; title: string }[];
  },
): void {
  if (docsAnswer === "no") {
    pushUnique(questions, {
      id: "docsFollowUp",
      kind: "followUpChoice",
      label: "어떤 부분이 실제 상황과 다른가요?",
      options: followUpOptions.mismatch,
      placeholder: "예: 주소, 날짜, 이름 등 실제와 다른 항목을 적어주세요.",
    });
  } else if (docsAnswer === "unknown") {
    pushUnique(questions, {
      id: "docsFollowUp",
      kind: "followUpChoice",
      label: "어떤 부분을 아직 확인하지 못하셨나요?",
      options: followUpOptions.unknown,
      placeholder: "예: 번역본과 원본 대조, 공증 여부 등 확인이 필요한 부분을 적어주세요.",
    });
  } else if (docsAnswer === "other") {
    pushUnique(questions, {
      id: "docsFollowUp",
      kind: "followUpChoice",
      label: "직접 알려주세요.",
      options: followUpOptions.other,
      placeholder: "실제 상황과 관련해 추가로 확인할 내용을 입력해주세요.",
    });
  }
}

function appendLegacyFollowUps(
  questions: ProfileQuestion[],
  answers: ReviewAnswers,
  followUpDefs: Record<string, ProfileQuestion>,
): void {
  if (answers.contentCheck === "other") pushUnique(questions, followUpDefs.contentCheckFollowUp);

  const format = answers.formatProofCheck;
  if (format === "partial") pushUnique(questions, followUpDefs.formatProofPartial);
  else if (format === "not_checked") pushUnique(questions, followUpDefs.formatProofNotChecked);
  else if (format === "unsure") pushUnique(questions, followUpDefs.formatProofUnsure);
  else if (format === "other") pushUnique(questions, followUpDefs.formatProofOther);

  const submission = answers.submissionCheck;
  if (submission === "agency_only") pushUnique(questions, followUpDefs.submissionAgency);
  else if (submission === "not_checked") pushUnique(questions, followUpDefs.submissionNotChecked);
  else if (submission === "unsure") pushUnique(questions, followUpDefs.submissionUnsure);
  else if (submission === "other") pushUnique(questions, followUpDefs.submissionOther);

  const deadline = answers.deadline;
  if (deadline === "uncertain") pushUnique(questions, followUpDefs.deadlineUncertain);
  else if (deadline === "not_checked") pushUnique(questions, followUpDefs.deadlineNotChecked);
  else if (deadline === "unsure") pushUnique(questions, followUpDefs.deadlineUnsure);
  else if (deadline === "other") pushUnique(questions, followUpDefs.deadlineOther);
}

// ─── CASE_01 위반·문제 통지 Resolution Path ───

export const CASE01_FACT_DIFFERENCE_DETAIL_KEY = "case01_factDifferenceDetail";
export const CASE01_FACT_DIFFERENCE_AUX_KEY = "case01_factDifferenceAux";
export const CASE01_DATE_PLACE_DETAIL_KEY = "case01_datePlaceDetail";
export const CASE01_DATE_PLACE_AUX_KEY = "case01_datePlaceAux";
export const CASE01_AUTHORITY_FOLLOW_UP_AUX_KEY = "case01_authorityFollowUpAux";
export const CASE01_FACT_COMPARE_GAP_KEY = "case01_factCompareGap";
export const CASE01_DEADLINE_DATE_KEY = "case01_deadlineDate";
export const CASE01_RESPONSE_DETAIL_NOTE_KEY = "case01_responseDetailNote";
export const CASE01_VIOLATION_CONTENT_NOTE_KEY = "case01_violationContentNote";
export const CASE01_FACT_RELATIONSHIP_NOTE_KEY = "case01_factRelationshipNote";
export const CASE01_CUSTOMER_RESPONDED_NOTE_KEY = "case01_customerRespondedNote";

export const CASE01_ANSWER_KEYS = [
  "case01_confirmGoal",
  "case01_violationContent",
  CASE01_VIOLATION_CONTENT_NOTE_KEY,
  "case01_actualSituation",
  CASE01_FACT_DIFFERENCE_DETAIL_KEY,
  CASE01_FACT_DIFFERENCE_AUX_KEY,
  CASE01_DATE_PLACE_DETAIL_KEY,
  CASE01_DATE_PLACE_AUX_KEY,
  CASE01_FACT_COMPARE_GAP_KEY,
  "case01_factRelationship",
  CASE01_FACT_RELATIONSHIP_NOTE_KEY,
  "case01_authorityDemand",
  "case01_authorityDemandNote",
  "case01_authorityDemandDetail",
  "case01_paymentDemandScope",
  "case01_supplementDemandScope",
  "case01_customerResponded",
  CASE01_CUSTOMER_RESPONDED_NOTE_KEY,
  "case01_responseDetail",
  CASE01_RESPONSE_DETAIL_NOTE_KEY,
  "case01_authorityResponse",
  "case01_authorityResponseNote",
  "case01_deadline",
  CASE01_DEADLINE_DATE_KEY,
  "case01_blockage",
  "case01_evidence",
  "case01_finalGoal",
  "case01_factConflictFacet",
  "case01_spatiotemporalFacet",
  "case01_compareRecordGap",
  "case01_languageAccessFact",
  "case01_unclearDemandFact",
  "case01_noticeDeliveryFact",
  "case01_procedureStageFact",
  "case01_officeIdentityFact",
  "case01_paymentInstructionFact",
  "case01_attendInstructionFact",
  "case01_supplementInstructionFact",
  "case01_correctTargetFact",
  "case01_authorityFollowUpKind",
  CASE01_AUTHORITY_FOLLOW_UP_AUX_KEY,
] as const;

export const CASE05_DEADLINE_DATE_KEY = "case05_deadlineDate";

const CASE01_FACT_COMPARE_GAP_OPTIONS = [
  { value: "gap_notice_incomplete", label: "통지서에 날짜·장소·행동 등 핵심 내용이 적혀 있지 않아, 무엇과 비교해야 할지 모릅니다." },
  { value: "gap_memory_timeline", label: "문제가 된 일은 대략 알지만, 그때의 날짜와 장소가 정확히 기억나지 않습니다." },
  { value: "gap_hearsay_channel", label: "교통국에서 직접 받지 않고, 지인이나 대행사를 통해서만 내용을 전해 들었습니다." },
  { value: "gap_records_not_found", label: "비교하려면 제 기록이 필요하지만, 제출 영수증이나 등록 내역을 아직 찾지 못했습니다." },
  { value: "gap_language_access", label: "통지는 받았지만, 베트남어라서 무엇이 문제라고 하는지 이해하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_CONFIRM_GOAL_OPTIONS = [
  { value: "fit_and_facts", label: "이 통지가 제 상황에 해당하는지, 해당한다면 적힌 날짜와 행동이 사실과 맞는지 확인하고 싶습니다." },
  { value: "why_and_basis", label: "왜 이런 통지를 받았는지, 교통국이 어떤 기록을 근거로 판단했는지 확인하고 싶습니다." },
  { value: "what_to_do_now", label: "지금 해야 할 일이 있는지, 있다면 언제까지 어떻게 해야 하는지 확인하고 싶습니다." },
  { value: "after_my_response", label: "이미 대응한 결과가 어떻게 되었는지, 다음에 어떤 절차가 이어지는지 확인하고 싶습니다." },
  { value: "unsure", label: "상황이 복잡해서, 무엇부터 진행해야 하는지 순서를 확인하고 싶습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_VIOLATION_CONTENT_OPTIONS = [
  { value: "traffic", label: "특정 날짜와 장소에서 교통위반이 있었다는 안내를 받았고, 그 날짜와 장소가 적혀 있습니다." },
  { value: "other_stated", label: "신호·속도·주차 등 제가 운전하면서 한 특정 행동이 위반이라는 안내를 받았습니다." },
  { value: "administrative", label: "면허·차량 등록·차량 검사와 관련해 문제가 있다는 안내를 받았습니다." },
  { value: "labor_tax", label: "제가 제출한 서류나 신고 내용에 문제가 있다는 안내를 받았습니다." },
  { value: "explanation_unknown", label: "위반 통지는 받았지만, 무엇이 문제인지는 설명받지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_ACTUAL_SITUATION_OPTIONS = [
  { value: "accept_facts", label: "안내받은 행동이 실제로 있었고, 그 사실은 인정합니다." },
  { value: "partial_similar", label: "비슷한 일은 있었지만, 위반이 될 만한 중요한 부분은 다릅니다." },
  { value: "deny", label: "안내받은 행동은 실제로 없었고, 당시 상황을 설명할 수 있습니다." },
  { value: "partial", label: "일부는 맞지만, 전체 상황은 안내받은 내용과 다릅니다." },
  { value: "unsure", label: "시간이 오래 지났거나 기록이 없어, 당시 상황을 정확히 설명하기 어렵습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_FACT_RELATIONSHIP_OPTIONS = [
  { value: "match", label: "교통국이 안내한 내용이 실제 있었던 일과 거의 같습니다." },
  { value: "date_place_wrong", label: "비슷한 일은 있었지만, 날짜·시간·장소가 실제와 다릅니다." },
  { value: "deny_action", label: "안내받은 위반 행동을 저는 하지 않았고, 그 시간에는 다른 일을 하고 있었습니다." },
  { value: "partial_situation", label: "일부는 맞지만, 누가·무엇을 했는지 등 핵심 내용이 다르게 적혀 있습니다." },
  { value: "cannot_compare_yet", label: "안내는 받았지만, 지금은 실제와 같은지 다른지 비교하기 어렵습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_AUTHORITY_DEMAND_OPTIONS = [
  { value: "payment", label: "위반에 대한 벌금이나 비용을 납부하라는 안내를 받았습니다." },
  { value: "attendance", label: "교통국에 직접 방문하거나, 상황을 설명하라는 안내를 받았습니다." },
  { value: "supplement", label: "추가 서류를 제출하거나, 이미 낸 서류를 다시 제출하라는 안내를 받았습니다." },
  { value: "correct_record", label: "등록 정보나 기존 기록이 맞는지 확인하고, 틀리면 수정하라는 안내를 받았습니다." },
  { value: "demand_unclear", label: "통지는 받았지만, 구체적으로 무엇을 하라는지 안내받지 못했거나 이해하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_PAYMENT_DEMAND_SCOPE_OPTIONS = [
  { value: "core_case", label: "이번 위반에 대한 벌금이고, 이번 일에서 가장 중요한 요구입니다." },
  { value: "included_with_other", label: "다른 안내와 함께 여러 금액이 적혀 있어, 어느 금액이 이번 일인지 분명하지 않습니다." },
  { value: "additional_guidance", label: "중요한 요구는 따로 있고, 납부는 추가로 안내받은 내용입니다." },
  { value: "unsure", label: "납부 안내는 받았지만, 어떤 성격의 금액인지 이해하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_SUPPLEMENT_DEMAND_SCOPE_OPTIONS = [
  { value: "core_case", label: "서류를 다시 제출하는 것이 이번 일에서 가장 중요한 요구입니다." },
  { value: "included_with_notice", label: "위반 통지 안에 서류 제출 요구가 함께 적혀 있습니다." },
  { value: "additional_guidance", label: "중요한 요구는 따로 있고, 서류 제출은 추가로 안내받은 내용입니다." },
  { value: "unsure", label: "서류 제출 안내는 받았지만, 왜 필요한지 이해하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_CUSTOMER_RESPONDED_OPTIONS = [
  { value: "no_contact_yet", label: "통지만 받았고, 아직 교통국에 연락하거나 방문하지 않았습니다." },
  { value: "has_responded", label: "교통국에 연락하거나 방문해, 상황을 설명하거나 서류를 제출한 적이 있습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_LEGACY_CUSTOMER_RESPONDED_ACTION_VALUES = new Set([
  "explained_unresolved",
  "resubmitted",
  "still_unresolved",
  "more_demand",
]);

const CASE01_RESPONSE_DETAIL_OPTIONS = [
  { value: "explained_situation", label: "교통국에 방문하거나 연락해, 당시 상황을 직접 설명했습니다." },
  { value: "submitted_materials", label: "관련 서류나 자료를 준비해 교통국에 제출했습니다." },
  { value: "disputed_facts", label: "안내받은 내용이 사실과 다르다고 교통국에 분명히 말했습니다." },
  { value: "fulfilled_demand", label: "안내받은 대로 벌금 납부나 서류 제출 등 요구를 처리했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_AUTHORITY_RESPONSE_OPTIONS = [
  { value: "completed", label: "추가로 할 일은 없고, 처리가 끝났다는 안내를 받았습니다." },
  { value: "more_required", label: "추가 서류나 자료를 제출하라는 안내를 받았습니다." },
  { value: "re_attendance", label: "다시 방문하거나, 추가로 설명하라는 안내를 받았습니다." },
  { value: "payment_demand", label: "벌금이나 비용을 납부하라는 안내를 받았습니다." },
  { value: "no_reply_yet", label: "아직 답변을 받지 못했거나, 받은 답변의 의미를 이해하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_DEADLINE_OPTIONS = [
  { value: "deadline_day_known", label: "통지서나 문자에 적힌 정확한 날짜를 확인했습니다." },
  { value: "deadline_window_only", label: "'며칠 이내'처럼 기간만 안내받았고, 정확한 날짜는 받지 못했습니다." },
  { value: "asap", label: "날짜 없이, 가능한 한 빨리 대응하라는 안내만 받았습니다." },
  { value: "no_stated", label: "기한에 대해서는 별도의 안내를 받지 못했습니다." },
  { value: "unknown", label: "통지서가 베트남어로 되어 있어, 기한이 적혀 있는지조차 확인하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_BLOCKAGE_UI_OPTIONS = [
  { value: "content_unclear", label: "받은 안내를 이해하지 못해, 제 상황에 해당하는지 판단하지 못하고 있습니다." },
  { value: "how_respond", label: "안내는 이해했지만, 어떻게 대응해야 할지 몰라 시작하지 못하고 있습니다." },
  { value: "next_step", label: "이미 문의하거나 제출했지만, 다음에 무엇을 해야 할지 몰라 기다리고만 있습니다." },
  { value: "facts_why", label: "무엇을 어떤 순서로 설명해야 할지 정리되지 않아, 대응을 미루고 있습니다." },
  { value: "evidence", label: "필요한 자료를 무엇으로 준비해야 할지 몰라, 준비가 멈춰 있습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_EVIDENCE_OPTIONS = [
  { value: "notice", label: "교통국에서 받은 통지서나 안내문" },
  { value: "message", label: "교통국과 주고받은 문자·메시지·이메일" },
  { value: "submitted_docs", label: "제출·납부 영수증이나 접수 증빙" },
  { value: "photo_video", label: "당시 상황을 보여 주는 사진·영상(블랙박스 포함)" },
  { value: "none", label: "보관 중인 자료가 없습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_AUTHORITY_DEMAND_DETAIL_OPTIONS = [
  { value: "clear_guidance", label: "무엇을 해야 하는지 분명하게 안내받았고, 그대로 진행할 수 있습니다." },
  { value: "partial_guidance", label: "대략적인 내용은 알지만, 세부 방법이나 기한은 분명하지 않습니다." },
  { value: "understanding_unknown", label: "설명은 들었지만, 무엇을 해야 하는지 이해하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_FINAL_GOAL_UI_OPTIONS = [
  { value: "situation_fit", label: "통지가 제 상황에 맞는지 확인하고, 맞지 않다면 바로잡고 싶습니다." },
  { value: "why_notice", label: "통지를 받은 이유를 정확히 알고, 같은 일이 다시 생기지 않게 하고 싶습니다." },
  { value: "what_deadline", label: "해야 할 일과 기한을 확인해, 기한 안에 처리를 마치고 싶습니다." },
  { value: "followup", label: "이미 대응한 결과를 확인하고, 이 일을 마무리하고 싶습니다." },
  { value: "expert", label: "제 상황을 전문가에게 정확히 전달해, 대응을 맡기고 싶습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

function normalizeCase01Blockage(value: string | undefined): string | undefined {
  if (!value) return value;
  if (value === "facts_why" || value === "fact_match") return "facts";
  if (value === "content_unclear" || value === "what_to_do") return "demand";
  if (value === "how_respond" || value === "next_step") return "response";
  return value;
}

function normalizeCase01FinalGoal(value: string | undefined): string | undefined {
  if (!value) return value;
  if (
    value === "applicability" ||
    value === "fact_match" ||
    value === "situation_fit" ||
    value === "what_to_do"
  ) {
    return "understand";
  }
  if (value === "why_notice") return "dispute";
  if (value === "deadline_method" || value === "what_deadline") return "deadline";
  if (value === "followup") return "expert";
  return value;
}

function case01FactRelationshipUsesCompareGap(relationship: string | undefined): boolean {
  return relationship === "cannot_compare_yet";
}

function case01NeedsFactCompareGap(answers: ReviewAnswers): boolean {
  if (!case01FactRelationshipUsesCompareGap(answers.case01_factRelationship)) return false;
  return !isAdminVerifyChoiceFieldComplete(
    CASE01_FACT_COMPARE_GAP_KEY,
    answers,
    CASE01_FACT_COMPARE_GAP_OPTIONS,
  );
}

export function case01DeadlineRequiresDateText(deadline: string | undefined): boolean {
  return deadline === "confirmed" || deadline === "deadline_day_known";
}

function inferCase01ActualSituationFromFactRelationship(
  relationship: string | undefined,
): string | undefined {
  if (!relationship) return undefined;
  if (relationship === "match") return "accept_facts";
  if (relationship === "align_minor_gap") return "partial_similar";
  if (relationship === "partial_situation" || relationship === "partial_core_dispute") {
    return "partial";
  }
  if (
    relationship === "deny_action" ||
    relationship === "date_place_wrong" ||
    relationship === "deny_with_alibi"
  ) {
    return "deny";
  }
  if (
    relationship === "unknown" ||
    relationship === "cannot_compare_yet" ||
    relationship === "hard_to_explain" ||
    relationship === "hard_to_judge"
  ) {
    return "unsure";
  }
  return undefined;
}

/** Profile·risk용 — explicit actualSituation 우선, inference는 legacy fallback만 */
function getCase01ActualSituation(answers: ReviewAnswers): string | undefined {
  if (answers.case01_actualSituation) return answers.case01_actualSituation;
  return inferCase01ActualSituationFromFactRelationship(answers.case01_factRelationship);
}

function getCase01ActualSituationLabel(answers: ReviewAnswers): string | null {
  const explicit = answers.case01_actualSituation;
  if (explicit) {
    return getCase01ChoiceLabel(CASE01_ACTUAL_SITUATION_OPTIONS, explicit) ?? explicit;
  }
  const inferred = inferCase01ActualSituationFromFactRelationship(answers.case01_factRelationship);
  if (!inferred) return null;
  return getCase01ChoiceLabel(CASE01_ACTUAL_SITUATION_OPTIONS, inferred) ?? inferred;
}

/** CASE_01 M01 — Profile `actualSituation` only (factRelationship slug 칸 미합성) */
export function case01ActualSituationProfileLabel(answers: ReviewAnswers): string | null {
  const core = getCase01ActualSituationLabel(answers);
  const gapLabel = answers[CASE01_FACT_COMPARE_GAP_KEY]
    ? CASE01_OPTION_LABELS[answers[CASE01_FACT_COMPARE_GAP_KEY]] ??
      answers[CASE01_FACT_COMPARE_GAP_KEY]
    : null;
  const diff = answers[CASE01_FACT_DIFFERENCE_DETAIL_KEY]?.trim();
  const dp = answers[CASE01_DATE_PLACE_DETAIL_KEY]?.trim();
  const extras = [gapLabel, diff, dp].filter(Boolean);
  if (!core && extras.length === 0) return null;
  if (!core) return extras.join(" · ");
  if (extras.length === 0) return core;
  return `${core} — ${extras.join(" · ")}`;
}

function getCase01FactRelationshipLabel(answers: ReviewAnswers): string | null {
  if (!answers.case01_factRelationship) return null;
  return (
    getCase01ChoiceLabel(CASE01_FACT_RELATIONSHIP_OPTIONS, answers.case01_factRelationship) ??
    answers.case01_factRelationship
  );
}

const CASE01_AUTHORITY_CONTEXT_LABEL = "교통국·운전면허 관련 기관";
const CASE01_NOTICE_EVENT_LABEL = "교통위반·문제 통지";

function getCase01ChoiceLabel(
  options: readonly { value: string; label: string }[],
  value: string | undefined,
): string | null {
  if (!value) return null;
  const current = options.find((option) => option.value === value)?.label;
  if (current) return current;
  const fieldId = Object.entries(ADMIN_VERIFY_MERGED_FIELD_OPTION_MAP).find(
    ([id, opts]) => id.startsWith("case01_") && opts === options,
  )?.[0];
  return (fieldId && getLegacyChoiceLabel(fieldId, value)) || null;
}

function isCase01TrafficNoticeContext(answers: ReviewAnswers): boolean {
  if (getQ1ResolvedCase(answers) === "CASE_01") return true;
  if (answers._case01Active === "1") return true;
  return Boolean(answers.case01_violationContent || answers.case01_confirmGoal);
}

export const CASE01_OPTION_LABELS: Record<string, string> = {
  /** 화면에서 제거된 옛 선택지 라벨 — 현재 선택지가 있으면 아래 spread가 덮어씀 */
  unsure: "교통국에서 무엇을 문제라고 보는지 설명받지 못했습니다.",
  understanding_unknown: "설명은 들었지만 무엇을 해야 하는지 정확히 이해하지 못했습니다.",
  demand_unclear:
    "구체적으로 무엇을 하라는지 안내하지 않았거나, 설명은 들었지만 무엇을 해야 하는지 정확히 이해하지 못했습니다.",
  no_stated_demand: "구체적으로 무엇을 하라는지 안내하지 않았습니다.",
  what_deadline: "지금 무엇을 해야 하는지, 기한과 대응 방법을 확인하고 싶어요.",
  unclear: "설명은 들었지만 무엇을 해야 하는지 정확히 이해하지 못했습니다.",
  fact_unknown: "설명받은 내용과 실제 상황이 같은지 다른지 판단할 정보가 부족합니다.",
  response_unknown: "무엇을 해야 하는지는 알지만 어떻게 대응해야 할지 모르겠습니다.",
  procedure_followup: "이후 어떤 절차가 진행되는지 확인하고 싶습니다.",
  partial_similar: "비슷한 일이 있었지만 중요한 부분이 다릅니다.",
  completed: "추가 요구 없이 처리되었다고 들었습니다.",
  explained_situation: "당시 상황을 설명했습니다.",
  submitted_materials: "관련 서류나 자료를 제출했습니다.",
  disputed_facts: "설명받은 내용과 실제 상황이 다르다고 이야기했습니다.",
  fulfilled_demand: "안내받은 내용을 처리했습니다.",
  has_responded: "교통국에 어떤 형태로든 대응한 경험이 있습니다.",
  asap: "가능한 한 빨리 대응하라는 안내만 받았습니다.",
  no_stated: "별도의 기한은 안내받지 않았습니다.",
  not_checked: "별도의 기한은 안내받지 않았습니다.",
  overdue_concern: "가능한 한 빨리 대응하라는 안내만 받았습니다.",
  unsure_which: "관련 자료는 있지만 어떤 부분을 확인할 수 있는지 잘 모르겠습니다.",
  core_case: "이번 문제의 핵심입니다.",
  included_with_other: "다른 문제와 함께 포함된 요구입니다.",
  included_with_notice: "통지 안내에 포함된 보완 요구입니다.",
  additional_guidance: "추가로 안내받은 내용입니다.",
  clear_guidance: "무엇을 하라는 안내가 분명하게 전달되었습니다.",
  partial_guidance: "대략 들었지만 세부 내용이 불분명합니다.",
  info_mismatch: "제가 제출·등록한 정보는 맞는데, 기관이 확인한 내용이 다르게 보입니다.",
  unknown:
    "교통국 설명과 실제 상황이 같은지 다른지, 지금 판단할 정보가 부족합니다.",
  mismatch: "실제 상황과 상당히 다릅니다.",
  verify_violation:
    "내가 알고 있는 사실과 기관에서 확인한 내용 중 어느 부분이 다른지 확인하고 싶습니다.",
  contacted: "기관에 문의하거나 상황을 설명했지만, 아직 해결되지 않았습니다.",
  attended: "직접 출석하거나 설명했습니다.",
  resubmitted: "서류나 증빙을 제출했습니다.",
  paid: "벌금·비용을 납부했습니다.",
  clear: "접수·처리됐다고 답변을 받았습니다.",
  re_attendance: "다시 출석하거나 설명하라고 했습니다.",
  more_docs: "추가 서류·증빙을 요구했습니다.",
  payment_demand: "추가 납부를 요구했습니다.",
  no_response: "아직 기관 답변을 받지 못했습니다.",
  not_stated: "기한이 있다는 안내만 받았습니다.",
  not_advised: "기한 안내를 받지 못했습니다.",
  disposition: "면허·등록·허가 등에 대한 처분·조치를 안내했습니다.",
  correct_record: "특정 절차·등록·수정 등을 진행하라고 들었습니다.",
  payment_proof: "납부·처리한 증빙이 있어요.",
  photo_video: "당시 상황을 보여주는 사진·영상 등이 있습니다.",
  fact_match: "실제 상황과 통지 내용이 맞는지 모르겠어요.",
  what_to_do: "지금 무엇을 해야 하는지 모르겠어요.",
  facts: "왜 이런 통지를 받았는지 모르겠어요.",
  demand: "통지 내용이 정확히 무엇인지 / 지금 무엇을 해야 하는지 모르겠어요.",
  evidence: "확인할 자료가 부족합니다",
  response: "기관에 어떻게 대응해야 할지 / 다음 단계를 모르겠어요.",
  verify_payment: "납부·처리 요구가 맞는지 확인하고 싶어요.",
  lawyer: "전문가·대행에 문의했습니다",
  waiting: "아직 기관 답변을 기다리는 중입니다",
  yes: "기관에서 받은 통지서가 있어요.",
  no: "현재 가지고 있는 자료가 없어요.",
  ...Object.fromEntries(CASE01_CONFIRM_GOAL_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE01_VIOLATION_CONTENT_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE01_ACTUAL_SITUATION_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE01_FACT_RELATIONSHIP_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE01_FACT_COMPARE_GAP_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE01_AUTHORITY_DEMAND_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE01_PAYMENT_DEMAND_SCOPE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE01_SUPPLEMENT_DEMAND_SCOPE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE01_CUSTOMER_RESPONDED_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE01_RESPONSE_DETAIL_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE01_AUTHORITY_RESPONSE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE01_DEADLINE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE01_BLOCKAGE_UI_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE01_EVIDENCE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE01_AUTHORITY_DEMAND_DETAIL_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE01_FINAL_GOAL_UI_OPTIONS.map((o) => [o.value, o.label])),
};

function case01FactRelationshipImpliesDifference(relationship: string | undefined): boolean {
  return (
    relationship === "date_place_wrong" ||
    relationship === "deny_action" ||
    relationship === "deny_with_alibi" ||
    relationship === "partial_situation" ||
    relationship === "partial_core_dispute" ||
    relationship === "align_minor_gap" ||
    relationship === "info_mismatch" ||
    relationship === "mismatch" ||
    relationship === "partial" ||
    relationship === "other"
  );
}

function case01CustomerRespondedImpliesAction(value: string | undefined): boolean {
  if (!value || value === "none" || value === "no_contact_yet" || value === "response_unknown") {
    return false;
  }
  if (value === "has_responded") return true;
  return CASE01_LEGACY_CUSTOMER_RESPONDED_ACTION_VALUES.has(value);
}

function case01NeedsPaymentDemandScope(answers: ReviewAnswers): boolean {
  const demand = answers.case01_authorityDemand;
  if (demand === "pay_core_traffic" || demand === "pay_bundled") return false;
  if (demand !== "payment") return false;
  return !isAdminVerifyChoiceFieldComplete(
    "case01_paymentDemandScope",
    answers,
    CASE01_PAYMENT_DEMAND_SCOPE_OPTIONS,
  );
}

function case01NeedsSupplementDemandScope(answers: ReviewAnswers): boolean {
  const demand = answers.case01_authorityDemand;
  if (demand === "supplement_core") return false;
  if (demand !== "supplement") return false;
  return !isAdminVerifyChoiceFieldComplete(
    "case01_supplementDemandScope",
    answers,
    CASE01_SUPPLEMENT_DEMAND_SCOPE_OPTIONS,
  );
}

/**
 * 개인화 퍼널 v1 — factRelationship과 1:1로 겹치면 묻지 않음(결과는 기존 추론 경로 사용).
 * 날짜·장소가 다름처럼 위반 여부가 애매하거나, 추론할 수 없는 답일 때만 묻는다.
 */
function case01NeedsActualSituationQuestion(answers: ReviewAnswers): boolean {
  if (
    isAdminVerifyChoiceFieldComplete(
      "case01_actualSituation",
      answers,
      CASE01_ACTUAL_SITUATION_OPTIONS,
    )
  ) {
    return false;
  }
  const rel = answers.case01_factRelationship;
  if (rel === "date_place_wrong") return true;
  return inferCase01ActualSituationFromFactRelationship(rel) === undefined;
}

function case01NeedsFactDifferenceDetail(answers: ReviewAnswers): boolean {
  if (case01IsPhase2FacetOnPath("case01_factConflictFacet", answers)) return false;
  const relationship = answers.case01_factRelationship;
  if (
    !relationship ||
    relationship === "match" ||
    relationship === "unknown" ||
    relationship === "cannot_compare_yet" ||
    relationship === "deny_with_alibi" ||
    relationship === "partial_core_dispute" ||
    relationship === "align_minor_gap"
  ) {
    return false;
  }
  if (!case01FactRelationshipImpliesDifference(relationship)) return false;
  return !answers[CASE01_FACT_DIFFERENCE_DETAIL_KEY]?.trim();
}

function case01NeedsUnknownInfoGap(answers: ReviewAnswers): boolean {
  if (case01FactRelationshipUsesCompareGap(answers.case01_factRelationship)) return false;
  if (answers.case01_factRelationship !== "unknown") return false;
  if (answers[CASE01_FACT_DIFFERENCE_DETAIL_KEY]?.trim()) return false;
  return !answers[CASE01_FACT_RELATIONSHIP_NOTE_KEY]?.trim();
}

function case01NeedsDatePlaceDetail(answers: ReviewAnswers): boolean {
  if (case01IsPhase2FacetOnPath("case01_spatiotemporalFacet", answers)) return false;
  if (answers.case01_factRelationship !== "date_place_wrong") return false;
  return !answers[CASE01_DATE_PLACE_DETAIL_KEY]?.trim();
}

const CASE01_PHASE2_FACET_QUESTION_SPECS: {
  id: string;
  label: string;
  options: readonly { value: string; label: string }[];
}[] = [
  {
    id: "case01_factConflictFacet",
    label: "교통국이 안내한 내용과 실제가 가장 크게 다른 점은 무엇인가요?",
    options: CASE01_FACT_CONFLICT_FACET_OPTIONS,
  },
  {
    id: "case01_spatiotemporalFacet",
    label: "그 날짜와 장소에서 실제로 무엇을 했는지, 지금 어떻게 확인할 수 있나요?",
    options: CASE01_SPATIOTEMPORAL_FACET_OPTIONS,
  },
  {
    id: "case01_compareRecordGap",
    label:
      "통지 내용과 비교하려면, 지금 없는 자료를 모두 선택해 주세요. (여러 개 선택 가능)",
    options: CASE01_COMPARE_RECORD_GAP_OPTIONS,
  },
  {
    id: "case01_languageAccessFact",
    label: "통지 내용을 이해하는 과정은 어땠나요?",
    options: CASE01_LANGUAGE_ACCESS_FACT_OPTIONS,
  },
  {
    id: "case01_unclearDemandFact",
    label: "교통국 안내에서 가장 분명하지 않은 부분은 무엇인가요?",
    options: CASE01_UNCLEAR_DEMAND_FACT_OPTIONS,
  },
  {
    id: "case01_noticeDeliveryFact",
    label: "교통국 안내는 처음에 어떤 방법으로 받으셨나요?",
    options: CASE01_NOTICE_DELIVERY_FACT_OPTIONS,
  },
  {
    id: "case01_procedureStageFact",
    label: "이번 안내는 처음 받은 것인가요, 이전에도 받은 적이 있나요?",
    options: CASE01_PROCEDURE_STAGE_FACT_OPTIONS,
  },
  {
    id: "case01_officeIdentityFact",
    label: "안내를 보낸 기관이나 부서는 어떻게 확인하고 있나요?",
    options: CASE01_OFFICE_IDENTITY_FACT_OPTIONS,
  },
  {
    id: "case01_paymentInstructionFact",
    label: "납부 안내는 어떤 금액이었나요?",
    options: CASE01_PAYMENT_INSTRUCTION_FACT_OPTIONS,
  },
  {
    id: "case01_attendInstructionFact",
    label: "방문·설명 안내에는 무엇이 적혀 있었나요?",
    options: CASE01_ATTEND_INSTRUCTION_FACT_OPTIONS,
  },
  {
    id: "case01_supplementInstructionFact",
    label: "서류 제출 안내의 핵심은 무엇이었나요?",
    options: CASE01_SUPPLEMENT_INSTRUCTION_FACT_OPTIONS,
  },
  {
    id: "case01_correctTargetFact",
    label: "수정하라고 한 것은 어떤 정보인가요?",
    options: CASE01_CORRECT_TARGET_FACT_OPTIONS,
  },
  {
    id: "case01_authorityFollowUpKind",
    label: "대응한 뒤, 교통국에서는 어떤 답변이나 추가 요구가 있었나요?",
    options: CASE01_AUTHORITY_FOLLOW_UP_KIND_OPTIONS,
  },
];

/** Brief v3 §4 R3 — facet on-path 시 선택 직후 보조 원문 (Layer A). */
const CASE01_FOLLOW_UP_AUX_KINDS = new Set(["more_required", "re_attendance", "payment_demand"]);

const CASE01_PHASE2_FACET_AUX_SPECS: Partial<
  Record<
    string,
    { key: string; label: string; placeholder: string }
  >
> = {
  case01_factConflictFacet: {
    key: CASE01_FACT_DIFFERENCE_AUX_KEY,
    label: "교통국의 설명과 실제 상황이 다른 부분을 원문으로 적어 주세요.",
    placeholder:
      "날짜·장소·행동·당사자·제출 내용 등, 기억나는 차이를 적어 주세요.",
  },
  case01_spatiotemporalFacet: {
    key: CASE01_DATE_PLACE_AUX_KEY,
    label: "실제로 일이 있었던 날짜·장소·상황을 원문으로 적어 주세요.",
    placeholder: "기억나는 날짜·장소·당시 있었던 곳을 적어 주세요.",
  },
  case01_authorityFollowUpKind: {
    key: CASE01_AUTHORITY_FOLLOW_UP_AUX_KEY,
    label: "교통국의 회신·추가 요구 내용을 원문으로 적어 주세요.",
    placeholder: "기억나는 교통국 답변·요구·진행 상황을 적어 주세요.",
  },
};

/**
 * 대응함 고객 결과 fallback (B안) — 기존 authorityResponse 우선,
 * 없으면 facet authorityFollowUpKind 값을 같은 읽기 경로에서 사용한다. (저장 구조 불변)
 */
const CASE01_FOLLOW_UP_KIND_LEGACY_TO_RESPONSE: Record<string, string> = {
  more_required_vague: "more_required",
  reply_unclear: "unclear",
};

function case01UsesFollowUpKindFallback(answers: ReviewAnswers): boolean {
  return !answers.case01_authorityResponse?.trim() && Boolean(answers.case01_authorityFollowUpKind?.trim());
}

export function getCase01EffectiveAuthorityResponse(answers: ReviewAnswers): string | undefined {
  const response = answers.case01_authorityResponse?.trim();
  if (response) return response;
  const kind = answers.case01_authorityFollowUpKind?.trim();
  if (!kind) return undefined;
  return CASE01_FOLLOW_UP_KIND_LEGACY_TO_RESPONSE[kind] ?? kind;
}

export function getCase01EffectiveAuthorityResponseNote(answers: ReviewAnswers): string | undefined {
  if (answers.case01_authorityResponse?.trim()) {
    return answers[getAdminChoiceNoteKey("case01_authorityResponse")]?.trim() || undefined;
  }
  return (
    answers[CASE01_AUTHORITY_FOLLOW_UP_AUX_KEY]?.trim() ||
    answers[getAdminChoiceNoteKey("case01_authorityFollowUpKind")]?.trim() ||
    undefined
  );
}

function getCase01EffectiveAuthorityResponseLabel(answers: ReviewAnswers): string | undefined {
  const response = answers.case01_authorityResponse?.trim();
  if (response) return CASE01_OPTION_LABELS[response] ?? response;
  const kind = answers.case01_authorityFollowUpKind?.trim();
  if (!kind) return undefined;
  if (kind === "other") {
    return getCase01EffectiveAuthorityResponseNote(answers) ?? kind;
  }
  return (
    CASE01_AUTHORITY_FOLLOW_UP_KIND_OPTIONS.find((option) => option.value === kind)?.label ??
    CASE01_OPTION_LABELS[kind] ??
    kind
  );
}

function case01Phase2FacetFieldsComplete(answers: ReviewAnswers): boolean {
  for (const spec of CASE01_PHASE2_FACET_QUESTION_SPECS) {
    if (!case01IsPhase2FacetOnPath(spec.id, answers)) continue;
    if (
      !isAdminVerifyChoiceFieldComplete(
        spec.id,
        answers,
        [...spec.options] as { value: string; label: string }[],
      )
    ) {
      return false;
    }
  }
  return true;
}

/** Brief v3 §3 facet choice — 노출 경로에만 질문 추가. false = 체인 중단. */
function appendCase01Phase2FacetQuestions(
  questions: ProfileQuestion[],
  answers: ReviewAnswers,
): boolean {
  for (const spec of CASE01_PHASE2_FACET_QUESTION_SPECS) {
    if (!case01IsPhase2FacetOnPath(spec.id, answers)) continue;
    const options = [...spec.options] as { value: string; label: string }[];
    pushUnique(questions, {
      id: spec.id,
      kind: "choice",
      label: spec.label,
      options,
    });
    if (!isAdminVerifyChoiceFieldComplete(spec.id, answers, options)) {
      return false;
    }
    const aux = CASE01_PHASE2_FACET_AUX_SPECS[spec.id];
    /** 개인화 퍼널 v1 — 교통국 답변 원문은 실제 추가 요구(서류·재방문·납부)가 있을 때만 */
    const auxNeeded =
      spec.id !== "case01_authorityFollowUpKind" ||
      CASE01_FOLLOW_UP_AUX_KINDS.has(answers.case01_authorityFollowUpKind ?? "");
    if (aux && auxNeeded) {
      pushUnique(questions, {
        id: aux.key,
        kind: "text",
        label: aux.label,
        placeholder: aux.placeholder,
      });
    }
  }
  return true;
}

function case01NeedsResponseDetail(answers: ReviewAnswers): boolean {
  if (!case01CustomerRespondedImpliesAction(answers.case01_customerResponded)) return false;
  return !isAdminVerifyChoiceFieldComplete(
    "case01_responseDetail",
    answers,
    CASE01_RESPONSE_DETAIL_OPTIONS,
  );
}

function case01NeedsAuthorityResponse(answers: ReviewAnswers): boolean {
  if (!case01CustomerRespondedImpliesAction(answers.case01_customerResponded)) return false;
  if (case01NeedsResponseDetail(answers)) return false;
  if (case01IsPhase2FacetOnPath("case01_authorityFollowUpKind", answers)) {
    return false;
  }
  return !isAdminVerifyChoiceFieldComplete(
    "case01_authorityResponse",
    answers,
    CASE01_AUTHORITY_RESPONSE_OPTIONS,
  );
}

function case01NeedsAuthorityDemandDetailChoice(answers: ReviewAnswers): boolean {
  if (!answers.case01_authorityDemand) return false;
  if (!case01AuthorityDemandIsUnclear(answers.case01_authorityDemand)) return false;
  if (
    answers.case01_authorityDemand === "demand_unclear" ||
    answers.case01_authorityDemand === "understanding_unknown" ||
    answers.case01_authorityDemand === "no_stated_demand"
  ) {
    return false;
  }
  return !isAdminVerifyChoiceFieldComplete(
    "case01_authorityDemandDetail",
    answers,
    CASE01_AUTHORITY_DEMAND_DETAIL_OPTIONS,
  );
}

function case01AuthorityDemandIsUnclear(demand: string | undefined): boolean {
  return (
    demand === "demand_unclear" ||
    demand === "understanding_unknown" ||
    demand === "unclear" ||
    demand === "no_stated_demand" ||
    demand === "other"
  );
}

function case01NeedsUnclearDemandDetail(answers: ReviewAnswers): boolean {
  const demand = answers.case01_authorityDemand;
  if (!case01AuthorityDemandIsUnclear(demand)) {
    return false;
  }
  if (
    demand === "demand_unclear" ||
    demand === "understanding_unknown" ||
    demand === "no_stated_demand"
  ) {
    return false;
  }
  if (case01NeedsAuthorityDemandDetailChoice(answers)) return false;
  return !answers[getAdminChoiceNoteKey("case01_authorityDemand")]?.trim();
}

function case01NeedsAuthorityResponseFollowUp(answers: ReviewAnswers): boolean {
  if (case01IsPhase2FacetOnPath("case01_authorityFollowUpKind", answers)) {
    return false;
  }
  const response = answers.case01_authorityResponse;
  if (!response) return false;
  if (answers[getAdminChoiceNoteKey("case01_authorityResponse")]?.trim()) return false;
  return response === "more_required" || response === "no_reply_yet" || response === "other";
}

function getCase01AuthorityResponseFollowUpLabel(response: string): string {
  if (response === "more_required") {
    return "교통국에서 다시 요구한 자료나 설명은 무엇인가요?";
  }
  if (response === "no_reply_yet") {
    return "아직 교통국 답변을 받지 못한 상황에서, 현재 무엇 때문에 다음 대응이 어려운가요?";
  }
  if (response === "other") {
    return "교통국의 답변이나 안내 내용을 조금 더 설명해 주세요.";
  }
  return "";
}

function case01ConfirmGoalIsUnclear(answers: ReviewAnswers): boolean {
  const goal = answers.case01_confirmGoal;
  return !goal || goal === "other";
}

function case01NeedsFinalGoal(answers: ReviewAnswers): boolean {
  if (answers.case01_finalGoal) return false;
  return case01ConfirmGoalIsUnclear(answers);
}

export function case01NeedsDeadlineDateDetail(answers: ReviewAnswers): boolean {
  if (!case01DeadlineRequiresDateText(answers.case01_deadline)) return false;
  return !answers[CASE01_DEADLINE_DATE_KEY]?.trim();
}

function case01NeedsBlockage(answers: ReviewAnswers): boolean {
  const rel = answers.case01_factRelationship;
  const gap = answers[CASE01_FACT_COMPARE_GAP_KEY];
  if (rel === "unknown" || gap === "gap_memory_timeline" || gap === "gap_language_access") {
    return true;
  }
  /** 개인화 퍼널 v1 — '기간만 안내'·'가능한 빨리'는 이미 기한 답에서 확인된 정보라 blockage 트리거에서 제외 */
  if (answers.case01_deadline === "overdue_concern") {
    return true;
  }
  if (case01AuthorityDemandIsUnclear(answers.case01_authorityDemand)) {
    return true;
  }
  if (case01ConfirmGoalIsUnclear(answers)) return true;
  return false;
}

/** 개인화 퍼널 v1 — 아직 연락하지 않았거나 '지금 해야 할 일'을 확인하려는 고객에게만 기한을 묻는다 */
function case01NeedsDeadlinePhase2(answers: ReviewAnswers): boolean {
  if (isAdminVerifyChoiceFieldComplete("case01_deadline", answers, CASE01_DEADLINE_OPTIONS)) {
    return false;
  }
  if (answers.case01_confirmGoal === "what_to_do_now") return true;
  return answers.case01_customerResponded !== "has_responded";
}

function case01Phase2FieldAnswered(
  answers: ReviewAnswers,
  fieldId: string,
  options?: { value: string; label: string }[],
): boolean {
  if (
    fieldId === CASE01_FACT_DIFFERENCE_DETAIL_KEY ||
    fieldId === CASE01_DATE_PLACE_DETAIL_KEY ||
    fieldId === CASE01_DEADLINE_DATE_KEY
  ) {
    return Boolean(answers[fieldId as keyof ReviewAnswers]?.trim());
  }
  if (fieldId === CASE01_FACT_COMPARE_GAP_KEY) {
    return isAdminVerifyChoiceFieldComplete(
      CASE01_FACT_COMPARE_GAP_KEY,
      answers,
      CASE01_FACT_COMPARE_GAP_OPTIONS,
    );
  }
  if (fieldId === getAdminChoiceNoteKey("case01_authorityDemand")) {
    return Boolean(answers[getAdminChoiceNoteKey("case01_authorityDemand")]?.trim());
  }
  if (!options) return Boolean(answers[fieldId as keyof ReviewAnswers]?.trim());
  return isAdminVerifyChoiceFieldComplete(fieldId, answers, options);
}

function case01HasMinimumInvestigationAxes(answers: ReviewAnswers): boolean {
  const hasAuthorityDemand = case01Phase2FieldAnswered(
    answers,
    "case01_authorityDemand",
    CASE01_AUTHORITY_DEMAND_OPTIONS,
  );
  /** 개인화 퍼널 v1 — factRelationship으로 추론 가능해 묻지 않은 경우도 충족으로 본다 */
  const hasActualSituation =
    case01Phase2FieldAnswered(answers, "case01_actualSituation", CASE01_ACTUAL_SITUATION_OPTIONS) ||
    !case01NeedsActualSituationQuestion(answers);
  const hasFactRelationship = isAdminVerifyChoiceFieldComplete(
    "case01_factRelationship",
    answers,
    CASE01_FACT_RELATIONSHIP_OPTIONS,
  );
  const hasResponseTrack =
    !case01CustomerRespondedImpliesAction(answers.case01_customerResponded) ||
    (case01Phase2FieldAnswered(answers, "case01_responseDetail", CASE01_RESPONSE_DETAIL_OPTIONS) &&
      (case01Phase2FieldAnswered(answers, "case01_authorityResponse", CASE01_AUTHORITY_RESPONSE_OPTIONS) ||
        isAdminVerifyChoiceFieldComplete(
          "case01_authorityFollowUpKind",
          answers,
          CASE01_AUTHORITY_FOLLOW_UP_KIND_OPTIONS,
        )));
  const hasEvidence = case01Phase2FieldAnswered(answers, "case01_evidence", CASE01_EVIDENCE_OPTIONS);
  return (
    hasAuthorityDemand &&
    hasActualSituation &&
    hasFactRelationship &&
    hasResponseTrack &&
    hasEvidence
  );
}

function isPaymentPrimaryInput(text: string): boolean {
  if (!/납부|벌금|과태료|고지서|납부.?요구|납부하라/.test(text)) return false;
  if (/위반.?통지|통지서.*위반/.test(text) && !/납부|벌금|금액|고지서/.test(text)) return false;
  return true;
}

function isAttendancePrimaryInput(text: string): boolean {
  if (!/출석|소명|조사.?요구|신문.?요구|설명.?요구|출석.?요구/.test(text)) return false;
  if (isPaymentPrimaryInput(text)) return false;
  return true;
}

function isSupplementPrimaryInput(text: string): boolean {
  if (!/보완|추가.?제출|재제출|다시.?내|누락|증빙.?부족|서류.?추가|수정.?요구|보완.?요구/.test(text)) {
    return false;
  }
  if (isPaymentPrimaryInput(text)) return false;
  if (isAttendancePrimaryInput(text)) return false;
  return true;
}

function isDispositionPrimaryInput(text: string): boolean {
  if (
    !/처분|조치.?통지|결정.?통지|행정.?처분|허가.?취소|등록.?취소|말소|업무.?정지|체류.?취소|출국.?명령|영업.?정지/.test(
      text,
    )
  ) {
    return false;
  }
  if (isPaymentPrimaryInput(text)) return false;
  if (isAttendancePrimaryInput(text)) return false;
  if (isSupplementPrimaryInput(text)) return false;
  return true;
}

export function shouldActivateCase01Path(answers: ReviewAnswers): boolean {
  if (isAdminCaseEntryQ1Complete(answers)) {
    return getQ1ResolvedCase(answers) === "CASE_01";
  }
  if (answers.case02_confirmGoal || answers._case02Active === "1") return false;
  if (
    answers.case03_authorityDemand ||
    answers.case03_confirmGoal ||
    answers._case03Active === "1"
  ) {
    return false;
  }
  if (answers.case04_supplementTarget || answers._case04Active === "1") return false;
  if (answers.case05_dispositionType || answers._case05Active === "1") return false;
  if (answers._case01Active === "1") return true;
  if (answers.case01_confirmGoal) return true;
  if (shouldActivateCase02Path(answers)) return false;
  if (shouldActivateCase03Path(answers)) return false;
  if (shouldActivateCase04Path(answers)) return false;
  if (shouldActivateCase05Path(answers)) return false;

  const text = customerTextFromAnswers(answers);
  const hits = keywordCaseSignals(text);

  if (answers.profileReceivedReason === "rejection") return true;
  if (answers.profileProblemType === "rejected" && /위반|통지|과태료/.test(text)) return true;
  if (hits.includes("CASE_01") && !hits.includes("CASE_02")) return true;
  if (/위반.?통지|통지서.*위반|교통.*통지/.test(text)) return true;

  if (
    answers.situation === "received_document" &&
    answers.profileReceivedReason === "rejection"
  ) {
    return true;
  }

  return false;
}

export function isCase01Phase1Complete(answers: ReviewAnswers): boolean {
  return (
    isAdminVerifyChoiceFieldComplete(
      "case01_violationContent",
      answers,
      CASE01_VIOLATION_CONTENT_OPTIONS,
    ) &&
    isAdminVerifyChoiceFieldComplete(
      "case01_customerResponded",
      answers,
      CASE01_CUSTOMER_RESPONDED_OPTIONS,
    ) &&
    isAdminVerifyChoiceFieldComplete("case01_confirmGoal", answers, CASE01_CONFIRM_GOAL_OPTIONS)
  );
}

function appendCase01Phase1Questions(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  pushUnique(questions, {
    id: "case01_violationContent",
    kind: "choice",
    label:
      "교통국은 무엇이 문제라고 안내했나요?",
    options: CASE01_VIOLATION_CONTENT_OPTIONS,
  });
  if (
    !isAdminVerifyChoiceFieldComplete(
      "case01_violationContent",
      answers,
      CASE01_VIOLATION_CONTENT_OPTIONS,
    )
  ) {
    return;
  }

  pushUnique(questions, {
    id: "case01_customerResponded",
    kind: "choice",
    label: "통지를 받은 뒤, 교통국에 연락하거나 대응한 적이 있나요?",
    options: CASE01_CUSTOMER_RESPONDED_OPTIONS,
  });
  if (
    !isAdminVerifyChoiceFieldComplete(
      "case01_customerResponded",
      answers,
      CASE01_CUSTOMER_RESPONDED_OPTIONS,
    )
  ) {
    return;
  }

  pushUnique(questions, {
    id: "case01_confirmGoal",
    kind: "choice",
    label: "지금 가장 먼저 확인하고 싶은 것은 무엇인가요?",
    options: case01ConfirmGoalOptionsFor(answers),
  });
}

/** 개인화 퍼널 v1 — 연락한 적 없는 고객에게 '이미 대응한 결과' 선택지를 보이지 않음(저장된 값은 유지) */
function case01ConfirmGoalOptionsFor(answers: ReviewAnswers): { value: string; label: string }[] {
  return CASE01_CONFIRM_GOAL_OPTIONS.filter(
    (o) =>
      o.value !== "after_my_response" ||
      answers.case01_customerResponded === "has_responded" ||
      adminVerifyFieldHasSlug(answers, "case01_confirmGoal", o.value),
  );
}

function appendCase01Phase2AdaptiveQuestions(
  questions: ProfileQuestion[],
  answers: ReviewAnswers,
): void {
  if (case01NeedsUnclearDemandDetail(answers)) {
    pushUnique(questions, {
      id: getAdminChoiceNoteKey("case01_authorityDemand"),
      kind: "text",
      label:
        "교통국에서 무엇을 하라고 했는지, 설명받은 내용 중 가장 이해하기 어려운 부분은 무엇인가요?",
      placeholder: "들었던 안내·통역·구두 설명 중 가장 헷갈리는 부분을 적어 주세요.",
    });
    if (!answers[getAdminChoiceNoteKey("case01_authorityDemand")]?.trim()) return;
  }

  if (case01NeedsAuthorityResponseFollowUp(answers)) {
    const response = answers.case01_authorityResponse ?? "";
    pushUnique(questions, {
      id: getAdminChoiceNoteKey("case01_authorityResponse"),
      kind: "text",
      label: getCase01AuthorityResponseFollowUpLabel(response),
      placeholder: "기억나는 교통국 답변·요구·진행 상황을 적어 주세요.",
    });
    if (!answers[getAdminChoiceNoteKey("case01_authorityResponse")]?.trim()) return;
  }

  if (case01NeedsBlockage(answers)) {
    pushUnique(questions, {
      id: "case01_blockage",
      kind: "choice",
      label: "현재 이 일이 진행되지 못하는 가장 큰 이유는 무엇인가요?",
      options: CASE01_BLOCKAGE_UI_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case01_blockage",
        answers,
        CASE01_BLOCKAGE_UI_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case01NeedsFinalGoal(answers)) {
    pushUnique(questions, {
      id: "case01_finalGoal",
      kind: "choice",
      label: "이번 검토를 통해 이 일을 어떻게 마무리하고 싶으신가요?",
      options: CASE01_FINAL_GOAL_UI_OPTIONS,
    });
  }
}

function appendCase01Phase2Questions(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  /** 개인화 퍼널 v1 — 사실 비교는 2차 첫 질문(핵심 사실, 2차 공통) */
  pushUnique(questions, {
    id: "case01_factRelationship",
    kind: "choice",
    label:
      "교통국이 안내한 내용은 실제 있었던 일과 비교하면 어떤가요?",
    options: CASE01_FACT_RELATIONSHIP_OPTIONS,
  });
  if (
    !isAdminVerifyChoiceFieldComplete(
      "case01_factRelationship",
      answers,
      CASE01_FACT_RELATIONSHIP_OPTIONS,
    )
  ) {
    return;
  }
  if (case01NeedsFactCompareGap(answers)) {
    pushUnique(questions, {
      id: CASE01_FACT_COMPARE_GAP_KEY,
      kind: "choice",
      label:
        "지금 실제와 비교하기 어려운 가장 큰 이유는 무엇인가요?",
      options: CASE01_FACT_COMPARE_GAP_OPTIONS,
    });
    return;
  }

  pushUnique(questions, {
    id: "case01_authorityDemand",
    kind: "choice",
    label: "교통국은 이 통지와 함께 구체적으로 무엇을 하라고 안내했나요?",
    options: CASE01_AUTHORITY_DEMAND_OPTIONS,
  });
  if (
    !isAdminVerifyChoiceFieldComplete(
      "case01_authorityDemand",
      answers,
      CASE01_AUTHORITY_DEMAND_OPTIONS,
    )
  ) {
    return;
  }

  if (case01NeedsPaymentDemandScope(answers)) {
    pushUnique(questions, {
      id: "case01_paymentDemandScope",
      kind: "choice",
      label: "이번 납부 안내는 어떤 성격인가요?",
      options: CASE01_PAYMENT_DEMAND_SCOPE_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case01_paymentDemandScope",
        answers,
        CASE01_PAYMENT_DEMAND_SCOPE_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case01NeedsSupplementDemandScope(answers)) {
    pushUnique(questions, {
      id: "case01_supplementDemandScope",
      kind: "choice",
      label:
        "이번 서류 제출 안내는 어떤 성격인가요?",
      options: CASE01_SUPPLEMENT_DEMAND_SCOPE_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case01_supplementDemandScope",
        answers,
        CASE01_SUPPLEMENT_DEMAND_SCOPE_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case01NeedsActualSituationQuestion(answers)) {
    pushUnique(questions, {
      id: "case01_actualSituation",
      kind: "choice",
      label: "교통국의 안내와 별개로, 실제로는 어떤 일이 있었나요?",
      options: CASE01_ACTUAL_SITUATION_OPTIONS,
    });
    return;
  }

  if (!appendCase01Phase2FacetQuestions(questions, answers)) {
    return;
  }

  if (case01NeedsDeadlinePhase2(answers)) {
    pushUnique(questions, {
      id: "case01_deadline",
      kind: "choice",
      label: "대응해야 하는 기한은 어떻게 안내받으셨나요?",
      options: CASE01_DEADLINE_OPTIONS,
    });
    if (case01NeedsDeadlinePhase2(answers)) {
      return;
    }
  }

  if (case01NeedsDeadlineDateDetail(answers)) {
    pushUnique(questions, {
      id: CASE01_DEADLINE_DATE_KEY,
      kind: "text",
      label: "안내받은 대응 기한은 언제인가요?",
      placeholder: "통지서에 적힌 그대로 입력해 주세요. 예) 2026년 10월 15일까지",
    });
    if (case01NeedsDeadlineDateDetail(answers)) {
      return;
    }
  }

  if (case01NeedsFactDifferenceDetail(answers)) {
    pushUnique(questions, {
      id: CASE01_FACT_DIFFERENCE_DETAIL_KEY,
      kind: "text",
      label: "교통국의 설명과 실제 상황이 다른 부분은 구체적으로 무엇인가요?",
      placeholder:
        "날짜·장소·행동·당사자·제출 내용 등, 기억나는 차이를 적어 주세요.",
    });
    if (case01NeedsFactDifferenceDetail(answers)) {
      return;
    }
  }

  if (case01NeedsUnknownInfoGap(answers)) {
    pushUnique(questions, {
      id: CASE01_FACT_RELATIONSHIP_NOTE_KEY,
      kind: "text",
      label:
        "설명받은 내용과 실제 상황이 같은지 다른지 판단하려면, 지금 어떤 정보가 더 필요하다고 생각하시나요?",
      placeholder:
        "기억나는 날짜·장소·행동, 받은 안내, 다른 사람이 들려준 설명 등을 적어 주세요.",
    });
    if (case01NeedsUnknownInfoGap(answers)) {
      return;
    }
  }

  if (case01NeedsDatePlaceDetail(answers)) {
    pushUnique(questions, {
      id: CASE01_DATE_PLACE_DETAIL_KEY,
      kind: "text",
      label: "실제로 일이 있었던 날짜와 장소를 확인할 수 있나요?",
      placeholder: "기억나는 날짜·장소·당시 있었던 곳을 적어 주세요.",
    });
    if (case01NeedsDatePlaceDetail(answers)) {
      return;
    }
  }

  if (case01NeedsResponseDetail(answers)) {
    pushUnique(questions, {
      id: "case01_responseDetail",
      kind: "choice",
      label: "교통국에 대응할 때 실제로 무엇을 하셨나요?",
      options: CASE01_RESPONSE_DETAIL_OPTIONS,
    });
    if (case01NeedsResponseDetail(answers)) {
      return;
    }
  }

  if (case01NeedsAuthorityResponse(answers)) {
    if (!case01IsPhase2FacetOnPath("case01_authorityFollowUpKind", answers)) {
      pushUnique(questions, {
        id: "case01_authorityResponse",
        kind: "choice",
        label: "대응한 뒤, 교통국에서는 어떤 답변이 있었나요?",
        options: CASE01_AUTHORITY_RESPONSE_OPTIONS,
      });
      if (case01NeedsAuthorityResponse(answers)) {
        return;
      }
    }
  }

  if (case01NeedsAuthorityDemandDetailChoice(answers)) {
    pushUnique(questions, {
      id: "case01_authorityDemandDetail",
      kind: "choice",
      label: "지금까지 받은 안내를 전체적으로 얼마나 이해하고 계신가요?",
      options: CASE01_AUTHORITY_DEMAND_DETAIL_OPTIONS,
    });
    if (case01NeedsAuthorityDemandDetailChoice(answers)) {
      return;
    }
  }

  pushUnique(questions, {
    id: "case01_evidence",
    kind: "choice",
    label:
      "현재 보관하고 있는 자료를 모두 선택해 주세요. (여러 개 선택 가능)",
    options: CASE01_EVIDENCE_OPTIONS,
  });
  if (
    !isAdminVerifyChoiceFieldComplete(
      "case01_evidence",
      answers,
      CASE01_EVIDENCE_OPTIONS,
    )
  ) {
    return;
  }

  appendCase01Phase2AdaptiveQuestions(questions, answers);
}

function appendCase01PathQuestions(
  questions: ProfileQuestion[],
  answers: ReviewAnswers,
  phase: AdminVerifyProfilePhase = 2,
): void {
  if (phase === 1) {
    appendCase01Phase1Questions(questions, answers);
    return;
  }
  if (isCase06BridgedToNativeCase(answers, "CASE_01") && !isCase01Phase1Complete(answers)) {
    appendCase01Phase1Questions(questions, answers);
    if (!isCase01Phase1Complete(answers)) return;
  }
  appendCase01Phase2Questions(questions, answers);
}

function case01PathFieldsComplete(answers: ReviewAnswers): boolean {
  if (!isCase01Phase1Complete(answers)) return false;
  if (
    !isAdminVerifyChoiceFieldComplete(
      "case01_factRelationship",
      answers,
      CASE01_FACT_RELATIONSHIP_OPTIONS,
    )
  ) {
    return false;
  }
  if (case01NeedsFactCompareGap(answers)) return false;
  if (case01NeedsPaymentDemandScope(answers)) return false;
  if (case01NeedsSupplementDemandScope(answers)) return false;
  if (case01NeedsActualSituationQuestion(answers)) return false;
  if (case01NeedsDeadlinePhase2(answers)) return false;
  if (case01NeedsDeadlineDateDetail(answers)) return false;
  if (case01NeedsFactDifferenceDetail(answers)) return false;
  if (case01NeedsUnknownInfoGap(answers)) return false;
  if (case01NeedsDatePlaceDetail(answers)) return false;
  if (case01NeedsResponseDetail(answers)) return false;
  if (case01NeedsAuthorityResponse(answers)) return false;
  if (case01NeedsAuthorityDemandDetailChoice(answers)) return false;
  if (case01NeedsUnclearDemandDetail(answers)) return false;
  if (case01NeedsAuthorityResponseFollowUp(answers)) return false;
  if (!case01Phase2FacetFieldsComplete(answers)) return false;
  if (
    !isAdminVerifyChoiceFieldComplete(
      "case01_authorityDemand",
      answers,
      CASE01_AUTHORITY_DEMAND_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    !isAdminVerifyChoiceFieldComplete(
      "case01_evidence",
      answers,
      CASE01_EVIDENCE_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case01NeedsBlockage(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case01_blockage",
      answers,
      CASE01_BLOCKAGE_UI_OPTIONS,
    )
  ) {
    return false;
  }
  if (case01NeedsFinalGoal(answers) && !answers.case01_finalGoal) {
    return false;
  }
  if (!case01HasMinimumInvestigationAxes(answers)) return false;
  return true;
}

export function isCase01PathComplete(answers: ReviewAnswers): boolean {
  if (!shouldActivateCase01Path(answers)) return false;
  return case01PathFieldsComplete(answers);
}

export {
  CASE01_PHASE2_SUBSTANTIVE_AXIS_CATALOG,
  case01IsPhase2FacetOnPath,
  case01Phase1SubstantiveAxisCount,
  case01Phase2ExceedsPhase1SubstantiveDepth,
  case01Phase2SubstantiveAxisCountOnPath,
  case01Phase2SubstantiveAxisIdsOnPath,
  case01Phase2SubstantiveAxisSymbolsOnPath,
} from "./adminVerifyCase01Ratio";

// ─── CASE_02 납부 요구 Resolution Path ───

export const CASE02_DEADLINE_DATE_KEY = "case02_deadlineDate";
export const CASE02_PAYMENT_AMOUNT_DETAIL_KEY = "case02_paymentAmountDetail";

export const CASE02_ANSWER_KEYS = [
  "case02_confirmGoal",
  "case02_demandAuthority",
  "case02_paymentSubject",
  "case02_paymentInfoSource",
  "case02_paymentAmount",
  CASE02_PAYMENT_AMOUNT_DETAIL_KEY,
  "case02_paymentBasis",
  "case02_noticeAccessFact",
  "case02_paymentConfirmationFact",
  "case02_paidProcessingFact",
  "case02_situationMatch",
  "case02_deadline",
  CASE02_DEADLINE_DATE_KEY,
  "case02_paymentStatus",
  "case02_authorityResponse",
  "case02_paymentMethod",
  "case02_nonPaymentNotice",
  "case02_blockage",
  "case02_evidence",
  "case02_finalGoal",
] as const;

export type PaymentSignalCode =
  | "PAYMENT_MATCH"
  | "PAYMENT_AMOUNT_MISMATCH"
  | "PAYMENT_OBLIGATION_UNCLEAR"
  | "PAYMENT_BASIS_UNCLEAR"
  | "PAYMENT_UNVERIFIED";

const PAYMENT_SIGNAL_LABELS: Record<PaymentSignalCode, string> = {
  PAYMENT_MATCH: "납부 요구와 응답 내용이 대체로 일치합니다",
  PAYMENT_AMOUNT_MISMATCH: "통지 금액 확인이 필요합니다",
  PAYMENT_OBLIGATION_UNCLEAR: "납부 의무 여부 확인이 필요합니다",
  PAYMENT_BASIS_UNCLEAR: "납부 사유·근거 확인이 필요합니다",
  PAYMENT_UNVERIFIED: "납부 처리 여부 확인이 필요합니다",
};

const CASE02_CONFIRM_GOAL_OPTIONS = [
  { value: "verify_obligation", label: "이 납부 요구가 제 상황에 해당하는지, 해당한다면 꼭 내야 하는 돈인지 확인하고 싶습니다." },
  { value: "verify_amount", label: "금액이 어떻게 계산되었는지, 그 금액이 맞는지 확인하고 싶습니다." },
  { value: "how_when_where", label: "납부해야 한다면, 언제까지 어디서 어떤 방법으로 내야 하는지 확인하고 싶습니다." },
  { value: "payment_processed", label: "이미 납부했는데, 정상 처리되었는지와 왜 다시 요구하는지 확인하고 싶습니다." },
  { value: "unsure", label: "상황이 복잡해서, 무엇부터 진행해야 하는지 순서를 확인하고 싶습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_PAYMENT_INFO_SOURCE_OPTIONS = [
  { value: "written_notice", label: "교통국이 보낸 통지서나 문자를 제가 직접 받았습니다." },
  { value: "verbal_authority", label: "교통국에 방문하거나 전화했을 때, 담당자에게 말로 안내받았습니다." },
  { value: "third_party", label: "지인·대행사·통역을 통해 전해 들었고, 교통국 안내를 직접 보지는 못했습니다." },
  { value: "online_channel", label: "인터넷이나 앱에서 조회하다가, 납부할 금액이 있다는 것을 알게 되었습니다." },
  { value: "recall_unclear", label: "납부 안내를 받은 것은 기억나지만, 어떤 경로였는지는 정확히 기억나지 않습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_DEMAND_AUTHORITY_OPTIONS = [
  { value: "traffic", label: "교통국이나 교통 관련 행정기관에서 요구했습니다." },
  { value: "police", label: "단속한 교통경찰 등 경찰 기관에서 요구했습니다." },
  { value: "vehicle_reg", label: "차량 등록·검사를 담당하는 기관에서 요구했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_PAYMENT_SUBJECT_OPTIONS = [
  { value: "traffic_fine", label: "교통위반이 적발되어, 그에 대한 벌금을 내라는 안내를 받았습니다." },
  { value: "license_fee", label: "운전면허 발급·갱신·변경을 신청하면서, 처리 비용을 내라는 안내를 받았습니다." },
  { value: "vehicle_reg_fee", label: "차량 등록이나 검사를 진행하면서, 관련 비용을 내라는 안내를 받았습니다." },
  { value: "additional_related", label: "이미 처리가 끝난 일과 관련해, 추가 금액을 더 내라는 안내를 받았습니다." },
  { value: "unclear", label: "돈을 내라는 안내는 받았지만, 왜 내야 하는지는 설명받지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

/** CASE_02 paymentAmount — stated_uncertain + amount_calc_unclear 통합 canonical */
export const CASE02_PAYMENT_AMOUNT_STATED_BASIS_UNCLEAR = "amount_stated_basis_unclear";

const CASE02_PAYMENT_AMOUNT_LEGACY_VALUES: Record<string, string> = {
  stated_uncertain: CASE02_PAYMENT_AMOUNT_STATED_BASIS_UNCLEAR,
  amount_calc_unclear: CASE02_PAYMENT_AMOUNT_STATED_BASIS_UNCLEAR,
};

export function case02NormalizePaymentAmountValue(value: string | undefined): string | undefined {
  if (!value) return value;
  return CASE02_PAYMENT_AMOUNT_LEGACY_VALUES[value] ?? value;
}

/** CASE_02 nonPaymentNotice — penalty_stated + enforcement_stated 통합 canonical */
export const CASE02_NON_PAYMENT_SANCTION_STATED = "sanction_enforcement_stated";

const CASE02_NON_PAYMENT_NOTICE_LEGACY_VALUES: Record<string, string> = {
  penalty_stated: CASE02_NON_PAYMENT_SANCTION_STATED,
  enforcement_stated: CASE02_NON_PAYMENT_SANCTION_STATED,
};

export function case02NormalizeNonPaymentNoticeValue(value: string | undefined): string | undefined {
  if (!value) return value;
  return CASE02_NON_PAYMENT_NOTICE_LEGACY_VALUES[value] ?? value;
}

const CASE02_AUTHORITY_RESPONSE_LEGACY_LABELS: Record<string, string> = {
  procedure_unknown: "이후 어떤 절차가 진행되는지 확인하지 못했습니다.",
  unclear: "기관 답변 내용을 정확히 이해하지 못했습니다.",
};

function getCase02AuthorityResponseLabelFromAnswers(
  answers: ReviewAnswers,
): { label: string; factStatus: FactStatus } | null {
  const value = answers.case02_authorityResponse?.trim();
  if (!value) return null;
  if (value === "other") {
    const note = answers[getAdminChoiceNoteKey("case02_authorityResponse")]?.trim();
    const fallback =
      CASE01_OPTION_LABELS.other ??
      ADMIN_DIRECT_EXPLAIN_LABEL;
    return {
      label: note || fallback,
      factStatus: note ? "confirmed" : "candidate",
    };
  }
  const label =
    CASE01_OPTION_LABELS[value] ??
    CASE02_AUTHORITY_RESPONSE_LEGACY_LABELS[value] ??
    value;
  return { label, factStatus: "confirmed" };
}

const CASE02_PAYMENT_AMOUNT_OPTIONS = [
  { value: "amount_clear", label: "정확한 금액이 적혀 있고, 이전에 알고 있던 금액과도 같습니다." },
  { value: "amount_differs", label: "금액은 적혀 있지만, 이전에 안내받은 금액과 다릅니다." },
  { value: "paid_redemand", label: "이미 전부 또는 일부를 납부했는데, 다른 금액을 다시 내라는 안내를 받았습니다." },
  { value: "amount_unknown", label: "금액이 적혀 있지 않거나, 적힌 금액을 이해하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_PAYMENT_BASIS_LEGACY_VALUES: Record<string, string> = {
  violation_stated: "basis_violation_cited",
  license_admin: "basis_fee_schedule",
  vehicle_related: "basis_prior_case",
  unclear: "basis_not_explained",
};

export function case02NormalizePaymentBasisValue(value: string | undefined): string | undefined {
  if (!value) return value;
  return CASE02_PAYMENT_BASIS_LEGACY_VALUES[value] ?? value;
}

const CASE02_PAYMENT_BASIS_OPTIONS = [
  { value: "basis_violation_cited", label: "어떤 위반 때문인지 구체적으로 말하거나 적어 주었습니다." },
  { value: "basis_fee_schedule", label: "수수료 규정이나 고시 번호 등 근거 규정을 알려 주었습니다." },
  { value: "basis_prior_case", label: "이전에 처리한 일과 연결해, 추가로 내야 한다고 했습니다." },
  { value: "basis_not_explained", label: "이유에 대한 설명이 없었거나, 설명을 이해하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_NOTICE_ACCESS_FACT_OPTIONS = [
  { value: "access_have_copy", label: "직접 받지는 않았지만, 전달받은 문서나 메시지 사본을 가지고 있습니다." },
  { value: "access_no_copy", label: "말로만 전해 들었고, 사본이나 캡처는 남기지 못했습니다." },
  { value: "access_sender_unknown", label: "누가 어떤 경로로 전달한 것인지 확실하지 않습니다." },
  { value: "access_language_barrier", label: "전달받은 안내가 베트남어라서, 내용을 제대로 확인하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_PAYMENT_CONFIRMATION_FACT_OPTIONS = [
  { value: "cf_receipt_official", label: "영수증이나 접수증, 전자 확인번호로 확인하라는 안내를 받았습니다." },
  { value: "cf_portal_status", label: "인터넷이나 앱에서 처리 상태를 조회하라는 안내를 받았습니다." },
  { value: "cf_call_office", label: "전화하거나 방문해서 처리 여부를 확인하라는 안내를 받았습니다." },
  { value: "cf_no_instruction", label: "납부 후 어떻게 확인하라는 안내는 받지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_PAID_PROCESSING_FACT_OPTIONS = [
  { value: "proc_receipt_pending", label: "납부는 했지만, 정상 처리되었는지는 아직 확인하지 못했습니다." },
  { value: "proc_partial_credit", label: "일부만 처리된 것으로 보이고, 남은 금액이 있다고 합니다." },
  { value: "proc_other_case", label: "제가 낸 돈이 다른 건이나 다른 금액으로 처리된 것 같습니다." },
  { value: "proc_unknown", label: "처리 여부를 확인할 방법을 몰라, 전혀 확인하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_SITUATION_MATCH_OPTIONS = [
  { value: "match", label: "실제 있었던 일과 맞고, 납부해야 한다는 것도 인정합니다." },
  { value: "partial", label: "그런 일은 있었지만, 금액이나 일부 내용이 실제와 다르다고 생각합니다." },
  { value: "not_applicable", label: "저와 관련 없는 일이거나, 제가 납부할 대상이 아니라고 생각합니다." },
  { value: "hard_to_judge", label: "관련 기록이 없어, 실제와 맞는지 비교하기 어렵습니다." },
  { value: "unknown", label: "안내 내용을 이해하지 못해, 맞는지 판단할 수 없습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_PAYMENT_STATUS_OPTIONS = [
  { value: "not_paid", label: "안내만 받았고, 아직 납부하지 않았습니다." },
  { value: "partial", label: "일부 금액만 납부했고, 나머지는 아직 납부하지 않았습니다." },
  { value: "full", label: "안내받은 금액을 모두 납부했고, 정상 처리된 것도 확인했습니다." },
  { value: "paid_unverified", label: "모두 납부했지만, 교통국에서 처리되었는지는 확인하지 못했습니다." },
  { value: "paid_by_other", label: "제가 직접 납부하지 않고, 대행사나 지인이 대신 납부했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_PAYMENT_METHOD_OPTIONS = [
  { value: "bank_transfer", label: "지정된 은행 계좌로 이체하거나, 은행 창구에서 납부하는 방법입니다." },
  { value: "office_visit", label: "교통국 등 기관 창구를 방문해 직접 납부하는 방법입니다." },
  { value: "online_portal", label: "인터넷이나 앱 등 온라인으로 납부하는 방법입니다." },
  { value: "not_stated", label: "납부 방법은 안내받지 못했거나, 안내를 이해하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_NON_PAYMENT_NOTICE_OPTIONS = [
  { value: "interest_stated", label: "기한이 지나면 가산금이나 이자가 붙는다는 안내를 받았습니다." },
  { value: "no_notice", label: "미납 시 어떻게 되는지 안내가 없었거나, 이해하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_DEADLINE_OPTIONS = [
  { value: "confirmed", label: "통지서나 문자에 적힌 정확한 납부 기한을 확인했습니다." },
  { value: "deadline_mentioned", label: "'며칠 이내'처럼 기간만 안내받았고, 정확한 날짜는 받지 못했습니다." },
  { value: "uncertain", label: "기한이 있다는 말은 들었지만, 정확히 언제까지인지 확인하지 못했습니다." },
  { value: "not_stated", label: "기한에 대해서는 별도의 안내를 받지 못했습니다." },
  { value: "unsure", label: "안내문이 베트남어로 되어 있어, 기한이 적혀 있는지조차 확인하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_FIELD_OPTIONS: Record<string, { value: string; label: string }[]> = {
  case02_paymentSubject: CASE02_PAYMENT_SUBJECT_OPTIONS,
  case02_paymentInfoSource: CASE02_PAYMENT_INFO_SOURCE_OPTIONS,
  case02_situationMatch: CASE02_SITUATION_MATCH_OPTIONS,
  case02_paymentAmount: CASE02_PAYMENT_AMOUNT_OPTIONS,
  case02_paymentStatus: CASE02_PAYMENT_STATUS_OPTIONS,
  case02_confirmGoal: CASE02_CONFIRM_GOAL_OPTIONS,
  case02_demandAuthority: CASE02_DEMAND_AUTHORITY_OPTIONS,
  case02_paymentBasis: CASE02_PAYMENT_BASIS_OPTIONS,
  case02_deadline: CASE02_DEADLINE_OPTIONS,
};

export function effectiveAdminVerifyChoiceSlug(
  answers: ReviewAnswers,
  fieldId: string,
): string | undefined {
  const raw = answers[fieldId as keyof ReviewAnswers]?.trim();
  if (!raw) return undefined;
  if (isAdminVerifyMultiChoiceField(fieldId)) {
    return getAdminVerifyEffectiveChoiceSlugs(fieldId, raw)[0];
  }
  return resolveAdminVerifyChoiceSlugForJudgment(fieldId, raw);
}

export function adminVerifyFieldHasSlug(
  answers: ReviewAnswers,
  fieldId: string,
  slug: string,
): boolean {
  const raw = answers[fieldId as keyof ReviewAnswers]?.trim();
  if (!raw) return false;
  if (isAdminVerifyMultiChoiceField(fieldId)) {
    return adminVerifyAnswerIncludesSlug(fieldId, raw, slug);
  }
  return slugMatchesChoiceValue(fieldId, raw, slug);
}

export { slugMatchesChoiceValue, getLegacyChoiceLabel } from "./adminVerifyChoiceSlugCanonical";

export function isAdminVerifyChoiceFieldComplete(
  questionId: string,
  answers: ReviewAnswers,
  options: { value: string; label: string }[],
): boolean {
  const value = answers[questionId]?.trim() ?? "";
  if (!value) return false;
  if (isAdminVerifyMultiChoiceField(questionId)) {
    return isAdminVerifyMultiChoiceFieldComplete(questionId, value, options);
  }
  if (value !== "other") return true;
  const otherOption = options.find((opt) => opt.value === "other");
  if (!otherOption) return true;
  if (!isAdminDirectExplainOption(otherOption)) {
    return true;
  }
  const noteKey =
    questionId === "case01_violationContent"
      ? CASE01_VIOLATION_CONTENT_NOTE_KEY
      : questionId === "case01_factRelationship"
        ? CASE01_FACT_RELATIONSHIP_NOTE_KEY
      : questionId === "case01_customerResponded"
        ? CASE01_CUSTOMER_RESPONDED_NOTE_KEY
      : questionId === "case01_responseDetail"
        ? CASE01_RESPONSE_DETAIL_NOTE_KEY
        : getAdminChoiceNoteKey(questionId);
  return Boolean(answers[noteKey as keyof ReviewAnswers]?.trim());
}

/** 개인화 퍼널 v1 — 1차 Q1 포함 4개. factRelationship(+비교 어려움 이유)·deadline(+날짜)은 2차 */
export const CASE01_PHASE1_FIELD_ORDER = [
  "case01_violationContent",
  "case01_customerResponded",
  "case01_confirmGoal",
] as const;

export const CASE06_LEGACY_PHASE1_FIELD_ORDER = [
  "case06_documentNature",
  "profilePerceivedIssue",
  "profileDocumentSource",
  "profileCurrentGoal",
  "profileAuthorityGuidance",
] as const;

/** v1.1 redesign — active for new CASE_06 sessions (legacy restore uses CASE06_LEGACY_PHASE1_FIELD_ORDER). */
export const CASE06_PHASE1_FIELD_ORDER = CASE06_V11_PHASE1_FIELD_ORDER;

/** 개인화 퍼널 v1 — 1차 Q1 포함 4개. inquiryFocus·deadline은 2차(필요한 고객만) */
export const CASE03_PHASE1_FIELD_ORDER = [
  "case03_authorityDemand",
  "case03_customerResponse",
  "case03_confirmGoal",
] as const;

function getCase03Phase1VisibleFields(_answers: ReviewAnswers): string[] {
  return [...CASE03_PHASE1_FIELD_ORDER];
}

/** 개인화 퍼널 v1 — customerResponse를 confirmGoal 앞으로(제출 여부가 뒤 질문을 좌우) */
export const CASE04_PHASE1_FIELD_ORDER = [
  "case04_supplementTarget",
  "case04_customerResponse",
  "case04_confirmGoal",
  "case04_deadline",
] as const;

/** 이미 다시 제출한 고객에게 '제출 기한'은 묻지 않음 */
export function case04NeedsDeadlinePhase1(answers: ReviewAnswers): boolean {
  return answers.case04_customerResponse !== "submitted";
}

function getCase04Phase1VisibleFields(answers: ReviewAnswers): string[] {
  const fields: string[] = CASE04_PHASE1_FIELD_ORDER.filter(
    (id) => id !== "case04_deadline" || case04NeedsDeadlinePhase1(answers),
  );
  if (case04NeedsDeadlineDateDetail(answers)) {
    fields.push(CASE04_DEADLINE_DATE_KEY);
  }
  return fields;
}

/** 개인화 퍼널 v1 — 1차 Q1 포함 4개. deadline·deadlineDate는 2차(필요한 고객만) */
export const CASE05_PHASE1_FIELD_ORDER = [
  "case05_dispositionType",
  "case05_customerResponse",
  "case05_confirmGoal",
] as const;

function getCase05Phase1VisibleFields(_answers: ReviewAnswers): string[] {
  return [...CASE05_PHASE1_FIELD_ORDER];
}

export function getAdminVerifyPhase1VisibleFields(
  answers: ReviewAnswers,
  q1Case: string,
): string[] {
  switch (q1Case) {
    case "CASE_01":
      return [...CASE01_PHASE1_FIELD_ORDER];
    case "CASE_02":
      return getCase02Phase1VisibleFields(seedCase02AnswersFromCustomerInput(answers));
    case "CASE_03":
      return getCase03Phase1VisibleFields(answers);
    case "CASE_04":
      return getCase04Phase1VisibleFields(answers);
    case "CASE_05":
      return getCase05Phase1VisibleFields(answers);
    case "CASE_06":
      return isCase06LegacyRestorePath(answers)
        ? [...CASE06_LEGACY_PHASE1_FIELD_ORDER]
        : [...CASE06_V11_PHASE1_FIELD_ORDER];
    default:
      return [];
  }
}

/** 개인화 퍼널 v1 — 1차 Q1 포함 4개. paymentInfoSource·situationMatch·paymentAmount는 2차(필요한 고객만) */
export const CASE02_PHASE1_FIELD_ORDER = [
  "case02_paymentSubject",
  "case02_paymentStatus",
  "case02_confirmGoal",
] as const;

export function inferCase02DemandAuthorityFromText(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (/교통국|교통.?관|교통기관/.test(trimmed)) return "traffic";
  if (/경찰/.test(trimmed)) return "police";
  if (/차량.?등록|검사.?관|등록.?검사/.test(trimmed)) return "vehicle_reg";
  if (/교통|운전|면허/.test(trimmed)) return "traffic";
  return null;
}

/** 개인화 퍼널 v1 — 면허·차량 등록 비용은 납부 이유에서 기관이 드러나므로 묻지 않음 */
function case02ShouldAskDemandAuthority(answers: ReviewAnswers): boolean {
  if (answers.case02_demandAuthority) return false;
  const subject = answers.case02_paymentSubject;
  return subject !== "license_fee" && subject !== "vehicle_reg_fee";
}

export function getCase02Phase1VisibleFields(_answers: ReviewAnswers): string[] {
  return [...CASE02_PHASE1_FIELD_ORDER];
}

export function seedCase02AnswersFromCustomerInput(answers: ReviewAnswers): ReviewAnswers {
  const handoff = seedCase02AnswersFromCase06Handoff(answers);
  const text = customerTextFromAnswers(handoff);
  const authority = inferCase02DemandAuthorityFromText(text);
  if (!authority || handoff.case02_demandAuthority) return handoff;
  return {
    ...handoff,
    case02_demandAuthority: authority,
  };
}

function resolveAdminVerifyPhase1ProgressFieldId(
  q1Case: MasterCaseId,
  activeId: string,
): string {
  if (q1Case === "CASE_01" && activeId === CASE01_DEADLINE_DATE_KEY) {
    return "case01_deadline";
  }
  if (q1Case === "CASE_03" && activeId === CASE03_DEADLINE_DATE_KEY) {
    return "case03_deadline";
  }
  if (q1Case === "CASE_04" && activeId === CASE04_DEADLINE_DATE_KEY) {
    return "case04_deadline";
  }
  if (q1Case === "CASE_05" && activeId === CASE05_DEADLINE_DATE_KEY) {
    return "case05_deadline";
  }
  return activeId;
}

export function getAdminVerifyStitchProgress(
  answers: ReviewAnswers,
  questions: { id: string }[],
  activeQuestionIndex: number,
  profilePhase: AdminVerifyProfilePhase,
  phase2PathQuestionIds?: readonly string[],
): { current: number; total: number } {
  const q1Case = getQ1ResolvedCase(answers);
  const activeQuestion = questions[activeQuestionIndex];
  const activeId = activeQuestion?.id ?? "";
  const progressFieldId =
    q1Case && q1Case !== "UNIVERSAL"
      ? resolveAdminVerifyPhase1ProgressFieldId(q1Case, activeId)
      : activeId;

  if (profilePhase === 1 && q1Case && q1Case !== "UNIVERSAL") {
    const phase1Fields = getAdminVerifyPhase1VisibleFields(answers, q1Case);
    const q1Complete = isAdminCaseEntryQ1Complete(answers);
    const total = (q1Complete ? 1 : 0) + phase1Fields.length;
    if (!q1Complete || activeId === ADMIN_CASE_ENTRY_Q1_KEY) {
      return { current: 1, total };
    }
    const phase1Index = phase1Fields.indexOf(progressFieldId);
    if (phase1Index >= 0) {
      return { current: 1 + phase1Index + 1, total };
    }
    return {
      current: Math.min(activeQuestionIndex >= 0 ? activeQuestionIndex + 1 : 1, total),
      total,
    };
  }

  if (profilePhase === 2 && q1Case && q1Case !== "UNIVERSAL") {
    const phase2Ids =
      phase2PathQuestionIds && phase2PathQuestionIds.length > 0
        ? [...phase2PathQuestionIds]
        : questions
            .map((question) => question.id)
            .filter((id) => id !== ADMIN_CASE_ENTRY_Q1_KEY);
    const total = Math.max(phase2Ids.length, 1);
    if (activeId === ADMIN_CASE_ENTRY_Q1_KEY) {
      return { current: 1, total };
    }
    const phase2Index = phase2Ids.indexOf(activeId);
    if (phase2Index >= 0) {
      return { current: phase2Index + 1, total };
    }
    const answeredOnPath = phase2Ids.filter((id) => {
      const v = answers[id as keyof ReviewAnswers]?.trim();
      return Boolean(v);
    }).length;
    return {
      current: Math.min(Math.max(answeredOnPath, 1), total),
      total,
    };
  }

  return {
    current: activeQuestionIndex >= 0 ? activeQuestionIndex + 1 : 1,
    total: questions.length,
  };
}

const CASE02_BLOCKAGE_OPTIONS = [
  { value: "obligation", label: "제가 정말 내야 하는 돈인지 확신이 없어, 납부를 망설이고 있습니다." },
  { value: "amount", label: "얼마를 내야 하는지 정확히 알 수 없어, 납부하지 못하고 있습니다." },
  { value: "basis", label: "왜 내야 하는지 근거를 이해하지 못해, 대응을 정하지 못하고 있습니다." },
  { value: "method", label: "내야 하는 것은 알지만, 어디서 어떻게 내야 하는지 몰라 멈춰 있습니다." },
  { value: "deadline", label: "기한을 모르거나, 이미 납부했는데 처리 여부를 확인하지 못해 멈춰 있습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_EVIDENCE_OPTIONS = [
  { value: "yes", label: "통지서·영수증 등 확인할 수 있는 자료를 모두 가지고 있습니다." },
  { value: "partial", label: "일부 자료만 있고, 무엇이 더 필요한지는 모르겠습니다." },
  { value: "no", label: "지금 확인할 수 있는 자료가 없습니다." },
  { value: "unsure", label: "어떤 자료를 준비해야 하는지 모르겠습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_FINAL_GOAL_OPTIONS = [
  { value: "verify_obligation", label: "꼭 내야 하는 돈인지 확인하고, 아니라면 납부하지 않고 정리하고 싶습니다." },
  { value: "verify_amount", label: "금액이 맞는지 확인하고, 틀렸다면 바로잡은 뒤 납부하고 싶습니다." },
  { value: "complete_payment", label: "올바른 방법으로 기한 안에 납부하고, 처리까지 확인하고 싶습니다." },
  { value: "expert", label: "제 상황을 전문가에게 정확히 전달해, 대응을 맡기고 싶습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE02_OPTION_LABELS: Record<string, string> = {
  /** 옛 선택지 라벨 — 현재 선택지가 있으면 아래 spread가 덮어씀 */
  attendance_related: "출석·소명 요구로 보이고 납부 요구는 아닌 것 같습니다",
  supplement_related: "서류 보완·추가 제출 요구로 보이고 납부 요구는 아닌 것 같습니다",
  disposition_related: "면허·등록·허가 처분·조치 안내로 보이고 납부 요구는 아닌 것 같습니다",
  why_pay: "왜 이 납부를 해야 한다고 기관에서 판단했는지 확인하고 싶습니다.",
  reason_unclear:
    "납부하라는 금액은 어느 정도인지 알고 있지만, 왜 이 금액을 내야 하는지는 아직 명확하지 않습니다.",
  stated_uncertain:
    "금액은 어느 정도 알고 있지만, 실제로 내야 하는 금액이 맞는지 확신하지 못하고, 왜 이 금액인지·어떤 기준인지도 아직 명확하지 않습니다.",
  amount_calc_unclear:
    "금액은 어느 정도 알고 있지만, 실제로 내야 하는 금액이 맞는지 확신하지 못하고, 왜 이 금액인지·어떤 기준인지도 아직 명확하지 않습니다.",
  penalty_stated:
    "기한 내 미납 시 추가 벌금·제재가 있거나, 강제징수·추심 등 후속 조치가 있다고 안내합니다.",
  enforcement_stated:
    "기한 내 미납 시 추가 벌금·제재가 있거나, 강제징수·추심 등 후속 조치가 있다고 안내합니다.",
  unsure: "어디서 납부를 요구한 것인지 정확히 모르겠습니다.",
  verification: "이미 납부했는데 처리 여부를 확인하지 못했습니다",
  other: "위에 없는 다른 부분에서 막혀 있습니다",
  ...Object.fromEntries(CASE02_CONFIRM_GOAL_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_PAYMENT_INFO_SOURCE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_DEMAND_AUTHORITY_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_PAYMENT_SUBJECT_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_PAYMENT_AMOUNT_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_PAYMENT_BASIS_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_NOTICE_ACCESS_FACT_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_PAYMENT_CONFIRMATION_FACT_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_PAID_PROCESSING_FACT_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_SITUATION_MATCH_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_PAYMENT_STATUS_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_PAYMENT_METHOD_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_NON_PAYMENT_NOTICE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_DEADLINE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_BLOCKAGE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_EVIDENCE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_FINAL_GOAL_OPTIONS.map((o) => [o.value, o.label])),
};

const CASE02_FIELD_OPTION_MAP: Record<string, { value: string; label: string }[]> = {
  case02_demandAuthority: CASE02_DEMAND_AUTHORITY_OPTIONS,
  case02_paymentInfoSource: CASE02_PAYMENT_INFO_SOURCE_OPTIONS,
  case02_paymentSubject: CASE02_PAYMENT_SUBJECT_OPTIONS,
  case02_paymentBasis: CASE02_PAYMENT_BASIS_OPTIONS,
  case02_noticeAccessFact: CASE02_NOTICE_ACCESS_FACT_OPTIONS,
  case02_paymentConfirmationFact: CASE02_PAYMENT_CONFIRMATION_FACT_OPTIONS,
  case02_paidProcessingFact: CASE02_PAID_PROCESSING_FACT_OPTIONS,
  case02_paymentAmount: CASE02_PAYMENT_AMOUNT_OPTIONS,
  case02_situationMatch: CASE02_SITUATION_MATCH_OPTIONS,
  case02_deadline: CASE02_DEADLINE_OPTIONS,
  case02_paymentStatus: CASE02_PAYMENT_STATUS_OPTIONS,
  case02_paymentMethod: CASE02_PAYMENT_METHOD_OPTIONS,
  case02_nonPaymentNotice: CASE02_NON_PAYMENT_NOTICE_OPTIONS,
  case02_blockage: CASE02_BLOCKAGE_OPTIONS,
  case02_evidence: CASE02_EVIDENCE_OPTIONS,
  case02_confirmGoal: CASE02_CONFIRM_GOAL_OPTIONS,
  case02_finalGoal: CASE02_FINAL_GOAL_OPTIONS,
};

export function getCase02FieldOptionLabel(fieldId: string, value: string): string {
  if (fieldId === "case02_paymentAmount") {
    const normalized = case02NormalizePaymentAmountValue(value);
    if (normalized && normalized !== value) {
      return getCase02FieldOptionLabel(fieldId, normalized);
    }
  }
  if (fieldId === "case02_nonPaymentNotice") {
    const normalized = case02NormalizeNonPaymentNoticeValue(value);
    if (normalized && normalized !== value) {
      return getCase02FieldOptionLabel(fieldId, normalized);
    }
  }
  if (fieldId === "case02_paymentBasis") {
    const normalized = case02NormalizePaymentBasisValue(value);
    if (normalized && normalized !== value) {
      return getCase02FieldOptionLabel(fieldId, normalized);
    }
  }
  const options = CASE02_FIELD_OPTION_MAP[fieldId];
  const matched = options?.find((option) => option.value === value);
  return matched?.label ?? value;
}

/** CASE_02 Direct Input — CASE_05 dispositionType "other" + note 패턴과 동일 */
export function getCase02FieldLabelFromAnswers(
  fieldId: string,
  answers: ReviewAnswers,
): { label: string; factStatus: FactStatus } | null {
  const value = answers[fieldId as keyof ReviewAnswers]?.trim();
  if (!value) return null;
  if (value === "other") {
    const note = answers[getAdminChoiceNoteKey(fieldId)]?.trim();
    const fallback = getCase02FieldOptionLabel(fieldId, "other");
    return {
      label: note || fallback,
      factStatus: note ? "confirmed" : "candidate",
    };
  }
  return {
    label: getCase02FieldOptionLabel(fieldId, value),
    factStatus: "confirmed",
  };
}

export function case02EffectiveSituationMatch(value: string | undefined): string | undefined {
  if (value === "other") return "unknown";
  return value;
}

export function case02EffectivePaymentAmount(value: string | undefined): string | undefined {
  const normalized = case02NormalizePaymentAmountValue(value);
  if (normalized === "other") return "amount_unknown";
  return normalized;
}

function appendCase02DirectInputAuthorityClaimParts(base: string, answers: ReviewAnswers): string {
  let result = base;
  const amountDetail = answers[CASE02_PAYMENT_AMOUNT_DETAIL_KEY]?.trim();
  if (amountDetail) {
    result += ` / 안내 금액: ${amountDetail}`;
  }
  if (answers.case02_paymentAmount === "other") {
    const amount = getCase02FieldLabelFromAnswers("case02_paymentAmount", answers);
    if (amount) result += ` / 금액: ${amount.label}`;
  }
  if (answers.case02_paymentMethod === "other") {
    const method = getCase02FieldLabelFromAnswers("case02_paymentMethod", answers);
    if (method) result += ` / 납부 방법: ${method.label}`;
  }
  if (answers.case02_demandAuthority === "other") {
    const authority = getCase02FieldLabelFromAnswers("case02_demandAuthority", answers);
    if (authority) result += ` / 요구 기관: ${authority.label}`;
  }
  return result;
}

function case02NeedsAuthorityResponse(status: string | undefined): boolean {
  return (
    status === "partial" ||
    status === "full" ||
    status === "paid_unverified" ||
    status === "paid_by_other"
  );
}

function case02NeedsNonPaymentNotice(answers: ReviewAnswers): boolean {
  const status = answers.case02_paymentStatus;
  return status === "not_paid" || status === "partial";
}

function case02PaymentSubjectImpliesUnclear(subject: string | undefined): boolean {
  return subject === "unclear" || subject === "unsure";
}

/** 개인화 퍼널 v1 — 이미 다 낸 고객에게는 납부 기한을 묻지 않음 */
function case02NeedsDeadlinePhase2(answers: ReviewAnswers): boolean {
  if (
    isAdminVerifyChoiceFieldComplete("case02_deadline", answers, CASE02_DEADLINE_OPTIONS)
  ) {
    return false;
  }
  if (answers.case02_confirmGoal === "how_when_where") return true;
  const status = answers.case02_paymentStatus;
  return status === "not_paid" || status === "partial";
}

/** 개인화 퍼널 v1 — 의무 자체를 확인하려는 고객, 순서 모름, 이유 모름·추가 금액만 */
function case02NeedsSituationMatchPhase2(answers: ReviewAnswers): boolean {
  if (
    isAdminVerifyChoiceFieldComplete(
      "case02_situationMatch",
      answers,
      CASE02_SITUATION_MATCH_OPTIONS,
    )
  ) {
    return false;
  }
  const goal = answers.case02_confirmGoal;
  if (goal === "verify_obligation" || goal === "why_pay" || goal === "unsure") return true;
  const subject = answers.case02_paymentSubject;
  return case02PaymentSubjectImpliesUnclear(subject) || subject === "additional_related";
}

/** 아직 다 내지 않은 금액이 있는 고객 */
function case02HasUnpaidAmount(answers: ReviewAnswers): boolean {
  const status = answers.case02_paymentStatus;
  return status === "not_paid" || status === "partial";
}

/** 개인화 퍼널 v1 — 안내 경로(진위)는 아직 다 내지 않았거나, 의무·이유를 확인하려는 고객만 */
function case02NeedsPaymentInfoSourcePhase2(answers: ReviewAnswers): boolean {
  if (
    isAdminVerifyChoiceFieldComplete(
      "case02_paymentInfoSource",
      answers,
      CASE02_PAYMENT_INFO_SOURCE_OPTIONS,
    )
  ) {
    return false;
  }
  if (case02HasUnpaidAmount(answers)) return true;
  if (answers.case02_confirmGoal === "verify_obligation") return true;
  return case02PaymentSubjectImpliesUnclear(answers.case02_paymentSubject);
}

export function case02NeedsDeadlineDateDetail(answers: ReviewAnswers): boolean {
  if (answers.case02_deadline !== "confirmed") return false;
  return !answers[CASE02_DEADLINE_DATE_KEY]?.trim();
}

export function case02NeedsPaymentAmountDetail(answers: ReviewAnswers): boolean {
  if (
    !isAdminVerifyChoiceFieldComplete(
      "case02_paymentAmount",
      answers,
      CASE02_PAYMENT_AMOUNT_OPTIONS,
    )
  ) {
    return false;
  }
  if (answers.case02_paymentAmount === "other") return false;
  const amount = case02EffectivePaymentAmount(answers.case02_paymentAmount);
  if (
    amount !== "amount_differs" &&
    amount !== "paid_redemand" &&
    amount !== CASE02_PAYMENT_AMOUNT_STATED_BASIS_UNCLEAR
  ) {
    return false;
  }
  return !answers[CASE02_PAYMENT_AMOUNT_DETAIL_KEY]?.trim();
}

function case02NeedsPaymentAmountPhase2(answers: ReviewAnswers): boolean {
  if (
    isAdminVerifyChoiceFieldComplete(
      "case02_paymentAmount",
      answers,
      CASE02_PAYMENT_AMOUNT_OPTIONS,
    )
  ) {
    return false;
  }
  /** 개인화 퍼널 v1 — 금액 확인·납부하려는 고객, 추가 금액, 일부 납부, 실제와 일부 다름만 */
  const goal = answers.case02_confirmGoal;
  if (goal === "verify_amount" || goal === "how_when_where") return true;
  if (answers.case02_paymentSubject === "additional_related") return true;
  if (answers.case02_paymentStatus === "partial") return true;
  return case02EffectiveSituationMatch(answers.case02_situationMatch) === "partial";
}

function case02NeedsPaymentBasisPhase2(answers: ReviewAnswers): boolean {
  const goal = answers.case02_confirmGoal;
  if (goal === "why_pay" || goal === "verify_obligation") return true;
  if (case02PaymentSubjectImpliesUnclear(answers.case02_paymentSubject)) return true;
  return answers.case02_situationMatch === "not_applicable";
}

/** 개인화 퍼널 v1 — 앞선 답변으로 막힌 지점을 알 수 없는 고객만 */
function case02NeedsBlockage(answers: ReviewAnswers): boolean {
  if (answers.case02_confirmGoal === "unsure") return true;
  if (case02PaymentSubjectImpliesUnclear(answers.case02_paymentSubject)) return true;
  const match = case02EffectiveSituationMatch(answers.case02_situationMatch);
  if (match === "hard_to_judge" || match === "unknown") return true;
  if (case02EffectivePaymentAmount(answers.case02_paymentAmount) === "amount_unknown") return true;
  const basis = case02NormalizePaymentBasisValue(answers.case02_paymentBasis) ?? answers.case02_paymentBasis;
  return basis === "basis_not_explained";
}

/** 개인화 퍼널 v1 — 납부 방법: 처리가 불확실한 납부 고객, 또는 납부하려는·일부 납부 고객만 */
function case02NeedsPaymentMethod(answers: ReviewAnswers): boolean {
  const status = answers.case02_paymentStatus;
  if (case02HasPaidStatus(answers)) {
    if (status === "paid_unverified" || status === "paid_by_other" || status === "partial") return true;
    const ar = answers.case02_authorityResponse?.trim();
    if (ar && ar !== "completed") return true;
  }
  if (case02HasUnpaidAmount(answers)) {
    return answers.case02_confirmGoal === "how_when_where" || status === "partial";
  }
  return false;
}

function case02NeedsNoticeAccessFact(answers: ReviewAnswers): boolean {
  const src = answers.case02_paymentInfoSource;
  return src === "third_party" || src === "recall_unclear";
}

function case02NeedsPaymentConfirmationFact(answers: ReviewAnswers): boolean {
  return answers.case02_confirmGoal === "how_when_where";
}

function case02NeedsPaidProcessingFact(answers: ReviewAnswers): boolean {
  const status = answers.case02_paymentStatus;
  if (status === "paid_unverified" || status === "paid_by_other") return true;
  const ar = answers.case02_authorityResponse?.trim();
  return (
    ar === "more_required" ||
    ar === "no_reply_yet" ||
    ar === "procedure_unknown" ||
    ar === "unclear"
  );
}

/** 개인화 퍼널 v1 — 확인 자료는 모든 고객의 핵심 사실(COMMON). 문구는 납부 여부에 따라 달라짐 */
export function case02NeedsEvidence(_answers: ReviewAnswers): boolean {
  return true;
}

function case02NeedsFinalGoal(answers: ReviewAnswers): boolean {
  return answers.case02_confirmGoal === "unsure";
}

export function shouldActivateCase02Path(answers: ReviewAnswers): boolean {
  if (isAdminCaseEntryQ1Complete(answers)) {
    return getQ1ResolvedCase(answers) === "CASE_02";
  }
  if (answers._case02Active === "1") return true;
  if (answers.case02_confirmGoal) return true;

  const text = customerTextFromAnswers(answers);
  if (
    (answers.case03_authorityDemand || answers.case03_confirmGoal || answers._case03Active === "1") &&
    !answers.case02_confirmGoal
  ) {
    return false;
  }
  if ((answers.case04_supplementTarget || answers._case04Active === "1") && !answers.case02_confirmGoal) {
    return false;
  }
  if ((answers.case05_dispositionType || answers._case05Active === "1") && !answers.case02_confirmGoal) {
    return false;
  }
  if (isPaymentPrimaryInput(text)) return true;

  const hits = keywordCaseSignals(text);
  if (hits[0] === "CASE_02") return true;

  if (answers.case01_authorityDemand === "payment" && answers.case01_confirmGoal === "verify_payment") {
    return true;
  }

  return false;
}

export function isCase02Phase1Complete(answers: ReviewAnswers): boolean {
  const seeded = seedCase02AnswersFromCustomerInput(answers);
  for (const fieldId of CASE02_PHASE1_FIELD_ORDER) {
    const options = CASE02_FIELD_OPTIONS[fieldId];
    if (!options || !isAdminVerifyChoiceFieldComplete(fieldId, seeded, options)) {
      return false;
    }
  }
  return true;
}

function appendCase02Phase1Questions(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  const seeded = seedCase02AnswersFromCustomerInput(answers);

  pushUnique(questions, {
    id: "case02_paymentSubject",
    kind: "choice",
    label: "교통국은 어떤 이유로 돈을 납부하라고 안내했나요?",
    options: CASE02_PAYMENT_SUBJECT_OPTIONS,
  });
  if (
    !isAdminVerifyChoiceFieldComplete(
      "case02_paymentSubject",
      seeded,
      CASE02_PAYMENT_SUBJECT_OPTIONS,
    )
  ) {
    return;
  }

  pushUnique(questions, {
    id: "case02_paymentStatus",
    kind: "choice",
    label: "이 금액에 대해 지금까지 어떻게 하셨나요?",
    options: CASE02_PAYMENT_STATUS_OPTIONS,
  });
  if (
    !isAdminVerifyChoiceFieldComplete(
      "case02_paymentStatus",
      seeded,
      CASE02_PAYMENT_STATUS_OPTIONS,
    )
  ) {
    return;
  }

  pushUnique(questions, {
    id: "case02_confirmGoal",
    kind: "choice",
    label: "지금 가장 먼저 확인하고 싶은 것은 무엇인가요?",
    options: case02ConfirmGoalOptionsFor(seeded),
  });
}

/** 개인화 퍼널 v1 — 선택지 필터. 이미 저장된 값은 항상 남김(레거시 호환) */
function case02FilterOptions(
  fieldId: string,
  answers: ReviewAnswers,
  options: { value: string; label: string }[],
  keep: (value: string) => boolean,
): { value: string; label: string }[] {
  return options.filter(
    (o) => o.value === "other" || adminVerifyFieldHasSlug(answers, fieldId, o.value) || keep(o.value),
  );
}

function case02ConfirmGoalOptionsFor(answers: ReviewAnswers) {
  const status = answers.case02_paymentStatus;
  const fullyPaid = status === "full" || status === "paid_unverified" || status === "paid_by_other";
  return case02FilterOptions("case02_confirmGoal", answers, CASE02_CONFIRM_GOAL_OPTIONS, (v) => {
    if (v === "payment_processed") return status !== "not_paid";
    if (v === "how_when_where") return !fullyPaid;
    return true;
  });
}

function case02BlockageOptionsFor(answers: ReviewAnswers) {
  return case02FilterOptions("case02_blockage", answers, CASE02_BLOCKAGE_OPTIONS, (v) =>
    v !== "method" || case02HasUnpaidAmount(answers),
  );
}

function case02HasPaidStatus(answers: ReviewAnswers): boolean {
  const status = answers.case02_paymentStatus;
  return (
    status === "full" ||
    status === "paid_unverified" ||
    status === "paid_by_other" ||
    status === "partial"
  );
}

function appendCase02Phase2Questions(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  const seeded = seedCase02AnswersFromCustomerInput(answers);

  if (case02ShouldAskDemandAuthority(seeded)) {
    pushUnique(questions, {
      id: "case02_demandAuthority",
      kind: "choice",
      label: "납부를 요구한 기관은 어디인가요?",
      options: CASE02_DEMAND_AUTHORITY_OPTIONS,
    });
    if (!seeded.case02_demandAuthority) return;
  }

  if (case02NeedsPaymentInfoSourcePhase2(answers)) {
    pushUnique(questions, {
      id: "case02_paymentInfoSource",
      kind: "choice",
      label: "납부해야 한다는 내용은 어떻게 알게 되셨나요?",
      options: CASE02_PAYMENT_INFO_SOURCE_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case02_paymentInfoSource",
        answers,
        CASE02_PAYMENT_INFO_SOURCE_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case02NeedsNoticeAccessFact(answers)) {
    pushUnique(questions, {
      id: "case02_noticeAccessFact",
      kind: "choice",
      label:
        "전해 들은 납부 안내는 지금 어떤 상태인가요?",
      options: CASE02_NOTICE_ACCESS_FACT_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case02_noticeAccessFact",
        answers,
        CASE02_NOTICE_ACCESS_FACT_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case02NeedsSituationMatchPhase2(answers)) {
    pushUnique(questions, {
      id: "case02_situationMatch",
      kind: "choice",
      label:
        "이 납부 요구는 실제 있었던 일과 비교하면 어떤가요?",
      options: CASE02_SITUATION_MATCH_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case02_situationMatch",
        answers,
        CASE02_SITUATION_MATCH_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case02NeedsPaymentAmountPhase2(answers)) {
    pushUnique(questions, {
      id: "case02_paymentAmount",
      kind: "choice",
      label:
        "납부할 금액은 어떻게 안내받으셨나요?",
      options: CASE02_PAYMENT_AMOUNT_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case02_paymentAmount",
        answers,
        CASE02_PAYMENT_AMOUNT_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case02NeedsPaymentAmountDetail(answers)) {
    pushUnique(questions, {
      id: CASE02_PAYMENT_AMOUNT_DETAIL_KEY,
      kind: "text",
      label: "안내받은 금액을 입력해 주세요.",
      placeholder: "통지서나 문자에 적힌 금액과 단위를 그대로 입력해 주세요. 예) 800,000동",
    });
    if (case02NeedsPaymentAmountDetail(answers)) {
      return;
    }
  }

  if (case02NeedsPaymentBasisPhase2(answers)) {
    pushUnique(questions, {
      id: "case02_paymentBasis",
      kind: "choice",
      label: "교통국은 그 금액을 왜 내야 한다고 설명했나요?",
      options: CASE02_PAYMENT_BASIS_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case02_paymentBasis",
        answers,
        CASE02_PAYMENT_BASIS_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case02NeedsDeadlinePhase2(answers)) {
    pushUnique(questions, {
      id: "case02_deadline",
      kind: "choice",
      label: "납부 기한은 어떻게 안내받으셨나요?",
      options: CASE02_DEADLINE_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case02_deadline",
        answers,
        CASE02_DEADLINE_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case02NeedsDeadlineDateDetail(answers)) {
    pushUnique(questions, {
      id: CASE02_DEADLINE_DATE_KEY,
      kind: "text",
      label: "안내받은 납부 기한은 언제인가요?",
      placeholder: "기억나는 날짜·기한을 적어 주세요.",
    });
    if (case02NeedsDeadlineDateDetail(answers)) {
      return;
    }
  }

  /** 개인화 퍼널 v1 — 납부한 고객 / 아직 다 내지 않은 고객 흐름 분리(일부 납부는 양쪽) */
  if (case02HasPaidStatus(answers)) {
    if (case02NeedsAuthorityResponse(answers.case02_paymentStatus)) {
      pushUnique(questions, {
        id: "case02_authorityResponse",
        kind: "choice",
        label: "납부하거나 문의한 뒤, 교통국에서는 어떤 답변이 있었나요?",
        options: CASE01_AUTHORITY_RESPONSE_OPTIONS,
      });
      if (!answers.case02_authorityResponse) return;
    }

    if (case02NeedsPaidProcessingFact(answers)) {
      pushUnique(questions, {
        id: "case02_paidProcessingFact",
        kind: "choice",
        label:
          "납부한 뒤, 교통국에서 처리된 상황은 어떤가요?",
        options: CASE02_PAID_PROCESSING_FACT_OPTIONS,
      });
      if (
        !isAdminVerifyChoiceFieldComplete(
          "case02_paidProcessingFact",
          answers,
          CASE02_PAID_PROCESSING_FACT_OPTIONS,
        )
      ) {
        return;
      }
    }
  }

  if (case02NeedsPaymentMethod(answers)) {
    pushUnique(questions, {
      id: "case02_paymentMethod",
      kind: "choice",
      label: case02HasPaidStatus(answers)
        ? "어떤 방법으로 납부하셨나요?"
        : "납부해야 한다면, 어떤 방법으로 내라고 안내받으셨나요?",
      options: CASE02_PAYMENT_METHOD_OPTIONS,
    });
    if (!answers.case02_paymentMethod) return;
  }

  if (case02NeedsNonPaymentNotice(answers)) {
    pushUnique(questions, {
      id: "case02_nonPaymentNotice",
      kind: "choice",
      label: "기한 안에 납부하지 않으면 어떻게 된다고 안내받으셨나요?",
      options: CASE02_NON_PAYMENT_NOTICE_OPTIONS,
    });
    if (!answers.case02_nonPaymentNotice) return;
  }

  if (case02NeedsPaymentConfirmationFact(answers)) {
    pushUnique(questions, {
      id: "case02_paymentConfirmationFact",
      kind: "choice",
      label:
        "납부한 뒤, 처리 여부는 어떻게 확인하라고 안내받으셨나요?",
      options: CASE02_PAYMENT_CONFIRMATION_FACT_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case02_paymentConfirmationFact",
        answers,
        CASE02_PAYMENT_CONFIRMATION_FACT_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case02NeedsBlockage(answers)) {
    pushUnique(questions, {
      id: "case02_blockage",
      kind: "choice",
      label: "현재 이 일이 진행되지 못하는 가장 큰 이유는 무엇인가요?",
      options: case02BlockageOptionsFor(answers),
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case02_blockage",
        answers,
        CASE02_BLOCKAGE_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case02NeedsEvidence(answers)) {
    pushUnique(questions, {
      id: "case02_evidence",
      kind: "choice",
      label: case02HasPaidStatus(answers)
        ? "납부 영수증이나 이체 기록 등 확인할 수 있는 자료가 있나요?"
        : "통지서나 문자 등 확인할 수 있는 자료가 있나요?",
      options: CASE02_EVIDENCE_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case02_evidence",
        answers,
        CASE02_EVIDENCE_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case02NeedsFinalGoal(answers)) {
    pushUnique(questions, {
      id: "case02_finalGoal",
      kind: "choice",
      label: "이번 검토를 통해 이 일을 어떻게 마무리하고 싶으신가요?",
      options: CASE02_FINAL_GOAL_OPTIONS,
    });
  }
}

function appendCase02PathQuestions(
  questions: ProfileQuestion[],
  answers: ReviewAnswers,
  phase: AdminVerifyProfilePhase = 2,
): void {
  const seeded = seedCase02AnswersFromCustomerInput(answers);
  if (phase === 1) {
    appendCase02Phase1Questions(questions, seeded);
    return;
  }
  if (isCase06ReclassifiedToCase02(answers) && !isCase02Phase1Complete(seeded)) {
    appendCase02Phase1Questions(questions, seeded);
    if (!isCase02Phase1Complete(seeded)) return;
  }
  appendCase02Phase2Questions(questions, seeded);
}

function case02PathFieldsComplete(answers: ReviewAnswers): boolean {
  const seeded = seedCase02AnswersFromCustomerInput(answers);
  if (!isCase02Phase1Complete(seeded)) return false;

  if (case02ShouldAskDemandAuthority(seeded) && !seeded.case02_demandAuthority) {
    return false;
  }
  if (case02NeedsPaymentInfoSourcePhase2(answers)) return false;
  if (
    case02NeedsNoticeAccessFact(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case02_noticeAccessFact",
      answers,
      CASE02_NOTICE_ACCESS_FACT_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case02NeedsSituationMatchPhase2(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case02_situationMatch",
      answers,
      CASE02_SITUATION_MATCH_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case02NeedsPaymentAmountPhase2(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case02_paymentAmount",
      answers,
      CASE02_PAYMENT_AMOUNT_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case02NeedsPaymentBasisPhase2(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case02_paymentBasis",
      answers,
      CASE02_PAYMENT_BASIS_OPTIONS,
    )
  ) {
    return false;
  }

  if (
    case02NeedsDeadlinePhase2(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case02_deadline",
      answers,
      CASE02_DEADLINE_OPTIONS,
    )
  ) {
    return false;
  }

  if (case02NeedsPaymentAmountDetail(answers)) return false;
  if (case02NeedsDeadlineDateDetail(answers)) return false;

  if (case02HasPaidStatus(answers)) {
    if (
      case02NeedsAuthorityResponse(answers.case02_paymentStatus) &&
      !answers.case02_authorityResponse
    ) {
      return false;
    }
    if (
      case02NeedsPaidProcessingFact(answers) &&
      !isAdminVerifyChoiceFieldComplete(
        "case02_paidProcessingFact",
        answers,
        CASE02_PAID_PROCESSING_FACT_OPTIONS,
      )
    ) {
      return false;
    }
  }
  if (case02NeedsPaymentMethod(answers) && !answers.case02_paymentMethod) return false;
  if (case02NeedsNonPaymentNotice(answers) && !answers.case02_nonPaymentNotice) return false;

  if (
    case02NeedsPaymentConfirmationFact(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case02_paymentConfirmationFact",
      answers,
      CASE02_PAYMENT_CONFIRMATION_FACT_OPTIONS,
    )
  ) {
    return false;
  }

  if (
    case02NeedsBlockage(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case02_blockage",
      answers,
      CASE02_BLOCKAGE_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case02NeedsEvidence(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case02_evidence",
      answers,
      CASE02_EVIDENCE_OPTIONS,
    )
  ) {
    return false;
  }
  if (case02NeedsFinalGoal(answers) && !answers.case02_finalGoal) {
    return false;
  }
  if (
    case02HasPaidStatus(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case02_evidence",
      answers,
      CASE02_EVIDENCE_OPTIONS,
    )
  ) {
    return false;
  }
  return true;
}

export function isCase02PathComplete(answers: ReviewAnswers): boolean {
  if (!isCase02PathActiveForProfiling(answers)) return false;
  return case02PathFieldsComplete(answers);
}

function derivePaymentSignals(answers: ReviewAnswers): PaymentSignalCode[] {
  if (!shouldActivateCase02Path(answers) && !answers.case02_confirmGoal) return [];
  const signals: PaymentSignalCode[] = [];
  const situationMatch = case02EffectiveSituationMatch(answers.case02_situationMatch);
  const paymentAmount = case02EffectivePaymentAmount(answers.case02_paymentAmount);
  const paymentBasisRaw = answers.case02_paymentBasis;
  const paymentBasisNormalized = case02NormalizePaymentBasisValue(paymentBasisRaw) ?? paymentBasisRaw;
  const paymentBasis =
    paymentBasisRaw === "other"
      ? answers[getAdminChoiceNoteKey("case02_paymentBasis")]?.trim()
        ? "basis_not_explained"
        : paymentBasisRaw
      : paymentBasisNormalized;

  if (
    situationMatch === "match" &&
    paymentAmount &&
    paymentAmount !== "amount_unknown"
  ) {
    signals.push("PAYMENT_MATCH");
  }
  if (paymentAmount === "reason_unclear") {
    signals.push("PAYMENT_BASIS_UNCLEAR");
  }
  if (paymentAmount === "paid_redemand") {
    signals.push("PAYMENT_UNVERIFIED");
  }
  if (
    paymentAmount === "amount_differs" ||
    paymentAmount === CASE02_PAYMENT_AMOUNT_STATED_BASIS_UNCLEAR
  ) {
    signals.push("PAYMENT_AMOUNT_MISMATCH");
  }
  if (
    answers.case02_confirmGoal === "verify_obligation" ||
    situationMatch === "not_applicable" ||
    situationMatch === "unknown"
  ) {
    signals.push("PAYMENT_OBLIGATION_UNCLEAR");
  }
  if (
    paymentBasis === "basis_not_explained" ||
    paymentBasis === "unclear" ||
    paymentBasis === "unsure" ||
    answers.case02_confirmGoal === "why_pay"
  ) {
    signals.push("PAYMENT_BASIS_UNCLEAR");
  }
  if (
    answers.case02_paymentStatus === "paid_unverified" ||
    answers.case02_authorityResponse === "more_required" ||
    answers.case02_authorityResponse === "no_reply_yet" ||
    answers.case02_authorityResponse === "procedure_unknown" ||
    answers.case02_authorityResponse === "unclear" ||
    answers.case02_confirmGoal === "payment_processed"
  ) {
    signals.push("PAYMENT_UNVERIFIED");
  }

  return [...new Set(signals)];
}

function collectCase02Unknowns(answers: ReviewAnswers): string[] {
  const unknowns: string[] = [];
  if (!answers.case02_confirmGoal) return unknowns;

  for (const code of derivePaymentSignals(answers)) {
    if (code === "PAYMENT_MATCH") continue;
    const label = PAYMENT_SIGNAL_LABELS[code];
    if (!unknowns.includes(label)) unknowns.push(label);
  }
  const paymentAmount = case02EffectivePaymentAmount(answers.case02_paymentAmount);
  if (paymentAmount === "amount_unknown" || paymentAmount === "unsure") {
    if (!unknowns.includes(PAYMENT_SIGNAL_LABELS.PAYMENT_AMOUNT_MISMATCH)) {
      unknowns.push("통지서에 적힌 납부 금액");
    }
  }
  if (answers.case02_paymentMethod === "unclear" || answers.case02_paymentMethod === "not_stated") {
    unknowns.push("납부 방법");
  }
  if (
    answers.case02_deadline === "uncertain" ||
    answers.case02_deadline === "unsure" ||
    answers.case02_deadline === "not_stated"
  ) {
    unknowns.push("납부 기한");
  }
  return unknowns;
}

function collectCase02RiskSignals(answers: ReviewAnswers): string[] {
  const risks: string[] = [];
  if (!answers.case02_confirmGoal) return risks;

  const situationMatch = case02EffectiveSituationMatch(answers.case02_situationMatch);
  if (situationMatch === "partial" || situationMatch === "not_applicable") {
    risks.push("납부 요구와 실제 상황이 다를 수 있음 — 사실관계 확인 필요");
  }
  if (case02EffectivePaymentAmount(answers.case02_paymentAmount) === "amount_differs") {
    risks.push("통지 금액과 예상 금액이 다름 — 금액 확인 필요");
  }
  if (answers.case02_paymentStatus === "paid_unverified") {
    risks.push("납부했으나 처리 여부 미확인 — 기관 반응 확인 필요");
  }
  const notice = case02NormalizeNonPaymentNoticeValue(answers.case02_nonPaymentNotice);
  if (notice === CASE02_NON_PAYMENT_SANCTION_STATED || notice === "interest_stated") {
    risks.push("미납 시 추가 조치 안내가 있음 — 기한·내용 확인 필요");
  }
  return risks;
}

// ─── CASE_03 출석·소명 요구 Resolution Path ───

export const CASE03_DEADLINE_DATE_KEY = "case03_deadlineDate";
export const CASE03_ATTENDANCE_PLACE_KEY = "case03_attendancePlace";
export const CASE03_ATTENDANCE_WHEN_WHERE_KEY = "case03_attendanceWhenWhere";
export const CASE03_PREP_ATTENDANCE_DATE_KEY = "case03_prepAttendanceDate";

export const CASE03_ANSWER_KEYS = [
  ...CASE03_PHASE1_FIELD_ORDER,
  "case03_deadline",
  CASE03_DEADLINE_DATE_KEY,
  "case03_factRelationship",
  "case03_inquiryFocus",
  "case03_explanationDetail",
  "case03_authorityFollowUp",
  "case03_prepRequired",
  CASE03_ATTENDANCE_PLACE_KEY,
  CASE03_ATTENDANCE_WHEN_WHERE_KEY,
  CASE03_PREP_ATTENDANCE_DATE_KEY,
  "case03_repeatFollowUp",
  "case03_blockage",
  "case03_evidence",
  "case03_finalGoal",
] as const;

export type FactSignalCode =
  | "FACT_MATCH"
  | "FACT_MISMATCH_PARTIAL"
  | "FACT_MISMATCH"
  | "FACT_UNVERIFIED"
  | "FACT_UNKNOWN";

const FACT_SIGNAL_LABELS: Record<FactSignalCode, string> = {
  FACT_MATCH: "기관이 확인하려는 내용과 실제 상황이 대체로 일치한다고 응답",
  FACT_MISMATCH_PARTIAL: "일부 다른 부분이 있다고 응답 — 사실관계 확인 필요",
  FACT_MISMATCH: "실제 상황과 다르다고 응답 — 사실관계 확인 필요",
  FACT_UNVERIFIED: "설명·출석 후 기관 반응이 불명확합니다",
  FACT_UNKNOWN: "사실관계 확인이 필요합니다",
};

const CASE03_AUTHORITY_DEMAND_OPTIONS = [
  { value: "specific_incident", label: "특정 위반이나 사고에 대해, 직접 와서 설명하라는 안내를 받았습니다." },
  { value: "submission_review", label: "제출한 서류나 신청 내용 때문에, 방문해서 확인받으라는 안내를 받았습니다." },
  { value: "repeat_demand", label: "이미 한 차례 방문하거나 설명했는데, 다시 오라는 안내를 받았습니다." },
  { value: "reason_unclear", label: "방문하거나 설명하라는 안내는 받았지만, 그 이유는 설명받지 못했습니다." },
  { value: "prep_unclear", label: "방문해야 하는 이유는 알지만, 무엇을 준비해서 가야 하는지 모릅니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE03_CONFIRM_GOAL_OPTIONS = [
  { value: "prepare_materials", label: "방문할 때 어떤 서류나 자료를 준비해야 하는지 확인하고 싶습니다." },
  { value: "sufficient_explanation", label: "이미 설명한 내용으로 충분한지, 부족하다면 추가로 무엇을 해야 하는지 확인하고 싶습니다." },
  { value: "deadline_attendance", label: "직접 가야 하는지, 만약 가야 한다면 언제까지 가야 하는지 확인하고 싶습니다." },
  { value: "repeat_response", label: "이미 대응했는데, 왜 다시 요구하는지 확인하고 싶습니다." },
  { value: "unsure", label: "상황이 복잡해서, 무엇부터 진행해야 하는지 순서를 확인하고 싶습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE03_INQUIRY_FOCUS_OPTIONS = [
  { value: "action_facts", label: "제가 운전하거나 행동한 일에 대해, 당시 상황을 직접 듣고 싶어 하는 것 같습니다." },
  { value: "specific_event", label: "특정 날짜의 위반이나 사고에 대해, 기록된 내용이 맞는지 확인하려는 것 같습니다." },
  { value: "submitted_docs", label: "제가 제출한 서류나 신청 내용에 대해, 확인할 부분이 있다고 했습니다." },
  { value: "unclear", label: "안내는 받았지만, 무엇을 확인하려는 것인지는 적혀 있지 않았습니다." },
  { value: "unsure", label: "목적이 적혀 있는 것 같지만, 베트남어나 행정 용어 때문에 이해하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE03_FACT_RELATIONSHIP_OPTIONS = [
  { value: "match", label: "교통국이 확인하려는 내용이 실제 있었던 일과 거의 같습니다." },
  { value: "partial", label: "대부분 맞지만, 날짜·장소·상황 등 일부 내용이 실제와 다릅니다." },
  { value: "mismatch", label: "교통국이 확인하려는 일 자체가 실제 있었던 일과 크게 다릅니다." },
  { value: "hard_to_judge", label: "기록이 없거나 시간이 오래 지나, 실제와 비교하기 어렵습니다." },
  { value: "unknown", label: "교통국이 무엇을 확인하려는지 몰라, 비교할 수 없습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE03_CUSTOMER_RESPONSE_OPTIONS = [
  { value: "none", label: "안내만 받았고, 아직 교통국에 연락하거나 방문하지 않았습니다." },
  { value: "phone_message", label: "교통국에 전화나 메시지로 문의했지만, 아직 직접 방문하지는 않았습니다." },
  { value: "attendance", label: "교통국에 직접 방문해 상황을 설명했습니다." },
  { value: "explanation_with_docs", label: "방문하거나 설명하면서, 관련 서류나 자료도 함께 제출했습니다." },
  { value: "other_method", label: "대행사나 회사 담당자, 지인에게 맡겨 그쪽에서 진행하고 있습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE03_EXPLANATION_DETAIL_OPTIONS = [
  { value: "full_explanation", label: "당시 상황과 제가 알고 있는 사실을 직접 설명했고, 추가 질문은 받지 않았습니다." },
  { value: "with_submitted_docs", label: "상황을 설명하면서, 이를 뒷받침할 서류나 자료도 함께 제출했습니다." },
  { value: "partial_explanation", label: "질문받은 일부 내용만 설명했고, 아직 충분히 설명하지 못했습니다." },
  { value: "agency_redemand", label: "설명했지만, 교통국에서 다른 내용이나 자료를 다시 요구했습니다." },
  { value: "attended_insufficient", label: "방문은 했지만, 무엇을 설명해야 하는지 몰라 제대로 대응하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE03_AUTHORITY_FOLLOWUP_OPTIONS = [
  { value: "no_further_action", label: "추가로 할 일은 없고, 절차가 그대로 진행된다는 안내를 받았습니다." },
  { value: "more_explanation", label: "다시 방문하거나, 추가로 설명하라는 안내를 받았습니다." },
  { value: "more_docs", label: "추가 서류나 자료를 제출하라는 안내를 받았습니다." },
  { value: "other_procedure", label: "벌금 납부나 서류 보완 등 다른 절차를 진행하라는 안내를 받았습니다." },
  { value: "no_response", label: "아직 답변을 받지 못했거나, 받은 답변의 의미를 이해하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE03_PREP_REQUIRED_OPTIONS = [
  { value: "documents", label: "관련 서류나 증빙을 준비해서 가져오라는 안내를 받았습니다." },
  { value: "explanation", label: "특별한 서류 없이, 당시 상황을 설명할 준비만 하면 된다고 들었습니다." },
  { value: "attendance_only", label: "준비물 없이, 정해진 날짜에 방문만 하면 된다고 들었습니다." },
  { value: "unknown", label: "방문하라는 안내만 받았고, 무엇을 준비해야 하는지는 듣지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE03_REPEAT_FOLLOWUP_OPTIONS = [
  { value: "more_explanation", label: "처음 설명한 내용이 부족하다며, 추가 설명을 요구받았습니다." },
  { value: "re_attendance", label: "다시 날짜를 정해서, 교통국에 직접 방문하라는 요구를 받았습니다." },
  { value: "more_docs", label: "처음에는 요구하지 않았던 서류나 자료를 추가로 요구받았습니다." },
  { value: "multiple", label: "다시 방문하면서, 추가 설명과 서류까지 함께 요구받았습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE03_DEADLINE_OPTIONS = [
  { value: "specific_date", label: "안내문이나 담당자를 통해 정확한 방문 날짜나 마감일을 안내받았습니다." },
  { value: "period_stated", label: "'며칠 이내'처럼 기간만 안내받았고, 정확한 날짜는 받지 못했습니다." },
  { value: "uncertain", label: "날짜가 정해져 있다는 안내는 받았지만, 정확히 언제인지 확인하지 못했습니다." },
  { value: "not_stated", label: "날짜나 기한에 대해서는 별도의 안내를 받지 못했습니다." },
  { value: "unsure", label: "안내문이 베트남어로 되어 있어, 날짜가 적혀 있는지조차 확인하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE03_BLOCKAGE_OPTIONS = [
  { value: "what_explain", label: "교통국에 무엇을 어떻게 설명해야 할지 몰라, 방문 준비를 하지 못하고 있습니다." },
  { value: "what_docs", label: "어떤 서류나 증빙을 가져가야 하는지 몰라, 준비가 멈춰 있습니다." },
  { value: "why_attend", label: "왜 방문이나 설명을 요구하는지 이해하지 못해, 대응을 망설이고 있습니다." },
  { value: "when_attend", label: "언제까지 방문하거나 제출해야 하는지 몰라, 일정을 정하지 못하고 있습니다." },
  { value: "after_explain", label: "이미 설명하거나 제출했지만, 다음 절차를 알 수 없어 기다리고만 있습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE03_EVIDENCE_OPTIONS = [
  { value: "notice", label: "교통국에서 받은 방문·설명 안내문이나 통지서" },
  { value: "attendance_notice", label: "방문 날짜와 장소가 적힌 안내" },
  { value: "message", label: "교통국 담당자와 주고받은 문자·메신저·통화 기록" },
  { value: "submitted_docs", label: "제가 제출한 서류나 설명서(사본 포함)" },
  { value: "none", label: "보관 중인 자료가 없거나, 있는지 아직 확인하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE03_FINAL_GOAL_OPTIONS = [
  { value: "understand_demand", label: "교통국이 왜 요구하는지 정확히 이해하고, 그에 맞게 대응하고 싶습니다." },
  { value: "prepare_response", label: "필요한 서류와 설명을 준비해, 한 번의 방문으로 마무리하고 싶습니다." },
  { value: "verify_facts", label: "교통국이 확인하려는 내용이 사실과 맞는지 확인하고, 다르다면 바로잡고 싶습니다." },
  { value: "expert", label: "방문이나 설명을 전문가와 함께 준비하거나, 대신 진행해 주기를 원합니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE03_FIELD_OPTIONS: Record<string, { value: string; label: string }[]> = {
  case03_authorityDemand: CASE03_AUTHORITY_DEMAND_OPTIONS,
  case03_inquiryFocus: CASE03_INQUIRY_FOCUS_OPTIONS,
  case03_customerResponse: CASE03_CUSTOMER_RESPONSE_OPTIONS,
  case03_confirmGoal: CASE03_CONFIRM_GOAL_OPTIONS,
  case03_deadline: CASE03_DEADLINE_OPTIONS,
};

export const CASE03_FIELD_OPTION_MAP: Record<string, { value: string; label: string }[]> = {
  case03_authorityDemand: CASE03_AUTHORITY_DEMAND_OPTIONS,
  case03_confirmGoal: CASE03_CONFIRM_GOAL_OPTIONS,
  case03_inquiryFocus: CASE03_INQUIRY_FOCUS_OPTIONS,
  case03_factRelationship: CASE03_FACT_RELATIONSHIP_OPTIONS,
  case03_customerResponse: CASE03_CUSTOMER_RESPONSE_OPTIONS,
  case03_explanationDetail: CASE03_EXPLANATION_DETAIL_OPTIONS,
  case03_authorityFollowUp: CASE03_AUTHORITY_FOLLOWUP_OPTIONS,
  case03_prepRequired: CASE03_PREP_REQUIRED_OPTIONS,
  case03_repeatFollowUp: CASE03_REPEAT_FOLLOWUP_OPTIONS,
  case03_deadline: CASE03_DEADLINE_OPTIONS,
  case03_blockage: CASE03_BLOCKAGE_OPTIONS,
  case03_evidence: CASE03_EVIDENCE_OPTIONS,
  case03_finalGoal: CASE03_FINAL_GOAL_OPTIONS,
};

export const CASE03_OPTION_LABELS: Record<string, string> = {
  ...Object.fromEntries(CASE03_AUTHORITY_DEMAND_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE03_CONFIRM_GOAL_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE03_INQUIRY_FOCUS_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE03_FACT_RELATIONSHIP_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE03_CUSTOMER_RESPONSE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE03_EXPLANATION_DETAIL_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE03_AUTHORITY_FOLLOWUP_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE03_PREP_REQUIRED_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE03_REPEAT_FOLLOWUP_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE03_DEADLINE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE03_BLOCKAGE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE03_EVIDENCE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE03_FINAL_GOAL_OPTIONS.map((o) => [o.value, o.label])),
};

export function getCase03FieldOptionLabel(fieldId: string, value: string): string {
  const options = CASE03_FIELD_OPTION_MAP[fieldId];
  const matched = options?.find((option) => option.value === value);
  return matched?.label ?? getLegacyChoiceLabel(fieldId, value) ?? value;
}

/** CASE_03 Direct Input — CASE_02 `getCase02FieldLabelFromAnswers` 동형 */
export function getCase03FieldLabelFromAnswers(
  fieldId: string,
  answers: ReviewAnswers,
): { label: string; factStatus: FactStatus } | null {
  const value = answers[fieldId as keyof ReviewAnswers]?.trim();
  if (!value) return null;
  if (isAdminVerifyMultiChoiceField(fieldId)) {
    const joined = formatAdminVerifyMultiChoiceAnswerLabel(fieldId, value, (slug) =>
      getCase03FieldOptionLabel(fieldId, slug),
    );
    if (!joined) return null;
    return { label: joined, factStatus: "confirmed" };
  }
  if (value === "other") {
    const note = answers[getAdminChoiceNoteKey(fieldId)]?.trim();
    const fallback = getCase03FieldOptionLabel(fieldId, "other");
    return {
      label: note || fallback,
      factStatus: note ? "confirmed" : "candidate",
    };
  }
  return {
    label: getCase03FieldOptionLabel(fieldId, value),
    factStatus: "confirmed",
  };
}

export function case03NeedsDeadlineDateDetail(answers: ReviewAnswers): boolean {
  if (answers.case03_deadline !== "specific_date") return false;
  return !answers[CASE03_DEADLINE_DATE_KEY]?.trim();
}

function case03NeedsAttendancePlaceText(answers: ReviewAnswers): boolean {
  if (answers.case03_customerResponse !== "attendance") return false;
  return !answers[CASE03_ATTENDANCE_PLACE_KEY]?.trim();
}

function case03NeedsAttendanceWhenWhereText(answers: ReviewAnswers): boolean {
  if (!adminVerifyFieldHasSlug(answers, "case03_evidence", "attendance_notice")) return false;
  return !answers[CASE03_ATTENDANCE_WHEN_WHERE_KEY]?.trim();
}

function case03NeedsPrepAttendanceDateText(answers: ReviewAnswers): boolean {
  if (answers.case03_prepRequired !== "attendance_only") return false;
  return !answers[CASE03_PREP_ATTENDANCE_DATE_KEY]?.trim();
}

const CASE03_REPEAT_RESPONSE_VALUES = new Set([
  "more_explanation",
  "more_docs",
  "re_attendance",
  "agency_redemand",
  "multiple",
]);

function case03HasResponded(answers: ReviewAnswers): boolean {
  const response = answers.case03_customerResponse?.trim() ?? "";
  return Boolean(response && response !== "none");
}

function getCase03AuthorityResponseValue(answers: ReviewAnswers): string | undefined {
  if (answers.case03_authorityFollowUp) return answers.case03_authorityFollowUp;
  if (answers.case03_explanationDetail === "agency_redemand") return "more_explanation";
  return undefined;
}

function case03NeedsPrepDetail(answers: ReviewAnswers): boolean {
  return !case03HasResponded(answers);
}

/** 재요구가 실제로 있었던 고객만 (docs/master/VFBCAI_CASE03_CHOICE_FINAL_v1_CLAUDE.md §D) */
function case03NeedsRepeatFollowUp(answers: ReviewAnswers): boolean {
  if (answers.case03_authorityDemand === "repeat_demand") return true;
  if (answers.case03_confirmGoal === "repeat_response") return true;
  const authorityValue = getCase03AuthorityResponseValue(answers);
  if (authorityValue && CASE03_REPEAT_RESPONSE_VALUES.has(authorityValue)) {
    return true;
  }
  return answers.case03_explanationDetail === "agency_redemand";
}

function case03IsFactRelationshipPhase2Complete(answers: ReviewAnswers): boolean {
  if (!case03NeedsFactRelationshipPhase2(answers)) return true;
  return isAdminVerifyChoiceFieldComplete(
    "case03_factRelationship",
    answers,
    CASE03_FACT_RELATIONSHIP_OPTIONS,
  );
}

/** Phase2 — 설명·기관 반응 또는 미대응 시 준비 분기 완료 */
function case03IsPhase2CoreBranchComplete(answers: ReviewAnswers): boolean {
  if (case03HasResponded(answers)) {
    return (
      isAdminVerifyChoiceFieldComplete(
        "case03_explanationDetail",
        answers,
        CASE03_EXPLANATION_DETAIL_OPTIONS,
      ) &&
      isAdminVerifyChoiceFieldComplete(
        "case03_authorityFollowUp",
        answers,
        CASE03_AUTHORITY_FOLLOWUP_OPTIONS,
      )
    );
  }
  if (!case03NeedsPrepDetail(answers)) return false;
  if (
    !isAdminVerifyChoiceFieldComplete(
      "case03_prepRequired",
      answers,
      CASE03_PREP_REQUIRED_OPTIONS,
    )
  ) {
    return false;
  }
  if (case03NeedsPrepAttendanceDateText(answers)) return false;
  return true;
}

/** ②~④ 축 이후 blockage·evidence·finalGoal 실질 축 연쇄 개방 */
function case03Phase2TailAxesUnlocked(answers: ReviewAnswers): boolean {
  return isCase03Phase1Complete(answers) && case03IsPhase2CoreBranchComplete(answers);
}

export function buildCase04PrincipleFStateLines(answers: ReviewAnswers): string[] {
  const lines: string[] = [];
  const deadlineText = answers[CASE04_DEADLINE_DATE_KEY]?.trim();
  if (deadlineText) {
    lines.push(`적어 둔 보완 제출 기한: ${deadlineText}`);
  }
  const supplementSuffix = case04SupplementDetailSuffix(answers);
  if (supplementSuffix) {
    lines.push(supplementSuffix);
  }
  return lines;
}

export function buildCase05PrincipleFStateLines(answers: ReviewAnswers): string[] {
  const lines: string[] = [];
  const deadlineText = answers[CASE05_DEADLINE_DATE_KEY]?.trim();
  if (deadlineText) {
    lines.push(`적어 둔 처분 관련 대응 기한: ${deadlineText}`);
  }
  return lines;
}

export function buildCase03PrincipleFStateLines(answers: ReviewAnswers): string[] {
  const lines: string[] = [];
  const deadlineText = answers[CASE03_DEADLINE_DATE_KEY]?.trim();
  if (deadlineText) {
    lines.push(`적어 둔 출석·소명 기한: ${deadlineText}`);
  }
  const place = answers[CASE03_ATTENDANCE_PLACE_KEY]?.trim();
  if (place) {
    lines.push(`적어 둔 출석·소명 장소: ${place}`);
  }
  const whenWhere = answers[CASE03_ATTENDANCE_WHEN_WHERE_KEY]?.trim();
  if (whenWhere) {
    lines.push(`적어 둔 출석 일시·장소: ${whenWhere}`);
  }
  const prepDate = answers[CASE03_PREP_ATTENDANCE_DATE_KEY]?.trim();
  if (prepDate) {
    lines.push(`적어 둔 출석 예정일: ${prepDate}`);
  }
  return lines;
}

/** 개인화 퍼널 v1 — 특정 사건·행동 확인, 재요구, 설명 충분 여부를 확인하려는 고객만 */
function case03NeedsFactRelationshipPhase2(answers: ReviewAnswers): boolean {
  const focus = answers.case03_inquiryFocus;
  if (focus === "action_facts" || focus === "specific_event") return true;
  const demand = answers.case03_authorityDemand;
  if (demand === "specific_incident" || demand === "repeat_demand") return true;
  const goal = answers.case03_confirmGoal;
  return goal === "sufficient_explanation" || goal === "repeat_response";
}

function case03IsInquiryFocusAnswered(answers: ReviewAnswers): boolean {
  return isAdminVerifyChoiceFieldComplete(
    "case03_inquiryFocus",
    answers,
    CASE03_INQUIRY_FOCUS_OPTIONS,
  );
}

/** 개인화 퍼널 v1 — authorityDemand로 확인 목적을 알 수 없는 고객만 */
function case03NeedsInquiryFocusPhase2(answers: ReviewAnswers): boolean {
  if (case03IsInquiryFocusAnswered(answers)) return true;
  const demand = answers.case03_authorityDemand;
  if (demand === "specific_incident" || demand === "repeat_demand" || demand === "prep_unclear") {
    return true;
  }
  return answers.case03_confirmGoal === "unsure";
}

/** 개인화 퍼널 v1 — 이미 방문·설명한 고객에게는 방문 날짜를 묻지 않음 */
function case03HasVisited(answers: ReviewAnswers): boolean {
  const r = answers.case03_customerResponse;
  return r === "attendance" || r === "explanation_with_docs";
}

function case03NeedsDeadlinePhase2(answers: ReviewAnswers): boolean {
  return !case03HasVisited(answers);
}

/** 개인화 퍼널 v1 — 앞선 답변으로 막힌 지점을 알 수 없는 고객만 (tail 일괄 개방 제거) */
function case03NeedsBlockage(answers: ReviewAnswers): boolean {
  const rel = answers.case03_factRelationship;
  const focus = answers.case03_inquiryFocus;
  const demand = answers.case03_authorityDemand;
  return (
    rel === "mismatch" ||
    rel === "hard_to_judge" ||
    focus === "unclear" ||
    focus === "unsure" ||
    demand === "reason_unclear" ||
    demand === "prep_unclear" ||
    answers.case03_confirmGoal === "unsure"
  );
}

/** 개인화 퍼널 v1 — 보관 자료는 모든 고객의 핵심 사실(COMMON). 선택지만 필터 */
function case03NeedsEvidence(_answers: ReviewAnswers): boolean {
  return true;
}

/** 개인화 퍼널 v1 — 목표를 앞선 답변으로 알 수 없는 고객만 */
function case03NeedsFinalGoal(answers: ReviewAnswers): boolean {
  const demand = answers.case03_authorityDemand;
  const focus = answers.case03_inquiryFocus;
  return (
    demand === "reason_unclear" ||
    demand === "prep_unclear" ||
    focus === "unsure" ||
    focus === "unclear" ||
    answers.case03_confirmGoal === "unsure"
  );
}

/** STEP2-1 R4 — Phase2 실질 축 (장식 3개 실질화 포함, R3 텍스트는 축으로 세지 않음) */
export const CASE03_PHASE2_SUBSTANTIVE_AXIS_IDS = [
  "case03_factRelationship",
  "case03_explanationDetail",
  "case03_authorityFollowUp",
  "case03_prepRequired",
  "case03_repeatFollowUp",
  "case03_blockage",
  "case03_evidence",
  "case03_finalGoal",
  CASE03_ATTENDANCE_PLACE_KEY,
] as const;

export function case03Phase2SubstantiveAxisCatalogCount(): number {
  return CASE03_PHASE2_SUBSTANTIVE_AXIS_IDS.length;
}

export function case03ListPhase2SubstantiveAxesOnPath(answers: ReviewAnswers): string[] {
  const axes: string[] = [];
  const maybe = (id: string, needs: boolean) => {
    if (needs) axes.push(id);
  };
  maybe("case03_factRelationship", case03NeedsFactRelationshipPhase2(answers));
  maybe("case03_explanationDetail", case03HasResponded(answers));
  maybe("case03_authorityFollowUp", case03HasResponded(answers));
  maybe(
    "case03_prepRequired",
    case03NeedsPrepDetail(answers) && !case03HasResponded(answers),
  );
  maybe("case03_repeatFollowUp", case03NeedsRepeatFollowUp(answers));
  maybe("case03_blockage", case03NeedsBlockage(answers));
  maybe("case03_evidence", case03NeedsEvidence(answers));
  maybe("case03_finalGoal", case03NeedsFinalGoal(answers));
  maybe(
    CASE03_ATTENDANCE_PLACE_KEY,
    case03NeedsAttendancePlaceText(answers) ||
      Boolean(answers[CASE03_ATTENDANCE_PLACE_KEY]?.trim()),
  );
  return axes.filter((id) =>
    (CASE03_PHASE2_SUBSTANTIVE_AXIS_IDS as readonly string[]).includes(id),
  );
}

/** 실측·비율 감사 — 2차에서 실제 답이 채워진 실질 축 개수 */
export function case03CountAnsweredPhase2SubstantiveAxes(answers: ReviewAnswers): number {
  let count = 0;
  for (const id of CASE03_PHASE2_SUBSTANTIVE_AXIS_IDS) {
    if (id === CASE03_ATTENDANCE_PLACE_KEY) {
      if (answers[id]?.trim()) count += 1;
      continue;
    }
    const options = CASE03_FIELD_OPTION_MAP[id];
    if (options && isAdminVerifyChoiceFieldComplete(id, answers, options)) {
      count += 1;
    }
  }
  return count;
}

function deriveCase03Rounds(answers: ReviewAnswers): { explanationRound: number; responseRound: number } {
  let explanationRound = 0;
  let responseRound = 0;
  if (case03HasResponded(answers)) {
    explanationRound = 1;
    responseRound = 1;
  }
  const authorityValue = getCase03AuthorityResponseValue(answers);
  if (authorityValue && CASE03_REPEAT_RESPONSE_VALUES.has(authorityValue)) {
    explanationRound = Math.max(explanationRound, 2);
    responseRound = Math.max(responseRound, 2);
  }
  const repeat = answers.case03_repeatFollowUp;
  if (repeat && repeat !== "not_applicable") {
    explanationRound = Math.max(explanationRound, 2);
    responseRound = Math.max(responseRound, 2);
  }
  return { explanationRound, responseRound };
}

export function shouldActivateCase03Path(answers: ReviewAnswers): boolean {
  if (isAdminCaseEntryQ1Complete(answers)) {
    return getQ1ResolvedCase(answers) === "CASE_03";
  }
  if (answers.case05_dispositionType || answers._case05Active === "1") return false;
  if (answers.case04_supplementTarget || answers._case04Active === "1") return false;
  if (answers._case03Active === "1") return true;
  if (answers.case03_authorityDemand) return true;
  if (answers.case03_inquiryFocus) return true;
  if (answers.case03_confirmGoal) return true;
  if (shouldActivateCase02Path(answers)) return false;

  const text = customerTextFromAnswers(answers);
  if (isSupplementPrimaryInput(text) && !isAttendancePrimaryInput(text)) return false;
  if (isAttendancePrimaryInput(text)) return true;

  const hits = keywordCaseSignals(text);
  if (hits[0] === "CASE_03") return true;

  if (
    answers.case01_authorityDemand === "attendance" &&
    (answers.case01_confirmGoal === "what_when" ||
      answers.case01_confirmGoal === "what_to_do_now" ||
      answers.case01_confirmGoal === "unsure")
  ) {
    return true;
  }

  return false;
}

export function isCase03Phase1Complete(answers: ReviewAnswers): boolean {
  for (const fieldId of CASE03_PHASE1_FIELD_ORDER) {
    const options = CASE03_FIELD_OPTIONS[fieldId];
    if (!options || !isAdminVerifyChoiceFieldComplete(fieldId, answers, options)) {
      return false;
    }
  }
  return true;
}

/** 개인화 퍼널 v1 — 선택지 필터. 이미 저장된 값은 항상 남김(레거시 호환) */
function case03FilterOptions(
  fieldId: string,
  answers: ReviewAnswers,
  options: { value: string; label: string }[],
  keep: (value: string) => boolean,
): { value: string; label: string }[] {
  return options.filter(
    (o) => o.value === "other" || adminVerifyFieldHasSlug(answers, fieldId, o.value) || keep(o.value),
  );
}

function case03ConfirmGoalOptionsFor(answers: ReviewAnswers) {
  const demand = answers.case03_authorityDemand;
  return case03FilterOptions("case03_confirmGoal", answers, CASE03_CONFIRM_GOAL_OPTIONS, (v) => {
    if (v === "repeat_response") return demand === "repeat_demand";
    if (v === "sufficient_explanation") return case03HasResponded(answers);
    if (v === "deadline_attendance" || v === "prepare_materials") return !case03HasVisited(answers);
    return true;
  });
}

function case03InquiryFocusOptionsFor(answers: ReviewAnswers) {
  const demand = answers.case03_authorityDemand;
  return case03FilterOptions("case03_inquiryFocus", answers, CASE03_INQUIRY_FOCUS_OPTIONS, (v) =>
    !(demand === "specific_incident" && v === "submitted_docs"),
  );
}

function case03FactRelationshipOptionsFor(answers: ReviewAnswers) {
  const focus = answers.case03_inquiryFocus;
  return case03FilterOptions("case03_factRelationship", answers, CASE03_FACT_RELATIONSHIP_OPTIONS, (v) =>
    v !== "unknown" || !focus || focus === "unclear" || focus === "unsure",
  );
}

function case03BlockageOptionsFor(answers: ReviewAnswers) {
  const deadline = answers.case03_deadline;
  return case03FilterOptions("case03_blockage", answers, CASE03_BLOCKAGE_OPTIONS, (v) => {
    if (v === "after_explain") return case03HasResponded(answers);
    if (v === "when_attend") {
      return deadline === "uncertain" || deadline === "not_stated" || deadline === "unsure";
    }
    return true;
  });
}

function case03EvidenceOptionsFor(answers: ReviewAnswers) {
  return case03FilterOptions("case03_evidence", answers, CASE03_EVIDENCE_OPTIONS, (v) =>
    v !== "submitted_docs" ||
    answers.case03_authorityDemand === "submission_review" ||
    answers.case03_customerResponse === "explanation_with_docs" ||
    answers.case03_explanationDetail === "with_submitted_docs",
  );
}

function case03FinalGoalOptionsFor(answers: ReviewAnswers) {
  return case03FilterOptions("case03_finalGoal", answers, CASE03_FINAL_GOAL_OPTIONS, (v) =>
    v !== "prepare_response" || !case03HasVisited(answers),
  );
}

/** 질문을 띄우고, 완료 여부는 전체 선택지 기준으로 판정(필터된 선택지는 표시용) */
function case03Ask(
  questions: ProfileQuestion[],
  answers: ReviewAnswers,
  id: string,
  label: string,
  shownOptions: { value: string; label: string }[],
  fullOptions: { value: string; label: string }[],
): boolean {
  pushUnique(questions, { id, kind: "choice", label, options: shownOptions });
  return isAdminVerifyChoiceFieldComplete(id, answers, fullOptions);
}

function appendCase03Phase1Questions(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  if (
    !case03Ask(questions, answers, "case03_authorityDemand",
      "교통국에서 받은 방문·설명 안내는 어떤 상황인가요?",
      CASE03_AUTHORITY_DEMAND_OPTIONS, CASE03_AUTHORITY_DEMAND_OPTIONS)
  ) {
    return;
  }
  if (
    !case03Ask(questions, answers, "case03_customerResponse",
      "안내를 받은 뒤, 현재 어디까지 진행하셨나요?",
      CASE03_CUSTOMER_RESPONSE_OPTIONS, CASE03_CUSTOMER_RESPONSE_OPTIONS)
  ) {
    return;
  }
  case03Ask(questions, answers, "case03_confirmGoal",
    "지금 가장 먼저 확인하고 싶은 것은 무엇인가요?",
    case03ConfirmGoalOptionsFor(answers), CASE03_CONFIRM_GOAL_OPTIONS);
}

/**
 * 개인화 퍼널 v1 — 대응 전: 방문 날짜 → 준비물 / 대응 후: 설명 방식 → 장소 → 교통국 답변 → 재요구,
 * 이어서 앞선 답변으로 알 수 없을 때만 확인 목적 → 실제와 비교 → 막힌 점 → 보관 자료 → 마무리 목표.
 */
function appendCase03Phase2Questions(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  if (case03NeedsDeadlinePhase2(answers)) {
    if (
      !case03Ask(questions, answers, "case03_deadline",
        "방문하거나 설명해야 하는 날짜는 어떻게 안내받으셨나요?",
        CASE03_DEADLINE_OPTIONS, CASE03_DEADLINE_OPTIONS)
    ) {
      return;
    }
    if (case03NeedsDeadlineDateDetail(answers)) {
      pushUnique(questions, {
        id: CASE03_DEADLINE_DATE_KEY,
        kind: "text",
        label: "안내받은 방문 날짜나 마감일은 언제인가요?",
        placeholder: "안내문에 적힌 그대로 입력해 주세요. 예) 2026년 10월 15일 오전 9시",
      });
      return;
    }
  }

  if (case03HasResponded(answers)) {
    if (
      !case03Ask(questions, answers, "case03_explanationDetail",
        "교통국에 설명할 때 어떻게 진행되었나요?",
        CASE03_EXPLANATION_DETAIL_OPTIONS, CASE03_EXPLANATION_DETAIL_OPTIONS)
    ) {
      return;
    }
    if (case03NeedsAttendancePlaceText(answers)) {
      pushUnique(questions, {
        id: CASE03_ATTENDANCE_PLACE_KEY,
        kind: "text",
        label: "방문해서 설명한 곳은 어디인가요?",
        placeholder: "기관 이름이나 주소를 기억나는 대로 입력해 주세요.",
      });
      return;
    }
    if (
      !case03Ask(questions, answers, "case03_authorityFollowUp",
        "대응한 뒤, 교통국에서는 어떤 답변이 있었나요?",
        CASE03_AUTHORITY_FOLLOWUP_OPTIONS, CASE03_AUTHORITY_FOLLOWUP_OPTIONS)
    ) {
      return;
    }
  } else if (case03NeedsPrepDetail(answers)) {
    if (
      !case03Ask(questions, answers, "case03_prepRequired",
        "직접 방문해야 한다면, 무엇을 준비하라고 안내받으셨나요?",
        CASE03_PREP_REQUIRED_OPTIONS, CASE03_PREP_REQUIRED_OPTIONS)
    ) {
      return;
    }
    if (case03NeedsPrepAttendanceDateText(answers)) {
      pushUnique(questions, {
        id: CASE03_PREP_ATTENDANCE_DATE_KEY,
        kind: "text",
        label: "방문하기로 한 날짜는 언제인가요?",
        placeholder: "기억나는 날짜와 시간을 입력해 주세요.",
      });
      return;
    }
  }

  if (case03NeedsRepeatFollowUp(answers)) {
    if (
      !case03Ask(questions, answers, "case03_repeatFollowUp",
        "다시 요구받은 내용은 무엇인가요?",
        CASE03_REPEAT_FOLLOWUP_OPTIONS, CASE03_REPEAT_FOLLOWUP_OPTIONS)
    ) {
      return;
    }
  }

  if (case03NeedsInquiryFocusPhase2(answers)) {
    if (
      !case03Ask(questions, answers, "case03_inquiryFocus",
        "교통국은 이번 방문이나 설명으로 무엇을 확인하려는 것 같나요?",
        case03InquiryFocusOptionsFor(answers), CASE03_INQUIRY_FOCUS_OPTIONS)
    ) {
      return;
    }
  }

  if (case03NeedsFactRelationshipPhase2(answers)) {
    if (
      !case03Ask(questions, answers, "case03_factRelationship",
        "교통국이 확인하려는 내용은 실제 있었던 일과 비교하면 어떤가요?",
        case03FactRelationshipOptionsFor(answers), CASE03_FACT_RELATIONSHIP_OPTIONS)
    ) {
      return;
    }
  }

  if (case03NeedsBlockage(answers)) {
    if (
      !case03Ask(questions, answers, "case03_blockage",
        "현재 이 일이 진행되지 못하는 가장 큰 이유는 무엇인가요?",
        case03BlockageOptionsFor(answers), CASE03_BLOCKAGE_OPTIONS)
    ) {
      return;
    }
  }

  if (case03NeedsEvidence(answers)) {
    if (
      !case03Ask(questions, answers, "case03_evidence",
        "현재 보관하고 있는 자료를 모두 선택해 주세요. (여러 개 선택 가능)",
        case03EvidenceOptionsFor(answers), CASE03_EVIDENCE_OPTIONS)
    ) {
      return;
    }
    if (case03NeedsAttendanceWhenWhereText(answers)) {
      pushUnique(questions, {
        id: CASE03_ATTENDANCE_WHEN_WHERE_KEY,
        kind: "text",
        label: "안내에 적힌 방문 날짜와 장소는 무엇인가요?",
        placeholder: "기억나는 날짜·시간·장소를 입력해 주세요.",
      });
      return;
    }
  }

  if (case03NeedsFinalGoal(answers)) {
    case03Ask(questions, answers, "case03_finalGoal",
      "이번 검토를 통해 이 일을 어떻게 마무리하고 싶으신가요?",
      case03FinalGoalOptionsFor(answers), CASE03_FINAL_GOAL_OPTIONS);
  }
}

function appendCase03PathQuestions(
  questions: ProfileQuestion[],
  answers: ReviewAnswers,
  phase: AdminVerifyProfilePhase = 2,
): void {
  if (phase === 1) {
    appendCase03Phase1Questions(questions, answers);
    return;
  }
  if (isCase06BridgedToNativeCase(answers, "CASE_03") && !isCase03Phase1Complete(answers)) {
    appendCase03Phase1Questions(questions, answers);
    if (!isCase03Phase1Complete(answers)) return;
  }
  appendCase03Phase2Questions(questions, answers);
}

function case03PathFieldsComplete(answers: ReviewAnswers): boolean {
  if (!isCase03Phase1Complete(answers)) return false;
  if (
    case03NeedsDeadlinePhase2(answers) &&
    !isAdminVerifyChoiceFieldComplete("case03_deadline", answers, CASE03_DEADLINE_OPTIONS)
  ) {
    return false;
  }
  if (case03NeedsDeadlineDateDetail(answers)) return false;
  if (case03NeedsAttendancePlaceText(answers)) return false;

  if (
    case03NeedsFactRelationshipPhase2(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case03_factRelationship",
      answers,
      CASE03_FACT_RELATIONSHIP_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case03NeedsInquiryFocusPhase2(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case03_inquiryFocus",
      answers,
      CASE03_INQUIRY_FOCUS_OPTIONS,
    )
  ) {
    return false;
  }

  if (case03HasResponded(answers)) {
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case03_explanationDetail",
        answers,
        CASE03_EXPLANATION_DETAIL_OPTIONS,
      )
    ) {
      return false;
    }
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case03_authorityFollowUp",
        answers,
        CASE03_AUTHORITY_FOLLOWUP_OPTIONS,
      )
    ) {
      return false;
    }
  } else if (
    case03NeedsPrepDetail(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case03_prepRequired",
      answers,
      CASE03_PREP_REQUIRED_OPTIONS,
    )
  ) {
    return false;
  } else if (case03NeedsPrepAttendanceDateText(answers)) {
    return false;
  }

  if (
    case03NeedsRepeatFollowUp(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case03_repeatFollowUp",
      answers,
      CASE03_REPEAT_FOLLOWUP_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case03NeedsBlockage(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case03_blockage",
      answers,
      CASE03_BLOCKAGE_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case03NeedsEvidence(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case03_evidence",
      answers,
      CASE03_EVIDENCE_OPTIONS,
    )
  ) {
    return false;
  }
  if (case03NeedsAttendanceWhenWhereText(answers)) return false;
  if (
    case03NeedsFinalGoal(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case03_finalGoal",
      answers,
      CASE03_FINAL_GOAL_OPTIONS,
    )
  ) {
    return false;
  }
  return true;
}

export function isCase03PathComplete(answers: ReviewAnswers): boolean {
  if (!shouldActivateCase03Path(answers)) return false;
  return case03PathFieldsComplete(answers);
}

function deriveFactSignals(answers: ReviewAnswers): FactSignalCode[] {
  if (!shouldActivateCase03Path(answers) && !answers.case03_authorityDemand) return [];
  const signals: FactSignalCode[] = [];
  const rel = answers.case03_factRelationship;

  if (rel === "match") signals.push("FACT_MATCH");
  if (rel === "partial") signals.push("FACT_MISMATCH_PARTIAL");
  if (rel === "mismatch") signals.push("FACT_MISMATCH");
  if (rel === "hard_to_judge" || rel === "unknown") signals.push("FACT_UNKNOWN");

  const authValue = getCase03AuthorityResponseValue(answers);
  if (authValue === "unsure" || authValue === "no_response") {
    signals.push("FACT_UNVERIFIED");
  }
  if (
    answers.case03_authorityDemand === "reason_unclear" ||
    answers.case03_authorityDemand === "prep_unclear" ||
    answers.case03_confirmGoal === "unsure"
  ) {
    if (!signals.includes("FACT_UNKNOWN")) signals.push("FACT_UNKNOWN");
  }
  if (answers.case03_inquiryFocus === "unsure" || answers.case03_inquiryFocus === "unclear") {
    if (!signals.includes("FACT_UNKNOWN")) signals.push("FACT_UNKNOWN");
  }
  if (answers.case03_explanationDetail === "attended_insufficient") {
    signals.push("FACT_UNVERIFIED");
  }

  return [...new Set(signals)];
}

function collectCase03Unknowns(answers: ReviewAnswers): string[] {
  const unknowns: string[] = [];
  if (!answers.case03_confirmGoal) return unknowns;

  for (const code of deriveFactSignals(answers)) {
    if (code === "FACT_MATCH") continue;
    const label = FACT_SIGNAL_LABELS[code];
    if (!unknowns.includes(label)) unknowns.push(label);
  }
  if (answers.case03_inquiryFocus === "unsure" || answers.case03_inquiryFocus === "unclear") {
    if (!unknowns.includes("기관이 확인하려는 내용")) unknowns.push("기관이 확인하려는 내용");
  }
  if (
    answers.case03_deadline === "uncertain" ||
    answers.case03_deadline === "unsure" ||
    answers.case03_deadline === "not_stated" ||
    answers.case03_deadline === "period_stated"
  ) {
    unknowns.push("출석·소명 기한");
  }
  if (answers.case03_authorityFollowUp === "unsure" || answers.case03_authorityFollowUp === "no_response") {
    if (!unknowns.includes("기관 후속 반응")) unknowns.push("기관 후속 반응");
  }
  if (answers.case03_prepRequired === "unknown" || answers.case03_prepRequired === "unsure") {
    unknowns.push("준비해야 할 내용");
  }
  if (answers.case03_confirmGoal === "unsure") {
    if (!unknowns.includes("우선 확인할 항목")) unknowns.push("우선 확인할 항목");
  }
  return unknowns;
}

function collectCase03RiskSignals(answers: ReviewAnswers): string[] {
  const risks: string[] = [];
  if (!answers.case03_confirmGoal) return risks;

  if (answers.case03_factRelationship === "partial" || answers.case03_factRelationship === "mismatch") {
    risks.push("기관이 확인하려는 내용과 실제 상황이 다를 수 있음 — 사실관계 확인 필요");
  }
  const rounds = deriveCase03Rounds(answers);
  if (rounds.explanationRound >= 2) {
    risks.push("추가 설명·출석 요구가 있음 — 동일 사건 내 반복 소명 확인 필요");
  }
  if (
    answers.case03_authorityFollowUp === "no_response" ||
    answers.case03_authorityFollowUp === "unsure" ||
    answers.case03_explanationDetail === "attended_insufficient"
  ) {
    risks.push("기관 반응이 불명확함 — 확인 필요");
  }
  if (answers.case03_authorityFollowUp === "other_procedure") {
    risks.push("기관이 다른 조치·납부 등을 안내함 — 요구 내용 확인 필요");
  }
  if (answers.case03_authorityDemand === "repeat_demand") {
    risks.push("이미 대응했으나 추가 출석·소명 요구가 있음 — 반복 대응 확인 필요");
  }
  return risks;
}

function classifyFromCase03Answers(answers: ReviewAnswers): {
  id: MasterCaseId;
  status: FactStatus;
  confidence: number;
  reason: string;
} | null {
  if (!shouldActivateCase03Path(answers) && !answers.case03_authorityDemand) return null;

  if (answers.case03_authorityFollowUp === "other_procedure") {
    return {
      id: "CASE_02",
      status: "inferred",
      confidence: 0.78,
      reason: "기관 반응이 납부·다른 절차 안내로 확인됨",
    };
  }
  if (
    answers.case03_authorityFollowUp === "more_docs" ||
    answers.case03_explanationDetail === "agency_redemand"
  ) {
    return {
      id: "CASE_04",
      status: "inferred",
      confidence: 0.74,
      reason: "기관 반응이 보완·추가 제출 요구로 확인됨",
    };
  }

  if (
    answers.case03_authorityDemand === "reason_unclear" &&
    answers.case03_confirmGoal === "unsure" &&
    (answers.case03_inquiryFocus === "unclear" || answers.case03_inquiryFocus === "unsure")
  ) {
    return {
      id: "CASE_06",
      status: "inferred",
      confidence: 0.6,
      reason: "출석·소명 요구 내용이 불명확하다고 응답",
    };
  }

  if (shouldActivateCase03Path(answers) || answers.case03_authorityDemand) {
    return {
      id: "CASE_03",
      status: answers.case03_confirmGoal ? "inferred" : "candidate",
      confidence: answers.case03_confirmGoal ? 0.75 : 0.5,
      reason: "출석·소명 요구 사건 경로",
    };
  }

  return null;
}

// ─── CASE_04 보완 요구 Resolution Path ───

export const CASE04_DEADLINE_DATE_KEY = "case04_deadlineDate";

export const CASE04_ANSWER_KEYS = [
  ...CASE04_PHASE1_FIELD_ORDER,
  CASE04_DEADLINE_DATE_KEY,
  "case04_supplementReason",
  "case04_initialSubmission",
  "case04_submissionRelation",
  "case04_addDocDetail",
  "case04_modifyDetail",
  "case04_evidenceDetail",
  "case04_unclearFocus",
  "case04_authorityFollowUp",
  "case04_repeatSupplement",
  "case04_blockage",
  "case04_evidence",
  "case04_finalGoal",
] as const;

export type SupplementSignalCode =
  | "SUPPLEMENT_TARGET_UNCLEAR"
  | "SUPPLEMENT_REASON_UNCLEAR"
  | "SUPPLEMENT_CONTENT_MISMATCH"
  | "SUPPLEMENT_FORMAT_UNCLEAR"
  | "SUPPLEMENT_DEADLINE_UNCLEAR"
  | "SUPPLEMENT_RESPONSE_UNCLEAR"
  | "SUPPLEMENT_UNVERIFIED";

const SUPPLEMENT_SIGNAL_LABELS: Record<SupplementSignalCode, string> = {
  SUPPLEMENT_TARGET_UNCLEAR: "보완 대상 확인이 필요합니다",
  SUPPLEMENT_REASON_UNCLEAR: "보완 사유 확인이 필요합니다",
  SUPPLEMENT_CONTENT_MISMATCH: "보완 요구와 기존 제출 내용의 관계 확인이 필요합니다",
  SUPPLEMENT_FORMAT_UNCLEAR: "보완 제출 형식 확인이 필요합니다",
  SUPPLEMENT_DEADLINE_UNCLEAR: "보완 제출 기한 확인이 필요합니다",
  SUPPLEMENT_RESPONSE_UNCLEAR: "보완 제출 후 기관 반응 확인이 필요합니다",
  SUPPLEMENT_UNVERIFIED: "보완 처리 여부 확인이 필요합니다",
};

const CASE04_SUPPLEMENT_TARGET_OPTIONS = CASE04_SUPPLEMENT_TARGET_OPTIONS_V3;
const CASE04_CONFIRM_GOAL_OPTIONS = CASE04_CONFIRM_GOAL_OPTIONS_V3;
const CASE04_SUPPLEMENT_REASON_OPTIONS = CASE04_SUPPLEMENT_REASON_OPTIONS_V3;
const CASE04_INITIAL_SUBMISSION_OPTIONS = CASE04_INITIAL_SUBMISSION_OPTIONS_V3;
const CASE04_SUBMISSION_RELATION_OPTIONS = CASE04_SUBMISSION_RELATION_OPTIONS_V3;
const CASE04_ADD_DOC_DETAIL_OPTIONS = CASE04_ADD_DOC_DETAIL_OPTIONS_V3;
const CASE04_MODIFY_DETAIL_OPTIONS = CASE04_MODIFY_DETAIL_OPTIONS_V3;
const CASE04_EVIDENCE_DETAIL_OPTIONS = CASE04_EVIDENCE_DETAIL_OPTIONS_V3;
const CASE04_UNCLEAR_FOCUS_OPTIONS = CASE04_UNCLEAR_FOCUS_OPTIONS_V3;
const CASE04_CUSTOMER_RESPONSE_OPTIONS = CASE04_CUSTOMER_RESPONSE_OPTIONS_V3;
const CASE04_AUTHORITY_FOLLOWUP_OPTIONS = CASE04_AUTHORITY_FOLLOWUP_OPTIONS_V3;
const CASE04_REPEAT_SUPPLEMENT_OPTIONS = CASE04_REPEAT_SUPPLEMENT_OPTIONS_V3;
const CASE04_DEADLINE_OPTIONS = CASE04_DEADLINE_OPTIONS_V3;
const CASE04_BLOCKAGE_OPTIONS = CASE04_BLOCKAGE_OPTIONS_V3;
const CASE04_EVIDENCE_OPTIONS = CASE04_EVIDENCE_OPTIONS_V3;
const CASE04_FINAL_GOAL_OPTIONS = CASE04_FINAL_GOAL_OPTIONS_V3;

export const CASE04_OPTION_LABELS: Record<string, string> = {
  ...Object.fromEntries(CASE04_SUPPLEMENT_TARGET_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE04_CONFIRM_GOAL_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE04_SUPPLEMENT_REASON_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE04_INITIAL_SUBMISSION_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE04_SUBMISSION_RELATION_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE04_ADD_DOC_DETAIL_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE04_MODIFY_DETAIL_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE04_EVIDENCE_DETAIL_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE04_UNCLEAR_FOCUS_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE04_CUSTOMER_RESPONSE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE04_AUTHORITY_FOLLOWUP_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE04_REPEAT_SUPPLEMENT_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE04_DEADLINE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE04_BLOCKAGE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE04_EVIDENCE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE04_FINAL_GOAL_OPTIONS.map((o) => [o.value, o.label])),
  ...CASE04_LEGACY_UNCLEAR_FOCUS_LABELS,
  ...CASE04_LEGACY_AUTHORITY_FOLLOWUP_LABELS,
  ...CASE04_LEGACY_EVIDENCE_LABELS,
};

const CASE04_FIELD_OPTIONS: Record<string, { value: string; label: string }[]> = {
  case04_supplementTarget: CASE04_SUPPLEMENT_TARGET_OPTIONS,
  case04_confirmGoal: CASE04_CONFIRM_GOAL_OPTIONS,
  case04_customerResponse: CASE04_CUSTOMER_RESPONSE_OPTIONS,
  case04_deadline: CASE04_DEADLINE_OPTIONS,
};

const CASE04_FIELD_OPTION_MAP: Record<string, { value: string; label: string }[]> = {
  ...CASE04_V3_FIELD_OPTION_MAP,
};

export function getCase04FieldOptionLabel(fieldId: string, value: string): string {
  const legacy = getLegacyChoiceLabel(fieldId, value);
  if (legacy) return legacy;
  if (fieldId === "case04_unclearFocus") {
    const legacyLabel = CASE04_LEGACY_UNCLEAR_FOCUS_LABELS[value];
    if (legacyLabel) return legacyLabel;
  }
  if (fieldId === "case04_authorityFollowUp") {
    const legacyLabel = CASE04_LEGACY_AUTHORITY_FOLLOWUP_LABELS[value];
    if (legacyLabel) return legacyLabel;
    const canonical = case04EffectiveAuthorityFollowUp(value);
    if (canonical && canonical !== value) {
      return getCase04FieldOptionLabel(fieldId, canonical);
    }
  }
  if (fieldId === "case04_evidence") {
    const legacyLabel = CASE04_LEGACY_EVIDENCE_LABELS[value];
    if (legacyLabel) return legacyLabel;
    if (value === "unsure") {
      return getCase04FieldOptionLabel(fieldId, "none");
    }
  }
  const options = CASE04_FIELD_OPTION_MAP[fieldId];
  const matched = options?.find((option) => option.value === value);
  return matched?.label ?? value;
}

/** CASE_04 Direct Input — CASE_02 `getCase02FieldLabelFromAnswers` 동형 */
export function getCase04FieldLabelFromAnswers(
  fieldId: string,
  answers: ReviewAnswers,
): { label: string; factStatus: FactStatus } | null {
  const value = answers[fieldId as keyof ReviewAnswers]?.trim();
  if (!value) return null;
  if (isAdminVerifyMultiChoiceField(fieldId)) {
    const joined = formatAdminVerifyMultiChoiceAnswerLabel(fieldId, value, (slug) =>
      getCase04FieldOptionLabel(fieldId, slug),
    );
    if (!joined) return null;
    return { label: joined, factStatus: "confirmed" };
  }
  if (value === "other") {
    const note = answers[getAdminChoiceNoteKey(fieldId)]?.trim();
    const fallback = getCase04FieldOptionLabel(fieldId, "other");
    return {
      label: note || fallback,
      factStatus: note ? "confirmed" : "candidate",
    };
  }
  return {
    label: getCase04FieldOptionLabel(fieldId, value),
    factStatus: "confirmed",
  };
}

export function case04NeedsDeadlineDateDetail(answers: ReviewAnswers): boolean {
  if (answers.case04_deadline !== "specific_date") return false;
  return !answers[CASE04_DEADLINE_DATE_KEY]?.trim();
}

function case04SupplementDetailSuffix(answers: ReviewAnswers): string | null {
  const target = answers.case04_supplementTarget;
  if (target === "additional_docs" && answers.case04_addDocDetail) {
    const label =
      getCase04FieldLabelFromAnswers("case04_addDocDetail", answers)?.label ??
      getCase04FieldOptionLabel("case04_addDocDetail", answers.case04_addDocDetail);
    return `추가 서류: ${label}`;
  }
  if (target === "modify_existing" && answers.case04_modifyDetail) {
    const label =
      getCase04FieldLabelFromAnswers("case04_modifyDetail", answers)?.label ??
      getCase04FieldOptionLabel("case04_modifyDetail", answers.case04_modifyDetail);
    return `수정 항목: ${label}`;
  }
  if (target === "add_content_evidence" && answers.case04_evidenceDetail) {
    const label =
      getCase04FieldLabelFromAnswers("case04_evidenceDetail", answers)?.label ??
      getCase04FieldOptionLabel("case04_evidenceDetail", answers.case04_evidenceDetail);
    return `추가 증빙: ${label}`;
  }
  return null;
}

function getCase04AuthorityResponseValue(answers: ReviewAnswers): string | undefined {
  return case04EffectiveAuthorityFollowUp(answers.case04_authorityFollowUp);
}

function case04HasResponded(answers: ReviewAnswers): boolean {
  const response = answers.case04_customerResponse?.trim() ?? "";
  return Boolean(response && response !== "not_started");
}

/**
 * 개인화 퍼널 v1 — '무엇을 처음 냈는지'가 쟁점인 경우만.
 * 수정·설명 보완 요청은 서류 내용이 쟁점이라 묻지 않음.
 */
function case04NeedsInitialSubmissionPhase2(answers: ReviewAnswers): boolean {
  const target = answers.case04_supplementTarget;
  if (target === "additional_docs" || target === "repeat_demand" || target === "unclear") {
    return true;
  }
  return answers.case04_confirmGoal === "understand_insufficient";
}

/**
 * 개인화 퍼널 v1 — supplementTarget이 이미 관계를 말해 주면 묻지 않음.
 * 재요구·불명확이거나, '모두 냈다/확인 불가'인데 추가 요구를 받은 경우만.
 */
function case04NeedsSubmissionRelationPhase2(answers: ReviewAnswers): boolean {
  const target = answers.case04_supplementTarget;
  if (target === "repeat_demand" || target === "unclear") return true;
  const initial = answers.case04_initialSubmission;
  return initial === "complete" || initial === "hard_to_confirm";
}

/** 개인화 퍼널 v1 — 추가 서류 요청은 이유가 이미 '빠진 서류'이므로, 부족 이유를 확인하려는 고객만 */
function case04NeedsSupplementReasonPhase2(answers: ReviewAnswers): boolean {
  if (answers.case04_supplementTarget !== "additional_docs") return true;
  return answers.case04_confirmGoal === "understand_insufficient";
}

function case04IsTargetDetailPhase2Complete(answers: ReviewAnswers): boolean {
  const target = answers.case04_supplementTarget;
  if (target === "additional_docs") {
    return isAdminVerifyChoiceFieldComplete(
      "case04_addDocDetail",
      answers,
      CASE04_ADD_DOC_DETAIL_OPTIONS,
    );
  }
  if (target === "modify_existing") {
    return isAdminVerifyChoiceFieldComplete(
      "case04_modifyDetail",
      answers,
      CASE04_MODIFY_DETAIL_OPTIONS,
    );
  }
  if (target === "add_content_evidence") {
    return isAdminVerifyChoiceFieldComplete(
      "case04_evidenceDetail",
      answers,
      CASE04_EVIDENCE_DETAIL_OPTIONS,
    );
  }
  if (target === "unclear") {
    return isAdminVerifyChoiceFieldComplete(
      "case04_unclearFocus",
      answers,
      CASE04_UNCLEAR_FOCUS_OPTIONS,
    );
  }
  return true;
}

/** Phase2 — 제출·보완 상세 분기 완료 */
function case04IsPhase2CoreBranchComplete(answers: ReviewAnswers): boolean {
  if (
    case04NeedsInitialSubmissionPhase2(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case04_initialSubmission",
      answers,
      CASE04_INITIAL_SUBMISSION_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case04NeedsSubmissionRelationPhase2(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case04_submissionRelation",
      answers,
      CASE04_SUBMISSION_RELATION_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case04NeedsSupplementReasonPhase2(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case04_supplementReason",
      answers,
      CASE04_SUPPLEMENT_REASON_OPTIONS,
    )
  ) {
    return false;
  }
  if (!case04IsTargetDetailPhase2Complete(answers)) return false;
  if (
    case04NeedsAuthorityFollowUpPhase2(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case04_authorityFollowUp",
      answers,
      CASE04_AUTHORITY_FOLLOWUP_OPTIONS,
    )
  ) {
    return false;
  }
  return true;
}

function case04Phase2TailAxesUnlocked(answers: ReviewAnswers): boolean {
  return isCase04Phase1Complete(answers) && case04IsPhase2CoreBranchComplete(answers);
}

function case04NeedsAuthorityFollowUpPhase2(answers: ReviewAnswers): boolean {
  const response = answers.case04_customerResponse;
  return (
    response === "submitted" || response === "inquired" || response === "other_method"
  );
}

function case04NeedsRepeatSupplement(answers: ReviewAnswers): boolean {
  if (answers.case04_supplementTarget === "repeat_demand") return true;
  if (answers.case04_confirmGoal === "repeat_reason") return true;
  return getCase04AuthorityResponseValue(answers) === "more_supplement";
}

/** 개인화 퍼널 v1 — 앞선 답변으로 막힌 지점을 알 수 없는 고객만 (tail 일괄 개방 제거) */
function case04NeedsBlockage(answers: ReviewAnswers): boolean {
  if (answers.case04_confirmGoal === "unsure") return true;
  const target = answers.case04_supplementTarget;
  const reason = answers.case04_supplementReason;
  const rel = answers.case04_submissionRelation;
  return (
    target === "unclear" ||
    reason === "no_reason" ||
    reason === "unsure" ||
    rel === "mismatch_request" ||
    rel === "hard_to_judge" ||
    case04NeedsRepeatSupplement(answers)
  );
}

/** 개인화 퍼널 v1 — 보관 자료는 모든 고객의 핵심 사실(COMMON). 선택지만 앞선 답변으로 필터 */
function case04NeedsEvidence(_answers: ReviewAnswers): boolean {
  return true;
}

/** 개인화 퍼널 v1 — confirmGoal로 목표를 이미 안 고객에게는 다시 묻지 않음 */
function case04NeedsFinalGoal(answers: ReviewAnswers): boolean {
  return (
    answers.case04_supplementTarget === "unclear" || answers.case04_supplementReason === "unsure"
  );
}

/** STEP2-1 — Phase2 실질 축 (상세 3 중 경로 1 + tail blockage·evidence·finalGoal) */
export const CASE04_PHASE2_SUBSTANTIVE_AXIS_IDS = [
  "case04_initialSubmission",
  "case04_submissionRelation",
  "case04_supplementReason",
  "case04_addDocDetail",
  "case04_modifyDetail",
  "case04_evidenceDetail",
  "case04_authorityFollowUp",
  "case04_repeatSupplement",
  "case04_blockage",
  "case04_evidence",
  "case04_finalGoal",
] as const;

export function case04Phase2SubstantiveAxisCatalogCount(): number {
  return CASE04_PHASE2_SUBSTANTIVE_AXIS_IDS.length;
}

export function case04ListPhase2SubstantiveAxesOnPath(answers: ReviewAnswers): string[] {
  const axes: string[] = [];
  const maybe = (id: string, needs: boolean) => {
    if (needs) axes.push(id);
  };
  const target = answers.case04_supplementTarget;
  maybe("case04_initialSubmission", case04NeedsInitialSubmissionPhase2(answers));
  maybe("case04_submissionRelation", case04NeedsSubmissionRelationPhase2(answers));
  maybe("case04_supplementReason", case04NeedsSupplementReasonPhase2(answers));
  maybe("case04_addDocDetail", target === "additional_docs");
  maybe("case04_modifyDetail", target === "modify_existing");
  maybe("case04_evidenceDetail", target === "add_content_evidence");
  maybe("case04_authorityFollowUp", case04NeedsAuthorityFollowUpPhase2(answers));
  maybe("case04_repeatSupplement", case04NeedsRepeatSupplement(answers));
  maybe("case04_blockage", case04NeedsBlockage(answers));
  maybe("case04_evidence", case04NeedsEvidence(answers));
  maybe("case04_finalGoal", case04NeedsFinalGoal(answers));
  return axes.filter((id) =>
    (CASE04_PHASE2_SUBSTANTIVE_AXIS_IDS as readonly string[]).includes(id),
  );
}

function case04Phase2SubstantiveAxisAnswered(id: string, answers: ReviewAnswers): boolean {
  const target = answers.case04_supplementTarget;
  if (id === "case04_addDocDetail" && target !== "additional_docs") return false;
  if (id === "case04_modifyDetail" && target !== "modify_existing") return false;
  if (id === "case04_evidenceDetail" && target !== "add_content_evidence") return false;
  if (id === "case04_initialSubmission" && !case04NeedsInitialSubmissionPhase2(answers)) {
    return false;
  }
  if (id === "case04_supplementReason" && !case04NeedsSupplementReasonPhase2(answers)) {
    return false;
  }
  if (id === "case04_authorityFollowUp" && !case04NeedsAuthorityFollowUpPhase2(answers)) {
    return false;
  }
  if (id === "case04_repeatSupplement" && !case04NeedsRepeatSupplement(answers)) return false;
  if (id === "case04_blockage" && !case04NeedsBlockage(answers)) return false;
  if (id === "case04_evidence" && !case04NeedsEvidence(answers)) return false;
  if (id === "case04_finalGoal" && !case04NeedsFinalGoal(answers)) return false;
  const options = CASE04_FIELD_OPTION_MAP[id];
  return Boolean(options && isAdminVerifyChoiceFieldComplete(id, answers, options));
}

/** 실측·비율 감사 — 2차에서 실제 답이 채워진 실질 축 개수 */
export function case04CountAnsweredPhase2SubstantiveAxes(answers: ReviewAnswers): number {
  let count = 0;
  for (const id of CASE04_PHASE2_SUBSTANTIVE_AXIS_IDS) {
    if (case04Phase2SubstantiveAxisAnswered(id, answers)) count += 1;
  }
  return count;
}

function deriveCase04Rounds(answers: ReviewAnswers): {
  supplementRound: number;
  supplementResponseRound: number;
} {
  let supplementRound = 0;
  let supplementResponseRound = 0;
  const customerResponse = answers.case04_customerResponse;
  if (
    customerResponse === "preparing" ||
    customerResponse === "submitted"
  ) {
    supplementRound = 1;
    supplementResponseRound = customerResponse === "submitted" ? 1 : 0;
  }
  const authorityValue = getCase04AuthorityResponseValue(answers);
  if (authorityValue === "more_supplement") {
    supplementRound = Math.max(supplementRound, 2);
    supplementResponseRound = Math.max(supplementResponseRound, 2);
  }
  const repeat = answers.case04_repeatSupplement;
  if (repeat && repeat !== "not_applicable" && repeat !== "unsure") {
    supplementRound = Math.max(supplementRound, 2);
    supplementResponseRound = Math.max(supplementResponseRound, 2);
  }
  return { supplementRound, supplementResponseRound };
}

export function shouldActivateCase04Path(answers: ReviewAnswers): boolean {
  if (isAdminCaseEntryQ1Complete(answers)) {
    return getQ1ResolvedCase(answers) === "CASE_04";
  }
  if (answers.case05_dispositionType || answers._case05Active === "1") return false;
  if (answers._case04Active === "1") return true;
  if (answers.case04_supplementTarget) return true;
  if (answers.case04_confirmGoal) return true;
  if (shouldActivateCase02Path(answers)) return false;
  if (answers.case03_authorityDemand || answers._case03Active === "1") return false;

  const text = customerTextFromAnswers(answers);
  if (isSupplementPrimaryInput(text)) return true;

  if (answers.profileReceivedReason === "supplement") return true;
  if (answers.profileProblemType === "rejected" && /보완|추가.?제출|재제출/.test(text)) {
    return true;
  }

  const hits = keywordCaseSignals(text);
  if (hits[0] === "CASE_04") return true;

  if (answers.case01_authorityDemand === "supplement") return true;

  return false;
}

export function isCase04Phase1Complete(answers: ReviewAnswers): boolean {
  for (const fieldId of CASE04_PHASE1_FIELD_ORDER) {
    if (fieldId === "case04_deadline" && !case04NeedsDeadlinePhase1(answers)) continue;
    const options = CASE04_FIELD_OPTIONS[fieldId];
    if (!options || !isAdminVerifyChoiceFieldComplete(fieldId, answers, options)) {
      return false;
    }
  }
  if (case04NeedsDeadlineDateDetail(answers)) return false;
  return true;
}

/** 개인화 퍼널 v1 — 선택지 필터. 이미 저장된 값은 항상 남김(레거시 호환) */
function case04FilterOptions(
  fieldId: string,
  answers: ReviewAnswers,
  options: { value: string; label: string }[],
  keep: (value: string) => boolean,
): { value: string; label: string }[] {
  return options.filter(
    (o) => o.value === "other" || adminVerifyFieldHasSlug(answers, fieldId, o.value) || keep(o.value),
  );
}

function case04HasSubmitted(answers: ReviewAnswers): boolean {
  return answers.case04_customerResponse === "submitted";
}

function case04ConfirmGoalOptionsFor(answers: ReviewAnswers) {
  const target = answers.case04_supplementTarget;
  return case04FilterOptions("case04_confirmGoal", answers, CASE04_CONFIRM_GOAL_OPTIONS, (v) => {
    if (v === "repeat_reason") return target === "repeat_demand";
    if (v === "prepare_materials") return !case04HasSubmitted(answers);
    return true;
  });
}

function case04SubmissionRelationOptionsFor(answers: ReviewAnswers) {
  const target = answers.case04_supplementTarget;
  return case04FilterOptions(
    "case04_submissionRelation",
    answers,
    CASE04_SUBMISSION_RELATION_OPTIONS,
    (v) => !(target === "additional_docs" && v === "add_missing"),
  );
}

function case04SupplementReasonOptionsFor(answers: ReviewAnswers) {
  const target = answers.case04_supplementTarget;
  return case04FilterOptions("case04_supplementReason", answers, CASE04_SUPPLEMENT_REASON_OPTIONS, (v) => {
    if (target === "modify_existing") return v !== "missing_info" && v !== "insufficient_proof";
    if (target === "add_content_evidence") return v !== "missing_info" && v !== "incorrect_content";
    return true;
  });
}

function case04BlockageOptionsFor(answers: ReviewAnswers) {
  const deadline = answers.case04_deadline;
  return case04FilterOptions("case04_blockage", answers, CASE04_BLOCKAGE_OPTIONS, (v) => {
    if (v === "after_submit") return case04HasSubmitted(answers);
    if (v === "deadline") {
      return deadline === "uncertain" || deadline === "not_stated" || deadline === "unsure";
    }
    return true;
  });
}

function case04EvidenceOptionsFor(answers: ReviewAnswers) {
  return case04FilterOptions("case04_evidence", answers, CASE04_EVIDENCE_OPTIONS, (v) => {
    if (v === "supplement_submission") return case04HasSubmitted(answers);
    if (v === "original_submission") return answers.case04_initialSubmission !== "hard_to_confirm";
    return true;
  });
}

function case04FinalGoalOptionsFor(answers: ReviewAnswers) {
  return case04FilterOptions("case04_finalGoal", answers, CASE04_FINAL_GOAL_OPTIONS, (v) =>
    v === "next_step" ? case04HasSubmitted(answers) : true,
  );
}

/** 질문을 띄우고, 완료 여부는 전체 선택지 기준으로 판정(필터된 선택지는 표시용) */
function case04Ask(
  questions: ProfileQuestion[],
  answers: ReviewAnswers,
  id: string,
  shownOptions: { value: string; label: string }[],
  fullOptions: { value: string; label: string }[],
): boolean {
  pushUnique(questions, {
    id,
    kind: "choice",
    label: (CASE04_V3_QUESTION_LABELS as Record<string, string>)[id],
    options: shownOptions,
  });
  return isAdminVerifyChoiceFieldComplete(id, answers, fullOptions);
}

function appendCase04Phase1Questions(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  if (
    !case04Ask(questions, answers, "case04_supplementTarget", CASE04_SUPPLEMENT_TARGET_OPTIONS, CASE04_SUPPLEMENT_TARGET_OPTIONS)
  ) {
    return;
  }
  if (
    !case04Ask(questions, answers, "case04_customerResponse", CASE04_CUSTOMER_RESPONSE_OPTIONS, CASE04_CUSTOMER_RESPONSE_OPTIONS)
  ) {
    return;
  }
  if (
    !case04Ask(questions, answers, "case04_confirmGoal", case04ConfirmGoalOptionsFor(answers), CASE04_CONFIRM_GOAL_OPTIONS)
  ) {
    return;
  }
  if (!case04NeedsDeadlinePhase1(answers)) return;
  if (!case04Ask(questions, answers, "case04_deadline", CASE04_DEADLINE_OPTIONS, CASE04_DEADLINE_OPTIONS)) {
    return;
  }
  if (case04NeedsDeadlineDateDetail(answers)) {
    pushUnique(questions, {
      id: CASE04_DEADLINE_DATE_KEY,
      kind: "text",
      label: CASE04_V3_QUESTION_LABELS.case04_deadlineDate,
      placeholder: "기억나는 날짜·기한을 적어 주세요.",
    });
  }
}

/**
 * 개인화 퍼널 v1 — supplementTarget별 연쇄:
 * 상세(무엇을?) → 처음 제출 → 관계 → 이유 → 교통국 답변 → 재요구 → 막힌 점 → 보관 자료 → 최종 목표.
 * 각 질문은 앞선 답변으로 알 수 없을 때만 열린다.
 */
function appendCase04Phase2Questions(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  const target = answers.case04_supplementTarget;
  if (target === "additional_docs") {
    if (!case04Ask(questions, answers, "case04_addDocDetail", CASE04_ADD_DOC_DETAIL_OPTIONS, CASE04_ADD_DOC_DETAIL_OPTIONS)) return;
  } else if (target === "modify_existing") {
    if (!case04Ask(questions, answers, "case04_modifyDetail", CASE04_MODIFY_DETAIL_OPTIONS, CASE04_MODIFY_DETAIL_OPTIONS)) return;
  } else if (target === "add_content_evidence") {
    if (!case04Ask(questions, answers, "case04_evidenceDetail", CASE04_EVIDENCE_DETAIL_OPTIONS, CASE04_EVIDENCE_DETAIL_OPTIONS)) return;
  } else if (target === "repeat_demand") {
    if (!case04Ask(questions, answers, "case04_repeatSupplement", CASE04_REPEAT_SUPPLEMENT_OPTIONS, CASE04_REPEAT_SUPPLEMENT_OPTIONS)) return;
  } else if (target === "unclear") {
    if (!case04Ask(questions, answers, "case04_unclearFocus", CASE04_UNCLEAR_FOCUS_OPTIONS, CASE04_UNCLEAR_FOCUS_OPTIONS)) return;
  }

  if (case04NeedsInitialSubmissionPhase2(answers)) {
    if (!case04Ask(questions, answers, "case04_initialSubmission", CASE04_INITIAL_SUBMISSION_OPTIONS, CASE04_INITIAL_SUBMISSION_OPTIONS)) return;
  }
  if (case04NeedsSubmissionRelationPhase2(answers)) {
    if (!case04Ask(questions, answers, "case04_submissionRelation", case04SubmissionRelationOptionsFor(answers), CASE04_SUBMISSION_RELATION_OPTIONS)) return;
  }
  if (case04NeedsSupplementReasonPhase2(answers)) {
    if (!case04Ask(questions, answers, "case04_supplementReason", case04SupplementReasonOptionsFor(answers), CASE04_SUPPLEMENT_REASON_OPTIONS)) return;
  }
  if (case04NeedsAuthorityFollowUpPhase2(answers)) {
    if (!case04Ask(questions, answers, "case04_authorityFollowUp", CASE04_AUTHORITY_FOLLOWUP_OPTIONS, CASE04_AUTHORITY_FOLLOWUP_OPTIONS)) return;
  }
  if (case04NeedsRepeatSupplement(answers)) {
    if (!case04Ask(questions, answers, "case04_repeatSupplement", CASE04_REPEAT_SUPPLEMENT_OPTIONS, CASE04_REPEAT_SUPPLEMENT_OPTIONS)) return;
  }
  if (case04NeedsBlockage(answers)) {
    if (!case04Ask(questions, answers, "case04_blockage", case04BlockageOptionsFor(answers), CASE04_BLOCKAGE_OPTIONS)) return;
  }
  if (case04NeedsEvidence(answers)) {
    if (!case04Ask(questions, answers, "case04_evidence", case04EvidenceOptionsFor(answers), CASE04_EVIDENCE_OPTIONS)) return;
  }
  if (case04NeedsFinalGoal(answers)) {
    case04Ask(questions, answers, "case04_finalGoal", case04FinalGoalOptionsFor(answers), CASE04_FINAL_GOAL_OPTIONS);
  }
}

function appendCase04PathQuestions(
  questions: ProfileQuestion[],
  answers: ReviewAnswers,
  phase: AdminVerifyProfilePhase = 2,
): void {
  if (phase === 1) {
    appendCase04Phase1Questions(questions, answers);
    return;
  }
  if (!isCase04Phase1Complete(answers)) {
    appendCase04Phase1Questions(questions, answers);
    return;
  }
  appendCase04Phase2Questions(questions, answers);
}

function case04PathFieldsComplete(answers: ReviewAnswers): boolean {
  if (!isCase04Phase1Complete(answers)) return false;

  if (
    case04NeedsInitialSubmissionPhase2(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case04_initialSubmission",
      answers,
      CASE04_INITIAL_SUBMISSION_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case04NeedsSubmissionRelationPhase2(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case04_submissionRelation",
      answers,
      CASE04_SUBMISSION_RELATION_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case04NeedsSupplementReasonPhase2(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case04_supplementReason",
      answers,
      CASE04_SUPPLEMENT_REASON_OPTIONS,
    )
  ) {
    return false;
  }

  const target = answers.case04_supplementTarget;
  if (
    target === "additional_docs" &&
    !isAdminVerifyChoiceFieldComplete(
      "case04_addDocDetail",
      answers,
      CASE04_ADD_DOC_DETAIL_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    target === "modify_existing" &&
    !isAdminVerifyChoiceFieldComplete(
      "case04_modifyDetail",
      answers,
      CASE04_MODIFY_DETAIL_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    target === "add_content_evidence" &&
    !isAdminVerifyChoiceFieldComplete(
      "case04_evidenceDetail",
      answers,
      CASE04_EVIDENCE_DETAIL_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    target === "unclear" &&
    !isAdminVerifyChoiceFieldComplete(
      "case04_unclearFocus",
      answers,
      CASE04_UNCLEAR_FOCUS_OPTIONS,
    )
  ) {
    return false;
  }

  if (
    case04NeedsAuthorityFollowUpPhase2(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case04_authorityFollowUp",
      answers,
      CASE04_AUTHORITY_FOLLOWUP_OPTIONS,
    )
  ) {
    return false;
  }

  if (
    case04NeedsRepeatSupplement(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case04_repeatSupplement",
      answers,
      CASE04_REPEAT_SUPPLEMENT_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case04NeedsBlockage(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case04_blockage",
      answers,
      CASE04_BLOCKAGE_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case04NeedsEvidence(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case04_evidence",
      answers,
      CASE04_EVIDENCE_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case04NeedsFinalGoal(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case04_finalGoal",
      answers,
      CASE04_FINAL_GOAL_OPTIONS,
    )
  ) {
    return false;
  }
  return true;
}

export function isCase04PathComplete(answers: ReviewAnswers): boolean {
  if (!shouldActivateCase04Path(answers)) return false;
  return case04PathFieldsComplete(answers);
}

function deriveSupplementSignals(answers: ReviewAnswers): SupplementSignalCode[] {
  if (!shouldActivateCase04Path(answers) && !answers.case04_supplementTarget) return [];
  const signals: SupplementSignalCode[] = [];

  const case04UnclearFocus = effectiveAdminVerifyChoiceSlug(answers, "case04_unclearFocus");
  if (
    answers.case04_supplementTarget === "unclear" ||
    answers.case04_supplementTarget === "repeat_demand" ||
    case04UnclearFocus === "what_submit_list" ||
    case04UnclearFocus === "what_submit_apply"
  ) {
    signals.push("SUPPLEMENT_TARGET_UNCLEAR");
  }
  if (
    answers.case04_supplementReason === "no_reason" ||
    answers.case04_supplementReason === "unsure" ||
    case04UnclearFocus === "why_submit_reason" ||
    case04UnclearFocus === "why_submit_apply"
  ) {
    signals.push("SUPPLEMENT_REASON_UNCLEAR");
  }
  if (
    answers.case04_submissionRelation === "mismatch_request" ||
    answers.case04_submissionRelation === "hard_to_judge"
  ) {
    signals.push("SUPPLEMENT_CONTENT_MISMATCH");
  }
  if (
    case04UnclearFocus === "format_how" ||
    case04UnclearFocus === "format_where" ||
    answers.case04_blockage === "format"
  ) {
    signals.push("SUPPLEMENT_FORMAT_UNCLEAR");
  }
  if (
    answers.case04_deadline === "uncertain" ||
    answers.case04_deadline === "unsure" ||
    answers.case04_deadline === "not_stated"
  ) {
    signals.push("SUPPLEMENT_DEADLINE_UNCLEAR");
  }
  const authorityFollowUp = getCase04AuthorityResponseValue(answers);
  if (authorityFollowUp === "unsure" || authorityFollowUp === "no_response") {
    signals.push("SUPPLEMENT_RESPONSE_UNCLEAR");
  }
  if (
    answers.case04_customerResponse === "submitted" &&
    (authorityFollowUp === "no_response" || authorityFollowUp === "unsure")
  ) {
    signals.push("SUPPLEMENT_UNVERIFIED");
  }

  return [...new Set(signals)];
}

function collectCase04Unknowns(answers: ReviewAnswers): string[] {
  const unknowns: string[] = [];
  if (!answers.case04_supplementTarget) return unknowns;

  for (const code of deriveSupplementSignals(answers)) {
    const label = SUPPLEMENT_SIGNAL_LABELS[code];
    if (!unknowns.includes(label)) unknowns.push(label);
  }
  if (answers.case04_initialSubmission === "unsure") {
    unknowns.push("처음 제출한 내용");
  }
  return unknowns;
}

function collectCase04RiskSignals(answers: ReviewAnswers): string[] {
  const risks: string[] = [];
  if (!answers.case04_supplementTarget) return risks;

  if (
    answers.case04_submissionRelation === "mismatch_request" ||
    answers.case04_submissionRelation === "hard_to_judge"
  ) {
    risks.push("보완 요구와 기존 제출 내용의 관계 확인이 필요합니다");
  }
  const rounds = deriveCase04Rounds(answers);
  if (rounds.supplementRound >= 2) {
    risks.push("추가 보완 요구가 있음 — 동일 사건 내 재보완 확인 필요");
  }
  const authorityFollowUp = getCase04AuthorityResponseValue(answers);
  if (authorityFollowUp === "no_response") {
    risks.push("보완 제출 후 기관 반응 미확인 — 확인 필요");
  }
  return risks;
}

function classifyFromCase04Answers(answers: ReviewAnswers): {
  id: MasterCaseId;
  status: FactStatus;
  confidence: number;
  reason: string;
} | null {
  // DQ-E: CASE_04 does not cross-classify to CASE_02/03/05 (except CASE_06 unclear whole).
  // Cross-case uses CASE_06 bridge / other CASE classifiers — not actualCore revival.
  if (!shouldActivateCase04Path(answers) && !answers.case04_supplementTarget) return null;

  if (
    answers.case04_supplementTarget === "unclear" &&
    effectiveAdminVerifyChoiceSlug(answers, "case04_unclearFocus") === "what_submit_list"
  ) {
    return {
      id: "CASE_06",
      status: "inferred",
      confidence: 0.6,
      reason: "보완 요구 내용이 불명확하다고 응답",
    };
  }

  if (shouldActivateCase04Path(answers) || answers.case04_supplementTarget) {
    return {
      id: "CASE_04",
      status: answers.case04_supplementReason ? "inferred" : "candidate",
      confidence: answers.case04_supplementReason ? 0.75 : 0.5,
      reason: "보완 요구 사건 경로",
    };
  }

  return null;
}

// ─── CASE_05 처분·조치 통지 Resolution Path ───

export const CASE05_ANSWER_KEYS = [
  ...CASE05_PHASE1_FIELD_ORDER,
  "case05_deadline",
  CASE05_DEADLINE_DATE_KEY,
  "case05_dispositionReason",
  "case05_factRelationship",
  "case05_authorityFollowUp",
  "case05_dispositionDetail",
  "case05_factDetail",
  "case05_explanationDetail",
  "case05_submittedDocsDetail",
  "case05_appealDetail",
  "case05_dispositionOutcome",
  "case05_plannedNextStep",
  "case05_repeatFollowUp",
  "case05_blockage",
  "case05_evidence",
  "case05_finalGoal",
] as const;

export type DispositionSignalCode =
  | "DISPOSITION_TYPE_UNCLEAR"
  | "DISPOSITION_REASON_UNCLEAR"
  | "FACT_MISMATCH_PARTIAL"
  | "FACT_MISMATCH"
  | "FACT_UNVERIFIED"
  | "DISPOSITION_DEADLINE_UNCLEAR"
  | "DISPOSITION_DEADLINE_PERIOD_ONLY"
  | "DISPOSITION_DEADLINE_NOT_MENTIONED"
  | "DISPOSITION_RESPONSE_UNCLEAR"
  | "DISPOSITION_EVIDENCE_UNCLEAR";

const DISPOSITION_SIGNAL_LABELS: Record<DispositionSignalCode, string> = {
  DISPOSITION_TYPE_UNCLEAR: "처분·조치 내용 확인이 필요합니다",
  DISPOSITION_REASON_UNCLEAR: "처분 사유 확인이 필요합니다",
  FACT_MISMATCH_PARTIAL: "처분 내용과 실제 상황이 일부 다를 수 있음 — 확인 필요",
  FACT_MISMATCH: "처분 내용과 실제 상황이 다를 수 있음 — 확인 필요",
  FACT_UNVERIFIED: "처분 후 기관 반응이 불명확합니다",
  DISPOSITION_DEADLINE_UNCLEAR: "처분 관련 기한 확인이 필요합니다",
  DISPOSITION_DEADLINE_PERIOD_ONLY: "처분 관련 기한은 있으나 날짜가 불명확합니다",
  DISPOSITION_DEADLINE_NOT_MENTIONED: "처분 통지에 기한이 명시되지 않았을 수 있습니다",
  DISPOSITION_RESPONSE_UNCLEAR: "처분 후 기관 반응 확인이 필요합니다",
  DISPOSITION_EVIDENCE_UNCLEAR: "처분 관련 증빙 확인이 필요합니다",
};

/** STEP2-1 R06 — Phase2 실질 축 (장식 제외, detail 5 실질화 포함) */
export const CASE05_PHASE2_SUBSTANTIVE_AXIS_IDS = [
  "case05_factRelationship",
  "case05_dispositionReason",
  "case05_authorityFollowUp",
  "case05_dispositionDetail",
  "case05_factDetail",
  "case05_explanationDetail",
  "case05_submittedDocsDetail",
  "case05_appealDetail",
  "case05_blockage",
  "case05_evidence",
  "case05_finalGoal",
] as const;

export function case05Phase2SubstantiveAxisCatalogCount(): number {
  return CASE05_PHASE2_SUBSTANTIVE_AXIS_IDS.length;
}

/** CASE_05 Phase1 dispositionType — DQ-C05-06 canonical slugs */
export const CASE05_DISPOSITION_TYPE_RIGHTS_ENDED = "rights_ended";
export const CASE05_DISPOSITION_TYPE_UNCLEAR = "disposition_unclear";

const CASE05_DISPOSITION_TYPE_LEGACY_TO_CANONICAL: Record<string, string> = {
  license_revoked: CASE05_DISPOSITION_TYPE_RIGHTS_ENDED,
  registration_cancelled: CASE05_DISPOSITION_TYPE_RIGHTS_ENDED,
  reason_hard_to_understand: CASE05_DISPOSITION_TYPE_UNCLEAR,
  unclear: CASE05_DISPOSITION_TYPE_UNCLEAR,
};

export function case05EffectiveDispositionType(value: string | undefined): string | undefined {
  if (!value) return value;
  return CASE05_DISPOSITION_TYPE_LEGACY_TO_CANONICAL[value] ?? value;
}

const CASE05_CONFIRM_GOAL_LEGACY_TO_CANONICAL: Record<string, string> = {
  understand_effective: "understand_impact",
};

export function case05EffectiveConfirmGoal(value: string | undefined): string | undefined {
  if (!value) return value;
  return CASE05_CONFIRM_GOAL_LEGACY_TO_CANONICAL[value] ?? value;
}

const CASE05_DEADLINE_LEGACY_TO_CANONICAL: Record<string, string> = {
  past_possible: "uncertain",
  known_date: "specific_date",
};

export function case05EffectiveDeadline(value: string | undefined): string | undefined {
  if (!value) return value;
  return CASE05_DEADLINE_LEGACY_TO_CANONICAL[value] ?? value;
}

export function case05NeedsDeadlineDateDetail(answers: ReviewAnswers): boolean {
  if (case05EffectiveDeadline(answers.case05_deadline) !== "specific_date") return false;
  return !answers[CASE05_DEADLINE_DATE_KEY]?.trim();
}

const CASE05_DISPOSITION_TYPE_OPTIONS = CASE05_DISPOSITION_TYPE_OPTIONS_V2;
const CASE05_CONFIRM_GOAL_OPTIONS = CASE05_CONFIRM_GOAL_OPTIONS_V2;
const CASE05_DISPOSITION_REASON_OPTIONS = CASE05_DISPOSITION_REASON_OPTIONS_V2;
const CASE05_FACT_RELATIONSHIP_OPTIONS = CASE05_FACT_RELATIONSHIP_OPTIONS_V2;
const CASE05_CUSTOMER_RESPONSE_OPTIONS = CASE05_CUSTOMER_RESPONSE_OPTIONS_V2;
const CASE05_AUTHORITY_FOLLOWUP_OPTIONS = CASE05_AUTHORITY_FOLLOWUP_OPTIONS_V2;

const CASE05_DISPOSITION_OUTCOME_OPTIONS = [
  { value: "maintained", label: "처분이 그대로 유지되었다는 안내를 받았습니다." },
  { value: "modified", label: "처분 내용이 변경되었다는 안내를 받았습니다." },
  { value: "revoked", label: "처분이 철회·취소되었다는 안내를 받았습니다." },
  { value: "additional_action", label: "추가 조치가 내려졌다는 안내를 받았습니다." },
  { value: "more_docs_required", label: "추가 자료를 요구받았습니다." },
  { value: "no_result", label: "아직 결과를 받지 못했습니다." },
  { value: "unsure", label: "기관의 후속 결과를 정확히 파악하지 못했습니다." },
];

const CASE05_REPEAT_FOLLOWUP_OPTIONS = [
  { value: "more_explanation", label: "추가 소명·의견을 다시 요구받았습니다." },
  { value: "more_docs", label: "추가 서류를 다시 요구받았습니다." },
  { value: "maintained_again", label: "처분이 유지된다는 안내를 다시 받았습니다." },
  { value: "under_review_again", label: "재검토가 계속된다는 안내를 다시 받았습니다." },
  {
    value: "not_applicable",
    label: "아직 추가 대응이 반복되었다고 느끼지 않습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE05_DEADLINE_OPTIONS = CASE05_DEADLINE_OPTIONS_V2;
const CASE05_DISPOSITION_DETAIL_OPTIONS = CASE05_DISPOSITION_DETAIL_OPTIONS_V2;
const CASE05_FACT_DETAIL_OPTIONS = CASE05_FACT_DETAIL_OPTIONS_V2;
const CASE05_EXPLANATION_DETAIL_OPTIONS = CASE05_EXPLANATION_DETAIL_OPTIONS_V2;
const CASE05_SUBMITTED_DOCS_DETAIL_OPTIONS = CASE05_SUBMITTED_DOCS_DETAIL_OPTIONS_V2;
const CASE05_APPEAL_DETAIL_OPTIONS = CASE05_APPEAL_DETAIL_OPTIONS_V2;
const CASE05_BLOCKAGE_OPTIONS = CASE05_BLOCKAGE_OPTIONS_V2;
const CASE05_EVIDENCE_OPTIONS = CASE05_EVIDENCE_OPTIONS_V2;

const CASE05_CONFIRM_GOAL_TO_FINAL_GOAL_DUPE: Record<string, string> = {
  understand_reason: "why_disposition",
  understand_impact: "what_disposition",
  appeal_possibility: "next_action",
  what_to_do: "what_to_do",
};

const CASE05_PLANNED_NEXT_STEP_OPTIONS = [
  {
    value: "inquire_authority",
    label: "기관에 문의하거나 상황을 먼저 확인할 계획입니다.",
  },
  {
    value: "prepare_explanation",
    label: "소명·의견이나 보완 서류를 준비하려고 합니다.",
  },
  {
    value: "appeal_or_review",
    label: "이의제기·재검토를 검토하거나 진행할 계획입니다.",
  },
  {
    value: "wait_for_deadline",
    label: "대응 기한을 확인한 뒤 그때 조치할 계획입니다.",
  },
  {
    value: "no_concrete_plan",
    label: "아직 구체적인 조치 계획은 없습니다.",
  },
  {
    value: "unsure",
    label: "무엇부터 해야 할지 아직 정하지 못했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE05_FINAL_GOAL_OPTIONS = CASE05_FINAL_GOAL_OPTIONS_V2;

export const CASE05_OPTION_LABELS: Record<string, string> = {
  other_disposition: "위에 없는 다른 처분·조치가 안내되어 있습니다",
  known_date: "처분과 관련해 대응해야 하는 날짜를 확인했습니다.",
  license_revoked:
    "기존에 가지고 있던 허가·자격·권리가 중단되거나 취소되었다는 조치를 받은 상황입니다.",
  registration_cancelled: "등록·자격·면허 등이 말소되거나 실효되었다는 조치를 받은 상황입니다.",
  reason_hard_to_understand:
    "처분 내용은 알지만 왜 이런 조치가 내려졌는지 이해하기 어려운 상황입니다.",
  unclear: "어떤 처분·조치인지 자체를 정확히 이해하기 어려운 상황입니다.",
  understand_effective: "언제부터 이 처분의 효력이 발생하는지 확인하고 싶습니다.",
  maintain_reason: "이미 대응했는데도 처분이 유지되는 이유를 확인하고 싶습니다.",
  other_method: "위에 없는 다른 방법으로 대응했습니다.",
  past_possible: "이미 기한이 지났을 가능성이 있어 보입니다.",
  evidence_other: "기타 증빙",
  doc_other: "위에 없는 다른 서류",
  ...Object.fromEntries(CASE05_DISPOSITION_TYPE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE05_CONFIRM_GOAL_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE05_DISPOSITION_REASON_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE05_FACT_RELATIONSHIP_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE05_CUSTOMER_RESPONSE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE05_AUTHORITY_FOLLOWUP_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE05_DISPOSITION_OUTCOME_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE05_REPEAT_FOLLOWUP_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE05_DEADLINE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE05_BLOCKAGE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE05_EVIDENCE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE05_FINAL_GOAL_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE05_PLANNED_NEXT_STEP_OPTIONS.map((o) => [o.value, o.label])),
  ...CASE05_LEGACY_AUTHORITY_FOLLOWUP_LABELS,
  ...CASE05_LEGACY_BLOCKAGE_LABELS,
  ...CASE05_LEGACY_EVIDENCE_LABELS,
  ...CASE05_LEGACY_FINAL_GOAL_LABELS,
  ...CASE05_LEGACY_APPEAL_DETAIL_LABELS,
};

const CASE05_FIELD_OPTIONS: Record<string, { value: string; label: string }[]> = {
  case05_dispositionType: CASE05_DISPOSITION_TYPE_OPTIONS,
  case05_confirmGoal: CASE05_CONFIRM_GOAL_OPTIONS,
  case05_customerResponse: CASE05_CUSTOMER_RESPONSE_OPTIONS,
  case05_deadline: CASE05_DEADLINE_OPTIONS,
};

const CASE05_FIELD_OPTION_MAP: Record<string, { value: string; label: string }[]> = {
  ...CASE05_V2_FIELD_OPTION_MAP,
};

export const ADMIN_VERIFY_MERGED_FIELD_OPTION_MAP: Record<string, { value: string; label: string }[]> = {
  case01_violationContent: CASE01_VIOLATION_CONTENT_OPTIONS,
  case01_factRelationship: CASE01_FACT_RELATIONSHIP_OPTIONS,
  case01_factCompareGap: CASE01_FACT_COMPARE_GAP_OPTIONS,
  case01_authorityDemand: CASE01_AUTHORITY_DEMAND_OPTIONS,
  case01_paymentDemandScope: CASE01_PAYMENT_DEMAND_SCOPE_OPTIONS,
  case01_supplementDemandScope: CASE01_SUPPLEMENT_DEMAND_SCOPE_OPTIONS,
  case01_customerResponded: CASE01_CUSTOMER_RESPONDED_OPTIONS,
  case01_responseDetail: CASE01_RESPONSE_DETAIL_OPTIONS,
  case01_authorityResponse: CASE01_AUTHORITY_RESPONSE_OPTIONS,
  case01_deadline: CASE01_DEADLINE_OPTIONS,
  case01_actualSituation: CASE01_ACTUAL_SITUATION_OPTIONS,
  case01_confirmGoal: CASE01_CONFIRM_GOAL_OPTIONS,
  case01_blockage: CASE01_BLOCKAGE_UI_OPTIONS,
  case01_evidence: CASE01_EVIDENCE_OPTIONS,
  case01_finalGoal: CASE01_FINAL_GOAL_UI_OPTIONS,
  ...CASE01_PHASE2_FACET_FIELD_OPTION_MAP,
  ...CASE02_FIELD_OPTIONS,
  case02_nonPaymentNotice: CASE02_NON_PAYMENT_NOTICE_OPTIONS,
  case02_paymentMethod: CASE02_PAYMENT_METHOD_OPTIONS,
  case02_authorityResponse: CASE01_AUTHORITY_RESPONSE_OPTIONS,
  ...CASE03_FIELD_OPTION_MAP,
  ...CASE04_FIELD_OPTION_MAP,
  ...CASE05_FIELD_OPTION_MAP,
  ...CASE06_V11_FIELD_OPTIONS,
};

/** §3 choice-space audit — situation형 choice field ids (list형 multi 제외). */
export function getAdminVerifySituationalChoiceFieldIds(): string[] {
  return Object.keys(ADMIN_VERIFY_MERGED_FIELD_OPTION_MAP).filter(
    (fieldId) => !ADMIN_VERIFY_MULTI_CHOICE_FIELD_IDS.has(fieldId),
  );
}

export function getCase05FieldOptionLabel(fieldId: string, value: string): string {
  /** 현재 화면 선택지가 있으면 항상 그 문장 — 옛 라벨·다른 질문의 같은 slug가 덮지 않도록 */
  const current = CASE05_FIELD_OPTION_MAP[fieldId]?.find((option) => option.value === value);
  if (current && value !== "other") return current.label;
  const legacy = getLegacyChoiceLabel(fieldId, value);
  if (legacy) return legacy;
  if (fieldId === "case05_dispositionType") {
    const fromLabels = CASE05_OPTION_LABELS[value];
    if (fromLabels) return fromLabels;
    const canonical = case05EffectiveDispositionType(value);
    if (canonical && canonical !== value) {
      return getCase05FieldOptionLabel(fieldId, canonical);
    }
  }
  if (fieldId === "case05_confirmGoal") {
    const fromLabels = CASE05_OPTION_LABELS[value];
    if (fromLabels) return fromLabels;
    const canonical = case05EffectiveConfirmGoal(value);
    if (canonical && canonical !== value) {
      return getCase05FieldOptionLabel(fieldId, canonical);
    }
  }
  if (fieldId === "case05_deadline") {
    const fromLabels = CASE05_OPTION_LABELS[value];
    if (fromLabels) return fromLabels;
    const canonical = case05EffectiveDeadline(value);
    if (canonical && canonical !== value) {
      return getCase05FieldOptionLabel(fieldId, canonical);
    }
  }
  if (fieldId === "case05_customerResponse" && value === "other_method") {
    return CASE05_OPTION_LABELS.other_method;
  }
  if (fieldId === "case05_authorityFollowUp") {
    const legacyLabel = CASE05_LEGACY_AUTHORITY_FOLLOWUP_LABELS[value];
    if (legacyLabel) return legacyLabel;
    const canonical = case05EffectiveAuthorityFollowUp(value);
    if (canonical && canonical !== value) {
      return getCase05FieldOptionLabel(fieldId, canonical);
    }
  }
  if (fieldId === "case05_appealDetail") {
    const legacyLabel = CASE05_LEGACY_APPEAL_DETAIL_LABELS[value];
    if (legacyLabel) return legacyLabel;
    const canonical = case05EffectiveAppealDetail(value);
    if (canonical && canonical !== value) {
      return getCase05FieldOptionLabel(fieldId, canonical);
    }
  }
  if (fieldId === "case05_blockage") {
    const legacyLabel = CASE05_LEGACY_BLOCKAGE_LABELS[value];
    if (legacyLabel) return legacyLabel;
    const canonical = case05EffectiveBlockageSlug(value);
    if (canonical && canonical !== value) {
      return getCase05FieldOptionLabel(fieldId, canonical);
    }
  }
  if (fieldId === "case05_evidence") {
    const legacyLabel = CASE05_LEGACY_EVIDENCE_LABELS[value];
    if (legacyLabel) return legacyLabel;
  }
  if (fieldId === "case05_finalGoal") {
    const legacyLabel = CASE05_LEGACY_FINAL_GOAL_LABELS[value];
    if (legacyLabel) return legacyLabel;
  }
  if (fieldId === "case05_dispositionReason") {
    const legacyLabel = CASE05_LEGACY_DISPOSITION_REASON_LABELS[value];
    if (legacyLabel) return legacyLabel;
  }
  if (fieldId === "case05_explanationDetail") {
    const legacyLabel = CASE05_LEGACY_EXPLANATION_DETAIL_LABELS[value];
    if (legacyLabel) return legacyLabel;
  }
  const options = CASE05_FIELD_OPTION_MAP[fieldId];
  const matched = options?.find((option) => option.value === value);
  return matched?.label ?? CASE05_OPTION_LABELS[value] ?? value;
}

/** Direct Input(`other`) + legacy `other_disposition` restore — CASE_02 `getCase02FieldLabelFromAnswers` 동형 */
export function getCase05FieldLabelFromAnswers(
  fieldId: string,
  answers: ReviewAnswers,
): { label: string; factStatus: FactStatus } | null {
  const value = answers[fieldId as keyof ReviewAnswers]?.trim();
  if (!value) return null;
  if (isAdminVerifyMultiChoiceField(fieldId)) {
    const joined = formatAdminVerifyMultiChoiceAnswerLabel(fieldId, value, (slug) =>
      getCase05FieldOptionLabel(fieldId, slug),
    );
    if (!joined) return null;
    return { label: joined, factStatus: "confirmed" };
  }
  if (value === "other") {
    const note = answers[getAdminChoiceNoteKey(fieldId)]?.trim();
    const fallback = getCase05FieldOptionLabel(fieldId, "other");
    return {
      label: note || fallback,
      factStatus: note ? "confirmed" : "candidate",
    };
  }
  if (fieldId === "case05_dispositionType" && value === "other_disposition") {
    return {
      label: CASE05_OPTION_LABELS.other_disposition,
      factStatus: "confirmed",
    };
  }
  if (fieldId === "case05_evidence" && value === "evidence_other") {
    return {
      label: CASE05_OPTION_LABELS.evidence_other,
      factStatus: "confirmed",
    };
  }
  if (fieldId === "case05_submittedDocsDetail" && value === "doc_other") {
    return {
      label: CASE05_OPTION_LABELS.doc_other ?? "위에 없는 다른 서류",
      factStatus: "confirmed",
    };
  }
  return {
    label: getCase05FieldOptionLabel(fieldId, value),
    factStatus: "confirmed",
  };
}

export function isCase05DispositionTypeUnclear(type: string | undefined): boolean {
  const effective = case05EffectiveDispositionType(type);
  return (
    effective === CASE05_DISPOSITION_TYPE_UNCLEAR ||
    type === "reason_hard_to_understand" ||
    type === "unclear" ||
    type === "unsure" ||
    type === "other" ||
    type === "other_disposition"
  );
}

export function case05DispositionTypeIsRightsEnded(type: string | undefined): boolean {
  return case05EffectiveDispositionType(type) === CASE05_DISPOSITION_TYPE_RIGHTS_ENDED;
}

const CASE05_AUTHORITY_FOLLOWUP_DEPTH_VALUES = new Set([
  "maintained",
  "changed",
  "wants_more",
  "more_docs",
  "attendance_explanation",
  "payment_demand",
  "modified",
  "revoked",
  "under_review",
]);

function case05HasResponded(answers: ReviewAnswers): boolean {
  const response = answers.case05_customerResponse?.trim() ?? "";
  return Boolean(response && response !== "none");
}

/** 개인화 퍼널 v1 — 통지 내용이 다르다고 했거나, 이유가 사실 주장일 때만 사실 비교 */
const CASE05_FACT_CLAIM_REASONS = new Set([
  "violation_claimed",
  "document_issue",
  "requirement_not_met",
  "deadline_procedure",
]);

function case05NeedsFactRelationshipPhase2(answers: ReviewAnswers): boolean {
  if (answers.case05_dispositionType === "situation_mismatch") return true;
  const reason = answers.case05_dispositionReason?.trim();
  return Boolean(reason && CASE05_FACT_CLAIM_REASONS.has(reason));
}

/** 개인화 퍼널 v1 — 재검토 요청이 접수됐거나 결정이 변경·취소된 고객에게는 기한을 묻지 않음 */
function case05NeedsDeadlinePhase2(answers: ReviewAnswers): boolean {
  const appeal = answers.case05_appealDetail?.trim() ?? "";
  if (appeal.startsWith("filed_")) return false;
  const followUp = case05EffectiveAuthorityFollowUp(answers.case05_authorityFollowUp);
  return followUp !== "changed";
}

export function case05NeedsDispositionReasonPhase2(answers: ReviewAnswers): boolean {
  const goal = case05EffectiveConfirmGoal(answers.case05_confirmGoal);
  const type = case05EffectiveDispositionType(answers.case05_dispositionType);
  if (type === "reason_hard_to_understand" || type === CASE05_DISPOSITION_TYPE_UNCLEAR) {
    return true;
  }
  if (goal === "understand_reason" || goal === "maintain_reason") return true;
  const impactGoals =
    goal === "understand_impact" || goal === "appeal_possibility" || goal === "what_to_do";
  if (
    impactGoals &&
    (type === "application_denied" ||
      type === "business_suspended" ||
      case05DispositionTypeIsRightsEnded(type))
  ) {
    return true;
  }
  return false;
}

function case05NeedsAuthorityFollowUpPhase2(answers: ReviewAnswers): boolean {
  const response = answers.case05_customerResponse;
  return (
    response === "inquired" ||
    response === "explanation_submitted" ||
    response === "documents_submitted" ||
    response === "appeal_requested" ||
    response === "other_method"
  );
}

function case05NeedsDispositionDetail(answers: ReviewAnswers): boolean {
  const type = answers.case05_dispositionType;
  return (
    isCase05DispositionTypeUnclear(type) ||
    type === "unsure" ||
    type === "reason_hard_to_understand" ||
    type === "application_denied"
  );
}

function case05NeedsPlannedNextStepPhase2(_answers: ReviewAnswers): boolean {
  return false;
}

export function case05FinalGoalOptionsForAnswers(answers: ReviewAnswers): {
  value: string;
  label: string;
}[] {
  const goal = case05EffectiveConfirmGoal(answers.case05_confirmGoal);
  const dupe = goal ? CASE05_CONFIRM_GOAL_TO_FINAL_GOAL_DUPE[goal] : undefined;
  /** 개인화 퍼널 v1 — 이미 재검토를 요청한 고객에게 '재검토 요청 방법'을 목표로 다시 묻지 않음 */
  const appealAlreadyRequested = answers.case05_customerResponse === "appeal_requested";
  return CASE05_FINAL_GOAL_OPTIONS.filter((option) => {
    if (adminVerifyFieldHasSlug(answers, "case05_finalGoal", option.value)) return true;
    if (dupe && option.value === dupe) return false;
    if (appealAlreadyRequested && option.value === "next_action") return false;
    return true;
  });
}

function case05HasSelectableFinalGoalOptions(answers: ReviewAnswers): boolean {
  return case05FinalGoalOptionsForAnswers(answers).some(
    (option) => !isAdminDirectExplainOption(option),
  );
}

function case05NeedsFactDetail(answers: ReviewAnswers): boolean {
  const rel = answers.case05_factRelationship;
  return rel === "partial" || rel === "mismatch" || rel === "hard_to_judge";
}

function case05NeedsExplanationDetail(answers: ReviewAnswers): boolean {
  return answers.case05_customerResponse === "explanation_submitted";
}

function case05NeedsSubmittedDocsDetail(answers: ReviewAnswers): boolean {
  return answers.case05_customerResponse === "documents_submitted";
}

function case05NeedsAppealDetail(answers: ReviewAnswers): boolean {
  return answers.case05_customerResponse === "appeal_requested";
}

function case05NeedsDispositionOutcome(_answers: ReviewAnswers): boolean {
  return false;
}

function case05IsPhase2CoreBranchComplete(answers: ReviewAnswers): boolean {
  if (
    case05NeedsFactRelationshipPhase2(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case05_factRelationship",
      answers,
      CASE05_FACT_RELATIONSHIP_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case05NeedsDispositionReasonPhase2(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case05_dispositionReason",
      answers,
      CASE05_DISPOSITION_REASON_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case05NeedsDispositionDetail(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case05_dispositionDetail",
      answers,
      CASE05_DISPOSITION_DETAIL_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case05NeedsFactDetail(answers) &&
    !isAdminVerifyChoiceFieldComplete("case05_factDetail", answers, CASE05_FACT_DETAIL_OPTIONS)
  ) {
    return false;
  }
  if (
    case05NeedsExplanationDetail(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case05_explanationDetail",
      answers,
      CASE05_EXPLANATION_DETAIL_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case05NeedsSubmittedDocsDetail(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case05_submittedDocsDetail",
      answers,
      CASE05_SUBMITTED_DOCS_DETAIL_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case05NeedsAppealDetail(answers) &&
    !isAdminVerifyChoiceFieldComplete("case05_appealDetail", answers, CASE05_APPEAL_DETAIL_OPTIONS)
  ) {
    return false;
  }
  if (
    case05NeedsAuthorityFollowUpPhase2(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case05_authorityFollowUp",
      answers,
      CASE05_AUTHORITY_FOLLOWUP_OPTIONS,
    )
  ) {
    return false;
  }
  return true;
}

function case05Phase2TailAxesUnlocked(answers: ReviewAnswers): boolean {
  return isCase05Phase1Complete(answers) && case05IsPhase2CoreBranchComplete(answers);
}

/** 개인화 퍼널 v1 — 1차에서 목표가 명확하면(대응 여부와 관계없이) 마무리 목표를 다시 묻지 않음 */
function case05ConfirmGoalSkipsTailFinalGoal(answers: ReviewAnswers): boolean {
  const goal = case05EffectiveConfirmGoal(answers.case05_confirmGoal);
  return (
    goal === "understand_reason" ||
    goal === "understand_impact" ||
    goal === "appeal_possibility" ||
    goal === "what_to_do"
  );
}

function case05NeedsRepeatFollowUpQuestion(_answers: ReviewAnswers): boolean {
  return false;
}

function case05AuthorityFollowUpDepthSignal(answers: ReviewAnswers): boolean {
  const goal = answers.case05_confirmGoal;
  if (goal === "maintain_reason") return true;
  if (answers.case05_dispositionType === "situation_mismatch") return true;
  const followUp = case05EffectiveAuthorityFollowUp(answers.case05_authorityFollowUp);
  if (!followUp) return false;
  return CASE05_AUTHORITY_FOLLOWUP_DEPTH_VALUES.has(followUp);
}

/** 개인화 퍼널 v1 — 앞선 답변으로 막힌 지점을 알 수 없는 고객만 (tail 일괄 개방·교통국 답변 트리거 제거) */
function case05NeedsBlockage(answers: ReviewAnswers): boolean {
  const type = answers.case05_dispositionType;
  if (isCase05DispositionTypeUnclear(type)) return true;
  const reason = answers.case05_dispositionReason;
  if (reason === "no_clear_reason" || reason === "unsure") return true;
  const rel = answers.case05_factRelationship;
  if (rel === "mismatch" || rel === "hard_to_judge" || rel === "unknown") return true;
  return answers.case05_confirmGoal === "unsure";
}

/** 개인화 퍼널 v1 — 보관 자료는 모든 고객의 핵심 사실(COMMON). 선택지만 필터 */
function case05NeedsEvidence(_answers: ReviewAnswers): boolean {
  return true;
}

function case05NeedsFinalGoal(answers: ReviewAnswers): boolean {
  if (
    case05NeedsEvidence(answers) &&
    isAdminVerifyChoiceFieldComplete(
      "case05_evidence",
      answers,
      CASE05_EVIDENCE_OPTIONS,
    )
  ) {
    if (case05ConfirmGoalSkipsTailFinalGoal(answers)) return false;
    return case05HasSelectableFinalGoalOptions(answers);
  }
  if (case05ConfirmGoalSkipsTailFinalGoal(answers)) return false;
  const type = answers.case05_dispositionType;
  const reason = answers.case05_dispositionReason;
  return (
    type === "unclear" ||
    type === "unsure" ||
    reason === "unsure" ||
    reason === "no_clear_reason" ||
    answers.case05_confirmGoal === "unsure"
  );
}

function deriveCase05Rounds(answers: ReviewAnswers): {
  dispositionResponseRound: number;
  dispositionReviewRound: number;
} {
  let dispositionResponseRound = 0;
  let dispositionReviewRound = 0;
  const response = answers.case05_customerResponse;
  if (response && response !== "none" && response !== "unsure") {
    dispositionResponseRound = 1;
  }
  if (answers.case05_authorityFollowUp) {
    dispositionReviewRound = 1;
  }
  if (
    answers.case05_dispositionOutcome === "maintained" ||
    answers.case05_authorityFollowUp === "maintained"
  ) {
    dispositionResponseRound = Math.max(dispositionResponseRound, 2);
    dispositionReviewRound = Math.max(dispositionReviewRound, 2);
  }
  const repeat = answers.case05_repeatFollowUp;
  if (repeat && repeat !== "not_applicable" && repeat !== "unsure") {
    dispositionResponseRound = Math.max(dispositionResponseRound, 2);
    dispositionReviewRound = Math.max(dispositionReviewRound, 2);
  }
  return { dispositionResponseRound, dispositionReviewRound };
}

export function shouldActivateCase05Path(answers: ReviewAnswers): boolean {
  if (isAdminCaseEntryQ1Complete(answers)) {
    return getQ1ResolvedCase(answers) === "CASE_05";
  }
  if (answers._case05Active === "1") return true;
  if (answers.case05_dispositionType) return true;
  if (shouldActivateCase02Path(answers)) return false;
  if (answers.case03_authorityDemand || answers._case03Active === "1") return false;
  if (answers.case04_supplementTarget || answers._case04Active === "1") return false;

  const text = customerTextFromAnswers(answers);
  if (isDispositionPrimaryInput(text)) return true;

  if (answers.case01_authorityDemand === "disposition") return true;

  const hits = keywordCaseSignals(text);
  if (hits[0] === "CASE_05") return true;

  return false;
}

export function isCase05Phase1Complete(answers: ReviewAnswers): boolean {
  for (const fieldId of CASE05_PHASE1_FIELD_ORDER) {
    const options = CASE05_FIELD_OPTIONS[fieldId];
    if (!options || !isAdminVerifyChoiceFieldComplete(fieldId, answers, options)) {
      return false;
    }
  }
  return true;
}

function appendCase05Phase1Questions(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  pushUnique(questions, {
    id: "case05_dispositionType",
    kind: "choice",
    label: CASE05_V2_QUESTION_LABELS.case05_dispositionType,
    options: CASE05_DISPOSITION_TYPE_OPTIONS,
  });
  if (
    !isAdminVerifyChoiceFieldComplete(
      "case05_dispositionType",
      answers,
      CASE05_DISPOSITION_TYPE_OPTIONS,
    )
  ) {
    return;
  }

  pushUnique(questions, {
    id: "case05_customerResponse",
    kind: "choice",
    label: CASE05_V2_QUESTION_LABELS.case05_customerResponse,
    options: CASE05_CUSTOMER_RESPONSE_OPTIONS,
  });
  if (
    !isAdminVerifyChoiceFieldComplete(
      "case05_customerResponse",
      answers,
      CASE05_CUSTOMER_RESPONSE_OPTIONS,
    )
  ) {
    return;
  }

  pushUnique(questions, {
    id: "case05_confirmGoal",
    kind: "choice",
    label: CASE05_V2_QUESTION_LABELS.case05_confirmGoal,
    options: case05ConfirmGoalOptionsFor(answers),
  });
}

/** 개인화 퍼널 v1 — 선택지 필터. 이미 저장된 값은 항상 남김(레거시 호환) */
function case05FilterOptions(
  fieldId: string,
  answers: ReviewAnswers,
  options: { value: string; label: string }[],
  keep: (value: string) => boolean,
): { value: string; label: string }[] {
  return options.filter(
    (o) => o.value === "other" || adminVerifyFieldHasSlug(answers, fieldId, o.value) || keep(o.value),
  );
}

function case05ConfirmGoalOptionsFor(answers: ReviewAnswers) {
  return case05FilterOptions("case05_confirmGoal", answers, CASE05_CONFIRM_GOAL_OPTIONS, (v) =>
    v !== "appeal_possibility" || answers.case05_customerResponse !== "appeal_requested",
  );
}

function case05FactRelationshipOptionsFor(answers: ReviewAnswers) {
  return case05FilterOptions("case05_factRelationship", answers, CASE05_FACT_RELATIONSHIP_OPTIONS, (v) =>
    !(answers.case05_dispositionType === "situation_mismatch" && v === "match"),
  );
}

function case05BlockageOptionsFor(answers: ReviewAnswers) {
  return case05FilterOptions("case05_blockage", answers, CASE05_BLOCKAGE_OPTIONS, (v) =>
    v !== "next_response" || case05HasResponded(answers),
  );
}

function case05EvidenceOptionsFor(answers: ReviewAnswers) {
  const r = answers.case05_customerResponse;
  return case05FilterOptions("case05_evidence", answers, CASE05_EVIDENCE_OPTIONS, (v) =>
    v !== "submitted_docs" ||
    r === "explanation_submitted" ||
    r === "documents_submitted" ||
    r === "appeal_requested",
  );
}

/**
 * 개인화 퍼널 v1 — 대응 방식별 상세 → 교통국 답변 → 기한(필요한 고객만) → 조치 이유 → 달라지는 점
 * → 사실 비교(사실 주장일 때만) → 다른 부분 → 막힌 점(알 수 없을 때만) → 보관 자료 → 마무리 목표.
 */
function appendCase05Phase2Questions(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  if (case05NeedsExplanationDetail(answers)) {
    pushUnique(questions, {
      id: "case05_explanationDetail",
      kind: "choice",
      label: CASE05_V2_QUESTION_LABELS.case05_explanationDetail,
      options: CASE05_EXPLANATION_DETAIL_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case05_explanationDetail",
        answers,
        CASE05_EXPLANATION_DETAIL_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case05NeedsSubmittedDocsDetail(answers)) {
    pushUnique(questions, {
      id: "case05_submittedDocsDetail",
      kind: "choice",
      label: CASE05_V2_QUESTION_LABELS.case05_submittedDocsDetail,
      options: CASE05_SUBMITTED_DOCS_DETAIL_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case05_submittedDocsDetail",
        answers,
        CASE05_SUBMITTED_DOCS_DETAIL_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case05NeedsAppealDetail(answers)) {
    pushUnique(questions, {
      id: "case05_appealDetail",
      kind: "choice",
      label: CASE05_V2_QUESTION_LABELS.case05_appealDetail,
      options: CASE05_APPEAL_DETAIL_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete("case05_appealDetail", answers, CASE05_APPEAL_DETAIL_OPTIONS)
    ) {
      return;
    }
  }

  if (case05NeedsAuthorityFollowUpPhase2(answers)) {
    pushUnique(questions, {
      id: "case05_authorityFollowUp",
      kind: "choice",
      label: CASE05_V2_QUESTION_LABELS.case05_authorityFollowUp,
      options: CASE05_AUTHORITY_FOLLOWUP_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case05_authorityFollowUp",
        answers,
        CASE05_AUTHORITY_FOLLOWUP_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case05NeedsDeadlinePhase2(answers)) {
    pushUnique(questions, {
      id: "case05_deadline",
      kind: "choice",
      label: CASE05_V2_QUESTION_LABELS.case05_deadline,
      options: CASE05_DEADLINE_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete("case05_deadline", answers, CASE05_DEADLINE_OPTIONS)
    ) {
      return;
    }
    if (case05NeedsDeadlineDateDetail(answers)) {
      pushUnique(questions, {
        id: CASE05_DEADLINE_DATE_KEY,
        kind: "text",
        label: CASE05_V2_QUESTION_LABELS.case05_deadlineDate,
        placeholder: CASE05_V2_QUESTION_LABELS.case05_deadlineDatePlaceholder,
      });
      return;
    }
  }

  if (case05NeedsDispositionReasonPhase2(answers)) {
    pushUnique(questions, {
      id: "case05_dispositionReason",
      kind: "choice",
      label: CASE05_V2_QUESTION_LABELS.case05_dispositionReason,
      options: CASE05_DISPOSITION_REASON_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case05_dispositionReason",
        answers,
        CASE05_DISPOSITION_REASON_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case05NeedsDispositionDetail(answers)) {
    pushUnique(questions, {
      id: "case05_dispositionDetail",
      kind: "choice",
      label: CASE05_V2_QUESTION_LABELS.case05_dispositionDetail,
      options: CASE05_DISPOSITION_DETAIL_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case05_dispositionDetail",
        answers,
        CASE05_DISPOSITION_DETAIL_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case05NeedsFactRelationshipPhase2(answers)) {
    pushUnique(questions, {
      id: "case05_factRelationship",
      kind: "choice",
      label: CASE05_V2_QUESTION_LABELS.case05_factRelationship,
      options: case05FactRelationshipOptionsFor(answers),
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case05_factRelationship",
        answers,
        CASE05_FACT_RELATIONSHIP_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case05NeedsFactDetail(answers)) {
    pushUnique(questions, {
      id: "case05_factDetail",
      kind: "choice",
      label: CASE05_V2_QUESTION_LABELS.case05_factDetail,
      options: CASE05_FACT_DETAIL_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete("case05_factDetail", answers, CASE05_FACT_DETAIL_OPTIONS)
    ) {
      return;
    }
  }

  if (case05NeedsDispositionOutcome(answers)) {
    pushUnique(questions, {
      id: "case05_dispositionOutcome",
      kind: "choice",
      label:
        "교통국에서는 이 조치에 대한 후속 결과나 종료·해제 안내를 어떻게 받았나요?",
      options: CASE05_DISPOSITION_OUTCOME_OPTIONS,
    });
    if (!answers.case05_dispositionOutcome) return;
  }

  if (case05NeedsPlannedNextStepPhase2(answers)) {
    pushUnique(questions, {
      id: "case05_plannedNextStep",
      kind: "choice",
      label: "처분 통지를 받은 후, 지금 어떤 조치를 검토하거나 준비하고 있나요?",
      options: CASE05_PLANNED_NEXT_STEP_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case05_plannedNextStep",
        answers,
        CASE05_PLANNED_NEXT_STEP_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case05NeedsRepeatFollowUpQuestion(answers)) {
    pushUnique(questions, {
      id: "case05_repeatFollowUp",
      kind: "choice",
      label: "처분 후 추가 대응이 반복되었나요?",
      options: CASE05_REPEAT_FOLLOWUP_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case05_repeatFollowUp",
        answers,
        CASE05_REPEAT_FOLLOWUP_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case05NeedsBlockage(answers)) {
    pushUnique(questions, {
      id: "case05_blockage",
      kind: "choice",
      label: CASE05_V2_QUESTION_LABELS.case05_blockage,
      options: case05BlockageOptionsFor(answers),
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case05_blockage",
        answers,
        CASE05_BLOCKAGE_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case05NeedsEvidence(answers)) {
    pushUnique(questions, {
      id: "case05_evidence",
      kind: "choice",
      label: CASE05_V2_QUESTION_LABELS.case05_evidence,
      options: case05EvidenceOptionsFor(answers),
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case05_evidence",
        answers,
        CASE05_EVIDENCE_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case05NeedsFinalGoal(answers)) {
    pushUnique(questions, {
      id: "case05_finalGoal",
      kind: "choice",
      label: CASE05_V2_QUESTION_LABELS.case05_finalGoal,
      options: case05FinalGoalOptionsForAnswers(answers),
    });
  }
}

function appendCase05PathQuestions(
  questions: ProfileQuestion[],
  answers: ReviewAnswers,
  phase: AdminVerifyProfilePhase = 2,
): void {
  if (phase === 1) {
    appendCase05Phase1Questions(questions, answers);
    return;
  }
  if (isCase06BridgedToNativeCase(answers, "CASE_05") && !isCase05Phase1Complete(answers)) {
    appendCase05Phase1Questions(questions, answers);
    if (!isCase05Phase1Complete(answers)) return;
  }
  appendCase05Phase2Questions(questions, answers);
}

function case05PathFieldsComplete(answers: ReviewAnswers): boolean {
  if (!isCase05Phase1Complete(answers)) return false;
  if (
    case05NeedsDeadlinePhase2(answers) &&
    !isAdminVerifyChoiceFieldComplete("case05_deadline", answers, CASE05_DEADLINE_OPTIONS)
  ) {
    return false;
  }
  if (case05NeedsDeadlineDateDetail(answers)) return false;

  if (
    case05NeedsFactRelationshipPhase2(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case05_factRelationship",
      answers,
      CASE05_FACT_RELATIONSHIP_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case05NeedsDispositionReasonPhase2(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case05_dispositionReason",
      answers,
      CASE05_DISPOSITION_REASON_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case05NeedsDispositionDetail(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case05_dispositionDetail",
      answers,
      CASE05_DISPOSITION_DETAIL_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case05NeedsFactDetail(answers) &&
    !isAdminVerifyChoiceFieldComplete("case05_factDetail", answers, CASE05_FACT_DETAIL_OPTIONS)
  ) {
    return false;
  }
  if (
    case05NeedsExplanationDetail(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case05_explanationDetail",
      answers,
      CASE05_EXPLANATION_DETAIL_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case05NeedsSubmittedDocsDetail(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case05_submittedDocsDetail",
      answers,
      CASE05_SUBMITTED_DOCS_DETAIL_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case05NeedsAppealDetail(answers) &&
    !isAdminVerifyChoiceFieldComplete("case05_appealDetail", answers, CASE05_APPEAL_DETAIL_OPTIONS)
  ) {
    return false;
  }
  if (
    case05NeedsAuthorityFollowUpPhase2(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case05_authorityFollowUp",
      answers,
      CASE05_AUTHORITY_FOLLOWUP_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case05NeedsBlockage(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case05_blockage",
      answers,
      CASE05_BLOCKAGE_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case05NeedsEvidence(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case05_evidence",
      answers,
      CASE05_EVIDENCE_OPTIONS,
    )
  ) {
    return false;
  }
  if (
    case05NeedsFinalGoal(answers) &&
    !isAdminVerifyChoiceFieldComplete(
      "case05_finalGoal",
      answers,
      case05FinalGoalOptionsForAnswers(answers),
    )
  ) {
    return false;
  }
  return true;
}

export function isCase05PathComplete(answers: ReviewAnswers): boolean {
  if (!shouldActivateCase05Path(answers)) return false;
  return case05PathFieldsComplete(answers);
}

function case05DetailProfileLabel(
  fieldId:
    | "case05_dispositionDetail"
    | "case05_factDetail"
    | "case05_explanationDetail"
    | "case05_submittedDocsDetail"
    | "case05_appealDetail",
  answers: ReviewAnswers,
): string | null {
  const fromAnswers = getCase05FieldLabelFromAnswers(fieldId, answers);
  return fromAnswers?.label ?? null;
}

function case05DispositionDetailProfileSuffix(answers: ReviewAnswers): string | null {
  return case05DetailProfileLabel("case05_dispositionDetail", answers);
}

function case05FactDetailProfileSuffix(answers: ReviewAnswers): string | null {
  return case05DetailProfileLabel("case05_factDetail", answers);
}

function appendCase05DetailDispositionSignals(
  answers: ReviewAnswers,
  signals: DispositionSignalCode[],
): void {
  const dispositionDetail = answers.case05_dispositionDetail;
  if (dispositionDetail === "wording_unclear" || dispositionDetail === "scope_unclear") {
    if (!signals.includes("DISPOSITION_TYPE_UNCLEAR")) {
      signals.push("DISPOSITION_TYPE_UNCLEAR");
    }
  }
  const factDetail = effectiveAdminVerifyChoiceSlug(answers, "case05_factDetail");
  if (
    (factDetail === "content_differs_clear" || factDetail === "content_differs_vague") &&
    answers.case05_factRelationship === "partial"
  ) {
    const idx = signals.indexOf("FACT_MISMATCH_PARTIAL");
    if (idx >= 0) signals.splice(idx, 1);
    if (!signals.includes("FACT_MISMATCH")) signals.push("FACT_MISMATCH");
  }
  if (
    (factDetail === "date_place_fuzzy" || factDetail === "content_differs_vague") &&
    !signals.includes("FACT_UNVERIFIED")
  ) {
    signals.push("FACT_UNVERIFIED");
  }
  const explanationDetail = effectiveAdminVerifyChoiceSlug(answers, "case05_explanationDetail");
  if (
    (explanationDetail === "verbal_no_record" || explanationDetail === "verbal_with_record") &&
    !signals.includes("DISPOSITION_EVIDENCE_UNCLEAR")
  ) {
    if (case05NeedsEvidence(answers)) signals.push("DISPOSITION_EVIDENCE_UNCLEAR");
  }
  const appealDetail = effectiveAdminVerifyChoiceSlug(answers, "case05_appealDetail");
  if (
    (appealDetail === "filed_no_schedule" ||
      appealDetail === "filed_no_receipt" ||
      appealDetail === "filed_schedule_known") &&
    !signals.includes("DISPOSITION_RESPONSE_UNCLEAR")
  ) {
    signals.push("DISPOSITION_RESPONSE_UNCLEAR");
  }
}

export function case05ListPhase2SubstantiveAxesOnPath(answers: ReviewAnswers): string[] {
  const axes: string[] = [];
  const maybe = (id: string, needs: boolean) => {
    if (needs) axes.push(id);
  };
  maybe("case05_factRelationship", case05NeedsFactRelationshipPhase2(answers));
  maybe("case05_dispositionReason", case05NeedsDispositionReasonPhase2(answers));
  maybe("case05_authorityFollowUp", case05NeedsAuthorityFollowUpPhase2(answers));
  maybe("case05_dispositionDetail", case05NeedsDispositionDetail(answers));
  maybe("case05_factDetail", case05NeedsFactDetail(answers));
  maybe("case05_explanationDetail", case05NeedsExplanationDetail(answers));
  maybe("case05_submittedDocsDetail", case05NeedsSubmittedDocsDetail(answers));
  maybe("case05_appealDetail", case05NeedsAppealDetail(answers));
  maybe("case05_dispositionOutcome", case05NeedsDispositionOutcome(answers));
  maybe("case05_plannedNextStep", case05NeedsPlannedNextStepPhase2(answers));
  maybe("case05_repeatFollowUp", case05NeedsRepeatFollowUpQuestion(answers));
  maybe("case05_blockage", case05NeedsBlockage(answers));
  maybe("case05_evidence", case05NeedsEvidence(answers));
  maybe("case05_finalGoal", case05NeedsFinalGoal(answers));
  return axes.filter((id) =>
    (CASE05_PHASE2_SUBSTANTIVE_AXIS_IDS as readonly string[]).includes(id),
  );
}

function case05Phase2SubstantiveAxisAnswered(id: string, answers: ReviewAnswers): boolean {
  if (id === "case05_factRelationship" && !case05NeedsFactRelationshipPhase2(answers)) {
    return false;
  }
  if (id === "case05_dispositionReason" && !case05NeedsDispositionReasonPhase2(answers)) {
    return false;
  }
  if (id === "case05_authorityFollowUp" && !case05NeedsAuthorityFollowUpPhase2(answers)) {
    return false;
  }
  if (id === "case05_dispositionDetail" && !case05NeedsDispositionDetail(answers)) return false;
  if (id === "case05_factDetail" && !case05NeedsFactDetail(answers)) return false;
  if (id === "case05_explanationDetail" && !case05NeedsExplanationDetail(answers)) return false;
  if (id === "case05_submittedDocsDetail" && !case05NeedsSubmittedDocsDetail(answers)) {
    return false;
  }
  if (id === "case05_appealDetail" && !case05NeedsAppealDetail(answers)) return false;
  if (id === "case05_dispositionOutcome" && !case05NeedsDispositionOutcome(answers)) return false;
  if (id === "case05_plannedNextStep" && !case05NeedsPlannedNextStepPhase2(answers)) {
    return false;
  }
  if (id === "case05_repeatFollowUp" && !case05NeedsRepeatFollowUpQuestion(answers)) return false;
  if (id === "case05_blockage" && !case05NeedsBlockage(answers)) return false;
  if (id === "case05_evidence" && !case05NeedsEvidence(answers)) return false;
  if (id === "case05_finalGoal" && !case05NeedsFinalGoal(answers)) return false;
  const options = CASE05_FIELD_OPTION_MAP[id];
  return Boolean(options && isAdminVerifyChoiceFieldComplete(id, answers, options));
}

export function case05CountAnsweredPhase2SubstantiveAxes(answers: ReviewAnswers): number {
  let count = 0;
  for (const id of CASE05_PHASE2_SUBSTANTIVE_AXIS_IDS) {
    if (case05Phase2SubstantiveAxisAnswered(id, answers)) count += 1;
  }
  return count;
}

export function deriveCase05DispositionSignals(answers: ReviewAnswers): DispositionSignalCode[] {
  return deriveDispositionSignals(answers);
}

function deriveDispositionSignals(answers: ReviewAnswers): DispositionSignalCode[] {
  if (!shouldActivateCase05Path(answers) && !answers.case05_dispositionType) return [];
  const signals: DispositionSignalCode[] = [];

  if (isCase05DispositionTypeUnclear(answers.case05_dispositionType)) {
    signals.push("DISPOSITION_TYPE_UNCLEAR");
  }
  if (
    answers.case05_dispositionReason === "no_clear_reason" ||
    answers.case05_dispositionReason === "unsure"
  ) {
    signals.push("DISPOSITION_REASON_UNCLEAR");
  }
  if (answers.case05_factRelationship === "partial") {
    signals.push("FACT_MISMATCH_PARTIAL");
  }
  if (answers.case05_factRelationship === "mismatch") {
    signals.push("FACT_MISMATCH");
  }
  if (
    answers.case05_factRelationship === "hard_to_judge" ||
    answers.case05_factRelationship === "unknown"
  ) {
    signals.push("FACT_UNVERIFIED");
  }
  const case05Deadline = case05EffectiveDeadline(answers.case05_deadline);
  const case05DateFilled = Boolean(answers[CASE05_DEADLINE_DATE_KEY]?.trim());
  if (case05Deadline === "specific_date" && case05DateFilled) {
    // R01 — date captured; no unclear deadline signal
  } else if (case05Deadline === "period_stated") {
    signals.push("DISPOSITION_DEADLINE_PERIOD_ONLY");
  } else if (case05Deadline === "not_stated") {
    signals.push("DISPOSITION_DEADLINE_NOT_MENTIONED");
  } else if (
    case05Deadline === "uncertain" ||
    answers.case05_deadline === "unsure" ||
    case05Deadline === "past_possible"
  ) {
    signals.push("DISPOSITION_DEADLINE_UNCLEAR");
  } else if (case05Deadline === "specific_date" && !case05DateFilled) {
    signals.push("DISPOSITION_DEADLINE_UNCLEAR");
  }
  appendCase05DetailDispositionSignals(answers, signals);
  if (
    answers.case05_authorityFollowUp === "unsure" ||
    answers.case05_authorityFollowUp === "no_response" ||
    answers.case05_dispositionOutcome === "unsure" ||
    answers.case05_dispositionOutcome === "no_result"
  ) {
    signals.push("DISPOSITION_RESPONSE_UNCLEAR");
  }
  if (
    adminVerifyFieldHasSlug(answers, "case05_evidence", "none") ||
    adminVerifyFieldHasSlug(answers, "case05_evidence", "unsure")
  ) {
    if (case05NeedsEvidence(answers)) {
      signals.push("DISPOSITION_EVIDENCE_UNCLEAR");
    }
  }

  return [...new Set(signals)];
}

function collectCase05Unknowns(answers: ReviewAnswers): string[] {
  const unknowns: string[] = [];
  if (!answers.case05_dispositionType) return unknowns;

  for (const code of deriveDispositionSignals(answers)) {
    const label = DISPOSITION_SIGNAL_LABELS[code];
    if (!unknowns.includes(label)) unknowns.push(label);
  }
  return unknowns;
}

function collectCase05RiskSignals(answers: ReviewAnswers): string[] {
  const risks: string[] = [];
  if (!answers.case05_dispositionType) return risks;

  if (answers.case05_factRelationship === "partial" || answers.case05_factRelationship === "mismatch") {
    risks.push("처분 내용과 실제 상황이 다를 수 있음 — 사실관계 확인 필요");
  }
  const factDetail = effectiveAdminVerifyChoiceSlug(answers, "case05_factDetail");
  if (factDetail === "content_differs_clear" || factDetail === "content_differs_vague") {
    risks.push("처분 사유와 실제 사실관계가 다를 수 있음 — 내용 대조 필요");
  }
  if (answers.case05_dispositionDetail === "scope_unclear") {
    risks.push("정지·제한 범위가 불명확함 — 영향 범위 확인 필요");
  }
  const explanationDetail = effectiveAdminVerifyChoiceSlug(answers, "case05_explanationDetail");
  if (explanationDetail === "verbal_no_record") {
    risks.push("구두 소명만 있는 경우 — 기록·접수 확인 필요");
  }
  const appealDetail = effectiveAdminVerifyChoiceSlug(answers, "case05_appealDetail");
  if (
    appealDetail === "filed_no_schedule" ||
    appealDetail === "filed_no_receipt" ||
    appealDetail === "filed_schedule_known"
  ) {
    risks.push("이의·재검토 신청 후 결과·기한 확인 필요");
  }
  const rounds = deriveCase05Rounds(answers);
  if (rounds.dispositionResponseRound >= 2) {
    risks.push("처분 후 추가 대응이 반복됨 — 동일 사건 내 후속 확인 필요");
  }
  if (answers.case05_authorityFollowUp === "no_response") {
    risks.push("처분 후 기관 반응 미확인 — 확인 필요");
  }
  return risks;
}

function classifyFromCase05Answers(answers: ReviewAnswers): {
  id: MasterCaseId;
  status: FactStatus;
  confidence: number;
  reason: string;
} | null {
  if (!shouldActivateCase05Path(answers) && !answers.case05_dispositionType) return null;

  const followUp = case05EffectiveAuthorityFollowUp(answers.case05_authorityFollowUp);

  if (answers.case05_authorityFollowUp === "payment_demand") {
    return {
      id: "CASE_02",
      status: "inferred",
      confidence: 0.8,
      reason: "현재 해결 중심이 납부 요구로 확인됨",
    };
  }
  if (followUp === "attendance_explanation") {
    return {
      id: "CASE_03",
      status: "inferred",
      confidence: 0.78,
      reason: "현재 해결 중심이 출석·소명으로 확인됨",
    };
  }
  if (followUp === "more_docs" || followUp === "wants_more") {
    return {
      id: "CASE_04",
      status: "inferred",
      confidence: followUp === "wants_more" ? 0.76 : 0.78,
      reason:
        followUp === "wants_more"
          ? "기관이 추가 서류·설명을 요구한 상태로 확인됨"
          : "현재 해결 중심이 보완·추가 제출로 확인됨",
    };
  }
  // Legacy slug only. Canonical disposition_unclear stays on CASE_05.
  if (answers.case05_dispositionType === "unclear") {
    return {
      id: "CASE_06",
      status: "inferred",
      confidence: 0.6,
      reason: "처분·조치 문서 내용이 불명확하다고 응답",
    };
  }

  if (shouldActivateCase05Path(answers) || answers.case05_dispositionType) {
    return {
      id: "CASE_05",
      status: answers.case05_dispositionReason ? "inferred" : "candidate",
      confidence: answers.case05_dispositionReason ? 0.75 : 0.5,
      reason: "처분·조치 통지 사건 경로",
    };
  }

  return null;
}

// ─── CASE_06 불명확한 행정문서 Resolution Path ───

export const CASE06_ANSWER_KEYS = [
  ...CASE06_LEGACY_PHASE1_FIELD_ORDER,
  ...CASE06_V11_PERSIST_ANSWER_KEYS,
  "case06_exactSource",
  "case06_keyPhrase",
  "case06_requiredAction",
  "case06_receiptPath",
  "case06_evidence",
  "case06_blockage",
  "case06_actualCore",
  "case06_finalGoal",
] as const;

export type UnclearSignalCode =
  | "UNCLEAR_SOURCE"
  | "UNCLEAR_ACTION"
  | "UNCLEAR_DEADLINE"
  | "UNCLEAR_DOCUMENT"
  | "UNCLEAR_PROCEDURE"
  | "UNCLEAR_EVIDENCE";

const UNCLEAR_SIGNAL_LABELS: Record<UnclearSignalCode, string> = {
  UNCLEAR_SOURCE: "문서 발신처 확인이 필요합니다",
  UNCLEAR_ACTION: "요구 조치 내용 확인이 필요합니다",
  UNCLEAR_DEADLINE: "대응·제출 기한 확인이 필요합니다",
  UNCLEAR_DOCUMENT: "문서 내용·문구 확인이 필요합니다",
  UNCLEAR_PROCEDURE: "필요한 조치·절차 확인이 필요합니다",
  UNCLEAR_EVIDENCE: "확인 가능한 자료 확인이 필요합니다",
};

const CASE06_SOURCE_OPTIONS = [
  {
    value: "government_agency",
    label: "정부기관이나 공공기관에서 보낸 것으로 알고 있습니다.",
  },
  {
    value: "specific_agency",
    label: "경찰·교통·출입국·세무 등 특정 기관에서 온 것으로 알고 있습니다.",
  },
  {
    value: "non_admin",
    label: "회사·사업장·개인 등 행정기관이 아닌 곳에서 받은 것으로 보입니다.",
  },
  {
    value: "unknown_agency",
    label: "발신기관은 표시되어 있지만 어떤 기관인지 정확히 모르겠습니다.",
  },
  {
    value: "cannot_identify",
    label: "문서를 보낸 곳이나 발신처 자체를 확인하기 어렵습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE06_DOCUMENT_NATURE_OPTIONS = [
  {
    value: "violation_notice",
    label: "어떤 문제나 위반 사실을 알리는 내용으로 보입니다.",
  },
  {
    value: "payment_demand",
    label: "돈을 납부하라는 내용으로 보입니다.",
  },
  {
    value: "attendance_explain",
    label: "기관에 출석하거나 설명하라는 내용으로 보입니다.",
  },
  {
    value: "supplement_docs",
    label: "추가 서류나 자료를 제출하라는 내용으로 보입니다.",
  },
  {
    value: "disposition_action",
    label: "어떤 처분이나 제한이 내려졌다는 내용으로 보입니다.",
  },
  {
    value: "hard_to_classify",
    label: "위 항목 중 어디에 해당하는지 판단하기 어렵습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE06_PERCEIVED_ACTION_OPTIONS = [
  {
    value: "respond_violation",
    label: "문제나 위반과 관련해 대응하거나 설명해야 하는 것으로 보입니다.",
  },
  {
    value: "pay_fee",
    label: "돈을 납부하거나 비용을 처리해야 하는 것으로 보입니다.",
  },
  {
    value: "attend_explain",
    label: "직접 출석하거나 설명해야 하는 것으로 보입니다.",
  },
  {
    value: "submit_docs",
    label: "추가 서류나 자료를 제출해야 하는 것으로 보입니다.",
  },
  {
    value: "respond_disposition",
    label: "특정 조치나 제한에 대응해야 하는 것으로 보입니다.",
  },
  {
    value: "hard_to_tell",
    label: "무엇을 해야 하는지 알기 어렵습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE06_DEADLINE_PRESENCE_OPTIONS = [
  {
    value: "specific_date",
    label: "언제까지 대응해야 하는지 정확한 날짜를 알고 있습니다.",
  },
  {
    value: "uncertain",
    label: "대응 기한이 있다는 것은 알지만 정확한 날짜를 모르겠습니다.",
  },
  {
    value: "not_stated",
    label: "기한이 있는지 자체를 모르겠습니다.",
  },
  {
    value: "past_possible",
    label: "이미 기한이 지났을 가능성이 있습니다.",
  },
  {
    value: "not_checked",
    label: "처분 관련 기한을 아직 확인하지 못했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE06_PERCEIVED_ISSUE_OPTIONS = [
  {
    value: "why_received",
    label: "왜 이 문서를 받았는지 이해하기 어렵습니다.",
  },
  {
    value: "what_to_do",
    label: "무엇을 해야 하는지 이해하기 어렵습니다.",
  },
  {
    value: "situation_relation",
    label: "문서 내용은 어느 정도 알지만 실제 내 상황과 어떤 관계인지 모르겠습니다.",
  },
  {
    value: "deadline_unclear",
    label: "언제까지 대응해야 하는지 모르겠습니다.",
  },
  {
    value: "mismatch_authority",
    label: "기관이 설명한 내용과 실제 상황이 다르게 느껴집니다.",
  },
  {
    value: "overall_unclear",
    label: "전체적으로 문서의 의미를 이해하기 어렵습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE06_EXACT_SOURCE_OPTIONS = [
  { value: "traffic", label: "교통·운전 관련 기관에서 보낸 것으로 보입니다." },
  { value: "immigration", label: "출입국·외국인등록·거주 관련 기관에서 보낸 것으로 보입니다." },
  { value: "tax", label: "세무·국세·지자체 세금 관련 기관에서 보낸 것으로 보입니다." },
  { value: "labor", label: "고용·노동 관련 기관에서 보낸 것으로 보입니다." },
  { value: "court", label: "법원·경찰·검찰·행정 기관에서 보낸 것으로 보입니다." },
  { value: "business", label: "회사·사업장·거래 관련에서 받은 것으로 보입니다." },
  { value: "personal", label: "개인·대리인·우편 전달로 받은 것으로 보입니다." },
  { value: "source_other", label: "위에 없는 다른 곳에서 받은 것으로 보입니다." },
  {
    value: "cannot_tell",
    label: "발신처를 정확히 특정하기 어렵습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE06_KEY_PHRASE_OPTIONS = [
  { value: "title_header", label: "어떤 종류의 통지·문서인지부터 확인하고 싶습니다." },
  { value: "main_body", label: "기관이 요구한 내용·조치가 무엇인지 확인하고 싶습니다." },
  { value: "deadline_section", label: "언제까지 무엇을 해야 하는지 확인하고 싶습니다." },
  { value: "action_section", label: "지금 당장 무엇을 해야 하는지 확인하고 싶습니다." },
  { value: "signature_section", label: "어느 기관·누구에게 연락해야 하는지 확인하고 싶습니다." },
  { value: "phrase_other", label: "위에 없는 다른 부분이 가장 궁금합니다." },
  {
    value: "hard_to_point",
    label: "가장 막힌 부분을 정확히 짚기 어렵습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE06_REQUIRED_ACTION_OPTIONS = [
  { value: "submit_docs", label: "서류나 증빙을 제출해야 하는 것으로 보입니다." },
  { value: "attend_explain", label: "출석하거나 설명·소명해야 하는 것으로 보입니다." },
  { value: "pay_fee", label: "납부하거나 비용을 처리해야 하는 것으로 보입니다." },
  { value: "correct_info", label: "정보·내용을 수정하거나 보완해야 하는 것으로 보입니다." },
  { value: "wait_review", label: "검토·처리 결과를 기다려야 하는 것으로 보입니다." },
  { value: "action_other", label: "위에 없는 다른 조치를 요구하는 것으로 보입니다." },
  {
    value: "hard_to_tell",
    label: "기관이 요구하는 조치를 정확히 파악하기 어렵습니다.",
  },
];

const CASE06_RECEIPT_PATH_OPTIONS = [
  { value: "mail", label: "우편·등기로 받았습니다." },
  { value: "in_person", label: "직접 전달받았습니다." },
  { value: "email_message", label: "이메일·문자·메신저로 받았습니다." },
  { value: "agent", label: "대리인·회사·가족을 통해 받았습니다." },
  { value: "online_portal", label: "온라인·전자 시스템에서 확인했습니다." },
  { value: "path_other", label: "위에 없는 다른 경로로 받았습니다." },
  {
    value: "hard_to_recall",
    label: "어떻게 받았는지 정확히 떠올리기 어렵습니다.",
  },
];

const CASE06_BLOCKAGE_OPTIONS = [
  { value: "what_document", label: "문서가 무엇을 말하는지 이해하지 못했습니다." },
  { value: "what_action", label: "지금 무엇을 해야 하는지 모르겠습니다." },
  { value: "which_authority", label: "어느 기관·누구에게 연락해야 하는지 모르겠습니다." },
  { value: "deadline", label: "언제까지 무엇을 해야 하는지 모르겠습니다." },
  { value: "evidence", label: "어떤 자료를 준비해야 하는지 모르겠습니다." },
  { value: "next_step", label: "다음에 무엇을 확인해야 하는지 모르겠습니다." },
  {
    value: "hard_to_point",
    label: "가장 막힌 부분을 정확히 짚기 어렵습니다.",
  },
];

const CASE06_EVIDENCE_OPTIONS = [
  { value: "original_notice", label: "받은 문서·통지 원본을 가지고 있습니다." },
  { value: "message_email", label: "기관·상대방 문자나 이메일을 가지고 있습니다." },
  { value: "translation", label: "번역본이나 해석 자료를 가지고 있습니다." },
  { value: "photo_scan", label: "사진이나 스캔본을 가지고 있습니다." },
  { value: "related_docs", label: "관련 서류·증빙을 가지고 있습니다." },
  { value: "evidence_other", label: "위에 없는 다른 자료를 가지고 있습니다." },
  {
    value: "no_materials",
    label: "지금 확인할 수 있는 자료가 없습니다.",
  },
  {
    value: "hard_to_tell",
    label: "어떤 자료를 가지고 있는지 정확히 말하기 어렵습니다.",
  },
];

const CASE06_ACTUAL_CORE_OPTIONS = [
  { value: "payment", label: "납부가 현재 가장 핵심인 상황입니다." },
  { value: "attendance", label: "출석·소명이 현재 가장 핵심인 상황입니다." },
  { value: "supplement", label: "보완·추가 제출이 현재 가장 핵심인 상황입니다." },
  { value: "disposition", label: "처분·조치가 현재 가장 핵심인 상황입니다." },
  { value: "violation_notice", label: "위반·문제 통지가 현재 가장 핵심인 상황입니다." },
  { value: "still_unclear", label: "문서 내용이 여전히 불명확한 상황입니다." },
  {
    value: "hard_to_tell",
    label: "현재 핵심이 무엇인지 정확히 말하기 어렵습니다.",
  },
];

const CASE06_FINAL_GOAL_OPTIONS = [
  { value: "understand_document", label: "문서가 무엇을 말하는지 알고 싶습니다." },
  { value: "know_action", label: "지금 무엇을 해야 하는지 알고 싶습니다." },
  { value: "find_authority", label: "어느 기관·누구에게 연락해야 하는지 알고 싶습니다." },
  { value: "check_deadline", label: "기한과 다음 조치를 알고 싶습니다." },
  { value: "prepare_docs", label: "어떤 자료를 준비해야 하는지 알고 싶습니다." },
  { value: "expert", label: "전문가에게 상황을 전달하고 싶습니다." },
  {
    value: "hard_to_tell",
    label: "지금 무엇부터 확인해야 할지 정확히 말하기 어렵습니다.",
  },
];

const CASE06_LEGACY_OPTION_LABELS: Record<string, string> = {
  immigration: "출입국·외국인등록·거주 관련 기관에서 받았습니다",
  labor: "고용·노동 관련 기관에서 받았습니다",
  tax: "세무·국세·지자체 세금 관련 부서에서 받았습니다",
  court: "법원·경찰·검찰·행정 통지로 받았습니다",
  counterparty: "회사·거래처·개인에게서 받았습니다",
  understand: "무엇을 해야 하는지 먼저 알아야 한다는 느낌입니다",
  prepare: "서류를 제출하거나 보완해야 한다는 느낌입니다",
  fix: "문제를 해결하거나 조치를 취해야 한다는 느낌입니다",
  deadline: "기한 안에 무언가를 처리해야 한다는 느낌입니다",
  unsure: "문서가 무엇을 요구하는지 전혀 파악되지 않습니다",
  yes_clear: "대응·제출 기한 날짜가 문서에 있습니다",
  yes_unclear: "기한은 있는 것 같지만 날짜를 정확히 모르겠습니다",
  no: "기한 안내를 찾지 못했습니다",
  document: "문서에 적힌 내용이 무엇을 의미하는지",
  procedure: "어떤 조치나 절차를 해야 하는지",
  authority: "어느 기관에서 왔는지·누구에게 연락해야 하는지",
  unknown: "전체적으로 무엇이 문제인지",
  none: "없음",
  unclear: "문서 내용이 여전히 불명확합니다",
};

const CASE06_FIELD_OPTIONS: Record<string, { value: string; label: string }[]> = {
  profileDocumentSource: CASE06_SOURCE_OPTIONS,
  case06_documentNature: CASE06_DOCUMENT_NATURE_OPTIONS,
  profileCurrentGoal: CASE06_PERCEIVED_ACTION_OPTIONS,
  profileAuthorityGuidance: CASE06_DEADLINE_PRESENCE_OPTIONS,
  profilePerceivedIssue: CASE06_PERCEIVED_ISSUE_OPTIONS,
};

const CASE06_FIELD_OPTION_MAP: Record<string, { value: string; label: string }[]> = {
  ...CASE06_FIELD_OPTIONS,
  case06_exactSource: CASE06_EXACT_SOURCE_OPTIONS,
  case06_keyPhrase: CASE06_KEY_PHRASE_OPTIONS,
  case06_requiredAction: CASE06_REQUIRED_ACTION_OPTIONS,
  case06_receiptPath: CASE06_RECEIPT_PATH_OPTIONS,
  case06_blockage: CASE06_BLOCKAGE_OPTIONS,
  case06_evidence: CASE06_EVIDENCE_OPTIONS,
  case06_actualCore: CASE06_ACTUAL_CORE_OPTIONS,
  case06_finalGoal: CASE06_FINAL_GOAL_OPTIONS,
};

export function getCase06FieldOptionLabel(fieldId: string, value: string): string {
  const options = CASE06_FIELD_OPTION_MAP[fieldId] ?? CASE06_V11_FIELD_OPTIONS[fieldId];
  const matched = options?.find((option) => option.value === value);
  return matched?.label ?? value;
}

/** 질문 단위 option label lookup — flat value map 충돌 방지 */
export function getCaseOptionLabel(
  caseId: MasterCaseId | string,
  questionId: string,
  value: string,
): string {
  switch (caseId) {
    case "CASE_01": {
      const map: Record<string, { value: string; label: string }[]> = {
        case01_violationContent: CASE01_VIOLATION_CONTENT_OPTIONS,
        case01_actualSituation: CASE01_ACTUAL_SITUATION_OPTIONS,
        case01_factRelationship: CASE01_FACT_RELATIONSHIP_OPTIONS,
        case01_authorityDemand: CASE01_AUTHORITY_DEMAND_OPTIONS,
        case01_paymentDemandScope: CASE01_PAYMENT_DEMAND_SCOPE_OPTIONS,
        case01_supplementDemandScope: CASE01_SUPPLEMENT_DEMAND_SCOPE_OPTIONS,
        case01_customerResponded: CASE01_CUSTOMER_RESPONDED_OPTIONS,
        case01_responseDetail: CASE01_RESPONSE_DETAIL_OPTIONS,
        case01_authorityResponse: CASE01_AUTHORITY_RESPONSE_OPTIONS,
        case01_authorityDemandDetail: CASE01_AUTHORITY_DEMAND_DETAIL_OPTIONS,
        case01_deadline: CASE01_DEADLINE_OPTIONS,
        case01_blockage: CASE01_BLOCKAGE_UI_OPTIONS,
        case01_evidence: CASE01_EVIDENCE_OPTIONS,
        case01_finalGoal: CASE01_FINAL_GOAL_UI_OPTIONS,
        case01_confirmGoal: CASE01_CONFIRM_GOAL_OPTIONS,
      };
      const hit = map[questionId]?.find((o) => o.value === value);
      return hit?.label ?? value;
    }
    case "CASE_02":
      return getCase02FieldOptionLabel(questionId, value);
    case "CASE_03":
      return getCase03FieldOptionLabel(questionId, value);
    case "CASE_04":
      return getCase04FieldOptionLabel(questionId, value);
    case "CASE_05":
      return getCase05FieldOptionLabel(questionId, value);
    case "CASE_06":
      return getCase06FieldOptionLabel(questionId, value);
    default:
      return value;
  }
}

const CASE06_NATURE_TO_CASE: Partial<Record<string, MasterCaseId>> = {
  violation_notice: "CASE_01",
  payment_demand: "CASE_02",
  attendance_explain: "CASE_03",
  supplement_docs: "CASE_04",
  disposition_action: "CASE_05",
};

const CASE06_DEMAND_TO_CASE: Partial<Record<string, MasterCaseId>> = {
  respond_violation: "CASE_01",
  pay_fee: "CASE_02",
  attend_explain: "CASE_03",
  submit_docs: "CASE_04",
  respond_disposition: "CASE_05",
};

const CASE06_ACTION_TO_CASE: Partial<Record<string, MasterCaseId>> = {
  pay_fee: "CASE_02",
  attend_explain: "CASE_03",
  submit_docs: "CASE_04",
  correct_info: "CASE_04",
};

const CASE06_CORE_TO_CASE: Partial<Record<string, MasterCaseId>> = {
  payment: "CASE_02",
  attendance: "CASE_03",
  supplement: "CASE_04",
  disposition: "CASE_05",
  violation_notice: "CASE_01",
};

function inferCase06ReclassificationTarget(answers: ReviewAnswers): MasterCaseId | null {
  const recheck = answers.case06_unclearContentRecheck?.trim();
  if (recheck === "signal_violation") return "CASE_01";
  if (recheck === "signal_payment") return "CASE_02";
  if (recheck === "signal_attendance") return "CASE_03";
  if (recheck === "signal_submission") return "CASE_04";
  if (recheck === "signal_disposition") return "CASE_05";

  const candidate = answers.case06_requiredActionCandidate?.trim();
  if (candidate && CASE06_CANDIDATE_TO_TARGET_CASE[candidate]) {
    const mapped = CASE06_CANDIDATE_TO_TARGET_CASE[candidate];
    if (mapped && mapped !== "CASE_06") return mapped;
  }

  const nature = answers.case06_documentNature;
  if (nature && CASE06_NATURE_TO_CASE[nature]) {
    return CASE06_NATURE_TO_CASE[nature] ?? null;
  }

  const goal = answers.profileCurrentGoal;
  if (goal && CASE06_DEMAND_TO_CASE[goal]) {
    return CASE06_DEMAND_TO_CASE[goal] ?? null;
  }

  const required = answers.case06_requiredAction;
  if (required && CASE06_ACTION_TO_CASE[required]) {
    return CASE06_ACTION_TO_CASE[required] ?? null;
  }

  const core = answers.case06_actualCore;
  if (core && CASE06_CORE_TO_CASE[core]) {
    return CASE06_CORE_TO_CASE[core] ?? null;
  }

  return null;
}

function case06NeedsExactSource(answers: ReviewAnswers): boolean {
  const source = answers.profileDocumentSource;
  const issue = answers.profilePerceivedIssue;
  return (
    source === "unknown_agency" ||
    source === "cannot_identify" ||
    source === "other" ||
    issue === "why_received" ||
    issue === "mismatch_authority"
  );
}

function case06NeedsKeyPhrase(answers: ReviewAnswers): boolean {
  const issue = answers.profilePerceivedIssue;
  const nature = answers.case06_documentNature;
  return (
    issue === "overall_unclear" ||
    issue === "what_to_do" ||
    issue === "why_received" ||
    nature === "hard_to_classify"
  );
}

function case06NeedsRequiredAction(answers: ReviewAnswers): boolean {
  const goal = answers.profileCurrentGoal;
  const issue = answers.profilePerceivedIssue;
  const nature = answers.case06_documentNature;
  return (
    goal === "hard_to_tell" ||
    goal === "other" ||
    issue === "what_to_do" ||
    nature === "hard_to_classify"
  );
}

function case06NeedsReceiptPath(answers: ReviewAnswers): boolean {
  const source = answers.profileDocumentSource;
  return source === "non_admin" || source === "other";
}

function case06NeedsBlockage(answers: ReviewAnswers): boolean {
  const goal = answers.profileCurrentGoal;
  const issue = answers.profilePerceivedIssue;
  const deadline = answers.profileAuthorityGuidance;
  return (
    goal === "hard_to_tell" ||
    issue === "overall_unclear" ||
    deadline === "uncertain" ||
    deadline === "not_stated" ||
    deadline === "past_possible"
  );
}

function case06NeedsEvidence(answers: ReviewAnswers): boolean {
  const issue = answers.profilePerceivedIssue;
  const goal = answers.profileCurrentGoal;
  return (
    issue === "overall_unclear" ||
    issue === "what_to_do" ||
    issue === "situation_relation" ||
    goal === "hard_to_tell" ||
    Boolean(case06NeedsKeyPhrase(answers))
  );
}

function case06NeedsActualCore(answers: ReviewAnswers): boolean {
  if (inferCase06ReclassificationTarget(answers)) return false;
  const nature = answers.case06_documentNature;
  const goal = answers.profileCurrentGoal;
  return (
    nature === "hard_to_classify" ||
    goal === "hard_to_tell" ||
    answers.profilePerceivedIssue === "overall_unclear"
  );
}

function case06NeedsFinalGoal(answers: ReviewAnswers): boolean {
  return (
    answers.profileCurrentGoal === "hard_to_tell" ||
    answers.profilePerceivedIssue === "overall_unclear" ||
    answers.profileAuthorityGuidance === "not_stated" ||
    answers.profileAuthorityGuidance === "not_checked"
  );
}

export function shouldActivateCase06Path(answers: ReviewAnswers): boolean {
  if (isAdminCaseEntryQ1Complete(answers)) {
    return getQ1ResolvedCase(answers) === "CASE_06";
  }
  if (answers._case06Active === "1") return true;
  if (
    answers.profileDocumentSource &&
    answers.case06_documentNature &&
    answers.profileCurrentGoal &&
    answers.profileAuthorityGuidance &&
    answers.profilePerceivedIssue &&
    !answers.case01_violationContent &&
    !answers.case02_paymentSubject &&
    !answers.case03_authorityDemand &&
    !answers.case04_supplementTarget &&
    !answers.case05_dispositionType
  ) {
    return true;
  }
  return false;
}

export function isCase06Phase1Complete(answers: ReviewAnswers): boolean {
  if (!isCase06LegacyRestorePath(answers)) {
    return isCase06RedesignPhase1Complete(answers);
  }
  for (const fieldId of CASE06_LEGACY_PHASE1_FIELD_ORDER) {
    const options = CASE06_FIELD_OPTIONS[fieldId];
    if (!options || !isAdminVerifyChoiceFieldComplete(fieldId, answers, options)) {
      return false;
    }
  }
  if (case06NeedsDeadlineDate(answers)) return false;
  return true;
}

function appendCase06Phase1Questions(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  const phase1Questions: {
    id: string;
    label: string;
    options: { value: string; label: string }[];
  }[] = [
    {
      id: "case06_documentNature",
      label: "교통국에서 받은 문서는 어떤 내용이라고 들으셨나요?",
      options: CASE06_DOCUMENT_NATURE_OPTIONS,
    },
    {
      id: "profilePerceivedIssue",
      label: "지금 이 문서에서 가장 먼저 확인하고 싶은 것은 무엇인가요?",
      options: CASE06_PERCEIVED_ISSUE_OPTIONS,
    },
    {
      id: "profileDocumentSource",
      label: "이 문서의 내용을 어떻게 알게 되셨나요?",
      options: CASE06_SOURCE_OPTIONS,
    },
    {
      id: "profileCurrentGoal",
      label: "교통국에서는 이 문서를 받은 뒤 무엇을 하라고 안내했나요?",
      options: CASE06_PERCEIVED_ACTION_OPTIONS,
    },
    {
      id: "profileAuthorityGuidance",
      label: "언제까지 무엇을 해야 한다고 안내받으셨나요?",
      options: CASE06_DEADLINE_PRESENCE_OPTIONS,
    },
  ];

  for (const field of phase1Questions) {
    pushUnique(questions, {
      id: field.id,
      kind: "choice",
      label: field.label,
      options: field.options,
    });
    if (!answers[field.id]) return;
    if (field.id === "profileAuthorityGuidance") {
      appendCase06DeadlineDateTextIfNeeded(questions, answers);
      if (case06NeedsDeadlineDate(answers)) return;
    }
  }
}

function appendCase06Phase2Questions(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  if (case06NeedsExactSource(answers)) {
    pushUnique(questions, {
      id: "case06_exactSource",
      kind: "choice",
      label: "이 문서·통지는 어디에서 보낸 것으로 알고 계신가요?",
      options: CASE06_EXACT_SOURCE_OPTIONS,
    });
    if (!answers.case06_exactSource) return;
  }

  if (case06NeedsKeyPhrase(answers)) {
    pushUnique(questions, {
      id: "case06_keyPhrase",
      kind: "choice",
      label: "문서나 설명에서 기억나는 핵심 내용은 무엇인가요?",
      options: CASE06_KEY_PHRASE_OPTIONS,
    });
    if (!answers.case06_keyPhrase) return;
  }

  if (case06NeedsRequiredAction(answers)) {
    pushUnique(questions, {
      id: "case06_requiredAction",
      kind: "choice",
      label: "이 문서를 받은 뒤 실제로 무엇을 해야 한다고 이해하셨나요?",
      options: CASE06_REQUIRED_ACTION_OPTIONS,
    });
    if (!answers.case06_requiredAction) return;
  }

  if (case06NeedsReceiptPath(answers)) {
    pushUnique(questions, {
      id: "case06_receiptPath",
      kind: "choice",
      label: "이 문서·통지는 어떤 상황에서 받게 되셨나요?",
      options: CASE06_RECEIPT_PATH_OPTIONS,
    });
    if (!answers.case06_receiptPath) return;
  }

  if (case06NeedsActualCore(answers)) {
    pushUnique(questions, {
      id: "case06_actualCore",
      kind: "choice",
      label: "이 문서를 받기 직전에 실제로 어떤 일이 있었나요?",
      options: CASE06_ACTUAL_CORE_OPTIONS,
    });
    if (!answers.case06_actualCore) return;
  }

  if (case06NeedsBlockage(answers)) {
    pushUnique(questions, {
      id: "case06_blockage",
      kind: "choice",
      label: "지금 이 문서 사건에서 가장 막혀 있는 부분은 무엇인가요?",
      options: CASE06_BLOCKAGE_OPTIONS,
    });
    if (!answers.case06_blockage) return;
  }

  if (case06NeedsEvidence(answers)) {
    pushUnique(questions, {
      id: "case06_evidence",
      kind: "choice",
      label: "지금 확인할 수 있는 자료가 있나요?",
      options: CASE06_EVIDENCE_OPTIONS,
    });
    if (!answers.case06_evidence) return;
  }

  if (case06NeedsFinalGoal(answers)) {
    pushUnique(questions, {
      id: "case06_finalGoal",
      kind: "choice",
      label: "이 문서 사건에서 어떤 결과를 원하시나요?",
      options: CASE06_FINAL_GOAL_OPTIONS,
    });
  }
}

function appendCase06PathQuestions(
  questions: ProfileQuestion[],
  answers: ReviewAnswers,
  phase: AdminVerifyProfilePhase = 2,
): void {
  if (!isCase06LegacyRestorePath(answers)) {
    appendCase06RedesignPathQuestions(questions, answers, phase);
    return;
  }
  if (phase === 1) {
    appendCase06Phase1Questions(questions, answers);
    return;
  }
  appendCase06Phase2Questions(questions, answers);
}

function case06PathFieldsComplete(answers: ReviewAnswers): boolean {
  if (!isCase06Phase1Complete(answers)) return false;
  if (case06NeedsDeadlineDate(answers)) return false;
  if (case06NeedsExactSource(answers) && !answers.case06_exactSource) return false;
  if (case06NeedsKeyPhrase(answers) && !answers.case06_keyPhrase) return false;
  if (case06NeedsRequiredAction(answers) && !answers.case06_requiredAction) return false;
  if (case06NeedsReceiptPath(answers) && !answers.case06_receiptPath) return false;
  if (case06NeedsActualCore(answers) && !answers.case06_actualCore) return false;
  if (case06NeedsBlockage(answers) && !answers.case06_blockage) return false;
  if (case06NeedsEvidence(answers) && !answers.case06_evidence) return false;
  if (case06NeedsFinalGoal(answers) && !answers.case06_finalGoal) return false;
  return true;
}

export function isCase06PathComplete(answers: ReviewAnswers): boolean {
  if (!shouldActivateCase06Path(answers)) return false;
  if (!isCase06LegacyRestorePath(answers)) {
    if (isCase06LaunchSimplifiedSession(answers)) {
      return isCase06RedesignPhase1Complete(answers) && isCase06ExpertTerminal(answers);
    }
    return isCase06Phase2ChainComplete(answers);
  }
  return case06PathFieldsComplete(answers);
}

function deriveUnclearSignals(answers: ReviewAnswers): UnclearSignalCode[] {
  if (!shouldActivateCase06Path(answers) && !answers.profilePerceivedIssue) return [];
  const signals: UnclearSignalCode[] = [];

  if (
    answers.profileDocumentSource === "unknown_agency" ||
    answers.profileDocumentSource === "cannot_identify" ||
    answers.profileDocumentSource === "other" ||
    answers.profilePerceivedIssue === "why_received"
  ) {
    signals.push("UNCLEAR_SOURCE");
  }
  if (
    answers.profileCurrentGoal === "hard_to_tell" ||
    answers.profileCurrentGoal === "other" ||
    answers.profilePerceivedIssue === "what_to_do" ||
    answers.case06_documentNature === "hard_to_classify"
  ) {
    signals.push("UNCLEAR_ACTION");
  }
  const case06DeadlineText = answers[CASE06_DEADLINE_DATE_KEY]?.trim();
  if (
    answers.profileAuthorityGuidance === "specific_date" &&
    !case06DeadlineText
  ) {
    signals.push("UNCLEAR_DEADLINE");
  } else if (
    answers.profileAuthorityGuidance === "not_stated" ||
    answers.profileAuthorityGuidance === "uncertain" ||
    answers.profileAuthorityGuidance === "past_possible" ||
    answers.profilePerceivedIssue === "deadline_unclear"
  ) {
    signals.push("UNCLEAR_DEADLINE");
  }
  if (
    answers.profilePerceivedIssue === "overall_unclear" ||
    answers.profilePerceivedIssue === "why_received" ||
    answers.case06_documentNature === "hard_to_classify"
  ) {
    signals.push("UNCLEAR_DOCUMENT");
  }
  if (answers.profilePerceivedIssue === "what_to_do") {
    signals.push("UNCLEAR_PROCEDURE");
  }
  if (
    answers.case06_evidence === "no_materials" ||
    answers.case06_evidence === "hard_to_tell"
  ) {
    if (case06NeedsEvidence(answers)) {
      signals.push("UNCLEAR_EVIDENCE");
    }
  }

  return [...new Set(signals)];
}

function collectCase06Unknowns(answers: ReviewAnswers): string[] {
  const unknowns: string[] = [];
  if (!answers.profilePerceivedIssue) return unknowns;

  for (const code of deriveUnclearSignals(answers)) {
    const label = UNCLEAR_SIGNAL_LABELS[code];
    if (!unknowns.includes(label)) unknowns.push(label);
  }
  return unknowns;
}

function collectCase06RiskSignals(answers: ReviewAnswers): string[] {
  const risks: string[] = [];
  if (!answers.profilePerceivedIssue) return risks;

  if (
    answers.profileAuthorityGuidance === "uncertain" ||
    answers.profileAuthorityGuidance === "not_stated" ||
    answers.profileAuthorityGuidance === "past_possible"
  ) {
    risks.push("대응·제출 기한이 불명확함 — 확인 필요");
  }
  if (
    answers.profileCurrentGoal === "hard_to_tell" ||
    answers.profilePerceivedIssue === "overall_unclear" ||
    answers.case06_documentNature === "hard_to_classify"
  ) {
    risks.push("문서 요구 내용이 불명확함 — 추가 확인 필요");
  }
  return risks;
}

function classifyFromCase06Answers(answers: ReviewAnswers): {
  id: MasterCaseId;
  status: FactStatus;
  confidence: number;
  reason: string;
} | null {
  if (!shouldActivateCase06Path(answers) && !answers.profilePerceivedIssue) return null;

  const reclassified = inferCase06ReclassificationTarget(answers);
  if (reclassified) {
    const reasonByCase: Partial<Record<MasterCaseId, string>> = {
      CASE_01: "문서 성격·요구 내용이 위반·문제 통지로 확인됨",
      CASE_02: "문서 성격·요구 내용이 납부 요구로 확인됨",
      CASE_03: "문서 성격·요구 내용이 출석·소명 요구로 확인됨",
      CASE_04: "문서 성격·요구 내용이 보완·추가 제출 요구로 확인됨",
      CASE_05: "문서 성격·요구 내용이 처분·조치 통지로 확인됨",
    };
    const fromNature = answers.case06_documentNature && CASE06_NATURE_TO_CASE[answers.case06_documentNature];
    const fromDemand = answers.profileCurrentGoal && CASE06_DEMAND_TO_CASE[answers.profileCurrentGoal];
    const confidence = fromNature ? 0.82 : fromDemand ? 0.78 : 0.72;
    return {
      id: reclassified,
      status: "inferred",
      confidence,
      reason: reasonByCase[reclassified] ?? "CASE_06 답변 기반 사건 재분류",
    };
  }

  if (shouldActivateCase06Path(answers) || answers.profilePerceivedIssue) {
    return {
      id: "CASE_06",
      status: answers.case06_documentNature ? "inferred" : "candidate",
      confidence: answers.case06_documentNature ? 0.68 : 0.45,
      reason: "불명확한 행정문서 사건 경로",
    };
  }

  return null;
}

function appendPathQuestions(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  const situation = answers.situation as AdminSituation | undefined;
  if (!situation) return;

  if (situation === "pre_submission") {
    pushUnique(questions, {
      id: "profileCheckGoal",
      kind: "choice",
      label: "무엇을 확인하고 싶으신가요?",
      options: CHECK_GOAL_OPTIONS,
    });
    if (answers.profileCheckGoal) {
      pushUnique(questions, {
        id: "profileHasDocument",
        kind: "choice",
        label: "확인할 서류를 이미 가지고 있나요?",
        options: HAS_DOCUMENT_OPTIONS,
      });
    }
    if (answers.profileHasDocument === "yes") {
      pushUnique(questions, {
        id: "profileDocumentType",
        kind: "choice",
        label: "어떤 서류를 확인하시나요?",
        options: DOCUMENT_TYPE_OPTIONS,
      });
    }
    return;
  }

  if (situation === "received_document") {
    pushUnique(questions, {
      id: "profileDocumentSource",
      kind: "choice",
      label: "어디서 서류를 받았나요?",
      options: SOURCE_OPTIONS,
    });
    if (answers.profileDocumentSource) {
      pushUnique(questions, {
        id: "profileReceivedReason",
        kind: "choice",
        label: "어떤 이유로 서류를 받았나요?",
        options: RECEIVED_REASON_OPTIONS,
      });
    }
    if (answers.profileReceivedReason) {
      pushUnique(questions, {
        id: "profileProcessStage",
        kind: "choice",
        label: "현재 어느 단계인가요?",
        options: PROCESS_STAGE_OPTIONS,
      });
    }
    if (answers.profileProcessStage) {
      pushUnique(questions, {
        id: "profileActionsTaken",
        kind: "choice",
        label: "지금까지 어떤 조치를 췄나요?",
        options: ACTION_TAKEN_OPTIONS,
      });
    }
    if (answers.profileActionsTaken) {
      pushUnique(questions, {
        id: "profileCurrentGoal",
        kind: "choice",
        label: "지금 가장 필요한 것은 무엇인가요?",
        options: CURRENT_GOAL_OPTIONS,
      });
    }
    return;
  }

  if (situation === "post_submission_problem") {
    pushUnique(questions, {
      id: "profileProblemType",
      kind: "choice",
      label: "어떤 문제가 발생했나요?",
      options: PROBLEM_TYPE_OPTIONS,
    });
    if (answers.profileProblemType) {
      pushUnique(questions, {
        id: "profileProblemDiscovery",
        kind: "choice",
        label: "문제를 어떻게 알게 되었나요?",
        options: PROBLEM_DISCOVERY_OPTIONS,
      });
    }
    if (answers.profileProblemDiscovery) {
      pushUnique(questions, {
        id: "profileProcessStage",
        kind: "choice",
        label: "현재 어느 단계인가요?",
        options: PROCESS_STAGE_OPTIONS,
      });
    }
    if (answers.profileProcessStage) {
      pushUnique(questions, {
        id: "profileActionsTaken",
        kind: "choice",
        label: "지금까지 어떤 조치를 취했나요?",
        options: ACTION_TAKEN_OPTIONS,
      });
    }
    if (
      answers.profileActionsTaken &&
      (answers.profileProblemType === "rejected" || answers.profileProblemDiscovery === "notice")
    ) {
      pushUnique(questions, {
        id: "profileAuthorityGuidance",
        kind: "choice",
        label: "기관·상대방 안내를 받았나요?",
        options: AUTHORITY_GUIDANCE_OPTIONS,
      });
    }
    if (answers.profileActionsTaken || answers.profileAuthorityGuidance) {
      pushUnique(questions, {
        id: "profileCurrentGoal",
        kind: "choice",
        label: "지금 가장 필요한 것은 무엇인가요?",
        options: CURRENT_GOAL_OPTIONS,
      });
    }
    return;
  }

  if (situation === "unknown_problem" || situation === "unsure") {
    pushUnique(questions, {
      id: "profilePerceivedIssue",
      kind: "choice",
      label: "지금 이 통지에서 가장 막히거나 불명확한 부분은 무엇인가요?",
      options: [
        { value: "document", label: "문서에 적힌 내용이 무엇을 의미하는지" },
        { value: "procedure", label: "어떤 조치나 절차를 해야 하는지" },
        { value: "deadline", label: "언제까지 무엇을 해야 하는지" },
        { value: "authority", label: "어느 기관에서 왔는지·누구에게 연락해야 하는지" },
        { value: "unknown", label: "전체적으로 무엇이 문제인지" },
      ],
    });
    if (
      answers.profilePerceivedIssue &&
      (answers.profilePerceivedIssue === "document" ||
        answers.profilePerceivedIssue === "unknown")
    ) {
      pushUnique(questions, {
        id: "profileHasDocument",
        kind: "choice",
        label: "지금 확인할 수 있는 자료가 있나요?",
        options: HAS_DOCUMENT_OPTIONS,
      });
    }
    if (answers.profileHasDocument === "yes") {
      pushUnique(questions, {
        id: "profileDocumentType",
        kind: "choice",
        label: "어떤 문서를 받았나요?",
        options: DOCUMENT_TYPE_OPTIONS,
      });
    }
    if (answers.profilePerceivedIssue === "authority") {
      pushUnique(questions, {
        id: "profileDocumentSource",
        kind: "choice",
        label: "이 문서·통지는 어디에서 왔나요?",
        options: SOURCE_OPTIONS,
      });
    }
    if (answers.profilePerceivedIssue === "procedure") {
      pushUnique(questions, {
        id: "profileCurrentGoal",
        kind: "choice",
        label: "지금 이 문서와 관련해 무엇이 가장 급한가요?",
        options: CURRENT_GOAL_OPTIONS,
      });
    }
  }
}

function isPathComplete(answers: ReviewAnswers): boolean {
  const situation = answers.situation;
  if (!situation) return false;
  if (
    needsSituationNote(situation) &&
    !answers.situationNote?.trim() &&
    !answers[CASE_CUSTOMER_INPUT_KEY]?.trim()
  ) {
    return false;
  }

  if (situation === "pre_submission") {
    if (!answers.profileCheckGoal || !answers.profileHasDocument) return false;
    if (answers.profileHasDocument === "yes" && !answers.profileDocumentType) return false;
    return true;
  }
  if (situation === "received_document") {
    return Boolean(
      answers.profileDocumentSource &&
        answers.profileReceivedReason &&
        answers.profileProcessStage &&
        answers.profileActionsTaken &&
        answers.profileCurrentGoal,
    );
  }
  if (situation === "post_submission_problem") {
    const needsAuthority =
      answers.profileProblemType === "rejected" || answers.profileProblemDiscovery === "notice";
    if (!answers.profileProblemType || !answers.profileProblemDiscovery) return false;
    if (!answers.profileProcessStage || !answers.profileActionsTaken) return false;
    if (needsAuthority && !answers.profileAuthorityGuidance) return false;
    return Boolean(answers.profileCurrentGoal);
  }
  if (situation === "unknown_problem" || situation === "unsure") {
    if (!answers.profilePerceivedIssue) return false;
    if (
      (answers.profilePerceivedIssue === "document" ||
        answers.profilePerceivedIssue === "unknown") &&
      !answers.profileHasDocument
    ) {
      return false;
    }
    if (answers.profileHasDocument === "yes" && !answers.profileDocumentType) return false;
    if (answers.profilePerceivedIssue === "authority" && !answers.profileDocumentSource) {
      return false;
    }
    if (answers.profilePerceivedIssue === "procedure" && !answers.profileCurrentGoal) return false;
    return true;
  }
  return false;
}

export function buildAdminVerifyProfileQuestions(
  answers: ReviewAnswers,
  followUpDefs: Record<string, ProfileQuestion>,
  docsFollowUpOptions: {
    mismatch: { value: string; title: string }[];
    unknown: { value: string; title: string }[];
    other: { value: string; title: string }[];
  },
  profilePhase: AdminVerifyProfilePhase = 1,
): ProfileQuestion[] {
  const questions: ProfileQuestion[] = [];
  const profileAnswers = ensureCustomerInputSeed(answers);

  pushUnique(questions, {
    id: ADMIN_CASE_ENTRY_Q1_KEY,
    kind: "choice",
    label: ADMIN_CASE_ENTRY_Q1_LABEL,
    options: ADMIN_CASE_ENTRY_Q1_OPTIONS,
  });

  if (!isAdminCaseEntryQ1Complete(answers)) return questions;

  const activeCase = getAdminVerifyActiveQuestionCase(answers, profilePhase);
  const case02Active = activeCase === "CASE_02";
  const case03Active = activeCase === "CASE_03";
  const case04Active = activeCase === "CASE_04";
  const case05Active = activeCase === "CASE_05";
  const case01Active = activeCase === "CASE_01";
  const case06Active = activeCase === "CASE_06";
  const classifiedCaseActive =
    case01Active || case02Active || case03Active || case04Active || case05Active || case06Active;

  if (case02Active) {
    appendCase02PathQuestions(questions, seedCase02AnswersFromCustomerInput(answers), profilePhase);
    if (profilePhase === 1) {
      if (!isCase02Phase1Complete(answers)) return questions;
      return questions;
    }
    if (!isCase02PathComplete(answers)) return questions;
  } else if (case03Active) {
    appendCase03PathQuestions(questions, answers, profilePhase);
    if (profilePhase === 1) {
      if (!isCase03Phase1Complete(answers)) return questions;
      return questions;
    }
    if (!isCase03PathComplete(answers)) return questions;
  } else if (case04Active) {
    appendCase04PathQuestions(questions, answers, profilePhase);
    if (profilePhase === 1) {
      if (!isCase04Phase1Complete(answers)) return questions;
      return questions;
    }
    if (!isCase04PathComplete(answers)) return questions;
  } else if (case05Active) {
    appendCase05PathQuestions(questions, answers, profilePhase);
    if (profilePhase === 1) {
      if (!isCase05Phase1Complete(answers)) return questions;
      return questions;
    }
    if (!isCase05PathComplete(answers)) return questions;
  } else if (case01Active) {
    appendCase01PathQuestions(questions, answers, profilePhase);
    if (profilePhase === 1) {
      if (!isCase01Phase1Complete(answers)) return questions;
      return questions;
    }
    if (!isCase01PathComplete(answers)) return questions;
  } else if (case06Active) {
    appendCase06PathQuestions(questions, answers, profilePhase);
    if (profilePhase === 1) {
      if (!isCase06Phase1Complete(answers)) return questions;
      return questions;
    }
    if (!isCase06PathComplete(answers)) return questions;
  } else {
    appendPathQuestions(questions, profileAnswers);
    if (!isPathComplete(profileAnswers)) return questions;
  }

  if (classifiedCaseActive) {
    return questions;
  }

  if (
    shouldAskDocs(answers) &&
    !answers.case01_factRelationship &&
    !answers.case02_situationMatch &&
    !answers.case03_factRelationship &&
    !answers.case04_submissionRelation &&
    !answers.case05_factRelationship
  ) {
    pushUnique(questions, {
      id: "docs",
      kind: "followUpChoice",
      label: "서류에 적힌 내용이 현재 실제 상황과 일치하나요?",
      options: [
        { value: "yes", title: "네, 실제 상황과 일치합니다" },
        { value: "no", title: "실제 상황과 다른 부분이 있습니다" },
        { value: "unknown", title: "잘 모르겠습니다" },
        ADMIN_OTHER_OPTION,
      ],
      placeholder: "실제 상황과 관련해 추가로 확인할 내용을 입력해주세요.",
    });
    appendDocsFollowUp(questions, answers.docs, docsFollowUpOptions);
  }

  if (shouldAskContentCheck(answers)) {
    pushUnique(questions, {
      id: "contentCheck",
      kind: "followUpChoice",
      label: "필요한 내용이 빠지거나 잘못 적힌 부분은 없나요?",
      options: [
        { value: "ok", title: "확인했고, 문제 없습니다" },
        { value: "has_issue", title: "빠지거나 잘못된 부분이 있습니다" },
        { value: "not_checked", title: "아직 확인하지 못했습니다" },
        { value: "unsure", title: "무엇을 확인해야 하는지 모르겠습니다" },
        ADMIN_OTHER_OPTION,
      ],
      placeholder: "서류 내용과 관련해 직접 확인하고 싶은 부분을 적어주세요.",
    });
  }

  if (shouldAskFormatProof(answers)) {
    pushUnique(questions, {
      id: "formatProofCheck",
      kind: "followUpChoice",
      label: "서류의 형식과 증빙까지 확인하셨나요?",
      options: [
        { value: "complete", title: "필요한 부분까지 확인했습니다" },
        { value: "partial", title: "일부만 확인했습니다" },
        { value: "not_checked", title: "아직 확인하지 못했습니다" },
        { value: "unsure", title: "무엇이 필요한지 모르겠습니다" },
        ADMIN_OTHER_OPTION,
      ],
      placeholder: "형식·증빙과 관련해 추가로 확인할 내용을 입력해주세요.",
    });
  }

  if (shouldAskSubmission(answers)) {
    pushUnique(questions, {
      id: "submissionCheck",
      kind: "followUpChoice",
      label: "어디에, 어떻게 제출할지 확인하셨나요?",
      options: [
        { value: "complete", title: "제출기관과 방법까지 확인했습니다" },
        { value: "agency_only", title: "제출기관만 확인했습니다" },
        { value: "not_checked", title: "아직 확인하지 못했습니다" },
        { value: "unsure", title: "어디에 제출해야 하는지 모르겠습니다" },
        ADMIN_OTHER_OPTION,
      ],
      placeholder: "제출 경로와 관련해 직접 확인하고 싶은 부분을 적어주세요.",
    });
  }

  if (shouldAskDeadline(answers)) {
    pushUnique(questions, {
      id: "deadline",
      kind: "followUpChoice",
      label: "제출기한이나 유효기간을 확인하셨나요?",
      options: [
        { value: "confirmed", title: "확인했습니다" },
        { value: "uncertain", title: "확인했지만 확실하지 않습니다" },
        { value: "not_checked", title: "아직 확인하지 못했습니다" },
        { value: "unsure", title: "기한이나 유효기간이 있는지 모르겠습니다" },
        ADMIN_OTHER_OPTION,
      ],
      placeholder: "기한·유효기간과 관련해 추가로 확인할 내용을 입력해주세요.",
    });
  }

  appendLegacyFollowUps(questions, answers, followUpDefs);

  return questions;
}

export type FieldAssessment = "ok" | "issue" | "unknown" | "not_assessed";

export function assessLegacyField(
  answers: ReviewAnswers,
  fieldId: string,
  value: string | undefined,
): FieldAssessment {
  if (!wasFieldAsked(answers, fieldId)) return "not_assessed";
  if (!value) return "unknown";

  if (fieldId === "docs") {
    if (value === "yes") return "ok";
    if (value === "no") return "issue";
    return "unknown";
  }
  if (fieldId === "contentCheck") {
    if (value === "ok") return "ok";
    if (value === "has_issue") return "issue";
    return "unknown";
  }
  if (fieldId === "formatProofCheck") {
    if (value === "complete") return "ok";
    if (value === "partial") return "issue";
    return "unknown";
  }
  if (fieldId === "submissionCheck") {
    if (value === "complete") return "ok";
    if (value === "agency_only") return "issue";
    return "unknown";
  }
  if (fieldId === "deadline") {
    if (value === "confirmed") return "ok";
    if (value === "uncertain") return "issue";
    return "unknown";
  }
  return "unknown";
}

// ─── Case Resolution Engine V1 (internal — not shown raw to customers) ───

export type FactStatus = "confirmed" | "candidate" | "inferred" | "unknown";

export type ProfileFact<T = string> = {
  value: T | null;
  status: FactStatus;
  /** Source answer field id — for traceability only */
  source?: string;
};

export type MasterCaseId =
  | "CASE_01"
  | "CASE_02"
  | "CASE_03"
  | "CASE_04"
  | "CASE_05"
  | "CASE_06"
  | "UNIVERSAL";

export const MASTER_CASE_LABELS: Record<MasterCaseId, string> = {
  CASE_01: "위반·문제 통지",
  CASE_02: "납부 요구",
  CASE_03: "출석·소명 요구",
  CASE_04: "보완 요구",
  CASE_05: "처분·조치 통지",
  CASE_06: "불명확한 행정문서",
  UNIVERSAL: "사건 유형 확인 중",
};

export type CaseReclassificationRecord = {
  from: MasterCaseId;
  to: MasterCaseId;
  reason: string;
  atAnswerField?: string;
};

export type CaseResolutionProfile = {
  situation: ProfileFact<AdminSituation>;
  caseAnchor: ProfileFact<string>;
  authority: ProfileFact<string>;
  document: ProfileFact<string>;
  object: ProfileFact<string>;
  event: ProfileFact<string>;
  authorityClaim: ProfileFact<string>;
  authorityReason: ProfileFact<string>;
  customerStatement: ProfileFact<string>;
  actualSituation: ProfileFact<string>;
  factRelationship: ProfileFact<string>;
  customerAction: ProfileFact<string>;
  authorityResponse: ProfileFact<string>;
  currentStage: ProfileFact<string>;
  effectiveDate: ProfileFact<string>;
  deadline: ProfileFact<string>;
  currentBlockage: ProfileFact<string>;
  evidence: ProfileFact<string>;
  goal: ProfileFact<string>;
  caseClassification: ProfileFact<MasterCaseId>;
  confidence: ProfileFact<number>;
  unknown: string[];
  riskSignals: string[];
  reclassificationHistory: CaseReclassificationRecord[];
  /** CASE_03 반복 소명 라운드 — 동일 사건 내 추적 */
  explanationRound?: number;
  responseRound?: number;
  /** CASE_04 재보완 라운드 — 동일 사건 내 추적 */
  supplementRound?: number;
  supplementResponseRound?: number;
  /** CASE_05 처분 후속 라운드 — 동일 사건 내 추적 */
  dispositionResponseRound?: number;
  dispositionReviewRound?: number;
};

export type CaseResolutionQuestionFocus =
  | "authorityClaim"
  | "authorityReason"
  | "deadline"
  | "evidence"
  | "actualSituation"
  | "customerAction"
  | "authorityResponse"
  | "goal"
  | "currentBlockage"
  | "caseClassification";

export type CaseResolutionQuestionPriority = {
  focus: CaseResolutionQuestionFocus;
  /** Maps to existing question id when available */
  questionId?: string;
  reason: string;
  rank: number;
};

const CASE_RESOLUTION_META_JSON_KEY = "case_resolution_json";
const CASE_RESOLUTION_CLASSIFICATION_KEY = "case_resolution_classification";
const CASE_RESOLUTION_ANCHOR_KEY = "case_resolution_anchor";
const CASE_CUSTOMER_INPUT_KEY = "caseCustomerInput";
const INFERRED_FIELDS_KEY = "_inferredFields";

function parseInferredFields(answers: ReviewAnswers): Set<string> {
  try {
    const raw = answers[INFERRED_FIELDS_KEY];
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function isAnswerFieldInferred(answers: ReviewAnswers, fieldId: string): boolean {
  return parseInferredFields(answers).has(fieldId);
}

function inferAuthoritySourceFromText(text: string): string | null {
  if (/출입국|이민|체류|비자|거주/.test(text)) return "immigration";
  if (/노동|근로|회사|고용/.test(text)) return "labor";
  if (/세무|세금|납세/.test(text)) return "tax";
  if (/거래|계약|상대|거래처/.test(text) && !/행정|기관|교통|출입국/.test(text)) {
    return "counterparty";
  }
  if (/법원|검찰|행정심판|수사/.test(text)) return "court";
  return null;
}

function inferSituationFromText(text: string): AdminSituation {
  if (/제출.?전|계약.?전|서명.?전|확인.?하려|제출.?예정/.test(text)) return "pre_submission";
  if (/제출.?후|반려|불승인|보완.?후|재제출.?후|접수.?후.?문제/.test(text)) {
    return "post_submission_problem";
  }
  if (/받았|통지|연락|안내.?받|서류|우편|문서|통보/.test(text)) return "received_document";
  if (/모르겠|불명|이상한|무엇인지/.test(text)) return "unsure";
  return "unsure";
}

function inferReceivedReasonFromText(text: string, situation: AdminSituation): string | null {
  if (situation !== "received_document") return null;
  if (/보완|추가.?제출|재제출/.test(text)) return "supplement";
  if (/반려|불승인|거부/.test(text)) return "rejection";
  if (/계약|거래/.test(text)) return "contract";
  if (/연락|처음|통보|안내|전화|메일|문의/.test(text)) return "review_request";
  if (/위반|통지서|과태료|납부/.test(text)) return "rejection";
  return null;
}

function inferProcessStageFromText(text: string): string | null {
  if (/처음|최초|방금|오늘|연락.?왔|통보.?받/.test(text) && !/제출.?했|이미.?냈|소명.?했/.test(text)) {
    return "before_action";
  }
  if (/제출.?했|접수.?했|보냈/.test(text)) return "submitted";
  if (/기다리|답변.?대기|응답.?없/.test(text)) return "waiting";
  if (/검토|협의|상담.?중/.test(text)) return "in_review";
  return null;
}

function inferProblemTypeFromText(text: string): string | null {
  if (/반려|불승인|보완.?요구/.test(text)) return "rejected";
  if (/불일치|다르|틀렸/.test(text)) return "mismatch";
  if (/누락|빠졌|오류|잘못/.test(text)) return "missing";
  if (/형식|증빙|공증|번역/.test(text)) return "format";
  if (/기한|마감|늦/.test(text)) return "deadline";
  return null;
}

function inferProblemDiscoveryFromText(text: string): string | null {
  if (/안내.?받|통지|연락|통보/.test(text)) return "notice";
  if (/온라인|포털|시스템|웹/.test(text)) return "portal";
  return null;
}

function inferPerceivedIssueFromText(text: string): string | null {
  if (/서류|문서|내용|형식/.test(text)) return "document";
  if (/절차|제출.?방법|어떻게/.test(text)) return "procedure";
  if (/기한|마감/.test(text)) return "deadline";
  if (/기관|상대/.test(text)) return "authority";
  if (/모르겠|불명/.test(text)) return "unknown";
  return null;
}

function inferHasDocumentFromText(text: string): string | null {
  if (/서류.?없|아직.?없|없습니다/.test(text)) return "no";
  if (/받았|가지고|있습니다|통지서|문서/.test(text)) return "yes";
  return null;
}

export function inferSituationProfileFromCustomerInput(text: string): {
  patches: Partial<ReviewAnswers>;
  inferredFields: string[];
} {
  const trimmed = text.trim();
  if (!trimmed) return { patches: {}, inferredFields: [] };

  const patches: Partial<ReviewAnswers> = {};
  const inferredFields: string[] = [];

  const situation = inferSituationFromText(trimmed);
  patches.situation = situation;
  inferredFields.push("situation");

  const stage = deriveStageFromSituation(situation);
  if (stage) {
    patches.stage = stage;
    inferredFields.push("stage");
  }

  const authority = inferAuthoritySourceFromText(trimmed);
  if (authority) {
    patches.profileDocumentSource = authority;
    inferredFields.push("profileDocumentSource");
  }

  const receivedReason = inferReceivedReasonFromText(trimmed, situation);
  if (receivedReason) {
    patches.profileReceivedReason = receivedReason;
    inferredFields.push("profileReceivedReason");
  }

  const processStage = inferProcessStageFromText(trimmed);
  if (processStage) {
    patches.profileProcessStage = processStage;
    inferredFields.push("profileProcessStage");
  }

  if (situation === "post_submission_problem") {
    const problemType = inferProblemTypeFromText(trimmed);
    if (problemType) {
      patches.profileProblemType = problemType;
      inferredFields.push("profileProblemType");
    }
    const discovery = inferProblemDiscoveryFromText(trimmed);
    if (discovery) {
      patches.profileProblemDiscovery = discovery;
      inferredFields.push("profileProblemDiscovery");
    }
  }

  if (situation === "unsure" || situation === "unknown_problem") {
    const perceived = inferPerceivedIssueFromText(trimmed);
    if (perceived) {
      patches.profilePerceivedIssue = perceived;
      inferredFields.push("profilePerceivedIssue");
    }
    const hasDoc = inferHasDocumentFromText(trimmed);
    if (hasDoc) {
      patches.profileHasDocument = hasDoc;
      inferredFields.push("profileHasDocument");
    }
  }

  if (situation === "pre_submission") {
    const hasDoc = inferHasDocumentFromText(trimmed);
    if (hasDoc) {
      patches.profileHasDocument = hasDoc;
      inferredFields.push("profileHasDocument");
    }
  }

  return { patches, inferredFields };
}

export function applyCustomerInputToAnswers(
  answers: ReviewAnswers,
  customerInput: string,
): ReviewAnswers {
  const trimmed = customerInput.trim();
  if (!trimmed) return answers;

  const { patches, inferredFields } = inferSituationProfileFromCustomerInput(trimmed);
  const case02Authority = inferCase02DemandAuthorityFromText(trimmed);
  if (case02Authority && !answers.case02_demandAuthority) {
    patches.case02_demandAuthority = case02Authority;
    inferredFields.push("case02_demandAuthority");
  }
  const next: ReviewAnswers = {
    ...answers,
    [CASE_CUSTOMER_INPUT_KEY]: trimmed,
    ...patches,
    [INFERRED_FIELDS_KEY]: JSON.stringify(inferredFields),
  };
  return attachCaseResolutionSnapshot(next);
}

function fact<T>(
  value: T | null | undefined,
  status: FactStatus,
  source?: string,
): ProfileFact<T> {
  if (value === null || value === undefined || value === "") {
    return { value: null, status: "unknown", source };
  }
  return { value, status, source };
}

function customerTextFromAnswers(answers: ReviewAnswers): string {
  const initial = answers[CASE_CUSTOMER_INPUT_KEY]?.trim();
  const note = answers.situationNote?.trim();
  return initial || note || "";
}

const SOURCE_LABELS: Record<string, string> = {
  government_agency: "정부·공공기관",
  specific_agency: "특정 행정기관",
  non_admin: "비행정기관",
  unknown_agency: "발신기관 불명확",
  cannot_identify: "발신처 확인 어려움",
  immigration: "출입국·거주 관련 기관",
  labor: "노동·고용 관련 기관",
  tax: "세무 관련 기관",
  court: "법원·수사·행정 통지",
  counterparty: "상대방·거래처",
  other: "기타 기관·상대방",
};

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  admin_doc: "행정기관 제출서류",
  contract: "계약서",
  corporate: "법인·투자 서류",
  labor: "노동·고용 서류",
  permit: "인허가 서류",
  tax: "세무 서류",
  translation: "번역·공증·인증 서류",
  other: "기타 서류",
};

const RECEIVED_REASON_EVENT: Record<string, string> = {
  review_request: "검토·확인 요청",
  supplement: "보완·추가 제출 요청",
  rejection: "반려·불승인 통지",
  contract: "계약·거래 관련",
  other: "기타 수령 사유",
};

const PROBLEM_TYPE_EVENT: Record<string, string> = {
  rejected: "반려·불승인·보완 요청",
  mismatch: "서류 내용 불일치",
  missing: "누락·오류",
  format: "형식·증빙 문제",
  deadline: "기한·절차 문제",
  other: "기타 문제",
};

function inferAnchorCandidate(text: string, answers: ReviewAnswers): string | null {
  const combined = text.trim();
  if (combined.length >= 8) {
    return combined.length > 80 ? `${combined.slice(0, 77)}…` : combined;
  }
  const parts: string[] = [];
  if (answers.profileDocumentSource) {
    parts.push(SOURCE_LABELS[answers.profileDocumentSource] ?? answers.profileDocumentSource);
  }
  if (answers.profileReceivedReason) {
    parts.push(RECEIVED_REASON_EVENT[answers.profileReceivedReason] ?? "");
  }
  if (answers.profileProblemType) {
    parts.push(PROBLEM_TYPE_EVENT[answers.profileProblemType] ?? "");
  }
  const joined = parts.filter(Boolean).join(" · ");
  return joined.length > 0 ? joined : null;
}

function keywordCaseSignals(text: string): MasterCaseId[] {
  const t = text.toLowerCase();
  const hits: MasterCaseId[] = [];
  if (/위반|불승인|반려|과태료.?통지|벌점/.test(t)) hits.push("CASE_01");
  if (/납부|벌금|과태료|고지서|납부기한|납부.?요구/.test(t)) hits.push("CASE_02");
  if (/출석|소명|조사.?요구|신문.?요구/.test(t)) hits.push("CASE_03");
  if (/보완|재제출|추가.?제출|다시.?내/.test(t)) hits.push("CASE_04");
  if (/처분|조치.?통지|결정.?통지|행정.?처분/.test(t)) hits.push("CASE_05");
  if (/모르겠|불명확|이상한.?종이|무슨.?문서/.test(t)) hits.push("CASE_06");
  return hits;
}

export function getQ1ResolvedCase(answers: ReviewAnswers): MasterCaseId | null {
  const entry = answers[ADMIN_CASE_ENTRY_Q1_KEY];
  if (!entry) return null;
  if (entry === "other") {
    const note =
      answers[ADMIN_CASE_ENTRY_Q1_OTHER_KEY]?.trim() || customerTextFromAnswers(answers);
    const hits = keywordCaseSignals(note);
    return hits[0] ?? "CASE_06";
  }
  const mapped = ADMIN_CASE_ENTRY_Q1_TO_CASE[entry];
  return (mapped as MasterCaseId | undefined) ?? null;
}

function readProfileCaseClassification(answers: ReviewAnswers): MasterCaseId | null {
  const stored = readStoredCaseResolutionProfile(answers);
  const classified =
    stored?.caseClassification?.value ??
    buildCaseResolutionProfile(answers).caseClassification.value ??
    null;
  return classified;
}

/** 질문 UI 라우팅용 CASE (classification과 분리). */
export function getAdminVerifyActiveQuestionCase(
  answers: ReviewAnswers,
  profilePhase: AdminVerifyProfilePhase = 2,
): MasterCaseId | null {
  const q1Case = getQ1ResolvedCase(answers);
  if (!q1Case) return null;
  if (profilePhase !== 2 || q1Case !== "CASE_06") return q1Case;

  if (isCase06LegacyRestorePath(answers)) {
    return getEffectiveAdminVerifyCase(answers, profilePhase);
  }

  if (!isCase06Phase2ChainComplete(answers)) return "CASE_06";
  if (!isCase06BridgeSnapshotCommitted(answers)) return "CASE_06";
  if (isCase06ExpertTerminal(answers)) return "CASE_06";

  const bridgeTarget = answers[CASE06_BRIDGE_TARGET_CASE_KEY]?.trim() as MasterCaseId | undefined;
  if (bridgeTarget && bridgeTarget !== "CASE_06" && bridgeTarget !== "UNIVERSAL") {
    return bridgeTarget;
  }

  const classified = readProfileCaseClassification(answers);
  if (classified && classified !== "CASE_06" && classified !== "UNIVERSAL") {
    return classified;
  }
  return "CASE_06";
}

/** Phase2 — Q1이 CASE_06이어도 Profile 재분류가 있으면 실제 classification 경로를 따른다. */
export function getEffectiveAdminVerifyCase(
  answers: ReviewAnswers,
  profilePhase: AdminVerifyProfilePhase = 2,
): MasterCaseId | null {
  const q1Case = getQ1ResolvedCase(answers);
  if (!q1Case) return null;
  if (profilePhase !== 2 || q1Case !== "CASE_06") return q1Case;

  const classified = readProfileCaseClassification(answers);
  if (classified && classified !== "CASE_06" && classified !== "UNIVERSAL") {
    return classified;
  }
  return q1Case;
}

function isCase06ReclassifiedToCase02(answers: ReviewAnswers): boolean {
  if (getQ1ResolvedCase(answers) !== "CASE_06") return false;
  return readProfileCaseClassification(answers) === "CASE_02";
}

/** Q1=CASE_06 브릿지 확정 후 target native CASE 질문 세트로 전환된 상태. */
function isCase06BridgedToNativeCase(
  answers: ReviewAnswers,
  nativeCase: MasterCaseId,
): boolean {
  if (getQ1ResolvedCase(answers) !== "CASE_06") return false;
  if (isCase06LegacyRestorePath(answers)) return false;
  if (!isCase06BridgeSnapshotCommitted(answers)) return false;
  if (isCase06ExpertTerminal(answers)) return false;
  return getAdminVerifyActiveQuestionCase(answers, 2) === nativeCase;
}

function isCase02PathActiveForProfiling(answers: ReviewAnswers): boolean {
  return shouldActivateCase02Path(answers) || isCase06ReclassifiedToCase02(answers);
}

function seedCase02AnswersFromCase06Handoff(answers: ReviewAnswers): ReviewAnswers {
  if (getQ1ResolvedCase(answers) === "CASE_06" && !isCase06LegacyRestorePath(answers)) {
    if (!isCase06Phase2ChainComplete(answers) || !isCase06BridgeSnapshotCommitted(answers)) {
      return answers;
    }
  }
  if (!isCase06ReclassifiedToCase02(answers)) return answers;

  // v1.1 재분류 원칙 2: CASE_06 상태는 힌트만, target CASE 값-질문은 스킵·시드하지 않음.
  return answers;
}

function ensureCustomerInputSeed(answers: ReviewAnswers): ReviewAnswers {
  const text = answers[CASE_CUSTOMER_INPUT_KEY]?.trim();
  if (!text || answers.situation) return answers;
  return applyCustomerInputToAnswers(answers, text);
}

function classifyFromCaseEntryQ1(answers: ReviewAnswers): {
  id: MasterCaseId;
  status: FactStatus;
  confidence: number;
  reason: string;
} | null {
  if (!isAdminCaseEntryQ1Complete(answers)) return null;
  const resolved = getQ1ResolvedCase(answers);
  if (!resolved) return null;
  const entry = answers[ADMIN_CASE_ENTRY_Q1_KEY];
  return {
    id: resolved,
    status: entry === "other" ? "candidate" : "confirmed",
    confidence: entry === "other" ? 0.55 : 0.88,
    reason: "Q1 사건 좁히기 응답",
  };
}

function classifyFromCase01Answers(answers: ReviewAnswers): {
  id: MasterCaseId;
  status: FactStatus;
  confidence: number;
  reason: string;
} | null {
  if (!shouldActivateCase01Path(answers) && !answers.case01_authorityDemand) return null;

  const demand = answers.case01_authorityDemand;
  const violation = answers.case01_violationContent;
  const confirmGoal = answers.case01_confirmGoal;

  const gap = answers[CASE01_FACT_COMPARE_GAP_KEY];
  if (gap === "gap_hearsay_channel") {
    return {
      id: "CASE_06",
      status: "candidate",
      confidence: 0.6,
      reason: "간접 경로로만 안내를 알게 되었다고 응답",
    };
  }

  if (
    (violation === "explanation_unknown" ||
      violation === "authority_explanation_missing" ||
      violation === "unsure") &&
    (case01ConfirmGoalIsUnclear(answers) ||
      demand === "understanding_unknown" ||
      demand === "no_stated_demand" ||
      demand === "demand_unclear")
  ) {
    return {
      id: "CASE_06",
      status: "inferred",
      confidence: 0.65,
      reason: "통지 내용·요구가 불명확하다고 응답",
    };
  }

  if (confirmGoal === "verify_payment" && !demand) {
    return {
      id: "CASE_01",
      status: "candidate",
      confidence: 0.5,
      reason: "납부 요구 확인 목적 — 위반·문제 통지 후보",
    };
  }

  if (
    demand === "pay_core_traffic" ||
    (demand === "payment" && answers.case01_paymentDemandScope === "core_case")
  ) {
    return {
      id: "CASE_02",
      status: "inferred",
      confidence: 0.78,
      reason: "납부·벌금이 이번 사건의 핵심으로 확인됨",
    };
  }
  if (demand === "attend_explain" || demand === "attendance") {
    return {
      id: "CASE_03",
      status: "inferred",
      confidence: 0.76,
      reason: "출석·소명이 이번 건 핵심으로 확인됨",
    };
  }
  if (
    demand === "supplement_core" ||
    (demand === "supplement" && answers.case01_supplementDemandScope === "core_case")
  ) {
    return {
      id: "CASE_04",
      status: "inferred",
      confidence: 0.78,
      reason: "보완·추가 제출이 이번 사건의 핵심으로 확인됨",
    };
  }
  if (
    demand === "demand_unclear" ||
    demand === "understanding_unknown" ||
    demand === "unclear" ||
    demand === "no_stated_demand"
  ) {
    return {
      id: "CASE_06",
      status: "candidate",
      confidence: 0.55,
      reason: "기관 요구 내용이 불명확하다고 응답",
    };
  }

  if (shouldActivateCase01Path(answers) || answers.case01_confirmGoal) {
    return {
      id: "CASE_01",
      status: answers.case01_authorityDemand ? "inferred" : "candidate",
      confidence: answers.case01_authorityDemand ? 0.72 : 0.48,
      reason: "위반·문제 통지 사건 경로",
    };
  }

  return null;
}

function classifyFromCase02Answers(answers: ReviewAnswers): {
  id: MasterCaseId;
  status: FactStatus;
  confidence: number;
  reason: string;
} | null {
  if (!shouldActivateCase02Path(answers) && !answers.case02_confirmGoal) return null;

  const subject = answers.case02_paymentSubject;
  const match = case02EffectiveSituationMatch(answers.case02_situationMatch);

  if (subject === "attendance_related") {
    return {
      id: "CASE_03",
      status: "inferred",
      confidence: 0.8,
      reason: "문서 내용이 출석·소명 요구로 확인됨",
    };
  }
  if (subject === "supplement_related") {
    return {
      id: "CASE_04",
      status: "inferred",
      confidence: 0.78,
      reason: "문서 내용이 보완·추가 제출 요구로 확인됨",
    };
  }
  if (subject === "disposition_related") {
    return {
      id: "CASE_05",
      status: "inferred",
      confidence: 0.76,
      reason: "문서 내용이 처분·조치 안내로 확인됨",
    };
  }
  if (
    case02PaymentSubjectImpliesUnclear(subject) ||
    (match === "unknown" && answers.case02_confirmGoal === "unsure")
  ) {
    return {
      id: "CASE_06",
      status: "inferred",
      confidence: 0.6,
      reason: "납부 요구 문서 내용이 불명확하다고 응답",
    };
  }

  if (shouldActivateCase02Path(answers) || answers.case02_confirmGoal) {
    return {
      id: "CASE_02",
      status: answers.case02_paymentSubject ? "inferred" : "candidate",
      confidence: answers.case02_paymentSubject ? 0.75 : 0.5,
      reason: "납부 요구 사건 경로",
    };
  }

  return null;
}

function classificationFromProfileSignals(answers: ReviewAnswers, text: string): {
  id: MasterCaseId;
  status: FactStatus;
  confidence: number;
  reason: string;
} {
  // Q0 "불명확" 진입 후 CASE_06 1차 답변으로 재분류되면 Q0 CASE_06 고정보다 재분류를 우선한다.
  const case06ReclassSignal = classifyFromCase06Answers(answers);
  if (case06ReclassSignal && case06ReclassSignal.id !== "CASE_06") {
    return case06ReclassSignal;
  }

  const case01CrossCaseSignal = classifyFromCase01Answers(answers);
  if (
    case01CrossCaseSignal &&
    shouldActivateCase01Path(answers) &&
    (case01CrossCaseSignal.id === "CASE_02" ||
      case01CrossCaseSignal.id === "CASE_03" ||
      case01CrossCaseSignal.id === "CASE_04")
  ) {
    return case01CrossCaseSignal;
  }

  const caseEntrySignal = classifyFromCaseEntryQ1(answers);
  if (caseEntrySignal) return caseEntrySignal;

  const case02Signal = classifyFromCase02Answers(answers);
  if (case02Signal) return case02Signal;

  const case03Signal = classifyFromCase03Answers(answers);
  if (case03Signal) return case03Signal;

  const case04Signal = classifyFromCase04Answers(answers);
  if (case04Signal) return case04Signal;

  const case01Signal = classifyFromCase01Answers(answers);
  if (case01Signal) return case01Signal;

  const case05Signal = classifyFromCase05Answers(answers);
  if (case05Signal) return case05Signal;

  const case06Signal = classifyFromCase06Answers(answers);
  if (case06Signal) return case06Signal;

  const keywordHits = keywordCaseSignals(text);

  if (answers.profileReceivedReason === "supplement") {
    return { id: "CASE_04", status: "inferred", confidence: 0.75, reason: "보완·추가 제출 요청 응답" };
  }
  if (answers.profileReceivedReason === "rejection") {
    return { id: "CASE_01", status: "inferred", confidence: 0.7, reason: "반려·불승인 통지 응답" };
  }
  if (answers.profileProblemType === "rejected") {
    return { id: "CASE_04", status: "inferred", confidence: 0.65, reason: "반려·보완 요청 문제 응답" };
  }
  if (answers.profileReceivedReason === "review_request") {
    return { id: "CASE_05", status: "candidate", confidence: 0.55, reason: "검토·확인 요청 응답" };
  }
  if (answers.profilePerceivedIssue === "unknown" || answers.situation === "unsure") {
    if (keywordHits.length === 1 && keywordHits[0] !== "CASE_06") {
      return {
        id: keywordHits[0],
        status: "candidate",
        confidence: 0.5,
        reason: "고객 설명 키워드 후보",
      };
    }
    return { id: "CASE_06", status: "inferred", confidence: 0.4, reason: "불명확 상황 응답" };
  }
  if (answers.situation === "unknown_problem") {
    if (keywordHits.length > 0 && keywordHits[0] !== "CASE_06") {
      return {
        id: keywordHits[0],
        status: "candidate",
        confidence: 0.45,
        reason: "고객 설명 기반 후보",
      };
    }
    return { id: "CASE_06", status: "inferred", confidence: 0.45, reason: "문제 원인 불명확" };
  }

  if (keywordHits.length > 0) {
    const primary = keywordHits[0];
    return {
      id: primary,
      status: primary === "CASE_06" ? "candidate" : "inferred",
      confidence: primary === "CASE_06" ? 0.35 : 0.55,
      reason: "고객 설명 키워드",
    };
  }

  return { id: "UNIVERSAL", status: "unknown", confidence: 0.2, reason: "사건 유형 미확정" };
}

function collectCase01Unknowns(answers: ReviewAnswers): string[] {
  const unknowns: string[] = [];
  if (!answers.case01_confirmGoal) return unknowns;
  if (
    answers.case01_violationContent === "explanation_unknown" ||
    answers.case01_violationContent === "authority_explanation_missing" ||
    answers.case01_violationContent === "unsure"
  ) {
    unknowns.push("통지서에 적힌 위반·문제 내용");
  }
  if (answers.case01_actualSituation === "unsure") unknowns.push("실제 상황 설명");
  const compareGap = answers[CASE01_FACT_COMPARE_GAP_KEY];
  if (compareGap === "gap_notice_incomplete") {
    unknowns.push("통지 핵심 문구");
  } else if (compareGap === "gap_language_access") {
    unknowns.push("안내 문구 확인");
  } else if (answers.case01_factRelationship === "unknown") {
    unknowns.push("통지 내용과 실제 상황 비교");
  }
  if (
    answers.case01_authorityDemand === "demand_unclear" ||
    answers.case01_authorityDemand === "understanding_unknown" ||
    answers.case01_authorityDemand === "no_stated_demand"
  ) {
    unknowns.push("기관이 요구한 행동");
  }
  if (getCase01EffectiveAuthorityResponse(answers) === "no_reply_yet") {
    unknowns.push("기관 답변·반응");
  }
  if (
    answers.case01_deadline === "uncertain" ||
    answers.case01_deadline === "deadline_window_only" ||
    answers.case01_deadline === "unsure" ||
    answers.case01_deadline === "asap" ||
    answers.case01_deadline === "no_stated" ||
    answers.case01_deadline === "not_stated" ||
    answers.case01_deadline === "not_advised" ||
    answers.case01_deadline === "not_checked" ||
    answers.case01_deadline === "overdue_concern" ||
    answers.case01_deadline === "unknown"
  ) {
    unknowns.push("통지서 기한");
  }
  if (
    adminVerifyFieldHasSlug(answers, "case01_evidence", "no") ||
    adminVerifyFieldHasSlug(answers, "case01_evidence", "unsure") ||
    adminVerifyFieldHasSlug(answers, "case01_evidence", "none")
  ) {
    unknowns.push("확인 가능한 자료");
  }
  return unknowns;
}

function collectCase01RiskSignals(answers: ReviewAnswers): string[] {
  const risks: string[] = [];
  if (
    answers.case01_factRelationship === "mismatch" ||
    answers.case01_factRelationship === "deny_action" ||
    answers.case01_factRelationship === "date_place_wrong" ||
    answers.case01_factRelationship === "partial_situation" ||
    answers.case01_factRelationship === "info_mismatch"
  ) {
    risks.push("통지 내용과 실제 상황이 다르다고 응답 — 사실관계 확인 필요");
  }
  const case01ActualSituation = getCase01ActualSituation(answers);
  if (
    case01ActualSituation === "deny" &&
    answers.case01_factRelationship !== "date_place_wrong"
  ) {
    risks.push("위반 사실을 인정하지 않음 — 통지 내용과 대조 필요");
  }
  if (
    answers.case01_deadline === "uncertain" ||
    answers.case01_deadline === "deadline_window_only" ||
    answers.case01_deadline === "asap" ||
    answers.case01_deadline === "no_stated" ||
    answers.case01_deadline === "not_stated" ||
    answers.case01_deadline === "not_advised" ||
    answers.case01_deadline === "not_checked" ||
    answers.case01_deadline === "overdue_concern" ||
    answers.case01_deadline === "unknown"
  ) {
    risks.push("통지서 기한 확인 필요");
  }
  const case01Blockage = normalizeCase01Blockage(answers.case01_blockage);
  if (case01Blockage === "deadline") {
    risks.push("기한·절차 관련 막힘 — 우선 확인 권장");
  }
  const case01EffectiveAuthorityResponse = getCase01EffectiveAuthorityResponse(answers);
  if (
    case01EffectiveAuthorityResponse === "no_response" ||
    case01EffectiveAuthorityResponse === "no_reply_yet" ||
    case01EffectiveAuthorityResponse === "more_required" ||
    case01EffectiveAuthorityResponse === "procedure_unknown" ||
    case01EffectiveAuthorityResponse === "unclear" ||
    case01EffectiveAuthorityResponse === "re_attendance" ||
    case01EffectiveAuthorityResponse === "more_docs" ||
    case01EffectiveAuthorityResponse === "payment_demand"
  ) {
    risks.push("기관 답변·반응 확인 필요");
  }
  return risks;
}

function collectUnknowns(answers: ReviewAnswers): string[] {
  const unknowns: string[] = [];
  if (shouldActivateCase02Path(answers) || answers.case02_confirmGoal) {
    unknowns.push(...collectCase02Unknowns(answers));
  }
  if (shouldActivateCase03Path(answers) || answers.case03_authorityDemand) {
    unknowns.push(...collectCase03Unknowns(answers));
  }
  if (shouldActivateCase04Path(answers) || answers.case04_supplementTarget) {
    unknowns.push(...collectCase04Unknowns(answers));
  }
  if (shouldActivateCase05Path(answers) || answers.case05_dispositionType) {
    unknowns.push(...collectCase05Unknowns(answers));
  }
  if (shouldActivateCase06Path(answers) || answers.profilePerceivedIssue) {
    unknowns.push(...collectCase06Unknowns(answers));
  }
  if (shouldActivateCase01Path(answers) || answers.case01_confirmGoal) {
    unknowns.push(...collectCase01Unknowns(answers));
  }
  const docs = assessLegacyField(answers, "docs", answers.docs);
  if (docs === "unknown") unknowns.push("서류 내용과 실제 상황 대조");
  if (assessLegacyField(answers, "contentCheck", answers.contentCheck) === "unknown") {
    unknowns.push("서류 내용");
  }
  if (assessLegacyField(answers, "formatProofCheck", answers.formatProofCheck) === "unknown") {
    unknowns.push("필요한 증빙");
  }
  if (assessLegacyField(answers, "submissionCheck", answers.submissionCheck) === "unknown") {
    unknowns.push("제출방법");
  }
  if (assessLegacyField(answers, "deadline", answers.deadline) === "unknown") {
    unknowns.push("제출기한");
  }
  if (answers.profileAuthorityGuidance === "yes_unclear") {
    unknowns.push("기관·상대방 안내 내용");
  }
  if (answers.profileAuthorityGuidance === "no") unknowns.push("기관·상대방 안내");
  if (answers.profilePerceivedIssue === "unknown") unknowns.push("문제 원인");
  return unknowns;
}

function collectRiskSignals(answers: ReviewAnswers): string[] {
  const risks: string[] = [];
  if (shouldActivateCase02Path(answers) || answers.case02_confirmGoal) {
    risks.push(...collectCase02RiskSignals(answers));
  }
  if (shouldActivateCase03Path(answers) || answers.case03_authorityDemand) {
    risks.push(...collectCase03RiskSignals(answers));
  }
  if (shouldActivateCase04Path(answers) || answers.case04_supplementTarget) {
    risks.push(...collectCase04RiskSignals(answers));
  }
  if (shouldActivateCase05Path(answers) || answers.case05_dispositionType) {
    risks.push(...collectCase05RiskSignals(answers));
  }
  if (shouldActivateCase06Path(answers) || answers.profilePerceivedIssue) {
    risks.push(...collectCase06RiskSignals(answers));
  }
  if (shouldActivateCase01Path(answers) || answers.case01_confirmGoal) {
    risks.push(...collectCase01RiskSignals(answers));
  }
  if (assessLegacyField(answers, "docs", answers.docs) === "issue") {
    risks.push("실제 상황과 다른 부분 확인 필요");
  }
  if (assessLegacyField(answers, "contentCheck", answers.contentCheck) === "issue") {
    risks.push("서류 내용 누락·오류 확인 필요");
  }
  if (answers.profileProblemType === "rejected") {
    risks.push("반려·보완 요청에 대한 대응 확인 필요");
  }
  if (assessLegacyField(answers, "deadline", answers.deadline) === "issue") {
    risks.push("제출기한 확인 필요");
  }
  return risks;
}

export function buildCaseResolutionProfile(answers: ReviewAnswers): CaseResolutionProfile {
  const customerText = customerTextFromAnswers(answers);
  const anchorCandidate = inferAnchorCandidate(customerText, answers);
  const classSignal = classificationFromProfileSignals(answers, customerText);

  const situationValue = answers.situation as AdminSituation | undefined;
  const situation = fact(
    situationValue ?? null,
    situationValue
      ? isAnswerFieldInferred(answers, "situation")
        ? "candidate"
        : "confirmed"
      : "unknown",
    isAnswerFieldInferred(answers, "situation") ? CASE_CUSTOMER_INPUT_KEY : "situation",
  );

  const caseAnchor = fact(
    anchorCandidate,
    anchorCandidate
      ? customerText.length >= 8
        ? "confirmed"
        : "candidate"
      : "unknown",
    customerText ? CASE_CUSTOMER_INPUT_KEY : "profileFields",
  );

  const case01TrafficNotice = isCase01TrafficNoticeContext(answers);
  const case06Active = shouldActivateCase06Path(answers);
  const authority = fact(
    answers.case06_exactSource
      ? getCase06FieldOptionLabel("case06_exactSource", answers.case06_exactSource)
      : answers.case02_demandAuthority
        ? getCase02FieldLabelFromAnswers("case02_demandAuthority", answers)?.label ??
          getCase02FieldOptionLabel("case02_demandAuthority", answers.case02_demandAuthority)
        : case01TrafficNotice
          ? CASE01_AUTHORITY_CONTEXT_LABEL
          : answers.profileDocumentSource
            ? getCase06FieldOptionLabel("profileDocumentSource", answers.profileDocumentSource)
            : null,
    answers.case06_exactSource ||
      answers.case02_demandAuthority ||
      case01TrafficNotice ||
      answers.profileDocumentSource
      ? case01TrafficNotice || !isAnswerFieldInferred(answers, "profileDocumentSource")
        ? "confirmed"
        : "candidate"
      : "unknown",
    answers.case06_exactSource
      ? "case06_exactSource"
      : answers.case02_demandAuthority
        ? "case02_demandAuthority"
        : case01TrafficNotice
          ? ADMIN_CASE_ENTRY_Q1_KEY
          : isAnswerFieldInferred(answers, "profileDocumentSource")
            ? CASE_CUSTOMER_INPUT_KEY
            : "profileDocumentSource",
  );

  const object = fact(
    answers.profileDocumentType
      ? DOCUMENT_TYPE_LABELS[answers.profileDocumentType] ?? answers.profileDocumentType
      : null,
    answers.profileDocumentType ? "confirmed" : "unknown",
    "profileDocumentType",
  );

  let eventLabel: string | null = null;
  let eventStatus: FactStatus = "unknown";
  if (answers.case05_dispositionType) {
    const dispositionEvent = getCase05FieldLabelFromAnswers("case05_dispositionType", answers);
    if (dispositionEvent) {
      eventLabel = dispositionEvent.label;
      eventStatus = dispositionEvent.factStatus;
    }
  } else if (case01TrafficNotice) {
    if (answers.case01_violationContent === "other") {
      const violationNote = answers[CASE01_VIOLATION_CONTENT_NOTE_KEY]?.trim();
      eventLabel = violationNote || CASE01_NOTICE_EVENT_LABEL;
      eventStatus = violationNote ? "confirmed" : "candidate";
    } else if (answers.case01_violationContent) {
      eventLabel =
        getCase01ChoiceLabel(CASE01_VIOLATION_CONTENT_OPTIONS, answers.case01_violationContent) ??
        CASE01_NOTICE_EVENT_LABEL;
      eventStatus = "confirmed";
    } else {
      eventLabel = CASE01_NOTICE_EVENT_LABEL;
      eventStatus = "confirmed";
    }
  } else if (answers.case04_initialSubmission) {
    eventLabel =
      getCase04FieldOptionLabel("case04_initialSubmission", answers.case04_initialSubmission);
    eventStatus = "confirmed";
  } else if (answers.case02_paymentSubject) {
    const subjectLabel = getCase02FieldOptionLabel(
      "case02_paymentSubject",
      answers.case02_paymentSubject,
    );
    const infoSourceLabel = answers.case02_paymentInfoSource
      ? getCase02FieldOptionLabel("case02_paymentInfoSource", answers.case02_paymentInfoSource)
      : null;
    eventLabel =
      subjectLabel && infoSourceLabel
        ? `${subjectLabel} (안내 인지: ${infoSourceLabel})`
        : subjectLabel;
    eventStatus = "confirmed";
  } else if (case06Active && answers.profileCurrentGoal) {
    eventLabel = getCase06FieldOptionLabel("profileCurrentGoal", answers.profileCurrentGoal);
    eventStatus = "confirmed";
  } else if (answers.profileReceivedReason) {
    eventLabel = RECEIVED_REASON_EVENT[answers.profileReceivedReason] ?? answers.profileReceivedReason;
    eventStatus = "confirmed";
  } else if (answers.profileProblemType) {
    eventLabel = PROBLEM_TYPE_EVENT[answers.profileProblemType] ?? answers.profileProblemType;
    eventStatus = "confirmed";
  } else if (customerText) {
    eventLabel = "고객 설명 기반 사건 후보";
    eventStatus = "candidate";
  }

  const event = fact(eventLabel, eventStatus, answers.profileReceivedReason ? "profileReceivedReason" : "profileProblemType");

  const case05AuthorityBase = answers.case05_dispositionType
    ? getCase05FieldLabelFromAnswers("case05_dispositionType", answers)?.label ??
      getCase05FieldOptionLabel("case05_dispositionType", answers.case05_dispositionType)
    : null;
  const case05AuthoritySuffix = case05DispositionDetailProfileSuffix(answers);
  const case05AuthorityLabel =
    case05AuthorityBase && case05AuthoritySuffix
      ? `${case05AuthorityBase} — ${case05AuthoritySuffix}`
      : case05AuthorityBase;

  const case06V11ActionLabel =
    case06Active && !isCase06LegacyRestorePath(answers) && answers.case06_requiredActionCandidate
      ? getCase06RequiredActionCandidateLabel(answers)
      : null;
  const authorityClaimLabel = case06V11ActionLabel
    ? case06V11ActionLabel
    : answers.case06_requiredAction
    ? getCase06FieldOptionLabel("case06_requiredAction", answers.case06_requiredAction)
    : answers.case05_dispositionType
      ? case05AuthorityLabel
      : case06Active && answers.profileCurrentGoal
      ? getCase06FieldOptionLabel("profileCurrentGoal", answers.profileCurrentGoal)
      : answers.case04_supplementTarget
      ? (() => {
          const core =
            getCase04FieldLabelFromAnswers("case04_supplementTarget", answers)?.label ??
            getCase04FieldOptionLabel(
              "case04_supplementTarget",
              answers.case04_supplementTarget,
            );
          const suffix = case04SupplementDetailSuffix(answers);
          return suffix ? `${core} (${suffix})` : core;
        })()
      : answers.case03_authorityDemand
      ? CASE03_OPTION_LABELS[answers.case03_authorityDemand] ?? answers.case03_authorityDemand
      : answers.case02_paymentSubject
      ? appendCase02DirectInputAuthorityClaimParts(
          `납부 요구: ${
            getCase02FieldLabelFromAnswers("case02_paymentSubject", answers)?.label ??
            getCase02FieldOptionLabel("case02_paymentSubject", answers.case02_paymentSubject)
          }`,
          answers,
        )
      : answers.case02_paymentAmount === "other"
        ? (() => {
            const amount = getCase02FieldLabelFromAnswers("case02_paymentAmount", answers);
            return amount ? `납부 금액: ${amount.label}` : null;
          })()
        : answers.case02_paymentMethod === "other"
          ? (() => {
              const method = getCase02FieldLabelFromAnswers("case02_paymentMethod", answers);
              return method ? `납부 방법: ${method.label}` : null;
            })()
          : answers.case01_authorityDemand
            ? CASE01_OPTION_LABELS[answers.case01_authorityDemand] ?? answers.case01_authorityDemand
            : answers.profileAuthorityGuidance === "yes_clear"
      ? "기관·상대방 안내를 받았고 이해했다고 응답"
      : answers.profileAuthorityGuidance === "yes_unclear"
        ? "기관·상대방 안내를 받았으나 내용이 불명확하다고 응답"
        : answers.profileAuthorityGuidance === "no"
          ? "기관·상대방 안내를 받지 못했다고 응답"
          : null;

  const authorityClaim = fact(
    authorityClaimLabel,
    case06V11ActionLabel ||
      answers.case06_requiredAction ||
      answers.case05_dispositionType ||
      (case06Active && answers.profileCurrentGoal) ||
      answers.case04_supplementTarget ||
      answers.case03_authorityDemand ||
      answers.case02_paymentSubject ||
      answers.case02_paymentAmount === "other" ||
      answers.case02_paymentMethod === "other" ||
      answers.case01_authorityDemand ||
      answers.profileAuthorityGuidance
      ? "confirmed"
      : "unknown",
    case06V11ActionLabel
      ? "case06_requiredActionCandidate"
      : answers.case06_requiredAction
      ? "case06_requiredAction"
      : answers.case05_dispositionType
      ? "case05_dispositionType"
      : case06Active && answers.profileCurrentGoal
        ? "profileCurrentGoal"
        : answers.case04_supplementTarget
        ? "case04_supplementTarget"
        : answers.case03_authorityDemand
        ? "case03_authorityDemand"
        : answers.case02_paymentSubject
        ? "case02_paymentSubject"
        : answers.case02_paymentAmount === "other"
          ? "case02_paymentAmount"
          : answers.case02_paymentMethod === "other"
            ? "case02_paymentMethod"
        : answers.case01_authorityDemand
          ? "case01_authorityDemand"
          : "profileAuthorityGuidance",
  );

  const authorityReason = fact(
    answers.case05_dispositionReason
      ? getCase05FieldOptionLabel("case05_dispositionReason", answers.case05_dispositionReason)
      : answers.case04_supplementReason
        ? getCase04FieldLabelFromAnswers("case04_supplementReason", answers)?.label ??
          getCase04FieldOptionLabel("case04_supplementReason", answers.case04_supplementReason)
        : answers.case03_inquiryFocus
        ? CASE03_OPTION_LABELS[answers.case03_inquiryFocus] ?? answers.case03_inquiryFocus
        : answers.case02_paymentBasis
        ? getCase02FieldLabelFromAnswers("case02_paymentBasis", answers)?.label ??
          getCase02FieldOptionLabel("case02_paymentBasis", answers.case02_paymentBasis)
        : answers.case02_nonPaymentNotice
          ? getCase02FieldLabelFromAnswers("case02_nonPaymentNotice", answers)?.label ??
            getCase02FieldOptionLabel(
              "case02_nonPaymentNotice",
              answers.case02_nonPaymentNotice,
            )
          : answers.profileProblemDiscovery
            ? `문제 인지 경로: ${answers.profileProblemDiscovery}`
            : null,
    answers.case05_dispositionReason ||
      answers.case04_supplementReason ||
      answers.case03_inquiryFocus ||
      answers.case02_paymentBasis ||
      answers.case02_nonPaymentNotice ||
      answers.profileProblemDiscovery
      ? "confirmed"
      : "unknown",
    answers.case05_dispositionReason
      ? "case05_dispositionReason"
      : answers.case04_supplementReason
        ? "case04_supplementReason"
        : answers.case03_inquiryFocus
        ? "case03_inquiryFocus"
        : answers.case02_paymentBasis
          ? "case02_paymentBasis"
          : answers.case02_nonPaymentNotice
            ? "case02_nonPaymentNotice"
            : "profileProblemDiscovery",
  );

  const customerStatement = fact(
    customerText || null,
    customerText ? "confirmed" : "unknown",
    customerText ? CASE_CUSTOMER_INPUT_KEY : "situationNote",
  );

  const docsAssessment = assessLegacyField(answers, "docs", answers.docs);
  const case01ActualSituationLabel = case01ActualSituationProfileLabel(answers);
  const case01FactRelationshipLabel = getCase01FactRelationshipLabel(answers);
  const case05FactDetailSuffix = case05FactDetailProfileSuffix(answers);
  const case05ActualSituationCore = answers.case05_factRelationship
    ? getCase05FieldOptionLabel("case05_factRelationship", answers.case05_factRelationship)
    : null;
  const case05ActualSituationLabel =
    case05ActualSituationCore && case05FactDetailSuffix
      ? `${case05ActualSituationCore} — ${case05FactDetailSuffix}`
      : case05ActualSituationCore;
  const actualSituation = fact(
    case05ActualSituationLabel
      ? case05ActualSituationLabel
      : answers.case04_submissionRelation
        ? getCase04FieldOptionLabel("case04_submissionRelation", answers.case04_submissionRelation)
        : answers.case03_factRelationship
        ? CASE03_OPTION_LABELS[answers.case03_factRelationship] ?? answers.case03_factRelationship
        : answers.case02_situationMatch
        ? getCase02FieldLabelFromAnswers("case02_situationMatch", answers)?.label ??
          getCase02FieldOptionLabel("case02_situationMatch", answers.case02_situationMatch)
        : case01ActualSituationLabel
          ? case01ActualSituationLabel
          : docsAssessment === "ok"
        ? "서류 내용과 실제 상황이 일치한다고 응답"
        : docsAssessment === "issue"
          ? "서류 내용과 실제 상황이 다르다고 응답"
          : docsAssessment === "unknown"
            ? "서류와 실제 상황 대조 미완료"
            : null,
    answers.case05_factRelationship ||
      answers.case04_submissionRelation ||
      answers.case03_factRelationship ||
      answers.case02_situationMatch ||
      answers.case01_actualSituation ||
      answers[CASE01_FACT_DIFFERENCE_DETAIL_KEY]?.trim() ||
      answers[CASE01_DATE_PLACE_DETAIL_KEY]?.trim() ||
      case01ActualSituationLabel
      ? "confirmed"
      : docsAssessment === "not_assessed"
        ? "unknown"
        : docsAssessment === "ok"
          ? "confirmed"
          : "inferred",
    answers.case05_factRelationship
      ? "case05_factRelationship"
      : answers.case04_submissionRelation
        ? "case04_submissionRelation"
        : answers.case03_factRelationship
        ? "case03_factRelationship"
        : answers.case02_situationMatch
        ? "case02_situationMatch"
        : answers[CASE01_FACT_DIFFERENCE_DETAIL_KEY]?.trim()
          ? CASE01_FACT_DIFFERENCE_DETAIL_KEY
          : answers[CASE01_DATE_PLACE_DETAIL_KEY]?.trim()
            ? CASE01_DATE_PLACE_DETAIL_KEY
            : answers.case01_actualSituation
              ? "case01_actualSituation"
              : "docs",
  );

  const factRelationship = fact(
    answers.case05_factRelationship
      ? answers.case05_factRelationship
      : answers.case04_submissionRelation
        ? answers.case04_submissionRelation
        : answers.case03_factRelationship
        ? answers.case03_factRelationship
        : answers.case02_situationMatch
        ? answers.case02_situationMatch
        : case01FactRelationshipLabel
          ? case01FactRelationshipLabel
          : answers.case01_factRelationship
          ? answers.case01_factRelationship
          : answers.docsFollowUp
        ? `불일치·미확인 항목 응답 있음`
        : docsAssessment === "ok"
          ? "match"
          : null,
    answers.case05_factRelationship ||
      answers.case04_submissionRelation ||
      answers.case03_factRelationship ||
      answers.case02_situationMatch ||
      answers.case01_factRelationship
      ? "confirmed"
      : answers.docs || answers.docsFollowUp
        ? docsAssessment === "ok"
          ? "confirmed"
          : "inferred"
        : "unknown",
    answers.case05_factRelationship
      ? "case05_factRelationship"
      : answers.case04_submissionRelation
        ? "case04_submissionRelation"
        : answers.case03_factRelationship
        ? "case03_factRelationship"
        : answers.case02_situationMatch
        ? "case02_situationMatch"
        : answers.case01_factRelationship
          ? "case01_factRelationship"
          : "docs",
  );

  const ACTION_LABELS: Record<string, string> = {
    none: "아직 특별한 조치 없음",
    contacted: "기관·상대방에 문의",
    resubmitted: "서류 재제출",
    lawyer: "전문가·대행 문의",
    other: "기타 조치",
  };

  const case05ResponseLabel = answers.case05_dispositionOutcome
    ? getCase05FieldOptionLabel("case05_dispositionOutcome", answers.case05_dispositionOutcome)
    : answers.case05_authorityFollowUp
      ? getCase05FieldOptionLabel("case05_authorityFollowUp", answers.case05_authorityFollowUp)
      : null;

  const case04ResponseValue = getCase04AuthorityResponseValue(answers);
  const case04ResponseLabel = case04ResponseValue
    ? getCase04FieldOptionLabel("case04_authorityFollowUp", case04ResponseValue)
    : null;

  const case03ResponseValue = getCase03AuthorityResponseValue(answers);
  const case03ResponseLabel = case03ResponseValue
    ? CASE03_OPTION_LABELS[case03ResponseValue] ?? case03ResponseValue
    : null;

  const case01CustomerActionValue = isAdminVerifyChoiceFieldComplete(
    "case01_responseDetail",
    answers,
    CASE01_RESPONSE_DETAIL_OPTIONS,
  )
    ? CASE01_OPTION_LABELS[answers.case01_responseDetail ?? ""] ??
      answers.case01_responseDetail ??
      null
    : answers.case01_customerResponded
      ? CASE01_OPTION_LABELS[answers.case01_customerResponded] ??
        answers.case01_customerResponded
      : null;
  const case01CustomerActionSource = isAdminVerifyChoiceFieldComplete(
    "case01_responseDetail",
    answers,
    CASE01_RESPONSE_DETAIL_OPTIONS,
  )
    ? "case01_responseDetail"
    : answers.case01_customerResponded
      ? "case01_customerResponded"
      : null;

  const case05CustomerResponseCore = answers.case05_customerResponse
    ? getCase05FieldLabelFromAnswers("case05_customerResponse", answers)?.label ??
      getCase05FieldOptionLabel("case05_customerResponse", answers.case05_customerResponse)
    : null;
  const case05ExplanationDetail = case05DetailProfileLabel("case05_explanationDetail", answers);
  const case05SubmittedDocsDetail = case05DetailProfileLabel("case05_submittedDocsDetail", answers);
  const case05AppealDetail = case05DetailProfileLabel("case05_appealDetail", answers);
  let case05CustomerActionLabel: string | null = case05CustomerResponseCore;
  if (answers.case05_customerResponse === "explanation_submitted" && case05ExplanationDetail) {
    case05CustomerActionLabel = `${case05ExplanationDetail} (${case05CustomerResponseCore ?? "소명·의견 제출"})`;
  } else if (answers.case05_customerResponse === "documents_submitted" && case05SubmittedDocsDetail) {
    case05CustomerActionLabel = case05CustomerResponseCore
      ? `${case05CustomerResponseCore} — ${case05SubmittedDocsDetail}`
      : case05SubmittedDocsDetail;
  } else if (answers.case05_customerResponse === "appeal_requested" && case05AppealDetail) {
    case05CustomerActionLabel = case05CustomerResponseCore
      ? `${case05CustomerResponseCore} — ${case05AppealDetail}`
      : case05AppealDetail;
  } else if (answers.case05_plannedNextStep) {
    const planned = getCase05FieldOptionLabel(
      "case05_plannedNextStep",
      answers.case05_plannedNextStep,
    );
    case05CustomerActionLabel =
      case05CustomerResponseCore && planned
        ? `${case05CustomerResponseCore} · ${planned}`
        : case05CustomerResponseCore ?? planned;
  }

  const case03CustomerActionCore = answers.case03_customerResponse
    ? getCase03FieldLabelFromAnswers("case03_customerResponse", answers)?.label ??
      getCase03FieldOptionLabel("case03_customerResponse", answers.case03_customerResponse)
    : null;
  const case03AttendancePlace = answers[CASE03_ATTENDANCE_PLACE_KEY]?.trim();
  const case03CustomerActionLabel =
    case03CustomerActionCore && case03AttendancePlace
      ? `${case03CustomerActionCore} (출석 장소: ${case03AttendancePlace})`
      : case03CustomerActionCore;

  const customerAction = fact(
    case05CustomerActionLabel
      ? case05CustomerActionLabel
      : answers.case04_customerResponse
        ? getCase04FieldLabelFromAnswers("case04_customerResponse", answers)?.label ??
          getCase04FieldOptionLabel("case04_customerResponse", answers.case04_customerResponse)
        : case03CustomerActionLabel
        ? case03CustomerActionLabel
        : answers.case02_paymentStatus
        ? getCase02FieldOptionLabel("case02_paymentStatus", answers.case02_paymentStatus)
        : case01CustomerActionValue
          ? case01CustomerActionValue
          : answers.profileActionsTaken
            ? ACTION_LABELS[answers.profileActionsTaken] ?? answers.profileActionsTaken
            : null,
    answers.case05_customerResponse ||
      answers.case04_customerResponse ||
      answers.case03_customerResponse ||
      answers.case02_paymentStatus ||
      case01CustomerActionValue ||
      answers.profileActionsTaken
      ? "confirmed"
      : "unknown",
    answers.case05_customerResponse
      ? "case05_customerResponse"
      : answers.case04_customerResponse
        ? "case04_customerResponse"
        : answers.case03_customerResponse
        ? "case03_customerResponse"
        : answers.case02_paymentStatus
        ? "case02_paymentStatus"
        : case01CustomerActionSource
          ? case01CustomerActionSource
          : "profileActionsTaken",
  );

  const authorityResponse = fact(
    case05ResponseLabel
      ? case05ResponseLabel
      : case04ResponseLabel
        ? case04ResponseLabel
        : case03ResponseLabel
        ? case03ResponseLabel
        : answers.case02_authorityResponse
        ? getCase02AuthorityResponseLabelFromAnswers(answers)?.label ??
          answers.case02_authorityResponse
        : getCase01EffectiveAuthorityResponse(answers)
          ? getCase01EffectiveAuthorityResponseLabel(answers)
          : answers.profileAuthorityGuidance
            ? authorityClaim.value
            : answers.profileProcessStage === "waiting"
              ? "기관·상대방 답변 대기 중이라고 응답"
              : null,
    case05ResponseLabel ||
      case04ResponseLabel ||
      case03ResponseLabel ||
      answers.case02_authorityResponse ||
      getCase01EffectiveAuthorityResponse(answers) ||
      answers.profileAuthorityGuidance ||
      answers.profileProcessStage === "waiting"
      ? "confirmed"
      : "unknown",
    case05ResponseLabel
      ? answers.case05_dispositionOutcome
        ? "case05_dispositionOutcome"
        : "case05_authorityFollowUp"
      : case04ResponseLabel
        ? "case04_authorityFollowUp"
        : case03ResponseLabel
        ? "case03_authorityFollowUp"
        : answers.case02_authorityResponse
        ? "case02_authorityResponse"
        : answers.case01_authorityResponse
          ? "case01_authorityResponse"
          : case01UsesFollowUpKindFallback(answers)
            ? "case01_authorityFollowUpKind"
            : "profileAuthorityGuidance",
  );

  const stageDerived = answers.stage || deriveStageFromSituation(answers.situation);
  const PROCESS_LABELS: Record<string, string> = {
    before_action: "아직 대응 전",
    in_review: "검토·협의 중",
    submitted: "제출·접수 완료",
    waiting: "답변 대기 중",
    other: "기타 단계",
  };

  const currentStage = fact(
    answers.profileProcessStage
      ? PROCESS_LABELS[answers.profileProcessStage] ?? answers.profileProcessStage
      : stageDerived === "prevent"
        ? "제출·계약 전"
        : stageDerived === "case"
          ? "제출 후·문제 대응"
          : null,
    answers.profileProcessStage || stageDerived
      ? isAnswerFieldInferred(answers, "profileProcessStage") ||
        isAnswerFieldInferred(answers, "stage")
        ? "candidate"
        : "confirmed"
      : "unknown",
    isAnswerFieldInferred(answers, "profileProcessStage")
      ? CASE_CUSTOMER_INPUT_KEY
      : answers.profileProcessStage
        ? "profileProcessStage"
        : "stage",
  );

  const effectiveDate = fact<string>(null, "unknown");

  const deadlineAssessment = assessLegacyField(answers, "deadline", answers.deadline);
  const case06V11DeadlineText =
    case06Active && !isCase06LegacyRestorePath(answers)
      ? answers[CASE06_DEADLINE_DATE_KEY]?.trim()
      : "";
  const deadline = fact(
    case06V11DeadlineText
      ? `대응·제출 기한: ${case06V11DeadlineText}`
      : case06Active &&
          answers.profileAuthorityGuidance &&
          answers.profileAuthorityGuidance !== "specific_date"
      ? getCase06FieldOptionLabel("profileAuthorityGuidance", answers.profileAuthorityGuidance)
      : answers.case05_deadline
      ? case05EffectiveDeadline(answers.case05_deadline) === "specific_date" &&
        answers[CASE05_DEADLINE_DATE_KEY]?.trim()
        ? `처분 관련 대응 기한: ${answers[CASE05_DEADLINE_DATE_KEY].trim()}`
        : getCase05FieldLabelFromAnswers("case05_deadline", answers)?.label ??
          getCase05FieldOptionLabel("case05_deadline", answers.case05_deadline)
        : answers.case04_deadline
        ? answers.case04_deadline === "specific_date" &&
          answers[CASE04_DEADLINE_DATE_KEY]?.trim()
          ? `보완 제출 기한: ${answers[CASE04_DEADLINE_DATE_KEY].trim()}`
          : getCase04FieldLabelFromAnswers("case04_deadline", answers)?.label ??
            getCase04FieldOptionLabel("case04_deadline", answers.case04_deadline)
        : answers.case03_deadline
        ? answers.case03_deadline === "specific_date" &&
          answers[CASE03_DEADLINE_DATE_KEY]?.trim()
          ? `출석·소명 기한: ${answers[CASE03_DEADLINE_DATE_KEY].trim()}`
          : getCase03FieldLabelFromAnswers("case03_deadline", answers)?.label ??
            getCase03FieldOptionLabel("case03_deadline", answers.case03_deadline)
        : answers.case02_deadline
        ? answers.case02_deadline === "confirmed" &&
          answers[CASE02_DEADLINE_DATE_KEY]?.trim()
          ? `납부 기한: ${answers[CASE02_DEADLINE_DATE_KEY].trim()}`
          : getCase02FieldOptionLabel("case02_deadline", answers.case02_deadline)
        : answers.case01_deadline
          ? case01DeadlineRequiresDateText(answers.case01_deadline) &&
            answers[CASE01_DEADLINE_DATE_KEY]?.trim()
            ? `대응 기한: ${answers[CASE01_DEADLINE_DATE_KEY].trim()}`
            : CASE01_OPTION_LABELS[answers.case01_deadline] ?? answers.case01_deadline
          : deadlineAssessment === "ok"
        ? "기한·유효기간 확인 완료 응답"
        : deadlineAssessment === "issue"
          ? "기한·유효기간 불확실 응답"
          : deadlineAssessment === "unknown"
            ? "기한·유효기간 미확인"
            : null,
    case06V11DeadlineText ||
      (case06Active &&
        answers.profileAuthorityGuidance &&
        answers.profileAuthorityGuidance !== "specific_date") ||
      answers.case05_deadline ||
      answers.case04_deadline ||
      answers.case03_deadline ||
      answers.case02_deadline ||
      answers.case01_deadline
      ? "confirmed"
      : deadlineAssessment === "not_assessed"
        ? "unknown"
        : deadlineAssessment === "ok"
          ? "confirmed"
          : "inferred",
    case06V11DeadlineText
      ? CASE06_DEADLINE_DATE_KEY
      : case06Active && answers.profileAuthorityGuidance
      ? "profileAuthorityGuidance"
      : answers.case05_deadline
      ? case05EffectiveDeadline(answers.case05_deadline) === "specific_date" &&
        answers[CASE05_DEADLINE_DATE_KEY]?.trim()
        ? CASE05_DEADLINE_DATE_KEY
        : "case05_deadline"
      : answers.case04_deadline
        ? answers.case04_deadline === "specific_date" &&
          answers[CASE04_DEADLINE_DATE_KEY]?.trim()
          ? CASE04_DEADLINE_DATE_KEY
          : "case04_deadline"
        : answers.case03_deadline
        ? answers.case03_deadline === "specific_date" &&
          answers[CASE03_DEADLINE_DATE_KEY]?.trim()
          ? CASE03_DEADLINE_DATE_KEY
          : "case03_deadline"
        : answers.case02_deadline
        ? answers.case02_deadline === "confirmed" &&
          answers[CASE02_DEADLINE_DATE_KEY]?.trim()
          ? CASE02_DEADLINE_DATE_KEY
          : "case02_deadline"
        : answers.case01_deadline
          ? "case01_deadline"
          : "deadline",
  );

  const currentBlockage = fact(
    answers.case06_blockage
      ? getCase06FieldOptionLabel("case06_blockage", answers.case06_blockage)
      : answers.case05_blockage
      ? getCase05FieldOptionLabel("case05_blockage", answers.case05_blockage)
        : answers.case04_blockage
        ? getCase04FieldOptionLabel("case04_blockage", answers.case04_blockage)
        : answers.case03_blockage
        ? getCase03FieldLabelFromAnswers("case03_blockage", answers)?.label ??
          getCase03FieldOptionLabel("case03_blockage", answers.case03_blockage)
        : answers.case02_blockage
        ? getCase02FieldLabelFromAnswers("case02_blockage", answers)?.label ??
          getCase02FieldOptionLabel("case02_blockage", answers.case02_blockage)
        : answers.case01_blockage
          ? CASE01_OPTION_LABELS[answers.case01_blockage] ?? answers.case01_blockage
          : answers.profilePerceivedIssue === "deadline"
        ? "기한·유효기간이 막힌 부분일 수 있음"
        : answers.profilePerceivedIssue === "procedure"
          ? "절차·제출 방법이 막힌 부분일 수 있음"
          : answers.profilePerceivedIssue === "authority"
            ? "기관·상대방 대응이 막힌 부분일 수 있음"
            : null,
    answers.case06_blockage ||
      answers.case05_blockage ||
      answers.case04_blockage ||
      answers.case03_blockage ||
      answers.case02_blockage ||
      answers.case01_blockage ||
      answers.profilePerceivedIssue
      ? "confirmed"
      : "unknown",
    answers.case06_blockage
      ? "case06_blockage"
      : answers.case05_blockage
      ? "case05_blockage"
      : answers.case04_blockage
        ? "case04_blockage"
        : answers.case03_blockage
        ? "case03_blockage"
        : answers.case02_blockage
        ? "case02_blockage"
        : answers.case01_blockage
          ? "case01_blockage"
          : "profilePerceivedIssue",
  );

  const uploadedEvidenceFileName =
    answers[ADMIN_PHASE2_EVIDENCE_FILE_NAME_ANSWERS_KEY]?.trim() ||
    answers[ADMIN_PHASE1_EVIDENCE_FILE_NAME_KEY]?.trim() ||
    null;

  const case05EvidenceCore = answers.case05_evidence
    ? getCase05FieldOptionLabel("case05_evidence", answers.case05_evidence)
    : null;
  const case05SubmittedDocsLabel = answers.case05_submittedDocsDetail
    ? getCase05FieldLabelFromAnswers("case05_submittedDocsDetail", answers)?.label ??
      getCase05FieldOptionLabel(
        "case05_submittedDocsDetail",
        answers.case05_submittedDocsDetail,
      )
    : null;
  const case05EvidenceLabel =
    case05EvidenceCore && case05SubmittedDocsLabel
      ? `${case05EvidenceCore} (제출 서류: ${case05SubmittedDocsLabel})`
      : case05EvidenceCore;

  const case03EvidenceCore = answers.case03_evidence
    ? getCase03FieldLabelFromAnswers("case03_evidence", answers)?.label ??
      getCase03FieldOptionLabel("case03_evidence", answers.case03_evidence)
    : null;
  const case03AttendanceWhenWhere = answers[CASE03_ATTENDANCE_WHEN_WHERE_KEY]?.trim();
  const case03EvidenceLabel =
    case03EvidenceCore && case03AttendanceWhenWhere
      ? `${case03EvidenceCore} (일시·장소: ${case03AttendanceWhenWhere})`
      : case03EvidenceCore;

  const evidence = fact(
    answers.case06_evidence
      ? getCase06FieldOptionLabel("case06_evidence", answers.case06_evidence)
      : case05EvidenceLabel
      ? case05EvidenceLabel
        : answers.case04_evidence
        ? getCase04FieldLabelFromAnswers("case04_evidence", answers)?.label ??
          getCase04FieldOptionLabel("case04_evidence", answers.case04_evidence)
        : case03EvidenceLabel
        ? case03EvidenceLabel
        : answers.case02_evidence
        ? getCase02FieldLabelFromAnswers("case02_evidence", answers)?.label ??
          getCase02FieldOptionLabel("case02_evidence", answers.case02_evidence)
        : answers.case01_evidence
          ? CASE01_OPTION_LABELS[answers.case01_evidence] ?? answers.case01_evidence
          : uploadedEvidenceFileName
            ? `첨부 자료: ${uploadedEvidenceFileName}`
            : answers.docs === "yes"
        ? "관련 서류 확인 응답"
        : answers.profileHasDocument === "yes"
          ? "확인할 서류 있음 응답"
          : answers.profileHasDocument === "no"
            ? "서류 없음·미확정 응답"
            : null,
    answers.case06_evidence ||
      answers.case05_evidence ||
      answers.case04_evidence ||
      answers.case03_evidence ||
      answers.case02_evidence ||
      answers.case01_evidence ||
      uploadedEvidenceFileName ||
      answers.docs ||
      answers.profileHasDocument
      ? uploadedEvidenceFileName && !answers.case01_evidence && !answers.case02_evidence
        ? "candidate"
        : "confirmed"
      : "unknown",
    answers.case06_evidence
      ? "case06_evidence"
      : answers.case05_evidence
      ? "case05_evidence"
      : answers.case04_evidence
        ? "case04_evidence"
        : answers.case03_evidence
        ? "case03_evidence"
        : answers.case02_evidence
        ? "case02_evidence"
        : answers.case01_evidence
          ? "case01_evidence"
          : uploadedEvidenceFileName
            ? answers[ADMIN_PHASE2_EVIDENCE_FILE_NAME_ANSWERS_KEY]
              ? ADMIN_PHASE2_EVIDENCE_FILE_NAME_ANSWERS_KEY
              : ADMIN_PHASE1_EVIDENCE_FILE_NAME_KEY
            : answers.docs
            ? "docs"
            : "profileHasDocument",
  );

  const GOAL_LABELS: Record<string, string> = {
    understand: "무엇을 해야 하는지 알고 싶음",
    prepare: "제출·대응 준비 필요",
    fix: "문제 해결",
    deadline: "기한 안에 처리",
    requirements: "제출 요건과 형식",
    content: "서류 내용·기재사항",
    format_proof: "서명·번역·공증·증빙",
    submission: "제출기관·제출 방법",
    full: "전체 확인",
    other: "기타",
  };

  const goalValue =
    answers.case06_finalGoal ??
    answers.case05_finalGoal ??
    answers.case05_confirmGoal ??
    answers.case04_finalGoal ??
    answers.case03_finalGoal ??
    answers.case03_confirmGoal ??
    answers.case02_finalGoal ??
    answers.case02_confirmGoal ??
    answers.case01_finalGoal ??
    answers.case01_confirmGoal ??
    answers.profileCurrentGoal ??
    answers.profileCheckGoal ??
    null;
  const case01GoalLabelValue =
    answers.case01_finalGoal != null
      ? answers.case01_finalGoal
      : answers.case01_confirmGoal;
  const case02FinalGoalDisplay = answers.case02_finalGoal
    ? getCase02FieldLabelFromAnswers("case02_finalGoal", answers)
    : null;
  const case05FinalGoalDisplay = answers.case05_finalGoal
    ? getCase05FieldLabelFromAnswers("case05_finalGoal", answers)
    : null;
  const case05ConfirmGoalDisplay = answers.case05_confirmGoal
    ? getCase05FieldLabelFromAnswers("case05_confirmGoal", answers)
    : null;
  const case05FinalGoalHints: Record<string, string> = {
    expert: "전문가 상담·연결 목표",
    next_action: "이의·소명 등 다음 대응 확인 목표",
    evidence: "필요 서류·증빙 확인 목표",
    what_to_do: "우선 조치 확인 목표",
  };
  const case05FinalGoalResolved =
    answers.case05_finalGoal && case05FinalGoalDisplay
      ? case05FinalGoalHints[answers.case05_finalGoal]
        ? `${case05FinalGoalDisplay.label} (${case05FinalGoalHints[answers.case05_finalGoal]})`
        : case05FinalGoalDisplay.label
      : answers.case05_finalGoal
        ? getCase05FieldOptionLabel("case05_finalGoal", answers.case05_finalGoal)
        : null;
  const case03FinalGoalDisplay = answers.case03_finalGoal
    ? getCase03FieldLabelFromAnswers("case03_finalGoal", answers)
    : null;
  const case03ConfirmGoalDisplay = answers.case03_confirmGoal
    ? getCase03FieldLabelFromAnswers("case03_confirmGoal", answers)
    : null;
  const goal = fact(
    goalValue
      ? (answers.case06_finalGoal
          ? getCase06FieldOptionLabel("case06_finalGoal", goalValue)
          : null) ??
        (answers.case05_finalGoal ? case05FinalGoalResolved : null) ??
        (answers.case05_confirmGoal && goalValue === answers.case05_confirmGoal
          ? case05ConfirmGoalDisplay?.label ??
            getCase05FieldOptionLabel("case05_confirmGoal", goalValue)
          : null) ??
        CASE04_OPTION_LABELS[goalValue] ??
        (answers.case03_finalGoal && case03FinalGoalDisplay
          ? case03FinalGoalDisplay.label
          : null) ??
        (answers.case03_confirmGoal &&
        goalValue === answers.case03_confirmGoal &&
        case03ConfirmGoalDisplay
          ? case03ConfirmGoalDisplay.label
          : null) ??
        CASE03_OPTION_LABELS[goalValue] ??
        (answers.case02_finalGoal
          ? case02FinalGoalDisplay?.label ?? CASE02_OPTION_LABELS[goalValue]
          : null) ??
        CASE02_OPTION_LABELS[goalValue] ??
        CASE01_OPTION_LABELS[goalValue] ??
        CASE01_OPTION_LABELS[normalizeCase01FinalGoal(case01GoalLabelValue) ?? ""] ??
        GOAL_LABELS[normalizeCase01FinalGoal(goalValue) ?? goalValue] ??
        goalValue
      : null,
    goalValue
      ? answers.case02_finalGoal && case02FinalGoalDisplay
        ? case02FinalGoalDisplay.factStatus
        : answers.case05_finalGoal && case05FinalGoalDisplay
          ? case05FinalGoalDisplay.factStatus
          : answers.case05_confirmGoal &&
              goalValue === answers.case05_confirmGoal &&
              case05ConfirmGoalDisplay
            ? case05ConfirmGoalDisplay.factStatus
            : "confirmed"
      : "unknown",
    answers.case06_finalGoal
      ? "case06_finalGoal"
      : answers.case05_finalGoal
      ? "case05_finalGoal"
      : answers.case05_confirmGoal && goalValue === answers.case05_confirmGoal
        ? "case05_confirmGoal"
      : answers.case04_finalGoal
        ? "case04_finalGoal"
        : answers.case03_finalGoal
        ? "case03_finalGoal"
        : answers.case03_confirmGoal
        ? "case03_confirmGoal"
        : answers.case02_finalGoal
        ? "case02_finalGoal"
        : answers.case02_confirmGoal
          ? "case02_confirmGoal"
          : answers.case01_finalGoal
            ? "case01_finalGoal"
            : answers.case01_confirmGoal
              ? "case01_confirmGoal"
              : answers.profileCurrentGoal
                ? "profileCurrentGoal"
                : "profileCheckGoal",
  );

  const case03Rounds = deriveCase03Rounds(answers);
  const case04Rounds = deriveCase04Rounds(answers);
  const case05Rounds = deriveCase05Rounds(answers);

  const caseClassification = fact(
    classSignal.id,
    classSignal.status,
    "classificationEngine",
  );

  const confidence = fact(classSignal.confidence, "inferred", "classificationEngine");

  const previousJson = answers._caseResolutionProfileJson;
  let reclassificationHistory: CaseReclassificationRecord[] = [];
  if (previousJson) {
    try {
      const prev = JSON.parse(previousJson) as CaseResolutionProfile;
      reclassificationHistory = prev.reclassificationHistory ?? [];
      const prevClass = prev.caseClassification?.value;
      if (
        prevClass &&
        prevClass !== classSignal.id &&
        prevClass !== "UNIVERSAL" &&
        classSignal.confidence >= 0.45
      ) {
        reclassificationHistory = [
          ...reclassificationHistory,
          {
            from: prevClass,
            to: classSignal.id,
            reason: classSignal.reason,
          },
        ];
      } else if (prevClass === "CASE_06" && classSignal.id !== "CASE_06" && classSignal.confidence >= 0.45) {
        reclassificationHistory = [
          ...reclassificationHistory,
          {
            from: "CASE_06",
            to: classSignal.id,
            reason: classSignal.reason,
          },
        ];
      }
    } catch {
      reclassificationHistory = [];
    }
  } else if (classSignal.id !== "CASE_06" && classSignal.id !== "UNIVERSAL" && classSignal.confidence >= 0.5) {
    reclassificationHistory = [
      {
        from: "CASE_06",
        to: classSignal.id,
        reason: classSignal.reason,
      },
    ];
  }

  return {
    situation,
    caseAnchor,
    authority,
    document: object,
    object,
    event,
    authorityClaim,
    authorityReason,
    customerStatement,
    actualSituation,
    factRelationship,
    customerAction,
    authorityResponse,
    currentStage,
    effectiveDate,
    deadline,
    currentBlockage,
    evidence,
    goal,
    caseClassification,
    confidence,
    unknown: collectUnknowns(answers),
    riskSignals: collectRiskSignals(answers),
    reclassificationHistory,
    explanationRound: case03Rounds.explanationRound > 0 ? case03Rounds.explanationRound : undefined,
    responseRound: case03Rounds.responseRound > 0 ? case03Rounds.responseRound : undefined,
    supplementRound:
      case04Rounds.supplementRound > 0 ? case04Rounds.supplementRound : undefined,
    supplementResponseRound:
      case04Rounds.supplementResponseRound > 0 ? case04Rounds.supplementResponseRound : undefined,
    dispositionResponseRound:
      case05Rounds.dispositionResponseRound > 0 ? case05Rounds.dispositionResponseRound : undefined,
    dispositionReviewRound:
      case05Rounds.dispositionReviewRound > 0 ? case05Rounds.dispositionReviewRound : undefined,
  };
}

export function reevaluateCaseClassification(
  profile: CaseResolutionProfile,
  answers: ReviewAnswers,
): CaseResolutionProfile {
  const next = buildCaseResolutionProfile(answers);
  const prevId = profile.caseClassification.value ?? "UNIVERSAL";
  const nextId = next.caseClassification.value ?? "UNIVERSAL";
  const conf = next.confidence.value ?? 0;

  if (prevId === nextId) return next;

  const allowedFromUniversal =
    prevId === "CASE_06" || prevId === "UNIVERSAL";
  const strongEnough = conf >= 0.45;

  if (!strongEnough) {
    return {
      ...next,
      caseClassification: profile.caseClassification,
      reclassificationHistory: profile.reclassificationHistory,
    };
  }

  if (allowedFromUniversal || prevId !== nextId) {
    return {
      ...next,
      reclassificationHistory: [
        ...profile.reclassificationHistory,
        {
          from: prevId,
          to: nextId,
          reason: next.caseClassification.source ?? "답변 기반 재평가",
          atAnswerField: "reevaluate",
        },
      ],
    };
  }

  return next;
}

const FOCUS_TO_QUESTION_ID: Partial<Record<CaseResolutionQuestionFocus, string>> = {
  evidence: "docs",
  actualSituation: "docs",
  deadline: "deadline",
  authorityClaim: "profileAuthorityGuidance",
  authorityResponse: "profileAuthorityGuidance",
  customerAction: "profileActionsTaken",
  goal: "profileCurrentGoal",
  currentBlockage: "profilePerceivedIssue",
};

function isFactResolved(field: ProfileFact<unknown>): boolean {
  return field.status === "confirmed" || (field.status === "inferred" && field.value != null);
}

const CASE04_FOCUS_ORDER: { id: string; focus: CaseResolutionQuestionFocus; rank: number; reason: string }[] = [
  { id: "case04_supplementTarget", focus: "authorityClaim", rank: 1, reason: "보완 요구 상황" },
  { id: "case04_confirmGoal", focus: "goal", rank: 2, reason: "확인 목표" },
  { id: "case04_customerResponse", focus: "customerAction", rank: 3, reason: "고객 대응" },
  { id: "case04_deadline", focus: "deadline", rank: 4, reason: "보완 제출 기한" },
  { id: "case04_initialSubmission", focus: "actualSituation", rank: 5, reason: "최초 제출 내용" },
  { id: "case04_submissionRelation", focus: "actualSituation", rank: 6, reason: "보완과 기존 제출 관계" },
  { id: "case04_supplementReason", focus: "authorityReason", rank: 7, reason: "보완 이유" },
  { id: "case04_addDocDetail", focus: "authorityClaim", rank: 8, reason: "추가 서류 상세" },
  { id: "case04_modifyDetail", focus: "authorityClaim", rank: 9, reason: "수정 내용 상세" },
  { id: "case04_evidenceDetail", focus: "authorityClaim", rank: 10, reason: "추가 증빙 상세" },
  { id: "case04_unclearFocus", focus: "authorityClaim", rank: 11, reason: "불명확 요구 포인트" },
  { id: "case04_authorityFollowUp", focus: "authorityResponse", rank: 12, reason: "보완 후 기관 반응" },
  { id: "case04_repeatSupplement", focus: "authorityResponse", rank: 13, reason: "재보완 여부" },
  { id: "case04_blockage", focus: "currentBlockage", rank: 14, reason: "막힌 지점" },
  { id: "case04_evidence", focus: "evidence", rank: 15, reason: "증빙" },
  { id: "case04_finalGoal", focus: "goal", rank: 16, reason: "목표" },
];

const CASE03_FOCUS_ORDER: { id: string; focus: CaseResolutionQuestionFocus; rank: number; reason: string }[] = [
  { id: "case03_authorityDemand", focus: "authorityClaim", rank: 1, reason: "기관 요구 확인" },
  { id: "case03_inquiryFocus", focus: "authorityReason", rank: 2, reason: "기관이 확인하려는 사실" },
  { id: "case03_customerResponse", focus: "customerAction", rank: 3, reason: "고객의 기존 대응" },
  { id: "case03_confirmGoal", focus: "goal", rank: 4, reason: "고객 확인 목표" },
  { id: "case03_deadline", focus: "deadline", rank: 5, reason: "출석·소명 기한" },
  { id: "case03_factRelationship", focus: "actualSituation", rank: 6, reason: "사실관계" },
  { id: "case03_explanationDetail", focus: "customerAction", rank: 7, reason: "설명한 내용" },
  { id: "case03_authorityFollowUp", focus: "authorityResponse", rank: 8, reason: "기관 후속 반응" },
  { id: "case03_prepRequired", focus: "authorityClaim", rank: 9, reason: "준비 사항" },
  { id: "case03_repeatFollowUp", focus: "authorityResponse", rank: 10, reason: "반복 소명 여부" },
  { id: "case03_blockage", focus: "currentBlockage", rank: 11, reason: "막힌 지점" },
  { id: "case03_evidence", focus: "evidence", rank: 12, reason: "증빙" },
  { id: "case03_finalGoal", focus: "goal", rank: 13, reason: "목표" },
];

const CASE02_FOCUS_ORDER: { id: string; focus: CaseResolutionQuestionFocus; rank: number; reason: string }[] = [
  { id: "case02_paymentSubject", focus: "caseClassification", rank: 1, reason: "납부 대상·상황" },
  { id: "case02_paymentInfoSource", focus: "actualSituation", rank: 2, reason: "납부 안내 인지 경로" },
  { id: "case02_noticeAccessFact", focus: "actualSituation", rank: 3, reason: "간접 안내 확인 상태" },
  { id: "case02_situationMatch", focus: "actualSituation", rank: 4, reason: "실제 상황과의 관계" },
  { id: "case02_paymentAmount", focus: "authorityClaim", rank: 5, reason: "납부 금액 확인" },
  { id: "case02_paymentStatus", focus: "customerAction", rank: 5, reason: "납부 여부" },
  { id: "case02_confirmGoal", focus: "goal", rank: 6, reason: "납부 관련 확인 목표" },
  { id: "case02_demandAuthority", focus: "authorityClaim", rank: 7, reason: "납부 요구 주체" },
  { id: "case02_paymentBasis", focus: "authorityReason", rank: 8, reason: "납부 사유·근거" },
  { id: "case02_deadline", focus: "deadline", rank: 9, reason: "납부 기한" },
  { id: "case02_authorityResponse", focus: "authorityResponse", rank: 10, reason: "납부 후 기관 반응" },
  { id: "case02_paidProcessingFact", focus: "customerAction", rank: 10.5, reason: "납부 처리 확인" },
  { id: "case02_paymentMethod", focus: "authorityClaim", rank: 11, reason: "납부 방법" },
  { id: "case02_nonPaymentNotice", focus: "authorityReason", rank: 12, reason: "미납 시 안내" },
  { id: "case02_paymentConfirmationFact", focus: "authorityClaim", rank: 12.5, reason: "납부 후 확인 방법" },
  { id: "case02_blockage", focus: "currentBlockage", rank: 13, reason: "막힌 지점" },
  { id: "case02_evidence", focus: "evidence", rank: 14, reason: "증빙" },
  { id: "case02_finalGoal", focus: "goal", rank: 15, reason: "목표" },
];

const CASE06_FOCUS_ORDER: { id: string; focus: CaseResolutionQuestionFocus; rank: number; reason: string }[] = [
  { id: "profileDocumentSource", focus: "authorityClaim", rank: 1, reason: "문서 출처" },
  { id: "case06_documentNature", focus: "caseClassification", rank: 2, reason: "문서 성격" },
  { id: "profileCurrentGoal", focus: "authorityClaim", rank: 3, reason: "요구 조치" },
  { id: "profileAuthorityGuidance", focus: "deadline", rank: 4, reason: "기한 인식" },
  { id: "profilePerceivedIssue", focus: "currentBlockage", rank: 5, reason: "이해 어려운 부분" },
  { id: "case06_exactSource", focus: "authorityClaim", rank: 6, reason: "정확한 발신처" },
  { id: "case06_keyPhrase", focus: "authorityClaim", rank: 7, reason: "핵심 문구" },
  { id: "case06_requiredAction", focus: "authorityClaim", rank: 8, reason: "요구 조치" },
  { id: "case06_receiptPath", focus: "actualSituation", rank: 9, reason: "수령 경로" },
  { id: "case06_actualCore", focus: "caseClassification", rank: 10, reason: "사건 재분류" },
  { id: "case06_blockage", focus: "currentBlockage", rank: 11, reason: "막힌 지점" },
  { id: "case06_evidence", focus: "evidence", rank: 12, reason: "보유 자료" },
  { id: "case06_finalGoal", focus: "goal", rank: 13, reason: "목표" },
];

const CASE05_FOCUS_ORDER: { id: string; focus: CaseResolutionQuestionFocus; rank: number; reason: string }[] = [
  { id: "case05_dispositionType", focus: "authorityClaim", rank: 1, reason: "처분·조치 내용" },
  { id: "case05_confirmGoal", focus: "goal", rank: 2, reason: "확인 목표" },
  { id: "case05_customerResponse", focus: "customerAction", rank: 3, reason: "고객 대응" },
  { id: "case05_deadline", focus: "deadline", rank: 4, reason: "처분 관련 기한" },
  { id: "case05_factRelationship", focus: "actualSituation", rank: 5, reason: "실제 상황과 처분 내용 관계" },
  { id: "case05_dispositionReason", focus: "authorityReason", rank: 6, reason: "처분 사유" },
  { id: "case05_authorityFollowUp", focus: "authorityResponse", rank: 7, reason: "기관 후속 반응" },
  { id: "case05_dispositionDetail", focus: "authorityClaim", rank: 8, reason: "처분 문구 확인" },
  { id: "case05_factDetail", focus: "actualSituation", rank: 9, reason: "실제 사건 확인" },
  { id: "case05_explanationDetail", focus: "customerAction", rank: 10, reason: "소명 내용" },
  { id: "case05_submittedDocsDetail", focus: "evidence", rank: 11, reason: "제출 자료" },
  { id: "case05_appealDetail", focus: "customerAction", rank: 12, reason: "이의·재검토" },
  { id: "case05_dispositionOutcome", focus: "authorityResponse", rank: 13, reason: "처분 후속 결과" },
  {
    id: "case05_plannedNextStep",
    focus: "customerAction",
    rank: 14,
    reason: "검토 중인 조치",
  },
  { id: "case05_repeatFollowUp", focus: "authorityResponse", rank: 15, reason: "반복 대응" },
  { id: "case05_blockage", focus: "currentBlockage", rank: 16, reason: "막힌 지점" },
  { id: "case05_evidence", focus: "evidence", rank: 17, reason: "증빙" },
  { id: "case05_finalGoal", focus: "goal", rank: 18, reason: "목표" },
];

const CASE01_FOCUS_ORDER: { id: string; focus: CaseResolutionQuestionFocus; rank: number; reason: string }[] = [
  { id: "case01_violationContent", focus: "caseClassification", rank: 1, reason: "기관 문제 설명 확인" },
  { id: "case01_factRelationship", focus: "actualSituation", rank: 2, reason: "설명과 실제 상황 관계" },
  { id: "case01_customerResponded", focus: "customerAction", rank: 3, reason: "현재까지 대응" },
  { id: "case01_confirmGoal", focus: "goal", rank: 4, reason: "핵심 확인 목적" },
  { id: "case01_authorityDemand", focus: "authorityClaim", rank: 5, reason: "기관 요구 확인" },
  { id: "case01_paymentDemandScope", focus: "authorityClaim", rank: 6, reason: "납부 요구 범위" },
  { id: "case01_supplementDemandScope", focus: "authorityClaim", rank: 7, reason: "보완 요구 범위" },
  { id: "case01_actualSituation", focus: "actualSituation", rank: 8, reason: "실제 사건 구조화" },
  { id: "case01_deadline", focus: "deadline", rank: 9, reason: "기한 확인" },
  { id: "case01_responseDetail", focus: "customerAction", rank: 10, reason: "대응 상세" },
  { id: "case01_authorityResponse", focus: "authorityResponse", rank: 11, reason: "기관 반응 확인" },
  { id: "case01_authorityDemandDetail", focus: "authorityClaim", rank: 12, reason: "안내 이해 수준" },
  { id: "case01_evidence", focus: "evidence", rank: 13, reason: "확인 가능 증빙" },
  { id: "case01_blockage", focus: "currentBlockage", rank: 14, reason: "막힌 지점 확인" },
  { id: "case01_finalGoal", focus: "goal", rank: 15, reason: "최종 확인 목표" },
];

function isActiveCasePathCompleteByActivation(answers: ReviewAnswers): boolean {
  if (shouldActivateCase02Path(answers)) return case02PathFieldsComplete(answers);
  if (shouldActivateCase03Path(answers)) return case03PathFieldsComplete(answers);
  if (shouldActivateCase04Path(answers)) return case04PathFieldsComplete(answers);
  if (shouldActivateCase05Path(answers)) return case05PathFieldsComplete(answers);
  if (shouldActivateCase01Path(answers)) return case01PathFieldsComplete(answers);
  if (shouldActivateCase06Path(answers)) return isCase06PathComplete(answers);
  return false;
}

function isAnyCasePathActive(answers: ReviewAnswers): boolean {
  return (
    shouldActivateCase02Path(answers) ||
    shouldActivateCase03Path(answers) ||
    shouldActivateCase04Path(answers) ||
    shouldActivateCase05Path(answers) ||
    shouldActivateCase01Path(answers) ||
    shouldActivateCase06Path(answers)
  );
}

function isClassifiedCasePhase1Complete(
  caseId: MasterCaseId | null | undefined,
  answers: ReviewAnswers,
): boolean {
  switch (caseId) {
    case "CASE_01":
      return isCase01Phase1Complete(answers);
    case "CASE_02":
      return isCase02Phase1Complete(answers);
    case "CASE_03":
      return isCase03Phase1Complete(answers);
    case "CASE_04":
      return isCase04Phase1Complete(answers);
    case "CASE_05":
      return isCase05Phase1Complete(answers);
    case "CASE_06":
      return isCase06Phase1Complete(answers);
    default:
      return false;
  }
}

export function isAdminVerifyPhase1Complete(answers: ReviewAnswers): boolean {
  if (!isAdminCaseEntryQ1Complete(answers)) return false;
  const q1Case = getQ1ResolvedCase(answers);
  if (!q1Case || q1Case === "UNIVERSAL") return false;
  return isClassifiedCasePhase1Complete(q1Case, answers);
}

/** Phase 2 — CASE path fields complete (append*Phase2 + needs* chain 기준). */
export function isAdminVerifyPhase2PathComplete(answers: ReviewAnswers): boolean {
  if (!isAdminCaseEntryQ1Complete(answers)) return false;
  const q1Case = getQ1ResolvedCase(answers);
  if (!q1Case || q1Case === "UNIVERSAL") return false;

  if (q1Case === "CASE_06" && !isCase06LegacyRestorePath(answers)) {
    if (isCase06LaunchSimplifiedSession(answers)) {
      return isCase06RedesignPhase1Complete(answers) && isCase06ExpertTerminal(answers);
    }
    if (!isCase06Phase2ChainComplete(answers)) return false;
    if (!isCase06BridgeSnapshotCommitted(answers)) return false;
    if (answers.case06_expertHandoffRequired === "true") return true;
    const questionCase = getAdminVerifyActiveQuestionCase(answers, 2);
    if (!questionCase || questionCase === "CASE_06") {
      return isCase06ExpertTerminal(answers);
    }
    return isClassifiedCasePathComplete(questionCase, answers);
  }

  const activeCase = getEffectiveAdminVerifyCase(answers, 2);
  if (!activeCase || activeCase === "UNIVERSAL") return false;
  return isClassifiedCasePathComplete(activeCase, answers);
}

function isClassifiedCasePathComplete(
  caseId: MasterCaseId | "UNIVERSAL" | null | undefined,
  answers: ReviewAnswers,
): boolean {
  switch (caseId) {
    case "CASE_02":
      return case02PathFieldsComplete(answers);
    case "CASE_03":
      return case03PathFieldsComplete(answers);
    case "CASE_04":
      return case04PathFieldsComplete(answers);
    case "CASE_05":
      return case05PathFieldsComplete(answers);
    case "CASE_01":
      return case01PathFieldsComplete(answers);
    case "CASE_06":
      return case06PathFieldsComplete(answers);
    case "UNIVERSAL":
    default:
      return isActiveCasePathCompleteByActivation(answers);
  }
}

function selectCase02ResolutionFocus(answers: ReviewAnswers): CaseResolutionQuestionPriority | null {
  if (case02PathFieldsComplete(answers)) return null;
  const seeded = seedCase02AnswersFromCustomerInput(answers);
  for (const item of CASE02_FOCUS_ORDER) {
    if (answers[item.id]?.trim()) continue;
    if (item.id === "case02_demandAuthority" && !case02ShouldAskDemandAuthority(seeded)) {
      continue;
    }
    if (item.id === "case02_paymentInfoSource" && !case02NeedsPaymentInfoSourcePhase2(answers)) {
      continue;
    }
    if (item.id === "case02_noticeAccessFact" && !case02NeedsNoticeAccessFact(answers)) {
      continue;
    }
    if (item.id === "case02_situationMatch" && !case02NeedsSituationMatchPhase2(answers)) {
      continue;
    }
    if (item.id === "case02_paymentAmount" && !case02NeedsPaymentAmountPhase2(answers)) {
      continue;
    }
    if (item.id === "case02_paymentBasis" && !case02NeedsPaymentBasisPhase2(answers)) {
      continue;
    }
    if (item.id === "case02_deadline" && !case02NeedsDeadlinePhase2(answers)) {
      continue;
    }
    if (
      item.id === "case02_authorityResponse" &&
      (!case02HasPaidStatus(answers) ||
        !case02NeedsAuthorityResponse(answers.case02_paymentStatus))
    ) {
      continue;
    }
    if (item.id === "case02_paymentMethod" && !case02NeedsPaymentMethod(answers)) {
      continue;
    }
    if (item.id === "case02_nonPaymentNotice" && !case02NeedsNonPaymentNotice(answers)) {
      continue;
    }
    if (item.id === "case02_paidProcessingFact" && !case02NeedsPaidProcessingFact(answers)) {
      continue;
    }
    if (item.id === "case02_paymentConfirmationFact" && !case02NeedsPaymentConfirmationFact(answers)) {
      continue;
    }
    if (item.id === "case02_blockage" && !case02NeedsBlockage(answers)) continue;
    if (item.id === "case02_evidence" && !case02NeedsEvidence(answers)) continue;
    if (item.id === "case02_finalGoal" && !case02NeedsFinalGoal(answers)) continue;
    return {
      focus: item.focus,
      questionId: item.id,
      reason: item.reason,
      rank: item.rank,
    };
  }
  return null;
}

function selectCase03ResolutionFocus(answers: ReviewAnswers): CaseResolutionQuestionPriority | null {
  if (case03PathFieldsComplete(answers)) return null;
  for (const item of CASE03_FOCUS_ORDER) {
    if (answers[item.id]?.trim()) continue;
    if (item.id === "case03_factRelationship" && !case03NeedsFactRelationshipPhase2(answers)) {
      continue;
    }
    if (
      item.id === "case03_inquiryFocus" &&
      !case03NeedsInquiryFocusPhase2(answers) &&
      !case03IsInquiryFocusAnswered(answers)
    ) {
      continue;
    }
    if (item.id === "case03_explanationDetail" && !case03HasResponded(answers)) continue;
    if (item.id === "case03_authorityFollowUp" && !case03HasResponded(answers)) continue;
    if (item.id === "case03_prepRequired" && !case03NeedsPrepDetail(answers)) continue;
    if (item.id === "case03_repeatFollowUp" && !case03NeedsRepeatFollowUp(answers)) continue;
    if (item.id === "case03_blockage" && !case03NeedsBlockage(answers)) continue;
    if (item.id === "case03_evidence" && !case03NeedsEvidence(answers)) continue;
    if (item.id === "case03_finalGoal" && !case03NeedsFinalGoal(answers)) continue;
    return {
      focus: item.focus,
      questionId: item.id,
      reason: item.reason,
      rank: item.rank,
    };
  }
  return null;
}

function selectCase04ResolutionFocus(answers: ReviewAnswers): CaseResolutionQuestionPriority | null {
  if (case04PathFieldsComplete(answers)) return null;
  for (const item of CASE04_FOCUS_ORDER) {
    if (answers[item.id]?.trim()) continue;
    const target = answers.case04_supplementTarget;
    if (item.id === "case04_initialSubmission" && !case04NeedsInitialSubmissionPhase2(answers)) {
      continue;
    }
    if (item.id === "case04_submissionRelation" && !case04NeedsSubmissionRelationPhase2(answers)) {
      continue;
    }
    if (item.id === "case04_supplementReason" && !case04NeedsSupplementReasonPhase2(answers)) {
      continue;
    }
    if (item.id === "case04_addDocDetail" && target !== "additional_docs") continue;
    if (item.id === "case04_modifyDetail" && target !== "modify_existing") continue;
    if (item.id === "case04_evidenceDetail" && target !== "add_content_evidence") continue;
    if (item.id === "case04_unclearFocus" && target !== "unclear") continue;
    if (item.id === "case04_authorityFollowUp" && !case04NeedsAuthorityFollowUpPhase2(answers)) {
      continue;
    }
    if (item.id === "case04_repeatSupplement" && !case04NeedsRepeatSupplement(answers)) continue;
    if (item.id === "case04_blockage" && !case04NeedsBlockage(answers)) continue;
    if (item.id === "case04_evidence" && !case04NeedsEvidence(answers)) continue;
    if (item.id === "case04_finalGoal" && !case04NeedsFinalGoal(answers)) continue;
    return {
      focus: item.focus,
      questionId: item.id,
      reason: item.reason,
      rank: item.rank,
    };
  }
  return null;
}

function selectCase05ResolutionFocus(answers: ReviewAnswers): CaseResolutionQuestionPriority | null {
  if (case05PathFieldsComplete(answers)) return null;
  for (const item of CASE05_FOCUS_ORDER) {
    const options = CASE05_FIELD_OPTION_MAP[item.id];
    const answered = options
      ? isAdminVerifyChoiceFieldComplete(item.id, answers, options)
      : Boolean(answers[item.id]?.trim());
    if (answered) continue;
    if (item.id === "case05_factRelationship" && !case05NeedsFactRelationshipPhase2(answers)) {
      continue;
    }
    if (item.id === "case05_dispositionReason" && !case05NeedsDispositionReasonPhase2(answers)) {
      continue;
    }
    if (item.id === "case05_authorityFollowUp" && !case05NeedsAuthorityFollowUpPhase2(answers)) {
      continue;
    }
    if (item.id === "case05_dispositionDetail" && !case05NeedsDispositionDetail(answers)) continue;
    if (item.id === "case05_factDetail" && !case05NeedsFactDetail(answers)) continue;
    if (item.id === "case05_explanationDetail" && !case05NeedsExplanationDetail(answers)) continue;
    if (item.id === "case05_submittedDocsDetail" && !case05NeedsSubmittedDocsDetail(answers)) continue;
    if (item.id === "case05_appealDetail" && !case05NeedsAppealDetail(answers)) continue;
    if (item.id === "case05_dispositionOutcome" && !case05NeedsDispositionOutcome(answers)) continue;
    if (item.id === "case05_plannedNextStep" && !case05NeedsPlannedNextStepPhase2(answers)) {
      continue;
    }
    if (item.id === "case05_repeatFollowUp" && !case05NeedsRepeatFollowUpQuestion(answers)) continue;
    if (item.id === "case05_blockage" && !case05NeedsBlockage(answers)) continue;
    if (item.id === "case05_evidence" && !case05NeedsEvidence(answers)) continue;
    if (item.id === "case05_finalGoal" && !case05NeedsFinalGoal(answers)) continue;
    return {
      focus: item.focus,
      questionId: item.id,
      reason: item.reason,
      rank: item.rank,
    };
  }
  return null;
}

function selectCase06ResolutionFocus(answers: ReviewAnswers): CaseResolutionQuestionPriority | null {
  if (case06PathFieldsComplete(answers)) return null;
  for (const item of CASE06_FOCUS_ORDER) {
    if (answers[item.id]?.trim()) continue;
    if (item.id === "case06_exactSource" && !case06NeedsExactSource(answers)) continue;
    if (item.id === "case06_keyPhrase" && !case06NeedsKeyPhrase(answers)) continue;
    if (item.id === "case06_requiredAction" && !case06NeedsRequiredAction(answers)) continue;
    if (item.id === "case06_receiptPath" && !case06NeedsReceiptPath(answers)) continue;
    if (item.id === "case06_actualCore" && !case06NeedsActualCore(answers)) continue;
    if (item.id === "case06_blockage" && !case06NeedsBlockage(answers)) continue;
    if (item.id === "case06_evidence" && !case06NeedsEvidence(answers)) continue;
    if (item.id === "case06_finalGoal" && !case06NeedsFinalGoal(answers)) continue;
    return {
      focus: item.focus,
      questionId: item.id,
      reason: item.reason,
      rank: item.rank,
    };
  }
  return null;
}

function selectCase01ResolutionFocus(answers: ReviewAnswers): CaseResolutionQuestionPriority | null {
  if (case01PathFieldsComplete(answers)) return null;
  for (const item of CASE01_FOCUS_ORDER) {
    if (answers[item.id]?.trim()) continue;
    if (item.id === "case01_paymentDemandScope" && !case01NeedsPaymentDemandScope(answers)) {
      continue;
    }
    if (item.id === "case01_supplementDemandScope" && !case01NeedsSupplementDemandScope(answers)) {
      continue;
    }
    if (item.id === "case01_actualSituation" && !case01NeedsActualSituationQuestion(answers)) {
      continue;
    }
    if (item.id === "case01_deadline" && !case01NeedsDeadlinePhase2(answers)) continue;
    if (item.id === "case01_responseDetail" && !case01NeedsResponseDetail(answers)) continue;
    if (item.id === "case01_authorityResponse" && !case01NeedsAuthorityResponse(answers)) continue;
    if (item.id === "case01_authorityDemandDetail" && !case01NeedsAuthorityDemandDetailChoice(answers)) {
      continue;
    }
    if (item.id === "case01_blockage" && !case01NeedsBlockage(answers)) continue;
    if (item.id === "case01_finalGoal" && !case01NeedsFinalGoal(answers)) continue;
    return {
      focus: item.focus,
      questionId: item.id,
      reason: item.reason,
      rank: item.rank,
    };
  }
  return null;
}

export function resolveCaseReclassificationHandoff(
  profile: CaseResolutionProfile,
  answers: ReviewAnswers,
): { pathComplete: boolean; nextFocus: CaseResolutionQuestionFocus | null } {
  const q1Case = getQ1ResolvedCase(answers);
  const pathComplete =
    q1Case === "CASE_06" && !isCase06LegacyRestorePath(answers)
      ? isAdminVerifyPhase2PathComplete(answers)
      : isClassifiedCasePathComplete(profile.caseClassification.value, answers);
  const nextFocus = pathComplete
    ? null
    : selectNextCaseResolutionFocus(profile, answers)?.focus ?? null;
  return { pathComplete, nextFocus };
}

export function selectNextCaseResolutionFocus(
  profile: CaseResolutionProfile,
  answers: ReviewAnswers,
): CaseResolutionQuestionPriority | null {
  if (
    getQ1ResolvedCase(answers) === "CASE_06" &&
    !isCase06LegacyRestorePath(answers) &&
    !isCase06Phase2ChainComplete(answers)
  ) {
    const redesign = selectCase06RedesignResolutionFocus(answers);
    if (redesign) {
      return {
        focus: redesign.focus,
        questionId: redesign.questionId,
        reason: redesign.reason,
        rank: 1,
      };
    }
  }

  const classified = profile.caseClassification.value;
  if (classified === "CASE_02") return selectCase02ResolutionFocus(answers);
  if (classified === "CASE_03") return selectCase03ResolutionFocus(answers);
  if (classified === "CASE_04") return selectCase04ResolutionFocus(answers);
  if (classified === "CASE_05") return selectCase05ResolutionFocus(answers);
  if (classified === "CASE_06") {
    if (
      getQ1ResolvedCase(answers) === "CASE_06" &&
      !isCase06LegacyRestorePath(answers) &&
      !isCase06Phase2ChainComplete(answers)
    ) {
      const redesign = selectCase06RedesignResolutionFocus(answers);
      if (redesign) {
        return {
          focus: redesign.focus,
          questionId: redesign.questionId,
          reason: redesign.reason,
          rank: 1,
        };
      }
    }
    return selectCase06ResolutionFocus(answers);
  }
  if (classified === "CASE_01") return selectCase01ResolutionFocus(answers);

  if (shouldActivateCase02Path(answers) && !case02PathFieldsComplete(answers)) {
    const focus = selectCase02ResolutionFocus(answers);
    if (focus) return focus;
  }

  if (shouldActivateCase03Path(answers) && !case03PathFieldsComplete(answers)) {
    const focus = selectCase03ResolutionFocus(answers);
    if (focus) return focus;
  }

  if (shouldActivateCase04Path(answers) && !case04PathFieldsComplete(answers)) {
    const focus = selectCase04ResolutionFocus(answers);
    if (focus) return focus;
  }

  if (shouldActivateCase05Path(answers) && !case05PathFieldsComplete(answers)) {
    const focus = selectCase05ResolutionFocus(answers);
    if (focus) return focus;
  }

  if (shouldActivateCase06Path(answers) && !case06PathFieldsComplete(answers)) {
    const focus = selectCase06ResolutionFocus(answers);
    if (focus) return focus;
  }

  if (shouldActivateCase01Path(answers) && !case01PathFieldsComplete(answers)) {
    const focus = selectCase01ResolutionFocus(answers);
    if (focus) return focus;
  }

  if (isAnyCasePathActive(answers) && isActiveCasePathCompleteByActivation(answers)) {
    return null;
  }

  const candidates: CaseResolutionQuestionPriority[] = [];

  if (profile.caseClassification.value === "CASE_06" || profile.caseClassification.value === "UNIVERSAL") {
    if (!isFactResolved(profile.event)) {
      candidates.push({
        focus: "caseClassification",
        questionId: "profileReceivedReason",
        reason: "사건 유형을 좁히기 위해 사건 성격 확인",
        rank: 3,
      });
    }
  }

  if (!isFactResolved(profile.authorityClaim) && wasFieldAsked(answers, "profileProblemType")) {
    candidates.push({
      focus: "authorityClaim",
      questionId: "profileAuthorityGuidance",
      reason: "기관 요구·안내 내용 확인",
      rank: 1,
    });
  }

  if (profile.riskSignals.length > 0 && !isFactResolved(profile.deadline)) {
    candidates.push({
      focus: "deadline",
      questionId: "deadline",
      reason: "위험 판단에 필요한 기한 정보",
      rank: 2,
    });
  }

  if (!isFactResolved(profile.evidence)) {
    candidates.push({
      focus: "evidence",
      questionId: "docs",
      reason: "진행 가능 여부를 위한 서류·증빙",
      rank: 5,
    });
  }

  if (!isFactResolved(profile.actualSituation) && wasFieldAsked(answers, "docs")) {
    candidates.push({
      focus: "actualSituation",
      questionId: "docs",
      reason: "서류와 실제 상황 대조",
      rank: 2,
    });
  }

  if (!isFactResolved(profile.goal)) {
    candidates.push({
      focus: "goal",
      questionId: "profileCurrentGoal",
      reason: "다음 행동 결정",
      rank: 6,
    });
  }

  if (profile.unknown.length > 0 && !isFactResolved(profile.authorityResponse)) {
    candidates.push({
      focus: "authorityResponse",
      questionId: "profileAuthorityGuidance",
      reason: "미확인 항목 해소를 위한 기관 반응",
      rank: 4,
    });
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => a.rank - b.rank);
  const top = candidates[0];
  const qid = top.questionId ?? FOCUS_TO_QUESTION_ID[top.focus];
  if (qid && (answers[qid]?.trim() || wasFieldAsked(answers, qid))) return null;
  return top;
}

function readStoredCaseResolutionProfile(
  answers: ReviewAnswers,
): CaseResolutionProfile | null {
  const raw = answers._caseResolutionProfileJson;
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as CaseResolutionProfile;
  } catch {
    return null;
  }
}

export function attachCaseResolutionSnapshot(answers: ReviewAnswers): ReviewAnswers {
  const previousProfile = readStoredCaseResolutionProfile(answers);
  const profile = previousProfile
    ? reevaluateCaseClassification(previousProfile, answers)
    : buildCaseResolutionProfile(answers);
  return {
    ...answers,
    _caseResolutionProfileJson: JSON.stringify(profile),
    _caseNextFocus: selectNextCaseResolutionFocus(profile, answers)?.focus ?? "",
    _case01Active: shouldActivateCase01Path(answers) ? "1" : "0",
    _case02Active: isCase02PathActiveForProfiling(answers) ? "1" : "0",
    _case03Active: shouldActivateCase03Path(answers) ? "1" : "0",
    _case04Active: shouldActivateCase04Path(answers) ? "1" : "0",
    _case05Active: shouldActivateCase05Path(answers) ? "1" : "0",
    _case06Active: shouldActivateCase06Path(answers) ? "1" : "0",
  };
}

export function mergeCustomerCaseInput(
  answers: ReviewAnswers,
  customerInput: string,
): ReviewAnswers {
  return applyCustomerInputToAnswers(answers, customerInput);
}

export function serializeCaseResolutionProfile(
  profile: CaseResolutionProfile,
): Record<string, string> {
  return {
    [CASE_RESOLUTION_META_JSON_KEY]: JSON.stringify(profile),
    [CASE_RESOLUTION_CLASSIFICATION_KEY]: profile.caseClassification.value ?? "UNIVERSAL",
    [CASE_RESOLUTION_ANCHOR_KEY]: profile.caseAnchor.value ?? "",
    case_resolution_confidence: String(profile.confidence.value ?? 0),
    case_customer_input: profile.customerStatement.value ?? "",
  };
}

export function deserializeCaseResolutionProfile(
  meta: Record<string, unknown>,
): CaseResolutionProfile | null {
  const raw = meta[CASE_RESOLUTION_META_JSON_KEY];
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as CaseResolutionProfile;
  } catch {
    return null;
  }
}

/** CRM meta — whitelisted Phase 1/2 answer keys for FREE restore (no schema change). */
export const ADMIN_VERIFY_ANSWERS_META_JSON_KEY = "admin_verify_answers_json";
export const ADMIN_PROFILING_COMPLETE_META_FLAG = "_adminProfilingComplete";
export const ADMIN_PHASE1_EVIDENCE_FILE_NAME_KEY = "_adminPhase1EvidenceFileName";
export const ADMIN_PHASE2_EVIDENCE_ATTACHED_ANSWERS_KEY = "_adminPhase2EvidenceAttached";
export const ADMIN_PHASE2_EVIDENCE_FILE_NAME_ANSWERS_KEY = "_adminPhase2EvidenceFileName";
export const ADMIN_RESTORED_PROFILE_PHASE_KEY = "_adminRestoredProfilePhase";
export const ADMIN_VERIFY_PROFILE_PHASE_META_KEY = "admin_verify_profile_phase";
export const ADMIN_PHASE2_EVIDENCE_STORAGE_PATH_META_KEY = "admin_phase2_storage_path";
export const ADMIN_PHASE2_EVIDENCE_FILE_NAME_META_KEY = "admin_phase2_file_name";
export const ADMIN_PHASE2_EVIDENCE_ATTACHED_META_KEY = "admin_phase2_evidence_attached";

const ADMIN_VERIFY_PERSIST_ANSWER_KEYS: readonly string[] = [
  ADMIN_CASE_ENTRY_Q1_KEY,
  ADMIN_CASE_ENTRY_Q1_OTHER_KEY,
  CASE_CUSTOMER_INPUT_KEY,
  "profileDocumentSource",
  "case06_documentNature",
  "profileCurrentGoal",
  "profileAuthorityGuidance",
  "profilePerceivedIssue",
  ...CASE01_ANSWER_KEYS,
  ...CASE02_ANSWER_KEYS,
  ...CASE03_ANSWER_KEYS,
  ...CASE04_ANSWER_KEYS,
  ...CASE05_ANSWER_KEYS,
  ...CASE06_ANSWER_KEYS,
];

export function buildAdminVerifyAnswersPersistMeta(
  answers: ReviewAnswers,
): Record<string, string> {
  const payload: Record<string, string> = {};
  for (const key of ADMIN_VERIFY_PERSIST_ANSWER_KEYS) {
    const val = answers[key];
    if (typeof val === "string" && val.trim()) {
      payload[key] = val;
    }
  }
  if (Object.keys(payload).length === 0) return {};
  return { [ADMIN_VERIFY_ANSWERS_META_JSON_KEY]: JSON.stringify(payload) };
}

export function parseAdminRestoredProfilePhase(
  meta: Record<string, unknown>,
): AdminVerifyProfilePhase {
  if (meta[ADMIN_VERIFY_PROFILE_PHASE_META_KEY] === "2") return 2;
  return 1;
}

export function resolveAdminPhase2EvidenceFileName(
  answers: ReviewAnswers,
): string | null {
  const fromAnswers = answers[ADMIN_PHASE2_EVIDENCE_FILE_NAME_ANSWERS_KEY]?.trim();
  return fromAnswers || null;
}

export function buildAdminPhase2PersistMeta(
  answers: ReviewAnswers,
  profilePhase: AdminVerifyProfilePhase,
  page1Meta?: Record<string, string> | null,
  phase2EvidenceStoragePath?: string | null,
): Record<string, string> {
  const meta: Record<string, string> = {
    ...(page1Meta ?? {}),
    ...serializeCaseResolutionProfile(buildCaseResolutionProfile(answers)),
    ...buildAdminVerifyAnswersPersistMeta(answers),
    [ADMIN_VERIFY_PROFILE_PHASE_META_KEY]: String(profilePhase),
  };
  if (answers[ADMIN_PHASE2_EVIDENCE_ATTACHED_ANSWERS_KEY] === "1") {
    meta[ADMIN_PHASE2_EVIDENCE_ATTACHED_META_KEY] = "1";
    const fileName = answers[ADMIN_PHASE2_EVIDENCE_FILE_NAME_ANSWERS_KEY]?.trim();
    if (fileName) {
      meta[ADMIN_PHASE2_EVIDENCE_FILE_NAME_META_KEY] = fileName;
    }
  }
  if (phase2EvidenceStoragePath) {
    meta[ADMIN_PHASE2_EVIDENCE_STORAGE_PATH_META_KEY] = phase2EvidenceStoragePath;
  }
  return meta;
}

export function restoreAdminProfilingAnswersFromMeta(
  meta: Record<string, unknown>,
): ReviewAnswers | null {
  const raw = meta[ADMIN_VERIFY_ANSWERS_META_JSON_KEY];
  let parsed: Record<string, string> = {};
  if (typeof raw === "string" && raw.trim()) {
    try {
      parsed = JSON.parse(raw) as Record<string, string>;
    } catch {
      return null;
    }
  }

  const phase1FileName = typeof meta.file_name === "string" ? meta.file_name.trim() : "";
  if (phase1FileName) {
    parsed[ADMIN_PHASE1_EVIDENCE_FILE_NAME_KEY] = phase1FileName;
  } else if (typeof meta.storagePath === "string" && meta.storagePath.trim()) {
    parsed[ADMIN_PHASE1_EVIDENCE_FILE_NAME_KEY] = "첨부 자료";
  }

  if (meta[ADMIN_PHASE2_EVIDENCE_ATTACHED_META_KEY] === "1") {
    parsed[ADMIN_PHASE2_EVIDENCE_ATTACHED_ANSWERS_KEY] = "1";
    const phase2FileName =
      typeof meta[ADMIN_PHASE2_EVIDENCE_FILE_NAME_META_KEY] === "string"
        ? meta[ADMIN_PHASE2_EVIDENCE_FILE_NAME_META_KEY].trim()
        : "";
    if (phase2FileName) {
      parsed[ADMIN_PHASE2_EVIDENCE_FILE_NAME_ANSWERS_KEY] = phase2FileName;
    }
  }

  delete parsed.case05_actualCore;
  delete parsed.case05_dispositionSource;
  delete parsed.case04_actualCore;
  delete parsed.case04_submitResponse;
  delete parsed.case04_inquiryResponse;

  if (parsed.case03_confirmGoal === "understand_agency_intent") {
    if (!parsed.case03_inquiryFocus?.trim()) {
      parsed.case03_inquiryFocus = "unsure";
    }
    parsed.case03_confirmGoal = "prepare_materials";
  }
  if (parsed.case04_confirmGoal === "deadline") {
    parsed.case04_confirmGoal = "unsure";
    if (!parsed.case04_deadline?.trim()) {
      parsed.case04_deadline = "uncertain";
    }
  }

  if (Object.keys(parsed).length === 0) return null;

  const restored = attachCaseResolutionSnapshot({
    ...parsed,
    [ADMIN_PROFILING_COMPLETE_META_FLAG]: "1",
  });
  if (parseAdminRestoredProfilePhase(meta) === 2) {
    restored[ADMIN_RESTORED_PROFILE_PHASE_KEY] = "2";
  }
  return restored;
}

export function buildCaseResolutionMetaFromAnswers(
  answers: ReviewAnswers,
): Record<string, string> {
  const profile = buildCaseResolutionProfile(answers);
  return serializeCaseResolutionProfile(profile);
}

export type Case01Phase2QuestionPlanItem = {
  id: string;
  kind: ProfileQuestion["kind"];
  label: string;
  optionCount: number;
  hasDirectInput: boolean;
};

/** CASE_01 Phase2 — 현재 답변 상태에서 builder가 노출하는 질문 계획 (QA·Mission 검증용) */
export function buildCase01Phase2QuestionPlan(
  answers: ReviewAnswers,
): Case01Phase2QuestionPlanItem[] {
  const questions: ProfileQuestion[] = [];
  appendCase01Phase2Questions(questions, answers);
  return questions.map((question) => ({
    id: question.id,
    kind: question.kind,
    label: question.label,
    optionCount: question.kind === "choice" ? question.options.length : 0,
    hasDirectInput:
      question.kind === "choice" &&
      question.options.some((option) =>
        isAdminDirectExplainOption(option as { value: string; label: string }),
      ),
  }));
}

function case01TraceFieldAnswered(answers: ReviewAnswers, fieldId: string): boolean {
  return Boolean(answers[fieldId]?.trim());
}

function case01Phase2SkipReason(
  fieldId: string,
  answers: ReviewAnswers,
): string | null {
  if (fieldId === "case01_paymentDemandScope" && answers.case01_authorityDemand !== "payment") {
    return "authorityDemand !== payment";
  }
  if (
    fieldId === "case01_supplementDemandScope" &&
    answers.case01_authorityDemand !== "supplement"
  ) {
    return "authorityDemand !== supplement";
  }
  if (
    fieldId === CASE01_DEADLINE_DATE_KEY &&
    !case01DeadlineRequiresDateText(answers.case01_deadline)
  ) {
    return "deadline !== date-required slug";
  }
  if (
    fieldId === CASE01_FACT_COMPARE_GAP_KEY &&
    !case01FactRelationshipUsesCompareGap(answers.case01_factRelationship)
  ) {
    return "factRelationship !== cannot_compare_yet";
  }
  if (
    fieldId === CASE05_DEADLINE_DATE_KEY &&
    case05EffectiveDeadline(answers.case05_deadline) !== "specific_date"
  ) {
    return "deadline !== specific_date";
  }
  if (fieldId === CASE03_DEADLINE_DATE_KEY && answers.case03_deadline !== "specific_date") {
    return "deadline !== specific_date";
  }
  if (fieldId === CASE04_DEADLINE_DATE_KEY && answers.case04_deadline !== "specific_date") {
    return "deadline !== specific_date";
  }
  if (fieldId === CASE02_DEADLINE_DATE_KEY && answers.case02_deadline !== "confirmed") {
    return "deadline !== confirmed";
  }
  if (
    fieldId === CASE02_PAYMENT_AMOUNT_DETAIL_KEY &&
    !case02NeedsPaymentAmountDetail(answers)
  ) {
    return "paymentAmount does not need detail text";
  }
  if (
    fieldId === CASE03_ATTENDANCE_PLACE_KEY &&
    answers.case03_customerResponse !== "attendance"
  ) {
    return "customerResponse !== attendance";
  }
  if (
    fieldId === CASE03_ATTENDANCE_WHEN_WHERE_KEY &&
    answers.case03_evidence !== "attendance_notice"
  ) {
    return "evidence !== attendance_notice";
  }
  if (
    fieldId === CASE03_PREP_ATTENDANCE_DATE_KEY &&
    answers.case03_prepRequired !== "attendance_only"
  ) {
    return "prepRequired !== attendance_only";
  }
  if (fieldId === CASE01_FACT_DIFFERENCE_DETAIL_KEY && !case01NeedsFactDifferenceDetail(answers)) {
    return "factRelationship does not imply difference";
  }
  if (fieldId === CASE01_FACT_RELATIONSHIP_NOTE_KEY && !case01NeedsUnknownInfoGap(answers)) {
    return "factRelationship !== unknown gap";
  }
  if (fieldId === CASE01_DATE_PLACE_DETAIL_KEY && !case01NeedsDatePlaceDetail(answers)) {
    return "factRelationship !== date_place_wrong";
  }
  if (fieldId === "case01_responseDetail" && !case01CustomerRespondedImpliesAction(answers.case01_customerResponded)) {
    return "customerResponded implies no action";
  }
  if (
    fieldId === "case01_authorityResponse" &&
    !case01CustomerRespondedImpliesAction(answers.case01_customerResponded)
  ) {
    return "customerResponded implies no action";
  }
  if (fieldId === "case01_authorityDemandDetail") {
    if (!case01AuthorityDemandIsUnclear(answers.case01_authorityDemand)) {
      return "authorityDemand is clear";
    }
    if (
      answers.case01_authorityDemand === "demand_unclear" ||
      answers.case01_authorityDemand === "understanding_unknown" ||
      answers.case01_authorityDemand === "no_stated_demand"
    ) {
      return "comprehension uncertainty already captured on authorityDemand";
    }
  }
  if (fieldId === getAdminChoiceNoteKey("case01_authorityDemand") && !case01NeedsUnclearDemandDetail(answers)) {
    return "authorityDemand note not required";
  }
  if (
    fieldId === getAdminChoiceNoteKey("case01_authorityResponse") &&
    !case01NeedsAuthorityResponseFollowUp(answers)
  ) {
    return "authorityResponse follow-up not required";
  }
  if (fieldId === "case01_blockage" && !case01NeedsBlockage(answers)) {
    return "blockage gate not met";
  }
  if (fieldId === "case01_finalGoal" && !case01NeedsFinalGoal(answers)) {
    return "confirmGoal is clear";
  }
  return null;
}

/** CASE_01 Phase2 — 답변 경로별 실제 렌더 질문 순서 (브라우저 QA·Mission 검증용) */
export function traceCase01Phase2RenderedChain(finalAnswers: ReviewAnswers): {
  renderedQuestionIds: string[];
  renderedQuestions: Case01Phase2QuestionPlanItem[];
  skipped: Array<{ id: string; reason: string }>;
} {
  const renderedQuestionIds: string[] = [];
  const renderedQuestions: Case01Phase2QuestionPlanItem[] = [];
  const working: ReviewAnswers = {
    adminCaseDocumentKind: finalAnswers.adminCaseDocumentKind,
    situation: finalAnswers.situation,
    profileDocumentSource: finalAnswers.profileDocumentSource,
    profileReceivedReason: finalAnswers.profileReceivedReason,
    stage: finalAnswers.stage,
    _case01Active: finalAnswers._case01Active,
    case01_violationContent: finalAnswers.case01_violationContent,
    case01_factRelationship: finalAnswers.case01_factRelationship,
    case01_customerResponded: finalAnswers.case01_customerResponded,
    case01_confirmGoal: finalAnswers.case01_confirmGoal,
  };

  while (true) {
    const plan = buildCase01Phase2QuestionPlan(working);
    const next = plan.find((item) => !case01TraceFieldAnswered(working, item.id)) ?? null;
    if (!next) break;
    if (!case01TraceFieldAnswered(finalAnswers, next.id)) break;
    renderedQuestionIds.push(next.id);
    renderedQuestions.push(next);
    working[next.id] = finalAnswers[next.id];
  }

  const candidateIds = [
    "case01_authorityDemand",
    "case01_paymentDemandScope",
    "case01_supplementDemandScope",
    "case01_actualSituation",
    "case01_deadline",
    CASE01_DEADLINE_DATE_KEY,
    CASE01_FACT_DIFFERENCE_DETAIL_KEY,
    CASE01_FACT_RELATIONSHIP_NOTE_KEY,
    CASE01_DATE_PLACE_DETAIL_KEY,
    "case01_responseDetail",
    "case01_authorityResponse",
    "case01_authorityDemandDetail",
    getAdminChoiceNoteKey("case01_authorityDemand"),
    getAdminChoiceNoteKey("case01_authorityResponse"),
    "case01_evidence",
    "case01_blockage",
    "case01_finalGoal",
  ];

  const skipped: Array<{ id: string; reason: string }> = [];
  for (const candidateId of candidateIds) {
    if (renderedQuestionIds.includes(candidateId)) continue;
    const skipReason = case01Phase2SkipReason(candidateId, finalAnswers);
    if (skipReason) {
      skipped.push({ id: candidateId, reason: skipReason });
    }
  }

  return { renderedQuestionIds, renderedQuestions, skipped };
}

const CASE01_PHASE2_PROFILE_FIELD_MAP: Record<string, string> = {
  case01_authorityDemand: "authorityClaim",
  case01_paymentDemandScope: "case01_paymentDemandScope (classification)",
  case01_supplementDemandScope: "case01_supplementDemandScope (classification)",
  case01_actualSituation: "actualSituation",
  case01_deadline: "deadline",
  [CASE01_DEADLINE_DATE_KEY]: "deadline (confirmed date detail)",
  [CASE01_FACT_DIFFERENCE_DETAIL_KEY]: "factRelationship / actualSituation (difference detail)",
  [CASE01_FACT_RELATIONSHIP_NOTE_KEY]: "factRelationship (unknown gap)",
  [CASE01_DATE_PLACE_DETAIL_KEY]: "factRelationship (date/place detail)",
  case01_responseDetail: "case01_responseDetail (customer action detail)",
  case01_authorityResponse: "authorityResponse",
  case01_authorityDemandDetail: "authorityClaim (comprehension level)",
  [getAdminChoiceNoteKey("case01_authorityDemand")]: "authorityClaim (unclear demand note)",
  [getAdminChoiceNoteKey("case01_authorityResponse")]: "authorityResponse (follow-up note)",
  case01_evidence: "evidence",
  case01_blockage: "currentBlockage",
  case01_finalGoal: "goal",
};

const CASE01_PHASE2_AXIS_MAP: Record<string, string> = {
  case01_authorityDemand: "required action (what authority demanded)",
  case01_paymentDemandScope: "payment demand scope",
  case01_supplementDemandScope: "supplement demand scope",
  case01_actualSituation: "what actually happened (factual occurrence)",
  case01_deadline: "deadline guidance state (not required action)",
  [CASE01_DEADLINE_DATE_KEY]: "confirmed deadline date",
  [CASE01_FACT_DIFFERENCE_DETAIL_KEY]: "specific fact difference",
  [CASE01_FACT_RELATIONSHIP_NOTE_KEY]: "missing info to compare notice vs reality",
  [CASE01_DATE_PLACE_DETAIL_KEY]: "actual date/place",
  case01_responseDetail: "customer action taken",
  case01_authorityResponse: "authority reply after customer action",
  case01_authorityDemandDetail: "overall comprehension of authority guidance",
  [getAdminChoiceNoteKey("case01_authorityDemand")]: "unclear authority demand (text)",
  [getAdminChoiceNoteKey("case01_authorityResponse")]: "authority response detail (text)",
  case01_evidence: "evidence type held (not interpretation)",
  case01_blockage: "current blockage reason",
  case01_finalGoal: "final review goal (only when confirmGoal unclear)",
};

function getCase01Phase2ProductQuestions(working: ReviewAnswers): ProfileQuestion[] {
  const emptyFollow: Record<string, ProfileQuestion> = {};
  const emptyDocs = { mismatch: [] as { value: string; title: string }[], unknown: [], other: [] };
  const phase1 = buildAdminVerifyProfileQuestions(working, emptyFollow, emptyDocs, 1);
  const phase1Ids = new Set(phase1.map((question) => question.id));
  return buildAdminVerifyProfileQuestions(working, emptyFollow, emptyDocs, 2).filter(
    (question) =>
      question.id !== ADMIN_CASE_ENTRY_Q1_KEY &&
      !phase1Ids.has(question.id) &&
      question.id.startsWith("case01"),
  );
}

function getCase01ChoiceAnswerLabel(
  question: ProfileQuestion,
  value: string | undefined,
): string {
  if (!value) return "";
  if (question.kind !== "choice" || !question.options) return value;
  const hit = question.options.find((option) => option.value === value);
  return hit?.label ?? value;
}

function assessCase01QuestionAxisAlignment(question: ProfileQuestion): {
  aligned: boolean;
  note: string;
} {
  const id = question.id;
  const label = question.label ?? "";
  const options =
    question.kind === "choice" && question.options
      ? question.options.map((option) => ({
          value: option.value,
          label: option.label,
        }))
      : [];

  for (const option of options) {
    if (option.value === "other" && option.label !== ADMIN_DIRECT_EXPLAIN_LABEL) {
      return {
        aligned: false,
        note: `Direct input label must be "${ADMIN_DIRECT_EXPLAIN_LABEL}"`,
      };
    }
  }

  if (id === "case01_deadline") {
    if (/어떤 대응|무엇을 하라고/.test(label)) {
      return { aligned: false, note: "deadline question must not ask required action" };
    }
    for (const option of options) {
      if (option.value === "other") continue;
      if (/제출|출석|납부|설명하라/.test(option.label)) {
        return { aligned: false, note: `deadline choice mixes action: ${option.label}` };
      }
    }
    return { aligned: true, note: "deadline guidance state only; action from authorityDemand" };
  }

  if (id === "case01_authorityDemand") {
    if (/기한|언제까지/.test(label)) {
      return { aligned: false, note: "authorityDemand must not ask deadline" };
    }
    return { aligned: true, note: "required action axis separate from deadline" };
  }

  if (id === "case01_responseDetail") {
    if (/교통국에서는 어떻게 답변|다시 안내/.test(label)) {
      return { aligned: false, note: "responseDetail must not ask authority response" };
    }
    for (const option of options) {
      if (option.value === "other") continue;
      if (/추가 요구|답변을 받지|다시 안내/.test(option.label)) {
        return { aligned: false, note: `responseDetail mixes authority response: ${option.label}` };
      }
    }
    return { aligned: true, note: "customer action only" };
  }

  if (id === "case01_authorityResponse") {
    if (/무엇을 하셨나요|설명하거나 제출/.test(label)) {
      return { aligned: false, note: "authorityResponse must not ask customer action" };
    }
    return { aligned: true, note: "authority response only" };
  }

  if (id === "case01_evidence") {
    for (const option of options) {
      if (option.value === "other") continue;
      if (/확인할지|무엇을 확인|모르겠/.test(option.label)) {
        return { aligned: false, note: "evidence must be type-only, not interpretation" };
      }
    }
    return { aligned: true, note: "evidence type only" };
  }

  if (id === "case01_actualSituation") {
    if (/교통국에서 설명받은 내용과.*비교/.test(label)) {
      return { aligned: false, note: "actualSituation must not duplicate factRelationship comparison" };
    }
    return { aligned: true, note: "factual occurrence separate from relationship comparison (Phase1)" };
  }

  if (id === "case01_finalGoal") {
    return { aligned: true, note: "finalGoal only when confirmGoal unclear (adaptive)" };
  }

  if (id === "case01_authorityDemandDetail") {
    if (options.some((option) => option.value === "understanding_unknown")) {
      return {
        aligned: true,
        note: "comprehension level; skipped when authorityDemand=understanding_unknown",
      };
    }
  }

  return { aligned: true, note: CASE01_PHASE2_AXIS_MAP[id] ?? "single-axis question" };
}

export type Case01Phase2AuditStep = {
  order: number;
  questionId: string;
  questionText: string;
  choices: Array<{ value: string; label: string }>;
  selectedAnswer: { value: string; label: string };
  profileField: string;
  informationAxis: string;
  axisAligned: boolean;
  axisNote: string;
  nextQuestionId: string | null;
  nextRendered: boolean;
  skipReason: string | null;
};

/** CASE_01 Phase2 — product builder 기준 실제 렌더 체인 감사 (QA·Mission) */
export function buildCase01Phase2RenderedChainAudit(
  finalAnswers: ReviewAnswers,
): {
  renderedCount: number;
  steps: Case01Phase2AuditStep[];
  skipped: Array<{ questionId: string; reason: string }>;
  pathComplete: boolean;
} {
  const working: ReviewAnswers = {
    adminCaseDocumentKind: finalAnswers.adminCaseDocumentKind,
    situation: finalAnswers.situation,
    profileDocumentSource: finalAnswers.profileDocumentSource,
    profileReceivedReason: finalAnswers.profileReceivedReason,
    stage: finalAnswers.stage,
    _case01Active: finalAnswers._case01Active,
    case01_violationContent: finalAnswers.case01_violationContent,
    case01_factRelationship: finalAnswers.case01_factRelationship,
    case01_customerResponded: finalAnswers.case01_customerResponded,
    case01_confirmGoal: finalAnswers.case01_confirmGoal,
  };

  const steps: Case01Phase2AuditStep[] = [];
  let order = 0;

  while (true) {
    const productQuestions = getCase01Phase2ProductQuestions(working);
    const pending = productQuestions.find(
      (question) => !case01TraceFieldAnswered(working, question.id),
    );
    if (!pending) break;
    if (!case01TraceFieldAnswered(finalAnswers, pending.id)) break;

    order += 1;
    const selectedValue = finalAnswers[pending.id] ?? "";
    const axis = assessCase01QuestionAxisAlignment(pending);
    const choices =
      pending.kind === "choice" && pending.options
        ? pending.options.map((option) => ({ value: option.value, label: option.label }))
        : [];

    working[pending.id] = selectedValue;

    const afterQuestions = getCase01Phase2ProductQuestions(working);
    const nextPending = afterQuestions.find(
      (question) => !case01TraceFieldAnswered(working, question.id),
    );
    const nextId = nextPending?.id ?? null;
    const nextRendered = Boolean(
      nextId && case01TraceFieldAnswered(finalAnswers, nextId),
    );

    steps.push({
      order,
      questionId: pending.id,
      questionText: pending.label,
      choices,
      selectedAnswer: {
        value: selectedValue,
        label:
          pending.kind === "text"
            ? selectedValue
            : getCase01ChoiceAnswerLabel(pending, selectedValue),
      },
      profileField: CASE01_PHASE2_PROFILE_FIELD_MAP[pending.id] ?? pending.id,
      informationAxis: CASE01_PHASE2_AXIS_MAP[pending.id] ?? pending.id,
      axisAligned: axis.aligned,
      axisNote: axis.note,
      nextQuestionId: nextId,
      nextRendered,
      skipReason: nextId && !nextRendered ? case01Phase2SkipReason(nextId, finalAnswers) : null,
    });
  }

  const trace = traceCase01Phase2RenderedChain(finalAnswers);
  const profile = buildCaseResolutionProfile(attachCaseResolutionSnapshot(finalAnswers));
  const handoff = resolveCaseReclassificationHandoff(profile, finalAnswers);

  return {
    renderedCount: steps.length,
    steps,
    skipped: trace.skipped.map((item) => ({
      questionId: item.id,
      reason: item.reason,
    })),
    pathComplete: handoff.pathComplete,
  };
}

/** QA — CASE_01 시나리오 A~G 검증용 (내부) */
export function runCase01QaScenario(
  scenarioId: "A" | "B" | "C" | "D" | "E" | "F" | "G",
): {
  profile: CaseResolutionProfile;
  nextFocus: CaseResolutionQuestionFocus | null;
  pathComplete: boolean;
  caseId: MasterCaseId | "UNIVERSAL" | null;
} {
  const base: ReviewAnswers = {
    adminCaseDocumentKind: "violation_notice",
    situation: "received_document",
    profileDocumentSource: "court",
    profileReceivedReason: "rejection",
    stage: "case",
  };

  const phase1 = {
    case01_violationContent: "traffic",
    case01_factRelationship: "match",
    case01_customerResponded: "none",
    case01_deadline: "uncertain",
    case01_confirmGoal: "verify_applicability",
  };

  const scenarios: Record<string, ReviewAnswers> = {
    A: {
      ...base,
      ...phase1,
      case01_authorityDemand: "payment",
      case01_paymentDemandScope: "included_with_other",
      case01_actualSituation: "accept_facts",
      case01_deadline: "confirmed",
      case01_deadlineDate: "2026-10-15",
      case01_evidence: "notice",
    },
    B: {
      ...base,
      ...phase1,
      case01_factRelationship: "unknown",
      case01_confirmGoal: "why_notice",
      case01_authorityDemand: "demand_unclear",
      case01_actualSituation: "unsure",
      case01_deadline: "unknown",
      case01_evidence: "none",
      case01_factRelationshipNote: "날짜와 장소를 더 확인해야 합니다",
      case01_authorityDemandNote: "무엇을 해야 하는지 모르겠습니다",
      case01_blockage: "content_unclear",
    },
    C: {
      ...base,
      case01_violationContent: "traffic",
      case01_factRelationship: "partial_situation",
      case01_confirmGoal: "fact_difference",
      case01_customerResponded: "has_responded",
      case01_authorityDemand: "attendance",
      case01_actualSituation: "partial",
      case01_deadline: "uncertain",
      case01_responseDetail: "explained_situation",
      case01_authorityResponse: "more_required",
      case01_evidence: "submitted_docs",
      case01_factDifferenceDetail: "날짜가 다릅니다",
      case01_authorityResponseNote: "추가 서류를 요구했습니다",
    },
    D: {
      ...base,
      case01_violationContent: "traffic",
      case01_factRelationship: "deny_action",
      case01_confirmGoal: "fact_difference",
      case01_customerResponded: "has_responded",
      case01_authorityDemand: "attendance",
      case01_actualSituation: "deny",
      case01_deadline: "confirmed",
      case01_deadlineDate: "2026-11-01",
      case01_responseDetail: "disputed_facts",
      case01_authorityResponse: "re_attendance",
      case01_evidence: "notice",
      case01_factDifferenceDetail: "그 행동을 하지 않았습니다",
    },
    E: {
      ...base,
      case01_violationContent: "traffic",
      case01_factRelationship: "date_place_wrong",
      case01_confirmGoal: "fact_difference",
      case01_customerResponded: "none",
      case01_authorityDemand: "attendance",
      case01_actualSituation: "deny",
      case01_deadline: "uncertain",
      case01_evidence: "message",
      case01_factDifferenceDetail: "날짜와 장소가 다릅니다",
      case01_datePlaceDetail: "2024년 3월, 다른 지역에 있었습니다",
    },
    F: {
      ...base,
      ...phase1,
      case01_authorityDemand: "payment",
      case01_paymentDemandScope: "included_with_other",
      case01_actualSituation: "accept_facts",
      case01_deadline: "confirmed",
      case01_deadlineDate: "2026-12-01",
      case01_evidence: "notice",
    },
    G: {
      ...base,
      ...phase1,
      case01_authorityDemand: "supplement",
      case01_supplementDemandScope: "included_with_notice",
      case01_actualSituation: "accept_facts",
      case01_deadline: "confirmed",
      case01_deadlineDate: "2026-09-30",
      case01_evidence: "submitted_docs",
    },
  };

  const answers = attachCaseResolutionSnapshot(scenarios[scenarioId]);
  const profile = buildCaseResolutionProfile(answers);
  const handoff = resolveCaseReclassificationHandoff(profile, answers);
  return {
    profile,
    nextFocus: handoff.nextFocus,
    pathComplete: handoff.pathComplete,
    caseId: profile.caseClassification.value,
  };
}

/** QA — CASE_02 시나리오 A~E 검증용 (내부) */
export function runCase02QaScenario(
  scenarioId: "A" | "B" | "C" | "D" | "E",
): {
  profile: CaseResolutionProfile;
  nextFocus: CaseResolutionQuestionFocus | null;
  pathComplete: boolean;
  paymentSignals: PaymentSignalCode[];
} {
  const base: ReviewAnswers = {
    situation: "received_document",
    profileDocumentSource: "traffic",
    stage: "case",
  };

  const case02Base = {
    case02_demandAuthority: "traffic",
    case02_paymentSubject: "traffic_fine",
    case02_paymentInfoSource: "written_notice",
    case02_paymentAmount: CASE02_PAYMENT_AMOUNT_STATED_BASIS_UNCLEAR,
    case02_paymentBasis: "violation_stated",
    case02_situationMatch: "hard_to_judge",
    case02_deadline: "uncertain",
    case02_paymentStatus: "not_paid",
    case02_paymentMethod: "online_portal",
    case02_nonPaymentNotice: "no_notice",
    case02_blockage: "obligation",
    case02_evidence: "partial",
  };

  const scenarios: Record<string, ReviewAnswers> = {
    A: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]:
        "교통국에서 과태료 납부 요구를 받았는데 정말 납부해야 하는지 모르겠습니다",
      case02_confirmGoal: "verify_obligation",
      ...case02Base,
    },
    B: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "납부 요구 통지를 받았는데 금액이 통지 내용과 다릅니다",
      case02_confirmGoal: "verify_amount",
      ...case02Base,
      case02_paymentAmount: "amount_differs",
      case02_situationMatch: "partial",
      case02_blockage: "amount",
      case02_evidence: "yes",
    },
    C: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "납부하라는 안내를 받았는데 왜 납부해야 하는지 모르겠습니다",
      case02_confirmGoal: "why_pay",
      ...case02Base,
      case02_paymentBasis: "unclear",
      case02_blockage: "basis",
    },
    D: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "납부는 했는데 기관에서 처리되지 않았다고 합니다",
      case02_confirmGoal: "payment_processed",
      ...case02Base,
      case02_paymentStatus: "paid_unverified",
      case02_authorityResponse: "unclear",
      case02_blockage: "deadline",
      case02_evidence: "yes",
    },
    E: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "납부 요구라고 생각했는데 문서에는 출석 요구가 적혀 있습니다",
      case02_confirmGoal: "verify_obligation",
      ...case02Base,
      case02_paymentSubject: "unclear",
      case02_situationMatch: "not_applicable",
      case02_blockage: "obligation",
    },
  };

  const answers = attachCaseResolutionSnapshot(scenarios[scenarioId]);
  const profile = buildCaseResolutionProfile(answers);
  const handoff = resolveCaseReclassificationHandoff(profile, answers);
  return {
    profile,
    nextFocus: handoff.nextFocus,
    pathComplete: handoff.pathComplete,
    paymentSignals: derivePaymentSignals(answers),
  };
}

/** QA — CASE_03 시나리오 A~G 검증용 (내부) */
export function runCase03QaScenario(
  scenarioId: "A" | "B" | "C" | "D" | "E" | "F" | "G",
): {
  profile: CaseResolutionProfile;
  nextFocus: CaseResolutionQuestionFocus | null;
  pathComplete: boolean;
  factSignals: FactSignalCode[];
  explanationRound: number;
  responseRound: number;
} {
  const base: ReviewAnswers = {
    situation: "received_document",
    profileDocumentSource: "court",
    stage: "case",
  };

  const case03Base = {
    case03_authorityDemand: "prep_unclear",
    case03_confirmGoal: "prepare_materials",
    case03_customerResponse: "none",
    case03_prepRequired: "attendance_only",
    case03_deadline: "uncertain",
  };

  const scenarios: Record<string, ReviewAnswers> = {
    A: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "기관에서 출석하라고만 통보를 받았습니다",
      ...case03Base,
      case03_authorityDemand: "prep_unclear",
      case03_confirmGoal: "deadline_attendance",
    },
    B: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "출석 요구를 받았는데 무엇을 소명해야 하는지 모르겠습니다",
      ...case03Base,
      case03_authorityDemand: "reason_unclear",
      case03_confirmGoal: "prepare_materials",
      case03_inquiryFocus: "unsure",
    },
    C: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "기관이 문제 삼는 내용이 실제 상황과 다릅니다",
      ...case03Base,
      case03_authorityDemand: "specific_incident",
      case03_confirmGoal: "prepare_materials",
      case03_factRelationship: "mismatch",
    },
    D: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "이미 소명했는데 다시 출석하라고 합니다",
      ...case03Base,
      case03_authorityDemand: "repeat_demand",
      case03_confirmGoal: "repeat_response",
      case03_customerResponse: "attendance",
      case03_explanationDetail: "partial_explanation",
      case03_authorityFollowUp: "re_attendance",
      case03_repeatFollowUp: "re_attendance",
    },
    E: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "출석 요구 통지를 받았는데 내용을 확인해 보니 납부 안내가 핵심입니다",
      ...case03Base,
      case03_authorityDemand: "reason_unclear",
      case03_confirmGoal: "prepare_materials",
      case03_authorityFollowUp: "other_procedure",
    },
    F: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "출석 요구를 받았지만 실제 핵심은 보완서류 제출입니다",
      ...case03Base,
      case03_customerResponse: "phone_message",
      case03_explanationDetail: "with_submitted_docs",
      case03_authorityFollowUp: "more_docs",
      case03_repeatFollowUp: "more_docs",
    },
    G: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "출석 요구였지만 이미 처분이 내려진 것 같습니다",
      ...case03Base,
      case03_authorityDemand: "reason_unclear",
      case03_confirmGoal: "unsure",
      case03_inquiryFocus: "unclear",
    },
  };

  const answers = attachCaseResolutionSnapshot(scenarios[scenarioId]);
  const profile = buildCaseResolutionProfile(answers);
  const handoff = resolveCaseReclassificationHandoff(profile, answers);
  const rounds = deriveCase03Rounds(answers);
  return {
    profile,
    nextFocus: handoff.nextFocus,
    pathComplete: handoff.pathComplete,
    factSignals: deriveFactSignals(answers),
    explanationRound: rounds.explanationRound,
    responseRound: rounds.responseRound,
  };
}

/** QA — CASE_04 시나리오 A~H 검증용 (내부) */
export function runCase04QaScenario(
  scenarioId: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H",
): {
  profile: CaseResolutionProfile;
  nextFocus: CaseResolutionQuestionFocus | null;
  pathComplete: boolean;
  supplementSignals: SupplementSignalCode[];
  supplementRound: number;
  supplementResponseRound: number;
} {
  const base: ReviewAnswers = {
    situation: "post_submission_problem",
    profileDocumentSource: "immigration",
    profileProblemType: "rejected",
    stage: "case",
  };

  const case04Base = {
    case04_supplementTarget: "additional_docs",
    case04_confirmGoal: "understand_materials",
    case04_customerResponse: "not_started",
    case04_deadline: "uncertain",
    case04_initialSubmission: "complete",
    case04_submissionRelation: "add_missing",
    case04_supplementReason: "missing_info",
    case04_addDocDetail: "certificate",
  };

  const scenarios: Record<string, ReviewAnswers> = {
    A: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "기관에서 추가 서류를 제출하라고 보완 요구를 받았습니다",
      ...case04Base,
    },
    B: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "기관에서 기존 서류 내용을 수정하라고 보완 요구를 받았습니다",
      ...case04Base,
      case04_supplementTarget: "modify_existing",
      case04_modifyDetail: "content_info",
      case04_submissionRelation: "modify_content",
      case04_blockage: "format",
    },
    C: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "기관에서 증빙이 부족하다고 보완 요구를 받았습니다",
      ...case04Base,
      case04_supplementTarget: "add_content_evidence",
      case04_supplementReason: "no_reason",
      case04_evidenceDetail: "proof_doc",
      case04_submissionRelation: "support_existing",
      case04_blockage: "why_submit",
    },
    D: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "보완 제출 후 다시 보완 요구를 받았습니다",
      ...case04Base,
      case04_customerResponse: "submitted",
      case04_authorityFollowUp: "more_supplement",
      case04_repeatSupplement: "more_docs",
      case04_blockage: "after_submit",
      case04_evidence: "supplement_submission",
    },
    E: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "보완 요구라고 생각했지만 실제 핵심은 납부 요구입니다",
      ...case04Base,
      case04_blockage: "why_submit",
    },
    F: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "보완 요구를 받았지만 실제 핵심은 출석·소명입니다",
      ...case04Base,
      case04_blockage: "why_submit",
    },
    G: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "보완 요구였지만 이미 처분이 내려진 것 같습니다",
      ...case04Base,
      case04_blockage: "why_submit",
    },
    H: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "보완 요구 내용 자체가 이해되지 않습니다",
      ...case04Base,
      case04_supplementTarget: "unclear",
      case04_unclearFocus: "whole_unclear",
      case04_blockage: "why_submit",
      case04_finalGoal: "what_supplement",
    },
  };

  const answers = attachCaseResolutionSnapshot(scenarios[scenarioId]);
  const profile = buildCaseResolutionProfile(answers);
  const handoff = resolveCaseReclassificationHandoff(profile, answers);
  const rounds = deriveCase04Rounds(answers);
  return {
    profile,
    nextFocus: handoff.nextFocus,
    pathComplete: handoff.pathComplete,
    supplementSignals: deriveSupplementSignals(answers),
    supplementRound: rounds.supplementRound,
    supplementResponseRound: rounds.supplementResponseRound,
  };
}

/** QA — CASE_05 시나리오 A~H 검증용 (내부) */
export function runCase05QaScenario(
  scenarioId: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H",
): {
  profile: CaseResolutionProfile;
  nextFocus: CaseResolutionQuestionFocus | null;
  pathComplete: boolean;
  dispositionSignals: DispositionSignalCode[];
  dispositionResponseRound: number;
  dispositionReviewRound: number;
} {
  const base: ReviewAnswers = {
    situation: "received_document",
    profileDocumentSource: "immigration",
    profileReceivedReason: "review_request",
    stage: "case",
  };

  const case05Base = {
    case05_confirmGoal: "understand_reason",
    case05_dispositionReason: "violation_claimed",
    case05_factRelationship: "match",
    case05_customerResponse: "none",
    case05_authorityFollowUp: "no_response",
    case05_deadline: "not_stated",
    case05_blockage: "what_to_do",
    case05_evidence: "disposition_notice",
  };

  const scenarios: Record<string, ReviewAnswers> = {
    A: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "출입국에서 허가가 취소되었다는 처분 통지를 받았습니다",
      ...case05Base,
      case05_dispositionType: "license_revoked",
    },
    B: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "기관에서 업무정지 처분을 받았습니다",
      ...case05Base,
      case05_dispositionType: "business_suspended",
    },
    C: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "처분 통지를 받았는데 기관이 말한 내용이 실제와 일부 다릅니다",
      ...case05Base,
      case05_dispositionType: "other_disposition",
      case05_factRelationship: "partial",
      case05_blockage: "fact_match",
    },
    D: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "처분에 대해 소명했지만 기관이 처분 유지를 안내했습니다",
      ...case05Base,
      case05_dispositionType: "license_revoked",
      case05_customerResponse: "explanation_submitted",
      case05_authorityFollowUp: "maintained",
      case05_dispositionOutcome: "maintained",
      case05_repeatFollowUp: "maintained_again",
      case05_blockage: "next_action",
    },
    E: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "처분 통지를 받았지만 지금 핵심은 추가 납부 요구입니다",
      ...case05Base,
      case05_dispositionType: "other_disposition",
      case05_customerResponse: "inquired",
      case05_authorityFollowUp: "payment_demand",
      case05_dispositionOutcome: "more_docs_required",
      case05_repeatFollowUp: "not_applicable",
      case05_blockage: "what_to_do",
    },
    F: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "처분 통지 후 출석·소명이 현재 핵심입니다",
      ...case05Base,
      case05_dispositionType: "registration_cancelled",
      case05_customerResponse: "inquired",
      case05_authorityFollowUp: "attendance_explanation",
      case05_dispositionOutcome: "no_result",
      case05_repeatFollowUp: "not_applicable",
      case05_blockage: "appeal_method",
    },
    G: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "처분 통지 후 보완·추가 제출이 현재 핵심입니다",
      ...case05Base,
      case05_dispositionType: "other_disposition",
      case05_customerResponse: "documents_submitted",
      case05_authorityFollowUp: "more_docs",
      case05_dispositionOutcome: "more_docs_required",
      case05_repeatFollowUp: "not_applicable",
      case05_blockage: "evidence",
      case05_evidence: "submitted_docs",
    },
    H: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "처분 통지를 받았지만 무엇이 처분되었는지 문서가 불명확합니다",
      ...case05Base,
      case05_dispositionType: "unclear",
      case05_dispositionReason: "no_clear_reason",
      case05_factRelationship: "hard_to_judge",
      case05_blockage: "what_disposition",
      case05_evidence: "none",
      case05_finalGoal: "what_disposition",
    },
  };

  const answers = attachCaseResolutionSnapshot(scenarios[scenarioId]);
  const profile = buildCaseResolutionProfile(answers);
  const handoff = resolveCaseReclassificationHandoff(profile, answers);
  const rounds = deriveCase05Rounds(answers);
  return {
    profile,
    nextFocus: handoff.nextFocus,
    pathComplete: handoff.pathComplete,
    dispositionSignals: deriveDispositionSignals(answers),
    dispositionResponseRound: rounds.dispositionResponseRound,
    dispositionReviewRound: rounds.dispositionReviewRound,
  };
}

/** QA — CASE_06 시나리오 A~H 검증용 (내부) */
export function runCase06QaScenario(
  scenarioId: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H",
): {
  profile: CaseResolutionProfile;
  nextFocus: CaseResolutionQuestionFocus | null;
  pathComplete: boolean;
  unclearSignals: UnclearSignalCode[];
} {
  const base: ReviewAnswers = {
    situation: "received_document",
    stage: "case",
  };

  const case06Base = {
    profileDocumentSource: "specific_agency",
    case06_documentNature: "hard_to_classify",
    profileCurrentGoal: "hard_to_tell",
    profileAuthorityGuidance: "uncertain",
    profilePerceivedIssue: "overall_unclear",
    case06_keyPhrase: "main_body",
    case06_evidence: "original_notice",
    case06_blockage: "what_document",
  };

  const scenarios: Record<string, ReviewAnswers> = {
    A: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "무슨 문서인지 전혀 모르겠습니다",
      ...case06Base,
      profileDocumentSource: "cannot_identify",
      case06_exactSource: "cannot_tell",
    },
    B: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "회사에서 받은 문서인데 무엇을 해야 하는지 모르겠습니다",
      ...case06Base,
      profileDocumentSource: "non_admin",
      case06_documentNature: "supplement_docs",
      profileCurrentGoal: "submit_docs",
      case06_receiptPath: "in_person",
    },
    C: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "기한이 있는 것 같지만 무엇을 해야 하는지 모르겠습니다",
      ...case06Base,
      profileCurrentGoal: "hard_to_tell",
      profileAuthorityGuidance: "uncertain",
      profilePerceivedIssue: "deadline_unclear",
      case06_blockage: "deadline",
    },
    D: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "문서 내용이 불명확하고 기관도 모르겠습니다",
      ...case06Base,
      profileDocumentSource: "unknown_agency",
      profilePerceivedIssue: "why_received",
      case06_exactSource: "cannot_tell",
      case06_blockage: "which_authority",
    },
    E: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "문서를 읽어보니 납부를 해야 하는 것 같습니다",
      ...case06Base,
      case06_documentNature: "payment_demand",
      profileCurrentGoal: "pay_fee",
      profilePerceivedIssue: "what_to_do",
      case06_requiredAction: "pay_fee",
      case06_blockage: "what_action",
    },
    F: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "출석하라는 내용 같지만 정확히 모르겠습니다",
      ...case06Base,
      case06_documentNature: "attendance_explain",
      profileCurrentGoal: "attend_explain",
      profilePerceivedIssue: "what_to_do",
      case06_requiredAction: "attend_explain",
    },
    G: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "처분·조치 같지만 문서가 불명확합니다",
      ...case06Base,
      case06_documentNature: "disposition_action",
      profileCurrentGoal: "respond_disposition",
      case06_requiredAction: "wait_review",
    },
    H: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "전체적으로 무엇이 문제인지 모르겠습니다",
      profileDocumentSource: "specific_agency",
      case06_documentNature: "hard_to_classify",
      profileCurrentGoal: "hard_to_tell",
      profileAuthorityGuidance: "not_stated",
      profilePerceivedIssue: "overall_unclear",
      case06_blockage: "hard_to_point",
      case06_evidence: "no_materials",
      case06_finalGoal: "hard_to_tell",
    },
  };

  const answers = attachCaseResolutionSnapshot(scenarios[scenarioId]);
  const profile = buildCaseResolutionProfile(answers);
  const handoff = resolveCaseReclassificationHandoff(profile, answers);
  return {
    profile,
    nextFocus: handoff.nextFocus,
    pathComplete: handoff.pathComplete,
    unclearSignals: deriveUnclearSignals(answers),
  };
}

/** QA — 재분류 Handoff 검증용 (내부) */
export function runCaseReclassificationHandoffQaScenario(
  variant: "CASE_01D_INCOMPLETE" | "CASE_01D_TO_CASE02_COMPLETE",
): {
  profile: CaseResolutionProfile;
  nextFocus: CaseResolutionQuestionFocus | null;
  pathComplete: boolean;
} {
  const case01dBase: ReviewAnswers = {
    situation: "received_document",
    profileDocumentSource: "court",
    profileReceivedReason: "rejection",
    stage: "case",
    [CASE_CUSTOMER_INPUT_KEY]: "납부하라는 통지를 받았는데 금액이 맞는지 모르겠습니다",
    case01_confirmGoal: "verify_payment",
    case01_violationContent: "traffic",
    case01_actualSituation: "partial",
    case01_factRelationship: "partial",
    case01_authorityDemand: "payment",
    case01_customerResponded: "contacted",
    case01_authorityResponse: "unclear",
    case01_deadline: "uncertain",
    case01_blockage: "demand",
    case01_evidence: "yes",
  };

  const case02CompleteFields: ReviewAnswers = {
    case02_confirmGoal: "verify_amount",
    case02_demandAuthority: "traffic",
    case02_paymentSubject: "traffic_fine",
    case02_paymentAmount: "reason_unclear",
    case02_paymentBasis: "violation_stated",
    case02_situationMatch: "hard_to_judge",
    case02_deadline: "uncertain",
    case02_paymentStatus: "not_paid",
    case02_paymentMethod: "online_portal",
    case02_nonPaymentNotice: "no_notice",
    case02_blockage: "obligation",
    case02_evidence: "payment_notice",
  };

  const answers = attachCaseResolutionSnapshot(
    variant === "CASE_01D_INCOMPLETE"
      ? case01dBase
      : { ...case01dBase, ...case02CompleteFields },
  );
  const profile = buildCaseResolutionProfile(answers);
  const handoff = resolveCaseReclassificationHandoff(profile, answers);
  return {
    profile,
    nextFocus: handoff.nextFocus,
    pathComplete: handoff.pathComplete,
  };
}

export { CASE_CUSTOMER_INPUT_KEY, CASE_RESOLUTION_META_JSON_KEY };

export const ADMIN_EXPERT_HANDOFF_META_JSON_KEY = "admin_expert_handoff_json";

function buildAdminPhase1CarryOverLines(
  profile: CaseResolutionProfile,
): { label: string; value: string }[] {
  const lines: { label: string; value: string }[] = [];
  const push = (label: string, value: string | null | undefined) => {
    if (value?.trim()) lines.push({ label, value: value.trim() });
  };
  push(
    "사건 유형",
    profile.caseClassification.value
      ? MASTER_CASE_LABELS[profile.caseClassification.value]
      : null,
  );
  push("사건 앵커", profile.caseAnchor.value);
  push("관련 기관", profile.authority.value);
  push("문서", profile.document.value);
  push("확인 목적", profile.goal.value);
  return lines;
}

/** CRM expert_review_request meta — Case Resolution Profile + answers (no schema change). */
export function buildAdminExpertHandoffMeta(
  answers: ReviewAnswers,
  page1Meta?: Record<string, string> | null,
): Record<string, unknown> {
  const profile = buildCaseResolutionProfile(answers);
  const profileMeta: Record<string, unknown> = {
    ...serializeCaseResolutionProfile(profile),
    ...buildAdminVerifyAnswersPersistMeta(answers),
    ...(page1Meta ?? {}),
  };

  let phase2Answers: Record<string, string> = {};
  const answersRaw = buildAdminVerifyAnswersPersistMeta(answers)[ADMIN_VERIFY_ANSWERS_META_JSON_KEY];
  if (answersRaw) {
    try {
      phase2Answers = JSON.parse(answersRaw) as Record<string, string>;
    } catch {
      phase2Answers = {};
    }
  }

  const phase1CarryOver = buildAdminPhase1CarryOverLines(profile);

  const confirmedFacts: string[] = [];
  const inferredFacts: string[] = [];
  const unknownFacts: string[] = [];
  const skipKeys = new Set([
    "unknown",
    "riskSignals",
    "reclassificationHistory",
    "explanationRound",
    "responseRound",
    "supplementRound",
    "supplementResponseRound",
    "dispositionResponseRound",
    "dispositionReviewRound",
  ]);

  for (const [key, field] of Object.entries(profile)) {
    if (skipKeys.has(key)) continue;
    if (!field || typeof field !== "object" || !("status" in field)) continue;
    const pf = field as ProfileFact;
    if (pf.value == null || (typeof pf.value === "string" && !pf.value.trim())) continue;
    const line = `${key}: ${String(pf.value)}`;
    if (pf.status === "confirmed") confirmedFacts.push(line);
    else if (pf.status === "unknown") unknownFacts.push(line);
    else inferredFacts.push(line);
  }

  const expertFocus =
    profile.goal.value ??
    profile.caseAnchor.value ??
    profile.document.value ??
    "";

  return {
    ...profileMeta,
    [ADMIN_EXPERT_HANDOFF_META_JSON_KEY]: JSON.stringify({
      customerOriginalInput: profile.customerStatement.value ?? "",
      situationProfile: profile,
      phase1CarryOver,
      phase2Answers,
      confirmedFacts,
      inferredFacts,
      unknownFacts,
      expertFocus,
      caseClassification: profile.caseClassification.value,
    }),
  };
}

/** Layer J catalog — judgment field별 선택지 목록 (자동 추출 입력). */
export function getAdminVerifyChoiceOptionsForField(
  fieldId: string,
): readonly { value: string; label: string }[] | undefined {
  if (fieldId === "case06_documentNature") {
    return CASE06_DOCUMENT_NATURE_OPTIONS;
  }
  return ADMIN_VERIFY_MERGED_FIELD_OPTION_MAP[fieldId];
}
