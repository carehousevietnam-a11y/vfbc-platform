"use client";

// src/app/mypage/page.tsx
// VFBCAI MyPage — approved dashboard mockup full UI rebuild

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Bot,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
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
  Plus,
  Shield,
  ShieldAlert,
  Sparkles,
  Star,
  User,
  UserCheck,
  WalletCards,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type CategoryKey = "check" | "verify" | "register" | "consultation" | "unclassified";
type ConfidenceLevel = "green" | "yellow" | "red";
type ConfidenceStatus = { level: ConfidenceLevel; label: string; message: string };
type ProcessStep = { label: string; done: boolean };
type StageInfo = { steps: ProcessStep[]; progressPercent: number; currentStepLabel: string };
type ActivityLogEntry = { label: string; createdAt: string };
type PublicNote = { memo: string; createdAt: string };
type LoadState = "checking" | "signed-out" | "loading" | "ready" | "error";

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
const EXPERT_TEAM_LABEL = "VFBCAI 법률자문팀";
const EXPERT_NAME = "Linda Kang · VNK 파트너";

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
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatIsoDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
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

const CONFIDENCE_STYLE: Record<ConfidenceLevel, { bg: string; border: string; text: string; icon: typeof CheckCircle2 }> = {
  green: { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", icon: CheckCircle2 },
  yellow: { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", icon: AlertTriangle },
  red: { bg: "bg-red-50", border: "border-red-100", text: "text-red-700", icon: ShieldAlert },
};

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

function BrandLogo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <img src="/vfbcai-shield-logo.png" alt="VFBCAI" width={40} height={40} />
      <div className="leading-none">
        <p className="text-[22px] font-black tracking-[-0.04em] text-[#0b2d70]">VFBCAI</p>
        <p className="mt-1 text-[9px] font-medium text-slate-400">Check. Verify. Register. Protect.</p>
      </div>
    </Link>
  );
}

