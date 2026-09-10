"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Building2,
  Check,
  ChevronDown,
  ClipboardCheck,
  FileText,
  Lightbulb,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { QuestionSection, SelectionCard, VerifyAnswerGrid } from "@/components/ui";
import OfficialTrustZone from "@/components/ui/OfficialTrustZone";
import type { SelectionCardTone } from "@/components/ui/SelectionCard";
import type { MasterLandingConfig } from "@/components/cost-check/MasterFunnelLanding";
import { CompanySummarySidebar } from "@/components/cost-check/CompanySummarySidebar";
import { DrivingSummarySidebar } from "@/components/cost-check/DrivingSummarySidebar";
import { RegisterSummarySidebar } from "@/components/cost-check/RegisterSummarySidebar";
import { RestaurantSummarySidebar } from "@/components/cost-check/RestaurantSummarySidebar";
import { TamtruSummarySidebar } from "@/components/cost-check/TamtruSummarySidebar";
import { TrcSummarySidebar } from "@/components/cost-check/TrcSummarySidebar";
import { AdminSummarySidebar } from "@/components/cost-check/AdminSummarySidebar";
import { WpSummarySidebar } from "@/components/cost-check/WpSummarySidebar";
import {
  computeDisplayBubblePercent,
  computeReviewScore,
} from "@/components/cost-check/ReviewScoreGauge";
import { hasMarketPriceData } from "@/components/cost-check/MasterCostFunnel";
import {
  COST_CHECK_DISCLAIMER,
  evaluateCostQuoteReview,
  formatCostAmount,
  type CostCheckService,
  type CostCheckServiceId,
  type ReviewVerdict,
} from "@/lib/costCheck";
import { getPublishedArticleBySlug } from "@/lib/contentPacks/registry";
import type { FunnelEngine } from "@/components/engine/funnelTokens";

/** OfficialTrustZone과 동일 출처 — 검토 엔진별 관련 공식 기관만 */
const REVIEW_OFFICIAL_AGENCIES: Record<FunnelEngine, string[]> = {
  verify: ["법무부", "국회", "최고인민법원"],
  check: ["공안부(출입국)", "노동보훈사회부", "전자정부 포털"],
  register: ["기획투자부", "보건부", "전자정부 포털"],
};

function ReviewOfficialTrustStrip({ engine }: { engine: FunnelEngine }) {
  const agencies = REVIEW_OFFICIAL_AGENCIES[engine];

  return (
    <div
      className="mt-2 border-t border-[#EEF2F6] pt-2"
      aria-label="공식 기준 안내"
    >
      <p className="break-keep text-[10.5px] font-normal leading-snug text-[#64748B] sm:text-[10px]">
        공식 법령·행정자료 기준 확인
      </p>
      <p className="mt-0.5 break-keep text-[10px] font-normal leading-snug text-[#94A3B8] sm:text-[10px]">
        관련 공식 기관:{" "}
        <span className="text-[#64748B]">{agencies.join(" · ")}</span>
      </p>
    </div>
  );
}

const MOBILE_SECTION_INTRO =
  "mb-2 max-w-[40rem] max-sm:text-[11px] max-[389px]:text-[10.5px] max-sm:font-normal max-sm:leading-none max-sm:tracking-tight max-sm:whitespace-nowrap break-keep text-[13px] font-normal leading-[1.55] text-[#64748B] sm:mb-1.5 sm:text-[13px] sm:leading-[1.65] sm:text-[#475569] sm:whitespace-normal";
const MOBILE_SUBHEAD =
  "text-[13px] font-medium leading-snug text-[#334155] sm:text-[14px] sm:font-semibold sm:text-[#0B2A6B]";
const MOBILE_BODY =
  "break-keep text-[13px] font-normal leading-[1.55] text-[#64748B] sm:text-[12px] sm:leading-relaxed sm:text-[#475569]";
const MOBILE_BODY_TIGHT =
  "text-[13px] font-normal leading-snug text-[#64748B] sm:mt-0.5 sm:text-[12px] sm:font-medium sm:text-[#334155]";
const MOBILE_META =
  "mt-1.5 text-[12px] font-normal leading-[1.5] text-[#94A3B8] sm:mt-1 sm:text-[11.5px] sm:leading-relaxed sm:text-[#64748B]";
const MOBILE_CARD_LABEL =
  "break-keep text-pretty text-[13px] font-medium leading-snug text-[#475569] sm:text-[11.5px] sm:font-medium sm:text-[#0B2A6B]";
const MOBILE_CARD_NOTE =
  "mt-0.5 break-keep text-pretty text-[12px] font-normal leading-[1.5] text-[#94A3B8] sm:mt-0.5 sm:text-[10.5px] sm:leading-relaxed sm:text-[#64748B]";
const MOBILE_CALLOUT =
  "min-w-0 max-w-[40rem] break-keep text-pretty text-[13px] font-normal leading-[1.55] text-[#64748B] sm:text-[12px] sm:leading-[1.65] sm:text-[#334155]";
const MOBILE_GRADE_LABEL =
  "mt-1 text-[13px] font-medium leading-snug text-[#475569] sm:mt-0.5 sm:text-[15px] sm:font-semibold sm:leading-none sm:text-[#0B2A6B]";
const MOBILE_COST_SUMMARY_INTRO =
  "max-w-[40rem] max-sm:text-[11px] max-[389px]:text-[10.5px] max-sm:font-normal max-sm:leading-none max-sm:tracking-tight max-sm:whitespace-nowrap break-keep text-[13px] font-normal leading-[1.55] text-[#64748B] sm:text-[13px] sm:leading-[1.65] sm:text-[#475569] sm:whitespace-normal";
const MOBILE_REPORT_SOURCE =
  "break-keep max-sm:text-[9px] max-[389px]:text-[8.5px] max-sm:font-normal max-sm:leading-none max-sm:tracking-tight max-sm:whitespace-nowrap text-[12.5px] leading-[1.45] text-[#64748B] sm:text-[11px] sm:leading-relaxed sm:whitespace-normal";
type YesNo = "yes" | "no";
type ReviewStage = "prevent" | "case";

