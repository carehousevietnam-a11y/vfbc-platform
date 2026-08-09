"""VFBCAI Legal Intelligence Platform — AI Review Engine (STEP6).

기존 STEP5 구성요소를 연결하는 서비스 오케스트레이션 계층이다.

EvidencePack -> PromptPackage -> OpenAI Connector -> AIReviewResult
             -> Review Rules -> ReviewResult

검색, 랭킹, Evidence 생성, Prompt 내용, Citation 검증은 각각의 기존 모듈이
담당하며 이 엔진은 그 로직을 복제하거나 변경하지 않는다.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable

from .ai_review_models import (
    STATUS_CONFIGURATION_ERROR,
    STATUS_NO_EVIDENCE,
    AIReviewResult,
    LegalBasisCitation,
)
from .answer_policy import build_expert_referral_summary
from .answer_tier import ANSWER_TIER_EXPERT_REFERRAL
from .evidence_builder import EvidencePack
from .openai_rag_connector import call_openai_rag
from .prompt_builder import DEFAULT_MAX_TOKENS, PromptPackage, build_prompt
from .review_rules import REVIEW_SCHEMA_VERSION, apply_review_rules

PromptBuilder = Callable[..., PromptPackage]
Connector = Callable[..., AIReviewResult]


@dataclass
class ReviewResult:
    """STEP6 최종 서비스 결과.

    ``AIReviewResult``의 법률 검토 내용과 Prompt/Evidence 처리 메타데이터를
    하나의 안정적인 출력 계약으로 묶는다.
    """

    status: str
    language: str | None
    question: str
    summary: str | None = None
    legal_basis: list[LegalBasisCitation] = field(default_factory=list)
    risk_factors: list[str] = field(default_factory=list)
    required_documents: list[str] = field(default_factory=list)
    expert_review_required: bool = True
    expert_review_reason: str | None = None
    source_document_count: int = 0
    source_article_count: int = 0
    model: str | None = None
    error_code: str | None = None
    schema_version: str = REVIEW_SCHEMA_VERSION
    prompt_metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        """순수 Python dict로 변환한다. JSON 직렬화는 review_formatter가 담당한다."""
        return {
            "schema_version": self.schema_version,
            "status": self.status,
            "language": self.language,
            "question": self.question,
            "summary": self.summary,
            "legal_basis": [item.to_dict() for item in self.legal_basis],
            "risk_factors": list(self.risk_factors),
            "required_documents": list(self.required_documents),
            "expert_review_required": self.expert_review_required,
            "expert_review_reason": self.expert_review_reason,
            "sources": {
                "document_count": self.source_document_count,
                "article_count": self.source_article_count,
            },
            "model": self.model,
            "error_code": self.error_code,
            "prompt_metadata": dict(self.prompt_metadata),
        }


class AIReviewEngine:
    """Prompt Builder와 Connector를 의존성 주입 방식으로 연결한다."""

    def __init__(
        self,
        prompt_builder: PromptBuilder = build_prompt,
        connector: Connector = call_openai_rag,
    ) -> None:
        self._prompt_builder = prompt_builder
        self._connector = connector

    def review(
        self,
        evidence_packs: list[EvidencePack],
        user_question: str,
        language: str | None = None,
        max_tokens: int = DEFAULT_MAX_TOKENS,
        api_key: str | None = None,
        model: str | None = None,
        client: Any | None = None,
        *,
        answer_tier: str = "direct",
        service_group: str | None = None,
    ) -> ReviewResult:
        """Evidence와 질문을 최종 ``ReviewResult``로 변환한다."""
        question = user_question if isinstance(user_question, str) else ""

        if not question.strip():
            ai_result = AIReviewResult(
                status=STATUS_CONFIGURATION_ERROR,
                language=language,
                expert_review_required=True,
                expert_review_reason="사용자 질문이 비어 있어 AI 검토를 수행할 수 없습니다.",
                source_document_count=0,
                source_article_count=0,
                model=model,
                error_code="empty_question",
            )
            return _to_review_result(ai_result, question, {"answer_tier": answer_tier})

        if answer_tier == ANSWER_TIER_EXPERT_REFERRAL and not evidence_packs:
            summary = build_expert_referral_summary(question, language=language)
            ai_result = AIReviewResult(
                status=STATUS_NO_EVIDENCE,
                language=language,
                summary=summary,
                expert_review_required=True,
                expert_review_reason="검색된 관련 법령 근거(Evidence)가 없어 전문가 연결 안내를 제공합니다.",
                source_document_count=0,
                source_article_count=0,
                model=model,
                error_code=STATUS_NO_EVIDENCE,
            )
            return _to_review_result(
                ai_result,
                question,
                {"answer_tier": answer_tier, "service_group": service_group},
            )

        prompt_package = self._prompt_builder(
            evidence_packs,
            user_question=question,
            language=language,
            max_tokens=max_tokens,
            answer_tier=answer_tier,
            service_group=service_group,
        )
        ai_result = self._connector(
            prompt_package,
            evidence_packs=evidence_packs,
            api_key=api_key,
            model=model,
            client=client,
        )
        ruled_result = apply_review_rules(
            ai_result,
            evidence_packs=evidence_packs,
            question=question,
            service_group=service_group,
        )
        metadata = dict(prompt_package.metadata)
        metadata["answer_tier"] = answer_tier
        if service_group:
            metadata["service_group"] = service_group
        return _to_review_result(ruled_result, question, metadata)


def _to_review_result(
    result: AIReviewResult,
    question: str,
    prompt_metadata: dict[str, Any],
) -> ReviewResult:
    return ReviewResult(
        status=result.status,
        language=result.language,
        question=question,
        summary=result.summary,
        legal_basis=list(result.legal_basis),
        risk_factors=list(result.risk_factors),
        required_documents=list(result.required_documents),
        expert_review_required=result.expert_review_required,
        expert_review_reason=result.expert_review_reason,
        source_document_count=result.source_document_count,
        source_article_count=result.source_article_count,
        model=result.model,
        error_code=result.error_code,
        prompt_metadata=dict(prompt_metadata),
    )


def review_legal_question(
    evidence_packs: list[EvidencePack],
    user_question: str,
    language: str | None = None,
    max_tokens: int = DEFAULT_MAX_TOKENS,
    api_key: str | None = None,
    model: str | None = None,
    client: Any | None = None,
) -> ReviewResult:
    """기본 의존성을 사용하는 편의 함수."""
    return AIReviewEngine().review(
        evidence_packs=evidence_packs,
        user_question=user_question,
        language=language,
        max_tokens=max_tokens,
        api_key=api_key,
        model=model,
        client=client,
    )
