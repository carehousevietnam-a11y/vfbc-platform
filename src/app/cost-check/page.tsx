"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Calculator,
  CircleCheck,
  ClipboardCheck,
  ClipboardPen,
  Cpu,
  FileSearch,
  Globe,
  Headset,
  Lightbulb,
  Lock,
  Scale,
  Search,
  Shield,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import {
  COST_CHECK_DISCLAIMER,
  COST_CHECK_SERVICES,
  evaluateCostQuoteReview,
  formatCostAmount,
  getCostCheckService,
  type CostCheckService,
  type CostCheckServiceId,
  type CostCheckTab,
  type CostCheckCurrency,
} from "@/lib/costCheck";
import { CostCheckCard } from "@/components/cost-check/CostCheckCard";
import { OfficialSourceList } from "@/components/cost-check/OfficialSourceList";
import { WpRegionalOfficialFee } from "@/components/cost-check/WpRegionalOfficialFee";
import SiteHeader from "@/components/home/SiteHeader";
import { ENGINE_CONTAINER } from "@/components/engine/EngineLandingChrome";
import { hasCostSignal, matchCostCheckService } from "@/lib/aiCostSection";
import {
  buildMasterFunnelServiceHref,
  extractAmountFromQuery,
  resolveMasterFunnelTabForService,
  resolveMasterFunnelTabFromQuery,
  type MasterFunnelContextTab,
} from "@/lib/masterFunnelEntry";
import { getTrcArticleByIntent, resolveTrcArticleIntent } from "@/lib/contentPacks/intentRouter";
import { guidePath } from "@/lib/contentPacks/paths";
import { getPublishedArticleBySlug } from "@/lib/contentPacks/registry";
import { WP_GUIDE_SLUG } from "@/lib/contentPacks/wpArticles";
import { getQuoteFunnelHref } from "@/lib/quoteReviewLinks";
import { getVerifyMasterLanding } from "@/components/cost-check/MasterFunnelLanding";
import { GuideCaseFunnelSummary } from "@/components/answers/GuideCaseFunnelSummary";
import type { PublishedArticle } from "@/lib/contentPacks/types";
import {
  getCheckServiceItems,
  getRegisterServiceItems,
  getVerifyServiceItems,
} from "@/components/home/HomeServiceAccordion";

const TABS: { id: CostCheckTab; label: string; desc: string; icon: LucideIcon }[] = [
  { id: "lookup", label: "확인하기", desc: "직접 확인하기", icon: Search },
  { id: "review", label: "검토하기", desc: "직접 검토하기", icon: ClipboardPen },
  { id: "direct", label: "자세히 보기", desc: "관련 가이드 상세", icon: BookOpen },
];

const SERVICE_CATEGORIES = [
  { id: "lookup" as const, label: "직접 확인하기" },
  { id: "review" as const, label: "직접 검토하기" },
  { id: "direct" as const, label: "직접 인허가 받기" },
];

type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]["id"];

type CatalogServiceItem = {
  key: string;
  title: string;
  desc: string;
  href: string;
};

function getCatalogServicesForCategory(category: ServiceCategory): CatalogServiceItem[] {
  if (category === "lookup") return getCheckServiceItems();
  if (category === "review") return getVerifyServiceItems();
  return getRegisterServiceItems();
}

function resolveCostCheckServiceIdFromHref(href: string): CostCheckServiceId | null {
  const service = COST_CHECK_SERVICES.find((item) => item.ctaHref === href);
  return service?.id ?? null;
}

const VALID_TABS = new Set<CostCheckTab>(["lookup", "review", "direct"]);

function parseTabParam(value: string | null): CostCheckTab {
  if (value && VALID_TABS.has(value as CostCheckTab)) {
    return value as CostCheckTab;
  }
  return "lookup";
}

function inferServiceFromQuery(q: string): CostCheckServiceId | "" {
  return matchCostCheckService(q)?.id ?? "";
}

function resolveTabFromQuery(q: string, preferredTab?: CostCheckTab): CostCheckTab {
  return resolveMasterFunnelTabFromQuery(q, preferredTab as MasterFunnelContextTab | undefined);
}

function masterServiceHref(
  serviceId: CostCheckServiceId,
  query: string,
  tab?: MasterFunnelContextTab
): string {
  const service = getCostCheckService(serviceId);
  const resolvedTab = resolveMasterFunnelTabForService(service.ctaHref, query, tab ?? null);
  return buildMasterFunnelServiceHref(service.ctaHref, query, resolvedTab);
}

function tabForPickerCategory(
  serviceId: CostCheckServiceId,
  category: ServiceCategory
): MasterFunnelContextTab {
  if (category === "review") {
    return usesCostCheckLookupTab(serviceId, category) ? "lookup" : "review";
  }
  if (category === "direct") {
    return serviceId === "company" ? "lookup" : "direct";
  }
  return "lookup";
}

function applyQueryToCostCheck(
  q: string,
  options: {
    tabParam?: CostCheckTab;
    setTab: (tab: CostCheckTab) => void;
    setInitialQuery: (q: string) => void;
    setSelectedServiceId: (id: CostCheckServiceId | "") => void;
    setServiceInput: (value: string) => void;
    setReviewAmount: (amount: string) => void;
    setReviewSubmitted: (submitted: boolean) => void;
  }
): { matched: boolean; routedToAi: boolean } {
  const trimmed = q.trim();
  if (!trimmed) return { matched: false, routedToAi: false };

  options.setInitialQuery(trimmed);
  const service = matchCostCheckService(trimmed);
  const amount = extractAmountFromQuery(trimmed);
  const nextTab = resolveTabFromQuery(trimmed, options.tabParam);

  if (service) {
    options.setSelectedServiceId(service.id);
    options.setServiceInput(service.label);
    options.setTab(nextTab);
    if (nextTab === "review") {
      if (amount) options.setReviewAmount(amount);
      options.setReviewSubmitted(false);
    }
    return { matched: true, routedToAi: false };
  }

  if (hasCostSignal(trimmed)) {
    return { matched: false, routedToAi: true };
  }

  return { matched: false, routedToAi: false };
}

