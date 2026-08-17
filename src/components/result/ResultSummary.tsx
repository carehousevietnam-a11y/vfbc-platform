"use client";

type ResultSummaryProps = {
  directAnswer: string;
};

export function ResultSummary({ directAnswer }: ResultSummaryProps) {
  if (!directAnswer.trim()) return null;

  return (
    <section className="mt-8 lg:mt-10" aria-labelledby="direct-answer-heading">
      <h2
        id="direct-answer-heading"
        className="text-[17px] font-semibold text-blue-900 sm:text-lg lg:text-[18px]"
      >
        직접 확인한 결과
      </h2>
      <p className="mt-3 max-w-3xl break-keep text-lg font-medium leading-relaxed text-slate-900 sm:text-xl lg:text-[21px] lg:leading-snug">
        &ldquo;{directAnswer}&rdquo;
      </p>
    </section>
  );
}
