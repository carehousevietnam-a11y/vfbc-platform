"""
Relation document SoT builder — STEP1 Schema V2.

relatedDocuments[] is the single source of truth; supersedes/supersededBy/
amends/amendedBy are derived read-only fields.
"""

from __future__ import annotations

from collections import defaultdict

from .schema import RelationType, RelationshipEdge

INVERSE_RELATION: dict[str, str] = {
    RelationType.IMPLEMENTS.value: RelationType.IMPLEMENTED_BY.value,
    RelationType.AMENDS.value: RelationType.AMENDED_BY.value,
    RelationType.SUPERSEDES.value: RelationType.SUPERSEDED_BY.value,
    RelationType.REPEALS.value: RelationType.REPEALED_BY.value,
    RelationType.REFERENCES.value: RelationType.REFERENCED_BY.value,
}

FORWARD_RELATION: dict[str, str] = {v: k for k, v in INVERSE_RELATION.items()}

# Legacy raw-edge types that map to V2 forward types before inverse expansion
LEGACY_EDGE_TO_V2: dict[str, str] = {
    "replaces": RelationType.SUPERSEDES.value,
}


def normalize_edge_relation_type(relation_type: str) -> str:
    return LEGACY_EDGE_TO_V2.get(relation_type, relation_type)


def _entry(document_id: str, relation_type: str) -> dict:
    return {"documentId": document_id, "relationType": relation_type}


def _add_entry(store: dict[str, list[dict]], doc_id: str, entry: dict) -> None:
    entries = store[doc_id]
    key = (entry["documentId"], entry["relationType"])
    if not any((e["documentId"], e["relationType"]) == key for e in entries):
        entries.append(entry)


def build_related_documents_from_edges(
    edges: list[RelationshipEdge],
) -> dict[str, list[dict]]:
    """
    Build per-document relatedDocuments[] including inverse edges.
    Raw RelationshipEdge direction is preserved as the forward entry; inverse is added on target doc.
    """
    by_doc: dict[str, list[dict]] = defaultdict(list)

    for edge in edges:
        forward_type = normalize_edge_relation_type(edge.relationType)
        inverse_type = INVERSE_RELATION.get(forward_type)
        if inverse_type is None:
            # related_to, unknown, or already-inverse types from raw — store as-is on source only
            _add_entry(by_doc, edge.sourceDocumentId, _entry(edge.targetDocumentId, forward_type))
            continue
        _add_entry(by_doc, edge.sourceDocumentId, _entry(edge.targetDocumentId, forward_type))
        _add_entry(by_doc, edge.targetDocumentId, _entry(edge.sourceDocumentId, inverse_type))

    return dict(by_doc)


def derive_relation_arrays(related_documents: list[dict]) -> dict[str, list[str]]:
    """Derive supersedes/supersededBy/amends/amendedBy from relatedDocuments (deterministic)."""
    result: dict[str, list[str]] = {
        "supersedes": [],
        "supersededBy": [],
        "amends": [],
        "amendedBy": [],
    }
    mapping = {
        RelationType.SUPERSEDES.value: "supersedes",
        RelationType.SUPERSEDED_BY.value: "supersededBy",
        RelationType.AMENDS.value: "amends",
        RelationType.AMENDED_BY.value: "amendedBy",
    }
    for rel in related_documents:
        field = mapping.get(rel.get("relationType", ""))
        if field:
            doc_id = rel.get("documentId")
            if doc_id and doc_id not in result[field]:
                result[field].append(doc_id)
    for key in result:
        result[key].sort()
    return result


def attach_relations_to_documents(
    documents: list[dict],
    edges: list[RelationshipEdge],
) -> None:
    """Mutate document dicts in place: relatedDocuments (SoT) + derived arrays."""
    related_by_doc = build_related_documents_from_edges(edges)
    for doc in documents:
        doc_id = doc["documentId"]
        related = related_by_doc.get(doc_id, [])
        related.sort(key=lambda r: (r["relationType"], r["documentId"]))
        doc["relatedDocuments"] = related
        derived = derive_relation_arrays(related)
        doc["supersedes"] = derived["supersedes"]
        doc["supersededBy"] = derived["supersededBy"]
        doc["amends"] = derived["amends"]
        doc["amendedBy"] = derived["amendedBy"]
