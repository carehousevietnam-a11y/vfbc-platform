"use client";

type CostMetricCardProps = {
  label: string;
  value: string;
  hint?: string;
  emphasis?: boolean;
  placeholder?: boolean;
};

function resolveValueClass(value: string, emphasis: boolean, placeholder: boolean): string {
  const long = value.length > 16;
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
  const longValue = value.length > 16;

  return (
    <div
      className={`flex min-w-0 flex-col rounded-xl bg-white px-4 py-4 ring-1 ring-slate-200/70 sm:px-5 sm:py-5 lg:min-w-[200px] ${
        emphasis ? "ring-blue-900/20" : ""
      }`}
    >
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-2.5 min-w-0">
        <p
          className={`break-keep font-bold tabular-nums tracking-tight ${resolveValueClass(value, emphasis, placeholder)} ${
            longValue
              ? "text-lg leading-snug sm:text-xl lg:text-[22px]"
              : "text-xl leading-none sm:text-2xl lg:text-[26px]"
          } ${longValue ? "" : "lg:whitespace-nowrap"}`}
        >
          {value}
        </p>
        {hint ? (
          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-slate-500 sm:text-sm">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
