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
import FunnelPageHeader from "@/components/engine/FunnelPageHeader";
import FunnelPageShell from "@/components/engine/FunnelPageShell";
import { FUNNEL_QUESTION_COLUMN } from "@/components/engine/funnelTokens";
import {
  NoticeCard,
  OfficialBasisPanel,
  OfficialTrustZone,
  PrimaryButton,
  InfoBox,
  QuestionSection,
  SelectionCard,
  VerifyStepLayout,
} from "@/components/ui";
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
import { recordAiReportRequestAndNotify } from "@/lib/aiReportRequest";
import { saveLeadContact } from "@/lib/leadContact";
import {
  isLoggedInMember,
  loadRegisterMemberEntryState,
  submitMemberRegisterLead,
  type RestoredRegisterLead,
} from "@/lib/restoreRegisterLead";
import {
  establishBrowserSessionFromResultToken,
  ensureBrowserSessionForResultToken,
} from "@/lib/restoreCheckLead";
import { getRequiredDocuments } from "@/lib/requiredDocuments";
import {
  MasterFunnelLanding,
  type MasterFunnelContextTab,
  MASTER_LANDING_RESTAURANT,
} from "@/components/cost-check/MasterFunnelLanding";

// 베트남 공공서비스포털 (Cổng Dịch vụ công quốc gia).
// 식당허가(위생안전·소방)는 관할 지역(성·시)에 따라 담당부서가 달라, 이 포털에서
// 관할 지역을 선택해 안내를 받도록 연결한다. (특정 부서 URL을 직접 지정하지 않음)
// ⚠️ 배포 전 Linda 법률 검토 필요 — URL·안내 문구 확인 후 게시할 것.
const REGISTER_RESTAURANT_OFFICIAL_URL = "https://dichvucong.gov.vn/";

const REGISTER_QUESTION_CONTEXT = "식당허가 준비 상태 확인";
const REGISTER_BACK_BUTTON_CLASS =
  "mt-4 inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-medium text-[#64748B] transition-colors hover:text-[#0B2A6B]";

type RegistrationStatus = "confirmed" | "unconfirmed" | null;
type PremisesStatus = "secured" | "unsecured" | null;
type HygieneFireStatus = "ready" | "not_ready" | null;
type OperationChoice = "not_open" | "operating_licensed" | "operating_unlicensed" | null;
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
const OPERATION_OPTIONS: { key: NonNullable<OperationChoice>; label: string; desc: string; icon: typeof Store; tone: SelectionCardTone }[] = [
  { key: "not_open", label: "아직 오픈 전입니다", desc: "영업 시작 전, 허가 신청을 준비하고 있습니다.", icon: Store, tone: "blue" },
  { key: "operating_licensed", label: "허가를 받고 정상 운영 중입니다", desc: "필요한 허가를 갖춘 상태로 운영 중입니다.", icon: CheckCircle2, tone: "green" },
  { key: "operating_unlicensed", label: "허가 없이 이미 영업 중입니다", desc: "허가 절차를 마치지 못한 채 영업 중입니다.", icon: AlertTriangle, tone: "red" },
];

const REGISTRATION_OPTIONS: { key: NonNullable<RegistrationStatus>; label: string; desc: string; icon: typeof FileCheck2; tone: SelectionCardTone }[] = [
  { key: "confirmed", label: "준비되어 있음", desc: "사업자·법인 등록 관련 서류를 보유하고 있습니다.", icon: FileCheck2, tone: "green" },
  { key: "unconfirmed", label: "아직 미확정", desc: "사업자·법인 등록 서류 준비가 아직 남아 있습니다.", icon: FileWarning, tone: "amber" },
];

const PREMISES_OPTIONS: { key: NonNullable<PremisesStatus>; label: string; desc: string; icon: typeof Store; tone: SelectionCardTone }[] = [
  { key: "secured", label: "체결 완료", desc: "영업장 임대차 계약을 마쳤습니다.", icon: Store, tone: "green" },
  { key: "unsecured", label: "아직 미체결", desc: "영업장 계약·장소가 아직 확정되지 않았습니다.", icon: FileWarning, tone: "amber" },
];

const HYGIENE_OPTIONS: { key: NonNullable<HygieneFireStatus>; label: string; desc: string; icon: typeof Flame; tone: SelectionCardTone }[] = [
  { key: "ready", label: "예, 완료했습니다", desc: "위생·소방 시설 준비와 점검을 마쳤습니다.", icon: CheckCircle2, tone: "green" },
  { key: "not_ready", label: "아직입니다", desc: "위생·소방 시설 준비 또는 점검이 남아 있습니다.", icon: Flame, tone: "amber" },
];

