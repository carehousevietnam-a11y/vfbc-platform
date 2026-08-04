"use client";

// src/app/admin/reset-password/page.tsx
//
// [2026-08-03 비밀번호 재설정 기능 추가] 신규 파일.
// /admin/auth/callback을 정상적으로 통과한 뒤에만 실제로 비밀번호가
// 바뀐다 — 세션이 없는 상태로 이 페이지에 직접 접근하면 /api/admin/
// reset-password가 실패 응답을 반환하고, 이 페이지는 그 실패 메시지를
// 그대로 보여준다(별도의 "세션 있는지 사전 확인" 로직을 추가로 만들지
// 않고, 실제 변경 시도 결과로만 판단 — 존재하지 않는 검증 단계를
// 추측해서 만들지 않기 위함).
//
// 기존 로그인 페이지와 동일한 레이아웃·입력창·버튼 스타일을 재사용했다.

import { useState } from "react";
import { useRouter } from "next/navigation";

const MIN_PASSWORD_LENGTH = 8;

export default function AdminResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!password || !passwordConfirm) {
      setError("새 비밀번호를 모두 입력해주세요.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("입력한 두 비밀번호가 일치하지 않습니다.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, passwordConfirm }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.error ?? "비밀번호 변경에 실패했습니다.");
        setSubmitting(false);
        return;
      }
      router.push("/admin/login?reset=success");
    } catch {
      setError("접속 중 문제가 발생했습니다.");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 text-center">
          VFBCAI 관리자
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 text-center">
          새 비밀번호 설정
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="새 비밀번호 (8자 이상)"
            required
            autoFocus
            autoComplete="new-password"
            className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
          />
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="새 비밀번호 확인"
            required
            autoComplete="new-password"
            className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-full bg-blue-900 text-sm font-semibold text-white hover:bg-blue-950 disabled:opacity-60 transition-colors"
          >
            {submitting ? "변경 중..." : "비밀번호 변경"}
          </button>
        </form>
      </div>
    </main>
  );
}
