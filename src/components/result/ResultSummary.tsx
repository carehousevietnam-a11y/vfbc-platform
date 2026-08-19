"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

type ResultSummaryProps = {
  directAnswer: string;
};

export function ResultSummary({ directAnswer }: ResultSummaryProps) {
  const { t } = useLocale();
  if (!directAnswer.trim()) return null;

  return (
    <section className="mt-6 border-b border-slate-200/80 pb-6" aria-labelledby="direct-answer-heading">
      <h2 id="direct-answer-heading" className="text-[13px] font-semibold text-slate-400">
        {t("result.directAnswer")}
      </h2>
      <p className="mt-2 break-keep text-[1.0625rem] font-medium leading-relaxed text-slate-900 sm:text-lg">
        {directAnswer}
      </p>
    </section>
  );
}
