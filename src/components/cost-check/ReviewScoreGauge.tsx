import type { ReviewVerdict } from "@/lib/costCheck";

const GAUGE_COLORS: Record<ReviewVerdict, { stroke: string; track: string; badge: string }> = {
  fair: { stroke: "#059669", track: "#e2e8f0", badge: "bg-emerald-50 text-emerald-800" },
  caution: { stroke: "#d97706", track: "#e2e8f0", badge: "bg-amber-50 text-amber-900" },
  risk: { stroke: "#dc2626", track: "#e2e8f0", badge: "bg-red-50 text-red-800" },
  very_low: { stroke: "#475569", track: "#e2e8f0", badge: "bg-slate-100 text-slate-700" },
};

export const STATUS_BADGE_LABEL: Record<ReviewVerdict, string> = {
  fair: "적정",
  caution: "높은편",
  risk: "높은편",
  very_low: "낮은편",
};

type ReviewScoreGaugeProps = {
  score?: number;
  verdict?: ReviewVerdict;
  size?: "default" | "large";
  empty?: boolean;
};

export function ReviewScoreGauge({
  score = 0,
  verdict = "fair",
  size = "default",
  empty = false,
}: ReviewScoreGaugeProps) {
  const isLarge = size === "large";
  const radius = isLarge ? 68 : 52;
  const circumference = 2 * Math.PI * radius;
  const progress = empty ? 0 : (Math.min(100, Math.max(0, score)) / 100) * circumference;
  const { stroke, track } = empty
    ? { stroke: "#cbd5e1", track: "#e2e8f0" }
    : GAUGE_COLORS[verdict];
  const isVeryLow = !empty && verdict === "very_low";
  const boxClass = isLarge ? "h-44 w-44" : "h-32 w-32";

  return (
    <div className={`relative ${boxClass}`}>
      <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160" aria-hidden>
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={track}
          strokeWidth={isLarge ? "12" : "10"}
        />
        {!empty ? (
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={isLarge ? "12" : "10"}
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            className="transition-all duration-500 ease-out"
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
        {empty ? (
          <>
            <span
              className={`font-medium leading-snug text-slate-400 ${isLarge ? "text-sm" : "text-xs"}`}
            >
              견적을 알려주시면
              <br />
              확인해드려요
            </span>
          </>
        ) : isVeryLow ? (
          <>
            <span className={`font-bold leading-tight text-slate-700 ${isLarge ? "text-xl" : "text-lg"}`}>
              확인 필요
            </span>
            <span className={`mt-0.5 font-medium text-slate-500 ${isLarge ? "text-sm" : "text-[10px]"}`}>
              ({Math.round(score)}점)
            </span>
          </>
        ) : (
          <>
            <span className={`font-bold text-slate-900 ${isLarge ? "text-5xl" : "text-3xl"}`}>
              {Math.round(score)}
            </span>
            <span className={`font-medium text-slate-400 ${isLarge ? "text-sm" : "text-[10px]"}`}>
              / 100
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export function clampScore(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function computeReviewScore(
  verdict: ReviewVerdict,
  bubblePercent: number | null,
  fairReference: number,
  quotedAmount: number,
  marketMin: number
): number {
  if (verdict === "very_low") {
    if (marketMin <= 0) return 0;
    const shortfallPercent = (Math.abs(quotedAmount - marketMin) / marketMin) * 100;
    return clampScore(100 - shortfallPercent);
  }

  const bubble =
    bubblePercent ??
    (fairReference > 0 ? ((quotedAmount - fairReference) / fairReference) * 100 : 0);
  return clampScore(100 - bubble);
}

export function computeDisplayBubblePercent(
  bubblePercent: number | null,
  fairReference: number,
  quotedAmount: number
): number {
  if (bubblePercent != null) return bubblePercent;
  if (fairReference <= 0) return 0;
  return ((quotedAmount - fairReference) / fairReference) * 100;
}
