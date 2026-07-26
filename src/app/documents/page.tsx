"use client";

// 공통 Document Upload Page (/documents)
//
// 이번 단계 범위: PC·모바일 UI 구현만. 아래는 의도적으로 하지 않는다.
// - crm_activities / leads / 어떤 DB 테이블에도 저장하지 않음
// - Supabase Storage(documents 버킷)에 업로드하지 않음
// - 어떤 API route도 호출하지 않음
// - 새로고침 시 값이 보존되지 않음(세션/로컬스토리지 저장 없음)
// - 기존 CHECK 4개 결과화면 버튼과 아직 연결하지 않음(라우트만 존재)
//
// "업로드"·"직접 입력"·"제출"은 전부 React state로만 움직이는 화면 목업이다.

import { Suspense, useMemo, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  PenLine,
  CheckCircle2,
  Circle,
  ChevronDown,
  Menu,
  Shield,
  UserCheck,
  Zap,
  FileText,
  Send,
  Clock,
  Lock,
  X,
  Paperclip,
} from "lucide-react";
import { NoticeCard, PrimaryButton, StatusBadge } from "@/components/ui";
import { getRequiredDocuments } from "@/lib/requiredDocuments";

type SubmitMode = "ai_report" | "expert";
type DocInputMode = "upload" | "manual";

interface DocState {
  label: string;
  inputMode: DocInputMode;
  file: File | null;
  text: string; // 추가 서류의 "직접 입력 내용" + 전용 입력폼이 없는 문서의 기존 textarea 값
  title: string; // 추가 서류(선택) 전용 "제목"
  fields: Record<string, string>; // 여권/비자/재직증명서/회사서류 등 구조화 입력값
}

function createDocState(label: string): DocState {
  return { label, inputMode: "upload", file: null, text: "", title: "", fields: {} };
}

function isDocReady(doc: DocState): boolean {
  if (doc.inputMode === "upload") return doc.file !== null;
  if (doc.text.trim().length > 0) return true;
  if (doc.title.trim().length > 0) return true;
  return Object.values(doc.fields).some((v) => v.trim().length > 0);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
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
    badgeLabel: "AI 리포트 요청",
    heading: "AI 리포트를 위한 서류를 제출해주세요",
    description: "제출하신 서류를 바탕으로 AI가 정밀 리포트를 준비합니다.",
    submitLabel: "AI 리포트 요청하기",
    submitCaption: "접수 후 AI가 리포트를 준비하며, My Page에서 PDF로 확인하실 수 있습니다.",
    successTitle: "AI 리포트 요청이 접수되었습니다",
    successBody: "My Page에서 진행 상황과 PDF 리포트를 확인하실 수 있습니다.",
  },
  expert: {
    badgeLabel: "전문가 진행 요청",
    heading: "전문가 진행을 위한 서류를 제출해주세요",
    description: "제출하신 서류를 전문가가 직접 확인하여 실제 준비 절차를 안내드립니다.",
    submitLabel: "전문가 진행 요청하기",
    submitCaption: "접수 후 담당 전문가가 확인하여 카카오톡 · Zalo · 이메일로 안내드립니다.",
    successTitle: "전문가 진행 요청이 접수되었습니다",
    successBody: "담당자가 서류를 확인한 뒤 카카오톡 · Zalo · 이메일로 안내드립니다.",
  },
};

// 승인된 목업에 표시된 3개 신뢰 항목 — 모드와 무관하게 고정 문구.
const TRUST_ITEMS = [
  { icon: Shield, label: "안전한 보안", sub: "개인정보 철저 보호" },
  { icon: UserCheck, label: "전문가 직접 확인", sub: "담당 전문가만 열람" },
  { icon: Zap, label: "빠른 안내", sub: "카톡·Zalo·이메일 안내" },
];

