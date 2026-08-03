// src/middleware.ts
//
// /admin/* 및 /api/admin/* 경로를 보호한다.
//
// [2026-08-03 STEP 1 변경] 공용 접근 코드(vfbc_admin_session 고정 쿠키) 방식을
// 폐기하고, 개인별 Supabase Auth 로그인 세션으로 교체했다.
// 1) Supabase Auth 세션이 유효한가 (로그인한 사람이 누구인가)
// 2) 그 사람이 admin_users 테이블에 active=true로 등록된 관리자가 맞는가
// 두 가지를 모두 만족해야 통과한다. role/scope에 따른 화면·데이터 접근 제한은
// 이번 단계에서 적용하지 않는다(STEP 7 범위 — 다음 단계에서 구현 예정).
//
// [수정] PUBLIC_ADMIN_PATHS를 pathname.startsWith(p)로 비교하던 방식은
// "/admin/login-test", "/api/admin/login-anything" 같은 하위/유사 경로까지
// 공개 경로로 취급해버리는 문제가 있었다. 공개해야 하는 경로는 정확히
// "/admin/login", "/api/admin/login", "/api/admin/logout" 3개뿐이므로
// Set 기반 정확 일치(===) 비교로 변경했다 — 하위 경로는 더 이상 허용되지
// 않는다.
//
// [2026-08-03 비밀번호 재설정 기능 추가] 공개 경로에 "/admin/forgot-password",
// "/admin/auth/callback", "/admin/reset-password"(페이지)와
// "/api/admin/forgot-password", "/api/admin/reset-password"(API) 4개를
// 정확 일치로 추가했다(startsWith 사용 안 함, 하위 경로 허용 안 함).
//
// [2026-08-03 배포 확인 이슈 대응] 로컬 파일(PUBLIC_ADMIN_PATHS/
// PUBLIC_ADMIN_API_PATHS 문자열 리터럴)을 바이트 단위로 재확인한 결과,
// "/admin/forgot-password" 등 8개 경로 모두 정확히 포함되어 있고 숨은
// 공백·오탈자도 없음을 확인했다(이 코드 자체의 로직 문제는 아님). 그럼에도
// 실제 배포본에서 /admin/forgot-password가 로그인으로 리다이렉트되는
// 증상이 보고되어, 어떤 값 때문에 isPublicAdminPage가 false로 평가되는지
// Vercel Function Logs에서 실제로 확인할 수 있도록 아래에 진단 로그를
// 추가했다(추측이 아니라 실제 pathname/불리언 값을 로그로 직접 확인하기
// 위함 — 원인이 확인되면 제거해도 무방).

import { NextRequest, NextResponse } from "next/server";
import { createAdminMiddlewareClient } from "@/lib/adminAuth/middlewareClient";
import { verifyAdminUser } from "@/lib/adminAuth/verifyAdminUser";

const PUBLIC_ADMIN_PATHS = new Set([
  "/admin/login",
  "/admin/forgot-password",
  "/admin/auth/callback",
  "/admin/reset-password",
]);
const PUBLIC_ADMIN_API_PATHS = new Set([
  "/api/admin/login",
  "/api/admin/logout",
  "/api/admin/forgot-password",
  "/api/admin/reset-password",
]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublicAdminPage = PUBLIC_ADMIN_PATHS.has(pathname);
  const isPublicAdminApi = PUBLIC_ADMIN_API_PATHS.has(pathname);
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  // [진단 로그] Vercel Dashboard → 프로젝트 → Deployments → 해당 배포 →
  // Functions/Runtime Logs에서 "[admin-middleware]"로 검색하면 실제
  // 운영 환경에서 이 요청의 pathname과 각 판정값을 그대로 확인할 수 있다.
  console.log("[admin-middleware]", {
    pathname,
    isAdminPage,
    isAdminApi,
    isPublicAdminPage,
    isPublicAdminApi,
    publicAdminPaths: Array.from(PUBLIC_ADMIN_PATHS),
    publicAdminApiPaths: Array.from(PUBLIC_ADMIN_API_PATHS),
  });

  if (isPublicAdminPage || isPublicAdminApi) {
    return NextResponse.next();
  }

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  // Supabase Auth 세션 쿠키를 읽고, 만료 임박 시 자동 갱신한다.
  // getResponse()는 setAll() 호출 이후(토큰이 refresh된 경우) req.cookies까지
  // 반영해 다시 만들어진 응답이므로, 이 응답을 그대로 반환해야 refresh된
  // 세션이 같은 요청 안의 route.ts에도 전달된다.
  const { supabase, getResponse } = createAdminMiddlewareClient(req);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const denyAccess = () => {
    if (isAdminApi) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  };

  if (!user) {
    console.log("[admin-middleware] no user session", { pathname });
    return denyAccess();
  }

  const adminUser = await verifyAdminUser(user.id);
  if (!adminUser) {
    console.log("[admin-middleware] not an active admin", { pathname, authUserId: user.id });
    return denyAccess();
  }

  return getResponse();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
