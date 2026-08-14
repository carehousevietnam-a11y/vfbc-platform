import { formatCostAmount, type CostCheckService } from "@/lib/costCheck";
import { computeDisplayBubblePercent } from "@/components/cost-check/ReviewScoreGauge";

type ReviewJudgmentDetailsProps = {
  service: CostCheckService;
  quotedAmount: number;
  fairReference: number;
  bubblePercent: number | null;
  score: number;
};

export function ReviewJudgmentDetails({
  service,
  quotedAmount,
  fairReference,
  bubblePercent,
  score,
}: ReviewJudgmentDetailsProps) {
  const displayBubble = computeDisplayBubblePercent(bubblePercent, fairReference, quotedAmount);
  const currency = service.currency;

  return (
    <details className="rounded-lg border border-slate-200 bg-white group">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-800 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
        왜 이렇게 판단했나요?
      </summary>
      <div className="border-t border-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-700 space-y-2">
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
