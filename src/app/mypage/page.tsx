"use client";

// src/app/mypage/page.tsx
//
// 고객용 My Page v3 UI
// - 기존 Supabase Auth 세션, /api/mypage-data, /api/mypage-pdf 로직 유지
// - 기존 item 필드와 서버 계산 stage 값을 그대로 사용
// - DB/API/CRM/PDF/진단 로직 변경 없음
// - 서류지갑·알림센터·행정센터는 현재 데이터 범위 안에서 진입 UI만 제공

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bell,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  FileCheck2,
  FileText,
  FolderLock,
  HelpCircle,
  Home,
  Landmark,
  Lock,
  Menu,
  MessageCircle,
  MessageSquare,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  User,
  UserCheck,
  WalletCards,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type CategoryKey = "check" | "verify" | "register" | "consultation" | "unclassified";

const CATEGORY_BADGE: Record<CategoryKey, { label: string; className: string }> = {
  check: { label: "CHECK", className: "bg-blue-50 text-blue-700" },
  verify: { label: "VERIFY", className: "bg-slate-100 text-slate-700" },
  register: { label: "REGISTER", className: "bg-amber-50 text-amber-700" },
  consultation: { label: "상담", className: "bg-teal-50 text-teal-700" },
  unclassified: { label: "안내", className: "bg-gray-100 text-gray-500" },
};

const RESULT_LABELS: Record<string, { label: string; className: string }> = {
  possible: { label: "허가 가능", className: "text-emerald-700" },
  conditional: { label: "조건부 가능", className: "text-amber-700" },
  impossible: { label: "진행 어려움", className: "text-red-700" },
};

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

const VERIFY_ESTIMATE = "2~5 영업일";
const CONSULTATION_ESTIMATE = "1~2 영업일";
const EXPERT_TEAM_LABEL = "VFBCAI 법률자문팀";
const EXPERT_NAME = "Linda Kang · VNK 파트너";

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

function formatShortDate(iso: string) {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}.${dd}`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatIsoDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function getEstimate(category: CategoryKey, serviceType: string | null): string {
  if (category === "verify") return VERIFY_ESTIMATE;
  if (category === "consultation") return CONSULTATION_ESTIMATE;
  if (serviceType && ESTIMATED_DAYS[serviceType]) return ESTIMATED_DAYS[serviceType];
  return "담당자 확인 후 안내";
}

function nextStepLabel(steps: ProcessStep[]): string {
  const firstPending = steps.find((step) => !step.done);
  return firstPending ? `${firstPending.label} 예정` : "안내 대기";
}

function stageIndex(stage: StageInfo) {
  const doneCount = stage.steps.filter((step) => step.done).length;
  return Math.min(doneCount + 1, Math.max(stage.steps.length, 1));
}

const CONFIDENCE_STYLE: Record<
  ConfidenceLevel,
  {
    bg: string;
    border: string;
    dot: string;
    title: string;
    text: string;
    Icon: typeof CheckCircle2;
  }
> = {
  green: {
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    dot: "bg-emerald-500",
    title: "text-emerald-900",
    text: "text-emerald-700",
    Icon: CheckCircle2,
  },
  yellow: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    dot: "bg-amber-500",
    title: "text-amber-900",
    text: "text-amber-700",
    Icon: AlertTriangle,
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-100",
    dot: "bg-red-500",
    title: "text-red-900",
    text: "text-red-700",
    Icon: ShieldAlert,
  },
};

function PdfDownloadButton({
  leadId,
  className = "",
}: {
  leadId: string;
  className?: string;
}) {
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
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `vfbcai-report-${leadId.slice(0, 8)}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("pdf download failed:", err);
      setError("서버와 통신 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 text-[15px] font-bold text-blue-900 transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-60"
      >
        <Download size={16} />
        {loading ? "PDF 생성 중..." : "AI 리포트(PDF) 다운로드"}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function BrandLogo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <img
        src="/vfbcai-shield-logo.png"
        alt="VFBCAI"
        width={42}
        height={42}
        className="shrink-0"
      />
      <div>
        <p className="text-xl font-black tracking-tight text-blue-950">VFBCAI</p>
        <p className="text-[10px] font-medium tracking-[-0.01em] text-slate-400">
          Check. Verify. Register. Protect.
        </p>
      </div>
    </Link>
  );
}

