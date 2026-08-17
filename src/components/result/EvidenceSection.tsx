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
      className={`mt-8 lg:mt-9 ${className}`.trim()}
      aria-labelledby="evidence-heading"
    >
      <h2 id="evidence-heading" className="text-[17px] font-semibold text-blue-900 sm:text-lg lg:text-[18px]">
        {title}
      </h2>
      {lead ? (
        <p className="mt-1.5 text-[15px] font-medium text-slate-700 sm:text-base">{lead}</p>
      ) : null}
      <div
        className={
          highlighted
            ? "mt-3 rounded-xl bg-teal-500/[0.04] px-5 py-5 ring-1 ring-teal-500/10 sm:px-6 sm:py-5"
            : "mt-3"
        }
      >
        {children}
      </div>
    </section>
  );
}
