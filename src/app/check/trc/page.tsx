"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  UserCheck,
} from "lucide-react";
import {
  MasterFunnelLanding,
  type MasterFunnelContextTab,
  MASTER_LANDING_TRC,
} from "@/components/cost-check/MasterFunnelLanding";
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
import { recordAgencyUpgradeAndNotify } from "@/lib/agencyUpgradeRequest";
import { recordAiReportRequestAndNotify } from "@/lib/aiReportRequest";
import { supabase } from "@/lib/supabase";
import { saveLeadContact } from "@/lib/leadContact";
import {
  establishBrowserSessionFromResultToken,
  isLoggedInMember,
  loadCheckMemberEntryState,
  submitMemberCheckLead,
} from "@/lib/restoreCheckLead";
import FunnelPageHeader from "@/components/engine/FunnelPageHeader";
import FunnelPageShell from "@/components/engine/FunnelPageShell";
import {
  NoticeCard,
  OfficialBasisPanel,
  OfficialTrustZone,
  PrimaryButton,
  InfoBox,
  QuestionSection,
  SelectionCard,
  VerifyAnswerGrid,
  VerifyStepLayout,
} from "@/components/ui";
import {
  getCheckDiagnosis,
  computeTrcResultTone,
  type DiagnosisResult,
  type ResultTone,
  type TrcNationality,
  type TrcVisa,
  type TrcRole,
  type TrcCompany,
} from "@/lib/checkDiagnosis";

// 거주증(TRC)은 출입국 전자비자 포털(evisa) 소관이 아니라
// 공안부 공공서비스포털을 통해 접수됩니다. (2026-07 확인 완료)
const TRC_OFFICIAL_URL =
  "https://dichvucong.bocongan.gov.vn/bocongan/bothutuc/tthc?matt=26285";

// 기존 "거주증(TRC) 신청에 필요한 서류" 목록과 동일한 4개 항목 — 값 변경 없이
// 새 결과화면의 "3 준비서류 안내" 카드에서 개수 표시용으로만 재사용한다.
const TRC_REQUIRED_DOCUMENTS = [
  "여권 사본 (인적사항 페이지)",
  "현재 비자 사본",
  "재직증명서 또는 노동계약서",
  "회사 사업자등록증 사본",
];

const CHECK_QUESTION_CONTEXT = "거주증 (TRC) 가능성 진단";
const CHECK_BACK_BUTTON_CLASS =
  "mt-4 inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-medium text-[#64748B] transition-colors hover:text-[#0B2A6B]";

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

// 승인된 목업 기준 — 결과 화면 상단 5개 카드(가능성 점수/위험요인 분석/
// 준비서류 안내/예상 처리기간/AI 검토 의견). 값은 전부 기존 진단 데이터
// (diagnosis.customerView) 및 기존 서류 목록에서만 가져오며, 새로운
// 점수·판정 계산은 하지 않는다. PC는 5칸 가로 배치, 모바일은 세로형
// 요약 리스트로 별도 렌더링한다(sm 기준 분기).
function ResultOverviewCards({
  diagnosis,
  docCount,
}: {
  diagnosis: DiagnosisResult;
  docCount: number;
}) {
  const { feasibilityScore, resultTone, checklist, estimatedDays } = diagnosis.customerView;
  const failedCount = checklist.filter((c) => !c.passed).length;

  const scoreToneLabel =
    resultTone === "possible" ? "높음 (HIGH)" : resultTone === "conditional" ? "보통 (MEDIUM)" : "낮음 (LOW)";
  const scoreToneWord =
    resultTone === "possible" ? "높습니다" : resultTone === "conditional" ? "있습니다" : "낮습니다";

  const riskPillText = failedCount > 0 ? `보완 필요 항목 ${failedCount}개` : "문제 없음";
  const riskPillTone = failedCount > 0 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700";

  const docsPillText = `필수 서류 ${docCount}개`;

  const daysPillText = estimatedDays ? `${estimatedDays.min}~${estimatedDays.max}일` : "안내 예정";

  const aiOpinionText =
    resultTone === "possible" ? "정상" : resultTone === "conditional" ? "주의" : "확인필요";
  const aiOpinionTone =
    resultTone === "possible"
      ? "bg-emerald-50 text-emerald-700"
      : resultTone === "conditional"
      ? "bg-amber-50 text-amber-700"
      : "bg-red-50 text-red-700";

  const items = [
    {
      n: 1,
      label: "가능성 점수",
      visual: <ScoreGauge score={feasibilityScore} tone={resultTone} />,
      pill: <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-800">{scoreToneLabel}</span>,
      caption: `입력하신 정보 기준으로 발급 가능성이 ${scoreToneWord}.`,
    },
    {
      n: 2,
      label: "위험요인 분석",
      visual: (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
          <AlertTriangle className="text-amber-600" size={26} />
        </div>
      ),
      pill: <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${riskPillTone}`}>{riskPillText}</span>,
      caption: "거절·보완 가능성이 있는 항목이 확인되었습니다.",
    },
    {
      n: 3,
      label: "준비서류 안내",
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
      label: "종합 확인 의견",
      visual: (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <UserCheck className="text-gray-700" size={26} />
        </div>
      ),
      pill: <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${aiOpinionTone}`}>{aiOpinionText}</span>,
      caption: "공식 행정 기준을 참고한 1차 확인 의견입니다.",
    },
  ];

  return (
    <>
      {/* PC — 5칸 가로 배치 */}
      <div className="mt-6 hidden overflow-hidden rounded-2xl border border-gray-100 bg-white sm:grid sm:grid-cols-5 sm:divide-x sm:divide-gray-100">
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

      {/* 모바일 — 세로형 요약 리스트 */}
      <div className="mt-6 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white sm:hidden">
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

// 결과 화면 헤더용 원형 점수표 — 개인정보 입력 화면(PremiumLeadCapture)의 게이지와
// 동일한 스타일. 값은 기존 diagnosis.customerView에서만 가져오며 새로운 점수
// 계산은 하지 않는다. size는 배치되는 위치에 맞게 비율 조정용(px)이다.
function ResultHeaderGauge({
  diagnosis,
  size = 104,
}: {
  diagnosis: DiagnosisResult;
  size?: number;
}) {
  const { feasibilityScore, resultTone } = diagnosis.customerView;
  const isPossible = resultTone === "possible";
  const status = isPossible ? "가능성 높음" : "추가 확인 필요";
  const ringColor = isPossible ? "#059669" : resultTone === "conditional" ? "#D97706" : "#DC2626";
  const scale = size / 104;
  const strokeWidth = 7 * scale;
  const r = 46 * scale;
  const cx = size / 2;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
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
            strokeDashoffset={2 * Math.PI * r * (1 - feasibilityScore / 100)}
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
        <strong
          className="mt-0.5 font-black leading-none text-gray-900"
          style={{ fontSize: 22 * scale }}
        >
          {feasibilityScore}%
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

      <OfficialBasisPanel engine="check" sections={aiReasonSections} />

      <div className={`mt-3 rounded-xl ${boxBg} px-4 py-3 text-xs ${boxText}`}>
        <p className="font-bold">💡 안내사항</p>
        <p className="mt-1">{note}</p>
      </div>
    </div>
  );
}

