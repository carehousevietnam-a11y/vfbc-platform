// src/lib/leadIntakeRules.ts
//
// 익명 접수 서버(/api/lead-intake)의 허용 규칙. 서버 검증에만 쓴다.
// 새 서비스를 추가하면 service_type / source_page 규칙에 맞는지 확인한다(LESSONS 16, 36).
// 근거: docs/master/SECURITY_RLS_AUDIT.md 3단계(익명 insert 서버 경유 + 속도 제한).

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 서비스 종류: verify_*, register_*, permit_company, check 4종, consultation
export const SERVICE_TYPE_RE =
  /^(verify_[a-z0-9-]{1,40}|register_[a-z0-9_-]{1,40}|permit_company|wp|trc|tamtru|driving-license|consultation)$/;

// 출처 페이지: /verify/x, /check/x, /register/x, /r, /consultation
export const SOURCE_PAGE_RE = /^\/((verify|check|register)\/[a-z0-9-]{1,40}|r|consultation)$/;

// CRM 기록: action은 소문자 스네이크, tag는 대문자 스네이크
export const CRM_ACTION_RE = /^[a-z][a-z0-9_]{2,60}$/;
export const CRM_TAG_RE = /^[A-Z][A-Z0-9_]{1,60}$/;

export const MAX_BODY_BYTES = 100_000;
export const MAX_META_BYTES = 60_000;

// 속도 제한(서버 인스턴스 단위 보조 제한. 주 제한은 Vercel 방화벽 규칙)
export const RATE_PER_IP_WINDOW_MS = 10 * 60_000;
export const RATE_PER_IP_MAX = 20;
export const RATE_PER_PHONE_WINDOW_MS = 60 * 60_000;
export const RATE_PER_PHONE_MAX = 10;
