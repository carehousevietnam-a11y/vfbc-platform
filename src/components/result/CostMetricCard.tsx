"use client";

type CostMetricCardProps = {
  label: string;
  value: string;
  hint?: string;
  emphasis?: boolean;
  placeholder?: boolean;
};

function resolveValueClass(value: string, emphasis: boolean, placeholder: boolean): string {
  if (placeholder) return "text-slate-300";
  if (emphasis) return "text-blue-900";
  return "text-slate-900";
}

export function CostMetricCard({
  label,
  value,
  hint,
  emphasis = false,
  placeholder = false,
}: CostMetricCardProps) {
  const longValue = value.length > 14;

  return (
    <div
      className={`flex min-w-0 flex-col rounded-xl bg-white px-3.5 py-3.5 ring-1 ring-slate-200/70 sm:px-4 sm:py-4 ${
        emphasis ? "ring-blue-900/20" : ""
      }`}
    >
      <p className="text-[13px] font-medium leading-[1.55] text-slate-500 sm:text-sm">{label}</p>
      <div className="mt-2 min-w-0">
        <p
          className={`break-keep font-bold tabular-nums tracking-tight ${resolveValueClass(value, emphasis, placeholder)} ${
            longValue
              ? "text-2xl leading-snug sm:text-[26px]"
              : "whitespace-nowrap text-2xl leading-none sm:text-[26px] lg:text-[28px]"
          }`}
        >
          {value}
        </p>
        {hint ? (
          <p className="mt-1.5 line-clamp-3 break-keep text-[13px] leading-[1.55] text-slate-500 sm:text-sm">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}
