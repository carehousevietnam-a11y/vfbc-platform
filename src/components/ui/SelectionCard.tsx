"use client";

import type { LucideIcon } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";

interface SelectionCardProps {
  title: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
}

/**
 * VFBCAI 공통 UI — 라디오형 선택 카드.
 *
 * PC/태블릿(sm 이상): 세로형 Product Card.
 *   상단 좌우 — 라디오/체크(좌) · 아이콘(우, justify-between)
 *   그 아래   — 제목(mt-5) → 설명(mt-1.5)
 *
 * 모바일(sm 미만): 가로형 리스트.
 *   좌측 — 라디오/체크 + 아이콘(세로 스택)
 *   우측 — 제목 · 설명
 *
 * 선택 시: 네이비 테두리 + 연한 네이비 배경 + 체크 표시 + 미세 그림자
 * 미선택: 흰 배경 + 연회색 테두리 + hover 시 살짝 떠오르는 애니메이션
 */
export default function SelectionCard({
  title,
  description,
  selected,
  onClick,
  icon: Icon,
  disabled,
  className,
}: SelectionCardProps) {
  const radioIndicator = selected ? (
    <CheckCircle2 className="shrink-0 text-blue-900" size={18} />
  ) : (
    <span className="h-[18px] w-[18px] shrink-0 rounded-full border border-gray-300" />
  );

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "w-full rounded-xl border p-5 text-left transition-all duration-200 sm:p-6 sm:min-h-[168px]",
        selected
          ? "border-blue-900 bg-blue-50 shadow-sm"
          : "border-gray-200 bg-white hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm",
        disabled && "cursor-not-allowed opacity-50 hover:translate-y-0 hover:shadow-none",
        className
      )}
    >
      {/* PC / 태블릿 — 세로형 */}
      <div className="hidden sm:flex sm:h-full sm:flex-col">
        <div className="flex items-start justify-between">
          {radioIndicator}
          {Icon && (
            <Icon
              className={selected ? "text-blue-900" : "text-gray-400"}
              size={18}
            />
          )}
        </div>
        <p className="mt-5 break-keep text-base font-semibold text-gray-900">
          {title}
        </p>
        {description && (
          <p className="mt-1.5 break-keep text-sm leading-relaxed text-slate-500">
            {description}
          </p>
        )}
      </div>

      {/* 모바일 — 가로형 */}
      <div className="flex items-start gap-3 sm:hidden">
        <div className="flex shrink-0 flex-col items-center gap-2 pt-0.5">
          {radioIndicator}
          {Icon && (
            <Icon
              className={selected ? "text-blue-900" : "text-gray-400"}
              size={18}
            />
          )}
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
