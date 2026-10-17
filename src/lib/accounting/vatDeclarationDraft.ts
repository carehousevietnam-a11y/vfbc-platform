import type { SupabaseClient } from "@supabase/supabase-js";
import {
  computeGtgt01,
  gtgtFieldsToJson,
  type GtgtAdjustmentRow,
} from "./gtgt01Engine";
import { aggregateConfirmedTxnLines } from "./gtgt01TxnAggregate";
import { vatDueDateForOrg } from "./vatDeadline";
import {
  gtgt01Tt89PeriodGuardMessageKey,
  isPeriodBeforeGtgt01Tt89,
  type VatCalendarPeriod,
} from "./gtgt01FormPeriod";

export type VatDraftResult =
  | { ok: true; declarationId: string; computed: Record<string, unknown> }
  | { ok: false; code: string; messageKey?: string };

function priorPeriodKey(periodKey: string, vatPeriod: "month" | "quarter"): string | null {
  if (vatPeriod === "month") {
    const m = periodKey.match(/^(\d{4})-(\d{2})$/);
    if (!m) return null;
    let y = Number(m[1]);
    let mo = Number(m[2]) - 1;
    if (mo < 1) {
      mo = 12;
      y -= 1;
    }
    return `${y}-${String(mo).padStart(2, "0")}`;
  }
  const q = periodKey.match(/^(\d{4})-Q([1-4])$/);
  if (!q) return null;
  const y = Number(q[1]);
  const qi = Number(q[2]);
  if (qi === 1) return `${y - 1}-Q4`;
  return `${y}-Q${qi - 1}`;
}

async function loadPrior43(
  client: SupabaseClient,
  orgId: string,
  formCode: string,
  priorKey: string | null
): Promise<bigint> {
  if (!priorKey) return BigInt(0);
  const { data } = await client
    .from("accounting_declarations")
    .select("computed, status")
    .eq("org_id", orgId)
    .eq("form_code", formCode)
    .eq("period_key", priorKey)
    .neq("status", "amended")
    .order("created_at", { ascending: false })
    .limit(1);
  const row = data?.[0];
  if (!row?.computed || typeof row.computed !== "object") return BigInt(0);
  const fields = (row.computed as Record<string, unknown>).fields as Record<string, { value?: string }>;
  const c43 = fields?.["43"]?.value;
  return c43 ? BigInt(c43) : BigInt(0);
}

async function loadConfirmedLines(
  client: SupabaseClient,
  orgId: string,
  periodKey: string
) {
  const { data: txns } = await client
    .from("accounting_transactions")
    .select("id, type, status")
    .eq("org_id", orgId)
    .eq("period_key", periodKey)
    .eq("status", "confirmed");
  const ids = (txns ?? []).map((t) => t.id as string);
  if (ids.length === 0) return [];

  const { data: lines } = await client
    .from("accounting_transaction_lines")
    .select("txn_id, amount_net, vat_rate, vat_amount")
    .in("txn_id", ids);

  const typeById = new Map((txns ?? []).map((t) => [t.id as string, t.type as string]));
  return (lines ?? []).map((l) => ({
    txn_id: l.txn_id as string,
    type: typeById.get(l.txn_id as string) as "sale" | "purchase" | "expense" | "payroll",
    amount_net: Number(l.amount_net),
    vat_rate: l.vat_rate === null ? null : Number(l.vat_rate),
    vat_amount: Number(l.vat_amount),
  }));
}

async function loadAdjustments(
  client: SupabaseClient,
  declarationId: string
): Promise<GtgtAdjustmentRow[]> {
  const { data } = await client
    .from("accounting_declaration_adjustments")
    .select("field_code, amount, reason_code")
    .eq("declaration_id", declarationId);
  return (data ?? []).map((r) => ({
    field_code: r.field_code as string,
    amount: BigInt(r.amount),
    reason_code: r.reason_code as string | null,
  }));
}

export async function runVatGtgt01Draft(
  client: SupabaseClient,
  params: { orgId: string; periodKey: string; actorUserId: string }
): Promise<VatDraftResult> {
  const { orgId, periodKey } = params;

  const { data: org, error: orgErr } = await client
    .from("accounting_organizations")
    .select("vat_method, vat_period, approval_status")
    .eq("id", orgId)
    .single();
  if (orgErr || !org) return { ok: false, code: "ORG_NOT_FOUND" };
  if (org.vat_method === "direct") {
    return { ok: false, code: "VAT_DIRECT_METHOD_CONTACT_EXPERT", messageKey: "accounting.vat.error.direct_method" };
  }

  const vatPeriod = (org.vat_period as VatCalendarPeriod) ?? "month";

  if (isPeriodBeforeGtgt01Tt89(periodKey, vatPeriod)) {
    return {
      ok: false,
      code: "PERIOD_BEFORE_TT89",
      messageKey: gtgt01Tt89PeriodGuardMessageKey(),
    };
  }

  const { data: formRow } = await client
    .from("accounting_form_versions")
    .select("id, feature_enabled, status")
    .eq("form_code", "01/GTGT")
    .eq("portal_form_basis", "TT89")
    .maybeSingle();
  if (!formRow?.feature_enabled) {
    return { ok: false, code: "FORM_FEATURE_DISABLED" };
  }

  const warnings: string[] = ["accounting.vat.warning.eligibility_review"];

  const due = await vatDueDateForOrg(client, periodKey, vatPeriod);
  const priorKey = priorPeriodKey(periodKey, vatPeriod);
  const prior43 = await loadPrior43(client, orgId, "01/GTGT", priorKey);

  const { data: existing } = await client
    .from("accounting_declarations")
    .select("id, status, computed")
    .eq("org_id", orgId)
    .eq("form_code", "01/GTGT")
    .eq("period_key", periodKey)
    .maybeSingle();

  if (existing?.status === "filed_manual") {
    return { ok: false, code: "PERIOD_FILED_LOCKED" };
  }

  let declarationId = existing?.id as string | undefined;
  if (!declarationId) {
    const { data: ins, error: insErr } = await client
      .from("accounting_declarations")
      .insert({
        org_id: orgId,
        form_code: "01/GTGT",
        form_version_id: formRow.id,
        period_key: periodKey,
        status: "drafting",
        due_date: due,
      })
      .select("id")
      .single();
    if (insErr || !ins) return { ok: false, code: "DECLARATION_INSERT_FAILED" };
    declarationId = ins.id as string;
  }

  const adjustments = await loadAdjustments(client, declarationId);
  const confirmedLines = await loadConfirmedLines(client, orgId, periodKey);
  const { fromTxns, warnings: aggWarnings } = aggregateConfirmedTxnLines(confirmedLines);

  const payload = computeGtgt01({
    prior43,
    inputs: {},
    adjustments,
    fromTxns,
  });
  payload.warnings.push(...warnings, ...aggWarnings);

  const computed = gtgtFieldsToJson(payload);

  const { error: updErr } = await client
    .from("accounting_declarations")
    .update({ computed, due_date: due, form_version_id: formRow.id })
    .eq("id", declarationId)
    .neq("status", "filed_manual");
  if (updErr) return { ok: false, code: "DECLARATION_UPDATE_FAILED" };

  return { ok: true, declarationId, computed };
}
