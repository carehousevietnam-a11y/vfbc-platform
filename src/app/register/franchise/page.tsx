"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Clock,
  UserCheck,
  FileText,
  Store,
  FileCheck2,
  FileWarning,
  Flame,
} from "lucide-react";
import { SelectionCard, QuestionSection, PrimaryButton, NoticeCard, InfoBox } from "@/components/ui";
import type { SelectionCardTone } from "@/components/ui/SelectionCard";
import { MESSENGERS_BY_LANGUAGE, type MessengerPair } from "@/lib/messenger";
import {
  resolveLanguage,
  validateLeadForm,
  type SupportedLanguage,
  type FieldErrors,
  LEAD_FORM_MESSAGES,
  getConsentTranslation,
  buildSocialContacts,
} from "@/lib/customerRegistrationValidation";
import { supabase } from "@/lib/supabase";
import { saveLeadContact } from "@/lib/leadContact";
import { getRequiredDocuments } from "@/lib/requiredDocuments";

// 베트남 공공서비스포털 (Cổng Dịch vụ công quốc gia).
// 프랜차이즈 등록는 관할 지역(성·시)에 따라 담당부서가 달라, 이 포털에서
// 관할 지역을 선택해 안내를 받도록 연결한다. (특정 부서 URL을 직접 지정하지 않음)
// ⚠️ 배포 전 Linda 법률 검토 필요 — URL·안내 문구 확인 후 게시할 것.
const REGISTER_FRANCHISE_OFFICIAL_URL = "https://dichvucong.gov.vn/";

type RegistrationStatus = "confirmed" | "unconfirmed" | null;
type OperatingHistoryStatus = "secured" | "unsecured" | null;
type ContractManualStatus = "ready" | "not_ready" | null;
type FranchiseChoice = "not_started" | "operating_registered" | "operating_unregistered" | null;
type ResultTone = "possible" | "conditional" | null;

const CONSENT_SUMMARY =
  "입력하신 정보로 계정이 자동 생성되며, 개인정보 수집·이용에 동의합니다.";

