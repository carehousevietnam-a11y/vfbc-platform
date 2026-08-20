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
      className={`mt-6 border-b border-slate-200/80 pb-6 ${className}`.trim()}
      aria-labelledby="evidence-heading"
    >
      <h2 id="evidence-heading" className="text-[15px] font-semibold text-blue-900">
        {title}
      </h2>
      {lead ? (
        <p className="mt-1 text-[14px] font-medium text-slate-600">{lead}</p>
      ) : null}
      <div className={highlighted ? "mt-3" : "mt-3"}>{children}</div>
    </section>
  );
}
