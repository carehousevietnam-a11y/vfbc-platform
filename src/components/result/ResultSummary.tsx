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
        className="text-base font-semibold text-blue-900 sm:text-lg"
      >
        직접 확인한 결과
      </h2>
      <p className="mt-3 break-words text-lg font-medium leading-relaxed text-slate-900 sm:text-xl sm:leading-snug">
        &ldquo;{directAnswer}&rdquo;
      </p>
    </section>
  );
}
