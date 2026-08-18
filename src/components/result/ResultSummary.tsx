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
        className="text-lg font-semibold leading-[1.55] text-blue-900 sm:text-[19px] lg:text-xl"
      >
        직접 확인한 결과
      </h2>
      <p className="mt-2.5 break-keep text-[15px] font-medium leading-[1.65] text-slate-900 sm:text-base lg:text-[17px]">
        &ldquo;{directAnswer}&rdquo;
      </p>
    </section>
  );
}
