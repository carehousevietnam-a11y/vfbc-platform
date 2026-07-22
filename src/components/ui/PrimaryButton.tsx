"use client";

import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "outline";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: ButtonVariant;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-blue-900 text-white hover:bg-blue-950 hover:shadow-md",
  secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  outline: "border border-blue-900 bg-white text-blue-900 hover:bg-blue-50",
};

/**
 * VFBCAI 공통 버튼 — 높이 52px, rounded-xl, shadow, hover, loading/disabled 지원.
 */
export default function PrimaryButton({
  loading = false,
  variant = "primary",
  disabled,
  className,
  children,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-sm",
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={18} />}
      {children}
    </button>
  );
}
