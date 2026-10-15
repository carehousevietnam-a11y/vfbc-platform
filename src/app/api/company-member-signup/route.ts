import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  COMPANY_SIGNUP_CHANNEL,
  isTrustedCompanySignupChannel,
  parseCompanySignupProfile,
  validateCompanySignupPassword,
} from "@/lib/accounting/companySignup";
import { provisionCompanyMemberSignup } from "@/lib/accounting/provisionCompanyMemberSignup";
import {
  validateLeadForm,
  resolveLanguage,
  type SupportedLanguage,
} from "@/lib/customerRegistrationValidation";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;

    if (!isTrustedCompanySignupChannel(body.companySignupChannel)) {
      return NextResponse.json({ error: "INVALID_SIGNUP_CHANNEL" }, { status: 400 });
    }

    const name = typeof body.name === "string" ? body.name : "";
    const phone = typeof body.phone === "string" ? body.phone : "";
    const email = typeof body.email === "string" ? body.email : "";
    const address = typeof body.address === "string" ? body.address : "";
    const password = typeof body.password === "string" ? body.password : "";
    const passwordConfirm = typeof body.passwordConfirm === "string" ? body.passwordConfirm : "";
    const lang: SupportedLanguage = resolveLanguage(
      typeof body.lang === "string" ? body.lang : null
    );

    const { valid, errors: leadErrors } = validateLeadForm(
      {
        name,
        phone,
        address,
        email,
        kakao_id: typeof body.kakao_id === "string" ? body.kakao_id : "",
        zalo_id: typeof body.zalo_id === "string" ? body.zalo_id : "",
      },
      lang
    );

    const passwordErrors = validateCompanySignupPassword(password, passwordConfirm);
    const profileParsed = parseCompanySignupProfile(body);

    const mergedErrors = {
      ...leadErrors,
      ...passwordErrors,
      ...(profileParsed.ok ? {} : profileParsed.errors),
    };

    if (!valid || Object.keys(passwordErrors).length > 0 || !profileParsed.ok) {
      const firstField = Object.keys(mergedErrors)[0];
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          field: firstField,
          message: mergedErrors[firstField as keyof typeof mergedErrors],
          errors: mergedErrors,
        },
        { status: 400 }
      );
    }

    const authEmail = email.trim();
    const { data: existingUsers, error: findError } = await supabaseAdmin
      .from("users")
      .select("id")
      .or(`phone.eq.${phone},email.eq.${authEmail}`)
      .limit(1);

    if (findError) {
      console.error("company-member-signup lookup error:", findError);
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { error: "ALREADY_REGISTERED", message: "이미 가입된 연락처 또는 이메일입니다." },
        { status: 409 }
      );
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: authEmail,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      console.error("company-member-signup createUser error:", authError);
      return NextResponse.json(
        { error: authError?.message ?? "계정 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    const { error: profileError } = await supabaseAdmin.from("users").insert({
      id: userId,
      phone,
      email: authEmail,
      name,
      address: address || null,
      kakao_id: typeof body.kakao_id === "string" && body.kakao_id.trim() ? body.kakao_id.trim() : null,
      zalo_id: typeof body.zalo_id === "string" && body.zalo_id.trim() ? body.zalo_id.trim() : null,
      member_type: "company",
      password_set: true,
    });

    if (profileError) {
      console.error("company-member-signup users insert error:", profileError);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    let provision: Awaited<ReturnType<typeof provisionCompanyMemberSignup>>;
    try {
      provision = await provisionCompanyMemberSignup(
        supabaseAdmin,
        userId,
        profileParsed.profile
      );
    } catch (provisionErr) {
      console.error("company-member-signup provision error:", provisionErr);
      await supabaseAdmin.from("users").delete().eq("id", userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: "회사 정보 저장에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      userId,
      memberType: "company",
      companySignupChannel: COMPANY_SIGNUP_CHANNEL,
      orgId: provision.orgId,
      approvalStatus: provision.approvalStatus,
    });
  } catch (err) {
    console.error("company-member-signup route error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
