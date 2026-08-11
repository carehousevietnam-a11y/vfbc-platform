"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
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
import { recordAgencyUpgradeAndNotify } from "@/lib/agencyUpgradeRequest";
import { supabase } from "@/lib/supabase";
import { saveLeadContact } from "@/lib/leadContact";
import {
  SelectionCard,
  QuestionSection,
  PrimaryButton,
  NoticeCard,
  InfoBox,
  Divider,
} from "@/components/ui";
import {
  getCheckDiagnosis,
  computeLicenseResultTone,
  type DiagnosisResult,
  type LicenseTrc,
  type LicenseHasLicense,
} from "@/lib/checkDiagnosis";

// 운전면허 발급·전환 전국 통합 포털 (2025년 개편 이후 공안부 산하로 이관).
// 신청 과정에서 거주 지역(성/시)을 선택하면 관할 경찰서(CSGT)로 자동 연결됨.
const LICENSE_OFFICIAL_URL = "https://dvc-gplx.csgt.bocongan.gov.vn/";

// 기존 "운전면허 전환에 필요한 서류" 목록과 동일한 4개 항목 — 값 변경 없이
// 새 결과화면의 "3 준비서류 안내" 카드에서 개수 표시용으로만 재사용한다.
const LICENSE_REQUIRED_DOCUMENTS = [
  "여권 사본 (인적사항 페이지)",
  "거주증(TRC) 사본",
  "본국 운전면허 원본",
  "면허 베트남어 공증 번역본 (국적에 따라 상이)",
];

type HasTrc = LicenseTrc;
type HasLicense = LicenseHasLicense;
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

  const sentence1 = `입력하신 정보를 기준으로 운전면허 전환 가능성은 ${toneText} 것으로 분석되었습니다.`;

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

// AI 분석 결과 요약 카드 — 기존 1~5번 결과 영역을 대체하지 않고 그 아래에 추가.
// 흰 배경 · 얇은 테두리 · 작은 아이콘의 차분한 톤.
function ResultSummaryCard({ diagnosis }: { diagnosis: DiagnosisResult }) {
  const { resultTone, checklist, estimatedDays } = diagnosis.customerView;
  const summaryText = buildResultSummaryText(resultTone, checklist, estimatedDays);

  return (
    <div className="mt-3 rounded-2xl bg-white border border-gray-100 p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
          AI
        </span>
        <p className="text-sm font-bold text-gray-900">AI 분석 결과 요약</p>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-gray-700">{summaryText}</p>
    </div>
  );
}

