import { AccountingShell } from "@/lib/accounting/AccountingShell";
import { AccountingWorkspaceGate } from "@/lib/accounting/AccountingWorkspaceGate";

export default function AccountingModuleLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccountingShell>
      <AccountingWorkspaceGate>{children}</AccountingWorkspaceGate>
    </AccountingShell>
  );
}
