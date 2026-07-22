import { cn } from "@/lib/cn";

interface StepBadgeProps {
  step: number | string;
  className?: string;
}

/**
 * VFBCAI 공통 UI — 질문/섹션 앞에 붙는 작은 단계 배지.
 * 예: ● 1, ● 2 ...
 */
export default function StepBadge({ step, className }: StepBadgeProps) {
  return (
    <span
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-900 text-[11px] font-bold text-white",
        className
      )}
    >
      {step}
    </span>
  );
}
