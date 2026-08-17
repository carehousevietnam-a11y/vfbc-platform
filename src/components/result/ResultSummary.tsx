"use client";

type ResultSummaryProps = {
  directAnswer: string;
};

export function ResultSummary({ directAnswer }: ResultSummaryProps) {
  if (!directAnswer.trim()) return null;

  return (
    <section className="mt-5 lg:mt-6" aria-labelledby="direct-answer-heading">
      <h2
        id="direct-answer-heading"
        className="text-base font-semibold text-blue-900 sm:text-[17px] lg:text-lg"
      >
        직접 확인한 결과
      </h2>
      <p className="mt-2.5 max-w-[52rem] break-keep text-[17px] font-medium leading-[1.6] text-slate-900 sm:text-lg lg:text-xl">
        &ldquo;{directAnswer}&rdquo;
      </p>
    </section>
  );
}
