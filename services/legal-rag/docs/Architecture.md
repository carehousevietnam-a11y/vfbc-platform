# Architecture — VFBCAI Legal Intelligence Platform

**상태: 설계 완료 (실행/구현 없음)**

---

## 1. 설계 목표

VFBCAI의 CHECK/VERIFY/REGISTER 진단 로직(`checkDiagnosis.ts`/`verifyDiagnosis.ts`)이
현재 규칙 기반(rule-based)으로만 동작하는 한계를 넘어, **실제 베트남 법령 원문을 검색·
근거 제시할 수 있는 독립 Legal Intelligence 계층**을 만드는 것이 목표입니다.

이 계층은 VFBCAI 마스터문서 12장("AI 발전 로드맵")의 "중기 — OpenAI + 내부 데이터",
"장기 — VFBCAI 전용 AI" 단계의 인프라 기반이 됩니다. 단, **이번 STEP1~STEP9 전체가
완료되기 전까지는 기존 VFBCAI 서비스와 연결되지 않는 독립 프로젝트**로 유지합니다.

---

## 2. 전체 파이프라인 (설계)

```
[1] Source Datasets (Hugging Face, revision-pinned)
      ├─ tmquan/vbpl-vn  (159k docs, structure_json 내장)
      └─ th1nhng0/vietnamese-legal-documents (metadata+content+relationships+legacy)
              │
              ▼
[2] Download (revision 고정 스냅샷)
              │
              ▼
[3] Dataset Audit  (문서 수·메타구조·중복·라이선스·관계 품질 보고서)
              │
              ▼
[4] Normalize  (Canonical Document Schema로 통합, 원본 데이터는 불변 보존)
              │
              ▼
[5] Deduplicate  (documentNumber + issueDate + contentHash 기준 병합)
              │
              ▼
[6] Legal Structure Parsing  (Phần→Chương→Mục→Điều→Khoản→Điểm 계층 파싱)
              │
              ▼
[7] Chunking  (Điều 단위 기본, 긴 조문은 Khoản/Điểm까지 분리, 상위 Context 포함)
              │
              ▼
[8] Pilot Corpus 추출  (Work Permit 키워드 + 관계(개정/폐지/참조) 그래프 순회)
              │  ← 여기까지 STEP1 범위
              ▼
[9] PostgreSQL 적재  (STEP2)
              │
              ▼
[10] Keyword Search (tsvector/BM25, STEP3)
              │
              ▼
[11] Vector Index (pgvector, STEP5)
              │
              ▼
[12] Hybrid Search + RRF Ranking (STEP4, STEP6)
              │
              ▼
[13] Legal Search API (STEP7)  ← VFBCAI와의 유일한 통합 지점
              │
              ▼
[14] OpenAI AI Document Review (STEP8, "설명 생성" 보조 역할 한정)
              │
              ▼
[15] Admin AI Workspace 연동 (STEP9)
```

---

## 3. 데이터셋별 역할 분담 전략

두 데이터셋은 강점이 다르므로, 병합이 아니라 **역할 분담 + 교차검증** 전략을 채택합니다.

| 역할 | 담당 데이터셋 | 이유 |
|---|---|---|
| 본문 텍스트 원천(1차) | `tmquan/vbpl-vn` | 이미 NFC 정규화 + 정서법 통일 + 마크다운 정제(스캐폴딩 제거) 완료. `content_html`을 직접 정제하는 것보다 재작업 비용이 적음 |
| 계층 구조(document→section→paragraph→sentence) | `tmquan/vbpl-vn` | `structure_json`에 char-span 포함, 자체 파싱 불필요 — STEP1의 "법률 구조 파싱" 초기 구현 시 이 필드를 우선 활용하고, `Điều/Khoản/Điểm` 단위 재파싱은 별도 로직으로 보강 |
| 문서 간 관계 그래프(개정/인용/폐지) | `th1nhng0/vietnamese-legal-documents`의 `relationships` config | tmquan 데이터셋에는 구조화된 edge 테이블이 없음. 897,890개 edge는 Pilot Corpus의 "관련 법령→개정 법령→폐지 법령→참조 법령" 추적에 필수 |
| 결측 보완(레거시 문서) | `th1nhng0`의 `legacy` config (518k) | tmquan(159k)보다 커버리지가 넓음. 단, 필드 정밀도는 낮으므로 결측 보완 용도로만 사용 |
| 교차검증 | 양쪽 모두 | 동일 문서가 양쪽에 다른 doc_id로 존재하는 경우가 많아, Audit 단계에서 두 소스의 `documentNumber`/`issueDate`가 일치하는지 대조 |

