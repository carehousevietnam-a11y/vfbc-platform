"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  COMPANY_CATEGORY_OPTIONS,
  JOB_POSITION_OPTIONS,
  accountingProspectiveGuidePath,
  parseCompanySignupProfile,
  type CompanyCategory,
  type JobPosition,
} from "@/lib/accounting/companySignup";
import { accountingAuthFetch } from "@/lib/accounting/authFetch";
import { ACCOUNTING_ROUTES } from "@/lib/accounting/accountingNav";
import { accountingMessage, type AccountingMessageKey } from "@/lib/accounting/uiCatalog";
import { uiAccountingLocale } from "@/lib/accounting/localeFormat";
import { SelectionCard } from "@/components/ui";

export default function CompanyOnboardingClient() {
  const router = useRouter();
  const { locale } = useLocale();
  const lang = uiAccountingLocale(locale);
  const t = useCallback((key: AccountingMessageKey) => accountingMessage(lang, key), [lang]);

  const [companyCategory, setCompanyCategory] = useState<CompanyCategory | "">("");
  const [companyCategoryOther, setCompanyCategoryOther] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobPosition, setJobPosition] = useState<JobPosition | "">("");
  const [jobPositionOther, setJobPositionOther] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AccountingMessageKey | null>(null);

  const profileOk = parseCompanySignupProfile({
    companyCategory,
    companyCategoryOther,
    companyName: companyCategory === "prospective" && !companyName.trim() ? "미정" : companyName,
    jobPosition,
    jobPositionOther,
  }).ok;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profileOk) return;
    setBusy(true);
    setError(null);
    const res = await accountingAuthFetch("/api/accounting/company-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyCategory,
        companyCategoryOther,
        companyName: companyCategory === "prospective" && !companyName.trim() ? "미정" : companyName,
        jobPosition,
        jobPositionOther,
      }),
    });
    setBusy(false);
    if (res.status === 409) {
      setError("accounting.onboard.error.already");
      return;
    }
    if (!res.ok) {
      setError("accounting.onboard.error.generic");
      return;
    }
    const data = (await res.json()) as { prospective?: boolean };
    if (data.prospective) {
      window.location.href = accountingProspectiveGuidePath();
      return;
    }
    router.replace(ACCOUNTING_ROUTES.pending);
  }

  const categoryLabel = (value: CompanyCategory) =>
    t(`accounting.onboard.category.${value}` as AccountingMessageKey);
  const positionLabel = (value: JobPosition) =>
    t(`accounting.onboard.position.${value}` as AccountingMessageKey);

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8" data-testid="accounting-company-onboarding">
      <h1 className="text-[22px] font-extrabold tracking-[-0.03em] sm:text-[28px]">{t("accounting.onboard.title")}</h1>
      <p className="mt-2 text-[14px] leading-6 text-[#3D4B63]">{t("accounting.onboard.lead")}</p>

      <form className="mt-8 space-y-8" onSubmit={onSubmit}>
        <section>
          <h2 className="text-[15px] font-extrabold text-[#071A33]">{t("accounting.onboard.section.category")}</h2>
          <div className="mt-3 flex flex-col gap-2">
            {COMPANY_CATEGORY_OPTIONS.map((opt) => (
              <div key={opt.value} data-testid={`accounting-onboard-category-${opt.value}`}>
                <SelectionCard
                  title={categoryLabel(opt.value)}
                  selected={companyCategory === opt.value}
                  onClick={() => setCompanyCategory(opt.value)}
                  variant="quiet"
                />
              </div>
            ))}
          </div>
          {companyCategory === "other" ? (
            <input
              className="mt-3 w-full min-h-11 rounded-lg border border-[#E3E8F0] px-3 text-sm"
              value={companyCategoryOther}
              onChange={(e) => setCompanyCategoryOther(e.target.value)}
              placeholder={t("accounting.onboard.category_other_placeholder")}
            />
          ) : null}
        </section>

        <section>
          <h2 className="text-[15px] font-extrabold text-[#071A33]">{t("accounting.onboard.section.company_name")}</h2>
          <input
            className="mt-3 w-full min-h-11 rounded-lg border border-[#E3E8F0] px-3 text-sm"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder={
              companyCategory === "prospective"
                ? t("accounting.onboard.company_name_prospective_placeholder")
                : t("accounting.onboard.company_name_placeholder")
            }
          />
        </section>

        <section>
          <h2 className="text-[15px] font-extrabold text-[#071A33]">{t("accounting.onboard.section.position")}</h2>
          <div className="mt-3 flex flex-col gap-2">
            {JOB_POSITION_OPTIONS.map((opt) => (
              <div key={opt.value} data-testid={`accounting-onboard-position-${opt.value}`}>
                <SelectionCard
                  title={positionLabel(opt.value)}
                  selected={jobPosition === opt.value}
                  onClick={() => setJobPosition(opt.value)}
                  variant="quiet"
                />
              </div>
            ))}
          </div>
          {jobPosition === "other" ? (
            <input
              className="mt-3 w-full min-h-11 rounded-lg border border-[#E3E8F0] px-3 text-sm"
              value={jobPositionOther}
              onChange={(e) => setJobPositionOther(e.target.value)}
              placeholder={t("accounting.onboard.position_other_placeholder")}
            />
          ) : null}
        </section>

        {error ? <p className="text-sm text-[#B42318]">{t(error)}</p> : null}

        <button
          type="submit"
          disabled={!profileOk || busy}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#071A33] px-4 text-sm font-semibold text-white disabled:opacity-50"
          data-testid="accounting-onboard-submit"
        >
          {busy ? t("accounting.onboard.submitting") : t("accounting.onboard.submit")}
        </button>
      </form>
    </main>
  );
}
