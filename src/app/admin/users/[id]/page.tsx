// src/app/admin/users/[id]/page.tsx
//
// 직원 업무관리(STEP 3) — 신규 파일.
//
// "직원 업무 현황" 페이지. 관리자 목록(/admin/users)의 "상세 보기"에서
// 진입한다. 새 테이블·새 컬럼을 만들지 않고 다음 3개의 기존 데이터만으로
// 전부 계산한다:
//   1) lead_assignments (id, lead_id, admin_user_id, assigned_by, assigned_at,
//      status) — 이 관리자에게 배정된 신청건 목록. 이 프로젝트에서 이
//      테이블을 실제로 조회하는 코드는 이 파일이 최초다(사전 조사 결과,
//      기존 코드에 lead_assignments 참조가 전혀 없었음).
//   2) leads (id, name, phone, email, service_type, result, created_at) —
//      admin/cases/page.tsx와 동일한 select 컬럼만 사용.
//   3) crm_activities (lead_id, action, meta, created_at) — 진행 단계는
//      admin/cases/[leadId]/page.tsx의 buildProcessSteps()/cascadeDone()과
//      완전히 동일한 로직을 그대로 복제했다(다른 파일의 비공개 함수라
//      import 불가 — 이 프로젝트 기존 관례). "보완 요청" 판정도
//      admin/cases/page.tsx의 status=supplement 필터와 동일한 기준
//      (meta.expertBrief/expert_brief의 checkedItems.passed===false 또는
//      rejectionRisks 존재)을 그대로 재사용했다. 새로운 진행 단계 이름이나
//      새로운 상태값을 만들지 않았다.
//
// "지연 업무" 기준: 이 프로젝트에 기존 SLA/지연 계산 로직이 없어(사전 조사
// 결과 확인), "완료되지 않았고 최근 활동이 OVERDUE_DAYS일 이상 없는 건"으로
// 정의했다 — 이는 새 DB 컬럼이 아니라 순수 계산값이며, 아래 상수 하나로
// 명시했다(하드코딩된 진단 결과가 아니라 업무 규칙 값, UI에도 "잠정 기준"으로
// 표시).
//
// [2026-08 재확인] lead_assignments.status 실제 운영값: Ace가 운영 DB에서
// 직접 조회한 결과 `select status, count(*) from lead_assignments group by
// status`가 0 rows — 즉 이 테이블에 실제 배정 데이터가 아직 전혀 없다(status
// 값 자체가 존재하지 않음). 따라서 status 문자열을 추측해 필터를 추가하지
// 않았다(active/inactive/completed 등 어떤 값도 확인되지 않음, DB 기본값이
// active라는 사실만 확인됨). lead_id별 최신 assigned_at 1건만 쓰는 dedup은
// 향후 배정 데이터가 쌓일 때를 대비해 유지하되, 실제 검증은 데이터가 없어
// 미실행이다. 이 페이지가 지금 "배정된 업무가 없습니다"만 보여주는 것은
// 오류가 아니라 정상 동작이다 — 실제 업무 현황을 표시하려면 별도의 "업무
// 배정" 기능(리드를 특정 관리자에게 배정하는 UI/API)이 먼저 필요하며, 이는
// 이번 STEP 범위가 아니다(다음 STEP으로 분리).
//
// 권한: super_admin은 모든 직원의 이 페이지에 접근 가능. 그 외 role은
// "본인" id로만 접근 가능(role !== 본인이면 notFound). "Manager가 자신이
// 관리하는 직원만 조회"하는 기능은 admin_users에 관리자-소속직원 관계를
// 나타내는 컬럼이 없어(사전 조사 결과, 이런 컬럼 존재 확인 안 됨) 이번
// STEP에서 구현하지 않았다 — 새 컬럼을 추측해서 만들지 않고, team_manager도
// staff와 동일하게 "본인 업무만" 조회로 처리했다(최종 제출 보고서에 명시).

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Users as UsersIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CalendarClock,
  TrendingUp,
  History,
  Timer,
} from "lucide-react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getCurrentAdminUser } from "@/lib/adminAuth/serverComponentClient";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import { ADMIN_ROLE_LABELS } from "../roleLabels";

export const dynamic = "force-dynamic";

// ── 지연 판정 기준(업무 규칙 상수 — DB 컬럼 아님) ──
const OVERDUE_DAYS_THRESHOLD = 3;

