"use client";

import { useCallback } from "react";
import { accountingMessage, type AccountingLocale, type AccountingMessageKey } from "./uiCatalog";
import {
  type AccountingFormViewMode,
  saveFormViewMode,
} from "./accountingFormViewMode";

type Props = {
  locale: AccountingLocale;
  userId: string | null;
  mode: AccountingFormViewMode;
  onChange: (mode: AccountingFormViewMode) => void;
};

export function AccountingFormViewBar({ locale, userId, mode, onChange }: Props) {
  const t = useCallback((key: AccountingMessageKey) => accountingMessage(locale, key), [locale]);

  function setMode(next: AccountingFormViewMode) {
    saveFormViewMode(userId, next);
    onChange(next);
  }

  const btn = (next: AccountingFormViewMode, labelKey: AccountingMessageKey) => (
    <button
      type="button"
      onClick={() => setMode(next)}
      className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
        mode === next ? "bg-[#071A33] text-white" : "bg-[#F4F6FA] text-[#3D4B63]"
      }`}
      data-testid={`accounting-view-mode-${next}`}
    >
      {t(labelKey)}
    </button>
  );

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-lg border border-[#E3E8F0] bg-white px-3 py-2"
      data-testid="accounting-form-view-bar"
    >
      <span className="text-xs font-semibold text-[#3D4B63]">{t("accounting.view_mode.label")}</span>
      {btn("bilingual", "accounting.view_mode.bilingual")}
      {btn("ko", "accounting.view_mode.ko")}
      {btn("vi", "accounting.view_mode.vi")}
    </div>
  );
}
