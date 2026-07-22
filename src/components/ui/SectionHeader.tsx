import { cn } from "@/lib/cn";
import StepBadge from "./StepBadge";

interface SectionHeaderProps {
  step?: number | string;
  title: string;
  description?: string;
  className?: string;
}

/**
 * VFBCAI 공통 UI — 질문/섹션 제목 영역.
 * ● 1  현재 어떤 상황인가요?
 *      작은 회색 설명
 */
export default function SectionHeader({
  step,
  title,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn(className)}>
      <div className="flex items-center gap-2.5">
        {step !== undefined && <StepBadge step={step} />}
        <h3 className="break-keep text-base font-semibold text-gray-900">
          {title}
        </h3>
      </div>
      {description && (
        <p
          className={cn(
            "mt-1.5 break-keep text-sm leading-relaxed text-slate-500",
            step !== undefined && "pl-[34px]"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
