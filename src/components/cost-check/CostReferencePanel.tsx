import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  COST_CHECK_MARKET_NOTE,
  formatCostAmount,
  getCostCheckService,
  type CostCheckServiceId,
} from "@/lib/costCheck";
import { QUOTE_COMPARE_SUGGESTION } from "@/lib/aiCostSection";
import { getQuoteNextLinks } from "@/lib/quoteReviewLinks";
import { CostBasisCard } from "@/components/cost-check/CostBasisCard";

type CostReferencePanelProps = {
  serviceId: CostCheckServiceId;
  onCompareYes: () => void;
};

export function CostReferencePanel({ serviceId, onCompareYes }: CostReferencePanelProps) {
  const service = getCostCheckService(serviceId);
  const nextLinks = getQuoteNextLinks(serviceId);

  return (
    <div className="space-y-5">
      <CostBasisCard service={service} />

      <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-600">
        <p>
          시장 통상 대행료 (참고):{" "}
          <span className="font-medium text-slate-900">
            {formatCostAmount(service.marketUsualFeeAmount, service.currency)} 전후
          </span>
        </p>
        <p className="mt-2 leading-relaxed">{service.lookupGuide}</p>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">{COST_CHECK_MARKET_NOTE}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-800">{QUOTE_COMPARE_SUGGESTION}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCompareYes}
            className="rounded-lg border border-blue-900 bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-950"
          >
            네, 비교할게요
          </button>
          <span className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-500">
            괜찮아요
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-500">다음으로 확인해보세요</p>
        {nextLinks.map((link) => (
          <Link
            key={link.href + link.label}
            href={link.href}
            className="flex items-center gap-1.5 text-sm text-blue-900 hover:underline"
          >
            <ArrowRight size={14} className="shrink-0" />
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
