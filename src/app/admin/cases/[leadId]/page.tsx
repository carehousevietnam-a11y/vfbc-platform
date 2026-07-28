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
  User,
  FileText,
  MapPin,
  ShieldCheck,
  Home,
  ClipboardList,
  FolderOpen,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Download,
  MoreVertical,
  Menu,
  Bell,
  ChevronRight,
  Clock3,
  ExternalLink,
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
    <main className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <div className="min-h-screen lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
        <aside className="hidden min-h-screen bg-[#0d2340] text-white lg:flex lg:flex-col">
          <div className="flex h-20 items-center gap-2 border-b border-white/10 px-6">
            <ShieldCheck size={24} className="text-white" />
            <span className="text-lg font-extrabold tracking-tight">VFBCAI 관리자</span>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-5 text-sm">
            <Link href="/admin" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-300 hover:bg-white/10 hover:text-white">
              <Home size={17} /> 대시보드
            </Link>
            <div className="rounded-xl bg-white/10">
              <div className="flex items-center justify-between px-3 py-2.5 font-semibold">
                <span className="flex items-center gap-3"><ClipboardList size={17} /> 신청건 관리</span>
                <ChevronDown size={15} />
              </div>
              <div className="border-l border-white/15 pb-2 pl-5 text-[13px] text-slate-300">
                <Link href="/admin/cases" className="block rounded-lg bg-white/10 px-3 py-2 font-semibold text-white">전체 신청건</Link>
                <span className="block px-3 py-2">미확인 문서</span>
                <span className="block px-3 py-2">보완 요청</span>
                <span className="block px-3 py-2">긴급 건</span>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-300"><FolderOpen size={17} /> 문서 관리 <ChevronDown size={15} className="ml-auto" /></div>
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-300"><Users size={17} /> 직원 관리 <ChevronDown size={15} className="ml-auto" /></div>
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-300"><BarChart3 size={17} /> 통계 및 리포트 <ChevronDown size={15} className="ml-auto" /></div>
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-300"><Settings size={17} /> 설정</div>
          </nav>
          <div className="border-t border-white/10 px-5 py-5">
            <div className="flex items-center gap-3 text-sm text-slate-300"><LogOut size={17} /> 로그아웃</div>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
            <Menu size={22} />
            <div className="flex items-center gap-2 font-extrabold"><ShieldCheck size={21} className="text-blue-700" /> VFBCAI 관리자</div>
            <Bell size={20} />
          </div>

          <div className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-7 lg:py-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Link href="/admin/cases" className="hover:text-slate-700">신청건 관리</Link>
                  <ChevronRight size={13} />
                  <span>신청건 상세</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-extrabold tracking-tight">신청건 상세</h1>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${categoryInfo.badgeColor}`}>{serviceLabel}</span>
                </div>
              </div>
              <Link href="/admin/cases" className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
                <ArrowLeft size={14} /> 목록으로 돌아가기
              </Link>
            </div>

            <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="grid gap-0 xl:grid-cols-[1.1fr_1fr_0.8fr_1.1fr] xl:divide-x xl:divide-slate-100">
                <div className="flex gap-4 p-5 sm:p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700"><User size={24} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-slate-400">고객명</p>
                    <p className="mt-0.5 text-lg font-extrabold">{lead.name}</p>
                    <div className="mt-4 space-y-2 text-xs">
                      <div><span className="block text-slate-400">연락처</span><span className="font-semibold">{lead.phone ?? "-"}</span></div>
                      <div><span className="block text-slate-400">이메일</span><span className="break-all font-semibold">{lead.email ?? "-"}</span></div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-100 p-5 xl:border-t-0 xl:p-6">
                  <p className="text-[11px] text-slate-400">서비스</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2"><span className="font-bold">{serviceLabel}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${categoryInfo.badgeColor}`}>{categoryInfo.label}</span></div>
                  <p className="mt-5 text-[11px] text-slate-400">현재 단계</p>
                  <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{currentStageLabel}</span>
                  <p className="mt-5 text-[11px] text-slate-400">담당 직원</p>
                  <div className="mt-1 flex items-center gap-2 text-xs font-semibold"><User size={14} /> VFBCAI 담당자</div>
                </div>
                <div className="border-t border-slate-100 p-5 xl:border-t-0 xl:p-6">
                  <p className="text-[11px] text-slate-400">접수일</p>
                  <p className="mt-1 text-xs font-semibold">{new Date(lead.created_at).toLocaleString("ko-KR")}</p>
                  <p className="mt-5 text-[11px] text-slate-400">마지막 활동</p>
                  <p className="mt-1 text-xs font-semibold">{activities.length > 0 ? new Date(activities[activities.length - 1].created_at).toLocaleString("ko-KR") : "-"}</p>
                </div>
                <div className="border-t border-slate-100 p-4 xl:border-t-0 xl:p-5">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-slate-50 p-3"><div className="flex items-center gap-2 text-slate-500"><FileText size={14} /> 제출 문서</div><p className="mt-1 text-lg font-extrabold">{customerDocuments.length}</p></div>
                    <div className="rounded-xl bg-red-50 p-3"><div className="flex items-center gap-2 text-red-600"><AlertTriangle size={14} /> 미확인 문서</div><p className="mt-1 text-lg font-extrabold text-red-600">-</p></div>
                    <div className="rounded-xl bg-amber-50 p-3"><div className="flex items-center gap-2 text-amber-700"><Paperclip size={14} /> 보완 요청</div><p className="mt-1 text-lg font-extrabold text-amber-700">-</p></div>
                    <div className="rounded-xl bg-blue-50 p-3"><div className="flex items-center gap-2 text-blue-700"><ShieldCheck size={14} /> AI 점수</div><p className="mt-1 text-lg font-extrabold text-blue-800">{typeof activeScore === "number" ? activeScore : "-"}</p></div>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(360px,1fr)]">
              <div className="space-y-5">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between"><h2 className="text-base font-extrabold">진행 단계</h2><span className="text-xs font-semibold text-slate-400">{currentStageLabel}</span></div>
                  <div className="mt-5 flex overflow-x-auto pb-2">
                    {processSteps.map((step, i) => {
                      const isNextStep = i === nextStepIndex;
                      return (
                        <div key={step.label} className="relative min-w-[120px] flex-1 px-1 text-center">
                          {i > 0 && <div className={`absolute left-[-50%] right-[50%] top-4 h-px ${step.done ? "bg-emerald-300" : "bg-slate-200"}`} />}
                          <div className={`relative z-10 mx-auto flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${step.done ? "border-emerald-300 bg-emerald-100 text-emerald-700" : isNextStep ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-500"}`}>
                            {step.done ? <CheckCircle2 size={15} /> : i + 1}
                          </div>
                          <p className={`mt-2 text-xs font-bold ${isNextStep ? "text-blue-700" : step.done ? "text-emerald-700" : "text-slate-600"}`}>{step.label}</p>
                        </div>
                      );
                    })}
                  </div>
                  {nextStep && <form action={setProcessStage} className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-blue-50 p-3">
                    <input type="hidden" name="leadId" value={lead.id} />
                    <input type="hidden" name="stageAction" value={nextStep.settableAction ?? ""} />
                    {nextStep.settableAction === "process_permit_completed" && <input type="file" name="permitFile" className="text-xs" />}
                    <span className="mr-auto text-xs font-semibold text-blue-900">다음 단계: {nextStep.label}</span>
                    <button type="submit" className="rounded-lg border border-blue-600 bg-white px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100">다음 단계로 변경</button>
                  </form>}
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                    <h2 className="text-base font-extrabold">고객 제출 문서</h2>
                    <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold">전체 문서 <ChevronDown size={13} className="ml-1 inline" /></span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-xs">
                      <thead className="bg-slate-50 text-[11px] text-slate-500"><tr><th className="px-5 py-3">문서명</th><th className="px-3 py-3">파일명</th><th className="px-3 py-3">구분</th><th className="px-3 py-3">제출일</th><th className="px-3 py-3">상태</th><th className="px-3 py-3">작업</th></tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {questionStageSubmittedDocument && <tr><td className="px-5 py-3 font-semibold"><FileText size={14} className="mr-2 inline text-blue-600" />{questionStageSubmittedDocument.documentType ?? "질문 단계 제출 자료"}</td><td className="px-3 py-3">{questionStageSubmittedDocument.fileName ?? "-"}</td><td className="px-3 py-3"><span className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700">질문 단계 제출</span></td><td className="px-3 py-3">-</td><td className="px-3 py-3"><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">확인 완료</span></td><td className="px-3 py-3">-</td></tr>}
                        {fileUrl && <tr><td className="px-5 py-3 font-semibold"><FileText size={14} className="mr-2 inline text-red-500" />첨부 서류</td><td className="px-3 py-3">{fileName ?? "첨부파일"}</td><td className="px-3 py-3"><span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">고객 추가 제출</span></td><td className="px-3 py-3">-</td><td className="px-3 py-3"><span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">미확인</span></td><td className="px-3 py-3"><a href={fileUrl} target="_blank" rel="noreferrer" className="rounded-md border px-3 py-1.5 font-semibold hover:bg-slate-50">열기</a></td></tr>}
                        {customerDocuments.map((doc) => <tr key={doc.id}><td className="px-5 py-3 font-semibold"><FileText size={14} className="mr-2 inline text-blue-600" />{doc.tag ?? "문서"}</td><td className="px-3 py-3">{doc.fileName ?? "-"}</td><td className="px-3 py-3"><span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">고객 추가 제출</span></td><td className="px-3 py-3">{new Date(doc.createdAt).toLocaleString("ko-KR")}</td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${doc.signedUrl ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{doc.signedUrl ? "확인 완료" : "열람 불가"}</span></td><td className="px-3 py-3">{doc.signedUrl ? <a href={doc.signedUrl} target="_blank" rel="noreferrer" className="rounded-md border px-3 py-1.5 font-semibold hover:bg-slate-50">열기</a> : "-"}<MoreVertical size={15} className="ml-2 inline text-slate-400" /></td></tr>)}
                        {permitFileUrl && <tr><td className="px-5 py-3 font-semibold"><FileText size={14} className="mr-2 inline text-red-500" />허가증</td><td className="px-3 py-3">{permitFileName ?? "허가증 파일"}</td><td className="px-3 py-3"><span className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700">결과 문서</span></td><td className="px-3 py-3">-</td><td className="px-3 py-3"><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">확인 완료</span></td><td className="px-3 py-3"><a href={permitFileUrl} target="_blank" rel="noreferrer" className="rounded-md border px-3 py-1.5 font-semibold">열기</a></td></tr>}
                      </tbody>
                    </table>
                  </div>
                  <div className="border-t border-slate-100 px-5 py-3"><button className="inline-flex items-center gap-2 text-xs font-bold text-blue-700"><Download size={14} /> 모든 문서 다운로드</button></div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3"><h2 className="text-base font-extrabold">AI 진단 결과</h2><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">진단 완료</span></div>
                  <div className="mt-4 grid gap-3 md:grid-cols-[1.3fr_repeat(3,1fr)]">
                    <div className="border-r border-slate-100 pr-4"><p className="text-xs text-slate-400">종합 결과</p><p className="mt-1 text-2xl font-extrabold text-emerald-700">{resultInfo?.label ?? "진단 결과 없음"}</p><p className="mt-1 text-xs text-slate-500">입력값 기준 AI 진단 결과입니다.</p></div>
                    <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] text-slate-400">가능성 점수</p><p className="mt-1 text-xl font-extrabold">{typeof activeScore === "number" ? activeScore : "-"}<span className="text-xs font-semibold text-slate-500">/100</span></p></div>
                    <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] text-slate-400">위험도</p><p className="mt-1 text-lg font-extrabold text-amber-600">{riskInfo?.label ?? "-"}</p></div>
                    <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] text-slate-400">현재 단계</p><p className="mt-1 text-sm font-extrabold">{currentStageLabel}</p></div>
                  </div>
                  <div className="mt-4 grid gap-5 border-t border-slate-100 pt-4 md:grid-cols-2">
                    <div><h3 className="text-xs font-extrabold">주요 위험 요인</h3><ul className="mt-2 space-y-1.5 text-xs text-slate-600">{(activeBrief?.rejectionRisks ?? []).map((r, i) => <li key={i}>• {r.reason}</li>)}</ul></div>
                    <div><h3 className="text-xs font-extrabold">권장 조치</h3><ul className="mt-2 space-y-1.5 text-xs text-slate-600">{(activeBrief?.recommendedSteps ?? []).map((s, i) => <li key={i}>• {s}</li>)}</ul></div>
                  </div>
                </section>
              </div>

              <div className="space-y-5">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-base font-extrabold">고객 기본 정보</h2><div className="mt-4 space-y-3 text-xs"><div className="flex justify-between"><span className="text-slate-400">고객 구분</span><span className="font-semibold">개인</span></div><div className="flex justify-between"><span className="text-slate-400">연락처</span><span className="font-semibold">{lead.phone ?? "-"}</span></div><div className="flex justify-between gap-4"><span className="text-slate-400">이메일</span><span className="break-all text-right font-semibold">{lead.email ?? "-"}</span></div><div className="flex justify-between"><span className="text-slate-400">접수일</span><span className="font-semibold">{new Date(lead.created_at).toLocaleDateString("ko-KR")}</span></div></div></section>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-base font-extrabold">담당자 정보</h2><button className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-700">담당자 변경</button></div><div className="mt-4 space-y-3 text-xs"><div className="flex justify-between"><span className="text-slate-400">담당 직원</span><span className="font-bold text-blue-700">VFBCAI 담당자</span></div><div className="flex justify-between"><span className="text-slate-400">소속 팀</span><span className="font-semibold">행정전문팀</span></div><div className="flex justify-between"><span className="text-slate-400">배정일</span><span className="font-semibold">-</span></div></div></section>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-base font-extrabold">내부 메모</h2><span className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-700">메모 작성</span></div>{memoActivities.length > 0 && <div className="mt-3 space-y-2">{[...memoActivities].reverse().map(m => <div key={m.id} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs"><p className="whitespace-pre-wrap">{(asMeta(m.meta)?.memo as string | undefined) ?? ""}</p><p className="mt-2 text-[10px] text-slate-400">{new Date(m.created_at).toLocaleString("ko-KR")}</p></div>)}</div>}<form action={addExpertMemo} className="mt-3"><input type="hidden" name="leadId" value={lead.id} /><textarea name="memo" required rows={3} placeholder="고객 및 업무 관련 메모를 작성하세요" className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-blue-500" /><button className="mt-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white">메모 저장</button></form></section>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-base font-extrabold">타 기관 거절 이력</h2>{rejections.length === 0 ? <p className="mt-3 text-xs text-slate-400">연결된 거절이력이 없습니다.</p> : <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-100">{rejections.map(r => <div key={r.id} className="p-3 text-xs"><div className="flex items-center justify-between"><span className="font-bold">{getServiceLabel(r.service_type)}</span><span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600">거절</span></div><p className="mt-1 text-slate-500">{r.reason || "사유 미기재"}</p></div>)}</div>}</section>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-base font-extrabold">활동 타임라인</h2><div className="relative mt-4"><div className="absolute bottom-1 left-[5px] top-1 w-px bg-slate-200" /><div className="space-y-3">{activities.slice(-6).reverse().map(a => <div key={a.id} className="relative grid grid-cols-[12px_98px_1fr] items-start gap-2 text-[11px]"><span className={`mt-1 h-2.5 w-2.5 rounded-full ring-2 ring-white ${getActivityDotColor(a.action)}`} /><span className="text-slate-400">{new Date(a.created_at).toLocaleString("ko-KR")}</span><div><p className="font-bold text-blue-700">{getActivityLabel(a.action)}</p><p className="mt-0.5 text-slate-500">{a.tag ?? "활동 기록"}</p></div></div>)}</div></div></section>
              </div>
            </div>

            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-extrabold">전문가 상담 요청 (Case Room)</h2>
              {consultationRequests.length === 0 ? <p className="mt-3 text-xs text-slate-400">접수된 상담 요청이 없습니다.</p> : <div className="mt-3 space-y-3">{[...consultationRequests].reverse().map(req => { const response=findResponseFor(req.id); return <div key={req.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs"><div className="flex justify-between"><span className="font-bold">고객 문의</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${response ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{response ? "답변 완료" : "미답변"}</span></div><p className="mt-2 whitespace-pre-wrap">{(asMeta(req.meta)?.content as string | undefined) ?? ""}</p>{response ? <div className="mt-3 rounded-lg bg-blue-50 p-3 text-blue-900"><p className="font-bold">VFBCAI 전문가 답변</p><p className="mt-1 whitespace-pre-wrap">{(asMeta(response.meta)?.content as string | undefined) ?? ""}</p></div> : <form action={respondToConsultation} className="mt-3"><input type="hidden" name="leadId" value={lead.id} /><input type="hidden" name="requestActivityId" value={req.id} /><textarea name="content" required rows={3} className="w-full rounded-lg border border-slate-200 bg-white p-3" placeholder="답변을 입력하세요" /><button className="mt-2 rounded-lg bg-blue-700 px-4 py-2 font-bold text-white">답변 등록</button></form>}</div>})}</div>}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
