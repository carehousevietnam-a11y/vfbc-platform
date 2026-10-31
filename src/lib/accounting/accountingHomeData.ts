import type { SupabaseClient } from "@supabase/supabase-js";
import { vatDueDateForOrg } from "./vatDeadline";
import { canViewDeclarationHome } from "./accountingNav";

export type HomeScheduleItem = {
  id: string;
  formCode: string;
  periodKey: string;
  status: string;
  dueDateIso: string;
  dueUnverified: boolean;
};

export type HomeInProgressItem = {
  id: string;
  formCode: string;
  periodKey: string;
  status: string;
};

export type HomeRecentTxn = {
  id: string;
  txnDate: string;
  amountVnd: number;
  status: string;
  type: string;
};

export type AccountingHomeSnapshot = {
  role: string;
  orgId: string;
  showDeclarations: boolean;
  schedule: HomeScheduleItem[];
  inProgress: HomeInProgressItem[];
  pendingTxnCount: number;
  missingEvidenceCount: number;
  recentTxns: HomeRecentTxn[];
};

const IN_PROGRESS = new Set(["drafting", "expert_review", "ready"]);

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

async function vatDeadlineUnverified(client: SupabaseClient, vatPeriod: "month" | "quarter"): Promise<boolean> {
  const periodKind = vatPeriod === "month" ? "monthly" : "quarterly";
  const { data } = await client
    .from("accounting_deadline_rules")
    .select("verified_status")
    .eq("tax_type", "vat")
    .eq("period_kind", periodKind)
    .maybeSingle();
  return (data?.verified_status as string | undefined) !== "verified";
}

async function resolveDueDate(
  client: SupabaseClient,
  row: { due_date: string | null; form_code: string; period_key: string },
  vatPeriod: "month" | "quarter"
): Promise<{ dueDateIso: string; dueUnverified: boolean } | null> {
  if (row.due_date) {
    return { dueDateIso: String(row.due_date).slice(0, 10), dueUnverified: false };
  }
  if (row.form_code === "01/GTGT" || row.form_code.startsWith("01/")) {
    try {
      const dueDateIso = await vatDueDateForOrg(client, row.period_key, vatPeriod);
      const unverified = await vatDeadlineUnverified(client, vatPeriod);
      return { dueDateIso, dueUnverified: unverified };
    } catch {
      return null;
    }
  }
  return null;
}

export async function loadAccountingHomeSnapshot(
  client: SupabaseClient,
  orgId: string,
  role: string
): Promise<AccountingHomeSnapshot> {
  const showDeclarations = canViewDeclarationHome(role);

  const { data: orgRow } = await client
    .from("accounting_organizations")
    .select("vat_period")
    .eq("id", orgId)
    .maybeSingle();
  const vatPeriod = (orgRow?.vat_period as "month" | "quarter" | undefined) ?? "month";

  let schedule: HomeScheduleItem[] = [];
  let inProgress: HomeInProgressItem[] = [];

  if (showDeclarations) {
    const { data: decls } = await client
      .from("accounting_declarations")
      .select("id, form_code, period_key, status, due_date")
      .eq("org_id", orgId);

    const rows = decls ?? [];
    inProgress = rows
      .filter((d) => IN_PROGRESS.has(d.status as string))
      .map((d) => ({
        id: d.id as string,
        formCode: d.form_code as string,
        periodKey: d.period_key as string,
        status: d.status as string,
      }));

    const scheduleCandidates: HomeScheduleItem[] = [];
    for (const d of rows) {
      if (d.status === "filed_manual") continue;
      const resolved = await resolveDueDate(
        client,
        {
          due_date: d.due_date as string | null,
          form_code: d.form_code as string,
          period_key: d.period_key as string,
        },
        vatPeriod
      );
      if (!resolved) continue;
      scheduleCandidates.push({
        id: d.id as string,
        formCode: d.form_code as string,
        periodKey: d.period_key as string,
        status: d.status as string,
        dueDateIso: resolved.dueDateIso,
        dueUnverified: resolved.dueUnverified,
      });
    }
    schedule = scheduleCandidates.sort((a, b) => a.dueDateIso.localeCompare(b.dueDateIso));
  }

  const { count: pendingTxnCount } = await client
    .from("accounting_transactions")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId)
    .in("status", ["draft", "submitted"]);

  const { data: txnRows } = await client
    .from("accounting_transactions")
    .select("id")
    .eq("org_id", orgId)
    .neq("status", "cancelled");

  const { data: evidenceRows } = await client
    .from("accounting_evidence_files")
    .select("txn_id")
    .eq("org_id", orgId);

  const linked = new Set((evidenceRows ?? []).map((r) => r.txn_id as string));
  const missingEvidenceCount = (txnRows ?? []).filter((t) => !linked.has(t.id as string)).length;

  const { data: recent } = await client
    .from("accounting_transactions")
    .select("id, txn_date, amount_vnd, status, type")
    .eq("org_id", orgId)
    .order("txn_date", { ascending: false })
    .limit(5);

  const recentTxns: HomeRecentTxn[] = (recent ?? []).map((r) => ({
    id: r.id as string,
    txnDate: String(r.txn_date).slice(0, 10),
    amountVnd: Number(r.amount_vnd ?? 0),
    status: r.status as string,
    type: r.type as string,
  }));

  return {
    role,
    orgId,
    showDeclarations,
    schedule,
    inProgress,
    pendingTxnCount: pendingTxnCount ?? 0,
    missingEvidenceCount,
    recentTxns,
  };
}

export function dDayFromToday(dueDateIso: string): number {
  const due = new Date(`${dueDateIso}T12:00:00Z`).getTime();
  const today = new Date(`${todayIso()}T12:00:00Z`).getTime();
  return Math.round((due - today) / 86_400_000);
}
