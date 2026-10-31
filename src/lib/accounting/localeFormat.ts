import type { AccountingLocale } from "./uiCatalog";

export function formatAccountingAmount(locale: AccountingLocale, value: number): string {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "ko-KR", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function formatAccountingDate(locale: AccountingLocale, iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.slice(0, 10));
  if (!match) return iso;
  if (locale === "vi") return `${match[3]}/${match[2]}/${match[1]}`;
  return `${match[1]}.${match[2]}.${match[3]}`;
}

export function uiAccountingLocale(locale: string): AccountingLocale {
  return locale === "vi" ? "vi" : "ko";
}
