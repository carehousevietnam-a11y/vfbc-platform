"use client";

import type { ReactNode } from "react";

type EvidenceSectionProps = {
  title?: string;
  children: ReactNode;
  highlighted?: boolean;
};

export function EvidenceSection({
  title = "판단 근거",
  children,
  highlighted = false,
}: EvidenceSectionProps) {
  return (
    <section className="mt-10" aria-labelledby="evidence-heading">
      <h2 id="evidence-heading" className="text-base font-semibold text-blue-900 sm:text-lg">
        {title}
      </h2>
      <div
        className={
          highlighted
            ? "mt-4 rounded-2xl bg-teal-500/[0.04] px-5 py-5 ring-1 ring-teal-500/10 sm:px-6"
            : "mt-4"
        }
      >
        {children}
      </div>
    </section>
  );
}