const REVIEW_STAGE_CARD_OPTIONS: {
  value: ReviewStage;
  title: string;
  desc: string;
  icon: typeof ShieldCheck;
  tone: SelectionCardTone;
}[] = [
  {
    value: "prevent",
    title: "제출·계약 전 서류 검토",
    desc: "제출·계약·신청 전 서류와 위험 요인을 확인합니다.",
    icon: ShieldCheck,
    tone: "blue",
  },
  {
    value: "case",
    title: "문제 발생 후 대응 검토",
    desc: "반려·통지·분쟁·손해 발생 후 대응 방향을 확인합니다.",
    icon: AlertTriangle,
    tone: "amber",
  },
];

type ReviewQuestion =
  | {
      id: string;
      kind: "amount";
      label: string;
      placeholder: string;
    }
  | {
      id: string;
      kind: "yesno";
      label: string;
    }
  | {
      id: string;
      kind: "choice";
      label: string;
      options: { value: string; label: string }[];
    };

export type ReviewAnswers = Record<string, string>;

export type ReviewPage1Answers = {
  stage?: string;
  docs?: string;
  translation?: string;
  deadline?: string;
};

/** Page 1(직접 검토하기) stage → Page 2(내 상황 확인하기) review_stage */
export function mapReviewPage1StageToVerifyStage(
  stage: string
): "pre" | "post" | null {
  if (stage === "prevent") return "pre";
  if (stage === "case") return "post";
  return null;
}

export function buildReviewPage1Meta(
  page1: ReviewPage1Answers | null
): Record<string, string> {
  if (!page1) return {};
  const meta: Record<string, string> = {};
  if (page1.stage) meta.review_check_stage = page1.stage;
  if (page1.docs) meta.review_check_docs = page1.docs;
  if (page1.translation) meta.review_check_translation = page1.translation;
  if (page1.deadline) meta.review_check_deadline = page1.deadline;
  return meta;
}

export function restoreReviewPage1Answers(
  meta: Record<string, unknown>
): ReviewPage1Answers | null {
  const stage =
    typeof meta.review_check_stage === "string" ? meta.review_check_stage : undefined;
  const docs = typeof meta.review_check_docs === "string" ? meta.review_check_docs : undefined;
  const translation =
    typeof meta.review_check_translation === "string" ? meta.review_check_translation : undefined;
  const deadline =
    typeof meta.review_check_deadline === "string" ? meta.review_check_deadline : undefined;
  if (!stage && !docs && !translation && !deadline) return null;
  return { stage, docs, translation, deadline };
}

type ReviewResult = {
  quotedAmount: number | null;
  verdict: ReviewVerdict;
  title: string;
  summary: string;
  detail: string;
  fairReference: number;
  bubblePercent: number | null;
};

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
  emphasized = false,
}: {
  id: string;
  number: string;
  title: string;
  emphasized?: boolean;
}) {
  return (
    <h3
      id={id}
      className={`mb-2 flex items-baseline gap-1 border-b border-[#E5E7EB] pb-1.5 text-[14px] sm:mb-1 sm:gap-1.5 sm:pb-1 sm:text-[13.5px] sm:font-semibold sm:leading-relaxed sm:tracking-normal sm:text-[#0B2A6B] ${
        emphasized
          ? "font-medium leading-snug tracking-tight text-[#334155]"
          : "font-medium leading-[1.45] text-[#64748B]"
      }`}
    >
      <span
        className={`tabular-nums sm:font-medium sm:text-[#64748B] ${
          emphasized ? "font-medium text-[#64748B]" : "font-normal text-[#94A3B8]"
        }`}
      >
        {number}.
      </span>
      <span className="min-w-0 break-keep">{title}</span>
    </h3>
  );
}

function shortenNote(text: string, max = 42): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function buildReviewQuestions(service: CostCheckService, hasMarket: boolean): ReviewQuestion[] {
  if (hasMarket) {
    return [
      {
        id: "amount",
        kind: "amount",
        label: `받은 견적 금액 (${service.currency})`,
        placeholder:
          service.currency === "VND"
            ? "예: 8,000,000"
            : `예: ${service.marketUsualFeeAmount || "3,500"}`,
      },
      { id: "prep", kind: "yesno", label: "서류·번역 포함 여부" },
      { id: "officialSplit", kind: "yesno", label: "공식 수수료 구분 여부" },
      { id: "scope", kind: "yesno", label: "대행 범위 명시 여부" },
    ];
  }

  return [
    {
      id: "stage",
      kind: "choice",
      label: "검토 유형",
      options: [
        { value: "prevent", label: "사전 검토" },
        { value: "case", label: "사후 검토" },
      ],
    },
    { id: "docs", kind: "yesno", label: "관련 서류 확보 여부" },
    { id: "translation", kind: "yesno", label: "번역·공증 필요 여부" },
    { id: "deadline", kind: "yesno", label: "제출·대응 기한 여부" },
  ];
}

function isQuestionAnswered(question: ReviewQuestion, answers: ReviewAnswers): boolean {
  const value = answers[question.id]?.trim() ?? "";
  if (question.kind === "amount") {
    const amount = Number(value.replace(/,/g, "").replace(/\$/g, ""));
    return Number.isFinite(amount) && amount > 0;
  }
  return value.length > 0;
}

function formatAnswerLabel(question: ReviewQuestion, value: string): string {
  if (question.kind === "choice") {
    return question.options.find((opt) => opt.value === value)?.label ?? value;
  }
  if (question.kind === "yesno") {
    return value === "yes" ? "예" : value === "no" ? "아니오" : value;
  }
  return value;
}

/** 축약 행 — 선택 카드 제목과 동일하게 표시(값·판정 로직은 변경 없음) */
function formatCollapsedAnswerLabel(question: ReviewQuestion, value: string): string {
  if (question.kind === "choice" && question.id === "stage") {
    return (
      REVIEW_STAGE_CARD_OPTIONS.find((opt) => opt.value === value)?.title ??
      formatAnswerLabel(question, value)
    );
  }
  return formatAnswerLabel(question, value);
}

