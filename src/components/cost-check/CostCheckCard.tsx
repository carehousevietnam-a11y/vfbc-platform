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
import { OfficialSourceList } from "@/components/cost-check/OfficialSourceList";
import { ReviewJudgmentDetails } from "@/components/cost-check/ReviewJudgmentDetails";
import {
  ReviewScoreGauge,
  STATUS_BADGE_LABEL,
  computeReviewScore,
  computeDisplayBubblePercent,
  formatBubbleHint,
} from "@/components/cost-check/ReviewScoreGauge";
import { getQuoteFunnelHref, getQuoteNextLinks } from "@/lib/quoteReviewLinks";
import { CostMetricCard } from "@/components/result/CostMetricCard";
import { CostComparisonBar } from "@/components/result/CostComparisonBar";
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
    return (
      <div className="mt-6">
        <section className="border-b border-slate-200/80 pb-6" aria-labelledby="cost-check-heading">
          <h2 id="cost-check-heading" className="text-[15px] font-semibold text-blue-900">
            비용 확인
          </h2>
          <p className="mt-1 text-[13px] text-slate-500">
            {service.label}
            <span className="mx-1.5 text-slate-300">·</span>
            출처: {service.source}
          </p>

          <dl
            className={`mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 ${
              hasQuote ? "lg:grid-cols-3" : ""
            }`}
          >
            <CostMetricCard label="정부 공식 비용" value={govFee.main} hint={govFee.sub ?? "법정 수수료 기준"} />
            <CostMetricCard label="일반 시장 범위" value={marketRange} hint="대행 서비스 포함" />
            {hasQuote ? (
              <CostMetricCard
                label="내가 받은 견적"
                value={formatCostAmount(quote.quotedAmount, service.currency)}
                hint="입력값 기준"
                emphasis
              />
            ) : null}
          </dl>

          <CostComparisonBar
            governmentAmount={service.govFeeAmount}
            marketMin={service.marketMin}
            marketMax={service.marketMax}
            quotedAmount={hasQuote ? quote.quotedAmount : null}
            currency={service.currency}
          />

          {!hasQuote && onQuoteSubmit ? (
            <div className="mt-5 space-y-2">
              <form onSubmit={handleQuoteSubmit} className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={quoteInput}
                  onChange={(e) => setQuoteInput(e.target.value)}
                  placeholder="예: 1,000달러, 500만동"
                  className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-[15px] outline-none focus:border-blue-900/30 focus:ring-2 focus:ring-blue-900/10"
                />
                <button
                  type="submit"
                  disabled={!quoteInput.trim()}
                  className="min-h-11 rounded-xl bg-blue-900 px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#152a63] disabled:opacity-40"
                >
                  견적 확인
                </button>
              </form>
              <p className="break-keep text-[13px] leading-relaxed text-slate-500">
                {COST_CHECK_MARKET_NOTE}
              </p>
            </div>
          ) : null}
        </section>

        <section className="border-b border-slate-200/80 py-6" aria-labelledby="decision-heading">
          <h2 id="decision-heading" className="text-[15px] font-semibold text-blue-900">
            견적 적정성
          </h2>
          <div className="mt-4 flex flex-col items-center">
            <ReviewScoreGauge
              score={hasQuote ? score : 100}
              verdict={hasQuote ? quote.verdict : "fair"}
              size={gaugeSize}
              empty={false}
              baseline={!hasQuote}
            />
            <dl className="mt-2 text-center">
              <div>
                <dt className="sr-only">견적 적정성 점수</dt>
                <dd className="text-[1.5rem] font-bold tabular-nums text-slate-900">
                  {hasQuote ? Math.round(score) : 100} / 100
                </dd>
              </div>
              <div className="mt-1 flex items-center justify-center gap-1.5 text-[14px] font-semibold text-slate-800">
                <dt className="sr-only">판정</dt>
                <dd className="flex items-center justify-center gap-1.5">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      hasQuote
                        ? quote.verdict === "fair"
                          ? "bg-emerald-500"
                          : quote.verdict === "caution" || quote.verdict === "risk"
                            ? "bg-amber-500"
                            : "bg-slate-500"
                        : "bg-emerald-500"
                    }`}
                    aria-hidden
                  />
                  {hasQuote ? STATUS_BADGE_LABEL[quote.verdict] : "일반 범위"}
                </dd>
              </div>
              <div className="mt-2 max-w-xl">
                <dt className="sr-only">판단 설명</dt>
                <dd className="text-center text-[14px] leading-relaxed text-slate-600">
                  {hasQuote ? (
                    formatBubbleHint(displayBubble)
                  ) : (
                    <>
                      정부 공식 수수료와 일반 시장 범위를 함께 비교해, 입력하신 금액의 위치를
                      확인합니다.
                      <br />
                      실제 견적은 포함된 업무 범위에 따라 달라질 수 있습니다.
                    </>
                  )}
                </dd>
              </div>
            </dl>
            {!hasQuote ? (
              <p className="sr-only">
                현재 100점 표시는 일반 범위 기준 화면 상태이며, 사용자 견적 적정성 점수가
                아닙니다.
              </p>
            ) : null}
          </div>

          {hasQuote ? (
            <div className="mt-5 space-y-2">
              <p className="text-[15px] font-semibold text-slate-900">{quote.title}</p>
              <p className="text-[14px] leading-relaxed text-slate-600">{quote.detail}</p>
            </div>
          ) : null}
        </section>

        {hasQuote ? (
          <section className="py-1" aria-labelledby="evidence-heading">
            <ReviewJudgmentDetails
              service={service}
              quotedAmount={quote.quotedAmount}
              fairReference={quote.fairReference}
              bubblePercent={quote.bubblePercent}
              score={score}
            />
          </section>
        ) : null}

        <div className="space-y-6 border-b border-slate-200/80 py-6">
          {regionalOfficialFee ? (
            <SourceSection>{regionalOfficialFee}</SourceSection>
          ) : service.officialSources && service.officialSources.length > 0 ? (
            <SourceSection>
              <OfficialSourceList sources={service.officialSources} />
            </SourceSection>
          ) : (
            <SourceSection>
              <p className="text-[13px] leading-relaxed text-slate-500">출처: {service.source}</p>
            </SourceSection>
          )}
          <RelatedQuestions links={nextLinks} />
        </div>

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
          <p className="mt-1 text-sm font-semibold text-slate-900">{quote.title}</p>
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
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-6">
        {adequacySection}
      </div>
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
