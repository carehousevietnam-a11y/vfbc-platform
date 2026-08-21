"use client";

import { useId } from "react";
import type { ReviewVerdict } from "@/lib/costCheck";

const GAUGE_COLORS: Record<
  ReviewVerdict,
  { stroke: string; track: string; badge: string; glow: string; highlight: string; depth: string }
> = {
  fair: {
    stroke: "#059669",
    track: "#e2e8f0",
    badge: "bg-emerald-50 text-emerald-800",
    glow: "#10b981",
    highlight: "#6ee7b7",
    depth: "#065f46",
  },
  caution: {
    stroke: "#d97706",
    track: "#e2e8f0",
    badge: "bg-amber-50 text-amber-900",
    glow: "#f59e0b",
    highlight: "#fcd34d",
    depth: "#92400e",
  },
  risk: {
    stroke: "#dc2626",
    track: "#e2e8f0",
    badge: "bg-red-50 text-red-800",
    glow: "#ef4444",
    highlight: "#fca5a5",
    depth: "#991b1b",
  },
  very_low: {
    stroke: "#475569",
    track: "#e2e8f0",
    badge: "bg-slate-100 text-slate-700",
    glow: "#64748b",
    highlight: "#cbd5e1",
    depth: "#1e293b",
  },
};

export const STATUS_BADGE_LABEL: Record<ReviewVerdict, string> = {
  fair: "적정",
  caution: "높은편",
  risk: "높은편",
  very_low: "낮은편",
};

const STATUS_DOT: Record<ReviewVerdict, string> = {
  fair: "bg-emerald-500",
  caution: "bg-amber-500",
  risk: "bg-red-500",
  very_low: "bg-slate-500",
};

type ReviewScoreGaugeProps = {
  score?: number;
  verdict?: ReviewVerdict;
  size?: "default" | "large" | "semi" | "compact";
  empty?: boolean;
  /** 일반 범위 기준 baseline 화면 (실제 견적 점수 아님) */
  baseline?: boolean;
};

const CX = 130;
const CY = 126;
const MAIN_R = 100;
const HIGH_R = 88;
const DEPTH_R = 104;
const TRACK = "#EFF2F6";

function semiPath(r: number): string {
  return `M ${CX - r} ${CY} A ${r} ${r} 0 0 1 ${CX + r} ${CY}`;
}

function semiPoint(score: number, r: number): { x: number; y: number } {
  const t = Math.min(100, Math.max(0, score)) / 100;
  const angle = Math.PI * (1 - t);
  return {
    x: CX + r * Math.cos(angle),
    y: CY - r * Math.sin(angle),
  };
}

