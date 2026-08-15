"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  COST_CHECK_DISCLAIMER,
  COST_CHECK_SERVICES,
  DIRECT_PERMIT_COMPANY_DISCLAIMER,
  DIRECT_PERMIT_COMPANY_GUIDE,
  DIRECT_PERMIT_COMPANY_ITEMS,
  DIRECT_PERMIT_COMPANY_TOTAL,
  evaluateCostQuoteReview,
  formatCostAmount,
  getCostCheckService,
  type CostCheckServiceId,
  type CostCheckTab,
} from "@/lib/costCheck";
import { CostCheckCard } from "@/components/cost-check/CostCheckCard";
import { WpRegionalOfficialFee } from "@/components/cost-check/WpRegionalOfficialFee";

const TABS: { id: CostCheckTab; label: string; desc: string }[] = [
  { id: "lookup", label: "확인하기", desc: "정부 수수료·기준 안내" },
  { id: "review", label: "검토하기", desc: "견적 적정성 검토" },
  { id: "direct", label: "직접 허가받기", desc: "법인 직접 진행 참고" },
];

const VALID_TABS = new Set<CostCheckTab>(["lookup", "review", "direct"]);

function parseTabParam(value: string | null): CostCheckTab {
  if (value && VALID_TABS.has(value as CostCheckTab)) {
    return value as CostCheckTab;
  }
  return "lookup";
}

function inferServiceFromQuery(q: string): CostCheckServiceId | "" {
  const text = q.toLowerCase();
  if (/노동허가|work\s*permit|\bwp\b/.test(text)) return "wp";
  if (/거주증|\btrc\b/.test(text)) return "trc";
  if (/땀주|임시거주|tam\s*tru/.test(text)) return "tamtru";
  if (/법인|erc|설립|irc/.test(text)) return "company";
  if (/공증|번역|notary/.test(text)) return "notary";
  return "";
}

function extractAmountFromQuery(q: string): string {
  const match = q.replace(/,/g, "").match(/(\d[\d.]*)/);
  return match ? match[1] : "";
}

function CtaBlock() {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
      <p className="text-sm font-medium text-slate-800">다음 단계</p>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/check"
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          CHECK로 절차 확인
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          REGISTER로 등록 지원
        </Link>
      </div>
    </div>
  );
}

