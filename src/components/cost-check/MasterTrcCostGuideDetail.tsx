import Link from "next/link";
import type { PublishedArticle } from "@/lib/contentPacks/types";
import { getTrcCostGuideDetailModel } from "@/lib/contentPacks/trcCostGuideDetail";

function funnelHrefWithStart(href: string): string {
  return href.includes("?") ? `${href}&start=check` : `${href}?start=check`;
}

function SectionTitle({
  id,
  children,
}: {
  id: string;
  children: string;
}) {
  return (
    <h2
      id={id}
      className="border-b border-[#E5E7EB] pb-2 text-[13.5px] font-semibold leading-snug text-[#0B2A6B] sm:text-[14px]"
    >
      {children}
    </h2>
  );
}

/**
 * TRC intent=cost 「더 자세히 보기」 표준 본문.
 * 개인화 판단 없이 공식 수수료·시장 참고·근거만 일반 정보로 제시한다.
 */
export function MasterTrcCostGuideDetail({
  article,
  question = null,
}: {
  article: PublishedArticle;
  question?: string | null;
}) {
  const model = getTrcCostGuideDetailModel();
  const displayQuestion = question?.trim() || null;
  const funnelHref = funnelHrefWithStart(article.funnelHref || model.funnelHref);

  return (
    <article
      className="mx-auto w-full min-w-0 max-w-[840px] px-5 py-8 sm:px-7 sm:py-10 lg:pl-14 lg:pr-10 lg:py-12"
      data-guide-intent="cost"
      data-guide-question={displayQuestion ?? undefined}
    >
      <header className="border-b border-[#E5E7EB] pb-5 sm:pb-6">
        <p className="text-[10px] font-medium tracking-[0.04em] text-[#94A3B8]">
          VFBCAI · {article.serviceLabel}
        </p>
        <h1 className="mt-1.5 break-keep text-[1.35rem] font-semibold leading-snug tracking-tight text-[#0B2A6B] sm:text-[1.5rem]">
          {model.h1}
        </h1>
        <p className="mt-2 break-keep text-[13px] leading-relaxed text-[#64748B] sm:text-[13.5px]">
          {model.intro}
        </p>
      </header>

      {displayQuestion ? (
        <section className="mt-7 sm:mt-8" aria-labelledby="trc-cost-question">
          <SectionTitle id="trc-cost-question">질문</SectionTitle>
          <p className="mt-3 break-keep text-[13.5px] font-medium leading-relaxed text-[#0B2A6B] sm:text-[14px]">
            {displayQuestion}
          </p>
        </section>
      ) : null}

      <section className="mt-7 sm:mt-8" aria-labelledby="trc-cost-answer">
        <SectionTitle id="trc-cost-answer">핵심 답변</SectionTitle>
        <p className="mt-3 break-keep text-[13.5px] font-medium leading-[1.7] text-[#0F172A] sm:text-[14px] sm:leading-[1.65]">
          {model.directAnswer}
        </p>
      </section>

      <section className="mt-8 sm:mt-9" aria-labelledby="trc-cost-official">
        <SectionTitle id="trc-cost-official">정부 공식 수수료</SectionTitle>
        <p className="mt-3 break-keep text-[12.5px] leading-relaxed text-[#64748B] sm:text-[13px]">
          적용 기준: 거주증(thẻ tạm trú) 카드 유효기간 구간. 기준일(시행일):{" "}
          {model.officialSource.effectiveDate}.
        </p>
        <ul className="mt-3 divide-y divide-[#EEF2F7] border-y border-[#EEF2F7]">
          {model.feeTiers.map((tier) => (
            <li
              key={tier.label}
              className="flex min-w-0 items-baseline justify-between gap-4 py-2.5"
            >
              <div className="min-w-0">
                <p className="break-keep text-[13px] font-medium text-[#0B2A6B] sm:text-[13.5px]">
                  {tier.label}
                </p>
                <p className="mt-0.5 break-keep text-[12px] leading-relaxed text-[#94A3B8]">
                  {tier.basis}
                </p>
              </div>
              <p className="shrink-0 text-[13.5px] font-semibold tabular-nums text-[#0F172A] sm:text-[14px]">
                USD {tier.amountUsd}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-3 break-keep text-[12px] leading-relaxed text-[#94A3B8] sm:text-[12.5px]">
          공식 출처: {model.officialSource.documentKo} ({model.officialSource.document}),{" "}
          {model.officialSource.agency}. {model.officialSource.publishedNote}.
        </p>
        <p className="mt-1.5 break-keep text-[12px] leading-relaxed text-[#94A3B8]">
          플랫폼 비용 안내 요약: {model.costCheckSummary} — {model.costCheckSourceLabel}
        </p>
        <p className="mt-2 break-keep text-[11.5px] leading-relaxed text-[#94A3B8]">
          {model.officialDisclaimer}
        </p>
      </section>

      <section className="mt-8 sm:mt-9" aria-labelledby="trc-cost-market">
        <SectionTitle id="trc-cost-market">시장가격</SectionTitle>
        <p className="mt-3 break-keep text-[12.5px] leading-relaxed text-[#64748B] sm:text-[13px]">
          시장가격은 정부 공식 수수료와 별개입니다. 정부에 납부하는 금액이 아닙니다.
        </p>
        <p className="mt-3 break-keep text-[14px] font-semibold tabular-nums text-[#0F172A]">
          USD {model.market.min} ~ USD {model.market.max}
        </p>
        <p className="mt-1.5 break-keep text-[12.5px] leading-relaxed text-[#64748B] sm:text-[13px]">
          {model.market.note}
        </p>
        <p className="mt-2 break-keep text-[11.5px] leading-relaxed text-[#94A3B8]">
          {model.market.marketDisclaimer}
        </p>
        <div className="mt-3">
          <p className="text-[11px] font-medium text-[#94A3B8] sm:text-[11.5px]">
            시장 사례 참고
          </p>
          <ul className="mt-1 space-y-0.5">
            {model.marketCases.map((item) => (
              <li
                key={item.name}
                className="break-keep text-[11px] leading-relaxed text-[#94A3B8] sm:text-[11.5px]"
              >
                ·{" "}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#64748B] underline-offset-2 hover:underline"
                >
                  {item.name}
                </a>
                {" — "}
                {item.summary}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-8 sm:mt-9" aria-labelledby="trc-cost-gap">
        <SectionTitle id="trc-cost-gap">왜 가격 차이가 나는가</SectionTitle>
        <p className="mt-3 break-keep text-[12.5px] leading-relaxed text-[#64748B] sm:text-[13px]">
          견적·시장 가격에는 정부 수수료 외에 아래 항목이 포함될 수 있습니다. 모든 견적에
          반드시 포함된다고 단정하지는 않습니다.
        </p>
        <ul className="mt-3 space-y-1.5">
          {model.priceGapReasons.map((item) => (
            <li
              key={item}
              className="break-keep text-[13px] leading-relaxed text-[#475569] sm:text-[13.5px]"
            >
              · {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 sm:mt-9" aria-labelledby="trc-cost-check">
        <SectionTitle id="trc-cost-check">비용을 볼 때 확인해야 할 것</SectionTitle>
        <ul className="mt-3 space-y-1.5">
          {model.checklist.map((item) => (
            <li
              key={item}
              className="break-keep text-[13px] leading-relaxed text-[#475569] sm:text-[13.5px]"
            >
              · {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 sm:mt-9" aria-labelledby="trc-cost-sources">
        <SectionTitle id="trc-cost-sources">공식 근거</SectionTitle>
        <ul className="mt-3 space-y-3">
          <li className="min-w-0">
            <p className="break-keep text-[13px] font-medium text-[#0B2A6B] sm:text-[13.5px]">
              {model.officialSource.agency}
            </p>
            <p className="mt-0.5 break-keep text-[12.5px] leading-relaxed text-[#64748B]">
              {model.officialSource.document} · 시행일 {model.officialSource.effectiveDate}
            </p>
            <a
              href={model.officialSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block break-keep text-[12.5px] font-medium text-[#2563EB] hover:underline"
            >
              {model.officialSource.urlLabel} →
            </a>
          </li>
          <li className="min-w-0">
            <p className="break-keep text-[13px] font-medium text-[#0B2A6B] sm:text-[13.5px]">
              플랫폼 비용 안내 연계 출처
            </p>
            <p className="mt-0.5 break-keep text-[12.5px] leading-relaxed text-[#64748B]">
              {model.costCheckSourceLabel}
            </p>
            <p className="mt-0.5 break-keep text-[12px] leading-relaxed text-[#94A3B8]">
              {model.lookupGuide}
            </p>
          </li>
        </ul>
      </section>

      <section className="mt-8 sm:mt-9" aria-labelledby="trc-cost-limit">
        <SectionTitle id="trc-cost-limit">일반 정보의 한계</SectionTitle>
        <div className="mt-3 space-y-2 break-keep text-[12.5px] leading-relaxed text-[#64748B] sm:text-[13px]">
          <p>지금 확인한 내용은 일반적인 기준입니다.</p>
          <p>
            실제 결과는 체류기간, 국적, 현재 서류, 지역, 개인 상황에 따라 달라질 수 있습니다.
          </p>
        </div>
      </section>

      <section
        className="mt-9 border-t border-[#E5E7EB] pt-6 sm:mt-10 sm:pt-7"
        aria-labelledby="mcd-cta"
      >
        <div className="space-y-2 break-keep text-[12.5px] leading-relaxed text-[#64748B] sm:text-[13px]">
          <p id="mcd-cta">지금 확인한 내용은 일반적인 기준입니다.</p>
          <p>
            실제 결과는 체류기간, 국적, 현재 서류, 지역, 개인 상황에 따라 달라질 수 있습니다.
          </p>
          <p>
            내 상황을 입력하면 VFBCAI가 공식 기준과 비교하여 가장 적합한 답변을 제공합니다.
          </p>
        </div>
        <Link
          href={funnelHref}
          className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-[8px] bg-[#0B2A6B] px-4 text-[12.5px] font-semibold text-white transition hover:bg-[#082258] sm:w-auto sm:min-w-[200px]"
        >
          내 상황 확인하기 →
        </Link>
      </section>
    </article>
  );
}
