"use client";

import type { ReactNode } from "react";

type DecisionSectionProps = {
  title?: string;
  children: ReactNode;
  verdictLabel?: string;
  verdictHint?: string;
  layout?: "split" | "stacked";
};

export function DecisionSection({
  title = "견적 적정성",
  children,
  verdictLabel,
  verdictHint,
  layout = "split",
}: DecisionSectionProps) {
  const stacked = layout === "stacked";

  return (
    <section aria-labelledby="decision-heading">
      <h2 id="decision-heading" className="text-base font-semibold text-blue-900 sm:text-lg">
        {title}
      </h2>
      <div
        className={
          stacked
            ? "mt-5 space-y-4"
            : "mt-5 grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-center lg:gap-10"
        }
      >
        <div className="min-w-0">{children}</div>
        {(verdictLabel || verdictHint) && (
          <div className={stacked ? "min-w-0 space-y-2 text-center" : "min-w-0 space-y-2 lg:pt-2"}>
            {verdictLabel ? (
              <p className="text-2xl font-bold text-slate-900 sm:text-3xl">{verdictLabel}</p>
            ) : null}
            {verdictHint ? (
              <p className="text-[15px] leading-relaxed text-slate-600 sm:text-base">{verdictHint}</p>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