function MoldedSemiGauge({
  score,
  verdict,
  empty = false,
  compact = false,
  baseline = false,
  showStatusRow = false,
}: {
  score: number;
  verdict: ReviewVerdict;
  empty?: boolean;
  compact?: boolean;
  baseline?: boolean;
  showStatusRow?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const clamped = Math.min(100, Math.max(0, score));
  const palette = empty
    ? { stroke: "#94a3b8", glow: "#cbd5e1", highlight: "#e2e8f0", depth: "#475569" }
    : GAUGE_COLORS[verdict];
  const isVeryLow = !empty && verdict === "very_low";
  const knob = semiPoint(clamped, MAIN_R);
  const boxClass = compact
    ? "h-[110px] w-[180px]"
    : showStatusRow
      ? "h-[132px] w-[216px] lg:h-[160px] lg:w-[260px]"
      : "h-[124px] w-[204px] sm:h-[140px] sm:w-[230px]";

  return (
    <div className="relative mx-auto w-full max-w-[260px]" role="img" aria-label={
      baseline
        ? "일반 범위 기준 화면입니다. 금액을 입력하면 적정성을 판단합니다"
        : empty
          ? "견적을 입력하면 적정성 점수를 확인할 수 있습니다"
          : `적정성 점수 ${Math.round(clamped)}점, ${STATUS_BADGE_LABEL[verdict]}`
    }>
      <div className={`relative mx-auto ${boxClass}`}>
        <svg viewBox="0 0 260 160" className="h-full w-full overflow-visible" aria-hidden>
          <defs>
            <linearGradient id={`${uid}-bezel`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#e8edf3" />
              <stop offset="100%" stopColor="#cfd8e3" />
            </linearGradient>
            <radialGradient id={`${uid}-well`} cx="50%" cy="38%" r="72%">
              <stop offset="0%" stopColor="#1a2b4a" />
              <stop offset="100%" stopColor="#0b1b36" />
            </radialGradient>
            <linearGradient id={`${uid}-progress`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={palette.highlight} />
              <stop offset="55%" stopColor={palette.glow} />
              <stop offset="100%" stopColor={palette.stroke} />
            </linearGradient>
            <filter id={`${uid}-soft`} x="-12%" y="-12%" width="124%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#0f172a" floodOpacity="0.22" />
            </filter>
          </defs>

          {/* OUTER BEZEL */}
          <rect
            x="8"
            y="8"
            width="244"
            height="144"
            rx="28"
            fill={`url(#${uid}-bezel)`}
            filter={`url(#${uid}-soft)`}
          />
          {/* INNER DARK SURFACE */}
          <rect x="14" y="14" width="232" height="132" rx="22" fill={`url(#${uid}-well)`} />
          <rect
            x="14"
            y="14"
            width="232"
            height="132"
            rx="22"
            fill="none"
            stroke="#0a1224"
            strokeWidth="1.25"
          />

          {/* TRACK 0–100 */}
          <path d={semiPath(MAIN_R)} fill="none" stroke={TRACK} strokeWidth="20" strokeLinecap="round" />

          {!empty ? (
            <>
              {/* DEPTH under progress — larger radius, darker state color */}
              <path
                d={semiPath(DEPTH_R)}
                fill="none"
                stroke={palette.depth}
                strokeWidth="20"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={`${clamped} 100`}
                opacity="0.55"
              />
              {/* PROGRESS */}
              <path
                d={semiPath(MAIN_R)}
                fill="none"
                stroke={`url(#${uid}-progress)`}
                strokeWidth="20"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={`${clamped} 100`}
                className="transition-all duration-500 ease-out"
              />
              {/* HIGHLIGHT — inner radius so it cannot merge into the main stroke */}
              <path
                d={semiPath(HIGH_R)}
                fill="none"
                stroke="#ffffff"
                strokeOpacity="0.42"
                strokeWidth="4"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={`${clamped} 100`}
                className="transition-all duration-500 ease-out"
              />
              {/* END KNOB */}
              <circle cx={knob.x + 1.2} cy={knob.y + 3} r="11" fill={palette.depth} />
              <circle cx={knob.x} cy={knob.y} r="10" fill={palette.stroke} />
              <circle cx={knob.x - 3.2} cy={knob.y - 3.4} r="3.4" fill="#ffffff" opacity="0.72" />
            </>
          ) : null}
        </svg>

        <div className="pointer-events-none absolute inset-x-0 top-[38%] flex flex-col items-center text-center">
          {empty ? (
            <span className="max-w-[9.5rem] text-[13px] font-medium leading-snug text-slate-300">
              견적을 알려주시면
              <br />
              확인해드려요
            </span>
          ) : isVeryLow ? (
            <>
              <span className="text-xl font-bold text-white">확인 필요</span>
              <span className="mt-0.5 text-xs font-medium text-slate-300">
                ({Math.round(clamped)}점)
              </span>
            </>
          ) : (
            <>
              <span className="text-[2.35rem] font-bold leading-none tracking-tight text-white lg:text-[2.6rem]">
                {Math.round(clamped)}
              </span>
              <span className="mt-1 text-sm font-medium text-slate-300">/ 100</span>
            </>
          )}
        </div>
      </div>

      {showStatusRow && !empty && !baseline ? (
        <p className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-slate-800">
          <span className="tabular-nums">
            {Math.round(clamped)} / 100
          </span>
          <span className={`h-2 w-2 rounded-full ${STATUS_DOT[verdict]}`} aria-hidden />
          <span>{STATUS_BADGE_LABEL[verdict]}</span>
        </p>
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
  const showStatusRow = size === "large" || size === "default";
  return (
    <MoldedSemiGauge
      score={score}
      verdict={verdict}
      empty={empty}
      compact={size === "compact"}
      baseline={baseline}
      showStatusRow={showStatusRow}
    />
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
