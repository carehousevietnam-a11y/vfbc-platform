"use client";

import type { LucideIcon } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";

export type SelectionCardTone =
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "purple"
  | "cyan"
  | "slate";

interface SelectionCardProps {
  title: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  icon?: LucideIcon;
  tone?: SelectionCardTone;
  disabled?: boolean;
  className?: string;
}

// STEP12-2B/2C: VFBCAI Design System — tone은 아이콘 배경/색상(기본·선택 시 각각)과
// 선택 시 카드 배경/테두리/그림자에만 영향을 준다. tone 종류(7개)는 변경하지 않는다.
// 카드 자체의 기본 배경은 항상 흰색을 유지한다.
const TONE_STYLES: Record<
  SelectionCardTone,
  {
    iconBg: string;
    iconText: string;
    selectedIconBg: string;
    selectedIconText: string;
    selectedBg: string;
    selectedBorder: string;
    selectedShadow: string;
  }
> = {
  blue: {
    iconBg: "bg-blue-100",
    iconText: "text-blue-700",
    selectedIconBg: "bg-blue-900",
    selectedIconText: "text-white",
    selectedBg: "bg-blue-50",
    selectedBorder: "border-blue-900",
    selectedShadow: "shadow-blue-900/15",
  },
  green: {
    iconBg: "bg-green-100",
    iconText: "text-green-700",
    selectedIconBg: "bg-green-700",
    selectedIconText: "text-white",
    selectedBg: "bg-green-50",
    selectedBorder: "border-green-700",
    selectedShadow: "shadow-green-700/15",
  },
  amber: {
    iconBg: "bg-amber-100",
    iconText: "text-amber-700",
    selectedIconBg: "bg-amber-600",
    selectedIconText: "text-white",
    selectedBg: "bg-amber-50",
    selectedBorder: "border-amber-600",
    selectedShadow: "shadow-amber-600/15",
  },
  red: {
    iconBg: "bg-red-100",
    iconText: "text-red-700",
    selectedIconBg: "bg-red-600",
    selectedIconText: "text-white",
    selectedBg: "bg-red-50",
    selectedBorder: "border-red-600",
    selectedShadow: "shadow-red-600/15",
  },
  purple: {
    iconBg: "bg-purple-100",
    iconText: "text-purple-700",
    selectedIconBg: "bg-purple-700",
    selectedIconText: "text-white",
    selectedBg: "bg-purple-50",
    selectedBorder: "border-purple-700",
    selectedShadow: "shadow-purple-700/15",
  },
  cyan: {
    iconBg: "bg-cyan-100",
    iconText: "text-cyan-700",
    selectedIconBg: "bg-cyan-600",
    selectedIconText: "text-white",
    selectedBg: "bg-cyan-50",
    selectedBorder: "border-cyan-600",
    selectedShadow: "shadow-cyan-600/15",
  },
  slate: {
    iconBg: "bg-slate-200",
    iconText: "text-slate-600",
    selectedIconBg: "bg-slate-700",
    selectedIconText: "text-white",
    selectedBg: "bg-slate-50",
    selectedBorder: "border-slate-600",
    selectedShadow: "shadow-slate-600/15",
  },
};

/**
 * VFBCAI 공통 UI — 라디오형 선택 카드 (Design System, Premium Polish).
 *
 * PC/태블릿(sm 이상): Premium Product Card.
 *   상단 좌우 — 라디오/체크(좌) · 44px rounded-xl 아이콘 박스(우, justify-between)
 *   그 아래   — 제목(17px, mt-6) → 설명(14px, mt-2)
 *   선택 시 border · shadow · 카드 배경 · 아이콘 박스가 함께 변화(트랜지션만, 이동 애니메이션 없음)
 *
 * 모바일(sm 미만): 가로형 리스트 — 이전 구조 그대로 유지.
 */
export default function SelectionCard({
  title,
  description,
  selected,
  onClick,
  icon: Icon,
  tone = "blue",
  disabled,
  className,
}: SelectionCardProps) {
  const style = TONE_STYLES[tone];

  const radioIndicator = selected ? (
    <CheckCircle2 className="shrink-0 text-blue-900" size={18} />
  ) : (
    <span className="h-[18px] w-[18px] shrink-0 rounded-full border border-gray-300" />
  );

  const iconTile = Icon && (
    <div
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200",
        selected ? style.selectedIconBg : style.iconBg
      )}
    >
      <Icon
        className={selected ? style.selectedIconText : style.iconText}
        size={22}
      />
    </div>
  );

  const iconBare = Icon && <Icon className={style.iconText} size={18} />;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "w-full rounded-xl border bg-white p-5 text-left transition-all duration-200 sm:p-6 sm:min-h-[200px]",
        selected
          ? cn("shadow-md", style.selectedBorder, style.selectedBg, style.selectedShadow)
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm",
        disabled && "cursor-not-allowed opacity-50 hover:border-gray-200 hover:shadow-none",
        className
      )}
    >
      {/* PC / 태블릿 — Premium Product Card */}
      <div className="hidden sm:flex sm:h-full sm:flex-col">
        <div className="flex items-start justify-between">
          {radioIndicator}
          {iconTile}
        </div>
        <p className="mt-6 break-keep text-[17px] font-semibold leading-snug text-gray-900">
          {title}
        </p>
        {description && (
          <p className="mt-2 break-keep text-sm leading-relaxed text-slate-500">
            {description}
          </p>
        )}
      </div>

      {/* 모바일 — 가로형 리스트(변경 없음) */}
      <div className="flex items-start gap-3 sm:hidden">
        <div className="flex shrink-0 flex-col items-center gap-2 pt-0.5">
          {radioIndicator}
          {iconBare}
        </div>
        <div className="min-w-0">
          <p className="break-keep text-base font-semibold text-gray-900">
            {title}
          </p>
          {description && (
            <p className="mt-1.5 break-keep text-sm leading-relaxed text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
