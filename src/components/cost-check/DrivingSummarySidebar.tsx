"use client";

import type { ReactNode } from "react";
import {
  AlertTriangle,
  ClipboardList,
  DollarSign,
  ExternalLink,
  UserRound,
} from "lucide-react";
import { COST_CHECK_DISCLAIMER, formatCostAmount } from "@/lib/costCheck";

/**
 * 운전면허 공식 경로 — MASTER_LANDING_DRIVING에 이미 존재하는 URL·문구만 사용.
 * (임의 기관·URL 생성 금지)
 */
const DRIVING_GOVERNMENT_LINKS = [
  {
    name: "교통경찰 공공서비스 포털",
    url: "https://dvc-gplx.csgt.bocongan.gov.vn/",
    detail: "외국인 운전면허 교환 관련 공식 안내는 교통경찰 공공서비스 포털에서 확인할 수 있습니다.",
  },
] as const;

/** 기존 운전면허 위험 문구에서 가져온 짧은 요약 (벌금·법률 확정 표현 없음) */
const DRIVING_RISK_SUMMARY = "반려 · 지연 · 추가 비용";

const NEXT_STEPS = [
  {
    title: "내 상황 자세히 확인하기",
    body: "추가 질문을 통해 내 상황에 맞는 비용·절차·위험을 확인합니다.",
  },
  {
    title: "회원가입",
    body: "진행 상황과 결과를 안전하게 저장할 수 있습니다.",
  },
  {
    title: "문서 업로드",
    body: "견적서·계약서 등 관련 문서를 올리면 더 정확한 확인이 가능합니다.",
  },
  {
    title: "상세 AI 리포트",
    body: "비용·절차·위험과 권장사항을 포함한 맞춤 결과를 제공합니다.",
  },
] as const;

function SidebarCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`mb-2.5 rounded-[6px] border border-[#E5E7EB] bg-white px-3.5 py-3 last:mb-0 sm:mb-2 sm:p-3 ${className}`}
    >
      <h3 className="text-[12px] font-semibold leading-snug text-[#0B2A6B]">{title}</h3>
      <div className="mt-2 flex min-h-0 flex-1 flex-col border-t border-[#E5E7EB] pt-2.5 sm:mt-1.5 sm:pt-2">
        {children}
      </div>
    </section>
  );
}

