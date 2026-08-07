// src/lib/caseKnowledge/piiRedaction.ts
//
// STEP21 — 사례 지식(case_knowledge) 생성 시에만 적용하는 PII 제거 유틸.
// case_conversations(원문 로그)나 crm_activities에는 적용하지 않는다 —
// 그 두 곳은 기존 CRM과 동일한 민감도로 이미 service-role 전용으로만
// 접근 가능하고, 지시서 요구사항("Knowledge 생성 시" PII 제거)이 정확히
// 이 경계를 가리킨다.
//
// [STEP21-1] 2단계 → "정규식 + 후처리" 2단계로 명시적으로 재구성:
//   1) 자동 단계 — 정확 치환(이 사건의 실제 이름/연락처 등) + 정규식
//      패턴(이메일/전화/여권/외국인등록번호/사업자번호/계좌번호/차량번호
//      로 보이는 문자열).
//   2) 후처리 단계 — 사람이 하는 검토. src/app/api/admin/case-knowledge/
//      [id]/review/route.ts(STEP21-1 신규)에서 관리자가 question/ai_answer/
//      expert_review/final_result를 직접 다시 편집할 수 있다. 회사명처럼
//      정규식으로 안정적으로 잡을 수 없는 정보는 이 인간 검토 단계가
//      실질적인 최종 방어선이다 — is_published는 이 검토(needs_manual_review
//      해제)가 끝나기 전까지 true로 바뀌지 않는다(generator.ts, review
//      route에서 강제).
//
// ⚠️ 자동 단계만으로는 100% 완벽한 익명화를 보장하지 않는다(예: 회사명,
// 문장 속에 자연스럽게 섞인 별칭 등은 놓칠 수 있음). 그래서 모든
// case_knowledge 행은 기본적으로 needs_manual_review=true, is_published=false로
// 생성된다.

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type KnownPii = {
  name: string[];
  phone: string[];
  email: string[];
  address: string[];
  kakaoId: string[];
  zaloId: string[];
};

const REDACTION_VERSION = "v2"; // STEP21-1에서 패턴 세트가 바뀌어 버전 올림

function pushIfPresent(target: string[], value: unknown) {
  if (typeof value === "string" && value.trim().length >= 2) {
    target.push(value.trim());
  }
}

