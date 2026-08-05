# Pipeline — VFBCAI Legal Intelligence Platform

**상태: 설계 완료 (실행 없음). 아래 표는 각 단계의 입력/출력/담당 스크립트/실행 조건을
정리한 것이며, "실행 상태" 컬럼은 전부 미실행입니다.**

---

## 전체 단계표

| # | 단계 | 입력 | 출력 | 담당 스크립트 | 실행 조건 | 실행 상태 |
|---|---|---|---|---|---|---|
| 1 | Download | HF revision-pinned 데이터셋 | `data/raw/*.parquet` (gitignore) | `download_datasets.py` | huggingface.co 접근 가능 환경 | **미실행** |
| 2 | Audit | `data/raw/*` | `reports/dataset-audit.{md,json}` 외 5종 | `audit_datasets.py` | 1단계 완료 후 | **미실행** |
| 3 | Normalize (documents) | `data/raw/*` | `data/normalized/documents.parquet` | `normalize_documents.py` | 2단계 완료 후(Audit 결과로 매핑표 확정) | **미실행** |
| 4 | Normalize (relations) | `th1nhng0` `relationships` raw | `data/normalized/relationships.parquet` | `normalize_relations.py` | 2단계 완료 후 | **미실행** |
| 5 | Deduplicate | `data/normalized/documents.parquet` | `data/normalized/documents_deduped.parquet` + `reports/duplicate-report.json` | `deduplicate_documents.py` | 3단계 완료 후 | **미실행** |
| 6 | Legal Structure Parsing | `data/normalized/documents_deduped.parquet` | `data/normalized/chunks.parquet` | `parse_legal_structure.py` | 5단계 완료 후 | **미실행** |
| 7 | Pilot Corpus 추출 | `data/normalized/chunks.parquet` + `relationships.parquet` | `data/pilot/work_permit_corpus.parquet` | `extract_work_permit_corpus.py` | 6단계 완료 후 | **미실행** |

**STEP1의 범위는 1~7단계까지입니다.** 아래 8단계부터는 STEP2 이후 별도 작업입니다.

| # | 단계 | 담당 STEP | 실행 상태 |
|---|---|---|---|
| 8 | PostgreSQL 적재 | STEP2 | 미착수 |
| 9 | Keyword Search (tsvector/BM25) | STEP3 | 미착수 |
| 10 | pgvector 적재 | STEP5 | 미착수 |
| 11 | Hybrid Search 결합 | STEP4 | 미착수 |
| 12 | RRF Ranking | STEP6 | 미착수 |
| 13 | Legal Search API | STEP7 | 미착수 |
| 14 | OpenAI AI Document Review | STEP8 | 미착수 |
| 15 | Admin AI Workspace 연동 | STEP9 | 미착수 |

---

## 단계별 상세 설계

### [1] Download

- 두 데이터셋 모두 `datasets.load_dataset(..., revision=<고정 SHA>)`로 다운로드
  (Architecture.md 4장의 revision 값 사용).
- `th1nhng0`는 4개 config(`metadata`/`content`/`relationships`/`legacy`) 전부 필요.
  `legacy`는 결측 보완용이므로 우선순위는 낮지만 STEP1 범위에 포함.
- `data/raw/`는 `.gitignore` 처리(README에 명시됨). 다운로드 용량은 두 데이터셋 합산
  약 7.85 GB — 로컬 디스크 여유 공간 사전 확인 필요(설계 메모).

### [2] Dataset Audit

자동 조사 항목(원 지시사항 그대로 유지):
- 전체 문서 개수, 메타데이터 구조, Relationship 구조, 라이선스, Revision
- 중복 문서, 누락 문서, Official URL 존재 여부
- 문서번호 형식, 발행기관, 시행일, 효력상태 종류
- 개정 관계, 폐지 관계, 참조 관계

산출물(원 지시사항 그대로):
`reports/dataset-audit.md`, `dataset-audit.json`, `schema-comparison.json`,
`duplicate-report.json`, `relationship-quality.json`, `license-record.json`

이 Audit 결과가 Schema.md 6장의 "효력상태 표준화 매핑표"와 7장의 "필드 매핑표"에서
"Audit 필요"로 표시된 항목들을 확정하는 근거가 됩니다 — 즉 Schema.md는 잠정 설계이며,
Audit 완료 후 갱신이 필요합니다.

### [3]~[4] Normalize

