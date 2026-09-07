import type { CheckMarketCase } from "@/lib/contentPacks/checkMarketCases";

/**
 * CHECK 견적서 — 시장 일반가격 범위 바로 아래 보조 근거.
 * TRC에 맞춘 크기·색·간격. 카드/박스 없음.
 */
export function CheckMarketCaseRefs({
  cases,
  className = "",
}: {
  cases: readonly CheckMarketCase[];
  className?: string;
}) {
  if (cases.length === 0) return null;

  return (
    <div className={className}>
      <p className="text-[9.5px] font-medium leading-snug text-[#B45353]">시장 사례 참고</p>
      <ul className="mt-0.5 space-y-0.5">
        {cases.map((item) => (
          <li key={item.name} className="break-keep text-[9.5px] leading-relaxed text-[#B45353]">
            ·{" "}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#B45353] underline-offset-2 hover:underline"
            >
              {item.name}
            </a>
            {" — "}
            {item.summary}
          </li>
        ))}
      </ul>
    </div>
  );
}
