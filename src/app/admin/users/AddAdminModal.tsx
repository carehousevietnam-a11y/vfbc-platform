"use client";

// src/app/admin/users/AddAdminModal.tsx
//
// 관리자 계정 관리(STEP 2) — 신규 파일.
// "관리자 추가" 버튼 + 모달. POST /api/admin/users만 호출하고, 인증/DB 로직은
// 전부 해당 API route(및 그 안에서 재사용하는 기존 recovery 흐름)에 있다.
// 성공 시 router.refresh()로 Server Component(page.tsx)의 목록을 다시
// 가져온다 — 이 프로젝트 기존 관례(AdminLogoutButton.tsx)와 동일한 패턴.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { ADMIN_ROLES, ADMIN_ROLE_LABELS, type AdminRole } from "./roleLabels";

export default function AddAdminModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("staff");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetAndClose() {
    setOpen(false);
    setName("");
    setEmail("");
    setRole("staff");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.error ?? "관리자 추가 중 오류가 발생했습니다.");
        setSubmitting(false);
        return;
      }
      resetAndClose();
      router.refresh();
    } catch {
      setError("접속 중 문제가 발생했습니다.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
      >
        <Plus size={16} />
        관리자 추가
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-950">관리자 추가</h2>
              <button
                type="button"
                onClick={resetAndClose}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-blue-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="off"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-blue-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">역할</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminRole)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-blue-700 focus:outline-none"
                >
                  {ADMIN_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ADMIN_ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <p className="text-[11px] leading-relaxed text-slate-400">
                비밀번호는 생성하지 않습니다. 계정 생성 후 본인이 이메일로 받은
                링크를 통해 직접 비밀번호를 설정합니다.
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="mt-1 h-11 w-full rounded-lg bg-blue-700 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "추가 중..." : "관리자 추가"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
