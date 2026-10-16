"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { accountingAuthFetch } from "@/lib/accounting/authFetch";
import { ACCOUNTING_ROUTES } from "@/lib/accounting/accountingNav";
import { accountingMessage, type AccountingMessageKey } from "@/lib/accounting/uiCatalog";
import { uiAccountingLocale } from "@/lib/accounting/localeFormat";
import type { OrgDocumentKind } from "@/lib/accounting/orgDocumentEntry";

type DocRow = { id: string; docKind: OrgDocumentKind; uploadedAt: string };

export default function AccountingPendingClient() {
  const { locale } = useLocale();
  const lang = uiAccountingLocale(locale);
  const t = useCallback((key: AccountingMessageKey) => accountingMessage(lang, key), [lang]);

  const [approvalStatus, setApprovalStatus] = useState<string>("pending");
  const [items, setItems] = useState<DocRow[]>([]);
  const [reviewNote, setReviewNote] = useState<string | null>(null);
  const [busyKind, setBusyKind] = useState<OrgDocumentKind | null>(null);
  const [requestBusy, setRequestBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await accountingAuthFetch(`/api/accounting/org-documents?lang=${lang}`);
    if (!res.ok) return;
    const body = (await res.json()) as {
      approvalStatus: string;
      items: DocRow[];
      reviewNote: string | null;
    };
    setApprovalStatus(body.approvalStatus);
    setItems(body.items ?? []);
    setReviewNote(body.reviewNote);
  }, [lang]);

  useEffect(() => {
    void load();
  }, [load]);

  const hasKind = (kind: OrgDocumentKind) => items.some((i) => i.docKind === kind);
  const canUpload = approvalStatus === "pending" || approvalStatus === "rejected";
  const canRequest =
    canUpload && hasKind("business_registration") && hasKind("investment_registration");

  async function onUpload(kind: OrgDocumentKind, file: File) {
    if (!canUpload) return;
    setBusyKind(kind);
    const form = new FormData();
    form.set("docKind", kind);
    form.set("file", file);
    const res = await accountingAuthFetch("/api/accounting/org-documents", { method: "POST", body: form });
    setBusyKind(null);
    if (res.ok) await load();
  }

  async function onRequest() {
    if (!canRequest) return;
    setRequestBusy(true);
    const res = await accountingAuthFetch("/api/accounting/org-approval-request", { method: "POST" });
    setRequestBusy(false);
    if (res.ok) await load();
  }

  const docLabel = (kind: OrgDocumentKind) =>
    t(
      kind === "business_registration"
        ? "accounting.org_docs.business_registration"
        : "accounting.org_docs.investment_registration",
    );

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8" data-testid="accounting-workspace-pending-approval">
      <h1 className="text-[22px] font-extrabold tracking-[-0.03em]">
        {approvalStatus === "rejected"
          ? t("accounting.workspace.rejected.title")
          : t("accounting.workspace.pending.title")}
      </h1>
      <p className="mt-3 text-[14px] leading-6 text-[#3D4B63]">
        {approvalStatus === "rejected" ? t("accounting.workspace.rejected.lead") : t("accounting.workspace.pending.lead")}
      </p>

      {approvalStatus === "in_review" ? (
        <p className="mt-6 rounded-lg border border-[#E3E8F0] bg-white p-4 text-sm font-semibold text-[#071A33]" data-testid="accounting-org-in-review">
          {t("accounting.org_docs.in_review")}
        </p>
      ) : null}

      {approvalStatus === "rejected" && reviewNote ? (
        <div className="mt-6 rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] p-4" data-testid="accounting-org-review-note">
          <p className="text-sm font-semibold text-[#071A33]">{t("accounting.org_docs.review_note_label")}</p>
          <p className="mt-2 text-sm leading-6 text-[#3D4B63]">{reviewNote}</p>
        </div>
      ) : null}

      {canUpload ? (
        <section className="mt-8 space-y-4" data-testid="accounting-org-docs-upload">
          <h2 className="text-[15px] font-extrabold text-[#071A33]">{t("accounting.org_docs.section")}</h2>
          {(["business_registration", "investment_registration"] as OrgDocumentKind[]).map((kind) => (
            <div key={kind} className="rounded-lg border border-[#E3E8F0] bg-white p-4">
              <p className="text-sm font-semibold text-[#071A33]">{docLabel(kind)}</p>
              {hasKind(kind) ? (
                <p className="mt-2 text-sm text-[#0F6B3E]">{t("accounting.org_docs.uploaded")}</p>
              ) : (
                <label className="mt-3 flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[#2563EB]">
                  {busyKind === kind ? t("accounting.org_docs.requesting") : t("accounting.org_docs.upload")}
                  <input
                    type="file"
                    accept="application/pdf,image/png,image/jpeg"
                    className="sr-only"
                    data-testid={`accounting-org-doc-input-${kind}`}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void onUpload(kind, f);
                    }}
                  />
                </label>
              )}
            </div>
          ))}
          {!canRequest ? (
            <p className="text-sm text-[#6B7A90]">{t("accounting.org_docs.required_both")}</p>
          ) : null}
          <button
            type="button"
            disabled={!canRequest || requestBusy}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#071A33] px-4 text-sm font-semibold text-white disabled:opacity-50"
            data-testid="accounting-org-request-approval"
            onClick={() => void onRequest()}
          >
            {requestBusy ? t("accounting.org_docs.requesting") : t("accounting.org_docs.request_approval")}
          </button>
        </section>
      ) : null}

      <Link
        href={ACCOUNTING_ROUTES.home}
        className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-[#2563EB]"
      >
        {t("accounting.onboard.back_home")}
      </Link>
    </main>
  );
}
