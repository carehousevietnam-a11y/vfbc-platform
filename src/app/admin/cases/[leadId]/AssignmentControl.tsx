"use client";

// src/app/admin/cases/[leadId]/AssignmentControl.tsx
//
// 업무 배정(STEP 4) — 신규 파일.
// admin/cases/[leadId]/page.tsx의 기존 "담당자 정보" 카드(이미 존재하던
// "담당자 변경" 배지 자리) 안에 렌더링되는 작은 클라이언트 아일랜드.
// ExecutivePdfButton.tsx와 동일한 패턴(버튼/선택 → fetch → 완료,
// Server Component는 router.refresh()로 다시 불러옴)을 따른다.
//
// isSuperAdmin이 아니면 선택 UI 자체를 렌더링하지 않고 현재 담당자만
// 읽기 전용으로 보여준다 — "일반 관리자는 배정 불가"를 UI에서도 반영하되,
// 최종 방어는 API(POST /api/admin/leads/[leadId]/assignment, super_admin
// 전용)가 담당한다.

import { useState } from "react";
import { useRouter } from "next/navigation";

type ActiveAdminOption = { id: string; name: string; role: string };

function resolveDefaultSelection(
  currentAdminId: string | null,
  activeAdmins: ActiveAdminOption[]
): string {
  if (currentAdminId && activeAdmins.some((a) => a.id === currentAdminId)) {
    return currentAdminId;
  }
  return activeAdmins[0]?.id ?? "";
}

export default function AssignmentControl({
  leadId,
  currentAdminName,
  currentAdminId,
  isSuperAdmin,
  activeAdmins,
}: {
  leadId: string;
  currentAdminName: string | null;
  currentAdminId: string | null;
  isSuperAdmin: boolean;
  activeAdmins: ActiveAdminOption[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(() => resolveDefaultSelection(currentAdminId, activeAdmins));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isSuperAdmin) {
    return null;
  }

  async function handleAssign() {
    if (!selected || pending) return;
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/assignment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminUserId: selected }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.error ?? "배정 중 오류가 발생했습니다.");
        setPending(false);
        return;
      }
      setEditing(false);
      if (body?.message) setNotice(body.message);
      router.refresh();
    } catch {
      setError("접속 중 문제가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setSelected(resolveDefaultSelection(currentAdminId, activeAdmins));
            setError(null);
            setEditing(true);
          }}
          className="inline-flex h-7 items-center rounded-md border border-blue-200 px-2.5 text-[10px] font-bold text-blue-700 hover:bg-blue-50"
        >
          {currentAdminName ? "담당자 변경" : "담당자 지정"}
        </button>
        {notice && <span className="text-[10px] text-emerald-700">{notice}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        disabled={pending}
        className="h-7 rounded-md border border-slate-200 bg-white px-1.5 text-[10px]"
      >
        {activeAdmins.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleAssign}
        disabled={pending || !selected}
        className="inline-flex h-7 items-center rounded-md bg-blue-700 px-2.5 text-[10px] font-bold text-white disabled:opacity-60"
      >
        {pending ? "저장 중..." : "저장"}
      </button>
      <button
        type="button"
        onClick={() => {
          setEditing(false);
          setError(null);
        }}
        disabled={pending}
        className="inline-flex h-7 items-center rounded-md border border-slate-200 px-2 text-[10px] text-slate-500 hover:bg-slate-50"
      >
        취소
      </button>
      {error && <p className="ml-1 text-[10px] text-red-600">{error}</p>}
    </div>
  );
}