// ── 서비스 분류 (admin/cases/[leadId]/page.tsx와 동일한 원칙, 값 복제) ──
const SERVICE_TYPE_ALIASES: Record<string, string> = { register_company: "permit_company" };
function normalizeServiceType(v: string | null | undefined): string | null {
  if (!v) return v ?? null;
  return SERVICE_TYPE_ALIASES[v] ?? v;
}
function toPrefixKey(value: string): string {
  return value.toLowerCase().replace(/-/g, "_");
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
  register_fire_safety: "소방허가",
  register_hygiene: "위생허가",
  register_medical_device: "의료기기허가",
  register_franchise: "프랜차이즈 등록",
};
function getServiceLabel(serviceType: string | null): string {
  if (!serviceType) return "미상";
  if (SERVICE_LABELS[serviceType]) return SERVICE_LABELS[serviceType];
  const key = toPrefixKey(serviceType);
  if (SERVICE_LABELS[key]) return SERVICE_LABELS[key];
  if (key.startsWith("verify")) return `VERIFY · ${key.replace(/^verify_?/, "") || "기타"}`;
  if (key.startsWith("permit") || key.startsWith("register"))
    return `REGISTER · ${key.replace(/^(permit|register)_?/, "") || "기타"}`;
  return serviceType;
}

// ── 진행 단계 계산 (admin/cases/[leadId]/page.tsx의 buildProcessSteps/cascadeDone과
// 완전히 동일한 로직 복제 — action 값·판정 기준 전부 동일, 새 계산 없음) ──
type ActivityRow = { lead_id: string; action: string | null; meta: unknown; created_at: string };
type ProcessStep = { label: string; done: boolean; settableAction: string | null };

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
    const done = cascadeDone([true, hasDiagnosis, hasExpertReview, false]);
    return [
      { label: "접수 완료", done: done[0], settableAction: null },
      { label: "자체 진단 완료", done: done[1], settableAction: null },
      { label: "전문가 검토 요청", done: done[2], settableAction: "expert_review_request" },
      { label: "전문가 안내 대기", done: done[3], settableAction: null },
    ];
  }
  if (category === "consultation") {
    const done = cascadeDone([true, false]);
    return [
      { label: "상담 접수 완료", done: done[0], settableAction: null },
      { label: "담당자 확인 대기", done: done[1], settableAction: null },
    ];
  }
  const done = cascadeDone([true, hasDiagnosis, hasExpertReview, hasAgency, hasGovernmentSubmitted, hasPermitCompleted]);
  return [
    { label: "접수 완료", done: done[0], settableAction: null },
    { label: "AI 진단 완료", done: done[1], settableAction: null },
    { label: "전문가 검토", done: done[2], settableAction: "expert_review_request" },
    { label: "전문가 진행요청", done: done[3], settableAction: "agency_upgrade_request" },
    { label: "정부 제출", done: done[4], settableAction: "process_government_submitted" },
    { label: "허가 완료", done: done[5], settableAction: "process_permit_completed" },
  ];
}

// ── 보완 요청 판정 (admin/cases/page.tsx의 status=supplement 필터와 완전히 동일한 기준) ──
function hasSupplementFlag(activities: ActivityRow[]): boolean {
  let brief: any = null;
  for (const a of activities) {
    const m = a.meta as any;
    const b = m && typeof m === "object" ? m.expertBrief ?? m.expert_brief : null;
    if (b) brief = b; // 가장 최근 진단(시간순 정렬 전제)으로 덮어씀
  }
  const hasFailedItem = Array.isArray(brief?.checkedItems) && brief.checkedItems.some((c: any) => c?.passed === false);
  const hasRejectionRisk = Array.isArray(brief?.rejectionRisks) && brief.rejectionRisks.length > 0;
  return hasFailedItem || hasRejectionRisk;
}

