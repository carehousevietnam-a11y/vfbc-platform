"use client";

import Link from "next/link";
import { useCallback } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { ACCOUNTING_ROUTES } from "@/lib/accounting/accountingNav";
import { accountingMessage, type AccountingMessageKey } from "@/lib/accounting/uiCatalog";
import { uiAccountingLocale } from "@/lib/accounting/localeFormat";

export default function AccountingPendingClient() {
  const { locale } = useLocale();
  const lang = uiAccountingLocale(locale);
  const t = useCallback((key: AccountingMessageKey) => accountingMessage(lang, key), [lang]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8" data-testid="accounting-workspace-pending-approval">
      <h1 className="text-[22px] font-extrabold tracking-[-0.03em]">{t("accounting.workspace.pending.title")}</h1>
      <p className="mt-3 text-[14px] leading-6 text-[#3D4B63]">{t("accounting.workspace.pending.lead")}</p>
      <Link
        href={ACCOUNTING_ROUTES.home}
        className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-[#2563EB]"
      >
        {t("accounting.onboard.back_home")}
      </Link>
    </main>
  );
}
