/** §11 — 화면 표시 전환(병기/한국어/베트남어). 사이트 쿠키 없이 localStorage + userId. */

export type AccountingFormViewMode = "bilingual" | "ko" | "vi";

export type AccountingFieldViewMode = "follow" | "ko" | "vi" | "original";

const VIEW_KEY = "vfbcai.accounting.formViewMode";
const FIELD_PREFIX = "vfbcai.accounting.fieldView.";

export function loadFormViewMode(userId: string | null): AccountingFormViewMode {
  if (!userId || typeof window === "undefined") return "bilingual";
  try {
    const raw = localStorage.getItem(`${VIEW_KEY}.${userId}`);
    if (raw === "ko" || raw === "vi" || raw === "bilingual") return raw;
  } catch {
    /* ignore */
  }
  return "bilingual";
}

export function saveFormViewMode(userId: string | null, mode: AccountingFormViewMode): void {
  if (!userId || typeof window === "undefined") return;
  try {
    localStorage.setItem(`${VIEW_KEY}.${userId}`, mode);
  } catch {
    /* ignore */
  }
}

export function loadFieldViewMode(userId: string | null, fieldId: string): AccountingFieldViewMode {
  if (!userId || typeof window === "undefined") return "follow";
  try {
    const raw = localStorage.getItem(`${FIELD_PREFIX}${userId}.${fieldId}`);
    if (raw === "ko" || raw === "vi" || raw === "original" || raw === "follow") return raw;
  } catch {
    /* ignore */
  }
  return "follow";
}

export function saveFieldViewMode(userId: string | null, fieldId: string, mode: AccountingFieldViewMode): void {
  if (!userId || typeof window === "undefined") return;
  try {
    localStorage.setItem(`${FIELD_PREFIX}${userId}.${fieldId}`, mode);
  } catch {
    /* ignore */
  }
}
