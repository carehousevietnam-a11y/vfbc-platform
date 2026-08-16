"use client";

import type { ReactNode } from "react";

type SourceSectionProps = {
  title?: string;
  children: ReactNode;
};

export function SourceSection({ title = "공식 출처", children }: SourceSectionProps) {
  return (
    <section className="mt-10" aria-labelledby="source-heading">
      <h2 id="source-heading" className="text-base font-semibold text-blue-900 sm:text-lg">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
