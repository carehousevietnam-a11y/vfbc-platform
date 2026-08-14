"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ChatAnswerContent } from "@/components/chat/ChatAnswerContent";
import { CostCheckCard, quoteReviewToCostCheckQuote } from "@/components/cost-check/CostCheckCard";
import { parseCostEnrichedReply } from "@/lib/aiCostSection";
import type { QuoteReviewPayload } from "@/lib/aiQuoteReview";

type NavigatorAction = { label: string; href: string };

export type AiReportData = {
  question: string;
  reply: string;
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
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        MY VIET CHECK · by VFBCAI
      </p>
      <p className="mt-3 text-sm text-slate-600">
        확인 요청:{" "}
        <span className="font-medium text-slate-800">&ldquo;{report.question}&rdquo;</span>
      </p>

      <div className="mt-8 border-t border-slate-200 pt-8">
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
              onCompareYes={onCompareYes}
              onQuoteSubmit={onQuoteSubmit}
            />
          </>
        ) : mainText.trim() ? (
          <div className="space-y-6">
            <ChatAnswerContent content={mainText} />
            {resolvedActions.length > 0 ? (
              <div className="space-y-2 border-t border-slate-100 pt-6">
                {resolvedActions.map((action) => (
                  <Link
                    key={action.href + action.label}
                    href={action.href}
                    className="flex items-center gap-1.5 text-sm text-blue-900 hover:underline"
                  >
                    <ArrowRight size={14} className="shrink-0" />
                    {action.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-10 text-sm text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
      >
        처음부터 다시 확인하기
      </button>
    </div>
  );
}
