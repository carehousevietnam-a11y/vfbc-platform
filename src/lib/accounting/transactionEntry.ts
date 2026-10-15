import type { SupabaseClient } from "@supabase/supabase-js";
import type { AccountingMessageKey } from "./uiCatalog";

export type AccountingActor = { userId: string; orgId: string; role: string };
type Actor = AccountingActor;

async function loadActorCore(
  client: SupabaseClient,
  accessToken: string
): Promise<Actor | { error: string; status: number }> {
  const { data: userData, error: userError } = await client.auth.getUser(accessToken);
  if (userError || !userData.user) return { error: "UNAUTHENTICATED", status: 401 };
  const userId = userData.user.id;
  const { data: memberships, error: memberError } = await client
    .from("accounting_org_members")
    .select("org_id, role")
    .eq("user_id", userId);
  if (memberError) return { error: "MEMBERSHIP_LOOKUP", status: 400 };
  const rows = memberships ?? [];
  if (rows.length === 0) return { error: "NO_ORG", status: 403 };
  const { data: orgs, error: orgError } = await client
    .from("accounting_organizations")
    .select("id, approval_status")
    .in(
      "id",
      rows.map((row) => row.org_id as string)
    );
  if (orgError) return { error: "ORG_LOOKUP", status: 400 };
  const approved = (orgs ?? []).filter((org) => org.approval_status === "approved");
  if (approved.length === 0) return { error: "ORG_NOT_APPROVED", status: 403 };
  if (approved.length > 1) return { error: "ORG_AMBIGUOUS", status: 409 };
  const orgId = approved[0].id as string;
  const role = rows.find((row) => row.org_id === orgId)?.role as string | undefined;
  if (!role) return { error: "NO_ORG", status: 403 };
  return { userId, orgId, role };
}

function isActor(value: Actor | { error: string; status: number }): value is Actor {
  return "userId" in value;
}

export async function resolveAccountingActor(
  client: SupabaseClient,
  accessToken: string
): Promise<{ ok: true; userId: string; orgId: string; role: string } | { ok: false; status: number; error: string }> {
  const actor = await loadActorCore(client, accessToken);
  if (!isActor(actor)) return { ok: false, status: actor.status, error: actor.error };
  return { ok: true, userId: actor.userId, orgId: actor.orgId, role: actor.role };
}

export const TXN_TYPES = ["sale", "purchase", "expense", "payroll"] as const;
export type TxnType = (typeof TXN_TYPES)[number];
export type TxnStatus = "draft" | "submitted" | "confirmed" | "cancelled";
export type CheckLevel = "ok" | "mid" | "warn";

export type TxnCheck = {
  code: string;
  field: string;
  level: CheckLevel;
  messageKey: AccountingMessageKey;
};

export type CommandResult =
  | {
      ok: true;
      id: string;
      status: string;
      checks: TxnCheck[];
      amountVnd: number;
      fxUnverified: boolean;
      role: string;
    }
  | { ok: false; status: number; error: string; checks?: TxnCheck[] };

const SPOOF_KEYS = [
  "orgId",
  "org_id",
  "role",
  "createdBy",
  "created_by",
  "confirmedBy",
  "confirmed_by",
  "periodKey",
  "period_key",
  "amountVnd",
  "amount_vnd",
  "status",
] as const;

