// src/app/api/admin/logout/route.ts
//
// [2026-08-03 STEP 1 변경] 고정 쿠키(vfbc_admin_session)를 만료시키던 방식에서
// Supabase Auth 세션을 실제로 종료(signOut)하는 방식으로 교체했다.

import { NextRequest, NextResponse } from "next/server";
import { createAdminRouteClient } from "@/lib/adminAuth/routeClient";

export async function POST(_req: NextRequest) {
  const supabase = await createAdminRouteClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