**병합 규칙(초안)**: `documentNumber`(정규화된 형태) + `issueDate`가 모두 일치하면 동일
문서로 간주하고, 본문은 tmquan(정제도 높음)을 우선 채택하되 `th1nhng0`에만 있는
`relationships` edge는 그대로 결합. 두 소스에서 본문이 상충하는 경우(드묾) Audit
리포트에 별도 플래그로 기록하고 자동 병합하지 않는다 — 이는 STEP1 재개 시
`deduplicate_documents.py`의 핵심 로직이 됩니다.

---

## 4. Revision 고정 (재현성 원칙)

Hugging Face 데이터셋은 `main` 브랜치가 계속 갱신되므로(README 갱신, 데이터 재크롤링
등), **반드시 commit revision을 고정**하여 다운로드합니다.

| 데이터셋 | 고정 Revision |
|---|---|
| `tmquan/vbpl-vn` | `11c902856b7a389788853fdd39b4998a5effa490` |
| `th1nhng0/vietnamese-legal-documents` | `0a39ad7eae8e6c188cb225c4b1443c3b346461d8` |

```python
# STEP1 재개 시 download_datasets.py에서 사용할 패턴 (실행 안 됨, 설계만)
from datasets import load_dataset

ds = load_dataset(
    "tmquan/vbpl-vn",
    split="train",
    revision="11c902856b7a389788853fdd39b4998a5effa490",
)
```

이 revision 값은 `sourceRevision` 필드로 Canonical Schema(Schema.md)에 그대로
보존되어, 향후 어떤 레코드가 어느 시점의 스냅샷에서 왔는지 항상 추적 가능해야 합니다.

---

## 5. 라이선스 준수

| 데이터셋 | 라이선스 | 준수 사항 |
|---|---|---|
| `tmquan/vbpl-vn` | CC-BY-4.0 | 재배포/가공물에 출처 표시 필요. 상업적 재배포 전 원 포털(vbpl.vn) 이용약관 별도 확인 권고(Dataset Card 명시) |
| `th1nhng0/vietnamese-legal-documents` | 원문: Public Domain(베트남 정보접근법·법령공포법), 편집본: CC-BY-4.0 | 편집(스키마·큐레이션) 부분에 대해서만 CC-BY-4.0 출처 표시 필요 |

VFBCAI 마스터문서 16장("절대 하지 말아야 할 것")의 "허위 법령 정보" 금지 원칙에 따라,
이 프로젝트가 최종적으로 노출하는 모든 법령 텍스트는 원본 출처(`officialUrl`)를 함께
제공해야 하며, AI가 생성한 요약이 원문을 대체하지 않는다는 점을 Search API 응답에도
명시해야 합니다(STEP7 설계 시 반영 필요 — 아직 미착수).

---

## 6. VFBCAI 본 서비스와의 통합 경계

- 이번 STEP1~STEP9 전체는 `services/legal-rag/` 하위에서만 진행되며, `vfbc-platform`
  저장소의 기존 코드는 STEP9(Admin AI Workspace 연동) 이전까지 전혀 참조하지 않습니다.
- STEP9 이후에도 통합은 **오직 Legal Search API(STEP7 산출물) 호출**을 통해서만
  이루어지며, 기존 `checkDiagnosis.ts`/`verifyDiagnosis.ts`의 규칙 기반 판정 로직을
  대체하지 않습니다 — VFBCAI 마스터문서 12장의 원칙("최종 판단은 여전히 규칙 기반
  체크리스트가 담당하고 OpenAI는 설명 생성 보조 역할에 한정")을 그대로 계승합니다.
- DB도 분리합니다. 이 프로젝트의 PostgreSQL 스키마(Schema.md 참고)는 기존 Supabase
  프로젝트와 별개의 인스턴스/스키마에 적재하는 것을 전제로 설계했습니다. 기존
  Supabase에 테이블을 추가하지 않습니다(0장 원칙 및 개발 헌법 10장 원칙 15와 동일 취지).

---

## 7. 이번 단계에서 구현하지 않는 것 (재확인)

❌ OpenAI 연동 ❌ pgvector 적재 ❌ FastAPI ❌ RAG ❌ PostgreSQL 실제 적재 ❌ 검색 API
❌ AI 분석 ❌ 실제 데이터 다운로드/실행

이번 단계는 "Legal Dataset 조사 + Canonical Schema 설계 + Pipeline 설계"까지만
완료합니다.