// AI 분석 결과 요약 — 기존 진단 데이터(점수/톤/체크리스트/예상기간)만으로
// 2~3문장의 자연스러운 요약문을 구성. 새 점수 계산이나 진단 로직은 없음.
function buildResultSummaryText(
  resultTone: "possible" | "conditional" | "impossible",
  checklist: { label: string; passed: boolean }[],
  estimatedDays: { min: number; max: number } | null
): string {
  const toneText =
    resultTone === "possible"
      ? "높은"
      : resultTone === "conditional"
      ? "있으나 보완이 필요한"
      : "낮은";
  const failed = checklist.filter((c) => !c.passed);

  const sentence1 = `입력하신 정보를 기준으로 거주증 발급 가능성은 ${toneText} 것으로 확인되었습니다.`;

  let sentence2: string;
  if (failed.length > 0) {
    const names = failed.slice(0, 2).map((c) => c.label).join(", ");
    sentence2 =
      failed.length > 2
        ? `${names} 등 ${failed.length}개 항목에서 보완이 필요한 것으로 확인되었으며, 현재 조건에 맞는 필수 서류 준비가 필요합니다.`
        : `${names} 항목에서 보완이 필요한 것으로 확인되었으며, 현재 조건에 맞는 필수 서류 준비가 필요합니다.`;
  } else {
    sentence2 = "현재 입력하신 조건에서는 특별히 보완이 필요한 항목이 확인되지 않았습니다.";
  }

  const sentence3 = estimatedDays
    ? `예상 처리기간은 약 ${estimatedDays.min}~${estimatedDays.max}일이며, 제출 전 서류를 다시 확인하는 것을 권장합니다.`
    : "제출 전 서류를 다시 확인하는 것을 권장합니다.";

  return `${sentence1} ${sentence2} ${sentence3}`;
}

function buildCheckOfficialBasisSections(diagnosis: DiagnosisResult) {
  const { feasibilityScore, resultTone, checklist, estimatedDays } = diagnosis.customerView;
  const aiReasonBullets = buildAiReasonBullets(
    feasibilityScore,
    resultTone,
    checklist,
    estimatedDays,
  );
  const passedItems = checklist.filter((c) => c.passed).map((c) => c.label);
  const metRequirementsText =
    passedItems.length > 0
      ? `${passedItems.join(", ")} 항목을 충족하셨습니다.`
      : "현재 입력하신 정보 기준으로 충족된 항목이 없습니다.";
  const processingTimeText = estimatedDays
    ? `예상 처리기간은 ${estimatedDays.min}~${estimatedDays.max}일이며, 준비 서류와 관할 기관에 따라 달라질 수 있습니다.`
    : null;

  return [
    { title: "기본 요건 충족", description: metRequirementsText },
    { title: "확인이 필요한 사항", description: aiReasonBullets[1] ?? aiReasonBullets[0] },
    ...(processingTimeText
      ? [{ title: "처리기간 참고", description: processingTimeText }]
      : []),
  ];
}

function CheckDiagnosisHeader() {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#94A3B8]">
        거주증 (TRC)
      </p>
      <p className="mt-1 text-[11px] font-semibold text-[#2563EB]">1차 확인</p>
      <p className="mt-1.5 break-keep text-[13px] leading-[1.55] text-[#556070] [overflow-wrap:normal]">
        입력하신 조건을 베트남 공식 행정 기준으로 확인한 결과입니다.
      </p>
    </div>
  );
}

function CheckResultOfficialSection({ diagnosis }: { diagnosis: DiagnosisResult }) {
  const sections = buildCheckOfficialBasisSections(diagnosis);
  const { resultTone, checklist, estimatedDays } = diagnosis.customerView;
  const summaryText = buildResultSummaryText(resultTone, checklist, estimatedDays);
  const failed = checklist.filter((c) => !c.passed);
  const conditionsText =
    failed.length > 0
      ? failed.length > 2
        ? `${failed
            .slice(0, 2)
            .map((c) => c.label)
            .join(", ")} 등 ${failed.length}개 항목은 제출 전 추가 확인이 필요합니다.`
        : `${failed.map((c) => c.label).join(", ")} 항목은 제출 전 추가 확인이 필요합니다.`
      : "현재 입력 조건 기준으로 추가 확인이 필요한 항목은 확인되지 않았습니다.";

  return (
    <>
      {/* 결과 위계: 판단 → 공식 기준 → 확인 조건 */}
      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5">
        <p className="text-[11px] font-semibold tracking-tight text-[#0B2A6B]">현재 판단</p>
        <p className="mt-1.5 break-keep text-[13px] leading-[1.55] text-gray-700 [overflow-wrap:normal]">
          {summaryText}
        </p>
        <div className="mt-3 border-t border-gray-200 pt-3">
          <p className="text-[11px] font-semibold tracking-tight text-[#0B2A6B]">확인이 필요한 조건</p>
          <p className="mt-1.5 break-keep text-[13px] leading-[1.55] text-[#64748B] [overflow-wrap:normal]">
            {conditionsText}
          </p>
        </div>
      </div>
      <OfficialBasisPanel engine="check" sections={sections} className="mt-4" />
    </>
  );
}

