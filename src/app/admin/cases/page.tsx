// src/app/admin/page.tsx
//
// VFBCAI 관리자 대시보드 (/admin 첫 화면).
// 분류 원칙은 admin/cases/page.tsx·admin/leads/page.tsx와 완전히 동일하게
// 맞춘다 — 별도 로직을 새로 고안하지 않고 그대로 재사용(복제)한다.
// leads.status 같은 존재가 확인되지 않은 컬럼은 사용하지 않고, 상담원
// 처리상태(전문가 검토요청/전문가 진행요청접수)는 crm_activities.action 값으로만
// 집계한다 (admin/leads/[id]/page.tsx와 동일한 원칙).
//
// [STEP6 — 관리자 운영 Dashboard] "직원별 진행 건수"를 "직원 운영 현황"으로
// 확장했다. 새 계산식을 만들지 않고 STEP5(admin/users/[id]/page.tsx)의
// buildProcessSteps/completedAt(process_permit_completed 시각)/보완요청
// 판정(getBriefFlags)/진행률(%)/평균 처리기간(assignedAt→completedAt)/
// 완료율 계산을 이 파일에 동일하게 복제해 관리자별로 집계만 추가했다.
// 권한 스코프(STEP5 보완에서 추가된 super_admin 전체/일반관리자 본인만)는
// 그대로 유지했다.

import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getCurrentAdminUser } from "@/lib/adminAuth/serverComponentClient";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

export const dynamic = "force-dynamic";

// ── 서비스 분류 (admin/cases/page.tsx · admin/leads/page.tsx · admin/leads/[id]/page.tsx와 동일) ──
function toPrefixKey(value: string): string {
  return value.toLowerCase().replace(/-/g, "_");
}

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
  check: { label: "CHECK", badgeColor: "bg-blue-50 text-blue-800" },
  verify: { label: "VERIFY", badgeColor: "bg-gray-100 text-gray-600" },
  register: { label: "REGISTER", badgeColor: "bg-purple-50 text-purple-800" },
  consultation: { label: "상담", badgeColor: "bg-teal-50 text-teal-800" },
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

// admin/cases/page.tsx와 동일한 날짜 키 변환 방식(UTC 기준) — "오늘 접수"
// 집계도 기존 화면과 동일한 날짜 경계 기준을 사용한다.
function dateKeyOf(createdAt: string) {
  return new Date(createdAt).toISOString().slice(0, 10);
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type LeadRow = {
  id: string;
  name: string | null;
  phone: string | null;
  service_type: string | null;
  result: string | null;
  created_at: string;
};

// ── 진행 단계 계산 (admin/users/[id]/page.tsx의 buildProcessSteps/
// cascadeDone/getBriefFlags와 완전히 동일한 로직 복제 — 새 계산 없음) ──
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
    // VERIFY는 마지막 단계("전문가 안내 대기")에 대응하는 action이 없어
    // 원본에서도 항상 false로 고정된다(기존 로직 그대로) — 즉 VERIFY는
    // 이 계산에서 절대 "완료"가 될 수 없다.
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

// ── 보완 요청 판정 (admin/users/[id]/page.tsx의 getBriefFlags와 동일 기준) ──
function getBriefFlags(activities: ActivityRow[]): { hasFailedItem: boolean; hasRejectionRisk: boolean } {
  let brief: any = null;
  for (const a of activities) {
    const m = a.meta as any;
    const b = m && typeof m === "object" ? m.expertBrief ?? m.expert_brief : null;
    if (b) brief = b;
  }
  const hasFailedItem = Array.isArray(brief?.checkedItems) && brief.checkedItems.some((c: any) => c?.passed === false);
  const hasRejectionRisk = Array.isArray(brief?.rejectionRisks) && brief.rejectionRisks.length > 0;
  return { hasFailedItem, hasRejectionRisk };
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86400000);
}

type EmployeeSummary = {
  id: string;
  name: string;
  totalCount: number;
  activeCount: number;
  completedCount: number;
  todayCompletedCount: number;
  weekCompletedCount: number;
  supplementCount: number;
  govWaitingCount: number;
  avgProgressPercent: number | null;
  avgProcessingDays: number | null;
  completionRate: number | null;
};


