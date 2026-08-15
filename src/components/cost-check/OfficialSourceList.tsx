import type { OfficialSourceEntry, PriceReliabilityStatus } from "@/lib/costCheck";

const STATUS_LABEL: Record<PriceReliabilityStatus, string> = {
  VERIFIED: "공식 원문 확인",
  OFFICIAL_CURRENT_CHECK_REQUIRED: "공식 가격 확인 · 현재 적용 여부 확인 필요",
  OFFICIAL_SCOPE_CHECK_REQUIRED: "공식자료 확인 · 적용조건 확인 필요",
  MARKET_REFERENCE: "시장 참고가격",
  REFERENCE_ONLY: "참고자료",
  PENDING: "확인 진행 중",
  NOT_FOUND: "확인된 자료 없음",
};

const STATUS_BADGE_CLASS: Record<PriceReliabilityStatus, string> = {
  VERIFIED: "bg-emerald-50 text-emerald-800",
  OFFICIAL_CURRENT_CHECK_REQUIRED: "bg-amber-50 text-amber-900",
  OFFICIAL_SCOPE_CHECK_REQUIRED: "bg-amber-50 text-amber-900",
  MARKET_REFERENCE: "bg-blue-50 text-blue-800",
  REFERENCE_ONLY: "bg-slate-100 text-slate-600",
  PENDING: "bg-slate-100 text-slate-600",
  NOT_FOUND: "bg-slate-100 text-slate-500",
};

const APPLICATION_TYPE_LABEL: Record<OfficialSourceEntry["applicationType"], string> = {
  new: "신규",
  reissue: "재발급",
  renewal: "갱신",
  exemption: "면제확인",
};

function formatVnd(amount: number | null): string {
  if (amount === null) return "금액 미확인";
  return `${amount.toLocaleString("ko-KR")} VND`;
}

export function OfficialSourceList({ sources }: { sources?: OfficialSourceEntry[] }) {
  if (!sources || sources.length === 0) return null;

  const byRegion = sources.reduce<Record<string, OfficialSourceEntry[]>>((acc, entry) => {
    (acc[entry.region] ??= []).push(entry);
    return acc;
  }, {});

  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        지역별 공식 확인 자료
      </p>
      {Object.entries(byRegion).map(([region, entries]) => (
        <div key={region} className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">{region}</p>
          <ul className="mt-2 space-y-2">
            {entries.map((entry, idx) => (
              <li key={`${region}-${entry.applicationType}-${idx}`} className="text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-600">
                    {APPLICATION_TYPE_LABEL[entry.applicationType]}
                  </span>
                  <span className="font-medium text-slate-900">{formatVnd(entry.amount)}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGE_CLASS[entry.status]}`}
                  >
                    {STATUS_LABEL[entry.status]}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    출처: {entry.source} · 확인일 {entry.checkedDate}
                  </span>
                </div>
                {entry.uncertainty ? (
                  <p className="mt-1 text-[11px] leading-relaxed text-amber-800">
                    ⚠ {entry.uncertainty}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="text-[11px] leading-relaxed text-slate-500">
        정확한 현재 적용 금액은 관할 관공서 또는 전문가에게 확인하세요.
      </p>
    </div>
  );
}
