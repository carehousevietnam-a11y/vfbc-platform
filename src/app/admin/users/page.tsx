// src/app/admin/users/page.tsx
//
// 관리자 계정 관리(STEP 2) — 신규 파일.
//
// 이 페이지는 admin/cases/page.tsx · admin/documents/page.tsx와 동일한
// Shell/PageHeader/KpiCard/EmptyState 디자인 시스템을 그대로 복제했다(다른
// 파일의 비공개 컴포넌트라 import 불가 — 이 프로젝트의 기존 관례와 동일).
//
// 접근 제어: middleware.ts는 "active 관리자인가"까지만 확인하고 role은
// 확인하지 않는다(middleware.ts 주석 참고, STEP 7 범위). 이 페이지는
// super_admin 전용이므로, getCurrentAdminUser()(신규, Server Component용
// 읽기 전용 인증 확인)로 role을 추가 확인해 super_admin이 아니면
// notFound()로 막는다. Next.js Server Component는 API route처럼 임의의
// HTTP 상태 코드를 직접 반환할 수 없어, "접근 금지"는 이 프로젝트에서
// 관례적으로 쓰는 404(notFound)로 처리한다 — API(POST/PATCH)는
// requireSuperAdmin()이 실제 403 JSON을 반환한다.
//
// [STEP5 — 직원 업무 운영] 각 관리자 행에 "현재 업무"(진행 중 건수)를
// 추가했다. 별도 페이지 이동 없이 이 목록에서 바로 확인 가능해야 한다는
// 요구사항에 따라, /admin/users/[id]가 쓰는 것과 동일한 buildProcessSteps/
// getBriefFlags 로직을 이 파일에도 복제해(다른 파일의 비공개 함수라 import
// 불가 — 기존 관례와 동일) lead_assignments + leads + crm_activities만으로
// 계산한다. "현재 업무" = 이 관리자에게 배정된 건 중 status(완료/보완요청/
// 진행중)가 "완료"가 아닌 건수 — 새 상태값이 아니라 기존 3분류에서 완료가
// 아닌 것만 합친 것이다. lead_assignments는 STEP4부터 리드당 항상 최신
// 배정 1건만 남도록 UPDATE-in-place로 관리되지만, 과거 잔재 데이터에 대한
// 방어로 여기서도 lead_id별 최신 assigned_at 1건만 사용하는 동일한 dedup을
// 적용했다(새 필터 아님, 기존 STEP3/4와 동일한 규칙 재사용).

import { notFound } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, UserCheck, UserX, Users as UsersIcon, Briefcase } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getCurrentAdminUser } from "@/lib/adminAuth/serverComponentClient";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import AddAdminModal from "./AddAdminModal";
import AdminUserActions, { type AdminUserRow } from "./AdminUserActions";
import { ADMIN_ROLE_LABELS } from "./roleLabels";

export const dynamic = "force-dynamic";

// ── 진행 단계 계산 (admin/users/[id]/page.tsx·admin/cases/[leadId]/page.tsx의
// buildProcessSteps/cascadeDone과 완전히 동일한 로직 복제 — 새 계산 없음) ──
type CategoryKey = "check" | "verify" | "register" | "consultation" | "unclassified";
const SERVICE_TYPE_ALIASES: Record<string, string> = { register_company: "permit_company" };
function normalizeServiceType(v: string | null | undefined): string | null {
  if (!v) return v ?? null;
  return SERVICE_TYPE_ALIASES[v] ?? v;
}
function toPrefixKey(value: string): string {
  return value.toLowerCase().replace(/-/g, "_");
}
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

type ActivityRow = { lead_id: string; action: string | null; meta: unknown; created_at: string };
type ProcessStep = { done: boolean; settableAction: string | null };

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
    // VERIFY는 마지막 단계("전문가 안내 대기")에 대응하는 완료 action이
    // 없어 원본 buildProcessSteps에서도 항상 미완료로 계산된다(기존 로직
    // 그대로) — 즉 VERIFY 건은 이 집계에서 항상 "진행중"으로 잡힌다.
    const done = cascadeDone([true, hasDiagnosis, hasExpertReview, false]);
    return done.map((d) => ({ done: d, settableAction: null }));
  }
  if (category === "consultation") {
    // 상담문의도 동일한 이유로 완료 action이 없어 항상 미완료로 집계된다.
    const done = cascadeDone([true, false]);
    return done.map((d) => ({ done: d, settableAction: null }));
  }
  const done = cascadeDone([true, hasDiagnosis, hasExpertReview, hasAgency, hasGovernmentSubmitted, hasPermitCompleted]);
  return done.map((d) => ({ done: d, settableAction: null }));
}

