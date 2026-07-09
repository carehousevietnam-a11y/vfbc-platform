"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, XCircle, Lock, ShieldAlert } from "lucide-react";

type Status = "loading" | "invalid" | "expired" | "needsPassword" | "showResult";

type ResultInfo = {
  name: string;
  serviceType: string | null;
  result: string | null;
};

const SERVICE_LABELS: Record<string, string> = {
  trc: "거주증(TRC) 진단",
  wp: "노동허가(WP) 진단",
  tamtru: "땀주(임시거주등록) 안내",
};

const RESULT_LABELS: Record<string, { label: string; tone: "emerald" | "amber" | "red" }> = {
  possible: { label: "가능", tone: "emerald" },
  conditional: { label: "조건부 가능", tone: "amber" },
  impossible: { label: "불가", tone: "red" },
};

function ResultContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [info, setInfo] = useState<ResultInfo | null>(null);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    fetch(`/api/result-status?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.valid) {
          setStatus(data.reason === "expired" ? "expired" : "invalid");
          return;
        }
        setInfo({
          name: data.name,
          serviceType: data.serviceType,
          result: data.result,
        });
        setStatus(data.passwordSet ? "showResult" : "needsPassword");
      })
      .catch((err) => {
        console.error("result-status fetch failed:", err);
        setStatus("invalid");
      });
  }, [token]);

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (password.length < 8) {
      setFormError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (password !== passwordConfirm) {
      setFormError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!agreeTerms) {
      setFormError("이용약관에 동의해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, agreeTerms }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "비밀번호 설정 중 문제가 발생했습니다.");
        setSubmitting(false);
        return;
      }
      setStatus("showResult");
    } catch (err) {
      console.error("set-password fetch failed:", err);
      setFormError("서버와 통신 중 문제가 발생했습니다.");
    }
    setSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <div className="mx-auto max-w-xl px-6 py-10">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          VFBC · 결과 확인
        </p>

        {status === "loading" && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-sm text-gray-500">결과를 불러오는 중입니다...</p>
          </div>
        )}

        {status === "invalid" && (
          <div className="mt-8 rounded-3xl bg-white border border-red-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <XCircle className="text-red-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              유효하지 않은 링크입니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              링크가 올바르지 않거나 이미 사용되었을 수 있습니다. 담당자에게
              문의해주세요.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-950 transition-colors"
            >
              홈으로 이동
            </Link>
          </div>
        )}

        {status === "expired" && (
          <div className="mt-8 rounded-3xl bg-white border border-amber-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <ShieldAlert className="text-amber-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              링크가 만료되었습니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              결과 확인 링크의 유효기간(30일)이 지났습니다. 담당자에게
              연락하시면 다시 안내해드립니다.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-950 transition-colors"
            >
              홈으로 이동
            </Link>
          </div>
        )}

        {status === "needsPassword" && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <Lock className="text-blue-900" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              {info?.name ? `${info.name}님, ` : ""}비밀번호를 설정하면 결과를
              확인할 수 있습니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              이름·연락처는 이미 등록되어 있어요. 비밀번호만 설정하시면
              가입이 완료되고, 진단 결과와 필요서류를 바로 확인하실 수
              있습니다.
            </p>

            <form onSubmit={handleSetPassword} className="mt-5 space-y-3">
              <input
                type="password"
                required
                minLength={8}
                placeholder="비밀번호 (8자 이상)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
              />
              <input
                type="password"
                required
                minLength={8}
                placeholder="비밀번호 확인"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
              />
              <label className="flex items-start gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5"
                />
                <span>(필수) VFBC 이용약관 및 개인정보 처리방침에 동의합니다.</span>
              </label>
              {formError && <p className="text-xs text-red-600">{formError}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-full bg-blue-900 text-sm font-semibold text-white hover:bg-blue-950 disabled:opacity-60 transition-colors"
              >
                {submitting ? "처리 중..." : "설정하고 결과 확인하기"}
              </button>
            </form>
          </div>
        )}

        {status === "showResult" && info && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CheckCircle2 className="text-emerald-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              가입이 완료되었습니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              {info.serviceType && SERVICE_LABELS[info.serviceType]
                ? SERVICE_LABELS[info.serviceType]
                : "진단"}{" "}
              결과입니다.
            </p>

            {info.result && RESULT_LABELS[info.result] && (
              <div
                className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${
                  RESULT_LABELS[info.result].tone === "emerald"
                    ? "bg-emerald-50 text-emerald-800"
                    : RESULT_LABELS[info.result].tone === "amber"
                    ? "bg-amber-50 text-amber-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                결과: {RESULT_LABELS[info.result].label}
              </div>
            )}

            <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-blue-900" />
              상세 필요서류·절차 안내는 담당자가 이어서 연락드립니다.
            </div>

            <Link
              href="/consultation"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-950 transition-colors"
            >
              지금 바로 상담 신청하기
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#fafafa]">
          <div className="h-[3px] bg-blue-900" />
          <div className="mx-auto max-w-xl px-6 py-10">
            <p className="text-sm text-gray-500">불러오는 중...</p>
          </div>
        </main>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
