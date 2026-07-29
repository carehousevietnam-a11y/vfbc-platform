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
  Building2,
  UserRound,
  WalletCards,
  MapPin,
  Landmark,
} from "lucide-react";
import { SelectionCard, QuestionSection, PrimaryButton, NoticeCard, InfoBox } from "@/components/ui";
import type { SelectionCardTone } from "@/components/ui/SelectionCard";
import { MESSENGERS_KO } from "@/lib/messenger";
import { supabase } from "@/lib/supabase";
import { saveLeadContact } from "@/lib/leadContact";
import { getRequiredDocuments } from "@/lib/requiredDocuments";
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
// IRC/ERC 신청 메뉴 및 관할 기관 안내로 연결됩니다.
const REGISTER_COMPANY_OFFICIAL_URL = "https://dangkykinhdoanh.gov.vn/";

type InvestorChoice = PermitInvestorType | "local_nominee";
type Capital = PermitCapital;
type Office = PermitOffice;
type ResidentRep = PermitResidentRep;
type Result = ResultTone | null;

const CONSENT_SUMMARY =
  "입력하신 정보로 계정이 자동 생성되며, 개인정보 수집·이용에 동의합니다.";

// CHECK(TRC)의 ConsentDetails와 100% 동일한 컴포넌트 — 문구·구조 그대로 재사용.
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

// ── 질문 옵션 + 아이콘/톤 매핑(표시 전용).
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
// 확인하여 구조·className·순서를 옮겨왔다. 값만 REGISTER(company) 진단 결과로 채운다.