// 자체 진단 로직 (checkDiagnosis.ts 미사용, 규칙 기반) — 등록상태·영업장확보
// 여부로 점수를 계산하고, 위생·소방 준비상태는 체크리스트 항목으로만 반영한다.
// 법 조항·구체적 허가가능 여부는 단정하지 않고 "가능성" 톤을 유지한다.
// ⚠️ 이번 정밀교정 작업에서도 이 함수는 단 한 글자도 수정하지 않았다.
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
// 확인하여 구조·className·순서를 옮겨왔다. 값만 REGISTER(restaurant) 진단 결과로 채운다.

// TRC의 PremiumLeadCapture 안 원형 게이지와 100% 동일한 마크업 — 결과 미리보기(가입 전)용.
function RestaurantScoreGauge({
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
  diagnosis: RestaurantDiagnosis;
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
function RestaurantResultOverviewCards({
  diagnosis,
  docCount,
}: {
  diagnosis: RestaurantDiagnosis;
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
      visual: <RestaurantScoreGauge score={feasibilityScore} tone={resultTone} />,
      pill: <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-800">{scoreToneLabel}</span>,
      caption: `입력하신 준비 상태 기준으로 허가 가능성이 ${scoreToneWord}.`,
    },
    {
      n: 2,
      label: "보완 조건",
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
          ? "신청 전 보완이 필요한 조건이 확인되었습니다."
          : "현재 입력 기준에서 확인된 보완 조건은 없습니다.",
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
      caption: "식당허가 신청에 맞춰 안내하는 필수 서류입니다.",
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
      caption: "유사 사례 기준의 통상 소요 기간 안내입니다.",
    },
    {
      n: 5,
      label: "AI 확인 의견",
      visual: (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <UserCheck className="text-gray-700" size={26} />
        </div>
      ),
      pill: <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${aiOpinionTone}`}>{aiOpinionText}</span>,
      caption: "공식 절차·요건을 참고한 인허가전문 AI 확인 의견입니다.",
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

function RestaurantDesktopResultHeader({
  diagnosis,
}: {
  diagnosis: RestaurantDiagnosis;
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
            입력 조건 기준 확인 결과
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-gray-900">
            {isPossible
              ? "식당허가 진행 가능성이 높습니다"
              : "식당허가 진행 전 추가 확인이 필요합니다"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
            {diagnosis.note}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-gray-400">
            최종 진행 가능 여부는 제출 서류와 관할기관 확인 후 확정됩니다.
          </p>
        </div>
      </div>

      <ResultHeaderGauge diagnosis={diagnosis} size={112} />
    </div>
  );
}

function RestaurantResultSummaryCard({ diagnosis }: { diagnosis: RestaurantDiagnosis }) {
  const bullets = buildAiReasonBullets(
    diagnosis.feasibilityScore,
    diagnosis.resultTone,
    diagnosis.checklist,
    diagnosis.estimatedDays
  );

  const sectionTitles = ["현재 판단", "준비·보완 조건", "예상 소요"];
  return (
    <OfficialBasisPanel
      engine="register"
      sections={bullets.map((description, index) => ({
        title: sectionTitles[index] ?? `확인 항목 ${index + 1}`,
        description,
      }))}
    />
  );
}

// CHECK(TRC)의 NextStepOptions와 카드 순서·배지·색상·테두리·버튼 높이·설명 문구
// 길이·모바일/PC 배열을 그대로 일치시킨 3버튼 CTA. 서비스명(식당허가)과 연결
// 대상(공식 사이트 URL, restaurant CRM)만 Restaurant에 맞게 대체했다.
// AI 리포트 버튼은 TRC 원본에는 연결이 없으나("아직 연결 없음"), REGISTER는
// VERIFY(admin)가 이미 쓰고 있는 auto-login(next=documents_ai_report) 연결을
// 그대로 재사용해 실제로 동작하도록 했다(더 완성된 패턴 채택, 새 CRM action 없음).
function RestaurantNextStepOptions({
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
      <p className="mt-5 text-sm font-bold text-gray-900">다음으로 진행할 방법을 선택하세요</p>
      <p className="mt-1 break-keep text-xs leading-[1.55] text-[#64748B]">
        확인 결과를 바탕으로, 분석 정리 · 전문가 진행 · 정부 사이트 직접 신청 중 선택합니다.
      </p>
      <div className="mt-3 grid gap-4 sm:grid-cols-3 sm:items-stretch">
        {/* 1) AI 리포트 — 핸들러·목적지 변경 없음 */}
        <div className="relative flex h-full flex-col rounded-2xl border border-[#0B2A6B] bg-white p-4 shadow-[0_1px_3px_rgba(11,42,107,0.08)]">
          <span className="absolute -top-2.5 left-4 rounded-full bg-[#0B2A6B] px-2.5 py-0.5 text-[10px] font-bold text-white">
            필수
          </span>
          <p className="mt-1 text-sm font-bold text-gray-900">AI 리포트 진행하기</p>
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            입력 정보와 서류를 바탕으로, 공식 기준에 맞춰 확인 결과를 정리한 리포트(PDF)를
            받을 수 있습니다.
          </p>
          <ul className="mt-3 space-y-1.5">
            <li className="text-[11px] text-gray-600 pl-1">· 서류 누락 여부 확인</li>
            <li className="text-[11px] text-gray-600 pl-1">· 반려 가능 항목 점검</li>
            <li className="text-[11px] text-gray-600 pl-1">· 보완 권장 사항</li>
            <li className="text-[11px] text-gray-600 pl-1">· 예상 처리기간 및 준비 방향</li>
          </ul>
          <p className="mt-2 text-[11px] font-semibold leading-relaxed text-[#0B2A6B]">
            서류 기준으로 먼저 정리하면 이후 진행이 수월해집니다.
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
                "결과는 My Page에서 PDF로 확인할 수 있습니다."
              )}
            </p>
          </div>
        </div>

        {/* 2) 전문가 진행하기 — 핸들러·목적지 변경 없음 */}
        <div className="relative flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4">
          <span className="absolute -top-2.5 left-4 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
            추천
          </span>
          <p className="mt-1 text-sm font-bold text-gray-900">전문가 진행하기</p>
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            VFBCAI 전문가팀이 실제 절차와 제출 서류를 확인하며 함께 진행합니다.
          </p>
          <ul className="mt-3 space-y-1.5">
            <li className="text-[11px] text-gray-600 pl-1">· 공식 절차·요건 기준 확인</li>
            <li className="text-[11px] text-gray-600 pl-1">· 제출 서류 검토 및 보완 안내</li>
            <li className="text-[11px] text-gray-600 pl-1">· 관할 기관 확인 및 진행 방향 정리</li>
            <li className="text-[11px] text-gray-600 pl-1">· 진행 대행 및 결과 안내</li>
          </ul>
          <div className="mt-auto pt-4">
            <PrimaryButton onClick={onExpert} loading={expertPending}>
              전문가 진행하기
            </PrimaryButton>
            <p className="mt-2 min-h-[32px] text-center text-[11px] text-slate-500">
              {expertError ? (
                <span className="text-red-600">{expertError}</span>
              ) : (
                "확인 결과 + 제출 서류 → 전문가 진행으로 이어집니다."
              )}
            </p>
          </div>
        </div>

        {/* 3) 직접 진행하기 — "신중" */}
        <div className="relative flex h-full flex-col rounded-2xl border border-gray-100 bg-[#FAFBFC] p-4">
          <span className="absolute -top-2.5 left-4 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
            신중
          </span>
          <p className="mt-1 text-sm font-bold text-gray-900">직접 진행하기</p>
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            정부 공식 사이트에서 관할·절차를 확인한 뒤 식당허가를 직접 신청합니다.
          </p>
          <ul className="mt-3 space-y-1.5">
            <li className="text-[11px] text-gray-600 pl-1">· 대행 없이 공식 경로로 직접 신청</li>
            <li className="text-[11px] text-gray-600 pl-1">· 인허가 절차·요건을 스스로 확인</li>
            <li className="text-[11px] text-gray-600 pl-1">· 서류 반려 시 재제출도 직접 진행</li>
            <li className="text-[11px] text-gray-600 pl-1">· 진행 상황은 정부 사이트에서 확인</li>
          </ul>
          <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2.5 text-[11px] leading-relaxed text-amber-800">
            직접 진행 시 제출·보완도 직접 처리합니다. 반려 이력은 이후 심사에 영향을 줄 수
            있습니다.
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
              신청 절차·제출 서류는 정부 사이트에서 직접 확인해야 합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// CHECK(TRC)의 PremiumLeadCapture와 100% 동일한 JSX/className 구조 — 1번째 화면
// (가입 전), 결과 미리보기 + 개인정보 입력.
function RestaurantLeadCapture({
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
  diagnosis: RestaurantDiagnosis;
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
              {isPossible ? "식당허가 진행이 가능합니다" : "보완이 필요할 수 있습니다"}
            </p>

            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {isPossible
                ? "현재 사업자등록·영업장 준비 상태 기준으로 식당허가(위생안전·소방) 신청 요건에 가깝습니다."
                : "현재 사업자등록 또는 영업장 준비 상태만으로는 신청이 바로 이어지기 어렵습니다. 준비 서류를 보완하면 진행할 수 있는 경우가 많습니다."}
            </p>
          </div>

          <RestaurantScoreGauge score={diagnosis.feasibilityScore} tone={diagnosis.resultTone} />
        </div>

        <p className="mt-2 text-xs leading-relaxed text-gray-400">
          * 위 결과는 입력하신 조건을 기준으로 한 확인 안내입니다. 정확한
          진행 가능 여부는 서류 검토와 관할기관 확인 후 확정됩니다.
        </p>

        <div className="mt-4">
          <NoticeCard tone={isPossible ? "success" : "warning"}>
            이름·연락처·주소만 남기시면 다음 단계에서 서류 기준 확인 리포트를
            이어갈 수 있습니다.
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

export default function RegisterRestaurantPage() {
  const [contextTab, setContextTab] = useState<MasterFunnelContextTab>("lookup");
  const [costEntryDone, setCostEntryDone] = useState(false);
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
  const [agencySaving, setAgencySaving] = useState(false);
  const [agencyError, setAgencyError] = useState<string | null>(null);

  const [previousRejection, setPreviousRejection] = useState<boolean | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionStepDone, setRejectionStepDone] = useState(false);
  const rejectionRecordIdRef = useRef<string | null>(null);
  const pendingRejectionInsertRef = useRef<PromiseLike<void> | null>(null);
  const selfNotifySentRef = useRef(false);
  const [restoreRegisterPending, setRestoreRegisterPending] = useState(true);
  const [skipSignup, setSkipSignup] = useState(false);
  const [restoredLeadActive, setRestoredLeadActive] = useState(false);
  const [restoredResultTone, setRestoredResultTone] = useState<ResultTone | null>(null);
  const memberLeadStartedRef = useRef(false);

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
      // Guide 「내 상황 확인하기」 → 기존 질문 플로우(Q1) 직행 (랜딩 스킵)
      if (params.get("start") === "check") {
        setCostEntryDone(true);
      }
    }
  }, []);

  function applyRestoredRegister(restored: RestoredRegisterLead) {
    setCostEntryDone(true);
    setRejectionStepDone(true);
    setLeadSubmitted(true);
    setLeadId(restored.leadId);
    setResultToken(restored.resultToken);
    setRestoredResultTone(restored.resultTone as ResultTone);
    setRestoredLeadActive(true);
    const meta = restored.meta;
    if (meta) {
      if (meta.operationChoice) setOperationChoice(meta.operationChoice as OperationChoice);
      if (meta.registrationStatus) setRegistrationStatus(meta.registrationStatus as RegistrationStatus);
      if (meta.premisesStatus) setPremisesStatus(meta.premisesStatus as PremisesStatus);
      if (meta.hygieneFireStatus) setHygieneFireStatus(meta.hygieneFireStatus as HygieneFireStatus);
      const pr = meta.previousRejection;
      if (pr && typeof pr === "object" && "rejected" in pr) {
        const rejected = (pr as { rejected: boolean }).rejected;
        if (rejected === true) {
          setPreviousRejection(true);
          const reason = (pr as { reason?: string | null }).reason;
          if (typeof reason === "string") setRejectionReason(reason);
        } else if (rejected === false) {
          setPreviousRejection(false);
        }
      }
    }
  }

  async function handleLandingContinue() {
    const { loggedIn, restored } = await loadRegisterMemberEntryState(
      "register_restaurant",
      "register_restaurant_diagnosis_lead",
      { allowRestore: true }
    );
    if (loggedIn) setSkipSignup(true);
    if (restored) {
      applyRestoredRegister(restored);
      return;
    }
    setContextTab("lookup");
    setCostEntryDone(true);
  }

  useEffect(() => {
    let cancelled = false;

    async function applyMemberEntryState() {
      const params = new URLSearchParams(window.location.search);
      const allowRestore = params.get("restore") === "1";
      const { loggedIn, restored } = await loadRegisterMemberEntryState(
        "register_restaurant",
        "register_restaurant_diagnosis_lead",
        { allowRestore }
      );
      if (cancelled) return;
      if (loggedIn) setSkipSignup(true);
      if (restored) applyRestoredRegister(restored);
    }

    async function initMemberState() {
      try {
        await applyMemberEntryState();
      } finally {
        if (!cancelled) setRestoreRegisterPending(false);
      }
    }

    void initMemberState();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN") return;
      // 세션 확립 시 회원가입 생략만 — mount restore(?restore=1)와 분리
      void isLoggedInMember().then((loggedIn) => {
        if (!cancelled && loggedIn) setSkipSignup(true);
      });
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const messengers = MESSENGERS_BY_LANGUAGE[lang];
  const registerQuestionProps = {
    variant: "verify" as const,
    contextLabel: REGISTER_QUESTION_CONTEXT,
    totalSteps: 5,
  };

  const isUnlicensedOperating = operationChoice === "operating_unlicensed";

  // ⚠️ 결과 판정 로직 — 이번 작업에서 단 한 글자도 수정하지 않았다.
  const result: ResultTone =
    registrationStatus && premisesStatus
      ? registrationStatus === "confirmed" && premisesStatus === "secured"
        ? "possible"
        : "conditional"
      : null;
  const showResult = Boolean(operationChoice && !isUnlicensedOperating && registrationStatus && premisesStatus && hygieneFireStatus);
  const canShowResults = restoredLeadActive || showResult;
  const activeResult: ResultTone = restoredLeadActive ? restoredResultTone : result;

  // 순수 함수 기반 자체 진단이라 비동기 조회가 필요 없으므로, useEffect 없이
  // 렌더링 중 직접 계산한다.
  const diagnosis = canShowResults
    ? computeRestaurantDiagnosis(registrationStatus, premisesStatus, hygieneFireStatus)
    : null;

  const requiredDocs = getRequiredDocuments("register_restaurant");

  // CHECK(TRC)의 resultScreenActive와 동일한 판정 — 결과 화면(가입 직후)에서만
  // 컨테이너 폭을 넓히기 위한 표시 전용 값. showResult/leadSubmitted 자체의
  // 계산 로직은 그대로다.
  const resultScreenActive = Boolean(canShowResults && diagnosis && leadSubmitted);

  useEffect(() => {
    if (
      !skipSignup ||
      restoredLeadActive ||
      leadSubmitted ||
      !showResult ||
      !diagnosis ||
      (result !== "possible" && result !== "conditional") ||
      memberLeadStartedRef.current
    ) {
      return;
    }
    memberLeadStartedRef.current = true;
    let cancelled = false;
    (async () => {
      setSubmitting(true);
      setLeadError(null);
      const created = await submitMemberRegisterLead({
        serviceType: "register_restaurant",
        sourcePage: "/register/restaurant",
        result,
        diagnosisAction: "register_restaurant_diagnosis_lead",
        tag: "REGISTER_RESTAURANT",
        meta: {
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
        },
        lang,
        primaryMessengerKey: messengers.primary.key,
        secondaryMessengerKey: messengers.secondary.key,
        rejectionRecordId: rejectionRecordIdRef.current,
        pendingRejectionInsert: pendingRejectionInsertRef.current,
      });
      if (cancelled) return;
      if (!created.ok) {
        memberLeadStartedRef.current = false;
        if (created.reason === "no_contact" && !(await isLoggedInMember())) {
          setSkipSignup(false);
        } else {
          setLeadError("결과 준비 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
        setSubmitting(false);
        return;
      }
      setLeadId(created.leadId);
      setResultToken(created.resultToken);
      setLeadSubmitted(true);
      setSubmitting(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [
    skipSignup,
    restoredLeadActive,
    leadSubmitted,
    showResult,
    diagnosis,
    result,
    operationChoice,
    registrationStatus,
    premisesStatus,
    hygieneFireStatus,
    previousRejection,
    rejectionReason,
    lang,
    messengers.primary.key,
    messengers.secondary.key,
  ]);

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
    setCostEntryDone(false);
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
    setRestoredLeadActive(false);
    setRestoredResultTone(null);
    setSkipSignup(false);
    void isLoggedInMember().then((loggedIn) => {
      if (loggedIn) setSkipSignup(true);
    });
    memberLeadStartedRef.current = false;
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

      if (restoredLeadActive) {
        window.location.href = "/mypage";
        return;
      }
      const hasSession = await ensureBrowserSessionForResultToken(resultToken);
      if (!resultToken && !hasSession) {
        setAgencyError("로그인 정보를 준비하지 못했습니다. 다시 신청해주세요.");
        setAgencySaving(false);
        return;
      }
      if (hasSession) {
        window.location.href = `/documents?leadId=${encodeURIComponent(leadId)}&service=register_restaurant&mode=expert`;
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
      if (restoredLeadActive) {
        window.location.href = "/mypage";
        return;
      }
      const hasSession = await ensureBrowserSessionForResultToken(resultToken);
      if (!resultToken && !hasSession) {
        setAiReportError("로그인 정보를 준비하지 못했습니다. 다시 신청해주세요.");
        setAiReportPending(false);
        return;
      }
      recordAiReportRequestAndNotify({
          leadId,
          tag: "REGISTER_RESTAURANT",
          token: resultToken ?? undefined,
        });

      if (hasSession) {
        window.location.href = `/documents?leadId=${encodeURIComponent(leadId)}&service=register_restaurant&mode=ai_report`;
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
        setLeadError(
          (typeof errBody?.message === "string" && errBody.message) ||
            "접수 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
        );
        setSubmitting(false);
        return;
      }

      const okBody = await res.json().catch(() => null);
      if (typeof okBody?.token !== "string") {
        setLeadError("로그인 세션을 준비하지 못했습니다. 잠시 후 다시 시도해주세요.");
        setSubmitting(false);
        return;
      }

      setResultToken(okBody.token);

      const sessionReady = await establishBrowserSessionFromResultToken(okBody.token);
      if (!sessionReady) {
        setLeadError("로그인 세션 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
        setSubmitting(false);
        return;
      }
    } catch (apiErr) {
      console.error("lead-submit fetch failed:", apiErr);
      setLeadError("접수 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
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

  // 3-tab / Cost / Review / Guide 는 초기 랜딩(!costEntryDone)에서만.
  // Q1 진입(costEntryDone) 이후에는 절대 렌더하지 않는다.
  const showLandingChrome = !costEntryDone;
  const headerTitle = showLandingChrome
    ? contextTab === "review"
      ? "인허가 적정성 검토"
      : contextTab === "direct"
        ? "식당 인허가 안내"
        : "식당허가 비용 확인"
    : "식당허가 준비 상태 확인";
  const headerDescription = showLandingChrome
    ? contextTab === "review"
      ? "현재 받은 안내나 견적이 식당 인허가에 필요한 절차와 비용 기준에 맞는지 확인합니다."
      : contextTab === "direct"
        ? "식당 인허가의 기본 절차·준비 항목·추가 절차 가능성을 확인합니다."
        : "정부 수수료와 시장 대행료를 먼저 확인한 뒤, 준비 상태를 직접 확인합니다."
    : "사업자·영업장·위생·소방 준비 상태를 기준으로 신청 방향을 안내합니다.";

  function startSituationCheck() {
    void handleLandingContinue();
  }

  return (
    <FunnelPageShell
      engine="register"
      width={showLandingChrome || resultScreenActive ? "wide" : "default"}
    >
        <FunnelPageHeader
          engine="register"
          title={headerTitle}
          description={headerDescription}
          headerExtra={
            resultScreenActive && diagnosis ? (
              <div className="sm:hidden">
                <ResultHeaderGauge diagnosis={diagnosis} size={76} />
              </div>
            ) : undefined
          }
        />

        {restoreRegisterPending && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 text-center text-sm text-gray-500">
            이전 결과를 확인하는 중…
          </div>
        )}

        {!restoreRegisterPending && showLandingChrome && (
          <MasterFunnelLanding
            config={MASTER_LANDING_RESTAURANT}
            activeTab={contextTab}
            onTabChange={setContextTab}
            onContinue={startSituationCheck}
          />
        )}

        {!restoreRegisterPending && costEntryDone && !rejectionStepDone && (
          <div className="mt-4 sm:mt-5">
            <VerifyStepLayout
              engine="register"
              step={1}
              question={
                <>
                  <QuestionSection
                    step={1}
                    title="이전에 식당허가를 신청했다가 거절·반려된 적이 있나요?"
                    description="현재 상황에 맞춰 확인하기 위해 필요한 항목입니다. 이력이 있으면 보완 포인트를 더 정확히 짚을 수 있습니다."
                    {...registerQuestionProps}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <SelectionCard
                        variant="quiet"
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
                        variant="quiet"
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

            {previousRejection === true && (
              <div className="mt-4">
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-3">
                  <p className="text-sm font-semibold text-[#0B2A6B]">
                    거절·반려 사유를 알려주시면 공식 기준 확인에 반영됩니다.
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#556070]">
                    이전에 들으셨던 사유나 안내를 자유롭게 적어 주세요. 비워 두셔도
                    다음 단계로 진행할 수 있습니다.
                  </p>
                </div>

                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={
                    "예)\n- 사업자등록 서류가 미비하다고 들었습니다.\n- 위생·소방 점검을 통과하지 못했습니다.\n- 정확한 이유를 듣지 못했습니다.\n\n자유롭게 작성해주세요(선택)."
                  }
                  rows={6}
                  className="mt-3 min-h-[160px] w-full resize-none rounded-xl border-2 border-gray-300 bg-white px-4 py-3.5 text-sm leading-relaxed placeholder:text-gray-400 focus:border-[#1D4EDB] focus:outline-none"
                />
                <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
                  작성해주신 내용은 공식 기준 확인·거절 원인 점검에 활용됩니다.
                </p>

                <PrimaryButton onClick={finalizeRejectionStep} className="mt-3">
                  다음
                </PrimaryButton>
              </div>
            )}
                </>
              }
              actions={
                <button
                  type="button"
                  onClick={() => {
                    setPreviousRejection(null);
                    setRejectionReason("");
                    setCostEntryDone(false);
                  }}
                  className={REGISTER_BACK_BUTTON_CLASS}
                >
                  <ArrowLeft size={14} /> 비용·기준으로 돌아가기
                </button>
              }
            />
          </div>
        )}

        {/* 질문 2 — 현재 운영 상태 */}
        {!restoreRegisterPending && costEntryDone && rejectionStepDone && !restoredLeadActive && !operationChoice && (
          <div className="mt-4 sm:mt-5">
            <VerifyStepLayout
              engine="register"
              step={2}
              question={
                <QuestionSection
                  step={2}
                  title="현재 식당을 어떻게 운영하고 계신가요?"
                  description="운영 단계에 따라 확인해야 할 허가·준비 항목이 달라집니다."
                  {...registerQuestionProps}
                >
                  <div className="grid grid-cols-1 gap-3">
                    {OPERATION_OPTIONS.map((opt) => (
                      <SelectionCard
                        key={opt.key}
                        variant="quiet"
                        title={opt.label}
                        description={opt.desc}
                        selected={selectedKey === opt.key}
                        icon={opt.icon}
                        tone={opt.tone}
                        onClick={() => {
                          setSelectedKey(opt.key);
                          setTimeout(() => {
                            setOperationChoice(opt.key);
                            setSelectedKey(null);
                          }, 300);
                        }}
                      />
                    ))}
                  </div>
                </QuestionSection>
              }
              actions={
                <button
                  type="button"
                  onClick={() => {
                    setSelectedKey(null);
                    setRejectionStepDone(false);
                  }}
                  className={REGISTER_BACK_BUTTON_CLASS}
                >
                  <ArrowLeft size={14} /> 이전 단계로
                </button>
              }
            />
          </div>
        )}

        {/* 무허가 영업 경고 — 정상 옵션과 동급으로 취급하지 않고 즉시 경고 화면으로
            분기. 문구·동작 전부 기존과 동일, 수정 없음. */}
        {!restoreRegisterPending && costEntryDone && rejectionStepDone && !restoredLeadActive && isUnlicensedOperating && (
          <div className={`mt-8 ${FUNNEL_QUESTION_COLUMN}`}>
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

        {/* 질문 3 — 사업자·법인 등록 서류 준비 (모바일 2열 유지) */}
        {!restoreRegisterPending && costEntryDone && rejectionStepDone && !restoredLeadActive && operationChoice && !isUnlicensedOperating && !registrationStatus && (
          <div className="mt-4 sm:mt-5">
            <VerifyStepLayout
              engine="register"
              step={3}
              question={
                <QuestionSection
                  step={3}
                  title="사업자·법인 등록 서류가 준비되어 있나요?"
                  description="식당허가 신청에 앞서 확인하는 기본 등록 서류입니다."
                  {...registerQuestionProps}
                >
                  <div className="grid grid-cols-2 gap-3">
                    {REGISTRATION_OPTIONS.map((opt) => (
                      <SelectionCard
                        key={opt.key}
                        variant="quiet"
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
              }
              actions={
                <button
                  type="button"
                  onClick={() => {
                    setSelectedKey(null);
                    setOperationChoice(null);
                  }}
                  className={REGISTER_BACK_BUTTON_CLASS}
                >
                  <ArrowLeft size={14} /> 이전 단계로
                </button>
              }
            />
          </div>
        )}

        {/* 질문 4 — 영업장 임대차 계약 (모바일 2열 유지) */}
        {!restoreRegisterPending && costEntryDone && rejectionStepDone && !restoredLeadActive && registrationStatus && !premisesStatus && (
          <div className="mt-4 sm:mt-5">
            <VerifyStepLayout
              engine="register"
              step={2}
              question={
                <QuestionSection
                  step={4}
                  title="영업장(매장) 임대차 계약을 체결하셨나요?"
                  description="허가 신청 시 확인할 영업장 확보 상태입니다."
                  {...registerQuestionProps}
                >
                  <div className="grid grid-cols-2 gap-3">
                    {PREMISES_OPTIONS.map((opt) => (
                      <SelectionCard
                        key={opt.key}
                        variant="quiet"
                        title={opt.label}
                        description={opt.desc}
                        selected={selectedKey === opt.key}
                        icon={opt.icon}
                        tone={opt.tone}
                        onClick={() => {
                          setSelectedKey(opt.key);
                          setTimeout(() => {
                            setPremisesStatus(opt.key);
                            setSelectedKey(null);
                          }, 300);
                        }}
                      />
                    ))}
                  </div>
                </QuestionSection>
              }
              actions={
                <button
                  type="button"
                  onClick={() => {
                    setSelectedKey(null);
                    setRegistrationStatus(null);
                  }}
                  className={REGISTER_BACK_BUTTON_CLASS}
                >
                  <ArrowLeft size={14} /> 이전 단계로
                </button>
              }
            />
          </div>
        )}

        {/* 질문 5 — 위생·소방 안전시설 점검 (모바일 2열 유지) */}
        {!restoreRegisterPending && costEntryDone && rejectionStepDone && !restoredLeadActive && registrationStatus && premisesStatus && !hygieneFireStatus && (
          <div className="mt-4 sm:mt-5">
            <VerifyStepLayout
              engine="register"
              step={4}
              question={
                <QuestionSection
                  step={5}
                  title="위생·소방 안전시설 점검을 마치셨나요?"
                  description="식당허가(위생안전·소방) 관련 시설 준비 상태를 확인합니다."
                  {...registerQuestionProps}
                >
                  <div className="grid grid-cols-2 gap-3">
                    {HYGIENE_OPTIONS.map((opt) => (
                      <SelectionCard
                        key={opt.key}
                        variant="quiet"
                        title={opt.label}
                        description={opt.desc}
                        selected={selectedKey === opt.key}
                        icon={opt.icon}
                        tone={opt.tone}
                        onClick={() => {
                          setSelectedKey(opt.key);
                          setTimeout(() => {
                            setHygieneFireStatus(opt.key);
                            setSelectedKey(null);
                          }, 300);
                        }}
                      />
                    ))}
                  </div>
                </QuestionSection>
              }
              actions={
                <button
                  type="button"
                  onClick={() => {
                    setSelectedKey(null);
                    setPremisesStatus(null);
                  }}
                  className={REGISTER_BACK_BUTTON_CLASS}
                >
                  <ArrowLeft size={14} /> 이전 단계로
                </button>
              }
            />
          </div>
        )}

        {/* 결과 미리보기 + 개인정보 입력 (가입 전) */}
        {!restoreRegisterPending &&
          costEntryDone &&
          canShowResults &&
          (activeResult === "possible" || activeResult === "conditional") &&
          !leadSubmitted &&
          skipSignup && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 text-center text-sm text-gray-500">
            기존 회원 정보로 결과를 준비하는 중…
          </div>
        )}

        {!restoreRegisterPending && costEntryDone && showResult && diagnosis && !leadSubmitted && !skipSignup && (
          <RestaurantLeadCapture
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

        {/* 가입 직후 — judgment → official basis → conditions → prep → next actions */}
        {!restoreRegisterPending && costEntryDone && canShowResults && diagnosis && leadSubmitted && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#94A3B8]">
              식당허가
            </p>
            <p className="mt-1 text-[11px] font-semibold text-[#2563EB]">확인 결과</p>
            <p className="mt-1.5 break-keep text-[13px] leading-[1.55] text-[#556070]">
              입력하신 준비 상태를 공식 인허가 절차·요건에 맞춰 정리한 결과입니다.
            </p>

            <RestaurantDesktopResultHeader diagnosis={diagnosis} />

            <RestaurantResultOverviewCards diagnosis={diagnosis} docCount={requiredDocs.documents.length} />

            <RestaurantResultSummaryCard diagnosis={diagnosis} />

            <OfficialTrustZone engine="register" variant="strip" context="diagnosis" className="mt-4" />

            {diagnosis.resultTone === "conditional" && (
              <div className="mt-3">
                <NoticeCard tone="warning">
                  직접 진행 시 어려움을 겪으실 수 있습니다. 준비 서류를
                  보완하면 진행할 수 있는 경우가 많으니, 전문가 진행을
                  권장합니다.
                </NoticeCard>
              </div>
            )}

            <RestaurantNextStepOptions
              onSelf={handleSelfPortalClick}
              onExpert={handleExpertRequest}
              onAiReport={handleAiReportRequest}
              officialUrl={REGISTER_RESTAURANT_OFFICIAL_URL}
              expertPending={agencySaving}
              expertError={agencyError}
              aiReportPending={aiReportPending}
              aiReportError={aiReportError}
            />
            <p className="mt-2 text-[11px] text-gray-400">
              공공서비스포털(Cổng Dịch vụ công quốc gia)의 식당허가 절차 안내
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
    </FunnelPageShell>
  );
}
