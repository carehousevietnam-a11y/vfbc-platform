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
      <p className="text-xs font-medium tracking-wide text-slate-500">
        이런 것도 확인할 수 있습니다
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((question) => {
          const isActive = activeQuestion === question;
          return (
            <button
              key={question}
              type="button"
              onClick={() => onSelect(question)}
              className={cn(
                "rounded-full border px-3.5 py-2.5 text-left text-[12px] font-medium leading-snug sm:px-4 sm:text-[13px]",
                "min-h-[44px] transition-all duration-200",
                isActive
                  ? "border-blue-900/25 bg-blue-900 text-white shadow-[0_2px_8px_rgba(30,58,138,0.25)]"
                  : "border-slate-200/90 bg-white text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 hover:border-teal-200/80 hover:bg-white hover:text-slate-800 hover:shadow-[0_4px_12px_rgba(15,23,42,0.07)] active:translate-y-0 active:shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
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
