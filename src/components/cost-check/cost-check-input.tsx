"use client";

import { useState } from "react";
import { ArrowRight, BadgeCheck, CircleDollarSign, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/cn";

const FLOW_STEPS = [
  { label: "질문", icon: MessageSquareText },
  { label: "비용 확인", icon: CircleDollarSign, accent: true },
  { label: "견적 검토", icon: BadgeCheck },
] as const;

const COST_CUES = ["₫", "$", "비용", "시장 범위", "받은 견적", "적정성"] as const;

type CostCheckInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export default function CostCheckInput({ value, onChange, onSubmit }: CostCheckInputProps) {
  const [focused, setFocused] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={cn(
          "relative overflow-hidden rounded-[1.35rem] bg-white",
          "border border-slate-200/90",
          "shadow-[0_1px_1px_rgba(15,23,42,0.03),0_4px_6px_-2px_rgba(15,23,42,0.04),0_18px_44px_-14px_rgba(15,23,42,0.10)]",
          "ring-1 ring-inset ring-white/80",
          "transition-all duration-200",
          focused
            ? "-translate-y-0.5 border-teal-200/70 shadow-[0_2px_4px_rgba(15,23,42,0.04),0_8px_16px_-4px_rgba(15,23,42,0.06),0_24px_52px_-16px_rgba(15,23,42,0.14)] ring-2 ring-teal-500/15"
            : "hover:border-slate-300/90 hover:shadow-[0_2px_4px_rgba(15,23,42,0.04),0_22px_48px_-14px_rgba(15,23,42,0.12)]"
        )}
      >
        {/* inner highlight */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-6 top-0 h-20 bg-gradient-to-b from-slate-50/80 to-transparent"
          aria-hidden
        />

        {/* header bar */}
        <div className="relative flex items-center justify-between gap-3 border-b border-slate-100/90 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden />
            <span className="truncate text-xs font-semibold text-slate-700">
              행정 · 법률 직접 확인
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {FLOW_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <span key={step.label} className="flex items-center gap-1">
                  {index > 0 && (
                    <span className="text-[10px] text-slate-200" aria-hidden>
                      ·
                    </span>
                  )}
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold sm:gap-1 sm:px-2 sm:text-[11px]",
                      "accent" in step && step.accent
                        ? "bg-teal-50 text-teal-800"
                        : "text-slate-400"
                    )}
                  >
                    <Icon size={11} strokeWidth={2} aria-hidden />
                    <span className="hidden sm:inline">{step.label}</span>
                    <span className="sm:hidden">
                      {step.label === "비용 확인" ? "비용" : step.label === "견적 검토" ? "견적" : step.label}
                    </span>
                  </span>
                </span>
              );
            })}
          </div>
        </div>

        {/* input body */}
        <div className="relative px-4 pb-5 pt-5 sm:px-5 sm:pt-6">
          <label htmlFor="cost-check-question" className="block text-sm font-semibold text-slate-800">
            무엇이 궁금하신가요?
          </label>

          <div className="relative mt-3">
            <textarea
              id="cost-check-question"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="예) 노동허가 진행 비용이 얼마나 드나요?"
              rows={4}
              className={cn(
                "w-full resize-none rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3.5",
                "text-[15px] leading-relaxed text-slate-900 sm:text-base",
                "placeholder:text-slate-400",
                "transition-all duration-200",
                "focus:border-teal-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/10"
              )}
            />
          </div>

          {/* cost calculator visual cues — labels only, no values */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {COST_CUES.map((cue) => {
              const isCurrency = cue === "₫" || cue === "$";
              const isAccent = !isCurrency;
              return (
                <span
                  key={cue}
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium sm:text-[11px]",
                    isCurrency
                      ? "border border-slate-200/80 bg-white text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                      : isAccent
                        ? "border border-teal-100 bg-teal-50/60 text-teal-800/90"
                        : "border border-slate-100 bg-slate-50 text-slate-500"
                  )}
                >
                  {cue}
                </span>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={!value.trim()}
              className={cn(
                "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold sm:w-auto sm:min-w-[168px]",
                "bg-blue-900 text-white",
                "shadow-[0_1px_2px_rgba(30,58,138,0.2),0_6px_20px_-4px_rgba(30,58,138,0.35)]",
                "transition-all duration-200",
                "hover:bg-blue-950 hover:shadow-[0_2px_4px_rgba(30,58,138,0.22),0_10px_28px_-6px_rgba(30,58,138,0.4)] hover:-translate-y-px",
                "active:translate-y-0 active:shadow-[0_1px_2px_rgba(30,58,138,0.2)]",
                "disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:hover:translate-y-0"
              )}
            >
              직접 확인하기
              <ArrowRight size={16} strokeWidth={2.25} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
