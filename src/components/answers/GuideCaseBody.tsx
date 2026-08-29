import Link from "next/link";
import type { PublishedArticle, ArticleSection } from "@/lib/contentPacks/types";
import {
  ANONYMOUS_GUIDE_DISCLAIMER,
  ANONYMOUS_MYPAGE_CTA,
} from "@/lib/anonymousLegalGuide";
import { getRequiredDocuments } from "@/lib/requiredDocuments";
import { COST_CHECK_DISCLAIMER, getCostCheckService } from "@/lib/costCheck";
import { guidePath } from "@/lib/contentPacks/paths";
import { resolveGuideView } from "@/lib/contentPacks/parseGuideArticleView";

const PAGE_CONTAINER = "mx-auto w-full min-w-0 max-w-[800px] px-4 py-10 sm:px-6 sm:py-14";

function SectionHeading({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="text-lg font-semibold text-[#0B2A6B] sm:text-xl">
      {children}
    </h2>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-[15px] leading-relaxed text-[#556070]">
          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-900/70" />
          <span className="break-keep">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ArticleSectionBlock({ section }: { section: ArticleSection }) {
  if (section.type === "h2") {
    return (
      <h3 className="mt-10 text-lg font-semibold text-[#0B2A6B] first:mt-0">{section.text}</h3>
    );
  }
  if (section.type === "bullets") {
    return <BulletList items={section.items} />;
  }
  if (section.type === "numbered") {
    return (
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-[#556070]">
        {section.items.map((item) => (
          <li key={item} className="break-keep">
            {item}
          </li>
        ))}
      </ol>
    );
  }
  return <p className="mt-3 text-[15px] leading-relaxed text-[#556070]">{section.text}</p>;
}

function funnelHrefWithStart(href: string): string {
  return href.includes("?") ? `${href}&start=check` : `${href}?start=check`;
}

type GuideCaseBodyProps = {
  article: PublishedArticle;
};

export function GuideCaseBody({ article }: GuideCaseBodyProps) {
  const landing = article.caseLanding;
  const view = resolveGuideView(article);
  const docs = getRequiredDocuments(article.serviceType);
  const showDocuments = landing.showDocuments !== false;
  const showOfficialCost = landing.showOfficialCost === true;
  const costService =
    showOfficialCost &&
    (article.serviceType === "trc" ||
      article.serviceType === "wp" ||
      article.serviceType === "tamtru" ||
      article.serviceType === "driving-license" ||
      article.serviceType === "register_company_individual" ||
      article.serviceType === "company")
      ? getCostCheckService(
          article.serviceType === "register_company_individual" || article.serviceType === "company"
            ? "company"
            : article.serviceType
        )
      : null;

  const sources = [...landing.sources];
  if (costService && !sources.some((item) => item.label === costService.source)) {
    sources.push({
      label: costService.source,
      detail: `정부 수수료 ${costService.governmentFee} — 비용 안내에만 사용`,
    });
  }

  const sectionClass = "mt-10 border-b border-slate-200/80 pb-10 last:border-b-0";

  return (
    <article className={PAGE_CONTAINER}>
      <header className="border-b border-slate-200/80 pb-8">
        <p className="text-sm font-medium text-blue-900/70">
          VFBCAI 가이드 &gt; {article.serviceLabel}
        </p>
        <h1 className="mt-3 break-keep text-2xl font-bold leading-tight tracking-tight text-[#0B2A6B] sm:text-[1.75rem]">
          {article.title}
        </h1>
        {article.subtitle ? (
          <p className="mt-3 break-keep text-base leading-relaxed text-[#556070] sm:text-[17px]">
            {article.subtitle}
          </p>
        ) : null}
      </header>

      {landing.customerSituationSummary ? (
        <section className={sectionClass} aria-labelledby="guide-customer-core">
          <SectionHeading id="guide-customer-core">이번 사건의 핵심</SectionHeading>
          <p className="mt-3 break-keep text-[15px] leading-relaxed text-[#556070]">
            {landing.customerSituationSummary}
          </p>
          {(landing.customerReviewPoints ?? []).length > 0 ? (
            <BulletList items={landing.customerReviewPoints ?? []} />
          ) : null}
        </section>
      ) : null}

      <section className={sectionClass} aria-labelledby="guide-answer">
        <SectionHeading id="guide-answer">직접적인 답변</SectionHeading>
        {landing.question ? (
          <p className="mt-3 break-keep text-[15px] font-medium leading-relaxed text-[#0B2A6B]">
            {landing.question}
          </p>
        ) : null}
        <p className="mt-3 break-keep text-[1.0625rem] font-medium leading-relaxed text-slate-900 sm:text-lg">
          {landing.directAnswer}
        </p>
        <p className="mt-5 text-sm font-semibold text-slate-400">왜 그런가</p>
        <p className="mt-2 break-keep text-[15px] leading-relaxed text-[#556070]">{landing.why}</p>
      </section>

      {view.caseCheckpoints.length > 0 ? (
        <section className={sectionClass} aria-labelledby="guide-key-points">
          <SectionHeading id="guide-key-points">이 사건에서 중요한 점</SectionHeading>
          <ul className="mt-4 space-y-4">
            {view.caseCheckpoints.map((item) => (
              <li key={item.title}>
                <p className="text-[15px] font-semibold text-[#0B2A6B]">{item.title}</p>
                {item.body ? (
                  <p className="mt-1.5 text-[15px] leading-relaxed text-[#556070]">{item.body}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {landing.officialBasis.length > 0 ? (
        <section className={sectionClass} aria-labelledby="guide-basis">
          <SectionHeading id="guide-basis">관련 법령</SectionHeading>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            아래는 관련해 자주 언급되는 법령 번호입니다. 이 페이지의 서류 목록을 해당 법령에서 추출했다는
            뜻이 아니며, 구체 조항(Điều/Khoản)은 여기에 없습니다.
          </p>
          <BulletList items={landing.officialBasis} />
        </section>
      ) : null}

      {landing.conditions.length > 0 ? (
        <section className={sectionClass} aria-labelledby="guide-conditions">
          <SectionHeading id="guide-conditions">필요한 조건</SectionHeading>
          <BulletList items={landing.conditions} />
        </section>
      ) : null}

      {showDocuments ? (
        <section className={sectionClass} aria-labelledby="guide-docs">
          <SectionHeading id="guide-docs">필요한 서류</SectionHeading>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            아래는 VFBCAI가 같은 플랫폼의 {docs.serviceLabel} 서류 목록으로 정리한 참고용입니다. 법령
            조항에서 확정한 제출 목록이 아니며, 선택 항목의 세부 구성은 이 목록에 정해져 있지 않습니다.
          </p>
          <p className="mt-4 text-[15px] font-semibold text-slate-800">우선 제출</p>
          <BulletList items={docs.documents} />
          {docs.optionalDocuments && docs.optionalDocuments.length > 0 ? (
            <>
              <p className="mt-5 text-[15px] font-semibold text-slate-800">있으면 제출</p>
              <BulletList items={docs.optionalDocuments} />
            </>
          ) : null}
        </section>
      ) : null}

      {landing.process.length > 0 ? (
        <section className={sectionClass} aria-labelledby="guide-process">
          <SectionHeading id="guide-process">절차</SectionHeading>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-[#556070]">
            {landing.process.map((item) => (
              <li key={item} className="break-keep">
                {item}
              </li>
            ))}
          </ol>
          {!showOfficialCost && landing.durationNote ? (
            <p className="mt-4 text-[15px] leading-relaxed text-[#556070]">{landing.durationNote}</p>
          ) : null}
        </section>
      ) : null}

      {showOfficialCost || landing.costNote ? (
        <section className={sectionClass} aria-labelledby="guide-cost">
          <SectionHeading id="guide-cost">비용</SectionHeading>
          {landing.costNote ? (
            <p className="mt-3 text-[15px] leading-relaxed text-[#556070]">{landing.costNote}</p>
          ) : null}
          {costService ? (
            <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-[#556070]">
              <li>
                <span className="font-semibold text-slate-800">정부 수수료</span>
                <span> — {costService.governmentFee}</span>
              </li>
              <li>
                <span className="font-semibold text-slate-800">출처</span>
                <span> — {costService.source}</span>
              </li>
              <li>{costService.lookupGuide}</li>
            </ul>
          ) : null}
          {showOfficialCost && landing.durationNote ? (
            <p className="mt-4 text-[15px] leading-relaxed text-[#556070]">{landing.durationNote}</p>
          ) : null}
          {showOfficialCost ? (
            <p className="mt-4 text-sm leading-relaxed text-slate-500">{COST_CHECK_DISCLAIMER}</p>
          ) : null}
        </section>
      ) : null}

      {(view.beforeAction.length > 0 || view.afterAction.length > 0) && (
        <section className={sectionClass} aria-labelledby="guide-before-after">
          <SectionHeading id="guide-before-after">계약·제출 전 / 후</SectionHeading>
          {view.beforeAction.length > 0 ? (
            <div className="mt-4">
              <h3 className="text-[15px] font-semibold text-[#0B2A6B]">진행 전 — 무엇을 먼저 확인할까</h3>
              <BulletList items={view.beforeAction} />
            </div>
          ) : null}
          {view.afterAction.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-[15px] font-semibold text-[#0B2A6B]">문제가 발생한 후 — 무엇을 확보하고 확인할까</h3>
              <BulletList items={view.afterAction} />
            </div>
          ) : null}
        </section>
      )}

      {view.evidenceWhenProblem.length > 0 ? (
        <section className={sectionClass} aria-labelledby="guide-evidence">
          <SectionHeading id="guide-evidence">문제가 발생한 경우</SectionHeading>
          <p className="mt-3 text-[15px] leading-relaxed text-[#556070]">
            아래 자료를 확보해 두면 사실관계 확인과 대응 방향 점검에 도움이 됩니다.
          </p>
          <BulletList items={view.evidenceWhenProblem} />
        </section>
      ) : null}

      {landing.cases.length > 0 ? (
        <section className={sectionClass} aria-labelledby="guide-cases">
          <SectionHeading id="guide-cases">상황별 예시</SectionHeading>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            아래는 특정 고객의 실제 진행 기록이 아니라, 같은 질문이 자주 갈리는 대표적인 상황입니다.
          </p>
          <div className="mt-4 space-y-5">
            {landing.cases.map((item) => (
              <div key={item.title}>
                <p className="text-[15px] font-semibold text-slate-800">{item.title}</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-[#556070]">{item.body}</p>
              </div>
            ))}
          </div>
          {landing.comparison.length > 0 ? (
            <div className="mt-5 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {landing.comparison.map((item) => (
                <div key={item.label} className="grid min-w-0 gap-1 px-4 py-3 sm:grid-cols-[8.5rem_1fr] sm:gap-4">
                  <p className="text-[15px] font-semibold text-slate-800">{item.label}</p>
                  <p className="min-w-0 break-keep text-[15px] leading-relaxed text-[#556070]">{item.text}</p>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {landing.cautions.length > 0 ? (
        <section className={sectionClass} aria-labelledby="guide-caution">
          <SectionHeading id="guide-caution">자주 하는 실수</SectionHeading>
          <BulletList items={landing.cautions} />
        </section>
      ) : null}

      {landing.qa.length > 0 ? (
        <section className={sectionClass} aria-labelledby="guide-qa">
          <SectionHeading id="guide-qa">Q&A</SectionHeading>
          <dl className="mt-4 space-y-5">
            {landing.qa.map((item) => (
              <div key={item.q}>
                <dt className="text-[15px] font-semibold text-slate-800">{item.q}</dt>
                <dd className="mt-1.5 text-[15px] leading-relaxed text-[#556070]">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {article.sections.length > 0 ? (
        <section className={sectionClass} aria-label="가이드 상세 본문">
          {article.sections.map((section, index) => (
            <ArticleSectionBlock key={`${section.type}-${index}`} section={section} />
          ))}
        </section>
      ) : null}

      {landing.relatedQuestions.length > 0 ? (
        <section className={sectionClass} aria-labelledby="guide-related">
          <SectionHeading id="guide-related">관련 질문</SectionHeading>
          <nav className="mt-2 divide-y divide-slate-100">
            {landing.relatedQuestions.map((item) => (
              <Link
                key={item.href + item.question}
                href={item.href}
                className="flex min-h-11 min-w-0 items-center justify-between gap-3 py-3 text-[15px] text-slate-800 transition-colors hover:text-blue-900"
              >
                <span className="min-w-0 flex-1 break-keep">{item.question}</span>
                <span className="shrink-0 text-slate-400" aria-hidden>
                  →
                </span>
              </Link>
            ))}
          </nav>
        </section>
      ) : null}

      <section className={sectionClass} aria-labelledby="guide-updated">
        <SectionHeading id="guide-updated">마지막 업데이트</SectionHeading>
        <p className="mt-3 text-[15px] text-slate-600">최종 업데이트: {article.updatedAt}</p>
      </section>

      {sources.length > 0 ? (
        <section className={sectionClass} aria-labelledby="guide-sources">
          <SectionHeading id="guide-sources">출처</SectionHeading>
          <ul className="mt-3 space-y-2">
            {sources.map((item) => (
              <li key={item.label} className="text-[15px] leading-relaxed text-[#556070]">
                <span className="font-semibold text-slate-800">{item.label}</span>
                {item.detail ? <span className="text-slate-600"> — {item.detail}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10 border-t border-slate-200/80 pt-10" aria-labelledby="guide-cta">
        <SectionHeading id="guide-cta">내 상황 확인하기</SectionHeading>
        <p className="mt-2 text-[15px] leading-relaxed text-[#556070]">
          내 상황과 증거자료를 입력해 직접 확인합니다.
        </p>
        <div className="mt-4">
          <Link
            href={funnelHrefWithStart(article.funnelHref)}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-amber-500 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          >
            {article.funnelCtaLabel}
          </Link>
        </div>
        <p className="mt-5 text-sm leading-relaxed text-slate-600">{ANONYMOUS_GUIDE_DISCLAIMER}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{ANONYMOUS_MYPAGE_CTA}</p>
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
