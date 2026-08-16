"use client";

export type KeyMetricItem = {
  label: string;
  value: string;
  hint?: string;
  emphasis?: boolean;
};

type KeyMetricsProps = {
  title?: string;
  metrics: KeyMetricItem[];
};

export function KeyMetrics({ title = "핵심 수치", metrics }: KeyMetricsProps) {
  if (metrics.length === 0) return null;

  return (
    <section aria-labelledby="key-metrics-heading">
      <h2 id="key-metrics-heading" className="text-base font-semibold text-blue-900 sm:text-lg">
        {title}
      </h2>
      <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`rounded-xl px-4 py-4 sm:px-5 sm:py-5 ${
              metric.emphasis
                ? "bg-blue-900/[0.04] ring-1 ring-blue-900/10"
                : "bg-white ring-1 ring-slate-200/80"
            }`}
          >
            <dt className="text-xs font-medium text-slate-500 sm:text-[13px]">{metric.label}</dt>
            <dd
              className={`mt-1.5 break-words text-xl font-bold tracking-tight sm:text-2xl ${
                metric.emphasis ? "text-blue-900" : "text-slate-900"
              }`}
            >
              {metric.value}
            </dd>
            {metric.hint ? (
              <dd className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-[13px]">
                {metric.hint}
              </dd>
            ) : null}
          </div>
        ))}
      </dl>
    </section>
  );
}