// CHECK(TRC)의 ConsentDetails와 100% 동일한 컴포넌트 — 문구·구조 그대로 재사용.
function ConsentDetails({
  open,
  onToggle,
  highlight,
  lang = "ko",
  messengers,
}: {
  open: boolean;
  onToggle: () => void;
  highlight?: boolean;
  lang?: SupportedLanguage;
  messengers: MessengerPair;
}) {
  const translation = getConsentTranslation(lang, messengers.primary.label, messengers.secondary.label);
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
        {open ? "▾" : "▸"} 자세히 보기 (베트남 법령 원문 · 번역)
      </button>

      {highlight && (
        <p className="mt-2 font-semibold text-red-700">
          {LEAD_FORM_MESSAGES[lang].consentRequiredWarning}
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
              địa chỉ, email, và ít nhất một ID mạng xã hội (Kakao, WeChat,
              WhatsApp hoặc Zalo — bắt buộc chọn một), nhằm mục đích tư vấn,
              hướng dẫn đăng ký và tạo tài khoản dịch vụ tự động. Dữ liệu được
              lưu trữ đến khi bạn hủy tài khoản hoặc đạt được mục đích xử lý.
              Bạn có quyền từ chối đồng ý; tuy nhiên, việc từ chối có thể
              khiến bạn không thể sử dụng một số dịch vụ (xem kết quả chẩn
              đoán, tư vấn, v.v.).
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">{translation.heading}</p>
            <p>{translation.body}</p>
            <ul className="mt-1 list-disc pl-4 space-y-0.5">
              {translation.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
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

// ── 질문 옵션 + 아이콘/톤 매핑(표시 전용) + CHECK/TRC 스타일의 한 줄 설명.
// value·키는 100% 동일하게 유지한다.
const OPERATION_OPTIONS: { key: NonNullable<FranchiseChoice>; label: string; desc: string; icon: typeof Store; tone: SelectionCardTone }[] = [
  { key: "not_started", label: "아직 가맹사업 전입니다", desc: "프랜차이즈 등록을 준비하는 단계입니다.", icon: Store, tone: "blue" },
  { key: "operating_registered", label: "등록 후 정상 운영 중입니다", desc: "현재 등록 상태를 다시 확인합니다.", icon: CheckCircle2, tone: "green" },
  { key: "operating_unregistered", label: "등록 없이 이미 운영 중입니다", desc: "미등록 운영 위험을 우선 확인합니다.", icon: AlertTriangle, tone: "red" },
];

const REGISTRATION_OPTIONS: { key: NonNullable<RegistrationStatus>; label: string; desc: string; icon: typeof FileCheck2; tone: SelectionCardTone }[] = [
  { key: "confirmed", label: "준비되어 있음", desc: "사업자 또는 법인 등록 관련 서류를 보유하고 있습니다.", icon: FileCheck2, tone: "green" },
  { key: "unconfirmed", label: "아직 미확정", desc: "사업자·법인 등록 서류를 아직 준비 중입니다.", icon: FileWarning, tone: "amber" },
];

const PREMISES_OPTIONS: { key: NonNullable<OperatingHistoryStatus>; label: string; desc: string; icon: typeof Store; tone: SelectionCardTone }[] = [
  { key: "secured", label: "확보 완료", desc: "필요한 직영점 운영 이력을 확보했습니다.", icon: Store, tone: "green" },
  { key: "unsecured", label: "아직 부족함", desc: "직영점 운영 이력이 아직 충분하지 않습니다.", icon: FileWarning, tone: "amber" },
];

const HYGIENE_OPTIONS: { key: NonNullable<ContractManualStatus>; label: string; desc: string; icon: typeof Flame; tone: SelectionCardTone }[] = [
  { key: "ready", label: "예, 준비했습니다", desc: "가맹계약서와 운영매뉴얼을 준비했습니다.", icon: CheckCircle2, tone: "green" },
  { key: "not_ready", label: "아직입니다", desc: "가맹계약서 또는 운영매뉴얼 준비가 남아 있습니다.", icon: Flame, tone: "amber" },
];

// 자체 진단 로직 (checkDiagnosis.ts 미사용, 규칙 기반) — 등록상태·영업장확보
// 여부로 점수를 계산하고, 위생·소방 준비상태는 체크리스트 항목으로만 반영한다.
// 법 조항·구체적 허가가능 여부는 단정하지 않고 "가능성" 톤을 유지한다.
// ⚠️ 이번 정밀교정 작업에서도 이 함수는 단 한 글자도 수정하지 않았다.
type FranchiseDiagnosis = {
  feasibilityScore: number;
  resultTone: "possible" | "conditional";
  checklist: { label: string; passed: boolean }[];
  note: string;
  estimatedDays: { min: number; max: number };
};

function computeFranchiseDiagnosis(
  registrationStatus: RegistrationStatus,
  operatingHistoryStatus: OperatingHistoryStatus,
  contractManualStatus: ContractManualStatus
): FranchiseDiagnosis {
  const checklist = [
    { label: "사업자·법인 등록 서류 준비", passed: registrationStatus === "confirmed" },
    { label: "직영점 운영 이력 확보", passed: operatingHistoryStatus === "secured" },
    { label: "가맹계약서·운영매뉴얼 준비", passed: contractManualStatus === "ready" },
  ];
  const passedCount = checklist.filter((c) => c.passed).length;
  const score = Math.round((passedCount / checklist.length) * 100);
  const tone: "possible" | "conditional" =
    registrationStatus === "confirmed" && operatingHistoryStatus === "secured" ? "possible" : "conditional";
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
// ⚠️ 이번 정밀교정 작업에서도 이 함수는 단 한 글자도 수정하지 않았다.
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

// ── 여기부터 신규 UI(표시 전용) — CHECK(TRC)의 실제 최신 코드(ResultOverviewCards/
// ResultHeaderGauge/ResultSummaryCard/NextStepOptions/PremiumLeadCapture)를 그대로
// 확인하여 구조·className·순서를 옮겨왔다. 값만 REGISTER(franchise) 진단 결과로 채운다.

// TRC의 PremiumLeadCapture 안 원형 게이지와 100% 동일한 마크업 — 결과 미리보기(가입 전)용.
function FranchiseScoreGauge({
  score,
  tone,
}: {
  score: number;
  tone: "possible" | "conditional";
}) {
  const isPossible = tone === "possible";
  return (
    <div className="relative flex h-[104px] w-[104px] shrink-0 items-center justify-center">
      <svg width="104" height="104" viewBox="0 0 104 104" className="absolute inset-0 -rotate-90">
        <circle cx="52" cy="52" r="46" fill="none" stroke="#E5E7EB" strokeWidth="7" />
        <circle
          cx="52"
          cy="52"
          r="46"
          fill="none"
          stroke={isPossible ? "#059669" : "#D97706"}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 46}
          strokeDashoffset={2 * Math.PI * 46 * (1 - score / 100)}
        />
      </svg>
      <div className="relative flex flex-col items-center">
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full ${
            isPossible ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          }`}
        >
          {isPossible ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
        </span>
        <strong className="mt-0.5 text-[22px] font-black leading-none text-gray-900">{score}%</strong>
        <span className={`mt-0.5 text-[10px] font-bold ${isPossible ? "text-emerald-600" : "text-amber-600"}`}>
          {isPossible ? "가능성 높음" : "추가 확인 필요"}
        </span>
      </div>
    </div>
  );
}

// TRC의 ResultHeaderGauge와 100% 동일한 SVG-native rotate 소형 배지 — 결과화면
// 단계에서만 제목(H1) 옆 모바일 전용 위치에 노출된다(TRC와 동일한 용도·크기 76px).
function ResultHeaderGauge({
  diagnosis,
  size = 104,
}: {
  diagnosis: FranchiseDiagnosis;
  size?: number;
}) {
  const isPossible = diagnosis.resultTone === "possible";
  const status = isPossible ? "가능성 높음" : "추가 확인 필요";
  const ringColor = isPossible ? "#059669" : "#D97706";
  const scale = size / 104;
  const strokeWidth = 7 * scale;
  const r = 46 * scale;
  const cx = size / 2;

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
            strokeDasharray={2 * Math.PI * r}
            strokeDashoffset={2 * Math.PI * r * (1 - diagnosis.feasibilityScore / 100)}
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
        <strong className="mt-0.5 font-black leading-none text-gray-900" style={{ fontSize: 22 * scale }}>
          {diagnosis.feasibilityScore}%
        </strong>
        <span
          className={`mt-0.5 font-bold ${isPossible ? "text-emerald-600" : "text-amber-600"}`}
          style={{ fontSize: 10 * scale }}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

// CHECK(TRC)의 ResultOverviewCards와 className·breakpoint까지 동일한 PC 5칸 그리드 /
// 모바일 세로 리스트. 위험요인 카드는 TRC와 동일하게 checklist 미충족 개수만으로
// pill 톤(문제없음=초록 / 보완필요=주황)을 자연스럽게 결정하고, 새 판정 로직은
// 추가하지 않는다.
function FranchiseResultOverviewCards({
  diagnosis,
  docCount,
}: {
  diagnosis: FranchiseDiagnosis;
  docCount: number;
}) {
  const { feasibilityScore, resultTone, checklist, estimatedDays } = diagnosis;
  const failedCount = checklist.filter((c) => !c.passed).length;

  const scoreToneLabel = resultTone === "possible" ? "높음 (HIGH)" : "보통 (MEDIUM)";
  const scoreToneWord = resultTone === "possible" ? "높습니다" : "있습니다";

  const riskPillText = failedCount > 0 ? `보완 필요 항목 ${failedCount}개` : "문제 없음";
  const riskPillTone = failedCount > 0 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700";
  const riskIconBg = failedCount > 0 ? "bg-amber-50" : "bg-emerald-50";
  const riskIconColor = failedCount > 0 ? "text-amber-600" : "text-emerald-600";

  const docsPillText = `필수 서류 ${docCount}개`;
  const daysPillText = estimatedDays ? `${estimatedDays.min}~${estimatedDays.max}일` : "안내 예정";

  const aiOpinionText = resultTone === "possible" ? "정상" : "주의";
  const aiOpinionTone =
    resultTone === "possible" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700";

  const items = [
    {
      n: 1,
      label: "허가 가능성",
      visual: <FranchiseScoreGauge score={feasibilityScore} tone={resultTone} />,
      pill: <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-800">{scoreToneLabel}</span>,
      caption: `입력하신 정보 기준으로 허가 가능성이 ${scoreToneWord}.`,
    },
    {
      n: 2,
      label: "위험요인",
      visual: (
        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${riskIconBg}`}>
          {failedCount > 0 ? (
            <AlertTriangle className={riskIconColor} size={26} />
          ) : (
            <CheckCircle2 className={riskIconColor} size={26} />
          )}
        </div>
      ),
      pill: <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${riskPillTone}`}>{riskPillText}</span>,
      caption:
        failedCount > 0
          ? "보완이 필요한 항목이 확인되었습니다."
          : "현재 확인된 위험요인이 없습니다.",
    },
    {
      n: 3,
      label: "준비서류",
      visual: (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
          <FileText className="text-blue-700" size={26} />
        </div>
      ),
      pill: <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-800">{docsPillText}</span>,
      caption: "현재 조건에 맞는 필수 서류 목록입니다.",
    },
    {
      n: 4,
      label: "예상 처리기간",
      visual: (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-50">
          <Clock className="text-violet-600" size={26} />
        </div>
      ),
      pill: <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700">{daysPillText}</span>,
      caption: "신청부터 발급까지 예상 기간 안내입니다.",
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
      caption: "베트남 인허가 전문 AI의 종합 검토 의견입니다.",
    },
  ];

  return (
    <>
      {/* PC — 5칸 가로 배치 (넓은 PC에서만 5열로 적용) */}
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

      {/* 모바일·태블릿 — 세로형 요약 리스트 */}
      <div className="mt-6 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white lg:hidden">
        {items.map((item) => (
          <div key={item.n} className="flex items-center justify-between gap-3 p-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-900 text-[10px] font-bold text-white">
                {item.n}
              </span>
              <span className="truncate text-sm font-medium text-gray-700">{item.label}</span>
            </div>
            <div className="shrink-0">
              {item.n === 1 ? (
                <span className="text-sm font-bold text-gray-900">
                  {feasibilityScore}/100{" "}
                  <span className="text-[11px] font-bold text-blue-800">{scoreToneLabel}</span>
                </span>
              ) : (
                item.pill
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// CHECK(TRC)의 buildResultSummaryText/ResultSummaryCard와 동일한 카드 셸(흰 배경·
// AI 배지·제목)을 재사용하되, 내용은 REGISTER 쪽 절대불변 함수인 buildAiReasonBullets()
// 결과만 그대로 표시한다. 새로운 AI 호출·새 문장 생성·임의 법률 판단 없음.

function FranchiseDesktopResultHeader({
  diagnosis,
}: {
  diagnosis: FranchiseDiagnosis;
}) {
  const isPossible = diagnosis.resultTone === "possible";

  return (
    <div
      className={`mt-5 hidden items-center justify-between gap-8 rounded-2xl border p-6 lg:flex ${
        isPossible
          ? "border-emerald-100 bg-emerald-50/40"
          : "border-amber-100 bg-amber-50/40"
      }`}
    >
      <div className="flex min-w-0 items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            isPossible
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {isPossible ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
            입력값 기준 1차 진단 결과
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-gray-900">
            {isPossible
              ? "프랜차이즈 등록 진행 가능성이 높습니다"
              : "프랜차이즈 등록 진행 전 추가 확인이 필요합니다"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
            {diagnosis.note}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-gray-400">
            실제 진행 가능 여부는 제출 서류와 관할기관 확인 후 최종 확정됩니다.
          </p>
        </div>
      </div>

      <ResultHeaderGauge diagnosis={diagnosis} size={112} />
    </div>
  );
}

function FranchiseResultSummaryCard({ diagnosis }: { diagnosis: FranchiseDiagnosis }) {
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

// CHECK(TRC)의 NextStepOptions와 카드 순서·배지·색상·테두리·버튼 높이·설명 문구
// 길이·모바일/PC 배열을 그대로 일치시킨 3버튼 CTA. 서비스명(프랜차이즈 등록)과 연결
// 대상(공식 사이트 URL, franchise CRM)만 Franchise에 맞게 대체했다.
// AI 리포트 버튼은 TRC 원본에는 연결이 없으나("아직 연결 없음"), REGISTER는
// VERIFY(admin)가 이미 쓰고 있는 auto-login(next=documents_ai_report) 연결을
// 그대로 재사용해 실제로 동작하도록 했다(더 완성된 패턴 채택, 새 CRM action 없음).
function FranchiseNextStepOptions({
  onSelf,
  onExpert,
  onAiReport,
  officialUrl,
  expertPending,
  expertError,
  aiReportPending,
  aiReportError,
}: {
  onSelf: () => void;
  onExpert: () => void;
  onAiReport: () => void;
  officialUrl: string;
  expertPending?: boolean;
  expertError?: string | null;
  aiReportPending?: boolean;
  aiReportError?: string | null;
}) {
  return (
    <div>
      <p className="mt-5 text-sm font-bold text-gray-900">다음 단계 선택</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-3 sm:items-stretch">
        {/* 1) AI 리포트 진행하기 — "필수" 강조 */}
        <div className="relative flex h-full flex-col rounded-2xl border border-blue-100 bg-blue-50/30 p-4">
          <span className="absolute -top-2.5 left-4 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
            필수
          </span>
          <p className="mt-1 text-sm font-bold text-gray-900">AI 리포트 진행하기</p>
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            서류를 업로드하면 AI가 분석하여 정밀 AI 리포트(PDF)를 제공합니다.
          </p>
          <ul className="mt-3 space-y-1.5">
            <li className="text-[11px] text-gray-600 pl-1">· 서류 누락 여부 확인</li>
            <li className="text-[11px] text-gray-600 pl-1">· 반려 가능 항목 분석</li>
            <li className="text-[11px] text-gray-600 pl-1">· 보완 권장 사항</li>
            <li className="text-[11px] text-gray-600 pl-1">· 예상 처리기간 및 준비 방향</li>
          </ul>
          <p className="mt-2 text-[11px] font-semibold leading-relaxed text-blue-700">
            아는 것과 모르는 것의 차이는 큽니다. 무료로 먼저 점검하세요.
          </p>
          <div className="mt-auto pt-4">
            <button
              type="button"
              onClick={onAiReport}
              disabled={aiReportPending}
              className="flex h-[52px] w-full items-center justify-center gap-1 rounded-xl border border-blue-300 bg-white text-[13px] font-semibold text-blue-800 hover:bg-blue-50 transition-colors disabled:opacity-60"
            >
              {aiReportPending ? "이동 중..." : "AI 리포트 진행하기"}
            </button>
            <p className="mt-2 min-h-[32px] text-center text-[11px] text-slate-500">
              {aiReportError ? (
                <span className="text-red-600">{aiReportError}</span>
              ) : (
                "결과는 My Page에서 PDF로 다운로드할 수 있습니다."
              )}
            </p>
          </div>
        </div>

        {/* 2) 전문가 진행하기 — 가장 강한 파란색 CTA */}
        <div className="relative flex h-full flex-col rounded-2xl border border-blue-300 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <span className="absolute -top-2.5 left-4 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
            추천
          </span>
          <p className="mt-1 text-sm font-bold text-gray-900">전문가 진행하기</p>
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            최신 법령과 실제 제출 서류를 전문가가 최종 확인하여 안전하게
            진행합니다.
          </p>
          <ul className="mt-3 space-y-1.5">
            <li className="text-[11px] text-gray-600 pl-1">· 최신 법령 및 정책 확인</li>
            <li className="text-[11px] text-gray-600 pl-1">· 제출 서류 검토 및 보완 안내</li>
            <li className="text-[11px] text-gray-600 pl-1">· 관할 기관 확인 및 진행 전략 수립</li>
            <li className="text-[11px] text-gray-600 pl-1">· 진행 대행 및 결과 안내</li>
          </ul>
          <div className="mt-auto pt-4">
            <PrimaryButton onClick={onExpert} loading={expertPending}>
              전문가 진행하기
            </PrimaryButton>
            <p className="mt-2 min-h-[32px] text-center text-[11px] text-blue-700">
              {expertError ? (
                <span className="text-red-600">{expertError}</span>
              ) : (
                "전문가가 함께하면 서류 준비 시간을 줄이고 반려 위험도 낮출 수 있습니다."
              )}
            </p>
          </div>
        </div>

        {/* 3) 직접 진행하기 — 흰색 테두리, "신중" 주의 배지 */}
        <div className="relative flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4">
          <span className="absolute -top-2.5 left-4 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
            신중
          </span>
          <p className="mt-1 text-sm font-bold text-gray-900">직접 진행하기</p>
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            정부 공식 사이트에서 직접 신청할 수 있습니다.
          </p>
          <ul className="mt-3 space-y-1.5">
            <li className="text-[11px] text-gray-600 pl-1">· 대행 비용 없이 직접 신청할 수 있습니다</li>
            <li className="text-[11px] text-gray-600 pl-1">· 베트남 행정 절차를 스스로 확인해야 합니다</li>
            <li className="text-[11px] text-gray-600 pl-1">· 서류 반려 시 재제출도 직접 진행해야 합니다</li>
            <li className="text-[11px] text-gray-600 pl-1">· 진행 상황은 정부 사이트에서 직접 확인합니다</li>
          </ul>
          <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2.5 text-[11px] leading-relaxed text-amber-800">
            개인 진행 시 신중하게 진행하셔야 합니다. 한 번 반려된 서류는
            다시 제출할 때 더 까다롭게 검토될 수 있습니다.
          </div>
          <div className="mt-auto pt-4">
            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onSelf}
              className="flex h-[52px] w-full items-center justify-center gap-1.5 rounded-xl border border-gray-300 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              정부 공식 사이트 이동 <ExternalLink size={13} />
            </a>
            <p className="mt-2 min-h-[32px] text-center text-[11px] text-slate-500">
              신청 절차와 제출 서류는 정부 사이트에서 직접 확인해야 합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// CHECK(TRC)의 PremiumLeadCapture와 100% 동일한 JSX/className 구조 — 1번째 화면
// (가입 전), 결과 미리보기 + 개인정보 입력.
function FranchiseLeadCapture({
  diagnosis,
  messengers,
  lang,
  fieldErrors,
  submitting,
  leadError,
  consentOpen,
  consentHighlight,
  onConsentToggle,
  onConsentChecked,
  onSubmit,
  onReset,
}: {
  diagnosis: FranchiseDiagnosis;
  messengers: MessengerPair;
  lang: SupportedLanguage;
  fieldErrors: FieldErrors;
  submitting: boolean;
  leadError: string | null;
  consentOpen: boolean;
  consentHighlight: boolean;
  onConsentToggle: () => void;
  onConsentChecked: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
}) {

  // [STEP22 2차] 실시간 검증 — 입력값이 바뀔 때마다 공용 검증 모듈로 재검사해서
  // 제출 버튼의 disabled 여부를 즉시 반영한다. name 속성은 그대로 두고
  // FormData 기반 제출도 그대로 유지하면서, 버튼 활성화 판단용으로만 별도 상태를 쓴다.
  const [formValues, setFormValues] = useState<{
    name: string;
    phone: string;
    address: string;
    email: string;
    kakao_id: string;
    zalo_id: string;
  }>({ name: "", phone: "", address: "", email: "", kakao_id: "", zalo_id: "" });
  const [consentChecked, setConsentChecked] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { valid: formValuesValid, errors: liveErrors } = validateLeadForm(formValues, lang);
  const canSubmit = formValuesValid && consentChecked;
  const isPossible = diagnosis.resultTone === "possible";

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
              {isPossible ? "프랜차이즈 등록 진행이 가능합니다" : "보완이 필요할 수 있습니다"}
            </p>

            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {isPossible
                ? "현재 가맹본부 등록·직영점 운영 이력 기준으로 프랜차이즈 등록 신청 요건을 충족합니다."
                : "현재 가맹본부 등록 또는 직영점 운영 이력만으로는 프랜차이즈 등록이 자동으로 진행되지 않습니다. 계약서와 운영자료를 보완하면 진행할 수 있는 경우가 많습니다."}
            </p>
          </div>

          <FranchiseScoreGauge score={diagnosis.feasibilityScore} tone={diagnosis.resultTone} />
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
            placeholder={LEAD_FORM_MESSAGES[lang].name.placeholder}
            onChange={(e) => setFormValues((v) => ({ ...v, name: e.target.value }))}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            className={`h-11 w-full rounded-lg border px-4 text-sm focus:outline-none ${
              touched.name && liveErrors.name
                ? "border-red-300 focus:border-red-400"
                : "border-gray-200 focus:border-blue-900"
            }`}
          />
          {touched.name && liveErrors.name && (
            <p className="-mt-2 text-xs text-red-600">{liveErrors.name}</p>
          )}
          <input
            type="tel"
            name="phone"
            required
            placeholder={LEAD_FORM_MESSAGES[lang].phone.placeholder}
            onChange={(e) => setFormValues((v) => ({ ...v, phone: e.target.value }))}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            className={`h-11 w-full rounded-lg border px-4 text-sm focus:outline-none ${
              touched.phone && liveErrors.phone
                ? "border-red-300 focus:border-red-400"
                : "border-gray-200 focus:border-blue-900"
            }`}
          />
          {touched.phone && liveErrors.phone && (
            <p className="-mt-2 text-xs text-red-600">{liveErrors.phone}</p>
          )}
          <input
            type="text"
            name="address"
            required
            placeholder={LEAD_FORM_MESSAGES[lang].address.placeholder}
            onChange={(e) => setFormValues((v) => ({ ...v, address: e.target.value }))}
            onBlur={() => setTouched((t) => ({ ...t, address: true }))}
            className={`h-11 w-full rounded-lg border px-4 text-sm focus:outline-none ${
              touched.address && liveErrors.address
                ? "border-red-300 focus:border-red-400"
                : "border-gray-200 focus:border-blue-900"
            }`}
          />
          {touched.address && liveErrors.address && (
            <p className="-mt-2 text-xs text-red-600">{liveErrors.address}</p>
          )}
          <input
            type="email"
            name="email"
            required
            placeholder={LEAD_FORM_MESSAGES[lang].email.placeholder}
            onChange={(e) => setFormValues((v) => ({ ...v, email: e.target.value }))}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            className={`h-11 w-full rounded-lg border px-4 text-sm focus:outline-none ${
              touched.email && liveErrors.email
                ? "border-red-300 focus:border-red-400"
                : "border-gray-200 focus:border-blue-900"
            }`}
          />
          {touched.email && liveErrors.email && (
            <p className="-mt-2 text-xs text-red-600">{liveErrors.email}</p>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              name="kakao_id"
              placeholder={`${messengers.primary.label} ID`}
              onChange={(e) => setFormValues((v) => ({ ...v, kakao_id: e.target.value }))}
              onBlur={() => setTouched((t) => ({ ...t, kakao_id: true }))}
              className={`h-11 rounded-lg border px-4 text-sm focus:outline-none ${
                (touched.kakao_id || touched.zalo_id) && liveErrors.sns
                  ? "border-red-300 focus:border-red-400"
                  : "border-gray-200 focus:border-blue-900"
              }`}
            />
            <input
              type="text"
              name="zalo_id"
              placeholder={`${messengers.secondary.label} ID`}
              onChange={(e) => setFormValues((v) => ({ ...v, zalo_id: e.target.value }))}
              onBlur={() => setTouched((t) => ({ ...t, zalo_id: true }))}
              className={`h-11 rounded-lg border px-4 text-sm focus:outline-none ${
                (touched.kakao_id || touched.zalo_id) && liveErrors.sns
                  ? "border-red-300 focus:border-red-400"
                  : "border-gray-200 focus:border-blue-900"
              }`}
            />
          </div>
          <p className={`-mt-1 text-[11px] ${(touched.kakao_id || touched.zalo_id) && liveErrors.sns ? "text-red-600" : "text-gray-400"}`}>
            {LEAD_FORM_MESSAGES[lang].sns.required}
          </p>

          <div>
            <label className="flex items-start gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                name="agreeTerms"
                onChange={(e) => {
                  if (e.target.checked) onConsentChecked();
                  setConsentChecked(e.target.checked);
                }}
                className="mt-0.5"
              />
              <span>(필수) {LEAD_FORM_MESSAGES[lang].consentSummary}</span>
            </label>
            <ConsentDetails
              open={consentOpen}
              onToggle={onConsentToggle}
              highlight={consentHighlight}
              lang={lang}
              messengers={messengers}
            />
          </div>

          {leadError && <p className="text-xs text-red-600">{leadError}</p>}

          <PrimaryButton type="submit" variant={isPossible ? "primary" : "amber"} loading={submitting} disabled={!canSubmit}>
            {submitting ? LEAD_FORM_MESSAGES[lang].submitLoadingLabel : LEAD_FORM_MESSAGES[lang].submitLabel}
          </PrimaryButton>
        </form>

        <div className="mt-3">
          <InfoBox>{LEAD_FORM_MESSAGES[lang].privacyNoticeLine}</InfoBox>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
        >
          {LEAD_FORM_MESSAGES[lang].resetLabel}
        </button>
      </div>
    </div>
  );
}

export default function RegisterFranchisePage() {
  const [franchiseChoice, setFranchiseChoice] = useState<FranchiseChoice>(null);
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>(null);
  const [operatingHistoryStatus, setOperatingHistoryStatus] = useState<OperatingHistoryStatus>(null);
  const [contractManualStatus, setContractManualStatus] = useState<ContractManualStatus>(null);

  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [emailProvided, setEmailProvided] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [consentHighlight, setConsentHighlight] = useState(false);
  const [agencySaving, setAgencySaving] = useState(false);
  const [agencyError, setAgencyError] = useState<string | null>(null);

  const [previousRejection, setPreviousRejection] = useState<boolean | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionStepDone, setRejectionStepDone] = useState(false);
  const rejectionRecordIdRef = useRef<string | null>(null);
  const pendingRejectionInsertRef = useRef<PromiseLike<void> | null>(null);
  const selfNotifySentRef = useRef(false);

  // CHECK(TRC)와 동일한 용도의 state — Q2~Q5(2개 이상 선택형 질문) 공용 클릭
  // 피드백(300ms) 키, /api/lead-submit이 발급하는 resultToken(auto-login용),
  // AI 리포트 버튼 로딩/에러 상태. previousRejection(질문1)은 TRC와 동일하게
  // selectedKey를 쓰지 않고 값 자체로 선택 상태를 판정한다(아래 렌더 참고).
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [resultToken, setResultToken] = useState<string | null>(null);
  const [aiReportPending, setAiReportPending] = useState(false);
  const [aiReportError, setAiReportError] = useState<string | null>(null);

  const [lang, setLang] = useState<SupportedLanguage>("ko");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setLang(resolveLanguage(params.get("lang")));
    }
  }, []);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const messengers = MESSENGERS_BY_LANGUAGE[lang];

  const isUnlicensedOperating = franchiseChoice === "operating_unregistered";

  // ⚠️ 결과 판정 로직 — 이번 작업에서 단 한 글자도 수정하지 않았다.
  const result: ResultTone =
    registrationStatus && operatingHistoryStatus
      ? registrationStatus === "confirmed" && operatingHistoryStatus === "secured"
        ? "possible"
        : "conditional"
      : null;
  const showResult = Boolean(franchiseChoice && !isUnlicensedOperating && registrationStatus && operatingHistoryStatus && contractManualStatus);

  // 순수 함수 기반 자체 진단이라 비동기 조회가 필요 없으므로, useEffect 없이
  // 렌더링 중 직접 계산한다.
  const diagnosis = showResult
    ? computeFranchiseDiagnosis(registrationStatus, operatingHistoryStatus, contractManualStatus)
    : null;

  const requiredDocs = getRequiredDocuments("register_franchise");

  // CHECK(TRC)의 resultScreenActive와 동일한 판정 — 결과 화면(가입 직후)에서만
  // 컨테이너 폭을 넓히기 위한 표시 전용 값. showResult/leadSubmitted 자체의
  // 계산 로직은 그대로다.
  const resultScreenActive = Boolean(showResult && diagnosis && leadSubmitted);

  // "네, 있습니다" 클릭 즉시 익명으로 저장 — 기존과 동일, 수정 없음.
  function recordRejectionAnonymously() {
    const id = crypto.randomUUID();
    pendingRejectionInsertRef.current = supabase
      .from("previous_rejections")
      .insert({
        id,
        service_type: "register_franchise",
        source_page: "/register/franchise",
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
    setFranchiseChoice(null);
    setRegistrationStatus(null);
    setOperatingHistoryStatus(null);
    setContractManualStatus(null);
    setLeadSubmitted(false);
    setLeadId(null);
    setLeadError(null);
    setEmailProvided(false);
    setConsentOpen(false);
    setConsentHighlight(false);
    setAgencySaving(false);
    setAgencyError(null);
    setPreviousRejection(null);
    setRejectionReason("");
    setRejectionStepDone(false);
    rejectionRecordIdRef.current = null;
    pendingRejectionInsertRef.current = null;
    selfNotifySentRef.current = false;
    setSelectedKey(null);
    setResultToken(null);
    setAiReportPending(false);
    setAiReportError(null);
  }

  // CHECK(TRC)의 실제 최신 코드를 직접 확인한 결과, TRC는 handleAgencyRequest(CRM
  // insert)와 handleExpertRequestClick(auto-login redirect)이 분리되어 있고, CRM
  // insert 쪽은 detailStage라는 화면을 거쳐야 도달하는데 detailStage는 어떤 버튼도
  // true로 바꾸지 않아 실제로는 도달 불가능한 죽은 코드였다. 즉 TRC의 실제 사용자
  // 흐름은 "결과 화면 → 전문가 진행하기 → 곧바로 auto-login/redirect"이며, 중간
  // 확인 화면은 없다. REGISTER는 CRM에 agency_upgrade_request를 반드시 남겨야
  // 하므로(요청 사항), 두 로직을 하나로 합쳐 TRC와 동일하게 버튼 1번 클릭으로
  // CRM 저장(액션·태그 무변경) → agency-confirm(무변경) → auto-login → /r →
  // /documents까지 곧바로 이어지도록 구성했다. 별도 확인 화면은 두지 않는다.
  async function handleExpertRequest() {
    if (!leadId) return;
    setAgencySaving(true);
    setAgencyError(null);
    try {
      const { error } = await supabase.from("crm_activities").insert({
        lead_id: leadId,
        action: "agency_upgrade_request",
        tag: "REGISTER_FRANCHISE",
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

  // "AI 리포트 진행하기" — VERIFY(admin)가 이미 쓰고 있는 auto-login(next=
  // documents_ai_report) 흐름을 그대로 재사용한다. 신규 CRM action은 추가하지
  // 않는다(요청 사항).
  async function handleAiReportRequest() {
    if (!leadId) return;
    setAiReportPending(true);
    setAiReportError(null);
    try {
      if (!resultToken) {
        setAiReportError("로그인 정보를 준비하지 못했습니다. 다시 신청해주세요.");
        setAiReportPending(false);
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
        setAiReportPending(false);
        return;
      }
      window.location.href = data.actionLink;
    } catch {
      setAiReportError("접수 중 문제가 발생했습니다. 다시 시도해주세요.");
      setAiReportPending(false);
    }
  }

  // ⚠️ leads/crm_activities insert 로직 — 이번 작업에서 단 한 글자도 수정하지 않았다.
  // /api/lead-submit 응답의 token만 resultToken에 저장한다(기존에도 호출하고 있었으나
  // 응답을 버리고 있었다 — CHECK(TRC)와 동일하게 활용하도록 한 것 뿐이다).
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

    const { valid, errors } = validateLeadForm({ name, phone, address, email, kakao_id: kakaoId, zalo_id: zaloId }, lang);
    if (!valid) {
      setFieldErrors(errors);
      setLeadError(Object.values(errors)[0] || null);
      setSubmitting(false);
      return;
    }
    setFieldErrors({});

    // [STEP22] SNS는 실제 플랫폼명을 정확히 구분해 crm_activities.meta에 별도로 남긴다.
    // 기존 kakao_id/zalo_id 컬럼(primary/secondary 슬롯)은 그대로 유지하고, DB 스키마는 바꾸지 않는다.
    const socialContacts = buildSocialContacts({
      kakaoValue: kakaoId,
      zaloValue: zaloId,
      primaryKey: messengers.primary.key,
      secondaryKey: messengers.secondary.key,
    });

    const { error } = await supabase.from("leads").insert({
      id: newLeadId,
      name,
      phone,
      address,
      email: email || null,
      kakao_id: kakaoId,
      zalo_id: zaloId,
      service_type: "register_franchise",
      result,
      source_page: "/register/franchise",
    });

    if (error) {
      console.error(error);
      setLeadError("접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    await supabase.from("crm_activities").insert({
      lead_id: newLeadId,
      action: "register_franchise_diagnosis_lead",
      tag: "REGISTER_FRANCHISE",
      meta: diagnosis
        ? {
            feasibilityScore: diagnosis.feasibilityScore,
            franchiseChoice,
            registrationStatus,
            operatingHistoryStatus,
            contractManualStatus,
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
      // [STEP22 2차] 기존 crm_activities.meta를 읽어와 socialContacts/preferredLanguage만
    // 병합한다 — 서비스마다 meta 구조가 다르므로 그 형태를 추측하지 않고, 기존 값을
    // 그대로 읽은 뒤 spread로 덮어쓰지 않고 새 키만 추가한다. 이 시점에 이 lead_id로
    // 남아있는 crm_activities 행은 방금 삽입한 진단 행 하나뿐이므로 lead_id로 최신
    // 행을 찾아 병합하면 다른 서비스의 meta 구조를 알 필요가 없다.
    const { data: existingActivity } = await supabase
      .from("crm_activities")
      .select("id, meta")
      .eq("lead_id", newLeadId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingActivity?.id) {
      const existingMeta =
        existingActivity.meta && typeof existingActivity.meta === "object" ? existingActivity.meta : {};
      await supabase
        .from("crm_activities")
        .update({ meta: { ...existingMeta, socialContacts, preferredLanguage: lang } })
        .eq("id", existingActivity.id);
    }

    const res = await fetch("/api/lead-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: newLeadId, name, phone, email, address, lang, kakao_id: kakaoId, zalo_id: zaloId }),
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
      {/* CHECK(TRC)와 동일하게 결과 화면은 법인설립 Master Size인 max-w-4xl을 사용한다.
          질문/개인정보 입력 단계는 기존과 동일한 max-w-xl을 유지한다. */}
      <div className={`mx-auto px-6 py-10 ${resultScreenActive ? "max-w-4xl" : "max-w-xl"}`}>
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

        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              직접허가받기 · 베트남 인허가전문 AI
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
              프랜차이즈 등록 가능성 진단
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              현재 운영·등록 상태에 따라 필요서류가 달라집니다.
            </p>
          </div>

          {/* 모바일 전용 — 결과 화면 단계에서만 우측 상단에 원형 점수표 표시(TRC와 동일) */}
          {resultScreenActive && diagnosis && (
            <div className="shrink-0 sm:hidden">
              <ResultHeaderGauge diagnosis={diagnosis} size={76} />
            </div>
          )}
        </div>

        {/* 질문 1 — 타 기관 거절이력. CHECK(TRC)와 동일하게 selectedKey를 쓰지 않고
            previousRejection 값 자체로 선택 상태를 판정한다(충돌·소실 방지). */}
        {!rejectionStepDone && (
          <div className="mt-8">
            <QuestionSection
              step={1}
              title="이전에 다른 곳(정부기관 또는 타 대행사)에서 프랜차이즈 등록를 신청하셨다가 거절·반려되신 적이 있나요?"
            >
              <div className="grid grid-cols-2 gap-3">
                <SelectionCard
                  title="네, 있습니다"
                  description="이전 신청에서 거절 또는 반려된 경험이 있습니다."
                  selected={previousRejection === true}
                  tone="amber"
                  onClick={() => {
                    setPreviousRejection(true);
                    recordRejectionAnonymously();
                  }}
                />
                <SelectionCard
                  title="아니요"
                  description="이번이 첫 신청이거나 거절·반려 이력이 없습니다."
                  selected={previousRejection === false}
                  tone="blue"
                  onClick={() => {
                    setPreviousRejection(false);
                    setRejectionStepDone(true);
                  }}
                />
              </div>
            </QuestionSection>

            {/* CHECK(TRC)와 동일한 AI 안내카드 + textarea — 선택은 사항이며, 카드
                선택 상태(previousRejection===true)는 입력 중에도 계속 유지된다. */}
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
                      작성해주세요. 작성하지 않으셔도 다음 단계로 진행할 수
                      있습니다.
                    </p>
                  </div>
                </div>

                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={
                    "예)\n- 직영점 운영 이력이 부족하다고 들었습니다.\n- 가맹계약서 또는 운영매뉴얼 보완을 요구받았습니다.\n- 정확한 이유를 듣지 못했습니다.\n\n자유롭게 작성해주세요(선택)."
                  }
                  rows={6}
                  className="mt-3 min-h-[160px] w-full resize-none rounded-xl border-2 border-gray-300 bg-white px-4 py-3.5 text-sm leading-relaxed placeholder:text-gray-400 focus:border-[#1D4EDB] focus:outline-none"
                />
                <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
                  작성해주신 내용은 AI가 거절 원인을 분석하고 해결 가능성을
                  높이는 데 활용됩니다.
                </p>

                <PrimaryButton onClick={finalizeRejectionStep} className="mt-3">
                  다음
                </PrimaryButton>
              </div>
            )}
          </div>
        )}

        {/* 질문 2 — 현재 운영 상태. CHECK Master UI의 3개 선택지 실제 배열 기준
            그대로(grid-cols-1, 반응형 2열 강제 없음) 적용. */}
        {rejectionStepDone && !franchiseChoice && (
          <div className="mt-8">
            <QuestionSection step={2} title="현재 가맹사업을 어떻게 운영하고 계신가요?">
              <div className="grid grid-cols-1 gap-3">
                {OPERATION_OPTIONS.map((opt) => (
                  <SelectionCard
                    key={opt.key}
                    title={opt.label}
                    description={opt.desc}
                    selected={selectedKey === opt.key}
                    icon={opt.icon}
                    tone={opt.tone}
                    onClick={() => {
                      setSelectedKey(opt.key);
                      setTimeout(() => {
                        setFranchiseChoice(opt.key);
                        setSelectedKey(null);
                      }, 300);
                    }}
                  />
                ))}
              </div>
            </QuestionSection>

            <button
              type="button"
              onClick={() => {
                setSelectedKey(null);
                setRejectionStepDone(false);
              }}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={14} /> 이전 단계로
            </button>
          </div>
        )}

        {/* 무허가 영업 경고 — 정상 옵션과 동급으로 취급하지 않고 즉시 경고 화면으로
            분기. 문구·동작 전부 기존과 동일, 수정 없음. */}
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
                  setFranchiseChoice(null);
                }}
              >
                다시 선택하기
              </PrimaryButton>
              <Link
                href="/consultation?case=register-franchise-unlicensed-warning"
                className="flex h-[52px] items-center justify-center rounded-xl border border-red-600 text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors"
              >
                전문가와 바로 상담하기
              </Link>
            </div>
          </div>
        )}

        {/* 질문 3 — 사업자·법인 등록 서류 준비 (모바일 2열 유지 — Franchise 확정 요구사항) */}
        {rejectionStepDone && franchiseChoice && !isUnlicensedOperating && !registrationStatus && (
          <div className="mt-8">
            <QuestionSection step={3} title="사업자·법인(가맹본부) 등록 서류가 준비되어 있나요?">
              <div className="grid grid-cols-2 gap-3">
                {REGISTRATION_OPTIONS.map((opt) => (
                  <SelectionCard
                    key={opt.key}
                    title={opt.label}
                    description={opt.desc}
                    selected={selectedKey === opt.key}
                    icon={opt.icon}
                    tone={opt.tone}
                    onClick={() => {
                      setSelectedKey(opt.key);
                      setTimeout(() => {
                        setRegistrationStatus(opt.key);
                        setSelectedKey(null);
                      }, 300);
                    }}
                  />
                ))}
              </div>
            </QuestionSection>

            <button
              type="button"
              onClick={() => {
                setSelectedKey(null);
                setFranchiseChoice(null);
              }}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={14} /> 이전 단계로
            </button>
          </div>
        )}

        {/* 질문 4 — 영업장 임대차 계약 (모바일 2열 유지) */}
        {rejectionStepDone && registrationStatus && !operatingHistoryStatus && (
          <div className="mt-8">
            <QuestionSection step={4} title="직영점 운영 이력을 확보하셨나요?">
              <div className="grid grid-cols-2 gap-3">
                {PREMISES_OPTIONS.map((opt) => (
                  <SelectionCard
                    key={opt.key}
                    title={opt.label}
                    description={opt.desc}
                    selected={selectedKey === opt.key}
                    icon={opt.icon}
                    tone={opt.tone}
                    onClick={() => {
                      setSelectedKey(opt.key);
                      setTimeout(() => {
                        setOperatingHistoryStatus(opt.key);
                        setSelectedKey(null);
                      }, 300);
                    }}
                  />
                ))}
              </div>
            </QuestionSection>

            <button
              type="button"
              onClick={() => {
                setSelectedKey(null);
                setRegistrationStatus(null);
              }}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={14} /> 이전 단계로
            </button>
          </div>
        )}

        {/* 질문 5 — 위생·소방 안전시설 점검 (모바일 2열 유지) */}
        {rejectionStepDone && registrationStatus && operatingHistoryStatus && !contractManualStatus && (
          <div className="mt-8">
            <QuestionSection step={5} title="가맹계약서와 운영매뉴얼을 준비하셨나요?">
              <div className="grid grid-cols-2 gap-3">
                {HYGIENE_OPTIONS.map((opt) => (
                  <SelectionCard
                    key={opt.key}
                    title={opt.label}
                    description={opt.desc}
                    selected={selectedKey === opt.key}
                    icon={opt.icon}
                    tone={opt.tone}
                    onClick={() => {
                      setSelectedKey(opt.key);
                      setTimeout(() => {
                        setContractManualStatus(opt.key);
                        setSelectedKey(null);
                      }, 300);
                    }}
                  />
                ))}
              </div>
            </QuestionSection>

            <button
              type="button"
              onClick={() => {
                setSelectedKey(null);
                setOperatingHistoryStatus(null);
              }}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={14} /> 이전 단계로
            </button>
          </div>
        )}

        {/* 결과 미리보기 + 개인정보 입력 (가입 전) — CHECK(TRC)의 PremiumLeadCapture와
            동일한 구조. possible/conditional 공통. */}
        {showResult && diagnosis && !leadSubmitted && (
          <FranchiseLeadCapture
            diagnosis={diagnosis}
            messengers={messengers}
            lang={lang}
            fieldErrors={fieldErrors}
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

        {/* 가입 직후 — CHECK(TRC)와 동일한 카드 셸(제목 라벨 → 5칸 개요 → 요약카드 →
            3버튼 CTA → 안내문 → 처음부터 다시 확인하기) 순서 그대로. 별도의 긴
            중간 확인화면은 두지 않는다(TRC 실제 흐름과 동일 — 위 handleExpertRequest
            주석 참고). */}
        {showResult && diagnosis && leadSubmitted && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              프랜차이즈 등록 · AI 분석 리포트
            </p>

            <FranchiseDesktopResultHeader diagnosis={diagnosis} />

            <FranchiseResultOverviewCards diagnosis={diagnosis} docCount={requiredDocs.documents.length} />

            <FranchiseResultSummaryCard diagnosis={diagnosis} />

            {diagnosis.resultTone === "conditional" && (
              <div className="mt-3">
                <NoticeCard tone="warning">
                  직접 진행 시 어려움을 겪으실 수 있습니다. 준비 서류를
                  보완하면 진행할 수 있는 경우가 많으니, 전문가 진행을
                  권장합니다.
                </NoticeCard>
              </div>
            )}

            <FranchiseNextStepOptions
              onSelf={handleSelfPortalClick}
              onExpert={handleExpertRequest}
              onAiReport={handleAiReportRequest}
              officialUrl={REGISTER_FRANCHISE_OFFICIAL_URL}
              expertPending={agencySaving}
              expertError={agencyError}
              aiReportPending={aiReportPending}
              aiReportError={aiReportError}
            />
            <p className="mt-2 text-[11px] text-gray-400">
              공공서비스포털(Cổng Dịch vụ công quốc gia)의 프랜차이즈 등록 절차 안내
              페이지로 이동합니다. 구비서류·수수료·처리기간을 확인하실 수
              있습니다.
            </p>

            {emailProvided && (
              <p className="mt-2 text-[11px] text-gray-400">
                결과를 이메일로도 보내드렸습니다 — 메시지가 오지 않으면
                이메일도 함께 확인해주세요.
              </p>
            )}

            <button onClick={reset} className="mt-4 block text-xs text-gray-400 hover:text-gray-600">
              처음부터 다시 확인하기
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
