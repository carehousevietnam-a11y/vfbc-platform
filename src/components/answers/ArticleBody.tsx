import Link from "next/link";
import type { PublishedArticle, ArticleSection } from "@/lib/contentPacks/types";
import { ANONYMOUS_GUIDE_DISCLAIMER } from "@/lib/anonymousLegalGuide";

const MYPAGE_CTA =
  "정확한 서류 목록과 예시 샘플은 무료회원 가입 후 마이페이지에서 확인하실 수 있습니다.";

function SectionBlock({ section }: { section: ArticleSection }) {
  if (section.type === "h2") {
    return (
      <h2 className="mt-8 text-base font-bold tracking-tight text-blue-950 first:mt-0 sm:text-lg">
        {section.text}
      </h2>
    );
  }

  if (section.type === "bullets") {
    return (
      <div className="mt-3">
        {section.title ? (
          <p className="mb-2 text-sm font-semibold text-gray-800">{section.title}</p>
        ) : null}
        <ul className="space-y-2">
          {section.items.map((item, index) => (
            <li key={index} className="flex gap-2 text-sm leading-relaxed text-gray-700 sm:text-[15px]">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-900/70" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (section.type === "numbered") {
    return (
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-gray-700 sm:text-[15px]">
        {section.items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ol>
    );
  }

  return (
    <p className="mt-3 text-sm leading-relaxed text-gray-700 sm:text-[15px] sm:leading-7">
      {section.text}
    </p>
  );
}

type ArticleBodyProps = {
  article: PublishedArticle;
};

export function ArticleBody({ article }: ArticleBodyProps) {
  return (
    <article className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="border-b border-gray-100 pb-6">
        <p className="text-xs font-medium text-blue-900/70">VFBCAI 가이드 · {article.serviceLabel}</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{article.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-[15px]">{article.subtitle}</p>
        <p className="mt-3 text-xs text-gray-400">최종 업데이트: {article.updatedAt}</p>
      </header>

      <div className="mt-6">
        {article.sections.map((section, index) => (
          <SectionBlock key={index} section={section} />
        ))}
      </div>

      <footer className="mt-10 space-y-4 border-t border-gray-100 pt-6">
        <p className="text-xs leading-relaxed text-gray-400">{ANONYMOUS_GUIDE_DISCLAIMER}</p>
        <p className="text-sm text-slate-600">{MYPAGE_CTA}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link
            href={article.funnelHref}
            className="inline-flex rounded-full bg-blue-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-950"
          >
            {article.funnelCtaLabel}
          </Link>
          <Link
            href="/ai"
            className="inline-flex rounded-full border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:border-blue-900 hover:text-blue-900"
          >
            AI에게 다른 질문하기
          </Link>
          {article.relatedSlug ? (
            <Link
              href={`/answers/${article.relatedSlug}`}
              className="inline-flex rounded-full border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:border-blue-900 hover:text-blue-900"
            >
              관련 가이드 보기
            </Link>
          ) : null}
        </div>
      </footer>
    </article>
  );
}
