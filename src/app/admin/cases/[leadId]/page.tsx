// src/app/admin/cases/[leadId]/page.tsx
//
// CHECK(WP/TRC/땀주/운전면허) + VERIFY(admin/real-estate/fraud/tax/unclear) +
// REGISTER(법인설립 + 식당/화장품/환경/소방/위생/의료기기/프랜차이즈) + 상담문의
// 전 엔진 공용 리드 상세페이지.
//
// 세 엔진의 crm_activities.meta 구조가 서로 다르다:
//   - CHECK/PERMIT_COMPANY (checkDiagnosis.ts): meta.expertBrief (camelCase)
//   - VERIFY (verifyDiagnosis.ts): meta.expert_brief (snake_case)
//   - REGISTER 자체진단(restaurant/cosmetics/franchise/environment/fire-safety/
//     hygiene/medical-device page.tsx 내부 로컬 함수): expertBrief 래핑 없이
//     meta.feasibilityScore + 카테고리별 상태 필드가 평평하게 저장됨
// 이 페이지는 세 형태를 각각 감지해 렌더링한다. 어느 한쪽 구조를 다른 쪽에
// 억지로 맞추지 않는다(각 엔진 page.tsx의 실제 저장 구조를 그대로 따름).
//
// "담당자 정보": 이 프로젝트에는 실시간 배정 시스템이나 관리자 계정별 식별
// 체계가 없다(관리자 로그인은 공용 접근 코드 1개, VFBCAI_MASTER_DOCUMENT_v6_0
// 13장 "실시간 배정 시스템은 없고 어드민에서 사람이 직접 확인하는 구조"
// 참고). leads/crm_activities 어디에도 담당자 컬럼이 없어 존재하지 않는
// 컬럼을 임의로 추측하지 않고, 현재 운영 방식을 안내 문구로 표시한다.
//
// "전문가 메모": 새 테이블/컬럼/API 없이 기존 crm_activities 테이블에
// action: "expert_memo" 활동으로 저장한다(다른 엔진들이 crm_activities에
// 직접 insert하는 것과 동일한 패턴). 저장은 인라인 Server Action으로 처리해
// 새 API 라우트를 만들지 않는다.

import Link from "next/link";
import { revalidatePath } from "next/cache";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Paperclip,
  Info,
} from "lucide-react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { notifyStageChange, type StageChangeAction } from "@/lib/notify/stageChange";
import { saveConsultationResponse } from "@/lib/caseMessages";
import { notifyConsultationResponse } from "@/lib/notify/consultationResponse";

export const dynamic = "force-dynamic";

// ── 서비스 분류 (admin/cases/page.tsx · admin/leads/page.tsx와 동일한 원칙) ──
// 하이픈/언더스코어 표기 혼재를 흡수하기 위한 매칭용 키 변환. 화면 표시
// 문자열 자체는 바꾸지 않고 startsWith()/딕셔너리 비교에만 사용한다.
function toPrefixKey(value: string): string {
  return value.toLowerCase().replace(/-/g, "_");
}

// 구버전 코드에서 다른 값으로 저장된 리드를 최신 값과 동일하게 인식시키기
// 위한 별칭 처리 (admin/cases/page.tsx와 동일).
const SERVICE_TYPE_ALIASES: Record<string, string> = {
  register_company: "permit_company",
};

function normalizeServiceType(serviceType: string | null | undefined): string | null {
  if (!serviceType) return serviceType ?? null;
  return SERVICE_TYPE_ALIASES[serviceType] ?? serviceType;
}

type CategoryKey = "check" | "verify" | "register" | "consultation" | "unclassified";

const CHECK_SERVICE_TYPES = ["wp", "trc", "tamtru", "driving-license"];

function getCategory(serviceType: string | null | undefined): CategoryKey {
  const normalized = normalizeServiceType(serviceType);
  if (!normalized) return "unclassified";
  if (normalized === "consultation") return "consultation";

  const prefixKey = toPrefixKey(normalized);
  if (prefixKey.startsWith("verify")) return "verify";
  if (prefixKey.startsWith("permit")) return "register";
  if (prefixKey.startsWith("register")) return "register";
  if (CHECK_SERVICE_TYPES.includes(normalized)) return "check";
  return "unclassified";
}

const CATEGORY_INFO: Record<CategoryKey, { label: string; badgeColor: string }> = {
  check: { label: "직접확인하기 (CHECK)", badgeColor: "bg-blue-50 text-blue-800" },
  verify: { label: "직접검토하기 (VERIFY)", badgeColor: "bg-gray-100 text-gray-600" },
  register: { label: "직접허가받기 (REGISTER)", badgeColor: "bg-purple-50 text-purple-800" },
  consultation: { label: "상담문의", badgeColor: "bg-teal-50 text-teal-800" },
  unclassified: { label: "미분류", badgeColor: "bg-amber-50 text-amber-800" },
};

const SERVICE_LABELS: Record<string, string> = {
  wp: "노동허가(WP)",
  trc: "거주증(TRC)",
  tamtru: "땀주",
  "driving-license": "운전면허",
  consultation: "일반 상담문의",
  permit_company: "법인설립",
  verify_admin: "행정문서 검토",
  "verify_real-estate": "부동산 문서 검토",
  verify_fraud: "사기문서 검토",
  verify_tax: "세무문서 검토",
  verify_unclear: "불확실한 서류 검토",
  register_restaurant: "식당허가",
  register_cosmetics: "화장품허가",
  register_environment: "환경허가",
  register_fire_safety: "소방허가", // 실제 값은 "register_fire-safety"(하이픈) — toPrefixKey로 매칭
  register_hygiene: "위생허가",
  register_medical_device: "의료기기허가", // 실제 값은 "register_medical-device"(하이픈) — toPrefixKey로 매칭
  register_franchise: "프랜차이즈 등록",
};

function getServiceLabel(serviceType: string): string {
  if (SERVICE_LABELS[serviceType]) return SERVICE_LABELS[serviceType];
  const key = toPrefixKey(serviceType);
  if (SERVICE_LABELS[key]) return SERVICE_LABELS[key];
  if (key.startsWith("verify")) {
    const sub = key.replace(/^verify_?/, "");
    return sub ? `VERIFY · ${sub}` : "VERIFY";
  }
  if (key.startsWith("permit") || key.startsWith("register")) {
    const sub = key.replace(/^(permit|register)_?/, "");
    return sub ? `REGISTER · ${sub}` : "REGISTER";
  }
  return serviceType;
}

