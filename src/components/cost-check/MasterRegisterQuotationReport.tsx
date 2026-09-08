"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  FileText,
  Lightbulb,
  UserRound,
} from "lucide-react";
import {
  evaluateCostQuoteReview,
  formatCostAmount,
  type CostCheckServiceId,
  type ReviewVerdict,
} from "@/lib/costCheck";
import {
  RESTAURANT_REGISTER_MARKET_CASES,
  getRegisterCostModel,
  getRegisterReviewService,
} from "@/lib/registerCostCheck";
import { getRegisterQuotationDetail } from "@/lib/registerQuotationDetail";
import { CheckMarketCaseRefs } from "@/components/cost-check/CheckMarketCaseRefs";
import {
  computeDisplayBubblePercent,
  computeReviewScore,
} from "@/components/cost-check/ReviewScoreGauge";
import { RegisterSummarySidebar } from "@/components/cost-check/RegisterSummarySidebar";

function excessGrade(verdict: ReviewVerdict): { label: string; filled: number; tone: string } {
  if (verdict === "fair") return { label: "낮음", filled: 1, tone: "bg-emerald-500" };
  if (verdict === "caution") return { label: "주의", filled: 3, tone: "bg-amber-500" };
  if (verdict === "very_low") return { label: "확인 필요", filled: 2, tone: "bg-slate-500" };
  return { label: "높음", filled: 4, tone: "bg-red-500" };
}

function analysisHeadline(verdict: ReviewVerdict): string {
  if (verdict === "fair") return "참고 범위와 비슷한 수준입니다.";
  if (verdict === "very_low") return "포함 항목을 확인해 보세요.";
  return "재검토를 권장합니다.";
}

function SectionTitle({
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
      className="mb-1.5 flex items-baseline gap-1.5 border-b border-[#E5E7EB] pb-1.5 text-[12.5px] font-semibold leading-snug text-[#0B2A6B] sm:mb-1 sm:pb-1 sm:text-[13.5px] sm:leading-relaxed"
    >
      <span className="tabular-nums font-medium text-[#64748B]">{number}.</span>
      <span className="min-w-0 break-keep">{title}</span>
    </h3>
  );
}

type RegisterReportMeta = {
  titleKo: string;
  titleEn: string;
  procedureLabel: string;
  officialName: string;
  officialUrl: string;
  officialDetail: string;
};

const REGISTER_REPORT_META: Record<string, RegisterReportMeta> = {
  hygiene: {
    titleKo: "위생허가 비용 확인서",
    titleEn: "HYGIENE PERMIT",
    procedureLabel: "위생허가",
    officialName: "국가공공서비스포털",
    officialUrl: "https://dichvucong.gov.vn/",
    officialDetail: "위생·식품안전 관련 안내는 국가공공서비스포털에서 확인할 수 있습니다.",
  },
  "fire-safety": {
    titleKo: "소방허가 비용 확인서",
    titleEn: "FIRE SAFETY PERMIT",
    procedureLabel: "소방허가 (PCCC)",
    officialName: "국가공공서비스포털",
    officialUrl: "https://dichvucong.gov.vn/",
    officialDetail: "소방 관련 안내는 국가공공서비스포털에서 확인할 수 있습니다.",
  },
  environment: {
    titleKo: "환경허가 비용 확인서",
    titleEn: "ENVIRONMENT PERMIT",
    procedureLabel: "환경허가",
    officialName: "국가공공서비스포털",
    officialUrl: "https://dichvucong.gov.vn/",
    officialDetail: "환경 관련 안내는 국가공공서비스포털에서 확인할 수 있습니다.",
  },
  cosmetics: {
    titleKo: "화장품허가 비용 확인서",
    titleEn: "COSMETICS PERMIT",
    procedureLabel: "화장품허가",
    officialName: "국가공공서비스포털",
    officialUrl: "https://dichvucong.gov.vn/",
    officialDetail: "화장품 관련 안내는 국가공공서비스포털에서 확인할 수 있습니다.",
  },
  "medical-device": {
    titleKo: "의료기기 허가 비용 확인서",
    titleEn: "MEDICAL DEVICE",
    procedureLabel: "의료기기 허가",
    officialName: "국가공공서비스포털",
    officialUrl: "https://dichvucong.gov.vn/",
    officialDetail: "의료기기 관련 안내는 국가공공서비스포털에서 확인할 수 있습니다.",
  },
  franchise: {
    titleKo: "프랜차이즈 등록 비용 확인서",
    titleEn: "FRANCHISE REGISTRATION",
    procedureLabel: "프랜차이즈 등록",
    officialName: "국가공공서비스포털",
    officialUrl: "https://dichvucong.gov.vn/",
    officialDetail: "프랜차이즈 관련 안내는 국가공공서비스포털에서 확인할 수 있습니다.",
  },
};

