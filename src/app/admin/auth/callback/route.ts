// src/app/admin/auth/callback/route.ts
//
// [2026-08-03 비밀번호 재설정 기능 추가] 신규 파일 — 관리자 전용 Supabase
// Auth PKCE 콜백. 프로젝트 전체를 조사했으나 이미 존재하는 auth callback
// route가 없어(고객 쪽도 별도 콜백 없이 src/app/api/set-password/route.ts의
// 자체 토큰 방식을 사용) 새로 만들었다. 고객용 콜백을 절대 재사용하지
// 않는다 — 애초에 존재하지 않는다.
//
// src/lib/adminAuth/routeClient.ts(기존 @supabase/ssr Route Handler
// 클라이언트)를 그대로 재사용해 exchangeCodeForSession()으로 세션 쿠키를
// 발급한다.
//
// [단순화] 이전 버전은 exchangeCodeForSession() 응답의 `redirectType`
// 필드(공식 타입에 선언되지 않은 내부 구현 세부사항)로 recovery 흐름
// 여부를 판별했다. 이는 Supabase가 공식적으로 보장하는 계약이 아니라
// 라이브러리 내부 구현에 의존하는 것이라 판단해 제거했다. Supabase 공식
// Password Recovery Flow(코드는 1회용 PKCE 코드이고, 발급된 세션의
// 소유자가 실제 활성 관리자인지만 확인)를 그대로 따른다:
//   1) exchangeCodeForSession(code) — 세션 발급
//   2) getUser() — 이 세션이 누구의 것인지 확인
//   3) verifyAdminUser(user.id) — active 관리자인지 확인
//   4) 관리자면 /admin/reset-password, 아니면 signOut() 후
//      /admin/login?error=reset_failed
//
// 이동 대상은 항상 이 파일 안에 고정된 내부 경로("/admin/reset-password",
// "/admin/login") 문자열뿐이며, 쿼리·요청 값으로 외부 URL을 만들지
// 않는다(외부 redirect 금지).

import { NextRequest, NextResponse } from "next/server";
import { createAdminRouteClient } from "@/lib/adminAuth/routeClient";
import { verifyAdminUser } from "@/lib/adminAuth/verifyAdminUser";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  const loginUrl = new URL("/admin/login", req.nextUrl.origin);
  loginUrl.searchParams.set("error", "reset_failed");

  const resetPasswordUrl = new URL("/admin/reset-password", req.nextUrl.origin);

  if (!code) {
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createAdminRouteClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error("admin auth callback exchangeCodeForSession error:", exchangeError);
    return NextResponse.redirect(loginUrl);
  }

  // 세션은 발급됐다 — 이 세션이 실제 활성 관리자의 것인지 확인한다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminUser = user ? await verifyAdminUser(user.id) : null;

  if (!adminUser) {
    // 관리자가 아니면(고객 계정 포함) 즉시 세션을 종료한다.
    await supabase.auth.signOut();
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(resetPasswordUrl);
}
