"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatCostAmount, type CostCheckService } from "@/lib/costCheck";
import { computeDisplayBubblePercent } from "@/components/cost-check/ReviewScoreGauge";

type ReviewJudgmentDetailsProps = {
  service: CostCheckService;
  quotedAmount: number;
  fairReference: number;
  bubblePercent: number | null;
};

export function ReviewJudgmentDetails({
  service,
  quotedAmount,
  fairReference,
  bubblePercent,
}: ReviewJudgmentDetailsProps) {
  const [open, setOpen] = useState(false);
  const displayBubble = computeDisplayBubblePercent(bubblePercent, fairReference, quotedAmount);
  const currency = service.currency;

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
        aria-expanded={open}
      >
        왜 이렇게 판단했나요?
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-700 space-y-2">
          <p>
            정부 공식 수수료:{" "}
            <span className="font-medium text-slate-900">
              {formatCostAmount(service.govFeeAmount, currency)}
            </span>
            <span className="ml-1 text-xs text-slate-500">({service.governmentFee})</span>
          </p>
          <p>
            시장 통상 범위:{" "}
            <span className="font-medium text-slate-900">
              {formatCostAmount(service.marketMin, currency)} ~{" "}
              {formatCostAmount(service.marketMax, currency)}
            </span>
          </p>
          <p>
            입력하신 견적:{" "}
            <span className="font-medium text-slate-900">
              {formatCostAmount(quotedAmount, currency)}
            </span>
          </p>
          <p className="pt-1 text-slate-600">
            → 적정범위(R) = 정부수수료 + 시장통상수수료 ={" "}
            <span className="font-medium text-slate-900">
              {formatCostAmount(fairReference, currency)}
            </span>
          </p>
          <p className="text-slate-600">
            → 거품비율 = ((견적-R)/R)×100 ={" "}
            <span className="font-medium text-slate-900">
              {displayBubble > 0 ? "+" : ""}
              {displayBubble.toFixed(1)}%
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
