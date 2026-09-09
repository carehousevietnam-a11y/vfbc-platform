"use client";

import type { ReactNode } from "react";
import {
  AlertTriangle,
  ClipboardList,
  ExternalLink,
  FileText,
  UserRound,
} from "lucide-react";
import { COST_CHECK_DISCLAIMER } from "@/lib/costCheck";

/** 행정문서 리뷰 — MASTER_LANDING_ADMIN 공식 URL·문구만 사용 */
const ADMIN_GOVERNMENT_LINKS = [
  {
    name: "국가공공서비스포털",
    url: "https://dichvucong.gov.vn/",
    detail: "출입국·노동·세무 등 행정 서류 관련 안내는 국가공공서비스포털에서 확인할 수 있습니다.",
  },
] as const;

const ADMIN_REVIEW_TARGET = "제출 서류·문서 내용";
const ADMIN_RISK_SUMMARY = "누락·오류·대응 필요";
const ADMIN_RESULT_SUMMARY = "검토 결과 확인";

const NEXT_STEPS = [
  {
    title: "내 상황 자세히 확인하기",
    body: "추가 질문을 통해 내 상황에 맞는 검토·절차·위험을 확인합니다.",
  },
  {
    title: "회원가입",
    body: "진행 상황과 결과를 안전하게 저장할 수 있습니다.",
  },
  {
    title: "문서 업로드",
    body: "행정서류·계약서 등 관련 문서를 올리면 더 정확한 검토가 가능합니다.",
  },
  {
    title: "상세 AI 리포트",
    body: "검토·절차·위험과 권장사항을 포함한 맞춤 결과를 제공합니다.",
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

/** 행정문서 리뷰 Master UI 전용 오른쪽 요약 사이드바 — WpSummarySidebar와 동일 Shell */
export function AdminSummarySidebar({
  excessLabel: _excessLabel,
  onContinue,
  continueEnabled = false,
  procedureLabel = "행정문서",
  reviewTarget = ADMIN_REVIEW_TARGET,
  riskSummary = ADMIN_RISK_SUMMARY,
  resultSummary = ADMIN_RESULT_SUMMARY,
  officialLink = ADMIN_GOVERNMENT_LINKS[0],
}: {
  excessLabel: string | null;
  onContinue: () => void;
  continueEnabled?: boolean;
  procedureLabel?: string;
  reviewTarget?: string;
  riskSummary?: string;
  resultSummary?: string;
  officialLink?: { name: string; url: string; detail: string };
}) {
  return (
    <aside className="hidden h-full w-full flex-col border-t border-[#E5E7EB] bg-[#F8FAFC] p-3.5 lg:flex lg:border-t-0 lg:w-auto lg:p-3">
      <SidebarCard title="한눈에 보기">
        <div className="divide-y divide-[#EEF2F7]">
          <GlanceRow icon={ClipboardList} label="절차" value={procedureLabel} />
          <GlanceRow icon={FileText} label="검토 대상" value={reviewTarget} />
          <GlanceRow icon={AlertTriangle} label="확인 결과" value={resultSummary} />
          <GlanceRow
            icon={UserRound}
            label="주요 위험"
            value={riskSummary}
            tone="risk"
          />
        </div>
      </SidebarCard>

      {officialLink ? (
        <SidebarCard title="관련 정부 기관">
          <ul className="space-y-2.5">
            {[officialLink].map((org) => (
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
              <li key={step.title} className="relative flex gap-2.5 pb-3 last:pb-0 sm:gap-2 sm:pb-2.5">
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
            disabled={!continueEnabled}
            onClick={onContinue}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-[8px] bg-[#0B2A6B] px-4 text-[13px] font-semibold text-white transition hover:bg-[#082258] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-10 sm:text-[12.5px]"
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
    </aside>
  );
}
