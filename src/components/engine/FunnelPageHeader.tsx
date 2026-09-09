import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  FUNNEL_DESC,
  FUNNEL_EYEBROW,
  FUNNEL_H1,
  FUNNEL_REGISTER_DESC,
  FUNNEL_REGISTER_H1,
  FUNNEL_REGISTER_LOOKUP_DESC,
  FUNNEL_ENGINE_COPY,
  REGISTER_LOOKUP_HERO_DESCRIPTION,
  type FunnelEngine,
} from "./funnelTokens";

type FunnelPageHeaderProps = {
  engine: FunnelEngine;
  title: string;
  description: string;
  headerExtra?: ReactNode;
  className?: string;
  /** TRC Master 등 — Mobile 전용 description Typography override */
  descriptionClassName?: string;
};

/**
 * CHECK / VERIFY / REGISTER funnel 공통 헤더 — 브랜드·전문영역·Hero 위계 통일.
 */
export default function FunnelPageHeader({
  engine,
  title,
  description,
  headerExtra,
  className,
  descriptionClassName,
}: FunnelPageHeaderProps) {
  const copy = FUNNEL_ENGINE_COPY[engine];
  const isRegister = engine === "register";
  const isRegisterLookupDesc =
    isRegister && description === REGISTER_LOOKUP_HERO_DESCRIPTION;

  return (
    <div className={cn(isRegister && "sm:pt-6", className)}>
      <Link
        href="/"
        prefetch={false}
        className={cn(
          "relative -mx-4 mb-6 flex items-center justify-center gap-2.5 border-b border-gray-100 bg-white px-4 py-3 sm:hidden",
          "-mt-10"
        )}
      >
        <span className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-1 text-xs font-medium text-gray-400">
          <span aria-hidden>←</span>
          <span>홈으로</span>
        </span>
        <img
          src="/vfbcai-shield-logo.png"
          alt="VFBCAI"
          width={34}
          height={34}
          className="shrink-0"
        />
        <span className="text-center">
          <span className="block text-[15px] font-bold leading-tight text-gray-900">VFBCAI</span>
          <span className="block text-[11px] leading-tight text-gray-400">{copy.expert}</span>
        </span>
      </Link>

      <Link
        href="/"
        prefetch={false}
        className="hidden items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600 sm:inline-flex"
      >
        <span className="inline-flex items-center gap-1">
          <span aria-hidden>←</span>
          <span>홈으로</span>
        </span>
      </Link>

      <div
        className={cn(
          "flex items-start justify-between gap-3",
          isRegister
            ? "mt-4 pt-5 pb-2.5 sm:mt-5 sm:pt-6 sm:pb-3.5"
            : "mt-3 sm:mt-4"
        )}
      >
        <div className="min-w-0">
          <p className={FUNNEL_EYEBROW}>{copy.eyebrow}</p>
          <h1 className={cn("mt-1.5", isRegister ? FUNNEL_REGISTER_H1 : FUNNEL_H1)}>
            {title}
          </h1>
          <p
            className={cn(
              isRegister ? "mt-2.5 sm:mt-3" : "mt-0.5",
              descriptionClassName ??
                (isRegisterLookupDesc
                  ? FUNNEL_REGISTER_LOOKUP_DESC
                  : isRegister
                    ? FUNNEL_REGISTER_DESC
                    : FUNNEL_DESC)
            )}
          >
            {description}
          </p>
        </div>
        {headerExtra ? <div className="shrink-0">{headerExtra}</div> : null}
      </div>
    </div>
  );
}
