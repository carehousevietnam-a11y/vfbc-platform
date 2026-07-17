"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  FileText,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Status = "loading" | "invalid" | "expired" | "preparing" | "ready";

type HelpState = "idle" | "submitting" | "submitted";

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

// service_type 매칭 전용 보조 함수 — 하이픈("verify-admin")과 언더스코어
// ("verify_admin") 표기가 혼재해도 같은 값으로 인식시키기 위한 것.
// 화면에 노출되는 문자열 자체를 바꾸는 게 아니라 매칭에만 쓰는 정규화 키다.
// (admin/cases/page.tsx, lib/notify/email.ts와 동일한 패턴)
function toPrefixKey(value: string): string {
  return value.toLowerCase().replace(/-/g, "_");
}

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
  if (!serviceType) return DEFAULT_DOCS;
  if (REQUIRED_DOCS[serviceType]) return REQUIRED_DOCS[serviceType];
  const key = toPrefixKey(serviceType);
  if (REQUIRED_DOCS[key]) return REQUIRED_DOCS[key];
  if (key.startsWith("verify")) return ["검토 대상 서류 사본"];
  return DEFAULT_DOCS;
}

function ResultContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const alreadyLoggedInPass = searchParams.get("al") === "1";

  const [status, setStatus] = useState<Status>("loading");
  const [info, setInfo] = useState<ResultInfo | null>(null);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const prepareTriggeredRef = useRef(false);

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
        setStatus(data.passwordSet ? "ready" : "preparing");
      })
      .catch((err) => {
        console.error("result-status fetch failed:", err);
        setStatus("invalid");
      });
  }, [token]);

  useEffect(() => {
    if (status !== "preparing" || !token || prepareTriggeredRef.current) return;
    prepareTriggeredRef.current = true;

    (async () => {
      try {
        const res = await fetch("/api/auto-join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (!res.ok) {
          console.error("auto-join(silent) failed");
        }
      } catch (err) {
        console.error("auto-join(silent) request failed:", err);
      } finally {
        setStatus("ready");
      }
    })();
  }, [status, token]);

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

  // 클릭 즉시 접수 — 중간 확인 화면 없이 한 번의 클릭으로 완료
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
        setHelpState("idle");
        helpTriggeredRef.current = false;
        return;
      }

      await supabase.from("crm_activities").insert({
        lead_id: newLeadId,
        action: "consultation_request",
        tag: "CONSULTATION",
      });

      // 대행 신청 접수 확인 이메일 발송 (원래 진단 결과의 token을 재사용해
      // 이름·이메일 재입력 없이 서버에서 바로 발송한다).
      // 이메일 발송이 실패하더라도 접수 자체는 이미 완료된 것이므로
      // 화면 흐름(submitted 처리)은 막지 않는다.
      try {
        await fetch("/api/agency-confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
      } catch (emailErr) {
        console.error("agency-confirm email trigger failed:", emailErr);
      }

      setHelpState("submitted");
    } catch (err) {
      console.error("help request failed:", err);
      setHelpError("서버와 통신 중 문제가 발생했습니다.");
      setHelpState("idle");
      helpTriggeredRef.current = false;
    }
  }

  const isSelfType = info?.serviceType && !info?.result;

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <div className="mx-auto max-w-xl px-6 py-10">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          VFBCAI · 결과 확인
        </p>

        {(status === "loading" || status === "preparing") && (
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

        {status === "ready" && info && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CheckCircle2 className="text-emerald-600" size={28} />

            <p className="mt-4 text-lg font-bold text-gray-900">
              {isSelfType
                ? `${info.name}님, ${
                    (info.serviceType && SERVICE_LABELS[info.serviceType]) || "자가등록"
                  }을 축하드립니다`
                : info.serviceType === "wp"
                ? "노동허가(WP) 진행 서류 및 절차"
                : `${
                    (info.serviceType && SERVICE_LABELS[info.serviceType]) || "진단"
                  } 결과입니다`}
            </p>

            {info.serviceType !== "wp" && info.result && RESULT_LABELS[info.result] && (
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

            {/* 필요서류 안내 — WP는 상세 3단계 가이드, 그 외 서비스는 간단 목록 */}
            {info.serviceType === "wp" ? (
              <>
                <div className="mt-5 space-y-3">
                  <div className="rounded-xl bg-gray-50 px-4 py-3">
                    <p className="text-xs font-semibold text-gray-700">
                      ① 한국에서 준비 (번역공증·영사인증 필요)
                    </p>
                    <ul className="mt-2 space-y-2">
                      <li className="text-xs text-gray-600 pl-1">
                        · 범죄경력증명서 — 발급 6개월 이내, 공증사무소 → 외교부
                        영사확인 → 주한 베트남대사관 인증 순으로 진행
                      </li>
                      <li className="text-xs text-gray-600 pl-1">
                        · 학위증명서(졸업증명서) — 신청 직책과 전공이
                        일치할수록 승인율이 높습니다
                      </li>
                      <li className="text-xs text-gray-600 pl-1">
                        · 경력증명서 — 관련 분야 3년 이상(기술직 5년 이상),
                        전 직장 직인·업무·근무기간 명시 필수
                      </li>
                    </ul>
                    <p className="mt-2 text-[11px] text-gray-400">
                      베트남은 아포스티유 협약국이 아니라, 아포스티유 대신
                      외교부 영사확인 절차를 거쳐야 합니다.
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 px-4 py-3">
                    <p className="text-xs font-semibold text-gray-700">
                      ② 베트남 현지에서 준비 (번역공증 불필요)
                    </p>
                    <ul className="mt-2 space-y-2">
                      <li className="text-xs text-gray-600 pl-1">
                        · 여권 원본 및 공증 사본 — 유효기간 6개월 이상(2년
                        이상 권장), 현지 공증사무소에서 전 페이지 사본 공증
                      </li>
                      <li className="text-xs text-gray-600 pl-1">
                        · 건강진단서 — 지정병원 발급 시 번역공증 불필요
                        (유효기간 6개월)
                      </li>
                      <li className="text-xs text-gray-600 pl-1">
                        · 증명사진 2~4매 — 4×6cm, 흰 배경, 최근 6개월 이내
                        촬영본
                      </li>
                      <li className="text-xs text-gray-600 pl-1">
                        · 임시거주지 확인서 — 집주인·호텔을 통해 관할 공안에
                        신고된 거주 확인서
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-xl bg-gray-50 px-4 py-3">
                    <p className="text-xs font-semibold text-gray-700">
                      ③ 초청 법인(회사)에서 준비
                    </p>
                    <ul className="mt-2 space-y-2">
                      <li className="text-xs text-gray-600 pl-1">
                        · 사업자등록증(ERC) 사본 공증
                      </li>
                      <li className="text-xs text-gray-600 pl-1">
                        · 외국인 채용수요 승인서 — 신청 최소 30일 전
                        인민위원회 또는 노동부 승인 필요 (가장 까다로운 단계)
                      </li>
                      <li className="text-xs text-gray-600 pl-1">
                        · 노동허가 신청서(Form 11/PLI) — 회사 직인 날인
                      </li>
                      <li className="text-xs text-gray-600 pl-1">
                        · 근로계약서 초안 또는 파견명령서 — 주재원은 한국
                        본사 파견명령서(영사인증)가 요구될 수 있음
                      </li>
                    </ul>
                  </div>
                </div>
                <p className="mt-4 text-sm font-bold text-gray-900">
                  정확하고 문제없이 빠르게 진행하시길 원한다면 반드시
                  전문가와 상의하세요.
                </p>
              </>
            ) : (
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
            )}

            {/* 대행 신청 — 클릭 1번으로 바로 접수, 중간 확인 없음 */}
            {helpState === "idle" && (
              <>
                <button
                  onClick={handleHelpRequest}
                  className="mt-5 w-full h-12 rounded-full bg-blue-900 text-sm font-semibold text-white hover:bg-blue-950 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} /> 대행 신청하기
                </button>
                {helpError && (
                  <p className="mt-2 text-xs text-red-600">{helpError}</p>
                )}
                <p className="mt-2 text-[11px] text-gray-400">
                  이름·연락처 재입력 없이 바로 접수됩니다.
                </p>
              </>
            )}

            {helpState === "submitting" && (
              <div className="mt-5 flex items-center gap-2 text-sm text-gray-500">
                <Loader2 size={16} className="animate-spin text-blue-900" />
                접수 중...
              </div>
            )}

            {helpState === "submitted" && (
              <div className="mt-5 rounded-xl bg-emerald-50 px-4 py-4">
                <div className="flex justify-center">
                  <img
                    src="/vfbc-seal.png"
                    alt="VFBCAI 접수완료 확인 도장"
                    width={140}
                    height={140}
                  />
                </div>
                <p className="mt-1 text-[10px] text-gray-400 text-center italic">
                  Vietnam Foreign Business Verification &amp; Compliance AI Center
                </p>
                <p className="mt-2 text-sm font-semibold text-emerald-800 text-center">
                  상담 신청이 접수되었습니다
                </p>
                <p className="mt-1 text-xs text-emerald-700 leading-relaxed text-center">
                  담당자가 카카오톡 또는 잘로(Zalo)로 곧 연락드립니다.
                </p>
              </div>
            )}

            <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-blue-900" />
              입력하신 전화번호로 계정이 생성되었습니다. 비밀번호는 자동
              생성되며, 마이페이지에서 언제든 변경하실 수 있습니다.
              거주증·노동허가·비자 등 만료 알림 서비스도 함께 이용하실 수
              있습니다.
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
