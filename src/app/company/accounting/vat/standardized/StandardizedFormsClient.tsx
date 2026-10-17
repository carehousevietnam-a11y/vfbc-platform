"use client";

import { useCallback } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { AccountingTaxSubnav } from "@/lib/accounting/AccountingTaxSubnav";
import { accountingMessage, type AccountingLocale, type AccountingMessageKey } from "@/lib/accounting/uiCatalog";
import { uiAccountingLocale } from "@/lib/accounting/localeFormat";

export type StandardizedFormListItem = {
  id: string;
  form_code: string;
  name_ko: string;
  name_vi: string;
  verified_status: string;
  submitEnabled: boolean;
};

type Props = {
  forms: StandardizedFormListItem[];
  loadError: string | null;
};

function displayName(locale: AccountingLocale, row: StandardizedFormListItem): string {
  return locale === "vi" ? row.name_vi : row.name_ko;
}

export default function StandardizedFormsClient({ forms, loadError }: Props) {
  const { locale } = useLocale();
  const lang = uiAccountingLocale(locale);
  const t = useCallback((key: AccountingMessageKey) => accountingMessage(lang, key), [lang]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8" data-testid="standardized-forms-page">
      <h1 className="text-[22px] font-extrabold tracking-[-0.03em] sm:text-[28px]">{t("accounting.standardized.title")}</h1>
      <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#3D4B63]">{t("accounting.standardized.lead")}</p>
      <p className="mt-2 text-[13px] font-medium text-[#6B7A90]">{t("accounting.standardized.disclaimer")}</p>

      <AccountingTaxSubnav />

      {loadError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{t("accounting.standardized.load_error")}</p>
      ) : null}

      {forms.length === 0 ? (
        <div
          className="mt-4 rounded-xl border border-dashed border-[#D5DEEA] bg-[#F8FAFC] px-4 py-10 text-center"
          data-testid="standardized-empty-state"
        >
          <p className="text-[15px] font-semibold text-[#3D4B63]">{t("accounting.standardized.empty.title")}</p>
          <p className="mt-2 text-[14px] leading-6 text-[#6B7A90]">{t("accounting.standardized.empty.lead")}</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3" data-testid="standardized-form-list">
          {forms.map((row) => (
            <li
              key={row.id}
              className="flex flex-col gap-1 rounded-xl border border-[#E4E9F0] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-[15px] font-semibold text-[#071A33]">{displayName(lang, row)}</p>
                <p className="mt-1 text-[13px] text-[#6B7A90]">{t("accounting.standardized.row.unverified")}</p>
              </div>
              <span className="inline-flex min-h-9 items-center rounded-lg bg-[#F4F7FB] px-3 text-xs font-semibold text-[#3D4B63]">
                {t("accounting.standardized.row.draft_only")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
