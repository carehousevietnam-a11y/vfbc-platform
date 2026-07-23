"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Menu,
  Shield,
  Info,
  ShieldCheck,
  Lightbulb,
  Globe,
  FileText,
  Users,
  Building2,
  Lock,
  Clock,
  MapPin,
  Mail,
  Phone,
  Gift,
  MessageCircle,
  TrendingUp,
  Star,
  ChevronDown,
} from "lucide-react";
import { MESSENGERS_KO } from "@/lib/messenger";
import { supabase } from "@/lib/supabase";
import { saveLeadContact } from "@/lib/leadContact";
import { NoticeCard, PrimaryButton, InfoBox } from "@/components/ui";
import {
  getCheckDiagnosis,
  computeTrcResultTone,
  type DiagnosisResult,
  type TrcNationality,
  type TrcVisa,
  type TrcRole,
  type TrcCompany,
} from "@/lib/checkDiagnosis";

// 거주증(TRC)은 출입국 전자비자 포털(evisa) 소관이 아니라
// 공안부 공공서비스포털을 통해 접수됩니다. (2026-07 확인 완료)
const TRC_OFFICIAL_URL =
  "https://dichvucong.bocongan.gov.vn/bocongan/bothutuc/tthc?matt=26285";

type Nationality = TrcNationality;
type Visa = TrcVisa;
type Role = TrcRole;
type Company = TrcCompany;
type Result = "possible" | "conditional" | "impossible" | null;

const CONSENT_SUMMARY =
  "입력하신 정보로 계정이 자동 생성되며, 개인정보 수집·이용에 동의합니다.";

