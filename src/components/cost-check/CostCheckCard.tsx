import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  COST_CHECK_MARKET_NOTE,
  formatCostAmount,
  getCostCheckService,
  type CostCheckServiceId,
  type ReviewVerdict,
} from "@/lib/costCheck";
import { QUOTE_COMPARE_SUGGESTION } from "@/lib/aiCostSection";
import type { QuoteReviewPayload } from "@/lib/aiQuoteReview";
import { WpRegionalOfficialFee } from "@/components/cost-check/WpRegionalOfficialFee";
import { ReviewJudgmentDetails } from "@/components/cost-check/ReviewJudgmentDetails";
import {
  ReviewScoreGauge,
  STATUS_BADGE_LABEL,
  computeReviewScore,
  computeDisplayBubblePercent,
  formatBubbleHint,
} from "@/components/cost-check/ReviewScoreGauge";
import { getQuoteFunnelHref, getQuoteNextLinks } from "@/lib/quoteReviewLinks";
import { KeyMetrics } from "@/components/result/KeyMetrics";
import { CostComparisonBar } from "@/components/result/CostComparisonBar";
import { DecisionSection } from "@/components/result/DecisionSection";
import { EvidenceSection } from "@/components/result/EvidenceSection";
import { SourceSection } from "@/components/result/SourceSection";
import { RelatedQuestions } from "@/components/result/RelatedQuestions";
import { NextStep } from "@/components/result/NextStep";

export type CostCheckQuoteResult = {
  quotedAmount: number;
  verdict: ReviewVerdict;
  title: string;
  summary: string;
  detail: string;
  fairReference: number;
  bubblePercent: number | null;
};

type CostCheckCardProps = {
  serviceId: CostCheckServiceId;
  quote?: CostCheckQuoteResult | null;
  variant?: "card" | "report";
  question?: string;
  onCompareYes?: () => void;
  onQuoteSubmit?: (amount: string) => void;
};

export function quoteReviewToCostCheckQuote(payload: QuoteReviewPayload): CostCheckQuoteResult {
  return {
    quotedAmount: payload.quotedAmount,
    verdict: payload.verdict,
    title: payload.title,
    summary: payload.summary,
    detail: payload.detail,
    fairReference: payload.fairReference,
    bubblePercent: payload.bubblePercent,
  };
}

function splitGovernmentFee(fee: string): { main: string; sub?: string } {
  const match = fee.match(/^(.+?)\s*(\([^)]+\))\s*$/);
  if (match) return { main: match[1].trim(), sub: match[2] };
  return { main: fee };
}

