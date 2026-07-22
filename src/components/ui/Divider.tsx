import { cn } from "@/lib/cn";

interface DividerProps {
  className?: string;
}

/**
 * VFBCAI 공통 UI — 섹션 사이 얇은 구분선 (기본 상하 28px 여백).
 */
export default function Divider({ className }: DividerProps) {
  return <div className={cn("my-7 border-t border-gray-100", className)} />;
}
