import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface ResultCardProps {
  title?: string;
  icon?: LucideIcon;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * VFBCAI 공통 UI — AI 분석 리포트/진단 결과 등 콘텐츠를 담는 카드 컨테이너.
 */
export default function ResultCard({
  title,
  icon: Icon,
  footer,
  children,
  className,
}: ResultCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
        className
      )}
    >
      {title && (
        <div className="mb-3 flex items-center gap-2">
          {Icon && <Icon className="text-blue-900" size={16} />}
          <p className="break-keep text-sm font-bold text-gray-900">{title}</p>
        </div>
      )}
      <div className="break-keep text-sm leading-relaxed text-gray-700">
        {children}
      </div>
      {footer && (
        <div className="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-400">
          {footer}
        </div>
      )}
    </div>
  );
}
