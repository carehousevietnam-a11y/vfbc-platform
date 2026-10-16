"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { accountingFunnelSignupHref } from "../companySignup";
import { accountingMessage, type AccountingLocale, type AccountingMessageKey } from "../uiCatalog";

type MemberPhase = "loading" | "signed_out" | "personal" | "company";

type Props = {
  locale: AccountingLocale;
  returnPath: string;
};

export function AccountingFunnelExpertCta({ locale, returnPath }: Props) {
  const t = (key: AccountingMessageKey) => accountingMessage(locale, key);
  const [phase, setPhase] = useState<MemberPhase>("loading");

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
      setPhase(row.member_type === "company" ? "company" : "personal");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signupHref = accountingFunnelSignupHref(returnPath);

  if (phase === "loading") {
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
    <div className="space-y-3" data-testid="accounting-funnel-expert-company-pending">
      <p className="text-sm text-[#3D4B63]">{t("accounting.funnel.expert.workspace_pending")}</p>
      <p className="text-xs leading-5 text-[#6B7A90]">{t("accounting.funnel.expert.workspace_pending_note")}</p>
    </div>
  );
}
