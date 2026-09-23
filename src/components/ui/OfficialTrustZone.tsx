import { cn } from "@/lib/cn";
import type { FunnelEngine } from "@/components/engine/funnelTokens";

export type OfficialTrustSource = {
  vi: string;
  ko: string;
};

const VERIFY_TRUST_SOURCES: OfficialTrustSource[] = [
  { vi: "Bộ Tư pháp", ko: "법무부" },
  { vi: "Quốc hội", ko: "베트남 국회" },
  { vi: "Tòa án nhân dân tối cao", ko: "최고인민법원" },
];

const CHECK_TRUST_SOURCES: OfficialTrustSource[] = [
  { vi: "Bộ Công an", ko: "공안부(출입국)" },
  { vi: "Bộ LĐ-TB&XH", ko: "노동보훈사회부" },
  { vi: "Cổng DVC Quốc gia", ko: "전자정부 포털" },
];

const REGISTER_TRUST_SOURCES: OfficialTrustSource[] = [
  { vi: "Bộ KH&ĐT", ko: "기획투자부" },
  { vi: "Bộ Y tế", ko: "보건부" },
  { vi: "Cổng DVC Quốc gia", ko: "전자정부 포털" },
];

const ENGINE_TRUST_COPY: Record<
  FunnelEngine,
  {
    panelTitle: string;
    panelBodyDefault: string;
    panelBodyStep4: string;
    stripTitle: string;
    stripDiagnosisTitle: string;
    stripDiagnosisBody: string;
    footer: string;
    sources: OfficialTrustSource[];
  }
> = {
  check: {
    panelTitle: "베트남 공식 행정 기준·체크리스트",
    panelBodyDefault: "베트남 공식 행정 기준·체크리스트를 참고하여 확인합니다.",
    panelBodyStep4: "입력하신 조건을 베트남 공식 행정 기준에 따라 확인합니다.",
    stripTitle: "베트남 공식 행정 기준·체크리스트",
    stripDiagnosisTitle: "베트남 공식 행정 기준·체크리스트",
    stripDiagnosisBody: "베트남 공식 행정 기준·체크리스트를 참고하여 확인합니다.",
    footer: "출처는 확인 시점의 공식 자료를 기준으로 합니다.",
    sources: CHECK_TRUST_SOURCES,
  },
  verify: {
    panelTitle: "공식 법령·법률자료 기준 확인",
    panelBodyDefault: "베트남 공식 법령·법률자료를 검토 기준으로 참고합니다.",
    panelBodyStep4: "입력하신 상황을 베트남 법률 기준에 따라 분석합니다.",
    stripTitle: "공식 법령·법률자료 기준 확인",
    stripDiagnosisTitle: "공식 법령·법률자료 기준 확인",
    stripDiagnosisBody: "베트남 공식 법령·법률자료를 검토 기준으로 참고합니다.",
    footer: "출처는 검토 시점의 공식 자료를 기준으로 합니다.",
    sources: VERIFY_TRUST_SOURCES,
  },
  register: {
    panelTitle: "인허가 절차·요건 확인",
    panelBodyDefault: "베트남 공식 인허가 절차·요건을 참고하여 확인합니다.",
    panelBodyStep4: "입력하신 조건을 베트남 인허가 절차·요건에 따라 확인합니다.",
    stripTitle: "인허가 절차·요건 확인",
    stripDiagnosisTitle: "인허가 절차·요건 확인",
    stripDiagnosisBody: "베트남 공식 인허가 절차·요건을 참고하여 확인합니다.",
    footer: "출처는 확인 시점의 공식 자료를 기준으로 합니다.",
    sources: REGISTER_TRUST_SOURCES,
  },
};

interface OfficialTrustZoneProps {
  engine?: FunnelEngine;
  variant?: "panel" | "strip";
  context?: "default" | "step4" | "diagnosis";
  className?: string;
  sources?: OfficialTrustSource[];
  /** VERIFY Stitch SCREEN — PC 패널 / Mobile 약식 칩 행 */
  layout?: "default" | "stitch" | "stitch-mobile";
}

function SourceItem({
  source,
  layout = "default",
}: {
  source: OfficialTrustSource;
  layout?: "default" | "stitch";
}) {
  if (layout === "stitch") {
    return (
      <li className="flex items-center text-[12px] font-semibold text-slate-800">
        <span className="mr-2 inline-block h-1 w-1 shrink-0 rounded-full bg-slate-400" aria-hidden />
        {source.vi}
        <span className="ml-1.5 text-[11px] font-normal text-slate-500">{source.ko}</span>
      </li>
    );
  }

  return (
    <li className="flex gap-2">
      <span className="mt-[0.4rem] h-1 w-1 shrink-0 rounded-full bg-[#2563EB]" aria-hidden />
      <div className="min-w-0">
        <p className="text-[11.5px] font-medium text-[#0B2A6B]">{source.vi}</p>
        <p className="text-[10.5px] text-[#64748B]">{source.ko}</p>
      </div>
    </li>
  );
}

/**
 * CHECK / VERIFY / REGISTER 공식 기준 신뢰 패널 — 공식 출처 참고 안내(제휴·인증 표현 없음).
 */
