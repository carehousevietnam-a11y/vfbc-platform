"use client";

import type { LucideIcon } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  selectionDescClasses,
  selectionSurfaceClasses,
  selectionTitleClasses,
} from "@/components/ui/selectionInteraction";

/** Mobile stitch — 가운데점·한글 분절·마지막 단어 낙오 완화 (표시만, label 의미 변경 없음) */
function formatStitchSelectionTitle(title: string): string {
  return title.replace(/·/g, "\u2060·\u2060");
}

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
  /** VERIFY — unselected cards stay quiet; color activates on selection */
  variant?: "default" | "quiet" | "stitch";
  /** Hide description on mobile list layout; PC copy stays */
  hideDescriptionOnMobile?: boolean;
  /** VERIFY Stitch SCREEN — 01, 02 … numbered badge */
  badgeNumber?: string;
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
 *   선택 시 border · shadow · lift · 텍스트 선명도(~85%) — hover 시에도 약한 lift
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
  variant = "default",
  hideDescriptionOnMobile = false,
  badgeNumber,
}: SelectionCardProps) {
  const style = TONE_STYLES[tone];
  const isQuiet = variant === "quiet";
  const isStitch = variant === "stitch";

  const radioIndicator = isStitch ? (
    selected ? (
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#0f172a]">
        <span className="h-2 w-2 rounded-full bg-[#0f172a]" />
      </span>
    ) : (
      <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-slate-300 bg-white" />
    )
  ) : selected ? (
    <CheckCircle2 className="shrink-0 text-[#0B2A6B]" size={16} />
  ) : (
    <span className="h-4 w-4 shrink-0 rounded-full border border-[#D1D5DB] bg-white" />
  );

  const iconTile = Icon && (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center transition-colors duration-200",
        isStitch
          ? "h-6 w-6 rounded-lg border border-slate-100 bg-slate-50"
          : "h-7 w-7 rounded-md sm:h-8 sm:w-8",
        !isStitch &&
          (selected
            ? isQuiet
              ? "bg-[#0B2A6B]"
              : style.selectedIconBg
            : isQuiet
              ? "bg-[#F8FAFC]"
              : style.iconBg),
      )}
    >
      <Icon
        className={
          isStitch
            ? selected
              ? "text-slate-700"
              : "text-slate-400"
            : selected
              ? isQuiet
                ? "text-white"
                : style.selectedIconText
              : isQuiet
                ? "text-[#94A3B8]"
                : style.iconText
        }
        size={isStitch ? 14 : isQuiet ? 16 : 20}
        strokeWidth={isStitch ? 1.5 : undefined}
      />
    </div>
  );

  const mobileIconCircle = Icon ? (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
        selected
          ? isQuiet
            ? "border-[#0B2A6B] bg-[#0B2A6B]"
            : cn("border-transparent", style.selectedIconBg)
          : isQuiet
            ? "border-[#D1D5DB] bg-white"
            : cn("border-transparent", style.iconBg)
      )}
    >
      <Icon
        className={
          selected
            ? isQuiet
              ? "text-white"
              : style.selectedIconText
            : isQuiet
              ? "text-[#94A3B8]"
              : style.iconText
        }
        size={isQuiet ? 15 : 16}
      />
    </div>
  ) : (
    radioIndicator
  );

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "w-full text-left",
        isStitch
          ? "rounded-xl border bg-white p-3 shadow-sm transition-all max-sm:px-3 max-sm:py-3 sm:p-3.5 lg:p-4"
          : isQuiet
            ? "h-full p-3 sm:p-3"
            : "p-5 sm:min-h-[200px] sm:p-6",
        isStitch
          ? selected
            ? "border-slate-900 bg-slate-50/40 shadow-sm lg:border-slate-900"
            : "border-slate-200 hover:border-slate-900 lg:hover:bg-slate-50/50"
          : selectionSurfaceClasses(selected, { disabled }),
        selected &&
          !isQuiet &&
          !isStitch &&
          cn("shadow-md", style.selectedBorder, style.selectedBg, style.selectedShadow),
        className,
      )}
    >
      {isStitch ? (
        <>
          {/* Mobile — Stitch SCREEN 01 numbered card + arrow circle */}
          <div className="max-[430px]:space-y-2.5 min-[431px]:flex min-[431px]:items-center min-[431px]:justify-between min-[431px]:gap-2 lg:hidden">
            <div className="min-w-0 min-[431px]:flex-1">
              <div className="flex items-start gap-2">
                {badgeNumber ? (
                  <span
                    className={cn(
                      "mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold",
                      selected
                        ? "border border-slate-200 bg-white text-slate-900"
                        : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {badgeNumber}
                  </span>
                ) : null}
                <span
                  className={cn(
                    "min-w-0 break-keep text-pretty text-[14px] font-bold leading-snug max-[430px]:text-[13.5px]",
                    selected ? "text-slate-900" : "text-slate-800",
                  )}
                >
                  {formatStitchSelectionTitle(title)}
                </span>
              </div>
              {description ? (
                <p
                  className={cn(
                    "mt-1 break-keep text-pretty text-[12px] font-normal leading-relaxed",
                    badgeNumber ? "pl-[calc(1.5rem+0.5rem)]" : undefined,
                    selected ? "text-slate-600" : "text-slate-500",
                  )}
                >
                  {formatStitchSelectionTitle(description)}
                </p>
              ) : null}
            </div>
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors max-[430px]:ml-auto",
                selected
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-500",
              )}
              aria-hidden
            >
              <span className="text-[13px] font-bold leading-none">→</span>
            </div>
          </div>

          {/* PC — Stitch SCREEN 01 horizontal numbered card */}
          <div className="hidden items-center justify-between gap-4 lg:flex">
            <div className="flex min-w-0 items-start gap-3.5">
              {badgeNumber ? (
                <span
                  className={cn(
                    "mt-0.5 inline-flex items-center justify-center rounded px-2 py-0.5 text-[11px] font-bold",
                    selected ? "bg-slate-100 text-slate-700" : "bg-slate-100 text-slate-700",
                  )}
                >
                  {badgeNumber}
                </span>
              ) : null}
              <div className="min-w-0">
                <p className="break-keep text-pretty text-[16px] font-bold leading-snug text-slate-900">
                  {formatStitchSelectionTitle(title)}
                </p>
                {description ? (
                  <p className="mt-1 break-keep text-pretty text-[13.5px] font-normal leading-normal text-slate-600">
                    {formatStitchSelectionTitle(description)}
                  </p>
                ) : null}
              </div>
            </div>
            <div
              className={cn(
                "ml-4 shrink-0 text-[18px] font-medium transition-colors",
                selected ? "text-slate-900" : "text-slate-400",
              )}
              aria-hidden
            >
              →
            </div>
          </div>
        </>
      ) : (
        <div className="hidden h-full flex-col sm:flex">
          <div className="flex items-start justify-between gap-1.5">
            {radioIndicator}
            {iconTile}
          </div>
          <div className="mt-2 flex min-h-0 flex-1 flex-col">
            <p
              className={cn(
                selectionTitleClasses(selected),
                isQuiet ? "text-[14px]" : "text-[17px]",
              )}
            >
              {title}
            </p>
            {description && (
              <p
                className={cn(
                  "mt-1",
                  selectionDescClasses(selected),
                  isQuiet ? "text-[12px]" : "text-sm leading-relaxed",
                )}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 모바일 — 가로형 리스트 (Stitch variant 제외) */}
      <div className={cn("flex min-h-[40px] items-center gap-2.5 sm:hidden", isStitch && "hidden")}>
        {mobileIconCircle}
        <div className="min-w-0 flex-1">
          <p className={cn(selectionTitleClasses(selected), "text-[14px]")}>{title}</p>
          {description && !hideDescriptionOnMobile && (
            <p className={cn(selectionDescClasses(selected), "mt-0.5 text-[12px]")}>{description}</p>
          )}
        </div>
      </div>
    </button>
  );
}
