"use client";

import { formatRequestedAt } from "@/components/result/parseReplyPresentation";

type QuestionCardProps = {
  question: string;
  requestedAt: string;
};

export function QuestionCard({ question, requestedAt }: QuestionCardProps) {
  const dateLabel = formatRequestedAt(requestedAt);

  return (
    <section
      className="mt-8 rounded-2xl border border-slate-200/70 bg-white px-5 py-5 sm:px-6 sm:py-6"
      aria-labelledby="ai-question-heading"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">확인 요청</p>
      <h2
        id="ai-question-heading"
        className="mt-2 text-lg font-bold leading-snug text-slate-900 sm:text-[22px] sm:leading-tight"
      >
        {question}
      </h2>
      {dateLabel ? (
        <p className="mt-3 text-xs text-slate-500">
          <time dateTime={requestedAt}>{dateLabel}</time>
          <span className="mx-1.5 text-slate-300">·</span>
          <span>Vietnam</span>
        </p>
      ) : null}
    </section>
  );
}