// 다음 단계 선택 — 승인된 목업 기준 순서: AI 리포트 요청하기 → 전문가 진행하기
// → 직접 진행하기. onSelf·onExpert는 기존 핸들러 그대로 재사용, 로직 변경 없음.
// AI 리포트 버튼은 이번 단계에서 API·PDF·상담 페이지 어디와도 연결하지 않는다.
function NextStepOptions({
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
      <p className="mt-1 text-xs leading-snug text-[#64748B]">
        확인 결과를 바탕으로, 분석 정리 · 전문가 진행 · 정부 사이트 직접 신청 중 선택합니다.
      </p>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-stretch">
        {/* 1) AI 리포트 — 핸들러·목적지 변경 없음 */}
        <div className="relative flex h-full min-w-0 flex-col rounded-2xl border border-[#0B2A6B] bg-white px-3 py-3 shadow-[0_1px_3px_rgba(11,42,107,0.08)] sm:px-3.5 sm:py-3.5">
          <span className="absolute -top-2.5 left-3 rounded-full bg-[#0B2A6B] px-2.5 py-0.5 text-[10px] font-bold text-white sm:left-3.5">
            필수
          </span>
          <p className="mt-0.5 text-sm font-bold leading-snug text-gray-900">AI 리포트 요청하기</p>
          <p className="mt-1.5 flex-1 text-xs leading-snug text-gray-500">
            입력 정보와 서류를 바탕으로, 공식 행정 기준에 맞춰 확인 결과를 정리한 리포트(PDF)를 받을 수 있습니다.
          </p>
          <div className="mt-auto pt-3">
            <PrimaryButton onClick={onAiReport} loading={aiReportPending}>
              {aiReportPending ? "이동 중..." : "AI 리포트 요청하기"}
            </PrimaryButton>
            <p className="mt-1.5 text-center text-[11px] leading-snug text-slate-500">
              {aiReportError ? (
                <span className="text-red-600">{aiReportError}</span>
              ) : (
                "서류 제출 → 리포트 정리 → My Page PDF 순으로 이어집니다."
              )}
            </p>
          </div>
        </div>

        {/* 2) 전문가 진행 — 핸들러·목적지 변경 없음 */}
        <div className="relative flex h-full min-w-0 flex-col rounded-2xl border border-gray-200 bg-white px-3 py-3 sm:px-3.5 sm:py-3.5">
          <span className="absolute -top-2.5 left-3 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white sm:left-3.5">
            추천
          </span>
          <p className="mt-0.5 text-sm font-bold leading-snug text-gray-900">전문가 진행하기</p>
          <p className="mt-1.5 flex-1 text-xs leading-snug text-gray-500">
            VFBCAI 전문가팀이 실제 절차와 제출 서류를 확인하며 함께 진행합니다.
          </p>
          <div className="mt-auto pt-3">
            <PrimaryButton variant="outline" onClick={onExpert} loading={expertPending}>
              전문가 진행 요청하기
            </PrimaryButton>
            <p className="mt-1.5 text-center text-[11px] leading-snug text-slate-500">
              {expertError ? (
                <span className="text-red-600">{expertError}</span>
              ) : (
                "확인 결과 + 제출 서류 → 전문가 진행으로 이어집니다."
              )}
            </p>
          </div>
        </div>

        {/* 3) 직접 진행 — 핸들러·URL 변경 없음 */}
        <div className="relative flex h-full min-w-0 flex-col rounded-2xl border border-gray-100 bg-[#FAFBFC] px-3 py-3 sm:px-3.5 sm:py-3.5">
          <span className="absolute -top-2.5 left-3 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white sm:left-3.5">
            신중
          </span>
          <p className="mt-0.5 text-sm font-bold leading-snug text-gray-900">직접 진행하기</p>
          <p className="mt-1.5 flex-1 text-xs leading-snug text-gray-500">
            정부 공식 사이트(공안부 공공서비스포털)에서 거주증(TRC) 신청을 직접 진행합니다.
          </p>
          <div className="mt-2 rounded-xl bg-amber-50 px-2.5 py-2 text-[11px] leading-snug text-amber-800">
            직접 진행 시 제출·보완도 직접 처리합니다. 반려 이력은 이후 심사에 영향을 줄 수 있습니다.
          </div>
          <div className="mt-auto pt-3">
            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onSelf}
              className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 shadow-none transition-colors hover:bg-gray-50"
            >
              정부 공식 사이트 이동 <ExternalLink size={13} />
            </a>
            <p className="mt-1.5 text-center text-[11px] leading-snug text-slate-500">
              신청 절차·제출 서류는 정부 사이트에서 직접 확인합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PremiumLeadCapture({
  tone,
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
  tone: "possible" | "conditional";
  diagnosis: DiagnosisResult | null;
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
  const isPossible = tone === "possible";
  const score = diagnosis?.customerView.feasibilityScore ?? (isPossible ? 92 : 74);
  const status = isPossible ? "가능성 높음" : "추가 확인 필요";

  return (
    <div>
      <div className="mt-8">
        <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#94A3B8]">
          1차 확인 결과
        </p>
        <h2 className="mt-1.5 break-keep text-[17px] font-semibold tracking-tight text-[#0B2A6B] sm:text-[18px]">
          입력하신 조건을 공식 행정 기준으로 확인했습니다
        </h2>
        <p className="mt-1 break-keep text-[12.5px] leading-[1.55] text-[#556070] [overflow-wrap:normal]">
          아래 판단·공식 기준을 먼저 확인하신 뒤, 상세 결과 저장·안내를 위한 연락 정보를
          입력해주세요.
        </p>
      </div>

      <div
        className={`mt-4 rounded-3xl border bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-7 ${
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

            <p className="mt-3 break-keep text-[16px] font-bold leading-snug text-gray-900 sm:text-[17px]">
              {isPossible ? "거주증 발급이 가능합니다" : "보완이 필요할 수 있습니다"}
            </p>

            <p className="mt-2 break-keep text-[13px] leading-[1.55] text-[#556070] [overflow-wrap:normal]">
              {isPossible
                ? "현재 입력하신 국적·비자유형·직책·회사형태 기준으로 거주증(TRC) 신청 요건을 충족합니다."
                : "현재 조건만으로는 거주증(TRC) 발급이 자동으로 보장되지 않습니다. 추가 서류로 요건을 충족시킬 수 있는 경우가 많습니다."}
            </p>
          </div>

          {diagnosis ? (
            <ResultHeaderGauge diagnosis={diagnosis} size={76} />
          ) : (
            <div className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center">
              <strong className="text-[18px] font-black leading-none text-gray-900">{score}%</strong>
            </div>
          )}
        </div>

        <p className="mt-3 break-keep text-[11px] leading-[1.55] text-[#94A3B8] [overflow-wrap:normal]">
          * 위 결과는 입력하신 조건을 기준으로 한 1차 확인 결과입니다. 정확한
          발급 가능 여부는 서류 검토 후 전문가 상담을 통해 확정됩니다.
        </p>

        {diagnosis ? (
          <>
            <OfficialBasisPanel
              engine="check"
              sections={buildCheckOfficialBasisSections(diagnosis)}
              className="mt-4"
            />
            <OfficialTrustZone engine="check" variant="strip" context="diagnosis" className="mt-3" />
          </>
        ) : null}

        <div className="mt-4">
          <NoticeCard tone={isPossible ? "success" : "warning"}>
            연락 정보를 남기시면 상세 확인 결과를 저장·안내해 드립니다.
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

          <PrimaryButton
            type="submit"
            variant={isPossible ? "primary" : "amber"}
            loading={submitting}
            disabled={!canSubmit}
          >
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

export default function TrcCheckPage() {
  const router = useRouter();
  const [costEntryDone, setCostEntryDone] = useState(false);
  const [contextTab, setContextTab] = useState<MasterFunnelContextTab>("lookup");
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
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [previousRejection, setPreviousRejection] = useState<boolean | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionStepDone, setRejectionStepDone] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [restoreCheckPending, setRestoreCheckPending] = useState(true);
  const [restoredLeadActive, setRestoredLeadActive] = useState(false);
  const [restoredResultTone, setRestoredResultTone] = useState<ResultTone | null>(null);
  const [skipSignup, setSkipSignup] = useState(false);
  const memberLeadStartedRef = useRef(false);
  const rejectionRecordIdRef = useRef<string | null>(null);
  const pendingRejectionInsertRef = useRef<PromiseLike<void> | null>(null);
  const [lang, setLang] = useState<SupportedLanguage>("ko");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setLang(resolveLanguage(params.get("lang")));
      // Guide 「내 상황 확인하기」 → 기존 질문 플로우(Q1) 직행 (랜딩/비용 탭 스킵)
      if (params.get("start") === "check") {
        setCostEntryDone(true);
      }
    }
  }, []);
  function applyRestoredLead(restored: {
    leadId: string;
    resultTone: ResultTone;
    resultToken: string | null;
    diagnosis: DiagnosisResult | null;
  }) {
    setCostEntryDone(true);
    setRejectionStepDone(true);
    setLeadSubmitted(true);
    setLeadId(restored.leadId);
    setResultToken(restored.resultToken);
    setRestoredResultTone(restored.resultTone);
    setRestoredLeadActive(true);
    if (restored.diagnosis) setDiagnosis(restored.diagnosis);
  }

  async function handleLandingContinue() {
    const { loggedIn, restored } = await loadCheckMemberEntryState(
      "trc",
      "trc_diagnosis_lead",
      { allowRestore: true }
    );
    if (loggedIn) setSkipSignup(true);
    if (restored) {
      applyRestoredLead(restored);
      return;
    }
    setCostEntryDone(true);
  }

  // 1) 로그인 회원 → 회원가입만 생략
  // 2) ?restore=1 / 랜딩 「내 상황 확인하기」 → 기존 TRC Case 복원 시도
  // 3) ?start=check → 랜딩 생략 + 복원 없이 새 질문 (위 setCostEntryDone만)
  // 4) 그 외(홈·cost-check 등) → 복원 없이 새 CHECK 시작
  useEffect(() => {
    let cancelled = false;

    async function applyMemberEntryState() {
      const params = new URLSearchParams(window.location.search);
      const allowRestore = params.get("restore") === "1";
      const { loggedIn, restored } = await loadCheckMemberEntryState(
        "trc",
        "trc_diagnosis_lead",
        { allowRestore }
      );
      if (cancelled) return;
      if (loggedIn) setSkipSignup(true);
      if (restored) applyRestoredLead(restored);
    }

    async function initMemberState() {
      try {
        await applyMemberEntryState();
      } finally {
        if (!cancelled) setRestoreCheckPending(false);
      }
    }

    void initMemberState();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN") return;
      void applyMemberEntryState();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const messengers = MESSENGERS_BY_LANGUAGE[lang];
  const checkQuestionProps = {
    variant: "verify" as const,
    contextLabel: CHECK_QUESTION_CONTEXT,
    totalSteps: 5,
  };
  const selfNotifySentRef = useRef(false);
  // /api/lead-submit 응답의 result_tokens.token — "전문가 진행 요청하기" 클릭 시
  // /api/auto-login에 전달해 로그인 세션을 만든 뒤 /documents로 이동시키는 데 쓴다.
  const [resultToken, setResultToken] = useState<string | null>(null);
  const [resultUserId, setResultUserId] = useState<string | null>(null);
  const [expertLoginPending, setExpertLoginPending] = useState(false);
  const [expertLoginError, setExpertLoginError] = useState<string | null>(null);
  const [aiReportPending, setAiReportPending] = useState(false);
  const [aiReportError, setAiReportError] = useState<string | null>(null);
  const documentsActionLinkRef = useRef<string | null>(null);
  const aiReportActionLinkRef = useRef<string | null>(null);
  const documentsAutoLoginPromiseRef = useRef<Promise<string | null> | null>(null);
  const aiReportAutoLoginPromiseRef = useRef<Promise<string | null> | null>(null);

  function clearAutoLoginCache() {
    documentsActionLinkRef.current = null;
    aiReportActionLinkRef.current = null;
    documentsAutoLoginPromiseRef.current = null;
    aiReportAutoLoginPromiseRef.current = null;
  }

  async function requestAutoLoginActionLink(
    token: string,
    next: "documents" | "documents_ai_report"
  ): Promise<string | null> {
    const res = await fetch("/api/auto-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, next }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.actionLink) {
      console.error("auto-login failed:", data);
      return null;
    }
    return data.actionLink as string;
  }

  function prefetchAutoLoginActionLink(
    token: string,
    next: "documents" | "documents_ai_report",
    linkRef: { current: string | null },
    promiseRef: { current: Promise<string | null> | null }
  ) {
    if (linkRef.current || promiseRef.current) return;
    promiseRef.current = requestAutoLoginActionLink(token, next).then((link) => {
      if (link) linkRef.current = link;
      return link;
    });
  }

  async function resolveAutoLoginActionLink(
    token: string,
    next: "documents" | "documents_ai_report",
    linkRef: { current: string | null },
    promiseRef: { current: Promise<string | null> | null }
  ): Promise<string | null> {
    if (linkRef.current) return linkRef.current;
    if (promiseRef.current) {
      const prefetched = await promiseRef.current;
      if (prefetched) return prefetched;
    }
    const link = await requestAutoLoginActionLink(token, next);
    if (link) linkRef.current = link;
    return link;
  }

  // resultToken만으로 즉시 prefetch하면, 가입 직후 establishBrowserSessionFromResultToken과
  // 동시에 generateLink가 호출되어 magic link race가 난다. 브라우저 세션이 이미 있으면
  // 전문가/AI 버튼은 /documents로 직행하므로 actionLink prefetch(추가 generateLink)는 불필요하다.
  // 세션이 없을 때만(복원·폴백) documents / documents_ai_report actionLink를 prefetch한다.
  useEffect(() => {
    if (!resultToken) {
      clearAutoLoginCache();
      return;
    }
    let cancelled = false;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (cancelled) return;
      if (sessionData.session) return;
      prefetchAutoLoginActionLink(
        resultToken,
        "documents",
        documentsActionLinkRef,
        documentsAutoLoginPromiseRef
      );
      prefetchAutoLoginActionLink(
        resultToken,
        "documents_ai_report",
        aiReportActionLinkRef,
        aiReportAutoLoginPromiseRef
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [resultToken]);

  const result: Result = computeTrcResultTone(visa, role, company);
  const showResult = nationality && visa && role && company;
  const activeResult: Result = restoredLeadActive ? restoredResultTone : result;
  const canShowResults = restoredLeadActive || !!showResult;
  // 승인된 목업의 5개 카드 가로 배치를 위해 결과 화면(가입 직후, 진행방법
  // 선택 전 단계)에서만 컨테이너 폭을 넓힌다. 질문/입력 화면은 기존 폭 그대로.
  const resultScreenActive =
    canShowResults &&
    (activeResult === "possible" || activeResult === "conditional") &&
    leadSubmitted;

  // 진단 완료 시 AI 리포트(customerView + expertBrief) 계산.
  // 화면에는 가입 직후(2번째 화면)부터 노출하지만, 계산 자체는 미리 해둔다.
  useEffect(() => {
    let cancelled = false;
    if (showResult) {
      getCheckDiagnosis({ service: "trc", visa, role, company }).then((res) => {
        if (!cancelled) setDiagnosis(res);
      });
    } else if (!restoredLeadActive) {
      setDiagnosis(null);
    }
    return () => {
      cancelled = true;
    };
  }, [visa, role, company, showResult, restoredLeadActive]);

  // 로그인 회원 + 해당 서비스 lead 없음 → 회원가입 폼 없이 기존 연락처로 lead 생성
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
      const created = await submitMemberCheckLead({
        serviceType: "trc",
        sourcePage: "/check/trc",
        result,
        diagnosisAction: "trc_diagnosis_lead",
        tag: "TRC",
        diagnosis,
        previousRejection,
        rejectionReason,
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
    previousRejection,
    rejectionReason,
    lang,
    messengers.primary.key,
    messengers.secondary.key,
  ]);

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

  async function ensureBrowserSessionForDocuments(): Promise<boolean> {
    if (!resultToken) {
      const { data: sessionData } = await supabase.auth.getSession();
      return Boolean(sessionData.session);
    }
    return await establishBrowserSessionFromResultToken(
      resultToken,
      resultUserId ?? undefined
    );
  }

  // "전문가 진행 요청하기" 클릭 시 — resultToken이 있으면 /api/auto-login으로
  // 실제 로그인 세션을 발급받은 뒤(magic link 왕복, /r?...&next=documents 경유)
  // /documents로 이동한다. 세션 없이 이동하면 이후 업로드/삭제가 RLS에서
  // permission denied로 조용히 실패하므로, 토큰이 없는 경우에만 기존 방식(직접
  // 이동)으로 폴백한다.
  async function handleExpertRequestClick() {
    if (!leadId) return;
    setExpertLoginPending(true);
    setExpertLoginError(null);
    try {
      if (restoredLeadActive) {
        window.location.href = "/mypage";
        return;
      }
      const hasSession = await ensureBrowserSessionForDocuments();
      if (!resultToken && !hasSession) {
        setExpertLoginError("로그인 정보를 준비하지 못했습니다. 다시 신청해주세요.");
        setExpertLoginPending(false);
        return;
      }
      recordAgencyUpgradeAndNotify({
        leadId,
        tag: "TRC",
        token: resultToken ?? undefined,
      });

      if (hasSession) {
        window.location.href = `/documents?leadId=${encodeURIComponent(leadId)}&service=trc&mode=expert`;
        return;
      }

      const actionLink = await resolveAutoLoginActionLink(
        resultToken as string,
        "documents",
        documentsActionLinkRef,
        documentsAutoLoginPromiseRef
      );
      if (!actionLink) {
        setExpertLoginError("로그인 처리 중 문제가 발생했습니다. 다시 시도해주세요.");
        setExpertLoginPending(false);
        return;
      }
      window.location.href = actionLink;
    } catch (err) {
      console.error("auto-login request failed:", err);
      setExpertLoginError("로그인 처리 중 문제가 발생했습니다. 다시 시도해주세요.");
      setExpertLoginPending(false);
    }
  }

  // "AI 리포트 요청하기" — CRM 기록 + 접수 확인 이메일 후 auto-login(next=documents_ai_report)
  async function handleAiReportRequest() {
    if (!leadId) {
      setAiReportError("신청 정보를 찾지 못했습니다. 다시 신청해주세요.");
      return;
    }
    setAiReportPending(true);
    setAiReportError(null);
    try {
      if (restoredLeadActive) {
        window.location.href = "/mypage";
        return;
      }
      const hasSession = await ensureBrowserSessionForDocuments();
      if (!resultToken && !hasSession) {
        setAiReportError("로그인 정보를 준비하지 못했습니다. 다시 신청해주세요.");
        setAiReportPending(false);
        return;
      }
      recordAiReportRequestAndNotify({
        leadId,
        tag: "TRC",
        token: resultToken ?? undefined,
      });

      if (hasSession) {
        window.location.href = `/documents?leadId=${encodeURIComponent(leadId)}&service=trc&mode=ai_report`;
        return;
      }

      const actionLink = await resolveAutoLoginActionLink(
        resultToken as string,
        "documents_ai_report",
        aiReportActionLinkRef,
        aiReportAutoLoginPromiseRef
      );
      if (!actionLink) {
        setAiReportError("로그인 처리 중 문제가 발생했습니다. 다시 시도해주세요.");
        setAiReportPending(false);
        return;
      }
      window.location.href = actionLink;
    } catch {
      setAiReportError("접수 중 문제가 발생했습니다. 다시 시도해주세요.");
      setAiReportPending(false);
    }
  }

  function reset() {
    setCostEntryDone(false);
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
    setDiagnosis(null);
    setPreviousRejection(null);
    setRejectionReason("");
    setRejectionStepDone(false);
    setSelectedKey(null);
    setResultToken(null);
    setResultUserId(null);
    setRestoredLeadActive(false);
    setRestoredResultTone(null);
    setSkipSignup(false);
    void isLoggedInMember().then((loggedIn) => {
      if (loggedIn) setSkipSignup(true);
    });
    memberLeadStartedRef.current = false;
    clearAutoLoginCache();
    setExpertLoginPending(false);
    setExpertLoginError(null);
    setAiReportPending(false);
    setAiReportError(null);
    rejectionRecordIdRef.current = null;
    pendingRejectionInsertRef.current = null;
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
      // [STEP22 2차] 기존 crm_activities.meta를 읽어와 socialContacts/preferredLanguage만
    // 병합한다 — 서비스마다 meta 구조가 다르므로 그 형태를 추측하지 않고, 기존 값을
    // 그대로 읽은 뒤 spread로 덮어쓰지 않고 새 키만 추가한다. 이 시점에 이 lead_id로
    // 남아있는 crm_activities 행은 방금 삽입한 진단 행 하나뿐이므로 lead_id로 최신
    // 행을 찾아 병합하면 다른 서비스의 meta 구조를 알 필요가 없다.
    const { data: existingActivity } = await supabase
      .from("crm_activities")
      .select("id, meta")
      .eq("lead_id", leadId)
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
        body: JSON.stringify({ leadId, name, phone, email, address, lang, kakao_id: kakaoId, zalo_id: zaloId }),
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

      // 세션 확립을 resultToken set(→ prefetch useEffect)보다 먼저 끝낸다.
      // 이후 setResultToken 시점에 세션이 있으면 prefetch는 generateLink를 호출하지 않는다.
      const expectedUserId =
        typeof okBody.userId === "string" ? okBody.userId : undefined;
      const sessionReady = await establishBrowserSessionFromResultToken(
        okBody.token,
        expectedUserId
      );
      if (!sessionReady) {
        setLeadError("로그인 세션 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
        setSubmitting(false);
        return;
      }
      setResultToken(okBody.token);
      setResultUserId(expectedUserId ?? null);
    } catch (apiErr) {
      console.error("lead-submit fetch failed:", apiErr);
      setLeadError("접수 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
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
    <FunnelPageShell
      engine="check"
      width={!costEntryDone || resultScreenActive ? "wide" : "default"}
    >
        <FunnelPageHeader
          engine="check"
          title={
            !costEntryDone
              ? contextTab === "review"
                ? "거주증 (TRC) 견적 적정성 검토"
                : contextTab === "direct"
                  ? "거주증 (TRC) 안내"
                  : "거주증 (TRC) 비용 확인"
              : "거주증 (TRC) 가능성 진단"
          }
          description={
            !costEntryDone
              ? contextTab === "review"
                ? "받은 견적이 정부 수수료 + 시장 일반 대행료 기준 대비 어느 정도인지 확인합니다."
                : contextTab === "direct"
                  ? "거주증 절차·서류·공식 자료 확인 방법을 안내합니다."
                  : "정부 수수료와 시장 대행료를 먼저 확인한 뒤, 내 상황을 직접 확인합니다."
              : "국적·비자·직책·회사 형태를 순서대로 확인하면, 거주증 가능 여부를 공식 행정 기준으로 확인할 수 있습니다."
          }
          headerExtra={
            resultScreenActive && diagnosis ? (
              <div className="sm:hidden">
                <ResultHeaderGauge diagnosis={diagnosis} size={76} />
              </div>
            ) : undefined
          }
        />

        {restoreCheckPending && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 text-center text-sm text-gray-500">
            이전 결과를 확인하는 중…
          </div>
        )}

        {!restoreCheckPending && !costEntryDone && (
          <MasterFunnelLanding
            config={MASTER_LANDING_TRC}
            activeTab={contextTab}
            onTabChange={setContextTab}
            onContinue={() => void handleLandingContinue()}
          />
        )}

        {!restoreCheckPending && costEntryDone && !rejectionStepDone && (
          <div className="mt-4 sm:mt-5">
            <VerifyStepLayout
              engine="check"
              step={1}
              question={
                <>
                  <QuestionSection
                    step={1}
                    title="이전에 다른 곳(정부기관 또는 타 대행사)에서 신청하셨다가 거절·반려되신 적이 있나요?"
                    description="현재 상황에 맞춰 확인하기 위해 필요한 항목입니다. 이력이 있으면 보완 포인트를 더 정확히 짚을 수 있습니다."
                    {...checkQuestionProps}
                  >
                    <VerifyAnswerGrid step={1}>
                      <SelectionCard
                        variant="quiet"
                        title="네, 있습니다"
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
                        selected={previousRejection === false}
                        tone="blue"
                        onClick={() => {
                          setPreviousRejection(false);
                          setRejectionStepDone(true);
                        }}
                      />
                    </VerifyAnswerGrid>
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
                    "예)\n- 노동허가가 거절되었습니다.\n- 범죄경력증명서 문제라고 들었습니다.\n- 회사 자본금이 부족하다고 안내받았습니다.\n- 정확한 이유를 듣지 못했습니다.\n\n자유롭게 작성해주세요."
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
                  className={CHECK_BACK_BUTTON_CLASS}
                >
                  <ArrowLeft size={14} /> 비용·기준으로 돌아가기
                </button>
              }
            />
          </div>
        )}

        {!restoreCheckPending && costEntryDone && rejectionStepDone && !showResult && !restoredLeadActive && (
          <>
            {!nationality && (
              <div className="mt-4 sm:mt-5">
                <VerifyStepLayout
                  engine="check"
                  step={2}
                  question={
                    <QuestionSection
                      step={2}
                      title="국적이 어떻게 되시나요?"
                      description="현재 상황에 맞춰 확인하기 위해 필요한 항목입니다. 국적에 따라 적용 기준이 달라질 수 있습니다."
                      {...checkQuestionProps}
                    >
                      <VerifyAnswerGrid step={2}>
                        {[
                          { key: "korea", label: "대한민국", desc: "가장 많이 선택되는 국적입니다." },
                          { key: "china", label: "중국", desc: "중국 국적 신청자에게 적용됩니다." },
                          { key: "japan", label: "일본", desc: "일본 국적 신청자에게 적용됩니다." },
                          { key: "other", label: "기타 국가", desc: "위 국가에 해당하지 않는 경우입니다." },
                        ].map((opt) => (
                          <SelectionCard
                            key={opt.key}
                            variant="quiet"
                            title={opt.label}
                            description={opt.desc}
                            selected={selectedKey === opt.key}
                            tone="blue"
                            onClick={() => {
                              setSelectedKey(opt.key);
                              setTimeout(() => {
                                setNationality(opt.key as Nationality);
                                setSelectedKey(null);
                              }, 300);
                            }}
                          />
                        ))}
                      </VerifyAnswerGrid>
                    </QuestionSection>
                  }
                  actions={
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedKey(null);
                        setRejectionStepDone(false);
                      }}
                      className={CHECK_BACK_BUTTON_CLASS}
                    >
                      <ArrowLeft size={14} /> 이전 단계로
                    </button>
                  }
                />
              </div>
            )}

            {nationality && !visa && (
              <div className="mt-4 sm:mt-5">
                <VerifyStepLayout
                  engine="check"
                  step={2}
                  question={
                    <QuestionSection
                      step={3}
                      title="현재 어떤 비자를 소지하고 있나요?"
                      description="현재 상황에 맞춰 확인하기 위해 필요한 항목입니다. 비자 유형은 거주증 가능 여부를 가르는 핵심 조건입니다."
                      {...checkQuestionProps}
                    >
                      <VerifyAnswerGrid step={2}>
                        {[
                          { key: "invest", label: "투자비자 (DT)", desc: "출자·투자 목적으로 발급된 비자입니다." },
                          { key: "work", label: "노동허가부 비자 (LD)", desc: "노동허가 취득을 완료한 경우입니다." },
                          { key: "tourist", label: "관광·단기비자 (DL 등)", desc: "단기 체류 목적으로 발급된 비자입니다." },
                          { key: "other", label: "기타 비자", desc: "위 항목에 해당하지 않는 경우입니다." },
                        ].map((opt) => (
                          <SelectionCard
                            key={opt.key}
                            variant="quiet"
                            title={opt.label}
                            description={opt.desc}
                            selected={selectedKey === opt.key}
                            tone="blue"
                            onClick={() => {
                              setSelectedKey(opt.key);
                              setTimeout(() => {
                                setVisa(opt.key as Visa);
                                setSelectedKey(null);
                              }, 300);
                            }}
                          />
                        ))}
                      </VerifyAnswerGrid>
                    </QuestionSection>
                  }
                  actions={
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedKey(null);
                        setNationality(null);
                      }}
                      className={CHECK_BACK_BUTTON_CLASS}
                    >
                      <ArrowLeft size={14} /> 이전 단계로
                    </button>
                  }
                />
              </div>
            )}

            {nationality && visa && !role && (
              <div className="mt-4 sm:mt-5">
                <VerifyStepLayout
                  engine="check"
                  step={3}
                  question={
                    <QuestionSection
                      step={4}
                      title="회사 내 직책이 어떻게 되시나요?"
                      description="현재 상황에 맞춰 확인하기 위해 필요한 항목입니다. 직책에 따라 필요한 증빙·요건이 달라질 수 있습니다."
                      {...checkQuestionProps}
                    >
                      <VerifyAnswerGrid step={3}>
                        {[
                          { key: "legal-rep", label: "법인장 · 법정대표자", desc: "법인의 대표 권한을 가진 경우입니다." },
                          { key: "manager", label: "매니저 · 관리직", desc: "관리 업무를 담당하는 경우입니다." },
                          { key: "staff", label: "일반 직원", desc: "일반 실무를 담당하는 경우입니다." },
                        ].map((opt) => (
                          <SelectionCard
                            key={opt.key}
                            variant="quiet"
                            title={opt.label}
                            description={opt.desc}
                            selected={selectedKey === opt.key}
                            tone="blue"
                            onClick={() => {
                              setSelectedKey(opt.key);
                              setTimeout(() => {
                                setRole(opt.key as Role);
                                setSelectedKey(null);
                              }, 300);
                            }}
                          />
                        ))}
                      </VerifyAnswerGrid>
                    </QuestionSection>
                  }
                  actions={
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedKey(null);
                        setVisa(null);
                      }}
                      className={CHECK_BACK_BUTTON_CLASS}
                    >
                      <ArrowLeft size={14} /> 이전 단계로
                    </button>
                  }
                />
              </div>
            )}

            {nationality && visa && role && !company && (
              <div className="mt-4 sm:mt-5">
                <VerifyStepLayout
                  engine="check"
                  step={4}
                  question={
                    <QuestionSection
                      step={5}
                      title="소속 회사의 법인 형태는 무엇인가요?"
                      description="현재 상황에 맞춰 확인하기 위해 필요한 항목입니다. 법인 형태·등록 여부는 마지막 확인 조건입니다."
                      {...checkQuestionProps}
                    >
                      <VerifyAnswerGrid step={3}>
                        {[
                          { key: "fdi", label: "외국인투자법인 (FDI)", desc: "외국인 투자 지분이 있는 법인입니다." },
                          { key: "local", label: "현지 법인", desc: "베트남 현지 자본으로 설립된 법인입니다." },
                          { key: "unregistered", label: "아직 미등록 · 준비 중", desc: "법인 등록 절차가 아직 진행 중입니다." },
                        ].map((opt) => (
                          <SelectionCard
                            key={opt.key}
                            variant="quiet"
                            title={opt.label}
                            description={opt.desc}
                            selected={selectedKey === opt.key}
                            tone="blue"
                            onClick={() => {
                              setSelectedKey(opt.key);
                              setTimeout(() => {
                                setCompany(opt.key as Company);
                                setSelectedKey(null);
                              }, 300);
                            }}
                          />
                        ))}
                      </VerifyAnswerGrid>
                    </QuestionSection>
                  }
                  actions={
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedKey(null);
                        setRole(null);
                      }}
                      className={CHECK_BACK_BUTTON_CLASS}
                    >
                      <ArrowLeft size={14} /> 이전 단계로
                    </button>
                  }
                />
              </div>
            )}
          </>
        )}


        {/* 1번째 화면 (가입 전) — Premium SaaS lead capture */}
        {!restoreCheckPending &&
          costEntryDone &&
          canShowResults &&
          activeResult === "possible" &&
          !leadSubmitted &&
          skipSignup && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 text-center text-sm text-gray-500">
            기존 회원 정보로 결과를 준비하는 중…
          </div>
        )}

        {!restoreCheckPending &&
          costEntryDone &&
          canShowResults &&
          activeResult === "possible" &&
          !leadSubmitted &&
          !skipSignup && (
          <PremiumLeadCapture
            tone="possible"
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

        {/* 2번째 화면 (가입 직후) — AI 리포트 + 직접등록/전문가 진행요청 선택 */}
        {!restoreCheckPending && costEntryDone && canShowResults && activeResult === "possible" && leadSubmitted && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CheckDiagnosisHeader />

            {diagnosis && (
              <ResultOverviewCards diagnosis={diagnosis} docCount={TRC_REQUIRED_DOCUMENTS.length} />
            )}

            {diagnosis && <CheckResultOfficialSection diagnosis={diagnosis} />}

            <OfficialTrustZone engine="check" variant="strip" context="diagnosis" className="mt-4" />

            <div className="mt-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5">
              <p className="break-keep text-[11px] leading-[1.55] text-[#64748B] [overflow-wrap:normal]">
                <span className="font-medium text-[#94A3B8]">지금</span>
                <span className="mx-1 text-[#CBD5E1]">·</span>
                <span className="font-medium text-[#0B2A6B]">1차 확인</span>
                <span className="mx-2 text-[#CBD5E1]">→</span>
                <span className="font-medium text-[#94A3B8]">다음</span>
                <span className="mx-1 text-[#CBD5E1]">·</span>
                <span className="font-medium text-[#0B2A6B]">AI 리포트 / 전문가</span>
                <span className="mx-2 text-[#CBD5E1]">→</span>
                <span className="font-medium text-[#94A3B8]">최종</span>
                <span className="mx-1 text-[#CBD5E1]">·</span>
                <span className="font-medium text-[#0B2A6B]">정부 신청·발급</span>
              </p>
            </div>

            <NextStepOptions
              onSelf={handleSelfPortalClick}
              onExpert={handleExpertRequestClick}
              onAiReport={handleAiReportRequest}
              officialUrl={TRC_OFFICIAL_URL}
              expertPending={expertLoginPending}
              expertError={expertLoginError}
              aiReportPending={aiReportPending}
              aiReportError={aiReportError}
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

        {/* 조건부 가능 — 1번째 화면 (가입 전, Premium SaaS lead capture) */}
        {!restoreCheckPending &&
          costEntryDone &&
          canShowResults &&
          activeResult === "conditional" &&
          !leadSubmitted &&
          skipSignup && (
          <div className="mt-8 rounded-3xl bg-white border border-amber-100 p-7 text-center text-sm text-gray-500">
            기존 회원 정보로 결과를 준비하는 중…
          </div>
        )}

        {!restoreCheckPending &&
          costEntryDone &&
          canShowResults &&
          activeResult === "conditional" &&
          !leadSubmitted &&
          !skipSignup && (
          <PremiumLeadCapture
            tone="conditional"
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

        {/* 조건부 가능 — 2번째 화면 (가입 직후, AI 리포트 + 직접등록/전문가 진행요청 선택) */}
        {!restoreCheckPending && costEntryDone && canShowResults && activeResult === "conditional" && leadSubmitted && (
          <div className="mt-8 rounded-3xl bg-white border border-amber-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CheckDiagnosisHeader />

            {diagnosis && (
              <ResultOverviewCards diagnosis={diagnosis} docCount={TRC_REQUIRED_DOCUMENTS.length} />
            )}

            {diagnosis && <CheckResultOfficialSection diagnosis={diagnosis} />}

            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800 leading-relaxed">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              현재 조건으로는 자격 요건이 완전히 충족되지 않아, 직접
              진행하실 경우 서류 준비나 절차에서 어려움을 겪으실 가능성이
              높습니다. 그래도 직접 진행을 원하신다면 아래에서 선택하실 수
              있습니다.
            </div>

            <OfficialTrustZone engine="check" variant="strip" context="diagnosis" className="mt-4" />

            <div className="mt-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5">
              <p className="break-keep text-[11px] leading-[1.55] text-[#64748B] [overflow-wrap:normal]">
                <span className="font-medium text-[#94A3B8]">지금</span>
                <span className="mx-1 text-[#CBD5E1]">·</span>
                <span className="font-medium text-[#0B2A6B]">1차 확인</span>
                <span className="mx-2 text-[#CBD5E1]">→</span>
                <span className="font-medium text-[#94A3B8]">다음</span>
                <span className="mx-1 text-[#CBD5E1]">·</span>
                <span className="font-medium text-[#0B2A6B]">AI 리포트 / 전문가</span>
                <span className="mx-2 text-[#CBD5E1]">→</span>
                <span className="font-medium text-[#94A3B8]">최종</span>
                <span className="mx-1 text-[#CBD5E1]">·</span>
                <span className="font-medium text-[#0B2A6B]">정부 신청·발급</span>
              </p>
            </div>

            <NextStepOptions
              onSelf={handleSelfPortalClick}
              onExpert={handleExpertRequestClick}
              onAiReport={handleAiReportRequest}
              officialUrl={TRC_OFFICIAL_URL}
              expertPending={expertLoginPending}
              expertError={expertLoginError}
              aiReportPending={aiReportPending}
              aiReportError={aiReportError}
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

        {!restoreCheckPending && costEntryDone && canShowResults && activeResult === "impossible" && (
          <div className="mt-8 rounded-3xl bg-white border border-red-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <XCircle className="text-red-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              현재 상태로는 거주증 발급이 어렵습니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              법인이 아직 등록되지 않은 상태에서는 거주증 신청 자체가
              어렵습니다. 먼저 법인설립(IRC/ERC) 절차를 진행한 뒤 다시
              확인해 주세요.
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
    </FunnelPageShell>
  );
}
