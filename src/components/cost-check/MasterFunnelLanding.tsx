"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Briefcase, ClipboardPen, ExternalLink, Search, type LucideIcon } from "lucide-react";
import OfficialTrustZone from "@/components/ui/OfficialTrustZone";
import { CostCheckCard } from "@/components/cost-check/CostCheckCard";
import {
  getCheckServiceItems,
  getRegisterServiceItems,
  getVerifyServiceItems,
} from "@/components/home/HomeServiceAccordion";
import {
  COST_CHECK_DISCLAIMER,
  COST_CHECK_SERVICES,
  DIRECT_PERMIT_COMPANY_GUIDE,
  DIRECT_PERMIT_COMPANY_ITEMS,
  evaluateCostQuoteReview,
  formatCostAmount,
  getCostCheckService,
  type CostCheckService,
  type CostCheckServiceId,
} from "@/lib/costCheck";
import { matchCostCheckService, hasCostSignal } from "@/lib/aiCostSection";
import {
  buildMasterFunnelServiceHref,
  readMasterFunnelEntryParams,
  resolveMasterFunnelTabForService,
  resolveMasterFunnelTabFromQuery,
} from "@/lib/masterFunnelEntry";
import type { FunnelEngine } from "@/components/engine/funnelTokens";
import {
  MASTER_FUNNEL_STEPS_CHECK,
  MASTER_FUNNEL_STEPS_REGISTER,
  MASTER_FUNNEL_STEPS_VERIFY,
  MasterCostStructureSummary,
  MasterFunnelHook,
  MasterFunnelPersuasion,
  MasterPendingCostStructureSummary,
  MasterPendingPriceOverview,
  MasterPriceOverview,
  hasMarketPriceData,
} from "@/components/cost-check/MasterCostFunnel";
import { GuideCaseFunnelSummary } from "@/components/answers/GuideCaseFunnelSummary";
import { getPublishedArticleBySlug } from "@/lib/contentPacks/registry";
import { TRC_GUIDE_ARTICLE } from "@/lib/contentPacks/trcArticles";
import { WP_GUIDE_SLUG } from "@/lib/contentPacks/wpArticles";
import { TAMTRU_GUIDE_SLUG } from "@/lib/contentPacks/tamtruArticles";
import { DRIVING_LICENSE_GUIDE_SLUG } from "@/lib/contentPacks/drivingLicenseArticles";
import {
  COMPANY_GUIDE_SLUG,
  RESTAURANT_GUIDE_SLUG,
  HYGIENE_GUIDE_SLUG,
  FIRE_SAFETY_GUIDE_SLUG,
  COSMETICS_GUIDE_SLUG,
  ENVIRONMENT_GUIDE_SLUG,
  MEDICAL_DEVICE_GUIDE_SLUG,
  FRANCHISE_GUIDE_SLUG,
} from "@/lib/contentPacks/registerArticles";
import {
  ADMIN_GUIDE_SLUG,
  FRAUD_GUIDE_SLUG,
  REAL_ESTATE_GUIDE_SLUG,
  TAX_GUIDE_SLUG,
  UNCLEAR_GUIDE_SLUG,
} from "@/lib/contentPacks/verifyArticles";

export type MasterFunnelContextTab = "lookup" | "review" | "direct";

const FUNNEL_COST_CONTEXT_TABS: {
  id: MasterFunnelContextTab;
  label: string;
  desc: string;
  icon: LucideIcon;
}[] = [
  { id: "lookup", label: "확인하기", desc: "직접 확인하기", icon: Search },
  { id: "review", label: "검토하기", desc: "직접 검토하기", icon: ClipboardPen },
  { id: "direct", label: "자세히 보기", desc: "관련 가이드 상세", icon: BookOpen },
];

