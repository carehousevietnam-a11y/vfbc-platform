import { formatCostAmount, type CostCheckService } from "@/lib/costCheck";
import { computeDisplayBubblePercent } from "@/components/cost-check/ReviewScoreGauge";

type ReviewJudgmentDetailsProps = {
  service: CostCheckService;
  quotedAmount: number;
  fairReference: number;
  bubblePercent: number | null;
  score: number;
  variant?: "default" | "pill" | "open";
};

export function ReviewJudgmentDetails({
  service,
  quotedAmount,
  fairReference,
  bubblePercent,
  score,
  variant = "default",
}: ReviewJudgmentDetailsProps) {
  const displayBubble = computeDisplayBubblePercent(bubblePercent, fairReference, quotedAmount);
  const currency = service.currency;

  const isPill = variant === "pill";
  const isOpen = variant === "open";

  const body = (
    <div
      className={
        isOpen
          ? "space-y-2 text-[14px] leading-relaxed text-slate-700 sm:text-[15px]"
          : isPill
            ? "mt-3 rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm leading-relaxed text-slate-700 space-y-2"
            : "border-t border-slate-100 pb-4 pt-1 text-[14px] leading-relaxed text-slate-700 space-y-2"
      }
    >
      <p>
        정부 공식 수수료:{" "}
        <span className="font-medium text-slate-900">{service.governmentFee}</span>
      </p>
      <p>
        시장 통상 범위:{" "}
        <span className="font-medium text-slate-900">
          {formatCostAmount(service.marketMin, currency)} ~{" "}
          {formatCostAmount(service.marketMax, currency)}
        </span>
      </p>
      <p>
        다른곳에서 받은 견적:{" "}
        <span className="font-medium text-slate-900">
          {formatCostAmount(quotedAmount, currency)}
        </span>
      </p>
      <p>
        적정범위(R) = 정부수수료 + 시장통상수수료 ={" "}
        <span className="font-medium text-slate-900">
          {formatCostAmount(fairReference, currency)}
        </span>
      </p>
      <p>
        거품비율 = ((견적-R)/R)×100 ={" "}
        <span className="font-medium text-slate-900">
          {displayBubble > 0 ? "+" : ""}
          {displayBubble.toFixed(1)}%
        </span>
      </p>
      <p>
        적정성 점수:{" "}
        <span className="font-medium text-slate-900">{Math.round(score)} / 100</span>
      </p>
    </div>
  );

  if (isOpen) {
    return body;
  }

  return (
    <details className={isPill ? "group" : "group border-y border-slate-200/80"}>
      <summary
        className={
          isPill
            ? "inline-flex cursor-pointer list-none items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 [&::-webkit-details-marker]:hidden"
            : "flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-3 text-[15px] font-medium text-slate-800 [&::-webkit-details-marker]:hidden"
        }
      >
        <h2 id="evidence-heading" className="text-[15px] font-medium text-slate-800">
          왜 이렇게 판단했나요?
        </h2>
        <span className="text-slate-400">⌄</span>
      </summary>
      {body}
    </details>
  );
}
