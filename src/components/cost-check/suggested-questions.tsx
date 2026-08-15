"use client";

import { cn } from "@/lib/cn";

const SUGGESTED_QUESTIONS = [
  "노동허가 비용이 얼마인가요?",
  "회사설립 비용은 얼마인가요?",
  "거주증을 직접 받을 수 있나요?",
  "받은 견적이 적정한가요?",
  "식당 허가 비용과 절차가 궁금해요",
] as const;

type SuggestedQuestionsProps = {
  onSelect: (question: string) => void;
  activeQuestion?: string;
};

export default function SuggestedQuestions({ onSelect, activeQuestion }: SuggestedQuestionsProps) {
  return (
    <section className="w-full">
      <p className="text-xs font-medium text-slate-500">이런 것도 확인할 수 있습니다</p>
      <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible">
        {SUGGESTED_QUESTIONS.map((question) => {
          const isActive = activeQuestion === question;
          return (
            <button
              key={question}
              type="button"
              onClick={() => onSelect(question)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2.5 text-left text-[13px] font-medium leading-snug transition-all duration-200",
                "min-h-[44px] sm:min-h-0",
                isActive
                  ? "border-blue-900/30 bg-blue-900 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-slate-300 hover:bg-slate-50 hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
              )}
            >
              {question}
            </button>
          );
        })}
      </div>
    </section>
  );
}
