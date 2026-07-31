"use client";

// src/app/mypage/page.tsx
//
// VFBCAI 고객용 My Page — 승인 목업 기준 전체 UI 재구성본
// 기존 인증·API·PDF·진행단계·CRM 데이터 구조는 그대로 유지하고,
// 화면 구조와 반응형 UI만 재설계한다.

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Bot,
  Building2,
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock3,
  DollarSign,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  FolderLock,
  HelpCircle,
  Home,
  Landmark,
  Loader2,
  Lock,
  MessageCircle,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Shield,
  ShieldAlert,
  Sparkles,
  Star,
  Sun,
  Upload,
  User,
  UserCheck,
  WalletCards,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type CategoryKey = "check" | "verify" | "register" | "consultation" | "unclassified";

const CATEGORY_BADGE: Record<CategoryKey, { label: string; className: string }> = {
  check: { label: "CHECK", className: "bg-blue-100 text-blue-700" },
  verify: { label: "VERIFY", className: "bg-slate-100 text-slate-700" },
  register: { label: "REGISTER", className: "bg-amber-100 text-amber-700" },
  consultation: { label: "상담", className: "bg-teal-100 text-teal-700" },
  unclassified: { label: "안내", className: "bg-slate-100 text-slate-500" },
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
const EXPERT_TEAM_LABEL = "VFBCAI 행정전문팀";
const EXPERT_NAME = "VFBCAI 행정전문팀 · VNK 파트너";

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

function getEstimate(category: CategoryKey, serviceType: string | null) {
  if (category === "verify") return VERIFY_ESTIMATE;
  if (category === "consultation") return CONSULTATION_ESTIMATE;
  if (serviceType && ESTIMATED_DAYS[serviceType]) return ESTIMATED_DAYS[serviceType];
  return "담당자 확인 후 안내";
}

function nextStepLabel(steps: ProcessStep[]) {
  const next = steps.find((step) => !step.done);
  return next ? `${next.label} 준비` : "안내 대기";
}

const CONFIDENCE_STYLE: Record<
  ConfidenceLevel,
  { bg: string; border: string; text: string; icon: typeof CheckCircle2 }
> = {
  green: {
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    text: "text-emerald-700",
    icon: CheckCircle2,
  },
  yellow: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    text: "text-amber-700",
    icon: AlertTriangle,
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-100",
    text: "text-red-700",
    icon: ShieldAlert,
  },
};

function BrandLogo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <img src="/vfbcai-shield-logo.png" alt="VFBCAI" width={38} height={38} />
      <div>
        <p className="text-[19px] font-extrabold tracking-[-0.03em] text-[#0d2a6b]">VFBCAI</p>
        <p className="text-[9px] font-medium tracking-[-0.01em] text-slate-400">
          Check. Verify. Register. Protect.
        </p>
      </div>
    </Link>
  );
}

const SIDEBAR_ITEMS = [
  { label: "홈", icon: Home, href: "/mypage", active: true },
  { label: "신청 현황", icon: FileCheck2, href: "#applications" },
  { label: "서류 지갑", icon: WalletCards, href: "#wallet" },
  { label: "행정센터", icon: Landmark, href: "#admin-center" },
  { label: "알림 센터", icon: Bell, href: "#notifications", badge: 3 },
  { label: "메시지", icon: MessageSquare, href: "/mypage/chat", badge: 2 },
  { label: "결제 내역", icon: FileText, href: "#payments" },
  { label: "나의 정보", icon: User, href: "#profile" },
  { label: "도움말", icon: HelpCircle, href: "/consultation" },
];

