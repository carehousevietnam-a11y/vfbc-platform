// src/app/api/case-messages/route.ts
//
// STEP8/9: 로그인 고객 전용. Case Room 진입 시(및 새로고침 시) 한 번에
// - 지금까지의 대화·전문가 상담 요청/답변 이력(시간순, 다른 고객/다른
//   신청 건과 절대 섞이지 않음)
// - 헤더에 표시할 사건 요약(서비스명/현재 단계/진행률/다음 단계/담당 전문가)
// 을 함께 내려주는 조회 전용 엔드포인트. 저장은 하지 않는다(저장은
// api/ai-chat, api/case-consultation, admin 서버 액션이 담당).
//
// 안전 경계는 api/ai-chat과 완전히 동일하게 verifyOwnedLead()로 재검증한다.

import { NextRequest, NextResponse } from "next/server";
import { verifyOwnedLead, buildCaseContext } from "@/lib/aiCaseContext";
import { fetchCaseMessages } from "@/lib/caseMessages";

export async function POST(req: NextRequest) {
  try {
    const { accessToken, leadId } = (await req.json()) as {
      accessToken?: string;
      leadId?: string;
    };

    const ownership = await verifyOwnedLead(accessToken, leadId);
    if (!ownership.ok) {
      return NextResponse.json({ error: ownership.error }, { status: ownership.status });
    }

    const [context, messages] = await Promise.all([
      buildCaseContext(leadId as string),
      fetchCaseMessages(leadId as string),
    ]);

    if (!context) {
      return NextResponse.json({ error: "신청 건을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({
      messages,
      context: {
        serviceLabel: context.serviceLabel,
        currentStepLabel: context.currentStepLabel,
        nextStepLabel: context.nextStepLabel,
        progressPercent: context.progressPercent,
        expertTeamLabel: context.expertTeamLabel,
      },
    });
  } catch (err) {
    console.error("case-messages route error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