// ── 활동 라벨(admin/cases/[leadId]/page.tsx의 ACTIVITY_LABELS/getActivityLabel과 동일) ──
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
function humanizeKey(key: string): string {
  const withSpaces = key.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).toLowerCase();
}
function getActivityLabel(action: string | null): string {
  if (!action) return "활동 기록";
  if (ACTIVITY_LABELS[action]) return ACTIVITY_LABELS[action];
  if (action.endsWith("_diagnosis_lead")) return "AI 진단 완료";
  return humanizeKey(action);
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86400000);
}
function formatDate(value: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}
function formatDateTime(value: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function formatRelative(value: string | null): string {
  if (!value) return "활동 없음";
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}일 전`;
}

type LeadRow = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  service_type: string | null;
  result: string | null;
  created_at: string;
};

type AssignmentRow = {
  id: string;
  lead_id: string;
  admin_user_id: string;
  assigned_by: string | null;
  assigned_at: string;
  status: string | null;
};

type WorkItemStatus = "완료" | "보완요청" | "진행중";

type WorkItem = {
  lead: LeadRow;
  category: CategoryKey;
  steps: ProcessStep[];
  currentStageLabel: string;
  nextStepLabel: string;
  progressPercent: number;
  status: WorkItemStatus;
  assignedAt: string;
  lastActivityAt: string | null;
  isOverdue: boolean;
};

export default async function StaffWorkStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: targetId } = await params;

  const currentAdmin = await getCurrentAdminUser();
  if (!currentAdmin) notFound();
  if (currentAdmin.role !== "super_admin" && currentAdmin.id !== targetId) notFound();

  const { data: target, error: targetError } = await supabaseAdmin
    .from("admin_users")
    .select("id, name, email, role, active, created_at, updated_at")
    .eq("id", targetId)
    .maybeSingle();

  if (targetError) {
    console.error("staff work status: admin_users lookup error:", targetError);
    return <ErrorScreen />;
  }
  if (!target) notFound();

  const { data: assignmentsRaw, error: assignmentsError } = await supabaseAdmin
    .from("lead_assignments")
    .select("id, lead_id, admin_user_id, assigned_by, assigned_at, status")
    .eq("admin_user_id", targetId)
    .order("assigned_at", { ascending: false });

  if (assignmentsError) {
    console.error("staff work status: lead_assignments query error:", assignmentsError);
    return <ErrorScreen />;
  }

  // 중복 배정 방어: 담당자 변경/재배정 등으로 동일 lead_id가
  // lead_assignments에 여러 번 존재할 수 있다. lead_assignments.status의
  // 실제 값 종류를 이번 보완 작업 시점까지 확인하지 못해(재확인 요청 —
  // 최종 보고서 참고) status 문자열로 "현재 담당만" 걸러내는 필터는 아직
  // 추가하지 않았다. 대신 status 값을 추측하지 않고도 중복 표시를 막을 수
  // 있는 구조적 방법으로, lead_id별로 assigned_at이 가장 최근인 배정
  // 1건만 "현재 담당"으로 취급한다. 실제 status 값이 확인되면 이 dedup
  // 위에 active 필터를 추가할 수 있다(아래 주석 유지).
  const latestAssignmentByLead = new Map<string, AssignmentRow>();
  for (const a of (assignmentsRaw ?? []) as AssignmentRow[]) {
    const existing = latestAssignmentByLead.get(a.lead_id);
    if (!existing || new Date(a.assigned_at).getTime() > new Date(existing.assigned_at).getTime()) {
      latestAssignmentByLead.set(a.lead_id, a);
    }
  }
  const assignments = Array.from(latestAssignmentByLead.values()).sort(
    (x, y) => new Date(y.assigned_at).getTime() - new Date(x.assigned_at).getTime()
  );
  const leadIds = assignments.map((a) => a.lead_id);

  const { data: leadsRaw, error: leadsError } = leadIds.length
    ? await supabaseAdmin
        .from("leads")
        .select("id, name, phone, email, service_type, result, created_at")
        .in("id", leadIds)
    : { data: [] as LeadRow[], error: null };
  if (leadsError) {
    console.error("staff work status: leads query error:", leadsError);
    return <ErrorScreen />;
  }
  const leadsById = new Map((leadsRaw ?? []).map((l) => [l.id, l as LeadRow]));

  const { data: activitiesRaw, error: activitiesError } = leadIds.length
    ? await supabaseAdmin
        .from("crm_activities")
        .select("lead_id, action, meta, created_at")
        .in("lead_id", leadIds)
        .order("created_at", { ascending: true })
    : { data: [] as ActivityRow[], error: null };
  if (activitiesError) {
    console.error("staff work status: crm_activities query error:", activitiesError);
    return <ErrorScreen />;
  }
  const activities = (activitiesRaw ?? []) as ActivityRow[];

  const activitiesByLead = new Map<string, ActivityRow[]>();
  for (const a of activities) {
    const list = activitiesByLead.get(a.lead_id) ?? [];
    list.push(a);
    activitiesByLead.set(a.lead_id, list);
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const workItems: WorkItem[] = assignments
    .filter((a) => leadsById.has(a.lead_id))
    .map((a) => {
      const lead = leadsById.get(a.lead_id)!;
      const leadActivities = activitiesByLead.get(a.lead_id) ?? [];
      const category = getCategory(lead.service_type);
      const steps = buildProcessSteps(category, leadActivities);
      const currentStageLabel = [...steps].reverse().find((s) => s.done)?.label ?? steps[0]?.label ?? "-";
      const nextStepIndex = steps.findIndex((s) => !s.done && s.settableAction);
      const nextStepLabel = nextStepIndex >= 0 ? steps[nextStepIndex].label : "없음";
      const isCompleted = steps.length > 0 && steps[steps.length - 1].done;
      const supplement = !isCompleted && hasSupplementFlag(leadActivities);
      const status: WorkItemStatus = isCompleted ? "완료" : supplement ? "보완요청" : "진행중";
      const progressPercent = steps.length
        ? Math.round((steps.filter((s) => s.done).length / steps.length) * 100)
        : 0;
      const lastActivityAt = leadActivities.length
        ? leadActivities[leadActivities.length - 1].created_at
        : null;
      const referenceDate = lastActivityAt ? new Date(lastActivityAt) : new Date(a.assigned_at);
      const isOverdue = !isCompleted && daysBetween(referenceDate, now) >= OVERDUE_DAYS_THRESHOLD;

      return {
        lead,
        category,
        steps,
        currentStageLabel,
        nextStepLabel,
        progressPercent,
        status,
        assignedAt: a.assigned_at,
        lastActivityAt,
        isOverdue,
      };
    });

  // ── KPI 계산 (전부 위에서 계산한 실제 데이터 기반, 하드코딩 없음) ──
  const totalCustomers = workItems.length;
  const inProgressCount = workItems.filter((w) => w.status === "진행중").length;
  const supplementCount = workItems.filter((w) => w.status === "보완요청").length;
  const completedCount = workItems.filter((w) => w.status === "완료").length;
  const overdueCount = workItems.filter((w) => w.isOverdue).length;
  const todayCount = workItems.filter(
    (w) => w.lastActivityAt && new Date(w.lastActivityAt) >= startOfToday
  ).length;

  const mostRecentActivityAt = activities.length ? activities[activities.length - 1].created_at : null;

  const completedDurations = workItems
    .filter((w) => w.status === "완료" && w.lastActivityAt)
    .map((w) => daysBetween(new Date(w.assignedAt), new Date(w.lastActivityAt!)));
  const avgProcessingDays = completedDurations.length
    ? Math.round((completedDurations.reduce((sum, d) => sum + d, 0) / completedDurations.length) * 10) / 10
    : null;

  // ── 최근 활동 타임라인 (crm_activities 재사용, 새 테이블 없음) ──
  const recentActivities = [...activities]
    .sort((x, y) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime())
    .slice(0, 15)
    .map((a) => ({
      ...a,
      leadName: leadsById.get(a.lead_id)?.name ?? "이름 미상",
      serviceLabel: getServiceLabel(leadsById.get(a.lead_id)?.service_type ?? null),
    }));

  return (
    <Shell>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin/users" className="text-xs font-medium text-slate-400 hover:text-blue-700">
            ← 관리자 목록
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            {target.name}
            <span className="ml-2 text-base font-semibold text-slate-400">직원 업무 현황</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {target.email} · {ADMIN_ROLE_LABELS[target.role as keyof typeof ADMIN_ROLE_LABELS] ?? target.role}
            {!target.active && <span className="ml-2 text-red-600">(비활성 계정)</span>}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="담당 고객" value={totalCustomers} caption="배정된 전체 건수" icon={<UsersIcon size={18} />} />
        <KpiCard label="진행 중" value={inProgressCount} caption="처리 진행 중인 건" icon={<Clock size={18} />} />
        <KpiCard label="보완 요청" value={supplementCount} caption="보완이 필요한 건" icon={<AlertTriangle size={18} />} />
        <KpiCard label="완료" value={completedCount} caption="처리 완료된 건" icon={<CheckCircle2 size={18} />} />
        <KpiCard label="오늘 처리" value={todayCount} caption="오늘 활동이 있었던 건" icon={<CalendarClock size={18} />} />
        <KpiCard
          label="배정 건 최근 활동"
          value={formatRelative(mostRecentActivityAt)}
          caption="담당 신청건에서 발생한 최근 처리 시각(수행자 구분 없음)"
          icon={<History size={18} />}
        />
        <KpiCard
          label="평균 처리 기간"
          value={avgProcessingDays === null ? "-" : `${avgProcessingDays}일`}
          caption="완료 건 기준 평균"
          icon={<TrendingUp size={18} />}
        />
        <KpiCard
          label="지연 업무"
          value={overdueCount}
          caption={`잠정 기준: 최근 활동 ${OVERDUE_DAYS_THRESHOLD}일 이상 없음(확정 필요)`}
          icon={<Timer size={18} />}
          tone={overdueCount > 0 ? "warning" : "default"}
        />
      </div>

      <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3.5">
          <p className="text-sm font-bold text-slate-950">담당 업무</p>
        </div>
        {workItems.length === 0 ? (
          <EmptyState message="배정된 업무가 없습니다." />
        ) : (
          <>
            <div className="divide-y divide-slate-100 lg:hidden">
              {workItems.map((w) => (
                <WorkItemMobileCard key={w.lead.id} item={w} />
              ))}
            </div>
            <div className="hidden lg:block">
              <WorkItemTable items={workItems} />
            </div>
          </>
        )}
      </section>

      <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3.5">
          <p className="text-sm font-bold text-slate-950">담당 건 최근 활동</p>
          <p className="mt-0.5 text-xs text-slate-400">
            이 직원에게 배정된 신청 건에서 발생한 활동입니다. 직원이 직접 수행한 작업만을
            의미하지는 않습니다(활동별 수행자 구분 데이터 없음).
          </p>
        </div>
        {recentActivities.length === 0 ? (
          <EmptyState message="최근 활동이 없습니다." />
        ) : (
          <div className="divide-y divide-slate-100">
            {recentActivities.map((a, idx) => (
              <div key={idx} className="flex items-start gap-3 px-4 py-3">
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-800">
                    <span className="font-semibold">{a.leadName}</span>
                    <span className="text-slate-400"> · {a.serviceLabel}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{getActivityLabel(a.action)}</p>
                </div>
                <p className="shrink-0 text-xs text-slate-400">{formatDateTime(a.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}

function WorkItemTable({ items }: { items: WorkItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-fixed">
        <thead className="bg-slate-50">
          <tr className="border-b border-slate-200 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            <th className="w-[16%] px-5 py-3.5">고객명</th>
            <th className="w-[14%] px-4 py-3.5">서비스</th>
            <th className="w-[13%] px-4 py-3.5">현재 단계</th>
            <th className="w-[11%] px-4 py-3.5">담당 시작일</th>
            <th className="w-[11%] px-4 py-3.5">최근 처리일</th>
            <th className="w-[10%] px-4 py-3.5">상태</th>
            <th className="w-[13%] px-4 py-3.5">다음 작업</th>
            <th className="w-[12%] px-5 py-3.5">진행률</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {items.map((w) => (
            <tr key={w.lead.id} className="group transition hover:bg-blue-50/40">
              <td className="px-5 py-4 align-middle">
                <Link
                  href={`/admin/cases/${w.lead.id}`}
                  className="truncate text-sm font-semibold text-slate-950 hover:text-blue-700 hover:underline"
                >
                  {w.lead.name ?? "이름 미상"}
                </Link>
                <p className="mt-0.5 truncate text-xs text-slate-500">{w.lead.phone || w.lead.email || "연락처 없음"}</p>
              </td>
              <td className="px-4 py-4 align-middle">
                <p className="truncate text-sm text-slate-700">{getServiceLabel(w.lead.service_type)}</p>
              </td>
              <td className="px-4 py-4 align-middle">
                <p className="truncate text-sm text-slate-700">{w.currentStageLabel}</p>
              </td>
              <td className="px-4 py-4 align-middle">
                <p className="text-xs text-slate-500">{formatDate(w.assignedAt)}</p>
              </td>
              <td className="px-4 py-4 align-middle">
                <p className="text-xs text-slate-500">{formatDate(w.lastActivityAt)}</p>
              </td>
              <td className="px-4 py-4 align-middle">
                <StatusBadge status={w.status} isOverdue={w.isOverdue} />
              </td>
              <td className="px-4 py-4 align-middle">
                <p className="truncate text-xs text-slate-600">{w.nextStepLabel}</p>
              </td>
              <td className="px-5 py-4 align-middle">
                <ProgressBar percent={w.progressPercent} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WorkItemMobileCard({ item: w }: { item: WorkItem }) {
  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/admin/cases/${w.lead.id}`}
            className="truncate text-sm font-semibold text-slate-950 hover:text-blue-700 hover:underline"
          >
            {w.lead.name ?? "이름 미상"}
          </Link>
          <p className="truncate text-xs text-slate-500">{getServiceLabel(w.lead.service_type)}</p>
        </div>
        <StatusBadge status={w.status} isOverdue={w.isOverdue} />
      </div>
      <div className="mt-3">
        <ProgressBar percent={w.progressPercent} />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
        <span>현재 {w.currentStageLabel}</span>
        <span>다음 {w.nextStepLabel}</span>
      </div>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
        <span>담당 {formatDate(w.assignedAt)}</span>
        <span>처리 {formatDate(w.lastActivityAt)}</span>
      </div>
    </div>
  );
}

