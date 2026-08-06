"""Production dataset loading without changing the existing search engine."""

from __future__ import annotations

from dataclasses import dataclass

from ..search_engine import LegalSearchIndex
from .config import ProductionSettings


@dataclass(frozen=True)
class LoadedSearchIndex:
    index: LegalSearchIndex
    document_count: int
    chunk_count: int
    relation_count: int


def load_production_index(settings: ProductionSettings) -> LoadedSearchIndex:
    index = LegalSearchIndex.from_pipeline_jsonl(
        settings.documents_path,
        settings.chunks_path,
        settings.relationships_path,
    )
    return LoadedSearchIndex(
        index=index,
        document_count=len(index.documents),
        chunk_count=len(index.chunks),
        relation_count=len(index.relations),
    )
