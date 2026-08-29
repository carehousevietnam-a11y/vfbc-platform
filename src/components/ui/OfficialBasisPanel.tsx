import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { FunnelEngine } from "@/components/engine/funnelTokens";

type BasisSection = {
  title: string;
  description: string;
};

const BASIS_COPY: Record<
  FunnelEngine,
  { title: string; subtitle: string; footer: string }
> = {
  check: {
    title: "베트남 공식 행정 기준·체크리스트",
    subtitle: "베트남 공식 행정 기준·체크리스트를 우선 참고하여 확인했습니다.",
    footer: "확인 기준: 공식 행정 기준 · 체크리스트 · 유사 사례",
  },
  verify: {
    title: "공식 법령·법률자료 기준 확인",
    subtitle: "베트남 공식 법령·법률자료를 검토 기준으로 참고합니다.",
    footer: "검토 시점의 공식 자료를 참고합니다.",
  },
  register: {
    title: "인허가 절차·요건 확인",
    subtitle: "입력하신 조건을 기준으로 인허가 절차·요건을 확인했습니다.",
    footer: "관할 기관·제출 서류에 따라 달라질 수 있습니다.",
  },
};

interface OfficialBasisPanelProps {
  engine: FunnelEngine;
  sections: BasisSection[];
  className?: string;
  footer?: ReactNode;
}

/**
 * 결과 화면 공식 기준 패널 — OfficialTrustZone과 동일한 Government-first 시각 언어.
 */
export default function OfficialBasisPanel({
  engine,
  sections,
  className,
  footer,
}: OfficialBasisPanelProps) {
  const copy = BASIS_COPY[engine];

  return (
    <div
      className={cn(
        "mt-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-3.5",
        className,
      )}
      aria-label="공식 기준 확인"
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8]">
        OFFICIAL SOURCES
      </p>
      <p className="mt-1.5 break-keep text-[12.5px] font-semibold text-[#0B2A6B]">{copy.title}</p>
      <p className="mt-1 break-keep text-[11.5px] leading-[1.55] text-[#556070] [overflow-wrap:normal]">
        {copy.subtitle}
      </p>

      <div className="mt-3 space-y-0">
        {sections.map((section, idx) => (
          <div
            key={section.title}
            className={idx === 0 ? "pb-3" : "border-t border-[#E2E8F0] py-3"}
          >
            <p className="text-xs font-semibold text-[#0B2A6B]">{section.title}</p>
            <p className="mt-1.5 text-[11.5px] leading-[1.55] text-[#556070]">
              {section.description}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-1 border-t border-[#E2E8F0] pt-3 text-[10.5px] leading-[1.55] text-[#94A3B8]">
        {footer ?? copy.footer}
      </p>
    </div>
  );
}
