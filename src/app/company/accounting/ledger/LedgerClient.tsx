"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { AccountingModuleHeader } from "@/lib/accounting/AccountingModuleHeader";
import { accountingMessage, type AccountingLocale, type AccountingMessageKey } from "@/lib/accounting/uiCatalog";

type Row = {
  id: string;
  txnId: string;
  entryDate: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  memo: string;
  memoTranslationPending: boolean;
  counterpartyName: string;
  usesUnverifiedBasis: boolean;
  fxConversionUnverified: boolean;
};

type Party = { id: string; name: string };

function uiLocale(locale: string): AccountingLocale {
  return locale === "vi" ? "vi" : "ko";
}

function formatAmount(locale: AccountingLocale, value: number): string {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "ko-KR", { maximumFractionDigits: 0 }).format(
    Math.round(value)
  );
}

function formatDate(locale: AccountingLocale, iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  if (locale === "vi") return `${match[3]}/${match[2]}/${match[1]}`;
  return `${match[1]}.${match[2]}.${match[3]}`;
}

const FONT_SCALE_CLASS = {
  sm: "text-[13px]",
  md: "text-[14px]",
  lg: "text-[16px]",
} as const;

export default function LedgerClient() {
  const { locale: appLocale } = useLocale();
  const loc = uiLocale(appLocale);
  const t = (key: AccountingMessageKey) => accountingMessage(loc, key);

  const [phase, setPhase] = useState<"loading" | "signed_out" | "denied" | "ready">("loading");
  const [token, setToken] = useState("");
  const [fontScale, setFontScale] = useState<"sm" | "md" | "lg">("md");
  const [period, setPeriod] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [accountCode, setAccountCode] = useState("");
  const [counterpartyId, setCounterpartyId] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [parties, setParties] = useState<Party[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [sumDebit, setSumDebit] = useState(0);
  const [sumCredit, setSumCredit] = useState(0);
  const [banner, setBanner] = useState(false);
  const pageSize = 25;

  const authHeaders = useCallback(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  const loadLedger = useCallback(async () => {
    if (!token) return;
    const params = new URLSearchParams({ locale: loc, page: String(page), pageSize: String(pageSize) });
    if (period) params.set("period", period);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (accountCode.trim()) params.set("accountCode", accountCode.trim());
    if (counterpartyId) params.set("counterpartyId", counterpartyId);
    if (q.trim()) params.set("q", q.trim());
    const res = await fetch(`/api/accounting/ledger?${params.toString()}`, { headers: authHeaders() });
    if (res.status === 401) {
      setPhase("signed_out");
      return;
    }
    if (res.status === 403) {
      setPhase("denied");
      return;
    }
    const body = (await res.json()) as {
      items?: Row[];
      total?: number;
      sumDebit?: number;
      sumCredit?: number;
      bannerUnverifiedBasis?: boolean;
    };
    setRows(body.items ?? []);
    setTotal(body.total ?? 0);
    setSumDebit(body.sumDebit ?? 0);
    setSumCredit(body.sumCredit ?? 0);
    setBanner(Boolean(body.bannerUnverifiedBasis));
    setPhase("ready");
  }, [token, loc, period, dateFrom, dateTo, accountCode, counterpartyId, q, page, authHeaders]);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getSession();
      const access = data.session?.access_token ?? "";
      if (!access) {
        setPhase("signed_out");
        return;
      }
      setToken(access);
      const cpRes = await fetch("/api/accounting/counterparties", {
        headers: { Authorization: `Bearer ${access}` },
      });
      if (cpRes.ok) {
        const cpBody = (await cpRes.json()) as { items?: { id: string; name: string }[] };
        setParties((cpBody.items ?? []).map((p) => ({ id: p.id, name: p.name })));
      }
    })();
  }, []);

  useEffect(() => {
    if (!token) return;
    void loadLedger();
  }, [token, loadLedger]);

  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  return (
    <div className={`min-h-screen overflow-x-hidden bg-[#F7F9FC] text-[#071A33] ${FONT_SCALE_CLASS[fontScale]}`}>
      <AccountingModuleHeader locale={loc} active="ledger" />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[22px] font-extrabold tracking-[-0.03em] sm:text-[28px]">{t("accounting.ledger.title")}</h1>
            <p className="mt-2 max-w-2xl leading-6 text-[#3D4B63]">{t("accounting.ledger.lead")}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6B7A90]">{t("accounting.ledger.font_size")}</span>
            {(["sm", "md", "lg"] as const).map((size) => (
              <button
                key={size}
                type="button"
                className={`min-h-9 rounded-lg px-2 text-xs font-semibold ${
                  fontScale === size ? "bg-[#071A33] text-white" : "bg-white border border-[#E3E8F0]"
                }`}
                onClick={() => setFontScale(size)}
              >
                {t(`accounting.ledger.font.${size}` as AccountingMessageKey)}
              </button>
            ))}
          </div>
        </div>

        {phase === "signed_out" ? (
          <div className="mt-8 rounded-[14px] border border-[#E3E8F0] bg-white p-5">
            <p className="leading-6">{t("accounting.ledger.sign_in")}</p>
            <Link href="/login" className="mt-4 inline-flex min-h-11 items-center font-semibold text-[#2563EB]">
              {t("accounting.txn.sign_in_link")}
            </Link>
          </div>
        ) : null}
        {phase === "denied" ? (
          <p className="mt-8 rounded-[14px] border border-[#E3E8F0] bg-white p-5 leading-6">{t("accounting.ledger.access_denied")}</p>
        ) : null}

        {phase === "ready" || phase === "loading" ? (
          <>
            {banner ? (
              <p className="mt-6 rounded-[14px] border border-amber-200 bg-amber-50 px-4 py-3 font-semibold text-amber-900">
                {t("accounting.ledger.banner.unverified_basis")}
              </p>
            ) : null}

            <section className="mt-6 rounded-[14px] border border-[#E3E8F0] bg-white p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className="text-xs font-semibold text-[#6B7A90]">
                  {t("accounting.ledger.filter.period")}
                  <input
                    type="month"
                    value={period}
                    onChange={(e) => {
                      setPage(1);
                      setPeriod(e.target.value);
                    }}
                    className="mt-1 min-h-11 w-full rounded-lg border border-[#E3E8F0] px-3"
                  />
                </label>
                <label className="text-xs font-semibold text-[#6B7A90]">
                  {t("accounting.ledger.filter.date_from")}
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setPage(1);
                      setDateFrom(e.target.value);
                    }}
                    className="mt-1 min-h-11 w-full rounded-lg border border-[#E3E8F0] px-3"
                  />
                </label>
                <label className="text-xs font-semibold text-[#6B7A90]">
                  {t("accounting.ledger.filter.date_to")}
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setPage(1);
                      setDateTo(e.target.value);
                    }}
                    className="mt-1 min-h-11 w-full rounded-lg border border-[#E3E8F0] px-3"
                  />
                </label>
                <label className="text-xs font-semibold text-[#6B7A90]">
                  {t("accounting.ledger.filter.account")}
                  <input
                    value={accountCode}
                    onChange={(e) => {
                      setPage(1);
                      setAccountCode(e.target.value);
                    }}
                    className="mt-1 min-h-11 w-full rounded-lg border border-[#E3E8F0] px-3"
                  />
                </label>
                <label className="text-xs font-semibold text-[#6B7A90]">
                  {t("accounting.ledger.filter.counterparty")}
                  <select
                    value={counterpartyId}
                    onChange={(e) => {
                      setPage(1);
                      setCounterpartyId(e.target.value);
                    }}
                    className="mt-1 min-h-11 w-full rounded-lg border border-[#E3E8F0] px-3"
                  >
                    <option value="">{t("accounting.txn.filter.all")}</option>
                    {parties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-semibold text-[#6B7A90] sm:col-span-2 lg:col-span-1">
                  {t("accounting.ledger.filter.search")}
                  <input
                    value={q}
                    placeholder={t("accounting.ledger.filter.search_hint")}
                    onChange={(e) => {
                      setPage(1);
                      setQ(e.target.value);
                    }}
                    className="mt-1 min-h-11 w-full rounded-lg border border-[#E3E8F0] px-3"
                  />
                </label>
              </div>
              <button
                type="button"
                className="mt-4 min-h-11 rounded-lg bg-[#2563EB] px-4 font-semibold text-white"
                onClick={() => void loadLedger()}
              >
                {t("accounting.ledger.filter.search")}
              </button>
            </section>

            <section className="mt-6 overflow-hidden rounded-[14px] border border-[#E3E8F0] bg-white">
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full text-left">
                  <thead className="border-b border-[#E3E8F0] bg-[#F7F9FC] text-xs font-bold text-[#6B7A90]">
                    <tr>
                      <th className="px-3 py-3">{t("accounting.ledger.col.date")}</th>
                      <th className="px-3 py-3">{t("accounting.ledger.col.account")}</th>
                      <th className="px-3 py-3 text-right">{t("accounting.ledger.col.debit")}</th>
                      <th className="px-3 py-3 text-right">{t("accounting.ledger.col.credit")}</th>
                      <th className="px-3 py-3">{t("accounting.ledger.col.memo")}</th>
                      <th className="px-3 py-3">{t("accounting.ledger.col.counterparty")}</th>
                      <th className="px-3 py-3">{t("accounting.ledger.col.txn")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-b border-[#E3E8F0] align-top">
                        <td className="px-3 py-3 whitespace-nowrap">{formatDate(loc, row.entryDate)}</td>
                        <td className="px-3 py-3">
                          {row.accountName}
                          <span className="mt-0.5 block text-xs text-[#6B7A90]">{row.accountCode}</span>
                          {row.usesUnverifiedBasis ? (
                            <span className="mt-1 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-900">
                              {t("accounting.ledger.badge.unverified_basis")}
                            </span>
                          ) : null}
                          {row.fxConversionUnverified ? (
                            <span className="mt-1 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-900">
                              {t("accounting.ledger.badge.fx_unverified")}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">
                          {row.debit > 0 ? `${formatAmount(loc, row.debit)} ${t("accounting.txn.unit.vnd")}` : "—"}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">
                          {row.credit > 0 ? `${formatAmount(loc, row.credit)} ${t("accounting.txn.unit.vnd")}` : "—"}
                        </td>
                        <td className="px-3 py-3">
                          {row.memo}
                          {row.memoTranslationPending ? (
                            <span className="ml-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-700">
                              {t("accounting.ledger.badge.translation_pending")}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-3 py-3">{row.counterpartyName || "—"}</td>
                        <td className="px-3 py-3">
                          <Link href={`/company/accounting/transactions/${row.txnId}`} className="font-semibold text-[#2563EB]">
                            {row.txnId.slice(0, 8)}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-[#E3E8F0] md:hidden">
                {rows.map((row) => (
                  <Link
                    key={row.id}
                    href={`/company/accounting/transactions/${row.txnId}`}
                    className="block px-4 py-4"
                  >
                    <p className="font-bold">{formatDate(loc, row.entryDate)} · {row.accountName}</p>
                    <p className="mt-1 text-xs text-[#6B7A90]">{row.accountCode}</p>
                    <p className="mt-2">
                      {row.memo}
                      {row.memoTranslationPending ? (
                        <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold">
                          {t("accounting.ledger.badge.translation_pending")}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-2 text-right tabular-nums font-semibold">
                      {row.debit > 0
                        ? `${t("accounting.ledger.col.debit")} ${formatAmount(loc, row.debit)}`
                        : `${t("accounting.ledger.col.credit")} ${formatAmount(loc, row.credit)}`}
                      {" "}
                      {t("accounting.txn.unit.vnd")}
                    </p>
                  </Link>
                ))}
              </div>

              {rows.length === 0 ? <p className="p-6 text-center text-[#6B7A90]">{t("accounting.ledger.empty")}</p> : null}

              <div className="flex flex-col gap-2 border-t border-[#E3E8F0] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-semibold">
                  {t("accounting.ledger.totals")}: {t("accounting.ledger.col.debit")}{" "}
                  {formatAmount(loc, sumDebit)} / {t("accounting.ledger.col.credit")} {formatAmount(loc, sumCredit)}{" "}
                  {t("accounting.txn.unit.vnd")}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    className="min-h-10 rounded-lg border border-[#E3E8F0] px-3 disabled:opacity-40"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    ←
                  </button>
                  <span className="text-sm">
                    {t("accounting.ledger.page")} {page} / {pageCount}
                  </span>
                  <button
                    type="button"
                    disabled={page >= pageCount}
                    className="min-h-10 rounded-lg border border-[#E3E8F0] px-3 disabled:opacity-40"
                    onClick={() => setPage((p) => p + 1)}
                  >
                    →
                  </button>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