- Canonical Document Schema(Schema.md 1장)로 변환. **원본 데이터는 수정하지 않고
  별도 파일로 출력.**
- 날짜 형식 통일(`DD/MM/YYYY` → ISO `YYYY-MM-DD` 등), `documentNumber` 리스트 정규화,
  효력상태 표준화 매핑 적용.
- Relationship은 원본 `doc_id`/`other_doc_id`를 Canonical `documentId` 체계로
  재매핑 — 이 재매핑이 정확하려면 [3]단계(documents 정규화)가 먼저 끝나야 하므로
  순서 의존성이 있음(4단계는 3단계 완료 후 실행).

### [5] Deduplicate

- Architecture.md 3장의 병합 규칙(`documentNumber` + `issueDate` 일치) 적용.
- 본문 상충 시 자동 병합 금지, `duplicate-report.json`에 플래그만 기록 — VFBCAI
  마스터문서 16장 "허위 데이터 절대 금지" 원칙과 동일한 보수적 태도를 유지.

### [6] Legal Structure Parsing

- `tmquan` 소스 문서는 `structure_json`을 우선 활용, Phần/Chương/Mục/Điều/Khoản/Điểm
  계층으로 재해석(Schema.md 3장).
- `th1nhng0` 소스 문서(구조 정보 없음, raw HTML만 존재)는 정규식 기반 자체 파싱 필요
  (`Điều \d+`, `Khoản \d+`, `Điểm [a-z]\)` 패턴) — tmquan 쪽보다 파싱 신뢰도가 낮을
  것으로 예상되며, Audit 단계에서 실제 정확도 측정 필요.
- Chunk 단위는 Điều 기본, 장문은 Khoản/Điểm까지 분리(Schema.md 4장).

### [7] Pilot Corpus 추출 (Work Permit)

원 지시사항의 키워드 목록을 그대로 사용:

```
giấy phép lao động · người lao động nước ngoài ·
người nước ngoài làm việc tại Việt Nam · miễn giấy phép lao động ·
xác nhận không thuộc diện cấp giấy phép lao động · phiếu lý lịch tư pháp ·
giấy chứng nhận sức khỏe · văn bản xác nhận kinh nghiệm · bằng cấp ·
dịch thuật · chứng thực · hợp pháp hóa lãnh sự
```

추출 로직(설계):
1. 위 키워드가 `title` 또는 chunk `text`에 포함된 문서를 1차 시드(seed)로 선정
2. 시드 문서에서 시작해 `legal_relationships` 그래프를 순회(개정 → 폐지 → 참조)하여
   연결된 문서까지 포함 — `relation_depth` 필드(Schema.md 6장 `pilot_work_permit_corpus`
   테이블)에 순회 깊이 기록
3. 단순 키워드 매치만으로 저장하지 않는다는 원 지시사항을 반영해, 최종 산출물에는
   `matched_keywords`(직접 매치)와 `included_reason`(관계 그래프 통해 포함된 경우
   "관계: amends of <documentId>" 형태로 근거 기록)을 함께 저장

**VFBCAI WP(노동허가) 서비스와의 연결**: 이 Pilot Corpus는 향후 `checkDiagnosis.ts`의
WP 로직이 참조할 수 있는 1차 후보군이 됩니다. 단, 이번 STEP1~STEP9 어느 단계에서도
`checkDiagnosis.ts`를 직접 수정하지 않으며, 통합은 Architecture.md 6장에서 정의한
Search API 경유 방식으로만 이루어집니다.

---

## STEP1 완료 판정 기준 (재개 시 참고)

- [ ] `reports/dataset-audit.md` 등 6종 리포트 생성 완료
- [ ] `data/normalized/documents.parquet`, `relationships.parquet` 생성 완료
- [ ] `data/normalized/documents_deduped.parquet` + `duplicate-report.json` 생성 완료
- [ ] `data/normalized/chunks.parquet` 생성 완료 (Phần/Chương/Mục/Điều/Khoản/Điểm
      계층 반영)
- [ ] `data/pilot/work_permit_corpus.parquet` 생성 완료
- [ ] 변경 파일만 ZIP 제출, 경로 검증(`unzip -l`) 완료
- [ ] `services/legal-rag/` 외부(기존 `vfbc-platform` 코드)는 전혀 변경되지 않았음을
      `git diff --stat`으로 확인

**이번 문서 작성 시점 기준으로는 위 항목 전부 미실행 상태입니다.**
