import {
  COST_CHECK_MARKET_NOTE,
  COST_CHECK_SERVICES,
  formatCostAmount,
  getCostCheckService,
  type CostCheckService,
  type CostCheckServiceId,
} from "@/lib/costCheck";

export const COST_SIGNAL_KEYWORDS = [
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

const SERVICE_PATTERNS: { id: CostCheckServiceId; pattern: RegExp }[] = [
  { id: "wp", pattern: /노동허가|work\s*permit|\bwp\b/i },
  { id: "trc", pattern: /거주증|\btrc\b/i },
  { id: "tamtru", pattern: /땀주|임시거주|tam\s*tru|tạm trú/i },
  { id: "company", pattern: /법인|erc|설립|irc|법인설립/i },
  { id: "notary", pattern: /공증|번역|notary/i },
];

export const QUOTE_COMPARE_SUGGESTION = "받으신 견적도 비교해볼까요?";
export const COST_SECTION_MARKER = "**비용 참고 안내**";
const SYSTEM_COST_DENIAL_SNIPPET = "비용 정보를 안내해드리지 않";

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

export function hasCostSignal(query: string): boolean {
  const normalized = normalize(query);
  if (!normalized) return false;
  return COST_SIGNAL_KEYWORDS.some((kw) => normalized.includes(kw.toLowerCase()));
}

export function matchCostCheckService(query: string): CostCheckService | null {
  const text = query.trim();
  if (!text) return null;

  for (const { id, pattern } of SERVICE_PATTERNS) {
    if (pattern.test(text)) {
      return getCostCheckService(id);
    }
  }

  const normalized = normalize(text);
  for (const service of COST_CHECK_SERVICES) {
    const labelHit = normalized.includes(service.label.toLowerCase());
    const shortHit = normalized.includes(service.shortLabel.toLowerCase());
    if (labelHit || shortHit) {
      return service;
    }
  }

  return null;
}

export function buildCostSection(service: CostCheckService): string {
  const marketRange = `${formatCostAmount(service.marketMin, service.currency)} ~ ${formatCostAmount(
    service.marketMax,
    service.currency
  )}`;

  return [
    "---",
    `${COST_SECTION_MARKER} (${service.label})`,
    "",
    `- **정부 수수료**: ${service.governmentFee}`,
    `  - 출처: ${service.source}`,
    `- **시장 일반 범위**: ${marketRange}`,
    `- **시장 통상 대행료 (참고)**: ${formatCostAmount(
      service.marketUsualFeeAmount,
      service.currency
    )} 전후`,
    "",
    service.lookupGuide,
    "",
    COST_CHECK_MARKET_NOTE,
  ].join("\n");
}

export function enrichReplyWithCostData(reply: string, query: string): string {
  if (!hasCostSignal(query)) return reply;
  if (reply.includes(COST_SECTION_MARKER)) return reply;

  const service = matchCostCheckService(query);
  if (!service) return reply;

  const base =
    reply.includes(SYSTEM_COST_DENIAL_SNIPPET)
      ? `**${service.label}** 관련 비용 참고 안내입니다.`
      : reply.trimEnd();

  return `${base}\n\n${buildCostSection(service)}\n\n${QUOTE_COMPARE_SUGGESTION}`;
}

export type ParsedCostReply = {
  introText: string;
  serviceId: CostCheckServiceId | null;
  hasQuoteCompareSuggestion: boolean;
};

function resolveServiceIdFromCostLabel(label: string): CostCheckServiceId | null {
  const normalized = label.trim().toLowerCase();
  for (const service of COST_CHECK_SERVICES) {
    if (
      normalized === service.label.toLowerCase() ||
      normalized.includes(service.label.toLowerCase()) ||
      normalized.includes(service.shortLabel.toLowerCase())
    ) {
      return service.id;
    }
  }
  return matchCostCheckService(label)?.id ?? null;
}

/** 비용 섹션이 붙은 /ai 답변을 본문·서비스·견적비교 여부로 분리한다. */
export function parseCostEnrichedReply(reply: string): ParsedCostReply {
  const markerIndex = reply.indexOf(COST_SECTION_MARKER);
  if (markerIndex < 0) {
    return { introText: reply, serviceId: null, hasQuoteCompareSuggestion: false };
  }

  let introText = reply.slice(0, markerIndex).replace(/\n?---\s*$/, "").trimEnd();
  const costTail = reply.slice(markerIndex);
  const hasQuoteCompareSuggestion = costTail.includes(QUOTE_COMPARE_SUGGESTION);

  const labelMatch = costTail.match(/\*\*비용 참고 안내\*\*\s*\(([^)]+)\)/);
  const serviceId = labelMatch ? resolveServiceIdFromCostLabel(labelMatch[1]) : null;

  return { introText, serviceId, hasQuoteCompareSuggestion };
}

export function shouldSuppressNavigatorActions(reply: string): boolean {
  return reply.includes(COST_SECTION_MARKER) && reply.includes(QUOTE_COMPARE_SUGGESTION);
}
