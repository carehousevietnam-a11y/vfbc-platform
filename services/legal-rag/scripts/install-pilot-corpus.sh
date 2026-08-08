#!/usr/bin/env bash
# Install STEP 2 pilot corpus on VPS from packaged artifact (방식 B).
#
# Usage (on VPS, from repo root):
#   ./services/legal-rag/scripts/install-pilot-corpus.sh /path/to/pilot_10000_corpus.tar.gz
#
# Extracts to services/legal-rag/data/corpus/pilot_10000/ for docker-compose volume mount.

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: $0 <pilot_10000_corpus.tar.gz>" >&2
  exit 1
fi

ARCHIVE="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LEGAL_RAG_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TARGET="${LEGAL_RAG_ROOT}/data/corpus/pilot_10000"

if [[ ! -f "${ARCHIVE}" ]]; then
  echo "error: archive not found: ${ARCHIVE}" >&2
  exit 1
fi

mkdir -p "${TARGET}"

# Support both layouts: pilot_10000/{files} or flat {files}
TMP="$(mktemp -d)"
tar -xzf "${ARCHIVE}" -C "${TMP}"

if [[ -d "${TMP}/pilot_10000" ]]; then
  SRC="${TMP}/pilot_10000"
else
  SRC="${TMP}"
fi

for f in documents.jsonl chunks.jsonl; do
  if [[ ! -f "${SRC}/${f}" ]]; then
    echo "error: missing ${f} in archive" >&2
    rm -rf "${TMP}"
    exit 1
  fi
done

rm -rf "${TARGET}"
mkdir -p "${TARGET}"
cp "${SRC}/documents.jsonl" "${SRC}/chunks.jsonl" "${TARGET}/"
if [[ -f "${SRC}/internal_relations.jsonl" ]]; then
  cp "${SRC}/internal_relations.jsonl" "${TARGET}/"
else
  : > "${TARGET}/internal_relations.jsonl"
fi

rm -rf "${TMP}"

DOC_COUNT="$(wc -l < "${TARGET}/documents.jsonl" | tr -d ' ')"
CHUNK_COUNT="$(wc -l < "${TARGET}/chunks.jsonl" | tr -d ' ')"

echo "Installed pilot corpus to ${TARGET}"
echo "  documents: ${DOC_COUNT}"
echo "  chunks:    ${CHUNK_COUNT}"

if [[ "${DOC_COUNT}" -lt 8000 ]]; then
  echo "warning: document count below expected ~8327 — verify artifact version" >&2
fi