function SectionWrap({
  variant,
  children,
  className = "",
}: {
  variant: "card" | "report";
  children: ReactNode;
  className?: string;
}) {
  if (variant === "report") {
    return <section className={className}>{children}</section>;
  }
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 ${className}`}>{children}</div>
  );
}

export function CostCheckCard({
  serviceId,
  quote = null,
  variant = "card",
  question,
  onCompareYes,
  onQuoteSubmit,
}: CostCheckCardProps) {
  const [quoteInput, setQuoteInput] = useState("");
  const service = getCostCheckService(serviceId);
  const hasQuote = quote != null;
  const isReport = variant === "report";
  const score = hasQuote
    ? computeReviewScore(
        quote.verdict,
        quote.bubblePercent,
        quote.fairReference,
        quote.quotedAmount,
        service.marketMin
      )
    : 0;
  const nextLinks = getQuoteNextLinks(serviceId);
  const funnelHref = getQuoteFunnelHref(serviceId);
  const gaugeSize = isReport ? "semi" : "large";
  const displayBubble = hasQuote
    ? computeDisplayBubblePercent(quote.bubblePercent, quote.fairReference, quote.quotedAmount)
    : 0;
  const badgeClass =
    !hasQuote
      ? ""
      : quote.verdict === "fair"
        ? "bg-emerald-50 text-emerald-800"
        : quote.verdict === "very_low"
          ? "bg-slate-100 text-slate-700"
          : quote.verdict === "caution"
            ? "bg-amber-50 text-amber-900"
            : "bg-red-50 text-red-800";

  function handleQuoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = quoteInput.trim();
    if (!trimmed) return;
    onQuoteSubmit?.(trimmed);
    setQuoteInput("");
  }

  const govFee = splitGovernmentFee(service.governmentFee);
  const marketRange = `${formatCostAmount(service.marketMin, service.currency)} ~ ${formatCostAmount(
    service.marketMax,
    service.currency
  )}`;

  const regionalOfficialFee =
    serviceId === "wp" && service.officialSources ? (
      <WpRegionalOfficialFee sources={service.officialSources} question={question} />
    ) : null;

  if (isReport) {
    const metrics = [
      {
        label: "정부 공식 비용",
        value: govFee.main,
        hint: govFee.sub,
      },
      {
        label: "일반 시장 범위",
        value: marketRange,
        hint: service.lookupGuide,
      },
      ...(hasQuote
        ? [
            {
              label: "내가 받은 견적",
              value: formatCostAmount(quote.quotedAmount, service.currency),
              emphasis: true,
            },
          ]
        : []),
    ];

    return (
      <div className="mt-10 space-y-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-10">
          <section aria-labelledby="cost-check-heading">
            <h2 id="cost-check-heading" className="text-base font-semibold text-blue-900 sm:text-lg">
              비용 확인
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-800 sm:text-[15px]">{service.label}</p>
            <p className="mt-2 text-xs text-slate-500 sm:text-[13px]">
              출처: {service.source}
            </p>
            <div className="mt-5">
              <KeyMetrics title="핵심 수치" metrics={metrics} />
            </div>
            <CostComparisonBar
              governmentAmount={service.govFeeAmount}
              marketMin={service.marketMin}
              marketMax={service.marketMax}
              quotedAmount={hasQuote ? quote.quotedAmount : null}
              currency={service.currency}
            />

            {!hasQuote && onQuoteSubmit ? (
              <form onSubmit={handleQuoteSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={quoteInput}
                  onChange={(e) => setQuoteInput(e.target.value)}
                  placeholder="예: 1,000달러, 500만동"
                  className="min-h-[44px] flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[15px] outline-none focus:border-blue-900/30 focus:ring-2 focus:ring-blue-900/10"
                />
                <button
                  type="submit"
                  disabled={!quoteInput.trim()}
                  className="min-h-[44px] rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#152a63] disabled:opacity-40"
                >
                  견적 확인
                </button>
              </form>
            ) : null}
          </section>

          <DecisionSection
            title="견적 적정성"
            layout="stacked"
            verdictLabel={hasQuote ? `${Math.round(score)} / 100` : undefined}
            verdictHint={
              hasQuote
                ? isReport
                  ? formatBubbleHint(displayBubble)
                  : quote.summary
                : undefined
            }
          >
            <ReviewScoreGauge
              score={score}
              verdict={hasQuote ? quote.verdict : "fair"}
              size={gaugeSize}
              empty={!hasQuote}
            />
          </DecisionSection>
        </div>

        {regionalOfficialFee ? (
          <SourceSection title="공식 출처">{regionalOfficialFee}</SourceSection>
        ) : null}

        {hasQuote ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold sm:text-[13px] ${badgeClass}`}
              >
                {STATUS_BADGE_LABEL[quote.verdict]}
              </span>
              <p className="text-[15px] font-semibold text-slate-900 sm:text-base">{quote.title}</p>
            </div>
            <p className="text-[15px] leading-relaxed text-slate-600 sm:text-base">{quote.detail}</p>

            <EvidenceSection title="왜 이렇게 판단했나요?" highlighted>
              <ReviewJudgmentDetails
                service={service}
                quotedAmount={quote.quotedAmount}
                fairReference={quote.fairReference}
                bubblePercent={quote.bubblePercent}
                score={score}
                variant="open"
              />
            </EvidenceSection>
          </>
        ) : null}

        {!hasQuote ? (
          <section className="rounded-2xl bg-white px-5 py-5 ring-1 ring-slate-200/70 sm:px-6">
            <p className="text-[15px] font-medium text-slate-800">{QUOTE_COMPARE_SUGGESTION}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onCompareYes}
                className="min-h-[44px] rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#152a63]"
              >
                네, 비교할게요
              </button>
              <span className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-500">
                괜찮아요
              </span>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-500 sm:text-[13px]">
              {COST_CHECK_MARKET_NOTE}
            </p>
          </section>
        ) : null}

        <RelatedQuestions links={nextLinks} />
        <NextStep funnelHref={funnelHref} />
      </div>
    );
  }

  const costBasis = (
    <>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">비용 확인</p>
      <p className="mt-1 text-base font-semibold text-slate-900">{service.label}</p>

      <div className="mt-4 space-y-2 border-y border-slate-100 py-4 text-sm">
        <div className="flex items-start justify-between gap-4">
          <span className="shrink-0 text-slate-600">정부 공식 수수료</span>
          <span className="text-right font-medium text-slate-900">{service.governmentFee}</span>
        </div>
        <p className="text-right text-xs leading-snug text-slate-500">출처: {service.source}</p>
        {regionalOfficialFee}
        <div className="flex items-start justify-between gap-4">
          <span className="shrink-0 text-slate-600">일반 시장 범위</span>
          <span className="text-right font-medium text-slate-900">
            {formatCostAmount(service.marketMin, service.currency)} ~{" "}
            {formatCostAmount(service.marketMax, service.currency)}
          </span>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">다른곳에서 받은 견적</p>
      {hasQuote ? (
        <p className="mt-1 text-2xl font-bold text-slate-900">
          {formatCostAmount(quote.quotedAmount, service.currency)}
        </p>
      ) : onQuoteSubmit ? (
        <form onSubmit={handleQuoteSubmit} className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            value={quoteInput}
            onChange={(e) => setQuoteInput(e.target.value)}
            placeholder="예: 1,000달러, 500만동"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
          <button
            type="submit"
            disabled={!quoteInput.trim()}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            확인
          </button>
        </form>
      ) : (
        <p className="mt-1 text-sm font-medium text-slate-400">아직 입력하지 않으셨어요</p>
      )}

      {!hasQuote && !onQuoteSubmit ? (
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          시장 통상 대행료 (참고):{" "}
          {formatCostAmount(service.marketUsualFeeAmount, service.currency)} 전후 · {service.lookupGuide}
        </p>
      ) : null}
    </>
  );

  const adequacySection = (
    <div className="flex flex-col items-center text-center">
      <ReviewScoreGauge
        score={score}
        verdict={hasQuote ? quote.verdict : "fair"}
        size={gaugeSize}
        empty={!hasQuote}
      />
      {hasQuote ? (
        <div className="mt-3">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}
          >
            {STATUS_BADGE_LABEL[quote.verdict]}
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-900">{quote.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{quote.summary}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{quote.detail}</p>
        </div>
      ) : null}
    </div>
  );

  const compareBlock = !hasQuote ? (
    <>
      <p className="text-sm font-medium text-slate-800">{QUOTE_COMPARE_SUGGESTION}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCompareYes}
          className="rounded-lg border border-blue-900 bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-950"
        >
          네, 비교할게요
        </button>
        <span className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-500">
          괜찮아요
        </span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-400">{COST_CHECK_MARKET_NOTE}</p>
    </>
  ) : null;

  const nextLinksBlock = (
    <div>
      <p className="text-xs font-semibold text-slate-500">다음으로 확인해보세요</p>
      <div className="mt-2 space-y-2">
        {nextLinks.map((link) => (
          <Link
            key={link.href + link.label}
            href={link.href}
            className="flex items-center gap-1.5 text-sm text-blue-900 hover:underline"
          >
            <span>{link.label}</span>
            <ChevronRight size={14} className="shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );

  const funnelBlock = (
    <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
      <p className="text-sm font-semibold text-slate-900">비용은 확인했습니다.</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">이제 내 상황을 정확히 확인해보세요.</p>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        같은 업무라도 사람마다 필요한 절차와 조건이 다를 수 있습니다.
        <br />
        내 상황에 필요한 절차와 서류를 확인하고
        <br />
        무료 진단 리포트로 받아보세요.
      </p>
      <Link
        href={funnelHref}
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-900 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-950"
      >
        내 상황 무료 진단받기 →
      </Link>
      <p className="mt-2 text-xs text-slate-400">내 상황에 필요한 절차와 조건을 확인합니다.</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <SectionWrap variant={variant}>{costBasis}</SectionWrap>
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">{adequacySection}</div>
      {!hasQuote && compareBlock ? <SectionWrap variant={variant}>{compareBlock}</SectionWrap> : null}
      {hasQuote ? (
        <ReviewJudgmentDetails
          service={service}
          quotedAmount={quote.quotedAmount}
          fairReference={quote.fairReference}
          bubblePercent={quote.bubblePercent}
          score={score}
        />
      ) : null}
      {nextLinksBlock}
      {funnelBlock}
    </div>
  );
}