// 문서 카드 설명 한 줄 — 승인된 목업에 문구가 있는 문서(여권/비자/재직증명서/회사서류)만
// 정의한다. 그 외 문서는 목업에 없는 문구를 임의로 만들지 않기 위해 설명을 생략한다.
const DOC_DESCRIPTION_BY_LABEL: Record<string, string> = {
  여권: "본인 확인을 위해 필요합니다.",
  비자: "현재 보유 중인 비자를 제출해주세요.",
  재직증명서: "재직 증명 또는 노동허가 관련 서류를 제출해주세요.",
  회사서류: "회사 사업자등록증 사본을 제출해주세요.",
};

function DocumentCard({
  index,
  doc,
  onModeChange,
  onFileChange,
  onFileClear,
  onTextChange,
  onTitleChange,
  onFieldChange,
}: {
  index: number;
  doc: DocState;
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
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
              선택
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
            doc.file ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Paperclip size={15} className="shrink-0 text-blue-700" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-gray-900">{doc.file.name}</p>
                    <p className="text-[11px] text-gray-500">{formatFileSize(doc.file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onFileClear}
                  className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-white hover:text-gray-600"
                  aria-label="파일 삭제"
                >
                  <X size={15} />
                </button>
              </div>
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

                <input
                  id={inputId}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
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
  const serviceParam = params.get("service");
  const modeParam = params.get("mode");
  const mode: SubmitMode = modeParam === "ai_report" ? "ai_report" : "expert";

  const config = useMemo(() => getRequiredDocuments(serviceParam), [serviceParam]);
  const copy = MODE_COPY[mode];

  const [docs, setDocs] = useState<DocState[]>(() => config.documents.map(createDocState));
  const [submitted, setSubmitted] = useState(false);
  const readyCount = docs.filter(isDocReady).length;
  const totalCount = docs.length;
  const progressPercent = totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0;

  // 마지막 순번에 추가되는 "추가 서류 (선택)" 카드 — 서비스별 필수 서류 목록(docs)과는
  // 별개의 자유 제출용 카드라 기존 docs 배열/진행률 계산에는 포함하지 않는다.
  const [extraDoc, setExtraDoc] = useState<DocState>(() => createDocState("추가 서류 (선택)"));

  const scrollTopRef = useRef<HTMLDivElement>(null);

  function updateDoc(index: number, patch: Partial<DocState>) {
    setDocs((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  function handleSubmit() {
    setSubmitted(true);
    scrollTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleReset() {
    setDocs(config.documents.map(createDocState));
    setExtraDoc(createDocState("추가 서류 (선택)"));
    setSubmitted(false);
  }

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <div ref={scrollTopRef} className="mx-auto max-w-5xl px-6 py-10 pb-32 lg:pb-10">
        {/* 모바일 전용 브랜드 헤더 — 로고+브랜드명(좌) / 메뉴 아이콘(우) */}
        <div className="relative -mx-6 -mt-10 mb-4 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <img src="/vfbcai-shield-logo.png" alt="VFBCAI" width={32} height={32} className="shrink-0" />
            <div>
              <p className="text-[15px] font-bold leading-tight text-gray-900">VFBCAI</p>
              <p className="text-[10px] leading-tight text-gray-400">Check. Verify. Register. Protect.</p>
            </div>
          </div>
          <Link href="/" aria-label="홈으로" className="p-1 text-gray-500">
            <Menu size={20} />
          </Link>
        </div>

        {/* 모바일 전용 — 결과로 돌아가기 */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 lg:hidden"
        >
          <ArrowLeft size={14} /> 결과로 돌아가기
        </button>

        {/* PC 전용 — 로고+브랜드명(좌) / 결과로 돌아가기 버튼(우) */}
        <div className="hidden items-center justify-between lg:flex">
          <div className="flex items-center gap-2.5">
            <img src="/vfbcai-shield-logo.png" alt="VFBCAI" width={36} height={36} className="shrink-0" />
            <div>
              <p className="text-lg font-bold leading-tight text-gray-900">VFBCAI</p>
              <p className="text-[11px] leading-tight text-gray-400">Check. Verify. Register. Protect.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft size={13} /> 결과로 돌아가기
          </button>
        </div>

        {!submitted && (
          <>
            {/* 아이콘 + 서비스명 + 설명 */}
            <div className="mt-6 flex items-start gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-900 lg:h-16 lg:w-16">
                <FileText className="text-white" size={26} />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold tracking-tight text-gray-900 lg:text-2xl">
                  {config.serviceLabel} · {copy.badgeLabel}
                </h1>
                <p className="mt-1 text-xs text-gray-500 lg:text-sm">{copy.description}</p>
                {leadId && (
                  <p className="mt-1 text-[11px] text-gray-300">접수번호 {leadId.slice(0, 8)}</p>
                )}
              </div>
            </div>

            {/* 신뢰 항목 3개 */}
            <div className="mt-5 grid grid-cols-1 gap-2 lg:grid-cols-3 lg:gap-3">
              {TRUST_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-3.5 py-2.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
                    <item.icon size={15} className="text-blue-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900">{item.label}</p>
                    <p className="text-[11px] text-gray-400">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 전체 제출 진행률 */}
            <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-gray-900">제출 진행률</p>
                <p className="shrink-0 text-xs font-semibold text-gray-400">{progressPercent}%</p>
              </div>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-blue-900 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="mt-3 text-xl font-bold text-blue-900">
                {readyCount} / {totalCount} <span className="text-sm font-semibold text-gray-500">완료</span>
              </p>
              <p className="mt-0.5 text-xs text-gray-400">총 {totalCount}개 문서 필요</p>
            </div>
          </>
        )}

        {submitted ? (
          <div className="mt-8 rounded-3xl border border-gray-100 bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="text-emerald-600" size={28} />
            </div>
            <p className="mt-4 text-lg font-bold text-gray-900">{copy.successTitle}</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{copy.successBody}</p>
            <button
              onClick={handleReset}
              className="mt-6 block text-xs text-gray-400 hover:text-gray-600"
            >
              다시 작성하기
            </button>
          </div>
        ) : (
          <div className="mt-6 lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-6">
            {/* 좌측 — 문서 카드 목록 */}
            <div className="space-y-4">
              <div>
                <p className="text-base font-bold text-gray-900">필요한 문서</p>
                <p className="mt-1 text-xs text-gray-500">
                  모든 문서는 선택 사항입니다. 보유하신 자료로만 제출해주세요.
                </p>
              </div>

              {docs.map((doc, i) => (
                <DocumentCard
                  key={doc.label}
                  index={i}
                  doc={doc}
                  onModeChange={(inputMode) => updateDoc(i, { inputMode })}
                  onFileChange={(file) => updateDoc(i, { file })}
                  onFileClear={() => updateDoc(i, { file: null })}
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
                onModeChange={(inputMode) => setExtraDoc((prev) => ({ ...prev, inputMode }))}
                onFileChange={(file) => setExtraDoc((prev) => ({ ...prev, file }))}
                onFileClear={() => setExtraDoc((prev) => ({ ...prev, file: null }))}
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
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <p className="text-sm font-bold text-gray-900">제출 현황</p>
                <p className="mt-1 text-xs text-gray-500">
                  {totalCount}개 문서 필요
                </p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-900 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {readyCount} / {totalCount} 개 완료
                </p>

                <ul className="mt-4 space-y-2">
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

                <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 text-xs">
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

                <div className="mt-5">
                  <PrimaryButton onClick={handleSubmit}>{copy.submitLabel}</PrimaryButton>
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
      {!submitted && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-100 bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] lg:hidden">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-sm font-bold text-gray-900">
              {readyCount} / {totalCount} 개 완료
            </p>
            <div className="mt-3">
              <PrimaryButton onClick={handleSubmit}>{copy.submitLabel}</PrimaryButton>
            </div>
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
