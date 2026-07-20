// src/app/api/ai-chat/route.ts
//
// STEP7: 로그인 고객 전용 AI Case Manager 채팅 엔드포인트.
// - access_token을 서버에서 직접 검증한다(클라이언트가 보낸 user_id를 믿지 않음).
// - leadId가 실제로 이 사용자 소유인지 재검증한다(다른 고객 데이터 접근 차단).
// - AI Context는 lib/aiCaseContext.ts의 안전 경계(전문가 내부 데이터 제외)만 사용한다.
// - 대화 저장은 STEP9 범위 — 이 라우트는 매 요청마다 클라이언트가 보낸
//   messages 배열(현재 세션 상태)을 그대로 받아 컨텍스트로만 쓰고, 저장하지 않는다.
//
// 필요 환경변수: OPENAI_API_KEY (필수), OPENAI_MODEL (필수 — 기본값 없음,
// 코드에 모델명을 하드코딩하지 않는다. 둘 중 하나라도 없으면 OpenAI를
// 호출하지 않고 고객에게 설정 확인 중이라는 안내만 보여준다.)
// 이 프로젝트에 OpenAI 연동이 전혀 없었어서(패키지도 미설치) 새 SDK를
// 추측해서 추가하지 않고, 의존성 추가 없이 fetch()로 OpenAI REST API를
// 직접 호출한다.

import { NextRequest, NextResponse } from "next/server";
import {
  verifyOwnedLead,
  buildCaseContext,
  buildSystemPrompt,
  buildGreetingPrompt,
  matchesEscalationKeyword,
  NEEDS_EXPERT_TOKEN,
} from "@/lib/aiCaseContext";

type ChatMessage = { role: "user" | "assistant"; content: string };

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 20; // 토큰 사용량/남용 방지 — 최근 대화만 컨텍스트로 전달

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      accessToken?: string;
      leadId?: string;
      messages?: ChatMessage[];
      // STEP7-2: 첫 대화 진입 시 클라이언트가 질문 없이 호출하는 모드.
      // 고객 메시지 없이도 AI가 먼저 사건을 요약해 인사하도록 한다.
      mode?: "chat" | "greeting";
    };
    const { accessToken, leadId, messages, mode } = body;
    const isGreeting = mode === "greeting";

    // ── 1. 로그인 + 소유권 검증 (다른 고객의 leadId로 접근 차단) ──
    const ownership = await verifyOwnedLead(accessToken, leadId);
    if (!ownership.ok) {
      return NextResponse.json({ error: ownership.error }, { status: ownership.status });
    }

    // ── 2. 입력값 검증 (인사말 모드는 고객 메시지가 없는 게 정상이므로 건너뜀) ──
    let lastMessage: ChatMessage | undefined;
    if (!isGreeting) {
      if (!Array.isArray(messages) || messages.length === 0) {
        return NextResponse.json({ error: "메시지가 없습니다." }, { status: 400 });
      }
      lastMessage = messages[messages.length - 1];
      if (
        !lastMessage ||
        lastMessage.role !== "user" ||
        typeof lastMessage.content !== "string" ||
        !lastMessage.content.trim()
      ) {
        return NextResponse.json({ error: "빈 질문은 보낼 수 없습니다." }, { status: 400 });
      }
      if (lastMessage.content.length > MAX_MESSAGE_LENGTH) {
        return NextResponse.json(
          { error: `질문은 ${MAX_MESSAGE_LENGTH}자 이내로 입력해주세요.` },
          { status: 400 }
        );
      }
    }

    // ── 3. 환경변수 확인 (없으면 하드코딩하지 않고 명확한 오류) ──
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("ai-chat: OPENAI_API_KEY 환경변수가 설정되지 않았습니다.");
      return NextResponse.json(
        { error: "AI 상담 기능을 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요." },
        { status: 503 }
      );
    }
    // 모델명은 코드에 하드코딩하지 않는다 — OPENAI_MODEL이 없으면 OpenAI를
    // 아예 호출하지 않고, 고객에게는 설정 확인 중이라는 안내만 보여준다.
    const model = process.env.OPENAI_MODEL;
    if (!model) {
      console.error("ai-chat: OPENAI_MODEL 환경변수가 설정되지 않았습니다.");
      return NextResponse.json(
        { error: "AI 상담 설정을 확인 중입니다." },
        { status: 503 }
      );
    }

    // ── 4. 안전 컨텍스트 구성 (전문가 내부 데이터 절대 미포함) ──
    const context = await buildCaseContext(leadId as string);
    if (!context) {
      return NextResponse.json({ error: "신청 건을 찾을 수 없습니다." }, { status: 404 });
    }
    const systemPrompt = buildSystemPrompt(context);

    // ── 5. OpenAI 호출 (최근 대화만 잘라서 전달) ──
    const openaiMessages = isGreeting
      ? [
          { role: "system", content: systemPrompt },
          { role: "user", content: buildGreetingPrompt() },
        ]
      : [
          { role: "system", content: systemPrompt },
          ...(messages as ChatMessage[]).slice(-MAX_HISTORY_MESSAGES).map((m) => ({
            role: m.role,
            content: String(m.content).slice(0, MAX_MESSAGE_LENGTH),
          })),
        ];

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: openaiMessages,
        temperature: 0.3,
        max_tokens: 600,
      }),
    });

    if (!openaiRes.ok) {
      // 응답 본문에 OpenAI 원문 오류가 담길 수 있어 고객에게는 절대 그대로
      // 노출하지 않고 서버 로그에만 남긴다.
      const errText = await openaiRes.text().catch(() => "");
      console.error("ai-chat: OpenAI API 오류", openaiRes.status, errText);
      return NextResponse.json(
        { error: "AI 상담 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." },
        { status: 502 }
      );
    }

    const data = await openaiRes.json();
    const rawReply: string = data?.choices?.[0]?.message?.content ?? "";

    if (!rawReply.trim()) {
      console.error("ai-chat: OpenAI 응답에 내용이 없습니다.", JSON.stringify(data).slice(0, 500));
      return NextResponse.json(
        { error: "AI 상담 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." },
        { status: 502 }
      );
    }

    // ── 6. 전문가 상담 필요 여부 판단 (모델 신호 + 키워드 신호, OR 조건) ──
    // 인사말 모드는 고객 질문이 없으므로 항상 false — 모델 신호만 있어도
    // buildGreetingPrompt()가 애초에 토큰을 붙이지 말라고 지시한다.
    const modelFlaggedNeedsExpert = rawReply.includes(NEEDS_EXPERT_TOKEN);
    const reply = rawReply.replace(NEEDS_EXPERT_TOKEN, "").trim();
    const needsExpert =
      !isGreeting && (modelFlaggedNeedsExpert || matchesEscalationKeyword(lastMessage!.content));

    return NextResponse.json({ reply, needsExpert });
  } catch (err) {
    // 서버 오류 내용을 그대로 고객에게 노출하지 않는다.
    console.error("ai-chat route error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
