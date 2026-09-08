import Link from "next/link";
import type { PublishedArticle } from "@/lib/contentPacks/types";
import type { CheckGuideIntent } from "@/lib/contentPacks/checkGuideIntent";
import { getRequiredDocuments } from "@/lib/requiredDocuments";
import {
  COST_CHECK_DISCLAIMER,
  getCostCheckService,
  type CostCheckService,
  type CostCheckServiceId,
} from "@/lib/costCheck";
import { resolveGuideView } from "@/lib/contentPacks/parseGuideArticleView";
import {
  DRIVING_LICENSE_GUIDE_SLUG,
} from "@/lib/contentPacks/drivingLicenseArticles";
import { TAMTRU_GUIDE_SLUG } from "@/lib/contentPacks/tamtruArticles";
import { WP_GUIDE_SLUG } from "@/lib/contentPacks/wpArticles";
import { TRC_GUIDE_ARTICLE } from "@/lib/contentPacks/trcArticles";
import {
  COMPANY_FDI_REVIEW_SERVICE,
  RESTAURANT_REVIEW_SERVICE,
  getRegisterReviewService,
} from "@/lib/registerCostCheck";
import {
  COMPANY_GUIDE_SLUG,
  COSMETICS_GUIDE_SLUG,
  ENVIRONMENT_GUIDE_SLUG,
  FIRE_SAFETY_GUIDE_SLUG,
  FRANCHISE_GUIDE_SLUG,
  HYGIENE_GUIDE_SLUG,
  MEDICAL_DEVICE_GUIDE_SLUG,
  RESTAURANT_GUIDE_SLUG,
} from "@/lib/contentPacks/registerArticles";
import { MasterTrcCostGuideDetail } from "@/components/cost-check/MasterTrcCostGuideDetail";
import OfficialTrustZone from "@/components/ui/OfficialTrustZone";

/** Company Master 「더 자세히 보기」 — registerArticles.COMPANY_GUIDE_SLUG 와 동일 */
const COMPANY_MASTER_GUIDE_SLUG = COMPANY_GUIDE_SLUG;
/** Restaurant Master 「더 자세히 보기」 — registerArticles.RESTAURANT_GUIDE_SLUG 와 동일 */
const RESTAURANT_MASTER_GUIDE_SLUG = RESTAURANT_GUIDE_SLUG;

const REGISTER_MASTER_GUIDE_SLUGS = new Set<string>([
  COMPANY_MASTER_GUIDE_SLUG,
  RESTAURANT_MASTER_GUIDE_SLUG,
  HYGIENE_GUIDE_SLUG,
  FIRE_SAFETY_GUIDE_SLUG,
  ENVIRONMENT_GUIDE_SLUG,
  COSMETICS_GUIDE_SLUG,
  MEDICAL_DEVICE_GUIDE_SLUG,
  FRANCHISE_GUIDE_SLUG,
]);

/** Master 「더 자세히 보기」 전용 슬러그 — TRC UI 재사용. 다른 guide는 GuideCaseBody 유지 */
export const MASTER_CHECK_GUIDE_SLUGS = new Set<string>([
  TRC_GUIDE_ARTICLE.slug,
  WP_GUIDE_SLUG,
  TAMTRU_GUIDE_SLUG,
  DRIVING_LICENSE_GUIDE_SLUG,
  ...REGISTER_MASTER_GUIDE_SLUGS,
]);

const DEFAULT_CTA_LINES = [
  "지금 확인한 내용은 일반적인 기준입니다.",
  "실제 결과는 체류기간, 국적, 현재 서류, 지역, 개인 상황에 따라 달라질 수 있습니다.",
  "내 상황을 입력하면 VFBCAI가 공식 기준과 비교하여 가장 적합한 답변을 제공합니다.",
] as const;

const DETAIL_META: Record<
  string,
  { title: string; intro: string; ctaLines?: readonly string[]; docsNote?: string }
