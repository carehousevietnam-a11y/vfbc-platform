import { AccountingShell } from "@/lib/accounting/AccountingShell";

export default function AccountingModuleLayout({ children }: { children: React.ReactNode }) {
  return <AccountingShell>{children}</AccountingShell>;
}
