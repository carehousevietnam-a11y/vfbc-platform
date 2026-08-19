"use client";

import { RotateCcw } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type ResultHeaderProps = {
  onReset: () => void;
  categoryLabel?: string;
  modeLabel?: string;
  serviceLabel?: string;
};

export function ResultHeader({
  onReset,
  categoryLabel,
  modeLabel,
  serviceLabel,
}: ResultHeaderProps) {
  const { t } = useLocale();
  return (
    <header className="mt-4 flex items-start justify-between gap-4">
      <div>
        <p className="text-[13px] font-semibold leading-snug tracking-tight text-blue-900 sm:text-[14px]">
          MY VIET CHECK
          <span className="ml-1.5 font-medium text-slate-400">· by VFBCAI</span>
        </p>
        {(categoryLabel || modeLabel || serviceLabel) && (
          <p className="mt-1.5 break-keep text-[13px] text-slate-500">
            {[categoryLabel, modeLabel, serviceLabel].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-3 text-[13px] font-medium text-slate-500 transition-colors hover:bg-white hover:text-blue-900"
      >
        <RotateCcw size={14} />
        <span className="hidden sm:inline">{t("result.reset")}</span>
        <span className="sm:hidden">{t("result.resetShort")}</span>
      </button>
    </header>
  );
}
