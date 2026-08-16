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
    <section className="mt-10" aria-labelledby="next-step-heading">
      <h2 id="next-step-heading" className="text-base font-semibold text-blue-900 sm:text-lg">
        다음 단계
      </h2>
      <div className="mt-4 rounded-2xl bg-white px-5 py-6 ring-1 ring-slate-200/80 sm:px-6 sm:py-7">
        <p className="text-[15px] text-slate-700">비용과 절차를 확인했다면, 이제 내 상황을 점검해 보세요.</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          같은 업무라도 사람마다 필요한 절차와 조건이 다를 수 있습니다. 내 상황에 맞는 절차와 서류를
          확인하세요.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href={funnelHref}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-blue-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#152a63] sm:min-w-[200px] sm:flex-none"
          >
            {funnelLabel} →
          </Link>
          {showExpertCta ? (
            <Link
              href="/consultation"
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-blue-900 transition-colors hover:bg-[#faf8f5] sm:min-w-[160px] sm:flex-none"
            >
              전문가 상담
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
