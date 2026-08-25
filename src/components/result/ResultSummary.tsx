"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type ResultSummaryProps = {
  directAnswer: string;
  guideHref?: string;
};

export function ResultSummary({ directAnswer, guideHref }: ResultSummaryProps) {
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
      {guideHref ? (
        <Link
          href={guideHref}
          className="group mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-blue-900 transition-colors hover:text-blue-700"
        >
          <ArrowRight
            size={15}
            aria-hidden
            className="shrink-0 transition-transform group-hover:translate-x-0.5"
          />
          더 자세히 보기
        </Link>
      ) : null}
    </section>
  );
}
