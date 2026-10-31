import { AccountingCatalogLocaleProvider } from "@/lib/accounting/AccountingCatalogLocale";
import { AccountingDevSessionBootstrap } from "@/lib/accounting/AccountingDevSessionBootstrap";
import { AccountingShell } from "@/lib/accounting/AccountingShell";
import { AccountingWorkspaceGate } from "@/lib/accounting/AccountingWorkspaceGate";

export default function AccountingModuleLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccountingCatalogLocaleProvider>
      <AccountingDevSessionBootstrap />
      <AccountingShell>
        <AccountingWorkspaceGate>{children}</AccountingWorkspaceGate>
      </AccountingShell>
    </AccountingCatalogLocaleProvider>
  );
}
