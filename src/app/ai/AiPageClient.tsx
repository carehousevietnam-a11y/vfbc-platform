"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Loader2, AlertTriangle } from "lucide-react";
import SiteHeader from "@/components/home/SiteHeader";
import { AiReportView, type AiReportData } from "@/components/ai/AiReportView";
import type { QuoteReviewPayload } from "@/lib/aiQuoteReview";
import { extractDirectAnswer } from "@/components/result/parseReplyPresentation";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type ApiTurn = { role: "user" | "assistant"; content: string };

type AiSession = {
  question: string;
  requestedAt: string;
  turns: ApiTurn[];
  report: AiReportData;
};

function AiPageContent() {
  const { t } = useLocale();
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
        setError(data?.error ?? t("ai.errorSend"));
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
      setError(t("ai.errorServer"));
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

  const qaJsonLd = session
    ? {
        "@context": "https://schema.org",
        "@type": "QAPage",
        mainEntity: {
          "@type": "Question",
          name: session.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: extractDirectAnswer(session.report.reply).directAnswer || session.report.reply,
          },
        },
      }
    : null;

  return (
    <main className="flex min-h-screen flex-col bg-[#faf8f5]">
      {qaJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(qaJsonLd) }} />
      ) : null}
      <div className="h-[3px] shrink-0 bg-blue-900" />
      <SiteHeader />

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 sm:py-8">
        <div className="mx-auto w-full max-w-[1040px] px-4 sm:px-6">
          {!session && !sending ? (
            <div className="rounded-2xl bg-white px-6 py-10 text-center shadow-[0_1px_3px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/60 sm:px-10">
              <p className="text-xl font-semibold text-slate-900 lg:text-[22px]">
                {t("ai.emptyTitle")}
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-500 sm:text-base">
                {t("ai.emptyBody")}
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
            <div className="mt-8 flex items-center gap-2.5 text-[15px] text-slate-600 sm:text-base">
              <Loader2 size={18} className="animate-spin text-blue-900" />
              {t("ai.sending")}
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 sm:text-[15px]">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      {!session ? (
        <footer className="shrink-0 border-t border-slate-200/70 bg-white/95 backdrop-blur">
          <div className="mx-auto w-full max-w-[1040px] px-4 py-4 sm:px-6">
            <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("ai.placeholderNew")}
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
            <p className="mt-2.5 flex items-center gap-1.5 text-[13px] text-slate-500 sm:text-sm">
              <AlertTriangle size={12} className="shrink-0" />
              {t("ai.disclaimer")}
            </p>
          </div>
        </footer>
      ) : null}
    </main>
  );
}

export default function AiPageClient() {
  const { t } = useLocale();
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#faf8f5]">
          <div className="h-[3px] bg-blue-900" />
          <div className="mx-auto max-w-[1040px] px-4 py-10 sm:px-6">
            <p className="text-sm text-slate-500">{t("ai.loading")}</p>
          </div>
        </main>
      }
    >
      <AiPageContent />
    </Suspense>
  );
}
