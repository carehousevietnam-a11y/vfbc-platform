"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SelectionCard } from "@/components/ui";
import { accountingAuthFetch } from "@/lib/accounting/authFetch";
import { ACCOUNTING_ROUTES } from "@/lib/accounting/accountingNav";
import { accountingMessage, type AccountingMessageKey } from "@/lib/accounting/uiCatalog";
import { uiAccountingLocale } from "@/lib/accounting/localeFormat";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  defaultEndedPeriodKey,
  validateWorkspaceIntakePayload,
  type WorkspacePeriodGranularity,
  type WorkspaceReportIntent,
  type WorkspaceViUnderstanding,
} from "@/lib/accounting/workspaceIntake";

const Q1_OPTIONS: { value: WorkspaceReportIntent; key: AccountingMessageKey }[] = [
  { value: "vat", key: "accounting.welcome.q1.opt.vat" },
  { value: "corp_tax", key: "accounting.welcome.q1.opt.corp_tax" },
  { value: "invoices", key: "accounting.welcome.q1.opt.invoices" },
  { value: "undecided", key: "accounting.welcome.q1.opt.undecided" },
  { value: "custom", key: "accounting.welcome.q1.opt.custom" },
];

const Q3_OPTIONS: { value: WorkspaceViUnderstanding; key: AccountingMessageKey }[] = [
  { value: "read_self", key: "accounting.welcome.q3.opt.read_self" },
  { value: "interpreter", key: "accounting.welcome.q3.opt.interpreter" },
  { value: "ai_translate", key: "accounting.welcome.q3.opt.ai_translate" },
  { value: "hard", key: "accounting.welcome.q3.opt.hard" },
  { value: "custom", key: "accounting.welcome.q3.opt.custom" },
];

const GRANULARITY_OPTIONS: { value: WorkspacePeriodGranularity; key: AccountingMessageKey }[] = [
  { value: "month", key: "accounting.welcome.q2.granularity.month" },
  { value: "quarter", key: "accounting.welcome.q2.granularity.quarter" },
  { value: "year", key: "accounting.welcome.q2.granularity.year" },
];

