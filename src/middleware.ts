// src/middleware.ts
//
// /admin/* 및 /api/admin/* 경로를 접근 코드 로그인으로 보호한다.
// ⚠️ 로컬에 이미 middleware.ts가 있다면 이 파일로 통째로 덮어쓰지 말고,
//    기존 로직과 이 admin 보호 로직을 하나의 파일 안에 합쳐야 한다.

import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "vfbc_admin_session";
const PUBLIC_ADMIN_PATHS = ["/admin/login"];
const PUBLIC_ADMIN_API_PATHS = ["/api/admin/login", "/api/admin/logout"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublicAdminPage = PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p));
  const isPublicAdminApi = PUBLIC_ADMIN_API_PATHS.some((p) => pathname.startsWith(p));

  if (isPublicAdminPage || isPublicAdminApi) {
    return NextResponse.next();
  }

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (isAdminPage || isAdminApi) {
    const sessionCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const expected = process.env.ADMIN_SESSION_SECRET;

    if (!expected || sessionCookie !== expected) {
      if (isAdminApi) {
        return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