// [STEP6] "진행률"(관리자 목록의 작은 Progress Bar) — buildProcessSteps의
// done 배열 비율을 그대로 사용한다. 새 계산식 아님(admin/users/[id]/
// page.tsx·admin/page.tsx의 progressPercent와 동일한 공식).
function progressPercentOf(steps: ProcessStep[]): number {
  return steps.length ? Math.round((steps.filter((s) => s.done).length / steps.length) * 100) : 0;
}

export default async function AdminUsersPage() {
  const currentAdmin = await getCurrentAdminUser();
  if (!currentAdmin || currentAdmin.role !== "super_admin") {
    notFound();
  }

  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .select("id, auth_user_id, name, email, role, active, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    return <ErrorScreen message={error.message} />;
  }

  const users = (data ?? []) as AdminUserRow[];
  const activeSuperAdminIds = new Set(
    users.filter((u) => u.role === "super_admin" && u.active).map((u) => u.id)
  );
  const isOnlyActiveSuperAdmin = (id: string) =>
    activeSuperAdminIds.has(id) && activeSuperAdminIds.size === 1;

  // ── STEP5: 관리자별 "현재 업무"(완료 아닌 배정 건수) 집계 +
  // [STEP6] 관리자별 평균 진행률(%) 집계 — 둘 다 같은 루프에서 계산 ──
  // 오류가 나도 목록 자체(관리자 계정 관리)는 계속 보여야 하므로, 이 집계는
  // 실패해도 페이지 전체를 막지 않고 "확인 불가"로만 표시한다(치명적이지
  // 않은 부가 정보이기 때문 — admin_users 자체 조회 실패와는 다르게 취급).
  let activeWorkCountByAdmin: Map<string, number> | null = new Map();
  let avgProgressByAdmin: Map<string, number> | null = new Map();
  const { data: allAssignmentsRaw, error: allAssignmentsError } = await supabaseAdmin
    .from("lead_assignments")
    .select("lead_id, admin_user_id, assigned_at")
    .order("assigned_at", { ascending: false });

  if (allAssignmentsError) {
    console.error("admin users list: lead_assignments query error:", allAssignmentsError);
    activeWorkCountByAdmin = null;
    avgProgressByAdmin = null;
  } else {
    // lead_id별 최신 배정 1건만 사용 (STEP3/4와 동일한 dedup 규칙)
    const latestByLead = new Map<string, { lead_id: string; admin_user_id: string; assigned_at: string }>();
    for (const a of allAssignmentsRaw ?? []) {
      const existing = latestByLead.get(a.lead_id);
      if (!existing || new Date(a.assigned_at).getTime() > new Date(existing.assigned_at).getTime()) {
        latestByLead.set(a.lead_id, a);
      }
    }
    const currentAssignments = Array.from(latestByLead.values());
    const leadIds = currentAssignments.map((a) => a.lead_id);

    const { data: leadsRaw, error: leadsError } = leadIds.length
      ? await supabaseAdmin.from("leads").select("id, service_type").in("id", leadIds)
      : { data: [] as { id: string; service_type: string | null }[], error: null };
    const { data: activitiesRaw, error: activitiesError } = leadIds.length
      ? await supabaseAdmin
          .from("crm_activities")
          .select("lead_id, action, meta, created_at")
          .in("lead_id", leadIds)
          .order("created_at", { ascending: true })
      : { data: [] as ActivityRow[], error: null };

    if (leadsError || activitiesError) {
      console.error("admin users list: work summary query error:", leadsError ?? activitiesError);
      activeWorkCountByAdmin = null;
      avgProgressByAdmin = null;
    } else {
      const serviceTypeByLead = new Map((leadsRaw ?? []).map((l) => [l.id, l.service_type]));
      const activitiesByLead = new Map<string, ActivityRow[]>();
      for (const a of (activitiesRaw ?? []) as ActivityRow[]) {
        const list = activitiesByLead.get(a.lead_id) ?? [];
        list.push(a);
        activitiesByLead.set(a.lead_id, list);
      }

      const progressSumByAdmin = new Map<string, number>();
      const progressCountByAdmin = new Map<string, number>();

      for (const a of currentAssignments) {
        // orphan 배정(리드가 실제로 존재하지 않음) 제외 — 존재하지 않는
        // 리드를 "진행중 업무"로 잘못 세지 않는다.
        if (!serviceTypeByLead.has(a.lead_id)) continue;
        const leadActivities = activitiesByLead.get(a.lead_id) ?? [];
        const category = getCategory(serviceTypeByLead.get(a.lead_id));
        const steps = buildProcessSteps(category, leadActivities);
        const isCompleted = steps.length > 0 && steps[steps.length - 1].done;

        // 진행률(%) — 배정된 전체 건 기준 평균(완료 건은 100%로 자연스럽게
        // 포함됨). admin/page.tsx의 avgProgressPercent와 동일한 정의.
        progressSumByAdmin.set(a.admin_user_id, (progressSumByAdmin.get(a.admin_user_id) ?? 0) + progressPercentOf(steps));
        progressCountByAdmin.set(a.admin_user_id, (progressCountByAdmin.get(a.admin_user_id) ?? 0) + 1);

        if (isCompleted) continue; // "현재 업무"는 완료가 아닌 건만 집계
        activeWorkCountByAdmin.set(a.admin_user_id, (activeWorkCountByAdmin.get(a.admin_user_id) ?? 0) + 1);
      }

      for (const [adminId, count] of progressCountByAdmin) {
        avgProgressByAdmin.set(adminId, Math.round((progressSumByAdmin.get(adminId) ?? 0) / count));
      }
    }
  }

  const summary = {
    total: users.length,
    active: users.filter((u) => u.active).length,
    inactive: users.filter((u) => !u.active).length,
    superAdmin: users.filter((u) => u.role === "super_admin").length,
  };

  return (
    <Shell active="users">
      <PageHeader
        title="관리자 계정 관리"
        description="관리자 계정과 접근 상태를 관리합니다."
        action={<AddAdminModal />}
      />

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="전체 관리자" value={summary.total} caption="등록된 전체 계정" icon={<UsersIcon size={18} />} />
        <KpiCard label="활성 관리자" value={summary.active} caption="로그인 가능한 계정" icon={<UserCheck size={18} />} />
        <KpiCard label="비활성 관리자" value={summary.inactive} caption="접근이 차단된 계정" icon={<UserX size={18} />} />
        <KpiCard label="Super Admin" value={summary.superAdmin} caption="최고 권한 계정" icon={<ShieldCheck size={18} />} />
      </div>

      <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3.5">
          <p className="text-sm font-bold text-slate-950">관리자 목록</p>
        </div>

        {users.length === 0 ? (
          <EmptyState message="등록된 관리자가 없습니다." />
        ) : (
          <>
            <div className="divide-y divide-slate-100 lg:hidden">
              {users.map((u) => (
                <AdminUserMobileCard
                  key={u.id}
                  user={u}
                  isSelf={u.id === currentAdmin.id}
                  isLastActiveSuperAdmin={isOnlyActiveSuperAdmin(u.id)}
                  activeWorkCount={activeWorkCountByAdmin?.get(u.id) ?? 0}
                  workCountAvailable={activeWorkCountByAdmin !== null}
                  avgProgress={avgProgressByAdmin?.get(u.id) ?? null}
                  avgProgressAvailable={avgProgressByAdmin !== null}
                />
              ))}
            </div>
            <div className="hidden lg:block">
              <AdminUserTable
                users={users}
                currentAdminId={currentAdmin.id}
                isOnlyActiveSuperAdmin={isOnlyActiveSuperAdmin}
                activeWorkCountByAdmin={activeWorkCountByAdmin}
                avgProgressByAdmin={avgProgressByAdmin}
              />
            </div>
          </>
        )}
      </section>
    </Shell>
  );
}

