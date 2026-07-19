"use client";

// src/app/mypage/page.tsx
//
// 고객용 My Page v2. 로그인 방식은 v1과 동일하게 새로 만들지 않는다 —
// /r 결과확인 페이지에서 자동으로 생기는 Supabase Auth 세션을 그대로 쓴다.
//
// ⚠️ 절대 금지 경계 (변경 없음): expertBrief / expert_brief / checkedItems /
// rejectionRisks / recommendedSteps / similarCases 등 AI의 내부 판단 근거는
// /api/mypage-data가 애초에 응답에 포함하지 않는다. 이 페이지는 그 API가
// 반환하는 필드만 사용하므로, 여기서도 그런 내부 데이터를 다룰 수 없다.

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Download,
  MessageSquare,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type CategoryKey = "check" | "verify" | "register" | "consultation" | "unclassified";

const CATEGORY_BADGE: Record<CategoryKey, { label: string; className: string }> = {
  check: { label: "CHECK", className: "bg-blue-50 text-blue-700" },
  verify: { label: "VERIFY", className: "bg-gray-100 text-gray-600" },
  register: { label: "REGISTER", className: "bg-amber-50 text-amber-700" },
  consultation: { label: "상담", className: "bg-teal-50 text-teal-700" },
  unclassified: { label: "안내", className: "bg-gray-100 text-gray-500" },
};

const RESULT_LABELS: Record<string, { label: string; className: string }> = {
  possible: { label: "가능", className: "text-emerald-700" },
  conditional: { label: "조건부 가능", className: "text-amber-700" },
  impossible: { label: "어려움", className: "text-red-700" },
};

// 예상 처리기간 안내 — DB 컬럼이 아니라, 각 서비스 진단 로직(checkDiagnosis.ts,
// register/*/page.tsx의 estimatedDays)에 이미 쓰이던 값을 그대로 옮겨온
// 화면 표시용 고정 참고자료다. 실제 처리기간은 서류 상태에 따라 달라질 수 있다.
const ESTIMATED_DAYS: Record<string, string> = {
  wp: "30~60 영업일",
  trc: "15~45 영업일",
  tamtru: "1~3 영업일",
  "driving-license": "7~15 영업일",
  permit_company: "20~55 영업일",
  register_restaurant: "15~30 영업일",
  register_cosmetics: "20~40 영업일",
  register_environment: "25~50 영업일",
  register_fire_safety: "10~25 영업일",
  register_hygiene: "10~20 영업일",
  register_medical_device: "30~60 영업일",
  register_franchise: "20~45 영업일",
};
const VERIFY_ESTIMATE = "2~5 영업일 (전문가 확인 기준)";
const CONSULTATION_ESTIMATE = "1~2 영업일 (담당자 확인 기준)";

function getEstimate(category: CategoryKey, serviceType: string | null): string {
  if (category === "verify") return VERIFY_ESTIMATE;
  if (category === "consultation") return CONSULTATION_ESTIMATE;
  if (serviceType && ESTIMATED_DAYS[serviceType]) return ESTIMATED_DAYS[serviceType];
  return "담당자 확인 후 안내";
}

// 담당 전문가 표기 — 고정 문구. DB 컬럼 없음(담당자 배정 컬럼이 존재하지
// 않는다는 사실은 admin/leads/[id]/page.tsx 작업 때 이미 확인된 내용과 동일).
const EXPERT_TEAM_LABEL = "VFBCAI 법률자문팀 (Linda Kang · VNK 파트너)";

type MyPageItem = {
  id: string;
  category: CategoryKey;
  serviceType: string | null;
  serviceLabel: string;
  result: string | null;
  feasibilityScore: number | null;
  hasDiagnosis: boolean;
  hasExpertReview: boolean;
  hasAgency: boolean;
  hasConsultationRequest: boolean;
  fileUrl: string | null;
  fileName: string | null;
  createdAt: string;
};

