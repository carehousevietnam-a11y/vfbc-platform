"use client";

// src/app/mypage/chat/page.tsx
//
// STEP8/9: 로그인 고객 전용 Case Room 화면 (AI Case Manager + 전문가 상담
// 통합). STEP7의 세션 전용 채팅 UI를 다음처럼 확장했다:
// - 진입/새로고침 시 /api/case-messages로 기존 대화·전문가 상담 이력을
//   전부 불러온다(다른 신청 건과 섞이지 않음 — leadId 기준 서버 필터).
// - 이미 AI 대화가 있으면 동적 인사말(mode: "greeting")을 다시 부르지
//   않는다(중복 저장 방지 이전에, 애초에 인사말 자체를 다시 보여줄 필요가
//   없다 — 기존 히스토리를 그대로 이어서 보여준다).
// - 전문가 상담 요청은 이제 실제로 저장된다(/api/case-consultation) —
//   새로고침해도 유지되고, OpenAI 연결 여부와 무관하게 항상 작동한다.
// - 헤더에 서비스/현재 단계/진행률/다음 단계/담당 전문가/AI 연결 상태를
//   함께 보여준다(/api/case-messages가 함께 내려주는 context).
//
// ⚠️ 절대 금지 경계: expertBrief / checkedItems / rejectionRisks /
// recommendedSteps / similarCases 등은 이 화면 어디에서도 다루지 않는다.

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Loader2,
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  Circle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { CaseMessage } from "@/lib/caseMessages";

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
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ko-KR");
}

type LoadState = "checking" | "signed-out" | "ready" | "not-found";

type CaseContextSummary = {
  serviceLabel: string;
  currentStepLabel: string;
  nextStepLabel: string;
  progressPercent: number;
  expertTeamLabel: string;
};

type AiStatus = "checking" | "connected" | "unavailable";

// 클라이언트에서 낙관적으로 붙이는 임시 항목 구분용 — 새로고침하면 서버가
// 내려주는 실제 id로 교체된다(다시 /api/case-messages를 불러오므로).
let tempIdCounter = 0;
function nextTempId() {
  tempIdCounter += 1;
  return `temp-${Date.now()}-${tempIdCounter}`;
}

