// src/lib/adminAuth/serverComponentClient.ts
//
// 관리자 계정 관리(STEP 2) — 신규 파일.
//
// middleware.ts가 이미 /admin/* 전체를 "active 관리자인가"까지 확인해 보호하고
// 있지만, role(super_admin)까지는 middleware가 확인하지 않는다(middleware.ts
// 상단 주석: "role/scope에 따른 화면·데이터 접근 제한은 이번 단계에서 적용하지
// 않는다"). super_admin 전용 페이지(src/app/admin/users/page.tsx)는 Server
// Component이므로, 기존 src/lib/adminAuth/readOnlyClient.ts(NextRequest 기반,
// Route Handler 전용)를 그대로 쓸 수 없다 — Server Component에는 NextRequest가
// 없고 next/headers의 cookies()만 사용 가능하다.
//
// 이 파일은 readOnlyClient.ts와 완전히 동일한 원칙(쿠키를 갱신하지 않는 읽기
// 전용 — 세션 refresh는 이미 middleware가 이번 요청에서 수행했으므로 "누구인지"
// 재확인만 하면 충분함)을 Server Component 환경에 맞게 옮긴 것뿐이다.
// middlewareClient.ts/routeClient.ts/readOnlyClient.ts는 전혀 수정하지 않았다.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { verifyAdminUser } from "./verifyAdminUser";
import type { AdminUserRecord } from "./types";

/**
 * 현재 요청(Server Component 렌더링 시점)의 Supabase Auth 세션 소유자가
 * active 관리자인지 확인하고, 맞다면 admin_users 행을 반환한다.
 * 세션이 없거나 관리자가 아니면 null.
 */
export async function getCurrentAdminUser(): Promise<AdminUserRecord | null> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // 읽기 전용 — Server Component 렌더링 중에는 쿠키를 쓸 수 없고
          // (Next.js가 예외를 던짐), 세션 refresh는 이미 middleware가
          // 처리했으므로 여기서는 갱신할 필요도 없다.
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  return verifyAdminUser(user.id);
}