/**
 * REGISTER 6개 Master 비용견적 — Company/Restaurant와 동일 섹션·표 구조.
 * 비용 숫자는 getRegisterCostModel / getRegisterReviewService만 사용.
 */
export function MasterRegisterQuotationReport({
  serviceId,
  onContinue,
  queryEntry,
}: {
  serviceId: CostCheckServiceId;
  onContinue: () => void;
  queryEntry?: ReactNode;
}) {
  const model = getRegisterCostModel(serviceId);
  const detail = getRegisterQuotationDetail(serviceId);
  const reviewService = getRegisterReviewService(serviceId);
  const meta = REGISTER_REPORT_META[serviceId];
  const [quoteInput, setQuoteInput] = useState("");
  const [submittedAmount, setSubmittedAmount] = useState<number | null>(null);

  const canCompare = reviewService != null && reviewService.marketMin > 0;

  const review = useMemo(() => {
    if (!canCompare || !reviewService || submittedAmount == null || submittedAmount <= 0) {
      return null;
    }
    return {
      quotedAmount: submittedAmount,
      ...evaluateCostQuoteReview(reviewService, submittedAmount),
    };
  }, [submittedAmount, reviewService, canCompare]);

  if (!model || !detail || !meta) return null;

  const marketDisplay = canCompare
    ? `${formatCostAmount(reviewService!.marketMin, "VND")} ~ ${formatCostAmount(
        reviewService!.marketMax,
        "VND"
      )}`
    : model.marketSummary;

  const marketCases =
    serviceId === "hygiene" ? RESTAURANT_REGISTER_MARKET_CASES : ([] as const);

  function handleQuoteSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canCompare) return;
    const amount = Number(quoteInput.replace(/,/g, "").replace(/\$/g, "").trim());
    if (!Number.isFinite(amount) || amount <= 0) return;
    setSubmittedAmount(amount);
  }

  const hasQuote = review != null;
  const score =
    hasQuote && reviewService
      ? computeReviewScore(
          review.verdict,
          review.bubblePercent,
          review.fairReference,
          review.quotedAmount,
          reviewService.marketMin
        )
      : 0;
  const displayBubble = hasQuote
    ? computeDisplayBubblePercent(review.bubblePercent, review.fairReference, review.quotedAmount)
    : 0;
  const grade = hasQuote ? excessGrade(review.verdict) : null;
  const sourceLine = model.governmentLines[0]?.source ?? "";
  const uid = serviceId.replace(/-/g, "");
  /** 단일 금액 산출 불가 — USD 참고 컬럼을 숨기고 금액(VND)+비고만 사용 */
  const isAmountUnavailable = model.totalStatus === "unavailable";

  function AmountCell({
    value,
    emphasize,
  }: {
    value: string;
    emphasize?: "bold" | "semibold";
  }) {
    const weight =
      emphasize === "bold"
        ? "font-bold"
        : emphasize === "semibold"
          ? "font-semibold"
          : "font-semibold";
    if (!isAmountUnavailable) {
      return (
        <span className={`${weight} tabular-nums leading-snug text-[#0B2A6B]`}>
          {value}
        </span>
      );
    }
    return (
      <div className="min-w-0 max-w-[16rem] text-left sm:ml-auto sm:max-w-[15rem] sm:text-right">
        <p className="text-[12px] tabular-nums leading-none text-[#94A3B8]">—</p>
        <p
          className={`mt-1 break-keep text-[12px] ${weight} leading-[1.55] text-[#0B2A6B] sm:text-[12.5px]`}
        >
          {value}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      {queryEntry ? (
        <section
          aria-labelledby={`${uid}-query-start`}
          className="rounded-[4px] border border-[#D8DEE8] bg-white px-3.5 py-3 sm:px-4 sm:py-3.5"
        >
          <h3
            id={`${uid}-query-start`}
            className="mb-2 text-[12px] font-medium tracking-tight text-[#0B2A6B] sm:mb-1.5"
          >
            확인 시작
          </h3>
          {queryEntry}
        </section>
      ) : null}

      <div className="overflow-hidden rounded-[4px] border border-[#D8DEE8] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_270px] lg:items-start">
          <div className="flex min-w-0 flex-col border-[#E5E7EB] lg:border-r">
            <article className="flex min-h-0 flex-col">
              <header className="border-b border-[#E5E7EB] px-3.5 py-3 sm:px-4 sm:py-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium tracking-[0.1em] text-[#64748B]">
                      VFBCAI · REGISTER
                    </p>
                    <h2 className="mt-1 text-[16px] font-semibold leading-snug tracking-tight text-[#0B2A6B] sm:mt-0.5 sm:text-[17px]">
                      {meta.titleKo}
                    </h2>
                    <p className="mt-1 break-words text-[10px] font-normal leading-relaxed tracking-[0.04em] text-[#64748B] sm:mt-0.5 sm:tracking-[0.06em]">
                      QUOTATION REPORT · {meta.titleEn}
                    </p>
                  </div>
                  {sourceLine ? (
                    <div className="min-w-0 text-left sm:max-w-[14rem] sm:pt-0.5 sm:text-right">
                      <p className="break-keep text-[11px] leading-relaxed text-[#64748B]">
                        출처: {sourceLine}
                      </p>
                    </div>
                  ) : null}
                </div>
              </header>

              <div className="space-y-4 px-3.5 py-3.5 sm:px-4 sm:py-3.5">
                <section aria-labelledby={`${uid}-cost-summary`}>
                  <div className="mb-2.5 flex flex-col gap-1 border-b border-[#E5E7EB] pb-1.5 sm:mb-2 sm:flex-row sm:items-baseline sm:gap-2.5 sm:pb-1">
                    <h3
                      id={`${uid}-cost-summary`}
                      className="shrink-0 text-[12.5px] font-semibold leading-snug text-[#0B2A6B] sm:text-[13.5px] sm:leading-relaxed"
                    >
                      <span className="tabular-nums font-medium text-[#64748B]">1.</span> 예상 비용
                    </h3>
                    <p className="max-w-[40rem] break-keep text-[12.5px] leading-[1.65] text-[#475569] sm:text-[13px]">
                      관공서 공식 자료와 시장 정보를 기준으로 분석한 예상 비용입니다.
                    </p>
                  </div>

                  <ul className="space-y-2 sm:hidden">
                    <li className="rounded-[6px] border border-[#D8DEE8] bg-white px-3 py-2.5">
                      <div className="flex items-start gap-1.5">
                        <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0B2A6B]" aria-hidden />
                        <div className="min-w-0 flex-1">
                          <p className="text-[12.5px] font-medium leading-snug text-[#0B2A6B]">
                            관공서 공식비용
                          </p>
                          <p className="mt-0.5 break-keep text-[10.5px] leading-relaxed text-[#64748B]">
                            (정부기관 납부 공식 수수료)
                          </p>
                        </div>
                      </div>
                      <dl
                        className={`mt-2 grid gap-x-3 gap-y-1.5 border-t border-[#EEF2F7] pt-2 ${
                          isAmountUnavailable ? "grid-cols-1" : "grid-cols-2"
                        }`}
                      >
                        <div className={isAmountUnavailable ? "min-w-0" : "col-span-2 min-w-0"}>
                          <dt className="text-[10px] font-medium text-[#94A3B8]">금액 (VND)</dt>
                          <dd className="mt-0.5">
                            <AmountCell value={model.governmentSummary} emphasize="bold" />
                          </dd>
                        </div>
                        {!isAmountUnavailable ? (
                          <div>
                            <dt className="text-[10px] font-medium text-[#94A3B8]">금액 (USD, 참고)</dt>
                            <dd className="mt-0.5 text-[12px] tabular-nums text-[#94A3B8]">—</dd>
                          </div>
                        ) : null}
                        <div className={isAmountUnavailable ? "min-w-0" : "col-span-2"}>
                          <dt className="text-[10px] font-medium text-[#94A3B8]">비고</dt>
                          <dd
                            className={`mt-0.5 break-keep leading-[1.6] text-[#475569] ${
                              isAmountUnavailable ? "text-[11.5px]" : "text-[11px] leading-relaxed"
                            }`}
                          >
                            {model.governmentHint}
                          </dd>
                        </div>
                      </dl>
                    </li>
                    <li className="rounded-[6px] border border-[#D8DEE8] bg-white px-3 py-2.5">
                      <div className="flex items-start gap-1.5">
                        <BarChart3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0B2A6B]" aria-hidden />
                        <div className="min-w-0 flex-1">
                          <p className="text-[12.5px] font-medium leading-snug text-[#0B2A6B]">
                            시장 일반가격
                          </p>
                          <p className="mt-0.5 break-keep text-[10.5px] leading-relaxed text-[#64748B]">
                            (대행 포함)
                          </p>
                        </div>
                      </div>
                      <dl
                        className={`mt-2 grid gap-x-3 gap-y-1.5 border-t border-[#EEF2F7] pt-2 ${
                          isAmountUnavailable ? "grid-cols-1" : "grid-cols-2"
                        }`}
                      >
                        <div className={isAmountUnavailable ? "min-w-0" : "col-span-2 min-w-0"}>
                          <dt className="text-[10px] font-medium text-[#94A3B8]">금액 (VND)</dt>
                          <dd className="mt-0.5">
                            <AmountCell value={marketDisplay} emphasize="semibold" />
                          </dd>
                        </div>
                        {!isAmountUnavailable ? (
                          <div>
                            <dt className="text-[10px] font-medium text-[#94A3B8]">금액 (USD, 참고)</dt>
                            <dd className="mt-0.5 text-[12px] tabular-nums text-[#94A3B8]">—</dd>
                          </div>
                        ) : null}
                        <div className={isAmountUnavailable ? "min-w-0" : "col-span-2"}>
                          <dt className="text-[10px] font-medium text-[#94A3B8]">비고</dt>
                          <dd
                            className={`mt-0.5 break-keep leading-[1.6] text-[#475569] ${
                              isAmountUnavailable ? "text-[11.5px]" : "text-[11px] leading-relaxed"
                            }`}
                          >
                            {model.marketHint}
                          </dd>
                        </div>
                      </dl>
                    </li>
                    {hasQuote ? (
                      <li className="rounded-[6px] border border-[#D8DEE8] bg-white px-3 py-2.5">
                        <div className="flex items-start gap-1.5">
                          <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0B2A6B]" aria-hidden />
                          <div className="min-w-0 flex-1">
                            <p className="text-[12.5px] font-medium leading-snug text-[#0B2A6B]">
                              받은 견적
                            </p>
                            <p className="mt-0.5 break-keep text-[10.5px] leading-relaxed text-[#64748B]">
                              (사용자 입력)
                            </p>
                          </div>
                        </div>
                        <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-[#EEF2F7] pt-2">
                          <div>
                            <dt className="text-[10px] font-medium text-[#94A3B8]">금액 (VND)</dt>
                            <dd className="mt-0.5 text-[13px] font-semibold tabular-nums leading-snug text-[#0B2A6B]">
                              {formatCostAmount(review.quotedAmount, "VND")}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-medium text-[#94A3B8]">금액 (USD, 참고)</dt>
                            <dd className="mt-0.5 text-[12px] tabular-nums text-[#94A3B8]">—</dd>
                          </div>
                          <div className="col-span-2">
                            <dt className="text-[10px] font-medium text-[#94A3B8]">비고</dt>
                            <dd className="mt-0.5 break-keep text-[11px] leading-relaxed text-[#475569]">
                              사용자가 받은 견적 금액
                            </dd>
                          </div>
                        </dl>
                      </li>
                    ) : null}
                  </ul>

                  <div className="check-pc-only hidden sm:block">
                    <table className="w-full table-fixed border-collapse border border-[#D8DEE8] text-[12px]">
                      <colgroup>
                        {isAmountUnavailable ? (
                          <>
                            <col className="w-[24%]" />
                            <col className="w-[30%]" />
                            <col className="w-[46%]" />
                          </>
                        ) : (
                          <>
                            <col className="w-[28%]" />
                            <col className="w-[30%]" />
                            <col className="w-[20%]" />
                            <col className="w-[22%]" />
                          </>
                        )}
                      </colgroup>
                      <thead>
                        <tr className="bg-[#EEF2F7]">
                          <th className="border border-[#D8DEE8] px-1.5 py-1.5 text-center text-[10.5px] font-semibold text-[#0B2A6B] sm:px-2 sm:text-[11px]">
                            구분
                          </th>
                          <th className="border border-[#D8DEE8] px-1.5 py-1.5 text-center text-[10.5px] font-semibold text-[#0B2A6B] sm:px-2 sm:text-[11px]">
                            금액 (VND)
                          </th>
                          {!isAmountUnavailable ? (
                            <th className="border border-[#D8DEE8] px-1.5 py-1.5 text-center text-[10.5px] font-semibold text-[#0B2A6B] sm:px-2 sm:text-[11px]">
                              금액 (USD, 참고)
                            </th>
                          ) : null}
                          <th className="border border-[#D8DEE8] px-1.5 py-1.5 text-center text-[10.5px] font-semibold text-[#0B2A6B] sm:px-2 sm:text-[11px]">
                            비고
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-[#0F172A]">
                        <tr>
                          <td className="border border-[#D8DEE8] px-1.5 py-1.5 align-middle sm:px-2 sm:py-2">
                            <div className="flex items-start gap-1.5">
                              <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0B2A6B]" aria-hidden />
                              <div>
                                <p className="font-medium leading-snug text-[#0B2A6B]">관공서 공식비용</p>
                                <p className="mt-0.5 break-keep text-[10.5px] leading-relaxed text-[#64748B]">
                                  (정부기관 납부 공식 수수료)
                                </p>
                              </div>
                            </div>
                          </td>
                          <td
                            className={`border border-[#D8DEE8] px-2 py-2 align-middle sm:px-2.5 sm:py-2.5 ${
                              isAmountUnavailable ? "text-left" : "text-right font-bold leading-snug text-[#0B2A6B]"
                            }`}
                          >
                            {isAmountUnavailable ? (
                              <AmountCell value={model.governmentSummary} emphasize="bold" />
                            ) : (
                              model.governmentSummary
                            )}
                          </td>
                          {!isAmountUnavailable ? (
                            <td className="border border-[#D8DEE8] px-1.5 py-1.5 text-right align-middle tabular-nums text-[#94A3B8] sm:px-2 sm:py-2">
                              —
                            </td>
                          ) : null}
                          <td
                            className={`border border-[#D8DEE8] align-middle break-keep text-[#475569] ${
                              isAmountUnavailable
                                ? "px-2.5 py-2.5 text-[11.5px] leading-[1.6] sm:px-3 sm:py-2.5"
                                : "px-1.5 py-1.5 text-[11px] leading-relaxed sm:px-2 sm:py-2"
                            }`}
                          >
                            {model.governmentHint}
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-[#D8DEE8] px-1.5 py-1.5 align-middle sm:px-2 sm:py-2">
                            <div className="flex items-start gap-1.5">
                              <BarChart3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0B2A6B]" aria-hidden />
                              <div>
                                <p className="font-medium leading-snug text-[#0B2A6B]">시장 일반가격</p>
                                <p className="mt-0.5 break-keep text-[10.5px] leading-relaxed text-[#64748B]">
                                  (대행 포함)
                                </p>
                              </div>
                            </div>
                          </td>
                          <td
                            className={`border border-[#D8DEE8] px-2 py-2 align-middle sm:px-2.5 sm:py-2.5 ${
                              isAmountUnavailable
                                ? "text-left"
                                : "text-right font-semibold tabular-nums leading-snug text-[#0B2A6B]"
                            }`}
                          >
                            {isAmountUnavailable ? (
                              <AmountCell value={marketDisplay} emphasize="semibold" />
                            ) : (
                              marketDisplay
                            )}
                          </td>
                          {!isAmountUnavailable ? (
                            <td className="border border-[#D8DEE8] px-1.5 py-1.5 text-right align-middle tabular-nums text-[#94A3B8] sm:px-2 sm:py-2">
                              —
                            </td>
                          ) : null}
                          <td
                            className={`border border-[#D8DEE8] align-middle break-keep text-[#475569] ${
                              isAmountUnavailable
                                ? "px-2.5 py-2.5 text-[11.5px] leading-[1.6] sm:px-3 sm:py-2.5"
                                : "px-1.5 py-1.5 text-[11px] leading-relaxed sm:px-2 sm:py-2"
                            }`}
                          >
                            {model.marketHint}
                          </td>
                        </tr>
                        {hasQuote ? (
                          <tr>
                            <td className="border border-[#D8DEE8] px-1.5 py-1.5 align-middle sm:px-2 sm:py-2">
                              <div className="flex items-start gap-1.5">
                                <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0B2A6B]" aria-hidden />
                                <p className="font-medium leading-snug text-[#0B2A6B]">받은 견적</p>
                              </div>
                            </td>
                            <td className="border border-[#D8DEE8] px-1.5 py-1.5 text-right align-middle sm:px-2 sm:py-2">
                              <p className="text-[13px] font-semibold tabular-nums leading-snug text-[#0B2A6B]">
                                {formatCostAmount(review.quotedAmount, "VND")}
                              </p>
                              <p className="mt-0.5 text-[10px] font-normal text-[#64748B]">(사용자 입력)</p>
                            </td>
                            <td className="border border-[#D8DEE8] px-1.5 py-1.5 text-right align-middle tabular-nums text-[#94A3B8] sm:px-2 sm:py-2">
                              —
                            </td>
                            <td className="border border-[#D8DEE8] px-1.5 py-1.5 align-middle break-keep text-[11px] leading-relaxed text-[#475569] sm:px-2 sm:py-2">
                              사용자가 받은 견적 금액
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>

                  {canCompare && !hasQuote ? (
                    <form
                      onSubmit={handleQuoteSubmit}
                      className="mt-3 flex flex-col gap-2 border-t border-dashed border-[#E5E7EB] pt-3 sm:mt-2.5 sm:flex-row sm:items-end sm:gap-1.5 sm:pt-2.5"
                    >
                      <label className="min-w-0 flex-1">
                        <span className="block text-[12px] font-normal leading-relaxed text-[#475569] sm:text-[11.5px]">
                          받은 견적이 있다면 입력해 비교할 수 있습니다. (VND)
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={quoteInput}
                          onChange={(e) => setQuoteInput(e.target.value)}
                          placeholder="예: 12,000,000"
                          className="mt-1.5 min-h-10 w-full rounded-[6px] border border-[#CBD5E1] bg-white px-3 text-[14px] text-[#0F172A] outline-none focus:border-[#0B2A6B] focus:ring-2 focus:ring-[#0B2A6B]/12 sm:mt-1 sm:min-h-9 sm:px-2.5 sm:text-[13px]"
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={!quoteInput.trim()}
                        className="inline-flex min-h-10 w-full shrink-0 items-center justify-center rounded-[6px] bg-[#0B2A6B] px-3.5 text-[13px] font-medium text-white transition hover:bg-[#082258] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-9 sm:w-auto sm:text-[12px]"
                      >
                        견적 반영
                      </button>
                    </form>
                  ) : null}
                  {canCompare && hasQuote ? (
                    <div className="mt-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSubmittedAmount(null);
                          setQuoteInput("");
                        }}
                        className="text-[12px] font-normal text-[#64748B] underline-offset-2 hover:text-[#0B2A6B] hover:underline sm:text-[11.5px]"
                      >
                        받은 견적 다시 입력
                      </button>
                    </div>
                  ) : null}

                  {!hasQuote ? (
                    <div className="mt-3 border-t border-[#D8DEE8] pt-2.5 sm:mt-2.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="shrink-0 text-[11px] font-normal leading-relaxed text-[#64748B]">
                          시장 일반가격 범위
                        </p>
                        <p className="min-w-0 text-right text-[14px] font-semibold tabular-nums leading-none tracking-tight text-[#0B2A6B] sm:text-[15px]">
                          {marketDisplay}
                        </p>
                      </div>
                      <CheckMarketCaseRefs cases={marketCases} className="mt-1.5" />
                    </div>
                  ) : null}
                </section>

                <section aria-labelledby={`${uid}-cost-analysis`}>
                  <SectionTitle id={`${uid}-cost-analysis`} number="2" title="비용 분석 결과" />
                  <p className="mb-2 max-w-[40rem] break-keep text-[12.5px] leading-[1.65] text-[#475569] sm:mb-1.5 sm:text-[13px]">
                    {canCompare
                      ? "입력한 견적을 공식비용·시장 참고 범위와 비교한 결과입니다."
                      : "시장 비교 범위가 확정되지 않아 견적 점수 비교는 제공하지 않습니다."}
                  </p>
                  {hasQuote && grade ? (
                    <div
                      className={`rounded-[6px] border px-3.5 py-3 sm:px-3 sm:py-2.5 ${
                        review.verdict === "fair"
                          ? "border-emerald-200 bg-emerald-50/60"
                          : review.verdict === "very_low"
                            ? "border-slate-200 bg-slate-50"
                            : "border-red-200 bg-red-50/50"
                      }`}
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-2.5">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-2.5">
                            <AlertTriangle
                              className={`mt-0.5 h-4 w-4 shrink-0 ${
                                review.verdict === "fair"
                                  ? "text-emerald-600"
                                  : review.verdict === "very_low"
                                    ? "text-slate-500"
                                    : "text-red-600"
                              }`}
                              aria-hidden
                            />
                            <div className="min-w-0">
                              <p className="text-[14px] font-semibold leading-snug text-[#0B2A6B] sm:text-[14px]">
                                {analysisHeadline(review.verdict)}
                              </p>
                              <p className="mt-1 text-[12.5px] font-medium leading-snug text-[#334155] sm:mt-0.5 sm:text-[12px]">
                                {review.title}
                              </p>
                              <p className="mt-1 break-keep text-[12.5px] leading-[1.65] text-[#475569] sm:mt-0.5 sm:text-[12px] sm:leading-relaxed">
                                {review.summary}
                              </p>
                              <p className="mt-1 break-keep text-[12.5px] leading-[1.65] text-[#475569] sm:mt-0.5 sm:text-[12px] sm:leading-relaxed">
                                {review.detail}
                              </p>
                              <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#64748B] sm:mt-1">
                                참고 적정 범위:{" "}
                                {formatCostAmount(review.fairReference, "VND")}
                                {displayBubble !== 0 ? (
                                  <>
                                    {" "}
                                    · 차이{" "}
                                    <span className="font-medium tabular-nums text-[#0F172A]">
                                      {displayBubble > 0 ? "+" : ""}
                                      {displayBubble.toFixed(0)}%
                                    </span>
                                  </>
                                ) : null}
                                {" · "}
                                적정성 점수 {Math.round(score)} / 100
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 rounded-[6px] border border-white/80 bg-white/80 px-3.5 py-2.5 sm:px-3 sm:py-2 lg:min-w-[8.5rem]">
                          <p className="text-[10.5px] font-normal text-[#64748B] sm:text-[10px]">
                            과다 가능성 등급
                          </p>
                          <p className="mt-1 text-[14px] font-semibold leading-none text-[#0B2A6B] sm:mt-0.5 sm:text-[15px]">
                            {grade.label}
                          </p>
                          <div className="mt-1.5 flex gap-0.5 sm:mt-1" aria-hidden>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={`h-1.5 flex-1 rounded-sm ${
                                  i < grade.filled ? grade.tone : "bg-slate-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[6px] border border-slate-200 bg-slate-50 px-3.5 py-3 sm:px-3 sm:py-2.5">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                        <div className="min-w-0">
                          <p className="text-[14px] font-semibold leading-snug text-[#0B2A6B]">
                            {canCompare
                              ? "견적 입력 후 확인할 수 있습니다."
                              : "조건 확인 후 안내됩니다."}
                          </p>
                          <p className="mt-1 break-keep text-[12.5px] leading-[1.65] text-[#475569] sm:text-[12px]">
                            {canCompare
                              ? "시장 일반가격(VND)과 같은 통화로 입력한 견적을 비교합니다."
                              : model.marketHint}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                <section aria-labelledby={`${uid}-extra-costs`}>
                  <SectionTitle id={`${uid}-extra-costs`} number="3" title="추가 발생 가능 비용" />
                  <p className="mb-2 max-w-[40rem] break-keep text-[12.5px] leading-[1.65] text-[#475569] sm:mb-1.5 sm:text-[13px]">
                    {detail.additionalCostIntro}
                  </p>
                  <ul
                    className={
                      detail.additionalCostItems.length <= 1
                        ? "grid grid-cols-1 gap-2 sm:max-w-xl"
                        : detail.additionalCostItems.length === 2
                          ? "grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-1.5"
                          : "grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-1.5 lg:grid-cols-4"
                    }
                  >
                    {detail.additionalCostItems.map((item) => (
                      <li
                        key={item.label}
                        className="min-w-0 rounded-[6px] border border-[#E5E7EB] bg-[#F8FAFC] px-2.5 py-2.5 sm:px-2 sm:py-2"
                      >
                        <p className="break-keep text-pretty text-[12px] font-medium leading-snug text-[#0B2A6B] sm:text-[11.5px]">
                          {item.label}
                        </p>
                        <p className="mt-1 break-keep text-pretty text-[11px] leading-relaxed text-[#64748B] sm:mt-0.5 sm:text-[10.5px]">
                          {item.note}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>

                <section aria-labelledby={`${uid}-risk-compare`}>
                  <SectionTitle
                    id={`${uid}-risk-compare`}
                    number="4"
                    title="이런 경우 추가 비용과 문제가 발생할 수 있습니다"
                  />
                  <p className="mb-2 max-w-[40rem] break-keep text-[12.5px] leading-[1.65] text-[#475569] sm:mb-1.5 sm:text-[13px]">
                    {detail.riskIntro}
                  </p>
                  <div className="grid grid-cols-1 items-start gap-2.5 lg:grid-cols-2 lg:gap-2">
                    <div className="h-auto self-start rounded-[6px] border border-[#FECACA] bg-[#FEF2F2]/60 px-3.5 py-3 sm:px-3 sm:py-2.5">
                      <div className="mb-2 flex items-start gap-2 sm:mb-1.5 sm:gap-1.5">
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                          <UserRound className="h-3.5 w-3.5" aria-hidden />
                        </span>
                        <p className="min-w-0 break-keep text-pretty text-[12.5px] font-semibold leading-snug text-[#0B2A6B] sm:text-[12px]">
                          {detail.selfProceedTitle}
                        </p>
                      </div>
                      <ul className="space-y-1">
                        {detail.selfProceedRisks.map((text, index) => (
                          <li
                            key={text}
                            className="flex gap-1.5 break-keep text-pretty text-[12px] leading-[1.55] text-[#475569] sm:text-[11.5px] sm:leading-relaxed"
                          >
                            <span className="shrink-0 tabular-nums text-[#94A3B8]" aria-hidden>
                              {index === 0 ? "①" : "②"}
                            </span>
                            <span>{text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="h-auto self-start rounded-[6px] border border-[#BFDBFE] bg-[#EFF6FF]/70 px-3.5 py-3 sm:px-3 sm:py-2.5">
                      <div className="mb-2 flex items-start gap-2 sm:mb-1.5 sm:gap-1.5">
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#0B2A6B]">
                          <Building2 className="h-3.5 w-3.5" aria-hidden />
                        </span>
                        <p className="min-w-0 break-keep text-pretty text-[12.5px] font-semibold leading-snug text-[#0B2A6B] sm:text-[12px]">
                          {detail.badAgencyTitle}
                        </p>
                      </div>
                      <ul className="space-y-1">
                        {detail.badAgencyRisks.map((text, index) => (
                          <li
                            key={text}
                            className="flex gap-1.5 break-keep text-pretty text-[12px] leading-[1.55] text-[#475569] sm:text-[11.5px] sm:leading-relaxed"
                          >
                            <span className="shrink-0 tabular-nums text-[#94A3B8]" aria-hidden>
                              {index === 0 ? "①" : "②"}
                            </span>
                            <span>{text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="mt-2 break-keep text-[11px] leading-relaxed text-[#64748B] sm:mt-1.5">
                    {detail.riskFooterNote}
                  </p>
                </section>

                <section aria-labelledby={`${uid}-market-why`}>
                  <SectionTitle id={`${uid}-market-why`} number="5" title={detail.marketWhyTitle} />
                  <div className="rounded-[6px] border border-[#BBF7D0] bg-[#F0FDF4] px-3.5 py-3 sm:px-3 sm:py-2.5">
                    <div className="flex items-start gap-2.5 sm:gap-2">
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]" aria-hidden />
                      <p className="min-w-0 max-w-[40rem] break-keep text-pretty text-[12.5px] leading-[1.7] text-[#334155] sm:text-[12px] sm:leading-[1.65]">
                        {detail.marketWhyBody}
                      </p>
                    </div>
                  </div>
                </section>

                <div className="mt-3 flex flex-col gap-2 lg:hidden">
                  <button
                    type="button"
                    onClick={onContinue}
                    className="inline-flex min-h-10 w-full items-center justify-center rounded-[8px] bg-[#0B2A6B] px-4 text-[13px] font-semibold text-white transition hover:bg-[#082258]"
                  >
                    내 상황 자세히 확인하기 →
                  </button>
                  <button
                    type="button"
                    className="inline-flex min-h-9 w-full items-center justify-center rounded-[8px] border border-[#D8DEE8] bg-white px-4 text-[12.5px] font-medium text-[#0B2A6B]"
                  >
                    이 결과 공유하기
                  </button>
                </div>
              </div>

              <footer className="border-t border-[#E5E7EB] bg-[#F8FAFC] px-3.5 py-2.5 sm:px-4 sm:py-2">
                <p className="break-keep text-center text-[10px] leading-relaxed text-[#94A3B8]">
                  VFBCAI · www.vfbcai.com · Check. Verify. Register. Protect.
                </p>
                <p className="mt-1.5 break-keep text-center text-[10.5px] leading-relaxed text-[#64748B] sm:mt-1">
                  {detail.footerDisclaimer}
                </p>
              </footer>
            </article>
          </div>

          <RegisterSummarySidebar
            serviceId={serviceId}
            procedureLabel={meta.procedureLabel}
            officialName={meta.officialName}
            officialUrl={meta.officialUrl}
            officialDetail={meta.officialDetail}
            quotedAmount={hasQuote ? review.quotedAmount : null}
            quoteCurrency="VND"
            excessLabel={grade ? grade.label : null}
            onContinue={onContinue}
          />
        </div>
      </div>
    </div>
  );
}
