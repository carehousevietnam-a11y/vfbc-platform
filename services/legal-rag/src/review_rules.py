"""VFBCAI Legal Intelligence Platform — AI Review Rules (STEP6 + DESIGN v3 §4).

AI Review Engine의 서비스 레벨 안전 규칙을 정의한다. 이 모듈은 검색,
랭킹, Evidence, Prompt 또는 OpenAI 응답 내용을 새로 생성하지 않는다.
Connector가 반환한 ``AIReviewResult``를 최종 서비스 결과로 승격하기 전에
상태와 전문가 검토 필요 여부만 일관되게 보정한다.
"""

from __future__ import annotations

from dataclasses import replace

from .ai_review_models import (
    ALL_STATUSES,
    STATUS_CONFIGURATION_ERROR,
    STATUS_INSUFFICIENT_EVIDENCE,
    STATUS_PARTIAL_EVIDENCE,
    STATUS_SUCCESS,
    AIReviewResult,
)
from .answer_policy import (
    build_partial_evidence_summary,
    collect_document_references,
    has_verified_article_citations,
)
from .evidence_builder import EvidencePack

REVIEW_SCHEMA_VERSION = "step6-v3"


def _has_document_level_evidence(evidence_packs: list[EvidencePack]) -> bool:
    return bool(collect_document_references(evidence_packs))


def apply_review_rules(
    result: AIReviewResult,
    *,
    evidence_packs: list[EvidencePack] | None = None,
    question: str | None = None,
    service_group: str | None = None,
) -> AIReviewResult:
    """Connector 결과에 STEP6 + DESIGN v3 등급 규칙을 적용한 새 객체를 반환한다.

    등급:
    - A (success): 검증된 legal_basis에 조항(article)까지 포함
    - B (partial_evidence): 관련 문서는 확인됐으나 조항 미특정
    - C (insufficient_evidence / no_evidence): 문서 수준 매치도 없음
    """
    packs = evidence_packs or []
    has_docs = _has_document_level_evidence(packs)

    if result.status not in ALL_STATUSES:
        return replace(
            result,
            status=STATUS_CONFIGURATION_ERROR,
            expert_review_required=True,
            expert_review_reason=(
                result.expert_review_reason
                or "알 수 없는 AI 검토 상태가 반환되어 전문가 확인이 필요합니다."
            ),
            error_code=result.error_code or "unknown_status",
        )

    if result.status == STATUS_SUCCESS:
        if has_verified_article_citations(result.legal_basis):
            return result

        if has_docs:
            summary = result.summary or build_partial_evidence_summary(
                question or "",
                packs,
                language=result.language,
                service_group=service_group,
            )
            return replace(
                result,
                status=STATUS_PARTIAL_EVIDENCE,
                summary=summary,
                expert_review_required=True,
                expert_review_reason=(
                    result.expert_review_reason
                    or "관련 법령은 확인됐으나 구체 조항은 전문가 확인이 필요합니다."
                ),
                error_code=STATUS_PARTIAL_EVIDENCE,
            )

        return replace(
            result,
            status=STATUS_INSUFFICIENT_EVIDENCE,
            expert_review_required=True,
            expert_review_reason=(
                result.expert_review_reason
                or "검증된 법적 근거가 없어 추가 전문가 검토가 필요합니다."
            ),
            error_code=STATUS_INSUFFICIENT_EVIDENCE,
        )

    if result.status == STATUS_INSUFFICIENT_EVIDENCE and has_docs:
        summary = result.summary or build_partial_evidence_summary(
            question or "",
            packs,
            language=result.language,
            service_group=service_group,
        )
        return replace(
            result,
            status=STATUS_PARTIAL_EVIDENCE,
            summary=summary,
            expert_review_required=True,
            expert_review_reason=(
                result.expert_review_reason
                or "관련 법령은 확인됐으나 인용 검증에 실패하여 전문가 확인이 필요합니다."
            ),
            error_code=STATUS_PARTIAL_EVIDENCE,
        )

    if result.status != STATUS_SUCCESS and not result.expert_review_required:
        return replace(result, expert_review_required=True)

    return replace(result)
