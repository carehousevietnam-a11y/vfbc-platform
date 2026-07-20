// src/lib/notify/stageChange.ts
//
// STEP6: admin/leads/[id]/page.tsx의 setProcessStage 서버 액션이
// crm_activities에 새 단계 action을 기록한 "직후"에 호출되는 알림
// 오케스트레이터. 이메일(Resend, 항상 시도)과 카카오톡·잘로(각각 kakao_id/
// zalo_id가 있는 리드에 한해 시도 — 현재는 구조만, 실제 발송은 TODO)를
// 병행 발송하고, api/lead-submit, api/agency-confirm과 동일하게 기존
// notifications 테이블에 채널별로 로그를 남긴다(새 테이블/컬럼 없음).
//
// 알림 발송 실패가 "단계 저장" 자체를 실패시키면 안 되므로, 이 함수는
// 절대 throw하지 않고 내부에서 모든 에러를 catch한다. 호출부는
// await notifyStageChange(...)만 하면 되고 결과를 따로 확인할 필요 없다.

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  sendStageChangeEmail,
  STAGE_HEADLINE,
  type StageChangeAction,
} from "@/lib/notify/email";
import { sendStageChangeKakao } from "@/lib/notify/kakao";
import { sendStageChangeZalo } from "@/lib/notify/zalo";

export type { StageChangeAction } from "@/lib/notify/email";

// notifications.template 값 — api/lead-submit의 "result_ready_v1",
// api/agency-confirm의 "agency_confirm_v1"과 동일한 네이밍 관례
// (`<시나리오>_v1`)를 따른다.
const STAGE_TEMPLATE: Record<StageChangeAction, string> = {
  expert_review_request: "stage_expert_review_request_v1",
  agency_upgrade_request: "stage_agency_upgrade_request_v1",
  process_government_submitted: "stage_process_government_submitted_v1",
  process_permit_completed: "stage_process_permit_completed_v1",
};

type NotifyStageChangeOptions = {
  permitFileUrl?: string | null;
};

export async function notifyStageChange(
  leadId: string,
  action: StageChangeAction,
  options: NotifyStageChangeOptions = {}
): Promise<void> {
  try {
    const { data: lead, error: leadError } = await supabaseAdmin
      .from("leads")
      .select("name, email, service_type, user_id, kakao_id, zalo_id")
      .eq("id", leadId)
      .maybeSingle();

    if (leadError || !lead) {
      console.error("notifyStageChange: lead lookup failed", leadError);
      return;
    }

    // /r 결과확인·마이페이지 링크에 필요한 토큰 — agency-confirm route와
    // 동일한 패턴으로 이미 발급된 토큰이 있으면 재사용한다(새로 발급 안 함).
    const { data: tokenRow } = await supabaseAdmin
      .from("result_tokens")
      .select("token")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    const token = tokenRow?.token ?? "";

    const recipientEmail = lead.email ? String(lead.email).trim() : "";
    const serviceType = (lead.service_type as string) ?? "unknown";

    // ── 이메일 ──
    if (recipientEmail) {
      const emailResult = await sendStageChangeEmail({
        to: recipientEmail,
        name: (lead.name as string) ?? "",
        serviceType,
        action,
        token,
        permitFileUrl: options.permitFileUrl ?? null,
      });

      const { error: notifError } = await supabaseAdmin.from("notifications").insert({
        lead_id: leadId,
        user_id: lead.user_id ?? null,
        channel: "email",
        template: STAGE_TEMPLATE[action],
        status: emailResult.success ? "sent" : "failed",
        sent_at: emailResult.success ? new Date().toISOString() : null,
        payload: {
          to: recipientEmail,
          serviceType,
          action,
          error: emailResult.success ? null : emailResult.error,
        },
      });
      if (notifError) {
        console.error("notifyStageChange: notifications(email) insert error", notifError);
      }
    }

    // ── 카카오톡 (kakao_id 있는 리드만, 현재는 구조만 — 실제 발송 TODO) ──
    const kakaoId = lead.kakao_id ? String(lead.kakao_id).trim() : "";
    if (kakaoId) {
      const kakaoResult = await sendStageChangeKakao({
        kakaoId,
        name: (lead.name as string) ?? "",
        serviceType,
        stageHeadline: STAGE_HEADLINE[action],
      });

      const { error: kakaoNotifError } = await supabaseAdmin.from("notifications").insert({
        lead_id: leadId,
        user_id: lead.user_id ?? null,
        channel: "kakao",
        template: STAGE_TEMPLATE[action],
        // 미연동 상태는 "failed"가 아니라 "skipped"로 남겨 관리자가
        // "실제 발송 실패"와 "아직 API 연동 안 됨"을 구분할 수 있게 한다.
        status: kakaoResult.success ? "sent" : kakaoResult.notConfigured ? "skipped" : "failed",
        sent_at: kakaoResult.success ? new Date().toISOString() : null,
        payload: {
          to: kakaoId,
          serviceType,
          action,
          error: kakaoResult.success ? null : kakaoResult.error,
        },
      });
      if (kakaoNotifError) {
        console.error("notifyStageChange: notifications(kakao) insert error", kakaoNotifError);
      }
    }

    // ── 잘로 (zalo_id 있는 리드만, 현재는 구조만 — 실제 발송 TODO) ──
    // 카카오톡과 배타적이지 않다 — 둘 다 있으면 둘 다 시도한다
    // (api/agency-confirm의 기존 "채널 확장 메모"와 동일한 방향).
    const zaloId = lead.zalo_id ? String(lead.zalo_id).trim() : "";
    if (zaloId) {
      const zaloResult = await sendStageChangeZalo({
        zaloId,
        name: (lead.name as string) ?? "",
        serviceType,
        stageHeadline: STAGE_HEADLINE[action],
      });

      const { error: zaloNotifError } = await supabaseAdmin.from("notifications").insert({
        lead_id: leadId,
        user_id: lead.user_id ?? null,
        channel: "zalo",
        template: STAGE_TEMPLATE[action],
        status: zaloResult.success ? "sent" : zaloResult.notConfigured ? "skipped" : "failed",
        sent_at: zaloResult.success ? new Date().toISOString() : null,
        payload: {
          to: zaloId,
          serviceType,
          action,
          error: zaloResult.success ? null : zaloResult.error,
        },
      });
      if (zaloNotifError) {
        console.error("notifyStageChange: notifications(zalo) insert error", zaloNotifError);
      }
    }
  } catch (err) {
    console.error("notifyStageChange exception:", err);
  }
}
