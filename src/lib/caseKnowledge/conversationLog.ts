// src/lib/caseKnowledge/conversationLog.ts
//
// STEP21 — case_conversations에 대화 1턴을 추가로 기록하는 헬퍼.
// src/lib/caseMessages.ts의 saveUserChatMessage/saveAssistantChatMessage
// (crm_activities 저장)는 전혀 건드리지 않는다 — 이 파일은 그 옆에
// "추가로만" 기록한다.
//
// [STEP21-1] count() → conversation_index 계산 방식을 완전히 제거했다.
// 이전 버전은 "SELECT count(*) 후 그 값을 conversation_index로 insert"
// 하는 2단계 구조였는데, 동시에 여러 요청이 들어오면 두 요청이 같은
// count 값을 읽어 같은 index로 저장될 수 있었다(경쟁조건). 이제는
// SQL의 case_conversations.seq(bigint generated always as identity)
// 컬럼이 INSERT 시점에 DB 안에서 직접, 원자적으로 유일한 값을
// 발급하므로, 애플리케이션은 그냥 insert만 하면 된다 — 순서를 계산할
// 필요가 없다.
//
// 실패해도 채팅 응답 자체를 막지 않는다는 원칙은 그대로 유지한다.
// 호출부(ai-chat/route.ts)에서 이제 await + try/catch로 감싸 호출하지만,
// 이 함수 내부도 스스로 절대 throw하지 않도록 자체 방어한다(이중 안전장치).

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { ConversationRole } from "./types";

export async function logCaseConversationTurn(
  leadId: string,
  role: ConversationRole,
  content: string
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from("case_conversations").insert({
      lead_id: leadId,
      role,
      content,
    });

    if (error) {
      console.error("logCaseConversationTurn insert error:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("logCaseConversationTurn unexpected error:", err);
    return false;
  }
}
