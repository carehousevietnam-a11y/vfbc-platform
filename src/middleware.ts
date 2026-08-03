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
// ⚠️ 로컬에 이미 middleware.ts가 있다면 이 파일로 통째로 덮어쓰지 말고,
//    기존 로직과 이 admin 보호 로직을 하나의 파일 안에 합쳐야 한다.
// ⚠️ 고객용 라우트(/check, /verify, /register, /documents, /consultation,
//    /mypage 등)는 이 미들웨어의 matcher 범위(/admin/*, /api/admin/*) 밖이라
//    전혀 영향을 받지 않는다.

import { NextRequest, NextResponse } from "next/server";
import { createAdminMiddlewareClient } from "@/lib/adminAuth/middlewareClient";
import { verifyAdminUser } from "@/lib/adminAuth/verifyAdminUser";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login"]);
const PUBLIC_ADMIN_API_PATHS = new Set(["/api/admin/login", "/api/admin/logout"]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublicAdminPage = PUBLIC_ADMIN_PATHS.has(pathname);
  const isPublicAdminApi = PUBLIC_ADMIN_API_PATHS.has(pathname);

  if (isPublicAdminPage || isPublicAdminApi) {
    return NextResponse.next();
  }

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

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
    return denyAccess();
  }

  const adminUser = await verifyAdminUser(user.id);
  if (!adminUser) {
    return denyAccess();
  }

  return getResponse();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
