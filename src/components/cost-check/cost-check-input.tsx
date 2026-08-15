"use client";

import { ArrowRight, CircleDollarSign, Scale, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

const COST_CHIPS = [
  { label: "₫", title: "동(VND)" },
  { label: "$", title: "달러(USD)" },
  { label: "비용", accent: true },
  { label: "시장 범위", accent: true },
  { label: "받은 견적", accent: true },
  { label: "적정성", accent: true },
] as const;

type CostCheckInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export default function CostCheckInput({ value, onChange, onSubmit }: CostCheckInputProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white",
          "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_40px_-12px_rgba(15,23,42,0.12)]",
          "ring-1 ring-slate-900/[0.03]",
          "transition-shadow duration-300 hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_20px_48px_-16px_rgba(15,23,42,0.14)]"
        )}
      >
        {/* subtle top gradient layer */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-50/90 to-transparent"
          aria-hidden
        />

        <div className="relative border-b border-slate-100 px-5 py-3.5 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Sparkles size={14} className="text-teal-600" aria-hidden />
              <span>행정 · 법률 · 비용 직접 확인</span>
            </div>
            <div className="hidden items-center gap-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:flex">
              <span className="flex items-center gap-1">
                <Scale size={12} aria-hidden />
                질문
              </span>
              <span className="text-slate-200">|</span>
              <span className="flex items-center gap-1 text-teal-700/80">
                <CircleDollarSign size={12} aria-hidden />
                비용
              </span>
              <span className="text-slate-200">|</span>
              <span>확인</span>
            </div>
          </div>
        </div>

        <div className="relative px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <label htmlFor="cost-check-question" className="block text-sm font-semibold text-slate-800">
            무엇이 궁금하신가요?
          </label>
          <textarea
            id="cost-check-question"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="노동허가 진행 비용이 얼마나 드나요?"
            rows={3}
            className={cn(
              "mt-3 w-full resize-none border-0 bg-transparent p-0 text-base leading-relaxed text-slate-900",
              "placeholder:text-slate-400 focus:outline-none focus:ring-0 sm:text-[17px]"
            )}
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {COST_CHIPS.map((chip) => (
              <span
                key={chip.label}
                title={"title" in chip ? chip.title : chip.label}
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
                  "accent" in chip && chip.accent
                    ? "border border-teal-200/60 bg-teal-50/50 text-teal-800"
                    : "border border-slate-200 bg-slate-50 text-slate-600"
                )}
              >
                {chip.label}
              </span>
            ))}
          </div>
        </div>

        <div className="relative border-t border-slate-100 bg-slate-50/40 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <p className="text-[11px] leading-relaxed text-slate-400 sm:mr-auto sm:max-w-[55%]">
              행정·법률 비용과 절차를 한곳에서 확인합니다. 실제 계산은 다음 단계에서 연결됩니다.
            </p>
            <button
              type="submit"
              disabled={!value.trim()}
              className={cn(
                "inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold transition-all duration-200",
                "bg-slate-900 text-white shadow-[0_2px_8px_rgba(15,23,42,0.2)]",
                "hover:bg-slate-800 hover:shadow-[0_4px_14px_rgba(15,23,42,0.22)] hover:-translate-y-px",
                "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-[0_2px_8px_rgba(15,23,42,0.2)]",
                "sm:min-w-[140px]"
              )}
            >
              확인하기
              <ArrowRight size={16} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