function buildReviewResult(
  service: CostCheckService,
  config: MasterLandingConfig,
  answers: ReviewAnswers,
  hasMarket: boolean
): ReviewResult {
  if (hasMarket) {
    const amount = Number((answers.amount ?? "").replace(/,/g, "").replace(/\$/g, ""));
    if (Number.isFinite(amount) && amount > 0) {
      const quoteReview = evaluateCostQuoteReview(service, amount);
      let detail = quoteReview.detail;
      if (answers.prep === "no") {
        detail = `${detail} 서류·번역이 미포함이면 추가 비용이 생길 수 있습니다.`;
      }
      if (answers.officialSplit === "no") {
        detail = `${detail} 공식 수수료가 구분되지 않았다면 항목별 확인이 필요합니다.`;
      }
      return {
        quotedAmount: amount,
        ...quoteReview,
        detail,
      };
    }
  }

  const stage = answers.stage as ReviewStage | undefined;
  const docsMissing = answers.docs === "no";
  const needsTranslation = answers.translation === "yes";
  const hasDeadline = answers.deadline === "yes";
  let verdict: ReviewVerdict = "fair";
  if (docsMissing && stage === "case") verdict = "risk";
  else if (docsMissing || hasDeadline) verdict = "caution";

  const lead = config.reviewChecks[0];
  const title =
    verdict === "risk"
      ? "추가 확인이 필요합니다"
      : verdict === "caution"
        ? "주의 — 보완 확인 권장"
        : "1차 검토 기준 충족";
  const summary = lead
    ? shortenNote(lead.body, 72)
    : "입력한 내용을 기준으로 1차 검토 결과를 정리했습니다.";
  const detailParts = [
    stage === "prevent"
      ? "제출·계약 전에 요건과 누락을 먼저 확인하는 흐름입니다."
      : stage === "case"
        ? "이미 발생한 문제·통지에 맞춰 대응 방향을 점검하는 흐름입니다."
        : null,
    docsMissing ? "관련 서류가 아직 없으면 검토 범위가 제한될 수 있습니다." : null,
    needsTranslation ? "번역·공증이 필요하면 일정과 비용을 함께 확인하세요." : null,
    hasDeadline ? "기한이 있으면 우선 확인할 항목부터 정리하는 것이 좋습니다." : null,
  ].filter(Boolean);

  return {
    quotedAmount: null,
    verdict,
    title,
    summary,
    detail: detailParts.join(" "),
    fairReference: 0,
    bubblePercent: null,
  };
}

function ReviewSidebar({
  service,
  config,
  quotedAmount,
  excessLabel,
  onContinue,
  continueEnabled,
}: {
  service: CostCheckService;
  config: MasterLandingConfig;
  quotedAmount: number | null;
  excessLabel: string | null;
  onContinue: () => void;
  continueEnabled?: boolean;
}) {
  const id = service.id;
  if (id === "trc") {
    return (
      <TrcSummarySidebar
        quotedAmount={quotedAmount}
        currency={service.currency}
        excessLabel={excessLabel}
        onContinue={onContinue}
      />
    );
  }
  if (id === "wp") {
    return (
      <WpSummarySidebar
        quotedAmount={quotedAmount}
        currency={service.currency}
        excessLabel={excessLabel}
        onContinue={onContinue}
      />
    );
  }
  if (id === "tamtru") {
    return (
      <TamtruSummarySidebar
        quotedAmount={quotedAmount}
        currency={service.currency}
        excessLabel={excessLabel}
        onContinue={onContinue}
      />
    );
  }
  if (id === "driving-license") {
    return (
      <DrivingSummarySidebar
        quotedAmount={quotedAmount}
        currency={service.currency}
        excessLabel={excessLabel}
        onContinue={onContinue}
      />
    );
  }
  if (id === "company") {
    return (
      <CompanySummarySidebar
        quotedAmount={quotedAmount}
        quoteCurrency={service.currency}
        excessLabel={excessLabel}
        onContinue={onContinue}
      />
    );
  }
  if (id === "restaurant") {
    return (
      <RestaurantSummarySidebar
        quotedAmount={quotedAmount}
        quoteCurrency={service.currency}
        excessLabel={excessLabel}
        onContinue={onContinue}
      />
    );
  }
  if (
    id === "admin" ||
    id === "real-estate" ||
    id === "fraud" ||
    id === "tax" ||
    id === "notary"
  ) {
    const verifyGlance =
      id === "admin"
        ? {
            procedureLabel: "행정문서",
            reviewTarget: "제출 서류·문서 내용",
            riskSummary: "누락·오류·대응 필요",
          }
        : id === "real-estate"
          ? {
              procedureLabel: "부동산 문서",
              reviewTarget: "계약·권리관계",
              riskSummary: "계약·권리·비용 문제",
            }
          : id === "fraud"
            ? {
                procedureLabel: "사기문서",
                reviewTarget: "상대방·거래·증거",
                riskSummary: "피해·증거·대응 문제",
              }
            : id === "tax"
              ? {
                  procedureLabel: "세무문서",
                  reviewTarget: "세금·신고·증빙",
                  riskSummary: "신고·납부·세무 문제",
                }
              : {
                  procedureLabel: "불확실한 문서",
                  reviewTarget: "문서·발행처·진위",
                  riskSummary: "진위·효력·대응 문제",
                };
    return (
      <AdminSummarySidebar
        excessLabel={excessLabel}
        onContinue={onContinue}
        continueEnabled={continueEnabled ?? false}
        procedureLabel={verifyGlance.procedureLabel}
        reviewTarget={verifyGlance.reviewTarget}
        riskSummary={verifyGlance.riskSummary}
        resultSummary="검토 결과 확인"
        officialLink={
          id === "admin"
            ? undefined
            : {
                name: "공식 안내",
                url: config.officialUrl,
                detail: config.officialNote,
              }
        }
      />
    );
  }
  if (
    id === "hygiene" ||
    id === "fire-safety" ||
    id === "environment" ||
    id === "cosmetics" ||
    id === "medical-device" ||
    id === "franchise"
  ) {
    return (
      <RegisterSummarySidebar
        serviceId={id}
        procedureLabel={config.serviceLabel}
        officialName={config.serviceLabel}
        officialUrl={config.officialUrl}
        officialDetail={config.officialNote}
        quotedAmount={quotedAmount}
        quoteCurrency={service.currency}
        excessLabel={excessLabel}
        onContinue={onContinue}
      />
    );
  }

  return null;
}

function serviceHasSummarySidebar(id: CostCheckServiceId): boolean {
  return true;
}

