"use client";

import { MessageCircle, CircleDollarSign, CheckCircle2 } from "lucide-react";
import { formatRequestedAt } from "@/components/result/parseReplyPresentation";

type QuestionCardProps = {
  question: string;
  requestedAt: string;
  showCostAnchor?: boolean;
};

const ANCHOR_CLASS =
  "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-50 hover:text-blue-900";

export function QuestionCard({ question, requestedAt, showCostAnchor = false }: QuestionCardProps) {
  const dateLabel = formatRequestedAt(requestedAt);

  return (
    <section
      className="rounded-xl bg-white px-4 py-4 ring-1 ring-slate-200/70 sm:px-5 sm:py-5"
      aria-labelledby="ai-question-heading"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-wide text-blue-900/70 sm:text-[13px]">
            행정·법률 확인기
          </p>
          <h2
            id="ai-question-heading"
            className="mt-1.5 break-keep text-xl font-bold leading-snug text-slate-900 sm:text-[22px] lg:text-[23px]"
          >
            &ldquo;{question}&rdquo;
          </h2>
          {dateLabel ? (
            <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-[13px]">
              <time dateTime={requestedAt}>{dateLabel}</time>
              <span className="mx-1.5 text-slate-300">·</span>
              <span>Vietnam</span>
            </p>
          ) : null}
        </div>
        <nav className="flex shrink-0 items-center gap-0.5" aria-label="결과 섹션 바로가기">
          <a href="#ai-question-heading" className={ANCHOR_CLASS} aria-label="질문">
            <MessageCircle size={18} />
          </a>
          {showCostAnchor ? (
            <a href="#cost-check-heading" className={ANCHOR_CLASS} aria-label="비용">
              <CircleDollarSign size={18} />
            </a>
          ) : null}
          <a href="#direct-answer-heading" className={ANCHOR_CLASS} aria-label="확인">
            <CheckCircle2 size={18} />
          </a>
        </nav>
      </div>
    </section>
  );
}
