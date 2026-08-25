import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const VERIFY_STEP4_TEXTAREA_CLASS =
  "w-full min-w-0 resize-none rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-[13px] leading-relaxed text-[#0F172A] focus:border-[#0B2A6B] focus:outline-none focus:ring-1 focus:ring-[#0B2A6B]/20";

export const VERIFY_STEP4_FIELD_HINT_CLASS =
  "mt-1.5 break-keep text-[11px] leading-[1.55] text-[#94A3B8] [overflow-wrap:normal]";

export const VERIFY_STEP4_ATTACHMENT_LABEL_CLASS =
  "mt-3 flex h-10 w-full min-w-0 items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3.5 text-[13px] text-gray-500 cursor-pointer transition-colors hover:border-gray-900";

export const VERIFY_STEP4_ATTACHED_CARD_CLASS =
  "mt-3 w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3";

/** Step 4 입력 필드 — 질문·textarea·첨부가 동일 content axis를 공유 */
export function VerifyStep4InputStack({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex w-full min-w-0 flex-col", className)}>{children}</div>;
}

export function VerifyTextareaHint() {
  return (
    <p className={VERIFY_STEP4_FIELD_HINT_CLASS}>
      현재 상황과 확인이 필요한 내용을 중심으로 작성해주세요.
    </p>
  );
}

export function VerifyAttachmentHint() {
  return (
    <p className={VERIFY_STEP4_FIELD_HINT_CLASS}>
      첫 화면에서는 대표 서류만 제출해주세요. 접수 후{" "}
      <span className="whitespace-nowrap">/documents</span>
      에서{" "}
      <span className="whitespace-nowrap">원본·번역본·공증본</span>,{" "}
      <span className="whitespace-nowrap">기관 안내문</span> 또는{" "}
      <span className="whitespace-nowrap">추가 증거자료를 계속 제출할 수 있습니다.</span>
    </p>
  );
}

export function VerifyAttachedFileNote() {
  return (
    <p className="mt-2 break-keep text-[11px] leading-[1.55] text-[#94A3B8] [overflow-wrap:normal]">
      개인정보 입력과 접수가 완료되면 이 자료가 함께 제출됩니다.
    </p>
  );
}
