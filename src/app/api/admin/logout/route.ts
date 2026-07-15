// src/app/api/admin/logout/route.ts

import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "vfbc_admin_session";

export async function POST(_req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
