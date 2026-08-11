"use client";

// 공통 Document Upload Page (/documents)
//
// 이번 단계 범위: 실제 파일 업로드(Supabase Storage "documents" 버킷) + 업로드된 문서
// 정보를 기존 crm_activities 테이블(action="document_upload", meta jsonb)에 저장/조회하여
// 새로고침 후에도 leadId 기준으로 복원한다. 아래는 여전히 하지 않는다.
// - leads/crm_activities 외 새 테이블·새 컬럼 생성 없음(기존 crm_activities.meta jsonb만 사용)
// - 어떤 API route도 새로 만들지 않음(클라이언트에서 기존 verify 페이지와 동일한 방식으로
//   supabase.storage / supabase.from("crm_activities") 직접 호출)
// - OpenAI/Claude 분석, 이메일·카카오톡·Zalo 발송, My Page 연결은 하지 않음
//
// "직접 입력"은 여전히 React state로만 움직이는 화면 목업이며, "파일 업로드"만 실제
// Supabase Storage + crm_activities에 저장/조회된다.

import { Suspense, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  PenLine,
  CheckCircle2,
  Circle,
  ChevronDown,
  Loader2,
  Shield,
  UserCheck,
  Zap,
  FileText,
  Send,
  Clock,
  Lock,
  X,
  Paperclip,
  UserRound,
  Building2,
} from "lucide-react";
import { NoticeCard, PrimaryButton, StatusBadge } from "@/components/ui";
import { getRequiredDocuments } from "@/lib/requiredDocuments";
import { supabase } from "@/lib/supabase";

type SubmitMode = "ai_report" | "expert";
type DocInputMode = "upload" | "manual";

// 기존 VERIFY(verify-real-estate 등)·admin(permit-results) 페이지가 이미 사용 중인
// "documents" Storage 버킷을 그대로 재사용한다. 버킷명을 임의로 바꾸지 않는다.
const STORAGE_BUCKET = "documents";
// 기존 prefix(verify-real-estate, verify-fraud, verify-tax, verify-unclear, verify-admin,
// permit-results)와 겹치지 않는 이 기능 전용 prefix. 버킷은 동일하게 재사용하고, 폴더만
// leadId 하위에 문서별로 나눈다(한 신청건에 여러 문서가 있으므로).
const STORAGE_PREFIX = "document-upload";
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "pdf", "doc", "docx"];
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB
// 기존 crm_activities 테이블(action은 자유 문자열 컬럼)을 그대로 재사용 — 새 테이블/컬럼 없음.
// 문서 1건당 1행, tag에 문서명을 넣어 lead_id+action+tag로 유일하게 식별한다.
const CRM_DOCUMENT_ACTION = "document_upload";
// TRC 등 CHECK 페이지의 기존 "전문가 진행요청" CRM 기록과 동일한 action을 재사용한다
// (src/app/check/trc/page.tsx의 handleAgencyRequest와 동일한 값 — 새 값 아님).
const CRM_AGENCY_REQUEST_ACTION = "agency_upgrade_request";

interface DocState {
  label: string;
  inputMode: DocInputMode;
  file: File | null;
  fileName: string | null; // 업로드된 파일명 — 새로고침 복원 시 File 객체 없이도 표시하기 위해 별도 보관
  fileSize: number | null; // 업로드된 파일 용량(byte) — 위와 동일한 이유로 별도 보관
  storagePath: string | null; // 업로드 성공/삭제/복원 판단 기준 및 Storage 경로. 공개 URL은
  // 저장하지 않는다(개인정보 서류이므로 getPublicUrl 미사용, documents 버킷 private 유지).
  uploading: boolean;
  deleting: boolean; // 삭제 처리 중 — 삭제 버튼 중복 클릭 방지용(문구/디자인 변경 없음)
  uploadError: string | null;
  text: string; // 추가 서류의 "직접 입력 내용" + 전용 입력폼이 없는 문서의 기존 textarea 값
  title: string; // 추가 서류(선택) 전용 "제목"
  fields: Record<string, string>; // 여권/비자/재직증명서/회사서류 등 구조화 입력값
}

function createDocState(label: string): DocState {
  return {
    label,
    inputMode: "upload",
    file: null,
    fileName: null,
    fileSize: null,
    storagePath: null,
    uploading: false,
    deleting: false,
    uploadError: null,
    text: "",
    title: "",
    fields: {},
  };
}

function isDocReady(doc: DocState): boolean {
  if (doc.inputMode === "upload") return doc.storagePath !== null;
  if (doc.text.trim().length > 0) return true;
  if (doc.title.trim().length > 0) return true;
  return Object.values(doc.fields).some((v) => v.trim().length > 0);
}

function getFileExtension(file: File): string {
  return (file.name.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

// verify/admin(questionSubmittedDoc) 표시 전용 변환 — pre/post 외 값은 원문 그대로 표시한다.
function formatReviewStageLabel(reviewStage: string | null): string {
  if (reviewStage === "pre") return "Prevent Review";
  if (reviewStage === "post") return "Case Review";
  return reviewStage ?? "-";
}

// 문서 종류별 "직접 입력" 항목 정의. 여기 정의되지 않은 문서(학력증명서, 범죄경력증명서 등)는
// 기존과 동일하게 자유 textarea 하나만 표시한다(추측으로 새 항목을 만들지 않음).
type FieldType = "text" | "date" | "select";
interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
}

const NATIONALITY_OPTIONS = ["대한민국", "중국", "일본", "미국", "기타"];
const GENDER_OPTIONS = ["남성", "여성", "기타"];
const VISA_TYPE_OPTIONS = ["노동(LD)", "투자(DT)", "방문(DN)", "기타"];

const FIELD_SCHEMA_BY_LABEL: Record<string, FieldConfig[]> = {
  여권: [
    { key: "fullNameEn", label: "영문 성명", type: "text" },
    { key: "passportNo", label: "여권번호", type: "text" },
    { key: "nationality", label: "국적", type: "select", options: NATIONALITY_OPTIONS },
    { key: "birthDate", label: "생년월일", type: "date" },
    { key: "gender", label: "성별", type: "select", options: GENDER_OPTIONS },
    { key: "issueDate", label: "발급일", type: "date" },
    { key: "expiryDate", label: "만료일", type: "date" },
    { key: "addressEn", label: "영문 주소", type: "text" },
  ],
  비자: [
    { key: "visaType", label: "비자 종류", type: "select", options: VISA_TYPE_OPTIONS },
    { key: "visaNo", label: "비자 번호", type: "text" },
    { key: "issueDate", label: "발급일", type: "date" },
    { key: "expiryDate", label: "만료일", type: "date" },
    { key: "issuingAuthority", label: "발급기관", type: "text" },
  ],
  재직증명서: [
    { key: "companyName", label: "회사명", type: "text" },
    { key: "position", label: "직위", type: "text" },
    { key: "startDate", label: "근무 시작일", type: "date" },
    { key: "workPermitNo", label: "노동허가번호", type: "text" },
    { key: "workPermitExpiry", label: "노동허가 만료일", type: "date" },
  ],
  회사서류: [
    { key: "companyName", label: "회사명", type: "text" },
    { key: "businessRegNo", label: "사업자등록번호", type: "text" },
    { key: "legalRepresentative", label: "법정대표자", type: "text" },
    { key: "companyAddress", label: "회사 주소", type: "text" },
  ],
};

function getFieldSchema(label: string): FieldConfig[] | null {
  return FIELD_SCHEMA_BY_LABEL[label] ?? null;
}

// 공유 UI 라이브러리(components/ui)에는 Select 컴포넌트가 없어, 이번 작업 범위인 이
// 페이지 전용으로만 최소 구현한다(공통 라이브러리는 수정하지 않음).
// 직접 입력 폼의 세로 여백을 줄이기 위해 TextField/TextAreaField보다 촘촘한 간격을 쓴다.
const COMPACT_FIELD_CLASS =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors duration-200 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/10";

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-gray-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={COMPACT_FIELD_CLASS}
      >
        <option value="">선택 안 함</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function CompactTextField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-gray-700">{label}</span>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={COMPACT_FIELD_CLASS} />
    </label>
  );
}

