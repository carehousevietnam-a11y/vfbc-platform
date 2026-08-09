"""Case library / SEO publish seed — DESIGN v3 content strategy.

Platform inquiries, AI reports, and graded answers will eventually be
anonymized, paired with hook copy, and published as landing pages for
SEO/AEO/GEO marketing. Quality cases accumulate into a published case library
and (planned) book edition.

This module only prepares publish metadata — it does not write to DB or
expose pages. Wiring to case_knowledge / landing templates is a follow-up.
"""

from __future__ import annotations

import re
import unicodedata


def _normalize_question(question: str) -> str:
    text = unicodedata.normalize("NFC", (question or "").strip())
    text = re.sub(r"\s+", " ", text)
    return text.rstrip("?？!.").strip()


def suggest_case_library_hook(
    question: str,
    *,
    topic: str | None = None,
    service_group: str | None = None,
) -> str:
    """Return a short hook headline for a future case-library landing page."""
    q = _normalize_question(question)
    if len(q) > 36:
        q = q[:33].rstrip() + "…"

    label = (topic or "").strip()
    if not label and service_group:
        label = {
            "check": "체류·허가",
            "verify": "서류·분쟁",
            "register": "사업·인허가",
        }.get(service_group, "베트남 행정·법률")

    if not label:
        label = "베트남 행정·법률"

    if q:
        return f"베트남 {label} | {q} — 지금 확인할 체크리스트"
    return f"베트남 {label} — 실무 체크리스트와 다음 단계"


def build_case_library_publish_seed(
    question: str,
    *,
    topic: str | None = None,
    service_group: str | None = None,
    service_type: str | None = None,
    answer_grade: str | None = None,
) -> dict[str, str | None]:
    """Lightweight metadata blob for a future publish pipeline."""
    normalized = _normalize_question(question)
    return {
        "source_question": normalized or None,
        "hook_headline": suggest_case_library_hook(
            normalized,
            topic=topic,
            service_group=service_group,
        ),
        "topic": topic,
        "service_group": service_group,
        "service_type": service_type,
        "answer_grade": answer_grade,
        "publish_channel": "case_library_landing",
    }