function StatusBadge({ status, isOverdue }: { status: WorkItemStatus; isOverdue: boolean }) {
  const meta: Record<WorkItemStatus, string> = {
    완료: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    보완요청: "bg-amber-50 text-amber-700 ring-amber-100",
    진행중: "bg-blue-50 text-blue-700 ring-blue-100",
  };
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${meta[status]}`}>
        {status}
      </span>
      {isOverdue && (
        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700 ring-1 ring-inset ring-red-100">
          지연
        </span>
      )}
    </span>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${percent >= 100 ? "bg-emerald-500" : "bg-blue-600"}`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      <span className="w-9 shrink-0 text-right text-xs font-semibold text-slate-500">{percent}%</span>
    </div>
  );
}

// ── admin/users/page.tsx와 동일한 디자인 시스템 복제(다른 파일의 비공개
// 컴포넌트라 import 불가 — 이 프로젝트 기존 관례). Sidebar는 "직원관리"만
// active 처리. ──
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-[220px] shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-200 px-5 py-5">
            <p className="text-sm font-extrabold tracking-tight text-slate-950">VFBCAI 관리자</p>
            <p className="mt-1 text-[11px] text-slate-400">CRM WORKSPACE</p>
          </div>
          <nav className="flex-1 px-3 py-4 text-sm">
            <SidebarLink href="/admin" label="대시보드" />
            <SidebarLink href="/admin/cases" label="신청건 관리" />
            <SidebarLink href="/admin/documents" label="문서관리" />
            <SidebarLink href="/admin/users" label="직원관리" active />
            <SidebarDisabled label="통계" />
            <SidebarLink href="/admin/rejections" label="거절이력관리" />
          </nav>
          <div className="border-t border-slate-200 p-3">
            <AdminLogoutButton />
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-white lg:hidden">
            <div className="flex h-16 items-center justify-between px-4">
              <div>
                <p className="text-sm font-extrabold text-slate-950">VFBCAI 관리자</p>
                <p className="text-[10px] text-slate-400">CRM WORKSPACE</p>
              </div>
              <AdminLogoutButton />
            </div>
          </header>
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </div>
      </div>
    </main>
  );
}

