"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { accountingMessage, type AccountingMessageKey } from "@/lib/accounting/uiCatalog";
import { formatAccountingAmount, formatAccountingDate, uiAccountingLocale } from "@/lib/accounting/localeFormat";
import {
  dDayFromToday,
  loadAccountingHomeSnapshot,
  type AccountingHomeSnapshot,
} from "@/lib/accounting/accountingHomeData";
import { ACCOUNTING_ROUTES } from "@/lib/accounting/accountingNav";
import { resolveAccountingOrgMembershipState } from "@/lib/accounting/orgMembership";
import { AccountingFunnelEntryLinks } from "@/lib/accounting/funnel/AccountingFunnelEntryLinks";
import { AccountingHomeHub } from "./AccountingHomeHub";

function interpolate(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, String(v)), template);
}

function declStatusKey(status: string): AccountingMessageKey {
  const key = `accounting.decl.status.${status}` as AccountingMessageKey;
  return key;
}

function scheduleCta(
  status: string,
  periodKey: string
): { href: string; labelKey: AccountingMessageKey } {
  if (status === "ready") {
    return { href: ACCOUNTING_ROUTES.filing, labelKey: "accounting.home.cta.filing_results" };
  }
  if (status === "expert_review") {
    return {
      href: `${ACCOUNTING_ROUTES.tax}?periodKey=${encodeURIComponent(periodKey)}`,
      labelKey: "accounting.home.cta.expert_review",
    };
  }
  return {
    href: `${ACCOUNTING_ROUTES.tax}?periodKey=${encodeURIComponent(periodKey)}`,
    labelKey: "accounting.home.cta.continue_filing",
  };
}

function dDayLabel(t: (k: AccountingMessageKey) => string, dueDateIso: string): string {
  const delta = dDayFromToday(dueDateIso);
  if (delta === 0) return t("accounting.home.d_day.today");
  if (delta > 0) return interpolate(t("accounting.home.d_day"), { days: delta });
  return interpolate(t("accounting.home.d_day.overdue"), { days: Math.abs(delta) });
}