function resolveGuideForService(
  serviceId: CostCheckServiceId | "",
  question: string
): { href: string; title: string; subtitle: string } | null {
  if (!serviceId) return null;

  if (serviceId === "wp") {
    const article = getPublishedArticleBySlug(WP_GUIDE_SLUG);
    if (!article) return null;
    return { href: guidePath(WP_GUIDE_SLUG), title: article.title, subtitle: article.subtitle };
  }

  if (serviceId === "trc") {
    const article = getTrcArticleByIntent(resolveTrcArticleIntent(question || ""));
    const published = getPublishedArticleBySlug(article.slug);
    if (!published) return null;
    return { href: guidePath(article.slug), title: published.title, subtitle: published.subtitle };
  }

  if (isVerifyCostCheckService(serviceId)) {
    return null;
  }

  return null;
}

function resolveVerifyGuideArticle(serviceId: CostCheckServiceId): PublishedArticle | null {
  const landing = getVerifyMasterLanding(serviceId);
  const slug = landing?.guideSlug;
  if (!slug) return null;
  return getPublishedArticleBySlug(slug);
}

function getGovernmentFeeCurrencyLabel(governmentFee: string): string | null {
  if (/vnd/i.test(governmentFee)) return "VND (베트남 동)";
  if (/\$|usd/i.test(governmentFee)) return "USD (미국 달러)";
  return null;
}

function getMarketCurrencyLabel(currency: CostCheckCurrency): string {
  return currency === "USD" ? "USD (미국 달러)" : "VND (베트남 동)";
}

function hasMixedFeeCurrencies(governmentFee: string, marketCurrency: CostCheckCurrency): boolean {
  const govCurrencyLabel = getGovernmentFeeCurrencyLabel(governmentFee);
  if (!govCurrencyLabel) return false;
  return govCurrencyLabel !== getMarketCurrencyLabel(marketCurrency);
}

function hasMarketPriceData(service: CostCheckService): boolean {
  return service.marketMin > 0 || service.marketMax > 0 || service.marketUsualFeeAmount > 0;
}

function isVerifyCostCheckService(id: CostCheckServiceId): boolean {
  return getCostCheckService(id).ctaHref.startsWith("/verify/");
}

function isVerifyConsultationService(id: CostCheckServiceId): boolean {
  return isVerifyCostCheckService(id) && id !== "notary";
}

function hasConsultationPriceData(service: CostCheckService): boolean {
  return service.govFeeAmount > 0 || service.governmentFee.trim().length > 0;
}

function usesCostCheckLookupTab(id: CostCheckServiceId, category: ServiceCategory): boolean {
  return category === "review" && isVerifyCostCheckService(id);
}

const VERIFY_FUNNEL_STEPS: {
  step: number;
  title: string;
  desc: string;
  icon: LucideIcon;
}[] = [
  { step: 1, title: "공식 기준 기반 검토", desc: "베트남 법령·행정자료에 기초한 정확한 검토", icon: Shield },
  { step: 2, title: "AI 1차 분석", desc: "입력한 정보를 바탕으로 내 상황의 위험도와 방향을 먼저 확인", icon: ClipboardCheck },
  { step: 3, title: "AI Review", desc: "서류·상황을 검토한 뒤 필요 절차와 리스크를 정리한 전체 리포트 제공", icon: Cpu },
  { step: 4, title: "필요 시 전문가 연결", desc: "복잡하거나 중요한 케이스는 현지 전문가가 끝까지 도와드립니다.", icon: Headset },
];

const VERIFY_FUNNEL_EFFECTS = [
  "불필요한 비용 예방",
  "시간과 절차를 단축",
  "안전하고 확실한 결과",
] as const;

const VERIFY_FOOTER_TRUST_TAGS: { label: string; icon: LucideIcon }[] = [
  { label: "베트남 정부 공식자료 기반", icon: Building2 },
  { label: "법령·행정 절차 반영", icon: Scale },
  { label: "전문가 검증 시스템", icon: ShieldCheck },
  { label: "한국어 / 영어 / 베트남어 지원", icon: Globe },
];

type OverviewMetricVariant = "primary" | "market" | "structure";

const OVERVIEW_METRIC_STYLES: Record<
  OverviewMetricVariant,
  { card: string; iconWrap: string; icon: string; label: string }
> = {
  primary: {
    card: "border border-[#E5E7EB] bg-white",
    iconWrap: "bg-[#F5F8FF]",
    icon: "text-[#2563EB]",
    label: "text-[#2563EB]",
  },
  market: {
    card: "border border-[#D6E4FB] bg-[#F5F8FF]",
    iconWrap: "bg-[#E4EEFF]",
    icon: "text-[#2563EB]",
    label: "text-[#2563EB]",
  },
  structure: {
    card: "border border-[#E5E7EB] bg-[#F8F9FB]",
    iconWrap: "bg-[#EEEFF3]",
    icon: "text-[#4B5563]",
    label: "text-[#4B5563]",
  },
};

function OverviewMetricCard({
  icon: Icon,
  label,
  value,
  hint,
  variant = "market",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  pending?: boolean;
  variant?: OverviewMetricVariant;
}) {
  const styles = OVERVIEW_METRIC_STYLES[variant];

  return (
    <div
      className={`flex min-w-0 flex-1 flex-col rounded-[14px] px-4 py-4 sm:px-5 sm:py-5 ${styles.card}`}
    >
      <div
        className={`mb-3 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 ${styles.iconWrap}`}
      >
        <Icon className={`h-[18px] w-[18px] sm:h-5 sm:w-5 ${styles.icon}`} aria-hidden />
      </div>
      <p className={`text-[11px] font-medium tracking-[0.02em] sm:text-[12px] ${styles.label}`}>{label}</p>
      <p className="mt-1.5 max-w-[16.5rem] break-keep text-[15px] font-bold leading-[1.35] text-[#1E3A5F] sm:text-[16px]">
        {value}
      </p>
      <p className="mt-1.5 break-keep text-[12px] font-normal leading-[1.6] text-[#64748B] sm:text-[12.5px]">
        {hint}
      </p>
    </div>
  );
}

