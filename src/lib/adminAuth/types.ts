// src/lib/adminAuth/types.ts
//
// 개인별 관리자 인증(Authentication) 기반 STEP 1 — 공용 타입/상수.
// 이 파일은 어디에서도 아직 존재하지 않던 신규 파일이며, 고객 시스템
// (CHECK/VERIFY/REGISTER/CRM/Storage/Executive PDF/AI Report/Business Logic/
// OpenAI/Routing/Customer Session/Customer Login)과는 전혀 무관하다.

/**
 * admin_users.role에 저장되는 문자열 값.
 * STEP 5 지시대로 이번 단계에서는 role 문자열만 저장하고,
 * 실제 권한 분기(무엇을 볼 수 있는지)는 다음 단계에서 구현한다.
 */
export const ADMIN_ROLES = [
  "super_admin",
  "team_manager",
  "staff",
  "reviewer",
  "document_reviewer",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

/**
 * admin_user_scopes.category에 저장되는 값.
 * 실제 leads.service_type 값들을 상위 대분류로 묶은 것으로,
 * src/app/admin/cases/page.tsx의 getCategory() 매핑과 동일한 4분류를 사용한다.
 */
export const ADMIN_SCOPE_CATEGORIES = [
  "CHECK",
  "VERIFY",
  "REGISTER",
  "CONSULTATION",
] as const;

export type AdminScopeCategory = (typeof ADMIN_SCOPE_CATEGORIES)[number];

/**
 * 참고용: 현재 프로젝트에 실제 존재하는 leads.service_type 값 전체
 * (2026-08-03 기준, src/app/check|verify|register/**\/page.tsx 및
 * src/app/consultation/page.tsx, src/app/r/page.tsx에서 실제 insert되는 값만
 * 수록 — 추측 금지 원칙에 따라 존재하지 않는 값은 추가하지 않았다).
 * admin_user_scopes.service_type 컬럼에 들어갈 수 있는 값의 참고 목록이며,
 * DB에 CHECK 제약으로 강제하지는 않는다(신규 서비스 추가 시마다 마이그레이션이
 * 필요해지는 것을 피하기 위함 — 실제 검증은 애플리케이션 레벨에서 다음 단계에
 * 구현).
 */
export const KNOWN_SERVICE_TYPES = [
  // CHECK
  "wp",
  "trc",
  "tamtru",
  "driving-license",
  // VERIFY
  "verify_admin",
  "verify_fraud",
  "verify_tax",
  "verify_real-estate",
  "verify_unclear",
  // REGISTER
  "permit_company",
  "register_restaurant",
  "register_cosmetics",
  "register_franchise",
  "register_environment",
  "register_fire_safety",
  "register_hygiene",
  "register_medical_device",
  // CONSULTATION
  "consultation",
] as const;

export type KnownServiceType = (typeof KNOWN_SERVICE_TYPES)[number];

/** admin_users 테이블 행 (필요한 필드만) */
export interface AdminUserRecord {
  id: string;
  auth_user_id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
}
