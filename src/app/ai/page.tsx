"use client";

// src/app/ai/page.tsx
//
// STEP9-UI (개정): 공개형 독립 AI 채팅 페이지. 로그인, leadId, 사건 조회를
// 전혀 요구하지 않는다 — 누구나 바로 질문을 입력하고 답을 받을 수 있다.
//
// - 인증/사건 조회 없음: supabase 세션 확인, leadId 쿼리, 마이페이지 신청
//   건 조회를 전부 제거했다(이전 버전과 가장 큰 차이).
// - 기존 POST /api/ai-chat을 그대로 호출한다(신규 API 없음). leadId를
//   보내지 않으므로 api/ai-chat/route.ts의 "익명 모드"로 처리된다 — 로그인
//   기반 Case Room(mypage/chat/page.tsx)의 동작·구조는 전혀 건드리지 않았다.
// - lib/aiGateway.ts와 api/ai-chat/route.ts는 그대로 재사용한다(이 페이지는
//   fetch 호출만 한다).
// - OPENAI_API_KEY/OPENAI_MODEL은 이 페이지가 아니라 서버(api/ai-chat)가
//   사용한다 — 키가 없어도 AI Gateway 분류상 progress/system/legal/
//   off_platform 질문은 정상 응답하고, 일반 분석 질문만 "설정 확인 중"
//   안내를 받는다.
// - 채팅 입력창 + 답변 화면만 구현한다(로딩·오류 상태 포함). 디자인은
//   기존 VFBCAI 톤(Apple 미니멀리즘 + 정부포털, blue-900 포인트, rounded
//   카드)을 그대로 따른다.
// - STEP10-2: AI 답변 끝에 붙는 "📍 안내문: /경로" 줄을 감지해 클릭 가능한
//   버튼으로 렌더링한다(parseAssistantContent/AssistantBubble). 일반 답변
//   텍스트, /api/ai-chat 호출 방식, aiGateway.ts의 문구 포맷은 그대로다 —
//   이미 온 문자열을 이 화면에서만 파싱해서 보여준다.

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Send, Loader2, AlertTriangle } from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string };

// STEP10-2: lib/aiGateway.ts(buildNavigatorSuffix)가 답변 끝에 붙이는
// "\n\n📍 {안내문}: {경로}" 줄을 감지해 일반 텍스트와 분리한다. 이 페이지
// (렌더링)만 수정하고, API 응답 형태나 aiGateway.ts의 문구 포맷은 그대로
// 둔다 — 여기서는 이미 온 문자열을 파싱만 한다.
// 경로는 /check, /verify, /register, /mypage, /consultation만 버튼으로
// 인식한다(그 외 경로가 섞여 있어도 일반 텍스트로만 표시되고 무시된다).
const NAVIGATOR_LINE_PATTERN =
  /\n\n📍 (.+?): (\/(?:check|verify|register|mypage|consultation)\S*)\s*$/;

function parseAssistantContent(content: string): {
  mainText: string;
  nav: { label: string; href: string } | null;
} {
  const match = content.match(NAVIGATOR_LINE_PATTERN);
  if (!match) return { mainText: content, nav: null };
  return {
    mainText: content.slice(0, match.index).trimEnd(),
    nav: { label: match[1], href: match[2] },
  };
}

function AssistantBubble({ content }: { content: string }) {
  const { mainText, nav } = parseAssistantContent(content);
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white border border-gray-100 px-4 py-3 text-sm leading-relaxed text-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <p className="whitespace-pre-line">{mainText}</p>
        {nav && (
          <Link
            href={nav.href}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-950 transition-colors"
          >
            {nav.label}
          </Link>
        )}
      </div>
    </div>
  );
}

export default function AiPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sendingRef = useRef(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sendingRef.current) return;

    sendingRef.current = true;
    setSending(true);
    setError(null);

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");

    try {
      // leadId/accessToken을 보내지 않는다 — api/ai-chat/route.ts가 이를
      // "익명 모드"로 처리해 로그인·사건 조회 없이 답변한다.
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
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
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
            VFBCAI
          </Link>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            VFBCAI · AI 상담
          </p>
          <h1 className="mt-0.5 text-lg font-bold text-gray-900">무엇이든 물어보세요</h1>
          <p className="mt-1 text-xs text-gray-500 leading-relaxed">
            로그인 없이 바로 이용하실 수 있습니다. 신청하신 건의 진행상황은 마이페이지 로그인 후
            확인해주세요.
          </p>
        </div>
      </div>

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
              <AssistantBubble key={i} content={m.content} />
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
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-700">
                {error}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 채팅 입력창 */}
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
          <p className="mt-2 flex items-center gap-1 text-[10px] text-gray-400">
            <AlertTriangle size={11} /> AI 안내는 참고용이며 확정적인 법률 판단이 아닙니다.
          </p>
        </div>
      </div>
    </main>
  );
}
