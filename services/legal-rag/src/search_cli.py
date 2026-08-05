"""
Legal Search CLI — 실제 실행 가능한 구현.

실행 방법:
    python -m src.search_cli --query "152/2020/NĐ-CP"
    python -m src.search_cli --query "giấy phép lao động" --status active --limit 5
    python -m src.search_cli --article 9 --doc-type nghi_dinh
    python -m src.search_cli --validate                     # 합성 데이터로 자체 검증, 리포트 생성

    # 다국어 검색 (사전 기반 정규화, 번역API/LLM 미사용):
    python -m src.search_cli --language ko --query "노동허가"
    python -m src.search_cli --language en --query "work permit"
    python -m src.search_cli --language zh --query "工作许可证"
    python -m src.search_cli --language vi --query "giấy phép lao động"
    python -m src.search_cli --query "노동허가"              # --language 미지정 시 자동 감지
    python -m src.search_cli --query "노동허가" --show-normalization  # 디버그: 감지언어/정규화 결과 출력

⚠️ 기본 데이터 소스는 `data/normalized/*.jsonl`(STEP1-1 파이프라인 산출물)이다.
   해당 파일이 없으면(현재 이 저장소 상태) 빈 인덱스로 "결과 없음"을 보여주거나,
   `--validate`/`--fixture` 옵션으로 내장된 합성 데이터를 사용할 수 있다.
   실제 Hugging Face 데이터를 이 명령이 자동으로 내려받지 않는다.
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path

from .query_normalizer import LegalQueryNormalizer
from .result_localizer import DEFAULT_LANGUAGE, localize_results
from .search_engine import LegalSearchIndex, build_index_from_args
from .search_models import SearchFilters

logger = logging.getLogger("legal_rag.search_cli")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")


def _configure_utf8_console() -> None:
    """[Windows UTF-8 회귀 수정] stdout/stderr가 지원하면 UTF-8로 재설정한다.

    Windows PowerShell 기본 콘솔 코드페이지(cp1252 등)에서 한국어/중국어/베트남어
    출력 시 UnicodeEncodeError가 발생하는 문제를 해결한다. PYTHONUTF8/
    PYTHONIOENCODING 환경변수를 사용자가 직접 설정하지 않아도 동작해야 하므로,
    스트림 자체를 reconfigure한다. stdin은 이 함수에서 건드리지 않는다.
    `reconfigure()`를 지원하지 않는 환경(예: 일부 캡처된 스트림, 오래된 Python)에서는
    조용히 무시하고 기존 동작으로 fallback한다 — 예외를 던지지 않는다.
    """
    for stream_name in ("stdout", "stderr"):
        stream = getattr(sys, stream_name, None)
        if stream is not None and hasattr(stream, "reconfigure"):
            try:
                stream.reconfigure(encoding="utf-8", errors="replace")
            except (AttributeError, ValueError, OSError):
                pass


# ---------------------------------------------------------------------------
# 내장 합성 데이터 (STEP1-1/STEP2 seed.sql과 동일 계열의 예시 — 실제 vbpl.vn
# 데이터 아님). --fixture / --validate에서 사용.
# ---------------------------------------------------------------------------


def build_sample_data() -> tuple[list[dict], list[dict], list[dict]]:
    documents = [
        {
            "document_id": "tmquan:1001",
            "document_number": ["152/2020/NĐ-CP"],
            "document_type": "nghi_dinh",
            "title": "Quy định về giấy phép lao động",
            "issuing_authority": "Chính phủ",
            "issue_date": "2020-12-30",
            "effective_date": "2021-02-15",
            "expiry_date": None,
            "status": "active",
            "official_url": "https://vbpl.vn/van-ban/chi-tiet/x1",
            "content_hash": None,
        },
        {
            "document_id": "th1nhng0:5002",
            "document_number": ["99/2019/TT-BLĐTBXH"],
            "document_type": "thong_tu",
            "title": "Một văn bản khác hoàn toàn",
            "issuing_authority": "Bộ Lao động Thương binh và Xã hội",
            "issue_date": "2019-01-01",
            "effective_date": None,
            "expiry_date": None,
            "status": "fully_expired",
            "official_url": None,
            "content_hash": None,
        },
    ]

    chunks = [
        {
            "chunk_id": "tmquan:1001#dieu1",
            "document_id": "tmquan:1001",
            "chapter_no": "I",
            "article_no": "1",
            "clause_no": None,
            "item_no": None,
            "heading": "Chương I QUY ĐỊNH CHUNG > Điều 1 Phạm vi điều chỉnh",
            "original_text": (
                "Điều 1. Phạm vi điều chỉnh\n"
                "Nghị định này quy định về giấy phép lao động cho người lao động "
                "nước ngoài làm việc tại Việt Nam."
            ),
            "normalized_text": (
                "Điều 1. Phạm vi điều chỉnh\n"
                "Nghị định này quy định về giấy phép lao động cho người lao động "
                "nước ngoài làm việc tại Việt Nam."
            ),
            "search_text": (
                "điều 1. phạm vi điều chỉnh\n"
                "nghị định này quy định về giấy phép lao động cho người lao động "
                "nước ngoài làm việc tại việt nam."
            ),
            "status": "active",
            "official_url": "https://vbpl.vn/van-ban/chi-tiet/x1",
            "content_hash": None,
        },
        {
            "chunk_id": "tmquan:1001#dieu2",
            "document_id": "tmquan:1001",
            "chapter_no": "I",
            "article_no": "2",
            "clause_no": None,
            "item_no": None,
            "heading": "Chương I QUY ĐỊNH CHUNG > Điều 2 Đối tượng áp dụng",
            "original_text": (
                "Điều 2. Đối tượng áp dụng\n"
                "1. Người lao động nước ngoài.\n"
                "2. Người sử dụng lao động."
            ),
            "normalized_text": (
                "Điều 2. Đối tượng áp dụng\n"
                "1. Người lao động nước ngoài.\n"
                "2. Người sử dụng lao động."
            ),
            "search_text": (
                "điều 2. đối tượng áp dụng\n"
                "1. người lao động nước ngoài.\n"
                "2. người sử dụng lao động."
            ),
            "status": "active",
            "official_url": "https://vbpl.vn/van-ban/chi-tiet/x1",
            "content_hash": None,
        },
        {
            "chunk_id": "th1nhng0:5002#dieu1",
            "document_id": "th1nhng0:5002",
            "chapter_no": None,
            "article_no": "1",
            "clause_no": None,
            "item_no": None,
            "heading": "Điều 1 Nội dung khác...",
            "original_text": "Điều 1. Nội dung khác về thuế thu nhập cá nhân.",
            "normalized_text": "Điều 1. Nội dung khác về thuế thu nhập cá nhân.",
            "search_text": "điều 1. nội dung khác về thuế thu nhập cá nhân.",
            "status": "fully_expired",
            "official_url": None,
            "content_hash": None,
        },
    ]

    relations = [
        {
            "source_document_id": "th1nhng0:5002",
            "target_document_id": "tmquan:1001",
            "relation_type": "references",
        },
    ]

    return documents, chunks, relations


def build_sample_index() -> LegalSearchIndex:
    documents, chunks, relations = build_sample_data()
    return LegalSearchIndex.from_dicts(documents, chunks, relations)


# ---------------------------------------------------------------------------
# Validation (STEP3 지시사항: reports/search-validation.md, .json 생성)
# ---------------------------------------------------------------------------


def run_validation() -> dict:
    """Exact/Keyword/Filter/Ranking 각각을 합성 데이터로 실제 실행해 검증."""
    index = build_sample_index()
    checks: list[dict] = []

    def check(name: str, condition: bool, detail: str = "") -> None:
        checks.append({"name": name, "passed": bool(condition), "detail": detail})

    # --- Exact: 법령번호 ---
    r = index.search(query="152/2020/NĐ-CP")
    check(
        "exact.document_number",
        any(x.match_type == "exact_document_number" for x in r),
        f"{len(r)}건 반환",
    )

    # --- Exact: 조문 ---
    r = index.search(query="Điều 2")
    check(
        "exact.article",
        any(x.match_type == "exact_article" and x.article_no == "2" for x in r),
        f"{len(r)}건 반환",
    )

    # --- Exact: 공식 URL ---
    r = index.search(query="https://vbpl.vn/van-ban/chi-tiet/x1")
    check(
        "exact.official_url",
        any(x.match_type == "exact_url" for x in r),
        f"{len(r)}건 반환",
    )

    # --- Exact: Document ID ---
    r = index.search(query="tmquan:1001")
    check(
        "exact.document_id",
        any(x.match_type == "exact_document_id" for x in r),
        f"{len(r)}건 반환",
    )

    # --- Keyword: substring ---
    r = index.search(query="thuế thu nhập")
    check(
        "keyword.substring_or_phrase",
        any(x.match_type in ("keyword_substring", "keyword_phrase") for x in r),
        f"{len(r)}건 반환",
    )

    # --- Keyword: prefix ---
    r = index.search(query="lao")  # "lao động"의 접두어
    check(
        "keyword.prefix",
        any(x.match_type == "keyword_prefix" for x in r),
        f"{len(r)}건 반환",
    )

    # --- Keyword: phrase(다중 키워드) ---
    r = index.search(query="giấy phép lao động")
    check(
        "keyword.multi_keyword_phrase",
        any(x.match_type == "keyword_phrase" for x in r),
        f"{len(r)}건 반환",
    )

    # --- Keyword: 대소문자 무시 ---
    r_lower = index.search(query="điều 1")
    r_upper = index.search(query="ĐIỀU 1")
    check(
        "keyword.case_insensitive",
        len(r_lower) > 0 and len(r_lower) == len(r_upper),
        f"lower={len(r_lower)}건, upper={len(r_upper)}건",
    )

    # --- Filter: status ---
    r = index.search(query="Điều 1", filters=SearchFilters(status="fully_expired"))
    check(
        "filter.status",
        all(x.status == "fully_expired" for x in r) and len(r) > 0,
        f"{len(r)}건 반환, 전부 status=fully_expired",
    )

    # --- Filter: document_type ---
    r = index.search(query="Điều 1", filters=SearchFilters(document_type="nghi_dinh"))
    check(
        "filter.document_type",
        all(x.document_type == "nghi_dinh" for x in r) and len(r) > 0,
        f"{len(r)}건 반환",
    )

    # --- Filter: relation_type ---
    r = index.search(query="Điều 1", filters=SearchFilters(relation_type="references"))
    check(
        "filter.relation_type",
        len(r) > 0 and all(
            x.document_id in ("th1nhng0:5002", "tmquan:1001") for x in r
        ),
        f"{len(r)}건 반환",
    )

    # --- Ranking: Exact가 Keyword보다 항상 위 ---
    r = index.search(query="152/2020/NĐ-CP")  # 법령번호이자 우연히 본문에 등장 안 함
    exact_scores = [x.score for x in r if x.match_type.startswith("exact")]
    keyword_scores = [x.score for x in r if x.match_type.startswith("keyword")]
    check(
        "ranking.exact_before_keyword",
        (not keyword_scores) or (min(exact_scores or [999]) > max(keyword_scores)),
        f"exact_scores={exact_scores}, keyword_scores={keyword_scores}",
    )

    # --- Ranking: 결과가 score 내림차순으로 정렬됨 ---
    r = index.search(query="Điều")
    scores = [x.score for x in r]
    check("ranking.sorted_desc", scores == sorted(scores, reverse=True), f"scores={scores}")

    passed = sum(1 for c in checks if c["passed"])
    return {
        "total_checks": len(checks),
        "passed": passed,
        "failed": len(checks) - passed,
        "checks": checks,
    }


def render_validation_markdown(report: dict) -> str:
    lines = ["# Search Validation Report", ""]
    lines.append(f"- 총 검사: {report['total_checks']}건")
    lines.append(f"- 통과: {report['passed']}건 / 실패: {report['failed']}건")
    lines.append("")
    lines.append("## 검사 항목")
    for c in report["checks"]:
        mark = "✅" if c["passed"] else "🔴"
        lines.append(f"- {mark} `{c['name']}` — {c['detail']}")
    lines.append("")
    lines.append(
        "이 리포트는 실제 vbpl.vn 데이터가 아니라 `build_sample_data()`의 합성 데이터로 "
        "실제 실행하여 생성되었습니다(STEP3 지시사항: 검색은 합성 데이터 기반으로 테스트)."
    )
    return "\n".join(lines)


def write_validation_reports(output_dir: Path) -> dict:
    report = run_validation()
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "search-validation.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (output_dir / "search-validation.md").write_text(
        render_validation_markdown(report), encoding="utf-8"
    )
    return report


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="VFBCAI Legal Intelligence Platform — Legal Search CLI")
    parser.add_argument("--query", type=str, default=None, help="검색어 (법령번호/조문/URL/키워드 자동 판별)")
    parser.add_argument(
        "--language", type=str, default=None, choices=["ko", "en", "zh", "vi"],
        help="검색어 언어 명시(ko/en/zh/vi). 미지정 시 Unicode 기반 자동 감지.",
    )
    parser.add_argument(
        "--show-normalization", action="store_true",
        help="디버깅용: 감지된 언어와 정규화된 검색어를 결과 앞에 추가로 출력(기존 출력 형식은 유지됨)",
    )
    parser.add_argument("--status", type=str, default=None)
    parser.add_argument("--doc-type", dest="doc_type", type=str, default=None)
    parser.add_argument("--issuing-authority", dest="issuing_authority", type=str, default=None)
    parser.add_argument("--article", type=str, default=None, help="article_no로 필터링 (예: --article 9)")
    parser.add_argument("--relation-type", dest="relation_type", type=str, default=None)
    parser.add_argument("--limit", type=int, default=20)
    parser.add_argument("--data-dir", type=str, default="data/normalized")
    parser.add_argument("--fixture", action="store_true", help="내장 합성 데이터로 검색(실 데이터 없이 동작 확인용)")
    parser.add_argument("--validate", action="store_true", help="Exact/Keyword/Filter/Ranking 자체 검증 후 리포트 생성")
    parser.add_argument("--reports-dir", type=str, default="reports")
    parser.add_argument("--json", action="store_true", help="결과를 JSON으로 출력(기본은 표 형태 텍스트)")
    return parser


def _print_results_table(results: list) -> None:
    if not results:
        print("(결과 없음)")
        return
    for r in results:
        loc = ""
        if r.article_no:
            loc = f" Điều {r.article_no}"
            if r.clause_no:
                loc += f" Khoản {r.clause_no}"
            if r.item_no:
                loc += f" Điểm {r.item_no}"
        print(
            f"[{r.score:6.1f}] ({r.match_type}) {r.document_id}{loc} — "
            f"{r.title or r.heading or '(제목 없음)'} [{r.status}]"
        )


def _print_localized_results_table(
    results: list, documents_by_id: dict, language: str | None
) -> None:
    """[STEP4] search_cli.py 기본(비-JSON) 출력을 language로 Localize한다.
    Search Algorithm/Ranking/MatchType/Score에는 전혀 관여하지 않으며,
    document_number/article_number/status(raw)/source_url 같은 불변 필드는
    그대로 노출한다 — 번역 대상은 display_title/document_type/status_label뿐.
    --json 출력은 이 함수를 거치지 않고 기존 SearchResult.to_dict() 그대로다."""
    localized = localize_results(results, language, documents_by_id)
    if not localized:
        print("(결과 없음)")
        return
    for r in localized:
        loc = f" {r.heading_label}" if r.heading_label and r.article_number else ""
        print(
            f"[{r.score:6.1f}] ({r.match_type}) {r.document_id}{loc} — "
            f"{r.display_title} [{r.document_type} / {r.status_label}]"
        )
        if r.document_number:
            print(f"           문서번호(원문 유지): {', '.join(r.document_number)}")
        if r.source_url:
            print(f"           출처(원문 유지): {r.source_url}")


def main(argv: list[str] | None = None) -> int:
    parser = build_arg_parser()
    args = parser.parse_args(argv)

    if args.validate:
        report = write_validation_reports(Path(args.reports_dir))
        logger.info(
            "Validation 완료: %d건 중 %d건 통과, %d건 실패",
            report["total_checks"], report["passed"], report["failed"],
        )
        return 0 if report["failed"] == 0 else 1

    index = build_sample_index() if args.fixture else build_index_from_args(args)

    filters = SearchFilters(
        status=args.status,
        document_type=args.doc_type,
        issuing_authority=args.issuing_authority,
        article_no=args.article,
        relation_type=args.relation_type,
    )

    query = args.query
    if query is None and filters.is_empty():
        parser.error("--query 또는 최소 하나의 필터(--status/--doc-type/--article 등)가 필요합니다")

    if args.show_normalization and query:
        normalization = LegalQueryNormalizer().normalize(query, args.language)
        print(
            f"[normalization] detected_language={normalization.detected_language} "
            f"({normalization.language_source}) canonical_query={normalization.canonical_query!r} "
            f"matched_concept={normalization.matched_concept}"
        )

    results = index.search(query=query, filters=filters, limit=args.limit, language=args.language)

    if args.json:
        print(json.dumps([r.to_dict() for r in results], ensure_ascii=False, indent=2))
    else:
        # [STEP4] 기본 텍스트 출력은 --language(미지정 시 자동 베트남어)로 Localize된다.
        # 검색 자체(위 index.search 호출)는 전혀 바뀌지 않았다.
        _print_localized_results_table(results, index.documents_by_id, args.language)

    return 0


if __name__ == "__main__":
    _configure_utf8_console()
    sys.exit(main())
