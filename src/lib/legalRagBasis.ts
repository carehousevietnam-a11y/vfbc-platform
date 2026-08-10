import { reviewLegalCase } from "@/lib/legal-rag-client";
import type { InferredLegalRagContext } from "@/lib/aiGateway";

const ANONYMOUS_LEGAL_BASIS_TIMEOUT_MS = 5_000;

const STATIC_LEGAL_REFS: Partial<Record<string, string>> = {
  trc: "04/2016/TT-BNG, 47/2014/QH13",
  wp: "152/2020/NĐ-CP, 11/2020/TT-BLĐTBXH",
  tamtru: "04/2016/TT-BNG, 47/2014/QH13",
  "driving-license": "04/2016/TT-BNG, 47/2014/QH13",
};

const GRADE_C_LINE =
  "관련 법령 데이터에서 확인되지 않았습니다. 아래 안내는 일반적으로 알려진 참고 정보이며, 실제 요건은 기관·상황에 따라 달라질 수 있습니다.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractLegalBasisLines(data: unknown): string[] {
  if (!isRecord(data)) return [];

  const customerReview =
    isRecord(data.customer) && isRecord(data.customer.review) ? data.customer.review : null;
  const review = isRecord(data.review) ? data.review : null;

  const basisRaw = customerReview?.legal_basis ?? review?.legal_basis;
  if (!Array.isArray(basisRaw)) return [];

  const lines: string[] = [];
  for (const item of basisRaw) {
    if (!isRecord(item)) continue;
    const formatted =
      typeof item.formatted_line === "string" && item.formatted_line.trim()
        ? item.formatted_line.trim()
        : null;
    if (formatted) {
      lines.push(formatted);
      continue;
    }
    const docNum =
      typeof item.document_number === "string" ? item.document_number.trim() : "";
    if (!docNum) continue;
    const article = typeof item.article === "string" && item.article.trim() ? item.article.trim() : null;
    lines.push(article ? `${docNum} ${article}` : docNum);
  }

  return lines.slice(0, 3);
}

function formatBasisLine(lines: string[], serviceType: string): string {
  if (lines.length === 0) {
    const staticRefs = STATIC_LEGAL_REFS[serviceType];
    if (staticRefs) {
      return `관련 법령: ${staticRefs} (구체 조항은 전문가 확인 필요)`;
    }
    return GRADE_C_LINE;
  }

  const joined = lines.join(", ");
  if (lines.some((line) => /điều|khoản|article|조항/i.test(line))) {
    return `관련 법령: ${joined} (전문가 확인 권장)`;
  }
  return `관련 법령: ${joined} (구체 조항은 전문가 확인 필요)`;
}

/** 익명 하이브리드 — 법령 블록만 짧은 타임아웃으로 조회한다. */
export async function fetchAnonymousLegalBasisLine(
  question: string,
  inferred: InferredLegalRagContext
): Promise<string> {
  const result = await reviewLegalCase(
    {
      question: question.trim(),
      language: "ko",
      audience: "all",
      context: {
        lead_id: "anonymous",
        service_type: inferred.service_type,
        service_group: inferred.service_group,
      },
    },
    { timeoutMs: ANONYMOUS_LEGAL_BASIS_TIMEOUT_MS }
  );

  if (!result.ok) {
    return formatBasisLine([], inferred.service_type);
  }

  const status =
    isRecord(result.data) && isRecord(result.data.review) && typeof result.data.review.status === "string"
      ? result.data.review.status
      : "";

  if (status === "no_evidence" || status === "insufficient_evidence") {
    return GRADE_C_LINE;
  }

  return formatBasisLine(extractLegalBasisLines(result.data), inferred.service_type);
}

export { GRADE_C_LINE };
