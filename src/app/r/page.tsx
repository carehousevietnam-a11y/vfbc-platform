"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  UserPlus,
  ShieldAlert,
  FileText,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Status =
  | "loading"
  | "invalid"
  | "expired"
  | "needsConsent"
  | "joining"
  | "ready";

type HelpState = "idle" | "asking" | "submitting" | "submitted";

type ResultInfo = {
  leadId: string;
  name: string;
  phone: string;
  address: string;
  kakaoId: string | null;
  zaloId: string | null;
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

// 서비스 유형별 1차 필요서류 체크리스트
const REQUIRED_DOCS: Record<string, string[]> = {
  tamtru: ["여권 사본", "임대차 계약서 (또는 집주인 확인서)", "숙소 주소지 증빙"],
  trc: ["여권 사본", "비자 사본", "재직증명서 또는 사업자등록증", "임대차 계약서"],
  wp: [
    "여권 사본",
    "최종학력 증명서 (아포스티유)",
    "범죄경력증명서 (아포스티유)",
    "건강진단서",
  ],
};
const DEFAULT_DOCS = ["여권 사본", "관련 증빙서류"];

function getDocs(serviceType: string | null) {
  if (serviceType && REQUIRED_DOCS[serviceType]) return REQUIRED_DOCS[serviceType];
  if (serviceType?.startsWith("verify-")) return ["검토 대상 서류 사본"];
  return DEFAULT_DOCS;
}

function ResultContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const alreadyLoggedInPass = searchParams.get("al") === "1";

  const [status, setStatus] = useState<Status>("loading");
  const [info, setInfo] = useState<ResultInfo | null>(null);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);

  const [helpState, setHelpState] = useState<HelpState>("idle");
  const [helpError, setHelpError] = useState<string | null>(null);
  const helpTriggeredRef = useRef(false);

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
          leadId: data.leadId,
          name: data.name,
          phone: data.phone,
          address: data.address,
          kakaoId: data.kakaoId,
          zaloId: data.zaloId,
          serviceType: data.serviceType,
          result: data.result,
        });
        setStatus(data.passwordSet ? "ready" : "needsConsent");
      })
      .catch((err) => {
        console.error("result-status fetch failed:", err);
        setStatus("invalid");
      });
  }, [token]);

  // "ready" 상태에 도달하면 자동 로그인을 시도한다 (al=1로 이미 처리된 경우 제외)
  useEffect(() => {
    if (status !== "ready" || !token || loginAttempted || alreadyLoggedInPass) {
      return;
    }
    setLoginAttempted(true);

    (async () => {
      try {
        const res = await fetch("/api/auto-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!res.ok || !data.actionLink) {
          console.error("auto-login failed:", data);
          return;
        }
        window.location.href = data.actionLink;
      } catch (err) {
        console.error("auto-login request failed:", err);
      }
    })();
  }, [status, token, loginAttempted, alreadyLoggedInPass]);

  async function handleAutoJoin() {
    if (!token) return;
    setStatus("joining");
    setConsentError(null);
    try {
      const res = await fetch("/api/auto-join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setConsentError(data.error || "가입 처리 중 문제가 발생했습니다.");
        setStatus("needsConsent");
        return;
      }
      setStatus("ready");
    } catch (err) {
      console.error("auto-join fetch failed:", err);
      setConsentError("서버와 통신 중 문제가 발생했습니다.");
      setStatus("needsConsent");
    }
  }

  async function handleHelpRequest() {
    if (!info || helpTriggeredRef.current) return;
    helpTriggeredRef.current = true;
    setHelpState("submitting");
    setHelpError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id ?? null;

      const newLeadId = crypto.randomUUID();
      const { error: insertError } = await supabase.from("leads").insert({
        id: newLeadId,
        name: info.name,
        phone: info.phone,
        address: info.address,
        kakao_id: info.kakaoId,
        zalo_id: info.zaloId,
        service_type: "consultation",
        result: info.serviceType,
        source_page: "/r",
        user_id: userId,
      });

      if (insertError) {
        console.error(insertError);
        setHelpError("접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
        setHelpState("asking");
        helpTriggeredRef.current = false;
        return;
      }

      await supabase.from("crm_activities").insert({
        lead_id: newLeadId,
        action: "consultation_request",
        tag: "CONSULTATION",
      });

      setHelpState("submitted");
    } catch (err) {
      console.error("help request failed:", err);
      setHelpError("서버와 통신 중 문제가 발생했습니다.");
      setHelpState("asking");
      helpTriggeredRef.current = false;
    }
  }

  const isSelfType = info?.serviceType && !info?.result;

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

        {(status === "needsConsent" || status === "joining") && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <UserPlus className="text-blue-900" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              {info?.name ? `${info.name}님, ` : ""}결과를 보시려면 자동
              회원가입이 필요합니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              이름·연락처는 이미 등록되어 있어 추가 입력 없이 자동으로
              가입됩니다. 비밀번호도 자동 생성되며, 필요하시면 마이페이지에서
              언제든 변경하실 수 있습니다.
            </p>

            <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-xs text-blue-900 leading-relaxed space-y-1">
              <p className="font-semibold">회원가입 시 이런 혜택이 있어요</p>
              <p>· 비자·노동허가·거주증 만료 임박 알림</p>
              <p>· 베트남 법률 개정 및 최신 뉴스 소식 수신</p>
              <p>· 마이페이지에서 언제든 비밀번호 변경 가능</p>
            </div>

            {consentError && (
              <p className="mt-3 text-xs text-red-600">{consentError}</p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                onClick={handleAutoJoin}
                disabled={status === "joining"}
                className="flex-1 h-12 rounded-full bg-blue-900 text-sm font-semibold text-white hover:bg-blue-950 disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2"
              >
                {status === "joining" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> 처리 중...
                  </>
                ) : (
                  "네, 가입하고 결과 볼게요"
                )}
              </button>
              <button
                disabled={status === "joining"}
                className="h-12 px-5 rounded-full border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-60 transition-colors"
              >
                다음에 할게요
              </button>
            </div>
          </div>
        )}

        {status === "ready" && info && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CheckCircle2 className="text-emerald-600" size={28} />

            <p className="mt-4 text-lg font-bold text-gray-900">
              {isSelfType
                ? `${info.name}님, ${
                    (info.serviceType && SERVICE_LABELS[info.serviceType]) || "자가등록"
                  }을 축하드립니다`
                : `${
                    (info.serviceType && SERVICE_LABELS[info.serviceType]) || "진단"
                  } 결과입니다`}
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

            {isSelfType && (
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                스스로 잘 진행하고 계세요. 응원합니다 🎉
              </p>
            )}

            {/* 필요서류 1차 안내 */}
            <div className="mt-5 rounded-xl bg-gray-50 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <FileText size={14} className="text-blue-900" />
                미리 준비하면 좋은 서류
              </div>
              <ul className="mt-2 space-y-1">
                {getDocs(info.serviceType).map((doc) => (
                  <li key={doc} className="text-xs text-gray-600 pl-1">
                    · {doc}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-gray-400">
                정확한 요건은 상황에 따라 다를 수 있어 담당자 확인이 필요합니다.
              </p>
            </div>

            {/* 도움 요청 Y/N — 인라인 처리, 페이지 이동 없음 */}
            {helpState === "idle" && (
              <button
                onClick={() => setHelpState("asking")}
                className="mt-5 w-full h-12 rounded-full bg-blue-900 text-sm font-semibold text-white hover:bg-blue-950 transition-colors inline-flex items-center justify-center gap-2"
              >
                <MessageSquare size={16} /> 막히면 도움 신청하기
              </button>
            )}

            {helpState === "asking" && (
              <div className="mt-5 rounded-xl border border-gray-100 p-4">
                <p className="text-sm text-gray-700">
                  담당자에게 바로 도움을 요청할까요?
                </p>
                {helpError && (
                  <p className="mt-2 text-xs text-red-600">{helpError}</p>
                )}
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={handleHelpRequest}
                    className="flex-1 h-11 rounded-full bg-blue-900 text-sm font-semibold text-white hover:bg-blue-950 transition-colors"
                  >
                    네, 요청할게요
                  </button>
                  <button
                    onClick={() => setHelpState("idle")}
                    className="h-11 px-5 rounded-full border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    괜찮아요
                  </button>
                </div>
              </div>
            )}

            {helpState === "submitting" && (
              <div className="mt-5 flex items-center gap-2 text-sm text-gray-500">
                <Loader2 size={16} className="animate-spin text-blue-900" />
                접수 중...
              </div>
            )}

            {helpState === "submitted" && (
              <div className="mt-5 rounded-xl bg-emerald-50 px-4 py-3">
                <p className="text-sm font-semibold text-emerald-800">
                  상담 신청이 접수되었습니다
                </p>
                <p className="mt-1 text-xs text-emerald-700 leading-relaxed">
                  담당자가 카카오톡 또는 잘로(Zalo)로 곧 연락드립니다.
                </p>
              </div>
            )}

            <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-blue-900" />
              마이페이지에서 비밀번호 변경 및 만료 알림·법률 뉴스 수신 설정을
              하실 수 있습니다.
            </div>
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