function GlanceRow({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof ClipboardList;
  label: string;
  value: string;
  tone?: "default" | "warn" | "risk";
}) {
  const iconWrap =
    tone === "warn"
      ? "bg-amber-50 text-amber-700"
      : tone === "risk"
        ? "bg-red-50 text-red-600"
        : "bg-[#EEF2F7] text-[#0B2A6B]";

  return (
    <div className="flex items-start gap-2.5 py-2 first:pt-0 last:pb-0 sm:gap-2 sm:py-1.5">
      <span
        className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${iconWrap}`}
        aria-hidden
      >
        <Icon className="h-3 w-3" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-normal leading-snug text-[#64748B]">{label}</p>
        <p className="mt-0.5 break-keep text-[12.5px] font-medium leading-relaxed text-[#0B2A6B] sm:text-[12px]">
          {value}
        </p>
      </div>
    </div>
  );
}

/**
 * 운전면허 확인하기 Master UI 전용 오른쪽 요약 사이드바.
 * 다른 서비스에서는 사용하지 않음.
 * Mobile(<lg): 미표시 (CTA는 견적서 본문 녹색 카드 아래에 배치)
 * PC(lg+): 기존 요약 사이드바 + CTA 유지
 */
export function DrivingSummarySidebar({
  quotedAmount,
  currency,
  excessLabel,
  onContinue,
}: {
  quotedAmount: number | null;
  currency: "USD" | "VND";
  excessLabel: string | null;
  onContinue: () => void;
}) {
  const hasQuote = quotedAmount != null && quotedAmount > 0;

  return (
    <aside className="hidden h-full w-full flex-col border-t border-[#E5E7EB] bg-[#F8FAFC] p-3.5 lg:flex lg:border-t-0 lg:w-auto lg:p-3">
      <div className="flex min-h-0 flex-1 flex-col">
        <SidebarCard title="한눈에 보기">
          <div className="divide-y divide-[#EEF2F7]">
            <GlanceRow icon={ClipboardList} label="절차" value="운전면허 전환" />
            <GlanceRow
              icon={DollarSign}
              label="받은 견적"
              value={
                hasQuote
                  ? formatCostAmount(quotedAmount, currency)
                  : "입력하면 시장가격과 비교할 수 있습니다"
              }
            />
            <GlanceRow
              icon={AlertTriangle}
              label="과다 가능성"
              value={hasQuote && excessLabel ? excessLabel : "견적 입력 후 확인"}
              tone={
                excessLabel === "높음" || excessLabel === "주의"
                  ? "warn"
                  : "default"
              }
            />
            <GlanceRow
              icon={UserRound}
              label="주요 위험"
              value={DRIVING_RISK_SUMMARY}
              tone="risk"
            />
          </div>
        </SidebarCard>

        {DRIVING_GOVERNMENT_LINKS.length > 0 ? (
          <SidebarCard title="관련 정부 기관">
            <ul className="space-y-2.5">
              {DRIVING_GOVERNMENT_LINKS.map((org) => (
                <li key={org.url} className="min-w-0">
                  <p className="text-[12.5px] font-medium leading-snug text-[#0B2A6B] sm:text-[12px]">
                    {org.name}
                  </p>
                  {org.detail ? (
                    <p className="mt-1 break-keep text-[11.5px] leading-relaxed text-[#64748B] sm:mt-0.5 sm:text-[11px]">
                      {org.detail}
                    </p>
                  ) : null}
                  <a
                    href={org.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] font-medium text-[#2563EB] hover:underline sm:mt-1 sm:text-[11px]"
                  >
                    공식 웹사이트
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </SidebarCard>
        ) : null}

        <SidebarCard title="면책 안내" className="border-[#D6E4FB] bg-[#F5F8FF]">
          <p className="break-keep text-[11.5px] leading-[1.7] text-[#475569] sm:text-[11px] sm:leading-[1.65]">
            {COST_CHECK_DISCLAIMER}
          </p>
        </SidebarCard>

        <SidebarCard title="다음 단계" className="flex min-h-0 flex-1 flex-col">
          <ol className="relative ml-0.5 space-y-0 sm:ml-1">
            {NEXT_STEPS.map((step, index) => {
              const isLast = index === NEXT_STEPS.length - 1;
              return (
                <li
                  key={step.title}
                  className="relative flex gap-2.5 pb-3 last:pb-0 sm:gap-2 sm:pb-2.5"
                >
                  {!isLast ? (
                    <span
                      className="absolute left-[9px] top-5 bottom-0 w-px bg-[#D8DEE8]"
                      aria-hidden
                    />
                  ) : null}
                  <span className="relative z-[1] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0B2A6B] text-[10px] font-semibold text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-[12px] font-medium leading-snug text-[#0B2A6B] sm:text-[11.5px]">
                      {step.title}
                    </p>
                    <p className="mt-1 break-keep text-[11px] leading-relaxed text-[#64748B] sm:mt-0.5 sm:text-[10.5px]">
                      {step.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-auto pt-3.5 sm:pt-3">
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-[8px] bg-[#0B2A6B] px-4 text-[13px] font-semibold text-white transition hover:bg-[#082258] sm:min-h-10 sm:text-[12.5px]"
            >
              내 상황 자세히 확인하기 →
            </button>
            <button
              type="button"
              className="mt-2 inline-flex min-h-10 w-full items-center justify-center rounded-[8px] border border-[#D8DEE8] bg-white px-4 text-[12.5px] font-medium text-[#0B2A6B] sm:mt-1.5 sm:min-h-9 sm:text-[12px]"
            >
              이 결과 공유하기
            </button>
          </div>
        </SidebarCard>
      </div>
    </aside>
  );
}
