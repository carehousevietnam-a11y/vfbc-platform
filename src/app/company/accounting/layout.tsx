import { AccountingCatalogLocaleProvider } from "@/lib/accounting/AccountingCatalogLocale";
import { AccountingShell } from "@/lib/accounting/AccountingShell";
import { AccountingWorkspaceGate } from "@/lib/accounting/AccountingWorkspaceGate";

export default function AccountingModuleLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccountingCatalogLocaleProvider>
      <AccountingShell>
        <AccountingWorkspaceGate>{children}</AccountingWorkspaceGate>
      </AccountingShell>
    </AccountingCatalogLocaleProvider>
  );
}
