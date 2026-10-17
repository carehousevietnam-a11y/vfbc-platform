"use client";

import { accountingMessage, type AccountingLocale } from "./uiCatalog";

const SHIELD_SRC = "/vfbcai-shield-logo.png";

type Props = {
  locale: AccountingLocale;
  variant: "header" | "hub";
};

export function AccountingBrandLockup({ locale, variant }: Props) {
  const title = accountingMessage(locale, "accounting.shell.brand_title");
  const tagline = accountingMessage(locale, "accounting.shell.brand_tagline");
  const shield = variant === "hub" ? 44 : 32;

  return (
    <div
      className={`flex items-center justify-center gap-2.5 ${variant === "hub" ? "min-h-[60px]" : ""}`}
      data-testid={variant === "hub" ? "accounting-home-hub-brand" : "accounting-shell-brand"}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- Admin MASTER shield asset; colors/ratio fixed */}
      <img
        src={SHIELD_SRC}
        alt=""
        width={shield}
        height={shield}
        className="shrink-0"
        data-testid={variant === "hub" ? "accounting-home-hub-shield" : "accounting-shell-shield"}
      />
      <span className="text-left">
        <span
          className={`block font-bold leading-tight text-[#071A33] ${
            variant === "hub" ? "text-[18px] tracking-[-0.02em] sm:text-[20px]" : "text-[15px] tracking-[-0.02em]"
          }`}
        >
          {title}
        </span>
        <span className="block text-[11px] leading-tight text-[#6B7A90]">{tagline}</span>
      </span>
    </div>
  );
}
