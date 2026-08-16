"use client";

type CostMetricCardProps = {
  label: string;
  value: string;
  hint?: string;
  emphasis?: boolean;
  placeholder?: boolean;
};

export function CostMetricCard({
  label,
  value,
  hint,
  emphasis = false,
  placeholder = false,
}: CostMetricCardProps) {
  return (
    <div
      className={`flex min-h-[120px] flex-col justify-between rounded-2xl bg-white px-5 py-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/60 sm:px-6 sm:py-6 ${
        emphasis ? "ring-blue-900/15" : ""
      }`}
    >
      <p className="text-[13px] font-medium text-slate-500 sm:text-sm">{label}</p>
      <div className="mt-3">
        <p
          className={`break-words text-2xl font-bold tracking-tight sm:text-[28px] lg:text-[32px] ${
            placeholder
              ? "text-slate-300"
              : emphasis
                ? "text-blue-900"
                : "text-slate-900"
          }`}
        >
          {value}
        </p>
        {hint ? (
          <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}
