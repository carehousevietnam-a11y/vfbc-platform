"""
Document validation — STEP1 Schema V2 hard-fail rules.

Violations are reported; documents are not auto-corrected.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date

from .schema import DocumentStatus, RelationType

CYCLIC_RELATION_TYPES = frozenset({
    RelationType.SUPERSEDES.value,
    RelationType.SUPERSEDED_BY.value,
    RelationType.AMENDS.value,
    RelationType.AMENDED_BY.value,
})

NON_CYCLIC_RELATION_TYPES = frozenset({
    RelationType.REFERENCES.value,
    RelationType.REFERENCED_BY.value,
    RelationType.RELATED_TO.value,
    RelationType.UNKNOWN.value,
})


@dataclass
class ValidationError:
    document_id: str
    rule: str
    message: str


@dataclass
class ValidationReport:
    errors: list[ValidationError] = field(default_factory=list)
    passed_document_ids: list[str] = field(default_factory=list)
    failed_document_ids: list[str] = field(default_factory=list)

    @property
    def hard_fail_count(self) -> int:
        return len(self.failed_document_ids)


def _parse_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return date.fromisoformat(value[:10])
    except ValueError:
        return None


def _build_cyclic_graph(documents: list[dict], all_ids: set[str]) -> dict[str, set[str]]:
    graph: dict[str, set[str]] = {doc_id: set() for doc_id in all_ids}
    for doc in documents:
        source = doc["documentId"]
        for rel in doc.get("relatedDocuments") or []:
            rt = rel.get("relationType", "")
            if rt not in CYCLIC_RELATION_TYPES:
                continue
            target = rel.get("documentId")
            if target and target in all_ids:
                graph.setdefault(source, set()).add(target)
    return graph


def _node_in_cycle(graph: dict[str, set[str]], start: str) -> bool:
    visited: set[str] = set()
    stack: set[str] = set()

    def dfs(node: str) -> bool:
        if node in stack:
            return True
        if node in visited:
            return False
        visited.add(node)
        stack.add(node)
        for neighbor in graph.get(node, ()):
            if dfs(neighbor):
                return True
        stack.remove(node)
        return False

    return dfs(start)


def validate_document(
    doc: dict,
    all_document_ids: set[str],
    cyclic_graph: dict[str, set[str]] | None = None,
    today: date | None = None,
) -> list[ValidationError]:
    today = today or date.today()
    errors: list[ValidationError] = []
    doc_id = doc["documentId"]
    status = doc.get("status", DocumentStatus.UNKNOWN.value)

    # Rule 1
    if doc.get("supersededBy") and status == DocumentStatus.ACTIVE.value:
        errors.append(ValidationError(doc_id, "1", "supersededBy is non-empty but status is active"))

    # Rule 2a
    eff = _parse_date(doc.get("effectiveDate"))
    if eff and eff > today and status == DocumentStatus.ACTIVE.value:
        errors.append(
            ValidationError(doc_id, "2a", "effectiveDate is in the future but status is active (expected not_yet_effective)")
        )

    # Rule 2b
    issued = _parse_date(doc.get("issueDate"))
    if eff and issued and eff < issued:
        errors.append(ValidationError(doc_id, "2b", "effectiveDate < issueDate"))

    # Rule 3
    expiry = _parse_date(doc.get("expiryDate"))
    if expiry and eff and expiry <= eff:
        errors.append(ValidationError(doc_id, "3", "expiryDate <= effectiveDate"))

    # Rule 4 — relatedDocuments SoT + derived arrays referential integrity
    related = doc.get("relatedDocuments") or []
    for rel in related:
        target = rel.get("documentId")
        if target and target not in all_document_ids:
            errors.append(
                ValidationError(doc_id, "4", f"relatedDocuments references missing document id: {target}")
            )
    for field_name in ("supersedes", "supersededBy", "amends", "amendedBy"):
        for target in doc.get(field_name) or []:
            if target not in all_document_ids:
                errors.append(
                    ValidationError(doc_id, "4", f"{field_name} references missing document id: {target}")
                )

    # Rule 5 — cycles on time-ordered relations (global graph)
    if cyclic_graph and _node_in_cycle(cyclic_graph, doc_id):
        errors.append(ValidationError(doc_id, "5", "cycle detected in supersedes/amends relation graph"))

    return errors


def validate_all(documents: list[dict], today: date | None = None) -> ValidationReport:
    report = ValidationReport()
    all_ids = {d["documentId"] for d in documents}
    cyclic_graph = _build_cyclic_graph(documents, all_ids)
    for doc in documents:
        doc_errors = validate_document(doc, all_ids, cyclic_graph=cyclic_graph, today=today)
        if doc_errors:
            report.errors.extend(doc_errors)
            report.failed_document_ids.append(doc["documentId"])
        else:
            report.passed_document_ids.append(doc["documentId"])
    return report