function VerifyPriceOverview({
  service,
  serviceId,
}: {
  service: CostCheckService;
  serviceId: CostCheckServiceId;
}) {
  const isConsultation = isVerifyConsultationService(serviceId);
  const hasConsultation = hasConsultationPriceData(service);
  const hasMarket = hasMarketPriceData(service);

  const primaryLabel = isConsultation ? "상담가격" : "정부 수수료";
  const primaryPending = isConsultation && !hasConsultation;
  const primaryValue = primaryPending ? "전문가 상담 기준 확인 중" : service.governmentFee;
  const primaryHint = primaryPending
    ? "문서 유형과 난이도에 따라 전문가 상담 비용이 달라집니다."
    : isConsultation
      ? "확인된 상담 기준"
      : "정부 공식 수수료";

  const marketPending = !hasMarket;
  const marketValue = marketPending
    ? "시장가격 확인 중"
    : `${formatCostAmount(service.marketUsualFeeAmount, service.currency)} 전후`;
  const marketHint = marketPending
    ? "업체·서비스 범위에 따라 실제 비용이 차이가 있을 수 있습니다."
    : "시장 일반 대행료 참고";

  const structurePending = isConsultation && !hasConsultation && !hasMarket;
  const structureValue = structurePending ? "현재 산출할 수 없습니다" : "비용 구조 참고";
  const structureHint = structurePending
    ? "정확한 비용은 내 상황과 서류를 확인한 후 비교해드립니다."
    : isConsultation
      ? "상담가격 + 시장 대행료"
      : "정부 수수료 + 시장 대행료";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3.5">
      <OverviewMetricCard
        icon={isConsultation ? Headset : Scale}
        label={primaryLabel}
        value={primaryValue}
        hint={primaryHint}
        pending={primaryPending}
        variant="primary"
      />
      <OverviewMetricCard
        icon={BarChart3}
        label="시장가격"
        value={marketValue}
        hint={marketHint}
        pending={marketPending}
        variant="market"
      />
      <OverviewMetricCard
        icon={Calculator}
        label="예상 비용 구조"
        value={structureValue}
        hint={structureHint}
        pending={structurePending}
        variant="structure"
      />
    </div>
  );
}

function CtaSpark({ side }: { side: "left" | "right" }) {
  const tilt = side === "left" ? "-rotate-[28deg]" : "rotate-[28deg]";
  const align = side === "left" ? "items-end" : "items-start";
  return (
    <span className={`hidden h-8 w-4 shrink-0 flex-col justify-center gap-[4px] sm:flex ${align}`} aria-hidden>
      <span className={`block h-[2px] w-2 rounded-full bg-[#F97316] ${tilt}`} />
      <span className={`block h-[2px] w-3 rounded-full bg-[#F97316] ${tilt}`} />
      <span className={`block h-[2px] w-2 rounded-full bg-[#F97316] ${tilt}`} />
    </span>
  );
}

function VerifyFunnelHook() {
  return (
    <div className="relative overflow-hidden rounded-[16px] border border-[#F3D7A4] border-l-[3px] border-l-[#D97706] bg-[#FFF8ED] px-4 py-3.5 sm:px-5 sm:py-4">
      <span className="pointer-events-none absolute right-4 top-3.5 hidden h-4 w-4 sm:block" aria-hidden>
        <span className="absolute right-0 top-0 h-[1.5px] w-3 rotate-[38deg] rounded-full bg-[#F97316]" />
        <span className="absolute right-0.5 top-2.5 h-[1.5px] w-2 rotate-[38deg] rounded-full bg-[#F97316]" />
      </span>
      <div className="flex flex-col items-center gap-2.5 sm:flex-row sm:items-start sm:gap-3.5">
        <div className="shrink-0 sm:pt-0.5">
          <Lightbulb className="h-8 w-8 fill-[#F59E0B] text-[#F59E0B] sm:h-9 sm:w-9" aria-hidden />
        </div>
        <div className="min-w-0 text-center sm:text-left">
          <h3 className="max-w-[22.5rem] break-keep text-[16px] font-extrabold leading-[1.4] tracking-tight text-[#0B2A6B] sm:max-w-[28rem] sm:text-[17px]">
            가격만 보고 결정하면, 더 큰 비용과 시간을 잃을 수 있습니다.
          </h3>
          <p className="mt-1.5 max-w-[34rem] break-keep text-[12.5px] font-normal leading-[1.65] text-[#64748B] sm:text-[13px]">
            행정문서 검토 비용은 문서 종류와 난이도, 인허가 목적, 전문가의 경험에 따라 크게 달라집니다.
            정확한 비교는 내 상황을 먼저 확인해야만 가능합니다.
          </p>
        </div>
      </div>
    </div>
  );
}

