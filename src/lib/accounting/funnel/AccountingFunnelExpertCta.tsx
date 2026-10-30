"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { accountingSupabase as supabase } from "@/lib/accounting/accountingSupabaseClient";
import { useClientMounted } from "../useClientMounted";
import { accountingFunnelSignupHref, accountingProspectiveGuidePath } from "../companySignup";
import { resolveAccountingWorkspaceDestination } from "../accountingWorkspace";
import { accountingMessage, type AccountingLocale, type AccountingMessageKey } from "../uiCatalog";

type MemberPhase = "loading" | "signed_out" | "personal" | "company";

type Props = {
  locale: AccountingLocale;
  returnPath: string;
};

export function AccountingFunnelExpertCta({ locale, returnPath }: Props) {
  const t = (key: AccountingMessageKey) => accountingMessage(locale, key);
  const hydrated = useClientMounted();
  const [phase, setPhase] = useState<MemberPhase>("loading");
  const [workspaceHref, setWorkspaceHref] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const userId = sessionData.session?.user?.id;
      if (!token || !userId) {
        if (!cancelled) setPhase("signed_out");
        return;
      }
      const { data: row, error } = await supabase
        .from("users")
        .select("member_type")
        .eq("id", userId)
        .maybeSingle();
      if (cancelled) return;
      if (error || !row) {
        setPhase("personal");
        return;
      }
      if (row.member_type !== "company") {
        setPhase("personal");
        return;
      }
      const dest = await resolveAccountingWorkspaceDestination(supabase, userId, row.member_type);
      if (dest.kind === "workspace") setWorkspaceHref(dest.href);
      else if (dest.kind === "onboarding") setWorkspaceHref("/company/accounting/company");
      else if (dest.kind === "pending") setWorkspaceHref("/company/accounting/pending");
      else if (dest.kind === "prospective_guide") setWorkspaceHref(accountingProspectiveGuidePath());
      setPhase("company");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signupHref = accountingFunnelSignupHref(returnPath);

  if (!hydrated || phase === "loading") {
    return <p className="text-sm text-[#6B7A90]">{t("accounting.funnel.expert.loading")}</p>;
  }

  if (phase === "signed_out") {
    return (
      <div className="space-y-3" data-testid="accounting-funnel-expert-signed-out">
        <p className="text-sm text-[#3D4B63]">{t("accounting.funnel.expert.signed_out_lead")}</p>
        <Link
          href={signupHref}
          data-testid="accounting-funnel-expert-signup"
          className="inline-flex min-h-11 items-center rounded-lg bg-[#071A33] px-4 text-sm font-semibold text-white"
        >
          {t("accounting.funnel.expert.cta")}
        </Link>
      </div>
    );
  }

  if (phase === "personal") {
    return (
      <div className="space-y-3" data-testid="accounting-funnel-expert-personal">
        <p className="text-sm text-[#3D4B63]">{t("accounting.funnel.expert.personal_lead")}</p>
        <Link
          href={signupHref}
          data-testid="accounting-funnel-expert-signup"
          className="inline-flex min-h-11 items-center rounded-lg bg-[#071A33] px-4 text-sm font-semibold text-white"
        >
          {t("accounting.funnel.signup.cta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="accounting-funnel-expert-company-connected">
      <p className="text-sm text-[#3D4B63]">{t("accounting.funnel.expert.company_lead")}</p>
      {workspaceHref ? (
        <Link
          href={workspaceHref}
          data-testid="accounting-funnel-expert-workspace"
          className="inline-flex min-h-11 items-center rounded-lg bg-[#071A33] px-4 text-sm font-semibold text-white"
        >
          {t("accounting.funnel.expert.workspace_cta")}
        </Link>
      ) : null}
    </div>
  );
}
