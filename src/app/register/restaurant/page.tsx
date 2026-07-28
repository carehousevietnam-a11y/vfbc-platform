"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Store,
  FileCheck2,
  FileWarning,
  Flame,
  Clock,
  FileText,
  UserCheck,
} from "lucide-react";
import { SelectionCard, QuestionSection, PrimaryButton, NoticeCard, InfoBox } from "@/components/ui";
import type { SelectionCardTone } from "@/components/ui/SelectionCard";
import { MESSENGERS_KO } from "@/lib/messenger";
import { supabase } from "@/lib/supabase";
import { saveLeadContact } from "@/lib/leadContact";
import { getRequiredDocuments } from "@/lib/requiredDocuments";

// 베트남 공공서비스포털 (Cổng Dịch vụ công quốc gia).
// 식당허가(위생안전·소방)는 관할 지역(성·시)에 따라 담당부서가 달라, 이 포털에서
// 관할 지역을 선택해 안내를 받도록 연결한다. (특정 부서 URL을 직접 지정하지 않음)
// ⚠️ 배포 전 Linda 법률 검토 필요 — URL·안내 문구 확인 후 게시할 것.
const REGISTER_RESTAURANT_OFFICIAL_URL = "https://dichvucong.gov.vn/";

type RegistrationStatus = "confirmed" | "unconfirmed" | null;
type PremisesStatus = "secured" | "unsecured" | null;
type HygieneFireStatus = "ready" | "not_ready" | null;
type OperationChoice = "not_open" | "operating_licensed" | "operating_unlicensed" | null;
type ResultTone = "possible" | "conditional" | null;

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

// ── 질문 옵션 + 아이콘/톤 매핑 (표시 전용) ──────────────────────────────
// value/키는 기존과 100% 동일하게 유지한다. 아이콘·색상·문구 배치만 새로 추가.
const OPERATION_OPTIONS: { key: NonNullable<OperationChoice>; label: string; desc: string; icon: typeof Store; tone: SelectionCardTone }[] = [
  { key: "not_open", label: "아직 오픈 전입니다", desc: "허가 신청을 준비하는 단계", icon: Store, tone: "blue" },
  { key: "operating_licensed", label: "허가를 받고 정상 운영 중입니다", desc: "", icon: CheckCircle2, tone: "green" },
  { key: "operating_unlicensed", label: "허가 없이 이미 영업 중입니다", desc: "", icon: AlertTriangle, tone: "red" },
];

const REGISTRATION_OPTIONS: { key: NonNullable<RegistrationStatus>; label: string; icon: typeof FileCheck2; tone: SelectionCardTone }[] = [
  { key: "confirmed", label: "준비되어 있음", icon: FileCheck2, tone: "green" },
  { key: "unconfirmed", label: "아직 미확정", icon: FileWarning, tone: "amber" },
];

const PREMISES_OPTIONS: { key: NonNullable<PremisesStatus>; label: string; icon: typeof Store; tone: SelectionCardTone }[] = [
  { key: "secured", label: "체결 완료", icon: Store, tone: "green" },
  { key: "unsecured", label: "아직 미체결", icon: FileWarning, tone: "amber" },
];

const HYGIENE_OPTIONS: { key: NonNullable<HygieneFireStatus>; label: string; icon: typeof Flame; tone: SelectionCardTone }[] = [
  { key: "ready", label: "예, 완료했습니다", icon: CheckCircle2, tone: "green" },
  { key: "not_ready", label: "아직입니다", icon: Flame, tone: "amber" },
];

// 자체 진단 로직 (checkDiagnosis.ts 미사용, 규칙 기반) — 등록상태·영업장확보
// 여부로 점수를 계산하고, 위생·소방 준비상태는 체크리스트 항목으로만 반영한다.
// 법 조항·구체적 허가가능 여부는 단정하지 않고 "가능성" 톤을 유지한다.
// ⚠️ 이번 UI 통일 작업에서 이 함수는 단 한 글자도 수정하지 않았다.
type RestaurantDiagnosis = {
  feasibilityScore: number;
  resultTone: "possible" | "conditional";
  checklist: { label: string; passed: boolean }[];
  note: string;
  estimatedDays: { min: number; max: number };
};

function computeRestaurantDiagnosis(
  registrationStatus: RegistrationStatus,
  premisesStatus: PremisesStatus,
  hygieneFireStatus: HygieneFireStatus
): RestaurantDiagnosis {
  const checklist = [
    { label: "사업자·법인 등록 서류 준비", passed: registrationStatus === "confirmed" },
    { label: "영업장(매장) 임대차 계약 확보", passed: premisesStatus === "secured" },
    { label: "위생·소방 안전시설 준비", passed: hygieneFireStatus === "ready" },
  ];
  const passedCount = checklist.filter((c) => c.passed).length;
  const score = Math.round((passedCount / checklist.length) * 100);
  const tone: "possible" | "conditional" =
    registrationStatus === "confirmed" && premisesStatus === "secured" ? "possible" : "conditional";
  const note =
    tone === "possible"
      ? "현재 입력 기준으로는 신청을 진행하실 수 있는 상태에 가깝습니다. 정확한 진행 가능 여부는 서류 검토 후 확정됩니다."
      : "일부 준비가 더 필요할 수 있습니다. 준비 서류를 보완하면 진행할 수 있는 경우가 많습니다.";
  return {
    feasibilityScore: score,
    resultTone: tone,
    checklist,
    note,
    estimatedDays: { min: 15, max: 30 },
  };
}

