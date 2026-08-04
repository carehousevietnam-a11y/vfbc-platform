// src/lib/adminAuth/verifyAdminUser.ts
//
// 개인별 관리자 인증 STEP 1 — 신규 파일.
// "이 Supabase Auth 유저가 실제로 활성 상태의 관리자(admin_users.active=true)가
// 맞는가"만 확인하는 순수 DB 조회 함수. middleware.ts / admin login route /
// case-pdf route(예외적으로 자체 인증 확인을 하던 파일)에서 공통으로 재사용해
// 동일한 로직이 여러 곳에 중복 구현되는 것을 막는다.
//
// service role key(supabaseAdmin)를 사용하므로 admin_users의 RLS 정책과
// 무관하게 항상 정확한 결과를 반환한다 — 이번 단계에서는 RLS 정책이 아직
// 세밀하게 세팅되지 않았을 수 있어, 인증 게이트만큼은 RLS에 의존하지 않는다.
//
// 이 파일은 role/scope 기반 "권한 분기"를 하지 않는다(STEP 7 범위 밖).
// 오직 "관리자 계정으로 등록되어 있고 active한가"만 판단한다.

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { AdminUserRecord } from "./types";

/**
 * Supabase Auth의 auth_user_id를 기준으로 admin_users 행을 조회한다.
 * 조회 실패, 행 없음, active=false인 경우 전부 null을 반환한다.
 * (이유를 구분해서 노출하지 않는 것은 기존 관리자 로그인 route의
 * "접근 코드가 올바르지 않습니다" 방식과 동일한 보안 관례를 따른 것 —
 * 계정 존재 여부를 외부에 노출하지 않기 위함)
 */
export async function verifyAdminUser(
  authUserId: string
): Promise<AdminUserRecord | null> {
  if (!authUserId) return null;

  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .select("id, auth_user_id, name, email, role, active")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) {
    console.error("verifyAdminUser lookup error:", error);
    return null;
  }
  if (!data || data.active !== true) {
    return null;
  }

  return data as AdminUserRecord;
}

/**
 * [2026-08-03 비밀번호 재설정 기능 추가] 이메일 기준으로 active 관리자
 * 계정을 조회한다. src/app/api/admin/forgot-password/route.ts에서만
 * 사용 — "이 이메일로 실제 비밀번호 재설정 메일을 보낼지"를 내부적으로
 * 판단하는 용도일 뿐, 조회 결과(존재/비존재)는 절대 응답에 노출하지
 * 않는다(모든 경우에 동일한 안내 메시지만 반환).
 *
 * [수정] 대소문자 구분 비교(.eq("email", email))를 사용하면, 가입 시
 * 저장된 admin_users.email의 대소문자와 입력값의 대소문자가 한 글자라도
 * 다를 때 조회에 실패해 재설정 메일이 발송되지 않는 문제가 있었다.
 * "lower(email) = lower(input)"과 동일한 의미로 대소문자를 구분하지 않고
 * 비교하도록 변경했다. Supabase(PostgREST) JS 클라이언트는 별도의
 * "대소문자 무시 완전일치" 연산자를 제공하지 않아 ilike를 사용하는데,
 * ilike는 '%'와 '_'를 와일드카드로 해석하므로(예: 이메일에 '_'가 포함된
 * 경우 의도치 않게 다른 문자와 매칭될 수 있음) 입력값에서 이 두 문자를
 * 먼저 이스케이프해 "완전일치 + 대소문자 무시"만 되도록 만들었다.
 */
function escapeForIlikeExactMatch(value: string): string {
  // '%'와 '_'는 SQL LIKE/ILIKE의 와일드카드이므로, 이메일에 포함되어
  // 있어도 문자 그대로 취급되도록 백슬래시로 이스케이프한다.
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export async function findActiveAdminByEmail(
  email: string
): Promise<AdminUserRecord | null> {
  if (!email) return null;

  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .select("id, auth_user_id, name, email, role, active")
    .ilike("email", escapeForIlikeExactMatch(email))
    .maybeSingle();

  if (error) {
    console.error("findActiveAdminByEmail lookup error:", error);
    return null;
  }
  if (!data || data.active !== true) {
    return null;
  }

  return data as AdminUserRecord;
}
