"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import OfficialTrustZone from "@/components/ui/OfficialTrustZone";
import type { FunnelEngine } from "@/components/engine/funnelTokens";
import { getPublishedArticleBySlug } from "@/lib/contentPacks/registry";
import { resolveGuideView } from "@/lib/contentPacks/parseGuideArticleView";
import { getRequiredDocuments } from "@/lib/requiredDocuments";
import { buildCheckGuideDetailHref } from "@/lib/contentPacks/checkGuideIntent";
import { COST_CHECK_DISCLAIMER } from "@/lib/costCheck";

type GuidePanelConfig = {
  engine: FunnelEngine;
  guideTitle: string;
  guideIntro: string;
  guideSlug?: string;
  officialUrl: string;
  officialNote: string;
};

/**
 * CHECK 4개 Master 「자세히 보기」 전용 — 견적서 UI와 같은 위계·여백.
 * `/guide` 본문·다른 서비스 GuideCaseVisual은 변경하지 않음.
 */
function SectionHeading({
  id,
  number,
  title,
}: {
  id: string;
  number: string;
  title: string;
}) {
  return (
    <h3
      id={id}
      className="mb-2 flex items-baseline gap-1.5 border-b border-[#E5E7EB] pb-1.5 text-[12.5px] font-semibold leading-snug text-[#0B2A6B] sm:mb-2.5 sm:text-[13.5px]"
    >
      <span className="tabular-nums font-medium text-[#64748B]">{number}.</span>
      <span className="min-w-0 break-keep">{title}</span>
    </h3>
  );
}

function compressLine(text: string, max = 110): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const slice = t.slice(0, max);
  const breakAt = Math.max(slice.lastIndexOf("."), slice.lastIndexOf("다"));
  if (breakAt > 50) return t.slice(0, breakAt + 1).trim();
  return `${slice.trim()}…`;
}

