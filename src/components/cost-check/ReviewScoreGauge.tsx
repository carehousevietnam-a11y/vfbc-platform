"use client";

import { useId } from "react";
import type { ReviewVerdict } from "@/lib/costCheck";

const GAUGE_COLORS: Record<
  ReviewVerdict,
  { stroke: string; track: string; badge: string; glow: string; highlight: string }
> = {
  fair: {
    stroke: "#059669",
    track: "#e2e8f0",
    badge: "bg-emerald-50 text-emerald-800",
    glow: "#10b981",
    highlight: "#a7f3d0",
  },
  caution: {
    stroke: "#d97706",
    track: "#e2e8f0",
    badge: "bg-amber-50 text-amber-900",
    glow: "#f59e0b",
    highlight: "#fde68a",
  },
  risk: {
    stroke: "#dc2626",
    track: "#e2e8f0",
    badge: "bg-red-50 text-red-800",
    glow: "#ef4444",
    highlight: "#fecaca",
  },
  very_low: {
    stroke: "#475569",
    track: "#e2e8f0",
    badge: "bg-slate-100 text-slate-700",
    glow: "#64748b",
    highlight: "#cbd5e1",
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

function GaugeDefs({
  uid,
  stroke,
  glow,
  highlight,
}: {
  uid: string;
  stroke: string;
  glow: string;
  highlight: string;
}) {
  return (
    <defs>
      <linearGradient id={`${uid}-track`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="45%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>
      <linearGradient id={`${uid}-progress`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={highlight} />
        <stop offset="42%" stopColor={glow} />
        <stop offset="100%" stopColor={stroke} />
      </linearGradient>
      <radialGradient id={`${uid}-face`} cx="38%" cy="28%" r="78%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="55%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#e8eef7" />
      </radialGradient>
      <radialGradient id={`${uid}-knob`} cx="32%" cy="28%" r="70%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="55%" stopColor={highlight} />
        <stop offset="100%" stopColor={stroke} />
      </radialGradient>
      <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.14" />
      </filter>
    </defs>
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
  const palette = empty
    ? { stroke: "#94a3b8", track: "#e2e8f0", glow: "#cbd5e1", highlight: "#f1f5f9" }
    : GAUGE_COLORS[verdict];
  const isVeryLow = !empty && verdict === "very_low";
  const dot = semiArcPoint(clamped);
  const progress = empty ? 0 : (clamped / 100) * SEMI_PATH_LENGTH;

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
      <div className="relative overflow-hidden rounded-[1.35rem] bg-gradient-to-b from-white via-slate-50/80 to-slate-100/70 px-1 pt-2 shadow-[0_10px_24px_rgba(15,23,42,0.07),inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-slate-200/80">
        <svg
          viewBox="0 0 360 220"
          className={
            compact ? "h-[96px] w-full" : "h-[184px] w-full sm:h-[200px] lg:h-[216px]"
          }
          aria-hidden
        >
          <GaugeDefs uid={uid} stroke={palette.stroke} glow={palette.glow} highlight={palette.highlight} />
          <path
            d={SEMI_PATH}
            fill="none"
            stroke="#0f172a"
            strokeOpacity="0.06"
            strokeWidth={compact ? 22 : 26}
            strokeLinecap="round"
            filter={`url(#${uid}-soft)`}
          />
          <path
            d={SEMI_PATH}
            fill="none"
            stroke={`url(#${uid}-track)`}
            strokeWidth={compact ? 18 : 22}
            strokeLinecap="round"
          />
          <path
            d={SEMI_PATH}
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.55"
            strokeWidth={compact ? 6 : 7}
            strokeLinecap="round"
            transform="translate(0 -5)"
          />
          {!empty ? (
            <path
              d={SEMI_PATH}
              fill="none"
              stroke={`url(#${uid}-progress)`}
              strokeWidth={compact ? 18 : 22}
              strokeLinecap="round"
              strokeDasharray={`${progress} ${SEMI_PATH_LENGTH}`}
              className="transition-all duration-500 ease-out"
            />
          ) : null}
          {!empty ? (
            <path
              d={SEMI_PATH}
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.38"
              strokeWidth={compact ? 5 : 6}
              strokeLinecap="round"
              strokeDasharray={`${progress} ${SEMI_PATH_LENGTH}`}
              transform="translate(0 -4)"
              className="transition-all duration-500 ease-out"
            />
          ) : null}
          {!empty ? (
            <>
              <circle cx={dot.x} cy={dot.y} r={compact ? 9 : 11} fill={`url(#${uid}-knob)`} />
              <circle
                cx={dot.x}
                cy={dot.y}
                r={compact ? 9 : 11}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
              />
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

  const uid = useId().replace(/:/g, "");
  const isLarge = size === "large";
  const radius = isLarge ? 72 : 56;
  const cx = 100;
  const cy = 100;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, score));
  const progress = empty ? 0 : (clamped / 100) * circumference;
  const palette = empty
    ? { stroke: "#94a3b8", track: "#e2e8f0", glow: "#cbd5e1", highlight: "#f1f5f9" }
    : GAUGE_COLORS[verdict];
  const isVeryLow = !empty && verdict === "very_low";
  const knob = circleArcPoint(clamped, cx, cy, radius);
  const boxClass = isLarge
    ? "h-[13.5rem] w-[13.5rem] sm:h-[15rem] sm:w-[15rem] lg:h-[16.25rem] lg:w-[16.25rem]"
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
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white to-slate-100 shadow-[0_14px_32px_rgba(15,23,42,0.10),inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-slate-200/90" />
      <div className="absolute inset-[9%] rounded-full bg-gradient-to-b from-[#f8fafc] to-[#e8eef7] shadow-[inset_0_8px_16px_rgba(15,23,42,0.06)]" />
      <svg className="relative h-full w-full" viewBox="0 0 200 200" aria-hidden>
        <GaugeDefs uid={uid} stroke={palette.stroke} glow={palette.glow} highlight={palette.highlight} />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#0f172a"
          strokeOpacity="0.07"
          strokeWidth={isLarge ? 22 : 18}
          filter={`url(#${uid}-soft)`}
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={`url(#${uid}-track)`}
          strokeWidth={isLarge ? 18 : 14}
        />
        <circle cx={cx} cy={cy} r={radius - (isLarge ? 14 : 11)} fill={`url(#${uid}-face)`} />
        {!empty ? (
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={`url(#${uid}-progress)`}
            strokeWidth={isLarge ? 18 : 14}
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            transform={`rotate(-90 ${cx} ${cy})`}
            className="transition-all duration-500 ease-out"
          />
        ) : null}
        {!empty ? (
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.35"
            strokeWidth={isLarge ? 6 : 5}
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            transform={`rotate(-90 ${cx} ${cy})`}
            className="transition-all duration-500 ease-out"
          />
        ) : null}
        {!empty ? (
          <>
            <circle cx={knob.x} cy={knob.y} r={isLarge ? 11 : 9} fill={`url(#${uid}-knob)`} />
            <circle
              cx={knob.x}
              cy={knob.y}
              r={isLarge ? 11 : 9}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
            />
          </>
        ) : null}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
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
