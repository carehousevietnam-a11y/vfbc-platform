"use client";

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

type ReviewScoreGaugeProps = {
  score?: number;
  verdict?: ReviewVerdict;
  size?: "default" | "large" | "semi" | "compact";
  empty?: boolean;
  /** 일반 범위 기준 baseline 화면 (실제 견적 점수 아님) */
  baseline?: boolean;
};

const SEMI_PATH = "M 36 188 A 144 144 0 0 1 324 188";
const SEMI_CX = 180;
const SEMI_CY = 188;
const SEMI_R = 144;

function semiArcPoint(score: number): { x: number; y: number } {
  const clamped = Math.min(100, Math.max(0, score));
  const t = (100 - clamped) / 100;
  const angle = Math.PI * (1 - t);
  return {
    x: SEMI_CX + SEMI_R * Math.cos(angle),
    y: SEMI_CY - SEMI_R * Math.sin(angle),
  };
}

function circleArcPoint(score: number, cx: number, cy: number, r: number): { x: number; y: number } {
  const clamped = Math.min(100, Math.max(0, score));
  const angle = (clamped / 100) * Math.PI * 2 - Math.PI / 2;
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

type Palette = {
  stroke: string;
  track: string;
  glow: string;
  highlight: string;
  depth: string;
};

function donutPath(cx: number, cy: number, outerR: number, innerR: number): string {
  return [
    `M ${cx} ${cy - outerR}`,
    `A ${outerR} ${outerR} 0 1 1 ${cx} ${cy + outerR}`,
    `A ${outerR} ${outerR} 0 1 1 ${cx} ${cy - outerR}`,
    "Z",
    `M ${cx} ${cy - innerR}`,
    `A ${innerR} ${innerR} 0 1 0 ${cx} ${cy + innerR}`,
    `A ${innerR} ${innerR} 0 1 0 ${cx} ${cy - innerR}`,
    "Z",
  ].join(" ");
}

function EndKnob({
  x,
  y,
  r,
  fill,
  depth,
}: {
  x: number;
  y: number;
  r: number;
  fill: string;
  depth: string;
}) {
  return (
    <g>
      <circle cx={x + 1.5} cy={y + 3.5} r={r} fill={depth} />
      <circle cx={x} cy={y} r={r - 1} fill={fill} />
      <circle cx={x - r * 0.3} cy={y - r * 0.34} r={Math.max(3, r * 0.36)} fill="#ffffff" opacity="0.7" />
    </g>
  );
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
  const palette: Palette = empty
    ? { stroke: "#94a3b8", track: "#e2e8f0", glow: "#cbd5e1", highlight: "#e2e8f0", depth: "#64748b" }
    : GAUGE_COLORS[verdict];
  const isVeryLow = !empty && verdict === "very_low";
  const dot = semiArcPoint(clamped);
  const knobR = compact ? 12 : 14;
  const SEMI_DEPTH_PATH = "M 24 193 A 156 156 0 0 1 336 193";
  const SEMI_HIGHLIGHT_PATH = "M 54 188 A 126 126 0 0 1 306 188";

  return (
    <div
      className={
        compact
          ? "relative mx-auto w-full max-w-[200px]"
          : "relative mx-auto w-full max-w-[284px] sm:max-w-[320px] lg:max-w-[352px]"
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
      <div className="relative rounded-[1.35rem] bg-white px-1 pt-2 shadow-[0_8px_20px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/90">
        <svg
          viewBox="0 0 360 220"
          className={
            compact ? "h-[96px] w-full overflow-visible" : "h-[184px] w-full overflow-visible sm:h-[200px] lg:h-[216px]"
          }
          aria-hidden
        >
          <path
            d={SEMI_DEPTH_PATH}
            fill="none"
            stroke="#334155"
            strokeWidth={compact ? 22 : 26}
            strokeLinecap="round"
          />
          <path
            d={SEMI_PATH}
            fill="none"
            stroke="#c5d0dc"
            strokeWidth={compact ? 18 : 22}
            strokeLinecap="round"
          />
          {!empty ? (
            <>
              <path
                d={SEMI_PATH}
                fill="none"
                stroke={palette.stroke}
                strokeWidth={compact ? 16 : 18}
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={`${clamped} 100`}
                className="transition-all duration-500 ease-out"
              />
              <path
                d={SEMI_HIGHLIGHT_PATH}
                fill="none"
                stroke={palette.highlight}
                strokeWidth={compact ? 5 : 6}
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={`${clamped} 100`}
                className="transition-all duration-500 ease-out"
              />
              <EndKnob x={dot.x} y={dot.y} r={knobR} fill={palette.stroke} depth={palette.depth} />
            </>
          ) : null}
        </svg>
        <div className="pointer-events-none absolute inset-x-0 top-[38%] flex flex-col items-center text-center sm:top-[40%]">
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
                    ? "text-3xl font-bold leading-none tracking-tight text-blue-950"
                    : "text-[2.35rem] font-bold leading-none tracking-tight text-blue-950 sm:text-[2.65rem]"
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
      </div>
      {!empty && !compact && !baseline ? (
        <p className="mt-2 text-center text-sm font-semibold text-slate-700">
          {STATUS_BADGE_LABEL[verdict]}
        </p>
      ) : null}
      {!empty && !compact && !baseline ? (
        <div className="mt-2 flex justify-between px-2 text-[11px] font-medium tracking-wide text-slate-400">
          <span>적정</span>
          <span>주의</span>
          <span>위험</span>
        </div>
      ) : null}
    </div>
  );
}

function CircleGauge({
  score,
  verdict,
  empty,
  isLarge,
}: {
  score: number;
  verdict: ReviewVerdict;
  empty: boolean;
  isLarge: boolean;
}) {
  const vb = 240;
  const cx = 120;
  const cy = 120;
  const outerR = isLarge ? 94 : 76;
  const innerR = isLarge ? 62 : 50;
  const mainR = isLarge ? 78 : 63;
  const mainW = isLarge ? 16 : 13;
  const highR = isLarge ? 66 : 53;
  const highW = isLarge ? 5 : 4;
  const knobR = isLarge ? 15 : 12;
  const depthY = 6;
  const clamped = Math.min(100, Math.max(0, score));
  const palette: Palette = empty
    ? { stroke: "#94a3b8", track: "#e2e8f0", glow: "#cbd5e1", highlight: "#e2e8f0", depth: "#64748b" }
    : GAUGE_COLORS[verdict];
  const isVeryLow = !empty && verdict === "very_low";
  const knob = circleArcPoint(clamped, cx, cy, mainR);
  const boxClass = isLarge
    ? "h-[13.5rem] w-[13.5rem] lg:h-[16.25rem] lg:w-[16.25rem]"
    : "h-36 w-36";

  return (
    <div
      className={`relative mx-auto ${boxClass}`}
      role="img"
      aria-label={
        empty
          ? "견적을 입력하면 적정성 점수를 확인할 수 있습니다"
          : `적정성 점수 ${Math.round(clamped)}점, ${STATUS_BADGE_LABEL[verdict]}`
      }
    >
      <div className="absolute inset-0 rounded-full bg-white ring-1 ring-slate-200/80" />
      <div className="absolute inset-[24%] rounded-full bg-white shadow-[inset_0_6px_10px_rgba(15,23,42,0.10)]" />
      <svg className="relative h-full w-full overflow-visible" viewBox={`0 0 ${vb} ${vb}`} aria-hidden>
        {/* ① DEPTH: filled donut, 6px down, darker — different geometry from main */}
        <path
          d={donutPath(cx, cy + depthY, outerR + 1, innerR - 1)}
          fill="#334155"
          fillOpacity="0.38"
          fillRule="evenodd"
        />
        {/* BASE RING: filled donut so it reads as a ring body, not a round-cap stroke */}
        <path d={donutPath(cx, cy, outerR, innerR)} fill="#d5dee8" fillRule="evenodd" />
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="#64748b" strokeWidth="2.5" />
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="#94a3b8" strokeWidth="2.5" />
        {!empty ? (
          <>
            {/* ② MAIN RING: centerline of the donut, solid status color */}
            <circle
              cx={cx}
              cy={cy}
              r={mainR}
              fill="none"
              stroke={palette.stroke}
              strokeWidth={mainW}
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${clamped} 100`}
              transform={`rotate(-90 ${cx} ${cy})`}
              className="transition-all duration-500 ease-out"
            />
            {/* ③ HIGHLIGHT: inner radius — pixel band does not overlap main */}
            <circle
              cx={cx}
              cy={cy}
              r={highR}
              fill="none"
              stroke={palette.highlight}
              strokeWidth={highW}
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${clamped} 100`}
              transform={`rotate(-90 ${cx} ${cy})`}
              className="transition-all duration-500 ease-out"
            />
            {/* ④ END KNOB: darker base + body + highlight */}
            <EndKnob x={knob.x} y={knob.y} r={knobR} fill={palette.stroke} depth={palette.depth} />
          </>
        ) : null}
      </svg>
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-3 text-center">
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
            <span
              className={`font-bold leading-none tracking-tight text-blue-950 ${
                isLarge ? "text-[2.65rem] sm:text-5xl" : "text-3xl"
              }`}
            >
              {Math.round(score)}
            </span>
            <span className={`mt-1 font-medium text-slate-400 ${isLarge ? "text-sm" : "text-xs"}`}>
              / 100
            </span>
          </>
        )}
      </div>
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

  return (
    <CircleGauge
      score={score}
      verdict={verdict}
      empty={empty}
      isLarge={size === "large"}
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
