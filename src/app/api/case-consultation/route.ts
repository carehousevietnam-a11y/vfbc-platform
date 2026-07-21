// src/app/api/case-consultation/route.ts
//
// STEP8: 고객이 Case Room에서 "전문가 상담 요청"을 제출할 때 저장하는
// 엔드포인트. OpenAI 연결 여부와 완전히 독립적으로 항상 동작해야 한다
// (OPENAI_API_KEY가 없어도 전문가 상담 요청 흐름은 정상 작동).
//
// 보안: api/ai-chat과 동일하게 accessToken 서버 검증 + leadId 소유권
// 재검증(verifyOwnedLead) — 다른 고객의 leadId로 요청을 남기는 것을 차단.

import { NextRequest, NextResponse } from "next/server";
import { verifyOwnedLead } from "@/lib/aiCaseContext";
import { saveConsultationRequest } from "@/lib/caseMessages";

const MAX_CONTENT_LENGTH = 2000;

export async function POST(req: NextRequest) {
  try {
    const { accessToken, leadId, content } = (await req.json()) as {
      accessToken?: string;
      leadId?: string;
      content?: string;
    };

    const ownership = await verifyOwnedLead(accessToken, leadId);
    if (!ownership.ok) {
      return NextResponse.json({ error: ownership.error }, { status: ownership.status });
    }

    const trimmed = typeof content === "string" ? content.trim() : "";
    if (!trimmed) {
      return NextResponse.json({ error: "문의 내용을 입력해주세요." }, { status: 400 });
    }
    if (trimmed.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `문의 내용은 ${MAX_CONTENT_LENGTH}자 이내로 입력해주세요.` },
        { status: 400 }
      );
    }

    const saved = await saveConsultationRequest(leadId as string, trimmed);
    if (!saved) {
      return NextResponse.json(
        { error: "상담 요청 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: {
        id: saved.id,
        type: "consultation_request",
        content: trimmed,
        createdAt: saved.createdAt,
        status: "pending",
      },
    });
  } catch (err) {
    console.error("case-consultation route error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
