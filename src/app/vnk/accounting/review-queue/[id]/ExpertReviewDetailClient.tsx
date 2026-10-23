"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { GTGT_ADJUSTMENT_REASON_CODES } from "@/lib/accounting/gtgtReasonCodes";
import { accountingMessage, type AccountingLocale, type AccountingMessageKey } from "@/lib/accounting/uiCatalog";
import type { VatFieldMapEntry } from "@/lib/accounting/vatDeclarationEntry";
import { supabase } from "@/lib/supabase";
import { accountingAuthFetch } from "@/lib/accounting/authFetch";

const EVIDENCE_BUCKET = "accounting_evidence";

const STEP_FIELDS: Record<number, string[]> = {
  2: ["26", "29", "30", "31", "32", "33", "32a", "32b", "34a", "27", "28", "34"],
  3: ["23", "24", "25"],
  4: ["22", "35", "36", "37", "38", "40a", "40", "41", "42", "43"],
};

function uiLocale(locale: string): AccountingLocale {
  return locale === "vi" ? "vi" : "ko";
}

function formatAmount(locale: AccountingLocale, raw: string | undefined): string {
  const n = Number(raw ?? "0");
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "ko-KR", { maximumFractionDigits: 0 }).format(n);
}

type DetailPayload = {
  declaration: {
    org_id: string;
    status: string;
    period_key: string;
    computed: { fields?: Record<string, { value?: string }> };
  };
  receiptUrl?: string | null;
  org: { name_ko_display?: string; name_official: string };
  form: { ok: boolean; fields?: VatFieldMapEntry[] };
  comments: {
    id: string;
    author_id: string;
    kind: string;
    status: string;
    body: { ko?: string; vi?: string };
    translationPending?: { ko: boolean; vi: boolean };
  }[];
  linkedTransactions?: {
    id: string;
    txn_date: string;
    type: string;
    status: string;
    amount_vnd: number | null;
  }[];
  warnings: number;
  formVerificationWaiting?: boolean;
};

