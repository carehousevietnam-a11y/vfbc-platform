"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const ACCOUNTS = [
  { key: "org_a_owner", label: "조직 A 대표 (company_owner)" },
  { key: "org_b_owner", label: "조직 B 대표 (company_owner)" },
  { key: "vnk_expert", label: "조직 A 배정 vnk_expert" },
] as const;

export default function DevAccountingLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  if (process.env.NODE_ENV !== "development") {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center text-sm text-[#4B5563]">
        이 화면은 로컬 개발 환경에서만 사용할 수 있습니다.
      </main>
    );
  }

  async function login(account: string) {
    setLoading(account);
    setError(null);
    const res = await fetch("/api/dev/accounting-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account, password }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof json.error === "string" ? json.error : "로그인에 실패했습니다.");
      setLoading(null);
      return;
    }
    const accessToken =
      typeof json.session?.access_token === "string" ? json.session.access_token : "";
    const refreshToken =
      typeof json.session?.refresh_token === "string" ? json.session.refresh_token : "";
    if (!accessToken || !refreshToken) {
      setError("세션을 받지 못했습니다. API 응답을 확인해주세요.");
      setLoading(null);
      return;
    }
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (sessionError) {
      setError(sessionError.message);
      setLoading(null);
      return;
    }
    window.location.href = typeof json.redirect === "string" ? json.redirect : "/company/accounting/transactions";
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center gap-6 px-4 py-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">로컬 전용</p>
        <h1 className="mt-1 text-xl font-extrabold text-[#071A33]">회계 모듈 테스트 로그인</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#4B5563]">
          비밀번호는 <code className="text-xs">tests/accounting/dev-local-login-seed.mjs</code>와 동일한 설정 파일에
          있습니다. 운영 빌드·운영 DB에서는 비활성입니다.
        </p>
        <p className="mt-2 text-xs text-[#92400E]">
          /login 메일 링크: 로컬은 OTP SMTP·shouldCreateUser 정책 때문에 실패할 수 있음 → 이 화면 사용.
        </p>
      </div>
      <label className="block text-sm font-semibold text-[#071A33]">
        비밀번호
        <input
          type="password"
          autoComplete="off"
          className="mt-1 w-full rounded-lg border border-[#E3E8F0] px-3 py-2 text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error ? <p className="text-sm text-[#B91C1C]">{error}</p> : null}
      <div className="flex flex-col gap-2">
        {ACCOUNTS.map((a) => (
          <button
            key={a.key}
            type="button"
            disabled={!password || loading !== null}
            onClick={() => login(a.key)}
            className="min-h-11 rounded-lg bg-[#071A33] px-4 text-left text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading === a.key ? "로그인 중…" : a.label}
          </button>
        ))}
      </div>
      <Link href="/" className="text-center text-sm text-[#3D4B63] underline">
        홈으로
      </Link>
    </main>
  );
}
