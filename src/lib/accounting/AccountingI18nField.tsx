"use client";

import { useCallback } from "react";
import { accountingMessage, type AccountingLocale, type AccountingMessageKey } from "./uiCatalog";
import {
  type AccountingFieldViewMode,
  saveFieldViewMode,
} from "./accountingFormViewMode";
import type { I18nLang } from "./accountingI18nTexts";

type Props = {
  fieldId: string;
  labelKey: AccountingMessageKey;
  locale: AccountingLocale;
  userId: string | null;
  inputLang: I18nLang;
  onInputLangChange: (lang: I18nLang) => void;
  fieldView: AccountingFieldViewMode;
  onFieldViewChange: (mode: AccountingFieldViewMode) => void;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  saved?: { ko?: string; vi?: string };
  rows?: number;
};

export function AccountingI18nField({
  fieldId,
  labelKey,
  locale,
  userId,
  inputLang,
  onInputLangChange,
  fieldView,
  onFieldViewChange,
  value,
  onChange,
  readOnly,
  saved,
  rows = 3,
}: Props) {
  const t = useCallback((key: AccountingMessageKey) => accountingMessage(locale, key), [locale]);

  const displayFromSaved = (): { text: string; pending: boolean } => {
    const ko = saved?.ko?.trim();
    const vi = saved?.vi?.trim();
    if (fieldView === "original") {
      const orig = inputLang === "ko" ? ko ?? value : vi ?? value;
      return { text: orig || value, pending: false };
    }
    if (fieldView === "ko") {
      if (ko) return { text: ko, pending: false };
      if (vi) return { text: vi, pending: true };
      return { text: value, pending: false };
    }
    if (fieldView === "vi") {
      if (vi) return { text: vi, pending: false };
      if (ko) return { text: ko, pending: true };
      return { text: value, pending: false };
    }
    return { text: value, pending: false };
  };

  const editing = fieldView === "follow" || fieldView === "original";
  const display = editing ? { text: value, pending: false } : displayFromSaved();

  function setFieldView(mode: AccountingFieldViewMode) {
    saveFieldViewMode(userId, fieldId, mode);
    onFieldViewChange(mode);
  }

  return (
    <div className="space-y-1.5" data-testid={`accounting-i18n-field-${fieldId}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-semibold text-[#071A33]">{t(labelKey)}</label>
        <div className="flex flex-wrap gap-1">
          <select
            className="rounded border border-[#E3E8F0] bg-white px-2 py-0.5 text-xs text-[#071A33]"
            value={inputLang}
            disabled={readOnly}
            onChange={(e) => onInputLangChange(e.target.value as I18nLang)}
            aria-label={t("accounting.input_lang.label")}
          >
            <option value="ko">{t("accounting.input_lang.ko")}</option>
            <option value="vi">{t("accounting.input_lang.vi")}</option>
          </select>
        </div>
      </div>
      {editing ? (
        <textarea
          className="w-full rounded-lg border border-[#E3E8F0] px-3 py-2 text-sm text-[#071A33]"
          rows={rows}
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <p className="rounded-lg border border-dashed border-[#E3E8F0] bg-[#F9FAFC] px-3 py-2 text-sm text-[#071A33] whitespace-pre-wrap">
          {display.text || "—"}
          {display.pending ? (
            <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-800">
              {t("accounting.ledger.badge.translation_pending")}
            </span>
          ) : null}
        </p>
      )}
      <div className="flex flex-wrap gap-1">
        {(
          [
            ["follow", "accounting.field_view.follow"],
            ["ko", "accounting.field_view.ko"],
            ["vi", "accounting.field_view.vi"],
            ["original", "accounting.field_view.original"],
          ] as const
        ).map(([mode, key]) => (
          <button
            key={mode}
            type="button"
            className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
              fieldView === mode ? "bg-[#E8EEF8] text-[#071A33]" : "text-[#6B7A94]"
            }`}
            onClick={() => setFieldView(mode)}
          >
            {t(key)}
          </button>
        ))}
      </div>
    </div>
  );
}
