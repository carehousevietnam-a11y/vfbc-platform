import type { ResultTone } from "@/lib/checkDiagnosis";

export type RegisterStatus = "confirmed" | "unconfirmed" | null;
export type RegisterKeyStatus = "secured" | "unsecured" | null;

/**
 * 직접 인허가 받기 7종(식당·위생·소방·화장품·환경·의료기기·프랜차이즈)의 기존 화면 판정과 같은 규칙.
 * src/app/register/<업종>/page.tsx 의 compute...Diagnosis: 등록 확정 + 핵심 항목 확보면 가능, 아니면 조건부.
 * 화면 파일의 판정 줄이 바뀌면 tests/qa/<업종>-content-final.mjs 가 실패한다.
 */
export function registerRuleTone(registration: RegisterStatus, key: RegisterKeyStatus): ResultTone | null {
  if (!registration || !key) return null;
  return registration === "confirmed" && key === "secured" ? "possible" : "conditional";
}