function DesktopSidebar() {
  return (
    <aside className="hidden w-[176px] shrink-0 border-r border-slate-200 bg-white xl:sticky xl:top-0 xl:flex xl:h-screen xl:flex-col">
      <div className="px-4 pt-6"><BrandLogo /></div>
      <nav className="mt-7 space-y-1 px-3">
        {SIDEBAR_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex h-11 items-center justify-between rounded-xl px-3 text-[13px] font-bold transition ${
              item.active ? "bg-[#0b2f7b] text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="flex items-center gap-3"><item.icon size={17} />{item.label}</span>
            {item.badge ? <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">{item.badge}</span> : null}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4">
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-white p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm"><FolderLock size={21} className="text-blue-900" /></div>
          <p className="mt-3 text-[13px] font-extrabold text-blue-950">보안 안전 지갑</p>
          <p className="mt-1 text-[10px] leading-5 text-slate-500">모든 데이터는 안전하게 암호화되어 보호됩니다.</p>
        </div>
      </div>
    </aside>
  );
}

function TopHeader({ name }: { name: string | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="flex h-[72px] w-full items-center justify-between px-4 sm:px-6 xl:px-7">
        <div className="xl:hidden"><BrandLogo /></div>
        <div className="hidden xl:block">
          <p className="text-[18px] font-extrabold tracking-[-0.02em] text-slate-950">안녕하세요, {name ?? "고객"}님 👋</p>
          <p className="mt-1 text-[11px] text-slate-500">오늘도 성공적인 하루 보내세요!</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative flex h-10 items-center gap-2 rounded-full px-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"><Bell size={18} /><span className="hidden sm:inline">알림</span><span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">3</span></button>
          <button className="relative hidden h-10 items-center gap-2 rounded-full px-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 sm:flex"><MessageSquare size={18} />메시지<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">2</span></button>
          <div className="flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-slate-50"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100"><User size={18} /></div><span className="hidden text-[12px] font-semibold sm:inline">{name ?? "고객"}님</span><ChevronDown size={14} className="hidden text-slate-400 sm:block" /></div>
        </div>
      </div>
    </header>
  );
}

function ProgressRing({ value }: { value: number }) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div className="relative flex h-[112px] w-[112px] items-center justify-center rounded-full" style={{ background: `conic-gradient(#61d89a ${safe * 3.6}deg, rgba(255,255,255,0.18) 0deg)` }}>
      <div className="flex h-[84px] w-[84px] flex-col items-center justify-center rounded-full bg-[#15397e]">
        <p className="text-[31px] font-black leading-none text-white">{safe}%</p>
        <p className="mt-1 text-[9px] font-semibold text-blue-200">전체 진행률</p>
      </div>
    </div>
  );
}

function ApplicationSelector({ items, activeId, onChange }: { items: MyPageItem[]; activeId: string; onChange: (id: string) => void }) {
  if (items.length === 1) return <h2 className="truncate text-[28px] font-black tracking-[-0.04em] text-white sm:text-[34px]">{items[0].serviceLabel}</h2>;
  return (
    <div className="relative max-w-[430px]">
      <select value={activeId} onChange={(e) => onChange(e.target.value)} className="w-full appearance-none rounded-xl border border-white/20 bg-white/10 px-4 py-3 pr-10 text-[20px] font-extrabold text-white outline-none">
        {items.map((item) => <option key={item.id} value={item.id} className="text-slate-900">{item.serviceLabel} · {item.stage.progressPercent}%</option>)}
      </select>
      <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white" />
    </div>
  );
}

function HeroCard({ item, selector }: { item: MyPageItem; selector: React.ReactNode }) {
  const badge = CATEGORY_BADGE[item.category];
  return (
    <section id="applications" className="rounded-[20px] bg-gradient-to-br from-[#113b85] via-[#123d8e] to-[#0b2d70] px-5 py-5 text-white shadow-[0_12px_28px_rgba(15,47,123,0.20)] sm:px-6 sm:py-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-semibold text-blue-200">현재 진행 중인 서비스</span><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${badge.className}`}>{badge.label}</span><span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-[9px] font-bold text-emerald-100">진행중</span></div>
          <div className="mt-3">{selector}</div>
          <div className="mt-5 grid max-w-[420px] grid-cols-2 gap-6 text-[11px]"><div><p className="text-blue-200">신청일</p><p className="mt-1 font-semibold">{formatIsoDate(item.createdAt)}</p></div><div><p className="text-blue-200">접수번호</p><p className="mt-1 font-semibold">VF{item.id.slice(0, 8).toUpperCase()}</p></div></div>
        </div>
        <div className="flex items-center justify-between gap-5 lg:justify-end"><ProgressRing value={item.stage.progressPercent} /><div className="min-w-[140px]"><p className="text-[10px] text-blue-200">예상 완료일</p><p className="mt-1 text-[18px] font-black">{getEstimate(item.category, item.serviceType)}</p><p className="mt-3 text-[10px] text-blue-200">현재 단계</p><p className="mt-1 text-[13px] font-bold">{item.stage.currentStepLabel}</p></div></div>
      </div>
    </section>
  );
}

function StepProgress({ stage }: { stage: StageInfo }) {
  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between"><p className="text-[16px] font-extrabold">진행 단계</p><span className="text-[10px] font-semibold text-blue-700">전체 단계 보기 ›</span></div>
      <div className="mt-5 overflow-x-auto pb-1"><div className="flex min-w-[560px] items-start">
        {stage.steps.map((step, index) => {
          const current = !step.done && stage.steps.slice(0, index).every((prev) => prev.done);
          return <div key={`${step.label}-${index}`} className="flex flex-1 items-start"><div className="flex w-full flex-col items-center"><div className="flex w-full items-center">{index > 0 && <div className={`h-px flex-1 ${step.done || current ? "bg-emerald-300" : "bg-slate-200"}`} />}<div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${step.done ? "bg-emerald-100 text-emerald-700" : current ? "bg-[#12398a] text-white" : "bg-slate-100 text-slate-400"}`}>{step.done ? <Check size={18} strokeWidth={3} /> : current ? <UserCheck size={17} /> : <Circle size={16} />}</div>{index < stage.steps.length - 1 && <div className={`h-px flex-1 ${step.done ? "bg-emerald-300" : "bg-slate-200"}`} />}</div><p className={`mt-2 text-center text-[10px] font-bold ${current ? "text-blue-800" : step.done ? "text-slate-700" : "text-slate-400"}`}>{step.label}</p></div></div>;
        })}
      </div></div>
    </section>
  );
}

