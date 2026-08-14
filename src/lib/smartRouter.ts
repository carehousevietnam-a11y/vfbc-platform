// V1 Smart Router — Hero 진입 시 항상 /ai로 라우팅 (비용 질문 포함).
// 비용 데이터는 /ai 답변에 병합되며, /cost-check 직접 방문은 별도 유지.

export type SmartRouteDestination = "ai";

export type SmartRouteResult = {
  href: string;
  destination: SmartRouteDestination;
};

export function routeByKeywords(query: string): SmartRouteResult {
  const trimmed = query.trim();
  const params = new URLSearchParams();
  if (trimmed) params.set("q", trimmed);
  const qs = params.toString();

  return {
    href: qs ? `/ai?${qs}` : "/ai",
    destination: "ai",
  };
}
