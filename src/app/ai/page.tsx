"use client";

import { useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Send, Loader2, AlertTriangle } from "lucide-react";
import { AiReportView, type AiReportData } from "@/components/ai/AiReportView";
import type { QuoteReviewPayload } from "@/lib/aiQuoteReview";

type ApiTurn = { role: "user" | "assistant"; content: string };

type AiSession = {
  question: string;
  requestedAt: string;
  turns: ApiTurn[];
  report: AiReportData;
};

function AiPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q");

  const [session, setSession] = useState<AiSession | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sendingRef = useRef(false);
  const autoSentRef = useRef(false);

  useEffect(() => {
    if (autoSentRef.current) return;
    const trimmed = initialQuery?.trim();
    if (!trimmed) return;
    autoSentRef.current = true;
    submitTurn(trimmed, "new");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  async function submitTurn(text: string, mode: "new" | "followup") {
    const trimmed = text.trim();
    if (!trimmed || sendingRef.current) return;

    sendingRef.current = true;
    setSending(true);
    setError(null);
    setInput("");

    const priorTurns = mode === "new" ? [] : (session?.turns ?? []);
    const question = mode === "new" ? trimmed : (session?.question ?? trimmed);
    const requestedAt = mode === "new" ? new Date().toISOString() : (session?.requestedAt ?? new Date().toISOString());
    const apiMessages: ApiTurn[] = [...priorTurns, { role: "user", content: trimmed }];

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "메시지를 보내지 못했습니다. 다시 시도해주세요.");
        return;
      }

      const assistantTurn: ApiTurn = { role: "assistant", content: data.reply as string };
      const nextReport: AiReportData = {
        question,
        requestedAt,
        reply: data.reply as string,
        actions: Array.isArray(data.actions) ? data.actions : [],
        quoteReview:
          data.quoteReview && typeof data.quoteReview === "object"
            ? (data.quoteReview as QuoteReviewPayload)
            : undefined,
      };

      setSession({
        question,
        requestedAt,
        turns: [...apiMessages, assistantTurn],
        report: nextReport,
      });
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
    submitTurn(input, session ? "followup" : "new");
  }

  function handleReset() {
    setSession(null);
    setInput("");
    setError(null);
  }

  return (
    <main className="min-h-screen bg-[#fafafa] flex flex-col">
      <div className="h-[3px] bg-blue-900 shrink-0" />

      <div className="shrink-0 border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto w-full max-w-[960px]">
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
            VFBCAI
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-6">
        <div className="mx-auto w-full max-w-[960px]">
          {!session && !sending ? (
            <div className="text-sm text-slate-500">
              궁금하신 내용을 아래에 입력해주세요.
            </div>
          ) : null}

          {session ? (
            <AiReportView
              report={session.report}
              onCompareYes={() => submitTurn("네", "followup")}
              onQuoteSubmit={(amount) => submitTurn(amount, "followup")}
              onReset={handleReset}
            />
          ) : null}

          {sending ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
              <Loader2 size={16} className="animate-spin text-blue-900" />
              확인 중입니다…
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto w-full max-w-[960px]">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={session ? "추가로 확인할 내용을 입력해주세요" : "궁금하신 내용을 입력해주세요"}
              disabled={sending}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
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

export default function AiPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#fafafa]">
          <div className="h-[3px] bg-blue-900" />
          <div className="mx-auto max-w-3xl px-6 py-10">
            <p className="text-sm text-gray-500">불러오는 중...</p>
          </div>
        </main>
      }
    >
      <AiPageContent />
    </Suspense>
  );
}