function ChatContent() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get("leadId");
  const serviceLabelParam = searchParams.get("label"); // mypage 카드에서 넘겨주는 표시용 라벨(선택, context 로딩 전 임시 표시)

  const [state, setState] = useState<LoadState>("checking");
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [caseContext, setCaseContext] = useState<CaseContextSummary | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [messages, setMessages] = useState<CaseMessage[]>([]);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const sendingRef = useRef(false); // 과도한 중복 전송 방지(연타 클릭 대비 이중 안전장치)

  const [expertPanelOpen, setExpertPanelOpen] = useState(false);
  const [expertInquiry, setExpertInquiry] = useState("");
  const [expertSending, setExpertSending] = useState(false);
  const [expertError, setExpertError] = useState<string | null>(null);
  const [expertJustSubmitted, setExpertJustSubmitted] = useState(false);
  const expertSendingRef = useRef(false);

  // STEP7-2/STEP8: 첫 대화 진입 시(=아직 저장된 AI 대화가 없을 때)만
  // AI가 사건을 분석해 먼저 안내하는 동적 인사말. 실패하면(OpenAI 오류·
  // 설정 미비 등) 기존 고정 문구(WELCOME_TEXT)로 자연스럽게 대체한다.
  const [greetingState, setGreetingState] = useState<"idle" | "loading" | "ready" | "error">(
    "idle"
  );
  const [greetingText, setGreetingText] = useState<string | null>(null);
  const greetingTriggeredRef = useRef(false);

  const [aiStatus, setAiStatus] = useState<AiStatus>("checking");

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
  }, [messages, sending, greetingState]);

  // ── 기존 대화·상담 이력 로딩 ──
  useEffect(() => {
    if (state !== "ready" || !leadId || !accessToken || historyLoaded) return;

    (async () => {
      try {
        const res = await fetch("/api/case-messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken, leadId }),
        });
        const data = await res.json();
        if (res.ok) {
          setMessages(Array.isArray(data.messages) ? data.messages : []);
          setCaseContext(data.context ?? null);
          const alreadyHasAiConversation = (data.messages ?? []).some(
            (m: CaseMessage) => m.type === "customer" || m.type === "ai"
          );
          if (alreadyHasAiConversation) {
            // 이미 AI와 대화한 이력이 있다는 것 자체가 AI가 최소 한 번은
            // 정상 작동했다는 뜻 — 인사말을 다시 부르지 않고 바로 연결됨으로 표시.
            setAiStatus("connected");
          }
        } else {
          console.error("case-messages fetch failed:", data?.error);
        }
      } catch (err) {
        console.error("case-messages fetch exception:", err);
      } finally {
        setHistoryLoaded(true);
      }
    })();
  }, [state, leadId, accessToken, historyLoaded]);

  // ── 동적 인사말: 히스토리 로딩이 끝났고, AI 대화 이력이 전혀 없을 때만 ──
  useEffect(() => {
    if (!historyLoaded || state !== "ready" || !leadId || !accessToken) return;
    if (greetingTriggeredRef.current) return;

    const hasAiConversation = messages.some((m) => m.type === "customer" || m.type === "ai");
    if (hasAiConversation) return; // 이미 대화가 있으면 인사말을 다시 보여주지 않는다.

    greetingTriggeredRef.current = true;

    (async () => {
      setGreetingState("loading");
      setAiStatus("checking");
      try {
        const res = await fetch("/api/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken, leadId, mode: "greeting" }),
        });
        const data = await res.json();
        if (!res.ok || typeof data?.reply !== "string" || !data.reply.trim()) {
          setGreetingState("error");
          setAiStatus("unavailable");
          return;
        }
        setGreetingText(data.reply);
        setGreetingState("ready");
        setAiStatus("connected");
      } catch (err) {
        console.error("ai greeting fetch failed:", err);
        setGreetingState("error");
        setAiStatus("unavailable");
      }
    })();
  }, [historyLoaded, state, leadId, accessToken, messages]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sendingRef.current || !leadId || !accessToken) return;

    sendingRef.current = true;
    setSending(true);
    setSendError(null);

    const userMessage: CaseMessage = {
      id: nextTempId(),
      type: "customer",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");

    // OpenAI 컨텍스트로 보낼 role/content 배열 — customer/ai 타입만 사용.
    const openaiHistory = nextMessages
      .filter((m): m is Extract<CaseMessage, { type: "customer" | "ai" }> =>
        m.type === "customer" || m.type === "ai"
      )
      .map((m) => ({ role: m.type === "customer" ? "user" : "assistant", content: m.content }));

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, leadId, messages: openaiHistory }),
      });
      const data = await res.json();

      if (!res.ok) {
        setSendError(data?.error ?? "메시지를 보내지 못했습니다. 다시 시도해주세요.");
        if (res.status === 503) setAiStatus("unavailable");
        return;
      }

      setAiStatus("connected");
      setMessages((prev) => [
        ...prev,
        {
          id: nextTempId(),
          type: "ai",
          content: data.reply as string,
          createdAt: new Date().toISOString(),
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
    const lastCustomer = [...messages].reverse().find((m) => m.type === "customer");
    if (lastCustomer && lastCustomer.type === "customer") {
      setMessages((prev) => prev.filter((m) => m !== lastCustomer));
      sendMessage(lastCustomer.content);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  async function handleExpertSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = expertInquiry.trim();
    if (!trimmed || expertSendingRef.current || !leadId || !accessToken) return;

    expertSendingRef.current = true;
    setExpertSending(true);
    setExpertError(null);

    try {
      const res = await fetch("/api/case-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, leadId, content: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        setExpertError(data?.error ?? "상담 요청을 보내지 못했습니다. 다시 시도해주세요.");
        return;
      }

      setMessages((prev) => [...prev, data.message as CaseMessage]);
      setExpertInquiry("");
      setExpertJustSubmitted(true);
    } catch (err) {
      console.error("case-consultation request failed:", err);
      setExpertError("서버와 통신 중 문제가 발생했습니다. 다시 시도해주세요.");
    } finally {
      expertSendingRef.current = false;
      setExpertSending(false);
    }
  }

  function closeExpertPanel() {
    setExpertPanelOpen(false);
    setExpertJustSubmitted(false);
    setExpertError(null);
  }

  const hasAiConversation = messages.some((m) => m.type === "customer" || m.type === "ai");
  const showGreetingBubble = historyLoaded && !hasAiConversation;

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
          <div className="mt-1 flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                VFBCAI · AI Case Manager
              </p>
              <h1 className="mt-0.5 text-lg font-bold text-gray-900">
                Case Room
                {(caseContext?.serviceLabel ?? serviceLabelParam)
                  ? ` · ${caseContext?.serviceLabel ?? serviceLabelParam}`
                  : ""}
              </h1>
            </div>
            <span
              className={`mt-1 inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                aiStatus === "connected"
                  ? "bg-emerald-50 text-emerald-700"
                  : aiStatus === "unavailable"
                  ? "bg-gray-100 text-gray-500"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {aiStatus === "connected" ? <Wifi size={11} /> : <WifiOff size={11} />}
              {aiStatus === "connected"
                ? "AI 연결됨"
                : aiStatus === "unavailable"
                ? "AI 준비 중"
                : "AI 확인 중"}
            </span>
          </div>

          {caseContext && (
            <div className="mt-3 rounded-2xl bg-gray-50 px-3 py-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-gray-700">{caseContext.currentStepLabel}</span>
                <span className="text-gray-400">{caseContext.progressPercent}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-blue-900 transition-all"
                  style={{ width: `${caseContext.progressPercent}%` }}
                />
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-[10.5px] text-gray-500">
                <span>다음 단계: {caseContext.nextStepLabel}</span>
                <span>담당: {caseContext.expertTeamLabel}</span>
              </div>
            </div>
          )}
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
              {!historyLoaded && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white border border-gray-100 px-4 py-3 text-sm text-gray-500 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    대화 내역을 불러오는 중...
                  </div>
                </div>
              )}

              {/* 동적 인사말 — 저장된 AI 대화가 전혀 없을 때만 표시(저장되지 않는 임시 안내) */}
              {showGreetingBubble && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white border border-gray-100 px-4 py-3 text-sm text-gray-700 leading-relaxed whitespace-pre-line shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    {greetingState === "loading" && "안녕하세요. 신청 정보를 확인하고 있습니다..."}
                    {greetingState === "ready" && greetingText}
                    {greetingState === "error" && WELCOME_TEXT}
                  </div>
                </div>
              )}

              {/* 빠른 질문 버튼 — 아직 아무 대화·상담 이력도 없을 때만 노출 */}
              {historyLoaded && messages.length === 0 && (
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

              {messages.map((m) => {
                if (m.type === "customer") {
                  return (
                    <div key={m.id} className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-blue-900 px-4 py-3 text-sm leading-relaxed whitespace-pre-line text-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                        {m.content}
                        <p className="mt-1 text-[10px] text-blue-200">{formatTime(m.createdAt)}</p>
                      </div>
                    </div>
                  );
                }
                if (m.type === "ai") {
                  return (
                    <div key={m.id} className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white border border-gray-100 px-4 py-3 text-sm leading-relaxed whitespace-pre-line text-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                        {m.content}
                        <p className="mt-1 text-[10px] text-gray-400">{formatTime(m.createdAt)}</p>
                        {m.needsExpert && (
                          <button
                            onClick={() => setExpertPanelOpen(true)}
                            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-200 transition-colors"
                          >
                            <MessageSquare size={12} /> 전문가 상담 요청
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }
                if (m.type === "consultation_request") {
                  return (
                    <div key={m.id} className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed whitespace-pre-line text-amber-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                        <div className="mb-1 flex items-center gap-1.5">
                          <MessageSquare size={12} />
                          <span className="text-[11px] font-semibold">전문가 상담 요청</span>
                          {m.status === "answered" ? (
                            <CheckCircle2 size={12} className="text-emerald-600" />
                          ) : (
                            <Circle size={12} className="text-amber-500" />
                          )}
                        </div>
                        {m.content}
                        <p className="mt-1 text-[10px] text-amber-700">
                          {formatTime(m.createdAt)} · {m.status === "answered" ? "답변 완료" : "답변 대기 중"}
                        </p>
                      </div>
                    </div>
                  );
                }
                // consultation_response — AI와 명확히 다른 스타일
                return (
                  <div key={m.id} className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm leading-relaxed whitespace-pre-line text-indigo-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                      <p className="text-[11px] font-semibold text-indigo-700">VFBCAI 전문가 답변</p>
                      <p className="mt-1">{m.content}</p>
                      <p className="mt-1 text-[10px] text-indigo-500">
                        담당자: VFBCAI 담당 전문가 · {formatDateTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}

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
                {!expertJustSubmitted ? (
                  <form onSubmit={handleExpertSubmit}>
                    <p className="text-xs font-semibold text-amber-900">전문가 상담 요청</p>
                    <p className="mt-1 text-[11px] text-amber-800">
                      문의 내용을 남겨주시면 담당자가 확인 후 답변을 등록해드립니다. 답변이
                      등록되면 이메일로 안내드립니다.
                    </p>
                    <textarea
                      value={expertInquiry}
                      onChange={(e) => setExpertInquiry(e.target.value)}
                      rows={3}
                      placeholder="문의하실 내용을 입력해주세요"
                      disabled={expertSending}
                      className="mt-2 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-amber-400 disabled:opacity-60"
                    />
                    {expertError && <p className="mt-1.5 text-[11px] text-red-600">{expertError}</p>}
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={!expertInquiry.trim() || expertSending}
                        className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
                      >
                        {expertSending && <Loader2 size={12} className="animate-spin" />}
                        문의 남기기
                      </button>
                      <button
                        type="button"
                        onClick={closeExpertPanel}
                        className="rounded-full px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-amber-100 transition-colors"
                      >
                        닫기
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-amber-900">상담 요청이 접수되었습니다.</p>
                    <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                      담당자가 확인 후 답변을 등록하면 이메일로 안내드리며, 이 Case Room에서도 바로
                      확인하실 수 있습니다.
                    </p>
                    <button
                      onClick={closeExpertPanel}
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
                  placeholder={
                    aiStatus === "unavailable"
                      ? "AI 상담 준비 중입니다 (질문은 계속 입력 가능)"
                      : "궁금하신 내용을 입력해주세요"
                  }
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
