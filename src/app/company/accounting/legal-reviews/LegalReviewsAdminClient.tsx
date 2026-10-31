"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { accountingSupabase as supabase } from "@/lib/accounting/accountingSupabaseClient";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  type FormVersionRow,
  type FormVersionStatus,
  type LegalReviewRow,
  insertLegalReview,
  isVnkAdmin,
  listFormVersions,
  listLegalReviews,
} from "@/lib/accounting/formRegistry";
import { accountingMessage, type AccountingLocale, type AccountingMessageKey } from "@/lib/accounting/uiCatalog";

function uiLocale(locale: string): AccountingLocale {
  return locale === "vi" ? "vi" : "ko";
}

function formatMonth(locale: AccountingLocale, iso: string): string {
  const match = /^(\d{4})-(\d{2})/.exec(iso);
  if (!match) return iso;
  if (locale === "vi") return `${match[2]}/${match[1]}`;
  return `${match[1]}.${match[2]}`;
}

function formatDate(locale: AccountingLocale, iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  if (locale === "vi") return `${match[3]}/${match[2]}/${match[1]}`;
  return `${match[1]}.${match[2]}.${match[3]}`;
}

function statusBadgeClass(status: FormVersionStatus): string {
  if (status === "active") return "bg-[#E8F5EE] text-[#0F6B3E]";
  if (status === "retired") return "bg-[#F3F4F6] text-[#4B5563]";
  if (status === "blocked") return "bg-[#FEE2E2] text-[#B91C1C]";
  return "bg-[#FEF3C7] text-[#92400E]";
}