// STEP10-6: AI 판단 근거 — 새 AI 호출 없이 기존 진단 결과(점수/체크리스트/상태)만으로
// "왜 이렇게 판단했는지"를 2~3개의 짧은 문장으로 요약. DB/API/CRM 변경 없음.
// ⚠️ 이번 UI 통일 작업에서 이 함수도 단 한 글자도 수정하지 않았다.
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

// ── 여기부터 신규 UI(표시 전용) — CHECK(TRC)/VERIFY(admin)와 동일한 Master UI 구조 ──

// CHECK(TRC)의 ResultHeaderGauge와 동일한 SVG-native rotate 원형 게이지.
// VERIFY의 riskLevel 대신 REGISTER는 feasibilityScore(0~100)가 이미 존재하므로,
// 새 점수를 만들지 않고 기존 diagnosis.feasibilityScore를 그대로 시각화만 한다.
function RestaurantResultGauge({
  score,
  tone,
  size = 104,
}: {
  score: number;
  tone: "possible" | "conditional";
  size?: number;
}) {
  const isPossible = tone === "possible";
  const ringColor = isPossible ? "#059669" : "#D97706";
  const scale = size / 104;
  const strokeWidth = 7 * scale;
  const r = 46 * scale;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const fillRatio = Math.max(0, Math.min(1, score / 100));

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${cx} ${cx})`}>
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} />
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - fillRatio)}
          />
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`flex items-center justify-center rounded-full ${
            isPossible ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          }`}
          style={{ width: 20 * scale, height: 20 * scale }}
        >
          {isPossible ? <CheckCircle2 size={12 * scale} /> : <AlertTriangle size={12 * scale} />}
        </span>
        <strong className="mt-0.5 font-black leading-none text-gray-900" style={{ fontSize: 15 * scale }}>
          {score}%
        </strong>
        <span
          className={`mt-0.5 font-bold ${isPossible ? "text-emerald-600" : "text-amber-600"}`}
          style={{ fontSize: 11 * scale }}
        >
          {isPossible ? "가능" : "조건부"}
        </span>
      </div>
    </div>
  );
}

// VERIFY(admin)의 VerifyResultOverviewCards와 동일한 PC 5칸 그리드 / 모바일 세로
// 리스트 wrapper를 그대로 재사용하고, 내용만 REGISTER 진단(diagnosis)에 이미 존재하는
// 필드(feasibilityScore/checklist/note/estimatedDays)로 채운다. 새 계산 로직 없음 —
// 허위 데이터 금지 원칙에 따라 없는 값은 만들지 않고 기존 값만 재배치해 표시한다.
function RestaurantResultOverviewCards({
  diagnosis,
  docCount,
}: {
  diagnosis: RestaurantDiagnosis;
  docCount: number;
}) {
  const { feasibilityScore, resultTone, checklist, note, estimatedDays } = diagnosis;
  const isPossible = resultTone === "possible";
  const toneLabel = isPossible ? "가능" : "조건부 가능";
  const failedItems = checklist.filter((c) => !c.passed);
  const topRiskFactor = failedItems[0]?.label ?? "확인된 주요 위험요인이 없습니다";

  const scorePillTone = isPossible ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700";
  const aiOpinionText = isPossible ? "정상" : "확인필요";
  const aiOpinionTone = isPossible ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700";

  const items = [
    {
      n: 1,
      label: "허가 가능성",
      visual: <RestaurantResultGauge score={feasibilityScore} tone={resultTone} size={64} />,
      pill: <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${scorePillTone}`}>{toneLabel}</span>,
      caption: "입력하신 내용을 기준으로 분석한 1차 허가 가능성입니다.",
    },
    {
      n: 2,
      label: "위험요인",
      visual: (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
          <AlertTriangle className="text-amber-600" size={26} />
        </div>
      ),
      pill: (
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
          {topRiskFactor}
        </span>
      ),
      caption: "우선적으로 보완이 필요한 항목입니다.",
    },
    {
      n: 3,
      label: "준비서류",
      visual: (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
          <FileText className="text-blue-700" size={26} />
        </div>
      ),
      pill: (
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-800">
          {docCount > 0 ? `필요 서류 ${docCount}개` : "서류 확인 필요"}
        </span>
      ),
      caption: "허가 신청에 필요한 서류입니다.",
    },
    {
      n: 4,
      label: "예상 처리기간",
      visual: (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-50">
          <Clock className="text-violet-600" size={26} />
        </div>
      ),
      pill: (
        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700">
          {estimatedDays ? `${estimatedDays.min}~${estimatedDays.max}일` : "서류 확인 후 안내"}
        </span>
      ),
      caption: "준비 서류와 관할 기관에 따라 달라질 수 있습니다.",
    },
    {
      n: 5,
      label: "AI 검토 의견",
      visual: (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <UserCheck className="text-gray-700" size={26} />
        </div>
      ),
      pill: <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${aiOpinionTone}`}>{aiOpinionText}</span>,
      caption: note,
    },
  ];

  return (
    <>
      {/* PC — 5칸 가로 배치 (태블릿까지는 세로 리스트를 유지하기 위해 lg 이상에서만 적용) */}
      <div className="mt-6 hidden overflow-hidden rounded-2xl border border-gray-100 bg-white lg:grid lg:grid-cols-5 lg:divide-x lg:divide-gray-100">
        {items.map((item) => (
          <div key={item.n} className="flex flex-col items-center gap-2.5 p-5 text-center">
            <div className="flex items-center gap-1.5 self-start">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-900 text-[10px] font-bold text-white">
                {item.n}
              </span>
              <span className="text-xs font-semibold text-gray-700">{item.label}</span>
            </div>
            <div className="mt-1">{item.visual}</div>
            {item.pill}
            <p className="text-[11px] leading-relaxed text-gray-500">{item.caption}</p>
          </div>
        ))}
      </div>

      {/* 모바일·태블릿 — 세로형 요약 리스트 (lg 미만에서는 5칸 대신 이 리스트를 사용) */}
      <div className="mt-6 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white lg:hidden">
        {items.map((item) => (
          <div key={item.n} className="flex items-center justify-between gap-3 p-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-900 text-[10px] font-bold text-white">
                {item.n}
              </span>
              <span className="truncate text-sm font-medium text-gray-700">{item.label}</span>
            </div>
            <div className="shrink-0">{item.pill}</div>
          </div>
        ))}
      </div>
    </>
  );
}

// VERIFY(admin)의 VerifyResultSummaryCard와 동일한 구조 — 기존 buildAiReasonBullets()
// 결과(문장)만으로 요약 카드를 구성한다. 새로운 판단·문구 생성 로직 없음.
function RestaurantResultSummaryCard({ diagnosis }: { diagnosis: RestaurantDiagnosis }) {
  const bullets = buildAiReasonBullets(
    diagnosis.feasibilityScore,
    diagnosis.resultTone,
    diagnosis.checklist,
    diagnosis.estimatedDays
  );

  return (
    <div className="mt-3 rounded-2xl bg-white border border-gray-100 p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
          AI
        </span>
        <p className="text-sm font-bold text-gray-900">AI 분석 결과 요약</p>
      </div>
      <div className="mt-3 space-y-1.5">
        {bullets.map((b, i) => (
          <p key={i} className="text-sm leading-relaxed text-gray-700">
            · {b}
          </p>
        ))}
      </div>
    </div>
  );
}

// CHECK(TRC)/VERIFY(admin)의 PremiumLeadCapture / VerifyAdminLeadCapture와 동일한
// JSX/className 구조 — 1번째 화면(가입 전), 결과 미리보기 + 개인정보 입력.
function RestaurantLeadCapture({
  diagnosis,
  submitting,
  error,
  consentOpen,
  consentHighlight,
  onConsentToggle,
  onConsentChecked,
  onSubmit,
  onReset,
}: {
  diagnosis: RestaurantDiagnosis;
  submitting: boolean;
  error: string | null;
  consentOpen: boolean;
  consentHighlight: boolean;
  onConsentToggle: () => void;
  onConsentChecked: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
}) {
  const isPossible = diagnosis.resultTone === "possible";
  const messengers = MESSENGERS_KO;

  return (
    <div>
      <div
        className={`mt-8 rounded-3xl border bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${
          isPossible ? "border-gray-100" : "border-amber-100"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {isPossible ? (
              <CheckCircle2 className="text-emerald-600" size={28} />
            ) : (
              <AlertTriangle className="text-amber-600" size={28} />
            )}

            <p className="mt-4 text-lg font-bold text-gray-900">
              {isPossible ? "식당허가 진행이 가능합니다" : "보완이 필요할 수 있습니다"}
            </p>

            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {isPossible
                ? "현재 사업자등록·영업장 준비 상태 기준으로 식당허가(위생안전·소방) 신청 요건을 충족합니다."
                : "현재 사업자등록 또는 영업장 준비 상태만으로는 식당허가 신청이 자동으로 진행되지 않습니다. 준비 서류를 보완하면 진행할 수 있는 경우가 많습니다."}
            </p>
          </div>

          <RestaurantResultGauge score={diagnosis.feasibilityScore} tone={diagnosis.resultTone} />
        </div>

        <p className="mt-2 text-xs leading-relaxed text-gray-400">
          * 위 결과는 입력하신 조건을 기준으로 한 1차 자가진단입니다. 정확한
          진행 가능 여부는 서류 검토 후 전문가 상담을 통해 확정됩니다.
        </p>

        <div className="mt-4">
          <NoticeCard tone={isPossible ? "success" : "warning"}>
            이름·연락처·주소만 남기시면 AI가 서류를 상세 분석한 리포트를
            바로 보여드립니다.
          </NoticeCard>
        </div>

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
            <ConsentDetails open={consentOpen} onToggle={onConsentToggle} highlight={consentHighlight} />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <PrimaryButton type="submit" variant={isPossible ? "primary" : "amber"} loading={submitting}>
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

export default function RegisterRestaurantPage() {
  const [operationChoice, setOperationChoice] = useState<OperationChoice>(null);
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>(null);
  const [premisesStatus, setPremisesStatus] = useState<PremisesStatus>(null);
  const [hygieneFireStatus, setHygieneFireStatus] = useState<HygieneFireStatus>(null);

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

  const [previousRejection, setPreviousRejection] = useState<boolean | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionStepDone, setRejectionStepDone] = useState(false);
  const rejectionRecordIdRef = useRef<string | null>(null);
  const pendingRejectionInsertRef = useRef<PromiseLike<void> | null>(null);
  const selfNotifySentRef = useRef(false);

  // ── 아래 4개는 이번 Master UI 통일 작업에서 새로 추가된 state다. 기존 진단·CRM·DB
  // 관련 state(위 블록)는 단 하나도 이름·타입·용도를 바꾸지 않았다. 이 4개는 CHECK(TRC)/
  // VERIFY(admin)가 이미 쓰고 있는 auto-login 연결(resultToken)과, 동일 UI 컴포넌트가
  // 쓰는 클릭 피드백(selectedKey)·AI 리포트 버튼 상태(aiReportRequesting/Error)를
  // 위해서만 필요하다 — 진단 결과·점수·meta 등 어떤 비즈니스 값도 담지 않는다.
  const [resultToken, setResultToken] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [aiReportRequesting, setAiReportRequesting] = useState(false);
  const [aiReportError, setAiReportError] = useState<string | null>(null);

  const messengers = MESSENGERS_KO;

  const isUnlicensedOperating = operationChoice === "operating_unlicensed";

  // ⚠️ 결과 판정 로직 — 이번 작업에서 단 한 글자도 수정하지 않았다.
  const result: ResultTone =
    registrationStatus && premisesStatus
      ? registrationStatus === "confirmed" && premisesStatus === "secured"
        ? "possible"
        : "conditional"
      : null;
  const showResult = Boolean(operationChoice && !isUnlicensedOperating && registrationStatus && premisesStatus && hygieneFireStatus);

  // 순수 함수 기반 자체 진단이라 비동기 조회가 필요 없으므로, useEffect 없이
  // 렌더링 중 직접 계산한다.
  const diagnosis = showResult
    ? computeRestaurantDiagnosis(registrationStatus, premisesStatus, hygieneFireStatus)
    : null;

  const requiredDocs = getRequiredDocuments("register_restaurant");

  // 표시 전용 — 최종 결과 화면(가입 직후)일 때만 컨테이너 너비를 넓게 쓰기 위한 판정.
  // showResult/leadSubmitted 자체의 계산 로직(위 result/showResult)은 건드리지 않았다.
  const isResultScreen = Boolean(showResult && diagnosis && leadSubmitted);

  // "네, 있습니다" 클릭 즉시 익명으로 저장 — 기존과 동일, 수정 없음.
  function recordRejectionAnonymously() {
    const id = crypto.randomUUID();
    pendingRejectionInsertRef.current = supabase
      .from("previous_rejections")
      .insert({
        id,
        service_type: "register_restaurant",
        source_page: "/register/restaurant",
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
    setOperationChoice(null);
    setRegistrationStatus(null);
    setPremisesStatus(null);
    setHygieneFireStatus(null);
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
    setPreviousRejection(null);
    setRejectionReason("");
    setRejectionStepDone(false);
    rejectionRecordIdRef.current = null;
    pendingRejectionInsertRef.current = null;
    selfNotifySentRef.current = false;
    setResultToken(null);
    setSelectedKey(null);
    setAiReportRequesting(false);
    setAiReportError(null);
  }

  // ⚠️ CRM 저장(action/tag)·agency-confirm 이메일 트리거는 이번 작업에서 단 한 글자도
  // 수정하지 않았다. 마지막에 CHECK(TRC)/VERIFY(admin)와 동일한 auto-login→/r→/documents
  // 리다이렉트만 추가했다(요청 사항).
  async function handleAgencyRequest() {
    if (!leadId) return;
    setAgencySaving(true);
    setAgencyError(null);
    try {
      const { error } = await supabase.from("crm_activities").insert({
        lead_id: leadId,
        action: "agency_upgrade_request",
        tag: "REGISTER_RESTAURANT",
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

      if (!resultToken) {
        setAgencyError("로그인 정보를 준비하지 못했습니다. 다시 신청해주세요.");
        setAgencySaving(false);
        return;
      }
      const res = await fetch("/api/auto-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resultToken, next: "documents" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.actionLink) {
        console.error("auto-login failed:", data);
        setAgencyError("로그인 처리 중 문제가 발생했습니다. 다시 시도해주세요.");
        setAgencySaving(false);
        return;
      }
      window.location.href = data.actionLink;
    } catch {
      setAgencyError("접수 중 문제가 발생했습니다. 다시 시도해주세요.");
      setAgencySaving(false);
    }
  }

  // "AI 리포트 진행하기" — handleAgencyRequest와 동일한 Auto-login → /r → /documents
  // 흐름을 타되, next 값만 "documents_ai_report"로 달라 /documents가 mode=ai_report로
  // 열린다. CHECK(TRC)/VERIFY(admin)의 AI 리포트 버튼과 동일하게 이 시점에는 CRM을
  // 기록하지 않는다(신규 action 추가 없음).
  async function handleAiReportRequest() {
    if (!leadId) return;
    setAiReportRequesting(true);
    setAiReportError(null);
    try {
      if (!resultToken) {
        setAiReportError("로그인 정보를 준비하지 못했습니다. 다시 신청해주세요.");
        setAiReportRequesting(false);
        return;
      }
      const res = await fetch("/api/auto-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resultToken, next: "documents_ai_report" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.actionLink) {
        console.error("auto-login failed:", data);
        setAiReportError("로그인 처리 중 문제가 발생했습니다. 다시 시도해주세요.");
        setAiReportRequesting(false);
        return;
      }
      window.location.href = data.actionLink;
    } catch {
      setAiReportError("접수 중 문제가 발생했습니다. 다시 시도해주세요.");
      setAiReportRequesting(false);
    }
  }

  // ⚠️ leads/crm_activities insert 로직 — 이번 작업에서 단 한 글자도 수정하지 않았다.
  // 마지막에 /api/lead-submit 응답에서 token을 꺼내 resultToken에 저장하는 부분만
  // 추가했다(기존에도 이 API를 호출하고 있었으나 응답의 token 필드를 쓰지 않고
  // 버리고 있었다 — CHECK(TRC)/VERIFY(admin)와 동일하게 활용하도록 한 것 뿐이다).
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

    const newLeadId = crypto.randomUUID();
    const name = String(fd.get("name") || "");
    const phone = String(fd.get("phone") || "");
    const address = String(fd.get("address") || "");
    const email = (fd.get("email") as string) || "";
    const kakaoId = (fd.get("kakao_id") as string) || null;
    const zaloId = (fd.get("zalo_id") as string) || null;

    const { error } = await supabase.from("leads").insert({
      id: newLeadId,
      name,
      phone,
      address,
      email: email || null,
      kakao_id: kakaoId,
      zalo_id: zaloId,
      service_type: "register_restaurant",
      result,
      source_page: "/register/restaurant",
    });

    if (error) {
      console.error(error);
      setLeadError("접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    await supabase.from("crm_activities").insert({
      lead_id: newLeadId,
      action: "register_restaurant_diagnosis_lead",
      tag: "REGISTER_RESTAURANT",
      meta: diagnosis
        ? {
            feasibilityScore: diagnosis.feasibilityScore,
            operationChoice,
            registrationStatus,
            premisesStatus,
            hygieneFireStatus,
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
        body: JSON.stringify({ leadId: newLeadId, name, phone, email, address }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        console.error("lead-submit API error:", errBody);
      } else {
        const okBody = await res.json().catch(() => null);
        if (okBody?.token) setResultToken(okBody.token);
      }
    } catch (apiErr) {
      console.error("lead-submit fetch failed:", apiErr);
    }

    if (pendingRejectionInsertRef.current) {
      await pendingRejectionInsertRef.current;
    }
    if (rejectionRecordIdRef.current) {
      try {
        await supabase
          .from("previous_rejections")
          .update({ linked_lead_id: newLeadId })
          .eq("id", rejectionRecordIdRef.current);
      } catch (linkErr) {
        console.error("previous_rejections link failed:", linkErr);
      }
    }

    saveLeadContact({ name, phone, address, kakao_id: kakaoId, zalo_id: zaloId });
    setEmailProvided(!!email);
    setLeadId(newLeadId);
    setSubmitting(false);
    setLeadSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <div className={`mx-auto px-6 py-10 ${isResultScreen ? "max-w-5xl" : "max-w-xl"}`}>
        {/* 모바일 전용 — CHECK(TRC)/VERIFY(admin)와 동일한 브랜드 헤더 */}
        <Link
          href="/"
          className="relative -mx-6 -mt-10 mb-6 flex items-center justify-center gap-2.5 border-b border-gray-100 bg-white px-4 py-3 sm:hidden"
        >
          <span className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-1 text-xs font-medium text-gray-400">
            <ArrowLeft size={14} /> 홈으로
          </span>
          <img src="/vfbcai-shield-logo.png" alt="VFBCAI" width={34} height={34} className="shrink-0" />
          <div>
            <p className="text-[15px] font-bold leading-tight text-gray-900">VFBCAI</p>
            <p className="text-[11px] leading-tight text-gray-400">베트남 인허가전문 AI</p>
          </div>
        </Link>

        <Link href="/" className="hidden items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600 sm:inline-flex">
          <ArrowLeft size={14} /> 홈으로
        </Link>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          직접허가받기 · 베트남 인허가전문 AI
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
          식당허가 가능성 진단
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          현재 운영·등록 상태에 따라 필요서류가 달라집니다.
        </p>

        {/* 질문 1 — 타 기관 거절이력 */}
        {!rejectionStepDone && (
          <div className="mt-8">
            <QuestionSection
              step={1}
              title="이전에 다른 곳(정부기관 또는 타 대행사)에서 식당허가를 신청하셨다가 거절·반려되신 적이 있나요?"
            >
              <div className="grid grid-cols-2 gap-3">
                <SelectionCard
                  title="네, 있습니다"
                  selected={selectedKey === "rejection-yes"}
                  tone="amber"
                  onClick={() => {
                    setSelectedKey("rejection-yes");
                    setPreviousRejection(true);
                    recordRejectionAnonymously();
                  }}
                />
                <SelectionCard
                  title="아니요"
                  selected={selectedKey === "rejection-no"}
                  tone="slate"
                  onClick={() => {
                    setSelectedKey("rejection-no");
                    setPreviousRejection(false);
                    setRejectionStepDone(true);
                  }}
                />
              </div>
            </QuestionSection>
            {previousRejection === true && (
              <div className="mt-4">
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="(선택) 어떤 이유로 거절되셨는지 알려주시면 더 정확히 봐드릴 수 있습니다"
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-amber-600 focus:outline-none resize-none"
                />
                <PrimaryButton onClick={finalizeRejectionStep} variant="amber" className="mt-3">
                  다음
                </PrimaryButton>
              </div>
            )}
          </div>
        )}

        {/* 질문 2 — 현재 운영 상태 */}
        {rejectionStepDone && !operationChoice && (
          <div className="mt-8">
            <QuestionSection step={2} title="현재 식당을 어떻게 운영하고 계신가요?">
              <div className="grid grid-cols-1 gap-3">
                {OPERATION_OPTIONS.map((opt) => (
                  <SelectionCard
                    key={opt.key}
                    title={opt.label}
                    description={opt.desc || undefined}
                    selected={selectedKey === opt.key}
                    icon={opt.icon}
                    tone={opt.tone}
                    onClick={() => {
                      setSelectedKey(opt.key);
                      setOperationChoice(opt.key);
                    }}
                  />
                ))}
              </div>
            </QuestionSection>
          </div>
        )}

        {/* 무허가 영업 경고 — 정상 옵션과 동급으로 취급하지 않고 즉시 경고 화면으로 분기.
            문구·동작(다시 선택하기 / 전문가와 바로 상담하기) 전부 기존과 동일, 수정 없음. */}
        {rejectionStepDone && isUnlicensedOperating && (
          <div className="mt-8">
            <NoticeCard tone="danger" title="무허가 영업은 즉시 폐쇄될 수 있습니다">
              허가 없이 영업 중인 경우 단속 시 즉시 영업정지 또는 폐쇄 조치될
              수 있으며, 이후 정식 허가 신청에도 불이익이 있을 수 있습니다.
              가능한 빨리 허가 절차를 진행하시길 권합니다.
            </NoticeCard>
            <div className="mt-5 flex flex-col gap-3">
              <PrimaryButton
                variant="amber"
                onClick={() => {
                  setSelectedKey(null);
                  setOperationChoice(null);
                }}
              >
                다시 선택하기
              </PrimaryButton>
              <Link
                href="/consultation?case=register-restaurant-unlicensed-warning"
                className="flex h-[52px] items-center justify-center rounded-xl border border-red-600 text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors"
              >
                전문가와 바로 상담하기
              </Link>
            </div>
          </div>
        )}

        {/* 질문 3 — 사업자·법인 등록 서류 준비 */}
        {rejectionStepDone && operationChoice && !isUnlicensedOperating && !registrationStatus && (
          <div className="mt-8">
            <QuestionSection step={3} title="사업자·법인 등록 서류가 준비되어 있나요?">
              <div className="grid grid-cols-2 gap-3">
                {REGISTRATION_OPTIONS.map((opt) => (
                  <SelectionCard
                    key={opt.key}
                    title={opt.label}
                    selected={selectedKey === opt.key}
                    icon={opt.icon}
                    tone={opt.tone}
                    onClick={() => {
                      setSelectedKey(opt.key);
                      setRegistrationStatus(opt.key);
                    }}
                  />
                ))}
              </div>
            </QuestionSection>
          </div>
        )}

        {/* 질문 4 — 영업장 임대차 계약 */}
        {rejectionStepDone && registrationStatus && !premisesStatus && (
          <div className="mt-8">
            <QuestionSection step={4} title="영업장(매장) 임대차 계약을 체결하셨나요?">
              <div className="grid grid-cols-2 gap-3">
                {PREMISES_OPTIONS.map((opt) => (
                  <SelectionCard
                    key={opt.key}
                    title={opt.label}
                    selected={selectedKey === opt.key}
                    icon={opt.icon}
                    tone={opt.tone}
                    onClick={() => {
                      setSelectedKey(opt.key);
                      setPremisesStatus(opt.key);
                    }}
                  />
                ))}
              </div>
            </QuestionSection>
          </div>
        )}

        {/* 질문 5 — 위생·소방 안전시설 점검 */}
        {rejectionStepDone && registrationStatus && premisesStatus && !hygieneFireStatus && (
          <div className="mt-8">
            <QuestionSection step={5} title="위생·소방 안전시설 점검을 마치셨나요?">
              <div className="grid grid-cols-2 gap-3">
                {HYGIENE_OPTIONS.map((opt) => (
                  <SelectionCard
                    key={opt.key}
                    title={opt.label}
                    selected={selectedKey === opt.key}
                    icon={opt.icon}
                    tone={opt.tone}
                    onClick={() => {
                      setSelectedKey(opt.key);
                      setHygieneFireStatus(opt.key);
                    }}
                  />
                ))}
              </div>
            </QuestionSection>
          </div>
        )}

        {/* 결과 미리보기 + 개인정보 입력 (가입 전) — possible/conditional 공통 구조 */}
        {showResult && diagnosis && !leadSubmitted && (
          <RestaurantLeadCapture
            diagnosis={diagnosis}
            submitting={submitting}
            error={leadError}
            consentOpen={consentOpen}
            consentHighlight={consentHighlight}
            onConsentToggle={() => setConsentOpen((v) => !v)}
            onConsentChecked={() => setConsentHighlight(false)}
            onSubmit={handleLeadSubmit}
            onReset={reset}
          />
        )}

        {/* 가입 직후 — CHECK(TRC)/VERIFY(admin)와 동일한 Master UI 결과 화면:
            결과 헤더 + 5칸 개요 카드 + 중앙 요약 카드 + 3버튼(전문가/AI리포트/직접진행).
            "전문가 진행하기"는 기존 원본과 동일하게 즉시 접수하지 않고, 아래 복구된
            detailStage(진행 서류·절차 확인 단계)를 먼저 연다. */}
        {showResult && diagnosis && leadSubmitted && !agencyRequested && !detailStage && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              식당허가 · AI 분석 리포트
            </p>

            <RestaurantResultOverviewCards diagnosis={diagnosis} docCount={requiredDocs.documents.length} />

            <RestaurantResultSummaryCard diagnosis={diagnosis} />

            {diagnosis.resultTone === "conditional" && (
              <div className="mt-3">
                <NoticeCard tone="warning">
                  직접 진행 시 어려움을 겪으실 수 있습니다. 준비 서류를
                  보완하면 진행할 수 있는 경우가 많으니, 전문가 진행을
                  권장합니다.
                </NoticeCard>
              </div>
            )}

            <p className="mt-5 text-sm font-bold text-gray-900">다음 단계 선택</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-3 sm:items-stretch">
              {/* 1) 전문가 진행하기 — Primary */}
              <div className="relative flex h-full flex-col rounded-2xl border border-blue-300 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <span className="absolute -top-2.5 left-4 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
                  추천
                </span>
                <p className="mt-1 text-sm font-bold text-gray-900">전문가 진행하기</p>
                <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                  AI 사전진단 내용을 전문가가 함께 확인한 뒤 서류 준비부터
                  신청까지 도와드립니다.
                </p>
                <div className="mt-auto pt-4">
                  <PrimaryButton onClick={() => setDetailStage(true)}>
                    전문가 진행하기
                  </PrimaryButton>
                  <p className="mt-2 min-h-[32px] text-center text-[11px] text-blue-700">
                    진행 서류와 절차를 확인한 뒤 접수하는 단계로 이동합니다.
                  </p>
                </div>
              </div>

              {/* 2) AI 리포트 진행하기 */}
              <div className="relative flex h-full flex-col rounded-2xl border border-blue-100 bg-blue-50/30 p-4">
                <span className="absolute -top-2.5 left-4 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                  필수
                </span>
                <p className="mt-1 text-sm font-bold text-gray-900">AI 리포트 진행하기</p>
                <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                  자료를 제출하시면 AI가 정밀 검토 리포트를 준비합니다.
                </p>
                <div className="mt-auto pt-4">
                  <button
                    type="button"
                    onClick={handleAiReportRequest}
                    disabled={aiReportRequesting}
                    className="flex h-[52px] w-full items-center justify-center gap-1 rounded-xl border border-blue-300 bg-white text-[13px] font-semibold text-blue-800 hover:bg-blue-50 transition-colors disabled:opacity-60"
                  >
                    {aiReportRequesting ? "이동 중..." : "AI 리포트 진행하기"}
                  </button>
                  <p className="mt-2 min-h-[32px] text-center text-[11px] text-slate-500">
                    {aiReportError ? (
                      <span className="text-red-600">{aiReportError}</span>
                    ) : (
                      "이미 입력하신 정보로 바로 진행되며, 다시 입력하실 필요 없습니다."
                    )}
                  </p>
                </div>
              </div>

              {/* 3) 직접 진행하기 — 기존 공식 사이트 이동 유지 */}
              <div className="relative flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4">
                <span className="absolute -top-2.5 left-4 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
                  신중
                </span>
                <p className="mt-1 text-sm font-bold text-gray-900">직접 진행하기</p>
                <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                  공공서비스포털(Cổng Dịch vụ công quốc gia)로 이동합니다.
                  접속 후 관할 지역과 위생·소방 담당부서를 선택하시면 신청
                  메뉴를 찾으실 수 있습니다.
                </p>
                <div className="mt-auto pt-4">
                  <a
                    href={REGISTER_RESTAURANT_OFFICIAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleSelfPortalClick}
                    className="flex h-[52px] w-full items-center justify-center gap-1.5 rounded-xl border border-blue-900 bg-white text-[13px] font-semibold text-blue-900 hover:bg-blue-50 transition-colors"
                  >
                    직접 진행하기 <ExternalLink size={14} />
                  </a>
                  <p className="mt-2 min-h-[32px] text-center text-[11px] text-slate-500">
                    어느 쪽을 선택해도 서류 체크리스트는 동일하게 제공됩니다.
                  </p>
                </div>
              </div>
            </div>

            {emailProvided && (
              <p className="mt-4 text-[11px] text-gray-400">
                결과를 이메일로도 보내드렸습니다 — 메시지가 오지 않으면 이메일도 함께 확인해주세요.
              </p>
            )}

            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-blue-900" />
              입력하신 전화번호로 계정이 생성되었습니다. 비밀번호는 자동
              생성되며, 마이페이지에서 언제든 변경하실 수 있습니다.
            </div>

            {diagnosis.resultTone === "conditional" && (
              <Link
                href="/consultation?case=register-restaurant-conditional"
                className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-amber-600 px-5 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
              >
                <MessageCircle size={14} /> 지금 바로 상담하기
              </Link>
            )}

            <button onClick={reset} className="mt-6 block text-xs text-gray-400 hover:text-gray-600">
              처음부터 다시 확인하기
            </button>
          </div>
        )}

        {/* 진행 서류 및 절차 안내 (전문가 진행요청 선택 시) — 원본 그대로 복구.
            "전문가 진행요청하기 →" 버튼은 handleAgencyRequest를 그대로 호출하며,
            이 함수는 기존 CRM insert(agency_upgrade_request) 완료 직후 이어서
            auto-login → /r → /documents 리다이렉트를 실행한다(함수 자체는 수정 없음). */}
        {showResult && diagnosis && leadSubmitted && !agencyRequested && detailStage && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CheckCircle2 className="text-emerald-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">식당허가 진행 서류 및 절차</p>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold text-gray-700">① 서류 준비</p>
                <ul className="mt-2 space-y-2">
                  <li className="text-xs text-gray-600 pl-1">
                    · 사업자등록증(영업자 등록증) 사본
                  </li>
                  <li className="text-xs text-gray-600 pl-1">
                    · 영업장 임대차 계약서(공증본) 및 임대인 법적 권리 증빙
                  </li>
                  <li className="text-xs text-gray-600 pl-1">
                    · 대표자·조리 종사자 건강검진서
                  </li>
                </ul>
              </div>

              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold text-gray-700">② 시설 준비</p>
                <ul className="mt-2 space-y-2">
                  <li className="text-xs text-gray-600 pl-1">
                    · 위생안전 시설(조리·저장 공간) 자가점검
                  </li>
                  <li className="text-xs text-gray-600 pl-1">
                    · 소방시설(소화기·비상구 등) 점검 및 완비
                  </li>
                  {hygieneFireStatus === "not_ready" && (
                    <li className="text-xs text-gray-600 pl-1">
                      · 위생·소방 점검이 아직 완료되지 않아, 시설 보완 후
                      재점검이 필요할 수 있습니다 — 이 부분은 전문가 진행요청 접수 시
                      담당자가 우선 확인해드립니다.
                    </li>
                  )}
                </ul>
              </div>

              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold text-gray-700">③ 신청 절차 요약</p>
                <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                  서류 준비 → 영업장 임대차 계약 확정 → 위생안전 인증 신청·
                  발급 → 소방완비 확인 신청·발급 → 사업자등록 및 영업신고
                  완료
                </p>
                <p className="mt-2 text-[11px] text-gray-400">
                  * 위 절차는 일반적인 흐름 안내이며, 지역·업장 규모에
                  따라 순서나 요건이 달라질 수 있습니다.
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm font-bold text-gray-900">
              정확하고 문제없이 빠르게 진행하시길 원한다면 반드시 전문가와
              상의하세요.
            </p>

            {agencyError && <p className="mt-3 text-xs text-red-600">{agencyError}</p>}
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

        {/* 접수완료 화면(도장) — 원본 그대로 복구. handleAgencyRequest가 CRM insert 직후
            agencyRequested를 true로 바꾸는 즉시 이 화면이 렌더링되고, 같은 함수 안에서
            이어서 auto-login 요청이 실행되어 성공 시 /r을 거쳐 /documents로 이동한다. */}
        {showResult && diagnosis && agencyRequested && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex justify-center">
              <img src="/vfbc-seal.png" alt="VFBCAI 접수완료 확인 도장" width={160} height={160} />
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
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-700" />
              입력하신 전화번호로 계정이 생성되었습니다. 비밀번호는 자동
              생성되며, 마이페이지에서 언제든 변경하실 수 있습니다.
              거주증·노동허가·비자 등 만료 알림 서비스도 함께 이용하실 수
              있습니다.
            </div>

            {agencyError && <p className="mt-3 text-xs text-red-600">{agencyError}</p>}

            <button onClick={reset} className="mt-6 block text-xs text-gray-400 hover:text-gray-600">
              처음부터 다시 확인하기
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
