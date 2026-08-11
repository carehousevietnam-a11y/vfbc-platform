import { supabase } from "@/lib/supabase";

const CRM_AI_REPORT_REQUEST_ACTION = "ai_report_request";

// 결과화면 "AI 리포트 요청하기" — CRM 기록 + 접수 확인 이메일 트리거.
// redirect(auto-login)을 막지 않도록 비동기 fire-and-forget으로 실행한다.
export function recordAiReportRequestAndNotify(params: {
  leadId: string;
  tag: string;
  token?: string;
}): void {
  void recordAiReportRequestAndNotifyAsync(params).catch((err) => {
    console.error("ai report notify failed:", err);
  });
}

async function recordAiReportRequestAndNotifyAsync(params: {
  leadId: string;
  tag: string;
  token?: string;
}): Promise<void> {
  const { leadId, tag, token } = params;

  const { data: existing, error: existingErr } = await supabase
    .from("crm_activities")
    .select("id")
    .eq("lead_id", leadId)
    .eq("action", CRM_AI_REPORT_REQUEST_ACTION)
    .maybeSingle();

  if (existingErr) {
    console.error("ai_report_request lookup failed:", existingErr);
  }

  if (!existing) {
    const { error: insertErr } = await supabase.from("crm_activities").insert({
      lead_id: leadId,
      action: CRM_AI_REPORT_REQUEST_ACTION,
      tag,
    });

    if (insertErr) {
      console.error("ai_report_request insert failed:", insertErr);
    }
  }

  try {
    const res = await fetch("/api/ai-report-confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(token ? { token } : { leadId }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      console.error("ai-report-confirm failed:", res.status, body);
    }
  } catch (emailErr) {
    console.error("ai-report-confirm email trigger failed:", emailErr);
  }
}