function PdfDownloadButton({ leadId }: { leadId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function handleDownload() {
    setLoading(true); setError(null);
    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) { setError("로그인이 필요합니다."); return; }
      const response = await fetch("/api/mypage-pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessToken, leadId }) });
      if (!response.ok) { const result = await response.json().catch(() => null); setError(result?.error ?? "PDF를 생성하지 못했습니다."); return; }
      const blob = await response.blob(); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `vfbcai-report-${leadId.slice(0, 8)}.pdf`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch (e) { console.error("pdf download failed:", e); setError("서버와 통신 중 문제가 발생했습니다."); } finally { setLoading(false); }
  }
  return <div><button type="button" onClick={handleDownload} disabled={loading} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white text-[12px] font-bold text-blue-900 transition hover:bg-blue-50 disabled:opacity-60"><Download size={15} />{loading ? "PDF 생성 중..." : "AI 리포트(PDF) 다운로드"}</button>{error && <p className="mt-2 text-[10px] text-red-600">{error}</p>}</div>;
}

function AiResultCard({ item }: { item: MyPageItem }) {
  const result = item.result ? RESULT_LABELS[item.result] ?? null : null;
  return (
    <section className="rounded-[20px] border border-emerald-100 bg-gradient-to-br from-[#f3fff8] to-white p-5 shadow-sm">
      <div className="flex items-start justify-between"><div><p className="text-[16px] font-extrabold">AI 분석 결과</p><p className="mt-1 text-[10px] text-slate-500">제출 정보 기준 1차 분석</p></div><Sparkles size={17} className="text-emerald-600" /></div>
      <div className="mt-4 grid grid-cols-[1fr_110px] items-center gap-3"><div>{typeof item.feasibilityScore === "number" && <p className="text-[45px] font-black leading-none text-emerald-700">{item.feasibilityScore}<span className="text-[21px]">%</span></p>}{result && <p className={`mt-2 text-[14px] font-extrabold ${result.className}`}>{result.label}</p>}<div className="mt-3 flex gap-1 text-amber-400">{[0,1,2,3,4].map((v) => <Star key={v} size={14} fill="currentColor" />)}</div><p className="mt-2 text-[10px] text-slate-500">AI 분석 완료</p></div><div className="relative flex h-[116px] items-center justify-center"><div className="absolute h-20 w-20 rounded-full bg-emerald-100 blur-xl" /><div className="relative flex h-[74px] w-[74px] items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm"><Bot size={38} className="text-[#153a78]" strokeWidth={1.7} /><span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white"><Check size={14} strokeWidth={3} /></span></div></div></div>
      <div className="mt-4"><PdfDownloadButton leadId={item.id} /></div>
    </section>
  );
}

function CurrentStatusCard({ item }: { item: MyPageItem }) {
  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[16px] font-extrabold">현재 진행 상황</p><p className="mt-3 text-[12px] leading-6 text-slate-600">{item.hasExpertReview ? "담당 전문가가 제출하신 자료를 검토하고 있습니다." : "현재 신청 내용을 확인하고 다음 단계를 준비하고 있습니다."}</p>
      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#f3d7c8] to-[#d9b19d]"><UserCheck size={22} className="text-blue-900" /></div><div><div className="flex flex-wrap items-center gap-2"><p className="text-[13px] font-extrabold">{EXPERT_NAME}</p><span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-bold text-blue-800">담당 전문가</span></div><p className="mt-1 text-[10px] text-slate-500">{EXPERT_TEAM_LABEL}</p></div></div>
      <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-blue-50 p-3"><p className="text-[9px] text-blue-700">다음 단계 예정</p><p className="mt-1 text-[12px] font-extrabold text-blue-950">{nextStepLabel(item.stage.steps)}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-[9px] text-slate-500">예상 처리기간</p><p className="mt-1 text-[12px] font-extrabold">{getEstimate(item.category, item.serviceType)}</p></div></div>
    </section>
  );
}

