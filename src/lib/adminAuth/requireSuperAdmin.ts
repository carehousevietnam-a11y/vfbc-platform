// src/lib/adminAuth/requireSuperAdmin.ts
//
// 관리자 계정 관리(STEP 2) — 신규 파일.
//
// src/app/api/admin/users/route.ts, src/app/api/admin/users/[id]/route.ts,
// src/app/api/admin/users/[id]/reset-password/route.ts 3개 API가 전부
// 동일하게 "요청자가 active super_admin인가"를 확인해야 해서 공통 헬퍼로
// 뺐다. 내부 로직은 src/app/api/admin/case-pdf/route.ts가 이미 쓰고 있는
// 기존 패턴(createAdminReadOnlyClient(req) + auth.getUser() +
// verifyAdminUser())을 그대로 재사용한 것뿐이고, 새로운 인증 방식을 만들지
// 않았다. middleware.ts는 이미 이 요청이 "active 관리자"임을 확인했으므로,
// 여기서는 role만 추가로 확인한다.

import { NextRequest, NextResponse } from "next/server";
import { createAdminReadOnlyClient } from "./readOnlyClient";
import { verifyAdminUser } from "./verifyAdminUser";
import type { AdminUserRecord } from "./types";

type RequireSuperAdminResult =
  | { ok: true; admin: AdminUserRecord }
  | { ok: false; response: NextResponse };

export async function requireSuperAdmin(
  req: NextRequest
): Promise<RequireSuperAdminResult> {
  const supabase = createAdminReadOnlyClient(req);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = user ? await verifyAdminUser(user.id) : null;

  if (!admin) {
    // middleware가 이미 걸러야 정상이지만, 이 API 자체적으로도 한 번 더
    // 방어한다(case-pdf/route.ts와 동일한 이중 방어 관례).
    return {
      ok: false,
      response: NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 }),
    };
  }

  if (admin.role !== "super_admin") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "이 작업은 Super Admin만 수행할 수 있습니다." },
        { status: 403 }
      ),
    };
  }

  return { ok: true, admin };
}