export default function ExpertReviewDetailClient() {
  const params = useParams();
  const declarationId = params.id as string;
  const { locale: appLocale } = useLocale();
  const loc = uiLocale(appLocale);
  const t = (key: AccountingMessageKey) => accountingMessage(loc, key);

  const [phase, setPhase] = useState<"loading" | "error" | "ready">("loading");
  const [detail, setDetail] = useState<DetailPayload | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentKind, setCommentKind] = useState<"comment" | "correction_request">("comment");
  const [adjField, setAdjField] = useState("37");
  const [adjAmount, setAdjAmount] = useState("");
  const [adjReason, setAdjReason] = useState<string>(GTGT_ADJUSTMENT_REASON_CODES[0].id);
  const [portalBasis, setPortalBasis] = useState<"TT89" | "TT80">("TT89");
  const [filedAt, setFiledAt] = useState("");
  const [receiptPath, setReceiptPath] = useState("");
  const [warnAck, setWarnAck] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const reasonOptions = useMemo(
    () =>
      GTGT_ADJUSTMENT_REASON_CODES.map((r) => ({
        id: r.id,
        label: uiLocale(appLocale) === "vi" ? r.vi : r.ko,
      })),
    [appLocale]
  );

  const fetchDetail = useCallback(async () => {
    const res = await accountingAuthFetch(`/api/accounting/expert/declarations/${declarationId}`);
    if (!res.ok) return null;
    const json = (await res.json()) as DetailPayload & { ok?: boolean; error?: string };
    if (json.error) return null;
    return json;
  }, [declarationId]);

  const reload = useCallback(async () => {
    const data = await fetchDetail();
    if (!data) {
      setPhase("error");
      return;
    }
    setDetail(data);
    setPhase("ready");
  }, [fetchDetail]);

  useEffect(() => {
    setFiledAt(new Date().toISOString().slice(0, 16));
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const data = await fetchDetail();
      if (cancelled) return;
      if (!data) {
        setPhase("error");
        return;
      }
      setDetail(data);
      setPhase("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchDetail]);

  const fields = detail?.form?.ok ? detail.form.fields ?? [] : [];
  const computed = detail?.declaration?.computed?.fields ?? {};
  const orgName = detail?.org?.name_ko_display || detail?.org?.name_official || "—";

  const postComment = async () => {
    setMessage(null);
    const res = await accountingAuthFetch("/api/accounting/expert/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        declarationId,
        kind: commentKind,
        text: commentText,
        lang: loc,
      }),
    });
    if (!res.ok) {
      setMessage(t("accounting.expert.detail.error.generic"));
      return;
    }
    const json = (await res.json()) as {
      comment?: DetailPayload["comments"][number];
    };
    setCommentText("");
    if (json.comment) {
      setDetail((prev) =>
        prev ? { ...prev, comments: [...prev.comments, json.comment!] } : prev
      );
    }
    await reload();
  };

  const postAdjustment = async () => {
    setMessage(null);
    const res = await accountingAuthFetch("/api/accounting/vat/expert-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "adjustment",
        declarationId,
        fieldCode: adjField,
        amount: adjAmount,
        reasonCode: adjReason,
      }),
    });
    if (!res.ok) {
      setMessage(t("accounting.expert.detail.error.adjustment"));
      return;
    }
    setAdjAmount("");
    await reload();
  };

  const uploadReceipt = async (file: File) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const orgId = detail?.declaration.org_id;
    if (!orgId) return;
    const safeName = file.name.replace(/[^A-Za-z0-9._-]/g, "_");
    const unique = crypto.randomUUID();
    const path = `${orgId}/filing/${declarationId}-${unique}-${safeName}`;
    const { error } = await supabase.storage.from(EVIDENCE_BUCKET).upload(path, file, { upsert: true });
    if (error) {
      setMessage(t("accounting.expert.detail.error.receipt"));
      return;
    }
    setReceiptPath(path);
  };

  const recordFiling = async () => {
    setMessage(null);
    const res = await accountingAuthFetch("/api/accounting/expert/filing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        declarationId,
        portalFormBasis: portalBasis,
        filedAt: new Date(filedAt).toISOString(),
        filingReceiptPath: receiptPath,
        warningsAcknowledged: warnAck || (detail?.warnings ?? 0) === 0,
      }),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage(body.error ?? t("accounting.expert.detail.error.filing"));
      return;
    }
    setMessage(t("accounting.expert.detail.filing.saved"));
    await reload();
  };

  if (phase === "loading") {
    return <p className="p-6 text-sm text-[#3D4B63]">{t("accounting.expert.queue.loading")}</p>;
  }
  if (phase === "error" || !detail) {
    return (
      <p className="p-6 text-sm font-semibold text-[#B45309]">{t("accounting.expert.detail.not_found")}</p>
    );
  }

  const locked = detail.declaration.status === "filed_manual";
  const formGate = detail.formVerificationWaiting === true;

  const renderStep = (step: number, codes: string[]) => (
    <section key={step} className="rounded-xl border border-[#E3E8F0] bg-white p-4">
      <h2 className="text-sm font-extrabold text-[#071A33]">
        {t("accounting.expert.detail.step")} {step}
      </h2>
      <ul className="mt-3 space-y-2">
        {codes.map((code) => {
          const meta = fields.find((f) => f.code === code);
          const val = computed[code]?.value;
          return (
            <li key={code} className="flex justify-between gap-3 text-sm">
              <span className="text-[#3D4B63]">{meta ? `[${code}]` : code}</span>
              <span className="font-semibold text-[#071A33] tabular-nums">{formatAmount(loc, val)}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <header className="border-b border-[#E3E8F0] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <Link href="/vnk/accounting/review-queue" className="text-sm font-semibold text-[#2563EB]">
            {t("accounting.expert.detail.back")}
          </Link>
          <h1 className="mt-2 text-lg font-extrabold text-[#071A33]">{orgName}</h1>
          <p className="text-sm text-[#3D4B63]">
            {t("accounting.expert.queue.period")}: {detail.declaration.period_key}
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {(detail.linkedTransactions?.length ?? 0) > 0 ? (
            <section className="rounded-xl border border-[#E3E8F0] bg-white p-4" data-testid="expert-linked-txns">
              <h2 className="text-sm font-extrabold text-[#071A33]">{t("accounting.expert.detail.linked_txns")}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {detail.linkedTransactions?.map((txn) => (
                  <li key={txn.id} className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      href={`/company/accounting/transactions/${txn.id}`}
                      className="font-semibold text-[#2563EB]"
                    >
                      {txn.txn_date} · {txn.type}
                    </Link>
                    <span className="tabular-nums font-semibold text-[#071A33]">
                      {formatAmount(loc, String(txn.amount_vnd ?? 0))} · {txn.status}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {renderStep(2, STEP_FIELDS[2])}
          {renderStep(3, STEP_FIELDS[3])}
          {renderStep(4, STEP_FIELDS[4])}

          {locked ? (
            <section
              data-testid="period-locked"
              className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-4 text-sm font-semibold text-[#1D4ED8]"
            >
              {t("accounting.expert.detail.locked")}
              {detail.receiptUrl ? (
                <a href={detail.receiptUrl} target="_blank" rel="noreferrer" className="ml-2 underline">
                  {t("accounting.expert.detail.receipt_view")}
                </a>
              ) : null}
            </section>
          ) : formGate ? (
            <section
              className="rounded-xl border border-[#FEF3C7] bg-[#FFFBEB] p-4 text-sm font-semibold text-[#92400E]"
              data-testid="expert-form-verification-wait"
            >
              {t("accounting.expert.queue.form_verification_wait")}
            </section>
          ) : (
          <section className="rounded-xl border border-[#E3E8F0] bg-white p-4">
            <h2 className="text-sm font-extrabold text-[#071A33]">{t("accounting.expert.detail.adjustment")}</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <label className="text-xs font-semibold text-[#3D4B63]">
                {t("accounting.expert.detail.field")}
                <select
                  className="mt-1 w-full rounded-lg border border-[#E3E8F0] px-3 py-2 text-sm"
                  value={adjField}
                  onChange={(e) => setAdjField(e.target.value)}
                >
                  {["32a", "32b", "34a", "37", "38", "42"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold text-[#3D4B63]">
                {t("accounting.expert.detail.amount")}
                <input
                  className="mt-1 w-full rounded-lg border border-[#E3E8F0] px-3 py-2 text-sm"
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(e.target.value)}
                />
              </label>
              <label className="col-span-full text-xs font-semibold text-[#3D4B63]">
                {t("accounting.expert.detail.reason")}
                <select
                  className="mt-1 w-full rounded-lg border border-[#E3E8F0] px-3 py-2 text-sm"
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                >
                  {reasonOptions.map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <button
              type="button"
              onClick={postAdjustment}
              className="mt-3 min-h-11 rounded-lg bg-[#071A33] px-4 text-sm font-semibold text-white"
            >
              {t("accounting.expert.detail.adjustment_save")}
            </button>
          </section>
          )}
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-[#E3E8F0] bg-white p-4">
            <h2 className="text-sm font-extrabold text-[#071A33]">{t("accounting.expert.detail.comments")}</h2>
            <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-sm">
              {detail.comments.map((c) => (
                <li key={c.id} className="rounded-lg bg-[#F7F9FC] p-2">
                  <p className="text-xs text-[#6B7A90]">{c.kind} · {c.status}</p>
                  <p className="text-[#071A33]">{c.body[loc] ?? c.body.ko ?? c.body.vi ?? "—"}</p>
                  {c.translationPending?.[loc] ? (
                    <span className="mt-1 inline-block rounded bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-semibold text-[#92400E]">
                      {t("accounting.ledger.badge.translation_pending")}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
            <textarea
              className="mt-3 w-full rounded-lg border border-[#E3E8F0] p-2 text-sm"
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <select
              className="mt-2 w-full rounded-lg border border-[#E3E8F0] px-2 py-2 text-sm"
              value={commentKind}
              onChange={(e) => setCommentKind(e.target.value as "comment" | "correction_request")}
            >
              <option value="comment">{t("accounting.expert.detail.kind.comment")}</option>
              <option value="correction_request">{t("accounting.expert.detail.kind.correction")}</option>
            </select>
            <button
              type="button"
              onClick={postComment}
              className="mt-2 min-h-11 w-full rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white"
            >
              {t("accounting.expert.detail.comment_save")}
            </button>
          </section>

          {!locked && !formGate ? (
          <section className="rounded-xl border border-[#E3E8F0] bg-white p-4">
            <h2 className="text-sm font-extrabold text-[#071A33]">{t("accounting.expert.detail.filing")}</h2>
            {(detail.warnings ?? 0) > 0 && (
              <label className="mt-2 flex items-start gap-2 text-xs text-[#92400E]">
                <input type="checkbox" checked={warnAck} onChange={(e) => setWarnAck(e.target.checked)} />
                {t("accounting.expert.detail.warnings_ack")}
              </label>
            )}
            <label className="mt-2 block text-xs font-semibold text-[#3D4B63]">
              {t("accounting.expert.detail.portal_basis")}
              <select
                className="mt-1 w-full rounded-lg border border-[#E3E8F0] px-3 py-2 text-sm"
                value={portalBasis}
                onChange={(e) => setPortalBasis(e.target.value as "TT89" | "TT80")}
              >
                <option value="TT89">TT89</option>
                <option value="TT80">TT80</option>
              </select>
            </label>
            <label className="mt-2 block text-xs font-semibold text-[#3D4B63]">
              {t("accounting.expert.detail.filed_at")}
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-lg border border-[#E3E8F0] px-3 py-2 text-sm"
                value={filedAt}
                onChange={(e) => setFiledAt(e.target.value)}
              />
            </label>
            <label className="mt-2 block text-xs font-semibold text-[#3D4B63]">
              {t("accounting.expert.detail.receipt")}
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                className="mt-1 w-full text-sm"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadReceipt(f);
                }}
              />
            </label>
            <button
              type="button"
              onClick={recordFiling}
              className="mt-3 min-h-11 w-full rounded-lg bg-[#0F6B3E] px-4 text-sm font-semibold text-white"
            >
              {t("accounting.expert.detail.filing_submit")}
            </button>
          </section>
          ) : null}
          {message && <p className="text-sm font-semibold text-[#071A33]">{message}</p>}
        </aside>
      </main>
    </div>
  );
}
