# VFBCAI Legal RAG — Python WSGI production image
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY src/ ./src/
COPY wsgi_entry.py ./
COPY data/normalized/ ./data/normalized/

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV LEGAL_RAG_HOST=0.0.0.0
ENV LEGAL_RAG_PORT=8080

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=15s \
  CMD curl -fsS http://127.0.0.1:8080/health || exit 1

CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:8080", "--timeout", "120", "wsgi_entry:application"]
