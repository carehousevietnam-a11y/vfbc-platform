"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { accountingSupabase as supabase } from "@/lib/accounting/accountingSupabaseClient";
import { accountingMessage, type AccountingMessageKey } from "@/lib/accounting/uiCatalog";
import { uiAccountingLocale } from "@/lib/accounting/localeFormat";
import {
  accountingCompanyInfoHref,
  accountingMorePageLinksForRole,
  ACCOUNTING_MORE_PAGE_LINKS,
  ACCOUNTING_ROUTES,
  type AccountingCompanyInfoMembership,
  type AccountingNavKey,
} from "@/lib/accounting/accountingNav";
import { resolveAccountingOrgMembershipState } from "@/lib/accounting/orgMembership";

const LABEL: Record<AccountingNavKey, AccountingMessageKey> = {
  home: "accounting.nav.home",
  transactions: "accounting.nav.transactions",
  ledger: "accounting.nav.ledger",
  tax: "accounting.nav.tax",
  filing: "accounting.nav.filing",
  evidence: "accounting.nav.evidence",
  company: "accounting.nav.company",
  pending: "accounting.workspace.pending.title",
  more: "accounting.nav.more",
};

export default function AccountingMorePage() {
  const { locale } = useLocale();
  const lang = uiAccountingLocale(locale);
  const t = useCallback((key: AccountingMessageKey) => accountingMessage(lang, key), [lang]);
  const [membershipRole, setMembershipRole] = useState<string | null>(null);
  const [membershipKind, setMembershipKind] = useState<AccountingCompanyInfoMembership["kind"]>("none");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) return;
      const membership = await resolveAccountingOrgMembershipState(supabase, userId);
      if (cancelled) return;
      if (membership.kind === "approved" || membership.kind === "pending") {
        setMembershipRole(membership.role);
        setMembershipKind(membership.kind);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const moreLinks =
    membershipRole === "company_member"
      ? accountingMorePageLinksForRole("company_member")
      : ACCOUNTING_MORE_PAGE_LINKS;

  const companyInfoMembership: AccountingCompanyInfoMembership =
    membershipKind === "approved" || membershipKind === "pending"
      ? { kind: membershipKind, role: membershipRole ?? "" }
      : { kind: "none" };

  const linkHref = (key: AccountingNavKey) => {
    if (key === "company") return accountingCompanyInfoHref(companyInfoMembership);
    return ACCOUNTING_ROUTES[key];
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8" data-testid="accounting-more">
      <h1 className="text-[22px] font-extrabold tracking-[-0.03em]">{t("accounting.nav.more")}</h1>
      <p className="mt-2 text-[14px] leading-6 text-[#3D4B63]">{t("accounting.home.more.lead")}</p>
      <ul className="mt-6 flex flex-col gap-2">
        {moreLinks.map((key) => (
          <li key={key}>
            <Link
              href={linkHref(key)}
              className="flex min-h-11 items-center rounded-lg border border-[#E3E8F0] bg-white px-4 text-sm font-semibold text-[#2563EB]"
            >
              {t(LABEL[key])}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
