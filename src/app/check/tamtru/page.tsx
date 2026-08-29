"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building,
  Home as HomeIcon,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  FileText,
  Clock,
  UserCheck,
} from "lucide-react";
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
import {
  SelectionCard,
  QuestionSection,
  PrimaryButton,
  NoticeCard,
  InfoBox,
  OfficialBasisPanel,
  OfficialTrustZone,
  VerifyAnswerGrid,
  VerifyStepLayout,
} from "@/components/ui";
import { recordAgencyUpgradeAndNotify } from "@/lib/agencyUpgradeRequest";
import { recordAiReportRequestAndNotify } from "@/lib/aiReportRequest";
import { supabase } from "@/lib/supabase";
import { saveLeadContact } from "@/lib/leadContact";
import {
  MasterFunnelLanding,
  type MasterFunnelContextTab,
  MASTER_LANDING_TAMTRU,
} from "@/components/cost-check/MasterFunnelLanding";
import FunnelPageHeader from "@/components/engine/FunnelPageHeader";
import FunnelPageShell from "@/components/engine/FunnelPageShell";
import {
  getCheckDiagnosis,
  computeTamtruResultTone,
  type DiagnosisResult,
  type TamtruTiming,
} from "@/lib/checkDiagnosis";

const TAMTRU_OFFICIAL_URL = "https://evisa.gov.vn/khai-bao-tam-tru";

// 기존 "땀주 신고에 필요한 서류" 목록과 동일한 3개 항목 — 값 변경 없이
// 새 결과화면의 "3 준비서류 안내" 카드에서 개수 표시용으로만 재사용한다.
const TAMTRU_REQUIRED_DOCUMENTS = [
  "여권 원본 및 사본",
  "임대차 계약서 (또는 집주인 확인서)",
  "숙소 주소지 증빙",
];

const CHECK_QUESTION_CONTEXT = "임시거주등록 (땀주) 가능성 진단";
const CHECK_BACK_BUTTON_CLASS =
  "mt-4 inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-medium text-[#64748B] transition-colors hover:text-[#0B2A6B]";

