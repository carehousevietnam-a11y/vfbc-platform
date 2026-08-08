# VFBCAI Legal RAG — Python WSGI production image
#
# Corpus data (8,327-doc pilot) is NOT baked into the image. Mount
# services/legal-rag/data/corpus/pilot_10000 on the host and set
# LEGAL_RAG_*_PATH env vars (see docker-compose.yml and docs/DOCKER-DEPLOY.md).
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY src/ ./src/
COPY wsgi_entry.py ./

# Mount point for pilot corpus volume (populated at deploy time, not build time).
RUN mkdir -p /app/data/corpus/pilot_10000

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV LEGAL_RAG_HOST=0.0.0.0
ENV LEGAL_RAG_PORT=8080
ENV LEGAL_RAG_DOCUMENTS_PATH=data/corpus/pilot_10000/documents.jsonl
ENV LEGAL_RAG_CHUNKS_PATH=data/corpus/pilot_10000/chunks.jsonl
ENV LEGAL_RAG_RELATIONSHIPS_PATH=data/corpus/pilot_10000/internal_relations.jsonl

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --retries=5 --start-period=60s \
  CMD curl -fsS http://127.0.0.1:8080/ready || exit 1

CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:8080", "--timeout", "120", "wsgi_entry:application"]
