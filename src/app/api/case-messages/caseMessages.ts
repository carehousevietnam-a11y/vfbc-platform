// src/lib/caseMessages.ts
//
// STEP8: Case Room(고객 ↔ AI Case Manager ↔ 전문가) 메시지를 새 테이블 없이
// 기존 crm_activities에 저장·조회하는 서버 전용 헬퍼.
// 반드시 서버(API route, admin 서버 액션)에서만 import한다 — service role
// key를 쓰는 supabaseAdmin을 포함하므로 "use client" 파일에서 절대 import
//하면 안 된다.
//
// ── 왜 새 테이블(case_messages 등)을 만들지 않았는가 ──
// crm_activities(lead_id, action, tag, meta jsonb, created_at)는 이미 이
// 프로젝트의 모든 엔진이 "사건에 붙는 활동 1건"을 기록하는 공용 테이블이고,
// 아래 4가지 요구를 이 컬럼만으로 안전하게 충족할 수 있다.
//   - 순서 보존            → created_at 오름차순 정렬
//   - 고객 문의 ↔ 전문가 답변 연결 → meta.requestActivityId(요청 활동의 id)
//   - 작성 주체 구분        → action 값 자체가 구분자
//   - 고객 공개 여부        → 아래 4개 action은 전부 "고객 자신의 대화방
//     내용"이라 전문가 내부 메모(action: "expert_memo", 기본 비공개)와
//     달리 항상 고객에게 공개해도 되는 내용만 담긴다. 별도
//     visibleToCustomer 플래그 없이 "이 action 화이트리스트에 있으면
//     Case Room에 표시"라는 원칙으로 충분하다(admin/leads/[id]/page.tsx의
//     STAGE_ACTIONS 화이트리스트와 동일한 패턴).
// 새 테이블이 필요해지는 경우(예: 여러 전문가 동시 참여, 읽음 표시 등)는
// 이번 범위 밖이다.
//
// ── action 4종 (신규) ──
//   ai_chat_user_message      meta: { content }
//   ai_chat_assistant_message meta: { content, needsExpert }
//   expert_consultation_requested meta: { content }
//   expert_consultation_response  meta: { content, requestActivityId }
// 기존 action(expert_review_request, consultation_request 등)과 이름이
// 겹치지 않도록 새로 만들었다 — 기존 action은 이미 "진행 단계 판정"(예:
// hasExpertReview)에 쓰이고 있어 재사용하면 진행률 계산이 깨진다.

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const CASE_MESSAGE_ACTIONS = [
  "ai_chat_user_message",
  "ai_chat_assistant_message",
  "expert_consultation_requested",
  "expert_consultation_response",
] as const;

type CaseMessageAction = (typeof CASE_MESSAGE_ACTIONS)[number];

export type CaseMessage =
  | { id: string; type: "customer"; content: string; createdAt: string }
  | { id: string; type: "ai"; content: string; createdAt: string; needsExpert: boolean }
  | {
      id: string;
      type: "consultation_request";
      content: string;
      createdAt: string;
      status: "pending" | "answered";
    }
  | {
      id: string;
      type: "consultation_response";
      content: string;
      createdAt: string;
      requestId: string | null;
    };

type ActivityRow = {
  id: string;
  action: string | null;
  meta: unknown;
  created_at: string;
};

function asMeta(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

// leadId 소유권은 호출부(api/case-messages, api/case-consultation)가
// verifyOwnedLead()로 먼저 검증한 뒤에만 호출한다.
export async function fetchCaseMessages(leadId: string): Promise<CaseMessage[]> {
  const { data, error } = await supabaseAdmin
    .from("crm_activities")
    .select("id, action, meta, created_at")
    .eq("lead_id", leadId)
    .in("action", CASE_MESSAGE_ACTIONS as unknown as string[])
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("fetchCaseMessages error:", error);
    return [];
  }
  const rows = data as ActivityRow[];

  // 답변 완료 여부 판단을 위해 요청 id → 응답 존재 여부를 먼저 모은다.
  const answeredRequestIds = new Set<string>();
  for (const row of rows) {
    if (row.action === "expert_consultation_response") {
      const meta = asMeta(row.meta);
      const requestId = asString(meta?.requestActivityId);
      if (requestId) answeredRequestIds.add(requestId);
    }
  }

  const messages: CaseMessage[] = [];
  for (const row of rows) {
    const meta = asMeta(row.meta);
    const content = asString(meta?.content);
    if (!content) continue;

    switch (row.action as CaseMessageAction) {
      case "ai_chat_user_message":
        messages.push({ id: row.id, type: "customer", content, createdAt: row.created_at });
        break;
      case "ai_chat_assistant_message":
        messages.push({
          id: row.id,
          type: "ai",
          content,
          createdAt: row.created_at,
          needsExpert: meta?.needsExpert === true,
        });
        break;
      case "expert_consultation_requested":
        messages.push({
          id: row.id,
          type: "consultation_request",
          content,
          createdAt: row.created_at,
          status: answeredRequestIds.has(row.id) ? "answered" : "pending",
        });
        break;
      case "expert_consultation_response": {
        const requestId = asString(meta?.requestActivityId) || null;
        messages.push({
          id: row.id,
          type: "consultation_response",
          content,
          createdAt: row.created_at,
          requestId,
        });
        break;
      }
    }
  }
  return messages;
}

