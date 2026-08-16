"use client";

import type { ReactNode } from "react";

type EvidenceSectionProps = {
  title?: string;
  children: ReactNode;
};

export function EvidenceSection({ title = "판단 근거", children }: EvidenceSectionProps) {
  return (
    <section className="mt-10" aria-labelledby="evidence-heading">
      <h2 id="evidence-heading" className="text-base font-semibold text-blue-900 sm:text-lg">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
