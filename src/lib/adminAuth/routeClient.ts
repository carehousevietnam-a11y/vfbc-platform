// src/lib/adminAuth/routeClient.ts
//
// 개인별 관리자 인증 STEP 1 — 신규 파일.
// Route Handler(src/app/api/admin/login, src/app/api/admin/logout) 전용
// Supabase Auth 클라이언트 팩토리. next/headers의 cookies()는 이 프로젝트의
// Next.js 버전(16.2.10, async dynamic APIs)에서 Promise를 반환하므로
// await로 받는다(admin/cases/page.tsx의 searchParams와 동일한 패턴).
//
// 로그인/로그아웃 route에서만 사용하고, 고객용 인증 흐름(src/lib/supabase.ts,
// /documents, /consultation 등)은 전혀 참조하거나 수정하지 않는다.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createAdminRouteClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}