function ConfidenceBanner({ confidence }: { confidence: ConfidenceStatus }) {
  const style = CONFIDENCE_STYLE[confidence.level]; const Icon = style.icon;
  return <div className={`rounded-[16px] border ${style.border} ${style.bg} px-4 py-3`}><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-white"><Icon size={16} className={style.text} /></div><div><p className={`text-[11px] font-bold ${style.text}`}>{confidence.label}</p><p className={`mt-1 text-[10px] ${style.text}`}>{confidence.message}</p></div></div></div>;
}

function TimelineCard({ item }: { item: MyPageItem }) {
  const fallback: ActivityLogEntry[] = [
    { label: "신청 접수 완료", createdAt: item.createdAt },
    { label: "AI 진단 완료", createdAt: item.createdAt },
    { label: "전문가 배정", createdAt: item.createdAt },
    { label: item.stage.currentStepLabel || "자료 검토중", createdAt: item.createdAt },
  ];
  const recent = item.activityLog.length >= 3 ? item.activityLog.slice(-4) : fallback;
  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between"><div><p className="text-[16px] font-extrabold">진행 타임라인</p><p className="mt-1 text-[10px] text-slate-500">신청 처리 내역을 시간순으로 확인하세요.</p></div><span className="text-[10px] font-semibold text-blue-700">전체 보기 ›</span></div>
      <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_190px]">
        <div>{recent.map((entry, index) => <div key={`${entry.label}-${index}`} className="flex gap-3"><div className="w-11 shrink-0 text-right"><p className="text-[9px] font-semibold text-slate-400">{formatShortDate(entry.createdAt)}</p><p className="mt-0.5 text-[9px] text-slate-400">{formatTime(entry.createdAt)}</p></div><div className="flex flex-col items-center"><span className={`h-3 w-3 rounded-full ${index === recent.length - 1 ? "bg-blue-900" : "bg-emerald-500"}`} />{index < recent.length - 1 && <div className="min-h-[54px] w-px bg-slate-200" />}</div><div className="pb-5"><p className="text-[12px] font-extrabold">{entry.label}</p><p className="mt-1 text-[10px] text-slate-500">신청 진행상황이 업데이트되었습니다.</p></div></div>)}</div>
        <div className="rounded-2xl bg-blue-50 p-4"><p className="text-[12px] font-extrabold text-blue-950">예상 일정 안내</p><div className="mt-4 space-y-4">{["전문가 검토 완료", "정부 제출", "허가 결과 안내"].map((label) => <div key={label} className="flex gap-3"><span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500" /><div><p className="text-[10px] font-bold">{label}</p><p className="mt-1 text-[9px] text-slate-500">담당자 확인 후 안내</p></div></div>)}</div></div>
      </div>
    </section>
  );
}

