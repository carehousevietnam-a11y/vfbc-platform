import type { ReactNode } from "react";

export type FunnelEngine = "check" | "verify" | "register";

export const FUNNEL_TOP_BAR = "h-[3px] bg-blue-900";

export const FUNNEL_PAGE = "min-h-screen overflow-x-hidden bg-white";

export const FUNNEL_CONTAINER =
  "mx-auto w-full max-w-[960px] px-4 py-8 sm:px-6 sm:py-9";

/** 질문 단계 inner column — outer shell(960px)과 분리해 카드 밀도 유지 */
export const FUNNEL_QUESTION_COLUMN = "mx-auto w-full max-w-xl";

export function funnelContainerClass(width: "default" | "wide" = "default") {
  if (width === "wide") return `${FUNNEL_CONTAINER} max-w-4xl`;
  return FUNNEL_CONTAINER;
}

export const FUNNEL_EYEBROW =
  "text-[10.5px] font-semibold uppercase tracking-widest text-[#94A3B8]";

export const FUNNEL_H1 =
  "text-[19px] font-semibold tracking-tight text-gray-900 sm:text-xl";

export const FUNNEL_DESC =
  "break-keep text-[12.5px] leading-[1.55] text-[#556070] [overflow-wrap:normal]";

export const FUNNEL_ENGINE_COPY: Record<
  FunnelEngine,
  { action: string; expert: string; eyebrow: string }
> = {
  check: {
    action: "직접확인하기",
    expert: "베트남 행정전문 AI",
    eyebrow: "직접확인하기 · 베트남 행정전문 AI",
  },
  verify: {
    action: "직접검토하기",
    expert: "베트남 법률전문 AI",
    eyebrow: "직접검토하기 · 베트남 법률전문 AI",
  },
  register: {
    action: "직접허가받기",
    expert: "베트남 인허가전문 AI",
    eyebrow: "직접허가받기 · 베트남 인허가전문 AI",
  },
};

export type FunnelPageShellProps = {
  engine: FunnelEngine;
  width?: "default" | "wide";
  children: ReactNode;
};