const RESULT_LABELS: Record<string, { label: string; color: string }> = {
  possible: { label: "가능", color: "text-emerald-700 bg-emerald-50" },
  conditional: { label: "조건부 가능", color: "text-amber-700 bg-amber-50" },
  impossible: { label: "어려움", color: "text-red-700 bg-red-50" },
};

const RISK_LABELS: Record<string, { label: string; color: string }> = {
  low: { label: "낮음", color: "text-emerald-700 bg-emerald-50" },
  medium: { label: "중간", color: "text-amber-700 bg-amber-50" },
  high: { label: "높음", color: "text-red-700 bg-red-50" },
};

// ── 상담 상태 표시: leads.status 컬럼은 존재가 확인되지 않아 사용하지 않고,
// crm_activities에 실제로 기록되는 action 값만으로 판단한다 (기존 VERIFY
// 페이지가 expert_review_request 유무로 판단하던 원칙을 CHECK/REGISTER/
// 상담문의까지 포함하도록 확장) ──
type ActivityRow = {
  id: string;
  lead_id: string;
  action: string | null;
  tag: string | null;
  meta: unknown;
  created_at: string;
};

// CHECK(checkDiagnosis.ts)와 VERIFY(verifyDiagnosis.ts)의 전문가용 진단
// 구조는 필드 구성이 동일해 하나의 타입으로 함께 다룬다(래핑 키만
// expertBrief / expert_brief로 다름).
type ExpertChecklistItem = { label: string; passed: boolean; reason?: string };
type ExpertRejectionRisk = { rank: number; reason: string };
type ExpertBriefLike = {
  riskLevel?: "low" | "medium" | "high";
  summary?: string;
  checkedItems?: ExpertChecklistItem[];
  rejectionRisks?: ExpertRejectionRisk[];
  recommendedSteps?: string[];
  similarCases?: string[];
};

// meta의 최소 공통 형태 — 엔진별로 필드가 늘어나므로 구체 타입 대신
// 느슨한 레코드로 다루고 사용하는 지점에서만 필요한 키를 좁혀 읽는다.
type ActivityMeta = Record<string, unknown>;

function asMeta(value: unknown): ActivityMeta | null {
  return value && typeof value === "object" ? (value as ActivityMeta) : null;
}

// "고객 추가 제출 자료" 섹션 전용 — 바이트 단위 파일크기를 사람이 읽기 쉬운 형태로 변환.
function formatFileSizeLabel(bytes: number | null): string {
  if (bytes === null) return "-";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

// "질문 단계 제출 자료" 섹션 전용 — pre/post 외 값은 원문 그대로 표시(src/app/documents/page.tsx의
// formatReviewStageLabel과 동일한 변환 규칙).
function formatReviewStageLabel(reviewStage: string | null): string {
  if (reviewStage === "pre") return "Prevent Review";
  if (reviewStage === "post") return "Case Review";
  return reviewStage ?? "-";
}

// "활동 타임라인" 표시 전용 — crm_activities.action 원본 문자열은 절대 바꾸지 않고,
// 화면에 보여줄 라벨/색상만 매핑한다. 여기 없는 action은 서비스별 진단 완료
// 접미사(_diagnosis_lead)를 우선 확인하고, 그래도 없으면 기존 humanizeKey로
// 사람이 읽기 좋게 변환해 표시한다(새 계산 로직이 아니라 기존 포맷터 재사용).
const ACTIVITY_LABELS: Record<string, string> = {
  expert_review_request: "전문가 검토 요청",
  agency_upgrade_request: "전문가 진행 요청",
  process_government_submitted: "정부 제출",
  process_permit_completed: "허가 완료",
  document_upload: "문서 제출",
  consultation_request: "상담 신청",
  expert_consultation_requested: "상담 요청 (Case Room)",
  expert_memo: "전문가 메모 작성",
  verify_lead: "AI 진단 완료",
};

const ACTIVITY_DOT_COLORS: Record<string, string> = {
  expert_review_request: "bg-blue-500",
  agency_upgrade_request: "bg-amber-500",
  process_government_submitted: "bg-purple-500",
  process_permit_completed: "bg-emerald-500",
  document_upload: "bg-blue-500",
  consultation_request: "bg-teal-500",
  expert_consultation_requested: "bg-purple-500",
  expert_memo: "bg-gray-400",
  verify_lead: "bg-emerald-500",
};

function getActivityLabel(action: string | null): string {
  if (!action) return "활동 기록";
  if (ACTIVITY_LABELS[action]) return ACTIVITY_LABELS[action];
  if (action.endsWith("_diagnosis_lead")) return "AI 진단 완료";
  return humanizeKey(action);
}

function getActivityDotColor(action: string | null): string {
  if (!action) return "bg-gray-300";
  if (ACTIVITY_DOT_COLORS[action]) return ACTIVITY_DOT_COLORS[action];
  if (action.endsWith("_diagnosis_lead")) return "bg-emerald-500";
  return "bg-gray-300";
}

function getConsultationStatus(activities: ActivityRow[]): { label: string; color: string } {
  const actions = new Set(activities.map((a) => a.action));
  if (actions.has("agency_upgrade_request")) {
    return { label: "전문가 진행요청 접수됨", color: "text-blue-800 bg-blue-50" };
  }
  if (actions.has("expert_review_request")) {
    return { label: "전문가 검토 요청됨", color: "text-purple-800 bg-purple-50" };
  }
  if (actions.has("consultation_request")) {
    return { label: "상담 신청됨", color: "text-teal-800 bg-teal-50" };
  }
  const hasDiagnosis = activities.some(
    (a) => a.action === "verify_lead" || (a.action ?? "").endsWith("_diagnosis_lead")
  );
  if (hasDiagnosis) {
    return { label: "진단·접수 완료 (후속 대응 대기)", color: "text-gray-700 bg-gray-100" };
  }
  return { label: "접수됨", color: "text-gray-700 bg-gray-100" };
}

// ── 진행 단계 관리 ──
// 아래 4개는 이미 존재하는 action을 그대로 재사용한다(신규 action 아님):
// expert_review_request, agency_upgrade_request.
// "정부 제출"·"허가 완료"는 코드 전체를 확인한 결과 대응하는 action이 없어
// 새로 추가했다: process_government_submitted, process_permit_completed.
// 관리자가 직접 저장할 수 있는 단계는 이 4개뿐이다 — "접수 완료"는 리드가
// 존재하는 것 자체로 항상 참이라 별도 action이 필요 없고, "AI 진단 완료"는
// 서비스별로 실제 action 이름이 달라(wp_diagnosis_lead, register_*_diagnosis_lead,
// verify_lead 등) 이미 접수 시점에 자동 기록되므로 관리자가 별도로 저장할
// 필요가 없다(자동 감지만 표시).
type ProcessStep = { label: string; done: boolean; settableAction: string | null };

const SETTABLE_STAGE_ACTIONS = new Set([
  "expert_review_request",
  "agency_upgrade_request",
  "process_government_submitted",
  "process_permit_completed",
]);

// 상위 단계 action이 존재하면 이전 단계도 완료로 표시(캐스케이드).
function cascadeDone(rawDone: boolean[]): boolean[] {
  let lastTrueIndex = -1;
  rawDone.forEach((d, i) => {
    if (d) lastTrueIndex = i;
  });
  return rawDone.map((_, i) => i <= lastTrueIndex);
}

function buildProcessSteps(category: CategoryKey, activities: ActivityRow[]): ProcessStep[] {
  const actions = new Set(activities.map((a) => a.action));
  const hasDiagnosis = activities.some(
    (a) => a.action === "verify_lead" || (a.action ?? "").endsWith("_diagnosis_lead")
  );
  const hasExpertReview = actions.has("expert_review_request");
  const hasAgency = actions.has("agency_upgrade_request");
  const hasGovernmentSubmitted = actions.has("process_government_submitted");
  const hasPermitCompleted = actions.has("process_permit_completed");

  if (category === "verify") {
    const raw = [true, hasDiagnosis, hasExpertReview, false];
    const done = cascadeDone(raw);
    return [
      { label: "접수 완료", done: done[0], settableAction: null },
      { label: "자체 진단 완료", done: done[1], settableAction: null },
      { label: "전문가 검토 요청", done: done[2], settableAction: "expert_review_request" },
      { label: "전문가 안내 대기", done: done[3], settableAction: null },
    ];
  }
  if (category === "consultation") {
    const raw = [true, false];
    const done = cascadeDone(raw);
    return [
      { label: "상담 접수 완료", done: done[0], settableAction: null },
      { label: "담당자 확인 대기", done: done[1], settableAction: null },
    ];
  }
  // CHECK / REGISTER
  const raw = [true, hasDiagnosis, hasExpertReview, hasAgency, hasGovernmentSubmitted, hasPermitCompleted];
  const done = cascadeDone(raw);
  return [
    { label: "접수 완료", done: done[0], settableAction: null },
    { label: "AI 진단 완료", done: done[1], settableAction: null },
    { label: "전문가 검토", done: done[2], settableAction: "expert_review_request" },
    { label: "전문가 진행요청", done: done[3], settableAction: "agency_upgrade_request" },
    { label: "정부 제출", done: done[4], settableAction: "process_government_submitted" },
    { label: "허가 완료", done: done[5], settableAction: "process_permit_completed" },
  ];
}

// meta 안의 camelCase/snake_case 키를 사람이 읽기 좋은 라벨로 변환
// (REGISTER 자체진단처럼 카테고리마다 필드명이 달라 하드코딩하지 않고
// 공통 포맷터로 처리한다).
function humanizeKey(key: string): string {
  const withSpaces = key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).toLowerCase();
}

function formatMetaValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "예" : "아니오";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

// ── 인라인 Server Action: 전문가 메모 저장 ──
// 새 테이블·컬럼·API 라우트 없이 기존 crm_activities에 활동 1건으로 기록한다.
async function addExpertMemo(formData: FormData) {
  "use server";
  const leadId = String(formData.get("leadId") || "");
  const memo = String(formData.get("memo") || "").trim();
  if (!leadId || !memo) return;

  await supabaseAdmin.from("crm_activities").insert({
    lead_id: leadId,
    action: "expert_memo",
    tag: "ADMIN_MEMO",
    meta: { memo },
  });

  revalidatePath(`/admin/cases/${leadId}`);
}

// ── 인라인 Server Action: 전문가 상담 요청에 답변 ──
// STEP8: 고객이 Case Room(mypage/chat)에서 남긴 전문가 상담 요청
// (action: "expert_consultation_requested")에 답변을 등록한다. 새
// API 라우트 없이 이 페이지의 다른 서버 액션(addExpertMemo,
// setProcessStage)과 동일하게 인라인 Server Action으로 처리한다.
// 여기서 저장하는 답변은 "전문가 메모"(내부용, 기본 비공개)와 완전히
// 분리된 별도 action이며, 항상 고객에게 공개되는 답변이다.
async function respondToConsultation(formData: FormData) {
  "use server";
  const leadId = String(formData.get("leadId") || "");
  const requestActivityId = String(formData.get("requestActivityId") || "");
  const content = String(formData.get("content") || "").trim();
  if (!leadId || !requestActivityId || !content) return;

  const saved = await saveConsultationResponse(leadId, requestActivityId, content);
  // saved가 null이면 이미 답변이 존재하거나(중복 제출) 저장 자체가 실패한
  // 것 — 두 경우 모두 이메일을 다시 보내지 않는다.
  if (saved) {
    await notifyConsultationResponse(leadId);
  }

  revalidatePath(`/admin/cases/${leadId}`);
}

