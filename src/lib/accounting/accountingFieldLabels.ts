import type { AccountingFormViewMode } from "./accountingFormViewMode";
import type { AccountingLocale } from "./uiCatalog";

/** VAT field_map 라벨 — 화면 표시 전환만 (저장 무관). */

export function vatFieldLabel(
  field: { code: string; label_ko: string; label_vi: string } | undefined,
  viewMode: AccountingFormViewMode,
  uiLocale: AccountingLocale
): string {
  if (!field) return "—";
  if (viewMode === "bilingual") return `${field.label_ko} · [${field.code}] ${field.label_vi}`;
  if (viewMode === "ko") return `[${field.code}] ${field.label_ko}`;
  if (viewMode === "vi") return `[${field.code}] ${field.label_vi}`;
  return uiLocale === "vi"
    ? `[${field.code}] ${field.label_vi}`
    : `[${field.code}] ${field.label_ko}`;
}