function WalletSection() {
  const docs = [
    { label: "여권", expiry: "만료일 2028.06.12", kind: "passport", badge: "PDF", action: "신청에 사용" },
    { label: "비자 (DN)", expiry: "만료일 2026.11.30", kind: "visa", badge: "PDF", action: "신청에 사용" },
    { label: "거주증 (TRC)", expiry: "만료일 2026.10.15", kind: "trc", badge: "PDF", action: "갱신 준비" },
    { label: "증명사진", expiry: "최근 등록 2025.07.24", kind: "photo", badge: "JPG", action: "다시 사용" },
    { label: "건강검진서", expiry: "만료일 2025.01.15", kind: "certificate", badge: "PDF", action: "신청에 사용" },
  ] as const;
  function Preview({ kind }: { kind: (typeof docs)[number]["kind"] }) {
    if (kind === "passport") return <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0a2457] to-[#123b80]"><div className="flex h-[72px] w-[50px] flex-col items-center justify-center rounded-md bg-[#0a2d6b] shadow"><Shield size={18} className="text-amber-300" /><p className="mt-2 text-[6px] font-bold text-white">PASSPORT</p></div></div>;
    if (kind === "photo") return <div className="flex h-full items-end justify-center bg-slate-100"><div className="mb-2 flex h-[74px] w-[56px] flex-col items-center justify-end"><div className="h-8 w-8 rounded-full bg-[#f2c8a8]" /><div className="mt-1 h-9 w-12 rounded-t-xl bg-slate-800" /></div></div>;
    return <div className="h-full bg-gradient-to-br from-blue-50 to-white p-2"><div className="h-full rounded-md border border-slate-200 bg-white p-2"><div className="h-2 w-2/3 rounded bg-blue-100" /><div className="mt-2 h-1.5 rounded bg-slate-200" /><div className="mt-1.5 h-1.5 w-4/5 rounded bg-slate-200" /><div className="mt-3 h-7 rounded border border-slate-200" /></div></div>;
  }
  return (
    <section id="wallet" className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between"><div><p className="text-[16px] font-extrabold">내 서류 지갑</p><p className="mt-1 text-[10px] text-slate-500">자주 사용하는 행정서류를 안전하게 보관하고 다시 사용할 수 있습니다.</p></div><button className="text-[10px] font-semibold text-blue-700">전체 보기 ›</button></div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">{docs.map((doc) => <div key={doc.label} className="rounded-xl border border-slate-200 p-2.5"><div className="relative h-[108px] overflow-hidden rounded-lg"><Preview kind={doc.kind} /><span className="absolute bottom-2 right-2 rounded bg-orange-100 px-1.5 py-0.5 text-[7px] font-bold text-orange-700">{doc.badge}</span></div><p className="mt-2 truncate text-[11px] font-extrabold">{doc.label}</p><p className="mt-1 truncate text-[8px] text-slate-400">{doc.expiry}</p><div className="mt-2 grid grid-cols-2 gap-1"><button className="rounded-md border border-slate-200 py-1 text-[8px] font-bold">보기</button><button className="rounded-md border border-blue-200 bg-blue-50 py-1 text-[8px] font-bold text-blue-700">{doc.action}</button></div></div>)}<button className="flex min-h-[174px] flex-col items-center justify-center rounded-xl border border-dashed border-blue-300 bg-blue-50/40 text-blue-700"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-white"><Plus size={20} /></div><span className="mt-2 text-[10px] font-bold">서류 추가</span></button></div>
      <div className="mt-3 flex items-center justify-center gap-2 text-[9px] text-slate-400"><Lock size={11} />드래그하여 순서를 변경할 수 있습니다.</div>
    </section>
  );
}

function RecommendedServices() {
  const services = [
    { title: "거주증 갱신 지원", text: "만료 87일 전, 미리 준비하세요.", icon: CalendarDays, bg: "bg-blue-50", iconBg: "bg-blue-100 text-blue-700" },
    { title: "운전면허 전환 확인", text: "한국 면허 → 베트남 면허", icon: FileCheck2, bg: "bg-emerald-50", iconBg: "bg-emerald-100 text-emerald-700" },
    { title: "사업자 허가 갱신", text: "정기 점검 시기 확인하세요.", icon: Building2, bg: "bg-orange-50", iconBg: "bg-orange-100 text-orange-700" },
    { title: "가족 비자 확인", text: "가족 비자 가능성 확인", icon: UserCheck, bg: "bg-violet-50", iconBg: "bg-violet-100 text-violet-700" },
  ];
  return <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-[16px] font-extrabold">맞춤 추천 서비스</p><span className="text-[10px] font-semibold text-blue-700">전체 보기 ›</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{services.map((s) => <div key={s.title} className={`rounded-2xl p-4 ${s.bg}`}><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.iconBg}`}><s.icon size={17} /></div><p className="mt-3 text-[12px] font-extrabold">{s.title}</p><p className="mt-2 text-[9px] text-slate-500">{s.text}</p><button className="mt-3 rounded-lg bg-white px-3 py-2 text-[9px] font-bold text-blue-800 shadow-sm">자세히 보기</button></div>)}</div></section>;
}

