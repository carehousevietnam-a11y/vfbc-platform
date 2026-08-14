// V1 Smart Router — keyword matching only (no new AI engine).
// Routes cost-related queries to /cost-check; everything else to /ai.

const COST_KEYWORDS = [
  "비용",
  "가격",
  "얼마",
  "견적",
  "금액",
  "수수료",
  "적정",
  "비싸",
  "비쌈",
  "시장가격",
  "시장 가격",
  "공식비용",
  "공식 비용",
  "대행료",
  "거품",
  "저렴",
  "정부수수료",
  "정부 수수료",
  "공시",
  "시세",
];

export type SmartRouteDestination = "cost-check" | "ai";

export type SmartRouteResult = {
  href: string;
  destination: SmartRouteDestination;
};

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function matchesCostKeyword(query: string): boolean {
  const normalized = normalize(query);
  if (!normalized) return false;
  return COST_KEYWORDS.some((kw) => normalized.includes(kw.toLowerCase()));
}

export function routeByKeywords(query: string): SmartRouteResult {
  const trimmed = query.trim();

  if (matchesCostKeyword(trimmed)) {
    const params = new URLSearchParams({ tab: "lookup" });
    if (trimmed) params.set("q", trimmed);
    return {
      href: `/cost-check?${params.toString()}`,
      destination: "cost-check",
    };
  }

  const params = new URLSearchParams();
  if (trimmed) params.set("q", trimmed);
  const qs = params.toString();
  return {
    href: qs ? `/ai?${qs}` : "/ai",
    destination: "ai",
  };
}
