"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { accountingMessage, type AccountingMessageKey } from "./uiCatalog";
import { uiAccountingLocale } from "./localeFormat";
import {
  ACCOUNTING_ROUTES,
  ACCOUNTING_SHELL_DESKTOP_NAV,
  type AccountingNavKey,
  navKeyFromPath,
} from "./accountingNav";
import { AccountingBrandLockup } from "./AccountingBrandLockup";

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

  const linkClass = (key: AccountingNavKey) =>
    `min-h-11 inline-flex items-center rounded-lg px-3 text-sm font-semibold ${
      active === key ? "bg-[#071A33] text-white" : "bg-[#F7F9FC] text-[#3D4B63]"
    }`;

  const tabClass = (key: AccountingNavKey) =>
    `flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-semibold leading-tight ${
      active === key ? "text-[#071A33]" : "text-[#6B7A90]"
    }`;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F9FC] text-[#071A33] pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <header className="border-b border-[#E3E8F0] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6">
          <AccountingBrandLockup locale={lang} variant="header" />
          <nav className="hidden flex-wrap gap-2 md:flex" aria-label={t("accounting.nav.aria")}>
            {ACCOUNTING_SHELL_DESKTOP_NAV.map((key) => (
              <Link key={key} href={ACCOUNTING_ROUTES[key]} className={linkClass(key)}>
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
