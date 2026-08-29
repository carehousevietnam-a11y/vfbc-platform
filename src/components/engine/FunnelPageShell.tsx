import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  FUNNEL_PAGE,
  FUNNEL_TOP_BAR,
  funnelContainerClass,
  type FunnelEngine,
} from "./funnelTokens";

type FunnelPageShellProps = {
  engine: FunnelEngine;
  width?: "default" | "wide";
  children: ReactNode;
  className?: string;
};

/**
 * CHECK / VERIFY / REGISTER funnel 공통 페이지 셸 — 배경·컨테이너·상단 바 통일.
 */
export default function FunnelPageShell({
  width = "default",
  children,
  className,
}: FunnelPageShellProps) {
  return (
    <main className={cn(FUNNEL_PAGE, className)}>
      <div className={FUNNEL_TOP_BAR} />
      <div className={funnelContainerClass(width)}>{children}</div>
    </main>
  );
}
