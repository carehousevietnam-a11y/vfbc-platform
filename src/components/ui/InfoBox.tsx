import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Info } from "lucide-react";
import { cn } from "@/lib/cn";

interface InfoBoxProps {
  children: ReactNode;
  icon?: LucideIcon;
  className?: string;
}

/**
 * VFBCAI 공통 UI — 카드/버튼 아래 붙는 아주 작은 회색 보조 설명 한 줄.
 * (배경·테두리가 있는 NoticeCard와 달리 여백만 있는 가벼운 caption용)
 */
export default function InfoBox({
  children,
  icon: Icon = Info,
  className,
}: InfoBoxProps) {
  return (
    <div className={cn("flex items-start gap-1.5 text-xs text-gray-400", className)}>
      <Icon className="mt-0.5 shrink-0" size={13} />
      <span className="break-keep leading-relaxed">{children}</span>
    </div>
  );
}