// leads(자체 name/email/kakao_id/zalo_id) + users(name/phone/email/address)
// 양쪽 다 조회한다 — 프로젝트 전체에 두 테이블에 이름/연락처가 나뉘어
// 저장되는 기존 구조(STEP20 조사에서 확인됨)를 그대로 반영한 것이다.
export async function fetchKnownPii(leadId: string): Promise<KnownPii> {
  const known: KnownPii = { name: [], phone: [], email: [], address: [], kakaoId: [], zaloId: [] };

  const { data: lead } = await supabaseAdmin
    .from("leads")
    .select("name, email, kakao_id, zalo_id, user_id")
    .eq("id", leadId)
    .maybeSingle();

  pushIfPresent(known.name, lead?.name);
  pushIfPresent(known.email, lead?.email);
  pushIfPresent(known.kakaoId, lead?.kakao_id);
  pushIfPresent(known.zaloId, lead?.zalo_id);

  if (lead?.user_id) {
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("name, phone, email, address")
      .eq("id", lead.user_id)
      .maybeSingle();

    pushIfPresent(known.name, user?.name);
    pushIfPresent(known.phone, user?.phone);
    pushIfPresent(known.email, user?.email);
    pushIfPresent(known.address, user?.address);
  }

  return known;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceAllCaseInsensitive(text: string, needle: string, tag: string): string {
  if (!needle) return text;
  const pattern = new RegExp(escapeRegExp(needle), "gi");
  return text.replace(pattern, tag);
}

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
// 국내/베트남 전화번호에 흔한 형태(하이픈·공백·국가코드 포함, 7~13자리)를
// 넉넉하게 잡는 안전망. 과탐지가 있더라도(예: 긴 숫자 나열을 전화번호로
// 오인) "제거"가 "누락"보다 안전하므로 이 방향으로 설계했다.
const PHONE_PATTERN = /(?:\+?\d{1,3}[\s-]?)?\d{2,4}[\s-]\d{3,4}[\s-]\d{3,4}/g;
// 여권번호처럼 보이는 "영문자 1~2개 + 숫자 6~8개" 패턴.
const PASSPORT_LIKE_PATTERN = /\b[A-Za-z]{1,2}\d{6,8}\b/g;
// [STEP21-1 추가] 한국 사업자등록번호: XXX-XX-XXXXX (10자리, 하이픈 포함/미포함 모두 대응)
const BUSINESS_REG_NO_PATTERN = /\b\d{3}-?\d{2}-?\d{5}\b/g;
// [STEP21-1 추가] 외국인등록번호(한국) / 여권형이 아닌 국가 발급 ID 번호처럼
// 보이는 "6자리-7자리" 또는 "13자리 연속 숫자" 형태.
const ALIEN_REG_NO_PATTERN = /\b\d{6}-\d{7}\b/g;
// [STEP21-1 추가] 계좌번호 — 하이픈 포함/미포함, 10~16자리 숫자.
const BANK_ACCOUNT_PATTERN = /\b\d{2,6}(?:-\d{2,6}){1,4}\b|\b\d{10,16}\b/g;
// [STEP21-1 추가] 차량번호 — 한국식(예: "12가3456", "123가4567")과
// 베트남식(예: "51F-123.45")을 모두 느슨하게 잡는다.
const KOREAN_PLATE_PATTERN = /\b\d{2,3}[가-힣]\d{4}\b/g;
const VIETNAM_PLATE_PATTERN = /\b\d{2}[A-Za-z]-?\d{3}[.\-]?\d{2}\b/g;

export function redactPii(rawText: string, known: KnownPii): string {
  let text = rawText;

  for (const value of known.name) text = replaceAllCaseInsensitive(text, value, "[REDACTED_NAME]");
  for (const value of known.phone) text = replaceAllCaseInsensitive(text, value, "[REDACTED_PHONE]");
  for (const value of known.email) text = replaceAllCaseInsensitive(text, value, "[REDACTED_EMAIL]");
  for (const value of known.address) text = replaceAllCaseInsensitive(text, value, "[REDACTED_ADDRESS]");
  for (const value of known.kakaoId) text = replaceAllCaseInsensitive(text, value, "[REDACTED_CONTACT]");
  for (const value of known.zaloId) text = replaceAllCaseInsensitive(text, value, "[REDACTED_CONTACT]");

  // 더 구체적인(자릿수가 명확히 구분되는) 패턴을 먼저 치환해야, 뒤에
  // 나오는 넓은 범위의 숫자 패턴(계좌번호 등)이 이미 태그로 바뀐 문자열을
  // 다시 건드리지 않는다.
  text = text.replace(EMAIL_PATTERN, "[REDACTED_EMAIL]");
  text = text.replace(ALIEN_REG_NO_PATTERN, "[REDACTED_ID]");
  text = text.replace(BUSINESS_REG_NO_PATTERN, "[REDACTED_BUSINESS_NO]");
  text = text.replace(PASSPORT_LIKE_PATTERN, "[REDACTED_ID]");
  text = text.replace(KOREAN_PLATE_PATTERN, "[REDACTED_PLATE]");
  text = text.replace(VIETNAM_PLATE_PATTERN, "[REDACTED_PLATE]");
  text = text.replace(PHONE_PATTERN, "[REDACTED_PHONE]");
  text = text.replace(BANK_ACCOUNT_PATTERN, "[REDACTED_ACCOUNT]");

  return text;
}

export function getRedactionVersion(): string {
  return REDACTION_VERSION;
}
