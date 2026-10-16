import type { SupabaseClient } from "@supabase/supabase-js";
import type { AccountingLocale } from "./uiCatalog";
import { resolveAccountingActor } from "./transactionEntry";

export type LedgerRow = {
  id: string;
  txnId: string;
  entryDate: string;
  periodKey: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  memo: string;
  memoTranslationPending: boolean;
  counterpartyName: string;
  invoiceNo: string | null;
  usesUnverifiedBasis: boolean;
  fxConversionUnverified: boolean;
};

export type LedgerListQuery = {
  period?: string;
  dateFrom?: string;
  dateTo?: string;
  accountCode?: string;
  counterpartyId?: string;
  q?: string;
  page?: number;
  pageSize?: number;
};

type Actor = { orgId: string; role: string };

async function loadActor(
  client: SupabaseClient,
  accessToken: string
): Promise<Actor | { status: number; error: string }> {
  const actor = await resolveAccountingActor(client, accessToken);
  if (!actor.ok) return { status: actor.status, error: actor.error };
  return { orgId: actor.orgId, role: actor.role };
}

async function accountNameMap(
  client: SupabaseClient,
  codes: string[],
  locale: AccountingLocale
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (codes.length === 0) return out;
  const { data } = await client
    .from("accounting_chart_of_accounts")
    .select("code, name_ko, name_vi, effective_from")
    .in("code", codes)
    .order("effective_from", { ascending: false });
  for (const row of data ?? []) {
    const code = row.code as string;
    if (out.has(code)) continue;
    const name = locale === "vi" ? (row.name_vi as string) : (row.name_ko as string);
    out.set(code, name || code);
  }
  return out;
}

type MemoPack = { ko?: string; vi?: string };

async function loadMemoMap(
  client: SupabaseClient,
  orgId: string,
  txnIds: string[]
): Promise<Map<string, MemoPack>> {
  const out = new Map<string, MemoPack>();
  if (txnIds.length === 0) return out;
  const { data } = await client
    .from("accounting_i18n_texts")
    .select("entity_id, lang, text, version, field")
    .eq("org_id", orgId)
    .eq("entity_type", "transaction")
    .in("entity_id", txnIds)
    .in("field", ["memo", "description"])
    .order("version", { ascending: false });
  for (const row of data ?? []) {
    const id = row.entity_id as string;
    const lang = row.lang as "ko" | "vi";
    const pack = out.get(id) ?? {};
    if (lang === "ko" && pack.ko === undefined) pack.ko = row.text as string;
    if (lang === "vi" && pack.vi === undefined) pack.vi = row.text as string;
    out.set(id, pack);
  }
  return out;
}

function resolveMemoDisplay(
  pack: MemoPack | undefined,
  locale: AccountingLocale,
  fallback: string
): { text: string; translationPending: boolean } {
  const primary = locale === "vi" ? pack?.vi : pack?.ko;
  const alternate = locale === "vi" ? pack?.ko : pack?.vi;
  if (primary && primary.trim()) return { text: primary.trim(), translationPending: false };
  if (alternate && alternate.trim()) return { text: alternate.trim(), translationPending: true };
  if (fallback.trim()) return { text: fallback.trim(), translationPending: false };
  return { text: "—", translationPending: false };
}

async function searchTxnIds(
  client: SupabaseClient,
  orgId: string,
  q: string
): Promise<string[] | null> {
  const trimmed = q.trim();
  if (!trimmed) return null;
  const { data, error } = await client.rpc("accounting_ledger_search_txn_ids", {
    p_org_id: orgId,
    p_query: trimmed,
  });
  if (error) return [];
  return (data ?? []) as string[];
}

export async function listLedgerEntries(
  client: SupabaseClient,
  accessToken: string,
  locale: AccountingLocale,
  query: LedgerListQuery
): Promise<
  | {
      ok: true;
      role: string;
      items: LedgerRow[];
      total: number;
      page: number;
      pageSize: number;
      sumDebit: number;
      sumCredit: number;
      bannerUnverifiedBasis: boolean;
    }
  | { ok: false; status: number; error: string }
