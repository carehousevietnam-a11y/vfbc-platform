"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type NextStepProps = {
  funnelHref: string;
  funnelLabel?: string;
  showExpertCta?: boolean;
  compact?: boolean;
  extraHref?: string;
  extraLabel?: string;
};

export function NextStep({
  funnelHref,
  funnelLabel,
  showExpertCta = true,
  compact = false,
  extraHref,
  extraLabel,
}: NextStepProps) {
  const { t } = useLocale();
  const cardClass = compact
    ? "mt-2 rounded-2xl bg-blue-900 px-4 py-4 sm:px-5 sm:py-5"
    : "mt-3 rounded-2xl bg-blue-900 px-5 py-6 sm:px-7 sm:py-7";
  const headlineClass = compact
    ? "text-[15px] font-semibold text-white sm:text-base"
    : "text-lg font-semibold text-white sm:text-xl lg:text-[22px]";
  const bodyClass = compact
    ? "mt-1.5 max-w-2xl text-[13px] leading-relaxed text-blue-100"
    : "mt-2.5 max-w-2xl text-[15px] leading-relaxed text-blue-100 sm:text-base";
  const optionalClass = compact
    ? "mt-1.5 max-w-2xl text-[12px] leading-relaxed text-blue-200/90"
    : "mt-2 max-w-2xl text-[13px] leading-relaxed text-blue-200/90 sm:text-sm";
  const actionsClass = compact
    ? "mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
    : "mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap";
  const primaryClass = compact
    ? "inline-flex min-h-10 flex-1 items-center justify-center rounded-xl bg-white px-4 py-2 text-[14px] font-semibold text-blue-900 transition-colors hover:bg-blue-50 sm:min-w-[180px] sm:flex-none"
    : "inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-white px-6 py-3 text-[15px] font-semibold text-blue-900 transition-colors hover:bg-blue-50 sm:min-w-[200px] sm:flex-none sm:text-base";
  const secondaryClass = compact
    ? "inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-white/15 sm:min-w-[140px] sm:flex-none"
    : "inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/15 sm:min-w-[160px] sm:flex-none sm:text-base";

  return (
    <section className={compact ? "mt-5" : "mt-6"} aria-labelledby="next-step-heading">
      <h2
        id="next-step-heading"
        className={compact ? "text-[13px] font-semibold text-blue-900" : "text-[15px] font-semibold text-blue-900"}
      >
        {t("result.nextStep")}
      </h2>
      <div className={cardClass}>
        <p className={headlineClass}>{t("result.nextHeadline")}</p>
        <p className={bodyClass}>{t("result.nextBody")}</p>
        <p className={optionalClass}>{t("result.nextOptional")}</p>
        <div className={actionsClass}>
          <Link href={funnelHref} className={primaryClass}>
            {funnelLabel ?? t("result.nextCta")}
          </Link>
          {extraHref && extraLabel ? (
            <Link href={extraHref} className={secondaryClass}>
              {extraLabel}
            </Link>
          ) : showExpertCta ? (
            <Link href="/consultation" className={secondaryClass}>
              {t("result.expertCta")}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