function ConsentDetails({
  open,
  onToggle,
  highlight,
}: {
  open: boolean;
  onToggle: () => void;
  highlight?: boolean;
}) {
  return (
    <div
      className={`mt-1 rounded-lg p-3 text-[11px] leading-relaxed transition-colors ${
        highlight ? "bg-red-50 ring-1 ring-red-200" : "bg-gray-50"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left font-medium text-gray-700"
      >
        {open ? "▾" : "▸"} 자세히 보기 (베트남 법령 원문 · 한국어 번역)
      </button>

      {highlight && (
        <p className="mt-2 font-semibold text-red-700">
          베트남 개인정보보호법에 따라 동의하지 않으면 계정 생성 및 서비스
          이용(결과 확인, 상담 등)을 진행할 수 없습니다.
        </p>
      )}

      {open && (
        <div className="mt-2 space-y-3 text-gray-600">
          <div>
            <p className="font-semibold text-gray-700">🇻🇳 Việt Nam (nguyên văn)</p>
            <p>
              Theo Luật Bảo vệ dữ liệu cá nhân (Luật số 91/2025/QH15, có hiệu
              lực từ ngày 01/01/2026) và Nghị định số 356/2025/NĐ-CP hướng dẫn
              thi hành, chúng tôi thu thập và xử lý dữ liệu cá nhân của bạn
              sau khi có sự đồng ý rõ ràng, bao gồm: họ tên, số điện thoại,
              địa chỉ, email (nếu có), ID Kakao/Zalo (nếu có), nhằm mục đích
              tư vấn, hướng dẫn đăng ký và tạo tài khoản dịch vụ tự động. Dữ
              liệu được lưu trữ đến khi bạn hủy tài khoản hoặc đạt được mục
              đích xử lý. Bạn có quyền từ chối đồng ý; tuy nhiên, việc từ
              chối có thể khiến bạn không thể sử dụng một số dịch vụ (xem kết
              quả chẩn đoán, tư vấn, v.v.).
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">한국어 번역 (이용자 편의 제공용)</p>
            <p>
              본 서비스는 베트남에서 운영되며, 이용자의 개인정보는 베트남
              개인정보보호법(91/2025/QH15호, 2026년 1월 1일 시행) 및 시행령
              (356/2025/NĐ-CP호)에 따라 처리됩니다. 원문과 번역본이 다를
              경우 베트남어 원문이 우선합니다.
            </p>
            <ul className="mt-1 list-disc pl-4 space-y-0.5">
              <li>수집 항목: 이름, 전화번호, 주소, (선택) 이메일, (선택) 카카오톡/잘로 ID</li>
              <li>수집 목적: 상담·안내 및 서비스 이용을 위한 계정 자동 생성</li>
              <li>보유 기간: 회원 탈퇴 시 또는 목적 달성 시까지</li>
              <li>
                동의를 거부하실 수 있으나, 거부 시 계정 생성이 불가하여 결과
                확인·상담 등 서비스 이용이 제한될 수 있습니다.
              </li>
            </ul>
          </div>
          <Link
            href="/privacy"
            target="_blank"
            className="inline-block font-semibold text-blue-900 hover:underline"
          >
            개인정보처리방침 전문 보기 →
          </Link>
        </div>
      )}
    </div>
  );
}

// AI 진단 게이지 — 원형 진행률로 feasibilityScore를 표시
function ScoreGauge({
  score,
  tone,
}: {
  score: number;
  tone: "possible" | "conditional" | "impossible";
}) {
  const r = 28;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);
  const color =
    tone === "possible" ? "#059669" : tone === "conditional" ? "#d97706" : "#dc2626";

  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#f3f4f6" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 32 32)"
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center text-[15px] font-bold"
        style={{ color }}
      >
        {score}%
      </div>
    </div>
  );
}

// AI 진단 리포트 카드 — 가입 직후(2번째 화면)에만 노출. customerView만 사용, expertBrief는 여기서 절대 렌더링 안 함.
// STEP10-6: AI 판단 근거 — 새 AI 호출 없이 기존 진단 결과(점수/체크리스트/상태)만으로
// "왜 이렇게 판단했는지"를 2~3개의 짧은 문장으로 요약. DB/API/CRM 변경 없음.
function buildAiReasonBullets(
  feasibilityScore: number,
  resultTone: "possible" | "conditional" | "impossible",
  checklist: { label: string; passed: boolean }[],
  estimatedDays: { min: number; max: number } | null
): string[] {
  const toneLabel =
    resultTone === "possible" ? "가능" : resultTone === "conditional" ? "조건부 가능" : "어려움";
  const bullets: string[] = [
    `종합 판단 점수 ${feasibilityScore}%를 기준으로 '${toneLabel}' 단계로 분류했습니다.`,
  ];

  const failed = checklist.filter((c) => !c.passed);
  if (failed.length > 0) {
    const names = failed.slice(0, 2).map((c) => c.label).join(", ");
    bullets.push(
      failed.length > 2
        ? `${names} 등 ${failed.length}개 항목이 아직 충족되지 않아 점수에 반영됐습니다.`
        : `${names} 항목이 아직 충족되지 않아 점수에 반영됐습니다.`
    );
  } else {
    bullets.push("입력하신 체크리스트 항목을 모두 충족하여 감점 요인이 없었습니다.");
  }

  if (estimatedDays) {
    bullets.push(
      `예상 처리기간 ${estimatedDays.min}~${estimatedDays.max}일은 유사 사례의 통상적인 소요 기간을 기준으로 산정했습니다.`
    );
  }

  return bullets;
}

function DiagnosisReportCard({ diagnosis }: { diagnosis: DiagnosisResult }) {
  const { feasibilityScore, resultTone, estimatedDays, checklist, note } =
    diagnosis.customerView;
  const aiReasonBullets = buildAiReasonBullets(
    feasibilityScore,
    resultTone,
    checklist,
    estimatedDays
  );
  const passedItems = checklist.filter((c) => c.passed).map((c) => c.label);
  const metRequirementsText =
    passedItems.length > 0
      ? `${passedItems.join(", ")} 항목을 충족하셨습니다.`
      : "현재 입력하신 정보 기준으로 충족된 항목이 없습니다.";
  const processingTimeText = estimatedDays
    ? `예상 처리기간은 ${estimatedDays.min}~${estimatedDays.max}일이며, 준비 서류와 관할 기관에 따라 달라질 수 있습니다.`
    : null;
  const aiReasonSections = [
    { title: "✅ 기본 요건 충족", description: metRequirementsText },
    { title: "⚠ 확인이 필요한 사항", description: aiReasonBullets[1] },
    ...(processingTimeText
      ? [{ title: "🕒 처리기간 판단", description: processingTimeText }]
      : []),
  ];
  const toneLabel =
    resultTone === "possible" ? "가능" : resultTone === "conditional" ? "조건부 가능" : "어려움";
  const issueCount = checklist.filter((c) => !c.passed).length;
  const boxBg = resultTone === "possible" ? "bg-emerald-50" : "bg-amber-50";
  const boxText = resultTone === "possible" ? "text-emerald-800" : "text-amber-800";
  const badgeBg = resultTone === "possible" ? "bg-emerald-100" : "bg-amber-100";
  const badgeText = resultTone === "possible" ? "text-emerald-700" : "text-amber-700";

  return (
    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
      <div className="flex items-center gap-3.5">
        <ScoreGauge score={feasibilityScore} tone={resultTone} />
        <div>
          <p className="text-sm font-bold text-gray-900">{toneLabel}</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {issueCount > 0 ? `발견된 문제 ${issueCount}건` : "확인된 문제 없음"}
          </p>
        </div>
      </div>
      <p className="mt-1.5 text-[11px] text-gray-400">
        입력하신 정보 기준 AI 분석 결과입니다.
      </p>

      <div className="mt-4 space-y-2">
        {checklist.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2 text-xs ${
              item.passed ? "text-gray-700" : boxText
            }`}
          >
            <span
              className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                item.passed ? "bg-emerald-100 text-emerald-700" : `${badgeBg} ${badgeText}`
              }`}
            >
              {item.passed ? "✓" : "!"}
            </span>
            {item.label}
          </div>
        ))}
      </div>

      {/* STEP10-4: 추천 분야 — AI가 분석한 분야를 고객에게 표시 */}
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-800">
        추천 분야: 거주증
      </div>

      {estimatedDays && (
        <div className="mt-4 rounded-xl bg-white px-4 py-2.5 text-xs text-gray-600">
          예상 처리기간{" "}
          <span className="font-bold text-gray-900">
            {estimatedDays.min}~{estimatedDays.max}일
          </span>
          <p className="mt-1 text-[11px] text-gray-400">
            준비 서류와 관할 기관에 따라 달라질 수 있습니다.
          </p>
        </div>
      )}

      {/* STEP10-8: AI 분석 근거 카드 UI 개선 — 파란 원형 AI 배지, 실제로 보이는 구분선(border-t),
          체크리스트 기반 실제 요약 문구, 분석 기준 푸터. buildAiReasonBullets()는 "확인이 필요한 사항"에만
          그대로 사용하며 함수 자체는 변경하지 않음. */}
      <div className="mt-3 rounded-2xl bg-white border-2 border-blue-100 shadow-sm px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
            AI
          </span>
          <p className="text-sm font-bold text-gray-900">AI 분석 근거</p>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500">
          공개 법령·행정 기준·체크리스트를 종합하여 분석했습니다.
        </p>
        <div className="mt-4">
          {aiReasonSections.map((section, idx) => (
            <div
              key={section.title}
              className={idx === 0 ? "pb-4" : "border-t border-gray-200 py-4"}
            >
              <p className="text-xs font-bold text-gray-900">{section.title}</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-gray-600">
                {section.description}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-1 border-t border-gray-100 pt-3 text-[10px] text-gray-400">
          분석 기준: 공개 법령 · 행정 기준 · 체크리스트 · 유사 사례
        </p>
      </div>

      <div className={`mt-3 rounded-xl ${boxBg} px-4 py-3 text-xs ${boxText}`}>
        <p className="font-bold">💡 안내사항</p>
        <p className="mt-1">{note}</p>
      </div>
    </div>
  );
}

// STEP10-9: 진행 방법 선택 UI — 버튼 2개를 2개의 선택 카드로 개편.
// 링크(href/onClick)·버튼 action은 기존 그대로 유지, UI(카드 구조)만 변경.
function ProcessMethodCards({
  onSelf,
  onExpert,
}: {
  onSelf: () => void;
  onExpert: () => void;
}) {
  return (
    <div>
      <p className="mt-5 text-sm font-bold text-gray-900">
        어떤 방법으로 진행하시겠습니까?
      </p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 sm:items-stretch">
        <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-sm font-bold text-gray-900">직접 신청</p>
          <span className="mt-1.5 w-fit rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600">
            ✓ 직접 신청 가능
          </span>
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            정부 공식 사이트에서 바로 신청할 수 있습니다.
          </p>
          <a
            href={TRC_OFFICIAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onSelf}
            className="mt-4 flex h-10 items-center justify-center gap-1.5 rounded-full border border-blue-900 text-[13px] font-semibold text-blue-900 hover:bg-blue-50 transition-colors"
          >
            정부 사이트로 이동 <ExternalLink size={13} />
          </a>
          <p className="mt-2 text-center text-[11px] text-slate-500">
            ↗ 정부 공식 사이트로 이동합니다.
          </p>
        </div>

        <div className="flex h-full flex-col rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-sm font-bold text-gray-900">전문가와 함께</p>
          <span className="mt-1.5 w-fit rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-800">
            ✓ 최종 확인 필요
          </span>
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            전문가가 서류와 절차를 함께 확인합니다.
          </p>
          <button
            onClick={onExpert}
            className="mt-4 h-10 w-full rounded-full bg-blue-900 text-[13px] font-semibold text-white hover:bg-blue-950 transition-colors"
          >
            진행 요청하기
          </button>
          <p aria-hidden="true" className="invisible mt-2 text-center text-[11px] text-slate-500">
            ↗ 정부 공식 사이트로 이동합니다.
          </p>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-gray-400 text-center">
        어떤 방법을 선택하시더라도 AI 분석 결과는 그대로 활용됩니다.
      </p>
    </div>
  );
}

// STEP12-4: STEP1(이전 신청 이력 질문) 목업 디자인을 STEP2~5에도 동일하게 적용하기 위한
// 공통 UI 셸. 순수 표시 컴포넌트이며 상태·핸들러는 전달받은 props(onClick/onPrev/onNext)만
// 그대로 실행한다. 진단 계산 로직·DB·API는 전혀 참조하지 않는다.
function TrcStepHeader({
  step,
  question,
  note,
}: {
  step: number;
  question: string;
  note: string;
}) {
  return (
    <>
      <p className="text-xs font-semibold text-[#1D4EDB]">거주증(TRC) 가능성 진단</p>
      <p className="mt-2 text-sm font-semibold text-[#1D4EDB]">STEP {step} / 5</p>
      <h1 className="mt-2 text-2xl font-bold leading-snug text-gray-900 sm:text-[28px] break-keep">
        {question}
      </h1>
      <p className="mt-2 text-sm text-gray-500 break-keep">{note}</p>

      <p className="mt-6 text-sm text-gray-600">
        아래 항목 중 해당되는 것을 선택해주세요.
      </p>
    </>
  );
}

function TrcOptionCard({
  icon,
  iconBg,
  title,
  description,
  meaning,
  meaningTone,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  meaning: string;
  meaningTone: "positive" | "caution";
  selected: boolean;
  onClick: () => void;
}) {
  const meaningBg = meaningTone === "positive" ? "bg-emerald-50" : "bg-amber-50";
  const meaningText = meaningTone === "positive" ? "text-emerald-700" : "text-amber-800";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left transition-all duration-200 ${
        selected
          ? "border-[#1D4EDB] bg-white shadow-sm"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-start justify-between">
        <span
          className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
            selected ? "border-[#1D4EDB]" : "border-gray-300"
          }`}
        >
          {selected && <span className="h-2 w-2 rounded-full bg-[#1D4EDB]" />}
        </span>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-4 text-base font-bold text-gray-900 break-keep">{title}</p>
      <p className="mt-1 text-sm text-gray-500 break-keep">{description}</p>
      <span
        className={`mt-3 inline-flex items-center gap-1 rounded-full ${meaningBg} px-2.5 py-1 text-[11px] font-medium ${meaningText}`}
      >
        {meaningTone === "positive" ? (
          <CheckCircle2 size={12} />
        ) : (
          <AlertTriangle size={12} />
        )}
        {meaning}
      </span>
    </button>
  );
}

