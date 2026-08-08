from src.relation_documents import build_related_documents_from_edges, derive_relation_arrays
from src.schema import RelationshipEdge, RelationType


def test_derive_relation_arrays_from_supersedes():
    related = [{"documentId": "b", "relationType": RelationType.SUPERSEDES.value}]
    derived = derive_relation_arrays(related)
    assert derived["supersedes"] == ["b"]
    assert derived["supersededBy"] == []


def test_build_related_documents_includes_inverse():
    edges = [
        RelationshipEdge(
            edgeId="a->b:amends",
            sourceDocumentId="a",
            targetDocumentId="b",
            relationType=RelationType.AMENDS.value,
            rawRelationLabel="Sửa đổi",
            sourceDataset="th1nhng0",
        )
    ]
    by_doc = build_related_documents_from_edges(edges)
    assert {"documentId": "b", "relationType": "amends"} in by_doc["a"]
    assert {"documentId": "a", "relationType": "amended_by"} in by_doc["b"]
