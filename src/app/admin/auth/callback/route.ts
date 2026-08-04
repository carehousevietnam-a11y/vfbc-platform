// src/app/admin/auth/callback/route.ts
//
// [2026-08-03 비밀번호 재설정 기능 추가] 관리자 전용 Supabase Auth 콜백.
// 고객용 콜백을 재사용하지 않는다 — 프로젝트 전체를 검색한 결과(2026-08-04
// 재확인) "/admin/auth/callback"을 참조하는 곳은
//   - src/middleware.ts (공개 경로 등록)
//   - src/app/api/admin/forgot-password/route.ts (이 URL로 링크 생성)
//   - src/app/api/admin/reset-password/route.ts / src/app/admin/reset-password/page.tsx (주석 설명뿐, 코드 의존 없음)
// 뿐이며, 이 callback을 다른 인증 흐름(고객 로그인, 매직링크, invite 등)과
// 공유하는 곳은 전혀 없다. 따라서 code 기반 분기를 남겨둘 필요 없이 이
// 흐름 전체를 token_hash 기반으로 교체했다(기존 기능을 깨뜨릴 다른
// 사용처가 없음을 검색으로 확인 완료).
//
// ⚠️ [2026-08-04 수정 — token_hash + verifyOtp() 방식으로 전환]
// 이전 버전은 exchangeCodeForSession(code)를 사용했다. 그러나 이 코드는
// Supabase Admin API인 generateLink()가 만든 링크와 호환되지 않는다
// (generateLink()는 PKCE를 지원하지 않음 — supabase/auth-js #767 등에서
// Supabase 팀이 공식 확인). generateLink()가 실제로 지원하는 서버 측 검증
// 방식은 token_hash + verifyOtp()이므로 이 방식으로 교체했다.
//
// 흐름:
//   1) 쿼리에서 token_hash, type을 읽는다.
//   2) token_hash가 없거나 type이 "recovery"가 아니면 즉시 거부.
//   3) createAdminRouteClient()(기존 @supabase/ssr Route Handler 클라이언트,
//      무수정 재사용)로 verifyOtp({ token_hash, type: "recovery" })를 호출해
//      세션을 발급한다.
//   4) 세션 발급 후 getUser() → verifyAdminUser(user.id)로 이 세션이 실제
//      활성 관리자의 것인지 재검증한다(기존 이중 검증 보안 유지).
//   5) 관리자면 /admin/reset-password, 아니면 signOut() 후
//      /admin/login?error=reset_failed.
//
// 이동 대상은 항상 이 파일 안에 고정된 내부 경로("/admin/reset-password",
// "/admin/login") 문자열뿐이며, 쿼리·요청 값으로 외부 URL을 만들지
// 않는다(외부 redirect 금지). 토큰 원문이나 상세 실패 사유는 리다이렉트
// URL에 절대 포함하지 않는다("error=reset_failed"라는 고정 코드만 사용).

import { NextRequest, NextResponse } from "next/server";
import { createAdminRouteClient } from "@/lib/adminAuth/routeClient";
import { verifyAdminUser } from "@/lib/adminAuth/verifyAdminUser";

export async function GET(req: NextRequest) {
  const tokenHash = req.nextUrl.searchParams.get("token_hash");
  const type = req.nextUrl.searchParams.get("type");

  const loginUrl = new URL("/admin/login", req.nextUrl.origin);
  loginUrl.searchParams.set("error", "reset_failed");

  const resetPasswordUrl = new URL("/admin/reset-password", req.nextUrl.origin);

  const supabase = await createAdminRouteClient();

  if (!tokenHash || type !== "recovery") {
    // 파라미터가 없거나 recovery 흐름이 아니면 세션을 만들 것도 없이 거부한다.
    await supabase.auth.signOut();
    return NextResponse.redirect(loginUrl);
  }

  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "recovery",
  });

  if (verifyError) {
    // 토큰을 로그에 남기지 않는다 — 실패 사유만 기록.
    console.error("admin auth callback verifyOtp error:", verifyError.message);
    await supabase.auth.signOut();
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
