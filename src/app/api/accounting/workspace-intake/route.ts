import { NextRequest, NextResponse } from "next/server";
import { resolveAccountingActor } from "@/lib/accounting/accountingActor";
import { draftVatDeclaration } from "@/lib/accounting/vatDeclarationEntry";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";
import { resolveAccountingOrgMembershipState } from "@/lib/accounting/orgMembership";
import {
  validateWorkspaceIntakePayload,
  workspaceIntakeRedirectPath,
  type WorkspaceIntakePayload,
} from "@/lib/accounting/workspaceIntake";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const actor = await resolveAccountingActor(session.client, session.token);
  if (!actor.ok) return NextResponse.json({ error: actor.error }, { status: actor.status });

  const membership = await resolveAccountingOrgMembershipState(session.client, actor.userId);
  if (membership.kind !== "approved") return NextResponse.json({ error: "ORG_NOT_APPROVED" }, { status: 403 });
  if (membership.role !== "company_owner" && membership.role !== "company_member") {
    return NextResponse.json({ error: "ROLE_NOT_ALLOWED" }, { status: 403 });
  }

  const { data: org, error: orgErr } = await session.client
    .from("accounting_organizations")
    .select("name_official, name_ko_display, tax_code")
    .eq("id", membership.orgId)
    .single();
  if (orgErr || !org) return NextResponse.json({ error: "ORG_NOT_FOUND" }, { status: 404 });

  const { data: intake, error: intakeErr } = await session.client
    .from("accounting_org_workspace_intake")
    .select("org_id, report_intent, period_key, vi_understanding")
    .eq("org_id", membership.orgId)
    .maybeSingle();
  if (intakeErr && intakeErr.code !== "PGRST116") {
    return NextResponse.json({ error: "INTAKE_LOOKUP_FAILED" }, { status: 500 });
  }

  const displayName = (org.name_ko_display as string | null)?.trim() || (org.name_official as string);
  return NextResponse.json({
    completed: Boolean(intake?.org_id),
    org: {
      name: displayName,
      taxCode: (org.tax_code as string | null) ?? "",
    },
    intake: intake
      ? {
          reportIntent: intake.report_intent,
          periodKey: intake.period_key,
          viUnderstanding: intake.vi_understanding,
        }
      : null,
  });
}

export async function POST(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const actor = await resolveAccountingActor(session.client, session.token);
  if (!actor.ok) return NextResponse.json({ error: actor.error }, { status: actor.status });

  const membership = await resolveAccountingOrgMembershipState(session.client, actor.userId);
  if (membership.kind !== "approved") return NextResponse.json({ error: "ORG_NOT_APPROVED" }, { status: 403 });
  if (membership.role !== "company_owner" && membership.role !== "company_member") {
    return NextResponse.json({ error: "ROLE_NOT_ALLOWED" }, { status: 403 });
  }

  const raw = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!raw) return NextResponse.json({ error: "VALIDATION" }, { status: 422 });

  const body: WorkspaceIntakePayload = {
    reportIntent: raw.reportIntent as WorkspaceIntakePayload["reportIntent"],
    reportIntentCustom: typeof raw.reportIntentCustom === "string" ? raw.reportIntentCustom : undefined,
    periodGranularity: raw.periodGranularity as WorkspaceIntakePayload["periodGranularity"],
    periodKey: typeof raw.periodKey === "string" ? raw.periodKey.trim() : "",
    viUnderstanding: raw.viUnderstanding as WorkspaceIntakePayload["viUnderstanding"],
    viUnderstandingCustom:
      typeof raw.viUnderstandingCustom === "string" ? raw.viUnderstandingCustom : undefined,
  };

  const validationError = validateWorkspaceIntakePayload(body);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const { data: existing } = await session.client
    .from("accounting_org_workspace_intake")
    .select("org_id")
    .eq("org_id", membership.orgId)
    .maybeSingle();
  if (existing?.org_id) return NextResponse.json({ error: "ALREADY_COMPLETED" }, { status: 409 });

  const { error: insErr } = await session.client.from("accounting_org_workspace_intake").insert({
    org_id: membership.orgId,
    report_intent: body.reportIntent,
    report_intent_custom: body.reportIntent === "custom" ? body.reportIntentCustom?.trim() : null,
    period_granularity: body.periodGranularity,
    period_key: body.periodKey,
    vi_understanding: body.viUnderstanding,
    vi_understanding_custom: body.viUnderstanding === "custom" ? body.viUnderstandingCustom?.trim() : null,
    created_by: actor.userId,
  });
  if (insErr) return NextResponse.json({ error: "INSERT_FAILED" }, { status: 500 });

  const redirect = workspaceIntakeRedirectPath(body.reportIntent, body.periodKey);

  if (body.reportIntent === "vat") {
    await draftVatDeclaration(session.client, session.token, body.periodKey);
  }

  return NextResponse.json({ ok: true, redirectPath: redirect.path, noticeKey: redirect.noticeKey ?? null });
}
