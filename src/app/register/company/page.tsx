"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  ExternalLink,
  Building2,
  UserRound,
  Landmark,
  WalletCards,
  MapPin,
  UserCheck,
  FileText,
  Clock,
  FileCheck2,
  FileWarning,
} from "lucide-react";
import {
  SelectionCard,
  QuestionSection,
  PrimaryButton,
  NoticeCard,
  InfoBox,
} from "@/components/ui";
import type { SelectionCardTone } from "@/components/ui/SelectionCard";
import { getRequiredDocuments } from "@/lib/requiredDocuments";
import { MESSENGERS_KO } from "@/lib/messenger";
import { supabase } from "@/lib/supabase";
import { saveLeadContact } from "@/lib/leadContact";
import {
  getCheckDiagnosis,
  computePermitCompanyResultTone,
  type DiagnosisResult,
  type ResultTone,
  type PermitInvestorType,
  type PermitCapital,
  type PermitOffice,
  type PermitResidentRep,
} from "@/lib/checkDiagnosis";

// 국가기업등록포털 (Cổng Thông tin quốc gia về đăng ký doanh nghiệp).
// IRC/ERC 신청 메뉴 및 관할 기관(Sở Kế hoạch và Đầu tư) 안내로 연결됨.
const PERMIT_COMPANY_OFFICIAL_URL = "https://dangkykinhdoanh.gov.vn/";

type InvestorChoice = PermitInvestorType | "local_nominee";
type Capital = PermitCapital;
type Office = PermitOffice;
type ResidentRep = PermitResidentRep;
type Result = ResultTone | null;


const INVESTOR_OPTIONS: {
  key: InvestorChoice;
  label: string;
  desc: string;
  icon: typeof Building2;
  tone: SelectionCardTone;
}[] = [
  {
    key: "corporate",
    label: "한국 본사(법인)가 투자",
    desc: "해외 법인이 베트남 법인의 투자자가 되는 방식입니다.",
    icon: Building2,
    tone: "blue",
  },
  {
    key: "individual",
    label: "개인이 직접 투자",
    desc: "개인이 직접 주주 또는 소유주로 참여하는 방식입니다.",
    icon: UserRound,
    tone: "green",
  },
  {
    key: "local_nominee",
    label: "베트남 현지인 명의 활용 고려",
    desc: "명의 분쟁과 투자금 손실 위험을 먼저 확인해야 합니다.",
    icon: AlertTriangle,
    tone: "red",
  },
];

const CAPITAL_OPTIONS: {
  key: NonNullable<Capital>;
  label: string;
  desc: string;
  icon: typeof WalletCards;
  tone: SelectionCardTone;
}[] = [
  {
    key: "confirmed",
    label: "준비되어 있음",
    desc: "투자금에 맞는 재정능력 증빙을 준비했습니다.",
    icon: WalletCards,
    tone: "green",
  },
  {
    key: "unconfirmed",
    label: "아직 미확정",
    desc: "잔고증명서 또는 재무자료를 아직 준비 중입니다.",
    icon: FileWarning,
    tone: "amber",
  },
];

const OFFICE_OPTIONS: {
  key: NonNullable<Office>;
  label: string;
  desc: string;
  icon: typeof MapPin;
  tone: SelectionCardTone;
}[] = [
  {
    key: "secured",
    label: "체결 완료",
    desc: "본점 또는 사업장 임대차 계약을 완료했습니다.",
    icon: MapPin,
    tone: "green",
  },
  {
    key: "unsecured",
    label: "아직 미체결",
    desc: "법인 주소로 사용할 장소가 아직 확정되지 않았습니다.",
    icon: FileWarning,
    tone: "amber",
  },
];

const RESIDENT_OPTIONS: {
  key: NonNullable<ResidentRep>;
  label: string;
  desc: string;
  icon: typeof UserCheck;
  tone: SelectionCardTone;
}[] = [
  {
    key: "yes",
    label: "예, 상주 근무 예정",
    desc: "법정대표자가 베트남에서 상주하며 근무할 예정입니다.",
    icon: UserCheck,
    tone: "green",
  },
  {
    key: "no",
    label: "아니오",
    desc: "법정대표자의 상주 계획이 아직 없거나 미확정입니다.",
    icon: UserRound,
    tone: "amber",
  },
];

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

