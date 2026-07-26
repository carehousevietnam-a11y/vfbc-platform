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

import { Suspense, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  PenLine,
  CheckCircle2,
  Circle,
  X,
  Paperclip,
} from "lucide-react";
import { NoticeCard, PrimaryButton, InfoBox, TextAreaField, StatusBadge } from "@/components/ui";
import { getRequiredDocuments } from "@/lib/requiredDocuments";

type SubmitMode = "ai_report" | "expert";
type DocInputMode = "upload" | "manual";

interface DocState {
  label: string;
  inputMode: DocInputMode;
  file: File | null;
  text: string;
}

function isDocReady(doc: DocState): boolean {
  return doc.inputMode === "upload" ? doc.file !== null : doc.text.trim().length > 0;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
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
    submitCaption: "결과는 My Page에서 PDF로 확인하실 수 있습니다.",
    successTitle: "AI 리포트 요청이 접수되었습니다",
    successBody: "My Page에서 진행 상황과 PDF 리포트를 확인하실 수 있습니다.",
  },
  expert: {
    badgeLabel: "전문가 진행 요청",
    heading: "전문가 진행을 위한 서류를 제출해주세요",
    description: "제출하신 서류를 전문가가 확인한 뒤 진행을 도와드립니다.",
    submitLabel: "전문가 진행 요청하기",
    submitCaption: "담당자가 서류 확인 후 안내드립니다.",
    successTitle: "전문가 진행 요청이 접수되었습니다",
    successBody: "담당자가 서류를 확인한 뒤 카카오톡 · Zalo · 이메일로 안내드립니다.",
  },
};