export function MasterQuotationGuidePanel({
  config,
  onGoLookup,
  query = "",
}: {
  config: GuidePanelConfig;
  onGoLookup: () => void;
  /** 확인하기에서 유지된 사용자 질문 — intent/q 전달용 */
  query?: string;
}) {
  const article = config.guideSlug ? getPublishedArticleBySlug(config.guideSlug) : null;
  if (!article) return null;

  const landing = article.caseLanding;
  const view = resolveGuideView(article);
  const docs = getRequiredDocuments(article.serviceType);
  const showDocuments = landing.showDocuments !== false;
  const materials = showDocuments
    ? [...docs.documents, ...(docs.optionalDocuments ?? [])].slice(0, 6)
    : view.evidenceWhenProblem.slice(0, 4);

  const summary = compressLine(
    landing.directAnswer || landing.why || article.subtitle || config.guideIntro,
    130
  );
  const processSteps = landing.process.slice(0, 5);
  const checkpoints = view.caseCheckpoints.slice(0, 4);
  const beforeItems = view.beforeAction.slice(0, 3);
  const afterItems = view.afterAction.slice(0, 3);
  const detailHref = buildCheckGuideDetailHref(article.slug, query);
  const cautionItems = landing.cautions.slice(0, 3);

  return (
    <div className="mt-3 space-y-3">
      <div className="overflow-hidden rounded-[4px] border border-[#D8DEE8] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <article className="min-w-0">
          <header className="border-b border-[#E5E7EB] px-5 py-3.5 sm:px-7 sm:py-4 lg:pl-14 lg:pr-10">
            <p className="text-[10px] font-medium tracking-[0.04em] text-[#94A3B8]">
              VFBCAI · GUIDE
            </p>
            <h2 className="mt-1 break-keep text-[14.5px] font-semibold leading-snug text-[#0B2A6B] sm:text-[15px]">
              {config.guideTitle}
            </h2>
            <p className="mt-1.5 break-keep text-[12px] leading-relaxed text-[#64748B] sm:text-[12.5px]">
              {config.guideIntro}
            </p>
          </header>

          <div className="space-y-5 px-5 py-4 sm:space-y-5 sm:px-7 sm:py-5 lg:pl-14 lg:pr-10">
            <section aria-labelledby="mq-guide-summary">
              <SectionHeading id="mq-guide-summary" number="1" title="핵심 요약" />
              <p className="break-keep text-[12.5px] leading-[1.7] text-[#334155] sm:text-[13px] sm:leading-[1.65]">
                {summary}
              </p>
            </section>

            {processSteps.length > 0 ? (
              <section aria-labelledby="mq-guide-process">
                <SectionHeading id="mq-guide-process" number="2" title="진행 순서" />
                <ol className="space-y-0">
                  {processSteps.map((step, index) => (
                    <li
                      key={step}
                      className="flex gap-2.5 border-b border-[#EEF2F7] py-2 last:border-b-0 last:pb-0 first:pt-0"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EEF2F7] text-[10px] font-semibold tabular-nums text-[#0B2A6B]">
                        {index + 1}
                      </span>
                      <span className="min-w-0 break-keep pt-0.5 text-[12.5px] leading-snug text-[#334155] sm:text-[13px]">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {checkpoints.length > 0 ? (
              <section aria-labelledby="mq-guide-check">
                <SectionHeading id="mq-guide-check" number="3" title="먼저 확인할 항목" />
                <ul className="divide-y divide-[#EEF2F7]">
                  {checkpoints.map((item) => (
                    <li key={item.title} className="py-2 first:pt-0 last:pb-0">
                      <p className="break-keep text-[12.5px] font-medium leading-snug text-[#0B2A6B] sm:text-[13px]">
                        {item.title}
                      </p>
                      {item.body ? (
                        <p className="mt-0.5 break-keep text-[11.5px] leading-relaxed text-[#64748B] sm:text-[12px]">
                          {item.body}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {(beforeItems.length > 0 || afterItems.length > 0) && (
              <section
                aria-labelledby="mq-guide-timing"
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
              >
                {beforeItems.length > 0 ? (
                  <div className="min-w-0">
                    <h3
                      id="mq-guide-timing"
                      className="text-[12px] font-semibold text-[#0B2A6B] sm:text-[12.5px]"
                    >
                      진행 전
                    </h3>
                    <ul className="mt-1.5 space-y-1.5">
                      {beforeItems.map((item) => (
                        <li
                          key={item}
                          className="flex gap-2 break-keep text-[11.5px] leading-relaxed text-[#475569] sm:text-[12px]"
                        >
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#94A3B8]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {afterItems.length > 0 ? (
                  <div className="min-w-0">
                    <h3 className="text-[12px] font-semibold text-[#0B2A6B] sm:text-[12.5px]">
                      보완·추가 확인
                    </h3>
                    <ul className="mt-1.5 space-y-1.5">
                      {afterItems.map((item) => (
                        <li
                          key={item}
                          className="flex gap-2 break-keep text-[11.5px] leading-relaxed text-[#475569] sm:text-[12px]"
                        >
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#94A3B8]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>
            )}

            {(cautionItems.length > 0 || materials.length > 0) && (
              <section
                aria-labelledby="mq-guide-notes"
                className="grid grid-cols-1 gap-3 border-t border-[#E5E7EB] pt-4 sm:grid-cols-2 sm:gap-4"
              >
                {cautionItems.length > 0 ? (
                  <div className="min-w-0">
                    <h3
                      id="mq-guide-notes"
                      className="text-[12px] font-semibold text-[#0B2A6B] sm:text-[12.5px]"
                    >
                      주의할 점
                    </h3>
                    <ul className="mt-1.5 space-y-1.5">
                      {cautionItems.map((item) => (
                        <li
                          key={item}
                          className="break-keep text-[11.5px] leading-relaxed text-[#64748B] sm:text-[12px]"
                        >
                          · {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {materials.length > 0 ? (
                  <div className="min-w-0">
                    <h3 className="text-[12px] font-semibold text-[#0B2A6B] sm:text-[12.5px]">
                      준비하면 좋은 자료
                    </h3>
                    <ul className="mt-1.5 space-y-1.5">
                      {materials.map((item) => (
                        <li
                          key={item}
                          className="break-keep text-[11.5px] leading-relaxed text-[#64748B] sm:text-[12px]"
                        >
                          · {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>
            )}

            <section
              aria-labelledby="mq-guide-official"
              className="rounded-[6px] border border-[#E5E7EB] bg-[#F8FAFC] px-3.5 py-3 sm:px-4 sm:py-3"
            >
              <h3
                id="mq-guide-official"
                className="text-[12px] font-semibold text-[#0B2A6B] sm:text-[12.5px]"
              >
                공식 자료
              </h3>
              <p className="mt-1 break-keep text-[11.5px] leading-relaxed text-[#64748B] sm:text-[12px]">
                {config.officialNote}
              </p>
              <a
                href={config.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-medium text-[#2563EB] hover:underline sm:text-[12px]"
              >
                공식 포털 열기
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            </section>

            <section aria-labelledby="mq-guide-next" className="border-t border-[#E5E7EB] pt-4 sm:pt-5">
              <h3
                id="mq-guide-next"
                className="text-[12px] font-semibold text-[#0B2A6B] sm:text-[12.5px]"
              >
                다음 단계
              </h3>
              <div className="mt-2.5 flex flex-col gap-2 sm:mt-3 sm:flex-row sm:gap-2.5">
                <Link
                  href={detailHref}
                  className="inline-flex min-h-10 flex-1 items-center justify-center rounded-[8px] border border-[#D8DEE8] bg-white px-4 text-[12.5px] font-medium text-[#0B2A6B] transition hover:bg-[#F8FAFC]"
                >
                  더 자세히 보기 →
                </Link>
                <button
                  type="button"
                  onClick={onGoLookup}
                  className="inline-flex min-h-10 flex-1 items-center justify-center rounded-[8px] bg-[#0B2A6B] px-4 text-[12.5px] font-semibold text-white transition hover:bg-[#082258]"
                >
                  내 상황 확인하기 →
                </button>
              </div>
              <p className="mt-2.5 break-keep text-[11px] leading-relaxed text-[#94A3B8]">
                가이드 전문은 「더 자세히 보기」에서, 맞춤 확인은 「내 상황 확인하기」에서 이어갑니다.
              </p>
            </section>
          </div>
        </article>
      </div>

      <OfficialTrustZone engine={config.engine} variant="panel" className="mt-0" />

      <p className="mx-auto max-w-3xl break-keep px-1 text-center text-[11px] leading-[1.7] text-[#94A3B8] sm:text-[11.5px]">
        {COST_CHECK_DISCLAIMER}
      </p>
    </div>
  );
}
