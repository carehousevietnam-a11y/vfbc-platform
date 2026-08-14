import Link from "next/link";

export default function CostCheckPromo() {
  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="h-[3px] bg-blue-900" />
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-6 py-8 sm:flex-row sm:justify-between sm:py-10">
        <div className="text-center sm:text-left">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            무료 도구
          </p>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
            내 견적이 적정한지 무료로 확인해보세요
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            정부 수수료 확인 · 견적 검토 · 법인 직접 진행 참고 — 가입 없이 바로 이용
          </p>
        </div>
        <Link
          href="/cost-check"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-900 px-6 py-3 text-sm font-medium text-white hover:bg-blue-800"
        >
          비용 적정성 확인하기
        </Link>
      </div>
    </section>
  );
}
