"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Info,
  ExternalLink,
  ShieldCheck,
  Paperclip,
  Clock,
  UserCheck,
  FileSignature,
  Building2,
  Briefcase,
  Stamp,
  Receipt,
  FileQuestion,
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
import { recordAiReportRequestAndNotify } from "@/lib/aiReportRequest";
import { saveLeadContact } from "@/lib/leadContact";
import { getDiagnosis, DiagnosisResult } from "@/lib/verifyDiagnosis";
import { getRequiredDocuments } from "@/lib/requiredDocuments";

const CATEGORY = "admin" as const;

const CONSENT_SUMMARY =
  "입력하신 정보로 계정이 자동 생성되며, 개인정보 수집·이용에 동의합니다.";

// "직접 검토 진행하기" 하위 선택지 — admin 카테고리 전용.
// 카테고리별로 목록이 달라지므로 다른 VERIFY 페이지 확장 시 각각 별도 정의한다.
const ADMIN_AGENCY_OPTIONS = [
  "출입국관리기관",
  "노동관서",
  "세무기관",
  "투자등록기관",
  "사업자등록기관",
  "기타 행정기관",
] as const;

type AdminAgency = (typeof ADMIN_AGENCY_OPTIONS)[number];

type AgencyGuidance = {
  authority: string;
  officialSite: { label: string; url: string };
  submissionSteps: string[];
  requiredDocuments: string[];
  cautions: string[];
};

// 선택한 기관에 따라 달라지는 안내 콘텐츠 — 실제 제출을 대행하는 기능이 아니라
// VERIFY 결과 이후 참고할 수 있는 일반 안내 정보만 제공한다.
const ADMIN_AGENCY_GUIDANCE: Record<AdminAgency, AgencyGuidance> = {
  출입국관리기관: {
    authority:
      "여권·비자·거주증 등 출입국 관련 서류는 출입국관리국(이민관리국) 또는 관할 공안 출입국 부서가 담당합니다.",
    officialSite: { label: "공안부 공공서비스포털", url: "https://dichvucong.bocongan.gov.vn" },
    submissionSteps: [
      "관할 출입국관리국 또는 온라인 포털에서 접수 창구 확인",
      "여권 및 관련 서류 스캔본 준비",
      "포털 또는 창구에서 신청서 작성 및 제출",
      "접수번호 확인 및 처리 예정일 확인",
    ],
    requiredDocuments: [
      "여권 사본 (인적사항 페이지)",
      "현재 보유 비자·거주증 사본",
      "입국일자·체류 목적 증빙",
    ],
    cautions: [
      "체류 기간 만료 전 여유를 두고 신청하는 것이 안전합니다.",
      "여권 정보와 신청서 기재 내용이 정확히 일치해야 합니다.",
      "관할 지역에 따라 접수 창구가 다를 수 있어 사전 확인이 필요합니다.",
    ],
  },
  노동관서: {
    authority:
      "노동허가서, 근로계약 신고 등은 관할 노동보훈사회국 또는 관련 노동관서가 담당합니다.",
    officialSite: { label: "베트남 국가 공공서비스포털", url: "https://dichvucong.gov.vn" },
    submissionSteps: [
      "관할 노동관서 확인",
      "고용계약 및 관련 서류 준비",
      "신청서 작성 및 제출",
      "처리 결과 통지 확인",
    ],
    requiredDocuments: [
      "여권 사본",
      "근로계약서 또는 고용확인서",
      "학력·경력 증빙 서류 (해당 시)",
    ],
    cautions: [
      "노동허가 관련 서류는 갱신 기한을 놓치면 불이익이 발생할 수 있습니다.",
      "고용주 정보와 실제 근무처가 일치해야 합니다.",
      "지역별로 요구서류가 달라질 수 있어 사전 확인이 필요합니다.",
    ],
  },
  세무기관: {
    authority: "세금 신고·고지 관련 사항은 관할 세무서 또는 세무총국이 담당합니다.",
    officialSite: { label: "베트남 국가 공공서비스포털", url: "https://dichvucong.gov.vn" },
    submissionSteps: [
      "관할 세무서 확인",
      "세금 고지서 또는 신고서 내용 확인",
      "필요 서류 준비 후 제출 또는 온라인 신고",
      "납부 또는 이의신청 기한 확인",
    ],
    requiredDocuments: [
      "사업자등록증 사본 (해당 시)",
      "세금 고지서 원본",
      "관련 증빙 자료",
    ],
    cautions: [
      "납부 기한을 넘기면 가산세가 부과될 수 있습니다.",
      "사업자번호·명의가 정확히 일치하는지 확인이 필요합니다.",
      "관할 세무서는 사업장 소재지에 따라 달라집니다.",
    ],
  },
  투자등록기관: {
    authority: "투자등록증(IRC) 관련 사항은 관할 기획투자국이 담당합니다.",
    officialSite: { label: "베트남 국가 공공서비스포털", url: "https://dichvucong.gov.vn" },
    submissionSteps: [
      "관할 기획투자국 확인",
      "투자 프로젝트 관련 서류 준비",
      "신청서 제출 및 접수증 수령",
      "심사 및 등록증 발급 확인",
    ],
    requiredDocuments: [
      "투자자 신원 증빙 서류",
      "투자 계획서 또는 사업계획서",
      "자본금 증빙 자료",
    ],
    cautions: [
      "투자 분야에 따라 추가 승인 절차가 필요할 수 있습니다.",
      "제출 서류의 번역·공증이 요구될 수 있습니다.",
      "처리 기간이 지역·분야에 따라 달라질 수 있습니다.",
    ],
  },
  사업자등록기관: {
    authority: "사업자등록증(ERC) 관련 사항은 관할 기획투자국 사업등록과 또는 국가 사업자등록 포털이 담당합니다.",
    officialSite: { label: "국가 사업자등록포털", url: "https://dangkykinhdoanh.gov.vn" },
    submissionSteps: [
      "온라인 포털 또는 관할 등록과에서 접수 창구 확인",
      "정관·출자자 정보 등 필요 서류 준비",
      "신청서 온라인 제출 또는 방문 접수",
      "등록증 발급 및 사업자번호 확인",
    ],
    requiredDocuments: [
      "정관 초안 또는 사본",
      "출자자·대표자 신원 증빙",
      "본점 소재지 증빙 서류",
    ],
    cautions: [
      "등록 정보와 실제 사업 현황이 다르면 추후 정정 절차가 필요합니다.",
      "업종에 따라 추가 조건부 인허가가 필요할 수 있습니다.",
      "등록 후 세무·사회보험 신고 등 후속 절차가 이어집니다.",
    ],
  },
  "기타 행정기관": {
    authority:
      "위 항목에 해당하지 않는 서류는 발급기관명 또는 서류 상단 표기를 통해 관할기관을 확인하는 것이 가장 정확합니다.",
    officialSite: { label: "베트남 국가 공공서비스포털", url: "https://dichvucong.gov.vn" },
    submissionSteps: [
      "서류 발급기관 및 관할 창구 확인",
      "포털 또는 창구에서 안내하는 신청서 양식 작성",
      "요구되는 첨부서류 준비 및 제출",
      "접수증 또는 처리 예정일 확인",
    ],
    requiredDocuments: [
      "여권 사본 (인적사항 페이지)",
      "관련 비자·거주증 등 현재 보유 서류 사본",
      "서류 종류별로 요구되는 추가 증빙 (기관 안내 확인 필요)",
    ],
    cautions: [
      "제출 기한이 있는 서류는 기한을 넘기면 반려·가산 불이익이 발생할 수 있습니다.",
      "인적사항이 실제 서류와 정확히 일치하는지 제출 전 다시 확인하세요.",
      "관할기관 및 절차는 지역·서류 종류에 따라 달라질 수 있어, 정확한 확인은 해당 기관에 직접 문의하시기 바랍니다.",
    ],
  },
};

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

