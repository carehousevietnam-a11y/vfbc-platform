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
const COST_SECTION_MARKER = "**비용 참고 안내**";

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

  return `${reply.trimEnd()}\n\n${buildCostSection(service)}\n\n${QUOTE_COMPARE_SUGGESTION}`;
}
