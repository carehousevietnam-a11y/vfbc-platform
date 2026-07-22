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

// STEP12-2B: VFBCAI Design System — tone은 아래 5개 속성에만 영향을 준다.
// (icon background / icon color / selected background / selected border / selected shadow)
// 카드 자체의 기본 배경은 항상 흰색을 유지한다.
const TONE_STYLES: Record<
  SelectionCardTone,
  {
    iconBg: string;
    iconText: string;
    selectedBg: string;
    selectedBorder: string;
    selectedShadow: string;
  }
> = {
  blue: {
    iconBg: "bg-blue-50",
    iconText: "text-blue-600",
    selectedBg: "bg-blue-50",
    selectedBorder: "border-blue-900",
    selectedShadow: "shadow-blue-900/10",
  },
  green: {
    iconBg: "bg-green-50",
    iconText: "text-green-600",
    selectedBg: "bg-green-50",
    selectedBorder: "border-green-700",
    selectedShadow: "shadow-green-700/10",
  },
  amber: {
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
    selectedBg: "bg-amber-50",
    selectedBorder: "border-amber-600",
    selectedShadow: "shadow-amber-600/10",
  },
  red: {
    iconBg: "bg-red-50",
    iconText: "text-red-600",
    selectedBg: "bg-red-50",
    selectedBorder: "border-red-600",
    selectedShadow: "shadow-red-600/10",
  },
  purple: {
    iconBg: "bg-purple-50",
    iconText: "text-purple-600",
    selectedBg: "bg-purple-50",
    selectedBorder: "border-purple-700",
    selectedShadow: "shadow-purple-700/10",
  },
  cyan: {
    iconBg: "bg-cyan-50",
    iconText: "text-cyan-600",
    selectedBg: "bg-cyan-50",
    selectedBorder: "border-cyan-600",
    selectedShadow: "shadow-cyan-600/10",
  },
  slate: {
    iconBg: "bg-slate-100",
    iconText: "text-slate-500",
    selectedBg: "bg-slate-50",
    selectedBorder: "border-slate-600",
    selectedShadow: "shadow-slate-600/10",
  },
};

/**
 * VFBCAI 공통 UI — 라디오형 선택 카드 (Design System).
 *
 * PC/태블릿(sm 이상): Premium Product Card.
 *   상단 좌우 — 라디오/체크(좌) · 36px rounded-xl 아이콘 박스(우, justify-between)
 *   그 아래   — 제목(mt-6) → 설명(mt-1.5)
 *
 * 모바일(sm 미만): 가로형 리스트.
 *   좌측 — 라디오/체크 + 아이콘(세로 스택)
 *   우측 — 제목 · 설명
 *
 * tone은 아이콘 배경/색상, 선택 시 배경/테두리/그림자에만 적용된다.
 * 카드의 기본 배경은 항상 흰색이며, 미선택 테두리는 항상 중립 회색이다.
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
        "flex h-9 w-9 items-center justify-center rounded-xl",
        style.iconBg
      )}
    >
      <Icon className={style.iconText} size={20} />
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
        "w-full rounded-xl border bg-white p-5 text-left transition-all duration-200 sm:p-6 sm:min-h-[180px]",
        selected
          ? cn("shadow-md", style.selectedBorder, style.selectedBg, style.selectedShadow)
          : "border-gray-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm",
        disabled && "cursor-not-allowed opacity-50 hover:translate-y-0 hover:shadow-none",
        className
      )}
    >
      {/* PC / 태블릿 — Premium Product Card */}
      <div className="hidden sm:flex sm:h-full sm:flex-col">
        <div className="flex items-start justify-between">
          {radioIndicator}
          {iconTile}
        </div>
        <p className="mt-6 break-keep text-base font-semibold text-gray-900">
          {title}
        </p>
        {description && (
          <p className="mt-1.5 break-keep text-sm leading-relaxed text-slate-500">
            {description}
          </p>
        )}
      </div>

      {/* 모바일 — 가로형 리스트 */}
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