> = {
  [TRC_GUIDE_ARTICLE.slug]: {
    title: "거주증 안내",
    intro: "신청 전에 순서·서류·관할을 한 흐름으로 정리한 참고 안내입니다.",
  },
  [WP_GUIDE_SLUG]: {
    title: "노동허가증 안내",
    intro: "진행 순서·서류·비용 구성을 진행 전에 맞춰 보는 참고 안내입니다.",
  },
  [TAMTRU_GUIDE_SLUG]: {
    title: "임시거주 안내",
    intro: "숙소 형태에 따른 준비와 신고 흐름을 정리한 참고 안내입니다.",
  },
  [DRIVING_LICENSE_GUIDE_SLUG]: {
    title: "운전면허 안내",
    intro: "교환 요건·서류·추가 비용을 진행 전에 맞춰 보는 참고 안내입니다.",
  },
  [COMPANY_MASTER_GUIDE_SLUG]: {
    title: "법인설립 안내",
    intro: "FDI 법인설립의 절차·조건·서류·주의사항을 진행 전에 맞춰 보는 참고 안내입니다.",
    docsNote:
      "플랫폼 참고 목록입니다. 투자 형태·업종·관할에 따라 추가 요청이 있을 수 있습니다.",
    ctaLines: [
      "지금 확인한 내용은 일반적인 기준입니다.",
      "실제 결과는 투자 형태, 업종, 서류 준비, 관할에 따라 달라질 수 있습니다.",
      "내 상황을 입력하면 VFBCAI가 공식 기준과 비교하여 가장 적합한 답변을 제공합니다.",
    ],
  },
  [RESTAURANT_MASTER_GUIDE_SLUG]: {
    title: "식당허가 안내",
    intro: "식당·요식업 등록의 절차·조건·서류·주의사항을 진행 전에 맞춰 보는 참고 안내입니다.",
    docsNote:
      "플랫폼 참고 목록입니다. 영업장·규모·관할에 따라 추가 요청이 있을 수 있습니다.",
    ctaLines: [
      "지금 확인한 내용은 일반적인 기준입니다.",
      "실제 결과는 영업장 준비, 규모, 서류, 관할에 따라 달라질 수 있습니다.",
      "내 상황을 입력하면 VFBCAI가 공식 기준과 비교하여 가장 적합한 답변을 제공합니다.",
    ],
  },
  [HYGIENE_GUIDE_SLUG]: {
    title: "위생허가 안내",
    intro: "위생허가의 절차·조건·서류·주의사항을 진행 전에 맞춰 보는 참고 안내입니다.",
    docsNote: "플랫폼 참고 목록입니다. 시설·관할에 따라 추가 요청이 있을 수 있습니다.",
  },
  [FIRE_SAFETY_GUIDE_SLUG]: {
    title: "소방허가 안내",
    intro: "소방허가의 절차·조건·서류·주의사항을 진행 전에 맞춰 보는 참고 안내입니다.",
    docsNote: "플랫폼 참고 목록입니다. 시설·설계·관할에 따라 추가 요청이 있을 수 있습니다.",
  },
  [ENVIRONMENT_GUIDE_SLUG]: {
    title: "환경허가 안내",
    intro: "환경허가의 절차·조건·서류·주의사항을 진행 전에 맞춰 보는 참고 안내입니다.",
    docsNote: "플랫폼 참고 목록입니다. 사업 규모·관할에 따라 추가 요청이 있을 수 있습니다.",
  },
  [COSMETICS_GUIDE_SLUG]: {
    title: "화장품허가 안내",
    intro: "화장품허가의 절차·조건·서류·주의사항을 진행 전에 맞춰 보는 참고 안내입니다.",
    docsNote: "플랫폼 참고 목록입니다. 제품·관할에 따라 추가 요청이 있을 수 있습니다.",
  },
  [MEDICAL_DEVICE_GUIDE_SLUG]: {
    title: "의료기기 허가 안내",
    intro: "의료기기 허가의 절차·조건·서류·주의사항을 진행 전에 맞춰 보는 참고 안내입니다.",
    docsNote: "플랫폼 참고 목록입니다. 등급·관할에 따라 추가 요청이 있을 수 있습니다.",
  },
  [FRANCHISE_GUIDE_SLUG]: {
    title: "프랜차이즈 등록 안내",
    intro: "프랜차이즈 등록의 절차·조건·서류·주의사항을 진행 전에 맞춰 보는 참고 안내입니다.",
    docsNote: "플랫폼 참고 목록입니다. 등록 범위·관할에 따라 추가 요청이 있을 수 있습니다.",
  },
};

