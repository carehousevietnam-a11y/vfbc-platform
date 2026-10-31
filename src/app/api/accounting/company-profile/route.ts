import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseCompanySignupProfile, shouldCreateAccountingOrg } from "@/lib/accounting/companySignup";
import {
  CompanySignupAlreadyProvisionedError,
  provisionCompanyMemberSignup,
} from "@/lib/accounting/provisionCompanyMemberSignup";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { data: authData, error: authError } = await session.client.auth.getUser(session.token);
  const userId = authData.user?.id;
  if (authError || !userId) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ error: "SERVER_CONFIG" }, { status: 500 });

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: userRow, error: userError } = await admin
    .from("users")
    .select("member_type")
    .eq("id", userId)
    .maybeSingle();
  if (userError || userRow?.member_type !== "company") {
    return NextResponse.json({ error: "NOT_COMPANY_MEMBER" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "VALIDATION" }, { status: 422 });
  // org_id 등 클라이언트가 보낸 조직 식별자는 무시한다(서버가 새 pending org 생성).
  const { org_id: _ignoredOrgId, organization_id: _ignoredOrgId2, ...profileBody } = body;

  const parsed = parseCompanySignupProfile(profileBody);
  if (!parsed.ok) {
    return NextResponse.json({ error: "VALIDATION", errors: parsed.errors }, { status: 400 });
  }

  try {
    const provision = await provisionCompanyMemberSignup(admin, userId, parsed.profile);
    return NextResponse.json({
      orgId: provision.orgId,
      approvalStatus: provision.approvalStatus,
      prospective: !shouldCreateAccountingOrg(parsed.profile.companyCategory),
    });
  } catch (err) {
    if (err instanceof CompanySignupAlreadyProvisionedError) {
      return NextResponse.json({ error: "ALREADY_PROVISIONED" }, { status: 409 });
    }
    return NextResponse.json({ error: "PROVISION_FAILED" }, { status: 500 });
  }
}
