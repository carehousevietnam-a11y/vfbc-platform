"use client";

import { Paperclip } from "lucide-react";
import { PrimaryButton } from "@/components/ui";
import { VerifyStep4InputStack } from "@/components/ui/verifyStep4Ui";
import { cn } from "@/lib/cn";
import type {
  VerifyMasterEvidenceContentSlots,
  VerifyServiceDomain,
} from "@/lib/verifyMasterContentSlots";

/** 메인 페이지 기준 3색(남색 #071A33 · 파랑 #2563EB · 회색 #6B7A90/#E3E8F0) */
const ATTACH_LABEL_CLASS =
  "mt-3 flex min-h-[48px] w-full min-w-0 cursor-pointer items-start gap-2 rounded-[12px] border border-dashed border-[#C9D3E3] bg-[#F7F9FC] px-4 py-3 text-[13.5px] text-[#3D4B63] transition-colors hover:border-[#2563EB] hover:bg-[#F2F6FE]";
const ATTACHED_CARD_CLASS =
  "mt-3 w-full min-w-0 rounded-[12px] border border-[#E3E8F0] bg-[#F7F9FC] px-4 py-3";

const PHASE1_EXAMPLE_TAGS = [
  "공문/통지서",
  "안내문",
  "계약서",
  "영수증",
  "사진",
  "메시지 캡처",
  "상황 메모",
];

export type VerifySimpleEvidenceTier = "phase1" | "phase2";

type AdminVerifyPhase2EvidencePanelProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  onContinue: () => void;
  className?: string;
  /** Phase1 pre-signup vs Phase2 post-signup badge/copy — default Phase2 (unchanged). */
  evidenceTier?: VerifySimpleEvidenceTier;
  domain?: VerifyServiceDomain;
  /** Pack 예시 칩 — 미지정 시 행정 VERIFY 기본 목록 */
  exampleTags?: readonly string[];
  /** 서비스 중립 내용 슬롯 — 미지정 시 Admin 기본값 */
  contentSlots?: VerifyMasterEvidenceContentSlots;
  /** Phase1 Storage 업로드 실패 안내(부동산 1차만) */
  attachStorageError?: string | null;
  onAttachStorageRetry?: () => void;
};

const EVIDENCE_TIER_COPY: Record<
  VerifySimpleEvidenceTier,
  {
    badge: string;
    title: string;
    detailNote: Record<"admin" | "real-estate", string>;
    footerNote: Record<"admin" | "real-estate", string>;
    titleId: string;
  }
> = {
  phase1: {
    badge: "1차 · 간단 자료",
    title: "간단한 자료가 있으면 함께 첨부해주세요",
    detailNote: {
      admin:
        "현재 상황을 더 정확하게 이해하는 데 도움이 됩니다. 지금 가지고 있는 대표 자료 1개만 선택할 수 있습니다.",
      "real-estate":
        "현재 상황을 더 정확하게 이해하는 데 도움이 됩니다. 지금 가지고 있는 대표 자료 1개만 선택할 수 있습니다.",
    },
    footerNote: {
      admin:
        "자료가 없어도 다음 단계로 진행할 수 있습니다. 회원가입 후 1차 종합 결과를 확인할 수 있습니다.",
      "real-estate":
        "자료가 없어도 다음 단계로 진행할 수 있습니다. 회원가입 후 1차 종합 결과를 확인할 수 있습니다.",
    },
    titleId: "verify-phase1-evidence-title",
  },
  phase2: {
    badge: "2차 · 상세 자료",
    title: "2차 상세검토에 필요한 자료가 있으면 첨부해주세요",
    detailNote: {
      admin:
        "1차에서 받은 간단 자료와 별도로, 2차 추가 확인에 도움이 되는 공문·통지서·안내문·대화 캡처 등 대표 자료 1개를 선택할 수 있습니다.",
      "real-estate":
        "1차에서 받은 간단 자료와 별도로, 2차 추가 확인에 도움이 되는 계약서·등기부·대화 캡처 등 대표 자료 1개를 선택할 수 있습니다.",
    },
    footerNote: {
      admin:
        "자료가 없어도 2차 개인화 결과로 진행할 수 있습니다. 이후 필요하면 관련 문서를 추가로 첨부할 수 있습니다.",
      "real-estate":
        "자료가 없어도 2차 개인화 결과로 진행할 수 있습니다. 이후 필요하면 관련 문서를 추가로 첨부할 수 있습니다.",
    },
    titleId: "admin-verify-phase2-evidence-title",
  },
};

function evidenceNoteForDomain(
  notes: Record<"admin" | "real-estate", string>,
  domain: VerifyServiceDomain,
): string {
  if (domain === "real-estate") return notes["real-estate"];
  return notes.admin;
}

