"use client";

// src/app/mypage/chat/page.tsx
//
// STEP7: 로그인 고객 전용 AI Case Manager 채팅 화면.
// - 로그인은 mypage/page.tsx와 동일하게 /r 결과확인 페이지에서 생긴 기존
//   Supabase Auth 세션을 그대로 쓴다(이 화면만의 별도 로그인 없음).
// - 신청 건은 "특정 카드에서 AI 상담 진입 시 해당 lead 자동 선택" 방식을
//   쓴다 — mypage/page.tsx의 LeadCard에서 ?leadId=로 넘어온다.
// - 대화는 이번 단계에서 세션 상태로만 유지된다(새로고침 시 사라짐 — 의도된
//   동작, STEP9에서 저장 기능이 붙는다). 저장되는 것처럼 보이는 문구를 쓰지 않는다.
//
// ⚠️ 절대 금지 경계: expertBrief / checkedItems / rejectionRisks /
// recommendedSteps / similarCases 등은 /api/ai-chat도, 이 화면도 다루지 않는다.

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Loader2, AlertTriangle, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";

type ChatRole = "user" | "assistant";
type ChatMessage = {
  // STEP9에서 저장 기능을 붙이기 쉽도록 role/content/createdAt/leadId 구조를
  // 미리 맞춰둔다. conversationId는 아직 대응하는 DB 구조가 없어 만들지 않는다.
  role: ChatRole;
  content: string;
  createdAt: string;
  leadId: string;
  needsExpert?: boolean;
};

const QUICK_QUESTIONS = [
  "지금 어디까지 진행됐나요?",
  "제가 준비할 서류가 있나요?",
  "정부 제출이 되었나요?",
  "예상 소요시간이 궁금합니다.",
  "전문가와 상담하고 싶습니다.",
];

const WELCOME_TEXT =
  "안녕하세요.\n고객님의 신청 진행 상황을 바탕으로 24시간 안내해드립니다.\n법률 판단이나 전문가 확인이 필요한 문의는 담당자 상담으로 연결됩니다.";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

type LoadState = "checking" | "signed-out" | "ready" | "not-found";

