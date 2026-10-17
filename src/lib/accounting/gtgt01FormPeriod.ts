/** TT89 01/GTGT — aligns with accounting_form_versions.effective_from (2026-07-01). */
export const GTGT01_TT89_EFFECTIVE_FROM_DATE = "2026-07-01";

export const GTGT01_TT89_FIRST_MONTH_PERIOD = "2026-07";
export const GTGT01_TT89_FIRST_QUARTER_PERIOD = "2026-Q3";

export type VatCalendarPeriod = "month" | "quarter";

function parseMonthPeriod(periodKey: string): { y: number; m: number } | null {
  const m = periodKey.match(/^(\d{4})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  if (mo < 1 || mo > 12) return null;
  return { y, m: mo };
}

function parseQuarterPeriod(periodKey: string): { y: number; q: number } | null {
  const m = periodKey.match(/^(\d{4})-Q([1-4])$/);
  if (!m) return null;
  return { y: Number(m[1]), q: Number(m[2]) };
}

function compareQuarter(a: { y: number; q: number }, b: { y: number; q: number }): number {
  if (a.y !== b.y) return a.y - b.y;
  return a.q - b.q;
}

/** True when TT89 draft / expert review must not run for this period. */
export function isPeriodBeforeGtgt01Tt89(periodKey: string, vatPeriod: VatCalendarPeriod): boolean {
  if (vatPeriod === "month") {
    const p = parseMonthPeriod(periodKey);
    if (!p) return false;
    const min = parseMonthPeriod(GTGT01_TT89_FIRST_MONTH_PERIOD);
    if (!min) return false;
    if (p.y !== min.y) return p.y < min.y;
    return p.m < min.m;
  }
  const p = parseQuarterPeriod(periodKey);
  if (!p) return false;
  const min = parseQuarterPeriod(GTGT01_TT89_FIRST_QUARTER_PERIOD);
  if (!min) return false;
  return compareQuarter(p, min) < 0;
}

export function gtgt01Tt89PeriodGuardMessageKey(): "accounting.vat.guard.period_before_tt89" {
  return "accounting.vat.guard.period_before_tt89";
}
