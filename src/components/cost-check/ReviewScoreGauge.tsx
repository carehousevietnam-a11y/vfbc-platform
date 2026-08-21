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
const CY = 136;
const TRACK = "#EFF2F6";
const START_DEG = 180;

function polar(r: number, deg: number): { x: number; y: number } {
  const rad = (deg * Math.PI) / 180;
  return {
    x: CX + r * Math.cos(rad),
    y: CY - r * Math.sin(rad),
  };
}

function housingPath(r: number, chin: number): string {
  const left = CX - r;
  const right = CX + r;
  const bottom = CY + chin;
  return `M ${left} ${CY} A ${r} ${r} 0 0 1 ${right} ${CY} L ${right} ${bottom} Q ${CX} ${bottom + 7} ${left} ${bottom} Z`;
}

/** Filled semi-annulus from 180° (left) toward 0° (right) through the top. */
function annularSector(rInner: number, rOuter: number, startDeg: number, endDeg: number): string {
  const span = (startDeg - endDeg + 360) % 360;
  if (span < 0.4) return "";
  const large = span > 180 ? 1 : 0;
  const p1 = polar(rOuter, startDeg);
  const p2 = polar(rOuter, endDeg);
  const p3 = polar(rInner, endDeg);
  const p4 = polar(rInner, startDeg);
  return [
    `M ${p1.x.toFixed(3)} ${p1.y.toFixed(3)}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${p2.x.toFixed(3)} ${p2.y.toFixed(3)}`,
    `L ${p3.x.toFixed(3)} ${p3.y.toFixed(3)}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${p4.x.toFixed(3)} ${p4.y.toFixed(3)}`,
    "Z",
  ].join(" ");
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
  const endDeg = START_DEG - (clamped / 100) * 180;
  const tubeMidR = 88;
  const knob = polar(tubeMidR, endDeg);
  const trackLeft = polar(tubeMidR, START_DEG);
  const trackRight = polar(tubeMidR, 0);
  const boxClass = compact
    ? "h-[110px] w-[180px]"
    : showStatusRow
      ? "h-[132px] w-[216px] lg:h-[160px] lg:w-[260px]"
      : "h-[124px] w-[204px] sm:h-[140px] sm:w-[230px]";

  const groove = annularSector(72, 104, START_DEG, 0);
  const trackFloor = annularSector(78, 98, START_DEG, 0);
  const progressBody = empty ? "" : annularSector(78, 98, START_DEG, endDeg);
  const progressDepth = empty ? "" : annularSector(92, 98, START_DEG, endDeg);
  const progressHighlight = empty ? "" : annularSector(78, 84, START_DEG, endDeg);

  return (
    <div
      className="relative mx-auto w-full max-w-[260px]"
      role="img"
      aria-label={
        baseline
          ? "일반 범위 기준 화면입니다. 금액을 입력하면 적정성을 판단합니다"
          : empty
            ? "견적을 입력하면 적정성 점수를 확인할 수 있습니다"
            : `적정성 점수 ${Math.round(clamped)}점, ${STATUS_BADGE_LABEL[verdict]}`
      }
    >
      <div className={`relative mx-auto ${boxClass}`}>
        <svg viewBox="0 0 260 160" className="h-full w-full overflow-visible" aria-hidden>
          <defs>
            <linearGradient id={`${uid}-bezel`} x1="18%" y1="0%" x2="82%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="42%" stopColor="#eef2f6" />
              <stop offset="100%" stopColor="#c5d0dc" />
            </linearGradient>
            <linearGradient id={`${uid}-lip`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#9aa8b8" />
              <stop offset="100%" stopColor="#6b7c8f" />
            </linearGradient>
            <radialGradient id={`${uid}-well`} cx="50%" cy="62%" r="78%">
              <stop offset="0%" stopColor="#1c3358" />
              <stop offset="55%" stopColor="#0e1f3c" />
              <stop offset="100%" stopColor="#071226" />
            </radialGradient>
            <linearGradient id={`${uid}-tube`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={palette.highlight} />
              <stop offset="38%" stopColor={palette.glow} />
              <stop offset="100%" stopColor={palette.stroke} />
            </linearGradient>
            <radialGradient id={`${uid}-knob`} cx="32%" cy="28%" r="72%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="28%" stopColor={palette.highlight} />
              <stop offset="62%" stopColor={palette.stroke} />
              <stop offset="100%" stopColor={palette.depth} />
            </radialGradient>
            <filter id={`${uid}-body`} x="-18%" y="-18%" width="136%" height="150%">
              <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#0f172a" floodOpacity="0.22" />
            </filter>
          </defs>

          {/* OUTER BEZEL — D-shaped molded housing */}
          <path d={housingPath(118, 16)} fill={`url(#${uid}-bezel)`} filter={`url(#${uid}-body)`} />
          {/* Inner lip (separate geometry from the well) */}
          <path d={housingPath(112, 12)} fill={`url(#${uid}-lip)`} />
          {/* INNER DARK SURFACE — recessed navy well */}
          <path d={housingPath(108, 9)} fill={`url(#${uid}-well)`} />
          <path
            d={housingPath(108, 9)}
            fill="none"
            stroke="#030814"
            strokeWidth="2.25"
            strokeOpacity="0.55"
          />
          <ellipse cx={CX} cy={CY - 46} rx="70" ry="28" fill="#ffffff" opacity="0.07" />

          {/* GROOVE walls — wide carved channel, not a stroke */}
          <path d={groove} fill="#050d1c" />
          <circle cx={trackLeft.x} cy={trackLeft.y} r="16" fill="#050d1c" />
          <circle cx={trackRight.x} cy={trackRight.y} r="16" fill="#050d1c" />

          {/* TRACK 0–100 */}
          <path d={trackFloor} fill={TRACK} />
          <circle cx={trackLeft.x} cy={trackLeft.y} r="10" fill={TRACK} />
          <circle cx={trackRight.x} cy={trackRight.y} r="10" fill={TRACK} />

          {!empty && progressBody ? (
            <>
              {/* PROGRESS tube body */}
              <path d={progressBody} fill={`url(#${uid}-tube)`} />
              <circle cx={trackLeft.x} cy={trackLeft.y} r="10" fill={palette.stroke} />
              {/* DEPTH — outer radius of the tube only */}
              <path d={progressDepth} fill={palette.depth} opacity="0.55" />
              {/* HIGHLIGHT — inner radius of the tube only */}
              <path d={progressHighlight} fill="#ffffff" opacity="0.38" />
              {/* END KNOB — 3D sphere */}
              <circle cx={knob.x + 1.4} cy={knob.y + 3.2} r="13" fill={palette.depth} opacity="0.7" />
              <circle cx={knob.x} cy={knob.y} r="12" fill={`url(#${uid}-knob)`} />
              <circle cx={knob.x - 3.6} cy={knob.y - 4} r="3.6" fill="#ffffff" opacity="0.85" />
            </>
          ) : null}
        </svg>

        <div className="pointer-events-none absolute inset-x-0 top-[42%] flex flex-col items-center text-center">
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
          <span className="tabular-nums">{Math.round(clamped)} / 100</span>
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
