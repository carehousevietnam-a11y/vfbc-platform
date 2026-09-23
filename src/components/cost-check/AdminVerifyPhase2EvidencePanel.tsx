"use client";

import { Paperclip } from "lucide-react";
import { PrimaryButton } from "@/components/ui";
import {
  VERIFY_STEP4_ATTACHED_CARD_CLASS,
  VERIFY_STEP4_ATTACHMENT_LABEL_CLASS,
  VerifyStep4InputStack,
} from "@/components/ui/verifyStep4Ui";
import { cn } from "@/lib/cn";

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
  domain?: "admin" | "real-estate";
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
        "현재 상황을 더 정확하게 이해하는 데 도움이 됩니다. /documents 상세 업로드와는 별도로, 지금 가지고 있는 대표 자료 1개만 선택할 수 있습니다.",
      "real-estate":
        "현재 상황을 더 정확하게 이해하는 데 도움이 됩니다. /documents 상세 업로드와는 별도로, 지금 가지고 있는 대표 자료 1개만 선택할 수 있습니다.",
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
        "1차에서 받은 간단 자료와 별도로, 2차 추가 확인에 도움이 되는 공문·통지서·안내문·대화 캡처 등 대표 자료 1개를 선택할 수 있습니다. 3차 전체 문서 업로드(/documents)와는 다른 단계입니다.",
      "real-estate":
        "1차에서 받은 간단 자료와 별도로, 2차 추가 확인에 도움이 되는 계약서·등기부·대화 캡처 등 대표 자료 1개를 선택할 수 있습니다. 3차 전체 문서 업로드(/documents)와는 다른 단계입니다.",
    },
    footerNote: {
      admin:
        "자료가 없어도 2차 개인화 결과로 진행할 수 있습니다. 상세 AI Review는 이후 단계에서 관련 문서를 첨부한 뒤 진행합니다.",
      "real-estate":
        "자료가 없어도 2차 개인화 결과로 진행할 수 있습니다. 상세 AI Review는 이후 단계에서 관련 문서를 첨부한 뒤 진행합니다.",
    },
    titleId: "admin-verify-phase2-evidence-title",
  },
};

export function AdminVerifyPhase2EvidencePanel({
  file,
  onFileChange,
  onContinue,
  className,
  evidenceTier = "phase2",
  domain = "admin",
}: AdminVerifyPhase2EvidencePanelProps) {
  const tierCopy = EVIDENCE_TIER_COPY[evidenceTier];
  const detailNote = tierCopy.detailNote[domain];
  const footerNote = tierCopy.footerNote[domain];

  return (
    <section
      className={cn(
        "rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5 lg:rounded-lg lg:p-5 lg:shadow-none",
        className,
      )}
      aria-labelledby={tierCopy.titleId}
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
          {tierCopy.badge}
        </span>
        <span className="text-[11px] font-medium text-slate-400">선택</span>
      </div>
      <h3
        id={tierCopy.titleId}
        className="mt-2 text-base font-bold leading-snug text-slate-900 sm:text-[17px] lg:text-[16px]"
      >
        {tierCopy.title}
      </h3>
      <p className="mt-1.5 break-keep text-[13px] leading-relaxed text-slate-600 lg:text-[12.5px]">
        {detailNote}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {PHASE1_EXAMPLE_TAGS.map((example) => (
          <span
            key={example}
            className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600"
          >
            {example}
          </span>
        ))}
      </div>

      <VerifyStep4InputStack className="mt-4">
        {!file ? (
          <label className={VERIFY_STEP4_ATTACHMENT_LABEL_CLASS}>
            <Paperclip size={16} className="shrink-0" />
            <span className="truncate">
              {evidenceTier === "phase2"
                ? "대표 자료 1개 첨부 (선택 · 사진 · PDF · Word)"
                : "대표 자료 1개 첨부 (선택 · 사진 · PDF · Word)"}
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
          <div className={VERIFY_STEP4_ATTACHED_CARD_CLASS}>
            <p className="text-[11px] font-semibold text-gray-500">
              {evidenceTier === "phase2" ? "선택한 2차 상세 자료" : "선택한 간단 자료"}
            </p>
            <div className="mt-1.5 flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-1.5 truncate text-sm text-gray-800">
                <Paperclip size={14} className="shrink-0 text-gray-400" />
                <span className="truncate">{file.name}</span>
              </span>
              <button
                type="button"
                onClick={() => onFileChange(null)}
                className="shrink-0 text-xs font-medium text-gray-500 hover:text-gray-700"
              >
                제거
              </button>
            </div>
          </div>
        )}
        <p className="mt-2 break-keep text-[11px] leading-[1.55] text-slate-400">
          {footerNote}
        </p>
      </VerifyStep4InputStack>

      <div className="mt-5 flex flex-wrap gap-2">
        <PrimaryButton type="button" onClick={onContinue}>
          {file ? "자료 포함하고 계속하기" : "자료 없이 계속하기"}
        </PrimaryButton>
      </div>
    </section>
  );
}
