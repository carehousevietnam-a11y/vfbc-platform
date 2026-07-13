import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendResultEmail } from "@/lib/notify/email";

// 이 파일은 서버에서만 실행됩니다. service role key는 절대 브라우저로 노출되지 않습니다.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 대행 신청이 확정되거나(agency), 직접(셀프) 진행을 선택한(self) 시점에 호출된다.
// 호출 지점 예시:
// 1) /r 결과확인 페이지의 "대행 신청하기" 버튼 → type 없음(기본값 agency), token 사용
// 2) 땀주 셀프등록의 "대신 VFBC 대행 신청하기" 업그레이드 버튼 → type: "agency", leadId 사용
// 3) TRC/WP의 관할기관 포털 링크 클릭(직접 신청 선택) → type: "self", leadId 사용
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, leadId: leadIdParam, type } = body as {
      token?: string;
      leadId?: string;
      type?: "agency" | "self";
    };

    let leadId: string | null = null;

    if (token) {
      const { data: tokenRow, error: tokenError } = await supabaseAdmin
        .from("result_tokens")
        .select("lead_id")
        .eq("token", token)
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
      console.error("agency-confirm: lead lookup failed", leadError);
      return NextResponse.json(
        { error: "리드 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 이메일이 없으면 조용히 종료 (에러 아님 — 이메일 미입력자는 정상 케이스)
    const recipientEmail = leadRow.email ? String(leadRow.email).trim() : "";
    if (!recipientEmail) {
      return NextResponse.json({ success: true, skipped: "no_email" });
    }

    const resultValue = type === "self" ? "self" : "agency";

    // 이메일 본문에 들어갈 result_token이 없어도(leadId 경로) 문제 없다 —
    // 대행/직접신청 이메일에는 버튼(링크)이 렌더링되지 않는 케이스가 있기 때문이다.
    const emailResult = await sendResultEmail({
      to: recipientEmail,
      name: leadRow.name ?? "",
      serviceType: leadRow.service_type ?? "unknown",
      result: resultValue,
      token: token ?? "",
    });

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

    return NextResponse.json({ success: emailResult.success });
  } catch (err) {
    console.error("agency-confirm route error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
