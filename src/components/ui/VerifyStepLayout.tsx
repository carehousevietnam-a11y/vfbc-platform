import type { ReactNode } from "react";
import OfficialTrustZone from "./OfficialTrustZone";
import { cn } from "@/lib/cn";

interface VerifyStepLayoutProps {
  step: 1 | 2 | 3 | 4;
  question: ReactNode;
  actions?: ReactNode;
}

/**
 * VERIFY 질문 단계별 레이아웃 — Step 1·4는 desktop에서 Trust Zone sidebar,
 * Step 2·3는 질문 아래 얇은 공식 기준 strip.
 */
export default function VerifyStepLayout({ step, question, actions }: VerifyStepLayoutProps) {
  const isSidebar = step === 1 || step === 4;

  if (isSidebar) {
    const trustContext = step === 4 ? "step4" : "default";
    const trustPanel = <OfficialTrustZone variant="panel" context={trustContext} />;

    return (
      <div className="lg:flex lg:items-start lg:gap-5">
        <div className={cn("min-w-0 flex-1 lg:max-w-[700px]")}>
          {question}
          <div className="mt-4 lg:hidden">{trustPanel}</div>
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
      <OfficialTrustZone variant="strip" className="mt-4 sm:mt-5" />
      {actions}
    </div>
  );
}
