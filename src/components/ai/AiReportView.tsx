"use client";

import { CostCheckCard, quoteReviewToCostCheckQuote } from "@/components/cost-check/CostCheckCard";
import { ChatAnswerContent } from "@/components/chat/ChatAnswerContent";
import { parseCostEnrichedReply } from "@/lib/aiCostSection";
import type { QuoteReviewPayload } from "@/lib/aiQuoteReview";
import { ResultHeader } from "@/components/result/ResultHeader";
import { QuestionCard } from "@/components/result/QuestionCard";
import { ResultSummary } from "@/components/result/ResultSummary";
import { EvidenceSection } from "@/components/result/EvidenceSection";
import { RelatedQuestions } from "@/components/result/RelatedQuestions";
import { NextStep } from "@/components/result/NextStep";
import { extractDirectAnswer } from "@/components/result/parseReplyPresentation";
import { getQuoteFunnelHref } from "@/lib/quoteReviewLinks";
import { getCostCheckService, type CostCheckServiceId } from "@/lib/costCheck";

type NavigatorAction = { label: string; href: string };

function resolveCategoryLabel(serviceId: CostCheckServiceId): string {
  if (serviceId === "company") return "REGISTER";
  if (serviceId === "notary") return "VERIFY";
  return "CHECK";
}

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

function resolveDirectAnswer(
  mainText: string,
  hasQuote: boolean,
  quote?: QuoteReviewPayload
): { directAnswer: string; remainder: string } {
  if (hasQuote && quote) {
    const fromQuote = quote.summary?.trim() || quote.title?.trim();
    if (fromQuote) {
      const { remainder } = extractDirectAnswer(mainText);
      return { directAnswer: fromQuote, remainder };
    }
  }
  return extractDirectAnswer(mainText);
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
  const hasQuote = Boolean(report.quoteReview);
  const { directAnswer, remainder } = resolveDirectAnswer(mainText, hasQuote, report.quoteReview);

  const resolvedActions: NavigatorAction[] = hasCostPanel
    ? []
    : Array.isArray(report.actions) && report.actions.length > 0
      ? report.actions
      : parsed.nav
        ? [parsed.nav]
        : [];

  const serviceId = (report.quoteReview?.serviceId ?? parsedCost.serviceId) as
    | CostCheckServiceId
    | undefined;
  const funnelHref = serviceId ? getQuoteFunnelHref(serviceId) : "/check";
  const service = serviceId ? getCostCheckService(serviceId) : null;

  return (
    <article className="w-full">
      <ResultHeader
        onReset={onReset}
        categoryLabel={service ? resolveCategoryLabel(serviceId!) : undefined}
        modeLabel={hasQuote ? "견적 적정성 검증" : hasCostPanel ? "비용 확인" : undefined}
        serviceLabel={service?.label}
      />
      <QuestionCard
        question={report.question}
        requestedAt={report.requestedAt}
        showCostAnchor={hasCostPanel}
      />
      <ResultSummary directAnswer={directAnswer} />

      {hasCostPanel && serviceId ? (
        <CostCheckCard
          serviceId={serviceId}
          quote={report.quoteReview ? quoteReviewToCostCheckQuote(report.quoteReview) : null}
          variant="report"
          question={report.question}
          onCompareYes={onCompareYes}
          onQuoteSubmit={onQuoteSubmit}
        />
      ) : (
        <>
          {remainder.trim() ? (
            <EvidenceSection title="상세 안내">
              <ChatAnswerContent content={remainder} />
            </EvidenceSection>
          ) : mainText.trim() && !directAnswer ? (
            <EvidenceSection title="상세 안내">
              <ChatAnswerContent content={mainText} />
            </EvidenceSection>
          ) : null}

          <RelatedQuestions links={resolvedActions} />
          <NextStep funnelHref={funnelHref} />
        </>
      )}
    </article>
  );
}
