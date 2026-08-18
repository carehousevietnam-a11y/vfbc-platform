"use client";

import { useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Send, Loader2, AlertTriangle } from "lucide-react";
import SiteHeader from "@/components/home/SiteHeader";
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
    const requestedAt =
      mode === "new" ? new Date().toISOString() : (session?.requestedAt ?? new Date().toISOString());
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
    <main className="flex min-h-screen flex-col bg-[#faf8f5]">
      <div className="h-[3px] shrink-0 bg-blue-900" />
      <SiteHeader />

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 sm:py-8 lg:py-9">
        <div className="mx-auto w-full max-w-[1040px] px-4 sm:px-6">
          {!session && !sending ? (
            <div className="rounded-2xl bg-white px-5 py-8 text-center ring-1 ring-slate-200/60 sm:px-8">
              <p className="text-lg font-semibold text-slate-900 sm:text-xl">
                무엇을 확인하고 싶으신가요?
              </p>
              <p className="mt-2.5 text-[15px] leading-relaxed text-slate-500">
                비용 · 절차 · 서류 · 견적 적정성을 아래에 입력해 주세요.
              </p>
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
            <div className="mt-6 flex items-center gap-2.5 text-[15px] text-slate-600">
              <Loader2 size={18} className="animate-spin text-blue-900" />
              확인 중입니다…
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      <footer className="shrink-0 border-t border-slate-200/70 bg-white/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[1040px] px-4 py-4 sm:px-6">
          <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                session ? "추가로 확인할 내용을 입력해주세요" : "궁금하신 내용을 입력해주세요"
              }
              disabled={sending}
              className="min-h-[48px] flex-1 rounded-xl border border-slate-200 bg-[#faf8f5]/60 px-4 py-2.5 text-[15px] outline-none transition-colors focus:border-blue-900/30 focus:bg-white focus:ring-2 focus:ring-blue-900/10 disabled:opacity-60 sm:text-base"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-white transition-colors hover:bg-[#152a63] disabled:opacity-40"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="mt-2.5 flex items-center gap-1.5 text-[13px] text-slate-500">
            <AlertTriangle size={12} className="shrink-0" />
            AI 안내는 참고용이며 확정적인 법률 판단이 아닙니다.
          </p>
        </div>
      </footer>
    </main>
  );
}

export default function AiPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#faf8f5]">
          <div className="h-[3px] bg-blue-900" />
          <div className="mx-auto w-full max-w-[1040px] px-4 py-10 sm:px-6">
            <p className="text-sm text-slate-500">불러오는 중...</p>
          </div>
        </main>
      }
    >
      <AiPageContent />
    </Suspense>
  );
}