function ChatContent() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get("leadId");
  const serviceLabelParam = searchParams.get("label"); // mypage 카드에서 넘겨주는 표시용 라벨(선택)

  const [state, setState] = useState<LoadState>("checking");
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const sendingRef = useRef(false); // 과도한 중복 전송 방지(연타 클릭 대비 이중 안전장치)

  const [expertPanelOpen, setExpertPanelOpen] = useState(false);
  const [expertInquiry, setExpertInquiry] = useState("");
  const [expertSubmitted, setExpertSubmitted] = useState(false);

  // STEP7-2: 첫 대화 진입 시 AI가 사건을 분석해 먼저 안내하는 동적 인사말.
  // 실패하면(OpenAI 오류·설정 미비 등) 기존 고정 문구(WELCOME_TEXT)로
  // 자연스럽게 대체한다 — 고객에게 원문 오류를 노출하지 않는다.
  const [greetingState, setGreetingState] = useState<"loading" | "ready" | "error">("loading");
  const [greetingText, setGreetingText] = useState<string | null>(null);
  const greetingTriggeredRef = useRef(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      if (!leadId) {
        setState("not-found");
        return;
      }
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setState("signed-out");
        return;
      }
      setAccessToken(token);
      setState("ready");
    })();
  }, [leadId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    if (state !== "ready" || !leadId || !accessToken || greetingTriggeredRef.current) return;
    greetingTriggeredRef.current = true;

    (async () => {
      try {
        const res = await fetch("/api/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken, leadId, mode: "greeting" }),
        });
        const data = await res.json();
        if (!res.ok || typeof data?.reply !== "string" || !data.reply.trim()) {
          setGreetingState("error");
          return;
        }
        setGreetingText(data.reply);
        setGreetingState("ready");
      } catch (err) {
        console.error("ai greeting fetch failed:", err);
        setGreetingState("error");
      }
    })();
  }, [state, leadId, accessToken]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sendingRef.current || !leadId || !accessToken) return;

    sendingRef.current = true;
    setSending(true);
    setSendError(null);

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
      leadId,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken,
          leadId,
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setSendError(data?.error ?? "메시지를 보내지 못했습니다. 다시 시도해주세요.");
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply as string,
          createdAt: new Date().toISOString(),
          leadId,
          needsExpert: Boolean(data.needsExpert),
        },
      ]);
    } catch (err) {
      console.error("ai-chat request failed:", err);
      setSendError("서버와 통신 중 문제가 발생했습니다. 다시 시도해주세요.");
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }

  // 실패한 마지막 사용자 메시지 재시도 — 새 메시지를 추가하지 않고 동일 내용으로 재요청
  function retryLast() {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) {
      setMessages((prev) => prev.filter((m) => m !== lastUser));
      sendMessage(lastUser.content);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleExpertSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!expertInquiry.trim()) return;
    // STEP7 범위: 실제 저장/담당자 알림은 STEP8에서 연결된다. 저장된 것처럼
    // 보이는 문구를 쓰지 않고, 준비 중이라는 사실을 정직하게 안내한다.
    setExpertSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#fafafa] flex flex-col">
      <div className="h-[3px] bg-blue-900 shrink-0" />

      {/* 상단 헤더 */}
      <div className="shrink-0 border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-xl">
          <Link
            href="/mypage"
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft size={14} /> 마이페이지로
          </Link>
          <div className="mt-1 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                VFBCAI · AI Case Manager
              </p>
              <h1 className="mt-0.5 text-lg font-bold text-gray-900">
                24시간 AI 상담{serviceLabelParam ? ` · ${serviceLabelParam}` : ""}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {state === "checking" && (
        <div className="mx-auto max-w-xl w-full px-6 py-10">
          <p className="text-sm text-gray-500">확인 중...</p>
        </div>
      )}

      {state === "not-found" && (
        <div className="mx-auto max-w-xl w-full px-6 py-10">
          <div className="rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-sm text-gray-600">상담할 신청 건을 찾을 수 없습니다.</p>
            <Link
              href="/mypage"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-950 transition-colors"
            >
              마이페이지에서 신청 건 선택하기
            </Link>
          </div>
        </div>
      )}

      {state === "signed-out" && (
        <div className="mx-auto max-w-xl w-full px-6 py-10">
          <div className="rounded-3xl bg-white border border-amber-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-sm font-bold text-gray-900">로그인이 필요합니다</p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              마이페이지에서 &quot;결과 확인&quot; 링크로 접속하신 뒤 다시 시도해주세요.
            </p>
          </div>
        </div>
      )}

      {state === "ready" && leadId && (
        <>
          {/* 메시지 영역 */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            <div className="mx-auto max-w-xl space-y-3">
              {/* STEP7-2: AI가 사건을 먼저 분석해 안내하는 동적 인사말.
                  로딩 중에는 짧은 안내, 실패 시에는 기존 고정 문구로 폴백. */}
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white border border-gray-100 px-4 py-3 text-sm text-gray-700 leading-relaxed whitespace-pre-line shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  {greetingState === "loading" && "안녕하세요. 신청 정보를 확인하고 있습니다..."}
                  {greetingState === "ready" && greetingText}
                  {greetingState === "error" && WELCOME_TEXT}
                </div>
              </div>

              {/* 빠른 질문 버튼 — 인사말 로딩 여부와 무관하게, 고객이 아직
                  질문을 하지 않았을 때만 노출 */}
              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      disabled={sending}
                      className="rounded-full border border-blue-900/20 bg-white px-3 py-1.5 text-xs font-medium text-blue-900 hover:bg-blue-50 disabled:opacity-50 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed whitespace-pre-line shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${
                      m.role === "user"
                        ? "rounded-2xl rounded-tr-sm bg-blue-900 text-white"
                        : "rounded-2xl rounded-tl-sm bg-white border border-gray-100 text-gray-800"
                    }`}
                  >
                    {m.content}
                    <p
                      className={`mt-1 text-[10px] ${
                        m.role === "user" ? "text-blue-200" : "text-gray-400"
                      }`}
                    >
                      {formatTime(m.createdAt)}
                    </p>
                    {m.role === "assistant" && m.needsExpert && (
                      <button
                        onClick={() => setExpertPanelOpen(true)}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-200 transition-colors"
                      >
                        <MessageSquare size={12} /> 전문가 상담 요청
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-tl-sm bg-white border border-gray-100 px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <Loader2 size={16} className="animate-spin text-blue-900" />
                  </div>
                </div>
              )}

              {sendError && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-700">
                    <p>{sendError}</p>
                    <button
                      onClick={retryLast}
                      className="mt-2 inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-red-700 transition-colors"
                    >
                      다시 시도
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 전문가 상담 요청 패널 */}
          {expertPanelOpen && (
            <div className="shrink-0 border-t border-amber-100 bg-amber-50 px-4 py-4 sm:px-6">
              <div className="mx-auto max-w-xl">
                {!expertSubmitted ? (
                  <form onSubmit={handleExpertSubmit}>
                    <p className="text-xs font-semibold text-amber-900">전문가 상담 요청</p>
                    <p className="mt-1 text-[11px] text-amber-800">
                      문의 내용을 남겨주시면 담당자가 확인 후 안내드립니다.
                    </p>
                    <textarea
                      value={expertInquiry}
                      onChange={(e) => setExpertInquiry(e.target.value)}
                      rows={3}
                      placeholder="문의하실 내용을 입력해주세요"
                      className="mt-2 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-amber-400"
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={!expertInquiry.trim()}
                        className="rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
                      >
                        문의 남기기
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpertPanelOpen(false)}
                        className="rounded-full px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-amber-100 transition-colors"
                      >
                        닫기
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-amber-900">문의 내용을 확인했습니다.</p>
                    <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                      담당자 연결·저장 기능은 다음 업데이트에서 연동됩니다. 급하신 문의는
                      마이페이지 상단의 담당 전문가 안내를 참고해주세요.
                    </p>
                    <button
                      onClick={() => {
                        setExpertPanelOpen(false);
                        setExpertSubmitted(false);
                        setExpertInquiry("");
                      }}
                      className="mt-2 rounded-full px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
                    >
                      닫기
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 입력창 + 하단 안내 */}
          <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-3 sm:px-6">
            <div className="mx-auto max-w-xl">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="궁금하신 내용을 입력해주세요"
                  disabled={sending}
                  className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-900 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-900 text-white hover:bg-blue-950 disabled:opacity-40 transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>

              <div className="mt-2 flex items-center justify-between gap-2">
                <button
                  onClick={() => setExpertPanelOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:underline"
                >
                  <MessageSquare size={12} /> 전문가 상담 요청
                </button>
                <p className="flex items-center gap-1 text-[10px] text-gray-400">
                  <AlertTriangle size={11} /> AI 안내는 참고용이며 중요한 판단은 전문가 확인이 필요합니다.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

export default function AiChatPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#fafafa]">
          <div className="h-[3px] bg-blue-900" />
          <div className="mx-auto max-w-xl px-6 py-10">
            <p className="text-sm text-gray-500">불러오는 중...</p>
          </div>
        </main>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
