// src/app/admin/users/roleLabels.ts
//
// 관리자 계정 관리(STEP 2) — 신규 파일.
// src/lib/adminAuth/types.ts의 ADMIN_ROLES(기존 화이트리스트)를 그대로
// 재노출하고, 화면 표시용 한글 라벨만 이 페이지 범위에서 추가한다.
// 새로운 role 값을 만들지 않는다.

export { ADMIN_ROLES, type AdminRole } from "@/lib/adminAuth/types";
import type { AdminRole } from "@/lib/adminAuth/types";

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  team_manager: "팀 매니저",
  staff: "스태프",
  reviewer: "검토자",
  document_reviewer: "문서 검토자",
};
