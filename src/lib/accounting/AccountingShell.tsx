"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { supabase } from "@/lib/supabase";
import { accountingMessage, type AccountingMessageKey } from "./uiCatalog";
import { uiAccountingLocale } from "./localeFormat";
import {
  ACCOUNTING_ROUTES,
  ACCOUNTING_SHELL_DESKTOP_NAV,
  accountingCompanyInfoHref,
  accountingShellDesktopNavForRole,
  type AccountingCompanyInfoMembership,
  type AccountingNavKey,
  navKeyFromPath,
} from "./accountingNav";
import { AccountingBrandLockup } from "./AccountingBrandLockup";
import { resolveAccountingOrgMembershipState } from "./orgMembership";

const MOBILE_TABS: AccountingNavKey[] = ["home", "transactions", "tax", "more"];

const NAV_I18N: Record<AccountingNavKey, AccountingMessageKey> = {
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

type Props = { children: React.ReactNode };

export function AccountingShell({ children }: Props) {
  const pathname = usePathname() ?? "";
  const { locale } = useLocale();
  const lang = uiAccountingLocale(locale);
  const t = (key: AccountingMessageKey) => accountingMessage(lang, key);
  const active = navKeyFromPath(pathname);
  const [membershipRole, setMembershipRole] = useState<string | null>(null);
  const [membershipKind, setMembershipKind] = useState<AccountingCompanyInfoMembership["kind"]>("none");
  const [membershipLoaded, setMembershipLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) {
        if (!cancelled) setMembershipLoaded(true);
        return;
      }
      const membership = await resolveAccountingOrgMembershipState(supabase, userId);
      if (cancelled) return;
      if (membership.kind === "approved" || membership.kind === "pending") {
        setMembershipRole(membership.role);
        setMembershipKind(membership.kind);
      }
      setMembershipLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const companyInfoMembership: AccountingCompanyInfoMembership =
    membershipKind === "approved" || membershipKind === "pending"
      ? { kind: membershipKind, role: membershipRole ?? "" }
      : { kind: "none" };

  const navHref = (key: AccountingNavKey) => {
    if (key === "company") return accountingCompanyInfoHref(companyInfoMembership);
    return ACCOUNTING_ROUTES[key];
  };

  const desktopNavKeys = membershipLoaded
    ? accountingShellDesktopNavForRole(membershipRole)
    : ACCOUNTING_SHELL_DESKTOP_NAV.filter((k) => k !== "company");

  const linkClass = (key: AccountingNavKey) =>
    `min-h-11 inline-flex items-center rounded-lg px-3 text-sm font-semibold ${
      active === key ? "bg-[#071A33] text-white" : "bg-[#F7F9FC] text-[#3D4B63]"
    }`;

  const tabClass = (key: AccountingNavKey) =>
    `flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-semibold leading-tight ${
      active === key ? "text-[#071A33]" : "text-[#6B7A90]"
    }`;

  if (!mounted) {
    return <div className="min-h-screen bg-[#F7F9FC]" aria-busy="true" />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F9FC] text-[#071A33] pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <header className="border-b border-[#E3E8F0] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6">
          <AccountingBrandLockup locale={lang} variant="header" />
          <nav className="hidden flex-wrap gap-2 md:flex" aria-label={t("accounting.nav.aria")}>
            {desktopNavKeys.map((key) => (
              <Link
                key={key}
                href={navHref(key)}
                className={linkClass(key)}
                data-testid={`accounting-nav-link-${key}`}
              >
                {t(NAV_I18N[key])}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[#E3E8F0] bg-white md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label={t("accounting.nav.mobile_aria")}
        data-testid="accounting-mobile-tabs"
      >
        {MOBILE_TABS.map((key) => (
          <Link key={key} href={ACCOUNTING_ROUTES[key]} className={tabClass(key)}>
            <span aria-current={active === key ? "page" : undefined}>{t(NAV_I18N[key])}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
