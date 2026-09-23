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
  isCase06LegacyRestorePath,
  isCase06Phase2ChainComplete,
  isCase06RedesignPhase1Complete,
  selectCase06RedesignResolutionFocus,
} from "./adminVerifyCase06Redesign";

export {
  applyCase06BridgeSnapshot,
  isCase06AwaitingBridgeSnapshot,
  isCase06ExpertTerminal,
  isCase06Phase2ChainComplete,
  maybeApplyCase06ExpertTerminalOnAnswer,
  CASE06_BRIDGE_SNAPSHOT_COMMITTED_KEY,
  CASE06_BRIDGE_TARGET_CASE_KEY,
} from "./adminVerifyCase06Redesign";

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
export const ADMIN_CASE_ENTRY_Q1_LABEL =
  "교통국에서 받은 안내는 어떤 내용이라고 들으셨나요?";

export const ADMIN_CASE_ENTRY_Q1_OPTIONS: { value: string; label: string }[] = [
  { value: "violation_notice", label: "교통위반이나 문제를 알리는 통지라고 들었습니다." },
  { value: "payment_demand", label: "벌금이나 비용을 납부하라는 내용이라고 들었습니다." },
  { value: "attendance_demand", label: "출석하거나 설명하라는 내용이라고 들었습니다." },
  { value: "supplement_demand", label: "추가 서류나 보완을 요구하는 내용이라고 들었습니다." },
  { value: "disposition_notice", label: "면허의 정지·취소·거부 등 조치에 관한 내용이라고 들었습니다." },
  { value: "unclear", label: "무슨 내용인지 잘 모르겠습니다." },
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

export const CASE01_ANSWER_KEYS = [
  "case01_confirmGoal",
  "case01_violationContent",
  "case01_actualSituation",
  "case01_factRelationship",
  "case01_authorityDemand",
  "case01_authorityDemandDetail",
  "case01_paymentDemandScope",
  "case01_supplementDemandScope",
  "case01_customerResponded",
  "case01_responseDetail",
  "case01_authorityResponse",
  "case01_deadline",
  "case01_blockage",
  "case01_evidence",
  "case01_finalGoal",
] as const;

export const CASE01_FACT_DIFFERENCE_DETAIL_KEY = "case01_factDifferenceDetail";
export const CASE01_DATE_PLACE_DETAIL_KEY = "case01_datePlaceDetail";
export const CASE01_DEADLINE_DATE_KEY = "case01_deadlineDate";
export const CASE01_RESPONSE_DETAIL_NOTE_KEY = "case01_responseDetailNote";

const CASE01_CONFIRM_GOAL_OPTIONS = [
  {
    value: "verify_applicability",
    label: "실제로 제 상황에 해당하는지 확인하고 싶습니다.",
  },
  {
    value: "why_notice",
    label: "왜 이런 문제라고 판단했는지 확인하고 싶습니다.",
  },
  {
    value: "fact_difference",
    label: "실제 상황과 교통국 설명 중 무엇이 다른지 확인하고 싶습니다.",
  },
  {
    value: "what_when",
    label: "지금 무엇을 해야 하는지 확인하고 싶습니다.",
  },
  {
    value: "procedure_followup",
    label: "이후 어떤 절차가 진행되는지 확인하고 싶습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_VIOLATION_CONTENT_NOTE_KEY = "case01_violationContentNote";
export const CASE01_FACT_RELATIONSHIP_NOTE_KEY = "case01_factRelationshipNote";
export const CASE01_CUSTOMER_RESPONDED_NOTE_KEY = "case01_customerRespondedNote";

const CASE01_VIOLATION_CONTENT_OPTIONS = [
  {
    value: "other_stated",
    label: "실제 행동이나 상황을 문제라고 설명받은 것 같습니다.",
  },
  {
    value: "traffic",
    label: "특정 날짜나 장소의 일을 문제라고 설명받은 것 같습니다.",
  },
  {
    value: "administrative",
    label: "면허·차량·등록 관련 내용을 문제라고 설명받은 것 같습니다.",
  },
  {
    value: "labor_tax",
    label: "제출한 서류·신고·등록 내용을 문제라고 설명받은 것 같습니다.",
  },
  {
    value: "explanation_unknown",
    label: "교통국에서 무엇을 문제라고 보는지 설명받지 못했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_ACTUAL_SITUATION_OPTIONS = [
  {
    value: "accept_facts",
    label: "실제로 그런 행동이나 상황이 있었습니다.",
  },
  {
    value: "partial_similar",
    label: "비슷한 일이 있었지만 중요한 부분이 다릅니다.",
  },
  {
    value: "deny",
    label: "그런 행동이나 상황이 실제로는 없었습니다.",
  },
  {
    value: "partial",
    label: "일부는 맞지만 전체 상황은 설명받은 내용과 다릅니다.",
  },
  {
    value: "unsure",
    label: "당시 상황을 정확히 정리하거나 설명하기 어렵습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_FACT_RELATIONSHIP_OPTIONS = [
  {
    value: "match",
    label:
      "교통국에서 설명받은 내용과 제가 알고 있는 실제 상황이 대체로 같습니다.",
  },
  {
    value: "date_place_wrong",
    label: "날짜나 장소가 제가 기억하는 실제 상황과 다릅니다.",
  },
  {
    value: "deny_action",
    label: "제가 실제로 한 행동이나 상황이 설명받은 내용과 다릅니다.",
  },
  {
    value: "partial_situation",
    label: "일부는 맞지만 전체 상황은 설명받은 내용과 다릅니다.",
  },
  {
    value: "unknown",
    label:
      "설명은 들었지만 실제 상황과 같은지 다른지 판단하기 어렵습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_AUTHORITY_DEMAND_OPTIONS = [
  { value: "attendance", label: "추가 설명이나 출석을 하라고 안내했습니다." },
  { value: "supplement", label: "추가 서류나 자료를 제출하라고 안내했습니다." },
  { value: "payment", label: "비용·벌금·과태료를 납부하라고 안내했습니다." },
  {
    value: "correct_record",
    label: "기존 제출 내용이나 기록을 수정하거나 확인하라고 안내했습니다.",
  },
  {
    value: "demand_unclear",
    label:
      "구체적으로 무엇을 하라는지 안내하지 않았거나, 설명은 들었지만 무엇을 해야 하는지 정확히 이해하지 못했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_PAYMENT_DEMAND_SCOPE_OPTIONS = [
  { value: "core_case", label: "이번 문제의 핵심입니다." },
  { value: "included_with_other", label: "다른 문제와 함께 포함된 요구입니다." },
  { value: "additional_guidance", label: "추가로 안내받은 내용입니다." },
  { value: "unsure", label: "잘 모르겠습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_SUPPLEMENT_DEMAND_SCOPE_OPTIONS = [
  { value: "core_case", label: "이번 보완 요구가 문제의 핵심입니다." },
  { value: "included_with_notice", label: "통지 안내에 포함된 보완 요구입니다." },
  { value: "additional_guidance", label: "추가로 안내받은 보완 요구입니다." },
  { value: "unsure", label: "잘 모르겠습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_CUSTOMER_RESPONDED_OPTIONS = [
  { value: "none", label: "아직 교통국에 별도로 대응하지 않았습니다." },
  {
    value: "has_responded",
    label: "교통국에 어떤 형태로든 대응한 경험이 있습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_LEGACY_CUSTOMER_RESPONDED_ACTION_VALUES = new Set([
  "explained_unresolved",
  "resubmitted",
  "still_unresolved",
  "more_demand",
]);

const CASE01_RESPONSE_DETAIL_OPTIONS = [
  { value: "explained_situation", label: "당시 상황을 설명했습니다." },
  { value: "submitted_materials", label: "관련 서류나 자료를 제출했습니다." },
  {
    value: "disputed_facts",
    label: "설명받은 내용과 실제 상황이 다르다고 이야기했습니다.",
  },
  { value: "fulfilled_demand", label: "안내받은 내용을 처리했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_AUTHORITY_RESPONSE_OPTIONS = [
  { value: "completed", label: "추가 요구 없이 처리되었다고 들었습니다." },
  { value: "more_required", label: "추가 서류나 자료를 요청했습니다." },
  { value: "re_attendance", label: "다시 출석하거나 설명하라고 했습니다." },
  { value: "payment_demand", label: "비용 납부나 다른 조치를 안내했습니다." },
  { value: "no_reply_yet", label: "아직 답변을 받지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_DEADLINE_OPTIONS = [
  {
    value: "confirmed",
    label: "대응해야 하는 날짜를 구체적으로 안내받았습니다.",
  },
  {
    value: "uncertain",
    label: "기한이 있다고 들었지만 정확한 날짜는 확인하지 못했습니다.",
  },
  {
    value: "asap",
    label: "가능한 한 빨리 대응하라는 안내만 받았습니다.",
  },
  {
    value: "no_stated",
    label: "별도의 기한은 안내받지 않았습니다.",
  },
  {
    value: "unknown",
    label: "기한에 대한 설명을 받지 못했거나 정확히 이해하지 못했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_BLOCKAGE_UI_OPTIONS = [
  {
    value: "content_unclear",
    label: "받은 안내를 제 상황에 맞게 이해·정리하기 어렵습니다.",
  },
  {
    value: "how_respond",
    label: "기관에 어떻게 대응해야 할지 다음 조치가 불분명합니다.",
  },
  {
    value: "next_step",
    label: "이미 문의·제출을 했지만, 다음에 무엇을 해야 할지 불분명합니다.",
  },
  {
    value: "facts_why",
    label: "어떤 사실을 어떤 순서로 설명·소명해야 할지 정리되지 않았습니다.",
  },
  {
    value: "evidence",
    label: "확인·제출에 필요한 자료를 무엇으로 준비해야 할지 막혀 있습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_EVIDENCE_OPTIONS = [
  {
    value: "notice",
    label: "교통국에서 받은 통지·안내 문서가 있습니다.",
  },
  {
    value: "message",
    label: "교통국 또는 상대방과 주고받은 문자·메시지·이메일이 있습니다.",
  },
  {
    value: "submitted_docs",
    label: "제출한 서류나 접수·납부 증빙이 있습니다.",
  },
  {
    value: "photo_video",
    label: "당시 상황을 확인할 수 있는 사진·영상·기타 자료가 있습니다.",
  },
  {
    value: "none",
    label: "현재 가지고 있는 관련 자료가 없습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_AUTHORITY_DEMAND_DETAIL_OPTIONS = [
  {
    value: "clear_guidance",
    label: "무엇을 하라는 안내가 분명하게 전달되었습니다.",
  },
  {
    value: "partial_guidance",
    label: "대략 들었지만 세부 내용이 불분명합니다.",
  },
  {
    value: "understanding_unknown",
    label: "설명은 들었지만 무엇을 해야 하는지 정확히 이해하지 못했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE01_FINAL_GOAL_UI_OPTIONS = [
  {
    value: "situation_fit",
    label:
      "이 안내가 제 상황에 해당하는지, 안내 내용과 실제 상황이 맞는지 확인하고 싶어요.",
  },
  { value: "why_notice", label: "왜 이런 안내를 받았는지 확인하고 싶어요." },
  {
    value: "what_deadline",
    label: "지금 무엇을 해야 하는지, 기한과 대응 방법을 확인하고 싶어요.",
  },
  { value: "followup", label: "이미 대응한 결과와 다음 단계를 확인하고 싶어요." },
  { value: "expert", label: "전문가에게 제 상황을 정확히 전달하고 싶어요." },
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

function inferCase01ActualSituationFromFactRelationship(
  relationship: string | undefined,
): string | undefined {
  if (!relationship) return undefined;
  if (relationship === "match") return "accept_facts";
  if (relationship === "partial_situation") return "partial";
  if (relationship === "deny_action" || relationship === "date_place_wrong") return "deny";
  if (relationship === "unknown" || relationship === "hard_to_explain" || relationship === "hard_to_judge") {
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
  return options.find((option) => option.value === value)?.label ?? null;
}

function isCase01TrafficNoticeContext(answers: ReviewAnswers): boolean {
  if (getQ1ResolvedCase(answers) === "CASE_01") return true;
  if (answers._case01Active === "1") return true;
  return Boolean(answers.case01_violationContent || answers.case01_confirmGoal);
}

export const CASE01_OPTION_LABELS: Record<string, string> = {
  ...Object.fromEntries(CASE01_CONFIRM_GOAL_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE01_VIOLATION_CONTENT_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE01_ACTUAL_SITUATION_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE01_FACT_RELATIONSHIP_OPTIONS.map((o) => [o.value, o.label])),
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
  explanation_unknown: "교통국에서 무엇을 문제라고 보는지 설명받지 못했습니다.",
  unsure: "교통국에서 무엇을 문제라고 보는지 설명받지 못했습니다.",
  understanding_unknown: "설명은 들었지만 무엇을 해야 하는지 정확히 이해하지 못했습니다.",
  demand_unclear:
    "구체적으로 무엇을 하라는지 안내하지 않았거나, 설명은 들었지만 무엇을 해야 하는지 정확히 이해하지 못했습니다.",
  no_stated_demand: "구체적으로 무엇을 하라는지 안내하지 않았습니다.",
  situation_fit:
    "이 안내가 제 상황에 해당하는지, 안내 내용과 실제 상황이 맞는지 확인하고 싶어요.",
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
};

function case01FactRelationshipImpliesDifference(relationship: string | undefined): boolean {
  return (
    relationship === "date_place_wrong" ||
    relationship === "deny_action" ||
    relationship === "partial_situation" ||
    relationship === "info_mismatch" ||
    relationship === "mismatch" ||
    relationship === "partial" ||
    relationship === "other"
  );
}

function case01CustomerRespondedImpliesAction(value: string | undefined): boolean {
  if (!value || value === "none" || value === "response_unknown") return false;
  if (value === "has_responded") return true;
  return CASE01_LEGACY_CUSTOMER_RESPONDED_ACTION_VALUES.has(value);
}

function case01NeedsPaymentDemandScope(answers: ReviewAnswers): boolean {
  if (answers.case01_authorityDemand !== "payment") return false;
  return !isAdminVerifyChoiceFieldComplete(
    "case01_paymentDemandScope",
    answers,
    CASE01_PAYMENT_DEMAND_SCOPE_OPTIONS,
  );
}

function case01NeedsSupplementDemandScope(answers: ReviewAnswers): boolean {
  if (answers.case01_authorityDemand !== "supplement") return false;
  return !isAdminVerifyChoiceFieldComplete(
    "case01_supplementDemandScope",
    answers,
    CASE01_SUPPLEMENT_DEMAND_SCOPE_OPTIONS,
  );
}

function case01NeedsActualSituationQuestion(answers: ReviewAnswers): boolean {
  return !isAdminVerifyChoiceFieldComplete(
    "case01_actualSituation",
    answers,
    CASE01_ACTUAL_SITUATION_OPTIONS,
  );
}

function case01NeedsFactDifferenceDetail(answers: ReviewAnswers): boolean {
  const relationship = answers.case01_factRelationship;
  if (!relationship || relationship === "match" || relationship === "unknown") return false;
  if (!case01FactRelationshipImpliesDifference(relationship)) return false;
  return !answers[CASE01_FACT_DIFFERENCE_DETAIL_KEY]?.trim();
}

function case01NeedsUnknownInfoGap(answers: ReviewAnswers): boolean {
  if (answers.case01_factRelationship !== "unknown") return false;
  if (answers[CASE01_FACT_DIFFERENCE_DETAIL_KEY]?.trim()) return false;
  return !answers[CASE01_FACT_RELATIONSHIP_NOTE_KEY]?.trim();
}

function case01NeedsDatePlaceDetail(answers: ReviewAnswers): boolean {
  if (answers.case01_factRelationship !== "date_place_wrong") return false;
  return !answers[CASE01_DATE_PLACE_DETAIL_KEY]?.trim();
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
  if (case01NeedsAuthorityDemandDetailChoice(answers)) return false;
  return !answers[getAdminChoiceNoteKey("case01_authorityDemand")]?.trim();
}

function case01NeedsAuthorityResponseFollowUp(answers: ReviewAnswers): boolean {
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

function case01NeedsDeadlineDateDetail(answers: ReviewAnswers): boolean {
  if (answers.case01_deadline !== "confirmed") return false;
  return !answers[CASE01_DEADLINE_DATE_KEY]?.trim();
}

function case01NeedsBlockage(answers: ReviewAnswers): boolean {
  const rel = answers.case01_factRelationship;
  if (rel === "unknown") return true;
  if (
    answers.case01_deadline === "asap" ||
    answers.case01_deadline === "overdue_concern"
  ) {
    return true;
  }
  if (case01AuthorityDemandIsUnclear(answers.case01_authorityDemand)) {
    return true;
  }
  if (case01ConfirmGoalIsUnclear(answers)) return true;
  return false;
}

function case01NeedsDeadlinePhase2(answers: ReviewAnswers): boolean {
  return !isAdminVerifyChoiceFieldComplete(
    "case01_deadline",
    answers,
    CASE01_DEADLINE_OPTIONS,
  );
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
  const hasActualSituation = case01Phase2FieldAnswered(
    answers,
    "case01_actualSituation",
    CASE01_ACTUAL_SITUATION_OPTIONS,
  );
  const hasFactRelationship = isAdminVerifyChoiceFieldComplete(
    "case01_factRelationship",
    answers,
    CASE01_FACT_RELATIONSHIP_OPTIONS,
  );
  const hasResponseTrack =
    !case01CustomerRespondedImpliesAction(answers.case01_customerResponded) ||
    (case01Phase2FieldAnswered(answers, "case01_responseDetail", CASE01_RESPONSE_DETAIL_OPTIONS) &&
      case01Phase2FieldAnswered(answers, "case01_authorityResponse", CASE01_AUTHORITY_RESPONSE_OPTIONS));
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
      "case01_factRelationship",
      answers,
      CASE01_FACT_RELATIONSHIP_OPTIONS,
    ) &&
    isAdminVerifyChoiceFieldComplete(
      "case01_customerResponded",
      answers,
      CASE01_CUSTOMER_RESPONDED_OPTIONS,
    ) &&
    isAdminVerifyChoiceFieldComplete("case01_deadline", answers, CASE01_DEADLINE_OPTIONS) &&
    isAdminVerifyChoiceFieldComplete("case01_confirmGoal", answers, CASE01_CONFIRM_GOAL_OPTIONS)
  );
}

function appendCase01Phase1Questions(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  pushUnique(questions, {
    id: "case01_violationContent",
    kind: "choice",
    label:
      "교통국이나 다른 사람에게 설명받은 내용으로, 무엇이 문제라고 하는지 어떻게 이해하셨나요?",
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
    id: "case01_factRelationship",
    kind: "choice",
    label:
      "교통국에서 설명받은 내용과, 제가 알고 있는 실제 상황을 비교하면 어떤가요?",
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

  pushUnique(questions, {
    id: "case01_customerResponded",
    kind: "choice",
    label: "이 안내를 받은 뒤 교통국에 대응한 경험이 있나요?",
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
    id: "case01_deadline",
    kind: "choice",
    label: "교통국에서 대응해야 하는 기한에 대해 어떻게 안내받으셨나요?",
    options: CASE01_DEADLINE_OPTIONS,
  });
  if (
    !isAdminVerifyChoiceFieldComplete("case01_deadline", answers, CASE01_DEADLINE_OPTIONS)
  ) {
    return;
  }

  pushUnique(questions, {
    id: "case01_confirmGoal",
    kind: "choice",
    label: "지금 이 문제에서 가장 먼저 확인하고 싶은 것은 무엇인가요?",
    options: CASE01_CONFIRM_GOAL_OPTIONS,
  });
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
      label: "지금 이 문제에서 다음 대응을 하기 가장 어려운 이유는 무엇인가요?",
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
      label: "이번 검토를 통해 가장 먼저 확인하거나 해결하고 싶은 것은 무엇인가요?",
      options: CASE01_FINAL_GOAL_UI_OPTIONS,
    });
  }
}

function appendCase01Phase2Questions(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  pushUnique(questions, {
    id: "case01_authorityDemand",
    kind: "choice",
    label: "교통국에서는 이 안내를 받은 뒤 구체적으로 무엇을 하라고 안내했나요?",
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
      label: "이 비용 납부가 이번 문제의 핵심인가요, 아니면 교통국에서 받은 안내에 포함된 추가 요구인가요?",
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
        "이 보완 요구가 이번 문제의 핵심인가요, 아니면 교통국 안내에 포함된 추가 요구인가요?",
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

  pushUnique(questions, {
    id: "case01_actualSituation",
    kind: "choice",
    label: "교통국의 설명과 별개로, 실제로 어떤 일이 있었는지 가장 가까운 것은 무엇인가요?",
    options: CASE01_ACTUAL_SITUATION_OPTIONS,
  });
  if (case01NeedsActualSituationQuestion(answers)) {
    return;
  }

  if (case01NeedsDeadlinePhase2(answers)) {
    pushUnique(questions, {
      id: "case01_deadline",
      kind: "choice",
      label: "교통국에서 대응해야 하는 기한에 대해 어떻게 안내받으셨나요?",
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
      placeholder: "기억나는 날짜·기한을 적어 주세요.",
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
      label: "교통국에 대응했다면, 실제로 무엇을 하셨나요?",
      options: CASE01_RESPONSE_DETAIL_OPTIONS,
    });
    if (case01NeedsResponseDetail(answers)) {
      return;
    }
  }

  if (case01NeedsAuthorityResponse(answers)) {
    pushUnique(questions, {
      id: "case01_authorityResponse",
      kind: "choice",
      label: "그 뒤 교통국에서는 어떻게 답변하거나 다시 안내했나요?",
      options: CASE01_AUTHORITY_RESPONSE_OPTIONS,
    });
    if (case01NeedsAuthorityResponse(answers)) {
      return;
    }
  }

  if (case01NeedsAuthorityDemandDetailChoice(answers)) {
    pushUnique(questions, {
      id: "case01_authorityDemandDetail",
      kind: "choice",
      label: "지금까지 들은 교통국 안내를 전체적으로 어떻게 이해하고 있나요?",
      options: CASE01_AUTHORITY_DEMAND_DETAIL_OPTIONS,
    });
    if (case01NeedsAuthorityDemandDetailChoice(answers)) {
      return;
    }
  }

  pushUnique(questions, {
    id: "case01_evidence",
    kind: "choice",
    label: "지금 가지고 있는 자료 중 이 상황과 관련된 것은 무엇인가요?",
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
  appendCase01Phase2Questions(questions, answers);
}

function case01PathFieldsComplete(answers: ReviewAnswers): boolean {
  if (!isCase01Phase1Complete(answers)) return false;
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

// ─── CASE_02 납부 요구 Resolution Path ───

export const CASE02_ANSWER_KEYS = [
  "case02_confirmGoal",
  "case02_demandAuthority",
  "case02_paymentSubject",
  "case02_paymentInfoSource",
  "case02_paymentAmount",
  "case02_paymentBasis",
  "case02_situationMatch",
  "case02_deadline",
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
  {
    value: "verify_obligation",
    label: "기관에서 말하는 납부 의무가 실제로 내 상황에 해당하는지 확인하고 싶습니다.",
  },
  {
    value: "verify_amount",
    label: "통지된 금액이 맞는지, 왜 이 금액을 내야 하는지 확인하고 싶습니다.",
  },
  {
    value: "how_when_where",
    label: "언제·어디서·어떤 방법으로 납부해야 하는지 확인하고 싶습니다.",
  },
  {
    value: "payment_processed",
    label: "이미 납부했는데 왜 다시 요구받았는지, 처리 여부를 확인하고 싶습니다.",
  },
  {
    value: "unsure",
    label: "아직은 무엇부터 확인해야 할지조차 정확히 모르겠습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_PAYMENT_INFO_SOURCE_OPTIONS = [
  {
    value: "written_notice",
    label: "교통국에서 받은 통지서·안내문·문자 등 문서나 메시지로 알게 되었습니다.",
  },
  {
    value: "verbal_authority",
    label: "교통국 방문·전화·구두 안내 또는 통역을 통해 들었습니다.",
  },
  {
    value: "third_party",
    label: "지인·대행·통역 도움 등 다른 사람이 알려 주었습니다.",
  },
  {
    value: "online_channel",
    label: "인터넷·앱·전자납부 안내 등 온라인 경로로 알게 되었습니다.",
  },
  {
    value: "recall_unclear",
    label: "납부 안내를 받은 것은 기억나지만, 어떻게 알게 되었는지는 정확히 말하기 어렵습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_DEMAND_AUTHORITY_OPTIONS = [
  { value: "traffic", label: "교통국·교통 관련 행정기관에서 요구한 것으로 보입니다." },
  { value: "police", label: "경찰 등 교통 관련 기관에서 요구한 것으로 보입니다." },
  { value: "vehicle_reg", label: "차량 등록·검사 관련 기관에서 요구한 것으로 보입니다." },
  { value: "other_agency", label: "위에 없는 다른 기관에서 요구한 것으로 보입니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_PAYMENT_SUBJECT_OPTIONS = [
  {
    value: "traffic_fine",
    label: "교통위반에 대한 벌금·과태료를 내라고 안내받은 것 같습니다.",
  },
  {
    value: "license_fee",
    label: "운전면허 발급·갱신·변경과 관련된 비용을 내라고 안내받은 것 같습니다.",
  },
  {
    value: "vehicle_reg_fee",
    label: "차량 등록·검사 등 차량 관련 비용을 내라고 안내받은 것 같습니다.",
  },
  {
    value: "additional_related",
    label: "이전에 처리한 내용과 관련해 추가 금액을 내라고 요구받은 것 같습니다.",
  },
  {
    value: "unclear",
    label: "왜 돈을 내야 하는지 설명이 없거나, 정확히 이해하지 못했습니다.",
  },
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
  {
    value: CASE02_PAYMENT_AMOUNT_STATED_BASIS_UNCLEAR,
    label:
      "금액은 어느 정도 알고 있지만, 실제로 내야 하는 금액이 맞는지 확신하지 못하고, 왜 이 금액인지·어떤 기준인지도 아직 명확하지 않습니다.",
  },
  {
    value: "amount_differs",
    label: "이전에 알고 있던 금액과 지금 안내받은 금액이 서로 다릅니다.",
  },
  {
    value: "paid_redemand",
    label:
      "이미 납부했거나 일부 납부했는데, 다른 금액을 다시 납부하라는 안내를 받았습니다.",
  },
  {
    value: "amount_unknown",
    label: "납부 금액을 아직 정확히 파악하기 어렵습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_PAYMENT_BASIS_OPTIONS = [
  {
    value: "violation_stated",
    label: "특정 교통위반이나 과태료·벌금 사유가 적혀 있다고 안내받은 것 같습니다.",
  },
  {
    value: "license_admin",
    label: "운전면허 관련 행정 비용이라고 안내받은 것 같습니다.",
  },
  {
    value: "vehicle_related",
    label: "차량이나 이전 처리와 관련된 비용이라고 안내받은 것 같습니다.",
  },
  {
    value: "unclear",
    label: "왜 납부해야 하는지·납부 사유를 정확히 파악하지 못했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_SITUATION_MATCH_OPTIONS = [
  { value: "match", label: "이 납부 요구는 실제 상황과 대체로 맞습니다." },
  {
    value: "partial",
    label: "일부 내용이나 금액이 실제 상황과 다르다고 느껴집니다.",
  },
  {
    value: "not_applicable",
    label: "제가 이 납부 의무와 관련된 상황인지 의문이 있습니다.",
  },
  {
    value: "hard_to_judge",
    label: "실제 상황과 문서 내용을 대조하기 어렵습니다.",
  },
  { value: "unknown", label: "맞는지 판단할 정보가 부족합니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_PAYMENT_STATUS_OPTIONS = [
  { value: "not_paid", label: "아직 이 납부 요구에 대해 납부하지 않았습니다." },
  {
    value: "partial",
    label: "일부 금액만 납부했고, 나머지는 아직 납부하지 않았습니다.",
  },
  { value: "full", label: "요구된 금액을 모두 납부했습니다." },
  {
    value: "paid_unverified",
    label: "납부했다고 생각하지만, 기관에서 처리됐는지 확인하지 못했습니다.",
  },
  { value: "paid_by_other", label: "본인이 아닌 다른 사람이 대신 납부했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_PAYMENT_METHOD_OPTIONS = [
  { value: "bank_transfer", label: "지정 계좌 이체·은행 창구에서 납부하라고 안내받았습니다." },
  { value: "office_visit", label: "기관 방문·창구에서 직접 납부하라고 안내받았습니다." },
  {
    value: "online_portal",
    label: "인터넷·전자납부·앱 등 온라인으로 납부하라고 안내받았습니다.",
  },
  {
    value: "not_stated",
    label:
      "어디서 어떻게 내라는 안내를 받지 못했거나, 안내를 받았어도 방법을 정확히 이해하지 못했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_NON_PAYMENT_NOTICE_OPTIONS = [
  {
    value: CASE02_NON_PAYMENT_SANCTION_STATED,
    label:
      "기한 내 미납 시 추가 벌금·제재가 있거나, 강제징수·추심 등 후속 조치가 있다고 안내합니다.",
  },
  { value: "interest_stated", label: "이자·가산금이 붙는다고 안내합니다." },
  {
    value: "no_notice",
    label: "미납 시 어떻게 되는지 안내가 없거나, 결과를 정확히 모르겠습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_DEADLINE_OPTIONS = [
  { value: "confirmed", label: "납부해야 하는 날짜를 확인했습니다." },
  {
    value: "uncertain",
    label: "기한이 있다는 것은 알지만 정확한 날짜는 아직 확인하지 못했습니다.",
  },
  {
    value: "deadline_mentioned",
    label: "기한이 있다는 안내만 받았고, 정확한 날짜는 확인하지 못했습니다.",
  },
  {
    value: "not_stated",
    label: "기한이 있는지 자체를 아직 확인하지 못했습니다.",
  },
  { value: "unsure", label: "현재 기한과 관련된 내용을 전혀 알지 못합니다." },
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

export function isAdminVerifyChoiceFieldComplete(
  questionId: string,
  answers: ReviewAnswers,
  options: { value: string; label: string }[],
): boolean {
  const value = answers[questionId]?.trim() ?? "";
  if (!value) return false;
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

export const CASE01_PHASE1_FIELD_ORDER = [
  "case01_violationContent",
  "case01_factRelationship",
  "case01_customerResponded",
  "case01_deadline",
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

export const CASE03_PHASE1_FIELD_ORDER = [
  "case03_authorityDemand",
  "case03_confirmGoal",
  "case03_customerResponse",
  "case03_deadline",
] as const;

function getCase03Phase1VisibleFields(_answers: ReviewAnswers): string[] {
  return [...CASE03_PHASE1_FIELD_ORDER];
}

export const CASE04_PHASE1_FIELD_ORDER = [
  "case04_supplementTarget",
  "case04_confirmGoal",
  "case04_customerResponse",
  "case04_deadline",
] as const;

function getCase04Phase1VisibleFields(_answers: ReviewAnswers): string[] {
  return [...CASE04_PHASE1_FIELD_ORDER];
}

export const CASE05_PHASE1_FIELD_ORDER = [
  "case05_dispositionType",
  "case05_confirmGoal",
  "case05_customerResponse",
  "case05_deadline",
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

export const CASE02_PHASE1_FIELD_ORDER = [
  "case02_paymentSubject",
  "case02_paymentInfoSource",
  "case02_situationMatch",
  "case02_paymentAmount",
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

function case02ShouldAskDemandAuthority(answers: ReviewAnswers): boolean {
  return !answers.case02_demandAuthority;
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

export function getAdminVerifyStitchProgress(
  answers: ReviewAnswers,
  questions: { id: string }[],
  activeQuestionIndex: number,
  profilePhase: AdminVerifyProfilePhase,
): { current: number; total: number } {
  const q1Case = getQ1ResolvedCase(answers);
  const activeQuestion = questions[activeQuestionIndex];
  const activeId = activeQuestion?.id ?? "";

  if (profilePhase === 1 && q1Case && q1Case !== "UNIVERSAL") {
    const phase1Fields = getAdminVerifyPhase1VisibleFields(answers, q1Case);
    const q1Complete = isAdminCaseEntryQ1Complete(answers);
    const total = (q1Complete ? 1 : 0) + phase1Fields.length;
    if (!q1Complete || activeId === ADMIN_CASE_ENTRY_Q1_KEY) {
      return { current: 1, total };
    }
    const phase1Index = phase1Fields.indexOf(activeId);
    if (phase1Index >= 0) {
      return { current: 1 + phase1Index + 1, total };
    }
    return {
      current: Math.min(activeQuestionIndex >= 0 ? activeQuestionIndex + 1 : 1, total),
      total,
    };
  }

  if (profilePhase === 2 && q1Case && q1Case !== "UNIVERSAL") {
    const phase2Ids = questions
      .map((question) => question.id)
      .filter((id) => id !== ADMIN_CASE_ENTRY_Q1_KEY);
    const total = phase2Ids.length;
    if (total === 0) {
      return { current: 1, total: 1 };
    }
    if (activeId === ADMIN_CASE_ENTRY_Q1_KEY) {
      return { current: 1, total };
    }
    const phase2Index = phase2Ids.indexOf(activeId);
    if (phase2Index >= 0) {
      return { current: phase2Index + 1, total };
    }
    return {
      current: Math.min(activeQuestionIndex >= 0 ? activeQuestionIndex : 0, total),
      total,
    };
  }

  return {
    current: activeQuestionIndex >= 0 ? activeQuestionIndex + 1 : 1,
    total: questions.length,
  };
}

const CASE02_BLOCKAGE_OPTIONS = [
  { value: "obligation", label: "제가 정말 납부해야 하는지부터 확신이 없습니다" },
  { value: "amount", label: "얼마를 내야 하는지가 가장 막힙니다" },
  { value: "basis", label: "왜 납부해야 하는지 근거가 불분명합니다" },
  { value: "method", label: "어디서 어떻게 납부해야 하는지 모르겠습니다" },
  {
    value: "deadline",
    label: "언제까지 납부해야 하는지 모르거나, 이미 납부했는데 처리 여부를 확인하지 못했습니다",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_EVIDENCE_OPTIONS = [
  { value: "yes", label: "납부 요구서·영수증·통지서 등 확인할 자료가 있습니다" },
  { value: "partial", label: "일부 자료만 있고 무엇이 더 필요한지 모르겠습니다" },
  { value: "no", label: "지금 확인할 수 있는 자료가 없습니다" },
  {
    value: "unsure",
    label: "어떤 자료를 준비해야 하는지 모르겠습니다",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE02_FINAL_GOAL_OPTIONS = [
  { value: "verify_obligation", label: "납부 의무 여부부터 확인하고 싶어요" },
  { value: "verify_amount", label: "금액이 맞는지 확인하고 싶어요" },
  { value: "complete_payment", label: "올바른 방법으로 납부를 마치고 싶어요" },
  { value: "expert", label: "전문가에게 제 상황을 정확히 전달하고 싶어요" },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE02_OPTION_LABELS: Record<string, string> = {
  ...Object.fromEntries(CASE02_CONFIRM_GOAL_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_PAYMENT_INFO_SOURCE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_DEMAND_AUTHORITY_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_PAYMENT_SUBJECT_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_PAYMENT_AMOUNT_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_PAYMENT_BASIS_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_SITUATION_MATCH_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_PAYMENT_STATUS_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_PAYMENT_METHOD_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_NON_PAYMENT_NOTICE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_DEADLINE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_BLOCKAGE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_EVIDENCE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE02_FINAL_GOAL_OPTIONS.map((o) => [o.value, o.label])),
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
};

const CASE02_FIELD_OPTION_MAP: Record<string, { value: string; label: string }[]> = {
  case02_demandAuthority: CASE02_DEMAND_AUTHORITY_OPTIONS,
  case02_paymentInfoSource: CASE02_PAYMENT_INFO_SOURCE_OPTIONS,
  case02_paymentSubject: CASE02_PAYMENT_SUBJECT_OPTIONS,
  case02_paymentBasis: CASE02_PAYMENT_BASIS_OPTIONS,
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
  const options = CASE02_FIELD_OPTION_MAP[fieldId];
  const matched = options?.find((option) => option.value === value);
  return matched?.label ?? value;
}

/** CASE_02 Direct Input — CASE_05 dispositionType "other" + note 패턴과 동일 */
function getCase02FieldLabelFromAnswers(
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

function case02NeedsDeadlinePhase2(answers: ReviewAnswers): boolean {
  if (
    isAdminVerifyChoiceFieldComplete("case02_deadline", answers, CASE02_DEADLINE_OPTIONS)
  ) {
    return false;
  }
  const goal = answers.case02_confirmGoal;
  if (goal === "how_when_where") return true;
  const status = answers.case02_paymentStatus;
  if (status === "not_paid" || status === "partial") return true;
  if (
    goal === "verify_obligation" ||
    goal === "verify_amount" ||
    goal === "payment_processed" ||
    goal === "why_pay"
  ) {
    return true;
  }
  return false;
}

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
  const subject = answers.case02_paymentSubject;
  const status = answers.case02_paymentStatus;
  if (
    goal === "verify_obligation" ||
    goal === "why_pay" ||
    goal === "verify_amount" ||
    goal === "payment_processed" ||
    goal === "unsure"
  ) {
    return true;
  }
  if (case02PaymentSubjectImpliesUnclear(subject) || subject === "additional_related") {
    return true;
  }
  if (status === "paid_unverified" || status === "partial") return true;
  return false;
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
  if (answers.case02_confirmGoal === "verify_amount") return true;
  if (answers.case02_paymentSubject === "additional_related") return true;
  if (answers.case02_paymentStatus === "partial") return true;
  const match = case02EffectiveSituationMatch(answers.case02_situationMatch);
  return (
    match === "partial" ||
    match === "not_applicable" ||
    match === "hard_to_judge" ||
    match === "unknown"
  );
}

function case02NeedsPaymentBasisPhase2(answers: ReviewAnswers): boolean {
  const goal = answers.case02_confirmGoal;
  if (goal === "why_pay" || goal === "verify_obligation") return true;
  if (case02PaymentSubjectImpliesUnclear(answers.case02_paymentSubject)) return true;
  return answers.case02_situationMatch === "not_applicable";
}

function case02NeedsBlockage(_answers: ReviewAnswers): boolean {
  return true;
}

function case02NeedsEvidence(answers: ReviewAnswers): boolean {
  if (case02HasPaidStatus(answers)) return true;
  const goal = answers.case02_confirmGoal;
  if (goal === "verify_obligation" || goal === "verify_amount") {
    return true;
  }
  const amount = case02EffectivePaymentAmount(answers.case02_paymentAmount);
  if (
    amount === "amount_differs" ||
    amount === "amount_unknown" ||
    amount === "reason_unclear" ||
    amount === CASE02_PAYMENT_AMOUNT_STATED_BASIS_UNCLEAR
  ) {
    return true;
  }
  const match = case02EffectiveSituationMatch(answers.case02_situationMatch);
  return (
    match === "partial" ||
    match === "not_applicable" ||
    match === "hard_to_judge" ||
    match === "unknown"
  );
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
    label: "교통국에서는 어떤 이유로 돈을 납부하라고 안내했나요?",
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
    id: "case02_paymentInfoSource",
    kind: "choice",
    label: "그 비용을 내야 한다는 내용은 어떻게 알게 되셨나요?",
    options: CASE02_PAYMENT_INFO_SOURCE_OPTIONS,
  });
  if (
    !isAdminVerifyChoiceFieldComplete(
      "case02_paymentInfoSource",
      seeded,
      CASE02_PAYMENT_INFO_SOURCE_OPTIONS,
    )
  ) {
    return;
  }

  pushUnique(questions, {
    id: "case02_situationMatch",
    kind: "choice",
    label:
      "말씀하신 비용은 실제로 있었던 일과 어떻게 연결된다고 알고 계신가요?",
    options: CASE02_SITUATION_MATCH_OPTIONS,
  });
  if (
    !isAdminVerifyChoiceFieldComplete(
      "case02_situationMatch",
      seeded,
      CASE02_SITUATION_MATCH_OPTIONS,
    )
  ) {
    return;
  }

  pushUnique(questions, {
    id: "case02_paymentAmount",
    kind: "choice",
    label: "얼마를 내야 한다고 안내받으셨나요?",
    options: CASE02_PAYMENT_AMOUNT_OPTIONS,
  });
  if (
    !isAdminVerifyChoiceFieldComplete(
      "case02_paymentAmount",
      seeded,
      CASE02_PAYMENT_AMOUNT_OPTIONS,
    )
  ) {
    return;
  }

  pushUnique(questions, {
    id: "case02_paymentStatus",
    kind: "choice",
    label: "이 비용에 대해서는 지금까지 어떻게 대응하셨나요?",
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
    label: "지금 이 비용 문제에서 가장 확인하고 싶은 것은 무엇인가요?",
    options: CASE02_CONFIRM_GOAL_OPTIONS,
  });
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

  if (case02NeedsSituationMatchPhase2(answers)) {
    pushUnique(questions, {
      id: "case02_situationMatch",
      kind: "choice",
      label:
        "교통국에서 설명한 비용 요구와 실제 상황을 비교하면, 가장 다른 부분은 무엇인가요?",
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
        "교통국에서 안내한 금액에 대해, 지금 본인이 알고 있는 상황은 어떤 경우에 가장 가까운가요?",
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

  if (case02NeedsPaymentBasisPhase2(answers)) {
    pushUnique(questions, {
      id: "case02_paymentBasis",
      kind: "choice",
      label: "교통국에서는 그 금액을 왜 내야 한다고 설명했나요?",
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
      label: "이 납부와 관련해 언제까지 납부해야 하는지 확인할 수 있는 상태인가요?",
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

  if (case02HasPaidStatus(answers)) {
    if (case02NeedsAuthorityResponse(answers.case02_paymentStatus)) {
      pushUnique(questions, {
        id: "case02_authorityResponse",
        kind: "choice",
        label: "비용에 대해 교통국에 확인한 뒤, 어떤 답변을 받으셨나요?",
        options: CASE01_AUTHORITY_RESPONSE_OPTIONS,
      });
      if (!answers.case02_authorityResponse) return;
    }

    pushUnique(questions, {
      id: "case02_paymentMethod",
      kind: "choice",
      label: "어떤 방법으로 납부하셨나요?",
      options: CASE02_PAYMENT_METHOD_OPTIONS,
    });
    if (!answers.case02_paymentMethod) return;
  } else if (case02NeedsNonPaymentNotice(answers)) {
    pushUnique(questions, {
      id: "case02_paymentMethod",
      kind: "choice",
      label: "실제로 납부해야 한다면, 어떤 방법으로 내라고 안내받으셨나요?",
      options: CASE02_PAYMENT_METHOD_OPTIONS,
    });
    if (!answers.case02_paymentMethod) return;

    pushUnique(questions, {
      id: "case02_nonPaymentNotice",
      kind: "choice",
      label: "기한 내 납부하지 않으면 어떻게 된다고 안내되었나요?",
      options: CASE02_NON_PAYMENT_NOTICE_OPTIONS,
    });
    if (!answers.case02_nonPaymentNotice) return;
  }

  if (case02NeedsBlockage(answers)) {
    pushUnique(questions, {
      id: "case02_blockage",
      kind: "choice",
      label: "지금 이 납부 사건에서 가장 막혀 있는 부분은 무엇인가요?",
      options: CASE02_BLOCKAGE_OPTIONS,
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
        ? "납부 영수증·이체 증빙 등 확인할 자료가 있나요?"
        : "지금 확인할 수 있는 자료가 있나요?",
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
      label: "이 납부 요구와 관련해 어떤 결과를 원하시나요?",
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

  if (case02HasPaidStatus(answers)) {
    if (
      case02NeedsAuthorityResponse(answers.case02_paymentStatus) &&
      !answers.case02_authorityResponse
    ) {
      return false;
    }
    if (!answers.case02_paymentMethod) return false;
  } else if (case02NeedsNonPaymentNotice(answers)) {
    if (!answers.case02_paymentMethod) return false;
    if (!answers.case02_nonPaymentNotice) return false;
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
  const paymentBasisValue = answers.case02_paymentBasis;
  const paymentBasis =
    paymentBasisValue === "other"
      ? answers[getAdminChoiceNoteKey("case02_paymentBasis")]?.trim()
        ? "unclear"
        : paymentBasisValue
      : paymentBasisValue;

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

export const CASE03_ANSWER_KEYS = [
  ...CASE03_PHASE1_FIELD_ORDER,
  "case03_factRelationship",
  "case03_inquiryFocus",
  "case03_explanationDetail",
  "case03_authorityFollowUp",
  "case03_prepRequired",
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
  {
    value: "reason_unclear",
    label: "왜 출석하거나 설명해야 하는지 아직 정확히 이해하지 못한 상황입니다.",
  },
  {
    value: "specific_incident",
    label: "특정 사건이나 행동에 대해 설명해 달라는 요청을 받은 상황입니다.",
  },
  {
    value: "submission_review",
    label: "제출한 내용이나 신청 과정에서 확인할 부분 때문에 설명을 요구받은 상황입니다.",
  },
  {
    value: "repeat_demand",
    label: "이미 설명했는데 다시 출석하거나 추가 설명을 요구받은 상황입니다.",
  },
  {
    value: "prep_unclear",
    label: "무엇을 준비해서 가야 하는지까지는 아직 알기 어려운 상황입니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE03_CONFIRM_GOAL_OPTIONS = [
  {
    value: "understand_agency_intent",
    label: "기관에서 정확히 무엇을 확인하려는지 알고 싶습니다.",
  },
  {
    value: "prepare_materials",
    label: "어떤 자료나 내용을 준비해야 하는지 알고 싶습니다.",
  },
  {
    value: "sufficient_explanation",
    label: "이미 설명한 내용으로 충분한지 확인하고 싶습니다.",
  },
  {
    value: "deadline_attendance",
    label: "정해진 날짜에 반드시 출석해야 하는지와 기한을 확인하고 싶습니다.",
  },
  {
    value: "repeat_response",
    label: "이미 대응했는데 다시 무엇을 해야 하는지 확인하고 싶습니다.",
  },
  {
    value: "unsure",
    label: "지금 무엇부터 준비하고 대응해야 할지 모르겠습니다.",
  },
];

const CASE03_INQUIRY_FOCUS_OPTIONS = [
  {
    value: "action_facts",
    label: "제가 한 행동이나 발생한 상황에 대해 확인하려는 것으로 이해했습니다.",
  },
  {
    value: "submitted_docs",
    label: "제출한 서류나 정보에 대해 확인하려는 것으로 이해했습니다.",
  },
  {
    value: "specific_event",
    label: "특정 날짜·사건·행동에 대해 확인하려는 것으로 이해했습니다.",
  },
  {
    value: "unclear",
    label: "무엇을 확인하려는 것인지 명확하지 않습니다.",
  },
  {
    value: "unsure",
    label: "교통국이 무엇을 확인하려는지 설명받지 못했거나 정확히 이해하지 못했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE03_FACT_RELATIONSHIP_OPTIONS = [
  { value: "match", label: "기관이 확인하려는 내용과 실제 상황이 대체로 맞습니다." },
  {
    value: "partial",
    label: "일부 내용이 실제 상황과 다르다고 느껴집니다.",
  },
  {
    value: "mismatch",
    label: "실제 상황과 기관이 확인하려는 내용이 상당히 다릅니다.",
  },
  {
    value: "hard_to_judge",
    label: "실제 상황과 문서 내용을 대조하기 어렵습니다.",
  },
  { value: "unknown", label: "맞는지 판단할 정보가 부족합니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE03_CUSTOMER_RESPONSE_OPTIONS = [
  { value: "none", label: "아직 기관에 설명하거나 직접 방문하지 않았습니다." },
  {
    value: "phone_message",
    label: "전화·메시지 등으로 기관에 문의하거나 상황을 설명했습니다.",
  },
  {
    value: "attendance",
    label: "지정된 장소에 직접 방문해 상황을 설명했습니다.",
  },
  {
    value: "explanation_with_docs",
    label: "상황을 설명하면서 관련 서류나 자료도 함께 제출했습니다.",
  },
  {
    value: "other_method",
    label: "전화나 방문과 다른 방법으로 기관에 대응했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE03_EXPLANATION_DETAIL_OPTIONS = [
  {
    value: "full_explanation",
    label: "제가 알고 있는 사실과 당시 상황을 직접 설명했습니다.",
  },
  {
    value: "with_submitted_docs",
    label: "설명하면서 관련 서류나 자료도 함께 제출했습니다.",
  },
  {
    value: "partial_explanation",
    label: "질문받은 일부 내용만 설명했고 아직 충분히 설명하지 못했습니다.",
  },
  {
    value: "agency_redemand",
    label: "설명했지만 기관에서 다시 다른 내용이나 자료를 요구했습니다.",
  },
  {
    value: "attended_insufficient",
    label: "출석은 했지만 무엇을 설명해야 하는지 정확히 몰라 충분히 대응하지 못했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE03_AUTHORITY_FOLLOWUP_OPTIONS = [
  {
    value: "no_further_action",
    label: "추가 대응 없이 절차가 계속 진행된다고 안내했습니다.",
  },
  {
    value: "more_explanation",
    label: "추가 설명이나 소명을 다시 요구했습니다.",
  },
  {
    value: "more_docs",
    label: "추가 자료나 서류를 다시 요구했습니다.",
  },
  {
    value: "re_attendance",
    label: "다시 방문하거나 출석하라고 안내했습니다.",
  },
  {
    value: "other_procedure",
    label: "납부·보완·처분 등 다른 절차를 안내했습니다.",
  },
  {
    value: "no_response",
    label: "아직 기관 답변을 받지 못했습니다.",
  },
  {
    value: "unsure",
    label: "받은 안내를 정확히 이해하기 어렵습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE03_PREP_REQUIRED_OPTIONS = [
  {
    value: "documents",
    label: "관련 서류나 증빙을 준비해서 가야 할 것 같습니다.",
  },
  {
    value: "explanation",
    label: "사실관계를 정리해서 설명할 준비가 필요합니다.",
  },
  {
    value: "attendance_only",
    label: "지정된 날짜에 출석하는 것만으로 충분할 것 같습니다.",
  },
  {
    value: "unknown",
    label: "무엇을 준비해야 하는지 아직 정확히 알기 어렵습니다.",
  },
  {
    value: "prep_other",
    label: "위에 없는 다른 준비가 필요한 것 같습니다.",
  },
  {
    value: "unsure",
    label: "준비해야 할 것을 정확히 모르겠습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE03_REPEAT_FOLLOWUP_OPTIONS = [
  {
    value: "more_explanation",
    label: "추가 설명이나 소명을 다시 요구했습니다.",
  },
  {
    value: "re_attendance",
    label: "다시 방문하거나 출석하라고 안내했습니다.",
  },
  {
    value: "more_docs",
    label: "추가 자료나 서류를 다시 요구했습니다.",
  },
  {
    value: "multiple",
    label: "설명·출석·자료 등 여러 가지를 다시 요구했습니다.",
  },
  {
    value: "not_applicable",
    label: "반복 요구는 없었거나 아직 확인하지 못했습니다.",
  },
];

const CASE03_DEADLINE_OPTIONS = [
  {
    value: "specific_date",
    label: "출석하거나 설명해야 하는 날짜를 확인했습니다.",
  },
  {
    value: "uncertain",
    label: "기한이 있다는 것은 알지만 정확한 날짜는 아직 확인하지 못했습니다.",
  },
  {
    value: "period_stated",
    label: "기한이 있다는 안내만 받았고, 정확한 날짜는 확인하지 못했습니다.",
  },
  {
    value: "not_stated",
    label: "기한이 있는지 자체를 아직 확인하지 못했습니다.",
  },
  {
    value: "unsure",
    label: "현재 기한과 관련된 내용을 전혀 알지 못합니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE03_BLOCKAGE_OPTIONS = [
  { value: "what_explain", label: "기관에 무엇을 어떻게 설명해야 하는지 모르겠습니다" },
  { value: "what_docs", label: "어떤 서류·증빙을 준비해야 하는지 모르겠습니다" },
  { value: "why_attend", label: "왜 출석·소명을 요구하는지 이해하지 못했습니다" },
  { value: "when_attend", label: "언제까지 출석·제출해야 하는지 모르겠습니다" },
  { value: "after_explain", label: "설명·제출 후 다음에 무엇을 해야 하는지 모르겠습니다" },
  { value: "demand_unclear", label: "기관 요구 전체가 문서만으로는 이해되지 않습니다" },
  { value: "unsure", label: "가장 막힌 부분을 정확히 말하기 어렵습니다" },
];

const CASE03_EVIDENCE_OPTIONS = [
  { value: "notice", label: "출석·소명 요구 통지서·안내문" },
  { value: "attendance_notice", label: "출석 일시·장소가 적힌 별도 안내" },
  { value: "email", label: "기관 이메일" },
  { value: "message", label: "기관 문자·메신저·전화 안내 내역" },
  { value: "submitted_docs", label: "이미 제출한 서류·소명서" },
  { value: "receipt", label: "접수증·제출 확인서" },
  { value: "evidence_other", label: "위에 없는 다른 자료" },
  { value: "none", label: "지금 확인할 수 있는 자료가 없습니다" },
  { value: "unsure", label: "어떤 자료가 필요한지 모르겠습니다" },
];

const CASE03_FINAL_GOAL_OPTIONS = [
  { value: "understand_demand", label: "기관 요구를 이해하고 싶습니다" },
  { value: "prepare_response", label: "대응 준비가 필요합니다" },
  { value: "verify_facts", label: "사실관계를 확인하고 싶습니다" },
  { value: "expert", label: "전문가 확인이 필요합니다" },
  { value: "goal_other", label: "위에 없는 다른 확인 목표가 있습니다" },
];

const CASE03_FIELD_OPTIONS: Record<string, { value: string; label: string }[]> = {
  case03_authorityDemand: CASE03_AUTHORITY_DEMAND_OPTIONS,
  case03_confirmGoal: CASE03_CONFIRM_GOAL_OPTIONS,
  case03_customerResponse: CASE03_CUSTOMER_RESPONSE_OPTIONS,
  case03_deadline: CASE03_DEADLINE_OPTIONS,
};

const CASE03_FIELD_OPTION_MAP: Record<string, { value: string; label: string }[]> = {
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
  return matched?.label ?? value;
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

function case03NeedsRepeatFollowUp(answers: ReviewAnswers): boolean {
  const authorityValue = getCase03AuthorityResponseValue(answers);
  if (authorityValue && CASE03_REPEAT_RESPONSE_VALUES.has(authorityValue)) {
    return true;
  }
  return answers.case03_explanationDetail === "agency_redemand";
}

function case03NeedsFactRelationshipPhase2(answers: ReviewAnswers): boolean {
  const goal = answers.case03_confirmGoal;
  const demand = answers.case03_authorityDemand;
  const response = answers.case03_customerResponse;
  if (
    goal === "understand_agency_intent" ||
    goal === "sufficient_explanation" ||
    goal === "repeat_response" ||
    goal === "unsure"
  ) {
    return true;
  }
  if (
    demand === "reason_unclear" ||
    demand === "specific_incident" ||
    demand === "repeat_demand"
  ) {
    return true;
  }
  if (
    response === "attendance" ||
    response === "explanation_with_docs" ||
    response === "phone_message" ||
    response === "other_method"
  ) {
    return true;
  }
  return false;
}

function case03NeedsInquiryFocusPhase2(answers: ReviewAnswers): boolean {
  const goal = answers.case03_confirmGoal;
  const demand = answers.case03_authorityDemand;
  if (
    goal === "understand_agency_intent" ||
    goal === "prepare_materials" ||
    goal === "unsure"
  ) {
    return true;
  }
  if (
    demand === "reason_unclear" ||
    demand === "specific_incident" ||
    demand === "submission_review" ||
    demand === "prep_unclear"
  ) {
    return true;
  }
  return false;
}

function case03NeedsBlockage(answers: ReviewAnswers): boolean {
  const rel = answers.case03_factRelationship;
  const focus = answers.case03_inquiryFocus;
  const demand = answers.case03_authorityDemand;
  const goal = answers.case03_confirmGoal;
  return (
    rel === "partial" ||
    rel === "mismatch" ||
    rel === "hard_to_judge" ||
    rel === "unknown" ||
    focus === "unsure" ||
    focus === "unclear" ||
    demand === "reason_unclear" ||
    demand === "prep_unclear" ||
    goal === "unsure" ||
    case03NeedsRepeatFollowUp(answers)
  );
}

function case03NeedsEvidence(answers: ReviewAnswers): boolean {
  const rel = answers.case03_factRelationship;
  const focus = answers.case03_inquiryFocus;
  return (
    rel === "partial" ||
    rel === "mismatch" ||
    rel === "hard_to_judge" ||
    focus === "unsure" ||
    focus === "unclear" ||
    case03NeedsRepeatFollowUp(answers)
  );
}

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
  if (answers.case03_confirmGoal) return true;
  if (shouldActivateCase02Path(answers)) return false;

  const text = customerTextFromAnswers(answers);
  if (isSupplementPrimaryInput(text) && !isAttendancePrimaryInput(text)) return false;
  if (isAttendancePrimaryInput(text)) return true;

  const hits = keywordCaseSignals(text);
  if (hits[0] === "CASE_03") return true;

  if (
    answers.case01_authorityDemand === "attendance" &&
    (answers.case01_confirmGoal === "what_when" || answers.case01_confirmGoal === "unsure")
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

function appendCase03Phase1Questions(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  pushUnique(questions, {
    id: "case03_authorityDemand",
    kind: "choice",
    label: "교통국에서는 이 문제와 관련해 무엇을 하라고 안내했나요?",
    options: CASE03_AUTHORITY_DEMAND_OPTIONS,
  });
  if (
    !isAdminVerifyChoiceFieldComplete(
      "case03_authorityDemand",
      answers,
      CASE03_AUTHORITY_DEMAND_OPTIONS,
    )
  ) {
    return;
  }

  pushUnique(questions, {
    id: "case03_confirmGoal",
    kind: "choice",
    label: "교통국에서는 무엇을 확인하려는 것 같나요?",
    options: CASE03_CONFIRM_GOAL_OPTIONS,
  });
  if (!answers.case03_confirmGoal) return;

  pushUnique(questions, {
    id: "case03_customerResponse",
    kind: "choice",
    label: "교통국의 설명이나 출석 요구를 받은 뒤 이미 어떤 대응을 하셨나요?",
    options: CASE03_CUSTOMER_RESPONSE_OPTIONS,
  });
  if (
    !isAdminVerifyChoiceFieldComplete(
      "case03_customerResponse",
      answers,
      CASE03_CUSTOMER_RESPONSE_OPTIONS,
    )
  ) {
    return;
  }

  pushUnique(questions, {
    id: "case03_deadline",
    kind: "choice",
    label: "교통국에서는 언제까지 무엇을 해야 한다고 안내했나요?",
    options: CASE03_DEADLINE_OPTIONS,
  });
}

function appendCase03Phase2Questions(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  if (case03NeedsFactRelationshipPhase2(answers)) {
    pushUnique(questions, {
      id: "case03_factRelationship",
      kind: "choice",
      label:
        "교통국에서 확인하려는 내용과 실제 상황을 비교하면, 가장 확인이 필요한 부분은 무엇인가요?",
      options: CASE03_FACT_RELATIONSHIP_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case03_factRelationship",
        answers,
        CASE03_FACT_RELATIONSHIP_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case03NeedsInquiryFocusPhase2(answers)) {
    pushUnique(questions, {
      id: "case03_inquiryFocus",
      kind: "choice",
      label: "교통국에서 출석하거나 설명·자료를 제출하라고 한 내용은 무엇에 가장 가깝나요?",
      options: CASE03_INQUIRY_FOCUS_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case03_inquiryFocus",
        answers,
        CASE03_INQUIRY_FOCUS_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case03HasResponded(answers)) {
    pushUnique(questions, {
      id: "case03_explanationDetail",
      kind: "choice",
      label: "교통국에 설명하거나 제출한 내용은 무엇인가요?",
      options: CASE03_EXPLANATION_DETAIL_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case03_explanationDetail",
        answers,
        CASE03_EXPLANATION_DETAIL_OPTIONS,
      )
    ) {
      return;
    }

    pushUnique(questions, {
      id: "case03_authorityFollowUp",
      kind: "choice",
      label: "교통국에 대응한 뒤에는 어떤 답변이나 추가 안내를 받았나요?",
      options: CASE03_AUTHORITY_FOLLOWUP_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case03_authorityFollowUp",
        answers,
        CASE03_AUTHORITY_FOLLOWUP_OPTIONS,
      )
    ) {
      return;
    }
  } else if (case03NeedsPrepDetail(answers)) {
    pushUnique(questions, {
      id: "case03_prepRequired",
      kind: "choice",
      label: "교통국에 직접 가야 한다면, 무엇을 준비하라고 안내받으셨나요?",
      options: CASE03_PREP_REQUIRED_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case03_prepRequired",
        answers,
        CASE03_PREP_REQUIRED_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case03NeedsRepeatFollowUp(answers)) {
    pushUnique(questions, {
      id: "case03_repeatFollowUp",
      kind: "choice",
      label:
        "이미 설명하거나 자료를 제출했는데도 교통국에서 다시 확인하려는 내용은 무엇인가요?",
      options: CASE03_REPEAT_FOLLOWUP_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case03_repeatFollowUp",
        answers,
        CASE03_REPEAT_FOLLOWUP_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case03NeedsBlockage(answers)) {
    pushUnique(questions, {
      id: "case03_blockage",
      kind: "choice",
      label: "지금 이 출석·소명 사건에서 가장 막혀 있는 부분은 무엇인가요?",
      options: CASE03_BLOCKAGE_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case03_blockage",
        answers,
        CASE03_BLOCKAGE_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case03NeedsEvidence(answers)) {
    pushUnique(questions, {
      id: "case03_evidence",
      kind: "choice",
      label: "지금 확인할 수 있는 자료가 있나요?",
      options: CASE03_EVIDENCE_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case03_evidence",
        answers,
        CASE03_EVIDENCE_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case03NeedsFinalGoal(answers)) {
    pushUnique(questions, {
      id: "case03_finalGoal",
      kind: "choice",
      label: "이 출석·소명 사건에서 어떤 결과를 원하시나요?",
      options: CASE03_FINAL_GOAL_OPTIONS,
    });
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
  if (case03NeedsFinalGoal(answers) && !answers.case03_finalGoal) {
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

export const CASE04_ANSWER_KEYS = [
  ...CASE04_PHASE1_FIELD_ORDER,
  "case04_supplementReason",
  "case04_initialSubmission",
  "case04_submissionRelation",
  "case04_addDocDetail",
  "case04_modifyDetail",
  "case04_evidenceDetail",
  "case04_unclearFocus",
  "case04_authorityFollowUp",
  "case04_submitResponse",
  "case04_inquiryResponse",
  "case04_repeatSupplement",
  "case04_actualCore",
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

const CASE04_SUPPLEMENT_TARGET_OPTIONS = [
  {
    value: "additional_docs",
    label: "처음 제출한 서류에서 빠진 자료를 추가하라는 상황입니다.",
  },
  {
    value: "add_content_evidence",
    label: "제출한 내용이나 정보가 충분하지 않다고 안내받은 상황입니다.",
  },
  {
    value: "modify_existing",
    label: "서류의 형식이나 작성 방법 때문에 다시 제출하라는 상황입니다.",
  },
  {
    value: "repeat_demand",
    label: "이미 보완해서 제출했는데 다시 추가 자료를 요구받은 상황입니다.",
  },
  {
    value: "unclear",
    label: "무엇을 보완해야 하는지 정확히 이해하기 어려운 상황입니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE04_CONFIRM_GOAL_OPTIONS = [
  {
    value: "understand_materials",
    label: "기관이 실제로 어떤 자료를 더 원하는지 알고 싶습니다.",
  },
  {
    value: "understand_insufficient",
    label: "이미 제출한 자료가 왜 충분하지 않은지 알고 싶습니다.",
  },
  {
    value: "prepare_materials",
    label: "추가 자료를 어떻게 준비해야 하는지 알고 싶습니다.",
  },
  {
    value: "repeat_reason",
    label: "이미 보완했는데 다시 요구하는 이유를 확인하고 싶습니다.",
  },
  {
    value: "deadline",
    label: "언제까지 보완해야 하는지 확인하고 싶습니다.",
  },
  {
    value: "unsure",
    label: "지금 무엇부터 준비하고 대응해야 할지 모르겠습니다.",
  },
];

const CASE04_SUPPLEMENT_REASON_OPTIONS = [
  {
    value: "missing_info",
    label: "처음 제출한 서류나 정보에 빠진 부분이 있다고 안내했습니다.",
  },
  {
    value: "incorrect_content",
    label: "제출한 내용이나 서류에 수정이 필요하다고 안내했습니다.",
  },
  {
    value: "insufficient_proof",
    label: "제출한 내용이나 증빙이 충분하지 않다고 안내했습니다.",
  },
  {
    value: "no_reason",
    label: "왜 보완이 필요한지 명확하게 안내하지 않았습니다.",
  },
  {
    value: "unsure",
    label: "보완 이유를 정확히 이해하기 어렵습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE04_INITIAL_SUBMISSION_OPTIONS = [
  {
    value: "complete",
    label: "처음 신청할 때 필요한 서류를 모두 제출했습니다.",
  },
  {
    value: "partial",
    label: "처음에 일부 서류나 내용만 제출했습니다.",
  },
  {
    value: "hard_to_confirm",
    label: "처음에 무엇을 제출했는지 정확히 기억하기 어렵습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE04_SUBMISSION_RELATION_OPTIONS = [
  {
    value: "add_missing",
    label: "처음 제출하지 않았던 새로운 자료를 추가하라고 요구받았습니다.",
  },
  {
    value: "modify_content",
    label: "처음 제출한 자료를 다시 제출하거나 수정하라고 요구받았습니다.",
  },
  {
    value: "support_existing",
    label: "기존 자료는 맞지만 추가 설명이나 증빙을 요구받았습니다.",
  },
  {
    value: "mismatch_request",
    label: "이미 같은 자료를 제출했는데 다시 제출하라고 요구받았습니다.",
  },
  {
    value: "hard_to_judge",
    label: "처음 무엇을 제출했는지 정확히 기억하기 어렵습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE04_ADD_DOC_DETAIL_OPTIONS = [
  { value: "id_doc", label: "신분·인적 관련 서류" },
  { value: "financial_doc", label: "재무·금액 관련 서류" },
  { value: "certificate", label: "증명서·확인서" },
  { value: "translation", label: "번역·공증 관련 서류" },
  { value: "doc_other", label: "위에 없는 다른 서류 유형입니다" },
  { value: "unsure", label: "어떤 서류를 추가해야 하는지 모르겠습니다" },
];

const CASE04_MODIFY_DETAIL_OPTIONS = [
  { value: "name_info", label: "이름·인적사항" },
  { value: "date_info", label: "날짜·기간" },
  { value: "amount_info", label: "금액·수치" },
  { value: "content_info", label: "내용·기재사항" },
  { value: "modify_other", label: "위에 없는 다른 수정 항목입니다" },
  { value: "unsure", label: "무엇을 수정해야 하는지 모르겠습니다" },
];

const CASE04_EVIDENCE_DETAIL_OPTIONS = [
  { value: "proof_doc", label: "증빙 서류" },
  { value: "photo", label: "사진·이미지" },
  { value: "statement", label: "설명서·소명서" },
  { value: "evidence_detail_other", label: "위에 없는 다른 증빙·자료입니다" },
  { value: "unsure", label: "어떤 증빙을 더 넣어야 하는지 모르겠습니다" },
];

const CASE04_UNCLEAR_FOCUS_OPTIONS = [
  { value: "what_submit", label: "무엇을 제출해야 하는지" },
  { value: "why_submit", label: "왜 제출해야 하는지" },
  { value: "format", label: "어떤 형식이어야 하는지" },
  { value: "deadline", label: "언제까지 제출해야 하는지" },
  { value: "connection", label: "기존 제출 내용과 어떻게 연결되는지" },
  { value: "whole_unclear", label: "전체 요구가 이해되지 않음" },
  {
    value: "unsure",
    label: "보완 요구 내용 중 무엇이 가장 이해하기 어려운지 정확히 말하기 어렵습니다.",
  },
];

const CASE04_CUSTOMER_RESPONSE_OPTIONS = [
  {
    value: "not_started",
    label: "아직 보완 자료를 준비하거나 다시 제출하지 않았습니다.",
  },
  {
    value: "preparing",
    label: "보완할 자료를 준비하고 있는 중입니다.",
  },
  {
    value: "submitted",
    label: "보완 자료를 이미 제출했습니다.",
  },
  {
    value: "inquired",
    label: "전화·메시지 등으로 기관에 문의하거나 확인했습니다.",
  },
  {
    value: "other_method",
    label: "전화나 재제출과 다른 방법으로 대응했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE04_AUTHORITY_FOLLOWUP_OPTIONS = [
  {
    value: "accepted",
    label: "보완 자료가 접수되었다는 안내를 받았습니다.",
  },
  {
    value: "awaiting_review",
    label: "추가 요구 없이 검토를 기다리는 중입니다.",
  },
  {
    value: "more_supplement",
    label: "다시 다른 자료나 보완을 요구받았습니다.",
  },
  {
    value: "more_docs",
    label: "추가 서류나 증빙을 다시 요구받았습니다.",
  },
  {
    value: "receipt_unconfirmed",
    label: "제출한 자료가 제대로 접수되었는지 확인하지 못했습니다.",
  },
  {
    value: "no_response",
    label: "아직 기관 답변을 받지 못했습니다.",
  },
  {
    value: "unsure",
    label: "받은 안내를 정확히 이해하기 어렵습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE04_SUBMIT_RESPONSE_OPTIONS = [
  { value: "confirmed", label: "보완 내용을 확인했다고 했어요" },
  { value: "more_docs", label: "다시 추가 서류를 요구했어요" },
  { value: "more_modify", label: "다시 수정/보완하라고 했어요" },
  { value: "more_explanation", label: "추가 설명을 요구했어요" },
  { value: "no_response", label: "아직 답변이 없어요" },
  { value: "unsure", label: "기관의 답변 내용을 정확히 이해하지 못했습니다." },
];

const CASE04_INQUIRY_RESPONSE_OPTIONS = [
  { value: "clarified", label: "보완 내용을 안내해 주었어요" },
  { value: "more_docs", label: "추가 서류를 요구했어요" },
  { value: "more_modify", label: "수정/보완을 요구했어요" },
  { value: "unclear", label: "안내가 불명확했어요" },
  { value: "unsure", label: "기관이 안내한 보완 내용을 정확히 이해하지 못했습니다." },
];

const CASE04_REPEAT_SUPPLEMENT_OPTIONS = [
  { value: "more_docs", label: "추가 서류를 다시 요구했습니다" },
  { value: "more_modify", label: "수정/보완을 다시 요구했습니다" },
  { value: "more_explanation", label: "추가 설명을 다시 요구했습니다" },
  { value: "multiple", label: "여러 가지를 다시 요구했습니다" },
  { value: "not_applicable", label: "해당 없음 / 아직 모름" },
];

const CASE04_ACTUAL_CORE_OPTIONS = [
  { value: "supplement", label: "보완·추가 제출이 핵심입니다" },
  { value: "payment", label: "납부가 실제 핵심입니다" },
  { value: "attendance", label: "출석·소명이 실제 핵심입니다" },
  { value: "disposition", label: "처분·조치가 이미 내려진 것이 핵심입니다" },
  { value: "unclear", label: "보완 요구 내용이 불명확합니다" },
  { value: "unsure", label: "보완 요구의 핵심이 무엇인지 정확히 파악하지 못했습니다." },
];

const CASE04_DEADLINE_OPTIONS = [
  {
    value: "specific_date",
    label: "보완해야 하는 날짜를 확인했습니다.",
  },
  {
    value: "uncertain",
    label: "기한이 있다는 것은 알지만 정확한 날짜는 아직 확인하지 못했습니다.",
  },
  {
    value: "period_stated",
    label: "기한이 있다는 안내만 받았고, 정확한 날짜는 확인하지 못했습니다.",
  },
  {
    value: "not_stated",
    label: "기한이 있는지 자체를 아직 확인하지 못했습니다.",
  },
  {
    value: "unsure",
    label: "현재 보완 기한과 관련된 내용을 전혀 알지 못합니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE04_BLOCKAGE_OPTIONS = [
  { value: "what_submit", label: "무엇을 추가·수정해서 제출해야 하는지 모르겠습니다" },
  { value: "why_submit", label: "왜 보완이 필요한지 이해하지 못했습니다" },
  { value: "format", label: "어떤 형식·방법으로 제출해야 하는지 모르겠습니다" },
  { value: "deadline", label: "언제까지 제출해야 하는지 모르겠습니다" },
  { value: "after_submit", label: "보완 제출 후 다음 절차가 무엇인지 모르겠습니다" },
  { value: "demand_unclear", label: "보완 요구 전체가 문서만으로는 이해되지 않습니다" },
  { value: "unsure", label: "가장 막힌 부분을 정확히 말하기 어렵습니다" },
];

const CASE04_EVIDENCE_OPTIONS = [
  { value: "supplement_notice", label: "보완 요구서·안내문" },
  { value: "email", label: "기관 이메일" },
  { value: "message", label: "기관 문자·메신저·전화 안내 내역" },
  { value: "original_submission", label: "처음 제출했던 서류" },
  { value: "supplement_submission", label: "보완해서 제출한 서류" },
  { value: "receipt", label: "접수증·제출 확인서" },
  { value: "portal_screen", label: "온라인 접수·신고 시스템 화면" },
  { value: "evidence_other", label: "위에 없는 다른 확인 자료" },
  { value: "none", label: "지금 확인할 수 있는 자료가 없습니다" },
  { value: "unsure", label: "어떤 자료가 필요한지 모르겠습니다" },
];

const CASE04_FINAL_GOAL_OPTIONS = [
  { value: "what_supplement", label: "무엇을 보완해야 하는지 확인하고 싶습니다" },
  { value: "why_supplement", label: "왜 보완이 필요한지 확인하고 싶습니다" },
  { value: "how_supplement", label: "어떻게 보완·제출해야 하는지 확인하고 싶습니다" },
  { value: "deadline", label: "보완 제출 기한을 확인하고 싶습니다" },
  { value: "next_step", label: "제출 후 다음 절차를 확인하고 싶습니다" },
  { value: "repeat_reason", label: "반복 보완이 요구된 이유를 확인하고 싶습니다" },
  { value: "expert", label: "전문가에게 상황을 전달하고 싶습니다" },
  { value: "goal_other", label: "위에 없는 다른 목표가 있습니다" },
  { value: "unsure", label: "무엇부터 확인해야 할지 모르겠습니다" },
];

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
  ...Object.fromEntries(CASE04_SUBMIT_RESPONSE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE04_INQUIRY_RESPONSE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE04_REPEAT_SUPPLEMENT_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE04_ACTUAL_CORE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE04_DEADLINE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE04_BLOCKAGE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE04_EVIDENCE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE04_FINAL_GOAL_OPTIONS.map((o) => [o.value, o.label])),
};

const CASE04_FIELD_OPTIONS: Record<string, { value: string; label: string }[]> = {
  case04_supplementTarget: CASE04_SUPPLEMENT_TARGET_OPTIONS,
  case04_confirmGoal: CASE04_CONFIRM_GOAL_OPTIONS,
  case04_customerResponse: CASE04_CUSTOMER_RESPONSE_OPTIONS,
  case04_deadline: CASE04_DEADLINE_OPTIONS,
};

const CASE04_FIELD_OPTION_MAP: Record<string, { value: string; label: string }[]> = {
  case04_supplementTarget: CASE04_SUPPLEMENT_TARGET_OPTIONS,
  case04_confirmGoal: CASE04_CONFIRM_GOAL_OPTIONS,
  case04_supplementReason: CASE04_SUPPLEMENT_REASON_OPTIONS,
  case04_initialSubmission: CASE04_INITIAL_SUBMISSION_OPTIONS,
  case04_submissionRelation: CASE04_SUBMISSION_RELATION_OPTIONS,
  case04_addDocDetail: CASE04_ADD_DOC_DETAIL_OPTIONS,
  case04_modifyDetail: CASE04_MODIFY_DETAIL_OPTIONS,
  case04_evidenceDetail: CASE04_EVIDENCE_DETAIL_OPTIONS,
  case04_unclearFocus: CASE04_UNCLEAR_FOCUS_OPTIONS,
  case04_customerResponse: CASE04_CUSTOMER_RESPONSE_OPTIONS,
  case04_authorityFollowUp: CASE04_AUTHORITY_FOLLOWUP_OPTIONS,
  case04_submitResponse: CASE04_SUBMIT_RESPONSE_OPTIONS,
  case04_inquiryResponse: CASE04_INQUIRY_RESPONSE_OPTIONS,
  case04_repeatSupplement: CASE04_REPEAT_SUPPLEMENT_OPTIONS,
  case04_actualCore: CASE04_ACTUAL_CORE_OPTIONS,
  case04_deadline: CASE04_DEADLINE_OPTIONS,
  case04_blockage: CASE04_BLOCKAGE_OPTIONS,
  case04_evidence: CASE04_EVIDENCE_OPTIONS,
  case04_finalGoal: CASE04_FINAL_GOAL_OPTIONS,
};

export function getCase04FieldOptionLabel(fieldId: string, value: string): string {
  const options = CASE04_FIELD_OPTION_MAP[fieldId];
  const matched = options?.find((option) => option.value === value);
  return matched?.label ?? value;
}

const CASE04_REPEAT_RESPONSE_VALUES = new Set([
  "more_supplement",
  "more_docs",
  "more_modify",
  "more_explanation",
]);

function getCase04AuthorityResponseValue(answers: ReviewAnswers): string | undefined {
  if (answers.case04_authorityFollowUp) return answers.case04_authorityFollowUp;
  const response = answers.case04_customerResponse;
  if (response === "submitted") return answers.case04_submitResponse;
  if (response === "inquired") return answers.case04_inquiryResponse;
  return undefined;
}

function case04HasResponded(answers: ReviewAnswers): boolean {
  const response = answers.case04_customerResponse?.trim() ?? "";
  return Boolean(response && response !== "not_started");
}

function case04NeedsTargetDetailPhase2(answers: ReviewAnswers): boolean {
  const target = answers.case04_supplementTarget;
  return (
    target === "additional_docs" ||
    target === "modify_existing" ||
    target === "add_content_evidence" ||
    target === "unclear"
  );
}

function case04NeedsInitialSubmissionPhase2(answers: ReviewAnswers): boolean {
  const goal = answers.case04_confirmGoal;
  const target = answers.case04_supplementTarget;
  if (
    goal === "understand_insufficient" ||
    goal === "repeat_reason" ||
    goal === "understand_materials" ||
    goal === "prepare_materials" ||
    goal === "unsure"
  ) {
    return true;
  }
  return (
    target === "repeat_demand" ||
    target === "additional_docs" ||
    target === "add_content_evidence" ||
    target === "modify_existing"
  );
}

function case04NeedsSubmissionRelationPhase2(_answers: ReviewAnswers): boolean {
  return true;
}

function case04NeedsSupplementReasonPhase2(answers: ReviewAnswers): boolean {
  const goal = answers.case04_confirmGoal;
  const target = answers.case04_supplementTarget;
  if (target === "unclear") return true;
  if (goal === "understand_insufficient" || goal === "repeat_reason") return true;
  return false;
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
  const value = getCase04AuthorityResponseValue(answers);
  if (value && CASE04_REPEAT_RESPONSE_VALUES.has(value)) return true;
  return false;
}

function case04NeedsActualCore(answers: ReviewAnswers): boolean {
  if (answers.case04_actualCore) return false;
  return (
    answers.case04_supplementTarget === "unclear" ||
    answers.case04_blockage === "demand_unclear" ||
    answers.case04_unclearFocus === "whole_unclear"
  );
}

function case04NeedsBlockage(answers: ReviewAnswers): boolean {
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

function case04NeedsEvidence(answers: ReviewAnswers): boolean {
  const target = answers.case04_supplementTarget;
  const rel = answers.case04_submissionRelation;
  return (
    target === "unclear" ||
    rel === "mismatch_request" ||
    rel === "hard_to_judge" ||
    case04NeedsRepeatSupplement(answers) ||
    answers.case04_customerResponse === "submitted"
  );
}

function case04NeedsFinalGoal(answers: ReviewAnswers): boolean {
  return (
    answers.case04_supplementTarget === "unclear" || answers.case04_supplementReason === "unsure"
  );
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
  if (authorityValue && CASE04_REPEAT_RESPONSE_VALUES.has(authorityValue)) {
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
    const options = CASE04_FIELD_OPTIONS[fieldId];
    if (!options || !isAdminVerifyChoiceFieldComplete(fieldId, answers, options)) {
      return false;
    }
  }
  return true;
}

function appendCase04Phase1Questions(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  pushUnique(questions, {
    id: "case04_supplementTarget",
    kind: "choice",
    label: "교통국에서는 기존에 제출한 내용에 대해 무엇을 다시 하라고 안내했나요?",
    options: CASE04_SUPPLEMENT_TARGET_OPTIONS,
  });
  if (
    !isAdminVerifyChoiceFieldComplete(
      "case04_supplementTarget",
      answers,
      CASE04_SUPPLEMENT_TARGET_OPTIONS,
    )
  ) {
    return;
  }

  pushUnique(questions, {
    id: "case04_confirmGoal",
    kind: "choice",
    label:
      "교통국에서는 처음 제출한 내용의 어떤 부분을 다시 확인하거나 보완해야 한다고 했나요?",
    options: CASE04_CONFIRM_GOAL_OPTIONS,
  });
  if (!answers.case04_confirmGoal) return;

  pushUnique(questions, {
    id: "case04_customerResponse",
    kind: "choice",
    label: "교통국의 보완 안내를 받은 뒤에는 어떻게 대응하셨나요?",
    options: CASE04_CUSTOMER_RESPONSE_OPTIONS,
  });
  if (
    !isAdminVerifyChoiceFieldComplete(
      "case04_customerResponse",
      answers,
      CASE04_CUSTOMER_RESPONSE_OPTIONS,
    )
  ) {
    return;
  }

  pushUnique(questions, {
    id: "case04_deadline",
    kind: "choice",
    label: "교통국에서는 언제까지 보완해야 한다고 안내했나요?",
    options: CASE04_DEADLINE_OPTIONS,
  });
}

function appendCase04Phase2Questions(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  if (case04NeedsInitialSubmissionPhase2(answers)) {
    pushUnique(questions, {
      id: "case04_initialSubmission",
      kind: "choice",
      label: "처음 교통국에 어떤 서류나 내용을 제출하셨나요?",
      options: CASE04_INITIAL_SUBMISSION_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case04_initialSubmission",
        answers,
        CASE04_INITIAL_SUBMISSION_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case04NeedsSubmissionRelationPhase2(answers)) {
    pushUnique(questions, {
      id: "case04_submissionRelation",
      kind: "choice",
      label: "이번 보완 요구는 처음 제출한 내용과 비교하면 어떤 상황인가요?",
      options: CASE04_SUBMISSION_RELATION_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case04_submissionRelation",
        answers,
        CASE04_SUBMISSION_RELATION_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case04NeedsSupplementReasonPhase2(answers)) {
    pushUnique(questions, {
      id: "case04_supplementReason",
      kind: "choice",
      label: "교통국에서는 이번에 무엇을 보완하면 된다고 설명했나요?",
      options: CASE04_SUPPLEMENT_REASON_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case04_supplementReason",
        answers,
        CASE04_SUPPLEMENT_REASON_OPTIONS,
      )
    ) {
      return;
    }
  }

  const target = answers.case04_supplementTarget;
  if (target === "additional_docs") {
    pushUnique(questions, {
      id: "case04_addDocDetail",
      kind: "choice",
      label: "어떤 서류를 추가로 제출하라고 요구받았나요?",
      options: CASE04_ADD_DOC_DETAIL_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case04_addDocDetail",
        answers,
        CASE04_ADD_DOC_DETAIL_OPTIONS,
      )
    ) {
      return;
    }
  } else if (target === "modify_existing") {
    pushUnique(questions, {
      id: "case04_modifyDetail",
      kind: "choice",
      label: "어떤 내용을 수정하거나 다시 제출하라고 요구받았나요?",
      options: CASE04_MODIFY_DETAIL_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case04_modifyDetail",
        answers,
        CASE04_MODIFY_DETAIL_OPTIONS,
      )
    ) {
      return;
    }
  } else if (target === "add_content_evidence") {
    pushUnique(questions, {
      id: "case04_evidenceDetail",
      kind: "choice",
      label: "어떤 내용이나 증빙을 추가하라고 요구받았나요?",
      options: CASE04_EVIDENCE_DETAIL_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case04_evidenceDetail",
        answers,
        CASE04_EVIDENCE_DETAIL_OPTIONS,
      )
    ) {
      return;
    }
  } else if (target === "unclear") {
    pushUnique(questions, {
      id: "case04_unclearFocus",
      kind: "choice",
      label: "보완 요구 안내에서 무엇이 가장 이해하기 어렵나요?",
      options: CASE04_UNCLEAR_FOCUS_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case04_unclearFocus",
        answers,
        CASE04_UNCLEAR_FOCUS_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case04NeedsAuthorityFollowUpPhase2(answers)) {
    pushUnique(questions, {
      id: "case04_authorityFollowUp",
      kind: "choice",
      label: "보완한 내용을 제출한 뒤, 교통국에서는 어떻게 답변했나요?",
      options: CASE04_AUTHORITY_FOLLOWUP_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case04_authorityFollowUp",
        answers,
        CASE04_AUTHORITY_FOLLOWUP_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case04NeedsRepeatSupplement(answers)) {
    pushUnique(questions, {
      id: "case04_repeatSupplement",
      kind: "choice",
      label: "이번 보완 요구는 이전에 제출했던 보완 내용과 비교하면 어떤 상황인가요?",
      options: CASE04_REPEAT_SUPPLEMENT_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case04_repeatSupplement",
        answers,
        CASE04_REPEAT_SUPPLEMENT_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case04NeedsBlockage(answers)) {
    pushUnique(questions, {
      id: "case04_blockage",
      kind: "choice",
      label: "지금 이 보완 요구 사건에서 가장 막혀 있는 부분은 무엇인가요?",
      options: CASE04_BLOCKAGE_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case04_blockage",
        answers,
        CASE04_BLOCKAGE_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case04NeedsEvidence(answers)) {
    pushUnique(questions, {
      id: "case04_evidence",
      kind: "choice",
      label: "지금 확인할 수 있는 자료가 있나요?",
      options: CASE04_EVIDENCE_OPTIONS,
    });
    if (
      !isAdminVerifyChoiceFieldComplete(
        "case04_evidence",
        answers,
        CASE04_EVIDENCE_OPTIONS,
      )
    ) {
      return;
    }
  }

  if (case04NeedsFinalGoal(answers)) {
    pushUnique(questions, {
      id: "case04_finalGoal",
      kind: "choice",
      label: "이 보완 요구와 관련해 어떤 결과를 원하시나요?",
      options: CASE04_FINAL_GOAL_OPTIONS,
    });
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
  if (isCase06BridgedToNativeCase(answers, "CASE_04") && !isCase04Phase1Complete(answers)) {
    appendCase04Phase1Questions(questions, answers);
    if (!isCase04Phase1Complete(answers)) return;
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
  if (case04NeedsFinalGoal(answers) && !answers.case04_finalGoal) {
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

  if (
    answers.case04_supplementTarget === "unclear" ||
    answers.case04_supplementTarget === "repeat_demand" ||
    answers.case04_unclearFocus === "what_submit" ||
    answers.case04_unclearFocus === "whole_unclear"
  ) {
    signals.push("SUPPLEMENT_TARGET_UNCLEAR");
  }
  if (
    answers.case04_supplementReason === "no_reason" ||
    answers.case04_supplementReason === "unsure" ||
    answers.case04_unclearFocus === "why_submit"
  ) {
    signals.push("SUPPLEMENT_REASON_UNCLEAR");
  }
  if (
    answers.case04_submissionRelation === "mismatch_request" ||
    answers.case04_submissionRelation === "hard_to_judge"
  ) {
    signals.push("SUPPLEMENT_CONTENT_MISMATCH");
  }
  if (answers.case04_unclearFocus === "format" || answers.case04_blockage === "format") {
    signals.push("SUPPLEMENT_FORMAT_UNCLEAR");
  }
  if (
    answers.case04_deadline === "uncertain" ||
    answers.case04_deadline === "unsure" ||
    answers.case04_deadline === "not_stated" ||
    answers.case04_unclearFocus === "deadline"
  ) {
    signals.push("SUPPLEMENT_DEADLINE_UNCLEAR");
  }
  const authorityFollowUp = getCase04AuthorityResponseValue(answers);
  if (
    authorityFollowUp === "unsure" ||
    authorityFollowUp === "no_response" ||
    answers.case04_submitResponse === "unsure" ||
    answers.case04_inquiryResponse === "unsure" ||
    answers.case04_inquiryResponse === "unclear"
  ) {
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
  if (authorityFollowUp === "no_response" || answers.case04_submitResponse === "no_response") {
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
  if (!shouldActivateCase04Path(answers) && !answers.case04_supplementTarget) return null;

  const core = answers.case04_actualCore;
  if (core === "payment") {
    return {
      id: "CASE_02",
      status: "inferred",
      confidence: 0.8,
      reason: "실제 해결 중심이 납부 요구로 확인됨",
    };
  }
  if (core === "attendance") {
    return {
      id: "CASE_03",
      status: "inferred",
      confidence: 0.78,
      reason: "실제 해결 중심이 출석·소명으로 확인됨",
    };
  }
  if (core === "disposition") {
    return {
      id: "CASE_05",
      status: "inferred",
      confidence: 0.76,
      reason: "실제 해결 중심이 처분·조치로 확인됨",
    };
  }
  if (
    core === "unclear" ||
    core === "unsure" ||
    (answers.case04_supplementTarget === "unclear" &&
      answers.case04_unclearFocus === "whole_unclear" &&
      !core)
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
  "case05_dispositionSource",
  "case05_dispositionReason",
  "case05_factRelationship",
  "case05_authorityFollowUp",
  "case05_dispositionDetail",
  "case05_factDetail",
  "case05_explanationDetail",
  "case05_submittedDocsDetail",
  "case05_appealDetail",
  "case05_dispositionOutcome",
  "case05_repeatFollowUp",
  "case05_actualCore",
  "case05_blockage",
  "case05_evidence",
  "case05_finalGoal",
] as const;

export type DispositionSignalCode =
  | "DISPOSITION_TYPE_UNCLEAR"
  | "DISPOSITION_REASON_UNCLEAR"
  | "DISPOSITION_AUTHORITY_UNCLEAR"
  | "FACT_MISMATCH_PARTIAL"
  | "FACT_MISMATCH"
  | "FACT_UNVERIFIED"
  | "DISPOSITION_DEADLINE_UNCLEAR"
  | "DISPOSITION_RESPONSE_UNCLEAR"
  | "DISPOSITION_EVIDENCE_UNCLEAR";

const DISPOSITION_SIGNAL_LABELS: Record<DispositionSignalCode, string> = {
  DISPOSITION_TYPE_UNCLEAR: "처분·조치 내용 확인이 필요합니다",
  DISPOSITION_REASON_UNCLEAR: "처분 사유 확인이 필요합니다",
  DISPOSITION_AUTHORITY_UNCLEAR: "처분 기관·출처 확인이 필요합니다",
  FACT_MISMATCH_PARTIAL: "처분 내용과 실제 상황이 일부 다를 수 있음 — 확인 필요",
  FACT_MISMATCH: "처분 내용과 실제 상황이 다를 수 있음 — 확인 필요",
  FACT_UNVERIFIED: "처분 후 기관 반응이 불명확합니다",
  DISPOSITION_DEADLINE_UNCLEAR: "처분 관련 기한 확인이 필요합니다",
  DISPOSITION_RESPONSE_UNCLEAR: "처분 후 기관 반응 확인이 필요합니다",
  DISPOSITION_EVIDENCE_UNCLEAR: "처분 관련 증빙 확인이 필요합니다",
};

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

const CASE05_DISPOSITION_TYPE_OPTIONS = [
  {
    value: "application_denied",
    label: "신청이나 요청이 받아들여지지 않았다는 조치를 받은 상황입니다.",
  },
  {
    value: CASE05_DISPOSITION_TYPE_RIGHTS_ENDED,
    label:
      "기존에 가지고 있던 허가·자격·권리가 중단·취소되었거나, 등록·자격·면허가 말소·실효되었다는 조치를 받은 상황입니다.",
  },
  {
    value: "business_suspended",
    label: "일정 기간 동안 특정 행동이나 활동이 제한되었다는 조치를 받은 상황입니다.",
  },
  {
    value: "situation_mismatch",
    label: "통지 내용과 실제 본인의 상황이 서로 다르게 느껴지는 상황입니다.",
  },
  {
    value: CASE05_DISPOSITION_TYPE_UNCLEAR,
    label: "어떤 처분·조치인지 자체를 정확히 이해하기 어려운 상황입니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE05_CONFIRM_GOAL_OPTIONS = [
  {
    value: "understand_reason",
    label: "처분이 왜 내려졌는지 먼저 확인하고 싶습니다.",
  },
  {
    value: "understand_impact",
    label: "이 처분이 실제로 어떤 영향을 주는지 확인하고 싶습니다.",
  },
  {
    value: "appeal_possibility",
    label: "이의제기나 재검토가 가능한지 확인하고 싶습니다.",
  },
  {
    value: "what_to_do",
    label: "지금 무엇을 해야 하는지 먼저 확인하고 싶습니다.",
  },
  {
    value: "unsure",
    label: "지금 무엇부터 확인하고 준비해야 할지 모르겠습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE05_DISPOSITION_SOURCE_OPTIONS = [
  { value: "immigration", label: "출입국·외국인등록·거주 관련 기관" },
  { value: "traffic", label: "교통국·경찰·지자체 등 교통·운전 관련 기관" },
  { value: "tax", label: "국세청·지자체 등 세무·조세 관련 기관" },
  { value: "local_admin", label: "시·군·구 등 지방 행정기관" },
  { value: "police", label: "경찰·검찰·수사 관련 기관" },
  { value: "public_agency", label: "위에 없는 다른 정부·공공기관" },
  { value: "business_agency", label: "회사·사업장·거래 관련 기관·담당자" },
  { value: "personal_delivery", label: "우편·대리인·개인 전달 등으로 받았습니다" },
  { value: "unsure", label: "처분 통지가 어디서 왔는지 모르겠습니다" },
];

const CASE05_DISPOSITION_REASON_OPTIONS = [
  { value: "violation_claimed", label: "특정 위반·규정 위반이 이유로 적혀 있습니다" },
  { value: "document_issue", label: "제출 서류·신청 정보의 문제가 이유로 적혀 있습니다" },
  { value: "requirement_not_met", label: "요건·조건·자격을 충족하지 못했다는 이유가 적혀 있습니다" },
  { value: "deadline_procedure", label: "기한·절차·제출 의무를 지키지 않았다는 이유가 적혀 있습니다" },
  { value: "no_clear_reason", label: "처분 사유에 대한 설명이 충분하지 않습니다" },
  { value: "unsure", label: "처분 사유를 정확히 파악하지 못했습니다" },
];

const CASE05_FACT_RELATIONSHIP_OPTIONS = [
  {
    value: "match",
    label: "처분 통지에 적힌 내용과 제가 알고 있는 실제 상황이 거의 같습니다.",
  },
  {
    value: "partial",
    label: "일부는 맞지만 날짜·사실·내용 등이 실제와 다릅니다.",
  },
  {
    value: "mismatch",
    label: "처분 통지 내용과 제가 알고 있는 실제 상황이 크게 다릅니다.",
  },
  {
    value: "hard_to_judge",
    label: "그때 무슨 일이 있었는지부터 대조하기 어렵습니다.",
  },
  {
    value: "unknown",
    label: "처분 통지가 무엇을 말하는지부터 이해하기 어렵습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE05_CUSTOMER_RESPONSE_OPTIONS = [
  {
    value: "none",
    label: "아직 기관에 설명하거나 자료를 제출하거나 재검토를 요청하지 않았습니다.",
  },
  {
    value: "inquired",
    label: "기관에 문의하거나 상황을 확인했습니다.",
  },
  {
    value: "explanation_submitted",
    label: "소명·의견을 제출했습니다.",
  },
  {
    value: "documents_submitted",
    label: "서류나 증빙을 제출했습니다.",
  },
  {
    value: "appeal_requested",
    label: "이의제기·재검토 등을 요청했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE05_AUTHORITY_FOLLOWUP_OPTIONS = [
  { value: "maintained", label: "처분이 그대로 유지된다고 안내받았습니다" },
  { value: "modified", label: "처분 내용이 변경되었다고 안내받았습니다" },
  { value: "revoked", label: "처분이 철회·취소되었다고 안내받았습니다" },
  { value: "more_docs", label: "추가 서류·증빙을 요구받았습니다" },
  { value: "attendance_explanation", label: "추가 설명이나 출석을 요구받았습니다" },
  { value: "under_review", label: "재검토 중이라고 안내받았습니다" },
  { value: "payment_demand", label: "납부를 요구받았습니다" },
  { value: "no_response", label: "아직 답변을 받지 못했습니다" },
  { value: "unsure", label: "어떤 답변이나 조치가 있었는지 모르겠습니다" },
];

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
];

const CASE05_ACTUAL_CORE_OPTIONS = [
  { value: "disposition", label: "처분·조치 자체가 핵심입니다" },
  { value: "payment", label: "납부가 현재 핵심입니다" },
  { value: "attendance", label: "출석·소명이 현재 핵심입니다" },
  { value: "supplement", label: "보완·추가 제출이 현재 핵심입니다" },
  { value: "violation_notice", label: "위반·문제 통지가 현재 핵심입니다" },
  { value: "unclear", label: "처분 문서 내용이 불명확합니다" },
  { value: "unsure", label: "지금 해결해야 하는 핵심이 무엇인지 정확히 파악하지 못했습니다." },
];

const CASE05_DEADLINE_OPTIONS = [
  {
    value: "specific_date",
    label: "처분과 관련해 대응해야 하는 날짜를 확인했습니다.",
  },
  {
    value: "uncertain",
    label: "기한은 있다는 것은 알지만 정확한 날짜는 아직 확인하지 못했습니다.",
  },
  {
    value: "period_stated",
    label: "기한이 있다는 안내만 받았고, 정확한 날짜는 확인하지 못했습니다.",
  },
  {
    value: "not_stated",
    label: "기한이 있는지 자체를 아직 확인하지 못했습니다.",
  },
  {
    value: "unsure",
    label: "처분 관련 기한을 아직 확인하지 못했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

const CASE05_DISPOSITION_DETAIL_OPTIONS = [
  { value: "wording_unclear", label: "어떤 제한이나 변화가 생기는지 문구가 불명확합니다" },
  { value: "scope_unclear", label: "제한·조치 범위와 기간이 불명확합니다" },
  { value: "partially_understood", label: "일부 영향은 이해했지만 전체는 확실하지 않습니다" },
  {
    value: "unsure",
    label: "이 조치가 어떤 영향을 주는지 정확히 이해하지 못했습니다.",
  },
];

const CASE05_FACT_DETAIL_OPTIONS = [
  { value: "date_place", label: "날짜·장소·상황이 다릅니다" },
  { value: "content_differs", label: "내용·사실관계가 다릅니다" },
  { value: "hard_to_verify", label: "그때 상황을 확인하기 어렵습니다" },
  {
    value: "unsure",
    label: "실제 상황과 처분 사유의 차이를 정확히 말하기 어렵습니다.",
  },
];

const CASE05_EXPLANATION_DETAIL_OPTIONS = [
  { value: "written", label: "서면으로 소명·의견을 제출했습니다" },
  { value: "verbal", label: "전화·방문 등으로 설명했습니다" },
  { value: "both", label: "서면과 구두 설명을 함께 했습니다" },
  { value: "unsure", label: "제출한 소명·의견의 형태를 정확히 구분하기 어렵습니다." },
];

const CASE05_SUBMITTED_DOCS_DETAIL_OPTIONS = [
  { value: "identity", label: "신분·인적 관련 서류" },
  { value: "financial", label: "재무·금액 관련 서류" },
  { value: "certificate", label: "증명서·확인서" },
  { value: "doc_other", label: "위에 없는 다른 서류" },
  { value: "unsure", label: "제출한 서류 종류를 정확히 구분하기 어렵습니다." },
];

const CASE05_APPEAL_DETAIL_OPTIONS = [
  { value: "filed", label: "이의제기·재검토를 신청했습니다" },
  { value: "preparing", label: "신청을 준비하고 있습니다" },
  { value: "considering", label: "신청 여부를 검토하고 있습니다" },
  { value: "unsure", label: "이의제기·재검토 신청 상태를 정확히 확인하지 못했습니다." },
];

const CASE05_BLOCKAGE_OPTIONS = [
  { value: "why_disposition", label: "처분이 왜 내려졌는지 이해하지 못했습니다." },
  { value: "what_disposition", label: "처분·조치 내용이 정확히 무엇인지 모르겠습니다." },
  { value: "fact_match", label: "실제 상황과 처분 사유가 맞는지 확인하기 어렵습니다." },
  { value: "what_to_do", label: "지금 무엇을 해야 하는지 모르겠습니다." },
  { value: "appeal_method", label: "이의제기·재검토·소명 방법을 모르겠습니다." },
  { value: "deadline", label: "대응 기한이 언제인지 모르겠습니다." },
  { value: "evidence", label: "어떤 서류·증빙이 필요한지 모르겠습니다." },
  { value: "next_response", label: "기관의 다음 답변·조치를 기다리거나 이해하지 못했습니다." },
  { value: "unsure", label: "가장 막힌 부분을 정확히 말하기 어렵습니다." },
];

const CASE05_EVIDENCE_OPTIONS = [
  { value: "disposition_notice", label: "처분 통지서" },
  { value: "message_email", label: "기관 문자/이메일" },
  { value: "submitted_docs", label: "제출 서류" },
  { value: "payment_proof", label: "영수증/납부 증빙" },
  { value: "photo_video", label: "사진/영상" },
  { value: "contract", label: "계약서" },
  { value: "evidence_other", label: "기타 증빙" },
  { value: "none", label: "없음" },
  { value: "unsure", label: "지금 확인할 수 있는 자료가 있는지 아직 확인하지 못했습니다." },
];

const CASE05_FINAL_GOAL_OPTIONS = [
  { value: "why_disposition", label: "처분이 왜 내려졌는지 확인하고 싶어요" },
  { value: "what_disposition", label: "처분 내용이 정확히 무엇인지 알고 싶어요" },
  { value: "fact_match", label: "실제 상황과 처분 내용이 맞는지 확인하고 싶어요" },
  { value: "what_to_do", label: "지금 무엇을 해야 하는지 알고 싶어요" },
  { value: "next_action", label: "이의제기·소명 등 다음 대응을 알고 싶어요" },
  { value: "evidence", label: "필요한 서류·증빙을 확인하고 싶어요" },
  { value: "expert", label: "전문가에게 상황을 전달하고 싶어요" },
  { value: "unsure", label: "지금 가장 먼저 확인하고 싶은 것이 무엇인지 정확히 말하기 어렵습니다." },
];

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
  ...Object.fromEntries(CASE05_DISPOSITION_TYPE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE05_CONFIRM_GOAL_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE05_DISPOSITION_SOURCE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE05_DISPOSITION_REASON_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE05_FACT_RELATIONSHIP_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE05_CUSTOMER_RESPONSE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE05_AUTHORITY_FOLLOWUP_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE05_DISPOSITION_OUTCOME_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE05_REPEAT_FOLLOWUP_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE05_ACTUAL_CORE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE05_DEADLINE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE05_BLOCKAGE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE05_EVIDENCE_OPTIONS.map((o) => [o.value, o.label])),
  ...Object.fromEntries(CASE05_FINAL_GOAL_OPTIONS.map((o) => [o.value, o.label])),
};

const CASE05_FIELD_OPTIONS: Record<string, { value: string; label: string }[]> = {
  case05_dispositionType: CASE05_DISPOSITION_TYPE_OPTIONS,
  case05_confirmGoal: CASE05_CONFIRM_GOAL_OPTIONS,
  case05_customerResponse: CASE05_CUSTOMER_RESPONSE_OPTIONS,
  case05_deadline: CASE05_DEADLINE_OPTIONS,
};

const CASE05_FIELD_OPTION_MAP: Record<string, { value: string; label: string }[]> = {
  case05_dispositionType: CASE05_DISPOSITION_TYPE_OPTIONS,
  case05_confirmGoal: CASE05_CONFIRM_GOAL_OPTIONS,
  case05_dispositionSource: CASE05_DISPOSITION_SOURCE_OPTIONS,
  case05_dispositionReason: CASE05_DISPOSITION_REASON_OPTIONS,
  case05_factRelationship: CASE05_FACT_RELATIONSHIP_OPTIONS,
  case05_customerResponse: CASE05_CUSTOMER_RESPONSE_OPTIONS,
  case05_authorityFollowUp: CASE05_AUTHORITY_FOLLOWUP_OPTIONS,
  case05_dispositionOutcome: CASE05_DISPOSITION_OUTCOME_OPTIONS,
  case05_repeatFollowUp: CASE05_REPEAT_FOLLOWUP_OPTIONS,
  case05_actualCore: CASE05_ACTUAL_CORE_OPTIONS,
  case05_deadline: CASE05_DEADLINE_OPTIONS,
  case05_blockage: CASE05_BLOCKAGE_OPTIONS,
  case05_evidence: CASE05_EVIDENCE_OPTIONS,
  case05_finalGoal: CASE05_FINAL_GOAL_OPTIONS,
  case05_dispositionDetail: CASE05_DISPOSITION_DETAIL_OPTIONS,
  case05_factDetail: CASE05_FACT_DETAIL_OPTIONS,
  case05_explanationDetail: CASE05_EXPLANATION_DETAIL_OPTIONS,
  case05_submittedDocsDetail: CASE05_SUBMITTED_DOCS_DETAIL_OPTIONS,
  case05_appealDetail: CASE05_APPEAL_DETAIL_OPTIONS,
};

export function getCase05FieldOptionLabel(fieldId: string, value: string): string {
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

const CASE05_REPEAT_FOLLOWUP_VALUES = new Set([
  "maintained",
  "more_docs",
  "attendance_explanation",
  "payment_demand",
  "modified",
  "revoked",
]);

function case05HasResponded(answers: ReviewAnswers): boolean {
  const response = answers.case05_customerResponse?.trim() ?? "";
  return Boolean(response && response !== "none");
}

function case05NeedsFactRelationshipPhase2(answers: ReviewAnswers): boolean {
  const goal = answers.case05_confirmGoal;
  const type = answers.case05_dispositionType;
  if (type === "situation_mismatch") return true;
  if (
    goal === "understand_impact" ||
    goal === "maintain_reason" ||
    goal === "understand_reason" ||
    goal === "unsure" ||
    goal === "what_to_do"
  ) {
    return true;
  }
  return (
    case05DispositionTypeIsRightsEnded(type) ||
    type === "business_suspended" ||
    type === "application_denied" ||
    type === "reason_hard_to_understand" ||
    isCase05DispositionTypeUnclear(type) ||
    type === "unsure" ||
    type === "other" ||
    type === "other_disposition"
  );
}

function case05NeedsDispositionReasonPhase2(answers: ReviewAnswers): boolean {
  const goal = answers.case05_confirmGoal;
  const type = answers.case05_dispositionType;
  if (type === "reason_hard_to_understand" || type === CASE05_DISPOSITION_TYPE_UNCLEAR) {
    return true;
  }
  if (goal === "understand_reason" || goal === "maintain_reason") return true;
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

function case05NeedsDispositionOutcome(answers: ReviewAnswers): boolean {
  return case05NeedsAuthorityFollowUpPhase2(answers) && Boolean(answers.case05_authorityFollowUp);
}

function case05NeedsRepeatFollowUp(answers: ReviewAnswers): boolean {
  const goal = answers.case05_confirmGoal;
  if (goal === "maintain_reason") return true;
  if (answers.case05_dispositionType === "situation_mismatch") return true;
  const followUp = answers.case05_authorityFollowUp;
  if (!followUp) return false;
  return CASE05_REPEAT_FOLLOWUP_VALUES.has(followUp) || followUp === "under_review";
}

function case05NeedsActualCore(_answers: ReviewAnswers): boolean {
  return false;
}

function case05NeedsBlockage(answers: ReviewAnswers): boolean {
  const goal = answers.case05_confirmGoal;
  const type = answers.case05_dispositionType;
  const rel = answers.case05_factRelationship;
  const reason = answers.case05_dispositionReason;
  if (goal === "unsure" || goal === "what_to_do") return true;
  if (isCase05DispositionTypeUnclear(type) || type === "unsure" || type === "reason_hard_to_understand") {
    return true;
  }
  if (
    reason === "no_clear_reason" ||
    reason === "unsure" ||
    rel === "partial" ||
    rel === "mismatch" ||
    rel === "hard_to_judge" ||
    rel === "unknown"
  ) {
    return true;
  }
  return case05NeedsRepeatFollowUp(answers) && Boolean(answers.case05_authorityFollowUp);
}

function case05NeedsEvidence(answers: ReviewAnswers): boolean {
  const rel = answers.case05_factRelationship;
  const type = answers.case05_dispositionType;
  if (isCase05DispositionTypeUnclear(type) || type === "unsure" || type === "reason_hard_to_understand") {
    return true;
  }
  if (
    rel === "partial" ||
    rel === "mismatch" ||
    rel === "hard_to_judge" ||
    rel === "unknown"
  ) {
    return true;
  }
  if (answers.case05_customerResponse === "documents_submitted") {
    return true;
  }
  return case05NeedsRepeatFollowUp(answers);
}

function case05NeedsFinalGoal(answers: ReviewAnswers): boolean {
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
    label: "교통국에서 받은 안내는 어떤 조치에 관한 것이라고 들으셨나요?",
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
    id: "case05_confirmGoal",
    kind: "choice",
    label: "지금 이 조치와 관련해 가장 먼저 확인하고 싶은 것은 무엇인가요?",
    options: CASE05_CONFIRM_GOAL_OPTIONS,
  });
  if (!answers.case05_confirmGoal) return;

  pushUnique(questions, {
    id: "case05_customerResponse",
    kind: "choice",
    label: "이 조치에 대해 지금까지 어떤 대응을 하셨나요?",
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
    id: "case05_deadline",
    kind: "choice",
    label: "이 처분에 대해 언제까지 대응해야 하는지 현재 확인할 수 있는 상태인가요?",
    options: CASE05_DEADLINE_OPTIONS,
  });
}

function appendCase05Phase2Questions(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  if (case05NeedsFactRelationshipPhase2(answers)) {
    pushUnique(questions, {
      id: "case05_factRelationship",
      kind: "choice",
      label:
        "교통국에서 설명한 조치 이유와 실제 상황을 비교하면, 가장 다른 부분은 무엇인가요?",
      options: CASE05_FACT_RELATIONSHIP_OPTIONS,
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

  if (case05NeedsDispositionReasonPhase2(answers)) {
    pushUnique(questions, {
      id: "case05_dispositionReason",
      kind: "choice",
      label: "교통국에서는 어떤 이유로 이런 조치를 안내했나요?",
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
      label:
        "이 조치 때문에 실제로 어떤 제한이나 변화가 생겼다고 안내받으셨나요?",
      options: CASE05_DISPOSITION_DETAIL_OPTIONS,
    });
    if (!answers.case05_dispositionDetail) return;
  }

  if (case05NeedsFactDetail(answers)) {
    pushUnique(questions, {
      id: "case05_factDetail",
      kind: "choice",
      label: "실제 상황과 처분 사유는 어떤 점에서 다른가요?",
      options: CASE05_FACT_DETAIL_OPTIONS,
    });
    if (!answers.case05_factDetail) return;
  }

  if (case05NeedsExplanationDetail(answers)) {
    pushUnique(questions, {
      id: "case05_explanationDetail",
      kind: "choice",
      label: "기관에 제출한 소명·의견은 어떤 방식이었나요?",
      options: CASE05_EXPLANATION_DETAIL_OPTIONS,
    });
    if (!answers.case05_explanationDetail) return;
  }

  if (case05NeedsSubmittedDocsDetail(answers)) {
    pushUnique(questions, {
      id: "case05_submittedDocsDetail",
      kind: "choice",
      label: "기관에 제출한 서류는 어떤 유형에 가깝나요?",
      options: CASE05_SUBMITTED_DOCS_DETAIL_OPTIONS,
    });
    if (!answers.case05_submittedDocsDetail) return;
  }

  if (case05NeedsAppealDetail(answers)) {
    pushUnique(questions, {
      id: "case05_appealDetail",
      kind: "choice",
      label: "이의제기·재검토 요청은 어떤 상태인가요?",
      options: CASE05_APPEAL_DETAIL_OPTIONS,
    });
    if (!answers.case05_appealDetail) return;
  }

  if (case05NeedsAuthorityFollowUpPhase2(answers)) {
    pushUnique(questions, {
      id: "case05_authorityFollowUp",
      kind: "choice",
      label:
        "이 조치에 대해 교통국에 대응한 뒤, 어떤 답변이나 추가 안내를 받으셨나요?",
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

  if (case05NeedsRepeatFollowUp(answers)) {
    pushUnique(questions, {
      id: "case05_repeatFollowUp",
      kind: "choice",
      label: "처분 후 추가 대응이 반복되었나요?",
      options: CASE05_REPEAT_FOLLOWUP_OPTIONS,
    });
    if (!answers.case05_repeatFollowUp) return;
  }

  if (case05NeedsBlockage(answers)) {
    pushUnique(questions, {
      id: "case05_blockage",
      kind: "choice",
      label: "지금 이 처분·조치 사건에서 가장 막혀 있는 부분은 무엇인가요?",
      options: CASE05_BLOCKAGE_OPTIONS,
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
      label: "지금 확인할 수 있는 자료가 있나요?",
      options: CASE05_EVIDENCE_OPTIONS,
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
      label: "지금 무엇을 확인하고 싶으신가요?",
      options: CASE05_FINAL_GOAL_OPTIONS,
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
  if (case05NeedsDispositionDetail(answers) && !answers.case05_dispositionDetail) return false;
  if (case05NeedsFactDetail(answers) && !answers.case05_factDetail) return false;
  if (case05NeedsExplanationDetail(answers) && !answers.case05_explanationDetail) return false;
  if (case05NeedsSubmittedDocsDetail(answers) && !answers.case05_submittedDocsDetail) return false;
  if (case05NeedsAppealDetail(answers) && !answers.case05_appealDetail) return false;
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
  if (case05NeedsDispositionOutcome(answers) && !answers.case05_dispositionOutcome) return false;
  if (case05NeedsRepeatFollowUp(answers) && !answers.case05_repeatFollowUp) return false;
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
  if (case05NeedsFinalGoal(answers) && !answers.case05_finalGoal) {
    return false;
  }
  return true;
}

export function isCase05PathComplete(answers: ReviewAnswers): boolean {
  if (!shouldActivateCase05Path(answers)) return false;
  return case05PathFieldsComplete(answers);
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
  if (answers.case05_dispositionSource === "unsure") {
    signals.push("DISPOSITION_AUTHORITY_UNCLEAR");
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
  if (
    case05Deadline === "uncertain" ||
    answers.case05_deadline === "unsure" ||
    answers.case05_deadline === "not_stated" ||
    answers.case05_deadline === "period_stated" ||
    answers.case05_deadline === "past_possible"
  ) {
    signals.push("DISPOSITION_DEADLINE_UNCLEAR");
  }
  if (
    answers.case05_authorityFollowUp === "unsure" ||
    answers.case05_authorityFollowUp === "no_response" ||
    answers.case05_dispositionOutcome === "unsure" ||
    answers.case05_dispositionOutcome === "no_result"
  ) {
    signals.push("DISPOSITION_RESPONSE_UNCLEAR");
  }
  if (answers.case05_evidence === "none" || answers.case05_evidence === "unsure") {
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

  const core = answers.case05_actualCore;
  const followUp = answers.case05_authorityFollowUp;

  if (core === "disposition") {
    return {
      id: "CASE_05",
      status: answers.case05_dispositionReason ? "inferred" : "candidate",
      confidence: answers.case05_dispositionReason ? 0.75 : 0.5,
      reason: "처분·조치 통지 사건 경로",
    };
  }

  if (core === "payment" || followUp === "payment_demand") {
    return {
      id: "CASE_02",
      status: "inferred",
      confidence: 0.8,
      reason: "현재 해결 중심이 납부 요구로 확인됨",
    };
  }
  if (core === "attendance" || followUp === "attendance_explanation") {
    return {
      id: "CASE_03",
      status: "inferred",
      confidence: 0.78,
      reason: "현재 해결 중심이 출석·소명으로 확인됨",
    };
  }
  if (core === "supplement" || followUp === "more_docs") {
    return {
      id: "CASE_04",
      status: "inferred",
      confidence: 0.78,
      reason: "현재 해결 중심이 보완·추가 제출로 확인됨",
    };
  }
  if (core === "violation_notice") {
    return {
      id: "CASE_01",
      status: "inferred",
      confidence: 0.75,
      reason: "현재 해결 중심이 위반·문제 통지로 확인됨",
    };
  }
  if (
    core === "unclear" ||
    core === "unsure" ||
    (answers.case05_dispositionType === "unclear" && !core)
  ) {
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
  if (
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

  if (
    (violation === "explanation_unknown" || violation === "unsure") &&
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

  if (demand === "payment" && answers.case01_paymentDemandScope === "core_case") {
    return {
      id: "CASE_02",
      status: "inferred",
      confidence: 0.78,
      reason: "납부·벌금이 이번 사건의 핵심으로 확인됨",
    };
  }
  if (demand === "supplement" && answers.case01_supplementDemandScope === "core_case") {
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
    (case01CrossCaseSignal.id === "CASE_02" || case01CrossCaseSignal.id === "CASE_04")
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
    answers.case01_violationContent === "unsure"
  ) {
    unknowns.push("통지서에 적힌 위반·문제 내용");
  }
  if (answers.case01_actualSituation === "unsure") unknowns.push("실제 상황 설명");
  if (answers.case01_factRelationship === "unknown") {
    unknowns.push("통지 내용과 실제 상황 비교");
  }
  if (
    answers.case01_authorityDemand === "demand_unclear" ||
    answers.case01_authorityDemand === "understanding_unknown" ||
    answers.case01_authorityDemand === "no_stated_demand"
  ) {
    unknowns.push("기관이 요구한 행동");
  }
  if (answers.case01_authorityResponse === "no_reply_yet") {
    unknowns.push("기관 답변·반응");
  }
  if (
    answers.case01_deadline === "uncertain" ||
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
    answers.case01_evidence === "no" ||
    answers.case01_evidence === "unsure" ||
    answers.case01_evidence === "none"
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
  if (case01ActualSituation === "deny") {
    risks.push("위반 사실을 인정하지 않음 — 통지 내용과 대조 필요");
  }
  if (
    answers.case01_deadline === "uncertain" ||
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
  if (
    answers.case01_authorityResponse === "no_response" ||
    answers.case01_authorityResponse === "no_reply_yet" ||
    answers.case01_authorityResponse === "more_required" ||
    answers.case01_authorityResponse === "procedure_unknown" ||
    answers.case01_authorityResponse === "unclear" ||
    answers.case01_authorityResponse === "re_attendance" ||
    answers.case01_authorityResponse === "more_docs" ||
    answers.case01_authorityResponse === "payment_demand"
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
      : answers.case05_dispositionSource
      ? getCase05FieldOptionLabel("case05_dispositionSource", answers.case05_dispositionSource)
      : answers.case02_demandAuthority
        ? getCase02FieldLabelFromAnswers("case02_demandAuthority", answers)?.label ??
          getCase02FieldOptionLabel("case02_demandAuthority", answers.case02_demandAuthority)
        : case01TrafficNotice
          ? CASE01_AUTHORITY_CONTEXT_LABEL
          : answers.profileDocumentSource
            ? getCase06FieldOptionLabel("profileDocumentSource", answers.profileDocumentSource)
            : null,
    answers.case06_exactSource ||
      answers.case05_dispositionSource ||
      answers.case02_demandAuthority ||
      case01TrafficNotice ||
      answers.profileDocumentSource
      ? case01TrafficNotice || !isAnswerFieldInferred(answers, "profileDocumentSource")
        ? "confirmed"
        : "candidate"
      : "unknown",
    answers.case06_exactSource
      ? "case06_exactSource"
      : answers.case05_dispositionSource
      ? "case05_dispositionSource"
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
    eventLabel = getCase02FieldOptionLabel("case02_paymentSubject", answers.case02_paymentSubject);
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

  const authorityClaimLabel = answers.case06_requiredAction
    ? getCase06FieldOptionLabel("case06_requiredAction", answers.case06_requiredAction)
    : answers.case05_dispositionType
    ? getCase05FieldLabelFromAnswers("case05_dispositionType", answers)?.label ??
      getCase05FieldOptionLabel("case05_dispositionType", answers.case05_dispositionType)
    : case06Active && answers.profileCurrentGoal
      ? getCase06FieldOptionLabel("profileCurrentGoal", answers.profileCurrentGoal)
      : answers.case04_supplementTarget
      ? getCase04FieldOptionLabel("case04_supplementTarget", answers.case04_supplementTarget)
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
    answers.case06_requiredAction
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
        ? getCase04FieldOptionLabel("case04_supplementReason", answers.case04_supplementReason)
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
  const case01ActualSituationLabel = getCase01ActualSituationLabel(answers);
  const case01FactRelationshipLabel = getCase01FactRelationshipLabel(answers);
  const actualSituation = fact(
    answers.case05_factRelationship
      ? getCase05FieldOptionLabel("case05_factRelationship", answers.case05_factRelationship)
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

  const customerAction = fact(
    answers.case05_customerResponse
      ? getCase05FieldLabelFromAnswers("case05_customerResponse", answers)?.label ??
        getCase05FieldOptionLabel("case05_customerResponse", answers.case05_customerResponse)
      : answers.case04_customerResponse
        ? getCase04FieldOptionLabel("case04_customerResponse", answers.case04_customerResponse)
        : answers.case03_customerResponse
        ? CASE03_OPTION_LABELS[answers.case03_customerResponse] ?? answers.case03_customerResponse
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
        : answers.case01_authorityResponse
          ? CASE01_OPTION_LABELS[answers.case01_authorityResponse] ?? answers.case01_authorityResponse
          : answers.profileAuthorityGuidance
            ? authorityClaim.value
            : answers.profileProcessStage === "waiting"
              ? "기관·상대방 답변 대기 중이라고 응답"
              : null,
    case05ResponseLabel ||
      case04ResponseLabel ||
      case03ResponseLabel ||
      answers.case02_authorityResponse ||
      answers.case01_authorityResponse ||
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
  const deadline = fact(
    case06Active && answers.profileAuthorityGuidance
      ? getCase06FieldOptionLabel("profileAuthorityGuidance", answers.profileAuthorityGuidance)
      : answers.case05_deadline
      ? getCase05FieldLabelFromAnswers("case05_deadline", answers)?.label ??
        getCase05FieldOptionLabel("case05_deadline", answers.case05_deadline)
      : answers.case04_deadline
        ? getCase04FieldOptionLabel("case04_deadline", answers.case04_deadline)
        : answers.case03_deadline
        ? getCase03FieldOptionLabel("case03_deadline", answers.case03_deadline)
        : answers.case02_deadline
        ? getCase02FieldOptionLabel("case02_deadline", answers.case02_deadline)
        : answers.case01_deadline
          ? answers.case01_deadline === "confirmed" && answers[CASE01_DEADLINE_DATE_KEY]
            ? `대응 기한: ${answers[CASE01_DEADLINE_DATE_KEY]}`
            : CASE01_OPTION_LABELS[answers.case01_deadline] ?? answers.case01_deadline
          : deadlineAssessment === "ok"
        ? "기한·유효기간 확인 완료 응답"
        : deadlineAssessment === "issue"
          ? "기한·유효기간 불확실 응답"
          : deadlineAssessment === "unknown"
            ? "기한·유효기간 미확인"
            : null,
    (case06Active && answers.profileAuthorityGuidance) ||
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
    case06Active && answers.profileAuthorityGuidance
      ? "profileAuthorityGuidance"
      : answers.case05_deadline
      ? "case05_deadline"
      : answers.case04_deadline
        ? "case04_deadline"
        : answers.case03_deadline
        ? "case03_deadline"
        : answers.case02_deadline
        ? "case02_deadline"
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
        ? CASE03_OPTION_LABELS[answers.case03_blockage] ?? answers.case03_blockage
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

  const evidence = fact(
    answers.case06_evidence
      ? getCase06FieldOptionLabel("case06_evidence", answers.case06_evidence)
      : answers.case05_evidence
      ? getCase05FieldOptionLabel("case05_evidence", answers.case05_evidence)
      : answers.case04_evidence
        ? getCase04FieldOptionLabel("case04_evidence", answers.case04_evidence)
        : answers.case03_evidence
        ? CASE03_OPTION_LABELS[answers.case03_evidence] ?? answers.case03_evidence
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
    answers.case03_confirmGoal ??
    answers.case03_finalGoal ??
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
  const goal = fact(
    goalValue
      ? (answers.case06_finalGoal
          ? getCase06FieldOptionLabel("case06_finalGoal", goalValue)
          : null) ??
        (answers.case05_finalGoal
          ? case05FinalGoalDisplay?.label ??
            getCase05FieldOptionLabel("case05_finalGoal", goalValue)
          : null) ??
        (answers.case05_confirmGoal && goalValue === answers.case05_confirmGoal
          ? case05ConfirmGoalDisplay?.label ??
            getCase05FieldOptionLabel("case05_confirmGoal", goalValue)
          : null) ??
        CASE04_OPTION_LABELS[goalValue] ??
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
        : answers.case03_confirmGoal
        ? "case03_confirmGoal"
        : answers.case03_finalGoal
        ? "case03_finalGoal"
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
  { id: "case03_confirmGoal", focus: "goal", rank: 2, reason: "확인 목표" },
  { id: "case03_customerResponse", focus: "customerAction", rank: 3, reason: "고객의 기존 대응" },
  { id: "case03_deadline", focus: "deadline", rank: 4, reason: "출석·소명 기한" },
  { id: "case03_factRelationship", focus: "actualSituation", rank: 5, reason: "사실관계" },
  { id: "case03_inquiryFocus", focus: "authorityReason", rank: 6, reason: "기관이 확인하려는 사실" },
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
  { id: "case02_situationMatch", focus: "actualSituation", rank: 3, reason: "실제 상황과의 관계" },
  { id: "case02_paymentAmount", focus: "authorityClaim", rank: 4, reason: "납부 금액 확인" },
  { id: "case02_paymentStatus", focus: "customerAction", rank: 5, reason: "납부 여부" },
  { id: "case02_confirmGoal", focus: "goal", rank: 6, reason: "납부 관련 확인 목표" },
  { id: "case02_demandAuthority", focus: "authorityClaim", rank: 7, reason: "납부 요구 주체" },
  { id: "case02_paymentBasis", focus: "authorityReason", rank: 8, reason: "납부 사유·근거" },
  { id: "case02_deadline", focus: "deadline", rank: 9, reason: "납부 기한" },
  { id: "case02_authorityResponse", focus: "authorityResponse", rank: 10, reason: "납부 후 기관 반응" },
  { id: "case02_paymentMethod", focus: "authorityClaim", rank: 11, reason: "납부 방법" },
  { id: "case02_nonPaymentNotice", focus: "authorityReason", rank: 12, reason: "미납 시 안내" },
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
  { id: "case05_dispositionSource", focus: "authorityClaim", rank: 7, reason: "처분 기관" },
  { id: "case05_authorityFollowUp", focus: "authorityResponse", rank: 8, reason: "기관 후속 반응" },
  { id: "case05_dispositionDetail", focus: "authorityClaim", rank: 8, reason: "처분 문구 확인" },
  { id: "case05_factDetail", focus: "actualSituation", rank: 9, reason: "실제 사건 확인" },
  { id: "case05_explanationDetail", focus: "customerAction", rank: 10, reason: "소명 내용" },
  { id: "case05_submittedDocsDetail", focus: "evidence", rank: 11, reason: "제출 자료" },
  { id: "case05_appealDetail", focus: "customerAction", rank: 12, reason: "이의·재검토" },
  { id: "case05_dispositionOutcome", focus: "authorityResponse", rank: 13, reason: "처분 후속 결과" },
  { id: "case05_repeatFollowUp", focus: "authorityResponse", rank: 14, reason: "반복 대응" },
  { id: "case05_actualCore", focus: "caseClassification", rank: 15, reason: "사건 재분류" },
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
    if (
      item.id === "case02_paymentMethod" &&
      !case02HasPaidStatus(answers) &&
      !case02NeedsNonPaymentNotice(answers)
    ) {
      continue;
    }
    if (item.id === "case02_nonPaymentNotice" && !case02NeedsNonPaymentNotice(answers)) {
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
    if (item.id === "case03_inquiryFocus" && !case03NeedsInquiryFocusPhase2(answers)) {
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
    if (answers[item.id]?.trim()) continue;
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
    if (item.id === "case05_repeatFollowUp" && !case05NeedsRepeatFollowUp(answers)) continue;
    if (item.id === "case05_actualCore" && !case05NeedsActualCore(answers)) continue;
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
  if (fieldId === CASE01_DEADLINE_DATE_KEY && answers.case01_deadline !== "confirmed") {
    return "deadline !== confirmed";
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
      case03_confirmGoal: "understand_agency_intent",
      case03_inquiryFocus: "unsure",
    },
    C: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "기관이 문제 삼는 내용이 실제 상황과 다릅니다",
      ...case03Base,
      case03_authorityDemand: "specific_incident",
      case03_confirmGoal: "understand_agency_intent",
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
      case03_confirmGoal: "understand_agency_intent",
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
      case04_actualCore: "payment",
      case04_blockage: "demand_unclear",
    },
    F: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "보완 요구를 받았지만 실제 핵심은 출석·소명입니다",
      ...case04Base,
      case04_actualCore: "attendance",
      case04_blockage: "demand_unclear",
    },
    G: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "보완 요구였지만 이미 처분이 내려진 것 같습니다",
      ...case04Base,
      case04_actualCore: "disposition",
      case04_blockage: "demand_unclear",
    },
    H: {
      ...base,
      [CASE_CUSTOMER_INPUT_KEY]: "보완 요구 내용 자체가 이해되지 않습니다",
      ...case04Base,
      case04_supplementTarget: "unclear",
      case04_unclearFocus: "whole_unclear",
      case04_actualCore: "unclear",
      case04_blockage: "demand_unclear",
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
    case05_dispositionSource: "immigration",
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
      case05_dispositionSource: "business_agency",
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
      case05_actualCore: "disposition",
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
      case05_actualCore: "payment",
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
      case05_actualCore: "attendance",
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
      case05_actualCore: "supplement",
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
      case05_actualCore: "unclear",
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