function AdminUserTable({
  users,
  currentAdminId,
  isOnlyActiveSuperAdmin,
  activeWorkCountByAdmin,
  avgProgressByAdmin,
}: {
  users: AdminUserRow[];
  currentAdminId: string;
  isOnlyActiveSuperAdmin: (id: string) => boolean;
  activeWorkCountByAdmin: Map<string, number> | null;
  avgProgressByAdmin: Map<string, number> | null;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-fixed">
        <thead className="bg-slate-50">
          <tr className="border-b border-slate-200 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            <th className="w-[15%] px-5 py-3.5">이름</th>
            <th className="w-[19%] px-4 py-3.5">이메일</th>
            <th className="w-[11%] px-4 py-3.5">역할</th>
            <th className="w-[8%] px-4 py-3.5">상태</th>
            <th className="w-[17%] px-4 py-3.5">업무 현황</th>
            <th className="w-[11%] px-4 py-3.5">등록일</th>
            <th className="w-[10%] px-4 py-3.5">최근 수정일</th>
            <th className="w-[9%] px-5 py-3.5 text-right">관리</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {users.map((u) => (
            <tr key={u.id} className="group transition hover:bg-blue-50/40">
              <td className="px-5 py-4 align-middle">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                    {u.name.slice(0, 1)}
                  </div>
                  <p className="truncate text-sm font-semibold text-slate-950">
                    {u.name}
                    {u.id === currentAdminId && (
                      <span className="ml-1.5 text-xs font-normal text-slate-400">(나)</span>
                    )}
                  </p>
                </div>
              </td>
              <td className="px-4 py-4 align-middle">
                <p className="truncate text-sm text-slate-700">{u.email}</p>
              </td>
              <td className="px-4 py-4 align-middle">
                <RoleBadge role={u.role} />
              </td>
              <td className="px-4 py-4 align-middle">
                <StatusBadge active={u.active} />
              </td>
              <td className="px-4 py-4 align-middle">
                <WorkStatusCell
                  count={activeWorkCountByAdmin?.get(u.id) ?? 0}
                  countAvailable={activeWorkCountByAdmin !== null}
                  percent={avgProgressByAdmin?.get(u.id) ?? null}
                  percentAvailable={avgProgressByAdmin !== null}
                />
              </td>
              <td className="px-4 py-4 align-middle">
                <p className="text-xs text-slate-500">{formatDate(u.created_at)}</p>
              </td>
              <td className="px-4 py-4 align-middle">
                <p className="text-xs text-slate-500">{formatDate(u.updated_at)}</p>
              </td>
              <td className="px-5 py-4 text-right align-middle">
                <AdminUserActions
                  user={u}
                  isSelf={u.id === currentAdminId}
                  isLastActiveSuperAdmin={isOnlyActiveSuperAdmin(u.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminUserMobileCard({
  user,
  isSelf,
  isLastActiveSuperAdmin,
  activeWorkCount,
  workCountAvailable,
  avgProgress,
  avgProgressAvailable,
}: {
  user: AdminUserRow;
  isSelf: boolean;
  isLastActiveSuperAdmin: boolean;
  activeWorkCount: number;
  workCountAvailable: boolean;
  avgProgress: number | null;
  avgProgressAvailable: boolean;
}) {
  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
            {user.name.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">
              {user.name}
              {isSelf && <span className="ml-1.5 text-xs font-normal text-slate-400">(나)</span>}
            </p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
        <AdminUserActions user={user} isSelf={isSelf} isLastActiveSuperAdmin={isLastActiveSuperAdmin} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RoleBadge role={user.role} />
        <StatusBadge active={user.active} />
      </div>
      <div className="mt-3">
        <WorkStatusCell
          count={activeWorkCount}
          countAvailable={workCountAvailable}
          percent={avgProgress}
          percentAvailable={avgProgressAvailable}
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
        <span>등록 {formatDate(user.created_at)}</span>
        <span>수정 {formatDate(user.updated_at)}</span>
      </div>
    </div>
  );
}

// [STEP8] "현재 업무"+"진행률" 두 컬럼을 "업무 현황" 하나로 통합했다(문제2
// 수정 — 컬럼이 좁아 가독성이 떨어지던 문제). 계산값은 WorkCountBadge/
// MiniProgressBar와 완전히 동일(activeWorkCountByAdmin/avgProgressByAdmin
// 그대로 재사용, 새 계산 없음) — 두 값을 한 셀에 세로로 배치만 했다.
function WorkStatusCell({
  count,
  countAvailable,
  percent,
  percentAvailable,
}: {
  count: number;
  countAvailable: boolean;
  percent: number | null;
  percentAvailable: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <WorkCountBadge count={count} available={countAvailable} />
      <MiniProgressBar percent={percent} available={percentAvailable} />
    </div>
  );
}

// [STEP7] 관리자 목록의 작은 진행률 Progress Bar — buildProcessSteps 기존
// 계산(progressPercentOf)만 그대로 사용, 새 계산식 없음.
// available=false(집계 자체 실패)와 배정이 0건이라 값이 없는 경우를
// 구분한다 — 후자는 "-"가 아니라 회색 0% 바 + "업무 없음"으로 표시해
// 데이터가 비어있는 정상 상태임을 분명히 한다.
function MiniProgressBar({ percent, available = true }: { percent: number | null; available?: boolean }) {
  if (!available) {
    return <span className="text-xs text-slate-400">확인 불가</span>;
  }
  const value = percent ?? 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${value === 0 ? "bg-slate-200" : value >= 100 ? "bg-emerald-500" : "bg-blue-600"}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className={`text-xs font-semibold ${value === 0 ? "text-slate-400" : "text-slate-500"}`}>{value}%</span>
    </div>
  );
}

// "현재 업무" — lead_assignments 기준 완료가 아닌 배정 건수. 조회 자체가
// 실패했을 때(위 activeWorkCountByAdmin===null)는 0건처럼 보이지 않도록
// "확인 불가"로 구분 표시한다(운영자 오판 방지).
function WorkCountBadge({ count, available }: { count: number; available: boolean }) {
  if (!available) {
    return <span className="text-xs text-slate-400">확인 불가</span>;
  }
  if (count === 0) {
    return <span className="text-xs text-slate-400">업무 없음</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
      <Briefcase size={12} />
      {count}건 진행중
    </span>
  );
}

function RoleBadge({ role }: { role: AdminUserRow["role"] }) {
  const isSuperAdmin = role === "super_admin";
  return (
    <span
      className={`inline-flex max-w-full truncate rounded-full px-2.5 py-1 text-xs font-semibold ${
        isSuperAdmin
          ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100"
          : "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200"
      }`}
    >
      {ADMIN_ROLE_LABELS[role]}
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
          : "bg-slate-100 text-slate-500 ring-slate-200"
      }`}
    >
      {active ? "활성" : "비활성"}
    </span>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// ── admin/documents/page.tsx와 동일한 디자인 시스템 복제 ──
// (Shell만 사이드바 "직원관리" 항목을 SidebarDisabled → SidebarLink(active)로
// 바꾼 것이 유일한 차이. 다른 메뉴 항목은 전혀 수정하지 않았다.)
function Shell({ children, active }: { children: React.ReactNode; active?: "users" }) {
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
            <SidebarLink href="/admin/users" label="직원관리" active={active === "users"} />
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

function SidebarLink({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
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

function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

function KpiCard({
  label,
  value,
  caption,
  icon,
}: {
  label: string;
  value: number;
  caption: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-600">{label}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">{value}</p>
          <p className="mt-2 text-xs text-slate-400">{caption}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">{icon}</div>
      </div>
    </div>
  );
}

function EmptyState({ message = "표시할 데이터가 없습니다." }: { message?: string }) {
  return <div className="flex min-h-40 items-center justify-center p-8 text-sm text-slate-400">{message}</div>;
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-slate-50 p-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-red-700">데이터를 불러오는 중 문제가 발생했습니다.</p>
        <p className="mt-2 text-sm text-red-600">{message}</p>
      </div>
    </main>
  );
}