type LoadState = "checking" | "signed-out" | "loading" | "ready" | "error";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── 단계별 타임라인 구성 ──
// 판단 기준은 오직 crm_activities.action 기반 boolean(hasDiagnosis/
// hasExpertReview/hasAgency/hasConsultationRequest)뿐이다. "정부 제출"·
// "허가 완료"·"전문가 안내 대기" 등은 이를 감지할 action이 실제로 없으므로
// 항상 미완료(○)로 표시된다 — 완료로 임의 표시하지 않는다.
// VERIFY는 플랫폼 원칙상 정부 제출을 대행하지 않으므로 별도의 짧은
// 타임라인을 쓴다(정부 제출/허가완료 단계를 넣지 않음).
function buildSteps(item: MyPageItem): { label: string; done: boolean }[] {
  if (item.category === "verify") {
    return [
      { label: "접수 완료", done: true },
      { label: "자체 진단 완료", done: item.hasDiagnosis },
      { label: "전문가 검토 요청", done: item.hasExpertReview },
      { label: "전문가 안내 대기", done: false },
    ];
  }
  if (item.category === "consultation") {
    return [
      { label: "상담 접수 완료", done: true },
      { label: "담당자 확인 대기", done: false },
    ];
  }
  // CHECK / REGISTER
  return [
    { label: "접수 완료", done: true },
    { label: "AI 진단 완료", done: item.hasDiagnosis },
    { label: "전문가 검토", done: item.hasExpertReview },
    { label: "대행 신청", done: item.hasAgency },
    { label: "정부 제출", done: false },
    { label: "허가 완료", done: false },
  ];
}

function nextStepLabel(item: MyPageItem, steps: { label: string; done: boolean }[]): string {
  const firstPending = steps.find((s) => !s.done);
  if (!firstPending) return "안내 대기";
  return firstPending.label + " 예정";
}

