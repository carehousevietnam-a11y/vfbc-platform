// src/app/api/ai-chat/route.ts
//
// STEP7: 로그인 고객 전용 AI Case Manager 채팅(leadId + accessToken이 있을 때).
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
// 항상 기존 AI 인사말 로직을 그대로 사용) — leadId가 필수다.
//
// STEP9-UI: /ai(로그인·leadId 없는 공개형 독립 채팅 페이지) 지원 추가.
// leadId가 없으면 "익명 모드"로 처리한다 — 이 분기는 기존 leadId 기반
// 흐름(위 STEP7~STEP9 로직)을 전혀 건드리지 않고 나란히 추가한 것이며,
// mypage/chat(Case Room)의 동작은 이전과 100% 동일하다.
//   - 소유권 검증(verifyOwnedLead) 생략 — 검증할 대상 자체가 없음.
//   - progress 질문 → DB 조회 없이 "로그인 후 마이페이지 확인" 안내(aiGateway.ANONYMOUS_PROGRESS_NOTICE)
//   - legal 질문    → buildLegalConsultNotice(null)이 기본 담당팀 라벨로 안내
//   - system/off_platform → leadId 여부와 무관하게 완전히 동일한 규칙 답변
//   - ai_analysis   → 주제 추정 시 발행 가이드 링크(TRC) 또는 구조화 가이드 + RAG 법령 보완
//   - 저장(crm_activities) 없음 — 저장은 leadId가 있을 때만 의미가 있다(사건에 귀속되는 기록이므로).
//     인사말(mode: "greeting")은 사건 정보를 전제로 하므로 익명 모드에서는 지원하지 않는다.
//
// 저장 원칙(STEP8과 동일, leadId가 있을 때만 적용): 정상적으로 만들어진
// 답변만 crm_activities에 저장한다. OpenAI 호출 실패/오류 메시지는 정상
// 답변으로 저장하지 않는다. 인사말은 저장하지 않는다.
//
// 필요 환경변수: OPENAI_API_KEY, OPENAI_MODEL — ai_analysis 카테고리와
// 인사말 모드에서만 필요하다. 기본값 없음, 코드에 모델명 하드코딩 없음.
//
// STEP21: 기존 crm_activities 저장(saveUserChatMessage/saveAssistantChatMessage)
// 옆에, 동일한 대화 내용을 case_conversations 테이블에도 추가로 기록한다
// (logCaseConversationTurn, src/lib/caseKnowledge/conversationLog.ts).
// 기존 저장 로직·응답 구조·판단 흐름은 전혀 바뀌지 않았고, 실패해도
// 채팅 응답에 영향을 주지 않는 병행 기록이다. 인사말(mode: "greeting")과
// 익명 모드는 기존 저장 원칙과 동일하게 이 로그도 남기지 않는다.

import { NextRequest, NextResponse } from "next/server";
import {
  verifyOwnedLead,
  buildCaseContext,
  buildSystemPrompt,
  buildGenericSystemPrompt,
  buildGreetingPrompt,
  matchesEscalationKeyword,
  NEEDS_EXPERT_TOKEN,
} from "@/lib/aiCaseContext";
import { saveUserChatMessage, saveAssistantChatMessage } from "@/lib/caseMessages";
import { logCaseConversationTurn } from "@/lib/caseKnowledge/conversationLog";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { reviewLegalCase, type LegalRagServiceGroup } from "@/lib/legal-rag-client";
import {
  classifyMessage,
  buildProgressAnswer,
  buildSystemAnswer,
  buildLegalConsultNotice,
  OFF_PLATFORM_NOTICE,
  ANONYMOUS_PROGRESS_NOTICE,
  callOpenAiAnalysis,
  buildNavigatorSuffix,
  buildNavigatorAction,
  inferAnonymousLegalRagContext,
} from "@/lib/aiGateway";
import { buildAnonymousFastGuide } from "@/lib/anonymousLegalGuide";
import { buildArticleChatReply } from "@/lib/anonymousArticleGuide";
import {
  getTrcArticleByIntent,
  isTrcService,
  resolveTrcArticleIntent,
} from "@/lib/contentPacks/intentRouter";
import { fetchAnonymousLegalBasisLine } from "@/lib/legalRagBasis";
import { enrichReplyWithCostData } from "@/lib/aiCostSection";
import { resolveQuoteReview, tryAffirmativeQuotePrompt } from "@/lib/aiQuoteReview";

