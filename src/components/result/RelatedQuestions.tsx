"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

type RelatedLink = { label: string; href: string };

type RelatedQuestionsProps = {
  links: RelatedLink[];
  embedded?: boolean;
};

export function RelatedQuestions({ links, embedded = false }: RelatedQuestionsProps) {
  if (links.length === 0) return null;

  return (
    <section
      className={embedded ? "" : "mt-6 lg:mt-7"}
      aria-labelledby="related-heading"
    >
      <h2 id="related-heading" className="text-base font-semibold text-blue-900 sm:text-[17px] lg:text-lg">
        함께 많이 확인해요
      </h2>
      <nav
        className={`mt-2.5 divide-y divide-slate-100/80 ${
          embedded ? "rounded-xl bg-white ring-1 ring-slate-200/70" : ""
        }`}
      >
        {links.map((link) => (
          <Link
            key={link.href + link.label}
            href={link.href}
            className="flex min-h-[44px] items-center justify-between gap-3 px-3.5 py-2.5 text-[14px] text-slate-800 transition-colors hover:bg-[#faf8f5] hover:text-blue-900 sm:px-4 sm:text-[15px]"
          >
            <span className="min-w-0 flex-1 break-keep">{link.label}</span>
            <ChevronRight size={16} className="shrink-0 text-slate-400" />
          </Link>
        ))}
      </nav>
    </section>
  );
}
