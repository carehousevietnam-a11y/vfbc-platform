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
}: QuestionSectionProps) {
  return (
    <div className={cn(className)}>
      <SectionHeader step={step} title={title} description={description} />
      <div className="mt-3">{children}</div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
