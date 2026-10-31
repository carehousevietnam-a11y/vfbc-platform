import type { AccountingLocale } from "../uiCatalog";
import type { AccountingPackI18nText } from "./types";

export function resolvePackI18n(text: AccountingPackI18nText, locale: AccountingLocale): string {
  const primary = text[locale].trim();
  if (primary) return primary;
  const ko = text.ko.trim();
  if (ko) return ko;
  return text.vi.trim();
}

export function isPackI18nEmpty(text: AccountingPackI18nText): boolean {
  return !text.ko.trim() && !text.vi.trim();
}