function CompactTextAreaField({
  label,
  rows,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  rows: number;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-gray-700">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${COMPACT_FIELD_CLASS} resize-none`}
      />
      {hint && <span className="mt-1 block text-[11px] text-gray-400">{hint}</span>}
    </label>
  );
}

const MODE_COPY: Record<
  SubmitMode,
  {
    badgeLabel: string;
    heading: string;
    description: string;
    submitLabel: string;
    submitCaption: string;
    successTitle: string;
    successBody: string;
  }
> = {
  ai_report: {
    badgeLabel: "AI 리포트 진행",
    heading: "먼저 핵심 자료만 제출해주세요",
    description:
      "현재 가지고 있는 계약서·증빙·사진·기존 신청자료를 제출해 주세요. 제출하신 자료는 안전하게 보관되며, 담당자가 확인 후 마이페이지를 통해 안내드립니다.",
    submitLabel: "AI 리포트 진행하기",
    submitCaption: "접수 후 진행 상황은 My Page에서 확인하실 수 있습니다.",
    successTitle: "AI 리포트 진행이 접수되었습니다",
    successBody: "제출하신 자료는 안전하게 보관되며, 담당자가 확인 후 마이페이지를 통해 안내드립니다.",
  },
  expert: {
    badgeLabel: "전문가 진행",
    heading: "먼저 핵심 자료만 제출해주세요",
    description:
      "고객 또는 신청 주체만 제공할 수 있는 자료를 우선 확인합니다. 나머지는 현재 가지고 있는 경우에만 제출하시고, 추가 서류는 담당 전문가가 검토 후 안내드립니다.",
    submitLabel: "전문가 진행하기",
    submitCaption: "접수 후 담당 전문가가 확인하여 카카오톡 · Zalo · 이메일로 안내드립니다.",
    successTitle: "전문가 진행이 접수되었습니다",
    successBody: "담당자가 서류를 확인한 뒤 카카오톡 · Zalo · 이메일로 안내드립니다.",
  },
};

// 승인된 목업에 표시된 3개 신뢰 항목 — 모드와 무관하게 고정 문구. (PC 전용, 3개 그대로 유지)
const TRUST_ITEMS = [
  { icon: Shield, label: "안전한 보안", sub: "개인정보 철저 보호" },
  { icon: UserCheck, label: "전문가 직접 확인", sub: "담당 전문가만 열람" },
  { icon: Zap, label: "빠른 안내", sub: "카톡·Zalo·이메일 안내" },
];

// 모바일 전용 신뢰 박스 — "빠른 안내" 제외 2개, 짧은 보조문구.
const MOBILE_TRUST_ITEMS = [
  { icon: Shield, label: "안전한 보안", sub: "개인정보 보호" },
  { icon: UserCheck, label: "전문가 직접 확인", sub: "담당자만 열람" },
];

// 문서 카드 설명 한 줄 — 승인된 목업에 문구가 있는 문서(여권/비자/재직증명서/회사서류)만
// 정의한다. 그 외 문서는 목업에 없는 문구를 임의로 만들지 않기 위해 설명을 생략한다.
const DOC_DESCRIPTION_BY_LABEL: Record<string, string> = {
  "개인 투자자 여권": "투자자 본인 확인을 위한 여권 사본입니다.",
  "개인 은행 잔고증명서": "예정 투자금을 확인할 수 있는 개인 명의 잔고증명서입니다.",
  "예정 법정대표자 여권": "베트남 법인의 예정 법정대표자 신분 확인 자료입니다.",
  "본점 임대차계약서 또는 예정 주소 자료":
    "계약을 완료했다면 임대차계약서를, 아직이라면 예정 주소 자료를 제출해주세요.",
  "투자법인 등록증": "해외 투자법인의 설립 및 등록 상태를 확인하는 자료입니다.",
  "투자법인 정관": "투자법인의 조직과 권한 구조를 확인하는 정관입니다.",
  "투자법인 법정대표자 여권": "투자법인 법정대표자의 신분 확인 자료입니다.",
  "재무제표·감사보고서 또는 법인 잔고증명서":
    "투자법인의 재정능력을 확인할 수 있는 현재 보유 자료를 제출해주세요.",
  "예정 베트남 법인 법정대표자 여권":
    "설립 예정인 베트남 법인의 법정대표자 여권입니다.",
  "투자 결정서 또는 이사회·주주총회 결의서":
    "베트남 투자를 승인한 내부 결의서가 있다면 제출해주세요.",
  "위임장": "베트남 절차 수행을 위한 위임장이 있다면 제출해주세요.",
  "예정 법인명·사업목적·투자금 정리자료":
    "예정 법인명, 사업목적, 투자금과 출자구조를 정리한 자료가 있다면 제출해주세요.",
  "기존 보완요청서·반려 통지서":
    "기존 신청에서 받은 보완요청서 또는 반려 통지서가 있다면 제출해주세요.",
  "사업장 내부 사진이나 시설자료":
    "사업장 내부 사진이나 시설 관련 자료가 있다면 제출해주세요.",
  "기타 관련 자료": "판단이나 진행에 도움이 될 수 있는 기타 자료를 자유롭게 제출해주세요.",

  여권: "본인 확인을 위해 필요합니다.",
  비자: "현재 보유 중인 비자를 제출해주세요.",
  재직증명서: "재직 증명 또는 노동허가 관련 서류를 제출해주세요.",
  회사서류: "회사 사업자등록증 사본을 제출해주세요.",
  "사업자등록증 또는 법인등록증":
    "식당 영업 주체를 확인할 수 있는 사업자·법인 등록서류를 제출해주세요.",
  "영업장 임대차계약서":
    "식당 영업장 주소와 사용 권한을 확인할 수 있는 계약서를 제출해주세요.",
  "임대인의 법적 권리 증빙":
    "임대인이 해당 영업장을 임대할 권리가 있음을 확인하는 자료입니다.",
  "대표자·조리 종사자 건강검진서":
    "대표자와 식품을 취급하는 조리 종사자의 건강검진 자료를 제출해주세요.",
  "위생안전 시설 관련 자료":
    "조리·보관·세척시설 등 위생안전 준비 상태를 확인할 수 있는 자료입니다.",
  "소방시설·소방점검 관련 자료":
    "소화기·비상구 등 소방시설 준비 및 점검 관련 자료를 제출해주세요.",
  "업장 평면도 또는 내부 사진":
    "영업장 구조와 주방·보관·위생시설 배치를 확인할 수 있는 자료입니다.",
  "기존 허가·반려 관련 자료":
    "기존 신청서, 접수증, 보완요청서 또는 반려 통지서가 있다면 제출해주세요.",
  "제조사 위임장":
    "해외 제조사가 베트남 내 신청·유통 주체에게 권한을 부여한 위임장을 제출해주세요.",
  "자유판매증명서(CFS)":
    "해당 제품이 제조국에서 합법적으로 판매되고 있음을 확인하는 자료입니다.",
  "화장품 제품 공고 관련 신청자료":
    "제품 공고 신청에 사용되는 기본 신청서와 관련 자료를 제출해주세요.",
  "제품 전성분표 및 성분자료":
    "제품에 포함된 전체 성분과 배합 관련 자료를 제출해주세요.",
  "제품정보파일(PIF) 또는 안전성 자료":
    "제품 품질과 안전성을 확인할 수 있는 제품정보파일 또는 평가자료입니다.",
  "제품 라벨·포장 디자인 자료":
    "베트남에서 사용할 제품 라벨과 포장 표시 자료를 제출해주세요.",
  "제조사 및 품질관리 관련 증빙":
    "제조사 정보와 제조·품질관리 기준을 확인할 수 있는 자료입니다.",
  "기타 제품별 추가자료":
    "제품 특성이나 관할기관 요청에 따라 필요한 추가자료가 있다면 제출해주세요.",
  "투자자 여권 또는 법인등록서류":
    "개인 투자자는 여권, 법인 투자자는 법인등록 및 대표자 관련 서류를 제출해주세요.",
  "투자자 재정능력 증빙":
    "예금잔고증명서, 재무제표 등 투자금 조달 능력을 확인할 수 있는 자료입니다.",
  "법인명·사업목적·투자금 정보":
    "예정 법인명, 사업목적, 투자금 및 출자구조를 정리한 자료를 제출해주세요.",
  "본점 임대차계약서":
    "베트남 법인의 예정 본점 주소와 사용 권한을 확인하는 계약서입니다.",
  "예정 법정대표자 신분자료":
    "예정 법정대표자의 여권 또는 신분 확인 자료를 제출해주세요.",
  "사업장 위치·시설 관련 자료":
    "사업장 주소, 용도, 내부 사진 또는 시설 현황을 확인할 수 있는 자료입니다.",
  "기존 신청·보완·반려 관련 자료":
    "기존 접수증, 보완요청서 또는 반려 통지서가 있다면 제출해주세요.",
};

