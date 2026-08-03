// src/app/api/admin/reset-password/route.ts
//
// [2026-08-03 비밀번호 재설정 기능 추가] 신규 파일.
// /admin/auth/callback이 exchangeCodeForSession()으로 발급한 세션 쿠키를
// 그대로 이어받아(같은 브라우저 쿠키를 src/lib/adminAuth/routeClient.ts로
// 읽음) Supabase Auth updateUser({ password })를 호출한다.
//
// [단순화] 이전 버전은 JWT의 amr(Authentication Method Reference) claim에
// 'recovery'가 포함되어 있는지로 Recovery Session 여부를 재확인했다.
// 그러나 Supabase는 PKCE 기반 Recovery 흐름에 대해 세션의 amr claim에
// 'recovery'를 채워주는 것을 공식적으로 보장하지 않는다(현재 Supabase
// Auth의 알려진 한계 — 정상적인 관리자 recovery 세션도 이 검사 때문에
// 401로 거부될 수 있었다). 존재가 보장되지 않는 신호로 Recovery 여부를
// 추측하는 대신, Supabase 공식 Password Recovery Flow가 실제로 보장하는
// 것만 사용한다:
//   - Recovery 링크는 1회용 PKCE 코드이고, 이미 /admin/auth/callback이
//     exchangeCodeForSession()으로 이 코드를 소비해 세션을 발급했다.
//   - 이 route는 그 세션의 소유자가 실제 활성 관리자인지만 다시 확인한다.
//
// 순서: 1) getUser() → 2) verifyAdminUser() → 3) 관리자가 아니면
// signOut() + 401 → 4) 관리자면 updateUser({ password }) → 5) signOut().

import { NextRequest, NextResponse } from "next/server";
import { createAdminRouteClient } from "@/lib/adminAuth/routeClient";
import { verifyAdminUser } from "@/lib/adminAuth/verifyAdminUser";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";
  const passwordConfirm =
    typeof body?.passwordConfirm === "string" ? body.passwordConfirm : "";

  if (!password || !passwordConfirm) {
    return NextResponse.json(
      { error: "새 비밀번호를 모두 입력해주세요." },
      { status: 400 }
    );
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: "비밀번호는 최소 8자 이상이어야 합니다." },
      { status: 400 }
    );
  }

  if (password !== passwordConfirm) {
    return NextResponse.json(
      { error: "입력한 두 비밀번호가 일치하지 않습니다." },
      { status: 400 }
    );
  }

  const supabase = await createAdminRouteClient();

  // 1)~2) 현재 세션이 실제 active 관리자의 것인지 확인한다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminUser = user ? await verifyAdminUser(user.id) : null;

  if (!adminUser) {
    // 3) 관리자가 아니면(세션 없음 포함) 세션을 즉시 종료하고 거부한다.
    await supabase.auth.signOut();
    return NextResponse.json(
      { error: "비밀번호 변경 권한이 없습니다." },
      { status: 401 }
    );
  }

  // 4) 관리자로 확인된 경우에만 실제 비밀번호를 변경한다.
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error("admin reset-password updateUser error:", error);
    return NextResponse.json(
      { error: "비밀번호 변경에 실패했습니다. 재설정 링크가 만료되었을 수 있습니다." },
      { status: 400 }
    );
  }

  // 5) 새 비밀번호 설정 이후에는 이 임시 세션을 유지할 이유가 없다 —
  // 다시 /admin/login에서 새 비밀번호로 정식 로그인하도록 종료한다.
  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
