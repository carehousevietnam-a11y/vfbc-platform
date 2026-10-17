"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { accountingAuthFetch } from "@/lib/accounting/authFetch";
import type { TranslationSlot } from "@/lib/accounting/correctionEntry";
import { accountingMessage, type AccountingLocale, type AccountingMessageKey } from "@/lib/accounting/uiCatalog";

type Extras = {
  role: string;
  status: string;
  periodFiled: boolean;
  alreadyCorrected: boolean;
  isCorrection: boolean;
  canApprove: boolean;
  canRequest: boolean;
  corrections: {
    id: string;
    status: string;
    amountVnd: number;
    body: string;
    rejectReason: string | null;
  }[];
  translations: TranslationSlot[];
};

function formatAmount(locale: AccountingLocale, value: number): string {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "ko-KR", { maximumFractionDigits: 0 }).format(value);
}

export default function TransactionExtrasPanel({ txnId, loc }: { txnId: string; loc: AccountingLocale }) {
  const t = (key: AccountingMessageKey) => accountingMessage(loc, key);
  const [extras, setExtras] = useState<Extras | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [rejectFor, setRejectFor] = useState<string | null>(null);
  const [rejectText, setRejectText] = useState("");
  const [newTxnId, setNewTxnId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await accountingAuthFetch(`/api/accounting/corrections?txnId=${txnId}`);
    if (res.ok) setExtras((await res.json()) as Extras);
  }, [txnId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await accountingAuthFetch(`/api/accounting/corrections?txnId=${txnId}`);
      if (cancelled || !res.ok) return;
      setExtras((await res.json()) as Extras);
    })();
    return () => {
      cancelled = true;
    };
  }, [txnId]);

  const post = async (payload: Record<string, unknown>) => {
    setError(null);
    const res = await accountingAuthFetch("/api/accounting/corrections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, lang: loc }),
    });
    const body = (await res.json()) as { error?: string; newTxnId?: string };
    if (!res.ok) {
      setError(body.error === "AMENDED_PROCEDURE_REQUIRED" ? t("accounting.corr.amended_required") : t("accounting.corr.error"));
      return false;
    }
    if (body.newTxnId) setNewTxnId(body.newTxnId);
    await load();
    return true;
  };

  if (!extras) return null;
  const confirmed = extras.status === "confirmed";

  return (
    <div className="space-y-6">
      {extras.translations.length > 0 ? (
        <section className="rounded-[14px] border border-[#E3E8F0] bg-white p-5" data-testid="translations">
          <h2 className="font-extrabold">{t("accounting.vi.section")}</h2>
          {extras.translations.map((slot) => (
            <div key={slot.field} className="mt-3 text-sm">
              <p>
                <span className="font-semibold">KO</span> {slot.ko?.text ?? "—"}
              </p>
              <p>
                <span className="font-semibold">VI</span> {slot.vi?.text ?? "—"}{" "}
                {slot.vi ? (
                  <span
                    className={`ml-1 rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                      slot.vi.status === "human_verified" ? "bg-[#E8F5EE] text-[#0F6B3E]" : "bg-[#FEF3C7] text-[#92400E]"
                    }`}
                  >
                    {slot.vi.status === "human_verified" ? t("accounting.vi.verified") : t("accounting.vi.machine")} · v
                    {slot.vi.version}
                  </span>
                ) : null}
              </p>
              {slot.needsReconfirm ? (
                <p className="mt-1 text-xs font-semibold text-[#B45309]">{t("accounting.vi.reconfirm")}</p>
              ) : null}
              {slot.canConfirm ? (
                <button
                  type="button"
                  className="mt-2 min-h-11 rounded-lg bg-[#071A33] px-4 text-sm font-semibold text-white"
                  onClick={() => void post({ action: "confirm_vi", txnId, field: slot.field })}
                >
                  {t("accounting.vi.confirm")}
                </button>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {confirmed ? (
        <section className="rounded-[14px] border border-[#E3E8F0] bg-white p-5" data-testid="corrections">
          <h2 className="font-extrabold">{t("accounting.corr.title")}</h2>
          <p className="mt-1 text-xs text-[#6B7A90]">{t("accounting.corr.lead")}</p>
          {extras.periodFiled ? (
            <p className="mt-3 text-sm font-semibold text-[#B45309]" data-testid="amended-required">
              {t("accounting.corr.amended_required")}
            </p>
          ) : null}
          {extras.alreadyCorrected ? (
            <p className="mt-3 text-sm text-[#3D4B63]">{t("accounting.corr.already")}</p>
          ) : null}
          {extras.corrections.length === 0 ? (
            <p className="mt-3 text-sm text-[#6B7A90]">{t("accounting.corr.none")}</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {extras.corrections.map((c) => (
                <li key={c.id} className="rounded-lg bg-[#F7F9FC] p-3 text-sm">
                  <p className="font-semibold tabular-nums">
                    {formatAmount(loc, c.amountVnd)} {t("accounting.txn.unit.vnd")} ·{" "}
                    {t(`accounting.corr.status.${c.status === "open" ? "open" : "resolved"}` as AccountingMessageKey)}
                  </p>
                  <p className="mt-1 text-[#3D4B63]">{c.body}</p>
                  {c.rejectReason ? <p className="mt-1 text-xs text-[#B91C1C]">{c.rejectReason}</p> : null}
                  {c.status === "open" && !extras.periodFiled ? (
                    extras.canApprove ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="min-h-11 rounded-lg bg-[#0F6B3E] px-4 text-sm font-semibold text-white"
                          onClick={() => void post({ action: "approve", commentId: c.id })}
                        >
                          {t("accounting.corr.approve")}
                        </button>
                        <button
                          type="button"
                          className="min-h-11 rounded-lg border border-[#E3E8F0] bg-white px-4 text-sm font-semibold"
                          onClick={() => setRejectFor(c.id)}
                        >
                          {t("accounting.corr.reject")}
                        </button>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-[#6B7A90]">{t("accounting.corr.owner_only")}</p>
                    )
                  ) : null}
                  {rejectFor === c.id ? (
                    <div className="mt-2 space-y-2">
                      <input
                        className="w-full rounded-lg border border-[#E3E8F0] px-3 py-2 text-sm"
                        placeholder={t("accounting.corr.reject_reason")}
                        value={rejectText}
                        onChange={(e) => setRejectText(e.target.value)}
                      />
                      <button
                        type="button"
                        className="min-h-11 rounded-lg bg-[#B91C1C] px-4 text-sm font-semibold text-white"
                        onClick={async () => {
                          if (await post({ action: "reject", commentId: c.id, reason: rejectText })) {
                            setRejectFor(null);
                            setRejectText("");
                          }
                        }}
                      >
                        {t("accounting.corr.reject")}
                      </button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          {newTxnId ? (
            <p className="mt-3 text-sm">
              <Link href={`/company/accounting/transactions/${newTxnId}`} className="font-semibold text-[#2563EB]" data-testid="new-txn-link">
                {newTxnId.slice(0, 8)} →
              </Link>
            </p>
          ) : null}

          {extras.canRequest && !extras.periodFiled && !extras.alreadyCorrected ? (
            <div className="mt-4 space-y-2 border-t border-[#E3E8F0] pt-4">
              <label className="block text-xs font-semibold text-[#3D4B63]">
                {t("accounting.corr.amount")}
                <input
                  inputMode="numeric"
                  className="mt-1 w-full rounded-lg border border-[#E3E8F0] px-3 py-2 text-right text-sm tabular-nums"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                />
              </label>
              <label className="block text-xs font-semibold text-[#3D4B63]">
                {t("accounting.corr.reason")}
                <input
                  className="mt-1 w-full rounded-lg border border-[#E3E8F0] px-3 py-2 text-sm"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="min-h-11 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white"
                onClick={async () => {
                  if (await post({ action: "request", txnId, amountVnd: Number(amount), text: reason })) {
                    setAmount("");
                    setReason("");
                  }
                }}
              >
                {t("accounting.corr.request")}
              </button>
            </div>
          ) : null}
        </section>
      ) : null}
      {error ? <p className="text-sm font-semibold text-[#B91C1C]">{error}</p> : null}
    </div>
  );
}