const GUIDE_SLUG_TO_REVIEW_ID: Record<string, CostCheckServiceId> = {
  [COMPANY_MASTER_GUIDE_SLUG]: "company",
  [RESTAURANT_MASTER_GUIDE_SLUG]: "restaurant",
  [HYGIENE_GUIDE_SLUG]: "hygiene",
  [FIRE_SAFETY_GUIDE_SLUG]: "fire-safety",
  [ENVIRONMENT_GUIDE_SLUG]: "environment",
  [COSMETICS_GUIDE_SLUG]: "cosmetics",
  [MEDICAL_DEVICE_GUIDE_SLUG]: "medical-device",
  [FRANCHISE_GUIDE_SLUG]: "franchise",
};

function resolveDetailCostService(article: PublishedArticle): CostCheckService | null {
  const reviewId = GUIDE_SLUG_TO_REVIEW_ID[article.slug];
  if (reviewId) {
    if (reviewId === "company") return COMPANY_FDI_REVIEW_SERVICE;
    if (reviewId === "restaurant") return RESTAURANT_REVIEW_SERVICE;
    return getRegisterReviewService(reviewId);
  }
  if (
    article.serviceType === "trc" ||
    article.serviceType === "wp" ||
    article.serviceType === "tamtru" ||
    article.serviceType === "driving-license"
  ) {
    return getCostCheckService(article.serviceType);
  }
  return null;
}

function funnelHrefWithStart(href: string): string {
  return href.includes("?") ? `${href}&start=check` : `${href}?start=check`;
}