export default function LegalReviewsAdminClient() {
  const { locale: appLocale } = useLocale();
  const loc = uiLocale(appLocale);
  const t = (key: AccountingMessageKey) => accountingMessage(loc, key);

  const [phase, setPhase] = useState<"loading" | "signed_out" | "denied" | "ready">("loading");
  const [forms, setForms] = useState<FormVersionRow[]>([]);
  const [reviews, setReviews] = useState<LegalReviewRow[]>([]);
  const [reviewMonth, setReviewMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [reviewer, setReviewer] = useState("");
  const [result, setResult] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [selectedFormIds, setSelectedFormIds] = useState<string[]>([]);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const statusLabel = (status: FormVersionStatus) => {
    const map: Record<FormVersionStatus, AccountingMessageKey> = {
      pending_verification: "accounting.legal.status.pending_verification",
      active: "accounting.legal.status.active",
      retired: "accounting.legal.status.retired",
      blocked: "accounting.legal.status.blocked",
    };
    return accountingMessage(loc, map[status]);
  };

  const formName = (row: FormVersionRow) => (loc === "vi" ? row.name_vi : row.name_ko);

  const reload = useCallback(async () => {
    const formsRes = await listFormVersions(supabase);
    const reviewsRes = await listLegalReviews(supabase);
    if (formsRes.ok) setForms(formsRes.items);
    if (reviewsRes.ok) setReviews(reviewsRes.items);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        if (!cancelled) setPhase("signed_out");
        return;
      }
      const admin = await isVnkAdmin(supabase, session.user.id);
      if (!admin) {
        if (!cancelled) setPhase("denied");
        return;
      }
      await reload();
      if (!cancelled) setPhase("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const toggleForm = (id: string) => {
    setSelectedFormIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const formLabelById = useMemo(() => {
    const map = new Map<string, string>();
    const labelLocale = uiLocale(appLocale);
    for (const f of forms) {
      const name = labelLocale === "vi" ? f.name_vi : f.name_ko;
      map.set(f.id, `${f.form_code} · ${name}`);
    }
    return map;
  }, [forms, appLocale]);

  const onSave = async () => {
    setSaveState("saving");
    const res = await insertLegalReview(supabase, {
      review_month: reviewMonth,
      reviewer: reviewer.trim(),
      result: result.trim(),
      follow_up: followUp.trim(),
      affected_form_version_ids: selectedFormIds,
    });
    if (!res.ok) {
      setSaveState("error");
      return;
    }
    setSaveState("saved");
    setReviewer("");
    setResult("");
    setFollowUp("");
    setSelectedFormIds([]);
    await reload();
    window.setTimeout(() => setSaveState("idle"), 2500);
  };

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-[#F7F9FC]">
        <header className="border-b border-[#E3E8F0] bg-white">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
            <p className="text-[15px] font-extrabold tracking-[-0.02em]">{t("accounting.shell.brand")}</p>
          </div>
        </header>
        <p className="mx-auto max-w-6xl px-4 py-8 text-sm text-[#3D4B63] sm:px-6">{t("accounting.legal.loading")}</p>
      </div>
    );
  }

  if (phase === "signed_out") {
    return (
      <div className="min-h-screen bg-[#F7F9FC]">
        <header className="border-b border-[#E3E8F0] bg-white">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
            <p className="text-[15px] font-extrabold tracking-[-0.02em]">{t("accounting.shell.brand")}</p>
          </div>
        </header>
        <p className="mx-auto max-w-6xl px-4 py-8 text-sm text-[#3D4B63] sm:px-6">
          {t("accounting.legal.sign_in")}{" "}
          <Link href="/login" className="font-semibold text-[#2563EB]">{t("accounting.legal.sign_in_link")}</Link>
        </p>
      </div>
    );
  }

  if (phase === "denied") {
    return (
      <div className="min-h-screen bg-[#F7F9FC]">
        <header className="border-b border-[#E3E8F0] bg-white">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
            <p className="text-[15px] font-extrabold tracking-[-0.02em]">{t("accounting.shell.brand")}</p>
          </div>
        </header>
        <p className="mx-auto max-w-6xl px-4 py-8 text-sm font-semibold text-[#B45309] sm:px-6">
          {t("accounting.legal.access_denied")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <header className="border-b border-[#E3E8F0] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 sm:px-6">
          <p className="text-[15px] font-extrabold tracking-[-0.02em]">{t("accounting.shell.brand")}</p>
          <h1 className="text-xl font-extrabold tracking-[-0.02em] text-[#071A33]">{t("accounting.legal.title")}</h1>
          <p className="text-sm leading-relaxed text-[#3D4B63]">{t("accounting.legal.lead")}</p>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
        <section className="rounded-xl border border-[#E3E8F0] bg-white p-4 sm:p-6">
          <h2 className="text-base font-bold text-[#071A33]">{t("accounting.legal.section.this_month")}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-semibold text-[#3D4B63]">
              {t("accounting.legal.field.review_month")}
              <input
                type="month"
                className="min-h-11 rounded-lg border border-[#D8DEE8] px-3 font-normal"
                value={reviewMonth.slice(0, 7)}
                onChange={(e) => setReviewMonth(`${e.target.value}-01`)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-[#3D4B63]">
              {t("accounting.legal.field.reviewer")}
              <input
                className="min-h-11 rounded-lg border border-[#D8DEE8] px-3 font-normal"
                value={reviewer}
                onChange={(e) => setReviewer(e.target.value)}
              />
            </label>
          </div>
          <label className="mt-4 flex flex-col gap-1 text-sm font-semibold text-[#3D4B63]">
            {t("accounting.legal.field.result")}
            <textarea
              className="min-h-[88px] rounded-lg border border-[#D8DEE8] px-3 py-2 font-normal"
              value={result}
              onChange={(e) => setResult(e.target.value)}
            />
          </label>
          <label className="mt-4 flex flex-col gap-1 text-sm font-semibold text-[#3D4B63]">
            {t("accounting.legal.field.follow_up")}
            <textarea
              className="min-h-[72px] rounded-lg border border-[#D8DEE8] px-3 py-2 font-normal"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
            />
          </label>
          <div className="mt-4">
            <p className="text-sm font-semibold text-[#3D4B63]">{t("accounting.legal.field.forms")}</p>
            <ul className="mt-2 flex flex-col gap-2">
              {forms.map((f) => (
                <li key={f.id}>
                  <label className="flex min-h-11 items-start gap-2 rounded-lg border border-[#E3E8F0] px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={selectedFormIds.includes(f.id)}
                      onChange={() => toggleForm(f.id)}
                    />
                    <span className="min-w-0 break-words">
                      <span className="font-semibold text-[#071A33]">{f.form_code}</span>
                      <span className="text-[#3D4B63]"> · {formName(f)}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="min-h-11 rounded-lg bg-[#071A33] px-5 text-sm font-semibold text-white disabled:opacity-50"
              disabled={saveState === "saving" || !reviewer.trim() || !result.trim()}
              onClick={() => void onSave()}
            >
              {t("accounting.legal.action.save")}
            </button>
            {saveState === "saved" && (
              <span className="text-sm font-semibold text-[#0F6B3E]">{t("accounting.legal.saved")}</span>
            )}
            {saveState === "error" && (
              <span className="text-sm font-semibold text-[#B91C1C]">{t("accounting.legal.error.generic")}</span>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-[#E3E8F0] bg-white p-4 sm:p-6">
          <h2 className="text-base font-bold text-[#071A33]">{t("accounting.legal.section.history")}</h2>
          {reviews.length === 0 ? (
            <p className="mt-3 text-sm text-[#3D4B63]">{t("accounting.legal.empty.history")}</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E3E8F0] text-[#3D4B63]">
                    <th className="py-2 pr-3 font-semibold">{t("accounting.legal.col.month")}</th>
                    <th className="py-2 pr-3 font-semibold">{t("accounting.legal.col.reviewer")}</th>
                    <th className="py-2 pr-3 font-semibold">{t("accounting.legal.col.result")}</th>
                    <th className="py-2 pr-3 font-semibold">{t("accounting.legal.col.follow_up")}</th>
                    <th className="py-2 font-semibold">{t("accounting.legal.col.forms")}</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((row) => (
                    <tr key={row.id} className="border-b border-[#F0F2F6] align-top">
                      <td className="py-3 pr-3 whitespace-nowrap">{formatMonth(loc, row.review_month)}</td>
                      <td className="py-3 pr-3 break-words">{row.reviewer ?? "—"}</td>
                      <td className="py-3 pr-3 break-words">{row.result ?? "—"}</td>
                      <td className="py-3 pr-3 break-words">{row.follow_up ?? "—"}</td>
                      <td className="py-3 break-words text-[#3D4B63]">
                        {(row.affected_form_version_ids ?? [])
                          .map((id) => formLabelById.get(id) ?? id.slice(0, 8))
                          .join("; ") || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-[#E3E8F0] bg-white p-4 sm:p-6">
          <h2 className="text-base font-bold text-[#071A33]">{t("accounting.legal.section.forms")}</h2>
          <p className="mt-2 text-sm text-[#3D4B63]">{t("accounting.legal.forms.hint.disabled")}</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#E3E8F0] text-[#3D4B63]">
                  <th className="py-2 pr-3 font-semibold">{t("accounting.legal.col.code")}</th>
                  <th className="py-2 pr-3 font-semibold">{t("accounting.legal.col.name")}</th>
                  <th className="py-2 pr-3 font-semibold">{t("accounting.legal.col.status")}</th>
                  <th className="py-2 font-semibold">{t("accounting.legal.col.effective")}</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((f) => (
                  <tr key={f.id} className="border-b border-[#F0F2F6]">
                    <td className="py-3 pr-3 font-semibold text-[#071A33]">{f.form_code}</td>
                    <td className="py-3 pr-3 break-words">{formName(f)}</td>
                    <td className="py-3 pr-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(f.status)}`}
                      >
                        {statusLabel(f.status)}
                      </span>
                    </td>
                    <td className="py-3 whitespace-nowrap">{formatDate(loc, f.effective_from)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
