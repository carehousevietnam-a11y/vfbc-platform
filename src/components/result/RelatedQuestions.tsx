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
      className={embedded ? "" : "mt-10 lg:mt-12"}
      aria-labelledby="related-heading"
    >
      <h2 id="related-heading" className="text-base font-semibold text-blue-900 sm:text-lg lg:text-[18px]">
        함께 많이 확인해요
      </h2>
      <nav
        className={`mt-4 divide-y divide-slate-100/80 ${
          embedded ? "rounded-2xl bg-white px-1 shadow-[0_1px_3px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/60" : ""
        }`}
      >
        {links.map((link) => (
          <Link
            key={link.href + link.label}
            href={link.href}
            className="flex min-h-[52px] items-center justify-between gap-3 px-4 py-3.5 text-[15px] text-slate-800 transition-colors hover:bg-[#faf8f5] hover:text-blue-900 sm:px-5 sm:text-base"
          >
            <span className="min-w-0 flex-1 break-words">{link.label}</span>
            <ChevronRight size={16} className="shrink-0 text-slate-400" />
          </Link>
        ))}
      </nav>
    </section>
  );
}
