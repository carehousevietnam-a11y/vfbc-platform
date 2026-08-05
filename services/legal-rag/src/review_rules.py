"""VFBCAI Legal Intelligence Platform — AI Review Rules (STEP6).

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
    STATUS_SUCCESS,
    AIReviewResult,
)

REVIEW_SCHEMA_VERSION = "step6"


def apply_review_rules(result: AIReviewResult) -> AIReviewResult:
    """Connector 결과에 STEP6 서비스 안전 규칙을 적용한 새 객체를 반환한다.

    원본 ``AIReviewResult``는 수정하지 않는다.

    규칙:
    - 알 수 없는 상태 코드는 configuration_error로 안전하게 매핑한다.
    - success인데 검증된 법적 근거가 하나도 없으면 insufficient_evidence로
      강등하고 전문가 검토를 요구한다.
    - success가 아닌 모든 결과는 전문가 검토가 필요하다.
    """
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

    if result.status == STATUS_SUCCESS and not result.legal_basis:
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

    if result.status != STATUS_SUCCESS and not result.expert_review_required:
        return replace(result, expert_review_required=True)

    return replace(result)