function ScoreGauge({
  score,
  tone,
}: {
  score: number;
  tone: "possible" | "conditional";
}) {
  const r = 28;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);
  const color = tone === "possible" ? "#059669" : "#d97706";

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
  const tone = resultTone === "possible" ? "possible" : "conditional";
  const toneLabel = tone === "possible" ? "가능" : "조건부 가능";
  const issueCount = checklist.filter((c) => !c.passed).length;
  const boxBg = tone === "possible" ? "bg-emerald-50" : "bg-amber-50";
  const boxText = tone === "possible" ? "text-emerald-800" : "text-amber-800";
  const badgeBg = tone === "possible" ? "bg-emerald-100" : "bg-amber-100";
  const badgeText = tone === "possible" ? "text-emerald-700" : "text-amber-700";

  return (
    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
      <div className="flex items-center gap-3.5">
        <ScoreGauge score={feasibilityScore} tone={tone} />
        <div>
          <p className="text-sm font-bold text-gray-900">{toneLabel}</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {issueCount > 0 ? `준비 필요한 항목 ${issueCount}건` : "준비 완료된 항목뿐입니다"}
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
        추천 분야: 기업설립
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


function CompanyOverviewCards({
  diagnosis,
  investorType,
  docCount,
}: {
  diagnosis: DiagnosisResult;
  investorType: PermitInvestorType;
  docCount: number;
}) {
  const { feasibilityScore, resultTone, estimatedDays, checklist } =
    diagnosis.customerView;
  const failedCount = checklist.filter((item) => !item.passed).length;
  const cards = [
    {
      icon: Landmark,
      label: "투자 방식",
      value: investorType === "corporate" ? "법인 투자" : "개인 투자",
      description: "선택한 투자자 유형에 맞춰 서류를 구분합니다.",
    },
    {
      icon: CheckCircle2,
      label: "가능성",
      value: `${feasibilityScore}%`,
      description:
        resultTone === "possible"
          ? "현재 입력값 기준 가능성이 높습니다."
          : "일부 요건을 추가로 확인해야 합니다.",
    },
    {
      icon: AlertTriangle,
      label: "보완 항목",
      value: failedCount > 0 ? `${failedCount}개` : "없음",
      description: "체크리스트 미충족 항목을 기준으로 표시합니다.",
    },
    {
      icon: FileText,
      label: "준비서류",
      value: `${docCount}개`,
      description: "개인·법인 투자 방식에 맞는 전용 목록입니다.",
    },
    {
      icon: Clock,
      label: "예상기간",
      value: estimatedDays
        ? `${estimatedDays.min}~${estimatedDays.max}일`
        : "확인 필요",
      description: "서류와 관할기관에 따라 달라질 수 있습니다.",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-2xl border border-gray-200 bg-white p-4"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-900">
              <Icon size={18} />
            </div>
            <p className="mt-3 text-[11px] font-semibold text-gray-500">
              {card.label}
            </p>
            <p className="mt-1 text-sm font-extrabold text-gray-900">
              {card.value}
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function CompanyLeadCapture({
  diagnosis,
  investorType,
  onSubmit,
  submitting,
  error,
  consentOpen,
  consentHighlight,
  onConsentToggle,
  onConsentChecked,
  messengers,
}: {
  diagnosis: DiagnosisResult;
  investorType: PermitInvestorType;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
  error: string | null;
  consentOpen: boolean;
  consentHighlight: boolean;
  onConsentToggle: () => void;
  onConsentChecked: () => void;
  messengers: typeof MESSENGERS_KO;
}) {
  const { feasibilityScore, resultTone } = diagnosis.customerView;
  const possible = resultTone === "possible";

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
      <div className="border-b border-gray-100 bg-gradient-to-r from-blue-950 to-blue-800 px-6 py-6 text-white">
        <p className="text-xs font-bold text-blue-100">
          {investorType === "corporate" ? "법인 투자" : "개인 투자"} · 무료 AI 리포트
        </p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-2xl font-black">{feasibilityScore}%</p>
            <p className="mt-1 text-sm text-blue-100">
              {possible ? "법인설립 진행 가능성이 높습니다." : "보완 후 진행 가능성을 확인할 수 있습니다."}
            </p>
          </div>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
            개인정보 입력 후 확인
          </span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-3 p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="name" required placeholder="이름" className="h-12 rounded-xl border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none" />
          <input name="phone" required placeholder="전화번호" className="h-12 rounded-xl border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none" />
        </div>
        <input name="address" required placeholder="현재 거주지 주소" className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none" />
        <input name="email" type="email" placeholder="이메일 (선택)" className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none" />
        <div className="grid grid-cols-2 gap-3">
          <input name="kakao_id" placeholder={`${messengers.primary.label} ID (선택)`} className="h-12 rounded-xl border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none" />
          <input name="zalo_id" placeholder={`${messengers.secondary.label} ID (선택)`} className="h-12 rounded-xl border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none" />
        </div>
        <div>
          <label className="flex items-start gap-2 text-xs leading-relaxed text-gray-600">
            <input
              type="checkbox"
              name="agreeTerms"
              className="mt-0.5"
              onChange={(e) => {
                if (e.target.checked) onConsentChecked();
              }}
            />
            <span>(필수) {CONSENT_SUMMARY}</span>
          </label>
          <ConsentDetails
            open={consentOpen}
            onToggle={onConsentToggle}
            highlight={consentHighlight}
          />
        </div>
        {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
        <PrimaryButton type="submit" loading={submitting}>
          무료 AI 리포트 확인하기
        </PrimaryButton>
        <InfoBox>입력하신 정보는 결과 확인과 상담 안내 목적으로만 사용됩니다.</InfoBox>
      </form>
    </section>
  );
}

export default function PermitCompanyCheckPage() {
  const [investorChoice, setInvestorChoice] = useState<InvestorChoice | null>(null);
  const [capital, setCapital] = useState<Capital>(null);
  const [office, setOffice] = useState<Office>(null);
  const [residentRep, setResidentRep] = useState<ResidentRep>(null);
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
  const rejectionRecordIdRef = useRef<string | null>(null);
  const pendingRejectionInsertRef = useRef<PromiseLike<void> | null>(null);
  const messengers = MESSENGERS_KO;
  const selfNotifySentRef = useRef(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [resultToken, setResultToken] = useState<string | null>(null);
  const [aiReportPending, setAiReportPending] = useState(false);
  const [aiReportError, setAiReportError] = useState<string | null>(null);

  const isLocalNominee = investorChoice === "local_nominee";
  const investorType: PermitInvestorType =
    investorChoice === "corporate" || investorChoice === "individual" ? investorChoice : null;
  const isCorporate = investorType === "corporate";

  const result: Result = computePermitCompanyResultTone(capital, office);
  const showResult = investorType && capital && office && residentRep;
  const documentService =
    investorType === "corporate"
      ? "permit_company_corporate"
      : investorType === "individual"
      ? "permit_company_individual"
      : "permit_company";
  const documentConfig = getRequiredDocuments(documentService);

  useEffect(() => {
    let cancelled = false;
    if (showResult) {
      getCheckDiagnosis({
        service: "permit_company",
        investorType,
        capital,
        office,
        residentRep,
      }).then((res) => {
        if (!cancelled) setDiagnosis(res);
      });
    } else {
      setDiagnosis(null);
    }
    return () => {
      cancelled = true;
    };
  }, [investorType, capital, office, residentRep, showResult]);

  // "네, 있습니다" 클릭 즉시 익명으로 저장 — 회원가입 여부와 무관하게 데이터가 남는다.
  // 삽입 Promise를 ref에 저장해두고, "다음" 클릭 시 이 Promise가 끝날 때까지
  // 기다린 뒤 사유를 업데이트한다 (빠르게 연속 클릭해도 순서가 꼬이지 않도록).
  // (check/wp/page.tsx와 동일한 패턴)
  function recordRejectionAnonymously() {
    const id = crypto.randomUUID();
    pendingRejectionInsertRef.current = supabase
      .from("previous_rejections")
      .insert({
        id,
        service_type: "permit_company",
        source_page: "/register/company",
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
    setInvestorChoice(null);
    setCapital(null);
    setOffice(null);
    setResidentRep(null);
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
    rejectionRecordIdRef.current = null;
    pendingRejectionInsertRef.current = null;
    selfNotifySentRef.current = false;
    setSelectedKey(null);
    setResultToken(null);
    setAiReportPending(false);
    setAiReportError(null);
  }

  async function openDocuments(next: "documents" | "documents_ai_report") {
    if (!leadId || !investorType) return;
    const storageValue = investorType === "corporate" ? "corporate" : "individual";
    window.sessionStorage.setItem("permitCompanyInvestorType", storageValue);

    if (!resultToken) {
      const message = "로그인 정보를 준비하지 못했습니다. 다시 신청해주세요.";
      if (next === "documents_ai_report") setAiReportError(message);
      else setAgencyError(message);
      return;
    }

    const res = await fetch("/api/auto-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: resultToken, next }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.actionLink) {
      throw new Error("auto-login failed");
    }
    window.location.href = data.actionLink;
  }

  async function handleAgencyRequest() {
    if (!leadId) return;
    setAgencySaving(true);
    setAgencyError(null);
    try {
      const { error } = await supabase.from("crm_activities").insert({
        lead_id: leadId,
        action: "agency_upgrade_request",
        tag: "PERMIT_COMPANY",
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

      await openDocuments("documents");
    } catch {
      setAgencyError("접수 또는 로그인 처리 중 문제가 발생했습니다. 다시 시도해주세요.");
      setAgencySaving(false);
    }
  }

  async function handleAiReportRequest() {
    if (!leadId) return;
    setAiReportPending(true);
    setAiReportError(null);
    try {
      await openDocuments("documents_ai_report");
    } catch {
      setAiReportError("로그인 처리 중 문제가 발생했습니다. 다시 시도해주세요.");
      setAiReportPending(false);
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
      service_type: "permit_company",
      result: result,
      source_page: "/register/company",
    });

    if (error) {
      console.error(error);
      setLeadError("접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    await supabase.from("crm_activities").insert({
      lead_id: newLeadId,
      action: "permit_company_diagnosis_lead",
      tag: "PERMIT_COMPANY",
      meta: diagnosis
        ? {
            feasibilityScore: diagnosis.customerView.feasibilityScore,
            investorType,
            documentService,
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

    // 익명으로 미리 저장해둔 거절 이력 기록이 있으면 이번 리드와 연결
    // (저장이 아직 진행 중일 수 있으므로 먼저 기다린다)
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

  const resultScreenActive = Boolean(showResult && leadSubmitted && diagnosis);

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="h-[3px] bg-blue-900" />
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6 sm:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft size={15} /> 홈으로
        </Link>

        <div className="mt-6 flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-blue-700">
              REGISTER · 외국인투자 법인설립
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
              법인설립 가능성 진단
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base">
              개인 투자와 법인 투자를 구분해 질문하고, 선택한 상황에 맞는 전용
              준비서류를 업로드 단계에 자동으로 연결합니다.
            </p>
          </div>
          {resultScreenActive && diagnosis && (
            <div className="hidden rounded-2xl border border-blue-100 bg-white px-5 py-4 text-right shadow-sm sm:block">
              <p className="text-xs font-semibold text-gray-500">가능성 점수</p>
              <p className="mt-1 text-3xl font-black text-blue-900">
                {diagnosis.customerView.feasibilityScore}%
              </p>
            </div>
          )}
        </div>

        {!rejectionStepDone && (
          <div className="mt-9">
            <QuestionSection
              step={1}
              title="이전에 법인설립 신청이 거절·반려된 적이 있나요?"
            >
              <div className="grid grid-cols-2 gap-3">
                <SelectionCard
                  title="네, 있습니다"
                  description="이전 신청에서 거절 또는 보완 요청을 받은 적이 있습니다."
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

            {previousRejection === true && (
              <div className="mt-4">
                <div className="flex items-start gap-3 rounded-2xl border-2 border-blue-100 bg-blue-50/60 p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                    AI
                  </span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      거절 사유를 알려주시면 더 정확히 분석합니다.
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600">
                      작성하지 않아도 다음 단계로 진행할 수 있습니다.
                    </p>
                  </div>
                </div>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="거절 또는 보완 요청 사유를 자유롭게 작성해주세요. (선택)"
                  rows={5}
                  className="mt-3 w-full resize-none rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-sm focus:border-blue-700 focus:outline-none"
                />
                <PrimaryButton onClick={finalizeRejectionStep} className="mt-3">
                  다음
                </PrimaryButton>
              </div>
            )}
          </div>
        )}

        {rejectionStepDone && !investorChoice && (
          <div className="mt-9">
            <QuestionSection step={2} title="어떤 방식으로 투자하시나요?">
              <div className="grid gap-3">
                {INVESTOR_OPTIONS.map((option) => (
                  <SelectionCard
                    key={option.key}
                    title={option.label}
                    description={option.desc}
                    icon={option.icon}
                    tone={option.tone}
                    selected={selectedKey === option.key}
                    onClick={() => {
                      setSelectedKey(option.key);
                      setTimeout(() => {
                        setInvestorChoice(option.key);
                        setSelectedKey(null);
                      }, 300);
                    }}
                  />
                ))}
              </div>
            </QuestionSection>
          </div>
        )}

        {rejectionStepDone && isLocalNominee && (
          <div className="mt-9">
            <NoticeCard tone="danger" title="현지인 명의 방식은 법적 보호가 어렵습니다">
              명의자와의 분쟁이나 투자금 손실 위험이 있어 개인 투자 또는 법인
              투자 방식으로 먼저 가능성을 확인하시길 권합니다.
            </NoticeCard>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <PrimaryButton variant="amber" onClick={() => setInvestorChoice(null)}>
                투자 방식 다시 선택
              </PrimaryButton>
              <Link
                href="/consultation?case=permit-local-nominee-warning"
                className="flex h-[52px] items-center justify-center rounded-xl border border-red-600 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                전문가와 바로 상담하기
              </Link>
            </div>
          </div>
        )}

        {rejectionStepDone && investorType && !capital && (
          <div className="mt-9">
            <QuestionSection
              step={3}
              title={
                isCorporate
                  ? "투자법인의 재정능력 증빙이 준비되어 있나요?"
                  : "투자금 이상의 개인 은행 잔고증명서가 있나요?"
              }
            >
              <div className="grid grid-cols-2 gap-3">
                {CAPITAL_OPTIONS.map((option) => (
                  <SelectionCard
                    key={option.key}
                    title={option.label}
                    description={option.desc}
                    icon={option.icon}
                    tone={option.tone}
                    selected={selectedKey === option.key}
                    onClick={() => {
                      setSelectedKey(option.key);
                      setTimeout(() => {
                        setCapital(option.key);
                        setSelectedKey(null);
                      }, 300);
                    }}
                  />
                ))}
              </div>
            </QuestionSection>
          </div>
        )}

        {rejectionStepDone && investorType && capital && !office && (
          <div className="mt-9">
            <QuestionSection step={4} title="본점 또는 사업장 임대차 계약을 체결했나요?">
              <div className="grid grid-cols-2 gap-3">
                {OFFICE_OPTIONS.map((option) => (
                  <SelectionCard
                    key={option.key}
                    title={option.label}
                    description={option.desc}
                    icon={option.icon}
                    tone={option.tone}
                    selected={selectedKey === option.key}
                    onClick={() => {
                      setSelectedKey(option.key);
                      setTimeout(() => {
                        setOffice(option.key);
                        setSelectedKey(null);
                      }, 300);
                    }}
                  />
                ))}
              </div>
            </QuestionSection>
          </div>
        )}

        {rejectionStepDone && investorType && capital && office && !residentRep && (
          <div className="mt-9">
            <QuestionSection step={5} title="법정대표자가 베트남에 상주할 예정인가요?">
              <div className="grid grid-cols-2 gap-3">
                {RESIDENT_OPTIONS.map((option) => (
                  <SelectionCard
                    key={option.key}
                    title={option.label}
                    description={option.desc}
                    icon={option.icon}
                    tone={option.tone}
                    selected={selectedKey === option.key}
                    onClick={() => {
                      setSelectedKey(option.key);
                      setTimeout(() => {
                        setResidentRep(option.key);
                        setSelectedKey(null);
                      }, 300);
                    }}
                  />
                ))}
              </div>
            </QuestionSection>
          </div>
        )}

        {showResult && diagnosis && !leadSubmitted && (
          <CompanyLeadCapture
            diagnosis={diagnosis}
            investorType={investorType}
            onSubmit={handleLeadSubmit}
            submitting={submitting}
            error={leadError}
            consentOpen={consentOpen}
            consentHighlight={consentHighlight}
            onConsentToggle={() => setConsentOpen((value) => !value)}
            onConsentChecked={() => setConsentHighlight(false)}
            messengers={messengers}
          />
        )}

        {showResult && diagnosis && leadSubmitted && (
          <section className="mt-9 space-y-5">
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:p-7">
              <div className="flex flex-col gap-5 border-b border-gray-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold tracking-[0.16em] text-blue-700">
                    법인설립 · AI 분석 리포트
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-gray-950">
                    {diagnosis.customerView.resultTone === "possible"
                      ? "법인설립 진행 가능성이 높습니다"
                      : "일부 요건 보완이 필요합니다"}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {investorType === "corporate" ? "법인 투자" : "개인 투자"} 기준으로
                    결과와 준비서류를 구성했습니다.
                  </p>
                </div>
                <div className="rounded-2xl bg-blue-50 px-5 py-4 text-center">
                  <p className="text-xs font-semibold text-blue-700">가능성</p>
                  <p className="mt-1 text-3xl font-black text-blue-950">
                    {diagnosis.customerView.feasibilityScore}%
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <CompanyOverviewCards
                  diagnosis={diagnosis}
                  investorType={investorType}
                  docCount={documentConfig.documents.length}
                />
              </div>

              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/40 p-5">
                <p className="text-sm font-extrabold text-gray-900">AI 요약 의견</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-700">
                  {diagnosis.customerView.note}
                </p>
              </div>

              <div className="mt-5 rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-extrabold text-gray-900">
                      {investorType === "corporate" ? "법인 투자" : "개인 투자"} 전용 준비서류
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      업로드 페이지에서 아래 목록이 그대로 표시됩니다.
                    </p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                    {documentConfig.documents.length}개
                  </span>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {documentConfig.documents.map((document) => (
                    <div key={document} className="flex items-start gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-xs text-gray-700">
                      <FileCheck2 size={15} className="mt-0.5 shrink-0 text-blue-700" />
                      {document}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-900">
                    <Landmark size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-gray-900">
                      전문가 진행 시 법인설립 절차
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                      IRC와 ERC는 고객이 업로드하는 준비서류가 아니라, 검토 완료 후
                      전문가가 작성·신청하는 행정 절차입니다.
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-5">
                  {[
                    "준비서류 업로드",
                    "전문가 서류 검토",
                    "IRC 신청",
                    "ERC 신청",
                    "법인설립 완료",
                  ].map((step, index) => (
                    <div
                      key={step}
                      className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 text-center"
                    >
                      <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-blue-900 text-[10px] font-black text-white">
                        {index + 1}
                      </span>
                      <p className="mt-2 text-xs font-bold text-gray-800">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-black text-gray-900">다음 단계 선택</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                <div className="relative rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
                  <span className="absolute -top-2.5 left-4 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                    필수
                  </span>
                  <p className="mt-1 text-sm font-extrabold text-gray-900">
                    AI 리포트 진행하기
                  </p>
                  <p className="mt-2 min-h-12 text-xs leading-relaxed text-gray-600">
                    고객이 준비한 상황별 증빙서류를 업로드하면 정밀 검토를 시작합니다.
                  </p>
                  <PrimaryButton
                    onClick={handleAiReportRequest}
                    loading={aiReportPending}
                    className="mt-4"
                  >
                    서류 업로드하기
                  </PrimaryButton>
                  {aiReportError && <p className="mt-2 text-xs text-red-600">{aiReportError}</p>}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="text-sm font-extrabold text-gray-900">전문가 진행하기</p>
                  <p className="mt-2 min-h-12 text-xs leading-relaxed text-gray-600">
                    전문가가 준비서류를 검토한 뒤 IRC·ERC 신청 절차를 진행합니다.
                  </p>
                  <PrimaryButton
                    onClick={handleAgencyRequest}
                    loading={agencySaving}
                    className="mt-4"
                  >
                    전문가 진행 요청
                  </PrimaryButton>
                  {agencyError && <p className="mt-2 text-xs text-red-600">{agencyError}</p>}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="text-sm font-extrabold text-gray-900">직접 진행하기</p>
                  <p className="mt-2 min-h-12 text-xs leading-relaxed text-gray-600">
                    국가기업등록포털에서 관할기관과 신청 절차를 직접 확인합니다.
                  </p>
                  <a
                    href={PERMIT_COMPANY_OFFICIAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleSelfPortalClick}
                    className="mt-4 flex h-[52px] items-center justify-center gap-1.5 rounded-xl border border-blue-900 text-sm font-bold text-blue-900 hover:bg-blue-50"
                  >
                    공식 사이트 연결 <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={reset}
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              처음부터 다시 확인하기
            </button>
          </section>
        )}
      </div>
    </main>
  );

}
