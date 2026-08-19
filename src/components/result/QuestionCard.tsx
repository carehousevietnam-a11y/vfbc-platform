"use client";

import type { ReactNode } from "react";
import { MessageCircle, CircleDollarSign, CheckCircle2 } from "lucide-react";
import { formatRequestedAt } from "@/components/result/parseReplyPresentation";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type QuestionCardProps = {
  question: string;
  requestedAt: string;
  showCostAnchor?: boolean;
  lead?: ReactNode;
};

const ANCHOR_CLASS =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[12px] font-medium text-slate-400 transition-colors hover:bg-slate-50 hover:text-blue-900";

export function QuestionCard({
  question,
  requestedAt,
  showCostAnchor = false,
  lead,
}: QuestionCardProps) {
  const { t } = useLocale();
  const dateLabel = formatRequestedAt(requestedAt);

  return (
    <section className="border-b border-slate-200/80 pb-5" aria-labelledby="ai-question-heading">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] font-semibold tracking-wide text-slate-400">
          {t("result.questionBadge")}
        </p>
        <nav className="flex shrink-0 items-center" aria-label="결과 섹션 바로가기">
          <a href="#ai-question-heading" className={ANCHOR_CLASS} aria-label="질문">
            <MessageCircle size={16} />
          </a>
          {showCostAnchor ? (
            <a href="#cost-check-heading" className={ANCHOR_CLASS} aria-label="비용">
              <CircleDollarSign size={16} />
            </a>
          ) : null}
          <a href="#direct-answer-heading" className={ANCHOR_CLASS} aria-label="확인">
            <CheckCircle2 size={16} />
          </a>
        </nav>
      </div>

      {lead}

      <h1
        id="ai-question-heading"
        className="mt-4 break-keep text-[1.25rem] font-bold leading-snug text-slate-900 sm:text-[1.5rem]"
      >
        {question}
      </h1>
      {dateLabel ? (
        <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
          <time dateTime={requestedAt}>{dateLabel}</time>
          <span className="mx-1.5 text-slate-300">·</span>
          <span>Vietnam</span>
        </p>
      ) : null}
    </section>
  );
}