function text(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

function numOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function periodKeyFromDate(iso: string): string | null {
  if (!isIsoDate(iso)) return null;
  return iso.slice(0, 7);
}

function roundVnd(value: number): number {
  return Math.round(value);
}

export function expectedVat(net: number, rate: number): number {
  return Math.round((net * rate) / 100);
}

/** User-entered multiplier only. G4 does not supply a conversion rule. */
export function computeAmountVnd(
  currency: string,
  net: number,
  vat: number,
  fxRate: number | null
): number | null {
  const total = net + vat;
  if (currency === "VND") return roundVnd(total);
  if (fxRate === null || !(fxRate > 0)) return null;
  return roundVnd(total * fxRate);
}

export function buildTxnChecks(input: {
  type: string;
  txnDate: string;
  counterpartyId: string | null;
  newCounterpartyName: string | null;
  invoiceSeries: string;
  invoiceNo: string;
  invoiceDate: string;
  currency: string;
  fxRate: number | null;
  amountNet: number | null;
  vatRate: number | null;
  vatAmount: number | null;
}): TxnCheck[] {
  const checks: TxnCheck[] = [];
  const dateOk = isIsoDate(input.txnDate);
  checks.push({
    code: "date",
    field: "txnDate",
    level: dateOk ? "ok" : "warn",
    messageKey: dateOk ? "accounting.txn.check.date_ok" : "accounting.txn.check.date_bad",
  });
  const period = dateOk ? periodKeyFromDate(input.txnDate) : null;
  checks.push({
    code: "period",
    field: "txnDate",
    level: period ? "ok" : "warn",
    messageKey: period ? "accounting.txn.check.period_ok" : "accounting.txn.check.period_bad",
  });

  const hasParty = Boolean(input.counterpartyId || input.newCounterpartyName);
  const partyRequired = input.type === "sale" || input.type === "purchase";
  checks.push({
    code: "counterparty",
    field: "counterparty",
    level: hasParty ? "ok" : partyRequired ? "warn" : "mid",
    messageKey: hasParty
      ? "accounting.txn.check.counterparty_ok"
      : partyRequired
        ? "accounting.txn.check.counterparty_warn"
        : "accounting.txn.check.counterparty_mid",
  });

  const invoiceOk = Boolean(input.invoiceSeries && input.invoiceNo && isIsoDate(input.invoiceDate));
  const invoiceRequired = input.type === "sale" || input.type === "purchase";
  checks.push({
    code: "invoice",
    field: "invoiceSeries",
    level: invoiceOk ? "ok" : invoiceRequired ? "warn" : "mid",
    messageKey: invoiceOk
      ? "accounting.txn.check.invoice_ok"
      : invoiceRequired
        ? "accounting.txn.check.invoice_warn"
        : "accounting.txn.check.invoice_mid",
  });

  const net = input.amountNet;
  const vat = input.vatAmount;
  const rate = input.vatRate;
  const amountsOk =
    net !== null && vat !== null && net >= 0 && vat >= 0 && (rate === null || rate >= 0);
  const sumOk = amountsOk && (rate === null ? vat === 0 : expectedVat(net, rate) === vat);
  checks.push({
    code: "sum",
    field: "vatAmount",
    level: amountsOk && sumOk ? "ok" : "warn",
    messageKey: amountsOk && sumOk ? "accounting.txn.check.sum_ok" : amountsOk ? "accounting.txn.check.sum_bad" : "accounting.txn.check.amount_bad",
  });

  const currency = input.currency.toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    checks.push({
      code: "fx",
      field: "currency",
      level: "warn",
      messageKey: "accounting.txn.check.fx_need",
    });
  } else if (currency === "VND") {
    checks.push({
      code: "fx",
      field: "currency",
      level: "ok",
      messageKey: "accounting.txn.check.fx_ok",
    });
  } else if (input.fxRate === null || !(input.fxRate > 0)) {
    checks.push({
      code: "fx",
      field: "fxRate",
      level: "warn",
      messageKey: "accounting.txn.check.fx_need",
    });
  } else {
    checks.push({
      code: "fx",
      field: "fxRate",
      level: "mid",
      messageKey: "accounting.txn.check.fx_unverified",
    });
  }
  return checks;
}

export function hasWarn(checks: TxnCheck[]): boolean {
  return checks.some((check) => check.level === "warn");
}

function readCommand(body: Record<string, unknown>) {
  for (const key of SPOOF_KEYS) {
    void body[key];
  }
  const type = text(body, "type");
  const txnDate = text(body, "txnDate");
  const counterpartyId = text(body, "counterpartyId") || null;
  const newCounterpartyName = text(body, "newCounterpartyName") || null;
  const invoiceSeries = text(body, "invoiceSeries");
  const invoiceNo = text(body, "invoiceNo");
  const invoiceDate = text(body, "invoiceDate");
  const currency = (text(body, "currency") || "VND").toUpperCase();
  const fxRate = numOrNull(body.fxRate);
  const amountNet = numOrNull(body.amountNet);
  const vatRate = numOrNull(body.vatRate);
  const vatAmount = numOrNull(body.vatAmount);
  const action = text(body, "action");
  return {
    type,
    txnDate,
    counterpartyId,
    newCounterpartyName,
    invoiceSeries,
    invoiceNo,
    invoiceDate,
    currency,
    fxRate,
    amountNet,
    vatRate,
    vatAmount,
    action,
  };
}

async function loadActor(
  client: SupabaseClient,
  accessToken: string
): Promise<Actor | { error: string; status: number }> {
  return loadActorCore(client, accessToken);
}