const PUBLIC_LINKS = [
  { label: "정부24", sub: "주민등록등본, 가족관계증명서 등", href: "https://www.gov.kr/" },
  { label: "영사민원24", sub: "공증, 영사확인, 여권 등", href: "https://consul.mofa.go.kr/" },
  { label: "법무부", sub: "출입국·체류·국적 관련 정보", href: "https://www.moj.go.kr/" },
  { label: "하이코리아", sub: "외국인 전자민원, 체류 신청 등", href: "https://www.hikorea.go.kr/" },
];
const VN_PUBLIC_LINKS = [
  { label: "베트남 공공서비스 포털", href: "https://dichvucong.gov.vn/" },
  { label: "출입국관리기관", href: "https://xuatnhapcanh.gov.vn/" },
  { label: "세무기관", href: "https://www.gdt.gov.vn/" },
  { label: "기업등록기관", href: "https://dangkykinhdoanh.gov.vn/" },
  { label: "노동기관", href: "https://molisa.gov.vn/" },
];

function PublicLinksCard({ title, links }: { title: string; links: { label: string; sub?: string; href: string }[] }) {
  return <section className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-[14px] font-extrabold">{title}</p><span className="text-[9px] font-semibold text-blue-700">전체 보기 ›</span></div><div className="mt-2 divide-y divide-slate-100">{links.map((link) => <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="flex items-center justify-between py-3"><div className="flex min-w-0 items-center gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50"><Landmark size={15} className="text-blue-900" /></div><div className="min-w-0"><p className="truncate text-[10px] font-bold">{link.label}</p>{link.sub && <p className="mt-1 truncate text-[8px] text-slate-400">{link.sub}</p>}</div></div><ExternalLink size={12} className="text-slate-300" /></a>)}</div></section>;
}

function NotificationCard({ item }: { item: MyPageItem }) {
  const entries = [
    { icon: MessageCircle, tone: "bg-red-50 text-red-600", title: "전문가 메시지", sub: "추가 서류가 필요합니다." },
    { icon: AlertTriangle, tone: "bg-amber-50 text-amber-600", title: "거주증 만료 알림", sub: "만료까지 87일 남았습니다." },
    { icon: FileCheck2, tone: "bg-emerald-50 text-emerald-600", title: "AI 리포트 완료", sub: "AI 리포트가 준비되었습니다." },
    { icon: Building2, tone: "bg-blue-50 text-blue-600", title: "정부 제출 예정", sub: nextStepLabel(item.stage.steps) },
  ];
  return <section id="notifications" className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-[14px] font-extrabold">알림 센터</p><span className="text-[9px] font-semibold text-blue-700">전체 보기 ›</span></div><div className="mt-2 space-y-1">{entries.map((e) => <div key={e.title} className="flex gap-3 rounded-xl p-2"><div className={`flex h-8 w-8 items-center justify-center rounded-full ${e.tone}`}><e.icon size={14} /></div><div><p className="text-[10px] font-extrabold">{e.title}</p><p className="mt-1 text-[9px] text-slate-500">{e.sub}</p></div></div>)}</div></section>;
}

function ExpertCard({ item }: { item: MyPageItem }) {
  return <section className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[14px] font-extrabold">담당 전문가</p><div className="mt-4 flex items-center gap-3"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100"><UserCheck size={25} className="text-blue-900" /></div><div><p className="text-[13px] font-extrabold">Linda Kang</p><p className="mt-1 text-[10px] text-slate-500">행정허가 전문가</p></div></div><div className="mt-4 grid grid-cols-2 divide-x divide-slate-200"><div className="text-center"><p className="text-[9px] text-slate-400">진행 건수</p><p className="mt-1 text-[13px] font-extrabold">2,134건</p></div><div className="text-center"><p className="text-[9px] text-slate-400">평균 응답</p><p className="mt-1 text-[13px] font-extrabold">2시간 이내</p></div></div><Link href={`/mypage/chat?leadId=${item.id}&label=${encodeURIComponent(item.serviceLabel)}`} className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-900 text-[11px] font-bold text-white"><MessageSquare size={14} />메시지 보내기</Link></section>;
}

function HelpCard() {
  const items = [{ label: "채팅 상담", icon: MessageSquare }, { label: "전화 상담", icon: HelpCircle }, { label: "1:1 문의", icon: MessageCircle }];
  return <section id="profile" className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[14px] font-extrabold">도움이 필요하신가요?</p><div className="mt-4 grid grid-cols-3 gap-2">{items.map((i) => <Link key={i.label} href="/consultation" className="flex min-h-[82px] flex-col items-center justify-center rounded-xl border border-slate-200"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-700"><i.icon size={16} /></div><span className="mt-2 text-[9px] font-bold">{i.label}</span></Link>)}</div></section>;
}

