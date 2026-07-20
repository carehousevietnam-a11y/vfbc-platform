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
  AlertTriangle,
  ShieldAlert,
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

type ConfidenceLevel = "green" | "yellow" | "red";
type ConfidenceStatus = { level: ConfidenceLevel; label: string; message: string };

type ProcessStep = { label: string; done: boolean };
type StageInfo = {
  steps: ProcessStep[];
  progressPercent: number;
  currentStepLabel: string;
};

type ActivityLogEntry = { label: string; createdAt: string };
type PublicNote = { memo: string; createdAt: string };

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
  confidence: ConfidenceStatus;
  stage: StageInfo;
  activityLog: ActivityLogEntry[];
  governmentSubmittedAt: string | null;
  permitCompletedAt: string | null;
  permitFileUrl: string | null;
  permitFileName: string | null;
  publicNotes: PublicNote[];
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

// STEP2 타임라인용 짧은 날짜 표기 (예: 07/19)
function formatShortDate(iso: string) {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}`;
}

// STEP4 정부 제출/허가완료 날짜 표기 (예: 2026-07-23)
function formatIsoDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── 단계별 타임라인 ──
// 진행 단계(캐스케이드 포함)와 진행률은 이제 /api/mypage-data가
// 서버에서 계산해 item.stage로 내려준다 — 관리자가 저장한 상위 단계
// action이 있으면 이전 단계도 자동으로 완료 표시되는 캐스케이드 로직이
// 이 페이지와 admin 페이지 양쪽에서 어긋나지 않도록 API 쪽에서 한 번만
// 계산한다. 이 페이지는 그 결과만 그대로 렌더링한다.
function nextStepLabel(steps: ProcessStep[]): string {
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

// 안심도(Confidence) 배너 — "AI 허가 가능성"(예측 결과)과는 별개로, "현재
// 업무가 정상적으로 진행되고 있는지"를 보여준다. 혼동 방지를 위해 제목을
// "현재 진행 상태"로 명확히 구분하고, AI 예측 결과 영역과는 별도 블록으로
// 둔다.
const CONFIDENCE_STYLE: Record<
  ConfidenceLevel,
  { bg: string; dot: string; text: string; Icon: typeof CheckCircle2 }
> = {
  green: { bg: "bg-emerald-50", dot: "bg-emerald-500", text: "text-emerald-800", Icon: CheckCircle2 },
  yellow: { bg: "bg-amber-50", dot: "bg-amber-500", text: "text-amber-800", Icon: AlertTriangle },
  red: { bg: "bg-red-50", dot: "bg-red-500", text: "text-red-800", Icon: ShieldAlert },
};

function ConfidenceBanner({ confidence }: { confidence: ConfidenceStatus }) {
  const style = CONFIDENCE_STYLE[confidence.level];
  const Icon = style.Icon;
  return (
    <div className={`mt-4 rounded-2xl ${style.bg} px-4 py-3`}>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${style.dot} shrink-0`} />
        <Icon size={14} className={`${style.text} shrink-0`} />
        <p className={`text-[11px] font-semibold ${style.text}`}>현재 진행 상태</p>
      </div>
      <p className={`mt-1 text-sm font-bold ${style.text}`}>{confidence.label}</p>
      <p className={`mt-1 text-[11px] ${style.text} opacity-80 leading-relaxed`}>
        {confidence.message}
      </p>
    </div>
  );
}

