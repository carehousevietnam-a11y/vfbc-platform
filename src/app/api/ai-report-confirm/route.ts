import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendResultEmail } from "@/lib/notify/email";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 사용자가 결과화면에서 "AI 리포트 요청하기"를 선택한 시점에만 호출된다.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token: tokenParam, leadId: leadIdParam } = body as {
      token?: string;
      leadId?: string;
    };

    let leadId: string | null = null;
    let resolvedToken = tokenParam ?? "";

    if (tokenParam) {
      const { data: tokenRow, error: tokenError } = await supabaseAdmin
        .from("result_tokens")
        .select("lead_id")
        .eq("token", tokenParam)
        .maybeSingle();

      if (tokenError || !tokenRow) {
        console.error("ai-report-confirm: token lookup failed", tokenError);
        return NextResponse.json(
          { error: "유효하지 않은 토큰입니다." },
          { status: 400 }
        );
      }
      leadId = tokenRow.lead_id;
    } else if (leadIdParam) {
      leadId = leadIdParam;

      const { data: existingTokenRow } = await supabaseAdmin
        .from("result_tokens")
        .select("token")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (existingTokenRow?.token) {
        resolvedToken = existingTokenRow.token;
      }
    } else {
      return NextResponse.json(
        { error: "token 또는 leadId 중 하나는 필수입니다." },
        { status: 400 }
      );
    }

    const { data: leadRow, error: leadError } = await supabaseAdmin
      .from("leads")
      .select("name, email, service_type, user_id")
      .eq("id", leadId)
      .maybeSingle();

    if (leadError || !leadRow) {
      console.error("ai-report-confirm: lead lookup failed", leadError);
      return NextResponse.json(
        { error: "리드 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    let emailSuccess = true;
    const recipientEmail = leadRow.email ? String(leadRow.email).trim() : "";

    if (recipientEmail) {
      const emailResult = await sendResultEmail({
        to: recipientEmail,
        name: leadRow.name ?? "",
        serviceType: leadRow.service_type ?? "unknown",
        result: "ai_report",
        token: resolvedToken,
      });
      emailSuccess = emailResult.success;

      const { error: notifError } = await supabaseAdmin.from("notifications").insert({
        lead_id: leadId,
        user_id: leadRow.user_id ?? null,
        channel: "email",
        template: "ai_report_confirm_v1",
        status: emailResult.success ? "sent" : "failed",
        sent_at: emailResult.success ? new Date().toISOString() : null,
        payload: {
          to: recipientEmail,
          serviceType: leadRow.service_type ?? null,
          error: emailResult.success ? null : emailResult.error,
        },
      });

      if (notifError) {
        console.error("ai-report-confirm: notifications insert error", notifError);
      }
    }

    return NextResponse.json({ success: emailSuccess, skipped: recipientEmail ? undefined : "no_email" });
  } catch (err) {
    console.error("ai-report-confirm route error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