export function MasterReviewQuotationReport({
  service,
  config,
  onContinue,
  queryEntry,
}: {
  service: CostCheckService;
  config: MasterLandingConfig;
  onContinue: (page1Answers?: ReviewAnswers) => void;
  /** 확인 시작용 질문 입력 — CHECK Master UI와 동일 위치 */
  queryEntry?: ReactNode;
}) {
  const hasMarket =
    config.engine === "verify" ? false : hasMarketPriceData(service);
  const questions = useMemo(() => buildReviewQuestions(service, hasMarket), [service, hasMarket]);
  const article = config.guideSlug ? getPublishedArticleBySlug(config.guideSlug) : null;

  const [answers, setAnswers] = useState<ReviewAnswers>({});
  const [section1Collapsed, setSection1Collapsed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const firstIncompleteIndex = questions.findIndex((q) => !isQuestionAnswered(q, answers));
  const allAnswered = firstIncompleteIndex === -1;

  useEffect(() => {
    if (allAnswered) setSection1Collapsed(true);
  }, [allAnswered]);

  const review = useMemo(() => {
    if (!allAnswered) return null;
    return buildReviewResult(service, config, answers, hasMarket);
  }, [allAnswered, service, config, answers, hasMarket]);

  const hasSidebar = serviceHasSummarySidebar(service.id);
  const verifyDisplayName = config.shortServiceLabel || config.serviceLabel;
  const reportTitle =
    config.engine === "verify"
      ? `${verifyDisplayName} 리뷰 확인서`
      : hasMarket
        ? `${service.label} 비용 확인서`
        : `${service.label} 확인서`;
  const reportShortLabel =
    config.engine === "verify" ? verifyDisplayName : service.shortLabel;
  /** VERIFY: 4문항 완료 전에는 결과·전체 사이드바·공식 안내를 숨김 (CHECK/REGISTER 동작 유지) */
  const showResultAreas = config.engine !== "verify" || allAnswered;
  const showSidebar = hasSidebar && showResultAreas;
  /** VERIFY 질문 중: 오른쪽(PC)·하단(모바일) 행동 CTA 레일 */
  const showVerifyQuestionActions = config.engine === "verify" && !allAnswered;
  const showRightColumn = showSidebar || showVerifyQuestionActions;

  const grade = review ? excessGrade(review.verdict) : null;
  const score =
    review && review.quotedAmount != null && review.quotedAmount > 0
      ? computeReviewScore(
          review.verdict,
          review.bubblePercent,
          review.fairReference,
          review.quotedAmount,
          service.marketMin
        )
      : review
        ? review.verdict === "fair"
          ? 78
          : review.verdict === "caution"
            ? 58
            : review.verdict === "very_low"
              ? 62
              : 42
        : 0;
  const displayBubble =
    review && review.bubblePercent != null && review.fairReference > 0
      ? computeDisplayBubblePercent(
          review.bubblePercent,
          review.fairReference,
          review.quotedAmount ?? 0
        )
      : 0;

  const riskCards = config.reviewChecks.slice(0, 4).map((item) => ({
    label: item.title,
    note: shortenNote(item.body, 48),
  }));
  const leftRisks =
    article?.caseLanding.cautions.slice(0, 2) ??
    config.reviewChecks.slice(0, 2).map((item) => shortenNote(item.body, 56));
  const rightRisks =
    article?.caseLanding.cautions.slice(2, 4) ??
    config.reviewChecks.slice(2, 4).map((item) => shortenNote(item.body, 56));
  const recommendation =
    config.reviewRecommendation ||
    config.reviewIntro ||
    service.lookupGuide ||
    "입력 내용을 바탕으로 다음 확인 단계를 진행하세요.";
  const verifyNeedsCards = config.reviewNeeds ?? [];
  function verifyNeedsIcon(title: string, index: number) {
    if (title.includes("권리") || title.includes("증거") || title.includes("효력")) {
      return ShieldCheck;
    }
    if (title.includes("상대방")) return UserRound;
    if (
      title.includes("내용") ||
      title.includes("거래") ||
      title.includes("신고") ||
      title.includes("발행") ||
      title.includes("증빙")
    ) {
      return ClipboardCheck;
    }
    if (title.includes("절차") || title.includes("비용")) return Building2;
    return ([FileText, ClipboardCheck, Building2] as const)[index] ?? FileText;
  }
  const verifyConsultationCostGuide =
    config.engine === "verify"
      ? service.id === "notary"
        ? "불확실한 서류 검토는 문서 성격·진위 확인·대응 범위에 따라 상담 비용이 발생할 수 있습니다."
        : service.lookupGuide?.trim() || ""
      : "";
  const reportSourceNote = verifyConsultationCostGuide
    ? verifyConsultationCostGuide
    : service.source?.trim()
      ? `출처: ${service.source}`
      : service.lookupGuide || config.officialNote;
  /** VERIFY 상담 안내 — 모바일 1줄용 짧은 문구 */
  const reportSourceNoteMobile =
    config.engine === "verify" && verifyConsultationCostGuide
      ? service.id === "admin"
        ? "서류 유형·범위에 따라 상담 비용이 발생할 수 있습니다."
        : service.id === "real-estate"
          ? "계약 유형·조건에 따라 상담 비용이 발생할 수 있습니다."
          : service.id === "fraud"
            ? "사건·증거 범위에 따라 상담 비용이 발생할 수 있습니다."
            : service.id === "tax"
              ? "세금 유형·범위에 따라 상담 비용이 발생할 수 있습니다."
              : service.id === "notary"
                ? "문서 성격·범위에 따라 상담 비용이 발생할 수 있습니다."
                : verifyConsultationCostGuide
      : null;
  const footerNote =
    verifyConsultationCostGuide || service.lookupGuide?.trim() || COST_CHECK_DISCLAIMER;

  function commitAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setEditingId(null);
  }

  function renderCollapsedQuestion(question: ReviewQuestion): ReactNode {
    const value = answers[question.id] ?? "";
    return (
      <li key={question.id}>
        <button
          type="button"
          onClick={() => setEditingId(question.id)}
          className="w-full rounded-[6px] border border-[#D8DEE8] bg-[#F8FAFC] px-3.5 py-2 text-left transition hover:bg-[#F1F5F9]"
        >
          <p className="text-[12px] font-normal leading-snug text-[#64748B]">{question.label}</p>
          <p className="mt-0.5 break-keep text-[13px] font-medium leading-snug text-[#334155]">
            {formatAnswerLabel(question, value)}
          </p>
        </button>
      </li>
    );
  }

  function renderCompactCollapsedQuestion(question: ReviewQuestion): ReactNode {
    const value = answers[question.id] ?? "";
    return (
      <li key={question.id} className="list-none">
        <button
          type="button"
          onClick={() => {
            setSelectedKey(null);
            setEditingId(question.id);
          }}
          className="flex w-full items-baseline gap-1.5 rounded-[4px] py-0.5 text-left transition hover:bg-[#F8FAFC]"
        >
          <Check className="mt-px h-3 w-3 shrink-0 text-emerald-600" aria-hidden />
          <span className="shrink-0 text-[11px] font-normal leading-snug text-[#94A3B8]">
            {question.label}
          </span>
          <span className="min-w-0 truncate text-[11px] font-medium leading-snug text-[#475569]">
            {formatCollapsedAnswerLabel(question, value)}
          </span>
        </button>
      </li>
    );
  }

  function selectAnswer(questionId: string, value: string) {
    if (questionId === "deadline") {
      commitAnswer(questionId, value);
      setSelectedKey(null);
      return;
    }
    setSelectedKey(value);
    setTimeout(() => {
      commitAnswer(questionId, value);
      setSelectedKey(null);
    }, 300);
  }

  function renderVerifyStyleActiveQuestion(question: ReviewQuestion, stepNumber: number): ReactNode {
    const value = answers[question.id] ?? "";
    const questionProps = {
      variant: "verify" as const,
      totalSteps: questions.length,
      step: stepNumber,
    };

    if (question.kind === "choice" && question.id === "stage") {
      return (
        <li key={question.id} className="list-none">
          <QuestionSection
            title="어떤 검토가 필요하신가요?"
            description="현재 상황에 맞는 검토 방식을 선택해주세요."
            {...questionProps}
          >
            <VerifyAnswerGrid step={1}>
              {REVIEW_STAGE_CARD_OPTIONS.map((opt) => (
                <SelectionCard
                  key={opt.value}
                  variant="quiet"
                  title={opt.title}
                  description={opt.desc}
                  selected={selectedKey === opt.value || value === opt.value}
                  icon={opt.icon}
                  tone={opt.tone}
                  onClick={() => selectAnswer(question.id, opt.value)}
                />
              ))}
            </VerifyAnswerGrid>
          </QuestionSection>
        </li>
      );
    }

    if (question.kind === "amount") {
      const amountValid = isQuestionAnswered(question, answers);
      return (
        <li key={question.id} className="list-none">
          <QuestionSection title={question.label} {...questionProps}>
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  inputMode="decimal"
                  value={value}
                  placeholder={question.placeholder}
                  onChange={(e) => {
                    setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }));
                  }}
                  className="min-h-10 w-full min-w-0 flex-1 rounded-[6px] border border-[#CBD5E1] bg-white px-3 text-[15px] text-[#0F172A] outline-none focus:border-[#0B2A6B] focus:ring-2 focus:ring-[#0B2A6B]/12 sm:min-h-9 sm:px-2.5 sm:text-[13px]"
                />
                <span className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-[6px] border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-[13px] font-medium text-[#475569] sm:min-h-9">
                  {service.currency}
                </span>
              </div>
              <button
                type="button"
                disabled={!amountValid}
                onClick={() => {
                  if (!amountValid) return;
                  setEditingId(null);
                }}
                className="inline-flex min-h-10 w-full shrink-0 items-center justify-center rounded-[6px] bg-[#0B2A6B] px-3.5 text-[14px] font-medium text-white transition hover:bg-[#082258] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-9 sm:w-auto sm:text-[12px]"
              >
                확인
              </button>
            </div>
          </QuestionSection>
        </li>
      );
    }

    if (question.kind === "yesno") {
      return (
        <li key={question.id} className="list-none">
          <QuestionSection title={question.label} {...questionProps}>
            <VerifyAnswerGrid step={1}>
              {(
                [
                  { v: "yes", l: "예", tone: "amber" as SelectionCardTone },
                  { v: "no", l: "아니오", tone: "blue" as SelectionCardTone },
                ] as const
              ).map(({ v, l, tone }) => (
                <SelectionCard
                  key={v}
                  variant="quiet"
                  title={l}
                  selected={selectedKey === v || value === v}
                  tone={tone}
                  onClick={() => selectAnswer(question.id, v)}
                />
              ))}
            </VerifyAnswerGrid>
          </QuestionSection>
        </li>
      );
    }

    return renderActiveQuestion(question);
  }

  function renderActiveQuestion(question: ReviewQuestion): ReactNode {
    const value = answers[question.id] ?? "";

    if (question.kind === "amount") {
      const amountValid = isQuestionAnswered(question, answers);
      return (
        <li
          key={question.id}
          className="rounded-[6px] border border-[#D8DEE8] bg-white px-3.5 py-2.5"
        >
          <p className="text-[14px] font-medium leading-snug text-[#334155]">{question.label}</p>
          <div className="mt-2 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                inputMode="decimal"
                value={value}
                placeholder={question.placeholder}
                onChange={(e) => {
                  setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }));
                }}
                className="min-h-10 w-full min-w-0 flex-1 rounded-[6px] border border-[#CBD5E1] bg-white px-3 text-[15px] text-[#0F172A] outline-none focus:border-[#0B2A6B] focus:ring-2 focus:ring-[#0B2A6B]/12 sm:min-h-9 sm:px-2.5 sm:text-[13px]"
              />
              <span className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-[6px] border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-[13px] font-medium text-[#475569] sm:min-h-9">
                {service.currency}
              </span>
            </div>
            <button
              type="button"
              disabled={!amountValid}
              onClick={() => {
                if (!amountValid) return;
                setEditingId(null);
              }}
              className="inline-flex min-h-10 w-full shrink-0 items-center justify-center rounded-[6px] bg-[#0B2A6B] px-3.5 text-[14px] font-medium text-white transition hover:bg-[#082258] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-9 sm:w-auto sm:text-[12px]"
            >
              확인
            </button>
          </div>
        </li>
      );
    }

    if (question.kind === "choice") {
      return (
        <li
          key={question.id}
          className="rounded-[6px] border border-[#D8DEE8] bg-white px-3.5 py-2.5"
        >
          <p className="text-[14px] font-medium leading-snug text-[#334155]">{question.label}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {question.options.map((opt) => (
              <label
                key={opt.value}
                className={`flex min-h-10 cursor-pointer items-center justify-center rounded-[6px] border px-3 text-[13px] font-medium transition ${
                  value === opt.value
                    ? "border-[#0B2A6B] bg-[#0B2A6B] text-white"
                    : "border-[#E5E7EB] bg-[#F8FAFC] text-[#475569]"
                }`}
              >
                <input
                  type="radio"
                  name={`review-${question.id}`}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={() => commitAnswer(question.id, opt.value)}
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </li>
      );
    }

    return (
      <li
        key={question.id}
        className="rounded-[6px] border border-[#D8DEE8] bg-white px-3.5 py-2.5"
      >
        <p className="text-[14px] font-medium leading-snug text-[#334155]">{question.label}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            [
              { v: "yes", l: "예" },
              { v: "no", l: "아니오" },
            ] as const
          ).map(({ v, l }) => (
            <label
              key={v}
              className={`flex min-h-10 min-w-[5.5rem] flex-1 cursor-pointer items-center justify-center rounded-[6px] border px-3 text-[13px] font-medium transition sm:flex-none ${
                value === v
                  ? "border-[#0B2A6B] bg-[#0B2A6B] text-white"
                  : "border-[#E5E7EB] bg-[#F8FAFC] text-[#475569]"
              }`}
            >
              <input
                type="radio"
                name={`review-${question.id}`}
                value={v}
                checked={value === v}
                onChange={() => commitAnswer(question.id, v)}
                className="sr-only"
              />
              {l}
            </label>
          ))}
        </div>
      </li>
    );
  }

  function renderProgressiveQuestions(): ReactNode {
    if (section1Collapsed && allAnswered) {
      return null;
    }

    const activeIndex =
      editingId != null ? questions.findIndex((q) => q.id === editingId) : firstIncompleteIndex;

    if (config.engine === "verify") {
      return (
        <ul className="space-y-1.5">
          {questions.map((question, index) => {
            const answered = isQuestionAnswered(question, answers);
            const isEditing = editingId === question.id;
            const isActive = activeIndex === index;

            if (isEditing || (isActive && !answered)) {
              return renderVerifyStyleActiveQuestion(question, index + 1);
            }

            if (answered && (index < firstIncompleteIndex || allAnswered)) {
              return renderCompactCollapsedQuestion(question);
            }

            return null;
          })}
        </ul>
      );
    }

    return (
      <ul className="space-y-2">
        {questions.map((question, index) => {
          const answered = isQuestionAnswered(question, answers);
          const isEditing = editingId === question.id;
          const isActive = activeIndex === index;

          if (isEditing || (isActive && !answered)) {
            return renderActiveQuestion(question);
          }

          if (answered && (index < firstIncompleteIndex || allAnswered)) {
            return renderCollapsedQuestion(question);
          }

          return null;
        })}
      </ul>
    );
  }

  const collapsedSummary = questions
    .map((q) => `${q.label}: ${formatAnswerLabel(q, answers[q.id] ?? "—")}`)
    .join(" · ");

  function handleContinueClick() {
    if (config.engine === "verify") {
      if (!allAnswered) return;
      onContinue(answers);
      return;
    }
    onContinue();
  }

  return (
    <div className="mt-2.5 space-y-2.5 sm:mt-3 sm:space-y-3">
      {queryEntry ? (
        <section
          aria-labelledby="review-query-start"
          className="rounded-[4px] border border-[#D8DEE8] bg-white px-3.5 py-3 sm:px-4 sm:py-3.5"
        >
          <h3
            id="review-query-start"
            className="mb-2 text-[12px] font-medium tracking-tight text-[#0B2A6B] sm:mb-1.5"
          >
            확인 시작
          </h3>
          {queryEntry}
        </section>
      ) : null}

      <div className="overflow-hidden rounded-[4px] border border-[#D8DEE8] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div
          className={`flex flex-col ${
            showRightColumn ? "lg:grid lg:grid-cols-[minmax(0,1fr)_270px] lg:items-stretch" : ""
          }`}
        >
          <div
            className={`flex min-w-0 flex-col bg-white ${showRightColumn ? "border-[#E5E7EB] lg:border-r" : ""}`}
          >
            <article className="flex h-full min-h-0 flex-col">
              <header className="border-b border-[#E5E7EB] px-3.5 py-2.5 sm:px-4 sm:py-3">
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium tracking-[0.06em] text-[#64748B] sm:text-[10px] sm:tracking-[0.1em]">
                      VFBCAI · CHECK
                    </p>
                    <h2 className="mt-1 text-[18px] font-semibold leading-snug tracking-tight text-[#0B2A6B] sm:mt-0.5 sm:text-[17px]">
                      {reportTitle}
                    </h2>
                    <p className="mt-0.5 break-words text-[12px] font-normal leading-snug tracking-[0.02em] text-[#64748B] sm:mt-0.5 sm:text-[10px] sm:leading-relaxed sm:tracking-[0.06em]">
                      QUOTATION REPORT · {reportShortLabel}
                    </p>
                  </div>
                  <div className="min-w-0 text-left max-sm:w-full sm:max-w-[14rem] sm:pt-0.5 sm:text-right">
                    <p className={MOBILE_REPORT_SOURCE}>
                      {reportSourceNoteMobile ? (
                        <>
                          <span className="sm:hidden">{reportSourceNoteMobile}</span>
                          <span className="hidden sm:inline">{reportSourceNote}</span>
                        </>
                      ) : (
                        reportSourceNote
                      )}
                    </p>
                  </div>
                </div>
              </header>

              <div className="flex-1 space-y-4 px-3.5 py-3 sm:space-y-4 sm:px-4 sm:py-3.5">
                <section aria-labelledby="review-check-summary">
                  <div className="mb-2 flex flex-col gap-0.5 border-b border-[#E5E7EB] pb-1 sm:mb-2 sm:flex-row sm:items-baseline sm:gap-2.5 sm:pb-1">
                    <h3
                      id="review-check-summary"
                      className="shrink-0 text-[17px] font-semibold leading-snug tracking-tight text-[#0B2A6B] sm:text-[13.5px] sm:font-semibold sm:leading-relaxed sm:tracking-normal"
                    >
                      <span className="tabular-nums font-medium text-[#64748B]">1.</span> 검토 내용 체크
                    </h3>
                    <p className={MOBILE_COST_SUMMARY_INTRO}>
                      {hasMarket
                        ? "짧은 질문에 답하면 검토 결과를 확인할 수 있습니다."
                        : "4개 질문에 답하면 검토 결과가 표시됩니다."}
                    </p>
                  </div>

                  {section1Collapsed && allAnswered ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSection1Collapsed(false);
                        setEditingId(null);
                      }}
                      className={`w-full rounded-[6px] border border-[#D8DEE8] px-3.5 py-2.5 text-left ${
                        config.engine === "verify"
                          ? "bg-[#F8FAFC] lg:bg-white"
                          : "bg-[#F8FAFC]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 text-[13px] font-medium text-[#0B2A6B]">
                            <ClipboardCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
                            검토 완료
                          </p>
                          <p className="mt-1 break-keep text-[12px] leading-relaxed text-[#64748B]">
                            {collapsedSummary}
                          </p>
                        </div>
                        <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-[#94A3B8]" aria-hidden />
                      </div>
                    </button>
                  ) : (
                    renderProgressiveQuestions()
                  )}
                  {showResultAreas ? (
                    <ReviewOfficialTrustStrip engine={config.engine} />
                  ) : null}
                </section>

                {showVerifyQuestionActions ? (
                  <div className="mt-2.5 flex flex-col gap-2 lg:hidden">
                    <button
                      type="button"
                      disabled
                      onClick={handleContinueClick}
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-[8px] bg-[#0B2A6B] px-4 text-[13px] font-semibold text-white transition hover:bg-[#082258] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-10 sm:text-[12.5px]"
                    >
                      {config.engine === "verify" ? "검토하기 →" : "내 상황 자세히 확인하기 →"}
                    </button>
                    <button
                      type="button"
                      disabled
                      className="inline-flex min-h-10 w-full items-center justify-center rounded-[8px] border border-[#D8DEE8] bg-white px-4 text-[12.5px] font-medium text-[#0B2A6B] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-9 sm:text-[12px]"
                    >
                      이 결과 공유하기
                    </button>
                    <p className="break-keep text-center text-[11.5px] leading-relaxed text-[#64748B] sm:text-[11px]">
                      모든 질문에 답하면 결과를 확인할 수 있습니다.
                    </p>
                  </div>
                ) : null}

                {review ? (
                  <section aria-labelledby="review-result">
                    <SectionTitle id="review-result" number="2" title="검토 결과" emphasized />
                    <p className={MOBILE_SECTION_INTRO}>
                      입력한 내용을 기준으로 1차 검토 결과입니다.
                    </p>
                    <div
                        className={`rounded-[6px] border px-3 py-2.5 sm:px-3 sm:py-2.5 ${
                          review.verdict === "fair"
                            ? "border-emerald-200 bg-emerald-50/60"
                            : review.verdict === "very_low"
                              ? "border-slate-200 bg-slate-50"
                              : "border-red-200 bg-red-50/50"
                        }`}
                      >
                        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between lg:gap-2.5">
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
                                <p className={MOBILE_SUBHEAD}>{analysisHeadline(review.verdict)}</p>
                                <p className={`mt-1 ${MOBILE_BODY_TIGHT}`}>{review.title}</p>
                                <p className={`mt-1 ${MOBILE_BODY}`}>{review.summary}</p>
                                <p className={`mt-1 ${MOBILE_BODY}`}>{review.detail}</p>
                                {review.quotedAmount != null && review.fairReference > 0 ? (
                                  <p className={MOBILE_META}>
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
                                ) : (
                                  <p className={MOBILE_META}>
                                    1차 검토 점수 {Math.round(score)} / 100
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          {grade ? (
                            <div className="shrink-0 rounded-[6px] border border-white/80 bg-white/80 px-3 py-2 sm:px-3 sm:py-2 lg:min-w-[8.5rem]">
                              <p className="text-[12px] font-normal text-[#64748B] sm:text-[10px]">
                                {review.quotedAmount != null && review.fairReference > 0
                                  ? "과다 가능성 등급"
                                  : "주의 등급"}
                              </p>
                              <p className={MOBILE_GRADE_LABEL}>{grade.label}</p>
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
                          ) : null}
                        </div>
                      </div>
                  </section>
                ) : null}

                {showResultAreas ? (
                  <>
                <section aria-labelledby="review-risks">
                  <SectionTitle id="review-risks" number="3" title="주요 위험 요인" emphasized />
                  <p className={MOBILE_SECTION_INTRO}>
                    검토 시 자주 확인하는 위험 요인입니다.
                  </p>
                  <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-1.5 lg:grid-cols-4">
                    {riskCards.map((item) => (
                      <li
                        key={item.label}
                        className={`min-w-0 rounded-[6px] border border-[#E5E7EB] px-2.5 py-2 sm:px-2 sm:py-2 ${
                          config.engine === "verify"
                            ? "bg-[#F8FAFC] lg:bg-white"
                            : "bg-[#F8FAFC]"
                        }`}
                      >
                        <p className={MOBILE_CARD_LABEL}>{item.label}</p>
                        <p className={MOBILE_CARD_NOTE}>{item.note}</p>
                      </li>
                    ))}
                  </ul>
                </section>

                <section aria-labelledby="review-needs">
                  <SectionTitle
                    id="review-needs"
                    number="4"
                    title="확인이 필요한 사항"
                    emphasized
                  />
                  <p className={MOBILE_SECTION_INTRO}>
                    {config.engine === "verify"
                      ? "서류를 제출하기 전에 아래 3가지를 확인합니다."
                      : "놓치면 재제출·지연이 생길 수 있는 항목입니다."}
                  </p>
                  {config.engine === "verify" ? (
                    <div className="grid grid-cols-1 items-stretch gap-2 lg:grid-cols-3 lg:gap-2">
                      {verifyNeedsCards.map(({ title, items }, index) => {
                        const Icon = verifyNeedsIcon(title, index);
                        return (
                          <div
                            key={title}
                            className="h-full rounded-[6px] border border-[#D6E4FB] bg-[#F5F8FF] px-3 py-1.5 sm:px-3 sm:py-1.5 lg:bg-white"
                          >
                            <div className="mb-0.5 flex items-start gap-2 sm:gap-1.5">
                              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#0B2A6B]">
                                <Icon className="h-3.5 w-3.5" aria-hidden />
                              </span>
                              <p className={`min-w-0 ${MOBILE_CARD_LABEL}`}>{title}</p>
                            </div>
                            <ul className="space-y-0.5">
                              {items.map((text) => (
                                <li
                                  key={text}
                                  className="flex items-start gap-2 break-keep text-[12.5px] font-normal leading-[1.45] text-[#64748B] sm:text-[11px] sm:leading-snug sm:text-[#475569] lg:whitespace-nowrap lg:text-[10.5px]"
                                >
                                  <span
                                    className="mt-[0.4rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#64748B] sm:mt-[0.35rem]"
                                    aria-hidden
                                  />
                                  <span className="min-w-0">{text}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 items-start gap-2 lg:grid-cols-2 lg:gap-2">
                        <div className="h-auto self-start rounded-[6px] border border-[#FECACA] bg-[#FEF2F2]/60 px-3 py-2.5 sm:px-3 sm:py-2.5">
                          <div className="mb-1.5 flex items-start gap-2 sm:mb-1.5 sm:gap-1.5">
                            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                              <UserRound className="h-3.5 w-3.5" aria-hidden />
                            </span>
                            <p className={`min-w-0 ${MOBILE_CARD_LABEL}`}>
                              직접 진행 시 놓치기 쉬운 항목
                            </p>
                          </div>
                          <ul className="space-y-1">
                            {leftRisks.map((text, index) => (
                              <li key={`${text}-${index}`} className={`flex gap-1.5 ${MOBILE_BODY}`}>
                                <span className="shrink-0 tabular-nums text-[#94A3B8]" aria-hidden>
                                  {index === 0 ? "①" : "②"}
                                </span>
                                <span>{text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="h-auto self-start rounded-[6px] border border-[#BFDBFE] bg-[#EFF6FF]/70 px-3 py-2.5 sm:px-3 sm:py-2.5">
                          <div className="mb-1.5 flex items-start gap-2 sm:mb-1.5 sm:gap-1.5">
                            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#0B2A6B]">
                              <Building2 className="h-3.5 w-3.5" aria-hidden />
                            </span>
                            <p className={`min-w-0 ${MOBILE_CARD_LABEL}`}>
                              대행·안내를 받을 때 확인할 항목
                            </p>
                          </div>
                          <ul className="space-y-1">
                            {rightRisks.map((text, index) => (
                              <li key={`${text}-${index}`} className={`flex gap-1.5 ${MOBILE_BODY}`}>
                                <span className="shrink-0 tabular-nums text-[#94A3B8]" aria-hidden>
                                  {index === 0 ? "①" : "②"}
                                </span>
                                <span>{text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                  )}
                  <p className={`mt-1.5 ${MOBILE_META} sm:mt-1.5`}>
                    {config.engine === "verify"
                      ? "법률 판단이나 확정된 비용·벌금이 아니라, 검토 과정에서 확인하는 주요 항목입니다."
                      : "확정된 법률·벌금 금액이 아니라, 검토 진행에서 확인하는 참고 안내입니다."}
                  </p>
                </section>

                <section aria-labelledby="review-action">
                  <SectionTitle id="review-action" number="5" title="권장 대응" emphasized />
                  <div className="rounded-[6px] border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2.5 sm:px-3 sm:py-2.5">
                    <div className="flex items-start gap-2.5 sm:gap-2">
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]" aria-hidden />
                      <p className={MOBILE_CALLOUT}>{recommendation}</p>
                    </div>
                  </div>
                </section>
                  </>
                ) : null}

                {review ? (
                  <div className="mt-2.5 flex flex-col gap-1.5 lg:hidden">
                    <button
                      type="button"
                      onClick={handleContinueClick}
                      className="inline-flex min-h-10 w-full items-center justify-center rounded-[8px] bg-[#0B2A6B] px-4 text-[14px] font-semibold text-white transition hover:bg-[#082258]"
                    >
                      {config.engine === "verify" ? "검토하기 →" : "내 상황 자세히 확인하기 →"}
                    </button>
                    <button
                      type="button"
                      className="inline-flex min-h-9 w-full items-center justify-center rounded-[8px] border border-[#D8DEE8] bg-white px-4 text-[14px] font-medium text-[#0B2A6B]"
                    >
                      이 결과 공유하기
                    </button>
                  </div>
                ) : null}
              </div>

              <footer
                className={`mt-auto border-t border-[#E5E7EB] px-3.5 py-2 sm:px-4 sm:py-2 ${
                  config.engine === "verify"
                    ? "bg-[#F8FAFC] lg:bg-white"
                    : "bg-[#F8FAFC]"
                }`}
              >
                <p className="break-keep text-center text-[11px] leading-snug text-[#94A3B8] sm:text-[10px] sm:leading-relaxed">
                  VFBCAI · www.vfbcai.com · Check. Verify. Register. Protect.
                </p>
                <p
                  className={`mt-1 break-keep text-center text-[#64748B] sm:mt-1 sm:text-[10.5px] sm:leading-relaxed ${
                    reportSourceNoteMobile
                      ? "text-[9px] leading-none tracking-tight whitespace-nowrap sm:text-[10.5px] sm:leading-relaxed sm:tracking-normal sm:whitespace-normal"
                      : "text-[11px] leading-[1.45]"
                  }`}
                >
                  {reportSourceNoteMobile ? (
                    <>
                      <span className="sm:hidden">{reportSourceNoteMobile}</span>
                      <span className="hidden sm:inline">{footerNote}</span>
                    </>
                  ) : (
                    footerNote
                  )}
                </p>
              </footer>
            </article>
          </div>

          {showSidebar ? (
            <ReviewSidebar
              service={service}
              config={config}
              quotedAmount={review?.quotedAmount ?? null}
              excessLabel={grade?.label ?? null}
              onContinue={handleContinueClick}
              continueEnabled={config.engine === "verify" ? allAnswered : undefined}
            />
          ) : null}

          {showVerifyQuestionActions ? (
            <aside className="hidden h-full w-full flex-col border-t border-[#E5E7EB] bg-[#F8FAFC] p-3.5 lg:flex lg:border-t-0 lg:w-auto lg:p-3">
              <OfficialTrustZone
                engine="verify"
                variant="panel"
                className="mt-0 w-full !bg-white"
              />
              <div className="mt-auto flex flex-col gap-2 pt-3">
                <button
                  type="button"
                  disabled
                  onClick={handleContinueClick}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-[8px] bg-[#0B2A6B] px-4 text-[13px] font-semibold text-white transition hover:bg-[#082258] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-10 sm:text-[12.5px]"
                >
                  {config.engine === "verify" ? "검토하기 →" : "내 상황 자세히 확인하기 →"}
                </button>
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-[8px] border border-[#D8DEE8] bg-white px-4 text-[12.5px] font-medium text-[#0B2A6B] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-9 sm:text-[12px]"
                >
                  이 결과 공유하기
                </button>
                <p className="break-keep text-center text-[11.5px] leading-relaxed text-[#64748B] sm:text-[11px]">
                  모든 질문에 답하면 결과를 확인할 수 있습니다.
                </p>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