async function resolveCounterparty(
  client: SupabaseClient,
  actor: Actor,
  type: string,
  counterpartyId: string | null,
  newName: string | null
): Promise<{ id: string | null } | { error: string }> {
  if (counterpartyId) {
    const { data, error } = await client
      .from("accounting_counterparties")
      .select("id")
      .eq("id", counterpartyId)
      .eq("org_id", actor.orgId)
      .maybeSingle();
    if (error || !data) return { error: "COUNTERPARTY_NOT_FOUND" };
    return { id: data.id as string };
  }
  if (!newName) return { id: null };
  const kind = type === "sale" ? "customer" : "supplier";
  const { data, error } = await client
    .from("accounting_counterparties")
    .insert({
      org_id: actor.orgId,
      name_original: newName,
      kind,
    })
    .select("id")
    .single();
  if (error || !data) return { error: "COUNTERPARTY_WRITE_FAILED" };
  return { id: data.id as string };
}

async function writeLines(
  client: SupabaseClient,
  txnId: string,
  amountNet: number,
  vatRate: number | null,
  vatAmount: number
): Promise<boolean> {
  const { error: deleteError } = await client.from("accounting_transaction_lines").delete().eq("txn_id", txnId);
  if (deleteError) return false;
  const { error: insertError } = await client.from("accounting_transaction_lines").insert({
    txn_id: txnId,
    amount_net: amountNet,
    vat_rate: vatRate,
    vat_amount: vatAmount,
  });
  return !insertError;
}

