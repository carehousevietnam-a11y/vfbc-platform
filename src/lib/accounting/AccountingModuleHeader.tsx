"use client";

import Link from "next/link";
import { accountingMessage, type AccountingLocale, type AccountingMessageKey } from "./uiCatalog";

type Props = {
  locale: AccountingLocale;
  active: "transactions" | "ledger" | "vat";
};

export function AccountingModuleHeader({ locale, active }: Props) {
  const t = (key: AccountingMessageKey) => accountingMessage(locale, key);
  const linkClass = (kind: Props["active"]) =>
    `min-h-11 rounded-lg px-3 text-sm font-semibold ${
      active === kind ? "bg-[#071A33] text-white" : "bg-[#F7F9FC] text-[#3D4B63]"
    }`;
  return (
    <header className="border-b border-[#E3E8F0] bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-[15px] font-extrabold tracking-[-0.02em]">{t("accounting.shell.brand")}</p>
        <nav className="flex flex-wrap gap-2">
          <Link href="/company/accounting/transactions" className={linkClass("transactions")}>
            {t("accounting.nav.transactions")}
          </Link>
          <Link href="/company/accounting/ledger" className={linkClass("ledger")}>
            {t("accounting.nav.ledger")}
          </Link>
          <Link href="/company/accounting/vat" className={linkClass("vat")}>
            {t("accounting.nav.vat")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
