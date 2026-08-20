"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type RelatedLink = { label: string; href: string };

type RelatedQuestionsProps = {
  links: RelatedLink[];
  embedded?: boolean;
};

export function RelatedQuestions({ links, embedded = false }: RelatedQuestionsProps) {
  const { t } = useLocale();
  if (links.length === 0) return null;

  return (
    <section
      className={embedded ? "" : "mt-0"}
      aria-labelledby="related-heading"
    >
      <h2 id="related-heading" className="text-[15px] font-semibold text-blue-900">
        {t("result.relatedTitle")}
      </h2>
      <nav
        className={`mt-1 divide-y divide-slate-100 ${embedded ? "" : ""}`}
      >
        {links.map((link) => (
          <Link
            key={link.href + link.label}
            href={link.href}
            className="flex min-h-11 items-center justify-between gap-3 py-2.5 text-[15px] text-slate-800 transition-colors hover:text-blue-900"
          >
            <span className="min-w-0 flex-1 break-keep">{link.label}</span>
            <ChevronRight size={16} className="shrink-0 text-slate-400" />
          </Link>
        ))}
      </nav>
    </section>
  );
}
