// src/lib/caseKnowledge/generator.ts
//
// STEP21 — Knowledge Generator. "사건 종료 시 자동 생성"이라는 목표는
// 유지하되, 현재 이 프로젝트에는 "사건이 종료됐다"를 알려주는 자동
// 이벤트가 아직 없다(admin/cases에 승인/반려/철회 같은 최종 결과를
// 기록하는 기능 자체가 없음 — case_records 워크스트림과 동일하게 미착수
// 상태). 그래서 관리자가 사건 종료 정보를 입력하면 그 즉시 지식을
// 생성/갱신하는 함수로 구현했다.
//
// [STEP21-1 변경]
// 1) 중복 생성 방지: case_knowledge.lead_id에 UNIQUE 제약을 걸고,
//    upsert(onConflict: "lead_id")로 바꿨다. 같은 leadId로 이 함수를
//    여러 번 호출해도 행이 계속 늘어나지 않고 기존 행이 갱신된다.
//    내용이 바뀌었으므로 재생성 시 needs_manual_review=true,
//    is_published=false로 강제 리셋하고 reviewed_*/published_*도
//    비운다 — "다시 검토받기 전에는 게시 상태가 아니다"를 보장하기
//    위함(재생성됐는데 예전 검토 상태가 그대로 남아 있으면 위험함).
// 2) case_conversations 조회를 conversation_index 대신 seq로 정렬한다
//    (case_conversations.seq는 DB IDENTITY 컬럼).
// 3) caseStatus를 받는다 — "ongoing"(예: 보완 중)이면 resultStatus 없이도
//    기록 가능하고, 기본값(생략 시)은 "closed"이며 이 경우 resultStatus가
//    필수다.

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { fetchKnownPii, redactPii, getRedactionVersion } from "./piiRedaction";
import type { CaseCategory, CaseKnowledgeRow, CaseOutcomeInput } from "./types";

// src/lib/aiCaseContext.ts의 getCategory()와 동일한 분류 규칙을 의도적으로
// "복사"했다(import하지 않음) — 이 STEP의 절대 원칙("CHECK/VERIFY/REGISTER/
// Business Logic 절대 수정 금지")에 따라 그 파일에는 export 하나도 추가하지
// 않았다. 서비스 타입 접두어 규칙이 바뀌면 이 사본도 함께 갱신해야 한다는
// 유지보수 부담이 있다는 점을 설계 문서에 명시했다.
function classifyServiceType(serviceType: string | null | undefined): CaseCategory {
  if (!serviceType) return "unclassified";
  const key = serviceType.toLowerCase().replace(/-/g, "_");
  if (key === "consultation") return "consultation";
  if (key.startsWith("verify")) return "verify";
  if (key.startsWith("permit") || key.startsWith("register")) return "register";
  if (["wp", "trc", "tamtru", "driving_license"].includes(key)) return "check";
  return "unclassified";
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export type GenerateCaseKnowledgeResult =
  | { ok: true; row: CaseKnowledgeRow }
  | { ok: false; error: string };

export async function generateCaseKnowledge(
  input: CaseOutcomeInput
): Promise<GenerateCaseKnowledgeResult> {
  const { leadId } = input;
  const caseStatus = input.caseStatus ?? "closed";

  if (caseStatus === "closed" && !input.resultStatus) {
    return { ok: false, error: "caseStatus가 closed이면 resultStatus가 필수입니다." };
  }

  const { data: lead, error: leadError } = await supabaseAdmin
    .from("leads")
    .select("service_type")
    .eq("id", leadId)
    .maybeSingle();

  if (leadError || !lead) {
    console.error("generateCaseKnowledge: lead not found", leadError);
    return { ok: false, error: "해당 leadId의 사건을 찾을 수 없습니다." };
  }

  const category = classifyServiceType(lead.service_type);

  const { data: conversationRows, error: conversationError } = await supabaseAdmin
    .from("case_conversations")
    .select("role, content, seq")
    .eq("lead_id", leadId)
    .order("seq", { ascending: true });

  if (conversationError) {
    console.error("generateCaseKnowledge: conversation fetch failed", conversationError);
    return { ok: false, error: "대화 로그 조회에 실패했습니다." };
  }

  const userTurns = (conversationRows ?? []).filter((r) => r.role === "user");
  const assistantTurns = (conversationRows ?? []).filter((r) => r.role === "assistant");

  // 단순 휴리스틱(첫 질문 / 마지막 답변)만 사용한다 — AI 요약(OpenAI 호출)은
  // 이번 스텝 범위에 넣지 않았다. 대화가 아예 없는 사건도 있을 수 있으므로
  // 빈 문자열이 아니라 명시적 안내 문구로 대체한다.
  const question = userTurns[0]?.content ?? "(기록된 고객 질문 없음)";
  const aiAnswer = assistantTurns[assistantTurns.length - 1]?.content ?? "(기록된 AI 답변 없음)";

  const known = await fetchKnownPii(leadId);
  const redactedQuestion = truncate(redactPii(question, known), 4000);
  const redactedAiAnswer = truncate(redactPii(aiAnswer, known), 4000);
  const redactedExpertReview = input.expertReview
    ? truncate(redactPii(input.expertReview, known), 4000)
    : null;
  const redactedFinalResult = input.finalResult
    ? truncate(redactPii(input.finalResult, known), 2000)
    : null;
  const redactedRejectionReason = input.rejectionReason
    ? truncate(redactPii(input.rejectionReason, known), 1000)
    : null;

  // [STEP21-1] upsert(onConflict: "lead_id") — 이미 이 leadId의 행이
  // 있으면 새 행을 만들지 않고 기존 행을 갱신한다(중복 생성 방지).
  // 내용이 바뀌었으므로 검토/게시 상태는 항상 리셋한다.
  const { data: upserted, error: upsertError } = await supabaseAdmin
    .from("case_knowledge")
    .upsert(
      {
        lead_id: leadId,
        service_type: lead.service_type,
        category,
        country: "VN",
        question: redactedQuestion,
        ai_answer: redactedAiAnswer,
        expert_review: redactedExpertReview,
        final_result: redactedFinalResult,
        case_status: caseStatus,
        result_status: input.resultStatus ?? null,
        rejection_reason: redactedRejectionReason,
        processing_days: input.processingDays ?? null,
        related_documents: input.relatedDocuments ?? [],
        related_laws: input.relatedLaws ?? [],
        pii_redaction_version: getRedactionVersion(),
        needs_manual_review: true,
        is_published: false,
        reviewed_by: null,
        reviewed_at: null,
        published_by: null,
        published_at: null,
      },
      { onConflict: "lead_id" }
    )
    .select("*")
    .single();

  if (upsertError || !upserted) {
    console.error("generateCaseKnowledge: upsert failed", upsertError);
    return { ok: false, error: "사례 지식 저장에 실패했습니다." };
  }

  return { ok: true, row: upserted as CaseKnowledgeRow };
}