function PublicNotes({ notes }: { notes: PublicNote[] }) {
  if (!notes.length) return null;
  return <section className="rounded-[20px] border border-blue-100 bg-blue-50/60 p-4"><div className="flex items-center gap-2"><MessageCircle size={16} className="text-blue-900" /><p className="text-[13px] font-extrabold">담당자 안내</p></div><div className="mt-3 space-y-2">{notes.map((note, i) => <div key={`${note.createdAt}-${i}`} className="rounded-xl bg-white p-3"><p className="whitespace-pre-wrap text-[11px] leading-5 text-slate-700">{note.memo}</p><p className="mt-2 text-[9px] text-slate-400">{formatDate(note.createdAt)}</p></div>)}</div></section>;
}

function PermitDocuments({ item }: { item: MyPageItem }) {
  if (!item.governmentSubmittedAt && !item.permitCompletedAt && !item.fileUrl) return null;
  return <section className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[14px] font-extrabold">제출 및 결과 문서</p><div className="mt-3 space-y-2">{item.governmentSubmittedAt && <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><div><p className="text-[9px] text-slate-500">정부 제출</p><p className="mt-1 text-[11px] font-extrabold">{formatIsoDate(item.governmentSubmittedAt)}</p></div><CheckCircle2 size={17} className="text-emerald-600" /></div>}{item.permitFileUrl && <a href={item.permitFileUrl} target="_blank" rel="noreferrer" className="flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-700 text-[10px] font-bold text-white"><Download size={14} />{item.permitFileName ?? "허가증 다운로드"}</a>}{item.fileUrl && <a href={item.fileUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-slate-200 p-3"><span className="flex items-center gap-2 text-[10px] font-bold"><FileText size={15} />{item.fileName ?? "첨부서류 확인"}</span><Download size={14} /></a>}</div></section>;
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
  return <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur xl:hidden"><div className="grid grid-cols-6 items-end">{items.map((item) => <Link key={item.label} href={item.href} className={`relative flex flex-col items-center gap-1 py-1.5 text-[9px] font-semibold ${item.active ? "text-blue-900" : "text-slate-500"}`}><div className={`relative flex items-center justify-center ${item.primary ? "-mt-7 h-14 w-14 rounded-full bg-blue-900 text-white shadow-lg" : "h-7 w-7"}`}><item.icon size={item.primary ? 25 : 19} />{item.badge && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white">3</span>}</div><span>{item.label}</span></Link>)}</div></nav>;
}

function Dashboard({ name, items }: { name: string | null; items: MyPageItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  useEffect(() => { if (!items.some((item) => item.id === activeId)) setActiveId(items[0]?.id ?? ""); }, [activeId, items]);
  const activeItem = useMemo(() => items.find((item) => item.id === activeId) ?? items[0] ?? null, [activeId, items]);
  if (!activeItem) return <div className="rounded-[20px] border border-slate-200 bg-white p-8 text-center"><FileText size={32} className="mx-auto text-slate-300" /><p className="mt-4 text-[17px] font-extrabold">아직 접수하신 신청 내역이 없습니다.</p><Link href="/" className="mt-5 inline-flex h-10 items-center rounded-xl bg-blue-900 px-5 text-[11px] font-bold text-white">서비스 확인하기</Link></div>;
  return <>
    <div className="mb-4 xl:hidden"><p className="text-[18px] font-extrabold">안녕하세요, {name ?? "고객"}님 👋</p><p className="mt-1 text-[11px] text-slate-500">오늘도 성공적인 하루 보내세요!</p></div>
    <HeroCard item={activeItem} selector={<ApplicationSelector items={items} activeId={activeItem.id} onChange={setActiveId} />} />
    <div className="mt-4"><StepProgress stage={activeItem.stage} /></div>
    <div className="mt-4 grid gap-4 lg:grid-cols-2"><AiResultCard item={activeItem} /><CurrentStatusCard item={activeItem} /></div>
    <div className="mt-4"><ConfidenceBanner confidence={activeItem.confidence} /></div>
    <div className="mt-4"><TimelineCard item={activeItem} /></div>
    <div className="mt-4"><PublicNotes notes={activeItem.publicNotes} /></div>
    <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_250px]"><WalletSection /><ExpertCard item={activeItem} /></div>
    <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_250px]"><RecommendedServices /><HelpCard /></div>
    <div className="mt-4 grid gap-4 xl:hidden"><PublicLinksCard title="바로가기 (한국 공공기관)" links={PUBLIC_LINKS} /><PublicLinksCard title="바로가기 (베트남 공공기관)" links={VN_PUBLIC_LINKS} /><NotificationCard item={activeItem} /><PermitDocuments item={activeItem} /></div>
  </>;
}

