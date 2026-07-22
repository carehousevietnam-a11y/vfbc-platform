import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Info, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";

type NoticeTone = "info" | "warning" | "danger" | "success";

interface NoticeCardProps {
  tone?: NoticeTone;
  title?: string;
  children: ReactNode;
  icon?: LucideIcon;
  className?: string;
}

const TONE_STYLES: Record<
  NoticeTone,
  { bg: string; border: string; text: string; icon: LucideIcon }
> = {
  info: { bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-900", icon: Info },
  warning: { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-800", icon: AlertTriangle },
  danger: { bg: "bg-red-50", border: "border-red-100", text: "text-red-700", icon: AlertCircle },
  success: { bg: "bg-green-50", border: "border-green-100", text: "text-green-800", icon: CheckCircle2 },
};

/**
 * VFBCAI 공통 UI — 안내(파랑)/경고(노랑)/위험(빨강)/완료(초록) 4종 알림 박스.
 */
export default function NoticeCard({
  tone = "info",
  title,
  children,
  icon,
  className,
}: NoticeCardProps) {
  const style = TONE_STYLES[tone];
  const Icon = icon ?? style.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl border p-4",
        style.bg,
        style.border,
        className
      )}
    >
      <Icon className={cn("mt-0.5 shrink-0", style.text)} size={18} />
      <div className="min-w-0">
        {title && (
          <p className={cn("break-keep text-sm font-semibold", style.text)}>
            {title}
          </p>
        )}
        <div
          className={cn(
            "break-keep text-sm leading-relaxed opacity-90",
            style.text,
            title && "mt-0.5"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
