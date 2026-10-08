import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  shouldGateVerifyExpertPageAiReportPdfFromActivities,
  VERIFY_ADMIN_EXPERT_PHASE2_PDF_GATE_ERROR_MESSAGE,
} from "@/lib/adminVerifyMypageFields";
import { buildMypagePdfDocumentFromLeadAndActivities } from "@/lib/mypagePdfExecutiveRender";

// 서버 전용. service role key는 브라우저에 노출되지 않습니다.
// PDF 본문·레이아웃 렌더는 mypagePdfExecutiveRender.ts (POST와 QA fixture harness 공용).

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  try {
    const { accessToken, leadId } = (await req.json()) as { accessToken?: string; leadId?: string };
    if (!accessToken || !leadId) {
      return NextResponse.json({ error: "요청 정보가 올바르지 않습니다." }, { status: 400 });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "로그인이 만료되었습니다. 다시 로그인해주세요." }, { status: 401 });
    }
    const userId = userData.user.id;

    const { data: lead, error: leadError } = await supabaseAdmin
      .from("leads")
      .select("id, service_type, result, created_at, user_id")
      .eq("id", leadId)
      .eq("user_id", userId)
      .maybeSingle();

    if (leadError || !lead) {
      return NextResponse.json({ error: "해당 신청 내역을 찾을 수 없습니다." }, { status: 404 });
    }

    const { data: activitiesRaw } = await supabaseAdmin
      .from("crm_activities")
      .select("action, meta, created_at")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: true });
    const activities = activitiesRaw ?? [];

    if (shouldGateVerifyExpertPageAiReportPdfFromActivities(lead.service_type, activities)) {
      return NextResponse.json(
        { error: VERIFY_ADMIN_EXPERT_PHASE2_PDF_GATE_ERROR_MESSAGE },
        { status: 403 },
      );
    }

    const pdfBytes = await buildMypagePdfDocumentFromLeadAndActivities(
      { id: leadId, service_type: lead.service_type, result: lead.result, created_at: lead.created_at },
      activities,
      leadId,
    );

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="vfbcai-report-${leadId.slice(0, 8)}.pdf"`,
      },
    });
  } catch (err) {
    console.error("mypage-pdf route error:", err);
    return NextResponse.json({ error: "PDF 생성 중 문제가 발생했습니다." }, { status: 500 });
  }
}
