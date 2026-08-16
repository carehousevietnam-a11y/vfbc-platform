"use client";

import { RotateCcw } from "lucide-react";

type ResultHeaderProps = {
  onReset: () => void;
};

export function ResultHeader({ onReset }: ResultHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.12em] text-blue-900/70">VFBCAI</p>
        <h1 className="mt-1 text-xl font-bold tracking-tight text-blue-900 sm:text-2xl">
          MY VIET CHECK
        </h1>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-[#faf8f5] sm:text-[13px]"
      >
        <RotateCcw size={14} />
        <span className="hidden sm:inline">처음부터 다시 확인하기</span>
        <span className="sm:hidden">다시</span>
      </button>
    </header>
  );
}
