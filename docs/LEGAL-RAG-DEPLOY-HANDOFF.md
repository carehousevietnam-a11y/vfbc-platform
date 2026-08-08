# Legal RAG 배포 핸드오프 — 새 채팅용

**작성일**: 2026-08-08  
**상태**: Legal RAG VPS 단독 기동 완료 / Vercel 연동·검색 개선 미착수  
**브랜치**: `cursor/docker-corpus-connect-4f0c`  
**PR**: [#6](https://github.com/carehousevietnam-a11y/vfbc-platform/pull/6) → `main` (OPEN, draft)

---

## 한 줄 요약

STEP 2 코퍼스(8,327건)를 DigitalOcean VPS에 올리고 **legal-rag 컨테이너만** 기동 완료.  
플랫폼(web)은 **Vercel**, Legal RAG는 **152.42.183.74:8080**.  
다음은 Vercel env 등록 → E2E 연동 확인 → STEP 2 이후 검색/랭킹 개선.

---

## 인프라 스냅샷

| 항목 | 값 |
|---|---|
| VPS IP | `152.42.183.74` (Singapore) |
| Droplet | 2 vCPU / 4 GB RAM (2026-08-08 업그레이드) |
| OS | Ubuntu 24.04 |
| Docker | 29.7.2 + Compose v5.4.0 |
| Repo on VPS | `/root/vfbc-platform` (`cursor/docker-corpus-connect-4f0c`) |
| Legal RAG URL (내부) | `http://127.0.0.1:8080` |
| Legal RAG URL (외부) | `http://152.42.183.74:8080` |
| web / nginx on VPS | **미기동** (Vercel이 web 담당) |

### 코퍼스 (방식 B: volume + tarball)

| 경로 (VPS) | 내용 |
|---|---|
| `services/legal-rag/data/corpus/pilot_10000/documents.jsonl` | 8,327건 (~789 MB) |
| `services/legal-rag/data/corpus/pilot_10000/chunks.jsonl` | 108,597청크 (~572 MB) |
| `services/legal-rag/data/corpus/pilot_10000/internal_relations.jsonl` | 빈 파일 (tmquan 한도) |

패키징/설치 스크립트: `services/legal-rag/scripts/{package,install}-pilot-corpus.sh`  
상세: `docs/DOCKER-DEPLOY.md`

---

## Legal RAG 런타임 설정 (VPS)

파일: `/root/vfbc-platform/services/legal-rag/.env.production`  
템플릿: `services/legal-rag/env.production.example`

| 변수 | 설정값 (민감정보는 서버/Vercel에만) |
|---|---|
| `OPENAI_MODEL` | **`gpt-4o`** |
| `OPENAI_API_KEY` | 서버에 설정됨 (**채팅/커밋에 넣지 말 것**) |
| `LEGAL_RAG_INTERNAL_TOKEN` | 서버·Vercel 동일값 필요 (**노출 금지**) |
| `LEGAL_RAG_*_PATH` | `data/corpus/pilot_10000/...` (기본값) |

기동 명령 (legal-rag만):

```bash
cd /root/vfbc-platform
docker compose --env-file services/legal-rag/.env.production up -d legal-rag
```

---

## 검증 스냅샷 (2026-08-08)

| 테스트 | 결과 |
|---|---|
| `GET /health` | ✅ 200 |
| `GET /ready` | ✅ documents **8327**, chunks **108597** |
| `POST /review` + `X-VFBCAI-Internal-Token` | ✅ (`thuế giá trị gia tăng`, `giấy phép lao động...` → success) |
| 외부 `152.42.183.74:8080/health` | ✅ 200 |
| 컨테이너 메모리 | ~**3.0 GiB** / 3.8 GiB (Swap 없음, 여유 ~500 MB) |

---

## PR / 브랜치 맵

| PR | 브랜치 | 내용 | 상태 |
|---|---|---|---|
| [#6](https://github.com/carehousevietnam-a11y/vfbc-platform/pull/6) | **`cursor/docker-corpus-connect-4f0c`** | Docker + 8k corpus volume + 8080 expose | **OPEN** ← **신규 작업 기준** |
| [#5](https://github.com/carehousevietnam-a11y/vfbc-platform/pull/5) | `cursor/legal-rag-pilot-10000-5df7` | STEP 2 close 8,327건 | OPEN |
| [#4](https://github.com/carehousevietnam-a11y/vfbc-platform/pull/4) | `cursor/legal-rag-pilot-3000-d576` | 3k pilot | OPEN |
| [#3](https://github.com/carehousevietnam-a11y/vfbc-platform/pull/3) | `cursor/legal-rag-schema-v2-d576` | Schema V2 + 200 | OPEN |
| [#1](https://github.com/carehousevietnam-a11y/vfbc-platform/pull/1) | `cursor/legal-rag-docker-deployment-d576` | 초기 Docker PR | OPEN → **#6에 흡수, close 가능** |

---

## 플랫폼 연동 (Vercel — Ace님 Dashboard)

**아직 미확인/미완료.** Vercel Production에 등록 필요:

| 변수 | 권장 값 |
|---|---|
| `LEGAL_RAG_URL` | `http://152.42.183.74:8080` (추후 HTTPS·도메인) |
| `LEGAL_RAG_INTERNAL_TOKEN` | VPS `.env.production`과 **동일** |
| `OPENAI_MODEL` | **`gpt-4o`** (⚠️ API 키 형식 `sk-proj-...` 아님) |

코드 연동 (main에 merge됨, `ai-chat/route.ts`):

- `ai_analysis` + `leadId` + `check|verify|register` → `reviewLegalCase()` → Legal RAG `/review`
- 실패 시 OpenAI fallback **없음**

E2E: Vercel env 등록 후 Case Room에서 check/verify/register 사건으로 테스트.

---

## ⚠️ 보안 — 반드시 지킬 것

1. **API 키·토큰·service role key를 채팅에 붙여넣지 말 것** (2026-08-08 노출 → 전량 재발급 사례)
2. Agent가 키를 요청할 때 **“채팅 노출 금지”를 먼저 안내**할 것
3. `.env.production`은 **git 커밋 금지** (`.gitignore` 적용됨)
4. SSH 비밀번호도 채팅 대신 **키 기반 SSH** 또는 Secrets 사용 권장

---

## STEP 2 이후 백로그 (수집 아님 — 검색/랭킹)

`services/legal-rag/docs/STEP2-NEXT-PHASE.md` 참고. 우선순위:

1. Banking / `keyword_all_terms` AND 완화
2. 랭킹: Similarity × Authority × Freshness × CategoryMatch
3. CategoryMatch, query_date, 대형 청크 16건, relationType

---

## 재현·운영 명령

### VPS SSH

```bash
ssh root@152.42.183.74
cd /root/vfbc-platform
```

### 상태 확인

```bash
curl -sS http://127.0.0.1:8080/ready | python3 -m json.tool
docker ps --filter name=legal-rag
free -h
```

### 코퍼스 갱신 (필요 시)

```bash
# dev machine
cd services/legal-rag && ./scripts/package-pilot-corpus.sh
# VPS
./services/legal-rag/scripts/install-pilot-corpus.sh /path/to/pilot_10000_corpus.tar.gz
docker compose --env-file services/legal-rag/.env.production restart legal-rag
```

### 로컬 개발 브랜치

```bash
git checkout cursor/docker-corpus-connect-4f0c
```

---

## 알려진 이슈 / 주의

| 이슈 | 내용 |
|---|---|
| 메모리 | 4 GB에서 legal-rag ~3 GB — Swap 없음, OOM 위험 있었음(2 GB 때 서버 다운) |
| HTTPS | nginx 미기동, 8080 plain HTTP |
| `OPENAI_MODEL` Vercel | 과거 `sk-proj-...`가 MODEL에 들어간 적 있음 → **`gpt-4o`로 수정** |
| hostname | Droplet 이름 `ubuntu-s-1vcpu-2gb-sgp1` (리사이즈 후에도 유지) |

---

## 새 채팅 체크리스트

1. `git checkout cursor/docker-corpus-connect-4f0c`
2. 이 문서 + `docs/DOCKER-DEPLOY.md` + `services/legal-rag/docs/STEP2-NEXT-PHASE.md` 확인
3. VPS `/ready` → 8327 / 108597 확인
4. PR #6 상태 확인
5. **비밀값은 채팅에 요청·전달하지 않기**
6. 다음 작업: Vercel env → E2E 또는 STEP2-NEXT-PHASE #1

---

## 핵심 파일

| 파일 | 용도 |
|---|---|
| `docker-compose.yml` | legal-rag + (미사용) web/nginx |
| `services/legal-rag/Dockerfile` | corpus volume mount, `/ready` healthcheck |
| `services/legal-rag/env.production.example` | Legal RAG env 템플릿 |
| `src/lib/legal-rag-client.ts` | 플랫폼 → Legal RAG 클라이언트 |
| `src/app/api/ai-chat/route.ts` | STEP19 Legal RAG 라우팅 |
| `docs/DOCKER-DEPLOY.md` | VPS 배포 가이드 |
| `services/legal-rag/docs/STEP2-HANDOFF.md` | STEP 2 큐레이션 핸드오프 |