type ChatMessage = { role: "user" | "assistant"; content: string };

// Legal RAG /review는 종종 15~25초 걸린다. Vercel 기본 10초 한도를 넘기지 않도록 연장.
export const maxDuration = 60;

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 20; // 토큰 사용량/남용 방지 — 최근 대화만 컨텍스트로 전달
const STANDARD_AI_ERROR = "AI 상담 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLegalRagServiceGroup(value: unknown): value is LegalRagServiceGroup {
  return value === "check" || value === "verify" || value === "register";
}

// [STEP21-1] void(fire-and-forget) 대신 await + try/catch로 바꿨다 — Vercel
// Serverless 함수는 응답을 반환하는 즉시(또는 직후) 실행이 종료될 수
// 있어, await하지 않은 채로 남겨둔 프로미스는 실제로 완료되기 전에
// 함수가 종료되어 저장이 누락될 위험이 있다. 이 저장은 반드시 응답을
// 만들기 전에 끝나야 한다. 단, 이 로그 저장이 실패해도 AI 응답 자체는
// 항상 기존과 동일하게 반환되어야 하므로 try/catch로 감싸 실패를
// 삼킨다(logCaseConversationTurn 내부도 이미 자체적으로 throw하지
// 않도록 방어돼 있어 이중 안전장치다).
async function safeLogCaseConversationTurn(
  leadId: string,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  try {
    await logCaseConversationTurn(leadId, role, content);
  } catch (err) {
    console.error("ai-chat: case_conversations 기록 실패", err);
  }
}

