"use client";

import { formatCostAmount, type CostCheckCurrency } from "@/lib/costCheck";

type CostComparisonBarProps = {
  governmentAmount: number;
  marketMin: number;
  marketMax: number;
  quotedAmount?: number | null;
  currency: CostCheckCurrency;
};

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function CostComparisonBar({
  governmentAmount,
  marketMin,
  marketMax,
  quotedAmount,
  currency,
}: CostComparisonBarProps) {
  const maxValue = Math.max(
    governmentAmount,
    marketMax,
    quotedAmount ?? 0,
    marketMin,
    1
  );
  const govPos = clampPercent((governmentAmount / maxValue) * 100);
  const marketStart = clampPercent((marketMin / maxValue) * 100);
  const marketEnd = clampPercent((marketMax / maxValue) * 100);
  const quotePos =
    quotedAmount != null ? clampPercent((quotedAmount / maxValue) * 100) : null;

  return (
    <div className="mt-4" aria-labelledby="cost-comparison-heading">
      <h3 id="cost-comparison-heading" className="sr-only">
        비용 비교
      </h3>
      <div className="relative h-2 rounded-full bg-slate-100">
        <div
          className="absolute top-0 h-2 rounded-full bg-teal-500/25"
          style={{ left: `${marketStart}%`, width: `${Math.max(marketEnd - marketStart, 2)}%` }}
          aria-hidden
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-500 shadow-sm"
          style={{ left: `${govPos}%` }}
          aria-hidden
        />
        {quotePos != null ? (
          <div
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-900 shadow-sm"
            style={{ left: `${quotePos}%` }}
            aria-hidden
          />
        ) : null}
      </div>
      <dl className="mt-4 grid grid-cols-1 gap-3 text-[13px] sm:grid-cols-3 sm:text-sm lg:text-[14px]">
        <div className="flex items-start gap-2">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-500" aria-hidden />
          <div>
            <dt className="font-medium text-slate-500">정부 공식 비용</dt>
            <dd className="mt-0.5 font-semibold text-slate-900">
              {formatCostAmount(governmentAmount, currency)}
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal-500/60" aria-hidden />
          <div>
            <dt className="font-medium text-slate-500">일반 시장 범위</dt>
            <dd className="mt-0.5 font-semibold text-slate-900">
              {formatCostAmount(marketMin, currency)} ~ {formatCostAmount(marketMax, currency)}
            </dd>
          </div>
        </div>
        {quotedAmount != null ? (
          <div className="flex items-start gap-2">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-900" aria-hidden />
            <div>
              <dt className="font-medium text-slate-500">내가 받은 견적</dt>
              <dd className="mt-0.5 font-semibold text-blue-900">
                {formatCostAmount(quotedAmount, currency)}
              </dd>
            </div>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