// ── 인라인 Server Action: 진행 단계 저장 ──
// 새 테이블·컬럼·API 라우트 없이 기존 crm_activities에 활동 1건으로 기록한다.
// action은 SETTABLE_STAGE_ACTIONS 화이트리스트에 있는 값만 허용한다(폼 조작으로
// 임의 문자열이 crm_activities.action에 저장되는 것을 방지).
// 이미 동일 action이 있으면 다시 저장하지 않는다(중복 방지).
//
// STEP4: "허가 완료" 단계에서만 결과파일(허가증)을 함께 첨부할 수 있다.
// 새 Storage 버킷을 만들지 않고, verify/*/page.tsx가 이미 쓰는 "documents"
// 버킷·업로드 방식을 그대로 재사용한다. meta.file_url/file_name도 기존
// VERIFY 첨부파일과 동일한 필드명 관례를 따른다.
async function setProcessStage(formData: FormData) {
  "use server";
  const leadId = String(formData.get("leadId") || "");
  const action = String(formData.get("stageAction") || "");
  if (!leadId || !SETTABLE_STAGE_ACTIONS.has(action)) return;

  const { data: existing } = await supabaseAdmin
    .from("crm_activities")
    .select("id")
    .eq("lead_id", leadId)
    .eq("action", action)
    .maybeSingle();
  if (existing) return;

  const meta: Record<string, unknown> = { setBy: "admin" };

  if (action === "process_permit_completed") {
    const file = formData.get("permitFile");
    if (file instanceof File && file.size > 0) {
      const rawExt = file.name.split(".").pop() || "";
      const safeExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
      const storagePath = `permit-results/${leadId}.${safeExt}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("documents")
        .upload(storagePath, file, { upsert: true });

      if (!uploadError) {
        const { data: urlData } = supabaseAdmin.storage.from("documents").getPublicUrl(storagePath);
        meta.file_url = urlData.publicUrl;
        meta.file_name = file.name;
      } else {
        console.error("permit file upload failed:", uploadError);
      }
    }
  }

  const { error: stageInsertError } = await supabaseAdmin
    .from("crm_activities")
    .insert({
      lead_id: leadId,
      action,
      tag: "ADMIN_STAGE_UPDATE",
      meta,
    });

  // STEP6: 단계 저장이 실제로 성공했을 때만 고객에게 알림(이메일+카카오)을
  // 보낸다. notifyStageChange 내부에서 모든 에러를 catch하므로 여기서
  // 실패해도 단계 저장(위 insert) 자체는 이미 완료된 상태로 유지된다.
  if (!stageInsertError) {
    await notifyStageChange(leadId, action as StageChangeAction, {
      permitFileUrl: (meta.file_url as string | undefined) ?? null,
    });
  }

  revalidatePath(`/admin/cases/${leadId}`);
}

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;

  const { data: lead } = await supabaseAdmin
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .maybeSingle();

  if (!lead) {
    return (
      <main className="min-h-screen bg-[#fafafa] p-10">
        <p className="text-sm text-red-600">해당 리드를 찾을 수 없습니다.</p>
        <Link href="/admin/cases" className="mt-4 inline-block text-xs text-blue-900 hover:underline">
          ← 목록으로
        </Link>
      </main>
    );
  }

  const { data: activitiesRaw } = await supabaseAdmin
    .from("crm_activities")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true });
  const activities = (activitiesRaw ?? []) as ActivityRow[];

  const { data: rejectionsRaw } = await supabaseAdmin
    .from("previous_rejections")
    .select("id, service_type, source_page, reason, linked_lead_id, created_at")
    .eq("linked_lead_id", leadId)
    .order("created_at", { ascending: false });
  const rejections = rejectionsRaw ?? [];

  const serviceType = normalizeServiceType(lead.service_type as string) ?? (lead.service_type as string);
  const category = getCategory(serviceType);
  const categoryInfo = CATEGORY_INFO[category];
  const serviceLabel = getServiceLabel(serviceType ?? "");
  const resultInfo = lead.result ? RESULT_LABELS[lead.result] ?? null : null;
  const consultationStatus = getConsultationStatus(activities);
  const processSteps = buildProcessSteps(category, activities);

  // 진행 단계 UI 개선 전용 파생 값 — buildProcessSteps/setProcessStage의 로직·action 값은
  // 그대로 두고, "다음으로 진행 가능한 단계 1개"만 렌더링에서 골라내기 위한 계산만 추가.
  const nextStepIndex = processSteps.findIndex((s) => !s.done && s.settableAction);
  const nextStep = nextStepIndex >= 0 ? processSteps[nextStepIndex] : null;
  const permitStep = processSteps.find((s) => s.settableAction === "process_permit_completed") ?? null;

  // "고객 요약" 카드 전용 — buildProcessSteps 결과에서 라벨만 골라 쓴다(점수/리스크 계산과
  // 마찬가지로 새 계산 로직 없음). 마지막으로 완료된(done===true) 단계를 "현재 단계"로
  // 표시하며, 완료된 단계가 없으면 첫 단계 라벨을 표시한다. nextStep(다음 진행 가능 단계)은
  // 여기서 사용하지 않는다 — "다음 단계 실행" 카드 전용 값으로만 유지.
  const currentStageLabel =
    [...processSteps].reverse().find((s) => s.done)?.label ?? processSteps[0]?.label ?? "-";

  // STEP4: "허가 완료" 단계에 첨부된 결과파일(허가증)이 있으면 표시용으로 조회
  const permitActivity = activities.find((a) => a.action === "process_permit_completed");
  const permitFileUrl = (asMeta(permitActivity?.meta)?.file_url as string | undefined) ?? null;
  const permitFileName = (asMeta(permitActivity?.meta)?.file_name as string | undefined) ?? null;

  // 첨부 서류 (VERIFY STEP2에서 저장되는 meta.file_url / file_name — 특정
  // action명에 묶지 않고 파일이 첨부된 첫 활동을 찾는다)
  const uploadActivity = activities.find((a) => asMeta(a.meta)?.file_url);
  const fileUrl = (asMeta(uploadActivity?.meta)?.file_url as string | undefined) ?? null;
  const fileName = (asMeta(uploadActivity?.meta)?.file_name as string | undefined) ?? null;

  // "고객 추가 제출 자료" — /documents 페이지에서 업로드된 문서(action="document_upload").
  // storagePath만 저장되어 있으므로(공개 URL 미사용 원칙) 서버 컴포넌트 내부에서
  // supabaseAdmin으로 Signed URL을 생성한다. 새 API 라우트를 만들지 않고, 실패해도
  // 페이지 전체가 죽지 않도록 항목별로 개별 try/catch 처리한다.
  const documentUploadActivities = activities.filter((a) => a.action === "document_upload");
  const customerDocuments = await Promise.all(
    documentUploadActivities.map(async (a) => {
      const meta = asMeta(a.meta);
      const storagePath = (meta?.storagePath as string | undefined) ?? null;
      let signedUrl: string | null = null;
      if (storagePath) {
        try {
          const { data: signedData, error: signedError } = await supabaseAdmin.storage
            .from("documents")
            .createSignedUrl(storagePath, 3600);
          if (!signedError && signedData?.signedUrl) {
            signedUrl = signedData.signedUrl;
          }
        } catch (signedCatchErr) {
          console.error("[admin/cases][diagnostic] Signed URL 생성 실패:", signedCatchErr);
          signedUrl = null;
        }
      }
      return {
        id: a.id,
        tag: a.tag,
        fileName: (meta?.fileName as string | undefined) ?? null,
        fileSize: typeof meta?.fileSize === "number" ? (meta.fileSize as number) : null,
        service: (meta?.service as string | undefined) ?? null,
        mode: (meta?.mode as string | undefined) ?? null,
        createdAt: a.created_at,
        signedUrl,
      };
    })
  );

  // "질문 단계 제출 자료" — VERIFY admin의 질문 단계(action="verify_lead")에서 함께 제출된
  // meta.submitted_document 중 가장 최근 것만 표시. activities는 created_at 오름차순이므로
  // 배열 끝에서부터 찾는다. file_url은 공개 URL이므로 이번 작업에서는 사용하지 않는다
  // (메타데이터만 표시, 링크 생성 없음).
  const verifyLeadDocActivities = activities.filter(
    (a) => a.action === "verify_lead" && Boolean(asMeta(a.meta)?.submitted_document)
  );
  const latestVerifyLeadDocActivity =
    verifyLeadDocActivities.length > 0 ? verifyLeadDocActivities[verifyLeadDocActivities.length - 1] : null;
  const questionStageSubmittedDocument = (() => {
    const submittedDocument = asMeta(latestVerifyLeadDocActivity?.meta)?.submitted_document as
      | { document_type?: string; review_stage?: string; file_name?: string }
      | undefined;
    if (!submittedDocument) return null;
    return {
      fileName: submittedDocument.file_name ?? null,
      documentType: submittedDocument.document_type ?? null,
      reviewStage: submittedDocument.review_stage ?? null,
    };
  })();

  // ── AI 진단 결과 감지: CHECK(camelCase) → VERIFY(snake_case) → REGISTER(평평한 구조) 순 ──
  const checkActivity = [...activities].reverse().find((a) => asMeta(a.meta)?.expertBrief);
  const verifyActivity = [...activities].reverse().find((a) => asMeta(a.meta)?.expert_brief);
  const registerActivity = [...activities]
    .reverse()
    .find((a) => {
      const m = asMeta(a.meta);
      return typeof m?.feasibilityScore === "number" && !m?.expertBrief && !m?.expert_brief;
    });

  const checkBrief = (asMeta(checkActivity?.meta)?.expertBrief as ExpertBriefLike | undefined) ?? null;
  const checkScore = asMeta(checkActivity?.meta)?.feasibilityScore as number | undefined;
  const verifyBrief = (asMeta(verifyActivity?.meta)?.expert_brief as ExpertBriefLike | undefined) ?? null;
  const registerMeta = asMeta(registerActivity?.meta);

  const activeBrief = checkBrief ?? verifyBrief;
  const activeScore = checkBrief ? checkScore : null;
  const riskInfo = activeBrief?.riskLevel ? RISK_LABELS[activeBrief.riskLevel] : null;

  // 전문가 메모만 모아서 별도 표시 (타임라인에도 동일 활동이 함께 나타남)
  const memoActivities = activities.filter((a) => a.action === "expert_memo");

  // STEP8: Case Room 전문가 상담 요청/답변 — 새로 들어온 순(오래된 것부터)
  // 요청마다 같은 lead의 답변 중 meta.requestActivityId가 일치하는 것을 찾아
  // 매칭한다(1건당 답변 최대 1건 — saveConsultationResponse가 중복 저장 방지).
  const consultationRequests = activities.filter((a) => a.action === "expert_consultation_requested");
  const consultationResponses = activities.filter((a) => a.action === "expert_consultation_response");
  function findResponseFor(requestId: string): ActivityRow | undefined {
    return consultationResponses.find((r) => asMeta(r.meta)?.requestActivityId === requestId);
  }

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link href="/admin/cases" className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600">
          <ArrowLeft size={14} /> 목록으로
        </Link>

        {/* 헤더: 대분류(CHECK/VERIFY/REGISTER/상담) + 서비스 + 상담상태 */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${categoryInfo.badgeColor}`}>
            {categoryInfo.label}
          </span>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
            {serviceLabel}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${consultationStatus.color}`}>
            {consultationStatus.label}
          </span>
          {resultInfo && (
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${resultInfo.color}`}>
              결과 {resultInfo.label}
            </span>
          )}
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900">
          {lead.name}
        </h1>

        {/* 고객 요약 — 기존 데이터(activeScore/riskInfo/processSteps)만 재사용, 새 계산 없음 */}
        <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-xs font-semibold text-gray-700">고객 요약</p>
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            <div className="rounded-xl bg-gray-50 px-3 py-2.5">
              <p className="text-[10px] text-gray-400">고객</p>
              <p className="mt-0.5 truncate text-xs font-semibold text-gray-900">{lead.name}</p>
            </div>
            <div className="rounded-xl bg-gray-50 px-3 py-2.5">
              <p className="text-[10px] text-gray-400">서비스</p>
              <p className="mt-0.5 truncate text-xs font-semibold text-gray-900">{serviceLabel}</p>
            </div>
            <div className="rounded-xl bg-gray-50 px-3 py-2.5">
              <p className="text-[10px] text-gray-400">현재 단계</p>
              <p className="mt-0.5 truncate text-xs font-semibold text-gray-900">{currentStageLabel}</p>
            </div>
            <div className="rounded-xl bg-gray-50 px-3 py-2.5">
              <p className="text-[10px] text-gray-400">AI 점수</p>
              <p className="mt-0.5 text-xs font-semibold text-gray-900">
                {typeof activeScore === "number" ? `${activeScore}%` : "-"}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 px-3 py-2.5">
              <p className="text-[10px] text-gray-400">리스크</p>
              {riskInfo ? (
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${riskInfo.color}`}>
                  {riskInfo.label}
                </span>
              ) : (
                <p className="mt-0.5 text-xs font-semibold text-gray-900">-</p>
              )}
            </div>
          </div>
        </div>

        {/* 1~2. 고객 기본정보 + 신청 서비스 정보 — PC(lg 이상) 2열, 모바일 1열 */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* 1. 고객 기본정보 */}
          <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <p className="text-xs font-semibold text-gray-700">고객 기본정보</p>
            <div className="mt-2 grid grid-cols-2 gap-y-1 text-xs">
              <span className="text-gray-500">전화번호</span>
              <span className="font-medium text-gray-900">{lead.phone ?? "-"}</span>
              <span className="text-gray-500">이메일</span>
              <span className="font-medium text-gray-900">{lead.email ?? "-"}</span>
              <span className="text-gray-500">주소</span>
              <span className="font-medium text-gray-900">{lead.address ?? "-"}</span>
              <span className="text-gray-500">카카오톡</span>
              <span className="font-medium text-gray-900">{lead.kakao_id ?? "-"}</span>
              <span className="text-gray-500">잘로</span>
              <span className="font-medium text-gray-900">{lead.zalo_id ?? "-"}</span>
              <span className="text-gray-500">접수일</span>
              <span className="font-medium text-gray-900">
                {new Date(lead.created_at).toLocaleString("ko-KR")}
              </span>
            </div>
          </div>

          {/* 2. 신청 서비스 종류 / 유입 경로 */}
          <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <p className="text-xs font-semibold text-gray-700">신청 서비스 정보</p>
            <div className="mt-2 grid grid-cols-2 gap-y-1.5 text-xs">
              <span className="text-gray-500">서비스 종류</span>
              <span className="font-medium text-gray-900">{serviceLabel}</span>
              <span className="text-gray-500">service_type 원본값</span>
              <span className="font-mono text-[11px] text-gray-500">{lead.service_type ?? "-"}</span>
              <span className="text-gray-500">유입 경로</span>
              <span className="font-medium text-gray-900">{lead.source_page ?? "-"}</span>
              <span className="text-gray-500">결과값</span>
              <span className="font-medium text-gray-900">{lead.result ?? "-"}</span>
            </div>
          </div>
        </div>

        {/* 진행 단계 관리 (신규) — 가로형 트랙 UI로 개편, 모바일은 세로형 자동 전환 */}
        <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-xs font-semibold text-gray-700">진행 단계 관리</p>

          {/* 현재 단계·다음 단계 요약 — 기존 currentStageLabel/nextStep 값만 재사용, 새 계산 없음 */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700">
              현재 단계 · {currentStageLabel}
            </span>
            {nextStep && (
              <>
                <span className="text-[11px] text-gray-300">→</span>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-900">
                  다음 단계 · {nextStep.label}
                </span>
              </>
            )}
          </div>

          {/* 가로형 단계 트랙 (sm 이상) / 세로형 (모바일) */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-0">
            {processSteps.map((step, i) => {
              const isNextStep = i === nextStepIndex;
              return (
                <div
                  key={step.label}
                  className="relative flex items-center sm:flex-1 sm:flex-col sm:items-center"
                >
                  {i > 0 && (
                    <div
                      className={`hidden sm:block absolute left-[-50%] right-[50%] top-[14px] h-px z-0 ${
                        step.done ? "bg-emerald-400" : "bg-gray-200"
                      }`}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-2 sm:flex-col sm:gap-1.5 sm:px-2">
                    <div
                      className={
                        step.done
                          ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white"
                          : isNextStep
                          ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-900 text-white ring-4 ring-blue-100"
                          : "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-400"
                      }
                    >
                      {step.done ? (
                        <CheckCircle2 size={15} />
                      ) : (
                        <span className="text-[11px] font-semibold">{i + 1}</span>
                      )}
                    </div>
                    <span
                      className={
                        step.done
                          ? "text-[11px] font-semibold text-gray-900 sm:text-center"
                          : isNextStep
                          ? "text-[11px] font-bold text-blue-900 sm:text-center"
                          : "text-[11px] text-gray-400 sm:text-center"
                      }
                    >
                      {step.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 다음 단계 실행 — "이 단계로 설정" 버튼은 진행 가능한 다음 단계 1개에만 노출 */}
          {nextStep && (
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/40 p-3.5">
              <p className="text-[11px] text-gray-600">
                다음 단계: <span className="font-semibold text-blue-900">{nextStep.label}</span>
              </p>
              <form action={setProcessStage} className="mt-2 flex flex-wrap items-center gap-2">
                <input type="hidden" name="leadId" value={lead.id} />
                <input type="hidden" name="stageAction" value={nextStep.settableAction ?? ""} />
                {/* STEP4: "허가 완료"는 결과파일(허가증)을 함께 첨부할 수 있다(선택, 기존 로직 유지) */}
                {nextStep.settableAction === "process_permit_completed" && (
                  <input
                    type="file"
                    name="permitFile"
                    className="text-[10px] text-gray-500 file:mr-2 file:rounded-full file:border-0 file:bg-gray-100 file:px-2.5 file:py-1 file:text-[10px] file:font-semibold"
                  />
                )}
                <button
                  type="submit"
                  className="rounded-full border border-blue-900 bg-white px-3.5 py-1.5 text-[11px] font-semibold text-blue-900 hover:bg-blue-50 transition-colors"
                >
                  다음 단계로 변경
                </button>
              </form>
              <p className="mt-1.5 text-[11px] text-gray-400">
                변경 시 고객 마이페이지가 갱신되고 단계 변경 알림이 발송됩니다.
              </p>
            </div>
          )}

          {/* STEP4: 이미 첨부된 허가증 파일이 있으면 표시 (기존 로직 유지) */}
          {permitStep?.done && permitFileUrl && (
            <a
              href={permitFileUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-blue-900 hover:underline"
            >
              <Paperclip size={12} /> {permitFileName ?? "허가증 파일 열기"}
            </a>
          )}

          <p className="mt-3 text-[11px] text-gray-400">
            &quot;접수 완료&quot;·&quot;AI 진단 완료&quot;는 접수 시점에 자동으로 기록되어 별도 설정이 필요 없습니다.
          </p>
        </div>

        {/* 3. previous_rejections (타 기관 거절이력) */}
        <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-xs font-semibold text-gray-700">타 기관 거절이력</p>
          {rejections.length === 0 ? (
            <p className="mt-2 text-xs text-gray-400">연결된 거절이력이 없습니다.</p>
          ) : (
            <div className="mt-2 space-y-2">
              {rejections.map((r) => (
                <div key={r.id} className="rounded-xl bg-red-50/60 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-red-700">
                      {getServiceLabel(r.service_type)}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {new Date(r.created_at).toLocaleString("ko-KR")}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                    {r.reason || "사유 미기재"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4~5. AI 진단 결과(좌) + 문서 영역(우) — PC(lg 이상) 2열, 모바일 1열 */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* 좌측: 5. AI 진단 결과 (CHECK / VERIFY / REGISTER 3가지 구조 분기) */}
          <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <p className="text-xs font-semibold text-gray-700">AI 진단 결과</p>

            {/* KPI 영역 — 기존 파생 변수(activeScore/riskInfo/resultInfo)만 재사용, 새 계산 없음.
                모바일 2열, PC(lg 이상) 3열 */}
            <div className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-3">
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <p className="text-[10px] text-gray-400">AI 점수</p>
                <p className="mt-1 text-xl font-bold text-gray-900">
                  {typeof activeScore === "number" ? `${activeScore}%` : "-"}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <p className="text-[10px] text-gray-400">리스크</p>
                {riskInfo ? (
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${riskInfo.color}`}>
                    {riskInfo.label}
                  </span>
                ) : (
                  <p className="mt-1 text-xs font-semibold text-gray-900">-</p>
                )}
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <p className="text-[10px] text-gray-400">결과</p>
                {resultInfo ? (
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${resultInfo.color}`}>
                    {resultInfo.label}
                  </span>
                ) : (
                  <p className="mt-1 text-xs font-semibold text-gray-900">-</p>
                )}
              </div>
            </div>

            {activeBrief ? (
              <>
                {activeBrief.summary && (
                  <p className="mt-3 text-xs text-gray-600 leading-relaxed">{activeBrief.summary}</p>
                )}
                {(activeBrief.checkedItems?.length ?? 0) > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-700">항목별 확인 결과</p>
                    <div className="mt-2 space-y-1.5">
                      {(activeBrief.checkedItems ?? []).map((item: ExpertChecklistItem, i: number) => (
                        <div key={i} className="rounded-xl bg-gray-50 px-3 py-1.5">
                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
                            {item.passed ? (
                              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                            ) : (
                              <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                            )}
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.reason && (
                            <p className="mt-0.5 truncate text-[11px] text-gray-500 pl-[22px]">{item.reason}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(activeBrief.rejectionRisks?.length ?? 0) > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-700">주요 위험 요인</p>
                    <ol className="mt-2 space-y-1 list-decimal pl-4">
                      {[...(activeBrief.rejectionRisks ?? [])]
                        .sort((a: ExpertRejectionRisk, b: ExpertRejectionRisk) => a.rank - b.rank)
                        .map((r: ExpertRejectionRisk, i: number) => (
                          <li key={i} className="text-xs text-red-700">{r.reason}</li>
                        ))}
                    </ol>
                  </div>
                )}
                {(activeBrief.recommendedSteps?.length ?? 0) > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-700">권장 조치</p>
                    <ul className="mt-2 space-y-1">
                      {(activeBrief.recommendedSteps ?? []).map((s: string, i: number) => (
                        <li key={i} className="text-xs text-gray-600 pl-1">· {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(activeBrief.similarCases?.length ?? 0) > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-700">유사 사례</p>
                    <ul className="mt-2 space-y-1">
                      {(activeBrief.similarCases ?? []).map((c: string, i: number) => (
                        <li key={i} className="text-xs text-gray-600 pl-1">· {c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : registerMeta ? (
              <div className="mt-3">
                <p className="text-[11px] text-gray-400">
                  REGISTER 자체진단 결과 (전문가 리포트가 아닌 1차 자가진단 값입니다)
                </p>
                <div className="mt-2 space-y-1.5 text-xs">
                  {Object.entries(registerMeta)
                    .filter(([k]) => k !== "feasibilityScore" && k !== "previousRejection")
                    .map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">{humanizeKey(k)}</span>
                        <span className="font-medium text-gray-900 text-right">{formatMetaValue(v)}</span>
                      </div>
                    ))}
                </div>
                {Boolean(registerMeta.previousRejection) && (
                  <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                    이전 신청 이력: {formatMetaValue(registerMeta.previousRejection)}
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-3 text-xs text-gray-400">
                이 리드에는 아직 AI 진단 데이터가 없습니다.
              </p>
            )}
          </div>

          {/* 우측: 문서 관리 — 첨부 서류 / 고객 추가 제출 자료 / 질문 단계 제출 자료를 행(Row) 형태로 통합 표시 */}
          <div className="self-start rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <p className="text-xs font-semibold text-gray-700">문서 관리</p>

            {/* 3개 고정 섹션(질문 단계 제출자료/추가 제출자료/허가증)을 항상 표시 —
                각 섹션은 기존에 이미 계산된 값(fileUrl/customerDocuments/
                questionStageSubmittedDocument/permitFileUrl)만 그대로 재사용하고,
                값이 없을 때만 "현재 제출된 문서가 없습니다."를 보여준다. 새 계산 없음. */}
            <div className="mt-3 space-y-3">
              {/* 4-2. 질문 단계 제출 자료 (action="verify_lead" meta.submitted_document, 읽기 전용 — 링크 없음) */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400">질문 단계 제출자료</p>
                {questionStageSubmittedDocument ? (
                  <div className="mt-1.5 flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                      <Paperclip size={14} className="text-blue-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-gray-800">
                        {questionStageSubmittedDocument.fileName ?? "질문 단계 제출 자료"}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-gray-400">
                        {questionStageSubmittedDocument.documentType ?? "-"} ·{" "}
                        {formatReviewStageLabel(questionStageSubmittedDocument.reviewStage)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      이미 제출됨
                    </span>
                  </div>
                ) : (
                  <p className="mt-1.5 text-xs text-gray-400">현재 제출된 문서가 없습니다.</p>
                )}
              </div>

              {/* 4, 4-1. 추가 제출 자료 (첨부 서류 fileUrl + action="document_upload" customerDocuments) */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400">추가 제출자료</p>
                {fileUrl || customerDocuments.length > 0 ? (
                  <div className="mt-1.5 space-y-1.5">
                    {fileUrl && (
                      <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                          <Paperclip size={14} className="text-blue-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-gray-800">
                            {fileName ?? "첨부파일"}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          제출완료
                        </span>
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 text-[11px] font-medium text-blue-900 hover:underline"
                        >
                          열기
                        </a>
                      </div>
                    )}

                    {customerDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                          <Paperclip size={14} className="text-blue-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-gray-800">{doc.tag ?? "문서"}</p>
                          <p className="mt-0.5 truncate text-[11px] text-gray-400">
                            {new Date(doc.createdAt).toLocaleString("ko-KR")}
                          </p>
                        </div>
                        {doc.signedUrl ? (
                          <>
                            <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              제출완료
                            </span>
                            <a
                              href={doc.signedUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="shrink-0 text-[11px] font-medium text-blue-900 hover:underline"
                            >
                              열기
                            </a>
                          </>
                        ) : (
                          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                            열람 불가
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1.5 text-xs text-gray-400">현재 제출된 문서가 없습니다.</p>
                )}
              </div>

              {/* 허가증 (진행 단계 "허가 완료" 첨부파일 — 기존 permitFileUrl/permitFileName 재사용, 새 계산 없음) */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400">허가증</p>
                {permitFileUrl ? (
                  <div className="mt-1.5 flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                      <Paperclip size={14} className="text-blue-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-gray-800">
                        {permitFileName ?? "허가증 파일"}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      제출완료
                    </span>
                    <a
                      href={permitFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-[11px] font-medium text-blue-900 hover:underline"
                    >
                      열기
                    </a>
                  </div>
                ) : (
                  <p className="mt-1.5 text-xs text-gray-400">현재 제출된 문서가 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 6. 담당자 정보 */}
        <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-xs font-semibold text-gray-700">담당자 정보</p>
          <div className="mt-2 flex items-start gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-xs text-gray-600">
            <Info size={14} className="mt-0.5 shrink-0 text-gray-400" />
            현재 실시간 자동 배정 시스템이 없어 개별 담당자가 DB에 기록되지
            않습니다. 이 리드는 어드민 화면에서 상담원이 직접 확인·대응하는
            방식으로 운영됩니다.
          </div>
        </div>

        {/* 7, 9. 전문가 메모(좌) + 활동 타임라인(우) — PC(lg 이상) 2열, 모바일 1열 */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* 7. 전문가 메모 */}
          <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <p className="text-xs font-semibold text-gray-700">전문가 메모</p>
            {memoActivities.length === 0 ? (
              <p className="mt-2 text-xs text-gray-400">작성된 메모가 없습니다.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {[...memoActivities].reverse().map((m) => (
                  <div key={m.id} className="rounded-xl bg-gray-50 px-3 py-2.5">
                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {(asMeta(m.meta)?.memo as string | undefined) ?? ""}
                    </p>
                    <p className="mt-1 text-[11px] text-gray-400">
                      {new Date(m.created_at).toLocaleString("ko-KR")}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <form action={addExpertMemo} className="mt-3 space-y-2">
              <input type="hidden" name="leadId" value={lead.id} />
              <textarea
                name="memo"
                required
                rows={2}
                placeholder="상담 내용, 특이사항 등을 기록하세요"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-900 focus:outline-none resize-none"
              />
              <button
                type="submit"
                className="rounded-full bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-950 transition-colors"
              >
                메모 저장
              </button>
            </form>
          </div>

          {/* 9. crm_activities 타임라인 */}
          <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <p className="text-xs font-semibold text-gray-700">활동 타임라인</p>
            <div className="mt-2 space-y-2">
              {activities.length === 0 && (
                <p className="text-xs text-gray-400">기록된 활동이 없습니다.</p>
              )}
              {activities.map((a) => (
                <div key={a.id} className="flex items-start gap-2.5 rounded-xl bg-gray-50 px-3 py-2.5">
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${getActivityDotColor(a.action)}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-800">
                      {getActivityLabel(a.action)}
                      {a.tag && <span className="ml-1.5 font-normal text-gray-400">· {a.tag}</span>}
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      {new Date(a.created_at).toLocaleString("ko-KR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 8. Case Room 전문가 상담 요청 (STEP8) — 내용 무변경, 기존 위치(담당자정보 다음) 그대로 유지 */}
        <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-xs font-semibold text-gray-700">전문가 상담 요청 (Case Room)</p>
          {consultationRequests.length === 0 ? (
            <p className="mt-2 text-xs text-gray-400">접수된 상담 요청이 없습니다.</p>
          ) : (
            <div className="mt-2 space-y-3">
              {[...consultationRequests].reverse().map((req) => {
                const response = findResponseFor(req.id);
                return (
                  <div key={req.id} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-gray-500">고객 문의</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          response ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {response ? "답변 완료" : "미답변"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {(asMeta(req.meta)?.content as string | undefined) ?? ""}
                    </p>
                    <p className="mt-1 text-[11px] text-gray-400">
                      {new Date(req.created_at).toLocaleString("ko-KR")}
                    </p>

                    {response ? (
                      <div className="mt-2 rounded-lg bg-blue-50 px-3 py-2">
                        <p className="text-[11px] font-semibold text-blue-900">VFBCAI 전문가 답변</p>
                        <p className="mt-1 text-xs text-blue-900 leading-relaxed whitespace-pre-wrap">
                          {(asMeta(response.meta)?.content as string | undefined) ?? ""}
                        </p>
                        <p className="mt-1 text-[10px] text-blue-700">
                          담당자: VFBCAI 담당 전문가 · 답변 시간:{" "}
                          {new Date(response.created_at).toLocaleString("ko-KR")}
                        </p>
                      </div>
                    ) : (
                      <form action={respondToConsultation} className="mt-2 space-y-2">
                        <input type="hidden" name="leadId" value={lead.id} />
                        <input type="hidden" name="requestActivityId" value={req.id} />
                        <textarea
                          name="content"
                          required
                          rows={3}
                          placeholder="답변을 입력하세요"
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:border-blue-900 focus:outline-none resize-none"
                        />
                        <button
                          type="submit"
                          className="rounded-full bg-blue-900 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-950 transition-colors"
                        >
                          답변 등록
                        </button>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