function LoadingCard({ message }: { message: string }) {
  return <div className="rounded-[20px] border border-slate-200 bg-white p-6"><div className="flex items-center gap-3"><div className="h-10 w-10 animate-pulse rounded-xl bg-blue-100" /><p className="text-[12px] text-slate-500">{message}</p></div></div>;
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
      if (!accessToken) { setState("signed-out"); return; }
      setState("loading");
      try {
        const response = await fetch("/api/mypage-data", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessToken }) });
        const data = await response.json();
        if (!response.ok) { if (response.status === 401) { setState("signed-out"); return; } setErrorMessage(data?.error ?? "정보를 불러오지 못했습니다."); setState("error"); return; }
        setName(data.name ?? null); setItems(data.items ?? []); setState("ready");
      } catch (error) { console.error("mypage fetch failed:", error); setErrorMessage("서버와 통신 중 문제가 발생했습니다."); setState("error"); }
    })();
  }, []);

  const firstItem = items[0] ?? null;

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900 xl:flex">
      <DesktopSidebar />
      <div className="min-w-0 flex-1">
        <TopHeader name={name} />
        <div className="w-full px-3 py-4 pb-28 sm:px-5 xl:px-5 xl:pb-6">
          <div className="mx-auto grid w-full max-w-[1240px] items-start gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
            <div className="min-w-0">
              {state === "checking" && <LoadingCard message="로그인 정보를 확인하고 있습니다." />}
              {state === "loading" && <LoadingCard message="신청 내역을 불러오는 중입니다." />}
              {state === "signed-out" && <div className="rounded-[20px] border border-amber-200 bg-white p-7"><AlertCircle size={24} className="text-amber-700" /><h1 className="mt-4 text-[22px] font-extrabold">로그인이 필요합니다</h1><p className="mt-3 text-[12px] leading-6 text-slate-600">결과 안내 이메일 또는 문자로 받으신 결과 확인 링크로 접속하면 자동 로그인되어 마이페이지를 이용할 수 있습니다.</p><Link href="/consultation" className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-900 px-5 text-[11px] font-bold text-white"><MessageSquare size={14} />상담 문의하기</Link></div>}
              {state === "error" && <div className="rounded-[20px] border border-red-200 bg-white p-6"><AlertTriangle size={24} className="text-red-600" /><p className="mt-4 text-[12px] font-semibold text-red-700">{errorMessage}</p></div>}
              {state === "ready" && <Dashboard name={name} items={items} />}
            </div>
            {state === "ready" && firstItem && <aside className="hidden space-y-4 xl:block"><NotificationCard item={firstItem} /><div className="rounded-[20px] border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm"><p className="text-[13px] font-extrabold text-blue-950">VFBCAI 모바일 앱</p><p className="mt-2 text-[10px] text-slate-500">더 편리하게 이용하세요!</p><button className="mt-3 rounded-xl bg-blue-900 px-4 py-2 text-[10px] font-bold text-white">앱 다운로드 →</button></div><div id="admin-center"><PublicLinksCard title="바로가기 (한국 공공기관)" links={PUBLIC_LINKS} /></div><PublicLinksCard title="바로가기 (베트남 공공기관)" links={VN_PUBLIC_LINKS} /><PermitDocuments item={firstItem} /></aside>}
          </div>
        </div>
      </div>
      <MobileBottomNav />
    </main>
  );
}