type Housing = "hotel" | "personal" | null;
type Timing = TamtruTiming;
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
      label: "AI 검토 의견",
      visual: (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <UserCheck className="text-gray-700" size={26} />
        </div>
      ),
      pill: <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${aiOpinionTone}`}>{aiOpinionText}</span>,
      caption: "베트남 행정 전문가 AI의 종합 검토 의견입니다.",
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

// 결과 화면 헤더용 원형 점수표 — 개인정보 입력 화면(리드폼)의 게이지와
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
        추천 분야: 행정
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
          베트남 공식 행정 기준·체크리스트를 참고하여 분석했습니다.
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
          분석 기준: 공식 행정 기준 · 체크리스트 · 유사 사례
        </p>
      </div>

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

  const sentence1 = `입력하신 정보를 기준으로 임시거주(땀주) 신고 가능성은 ${toneText} 것으로 분석되었습니다.`;

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
        임시거주등록 (땀주)
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
      <p className="mt-5 break-keep text-sm font-bold text-gray-900">다음으로 진행할 방법을 선택하세요</p>
      <p className="mt-1 break-keep text-xs leading-[1.55] text-[#64748B] [overflow-wrap:normal]">
        확인 결과를 바탕으로, 분석 정리 · 전문가 진행 · 정부 사이트 직접 신청 중 선택합니다.
      </p>

      <div className="mt-3 grid gap-4 sm:grid-cols-3 sm:items-stretch">
        <div className="relative flex h-full flex-col rounded-2xl border border-[#0B2A6B] bg-white p-4 shadow-[0_1px_3px_rgba(11,42,107,0.08)]">
          <span className="absolute -top-2.5 left-4 rounded-full bg-[#0B2A6B] px-2.5 py-0.5 text-[10px] font-bold text-white">
            필수
          </span>
          <p className="mt-1 min-h-[40px] text-sm font-bold leading-[1.4] text-gray-900">
            AI 리포트 요청하기
          </p>
          <p className="mt-2 min-h-[54px] break-keep text-xs leading-[1.55] text-gray-500 [overflow-wrap:normal]">
            입력 정보와 서류를 바탕으로, 공식 행정 기준에 맞춰 확인 결과를 정리한
            리포트(PDF)를 받을 수 있습니다.
          </p>
          <div className="mt-auto pt-4">
            <PrimaryButton onClick={onAiReport} loading={aiReportPending}>
              {aiReportPending ? "이동 중..." : "AI 리포트 요청하기"}
            </PrimaryButton>
            <p className="mt-2 min-h-[32px] text-center text-[11px] leading-[1.5] text-slate-500">
              {aiReportError ? (
                <span className="text-red-600">{aiReportError}</span>
              ) : (
                "서류 제출 → 리포트 정리 → My Page PDF 순으로 이어집니다."
              )}
            </p>
          </div>
        </div>

        <div className="relative flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4">
          <span className="absolute -top-2.5 left-4 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
            추천
          </span>
          <p className="mt-1 min-h-[40px] text-sm font-bold leading-[1.4] text-gray-900">
            전문가 진행하기
          </p>
          <p className="mt-2 min-h-[54px] break-keep text-xs leading-[1.55] text-gray-500 [overflow-wrap:normal]">
            VFBCAI 전문가팀이 실제 절차와 제출 서류를 확인하며 함께 진행합니다.
          </p>
          <div className="mt-auto pt-4">
            <PrimaryButton variant="outline" onClick={onExpert} loading={expertPending}>
              전문가 진행 요청하기
            </PrimaryButton>
            <p className="mt-2 min-h-[32px] text-center text-[11px] leading-[1.5] text-slate-500">
              {expertError ? (
                <span className="text-red-600">{expertError}</span>
              ) : (
                "확인 결과 + 제출 서류 → 전문가 진행으로 이어집니다."
              )}
            </p>
          </div>
        </div>

        <div className="relative flex h-full flex-col rounded-2xl border border-gray-100 bg-[#FAFBFC] p-4">
          <span className="absolute -top-2.5 left-4 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
            신중
          </span>
          <p className="mt-1 min-h-[40px] text-sm font-bold leading-[1.4] text-gray-900">
            직접 진행하기
          </p>
          <p className="mt-2 min-h-[54px] break-keep text-xs leading-[1.55] text-gray-500 [overflow-wrap:normal]">
            정부 공식 사이트(출입국 전자포털)에서 임시거주(땀주) 신고를 직접
            진행합니다.
          </p>
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
              className="flex h-[52px] w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 shadow-none transition-colors hover:bg-gray-50"
            >
              정부 공식 사이트 이동 <ExternalLink size={13} />
            </a>
            <p className="mt-2 min-h-[32px] text-center text-[11px] leading-[1.5] text-slate-500">
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
  submitting,
  leadError,
  consentOpen,
  consentHighlight,
  onConsentToggle,
  onConsentChecked,
  onSubmit,
  onReset,
  showOverdueNotice,
}: {
  tone: "possible" | "conditional";
  diagnosis: DiagnosisResult | null;
  messengers: MessengerPair;
  lang: SupportedLanguage;
  submitting: boolean;
  leadError: string | null;
  consentOpen: boolean;
  consentHighlight: boolean;
  onConsentToggle: () => void;
  onConsentChecked: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  showOverdueNotice?: boolean;
}) {
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
  const score = diagnosis?.customerView.feasibilityScore ?? (isPossible ? 88 : 50);

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
        {showOverdueNotice && (
          <div className="mb-5">
            <NoticeCard tone="danger">
              신고 기한(12~24시간)이 이미 지났을 수 있습니다. 서둘러
              등록을 진행하세요.
            </NoticeCard>
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {isPossible ? (
              <CheckCircle2 className="text-emerald-600" size={28} />
            ) : (
              <AlertTriangle className="text-amber-600" size={28} />
            )}

            <p className="mt-3 break-keep text-[16px] font-bold leading-snug text-gray-900 sm:text-[17px]">
              {isPossible
                ? "임시거주(땀주) 신고를 진행할 수 있습니다"
                : "신고 기한 확인·보완이 필요할 수 있습니다"}
            </p>

            <p className="mt-2 break-keep text-[13px] leading-[1.55] text-[#556070] [overflow-wrap:normal]">
              {isPossible
                ? "현재 입력하신 숙소·신고 시점 기준으로 임시거주(땀주) 신고 요건을 충족합니다."
                : "신고 기한이 지났을 가능성이 있습니다. 서둘러 등록을 진행하되, 추가 확인이 필요할 수 있습니다."}
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
          신고 가능 여부는 서류 검토 후 전문가 상담을 통해 확정됩니다.
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
          <div className="-mt-1">
            <InfoBox>
              주소가 있어야 관할 phường(동) 사이트를 정확히 찾아드릴
              수 있어요.
            </InfoBox>
          </div>
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

export default function TamTruCheckPage() {
  const [housing, setHousing] = useState<Housing>(null);
  const [landlordIssue, setLandlordIssue] = useState<boolean | null>(null);
  const [timing, setTiming] = useState<Timing>(null);

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
  const [contextTab, setContextTab] = useState<MasterFunnelContextTab>("lookup");
  const [costEntryDone, setCostEntryDone] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const rejectionRecordIdRef = useRef<string | null>(null);
  const pendingRejectionInsertRef = useRef<PromiseLike<void> | null>(null);

  const [lang, setLang] = useState<SupportedLanguage>("ko");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setLang(resolveLanguage(params.get("lang")));
      // Guide 「내 상황 확인하기」 → 기존 질문 플로우 직행 (랜딩/비용 탭 스킵)
      if (params.get("start") === "check") {
        setCostEntryDone(true);
      }
    }
  }, []);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const messengers = MESSENGERS_BY_LANGUAGE[lang];
  const checkQuestionProps = {
    variant: "verify" as const,
    contextLabel: CHECK_QUESTION_CONTEXT,
    totalSteps: 4,
  };
  const showLegalEscalation = landlordIssue === true;
  const selfNotifySentRef = useRef(false);
  // /api/lead-submit 응답의 result_tokens.token — "전문가 진행 요청하기" 클릭 시
  // /api/auto-login에 전달해 로그인 세션을 만든 뒤 /documents로 이동시키는 데 쓴다.
  const [resultToken, setResultToken] = useState<string | null>(null);
  const [expertLoginPending, setExpertLoginPending] = useState(false);
  const [expertLoginError, setExpertLoginError] = useState<string | null>(null);
  const [aiReportPending, setAiReportPending] = useState(false);
  const [aiReportError, setAiReportError] = useState<string | null>(null);

  const result: Result = computeTamtruResultTone(timing);
  const showResult = housing === "personal" && landlordIssue === false && !!timing;
  // 승인된 목업의 5개 카드 가로 배치를 위해 결과 화면(가입 직후, 진행방법
  // 선택 전 단계)에서만 컨테이너 폭을 넓힌다. 질문/입력 화면은 기존 폭 그대로.
  const resultScreenActive = showResult && leadSubmitted;

  // 진단 완료 시 AI 리포트(customerView + expertBrief) 계산.
  useEffect(() => {
    let cancelled = false;
    if (showResult) {
      getCheckDiagnosis({ service: "tamtru", timing }).then((res) => {
        if (!cancelled) setDiagnosis(res);
      });
    } else {
      setDiagnosis(null);
    }
    return () => {
      cancelled = true;
    };
  }, [timing, showResult]);

  // "네, 있습니다" 클릭 즉시 익명으로 저장 — 회원가입 여부와 무관하게 데이터가 남는다.
  // 삽입 Promise를 ref에 저장해두고, "다음" 클릭 시 이 Promise가 끝날 때까지
  // 기다린 뒤 사유를 업데이트한다 (빠르게 연속 클릭해도 순서가 꼬이지 않도록).
  function recordRejectionAnonymously() {
    const id = crypto.randomUUID();
    pendingRejectionInsertRef.current = supabase
      .from("previous_rejections")
      .insert({
        id,
        service_type: "tamtru",
        source_page: "/check/tamtru",
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

  // "전문가 진행 요청하기" 클릭 시 — resultToken이 있으면 /api/auto-login으로
  // 실제 로그인 세션을 발급받은 뒤(magic link 왕복, /r?...&next=documents 경유)
  // /documents로 이동한다. 세션이 없으면 이후 업로드/삭제가 RLS에서 permission
  // denied로 조용히 실패하므로, 토큰이 없는 경우 이동하지 않고 오류만 표시한다.
  async function handleExpertRequestClick() {
    if (!leadId) return;
    if (!resultToken) {
      setExpertLoginError("로그인 정보를 준비하지 못했습니다. 다시 신청해주세요.");
      return;
    }
    setExpertLoginPending(true);
    setExpertLoginError(null);
    try {
      try {
        await recordAgencyUpgradeAndNotify({
          leadId,
          tag: "TAMTRU",
          token: resultToken,
        });
      } catch (agencyErr) {
        console.error("agency upgrade notify failed:", agencyErr);
      }

      const res = await fetch("/api/auto-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resultToken, next: "documents" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.actionLink) {
        console.error("auto-login failed:", data);
        setExpertLoginError("로그인 처리 중 문제가 발생했습니다. 다시 시도해주세요.");
        setExpertLoginPending(false);
        return;
      }
      window.location.href = data.actionLink;
    } catch (err) {
      console.error("auto-login request failed:", err);
      setExpertLoginError("로그인 처리 중 문제가 발생했습니다. 다시 시도해주세요.");
      setExpertLoginPending(false);
    }
  }

  async function handleAiReportRequest() {
    if (!leadId) {
      setAiReportError("신청 정보를 찾지 못했습니다. 다시 신청해주세요.");
      return;
    }
    setAiReportPending(true);
    setAiReportError(null);
    try {
      if (!resultToken) {
        setAiReportError("로그인 정보를 준비하지 못했습니다. 다시 신청해주세요.");
        setAiReportPending(false);
        return;
      }
      recordAiReportRequestAndNotify({
          leadId,
          tag: "TAMTRU",
          token: resultToken,
        });

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

  function reset() {
    setCostEntryDone(false);
    setHousing(null);
    setLandlordIssue(null);
    setTiming(null);
    setLeadSubmitted(false);
    setLeadId(null);
    setSubmitting(false);
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
      service_type: "tamtru",
      result: result,
      source_page: "/check/tamtru",
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
      action: "tamtru_diagnosis_lead",
      tag: "TAMTRU",
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
      } else {
        const okBody = await res.json().catch(() => null);
        if (okBody?.token) setResultToken(okBody.token);
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
    <FunnelPageShell
      engine="check"
      width={!costEntryDone || resultScreenActive ? "wide" : "default"}
    >
      <FunnelPageHeader
        engine="check"
        title={
          !costEntryDone
            ? contextTab === "review"
              ? "임시거주등록 (땀주) 견적·조건 검토"
              : contextTab === "direct"
                ? "임시거주등록 (땀주) 안내"
                : "임시거주등록 (땀주) 비용 확인"
            : "땀주 (임시거주등록) 확인"
        }
        description={
          !costEntryDone
            ? contextTab === "review"
              ? "받은 안내·견적이 기준과 비용 구조에 맞는지 확인합니다."
              : contextTab === "direct"
                ? "절차·서류·공식 자료 확인 방법을 안내합니다."
                : "정부 수수료와 시장 대행료를 먼저 확인한 뒤, 내 상황을 직접 확인합니다."
            : "숙소 형태에 따라 등록 방법이 다릅니다. 몇 가지만 확인할게요."
        }
        headerExtra={
          resultScreenActive && diagnosis ? (
            <div className="sm:hidden">
              <ResultHeaderGauge diagnosis={diagnosis} size={76} />
            </div>
          ) : undefined
        }
      />

        {!costEntryDone && (
          <MasterFunnelLanding
            config={MASTER_LANDING_TAMTRU}
            activeTab={contextTab}
            onTabChange={setContextTab}
            onContinue={() => setCostEntryDone(true)}
          />
        )}

        {costEntryDone && !rejectionStepDone && (
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
                          "예)\n- 신고가 거절되었습니다.\n- 임대차 계약서 문제라고 들었습니다.\n- 집주인 확인서가 부족하다고 안내받았습니다.\n- 정확한 이유를 듣지 못했습니다.\n\n자유롭게 작성해주세요."
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

        {/* 법률 긴급 에스컬레이션 (최우선 처리) */}
        {costEntryDone && rejectionStepDone && showLegalEscalation ? (
          <div className="mt-8 rounded-3xl bg-white border border-red-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <ShieldAlert className="text-red-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              법률긴급구조센터로 바로 연결이 필요합니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              집주인이 임시거주 등록을 거부하거나 금전을 요구하는 경우, 단순
              행정 문제가 아니라 분쟁·갈취 사안으로 다뤄야 합니다. VFBCAI
              전문 변호사가 직접 확인합니다.
            </p>
            <Link
              href="/consultation?case=tamtru-landlord-dispute"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              법률긴급구조센터 상담 신청
            </Link>
            <button
              onClick={reset}
              className="mt-3 block text-xs text-gray-400 hover:text-gray-600"
            >
              {LEAD_FORM_MESSAGES[lang].resetLabel}
            </button>
          </div>
        ) : costEntryDone && rejectionStepDone && !showResult ? (
          <>
            {/* STEP 1: 숙소 형태 */}
            {!housing && (
              <div className="mt-4 sm:mt-5">
                <VerifyStepLayout
                  engine="check"
                  step={2}
                  question={
                    <QuestionSection
                      step={2}
                      title="현재 숙소 형태가 어떻게 되시나요?"
                      description="현재 상황에 맞춰 확인하기 위해 필요한 항목입니다. 숙소 형태에 따라 등록 방법이 달라집니다."
                      {...checkQuestionProps}
                    >
                      <VerifyAnswerGrid step={2}>
                        <SelectionCard
                          variant="quiet"
                          title="호텔 · 게스트하우스"
                          description="숙박업소에 머무는 경우"
                          selected={selectedKey === "hotel"}
                          tone="blue"
                          icon={Building}
                          onClick={() => {
                            setSelectedKey("hotel");
                            setTimeout(() => {
                              setHousing("hotel");
                              setSelectedKey(null);
                            }, 300);
                          }}
                        />
                        <SelectionCard
                          variant="quiet"
                          title="개인주택 · 아파트 · 지인집"
                          description="임대 또는 지인 거주"
                          selected={selectedKey === "personal"}
                          tone="blue"
                          icon={HomeIcon}
                          onClick={() => {
                            setSelectedKey("personal");
                            setTimeout(() => {
                              setHousing("personal");
                              setSelectedKey(null);
                            }, 300);
                          }}
                        />
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

            {/* 호텔인 경우: 바로 결과 */}
            {housing === "hotel" && (
              <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <CheckCircle2 className="text-emerald-600" size={28} />
                <p className="mt-4 text-lg font-bold text-gray-900">
                  등록 의무는 숙박업소에 있습니다
                </p>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  호텔·게스트하우스는 법적으로 투숙객의 임시거주 등록을 직접
                  처리해야 합니다. 프론트 데스크에서 처리 여부를 확인만
                  하시면 됩니다.
                </p>
                <div className="mt-4">
                  <NoticeCard tone="warning">
                    체크인 시 여권을 제출하지 않으셨다면, 지금 프론트에
                    문의하세요.
                  </NoticeCard>
                </div>
                <button
                  onClick={reset}
                  className="mt-4 text-xs text-gray-400 hover:text-gray-600"
                >
                  다른 숙소 형태로 다시 확인하기
                </button>
              </div>
            )}

            {/* STEP 2: 개인주택인 경우 - 집주인 이슈 확인 */}
            {housing === "personal" && landlordIssue === null && (
              <div className="mt-4 sm:mt-5">
                <VerifyStepLayout
                  engine="check"
                  step={3}
                  question={
                    <QuestionSection
                      step={3}
                      title="집주인이 등록을 거부하거나 금전을 요구하시나요?"
                      description="현재 상황에 맞춰 확인하기 위해 필요한 항목입니다. 분쟁·갈취 사안이면 법률 긴급 연결이 필요합니다."
                      {...checkQuestionProps}
                    >
                      <VerifyAnswerGrid step={2}>
                        <SelectionCard
                          variant="quiet"
                          title="네, 그렇습니다"
                          description="분쟁·갈취 사안으로 전문 변호사 확인이 필요합니다."
                          selected={selectedKey === "landlord-yes"}
                          tone="red"
                          onClick={() => {
                            setSelectedKey("landlord-yes");
                            setTimeout(() => {
                              setLandlordIssue(true);
                              setSelectedKey(null);
                            }, 300);
                          }}
                        />
                        <SelectionCard
                          variant="quiet"
                          title="아니요"
                          description="정상적으로 신고 절차를 진행할 수 있습니다."
                          selected={selectedKey === "landlord-no"}
                          tone="blue"
                          onClick={() => {
                            setSelectedKey("landlord-no");
                            setTimeout(() => {
                              setLandlordIssue(false);
                              setSelectedKey(null);
                            }, 300);
                          }}
                        />
                      </VerifyAnswerGrid>
                    </QuestionSection>
                  }
                  actions={
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedKey(null);
                        setHousing(null);
                      }}
                      className={CHECK_BACK_BUTTON_CLASS}
                    >
                      <ArrowLeft size={14} /> 이전 단계로
                    </button>
                  }
                />
              </div>
            )}

            {/* STEP 3: 경과일 */}
            {housing === "personal" && landlordIssue === false && !timing && (
              <div className="mt-4 sm:mt-5">
                <VerifyStepLayout
                  engine="check"
                  step={4}
                  question={
                    <QuestionSection
                      step={4}
                      title="베트남에 도착(또는 숙소 이동)하신 지 얼마나 되셨나요?"
                      description="현재 상황에 맞춰 확인하기 위해 필요한 항목입니다. 신고 기한은 도착·이동 시점부터 계산됩니다."
                      {...checkQuestionProps}
                    >
                      <VerifyAnswerGrid step={3}>
                        {[
                          { key: "within12", label: "12시간 이내", desc: "신고 기한 내 여유가 있습니다." },
                          { key: "within24", label: "12~24시간", desc: "신고 기한이 임박했습니다." },
                          { key: "over24", label: "24시간 초과", desc: "기한이 지났을 가능성이 높습니다." },
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
                                setTiming(opt.key as Timing);
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
                        setLandlordIssue(null);
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
        ) : null}

        {/* 1번째 화면 (가입 전) — Premium lead capture */}
        {costEntryDone && showResult && (result === "possible" || result === "conditional") && !leadSubmitted && (
          <PremiumLeadCapture
            tone={result}
            diagnosis={diagnosis}
            messengers={messengers}
            lang={lang}
            submitting={submitting}
            leadError={leadError}
            consentOpen={consentOpen}
            consentHighlight={consentHighlight}
            onConsentToggle={() => setConsentOpen((v) => !v)}
            onConsentChecked={() => setConsentHighlight(false)}
            onSubmit={handleLeadSubmit}
            onReset={reset}
            showOverdueNotice={timing === "over24"}
          />
        )}

        {/* 2번째 화면 (가입 직후) — 공식 결과 + 다음 단계 */}
        {costEntryDone && showResult && result === "possible" && leadSubmitted && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CheckDiagnosisHeader />

            {diagnosis && (
              <ResultOverviewCards diagnosis={diagnosis} docCount={TAMTRU_REQUIRED_DOCUMENTS.length} />
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
              expertPending={expertLoginPending}
              expertError={expertLoginError}
              aiReportPending={aiReportPending}
              aiReportError={aiReportError}
              officialUrl={TAMTRU_OFFICIAL_URL}
            />
            <div className="mt-2">
              <InfoBox>
                베트남 출입국관리국 전자포털(임시거주 신고 페이지)로
                이동합니다. 화면 안내에 따라 신고 내용을 확인하고
                진행하시면 됩니다.
              </InfoBox>
            </div>

            <button
              onClick={reset}
              className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
            >
              처음부터 다시 확인하기
            </button>
          </div>
        )}

        {costEntryDone && showResult && result === "conditional" && leadSubmitted && (
          <div className="mt-8 rounded-3xl bg-white border border-amber-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CheckDiagnosisHeader />

            {diagnosis && (
              <ResultOverviewCards diagnosis={diagnosis} docCount={TAMTRU_REQUIRED_DOCUMENTS.length} />
            )}

            {diagnosis && <CheckResultOfficialSection diagnosis={diagnosis} />}

            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800 leading-relaxed">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              신고 기한이 지났을 가능성이 있어, 직접 진행하실 경우 서류 준비나
              절차에서 어려움을 겪으실 수 있습니다. 그래도 직접 진행을 원하신다면
              아래에서 선택하실 수 있습니다.
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
              expertPending={expertLoginPending}
              expertError={expertLoginError}
              aiReportPending={aiReportPending}
              aiReportError={aiReportError}
              officialUrl={TAMTRU_OFFICIAL_URL}
            />
            <div className="mt-2">
              <InfoBox>
                베트남 출입국관리국 전자포털(임시거주 신고 페이지)로
                이동합니다. 화면 안내에 따라 신고 내용을 확인하고
                진행하시면 됩니다.
              </InfoBox>
            </div>

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
