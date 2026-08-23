"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase } from "lucide-react";
import {
  COST_CHECK_DISCLAIMER,
  COST_CHECK_SERVICES,
  evaluateCostQuoteReview,
  formatCostAmount,
  getCostCheckService,
  type CostCheckService,
  type CostCheckServiceId,
  type CostCheckTab,
} from "@/lib/costCheck";
import { CostCheckCard } from "@/components/cost-check/CostCheckCard";
import { WpRegionalOfficialFee } from "@/components/cost-check/WpRegionalOfficialFee";
import SiteHeader from "@/components/home/SiteHeader";
import { ENGINE_CONTAINER } from "@/components/engine/EngineLandingChrome";
import { hasCostSignal, matchCostCheckService } from "@/lib/aiCostSection";
import { getTrcArticleByIntent, resolveTrcArticleIntent } from "@/lib/contentPacks/intentRouter";
import { guidePath } from "@/lib/contentPacks/paths";
import { getPublishedArticleBySlug } from "@/lib/contentPacks/registry";
import { WP_GUIDE_SLUG } from "@/lib/contentPacks/wpArticles";
import { routeByKeywords } from "@/lib/smartRouter";

const TABS: { id: CostCheckTab; label: string; desc: string }[] = [
  { id: "lookup", label: "확인하기", desc: "직접 확인하기" },
  { id: "review", label: "검토하기", desc: "직접 검토하기" },
  { id: "direct", label: "자세히 보기", desc: "관련 가이드 상세" },
];

const SERVICE_CATEGORIES = [
  { id: "lookup" as const, label: "직접 확인하기" },
  { id: "review" as const, label: "직접 검토하기" },
  { id: "direct" as const, label: "직접 인허가 받기" },
];

type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]["id"];

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
  if (preferredTab) return preferredTab;
  return extractAmountFromQuery(q) ? "review" : "lookup";
}

function extractAmountFromQuery(q: string): string {
  const match = q.replace(/,/g, "").match(/(\d[\d.]*)/);
  return match ? match[1] : "";
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

  return null;
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
  return (
    <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
      <p className="text-xs font-medium text-blue-700">정부 공식 비용 · 시장 범위</p>
      <div className="rounded-xl border border-blue-100 bg-white p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-blue-700">정부 수수료</p>
        <p className="mt-1 break-words text-lg font-bold text-blue-900">{service.governmentFee}</p>
        <p className="mt-2 text-xs text-slate-600">출처: {service.source}</p>
      </div>
      <div className="rounded-xl border border-blue-100 bg-white p-4">
        <p className="text-xs font-medium text-blue-800">시장 일반 대행료 (참고)</p>
        <p className="mt-1 text-base font-semibold text-blue-900">
          {formatCostAmount(service.marketUsualFeeAmount, service.currency)} 전후
        </p>
        <p className="mt-1 text-xs text-slate-500">
          범위 {formatCostAmount(service.marketMin, service.currency)} ~{" "}
          {formatCostAmount(service.marketMax, service.currency)}
        </p>
      </div>
      {serviceId === "wp" ? (
        <WpRegionalOfficialFee sources={service.officialSources} question={question} />
      ) : null}
    </div>
  );
}

