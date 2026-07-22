import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

interface StatusBadgeProps {
  children: ReactNode;
  tone?: StatusTone;
  className?: string;
}

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: "bg-gray-100 text-gray-600",
  info: "bg-blue-50 text-blue-800",
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
};

/**
 * VFBCAI 공통 UI — 상태 표시 pill 배지. (예: 검토중 / 완료 / 반려 / 대기)
 * Admin 리드 목록, Customer 진행상태 등에서 공통 사용.
 */
export default function StatusBadge({
  children,
  tone = "neutral",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
