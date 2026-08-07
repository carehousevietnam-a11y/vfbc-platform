// src/lib/caseKnowledge/types.ts
//
// STEP21 — AI Case Intelligence. 새 테이블 case_conversations / case_knowledge에
// 대응하는 공용 타입만 모아둔 파일. 기존 타입(CaseMessage 등, src/lib/
// caseMessages.ts)과 겹치지 않는 새 이름을 썼다 — 기존 타입을 재정의하거나
// 변경하지 않았다.
//
// [STEP21-1 변경]
// 1) leads.id 타입: TypeScript에서는 uuid든 text든 런타임 표현이 동일하게
//    string이므로 타입 정의 자체는 바뀌지 않는다(lead_id: string). 실제
//    컬럼 타입 일치 여부는 SQL(step21_case_knowledge.sql) 쪽 문제이며,
//    그 파일 상단에 실행 전 확인 절차를 명시했다.
// 2) result_status에서 in_supplement 제거, 대신 case_status(ongoing/closed)를
//    신설해 "진행 중"과 "최종 결과"를 서로 다른 축으로 분리했다.
// 3) 게시 워크플로 필드 추가: published_by/published_at (검토는 기존
//    reviewed_by/reviewed_at을 그대로 쓰되, 의미를 "생성자"가 아니라
//    "검토자"로 명확히 했다).
// 4) CaseConversationRow.conversation_index를 seq(DB IDENTITY 컬럼, 전역
//    단조증가)로 교체 — 경쟁조건 없는 정렬 키.

export type CaseCategory = "check" | "verify" | "register" | "consultation" | "unclassified";

// "최종 결과"만 표현한다 — 진행 중 여부는 CaseStatus가 담당한다.
export type CaseResultStatus =
  | "success" // 승인
  | "rejected" // 반려
  | "withdrawn" // 철회
  | "success_after_supplement"; // 보완 후 승인

// 사건이 아직 진행 중인지(ongoing, 예: 보완 중) 최종 종료됐는지(closed)를
// result_status와 분리된 축으로 표현한다. ongoing인 동안은 result_status가
// null일 수 있다.
export type CaseStatus = "ongoing" | "closed";

export type ConversationRole = "user" | "assistant";

export type CaseConversationRow = {
  id: string;
  lead_id: string;
  role: ConversationRole;
  content: string;
  // DB IDENTITY 컬럼(case_conversations.seq) — 전역 단조증가, 애플리케이션
  // 레벨의 count()/read-modify-write 없이 DB가 직접 보장하는 정렬 키.
  seq: number;
  created_at: string;
};

export type CaseKnowledgeRow = {
  id: string;
  lead_id: string | null;
  service_type: string;
  category: CaseCategory;
  country: string;
  province: string | null;
  industry: string | null;
  question: string;
  ai_answer: string;
  expert_review: string | null;
  final_result: string | null;
  case_status: CaseStatus;
  result_status: CaseResultStatus | null;
  rejection_reason: string | null;
  processing_days: number | null;
  related_documents: unknown[];
  related_laws: unknown[];
  confidence: number | null;
  pii_redaction_version: string;
  needs_manual_review: boolean;
  is_published: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  published_by: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

// generateCaseKnowledge()를 호출할 때 관리자가 입력하는 값(사건 종료
// 정보). 질문/답변은 대화 로그에서 자동으로 가져오므로 여기서 받지 않는다.
// [STEP21-1] caseStatus 추가 — "ongoing"으로 호출하면 resultStatus 없이도
// (보완 중 등) 기록을 남길 수 있다. resultStatus를 생략하고 caseStatus를
// 안 넘기면 기본값 "closed"로 간주하고, 그 경우 resultStatus는 필수다
// (generator.ts에서 검증).
export type CaseOutcomeInput = {
  leadId: string;
  caseStatus?: CaseStatus; // 기본값: "closed"
  resultStatus?: CaseResultStatus; // caseStatus가 "closed"일 때 필수
  finalResult?: string;
  rejectionReason?: string;
  processingDays?: number;
  expertReview?: string;
  relatedDocuments?: string[];
  relatedLaws?: string[];
};

// 유사 사례 검색 필터 — 향후 벡터 검색으로 교체되어도 호출부 시그니처가
// 유지되도록 필드를 넉넉히 잡아둔다(7번 요구사항: 확장 가능한 구조).
export type SimilarCaseQuery = {
  serviceType?: string;
  category?: CaseCategory;
  country?: string;
  province?: string;
  industry?: string;
  resultStatus?: CaseResultStatus;
  limit?: number;
};

// [STEP21-1 신규] 검토 액션(수정 포함) 입력 — publish/unpublish와는 별개.
export type CaseReviewInput = {
  reviewedBy: string;
  question?: string;
  aiAnswer?: string;
  expertReview?: string;
  finalResult?: string;
  rejectionReason?: string;
};
