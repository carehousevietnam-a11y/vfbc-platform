#!/usr/bin/env python3
"""Run the 8-query Linda review set against a Legal RAG /review endpoint.

Usage (on VPS or any host with network access to Legal RAG):

    export LEGAL_RAG_URL=http://127.0.0.1:8080
    export LEGAL_RAG_INTERNAL_TOKEN='...'
    python3 scripts/retest-8-queries-vps.py

Outputs JSON lines with full answer text (review.summary + customer ai_summary),
metadata, and vague-phrase audit flags.
"""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request

VAGUE_PHRASES = (
    "관련 법령에 따르면",
    "해당 법령에 의하면",
    "법적으로는",
    "일부 규정에서는",
)

QUERIES = [
    {
        "id": 1,
        "question": "노동허가 경력 요건이 어떻게 되나요?",
        "service_type": "wp",
        "service_group": "check",
    },
    {
        "id": 2,
        "question": "외국인 노동허가 신청 서류가 뭐예요?",
        "service_type": "wp",
        "service_group": "check",
    },
    {
        "id": 3,
        "question": "거주증 갱신 기간이 언제까지인가요?",
        "service_type": "trc",
        "service_group": "check",
    },
    {
        "id": 4,
        "question": "TRC 발급 조건 알려주세요",
        "service_type": "trc",
        "service_group": "check",
    },
    {
        "id": 5,
        "question": "임시거주등록 기한 연장 가능한가요?",
        "service_type": "tamtru",
        "service_group": "check",
    },
    {
        "id": 6,
        "question": "부동산 사기 계약인지 어떻게 알 수 있나요?",
        "service_type": "verify_fraud",
        "service_group": "verify",
    },
    {
        "id": 7,
        "question": "임대 계약 분쟁 관련 법령이 뭐예요?",
        "service_type": "verify_real-estate",
        "service_group": "verify",
    },
    {
        "id": 8,
        "question": "베트남 날씨는 어떤가요?",
        "service_type": "wp",
        "service_group": "check",
    },
]


def _post_review(base_url: str, token: str, query: dict) -> tuple[float, dict]:
    payload = {
        "question": query["question"],
        "language": "ko",
        "audience": "all",
        "context": {
            "lead_id": f"retest-{query['id']:02d}",
            "service_type": query["service_type"],
            "service_group": query["service_group"],
        },
    }
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        f"{base_url.rstrip('/')}/review",
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "X-VFBCAI-Internal-Token": token,
        },
    )
    started = time.perf_counter()
    with urllib.request.urlopen(request, timeout=600) as response:
        raw = response.read().decode("utf-8")
    elapsed = time.perf_counter() - started
    return elapsed, json.loads(raw)


def _audit_text(text: str | None) -> dict:
    if not text:
        return {"has_text": False, "vague_phrases_found": [], "has_article_marker": False}
    vague = [phrase for phrase in VAGUE_PHRASES if phrase in text]
    has_marker = any(
        marker in text
        for marker in ("Điều", "NĐ-CP", "Luật", "Thông tư", "Nghị định", "Khoản", "/20")
    )
    return {
        "has_text": True,
        "vague_phrases_found": vague,
        "has_article_marker": has_marker,
    }


def main() -> int:
    base_url = os.environ.get("LEGAL_RAG_URL", "http://127.0.0.1:8080").strip()
    token = os.environ.get("LEGAL_RAG_INTERNAL_TOKEN", "").strip()
    if not token:
        print("error: LEGAL_RAG_INTERNAL_TOKEN is required", file=sys.stderr)
        return 1

    results: list[dict] = []
    for query in QUERIES:
        try:
            elapsed, payload = _post_review(base_url, token, query)
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            results.append(
                {
                    "id": query["id"],
                    "question": query["question"],
                    "error": f"HTTP {exc.code}: {detail}",
                }
            )
            continue
        except Exception as exc:  # noqa: BLE001 - CLI script
            results.append(
                {
                    "id": query["id"],
                    "question": query["question"],
                    "error": str(exc),
                }
            )
            continue

        review = payload.get("review") or {}
        customer = (payload.get("customer") or {}).get("review") or {}
        metadata = payload.get("metadata") or {}
        summary = review.get("summary")
        ai_summary = customer.get("ai_summary")
        audit = _audit_text(summary or ai_summary)

        results.append(
            {
                "id": query["id"],
                "question": query["question"],
                "service_type": query["service_type"],
                "service_group": query["service_group"],
                "elapsed_seconds": round(elapsed, 3),
                "status": review.get("status"),
                "answer_tier": metadata.get("answer_tier"),
                "top_score": metadata.get("top_score"),
                "search_stage": metadata.get("search_stage"),
                "review_summary_full": summary,
                "customer_ai_summary_full": ai_summary,
                "legal_basis": customer.get("legal_basis") or review.get("legal_basis"),
                "audit": audit,
            }
        )

    print(json.dumps({"base_url": base_url, "results": results}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
