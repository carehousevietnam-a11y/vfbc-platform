import { formatCostAmount, type CostCheckService } from "@/lib/costCheck";

type CostBasisCardProps = {
  service: CostCheckService;
  quotedAmount?: number;
};

export function CostBasisCard({ service, quotedAmount }: CostBasisCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">비용 기준</p>
      <div
        className={`mt-3 space-y-2 text-sm ${quotedAmount != null ? "border-b border-slate-100 pb-4" : ""}`}
      >
        <div className="flex items-start justify-between gap-4">
          <span className="shrink-0 text-slate-600">정부 공식 수수료</span>
          <span className="text-right font-medium text-slate-900">{service.governmentFee}</span>
        </div>
        <p className="text-right text-[11px] leading-snug text-slate-400">출처: {service.source}</p>
        <div className="flex items-start justify-between gap-4">
          <span className="shrink-0 text-slate-600">일반 시장 범위</span>
          <span className="text-right font-medium text-slate-900">
            {formatCostAmount(service.marketMin, service.currency)} ~{" "}
            {formatCostAmount(service.marketMax, service.currency)}
          </span>
        </div>
      </div>
      {quotedAmount != null ? (
        <>
          <p className="mt-4 text-xs text-slate-500">입력하신 견적</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatCostAmount(quotedAmount, service.currency)}
          </p>
        </>
      ) : null}
    </div>
  );
}
