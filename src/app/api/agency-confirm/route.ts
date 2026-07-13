import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendResultEmail } from "@/lib/notify/email";

// 이 파일은 서버에서만 실행됩니다. service role key는 절대 브라우저로 노출되지 않습니다.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 사용자가 실제 행동(포털 클릭=직접신청 선택, 대행신청 확정)을 취한 시점에만
// 호출된다. 호출 지점 예시:
// 1) /r 결과확인 페이지의 "대행 신청하기" 버튼 → type 없음(기본값 agency), token 사용
// 2) 땀주/TRC/WP의 관할기관 포털 링크 클릭(직접 신청 선택) → type: "self", leadId 사용
// 3) 땀주 셀프등록의 "대신 VFBC 대행 신청하기" 업그레이드 버튼 → type: "agency", leadId 사용
//
// 채널 확장 메모: 현재는 이메일(channel: "email")만 실제로 발송한다.
// 나중에 카카오톡/잘로 API가 연동되면, 아래 notifications insert 부분에
// channel: "kakao" / "zalo" 건을 나란히 추가하고, leads.kakao_id / zalo_id가
// 있는 경우에만 해당 채널로도 함께 보내는 방식으로 확장하면 된다.
// (email과 SNS를 배타적으로 두지 않고, 있는 채널마다 병행 발송하는 구조를 권장)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token: tokenParam, leadId: leadIdParam, type } = body as {
      token?: string;
      leadId?: string;
      type?: "agency" | "self";
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
        console.error("agency-confirm: token lookup failed", tokenError);
        return NextResponse.json(
          { error: "유효하지 않은 토큰입니다." },
          { status: 400 }
        );
      }
      leadId = tokenRow.lead_id;
    } else if (leadIdParam) {
      leadId = leadIdParam;

      // token 없이 leadId로 호출된 경우 — 이메일 버튼 링크가 깨지지 않도록
      // 이 리드에 이미 발급된 result_token이 있는지 먼저 찾아서 재사용한다.
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
      .select("name, email, service_type, user_id, kakao_id, zalo_id")
      .eq("id", leadId)
      .maybeSingle();

    if (leadError || !leadRow) {
      console.error("agency-confirm: lead lookup failed", leadError);
      return NextResponse.json(
        { error: "리드 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const resultValue = type === "self" ? "self" : "agency";
    let emailSuccess = true;

    // 이메일이 있을 때만 이메일 발송 (없으면 조용히 건너뜀 — 에러 아님)
    const recipientEmail = leadRow.email ? String(leadRow.email).trim() : "";
    if (recipientEmail) {
      const emailResult = await sendResultEmail({
        to: recipientEmail,
        name: leadRow.name ?? "",
        serviceType: leadRow.service_type ?? "unknown",
        result: resultValue,
        token: resolvedToken,
      });
      emailSuccess = emailResult.success;

      const { error: notifError } = await supabaseAdmin.from("notifications").insert({
        lead_id: leadId,
        user_id: leadRow.user_id ?? null,
        channel: "email",
        template: resultValue === "self" ? "self_notify_v1" : "agency_confirm_v1",
        status: emailResult.success ? "sent" : "failed",
        sent_at: emailResult.success ? new Date().toISOString() : null,
        payload: {
          to: recipientEmail,
          serviceType: leadRow.service_type ?? null,
          error: emailResult.success ? null : emailResult.error,
        },
      });

      if (notifError) {
        console.error("agency-confirm: notifications insert error", notifError);
        // 알림 로그 실패는 치명적이지 않으므로 진행 계속
      }
    }

    // TODO(SNS 연동 예정): leadRow.kakao_id 또는 leadRow.zalo_id가 있으면
    // 여기서 카카오톡/잘로 발송 API를 호출하고, 위와 동일한 방식으로
    // notifications에 channel: "kakao" / "zalo"로 별도 기록한다.
    // 현재는 카카오톡/잘로 발송 API가 아직 연동되지 않아 이메일만 발송한다.

    return NextResponse.json({ success: emailSuccess, skipped: recipientEmail ? undefined : "no_email" });
  } catch (err) {
    console.error("agency-confirm route error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