export async function applyTransactionCommand(
  client: SupabaseClient,
  accessToken: string,
  body: Record<string, unknown>,
  txnId?: string | null
): Promise<CommandResult> {
  const actor = await loadActor(client, accessToken);
  if (!isActor(actor)) return { ok: false, status: actor.status, error: actor.error };
  if (actor.role !== "company_owner" && actor.role !== "company_member") {
    return { ok: false, status: 403, error: "ROLE_FORBIDDEN" };
  }

  const command = readCommand(body);
  if (!TXN_TYPES.includes(command.type as TxnType)) {
    return { ok: false, status: 422, error: "TYPE_INVALID" };
  }
  if (command.action !== "draft" && command.action !== "submit" && command.action !== "confirm") {
    return { ok: false, status: 422, error: "ACTION_INVALID" };
  }
  if (command.action === "confirm" && actor.role !== "company_owner") {
    return { ok: false, status: 403, error: "CONFIRM_FORBIDDEN" };
  }
  if (command.action === "confirm" && command.currency !== "VND") {
    return { ok: false, status: 422, error: "FX_CONFIRM_BLOCKED", checks: buildTxnChecks(command) };
  }

  const checks = buildTxnChecks(command);
  if (!isIsoDate(command.txnDate) || command.amountNet === null || command.vatAmount === null) {
    return { ok: false, status: 422, error: "VALIDATION", checks };
  }
  if (command.action === "confirm" && hasWarn(checks)) {
    return { ok: false, status: 422, error: "CONFIRM_BLOCKED", checks };
  }

  const amountVnd = computeAmountVnd(
    command.currency,
    command.amountNet,
    command.vatAmount,
    command.currency === "VND" ? null : command.fxRate
  );
  if (amountVnd === null) {
    return { ok: false, status: 422, error: "VALIDATION", checks };
  }
  const periodKey = periodKeyFromDate(command.txnDate);
  if (!periodKey) return { ok: false, status: 422, error: "VALIDATION", checks };

  const party = await resolveCounterparty(
    client,
    actor,
    command.type,
    command.counterpartyId,
    command.newCounterpartyName
  );
  if ("error" in party) return { ok: false, status: 422, error: party.error, checks };

  const nextStatus: TxnStatus =
    command.action === "confirm" ? "confirmed" : command.action === "submit" ? "submitted" : "draft";
  const fxUnverified = command.currency !== "VND";
  // Lines cannot change after confirmed, so persist a non-confirmed status first.
  const stageStatus: TxnStatus = command.action === "confirm" ? "submitted" : nextStatus;
  const row = {
    org_id: actor.orgId,
    type: command.type,
    status: stageStatus,
    txn_date: command.txnDate,
    period_key: periodKey,
    counterparty_id: party.id,
    invoice_series: command.invoiceSeries || null,
    invoice_no: command.invoiceNo || null,
    invoice_date: command.invoiceDate && isIsoDate(command.invoiceDate) ? command.invoiceDate : null,
    currency: command.currency,
    fx_rate: command.currency === "VND" ? null : command.fxRate,
    amount_vnd: amountVnd,
    created_by: actor.userId,
    confirmed_by: null,
    confirmed_at: null,
  };

  let id = txnId ?? null;
  if (!id) {
    const { data, error } = await client.from("accounting_transactions").insert(row).select("id").single();
    if (error || !data) return { ok: false, status: 400, error: "WRITE_FAILED", checks };
    id = data.id as string;
  } else {
    const { data: existing, error: readError } = await client
      .from("accounting_transactions")
      .select("id, status, org_id")
      .eq("id", id)
      .eq("org_id", actor.orgId)
      .maybeSingle();
    if (readError || !existing) return { ok: false, status: 404, error: "NOT_FOUND" };
    if (existing.status === "confirmed") {
      return { ok: false, status: 409, error: "CONFIRMED_LOCKED", checks };
    }
    const { error: updateError } = await client
      .from("accounting_transactions")
      .update(row)
      .eq("id", id)
      .eq("org_id", actor.orgId);
    if (updateError) return { ok: false, status: 400, error: "WRITE_FAILED", checks };
  }

  const linesOk = await writeLines(client, id, command.amountNet, command.vatRate, command.vatAmount);
  if (!linesOk) return { ok: false, status: 400, error: "LINE_WRITE_FAILED", checks };

  if (nextStatus === "confirmed") {
    // P3에서 추가: 확정 시 ledger_entries 생성과 차변합=대변합 검사. 이번 단계에서는 하지 않는다.
    const { error: confirmError } = await client
      .from("accounting_transactions")
      .update({
        status: "confirmed",
        confirmed_by: actor.userId,
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("org_id", actor.orgId);
    if (confirmError) return { ok: false, status: 403, error: "CONFIRM_FORBIDDEN", checks };
  }

  const { count, error: auditError } = await client
    .from("accounting_audit_log")
    .select("id", { count: "exact", head: true })
    .eq("entity_id", id)
    .eq("entity", "accounting_transactions");
  if (auditError || (count ?? 0) < 1) {
    return { ok: false, status: 500, error: "AUDIT_MISSING" };
  }

  return {
    ok: true,
    id,
    status: nextStatus,
    checks,
    amountVnd,
    fxUnverified,
    role: actor.role,
  };
}

export async function listTransactions(
  client: SupabaseClient,
  accessToken: string,
  query: { period?: string; type?: string; status?: string }
): Promise<
  | { ok: true; role: string; items: Record<string, unknown>[] }
  | { ok: false; status: number; error: string }
> {
  const actor = await loadActor(client, accessToken);
  if (!isActor(actor)) return { ok: false, status: actor.status, error: actor.error };
  let request = client
    .from("accounting_transactions")
    .select(
      "id, type, status, txn_date, period_key, currency, fx_rate, amount_vnd, counterparty_id, invoice_series, invoice_no, invoice_date"
    )
    .eq("org_id", actor.orgId)
    .order("txn_date", { ascending: false });
  if (query.period && /^\d{4}-\d{2}$/.test(query.period)) request = request.eq("period_key", query.period);
  if (query.type && TXN_TYPES.includes(query.type as TxnType)) request = request.eq("type", query.type);
  if (query.status && ["draft", "submitted", "confirmed", "cancelled"].includes(query.status)) {
    request = request.eq("status", query.status);
  }
  const { data, error } = await request;
  if (error) return { ok: false, status: 400, error: "LIST_FAILED" };
  const ids = [...new Set((data ?? []).map((row) => row.counterparty_id).filter(Boolean))] as string[];
  const names = new Map<string, string>();
  if (ids.length > 0) {
    const { data: parties } = await client
      .from("accounting_counterparties")
      .select("id, name_original")
      .eq("org_id", actor.orgId)
      .in("id", ids);
    for (const party of parties ?? []) names.set(party.id as string, party.name_original as string);
  }
  const txnIds = (data ?? []).map((row) => row.id as string);
  const evidenceCounts = await countEvidenceForTxnIds(client, actor.orgId, txnIds);
  const items = (data ?? []).map((row) => {
    const id = row.id as string;
    const evidenceCount = evidenceCounts.get(id) ?? 0;
    return {
      id: row.id,
      type: row.type,
      status: row.status,
      txnDate: row.txn_date,
      periodKey: row.period_key,
      currency: row.currency,
      fxRate: row.fx_rate,
      amountVnd: row.amount_vnd,
      invoiceSeries: row.invoice_series,
      invoiceNo: row.invoice_no,
      invoiceDate: row.invoice_date,
      counterpartyId: row.counterparty_id,
      counterpartyName: row.counterparty_id ? (names.get(row.counterparty_id as string) ?? "") : "",
      fxUnverified: row.currency !== "VND",
      evidenceCount,
      hasEvidence: evidenceCount > 0,
    };
  });
  return { ok: true, role: actor.role, items };
}

async function countEvidenceForTxnIds(
  client: SupabaseClient,
  orgId: string,
  txnIds: string[]
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  if (txnIds.length === 0) return out;
  const { data } = await client
    .from("accounting_evidence_files")
    .select("txn_id")
    .eq("org_id", orgId)
    .in("txn_id", txnIds);
  for (const id of txnIds) out.set(id, 0);
  for (const row of data ?? []) {
    const key = row.txn_id as string;
    out.set(key, (out.get(key) ?? 0) + 1);
  }
  return out;
}

export async function getTransaction(
  client: SupabaseClient,
  accessToken: string,
  txnId: string
): Promise<
  | { ok: true; role: string; item: Record<string, unknown>; checks: TxnCheck[] }
  | { ok: false; status: number; error: string }
> {
  const actor = await loadActor(client, accessToken);
  if (!isActor(actor)) return { ok: false, status: actor.status, error: actor.error };
  const { data, error } = await client
    .from("accounting_transactions")
    .select(
      "id, type, status, txn_date, period_key, currency, fx_rate, amount_vnd, counterparty_id, invoice_series, invoice_no, invoice_date, org_id"
    )
    .eq("id", txnId)
    .eq("org_id", actor.orgId)
    .maybeSingle();
  if (error || !data) return { ok: false, status: 404, error: "NOT_FOUND" };
  const { data: lines } = await client
    .from("accounting_transaction_lines")
    .select("amount_net, vat_rate, vat_amount")
    .eq("txn_id", txnId)
    .limit(1);
  const line = lines?.[0];
  const amountNet = line ? Number(line.amount_net) : 0;
  const vatAmount = line ? Number(line.vat_amount) : 0;
  const vatRate = line && line.vat_rate !== null ? Number(line.vat_rate) : null;
  const checks = buildTxnChecks({
    type: String(data.type),
    txnDate: String(data.txn_date),
    counterpartyId: (data.counterparty_id as string | null) ?? null,
    newCounterpartyName: null,
    invoiceSeries: String(data.invoice_series ?? ""),
    invoiceNo: String(data.invoice_no ?? ""),
    invoiceDate: String(data.invoice_date ?? ""),
    currency: String(data.currency),
    fxRate: data.fx_rate === null ? null : Number(data.fx_rate),
    amountNet,
    vatRate,
    vatAmount,
  });
  return {
    ok: true,
    role: actor.role,
    checks,
    item: {
      id: data.id,
      type: data.type,
      status: data.status,
      txnDate: data.txn_date,
      periodKey: data.period_key,
      currency: data.currency,
      fxRate: data.fx_rate,
      amountVnd: data.amount_vnd,
      counterpartyId: data.counterparty_id,
      invoiceSeries: data.invoice_series ?? "",
      invoiceNo: data.invoice_no ?? "",
      invoiceDate: data.invoice_date ?? "",
      amountNet,
      vatRate,
      vatAmount,
      fxUnverified: data.currency !== "VND",
    },
  };
}

export async function listCounterparties(
  client: SupabaseClient,
  accessToken: string
): Promise<{ ok: true; items: { id: string; name: string; kind: string }[] } | { ok: false; status: number; error: string }> {
  const actor = await loadActor(client, accessToken);
  if (!isActor(actor)) return { ok: false, status: actor.status, error: actor.error };
  const { data, error } = await client
    .from("accounting_counterparties")
    .select("id, name_original, kind")
    .eq("org_id", actor.orgId)
    .order("name_original", { ascending: true });
  if (error) return { ok: false, status: 400, error: "LIST_FAILED" };
  return {
    ok: true,
    items: (data ?? []).map((row) => ({
      id: row.id as string,
      name: row.name_original as string,
      kind: row.kind as string,
    })),
  };
}
