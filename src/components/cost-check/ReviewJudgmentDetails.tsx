import { formatCostAmount, type CostCheckService } from "@/lib/costCheck";
import { computeDisplayBubblePercent } from "@/components/cost-check/ReviewScoreGauge";

type ReviewJudgmentDetailsProps = {
  service: CostCheckService;
  quotedAmount: number;
  fairReference: number;
  bubblePercent: number | null;
  score: number;
  variant?: "default" | "pill";
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

  return (
    <details className={isPill ? "group" : "rounded-lg border border-slate-200 bg-white group"}>
      <summary
        className={
          isPill
            ? "inline-flex cursor-pointer list-none items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 [&::-webkit-details-marker]:hidden"
            : "cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-800 hover:bg-slate-50 [&::-webkit-details-marker]:hidden"
        }
      >
        왜 이렇게 판단했나요? <span className="text-slate-400">⌄</span>
      </summary>
      <div
        className={
          isPill
            ? "mt-3 rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm leading-relaxed text-slate-700 space-y-2"
            : "border-t border-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-700 space-y-2"
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
          입력하신 견적:{" "}
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
    </details>
  );
}
