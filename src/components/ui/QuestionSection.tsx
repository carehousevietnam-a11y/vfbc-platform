import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import SectionHeader from "./SectionHeader";

interface QuestionSectionProps {
  step?: number | string;
  title: string;
  description?: string;
  error?: string | null;
  children: ReactNode;
  className?: string;
  /** VERIFY 질문 흐름 — progress, context, editorial typography */
  variant?: "default" | "verify";
  contextLabel?: string;
  totalSteps?: number;
  /** VERIFY Step 4 — 질문·입력·첨부가 동일 폭 content axis 사용 */
  fullWidthHeader?: boolean;
  /** VERIFY Stitch SCREEN — progress를 섹션 헤더 아래에 두고 대형 타이틀 */
  layout?: "default" | "stitch";
}

/**
 * VFBCAI 공통 UI — 질문 1개 단위 섹션(제목+설명+선택영역+에러메시지)을
 * 표준화한 래퍼. CHECK/VERIFY/REGISTER의 STEP1류 질문에서 공통 사용.
 */
export default function QuestionSection({
  step,
  title,
  description,
  error,
  children,
  className,
  variant = "default",
  contextLabel,
  totalSteps,
  fullWidthHeader = false,
  layout = "default",
}: QuestionSectionProps) {
  const stepNumber = step !== undefined ? Number(step) : undefined;
  const progressPercent =
    stepNumber && totalSteps ? Math.min(100, Math.round((stepNumber / totalSteps) * 100)) : 0;
  const isStitchLayout = variant === "verify" && layout === "stitch";

  if (variant === "verify") {
    return (
      <div className={cn(className)}>
        {!isStitchLayout ? (
          <div className="mb-2">
            {contextLabel ? (
              <p className="text-[10.5px] font-semibold tracking-[0.03em] text-[#2563EB]">
                {contextLabel}
              </p>
            ) : null}
            {stepNumber && totalSteps ? (
              <div className={cn("flex items-center gap-2", contextLabel && "mt-1.5")}>
                <span className="shrink-0 text-[11px] font-semibold tabular-nums text-[#0B2A6B]">
                  {String(stepNumber).padStart(2, "0")} / {String(totalSteps).padStart(2, "0")}
                </span>
                <div className="h-[2.5px] w-[7.25rem] shrink-0 overflow-hidden rounded-full bg-[#E8ECF2] sm:w-[8rem]">
                  <div
                    className="h-full rounded-full bg-[#0B2A6B] transition-[width] duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {isStitchLayout ? (
          <>
            <div className="mb-5 lg:mb-6">
              <h3 className="break-keep text-[20px] font-bold leading-snug tracking-tight text-[#0f172a] sm:text-[22px] lg:text-[24px]">
                {title}
              </h3>
              {description ? (
                <p className="mt-1 break-keep text-[12.5px] leading-normal text-slate-500 [overflow-wrap:normal] lg:hidden">
                  {description}
                </p>
              ) : null}
            </div>
            <div className="w-full min-w-0">{children}</div>
          </>
        ) : (
          <>
            <h3
              className={cn(
                "break-keep tracking-tight",
                "text-[15px] font-semibold leading-[1.4] text-[#0B2A6B] sm:text-[16px]",
                fullWidthHeader ? "max-w-none" : "max-w-[20rem] sm:max-w-[24rem]",
              )}
            >
              {title}
            </h3>
            {description ? (
              <p
                className={cn(
                  "mt-1 break-keep text-[12px] leading-[1.55] text-[#556070] [overflow-wrap:normal]",
                  fullWidthHeader ? "max-w-none" : "max-w-[26rem]",
                )}
              >
                {description}
              </p>
            ) : null}
            <div className="mt-3 w-full min-w-0">{children}</div>
          </>
        )}
        {error ? <p className="mt-2 text-[13px] text-red-600">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className={cn(className)}>
      <SectionHeader step={step} title={title} description={description} />
      <div className="mt-3">{children}</div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
