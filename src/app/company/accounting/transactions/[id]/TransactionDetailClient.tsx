"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { accountingSupabase as supabase } from "@/lib/accounting/accountingSupabaseClient";
import { useAccountingCatalogLocale } from "@/lib/accounting/AccountingCatalogLocale";
import TransactionExtrasPanel from "./TransactionExtrasPanel";
import { accountingMessage, type AccountingLocale, type AccountingMessageKey } from "@/lib/accounting/uiCatalog";

type LedgerRow = {
  id: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  memo: string;
  memoTranslationPending: boolean;
  usesUnverifiedBasis: boolean;
  fxConversionUnverified: boolean;
};

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

function LedgerTable({
  locale,
  rows,
  t,
}: {
  locale: AccountingLocale;
  rows: LedgerRow[];
  t: (key: AccountingMessageKey) => string;
}) {
  if (rows.length === 0) return <p className="text-sm text-[#6B7A90]">—</p>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="text-xs font-bold text-[#6B7A90]">
            <th className="py-2 pr-3">{t("accounting.ledger.col.account")}</th>
            <th className="py-2 pr-3 text-right">{t("accounting.ledger.col.debit")}</th>
            <th className="py-2 pr-3 text-right">{t("accounting.ledger.col.credit")}</th>
            <th className="py-2">{t("accounting.ledger.col.memo")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-[#E3E8F0] align-top">
              <td className="py-2 pr-3">
                {row.accountName}
                <span className="block text-xs text-[#6B7A90]">{row.accountCode}</span>
              </td>
              <td className="py-2 pr-3 text-right tabular-nums">
                {row.debit > 0 ? formatAmount(locale, row.debit) : "—"}
              </td>
              <td className="py-2 pr-3 text-right tabular-nums">
                {row.credit > 0 ? formatAmount(locale, row.credit) : "—"}
              </td>
              <td className="py-2">
                {row.memo}
                {row.memoTranslationPending ? (
                  <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold">
                    {t("accounting.ledger.badge.translation_pending")}
                  </span>
                ) : null}
                {row.usesUnverifiedBasis ? (
                  <span
                    className="ml-1 rounded bg-[#FEF3C7] px-1.5 py-0.5 text-[11px] font-semibold text-[#92400E]"
                    data-testid="ledger-unverified-basis"
                  >
                    {t("accounting.ledger.badge.unverified_basis")}
                  </span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TransactionDetailClient({ txnId }: { txnId: string }) {
  const { locale: catalogLocale } = useAccountingCatalogLocale();
  const loc = catalogLocale;
  const t = (key: AccountingMessageKey) => accountingMessage(loc, key);
  const [phase, setPhase] = useState<"loading" | "error" | "ready">("loading");
  const [item, setItem] = useState<Record<string, unknown> | null>(null);
  const [ledgerRows, setLedgerRows] = useState<LedgerRow[]>([]);
  const [originalLedgerRows, setOriginalLedgerRows] = useState<LedgerRow[]>([]);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setPhase("error");
        return;
      }
      const res = await fetch(`/api/accounting/ledger/transaction/${txnId}?locale=${loc}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setPhase("error");
        return;
      }
      const body = (await res.json()) as {
        item: Record<string, unknown>;
        ledgerRows: LedgerRow[];
        originalLedgerRows: LedgerRow[];
      };
      setItem(body.item);
      setLedgerRows(body.ledgerRows);
      setOriginalLedgerRows(body.originalLedgerRows);
      setPhase("ready");
    })();
  }, [txnId, loc]);

  const statusLabel = (status: string) => t(`accounting.txn.status.${status}` as AccountingMessageKey);
  const typeLabel = (type: string) => t(`accounting.txn.tab.${type}` as AccountingMessageKey);

  return (
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 text-[14px] text-[#071A33]">
        <Link href="/company/accounting/ledger" className="text-sm font-semibold text-[#2563EB]">
          ← {t("accounting.ledger.detail.back")}
        </Link>
        <h1 className="mt-4 text-[22px] font-extrabold sm:text-[26px]">{t("accounting.ledger.detail.title")}</h1>

        {phase === "loading" ? <p className="mt-6">{t("accounting.txn.loading")}</p> : null}
        {phase === "error" ? <p className="mt-6">{t("accounting.txn.error.generic")}</p> : null}

        {phase === "ready" && item ? (
          <div className="mt-6 space-y-6">
            <section className="rounded-[14px] border border-[#E3E8F0] bg-white p-5">
              <p className="font-bold">{typeLabel(String(item.type))} · {statusLabel(String(item.status))}</p>
              <p className="mt-2 text-sm text-[#3D4B63]">
                {formatDate(loc, String(item.txnDate))} · {String(item.counterpartyName || "—")}
              </p>
              <p className="mt-2 text-right text-lg font-extrabold tabular-nums">
                {formatAmount(loc, Number(item.amountVnd))} {t("accounting.txn.unit.vnd")}
              </p>
              <p className="mt-3 text-sm">
                {item.hasEvidence
                  ? t("accounting.ledger.detail.evidence_linked")
                  : t("accounting.ledger.detail.evidence_missing")}
              </p>
              {item.fxUnverified ? (
                <p className="mt-2 text-sm font-semibold text-amber-800">{t("accounting.txn.fx_unverified")}</p>
              ) : null}
            </section>

            {item.correctsTxnId ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <section className="rounded-[14px] border border-[#E3E8F0] bg-white p-5">
                  <h2 className="font-extrabold">{t("accounting.ledger.detail.original")}</h2>
                  <p className="mt-1 text-xs text-[#6B7A90]">{t("accounting.ledger.detail.correction")}</p>
                  <div className="mt-4">
                    <LedgerTable locale={loc} rows={originalLedgerRows} t={t} />
                  </div>
                </section>
                <section className="rounded-[14px] border border-[#E3E8F0] bg-white p-5">
                  <h2 className="font-extrabold">{t("accounting.ledger.detail.current")}</h2>
                  <div className="mt-4">
                    <LedgerTable locale={loc} rows={ledgerRows} t={t} />
                  </div>
                </section>
              </div>
            ) : (
              <section className="rounded-[14px] border border-[#E3E8F0] bg-white p-5">
                <h2 className="font-extrabold">{t("accounting.ledger.detail.current")}</h2>
                <div className="mt-4">
                  <LedgerTable locale={loc} rows={ledgerRows} t={t} />
                </div>
              </section>
            )}
            <TransactionExtrasPanel txnId={txnId} loc={loc} />
          </div>
        ) : null}
      </main>
  );
}