function DocumentCard({
  index,
  doc,
  onModeChange,
  onFileChange,
  onFileClear,
  onTextChange,
}: {
  index: number;
  doc: DocState;
  onModeChange: (mode: DocInputMode) => void;
  onFileChange: (file: File | null) => void;
  onFileClear: () => void;
  onTextChange: (text: string) => void;
}) {
  const inputId = `doc-file-${index}`;
  const ready = isDocReady(doc);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-900 text-[10px] font-bold text-white">
            {index + 1}
          </span>
          <p className="truncate text-sm font-bold text-gray-900">{doc.label}</p>
        </div>
        <StatusBadge tone={ready ? "success" : "neutral"} className="shrink-0">
          {ready ? "제출 준비 완료" : "제출 대기"}
        </StatusBadge>
      </div>

      {/* 업로드 / 직접 입력 탭 */}
      <div className="mt-4 inline-flex rounded-xl bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => onModeChange("upload")}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            doc.inputMode === "upload" ? "bg-white text-blue-900 shadow-sm" : "text-gray-500"
          }`}
        >
          <Upload size={13} /> 문서 업로드
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

      <div className="mt-3">
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
            <label
              htmlFor={inputId}
              className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 bg-gray-50/60 px-4 py-6 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/40"
            >
              <Upload size={20} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-600">
                파일을 선택하거나 끌어다 놓으세요
              </span>
              <span className="text-[11px] text-gray-400">JPG, PNG, PDF (최대 10MB)</span>
              <input
                id={inputId}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
              />
            </label>
          )
        ) : (
          <TextAreaField
            rows={3}
            placeholder="서류 번호, 발급일자 등 관련 정보를 직접 입력해주세요."
            hint="사진이나 스캔본이 없어도 텍스트로 제출하실 수 있습니다."
            value={doc.text}
            onChange={(e) => onTextChange(e.target.value)}
          />
        )}
      </div>
    </div>
  );
}

function DocumentUploadContent() {
  const params = useSearchParams();
  const leadId = params.get("leadId");
  const serviceParam = params.get("service");
  const modeParam = params.get("mode");
  const mode: SubmitMode = modeParam === "ai_report" ? "ai_report" : "expert";

  const config = useMemo(() => getRequiredDocuments(serviceParam), [serviceParam]);
  const copy = MODE_COPY[mode];

  const [docs, setDocs] = useState<DocState[]>(() =>
    config.documents.map((label) => ({ label, inputMode: "upload", file: null, text: "" }))
  );
  const [submitted, setSubmitted] = useState(false);
  const readyCount = docs.filter(isDocReady).length;
  const totalCount = docs.length;
  const progressPercent = totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0;

  // 마지막 순번에 추가되는 "추가 서류 (선택)" 카드 — 서비스별 필수 서류 목록(docs)과는
  // 별개의 자유 제출용 카드라 기존 docs 배열/진행률 계산에는 포함하지 않는다.
  const [extraDoc, setExtraDoc] = useState<DocState>({
    label: "추가 서류 (선택)",
    inputMode: "upload",
    file: null,
    text: "",
  });

  const scrollTopRef = useRef<HTMLDivElement>(null);

  function updateDoc(index: number, patch: Partial<DocState>) {
    setDocs((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  function handleSubmit() {
    setSubmitted(true);
    scrollTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleReset() {
    setDocs(config.documents.map((label) => ({ label, inputMode: "upload", file: null, text: "" })));
    setExtraDoc({ label: "추가 서류 (선택)", inputMode: "upload", file: null, text: "" });
    setSubmitted(false);
  }

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <div ref={scrollTopRef} className="mx-auto max-w-5xl px-6 py-10 pb-28 lg:pb-10">
        {/* 모바일 전용 브랜드 헤더 — TRC 등 CHECK 페이지와 동일 패턴 재사용 */}
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
            <p className="text-[11px] leading-tight text-gray-400">베트남 행정전문 AI</p>
          </div>
        </Link>

        {/* 데스크톱 전용 홈 링크 */}
        <Link
          href="/"
          className="hidden items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600 sm:inline-flex"
        >
          <ArrowLeft size={14} /> 홈으로
        </Link>

        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            {config.serviceLabel} · {copy.badgeLabel}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">서류 제출</h1>
          <p className="mt-1 text-sm text-gray-500">{copy.description}</p>
          {leadId && (
            <p className="mt-1 text-[11px] text-gray-300">접수번호 {leadId.slice(0, 8)}</p>
          )}
        </div>

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
          <div className="mt-8 lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-6">
            {/* 좌측 — 문서 카드 목록 */}
            <div className="space-y-4">
              <NoticeCard tone="info">
                지금 준비되지 않은 서류는 비워두셔도 됩니다. 준비되는 대로 나중에 제출하실 수
                있습니다.
              </NoticeCard>

              {docs.map((doc, i) => (
                <DocumentCard
                  key={doc.label}
                  index={i}
                  doc={doc}
                  onModeChange={(inputMode) => updateDoc(i, { inputMode })}
                  onFileChange={(file) => updateDoc(i, { file })}
                  onFileClear={() => updateDoc(i, { file: null })}
                  onTextChange={(text) => updateDoc(i, { text })}
                />
              ))}

              <DocumentCard
                index={docs.length}
                doc={extraDoc}
                onModeChange={(inputMode) => setExtraDoc((prev) => ({ ...prev, inputMode }))}
                onFileChange={(file) => setExtraDoc((prev) => ({ ...prev, file }))}
                onFileClear={() => setExtraDoc((prev) => ({ ...prev, file: null }))}
                onTextChange={(text) => setExtraDoc((prev) => ({ ...prev, text }))}
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
                  {totalCount}개 중 {readyCount}개 준비됨
                </p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-900 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

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

                <div className="mt-5">
                  <PrimaryButton onClick={handleSubmit}>{copy.submitLabel}</PrimaryButton>
                  <InfoBox className="mt-2 justify-center text-center">
                    {copy.submitCaption}
                  </InfoBox>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 모바일 전용 — 하단 고정 CTA */}
      {!submitted && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-100 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-5xl items-center gap-3">
            <div className="min-w-0 shrink-0">
              <p className="text-[11px] text-gray-400">
                {totalCount}개 중 {readyCount}개 준비됨
              </p>
              <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-blue-900 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className="flex-1">
              <PrimaryButton onClick={handleSubmit} className="h-12">
                {copy.submitLabel}
              </PrimaryButton>
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
