import type { ReviewVerdict } from "@/lib/costCheck";

const GAUGE_COLORS: Record<ReviewVerdict, { stroke: string; track: string }> = {
  fair: { stroke: "#059669", track: "#d1fae5" },
  caution: { stroke: "#d97706", track: "#fef3c7" },
  risk: { stroke: "#dc2626", track: "#fee2e2" },
  very_low: { stroke: "#475569", track: "#e2e8f0" },
};

type ReviewScoreGaugeProps = {
  score: number;
  verdict: ReviewVerdict;
  label: string;
};

export function ReviewScoreGauge({ score, verdict, label }: ReviewScoreGaugeProps) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = (Math.min(100, Math.max(0, score)) / 100) * circumference;
  const { stroke, track } = GAUGE_COLORS[verdict];

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-32 w-32">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden>
          <circle cx="60" cy="60" r={radius} fill="none" stroke={track} strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-slate-900">{Math.round(score)}</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            점
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-700">{label}</p>
    </div>
  );
}

export function clampScore(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function computeReviewScore(
  bubblePercent: number | null,
  fairReference: number,
  quotedAmount: number
): number {
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