// 다음 단계 선택 — 승인된 목업 기준 순서: AI 리포트 요청하기 → 전문가 진행하기
// → 직접 진행하기. onSelf·onExpert는 기존 핸들러 그대로 재사용, 로직 변경 없음.
// AI 리포트 버튼은 이번 단계에서 API·PDF·상담 페이지 어디와도 연결하지 않는다.
function NextStepOptions({
  onSelf,
  onExpert,
  officialUrl,
  expertPending,
  expertError,
}: {
  onSelf: () => void;
  onExpert: () => void;
  officialUrl: string;
  expertPending?: boolean;
  expertError?: string | null;
}) {
  return (
    <div>
      <p className="mt-5 text-sm font-bold text-gray-900">다음 단계 선택</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-3 sm:items-stretch">
        {/* 1) AI 리포트 요청하기 — "필수" 강조 (아직 연결 없음) */}
        <div className="relative flex h-full flex-col rounded-2xl border border-blue-100 bg-blue-50/30 p-4">
          <span className="absolute -top-2.5 left-4 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
            필수
          </span>
          <p className="mt-1 text-sm font-bold text-gray-900">AI 리포트 요청하기</p>
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
              className="flex h-[52px] w-full items-center justify-center gap-1 rounded-xl border border-blue-300 bg-white text-[13px] font-semibold text-blue-800 hover:bg-blue-50 transition-colors"
            >
              AI 리포트 요청하기
            </button>
            <p className="mt-2 min-h-[32px] text-center text-[11px] text-slate-500">
              결과는 My Page에서 PDF로 다운로드할 수 있습니다.
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
              전문가 진행 요청하기
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

export default function DrivingLicenseCheckPage() {
  const [trc, setTrc] = useState<HasTrc>(null);
  const [license, setLicense] = useState<HasLicense>(null);
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
  const rejectionRecordIdRef = useRef<string | null>(null);
  const pendingRejectionInsertRef = useRef<PromiseLike<void> | null>(null);
  const [lang, setLang] = useState<SupportedLanguage>("ko");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setLang(resolveLanguage(params.get("lang")));
    }
  }, []);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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
  const messengers = MESSENGERS_BY_LANGUAGE[lang];
  const selfNotifySentRef = useRef(false);
  // /api/lead-submit 응답의 result_tokens.token — "전문가 진행 요청하기" 클릭 시
  // /api/auto-login에 전달해 로그인 세션을 만든 뒤 /documents로 이동시키는 데 쓴다.
  const [resultToken, setResultToken] = useState<string | null>(null);
  const [expertLoginPending, setExpertLoginPending] = useState(false);
  const [expertLoginError, setExpertLoginError] = useState<string | null>(null);

  const result: Result = computeLicenseResultTone(trc, license);
  const showResult = trc === "yes" && !!license;
  // 승인된 목업의 5개 카드 가로 배치를 위해 결과 화면(가입 직후, 진행방법
  // 선택 전 단계)에서만 컨테이너 폭을 넓힌다. 질문/입력 화면은 기존 폭 그대로.
  const resultScreenActive =
    showResult &&
    result === "possible" &&
    leadSubmitted;

  // 진단 완료 시 AI 리포트(customerView + expertBrief) 계산.
  useEffect(() => {
    let cancelled = false;
    if (showResult) {
      getCheckDiagnosis({ service: "license", trc, license }).then((res) => {
        if (!cancelled) setDiagnosis(res);
      });
    } else {
      setDiagnosis(null);
    }
    return () => {
      cancelled = true;
    };
  }, [trc, license, showResult]);

  // "네, 있습니다" 클릭 즉시 익명으로 저장 — 회원가입 여부와 무관하게 데이터가 남는다.
  // 삽입 Promise를 ref에 저장해두고, "다음" 클릭 시 이 Promise가 끝날 때까지
  // 기다린 뒤 사유를 업데이트한다 (빠르게 연속 클릭해도 순서가 꼬이지 않도록).
  function recordRejectionAnonymously() {
    const id = crypto.randomUUID();
    pendingRejectionInsertRef.current = supabase
      .from("previous_rejections")
      .insert({
        id,
        service_type: "driving-license",
        source_page: "/check/driving-license",
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
          tag: "DRIVING_LICENSE",
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

  function reset() {
    setTrc(null);
    setLicense(null);
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
    setResultToken(null);
    setExpertLoginPending(false);
    setExpertLoginError(null);
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
      service_type: "driving-license",
      result: result,
      source_page: "/check/driving-license",
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
      action: "driving_license_diagnosis_lead",
      tag: "DRIVING_LICENSE",
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
    <main className="min-h-screen bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <div className={`mx-auto px-6 py-10 ${resultScreenActive ? "max-w-4xl" : "max-w-xl"}`}>
        {/* 모바일 전용 — 좌측 홈 아이콘 + 실제 로고 이미지(가로 배치) 중앙 정렬, 전체 탭하면 홈으로 이동 */}
        <Link
          href="/"
          className="relative -mx-6 -mt-10 mb-6 flex items-center justify-center gap-2.5 border-b border-gray-100 bg-white px-4 py-3 sm:hidden"
        >
          <span className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-1 text-xs font-medium text-gray-400">
            <ArrowLeft size={14} /> 홈으로
          </span>
          <img
            src="/vfbcai-shield-logo.png"
            alt="VFBCAI"
            width={34}
            height={34}
            className="shrink-0"
          />
          <div>
            <p className="text-[15px] font-bold leading-tight text-gray-900">VFBCAI</p>
            <p className="text-[11px] leading-tight text-gray-400">베트남 행정전문 AI</p>
          </div>
        </Link>

        {/* 데스크톱 전용 — 기존 텍스트 링크 */}
        <Link
          href="/"
          className="hidden items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600 sm:inline-flex"
        >
          <ArrowLeft size={14} /> 홈으로
        </Link>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              직접확인하기 · 베트남 행정전문 AI
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
              베트남 운전면허 전환 가능성 확인
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              거주증(TRC) 보유 여부와 본국 면허 소지 여부에 따라 전환 가능
              여부가 달라집니다.
            </p>
          </div>

          {/* 모바일 전용 — 결과 화면 단계에서만 우측 상단에 원형 점수표 표시 */}
          {resultScreenActive && diagnosis && (
            <div className="shrink-0 sm:hidden">
              <ResultHeaderGauge diagnosis={diagnosis} size={76} />
            </div>
          )}
        </div>

        {!rejectionStepDone && (
          <div className="mt-8">
            <QuestionSection
              step={1}
              title="이전에 다른 곳(정부기관 또는 타 대행사)에서 신청하셨다가 거절·반려되신 적이 있나요?"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <SelectionCard
                  title="네, 있습니다"
                  selected={previousRejection === true}
                  tone="amber"
                  onClick={() => {
                    setPreviousRejection(true);
                    recordRejectionAnonymously();
                  }}
                />
                <SelectionCard
                  title="아니요"
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
                    "예)\n- 전환 신청이 거절되었습니다.\n- 면허 번역공증 문제라고 들었습니다.\n- 거주증(TRC) 요건이 부족하다고 안내받았습니다.\n- 정확한 이유를 듣지 못했습니다.\n\n자유롭게 작성해주세요."
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

        {rejectionStepDone && !trc && (
          <div className="mt-8">
            <QuestionSection step={2} title="현재 거주증(TRC)을 보유하고 계신가요?">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <SelectionCard
                  title="네, 있습니다"
                  description="운전면허 전환 신청 요건을 충족합니다."
                  selected={selectedKey === "trc-yes"}
                  tone="blue"
                  onClick={() => {
                    setSelectedKey("trc-yes");
                    setTimeout(() => {
                      setTrc("yes");
                      setSelectedKey(null);
                    }, 300);
                  }}
                />
                <SelectionCard
                  title="아니요, 없습니다"
                  description="거주증(TRC) 취득이 먼저 필요합니다."
                  selected={selectedKey === "trc-no"}
                  tone="slate"
                  onClick={() => {
                    setSelectedKey("trc-no");
                    setTimeout(() => {
                      setTrc("no");
                      setSelectedKey(null);
                    }, 300);
                  }}
                />
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

        {trc === "yes" && !license && (
          <div className="mt-8">
            <QuestionSection step={3} title="본국(자국)에서 발급된 운전면허를 보유하고 계신가요?">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <SelectionCard
                  title="네, 있습니다"
                  description="전환 신청 대상에 해당합니다."
                  selected={selectedKey === "license-yes"}
                  tone="blue"
                  onClick={() => {
                    setSelectedKey("license-yes");
                    setTimeout(() => {
                      setLicense("yes");
                      setSelectedKey(null);
                    }, 300);
                  }}
                />
                <SelectionCard
                  title="아니요, 없습니다"
                  description="전환이 아닌 신규 취득 절차가 필요합니다."
                  selected={selectedKey === "license-no"}
                  tone="slate"
                  onClick={() => {
                    setSelectedKey("license-no");
                    setTimeout(() => {
                      setLicense("no");
                      setSelectedKey(null);
                    }, 300);
                  }}
                />
              </div>
            </QuestionSection>

            <button
              type="button"
              onClick={() => {
                setSelectedKey(null);
                setTrc(null);
              }}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={14} /> 이전 단계로
            </button>
          </div>
        )}

        {trc === "no" && (
          <div className="mt-8 rounded-3xl bg-white border border-amber-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <AlertTriangle className="text-amber-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              거주증(TRC) 취득이 먼저 필요합니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              베트남 운전면허 전환은 거주증(TRC) 보유자만 신청할 수 있습니다.
              먼저 거주증 발급 가능 여부를 확인해보세요.
            </p>
            <Link
              href="/check/trc"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
            >
              거주증(TRC) 가능성 먼저 확인하기
            </Link>
            <button
              onClick={reset}
              className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
            >
              {LEAD_FORM_MESSAGES[lang].resetLabel}
            </button>
          </div>
        )}

        {/* 1번째 화면 (가입 전) — 리포트 없이 간단하게, 가입 장벽을 낮게 유지 */}
        {showResult && result === "possible" && !leadSubmitted && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <CheckCircle2 className="text-emerald-600" size={28} />
                <p className="mt-4 text-lg font-bold text-gray-900">
                  운전면허 전환이 가능합니다
                </p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  거주증과 본국 면허를 보유하고 있어 베트남 운전면허로 전환
                  신청이 가능합니다.
                </p>
              </div>

              {(() => {
                const score = diagnosis?.customerView.feasibilityScore ?? 90;
                return (
                  <div className="relative flex h-[104px] w-[104px] shrink-0 items-center justify-center">
                    <svg width="104" height="104" viewBox="0 0 104 104" className="absolute inset-0 -rotate-90">
                      <circle cx="52" cy="52" r="46" fill="none" stroke="#E5E7EB" strokeWidth="7" />
                      <circle
                        cx="52"
                        cy="52"
                        r="46"
                        fill="none"
                        stroke="#059669"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 46}
                        strokeDashoffset={2 * Math.PI * 46 * (1 - score / 100)}
                      />
                    </svg>
                    <div className="relative flex flex-col items-center">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <CheckCircle2 size={12} />
                      </span>
                      <strong className="mt-0.5 text-[22px] font-black leading-none text-gray-900">{score}%</strong>
                      <span className="mt-0.5 text-[10px] font-bold text-emerald-600">가능성 높음</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <p className="mt-2 text-xs leading-relaxed text-gray-400">
              * 위 결과는 입력하신 조건을 기준으로 한 1차 자가진단입니다.
              정확한 전환 가능 여부는 서류 검토 후 전문가 상담을 통해
              확정됩니다.
            </p>
            <div className="mt-4">
              <NoticeCard tone="success">
                이름·연락처·주소만 남기시면 AI가 서류를 상세 분석한 리포트를
                바로 보여드립니다.
              </NoticeCard>
            </div>

            <form onSubmit={handleLeadSubmit} className="mt-5 space-y-3">
              <input
                type="text"
                name="name"
                required
                placeholder={LEAD_FORM_MESSAGES[lang].name.placeholder}
                onChange={(e) => setFormValues((v) => ({ ...v, name: e.target.value }))}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                className={`w-full h-11 rounded-lg border px-4 text-sm focus:outline-none ${
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
                className={`w-full h-11 rounded-lg border px-4 text-sm focus:outline-none ${
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
                className={`w-full h-11 rounded-lg border px-4 text-sm focus:outline-none ${
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
                className={`w-full h-11 rounded-lg border px-4 text-sm focus:outline-none ${
                  touched.email && liveErrors.email
                    ? "border-red-300 focus:border-red-400"
                    : "border-gray-200 focus:border-blue-900"
                }`}
              />
              {touched.email && liveErrors.email && (
                <p className="-mt-2 text-xs text-red-600">{liveErrors.email}</p>
              )}
              <div className="grid grid-cols-2 gap-3">
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
                      if (e.target.checked) setConsentHighlight(false);
                      setConsentChecked(e.target.checked);
                    }}
                    className="mt-0.5"
                  />
                  <span>(필수) {LEAD_FORM_MESSAGES[lang].consentSummary}</span>
                </label>
                <ConsentDetails
                  open={consentOpen}
                  onToggle={() => setConsentOpen((v) => !v)}
                  highlight={consentHighlight}
                  lang={lang}
                  messengers={messengers}
                />
              </div>
              {leadError && <p className="text-xs text-red-600">{leadError}</p>}
              <PrimaryButton type="submit" loading={submitting} disabled={!canSubmit}>
                {submitting ? LEAD_FORM_MESSAGES[lang].submitLoadingLabel : LEAD_FORM_MESSAGES[lang].submitLabel}
              </PrimaryButton>
            </form>
            <div className="mt-3">
              <InfoBox>{LEAD_FORM_MESSAGES[lang].privacyNoticeLine}</InfoBox>
            </div>
            <button
              onClick={reset}
              className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
            >
              {LEAD_FORM_MESSAGES[lang].resetLabel}
            </button>
          </div>
        )}

        {/* 2번째 화면 (가입 직후) — AI 리포트 + 직접등록/전문가 진행요청 선택 */}
        {showResult && result === "possible" && leadSubmitted && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              운전면허 전환 · AI 분석 리포트
            </p>

            {diagnosis && (
              <ResultOverviewCards diagnosis={diagnosis} docCount={LICENSE_REQUIRED_DOCUMENTS.length} />
            )}

            {diagnosis && <ResultSummaryCard diagnosis={diagnosis} />}

            <NextStepOptions
              onSelf={handleSelfPortalClick}
              onExpert={handleExpertRequestClick}
              expertPending={expertLoginPending}
              expertError={expertLoginError}
              officialUrl={LICENSE_OFFICIAL_URL}
            />
            <div className="mt-2">
              <InfoBox>
                성/시별 정확한 관할 경찰서(CSGT)를 찾기 위해 국가가 운영하는
                통합 시스템으로 연결됩니다. 지역만 선택하면 바로 연결됩니다.
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

        {trc === "yes" && result === "impossible" && (
          <div className="mt-8 rounded-3xl bg-white border border-red-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <XCircle className="text-red-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              전환이 아닌 신규 취득 절차가 필요합니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              본국 면허가 없으면 전환 신청이 불가능하며, 베트남에서 신규로
              면허를 취득해야 합니다. 절차와 소요 기간이 전환보다 훨씬
              복잡합니다.
            </p>
            <Link
              href="/consultation?case=driving-license-new"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              신규 취득 절차 상담하기
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
