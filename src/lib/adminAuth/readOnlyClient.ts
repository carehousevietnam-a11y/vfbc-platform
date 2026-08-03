// src/lib/adminAuth/readOnlyClient.ts
//
// 개인별 관리자 인증 STEP 1 — 신규 파일.
// middleware.ts가 이미 /api/admin/* 전체를 세션으로 보호하고 있지만,
// src/app/api/admin/case-pdf/route.ts처럼 "middleware만 믿지 않고 파일
// 자체적으로 한 번 더 확인"하던 기존 방어 패턴을 유지하기 위한 읽기 전용
// 클라이언트. 쿠키를 갱신하지 않는다(세션 갱신은 middleware가 이미 이번
// 요청에서 수행했으므로 여기서는 "누구인지"만 다시 확인하면 충분하다).

import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";

export function createAdminReadOnlyClient(req: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll() {
          // 읽기 전용 — 이 요청에서는 쿠키를 갱신하지 않는다.
        },
      },
    }
  );
}
