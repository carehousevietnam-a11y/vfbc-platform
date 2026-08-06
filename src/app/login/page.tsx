"use client";

// src/app/login/page.tsx
//
// [STEP20-5] Magic Link 로그인 배포 전 마지막 안정화.
//
// 이번 스텝에서 바뀐 것:
// 1) next 허용 범위를 "/"로 시작하는 모든 내부 경로에서 "/mypage 및
//    그 하위 경로"로 좁혔다(sanitizeNext 참고) — 로그인이 필요한 화면은
//    현재 /mypage 계열뿐이므로, 그 외 값은 자동으로 "/mypage"로 대체된다.
// 2) supabase.auth.signInWithOtp()에 shouldCreateUser: false를 추가했다
//    — 계정이 없는 이메일로는 새 Auth 계정이 자동 생성되지 않는다.
//    기존 고객(리드폼 제출로 이미 계정이 있는 사람)만 이 화면으로
//    로그인할 수 있다.
//
// [STEP20-4에서 온 것, 계속 유지]
// - URL의 ?next= 값이 있으면 그 경로로, 없으면 "/mypage"로 로그인 후
//   이동한다.
// - 발송 완료 화면에 스팸함 확인·만료 안내 문구 + "다른 이메일 사용" 버튼.
// - STRINGS를 { ko: {...} } 구조로 관리(다음 스텝에서 en/zh/vi 추가 예정).
//
// 인증 방식(supabase.auth.signInWithOtp) 자체는 STEP20-3과 동일하다 —
// 새 API 라우트, 새 테이블, 새 콜백 페이지를 여전히 만들지 않았다.
// mypage/page.tsx도 이번 스텝에서 전혀 수정하지 않았다.
//
// 기존 /r?token=...(자동로그인) 흐름은 이 파일과 전혀 무관하며 손대지
// 않았다 — 완전히 별개의 로그인 경로로 계속 공존한다.

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const DEFAULT_NEXT = "/mypage";

// [STEP20-4] 다국어 준비 구조 — 이번 스텝은 ko만 채운다.
// 다음 스텝에서 en/zh/vi를 같은 키 구조로 추가하면 된다.
const STRINGS = {
  ko: {
    eyebrow: "VFBCAI · 베트남 외국인 비즈니스 검증·등록 AI 센터",
    title: "로그인",
    description: "이메일로 로그인 링크를 보내드립니다. 링크를 클릭하면 자동으로 로그인됩니다.",
    emailPlaceholder: "이메일",
    submit: "로그인 링크 보내기",
    submitting: "전송 중...",
    successTitle: "이메일을 확인해주세요",
    successHint1: "입력하신 이메일로 로그인 링크를 보냈습니다.",
    successHint2: "메일이 보이지 않으면 스팸함도 확인해주세요.",
    successHint3: "링크는 일정 시간이 지나면 만료됩니다.",
    useAnotherEmail: "다른 이메일 사용",
    backHome: "홈으로",
    genericError: "로그인 링크 발송에 실패했습니다. 이메일 주소를 확인해주세요.",
  },
} as const;

const T = STRINGS.ko;

// 기존 프로젝트가 이미 쓰고 있는 사이트 주소 폴백 규칙과 동일
// (src/app/api/auto-login/route.ts, src/lib/notify/email.ts).
function getSiteUrl(): string {
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vfbc-platform.vercel.app";
  return rawSiteUrl.replace(/\/+$/, "");
}

// [STEP20-5] src/app/admin/login/page.tsx의 sanitizeAdminRedirect()와
// 동일한 검증 원칙(위험 문자 차단)을 재사용하되, 허용 범위를 "/"로
// 시작하는 모든 내부 경로에서 "/mypage 및 그 하위 경로"로 한 단계 더
// 좁혔다(admin이 "/admin" 접두어만 허용하는 것과 동일한 구조). 로그인이
// 필요한 화면은 현재 /mypage 계열뿐이므로, 그 외 값은 전부 기본값으로
// 대체한다.
function sanitizeNext(raw: string | null): string {
  if (!raw) return DEFAULT_NEXT;
  if (raw.includes("//")) return DEFAULT_NEXT;
  if (raw.includes("://")) return DEFAULT_NEXT;
  if (raw.includes("\\")) return DEFAULT_NEXT;
  if (raw.includes("\r") || raw.includes("\n")) return DEFAULT_NEXT;

  const isMypagePath =
    raw === "/mypage" || raw.startsWith("/mypage/") || raw.startsWith("/mypage?");
  if (!isMypagePath) return DEFAULT_NEXT;

  return raw;
}

function CustomerLoginForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const nextPath = sanitizeNext(params.get("next"));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${getSiteUrl()}${nextPath}`,
        // [STEP20-5] 기존 고객만 로그인 가능하도록 강제한다 — 계정이 없는
        // 이메일 주소로는 새 Auth 계정을 자동 생성하지 않는다. 신규 회원은
        // 여전히 기존 방식(리드폼 제출 → 계정 자동 생성)으로만 만들어진다.
        shouldCreateUser: false,
      },
    });

    if (otpError) {
      setError(T.genericError);
      setSubmitting(false);
      return;
    }

    setSent(true);
    setSubmitting(false);
  }

  function handleUseAnotherEmail() {
    setSent(false);
    setError(null);
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col items-center">
        <img src="/vfbcai-shield-logo.png" alt="VFBCAI" width={44} height={44} />
        <p className="mt-4 text-center text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          {T.eyebrow}
        </p>
        <h1 className="mt-2 text-center text-2xl font-bold tracking-tight text-gray-900">
          {T.title}
        </h1>
        <p className="mt-2 text-center text-xs leading-5 text-gray-500">{T.description}</p>
      </div>

      {sent ? (
        <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-4 shadow-sm">
          <p className="text-center text-sm font-bold text-emerald-800">{T.successTitle}</p>
          <ul className="mt-3 space-y-1.5 text-center text-xs leading-5 text-emerald-700">
            <li>{T.successHint1}</li>
            <li>{T.successHint2}</li>
            <li>{T.successHint3}</li>
          </ul>
          <button
            type="button"
            onClick={handleUseAnotherEmail}
            className="mt-4 h-10 w-full rounded-xl border border-emerald-200 bg-white text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50"
          >
            {T.useAnotherEmail}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={T.emailPlaceholder}
            required
            autoFocus
            autoComplete="email"
            className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm shadow-sm transition focus:border-blue-900 focus:outline-none"
          />

          {error && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="h-12 w-full rounded-full bg-blue-900 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-950 disabled:opacity-60"
          >
            {submitting ? T.submitting : T.submit}
          </button>
        </form>
      )}

      <Link
        href="/"
        className="mt-5 block text-center text-xs text-gray-500 transition hover:text-gray-700"
      >
        {T.backHome}
      </Link>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-6">
      <Suspense fallback={null}>
        <CustomerLoginForm />
      </Suspense>
    </main>
  );
}
