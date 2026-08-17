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
      className={embedded ? "" : "mt-6 lg:mt-7"}
      aria-labelledby="source-heading"
    >
      <h2 id="source-heading" className="text-base font-semibold text-blue-900 sm:text-[17px] lg:text-lg">
        {title}
      </h2>
      <div
        className={`mt-2.5 ${embedded ? "rounded-xl bg-white px-3.5 py-3.5 ring-1 ring-slate-200/70 sm:px-4 sm:py-4" : ""}`}
      >
        {children}
      </div>
    </section>
  );
}
