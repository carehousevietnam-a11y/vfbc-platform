import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  formatCostAmount,
  getCostCheckService,
  type CostCheckServiceId,
  type ReviewVerdict,
} from "@/lib/costCheck";
import type { QuoteReviewPayload } from "@/lib/aiQuoteReview";
import { ReviewJudgmentDetails } from "@/components/cost-check/ReviewJudgmentDetails";
import {
  ReviewScoreGauge,
  STATUS_BADGE_LABEL,
  computeReviewScore,
} from "@/components/cost-check/ReviewScoreGauge";
import { getQuoteFunnelHref, getQuoteNextLinks } from "@/lib/quoteReviewLinks";

type QuoteReviewResultPanelProps = {
  serviceId: CostCheckServiceId;
  quotedAmount: number;
  verdict: ReviewVerdict;
  title: string;
  summary: string;
  detail: string;
  fairReference: number;
  bubblePercent: number | null;
};

export function quoteReviewFromPayload(payload: QuoteReviewPayload): QuoteReviewResultPanelProps {
  return {
    serviceId: payload.serviceId,
    quotedAmount: payload.quotedAmount,
    verdict: payload.verdict,
    title: payload.title,
    summary: payload.summary,
    detail: payload.detail,
    fairReference: payload.fairReference,
    bubblePercent: payload.bubblePercent,
  };
}

export function QuoteReviewResultPanel({
  serviceId,
  quotedAmount,
  verdict,
  title,
  summary,
  detail,
  fairReference,
  bubblePercent,
}: QuoteReviewResultPanelProps) {
  const service = getCostCheckService(serviceId);
  const score = computeReviewScore(
    verdict,
    bubblePercent,
    fairReference,
    quotedAmount,
    service.marketMin
  );
  const nextLinks = getQuoteNextLinks(serviceId);
  const funnelHref = getQuoteFunnelHref(serviceId);
  const badgeClass =
    verdict === "fair"
      ? "bg-emerald-50 text-emerald-800"
      : verdict === "very_low"
        ? "bg-slate-100 text-slate-700"
        : verdict === "caution"
          ? "bg-amber-50 text-amber-900"
          : "bg-red-50 text-red-800";

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">비용 기준</p>
        <div className="mt-3 space-y-2 border-b border-slate-100 pb-4 text-sm">
          <div className="flex items-start justify-between gap-4">
            <span className="text-slate-600 shrink-0">정부 공식 수수료</span>
            <span className="text-right font-medium text-slate-900">{service.governmentFee}</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span className="text-slate-600 shrink-0">일반 시장 범위</span>
            <span className="text-right font-medium text-slate-900">
              {formatCostAmount(service.marketMin, service.currency)} ~{" "}
              {formatCostAmount(service.marketMax, service.currency)}
            </span>
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-500">입력하신 견적</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">
          {formatCostAmount(quotedAmount, service.currency)}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
        <div className="flex flex-col items-center text-center">
          <ReviewScoreGauge score={score} verdict={verdict} size="large" />
          <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
            {STATUS_BADGE_LABEL[verdict]}
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{summary}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">{detail}</p>
        </div>
      </div>

      <ReviewJudgmentDetails
        service={service}
        quotedAmount={quotedAmount}
        fairReference={fairReference}
        bubblePercent={bubblePercent}
        score={score}
      />

      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-500">다음으로 확인해보세요</p>
        {nextLinks.map((link) => (
          <Link
            key={link.href + link.label}
            href={link.href}
            className="flex items-center gap-1.5 text-sm text-blue-900 hover:underline"
          >
            <ArrowRight size={14} className="shrink-0" />
            {link.label}
          </Link>
        ))}
      </div>

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
    </div>
  );
}
