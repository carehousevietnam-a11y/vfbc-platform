import Link from "next/link";
import { BookOpen, ClipboardCheck } from "lucide-react";
import type { PublishedArticle } from "@/lib/contentPacks/types";
import { guidePath } from "@/lib/contentPacks/paths";

const ICON_STROKE = 1.75;

function funnelHrefWithStart(href: string): string {
  return href.includes("?") ? `${href}&start=check` : `${href}?start=check`;
}

export function GuideCaseNextStepCta({
  article,
  onFunnelClick,
  onGuidePage = false,
}: {
  article: PublishedArticle;
  onFunnelClick?: () => void;
  onGuidePage?: boolean;
}) {
  const detailHref = onGuidePage ? "#guide-detail" : guidePath(article.slug);
  const choiceBase =
    "flex h-full min-h-[68px] flex-col items-start justify-center gap-0.5 rounded-[10px] px-2.5 py-1.5 text-left transition-colors sm:min-h-[74px] sm:px-3 sm:py-2";

  const primaryContent = (
    <>
      <ClipboardCheck className="h-[18px] w-[18px] text-white" strokeWidth={ICON_STROKE} aria-hidden />
      <span className="text-[15px] font-semibold leading-snug text-white sm:text-base">
        내 상황 확인하기 →
      </span>
      <span className="break-keep text-xs leading-snug text-white/90 sm:text-[13px]">
        내 상황과 자료를 입력해 직접 확인합니다.
      </span>
    </>
  );

  return (
    <section className="rounded-[10px] border border-[#D6E4FB] bg-[#F5F8FF]/60 p-2 sm:p-2.5">
      <p className="text-sm font-semibold leading-snug text-[#0B2A6B] sm:text-[15px]">
        내 상황에 맞는 다음 단계
      </p>
      <div className="mt-1.5 grid auto-rows-fr grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2">
        <Link
          href={detailHref}
          className={`${choiceBase} border border-[#D6E4FB] bg-white hover:bg-blue-50/40`}
        >
          <BookOpen className="h-[18px] w-[18px] text-blue-800" strokeWidth={ICON_STROKE} aria-hidden />
          <span className="text-[15px] font-semibold leading-snug text-blue-900 sm:text-base">
            더 자세히 보기 →
          </span>
          <span className="break-keep text-xs leading-snug text-[#556070] sm:text-[13px]">
            가이드 내용을 자세히 확인합니다.
          </span>
        </Link>

        {onFunnelClick ? (
          <button
            type="button"
            onClick={onFunnelClick}
            className={`${choiceBase} bg-amber-500 hover:bg-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500`}
          >
            {primaryContent}
          </button>
        ) : (
          <Link
            href={funnelHrefWithStart(article.funnelHref)}
            className={`${choiceBase} bg-amber-500 hover:bg-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500`}
          >
            {primaryContent}
          </Link>
        )}
      </div>
    </section>
  );
}