function DocumentCard({
  index,
  doc,
  requirementLabel,
  onModeChange,
  onFileChange,
  onFileClear,
  onTextChange,
  onTitleChange,
  onFieldChange,
}: {
  index: number;
  doc: DocState;
  requirementLabel: "선택" | "우선 제출" | "있으면 제출";
  onModeChange: (mode: DocInputMode) => void;
  onFileChange: (file: File | null) => void;
  onFileClear: () => void;
  onTextChange: (text: string) => void;
  onTitleChange: (title: string) => void;
  onFieldChange: (key: string, value: string) => void;
}) {
  const inputId = `doc-file-${index}`;
  const ready = isDocReady(doc);
  const isExtraDoc = doc.label === "추가 서류 (선택)";
  const schema = getFieldSchema(doc.label);
  const description = DOC_DESCRIPTION_BY_LABEL[doc.label];

  // Accordion — 기본은 접힌 상태이며 헤더를 누르면 펼쳐진다(PC·모바일 공통, 동시에 여러 개
  // 펼쳐질 수 있음).
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] lg:p-5">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-900 text-[10px] font-bold text-white">
              {index + 1}
            </span>
            <p className="text-sm font-bold text-gray-900">{doc.label}</p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                requirementLabel === "우선 제출"
                  ? "bg-blue-50 text-blue-700"
                  : requirementLabel === "있으면 제출"
                  ? "bg-gray-100 text-gray-600"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {requirementLabel}
            </span>
          </div>
          {description && (
            <p className="mt-1 pl-7 text-xs text-gray-500">{description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge tone={ready ? "success" : "neutral"}>
            {ready ? "제출완료" : "미제출"}
          </StatusBadge>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      <div className={expanded ? "block" : "hidden"}>
        {/* 업로드 / 직접 입력 탭 */}
        <div className="mt-3 inline-flex rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => onModeChange("upload")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              doc.inputMode === "upload" ? "bg-white text-blue-900 shadow-sm" : "text-gray-500"
            }`}
          >
            <Upload size={13} /> 파일 업로드
          </button>
          <button
            type="button"
            onClick={() => onModeChange("manual")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              doc.inputMode === "manual" ? "bg-white text-blue-900 shadow-sm" : "text-gray-500"
            }`}
          >
            <PenLine size={13} /> 직접 입력
          </button>
        </div>

        <div className="mt-2.5">
          {doc.inputMode === "upload" ? (
            doc.uploading ? (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-6 text-xs font-semibold text-blue-700">
                <Loader2 size={16} className="animate-spin" /> 업로드 중...
              </div>
            ) : doc.storagePath ? (
              <>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Paperclip size={15} className="shrink-0 text-blue-700" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-gray-900">{doc.fileName}</p>
                      <p className="text-[11px] text-gray-500">
                        {doc.fileSize !== null ? formatFileSize(doc.fileSize) : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onFileClear}
                    disabled={doc.deleting}
                    className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-white hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="파일 삭제"
                  >
                    <X size={15} />
                  </button>
                </div>
                {doc.uploadError && (
                  <p className="mt-1.5 text-[11px] text-red-600">{doc.uploadError}</p>
                )}
              </>
            ) : (
              <>
                {/* PC 전용 — 파일 선택·드래그앤드롭 영역 */}
                <label
                  htmlFor={inputId}
                  className="hidden cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 bg-gray-50/60 px-4 py-6 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/40 lg:flex"
                >
                  <Upload size={20} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-600">파일 업로드</span>
                  <span className="text-[11px] text-gray-400">JPG · PNG · PDF · DOC · DOCX</span>
                  <span className="text-[11px] text-gray-400">최대 10MB</span>
                </label>

                {/* 모바일 전용 — 버튼형 업로드 UI */}
                <label
                  htmlFor={inputId}
                  className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-center transition-colors hover:bg-gray-50 lg:hidden"
                >
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-900">
                    <Upload size={15} /> 파일 업로드
                  </span>
                  <span className="text-[11px] text-gray-400">JPG · PNG · PDF · DOC · DOCX</span>
                  <span className="text-[11px] text-gray-400">최대 10MB</span>
                </label>

                {doc.uploadError && (
                  <p className="mt-1.5 text-[11px] text-red-600">{doc.uploadError}</p>
                )}

                <input
                  id={inputId}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    onFileChange(e.target.files?.[0] ?? null);
                    e.target.value = "";
                  }}
                />
              </>
            )
          ) : isExtraDoc ? (
            <div className="space-y-2.5">
              <CompactTextField
                label="제목"
                placeholder="제출하시는 서류의 이름을 입력해주세요."
                value={doc.title}
                onChange={(e) => onTitleChange(e.target.value)}
              />
              <CompactTextAreaField
                label="직접 입력 내용"
                rows={3}
                placeholder="서류 관련 정보를 자유롭게 입력해주세요."
                value={doc.text}
                onChange={(e) => onTextChange(e.target.value)}
              />
            </div>
          ) : schema ? (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {schema.map((f) =>
                f.type === "select" ? (
                  <SelectField
                    key={f.key}
                    label={f.label}
                    value={doc.fields[f.key] ?? ""}
                    onChange={(v) => onFieldChange(f.key, v)}
                    options={f.options ?? []}
                  />
                ) : (
                  <CompactTextField
                    key={f.key}
                    label={f.label}
                    type={f.type === "date" ? "date" : "text"}
                    value={doc.fields[f.key] ?? ""}
                    onChange={(e) => onFieldChange(f.key, e.target.value)}
                  />
                )
              )}
            </div>
          ) : (
            <CompactTextAreaField
              rows={3}
              label="직접 입력"
              placeholder="서류 번호, 발급일자 등 관련 정보를 직접 입력해주세요."
              hint="사진이나 스캔본이 없어도 텍스트로 제출하실 수 있습니다."
              value={doc.text}
              onChange={(e) => onTextChange(e.target.value)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DocumentUploadContent() {
  const params = useSearchParams();
  const router = useRouter();
  const leadId = params.get("leadId");
  const serviceFromQuery = params.get("service");
  const modeParam = params.get("mode");
  const mode: SubmitMode = modeParam === "ai_report" ? "ai_report" : "expert";

  // /r 또는 auto-login 경로에서 service 쿼리가 누락되더라도,
  // 현재 lead의 service_type을 조회해 실제 서비스별 문서 목록을 복원한다.
  const [resolvedService, setResolvedService] = useState<string | null>(serviceFromQuery);

  useEffect(() => {
    if (serviceFromQuery) {
      setResolvedService(serviceFromQuery);
      return;
    }

    if (!leadId) {
      setResolvedService(null);
      return;
    }

    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("service_type")
        .eq("id", leadId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("[document-upload] lead service_type 조회 실패:", error);
        setResolvedService(null);
        return;
      }

      setResolvedService(
        typeof data?.service_type === "string" ? data.service_type : null
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [leadId, serviceFromQuery]);

  const rawServiceParam = resolvedService;
  const investorTypeFromQuery = params.get("investorType");
  const [investorType, setInvestorType] = useState<"individual" | "corporate" | null>(
    investorTypeFromQuery === "individual" || investorTypeFromQuery === "corporate"
      ? investorTypeFromQuery
      : null
  );

  useEffect(() => {
    if (investorTypeFromQuery === "individual" || investorTypeFromQuery === "corporate") {
      setInvestorType(investorTypeFromQuery);
      return;
    }

    const savedInvestorType = window.sessionStorage.getItem("permitCompanyInvestorType");
    if (savedInvestorType === "individual" || savedInvestorType === "corporate") {
      setInvestorType(savedInvestorType);
    }
  }, [investorTypeFromQuery]);

  const isCompanyService =
    rawServiceParam === "permit_company" ||
    rawServiceParam === "register_company" ||
    rawServiceParam === "permit_company_individual" ||
    rawServiceParam === "register_company_individual" ||
    rawServiceParam === "permit_company_corporate" ||
    rawServiceParam === "register_company_corporate";

  useEffect(() => {
    if (
      rawServiceParam === "permit_company_individual" ||
      rawServiceParam === "register_company_individual"
    ) {
      setInvestorType("individual");
    } else if (
      rawServiceParam === "permit_company_corporate" ||
      rawServiceParam === "register_company_corporate"
    ) {
      setInvestorType("corporate");
    }
  }, [rawServiceParam]);

  const serviceParam = useMemo(() => {
    if (!isCompanyService || !investorType) return rawServiceParam;

    const prefix = rawServiceParam?.startsWith("permit_") ? "permit" : "register";
    return `${prefix}_company_${investorType}`;
  }, [isCompanyService, investorType, rawServiceParam]);

  const config = useMemo(
    () => getRequiredDocuments(serviceParam, mode),
    [serviceParam, mode]
  );
  const requiredLabels = useMemo(() => config.documents, [config]);
  const optionalLabels = useMemo(() => config.optionalDocuments ?? [], [config]);
  const allDocumentLabels = useMemo(
    () => [...requiredLabels, ...optionalLabels],
    [requiredLabels, optionalLabels]
  );
  const copy = MODE_COPY[mode];

  function selectInvestorType(type: "individual" | "corporate") {
    setInvestorType(type);
    setSubmitted(false);
    setSubmitError(null);

    const nextParams = new URLSearchParams(params.toString());
    nextParams.set("investorType", type);
    router.replace(`/documents?${nextParams.toString()}`, { scroll: false });
  }

  const [docs, setDocs] = useState<DocState[]>(() => allDocumentLabels.map(createDocState));
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // AI 리포트 접수 완료 화면을 충분히 확인한 뒤 My Page로 자동 이동한다.
  // 전문가 모드와 기존 접수·업로드·CRM 로직에는 영향을 주지 않는다.
  useEffect(() => {
    if (!submitted || mode !== "ai_report") return;

    const timer = window.setTimeout(() => {
      router.push("/mypage");
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [mode, router, submitted]);

  // lead 조회를 통해 서비스가 뒤늦게 확인되면 기본 문서 슬롯을
  // 해당 서비스 전용 문서 목록으로 교체한다.
  useEffect(() => {
    setDocs(allDocumentLabels.map(createDocState));
  }, [config.serviceKey, mode, allDocumentLabels]);

  const requiredDocs = docs.filter((doc) => requiredLabels.includes(doc.label));
  const readyCount = requiredDocs.filter(isDocReady).length;
  const totalCount = requiredDocs.length;
  const progressPercent = totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0;

  // 마지막 순번에 추가되는 "추가 서류 (선택)" 카드 — 서비스별 필수 서류 목록(docs)과는
  // 별개의 자유 제출용 카드라 기존 docs 배열/진행률 계산에는 포함하지 않는다.
  const [extraDoc, setExtraDoc] = useState<DocState>(() => createDocState("추가 서류 (선택)"));

  // 질문 단계(VERIFY admin)에서 이미 제출된 자료 — crm_activities(action="verify_lead")의
  // meta.submitted_document를 읽기 전용으로만 표시한다. 기존 필수서류 슬롯(docs)과는 완전히
  // 분리된 별도 상태이며, 이 값은 업로드 진행률(readyCount/progressPercent) 계산에 절대
  // 포함되지 않는다. file_url은 저장하지 않는다(공개 URL 미사용 원칙).
  const [questionSubmittedDoc, setQuestionSubmittedDoc] = useState<{
    fileName: string | null;
    documentType: string | null;
    reviewStage: string | null;
  } | null>(null);

  const scrollTopRef = useRef<HTMLDivElement>(null);

  // 새로고침/재방문 시 leadId 기준으로 기존에 저장된 문서 업로드 기록(crm_activities,
  // action=document_upload)을 불러와 각 DocumentCard에 복원한다. 다른 leadId의 기록은
  // 쿼리 자체가 lead_id로 필터링되고, RLS 정책상 본인 소유 lead가 아니면 결과가 아예
  // 반환되지 않는다. 공개 URL은 저장하지 않으므로 storagePath/fileName/fileSize만 사용.
  useEffect(() => {
    if (!leadId) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("crm_activities")
        .select("tag, meta")
        .eq("lead_id", leadId)
        .eq("action", CRM_DOCUMENT_ACTION);
      if (cancelled) return;
      if (error) {
        console.error("[document-upload][diagnostic] 기존 문서 기록 조회 실패:", error);
        return;
      }
      (data ?? []).forEach((row) => {
        const meta = (row.meta ?? {}) as {
          fileName?: string;
          storagePath?: string;
          fileSize?: number;
        };
        if (!meta.storagePath) return;
        const patch: Partial<DocState> = {
          file: null,
          fileName: meta.fileName ?? null,
          fileSize: typeof meta.fileSize === "number" ? meta.fileSize : null,
          storagePath: meta.storagePath,
          uploading: false,
          uploadError: null,
        };
        if (row.tag === extraDoc.label) {
          setExtraDoc((prev) => ({ ...prev, ...patch }));
          return;
        }
        const index = allDocumentLabels.indexOf(row.tag ?? "");
        if (index >= 0) updateDoc(index, patch);
      });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId, config.serviceKey, mode, allDocumentLabels]);

  // 질문 단계(VERIFY admin)에서 제출된 자료 조회 — 기존 document_upload 조회와는 완전히
  // 별개의 조회이며, 위 useEffect(document_upload)를 전혀 수정하지 않는다. 가장 최근
  // verify_lead 기록의 meta.submitted_document가 있을 때만 읽기 전용 카드로 표시한다.
  // 조회 실패/데이터 없음 시에도 나머지 화면(필수서류 등)은 100% 동일하게 동작한다.
  useEffect(() => {
    if (!leadId) {
      setQuestionSubmittedDoc(null);
      return;
    }
    let cancelled = false;
    setQuestionSubmittedDoc(null);
    (async () => {
      const { data, error } = await supabase
        .from("crm_activities")
        .select("meta")
        .eq("lead_id", leadId)
        .eq("action", "verify_lead")
        .order("created_at", { ascending: false })
        .limit(1);
      if (cancelled) return;
      if (error) {
        console.error("[document-upload][diagnostic] verify_lead 제출자료 조회 실패:", error);
        setQuestionSubmittedDoc(null);
        return;
      }
      const meta = (data?.[0]?.meta ?? {}) as {
        submitted_document?: {
          document_type?: string;
          review_stage?: string;
          file_name?: string;
        };
      };
      const submittedDocument = meta.submitted_document;
      if (!submittedDocument) {
        setQuestionSubmittedDoc(null);
        return;
      }
      setQuestionSubmittedDoc({
        fileName: submittedDocument.file_name ?? null,
        documentType: submittedDocument.document_type ?? null,
        reviewStage: submittedDocument.review_stage ?? null,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [leadId]);

  function updateDoc(index: number, patch: Partial<DocState>) {
    setDocs((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  // 실제 Supabase Storage("documents" 버킷, 기존 verify 페이지와 동일 버킷) 업로드.
  // docs 배열 항목과 extraDoc(추가 서류) 모두 이 함수를 공유하고, applyPatch로 각자의
  // state 조각만 갱신한다.
  async function uploadDocumentFile(
    file: File,
    previousStoragePath: string | null,
    docLabel: string,
    applyPatch: (patch: Partial<DocState>) => void
  ) {
    const ext = getFileExtension(file);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      applyPatch({
        uploadError: "지원하지 않는 파일 형식입니다. JPG, PNG, PDF, DOC, DOCX 파일만 업로드할 수 있습니다.",
      });
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      applyPatch({ uploadError: "파일 크기는 최대 10MB까지 업로드할 수 있습니다." });
      return;
    }
    if (!leadId) {
      applyPatch({ uploadError: "접수 정보가 없어 업로드할 수 없습니다. 처음부터 다시 시도해주세요." });
      return;
    }

    // 업로드 중에는 기존 파일 정보를 그대로 두고(교체 실패 시 화면에 남아있도록) 상태만
    // uploading으로 표시한다. file(선택된 File 객체)만 우선 갱신한다.
    applyPatch({ file, uploading: true, uploadError: null });

    // ── 진단 전용 로그 (이전 작업 범위) — 화면 동작·에러 메시지에는 영향 없음 ──
    console.log("[document-upload][diagnostic] bucket:", STORAGE_BUCKET);
    console.log("[document-upload][diagnostic] env check:", {
      NEXT_PUBLIC_SUPABASE_URL_present: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      NEXT_PUBLIC_SUPABASE_URL_value: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY_present: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    });
    try {
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      console.log(
        "[document-upload][diagnostic] auth session:",
        sessionData?.session ? `authenticated (user id: ${sessionData.session.user.id})` : "anonymous (no session)",
        sessionErr ? { sessionErr } : ""
      );
    } catch (sessionCatchErr) {
      console.error("[document-upload][diagnostic] auth.getSession() threw:", sessionCatchErr);
    }
    try {
      const { data: listData, error: listErr } = await supabase.storage.from(STORAGE_BUCKET).list("", { limit: 1 });
      console.log(
        "[document-upload][diagnostic] bucket list() check — exists/readable:",
        !listErr,
        "sample:",
        listData,
        listErr ? { listErr } : ""
      );
    } catch (listCatchErr) {
      console.error("[document-upload][diagnostic] storage.list() threw:", listCatchErr);
    }
    // ── 진단 전용 로그 끝 ──

    const storagePath = `${STORAGE_PREFIX}/${leadId}/${crypto.randomUUID()}.${ext}`;
    console.log("[document-upload][diagnostic] upload path:", storagePath, "file:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // 1) 새 파일을 새 경로에 먼저 업로드한다(기존 파일은 아직 전혀 건드리지 않음 —
    //    실패해도 기존 파일/CRM 행이 그대로 남는다).
    const { data: uploadData, error: uploadErr } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, file);
    if (uploadErr) {
      console.error("[document-upload][diagnostic] upload() error (raw object):", uploadErr);
      console.error("[document-upload][diagnostic] error.message:", uploadErr.message);
      console.error("[document-upload][diagnostic] error.name:", uploadErr.name);
      console.error(
        "[document-upload][diagnostic] error (all enumerable + non-enumerable fields):",
        JSON.stringify(uploadErr, Object.getOwnPropertyNames(uploadErr))
      );
      applyPatch({
        uploading: false,
        uploadError: "업로드 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
      });
      return;
    }
    console.log("[document-upload][diagnostic] upload() success data:", uploadData);

    const metaPayload = {
      service: serviceParam,
      mode,
      documentLabel: docLabel,
      fileName: file.name,
      storagePath,
      fileSize: file.size,
    };

    if (previousStoragePath) {
      // 재업로드(교체) — 기존 crm_activities 행을 UPDATE한다(삭제 후 재삽입하지 않음 →
      // 실패해도 기존 행이 그대로 남아 중복/유실 위험이 없다).
      const { data: updateData, error: updateErr } = await supabase
        .from("crm_activities")
        .update({ meta: metaPayload })
        .eq("lead_id", leadId)
        .eq("action", CRM_DOCUMENT_ACTION)
        .eq("tag", docLabel)
        .select("id");

      if (updateErr || !updateData || updateData.length === 0) {
        // UPDATE 실패(또는 매칭되는 기존 행 없음) — 새로 올린 파일만 롤백하고
        // 기존 Storage 파일·기존 CRM 행은 절대 건드리지 않는다(화면도 그대로 유지).
        console.error(
          "[document-upload][diagnostic] crm_activities UPDATE 실패(기존 파일 보존):",
          updateErr ?? "matching row not found"
        );
        await supabase
          .storage.from(STORAGE_BUCKET)
          .remove([storagePath])
          .then(({ error }) => {
            if (error) console.error("[document-upload][diagnostic] 신규 파일 롤백 실패:", error);
          });
        applyPatch({ uploading: false, uploadError: "저장 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." });
        return;
      }

      // UPDATE 성공이 확인된 뒤에만 기존(교체 대상) Storage 파일을 정리한다.
      // 이 정리가 실패해도 새 파일/새 CRM 행은 이미 유효하므로 성공으로 처리하고
      // 콘솔에만 고아 파일 정리 실패를 기록한다.
      const { error: removeOldErr } = await supabase.storage.from(STORAGE_BUCKET).remove([previousStoragePath]);
      if (removeOldErr) {
        console.error(
          "[document-upload][diagnostic] 기존 Storage 파일 정리 실패(고아 파일 가능성):",
          removeOldErr,
          previousStoragePath
        );
      }
    } else {
      // 최초 업로드 — 기존 행이 없으므로 INSERT.
      const { error: insertErr } = await supabase.from("crm_activities").insert({
        lead_id: leadId,
        action: CRM_DOCUMENT_ACTION,
        tag: docLabel,
        meta: metaPayload,
      });
      if (insertErr) {
        // INSERT 실패 — 방금 올린 Storage 파일을 즉시 롤백한다(고아 파일 방지).
        console.error("[document-upload][diagnostic] crm_activities INSERT 실패:", insertErr);
        await supabase
          .storage.from(STORAGE_BUCKET)
          .remove([storagePath])
          .then(({ error }) => {
            if (error) console.error("[document-upload][diagnostic] 신규 파일 롤백 실패:", error);
          });
        applyPatch({
          file: null,
          fileName: null,
          fileSize: null,
          storagePath: null,
          uploading: false,
          uploadError: "저장 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
        });
        return;
      }
    }

    applyPatch({
      file,
      fileName: file.name,
      fileSize: file.size,
      storagePath,
      uploading: false,
      uploadError: null,
    });
  }

  async function deleteDocumentFile(doc: DocState, applyPatch: (patch: Partial<DocState>) => void) {
    if (doc.deleting) return; // 중복 클릭 방지
    if (!doc.storagePath) return; // 지울 파일이 없으면 아무 것도 하지 않음(Storage remove도 호출 안 함)

    const storagePath = doc.storagePath;

    applyPatch({ deleting: true, uploadError: null });

    console.log("[document-delete][diagnostic] leadId:", leadId);
    console.log("[document-delete][diagnostic] documentLabel:", doc.label);
    console.log("[document-delete][diagnostic] storagePath:", storagePath);

    if (!leadId) {
      console.error("[document-delete][diagnostic] 최종 실패 단계: leadId 없음 — crm delete 시도조차 못 함");
      applyPatch({ deleting: false, uploadError: "삭제 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." });
      return;
    }

    // 1) crm_activities 행을 lead_id + action + tag(documentLabel) 조건으로 정확히 1건만 삭제한다.
    console.log("[document-delete][diagnostic] crm_activities DELETE 시작:", {
      lead_id: leadId,
      action: CRM_DOCUMENT_ACTION,
      tag: doc.label,
    });
    const {
      data: crmDeleteData,
      error: crmDeleteErr,
      count: crmDeleteCount,
    } = await supabase
      .from("crm_activities")
      .delete({ count: "exact" })
      .eq("lead_id", leadId)
      .eq("action", CRM_DOCUMENT_ACTION)
      .eq("tag", doc.label)
      .select("id");
    console.log("[document-delete][diagnostic] crm_activities DELETE 결과:", {
      data: crmDeleteData,
      count: crmDeleteCount,
      error: crmDeleteErr,
    });

    if (crmDeleteErr) {
      console.error("[document-delete][diagnostic] crm_activities DELETE error.message:", crmDeleteErr.message);
      console.error("[document-delete][diagnostic] crm_activities DELETE error.code:", crmDeleteErr.code);
      console.error("[document-delete][diagnostic] crm_activities DELETE error.details:", crmDeleteErr.details);
      console.error("[document-delete][diagnostic] crm_activities DELETE error.hint:", crmDeleteErr.hint);
      console.error("[document-delete][diagnostic] 최종 실패 단계: crm_activities DELETE");
      // CRM 삭제 실패 — 화면 상태·Storage 파일을 그대로 유지하고 오류만 표시한 뒤 즉시 종료한다.
      applyPatch({ deleting: false, uploadError: "삭제 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." });
      return;
    }
    if (crmDeleteCount === 0) {
      console.error(
        "[document-delete][diagnostic] crm_activities DELETE가 오류 없이 0건 삭제됨(RLS가 대상 행을 안 보이게 막고 있을 가능성 — leads.user_id/auth.uid() 매칭 또는 정책 미적용 여부 확인 필요)"
      );
      console.error("[document-delete][diagnostic] 최종 실패 단계: crm_activities DELETE (0건, RLS로 추정)");
      applyPatch({ deleting: false, uploadError: "삭제 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." });
      return;
    }

    // 2) CRM 삭제가 확인된 뒤에만 Storage 파일을 정리한다. 이 단계가 실패해도 CRM 기록은
    //    이미 없으므로 화면은 삭제 완료로 처리하고, 일반 삭제 오류는 다시 표시하지 않는다.
    console.log("[document-delete][diagnostic] Storage remove 시작:", storagePath);
    const { data: storageRemoveData, error: storageErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath]);
    console.log("[document-delete][diagnostic] Storage remove 결과:", {
      data: storageRemoveData,
      error: storageErr,
    });
    if (storageErr) {
      console.error("[document-delete][diagnostic] Storage remove error.message:", storageErr.message);
      console.error(
        "[document-delete][diagnostic] 최종 실패 단계: Storage remove (CRM은 이미 삭제됨 — 고아 파일 가능성)",
        storagePath
      );
    }

    // 3) CRM 삭제 성공이 확인된 뒤에만 화면 상태를 비운다(Storage 단계 실패 여부와 무관).
    applyPatch({
      file: null,
      fileName: null,
      fileSize: null,
      storagePath: null,
      uploading: false,
      deleting: false,
      uploadError: null,
    });
  }

  function handleDocFileSelect(index: number, file: File | null) {
    if (!file) return;
    const doc = docs[index];
    if (!doc) return;
    void uploadDocumentFile(file, doc.storagePath, doc.label, (patch) => updateDoc(index, patch));
  }

  function handleDocFileClear(index: number) {
    const doc = docs[index];
    if (!doc) return;
    void deleteDocumentFile(doc, (patch) => updateDoc(index, patch));
  }

  function handleExtraFileSelect(file: File | null) {
    if (!file) return;
    void uploadDocumentFile(file, extraDoc.storagePath, extraDoc.label, (patch) =>
      setExtraDoc((prev) => ({ ...prev, ...patch }))
    );
  }

  function handleExtraFileClear() {
    void deleteDocumentFile(extraDoc, (patch) => setExtraDoc((prev) => ({ ...prev, ...patch })));
  }

  // "전문가 진행하기" 클릭 시, 기존 CHECK 페이지(TRC 등)가 써온 것과 동일한
  // "agency_upgrade_request" 액션을 재사용해 요청 자체도 CRM에 남긴다(새 action 아님,
  // 이메일 발송(/api/agency-confirm)은 이번 범위가 아니므로 호출하지 않음).
  // admin/leads/[id]/page.tsx의 setProcessStage와 동일한 "이미 있으면 다시 만들지 않는다"
  // 패턴을 그대로 재사용해 중복 행 생성을 막는다.
  // 반환값: 성공(또는 이미 기록되어 있어 성공 처리) true / 실패 false.
  async function recordAgencyRequest(): Promise<boolean> {
    if (mode !== "expert") return true;
    if (!leadId) return false;

    const { data: existing, error: existingErr } = await supabase
      .from("crm_activities")
      .select("id")
      .eq("lead_id", leadId)
      .eq("action", CRM_AGENCY_REQUEST_ACTION)
      .maybeSingle();
    if (existingErr) {
      console.error("[document-upload][diagnostic] agency_upgrade_request 조회 실패:", existingErr);
      return false;
    }
    if (existing) return true; // 이미 기록됨 — 중복 생성하지 않고 성공으로 처리

    const { error } = await supabase.from("crm_activities").insert({
      lead_id: leadId,
      action: CRM_AGENCY_REQUEST_ACTION,
      tag: (serviceParam || "").toUpperCase(),
      meta: { source: "document-upload", documentCount: readyCount },
    });
    if (error) {
      console.error("[document-upload][diagnostic] agency_upgrade_request 저장 실패:", error);
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    if (submitting || submitted) return; // 중복 클릭 방지
    setSubmitting(true);
    setSubmitError(null);
    const ok = await recordAgencyRequest();
    setSubmitting(false);
    if (!ok) {
      setSubmitError("접수 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    setSubmitted(true);
    scrollTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleReset() {
    setDocs(config.documents.map(createDocState));
    setExtraDoc(createDocState("추가 서류 (선택)"));
    setSubmitted(false);
    setSubmitError(null);
  }

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <div ref={scrollTopRef} className="mx-auto max-w-4xl px-6 py-10 pb-32 lg:pb-10">
        {/* 모바일 전용 브랜드 헤더 — 좌측 "← 홈으로", 로고+브랜드명은 중앙 정렬 */}
        <div className="relative -mx-6 -mt-10 mb-4 flex items-center justify-center border-b border-gray-100 bg-white px-4 py-3 lg:hidden">
          <Link
            href="/"
            aria-label="홈으로"
            className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-1 text-xs font-medium text-gray-500"
          >
            <ArrowLeft size={14} /> 홈으로
          </Link>
          <div className="flex items-center gap-2">
            <img src="/vfbcai-shield-logo.png" alt="VFBCAI" width={32} height={32} className="shrink-0" />
            <div>
              <p className="text-[15px] font-bold leading-tight text-gray-900">VFBCAI</p>
              <p className="text-[10px] leading-tight text-gray-400">Check. Verify. Register. Protect.</p>
            </div>
          </div>
        </div>

        {/* PC 전용 — 로고+브랜드명(좌) / 홈으로 버튼(우) */}
        <div className="hidden items-center justify-between lg:flex">
          <div className="flex items-center gap-2.5">
            <img src="/vfbcai-shield-logo.png" alt="VFBCAI" width={30} height={30} className="shrink-0" />
            <div>
              <p className="text-lg font-bold leading-tight text-gray-900">VFBCAI</p>
              <p className="text-[11px] leading-tight text-gray-400">Check. Verify. Register. Protect.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft size={13} /> 홈으로
          </button>
        </div>

        {!submitted && (
          <>
            {/* 아이콘 + 서비스명 + 설명 */}
            <div className="mt-6 flex items-start gap-3.5 lg:mt-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-900 lg:h-12 lg:w-12">
                <FileText className="text-white" size={26} />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold tracking-tight text-gray-900 lg:text-xl">
                  {config.serviceLabel} · {copy.badgeLabel}
                </h1>
                <p className="mt-1 text-xs text-gray-500">{copy.description}</p>
                {leadId && (
                  <p className="mt-1 text-[11px] text-gray-300">접수번호 {leadId.slice(0, 8)}</p>
                )}
              </div>
            </div>

            {isCompanyService && (
              <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 lg:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                    <Building2 size={18} className="text-blue-900" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">투자자 유형을 선택해주세요</p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                      개인 투자와 법인 투자는 제출해야 하는 서류가 다릅니다.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => selectInvestorType("individual")}
                    className={`rounded-2xl border p-4 text-left transition ${
                      investorType === "individual"
                        ? "border-blue-900 bg-blue-50 ring-1 ring-blue-900"
                        : "border-gray-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        investorType === "individual" ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        <UserRound size={19} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">개인 투자</p>
                        <p className="mt-0.5 text-xs text-gray-500">개인이 직접 투자자가 되는 방식</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectInvestorType("corporate")}
                    className={`rounded-2xl border p-4 text-left transition ${
                      investorType === "corporate"
                        ? "border-blue-900 bg-blue-50 ring-1 ring-blue-900"
                        : "border-gray-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        investorType === "corporate" ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        <Building2 size={19} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">법인 투자</p>
                        <p className="mt-0.5 text-xs text-gray-500">해외 법인이 투자자가 되는 방식</p>
                      </div>
                    </div>
                  </button>
                </div>
              </section>
            )}

            {(!isCompanyService || investorType) && (
              <>
            {/* 신뢰 항목 — 모바일 2개(한 줄), PC 3개(기존 유지) */}
            <div className="mt-5 grid grid-cols-2 gap-2 lg:hidden">
              {MOBILE_TRUST_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-2.5 py-2"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50">
                    <item.icon size={13} className="text-blue-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-bold text-gray-900">{item.label}</p>
                    <p className="truncate text-[10px] text-gray-400">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 hidden lg:grid lg:grid-cols-3 lg:gap-2.5">
              {TRUST_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50">
                    <item.icon size={13} className="text-blue-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900">{item.label}</p>
                    <p className="text-[11px] text-gray-400">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 전체 제출 진행률 */}
            <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-4 lg:mt-4 lg:p-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-gray-900">핵심 자료 제출 현황</p>
                <p className="shrink-0 text-xs font-semibold text-gray-400">{progressPercent}%</p>
              </div>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-gray-100 lg:mt-2">
                <div
                  className="h-full rounded-full bg-blue-900 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="mt-3 text-xl font-bold text-blue-900 lg:mt-2.5 lg:text-lg">
                {readyCount} / {totalCount} <span className="text-sm font-semibold text-gray-500">완료</span>
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                우선 제출 자료 {totalCount}개 · 있으면 제출 자료는 진행률에 포함되지 않습니다.
              </p>
            </div>
              </>
            )}
          </>
        )}

        {submitted ? (
          mode === "expert" ? (
            <div className="mt-8 rounded-3xl border border-gray-100 bg-white p-7 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="flex justify-center">
                <img
                  src="/vfbc-seal.png"
                  alt="VFBCAI 접수완료 확인 도장"
                  width={140}
                  height={140}
                />
              </div>
              <p className="mt-1 text-[10px] italic text-gray-400">
                Vietnam Foreign Business Verification &amp; Compliance AI Center
              </p>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">접수 완료</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                전문가 진행이 정상적으로 접수되었습니다.
                <br />
                제출하신 서류를 담당 전문가가 확인한 후 곧 연락드리겠습니다.
                <br />
                <br />
                <span className="mx-auto block max-w-[240px] break-keep text-pretty leading-relaxed lg:max-w-none">
                  카카오톡 · Zalo · 이메일로 진행 안내를 보내드립니다.
                </span>
              </p>

              <div className="mt-6 space-y-2.5 lg:mx-auto lg:max-w-sm">
                <button
                  type="button"
                  onClick={() => router.push("/mypage")}
                  className="flex h-11 w-full items-center justify-center rounded-xl bg-blue-900 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-950 hover:shadow-md"
                >
                  My Page에서 진행상황 확인하기
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="flex h-11 w-full items-center justify-center rounded-xl border border-blue-900 bg-white text-sm font-semibold text-blue-900 transition-all duration-200 hover:bg-blue-50"
                >
                  홈으로
                </button>
              </div>

              <div className="mt-5 flex items-start justify-center gap-1.5 text-[11px] leading-relaxed text-gray-400">
                <Lock size={12} className="mt-0.5 shrink-0" />
                <span>제출하신 자료는 안전하게 암호화되어 담당 전문가만 확인할 수 있습니다.</span>
              </div>

              {/*
                TODO:
                - 이메일 접수 완료 알림 발송
                - 카카오톡 접수 완료 알림 발송
                - Zalo 접수 완료 알림 발송
                - My Page 진행상황 자동 연결
              */}
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-gray-100 bg-white p-7 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="flex justify-center">
                <img
                  src="/vfbc-seal.png"
                  alt="VFBCAI AI 리포트 접수완료 확인 도장"
                  width={140}
                  height={140}
                />
              </div>
              <p className="mt-1 text-[10px] italic text-gray-400">
                Vietnam Foreign Business Verification &amp; Compliance AI Center
              </p>

              <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
                AI 리포트 접수 완료
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                AI 리포트 요청이 정상적으로 접수되었습니다.
                <br />
                제출하신 자료는 안전하게 보관되며, 담당자가 확인 후 마이페이지를 통해 안내드립니다.
                <br />
                <br />
                <span className="mx-auto block max-w-[280px] break-keep text-pretty leading-relaxed lg:max-w-none">
                  진행 상황은 My Page에서 확인할 수 있습니다.
                </span>
              </p>

              <div className="mt-6 space-y-2.5 lg:mx-auto lg:max-w-sm">
                <button
                  type="button"
                  onClick={() => router.push("/mypage")}
                  className="flex h-11 w-full items-center justify-center rounded-xl bg-blue-900 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-950 hover:shadow-md"
                >
                  My Page에서 리포트 확인하기
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="flex h-11 w-full items-center justify-center rounded-xl border border-blue-900 bg-white text-sm font-semibold text-blue-900 transition-all duration-200 hover:bg-blue-50"
                >
                  홈으로
                </button>
              </div>

              <p className="mt-4 text-[11px] text-gray-400">
                3초 후 My Page로 자동 이동합니다.
              </p>

              <div className="mt-5 flex items-start justify-center gap-1.5 text-[11px] leading-relaxed text-gray-400">
                <Lock size={12} className="mt-0.5 shrink-0" />
                <span>제출하신 자료는 안전하게 보호되며 AI 리포트 작성에만 사용됩니다.</span>
              </div>
            </div>
          )
        ) : (
          <div className="mt-6 lg:grid lg:grid-cols-[1fr_280px] lg:items-start lg:gap-5">
            {/* 좌측 — 문서 카드 목록 */}
            <div className="space-y-4">
              {questionSubmittedDoc && (
                <div className="rounded-2xl border border-blue-100 border-l-4 border-l-blue-900 bg-blue-50/30 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <p className="text-sm font-bold text-gray-900">질문 단계에서 제출한 자료</p>
                  <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                    <div className="flex min-w-0 items-baseline gap-1">
                      <span className="shrink-0 text-gray-400">파일명 </span>
                      <span className="min-w-0 flex-1 truncate">{questionSubmittedDoc.fileName ?? "-"}</span>
                    </div>
                    <p>
                      <span className="text-gray-400">문서 종류 </span>
                      {questionSubmittedDoc.documentType ?? "-"}
                    </p>
                    <p>
                      <span className="text-gray-400">검토 단계 </span>
                      {formatReviewStageLabel(questionSubmittedDoc.reviewStage)}
                    </p>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-gray-400">상태</span>
                      <StatusBadge tone="success">이미 제출됨</StatusBadge>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] leading-relaxed text-gray-500">
                    질문 단계에서 제출한 자료는 참고용으로 전달되었습니다. 아래에서 필요한 문서를
                    추가로 제출하실 수 있습니다.
                  </p>
                </div>
              )}

              {mode === "expert" && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3">
                  <p className="text-xs font-bold text-blue-900">
                    AI 리포트 단계에서 제출한 자료는 다시 제출하지 않으셔도 됩니다.
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-blue-700">
                    기존 업로드 자료가 자동으로 복원됩니다. 담당 전문가가 먼저 확인한 뒤 실제로 필요한 추가 자료만 안내드립니다.
                  </p>
                </div>
              )}

              <div>
                <p className="text-base font-bold text-gray-900">제출 자료</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  우선 제출 자료를 먼저 준비해주세요. 있으면 제출 자료는 현재 보유한 경우에만 올리시면 됩니다.
                </p>
                {mode === "ai_report" && (
                  <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/50 px-3.5 py-3">
                    <p className="text-xs font-bold text-blue-900">
                      제출 자료는 담당자 확인 후 안내됩니다.
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-blue-700">
                      계약서, 기존 신청자료, 반려 문서, 사진 등 현재 가지고 있는 자료를 함께 제출해 주시면 확인에 도움이 됩니다.
                    </p>
                  </div>
                )}
              </div>

              {docs.map((doc, i) => (
                <DocumentCard
                  key={doc.label}
                  index={i}
                  doc={doc}
                  requirementLabel={
                    requiredLabels.includes(doc.label)
                      ? "우선 제출"
                      : "있으면 제출"
                  }
                  onModeChange={(inputMode) => updateDoc(i, { inputMode })}
                  onFileChange={(file) => handleDocFileSelect(i, file)}
                  onFileClear={() => handleDocFileClear(i)}
                  onTextChange={(text) => updateDoc(i, { text })}
                  onTitleChange={(title) => updateDoc(i, { title })}
                  onFieldChange={(key, value) =>
                    setDocs((prev) =>
                      prev.map((d, idx) => (idx === i ? { ...d, fields: { ...d.fields, [key]: value } } : d))
                    )
                  }
                />
              ))}

              <DocumentCard
                index={docs.length}
                doc={extraDoc}
                requirementLabel="있으면 제출"
                onModeChange={(inputMode) => setExtraDoc((prev) => ({ ...prev, inputMode }))}
                onFileChange={handleExtraFileSelect}
                onFileClear={handleExtraFileClear}
                onTextChange={(text) => setExtraDoc((prev) => ({ ...prev, text }))}
                onTitleChange={(title) => setExtraDoc((prev) => ({ ...prev, title }))}
                onFieldChange={(key, value) =>
                  setExtraDoc((prev) => ({ ...prev, fields: { ...prev.fields, [key]: value } }))
                }
              />

              <NoticeCard tone="warning" className="mt-2">
                <span className="block">
                  · 제출서류는 신청 유형 및 관할기관에 따라 달라질 수 있습니다.
                </span>
                <span className="block">
                  · 한국에서 발급된 일부 문서는 번역·공증 또는 영사 절차가 필요한 경우가
                  있습니다.
                </span>
                <span className="block">
                  · 베트남 행정 절차는 변경될 수 있으므로 최신 기준은 전문가와 확인하시기
                  바랍니다.
                </span>
              </NoticeCard>
            </div>

            {/* 우측 — 제출 현황 Sticky 카드 (PC 전용) */}
            <div className="mt-6 hidden lg:sticky lg:top-6 lg:mt-0 lg:block">
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <p className="text-sm font-bold text-gray-900">제출 현황</p>
                <p className="mt-1 text-xs text-gray-500">
                  `${totalCount}개 우선 제출 자료`
                </p>
                <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-900 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {readyCount} / {totalCount} 개 완료
                </p>

                <ul className="mt-3 space-y-1.5">
                  {docs.map((doc) => (
                    <li key={doc.label} className="flex items-center gap-2 text-xs text-gray-600">
                      {isDocReady(doc) ? (
                        <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                      ) : (
                        <Circle size={14} className="shrink-0 text-gray-300" />
                      )}
                      <span className="truncate">{doc.label}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 space-y-2.5 border-t border-gray-100 pt-3 text-xs">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="shrink-0 text-gray-400" />
                    <div>
                      <p className="text-gray-400">신청 서비스</p>
                      <p className="font-semibold text-gray-800">{config.serviceLabel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Send size={14} className="shrink-0 text-gray-400" />
                    <div>
                      <p className="text-gray-400">신청 방식</p>
                      <p className="font-semibold text-gray-800">{copy.badgeLabel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="shrink-0 text-gray-400" />
                    <div>
                      <p className="text-gray-400">예상 제출시간</p>
                      <p className="font-semibold text-gray-800">약 3분</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <PrimaryButton onClick={handleSubmit} loading={submitting} disabled={submitting}>
                    {copy.submitLabel}
                  </PrimaryButton>
                  {submitError && (
                    <p className="mt-2 text-center text-xs text-red-600">{submitError}</p>
                  )}
                  <div className="mt-3 space-y-1 text-center text-sm leading-relaxed text-gray-600">
                    <p className="flex items-center justify-center gap-1.5 font-semibold text-gray-800">
                      <Lock size={14} className="shrink-0 text-gray-500" />
                      개인정보는 안전하게 보호됩니다.
                    </p>
                    <p>담당 전문가만 제출자료를 확인합니다.</p>
                    <p>카카오톡 · Zalo · 이메일로 안내드립니다.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 모바일 전용 — 하단 고정 CTA */}
      {!submitted && (!isCompanyService || investorType) && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-100 bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] lg:hidden">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-sm font-bold text-gray-900">
              {readyCount} / {totalCount} 개 완료
            </p>
            <div className="mt-3">
              <PrimaryButton onClick={handleSubmit} loading={submitting} disabled={submitting}>
                {copy.submitLabel}
              </PrimaryButton>
            </div>
            {submitError && <p className="mt-2 text-center text-xs text-red-600">{submitError}</p>}
            <div className="mt-2 flex items-center justify-center gap-1 text-[11px] text-gray-400">
              <Lock size={11} />
              <span>{copy.submitCaption}</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function DocumentUploadPage() {
  return (
    <Suspense fallback={null}>
      <DocumentUploadContent />
    </Suspense>
  );
}
