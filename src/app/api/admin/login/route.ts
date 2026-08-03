// src/app/api/admin/login/route.ts
//
// [2026-08-03 STEP 1] 공용 접근 코드(ADMIN_ACCESS_CODE) 비교 방식을
// 폐기하고, Supabase Auth 개인 이메일/비밀번호 로그인으로 교체했다.
// 로그인에 성공해도 admin_users에 active=true로 등록되어 있지 않으면
// 즉시 세션을 종료시키고 거부한다(고객 계정으로는 관리자 화면에 들어올 수
// 없어야 하므로 — 고객도 동일한 Supabase Auth(auth.users)를 사용하기 때문에
// 이 검증이 없으면 어떤 로그인한 고객이든 /admin에 들어올 수 있게 된다).
//
// [수정] "이메일 또는 비밀번호가 올바르지 않습니다"와 "관리자 계정이
// 아닙니다"를 서로 다른 메시지/상태코드로 반환하면, 공격자가 응답 차이로
// "이 이메일이 Auth 계정으로는 존재하지만 관리자 등록은 안 되어 있다"는
// 사실을 추론할 수 있다(계정 존재 여부 노출). 두 실패 케이스를 동일한
// 메시지·동일한 상태코드(401)로 통일했다.

import { NextRequest, NextResponse } from "next/server";
import { createAdminRouteClient } from "@/lib/adminAuth/routeClient";
import { verifyAdminUser } from "@/lib/adminAuth/verifyAdminUser";

const LOGIN_FAILURE_RESPONSE = { error: "로그인 정보를 확인해주세요." } as const;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "이메일과 비밀번호를 입력해주세요." },
      { status: 400 }
    );
  }

  const supabase = await createAdminRouteClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return NextResponse.json(LOGIN_FAILURE_RESPONSE, { status: 401 });
  }

  const adminUser = await verifyAdminUser(data.user.id);
  if (!adminUser) {
    // 관리자 계정이 아니면 방금 생성된 세션을 즉시 종료한다.
    // 실패 메시지는 위의 비밀번호 오류 케이스와 동일하게 유지한다.
    await supabase.auth.signOut();
    return NextResponse.json(LOGIN_FAILURE_RESPONSE, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
