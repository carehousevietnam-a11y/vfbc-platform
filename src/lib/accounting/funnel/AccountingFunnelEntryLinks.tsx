"use client";

import Link from "next/link";
import { useCallback } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { ACCOUNTING_FUNNEL_ENTRIES, accountingFunnelHref } from "./entries";
import { AccountingFunnelExpertCta } from "./AccountingFunnelExpertCta";
import { accountingMessage, type AccountingMessageKey } from "../uiCatalog";
import { uiAccountingLocale } from "../localeFormat";

export function AccountingFunnelEntryLinks() {
  const { locale } = useLocale();
  const lang = uiAccountingLocale(locale);
  const t = useCallback((key: AccountingMessageKey) => accountingMessage(lang, key), [lang]);

  return (
    <section
      className="mt-8 rounded-[14px] border border-[#E3E8F0] bg-white p-5"
      data-testid="accounting-funnel-entry-links"
    >
      <h2 className="text-[15px] font-extrabold text-[#071A33]">{t("accounting.funnel.entries.section_title")}</h2>
      <p className="mt-2 text-[14px] leading-6 text-[#3D4B63]">{t("accounting.funnel.entries.section_lead")}</p>
      <ul className="mt-4 flex flex-col gap-2">
        {ACCOUNTING_FUNNEL_ENTRIES.map((entry) => (
          <li key={entry.entryId}>
            <Link
              href={accountingFunnelHref(entry.entryId)}
              className="flex min-h-11 flex-col justify-center rounded-lg border border-[#E3E8F0] px-4 py-3 text-sm font-semibold text-[#2563EB] hover:border-[#071A33]"
              data-testid={`accounting-funnel-entry-link-${entry.entryId}`}
            >
              <span>{t(entry.titleKey)}</span>
              <span className="mt-0.5 text-[13px] font-normal text-[#3D4B63]">{t(entry.leadKey)}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-6 border-t border-[#E3E8F0] pt-5">
        <p className="text-sm font-semibold text-[#071A33]">{t("accounting.funnel.expert.lead")}</p>
        <div className="mt-3">
          <AccountingFunnelExpertCta locale={lang} returnPath="/company/accounting" />
        </div>
      </div>
    </section>
  );
}