export function MasterFunnelContextTabs({
  active,
  onChange,
}: {
  active: MasterFunnelContextTab;
  onChange: (tab: MasterFunnelContextTab) => void;
}) {
  return (
    <div className="mb-4 flex min-w-0 rounded-[14px] border border-[#E5E7EB] bg-white p-1 sm:mb-5 sm:p-1.5">
      {FUNNEL_COST_CONTEXT_TABS.map((t) => {
        const TabIcon = t.icon;
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[10px] px-1 py-2 text-center transition sm:gap-2 sm:px-3 sm:py-2.5 ${
              isActive
                ? "bg-[#0B2A6B] text-white"
                : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0B2A6B]"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <TabIcon
              className={`h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4 ${isActive ? "text-white" : "text-[#64748B]"}`}
              aria-hidden
            />
            <span className="min-w-0">
              <span className="block break-keep text-[12px] font-semibold leading-tight sm:text-[13.5px]">
                {t.label}
              </span>
              <span
                className={`mt-0.5 block break-keep text-[10px] leading-tight sm:text-[11px] ${
                  isActive ? "text-white/80" : "text-[#64748B]"
                }`}
              >
                {t.desc}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export type MasterLandingGuideItem = { title: string; body: string };

type MasterFunnelStep = {
  step: number;
  title: string;
  desc: string;
  icon: LucideIcon;
};

export type MasterLandingConfig = {
  engine: FunnelEngine;
  serviceLabel: string;
  costServiceId?: CostCheckServiceId;
  specialtyLine: string;
  hookTitle: string;
  hookBody: string;
  persuasionHeadline: string;
  /** 미지정 시 engine 기본(CHECK/REGISTER) 단계. TRC 등 MASTER 직접검토 문구가 필요할 때만 지정. */
  persuasionSteps?: MasterFunnelStep[];
  pendingStructureNote?: string;
  reviewTitle: string;
  reviewIntro: string;
  reviewChecks: MasterLandingGuideItem[];
  guideTitle: string;
  guideIntro: string;
  guideItems: MasterLandingGuideItem[];
  /** 있으면 PublishedArticle(`/guide/[slug]`)을 「자세히 보기」에 재사용. TRC 등도 동일 필드만 추가하면 확장 가능. */
  guideSlug?: string;
  officialUrl: string;
  officialNote: string;
};

/** `/cost-check`와 동일: ① 카테고리→서비스 선택 + ② 직접 입력. TRC Landing 확인하기 전용 */
const TRC_SERVICE_CATEGORIES = [
  { id: "lookup" as const, label: "직접 확인하기" },
  { id: "review" as const, label: "직접 검토하기" },
  { id: "direct" as const, label: "직접 인허가 받기" },
];

type TrcServiceCategory = (typeof TRC_SERVICE_CATEGORIES)[number]["id"];

function getTrcCatalogServices(category: TrcServiceCategory) {
  if (category === "lookup") return getCheckServiceItems();
  if (category === "review") return getVerifyServiceItems();
  return getRegisterServiceItems();
}

function resolveTrcCatalogHref(
  item: { href: string; title?: string },
  category: TrcServiceCategory
): string {
  const label = item.title ?? item.href;
  if (category === "lookup") {
    return buildMasterFunnelServiceHref(item.href, label, "lookup");
  }
  if (category === "review") {
    return buildMasterFunnelServiceHref(item.href, label, "review");
  }
  return buildMasterFunnelServiceHref(item.href, label, "direct");
}

function MasterServiceQueryEntry({
  currentServiceId,
  initialQuery = "",
  onLocalTabChange,
}: {
  currentServiceId?: CostCheckServiceId;
  initialQuery?: string;
  onLocalTabChange: (tab: MasterFunnelContextTab) => void;
}) {
  const router = useRouter();
  const pickerRef = useRef<HTMLDivElement>(null);
  const [serviceInput, setServiceInput] = useState(initialQuery);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerCategory, setPickerCategory] = useState<TrcServiceCategory | null>(null);
  const [queryNotice, setQueryNotice] = useState("");

  useEffect(() => {
    setServiceInput(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!pickerRef.current?.contains(e.target as Node)) {
        setPickerOpen(false);
        setPickerCategory(null);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  function handleDirectSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = serviceInput.trim();
    if (!trimmed) {
      setQueryNotice("서비스를 입력하거나 목록에서 선택해 주세요.");
      return;
    }
    setQueryNotice("");
    setPickerOpen(false);
    setPickerCategory(null);

    const matched = matchCostCheckService(trimmed);
    const tab = matched
      ? resolveMasterFunnelTabForService(matched.ctaHref, trimmed)
      : resolveMasterFunnelTabFromQuery(trimmed);

    if (matched) {
      if (matched.id === currentServiceId) {
        onLocalTabChange(tab);
        return;
      }
      router.push(buildMasterFunnelServiceHref(matched.ctaHref, trimmed, tab));
      return;
    }

    if (currentServiceId && (hasCostSignal(trimmed) || tab === "direct" || tab === "review")) {
      onLocalTabChange(tab);
      return;
    }

    onLocalTabChange(tab);
  }

  const inputId = currentServiceId
    ? `master-service-input-${currentServiceId}`
    : "master-service-input";

  return (
    <form onSubmit={handleDirectSubmit} className="space-y-2.5">
      <label
        htmlFor={inputId}
        className="block text-[13px] font-semibold text-[#0F172A] sm:text-[14px]"
      >
        원하는 내용을 입력하거나 아래 항목에서 선택해주세요
      </label>
      <div ref={pickerRef} className="relative min-w-0">
        <div className="relative min-w-0">
          <input
            id={inputId}
            type="text"
            value={serviceInput}
            onChange={(e) => {
              setServiceInput(e.target.value);
              setPickerOpen(true);
              setPickerCategory(null);
              if (queryNotice) setQueryNotice("");
            }}
            onFocus={() => setPickerOpen(true)}
            onClick={() => setPickerOpen(true)}
            placeholder="예) 세무기장 비용은 얼마인가요?"
            className="min-h-11 w-full min-w-0 rounded-[12px] border border-[#D1D5DB] bg-white py-2.5 pl-3.5 pr-10 text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 sm:min-h-12"
            autoComplete="off"
            aria-haspopup="listbox"
            aria-expanded={pickerOpen}
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
              <ul className="py-1" role="listbox" aria-label="서비스 카테고리">
                {TRC_SERVICE_CATEGORIES.map((category) => (
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
                <ul className="max-h-56 overflow-y-auto py-1" role="listbox">
                  {getTrcCatalogServices(pickerCategory).map((item) => (
                    <li key={item.key}>
                      <Link
                        href={resolveTrcCatalogHref(item, pickerCategory)}
                        role="option"
                        onClick={() => {
                          setPickerOpen(false);
                          setPickerCategory(null);
                        }}
                        className="block w-full px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-blue-50/60 hover:text-blue-900"
                      >
                        {item.title}
                      </Link>
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
  );
}

function MasterCostBasisEntry({
  config,
  onContinue,
  onTabChange,
  entryQuery,
}: {
  config: MasterLandingConfig;
  onContinue: () => void;
  onTabChange: (tab: MasterFunnelContextTab) => void;
  entryQuery?: string;
}) {
  const steps =
    config.persuasionSteps ??
    (config.engine === "register"
      ? MASTER_FUNNEL_STEPS_REGISTER
      : config.engine === "verify"
        ? MASTER_FUNNEL_STEPS_VERIFY
        : MASTER_FUNNEL_STEPS_CHECK);
  const cost = config.costServiceId ? getCostCheckService(config.costServiceId) : null;
  /** TRC Master UI — 비용 카드 아래 · 4단계 퍼널 바로 위에 안내 문구 */
  const hookAfterCostStructure = true;

  return (
    <div className="mt-4 space-y-5 sm:mt-5 sm:space-y-6">
      <div className="min-w-0 space-y-3.5 rounded-[16px] border border-[#E5E7EB] bg-white p-4 sm:p-5 lg:p-6">
        <MasterServiceQueryEntry
          currentServiceId={config.costServiceId}
          initialQuery={entryQuery}
          onLocalTabChange={onTabChange}
        />
        {!hookAfterCostStructure ? (
          <MasterFunnelHook title={config.hookTitle} body={config.hookBody} />
        ) : null}
        {cost && config.costServiceId ? (
          <>
            <MasterPriceOverview service={cost} serviceId={config.costServiceId} />
            <MasterCostStructureSummary service={cost} serviceId={config.costServiceId} />
          </>
        ) : (
          <>
            <MasterPendingPriceOverview structureHint="정확한 비용은 내 상황과 서류를 확인한 후 비교해드립니다." />
            <MasterPendingCostStructureSummary note={config.pendingStructureNote} />
          </>
        )}
      </div>

      {hookAfterCostStructure ? (
        <MasterFunnelHook title={config.hookTitle} body={config.hookBody} />
      ) : null}

      <MasterFunnelPersuasion
        headline={config.persuasionHeadline}
        steps={steps}
        onContinue={onContinue}
      />

      <p className="mx-auto max-w-3xl break-keep px-1 text-center text-[12.5px] leading-[1.75] text-[#575F6A] sm:text-[13px]">
        {cost ? `${cost.lookupGuide} ` : ""}
        {COST_CHECK_DISCLAIMER}
      </p>
    </div>
  );
}

/** MASTER `/cost-check` 검토하기와 동일 UI — TRC(거주증) Landing 검토 탭 전용 */
function MasterTrcQuoteReviewPanel({
  service,
  onContinue,
}: {
  service: CostCheckService;
  onContinue: () => void;
}) {
  const [reviewAmount, setReviewAmount] = useState("");
  const [reviewPrep, setReviewPrep] = useState<"yes" | "no" | "">("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [showMarketPreview, setShowMarketPreview] = useState(false);

  const reviewResult = useMemo(() => {
    if (!reviewSubmitted || !reviewPrep) return null;
    const amount = Number(reviewAmount.replace(/,/g, ""));
    if (!Number.isFinite(amount) || amount <= 0) return null;
    return {
      quotedAmount: amount,
      ...evaluateCostQuoteReview(service, amount),
    };
  }, [reviewSubmitted, reviewPrep, reviewAmount, service]);

  function handleReviewSubmit(e: FormEvent) {
    e.preventDefault();
    setReviewSubmitted(true);
  }

  return (
    <div className="mt-4 space-y-5 sm:mt-5 sm:space-y-6">
      <div className="min-w-0 space-y-6 rounded-[16px] border border-[#E5E7EB] bg-white p-4 sm:p-5 lg:p-6">
        <div>
          <h2 className="text-lg font-semibold text-blue-900">견적 적정성 검토</h2>
          <p className="mt-1 text-sm text-slate-600">
            받은 견적이 정부 수수료 + 시장 일반 대행료 기준 대비 어느 정도인지 확인합니다.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-blue-900">검토 대상 서비스</p>
          <div className="mt-2 flex min-w-0 items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50/40 px-4 py-3">
            <Briefcase size={18} className="shrink-0 text-blue-800" aria-hidden />
            <span className="min-w-0 break-words font-semibold text-blue-900">{service.label}</span>
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
                placeholder="예: 3,000"
                value={reviewAmount}
                onChange={(e) => {
                  setReviewAmount(e.target.value);
                  setReviewSubmitted(false);
                }}
                className="min-h-11 w-full min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-400/16"
              />
              <span className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600">
                {service.currency}
              </span>
            </div>
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-blue-900">서류 준비·번역 포함 여부</legend>
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
                    name={`checkReviewPrep-${service.id}`}
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
          <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
            <p className="text-xs font-medium text-blue-700">정부 공식 비용 · 시장 범위</p>
            <div className="rounded-xl border border-blue-100 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-blue-700">정부 수수료</p>
              <p className="mt-1 break-words text-lg font-bold text-blue-900">{service.governmentFee}</p>
              <p className="mt-2 text-xs text-slate-600">출처: {service.source}</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
              <p className="text-xs font-medium text-blue-800">
                시장 일반 대행료 (참고)
                <span className="ml-1 font-normal text-slate-500">· {service.currency}</span>
              </p>
              <p className="mt-1 break-words text-lg font-semibold text-blue-900">
                {formatCostAmount(service.marketUsualFeeAmount, service.currency)} 전후
              </p>
              <p className="mt-1 break-words text-xs text-slate-500">
                범위 {formatCostAmount(service.marketMin, service.currency)} ~{" "}
                {formatCostAmount(service.marketMax, service.currency)}
              </p>
            </div>
            <MasterCostStructureSummary service={service} serviceId={service.id} />
          </div>
        ) : null}

        <p className="rounded-xl border border-blue-100 bg-blue-50/40 px-4 py-3 text-xs leading-relaxed text-slate-600">
          받은 견적이 있는 경우 입력하시면 정부 기준 및 시장가격 대비 적정성을 분석해드립니다.
          견적이 없는 경우에도 정부 수수료 및 시장 일반 대행료 범위를 미리 확인할 수 있습니다.
        </p>

        {reviewResult ? (
          <div className="border-t border-blue-100 pt-6">
            <CostCheckCard
              serviceId={service.id}
              quote={{
                quotedAmount: reviewResult.quotedAmount,
                verdict: reviewResult.verdict,
                title: reviewResult.title,
                summary: reviewResult.summary,
                detail: reviewResult.detail,
                fairReference: reviewResult.fairReference,
                bubblePercent: reviewResult.bubblePercent,
              }}
              onFunnelCta={onContinue}
            />
          </div>
        ) : null}
      </div>

      <p className="mx-auto max-w-3xl break-keep px-1 text-center text-[12.5px] leading-[1.75] text-[#575F6A] sm:text-[13px]">
        {COST_CHECK_DISCLAIMER}
      </p>
    </div>
  );
}

function MasterServiceReviewPanel({
  config,
  onGoLookup,
}: {
  config: MasterLandingConfig;
  onGoLookup: () => void;
}) {
  const cost = config.costServiceId ? getCostCheckService(config.costServiceId) : null;
  const hasMarket = cost ? hasMarketPriceData(cost) : false;
  const govValue = cost?.governmentFee?.trim() ? cost.governmentFee : "자료 확인 필요";
  const marketValue = hasMarket && cost
    ? `${formatCostAmount(cost.marketUsualFeeAmount, cost.currency)} 전후`
    : "확인 중";
  const marketHint = hasMarket && cost
    ? cost.marketNote || "시장 일반 대행료 참고"
    : `${config.serviceLabel} 전용 시장 참고 금액은 아직 연결되지 않았거나 확인이 필요합니다.`;

  return (
    <div className="mt-4 space-y-5 sm:mt-5 sm:space-y-6">
      <div className="min-w-0 space-y-6 rounded-[16px] border border-[#E5E7EB] bg-white p-4 sm:p-5 lg:p-6">
        <div>
          <h2 className="text-lg font-semibold text-blue-900">{config.reviewTitle}</h2>
          <p className="mt-1 text-sm text-slate-600">{config.reviewIntro}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-blue-900">검토 대상 서비스</p>
          <div className="mt-2 flex min-w-0 items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50/40 px-4 py-3">
            <span className="min-w-0 break-words font-semibold text-blue-900">{config.serviceLabel}</span>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/20 p-4 sm:p-5">
          <p className="text-sm font-semibold text-blue-900">받은 안내·견적을 이렇게 확인하세요</p>
          <ul className="space-y-2.5 text-sm leading-relaxed text-slate-600">
            {config.reviewChecks.map((item) => (
              <li key={item.title} className="break-keep">
                <span className="font-medium text-slate-700">{item.title}</span> — {item.body}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-4">
            <p className="text-[11px] font-medium tracking-[0.02em] text-[#2563EB]">정부 공식 비용</p>
            <p className="mt-1.5 text-[15px] font-bold leading-[1.35] text-[#1E3A5F]">{govValue}</p>
            <p className="mt-1.5 text-[12px] leading-[1.6] text-[#64748B]">
              {cost?.source || "공식 포털·관할 기준으로 확인하세요."}
            </p>
          </div>
          <div className="rounded-xl border border-[#D6E4FB] bg-[#F5F8FF] px-4 py-4">
            <p className="text-[11px] font-medium tracking-[0.02em] text-[#2563EB]">시장 일반 대행 범위</p>
            <p className="mt-1.5 text-[15px] font-bold leading-[1.35] text-[#1E3A5F]">{marketValue}</p>
            <p className="mt-1.5 text-[12px] leading-[1.6] text-[#64748B]">{marketHint}</p>
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-white p-4">
          <p className="text-sm font-semibold text-blue-900">견적·안내만으로 결정하지 마세요</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            내 상황을 먼저 확인하면, 불필요한 비용과 재신청을 줄일 수 있습니다.
          </p>
          <button
            type="button"
            onClick={onGoLookup}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#F97316] px-6 py-3 text-[16px] font-extrabold text-white shadow-[0_6px_16px_rgba(249,115,22,0.24)] transition-colors hover:bg-[#EA580C] sm:w-auto sm:min-h-[3.15rem] sm:text-[17px]"
          >
            내 상황 먼저 확인하기 ›
          </button>
        </div>
      </div>

      <p className="mx-auto max-w-3xl break-keep px-1 text-center text-[12.5px] leading-[1.75] text-[#575F6A] sm:text-[13px]">
        {COST_CHECK_DISCLAIMER}
      </p>
    </div>
  );
}

function MasterServiceGuidePanel({
  config,
  onGoLookup,
}: {
  config: MasterLandingConfig;
  onGoLookup: () => void;
}) {
  const guideArticle = config.guideSlug ? getPublishedArticleBySlug(config.guideSlug) : null;

  return (
    <div className="mt-4 space-y-5 sm:mt-5 sm:space-y-6">
      <div className="min-w-0 space-y-6 rounded-[16px] border border-[#E5E7EB] bg-white p-4 sm:p-5 lg:p-6">
        <div>
          <h2 className="text-lg font-semibold text-blue-900">
            {guideArticle?.title ?? config.guideTitle}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {guideArticle?.subtitle ?? config.guideIntro}
          </p>
        </div>

        {guideArticle ? (
          <GuideCaseFunnelSummary article={guideArticle} onFunnelClick={onGoLookup} showHero={false} />
        ) : (
          <>
            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
              <p className="text-xs font-medium text-blue-700">{config.serviceLabel}</p>
              <p className="mt-1 break-words text-sm font-semibold text-blue-900">{config.specialtyLine}</p>
              <p className="mt-2 break-words text-sm leading-relaxed text-slate-600">
                아래 안내는 일반적인 확인 범위입니다. 관할·상황에 따라 요구가 달라질 수 있으니 공식 자료를 함께
                확인하세요.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {config.guideItems.map((item) => (
                <div
                  key={item.title}
                  className="min-w-0 rounded-[12px] border border-[#D6E4FB] bg-white px-3.5 py-3.5 sm:px-4 sm:py-4"
                >
                  <p className="break-keep text-[13px] font-semibold leading-snug text-[#0B2A6B] sm:text-[13.5px]">
                    {item.title}
                  </p>
                  <p className="mt-1 break-keep text-[12px] font-normal leading-[1.6] text-[#556070]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {config.costServiceId === "company" && (
          <div className="rounded-xl border border-blue-100 bg-white p-4">
            <p className="text-sm font-semibold text-blue-900">직접 진행 시 참고 항목</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{DIRECT_PERMIT_COMPANY_GUIDE}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
              {DIRECT_PERMIT_COMPANY_ITEMS.map((item) => (
                <li key={item.label} className="flex min-w-0 justify-between gap-3 break-keep">
                  <span>{item.label}</span>
                  <span className="shrink-0 font-medium text-slate-800">{item.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {config.engine !== "register" &&
          config.costServiceId !== "trc" &&
          config.costServiceId !== "wp" &&
          config.costServiceId !== "tamtru" &&
          config.costServiceId !== "driving-license" && (
          <div className="rounded-xl border border-blue-100 bg-white p-4">
            <p className="text-sm font-semibold text-blue-900">공식 자료 / 공식 포털</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{config.officialNote}</p>
            <a
              href={config.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-900 transition-colors hover:bg-blue-50/60 sm:w-auto"
            >
              공식 포털에서 확인 <ExternalLink size={14} aria-hidden />
            </a>
          </div>
        )}

        <OfficialTrustZone engine={config.engine} variant="panel" className="mt-0" />

        {!guideArticle ? (
          <button
            type="button"
            onClick={onGoLookup}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 sm:w-auto"
          >
            내 상황 확인으로 이동 →
          </button>
        ) : null}
      </div>

      <p className="mx-auto max-w-3xl break-keep px-1 text-center text-[12.5px] leading-[1.75] text-[#575F6A] sm:text-[13px]">
        {COST_CHECK_DISCLAIMER}
      </p>
    </div>
  );
}

/** 초기 랜딩 전용 — 3-tab + Cost / Review / Guide. Q1 이후에는 호출하지 말 것. */
/** CHECK 4 + VERIFY 5 + REGISTER 8 — MASTER 「견적 적정성 검토」(TRC 기준 UI) */
const MASTER_QUOTE_REVIEW_SERVICE_IDS: CostCheckServiceId[] = [
  "trc",
  "wp",
  "tamtru",
  "driving-license",
  "admin",
  "real-estate",
  "fraud",
  "tax",
  "notary",
  "company",
  "restaurant",
  "hygiene",
  "fire-safety",
  "cosmetics",
  "environment",
  "medical-device",
  "franchise",
];

function usesMasterQuoteReview(id?: CostCheckServiceId): id is CostCheckServiceId {
  return Boolean(id && MASTER_QUOTE_REVIEW_SERVICE_IDS.includes(id));
}

export function MasterFunnelLanding({
  config,
  activeTab,
  onTabChange,
  onContinue,
}: {
  config: MasterLandingConfig;
  activeTab: MasterFunnelContextTab;
  onTabChange: (tab: MasterFunnelContextTab) => void;
  onContinue: () => void;
}) {
  const urlSyncedRef = useRef(false);
  const [entryQuery, setEntryQuery] = useState("");

  useEffect(() => {
    if (typeof window === "undefined" || urlSyncedRef.current) return;
    urlSyncedRef.current = true;
    const { tab, query } = readMasterFunnelEntryParams(window.location.search);
    if (window.location.search.includes("tab=") || query) {
      onTabChange(tab);
    }
    if (query) setEntryQuery(query);
  }, [onTabChange]);

  return (
    <>
      <MasterFunnelContextTabs active={activeTab} onChange={onTabChange} />
      {activeTab === "lookup" && (
        <MasterCostBasisEntry
          config={config}
          onContinue={onContinue}
          onTabChange={onTabChange}
          entryQuery={entryQuery}
        />
      )}
      {activeTab === "review" &&
        (usesMasterQuoteReview(config.costServiceId) ? (
          <MasterTrcQuoteReviewPanel
            service={getCostCheckService(config.costServiceId)}
            onContinue={onContinue}
          />
        ) : (
          <MasterServiceReviewPanel config={config} onGoLookup={onContinue} />
        ))}
      {activeTab === "direct" && <MasterServiceGuidePanel config={config} onGoLookup={onContinue} />}
    </>
  );
}

function checkReviewChecks(serviceLabel: string): MasterLandingGuideItem[] {
  return [
    {
      title: "정부 공식 수수료",
      body: `${serviceLabel} 관할·신청 유형에 따라 달라질 수 있습니다. 견적에 공식 수수료가 구분되어 있는지 확인하세요.`,
    },
    {
      title: "시장 일반 대행 범위",
      body: "대행·번역·이동·서류 준비 범위 포함 여부를 견적서에서 구분해서 확인하세요.",
    },
    {
      title: "포함/미포함 항목",
      body: "서류 준비, 번역, 현장 동행, 후속 절차가 견적에 포함됐는지 확인하세요.",
    },
    {
      title: "추가 절차 가능성",
      body: "개인 상황에 따라 추가 확인이 이어질 수 있습니다. 확인되지 않은 금액은 표시하지 않습니다.",
    },
  ];
}

function registerReviewChecks(serviceLabel: string): MasterLandingGuideItem[] {
  return [
    {
      title: "정부 공식 수수료",
      body: `${serviceLabel} 관할·허가 조건에 따라 달라질 수 있습니다. 임의 금액이 아닌 공식 기준으로 확인하세요.`,
    },
    {
      title: "시장 일반 대행 범위",
      body: "대행·번역·준비 범위 포함 여부를 견적서에서 구분해서 확인하세요.",
    },
    {
      title: "포함/미포함 항목",
      body: "서류 준비, 번역, 현장 준비, 후속 절차가 견적에 포함됐는지 확인하세요.",
    },
    {
      title: "추가 절차 가능성",
      body: "사업 조건에 따라 추가 확인이 이어질 수 있습니다. 확인되지 않은 2·3차 절차·비용은 표시하지 않습니다.",
    },
  ];
}

function checkGuideItems(serviceLabel: string): MasterLandingGuideItem[] {
  return [
    {
      title: `${serviceLabel} 기본 확인`,
      body: "국적·체류·자격 등 본인 조건을 먼저 확인한 뒤, 관할 기준에 따라 필요한 절차를 진행합니다.",
    },
    {
      title: "준비해야 할 주요 서류",
      body: "여권·체류 관련 서류 등이 필요할 수 있습니다. 정확한 목록은 관할·시점에 따라 다르므로 공식 포털에서 확인하세요.",
    },
    {
      title: "정부 수수료와 대행료",
      body: "정부에 납부하는 공식 수수료와 시장 대행·번역 비용은 서로 다릅니다. 견적에서 구분해서 확인하세요.",
    },
    {
      title: "공식 포털 확인",
      body: "최종 요건·수수료는 베트남 공식 행정 자료를 기준으로 확인하는 것이 안전합니다.",
    },
  ];
}

function registerGuideItems(serviceLabel: string): MasterLandingGuideItem[] {
  return [
    {
      title: `${serviceLabel} 기본 절차`,
      body: "사업·영업장 준비 상태를 확인한 뒤, 관할 기준에 따라 필요한 인허가·신고를 진행합니다. 접수 순서는 관할·사업 형태에 따라 달라질 수 있습니다.",
    },
    {
      title: "준비해야 할 주요 서류",
      body: "사업자·영업장 관련 자료 등이 필요할 수 있습니다. 정확한 서류 목록은 관할·시점에 따라 다르므로 공식 포털에서 확인하세요.",
    },
    {
      title: "비용 확인 원칙",
      body: "정부 공식 수수료와 시장 대행료는 별개입니다. 연결된 공식 데이터가 없으면 임의 금액을 표시하지 않습니다.",
    },
    {
      title: "추가 인허가 가능성",
      body: "사업 조건에 따라 한 번의 신청으로 끝나지 않을 수 있습니다. 확인되지 않은 절차·비용은 표시하지 않습니다.",
    },
  ];
}

/** TRC 「직접확인하기」 Landing — MASTER 4단계 카드 디자인 유지, TRC 설명만 적용 */
const MASTER_FUNNEL_STEPS_TRC: MasterFunnelStep[] = [
  {
    ...MASTER_FUNNEL_STEPS_VERIFY[0],
    desc: "베트남 법령·행정자료에 기초한 정확한 거주증 기준을 확인합니다.",
  },
  {
    ...MASTER_FUNNEL_STEPS_VERIFY[1],
    desc: "입력한 정보를 바탕으로 내 상황의 위험요인과 방향을 먼저 확인합니다.",
  },
  {
    ...MASTER_FUNNEL_STEPS_VERIFY[2],
    desc: "서류·상황을 검토한 뒤 필요한 절차와 리스크를 정리한 결과를 제공합니다.",
  },
  {
    ...MASTER_FUNNEL_STEPS_VERIFY[3],
    desc: "복잡하거나 중요한 케이스는 VFBCAI 전문가팀이 끝까지 도와드립니다.",
  },
];

export const MASTER_LANDING_TRC: MasterLandingConfig = {
  engine: "check",
  serviceLabel: "거주증 (TRC)",
  costServiceId: "trc",
  specialtyLine: "직접확인하기 · 베트남 행정전문 AI",
  hookTitle: "가격만 보고 결정하지 마세요.",
  hookBody:
    "내 상황을 먼저 확인해야 정확합니다. 행정 절차와 비용은 개인의 상황과 서비스에 따라 달라질 수 있으므로, 정부 수수료와 시장 대행료를 구분해서 본 뒤 확인을 진행합니다.",
  persuasionHeadline: "내 상황을 확인하면 불필요한 비용과 재신청을 줄일 수 있습니다.",
  // MASTER 「직접 검토하기」 심리 퍼널 — TRC 직접확인하기 Landing만
  persuasionSteps: MASTER_FUNNEL_STEPS_TRC,
  reviewTitle: "견적 적정성 검토",
  reviewIntro: "받은 견적이 정부 수수료 + 시장 일반 대행료 기준 대비 어느 정도인지 확인합니다.",
  reviewChecks: checkReviewChecks("거주증(TRC)"),
  guideTitle: "거주증(TRC) 안내",
  guideIntro: "거주증 신청의 기본 확인 항목과 비용·공식 자료 확인 방법을 안내합니다.",
  guideItems: checkGuideItems("거주증(TRC)"),
  guideSlug: TRC_GUIDE_ARTICLE.slug,
  officialUrl: "https://dichvucong.bocongan.gov.vn/bocongan/bothutuc/tthc?matt=26285",
  officialNote: "공안부 공공서비스포털의 거주증(TRC) 발급 절차 안내를 확인할 수 있습니다.",
};

export const MASTER_LANDING_WP: MasterLandingConfig = {
  engine: "check",
  serviceLabel: "노동허가 (WP)",
  costServiceId: "wp",
  specialtyLine: "직접확인하기 · 베트남 행정전문 AI",
  hookTitle: "가격만 보고 결정하지 마세요.",
  hookBody:
    "노동허가는 학력·경력·직무에 따라 가능 여부가 달라집니다. 정부 수수료와 시장 대행료를 구분해서 본 뒤, 내 상황을 먼저 확인하세요.",
  persuasionHeadline: "내 상황을 먼저 확인하면 불필요한 행정비용과 절차를 줄일 수 있습니다.",
  reviewTitle: "견적·조건 적정성 검토",
  reviewIntro: "받은 안내나 견적이 노동허가 기준과 비용 구조에 맞는지 확인합니다.",
  reviewChecks: checkReviewChecks("노동허가(WP)"),
  guideTitle: "노동허가(WP) 안내",
  guideIntro: "노동허가 신청의 기본 확인 항목과 비용·공식 자료 확인 방법을 안내합니다.",
  guideItems: checkGuideItems("노동허가(WP)"),
  guideSlug: WP_GUIDE_SLUG,
  officialUrl: "https://dichvucong.gov.vn/",
  officialNote: "외국인노동자 관리 관련 공공서비스 안내는 국가공공서비스포털에서 확인할 수 있습니다.",
};

export const MASTER_LANDING_TAMTRU: MasterLandingConfig = {
  engine: "check",
  serviceLabel: "임시거주등록 (땀주)",
  costServiceId: "tamtru",
  specialtyLine: "직접확인하기 · 베트남 행정전문 AI",
  hookTitle: "가격만 보고 결정하지 마세요.",
  hookBody:
    "임시거주 신고는 숙소 형태에 따라 방법이 달라집니다. 정부 수수료와 시장 대행료를 구분해서 본 뒤, 내 상황을 먼저 확인하세요.",
  persuasionHeadline: "내 상황을 먼저 확인하면 불필요한 행정비용과 절차를 줄일 수 있습니다.",
  reviewTitle: "견적·조건 적정성 검토",
  reviewIntro: "받은 안내나 견적이 땀주 등록 기준과 비용 구조에 맞는지 확인합니다.",
  reviewChecks: checkReviewChecks("임시거주등록(땀주)"),
  guideTitle: "임시거주등록(땀주) 안내",
  guideIntro: "땀주 신고의 기본 확인 항목과 비용·공식 자료 확인 방법을 안내합니다.",
  guideItems: checkGuideItems("임시거주등록(땀주)"),
  guideSlug: TAMTRU_GUIDE_SLUG,
  officialUrl: "https://evisa.gov.vn/khai-bao-tam-tru",
  officialNote: "임시거주 신고 관련 공식 안내는 evisa 포털에서 확인할 수 있습니다.",
};

export const MASTER_LANDING_DRIVING: MasterLandingConfig = {
  engine: "check",
  serviceLabel: "운전면허 전환",
  costServiceId: "driving-license",
  specialtyLine: "직접확인하기 · 베트남 행정전문 AI",
  hookTitle: "가격만 보고 결정하지 마세요.",
  hookBody:
    "외국인 운전면허 교환은 정부 수수료와 번역·공증 등 추가 비용이 다를 수 있습니다. 구분해서 본 뒤 내 상황을 먼저 확인하세요.",
  persuasionHeadline: "내 상황을 먼저 확인하면 불필요한 행정비용과 절차를 줄일 수 있습니다.",
  reviewTitle: "견적·조건 적정성 검토",
  reviewIntro: "받은 안내나 견적이 운전면허 전환 기준과 비용 구조에 맞는지 확인합니다.",
  reviewChecks: checkReviewChecks("운전면허 전환"),
  guideTitle: "운전면허 전환 안내",
  guideIntro: "외국인 운전면허 교환의 기본 확인 항목과 비용·공식 자료 확인 방법을 안내합니다.",
  guideItems: checkGuideItems("운전면허 전환"),
  guideSlug: DRIVING_LICENSE_GUIDE_SLUG,
  officialUrl: "https://dvc-gplx.csgt.bocongan.gov.vn/",
  officialNote: "외국인 운전면허 교환 관련 공식 안내는 교통경찰 공공서비스 포털에서 확인할 수 있습니다.",
};

export const MASTER_LANDING_COMPANY: MasterLandingConfig = {
  engine: "register",
  serviceLabel: "법인설립",
  costServiceId: "company",
  specialtyLine: "직접허가받기 · 베트남 인허가전문 AI",
  hookTitle: "가격만 보고 결정하지 마세요.",
  hookBody:
    "법인설립은 정부 고시 수수료 외에 인감·전자서명·세무 초기설정 등 실무 비용이 함께 발생할 수 있습니다. 구분해서 본 뒤 준비 상태를 확인하세요.",
  persuasionHeadline: "내 상황과 필요한 절차를 먼저 확인하면 불필요한 비용과 재신청을 줄일 수 있습니다.",
  reviewTitle: "인허가 적정성 검토",
  reviewIntro: "받은 안내나 견적이 법인설립에 필요한 절차와 비용 기준에 맞는지 확인합니다.",
  reviewChecks: registerReviewChecks("법인설립"),
  guideTitle: "법인설립 안내",
  guideIntro: "법인설립의 기본 절차·준비 항목·직접 진행 시 참고 비용을 확인합니다.",
  guideItems: registerGuideItems("법인설립"),
  guideSlug: COMPANY_GUIDE_SLUG,
  officialUrl: "https://dangkykinhdoanh.gov.vn/",
  officialNote: "국가기업등록포털에서 IRC/ERC 관련 안내를 확인할 수 있습니다.",
};

function makePendingRegisterLanding(
  serviceLabel: string,
  costServiceId: CostCheckServiceId,
  officialUrl: string,
  officialNote: string,
  guideSlug: string
): MasterLandingConfig {
  return {
    engine: "register",
    serviceLabel,
    costServiceId,
    specialtyLine: "직접허가받기 · 베트남 인허가전문 AI",
    hookTitle: "가격만 보고 결정하지 마세요.",
    hookBody:
      "인허가는 필요한 절차를 먼저 확인해야 정확합니다. 상황에 따라 추가 절차가 필요할 수 있으므로 정부 수수료와 시장 대행료를 구분해서 본 뒤 준비 상태를 확인합니다.",
    persuasionHeadline: "내 상황과 필요한 절차를 먼저 확인하면 불필요한 비용과 재신청을 줄일 수 있습니다.",
    pendingStructureNote: `※ ${serviceLabel} 전용 공식 수수료·시장가격 데이터가 아직 연결되지 않아 임의 금액을 표시하지 않습니다. 정확한 안내는 준비 상태 확인 후 이어집니다.`,
    reviewTitle: "인허가 적정성 검토",
    reviewIntro: `현재 받은 안내나 견적이 ${serviceLabel}에 필요한 절차와 비용 기준에 맞는지 확인합니다.`,
    reviewChecks: registerReviewChecks(serviceLabel),
    guideTitle: `${serviceLabel} 안내`,
    guideIntro: `${serviceLabel}의 기본 절차·준비 항목·추가 절차 가능성을 확인합니다.`,
    guideItems: registerGuideItems(serviceLabel),
    guideSlug,
    officialUrl,
    officialNote,
  };
}

export const MASTER_LANDING_RESTAURANT = makePendingRegisterLanding(
  "식당허가",
  "restaurant",
  "https://dichvucong.gov.vn/",
  "관할 지역을 선택한 뒤 식당·위생·소방 관련 안내는 국가공공서비스포털에서 확인할 수 있습니다.",
  RESTAURANT_GUIDE_SLUG
);

export const MASTER_LANDING_HYGIENE = makePendingRegisterLanding(
  "위생허가",
  "hygiene",
  "https://dichvucong.gov.vn/",
  "관할 지역을 선택한 뒤 위생 관련 안내는 국가공공서비스포털에서 확인할 수 있습니다.",
  HYGIENE_GUIDE_SLUG
);

export const MASTER_LANDING_FIRE = makePendingRegisterLanding(
  "소방허가",
  "fire-safety",
  "https://dichvucong.gov.vn/",
  "관할 지역을 선택한 뒤 소방 관련 안내는 국가공공서비스포털에서 확인할 수 있습니다.",
  FIRE_SAFETY_GUIDE_SLUG
);

export const MASTER_LANDING_COSMETICS = makePendingRegisterLanding(
  "화장품허가",
  "cosmetics",
  "https://dichvucong.gov.vn/",
  "관할 지역을 선택한 뒤 화장품 관련 안내는 국가공공서비스포털에서 확인할 수 있습니다.",
  COSMETICS_GUIDE_SLUG
);

export const MASTER_LANDING_ENVIRONMENT = makePendingRegisterLanding(
  "환경허가",
  "environment",
  "https://dichvucong.gov.vn/",
  "관할 지역을 선택한 뒤 환경 관련 안내는 국가공공서비스포털에서 확인할 수 있습니다.",
  ENVIRONMENT_GUIDE_SLUG
);

export const MASTER_LANDING_MEDICAL = makePendingRegisterLanding(
  "의료기기 수입·유통허가",
  "medical-device",
  "https://dichvucong.gov.vn/",
  "관할 지역을 선택한 뒤 의료기기 관련 안내는 국가공공서비스포털에서 확인할 수 있습니다.",
  MEDICAL_DEVICE_GUIDE_SLUG
);

export const MASTER_LANDING_FRANCHISE = makePendingRegisterLanding(
  "프랜차이즈 등록",
  "franchise",
  "https://dichvucong.gov.vn/",
  "관할 지역을 선택한 뒤 프랜차이즈 관련 안내는 국가공공서비스포털에서 확인할 수 있습니다.",
  FRANCHISE_GUIDE_SLUG
);

function makeVerifyLanding(
  serviceLabel: string,
  costServiceId: CostCheckServiceId,
  hookBody: string,
  reviewChecks: MasterLandingGuideItem[],
  guideItems: MasterLandingGuideItem[],
  officialUrl: string,
  officialNote: string,
  guideSlug?: string
): MasterLandingConfig {
  return {
    engine: "verify",
    serviceLabel,
    costServiceId,
    specialtyLine: "직접 검토하기 · 베트남 법률전문 AI",
    hookTitle: "서류만 보고 서명·송금하지 마세요.",
    hookBody,
    persuasionHeadline: "내 상황을 먼저 확인하면 불필요한 손실과 잘못된 대응을 줄일 수 있습니다.",
    persuasionSteps: MASTER_FUNNEL_STEPS_VERIFY,
    pendingStructureNote: `※ ${serviceLabel} 전용 확인된 상담가격 데이터가 아직 연결되지 않아 임의 금액을 표시하지 않습니다. 문서 유형·분량·긴급 여부에 따라 달라질 수 있습니다.`,
    reviewTitle: "검토 항목 안내",
    reviewIntro: "받은 서류·문제 상황을 아래 기준으로 확인한 뒤, 내 상황에 맞는 검토를 진행합니다.",
    reviewChecks,
    guideTitle: `${serviceLabel} 안내`,
    guideIntro: `${serviceLabel}에서 확인하는 항목과 사전·사후 검토 흐름을 안내합니다.`,
    guideItems,
    guideSlug,
    officialUrl,
    officialNote,
  };
}

export const MASTER_LANDING_ADMIN = makeVerifyLanding(
  "행정문서 리뷰",
  "admin",
  "출입국·노동·세무·투자 관련 공문서는 서명·제출 전에 요건과 위험요인을 먼저 확인해야 합니다. 이미 반려·보완 요청을 받은 경우에도 대응 방향을 점검할 수 있습니다.",
  [
    {
      title: "사전 검토 (Prevent Review)",
      body: "제출·계약 전 — 행정기관 제출서류, 계약서, 법인·투자·노동·인허가·세무·번역·공증 서류의 요건·누락·위험 조항을 확인합니다.",
    },
    {
      title: "사후 검토 (Case Review)",
      body: "문제 발생 후 — 기관 반려·보완 요구, 계약 분쟁, 투자·노동·인허가·세무 문제, 소송·사기 피해 등 대응 단계를 점검합니다.",
    },
    {
      title: "확인 포인트",
      body: "제출 요건과 형식, 누락 서류, 불리한 조항, 원본·번역 일치, 공증·인증·영사확인 필요 여부를 확인합니다.",
    },
    {
      title: "관할 기관 안내",
      body: "출입국·노동·세무·투자등록·사업자등록 등 선택한 기관별 제출 절차·필요 서류를 결과 화면에서 안내합니다.",
    },
  ],
  [
    {
      title: "어떤 서류를 검토하나요?",
      body: "비자·거주증·노동허가 등 행정기관 제출서류, 계약서, 법인·투자·노동·인허가·세무 서류, 번역·공증·인증 자료를 검토합니다.",
    },
    {
      title: "사전 vs 사후 검토",
      body: "서명·제출 전 위험을 미리 확인하거나, 이미 반려·통지·분쟁이 발생한 뒤 대응 방향을 확인할 수 있습니다.",
    },
    {
      title: "AI 1차 분석",
      body: "서류 유형·상황 설명·첨부 파일을 바탕으로 위험 요인과 권장 조치 방향을 1차 정리합니다.",
    },
    {
      title: "전문가 연결",
      body: "복잡하거나 긴급한 경우 VFBCAI 전문가팀이 추가 검토를 도와드립니다.",
    },
  ],
  "https://dichvucong.gov.vn/",
  "출입국·노동·세무 등 행정 서류 관련 안내는 국가공공서비스포털에서 확인할 수 있습니다.",
  ADMIN_GUIDE_SLUG
);

export const MASTER_LANDING_REAL_ESTATE = makeVerifyLanding(
  "부동산 문서 리뷰",
  "real-estate",
  "임대·매매 계약서는 보증금·소유권·특약 조항을 서명 전에 확인해야 합니다. 이미 분쟁이 시작된 경우에도 현재 단계에 맞는 대응을 점검할 수 있습니다.",
  [
    {
      title: "사전 검토",
      body: "매매·임대차 계약서, 계약금·중도금 서류, 소유권 증빙, 인허가·분쟁 소지 서류의 조항·누락·위험을 확인합니다.",
    },
    {
      title: "사후 검토",
      body: "매매대금 미지급, 임대료·보증금 반환 거부, 소유권·명의 분쟁, 인허가 문제 등 발생 후 대응 방향을 점검합니다.",
    },
    {
      title: "보증금·특약 확인",
      body: "보증금 반환 조건, 해지·위약 조항, 임대인·매도인 의무가 계약서에 어떻게 적혀 있는지 확인합니다.",
    },
    {
      title: "서류 진위·완전성",
      body: "등기부등본 등 소유권 서류와 계약 조건이 서로 일치하는지, 누락·불일치가 없는지 확인합니다.",
    },
  ],
  [
    {
      title: "검토 대상 서류",
      body: "매매·임대차 계약서, 계약금·중도금 영수·이체 내역, 등기부등본 등 소유권 증빙, 관련 인허가·통지 서류를 검토합니다.",
    },
    {
      title: "왜 먼저 확인해야 하나요?",
      body: "보증금 미반환·무허가 매물·명의 불일치 등은 계약 후에야 발견되는 경우가 많아, 서명 전 확인이 중요합니다.",
    },
    {
      title: "AI 1차 분석",
      body: "계약 조건·상황 설명·첨부 서류를 바탕으로 위험 신호와 보완·대응 방향을 정리합니다.",
    },
    {
      title: "전문가 연결",
      body: "분쟁 가능성이 높거나 금액이 큰 경우 VFBCAI 전문가팀의 추가 검토를 권합니다.",
    },
  ],
  "https://dichvucong.gov.vn/",
  "부동산 거래·등록 관련 안내는 국가공공서비스포털에서 관할 지역별로 확인할 수 있습니다.",
  REAL_ESTATE_GUIDE_SLUG
);

export const MASTER_LANDING_FRAUD = makeVerifyLanding(
  "사기문서 리뷰",
  "fraud",
  "투자·대출·온라인 거래 제안은 송금·계약 전에 진위를 확인해야 합니다. 이미 피해가 발생한 경우에도 즉시 대응 단계를 점검할 수 있습니다.",
  [
    {
      title: "사전 검토",
      body: "투자·대출·온라인 거래·결혼·연애·사업제휴 제안서·계약서의 비정상 조건·허위 수익·선입금 요구를 확인합니다.",
    },
    {
      title: "사후 검토",
      body: "투자금 미회수, 선입금 편취, 먹튀, 신뢰 이용 피해 등 발생 후 신고·증거 보전·대응 순서를 점검합니다.",
    },
    {
      title: "위험 신호",
      body: "비현실적 수익률, 긴급 송금 압박, 공식 채널이 아닌 연락, 서류·계좌 정보 불일치 등을 확인합니다.",
    },
    {
      title: "증거 보전",
      body: "대화·이체 내역·계약서 원본을 보존하고, 추가 송금 전에 대응 방향을 확인합니다.",
    },
  ],
  [
    {
      title: "검토 대상",
      body: "투자·대출 제안서, 온라인 거래 내역, 결혼·연애 관련 서류·대화, 사업제휴·동업 제안서 등을 검토합니다.",
    },
    {
      title: "송금 전 확인",
      body: "상대방·계좌·서류의 신뢰도를 먼저 점검하면 피해 예방에 도움이 됩니다.",
    },
    {
      title: "AI 1차 분석",
      body: "문서·상황 설명을 바탕으로 사기 의심 요인과 권장 조치를 1차 정리합니다.",
    },
    {
      title: "전문가 연결",
      body: "피해 규모가 크거나 형사·민사 대응이 필요한 경우 VFBCAI 전문가팀이 도와드립니다.",
    },
  ],
  "https://dichvucong.gov.vn/",
  "사기·분쟁 관련 공식 신고·안내는 관할 기관·국가공공서비스포털에서 확인할 수 있습니다.",
  FRAUD_GUIDE_SLUG
);

export const MASTER_LANDING_TAX = makeVerifyLanding(
  "세무문서 리뷰",
  "tax",
  "세금 고지서·계좌동결 통지는 납부·이의 기한을 놓치면 가산세·계좌 사용 제한으로 이어질 수 있습니다. 통지를 받은 즉시 내용과 대응 기한을 확인하세요.",
  [
    {
      title: "사전 검토",
      body: "세금 고지서·신고서류·계좌동결·가산세 통지·세무조사 자료 요청의 내용·근거·기한을 확인합니다.",
    },
    {
      title: "사후 검토",
      body: "고지 금액 이의, 신고 누락·오류, 계좌동결 해제, 가산세·세무조사 대응 단계를 점검합니다.",
    },
    {
      title: "기한 확인",
      body: "납부·이의신청·자료 제출 기한을 놓치면 불이익이 커질 수 있어 우선 확인합니다.",
    },
    {
      title: "관할·명의 일치",
      body: "사업자번호·납세자 명의·관할 세무서가 서류와 일치하는지 확인합니다.",
    },
  ],
  [
    {
      title: "검토 대상 서류",
      body: "세금 고지서, 신고 관련 서류, 계좌동결·가산세 통지, 세무조사 통지·자료 요청 서류를 검토합니다.",
    },
    {
      title: "왜 긴급한가요?",
      body: "계좌동결·가산세는 기한 내 대응이 없으면 손실이 확대될 수 있습니다.",
    },
    {
      title: "AI 1차 분석",
      body: "통지 내용·상황 설명을 바탕으로 위험도와 권장 대응 순서를 정리합니다.",
    },
    {
      title: "전문가 연결",
      body: "세무조사·추징 가능성이 있는 경우 VFBCAI 전문가팀의 추가 검토를 권합니다.",
    },
  ],
  "https://dichvucong.gov.vn/",
  "세무 관련 공식 안내·신고는 국가공공서비스포털·관할 세무서 기준으로 확인할 수 있습니다.",
  TAX_GUIDE_SLUG
);

export const MASTER_LANDING_UNCLEAR = makeVerifyLanding(
  "불확실한 서류 검토",
  "notary",
  "어떤 서류인지 모르거나 기한이 불분명한 통지는 그대로 두면 불이익이 커질 수 있습니다. 발신처·내용·대응 기한부터 확인하세요.",
  [
    {
      title: "사전 검토",
      body: "정부·법원·경찰·회사·개인·출처불명 서류의 성격·요구 사항·위험 신호를 확인합니다.",
    },
    {
      title: "사후 검토",
      body: "이미 기한을 넘겼거나 대응 중인 경우, 현재 단계에 맞는 보완·이의·신고 방향을 점검합니다.",
    },
    {
      title: "발신처 확인",
      body: "공식 기관·회사 명의 여부, 연락처·도장·서식의 정상 여부를 확인합니다.",
    },
    {
      title: "번역·공증 필요성",
      body: "제출·소송·행정 대응에 번역·공증·영사확인이 필요한지 확인합니다.",
    },
  ],
  [
    {
      title: "이런 경우에 이용하세요",
      body: "베트남어·영어로 된 통지·계약·공문을 받았지만 내용·긴급도를 모를 때, 어디에 제출해야 하는지 불분명할 때 이용합니다.",
    },
    {
      title: "검토 흐름",
      body: "서류 성격 파악 → 요구 사항·기한 확인 → 위험도·대응 순서 정리 → 필요 시 전문가 연결 순으로 진행합니다.",
    },
    {
      title: "AI 1차 분석",
      body: "서류 설명·첨부 파일을 바탕으로 1차 위험 신호와 확인해야 할 항목을 정리합니다.",
    },
    {
      title: "공증·번역 안내",
      body: "제출·소송에 필요한 번역·공증 범위는 상황 확인 후 안내됩니다.",
    },
  ],
  "https://dichvucong.gov.vn/",
  "서류 성격·제출 창구는 발신 기관·관할에 따라 다르므로 공식 포털에서 추가 확인이 필요할 수 있습니다.",
  UNCLEAR_GUIDE_SLUG
);

const VERIFY_MASTER_LANDINGS: Partial<Record<CostCheckServiceId, MasterLandingConfig>> = {
  admin: MASTER_LANDING_ADMIN,
  "real-estate": MASTER_LANDING_REAL_ESTATE,
  fraud: MASTER_LANDING_FRAUD,
  tax: MASTER_LANDING_TAX,
  notary: MASTER_LANDING_UNCLEAR,
};

export function getVerifyMasterLanding(id: CostCheckServiceId): MasterLandingConfig | null {
  return VERIFY_MASTER_LANDINGS[id] ?? null;
}

function engineGuideItems(serviceLabel: string): MasterLandingGuideItem[] {
  return [
    {
      title: "기본 절차",
      body: `${serviceLabel} 관련 기본 절차와 준비 항목을 확인합니다. 서비스를 선택하면 상세 안내로 이어집니다.`,
    },
    {
      title: "필요 서류",
      body: "서비스·상황에 따라 필요 서류가 달라질 수 있습니다. 목록에서 서비스를 선택해 주세요.",
    },
  ];
}

/** 엔진 진입 — 서비스 미선택 시 MasterFunnelLanding (홈 CHECK/VERIFY/REGISTER) */
export const MASTER_LANDING_ENGINE_CHECK: MasterLandingConfig = {
  engine: "check",
  serviceLabel: "CHECK",
  specialtyLine: "거주증·노동허가·땀주·운전면허 등 베트남 행정 절차",
  hookTitle: "먼저 직접 확인하세요.",
  hookBody:
    "서비스를 입력하거나 선택하면 정부 수수료·시장 대행료·필요 서류를 같은 화면에서 확인할 수 있습니다.",
  persuasionHeadline: "내 상황에 맞는 절차와 비용을 먼저 확인하면 불필요한 비용을 줄일 수 있습니다.",
  pendingStructureNote:
    "서비스를 선택하면 정부 수수료와 시장 대행료 기준을 이 화면에서 바로 확인할 수 있습니다.",
  reviewTitle: "견적·비용 검토",
  reviewIntro: "받은 견적이 정부 수수료와 시장 일반 대행료 기준에 맞는지 확인합니다.",
  reviewChecks: checkReviewChecks("선택한 서비스"),
  guideTitle: "절차·서류 안내",
  guideIntro: "진행 절차와 필요 서류 확인 방법을 안내합니다.",
  guideItems: engineGuideItems("CHECK"),
  officialUrl: "https://dichvucong.gov.vn/",
  officialNote: "국가공공서비스포털에서 관할·업무별 안내를 확인할 수 있습니다.",
};

export const MASTER_LANDING_ENGINE_VERIFY: MasterLandingConfig = {
  engine: "verify",
  serviceLabel: "VERIFY",
  specialtyLine: "행정·부동산·세무·사기·불확실한 서류 검토",
  hookTitle: "먼저 직접 검토하세요.",
  hookBody:
    "서류·계약·견적을 입력하거나 선택하면 검토 기준과 다음 단계를 같은 화면에서 확인할 수 있습니다.",
  persuasionHeadline: "계약·서류를 먼저 검토하면 불필요한 비용과 리스크를 줄일 수 있습니다.",
  persuasionSteps: MASTER_FUNNEL_STEPS_VERIFY,
  pendingStructureNote:
    "서비스를 선택하면 검토 기준과 참고 비용 범위를 이 화면에서 확인할 수 있습니다.",
  reviewTitle: "문서·견적 검토",
  reviewIntro: "받은 문서·계약·견적이 일반 기준과 맞는지 확인합니다.",
  reviewChecks: checkReviewChecks("선택한 서비스"),
  guideTitle: "검토·대응 안내",
  guideIntro: "문서 검토 절차와 필요 준비 사항을 안내합니다.",
  guideItems: engineGuideItems("VERIFY"),
  officialUrl: "https://dichvucong.gov.vn/",
  officialNote: "관련 공식 자료는 서비스 선택 후 안내됩니다.",
};

export const MASTER_LANDING_ENGINE_REGISTER: MasterLandingConfig = {
  engine: "register",
  serviceLabel: "REGISTER",
  specialtyLine: "법인설립·식당·소방·위생 등 인허가",
  hookTitle: "먼저 직접 확인하세요.",
  hookBody:
    "인허가 종류를 입력하거나 선택하면 절차·비용·필요 서류를 같은 화면에서 확인할 수 있습니다.",
  persuasionHeadline: "필요한 절차를 먼저 확인하면 재신청과 불필요한 비용을 줄일 수 있습니다.",
  persuasionSteps: MASTER_FUNNEL_STEPS_REGISTER,
  pendingStructureNote:
    "서비스를 선택하면 정부 수수료·시장 대행료·절차 개요를 이 화면에서 확인할 수 있습니다.",
  reviewTitle: "인허가 견적 검토",
  reviewIntro: "받은 안내·견적이 해당 인허가 기준에 맞는지 확인합니다.",
  reviewChecks: registerReviewChecks("선택한 인허가"),
  guideTitle: "인허가 절차 안내",
  guideIntro: "설립·허가 절차와 필요 서류를 안내합니다.",
  guideItems: engineGuideItems("REGISTER"),
  officialUrl: "https://dichvucong.gov.vn/",
  officialNote: "국가공공서비스포털에서 업종·관할별 안내를 확인할 수 있습니다.",
};

/** 2번째 화면(Master landing) · 질문 단계 공통 헤더 — TRC FunnelPageHeader 위계와 동일 */
export function getMasterLandingPageHeader(
  config: MasterLandingConfig,
  activeTab: MasterFunnelContextTab,
  options?: { inQuestions?: boolean; questionDescription?: string }
): { title: string; description: string } {
  if (options?.inQuestions) {
    return {
      title: config.serviceLabel,
      description: options.questionDescription ?? config.specialtyLine,
    };
  }
  if (activeTab === "review") {
    return { title: config.reviewTitle, description: config.reviewIntro };
  }
  if (activeTab === "direct") {
    return { title: config.guideTitle, description: config.guideIntro };
  }
  const lookupTitle =
    config.engine === "verify"
      ? `${config.serviceLabel} 검토 시작`
      : `${config.serviceLabel} 비용 확인`;
  const lookupDesc =
    config.engine === "verify"
      ? "제출·계약 전 서류 검토부터 문제 발생 후 대응 검토까지, 내 상황을 먼저 확인합니다."
      : config.engine === "register"
        ? "정부 수수료와 시장 대행료를 먼저 확인한 뒤, 준비 상태를 직접 확인합니다."
        : "정부 수수료와 시장 대행료를 먼저 확인한 뒤, 내 상황을 직접 확인합니다.";
  return { title: lookupTitle, description: lookupDesc };
}
