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
      className={embedded ? "" : "mt-0"}
      aria-labelledby="source-heading"
    >
      <h2 id="source-heading" className="text-[15px] font-semibold text-blue-900">
        {heading}
      </h2>
      <div
        className={`mt-2 ${embedded ? "" : ""}`}
      >
        {children}
      </div>
    </section>
  );
}
