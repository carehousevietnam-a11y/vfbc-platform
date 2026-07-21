"use client";

// src/app/ai/page.tsx
//
// STEP9 UI: AI Gateway(lib/aiGateway.ts + api/ai-chat/route.ts)를 확인할 수
// 있는 최소 채팅 화면. 채팅 입력창 + 답변 화면만 구현하고, 그 외 기능
// (전문가 상담 패널, 대화 이력 불러오기, 진행률 헤더 등)은 mypage/chat/
// page.tsx(Case Room)에 이미 있으므로 여기서는 만들지 않는다.
//
// - 기존 /api/ai-chat을 그대로 호출한다(신규 API 없음).
// - /api/ai-chat은 accessToken 서버 검증 + leadId 소유권 재검증을 하므로
//   이 페이지도 mypage/chat/page.tsx와 동일한 인증 패턴(로그인 세션의
//   access_token + ?leadId=)을 그대로 따른다 — 인증 절차를 새로 만들지
//   않는다.
// - OPENAI_API_KEY/OPENAI_MODEL 환경변수는 이 페이지가 아니라 api/ai-chat
//   /route.ts가 사용한다(이 페이지는 그 결과만 받는다). 키가 없어도
//   AI Gateway가 progress/system/legal/off_platform 질문은 정상 응답한다
//   (STEP9), ai_analysis 질문만 "AI 상담 설정을 확인 중입니다" 안내가 온다.
// - 디자인은 기존 mypage/chat/page.tsx와 동일한 톤(Apple 미니멀리즘 +
//   정부포털, blue-900 포인트 컬러, rounded-2xl/3xl 카드)을 그대로 쓴다.

import { Suspense, useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type ChatMessage = { role: "user" | "assistant"; content: string };
type LoadState = "checking" | "signed-out" | "ready" | "not-found";

function AiPageContent() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get("leadId");

  const [state, setState] = useState<LoadState>("checking");
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sendingRef = useRef(false);

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

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sendingRef.current || !leadId || !accessToken) return;

    sendingRef.current = true;
    setSending(true);
    setError(null);

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, leadId, messages: nextMessages }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "메시지를 보내지 못했습니다. 다시 시도해주세요.");
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply as string }]);
    } catch (err) {
      console.error("ai page request failed:", err);
      setError("서버와 통신 중 문제가 발생했습니다. 다시 시도해주세요.");
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <main className="min-h-screen bg-[#fafafa] flex flex-col">
      <div className="h-[3px] bg-blue-900 shrink-0" />

      <div className="shrink-0 border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-xl">
          <Link
            href="/mypage"
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft size={14} /> 마이페이지로
          </Link>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            VFBCAI · AI Case Manager
          </p>
          <h1 className="mt-0.5 text-lg font-bold text-gray-900">AI 상담</h1>
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
          {/* 답변 화면 */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            <div className="mx-auto max-w-xl space-y-3">
              {messages.length === 0 && (
                <div className="rounded-2xl bg-white border border-gray-100 px-4 py-3 text-sm text-gray-500 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  궁금하신 내용을 입력해주세요.
                </div>
              )}

              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-blue-900 px-4 py-3 text-sm leading-relaxed whitespace-pre-line text-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white border border-gray-100 px-4 py-3 text-sm leading-relaxed whitespace-pre-line text-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                      {m.content}
                    </div>
                  </div>
                )
              )}

              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-tl-sm bg-white border border-gray-100 px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <Loader2 size={16} className="animate-spin text-blue-900" />
                  </div>
                </div>
              )}

              {error && (
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-700">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* 채팅 입력창 */}
          <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-3 sm:px-6">
            <form onSubmit={handleSubmit} className="mx-auto flex max-w-xl items-center gap-2">
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
          </div>
        </>
      )}
    </main>
  );
}

export default function AiPage() {
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
      <AiPageContent />
    </Suspense>
  );
}
