// src/app/api/admin/login/route.ts

import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "vfbc_admin_session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const code = body?.code as string | undefined;

  if (!code || code !== process.env.ADMIN_ACCESS_CODE) {
    return NextResponse.json(
      { error: "접근 코드가 올바르지 않습니다." },
      { status: 401 }
    );
  }

  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  if (!sessionSecret) {
    console.error("ADMIN_SESSION_SECRET 환경변수가 설정되지 않았습니다.");
    return NextResponse.json(
      { error: "서버 설정 오류입니다. 관리자에게 문의하세요." },
      { status: 500 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, sessionSecret, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7일
    path: "/",
  });
  return res;
}
