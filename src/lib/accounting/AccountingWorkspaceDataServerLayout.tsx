import { redirect } from "next/navigation";
import { createAccountingServerClient } from "./accountingServerClient";
import { ACCOUNTING_ROUTES } from "./accountingNav";
import { accountingProspectiveGuidePath } from "./companySignup";
import { resolveAccountingWorkspaceDestination } from "./accountingWorkspace";

/** 작업공간 데이터 페이지 — 승인 전에는 서버 redirect로 하위 UI를 렌더하지 않는다. */
export default async function AccountingWorkspaceDataServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createAccountingServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return <>{children}</>;
  }

  const { data: userRow } = await supabase.from("users").select("member_type").eq("id", user.id).maybeSingle();
  if (userRow?.member_type !== "company") {
    return <>{children}</>;
  }

  const dest = await resolveAccountingWorkspaceDestination(supabase, user.id, userRow.member_type);
  if (dest.kind === "pending") redirect(ACCOUNTING_ROUTES.pending);
  if (dest.kind === "onboarding") redirect(ACCOUNTING_ROUTES.company);
  if (dest.kind === "prospective_guide") redirect(accountingProspectiveGuidePath());

  return <>{children}</>;
}
