"use client";

// src/app/mypage/page.tsx
//
// VFBCAI 고객용 My Page — 승인 목업 기준 전체 UI 재구성본
// 기존 인증·API·PDF·진행단계·CRM 데이터 구조는 그대로 유지하고,
// 화면 구조와 반응형 UI만 재설계한다.

import { useEffect, useMemo, useState } from "react";
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
  Lock,
  MessageCircle,
  MessageSquare,
  Phone,
  Plus,
  Shield,
  ShieldAlert,
  Sparkles,
  Star,
  Sun,
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

function WalletSection() {
  const docs = [
    {
      label: "여권",
      expiry: "만료일 2028.06.12",
      kind: "passport",
      imageSrc: "/mypage-documents/passport-sample.webp",
      badge: "PDF",
      action: "신청에 사용",
      actionTone: "blue",
    },
    {
      label: "비자 (DN)",
      expiry: "만료일 2026.11.30",
      kind: "visa",
      imageSrc: "/mypage-documents/visa-sample.webp",
      badge: "PDF",
      action: "신청에 사용",
      actionTone: "blue",
    },
    {
      label: "거주증 (TRC)",
      expiry: "만료일 2026.10.15",
      kind: "trc",
      imageSrc: "/mypage-documents/trc-sample.webp",
      badge: "PDF",
      action: "갱신 준비",
      actionTone: "green",
    },
    {
      label: "증명사진",
      expiry: "최근 등록 2025.07.24",
      kind: "photo",
      imageSrc: "/mypage-documents/id-photo-sample.webp",
      badge: "JPG",
      action: "다시 사용",
      actionTone: "blue",
    },
    {
      label: "건강검진서",
      expiry: "만료일 2025.01.15",
      kind: "certificate",
      imageSrc: "/mypage-documents/health-certificate-sample.webp",
      badge: "PDF",
      action: "신청에 사용",
      actionTone: "blue",
    },
  ] as const;



  return (
    <section id="wallet" className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[18px] font-extrabold tracking-[-0.02em] text-slate-950">내 서류 지갑</p>
          <p className="mt-1 text-[11px] text-slate-500">
            자주 사용하는 행정서류를 안전하게 보관하고 다시 사용할 수 있습니다.
          </p>
        </div>
        <button type="button" className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-blue-700">
          전체 보기 <ChevronRight size={13} />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-6">
        {docs.map((doc) => (
          <div
            key={doc.label}
            className="group min-w-0 rounded-[14px] border border-slate-200 bg-white p-2.5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <p className="truncate text-[11px] font-extrabold text-slate-900">{doc.label}</p>
            <p className="mt-0.5 truncate text-[8px] text-slate-400">{doc.expiry}</p>

            <div className="relative mt-2 h-[150px] overflow-hidden rounded-[8px] border border-slate-200 bg-white p-1.5 shadow-inner">
              <img
                src={doc.imageSrc}
                alt={`${doc.label} 샘플 미리보기`}
                className="h-full w-full object-contain"
                loading="lazy"
                draggable={false}
              />
              <span
                className={`absolute bottom-1.5 right-1.5 rounded-md px-1.5 py-0.5 text-[8px] font-extrabold shadow-sm ${
                  doc.badge === "JPG"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {doc.badge}
              </span>
            </div>

            <div className="mt-2 grid grid-cols-[38px_minmax(0,1fr)] gap-1">
              <button
                type="button"
                className="rounded-[7px] border border-slate-200 bg-white py-1.5 text-[8px] font-bold text-slate-700 hover:bg-slate-50"
              >
                보기
              </button>
              <button
                type="button"
                className={`truncate rounded-[7px] border py-1.5 px-1 text-[8px] font-bold ${
                  doc.actionTone === "green"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                {doc.action}
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="flex min-h-[180px] min-w-0 flex-col items-center justify-center rounded-[14px] border border-dashed border-blue-300 bg-blue-50/30 px-2 text-blue-700 transition hover:bg-blue-50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-300 bg-white shadow-sm">
            <Plus size={22} />
          </div>
          <span className="mt-3 text-[10px] font-bold">서류 추가</span>
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400">
        <Lock size={12} />
        드래그하여 서류 순서를 변경할 수 있습니다.
      </div>
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
    label: "노동기관",
    href: "https://molisa.gov.vn/",
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

const VIETNAM_LIFE_ITEMS = [
  { label: "오늘 날씨", desc: "오늘의 기상정보", icon: Sun },
  { label: "환율", desc: "실시간 환율", icon: DollarSign },
  { label: "은행 휴무", desc: "은행 운영정보", icon: Building2 },
  { label: "공휴일", desc: "정부 휴무일", icon: CalendarDays },
  { label: "행정 공지", desc: "출입국·행정 안내", icon: Bell },
  { label: "내 일정", desc: "개인 일정 확인", icon: CalendarCheck },
];

function VietnamLifeCard() {
  return (
    <section id="vietnam-life" className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[16px] font-extrabold text-slate-950">🇻🇳 베트남 생활 정보</p>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
          LIVE
        </span>
      </div>
      <p className="mt-1 text-[11px] text-slate-500">베트남 생활에 필요한 정보를 빠르게 확인하세요.</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {VIETNAM_LIFE_ITEMS.map((item) => (
          <a
            key={item.label}
            href="#"
            onClick={(event) => event.preventDefault()}
            className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-700">
                <item.icon size={16} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-extrabold text-slate-900">{item.label}</p>
                <p className="mt-0.5 truncate text-[9px] text-slate-400">{item.desc}</p>
              </div>
            </div>
            <ChevronRight size={14} className="shrink-0 text-slate-300" />
          </a>
        ))}
      </div>
    </section>
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
        <WalletSection />
      </div>

      <div className="mt-5">
        <RecommendedServices />
      </div>

      <div className="mt-5 grid gap-5 xl:hidden">
        <NotificationCard item={activeItem} />
        <PublicLinksCard title="바로가기 (한국 공공기관)" links={PUBLIC_LINKS} />
        <PublicLinksCard title="바로가기 (베트남 공공기관)" links={VN_PUBLIC_LINKS} />
        <VietnamLifeCard />
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
              <VietnamLifeCard />
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
