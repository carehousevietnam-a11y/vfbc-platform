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

import { notFound } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, UserCheck, UserX, Users as UsersIcon } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getCurrentAdminUser } from "@/lib/adminAuth/serverComponentClient";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import AddAdminModal from "./AddAdminModal";
import AdminUserActions, { type AdminUserRow } from "./AdminUserActions";
import { ADMIN_ROLE_LABELS } from "./roleLabels";

export const dynamic = "force-dynamic";

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
                />
              ))}
            </div>
            <div className="hidden lg:block">
              <AdminUserTable
                users={users}
                currentAdminId={currentAdmin.id}
                isOnlyActiveSuperAdmin={isOnlyActiveSuperAdmin}
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
}: {
  users: AdminUserRow[];
  currentAdminId: string;
  isOnlyActiveSuperAdmin: (id: string) => boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-fixed">
        <thead className="bg-slate-50">
          <tr className="border-b border-slate-200 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            <th className="w-[18%] px-5 py-3.5">이름</th>
            <th className="w-[22%] px-4 py-3.5">이메일</th>
            <th className="w-[14%] px-4 py-3.5">역할</th>
            <th className="w-[10%] px-4 py-3.5">상태</th>
            <th className="w-[14%] px-4 py-3.5">등록일</th>
            <th className="w-[14%] px-4 py-3.5">최근 수정일</th>
            <th className="w-[8%] px-5 py-3.5 text-right">관리</th>
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
}: {
  user: AdminUserRow;
  isSelf: boolean;
  isLastActiveSuperAdmin: boolean;
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
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
        <span>등록 {formatDate(user.created_at)}</span>
        <span>수정 {formatDate(user.updated_at)}</span>
      </div>
    </div>
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