export default async function AdminDashboardPage() {
  // 1) 전체 리드 수 (정확한 카운트 — 아래 목록 조회의 limit과 무관하게 정확히 집계)
  const { count: totalLeads } = await supabaseAdmin
    .from("leads")
    .select("id", { count: "exact", head: true });

  // 2) 최근 리드 데이터셋 (분류·오늘접수·서비스별 현황·최근목록에 공통 사용)
  //    admin/cases/page.tsx와 동일하게 최근 2000건 기준으로 집계한다.
  const { data: allLeadsRaw, error: leadsError } = await supabaseAdmin
    .from("leads")
    .select("id, name, phone, service_type, result, created_at")
    .order("created_at", { ascending: false })
    .limit(2000);

  if (leadsError) {
    return (
      <main className="min-h-screen bg-[#fafafa] p-10">
        <p className="text-sm text-red-600">
          데이터를 불러오는 중 문제가 발생했습니다: {leadsError.message}
        </p>
      </main>
    );
  }
  const allLeads = (allLeadsRaw ?? []) as LeadRow[];

  // 3) 전문가 검토 요청 / 전문가 진행요청 접수 — crm_activities.action 값 기준 정확한 카운트
  const { count: expertReviewCount } = await supabaseAdmin
    .from("crm_activities")
    .select("id", { count: "exact", head: true })
    .eq("action", "expert_review_request");

  const { count: agencyUpgradeCount } = await supabaseAdmin
    .from("crm_activities")
    .select("id", { count: "exact", head: true })
    .eq("action", "agency_upgrade_request");

  // ── 집계 ──
  const todayKey = dateKeyOf(new Date().toISOString());
  let todayCount = 0;
  const categoryCounts: Record<CategoryKey, number> = {
    check: 0,
    verify: 0,
    register: 0,
    consultation: 0,
    unclassified: 0,
  };
  const byService = new Map<string, number>();

  for (const lead of allLeads) {
    if (dateKeyOf(lead.created_at) === todayKey) todayCount += 1;

    const normalized = normalizeServiceType(lead.service_type);
    const category = getCategory(normalized);
    categoryCounts[category] += 1;

    const svcKey = normalized ?? "미상";
    byService.set(svcKey, (byService.get(svcKey) ?? 0) + 1);
  }

  const serviceRows = Array.from(byService.entries()).sort((a, b) => b[1] - a[1]);

  const recentLeads = allLeads.slice(0, 10);

  // ── STEP5(보완) — 직원별 진행 건수 요약: 권한 스코프 적용 ──
  // 이 대시보드는 middleware가 "active 관리자"까지만 확인하고 role은
  // 확인하지 않아(middleware.ts 주석 참고), super_admin이 아닌 관리자도
  // 접근 가능하다. 따라서 "직원별 진행 건수"는 서버 조회 자체를 role로
  // 제한한다(클라이언트에서 숨기는 방식 금지) — super_admin이면 전체
  // active 관리자, 그 외에는 본인 한 명만 조회 대상에 포함시켜 다른
  // 직원의 이름·건수·링크가 애초에 서버 응답에 담기지 않게 한다.
  const viewerAdmin = await getCurrentAdminUser();
  const isSuperAdminViewer = viewerAdmin?.role === "super_admin";

  let employeeSummaries: EmployeeSummary[] | null = [];
  let activeAdminsForSummary: { id: string; name: string }[] = [];

  if (!viewerAdmin) {
    // 세션 확인 자체가 안 되면(이례적 상황) 안전하게 아무도 표시하지 않는다.
    employeeSummaries = null;
  } else if (isSuperAdminViewer) {
    const { data: activeAdminsRaw, error: activeAdminsError } = await supabaseAdmin
      .from("admin_users")
      .select("id, name")
      .eq("active", true)
      .order("name", { ascending: true });
    if (activeAdminsError) {
      console.error("dashboard: admin_users query error:", activeAdminsError);
      employeeSummaries = null;
    } else {
      activeAdminsForSummary = activeAdminsRaw ?? [];
    }
  } else {
    // 일반 관리자는 본인 한 명만 — admin_users를 다시 조회하지 않고 이미
    // 세션 확인 과정에서 얻은 본인 정보만 사용한다(다른 직원 행을 서버가
    // 아예 조회하지 않음).
    activeAdminsForSummary = [{ id: viewerAdmin.id, name: viewerAdmin.name }];
  }

  if (employeeSummaries !== null && activeAdminsForSummary.length > 0) {
    const scopedAdminIds = activeAdminsForSummary.map((a) => a.id);

    // super_admin: 전체 배정 조회. 일반 관리자: 본인 배정만 조회 — 서버
    // 조회 범위 자체를 제한한다(다른 직원의 배정 행을 아예 가져오지 않음).
    let assignmentsQuery = supabaseAdmin.from("lead_assignments").select("lead_id, admin_user_id, assigned_at");
    if (!isSuperAdminViewer) {
      assignmentsQuery = assignmentsQuery.in("admin_user_id", scopedAdminIds);
    }
    const { data: allAssignmentsRaw, error: allAssignmentsError } = await assignmentsQuery;

    if (allAssignmentsError) {
      console.error("dashboard: lead_assignments query error:", allAssignmentsError);
      employeeSummaries = null;
    } else {
      const latestByLead = new Map<string, { lead_id: string; admin_user_id: string; assigned_at: string }>();
      for (const a of allAssignmentsRaw ?? []) {
        const existing = latestByLead.get(a.lead_id);
        if (!existing || new Date(a.assigned_at).getTime() > new Date(existing.assigned_at).getTime()) {
          latestByLead.set(a.lead_id, a);
        }
      }
      const currentAssignments = Array.from(latestByLead.values());
      const leadIds = currentAssignments.map((a) => a.lead_id);

      const { data: activitiesRaw, error: activitiesError } = leadIds.length
        ? await supabaseAdmin
            .from("crm_activities")
            .select("lead_id, action, meta, created_at")
            .in("lead_id", leadIds)
            .order("created_at", { ascending: true })
        : { data: [] as ActivityRow[], error: null };

      if (activitiesError) {
        console.error("dashboard: crm_activities query error:", activitiesError);
        employeeSummaries = null;
      } else {
        const activitiesByLead = new Map<string, ActivityRow[]>();
        for (const a of (activitiesRaw ?? []) as ActivityRow[]) {
          const list = activitiesByLead.get(a.lead_id) ?? [];
          list.push(a);
          activitiesByLead.set(a.lead_id, list);
        }
        const leadById = new Map(allLeads.map((l) => [l.id, l]));

        // 관리자별 원시 집계 버킷 — 전부 STEP5(admin/users/[id]/page.tsx)와
        // 동일한 판정식(진행률 %, completedAt, 보완요청, 정부제출대기)만
        // 사용해 채운다. 새 계산식 없음.
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const dayOfWeek = now.getDay();
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfWeek.getDate() - ((dayOfWeek + 6) % 7));

        type Bucket = {
          totalCount: number;
          activeCount: number;
          completedCount: number;
          todayCompletedCount: number;
          weekCompletedCount: number;
          supplementCount: number;
          govWaitingCount: number;
          progressSum: number;
          processingDurations: number[];
        };
        const buckets = new Map<string, Bucket>();
        const emptyBucket = (): Bucket => ({
          totalCount: 0,
          activeCount: 0,
          completedCount: 0,
          todayCompletedCount: 0,
          weekCompletedCount: 0,
          supplementCount: 0,
          govWaitingCount: 0,
          progressSum: 0,
          processingDurations: [],
        });

        for (const a of currentAssignments) {
          if (!scopedAdminIds.includes(a.admin_user_id)) continue;
          const lead = leadById.get(a.lead_id);
          // orphan/조회 범위 밖(최근 2000건 초과 등) 리드는 집계에서 제외.
          if (!lead) continue;

          const category = getCategory(normalizeServiceType(lead.service_type));
          const leadActivities = activitiesByLead.get(a.lead_id) ?? [];
          const steps = buildProcessSteps(category, leadActivities);
          const isCompleted = steps.length > 0 && steps[steps.length - 1].done;
          const progressPercent = steps.length
            ? Math.round((steps.filter((s) => s.done).length / steps.length) * 100)
            : 0;
          const nextStepIndex = steps.findIndex((s) => !s.done && s.settableAction);
          const nextStepLabel = nextStepIndex >= 0 ? steps[nextStepIndex].label : "없음";
          const { hasFailedItem, hasRejectionRisk } = getBriefFlags(leadActivities);
          const isSupplement = !isCompleted && (hasFailedItem || hasRejectionRisk);

          // completedAt: 리드의 마지막 활동 시각이 아니라 실제 완료 action
          // (process_permit_completed)의 created_at (STEP5 보완 리뷰와 동일).
          const permitCompletedActivities = leadActivities.filter((act) => act.action === "process_permit_completed");
          const completedAt =
            isCompleted && permitCompletedActivities.length
              ? permitCompletedActivities[permitCompletedActivities.length - 1].created_at
              : null;

          const bucket = buckets.get(a.admin_user_id) ?? emptyBucket();
          bucket.totalCount += 1;
          if (isCompleted) {
            bucket.completedCount += 1;
            if (completedAt) {
              if (new Date(completedAt) >= startOfToday) bucket.todayCompletedCount += 1;
              if (new Date(completedAt) >= startOfWeek) bucket.weekCompletedCount += 1;
              bucket.processingDurations.push(daysBetween(new Date(a.assigned_at), new Date(completedAt)));
            }
          } else {
            bucket.activeCount += 1;
            if (isSupplement) bucket.supplementCount += 1;
            if (nextStepLabel === "정부 제출") bucket.govWaitingCount += 1;
          }
          bucket.progressSum += progressPercent;
          buckets.set(a.admin_user_id, bucket);
        }

        employeeSummaries = activeAdminsForSummary.map((admin) => {
          const b = buckets.get(admin.id) ?? emptyBucket();
          return {
            id: admin.id,
            name: admin.name,
            totalCount: b.totalCount,
            activeCount: b.activeCount,
            completedCount: b.completedCount,
            todayCompletedCount: b.todayCompletedCount,
            weekCompletedCount: b.weekCompletedCount,
            supplementCount: b.supplementCount,
            govWaitingCount: b.govWaitingCount,
            avgProgressPercent: b.totalCount ? Math.round(b.progressSum / b.totalCount) : null,
            avgProcessingDays: b.processingDurations.length
              ? Math.round((b.processingDurations.reduce((s, d) => s + d, 0) / b.processingDurations.length) * 10) / 10
              : null,
            completionRate: b.totalCount ? Math.round((b.completedCount / b.totalCount) * 100) : null,
          };
        });

        // Dashboard 우선순위: 보완 요청 많은 순 → 정부 제출 대기 많은 순 →
        // 진행중(activeCount) 많은 순 → 완료(completedCount) 적은 순.
        employeeSummaries.sort((x, y) => {
          if (y.supplementCount !== x.supplementCount) return y.supplementCount - x.supplementCount;
          if (y.govWaitingCount !== x.govWaitingCount) return y.govWaitingCount - x.govWaitingCount;
          if (y.activeCount !== x.activeCount) return y.activeCount - x.activeCount;
          return x.completedCount - y.completedCount;
        });
      }
    }
  }

  const statCards: { label: string; value: number }[] = [
    { label: "전체 리드 수", value: totalLeads ?? 0 },
    { label: "오늘 접수", value: todayCount },
    { label: "CHECK 리드 수", value: categoryCounts.check },
    { label: "VERIFY 리드 수", value: categoryCounts.verify },
    { label: "REGISTER 리드 수", value: categoryCounts.register },
    { label: "상담문의 수", value: categoryCounts.consultation },
    { label: "전문가 검토 요청 수", value: expertReviewCount ?? 0 },
    { label: "전문가 진행요청 접수 수", value: agencyUpgradeCount ?? 0 },
  ];

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            VFBCAI 관리자
          </p>
          <AdminLogoutButton />
        </div>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">대시보드</h1>
        <p className="mt-1 text-sm text-gray-500">
          현재 접수·진행 현황을 한눈에 확인할 수 있습니다.
        </p>

        {/* 1~8. 요약 통계 */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-white border border-gray-100 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            >
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="mt-1 text-[11px] text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/admin/leads"
            className="text-xs font-semibold text-blue-900 hover:underline"
          >
            전체 리드 목록 보기 →
          </Link>
          <span className="text-gray-300">·</span>
          <Link
            href="/admin/cases"
            className="text-xs font-semibold text-blue-900 hover:underline"
          >
            AI 진단 리포트 목록 →
          </Link>
          <span className="text-gray-300">·</span>
          <Link
            href="/admin/rejections"
            className="text-xs font-semibold text-blue-900 hover:underline"
          >
            타 기관 거절이력 →
          </Link>
        </div>

        {/* STEP6. 직원 운영 현황 — super_admin: 전체, 그 외: 본인만(서버 조회 범위 자체를 제한) */}
        <div className="mt-8">
          <h2 className="text-sm font-bold text-gray-900">
            {isSuperAdminViewer ? "직원 운영 현황" : "내 운영 현황"}
          </h2>
          <div className="mt-3">
            {employeeSummaries === null ? (
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <p className="px-4 py-6 text-center text-xs text-gray-400">운영 현황을 확인할 수 없습니다.</p>
              </div>
            ) : employeeSummaries.length === 0 ? (
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <p className="px-4 py-6 text-center text-xs text-gray-400">등록된 활성 관리자가 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {employeeSummaries.map((emp) => (
                  <Link
                    key={emp.id}
                    href={`/admin/users/${emp.id}`}
                    className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-bold text-gray-900">{emp.name}</p>
                      <p className={`text-sm font-bold ${emp.activeCount > 0 ? "text-blue-900" : "text-gray-300"}`}>
                        {emp.activeCount > 0 ? `${emp.activeCount}건 진행중` : "업무 없음"}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-blue-900"
                          style={{ width: `${emp.avgProgressPercent ?? 0}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-[11px] font-semibold text-gray-500">
                        {emp.avgProgressPercent === null ? "-" : `${emp.avgProgressPercent}%`}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{emp.todayCompletedCount}</p>
                        <p className="text-[10px] text-gray-400">오늘 완료</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{emp.weekCompletedCount}</p>
                        <p className="text-[10px] text-gray-400">이번주 완료</p>
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${emp.supplementCount > 0 ? "text-amber-600" : "text-gray-900"}`}>
                          {emp.supplementCount}
                        </p>
                        <p className="text-[10px] text-gray-400">보완 요청</p>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
                      <span>평균 처리 {emp.avgProcessingDays === null ? "-" : `${emp.avgProcessingDays}일`}</span>
                      <span>완료율 {emp.completionRate === null ? "-" : `${emp.completionRate}%`}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 9. 최근 접수 리드 목록 */}
        <div className="mt-8">
          <h2 className="text-sm font-bold text-gray-900">최근 접수 리드</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400">
                  <th className="px-4 py-3 font-semibold">접수일</th>
                  <th className="px-4 py-3 font-semibold">이름</th>
                  <th className="px-4 py-3 font-semibold">구분</th>
                  <th className="px-4 py-3 font-semibold">서비스</th>
                  <th className="px-4 py-3 font-semibold">연락처</th>
                  <th className="px-4 py-3 font-semibold text-right">상세</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-gray-400">
                      데이터가 없습니다
                    </td>
                  </tr>
                )}
                {recentLeads.map((lead) => {
                  const normalized = normalizeServiceType(lead.service_type);
                  const category = getCategory(normalized);
                  const info = CATEGORY_INFO[category];
                  return (
                    <tr key={lead.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {formatDateTime(lead.created_at)}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {lead.name || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${info.badgeColor}`}>
                          {info.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {getServiceLabel(normalized ?? "")}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{lead.phone || "-"}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="inline-block rounded-full border border-gray-200 px-3 py-1 text-[11px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          상세보기 →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 10. 서비스 유형별 접수 현황 */}
        <div className="mt-8">
          <h2 className="text-sm font-bold text-gray-900">서비스 유형별 접수 현황</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400">
                  <th className="px-4 py-3 font-semibold">구분</th>
                  <th className="px-4 py-3 font-semibold">서비스</th>
                  <th className="px-4 py-3 font-semibold text-right">건수</th>
                </tr>
              </thead>
              <tbody>
                {serviceRows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-xs text-gray-400">
                      데이터가 없습니다
                    </td>
                  </tr>
                )}
                {serviceRows.map(([svcType, count]) => {
                  const category = getCategory(svcType);
                  const info = CATEGORY_INFO[category];
                  return (
                    <tr key={svcType} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${info.badgeColor}`}>
                          {info.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">{getServiceLabel(svcType)}</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">{count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
