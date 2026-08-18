"use client";

import type { ReactNode } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type SourceSectionProps = {
  title?: string;
  children: ReactNode;
  embedded?: boolean;
};

export function SourceSection({
  title,
  children,
  embedded = false,
}: SourceSectionProps) {
  const { t } = useLocale();
  const heading = title ?? t("result.sourceTitle");
  return (
    <section
      className={embedded ? "" : "mt-8 lg:mt-9"}
      aria-labelledby="source-heading"
    >
      <h2 id="source-heading" className="text-[17px] font-semibold text-blue-900 sm:text-lg lg:text-[18px]">
        {heading}
      </h2>
      <div
        className={`mt-3 ${embedded ? "rounded-xl bg-white px-4 py-4 ring-1 ring-slate-200/70 sm:px-5 sm:py-5" : ""}`}
      >
        {children}
      </div>
    </section>
  );
}
