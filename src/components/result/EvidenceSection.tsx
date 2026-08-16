"use client";

import type { ReactNode } from "react";

type EvidenceSectionProps = {
  title?: string;
  lead?: string;
  children: ReactNode;
  highlighted?: boolean;
};

export function EvidenceSection({
  title = "판단 근거",
  lead,
  children,
  highlighted = false,
}: EvidenceSectionProps) {
  return (
    <section className="mt-10 lg:mt-12" aria-labelledby="evidence-heading">
      <h2 id="evidence-heading" className="text-base font-semibold text-blue-900 sm:text-lg lg:text-[18px]">
        {title}
      </h2>
      {lead ? (
        <p className="mt-2 text-[15px] font-medium text-slate-700 sm:text-base">{lead}</p>
      ) : null}
      <div
        className={
          highlighted
            ? "mt-4 rounded-2xl bg-teal-500/[0.04] px-5 py-5 ring-1 ring-teal-500/10 sm:px-7 sm:py-6"
            : "mt-4"
        }
      >
        {children}
      </div>
    </section>
  );
}