// STEP2: 고객 타임라인. StepTimeline(현재 단계까지의 진행 현황)과는 다른
// 개념 — 이쪽은 crm_activities에 실제 기록된 이벤트를 날짜순으로 그대로
// 나열한 이력이다. 라벨은 API가 이미 고객용 문구로 변환해서 내려준다.
function ActivityTimeline({ log }: { log: ActivityLogEntry[] }) {
  if (log.length === 0) {
    return <p className="mt-3 text-xs text-gray-400">아직 기록된 처리 이력이 없습니다.</p>;
  }
  return (
    <div className="mt-3 space-y-3">
      {log.map((entry, i) => (
        <div key={`${entry.label}-${entry.createdAt}`} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="h-2 w-2 rounded-full bg-blue-900 shrink-0" />
            {i < log.length - 1 && <div className="w-px flex-1 min-h-[20px] bg-gray-200" />}
          </div>
          <div className="pb-1">
            <p className="text-[11px] text-gray-400">{formatShortDate(entry.createdAt)}</p>
            <p className="text-sm font-semibold text-gray-900">{entry.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// STEP3: 고객용 AI 결과 PDF 다운로드. accessToken은 클릭 시점에 새로 조회해
// 사용한다(다른 fetch들과 동일한 인증 패턴 — /api/mypage-pdf가 서버에서
// 다시 검증한다).
function PdfDownloadButton({ leadId }: { leadId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/mypage-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, leadId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "PDF를 생성하지 못했습니다.");
        setLoading(false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vfbcai-report-${leadId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("pdf download failed:", err);
      setError("서버와 통신 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-full bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-950 disabled:opacity-60 transition-colors"
      >
        <Download size={14} /> {loading ? "PDF 생성 중..." : "AI 결과 PDF 다운로드"}
      </button>
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

function ProgressCard({ stage }: { stage: StageInfo }) {
  return (
    <div className="rounded-2xl bg-blue-50/60 px-4 py-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-blue-900">진행률</p>
        <p className="text-xl font-bold text-blue-900">{stage.progressPercent}%</p>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-blue-900 transition-all"
          style={{ width: `${stage.progressPercent}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-blue-800">
        현재 단계 · <span className="font-semibold">{stage.currentStepLabel}</span>
      </p>
    </div>
  );
}

function LeadCard({ item }: { item: MyPageItem }) {
  const badge = CATEGORY_BADGE[item.category];
  const resultInfo = item.result ? RESULT_LABELS[item.result] ?? null : null;
  const estimate = getEstimate(item.category, item.serviceType);
  const nextStep = nextStepLabel(item.stage.steps);

  return (
    <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${badge.className}`}>
          {badge.label}
        </span>
        <span className="text-[11px] text-gray-400">{formatDate(item.createdAt)}</span>
      </div>

      <p className="mt-3 text-lg font-bold text-gray-900">{item.serviceLabel}</p>

      {/* STEP7: AI Case Manager 진입 — 이 카드의 lead를 자동 선택해서 넘어간다 */}
      <Link
        href={`/mypage/chat?leadId=${item.id}&label=${encodeURIComponent(item.serviceLabel)}`}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-950 transition-colors"
      >
        <MessageSquare size={14} /> 24시간 AI 상담
      </Link>

      {/* 안심도(Confidence) */}
      <ConfidenceBanner confidence={item.confidence} />

      {/* ② 진행률 카드 */}
      <div className="mt-4">
        <ProgressCard stage={item.stage} />
      </div>

      {/* ① 진행 타임라인 */}
      <div className="mt-5">
        <p className="text-xs font-semibold text-gray-700">진행 현황</p>
        <StepTimeline steps={item.stage.steps} />
      </div>

      {/* STEP2: 처리 이력 타임라인 */}
      <div className="mt-2">
        <p className="text-xs font-semibold text-gray-700">처리 이력</p>
        <ActivityTimeline log={item.activityLog} />
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

      {/* STEP3: AI 결과 PDF 다운로드 */}
      <PdfDownloadButton leadId={item.id} />

      {/* STEP4: 정부 제출 및 허가 결과 */}
      {(item.governmentSubmittedAt || item.permitCompletedAt) && (
        <div className="mt-4 space-y-3">
          {item.governmentSubmittedAt && (
            <div className="rounded-2xl bg-gray-50 px-4 py-3">
              <p className="text-[11px] font-semibold text-gray-500">정부 제출</p>
              <p className="mt-1 text-sm font-bold text-gray-900">
                {formatIsoDate(item.governmentSubmittedAt)}
              </p>
              <p className="mt-1 text-[11px] text-gray-500">담당자 · {EXPERT_TEAM_LABEL}</p>
            </div>
          )}
          {item.permitCompletedAt && (
            <div className="rounded-2xl bg-emerald-50 px-4 py-3">
              <p className="text-[11px] font-semibold text-emerald-700">허가 완료</p>
              <p className="mt-1 text-sm font-bold text-emerald-900">
                {formatIsoDate(item.permitCompletedAt)}
              </p>
              {item.permitFileUrl && (
                <a
                  href={item.permitFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors"
                >
                  <Download size={14} /> {item.permitFileName ?? "허가증 다운로드"}
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* STEP5: 고객 공개 메모 (관리자가 "고객 공개"로 승인한 메모만) */}
      {item.publicNotes.length > 0 && (
        <div className="mt-4 rounded-2xl bg-blue-50/60 px-4 py-3">
          <p className="text-[11px] font-semibold text-blue-900">담당자 안내</p>
          <div className="mt-2 space-y-2">
            {item.publicNotes.map((note, i) => (
              <div key={`${note.createdAt}-${i}`}>
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{note.memo}</p>
                <p className="mt-0.5 text-[10px] text-gray-400">{formatShortDate(note.createdAt)}</p>
              </div>
            ))}
          </div>
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
