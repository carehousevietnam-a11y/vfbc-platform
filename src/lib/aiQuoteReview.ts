import {
  evaluateCostQuoteReview,
  formatCostAmount,
  type CostCheckCurrency,
  type CostCheckService,
  type CostCheckServiceId,
  type ReviewVerdict,
} from "@/lib/costCheck";
import {
  hasCostSignal,
  matchCostCheckService,
  QUOTE_COMPARE_SUGGESTION,
} from "@/lib/aiCostSection";

type ChatTurn = { role: string; content: string };

const REVIEW_INTENT_PATTERN = /적정|비싼|비싸|괜찮|합리|또래|시장|비교|맞나|맞을까|합당/;

const PROCEDURE_HINT_PATTERN = /어떻게|방법|절차|신청|가능|무엇|뭐|되나요|하나요|할까요/;

export type QuoteReviewPayload = {
  serviceId: CostCheckServiceId;
  quotedAmount: number;
  verdict: ReviewVerdict;
  title: string;
  summary: string;
  detail: string;
  fairReference: number;
  bubblePercent: number | null;
};

export function isQuoteCompareSuggestion(content: string): boolean {
  return content.includes(QUOTE_COMPARE_SUGGESTION);
}

export function isNumberHeavyQuoteMessage(text: string): boolean {
  const trimmed = text.trim();
  if (!/\d/.test(trimmed)) return false;
  if (trimmed.length > 40 && PROCEDURE_HINT_PATTERN.test(trimmed)) return false;
  if (PROCEDURE_HINT_PATTERN.test(trimmed) && !/^\d/.test(trimmed)) return false;

  const alphaOnly = trimmed.replace(/[\d\s,.$₫usd달러동vnd만원원±+~-]/gi, "");
  return alphaOnly.length <= 20;
}

export function parseQuotedAmount(
  text: string,
  preferCurrency: CostCheckCurrency = "USD"
): number | null {
  const compact = text.replace(/\s/g, "");

  const manMatch = compact.match(/([\d,]+(?:\.\d+)?)만(?:동|vnd)?/i);
  if (manMatch) {
    const value = parseFloat(manMatch[1].replace(/,/g, ""));
    return Number.isFinite(value) && value > 0 ? value * 10_000 : null;
  }

  if (/\$|usd|달러|dollar/i.test(text)) {
    const match = text.match(/([\d,]+(?:\.\d+)?)/);
    if (match) {
      const value = parseFloat(match[1].replace(/,/g, ""));
      return Number.isFinite(value) && value > 0 ? value : null;
    }
  }

  if (/동|vnd|đồng/i.test(text)) {
    const match = text.match(/([\d,]+(?:\.\d+)?)/);
    if (match) {
      const value = parseFloat(match[1].replace(/,/g, ""));
      return Number.isFinite(value) && value > 0 ? value : null;
    }
  }

  const generic = text.match(/([\d,]+(?:\.\d+)?)/);
  if (!generic) return null;
  const amount = parseFloat(generic[1].replace(/,/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) return null;

  if (preferCurrency === "VND" || amount >= 10_000) return amount;
  return amount;
}

function findServiceInHistory(messages: ChatTurn[]): CostCheckService | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const matched = matchCostCheckService(messages[i].content);
    if (matched) return matched;
  }
  return null;
}

function tryInitialQuoteReview(
  query: string
): { service: CostCheckService; amount: number } | null {
  const service = matchCostCheckService(query);
  if (!service) return null;

  const amount = parseQuotedAmount(query, service.currency);
  if (!amount) return null;

  const hasReviewIntent = hasCostSignal(query) || REVIEW_INTENT_PATTERN.test(query);
  if (!hasReviewIntent) return null;

  return { service, amount };
}

function tryFollowUpQuoteReview(
  messages: ChatTurn[],
  query: string
): { service: CostCheckService; amount: number } | null {
  if (messages.length < 2) return null;

  const prior = messages.slice(0, -1);
  const lastAssistant = [...prior].reverse().find((m) => m.role === "assistant");
  if (!lastAssistant || !isQuoteCompareSuggestion(lastAssistant.content)) return null;
  if (!isNumberHeavyQuoteMessage(query)) return null;

  const service = findServiceInHistory(prior);
  if (!service) return null;

  const amount = parseQuotedAmount(query, service.currency);
  if (!amount) return null;

  return { service, amount };
}

export function resolveQuoteReview(
  messages: ChatTurn[],
  query: string
): { reply: string; quoteReview: QuoteReviewPayload } | null {
  const parsed = tryInitialQuoteReview(query) ?? tryFollowUpQuoteReview(messages, query);
  if (!parsed) return null;

  const { service, amount } = parsed;
  const result = evaluateCostQuoteReview(service, amount);

  const reply = [
    `**${service.label}** 견적 ${formatCostAmount(amount, service.currency)}에 대한 적정성 검토 결과입니다.`,
    "",
    `**${result.title}**`,
    "",
    result.summary,
    "",
    result.detail,
  ].join("\n");

  return {
    reply,
    quoteReview: {
      serviceId: service.id,
      quotedAmount: amount,
      verdict: result.verdict,
      title: result.title,
      summary: result.summary,
      detail: result.detail,
      fairReference: result.fairReference,
      bubblePercent: result.bubblePercent,
    },
  };
}