export default function AccountingHomeClient() {
  const { locale } = useLocale();
  const lang = uiAccountingLocale(locale);
  const t = useCallback((key: AccountingMessageKey) => accountingMessage(lang, key), [lang]);

  const [phase, setPhase] = useState<"loading" | "signed_out" | "denied" | "pending" | "ready">("loading");
  const [snap, setSnap] = useState<AccountingHomeSnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        if (!cancelled) setPhase("signed_out");
        return;
      }
      const { data: userData } = await supabase.auth.getUser(token);
      const userId = userData.user?.id;
      if (!userId) {
        if (!cancelled) setPhase("signed_out");
        return;
      }
      const membership = await resolveAccountingOrgMembershipState(supabase, userId);
      if (membership.kind === "none") {
        if (!cancelled) setPhase("denied");
        return;
      }
      if (membership.kind === "pending") {
        if (!cancelled) setPhase("pending");
        return;
      }
      const home = await loadAccountingHomeSnapshot(supabase, membership.orgId, membership.role);
      if (!cancelled) {
        setSnap(home);
        setPhase("ready");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const typeLabel = (type: string) => t(`accounting.txn.tab.${type}` as AccountingMessageKey);
  const statusLabel = (status: string) => t(`accounting.txn.status.${status}` as AccountingMessageKey);

  const expertReviewPeriodKey =
    snap?.inProgress.find((r) => r.status === "expert_review")?.periodKey ??
    snap?.schedule.find((r) => r.status === "expert_review")?.periodKey ??
    snap?.inProgress[0]?.periodKey ??
    snap?.schedule[0]?.periodKey ??
    null;

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-8" data-testid="accounting-home">
      <h1 className="sr-only">{t("accounting.home.title")}</h1>

      {phase === "loading" ? <p className="mt-8 text-sm text-[#6B7A90]">{t("accounting.home.loading")}</p> : null}
      {phase === "signed_out" ? (
        <>
          <div className="mt-8 rounded-[14px] border border-[#E3E8F0] bg-white p-5">
            <p className="text-sm leading-6">{t("accounting.home.sign_in")}</p>
            <Link href="/login" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[#2563EB]">
              {t("accounting.home.sign_in_link")}
            </Link>
          </div>
          <AccountingFunnelEntryLinks />
        </>
      ) : null}
      {phase === "denied" || phase === "pending" ? (
        <div className="mt-8 rounded-[14px] border border-[#E3E8F0] bg-white p-5">
          <p className="text-sm leading-6">{t("accounting.home.access_denied")}</p>
        </div>
      ) : null}

      {phase === "ready" && snap ? (
        <div className="flex flex-col gap-6">
          <AccountingHomeHub lang={lang} expertReviewPeriodKey={expertReviewPeriodKey} />
          <p className="mx-auto max-w-2xl text-center text-[13px] leading-6 text-[#6B7A90]">{t("accounting.home.lead")}</p>
          {snap.showDeclarations ? (
            <>
              <section
                id="accounting-home-schedule"
                className="rounded-[14px] border border-[#E3E8F0] bg-white p-5"
                data-testid="home-schedule"
              >
                <h2 className="text-[15px] font-extrabold">{t("accounting.home.section.schedule")}</h2>
                {snap.schedule.length === 0 ? (
                  <p className="mt-3 text-sm text-[#6B7A90]">{t("accounting.home.schedule.empty")}</p>
                ) : (
                  <ul className="mt-4 flex flex-col gap-3">
                    {snap.schedule.map((row) => {
                      const cta = scheduleCta(row.status, row.periodKey);
                      return (
                        <li
                          key={row.id}
                          className="flex flex-col gap-3 rounded-lg border border-[#E3E8F0] p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-bold">
                              {row.formCode} · {row.periodKey}
                            </p>
                            <p className="mt-1 text-sm text-[#3D4B63]">
                              {formatAccountingDate(lang, row.dueDateIso)} · {dDayLabel(t, row.dueDateIso)} ·{" "}
                              {t(declStatusKey(row.status))}
                            </p>
                            {row.dueUnverified ? (
                              <span
                                className="mt-2 inline-flex rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800"
                                data-testid="due-unverified-badge"
                              >
                                {t("accounting.home.badge.due_unverified")}
                              </span>
                            ) : null}
                          </div>
                          <Link
                            href={cta.href}
                            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-[#071A33] px-4 text-sm font-semibold text-white"
                          >
                            {t(cta.labelKey)}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              <section className="rounded-[14px] border border-[#E3E8F0] bg-white p-5" data-testid="home-in-progress">
                <h2 className="text-[15px] font-extrabold">{t("accounting.home.section.in_progress")}</h2>
                {snap.inProgress.length === 0 ? (
                  <p className="mt-3 text-sm text-[#6B7A90]">{t("accounting.home.in_progress.empty")}</p>
                ) : (
                  <ul className="mt-4 flex flex-col gap-2">
                    {snap.inProgress.map((row) => (
                      <li key={row.id}>
                        <Link
                          href={`${ACCOUNTING_ROUTES.tax}?periodKey=${encodeURIComponent(row.periodKey)}`}
                          className="flex min-h-11 items-center justify-between rounded-lg border border-[#E3E8F0] px-4 text-sm font-semibold text-[#2563EB]"
                        >
                          <span>{row.formCode} · {row.periodKey}</span>
                          <span className="text-[#3D4B63]">{t(declStatusKey(row.status))}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          ) : null}

          <section className="rounded-[14px] border border-[#E3E8F0] bg-white p-5" data-testid="home-alerts">
            <h2 className="text-[15px] font-extrabold">{t("accounting.home.section.alerts")}</h2>
            <ul className="mt-4 flex flex-col gap-2">
              {snap.pendingTxnCount > 0 ? (
                <li>
                  <Link
                    href={`${ACCOUNTING_ROUTES.transactions}?status=draft`}
                    className="block min-h-11 rounded-lg border border-[#E3E8F0] px-4 py-3 text-sm font-semibold text-[#2563EB]"
                  >
                    {interpolate(t("accounting.home.alert.pending_txn"), { count: snap.pendingTxnCount })}
                  </Link>
                </li>
              ) : null}
              {snap.missingEvidenceCount > 0 ? (
                <li>
                  <Link
                    href={`${ACCOUNTING_ROUTES.transactions}?evidence=missing`}
                    className="block min-h-11 rounded-lg border border-[#E3E8F0] px-4 py-3 text-sm font-semibold text-[#2563EB]"
                  >
                    {interpolate(t("accounting.home.alert.missing_evidence"), { count: snap.missingEvidenceCount })}
                  </Link>
                </li>
              ) : null}
              {snap.pendingTxnCount === 0 && snap.missingEvidenceCount === 0 ? (
                <p className="text-sm text-[#6B7A90]">—</p>
              ) : null}
            </ul>
          </section>

          <section className="rounded-[14px] border border-[#E3E8F0] bg-white p-5" data-testid="home-recent">
            <h2 className="text-[15px] font-extrabold">{t("accounting.home.section.recent")}</h2>
            {snap.recentTxns.length === 0 ? (
              <div className="mt-4">
                <p className="text-sm text-[#6B7A90]">{t("accounting.home.recent.empty")}</p>
                <Link
                  href={ACCOUNTING_ROUTES.transactions}
                  className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-[#071A33] px-4 text-sm font-semibold text-white"
                >
                  {t("accounting.home.cta.transactions")}
                </Link>
              </div>
            ) : (
              <ul className="mt-4 flex flex-col gap-2">
                {snap.recentTxns.map((row) => (
                  <li key={row.id}>
                    <Link
                      href={`${ACCOUNTING_ROUTES.transactions}/${row.id}`}
                      className="flex min-h-11 flex-wrap items-center justify-between gap-2 rounded-lg border border-[#E3E8F0] px-4 py-2 text-sm"
                    >
                      <span className="font-semibold">{formatAccountingDate(lang, row.txnDate)}</span>
                      <span>
                        {typeLabel(row.type)} · {statusLabel(row.status)}
                      </span>
                      <span className="font-bold tabular-nums">
                        {formatAccountingAmount(lang, row.amountVnd)} {t("accounting.txn.unit.vnd")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}
    </main>
  );
}
