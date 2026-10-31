"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { accountingAuthFetch } from "@/lib/accounting/authFetch";
import { accountingMessage, type AccountingMessageKey } from "@/lib/accounting/uiCatalog";
import { uiAccountingLocale } from "@/lib/accounting/localeFormat";
import type { OrgDocumentKind } from "@/lib/accounting/orgDocumentEntry";
import type { OrgProfilePayload } from "@/lib/accounting/orgProfileEntry";

const DOC_LABEL: Record<OrgDocumentKind, AccountingMessageKey> = {
  business_registration: "accounting.org_docs.business_registration",
  investment_registration: "accounting.org_docs.investment_registration",
};

export default function CompanyProfileClient() {
  const { locale } = useLocale();
  const lang = uiAccountingLocale(locale);
  const t = useCallback((key: AccountingMessageKey) => accountingMessage(lang, key), [lang]);

  const [phase, setPhase] = useState<"loading" | "denied" | "ready">("loading");
  const [profile, setProfile] = useState<OrgProfilePayload | null>(null);
  const [viewBusyId, setViewBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await accountingAuthFetch("/api/accounting/org-profile");
      if (cancelled) return;
      if (res.status === 403 || res.status === 401) {
        setPhase("denied");
        return;
      }
      if (!res.ok) {
        setPhase("denied");
        return;
      }
      const body = (await res.json()) as { profile: OrgProfilePayload };
      setProfile(body.profile);
      setPhase("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatDate = (iso: string) => {
    const d = iso.slice(0, 10);
    if (lang === "vi") {
      const [y, m, day] = d.split("-");
      return `${day}/${m}/${y}`;
    }
    return d.replace(/-/g, ".");
  };

  const openDocument = async (id: string) => {
    setViewBusyId(id);
    const res = await accountingAuthFetch(`/api/accounting/org-documents?id=${encodeURIComponent(id)}`);
    setViewBusyId(null);
    if (!res.ok) return;
    const body = (await res.json()) as { url?: string };
    if (body.url) window.open(body.url, "_blank", "noopener,noreferrer");
  };

  if (phase === "loading") {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6" data-testid="accounting-company-profile">
        <p className="text-sm text-[#6B7A90]">{t("accounting.profile.loading")}</p>
      </main>
    );
  }

  if (phase === "denied" || !profile) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6" data-testid="accounting-company-profile">
        <h1 className="text-[22px] font-extrabold tracking-[-0.03em]">{t("accounting.profile.title")}</h1>
        <p className="mt-4 text-sm text-[#3D4B63]">{t("accounting.profile.denied")}</p>
      </main>
    );
  }

  const vatPeriodLabel =
    profile.vatPeriod === "quarter"
      ? t("accounting.profile.vat_period.quarter")
      : t("accounting.profile.vat_period.month");

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8" data-testid="accounting-company-profile">
      <h1 className="text-[22px] font-extrabold tracking-[-0.03em] text-[#071A33]">{t("accounting.profile.title")}</h1>
      <p className="mt-2 text-[14px] leading-6 text-[#3D4B63]">{t("accounting.profile.lead")}</p>

      <section className="mt-6 rounded-xl border border-[#E3E8F0] bg-white p-4 sm:p-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold text-[#6B7A90]">{t("accounting.profile.field.name_official")}</dt>
            <dd className="mt-1 text-sm font-semibold text-[#071A33]">{profile.nameOfficial}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-[#6B7A90]">{t("accounting.profile.field.name_ko_display")}</dt>
            <dd className="mt-1 text-sm text-[#071A33]">{profile.nameKoDisplay || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-[#6B7A90]">{t("accounting.profile.field.tax_code")}</dt>
            <dd className="mt-1 font-mono text-sm text-[#071A33]">{profile.taxCode}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-[#6B7A90]">{t("accounting.profile.field.fiscal_year_start")}</dt>
            <dd className="mt-1 text-sm text-[#071A33]">{formatDate(profile.fiscalYearStart)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-[#6B7A90]">{t("accounting.profile.field.vat_period")}</dt>
            <dd className="mt-1 text-sm text-[#071A33]">{vatPeriodLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-[#6B7A90]">{t("accounting.profile.field.approval_status")}</dt>
            <dd className="mt-1 text-sm text-[#071A33]">{t("accounting.profile.approval.approved")}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-xl border border-[#E3E8F0] bg-white p-4 sm:p-5">
        <h2 className="text-base font-extrabold text-[#071A33]">{t("accounting.profile.docs.section")}</h2>
        {profile.documents.length === 0 ? (
          <p className="mt-3 text-sm text-[#3D4B63]">{t("accounting.profile.docs.empty")}</p>
        ) : (
          <ul className="mt-3 divide-y divide-[#E3E8F0]">
            {profile.documents.map((doc) => (
              <li key={doc.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#071A33]">{t(DOC_LABEL[doc.docKind])}</p>
                  <p className="text-xs text-[#6B7A90]">
                    {t("accounting.profile.docs.uploaded_at")}: {formatDate(doc.uploadedAt)}
                  </p>
                </div>
                <button
                  type="button"
                  className="min-h-11 rounded-lg border border-[#E3E8F0] bg-[#F7F9FC] px-4 text-sm font-semibold text-[#071A33] disabled:opacity-50"
                  disabled={viewBusyId === doc.id}
                  onClick={() => void openDocument(doc.id)}
                >
                  {t("accounting.org_docs.view")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
