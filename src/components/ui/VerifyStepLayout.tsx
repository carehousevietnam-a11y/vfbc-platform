import type { ReactNode } from "react";
import type { FunnelEngine } from "@/components/engine/funnelTokens";
import OfficialTrustZone from "./OfficialTrustZone";
import { cn } from "@/lib/cn";

interface VerifyStepLayoutProps {
  engine?: FunnelEngine;
  step: 1 | 2 | 3 | 4;
  question: ReactNode;
  actions?: ReactNode;
}

/** VERIFY 모바일 — 짧은 공식 기관 안내 (PC 패널과 분리) */
function VerifyMobileTrustStrip({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5",
        className,
      )}
      aria-label="공식 기준 안내"
    >
      <p className="break-keep text-[10.5px] font-normal leading-snug text-[#64748B]">
        공식 법령·행정자료 기준 확인
      </p>
      <p className="mt-0.5 break-keep text-[10px] font-normal leading-snug text-[#94A3B8]">
        관련 공식 기관: <span className="text-[#64748B]">법무부 · 국회 · 최고인민법원</span>
      </p>
    </div>
  );
}

/**
 * VERIFY 질문 단계별 레이아웃 — Step 1·4는 desktop에서 Trust Zone sidebar,
 * Step 2·3는 질문 아래 얇은 공식 기준 strip.
 */
export default function VerifyStepLayout({
  engine = "verify",
  step,
  question,
  actions,
}: VerifyStepLayoutProps) {
  const isSidebar = step === 1 || step === 4;

  if (isSidebar) {
    const trustContext = step === 4 ? "step4" : "default";
    const trustPanel = (
      <OfficialTrustZone engine={engine} variant="panel" context={trustContext} />
    );
    const mobileTrust = engine === "verify" ? <VerifyMobileTrustStrip /> : trustPanel;

    return (
      <div className="lg:flex lg:items-start lg:gap-5">
        <div className={cn("min-w-0 flex-1 lg:max-w-[700px]")}>
          {question}
          <div className="mt-4 lg:hidden">{mobileTrust}</div>
          {actions}
        </div>
        <div className="mt-4 hidden w-full lg:mt-0 lg:block lg:w-[236px] lg:shrink-0">
          {trustPanel}
        </div>
      </div>
    );
  }

  return (
    <div>
      {question}
      <OfficialTrustZone engine={engine} variant="strip" className="mt-4 sm:mt-5" />
      {actions}
    </div>
  );
}
