import Link from "next/link";
import type { PublishedArticle } from "@/lib/contentPacks/types";
import { ANONYMOUS_MYPAGE_CTA, getAnonymousDocumentList } from "@/lib/anonymousLegalGuide";
import { guidePath } from "@/lib/contentPacks/paths";

const ENGINE_CONTAINER = "mx-auto w-full max-w-[960px] px-4 sm:px-6";

function SectionHeading({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="text-[15px] font-semibold text-blue-900">
      {children}
    </h2>
  );
}

type GuideCaseBodyProps = {
  article: PublishedArticle;
};

export function GuideCaseBody({ article }: GuideCaseBodyProps) {
  const landing = article.caseLanding;
  const docs = getAnonymousDocumentList(article.serviceType);

  return (
    <article className={`${ENGINE_CONTAINER} py-10 sm:py-14`}>
      <p className="text-xs font-medium text-blue-900/70">VFBCAI 가이드 · {article.serviceLabel}</p>

      <section className="mt-3 border-b border-slate-200/80 pb-6" aria-labelledby="guide-question">
        <p className="text-[13px] font-semibold text-slate-400">날카로운 질문</p>
        <h1 id="guide-question" className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {landing.question}
        </h1>
      </section>

      <section className="mt-6 border-b border-slate-200/80 pb-6" aria-labelledby="guide-answer">
        <SectionHeading id="guide-answer">직접적인 답변</SectionHeading>
        <p className="mt-2 break-keep text-[1.0625rem] font-medium leading-relaxed text-slate-900 sm:text-lg">
          {landing.directAnswer}
        </p>
      </section>

      <section className="mt-6 border-b border-slate-200/80 pb-6" aria-labelledby="guide-basis">
        <SectionHeading id="guide-basis">공식 근거</SectionHeading>
        <ul className="mt-3 space-y-2">
          {landing.officialBasis.map((item) => (
            <li key={item} className="flex gap-2 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-900/70" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 border-b border-slate-200/80 pb-6" aria-labelledby="guide-cost">
        <SectionHeading id="guide-cost">비용/절차/조건</SectionHeading>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-[15px]">{landing.costNote}</p>
        <p className="mt-4 text-sm font-semibold text-slate-800">절차</p>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
          {landing.process.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
        {docs.length > 0 ? (
          <>
            <p className="mt-4 text-sm font-semibold text-slate-800">필요 서류 (참고)</p>
            <ul className="mt-2 space-y-2">
              {docs.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-900/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <p className="mt-4 text-sm font-semibold text-slate-800">조건</p>
        <ul className="mt-2 space-y-2">
          {landing.conditions.map((item) => (
            <li key={item} className="flex gap-2 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-900/70" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 border-b border-slate-200/80 pb-6" aria-labelledby="guide-cases">
        <SectionHeading id="guide-cases">실제 사례</SectionHeading>
        <div className="mt-3 space-y-4">
          {landing.cases.map((item) => (
            <div key={item.title}>
              <p className="text-sm font-semibold text-slate-800">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700 sm:text-[15px]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 border-b border-slate-200/80 pb-6" aria-labelledby="guide-compare">
        <SectionHeading id="guide-compare">비교</SectionHeading>
        <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {landing.comparison.map((item) => (
            <div key={item.label} className="grid gap-1 px-4 py-3 sm:grid-cols-[8.5rem_1fr] sm:gap-4">
              <p className="text-sm font-semibold text-slate-800">{item.label}</p>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-[15px]">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 border-b border-slate-200/80 pb-6" aria-labelledby="guide-caution">
        <SectionHeading id="guide-caution">주의사항</SectionHeading>
        <ul className="mt-3 space-y-2">
          {landing.cautions.map((item) => (
            <li key={item} className="flex gap-2 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-900/70" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 border-b border-slate-200/80 pb-6" aria-labelledby="guide-qa">
        <SectionHeading id="guide-qa">Q&A</SectionHeading>
        <dl className="mt-3 space-y-4">
          {landing.qa.map((item) => (
            <div key={item.q}>
              <dt className="text-sm font-semibold text-slate-800">{item.q}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-slate-700 sm:text-[15px]">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 border-b border-slate-200/80 pb-6" aria-labelledby="guide-related">
        <SectionHeading id="guide-related">관련 질문</SectionHeading>
        <nav className="mt-1 divide-y divide-slate-100">
          {landing.relatedQuestions.map((item) => (
            <Link
              key={item.href + item.question}
              href={item.href}
              className="flex min-h-11 items-center justify-between gap-3 py-2.5 text-[15px] text-slate-800 transition-colors hover:text-blue-900"
            >
              <span className="min-w-0 flex-1 break-keep">{item.question}</span>
              <span className="shrink-0 text-slate-400" aria-hidden>
                →
              </span>
            </Link>
          ))}
        </nav>
      </section>

      <section className="mt-6 border-b border-slate-200/80 pb-6" aria-labelledby="guide-updated">
        <SectionHeading id="guide-updated">마지막 업데이트</SectionHeading>
        <p className="mt-2 text-sm text-slate-600">최종 업데이트: {article.updatedAt}</p>
      </section>

      <section className="mt-6 border-b border-slate-200/80 pb-6" aria-labelledby="guide-sources">
        <SectionHeading id="guide-sources">출처</SectionHeading>
        <ul className="mt-3 space-y-2">
          {landing.sources.map((item) => (
            <li key={item.label} className="text-sm leading-relaxed text-slate-700 sm:text-[15px]">
              <span className="font-semibold text-slate-800">{item.label}</span>
              {item.detail ? <span className="text-slate-600"> — {item.detail}</span> : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6" aria-labelledby="guide-cta">
        <SectionHeading id="guide-cta">직접 확인</SectionHeading>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{ANONYMOUS_MYPAGE_CTA}</p>
        <div className="mt-4 rounded-2xl bg-blue-900 px-5 py-6 sm:px-7 sm:py-7">
          <p className="text-lg font-semibold text-white sm:text-xl">내 상황으로 한 번 더 맞춰 보세요</p>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-blue-100">
            이 글은 참고용 가이드입니다. 서류·절차의 확정은 CHECK에서, 견적 적정성은 COST CHECK에서 확인하세요.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={article.funnelHref}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-white px-6 py-3 text-[15px] font-semibold text-blue-900 transition-colors hover:bg-blue-50"
            >
              {article.funnelCtaLabel}
            </Link>
            <Link
              href="/cost-check"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/15"
            >
              COST CHECK로 비용 확인
            </Link>
            <Link
              href="/ai"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/15"
            >
              AI에게 다른 질문하기
            </Link>
          </div>
        </div>
        {article.relatedSlug ? (
          <p className="mt-4 text-sm text-slate-500">
            관련 가이드:{" "}
            <Link href={guidePath(article.relatedSlug)} className="font-medium text-blue-900 hover:underline">
              이어서 보기
            </Link>
          </p>
        ) : null}
      </section>
    </article>
  );
}
