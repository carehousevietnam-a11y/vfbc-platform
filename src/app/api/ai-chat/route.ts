// src/app/api/ai-chat/route.ts
//
// STEP7: 로그인 고객 전용 AI Case Manager 채팅 엔드포인트.
// - access_token을 서버에서 직접 검증한다(클라이언트가 보낸 user_id를 믿지 않음).
// - leadId가 실제로 이 사용자 소유인지 재검증한다(다른 고객 데이터 접근 차단).
// - AI Context는 lib/aiCaseContext.ts의 안전 경계(전문가 내부 데이터 제외)만 사용한다.
//
// STEP9: AI Gateway(Classifier) 도입. 채팅 모드(mode: "chat")의 고객 질문은
// OpenAI를 부르기 전에 lib/aiGateway.ts의 classifyMessage()로 먼저 분류한다.
//   - progress(진행상황)      → buildCaseContext()의 DB 조회 결과만으로 답변
//   - system(시스템 기능)     → 규칙 기반 답변
//   - legal(법률 판단)        → OpenAI를 부르지 않고 즉시 전문가 상담 연결 안내
//   - off_platform(플랫폼 외) → 고정 안내문
//   - ai_analysis(그 외 전부) → 기존과 동일하게 OpenAI 호출(callOpenAiAnalysis로 분리)
// 위 4가지(progress/system/legal/off_platform)는 OpenAI를 전혀 호출하지
// 않으므로 OPENAI_API_KEY/OPENAI_MODEL이 아직 없어도(Ace 결제 전) 정상
// 작동한다 — env 체크는 ai_analysis(및 인사말) 경로에서만 수행한다.
// 인사말 모드(mode: "greeting")는 분류 대상이 아니다(고객 질문이 없으므로
// 항상 기존 AI 인사말 로직을 그대로 사용).
//
// 저장 원칙(STEP8과 동일): 정상적으로 만들어진 답변만 crm_activities에
// 저장한다. OpenAI 호출 실패/오류 메시지는 정상 답변으로 저장하지 않는다.
// 인사말은 저장하지 않는다(매 진입마다 최신 상태로 다시 생성).
//
// 필요 환경변수: OPENAI_API_KEY, OPENAI_MODEL — ai_analysis 카테고리와
// 인사말 모드에서만 필요하다. 기본값 없음, 코드에 모델명 하드코딩 없음.

