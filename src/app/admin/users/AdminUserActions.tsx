"use client";

// src/app/admin/users/AdminUserActions.tsx
//
// 관리자 계정 관리(STEP 2) — 신규 파일.
// 목록의 한 관리자 행에 대한 관리 기능(상세보기/활성-비활성/역할변경/
// 비밀번호 재설정 메일 발송)을 담당하는 작은 클라이언트 아일랜드.
// admin/cases/[leadId]/ExecutivePdfButton.tsx와 동일한 패턴(버튼 클릭 →
// 로딩상태 → fetch → 완료, Server Component 목록은 router.refresh()로
// 다시 불러옴)을 따른다.
//
// 보호 규칙(자기 자신 비활성화 금지, 마지막 super_admin 보호)은 서버
// (PATCH /api/admin/users/[id])가 최종적으로 강제한다. 여기서는 UX상
// 명백히 금지된 조작(본인 비활성화, 마지막 super_admin 비활성화/역할변경)만
// 버튼을 비활성화해 미리 안내한다 — 서버 검증을 대체하지 않는다.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreVertical, X } from "lucide-react";
import { ADMIN_ROLES, ADMIN_ROLE_LABELS, type AdminRole } from "./roleLabels";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export default function AdminUserActions({
  user,
  isSelf,
  isLastActiveSuperAdmin,
}: {
  user: AdminUserRow;
  isSelf: boolean;
  isLastActiveSuperAdmin: boolean;
}) {
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const canDeactivate = !isSelf && !(isLastActiveSuperAdmin && user.active);
  const canChangeRole = !isLastActiveSuperAdmin;

  // 관리 메뉴 위치 계산 — 관리자 목록 카드/테이블은 모서리를 둥글게
  // 보이려고 overflow-hidden/overflow-x-auto를 쓰고 있어(admin/users/page.tsx),
  // 메뉴를 그 안에 absolute로 두면 잘린다. z-index만 올리는 방식은 이
  // overflow 클리핑 자체를 해결하지 못해(요청사항), 메뉴를 document.body에
  // Portal로 그려 어떤 조상의 overflow에도 영향받지 않게 한다. 위치는
  // 버튼의 실제 화면 좌표(getBoundingClientRect)로 계산하고, 화면 우측
  // 밖으로 나가지 않도록 clamp한다.
  useEffect(() => {
    if (!menuOpen) {
      setMenuPos(null);
      return;
    }
    const btn = buttonRef.current;
    if (!btn) return;

    const MENU_WIDTH = 256; // w-64
    const EDGE_PADDING = 8;
    const rect = btn.getBoundingClientRect();
    let left = rect.right - MENU_WIDTH;
    left = Math.min(left, window.innerWidth - MENU_WIDTH - EDGE_PADDING);
    left = Math.max(left, EDGE_PADDING);
    const top = Math.min(rect.bottom + 6, window.innerHeight - EDGE_PADDING);
    setMenuPos({ top, left });

    // 스크롤/리사이즈 중에는 위치가 어긋나므로 계속 재계산하는 대신
    // 메뉴를 닫는다 — 잘못된 위치로 떠 있는 것보다 안전하다.
    const close = () => setMenuOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [menuOpen]);

  async function patch(payload: { active?: boolean; role?: AdminRole }) {
    if (pending) return;
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.error ?? "변경 중 오류가 발생했습니다.");
        setPending(false);
        return;
      }
      setMenuOpen(false);
      router.refresh();
    } catch {
      setError("접속 중 문제가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  async function handleResetPassword() {
    if (pending) return;
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/reset-password`, {
        method: "POST",
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.error ?? "메일 발송 중 오류가 발생했습니다.");
        setPending(false);
        return;
      }
      setNotice("비밀번호 재설정 메일을 발송했습니다.");
    } catch {
      setError("접속 중 문제가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
        aria-label="관리"
      >
        <MoreVertical size={15} />
      </button>

      {menuOpen &&
        menuPos &&
        createPortal(
          <>
            {/* 바깥 클릭으로 닫기 */}
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div
              style={{ position: "fixed", top: menuPos.top, left: menuPos.left, width: 256 }}
              className="z-50 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
            >
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setDetailOpen(true);
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                상세 보기
              </button>

              <button
                type="button"
                disabled={pending || !canDeactivate}
                onClick={() => patch({ active: !user.active })}
                title={
                  isSelf
                    ? "본인 계정은 비활성화할 수 없습니다."
                    : isLastActiveSuperAdmin && user.active
                    ? "마지막 남은 Super Admin은 비활성화할 수 없습니다."
                    : undefined
                }
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
              >
                {user.active ? "비활성화" : "활성화"}
              </button>

              <div className="px-3 py-2">
                <p className="mb-1 text-xs font-semibold text-slate-500">역할 변경</p>
                <select
                  value={user.role}
                  disabled={pending || !canChangeRole}
                  onChange={(e) => patch({ role: e.target.value as AdminRole })}
                  title={
                    isLastActiveSuperAdmin
                      ? "마지막 남은 Super Admin의 역할은 변경할 수 없습니다."
                      : undefined
                  }
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300"
                >
                  {ADMIN_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ADMIN_ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                disabled={pending}
                onClick={handleResetPassword}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                비밀번호 재설정 메일 발송
              </button>

              {error && <p className="px-3 pt-1 text-xs text-red-600">{error}</p>}
              {notice && <p className="px-3 pt-1 text-xs text-emerald-700">{notice}</p>}
            </div>
          </>,
          document.body
        )}

      {detailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-950">관리자 상세</h2>
              <button
                type="button"
                onClick={() => setDetailOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <DetailRow label="이름" value={user.name} />
              <DetailRow label="이메일" value={user.email} />
              <DetailRow label="역할" value={ADMIN_ROLE_LABELS[user.role]} />
              <DetailRow label="상태" value={user.active ? "활성" : "비활성"} />
              <DetailRow label="등록일" value={formatDate(user.created_at)} />
              <DetailRow label="최근 수정일" value={formatDate(user.updated_at)} />
            </dl>
            {/* 직원 업무관리(STEP 3) — 담당 업무/진행률/최근활동을 보여주는
                신규 페이지로 연결하는 링크만 추가. 기존 상세 모달의 다른
                내용/동작은 변경하지 않았다. */}
            <Link
              href={`/admin/users/${user.id}`}
              className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-blue-700 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              업무 현황 보기 →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="truncate text-right text-slate-800">{value}</dd>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
