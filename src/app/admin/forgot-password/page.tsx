"use client";

// src/app/admin/forgot-password/page.tsx
//
// [2026-08-03 비밀번호 재설정 기능 추가] 신규 파일.
// 관리자 이메일을 입력받아 /api/admin/forgot-password로 전달한다.
// 실제 계정 존재 여부와 무관하게 항상 동일한 안내 메시지만 노출한다
// (API 응답 자체가 항상 동일한 메시지를 반환하므로 이 페이지는 그
// 메시지를 그대로 보여주기만 한다). 기존 로그인 페이지(src/app/admin/
// login/page.tsx)와 동일한 레이아웃·입력창·버튼 스타일을 그대로 사용해
// 디자인을 새로 만들지 않았다.

import { useState } from "react";
import Link from "next/link";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.error ?? "요청 중 문제가 발생했습니다.");
        setSubmitting(false);
        return;
      }
      setMessage(body?.message ?? "입력한 이메일이 등록되어 있다면 재설정 메일을 발송했습니다.");
      setSent(true);
      setSubmitting(false);
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
          비밀번호 재설정
        </h1>

        {sent ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
              {message}
            </p>
            <Link
              href="/admin/login"
              className="block text-center text-sm text-gray-500 hover:text-gray-700"
            >
              로그인으로 돌아가기
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="관리자 이메일"
              required
              autoFocus
              autoComplete="username"
              className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-full bg-blue-900 text-sm font-semibold text-white hover:bg-blue-950 disabled:opacity-60 transition-colors"
            >
              {submitting ? "전송 중..." : "재설정 링크 보내기"}
            </button>
            <Link
              href="/admin/login"
              className="block text-center text-sm text-gray-500 hover:text-gray-700"
            >
              로그인으로 돌아가기
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}