export function AdminVerifyPhase2EvidencePanel({
  file,
  onFileChange,
  onContinue,
  className,
  evidenceTier = "phase2",
  domain = "admin",
  exampleTags,
  contentSlots,
  attachStorageError,
  onAttachStorageRetry,
}: AdminVerifyPhase2EvidencePanelProps) {
  const tierCopy = EVIDENCE_TIER_COPY[evidenceTier];
  const serviceDisplayName = contentSlots?.identity?.serviceDisplayName?.trim();
  const detailNote =
    contentSlots?.detailNoteByTier?.[evidenceTier] ?? evidenceNoteForDomain(tierCopy.detailNote, domain);
  const footerNote =
    contentSlots?.footerNoteByTier?.[evidenceTier] ?? evidenceNoteForDomain(tierCopy.footerNote, domain);
  const tagList =
    contentSlots?.exampleTags?.length
      ? contentSlots.exampleTags
      : exampleTags?.length
        ? exampleTags
        : PHASE1_EXAMPLE_TAGS;

  return (
    <section
      className={cn(
        "rounded-[14px] border border-[#E3E8F0] bg-white p-5 lg:p-6",
        className,
      )}
      aria-labelledby={tierCopy.titleId}
    >
      <div className="mb-1 flex items-center gap-2">
        {serviceDisplayName ? (
          <span className="text-[12px] font-semibold text-[#071A33]">{serviceDisplayName}</span>
        ) : null}
        <span className="rounded-md bg-[#F2F6FE] px-2 py-0.5 text-[11px] font-semibold tracking-tight text-[#2563EB]">
          {tierCopy.badge}
        </span>
        <span className="text-[12px] font-medium text-[#6B7A90]">선택</span>
      </div>
      <h3
        id={tierCopy.titleId}
        className="mt-2 break-keep text-pretty text-[18px] font-bold leading-[1.35] tracking-[-0.02em] text-[#071A33] [overflow-wrap:anywhere] [word-break:keep-all] lg:text-[19px]"
      >
        {tierCopy.title}
      </h3>
      <p className="mt-2 break-keep text-[13.5px] leading-[1.6] text-[#3D4B63]">
        {detailNote}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {tagList.map((example) => (
          <span
            key={example}
            className="rounded-full border border-[#E3E8F0] bg-white px-2.5 py-1 text-[11.5px] font-medium text-[#3D4B63]"
          >
            {example}
          </span>
        ))}
      </div>

      <VerifyStep4InputStack className="mt-4 px-1 sm:px-0">
        {!file ? (
          <label
            className={cn(
              ATTACH_LABEL_CLASS,
            )}
          >
            <Paperclip size={16} className="mt-0.5 shrink-0 text-[#2563EB]" />
            <span
              className={cn(
                "min-w-0 flex-1 break-keep text-pretty leading-snug [overflow-wrap:anywhere]",
              )}
            >
              대표 자료 1개 첨부 (선택 · 사진 · PDF · Word)
            </span>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const next = e.target.files?.[0] ?? null;
                onFileChange(next);
              }}
            />
          </label>
        ) : (
          <div className={ATTACHED_CARD_CLASS}>
            <p className="text-[12px] font-semibold text-[#6B7A90]">
              {evidenceTier === "phase2" ? "선택한 2차 상세 자료" : "선택한 간단 자료"}
            </p>
            <div className="mt-1.5 flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-1.5 truncate text-[14px] text-[#071A33]">
                <Paperclip size={14} className="shrink-0 text-[#6B7A90]" />
                <span className="truncate">{file.name}</span>
              </span>
              <button
                type="button"
                onClick={() => onFileChange(null)}
                className="shrink-0 text-[12px] font-medium text-[#6B7A90] hover:text-[#2563EB]"
              >
                제거
              </button>
            </div>
          </div>
        )}
        <p className="mt-3 break-keep text-[12px] leading-[1.6] text-[#6B7A90]">
          {footerNote}
        </p>
        {attachStorageError ? (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
            <p className="break-keep text-[12px] font-medium leading-snug text-red-800">
              {attachStorageError}
            </p>
            {onAttachStorageRetry ? (
              <button
                type="button"
                onClick={onAttachStorageRetry}
                className="mt-2 text-[12px] font-semibold text-red-700 underline underline-offset-2 hover:text-red-900"
              >
                다시 시도
              </button>
            ) : null}
          </div>
        ) : null}
      </VerifyStep4InputStack>

      <div className="mt-6 flex flex-wrap justify-start gap-2">
        <PrimaryButton type="button" className="w-full max-w-none !h-[52px] !rounded-[12px] !bg-[#2563EB] !shadow-none hover:!bg-[#1D4ED8]" onClick={onContinue}>
          {file
            ? "자료 포함하고 계속하기"
            : evidenceTier === "phase1"
              ? "계속하기"
              : "자료 없이 계속하기"}
        </PrimaryButton>
      </div>
    </section>
  );
}
