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
  CheckCircle,
  Paperclip,
  Info,
  User,
  FileText,
  MapPin,
  ShieldCheck,
  Home,
  Inbox,
  FolderOpen,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  Menu,
  Download,
  FileWarning,
  MessageSquareText,
  UserCheck,
  Mail,
  Building2,
  ListChecks,
} from "lucide-react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { notifyStageChange, type StageChangeAction } from "@/lib/notify/stageChange";
import { saveConsultationResponse } from "@/lib/caseMessages";
import { notifyConsultationResponse } from "@/lib/notify/consultationResponse";
import { getRequiredDocuments } from "@/lib/requiredDocuments";
import ExecutivePdfButton from "./ExecutivePdfButton";

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
// "고객 요청" 카드(CHECK 공통)의 번호 매기기 전용 — 새 데이터 아님, 표시용 상수.
const WP_CIRCLED_NUMBERS = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"];

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

  const latestActivity = activities.length > 0 ? activities[activities.length - 1] : null;

  const requiredDocumentLabels: Record<string, string[]> = {
    trc: ["여권 사본", "사업자등록증 사본", "재직증명서 또는 근로계약서", "위임장", "임시거주신고 확인서"],
    wp: ["여권 사본", "건강검진서", "범죄경력증명서", "경력증명서", "학력증명서", "고용계약서"],
    tamtru: ["여권 사본", "비자 또는 거주증", "임대차계약서", "거주지 확인서"],
    "driving-license": ["여권 사본", "비자 또는 거주증", "외국 운전면허증", "번역 공증본", "건강진단서"],
    verify_admin: ["검토 대상 행정문서", "신분증 또는 여권", "관련 계약서", "기존 제출 자료", "거절·보완 통지서"],
  };
  const requiredDocuments = requiredDocumentLabels[serviceType] ?? ["신청서", "여권 사본", "관련 증빙서류", "위임장", "추가 요청서류"];
  const documentEvidence = [
    questionStageSubmittedDocument?.documentType,
    questionStageSubmittedDocument?.fileName,
    fileName,
    ...customerDocuments.flatMap((doc) => [doc.tag, doc.fileName]),
    permitFileName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, "");
  const isRequiredDocumentSubmitted = (label: string) => {
    const keys = label
      .replace(/또는/g, " ")
      .replace(/[()·/]/g, " ")
      .split(/\s+/)
      .filter((key) => key.length >= 2);
    return keys.some((key) => documentEvidence.includes(key.toLowerCase().replace(/\s+/g, "")));
  };
  const submittedRequiredCount = requiredDocuments.filter(isRequiredDocumentSubmitted).length;

  // ══════════════════════════════════════════════════════════════════════
  // AI Review Workspace (CHECK 공통, 신규 — TRC/WP/Tamtru/Driving License 4개
  // 서비스가 전부 이 블록을 공유한다. VERIFY/REGISTER는 이 블록의 영향을
  // 받지 않는다(카테고리가 "check"가 아니므로 isCheckWorkspace=false). 위에서
  // 이미 쓰이고 있는 requiredDocuments / isRequiredDocumentSubmitted(로컬
  // 하드코딩 목록, 퍼지 매칭)는 다른 섹션이 계속 사용하므로 그대로 두고
  // 절대 수정하지 않았다. 아래는 전부 새 변수다.
  //
  // 필수서류 목록: getRequiredDocuments(serviceType) — 서비스별로 그대로
  // 재사용(무수정). 문서명을 여기서 하드코딩하지 않는다 — 실제 반환된
  // documents/optionalDocuments 배열만 쓴다.
  // 접수 여부: src/app/documents/page.tsx의 업로드 로직을 그대로 근거로
  // 삼는다 — 그 페이지는 crm_activities.tag에 정확히 getRequiredDocuments()
  // 라벨 문자열을 저장하므로(퍼지 매칭 아님), 여기서도 정확히 일치하는
  // tag만 "제출됨"으로 인정한다.
  // ══════════════════════════════════════════════════════════════════════
  const isCheckWorkspace = category === "check";
  const wpRequiredDocs = getRequiredDocuments(serviceType);
  const wpMandatoryLabels = wpRequiredDocs.documents;
  const wpOptionalLabels = wpRequiredDocs.optionalDocuments ?? [];
  const wpAllLabels = [...wpMandatoryLabels, ...wpOptionalLabels];

  // 준비 구분(한국/베트남/회사/확인 필요) — CHECK 4개 서비스가
  // getRequiredDocuments()로 실제 반환하는 문서명만 대상으로 한 표시 전용
  // 매핑이다. requiredDocuments.ts는 건드리지 않았고, 거기 없는 서류를
  // 새로 추가하지도 않았다. 확실하게 분류할 수 없는 항목은 전부
  // "확인 필요"로 둔다(임의 추정 금지) — 매핑에 없는 라벨(예: 향후
  // requiredDocuments.ts가 바뀌어 새 문서명이 추가되는 경우)도 아래
  // fallback으로 자동으로 "확인 필요"가 된다.
  const CHECK_DOCUMENT_ORIGIN: Record<string, "한국" | "베트남" | "회사" | "확인 필요"> = {
    // WP
    학력증명서: "한국",
    범죄경력증명서: "한국",
    건강진단서: "베트남",
    "재직·경력 관련 자료": "회사",
    "기존 노동허가·보완·반려 관련 자료": "확인 필요",
    // TRC
    비자: "확인 필요",
    재직증명서: "회사",
    회사서류: "회사",
    "주소지 관련 자료": "베트남",
    "기존 거주증·보완·반려 관련 자료": "확인 필요",
    // 땀주(Tam Tru)
    임대차계약서: "베트남",
    "주소지 증빙": "베트남",
    "집주인 또는 관리사무소 관련 자료": "베트남",
    "기존 등록·보완·반려 관련 자료": "확인 필요",
    // 운전면허(Driving License)
    "거주증(TRC)": "확인 필요",
    "본국 운전면허": "한국",
    번역공증본: "한국",
    "면허 앞·뒷면 추가 사진": "확인 필요",
    "기존 전환 신청·보완·반려 관련 자료": "확인 필요",
    // 공통
    여권: "확인 필요",
    "기타 관련 자료": "확인 필요",
  };

  const wpDocRows = wpAllLabels.map((label) => {
    const upload = customerDocuments.find((doc) => doc.tag === label) ?? null;
    return {
      label,
      mandatory: wpMandatoryLabels.includes(label),
      submitted: Boolean(upload),
      fileName: upload?.fileName ?? null,
      signedUrl: upload?.signedUrl ?? null,
      origin: CHECK_DOCUMENT_ORIGIN[label] ?? "확인 필요",
    };
  });
  const wpMissingMandatory = wpDocRows.filter((d) => d.mandatory && !d.submitted);
  const wpSubmittedMandatoryCount = wpDocRows.filter((d) => d.mandatory && d.submitted).length;
  const wpMissingByOrigin = {
    한국: wpMissingMandatory.filter((d) => d.origin === "한국").length,
    베트남: wpMissingMandatory.filter((d) => d.origin === "베트남").length,
    회사: wpMissingMandatory.filter((d) => d.origin === "회사").length,
    확인필요: wpMissingMandatory.filter((d) => d.origin === "확인 필요").length,
  };

  // AI 검토 — 실제 파일 내용은 분석하지 않으므로(OCR 없음) "사용 가능" 판정은
  // 이 로직에서 절대 자동으로 내리지 않는다(적정성 판단 금지 원칙). 준비국가별로
  // 어떤 확인이 우선 필요한지만 안내한다 — 한국 발급 서류는 번역·공증·영사확인
  // 이슈가 흔해 "형식 확인 필요", 베트남·회사 서류는 "행정 확인 필요", 준비
  // 주체가 불분명한 서류는 "전문가 확인 필요"로 넘긴다.
  function wpAiReview(row: (typeof wpDocRows)[number]): string {
    if (!row.submitted) return "-";
    if (row.origin === "한국") return "형식 확인 필요";
    if (row.origin === "확인 필요") return "전문가 확인 필요";
    return "행정 확인 필요"; // 베트남, 회사
  }
  function wpNextAction(row: (typeof wpDocRows)[number]): string {
    if (!row.submitted) {
      if (!row.mandatory) return "-";
      if (row.origin === "베트남") return "현지 준비";
      if (row.origin === "회사") return "회사 자료 요청";
      return "고객 요청"; // 한국, 확인 필요
    }
    if (row.origin === "한국") return "형식 확인";
    return "전문가 검토"; // 베트남, 회사, 확인 필요
  }

  // 신청 유형 — 우선순위: 전문가 진행 요청 > 전문가 검토 요청 > AI 리포트 요청(실제
  // /documents 업로드에 남는 meta.mode === "ai_report") > 그 외(후속 선택 기록 없음).
  // 전부 이미 코드베이스에 존재하는 실제 action/mode 값만 사용했다(새로 만들지 않음).
  // 진단(diagnosis) action 존재 여부는 "후속 서비스를 실제로 선택했다"는 근거가
  // 아니므로 더 이상 이 판단에 쓰지 않는다.
  const wpActionSet = new Set(activities.map((a) => a.action));
  const wpAiReportRequested = activities.some(
    (a) => a.action === "document_upload" && asMeta(a.meta)?.service === serviceType && asMeta(a.meta)?.mode === "ai_report"
  );
  const wpApplicationType: string = wpActionSet.has("agency_upgrade_request")
    ? "전문가 진행"
    : wpActionSet.has("expert_review_request")
      ? "전문가 검토"
      : wpAiReportRequested
        ? "AI 리포트"
        : "후속 서비스 선택 기록 없음";

  // expertBrief 재사용(신규 위험/신규 판단 생성 없음) — activeBrief는 위에서 이미 계산된 값.
  const wpCheckedItems = activeBrief?.checkedItems ?? [];
  const wpFailedItems = wpCheckedItems.filter((c) => !c.passed);
  const wpRejectionRisks = activeBrief?.rejectionRisks ? [...activeBrief.rejectionRisks].sort((a, b) => a.rank - b.rank) : [];
  const wpRecommendedSteps = activeBrief?.recommendedSteps ?? [];

  // 최우선 조치 정보는 이제 Executive Summary 문장(wpExecutiveSummaryText)이
  // 같은 데이터로 이미 전달하므로 별도 변수를 두지 않는다(중복 제거).

  // "고객 요청" 카드(AI 진단 결과 카드 하단 좌측)용 — 실제 미제출 필수서류만,
  // 고객에게 바로 전달 가능한 문장으로 변환한다.
  const wpCustomerRequestItems: string[] = wpMissingMandatory.map((d) => `${d.label} 제출`);

  // "전문가 확인" 카드(AI 진단 결과 카드 하단 우측)용 — expertBrief의 반려위험
  // 사유 → 미충족 확인항목 → 권장조치 순으로, 전문가 전용 판단 근거만 모은다
  // (미제출 서류 요청은 고객 요청 카드에서만 다뤄 중복시키지 않는다).
  const wpExpertConfirmAll: string[] = [
    ...wpRejectionRisks.map((r) => r.reason),
    ...wpFailedItems.map((c) => c.label),
    ...wpRecommendedSteps,
  ];
  const wpExpertConfirmItems = wpExpertConfirmAll.slice(0, 6);

  // Executive Summary(카드 상단) — 실제 계산값(미제출/누락구분/전문가확인 건수)만
  // 조합한 문장이다. 새 AI 판단이 아니라 기존 숫자를 문장으로 풀어쓴 것이다.
  const wpDecisionLabel: string =
    wpMissingMandatory.length > 0 ? "보완 필요" : wpExpertConfirmAll.length > 0 ? "전문가 확인 필요" : "진행 가능";
  // "다음 조치" 한 줄 요약과 AI 종합 판단 색상 — 전부 이미 계산된 값(미제출/
  // 전문가확인 건수)만으로 분기하며, 새 판단을 만들지 않는다.
  // "다음 조치" 요약은 이제 wpDecisionDetailLines의 마지막 문장이 같은
  // 역할을 하므로 별도 변수를 두지 않는다(중복 제거, UI 표시 위치만 통합됨).
  const wpDecisionTone =
    wpDecisionLabel === "보완 필요"
      ? { bg: "bg-amber-50", label: "text-amber-700", value: "text-amber-800" }
      : wpDecisionLabel === "전문가 확인 필요"
        ? { bg: "bg-violet-50", label: "text-violet-700", value: "text-violet-800" }
        : { bg: "bg-emerald-50", label: "text-emerald-700", value: "text-emerald-800" };
  const WpDecisionIcon =
    wpDecisionLabel === "보완 필요" ? AlertTriangle : wpDecisionLabel === "전문가 확인 필요" ? ShieldCheck : CheckCircle;

  // AI 종합판단 배너용 Action 중심 안내 문장 2줄 — 전부 이미 계산된 값만
  // 조합한다(새 판단/새 AI 생성 없음).
  const wpDecisionDetailLines: string[] = [];
  if (wpMissingMandatory.length > 0) wpDecisionDetailLines.push(`필수서류 ${wpMissingMandatory.length}건이 누락되었습니다.`);
  if (wpExpertConfirmAll.length > 0) wpDecisionDetailLines.push(`전문가 확인이 ${wpExpertConfirmAll.length}건 필요합니다.`);
  if (wpMissingMandatory.length > 0) {
    wpDecisionDetailLines.push("고객에게 부족한 서류를 먼저 요청하십시오.");
  } else if (wpExpertConfirmAll.length > 0) {
    wpDecisionDetailLines.push("전문가 확인을 진행하십시오.");
  } else {
    wpDecisionDetailLines.push("현재 확인된 보완사항이 없습니다.");
  }

  // 주요 위험요인 영역의 확인완료/확인필요 구분 — rejectionRisks가 비어 있을
  // 때만 쓰는 보강용 목록이다(있으면 기존처럼 rejectionRisks를 그대로 보여줌).
  // checkedItems(충족/미충족)와 서류 준비구분에서 실제로 확인되는 것만 넣는다.
  const wpRiskConfirmedItems: string[] = [];
  if (wpMissingMandatory.length === 0) wpRiskConfirmedItems.push("제출 서류 확인");
  wpCheckedItems.filter((c) => c.passed).forEach((c) => wpRiskConfirmedItems.push(c.label));
  const wpRiskPendingItems: string[] = [];
  if (wpDocRows.some((d) => d.submitted && d.origin === "한국")) wpRiskPendingItems.push("형식 검토 필요");
  if (wpExpertConfirmAll.length > 0) wpRiskPendingItems.push("전문가 검토 필요");
  wpFailedItems.forEach((c) => wpRiskPendingItems.push(c.label));

  // 다음조치 문구 → Lucide 아이콘 매핑(item6) — 프로젝트에 이미 있는 아이콘만.
  function wpNextActionIcon(action: string) {
    if (action === "전문가 검토") return UserCheck;
    if (action === "고객 요청") return Mail;
    if (action === "회사 자료 요청") return Building2;
    return null;
  }

  // AI 종합 판단 영역은 이제 문장이 아니라 구조화된 타일로 표시하므로(아래
  // JSX), 별도 문단 텍스트 변수는 두지 않는다 — wpMissingByOrigin/
  // wpMissingMandatory/wpExpertConfirmAll을 타일에서 직접 사용한다.

  // Review Checklist(카드 하단, 관리자가 확인해야 하는 항목) — expertBrief와
  // 서류 준비구분에서 실제로 확인되는 항목만 넣는다. 데이터가 없는 항목(예:
  // 번역/공증/영사확인을 개별적으로 구분할 근거)은 만들지 않고, 대신 실제로
  // 아는 수준("형식·번역·공증·영사확인 확인")까지만 하나의 항목으로 안내한다.
  const wpFindingsChecklist: string[] = [];
  if (wpMissingMandatory.length > 0) wpFindingsChecklist.push("제출 서류 확인");
  if (wpDocRows.some((d) => d.submitted && d.origin === "한국")) wpFindingsChecklist.push("형식·번역·공증·영사확인 확인");
  if (wpDocRows.some((d) => d.submitted && d.origin === "회사")) wpFindingsChecklist.push("회사 확인");
  if (wpDocRows.some((d) => d.submitted && (d.origin === "베트남" || d.origin === "확인 필요"))) wpFindingsChecklist.push("행정 확인");
  wpFailedItems.forEach((c) => wpFindingsChecklist.push(c.label));
  wpRejectionRisks.forEach((r) => wpFindingsChecklist.push(r.reason));

  // 고객 제출 문서 표의 상태 배지 — 이진값(제출/미제출) 대신 "다음에 무엇을
  // 해야 하는지"를 바로 알 수 있게 4단계로 표시한다. 기존 색상 팔레트만
  // 재사용(emerald/blue/violet/amber, 전부 이 파일에 이미 있는 색).
  // 제출상태 — 실제 업로드 여부만 표시(준비구분·필수여부와 무관하게 사실만).
  function wpSubmissionBadge(row: (typeof wpDocRows)[number]): { label: string; className: string; dot: string } {
    if (row.submitted) {
      return { label: "제출 완료", className: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" };
    }
    if (!row.mandatory) {
      return { label: "선택 미제출", className: "bg-slate-100 text-slate-500", dot: "bg-slate-400" };
    }
    return { label: "미제출", className: "bg-amber-50 text-amber-700", dot: "bg-amber-500" };
  }

  // 검토상태 — "다음에 무엇을 해야 하는지"만 표시. 미제출 선택서류는 고객에게
  // 요청할 필수 항목이 아니므로 "-"로 둔다(선택서류 오판 방지). 제출된
  // 서류는 필수·선택 구분 없이 준비구분에 따라 동일하게 안내한다.
  function wpReviewBadge(row: (typeof wpDocRows)[number]): { label: string; className: string; dot: string } {
    if (!row.submitted) {
      if (!row.mandatory) {
        return { label: "-", className: "bg-slate-50 text-slate-400", dot: "bg-slate-300" };
      }
      return { label: "고객 요청", className: "bg-amber-50 text-amber-700", dot: "bg-amber-500" };
    }
    if (row.origin === "한국") {
      return { label: "형식 확인", className: "bg-blue-50 text-blue-700", dot: "bg-blue-500" };
    }
    if (row.origin === "확인 필요") {
      return { label: "전문가 확인", className: "bg-violet-50 text-violet-700", dot: "bg-violet-500" };
    }
    // 베트남, 회사
    return { label: "행정 확인", className: "bg-teal-50 text-teal-700", dot: "bg-teal-500" };
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4f7fb] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[196px] flex-col bg-[#102b4e] text-white xl:flex">
        <div className="flex h-[68px] items-center gap-2 border-b border-white/10 px-4"><ShieldCheck size={22}/><span className="text-[16px] font-bold">VFBCAI 관리자</span></div>
        <nav className="flex-1 space-y-1 px-3 py-2.5 text-[13px]">
          <Link href="/admin/cases" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-white/70 hover:bg-white/10 hover:text-white"><Home size={16}/>대시보드</Link>
          <div className="rounded-xl bg-white/[0.08] p-1"><div className="flex items-center justify-between rounded-lg bg-white/[0.10] px-3 py-2.5 font-semibold"><span className="flex items-center gap-2"><Inbox size={16}/>신청건 관리</span><ChevronDown size={14}/></div><div className="ml-5 mt-1 border-l border-white/15 py-1 pl-3 text-white/70"><Link href="/admin/cases" className="block rounded-md bg-white/10 px-3 py-2 font-semibold text-white">전체 신청건</Link><span title="전용 필터 페이지 준비 중" className="flex cursor-not-allowed items-center justify-between px-3 py-2 text-white/40">미확인 문서<span className="text-[10px]">준비중</span></span><span title="전용 필터 페이지 준비 중" className="flex cursor-not-allowed items-center justify-between px-3 py-2 text-white/40">보완 요청<span className="text-[10px]">준비중</span></span><span title="전용 필터 페이지 준비 중" className="flex cursor-not-allowed items-center justify-between px-3 py-2 text-white/40">긴급 건<span className="text-[10px]">준비중</span></span></div></div>
          <div title="관리자 문서관리 페이지 준비 중" className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2.5 text-white/40"><span className="flex items-center gap-2"><FolderOpen size={16}/>문서 관리</span><span className="text-[10px]">준비중</span></div><div title="직원관리 페이지 준비 중" className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2.5 text-white/40"><span className="flex items-center gap-2"><Users size={16}/>직원 관리</span><span className="text-[10px]">준비중</span></div><div title="통계 페이지 준비 중" className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2.5 text-white/40"><span className="flex items-center gap-2"><BarChart3 size={16}/>통계 및 리포트</span><span className="text-[10px]">준비중</span></div><Link href="/admin/rejections" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-white/70 hover:bg-white/10 hover:text-white"><Settings size={16}/>거절이력 관리</Link>
        </nav><div className="border-t border-white/10 p-4 text-[13px] text-white/70"><form action="/api/admin/logout" method="post"><button type="submit" className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left hover:bg-white/10 hover:text-white"><LogOut size={16}/>로그아웃</button></form></div>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white px-4 xl:hidden"><Menu size={21}/><div className="flex items-center gap-2 text-[16px] font-bold"><ShieldCheck size={18} className="text-blue-700"/>VFBCAI 관리자</div><Bell size={19}/></header>

      <div className="w-full xl:pl-[196px]">
        <div className="mx-auto w-full max-w-[1480px] px-5 py-5 sm:px-6 lg:px-8 lg:py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><div className="text-[11px] font-medium text-slate-400">신청건 관리　›　신청건 상세</div><div className="mt-2 flex flex-wrap items-center gap-2.5"><h1 className="text-[24px] font-extrabold tracking-tight sm:text-[28px]">신청건 상세</h1><span className={`rounded-full px-3 py-1 text-[11px] font-bold ${categoryInfo.badgeColor}`}>{categoryInfo.label}</span></div></div><div className="flex items-start gap-2"><ExecutivePdfButton leadId={lead.id} /><Link href="/admin/cases" className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[14px] font-semibold shadow-[0_1px_3px_rgba(15,23,42,0.05)]"><ArrowLeft size={14}/>목록으로 돌아가기</Link></div></div>

          <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
            <div className="grid lg:grid-cols-[1.22fr_1.02fr_.9fr_1.08fr] lg:divide-x lg:divide-slate-100">
              <div className="flex min-h-[152px] flex-col justify-center p-4"><div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700"><User size={18}/></div><div className="min-w-0 flex-1"><p className="text-[11px] font-semibold tracking-wide text-slate-400">고객명</p><p className="mt-1 text-[19px] font-extrabold leading-tight">{lead.name}</p><dl className="mt-2.5 space-y-1.5 text-[11px]"><div className="flex items-baseline justify-between gap-2"><dt className="shrink-0 text-slate-400">연락처</dt><dd className="truncate font-semibold">{lead.phone ?? "-"}</dd></div><div className="flex items-baseline justify-between gap-2"><dt className="shrink-0 text-slate-400">이메일</dt><dd className="min-w-0 truncate break-all font-semibold">{lead.email ?? "-"}</dd></div></dl></div></div></div>
              <div className="flex min-h-[152px] flex-col justify-center gap-3 border-t border-slate-100 p-4 lg:border-t-0"><div><p className="text-[11px] font-semibold tracking-wide text-slate-400">서비스</p><div className="mt-1.5 flex flex-wrap items-center gap-2"><span className="text-[14px] font-bold leading-tight">{serviceLabel}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${categoryInfo.badgeColor}`}>{categoryInfo.label}</span></div></div><div><p className="text-[11px] font-semibold tracking-wide text-slate-400">현재 단계</p><span className="mt-1.5 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">{currentStageLabel}</span></div><div><p className="text-[11px] font-semibold tracking-wide text-slate-400">담당 직원</p><div className="mt-1.5 flex items-center gap-1.5 text-[12px] font-semibold"><User size={12}/>VFBCAI 담당자</div></div></div>
              <div className="flex min-h-[152px] flex-col justify-center gap-3 border-t border-slate-100 p-4 lg:border-t-0"><div><dt className="text-[11px] font-semibold tracking-wide text-slate-400">접수일</dt><dd className="mt-1 text-[12px] font-semibold">{new Date(lead.created_at).toLocaleString("ko-KR")}</dd></div><div><dt className="text-[11px] font-semibold tracking-wide text-slate-400">마지막 활동</dt><dd className="mt-1 text-[12px] font-semibold">{latestActivity ? new Date(latestActivity.created_at).toLocaleString("ko-KR") : "-"}</dd></div></div>
              <div className="flex min-h-[152px] flex-col justify-center border-t border-slate-100 bg-slate-50/50 p-4 lg:border-t-0"><div className="grid grid-cols-2 gap-2"><div className="flex flex-col justify-center rounded-xl border border-slate-100 bg-white px-3 py-2.5"><p className="flex items-center gap-1.5 text-[11px] text-slate-500"><FileText size={12}/>제출 문서</p><p className="mt-1 text-[18px] font-extrabold leading-none">{isCheckWorkspace ? wpDocRows.filter((row) => row.mandatory && row.submitted).length : submittedRequiredCount}</p></div><div className="flex flex-col justify-center rounded-xl border border-red-100 bg-red-50 px-3 py-2.5"><p className="flex items-center gap-1.5 text-[11px] text-red-600"><FileWarning size={12}/>미제출 문서</p><p className="mt-1 text-[18px] font-extrabold leading-none text-red-600">{isCheckWorkspace ? wpMissingMandatory.length : requiredDocuments.length - submittedRequiredCount}</p></div><div className="flex flex-col justify-center rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5"><p className="flex items-center gap-1.5 text-[11px] text-amber-700"><Paperclip size={12}/>보완 요청</p><p className="mt-1 text-[18px] font-extrabold leading-none text-amber-700">{isCheckWorkspace ? wpDocRows.filter((row) => row.mandatory && row.submitted && wpAiReview(row) !== "-").length : "-"}</p></div><div className="flex flex-col justify-center rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5"><p className="flex items-center gap-1.5 text-[11px] text-blue-700"><ShieldCheck size={12}/>AI 점수</p><p className="mt-1 text-[18px] font-extrabold leading-none text-blue-800">{typeof activeScore === "number" ? activeScore : "-"}</p></div></div></div>
            </div>
          </section>

          <section className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.05)]"><div className="flex items-center justify-between"><h2 className="text-[14px] font-extrabold">진행 단계</h2><span className="text-[13px] font-semibold text-slate-400">{currentStageLabel}</span></div><div className="mt-4 flex items-start">{processSteps.map((step,i)=>{const isNextStep=i===nextStepIndex;return <div key={step.label} className="relative min-w-0 flex-1 text-center">{i>0&&<div className={`absolute right-1/2 top-[14px] h-[2px] w-full ${step.done?"bg-emerald-300":"bg-slate-200"}`}/>}<div className={`relative z-10 mx-auto flex h-6 w-6 items-center justify-center rounded-full border-2 text-[11px] font-extrabold ${step.done?"border-emerald-300 bg-emerald-50 text-emerald-700":isNextStep?"border-blue-600 bg-blue-600 text-white":"border-slate-200 bg-white text-slate-400"}`}>{step.done?<CheckCircle2 size={13}/>:i+1}</div><p className={`mt-1.5 truncate px-1 text-[10px] font-bold ${step.done?"text-emerald-700":isNextStep?"text-blue-700":"text-slate-500"}`}>{step.label}</p></div>})}</div>{nextStep&&<div className="mt-4 flex flex-col gap-2 rounded-xl bg-blue-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><strong className="text-[12px] text-blue-900">다음 단계: {nextStep.label}</strong><form action={setProcessStage} className="flex flex-wrap gap-2"><input type="hidden" name="leadId" value={lead.id}/><input type="hidden" name="stageAction" value={nextStep.settableAction??""}/>{nextStep.settableAction==="process_permit_completed"&&<input type="file" name="permitFile" className="max-w-[190px] text-[10px]"/>}<button className="rounded-lg border border-blue-500 bg-white px-3 py-2 text-[11px] font-bold text-blue-700">다음 단계로 변경</button></form></div>}</section>

          <div className="mt-4 grid min-w-0 gap-3 lg:grid-cols-[minmax(0,2.6fr)_minmax(320px,1fr)] lg:items-stretch">
            <div className="min-w-0 space-y-3.5">
              <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
                <div className="flex flex-col gap-2 border-b border-blue-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-[14px] font-extrabold">고객 제출 문서</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                        고객 추가 제출 자료
                        <strong className="text-blue-800">{customerDocuments.length}</strong>
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600">
                        질문 단계 제출 자료
                        <strong className="text-slate-500">{questionStageSubmittedDocument ? 1 : 0}</strong>
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
                    전체 문서 <ChevronDown size={13} />
                  </span>
                </div>

                {isCheckWorkspace ? (
                  <>
                    <div className="hidden sm:block">
                      <table className="w-full table-fixed text-left text-[11px]">
                        <thead className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50 text-slate-500">
                          <tr>
                            <th className="w-[24%] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide">문서명</th>
                            <th className="w-[14%] px-2 py-2.5 text-[10px] font-bold uppercase tracking-wide">준비구분</th>
                            <th className="w-[20%] px-2 py-2.5 text-[10px] font-bold uppercase tracking-wide">파일명</th>
                            <th className="w-[14%] px-2 py-2.5 text-[10px] font-bold uppercase tracking-wide">제출상태</th>
                            <th className="w-[14%] px-2 py-2.5 text-[10px] font-bold uppercase tracking-wide">검토 상태</th>
                            <th className="w-[14%] px-2 py-2.5 text-[10px] font-bold uppercase tracking-wide">다음조치</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {wpDocRows.map((row, index) => (
                            <tr key={row.label} className="transition-colors odd:bg-white even:bg-slate-50/40 hover:bg-blue-50/60">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${index % 3 === 0 ? "bg-red-50 text-red-500" : index % 3 === 1 ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600"}`}>
                                    <FileText size={12} />
                                  </span>
                                  <span className="font-bold text-slate-800">
                                    {row.label}
                                    {!row.mandatory && <span className="ml-1 text-[9px] font-normal text-slate-400">(선택)</span>}
                                  </span>
                                </div>
                              </td>
                              <td className="px-2 py-3 text-slate-500">{row.origin}</td>
                              <td className="truncate px-2 py-3 font-medium text-slate-600">
                                {row.signedUrl ? (
                                  <a href={row.signedUrl} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">{row.fileName ?? "파일 보기"}</a>
                                ) : (
                                  row.fileName ?? "-"
                                )}
                              </td>
                              <td className="px-2 py-3">
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold ${wpSubmissionBadge(row).className}`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${wpSubmissionBadge(row).dot}`} />
                                  {wpSubmissionBadge(row).label}
                                </span>
                              </td>
                              <td className="px-2 py-3">
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold ${wpReviewBadge(row).className}`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${wpReviewBadge(row).dot}`} />
                                  {wpReviewBadge(row).label}
                                </span>
                              </td>
                              <td className="px-2 py-3 text-slate-600">
                                <span className="inline-flex items-center gap-1.5">
                                  {(() => {
                                    const NextActionIcon = wpNextActionIcon(wpNextAction(row));
                                    return NextActionIcon ? <NextActionIcon size={12} className="shrink-0 text-slate-400" /> : null;
                                  })()}
                                  {wpNextAction(row)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="divide-y divide-slate-100 sm:hidden">
                      {wpDocRows.map((row, index) => (
                        <div key={row.label} className="flex w-full items-center gap-2 px-5 py-2.5">
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${index % 3 === 0 ? "bg-red-50 text-red-500" : index % 3 === 1 ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600"}`}>
                            <FileText size={16} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[12px] font-bold text-slate-800">{row.label}</p>
                            <p className="mt-1 truncate text-[10px] text-slate-400">{row.origin} · {wpReviewBadge(row).label} · {row.fileName ?? "제출 파일 없음"}</p>
                          </div>
                          <span className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold ${wpSubmissionBadge(row).className}`}>
                            {wpSubmissionBadge(row).label}
                          </span>
                        </div>
                      ))}
                    </div>

                    <p className="px-5 pb-2 pt-2 text-[10px] text-slate-400">
                      * AI 검토는 실제 파일 내용을 분석한 결과가 아니라 확인이 필요한 방향을 안내하는 것이며, &quot;사용 가능&quot; 여부는 전문가 확인 후에만 표시됩니다.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="hidden sm:block">
                  <table className="w-full table-fixed text-left text-[11px]">
                    <thead className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50 text-slate-500">
                      <tr>
                        <th className="w-[30%] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide">문서명</th>
                        <th className="w-[20%] px-2 py-2.5 text-[10px] font-bold uppercase tracking-wide">파일명</th>
                        <th className="w-[17%] px-2 py-2.5 text-[10px] font-bold uppercase tracking-wide">구분</th>
                        <th className="w-[14%] px-2 py-2.5 text-[10px] font-bold uppercase tracking-wide">제출일</th>
                        <th className="w-[11%] px-2 py-2.5 text-[10px] font-bold uppercase tracking-wide">상태</th>
                        <th className="w-[8%] px-2 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide">작업</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {requiredDocuments.map((label, index) => {
                        const submitted = isRequiredDocumentSubmitted(label);
                        const matched = customerDocuments.find((doc) =>
                          [doc.tag, doc.fileName]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase()
                            .replace(/\s+/g, "")
                            .includes(label.split(" ")[0].toLowerCase().replace(/\s+/g, ""))
                        );
                        const questionFile = index === 0 ? questionStageSubmittedDocument?.fileName ?? null : null;
                        const displayFileName = matched?.fileName ?? questionFile ?? "-";
                        const displayDate = matched
                          ? new Date(matched.createdAt).toLocaleString("ko-KR")
                          : "-";
                        const canOpen = Boolean(matched?.signedUrl);

                        return (
                          <tr key={label} className="transition-colors odd:bg-white even:bg-slate-50/40 hover:bg-blue-50/60">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${index % 3 === 0 ? "bg-red-50 text-red-500" : index % 3 === 1 ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600"}`}>
                                  <FileText size={12} />
                                </span>
                                <span className="font-bold text-slate-800">{label}</span>
                              </div>
                            </td>
                            <td className="truncate px-2 py-3 font-medium text-slate-600">{displayFileName}</td>
                            <td className="px-2 py-3">
                              <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${index < 3 ? "bg-blue-50 text-blue-700" : "bg-violet-50 text-violet-700"}`}>
                                {index < 3 ? "고객 추가 제출" : "질문 단계 제출"}
                              </span>
                            </td>
                            <td className="truncate px-2 py-3 text-slate-500">{displayDate}</td>
                            <td className="px-2 py-3">
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold ${submitted ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${submitted ? "bg-emerald-500" : "bg-amber-500"}`} />
                                {submitted ? "확인 완료" : "미확인"}
                              </span>
                            </td>
                            <td className="px-2 py-3 text-center">
                              {canOpen ? (
                                <a
                                  href={matched?.signedUrl ?? "#"}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex min-w-[44px] items-center justify-center rounded-md border border-slate-200 bg-white px-2.5 py-1.5 font-bold text-slate-700 shadow-[0_1px_3px_rgba(15,23,42,0.05)] hover:border-blue-300 hover:text-blue-700"
                                >
                                  열기
                                </a>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                    </div>

                    <div className="divide-y divide-slate-100 sm:hidden">
                  {requiredDocuments.map((label, index) => {
                    const submitted = isRequiredDocumentSubmitted(label);
                    const matched = customerDocuments.find((doc) =>
                      [doc.tag, doc.fileName]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase()
                        .replace(/\s+/g, "")
                        .includes(label.split(" ")[0].toLowerCase().replace(/\s+/g, ""))
                    );
                    return (
                      <div key={label} className="flex w-full items-center gap-2 px-5 py-2.5">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${index % 3 === 0 ? "bg-red-50 text-red-500" : index % 3 === 1 ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600"}`}>
                          <FileText size={16} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-bold text-slate-800">{label}</p>
                          <p className="mt-1 truncate text-[10px] text-slate-400">{matched?.fileName ?? "제출 파일 없음"}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${submitted ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                          {submitted ? "확인 완료" : "미확인"}
                        </span>
                      </div>
                    );
                  })}
                    </div>
                  </>
                )}

                <div className="border-t border-slate-100 px-5 py-2.5">
                  <span className="inline-flex items-center gap-2 text-[11px] font-bold text-blue-700">
                    <Download size={14} /> 모든 문서 다운로드
                  </span>
                </div>
              </section>

              <section className="min-h-[238px] rounded-2xl border border-slate-200 bg-white p-5 pb-6 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[14px] font-extrabold">AI 진단 결과</h2>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">진단 완료</span>
                </div>

                {isCheckWorkspace && (
                  <div className={`mt-4 flex flex-col gap-3 overflow-hidden rounded-xl border border-slate-100 px-5 py-4 sm:flex-row sm:items-center ${wpDecisionTone.bg}`}>
                    <div className="flex flex-1 items-start gap-3">
                      <WpDecisionIcon size={19} className={`mt-0.5 shrink-0 ${wpDecisionTone.value}`} />
                      <div className="min-w-0">
                        <p className={`text-[11px] font-semibold ${wpDecisionTone.label}`}>AI 종합 판단</p>
                        <p className={`mt-1 text-xl font-semibold leading-tight ${wpDecisionTone.value}`}>{wpDecisionLabel}</p>
                        <div className="mt-2 space-y-0.5">
                          {wpDecisionDetailLines.map((line, idx) => (
                            <p key={idx} className="text-[12px] leading-relaxed text-slate-600">{line}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:w-[290px] sm:shrink-0">
                      <div className="flex h-[62px] flex-col items-center justify-center rounded-lg bg-white/70 px-2 text-center">
                        <p className="text-[10px] text-slate-500">가능성 점수</p>
                        <p className="mt-1 text-lg font-extrabold leading-none text-slate-900">{typeof activeScore === "number" ? activeScore : "-"}</p>
                      </div>
                      <div className="flex h-[62px] flex-col items-center justify-center rounded-lg bg-white/70 px-2 text-center">
                        <p className="text-[10px] text-slate-500">고객 요청</p>
                        <p className="mt-1 text-lg font-extrabold leading-none text-slate-900">{wpMissingMandatory.length}건</p>
                      </div>
                      <div className="flex h-[62px] flex-col items-center justify-center rounded-lg bg-white/70 px-2 text-center">
                        <p className="text-[10px] text-slate-500">전문가 확인</p>
                        <p className="mt-1 text-lg font-extrabold leading-none text-slate-900">{wpExpertConfirmAll.length}건</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-5 grid overflow-hidden rounded-xl border border-slate-100 sm:grid-cols-[1.45fr_repeat(4,1fr)]">
                  <div className="flex min-h-[84px] flex-col justify-center border-b border-emerald-100 bg-emerald-50/60 px-4 py-3 sm:border-b-0 sm:border-r">
                    <p className="text-[11px] font-semibold text-slate-500">종합 결과</p>
                    <p className="mt-1.5 text-[17px] font-extrabold leading-none text-emerald-700">{resultInfo?.label ?? "-"}</p>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">일부 보완 후 진행 가능합니다.</p>
                  </div>
                  <div className="flex min-h-[84px] flex-col justify-center border-b border-blue-100 bg-blue-50/60 px-4 py-3 sm:border-b-0 sm:border-r">
                    <p className="text-[11px] font-semibold text-slate-500">가능성 점수</p>
                    <p className="mt-1.5 text-[17px] font-extrabold leading-none text-slate-900">
                      {typeof activeScore === "number" ? activeScore : "-"}
                      <span className="text-[11px] font-medium text-slate-400">/100</span>
                    </p>
                  </div>
                  <div className="flex min-h-[84px] flex-col justify-center border-b border-amber-100 bg-amber-50/60 px-4 py-3 sm:border-b-0 sm:border-r">
                    <p className="text-[11px] font-semibold text-slate-500">위험도</p>
                    <p className="mt-1.5 text-[17px] font-extrabold leading-none text-amber-600">{riskInfo?.label ?? "-"}</p>
                  </div>
                  <div className="flex min-h-[84px] flex-col justify-center border-b border-violet-100 bg-violet-50/60 px-4 py-3 sm:border-b-0 sm:border-r">
                    <p className="text-[11px] font-semibold text-slate-500">예상 소요 기간</p>
                    <p className="mt-1.5 text-[17px] font-extrabold leading-none text-slate-900">-</p>
                  </div>
                  <div className="flex min-h-[84px] flex-col justify-center bg-cyan-50/60 px-4 py-3">
                    <p className="text-[11px] font-semibold text-slate-500">예상 비용</p>
                    <p className="mt-1.5 text-[17px] font-extrabold leading-none text-slate-900">-</p>
                  </div>
                </div>

                {isCheckWorkspace && (
                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 sm:grid-cols-5">
                    <div className="rounded-xl border border-violet-100 bg-violet-50 p-2.5"><p className="text-[10px] text-violet-700">신청 유형</p><p className="mt-0.5 truncate text-[13px] font-extrabold text-violet-800">{wpApplicationType}</p></div>
                    <div className="rounded-xl border border-slate-100 bg-white p-2.5"><p className="text-[10px] text-slate-500">한국 준비</p><p className="mt-0.5 text-[13px] font-extrabold">{wpMissingByOrigin.한국}건</p></div>
                    <div className="rounded-xl border border-slate-100 bg-white p-2.5"><p className="text-[10px] text-slate-500">베트남 준비</p><p className="mt-0.5 text-[13px] font-extrabold">{wpMissingByOrigin.베트남}건</p></div>
                    <div className="rounded-xl border border-slate-100 bg-white p-2.5"><p className="text-[10px] text-slate-500">회사 준비</p><p className="mt-0.5 text-[13px] font-extrabold">{wpMissingByOrigin.회사}건</p></div>
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-2.5"><p className="text-[10px] text-blue-700">전문가 확인</p><p className="mt-0.5 text-[13px] font-extrabold text-blue-800">{wpExpertConfirmAll.length}건</p></div>
                  </div>
                )}

                <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 md:grid-cols-2">
                  <div className="md:border-r md:border-slate-100 md:pr-7">
                    <h3 className="flex items-center gap-2 border-b border-slate-100 pb-2 text-[15px] font-semibold text-slate-800"><AlertTriangle size={15} className="shrink-0 text-slate-400" />주요 위험 요인</h3>
                    {activeBrief?.rejectionRisks?.length ? (
                      <ul className="mt-3 space-y-3">
                        {[...activeBrief.rejectionRisks]
                          .sort((a, b) => a.rank - b.rank)
                          .map((risk, index) => (
                            <li key={index} className="flex items-start gap-3 text-[12px] leading-relaxed text-slate-600">
                              <span className="mt-0.5 shrink-0">•</span>
                              <span>{risk.reason}</span>
                            </li>
                          ))}
                      </ul>
                    ) : wpRiskConfirmedItems.length > 0 || wpRiskPendingItems.length > 0 ? (
                      <ul className="mt-3 space-y-3">
                        {wpRiskConfirmedItems.map((item, idx) => (
                          <li key={`confirmed-${idx}`} className="flex items-start gap-3 text-[12px] leading-relaxed text-emerald-700">
                            <span className="mt-0.5 shrink-0">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                        {wpRiskPendingItems.map((item, idx) => (
                          <li key={`pending-${idx}`} className="flex items-start gap-3 text-[12px] leading-relaxed text-slate-600">
                            <span className="mt-0.5 shrink-0">☐</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-[11px] text-slate-400">확인된 주요 위험 요인이 없습니다.</p>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <h3 className="flex items-center gap-2 text-[15px] font-semibold text-slate-800"><ListChecks size={15} className="shrink-0 text-slate-400" />권장 조치</h3>
                      <span className="rounded-md border border-blue-200 bg-white px-2.5 py-1 text-[10px] font-bold text-blue-700">상세 리포트 보기</span>
                    </div>
                    {activeBrief?.recommendedSteps?.length ? (
                      <ul className="mt-3 space-y-3">
                        {activeBrief.recommendedSteps.map((step, index) => (
                          <li key={index} className="flex items-start gap-3 text-[12px] leading-relaxed text-slate-600">
                            <span className="mt-0.5 shrink-0">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-[11px] text-slate-400">등록된 권장 조치가 없습니다.</p>
                    )}
                  </div>
                </div>

                {isCheckWorkspace && (
                  <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 md:grid-cols-2">
                    <div className="md:border-r md:border-slate-100 md:pr-7">
                      <h3 className="flex items-center gap-2 border-b border-slate-100 pb-2 text-[15px] font-semibold text-slate-800"><Mail size={15} className="shrink-0 text-slate-400" />고객 요청</h3>
                      {wpCustomerRequestItems.length > 0 ? (
                        <ol className="mt-3 space-y-3.5 text-[12px] leading-[1.7] text-slate-600">
                          {wpCustomerRequestItems.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="shrink-0 font-bold text-violet-700">{WP_CIRCLED_NUMBERS[idx] ?? `${idx + 1}.`}</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="mt-3 text-[11px] text-slate-400">현재 추가로 요청할 서류가 없습니다.</p>
                      )}
                    </div>
                    <div>
                      <h3 className="flex items-center gap-2 border-b border-slate-100 pb-2 text-[15px] font-semibold text-slate-800"><UserCheck size={15} className="shrink-0 text-slate-400" />전문가 확인</h3>
                      {wpExpertConfirmItems.length > 0 ? (
                        <ul className="mt-3 space-y-3.5 text-[12px] leading-[1.7] text-slate-600">
                          {wpExpertConfirmItems.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="shrink-0">☐</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 text-[11px] text-slate-400">전문가가 추가로 확인할 항목이 없습니다.</p>
                      )}
                    </div>
                  </div>
                )}
                {isCheckWorkspace && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <h3 className="flex items-center gap-2 text-[15px] font-semibold text-slate-800"><CheckCircle2 size={15} className="shrink-0 text-slate-400" />최종 검토 체크리스트</h3>
                      <span className="shrink-0 rounded-full bg-slate-100 px-3.5 py-1.5 text-[11px] font-bold text-slate-600">서류 {wpSubmittedMandatoryCount}/{wpMandatoryLabels.length}</span>
                    </div>
                    {wpFindingsChecklist.length > 0 ? (
                      <ul className="mt-4 grid gap-3.5 sm:grid-cols-2">
                        {wpFindingsChecklist.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-[12px] leading-relaxed text-slate-600">
                            <span className="shrink-0">☐</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-[11px] text-slate-400">현재 관리자가 추가로 확인할 항목이 없습니다.</p>
                    )}
                  </div>
                )}
              </section>
            </div>

            <aside className="flex h-full min-w-0 flex-col gap-3.5">
              <section className="min-h-[172px] min-w-0 w-full overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]"><div className="border-b border-blue-100 bg-blue-50 px-4 py-3"><h2 className="text-[14px] font-bold text-blue-950">고객 기본 정보</h2></div><dl className="grid grid-cols-[104px_1fr] gap-y-2 px-4 py-3.5 text-[12px]"><dt className="text-[11px] text-slate-500">고객 구분</dt><dd className="text-right font-semibold">개인</dd><dt className="text-[11px] text-slate-500">연락처</dt><dd className="text-right font-semibold">{lead.phone??"-"}</dd><dt className="text-[11px] text-slate-500">이메일</dt><dd className="min-w-0 break-all text-right font-semibold">{lead.email??"-"}</dd><dt className="text-[11px] text-amber-700">카카오톡 ID</dt><dd className="text-right font-bold text-amber-700">{lead.kakao_id??"-"}</dd><dt className="text-[11px] text-blue-700">Zalo ID</dt><dd className="text-right font-bold text-blue-700">{lead.zalo_id??"-"}</dd><dt className="text-[11px] text-slate-500">접수일</dt><dd className="text-right font-semibold">{new Date(lead.created_at).toLocaleDateString("ko-KR")}</dd></dl></section>
              <section className="min-h-[152px] min-w-0 w-full overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]"><div className="flex items-center justify-between border-b border-violet-100 bg-violet-50 px-4 py-3"><h2 className="text-[14px] font-bold text-violet-950">담당자 정보</h2><span className="inline-flex h-7 items-center rounded-md border border-blue-200 px-2.5 text-[10px] font-bold text-blue-700">담당자 변경</span></div><dl className="grid grid-cols-[104px_1fr] gap-y-2 px-4 py-3.5 text-[12px]"><dt className="text-[11px] text-slate-500">담당 직원</dt><dd className="text-right font-bold text-blue-700">VFBCAI 담당자</dd><dt className="text-[11px] text-slate-400">소속 팀</dt><dd className="text-right font-semibold">행정전문팀</dd><dt className="text-[11px] text-slate-400">배정일</dt><dd className="text-right font-semibold">-</dd></dl></section>
              <section className="min-h-[208px] min-w-0 w-full overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]"><div className="flex items-center justify-between border-b border-amber-100 bg-amber-50 px-4 py-3"><h2 className="text-[14px] font-bold text-amber-950">내부 메모</h2><span className="inline-flex h-7 items-center rounded-md border border-blue-200 px-2.5 text-[10px] font-bold text-blue-700">메모 작성</span></div><div className="px-4 py-3.5">{memoActivities.length>0&&<div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-[12px]">{String(asMeta(memoActivities[memoActivities.length-1].meta)?.memo??"")}</div>}<form action={addExpertMemo} className="mt-3"><input type="hidden" name="leadId" value={lead.id}/><textarea name="memo" required rows={2} placeholder="고객 및 업무 관련 메모를 작성하세요" className="w-full resize-none rounded-lg border border-slate-200 p-3 text-[12px] outline-none focus:border-blue-500"/><button className="mt-2.5 h-8 rounded-lg bg-blue-600 px-3.5 text-[11px] font-bold text-white">메모 저장</button></form></div></section>
              <section className="min-h-[152px] min-w-0 w-full overflow-hidden rounded-2xl border border-red-100 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]"><div className="border-b border-red-100 bg-red-50 px-4 py-3"><h2 className="text-[14px] font-bold text-red-950">타 기관 거절 이력</h2></div><div className="px-4 py-3.5">{rejections.length?<div className="space-y-2">{rejections.map(r=><div key={r.id} className="rounded-lg border border-red-100 p-3 text-[12px]"><div className="flex justify-between"><strong>{getServiceLabel(r.service_type)}</strong><span className="text-[11px] text-red-500">거절</span></div><p className="mt-1 text-[11px] text-slate-500">{r.reason||"사유 미기재"}</p></div>)}</div>:<p className="text-[11px] text-slate-400">연결된 거절이력이 없습니다.</p>}</div></section>
              <section className="flex min-h-[240px] min-w-0 w-full flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]"><div className="shrink-0 border-b border-emerald-100 bg-emerald-50 px-4 py-3"><h2 className="text-[14px] font-bold text-emerald-950">활동 타임라인</h2></div><div className="flex-1 px-4 py-3.5">{activities.length?<div className="relative space-y-3.5 before:absolute before:bottom-1 before:left-[4px] before:top-1 before:w-px before:bg-slate-200">{activities.slice(-6).map(a=><div key={a.id} className="relative grid grid-cols-[86px_1fr] gap-2.5 pl-4 text-[10px]"><span className={`absolute left-0 top-1 h-[9px] w-[9px] rounded-full ring-2 ring-white ${getActivityDotColor(a.action)}`}/><span className="text-slate-400">{new Date(a.created_at).toLocaleString("ko-KR")}</span><div><strong className="text-[11px] text-blue-700">{getActivityLabel(a.action)}</strong>{a.tag&&<p className="mt-0.5 truncate text-slate-500">{a.tag}</p>}</div></div>)}</div>:<p className="text-[11px] text-slate-400">기록된 활동이 없습니다.</p>}</div></section>
              <section className="flex min-h-[190px] min-w-0 w-full flex-1 flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]"><div className="shrink-0 border-b border-blue-100 bg-blue-50 px-4 py-3"><div className="flex items-center gap-2"><MessageSquareText size={16} className="text-blue-700"/><h2 className="text-[14px] font-bold text-blue-950">전문가 상담 요청 (Case Room)</h2></div><p className="mt-1 text-[11px] text-blue-700/70">고객 상담 요청과 전문가 답변을 관리합니다.</p></div>{consultationRequests.length===0?<div className="flex flex-1 flex-col items-center justify-center gap-2.5 px-5 py-7 text-center"><div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-400"><MessageSquareText size={18}/></div><p className="text-[13px] font-semibold text-slate-600">접수된 상담 요청이 없습니다</p><p className="max-w-[240px] text-[11px] leading-relaxed text-slate-400">고객이 Case Room에서 상담을 요청하면 이 영역에 표시됩니다.</p></div>:<div className="flex-1 space-y-3 overflow-hidden px-4 py-3.5">{[...consultationRequests].reverse().map(req=>{const response=findResponseFor(req.id);return <div key={req.id} className="rounded-xl bg-slate-50 p-4"><div className="flex justify-between text-[11px]"><strong>고객 문의</strong><span className={response?"text-emerald-600":"text-amber-600"}>{response?"답변 완료":"미답변"}</span></div><p className="mt-2 whitespace-pre-wrap text-[11px]">{String(asMeta(req.meta)?.content??"")}</p>{response?<div className="mt-3 rounded-lg bg-blue-50 p-3 text-[12px] text-blue-900">{String(asMeta(response.meta)?.content??"")}</div>:<form action={respondToConsultation} className="mt-3"><input type="hidden" name="leadId" value={lead.id}/><input type="hidden" name="requestActivityId" value={req.id}/><textarea name="content" required rows={3} className="w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-[12px]" placeholder="답변을 입력하세요"/><button className="mt-2 h-8 rounded-lg bg-blue-600 px-3.5 text-[11px] font-bold text-white">답변 등록</button></form>}</div>})}</div>}</section>
            </aside>
          </div>


        </div>
      </div>
    </main>
  );
}
