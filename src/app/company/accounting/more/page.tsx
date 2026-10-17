"use client";

import Link from "next/link";
import { useCallback } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { accountingMessage, type AccountingMessageKey } from "@/lib/accounting/uiCatalog";
import { uiAccountingLocale } from "@/lib/accounting/localeFormat";
import { ACCOUNTING_MORE_PAGE_LINKS, ACCOUNTING_ROUTES, type AccountingNavKey } from "@/lib/accounting/accountingNav";

const LABEL: Record<AccountingNavKey, AccountingMessageKey> = {
  home: "accounting.nav.home",
  transactions: "accounting.nav.transactions",
  ledger: "accounting.nav.ledger",
  tax: "accounting.nav.tax",
  filing: "accounting.nav.filing",
  evidence: "accounting.nav.evidence",
  company: "accounting.nav.company",
  pending: "accounting.workspace.pending.title",
  more: "accounting.nav.more",
};

export default function AccountingMorePage() {
  const { locale } = useLocale();
  const lang = uiAccountingLocale(locale);
  const t = useCallback((key: AccountingMessageKey) => accountingMessage(lang, key), [lang]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8" data-testid="accounting-more">
      <h1 className="text-[22px] font-extrabold tracking-[-0.03em]">{t("accounting.nav.more")}</h1>
      <p className="mt-2 text-[14px] leading-6 text-[#3D4B63]">{t("accounting.home.more.lead")}</p>
      <ul className="mt-6 flex flex-col gap-2">
        {ACCOUNTING_MORE_PAGE_LINKS.map((key) => (
          <li key={key}>
            <Link
              href={ACCOUNTING_ROUTES[key]}
              className="flex min-h-11 items-center rounded-lg border border-[#E3E8F0] bg-white px-4 text-sm font-semibold text-[#2563EB]"
            >
              {t(LABEL[key])}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
