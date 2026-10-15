import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type CompanySignupProfileFields,
  shouldCreateAccountingOrg,
} from "@/lib/accounting/companySignup";

export type ProvisionCompanyMemberResult = {
  orgId: string | null;
  approvalStatus: "pending" | null;
};

/**
 * Service-role only: persist company signup profile, optional pending org + owner membership.
 */
export async function provisionCompanyMemberSignup(
  admin: SupabaseClient,
  userId: string,
  profile: CompanySignupProfileFields
): Promise<ProvisionCompanyMemberResult> {
  const { error: profileError } = await admin.from("accounting_company_signup_profiles").insert({
    user_id: userId,
    company_category: profile.companyCategory,
    company_category_other: profile.companyCategoryOther,
    company_name: profile.companyName,
    job_position: profile.jobPosition,
    job_position_other: profile.jobPositionOther,
  });

  if (profileError) {
    throw new Error(`accounting_company_signup_profiles insert: ${profileError.message}`);
  }

  const { error: localeError } = await admin.from("accounting_profiles").upsert(
    { user_id: userId, locale: "ko" },
    { onConflict: "user_id" }
  );
  if (localeError) {
    throw new Error(`accounting_profiles upsert: ${localeError.message}`);
  }

  if (!shouldCreateAccountingOrg(profile.companyCategory)) {
    return { orgId: null, approvalStatus: null };
  }

  const { data: org, error: orgError } = await admin
    .from("accounting_organizations")
    .insert({
      name_official: profile.companyName,
      name_ko_display: profile.companyName,
      approval_status: "pending",
    })
    .select("id, approval_status")
    .single();

  if (orgError || !org) {
    throw new Error(`accounting_organizations insert: ${orgError?.message ?? "unknown"}`);
  }

  const { error: memberError } = await admin.from("accounting_org_members").insert({
    org_id: org.id,
    user_id: userId,
    role: "company_owner",
  });

  if (memberError) {
    throw new Error(`accounting_org_members insert: ${memberError.message}`);
  }

  return { orgId: org.id, approvalStatus: org.approval_status as "pending" };
}
