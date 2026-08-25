import { cn } from "@/lib/cn";

export type OfficialTrustSource = {
  vi: string;
  ko: string;
};

const VERIFY_TRUST_SOURCES: OfficialTrustSource[] = [
  { vi: "Bộ Tư pháp", ko: "법무부" },
  { vi: "Quốc hội", ko: "베트남 국회" },
  { vi: "Tòa án nhân dân tối cao", ko: "최고인민법원" },
];

const STRIP_SOURCES: OfficialTrustSource[] = VERIFY_TRUST_SOURCES.slice(0, 3);

interface OfficialTrustZoneProps {
  variant?: "panel" | "strip";
  context?: "default" | "step4" | "diagnosis";
  className?: string;
  sources?: OfficialTrustSource[];
}

function SourceItem({ source }: { source: OfficialTrustSource }) {
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
 * VERIFY 공식 기준 신뢰 패널 — 공식 출처 참고 안내(제휴·인증 표현 없음).
 */
export default function OfficialTrustZone({
  variant = "panel",
  context = "default",
  className,
  sources,
}: OfficialTrustZoneProps) {
  const panelSources = sources ?? VERIFY_TRUST_SOURCES;
  const stripSources = sources ?? STRIP_SOURCES;

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
            공식 법령·법률자료 기준 확인
          </p>
          <p className="mt-1 break-keep text-[10.5px] leading-[1.5] text-[#64748B] [overflow-wrap:normal]">
            베트남 공식 법령·법률자료를 검토 기준으로 참고합니다.
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
            검토 시점의 공식 자료를 참고합니다.
          </p>        </div>
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
        <span className="break-keep text-[11px] font-medium text-[#556070]">
          공식 법령·법률자료 기준 확인
        </span>
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

  const bodyText =
    context === "step4"
      ? "입력하신 상황을 베트남 법률 기준에 따라 분석합니다."
      : "베트남 공식 법령·법률자료를 검토 기준으로 참고합니다.";

  return (
    <aside
      className={cn(
        "rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-3.5",
        className,
      )}
      aria-label="공식 기준 안내"
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8]">
        OFFICIAL SOURCES
      </p>
      <p className="mt-1.5 break-keep text-[12.5px] font-semibold text-[#0B2A6B]">공식 법령·법률자료 기준 확인</p>
      <p className="mt-1 break-keep text-[11.5px] leading-[1.55] text-[#556070] [overflow-wrap:normal]">{bodyText}</p>

      <ul className="mt-3 space-y-2">
        {panelSources.map((source) => (
          <SourceItem key={source.vi} source={source} />
        ))}
      </ul>

      <p className="mt-3 break-keep text-[10.5px] leading-[1.55] text-[#94A3B8] [overflow-wrap:normal]">
        출처는 검토 시점의 공식 자료를 기준으로 합니다.
      </p>
    </aside>
  );
}
