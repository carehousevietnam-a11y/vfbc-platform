"use client";

import Link from "next/link";

type NextStepProps = {
  funnelHref: string;
  funnelLabel?: string;
  showExpertCta?: boolean;
};

export function NextStep({
  funnelHref,
  funnelLabel = "내 상황 무료 진단받기",
  showExpertCta = true,
}: NextStepProps) {
  return (
    <section className="mt-8 lg:mt-10" aria-labelledby="next-step-heading">
      <h2 id="next-step-heading" className="sr-only">
        다음 단계
      </h2>
      <div className="rounded-xl bg-blue-900 px-6 py-8 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
        <p className="text-lg font-semibold text-white sm:text-xl lg:text-[22px]">
          정확한 절차와 비용이 궁금하다면?
        </p>
        <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed text-blue-100 sm:text-base">
          지금 내 상황에 맞는 정확한 절차와 비용을 확인해보세요.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href={funnelHref}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-white px-6 py-3 text-[15px] font-semibold text-blue-900 transition-colors hover:bg-blue-50 sm:min-w-[200px] sm:flex-none sm:text-base"
          >
            {funnelLabel}
          </Link>
          {showExpertCta ? (
            <Link
              href="/consultation"
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/15 sm:min-w-[160px] sm:flex-none sm:text-base"
            >
              전문가 상담하기
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
