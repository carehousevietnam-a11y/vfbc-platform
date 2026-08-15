"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { ChatAnswerContent } from "@/components/chat/ChatAnswerContent";
import { CostCheckCard, quoteReviewToCostCheckQuote } from "@/components/cost-check/CostCheckCard";
import { parseCostEnrichedReply } from "@/lib/aiCostSection";
import type { QuoteReviewPayload } from "@/lib/aiQuoteReview";

type NavigatorAction = { label: string; href: string };

export type AiReportData = {
  question: string;
  reply: string;
  requestedAt: string;
  actions?: NavigatorAction[];
  quoteReview?: QuoteReviewPayload;
};

const NAVIGATOR_LINE_PATTERN =
  /\n\n📍 (.+?): (\/(?:check|verify|register|mypage|consultation|answers)\S*)\s*$/;

function parseAssistantContent(content: string): {
  mainText: string;
  nav: NavigatorAction | null;
} {
  const match = content.match(NAVIGATOR_LINE_PATTERN);
  if (!match) return { mainText: content, nav: null };
  return {
    mainText: content.slice(0, match.index).trimEnd(),
    nav: { label: match[1], href: match[2] },
  };
}

function formatRequestedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}.${m}.${d} ${h}:${min} 기준`;
}

type AiReportViewProps = {
  report: AiReportData;
  onCompareYes: () => void;
  onQuoteSubmit: (amount: string) => void;
  onReset: () => void;
};

export function AiReportView({ report, onCompareYes, onQuoteSubmit, onReset }: AiReportViewProps) {
  const parsedCost = parseCostEnrichedReply(report.reply);
  const hasCostReference =
    !report.quoteReview && parsedCost.serviceId != null && parsedCost.hasQuoteCompareSuggestion;
  const hasCostPanel = Boolean(report.quoteReview || hasCostReference);
  const parsed = parseAssistantContent(hasCostReference ? parsedCost.introText : report.reply);
  const mainText = parsed.mainText;
  const resolvedActions: NavigatorAction[] =
    hasCostPanel
      ? []
      : Array.isArray(report.actions) && report.actions.length > 0
        ? report.actions
        : parsed.nav
          ? [parsed.nav]
          : [];

  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-4">
        <p className="text-base leading-snug sm:text-lg">
          <span className="font-bold tracking-tight text-slate-900">MY VIET CHECK</span>
          <span className="text-sm font-normal text-slate-400"> · by VFBCAI</span>
        </p>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
        >
          <RotateCcw size={12} />
          처음부터 다시 확인하기
        </button>
      </div>

      <div className="mt-6 border-b border-slate-200 pb-6">
        <p className="text-xs font-medium text-slate-400">확인 요청</p>
        <p className="mt-1 text-lg font-bold leading-snug text-slate-900 sm:text-xl">
          {report.question}
        </p>
        <p className="mt-2 text-[11px] text-slate-400">{formatRequestedAt(report.requestedAt)}</p>
      </div>

      <div className="mt-8">
        {hasCostPanel ? (
          <>
            {mainText.trim() ? (
              <div className="mb-8 border-b border-slate-100 pb-8">
                <ChatAnswerContent content={mainText} />
              </div>
            ) : null}
            <CostCheckCard
              serviceId={(report.quoteReview?.serviceId ?? parsedCost.serviceId)!}
              quote={report.quoteReview ? quoteReviewToCostCheckQuote(report.quoteReview) : null}
              variant="report"
              question={report.question}
              onCompareYes={onCompareYes}
              onQuoteSubmit={onQuoteSubmit}
            />
          </>
        ) : mainText.trim() ? (
          <div className="space-y-6">
            <ChatAnswerContent content={mainText} />
            {resolvedActions.length > 0 ? (
              <div className="divide-y divide-slate-100 border-t border-slate-100">
                {resolvedActions.map((action) => (
                  <Link
                    key={action.href + action.label}
                    href={action.href}
                    className="flex items-center justify-between py-3 text-sm text-slate-800 hover:text-blue-900"
                  >
                    <span>{action.label}</span>
                    <span className="text-slate-400">&gt;</span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
