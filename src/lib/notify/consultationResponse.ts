// src/lib/notify/consultationResponse.ts
//
// STEP8-E: admin/leads/[id]/page.tsx의 respondToConsultation 서버 액션이
// crm_activities에 "expert_consultation_response"를 저장한 직후 호출되는
// 알림 함수. stageChange.ts와 동일한 원칙 — 이메일 발송 실패가 "답변 저장"
// 자체를 실패시키면 안 되므로 절대 throw하지 않고 내부에서 모든 에러를
// catch한다. 호출부는 await notifyConsultationResponse(...)만 하면 된다.
//
// 카카오톡/잘로는 이번 범위에 포함하지 않는다(요청 스펙 11번 "이메일 알림"만
// 명시됨) — STEP6처럼 채널을 확장하려면 이 함수에 kakao/zalo 블록을
// stageChange.ts와 동일한 패턴으로 추가하면 된다.

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendConsultationResponseEmail } from "@/lib/notify/email";

const NOTIFICATION_TEMPLATE = "consultation_response_v1";

export async function notifyConsultationResponse(leadId: string): Promise<void> {
  try {
    const { data: lead, error: leadError } = await supabaseAdmin
      .from("leads")
      .select("name, email, service_type, user_id")
      .eq("id", leadId)
      .maybeSingle();

    if (leadError || !lead) {
      console.error("notifyConsultationResponse: lead lookup failed", leadError);
      return;
    }

    const recipientEmail = lead.email ? String(lead.email).trim() : "";
    if (!recipientEmail) return;

    // /r 결과확인·Case Room 링크에 필요한 토큰 — stageChange.ts와 동일한
    // 패턴으로 이미 발급된 토큰이 있으면 재사용한다(새로 발급 안 함).
    const { data: tokenRow } = await supabaseAdmin
      .from("result_tokens")
      .select("token")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    const token = tokenRow?.token ?? "";
    if (!token) {
      console.error("notifyConsultationResponse: result_tokens에 토큰이 없습니다 (leadId=" + leadId + ")");
      return;
    }

    const serviceType = (lead.service_type as string) ?? "unknown";

    const emailResult = await sendConsultationResponseEmail({
      to: recipientEmail,
      name: (lead.name as string) ?? "",
      serviceType,
      token,
    });

    const { error: notifError } = await supabaseAdmin.from("notifications").insert({
      lead_id: leadId,
      user_id: lead.user_id ?? null,
      channel: "email",
      template: NOTIFICATION_TEMPLATE,
      status: emailResult.success ? "sent" : "failed",
      sent_at: emailResult.success ? new Date().toISOString() : null,
      payload: {
        to: recipientEmail,
        serviceType,
        error: emailResult.success ? null : emailResult.error,
      },
    });
    if (notifError) {
      console.error("notifyConsultationResponse: notifications insert error", notifError);
    }
  } catch (err) {
    console.error("notifyConsultationResponse exception:", err);
  }
}