function displayCaseTitle(title: string): string {
  return title.replace(/^대표적인 상황:\s*/, "").trim();
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
 * CHECK 4개 「더 자세히 보기」 전용 본문.
 * TRC + intent=cost 만 표준 비용 상세로 분기하고, 그 외는 고정 Guide를 유지한다.
 */
export function MasterCheckGuideDetail({
  article,
  intent = null,
  question = null,
}: {
  article: PublishedArticle;
  intent?: CheckGuideIntent | null;
  question?: string | null;
}) {
  if (
    intent === "cost" &&
    article.serviceType === "trc" &&
    article.slug === TRC_GUIDE_ARTICLE.slug
  ) {
    return <MasterTrcCostGuideDetail article={article} question={question} />;
  }

  const landing = article.caseLanding;
  const view = resolveGuideView(article);
  const docs = getRequiredDocuments(article.serviceType);
  const meta = DETAIL_META[article.slug] ?? {
    title: article.serviceLabel,
    intro: article.subtitle ?? "",
  };
  const ctaLines = meta.ctaLines ?? DEFAULT_CTA_LINES;
  const docsNote =
    meta.docsNote ??
    "플랫폼 참고 목록입니다. 관할·비자·고용 형태에 따라 추가 요청이 있을 수 있습니다.";

  const showOfficialCost = landing.showOfficialCost === true;
  const costService = resolveDetailCostService(article);

  const sources = [...landing.sources];
  if (costService && !sources.some((item) => item.label === costService.source)) {
    sources.push({
      label: costService.source,
      detail: `정부 수수료 ${costService.governmentFee} — 비용 안내에만 사용`,
    });
  }

  const primaryDocs = docs.documents;
  const optionalDocs = docs.optionalDocuments ?? [];
  const showDocs = primaryDocs.length > 0;
  const checkpoints = view.caseCheckpoints.slice(0, 4);
  const beforeItems = view.beforeAction.slice(0, 4);
  const afterItems = view.afterAction.slice(0, 4);
  const evidence = view.evidenceWhenProblem.slice(0, 4);
  const cases = landing.cases.slice(0, 3);
  const cautions = landing.cautions.slice(0, 4);
  const qa = landing.qa.slice(0, 5);
  const comparison = landing.comparison.slice(0, 4);
  const isCompanyGuide = REGISTER_MASTER_GUIDE_SLUGS.has(article.slug);

  const processSection =
    landing.process.length > 0 ? (
      <section
        className={isCompanyGuide ? "mt-0" : "mt-8 sm:mt-9"}
        aria-labelledby="mcd-process"
      >
        <SectionTitle id="mcd-process">진행 순서</SectionTitle>
        <ol className="mt-3 space-y-0">
          {landing.process.map((step, index) => (
            <li
              key={step}
              className="flex gap-2.5 border-b border-[#EEF2F7] py-2.5 last:border-b-0"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EEF2F7] text-[10px] font-semibold tabular-nums text-[#0B2A6B]">
                {index + 1}
              </span>
              <span className="min-w-0 break-keep pt-0.5 text-[13px] leading-snug text-[#334155] sm:text-[13.5px]">
                {step}
              </span>
            </li>
          ))}
        </ol>
        {landing.durationNote ? (
          <p className="mt-3 break-keep text-[12px] leading-relaxed text-[#64748B] sm:text-[12.5px]">
            {landing.durationNote}
          </p>
        ) : null}
      </section>
    ) : null;

  const checkpointsSection =
    checkpoints.length > 0 ? (
      <section
        className={isCompanyGuide ? "mt-0" : "mt-8 sm:mt-9"}
        aria-labelledby="mcd-check"
      >
        <SectionTitle id="mcd-check">먼저 볼 항목</SectionTitle>
        <ul className="mt-3 divide-y divide-[#EEF2F7]">
          {checkpoints.map((item) => (
            <li key={item.title} className="py-2.5 first:pt-0 last:pb-0">
              <p className="break-keep text-[13px] font-medium leading-snug text-[#0B2A6B] sm:text-[13.5px]">
                {item.title}
              </p>
              {item.body ? (
                <p className="mt-1 break-keep text-[12.5px] leading-relaxed text-[#64748B] sm:text-[13px]">
                  {item.body}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    ) : null;

  const restBody = (
    <>
      {showDocs ? (
        <section className="mt-8 sm:mt-9" aria-labelledby="mcd-docs">
          <SectionTitle id="mcd-docs">준비 서류</SectionTitle>
          <p className="mt-2.5 break-keep text-[12px] leading-relaxed text-[#94A3B8] sm:text-[12.5px]">
            {docsNote}
          </p>
          <div className="mt-3">
            <p className="text-[12px] font-medium text-[#0B2A6B] sm:text-[12.5px]">우선 준비</p>
            <ul className="mt-1.5 space-y-1.5">
              {primaryDocs.map((item) => (
                <li
                  key={item}
                  className="break-keep text-[12.5px] leading-relaxed text-[#475569] sm:text-[13px]"
                >
                  · {item}
                </li>
              ))}
            </ul>
          </div>
          {optionalDocs.length > 0 ? (
            <div className="mt-4">
              <p className="text-[12px] font-medium text-[#0B2A6B] sm:text-[12.5px]">있으면 함께</p>
              <ul className="mt-1.5 space-y-1.5">
                {optionalDocs.map((item) => (
                  <li
                    key={item}
                    className="break-keep text-[12.5px] leading-relaxed text-[#475569] sm:text-[13px]"
                  >
                    · {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {showOfficialCost || landing.costNote ? (
        <section className="mt-8 sm:mt-9" aria-labelledby="mcd-cost">
          <SectionTitle id="mcd-cost">비용</SectionTitle>
          {landing.costNote ? (
            <p className="mt-3 break-keep text-[12.5px] leading-[1.7] text-[#475569] sm:text-[13px]">
              {landing.costNote}
            </p>
          ) : null}
          {costService && showOfficialCost ? (
            <dl className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-[#475569] sm:text-[13px]">
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-[#0B2A6B]">정부 수수료</dt>
                <dd>{costService.governmentFee}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-[#0B2A6B]">출처</dt>
                <dd className="break-keep">{costService.source}</dd>
              </div>
              <p className="break-keep text-[#64748B]">{costService.lookupGuide}</p>
            </dl>
          ) : null}
          {showOfficialCost ? (
            <p className="mt-3 break-keep text-[11.5px] leading-relaxed text-[#94A3B8]">
              {COST_CHECK_DISCLAIMER}
            </p>
          ) : null}
        </section>
      ) : null}

      {(beforeItems.length > 0 || afterItems.length > 0) && (
        <section
          className="mt-8 grid grid-cols-1 items-start gap-6 sm:mt-9 sm:grid-cols-2 sm:gap-8"
          aria-labelledby="mcd-timing"
        >
          {beforeItems.length > 0 ? (
            <div className="min-w-0">
              <h3
                id="mcd-timing"
                className="text-[12.5px] font-semibold text-[#0B2A6B] sm:text-[13px]"
              >
                진행 전
              </h3>
              <ul className="mt-2 space-y-2">
                {beforeItems.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 break-keep text-[12.5px] leading-relaxed text-[#475569] sm:text-[13px]"
                  >
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#94A3B8]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {afterItems.length > 0 ? (
            <div className="min-w-0">
              <h3 className="text-[12.5px] font-semibold text-[#0B2A6B] sm:text-[13px]">
                보완·추가 확인
              </h3>
              <ul className="mt-2 space-y-2">
                {afterItems.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 break-keep text-[12.5px] leading-relaxed text-[#475569] sm:text-[13px]"
                  >
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#94A3B8]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      )}

      {evidence.length > 0 ? (
        <section className="mt-8 sm:mt-9" aria-labelledby="mcd-evidence">
          <SectionTitle id="mcd-evidence">문제 발생 시 확보할 자료</SectionTitle>
          <ul className="mt-3 space-y-1.5">
            {evidence.map((item) => (
              <li
                key={item}
                className="break-keep text-[12.5px] leading-relaxed text-[#475569] sm:text-[13px]"
              >
                · {item}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {cases.length > 0 ? (
        <section className="mt-8 sm:mt-9" aria-labelledby="mcd-cases">
          <SectionTitle id="mcd-cases">자주 갈리는 상황</SectionTitle>
          <p className="mt-2.5 break-keep text-[12px] leading-relaxed text-[#94A3B8] sm:text-[12.5px]">
            특정 고객 기록이 아니라, 같은 질문이 반복되는 유형입니다.
          </p>
          <div className="mt-4 space-y-5">
            {cases.map((item) => (
              <div key={item.title} className="min-w-0">
                <p className="break-keep text-pretty text-[13px] font-medium leading-snug text-[#0B2A6B] sm:text-[13.5px]">
                  {displayCaseTitle(item.title)}
                </p>
                <p className="mt-1.5 break-keep text-pretty text-[12.5px] leading-[1.7] text-[#64748B] sm:text-[13px]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
          {comparison.length > 0 ? (
            <ul className="mt-5 divide-y divide-[#EEF2F7] border-t border-[#E5E7EB] pt-1">
              {comparison.map((item) => (
                <li key={item.label} className="grid items-start gap-1 py-3 sm:grid-cols-[7.5rem_1fr] sm:gap-4">
                  <p className="break-keep text-pretty text-[12px] font-medium text-[#0B2A6B] sm:text-[12.5px]">
                    {item.label}
                  </p>
                  <p className="min-w-0 break-keep text-pretty text-[12.5px] leading-relaxed text-[#64748B] sm:text-[13px]">
                    {item.text}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {cautions.length > 0 ? (
        <section className="mt-8 sm:mt-9" aria-labelledby="mcd-caution">
          <SectionTitle id="mcd-caution">주의할 점</SectionTitle>
          <ul className="mt-3 space-y-1.5">
            {cautions.map((item) => (
              <li
                key={item}
                className="break-keep text-[12.5px] leading-relaxed text-[#64748B] sm:text-[13px]"
              >
                · {item}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {qa.length > 0 ? (
        <section className="mt-8 sm:mt-9" aria-labelledby="mcd-qa">
          <SectionTitle id="mcd-qa">자주 묻는 질문</SectionTitle>
          <dl className="mt-3 space-y-4">
            {qa.map((item) => (
              <div key={item.q}>
                <dt className="break-keep text-[13px] font-medium leading-snug text-[#0B2A6B] sm:text-[13.5px]">
                  {item.q}
                </dt>
                <dd className="mt-1.5 break-keep text-[12.5px] leading-[1.7] text-[#64748B] sm:text-[13px]">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {landing.officialBasis.length > 0 || sources.length > 0 ? (
        <section className="mt-8 sm:mt-9" aria-labelledby="mcd-law">
          <SectionTitle id="mcd-law">참고 법령·출처</SectionTitle>
          {landing.officialBasis.length > 0 ? (
            <>
              <p className="mt-2.5 break-keep text-[12px] leading-relaxed text-[#94A3B8] sm:text-[12.5px]">
                자주 언급되는 법령 번호입니다. 구체 조항 적용은 개별 확인이 필요합니다.
              </p>
              <ul className="mt-2 space-y-1.5">
                {landing.officialBasis.map((item) => (
                  <li
                    key={item}
                    className="break-keep text-[12.5px] leading-relaxed text-[#64748B] sm:text-[13px]"
                  >
                    · {item}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {sources.length > 0 ? (
            <ul className="mt-3 space-y-1.5">
              {sources.map((item) => (
                <li
                  key={item.label}
                  className="break-keep text-[12px] leading-relaxed text-[#94A3B8] sm:text-[12.5px]"
                >
                  {item.label}
                  {item.detail ? ` — ${item.detail}` : ""}
                </li>
              ))}
            </ul>
          ) : null}
          <p className="mt-3 text-[11.5px] text-[#94A3B8]">업데이트 {article.updatedAt}</p>
        </section>
      ) : null}

      <section
        className="mt-9 border-t border-[#E5E7EB] pt-6 sm:mt-10 sm:pt-7"
        aria-labelledby="mcd-cta"
      >
        <div className="space-y-2 break-keep text-[12.5px] leading-relaxed text-[#64748B] sm:text-[13px]">
          {ctaLines.map((line, index) => (
            <p key={line} id={index === 0 ? "mcd-cta" : undefined}>
              {line}
            </p>
          ))}
        </div>
        <Link
          href={funnelHrefWithStart(article.funnelHref)}
          className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-[8px] bg-[#0B2A6B] px-4 text-[12.5px] font-semibold text-white transition hover:bg-[#082258] sm:w-auto sm:min-w-[200px]"
        >
          내 상황 확인하기 →
        </Link>
      </section>
    </>
  );

  return (
    <article
      className="mx-auto w-full min-w-0 max-w-[840px] px-5 py-8 sm:px-7 sm:py-10 lg:pl-14 lg:pr-10 lg:py-12"
      data-guide-intent={intent ?? undefined}
      data-guide-question={question ?? undefined}
    >
      <header className="border-b border-[#E5E7EB] pb-5 sm:pb-6">
        <p className="text-[10px] font-medium tracking-[0.04em] text-[#94A3B8]">
          VFBCAI · {article.serviceLabel}
        </p>
        <h1 className="mt-1.5 break-keep text-[1.35rem] font-semibold leading-snug tracking-tight text-[#0B2A6B] sm:text-[1.5rem]">
          {meta.title}
        </h1>
        <p className="mt-2 break-keep text-[13px] leading-relaxed text-[#64748B] sm:text-[13.5px]">
          {meta.intro}
        </p>
      </header>

      <section className="mt-7 sm:mt-8" aria-labelledby="mcd-summary">
        <SectionTitle id="mcd-summary">요약</SectionTitle>
        {landing.question ? (
          <p className="mt-3 break-keep text-[12.5px] font-medium leading-relaxed text-[#0B2A6B] sm:text-[13px]">
            {landing.question}
          </p>
        ) : null}
        <p className="mt-2 break-keep text-[13.5px] font-medium leading-[1.7] text-[#0F172A] sm:text-[14px] sm:leading-[1.65]">
          {landing.directAnswer}
        </p>
        <p className="mt-3 break-keep text-[12.5px] leading-[1.7] text-[#64748B] sm:text-[13px]">
          {landing.why}
        </p>
      </section>

      {isCompanyGuide ? (
        /*
          Company STEP 3 — single OfficialTrustZone (no md:hidden duplicate).
          PC (md+, viewport ≥768 CSS px): grid 2-col
            left = 진행 순서 + 먼저 볼 항목, right = OFFICIAL SOURCES (top-aligned).
            restBody full-width row below (docs → CTA). Sources must NOT sit under CTA.
          Mobile (<md): flex + max-md:order — process → checkpoints → restBody → sources last.
          Note: IDE side-browser can show outerWidth 1280 with innerWidth ~384 → mobile path.
        */
        <div className="mt-8 flex flex-col gap-8 sm:mt-9 md:grid md:grid-cols-[minmax(0,1fr)_minmax(220px,260px)] md:items-start md:gap-x-8 md:gap-y-8">
          <div className="max-md:contents min-w-0 md:col-start-1 md:row-span-2 md:row-start-1 md:flex md:flex-col md:gap-8">
            <div className="max-md:order-1 min-w-0">{processSection}</div>
            <div className="max-md:order-2 min-w-0">{checkpointsSection}</div>
          </div>
          <div className="max-md:order-4 min-w-0 md:col-start-2 md:row-span-2 md:row-start-1 md:self-start">
            <OfficialTrustZone engine="register" variant="panel" className="mt-0 w-full" />
          </div>
          <div className="max-md:order-3 min-w-0 md:col-span-2 md:col-start-1 md:row-start-3">
            {restBody}
          </div>
        </div>
      ) : (
        <>
          {processSection}
          {checkpointsSection}
          {restBody}
        </>
      )}
    </article>
  );
}