function levelIcon(level: "info" | "warning" | "critical") {
  if (level === "critical") return <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-600" />;
  if (level === "warning") return <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-600" />;
  return <Info size={14} className="mt-0.5 shrink-0 text-gray-400" />;
}

function riskFactorBadgeClass(level: "critical" | "high" | "caution") {
  if (level === "critical") return "bg-red-50 text-red-700 border border-red-100";
  if (level === "high") return "bg-amber-50 text-amber-700 border border-amber-100";
  return "bg-gray-50 text-gray-600 border border-gray-100";
}

function riskFactorLabel(level: "critical" | "high" | "caution") {
  if (level === "critical") return "치명적 위험";
  if (level === "high") return "높은 위험";
  return "주의";
}

// 진단 리포트 — diagnosis.report(11개 항목)가 있으면 이걸 우선 렌더링.
// report가 없는 경우(구버전 데이터 등)를 대비해 기존 headline/checklist/note
// 렌더링은 그대로 보존해 폴백으로 사용한다.
function DiagnosisReportSection({ diagnosis }: { diagnosis: DiagnosisResult }) {
  const { report } = diagnosis;

  if (!report) {
    return (
      <>
        <p className="mt-3 text-lg font-bold text-gray-900">{diagnosis.headline}</p>
        <p className="mt-1 text-xs text-gray-500 leading-relaxed">
          입력하신 정보와 등록된 법령·행정자료를 기준으로 첨부하신 서류를
          1차 분석한 결과입니다.
        </p>
        <ul className="mt-4 space-y-2.5">
          {diagnosis.checklist.map((item) => (
            <li key={item.id} className="flex items-start gap-2 text-sm text-gray-700">
              {levelIcon(item.level)}
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[11px] text-gray-400 leading-relaxed">{diagnosis.note}</p>
      </>
    );
  }

  return (
    <>
      <p className="mt-3 text-lg font-bold text-gray-900">{diagnosis.headline}</p>

      {/* STEP10-4: 추천 분야 — AI가 분석한 분야를 고객에게 표시 (legalAreas와 별개, 법률 검토 대상 아님) */}
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-800">
        추천 분야: 행정
      </div>

      <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
        <p className="text-xs font-semibold text-gray-700">사건 요약</p>
        <p className="mt-1.5 whitespace-pre-line text-xs text-gray-600 leading-relaxed">
          {report.incidentSummary}
        </p>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-700">주요 발견사항</p>
        <ul className="mt-2 space-y-2.5">
          {report.keyFindings.map((item) => (
            <li key={item.id} className="flex items-start gap-2 text-sm text-gray-700">
              {levelIcon(item.level)}
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-700">VFBCAI 1차 검토 의견</p>
        <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">{report.analysisOpinion}</p>
      </div>

      {report.legalAreas.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-700">적용 가능성이 있는 법률 분야</p>
          <ul className="mt-2 space-y-1.5">
            {report.legalAreas.map((la) => (
              <li key={la.area} className="text-xs text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-800">{la.area}</span> — {la.note}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-700">법률 적용 가능성 설명</p>
        <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
          {report.legalApplicabilityNote}
        </p>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-700">최신 법령 확인 안내</p>
        <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">{report.legalUpdateNotice}</p>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-700">실무 행정 관행 안내</p>
        <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">{report.practiceNotes}</p>
      </div>

      {report.riskFactors.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-700">위험요인</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {report.riskFactors.map((rf, idx) => (
              <span
                key={`${rf.label}-${idx}`}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${riskFactorBadgeClass(rf.level)}`}
              >
                [{riskFactorLabel(rf.level)}] {rf.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {report.recommendedActions.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-700">권장 조치</p>
          <ol className="mt-2 space-y-1.5">
            {report.recommendedActions.map((action, idx) => (
              <li key={idx} className="text-xs text-gray-600 leading-relaxed">
                {idx + 1}순위 {action}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="mt-5 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600 leading-relaxed">
        {report.expertReviewRecommendation}
      </div>

      <p className="mt-4 text-[11px] text-gray-400 leading-relaxed">{report.aiLimitationNotice}</p>
    </>
  );
}

type ReviewQuestionOption = {
  value: string;
  title: string;
  desc: string;
};

// 화면에는 합의한 VERIFY 문구를 표시하되, value는 기존 verifyDiagnosis.ts가
// 사용하는 incidentType 값으로 유지한다. 따라서 진단·DB·CRM 로직은 변경하지 않는다.
const PREVENT_DOCUMENT_OPTIONS: ReviewQuestionOption[] = [
  { value: "행정문서", title: "행정기관 제출서류", desc: "비자·거주증·노동허가 등 기관 제출자료" },
  { value: "계약서", title: "계약서", desc: "매매·임대·용역 등 계약 관련 서류" },
  { value: "법인·투자", title: "법인·투자 서류", desc: "법인설립·투자·지분 관련 서류" },
  { value: "노동·고용", title: "노동·고용 서류", desc: "근로계약·취업·인사 관련 서류" },
  { value: "인허가", title: "인허가 서류", desc: "허가·등록·승인 신청 관련 서류" },
  { value: "세무", title: "세무 서류", desc: "세금·회계·신고 관련 서류" },
  { value: "기타", title: "번역·공증·인증 서류", desc: "원본·번역본·공증·영사확인 자료" },
  { value: "기타", title: "기타", desc: "위 항목에 해당하지 않는 검토 자료" },
];

const CASE_ISSUE_OPTIONS: ReviewQuestionOption[] = [
  { value: "행정문서", title: "행정기관 반려·보완 요구", desc: "반려서·보완 요청·행정 통지를 받은 경우" },
  { value: "계약서", title: "계약 위반·대금 미지급", desc: "계약 불이행·미수금·보증금 문제" },
  { value: "법인·투자", title: "투자·법인 분쟁", desc: "투자금·지분·법인 운영 관련 분쟁" },
  { value: "노동·고용", title: "노동·고용 분쟁", desc: "해고·임금·근로계약 관련 문제" },
  { value: "인허가", title: "인허가·영업정지", desc: "허가 반려·취소·영업정지 문제" },
  { value: "세무", title: "세무 조사·추징", desc: "세무조사·추징·가산세 관련 문제" },
  { value: "기타", title: "소송·형사·사기", desc: "경찰·검찰·법원 또는 사기 피해 관련" },
  { value: "기타", title: "기타", desc: "위 항목에 해당하지 않는 문제" },
];

// STEP11-1: STEP1 최상단 — 사전 검토 / 사후 사건 검토 구분 질문.
// 화면 로컬 state로만 관리하며, DB/API/CRM/진단 결과에는 아직 연결하지 않음.
const REVIEW_STAGE_OPTIONS = [
  {
    value: "pre",
    title: "제출·계약 전 서류 검토",
    desc: "계약·제출·신청 전에 서류와 위험요인을 미리 확인하고 싶습니다. (Prevent Review)",
  },
  {
    value: "post",
    title: "문제 발생 후 대응 검토",
    desc: "이미 반려·통지·분쟁·손해 등 문제가 발생해 대응 방향을 확인하고 싶습니다. (Case Review)",
  },
] as const;
type ReviewStage = (typeof REVIEW_STAGE_OPTIONS)[number]["value"];

// 질문3 — Prevent Review(사전 검토)에서만 사용. "무엇을 확인하고 싶으신가요?"
// 진단 로직(verifyDiagnosis.ts)에는 전달하지 않고 CRM meta에만 참고 정보로 저장한다.
const PREVENT_FOCUS_OPTIONS = [
  "제출 요건과 형식",
  "누락된 내용이나 서류",
  "불리하거나 위험한 조항",
  "원본과 번역본의 일치 여부",
  "공증·인증·영사확인 필요 여부",
  "전체 검토가 필요함",
] as const;

// 질문3 — Case Review(사후 검토)에서만 사용. "현재 어느 단계인가요?"
// 진단 로직(verifyDiagnosis.ts)에는 전달하지 않고 CRM meta에만 참고 정보로 저장한다.
const CASE_STAGE_OPTIONS = [
  "공식 대응 전",
  "상대방·기관과 협의 중",
  "이의신청·통지 준비 중",
  "경찰·검찰·법원·행정기관 접수",
  "판결·결정 후 후속 대응",
  "기타",
] as const;

// STEP12-2: 공통 SelectionCard용 아이콘 매핑(표시 전용). 값/옵션 배열은 변경하지 않음.
const REVIEW_STAGE_ICONS: Record<ReviewStage, typeof ShieldCheck> = {
  pre: ShieldCheck,
  post: AlertTriangle,
};

const INCIDENT_TYPE_ICONS: Record<string, typeof FileText> = {
  "행정문서": FileText,
  "계약서": FileSignature,
  "법인·투자": Building2,
  "노동·고용": Briefcase,
  "인허가": Stamp,
  "세무": Receipt,
  "기타": FileQuestion,
};

// STEP12-2B: 공통 SelectionCard용 tone 매핑(표시 전용). 값/옵션 배열은 변경하지 않음.
// 지원 tone: blue / green / amber / red / purple / cyan / slate
// (인허가=emerald→green, 계약=indigo→blue 계열, 노동=orange→amber로 대체 적용)
const REVIEW_STAGE_TONES: Record<ReviewStage, SelectionCardTone> = {
  pre: "blue",
  post: "amber",
};

const INCIDENT_TYPE_TONES: Record<string, SelectionCardTone> = {
  "행정문서": "blue",
  "계약서": "blue",
  "법인·투자": "purple",
  "노동·고용": "amber",
  "인허가": "green",
  "세무": "cyan",
  "기타": "slate",
};

// 질문 2의 화면 표시용 제목별 아이콘·색상 매핑.
// "소송·형사·사기"와 "기타"는 진단 호환을 위해 value가 모두 "기타"이므로,
// 화면에서는 title 기준으로 서로 다른 아이콘과 색상을 적용한다.
const QUESTION2_TITLE_ICONS: Record<string, typeof FileText> = {
  "소송·형사·사기": AlertTriangle,
  "기타": FileQuestion,
};

const QUESTION2_TITLE_TONES: Record<string, SelectionCardTone> = {
  "소송·형사·사기": "red",
  "기타": "slate",
};


// 질문 3 선택지의 아이콘·색상 매핑(표시 전용).
// 선택값과 CRM meta(review_focus)는 기존 문자열을 그대로 저장하며,
// 진단·DB·API 로직에는 영향을 주지 않는다.
const REVIEW_FOCUS_ICONS: Record<string, typeof FileText> = {
  "제출 요건과 형식": FileText,
  "누락된 내용이나 서류": FileQuestion,
  "불리하거나 위험한 조항": AlertTriangle,
  "원본과 번역본의 일치 여부": FileSignature,
  "공증·인증·영사확인 필요 여부": Stamp,
  "전체 검토가 필요함": ShieldCheck,
  "공식 대응 전": ShieldCheck,
  "상대방·기관과 협의 중": UserCheck,
  "이의신청·통지 준비 중": FileSignature,
  "경찰·검찰·법원·행정기관 접수": Building2,
  "판결·결정 후 후속 대응": Stamp,
  "기타": Info,
};

const REVIEW_FOCUS_TONES: Record<string, SelectionCardTone> = {
  "제출 요건과 형식": "blue",
  "누락된 내용이나 서류": "cyan",
  "불리하거나 위험한 조항": "amber",
  "원본과 번역본의 일치 여부": "purple",
  "공증·인증·영사확인 필요 여부": "green",
  "전체 검토가 필요함": "slate",
  "공식 대응 전": "blue",
  "상대방·기관과 협의 중": "cyan",
  "이의신청·통지 준비 중": "purple",
  "경찰·검찰·법원·행정기관 접수": "amber",
  "판결·결정 후 후속 대응": "green",
  "기타": "cyan",
};

// 위험도(riskLevel: low/medium/high) 3단계를 CHECK(TRC)의 ResultHeaderGauge와 동일한
// SVG-native rotate 원형 배지로 표시. VERIFY 진단(verifyDiagnosis.ts)에는 CHECK의
// feasibilityScore(0~100) 같은 수치 점수가 없으므로, 없는 점수를 임의로 만들어 표시하지
// 않고 실제로 존재하는 riskLevel 값을 그대로 사용한다(허위 데이터 금지 원칙).
function RiskGauge({
  riskLevel,
  size = 104,
}: {
  riskLevel: "low" | "medium" | "high";
  size?: number;
}) {
  const isLow = riskLevel === "low";
  const ringColor = isLow ? "#059669" : riskLevel === "medium" ? "#D97706" : "#DC2626";
  const label = isLow ? "낮음" : riskLevel === "medium" ? "보통" : "높음";
  // 실제 수치 점수가 아니라 위험도 3단계를 시각적으로 구분하기 위한 채움 비율.
  const fillRatio = isLow ? 1 / 3 : riskLevel === "medium" ? 2 / 3 : 1;
  const scale = size / 104;
  const strokeWidth = 7 * scale;
  const r = 46 * scale;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;

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
            isLow ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          }`}
          style={{ width: 20 * scale, height: 20 * scale }}
        >
          {isLow ? <CheckCircle2 size={12 * scale} /> : <AlertTriangle size={12 * scale} />}
        </span>
        <strong className="mt-0.5 font-black leading-none text-gray-900" style={{ fontSize: 15 * scale }}>
          위험도
        </strong>
        <span
          className={`mt-0.5 font-bold ${
            isLow ? "text-emerald-600" : riskLevel === "medium" ? "text-amber-600" : "text-red-600"
          }`}
          style={{ fontSize: 12 * scale }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

// CHECK(TRC)의 ResultOverviewCards와 동일한 PC 5칸 그리드 / 모바일 세로 리스트
// wrapper(className 동일)를 그대로 재사용하고, 내용만 VERIFY 진단에 실제로 존재하는
// 필드(riskLevel/checklist/report.riskFactors)로 채운다. TRC의 feasibilityScore·
// estimatedDays처럼 VERIFY에 없는 수치는 만들어내지 않고, 자료가 없으면 "서류 확인
// 필요"/"서류 확인 후 안내"로 표시한다.
function VerifyResultOverviewCards({
  diagnosis,
  docCount,
}: {
  diagnosis: DiagnosisResult;
  docCount: number;
}) {
  const { riskLevel } = diagnosis.expertBrief;
  const riskLabel = riskLevel === "low" ? "낮음" : riskLevel === "medium" ? "보통" : "높음";
  const topRiskFactor =
    diagnosis.report?.riskFactors?.[0]?.label ??
    diagnosis.checklist.find((c) => c.level === "critical")?.label ??
    diagnosis.checklist[0]?.label ??
    "확인된 주요 위험요인이 아직 없습니다";

  const riskPillTone =
    riskLevel === "low"
      ? "bg-emerald-50 text-emerald-700"
      : riskLevel === "medium"
      ? "bg-amber-50 text-amber-700"
      : "bg-red-50 text-red-700";

  const aiOpinionText = riskLevel === "low" ? "정상" : "확인필요";
  const aiOpinionTone =
    riskLevel === "low"
      ? "bg-emerald-50 text-emerald-700"
      : riskLevel === "medium"
      ? "bg-amber-50 text-amber-700"
      : "bg-red-50 text-red-700";

  const items = [
    {
      n: 1,
      label: "위험도",
      visual: <RiskGauge riskLevel={riskLevel} size={64} />,
      pill: <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${riskPillTone}`}>{riskLabel}</span>,
      caption: "입력하신 내용을 기준으로 분석한 1차 위험도입니다.",
    },
    {
      n: 2,
      label: "주요 위험요인",
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
      caption: "우선적으로 확인이 필요한 항목입니다.",
    },
    {
      n: 3,
      label: "추가 확인자료",
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
      caption: "정확한 검토를 위해 필요한 자료입니다.",
    },
    {
      n: 4,
      label: "예상 검토기간",
      visual: (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-50">
          <Clock className="text-violet-600" size={26} />
        </div>
      ),
      pill: (
        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700">
          서류 확인 후 안내
        </span>
      ),
      caption: "서류 제출 후 정밀 리포트에서 안내드립니다.",
    },
    {
      n: 5,
      label: "AI 1차 의견",
      visual: (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <UserCheck className="text-gray-700" size={26} />
        </div>
      ),
      pill: <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${aiOpinionTone}`}>{aiOpinionText}</span>,
      caption: "베트남 행정 전문가 AI의 1차 검토 의견입니다.",
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
            <div className="shrink-0">{item.pill}</div>
          </div>
        ))}
      </div>
    </>
  );
}

// CHECK(TRC)의 buildResultSummaryText/ResultSummaryCard와 동일한 구조 — 기존
// 진단 데이터(riskLevel, report.analysisOpinion/expertBrief.summary)만으로 2~3문장
// 요약을 구성한다. 새로운 판단이나 점수를 만들지 않는다.
function buildVerifyResultSummaryText(diagnosis: DiagnosisResult): string {
  const { riskLevel, summary } = diagnosis.expertBrief;
  const riskLabel = riskLevel === "low" ? "낮은" : riskLevel === "medium" ? "보통" : "높은";
  const sentence1 = `입력하신 사건유형·설명을 기준으로 위험도는 '${riskLabel}' 수준으로 1차 분류되었습니다.`;
  const sentence2 = diagnosis.report?.analysisOpinion ?? summary;
  const sentence3 =
    "실제 서류를 확인하기 전까지는 참고용 1차 결과이며, 정확한 판단은 서류 제출 후 전문가 검토를 통해 확정됩니다.";
  return `${sentence1} ${sentence2} ${sentence3}`;
}

function VerifyResultSummaryCard({ diagnosis }: { diagnosis: DiagnosisResult }) {
  const summaryText = buildVerifyResultSummaryText(diagnosis);

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

// CHECK(TRC)의 PremiumLeadCapture와 동일한 JSX/className 구조 — 1번째 화면(가입 전),
// 결과 미리보기 + 개인정보 입력. TRC는 feasibilityScore(0~100)로 possible/conditional을
// 가르지만, VERIFY는 그런 점수가 없으므로 riskLevel(low/medium/high)로 대체한다.
function VerifyAdminLeadCapture({
  riskLevel,
  messengers,
  lang,
  fieldErrors,
  submitting,
  error,
  consentOpen,
  consentHighlight,
  onConsentToggle,
  onConsentChecked,
  onSubmit,
  onReset,
}: {
  riskLevel: "low" | "medium" | "high";
  messengers: MessengerPair;
  lang: SupportedLanguage;
  fieldErrors: FieldErrors;
  submitting: boolean;
  error: string | null;
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
  const isLow = riskLevel === "low";

  return (
    <div>
      <div
        className={`mt-8 rounded-3xl border bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${
          isLow ? "border-gray-100" : "border-amber-100"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {isLow ? (
              <CheckCircle2 className="text-emerald-600" size={28} />
            ) : (
              <AlertTriangle className="text-amber-600" size={28} />
            )}

            <p className="mt-4 text-lg font-bold text-gray-900">
              {isLow
                ? "특별한 위험요인이 확인되지 않았습니다"
                : "확인이 필요한 위험요인이 있습니다"}
            </p>

            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {isLow
                ? "입력하신 사건유형·설명 기준으로 1차 분석한 결과, 우선 확인이 필요한 치명적 위험요인은 확인되지 않았습니다."
                : "입력하신 사건유형·설명 기준으로 1차 분석한 결과, 반려·손해로 이어질 수 있는 위험요인이 확인되어 서류 확인이 필요합니다."}
            </p>
          </div>

          <RiskGauge riskLevel={riskLevel} />
        </div>

        <p className="mt-2 text-xs leading-relaxed text-gray-400">
          * 위 결과는 입력하신 사건유형·설명을 기준으로 한 1차 자가진단입니다. 정확한
          검토는 서류 확인 후 전문가 검토를 통해 확정됩니다.
        </p>

        <div className="mt-4">
          <NoticeCard tone={isLow ? "success" : "warning"}>
            이름·연락처·주소만 남기시면 AI가 입력하신 내용을 바탕으로 1차 검토
            리포트를 바로 보여드립니다.
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

          {error && <p className="text-xs text-red-600">{error}</p>}

          <PrimaryButton type="submit" variant={isLow ? "primary" : "amber"} loading={submitting} disabled={!canSubmit}>
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

export default function VerifyAdminPage() {
  // 질문(사건정보) → 개인정보 → 1차 결과(진단) → 전문가 검토 진행
  // → Auto-login → /r → /documents(검토 대상 파일 업로드) → 마이페이지
  // (CHECK와 동일한 순서. "completed"는 더 이상 도달하지 않지만 코드는 보존한다 —
  // 도달 경로 제거 이력은 아래 handleExpertRequest 참고)
  const [step, setStep] = useState<
    "incident" | "form" | "diagnosis" | "guidanceSelect" | "guidance" | "completed"
  >("incident");
  const [incidentType, setIncidentType] = useState<string | null>(null);
  const [incidentDescription, setIncidentDescription] = useState("");
  const [incidentError, setIncidentError] = useState<string | null>(null);
  const [reviewStage, setReviewStage] = useState<ReviewStage | null>(null);
  const [reviewStageError, setReviewStageError] = useState<string | null>(null);
  // 질문3 — Prevent/Case Review 분기별로 다른 선택지("무엇을 확인하고 싶으신가요?" /
  // "현재 어느 단계인가요?")를 저장. 진단 로직에는 전달하지 않고 CRM meta 참고용.
  const [reviewFocus, setReviewFocus] = useState<string | null>(null);
  // 질문4 — 선택형 간단 파일 업로드(선택 사항). 실제 업로드는 handleSubmit에서
  // 기존 VERIFY Storage 구조(documents 버킷)에 그대로 이루어진다.
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailProvided, setEmailProvided] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [consentHighlight, setConsentHighlight] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);
  // 개인정보 입력(1번째 화면)에서 CHECK(TRC)의 PremiumLeadCapture처럼 미리보기 결과를
  // 보여주기 위한 것 — 아직 리드가 생성되기 전이므로 leadId 없이 계산만 미리 해둔다.
  // 실제 최종 진단(handleSubmit의 getDiagnosis 호출)과는 별개이며, 여기서 계산한
  // 값은 CRM/DB에 저장되지 않는다.
  const [previewDiagnosis, setPreviewDiagnosis] = useState<DiagnosisResult | null>(null);
  const [expertRequesting, setExpertRequesting] = useState(false);
  const [expertError, setExpertError] = useState<string | null>(null);
  const [aiReportRequesting, setAiReportRequesting] = useState(false);
  const [aiReportError, setAiReportError] = useState<string | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<AdminAgency | null>(null);
  // CHECK(TRC)와 동일한 Step 방식 질문 화면의 선택 카드 클릭 피드백(300ms) 및
  // 전문가 진행 요청 시 사용할 로그인 토큰 — TRC의 selectedKey/resultToken과 동일한 용도.
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [resultToken, setResultToken] = useState<string | null>(null);
  const [lang, setLang] = useState<SupportedLanguage>("ko");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setLang(resolveLanguage(params.get("lang")));
    }
  }, []);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const messengers = MESSENGERS_BY_LANGUAGE[lang];

  // 질문3(사건유형+설명+선택 파일)이 채워지는 즉시, 아직 리드가 생성되기 전이라도
  // CHECK(TRC)와 동일하게 1번째 화면(개인정보 입력)에 미리보기 결과를 보여주기 위해
  // 계산해둔다. fileUrl은 실제 Storage URL이 아니라 "파일 선택 여부"만 필요하므로
  // getDiagnosis(verifyDiagnosis.ts)가 hasFile 판단에만 쓰는 placeholder를 전달한다 —
  // 진단 로직(verifyDiagnosis.ts) 자체는 변경하지 않고 기존 함수를 그대로 재호출한다.
  useEffect(() => {
    let cancelled = false;
    if (incidentType && incidentDescription.trim().length > 0) {
      getDiagnosis(CATEGORY, {
        fileUrl: attachedFile ? "pending" : null,
        fileName: attachedFile?.name || null,
        incidentType,
        incidentDescription: incidentDescription.trim(),
      }).then((res) => {
        if (!cancelled) setPreviewDiagnosis(res);
      });
    } else {
      setPreviewDiagnosis(null);
    }
    return () => {
      cancelled = true;
    };
  }, [incidentType, incidentDescription, attachedFile]);

  // CHECK(TRC)의 "처음부터 다시 확인하기"와 동일한 전체 초기화.
  function reset() {
    setStep("incident");
    setReviewStage(null);
    setReviewFocus(null);
    setIncidentType(null);
    setIncidentDescription("");
    setAttachedFile(null);
    setIncidentError(null);
    setSelectedKey(null);
    setLeadId(null);
    setDiagnosis(null);
    setPreviewDiagnosis(null);
    setError(null);
    setConsentOpen(false);
    setConsentHighlight(false);
    setSelectedAgency(null);
  }

  function handleIncidentNext() {
    if (incidentDescription.trim().length === 0) {
      setIncidentError("사건 설명을 입력해주세요.");
      return;
    }
    setIncidentError(null);
    setStep("form");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (fd.get("agreeTerms") !== "on") {
      setConsentOpen(true);
      setConsentHighlight(true);
      return;
    }
    setConsentHighlight(false);

    setSubmitting(true);
    setError(null);
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
      setError(Object.values(errors)[0] || null);
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

    const { error: err } = await supabase.from("leads").insert({
      id: newLeadId,
      name,
      phone,
      address,
      email: email || null,
      kakao_id: kakaoId,
      zalo_id: zaloId,
      service_type: "verify_admin",
      result: null,
      source_page: "/verify/admin",
    });

    if (err) {
      console.error(err);
      setError("접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    // 질문3에서 선택한 서류(선택 사항)를 기존 VERIFY Storage 구조 그대로 재사용해
    // 업로드한다 — verify/real-estate 등 다른 VERIFY 페이지와 동일한 패턴
    // (documents 버킷, verify-{category}/{leadId}.{ext} 경로, getPublicUrl).
    // 새로운 Storage 구조를 추측하거나 만들지 않는다.
    let fileUrl: string | null = null;
    if (attachedFile && attachedFile.size > 0) {
      const rawExt = attachedFile.name.split(".").pop() || "";
      const safeExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
      const path = `verify-admin/${newLeadId}.${safeExt}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, attachedFile);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
        fileUrl = urlData.publicUrl;
      } else {
        console.error(uploadError);
      }
    }

    await supabase.from("crm_activities").insert({
      lead_id: newLeadId,
      action: "verify_lead",
      tag: "VERIFY_ADMIN",
      meta: {
        review_stage: reviewStage,
        review_focus: reviewFocus,
        incident_type: incidentType,
        incident_description: incidentDescription.trim(),
        // 질문 단계에서 제출한 파일에 document_type(incidentType)과 review_stage를
        // 함께 태깅해 저장 — 기존 meta(jsonb) 구조를 확장한 것일 뿐 새 DB 컬럼은
        // 없다. 향후 /documents 등에서 "이미 제출된 자료"를 조회할 때 이 값으로
        // 어떤 서류가 이미 제출됐는지 식별할 수 있도록 준비해두는 용도.
        ...(fileUrl
          ? {
              file_url: fileUrl,
              file_name: attachedFile?.name,
              submitted_document: {
                document_type: incidentType,
                review_stage: reviewStage,
                file_url: fileUrl,
                file_name: attachedFile?.name,
              },
            }
          : {}),
      },
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

    saveLeadContact({ name, phone, address, kakao_id: kakaoId, zalo_id: zaloId });
    setEmailProvided(!!email);
    setLeadId(newLeadId);
    setSubmitting(false);

    setDiagnosing(true);
    const diag = await getDiagnosis(CATEGORY, {
      fileUrl,
      fileName: attachedFile?.name || null,
      incidentType: incidentType || undefined,
      incidentDescription: incidentDescription.trim() || undefined,
    });
    setDiagnosis(diag);
    setDiagnosing(false);
    setStep("diagnosis");
  }

  async function handleExpertRequest() {
    if (!leadId) return;
    setExpertRequesting(true);
    setExpertError(null);
    try {
      const { error } = await supabase.from("crm_activities").insert({
        lead_id: leadId,
        action: "expert_review_request",
        tag: "VERIFY_ADMIN",
        meta: diagnosis ? { expert_brief: diagnosis.expertBrief } : null,
      });
      if (error) throw error;

      // CHECK(TRC)와 동일한 흐름 — resultToken으로 /api/auto-login을 호출해 실제
      // 로그인 세션을 만든 뒤(/r?...&next=documents 경유) /documents로 이동시킨다.
      // 검토 대상 서류는 이 다음 화면(/documents)에서 업로드가 이어진다.
      if (!resultToken) {
        setExpertError("로그인 정보를 준비하지 못했습니다. 다시 신청해주세요.");
        setExpertRequesting(false);
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
        setExpertError("로그인 처리 중 문제가 발생했습니다. 다시 시도해주세요.");
        setExpertRequesting(false);
        return;
      }
      window.location.href = data.actionLink;
    } catch {
      setExpertError("접수 중 문제가 발생했습니다. 다시 시도해주세요.");
      setExpertRequesting(false);
    }
  }

  // "AI 검토 요청하기" — handleExpertRequest와 동일한 Auto-login → /r → /documents
  // 흐름을 타되, next 값만 "documents_ai_report"로 달라 /documents가 mode=ai_report로
  // 열린다. 신규 CRM action은 만들지 않는다(핸드오프 문서 결정 유지) — CHECK(TRC)의
  // "AI 리포트 요청하기" 버튼도 이 시점에는 CRM을 기록하지 않는 것과 동일하게 맞춘 것.
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
      recordAiReportRequestAndNotify({
          leadId,
          tag: "VERIFY_ADMIN",
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
        setAiReportRequesting(false);
        return;
      }
      window.location.href = data.actionLink;
    } catch {
      setAiReportError("접수 중 문제가 발생했습니다. 다시 시도해주세요.");
      setAiReportRequesting(false);
    }
  }

  const activeGuidance = selectedAgency ? ADMIN_AGENCY_GUIDANCE[selectedAgency] : null;

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <div
        className={`mx-auto px-6 py-10 ${
          step === "diagnosis"
            ? "max-w-4xl"
            : step === "incident" && reviewStage && !incidentType
            ? "max-w-[920px]"
            : "max-w-xl"
        }`}
      >
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
            <p className="text-[11px] leading-tight text-gray-400">베트남 법률전문 AI</p>
          </div>
        </Link>

        {/* 데스크톱 전용 — 기존 텍스트 링크 */}
        <Link href="/" className="hidden items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600 sm:inline-flex">
          <ArrowLeft size={14} /> 홈으로
        </Link>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          직접검토하기 · 베트남 법률전문 AI
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">행정문서 검토</h1>
        <p className="mt-1 text-sm text-gray-500">제출·계약 전 서류 검토부터 문제 발생 후 대응 검토까지</p>

        {/* STEP1: 질문 1~4 — CHECK(TRC)와 동일하게 질문 1개씩 진행. Prevent Review(사전
            검토)와 Case Review(사후 검토)를 질문1에서 선택하면 질문2~4가 분기된다. */}
        {step === "incident" && (
          <>
            {/* 질문 1 — Prevent Review / Case Review */}
            {!reviewStage && (
              <div className="mt-8">
                <QuestionSection step={1} title="어떤 검토가 필요하신가요?" description="현재 상황에 맞는 검토 방식을 선택해주세요.">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {REVIEW_STAGE_OPTIONS.map((opt) => (
                      <SelectionCard
                        key={opt.value}
                        title={opt.title}
                        description={opt.desc}
                        selected={selectedKey === opt.value}
                        icon={REVIEW_STAGE_ICONS[opt.value]}
                        tone={REVIEW_STAGE_TONES[opt.value]}
                        onClick={() => {
                          setSelectedKey(opt.value);
                          setTimeout(() => {
                            setReviewStage(opt.value);
                            setSelectedKey(null);
                          }, 300);
                        }}
                      />
                    ))}
                  </div>
                </QuestionSection>
              </div>
            )}

            {/* 질문 2 — Prevent Review: "어떤 서류를 검토하시나요?" / Case Review: "어떤
                문제가 발생했나요?" — 선택지는 기존 incidentTypes 7종을 그대로 재사용해
                verifyDiagnosis.ts에 전달되는 incidentType 값과 진단 로직을 바꾸지 않는다. */}
            {reviewStage && !incidentType && (
              <div className="mt-8">
                <QuestionSection
                  step={2}
                  title={reviewStage === "pre" ? "어떤 서류를 검토하시나요?" : "어떤 문제가 발생했나요?"}
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {(reviewStage === "pre" ? PREVENT_DOCUMENT_OPTIONS : CASE_ISSUE_OPTIONS).map((opt, index) => {
                      const selectionKey = `${opt.value}-${index}`;
                      return (
                        <SelectionCard
                          key={selectionKey}
                          title={opt.title}
                          description={opt.desc}
                          selected={selectedKey === selectionKey}
                          icon={
                            QUESTION2_TITLE_ICONS[opt.title] ??
                            INCIDENT_TYPE_ICONS[opt.value] ??
                            FileQuestion
                          }
                          tone={
                            QUESTION2_TITLE_TONES[opt.title] ??
                            INCIDENT_TYPE_TONES[opt.value] ??
                            "slate"
                          }
                          onClick={() => {
                            setSelectedKey(selectionKey);
                            setTimeout(() => {
                              setIncidentType(opt.value);
                              setSelectedKey(null);
                            }, 300);
                          }}
                        />
                      );
                    })}
                  </div>
                </QuestionSection>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedKey(null);
                    setReviewStage(null);
                  }}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={14} /> 이전 단계로
                </button>
              </div>
            )}

            {/* 질문 3 — Prevent Review: "무엇을 확인하고 싶으신가요?" / Case Review:
                "현재 어느 단계인가요?" — 참고 정보로 CRM meta(review_focus)에만 저장되며
                진단 로직(verifyDiagnosis.ts)에는 전달하지 않는다. */}
            {reviewStage && incidentType && !reviewFocus && (
              <div className="mt-8">
                <QuestionSection step={3} title={reviewStage === "pre" ? "무엇을 확인하고 싶으신가요?" : "현재 어느 단계인가요?"}>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {(reviewStage === "pre" ? PREVENT_FOCUS_OPTIONS : CASE_STAGE_OPTIONS).map((opt) => (
                      <SelectionCard
                        key={opt}
                        title={opt}
                        selected={selectedKey === opt}
                        icon={REVIEW_FOCUS_ICONS[opt] ?? FileQuestion}
                        tone={REVIEW_FOCUS_TONES[opt] ?? "slate"}
                        onClick={() => {
                          setSelectedKey(opt);
                          setTimeout(() => {
                            setReviewFocus(opt);
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
                    setIncidentType(null);
                  }}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={14} /> 이전 단계로
                </button>
              </div>
            )}

            {/* 질문 4 — 사건/검토 내용 설명 + 선택형 간단 파일 업로드.
                Prevent Review는 "검토 대상 서류", Case Review는 "핵심 문서 및 증거자료"
                중심 안내 문구로 분기한다. */}
            {reviewStage && incidentType && reviewFocus && (
              <div className="mt-8">
                <QuestionSection
                  step={4}
                  title={
                    reviewStage === "pre"
                      ? "검토가 필요한 내용을 간단히 알려주세요."
                      : "무슨 일이 있었는지 간단히 알려주세요."
                  }
                  error={incidentError}
                >
                  <textarea
                    value={incidentDescription}
                    onChange={(e) => setIncidentDescription(e.target.value)}
                    placeholder={
                      reviewStage === "pre"
                        ? "예: 베트남 노동허가 신청 예정입니다. 원본과 번역본이 일치하는지, 추가로 필요한 서류가 있는지 확인받고 싶습니다."
                        : "예: 행정기관에서 보완 요청을 받았습니다. 어떤 내용을 보완해야 하는지와 대응 방법을 확인받고 싶습니다."
                    }
                    rows={5}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-gray-900 focus:outline-none resize-none"
                  />
                  <p className="mt-2 text-[11px] text-gray-400">
                    현재 상황과 확인이 필요한 내용을 중심으로 작성해주세요.
                  </p>

                  {!attachedFile ? (
                    <>
                      <label className="mt-4 flex items-center gap-2 h-11 rounded-lg border border-dashed border-gray-300 px-4 text-sm text-gray-500 cursor-pointer hover:border-gray-900 transition-colors">
                        <Paperclip size={16} className="shrink-0" />
                        <span className="truncate">
                          {reviewStage === "pre"
                            ? "대표 검토 서류 1개 첨부 (선택 · 사진 · PDF · Word)"
                            : "대표 핵심 문서 1개 첨부 (선택 · 사진 · PDF · Word)"}
                        </span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0] || null;
                            setAttachedFile(f);
                          }}
                        />
                      </label>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-gray-400">
                        첫 화면에서는 대표 서류만 제출해주세요. 접수 후 /documents에서 원본·번역본·공증본·기관 안내문 또는 추가 증거자료를 계속 제출할 수 있습니다.
                      </p>
                    </>
                  ) : (
                    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                      <p className="text-[11px] font-semibold text-gray-500">선택한 자료</p>
                      <div className="mt-1.5 flex items-center justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-1.5 truncate text-sm text-gray-800">
                          <Paperclip size={14} className="shrink-0 text-gray-400" />
                          <span className="truncate">{attachedFile.name}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setAttachedFile(null)}
                          className="shrink-0 text-xs font-medium text-gray-500 hover:text-gray-700"
                        >
                          다른 파일로 교체
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                          {incidentType}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          {reviewStage === "pre" ? "Prevent Review" : "Case Review"}
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] leading-relaxed text-gray-400">
                        개인정보 입력과 접수가 완료되면 이 자료가 함께 제출됩니다.
                      </p>
                    </div>
                  )}
                </QuestionSection>

                <PrimaryButton onClick={handleIncidentNext} className="mt-6">
                  다음
                </PrimaryButton>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedKey(null);
                    setReviewFocus(null);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={14} /> 이전 단계로
                </button>
              </div>
            )}
          </>
        )}

        {/* STEP4: 개인정보 입력 — CHECK(TRC)의 PremiumLeadCapture와 동일한 구조 */}
        {step === "form" && (
          <VerifyAdminLeadCapture
            riskLevel={previewDiagnosis?.expertBrief.riskLevel ?? "medium"}
            messengers={messengers}
            lang={lang}
            fieldErrors={fieldErrors}
            submitting={submitting || diagnosing}
            error={error}
            consentOpen={consentOpen}
            consentHighlight={consentHighlight}
            onConsentToggle={() => setConsentOpen((v) => !v)}
            onConsentChecked={() => setConsentHighlight(false)}
            onSubmit={handleSubmit}
            onReset={reset}
          />
        )}

        {/* STEP5: 진단 리포트 + 진행방식 선택 CTA 3개 — CHECK(TRC)와 동일한 구조 */}
        {step === "diagnosis" && diagnosis && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              행정문서 검토 · AI 분석 리포트
            </p>

            <VerifyResultOverviewCards
              diagnosis={diagnosis}
              docCount={getRequiredDocuments("verify_admin").documents.length}
            />

            <VerifyResultSummaryCard diagnosis={diagnosis} />

            <p className="mt-5 text-sm font-bold text-gray-900">다음 단계 선택</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-3 sm:items-stretch">
              {/* 1) AI 검토 요청하기 — CHECK(TRC) NextStepOptions의 AI 리포트 카드와 동일한
                  스타일(연한 블루 배경 + 아웃라인 버튼) 및 "필수" 배지 */}
              <div className="relative flex h-full flex-col rounded-2xl border border-blue-100 bg-blue-50/30 p-4">
                <span className="absolute -top-2.5 left-4 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                  필수
                </span>
                <p className="mt-1 text-sm font-bold text-gray-900">AI 검토 요청하기</p>
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
                    {aiReportRequesting ? "이동 중..." : "AI 검토 요청하기"}
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

              {/* 2) 전문가 검토 요청하기 — 가장 강한 파란색 CTA */}
              <div className="relative flex h-full flex-col rounded-2xl border border-blue-300 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <span className="absolute -top-2.5 left-4 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
                  추천
                </span>
                <p className="mt-1 text-sm font-bold text-gray-900">전문가 검토 요청하기</p>
                <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                  AI 사전진단 내용과 첨부하신 서류를 전문가가 함께 확인한 뒤
                  결과를 안내드립니다.
                </p>
                <div className="mt-auto pt-4">
                  <PrimaryButton onClick={handleExpertRequest} loading={expertRequesting}>
                    전문가 검토 요청하기
                  </PrimaryButton>
                  <p className="mt-2 min-h-[32px] text-center text-[11px] text-blue-700">
                    {expertError ? (
                      <span className="text-red-600">{expertError}</span>
                    ) : (
                      "이미 입력하신 정보로 바로 진행되며, 다시 입력하실 필요 없습니다."
                    )}
                  </p>
                </div>
              </div>

              {/* 3) 직접 검토 진행하기 — 흰색 테두리 보조 옵션 */}
              <div className="relative flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4">
                <span className="absolute -top-2.5 left-4 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
                  신중
                </span>
                <p className="mt-1 text-sm font-bold text-gray-900">직접 검토 진행하기</p>
                <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                  관할기관·공식 확인 경로·절차 안내를 참고해 스스로 진행할
                  수 있습니다.
                </p>
                <div className="mt-auto pt-4">
                  <PrimaryButton variant="outline" onClick={() => setStep("guidanceSelect")}>
                    직접 검토 진행하기
                  </PrimaryButton>
                  <p className="mt-2 min-h-[32px] text-center text-[11px] text-slate-500">
                    이미 입력하신 정보로 바로 진행되며, 다시 입력하실 필요 없습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP5-a: 직접 검토 진행하기 — 관련 기관/진행 경로 선택 */}
        {step === "guidanceSelect" && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <FileText className="text-gray-900" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              어떤 기관·경로와 관련된 사안인가요?
            </p>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed">
              선택하신 항목에 맞는 관할기관·공식 확인 경로·절차 안내를 보여드립니다.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ADMIN_AGENCY_OPTIONS.map((agency) => (
                <SelectionCard
                  key={agency}
                  title={agency}
                  selected={selectedAgency === agency}
                  tone="blue"
                  onClick={() => {
                    setSelectedAgency(agency);
                    setStep("guidance");
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setStep("diagnosis")}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={14} /> 검토 결과로 돌아가기
            </button>
          </div>
        )}

        {/* STEP5-b: 선택한 기관에 대한 안내 — 관할기관/공식 확인 경로/절차/서류/주의사항 */}
        {step === "guidance" && activeGuidance && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <FileText className="text-gray-900" size={28} />
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              {selectedAgency}
            </p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              직접 진행을 위한 참고 안내
            </p>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed">
              아래는 일반적인 참고 정보이며, VFBCAI가 실제 신청·제출을 대신
              처리하지는 않습니다. 정확한 절차는 관할기관에서 다시 확인해주세요.
            </p>

            <div className="mt-5 space-y-4">
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold text-gray-700">관할기관</p>
                <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
                  {activeGuidance.authority}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold text-gray-700">공식 확인 경로</p>
                <a
                  href={activeGuidance.officialSite.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-blue-900 hover:underline"
                >
                  {activeGuidance.officialSite.label} <ExternalLink size={12} />
                </a>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700">기본 절차</p>
                <ol className="mt-2 space-y-1.5">
                  {activeGuidance.submissionSteps.map((s, idx) => (
                    <li key={idx} className="text-xs text-gray-600 leading-relaxed">
                      {idx + 1}. {s}
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700">일반 준비서류</p>
                <ul className="mt-2 space-y-1">
                  {activeGuidance.requiredDocuments.map((d, idx) => (
                    <li key={idx} className="text-xs text-gray-600 leading-relaxed">
                      · {d}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-amber-50 px-4 py-3">
                <p className="text-xs font-semibold text-amber-800">주의사항</p>
                <ul className="mt-1.5 space-y-1">
                  {activeGuidance.cautions.map((c, idx) => (
                    <li key={idx} className="text-xs text-amber-800 leading-relaxed">
                      · {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-5 text-xs font-semibold text-gray-700">
              직접 진행이 부담되신다면 전문가에게 맡기실 수도 있습니다.
            </p>
            <PrimaryButton onClick={handleExpertRequest} loading={expertRequesting} className="mt-3">
              전문가 검토 진행하기
            </PrimaryButton>
            {expertError && <p className="mt-3 text-xs text-red-600">{expertError}</p>}

            <button
              type="button"
              onClick={() => setStep("guidanceSelect")}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={14} /> 다른 기관 선택하기
            </button>
          </div>
        )}

        {step === "completed" && (
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
              전문가 검토 요청이 접수되었습니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              전문가가 첨부하신 서류와 AI 사전진단 내용을 함께 확인한 뒤,
              가입하신 이메일 또는 {messengers.primary.label}/{messengers.secondary.label}로
              결과를 안내드립니다.
            </p>
            {emailProvided && (
              <p className="mt-2 text-[11px] text-gray-400">
                메시지가 오지 않으면 알려주세요 — 이메일도 확인해주세요.
              </p>
            )}
            <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600">
              입력하신 전화번호로 계정이 생성되었습니다. 비밀번호는
              자동 생성되며, 마이페이지에서 언제든 변경하실 수
              있습니다.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
