"use client";

import type { ReactNode } from "react";

type SourceSectionProps = {
  title?: string;
  children: ReactNode;
  embedded?: boolean;
};

export function SourceSection({
  title = "공식 출처",
  children,
  embedded = false,
}: SourceSectionProps) {
  return (
    <section
      className={embedded ? "" : "mt-10 lg:mt-12"}
      aria-labelledby="source-heading"
    >
      <h2 id="source-heading" className="text-base font-semibold text-blue-900 sm:text-lg lg:text-[18px]">
        {title}
      </h2>
      <div
        className={`mt-4 ${embedded ? "rounded-2xl bg-white px-5 py-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/60 sm:px-6 sm:py-6" : ""}`}
      >
        {children}
      </div>
    </section>
  );
}
