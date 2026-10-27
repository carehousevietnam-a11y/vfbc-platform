"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ACCOUNTING_ROUTES } from "./accountingNav";
import { accountingProspectiveGuidePath } from "./companySignup";
import {
  isAccountingOnboardingPath,
  isAccountingPendingPath,
  isAccountingWorkspaceDataPath,
  resolveAccountingWorkspaceDestination,
} from "./accountingWorkspace";
import { ensureAccountingClientSession } from "./devClientSessionBootstrap";
import {
  ACCOUNTING_WORKSPACE_INTAKE_PATH,
  isAccountingWorkspaceIntakePath,
  resolveCompanyWorkspaceIntakeState,
} from "./workspaceIntake";

type Props = { children: React.ReactNode };

export function AccountingWorkspaceGate({ children }: Props) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const needsGuard =
        isAccountingWorkspaceDataPath(pathname) ||
        isAccountingOnboardingPath(pathname) ||
        isAccountingPendingPath(pathname);
      if (!needsGuard) {
        if (!cancelled) setReady(true);
        return;
      }

      await ensureAccountingClientSession();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const userId = sessionData.session?.user?.id;
      if (!token || !userId) {
        if (!cancelled) setReady(true);
        return;
      }

      const { data: userRow } = await supabase.from("users").select("member_type").eq("id", userId).maybeSingle();
      const dest = await resolveAccountingWorkspaceDestination(supabase, userId, userRow?.member_type);

      if (cancelled) return;

      if (dest.kind === "prospective_guide" && !isAccountingOnboardingPath(pathname)) {
        router.replace(accountingProspectiveGuidePath());
        return;
      }
      if (dest.kind === "onboarding" && isAccountingWorkspaceDataPath(pathname)) {
        router.replace(ACCOUNTING_ROUTES.company);
        return;
      }
      if (dest.kind === "pending" && isAccountingWorkspaceDataPath(pathname)) {
        router.replace(ACCOUNTING_ROUTES.pending);
        return;
      }
      if (dest.kind === "workspace" && (isAccountingOnboardingPath(pathname) || isAccountingPendingPath(pathname))) {
        router.replace(dest.href);
        return;
      }

      if (dest.kind === "workspace") {
        const intake = await resolveCompanyWorkspaceIntakeState(supabase, userId);
        if (cancelled) return;
        if (intake.kind === "needs_intake" && isAccountingWorkspaceDataPath(pathname) && !isAccountingWorkspaceIntakePath(pathname)) {
          router.replace(ACCOUNTING_WORKSPACE_INTAKE_PATH);
          return;
        }
        if (intake.kind === "complete" && isAccountingWorkspaceIntakePath(pathname)) {
          router.replace(ACCOUNTING_ROUTES.home);
          return;
        }
      }

      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (
    !ready &&
    (isAccountingWorkspaceDataPath(pathname) ||
      isAccountingPendingPath(pathname) ||
      isAccountingWorkspaceIntakePath(pathname))
  ) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-[#6B7A90]" data-testid="accounting-workspace-gate-loading">
        …
      </div>
    );
  }

  return <>{children}</>;
}
