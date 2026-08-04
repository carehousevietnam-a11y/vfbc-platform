// src/app/api/admin/forgot-password/route.ts
//
// [2026-08-03 비밀번호 재설정 기능 추가] 신규 파일.
// 관리자 이메일을 받아 Supabase Auth resetPasswordForEmail()로 재설정
// 메일 발송을 트리거한다. src/lib/adminAuth/routeClient.ts(기존
// @supabase/ssr Route Handler 클라이언트)를 그대로 재사용한다.
//
// [복구] 이 파일에 실수로 src/app/api/admin/reset-password/route.ts의
// 코드(password/passwordConfirm 검증, getUser/verifyAdminUser로 현재
// 세션 확인, updateUser({password}), signOut)가 그대로 들어가 있었다.
// forgot-password route는 "이메일을 받아 재설정 메일을 발송"만 담당하고,
// "새 비밀번호로 실제 변경"은 reset-password route의 역할이다 — 두 파일의
// 책임이 섞이지 않도록 이 파일에서 password 관련 로직을 전부 제거하고
// resetPasswordForEmail() 흐름만 남겼다.
// src/app/api/admin/reset-password/route.ts는 이 작업에서 전혀 건드리지
// 않았다.
//
// 보안 원칙: 이메일이 실제 관리자 계정인지 아닌지와 무관하게 항상 동일한
// 메시지만 반환한다. 내부적으로는 admin_users에 존재하는 active 관리자
// 이메일일 때만 실제로 resetPasswordForEmail을 호출해, 고객 계정 등
// 관리자가 아닌 Supabase Auth 계정에 "관리자용" 재설정 메일이 발송되는
// 것을 막는다 — 이 판단 결과와 발송 성공/실패 여부는 응답에 절대
// 노출하지 않는다.

import { NextRequest, NextResponse } from "next/server";
import { createAdminRouteClient } from "@/lib/adminAuth/routeClient";
import { findActiveAdminByEmail } from "@/lib/adminAuth/verifyAdminUser";

const GENERIC_MESSAGE = {
  message: "입력한 이메일이 등록되어 있다면 비밀번호 재설정 안내를 보내드렸습니다.",
} as const;

export async function POST(req: NextRequest) {
  // 1) email 읽기
  const body = await req.json().catch(() => null);
  const rawEmail = typeof body?.email === "string" ? body.email : "";

  // 2) trim + lowercase 정규화
  const email = rawEmail.trim().toLowerCase();

  if (!email) {
    return NextResponse.json(
      { error: "이메일을 입력해주세요." },
      { status: 400 }
    );
  }

  try {
    // 3) active 관리자 계정인지 확인
    const adminUser = await findActiveAdminByEmail(email);

    // 4) active 관리자인 경우에만 재설정 메일 발송을 트리거한다.
    if (adminUser) {
      const supabase = await createAdminRouteClient();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${req.nextUrl.origin}/admin/auth/callback`,
      });

      if (error) {
        // 발송 실패도 계정 존재 여부를 드러낼 수 있으므로 로그로만 남기고
        // 응답은 그대로 동일한 안내 메시지를 유지한다.
        console.error("admin forgot-password resetPasswordForEmail error:", error);
      }
    }
  } catch (err) {
    console.error("admin forgot-password route error:", err);
  }

  // 5)~6) 관리자 존재 여부·발송 성공/실패와 무관하게 항상 동일한 메시지·200.
  return NextResponse.json(GENERIC_MESSAGE, { status: 200 });
}
