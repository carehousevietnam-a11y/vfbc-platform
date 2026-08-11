import { supabase } from "@/lib/supabase";

const CRM_AGENCY_REQUEST_ACTION = "agency_upgrade_request";

// CHECK 결과화면 "전문가 진행 요청하기" — CRM 기록 + 접수 확인 이메일 트리거.
// documents/page.tsx의 recordAgencyRequest()와 동일한 중복 방지 패턴을 사용한다.
export async function recordAgencyUpgradeAndNotify(params: {
  leadId: string;
  tag: string;
  token?: string;
}): Promise<void> {
  const { leadId, tag, token } = params;

  const { data: existing, error: existingErr } = await supabase
    .from("crm_activities")
    .select("id")
    .eq("lead_id", leadId)
    .eq("action", CRM_AGENCY_REQUEST_ACTION)
    .maybeSingle();

  if (existingErr) {
    console.error("agency_upgrade_request lookup failed:", existingErr);
  }

  if (existing) return;

  const { error: insertErr } = await supabase.from("crm_activities").insert({
    lead_id: leadId,
    action: CRM_AGENCY_REQUEST_ACTION,
    tag,
  });

  if (insertErr) {
    console.error("agency_upgrade_request insert failed:", insertErr);
  }

  try {
    await fetch("/api/agency-confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(token ? { token } : { leadId }),
    });
  } catch (emailErr) {
    console.error("agency-confirm email trigger failed:", emailErr);
  }
}
