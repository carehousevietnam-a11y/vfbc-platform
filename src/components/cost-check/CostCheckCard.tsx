import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  BarChart3,
  Building2,
  ChevronRight,
  ClipboardList,
  Info,
} from "lucide-react";
import {
  COST_CHECK_MARKET_NOTE,
  formatCostAmount,
  getCostCheckService,
  type CostCheckServiceId,
  type ReviewVerdict,
} from "@/lib/costCheck";
import { QUOTE_COMPARE_SUGGESTION } from "@/lib/aiCostSection";
import type { QuoteReviewPayload } from "@/lib/aiQuoteReview";
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

function CostIconRow({
  icon,
  iconBg,
  label,
  value,
  subValue,
  valueLarge,
  showInfo,
  children,
}: {
  icon: ReactNode;
  iconBg: string;
  label: string;
  value?: string;
  subValue?: string;
  valueLarge?: boolean;
  showInfo?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-200/80 py-4 last:border-b-0">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 text-sm text-slate-600">
          {label}
          {showInfo ? <Info size={12} className="text-slate-400" /> : null}
        </p>
        {children}
      </div>
      {value ? (
        <div className="shrink-0 text-right">
          <p
            className={
              valueLarge
                ? "text-xl font-bold text-slate-900 sm:text-2xl"
                : "text-sm font-semibold text-slate-900"
            }
          >
            {value}
          </p>
          {subValue ? <p className="mt-0.5 text-[11px] text-slate-400">{subValue}</p> : null}
        </div>
      ) : null}
    </div>
  );
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

  const reportCostBlock = (
    <section>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">비용 확인</p>
      <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-lg font-bold text-slate-900">{service.label}</p>
        <p className="flex items-center gap-1 text-[10px] leading-snug text-slate-400 sm:max-w-[50%] sm:justify-end sm:text-right">
          출처: {service.source}
          <Info size={11} className="shrink-0" />
        </p>
      </div>
      <div className="mt-4 rounded-2xl bg-slate-50/90 px-4 sm:px-5">
        <CostIconRow
          icon={<Building2 size={18} className="text-blue-700" />}
          iconBg="bg-blue-100"
          label="정부 공식 수수료"
          value={govFee.main}
          subValue={govFee.sub}
          showInfo
        />
        <OfficialSourceList sources={service.officialSources} />
        <CostIconRow
          icon={<BarChart3 size={18} className="text-emerald-700" />}
          iconBg="bg-emerald-100"
          label="일반 시장 범위"
          value={marketRange}
        />
        <CostIconRow
          icon={<ClipboardList size={18} className="text-violet-700" />}
          iconBg="bg-violet-100"
          label="다른곳에서 받은 견적"
          value={hasQuote ? formatCostAmount(quote.quotedAmount, service.currency) : undefined}
          valueLarge={hasQuote}
        >
          {!hasQuote && onQuoteSubmit ? (
            <form onSubmit={handleQuoteSubmit} className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={quoteInput}
                onChange={(e) => setQuoteInput(e.target.value)}
                placeholder="예: 1,000달러"
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
              />
              <button
                type="submit"
                disabled={!quoteInput.trim()}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                확인
              </button>
            </form>
          ) : !hasQuote ? (
            <p className="mt-1 text-xs text-slate-400">견적을 입력해주세요</p>
          ) : null}
        </CostIconRow>
      </div>
    </section>
  );

  const costBasis = isReport ? (
    reportCostBlock
  ) : (
    <>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">비용 확인</p>
      <p className="mt-1 text-base font-semibold text-slate-900">{service.label}</p>

      <div className="mt-4 space-y-2 border-y border-slate-100 py-4 text-sm">
        <div className="flex items-start justify-between gap-4">
          <span className="shrink-0 text-slate-600">정부 공식 수수료</span>
          <span className="text-right font-medium text-slate-900">{service.governmentFee}</span>
        </div>
        <p className="text-right text-[11px] leading-snug text-slate-400">출처: {service.source}</p>
        <OfficialSourceList sources={service.officialSources} />
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
    <>
      {isReport ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">견적 적정성</p>
      ) : null}
      <div
        className={
          isReport
            ? "mt-4 rounded-2xl bg-slate-50/90 p-4 sm:p-6"
            : ""
        }
      >
        <div
          className={
            isReport
              ? "grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr] lg:items-start lg:gap-10"
              : "flex flex-col items-center text-center"
          }
        >
          <div className={isReport ? "min-w-0" : ""}>
            <ReviewScoreGauge
              score={score}
              verdict={hasQuote ? quote.verdict : "fair"}
              size={gaugeSize}
              empty={!hasQuote}
            />
          </div>
          {hasQuote ? (
            <div className={isReport ? "min-w-0 space-y-3" : ""}>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}
              >
                {STATUS_BADGE_LABEL[quote.verdict]}
              </span>
              <p className={`text-sm font-semibold text-slate-900 ${isReport ? "" : "mt-3"}`}>
                {quote.title}
              </p>
              <p className="text-sm leading-relaxed text-slate-600">
                {isReport ? formatBubbleHint(displayBubble) : quote.summary}
              </p>
              <p className="text-sm leading-relaxed text-slate-500">{quote.detail}</p>
              {isReport ? (
                <ReviewJudgmentDetails
                  service={service}
                  quotedAmount={quote.quotedAmount}
                  fairReference={quote.fairReference}
                  bubblePercent={quote.bubblePercent}
                  score={score}
                  variant="pill"
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );

  const compareBlock = !hasQuote ? (
    <>
      <p className="text-sm font-medium text-slate-800">{QUOTE_COMPARE_SUGGESTION}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCompareYes}
          className={
            isReport
              ? "rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              : "rounded-lg border border-blue-900 bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-950"
          }
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
      <div className={isReport ? "mt-2 divide-y divide-slate-100" : "mt-2 space-y-2"}>
        {nextLinks.map((link) => (
          <Link
            key={link.href + link.label}
            href={link.href}
            className={
              isReport
                ? "flex items-center justify-between py-3 text-sm text-slate-800 hover:text-blue-900"
                : "flex items-center gap-1.5 text-sm text-blue-900 hover:underline"
            }
          >
            <span>{link.label}</span>
            {isReport ? (
              <ChevronRight size={16} className="shrink-0 text-slate-400" />
            ) : (
              <ChevronRight size={14} className="shrink-0" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );

  const funnelBlock = isReport ? (
    <div className="rounded-2xl bg-blue-50 px-4 py-8 text-center sm:px-6">
      <p className="text-sm text-slate-800">비용은 확인했습니다.</p>
      <p className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
        이제 내 상황을 정확히 확인해보세요.
      </p>
      <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-slate-500">
        같은 업무라도 사람마다 필요한 절차와 조건이 다를 수 있습니다.
        <br />
        내 상황에 필요한 절차와 서류를 확인하고 무료 진단 리포트로 받아보세요.
      </p>
      <Link
        href={funnelHref}
        className="mt-5 inline-flex w-full max-w-sm items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-blue-900"
      >
        내 상황 무료 진단받기 →
      </Link>
      <p className="mt-3 text-[11px] text-slate-500">
        🔒 내 상황에 필요한 절차와 조건을 확인합니다.
      </p>
    </div>
  ) : (
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
      <p className="mt-2 text-[10px] text-slate-400">내 상황에 필요한 절차와 조건을 확인합니다.</p>
    </div>
  );

  if (isReport) {
    return (
      <div className="space-y-8">
        <section>{costBasis}</section>
        <section className="border-t border-slate-100 pt-8">{adequacySection}</section>
        {!hasQuote && compareBlock ? (
          <section className="border-t border-slate-100 pt-8">{compareBlock}</section>
        ) : null}
        <section className="border-t border-slate-100 pt-8">{nextLinksBlock}</section>
        <section className="border-t border-slate-100 pt-8">{funnelBlock}</section>
      </div>
    );
  }

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
