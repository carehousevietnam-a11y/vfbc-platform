import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * VFBCAI 공통 UI — 목록이 비어있을 때 표시하는 상태 화면.
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center",
        className
      )}
    >
      <Icon className="text-gray-300" size={32} />
      <p className="mt-4 break-keep text-sm font-semibold text-gray-900">
        {title}
      </p>
      {description && (
        <p className="mt-1.5 max-w-xs break-keep text-sm leading-relaxed text-slate-500">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
