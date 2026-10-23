"use client";

import { accountingMessage, type AccountingLocale, type AccountingMessageKey } from "./uiCatalog";
import { useAccountingCatalogLocale } from "./AccountingCatalogLocale";

export function AccountingLocaleSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, ready } = useAccountingCatalogLocale();
  const t = (key: AccountingMessageKey) => accountingMessage(locale, key);

  if (!ready) return null;

  const btn = (next: AccountingLocale, labelKey: AccountingMessageKey, testId: string) => (
    <button
      type="button"
      className={`min-h-9 rounded-lg px-3 text-xs font-semibold ${
        locale === next ? "bg-[#071A33] text-white" : "bg-[#F7F9FC] text-[#3D4B63] border border-[#E3E8F0]"
      }`}
      data-testid={testId}
      onClick={() => void setLocale(next)}
    >
      {t(labelKey)}
    </button>
  );

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} data-testid="accounting-header-locale">
      <span className="text-xs font-semibold text-[#6B7A90]">{t("accounting.locale.header_label")}</span>
      {btn("ko", "accounting.funnel.locale.ko", "accounting-header-locale-ko")}
      {btn("vi", "accounting.funnel.locale.vi", "accounting-header-locale-vi")}
    </div>
  );
}
