"use client";

import Link from "next/link";
import { CostCheckCard, quoteReviewToCostCheckQuote } from "@/components/cost-check/CostCheckCard";
import { ChatAnswerContent } from "@/components/chat/ChatAnswerContent";
import { matchCostCheckService, parseCostEnrichedReply } from "@/lib/aiCostSection";
import type { QuoteReviewPayload } from "@/lib/aiQuoteReview";
import { ResultHeader } from "@/components/result/ResultHeader";
import { QuestionCard } from "@/components/result/QuestionCard";
import { ResultSummary } from "@/components/result/ResultSummary";
import { EvidenceSection } from "@/components/result/EvidenceSection";
import { SourceSection } from "@/components/result/SourceSection";
import { extractDirectAnswer } from "@/components/result/parseReplyPresentation";
import { getQuoteFunnelHref } from "@/lib/quoteReviewLinks";
import { getCostCheckService, type CostCheckServiceId } from "@/lib/costCheck";
import { getTrcArticleByIntent, isTrcService, resolveTrcArticleIntent } from "@/lib/contentPacks/intentRouter";
import { guidePath } from "@/lib/contentPacks/paths";
import { useLocale } from "@/lib/i18n/LocaleProvider";

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
  /\n\n📍 (.+?): (\/(?:check|verify|register|mypage|consultation|answers|guide)\S*)\s*$/;

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
  const { t } = useLocale();
  const parsedCost = parseCostEnrichedReply(report.reply);
  const hasCostReference =
    !report.quoteReview && parsedCost.serviceId != null && parsedCost.hasQuoteCompareSuggestion;
  const hasCostPanel = Boolean(report.quoteReview || hasCostReference);
  const parsed = parseAssistantContent(hasCostReference ? parsedCost.introText : report.reply);
  const mainText = parsed.mainText;
  const hasQuote = Boolean(report.quoteReview);
  const { directAnswer, remainder } = resolveDirectAnswer(mainText, hasQuote, report.quoteReview);

  const matchedService = matchCostCheckService(report.question);
  const serviceId = (report.quoteReview?.serviceId ?? parsedCost.serviceId ?? matchedService?.id) as
    | CostCheckServiceId
    | undefined;
  const service = serviceId ? getCostCheckService(serviceId) : null;

  const actionGuideHref = (report.actions ?? []).find((item) => item.href.startsWith("/guide/"))?.href;
  const actionCheckHref = (report.actions ?? []).find((item) =>
    item.href.startsWith("/check")
  )?.href;
  const guideHref =
    actionGuideHref ??
    (serviceId && isTrcService(serviceId)
      ? guidePath(getTrcArticleByIntent(resolveTrcArticleIntent(report.question)).slug)
      : null);
  const checkHref =
    actionCheckHref ?? (serviceId ? getQuoteFunnelHref(serviceId) : parsed.nav?.href ?? "/check");

  return (
    <article className="mx-auto w-full min-w-0 max-w-[960px]">
      <QuestionCard
        question={report.question}
        requestedAt={report.requestedAt}
        showCostAnchor={hasCostPanel}
        lead={
          <ResultHeader
            onReset={onReset}
            categoryLabel={service ? resolveCategoryLabel(serviceId!) : undefined}
            modeLabel={hasQuote ? t("result.modeQuote") : hasCostPanel ? t("result.modeCost") : undefined}
            serviceLabel={service?.label}
          />
        }
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
            <EvidenceSection title={t("result.evidenceTitle")} lead={t("result.evidenceLead")}>
              <ChatAnswerContent content={remainder} />
            </EvidenceSection>
          ) : mainText.trim() && !directAnswer ? (
            <EvidenceSection title={t("result.evidenceTitle")} lead={t("result.evidenceLead")}>
              <ChatAnswerContent content={mainText} />
            </EvidenceSection>
          ) : null}

          <div className="mt-6 space-y-6 border-b border-slate-200/80 pb-6">
            <SourceSection>
              <p className="text-[13px] leading-relaxed text-slate-500">
                Vietnam · {service?.label ?? t("result.adminLegal")}
              </p>
            </SourceSection>
          </div>
        </>
      )}

      <nav
        className="mt-6 border-t border-slate-200/80 pt-6"
        aria-label="다음 행동"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {guideHref ? (
            <Link
              href={guideHref}
              className="min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition-colors hover:border-blue-900/30"
            >
              <p className="text-[15px] font-semibold text-slate-900">더 자세히 보기</p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                이 답변의 조건·근거·상황별 내용을 더 자세히 확인해보세요.
              </p>
            </Link>
          ) : null}
          <Link
            href={checkHref}
            className="min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition-colors hover:border-blue-900/30"
          >
            <p className="text-[15px] font-semibold text-slate-900">내 상황 확인하기</p>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
              같은 질문이라도 내 체류·근무·서류 상황에 따라 확인할 내용이 달라질 수 있습니다.
            </p>
          </Link>
        </div>
      </nav>
    </article>
  );
}