const SIDEBAR_ITEMS = [
  { label: "홈", href: "/mypage", icon: Home, active: true },
  { label: "신청 현황", href: "#applications", icon: FileCheck2 },
  { label: "서류 지갑", href: "#wallet", icon: WalletCards },
  { label: "행정센터", href: "#admin-center", icon: Landmark },
  { label: "알림 센터", href: "#notifications", icon: Bell, badge: 3 },
  { label: "메시지", href: "/mypage/chat", icon: MessageSquare, badge: 2 },
  { label: "나의 정보", href: "#profile", icon: User },
  { label: "도움말", href: "/consultation", icon: HelpCircle },
];

function DesktopSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r border-slate-200 bg-white xl:flex xl:flex-col">
      <div className="px-6 pt-6">
        <BrandLogo />
      </div>

      <nav className="mt-8 space-y-1 px-4">
        {SIDEBAR_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex h-11 items-center justify-between rounded-xl px-3 text-[15px] font-semibold transition ${
              item.active
                ? "bg-blue-950 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span className="flex items-center gap-3">
              <item.icon size={17} />
              {item.label}
            </span>
            {item.badge ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[15px] font-bold text-white">
                {item.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>

      <div className="mt-auto p-4">
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
            <FolderLock size={20} className="text-blue-900" />
          </div>
          <p className="mt-3 text-[15px] font-bold text-blue-950">보안 안전 지갑</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            제출자료는 고객 본인과 승인된 담당자만 확인할 수 있습니다.
          </p>
        </div>
      </div>
    </aside>
  );
}

function MobileHeader({
  name,
  onMenu,
}: {
  name: string | null;
  onMenu: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur xl:hidden">
      <div className="flex h-16 items-center justify-between px-4">
        <BrandLogo />
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-50"
            aria-label="알림"
          >
            <Bell size={19} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
          <button
            type="button"
            onClick={onMenu}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-50"
            aria-label={`${name ?? "고객"} 메뉴`}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 xl:hidden">
      <button
        type="button"
        aria-label="메뉴 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/30"
      />
      <div className="absolute right-0 top-0 h-full w-[82%] max-w-sm bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <BrandLogo />
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="mt-8 space-y-1">
          {SIDEBAR_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={`flex h-12 items-center justify-between rounded-xl px-4 text-[15px] font-semibold ${
                item.active ? "bg-blue-950 text-white" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-3">
                <item.icon size={18} />
                {item.label}
              </span>
              {item.badge ? (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] text-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

function MobileBottomNav() {
  const items = [
    { label: "홈", href: "/mypage", icon: Home, active: true },
    { label: "신청현황", href: "#applications", icon: FileCheck2 },
    { label: "서류지갑", href: "#wallet", icon: WalletCards },
    { label: "알림", href: "#notifications", icon: Bell, badge: true },
    { label: "내 정보", href: "#profile", icon: User },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+6px)] pt-2 backdrop-blur xl:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`relative flex flex-col items-center gap-1 rounded-xl py-1.5 text-[15px] font-semibold ${
              item.active ? "text-blue-950" : "text-slate-400"
            }`}
          >
            <item.icon size={19} fill={item.active ? "currentColor" : "none"} />
            {item.label}
            {item.badge ? (
              <span className="absolute right-[24%] top-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            ) : null}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function ProgressRing({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div
      className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full sm:h-32 sm:w-32"
      style={{
        background: `conic-gradient(#5ee29a ${safeValue * 3.6}deg, rgba(255,255,255,0.16) 0deg)`,
      }}
    >
      <div className="flex h-[82%] w-[82%] flex-col items-center justify-center rounded-full bg-blue-950">
        <p className="text-3xl font-black text-white">{safeValue}%</p>
        <p className="mt-0.5 text-[15px] font-semibold text-blue-200">전체 진행률</p>
      </div>
    </div>
  );
}

function HeroApplicationCard({ item }: { item: MyPageItem }) {
  const estimate = getEstimate(item.category, item.serviceType);
  const badge = CATEGORY_BADGE[item.category];

  return (
    <section
      id="applications"
      className="overflow-hidden rounded-[26px] bg-gradient-to-br from-blue-950 via-blue-900 to-[#0b2d72] p-5 text-white shadow-[0_18px_50px_rgba(15,45,110,0.16)] sm:p-7"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-semibold text-blue-200">현재 진행 중인 신청</span>
            <span className={`rounded-full px-2.5 py-1 text-[15px] font-bold ${badge.className}`}>
              {badge.label}
            </span>
            <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-[15px] font-bold text-emerald-200">
              진행중
            </span>
          </div>

          <h2 className="mt-3 truncate text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
            {item.serviceLabel}
          </h2>

          <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-2 text-xs text-blue-100">
            <div>
              <p className="text-blue-300">신청일</p>
              <p className="mt-0.5 font-semibold text-white">{formatIsoDate(item.createdAt)}</p>
            </div>
            <div>
              <p className="text-blue-300">접수번호</p>
              <p className="mt-0.5 font-semibold text-white">VF{item.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-6 sm:justify-end">
          <ProgressRing value={item.stage.progressPercent} />
          <div className="min-w-[120px]">
            <p className="text-[15px] font-semibold text-blue-200">예상 완료일</p>
            <p className="mt-1 text-xl font-extrabold text-white">{estimate}</p>
            <p className="mt-3 text-[11px] text-blue-200">현재 단계</p>
            <p className="mt-1 text-[15px] font-bold text-white">{item.stage.currentStepLabel}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Link
          href={`/mypage/chat?leadId=${item.id}&label=${encodeURIComponent(item.serviceLabel)}`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-[15px] font-bold text-blue-950 transition hover:bg-blue-50"
        >
          <MessageSquare size={16} />
          24시간 AI 상담
        </Link>
        <a
          href="#timeline"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/30 px-5 text-[15px] font-bold text-white transition hover:bg-white/10"
        >
          진행상황 자세히 보기
          <ArrowRight size={15} />
        </a>
      </div>
    </section>
  );
}

function HorizontalSteps({ stage }: { stage: StageInfo }) {
  return (
    <section className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:p-7">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-extrabold text-slate-950">진행 단계</p>
          <p className="mt-1 text-sm text-slate-500">
            STEP {stageIndex(stage)} / {stage.steps.length}
          </p>
        </div>
        <p className="rounded-full bg-blue-50 px-3 py-1.5 text-[15px] font-bold text-blue-900">
          {stage.currentStepLabel}
        </p>
      </div>

      <div className="mt-6 overflow-x-auto pb-2">
        <div className="flex min-w-[560px] items-start">
          {stage.steps.map((step, index) => {
            const isCurrent = !step.done && stage.steps.slice(0, index).every((prev) => prev.done);
            return (
              <div key={`${step.label}-${index}`} className="flex flex-1 items-start">
                <div className="flex w-full flex-col items-center">
                  <div className="flex w-full items-center">
                    {index > 0 && (
                      <div
                        className={`h-0.5 flex-1 ${
                          step.done || isCurrent ? "bg-emerald-300" : "bg-slate-200"
                        }`}
                      />
                    )}
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 border-white shadow-sm ${
                        step.done
                          ? "bg-emerald-100 text-emerald-700"
                          : isCurrent
                          ? "bg-blue-950 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {step.done ? <Check size={18} strokeWidth={3} /> : <span className="text-[15px] font-bold">{index + 1}</span>}
                    </div>
                    {index < stage.steps.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 ${
                          step.done ? "bg-emerald-300" : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>
                  <p
                    className={`mt-2 max-w-[100px] text-center text-[15px] font-bold ${
                      step.done ? "text-slate-700" : isCurrent ? "text-blue-950" : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ConfidenceBanner({ confidence }: { confidence: ConfidenceStatus }) {
  const style = CONFIDENCE_STYLE[confidence.level];
  const Icon = style.Icon;

  return (
    <div className={`rounded-2xl border ${style.border} ${style.bg} p-4`}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
          <Icon size={19} className={style.text} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${style.dot}`} />
            <p className={`text-[15px] font-bold ${style.text}`}>현재 진행 상태</p>
          </div>
          <p className={`mt-1 text-base font-black ${style.title}`}>{confidence.label}</p>
          <p className={`mt-1 text-xs leading-relaxed ${style.text}`}>{confidence.message}</p>
        </div>
      </div>
    </div>
  );
}

function AiResultCard({ item }: { item: MyPageItem }) {
  const resultInfo = item.result ? RESULT_LABELS[item.result] ?? null : null;

  if (typeof item.feasibilityScore !== "number" && !resultInfo) return null;

  return (
    <section className="rounded-[22px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:p-7">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-extrabold text-slate-950">AI 분석 결과</p>
          <p className="mt-1 text-sm text-slate-500">제출 정보 기준 1차 분석</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
          <Sparkles size={20} className="text-emerald-600" />
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          {typeof item.feasibilityScore === "number" && (
            <p className="text-5xl font-black tracking-tight text-emerald-700">
              {item.feasibilityScore}
              <span className="text-2xl">%</span>
            </p>
          )}
          {resultInfo && (
            <p className={`mt-1 text-xl font-extrabold ${resultInfo.className}`}>{resultInfo.label}</p>
          )}
        </div>
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
          <Shield size={34} className="text-emerald-600" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1 text-amber-400">
        {[0, 1, 2, 3, 4].map((value) => (
          <Sparkles key={value} size={15} fill="currentColor" />
        ))}
        <span className="ml-2 text-[15px] font-semibold text-slate-500">AI 분석 완료</span>
      </div>

      <PdfDownloadButton leadId={item.id} className="mt-6" />

      <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
        1차 자가진단 결과이며, 정확한 진행 가능 여부는 실제 서류 검토 후 확정됩니다.
      </p>
    </section>
  );
}

function CurrentStatusCard({ item }: { item: MyPageItem }) {
  const estimate = getEstimate(item.category, item.serviceType);
  const nextStep = nextStepLabel(item.stage.steps);

  return (
    <section className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:p-7">
      <p className="text-xl font-extrabold text-slate-950">현재 진행 상황</p>
      <p className="mt-3 text-[15px] leading-7 text-slate-600">
        {item.hasExpertReview
          ? "담당 전문가가 제출하신 자료를 검토하고 있습니다."
          : "현재 신청 내용을 확인하고 다음 단계를 준비하고 있습니다."}
      </p>

      <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-950 text-white">
          <UserCheck size={22} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-black text-slate-950">{EXPERT_NAME}</p>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[15px] font-bold text-blue-800">
              담당 전문가
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{EXPERT_TEAM_LABEL}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-blue-50 p-4">
          <p className="text-[15px] font-semibold text-blue-700">다음 단계</p>
          <p className="mt-1 text-[15px] font-extrabold text-blue-950">{nextStep}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-[15px] font-semibold text-slate-500">예상 처리기간</p>
          <p className="mt-1 text-[15px] font-extrabold text-slate-900">{estimate}</p>
        </div>
      </div>
    </section>
  );
}

function ActivityTimeline({ log }: { log: ActivityLogEntry[] }) {
  return (
    <section id="timeline" className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:p-7">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-extrabold text-slate-950">진행 타임라인</p>
          <p className="mt-1 text-sm text-slate-500">처리 기록을 시간순으로 확인하세요.</p>
        </div>
        <CalendarDays size={20} className="text-blue-900" />
      </div>

      {log.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-center">
          <p className="text-[15px] font-semibold text-slate-500">
            아직 기록된 처리 이력이 없습니다.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-0">
          {log.map((entry, index) => (
            <div key={`${entry.label}-${entry.createdAt}-${index}`} className="flex gap-4">
              <div className="w-12 shrink-0 pt-0.5 text-right">
                <p className="text-[15px] font-semibold text-slate-400">
                  {formatShortDate(entry.createdAt)}
                </p>
                <p className="mt-0.5 text-sm text-slate-400">{formatTime(entry.createdAt)}</p>
              </div>
              <div className="flex flex-col items-center">
                <span
                  className={`h-3 w-3 rounded-full ring-4 ring-white ${
                    index === log.length - 1 ? "bg-blue-950" : "bg-emerald-500"
                  }`}
                />
                {index < log.length - 1 && <div className="min-h-[54px] w-px flex-1 bg-slate-200" />}
              </div>
              <div className="min-w-0 pb-6">
                <p className="text-[15px] font-extrabold text-slate-900">{entry.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  신청 처리 내역이 업데이트되었습니다.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PublicNotes({ notes }: { notes: PublicNote[] }) {
  if (notes.length === 0) return null;

  return (
    <section className="rounded-[22px] border border-blue-100 bg-blue-50/60 p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <MessageCircle size={19} className="text-blue-900" />
        <p className="text-xl font-extrabold text-blue-950">담당자 안내</p>
      </div>
      <div className="mt-4 space-y-3">
        {notes.map((note, index) => (
          <div key={`${note.createdAt}-${index}`} className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="whitespace-pre-wrap text-[15px] leading-7 text-slate-700">{note.memo}</p>
            <p className="mt-2 text-sm text-slate-400">{formatDate(note.createdAt)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PermitInfo({ item }: { item: MyPageItem }) {
  if (!item.governmentSubmittedAt && !item.permitCompletedAt && !item.fileUrl) return null;

  return (
    <section className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:p-7">
      <p className="text-xl font-extrabold text-slate-950">제출 및 결과 문서</p>
      <div className="mt-4 space-y-3">
        {item.governmentSubmittedAt && (
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                <Building2 size={18} className="text-slate-600" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-slate-500">정부 제출</p>
                <p className="mt-0.5 text-[15px] font-extrabold text-slate-900">
                  {formatIsoDate(item.governmentSubmittedAt)}
                </p>
              </div>
            </div>
            <CheckCircle2 size={19} className="text-emerald-600" />
          </div>
        )}

        {item.permitCompletedAt && (
          <div className="rounded-2xl bg-emerald-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[15px] font-semibold text-emerald-700">허가 완료</p>
                <p className="mt-0.5 text-[15px] font-extrabold text-emerald-900">
                  {formatIsoDate(item.permitCompletedAt)}
                </p>
              </div>
              <CheckCircle2 size={20} className="text-emerald-700" />
            </div>
            {item.permitFileUrl && (
              <a
                href={item.permitFileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-[15px] font-bold text-white hover:bg-emerald-800"
              >
                <Download size={15} />
                {item.permitFileName ?? "허가증 다운로드"}
              </a>
            )}
          </div>
        )}

        {item.fileUrl && (
          <a
            href={item.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50"
          >
            <span className="flex min-w-0 items-center gap-3">
              <FileText size={18} className="shrink-0 text-blue-900" />
              <span className="truncate text-[15px] font-bold text-slate-800">
                {item.fileName ?? "첨부서류 확인"}
              </span>
            </span>
            <Download size={16} className="text-slate-400" />
          </a>
        )}
      </div>
    </section>
  );
}

function DocumentWalletSection() {
  const placeholders = [
    { label: "여권", meta: "보안 저장", icon: "🛂" },
    { label: "비자", meta: "신청에 재사용", icon: "📄" },
    { label: "거주증", meta: "만료일 관리", icon: "🪪" },
    { label: "증명사진", meta: "간편 보관", icon: "📷" },
  ];

  return (
    <section id="wallet" className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:p-7">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-extrabold text-slate-950">내 서류 지갑</p>
          <p className="mt-1 text-sm text-slate-500">
            자주 사용하는 행정서류를 한곳에서 관리합니다.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[15px] font-bold text-blue-800">
          준비중
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {placeholders.map((doc) => (
          <div key={doc.label} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
              {doc.icon}
            </div>
            <p className="mt-3 text-[15px] font-extrabold text-slate-900">{doc.label}</p>
            <p className="mt-1 text-sm text-slate-400">{doc.meta}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-2xl bg-blue-50 p-4">
        <Lock size={15} className="mt-0.5 shrink-0 text-blue-900" />
        <p className="text-xs leading-relaxed text-blue-800">
          서류지갑 기능은 다음 개발 단계에서 Private Storage와 접근권한 검증을 적용해 연결합니다.
        </p>
      </div>
    </section>
  );
}

const PUBLIC_LINKS = [
  { label: "정부24", sub: "한국 민원·증명서", href: "https://www.gov.kr/" },
  { label: "영사민원24", sub: "공증·영사·여권", href: "https://consul.mofa.go.kr/" },
  { label: "법무부", sub: "출입국·국적 정보", href: "https://www.moj.go.kr/" },
  { label: "하이코리아", sub: "체류·전자민원", href: "https://www.hikorea.go.kr/" },
];

function PublicServiceLinks() {
  return (
    <section id="admin-center" className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:p-7">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-extrabold text-slate-950">한국 공공기관 바로가기</p>
          <p className="mt-1 text-sm text-slate-500">필요한 서류 발급처를 빠르게 확인하세요.</p>
        </div>
        <Landmark size={21} className="text-blue-900" />
      </div>

      <div className="mt-4 divide-y divide-slate-100">
        {PUBLIC_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between py-3.5 transition hover:bg-slate-50"
          >
            <span>
              <span className="block text-[15px] font-extrabold text-slate-900">{link.label}</span>
              <span className="mt-0.5 block text-sm text-slate-500">{link.sub}</span>
            </span>
            <ChevronRight size={17} className="text-slate-300" />
          </a>
        ))}
      </div>
    </section>
  );
}

function NotificationCenter({ item }: { item: MyPageItem | null }) {
  const notifications = item
    ? [
        {
          title: "현재 단계가 업데이트되었습니다.",
          sub: item.stage.currentStepLabel,
          icon: CheckCircle2,
          tone: "text-emerald-600 bg-emerald-50",
        },
        {
          title: item.publicNotes.length > 0 ? "담당자 안내가 도착했습니다." : "새 안내를 기다리고 있습니다.",
          sub: item.publicNotes.length > 0 ? "마이페이지에서 내용을 확인하세요." : "변경사항이 생기면 알려드립니다.",
          icon: MessageCircle,
          tone: "text-blue-700 bg-blue-50",
        },
        {
          title: "서류 만료 알림",
          sub: "서류지갑 연결 후 자동 알림을 받을 수 있습니다.",
          icon: Bell,
          tone: "text-amber-700 bg-amber-50",
        },
      ]
    : [];

  return (
    <section id="notifications" className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-base font-black text-slate-950">알림 센터</p>
        <span className="text-[15px] font-bold text-blue-900">전체 보기</span>
      </div>
      <div className="mt-3 space-y-2">
        {notifications.map((notification) => (
          <div key={notification.title} className="flex gap-3 rounded-2xl p-3 hover:bg-slate-50">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${notification.tone}`}
            >
              <notification.icon size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-900">{notification.title}</p>
              <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{notification.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExpertCard({ item }: { item: MyPageItem | null }) {
  return (
    <section className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm">
      <p className="text-base font-black text-slate-950">담당 전문가</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-950 text-white">
          <UserCheck size={25} />
        </div>
        <div>
          <p className="font-black text-slate-950">{EXPERT_NAME}</p>
          <p className="mt-1 text-sm text-slate-500">행정허가 전문가</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <p className="text-sm text-slate-400">현재 상태</p>
          <p className="mt-1 text-xs font-black text-slate-900">
            {item?.hasExpertReview ? "검토중" : "배정 대기"}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <p className="text-sm text-slate-400">응답 안내</p>
          <p className="mt-1 text-xs font-black text-slate-900">담당자 확인 후</p>
        </div>
      </div>
      {item && (
        <Link
          href={`/mypage/chat?leadId=${item.id}&label=${encodeURIComponent(item.serviceLabel)}`}
          className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-950 text-[15px] font-bold text-white"
        >
          <MessageSquare size={16} />
          메시지 보내기
        </Link>
      )}
    </section>
  );
}

function OtherApplications({
  items,
  activeId,
  onSelect,
}: {
  items: MyPageItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  if (items.length <= 1) return null;

  return (
    <section className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:p-7">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-extrabold text-slate-950">다른 신청 내역</p>
          <p className="mt-1 text-sm text-slate-500">확인할 신청을 선택해주세요.</p>
        </div>
        <Search size={20} className="text-slate-400" />
      </div>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
              activeId === item.id
                ? "border-blue-300 bg-blue-50"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <span>
              <span className="block text-[15px] font-extrabold text-slate-900">{item.serviceLabel}</span>
              <span className="mt-1 block text-sm text-slate-500">
                {item.stage.currentStepLabel} · {item.stage.progressPercent}%
              </span>
            </span>
            <ChevronRight size={17} className="text-slate-300" />
          </button>
        ))}
      </div>
    </section>
  );
}

function Dashboard({
  name,
  items,
}: {
  name: string | null;
  items: MyPageItem[];
}) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (!activeId || !items.some((item) => item.id === activeId)) {
      setActiveId(items[0]?.id ?? null);
    }
  }, [activeId, items]);

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeId) ?? items[0] ?? null,
    [activeId, items]
  );

  if (!activeItem) {
    return (
      <div className="rounded-[22px] border border-slate-200/80 bg-white p-8 text-center shadow-sm">
        <FileText className="mx-auto text-slate-300" size={34} />
        <p className="mt-4 text-xl font-extrabold text-slate-900">아직 접수하신 신청 내역이 없습니다.</p>
        <p className="mt-2 text-sm text-slate-500">새 서비스를 확인하고 필요한 행정업무를 시작해보세요.</p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-blue-950 px-5 text-[15px] font-bold text-white"
        >
          서비스 확인하기
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[15px] font-semibold text-blue-900">안녕하세요 👋</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-4xl">
            {name ? `${name}님` : "고객님"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">오늘도 신청 진행상황을 안전하게 확인하세요.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/consultation"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 text-[15px] font-bold text-slate-700 hover:bg-slate-50"
          >
            <HelpCircle size={15} />
            문의하기
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-950 px-4 text-[15px] font-bold text-white"
          >
            <Plus size={15} />
            새 신청
          </Link>
        </div>
      </div>

      <HeroApplicationCard item={activeItem} />

      <div className="mt-6">
        <HorizontalSteps stage={activeItem.stage} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AiResultCard item={activeItem} />
        <CurrentStatusCard item={activeItem} />
      </div>

      <div className="mt-6">
        <ConfidenceBanner confidence={activeItem.confidence} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <ActivityTimeline log={activeItem.activityLog} />
        <PermitInfo item={activeItem} />
      </div>

      <div className="mt-6">
        <PublicNotes notes={activeItem.publicNotes} />
      </div>

      <div className="mt-6">
        <DocumentWalletSection />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="xl:hidden">
          <PublicServiceLinks />
        </div>
        <OtherApplications items={items} activeId={activeItem.id} onSelect={setActiveId} />
      </div>
    </>
  );
}

function LoadingCard({ message }: { message: string }) {
  return (
    <div className="rounded-[22px] border border-slate-200/80 bg-white p-8 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-blue-100" />
        <div>
          <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
          <p className="mt-2 text-sm text-slate-500">{message}</p>
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const activeItem = items[0] ?? null;

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900 [font-family:'Pretendard','Noto_Sans_KR',ui-sans-serif,system-ui,sans-serif] antialiased">
      <DesktopSidebar />
      <MobileHeader name={name} onMenu={() => setMobileMenuOpen(true)} />
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="xl:pl-[248px]">
        <div className="mx-auto grid max-w-[1680px] gap-6 px-4 py-5 pb-28 sm:px-6 sm:py-7 xl:grid-cols-[minmax(0,1fr)_330px] xl:px-8 xl:py-8 xl:pb-8">
          <div className="min-w-0">
            {state === "checking" && <LoadingCard message="로그인 정보를 확인하고 있습니다." />}
            {state === "loading" && <LoadingCard message="신청 내역을 불러오는 중입니다." />}

            {state === "signed-out" && (
              <div className="rounded-[22px] border border-amber-200 bg-white p-7 shadow-sm sm:p-9">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
                  <AlertCircle size={22} className="text-amber-700" />
                </div>
                <h1 className="mt-6 text-3xl font-extrabold text-slate-950">로그인이 필요합니다</h1>
                <p className="mt-3 max-w-xl text-[15px] leading-7 text-slate-600">
                  결과 안내 이메일 또는 문자로 받으신 결과 확인 링크로 접속하면 자동 로그인되어
                  마이페이지를 이용할 수 있습니다.
                </p>
                <Link
                  href="/consultation"
                  className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-950 px-5 text-[15px] font-bold text-white"
                >
                  <MessageSquare size={16} />
                  상담 문의하기
                </Link>
              </div>
            )}

            {state === "error" && (
              <div className="rounded-[22px] border border-red-200 bg-white p-7 shadow-sm">
                <AlertTriangle size={24} className="text-red-600" />
                <p className="mt-4 text-[15px] font-semibold text-red-700">{errorMessage}</p>
              </div>
            )}

            {state === "ready" && <Dashboard name={name} items={items} />}
          </div>

          <aside className="hidden space-y-5 xl:block">
            <NotificationCenter item={activeItem} />
            <PublicServiceLinks />
            <ExpertCard item={activeItem} />
            <div id="profile" className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <Shield size={19} className="text-blue-900" />
                </div>
                <div>
                  <p className="text-[15px] font-extrabold text-slate-950">VFBCAI 보안 안내</p>
                  <p className="mt-0.5 text-sm text-slate-500">개인정보 안전 보호</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                고객의 제출자료와 진행정보는 허가된 사용자만 확인할 수 있도록 관리됩니다.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <MobileBottomNav />
    </main>
  );
}
