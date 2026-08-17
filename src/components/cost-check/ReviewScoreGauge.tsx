"use client";

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
  size?: "default" | "large" | "semi" | "compact";
  empty?: boolean;
  /** 일반 범위 기준 baseline 화면 (실제 견적 점수 아님) */
  baseline?: boolean;
};

const SEMI_PATH = "M 36 188 A 144 144 0 0 1 324 188";
const SEMI_PATH_LENGTH = Math.PI * 144;

function semiArcPoint(score: number): { x: number; y: number } {
  const clamped = Math.min(100, Math.max(0, score));
  const t = (100 - clamped) / 100;
  const angle = Math.PI * (1 - t);
  const cx = 180;
  const cy = 188;
  const r = 144;
  return {
    x: cx + r * Math.cos(angle),
    y: cy - r * Math.sin(angle),
  };
}

function SemiCircleGauge({
  score,
  verdict,
  empty = false,
  compact = false,
  baseline = false,
}: {
  score: number;
  verdict: ReviewVerdict;
  empty?: boolean;
  compact?: boolean;
  baseline?: boolean;
}) {
  const clamped = Math.min(100, Math.max(0, score));
  const { stroke, track } = empty
    ? { stroke: "#cbd5e1", track: "#e2e8f0" }
    : GAUGE_COLORS[verdict];
  const isVeryLow = !empty && verdict === "very_low";
  const dot = semiArcPoint(clamped);
  const progress = empty ? 0 : (clamped / 100) * SEMI_PATH_LENGTH;

  return (
    <div
      className={
        compact
          ? "relative mx-auto w-full max-w-[200px]"
          : "relative mx-auto w-full max-w-[300px] sm:max-w-[340px] lg:max-w-[360px]"
      }
      role="img"
      aria-label={
        baseline
          ? "일반 범위 기준 화면입니다. 금액을 입력하면 적정성을 판단합니다"
          : empty
            ? "견적을 입력하면 적정성 점수를 확인할 수 있습니다"
            : `적정성 점수 ${Math.round(clamped)}점, ${STATUS_BADGE_LABEL[verdict]}`
      }
    >
      <svg
        viewBox="0 0 360 220"
        className={
          compact
            ? "h-[96px] w-full"
            : "h-[170px] w-full sm:h-[200px] lg:h-[210px]"
        }
        aria-hidden
      >
        <path d={SEMI_PATH} fill="none" stroke={track} strokeWidth={16} strokeLinecap="round" />
        {!empty ? (
          <path
            d={SEMI_PATH}
            fill="none"
            stroke={stroke}
            strokeWidth={16}
            strokeLinecap="round"
            strokeDasharray={`${progress} ${SEMI_PATH_LENGTH}`}
            className="transition-all duration-500 ease-out"
          />
        ) : null}
        {!empty ? (
          <>
            <circle
              cx={dot.x}
              cy={dot.y}
              r={7}
              fill="#ffffff"
              stroke={stroke}
              strokeWidth={3}
              className="transition-all duration-500 ease-out"
            />
            <circle
              cx={dot.x}
              cy={dot.y}
              r={3}
              fill={stroke}
              className="transition-all duration-500 ease-out"
            />
          </>
        ) : null}
      </svg>
      <div className="pointer-events-none absolute inset-x-0 top-[36%] flex flex-col items-center text-center sm:top-[38%]">
        {empty ? (
          <span className="max-w-[10rem] text-sm font-medium leading-snug text-slate-400">
            견적을 알려주시면
            <br />
            확인해드려요
          </span>
        ) : isVeryLow ? (
          <>
            <span className="text-xl font-bold text-slate-700 sm:text-2xl">확인 필요</span>
            <span className="mt-0.5 text-sm font-medium text-slate-500">
              ({Math.round(clamped)}점)
            </span>
          </>
        ) : (
          <>
            <span
              className={
                compact
                  ? "text-3xl font-bold leading-none text-slate-900"
                  : "text-5xl font-bold leading-none text-slate-900 sm:text-[3.25rem]"
              }
            >
              {Math.round(clamped)}
            </span>
            <span className={`mt-0.5 font-medium text-slate-400 ${compact ? "text-xs" : "text-sm"}`}>
              / 100
            </span>
          </>
        )}
      </div>
      {!empty && !compact && !baseline ? (
        <p className="mt-1 text-center text-sm font-medium text-slate-600">
          {STATUS_BADGE_LABEL[verdict]}
        </p>
      ) : null}
      {!empty && !compact && !baseline ? (
        <div className="mt-2 flex justify-between px-1 text-xs text-slate-400">
          <span>적정</span>
          <span>주의</span>
          <span>위험</span>
        </div>
      ) : null}
    </div>
  );
}

export function ReviewScoreGauge({
  score = 0,
  verdict = "fair",
  size = "default",
  empty = false,
  baseline = false,
}: ReviewScoreGaugeProps) {
  if (size === "semi" || size === "compact") {
    return (
      <SemiCircleGauge
        score={score}
        verdict={verdict}
        empty={empty}
        compact={size === "compact"}
        baseline={baseline}
      />
    );
  }

  const isLarge = size === "large";
  const radius = isLarge ? 68 : 52;
  const circumference = 2 * Math.PI * radius;
  const progress = empty ? 0 : (Math.min(100, Math.max(0, score)) / 100) * circumference;
  const { stroke, track } = empty
    ? { stroke: "#cbd5e1", track: "#e2e8f0" }
    : GAUGE_COLORS[verdict];
  const isVeryLow = !empty && verdict === "very_low";
  const boxClass = isLarge ? "h-44 w-44" : "h-32 w-32";
  const strokeWidth = isLarge ? "12" : "10";

  return (
    <div className={`relative ${boxClass}`}>
      <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160" aria-hidden>
        <circle cx="80" cy="80" r={radius} fill="none" stroke={track} strokeWidth={strokeWidth} />
        {!empty ? (
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            className="transition-all duration-500 ease-out"
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
        {empty ? (
          <span className="text-sm font-medium leading-snug text-slate-400">
            견적을 알려주시면
            <br />
            확인해드려요
          </span>
        ) : isVeryLow ? (
          <>
            <span className={`font-bold leading-tight text-slate-700 ${isLarge ? "text-xl" : "text-lg"}`}>
              확인 필요
            </span>
            <span className={`mt-0.5 font-medium text-slate-500 ${isLarge ? "text-sm" : "text-xs"}`}>
              ({Math.round(score)}점)
            </span>
          </>
        ) : (
          <>
            <span className={`font-bold text-slate-900 ${isLarge ? "text-5xl" : "text-3xl"}`}>
              {Math.round(score)}
            </span>
            <span className={`font-medium text-slate-400 ${isLarge ? "text-sm" : "text-xs"}`}>
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

export function formatBubbleHint(bubblePercent: number): string {
  const rounded = Math.round(bubblePercent);
  if (rounded > 0) return `일반 시장 범위보다 약 ${rounded}% 높습니다`;
  if (rounded < 0) return `일반 시장 범위보다 약 ${Math.abs(rounded)}% 낮습니다`;
  return "일반 시장 범위와 비슷합니다";
}