function extractLegalRagChatResult(
  data: unknown
): { ok: true; reply: string; needsExpert: boolean } | { ok: false } {
  if (!isRecord(data) || !isRecord(data.review)) return { ok: false };

  const status = data.review.status;
  const allowedStatuses = new Set(["success", "partial_evidence", "no_evidence", "insufficient_evidence"]);
  if (typeof status !== "string" || !allowedStatuses.has(status)) return { ok: false };
  if (typeof data.review.expert_review_required !== "boolean") return { ok: false };

  let customerSummary: unknown;
  if (isRecord(data.customer) && isRecord(data.customer.review)) {
    customerSummary = data.customer.review.ai_summary;
  }

  const replyCandidate =
    typeof customerSummary === "string" && customerSummary.trim()
      ? customerSummary.trim()
      : typeof data.review.summary === "string" && data.review.summary.trim()
        ? data.review.summary.trim()
        : null;

  if (!replyCandidate) return { ok: false };

  const needsExpert =
    status === "no_evidence" ||
    status === "insufficient_evidence" ||
    status === "partial_evidence" ||
    data.review.expert_review_required === true;

  return {
    ok: true,
    reply: replyCandidate,
    needsExpert,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      accessToken?: string;
      leadId?: string;
      messages?: ChatMessage[];
      // STEP7-2: 첫 대화 진입 시 클라이언트가 질문 없이 호출하는 모드.
      // 고객 메시지 없이도 AI가 먼저 사건을 요약해 인사하도록 한다.
      // leadId가 있는 Case Room 전용 — 익명 모드에서는 지원하지 않는다.
      mode?: "chat" | "greeting";
      language?: string;
    };
    const { accessToken, leadId, messages, mode, language } = body;
    const isGreeting = mode === "greeting";
    // STEP9-UI: leadId가 없으면 익명(공개) 문의로 취급한다. accessToken만
    // 오고 leadId가 없는 경우도 동일하게 익명 처리(사건에 귀속시킬 수 없음).
    const isAnonymous = !leadId;
    let userTurnPersisted = false;

    if (isAnonymous && isGreeting) {
      return NextResponse.json(
        { error: "leadId가 필요합니다." },
        { status: 400 }
      );
    }

    // ── 1. 로그인 + 소유권 검증 (leadId가 있을 때만 — 다른 고객 데이터 접근 차단) ──
    if (!isAnonymous) {
      const ownership = await verifyOwnedLead(accessToken, leadId);
      if (!ownership.ok) {
        return NextResponse.json({ error: ownership.error }, { status: ownership.status });
      }
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
      const affirmative = tryAffirmativeQuotePrompt(
        messages as ChatMessage[],
        lastMessage!.content
      );
      if (affirmative) {
        return NextResponse.json({
          reply: affirmative.reply,
          needsExpert: false,
          category: "ai_analysis",
          actions: [],
        });
      }

      const quoteResolved = resolveQuoteReview(
        messages as ChatMessage[],
        lastMessage!.content
      );
      if (quoteResolved) {
        return NextResponse.json({
          reply: quoteResolved.reply,
          quoteReview: quoteResolved.quoteReview,
          needsExpert: false,
          category: "quote_review",
          actions: [],
        });
      }

      const category = classifyMessage(lastMessage!.content);

      if (category !== "ai_analysis") {
        // 저장은 leadId가 있을 때만 한다 — 익명 문의는 특정 사건에 귀속시킬
        // 수 없으므로 crm_activities에 남기지 않는다.
        if (!isAnonymous) {
          const savedUser = await saveUserChatMessage(leadId as string, lastMessage!.content);
          if (!savedUser) {
            console.error("ai-chat: 고객 질문 저장 실패 (leadId=" + leadId + ")");
          }
          // STEP21: case_conversations에도 추가로 기록(기존 저장과 병행,
          // 실패해도 채팅 응답에 영향 없음).
          await safeLogCaseConversationTurn(leadId as string, "user", lastMessage!.content);
        }

        let reply: string;
        let needsExpert = false;

        if (category === "progress") {
          if (isAnonymous) {
            reply = ANONYMOUS_PROGRESS_NOTICE;
          } else {
            const context = await buildCaseContext(leadId as string);
            if (!context) {
              return NextResponse.json({ error: "신청 건을 찾을 수 없습니다." }, { status: 404 });
            }
            reply = buildProgressAnswer(context);
          }
        } else if (category === "legal") {
          const context = isAnonymous ? null : await buildCaseContext(leadId as string);
          reply = buildLegalConsultNotice(context);
          needsExpert = true;
        } else if (category === "system") {
          reply = buildSystemAnswer(lastMessage!.content);
        } else {
          // off_platform
          reply = OFF_PLATFORM_NOTICE;
        }

        reply = enrichReplyWithCostData(reply, lastMessage!.content);
        // STEP10-1: AI Service Navigator — 분류 로직은 그대로 두고, 답변
        // 마지막에 관련 서비스 이동 안내만 덧붙인다.
        // STEP10-2: 프론트가 본문 문자열을 다시 파싱하지 않도록, 같은
        // 판단 결과를 구조화된 actions 배열로도 함께 내려준다.
        reply = reply + buildNavigatorSuffix(category, lastMessage!.content);
        const action = buildNavigatorAction(category, lastMessage!.content);
        const actions = action ? [action] : [];

        if (!isAnonymous) {
          const savedReply = await saveAssistantChatMessage(leadId as string, reply, needsExpert);
          if (!savedReply) {
            console.error(
              "ai-chat: 답변 저장 실패 (leadId=" + leadId + ", category=" + category + ")"
            );
          }
          await safeLogCaseConversationTurn(leadId as string, "assistant", reply);
        }

        return NextResponse.json({ reply, needsExpert, category, actions });
      }
      // STEP19: check/verify/register lead → Legal RAG. 실패 시 OpenAI로 fallback.
      if (!isAnonymous) {
        const caseContext = await buildCaseContext(leadId as string);
        if (!caseContext) {
          return NextResponse.json({ error: "신청 건을 찾을 수 없습니다." }, { status: 404 });
        }

        if (isLegalRagServiceGroup(caseContext.category)) {
          const { data: leadRow, error: leadError } = await supabaseAdmin
            .from("leads")
            .select("service_type")
            .eq("id", leadId as string)
            .maybeSingle();

          const serviceType =
            !leadError && typeof leadRow?.service_type === "string"
              ? leadRow.service_type.trim()
              : "";

          if (!serviceType) {
            console.error("ai-chat: Legal RAG service_type lookup failed");
            return NextResponse.json({ error: STANDARD_AI_ERROR }, { status: 500 });
          }

          const savedUser = await saveUserChatMessage(leadId as string, lastMessage!.content);
          if (!savedUser) {
            console.error("ai-chat: 고객 질문 저장 실패 (Legal RAG)");
          }
          await safeLogCaseConversationTurn(leadId as string, "user", lastMessage!.content);
          userTurnPersisted = true;

          const legalRagResult = await reviewLegalCase({
            question: lastMessage!.content.trim(),
            language: typeof language === "string" && language.trim() ? language.trim() : "ko",
            audience: "all",
            context: {
              lead_id: leadId as string,
              service_type: serviceType,
              service_group: caseContext.category,
            },
          });

          if (!legalRagResult.ok) {
            console.error("ai-chat: Legal RAG request failed, falling back to OpenAI", {
              status: legalRagResult.status,
            });
            // Fall through to generic OpenAI path below (same as anonymous ai_analysis).
          } else {
            const mapped = extractLegalRagChatResult(legalRagResult.data);
            if (!mapped.ok) {
              console.error("ai-chat: Legal RAG response schema/status rejected, falling back");
            } else {
              const reply =
                enrichReplyWithCostData(mapped.reply, lastMessage!.content) +
                buildNavigatorSuffix("ai_analysis", lastMessage!.content);
              const action = buildNavigatorAction("ai_analysis", lastMessage!.content);
              const actions = action ? [action] : [];

              const savedReply = await saveAssistantChatMessage(
                leadId as string,
                reply,
                mapped.needsExpert
              );
              if (!savedReply) {
                console.error("ai-chat: Legal RAG 답변 저장 실패");
              }
              await safeLogCaseConversationTurn(leadId as string, "assistant", reply);

              return NextResponse.json({
                reply,
                needsExpert: mapped.needsExpert,
                category: "ai_analysis",
                actions,
              });
            }
          }
        }
      }

      // 익명 /ai: CHECK·VERIFY·REGISTER 주제 추정 시 발행 가이드(TRC) 또는 하이브리드 가이드.
      if (isAnonymous) {
        const inferred = inferAnonymousLegalRagContext(lastMessage!.content);
        if (inferred) {
          if (isTrcService(inferred.service_type)) {
            const intentId = resolveTrcArticleIntent(lastMessage!.content);
            const article = getTrcArticleByIntent(intentId);
            const legalBasisLine = await fetchAnonymousLegalBasisLine(
              lastMessage!.content,
              inferred
            );
            const { reply, actions } = buildArticleChatReply(lastMessage!.content, article, {
              legalBasisLine,
            });
            const enrichedReply = enrichReplyWithCostData(reply, lastMessage!.content);

            return NextResponse.json({
              reply: enrichedReply,
              needsExpert: true,
              category: "ai_analysis",
              actions,
            });
          }

          const legalBasisLine = await fetchAnonymousLegalBasisLine(lastMessage!.content, inferred);
          const reply =
            enrichReplyWithCostData(
              buildAnonymousFastGuide(inferred, { legalBasisLine }),
              lastMessage!.content
            ) + buildNavigatorSuffix("ai_analysis", lastMessage!.content);
          const action = buildNavigatorAction("ai_analysis", lastMessage!.content);
          const actions = action ? [action] : [];

          return NextResponse.json({
            reply,
            needsExpert: true,
            category: "ai_analysis",
            actions,
          });
        }
      }
      // 익명 ai_analysis(주제 미추정) 및 consultation/unclassified 사건은 OpenAI 흐름.
    }

    // ── 4. 환경변수 확인 (기존 OpenAI 대상 ai_analysis·인사말 경로) ──
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

    // ── 4-1. 고객 질문 저장 (ai_analysis 채팅 모드 + leadId가 있을 때만) ──
    // 여기 도달했다는 것은 apiKey/model이 모두 있어 OpenAI를 실제로 호출할
    // 것이라는 뜻 — "API Key가 없을 때는 고객 질문을 무조건 저장하지 않아도
    // 된다"는 원칙에 맞춰, 호출 직전 시점에 저장한다. 저장 실패는 채팅
    // 자체를 막지 않는다(로그만 남김). 익명 모드는 애초에 저장하지 않는다.
    if (!isGreeting && !isAnonymous && !userTurnPersisted) {
      const saved = await saveUserChatMessage(leadId as string, lastMessage!.content);
      if (!saved) {
        console.error("ai-chat: 고객 질문 저장 실패 (leadId=" + leadId + ")");
      }
      await safeLogCaseConversationTurn(leadId as string, "user", lastMessage!.content);
    }

    // ── 5. 시스템 프롬프트 구성 ──
    // leadId가 있으면 기존과 동일하게 [고객 사건 정보]가 포함된 프롬프트를
    // 쓰고, 없으면(익명) 사건 데이터가 전혀 없는 일반 안내용 프롬프트를 쓴다.
    let systemPrompt: string;
    if (isAnonymous) {
      systemPrompt = buildGenericSystemPrompt();
    } else {
      const context = await buildCaseContext(leadId as string);
      if (!context) {
        return NextResponse.json({ error: "신청 건을 찾을 수 없습니다." }, { status: 404 });
      }
      systemPrompt = buildSystemPrompt(context);
    }

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
    let reply = rawReply.replace(NEEDS_EXPERT_TOKEN, "").trim();
    if (!isGreeting && lastMessage) {
      reply = enrichReplyWithCostData(reply, lastMessage.content);
    }
    const needsExpert =
      !isGreeting && (modelFlaggedNeedsExpert || matchesEscalationKeyword(lastMessage!.content));

    // STEP10-1: AI Service Navigator — 인사말에는 붙이지 않는다(사건 정보
    // 없이 먼저 건네는 안내이므로 특정 서비스로 유도할 근거가 없음).
    // STEP10-2: 구조화된 actions 배열도 함께 내려준다.
    let actions: { label: string; href: string }[] = [];
    if (!isGreeting) {
      reply = reply + buildNavigatorSuffix("ai_analysis", lastMessage!.content);
      const action = buildNavigatorAction("ai_analysis", lastMessage!.content);
      actions = action ? [action] : [];
    }

    // ── 8. 정상 AI 답변 저장 (채팅 모드 + leadId가 있을 때만 — 인사말/익명은 저장하지 않음) ──
    if (!isGreeting && !isAnonymous) {
      const savedReply = await saveAssistantChatMessage(leadId as string, reply, needsExpert);
      if (!savedReply) {
        console.error("ai-chat: AI 답변 저장 실패 (leadId=" + leadId + ")");
      }
      await safeLogCaseConversationTurn(leadId as string, "assistant", reply);
    }

    return NextResponse.json({
      reply,
      needsExpert,
      category: isGreeting ? undefined : "ai_analysis",
      actions,
    });
  } catch (err) {
    // 서버 오류 내용을 그대로 고객에게 노출하지 않는다.
    console.error("ai-chat route error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
