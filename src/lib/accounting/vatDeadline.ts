/** VAT due dates from accounting_deadline_rules + accounting_public_holidays (unverified seeds). */

import type { SupabaseClient } from "@supabase/supabase-js";

export type VatDeadlineConfig = {
  holidays: Set<string>;
};

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d.getTime());
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

function isWeekend(d: Date): boolean {
  const day = d.getUTCDay();
  return day === 0 || day === 6;
}

export function nextBusinessDay(dateIso: string, holidays: Set<string>): string {
  let d = new Date(`${dateIso}T12:00:00Z`);
  for (let i = 0; i < 40; i++) {
    const key = iso(d);
    if (!isWeekend(d) && !holidays.has(key)) return key;
    d = addDays(d, 1);
  }
  return dateIso;
}

export function vatDueDateWithConfig(
  periodKey: string,
  vatPeriod: "month" | "quarter",
  config: VatDeadlineConfig
): string {
  const holidays = config.holidays;
  if (vatPeriod === "month") {
    const m = periodKey.match(/^(\d{4})-(\d{2})$/);
    if (!m) throw new Error("INVALID_PERIOD_KEY");
    const y = Number(m[1]);
    const mo = Number(m[2]);
    let ny = y;
    let nm = mo + 1;
    if (nm > 12) {
      nm = 1;
      ny += 1;
    }
    const raw = `${ny}-${String(nm).padStart(2, "0")}-20`;
    return nextBusinessDay(raw, holidays);
  }
  const q = periodKey.match(/^(\d{4})-Q([1-4])$/);
  if (!q) throw new Error("INVALID_PERIOD_KEY");
  const y = Number(q[1]);
  const qi = Number(q[2]);
  const nextQFirstMonth = qi === 4 ? 1 : qi * 3 + 1;
  const ny = qi === 4 ? y + 1 : y;
  const lastDay = new Date(Date.UTC(ny, nextQFirstMonth, 0));
  return nextBusinessDay(iso(lastDay), holidays);
}

/** @deprecated tests: pass config via vatDueDateWithConfig */
export function vatDueDate(periodKey: string, vatPeriod: "month" | "quarter"): string {
  return vatDueDateWithConfig(periodKey, vatPeriod, { holidays: defaultHolidayFallback() });
}

function defaultHolidayFallback(): Set<string> {
  return new Set([
    "2026-01-01",
    "2026-04-30",
    "2026-05-01",
    "2026-05-20",
    "2026-09-02",
  ]);
}

export async function loadVatDeadlineConfig(client: SupabaseClient): Promise<VatDeadlineConfig> {
  const { data: rows } = await client
    .from("accounting_public_holidays")
    .select("holiday_date")
    .eq("verified_status", "unverified");
  const holidays = new Set<string>();
  for (const r of rows ?? []) {
    if (r.holiday_date) holidays.add(String(r.holiday_date).slice(0, 10));
  }
  if (holidays.size === 0) {
    return { holidays: defaultHolidayFallback() };
  }
  return { holidays };
}

export async function vatDueDateForOrg(
  client: SupabaseClient,
  periodKey: string,
  vatPeriod: "month" | "quarter"
): Promise<string> {
  const config = await loadVatDeadlineConfig(client);
  return vatDueDateWithConfig(periodKey, vatPeriod, config);
}
