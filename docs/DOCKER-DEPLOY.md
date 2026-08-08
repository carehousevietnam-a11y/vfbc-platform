# VPS Docker Deployment — Legal RAG + Platform

STEP 2 pilot corpus (8,327 documents) is deployed via **방식 B: pre-built artifact + volume mount**.
The Docker image does not bake in corpus data; you install it on the VPS before `docker compose up`.

---

## Architecture

```
nginx:80/443 → web:3000 (Next.js standalone)
                 ↓ LEGAL_RAG_URL=http://legal-rag:8080
              legal-rag:8080 (Python WSGI)
                 ↑ volume: ./services/legal-rag/data/corpus/pilot_10000 → /app/data/corpus/pilot_10000
```

---

## Why 방식 B (not A or C)

| 방식 | 판단 |
|---|---|
| **A** 빌드 시 pipeline | HF 접근·빌드 시간·재현성 리스크. Docker 빌드 환경마다 결과가 달라질 수 있음. |
| **B** 아티팩트 + volume | **채택** — 이미지는 코드만, 8k 코퍼스는 검증된 tarball로 주입. 빌드 빠르고 배포 재현성 확보. |
| **C** git/LFS 커밋 | normalized ~수백 MB+, 매 갱신마다 대형 diff. GitHub 100MB 제한과 충돌. |

---

## 1. Prepare corpus artifact (dev machine — once per corpus update)

```bash
cd services/legal-rag

# If normalized data not present yet (requires HF access + raw jsonl):
python3 -m src.run_pilot_10000_pipeline --skip-curate

# Package for VPS
chmod +x scripts/package-pilot-corpus.sh scripts/install-pilot-corpus.sh
./scripts/package-pilot-corpus.sh
# → dist/pilot_10000_corpus.tar.gz, dist/pilot_10000_corpus.manifest.json
```

Upload `dist/pilot_10000_corpus.tar.gz` to the VPS (scp, object storage, etc.).

---

## 2. VPS setup (Ace)

```bash
# Clone / pull unified branch
git clone https://github.com/carehousevietnam-a11y/vfbc-platform.git
cd vfbc-platform
git checkout cursor/docker-corpus-connect-4f0c   # or main after merge

# Install corpus
./services/legal-rag/scripts/install-pilot-corpus.sh /path/to/pilot_10000_corpus.tar.gz

# Configure environment
cp env.production.example .env.production
cp services/legal-rag/env.production.example services/legal-rag/.env.production
# Edit both files: Supabase keys, OPENAI_*, LEGAL_RAG_INTERNAL_TOKEN (same value in both), RESEND_*, domain

# Build and start
docker compose --env-file .env.production build
docker compose --env-file .env.production up -d

# Verify
curl -sS http://127.0.0.1:8080/ready | python3 -m json.tool
# Expect: "ok": true, "index.documents": ~8327, "index.chunks": ~108597
```

---

## 3. Vercel (separate — Ace)

If the platform stays on Vercel (not the Docker `web` service):

1. Set `LEGAL_RAG_URL` to the public URL of the VPS Legal RAG service (nginx reverse proxy or direct port).
2. Set `LEGAL_RAG_INTERNAL_TOKEN` to the same secret as `.env.production`.

---

## 4. Updating corpus without rebuilding images

```bash
./services/legal-rag/scripts/install-pilot-corpus.sh /path/to/new_pilot_10000_corpus.tar.gz
docker compose restart legal-rag
curl -sS http://127.0.0.1:8080/ready
```

---

## Static review checklist (pre-VPS)

- [x] `next.config.ts`: `output: "standalone"`
- [x] Root `Dockerfile`: build args for Supabase/Resend at build time
- [x] `legal-rag` healthcheck: `/ready` (requires corpus + OpenAI env)
- [x] Volume mount path matches `LEGAL_RAG_*_PATH` defaults
- [x] Sample 120-doc `data/normalized/` no longer copied into image

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| `legal-rag` unhealthy, `/ready` 503 "documents dataset is missing" | Corpus not installed — run `install-pilot-corpus.sh` |
| `/ready` 503 "OPENAI_API_KEY is not configured" | Fill OpenAI vars in `services/legal-rag/.env.production` |
| Web starts but Legal RAG calls fail | `LEGAL_RAG_INTERNAL_TOKEN` mismatch between web and legal-rag |
| Document count ~120 | Old sample path — check volume mount and env paths |
