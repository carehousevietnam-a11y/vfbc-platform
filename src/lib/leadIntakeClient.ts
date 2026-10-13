// src/lib/leadIntakeClient.ts
//
// 브라우저 → /api/lead-intake. 접수(leads + crm_activities 1건)를 서버 경유로 저장한다.
// user_id는 보내지 않는다(서버가 로그인 토큰으로 판단). 성공 시 leadId를 돌려준다.

import { supabase } from "@/lib/supabase";

export type LeadIntakeInput = {
  id?: string;
  name: string;
  phone: string;
  address: string;
  email?: string | null;
  kakao_id?: string | null;
  zalo_id?: string | null;
  service_type: string;
  result?: string | null;
  source_page: string;
};

export type LeadIntakeCrm = {
  action: string;
  tag: string;
  meta?: Record<string, unknown> | null;
};

export type LeadIntakeResult = { ok: true; leadId: string } | { ok: false; error: string };

export async function submitLeadIntake(lead: LeadIntakeInput, crm?: LeadIntakeCrm): Promise<LeadIntakeResult> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch("/api/lead-intake", {
      method: "POST",
      headers,
      body: JSON.stringify({ lead, crm: crm ?? null }),
    });
    const body = (await res.json().catch(() => null)) as { ok?: boolean; leadId?: string; error?: string } | null;
    if (res.ok && body?.ok && typeof body.leadId === "string") return { ok: true, leadId: body.leadId };
    return { ok: false, error: body?.error ?? `http_${res.status}` };
  } catch {
    return { ok: false, error: "network" };
  }
}