export default function WorkspaceIntakeClient() {
  const router = useRouter();
  const { locale } = useLocale();
  const lang = uiAccountingLocale(locale);
  const t = useCallback((key: AccountingMessageKey) => accountingMessage(lang, key), [lang]);

  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [reportIntent, setReportIntent] = useState<WorkspaceReportIntent | "">("");
  const [reportIntentCustom, setReportIntentCustom] = useState("");
  const [periodGranularity, setPeriodGranularity] = useState<WorkspacePeriodGranularity>("month");
  const [periodKey, setPeriodKey] = useState(() => defaultEndedPeriodKey("month"));
  const [viUnderstanding, setViUnderstanding] = useState<WorkspaceViUnderstanding | "">("");
  const [viUnderstandingCustom, setViUnderstandingCustom] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AccountingMessageKey | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await accountingAuthFetch("/api/accounting/workspace-intake");
      if (!res.ok) {
        if (!cancelled) setLoading(false);
        return;
      }
      const json = (await res.json()) as {
        completed?: boolean;
        org?: { name: string; taxCode: string };
      };
      if (cancelled) return;
      if (json.completed) {
        router.replace(ACCOUNTING_ROUTES.home);
        return;
      }
      setOrgName(json.org?.name ?? "");
      setTaxCode(json.org?.taxCode ?? "");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    setPeriodKey(defaultEndedPeriodKey(periodGranularity));
  }, [periodGranularity]);

  const periodControl = useMemo(() => {
    if (periodGranularity === "month") {
      return (
        <input
          type="month"
          className="mt-2 w-full rounded-xl border border-[#E2E8F0] px-3 py-2 text-[15px]"
          value={periodKey}
          onChange={(e) => setPeriodKey(e.target.value)}
          data-testid="accounting-welcome-period-month"
        />
      );
    }
    if (periodGranularity === "quarter") {
      const match = periodKey.match(/^(\d{4})-Q([1-4])$/);
      const year = match?.[1] ?? String(new Date().getFullYear());
      const q = match?.[2] ?? "1";
      return (
        <div className="mt-2 flex flex-wrap gap-2" data-testid="accounting-welcome-period-quarter">
          <select
            className="rounded-xl border border-[#E2E8F0] px-3 py-2 text-[15px]"
            value={year}
            onChange={(e) => setPeriodKey(`${e.target.value}-Q${q}`)}
          >
            {[0, 1, 2].map((i) => {
              const y = new Date().getFullYear() - i;
              return (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              );
            })}
          </select>
          <select
            className="rounded-xl border border-[#E2E8F0] px-3 py-2 text-[15px]"
            value={q}
            onChange={(e) => setPeriodKey(`${year}-Q${e.target.value}`)}
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={String(n)}>
                {t("accounting.welcome.q2.quarter_label").replace("{n}", String(n))}
              </option>
            ))}
          </select>
        </div>
      );
    }
    const year = periodKey.match(/^(\d{4})$/)?.[1] ?? String(new Date().getFullYear() - 1);
    return (
      <select
        className="mt-2 w-full rounded-xl border border-[#E2E8F0] px-3 py-2 text-[15px]"
        value={year}
        onChange={(e) => setPeriodKey(e.target.value)}
        data-testid="accounting-welcome-period-year"
      >
        {[0, 1, 2, 3].map((i) => {
          const y = new Date().getFullYear() - 1 - i;
          return (
            <option key={y} value={String(y)}>
              {y}
            </option>
          );
        })}
      </select>
    );
  }, [periodGranularity, periodKey, t]);

  const canSubmit =
    reportIntent &&
    viUnderstanding &&
    periodKey &&
    (reportIntent !== "custom" || reportIntentCustom.trim()) &&
    (viUnderstanding !== "custom" || viUnderstandingCustom.trim());

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !reportIntent || !viUnderstanding) return;
    const payload = {
      reportIntent,
      reportIntentCustom: reportIntent === "custom" ? reportIntentCustom : undefined,
      periodGranularity,
      periodKey,
      viUnderstanding,
      viUnderstandingCustom: viUnderstanding === "custom" ? viUnderstandingCustom : undefined,
    };
    if (validateWorkspaceIntakePayload(payload)) {
      setError("accounting.welcome.error.generic");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await accountingAuthFetch("/api/accounting/workspace-intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (res.status === 409) {
      router.replace(ACCOUNTING_ROUTES.home);
      return;
    }
    if (!res.ok) {
      setError("accounting.welcome.error.generic");
      return;
    }
    const json = (await res.json()) as { redirectPath?: string; noticeKey?: string | null };
    const base = json.redirectPath ?? ACCOUNTING_ROUTES.home;
    const href =
      json.noticeKey ? `${base}${base.includes("?") ? "&" : "?"}notice=${encodeURIComponent(json.noticeKey)}` : base;
    router.replace(href);
  }

  if (loading) {
    return (
      <div
        className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-[#6B7A90]"
        data-testid="accounting-welcome-loading"
      >
        …
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8" data-testid="accounting-welcome">
      <div className="rounded-2xl border border-[#E8EDF5] bg-[#F8FAFC] px-4 py-3 text-[14px] text-[#3D4B63]">
        <p className="font-semibold text-[#071A33]" data-testid="accounting-welcome-org-name">{orgName}</p>
        {taxCode ? (
          <p className="mt-1 text-[#6B7A90]" data-testid="accounting-welcome-tax-code">
            {t("accounting.welcome.tax_code_label")}: {taxCode}
          </p>
        ) : null}
      </div>

      <h1 className="mt-6 text-[22px] font-extrabold tracking-[-0.03em] sm:text-[28px]">{t("accounting.welcome.title")}</h1>
      <p className="mt-2 text-[14px] leading-6 text-[#3D4B63]">{t("accounting.welcome.lead")}</p>

      <form className="mt-8 space-y-8" onSubmit={onSubmit}>
        <section>
          <h2 className="text-[15px] font-extrabold text-[#071A33]">{t("accounting.welcome.q1.title")}</h2>
          <div className="mt-3 flex flex-col gap-2">
            {Q1_OPTIONS.map((opt) => (
              <div key={opt.value} data-testid={`accounting-welcome-q1-${opt.value}`}>
                <SelectionCard
                  title={t(opt.key)}
                  selected={reportIntent === opt.value}
                  onClick={() => setReportIntent(opt.value)}
                  variant="quiet"
                />
              </div>
            ))}
          </div>
          {reportIntent === "custom" ? (
            <input
              className="mt-3 w-full rounded-xl border border-[#E2E8F0] px-3 py-2 text-[15px]"
              value={reportIntentCustom}
              onChange={(e) => setReportIntentCustom(e.target.value)}
              placeholder={t("accounting.welcome.q1.custom_placeholder")}
              data-testid="accounting-welcome-q1-custom"
            />
          ) : null}
        </section>

        <section>
          <h2 className="text-[15px] font-extrabold text-[#071A33]">{t("accounting.welcome.q2.title")}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {GRANULARITY_OPTIONS.map((g) => (
              <button
                key={g.value}
                type="button"
                className={`rounded-full px-4 py-2 text-[14px] font-semibold ${
                  periodGranularity === g.value
                    ? "bg-[#071A33] text-white"
                    : "border border-[#E2E8F0] bg-white text-[#3D4B63]"
                }`}
                onClick={() => setPeriodGranularity(g.value)}
                data-testid={`accounting-welcome-granularity-${g.value}`}
              >
                {t(g.key)}
              </button>
            ))}
          </div>
          {periodControl}
        </section>

        <section>
          <h2 className="text-[15px] font-extrabold text-[#071A33]">{t("accounting.welcome.q3.title")}</h2>
          <div className="mt-3 flex flex-col gap-2">
            {Q3_OPTIONS.map((opt) => (
              <div key={opt.value} data-testid={`accounting-welcome-q3-${opt.value}`}>
                <SelectionCard
                  title={t(opt.key)}
                  selected={viUnderstanding === opt.value}
                  onClick={() => setViUnderstanding(opt.value)}
                  variant="quiet"
                />
              </div>
            ))}
          </div>
          {viUnderstanding === "custom" ? (
            <input
              className="mt-3 w-full rounded-xl border border-[#E2E8F0] px-3 py-2 text-[15px]"
              value={viUnderstandingCustom}
              onChange={(e) => setViUnderstandingCustom(e.target.value)}
              placeholder={t("accounting.welcome.q3.custom_placeholder")}
              data-testid="accounting-welcome-q3-custom"
            />
          ) : null}
        </section>

        {error ? <p className="text-sm text-[#B42318]">{t(error)}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={ACCOUNTING_ROUTES.home}
            className="text-[14px] font-semibold text-[#6B7A90] underline-offset-2 hover:underline"
            data-testid="accounting-welcome-later"
          >
            {t("accounting.welcome.later")}
          </Link>
          <button
            type="submit"
            disabled={!canSubmit || busy}
            className="rounded-xl bg-[#071A33] px-6 py-3 text-[15px] font-bold text-white disabled:opacity-40"
            data-testid="accounting-welcome-submit"
          >
            {busy ? t("accounting.welcome.submitting") : t("accounting.welcome.submit")}
          </button>
        </div>
      </form>
    </main>
  );
}