function StepTimeline({ steps }: { steps: { label: string; done: boolean }[] }) {
  return (
    <div className="mt-4 space-y-0">
      {steps.map((step, i) => (
        <div key={step.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            {step.done ? (
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            ) : (
              <Circle size={20} className="text-gray-300 shrink-0" />
            )}
            {i < steps.length - 1 && (
              <div className={`w-px flex-1 min-h-[18px] ${step.done ? "bg-emerald-200" : "bg-gray-200"}`} />
            )}
          </div>
          <p
            className={`pb-4 text-sm ${
              step.done ? "font-semibold text-gray-900" : "text-gray-400"
            }`}
          >
            {step.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function ProgressCard({ item }: { item: MyPageItem }) {
  const steps = buildSteps(item);
  const doneCount = steps.filter((s) => s.done).length;
  const percent = Math.round((doneCount / steps.length) * 100);
  const currentLabel = [...steps].reverse().find((s) => s.done)?.label ?? steps[0].label;

  return (
    <div className="rounded-2xl bg-blue-50/60 px-4 py-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-blue-900">진행률</p>
        <p className="text-xl font-bold text-blue-900">{percent}%</p>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-blue-900 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-blue-800">
        현재 단계 · <span className="font-semibold">{currentLabel}</span>
      </p>
    </div>
  );
}

function LeadCard({ item }: { item: MyPageItem }) {
  const badge = CATEGORY_BADGE[item.category];
  const resultInfo = item.result ? RESULT_LABELS[item.result] ?? null : null;
  const steps = buildSteps(item);
  const estimate = getEstimate(item.category, item.serviceType);
  const nextStep = nextStepLabel(item, steps);

  return (
    <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${badge.className}`}>
          {badge.label}
        </span>
        <span className="text-[11px] text-gray-400">{formatDate(item.createdAt)}</span>
      </div>

      <p className="mt-3 text-lg font-bold text-gray-900">{item.serviceLabel}</p>

      {/* ② 진행률 카드 */}
      <div className="mt-4">
        <ProgressCard item={item} />
      </div>

      {/* ① 진행 타임라인 */}
      <div className="mt-5">
        <p className="text-xs font-semibold text-gray-700">진행 현황</p>
        <StepTimeline steps={steps} />
      </div>

      {/* ③ AI 결과 영역 */}
      {(typeof item.feasibilityScore === "number" || resultInfo) && (
        <div className="rounded-2xl bg-gray-50 px-5 py-5 text-center">
          <p className="text-xs font-semibold text-gray-500">AI 예측 결과</p>
          {typeof item.feasibilityScore === "number" && (
            <>
              <p className="mt-1 text-[11px] text-gray-400">허가 가능성</p>
              <p className="mt-1 text-4xl font-extrabold text-blue-900">
                {item.feasibilityScore}%
              </p>
            </>
          )}
          {resultInfo && (
            <p className={`mt-2 text-sm font-bold ${resultInfo.className}`}>
              결과 {resultInfo.label}
            </p>
          )}
          <p className="mt-2 text-[10px] text-gray-400 leading-relaxed">
            1차 자가진단 결과이며, 정확한 진행 가능 여부는 서류 검토 후 확정됩니다.
          </p>
        </div>
      )}

      {/* ⑦ 전문가 정보 */}
      <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-3">
        <p className="text-[11px] font-semibold text-gray-500">담당 전문가</p>
        <p className="mt-1 text-sm font-semibold text-gray-800">{EXPERT_TEAM_LABEL}</p>
        <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">
          {item.hasExpertReview
            ? "이 신청은 현재 전문가팀이 함께 검토하고 있습니다."
            : "필요 시 전문가 검토를 요청하실 수 있습니다."}
        </p>
      </div>

      {/* ⑤ 첨부파일 */}
      {item.fileUrl && (
        <a
          href={item.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-blue-900 px-4 py-2 text-xs font-semibold text-blue-900 hover:bg-blue-50 transition-colors"
        >
          <Download size={14} /> {item.fileName ?? "첨부서류 다운로드"}
        </a>
      )}

      {/* ④ 카드 하단 — 다음 단계 / 예상 처리기간 */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-gray-50 px-4 py-3">
          <p className="text-[11px] text-gray-500">다음 단계</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{nextStep}</p>
        </div>
        <div className="rounded-xl bg-gray-50 px-4 py-3">
          <p className="text-[11px] text-gray-500">예상 처리기간</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{estimate}</p>
        </div>
      </div>
    </div>
  );
}

export default function MyPage() {
  const [state, setState] = useState<LoadState>("checking");
  const [name, setName] = useState<string | null>(null);
  const [items, setItems] = useState<MyPageItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        setState("signed-out");
        return;
      }

      setState("loading");
      try {
        const res = await fetch("/api/mypage-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken }),
        });
        const data = await res.json();

        if (!res.ok) {
          if (res.status === 401) {
            setState("signed-out");
            return;
          }
          setErrorMessage(data?.error ?? "정보를 불러오지 못했습니다.");
          setState("error");
          return;
        }

        setName(data.name ?? null);
        setItems(data.items ?? []);
        setState("ready");
      } catch (err) {
        console.error("mypage fetch failed:", err);
        setErrorMessage("서버와 통신 중 문제가 발생했습니다.");
        setState("error");
      }
    })();
  }, []);

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          VFBCAI · 마이페이지
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
          {name ? `${name}님의 신청 내역` : "내 신청 내역"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          지금까지 접수하신 서비스와 진행 상태를 확인하실 수 있습니다.
        </p>

        {state === "checking" && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-sm text-gray-500">확인 중...</p>
          </div>
        )}

        {state === "loading" && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-sm text-gray-500">신청 내역을 불러오는 중...</p>
          </div>
        )}

        {state === "signed-out" && (
          <div className="mt-8 rounded-3xl bg-white border border-amber-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-lg font-bold text-gray-900">로그인이 필요합니다</p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              이전에 서비스를 신청하셨다면, 결과 안내 이메일 또는 문자로 받으신
              &quot;결과 확인&quot; 링크로 접속하시면 자동으로 로그인되어
              마이페이지를 이용하실 수 있습니다.
            </p>
            <p className="mt-3 text-xs text-gray-400 leading-relaxed">
              링크를 찾을 수 없으시면 담당자에게 문의해주세요.
            </p>
            <Link
              href="/consultation"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-950 transition-colors"
            >
              <MessageSquare size={16} /> 상담 문의하기
            </Link>
          </div>
        )}

        {state === "error" && (
          <div className="mt-8 rounded-3xl bg-white border border-red-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}

        {state === "ready" && (
          <div className="mt-6 space-y-4">
            {items.length === 0 ? (
              <div className="rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <p className="text-sm text-gray-500">아직 접수하신 신청 내역이 없습니다.</p>
              </div>
            ) : (
              items.map((item) => <LeadCard key={item.id} item={item} />)
            )}
          </div>
        )}
      </div>
    </main>
  );
}
