import { AccountingCatalogLocaleProvider } from "@/lib/accounting/AccountingCatalogLocale";

export default function VnkAccountingLayout({ children }: { children: React.ReactNode }) {
  return <AccountingCatalogLocaleProvider>{children}</AccountingCatalogLocaleProvider>;
}
