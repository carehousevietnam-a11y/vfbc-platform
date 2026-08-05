"""
VFBCAI Legal Intelligence Platform — AI Review Models (STEP5-3).

OpenAI RAG Connector(`openai_rag_connector.py`)의 출력 타입인 `AIReviewResult`와
관련 상수(상태 코드, 지원 언어, Citation 표현)를 정의하는 순수 데이터 모델
모듈이다. 이 모듈 자체는 OpenAI를 호출하지 않으며, 네트워크/외부 의존성이
전혀 없다.
"""

from __future__ import annotations

from dataclasses import dataclass, field

# ---------------------------------------------------------------------------
# 지원 언어
# ---------------------------------------------------------------------------

SUPPORTED_LANGUAGES = ("ko", "en", "zh", "vi")

# ---------------------------------------------------------------------------
# 상태 코드
# ---------------------------------------------------------------------------

STATUS_SUCCESS = "success"
STATUS_NO_EVIDENCE = "no_evidence"
STATUS_CONFIGURATION_ERROR = "configuration_error"
STATUS_INVALID_LANGUAGE = "invalid_language"
STATUS_INVALID_RESPONSE = "invalid_response"
STATUS_API_ERROR = "api_error"
STATUS_INSUFFICIENT_EVIDENCE = "insufficient_evidence"

ALL_STATUSES = (
    STATUS_SUCCESS,
    STATUS_NO_EVIDENCE,
    STATUS_CONFIGURATION_ERROR,
    STATUS_INVALID_LANGUAGE,
    STATUS_INVALID_RESPONSE,
    STATUS_API_ERROR,
    STATUS_INSUFFICIENT_EVIDENCE,
)


# ---------------------------------------------------------------------------
# Citation — legal_basis 개별 항목. Connector가 Evidence Pack과 대조해 검증한다.
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class LegalBasisCitation:
    document_number: str          # Evidence Pack에 실제로 존재하는 문서번호만 허용됨(검증됨)
    article: str | None = None    # Evidence Pack에 없는 조항이면 검증 과정에서 None으로 대체됨
    note: str | None = None       # 모델이 제공한 설명(있는 경우, 검증 대상 아님)

    def to_dict(self) -> dict:
        return {"document_number": self.document_number, "article": self.article, "note": self.note}


# ---------------------------------------------------------------------------
# AIReviewResult — Connector의 최종 산출물
# ---------------------------------------------------------------------------


@dataclass
class AIReviewResult:
    status: str
    language: str | None = None
    summary: str | None = None
    legal_basis: list[LegalBasisCitation] = field(default_factory=list)
    risk_factors: list[str] = field(default_factory=list)
    required_documents: list[str] = field(default_factory=list)
    expert_review_required: bool = True
    expert_review_reason: str | None = None
    source_document_count: int = 0
    source_article_count: int = 0
    model: str | None = None
    raw_text: str | None = None
    error_code: str | None = None

    def to_dict(self) -> dict:
        return {
            "status": self.status,
            "language": self.language,
            "summary": self.summary,
            "legal_basis": [c.to_dict() for c in self.legal_basis],
            "risk_factors": list(self.risk_factors),
            "required_documents": list(self.required_documents),
            "expert_review_required": self.expert_review_required,
            "expert_review_reason": self.expert_review_reason,
            "source_document_count": self.source_document_count,
            "source_article_count": self.source_article_count,
            "model": self.model,
            "raw_text": self.raw_text,
            "error_code": self.error_code,
        }
