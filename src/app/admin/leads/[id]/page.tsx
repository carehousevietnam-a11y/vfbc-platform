// src/app/admin/leads/[id]/page.tsx
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
  Circle,
  Paperclip,
  Info,
} from "lucide-react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

function getConsultationStatus(activities: ActivityRow[]): { label: string; color: string } {
  const actions = new Set(activities.map((a) => a.action));
  if (actions.has("agency_upgrade_request")) {
    return { label: "대행 신청 접수됨", color: "text-blue-800 bg-blue-50" };
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
    { label: "대행 신청", done: done[3], settableAction: "agency_upgrade_request" },
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

  revalidatePath(`/admin/leads/${leadId}`);
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

  await supabaseAdmin.from("crm_activities").insert({
    lead_id: leadId,
    action,
    tag: "ADMIN_STAGE_UPDATE",
    meta,
  });

  revalidatePath(`/admin/leads/${leadId}`);
}

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: lead } = await supabaseAdmin
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!lead) {
    return (
      <main className="min-h-screen bg-[#fafafa] p-10">
        <p className="text-sm text-red-600">해당 리드를 찾을 수 없습니다.</p>
        <Link href="/admin/leads" className="mt-4 inline-block text-xs text-blue-900 hover:underline">
          ← 목록으로
        </Link>
      </main>
    );
  }

  const { data: activitiesRaw } = await supabaseAdmin
    .from("crm_activities")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: true });
  const activities = (activitiesRaw ?? []) as ActivityRow[];

  const { data: rejectionsRaw } = await supabaseAdmin
    .from("previous_rejections")
    .select("id, service_type, source_page, reason, linked_lead_id, created_at")
    .eq("linked_lead_id", id)
    .order("created_at", { ascending: false });
  const rejections = rejectionsRaw ?? [];

  const serviceType = normalizeServiceType(lead.service_type as string) ?? (lead.service_type as string);
  const category = getCategory(serviceType);
  const categoryInfo = CATEGORY_INFO[category];
  const serviceLabel = getServiceLabel(serviceType ?? "");
  const resultInfo = lead.result ? RESULT_LABELS[lead.result] ?? null : null;
  const consultationStatus = getConsultationStatus(activities);
  const processSteps = buildProcessSteps(category, activities);

  // STEP4: "허가 완료" 단계에 첨부된 결과파일(허가증)이 있으면 표시용으로 조회
  const permitActivity = activities.find((a) => a.action === "process_permit_completed");
  const permitFileUrl = (asMeta(permitActivity?.meta)?.file_url as string | undefined) ?? null;
  const permitFileName = (asMeta(permitActivity?.meta)?.file_name as string | undefined) ?? null;

  // 첨부 서류 (VERIFY STEP2에서 저장되는 meta.file_url / file_name — 특정
  // action명에 묶지 않고 파일이 첨부된 첫 활동을 찾는다)
  const uploadActivity = activities.find((a) => asMeta(a.meta)?.file_url);
  const fileUrl = (asMeta(uploadActivity?.meta)?.file_url as string | undefined) ?? null;
  const fileName = (asMeta(uploadActivity?.meta)?.file_name as string | undefined) ?? null;

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

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link href="/admin/leads" className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600">
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

        {/* 1. 고객 기본정보 */}
        <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-xs font-semibold text-gray-700">고객 기본정보</p>
          <div className="mt-2 grid grid-cols-2 gap-y-1.5 text-xs">
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
        <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
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

        {/* 진행 단계 관리 (신규) */}
        <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-xs font-semibold text-gray-700">진행 단계 관리</p>
          <div className="mt-3 space-y-2">
            {processSteps.map((step) => (
              <div key={step.label} className="gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {step.done ? (
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    ) : (
                      <Circle size={16} className="text-gray-300 shrink-0" />
                    )}
                    <span className={`text-xs ${step.done ? "font-semibold text-gray-900" : "text-gray-500"}`}>
                      {step.label}
                    </span>
                  </div>
                  {!step.done && step.settableAction && step.settableAction !== "process_permit_completed" && (
                    <form action={setProcessStage}>
                      <input type="hidden" name="leadId" value={lead.id} />
                      <input type="hidden" name="stageAction" value={step.settableAction} />
                      <button
                        type="submit"
                        className="rounded-full border border-blue-900 px-3 py-1 text-[11px] font-semibold text-blue-900 hover:bg-blue-50 transition-colors"
                      >
                        이 단계로 설정
                      </button>
                    </form>
                  )}
                </div>
                {/* STEP4: "허가 완료"는 결과파일(허가증)을 함께 첨부할 수 있다(선택) */}
                {!step.done && step.settableAction === "process_permit_completed" && (
                  <form action={setProcessStage} className="mt-2 flex flex-wrap items-center gap-2 pl-6">
                    <input type="hidden" name="leadId" value={lead.id} />
                    <input type="hidden" name="stageAction" value={step.settableAction} />
                    <input
                      type="file"
                      name="permitFile"
                      className="text-[10px] text-gray-500 file:mr-2 file:rounded-full file:border-0 file:bg-gray-100 file:px-2.5 file:py-1 file:text-[10px] file:font-semibold"
                    />
                    <button
                      type="submit"
                      className="rounded-full border border-blue-900 px-3 py-1 text-[11px] font-semibold text-blue-900 hover:bg-blue-50 transition-colors"
                    >
                      이 단계로 설정
                    </button>
                  </form>
                )}
                {/* STEP4: 이미 첨부된 허가증 파일이 있으면 표시 */}
                {step.done && step.settableAction === "process_permit_completed" && permitFileUrl && (
                  <a
                    href={permitFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 ml-6 inline-flex items-center gap-1 text-[11px] font-medium text-blue-900 hover:underline"
                  >
                    <Paperclip size={12} /> {permitFileName ?? "허가증 파일 열기"}
                  </a>
                )}
              </div>
            ))}
          </div>
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

        {/* 4. 첨부 서류 */}
        {fileUrl && (
          <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <p className="text-xs font-semibold text-gray-700">첨부 서류</p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-blue-900 hover:underline"
            >
              <Paperclip size={13} /> {fileName ?? "첨부파일 열기"}
            </a>
          </div>
        )}

        {/* 5. AI 진단 결과 (CHECK / VERIFY / REGISTER 3가지 구조 분기) */}
        <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-700">AI 진단 결과</p>
            {typeof activeScore === "number" && (
              <span className="text-sm font-bold text-gray-900">{activeScore}%</span>
            )}
          </div>

          {activeBrief ? (
            <>
              {riskInfo && (
                <span className={`inline-block mt-2 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${riskInfo.color}`}>
                  리스크 {riskInfo.label}
                </span>
              )}
              {activeBrief.summary && (
                <p className="mt-3 text-xs text-gray-600 leading-relaxed">{activeBrief.summary}</p>
              )}
              {(activeBrief.checkedItems?.length ?? 0) > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-700">항목별 확인 결과</p>
                  <div className="mt-2 space-y-2">
                    {(activeBrief.checkedItems ?? []).map((item: ExpertChecklistItem, i: number) => (
                      <div key={i} className="rounded-xl bg-gray-50 px-3 py-2.5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
                          {item.passed ? (
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                          )}
                          {item.label}
                        </div>
                        {item.reason && (
                          <p className="mt-1 text-[11px] text-gray-500 pl-[22px]">{item.reason}</p>
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

        {/* 7. 전문가 메모 */}
        <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
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
              rows={3}
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

        {/* 8. crm_activities 타임라인 */}
        <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-xs font-semibold text-gray-700">활동 타임라인</p>
          <div className="mt-2 space-y-2">
            {activities.length === 0 && (
              <p className="text-xs text-gray-400">기록된 활동이 없습니다.</p>
            )}
            {activities.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-3 text-xs">
                <span className="text-gray-600">
                  {a.action}
                  {a.tag && <span className="ml-1.5 text-gray-400">· {a.tag}</span>}
                </span>
                <span className="text-gray-400 shrink-0">
                  {new Date(a.created_at).toLocaleString("ko-KR")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
