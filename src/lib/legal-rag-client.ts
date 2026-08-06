export type LegalRagServiceGroup = "check" | "verify" | "register";
export type LegalRagAudience = "all" | "customer" | "expert";

export type LegalRagContext = {
  lead_id: string;
  service_type: string;
  service_group: LegalRagServiceGroup;
  request_id?: string;
};

export type LegalRagReviewRequest = {
  question: string;
  language: string;
  limit?: number;
  audience?: LegalRagAudience;
  context: LegalRagContext;
};

export type LegalRagCallResult =
  | { ok: true; data: unknown }
  | { ok: false; status: number; error: string };

const DEFAULT_TIMEOUT_MS = 30_000;

export async function reviewLegalCase(
  request: LegalRagReviewRequest,
  options?: { timeoutMs?: number }
): Promise<LegalRagCallResult> {
  const baseUrl = process.env.LEGAL_RAG_URL?.trim();
  const internalToken = process.env.LEGAL_RAG_INTERNAL_TOKEN?.trim();

  if (!baseUrl) {
    console.error("legal-rag-client: LEGAL_RAG_URL is not configured");
    return { ok: false, status: 500, error: "LEGAL_RAG_URL이 설정되지 않았습니다." };
  }

  if (!internalToken) {
    console.error("legal-rag-client: LEGAL_RAG_INTERNAL_TOKEN is not configured");
    return {
      ok: false,
      status: 500,
      error: "LEGAL_RAG_INTERNAL_TOKEN이 설정되지 않았습니다.",
    };
  }

  const controller = new AbortController();
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VFBCAI-Internal-Token": internalToken,
      },
      body: JSON.stringify(request),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("legal-rag-client: review request failed", { status: response.status });
      return {
        ok: false,
        status: response.status,
        error: "Legal RAG 서버가 오류를 반환했습니다.",
      };
    }

    try {
      const data: unknown = await response.json();
      return { ok: true, data };
    } catch {
      console.error("legal-rag-client: invalid JSON response", { status: response.status });
      return {
        ok: false,
        status: 502,
        error: "Legal RAG 서버 응답을 해석할 수 없습니다.",
      };
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("legal-rag-client: review request timed out");
      return {
        ok: false,
        status: 504,
        error: "Legal RAG 서버 응답이 지연되어 요청을 중단했습니다.",
      };
    }

    console.error("legal-rag-client: review request failed");
    return {
      ok: false,
      status: 502,
      error: "Legal RAG 서버 호출 중 오류가 발생했습니다.",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
