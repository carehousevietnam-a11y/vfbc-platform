/** VAT filing due dates — seeds in accounting_deadline_rules; holiday shift unverified. */

const VI_HOLIDAYS_2026 = new Set([
  "2026-01-01",
  "2026-04-30",
  "2026-05-01",
  "2026-09-02",
]);

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

export function nextBusinessDay(dateIso: string, holidays: Set<string> = VI_HOLIDAYS_2026): string {
  let d = new Date(`${dateIso}T12:00:00Z`);
  for (let i = 0; i < 30; i++) {
    const key = iso(d);
    if (!isWeekend(d) && !holidays.has(key)) return key;
    d = addDays(d, 1);
  }
  return dateIso;
}

/** period_key: YYYY-MM or YYYY-Qn */
export function vatDueDate(periodKey: string, vatPeriod: "month" | "quarter"): string {
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
    return nextBusinessDay(raw);
  }
  const q = periodKey.match(/^(\d{4})-Q([1-4])$/);
  if (!q) throw new Error("INVALID_PERIOD_KEY");
  const y = Number(q[1]);
  const qi = Number(q[2]);
  const nextQFirstMonth = qi === 4 ? 1 : qi * 3 + 1;
  const ny = qi === 4 ? y + 1 : y;
  const endMonth = nextQFirstMonth;
  const lastDay = new Date(Date.UTC(ny, endMonth, 0));
  return nextBusinessDay(iso(lastDay));
}