> {
  const actor = await loadActor(client, accessToken);
  if ("error" in actor) return { ok: false, status: actor.status, error: actor.error };

  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 25));
  const page = Math.max(1, query.page ?? 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const searchIds = query.q ? await searchTxnIds(client, actor.orgId, query.q) : null;
  if (searchIds && searchIds.length === 0) {
    return {
      ok: true,
      role: actor.role,
      items: [],
      total: 0,
      page,
      pageSize,
      sumDebit: 0,
      sumCredit: 0,
      bannerUnverifiedBasis: false,
    };
  }

  let counterpartyTxnIds: string[] | null = null;
  if (query.counterpartyId?.trim()) {
    const cp = query.counterpartyId.trim();
    const { data: txns, error: txnErr } = await client
      .from("accounting_transactions")
      .select("id")
      .eq("org_id", actor.orgId)
      .eq("counterparty_id", cp);
    if (txnErr) return { ok: false, status: 400, error: "LIST_FAILED" };
    counterpartyTxnIds = (txns ?? []).map((row) => row.id as string);
    if (counterpartyTxnIds.length === 0) {
      return {
        ok: true,
        role: actor.role,
        items: [],
        total: 0,
        page,
        pageSize,
        sumDebit: 0,
        sumCredit: 0,
        bannerUnverifiedBasis: false,
      };
    }
  }

  let sumRequest = client
    .from("accounting_ledger_entries_enriched")
    .select("debit, credit, uses_unverified_accounting_basis")
    .eq("org_id", actor.orgId);
  let listRequest = client
    .from("accounting_ledger_entries_enriched")
    .select(
      "id, txn_id, entry_date, period_key, account_code, debit, credit, uses_unverified_accounting_basis, fx_conversion_unverified",
      { count: "exact" }
    )
    .eq("org_id", actor.orgId)
    .order("entry_date", { ascending: false })
    .order("id", { ascending: false });

  if (query.period && /^\d{4}-\d{2}$/.test(query.period)) {
    sumRequest = sumRequest.eq("period_key", query.period);
    listRequest = listRequest.eq("period_key", query.period);
  }
  if (query.dateFrom && /^\d{4}-\d{2}-\d{2}$/.test(query.dateFrom)) {
    sumRequest = sumRequest.gte("entry_date", query.dateFrom);
    listRequest = listRequest.gte("entry_date", query.dateFrom);
  }
  if (query.dateTo && /^\d{4}-\d{2}-\d{2}$/.test(query.dateTo)) {
    sumRequest = sumRequest.lte("entry_date", query.dateTo);
    listRequest = listRequest.lte("entry_date", query.dateTo);
  }
  if (query.accountCode?.trim()) {
    const code = query.accountCode.trim();
    sumRequest = sumRequest.eq("account_code", code);
    listRequest = listRequest.eq("account_code", code);
  }
  if (searchIds) {
    sumRequest = sumRequest.in("txn_id", searchIds);
    listRequest = listRequest.in("txn_id", searchIds);
  }
  if (counterpartyTxnIds) {
    sumRequest = sumRequest.in("txn_id", counterpartyTxnIds);
    listRequest = listRequest.in("txn_id", counterpartyTxnIds);
  }

  const { data: sumRows, error: sumError } = await sumRequest;
  if (sumError) return { ok: false, status: 400, error: "LIST_FAILED" };
  const all = sumRows ?? [];
  const sumDebit = all.reduce((s, row) => s + Number(row.debit), 0);
  const sumCredit = all.reduce((s, row) => s + Number(row.credit), 0);
  const bannerUnverifiedBasis = all.some((row) => row.uses_unverified_accounting_basis === true);

  const { data, error, count } = await listRequest.range(from, to);
  if (error) return { ok: false, status: 400, error: "LIST_FAILED" };

  const txnIds = [...new Set((data ?? []).map((row) => row.txn_id as string))];
  const { data: txns } = await client
    .from("accounting_transactions")
    .select("id, counterparty_id, invoice_no, type")
    .eq("org_id", actor.orgId)
    .in("id", txnIds.length ? txnIds : ["00000000-0000-0000-0000-000000000000"]);
  const cpIds = [...new Set((txns ?? []).map((t) => t.counterparty_id).filter(Boolean))] as string[];
  const cpNames = new Map<string, string>();
  if (cpIds.length > 0) {
    const { data: parties } = await client
      .from("accounting_counterparties")
      .select("id, name_original")
      .eq("org_id", actor.orgId)
      .in("id", cpIds);
    for (const p of parties ?? []) cpNames.set(p.id as string, p.name_original as string);
  }
  const txnMeta = new Map<string, { counterpartyName: string; invoiceNo: string | null; type: string }>();
  for (const t of txns ?? []) {
    txnMeta.set(t.id as string, {
      counterpartyName: t.counterparty_id ? (cpNames.get(t.counterparty_id as string) ?? "") : "",
      invoiceNo: (t.invoice_no as string | null) ?? null,
      type: String(t.type),
    });
  }

  const codes = [...new Set((data ?? []).map((row) => row.account_code as string))];
  const names = await accountNameMap(client, codes, locale);
  const memos = await loadMemoMap(client, actor.orgId, txnIds);

  const items: LedgerRow[] = (data ?? []).map((row) => {
    const txnId = row.txn_id as string;
    const meta = txnMeta.get(txnId);
    const fallback = meta?.invoiceNo ? `${meta.type} ${meta.invoiceNo}` : meta?.type ?? txnId.slice(0, 8);
    const memoResolved = resolveMemoDisplay(memos.get(txnId), locale, fallback);
    const accountCode = row.account_code as string;
    const accountLabel = names.get(accountCode) ?? accountCode;
    return {
      id: row.id as string,
      txnId,
      entryDate: String(row.entry_date),
      periodKey: String(row.period_key),
      accountCode,
      accountName: accountLabel,
      debit: Number(row.debit),
      credit: Number(row.credit),
      memo: memoResolved.text,
      memoTranslationPending: memoResolved.translationPending,
      counterpartyName: meta?.counterpartyName ?? "",
      invoiceNo: meta?.invoiceNo ?? null,
      usesUnverifiedBasis: row.uses_unverified_accounting_basis === true,
      fxConversionUnverified: row.fx_conversion_unverified === true,
    };
  });

  return {
    ok: true,
    role: actor.role,
    items,
    total: count ?? items.length,
    page,
    pageSize,
    sumDebit,
    sumCredit,
    bannerUnverifiedBasis,
  };
}

