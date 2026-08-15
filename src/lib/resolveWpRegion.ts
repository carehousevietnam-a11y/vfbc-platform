/** WP officialSources.region 값과 동일한 키 */
export type WpRegionKey =
  | "Hà Nội"
  | "Quảng Ngãi"
  | "TP. Hồ Chí Minh"
  | "Quảng Ninh"
  | "Đồng Nai";

const REGION_PATTERNS: { region: WpRegionKey; patterns: RegExp[] }[] = [
  {
    region: "Quảng Ngãi",
    patterns: [/quảng\s*ngãi/i, /quang\s*ngai/i, /꽝응아이/, /广义/],
  },
  {
    region: "Quảng Ninh",
    patterns: [/quảng\s*ninh/i, /quang\s*ninh/i, /꽝닌/, /广宁/],
  },
  {
    region: "Đồng Nai",
    patterns: [/đồng\s*nai/i, /dong\s*nai/i, /동나이/, /同奈/],
  },
  {
    region: "TP. Hồ Chí Minh",
    patterns: [
      /tp\.?\s*h(?:ồ|o)\s*chí\s*minh/i,
      /hồ\s*chí\s*minh/i,
      /ho\s*chi\s*minh/i,
      /호치민/,
      /胡志明/,
      /\btp\.?\s*hcm\b/i,
      /\bhcmc\b/i,
      /sài\s*gòn/i,
      /saigon/i,
      /thành\s*phố\s*h(?:ồ|o)\s*chí\s*minh/i,
    ],
  },
  {
    region: "Hà Nội",
    patterns: [/hà\s*nội/i, /ha\s*noi/i, /하노이/, /河内/, /\bhanoi\b/i],
  },
];

/**
 * 자유 텍스트(질문·주소)에서 WP 공식 수수료 지역 키를 추출한다.
 * 매칭 실패 시 null — 임의 지역을 추측하지 않는다.
 */
export function resolveWpRegionFromText(text: string): WpRegionKey | null {
  const normalized = text.trim();
  if (!normalized) return null;

  for (const { region, patterns } of REGION_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(normalized))) {
      return region;
    }
  }
  return null;
}