function DesktopSidebar() {
  return (
    <aside className="hidden w-[220px] shrink-0 border-r border-slate-200 bg-white xl:sticky xl:top-0 xl:z-30 xl:flex xl:h-screen xl:flex-col">
      <div className="px-5 pt-6">
        <BrandLogo />
      </div>

      <nav className="mt-5 space-y-1.5 px-4">
        {SIDEBAR_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex h-12 items-center justify-between rounded-xl px-3.5 text-[13.5px] font-semibold transition ${
              item.active
                ? "bg-[#0b2e77] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span className="flex items-center gap-3">
              <item.icon size={17} />
              {item.label}
            </span>
            {item.badge ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {item.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>

      <div className="mt-auto p-5">
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
            <FolderLock size={19} className="text-[#0d2a6b]" />
          </div>
          <p className="mt-3 text-sm font-bold text-[#0d2a6b]">보안 안전 지갑</p>
          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            고객님의 중요 자료는 암호화되어 안전하게 관리됩니다.
          </p>
        </div>
      </div>
    </aside>
  );
}

function TopHeader({ name }: { name: string | null }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="flex h-[80px] w-full items-center justify-between px-4 sm:px-6 xl:px-7">
        <div className="xl:hidden">
          <BrandLogo />
        </div>

        <div className="hidden xl:block">
          <p className="text-[20px] font-extrabold tracking-[-0.03em] text-slate-950">
            안녕하세요, {name ?? "고객"}님 👋
          </p>
          <p className="mt-1 text-[12px] text-slate-500">오늘도 성공적인 하루 보내세요!</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button className="relative flex h-10 items-center gap-2 rounded-full px-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50">
            <Bell size={18} />
            <span className="hidden sm:inline">알림</span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              3
            </span>
          </button>

          <button className="relative hidden h-10 items-center gap-2 rounded-full px-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 sm:flex">
            <MessageSquare size={18} />
            메시지
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              2
            </span>
          </button>

          <div className="flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-slate-50">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <User size={18} />
            </div>
            <span className="hidden text-[12px] font-semibold text-slate-800 sm:inline">
              {name ?? "고객"}님
            </span>
            <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
          </div>
        </div>
      </div>
    </header>
  );
}

function ProgressRing({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div
      className="relative flex h-[108px] w-[108px] items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(#55d98a ${safeValue * 3.6}deg, rgba(255,255,255,0.16) 0deg)`,
      }}
    >
      <div className="flex h-[82px] w-[82px] flex-col items-center justify-center rounded-full bg-[#163b80]">
        <p className="text-[31px] font-extrabold leading-none tracking-[-0.04em] text-white">
          {safeValue}%
        </p>
        <p className="mt-1 text-[10px] font-semibold text-blue-200">전체 진행률</p>
      </div>
    </div>
  );
}

function HeroCard({
  item,
  selector,
}: {
  item: MyPageItem;
  selector: React.ReactNode;
}) {
  const estimate = getEstimate(item.category, item.serviceType);
  const badge = CATEGORY_BADGE[item.category];

  return (
    <section
      id="applications"
      className="overflow-hidden rounded-[20px] bg-gradient-to-br from-[#0f347f] via-[#123d91] to-[#0b2d70] px-5 py-5 text-white shadow-[0_14px_40px_rgba(18,55,126,0.18)] sm:px-6 sm:py-6"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-blue-200">현재 진행 중인 서비스</span>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${badge.className}`}>
              {badge.label}
            </span>
            <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-[10px] font-bold text-emerald-200">
              진행중
            </span>
          </div>

          <div className="mt-3">{selector}</div>

          <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-2 text-[12px]">
            <div>
              <p className="text-blue-200">신청일</p>
              <p className="mt-1 font-semibold text-white">{formatIsoDate(item.createdAt)}</p>
            </div>
            <div>
              <p className="text-blue-200">접수번호</p>
              <p className="mt-1 font-semibold text-white">VF{item.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-5 lg:justify-end">
          <ProgressRing value={item.stage.progressPercent} />
          <div className="min-w-[150px]">
            <p className="text-[11px] font-semibold text-blue-200">예상 완료일</p>
            <p className="mt-1 text-[19px] font-extrabold tracking-[-0.02em] text-white">{estimate}</p>
            <p className="mt-3 text-[11px] text-blue-200">현재 단계</p>
            <p className="mt-1 text-[14px] font-bold text-white">{item.stage.currentStepLabel}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ApplicationSelector({
  items,
  activeId,
  onChange,
}: {
  items: MyPageItem[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  if (items.length === 1) {
    return (
      <h2 className="truncate text-[32px] font-extrabold tracking-[-0.04em] text-white sm:text-[38px]">
        {items[0].serviceLabel}
      </h2>
    );
  }

  return (
    <div className="relative max-w-[420px]">
      <select
        value={activeId}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-xl border border-white/20 bg-white/10 px-4 py-3 pr-10 text-[20px] font-extrabold tracking-[-0.03em] text-white outline-none backdrop-blur"
      >
        {items.map((item) => (
          <option key={item.id} value={item.id} className="text-slate-900">
            {item.serviceLabel} · {item.stage.progressPercent}%
          </option>
        ))}
      </select>
      <ChevronDown
        size={18}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white"
      />
    </div>
  );
}

function StepProgress({ stage }: { stage: StageInfo }) {
  return (
    <section className="rounded-[20px] border border-slate-200 bg-white px-5 py-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[17px] font-extrabold tracking-[-0.02em] text-slate-950">진행 단계</p>
        <span className="text-[10px] font-semibold text-blue-700">전체 단계 보기 ›</span>
      </div>

      <div className="mt-5 overflow-x-auto pb-1">
        <div className="flex min-w-[420px] items-start">
          {stage.steps.map((step, index) => {
            const current = !step.done && stage.steps.slice(0, index).every((prev) => prev.done);
            const dateLabel = step.done
              ? index === 0
                ? "07.29 09:12"
                : index === 1
                ? "07.29 09:18"
                : index === 2
                ? "07.29 09:41"
                : ""
              : "";

            return (
              <div key={`${step.label}-${index}`} className="flex flex-1 items-start">
                <div className="flex w-full flex-col items-center">
                  <div className="flex w-full items-center">
                    {index > 0 && (
                      <div className={`h-px flex-1 ${step.done || current ? "bg-emerald-300" : "bg-slate-200"}`} />
                    )}
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                        step.done
                          ? "bg-emerald-100 text-emerald-700"
                          : current
                          ? "bg-[#12398a] text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {step.done ? <Check size={19} strokeWidth={3} /> : current ? <UserCheck size={18} /> : <Circle size={17} />}
                    </div>
                    {index < stage.steps.length - 1 && (
                      <div className={`h-px flex-1 ${step.done ? "bg-emerald-300" : "bg-slate-200"}`} />
                    )}
                  </div>
                  <p className={`mt-2 text-center text-[10px] font-bold ${
                    current ? "text-blue-800" : step.done ? "text-slate-700" : "text-slate-400"
                  }`}>
                    {step.label}
                  </p>
                  <p className="mt-1 min-h-[14px] text-center text-[9px] text-slate-400">{dateLabel}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PdfDownloadButton({ leadId }: { leadId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);

    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) {
        setError("로그인이 필요합니다.");
        return;
      }

      const response = await fetch("/api/mypage-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, leadId }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        setError(result?.error ?? "PDF를 생성하지 못했습니다.");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `vfbcai-report-${leadId.slice(0, 8)}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      console.error("pdf download failed:", downloadError);
      setError("서버와 통신 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white text-[13px] font-bold text-blue-900 transition hover:bg-blue-50 disabled:opacity-60"
      >
        <Download size={16} />
        {loading ? "PDF 생성 중..." : "AI 리포트(PDF) 다운로드"}
      </button>
      {error && <p className="mt-2 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

function AiResultCard({ item }: { item: MyPageItem }) {
  const resultInfo = item.result ? RESULT_LABELS[item.result] ?? null : null;

  return (
    <section className="rounded-[20px] border border-emerald-100 bg-gradient-to-br from-[#f2fff7] to-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[17px] font-extrabold tracking-[-0.02em] text-slate-950">AI 분석 결과</p>
          <p className="mt-1 text-[10px] text-slate-500">제출 정보 기준 1차 분석</p>
        </div>
        <Sparkles size={18} className="text-emerald-600" />
      </div>

      <div className="mt-4 grid grid-cols-[1fr_118px] items-end gap-3">
        <div>
          {typeof item.feasibilityScore === "number" && (
            <p className="text-[46px] font-extrabold leading-none tracking-[-0.05em] text-emerald-700">
              {item.feasibilityScore}<span className="text-[22px]">%</span>
            </p>
          )}
          {resultInfo && (
            <p className={`mt-2 text-[15px] font-extrabold ${resultInfo.className}`}>{resultInfo.label}</p>
          )}
          <div className="mt-3 flex items-center gap-1 text-amber-400">
            {[0, 1, 2, 3, 4].map((value) => (
              <Star key={value} size={13} fill="currentColor" />
            ))}
          </div>
          <p className="mt-2 text-[10px] font-semibold text-slate-500">AI 분석 완료</p>
        </div>

        <div className="relative flex h-[118px] items-center justify-center">
          <div className="absolute h-16 w-16 rounded-full bg-emerald-100 blur-xl" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-200 bg-white shadow-sm">
            <Bot size={32} className="text-[#153a78]" strokeWidth={1.75} />
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow ring-2 ring-white">
              <Check size={14} strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <PdfDownloadButton leadId={item.id} />
      </div>
    </section>
  );
}

function CurrentStatusCard({ item }: { item: MyPageItem }) {
  const estimate = getEstimate(item.category, item.serviceType);

  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-[18px] font-extrabold tracking-[-0.02em] text-slate-950">현재 진행 상황</p>
      <p className="mt-3 text-[13px] leading-6 text-slate-600">
        {item.hasExpertReview
          ? "담당 전문가가 제출하신 자료를 검토하고 있습니다."
          : "현재 신청 내용을 확인하고 다음 단계를 준비하고 있습니다."}
      </p>

      <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f3d7c8] to-[#d9b19d] text-[#102f72] ring-2 ring-white shadow-sm"><UserCheck size={22} /></div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[14px] font-extrabold text-slate-950">{EXPERT_NAME}</p>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
              담당 전문가
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">{EXPERT_TEAM_LABEL}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-blue-50 p-4">
          <p className="text-[10px] font-semibold text-blue-700">다음 단계</p>
          <p className="mt-1 text-[13px] font-extrabold text-blue-950">
            {nextStepLabel(item.stage.steps)}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-[10px] font-semibold text-slate-500">예상 처리기간</p>
          <p className="mt-1 text-[13px] font-extrabold text-slate-900">{estimate}</p>
        </div>
      </div>
    </section>
  );
}

function ConfidenceBanner({ confidence }: { confidence: ConfidenceStatus }) {
  const style = CONFIDENCE_STYLE[confidence.level];
  const Icon = style.icon;

  return (
    <div className={`rounded-2xl border ${style.border} ${style.bg} px-4 py-3`}>
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
          <Icon size={16} className={style.text} />
        </div>
        <div>
          <p className={`text-[12px] font-bold ${style.text}`}>{confidence.label}</p>
          <p className={`mt-1 text-[11px] leading-5 ${style.text}`}>{confidence.message}</p>
        </div>
      </div>
    </div>
  );
}

function TimelineCard({ item }: { item: MyPageItem }) {
  const fallbackTimeline: ActivityLogEntry[] = [
    { label: "신청 접수 완료", createdAt: item.createdAt },
    { label: "AI 진단 완료", createdAt: item.createdAt },
    { label: "전문가 배정", createdAt: item.createdAt },
    { label: item.stage.currentStepLabel || "자료 검토중", createdAt: item.createdAt },
  ];
  const recent = item.activityLog.length >= 3 ? item.activityLog.slice(-4) : fallbackTimeline;

  return (
    <section id="timeline" className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[18px] font-extrabold tracking-[-0.02em] text-slate-950">진행 타임라인</p>
          <p className="mt-1 text-[11px] text-slate-500">신청 처리 내역을 시간순으로 확인하세요.</p>
        </div>
        <span className="text-[11px] font-semibold text-blue-700">전체 보기</span>
      </div>

      {recent.length === 0 ? (
        <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-center">
          <Clock3 size={24} className="mx-auto text-slate-300" />
          <p className="mt-2 text-[12px] text-slate-500">아직 기록된 처리 이력이 없습니다.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-[1fr_210px]">
          <div className="space-y-0">
            {recent.map((entry, index) => (
              <div key={`${entry.label}-${entry.createdAt}-${index}`} className="flex gap-4">
                <div className="w-12 shrink-0 pt-0.5 text-right">
                  <p className="text-[10px] font-semibold text-slate-400">{formatShortDate(entry.createdAt)}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">{formatTime(entry.createdAt)}</p>
                </div>
                <div className="flex flex-col items-center">
                  <span
                    className={`h-3 w-3 rounded-full ring-4 ring-white ${
                      index === recent.length - 1 ? "bg-blue-900" : "bg-emerald-500"
                    }`}
                  />
                  {index < recent.length - 1 && <div className="min-h-[56px] w-px flex-1 bg-slate-200" />}
                </div>
                <div className="pb-6">
                  <p className="text-[13px] font-extrabold text-slate-900">{entry.label}</p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">신청 진행상황이 업데이트되었습니다.</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="text-[13px] font-extrabold text-blue-950">예상 일정 안내</p>
            <div className="mt-4 space-y-4">
              <div className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-[11px] font-bold text-slate-800">전문가 검토 완료</p>
                  <p className="mt-1 text-[10px] text-slate-500">담당자 확인 후 안내</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-[11px] font-bold text-slate-800">정부 제출</p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {item.governmentSubmittedAt ? formatIsoDate(item.governmentSubmittedAt) : "예정"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-[11px] font-bold text-slate-800">허가 결과 안내</p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {getEstimate(item.category, item.serviceType)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ── 내 서류 지갑(WalletSection) 실제 업로드/보기/다운로드 연동 ──
// src/app/documents/page.tsx가 이미 사용 중인 Storage 버킷·경로·CRM 저장 규칙을 그대로
// 재사용한다(신규 버킷/신규 테이블/신규 컬럼 없음).
// - 버킷: "documents" (기존과 동일)
// - 경로: `${WALLET_STORAGE_PREFIX}/${leadId}/${uuid}.${ext}` — documents 페이지와 동일한
//   prefix 규칙. 같은 leadId(신청 건)에 속한 실제 문서이므로 저장 위치를 통일한다.
// - crm_activities: action="document_upload"(기존 값 재사용), tag=서류 종류,
//   meta.storagePath/fileName/fileSize는 documents 페이지와 동일한 키. meta.expiryDate만
//   신규 키로 추가한다(기존 jsonb 컬럼 안의 키 하나 추가 — DB 스키마 변경 아님).
// - 이번 작업 범위에는 "파일 교체"가 포함되지 않으므로, 매 업로드는 항상 새
//   crm_activities 행을 INSERT한다(기존 문서 UPDATE·삭제 없음).
// - 보기/다운로드는 새 서버 라우트 /api/mypage-documents가 로그인 사용자 본인 소유
//   leadId인지 재확인한 뒤에만 Signed URL을 발급한다(공개 URL 미사용, 원문 하단 설명 참고).
const WALLET_STORAGE_BUCKET = "documents";
const WALLET_STORAGE_PREFIX = "document-upload";
const WALLET_CRM_ACTION = "document_upload";
const WALLET_MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB — documents 페이지와 동일 기준
const WALLET_ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];
const WALLET_DOC_TYPES = ["여권", "비자", "거주증(TRC)", "증명사진", "건강검진서", "기타 서류"];
// UI 표시 전용 "만료 임박" 기준일 — 프로젝트에 관련 기존 상수가 없어 화면 표시 목적으로만
// 30일을 사용한다. 기존 Business Logic·DB에는 영향이 없다.
const WALLET_EXPIRY_SOON_DAYS = 30;

type WalletDocumentEntry = {
  activityId: string;
  docType: string;
  fileName: string;
  fileExt: string;
  fileSize: number | null;
  expiryDate: string | null;
  createdAt: string;
  viewUrl: string | null;
  downloadUrl: string | null;
};

type WalletExpiryStatus = "valid" | "soon" | "expired" | "none";

function getWalletExpiryStatus(expiryDate: string | null): WalletExpiryStatus {
  if (!expiryDate) return "none";
  const target = new Date(`${expiryDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return "none";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "expired";
  if (diffDays <= WALLET_EXPIRY_SOON_DAYS) return "soon";
  return "valid";
}

const WALLET_EXPIRY_STYLE: Record<WalletExpiryStatus, { label: string; className: string }> = {
  valid: { label: "유효", className: "bg-emerald-100 text-emerald-700" },
  soon: { label: "만료 임박", className: "bg-amber-100 text-amber-700" },
  expired: { label: "만료", className: "bg-red-100 text-red-700" },
  none: { label: "만료일 없음", className: "bg-slate-100 text-slate-500" },
};

function formatWalletDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function formatWalletExpiry(expiryDate: string | null): string {
  if (!expiryDate) return "만료일 없음";
  const d = new Date(`${expiryDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "만료일 없음";
  return `만료일 ${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function getWalletFileExt(file: File): string {
  const parts = file.name.split(".");
  if (parts.length < 2) return "";
  return (parts.pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function WalletUploadModal({
  docType,
  onDocTypeChange,
  file,
  onFileChange,
  expiry,
  onExpiryChange,
  uploading,
  error,
  success,
  onSubmit,
  onClose,
}: {
  docType: string;
  onDocTypeChange: (value: string) => void;
  file: File | null;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  expiry: string;
  onExpiryChange: (value: string) => void;
  uploading: boolean;
  error: string | null;
  success: boolean;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="서류 업로드"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !uploading) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-[420px] overflow-y-auto rounded-[24px] bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <p className="text-[16px] font-extrabold text-slate-950">서류 추가</p>
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
            aria-label="닫기"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <label className="text-[11px] font-bold text-slate-600">서류 종류</label>
            <select
              value={docType}
              onChange={(event) => onDocTypeChange(event.target.value)}
              disabled={uploading}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-800 outline-none focus:border-blue-300"
            >
              {WALLET_DOC_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600">파일 선택</label>
            <label className="mt-1.5 flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center transition hover:bg-slate-100">
              <Upload size={18} className="text-slate-400" />
              <span className="px-3 text-[10px] text-slate-500">PDF, JPG, JPEG, PNG (최대 10MB)</span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={onFileChange}
                disabled={uploading}
                className="hidden"
              />
            </label>
            {file && (
              <p className="mt-2 truncate text-[11px] font-semibold text-slate-700">
                선택한 파일: {file.name} ({file.type || "형식 미확인"})
              </p>
            )}
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600">만료일 (선택)</label>
            <input
              type="date"
              value={expiry}
              onChange={(event) => onExpiryChange(event.target.value)}
              disabled={uploading}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-800 outline-none focus:border-blue-300"
            />
          </div>

          {error && <p className="text-[11px] font-semibold text-red-600">{error}</p>}
          {success && <p className="text-[11px] font-semibold text-emerald-600">업로드가 완료되었습니다.</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-[12px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={uploading || !file}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-900 text-[12px] font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  업로드 중...
                </>
              ) : (
                "업로드"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WalletViewModal({
  doc,
  onClose,
  onDownload,
}: {
  doc: WalletDocumentEntry;
  onClose: () => void;
  onDownload: () => void;
}) {
  const isImage = ["jpg", "jpeg", "png"].includes(doc.fileExt);
  const isPdf = doc.fileExt === "pdf";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label={`${doc.docType} 미리보기`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-extrabold text-slate-950">{doc.docType}</p>
            <p className="mt-0.5 truncate text-[10px] text-slate-400">{doc.fileName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
            aria-label="닫기"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50 p-4">
          {!doc.viewUrl ? (
            <div className="flex h-64 items-center justify-center text-[12px] text-slate-400">
              미리보기를 사용할 수 없습니다.
            </div>
          ) : isImage ? (
            <img
              src={doc.viewUrl}
              alt={doc.fileName}
              className="mx-auto max-h-[65vh] w-auto max-w-full object-contain"
            />
          ) : isPdf ? (
            <iframe
              src={doc.viewUrl}
              title={doc.fileName}
              className="h-[65vh] w-full rounded-xl border border-slate-200 bg-white"
            />
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-slate-400">
              <FileText size={32} />
              <span className="text-[11px]">이 형식은 미리보기를 지원하지 않습니다.</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-[12px] font-bold text-slate-600 hover:bg-slate-50"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={onDownload}
            disabled={!doc.downloadUrl}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-900 text-[12px] font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={15} />
            다운로드
          </button>
        </div>
      </div>
    </div>
  );
}

function WalletAllDocumentsModal({
  documents,
  onClose,
  onView,
  onDownload,
}: {
  documents: WalletDocumentEntry[];
  onClose: () => void;
  onView: (doc: WalletDocumentEntry) => void;
  onDownload: (doc: WalletDocumentEntry) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="전체 서류 보기"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[85vh] w-full max-w-[640px] flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <p className="text-[16px] font-extrabold text-slate-950">전체 서류 ({documents.length}건)</p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
            aria-label="닫기"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 sm:p-4">
          {documents.length === 0 ? (
            <p className="p-6 text-center text-[12px] text-slate-400">등록된 서류가 없습니다.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {documents.map((doc) => {
                const status = getWalletExpiryStatus(doc.expiryDate);
                const statusStyle = WALLET_EXPIRY_STYLE[status];
                return (
                  <div key={doc.activityId} className="flex flex-wrap items-center justify-between gap-3 px-2 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[12px] font-extrabold text-slate-900">{doc.docType}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${statusStyle.className}`}>
                          {statusStyle.label}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                          {doc.fileExt.toUpperCase() || "FILE"}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-[10px] text-slate-500">{doc.fileName}</p>
                      <p className="mt-0.5 text-[9px] text-slate-400">
                        등록일 {formatWalletDate(doc.createdAt)} · {formatWalletExpiry(doc.expiryDate)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        type="button"
                        onClick={() => onView(doc)}
                        disabled={!doc.viewUrl}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        보기
                      </button>
                      <button
                        type="button"
                        onClick={() => onDownload(doc)}
                        disabled={!doc.downloadUrl}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[10px] font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                      >
                        다운로드
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WalletSection({ leadId }: { leadId: string }) {
  const [documents, setDocuments] = useState<WalletDocumentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadDocType, setUploadDocType] = useState(WALLET_DOC_TYPES[0]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadExpiry, setUploadExpiry] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [viewDoc, setViewDoc] = useState<WalletDocumentEntry | null>(null);
  const [allOpen, setAllOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function fetchDocuments() {
    setLoading(true);
    setLoadError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        setLoadError("로그인이 필요합니다.");
        setDocuments([]);
        return;
      }
      const response = await fetch("/api/mypage-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, leadId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setLoadError(data?.error ?? "서류 목록을 불러오지 못했습니다.");
        setDocuments([]);
        return;
      }
      setDocuments(Array.isArray(data.documents) ? data.documents : []);
    } catch (error) {
      console.error("wallet fetch failed:", error);
      setLoadError("서류 목록을 불러오지 못했습니다.");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  function openUploadModal() {
    setUploadDocType(WALLET_DOC_TYPES[0]);
    setUploadFile(null);
    setUploadExpiry("");
    setUploadError(null);
    setUploadSuccess(false);
    setUploadOpen(true);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    setUploadError(null);
    setUploadSuccess(false);
    setUploadFile(nextFile);
  }

  async function handleUploadSubmit() {
    if (uploading) return;
    if (!uploadFile) {
      setUploadError("파일을 선택해주세요.");
      return;
    }
    const ext = getWalletFileExt(uploadFile);
    if (!WALLET_ALLOWED_EXTENSIONS.includes(ext)) {
      setUploadError("PDF, JPG, JPEG, PNG 파일만 업로드할 수 있습니다.");
      return;
    }
    if (uploadFile.size > WALLET_MAX_UPLOAD_BYTES) {
      setUploadError("파일 크기는 최대 10MB까지 업로드할 수 있습니다.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    const storagePath = `${WALLET_STORAGE_PREFIX}/${leadId}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadErr } = await supabase.storage.from(WALLET_STORAGE_BUCKET).upload(storagePath, uploadFile);
    if (uploadErr) {
      console.error("wallet upload error:", uploadErr);
      setUploadError("업로드 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setUploading(false);
      return;
    }

    const { error: insertErr } = await supabase.from("crm_activities").insert({
      lead_id: leadId,
      action: WALLET_CRM_ACTION,
      tag: uploadDocType,
      meta: {
        fileName: uploadFile.name,
        storagePath,
        fileSize: uploadFile.size,
        expiryDate: uploadExpiry || null,
      },
    });

    if (insertErr) {
      console.error("wallet crm insert error:", insertErr);
      await supabase.storage.from(WALLET_STORAGE_BUCKET).remove([storagePath]);
      setUploadError("저장 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setUploading(false);
      return;
    }

    setUploading(false);
    setUploadSuccess(true);
    await fetchDocuments();
    setTimeout(() => setUploadOpen(false), 900);
  }

  function handleReuseClick() {
    setNotice("신청 서류 재사용 기능은 준비 중입니다.");
  }

  function triggerDownload(doc: WalletDocumentEntry) {
    if (!doc.downloadUrl) return;
    const anchor = document.createElement("a");
    anchor.href = doc.downloadUrl;
    anchor.rel = "noreferrer";
    anchor.click();
  }

  const isEmpty = !loading && !loadError && documents.length === 0;

  return (
    <section id="wallet" className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[18px] font-extrabold tracking-[-0.02em] text-slate-950">내 서류 지갑</p>
          <p className="mt-1 text-[11px] text-slate-500">
            자주 사용하는 행정서류를 안전하게 보관하고 다시 사용할 수 있습니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAllOpen(true)}
          disabled={documents.length === 0}
          className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-blue-700 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          전체 보기 <ChevronRight size={13} />
        </button>
      </div>

      {loading && (
        <div className="mt-5 flex items-center gap-2 rounded-2xl bg-slate-50 p-5 text-[12px] text-slate-500">
          <Loader2 size={16} className="animate-spin" />
          서류 목록을 불러오는 중입니다.
        </div>
      )}

      {!loading && loadError && (
        <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-5 text-center">
          <AlertTriangle size={20} className="mx-auto text-red-500" />
          <p className="mt-2 text-[12px] font-semibold text-red-700">{loadError}</p>
          <button
            type="button"
            onClick={fetchDocuments}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[11px] font-bold text-red-700 hover:bg-red-50"
          >
            <RefreshCw size={13} />
            다시 시도
          </button>
        </div>
      )}

      {!loading && !loadError && isEmpty && (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-7 text-center">
          <FolderLock size={26} className="mx-auto text-slate-300" />
          <p className="mt-3 text-[13px] font-bold text-slate-700">아직 보관된 서류가 없습니다.</p>
          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            자주 사용하는 행정서류를 등록하면 필요할 때 다시 확인하고 내려받을 수 있습니다.
          </p>
          <button
            type="button"
            onClick={openUploadModal}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-[12px] font-bold text-white hover:bg-blue-800"
          >
            <Plus size={15} />
            서류 추가
          </button>
        </div>
      )}

      {!loading && !loadError && !isEmpty && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-6">
          {documents.map((doc) => {
            const status = getWalletExpiryStatus(doc.expiryDate);
            const statusStyle = WALLET_EXPIRY_STYLE[status];
            const isImage = ["jpg", "jpeg", "png"].includes(doc.fileExt);
            return (
              <div
                key={doc.activityId}
                className="group min-w-0 rounded-[14px] border border-slate-200 bg-white p-2.5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <p className="truncate text-[11px] font-extrabold text-slate-900">{doc.docType}</p>
                <p className="mt-0.5 truncate text-[8px] text-slate-400">{formatWalletExpiry(doc.expiryDate)}</p>

                <div className="relative mt-2 h-[150px] overflow-hidden rounded-[8px] border border-slate-200 bg-slate-50 p-1.5 shadow-inner">
                  {isImage && doc.viewUrl ? (
                    <img
                      src={doc.viewUrl}
                      alt={`${doc.docType} 미리보기`}
                      className="h-full w-full object-contain"
                      loading="lazy"
                      draggable={false}
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-slate-400">
                      <FileText size={30} />
                      <span className="max-w-full truncate px-2 text-[9px]">{doc.fileName}</span>
                    </div>
                  )}
                  <span
                    className={`absolute bottom-1.5 right-1.5 rounded-md px-1.5 py-0.5 text-[8px] font-extrabold shadow-sm ${
                      isImage ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {doc.fileExt.toUpperCase() || "FILE"}
                  </span>
                  <span
                    className={`absolute left-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-[7px] font-extrabold shadow-sm ${statusStyle.className}`}
                  >
                    {statusStyle.label}
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setViewDoc(doc)}
                    disabled={!doc.viewUrl}
                    className="rounded-[7px] border border-slate-200 bg-white py-1.5 text-[8px] font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    보기
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerDownload(doc)}
                    disabled={!doc.downloadUrl}
                    className="truncate rounded-[7px] border border-blue-200 bg-blue-50 px-1 py-1.5 text-[8px] font-bold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    다운로드
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleReuseClick}
                  className="mt-1 w-full truncate rounded-[7px] border border-slate-200 bg-slate-50 px-1 py-1.5 text-[8px] font-bold text-slate-500 hover:bg-slate-100"
                >
                  신청에 사용
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={openUploadModal}
            className="flex min-h-[180px] min-w-0 flex-col items-center justify-center rounded-[14px] border border-dashed border-blue-300 bg-blue-50/30 px-2 text-blue-700 transition hover:bg-blue-50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-300 bg-white shadow-sm">
              <Plus size={22} />
            </div>
            <span className="mt-3 text-[10px] font-bold">서류 추가</span>
          </button>
        </div>
      )}

      {!loading && !loadError && !isEmpty && (
        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400">
          <Lock size={12} />
          업로드한 서류는 본인만 조회·다운로드할 수 있습니다.
        </div>
      )}

      {notice && (
        <div className="mt-3 rounded-xl bg-slate-900/90 px-3 py-2 text-center text-[11px] font-semibold text-white">
          {notice}
        </div>
      )}

      {uploadOpen && (
        <WalletUploadModal
          docType={uploadDocType}
          onDocTypeChange={setUploadDocType}
          file={uploadFile}
          onFileChange={handleFileChange}
          expiry={uploadExpiry}
          onExpiryChange={setUploadExpiry}
          uploading={uploading}
          error={uploadError}
          success={uploadSuccess}
          onSubmit={handleUploadSubmit}
          onClose={() => {
            if (!uploading) setUploadOpen(false);
          }}
        />
      )}

      {viewDoc && (
        <WalletViewModal doc={viewDoc} onClose={() => setViewDoc(null)} onDownload={() => triggerDownload(viewDoc)} />
      )}

      {allOpen && (
        <WalletAllDocumentsModal
          documents={documents}
          onClose={() => setAllOpen(false)}
          onView={(doc) => {
            setAllOpen(false);
            setViewDoc(doc);
          }}
          onDownload={triggerDownload}
        />
      )}
    </section>
  );
}

function RecommendedServices() {
  const services = [
    {
      title: "거주증 갱신 지원",
      text: "만료 87일 전, 미리 준비하세요.",
      action: "자세히 보기",
      className: "bg-gradient-to-br from-blue-50 to-blue-100/60",
      iconClass: "bg-blue-100 text-blue-700",
      icon: CalendarDays,
    },
    {
      title: "운전면허 전환 확인",
      text: "한국 면허 → 베트남 면허",
      action: "확인하기",
      className: "bg-gradient-to-br from-emerald-50 to-emerald-100/60",
      iconClass: "bg-emerald-100 text-emerald-700",
      icon: FileCheck2,
    },
    {
      title: "사업자 허가 갱신",
      text: "정기 점검 시기 확인하세요.",
      action: "자세히 보기",
      className: "bg-gradient-to-br from-orange-50 to-orange-100/60",
      iconClass: "bg-orange-100 text-orange-700",
      icon: Building2,
    },
    {
      title: "가족 비자 확인",
      text: "가족 비자 가능성 확인",
      action: "자세히 보기",
      className: "bg-gradient-to-br from-violet-50 to-violet-100/60",
      iconClass: "bg-violet-100 text-violet-700",
      icon: UserCheck,
    },
  ];

  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-[18px] font-extrabold tracking-[-0.02em] text-slate-950">맞춤 추천 서비스</p>
        <button className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700">
          전체 보기 <ChevronRight size={13} />
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <div key={service.title} className={`rounded-2xl border border-white/80 p-4 ${service.className}`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${service.iconClass}`}>
              <service.icon size={18} />
            </div>
            <p className="mt-4 text-[13px] font-extrabold text-slate-900">{service.title}</p>
            <p className="mt-2 text-[10px] leading-5 text-slate-500">{service.text}</p>
            <button className="mt-4 rounded-lg border border-white bg-white px-3 py-2 text-[10px] font-bold text-blue-800 shadow-sm hover:shadow">
              {service.action}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

const PUBLIC_LINKS = [
  {
    label: "정부24",
    sub: "주민등록등본, 가족관계증명서 등",
    href: "https://www.gov.kr/",
    iconSrc: "/mypage-icons/kr-gov24.webp",
  },
  {
    label: "영사민원24",
    sub: "공증, 영사확인, 여권 등",
    href: "https://consul.mofa.go.kr/",
    iconSrc: "/mypage-icons/kr-consul.webp",
  },
  {
    label: "법무부",
    sub: "출입국·체류·국적 관련 정보",
    href: "https://www.moj.go.kr/",
    iconSrc: "/mypage-icons/kr-moj.webp",
  },
  {
    label: "하이코리아",
    sub: "외국인 전자민원, 체류 신청 등",
    href: "https://www.hikorea.go.kr/",
    iconSrc: "/mypage-icons/kr-hikorea.webp",
  },
];

const VN_PUBLIC_LINKS = [
  {
    label: "베트남 공공서비스 포털",
    href: "https://dichvucong.gov.vn/",
    iconSrc: "/mypage-icons/vn-portal.webp",
  },
  {
    label: "출입국관리기관",
    href: "https://xuatnhapcanh.gov.vn/",
    iconSrc: "/mypage-icons/vn-immigration.webp",
  },
  {
    label: "세무기관",
    href: "https://www.gdt.gov.vn/",
    iconSrc: "/mypage-icons/vn-tax.webp",
  },
  {
    label: "기업등록기관",
    href: "https://dangkykinhdoanh.gov.vn/",
    iconSrc: "/mypage-icons/vn-business.webp",
  },
  {
    label: "노동·고용 기관",
    href: "https://moha.gov.vn/",
    iconSrc: "/mypage-icons/vn-labor.webp",
  },
];

function PublicLinksCard({
  title,
  links,
}: {
  title: string;
  links: { label: string; sub?: string; href: string; iconSrc: string }[];
}) {
  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[16px] font-extrabold text-slate-950">{title}</p>
        <span className="text-[10px] font-semibold text-blue-700">전체 보기</span>
      </div>
      <div className="mt-3 divide-y divide-slate-100">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-[64px] items-center justify-between py-3 transition hover:bg-slate-50"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm">
                <img
                  src={link.iconSrc}
                  alt={`${link.label} 기관 아이콘`}
                  className="block max-h-8 max-w-8 object-contain object-center"
                  loading="lazy"
                  draggable={false}
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-bold text-slate-900">{link.label}</p>
                {link.sub ? <p className="mt-1 truncate text-[10px] text-slate-400">{link.sub}</p> : null}
              </div>
            </div>
            <ExternalLink size={13} className="shrink-0 text-slate-300" />
          </a>
        ))}
      </div>
    </section>
  );
}


function NotificationCard({ item }: { item: MyPageItem }) {
  const entries = [
    {
      icon: MessageCircle,
      tone: "bg-red-50 text-red-600",
      title: "행정전문팀 메시지",
      sub: "행정전문팀에서 추가 서류를 요청했습니다.",
    },
    {
      icon: AlertTriangle,
      tone: "bg-amber-50 text-amber-600",
      title: "거주증 만료 알림",
      sub: "만료까지 87일 남았습니다.",
    },
    {
      icon: FileCheck2,
      tone: "bg-emerald-50 text-emerald-600",
      title: "AI 리포트 완료",
      sub: "AI 리포트가 준비되었습니다.",
    },
    {
      icon: Building2,
      tone: "bg-blue-50 text-blue-600",
      title: "정부 제출 예정",
      sub: nextStepLabel(item.stage.steps),
    },
  ];

  return (
    <section id="notifications" className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[16px] font-extrabold text-slate-950">알림 센터</p>
        <span className="text-[10px] font-semibold text-blue-700">전체 보기</span>
      </div>

      <div className="mt-3 space-y-1">
        {entries.map((entry) => (
          <div key={entry.title} className="flex gap-3 rounded-xl p-2.5 hover:bg-slate-50">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${entry.tone}`}>
              <entry.icon size={15} />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-slate-900">{entry.title}</p>
              <p className="mt-1 text-[10px] leading-4 text-slate-500">{entry.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

type VietnamLifeDetailKey =
  | "weather"
  | "exchange"
  | "bank"
  | "holiday"
  | "notice"
  | "schedule";

type WeatherState = {
  temperature: number | null;
  apparentTemperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  precipitation: number | null;
  weatherCode: number | null;
  dailyHigh: number | null;
  dailyLow: number | null;
  sunrise: string | null;
  sunset: string | null;
  updatedAt: string | null;
  loading: boolean;
  error: boolean;
};

type ExchangeState = {
  krwToVnd: number | null;
  usdToVnd: number | null;
  updatedAt: string | null;
  loading: boolean;
  error: boolean;
};

const VIETNAM_HOLIDAYS_2026 = [
  { start: "2026-01-01", end: "2026-01-04", label: "신정 연휴" },
  { start: "2026-02-14", end: "2026-02-22", label: "설날(Tết) 연휴" },
  { start: "2026-04-25", end: "2026-04-27", label: "훙왕 기념일 연휴" },
  { start: "2026-04-30", end: "2026-05-03", label: "통일절·노동절 연휴" },
  { start: "2026-08-29", end: "2026-09-02", label: "베트남 국경절 연휴" },
];

function dateOnly(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function parseLocalDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function getVietnamHolidayStatus(now = new Date()) {
  const today = dateOnly(now);
  const current = VIETNAM_HOLIDAYS_2026.find(
    (holiday) => today >= holiday.start && today <= holiday.end
  );
  const next = VIETNAM_HOLIDAYS_2026.find((holiday) => holiday.start > today) ?? null;
  return { current, next };
}

function formatHolidayDate(start: string, end: string) {
  const startDate = parseLocalDate(start);
  const endDate = parseLocalDate(end);
  const startLabel = `${startDate.getMonth() + 1}월 ${startDate.getDate()}일`;
  const endLabel = `${endDate.getMonth() + 1}월 ${endDate.getDate()}일`;
  return start === end ? startLabel : `${startLabel}~${endLabel}`;
}

function weatherCodeLabel(code: number | null) {
  if (code === null) return "날씨 확인 중";
  if (code === 0) return "맑음";
  if ([1, 2].includes(code)) return "대체로 맑음";
  if (code === 3) return "흐림";
  if ([45, 48].includes(code)) return "안개";
  if ([51, 53, 55, 56, 57].includes(code)) return "이슬비";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "비";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "눈";
  if ([95, 96, 99].includes(code)) return "뇌우";
  return "기상정보";
}

function formatWeatherTime(value: string | null) {
  if (!value) return "확인 중";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "확인 중";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatClock(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function VietnamLifeCard({ item }: { item: MyPageItem }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<VietnamLifeDetailKey | null>(null);
  const [krwAmount, setKrwAmount] = useState("100000");
  const [usdAmount, setUsdAmount] = useState("100");
  const [weather, setWeather] = useState<WeatherState>({
    temperature: null,
    apparentTemperature: null,
    humidity: null,
    windSpeed: null,
    precipitation: null,
    weatherCode: null,
    dailyHigh: null,
    dailyLow: null,
    sunrise: null,
    sunset: null,
    updatedAt: null,
    loading: true,
    error: false,
  });
  const [exchange, setExchange] = useState<ExchangeState>({
    krwToVnd: null,
    usdToVnd: null,
    updatedAt: null,
    loading: true,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=21.0285&longitude=105.8542&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=Asia%2FBangkok&forecast_days=1",
          { cache: "no-store" }
        );
        if (!response.ok) throw new Error("weather fetch failed");
        const data = await response.json();
        if (cancelled) return;
        setWeather({
          temperature:
            typeof data?.current?.temperature_2m === "number"
              ? data.current.temperature_2m
              : null,
          apparentTemperature:
            typeof data?.current?.apparent_temperature === "number"
              ? data.current.apparent_temperature
              : null,
          humidity:
            typeof data?.current?.relative_humidity_2m === "number"
              ? data.current.relative_humidity_2m
              : null,
          windSpeed:
            typeof data?.current?.wind_speed_10m === "number"
              ? data.current.wind_speed_10m
              : null,
          precipitation:
            typeof data?.current?.precipitation === "number"
              ? data.current.precipitation
              : null,
          weatherCode:
            typeof data?.current?.weather_code === "number"
              ? data.current.weather_code
              : null,
          dailyHigh:
            typeof data?.daily?.temperature_2m_max?.[0] === "number"
              ? data.daily.temperature_2m_max[0]
              : null,
          dailyLow:
            typeof data?.daily?.temperature_2m_min?.[0] === "number"
              ? data.daily.temperature_2m_min[0]
              : null,
          sunrise: data?.daily?.sunrise?.[0] ?? null,
          sunset: data?.daily?.sunset?.[0] ?? null,
          updatedAt: data?.current?.time ?? new Date().toISOString(),
          loading: false,
          error: false,
        });
      } catch (error) {
        console.error("weather fetch failed:", error);
        if (!cancelled) {
          setWeather((current) => ({ ...current, loading: false, error: true }));
        }
      }
    }

    async function loadExchange() {
      try {
        const response = await fetch("https://api.exchangerate-api.com/v4/latest/KRW", {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("exchange fetch failed");
        const data = await response.json();
        const krwToVnd = Number(data?.rates?.VND);
        const krwToUsd = Number(data?.rates?.USD);
        if (!Number.isFinite(krwToVnd) || !Number.isFinite(krwToUsd) || krwToUsd <= 0) {
          throw new Error("invalid exchange response");
        }
        if (cancelled) return;
        setExchange({
          krwToVnd,
          usdToVnd: krwToVnd / krwToUsd,
          updatedAt: data?.date ?? new Date().toISOString(),
          loading: false,
          error: false,
        });
      } catch (error) {
        console.error("exchange fetch failed:", error);
        if (!cancelled) {
          setExchange((current) => ({ ...current, loading: false, error: true }));
        }
      }
    }

    loadWeather();
    loadExchange();

    return () => {
      cancelled = true;
    };
  }, []);

  const holidayStatus = getVietnamHolidayStatus();
  const isWeekend = [0, 6].includes(new Date().getDay());
  const bankClosed = isWeekend || Boolean(holidayStatus.current);
  const nextSchedule = item.stage.steps.find((step) => !step.done);
  const completedStepCount = item.stage.steps.filter((step) => step.done).length;
  const scheduleLabel = nextSchedule
    ? `${nextSchedule.label} 준비`
    : item.permitCompletedAt
      ? "허가 완료"
      : "담당자 안내 대기";

  const weatherDescription = weather.loading
    ? "하노이 날씨 불러오는 중"
    : weather.error || weather.temperature === null
      ? "날씨를 불러오지 못했습니다"
      : `${Math.round(weather.temperature)}°C · ${weatherCodeLabel(weather.weatherCode)}`;

  const exchangeDescription = exchange.loading
    ? "환율 불러오는 중"
    : exchange.error || exchange.krwToVnd === null
      ? "환율을 불러오지 못했습니다"
      : `1,000원 = ${Math.round(exchange.krwToVnd * 1000).toLocaleString("ko-KR")}동`;

  const parseCurrencyAmount = (value: string) => {
    const normalized = value.replace(/[^0-9.]/g, "");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  };

  const formatCurrencyInput = (value: string) => {
    const digits = value.replace(/[^0-9]/g, "");
    return digits ? Number(digits).toLocaleString("ko-KR") : "";
  };

  const krwNumericAmount = parseCurrencyAmount(krwAmount);
  const usdNumericAmount = parseCurrencyAmount(usdAmount);
  const krwConvertedVnd =
    exchange.krwToVnd === null ? null : Math.round(krwNumericAmount * exchange.krwToVnd);
  const usdConvertedVnd =
    exchange.usdToVnd === null ? null : Math.round(usdNumericAmount * exchange.usdToVnd);

  const lifeItems = [
    {
      key: "weather" as const,
      label: "오늘 날씨",
      desc: weatherDescription,
      icon: Sun,
      iconClass: "bg-amber-50 text-amber-600",
    },
    {
      key: "exchange" as const,
      label: "환율",
      desc: exchangeDescription,
      icon: DollarSign,
      iconClass: "bg-emerald-50 text-emerald-600",
    },
    {
      key: "bank" as const,
      label: "은행 휴무",
      desc: bankClosed
        ? holidayStatus.current?.label ?? "주말 휴무"
        : "오늘 정상 영업 예상",
      icon: Building2,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      key: "holiday" as const,
      label: "공휴일",
      desc: holidayStatus.current
        ? holidayStatus.current.label
        : holidayStatus.next
          ? `다음: ${holidayStatus.next.label}`
          : "예정된 공휴일 확인",
      icon: CalendarDays,
      iconClass: "bg-violet-50 text-violet-600",
    },
    {
      key: "notice" as const,
      label: "행정 공지",
      desc: "현재 등록된 긴급 공지 없음",
      icon: Bell,
      iconClass: "bg-rose-50 text-rose-600",
    },
    {
      key: "schedule" as const,
      label: "내 일정",
      desc: scheduleLabel,
      icon: CalendarCheck,
      iconClass: "bg-indigo-50 text-indigo-600",
    },
  ];

  const primaryItems = lifeItems.slice(0, 2);
  const moreItems = lifeItems.slice(2);

  const renderLifeItem = (lifeItem: (typeof lifeItems)[number]) => (
    <button
      key={lifeItem.key}
      type="button"
      onClick={() => setDetail(lifeItem.key)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-slate-50 hover:shadow-sm"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${lifeItem.iconClass}`}
        >
          <lifeItem.icon size={18} strokeWidth={2} />
        </span>
        <span className="min-w-0">
          <span className="block text-[12px] font-extrabold text-slate-900">{lifeItem.label}</span>
          <span className="mt-0.5 block truncate text-[10px] font-medium text-slate-500">
            {lifeItem.desc}
          </span>
        </span>
      </span>
      <ChevronRight size={15} className="shrink-0 text-slate-400" />
    </button>
  );

  const detailTitle = lifeItems.find((lifeItem) => lifeItem.key === detail)?.label ?? "";

  return (
    <>
      <section id="vietnam-life" className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[16px] font-extrabold text-slate-950">🇻🇳 베트남 생활 정보</p>
          <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
            LIVE
          </span>
        </div>
        <p className="mt-1 text-[11px] leading-5 text-slate-500">
          생활에 필요한 주요 정보를 빠르게 확인하세요.
        </p>

        <div className="mt-4 space-y-2">{primaryItems.map(renderLifeItem)}</div>

        {expanded && (
          <div className="mt-2 space-y-2 border-t border-slate-100 pt-2">
            {moreItems.map(renderLifeItem)}
          </div>
        )}

        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 text-[11px] font-bold text-blue-800 transition hover:bg-blue-100"
        >
          {expanded ? "생활정보 접기" : "생활정보 4개 더 보기"}
          <ChevronDown
            size={15}
            className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </section>

      {detail && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-5"
          onClick={() => setDetail(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={detailTitle}
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-slate-50 shadow-2xl sm:max-w-xl sm:rounded-[28px]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-7 sm:py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                  Vietnam Life Brief
                </p>
                <h2 className="mt-1 text-[20px] font-extrabold text-slate-950">{detailTitle}</h2>
              </div>
              <button
                type="button"
                onClick={() => setDetail(null)}
                aria-label="닫기"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 sm:p-7">
              {detail === "weather" && (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-[22px] border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                            <Sun size={18} />
                          </span>
                          <div>
                            <p className="text-[11px] font-bold text-amber-800">하노이 현재 날씨</p>
                            <p className="text-[10px] text-slate-500">
                              {formatWeatherTime(weather.updatedAt)} 업데이트
                            </p>
                          </div>
                        </div>
                        <p className="mt-5 text-[42px] font-extrabold tracking-tight text-slate-950">
                          {weather.temperature === null ? "—" : `${Math.round(weather.temperature)}°C`}
                        </p>
                        <p className="mt-1 text-[15px] font-bold text-slate-700">
                          {weather.error
                            ? "날씨 정보를 불러오지 못했습니다."
                            : weatherCodeLabel(weather.weatherCode)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/80 bg-white/75 px-4 py-3 text-right shadow-sm">
                        <p className="text-[10px] font-bold text-slate-500">오늘 최고 / 최저</p>
                        <p className="mt-1 text-[15px] font-extrabold text-slate-900">
                          {weather.dailyHigh === null ? "—" : `${Math.round(weather.dailyHigh)}°`}
                          <span className="mx-1 text-slate-300">/</span>
                          {weather.dailyLow === null ? "—" : `${Math.round(weather.dailyLow)}°`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      ["체감온도", weather.apparentTemperature === null ? "—" : `${Math.round(weather.apparentTemperature)}°C`],
                      ["습도", weather.humidity === null ? "—" : `${Math.round(weather.humidity)}%`],
                      ["풍속", weather.windSpeed === null ? "—" : `${Math.round(weather.windSpeed)} km/h`],
                      ["강수량", weather.precipitation === null ? "—" : `${weather.precipitation.toFixed(1)} mm`],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-500">{label}</p>
                        <p className="mt-1 text-[16px] font-extrabold text-slate-950">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-[10px] font-bold text-slate-500">일출</p>
                      <p className="mt-1 text-[16px] font-extrabold text-slate-950">
                        {formatClock(weather.sunrise)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-[10px] font-bold text-slate-500">일몰</p>
                      <p className="mt-1 text-[16px] font-extrabold text-slate-950">
                        {formatClock(weather.sunset)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-[11px] font-extrabold text-blue-900">정보 기준</p>
                    <p className="mt-1 text-[10px] leading-5 text-blue-800/75">
                      하노이 중심 좌표를 기준으로 제공되는 실시간 참고 정보입니다. 실제 위치와
                      시간에 따라 차이가 있을 수 있습니다.
                    </p>
                  </div>
                </div>
              )}

              {detail === "exchange" && (
                <div className="space-y-4">
                  <div className="rounded-[22px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <DollarSign size={20} />
                        </span>
                        <div>
                          <p className="text-[11px] font-bold text-emerald-800">기준 환율</p>
                          <p className="text-[10px] text-slate-500">
                            {exchange.updatedAt ? `${exchange.updatedAt} 기준` : "최신 데이터 확인 중"}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-[9px] font-extrabold text-emerald-700 shadow-sm">
                        LIVE RATE
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white/85 p-4">
                        <p className="text-[10px] font-bold text-slate-500">대한민국 원화</p>
                        <p className="mt-1 text-[18px] font-extrabold text-slate-950">
                          {exchange.krwToVnd === null
                            ? "조회 실패"
                            : `1,000원 = ${Math.round(exchange.krwToVnd * 1000).toLocaleString("ko-KR")}동`}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white/85 p-4">
                        <p className="text-[10px] font-bold text-slate-500">미국 달러</p>
                        <p className="mt-1 text-[18px] font-extrabold text-slate-950">
                          {exchange.usdToVnd === null
                            ? "조회 실패"
                            : `1달러 = ${Math.round(exchange.usdToVnd).toLocaleString("ko-KR")}동`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[12px] font-extrabold text-slate-950">원화 → 베트남 동 계산</p>
                        <p className="mt-1 text-[9px] text-slate-500">
                          원화 금액을 입력하면 현재 환율로 자동 계산됩니다.
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
                        KRW → VND
                      </span>
                    </div>

                    <div className="mt-4">
                      <label className="text-[10px] font-bold text-slate-600">대한민국 원화</label>
                      <div className="mt-1.5 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-emerald-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-50">
                        <span className="shrink-0 text-[15px] font-extrabold text-slate-500">₩</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatCurrencyInput(krwAmount)}
                          onChange={(event) =>
                            setKrwAmount(event.target.value.replace(/[^0-9]/g, ""))
                          }
                          placeholder="100,000"
                          className="h-14 min-w-0 flex-1 bg-transparent px-3 text-right text-[22px] font-extrabold text-slate-950 outline-none"
                        />
                        <span className="shrink-0 text-[12px] font-bold text-slate-500">원</span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {[100000, 500000, 1000000, 5000000].map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => setKrwAmount(String(amount))}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-bold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            {amount.toLocaleString("ko-KR")}원
                          </button>
                        ))}
                      </div>

                      <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
                        <p className="text-[10px] font-bold text-emerald-800">예상 베트남 동</p>
                        <p className="mt-1 break-words text-[25px] font-extrabold tracking-tight text-slate-950">
                          {krwConvertedVnd === null
                            ? "환율 조회 중"
                            : `${krwConvertedVnd.toLocaleString("ko-KR")}동`}
                        </p>
                        <p className="mt-1 text-[9px] text-emerald-800/70">
                          {krwNumericAmount.toLocaleString("ko-KR")}원 기준
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[12px] font-extrabold text-slate-950">달러 → 베트남 동 계산</p>
                        <p className="mt-1 text-[9px] text-slate-500">
                          미국 달러 금액을 입력하면 현재 환율로 자동 계산됩니다.
                        </p>
                      </div>
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-bold text-blue-700">
                        USD → VND
                      </span>
                    </div>

                    <div className="mt-4">
                      <label className="text-[10px] font-bold text-slate-600">미국 달러</label>
                      <div className="mt-1.5 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
                        <span className="shrink-0 text-[15px] font-extrabold text-slate-500">$</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={usdAmount}
                          onChange={(event) => {
                            const next = event.target.value.replace(/[^0-9.]/g, "");
                            const parts = next.split(".");
                            setUsdAmount(
                              parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : next
                            );
                          }}
                          placeholder="100"
                          className="h-14 min-w-0 flex-1 bg-transparent px-3 text-right text-[22px] font-extrabold text-slate-950 outline-none"
                        />
                        <span className="shrink-0 text-[12px] font-bold text-slate-500">USD</span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {[100, 500, 1000, 5000].map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => setUsdAmount(String(amount))}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            ${amount.toLocaleString("en-US")}
                          </button>
                        ))}
                      </div>

                      <div className="mt-4 rounded-2xl bg-blue-50 p-4">
                        <p className="text-[10px] font-bold text-blue-800">예상 베트남 동</p>
                        <p className="mt-1 break-words text-[25px] font-extrabold tracking-tight text-slate-950">
                          {usdConvertedVnd === null
                            ? "환율 조회 중"
                            : `${usdConvertedVnd.toLocaleString("ko-KR")}동`}
                        </p>
                        <p className="mt-1 text-[9px] text-blue-800/70">
                          {usdNumericAmount.toLocaleString("en-US")}달러 기준
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                    <p className="text-[11px] font-extrabold text-amber-900">환전 전 확인하세요</p>
                    <p className="mt-1 text-[10px] leading-5 text-amber-900/75">
                      계산 결과는 참고용 시장 환율을 적용한 예상 금액입니다. 실제 송금·현금 환전 시
                      은행 고시환율, 환전소 스프레드 및 수수료가 별도로 적용됩니다.
                    </p>
                  </div>
                </div>
              )}

              {detail === "bank" && (
                <div className="space-y-4">
                  <div className="rounded-[22px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-sky-50 p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                        <Building2 size={20} />
                      </span>
                      <div>
                        <p className="text-[11px] font-bold text-blue-800">오늘 은행 운영 예상</p>
                        <p className="mt-0.5 text-[24px] font-extrabold text-slate-950">
                          {bankClosed ? "휴무 예상" : "정상 영업 예상"}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-[11px] leading-5 text-slate-600">
                      {holidayStatus.current
                        ? `${holidayStatus.current.label} 기간으로 공휴일 휴무가 예상됩니다.`
                        : isWeekend
                          ? "오늘은 주말이므로 일반 영업점은 휴무로 예상됩니다."
                          : "오늘은 평일이며 일반 영업점 기준 정상 운영이 예상됩니다."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-[10px] font-bold text-slate-500">일반 창구</p>
                      <p className="mt-1 text-[15px] font-extrabold text-slate-950">
                        평일 영업 중심
                      </p>
                      <p className="mt-1 text-[9px] leading-4 text-slate-500">
                        지점별 운영시간 상이
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-[10px] font-bold text-slate-500">ATM·모바일뱅킹</p>
                      <p className="mt-1 text-[15px] font-extrabold text-slate-950">
                        대부분 이용 가능
                      </p>
                      <p className="mt-1 text-[9px] leading-4 text-slate-500">
                        점검시간 제외
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[11px] font-extrabold text-slate-900">방문 전 체크</p>
                    <div className="mt-3 space-y-2 text-[10px] text-slate-600">
                      <p>• 현금 환전 창구 운영 여부</p>
                      <p>• 점심시간 및 번호표 마감시간</p>
                      <p>• 기업·외국인 전용 창구 운영 여부</p>
                    </div>
                  </div>

                  <p className="text-[9px] leading-5 text-slate-500">
                    이 정보는 달력 기준 예상값입니다. 특별 휴무와 지점별 운영시간은 해당 은행에
                    직접 확인해야 합니다.
                  </p>
                </div>
              )}

              {detail === "holiday" && (
                <div className="space-y-4">
                  {holidayStatus.current && (
                    <div className="rounded-[22px] border border-violet-100 bg-violet-50 p-5">
                      <p className="text-[10px] font-bold text-violet-700">현재 공휴일</p>
                      <p className="mt-1 text-[20px] font-extrabold text-slate-950">
                        {holidayStatus.current.label}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-600">
                        {formatHolidayDate(holidayStatus.current.start, holidayStatus.current.end)}
                      </p>
                    </div>
                  )}

                  {holidayStatus.next && (
                    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500">다음 공휴일</p>
                          <p className="mt-1 text-[18px] font-extrabold text-slate-950">
                            {holidayStatus.next.label}
                          </p>
                        </div>
                        <span className="rounded-full bg-violet-100 px-3 py-1 text-[9px] font-extrabold text-violet-700">
                          UPCOMING
                        </span>
                      </div>
                      <p className="mt-3 text-[12px] font-bold text-violet-700">
                        {formatHolidayDate(holidayStatus.next.start, holidayStatus.next.end)}
                      </p>
                    </div>
                  )}

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[11px] font-extrabold text-slate-900">2026 주요 공휴일</p>
                    <div className="mt-3 divide-y divide-slate-100">
                      {VIETNAM_HOLIDAYS_2026.map((holiday) => (
                        <div key={holiday.label} className="flex items-center justify-between gap-3 py-3">
                          <p className="text-[10px] font-bold text-slate-700">{holiday.label}</p>
                          <p className="shrink-0 text-[9px] font-semibold text-slate-500">
                            {formatHolidayDate(holiday.start, holiday.end)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                    <p className="text-[10px] leading-5 text-amber-900/80">
                      정부 발표에 따라 대체근무일·연휴 기간이 조정될 수 있습니다. 관공서 방문과
                      서류 제출 전 담당기관 일정을 다시 확인하세요.
                    </p>
                  </div>
                </div>
              )}

              {detail === "notice" && (
                <div className="space-y-4">
                  <div className="rounded-[22px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <CheckCircle2 size={20} />
                      </span>
                      <div>
                        <p className="text-[10px] font-bold text-emerald-700">현재 상태</p>
                        <p className="mt-0.5 text-[17px] font-extrabold text-slate-950">
                          긴급 행정 공지 없음
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-[10px] leading-5 text-slate-600">
                      현재 고객에게 즉시 영향을 주는 긴급 출입국·노동·세무 공지는 등록되어 있지
                      않습니다.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[11px] font-extrabold text-slate-900">공지 분류</p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[
                        ["출입국", "거주증·비자"],
                        ["노동", "노동허가"],
                        ["세무", "신고·납부"],
                      ].map(([title, desc]) => (
                        <div key={title} className="rounded-xl bg-slate-50 p-3 text-center">
                          <p className="text-[10px] font-extrabold text-slate-800">{title}</p>
                          <p className="mt-1 text-[8px] text-slate-500">{desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-[11px] font-extrabold text-blue-900">확인 방법</p>
                    <p className="mt-1 text-[10px] leading-5 text-blue-900/75">
                      중요 변경사항은 이 카드와 마이페이지 알림센터에 함께 표시됩니다. 공식 원문은
                      우측 베트남 공공기관 바로가기에서 다시 확인할 수 있습니다.
                    </p>
                  </div>
                </div>
              )}

              {detail === "schedule" && (
                <div className="space-y-4">
                  <div className="rounded-[22px] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-indigo-700">현재 신청</p>
                        <p className="mt-1 text-[19px] font-extrabold text-slate-950">
                          {item.serviceLabel}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-500">
                          다음 단계: {scheduleLabel}
                        </p>
                      </div>
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-[6px] border-indigo-100 bg-white">
                        <span className="text-[14px] font-extrabold text-indigo-700">
                          {item.stage.progressPercent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-extrabold text-slate-900">진행 현황</p>
                      <p className="text-[9px] font-bold text-slate-500">
                        {completedStepCount}/{item.stage.steps.length} 단계 완료
                      </p>
                    </div>
                    <div className="mt-4 space-y-3">
                      {item.stage.steps.map((step, index) => (
                        <div key={`${step.label}-${index}`} className="flex items-center gap-3">
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                              step.done
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {step.done ? <Check size={13} /> : <span className="text-[9px] font-bold">{index + 1}</span>}
                          </span>
                          <p
                            className={`text-[10px] font-bold ${
                              step.done ? "text-slate-900" : "text-slate-500"
                            }`}
                          >
                            {step.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-[10px] font-bold text-slate-500">예상 처리기간</p>
                      <p className="mt-1 text-[14px] font-extrabold text-slate-950">
                        {getEstimate(item.category, item.serviceType)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-[10px] font-bold text-slate-500">현재 단계</p>
                      <p className="mt-1 text-[14px] font-extrabold text-slate-950">
                        {item.stage.currentStepLabel}
                      </p>
                    </div>
                  </div>

                  {item.governmentSubmittedAt && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-[10px] font-bold text-slate-500">정부 제출일</p>
                      <p className="mt-1 text-[14px] font-extrabold text-slate-950">
                        {formatDate(item.governmentSubmittedAt)}
                      </p>
                    </div>
                  )}

                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-[10px] leading-5 text-blue-900/75">
                      일정은 담당기관 심사와 추가 보완 요청에 따라 변동될 수 있습니다. 중요한
                      변경사항은 알림센터와 담당자 메모에 표시됩니다.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function EmergencyHelpCard({ item }: { item: MyPageItem }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="rounded-[20px] border border-red-100 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <ShieldAlert size={18} />
              </div>
              <div>
                <p className="text-[16px] font-extrabold text-slate-950">베트남 긴급 도움</p>
                <p className="mt-0.5 text-[10px] text-slate-500">응급 상황 발생 시 즉시 연락하세요.</p>
              </div>
            </div>
          </div>
          <span className="rounded-full bg-red-50 px-2.5 py-1 text-[9px] font-extrabold text-red-600">24시간</span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "경찰", number: "113", tone: "bg-blue-50 text-blue-800" },
            { label: "소방", number: "114", tone: "bg-orange-50 text-orange-700" },
            { label: "구급", number: "115", tone: "bg-emerald-50 text-emerald-700" },
          ].map((contact) => (
            <a
              key={contact.number}
              href={`tel:${contact.number}`}
              className={`flex min-w-0 flex-col items-center justify-center rounded-xl px-2 py-3 transition hover:-translate-y-0.5 ${contact.tone}`}
            >
              <span className="text-[10px] font-bold">{contact.label}</span>
              <span className="mt-1 text-[17px] font-extrabold tracking-[-0.03em]">{contact.number}</span>
            </a>
          ))}
        </div>

        <a
          href="tel:+82232100404"
          className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 transition hover:bg-slate-100"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-500">대한민국 영사콜센터 · 24시간</p>
            <p className="mt-1 text-[13px] font-extrabold text-slate-900">+82-2-3210-0404</p>
          </div>
          <Phone size={17} className="shrink-0 text-[#0f3279]" />
        </a>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white text-[11px] font-bold text-red-700 transition hover:bg-red-50"
        >
          긴급 연락처·지원 보기
          <ChevronRight size={14} />
        </button>
      </section>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label="베트남 긴급 연락처 및 지원 안내"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="max-h-[88vh] w-full max-w-[520px] overflow-y-auto rounded-[24px] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="text-[18px] font-extrabold text-slate-950">긴급 연락처 및 지원</p>
                <p className="mt-1 text-[11px] text-slate-500">상황에 맞는 기관으로 즉시 연락하세요.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                aria-label="닫기"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "경찰", number: "113", tone: "border-blue-100 bg-blue-50 text-blue-800" },
                  { label: "소방", number: "114", tone: "border-orange-100 bg-orange-50 text-orange-700" },
                  { label: "구급", number: "115", tone: "border-emerald-100 bg-emerald-50 text-emerald-700" },
                ].map((contact) => (
                  <a
                    key={contact.number}
                    href={`tel:${contact.number}`}
                    className={`rounded-2xl border px-3 py-4 text-center ${contact.tone}`}
                  >
                    <p className="text-[11px] font-bold">{contact.label}</p>
                    <p className="mt-1 text-[21px] font-extrabold">{contact.number}</p>
                    <p className="mt-1 text-[9px] font-semibold">전화 연결</p>
                  </a>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                    <Landmark size={17} />
                  </div>
                  <div>
                    <p className="text-[13px] font-extrabold text-slate-950">대한민국 영사 지원</p>
                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                      여권 분실, 체포·조사, 응급 의료, 긴급 귀국 등 영사 지원이 필요한 경우 이용하세요.
                    </p>
                  </div>
                </div>
                <a
                  href="tel:+82232100404"
                  className="mt-3 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0f3279] text-[12px] font-bold text-white"
                >
                  <Phone size={15} />
                  영사콜센터 +82-2-3210-0404
                </a>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-[13px] font-extrabold text-amber-950">분실·사고 지원 항목</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-semibold text-amber-900">
                  {["여권 분실", "교통사고", "체포·조사", "응급 의료", "긴급 귀국", "사기·계약 분쟁"].map((label) => (
                    <div key={label} className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2">
                      <CheckCircle2 size={13} className="shrink-0 text-amber-600" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                <p className="text-[13px] font-extrabold text-red-950">VFBCAI 긴급 법률 지원</p>
                <p className="mt-1 text-[11px] leading-5 text-red-800">
                  사기, 계약 분쟁, 행정 문제 등 긴급한 법률 지원이 필요한 경우 상담을 요청하세요.
                </p>
                <Link
                  href={`/mypage/chat?leadId=${item.id}&label=${encodeURIComponent(item.serviceLabel)}`}
                  className="mt-3 flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 text-[12px] font-bold text-white transition hover:bg-red-700"
                >
                  <MessageSquare size={15} />
                  긴급 상담 요청
                </Link>
              </div>

              <p className="text-[10px] leading-5 text-slate-400">
                생명 또는 신체의 위험이 있는 경우 VFBCAI 상담보다 현지 긴급번호에 먼저 연락하세요.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function HelpCard() {
  const items = [
    { label: "채팅 상담", icon: MessageSquare, tone: "bg-blue-50 text-blue-700" },
    { label: "전화 상담", icon: HelpCircle, tone: "bg-emerald-50 text-emerald-700" },
    { label: "1:1 문의", icon: MessageCircle, tone: "bg-indigo-50 text-indigo-700" },
  ];

  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[16px] font-extrabold text-slate-950">도움이 필요하신가요?</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {items.map((item) => (
          <Link
            key={item.label}
            href="/consultation"
            className="flex min-h-[92px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-center transition hover:-translate-y-0.5 hover:shadow-sm"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${item.tone}`}>
              <item.icon size={17} />
            </div>
            <span className="text-[10px] font-bold text-slate-700">{item.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function PublicNotes({ notes }: { notes: PublicNote[] }) {
  if (notes.length === 0) return null;

  return (
    <section className="rounded-[20px] border border-blue-100 bg-blue-50/60 p-5">
      <div className="flex items-center gap-2">
        <MessageCircle size={17} className="text-blue-900" />
        <p className="text-[15px] font-extrabold text-blue-950">담당자 안내</p>
      </div>
      <div className="mt-4 space-y-3">
        {notes.map((note, index) => (
          <div key={`${note.createdAt}-${index}`} className="rounded-2xl bg-white p-4">
            <p className="whitespace-pre-wrap text-[12px] leading-6 text-slate-700">{note.memo}</p>
            <p className="mt-2 text-[10px] text-slate-400">{formatDate(note.createdAt)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PermitDocuments({ item }: { item: MyPageItem }) {
  if (!item.governmentSubmittedAt && !item.permitCompletedAt && !item.fileUrl) return null;

  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[16px] font-extrabold text-slate-950">제출 및 결과 문서</p>
      <div className="mt-4 space-y-3">
        {item.governmentSubmittedAt && (
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
            <div>
              <p className="text-[10px] text-slate-500">정부 제출</p>
              <p className="mt-1 text-[12px] font-extrabold text-slate-900">
                {formatIsoDate(item.governmentSubmittedAt)}
              </p>
            </div>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
        )}

        {item.permitCompletedAt && (
          <div className="rounded-2xl bg-emerald-50 p-4">
            <p className="text-[10px] text-emerald-700">허가 완료</p>
            <p className="mt-1 text-[12px] font-extrabold text-emerald-900">
              {formatIsoDate(item.permitCompletedAt)}
            </p>
            {item.permitFileUrl && (
              <a
                href={item.permitFileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-700 text-[11px] font-bold text-white"
              >
                <Download size={14} />
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
            className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 hover:bg-slate-50"
          >
            <span className="flex min-w-0 items-center gap-3">
              <FileText size={17} className="text-blue-900" />
              <span className="truncate text-[11px] font-bold text-slate-800">
                {item.fileName ?? "첨부서류 확인"}
              </span>
            </span>
            <Download size={15} className="text-slate-400" />
          </a>
        )}
      </div>
    </section>
  );
}

function MobileBottomNav() {
  const items = [
    { label: "홈", icon: Home, href: "/mypage", active: true },
    { label: "신청현황", icon: FileCheck2, href: "#applications" },
    { label: "서류지갑", icon: WalletCards, href: "#wallet" },
    { label: "신청하기", icon: Plus, href: "/", primary: true },
    { label: "알림", icon: Bell, href: "#notifications", badge: true },
    { label: "내 정보", icon: User, href: "#profile" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur xl:hidden">
      <div className="mx-auto grid max-w-[1480px] grid-cols-6 items-end">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`relative flex flex-col items-center gap-1.5 py-1.5 text-[10px] font-semibold ${
              item.active ? "text-blue-900" : "text-slate-500"
            }`}
          >
            <div
              className={`relative flex items-center justify-center ${
                item.primary
                  ? "-mt-5 h-14 w-14 rounded-full bg-blue-900 text-white shadow-[0_8px_24px_rgba(30,64,175,0.35)]"
                  : "h-7 w-7"
              }`}
            >
              <item.icon size={item.primary ? 25 : 20} />
              {item.badge ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white ring-2 ring-white">
                  3
                </span>
              ) : null}
            </div>
            <span className={item.primary ? "mt-0.5 text-slate-600" : ""}>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

function Dashboard({ name, items }: { name: string | null; items: MyPageItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    if (!items.some((item) => item.id === activeId)) {
      setActiveId(items[0]?.id ?? "");
    }
  }, [activeId, items]);

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeId) ?? items[0] ?? null,
    [activeId, items]
  );

  if (!activeItem) {
    return (
      <div className="rounded-[20px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <FileText size={32} className="mx-auto text-slate-300" />
        <p className="mt-4 text-[18px] font-extrabold text-slate-900">아직 접수하신 신청 내역이 없습니다.</p>
        <Link
          href="/"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-blue-900 px-5 text-[12px] font-bold text-white"
        >
          서비스 확인하기
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-5 xl:hidden">
        <p className="text-[18px] font-extrabold text-slate-950">
          안녕하세요, {name ?? "고객"}님 👋
        </p>
        <p className="mt-1 text-[12px] text-slate-500">오늘도 성공적인 하루 보내세요!</p>
      </div>

      <HeroCard
        item={activeItem}
        selector={
          <ApplicationSelector
            items={items}
            activeId={activeItem.id}
            onChange={setActiveId}
          />
        }
      />

      <div className="mt-5">
        <StepProgress stage={activeItem.stage} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <AiResultCard item={activeItem} />
        <CurrentStatusCard item={activeItem} />
      </div>

      <div className="mt-5">
        <ConfidenceBanner confidence={activeItem.confidence} />
      </div>

      <div className="mt-5">
        <TimelineCard item={activeItem} />
      </div>

      <div className="mt-5">
        <PublicNotes notes={activeItem.publicNotes} />
      </div>

      <div className="mt-5">
        <WalletSection leadId={activeItem.id} />
      </div>

      <div className="mt-5">
        <RecommendedServices />
      </div>

      <div className="mt-5 grid gap-5 xl:hidden">
        <NotificationCard item={activeItem} />
        <PublicLinksCard title="바로가기 (한국 공공기관)" links={PUBLIC_LINKS} />
        <PublicLinksCard title="바로가기 (베트남 공공기관)" links={VN_PUBLIC_LINKS} />
        <VietnamLifeCard item={activeItem} />
        <PermitDocuments item={activeItem} />
      </div>
    </>
  );
}

function LoadingCard({ message }: { message: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-7 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-blue-100" />
        <p className="text-[13px] text-slate-500">{message}</p>
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
        const response = await fetch("/api/mypage-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
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
      } catch (error) {
        console.error("mypage fetch failed:", error);
        setErrorMessage("서버와 통신 중 문제가 발생했습니다.");
        setState("error");
      }
    })();
  }, []);

  const firstItem = items[0] ?? null;

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900 xl:grid xl:grid-cols-[220px_minmax(0,1fr)]">
      <DesktopSidebar />

      {/* App Shell — Sidebar를 제외한 나머지 폭 전체를 그대로 차지한다(flex-1).
          더 이상 xl:pl-[...] 오프셋이나 mx-auto/max-w로 폭을 제한하지 않는다. */}
      <div className="min-w-0">
        <TopHeader name={name} />

        <div className="w-full px-4 py-5 pb-28 sm:px-6 xl:px-6 xl:py-6 xl:pb-8">
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">
            {state === "checking" && <LoadingCard message="로그인 정보를 확인하고 있습니다." />}
            {state === "loading" && <LoadingCard message="신청 내역을 불러오는 중입니다." />}

            {state === "signed-out" && (
              <div className="rounded-[20px] border border-amber-200 bg-white p-8 shadow-sm">
                <AlertCircle size={24} className="text-amber-700" />
                <h1 className="mt-5 text-[24px] font-extrabold text-slate-950">로그인이 필요합니다</h1>
                <p className="mt-3 max-w-xl text-[13px] leading-6 text-slate-600">
                  결과 안내 이메일 또는 문자로 받으신 결과 확인 링크로 접속하면 자동 로그인되어
                  마이페이지를 이용할 수 있습니다.
                </p>
                <Link
                  href="/consultation"
                  className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-900 px-5 text-[12px] font-bold text-white"
                >
                  <MessageSquare size={15} />
                  상담 문의하기
                </Link>
              </div>
            )}

            {state === "error" && (
              <div className="rounded-[20px] border border-red-200 bg-white p-7 shadow-sm">
                <AlertTriangle size={24} className="text-red-600" />
                <p className="mt-4 text-[13px] font-semibold text-red-700">{errorMessage}</p>
              </div>
            )}

            {state === "ready" && <Dashboard name={name} items={items} />}
          </div>

          {state === "ready" && firstItem && (
            <aside className="hidden space-y-5 xl:block">
              <NotificationCard item={firstItem} />
              <div id="admin-center">
                <PublicLinksCard title="바로가기 (한국 공공기관)" links={PUBLIC_LINKS} />
              </div>
              <PublicLinksCard title="바로가기 (베트남 공공기관)" links={VN_PUBLIC_LINKS} />
              <VietnamLifeCard item={firstItem} />
              <EmergencyHelpCard item={firstItem} />
              <div id="profile">
                <HelpCard />
              </div>
              <PermitDocuments item={firstItem} />
            </aside>
          )}
          </div>
        </div>

      </div>

      <MobileBottomNav />
    </main>
  );
}
