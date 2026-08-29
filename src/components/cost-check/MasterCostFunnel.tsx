"use client";

import Link from "next/link";
import {
  BarChart3,
  Building2,
  Calculator,
  CircleCheck,
  ClipboardCheck,
  Cpu,
  Globe,
  Headset,
  Lightbulb,
  Lock,
  Scale,
  Shield,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import {
  formatCostAmount,
  getCostCheckService,
  type CostCheckService,
  type CostCheckServiceId,
} from "@/lib/costCheck";
import { getQuoteFunnelHref } from "@/lib/quoteReviewLinks";

export function hasMarketPriceData(service: CostCheckService): boolean {
  return service.marketMin > 0 || service.marketMax > 0 || service.marketUsualFeeAmount > 0;
}

export function isVerifyCostCheckService(id: CostCheckServiceId): boolean {
  return getCostCheckService(id).ctaHref.startsWith("/verify/");
}

export function isVerifyConsultationService(id: CostCheckServiceId): boolean {
  return isVerifyCostCheckService(id) && id !== "notary";
}

export function hasConsultationPriceData(service: CostCheckService): boolean {
  return service.govFeeAmount > 0 || service.governmentFee.trim().length > 0;
}

const FEE_STRUCTURE_NOTE =
  "※ 정부 수수료와 대행료는 통화가 달라 별도로 표시합니다. 실제 견적에 정부 수수료와 대행료가 모두 포함되어 있는지 확인하세요.";

export const MASTER_FUNNEL_STEPS_VERIFY: {
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

export const MASTER_FUNNEL_STEPS_CHECK: {
  step: number;
  title: string;
  desc: string;
  icon: LucideIcon;
}[] = [
  { step: 1, title: "공식 행정 기준 확인", desc: "베트남 공식 행정 자료에 기초한 정확한 확인", icon: Shield },
  { step: 2, title: "AI 1차 분석", desc: "국적·비자·직책·회사 형태를 기준으로 가능 여부를 먼저 확인", icon: ClipboardCheck },
  { step: 3, title: "AI Review", desc: "확인 결과를 바탕으로 필요 절차와 보완 포인트를 정리한 리포트 제공", icon: Cpu },
  { step: 4, title: "필요 시 전문가 연결", desc: "복잡하거나 중요한 케이스는 VFBCAI 전문가팀이 끝까지 도와드립니다.", icon: Headset },
];

export const MASTER_FUNNEL_STEPS_REGISTER: {
  step: number;
  title: string;
  desc: string;
  icon: LucideIcon;
}[] = [
  { step: 1, title: "인허가 요건 확인", desc: "공식 인허가 절차·요건을 기준으로 준비 상태를 확인", icon: Shield },
  { step: 2, title: "AI 1차 분석", desc: "사업자·영업장·위생·소방 준비 상태를 바탕으로 방향을 먼저 확인", icon: ClipboardCheck },
  { step: 3, title: "AI Review", desc: "필요한 절차와 보완 포인트를 정리한 전체 리포트 제공", icon: Cpu },
  { step: 4, title: "필요 시 전문가 연결", desc: "추가 절차가 필요한 경우 VFBCAI 전문가팀이 끝까지 도와드립니다.", icon: Headset },
];

export const MASTER_FUNNEL_EFFECTS = [
  "불필요한 비용 예방",
  "시간과 절차를 단축",
  "안전하고 확실한 결과",
] as const;

export const MASTER_FOOTER_TRUST_TAGS: { label: string; icon: LucideIcon }[] = [
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

export function OverviewMetricCard({
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

/** Cost Check MASTER — 정부/상담 · 시장가격 · 예상 비용 구조 */
export function MasterPriceOverview({
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

/** 데이터 없는 REGISTER 등 — 동일 카드 구조, 금액 생성 없음 */
export function MasterPendingPriceOverview({
  structureHint = "정확한 비용은 내 상황 확인 후 안내됩니다.",
}: {
  structureHint?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3.5">
      <OverviewMetricCard
        icon={Scale}
        label="정부 수수료"
        value="공식 기준 확인 필요"
        hint="정부에 실제 납부하는 공식 비용"
        pending
        variant="primary"
      />
      <OverviewMetricCard
        icon={BarChart3}
        label="시장가격"
        value="시장가격 확인 중"
        hint="시장에서 형성된 참고 대행 비용"
        pending
        variant="market"
      />
      <OverviewMetricCard
        icon={Calculator}
        label="예상 비용 구조"
        value="현재 산출할 수 없습니다"
        hint={structureHint}
        pending
        variant="structure"
      />
    </div>
  );
}

/** 합계 구조 — 정부 + 시장을 분리 표시 (VFBCAI 가격 합산 금지) */
export function MasterCostStructureSummary({
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
        <p className="flex items-center justify-center py-0.5" aria-hidden="true">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#93C5FD] bg-white text-[18px] font-bold leading-none text-[#2563EB] shadow-[0_1px_2px_rgba(37,99,235,0.12)]">
            +
          </span>
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

export function MasterPendingCostStructureSummary({
  note = "공식 확인된 단계·비용 데이터가 아직 없어 임의 금액을 표시하지 않습니다. 정확한 안내는 준비 상태 확인 후 이어집니다.",
}: {
  note?: string;
}) {
  return (
    <div className="rounded-xl border border-blue-200 bg-white p-4">
      <p className="text-xs font-semibold text-blue-900">예상 비용 구조</p>
      <p className="mt-1 break-words text-xs leading-relaxed text-slate-600">
        실제 진행 시 아래 두 항목이 각각 발생할 수 있습니다.
      </p>
      <div className="mt-3 space-y-2 rounded-lg border border-blue-100 bg-blue-50/30 p-3">
        <p className="break-words text-sm leading-relaxed text-blue-900">
          <span className="font-medium text-slate-600">정부 수수료</span>{" "}
          <span className="font-semibold text-slate-500">공식 기준 확인 필요</span>
        </p>
        <p className="text-center text-sm font-semibold text-slate-400" aria-hidden="true">
          +
        </p>
        <p className="break-words text-sm leading-relaxed text-blue-900">
          <span className="font-medium text-slate-600">시장 대행료</span>{" "}
          <span className="font-semibold text-slate-500">현재 산출할 수 없습니다</span>
        </p>
      </div>
      <p className="mt-3 break-words text-xs leading-relaxed text-slate-600">{note}</p>
    </div>
  );
}

export function MasterFunnelHook({
  title = "가격만 보고 결정하면, 더 큰 비용과 시간을 잃을 수 있습니다.",
  body = "행정문서 검토 비용은 문서 종류와 난이도, 인허가 목적, 전문가의 경험에 따라 크게 달라집니다. 정확한 비교는 내 상황을 먼저 확인해야만 가능합니다.",
}: {
  title?: string;
  body?: string;
}) {
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
            {title}
          </h3>
          <p className="mt-1.5 max-w-[34rem] break-keep text-[12.5px] font-normal leading-[1.65] text-[#64748B] sm:text-[13px]">
            {body}
          </p>
        </div>
      </div>
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

type FunnelStep = {
  step: number;
  title: string;
  desc: string;
  icon: LucideIcon;
};

export function MasterFunnelPersuasion({
  headline,
  steps = MASTER_FUNNEL_STEPS_VERIFY,
  effects = MASTER_FUNNEL_EFFECTS,
  trustBadge = "VFBCAI 전문가와 함께, 정확하고 안전하게",
  ctaNote = "내 상황 분석과 1차 결과는 무료로 확인할 수 있습니다.",
  ctaSub = "1차 분석 결과를 먼저 확인할 수 있습니다.",
  lockNote = "상황을 입력하시면 AI Review와 전체 리포트로 이어집니다.",
  href,
  onContinue,
}: {
  headline: string;
  steps?: FunnelStep[];
  effects?: readonly string[];
  trustBadge?: string;
  ctaNote?: string;
  ctaSub?: string;
  lockNote?: string;
  href?: string;
  onContinue?: () => void;
}) {
  const ctaClassName =
    "inline-flex min-h-[3.15rem] w-full items-center justify-center rounded-full bg-[#F97316] px-6 py-3 text-white shadow-[0_6px_16px_rgba(249,115,22,0.24)] transition-colors hover:bg-[#EA580C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316] sm:min-h-[3.35rem]";
  const ctaInner = (
    <span className="inline-flex items-center gap-0.5 text-[16px] font-extrabold tracking-tight sm:text-[17px]">
      내 상황 먼저 확인하기
      <span aria-hidden>›</span>
    </span>
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="relative rounded-[18px] border border-[#3B82F6] bg-white pb-5 pt-10 sm:pb-6 sm:pt-11">
        <div className="absolute left-1/2 top-0 z-10 w-[calc(100%-1.5rem)] -translate-x-1/2 -translate-y-1/2 px-2 sm:w-auto sm:px-0">
          <span className="mx-auto flex max-w-full items-center justify-center gap-1.5 rounded-full bg-[#0B2A6B] px-3.5 py-1.5 text-[11.5px] font-semibold leading-tight text-white sm:gap-2 sm:px-4 sm:py-1.5 sm:text-[12.5px]">
            <Shield className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="break-keep text-center">{trustBadge}</span>
          </span>
        </div>

        <div className="px-4 text-center sm:px-7 lg:px-8">
          <h4 className="mx-auto max-w-xl break-keep text-[16px] font-extrabold leading-[1.45] tracking-tight text-[#0B2A6B] sm:text-[17px]">
            {headline}
          </h4>
        </div>

        <div className="mt-5 px-4 sm:mt-6 sm:px-5 lg:px-6">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-3">
            {steps.map((item) => {
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
            {effects.map((label) => (
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
          {ctaNote}
        </p>
        <div className="flex w-full max-w-[32rem] items-center justify-center gap-2">
          <CtaSpark side="left" />
          {href ? (
            <Link href={href} className={ctaClassName}>
              {ctaInner}
            </Link>
          ) : (
            <button type="button" onClick={onContinue} className={ctaClassName}>
              {ctaInner}
            </button>
          )}
          <CtaSpark side="right" />
        </div>
        <p className="mt-2.5 break-keep text-center text-[12.5px] font-medium leading-[1.55] text-[#EA580C] sm:text-[13px]">
          {ctaSub}
        </p>

        <p className="mt-4 flex w-full items-center justify-center gap-1.5 px-2 text-center">
          <Lock className="h-3.5 w-3.5 shrink-0 text-[#475569]" aria-hidden />
          <span className="break-keep text-[13px] font-medium leading-[1.6] text-[#475569]">
            {lockNote}
          </span>
        </p>

        <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-2">
          {MASTER_FOOTER_TRUST_TAGS.map((item) => {
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

/** Cost Check VERIFY 탭 하단 — 기존 Link 라우팅 유지 */
export function MasterVerifyFunnelVisual({ serviceId }: { serviceId: CostCheckServiceId }) {
  return (
    <MasterFunnelPersuasion
      headline="내 상황을 확인하면, 복잡한 행정문서 문제를 정확히 해결할 수 있습니다."
      steps={MASTER_FUNNEL_STEPS_VERIFY}
      href={getQuoteFunnelHref(serviceId)}
    />
  );
}