function SidebarLink({ href, label, active = false }: { href: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`mb-1 flex items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
        active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
      }`}
    >
      {label}
    </Link>
  );
}

function SidebarDisabled({ label }: { label: string }) {
  return (
    <div className="mb-1 flex items-center justify-between rounded-lg px-3 py-2 text-xs text-slate-400">
      <span>{label}</span>
      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400">준비중</span>
    </div>
  );
}

function KpiCard({
  label,
  value,
  caption,
  icon,
  tone = "default",
}: {
  label: string;
  value: number | string;
  caption: string;
  icon: React.ReactNode;
  tone?: "default" | "warning";
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        tone === "warning" ? "border-red-100 bg-red-50/40" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-600">{label}</p>
          <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">{value}</p>
          <p className="mt-2 text-xs text-slate-400">{caption}</p>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            tone === "warning" ? "bg-red-100 text-red-700" : "bg-blue-50 text-blue-700"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message = "표시할 데이터가 없습니다." }: { message?: string }) {
  return <div className="flex min-h-40 items-center justify-center p-8 text-sm text-slate-400">{message}</div>;
}

function ErrorScreen() {
  return (
    <main className="min-h-screen bg-slate-50 p-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-red-700">데이터를 불러오는 중 문제가 발생했습니다.</p>
        <p className="mt-2 text-sm text-red-600">잠시 후 다시 시도해주세요. 문제가 반복되면 관리자에게 문의하세요.</p>
      </div>
    </main>
  );
}
