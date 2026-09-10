import type { ReactNode } from "react";

export type FunnelEngine = "check" | "verify" | "register";

/** SiteHeader 아래 구분선 — 얇고 subtle (굵은 Deep Navy bar 사용 금지) */
export const FUNNEL_TOP_BAR = "h-px bg-slate-200";

export const FUNNEL_PAGE = "min-h-screen overflow-x-hidden bg-white";

export const FUNNEL_CONTAINER =
  "mx-auto w-full max-w-[960px] px-4 py-8 sm:px-6 sm:py-9";

/** 질문 단계 inner column — outer shell(960px)과 분리해 카드 밀도 유지 */
export const FUNNEL_QUESTION_COLUMN = "mx-auto w-full max-w-xl";

export function funnelContainerClass(width: "default" | "wide" | "master" = "default") {
  if (width === "master") {
    // TRC Master UI — 기존 TRC 기준폭 960px (확대 폭 사용 금지)
    return FUNNEL_CONTAINER;
  }
  if (width === "wide") return `${FUNNEL_CONTAINER} max-w-4xl`;
  return FUNNEL_CONTAINER;
}

export const FUNNEL_EYEBROW =
  "text-[10.5px] font-semibold uppercase tracking-widest text-[#94A3B8]";

export const FUNNEL_H1 =
  "text-[19px] font-semibold tracking-tight text-gray-900 sm:text-xl";

export const FUNNEL_DESC =
  "break-keep text-[12.5px] leading-[1.55] text-[#556070] [overflow-wrap:normal]";

/** REGISTER Mobile hero only — 공용 FUNNEL_H1/DESC는 CHECK·VERIFY용으로 유지 */
export const FUNNEL_REGISTER_H1 =
  "text-[22px] font-semibold tracking-tight text-gray-900 sm:text-xl";

export const FUNNEL_REGISTER_DESC =
  "break-keep text-[15px] leading-[1.55] text-[#556070] [overflow-wrap:normal] sm:text-[12.5px] sm:leading-[1.55]";

/** REGISTER 인허가 받기(lookup) 상단 설명 — Mobile 한 줄·보조 텍스트 */
export const REGISTER_LOOKUP_HERO_DESCRIPTION =
  "정부 수수료와 시장 대행료를 먼저 확인한 뒤, 준비 상태를 직접 확인하세요.";

export const FUNNEL_REGISTER_LOOKUP_DESC =
  "max-sm:text-[11px] max-[389px]:text-[10.5px] max-sm:font-normal max-sm:leading-none max-sm:tracking-tight max-sm:text-[#64748B] max-sm:whitespace-nowrap sm:text-[12.5px] sm:leading-[1.55] sm:text-[#556070] sm:whitespace-normal";

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
  width?: "default" | "wide" | "master";
  children: ReactNode;
};
