import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildAdminExpertHandoffMeta } from "@/lib/adminVerifyProfiling";
import {
  parseAdminVerifyAnswersFromActivities,
  shouldInsertExpertReviewRequest,
} from "@/lib/adminVerifyMypageFields";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function asMeta(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function page1MetaFromVerifyLead(meta: Record<string, unknown> | null): Record<string, string> {
  if (!meta) return {};
  const page1: Record<string, string> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (!key.startsWith("review_check_")) continue;
    if (typeof value === "string" && value.trim()) page1[key] = value;
  }
  return page1;
}

export async function POST(req: NextRequest) {
  try {
    const { accessToken, leadId } = (await req.json()) as {
      accessToken?: string;
      leadId?: string;
    };
    if (!accessToken || !leadId) {
      return NextResponse.json({ error: "요청 정보가 올바르지 않습니다." }, { status: 400 });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "로그인이 만료되었습니다. 다시 로그인해주세요." }, { status: 401 });
    }

    const { data: lead, error: leadError } = await supabaseAdmin
      .from("leads")
      .select("id, user_id, service_type")
      .eq("id", leadId)
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (leadError || !lead) {
      return NextResponse.json({ error: "해당 신청 내역을 찾을 수 없습니다." }, { status: 404 });
    }
    if (lead.service_type !== "verify_admin") {
      return NextResponse.json({ error: "이 신청에서는 요청할 수 없습니다." }, { status: 400 });
    }

    const { data: existing } = await supabaseAdmin
      .from("crm_activities")
      .select("id")
      .eq("lead_id", leadId)
      .eq("action", "expert_review_request")
      .maybeSingle();

    if (!shouldInsertExpertReviewRequest(Boolean(existing))) {
      return NextResponse.json({ success: true, alreadyRecorded: true });
    }

    const { data: activitiesRaw, error: activitiesError } = await supabaseAdmin
      .from("crm_activities")
      .select("action, meta, created_at")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: true });

    if (activitiesError) {
      console.error("mypage-expert-request activities error:", activitiesError);
      return NextResponse.json({ error: "접수 중 문제가 발생했습니다." }, { status: 500 });
    }

    const activities = activitiesRaw ?? [];
    const answers = parseAdminVerifyAnswersFromActivities(activities);
    const verifyLead = [...activities].reverse().find((row) => row.action === "verify_lead");
    const caseHandoffMeta = buildAdminExpertHandoffMeta(
      answers,
      page1MetaFromVerifyLead(asMeta(verifyLead?.meta)),
    );

    const { error: insertError } = await supabaseAdmin.from("crm_activities").insert({
      lead_id: leadId,
      action: "expert_review_request",
      tag: "VERIFY_ADMIN",
      meta: caseHandoffMeta,
    });

    if (insertError) {
      console.error("mypage-expert-request insert error:", insertError);
      return NextResponse.json({ error: "접수 중 문제가 발생했습니다." }, { status: 500 });
    }

    return NextResponse.json({ success: true, alreadyRecorded: false });
  } catch (err) {
    console.error("mypage-expert-request route error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
