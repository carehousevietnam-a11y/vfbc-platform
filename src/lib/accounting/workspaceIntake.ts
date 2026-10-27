import type { SupabaseClient } from "@supabase/supabase-js";
import { ACCOUNTING_ROUTES } from "./accountingNav";
import { resolveAccountingOrgMembershipState } from "./orgMembership";

export const ACCOUNTING_WORKSPACE_INTAKE_PATH = "/company/accounting/welcome";

export type WorkspaceReportIntent = "vat" | "corp_tax" | "invoices" | "undecided" | "custom";
export type WorkspacePeriodGranularity = "month" | "quarter" | "year";
export type WorkspaceViUnderstanding = "read_self" | "interpreter" | "ai_translate" | "hard" | "custom";

export type WorkspaceIntakePayload = {
  reportIntent: WorkspaceReportIntent;
  reportIntentCustom?: string;
  periodGranularity: WorkspacePeriodGranularity;
  periodKey: string;
  viUnderstanding: WorkspaceViUnderstanding;
  viUnderstandingCustom?: string;
};

export function isAccountingWorkspaceIntakePath(pathname: string): boolean {
  return pathname === ACCOUNTING_WORKSPACE_INTAKE_PATH || pathname.startsWith(`${ACCOUNTING_WORKSPACE_INTAKE_PATH}/`);
}

export function defaultEndedPeriodKey(granularity: WorkspacePeriodGranularity, ref = new Date()): string {
  const y = ref.getUTCFullYear();
  const m = ref.getUTCMonth();
  if (granularity === "month") {
    const d = new Date(Date.UTC(y, m - 1, 1));
    const yy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    return `${yy}-${mm}`;
  }
  if (granularity === "quarter") {
    const q = Math.floor(m / 3) + 1;
    const prevQ = q === 1 ? 4 : q - 1;
    const prevY = q === 1 ? y - 1 : y;
    return `${prevY}-Q${prevQ}`;
  }
  return String(y - 1);
}

const PERIOD_GRANULARITIES: WorkspacePeriodGranularity[] = ["month", "quarter", "year"];

export function periodKeyPattern(granularity: WorkspacePeriodGranularity): RegExp {
  if (granularity === "month") return /^\d{4}-(0[1-9]|1[0-2])$/;
  if (granularity === "quarter") return /^\d{4}-Q[1-4]$/;
  return /^\d{4}$/;
}

export function isValidWorkspacePeriodKey(
  granularity: WorkspacePeriodGranularity,
  periodKey: string,
): boolean {
  return periodKeyPattern(granularity).test(periodKey);
}

export function validateWorkspaceIntakePayload(body: WorkspaceIntakePayload): string | null {
  const intents: WorkspaceReportIntent[] = ["vat", "corp_tax", "invoices", "undecided", "custom"];
  const vi: WorkspaceViUnderstanding[] = ["read_self", "interpreter", "ai_translate", "hard", "custom"];
  if (!intents.includes(body.reportIntent)) return "INVALID_INTENT";
  if (!vi.includes(body.viUnderstanding)) return "INVALID_VI";
  if (!PERIOD_GRANULARITIES.includes(body.periodGranularity)) return "INVALID_GRANULARITY";
  if (body.reportIntent === "custom" && !body.reportIntentCustom?.trim()) return "CUSTOM_INTENT_REQUIRED";
  if (body.viUnderstanding === "custom" && !body.viUnderstandingCustom?.trim()) return "CUSTOM_VI_REQUIRED";
  if (!isValidWorkspacePeriodKey(body.periodGranularity, body.periodKey)) return "INVALID_PERIOD";
  return null;
}

export function workspaceIntakeRedirectPath(
  intent: WorkspaceReportIntent,
  periodKey: string,
): { path: string; noticeKey?: string } {
  switch (intent) {
    case "vat":
      return { path: `${ACCOUNTING_ROUTES.tax}?periodKey=${encodeURIComponent(periodKey)}` };
    case "corp_tax":
      return { path: ACCOUNTING_ROUTES.home, noticeKey: "accounting.welcome.notice.corp_tax_pending" };
    case "invoices":
      return { path: ACCOUNTING_ROUTES.transactions };
    case "undecided":
    case "custom":
    default:
      return { path: ACCOUNTING_ROUTES.home };
  }
}

export async function hasOrgWorkspaceIntake(client: SupabaseClient, orgId: string): Promise<boolean> {
  const { data, error } = await client
    .from("accounting_org_workspace_intake")
    .select("org_id")
    .eq("org_id", orgId)
    .maybeSingle();
  if (error) {
    if (error.code === "42P01" || error.message?.includes("does not exist")) return true;
    return false;
  }
  return Boolean(data?.org_id);
}

export async function resolveCompanyWorkspaceIntakeState(
  client: SupabaseClient,
  userId: string,
): Promise<
  | { kind: "skip" }
  | { kind: "needs_intake"; orgId: string; role: string }
  | { kind: "complete"; orgId: string }
> {
  const membership = await resolveAccountingOrgMembershipState(client, userId);
  if (membership.kind !== "approved") return { kind: "skip" };
  if (membership.role !== "company_owner" && membership.role !== "company_member") return { kind: "skip" };
  const done = await hasOrgWorkspaceIntake(client, membership.orgId);
  if (done) return { kind: "complete", orgId: membership.orgId };
  return { kind: "needs_intake", orgId: membership.orgId, role: membership.role };
}
