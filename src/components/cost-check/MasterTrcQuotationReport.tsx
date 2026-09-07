"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Building2,
  FileText,
  Lightbulb,
  Search,
  UserRound,
} from "lucide-react";
import {
  evaluateCostQuoteReview,
  formatCostAmount,
  getCostCheckService,
  type ReviewVerdict,
} from "@/lib/costCheck";
import { TRC_CHECK_MARKET_CASES } from "@/lib/contentPacks/checkMarketCases";
import { CheckMarketCaseRefs } from "@/components/cost-check/CheckMarketCaseRefs";
import {
  computeDisplayBubblePercent,
  computeReviewScore,
} from "@/components/cost-check/ReviewScoreGauge";
import { TrcSummarySidebar } from "@/components/cost-check/TrcSummarySidebar";

/** TRC 확인하기 Master UI — 견적서 문서형. 다른 서비스에서는 사용하지 않음. */
const TRC_SERVICE = getCostCheckService("trc");

/** 기존 costCheck / evaluateCostQuoteReview 문구에 등장하는 항목만 (임의 금액 없음) */
const TRC_ADDITIONAL_COST_ITEMS = [
  { label: "서류 번역", note: "견적 포함 여부 확인" },
  { label: "공증", note: "견적 포함 여부 확인" },
  { label: "급행·긴급 처리", note: "부가 시 별도 가능" },
  { label: "서류 보완·재제출", note: "누락·반려 시 발생 가능" },
  { label: "방문 동행·기타 대행", note: "범위에 따라 상이" },
] as const;

/** TRC 페이지·비용 안내에서 쓰는 현실적 위험 표현 (확정 벌금/법률 판단 아님) */
const TRC_SELF_PROCEED_RISKS = [
  "체류·비자 조건이나 주소·서류 오류로 신청이 반려되거나 재등록·재제출이 필요할 수 있습니다.",
  "신청 지연이나 서류 누락으로 일정이 늦어지고 추가 준비 비용이 발생할 수 있습니다.",
] as const;

const TRC_BAD_AGENCY_RISKS = [
  "불필요한 항목이나 부실한 대행으로 예상보다 높은 대행비와 재신청 비용이 발생할 수 있습니다.",
  "진행 지연이나 업체 변경으로 체류 일정에 차질이 생기고 비용이 중복될 수 있습니다.",
] as const;

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