// 대화 유무 판단(첫 진입 시 동적 인사말을 부를지 결정)에 쓰는 가벼운 헬퍼.
// AI 대화 메시지가 하나라도 있으면 이미 대화가 시작된 것으로 본다
// (전문가 상담 요청만 있고 AI 대화가 없는 경우는 드물지만, 그 경우에도
// 인사말을 다시 보여주는 것이 자연스럽다).
export function hasAiConversation(messages: CaseMessage[]): boolean {
  return messages.some((m) => m.type === "customer" || m.type === "ai");
}

export async function saveUserChatMessage(
  leadId: string,
  content: string
): Promise<{ id: string; createdAt: string } | null> {
  const { data, error } = await supabaseAdmin
    .from("crm_activities")
    .insert({
      lead_id: leadId,
      action: "ai_chat_user_message",
      tag: "AI_CHAT",
      meta: { content },
    })
    .select("id, created_at")
    .single();
  if (error || !data) {
    console.error("saveUserChatMessage error:", error);
    return null;
  }
  return { id: data.id as string, createdAt: data.created_at as string };
}

export async function saveAssistantChatMessage(
  leadId: string,
  content: string,
  needsExpert: boolean
): Promise<{ id: string; createdAt: string } | null> {
  const { data, error } = await supabaseAdmin
    .from("crm_activities")
    .insert({
      lead_id: leadId,
      action: "ai_chat_assistant_message",
      tag: "AI_CHAT",
      meta: { content, needsExpert },
    })
    .select("id, created_at")
    .single();
  if (error || !data) {
    console.error("saveAssistantChatMessage error:", error);
    return null;
  }
  return { id: data.id as string, createdAt: data.created_at as string };
}

export async function saveConsultationRequest(
  leadId: string,
  content: string
): Promise<{ id: string; createdAt: string } | null> {
  const { data, error } = await supabaseAdmin
    .from("crm_activities")
    .insert({
      lead_id: leadId,
      action: "expert_consultation_requested",
      tag: "CUSTOMER_CONSULTATION_REQUEST",
      meta: { content },
    })
    .select("id, created_at")
    .single();
  if (error || !data) {
    console.error("saveConsultationRequest error:", error);
    return null;
  }
  return { id: data.id as string, createdAt: data.created_at as string };
}

// 관리자 서버 액션(admin/leads/[id]/page.tsx)에서만 호출한다. 이미 이
// 요청에 대한 답변이 있으면 중복 저장하지 않는다(관리자 폼 중복 제출 방지 —
// setProcessStage의 기존-존재-확인 패턴과 동일).
export async function saveConsultationResponse(
  leadId: string,
  requestActivityId: string,
  content: string
): Promise<{ id: string; createdAt: string } | null> {
  const { data: existing } = await supabaseAdmin
    .from("crm_activities")
    .select("id")
    .eq("lead_id", leadId)
    .eq("action", "expert_consultation_response")
    .contains("meta", { requestActivityId })
    .maybeSingle();
  if (existing) return null;

  const { data, error } = await supabaseAdmin
    .from("crm_activities")
    .insert({
      lead_id: leadId,
      action: "expert_consultation_response",
      tag: "ADMIN_CONSULTATION_RESPONSE",
      meta: { content, requestActivityId },
    })
    .select("id, created_at")
    .single();
  if (error || !data) {
    console.error("saveConsultationResponse error:", error);
    return null;
  }
  return { id: data.id as string, createdAt: data.created_at as string };
}
