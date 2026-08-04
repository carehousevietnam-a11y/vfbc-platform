// src/app/api/admin/users/[id]/route.ts
//
// 관리자 계정 관리(STEP 2) — 신규 파일.
//
// PATCH: 관리자의 role 또는 active 상태 변경 (super_admin 전용).
// 삭제(Auth 삭제 포함)는 이번 단계에서 구현하지 않는다.
//
// 보호 규칙(전부 서버에서 강제, 클라이언트 상태만 믿지 않음):
// - 본인 계정의 active를 false로 바꿀 수 없다(자기 자신 비활성화 금지).
// - "마지막으로 남은 active super_admin"은 active=false로도, 다른 role로도
//   바꿀 수 없다(관리자 계정 관리 기능 자체가 잠기는 것을 방지).
// - role은 화이트리스트(ADMIN_ROLES)만 허용한다.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireSuperAdmin } from "@/lib/adminAuth/requireSuperAdmin";
import { ADMIN_ROLES, type AdminRole } from "@/lib/adminAuth/types";

async function countActiveSuperAdmins(excludingId?: string): Promise<number> {
  let query = supabaseAdmin
    .from("admin_users")
    .select("id", { count: "exact", head: true })
    .eq("role", "super_admin")
    .eq("active", true);

  if (excludingId) {
    query = query.neq("id", excludingId);
  }

  const { count, error } = await query;
  if (error) {
    console.error("countActiveSuperAdmins error:", error);
    // 안전한 쪽으로 판단 — 조회 실패 시 "마지막 1명"으로 간주해 보호 규칙을
    // 우회하지 못하게 한다.
    return 0;
  }
  return count ?? 0;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return auth.response;

  const { id: targetId } = await params;

  const body = await req.json().catch(() => null);
  const hasActive = typeof body?.active === "boolean";
  const hasRole = typeof body?.role === "string";

  if (!hasActive && !hasRole) {
    return NextResponse.json(
      { error: "변경할 값(active 또는 role)이 없습니다." },
      { status: 400 }
    );
  }

  if (hasRole && !ADMIN_ROLES.includes(body.role as AdminRole)) {
    return NextResponse.json({ error: "올바르지 않은 역할입니다." }, { status: 400 });
  }

  const { data: target, error: targetError } = await supabaseAdmin
    .from("admin_users")
    .select("id, role, active")
    .eq("id", targetId)
    .maybeSingle();

  if (targetError) {
    console.error("admin users PATCH target lookup error:", targetError);
    return NextResponse.json({ error: "관리자 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
  if (!target) {
    return NextResponse.json({ error: "관리자를 찾을 수 없습니다." }, { status: 404 });
  }

  const isSelf = target.id === auth.admin.id;

  // 자기 자신 비활성화 금지
  if (isSelf && hasActive && body.active === false) {
    return NextResponse.json(
      { error: "본인 계정은 비활성화할 수 없습니다." },
      { status: 400 }
    );
  }

  const targetIsActiveSuperAdmin = target.role === "super_admin" && target.active === true;

  if (targetIsActiveSuperAdmin) {
    const willBeDeactivated = hasActive && body.active === false;
    const willChangeRole = hasRole && body.role !== "super_admin";

    if (willBeDeactivated || willChangeRole) {
      const otherActiveSuperAdmins = await countActiveSuperAdmins(target.id);
      if (otherActiveSuperAdmins === 0) {
        return NextResponse.json(
          { error: "마지막 남은 Super Admin의 권한/활성 상태는 변경할 수 없습니다." },
          { status: 400 }
        );
      }
    }
  }

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (hasActive) updatePayload.active = body.active;
  if (hasRole) updatePayload.role = body.role;

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("admin_users")
    .update(updatePayload)
    .eq("id", targetId)
    .select("id, auth_user_id, name, email, role, active, created_at, updated_at")
    .single();

  if (updateError || !updated) {
    console.error("admin users PATCH update error:", updateError);
    return NextResponse.json({ error: "관리자 정보 수정 중 오류가 발생했습니다." }, { status: 500 });
  }

  return NextResponse.json({ admin: updated }, { status: 200 });
}
