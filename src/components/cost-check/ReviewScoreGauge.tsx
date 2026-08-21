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

function GaugeDefs({ uid, palette }: { uid: string; palette: Palette }) {
  return (
    <defs>
      <radialGradient id={`${uid}-knob`} cx="30%" cy="26%" r="72%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="38%" stopColor={palette.highlight} />
        <stop offset="100%" stopColor={palette.stroke} />
      </radialGradient>
      <radialGradient id={`${uid}-knob-base`} cx="50%" cy="58%" r="58%">
        <stop offset="0%" stopColor={palette.stroke} />
        <stop offset="100%" stopColor={palette.depth} />
      </radialGradient>
    </defs>
  );
}

function EndKnob({
  x,
  y,
  r,
  uid,
}: {
  x: number;
  y: number;
  r: number;
  uid: string;
}) {
  const highlightR = Math.max(3.2, r * 0.34);
  return (
    <g>
      <ellipse
        cx={x + r * 0.12}
        cy={y + r * 0.38}
        rx={r * 0.92}
        ry={r * 0.58}
        fill="#0f172a"
        opacity="0.22"
      />
      <circle cx={x + 1.1} cy={y + 2.2} r={r} fill={`url(#${uid}-knob-base)`} />
      <circle cx={x} cy={y} r={r - 1.4} fill={`url(#${uid}-knob)`} />
      <circle
        cx={x - r * 0.28}
        cy={y - r * 0.32}
        r={highlightR}
        fill="#ffffff"
        opacity="0.42"
      />
      <circle
        cx={x}
        cy={y}
        r={r - 1.4}
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.7"
        strokeWidth="1.6"
      />
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
  const uid = useId().replace(/:/g, "");
  const clamped = Math.min(100, Math.max(0, score));
  const palette: Palette = empty
    ? { stroke: "#94a3b8", track: "#e2e8f0", glow: "#cbd5e1", highlight: "#e2e8f0", depth: "#64748b" }
    : GAUGE_COLORS[verdict];
  const isVeryLow = !empty && verdict === "very_low";
  const dot = semiArcPoint(clamped);
  const progress = empty ? 0 : (clamped / 100) * SEMI_PATH_LENGTH;
  const trackW = compact ? 22 : 26;
  const grooveW = compact ? 14 : 16;
  const progressW = compact ? 16 : 18;
  const highlightW = compact ? 5 : 6;
  const knobR = compact ? 12 : 14;
  const depth = 2.5;

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
          <GaugeDefs uid={uid} palette={palette} />
          {/* ① BACK DEPTH RING */}
          <path
            d={SEMI_PATH}
            fill="none"
            stroke="#0f172a"
            strokeOpacity="0.16"
            strokeWidth={trackW + 2}
            strokeLinecap="round"
            transform={`translate(0 ${depth})`}
          />
          {/* ② BASE RING */}
          <path
            d={SEMI_PATH}
            fill="none"
            stroke="#7d8ea0"
            strokeWidth={trackW}
            strokeLinecap="round"
          />
          <path
            d={SEMI_PATH}
            fill="none"
            stroke="#e8eef5"
            strokeWidth={grooveW}
            strokeLinecap="round"
          />
          {!empty ? (
            <>
              <path
                d={SEMI_PATH}
                fill="none"
                stroke={palette.depth}
                strokeOpacity="0.42"
                strokeWidth={progressW}
                strokeLinecap="round"
                strokeDasharray={`${progress} ${SEMI_PATH_LENGTH}`}
                transform={`translate(0 ${depth})`}
              />
              {/* ③ MAIN PROGRESS RING */}
              <path
                d={SEMI_PATH}
                fill="none"
                stroke={palette.stroke}
                strokeWidth={progressW}
                strokeLinecap="round"
                strokeDasharray={`${progress} ${SEMI_PATH_LENGTH}`}
                className="transition-all duration-500 ease-out"
              />
              {/* ④ HIGHLIGHT EDGE */}
              <path
                d={SEMI_PATH}
                fill="none"
                stroke={palette.highlight}
                strokeOpacity="0.9"
                strokeWidth={highlightW}
                strokeLinecap="round"
                strokeDasharray={`${progress} ${SEMI_PATH_LENGTH}`}
                transform="translate(0 -2)"
                className="transition-all duration-500 ease-out"
              />
              {/* ⑤ END KNOB */}
              <EndKnob x={dot.x} y={dot.y} r={knobR} uid={uid} />
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
  const uid = useId().replace(/:/g, "");
  const vb = 220;
  const cx = 110;
  const cy = 110;
  const radius = isLarge ? 78 : 62;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, score));
  const progress = empty ? 0 : (clamped / 100) * circumference;
  const palette: Palette = empty
    ? { stroke: "#94a3b8", track: "#e2e8f0", glow: "#cbd5e1", highlight: "#e2e8f0", depth: "#64748b" }
    : GAUGE_COLORS[verdict];
  const isVeryLow = !empty && verdict === "very_low";
  const knob = circleArcPoint(clamped, cx, cy, radius);
  const depthY = 2.5;
  const trackW = isLarge ? 24 : 20;
  const grooveW = isLarge ? 16 : 13;
  const progressW = isLarge ? 16 : 13;
  const highlightW = isLarge ? 5 : 4;
  const knobR = isLarge ? 14 : 11;
  const highlightR = radius - progressW / 2 + 1;
  const highlightCirc = 2 * Math.PI * highlightR;
  const highlightProgress = empty ? 0 : (clamped / 100) * highlightCirc;
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
      <div className="absolute inset-0 rounded-full bg-white shadow-[0_10px_22px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/90" />
      <div className="absolute inset-[21%] rounded-full bg-white shadow-[inset_0_8px_14px_rgba(15,23,42,0.10)] ring-1 ring-slate-200/70" />
      <svg className="relative h-full w-full overflow-visible" viewBox={`0 0 ${vb} ${vb}`} aria-hidden>
        <GaugeDefs uid={uid} palette={palette} />
        {/* ① BACK DEPTH RING */}
        <circle
          cx={cx}
          cy={cy + depthY}
          r={radius}
          fill="none"
          stroke="#0f172a"
          strokeOpacity="0.16"
          strokeWidth={trackW + 2}
        />
        {/* ② BASE RING — groove wall + floor */}
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#7d8ea0" strokeWidth={trackW} />
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#e8eef5" strokeWidth={grooveW} />
        {!empty ? (
          <>
            <circle
              cx={cx}
              cy={cy + depthY}
              r={radius}
              fill="none"
              stroke={palette.depth}
              strokeOpacity="0.45"
              strokeWidth={progressW}
              strokeLinecap="round"
              strokeDasharray={`${progress} ${circumference}`}
              transform={`rotate(-90 ${cx} ${cy + depthY})`}
            />
            {/* ③ MAIN PROGRESS RING */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={palette.stroke}
              strokeWidth={progressW}
              strokeLinecap="round"
              strokeDasharray={`${progress} ${circumference}`}
              transform={`rotate(-90 ${cx} ${cy})`}
              className="transition-all duration-500 ease-out"
            />
            {/* ④ HIGHLIGHT EDGE */}
            <circle
              cx={cx}
              cy={cy}
              r={highlightR}
              fill="none"
              stroke={palette.highlight}
              strokeOpacity="0.92"
              strokeWidth={highlightW}
              strokeLinecap="round"
              strokeDasharray={`${highlightProgress} ${highlightCirc}`}
              transform={`rotate(-90 ${cx} ${cy})`}
              className="transition-all duration-500 ease-out"
            />
            {/* ⑤ END KNOB */}
            <EndKnob x={knob.x} y={knob.y} r={knobR} uid={uid} />
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