export default function OfficialTrustZone({
  engine = "verify",
  variant = "panel",
  context = "default",
  className,
  sources,
  layout = "default",
}: OfficialTrustZoneProps) {
  const copy = ENGINE_TRUST_COPY[engine];
  const panelSources = sources ?? copy.sources;
  const isStitchLayout = layout === "stitch";
  const isStitchMobileLayout = layout === "stitch-mobile";
  const stripSources = sources ?? copy.sources.slice(0, 3);

  if (isStitchMobileLayout && variant === "panel") {
    const stitchMobileLabels = ["Bộ Tư pháp", "Quốc hội", "Tòa án"];
    const mobileSources = panelSources.map((source, index) => ({
      ...source,
      vi: stitchMobileLabels[index] ?? source.vi,
    }));

    return (
      <div className={cn("mt-4 border-t border-slate-100 pt-3.5", className)} aria-label="공식 기준 안내">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
            OFFICIAL SOURCES
          </span>
          <span className="shrink-0 text-[10px] text-slate-400">최신 공식 법률 기준</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] text-slate-600">
          {mobileSources.map((source, index) => (
            <span key={source.vi} className="inline-flex items-center gap-1">
              {index > 0 ? <span className="text-slate-300" aria-hidden>·</span> : null}
              <span
                className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-700"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden />
                {source.vi}
              </span>
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "strip") {
    if (context === "diagnosis") {
      return (
        <div
          className={cn(
            "rounded-lg border border-gray-200 bg-white px-3.5 py-3",
            className,
          )}
          aria-label="공식 기준 안내"
        >
          <p className="break-keep text-[11.5px] font-semibold text-[#0B2A6B]">
            {copy.stripDiagnosisTitle}
          </p>
          <p className="mt-1 break-keep text-[10.5px] leading-[1.5] text-[#64748B] [overflow-wrap:normal]">
            {copy.stripDiagnosisBody}
          </p>
          <ul className="mt-2 flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-x-3 sm:gap-y-1.5">
            {stripSources.map((source) => (
              <li
                key={source.vi}
                className="flex min-w-0 items-baseline gap-1 break-keep text-[10.5px] leading-[1.5] text-[#64748B]"
              >
                <span className="h-1 w-1 shrink-0 rounded-full bg-[#2563EB]" aria-hidden />
                <span className="whitespace-nowrap font-medium text-[#0B2A6B]">{source.vi}</span>
                <span className="text-[#94A3B8]">·</span>
                <span className="whitespace-nowrap">{source.ko}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 break-keep text-[10px] leading-[1.5] text-[#94A3B8] [overflow-wrap:normal]">
            {copy.footer}
          </p>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "flex flex-col gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1",
          className,
        )}
        aria-label="공식 기준 안내"
      >
        <span className="break-keep text-[11px] font-medium text-[#556070]">{copy.stripTitle}</span>
        <span className="hidden h-3 w-px shrink-0 bg-[#E2E8F0] sm:block" aria-hidden />
        <div className="flex flex-wrap gap-x-2.5 gap-y-1">
          {stripSources.map((source) => (
            <span
              key={source.vi}
              className="inline-flex items-center gap-1 break-keep text-[10.5px] text-[#64748B]"
            >
              <span className="h-1 w-1 shrink-0 rounded-full bg-[#2563EB]" aria-hidden />
              {source.ko}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const bodyText = context === "step4" ? copy.panelBodyStep4 : copy.panelBodyDefault;

  return (
    <aside
      className={cn(
        isStitchLayout
          ? "rounded-xl border border-[#eef2f6] bg-[#fbfcfd] p-4 shadow-sm"
          : "rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-3.5",
        className,
      )}
      aria-label="공식 기준 안내"
    >
      <p
        className={cn(
          "font-bold uppercase tracking-widest text-slate-400",
          isStitchLayout ? "text-[10px]" : "text-[10px] font-semibold text-[#94A3B8]",
        )}
      >
        OFFICIAL SOURCES
      </p>
      <p
        className={cn(
          "break-keep font-bold leading-snug text-[#0f172a]",
          isStitchLayout ? "mt-1 text-[13px]" : "mt-1.5 text-[12.5px] font-semibold text-[#0B2A6B]",
        )}
      >
        {copy.panelTitle}
      </p>
      <p
        className={cn(
          "break-keep leading-normal [overflow-wrap:normal]",
          isStitchLayout
            ? "mt-1 text-[11.5px] text-slate-500"
            : "mt-1 text-[11.5px] leading-[1.55] text-[#556070]",
        )}
      >
        {bodyText}
      </p>

      <ul className={cn(isStitchLayout ? "mb-3.5 mt-3.5 space-y-2" : "mt-3 space-y-2")}>
        {panelSources.map((source) => (
          <SourceItem key={source.vi} source={source} layout={isStitchLayout ? "stitch" : "default"} />
        ))}
      </ul>

      <p
        className={cn(
          "break-keep leading-tight [overflow-wrap:normal]",
          isStitchLayout
            ? "border-t border-slate-100/80 pt-2.5 text-[10.5px] text-slate-400"
            : "mt-3 text-[10.5px] leading-[1.55] text-[#94A3B8]",
        )}
      >
        {copy.footer}
      </p>
    </aside>
  );
}