function CtaBlock() {
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-3">
      <p className="text-sm font-semibold text-blue-900">다음 단계</p>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/check"
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 sm:flex-none"
        >
          CHECK로 절차 확인
        </Link>
        <Link
          href="/register"
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-900 transition-colors hover:bg-blue-50/60"
        >
          REGISTER로 등록 지원
        </Link>
      </div>
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
      setServiceInput(qParam);
      const result = applyQueryToCostCheck(qParam, {
        tabParam,
        setTab,
        setInitialQuery,
        setSelectedServiceId,
        setServiceInput,
        setReviewAmount,
        setReviewSubmitted,
      });
      if (!result.matched && result.routedToAi) {
        setQueryNotice(
          "등록된 비용 확인 서비스가 아닙니다. 확인을 누르면 AI 확인 화면으로 이동합니다."
        );
      }
    }
  }, [searchParams]);

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

  function handlePickService(id: CostCheckServiceId, category: ServiceCategory) {
    const service = getCostCheckService(id);
    setSelectedServiceId(id);
    setServiceInput(service.label);
    setPickerOpen(false);
    setPickerCategory(null);
    setQueryNotice("");
    setShowMarketPreview(false);
    setReviewSubmitted(false);

    if (category === "review") {
      setTab("review");
    } else if (category === "direct") {
      setTab("direct");
    } else {
      setTab("lookup");
    }
  }

  function handleUnifiedSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = serviceInput.trim();
    if (!trimmed) {
      setQueryNotice("서비스를 입력하거나 목록에서 선택해 주세요.");
      return;
    }

    setQueryNotice("");
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
      router.push(routeByKeywords(trimmed).href);
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

  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      <SiteHeader />
      <div className={`${ENGINE_CONTAINER} pb-10 pt-5 sm:pb-14 sm:pt-8`}>
        <div className="mx-auto w-full min-w-0 max-w-2xl">
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

          <div className="mb-5 flex min-w-0 rounded-xl border border-blue-200 bg-white p-1 shadow-[0_0_0_3px_rgba(30,64,175,0.05),0_2px_8px_rgba(15,23,42,0.04)] sm:mb-6">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`min-w-0 flex-1 rounded-lg px-1 py-2 text-center transition sm:px-3 sm:py-2.5 ${
                  tab === t.id
                    ? "bg-blue-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-blue-50/60 hover:text-blue-900"
                }`}
              >
                <span className="block break-keep text-[12px] font-semibold leading-tight sm:text-sm">
                  {t.label}
                </span>
                <span
                  className={`mt-0.5 hidden break-keep text-[10px] leading-tight sm:block ${
                    tab === t.id ? "text-blue-200" : "text-slate-400"
                  }`}
                >
                  {t.desc}
                </span>
              </button>
            ))}
          </div>

          <div className="min-w-0 rounded-2xl border border-blue-200 bg-white p-4 shadow-[0_0_0_3px_rgba(30,64,175,0.05),0_6px_18px_rgba(15,23,42,0.06)] sm:p-6 lg:p-8">
            {tab === "lookup" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-blue-900">정부 수수료 · 기준 안내</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    서비스를 선택하면 정부 수수료와 시장 일반 대행료 기준을 확인할 수 있습니다.
                  </p>
                  {initialQuery ? (
                    <p className="mt-2 text-xs text-slate-500">
                      질문: <span className="text-slate-700">{initialQuery}</span>
                    </p>
                  ) : null}
                </div>

                <form onSubmit={handleUnifiedSubmit} className="space-y-3">
                  <label htmlFor="cost-check-service-input" className="block text-sm font-medium text-blue-900">
                    서비스를 직접 입력하거나 선택하세요
                  </label>
                  <div ref={pickerRef} className="relative min-w-0">
                    <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
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
                        className="min-h-11 w-full min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-400/16"
                        autoComplete="off"
                      />
                      <button
                        type="submit"
                        className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 sm:w-auto"
                      >
                        확인
                      </button>
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
                              {COST_CHECK_SERVICES.map((service) => (
                                <li key={service.id}>
                                  <button
                                    type="button"
                                    onClick={() => handlePickService(service.id, pickerCategory)}
                                    className="w-full px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-blue-50/60 hover:text-blue-900"
                                  >
                                    {service.label}
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

                {selectedService ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
                        정부 수수료
                      </p>
                      <p className="mt-1 break-words text-xl font-bold text-blue-900 sm:text-2xl">
                        {selectedService.governmentFee}
                      </p>
                      <p className="mt-2 text-xs text-slate-600">출처: {selectedService.source}</p>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                      <p className="text-xs font-medium text-blue-800">시장 일반 대행료 (참고)</p>
                      <p className="mt-1 text-lg font-semibold text-blue-900">
                        {formatCostAmount(selectedService.marketUsualFeeAmount, selectedService.currency)}{" "}
                        전후
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        범위 {formatCostAmount(selectedService.marketMin, selectedService.currency)} ~{" "}
                        {formatCostAmount(selectedService.marketMax, selectedService.currency)}
                      </p>
                    </div>

                    <p className="text-sm leading-relaxed text-slate-700">{selectedService.lookupGuide}</p>
                    {selectedServiceId === "wp" ? (
                      <WpRegionalOfficialFee
                        sources={selectedService.officialSources}
                        question={initialQuery || undefined}
                      />
                    ) : null}
                  </div>
                ) : null}

                <CtaBlock />
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
                  {initialQuery ? (
                    <p className="mt-2 text-xs text-slate-500">
                      질문: <span className="text-slate-700">{initialQuery}</span>
                    </p>
                  ) : null}
                </div>

                {!activeServiceId ? (
                  <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                    <p className="text-sm leading-relaxed text-slate-600">
                      확인하기에서 서비스를 입력하거나 선택하면 관련 가이드를 안내해 드립니다.
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

          <p className="mt-5 break-words text-center text-xs leading-relaxed text-slate-500 sm:mt-6">
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