export function MasterTrcQuotationReport({
  onContinue,
  queryEntry,
}: {
  onContinue: () => void;
  /** 확인 시작용 질문 입력 — TRC Master UI에서만 전달 */
  queryEntry?: ReactNode;
}) {
  const service = TRC_SERVICE;
  const [quoteInput, setQuoteInput] = useState("");
  const [submittedAmount, setSubmittedAmount] = useState<number | null>(null);

  const review = useMemo(() => {
    if (submittedAmount == null || submittedAmount <= 0) return null;
    return {
      quotedAmount: submittedAmount,
      ...evaluateCostQuoteReview(service, submittedAmount),
    };
  }, [submittedAmount, service]);

  /** TRC 데이터는 USD 기준 — VND 환산·신규 금액 생성 없음 */
  const marketUsdRange = `${formatCostAmount(service.marketMin, service.currency)} ~ ${formatCostAmount(
    service.marketMax,
    service.currency
  )}`;

  function handleQuoteSubmit(e: FormEvent) {
    e.preventDefault();
    const amount = Number(quoteInput.replace(/,/g, "").replace(/\$/g, "").trim());
    if (!Number.isFinite(amount) || amount <= 0) return;
    setSubmittedAmount(amount);
  }

  const hasQuote = review != null;
  const score = hasQuote
    ? computeReviewScore(
        review.verdict,
        review.bubblePercent,
        review.fairReference,
        review.quotedAmount,
        service.marketMin
      )
    : 0;
  const displayBubble = hasQuote
    ? computeDisplayBubblePercent(review.bubblePercent, review.fairReference, review.quotedAmount)
    : 0;
  const grade = hasQuote ? excessGrade(review.verdict) : null;

  return (
    <div className="mt-3 space-y-3">
      {queryEntry ? (
        <section
          aria-labelledby="trc-query-start"
          className="rounded-[4px] border border-[#D8DEE8] bg-white px-3.5 py-3 sm:px-4 sm:py-3.5"
        >
          <h3
            id="trc-query-start"
            className="mb-2 text-[12px] font-medium tracking-tight text-[#0B2A6B] sm:mb-1.5"
          >
            확인 시작
          </h3>
          {queryEntry}
        </section>
      ) : null}

      <div className="overflow-hidden rounded-[4px] border border-[#D8DEE8] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_270px] lg:items-stretch">
          <div className="flex min-w-0 flex-col border-[#E5E7EB] lg:border-r">
            <article className="flex h-full min-h-0 flex-col">
            <header className="border-b border-[#E5E7EB] px-3.5 py-3 sm:px-4 sm:py-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium tracking-[0.1em] text-[#64748B]">
                    VFBCAI · CHECK
                  </p>
                  <h2 className="mt-1 text-[16px] font-semibold leading-snug tracking-tight text-[#0B2A6B] sm:mt-0.5 sm:text-[17px]">
                    거주증 비용 확인서
                  </h2>
                  <p className="mt-1 break-words text-[10px] font-normal leading-relaxed tracking-[0.04em] text-[#64748B] sm:mt-0.5 sm:tracking-[0.06em]">
                    QUOTATION REPORT · TEMPORARY RESIDENCE CARD
                  </p>
                </div>
                <div className="min-w-0 text-left sm:max-w-[14rem] sm:pt-0.5 sm:text-right">
                  <p className="break-keep text-[11px] leading-relaxed text-[#64748B]">
                    출처: {service.source}
                  </p>
                </div>
              </div>
            </header>

            <div className="flex-1 space-y-4 px-3.5 py-3.5 sm:space-y-4 sm:px-4 sm:py-3.5">
              <section aria-labelledby="trc-cost-summary">
                <div className="mb-2.5 flex flex-col gap-1 border-b border-[#E5E7EB] pb-1.5 sm:mb-2 sm:flex-row sm:items-baseline sm:gap-2.5 sm:pb-1">
                  <h3
                    id="trc-cost-summary"
                    className="shrink-0 text-[12.5px] font-semibold leading-snug text-[#0B2A6B] sm:text-[13.5px] sm:leading-relaxed"
                  >
                    <span className="tabular-nums font-medium text-[#64748B]">1.</span> 예상 비용
                  </h3>
                  <p className="max-w-[40rem] break-keep text-[12.5px] leading-[1.65] text-[#475569] sm:text-[13px]">
                    관공서 공식 자료와 시장 정보를 기준으로 분석한 예상 비용입니다.
                  </p>
                </div>

                {/* Mobile: 카드형 — 가로 스크롤 없이 전체 정보 표시 */}
                <ul className="space-y-2 sm:hidden">
                  <li className="rounded-[6px] border border-[#D8DEE8] bg-white px-3 py-2.5">
                    <div className="flex items-start gap-1.5">
                      <Building2
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0B2A6B]"
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] font-medium leading-snug text-[#0B2A6B]">
                          관공서 공식비용
                        </p>
                        <p className="mt-0.5 break-keep text-[10.5px] leading-relaxed text-[#64748B]">
                          (정부기관 납부 공식 수수료)
                        </p>
                      </div>
                    </div>
                    <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-[#EEF2F7] pt-2">
                      <div>
                        <dt className="text-[10px] font-medium text-[#94A3B8]">금액 (VND)</dt>
                        <dd className="mt-0.5 text-[12px] tabular-nums text-[#94A3B8]">—</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] font-medium text-[#94A3B8]">금액 (USD, 참고)</dt>
                        <dd className="mt-0.5 break-keep text-[12.5px] font-semibold tabular-nums leading-snug text-[#0B2A6B]">
                          {service.governmentFee}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-[10px] font-medium text-[#94A3B8]">비고</dt>
                        <dd className="mt-0.5 break-keep text-[11px] leading-relaxed text-[#475569]">
                          정부기관 납부 수수료
                        </dd>
                      </div>
                    </dl>
                  </li>
                  <li className="rounded-[6px] border border-[#D8DEE8] bg-white px-3 py-2.5">
                    <div className="flex items-start gap-1.5">
                      <BarChart3
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0B2A6B]"
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] font-medium leading-snug text-[#0B2A6B]">
                          시장 일반가격
                        </p>
                        <p className="mt-0.5 break-keep text-[10.5px] leading-relaxed text-[#64748B]">
                          (대행 포함)
                        </p>
                      </div>
                    </div>
                    <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-[#EEF2F7] pt-2">
                      <div>
                        <dt className="text-[10px] font-medium text-[#94A3B8]">금액 (VND)</dt>
                        <dd className="mt-0.5 text-[12px] tabular-nums text-[#94A3B8]">—</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] font-medium text-[#94A3B8]">금액 (USD, 참고)</dt>
                        <dd className="mt-0.5 break-keep text-[12.5px] font-semibold tabular-nums leading-snug text-[#0B2A6B]">
                          {marketUsdRange}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-[10px] font-medium text-[#94A3B8]">비고</dt>
                        <dd className="mt-0.5 break-keep text-[11px] leading-relaxed text-[#475569]">
                          일반적인 대행 업체의 평균 범위 (지역·업체별 차이 있음)
                        </dd>
                      </div>
                    </dl>
                  </li>
                  {hasQuote ? (
                    <li className="rounded-[6px] border border-[#D8DEE8] bg-white px-3 py-2.5">
                      <div className="flex items-start gap-1.5">
                        <FileText
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0B2A6B]"
                          aria-hidden
                        />
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
                          <dd className="mt-0.5 text-[12px] tabular-nums text-[#94A3B8]">—</dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-medium text-[#94A3B8]">금액 (USD, 참고)</dt>
                          <dd className="mt-0.5 text-[13px] font-semibold tabular-nums leading-snug text-[#0B2A6B]">
                            {formatCostAmount(review.quotedAmount, service.currency)}
                          </dd>
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

                {/* PC: 기존 견적표 */}
                <div className="check-pc-only hidden overflow-x-auto sm:block">
                  <table className="w-full table-fixed border-collapse border border-[#D8DEE8] text-[12px]">
                    <colgroup>
                      <col className="w-[26%]" />
                      <col className="w-[18%]" />
                      <col className="w-[28%]" />
                      <col className="w-[28%]" />
                    </colgroup>
                    <thead>
                      <tr className="bg-[#EEF2F7]">
                        <th className="border border-[#D8DEE8] px-1.5 py-1.5 text-center text-[10.5px] font-semibold text-[#0B2A6B] sm:px-2 sm:text-[11px]">
                          구분
                        </th>
                        <th className="border border-[#D8DEE8] px-1.5 py-1.5 text-center text-[10.5px] font-semibold text-[#0B2A6B] sm:px-2 sm:text-[11px]">
                          금액 (VND)
                        </th>
                        <th className="border border-[#D8DEE8] px-1.5 py-1.5 text-center text-[10.5px] font-semibold text-[#0B2A6B] sm:px-2 sm:text-[11px]">
                          금액 (USD, 참고)
                        </th>
                        <th className="border border-[#D8DEE8] px-1.5 py-1.5 text-center text-[10.5px] font-semibold text-[#0B2A6B] sm:px-2 sm:text-[11px]">
                          비고
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-[#0F172A]">
                      <tr>
                        <td className="border border-[#D8DEE8] px-1.5 py-1.5 align-middle sm:px-2 sm:py-2">
                          <div className="flex items-start gap-1.5">
                            <Building2
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0B2A6B]"
                              aria-hidden
                            />
                            <div>
                              <p className="font-medium leading-snug text-[#0B2A6B]">
                                관공서 공식비용
                              </p>
                              <p className="mt-0.5 break-keep text-[10.5px] leading-relaxed text-[#64748B]">
                                (정부기관 납부 공식 수수료)
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="border border-[#D8DEE8] px-1.5 py-1.5 text-right align-middle tabular-nums text-[#94A3B8] sm:px-2 sm:py-2">
                          —
                        </td>
                        <td className="border border-[#D8DEE8] px-1.5 py-1.5 text-right align-middle font-semibold tabular-nums leading-snug text-[#0B2A6B] sm:px-2 sm:py-2">
                          {service.governmentFee}
                        </td>
                        <td className="border border-[#D8DEE8] px-1.5 py-1.5 align-middle break-keep text-[11px] leading-relaxed text-[#475569] sm:px-2 sm:py-2">
                          정부기관 납부 수수료
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-[#D8DEE8] px-1.5 py-1.5 align-middle sm:px-2 sm:py-2">
                          <div className="flex items-start gap-1.5">
                            <BarChart3
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0B2A6B]"
                              aria-hidden
                            />
                            <div>
                              <p className="font-medium leading-snug text-[#0B2A6B]">
                                시장 일반가격
                              </p>
                              <p className="mt-0.5 break-keep text-[10.5px] leading-relaxed text-[#64748B]">
                                (대행 포함)
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="border border-[#D8DEE8] px-1.5 py-1.5 text-right align-middle tabular-nums text-[#94A3B8] sm:px-2 sm:py-2">
                          —
                        </td>
                        <td className="border border-[#D8DEE8] px-1.5 py-1.5 text-right align-middle font-semibold tabular-nums leading-snug text-[#0B2A6B] sm:px-2 sm:py-2">
                          {marketUsdRange}
                        </td>
                        <td className="border border-[#D8DEE8] px-1.5 py-1.5 align-middle break-keep text-[11px] leading-relaxed text-[#475569] sm:px-2 sm:py-2">
                          일반적인 대행 업체의 평균 범위
                          <br />
                          (지역·업체별 차이 있음)
                        </td>
                      </tr>
                      {hasQuote ? (
                        <tr>
                          <td className="border border-[#D8DEE8] px-1.5 py-1.5 align-middle sm:px-2 sm:py-2">
                            <div className="flex items-start gap-1.5">
                              <FileText
                                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0B2A6B]"
                                aria-hidden
                              />
                              <p className="font-medium leading-snug text-[#0B2A6B]">받은 견적</p>
                            </div>
                          </td>
                          <td className="border border-[#D8DEE8] px-1.5 py-1.5 text-right align-middle tabular-nums text-[#94A3B8] sm:px-2 sm:py-2">
                            —
                          </td>
                          <td className="border border-[#D8DEE8] px-1.5 py-1.5 text-right align-middle sm:px-2 sm:py-2">
                            <p className="text-[13px] font-semibold tabular-nums leading-snug text-[#0B2A6B]">
                              {formatCostAmount(review.quotedAmount, service.currency)}
                            </p>
                            <p className="mt-0.5 text-[10px] font-normal text-[#64748B]">
                              (사용자 입력)
                            </p>
                          </td>
                          <td className="border border-[#D8DEE8] px-1.5 py-1.5 align-middle break-keep text-[11px] leading-relaxed text-[#475569] sm:px-2 sm:py-2">
                            사용자가 받은 견적 금액
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>

                {!hasQuote ? (
                  <form
                    onSubmit={handleQuoteSubmit}
                    className="mt-3 flex flex-col gap-2 border-t border-dashed border-[#E5E7EB] pt-3 sm:mt-2.5 sm:flex-row sm:items-end sm:gap-1.5 sm:pt-2.5"
                  >
                    <label className="min-w-0 flex-1">
                      <span className="block text-[12px] font-normal leading-relaxed text-[#475569] sm:text-[11.5px]">
                        받은 견적이 있다면 입력해 비교할 수 있습니다.
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={quoteInput}
                        onChange={(e) => setQuoteInput(e.target.value)}
                        placeholder={`예: ${service.marketUsualFeeAmount}`}
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
                ) : (
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
                )}

                {!hasQuote ? (
                  <div className="mt-3 border-t border-[#D8DEE8] pt-2.5 sm:mt-2.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="shrink-0 text-[11px] font-normal leading-relaxed text-[#64748B] sm:text-[11px]">
                        시장 일반가격 범위
                      </p>
                      <p className="min-w-0 text-right text-[14px] font-semibold tabular-nums leading-none tracking-tight text-[#0B2A6B] sm:text-[15px]">
                        {marketUsdRange}
                      </p>
                    </div>
                    <CheckMarketCaseRefs cases={TRC_CHECK_MARKET_CASES} className="mt-1.5" />
                  </div>
                ) : null}
              </section>

              {hasQuote && grade ? (
                <section aria-labelledby="trc-cost-analysis">
                  <SectionTitle id="trc-cost-analysis" number="2" title="비용 분석 결과" />
                  <p className="mb-2 max-w-[40rem] break-keep text-[12.5px] leading-[1.65] text-[#475569] sm:mb-1.5 sm:text-[13px]">
                    입력한 견적을 공식비용·시장 참고 범위와 비교한 결과입니다.
                  </p>
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
                              {formatCostAmount(review.fairReference, service.currency)}
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
                        <p className="text-[10.5px] font-normal text-[#64748B] sm:text-[10px]">과다 가능성 등급</p>
                        <p className="mt-1 text-[14px] font-semibold leading-none text-[#0B2A6B] sm:mt-0.5 sm:text-[15px]">{grade.label}</p>
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
                </section>
              ) : null}

              <section aria-labelledby="trc-extra-costs">
                <SectionTitle id="trc-extra-costs" number="3" title="추가 발생 가능 비용" />
                <p className="mb-2 max-w-[40rem] break-keep text-[12.5px] leading-[1.65] text-[#475569] sm:mb-1.5 sm:text-[13px]">
                  대행 과정에서는 공식 수수료 외에 아래와 같은 비용이 추가로 발생할 수 있습니다.
                  받은 견적에 포함되어 있는지 확인해 보세요.
                </p>
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-1.5 lg:grid-cols-5">
                  {TRC_ADDITIONAL_COST_ITEMS.map((item) => (
                    <li
                      key={item.label}
                      className="rounded-[6px] border border-[#E5E7EB] bg-[#F8FAFC] px-2.5 py-2.5 sm:px-2 sm:py-2"
                    >
                      <p className="break-keep text-[12px] font-medium leading-snug text-[#0B2A6B] sm:text-[11.5px]">
                        {item.label}
                      </p>
                      <p className="mt-1 break-keep text-[11px] leading-relaxed text-[#64748B] sm:mt-0.5 sm:text-[10.5px]">
                        {item.note}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="trc-risk-compare">
                <SectionTitle
                  id="trc-risk-compare"
                  number="4"
                  title="이런 경우 추가 비용과 문제가 발생할 수 있습니다"
                />
                <p className="mb-2 max-w-[40rem] break-keep text-[12.5px] leading-[1.65] text-[#475569] sm:mb-1.5 sm:text-[13px]">
                  직접 진행과 대행 선택 모두에서 흔히 확인하는 참고 안내입니다.
                </p>
                <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2 lg:gap-2">
                  <div className="rounded-[6px] border border-[#FECACA] bg-[#FEF2F2]/60 px-3.5 py-3 sm:px-3 sm:py-2.5">
                    <div className="mb-2 flex items-start gap-2 sm:mb-1.5 sm:items-center sm:gap-1.5">
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                        <UserRound className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      <p className="min-w-0 break-keep text-[12.5px] font-semibold leading-snug text-[#0B2A6B] sm:text-[12px]">
                        직접 진행하다 문제가 생기는 경우
                      </p>
                    </div>
                    <ul className="space-y-1">
                      {TRC_SELF_PROCEED_RISKS.map((text, index) => (
                        <li
                          key={text}
                          className="flex gap-1.5 break-keep text-[12px] leading-[1.55] text-[#475569] sm:text-[11.5px] sm:leading-relaxed"
                        >
                          <span className="shrink-0 tabular-nums text-[#94A3B8]" aria-hidden>
                            {index === 0 ? "①" : "②"}
                          </span>
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-[6px] border border-[#BFDBFE] bg-[#EFF6FF]/70 px-3.5 py-3 sm:px-3 sm:py-2.5">
                    <div className="mb-2 flex items-start gap-2 sm:mb-1.5 sm:items-center sm:gap-1.5">
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#0B2A6B]">
                        <Building2 className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      <p className="min-w-0 break-keep text-[12.5px] font-semibold leading-snug text-[#0B2A6B] sm:text-[12px]">
                        잘못된 컨설팅·대행 업체를 선택한 경우
                      </p>
                    </div>
                    <ul className="space-y-1">
                      {TRC_BAD_AGENCY_RISKS.map((text, index) => (
                        <li
                          key={text}
                          className="flex gap-1.5 break-keep text-[12px] leading-[1.55] text-[#475569] sm:text-[11.5px] sm:leading-relaxed"
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
                  확정된 법률·벌금 금액이 아니라, 거주증 진행에서 확인하는 참고 안내입니다.
                </p>
              </section>

              <section aria-labelledby="trc-market-why">
                <SectionTitle
                  id="trc-market-why"
                  number="5"
                  title="시장가격이 관공서 공식비용보다 높은 이유"
                />
                <div className="rounded-[6px] border border-[#BBF7D0] bg-[#F0FDF4] px-3.5 py-3 sm:px-3 sm:py-2.5">
                  <div className="flex items-start gap-2.5 sm:gap-2">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]" aria-hidden />
                    <p className="min-w-0 max-w-[40rem] break-keep text-[12.5px] leading-[1.7] text-[#334155] sm:text-[12px] sm:leading-[1.65]">
                      관공서 공식비용은 정부기관에 납부하는 수수료입니다. 시장가격에는 공식 수수료
                      외에도 서류 준비, 번역·공증, 행정기관 대응 등 대행 업무 비용이 포함될 수
                      있습니다. 따라서 가격 차이만으로 비싸다고 판단하기보다, 견적에 어떤 업무와
                      비용이 포함되어 있는지 확인하는 것이 중요합니다.
                    </p>
                  </div>
                </div>
              </section>

              {/* Mobile(<lg): 녹색 설명 카드 바로 아래 · 하단 면책보다 위 */}
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

            <footer className="mt-auto border-t border-[#E5E7EB] bg-[#F8FAFC] px-3.5 py-2.5 sm:px-4 sm:py-2">
              <p className="break-keep text-center text-[10px] leading-relaxed text-[#94A3B8]">
                VFBCAI · www.vfbcai.com · Check. Verify. Register. Protect.
              </p>
              <p className="mt-1.5 break-keep text-center text-[10.5px] leading-relaxed text-[#64748B] sm:mt-1">
                거주증 정부 수수료는 체류 기간과 관할기관에 따라 달라질 수 있습니다. 본 정보는
                조사 시점 기준이며, 실제 비용은 진행 시점에 반드시 재확인하시기 바랍니다.
              </p>
            </footer>
          </article>
        </div>

        <TrcSummarySidebar
          quotedAmount={hasQuote ? review.quotedAmount : null}
          currency={service.currency}
          excessLabel={grade ? grade.label : null}
          onContinue={onContinue}
        />
        </div>
      </div>
    </div>
  );
}

/** TRC Master UI 전용 상단 탭 — 확인하기 / 자세히 보기만 */
export function MasterTrcContextTabs({
  active,
  onChange,
}: {
  active: "lookup" | "direct";
  onChange: (tab: "lookup" | "direct") => void;
}) {
  const tabs = [
    {
      id: "lookup" as const,
      label: "확인하기",
      desc: "비용,견적,위험 확인",
      icon: Search,
    },
    {
      id: "direct" as const,
      label: "자세히 보기",
      desc: "절차 · 서류 · 안내",
      icon: BookOpen,
    },
  ];

  return (
    <div className="mb-2 grid grid-cols-2 overflow-hidden rounded-[8px] border border-[#D8DEE8] sm:mb-3">
      {tabs.map((t, index) => {
        const TabIcon = t.icon;
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`flex min-h-[46px] min-w-0 items-center justify-center gap-2 py-1.5 px-2 text-center transition sm:min-h-[50px] sm:gap-2.5 sm:py-2 sm:px-4 ${
              index === 0 ? "border-r border-[#D8DEE8]" : ""
            } ${
              isActive
                ? "bg-[#EEF2F7] text-[#0B2A6B] shadow-[inset_0_-2px_0_0_#0B2A6B]"
                : "bg-white text-[#0B2A6B] hover:bg-[#F8FAFC]"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <TabIcon
              className={`h-3.5 w-3.5 shrink-0 sm:h-[15px] sm:w-[15px] ${
                isActive ? "text-[#0B2A6B]" : "text-[#94A3B8]"
              }`}
              aria-hidden
            />
            <span className="min-w-0">
              <span
                className={`block whitespace-nowrap text-[12.5px] leading-none sm:text-[13.5px] sm:leading-snug ${
                  isActive ? "font-semibold" : "font-medium"
                }`}
              >
                {t.label}
              </span>
              <span
                className={`mt-0.5 block break-keep text-center font-normal tracking-tight text-[9px] leading-[1.25] sm:tracking-normal sm:text-[10.5px] sm:leading-snug ${
                  isActive ? "text-[#64748B]" : "text-[#94A3B8]"
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
