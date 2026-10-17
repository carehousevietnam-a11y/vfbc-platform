"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { accountingMessage, type AccountingMessageKey } from "./uiCatalog";
import { uiAccountingLocale } from "./localeFormat";
import { ACCOUNTING_ROUTES } from "./accountingNav";

const standardizedPath = `${ACCOUNTING_ROUTES.tax}/standardized`;

type TaxNavItem = {
  href: string;
  labelKey: AccountingMessageKey;
  match: (path: string) => boolean;
};

const ITEMS: TaxNavItem[] = [
  {
    href: ACCOUNTING_ROUTES.tax,
    labelKey: "accounting.nav.vat",
    match: (path) =>
      path === ACCOUNTING_ROUTES.tax ||
      (path.startsWith(`${ACCOUNTING_ROUTES.tax}/`) && !path.startsWith(standardizedPath)),
  },
  {
    href: standardizedPath,
    labelKey: "accounting.standardized.nav",
    match: (path) => path.startsWith(standardizedPath),
  },
];

export function AccountingTaxSubnav() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const lang = uiAccountingLocale(locale);
  const t = useCallback((key: AccountingMessageKey) => accountingMessage(lang, key), [lang]);

  return (
    <nav
      className="mb-6 flex flex-wrap gap-2 border-b border-[#E4E9F0] pb-3"
      aria-label={t("accounting.standardized.subnav_aria")}
      data-testid="accounting-tax-subnav"
    >
      {ITEMS.map((item) => {
        const active = item.match(pathname ?? "");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold ${
              active ? "bg-[#071A33] text-white" : "bg-[#F4F7FB] text-[#3D4B63] hover:bg-[#E8EEF5]"
            }`}
          >
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