function CostCheckPageContent() {
  const searchParams = useSearchParams();
  const initializedRef = useRef(false);

  const [tab, setTab] = useState<CostCheckTab>("lookup");
  const [initialQuery, setInitialQuery] = useState("");

  const [lookupServiceId, setLookupServiceId] = useState<CostCheckServiceId | "">("");
  const lookupService = useMemo(
    () => (lookupServiceId ? getCostCheckService(lookupServiceId) : null),
    [lookupServiceId]
  );

  const [reviewServiceId, setReviewServiceId] = useState<CostCheckServiceId | "">("");
  const [reviewAmount, setReviewAmount] = useState("");
  const [reviewPrep, setReviewPrep] = useState<"yes" | "no" | "">("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const tabParam = parseTabParam(searchParams.get("tab"));
    const qParam = searchParams.get("q")?.trim() ?? "";

    setTab(tabParam);
    if (qParam) setInitialQuery(qParam);

    const inferredService = qParam ? inferServiceFromQuery(qParam) : "";
    if (inferredService) {
      if (tabParam === "lookup") setLookupServiceId(inferredService);
      if (tabParam === "review") setReviewServiceId(inferredService);
    }

    if (tabParam === "review" && qParam) {
      const amount = extractAmountFromQuery(qParam);
      if (amount) setReviewAmount(amount);
    }
  }, [searchParams]);

  const reviewResult = useMemo(() => {
    if (!reviewSubmitted || !reviewServiceId || !reviewPrep) return null;
    const amount = Number(reviewAmount.replace(/,/g, ""));
    if (!Number.isFinite(amount) || amount <= 0) return null;
    const service = getCostCheckService(reviewServiceId);
    return {
      service,
      quotedAmount: amount,
      ...evaluateCostQuoteReview(service, amount),
    };
  }, [reviewSubmitted, reviewServiceId, reviewAmount, reviewPrep]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <header className="mb-8 text-center">
          <p className="text-sm font-medium text-blue-600">무료 · 가입 없음</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            비용, 얼마가 적정할까?
          </h1>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            정부 수수료 확인 · 견적 검토 · 법인 직접 진행 참고를 한곳에서
          </p>
        </header>

        <div className="mb-6 flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-lg px-2 py-2.5 text-center transition sm:px-3 ${
                tab === t.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="block text-sm font-semibold">{t.label}</span>
              <span
                className={`mt-0.5 hidden text-[10px] sm:block ${
                  tab === t.id ? "text-slate-300" : "text-slate-400"
                }`}
              >
                {t.desc}
              </span>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {tab === "lookup" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">정부 수수료 · 기준 안내</h2>
                <p className="mt-1 text-sm text-slate-600">
                  서비스를 선택하면 정부 수수료와 시장 일반 대행료 기준을 확인할 수 있습니다.
                </p>
                {initialQuery && (
                  <p className="mt-2 text-xs text-slate-500">
                    질문: <span className="text-slate-700">{initialQuery}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">서비스 선택</label>
                <select
                  value={lookupServiceId}
                  onChange={(e) => setLookupServiceId(e.target.value as CostCheckServiceId)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">선택하세요</option>
                  {COST_CHECK_SERVICES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {lookupService && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
                      정부 수수료
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {lookupService.governmentFee}
                    </p>
                    <p className="mt-2 text-xs text-slate-600">
                      출처: {lookupService.source}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">시장 일반 대행료 (참고)</p>
                    <p className="mt-1 text-lg font-semibold text-slate-800">
                      {formatCostAmount(lookupService.marketUsualFeeAmount, lookupService.currency)}{" "}
                      전후
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      범위{" "}
                      {formatCostAmount(lookupService.marketMin, lookupService.currency)} ~{" "}
                      {formatCostAmount(lookupService.marketMax, lookupService.currency)}
                    </p>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-700">
                    {lookupService.lookupGuide}
                  </p>
                  <WpRegionalOfficialFee
                    sources={lookupService.officialSources}
                    question={initialQuery || undefined}
                  />
                </div>
              )}

              <CtaBlock />
            </div>
          )}

          {tab === "review" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">견적 적정성 검토</h2>
                <p className="mt-1 text-sm text-slate-600">
                  받은 견적이 정부 수수료 + 시장 일반 대행료 기준 대비 어느 정도인지 확인합니다.
                </p>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700">서비스</label>
                  <select
                    value={reviewServiceId}
                    onChange={(e) => {
                      setReviewServiceId(e.target.value as CostCheckServiceId);
                      setReviewSubmitted(false);
                    }}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">선택하세요</option>
                    {COST_CHECK_SERVICES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    받은 견적 (VAT 포함)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={
                      reviewServiceId === "notary" ? "예: 200,000" : "예: 1,500"
                    }
                    value={reviewAmount}
                    onChange={(e) => {
                      setReviewAmount(e.target.value);
                      setReviewSubmitted(false);
                    }}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  {reviewServiceId && (
                    <p className="mt-1 text-xs text-slate-500">
                      단위:{" "}
                      {getCostCheckService(reviewServiceId).currency === "USD" ? "USD" : "VND"}
                    </p>
                  )}
                </div>

                <fieldset>
                  <legend className="text-sm font-medium text-slate-700">
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
                        className={`cursor-pointer rounded-lg border px-4 py-2.5 text-sm ${
                          reviewPrep === v
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
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
                  className="w-full rounded-lg bg-slate-900 py-3 text-sm font-medium text-white hover:bg-slate-800"
                >
                  검토하기
                </button>
              </form>

              {reviewResult && (
                <div className="border-t border-slate-100 pt-6">
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
              )}
            </div>
          )}

          {tab === "direct" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  법인 직접 허가 — 참고 비용
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  법인이 대행 없이 직접 진행할 때 드는 대표 비용 항목입니다. 계산기가 아닌
                  참고용 안내입니다.
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-900">필수 안내</p>
                <p className="mt-2 text-sm leading-relaxed text-amber-900/90">
                  {DIRECT_PERMIT_COMPANY_DISCLAIMER}
                </p>
              </div>

              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {DIRECT_PERMIT_COMPANY_ITEMS.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                  >
                    <span className="text-slate-700">
                      {item.label}
                      <span className="ml-1 text-xs text-slate-400">
                        ({item.kind === "government" ? "정부고시" : "시장가 참고"})
                      </span>
                    </span>
                    <span className="shrink-0 font-medium text-slate-900">{item.amount}</span>
                  </li>
                ))}
                <li className="flex items-center justify-between bg-slate-50 px-4 py-3 text-sm font-semibold">
                  <span className="text-slate-800">참고 합계</span>
                  <span className="text-slate-900">{DIRECT_PERMIT_COMPANY_TOTAL}</span>
                </li>
              </ul>

              <p className="text-sm leading-relaxed text-slate-600">
                {DIRECT_PERMIT_COMPANY_GUIDE}
              </p>

              <CtaBlock />
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">{COST_CHECK_DISCLAIMER}</p>
      </div>
    </main>
  );
}

export default function CostCheckPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
          <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
            <p className="text-center text-sm text-slate-500">불러오는 중...</p>
          </div>
        </main>
      }
    >
      <CostCheckPageContent />
    </Suspense>
  );
}
