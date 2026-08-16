"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

type RelatedLink = { label: string; href: string };

type RelatedQuestionsProps = {
  links: RelatedLink[];
};

export function RelatedQuestions({ links }: RelatedQuestionsProps) {
  if (links.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="related-heading">
      <h2 id="related-heading" className="text-base font-semibold text-blue-900 sm:text-lg">
        다음에 확인해보세요
      </h2>
      <nav className="mt-3 divide-y divide-slate-100 rounded-xl bg-white ring-1 ring-slate-200/80">
        {links.map((link) => (
          <Link
            key={link.href + link.label}
            href={link.href}
            className="flex min-h-[48px] items-center justify-between gap-3 px-4 py-3.5 text-[15px] text-slate-800 transition-colors hover:bg-[#faf8f5] hover:text-blue-900 sm:px-5"
          >
            <span className="min-w-0 flex-1 break-words">{link.label}</span>
            <ChevronRight size={16} className="shrink-0 text-slate-400" />
          </Link>
        ))}
      </nav>
    </section>
  );
}
