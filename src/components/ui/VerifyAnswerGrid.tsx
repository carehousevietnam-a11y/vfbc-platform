import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type VerifyAnswerGridStep = 1 | 2 | 3;

interface VerifyAnswerGridProps {
  step: VerifyAnswerGridStep;
  children: ReactNode;
  className?: string;
}

/**
 * VERIFY 질문 단계별 답변 카드 grid.
 * Step 1 (2) · Step 2 (8) · Step 3 (6) 선택지 수와 텍스트 길이에 맞춘 responsive layout.
 */
const STEP_GRID: Record<VerifyAnswerGridStep, string> = {
  // 2 options — PC 2열, inner 폭 제한으로 960px 전체를 채우지 않음
  1: "grid w-full max-w-lg grid-cols-1 gap-2.5 sm:grid-cols-2",
  // 8 options — 960px 활용, PC 4열 × 2행
  2: "grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4",
  // 6 options — PC 3열 × 2행
  3: "grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3",
};

export default function VerifyAnswerGrid({ step, children, className }: VerifyAnswerGridProps) {
  return (
    <div className={cn(STEP_GRID[step], "[&>button]:h-full", className)}>
      {children}
    </div>
  );
}