// TRC의 PremiumLeadCapture 안 원형 게이지와 100% 동일한 마크업 — 결과 미리보기(가입 전)용.
function CompanyScoreGauge({
  score,
  tone,
}: {
  score: number;
  tone: ResultTone;
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
  diagnosis: DiagnosisResult;
  size?: number;
}) {
  const isPossible = diagnosis.customerView.resultTone === "possible";
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
            strokeDashoffset={2 * Math.PI * r * (1 - diagnosis.customerView.feasibilityScore / 100)}
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
          {diagnosis.customerView.feasibilityScore}%
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
function CompanyResultOverviewCards({
  diagnosis,
  docCount,
}: {
  diagnosis: DiagnosisResult;
  docCount: number;
}) {
  const { feasibilityScore, resultTone, checklist, estimatedDays } = diagnosis.customerView;
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
      visual: <CompanyScoreGauge score={feasibilityScore} tone={resultTone} />,
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
      caption: "선택한 투자자 유형에 맞는 준비서류 목록입니다.",
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
      caption: "서류 준비부터 법인설립 완료까지의 예상 기간입니다.",
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

function CompanyDesktopResultHeader({
  diagnosis,
}: {
  diagnosis: DiagnosisResult;
}) {
  const isPossible = diagnosis.customerView.resultTone === "possible";

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
              ? "법인설립 진행 가능성이 높습니다"
              : "법인설립 진행 전 추가 확인이 필요합니다"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
            {diagnosis.customerView.note}
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

function CompanyResultSummaryCard({ diagnosis }: { diagnosis: DiagnosisResult }) {
  const bullets = buildAiReasonBullets(
    diagnosis.customerView.feasibilityScore,
    diagnosis.customerView.resultTone,
    diagnosis.customerView.checklist,
    diagnosis.customerView.estimatedDays
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
// 길이·모바일/PC 배열을 그대로 일치시킨 3버튼 CTA. 서비스명(법인설립)과 연결
// 대상(공식 사이트 URL, company CRM)만 Restaurant에 맞게 대체했다.
// AI 리포트 버튼은 TRC 원본에는 연결이 없으나("아직 연결 없음"), REGISTER는
// VERIFY(admin)가 이미 쓰고 있는 auto-login(next=documents_ai_report) 연결을
// 그대로 재사용해 실제로 동작하도록 했다(더 완성된 패턴 채택, 새 CRM action 없음).
function CompanyNextStepOptions({
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
            국가기업등록포털에서 직접 절차를 확인할 수 있습니다.
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
function CompanyLeadCapture({
  diagnosis,
  investorType,
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
  diagnosis: DiagnosisResult;
  investorType: PermitInvestorType;
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
  const isPossible = diagnosis.customerView.resultTone === "possible";

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
              {isPossible ? "법인설립 진행이 가능합니다" : "보완이 필요할 수 있습니다"}
            </p>

            <p className="mt-1 text-xs font-semibold text-blue-700">
              {investorType === "corporate" ? "법인 투자" : "개인 투자"} 기준
            </p>

            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {isPossible
                ? "현재 투자금·사무실 준비 상태 기준으로 법인설립 신청 가능성이 높습니다."
                : "현재 투자금 또는 사무실 준비 상태만으로는 법인설립 진행을 확정하기 어렵습니다. 준비 서류를 보완하면 진행할 수 있는 경우가 많습니다."}
            </p>
          </div>

          <CompanyScoreGauge score={diagnosis.customerView.feasibilityScore} tone={diagnosis.customerView.resultTone} />
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

          {leadError && <p className="text-xs text-red-600">{leadError}</p>}

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
  const [agencySaving, setAgencySaving] = useState(false);
  const [agencyError, setAgencyError] = useState<string | null>(null);

  const [previousRejection, setPreviousRejection] = useState<boolean | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionStepDone, setRejectionStepDone] = useState(false);
  const rejectionRecordIdRef = useRef<string | null>(null);
  const pendingRejectionInsertRef = useRef<PromiseLike<void> | null>(null);
  const selfNotifySentRef = useRef(false);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [resultToken, setResultToken] = useState<string | null>(null);
  const [aiReportPending, setAiReportPending] = useState(false);
  const [aiReportError, setAiReportError] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);

  const messengers = MESSENGERS_KO;
  const isLocalNominee = investorChoice === "local_nominee";
  const investorType: PermitInvestorType =
    investorChoice === "corporate" || investorChoice === "individual"
      ? investorChoice
      : null;
  const isCorporate = investorType === "corporate";

  const result: Result = computePermitCompanyResultTone(capital, office);
  const showResult = Boolean(investorType && capital && office && residentRep);

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

  const documentService =
    investorType === "corporate"
      ? "permit_company_corporate"
      : investorType === "individual"
      ? "permit_company_individual"
      : "permit_company";
  const requiredDocs = getRequiredDocuments(documentService);
  const resultScreenActive = Boolean(showResult && diagnosis && leadSubmitted);

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
    setSubmitting(false);
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
    setDiagnosis(null);
  }

  function rememberInvestorType() {
    if (!investorType) return;
    window.sessionStorage.setItem(
      "permitCompanyInvestorType",
      investorType === "corporate" ? "corporate" : "individual"
    );
  }

  async function handleExpertRequest() {
    if (!leadId || !investorType) return;
    setAgencySaving(true);
    setAgencyError(null);
    rememberInvestorType();

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

  async function handleAiReportRequest() {
    if (!leadId || !investorType) return;
    setAiReportPending(true);
    setAiReportError(null);
    rememberInvestorType();

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
      result,
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
            expertBrief: diagnosis.expertBrief,
            investorType,
            capital,
            office,
            residentRep,
            documentService,
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
      <div className={`mx-auto px-6 py-10 ${resultScreenActive ? "max-w-4xl" : "max-w-xl"}`}>
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
              법인설립 가능성 진단
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              개인 투자와 법인 투자에 따라 질문과 필요서류가 달라집니다.
            </p>
          </div>

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
              title="이전에 다른 곳(정부기관 또는 타 대행사)에서 법인설립을 신청하셨다가 거절·반려되신 적이 있나요?"
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
                      이전에 들으셨던 거절 사유나 보완 요청 내용을 자유롭게
                      작성해주세요. 작성하지 않으셔도 다음 단계로 진행할 수 있습니다.
                    </p>
                  </div>
                </div>

                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={
                    "예)\n- 투자금 증빙이 부족하다고 안내받았습니다.\n- 임대차계약 또는 사업장 용도 문제로 보완 요청을 받았습니다.\n- 정확한 이유를 듣지 못했습니다.\n\n자유롭게 작성해주세요(선택)."
                  }
                  rows={6}
                  className="mt-3 min-h-[160px] w-full resize-none rounded-xl border-2 border-gray-300 bg-white px-4 py-3.5 text-sm leading-relaxed placeholder:text-gray-400 focus:border-[#1D4EDB] focus:outline-none"
                />
                <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
                  작성해주신 내용은 AI가 거절 원인을 분석하고 해결 가능성을 높이는 데 활용됩니다.
                </p>

                <PrimaryButton onClick={finalizeRejectionStep} className="mt-3">
                  다음
                </PrimaryButton>
              </div>
            )}
          </div>
        )}

        {rejectionStepDone && !investorChoice && (
          <div className="mt-8">
            <QuestionSection step={2} title="어떤 방식으로 투자하시나요?">
              <div className="grid grid-cols-1 gap-3">
                {INVESTOR_OPTIONS.map((opt) => (
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
                        setInvestorChoice(opt.key);
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

        {rejectionStepDone && isLocalNominee && (
          <div className="mt-8">
            <NoticeCard tone="danger" title="현지인 명의 방식은 법적 보호가 어렵습니다">
              명의자와의 분쟁이나 투자금 손실 위험이 있어 개인 투자 또는 법인
              투자 방식으로 먼저 가능성을 확인하시길 권합니다.
            </NoticeCard>
            <div className="mt-5 flex flex-col gap-3">
              <PrimaryButton
                variant="amber"
                onClick={() => {
                  setSelectedKey(null);
                  setInvestorChoice(null);
                }}
              >
                다시 선택하기
              </PrimaryButton>
              <Link
                href="/consultation?case=permit-local-nominee-warning"
                className="flex h-[52px] items-center justify-center rounded-xl border border-red-600 text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors"
              >
                전문가와 바로 상담하기
              </Link>
            </div>
          </div>
        )}

        {rejectionStepDone && investorType && !capital && (
          <div className="mt-8">
            <QuestionSection
              step={3}
              title={
                isCorporate
                  ? "감사보고서 또는 은행 잔고증명서가 준비되어 있나요?"
                  : "투자금 이상의 개인 은행 잔고증명서가 있나요?"
              }
            >
              <div className="grid grid-cols-2 gap-3">
                {CAPITAL_OPTIONS.map((opt) => (
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
                        setCapital(opt.key);
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
                setInvestorChoice(null);
              }}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={14} /> 이전 단계로
            </button>
          </div>
        )}

        {rejectionStepDone && investorType && capital && !office && (
          <div className="mt-8">
            <QuestionSection step={4} title="본점 또는 사업장 임대차 계약을 체결하셨나요?">
              <div className="grid grid-cols-2 gap-3">
                {OFFICE_OPTIONS.map((opt) => (
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
                        setOffice(opt.key);
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
                setCapital(null);
              }}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={14} /> 이전 단계로
            </button>
          </div>
        )}

        {rejectionStepDone && investorType && capital && office && !residentRep && (
          <div className="mt-8">
            <QuestionSection step={5} title="법정대표자가 베트남에 상주하며 근무할 예정인가요?">
              <div className="grid grid-cols-2 gap-3">
                {RESIDENT_OPTIONS.map((opt) => (
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
                        setResidentRep(opt.key);
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
                setOffice(null);
              }}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={14} /> 이전 단계로
            </button>
          </div>
        )}

        {showResult && diagnosis && !leadSubmitted && (
          <CompanyLeadCapture
            diagnosis={diagnosis}
            investorType={investorType}
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

        {showResult && diagnosis && leadSubmitted && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              법인설립 · AI 분석 리포트
            </p>

            <CompanyDesktopResultHeader diagnosis={diagnosis} />

            <CompanyResultOverviewCards
              diagnosis={diagnosis}
              docCount={requiredDocs.documents.length}
            />

            <CompanyResultSummaryCard diagnosis={diagnosis} />

            {diagnosis.customerView.resultTone === "conditional" && (
              <div className="mt-3">
                <NoticeCard tone="warning">
                  직접 진행 시 어려움을 겪으실 수 있습니다. 투자자 유형별 준비
                  서류를 보완하면 진행할 수 있는 경우가 많으니, 전문가 진행을
                  권장합니다.
                </NoticeCard>
              </div>
            )}

            <CompanyNextStepOptions
              onSelf={handleSelfPortalClick}
              onExpert={handleExpertRequest}
              onAiReport={handleAiReportRequest}
              officialUrl={REGISTER_COMPANY_OFFICIAL_URL}
              expertPending={agencySaving}
              expertError={agencyError}
              aiReportPending={aiReportPending}
              aiReportError={aiReportError}
            />

            <p className="mt-2 text-[11px] text-gray-400">
              국가기업등록포털(Cổng Thông tin quốc gia về đăng ký doanh nghiệp)의
              법인설립 절차 안내 페이지로 이동합니다. 관할기관·신청 절차·처리
              현황을 확인하실 수 있습니다.
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
