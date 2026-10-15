"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  accountingMessage,
  type AccountingLocale,
  type AccountingMessageKey,
} from "@/lib/accounting/uiCatalog";
import {
  buildTxnChecks,
  computeAmountVnd,
  TXN_TYPES,
  type CheckLevel,
  type TxnCheck,
  type TxnType,
} from "@/lib/accounting/transactionEntry";

type Item = {
  id: string;
  type: TxnType;
  status: string;
  txnDate: string;
  periodKey: string;
  currency: string;
  amountVnd: number;
  invoiceNo: string | null;
  counterpartyName: string;
  fxUnverified: boolean;
};

type Party = { id: string; name: string };

const LEVEL_CLASS: Record<CheckLevel, string> = {
  ok: "border-emerald-200 bg-emerald-50 text-emerald-700",
  mid: "border-amber-200 bg-amber-50 text-amber-700",
  warn: "border-red-200 bg-red-50 text-red-700",
};

function uiLocale(locale: string): AccountingLocale {
  return locale === "vi" ? "vi" : "ko";
}

function formatAmount(locale: AccountingLocale, value: number): string {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "ko-KR", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function formatDate(locale: AccountingLocale, iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  if (locale === "vi") return `${match[3]}/${match[2]}/${match[1]}`;
  return `${match[1]}.${match[2]}.${match[3]}`;
}

function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[^\d]/g, "");
  if (!cleaned) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

function parseRate(raw: string): number | null {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned || cleaned === ".") return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

function noticeKey(error: string): AccountingMessageKey {
  if (error === "CONFIRM_FORBIDDEN") return "accounting.txn.error.confirm_role";
  if (error === "CONFIRMED_LOCKED") return "accounting.txn.error.confirmed_locked";
  if (error === "ORG_NOT_APPROVED" || error === "NO_ORG") return "accounting.txn.access_denied";
  return "accounting.txn.error.generic";
}

const emptyForm = {
  type: "sale" as TxnType,
  txnDate: "",
  counterpartyId: "",
  newCounterpartyName: "",
  invoiceSeries: "",
  invoiceNo: "",
  invoiceDate: "",
  currency: "VND",
  fxRate: "",
  amountNet: "",
  vatRate: "",
  vatAmount: "",
};