export async function getLedgerTransactionDetail(
  client: SupabaseClient,
  accessToken: string,
  locale: AccountingLocale,
  txnId: string
): Promise<
  | {
      ok: true;
      role: string;
      item: Record<string, unknown>;
      ledgerRows: LedgerRow[];
      originalLedgerRows: LedgerRow[];
      evidenceCount: number;
    }
  | { ok: false; status: number; error: string }
> {
  const actor = await loadActor(client, accessToken);
  if ("error" in actor) return { ok: false, status: actor.status, error: actor.error };

  const { data, error } = await client
    .from("accounting_transactions")
    .select(
      "id, type, status, txn_date, period_key, currency, fx_rate, amount_vnd, counterparty_id, invoice_series, invoice_no, invoice_date, corrects_txn_id"
    )
    .eq("id", txnId)
    .eq("org_id", actor.orgId)
    .maybeSingle();
  if (error || !data) return { ok: false, status: 404, error: "NOT_FOUND" };

  const { count: evidenceCount } = await client
    .from("accounting_evidence_files")
    .select("id", { count: "exact", head: true })
    .eq("org_id", actor.orgId)
    .eq("txn_id", txnId);

  const listForTxn = async (id: string) => {
    const { data: rows } = await client
      .from("accounting_ledger_entries_enriched")
      .select(
        "id, txn_id, entry_date, period_key, account_code, debit, credit, uses_unverified_accounting_basis, fx_conversion_unverified"
      )
      .eq("org_id", actor.orgId)
      .eq("txn_id", id)
      .order("entry_date", { ascending: true });
    const codes = [...new Set((rows ?? []).map((r) => r.account_code as string))];
    const names = await accountNameMap(client, codes, locale);
    const memos = await loadMemoMap(client, actor.orgId, [id]);
    const { data: txnRow } = await client
      .from("accounting_transactions")
      .select("invoice_no, type, counterparty_id")
      .eq("id", id)
      .maybeSingle();
    let counterpartyName = "";
    if (txnRow?.counterparty_id) {
      const { data: cp } = await client
        .from("accounting_counterparties")
        .select("name_original")
        .eq("id", txnRow.counterparty_id as string)
        .maybeSingle();
      counterpartyName = (cp?.name_original as string) ?? "";
    }
    const fallback = txnRow?.invoice_no
      ? `${txnRow.type} ${txnRow.invoice_no}`
      : String(txnRow?.type ?? "");
    const memoResolved = resolveMemoDisplay(memos.get(id), locale, fallback);
    return (rows ?? []).map((row) => ({
      id: row.id as string,
      txnId: id,
      entryDate: String(row.entry_date),
      periodKey: String(row.period_key),
      accountCode: row.account_code as string,
      accountName: names.get(row.account_code as string) ?? (row.account_code as string),
      debit: Number(row.debit),
      credit: Number(row.credit),
      memo: memoResolved.text,
      memoTranslationPending: memoResolved.translationPending,
      counterpartyName,
      invoiceNo: (txnRow?.invoice_no as string | null) ?? null,
      usesUnverifiedBasis: row.uses_unverified_accounting_basis === true,
      fxConversionUnverified: row.fx_conversion_unverified === true,
    }));
  };

  const ledgerRows = await listForTxn(txnId);
  const originalId = data.corrects_txn_id as string | null;
  const originalLedgerRows = originalId ? await listForTxn(originalId) : [];

  let counterpartyName = "";
  if (data.counterparty_id) {
    const { data: cp } = await client
      .from("accounting_counterparties")
      .select("name_original")
      .eq("id", data.counterparty_id as string)
      .maybeSingle();
    counterpartyName = (cp?.name_original as string) ?? "";
  }

  return {
    ok: true,
    role: actor.role,
    evidenceCount: evidenceCount ?? 0,
    ledgerRows,
    originalLedgerRows,
    item: {
      id: data.id,
      type: data.type,
      status: data.status,
      txnDate: data.txn_date,
      periodKey: data.period_key,
      currency: data.currency,
      fxRate: data.fx_rate,
      amountVnd: data.amount_vnd,
      counterpartyName,
      invoiceSeries: data.invoice_series ?? "",
      invoiceNo: data.invoice_no ?? "",
      invoiceDate: data.invoice_date ?? "",
      correctsTxnId: originalId,
      fxUnverified: data.currency !== "VND",
      hasEvidence: (evidenceCount ?? 0) >= 1,
    },
  };
}
