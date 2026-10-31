"use client";

import Link from "next/link";
import { useCallback } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { accountingMessage, type AccountingMessageKey } from "./uiCatalog";
import { uiAccountingLocale } from "./localeFormat";
import { ACCOUNTING_ROUTES } from "./accountingNav";

type Props = {
  titleKey: AccountingMessageKey;
  leadKey?: AccountingMessageKey;
};

export function AccountingPlaceholderClient({ titleKey, leadKey }: Props) {
  const { locale } = useLocale();
  const lang = uiAccountingLocale(locale);
  const t = useCallback((key: AccountingMessageKey) => accountingMessage(lang, key), [lang]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-[22px] font-extrabold tracking-[-0.03em] sm:text-[28px]">{t(titleKey)}</h1>
      <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#3D4B63]">
        {t(leadKey ?? "accounting.placeholder.lead")}
      </p>
      <Link
        href={ACCOUNTING_ROUTES.transactions}
        className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-[#071A33] px-4 text-sm font-semibold text-white"
      >
        {t("accounting.home.cta.transactions")}
      </Link>
    </main>
  );
}