export default function TransactionEntryClient() {
  const { locale } = useLocale();
  const lang = uiLocale(locale);
  const t = useCallback((key: AccountingMessageKey) => accountingMessage(lang, key), [lang]);

  const [phase, setPhase] = useState<"loading" | "signed_out" | "denied" | "ready">("loading");
  const [role, setRole] = useState("");
  const [token, setToken] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [txnId, setTxnId] = useState<string | null>(null);
  const [txnStatus, setTxnStatus] = useState<string>("draft");
  const [checks, setChecks] = useState<TxnCheck[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [period, setPeriod] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [notice, setNotice] = useState<AccountingMessageKey | null>(null);
  const [busy, setBusy] = useState(false);

  const readOnly = txnStatus === "confirmed";

  const liveChecks = useMemo(
    () =>
      buildTxnChecks({
        type: form.type,
        txnDate: form.txnDate,
        counterpartyId: form.counterpartyId || null,
        newCounterpartyName: form.newCounterpartyName || null,
        invoiceSeries: form.invoiceSeries,
        invoiceNo: form.invoiceNo,
        invoiceDate: form.invoiceDate,
        currency: form.currency,
        fxRate: parseRate(form.fxRate),
        amountNet: parseAmount(form.amountNet),
        vatRate: parseRate(form.vatRate),
        vatAmount: parseAmount(form.vatAmount),
      }),
    [form]
  );

  const shownChecks = checks.length > 0 ? checks : liveChecks;
  const net = parseAmount(form.amountNet) ?? 0;
  const vat = parseAmount(form.vatAmount) ?? 0;
  const fx = parseRate(form.fxRate);
  const currency = form.currency.toUpperCase();
  const totalVnd = computeAmountVnd(currency, net, vat, currency === "VND" ? null : fx);

  const authHeaders = useCallback(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  const loadLists = useCallback(
    async (accessToken: string, nextPeriod: string, nextType: string, nextStatus: string) => {
      const params = new URLSearchParams();
      if (nextPeriod) params.set("period", nextPeriod);
      if (nextType) params.set("type", nextType);
      if (nextStatus) params.set("status", nextStatus);
      const [listRes, partyRes] = await Promise.all([
        fetch(`/api/accounting/transactions?${params.toString()}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch("/api/accounting/counterparties", {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);
      if (listRes.status === 401) {
        setPhase("signed_out");
        return;
      }
      if (listRes.status === 403) {
        setPhase("denied");
        return;
      }
      if (!listRes.ok) {
        setNotice("accounting.txn.error.generic");
        return;
      }
      const listBody = (await listRes.json()) as { role: string; items: Item[] };
      setRole(listBody.role);
      setItems(listBody.items);
      if (partyRes.ok) {
        const partyBody = (await partyRes.json()) as { items: Party[] };
        setParties(partyBody.items);
      }
      setPhase("ready");
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      const access = data.session?.access_token ?? "";
      if (cancelled) return;
      if (!access) {
        setPhase("signed_out");
        return;
      }
      setToken(access);
      await loadLists(access, "", "", "");
    })();
    return () => {
      cancelled = true;
    };
  }, [loadLists]);

  function patchForm(partial: Partial<typeof emptyForm>) {
    setChecks([]);
    setForm((current) => ({ ...current, ...partial }));
  }

  function startNew(type: TxnType = form.type) {
    setTxnId(null);
    setTxnStatus("draft");
    setChecks([]);
    setNotice(null);
    setForm({ ...emptyForm, type });
  }

  async function openItem(id: string) {
    setBusy(true);
    setNotice(null);
    const res = await fetch(`/api/accounting/transactions/${id}`, { headers: authHeaders() });
    setBusy(false);
    if (!res.ok) {
      setNotice("accounting.txn.error.generic");
      return;
    }
    const body = (await res.json()) as {
      role: string;
      checks: TxnCheck[];
      item: {
        id: string;
        type: TxnType;
        status: string;
        txnDate: string;
        currency: string;
        fxRate: number | null;
        counterpartyId: string | null;
        invoiceSeries: string;
        invoiceNo: string;
        invoiceDate: string;
        amountNet: number;
        vatRate: number | null;
        vatAmount: number;
      };
    };
    setRole(body.role);
    setTxnId(body.item.id);
    setTxnStatus(body.item.status);
    setChecks(body.checks);
    setForm({
      type: body.item.type,
      txnDate: body.item.txnDate,
      counterpartyId: body.item.counterpartyId ?? "",
      newCounterpartyName: "",
      invoiceSeries: body.item.invoiceSeries,
      invoiceNo: body.item.invoiceNo,
      invoiceDate: body.item.invoiceDate,
      currency: body.item.currency,
      fxRate: body.item.fxRate === null ? "" : String(body.item.fxRate),
      amountNet: String(body.item.amountNet),
      vatRate: body.item.vatRate === null ? "" : String(body.item.vatRate),
      vatAmount: String(body.item.vatAmount),
    });
  }

  async function save(action: "draft" | "submit" | "confirm") {
    if (readOnly || !token) return;
    setBusy(true);
    setNotice(null);
    const payload = {
      action,
      type: form.type,
      txnDate: form.txnDate,
      counterpartyId: form.counterpartyId,
      newCounterpartyName: form.newCounterpartyName,
      invoiceSeries: form.invoiceSeries,
      invoiceNo: form.invoiceNo,
      invoiceDate: form.invoiceDate,
      currency: form.currency,
      fxRate: form.fxRate,
      amountNet: form.amountNet,
      vatRate: form.vatRate,
      vatAmount: form.vatAmount,
    };
    const res = await fetch(txnId ? `/api/accounting/transactions/${txnId}` : "/api/accounting/transactions", {
      method: txnId ? "PATCH" : "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      checks?: TxnCheck[];
      id?: string;
      status?: string;
      role?: string;
    };
    setBusy(false);
    if (body.checks) setChecks(body.checks);
    if (!res.ok) {
      setNotice(noticeKey(body.error ?? ""));
      return;
    }
    setNotice("accounting.txn.saved");
    if (body.id) setTxnId(body.id);
    if (body.status) setTxnStatus(body.status);
    if (body.role) setRole(body.role);
    await loadLists(token, period, filterType, filterStatus);
  }

  function focusField(field: string) {
    const node = document.getElementById(`txn-field-${field}`);
    node?.scrollIntoView({ block: "center" });
    if (node instanceof HTMLElement) node.focus();
  }

  const typeLabel = (type: string) => t(`accounting.txn.tab.${type}` as AccountingMessageKey);
  const statusLabel = (status: string) => t(`accounting.txn.status.${status}` as AccountingMessageKey);
  const levelLabel = (level: CheckLevel) =>
    t(level === "ok" ? "accounting.txn.level.ok" : level === "mid" ? "accounting.txn.level.mid" : "accounting.txn.level.warn");

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F9FC] text-[#071A33]">
      <header className="border-b border-[#E3E8F0] bg-white">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-4 sm:px-6">
          <p className="text-[15px] font-extrabold tracking-[-0.02em]">{t("accounting.shell.brand")}</p>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="text-[22px] font-extrabold tracking-[-0.03em] sm:text-[28px]">{t("accounting.txn.title")}</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#3D4B63]">{t("accounting.txn.lead")}</p>

        {phase === "loading" ? <p className="mt-8 text-sm text-[#6B7A90]">{t("accounting.txn.loading")}</p> : null}
        {phase === "signed_out" ? (
          <div className="mt-8 rounded-[14px] border border-[#E3E8F0] bg-white p-5">
            <p className="text-sm leading-6">{t("accounting.txn.sign_in")}</p>
            <Link href="/login" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[#2563EB]">
              {t("accounting.txn.sign_in_link")}
            </Link>
          </div>
        ) : null}
        {phase === "denied" ? (
          <p className="mt-8 rounded-[14px] border border-[#E3E8F0] bg-white p-5 text-sm leading-6">
            {t("accounting.txn.access_denied")}
          </p>
        ) : null}

        {phase === "ready" ? (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section className="rounded-[14px] border border-[#E3E8F0] bg-white p-4 sm:p-6">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {TXN_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`min-h-11 rounded-lg px-2 text-sm font-semibold ${
                      form.type === type ? "bg-[#071A33] text-white" : "bg-[#F7F9FC] text-[#3D4B63]"
                    }`}
                    onClick={() => {
                      if (readOnly) return;
                      patchForm({ type });
                    }}
                  >
                    {typeLabel(type)}
                  </button>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold" htmlFor="txn-field-txnDate">
                  {t("accounting.txn.field.date")}
                  <input
                    id="txn-field-txnDate"
                    type="date"
                    disabled={readOnly}
                    value={form.txnDate}
                    onChange={(event) => patchForm({ txnDate: event.target.value })}
                    className="mt-1 min-h-11 w-full rounded-lg border border-[#E3E8F0] px-3 text-right text-sm"
                  />
                </label>
                <label className="block text-sm font-semibold" htmlFor="txn-field-counterparty">
                  {t("accounting.txn.field.counterparty")}
                  <select
                    id="txn-field-counterparty"
                    disabled={readOnly}
                    value={form.counterpartyId}
                    onChange={(event) => patchForm({ counterpartyId: event.target.value })}
                    className="mt-1 min-h-11 w-full rounded-lg border border-[#E3E8F0] px-3 text-sm"
                  >
                    <option value="">{t("accounting.txn.counterparty_none")}</option>
                    {parties.map((party) => (
                      <option key={party.id} value={party.id}>
                        {party.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-semibold sm:col-span-2" htmlFor="txn-field-new-counterparty">
                  {t("accounting.txn.field.counterparty_new")}
                  <input
                    id="txn-field-new-counterparty"
                    disabled={readOnly}
                    value={form.newCounterpartyName}
                    onChange={(event) => patchForm({ newCounterpartyName: event.target.value, counterpartyId: "" })}
                    className="mt-1 min-h-11 w-full rounded-lg border border-[#E3E8F0] px-3 text-sm"
                  />
                </label>
                <label className="block text-sm font-semibold" htmlFor="txn-field-invoiceSeries">
                  {t("accounting.txn.field.invoice_series")}
                  <input
                    id="txn-field-invoiceSeries"
                    disabled={readOnly}
                    value={form.invoiceSeries}
                    onChange={(event) => patchForm({ invoiceSeries: event.target.value })}
                    className="mt-1 min-h-11 w-full rounded-lg border border-[#E3E8F0] px-3 text-sm"
                  />
                </label>
                <label className="block text-sm font-semibold" htmlFor="txn-field-invoiceNo">
                  {t("accounting.txn.field.invoice_no")}
                  <input
                    id="txn-field-invoiceNo"
                    disabled={readOnly}
                    value={form.invoiceNo}
                    onChange={(event) => patchForm({ invoiceNo: event.target.value })}
                    className="mt-1 min-h-11 w-full rounded-lg border border-[#E3E8F0] px-3 text-sm"
                  />
                </label>
                <label className="block text-sm font-semibold" htmlFor="txn-field-invoiceDate">
                  {t("accounting.txn.field.invoice_date")}
                  <input
                    id="txn-field-invoiceDate"
                    type="date"
                    disabled={readOnly}
                    value={form.invoiceDate}
                    onChange={(event) => patchForm({ invoiceDate: event.target.value })}
                    className="mt-1 min-h-11 w-full rounded-lg border border-[#E3E8F0] px-3 text-right text-sm"
                  />
                </label>
                <label className="block text-sm font-semibold" htmlFor="txn-field-currency">
                  {t("accounting.txn.field.currency")}
                  <input
                    id="txn-field-currency"
                    disabled={readOnly}
                    value={form.currency}
                    onChange={(event) => patchForm({ currency: event.target.value.toUpperCase().slice(0, 3) })}
                    className="mt-1 min-h-11 w-full rounded-lg border border-[#E3E8F0] px-3 text-right text-sm uppercase"
                  />
                </label>
                <label className="block text-sm font-semibold" htmlFor="txn-field-fxRate">
                  {t("accounting.txn.field.fx_rate")}
                  <input
                    id="txn-field-fxRate"
                    inputMode="decimal"
                    disabled={readOnly || currency === "VND"}
                    value={form.fxRate}
                    onChange={(event) => patchForm({ fxRate: event.target.value })}
                    className="mt-1 min-h-11 w-full rounded-lg border border-[#E3E8F0] px-3 text-right text-sm tabular-nums"
                  />
                </label>
                {currency !== "VND" ? (
                  <p className="text-xs font-semibold text-amber-700 sm:col-span-2">{t("accounting.txn.fx_unverified")}</p>
                ) : null}
                <label className="block text-sm font-semibold" htmlFor="txn-field-amountNet">
                  {t("accounting.txn.field.amount_net")}
                  <span className="mt-1 flex min-h-11 items-center rounded-lg border border-[#E3E8F0] px-3">
                    <input
                      id="txn-field-amountNet"
                      inputMode="numeric"
                      disabled={readOnly}
                      value={form.amountNet === "" ? "" : formatAmount(lang, Number(form.amountNet))}
                      onChange={(event) => patchForm({ amountNet: event.target.value.replace(/[^\d]/g, "") })}
                      className="w-full bg-transparent text-right text-sm tabular-nums outline-none"
                    />
                    <span className="ml-2 shrink-0 text-xs text-[#6B7A90]">
                      {currency === "VND" ? t("accounting.txn.unit.vnd") : currency}
                    </span>
                  </span>
                </label>
                <label className="block text-sm font-semibold" htmlFor="txn-field-vatRate">
                  {t("accounting.txn.field.vat_rate")}
                  <span className="mt-1 flex min-h-11 items-center rounded-lg border border-[#E3E8F0] px-3">
                    <input
                      id="txn-field-vatRate"
                      inputMode="decimal"
                      disabled={readOnly}
                      value={form.vatRate}
                      onChange={(event) => patchForm({ vatRate: event.target.value.replace(/[^\d.]/g, "") })}
                      className="w-full bg-transparent text-right text-sm tabular-nums outline-none"
                    />
                    <span className="ml-2 shrink-0 text-xs text-[#6B7A90]">{t("accounting.txn.unit.percent")}</span>
                  </span>
                </label>
                <label className="block text-sm font-semibold" htmlFor="txn-field-vatAmount">
                  {t("accounting.txn.field.vat_amount")}
                  <span className="mt-1 flex min-h-11 items-center rounded-lg border border-[#E3E8F0] px-3">
                    <input
                      id="txn-field-vatAmount"
                      inputMode="numeric"
                      disabled={readOnly}
                      value={form.vatAmount === "" ? "" : formatAmount(lang, Number(form.vatAmount))}
                      onChange={(event) => patchForm({ vatAmount: event.target.value.replace(/[^\d]/g, "") })}
                      className="w-full bg-transparent text-right text-sm tabular-nums outline-none"
                    />
                    <span className="ml-2 shrink-0 text-xs text-[#6B7A90]">{t("accounting.txn.unit.vnd")}</span>
                  </span>
                </label>
                <div className="rounded-lg bg-[#F7F9FC] px-3 py-3">
                  <p className="text-xs font-semibold text-[#6B7A90]">{t("accounting.txn.field.total")}</p>
                  <p className="mt-1 text-right text-lg font-extrabold tabular-nums">
                    {formatAmount(lang, totalVnd ?? net + vat)}
                    <span className="ml-2 text-xs font-semibold text-[#6B7A90]">{t("accounting.txn.unit.vnd")}</span>
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <h2 className="text-sm font-extrabold">{t("accounting.txn.checks.title")}</h2>
                <ul className="mt-2 space-y-2">
                  {shownChecks.map((check) => (
                    <li key={check.code}>
                      <button
                        type="button"
                        onClick={() => focusField(check.field)}
                        className={`flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm ${LEVEL_CLASS[check.level]}`}
                      >
                        <span className="shrink-0 font-bold">{levelLabel(check.level)}</span>
                        <span>{t(check.messageKey)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {notice ? <p className="mt-4 text-sm font-semibold">{t(notice)}</p> : null}

              {readOnly ? null : (
                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void save("draft")}
                    className="min-h-11 rounded-lg border border-[#E3E8F0] text-sm font-semibold"
                  >
                    {t("accounting.txn.action.draft")}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void save("submit")}
                    className="min-h-11 rounded-lg bg-[#2563EB] text-sm font-semibold text-white"
                  >
                    {t("accounting.txn.action.submit")}
                  </button>
                  {role === "company_owner" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void save("confirm")}
                      className="min-h-11 rounded-lg bg-[#071A33] text-sm font-semibold text-white"
                    >
                      {t("accounting.txn.action.confirm")}
                    </button>
                  ) : null}
                </div>
              )}
              <button type="button" onClick={() => startNew()} className="mt-3 min-h-11 text-sm font-semibold text-[#2563EB]">
                {t("accounting.txn.action.new")}
              </button>
            </section>

            <aside className="rounded-[14px] border border-[#E3E8F0] bg-white p-4 sm:p-5">
              <h2 className="text-base font-extrabold">{t("accounting.txn.list.title")}</h2>
              <div className="mt-3 grid grid-cols-1 gap-2">
                <label className="text-xs font-semibold text-[#6B7A90]" htmlFor="txn-filter-period">
                  {t("accounting.txn.filter.period")}
                  <input
                    id="txn-filter-period"
                    type="month"
                    value={period}
                    onChange={(event) => {
                      setPeriod(event.target.value);
                      void loadLists(token, event.target.value, filterType, filterStatus);
                    }}
                    className="mt-1 min-h-11 w-full rounded-lg border border-[#E3E8F0] px-3 text-sm"
                  />
                </label>
                <label className="text-xs font-semibold text-[#6B7A90]" htmlFor="txn-filter-type">
                  {t("accounting.txn.filter.type")}
                  <select
                    id="txn-filter-type"
                    value={filterType}
                    onChange={(event) => {
                      setFilterType(event.target.value);
                      void loadLists(token, period, event.target.value, filterStatus);
                    }}
                    className="mt-1 min-h-11 w-full rounded-lg border border-[#E3E8F0] px-3 text-sm"
                  >
                    <option value="">{t("accounting.txn.filter.all")}</option>
                    {TXN_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {typeLabel(type)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-semibold text-[#6B7A90]" htmlFor="txn-filter-status">
                  {t("accounting.txn.filter.status")}
                  <select
                    id="txn-filter-status"
                    value={filterStatus}
                    onChange={(event) => {
                      setFilterStatus(event.target.value);
                      void loadLists(token, period, filterType, event.target.value);
                    }}
                    className="mt-1 min-h-11 w-full rounded-lg border border-[#E3E8F0] px-3 text-sm"
                  >
                    <option value="">{t("accounting.txn.filter.all")}</option>
                    {(["draft", "submitted", "confirmed"] as const).map((status) => (
                      <option key={status} value={status}>
                        {statusLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {items.length === 0 ? (
                <p className="mt-4 text-sm text-[#6B7A90]">{t("accounting.txn.list.empty")}</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => void openItem(item.id)}
                        className="w-full rounded-lg border border-[#E3E8F0] px-3 py-3 text-left hover:bg-[#F7F9FC]"
                      >
                        <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                          <span>{typeLabel(item.type)}</span>
                          <span>{statusLabel(item.status)}</span>
                        </span>
                        <span className="mt-1 flex items-center justify-between gap-2 text-xs text-[#6B7A90]">
                          <span>{formatDate(lang, item.txnDate)}</span>
                          <span className="tabular-nums">
                            {formatAmount(lang, Number(item.amountVnd))} {t("accounting.txn.unit.vnd")}
                          </span>
                        </span>
                        {item.fxUnverified ? (
                          <span className="mt-1 block text-xs font-semibold text-amber-700">
                            {t("accounting.txn.fx_unverified")}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </div>
        ) : null}
      </main>
    </div>
  );
}