function VerifyFunnelVisual({ serviceId }: { serviceId: CostCheckServiceId }) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="relative rounded-[18px] border border-[#3B82F6] bg-white pb-5 pt-10 sm:pb-6 sm:pt-11">
        <div className="absolute left-1/2 top-0 z-10 w-[calc(100%-1.5rem)] -translate-x-1/2 -translate-y-1/2 px-2 sm:w-auto sm:px-0">
          <span className="mx-auto flex max-w-full items-center justify-center gap-1.5 rounded-full bg-[#0B2A6B] px-3.5 py-1.5 text-[11.5px] font-semibold leading-tight text-white sm:gap-2 sm:px-4 sm:py-1.5 sm:text-[12.5px]">
            <Shield className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="break-keep text-center">VFBCAI 전문가와 함께, 정확하고 안전하게</span>
          </span>
        </div>

        <div className="px-4 text-center sm:px-7 lg:px-8">
          <h4 className="mx-auto max-w-xl break-keep text-[16px] font-extrabold leading-[1.45] tracking-tight text-[#0B2A6B] sm:text-[17px]">
            내 상황을 확인하면, 복잡한 행정문서 문제를 정확히 해결할 수 있습니다.
          </h4>
        </div>

        <div className="mt-5 px-4 sm:mt-6 sm:px-5 lg:px-6">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-3">
            {VERIFY_FUNNEL_STEPS.map((item) => {
              const StepIcon = item.icon;
              const stepNumber = String(item.step).padStart(2, "0");

              return (
                <div
                  key={item.step}
                  className="relative min-w-0 rounded-[12px] border border-[#D6E4FB] bg-white px-3.5 py-3.5 sm:px-4 sm:py-4"
                >
                  <div className="mb-2.5 flex items-start justify-between gap-2">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0B2A6B] text-[10px] font-bold text-white">
                      {stepNumber}
                    </span>
                    <StepIcon className="h-5 w-5 shrink-0 text-[#2563EB] sm:h-[1.35rem] sm:w-[1.35rem]" aria-hidden />
                  </div>
                  <p className="break-keep text-[13px] font-semibold leading-snug text-[#0B2A6B] sm:text-[13.5px]">
                    {item.title}
                  </p>
                  <p className="mt-1 break-keep text-[12px] font-normal leading-[1.6] text-[#556070]">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mx-4 mt-4 rounded-[10px] bg-[#F5F8FF] px-3.5 py-2 sm:mx-5 sm:mt-5 sm:px-5 lg:mx-6">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-6 sm:gap-y-1">
            {VERIFY_FUNNEL_EFFECTS.map((label) => (
              <div key={label} className="flex min-w-0 items-center gap-1.5 text-[#2563EB]">
                <CircleCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <p className="break-keep text-[12px] font-medium sm:text-[12.5px]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-1 flex flex-col items-center px-1 pt-1 sm:pt-2">
        <p className="mb-2.5 max-w-[20rem] break-keep text-center text-[12px] font-medium leading-[1.55] text-[#475569] sm:mb-3 sm:max-w-[28rem] sm:text-[12.5px]">
          내 상황 분석과 1차 결과는 무료로 확인할 수 있습니다.
        </p>
        <div className="flex w-full max-w-[32rem] items-center justify-center gap-2">
          <CtaSpark side="left" />
          <Link
            href={getQuoteFunnelHref(serviceId)}
            className="inline-flex min-h-[3.15rem] w-full items-center justify-center rounded-full bg-[#F97316] px-6 py-3 text-white shadow-[0_6px_16px_rgba(249,115,22,0.24)] transition-colors hover:bg-[#EA580C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316] sm:min-h-[3.35rem]"
          >
            <span className="inline-flex items-center gap-0.5 text-[16px] font-extrabold tracking-tight sm:text-[17px]">
              내 상황 먼저 확인하기
              <span aria-hidden>›</span>
            </span>
          </Link>
          <CtaSpark side="right" />
        </div>
        <p className="mt-2.5 break-keep text-center text-[12.5px] font-medium leading-[1.55] text-[#EA580C] sm:text-[13px]">
          1차 분석 결과를 먼저 확인할 수 있습니다.
        </p>

        <p className="mt-4 flex w-full items-center justify-center gap-1.5 px-2 text-center">
          <Lock className="h-3.5 w-3.5 shrink-0 text-[#475569]" aria-hidden />
          <span className="break-keep text-[13px] font-medium leading-[1.6] text-[#475569]">
            상황을 입력하시면 AI Review와 전체 리포트로 이어집니다.
          </span>
        </p>

        <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-2">
          {VERIFY_FOOTER_TRUST_TAGS.map((item) => {
            const TagIcon = item.icon;
            return (
              <span
                key={item.label}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#F8FAFC] px-2.5 py-1.5"
              >
                <TagIcon className="h-3.5 w-3.5 shrink-0 text-[#334155]" aria-hidden />
                <span className="break-keep text-[11.5px] font-medium leading-snug text-[#334155] sm:text-[12px]">
                  {item.label}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const MARKET_PRICE_REFERENCE_NOTE =
  "시장가격은 확인된 시장가격의 최저·최고 범위를 바탕으로 산출한 참고 기준입니다. 실제 비용은 업체, 서비스 범위 및 조건에 따라 달라질 수 있으며, 본인이 직접 비교·판단하시기 바랍니다.";

const FEE_STRUCTURE_NOTE =
  "※ 정부 수수료와 대행료는 통화가 달라 별도로 표시합니다. 실제 견적에 정부 수수료와 대행료가 모두 포함되어 있는지 확인하세요.";

function MarketPriceGuidance() {
  return (
    <div className="mt-3 border-t border-blue-100 pt-3">
      <p className="break-words text-xs leading-relaxed text-slate-600">{MARKET_PRICE_REFERENCE_NOTE}</p>
    </div>
  );
}

function CostStructureSummary({
  service,
  serviceId,
}: {
  service: CostCheckService;
  serviceId: CostCheckServiceId;
}) {
  const isConsultation = isVerifyConsultationService(serviceId);
  const hasConsultation = hasConsultationPriceData(service);
  const hasMarket = hasMarketPriceData(service);
  const marketAmount = formatCostAmount(service.marketUsualFeeAmount, service.currency);

  if (isConsultation && !hasConsultation && !hasMarket) {
    return (
      <div className="rounded-xl border border-blue-200 bg-white p-4">
        <p className="text-xs font-semibold text-blue-900">예상 비용 구조</p>
        <p className="mt-3 break-words text-sm font-semibold text-slate-500">현재 산출할 수 없습니다</p>
      </div>
    );
  }

  const primaryLabel = isConsultation ? "상담가격" : "정부 수수료";
  const primaryValue = isConsultation
    ? hasConsultation
      ? service.governmentFee
      : "상담가격 확인 중"
    : service.governmentFee;

  return (
    <div className="rounded-xl border border-blue-200 bg-white p-4">
      <p className="text-xs font-semibold text-blue-900">예상 비용 구조</p>
      <p className="mt-1 break-words text-xs leading-relaxed text-slate-600">
        실제 진행 시 아래 두 항목이 각각 발생합니다.
      </p>
      <div className="mt-3 space-y-2 rounded-lg border border-blue-100 bg-blue-50/30 p-3">
        <p className="break-words text-sm leading-relaxed text-blue-900">
          <span className="font-medium text-slate-600">{primaryLabel}</span>{" "}
          <span className={`font-semibold ${isConsultation && !hasConsultation ? "text-slate-500" : ""}`}>
            {primaryValue}
          </span>
        </p>
        <p className="text-center text-sm font-semibold text-slate-400" aria-hidden="true">
          +
        </p>
        <p className="break-words text-sm leading-relaxed text-blue-900">
          <span className="font-medium text-slate-600">시장 대행료</span>{" "}
          {hasMarket ? (
            <span className="font-semibold">{marketAmount} 전후</span>
          ) : (
            <span className="font-semibold text-slate-500">현재 산출할 수 없습니다</span>
          )}
        </p>
      </div>
      <p className="mt-3 break-words text-xs leading-relaxed text-slate-600">{FEE_STRUCTURE_NOTE}</p>
    </div>
  );
}

function PrimaryPriceCard({
  service,
  serviceId,
  size = "lookup",
}: {
  service: CostCheckService;
  serviceId: CostCheckServiceId;
  size?: "lookup" | "preview";
}) {
  const isConsultation = isVerifyConsultationService(serviceId);
  const hasConsultation = hasConsultationPriceData(service);
  const govCurrencyLabel = getGovernmentFeeCurrencyLabel(service.governmentFee);
  const amountClass =
    size === "lookup"
      ? "mt-1 break-words text-xl font-bold text-blue-900 sm:text-2xl"
      : "mt-1 break-words text-lg font-bold text-blue-900";
  const pendingClass =
    size === "lookup"
      ? "mt-1 break-words text-xl font-semibold text-slate-500 sm:text-2xl"
      : "mt-1 break-words text-lg font-semibold text-slate-500";

  if (isConsultation) {
    return (
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-blue-700">상담가격</p>
        {hasConsultation ? (
          <>
            <p className={amountClass}>{service.governmentFee}</p>
            {service.source ? (
              <p className="mt-2 text-xs text-slate-600">출처: {service.source}</p>
            ) : null}
          </>
        ) : (
          <p className={pendingClass}>상담가격 확인 중</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
        정부 수수료
        {govCurrencyLabel ? (
          <span className="ml-1 font-normal normal-case tracking-normal text-slate-500">
            · {govCurrencyLabel}
          </span>
        ) : null}
      </p>
      <p className={amountClass}>{service.governmentFee}</p>
      <p className="mt-2 text-xs text-slate-600">출처: {service.source}</p>
    </div>
  );
}

function MarketPriceCard({ service }: { service: CostCheckService }) {
  const hasMarket = hasMarketPriceData(service);

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
      <p className="text-xs font-medium text-blue-800">
        시장 일반 대행료 (참고)
        <span className="ml-1 font-normal text-slate-500">
          · {getMarketCurrencyLabel(service.currency)}
        </span>
      </p>
      {hasMarket ? (
        <>
          <p className="mt-1 break-words text-lg font-semibold text-blue-900">
            {formatCostAmount(service.marketUsualFeeAmount, service.currency)} 전후
          </p>
          <p className="mt-1 break-words text-xs text-slate-500">
            범위 {formatCostAmount(service.marketMin, service.currency)} ~{" "}
            {formatCostAmount(service.marketMax, service.currency)}
          </p>
        </>
      ) : (
        <p className="mt-1 break-words text-lg font-semibold text-slate-500">시장가격 확인 중</p>
      )}
      <MarketPriceGuidance />
    </div>
  );
}

function MarketPricePreview({
  service,
  serviceId,
  question,
}: {
  service: CostCheckService;
  serviceId: CostCheckServiceId;
  question?: string;
}) {
  const govCurrencyLabel = getGovernmentFeeCurrencyLabel(service.governmentFee);
  const isConsultation = isVerifyConsultationService(serviceId);

  return (
    <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
      <p className="text-xs font-medium text-blue-700">
        {isConsultation ? "상담가격 · 시장 범위" : "정부 공식 비용 · 시장 범위"}
      </p>
      {isConsultation ? (
        <PrimaryPriceCard service={service} serviceId={serviceId} size="preview" />
      ) : (
        <div className="rounded-xl border border-blue-100 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
            정부 수수료
            {govCurrencyLabel ? (
              <span className="ml-1 font-normal normal-case tracking-normal text-slate-500">
                · {govCurrencyLabel}
              </span>
            ) : null}
          </p>
          <p className="mt-1 break-words text-lg font-bold text-blue-900">{service.governmentFee}</p>
          <p className="mt-2 text-xs text-slate-600">출처: {service.source}</p>
        </div>
      )}
      <MarketPriceCard service={service} />
      <CostStructureSummary service={service} serviceId={serviceId} />
      {serviceId === "wp" ? (
        <WpRegionalOfficialFee sources={service.officialSources} question={question} />
      ) : service.officialSources && service.officialSources.length > 0 ? (
        <OfficialSourceList sources={service.officialSources} regionLabel="공식 확인 자료" />
      ) : null}
    </div>
  );
}

function CostCheckPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initializedRef = useRef(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const [tab, setTab] = useState<CostCheckTab>("lookup");
  const [initialQuery, setInitialQuery] = useState("");
  const [serviceInput, setServiceInput] = useState("");
  const [queryNotice, setQueryNotice] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerCategory, setPickerCategory] = useState<ServiceCategory | null>(null);

  const [selectedServiceId, setSelectedServiceId] = useState<CostCheckServiceId | "">("");
  const selectedService = useMemo(
    () => (selectedServiceId ? getCostCheckService(selectedServiceId) : null),
    [selectedServiceId]
  );

  const [reviewAmount, setReviewAmount] = useState("");
  const [reviewPrep, setReviewPrep] = useState<"yes" | "no" | "">("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [showMarketPreview, setShowMarketPreview] = useState(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const tabParam = parseTabParam(searchParams.get("tab"));
    const qParam = searchParams.get("q")?.trim() ?? "";

    setTab(tabParam);
    if (qParam) {
      const matchedService = matchCostCheckService(qParam);
      if (matchedService) {
        router.replace(
          masterServiceHref(
            matchedService.id,
            qParam,
            resolveMasterFunnelTabForService(matchedService.ctaHref, qParam, tabParam)
          )
        );
        return;
      }

      const result = applyQueryToCostCheck(qParam, {
        tabParam,
        setTab,
        setInitialQuery,
        setSelectedServiceId,
        setServiceInput,
        setReviewAmount,
        setReviewSubmitted,
      });
      if (!result.matched) {
        setServiceInput("");
        if (result.routedToAi) {
          setQueryNotice(
            "등록된 비용 확인 서비스가 아닙니다. 확인을 누르면 AI 확인 화면으로 이동합니다."
          );
        }
      }
    }
  }, [searchParams, router]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setPickerOpen(false);
        setPickerCategory(null);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const reviewResult = useMemo(() => {
    if (!reviewSubmitted || !selectedServiceId || !reviewPrep) return null;
    const amount = Number(reviewAmount.replace(/,/g, ""));
    if (!Number.isFinite(amount) || amount <= 0) return null;
    const service = getCostCheckService(selectedServiceId);
    return {
      service,
      quotedAmount: amount,
      ...evaluateCostQuoteReview(service, amount),
    };
  }, [reviewSubmitted, selectedServiceId, reviewAmount, reviewPrep]);

  const activeServiceId = useMemo((): CostCheckServiceId | "" => {
    if (selectedServiceId) return selectedServiceId;
    if (initialQuery) return inferServiceFromQuery(initialQuery);
    return "";
  }, [selectedServiceId, initialQuery]);

  const guideLink = useMemo(
    () => resolveGuideForService(activeServiceId, initialQuery),
    [activeServiceId, initialQuery]
  );

  const verifyGuideArticle = useMemo(
    () =>
      activeServiceId && isVerifyCostCheckService(activeServiceId)
        ? resolveVerifyGuideArticle(activeServiceId)
        : null,
    [activeServiceId]
  );

  function handlePickService(
    id: CostCheckServiceId,
    category: ServiceCategory,
    inputLabel?: string
  ) {
    const service = getCostCheckService(id);
    const label = inputLabel ?? service.label;
    router.push(masterServiceHref(id, label, tabForPickerCategory(id, category)));
  }

  function handlePickCatalogItem(item: CatalogServiceItem, category: ServiceCategory) {
    const costCheckId = resolveCostCheckServiceIdFromHref(item.href);
    if (costCheckId) {
      handlePickService(
        costCheckId,
        category,
        isVerifyCostCheckService(costCheckId) ? item.title : undefined
      );
      return;
    }
    setPickerOpen(false);
    setPickerCategory(null);
    router.push(
      buildMasterFunnelServiceHref(
        item.href,
        item.title,
        category === "review" ? "review" : category === "direct" ? "direct" : "lookup"
      )
    );
  }

  function handleUnifiedSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = serviceInput.trim();
    if (!trimmed) {
      setQueryNotice("서비스를 입력하거나 목록에서 선택해 주세요.");
      return;
    }

    setQueryNotice("");
    const matchedService = matchCostCheckService(trimmed);
    if (matchedService) {
      router.push(masterServiceHref(matchedService.id, trimmed));
      return;
    }

    const result = applyQueryToCostCheck(trimmed, {
      setTab,
      setInitialQuery,
      setSelectedServiceId,
      setServiceInput,
      setReviewAmount,
      setReviewSubmitted,
    });

    if (result.matched) return;

    if (result.routedToAi) {
      setQueryNotice(
        "등록된 비용 확인 서비스가 아닙니다. 카테고리에서 서비스를 선택하거나 질문을 다시 입력해 주세요."
      );
      return;
    }

    setQueryNotice(
      "등록된 비용 확인 서비스와 연결되지 않았습니다. 카테고리에서 서비스를 선택하거나 비용 관련 질문을 다시 입력해 주세요."
    );
  }

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitted(true);
  };

  const isVerifyFunnelActive = Boolean(
    selectedServiceId && isVerifyCostCheckService(selectedServiceId)
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      <SiteHeader />
      <div className={`${ENGINE_CONTAINER} pb-10 pt-4 sm:pb-14 sm:pt-6`}>
        <div
          className={`mx-auto w-full min-w-0 ${
            isVerifyFunnelActive ? "max-w-4xl lg:max-w-5xl" : "max-w-2xl"
          }`}
        >
          {isVerifyFunnelActive ? null : (
            <header className="mb-6 text-center sm:mb-8">
              <span className="inline-flex max-w-full items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-medium tracking-[0.02em] text-blue-800 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:text-[12px]">
                무료 · 가입 없음
              </span>
              <h1 className="mt-3 break-keep text-[1.625rem] font-bold leading-[1.25] tracking-tight text-blue-900 sm:mt-4 sm:text-3xl">
                비용, 얼마가 적정할까?
              </h1>
              <p className="mx-auto mt-2.5 max-w-[28rem] break-keep px-1 text-[13px] leading-relaxed text-slate-600 sm:mt-3 sm:text-base">
                정부 수수료 확인 · 견적 검토 · 관련 가이드 안내를 한곳에서
              </p>
            </header>
          )}

          <div className="mb-4 flex min-w-0 rounded-[14px] border border-[#E5E7EB] bg-white p-1 sm:mb-5 sm:p-1.5">
            {TABS.map((t) => {
              const TabIcon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[10px] px-1 py-2 text-center transition sm:gap-2 sm:px-3 sm:py-2.5 ${
                    active
                      ? "bg-[#0B2A6B] text-white"
                      : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0B2A6B]"
                  }`}
                >
                  <TabIcon
                    className={`h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4 ${
                      active ? "text-white" : "text-[#64748B]"
                    }`}
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span className="block break-keep text-[12px] font-semibold leading-tight sm:text-[13.5px]">
                      {t.label}
                    </span>
                    <span
                      className={`mt-0.5 block break-keep text-[10px] leading-tight sm:text-[11px] ${
                        active ? "text-white/80" : "text-[#64748B]"
                      }`}
                    >
                      {t.desc}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="min-w-0 rounded-[16px] border border-[#E5E7EB] bg-white p-4 sm:p-5 lg:p-6">
            {tab === "lookup" && (
              <div className="space-y-6">
                <div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <h2 className="flex min-w-0 items-center gap-2 text-[17px] font-bold leading-tight text-[#0F172A] sm:text-[19px]">
                      <FileSearch className="h-5 w-5 shrink-0 text-[#2563EB] sm:h-[1.35rem] sm:w-[1.35rem]" aria-hidden />
                      <span className="break-keep">정부 수수료 · 기준 안내</span>
                    </h2>
                    {selectedService ? (
                      <span className="inline-flex rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-[12px] font-medium text-[#1D4ED8]">
                        {selectedService.label}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[#475569] sm:text-[13.5px]">
                    서비스를 선택하면 정부 수수료와 시장 일반 대행료 기준을 확인할 수 있습니다.
                  </p>
                </div>

                <form onSubmit={handleUnifiedSubmit} className="space-y-2.5">
                  <label htmlFor="cost-check-service-input" className="block text-[13px] font-semibold text-[#0F172A] sm:text-[14px]">
                    서비스를 직접 입력하거나 선택하세요
                  </label>
                  <div ref={pickerRef} className="relative min-w-0">
                    <div className="relative min-w-0">
                      <input
                        id="cost-check-service-input"
                        type="text"
                        value={serviceInput}
                        onChange={(e) => {
                          setServiceInput(e.target.value);
                          setPickerOpen(true);
                          setPickerCategory(null);
                          if (queryNotice) setQueryNotice("");
                        }}
                        onFocus={() => setPickerOpen(true)}
                        placeholder="예) 세무기장 비용은 얼마인가요?"
                        className="min-h-11 w-full min-w-0 rounded-[12px] border border-[#D1D5DB] bg-white py-2.5 pl-3.5 pr-10 text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 sm:min-h-12"
                        autoComplete="off"
                      />
                      <Search
                        size={18}
                        aria-hidden
                        className="pointer-events-none absolute right-3 top-1/2 shrink-0 -translate-y-1/2 text-[#64748B]"
                      />
                    </div>

                    {pickerOpen ? (
                      <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-blue-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
                        {!pickerCategory ? (
                          <ul className="py-1">
                            {SERVICE_CATEGORIES.map((category) => (
                              <li key={category.id}>
                                <button
                                  type="button"
                                  onClick={() => setPickerCategory(category.id)}
                                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-blue-900 transition-colors hover:bg-blue-50/60"
                                >
                                  <span>{category.label}</span>
                                  <span className="text-xs text-slate-400">→</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div>
                            <button
                              type="button"
                              onClick={() => setPickerCategory(null)}
                              className="w-full border-b border-blue-100 px-4 py-2.5 text-left text-xs font-medium text-slate-500 hover:bg-blue-50/40"
                            >
                              ← 카테고리 선택
                            </button>
                            <ul className="max-h-56 overflow-y-auto py-1">
                              {getCatalogServicesForCategory(pickerCategory).map((item) => (
                                <li key={item.key}>
                                  <button
                                    type="button"
                                    onClick={() => handlePickCatalogItem(item, pickerCategory)}
                                    className="w-full px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-blue-50/60 hover:text-blue-900"
                                  >
                                    {item.title}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                  {queryNotice ? (
                    <p className="text-xs leading-relaxed text-amber-800">{queryNotice}</p>
                  ) : null}
                </form>

                {selectedService && selectedServiceId ? (
                  <div className="space-y-4">
                    {isVerifyCostCheckService(selectedServiceId) ? (
                      <div className="space-y-3.5">
                        <VerifyFunnelHook />
                        <VerifyPriceOverview service={selectedService} serviceId={selectedServiceId} />
                      </div>
                    ) : (
                      <>
                        <PrimaryPriceCard
                          service={selectedService}
                          serviceId={selectedServiceId}
                          size="lookup"
                        />
                        <MarketPriceCard service={selectedService} />
                        <CostStructureSummary service={selectedService} serviceId={selectedServiceId} />
                      </>
                    )}

                    {isVerifyCostCheckService(selectedServiceId) ? null : (
                      <p className="text-xs leading-relaxed text-slate-500 sm:text-sm">
                        {selectedService.lookupGuide}
                      </p>
                    )}
                    {selectedServiceId === "wp" ? (
                      <WpRegionalOfficialFee
                        sources={selectedService.officialSources}
                        question={initialQuery || undefined}
                      />
                    ) : selectedService.officialSources && selectedService.officialSources.length > 0 ? (
                      <OfficialSourceList
                        sources={selectedService.officialSources}
                        regionLabel="공식 확인 자료"
                      />
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}

            {tab === "review" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-blue-900">견적 적정성 검토</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    받은 견적이 정부 수수료 + 시장 일반 대행료 기준 대비 어느 정도인지 확인합니다.
                  </p>
                </div>

                {!selectedServiceId || !selectedService ? (
                  <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                    <p className="text-sm leading-relaxed text-slate-600">
                      먼저 확인하기에서 서비스를 입력하거나 선택해 주세요.
                    </p>
                    <button
                      type="button"
                      onClick={() => setTab("lookup")}
                      className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-900 transition-colors hover:bg-blue-50/60"
                    >
                      확인하기로 이동
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-blue-900">검토 대상 서비스</p>
                      <div className="mt-2 flex min-w-0 items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50/40 px-4 py-3">
                        <Briefcase size={18} className="shrink-0 text-blue-800" aria-hidden />
                        <span className="min-w-0 break-words font-semibold text-blue-900">
                          {selectedService.label}
                        </span>
                      </div>
                    </div>

                    <form onSubmit={handleReviewSubmit} className="space-y-5 rounded-xl border border-blue-100 bg-blue-50/20 p-4 sm:p-5">
                      <div>
                        <p className="text-sm font-semibold text-blue-900">받은 견적이 있다면</p>
                        <p className="mt-1 text-xs text-slate-500">받은 견적 금액을 입력해주세요.</p>
                        <div className="mt-3 flex min-w-0 flex-col gap-2 sm:flex-row">
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder={selectedServiceId === "notary" ? "예: 200,000" : "예: 3,000"}
                            value={reviewAmount}
                            onChange={(e) => {
                              setReviewAmount(e.target.value);
                              setReviewSubmitted(false);
                            }}
                            className="min-h-11 w-full min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-400/16"
                          />
                          <span className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600">
                            {selectedService.currency}
                          </span>
                        </div>
                      </div>

                      <fieldset>
                        <legend className="text-sm font-medium text-blue-900">
                          서류 준비·번역 포함 여부
                        </legend>
                        <div className="mt-2 flex flex-wrap gap-3">
                          {(
                            [
                              { v: "yes", l: "포함" },
                              { v: "no", l: "미포함" },
                            ] as const
                          ).map(({ v, l }) => (
                            <label
                              key={v}
                              className={`flex min-h-11 min-w-[5.5rem] flex-1 cursor-pointer items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors sm:flex-none ${
                                reviewPrep === v
                                  ? "border-blue-900 bg-blue-900 text-white"
                                  : "border-blue-100 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/40"
                              }`}
                            >
                              <input
                                type="radio"
                                name="reviewPrep"
                                value={v}
                                checked={reviewPrep === v}
                                onChange={() => {
                                  setReviewPrep(v);
                                  setReviewSubmitted(false);
                                }}
                                className="sr-only"
                              />
                              {l}
                            </label>
                          ))}
                        </div>
                      </fieldset>

                      <button
                        type="submit"
                        disabled={!reviewAmount.trim() || !reviewPrep}
                        className="w-full min-h-11 rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        견적 적정성 검토하기 →
                      </button>
                    </form>

                    <div className="relative py-1">
                      <div className="border-t border-dashed border-blue-200" />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-slate-400">
                        또는
                      </span>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-white p-4">
                      <p className="text-sm font-semibold text-blue-900">견적이 없다면</p>
                      <p className="mt-1 text-xs text-slate-500">현재 시장가격을 확인해보세요.</p>
                      <button
                        type="button"
                        onClick={() => setShowMarketPreview(true)}
                        className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-900 transition-colors hover:bg-blue-50/60 sm:w-auto"
                      >
                        시장가격 확인하기 →
                      </button>
                    </div>

                    {showMarketPreview ? (
                      <MarketPricePreview
                        service={selectedService}
                        serviceId={selectedServiceId}
                        question={initialQuery || undefined}
                      />
                    ) : null}

                    <p className="rounded-xl border border-blue-100 bg-blue-50/40 px-4 py-3 text-xs leading-relaxed text-slate-600">
                      받은 견적이 있는 경우 입력하시면 정부 기준 및 시장가격 대비 적정성을 분석해드립니다.
                      견적이 없는 경우에도 정부 수수료 및 시장 일반 대행료 범위를 미리 확인할 수 있습니다.
                    </p>

                    {reviewResult ? (
                      <div className="border-t border-blue-100 pt-6">
                        <CostCheckCard
                          serviceId={reviewResult.service.id}
                          question={initialQuery || undefined}
                          quote={{
                            quotedAmount: reviewResult.quotedAmount,
                            verdict: reviewResult.verdict,
                            title: reviewResult.title,
                            summary: reviewResult.summary,
                            detail: reviewResult.detail,
                            fairReference: reviewResult.fairReference,
                            bubblePercent: reviewResult.bubblePercent,
                          }}
                        />
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            )}

            {tab === "direct" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-blue-900">자세히 보기</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    선택한 서비스의 진행 절차·서류·비용 가이드를 확인합니다.
                  </p>
                </div>

                {!activeServiceId ? (
                  <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                    <p className="text-sm leading-relaxed text-slate-600">
                      확인하기에서 서비스를 입력하거나 선택하면 관련 가이드를 안내해 드립니다.
                    </p>
                  </div>
                ) : verifyGuideArticle && activeServiceId ? (
                  <div className="min-w-0 space-y-5 rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
                    <div>
                      <p className="text-xs font-medium text-blue-700">
                        {getCostCheckService(activeServiceId).label}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-blue-900">{verifyGuideArticle.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{verifyGuideArticle.subtitle}</p>
                    </div>
                    <GuideCaseFunnelSummary article={verifyGuideArticle} />
                  </div>
                ) : activeServiceId && isVerifyCostCheckService(activeServiceId) ? (
                  <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                    <p className="text-sm font-semibold text-blue-900">
                      {getCostCheckService(activeServiceId).label}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      현재 이 서비스의 상세 가이드는 준비 중입니다.
                    </p>
                  </div>
                ) : guideLink ? (
                  <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                    <p className="text-xs font-medium text-blue-700">
                      {getCostCheckService(activeServiceId).label}
                    </p>
                    <p className="break-words text-sm font-semibold text-blue-900">{guideLink.title}</p>
                    <p className="break-words text-sm leading-relaxed text-slate-600">{guideLink.subtitle}</p>
                    <Link
                      href={guideLink.href}
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 sm:w-auto"
                    >
                      가이드 자세히 보기 →
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                    <p className="text-sm font-semibold text-blue-900">
                      {getCostCheckService(activeServiceId).label}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      현재 이 서비스의 상세 가이드는 준비 중입니다.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {tab === "lookup" && selectedService && selectedServiceId && isVerifyCostCheckService(selectedServiceId) ? (
            <div className="mt-5 sm:mt-6">
              <VerifyFunnelVisual serviceId={selectedServiceId} />
            </div>
          ) : null}

          <p className="mx-auto mt-5 max-w-3xl break-keep px-1 text-center text-[12.5px] leading-[1.75] text-[#575F6A] sm:mt-6 sm:text-[13px]">
            {tab === "lookup" && selectedService && isVerifyCostCheckService(selectedService.id)
              ? `${selectedService.lookupGuide} `
              : null}
            {COST_CHECK_DISCLAIMER}
          </p>
        </div>
      </div>
    </main>
  );
}

export default function CostCheckPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen overflow-x-hidden bg-white">
          <SiteHeader />
          <div className={`${ENGINE_CONTAINER} pb-10 pt-5 sm:pb-14 sm:pt-8`}>
            <div className="mx-auto w-full min-w-0 max-w-2xl">
              <p className="text-center text-sm text-slate-500">불러오는 중...</p>
            </div>
          </div>
        </main>
      }
    >
      <CostCheckPageContent />
    </Suspense>
  );
}
