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
