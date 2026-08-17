"use client";

import type { ReactNode } from "react";

type EvidenceSectionProps = {
  title?: string;
  lead?: string;
  children: ReactNode;
  highlighted?: boolean;
  className?: string;
};

export function EvidenceSection({
  title = "판단 근거",
  lead,
  children,
  highlighted = false,
  className = "",
}: EvidenceSectionProps) {
  return (
    <section
      className={`mt-6 lg:mt-7 ${className}`.trim()}
      aria-labelledby="evidence-heading"
    >
      <h2 id="evidence-heading" className="text-base font-semibold text-blue-900 sm:text-[17px] lg:text-lg">
        {title}
      </h2>
      {lead ? (
        <p className="mt-1 text-[14px] font-medium text-slate-700 sm:text-[15px]">{lead}</p>
      ) : null}
      <div
        className={
          highlighted
            ? "mt-2.5 rounded-xl bg-teal-500/[0.04] px-4 py-4 ring-1 ring-teal-500/10 sm:px-5 sm:py-4"
            : "mt-2.5"
        }
      >
        {children}
      </div>
    </section>
  );
}
