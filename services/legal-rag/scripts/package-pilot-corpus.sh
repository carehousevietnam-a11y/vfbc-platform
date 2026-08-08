#!/usr/bin/env bash
# Package STEP 2 pilot normalized corpus for VPS deployment (방식 B artifact).
#
# Prerequisites:
#   cd services/legal-rag
#   python3 -m src.run_pilot_10000_pipeline --skip-curate
#
# Output:
#   dist/pilot_10000_corpus.tar.gz
#   dist/pilot_10000_corpus.manifest.json

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LEGAL_RAG_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SOURCE_DIR="${LEGAL_RAG_ROOT}/data/normalized/pilot_10000"
DIST_DIR="${LEGAL_RAG_ROOT}/dist"
OUTPUT="${DIST_DIR}/pilot_10000_corpus.tar.gz"
MANIFEST="${DIST_DIR}/pilot_10000_corpus.manifest.json"

DOCS="${SOURCE_DIR}/documents.jsonl"
CHUNKS="${SOURCE_DIR}/chunks.jsonl"

if [[ ! -f "${DOCS}" || ! -f "${CHUNKS}" ]]; then
  echo "error: normalized pilot corpus not found at ${SOURCE_DIR}" >&2
  echo "Run: cd services/legal-rag && python3 -m src.run_pilot_10000_pipeline --skip-curate" >&2
  exit 1
fi

mkdir -p "${DIST_DIR}"

DOC_COUNT="$(wc -l < "${DOCS}" | tr -d ' ')"
CHUNK_COUNT="$(wc -l < "${CHUNKS}" | tr -d ' ')"
DOCS_BYTES="$(wc -c < "${DOCS}" | tr -d ' ')"
CHUNKS_BYTES="$(wc -c < "${CHUNKS}" | tr -d ' ')"

STAGING="$(mktemp -d)"
mkdir -p "${STAGING}/pilot_10000"
cp "${DOCS}" "${CHUNKS}" "${STAGING}/pilot_10000/"
: > "${STAGING}/pilot_10000/internal_relations.jsonl"

tar -czf "${OUTPUT}" -C "${STAGING}" pilot_10000
rm -rf "${STAGING}"

cat > "${MANIFEST}" <<EOF
{
  "corpus": "pilot_10000",
  "documents": ${DOC_COUNT},
  "chunks": ${CHUNK_COUNT},
  "documents_bytes": ${DOCS_BYTES},
  "chunks_bytes": ${CHUNKS_BYTES},
  "artifact": "dist/pilot_10000_corpus.tar.gz",
  "expected_documents_min": 8327,
  "expected_chunks_min": 108000
}
EOF

echo "Packaged ${DOC_COUNT} documents, ${CHUNK_COUNT} chunks"
echo "  artifact: ${OUTPUT}"
echo "  manifest: ${MANIFEST}"
ls -lh "${OUTPUT}"
