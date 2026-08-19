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
    <div className="min-w-0 py-1">
      <dt className="text-[13px] text-slate-500">{label}</dt>
      <dd
        className={`mt-1 break-keep text-[1.5rem] font-semibold tabular-nums tracking-tight ${
          placeholder ? "text-slate-300" : emphasis ? "text-blue-900" : "text-slate-900"
        }`}
      >
        {value}
      </dd>
      {hint ? <dd className="mt-1 text-[12px] leading-relaxed text-slate-400">{hint}</dd> : null}
    </div>
  );
}