function TrcStepNav({
  onPrev,
  onNext,
  nextDisabled,
}: {
  onPrev: () => void;
  onNext: () => void;
  nextDisabled: boolean;
}) {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={onPrev}
        className="order-2 flex h-12 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 sm:order-1 sm:flex-1"
      >
        <ArrowLeft size={16} /> 이전 단계로
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="order-1 flex h-12 items-center justify-center gap-1.5 rounded-xl bg-[#1D4EDB] text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40 sm:order-2 sm:flex-1"
      >
        다음 단계로
        <ArrowLeft size={16} className="rotate-180" />
      </button>
    </div>
  );
}



function PremiumLeadCapture({
  tone,
  diagnosis,
  messengers,
  submitting,
  leadError,
  consentOpen,
  consentHighlight,
  onConsentToggle,
  onConsentChecked,
  onSubmit,
  onReset,
}: {
  tone: "possible" | "conditional";
  diagnosis: DiagnosisResult | null;
  messengers: typeof MESSENGERS_KO;
  submitting: boolean;
  leadError: string | null;
  consentOpen: boolean;
  consentHighlight: boolean;
  onConsentToggle: () => void;
  onConsentChecked: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
}) {
  const isPossible = tone === "possible";

  return (
    <div>
      {/* 2. 페이지 상단 제목 영역 — 원본 문구(직접확인하기 · 베트남 행정전문 AI) 복원, 결과에 따라 바뀌지 않는 중립 문구 */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          직접확인하기 · 베트남 행정전문 AI
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
          거주증 (TRC) 가능성 진단
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          국적·비자·직책·회사 형태에 따라 거주증 발급 가능 여부가 달라집니다.
        </p>
      </div>

      {/* 3. WP 단순형 단일 카드 — 결과 + 입력폼 */}
      <div
        className={`mt-8 rounded-3xl border bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${
          isPossible ? "border-gray-100" : "border-amber-100"
        }`}
      >
        {isPossible ? (
          <CheckCircle2 className="text-emerald-600" size={28} />
        ) : (
          <AlertTriangle className="text-amber-600" size={28} />
        )}

        <p className="mt-4 text-lg font-bold text-gray-900">
          {isPossible ? "거주증 발급이 가능합니다" : "보완이 필요할 수 있습니다"}
        </p>

        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          {isPossible
            ? "현재 입력하신 국적·비자유형·직책·회사형태 기준으로 거주증(TRC) 신청 요건을 충족합니다."
            : "현재 조건만으로는 거주증(TRC) 발급이 자동으로 보장되지 않습니다. 추가 서류로 요건을 충족시킬 수 있는 경우가 많습니다."}
        </p>

        <p className="mt-2 text-xs leading-relaxed text-gray-400">
          * 위 결과는 입력하신 조건을 기준으로 한 1차 자가진단입니다. 정확한
          발급 가능 여부는 서류 검토 후 전문가 상담을 통해 확정됩니다.
        </p>

        {/* 4. 연한 초록(가능)/노랑(조건부) 안내 박스 */}
        <div className="mt-4">
          <NoticeCard tone={isPossible ? "success" : "warning"}>
            이름·연락처·주소만 남기시면 AI가 서류를 상세 분석한 리포트를 바로
            보여드립니다.
          </NoticeCard>
        </div>

        {/* 5. 입력폼 — 기존 필드·name·검증·submit 로직 그대로 유지, 스타일만 WP 기준으로 단순화 */}
        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <input
            type="text"
            name="name"
            required
            placeholder="이름"
            className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
          />
          <input
            type="tel"
            name="phone"
            required
            placeholder="전화번호"
            className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
          />
          <input
            type="text"
            name="address"
            required
            placeholder="현재 거주지 주소 (예: Quận 1, TP.HCM)"
            className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
          />
          <input
            type="email"
            name="email"
            placeholder="이메일 (선택 — 결과를 이메일로도 받아보세요)"
            className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              name="kakao_id"
              placeholder={`${messengers.primary.label} ID (선택)`}
              className="h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
            />
            <input
              type="text"
              name="zalo_id"
              placeholder={`${messengers.secondary.label} ID (선택)`}
              className="h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="flex items-start gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                name="agreeTerms"
                onChange={(e) => {
                  if (e.target.checked) onConsentChecked();
                }}
                className="mt-0.5"
              />
              <span>(필수) {CONSENT_SUMMARY}</span>
            </label>
            <ConsentDetails
              open={consentOpen}
              onToggle={onConsentToggle}
              highlight={consentHighlight}
            />
          </div>

          {leadError && <p className="text-xs text-red-600">{leadError}</p>}

          <PrimaryButton
            type="submit"
            variant={isPossible ? "primary" : "amber"}
            loading={submitting}
          >
            {submitting ? "접수 중..." : "AI 분석 리포트 무료로 받기"}
          </PrimaryButton>
        </form>

        <div className="mt-3">
          <InfoBox>입력하신 정보는 상담 안내 목적으로만 사용됩니다.</InfoBox>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
        >
          처음부터 다시 확인하기
        </button>
      </div>
    </div>
  );
}

export default function TrcCheckPage() {
  const [nationality, setNationality] = useState<Nationality>(null);
  const [visa, setVisa] = useState<Visa>(null);
  const [role, setRole] = useState<Role>(null);
  const [company, setCompany] = useState<Company>(null);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [emailProvided, setEmailProvided] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [consentHighlight, setConsentHighlight] = useState(false);
  const [agencyRequested, setAgencyRequested] = useState(false);
  const [agencySaving, setAgencySaving] = useState(false);
  const [agencyError, setAgencyError] = useState<string | null>(null);
  const [detailStage, setDetailStage] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [previousRejection, setPreviousRejection] = useState<boolean | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionStepDone, setRejectionStepDone] = useState(false);
  const [pendingNationality, setPendingNationality] = useState<Nationality>(null);
  const [pendingVisa, setPendingVisa] = useState<Visa>(null);
  const [pendingRole, setPendingRole] = useState<Role>(null);
  const [pendingCompany, setPendingCompany] = useState<Company>(null);
  const rejectionRecordIdRef = useRef<string | null>(null);
  const pendingRejectionInsertRef = useRef<PromiseLike<void> | null>(null);
  const messengers = MESSENGERS_KO;
  const selfNotifySentRef = useRef(false);

  const result: Result = computeTrcResultTone(visa, role, company);
  const showResult = nationality && visa && role && company;

  // 진단 완료 시 AI 리포트(customerView + expertBrief) 계산.
  // 화면에는 가입 직후(2번째 화면)부터 노출하지만, 계산 자체는 미리 해둔다.
  useEffect(() => {
    let cancelled = false;
    if (showResult) {
      getCheckDiagnosis({ service: "trc", visa, role, company }).then((res) => {
        if (!cancelled) setDiagnosis(res);
      });
    } else {
      setDiagnosis(null);
    }
    return () => {
      cancelled = true;
    };
  }, [visa, role, company, showResult]);

  // "네, 있습니다" 클릭 즉시 익명으로 저장 — 회원가입 여부와 무관하게 데이터가 남는다.
  // 삽입 Promise를 ref에 저장해두고, "다음" 클릭 시 이 Promise가 끝날 때까지
  // 기다린 뒤 사유를 업데이트한다 (빠르게 연속 클릭해도 순서가 꼬이지 않도록).
  function recordRejectionAnonymously() {
    const id = crypto.randomUUID();
    pendingRejectionInsertRef.current = supabase
      .from("previous_rejections")
      .insert({
        id,
        service_type: "trc",
        source_page: "/check/trc",
        reason: null,
      })
      .then(({ error }) => {
        if (error) {
          console.error("previous_rejections insert failed:", error);
          return;
        }
        rejectionRecordIdRef.current = id;
      });
  }

  // 사유를 입력하고 "다음"을 누른 시점에 — 저장이 아직 끝나지 않았으면 먼저 기다린 뒤 —
  // 사유를 업데이트하고 다음 질문으로 진행.
  async function finalizeRejectionStep() {
    if (pendingRejectionInsertRef.current) {
      await pendingRejectionInsertRef.current;
    }
    const id = rejectionRecordIdRef.current;
    if (id && rejectionReason.trim()) {
      const { error } = await supabase
        .from("previous_rejections")
        .update({ reason: rejectionReason.trim() })
        .eq("id", id);
      if (error) console.error("previous_rejections reason update failed:", error);
    }
    setRejectionStepDone(true);
  }

  // 관할 포털 링크(직접 등록) 클릭 시점에 응원 이메일을 한 번만 보낸다.
  function handleSelfPortalClick() {
    if (!leadId || selfNotifySentRef.current) return;
    selfNotifySentRef.current = true;
    fetch("/api/agency-confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, type: "self" }),
    }).catch((err) => {
      console.error("self-notify email trigger failed:", err);
    });
  }

  function reset() {
    setNationality(null);
    setVisa(null);
    setRole(null);
    setCompany(null);
    setLeadSubmitted(false);
    setLeadId(null);
    setLeadError(null);
    setEmailProvided(false);
    setConsentOpen(false);
    setConsentHighlight(false);
    setAgencyRequested(false);
    setAgencySaving(false);
    setAgencyError(null);
    setDetailStage(false);
    setDiagnosis(null);
    setPreviousRejection(null);
    setRejectionReason("");
    setRejectionStepDone(false);
    setPendingNationality(null);
    setPendingVisa(null);
    setPendingRole(null);
    setPendingCompany(null);
    rejectionRecordIdRef.current = null;
    pendingRejectionInsertRef.current = null;
  }

  async function handleAgencyRequest() {
    if (!leadId) return;
    setAgencySaving(true);
    setAgencyError(null);
    try {
      const { error } = await supabase.from("crm_activities").insert({
        lead_id: leadId,
        action: "agency_upgrade_request",
        tag: "TRC",
      });
      if (error) throw error;

      try {
        await fetch("/api/agency-confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId }),
        });
      } catch (emailErr) {
        console.error("agency-confirm email trigger failed:", emailErr);
      }

      setAgencyRequested(true);
    } catch {
      setAgencyError("접수 중 문제가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setAgencySaving(false);
    }
  }

  async function handleLeadSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (fd.get("agreeTerms") !== "on") {
      setConsentOpen(true);
      setConsentHighlight(true);
      return;
    }
    setConsentHighlight(false);

    setSubmitting(true);
    setLeadError(null);

    const leadId = crypto.randomUUID();
    const name = String(fd.get("name") || "");
    const phone = String(fd.get("phone") || "");
    const address = String(fd.get("address") || "");
    const email = (fd.get("email") as string) || "";
    const kakaoId = (fd.get("kakao_id") as string) || null;
    const zaloId = (fd.get("zalo_id") as string) || null;

    const { error } = await supabase.from("leads").insert({
      id: leadId,
      name,
      phone,
      address,
      email: email || null,
      kakao_id: kakaoId,
      zalo_id: zaloId,
      service_type: "trc",
      result: result,
      source_page: "/check/trc",
    });

    if (error) {
      console.error(error);
      setLeadError("접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    // expertBrief(전문가용 상세 진단)를 meta에 저장 — 향후 어드민 화면에서 활용
    await supabase.from("crm_activities").insert({
      lead_id: leadId,
      action: "trc_diagnosis_lead",
      tag: "TRC",
      meta: diagnosis
        ? {
            feasibilityScore: diagnosis.customerView.feasibilityScore,
            expertBrief: diagnosis.expertBrief,
            previousRejection:
              previousRejection === true
                ? { rejected: true, reason: rejectionReason || null }
                : previousRejection === false
                ? { rejected: false }
                : null,
          }
        : null,
    });

    try {
      const res = await fetch("/api/lead-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, name, phone, email, address }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        console.error("lead-submit API error:", errBody);
      }
    } catch (apiErr) {
      console.error("lead-submit fetch failed:", apiErr);
    }

    // 익명으로 미리 저장해둔 거절 이력 기록이 있으면 이번 리드와 연결
    // (저장이 아직 진행 중일 수 있으므로 먼저 기다린다)
    if (pendingRejectionInsertRef.current) {
      await pendingRejectionInsertRef.current;
    }
    if (rejectionRecordIdRef.current) {
      try {
        await supabase
          .from("previous_rejections")
          .update({ linked_lead_id: leadId })
          .eq("id", rejectionRecordIdRef.current);
      } catch (linkErr) {
        console.error("previous_rejections link failed:", linkErr);
      }
    }

    saveLeadContact({ name, phone, address, kakao_id: kakaoId, zalo_id: zaloId });
    setEmailProvided(!!email);
    setLeadId(leadId);
    setSubmitting(false);
    setLeadSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* STEP12-3 목업 헤더 — 뒤로가기 / 브랜드 / 보안 안내 */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex w-16 items-center text-gray-400 hover:text-gray-600 sm:w-24"
          >
            <Menu size={20} className="sm:hidden" />
            <span className="hidden items-center gap-1 text-xs font-medium sm:flex">
              <ArrowLeft size={14} /> 홈으로
            </span>
          </Link>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1D4EDB] text-[11px] font-bold text-white">
                V
              </span>
              <span className="text-sm font-bold text-gray-900">VFBCAI</span>
            </div>
            <span className="text-[10px] text-gray-400">베트남 행정전문 AI</span>
          </div>

          <div className="flex w-16 items-center justify-end gap-1 text-[11px] text-gray-400 sm:w-auto">
            <Shield size={14} />
            <span className="hidden sm:inline">모든 정보는 안전하게 보호됩니다</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-6 py-10">
        {!rejectionStepDone && (
          <div className="mt-6">
            <p className="text-xs font-semibold text-[#1D4EDB]">
              거주증(TRC) 가능성 진단
            </p>
            <p className="mt-2 text-sm font-semibold text-[#1D4EDB]">
              STEP 1 / 5
            </p>
            <h1 className="mt-2 text-2xl font-bold leading-snug text-gray-900 sm:text-[28px]">
              이전에 다른 곳(정부기관 또는 타 대행사)에서 신청하셨다가
              거절·반려되신 적이 있나요?
            </h1>

            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              <div className="flex items-start gap-2 rounded-xl bg-blue-50 px-3.5 py-2.5 text-xs text-blue-800 sm:flex-1">
                <Info size={16} className="mt-0.5 shrink-0" />
                이 질문은 반려 가능성을 판단하는 중요한 정보입니다.
              </div>
              <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-800 sm:flex-1">
                <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                정확한 진단을 위해 솔직하게 선택해주세요.
              </div>
            </div>

            <p className="mt-6 text-sm text-gray-600">
              아래 항목 중 해당되는 것을 선택해주세요.
            </p>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setPreviousRejection(true);
                  recordRejectionAnonymously();
                }}
                className={`rounded-2xl border p-5 text-left transition-all duration-200 ${
                  previousRejection === true
                    ? "border-[#1D4EDB] bg-white shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                      previousRejection === true ? "border-[#1D4EDB]" : "border-gray-300"
                    }`}
                  >
                    {previousRejection === true && (
                      <span className="h-2 w-2 rounded-full bg-[#1D4EDB]" />
                    )}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
                    <AlertTriangle size={18} className="text-[#EF4444]" />
                  </span>
                </div>
                <p className="mt-4 text-base font-bold text-gray-900">
                  네, 있습니다
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  이전에 신청했다가 거절·반려된 이력이 있습니다.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                  <CheckCircle2 size={12} /> 추가 검토가 필요할 수 있습니다.
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPreviousRejection(false);
                  setTimeout(() => setRejectionStepDone(true), 450);
                }}
                className={`rounded-2xl border p-5 text-left transition-all duration-200 ${
                  previousRejection === false
                    ? "border-[#1D4EDB] bg-white shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                      previousRejection === false ? "border-[#1D4EDB]" : "border-gray-300"
                    }`}
                  >
                    {previousRejection === false && (
                      <span className="h-2 w-2 rounded-full bg-[#1D4EDB]" />
                    )}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                  </span>
                </div>
                <p className="mt-4 text-base font-bold text-gray-900">아니요</p>
                <p className="mt-1 text-sm text-gray-500">
                  처음 신청하거나, 신청 이력이 없습니다.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                  <CheckCircle2 size={12} /> 가장 일반적인 신청 유형입니다.
                </span>
              </button>
            </div>

            {previousRejection === true && (
              <div className="mt-4">
                <div className="flex items-start gap-2.5 rounded-2xl border-2 border-blue-100 bg-blue-50/60 px-4 py-3.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                    AI
                  </span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      거절 사유를 알려주시면 AI가 더 정확하게 분석합니다.
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600">
                      이전에 들으셨던 거절 사유나 안내받은 내용을 자유롭게
                      작성해주세요. 작성할수록 진단 정확도가 높아집니다.
                    </p>
                  </div>
                </div>

                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={
                    "예)\n- 노동허가가 거절되었습니다.\n- 범죄경력증명서 문제라고 들었습니다.\n- 회사 자본금이 부족하다고 안내받았습니다.\n- 정확한 이유를 듣지 못했습니다.\n\n자유롭게 작성해주세요."
                  }
                  rows={6}
                  className="mt-3 min-h-[160px] w-full resize-none rounded-xl border-2 border-gray-300 bg-white px-4 py-3.5 text-sm leading-relaxed placeholder:text-gray-400 focus:border-[#1D4EDB] focus:outline-none"
                />
                <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
                  작성해주신 내용은 AI가 거절 원인을 분석하고 해결 가능성을
                  높이는 데 활용됩니다.
                </p>

                <button
                  type="button"
                  onClick={finalizeRejectionStep}
                  className="mt-3 flex h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-[#1D4EDB] text-sm font-semibold text-white transition-colors hover:bg-blue-800 sm:w-auto sm:px-8"
                >
                  다음 단계로
                  <ArrowLeft size={16} className="rotate-180" />
                </button>
              </div>
            )}

            <div className="mt-6 flex items-start gap-3 rounded-xl bg-blue-50/60 px-4 py-3.5">
              <Lightbulb size={18} className="mt-0.5 shrink-0 text-[#1D4EDB]" />
              <div>
                <p className="text-sm font-bold text-gray-900">
                  AI가 이 정보를 어떻게 활용하나요?
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">
                  이전 거절 이력이 있는 경우, 거절 사유 분석과 재신청 가능성을
                  더 정밀하게 진단합니다.
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={14} /> 홈으로
            </Link>
          </div>
        )}

        {rejectionStepDone && !showResult && (
          <>
            {!nationality && (
              <div className="mt-8">
                <TrcStepHeader
                  step={2}
                  question="국적이 어떻게 되시나요?"
                  note="국적은 적용 법령과 절차를 구분하는 기준입니다."
                />
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { key: "korea", label: "대한민국", desc: "가장 많이 선택되는 국적입니다.", meaning: "국적 요건 충족 확인에 활용됩니다", tone: "positive" as const },
                    { key: "china", label: "중국", desc: "중국 국적 신청자에게 적용됩니다.", meaning: "국가별 규정 확인이 필요한 유형입니다", tone: "caution" as const },
                    { key: "japan", label: "일본", desc: "일본 국적 신청자에게 적용됩니다.", meaning: "국가별 규정 확인이 필요한 유형입니다", tone: "caution" as const },
                    { key: "other", label: "기타 국가", desc: "위 국가에 해당하지 않는 경우입니다.", meaning: "추가 서류 확인이 필요할 수 있는 유형입니다", tone: "caution" as const },
                  ].map((opt) => (
                    <TrcOptionCard
                      key={opt.key}
                      icon={<Globe size={18} className="text-blue-700" />}
                      iconBg="bg-blue-50"
                      title={opt.label}
                      description={opt.desc}
                      meaning={opt.meaning}
                      meaningTone={opt.tone}
                      selected={pendingNationality === opt.key}
                      onClick={() => {
                        setPendingNationality(opt.key as Nationality);
                        setTimeout(() => setNationality(opt.key as Nationality), 450);
                      }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPendingNationality(null);
                    setRejectionStepDone(false);
                  }}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={14} /> 이전 단계로
                </button>
              </div>
            )}

            {nationality && !visa && (
              <div className="mt-8">
                <TrcStepHeader
                  step={3}
                  question="현재 어떤 비자를 소지하고 있나요?"
                  note="비자 종류는 거주증 발급 가능성을 판단하는 핵심 기준입니다."
                />
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { key: "invest", label: "투자비자 (DT)", desc: "출자·투자 목적으로 발급된 비자입니다.", meaning: "거주증 자격 판단에 유리한 유형입니다", tone: "positive" as const },
                    { key: "work", label: "노동허가부 비자 (LD)", desc: "노동허가 취득을 완료한 경우입니다.", meaning: "거주증 자격 판단에 유리한 유형입니다", tone: "positive" as const },
                    { key: "tourist", label: "관광·단기비자 (DL 등)", desc: "단기 체류 목적으로 발급된 비자입니다.", meaning: "추가 자격 확인이 필요한 유형입니다", tone: "caution" as const },
                    { key: "other", label: "기타 비자", desc: "위 항목에 해당하지 않는 경우입니다.", meaning: "정밀 검토가 필요한 유형입니다", tone: "caution" as const },
                  ].map((opt) => (
                    <TrcOptionCard
                      key={opt.key}
                      icon={<FileText size={18} className="text-blue-700" />}
                      iconBg="bg-blue-50"
                      title={opt.label}
                      description={opt.desc}
                      meaning={opt.meaning}
                      meaningTone={opt.tone}
                      selected={pendingVisa === opt.key}
                      onClick={() => {
                        setPendingVisa(opt.key as Visa);
                        setTimeout(() => setVisa(opt.key as Visa), 450);
                      }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPendingVisa(null);
                    setNationality(null);
                  }}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={14} /> 이전 단계로
                </button>
              </div>
            )}

            {nationality && visa && !role && (
              <div className="mt-8">
                <TrcStepHeader
                  step={4}
                  question="회사 내 직책이 어떻게 되시나요?"
                  note="직책은 신청 자격 요건을 확인하는 데 사용됩니다."
                />
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { key: "legal-rep", label: "법인장 · 법정대표자", desc: "법인의 대표 권한을 가진 경우입니다.", meaning: "거주증 자격 판단에 유리한 유형입니다", tone: "positive" as const },
                    { key: "manager", label: "매니저 · 관리직", desc: "관리 업무를 담당하는 경우입니다.", meaning: "직책 요건 추가 확인이 필요한 유형입니다", tone: "caution" as const },
                    { key: "staff", label: "일반 직원", desc: "일반 실무를 담당하는 경우입니다.", meaning: "직책 요건 추가 확인이 필요한 유형입니다", tone: "caution" as const },
                  ].map((opt) => (
                    <TrcOptionCard
                      key={opt.key}
                      icon={<Users size={18} className="text-blue-700" />}
                      iconBg="bg-blue-50"
                      title={opt.label}
                      description={opt.desc}
                      meaning={opt.meaning}
                      meaningTone={opt.tone}
                      selected={pendingRole === opt.key}
                      onClick={() => {
                        setPendingRole(opt.key as Role);
                        setTimeout(() => setRole(opt.key as Role), 450);
                      }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPendingRole(null);
                    setVisa(null);
                  }}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={14} /> 이전 단계로
                </button>
              </div>
            )}

            {nationality && visa && role && !company && (
              <div className="mt-8">
                <TrcStepHeader
                  step={5}
                  question="소속 회사의 법인 형태는 무엇인가요?"
                  note="법인 형태는 필요 서류와 신청 가능 여부를 결정합니다."
                />
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { key: "fdi", label: "외국인투자법인 (FDI)", desc: "외국인 투자 지분이 있는 법인입니다.", meaning: "거주증 자격 판단에 유리한 유형입니다", tone: "positive" as const },
                    { key: "local", label: "현지 법인", desc: "베트남 현지 자본으로 설립된 법인입니다.", meaning: "법인 형태 추가 확인이 필요한 유형입니다", tone: "caution" as const },
                    { key: "unregistered", label: "아직 미등록 · 준비 중", desc: "법인 등록 절차가 아직 진행 중입니다.", meaning: "법인 미등록 시 신청이 제한될 수 있는 유형입니다", tone: "caution" as const },
                  ].map((opt) => (
                    <TrcOptionCard
                      key={opt.key}
                      icon={<Building2 size={18} className="text-blue-700" />}
                      iconBg="bg-blue-50"
                      title={opt.label}
                      description={opt.desc}
                      meaning={opt.meaning}
                      meaningTone={opt.tone}
                      selected={pendingCompany === opt.key}
                      onClick={() => {
                        setPendingCompany(opt.key as Company);
                        setTimeout(() => setCompany(opt.key as Company), 450);
                      }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPendingCompany(null);
                    setRole(null);
                  }}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={14} /> 이전 단계로
                </button>
              </div>
            )}
          </>
        )}

        {/* 1번째 화면 (가입 전) — Premium SaaS lead capture */}
        {showResult && result === "possible" && !leadSubmitted && (
          <PremiumLeadCapture
            tone="possible"
            diagnosis={diagnosis}
            messengers={messengers}
            submitting={submitting}
            leadError={leadError}
            consentOpen={consentOpen}
            consentHighlight={consentHighlight}
            onConsentToggle={() => setConsentOpen((v) => !v)}
            onConsentChecked={() => setConsentHighlight(false)}
            onSubmit={handleLeadSubmit}
            onReset={reset}
          />
        )}

        {/* 2번째 화면 (가입 직후) — AI 리포트 + 직접등록/전문가 진행요청 선택 */}
        {showResult && result === "possible" && leadSubmitted && !agencyRequested && !detailStage && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              거주증(TRC) · AI 분석 리포트
            </p>

            {diagnosis && (
              <div className="mt-3">
                <DiagnosisReportCard diagnosis={diagnosis} />
              </div>
            )}

            <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold text-gray-700">
                거주증(TRC) 신청에 필요한 서류
              </p>
              <ul className="mt-2 space-y-1">
                <li className="text-xs text-gray-600 pl-1">
                  · 여권 사본 (인적사항 페이지)
                </li>
                <li className="text-xs text-gray-600 pl-1">
                  · 현재 비자 사본
                </li>
                <li className="text-xs text-gray-600 pl-1">
                  · 재직증명서 또는 노동계약서
                </li>
                <li className="text-xs text-gray-600 pl-1">
                  · 회사 사업자등록증 사본
                </li>
              </ul>
              <p className="mt-2 text-[11px] text-gray-400">
                정확한 요건은 상황에 따라 다를 수 있어 담당자 확인이 필요합니다.
              </p>
            </div>

            <ProcessMethodCards
              onSelf={handleSelfPortalClick}
              onExpert={() => setDetailStage(true)}
            />
            <p className="mt-2 text-[11px] text-gray-400">
              공안부 공공서비스포털의 거주증(TRC) 발급 절차 안내 페이지로
              이동합니다. 구비서류·수수료·처리기간을 확인하실 수 있습니다.
            </p>

            <button
              onClick={reset}
              className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
            >
              처음부터 다시 확인하기
            </button>
          </div>
        )}

        {showResult && (result === "possible" || result === "conditional") && leadSubmitted && !agencyRequested && detailStage && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CheckCircle2 className="text-emerald-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              거주증(TRC) 진행 서류 및 절차
            </p>

            <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800 leading-relaxed">
              ⏱ 직접 신청하시는 경우, 지역마다 요구서류와 절차가 조금씩
              달라 정확한 정보를 찾기 어렵고, 서류 준비 실수로
              반려·재제출이 잦아 시간이 예상보다 오래 걸릴 수 있습니다.
              혹시 걱정되시거나 자신이 없으시다면, 언제든 편하게 도움을
              요청하세요.
            </div>

            <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold text-gray-700">
                거주증(TRC) 신청에 필요한 서류
              </p>
              <ul className="mt-2 space-y-1">
                <li className="text-xs text-gray-600 pl-1">
                  · 여권 사본 (인적사항 페이지)
                </li>
                <li className="text-xs text-gray-600 pl-1">· 현재 비자 사본</li>
                <li className="text-xs text-gray-600 pl-1">
                  · 재직증명서 또는 노동계약서
                </li>
                <li className="text-xs text-gray-600 pl-1">
                  · 회사 사업자등록증 사본
                </li>
              </ul>
            </div>

            <p className="mt-4 text-sm font-bold text-gray-900">
              정확하고 문제없이 빠르게 진행하시길 원한다면 반드시 전문가와
              상의하세요.
            </p>

            {agencyError && (
              <p className="mt-3 text-xs text-red-600">{agencyError}</p>
            )}
            <p className="mb-2 text-xs text-gray-500 leading-relaxed">
              직접 진행이 어려운 경우 전문가에게 진행을 요청할 수 있습니다.
            </p>
            <button
              onClick={handleAgencyRequest}
              disabled={agencySaving}
              className="mt-4 w-full h-12 rounded-full bg-blue-900 text-sm font-semibold text-white hover:bg-blue-950 disabled:opacity-60 transition-colors"
            >
              {agencySaving ? "접수 중..." : "전문가 진행요청하기 →"}
            </button>
            <p className="mt-2 text-[11px] text-gray-400">
              이미 입력하신 정보로 바로 접수되며, 다시 입력하실 필요 없습니다.
            </p>

            <button
              onClick={() => setDetailStage(false)}
              className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
            >
              ← 간단 목록으로 돌아가기
            </button>
          </div>
        )}

        {showResult && (result === "possible" || result === "conditional") && agencyRequested && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex justify-center">
              <img
                src="/vfbc-seal.png"
                alt="VFBCAI 접수완료 확인 도장"
                width={160}
                height={160}
              />
            </div>
            <p className="mt-1 text-[10px] text-gray-400 text-center italic">
              Vietnam Foreign Business Verification &amp; Compliance AI Center
            </p>
            <p className="mt-2 text-lg font-bold text-gray-900 text-center">
              전문가 진행요청이 접수되었습니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              담당자가 서류를 확인한 뒤 진행 상황을 가입하신 이메일 또는{" "}
              {messengers.primary.label}/{messengers.secondary.label}로
              안내드립니다. 별도로 상담을 신청하지 않으셔도 됩니다.
            </p>

            {emailProvided && (
              <p className="mt-2 text-[11px] text-gray-400">
                메시지가 오지 않으면 이메일도 함께 확인해주세요.
              </p>
            )}

            <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-blue-900" />
              입력하신 전화번호로 계정이 생성되었습니다. 비밀번호는
              자동 생성되며, 마이페이지에서 언제든 변경하실 수
              있습니다. 거주증·노동허가·비자 등 만료 알림 서비스도
              함께 이용하실 수 있습니다.
            </div>

            <button
              onClick={reset}
              className="mt-6 block text-xs text-gray-400 hover:text-gray-600"
            >
              처음부터 다시 확인하기
            </button>
          </div>
        )}

        {/* 조건부 가능 — 1번째 화면 (가입 전, Premium SaaS lead capture) */}
        {showResult && result === "conditional" && !leadSubmitted && (
          <PremiumLeadCapture
            tone="conditional"
            diagnosis={diagnosis}
            messengers={messengers}
            submitting={submitting}
            leadError={leadError}
            consentOpen={consentOpen}
            consentHighlight={consentHighlight}
            onConsentToggle={() => setConsentOpen((v) => !v)}
            onConsentChecked={() => setConsentHighlight(false)}
            onSubmit={handleLeadSubmit}
            onReset={reset}
          />
        )}

        {/* 조건부 가능 — 2번째 화면 (가입 직후, AI 리포트 + 직접등록/전문가 진행요청 선택) */}
        {showResult && result === "conditional" && leadSubmitted && !agencyRequested && !detailStage && (
          <div className="mt-8 rounded-3xl bg-white border border-amber-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              거주증(TRC) · AI 분석 리포트
            </p>

            {diagnosis && (
              <div className="mt-3">
                <DiagnosisReportCard diagnosis={diagnosis} />
              </div>
            )}

            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800 leading-relaxed">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              현재 조건으로는 자격 요건이 완전히 충족되지 않아, 직접
              진행하실 경우 서류 준비나 절차에서 어려움을 겪으실 가능성이
              높습니다. 그래도 직접 진행을 원하신다면 아래에서 선택하실 수
              있습니다.
            </div>

            <ProcessMethodCards
              onSelf={handleSelfPortalClick}
              onExpert={() => setDetailStage(true)}
            />

            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-blue-900" />
              입력하신 전화번호로 계정이 생성되었습니다. 비밀번호는
              자동 생성되며, 마이페이지에서 언제든 변경하실 수
              있습니다. 거주증·노동허가·비자 등 만료 알림 서비스도
              함께 이용하실 수 있습니다.
            </div>

            <Link
              href="/consultation?case=trc-conditional"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:underline"
            >
              메시지 기다리지 않고 지금 상담하기
            </Link>
            <button
              onClick={reset}
              className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
            >
              처음부터 다시 확인하기
            </button>
          </div>
        )}

        {showResult && result === "impossible" && (
          <div className="mt-8 rounded-3xl bg-white border border-red-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <XCircle className="text-red-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              현재 상태로는 거주증 발급이 어렵습니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              법인이 아직 등록되지 않은 상태에서는 거주증 신청 자체가
              불가능합니다. 먼저 법인설립(IRC/ERC) 절차를 진행해야 합니다.
            </p>
            <Link
              href="/register/company"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              법인설립 절차 확인하기
            </Link>
            <button
              onClick={reset}
              className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
            >
              처음부터 다시 확인하기
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