import { NextRequest, NextResponse } from "next/server";
import {
  verifyOwnedLead,
  buildCaseContext,
  buildSystemPrompt,
  buildGreetingPrompt,
  matchesEscalationKeyword,
  NEEDS_EXPERT_TOKEN,
} from "@/lib/aiCaseContext";
import { saveUserChatMessage, saveAssistantChatMessage } from "@/lib/caseMessages";
import {
  classifyMessage,
  buildProgressAnswer,
  buildSystemAnswer,
  buildLegalConsultNotice,
  OFF_PLATFORM_NOTICE,
  callOpenAiAnalysis,
} from "@/lib/aiGateway";

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

    // ── 3. AI Gateway(Classifier): 채팅 모드에서만 분류한다 ──
    // ai_analysis가 아니면 OpenAI를 전혀 호출하지 않고 여기서 바로 응답한다.
    if (!isGreeting) {
      const category = classifyMessage(lastMessage!.content);

      if (category !== "ai_analysis") {
        // OpenAI 호출 여부와 무관하게 항상 저장한다(진행상황/시스템 기능/
        // 법률 판단/플랫폼 외 질문은 OPENAI_API_KEY가 없어도 정상 동작해야
        // 하므로, 이 경로의 저장은 env 체크에 의존하지 않는다).
        const savedUser = await saveUserChatMessage(leadId as string, lastMessage!.content);
        if (!savedUser) {
          console.error("ai-chat: 고객 질문 저장 실패 (leadId=" + leadId + ")");
        }

        let reply: string;
        let needsExpert = false;

        if (category === "progress") {
          const context = await buildCaseContext(leadId as string);
          if (!context) {
            return NextResponse.json({ error: "신청 건을 찾을 수 없습니다." }, { status: 404 });
          }
          reply = buildProgressAnswer(context);
        } else if (category === "legal") {
          const context = await buildCaseContext(leadId as string);
          reply = buildLegalConsultNotice(context);
          needsExpert = true;
        } else if (category === "system") {
          reply = buildSystemAnswer(lastMessage!.content);
        } else {
          // off_platform
          reply = OFF_PLATFORM_NOTICE;
        }

        const savedReply = await saveAssistantChatMessage(leadId as string, reply, needsExpert);
        if (!savedReply) {
          console.error("ai-chat: 답변 저장 실패 (leadId=" + leadId + ", category=" + category + ")");
        }

        return NextResponse.json({ reply, needsExpert, category });
      }
      // category === "ai_analysis" → 아래 기존 OpenAI 흐름으로 이어진다.
    }

    // ── 4. 환경변수 확인 (ai_analysis·인사말 경로에서만 필요) ──
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

    // ── 4-1. 고객 질문 저장 (ai_analysis 채팅 모드만, 인사말은 저장하지 않음) ──
    // 여기 도달했다는 것은 apiKey/model이 모두 있어 OpenAI를 실제로 호출할
    // 것이라는 뜻 — "API Key가 없을 때는 고객 질문을 무조건 저장하지 않아도
    // 된다"는 원칙에 맞춰, 호출 직전 시점에 저장한다. 저장 실패는 채팅
    // 자체를 막지 않는다(로그만 남김).
    if (!isGreeting) {
      const saved = await saveUserChatMessage(leadId as string, lastMessage!.content);
      if (!saved) {
        console.error("ai-chat: 고객 질문 저장 실패 (leadId=" + leadId + ")");
      }
    }

    // ── 5. 안전 컨텍스트 구성 (전문가 내부 데이터 절대 미포함) ──
    const context = await buildCaseContext(leadId as string);
    if (!context) {
      return NextResponse.json({ error: "신청 건을 찾을 수 없습니다." }, { status: 404 });
    }
    const systemPrompt = buildSystemPrompt(context);

    // ── 6. OpenAI 호출 (최근 대화만 잘라서 전달) — 함수 분리(lib/aiGateway.ts) ──
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

    const result = await callOpenAiAnalysis({ apiKey, model, openaiMessages });
    if (!result.ok) {
      return NextResponse.json(
        { error: "AI 상담 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." },
        { status: result.status }
      );
    }
    const rawReply = result.rawReply;

    // ── 7. 전문가 상담 필요 여부 판단 (모델 신호 + 키워드 신호, OR 조건) ──
    // legal 카테고리는 이미 3단계에서 걸러지므로 여기 도달하는 것은
    // ai_analysis로 분류된 질문뿐이지만, 모델이 대화 맥락상 뒤늦게 법률
    // 판단이 필요하다고 스스로 판단하는 경우를 위해 이 이중 안전장치는
    // 그대로 유지한다.
    const modelFlaggedNeedsExpert = rawReply.includes(NEEDS_EXPERT_TOKEN);
    const reply = rawReply.replace(NEEDS_EXPERT_TOKEN, "").trim();
    const needsExpert =
      !isGreeting && (modelFlaggedNeedsExpert || matchesEscalationKeyword(lastMessage!.content));

    // ── 8. 정상 AI 답변 저장 (채팅 모드만 — 인사말은 저장하지 않음) ──
    if (!isGreeting) {
      const savedReply = await saveAssistantChatMessage(leadId as string, reply, needsExpert);
      if (!savedReply) {
        console.error("ai-chat: AI 답변 저장 실패 (leadId=" + leadId + ")");
      }
    }

    return NextResponse.json({ reply, needsExpert, category: isGreeting ? undefined : "ai_analysis" });
  } catch (err) {
    // 서버 오류 내용을 그대로 고객에게 노출하지 않는다.
    console.error("ai-chat route error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
