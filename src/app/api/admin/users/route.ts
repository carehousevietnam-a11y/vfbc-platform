// src/app/api/admin/users/route.ts
//
// 관리자 계정 관리(STEP 2) — 신규 파일.
//
// POST: 신규 관리자 계정 생성 (super_admin 전용).
//
// 흐름:
// 1) requireSuperAdmin()으로 요청자가 active super_admin인지 확인
// 2) 입력값 검증(name/email/role), role은 화이트리스트(ADMIN_ROLES)만 허용
// 3) admin_users에 동일 이메일이 이미 있는지 확인(중복 생성 금지)
// 4) supabaseAdmin.auth.admin.createUser()로 Auth 유저 생성
//    — 비밀번호는 지정하지 않는다(초기 비밀번호 생성 금지 원칙).
//    이 유저는 비밀번호가 없어 로그인이 불가능한 상태로 생성되고,
//    아래 5)의 recovery 메일을 통해 본인이 직접 첫 비밀번호를 설정한다.
// 5) admin_users에 INSERT. 실패하면 4)에서 만든 Auth 유저를 즉시 삭제해
//    Auth에는 있지만 admin_users에는 없는 불일치 상태가 남지 않도록 한다.
// 6) 이미 완성되어 있는 관리자 비밀번호 재설정 흐름(generateLink({type:
//    "recovery"}) → hashed_token → /admin/auth/callback → verifyOtp() →
//    Resend)을 그대로 재사용해 "비밀번호 설정 안내" 메일을 보낸다.
//    src/app/api/admin/forgot-password/route.ts와 동일한 로직이며, 그
//    파일 자체는 전혀 수정하지 않았다(로직만 동일하게 재사용).
//    메일 발송 실패는 계정 생성 자체를 되돌리지 않는다(관리자는 이후
//    로그인 화면의 "비밀번호를 잊으셨나요?"로 언제든 재시도 가능).
//
// 이 파일은 admin_user_scopes를 조회/생성하지 않는다(STEP 2 범위 밖,
// STEP 3에서 구현 예정).

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireSuperAdmin } from "@/lib/adminAuth/requireSuperAdmin";
import { sendAdminPasswordResetEmail } from "@/lib/adminAuth/adminPasswordResetEmail";
import { ADMIN_ROLES, type AdminRole } from "@/lib/adminAuth/types";

function isValidEmail(value: string): boolean {
  // 과도하게 엄격한 정규식은 실제 유효한 이메일을 거부할 수 있어,
  // 프로젝트 다른 곳(리드폼 등)과 동일하게 단순한 형태만 확인한다.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeForIlikeExactMatch(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export async function POST(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const rawName = typeof body?.name === "string" ? body.name.trim() : "";
  const rawEmail = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const rawRole = typeof body?.role === "string" ? body.role : "";

  if (!rawName) {
    return NextResponse.json({ error: "이름을 입력해주세요." }, { status: 400 });
  }
  if (!rawEmail || !isValidEmail(rawEmail)) {
    return NextResponse.json({ error: "올바른 이메일을 입력해주세요." }, { status: 400 });
  }
  if (!ADMIN_ROLES.includes(rawRole as AdminRole)) {
    return NextResponse.json({ error: "올바르지 않은 역할입니다." }, { status: 400 });
  }
  const role = rawRole as AdminRole;

  // 3) 중복 이메일 확인 (findActiveAdminByEmail은 active=true만 걸러내므로,
  // 여기서는 active 여부와 무관하게 "이미 존재하는지"를 봐야 해 직접 조회한다)
  const { data: existing, error: existingError } = await supabaseAdmin
    .from("admin_users")
    .select("id")
    .ilike("email", escapeForIlikeExactMatch(rawEmail))
    .maybeSingle();

  if (existingError) {
    console.error("admin users POST existing check error:", existingError);
    return NextResponse.json({ error: "관리자 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
  if (existing) {
    return NextResponse.json({ error: "이미 등록된 관리자 이메일입니다." }, { status: 409 });
  }

  // 4) Auth 유저 생성 (비밀번호 미지정)
  const { data: createdAuthUser, error: createAuthError } =
    await supabaseAdmin.auth.admin.createUser({
      email: rawEmail,
      email_confirm: true,
    });

  if (createAuthError || !createdAuthUser?.user) {
    console.error("admin users POST createUser error:", createAuthError);

    // admin_users에는 없지만(위 3번 확인 통과) Supabase Auth에는 이미 같은
    // 이메일의 계정이 존재하는 경우(예: 과거 admin_users 행만 별도로 삭제된
    // 흔적, 또는 고객 계정과 이메일이 겹치는 경우)를 명확한 중복 오류로
    // 구분해 반환한다. Supabase 원문 에러 메시지는 노출하지 않는다.
    const isDuplicateEmail =
      (createAuthError as { code?: string } | null)?.code === "email_exists" ||
      /already.*registered|already.*exists/i.test(createAuthError?.message ?? "");

    if (isDuplicateEmail) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "인증 계정 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  const authUserId = createdAuthUser.user.id;

  // 5) admin_users INSERT — 실패 시 Auth 유저 롤백
  const nowIso = new Date().toISOString();
  const { data: insertedAdmin, error: insertError } = await supabaseAdmin
    .from("admin_users")
    .insert({
      auth_user_id: authUserId,
      name: rawName,
      email: rawEmail,
      role,
      active: true,
      created_at: nowIso,
      updated_at: nowIso,
    })
    .select("id, auth_user_id, name, email, role, active, created_at, updated_at")
    .single();

  if (insertError || !insertedAdmin) {
    console.error("admin users POST insert error:", insertError);

    const { error: rollbackError } = await supabaseAdmin.auth.admin.deleteUser(authUserId);
    if (rollbackError) {
      // 롤백 자체가 실패하면 Auth에는 있지만 admin_users에는 없는 상태가
      // 남을 수 있으므로, 반드시 로그로 남겨 수동 확인이 가능하게 한다.
      console.error(
        "admin users POST rollback FAILED — orphaned auth user:",
        authUserId,
        rollbackError
      );
    }

    return NextResponse.json(
      { error: "관리자 계정 생성 중 오류가 발생해 되돌렸습니다." },
      { status: 500 }
    );
  }

  // 6) 비밀번호 설정 안내 메일 — forgot-password/route.ts와 동일한 로직 재사용.
  try {
    const { data: linkData, error: generateLinkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: rawEmail,
        options: {
          redirectTo: `${req.nextUrl.origin}/admin/reset-password`,
        },
      });

    const hashedToken = linkData?.properties?.hashed_token;

    if (generateLinkError || !hashedToken) {
      console.error("admin users POST generateLink error:", generateLinkError);
    } else {
      const resetUrl = `${req.nextUrl.origin}/admin/auth/callback?token_hash=${encodeURIComponent(
        hashedToken
      )}&type=recovery`;

      const sendResult = await sendAdminPasswordResetEmail({ email: rawEmail, resetUrl });
      if (!sendResult.success) {
        console.error("admin users POST sendAdminPasswordResetEmail error:", sendResult.error);
      }
    }
  } catch (err) {
    // 메일 발송 실패는 계정 생성 자체를 되돌리지 않는다.
    console.error("admin users POST password-setup email exception:", err);
  }

  return NextResponse.json({ admin: insertedAdmin }, { status: 201 });
}
