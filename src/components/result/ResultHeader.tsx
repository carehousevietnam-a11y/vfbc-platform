"use client";

import { RotateCcw } from "lucide-react";

type ResultHeaderProps = {
  onReset: () => void;
  categoryLabel?: string;
  modeLabel?: string;
  serviceLabel?: string;
};

export function ResultHeader({
  onReset,
  categoryLabel,
  modeLabel,
  serviceLabel,
}: ResultHeaderProps) {
  return (
    <header className="mt-8 flex items-start justify-between gap-4 lg:mt-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-blue-900 lg:text-[26px]">
          MY VIET CHECK
        </h1>
        {(categoryLabel || modeLabel || serviceLabel) && (
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            {categoryLabel ? (
              <span className="rounded-md bg-blue-900/[0.06] px-2.5 py-1 text-xs font-semibold tracking-wide text-blue-900 sm:text-[13px]">
                {categoryLabel}
              </span>
            ) : null}
            {modeLabel ? (
              <span className="text-[15px] font-medium text-slate-600 lg:text-[16px]">{modeLabel}</span>
            ) : null}
            {serviceLabel ? (
              <span className="text-[15px] font-semibold text-slate-800 lg:text-[16px]">{serviceLabel}</span>
            ) : null}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-[#faf8f5] sm:text-sm"
      >
        <RotateCcw size={14} />
        <span className="hidden sm:inline">처음부터 다시 확인하기</span>
        <span className="sm:hidden">다시</span>
      </button>
    </header>
  );
}
