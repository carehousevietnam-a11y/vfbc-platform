"use client";

type ResultSummaryProps = {
  directAnswer: string;
};

export function ResultSummary({ directAnswer }: ResultSummaryProps) {
  if (!directAnswer.trim()) return null;

  return (
    <section className="mt-8" aria-labelledby="direct-answer-heading">
      <h2
        id="direct-answer-heading"
        className="text-base font-semibold text-blue-900 sm:text-lg lg:text-[18px]"
      >
        직접 답변
      </h2>
      <p className="mt-4 break-words text-lg font-medium leading-relaxed text-slate-900 sm:text-xl lg:text-[22px] lg:leading-snug">
        &ldquo;{directAnswer}&rdquo;
      </p>
    </section>
  );
}
