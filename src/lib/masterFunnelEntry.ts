import { hasCostSignal, matchCostCheckService } from "@/lib/aiCostSection";

export type MasterFunnelContextTab = "lookup" | "review" | "direct";

const VALID_TABS = new Set<MasterFunnelContextTab>(["lookup", "review", "direct"]);

/** 진행 / 절차 / 방법 질문 → 「자세히 보기」 */
export const PROCESS_SIGNAL_KEYWORDS = [
  "진행",
  "절차",
  "방법",
  "어떻게",
  "과정",
  "단계",
  "순서",
  "기간",
  "소요",
  "필요서류",
  "필요 서류",
  "준비",
  "서류",
  "가이드",
  "안내",
];

/** 문서 / 계약 / 사건 검토 → 「검토하기」 */
export const REVIEW_SIGNAL_KEYWORDS = [
  "검토",
  "문서",
  "계약",
  "사건",
  "피해",
  "리뷰",
  "검증",
  "확인해",
  "의심",
  "사기",
  "맞나",
  "적정",
];

export function hasReviewSignal(query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return false;
  return REVIEW_SIGNAL_KEYWORDS.some((kw) => normalized.includes(kw.toLowerCase()));
}

export function hasProcessSignal(query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return false;
  return PROCESS_SIGNAL_KEYWORDS.some((kw) => normalized.includes(kw.toLowerCase()));
}

export function extractAmountFromQuery(q: string): string {
  const match = q.replace(/,/g, "").match(/(\d[\d.]*)/);
  return match ? match[1] : "";
}

/**
 * 비용/견적 → 확인하기(lookup) 또는 검토하기(review, 금액 있으면 review)
 * 진행/절차/방법 → 자세히 보기(direct)
 */
export function resolveMasterFunnelTabFromQuery(
  query: string,
  explicitTab?: MasterFunnelContextTab | null
): MasterFunnelContextTab {
  if (explicitTab && VALID_TABS.has(explicitTab)) {
    return explicitTab;
  }
  const trimmed = query.trim();
  if (!trimmed) return "lookup";
  if (hasProcessSignal(trimmed)) return "direct";
  if (hasCostSignal(trimmed)) {
    if (hasReviewSignal(trimmed) || extractAmountFromQuery(trimmed)) return "review";
    return "lookup";
  }
  if (hasReviewSignal(trimmed)) return "review";
  return "lookup";
}

export function parseExplicitMasterFunnelTab(
  value: string | null
): MasterFunnelContextTab | null {
  if (value && VALID_TABS.has(value as MasterFunnelContextTab)) {
    return value as MasterFunnelContextTab;
  }
  return null;
}

/** 서비스 funnel 2번째 화면 — URL ?tab= · ?q= 해석 */
export function readMasterFunnelEntryParams(search: string): {
  tab: MasterFunnelContextTab;
  query: string;
} {
  const params = new URLSearchParams(search);
  const query = params.get("q")?.trim() ?? "";
  const explicitTab = parseExplicitMasterFunnelTab(params.get("tab"));
  const tab = resolveMasterFunnelTabFromQuery(query, explicitTab);
  return { tab, query };
}

export function buildMasterFunnelServiceHref(
  href: string,
  query: string,
  tab?: MasterFunnelContextTab
): string {
  const params = new URLSearchParams();
  const resolvedTab = tab ?? resolveMasterFunnelTabForService(href, query);
  params.set("tab", resolvedTab);
  if (query.trim()) params.set("q", query.trim());
  const qs = params.toString();
  return qs ? `${href}?${qs}` : href;
}

/** 서비스 route + 질문 의도 → 탭 (VERIFY 기본 review, REGISTER 기본 direct) */
export function resolveMasterFunnelTabForService(
  serviceHref: string,
  query: string,
  explicitTab?: MasterFunnelContextTab | null
): MasterFunnelContextTab {
  if (explicitTab && VALID_TABS.has(explicitTab)) {
    return explicitTab;
  }
  const trimmed = query.trim();
  if (hasProcessSignal(trimmed)) return "direct";
  if (hasCostSignal(trimmed)) {
    if (hasReviewSignal(trimmed) || extractAmountFromQuery(trimmed)) return "review";
    return "lookup";
  }
  if (hasReviewSignal(trimmed)) return "review";
  if (serviceHref.startsWith("/verify/")) return "review";
  if (serviceHref.startsWith("/register/")) return "direct";
  return "lookup";
}

export const MASTER_FUNNEL_ENGINE_HREFS = {
  check: "/check",
  verify: "/verify",
  register: "/register",
} as const;

export type MasterFunnelEngine = keyof typeof MASTER_FUNNEL_ENGINE_HREFS;

function inferEngineFromQuery(query: string): MasterFunnelEngine {
  const trimmed = query.trim();
  if (!trimmed) return "check";
  if (hasReviewSignal(trimmed)) return "verify";
  if (hasProcessSignal(trimmed) && /법인|허가|식당|등록|인허가/.test(trimmed)) return "register";
  return "check";
}

export function getDefaultTabForEngine(engine: MasterFunnelEngine): MasterFunnelContextTab {
  if (engine === "verify") return "review";
  if (engine === "register") return "direct";
  return "lookup";
}

/** 엔진 랜딩 — 서비스 카드 → MasterFunnelLanding 직행 */
export function buildEngineServicePickHref(serviceHref: string, label: string): string {
  return buildMasterFunnelServiceHref(
    serviceHref,
    label,
    resolveMasterFunnelTabForService(serviceHref, label)
  );
}

/** ?q= 로 진입 시 서비스가 판별되면 Master UI로 즉시 이동 */
export function getMasterFunnelRedirectForQuery(
  query: string,
  engine: MasterFunnelEngine
): string | null {
  const trimmed = query.trim();
  if (!trimmed) return null;
  const href = routeHeroToMasterFunnel(trimmed, engine);
  if (href.startsWith(`${MASTER_FUNNEL_ENGINE_HREFS[engine]}?`)) return null;
  return href;
}

/** 홈·엔진 랜딩 질문 → 서비스 Master UI 또는 해당 엔진 서비스 선택 */
export function routeHeroToMasterFunnel(
  query: string,
  engine: MasterFunnelEngine = "check"
): string {
  const trimmed = query.trim();
  if (!trimmed) return MASTER_FUNNEL_ENGINE_HREFS[engine];

  const matched = matchCostCheckService(trimmed);
  if (matched) {
    const tab = resolveMasterFunnelTabForService(matched.ctaHref, trimmed);
    return buildMasterFunnelServiceHref(matched.ctaHref, trimmed, tab);
  }

  const landingEngine = engine === "check" ? inferEngineFromQuery(trimmed) : engine;
  const params = new URLSearchParams({ q: trimmed });
  return `${MASTER_FUNNEL_ENGINE_HREFS[landingEngine]}?${params.toString()}`;
}
