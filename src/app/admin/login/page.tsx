"use client";

// src/app/admin/login/page.tsx
//
// [2026-08-03 STEP 1] 공용 접근 코드 입력 폼을 개인별 이메일/비밀번호
// 로그인 폼으로 교체했다.
// [수정 1] redirect 쿼리 파라미터를 검증 없이 router.push()에 그대로
// 넘기던 부분에 sanitizeAdminRedirect()를 추가했다.
// [수정 2] "/admin"으로 시작하기만 하면 통과시키던 방식은 "/admin-test",
// "/administrator" 같은 값도 허용해버리는 문제가 있었다. 정확히
// "/admin" 이거나 "/admin/"로 시작하는 경우만 허용하도록 강화했다.
// 추가로 "//"(프로토콜 상대 경로), "://"(외부 스킴), "\"(백슬래시 —
// 일부 브라우저가 "/\evil.com"을 "//evil.com"으로 해석하는 우회 방지),
// CR/LF(응답 스플리팅·경로 조작 방지)가 포함된 값도 전부 차단한다.
// [수정 3 - 비밀번호 재설정 기능 추가] 비밀번호 입력 아래에 "비밀번호를
// 잊으셨나요?" 링크(/admin/forgot-password)를 추가했다. 기존 로그인
// 폼 구조·필드는 그대로 유지했다. 로그인 페이지가 이미 useSearchParams를
// 쓰고 있어, /admin/reset-password 성공 후 돌아올 때 붙는 "?reset=success"
// 와 콜백 실패 시 붙는 "?error=reset_failed"를 같은 params로 읽어 배너로
// 보여준다.

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const DEFAULT_ADMIN_REDIRECT = "/admin/cases";

/**
 * redirect 쿼리 파라미터는 로그인 성공 후 이동할 내부 경로여야 한다.
 * 정확히 "/admin" 이거나 "/admin/"로 시작하는 경로만 허용하고, 그 외
 * (외부 URL, 프로토콜 상대 경로, 백슬래시 우회, CR/LF 삽입 등)는 전부
 * 차단해 기본값(/admin/cases)으로 대체한다(오픈 리다이렉트 방지).
 */
function sanitizeAdminRedirect(raw: string | null): string {
  if (!raw) return DEFAULT_ADMIN_REDIRECT;

  // 위험 문자가 하나라도 포함되어 있으면 그 즉시 차단한다.
  if (raw.includes("//")) return DEFAULT_ADMIN_REDIRECT;
  if (raw.includes("://")) return DEFAULT_ADMIN_REDIRECT;
  if (raw.includes("\\")) return DEFAULT_ADMIN_REDIRECT;
  if (raw.includes("\r") || raw.includes("\n")) return DEFAULT_ADMIN_REDIRECT;

  // "/admin" 자신이거나 "/admin/"로 시작하는 경로만 허용한다.
  // ("/admin-test", "/administrator"처럼 접두어만 같은 다른 경로는 차단)
  const isAdminPath = raw === "/admin" || raw.startsWith("/admin/");
  if (!isAdminPath) return DEFAULT_ADMIN_REDIRECT;

  return raw;
}

function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "로그인에 실패했습니다.");
        setSubmitting(false);
        return;
      }
      const redirect = sanitizeAdminRedirect(params.get("redirect"));
      router.push(redirect);
      router.refresh();
    } catch {
      setError("접속 중 문제가 발생했습니다.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3">
      {params.get("reset") === "success" && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
          비밀번호가 변경되었습니다.
        </p>
      )}
      {params.get("error") === "reset_failed" && (
        <p className="text-xs text-red-600">
          비밀번호 재설정 링크가 만료되었거나 유효하지 않습니다. 다시 시도해주세요.
        </p>
      )}
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
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
        required
        autoComplete="current-password"
        className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
      />
      <Link
        href="/admin/forgot-password"
        className="block text-right text-xs text-gray-500 hover:text-gray-700"
      >
        비밀번호를 잊으셨나요?
      </Link>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full h-12 rounded-full bg-blue-900 text-sm font-semibold text-white hover:bg-blue-950 disabled:opacity-60 transition-colors"
      >
        {submitting ? "확인 중..." : "로그인"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 text-center">
          VFBCAI 관리자
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 text-center">
          관리자 로그인
        </h1>
        <Suspense fallback={null}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </main>
  );
}
