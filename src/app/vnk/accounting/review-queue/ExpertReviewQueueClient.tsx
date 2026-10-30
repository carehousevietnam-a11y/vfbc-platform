"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { accountingSupabase as supabase } from "@/lib/accounting/accountingSupabaseClient";
import { accountingAuthFetch } from "@/lib/accounting/authFetch";
import { useAccountingCatalogLocale } from "@/lib/accounting/AccountingCatalogLocale";
import { AccountingLocaleSwitcher } from "@/lib/accounting/AccountingLocaleSwitcher";
import { accountingMessage, type AccountingLocale, type AccountingMessageKey } from "@/lib/accounting/uiCatalog";
import type { ExpertQueueItem } from "@/lib/accounting/expertReviewQueue";

function uiLocale(locale: string): AccountingLocale {
  return locale === "vi" ? "vi" : "ko";
}

function OrgDocLinks({
  orgId,
  t,
}: {
  orgId: string;
  t: (key: AccountingMessageKey) => string;
}) {
  const [docs, setDocs] = useState<{ id: string; doc_kind: string }[]>([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await accountingAuthFetch(`/api/accounting/expert/org-documents?orgId=${encodeURIComponent(orgId)}`);
      if (!res.ok || cancelled) return;
      const body = (await res.json()) as { items: { id: string; doc_kind: string }[] };
      setDocs(body.items ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, [orgId]);

  async function openDoc(id: string) {
    const res = await accountingAuthFetch(`/api/accounting/org-documents?id=${encodeURIComponent(id)}`);
    if (!res.ok) return;
    const body = (await res.json()) as { url: string };
    if (body.url) window.open(body.url, "_blank", "noopener,noreferrer");
  }

  if (docs.length === 0) return null;
  return (
    <ul className="mt-2 flex flex-col gap-1">
      {docs.map((d) => (
        <li key={d.id}>
          <button
            type="button"
            className="text-sm font-semibold text-[#2563EB]"
            data-testid={`expert-org-doc-${d.doc_kind}`}
            onClick={() => void openDoc(d.id)}
          >
            {t("accounting.org_docs.view")} — {d.doc_kind === "business_registration" ? t("accounting.org_docs.business_registration") : t("accounting.org_docs.investment_registration")}
          </button>
        </li>
      ))}
    </ul>
  );
}

function warnClass(count: number): string {
  if (count === 0) return "bg-[#E8F5EE] text-[#0F6B3E]";
  if (count <= 2) return "bg-[#FEF3C7] text-[#92400E]";
  return "bg-[#FEE2E2] text-[#B91C1C]";
}

export default function ExpertReviewQueueClient() {
  const [mounted, setMounted] = useState(false);
  const { locale: appLocale } = useAccountingCatalogLocale();
  const loc = uiLocale(appLocale);
  const t = (key: AccountingMessageKey) => accountingMessage(loc, key);
  const [phase, setPhase] = useState<"loading" | "signed_out" | "denied" | "ready">("loading");

  useEffect(() => {
    setMounted(true);
  }, []);
  const [items, setItems] = useState<ExpertQueueItem[]>([]);
  const [rejectOrgId, setRejectOrgId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busyOrgId, setBusyOrgId] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await accountingAuthFetch("/api/accounting/expert/queue");
    if (res.status === 401) {
      setPhase("signed_out");
      return;
    }
    if (res.status === 403) {
      setPhase("denied");
      return;
    }
    if (!res.ok) {
      setPhase("denied");
      return;
    }
    const body = (await res.json()) as { items: ExpertQueueItem[] };
    setItems(body.items ?? []);
    setPhase("ready");
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        if (!cancelled) setPhase("signed_out");
        return;
      }
      await load();
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function postOrgApproval(orgId: string, action: "approve" | "reject", reason?: string) {
    setBusyOrgId(orgId);
    setFlash(null);
    const res = await accountingAuthFetch("/api/accounting/expert/org-approval", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgId,
        action,
        rejectReason: reason,
        lang: loc,
      }),
    });
    setBusyOrgId(null);
    if (!res.ok) return;
    if (action === "approve") setFlash(t("accounting.expert.queue.org_approved_ok"));
    setRejectOrgId(null);
    setRejectReason("");
    await load();
  }

  const shell = (
    <header className="border-b border-[#E3E8F0] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-[15px] font-extrabold tracking-[-0.02em]">{t("accounting.shell.brand")}</p>
          <AccountingLocaleSwitcher />
        </div>
        <h1 className="mt-2 text-lg font-extrabold text-[#071A33]">{t("accounting.expert.queue.title")}</h1>
        <p className="mt-1 text-sm text-[#3D4B63]">{t("accounting.expert.queue.lead")}</p>
      </div>
    </header>
  );

  if (!mounted) {
    return <div className="min-h-screen bg-[#F7F9FC]" aria-busy="true" />;
  }

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-[#F7F9FC]">
        {shell}
        <p className="mx-auto max-w-6xl px-4 py-8 text-sm text-[#3D4B63] sm:px-6">{t("accounting.expert.queue.loading")}</p>
      </div>
    );
  }
  if (phase === "signed_out") {
    return (
      <div className="min-h-screen bg-[#F7F9FC]">
        {shell}
        <p className="mx-auto max-w-6xl px-4 py-8 text-sm text-[#3D4B63] sm:px-6">
          {t("accounting.expert.queue.sign_in")}{" "}
          <Link href="/login" className="font-semibold text-[#2563EB]">{t("accounting.legal.sign_in_link")}</Link>
        </p>
      </div>
    );
  }
  if (phase === "denied") {
    return (
      <div className="min-h-screen bg-[#F7F9FC]">
        {shell}
        <p
          className="mx-auto max-w-6xl px-4 py-8 text-sm font-semibold text-[#B45309] sm:px-6"
          data-testid="expert-queue-access-denied"
        >
          {t("accounting.expert.queue.access_denied")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      {shell}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {flash ? <p className="mb-4 text-sm font-semibold text-[#0F6B3E]">{flash}</p> : null}
        {items.length === 0 ? (
          <p className="text-sm text-[#3D4B63]">{t("accounting.expert.queue.empty")}</p>
        ) : (
          <ul className="space-y-3">
            {items.map((row) =>
              row.kind === "org_approval" ? (
                <li
                  key={`org-${row.orgId}`}
                  className="rounded-xl border border-[#E3E8F0] bg-white p-4 shadow-sm"
                  data-testid="expert-queue-org-pending"
                >
                  <p className="text-base font-bold text-[#071A33]">{row.orgDisplayName}</p>
                  <p className="mt-1 text-xs font-semibold text-[#92400E]">{t("accounting.expert.queue.org_approval")}</p>
                  <p className="mt-2 text-sm text-[#3D4B63]">{t("accounting.expert.queue.org_manual_check")}</p>
                  <OrgDocLinks orgId={row.orgId} t={t} />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busyOrgId === row.orgId}
                      className="rounded-lg bg-[#0F6B3E] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      data-testid="expert-org-approve"
                      onClick={() => void postOrgApproval(row.orgId, "approve")}
                    >
                      {t("accounting.expert.queue.org_approve")}
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-[#E3E8F0] px-4 py-2 text-sm font-semibold text-[#B91C1C]"
                      onClick={() => setRejectOrgId(row.orgId)}
                    >
                      {t("accounting.expert.queue.org_reject")}
                    </button>
                  </div>
                  {rejectOrgId === row.orgId ? (
                    <div className="mt-3 space-y-2">
                      <textarea
                        className="w-full rounded-lg border border-[#E3E8F0] p-2 text-sm"
                        rows={2}
                        placeholder={t("accounting.expert.queue.org_reject_reason")}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                      <button
                        type="button"
                        disabled={!rejectReason.trim() || busyOrgId === row.orgId}
                        className="rounded-lg bg-[#B91C1C] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        onClick={() => void postOrgApproval(row.orgId, "reject", rejectReason.trim())}
                      >
                        {t("accounting.expert.queue.org_reject")}
                      </button>
                    </div>
                  ) : null}
                </li>
              ) : (
                <li key={row.declarationId}>
                  <Link
                    href={`/vnk/accounting/review-queue/${row.declarationId}`}
                    className="flex flex-col gap-2 rounded-xl border border-[#E3E8F0] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-base font-bold text-[#071A33]">{row.orgDisplayName}</p>
                      <p className="text-sm text-[#3D4B63]">
                        {t("accounting.expert.queue.form")}: {row.formCode} · {t("accounting.expert.queue.period")}:{" "}
                        {row.periodKey}
                      </p>
                      {row.dDay !== null ? (
                        <p className="mt-1 text-xs font-semibold text-[#3D4B63]">
                          {t("accounting.expert.queue.d_day")}: D{row.dDay >= 0 ? "-" : "+"}
                          {Math.abs(row.dDay)}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {row.formVerificationWaiting ? (
                        <span
                          className="rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-semibold text-[#92400E]"
                          data-testid="expert-queue-form-wait"
                        >
                          {t("accounting.expert.queue.form_verification_wait")}
                        </span>
                      ) : null}
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${warnClass(row.warningCount)}`}>
                        {t("accounting.expert.queue.warnings")}: {row.warningCount}
                      </span>
                      <span className="text-xs text-[#6B7A90]">{row.requestedAt.slice(0, 10)}</span>
                    </div>
                  </Link>
                </li>
              )
            )}
          </ul>
        )}
      </main>
    </div>
  );
}
