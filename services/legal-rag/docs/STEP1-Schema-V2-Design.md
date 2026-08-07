# STEP 1 — CanonicalDocument Schema V2 (Merged Design)

**Status: 검토 대기 (Review pending — 코드 미적용)**

이 문서는 아래 두 애드덤을 병합한 STEP 1 최종 설계안이다.

- `CURSOR_INSTRUCTION_ADDENDUM_STEP1_SCHEMA_V2.md` (1차)
- `CURSOR_INSTRUCTION_ADDENDUM2_STEP1_TIMEVALIDITY.md` (2차)

기존 `CURSOR_INSTRUCTION_LEGAL_RAG_SCHEMA_AND_CURATION.md`의 STEP 2, "이번 범위에 포함 안 되는 것", "절대 준수사항"은 그대로 유지한다.

---

## 1. 목표

`CanonicalDocument` 및 `normalize_documents.py`를 확장하여 검색·랭킹·관계 그래프·효력기간 필터링에 필요한 메타데이터를 정규화 단계에서 채운다.

**이번 단계에서 구현하지 않는 것**

- 검색 랭킹 공식 (`Similarity × AuthorityScore × Freshness × CategoryMatch`)
- `query_date` 기반 효력 필터 (스키마만 지원)
- AEO/GEO/SEO 콘텐츠 전략
- `case_records` / `expert_corrections` 연동

---

## 2. 필드 목록 (V2)

애드덤은 snake_case로 기술되어 있으나, **기존 코드베이스(`schema.py`, JSONL)는 camelCase**를 사용한다. 구현 시 camelCase를 유지하고 아래 매핑을 따른다.

| 애드덤 (snake_case) | 코드 (camelCase) | 타입 | 설명 |
|---|---|---|---|
| `id` | `documentId` | string | 내부 고유 ID (`{source}:{sourceDocumentId}`) |
| `title` | `title` | string? | 문서 제목 |
| `document_type` | `documentType` | string | Law, Decree, Circular, Decision, Resolution … (원본 slug/전체명 정규화) |
| `category[]` | `category` | string[] | **13개 고정 목록만** (아래 §3) |
| `authority` | `issuingAuthority` | string? | 발행기관명 |
| `authority_weight` | `authorityWeight` | int | `documentType`에서 파생 (§4) |
| `document_number` | `documentNumber` | string[] | 예: `["59/2020/QH14"]` |
| `issued_date` | `issueDate` | date? | 공포일 |
| `effective_date` | `effectiveDate` | date? | 발효일 |
| `expiry_date` | `expiryDate` | date? | 명시적 폐지/만료일 (nullable) |
| `publication_date` | `publicationDate` | date? | 관보(Công báo) 등록일 |
| `status` | `status` | enum | §5 |
| `supersedes[]` | `supersedes` | string[] | 이 문서가 대체한 문서 id |
| `superseded_by[]` | `supersededBy` | string[] | 이 문서를 대체한 문서 id |
| `amends[]` | `amends` | string[] | 이 문서가 개정한 문서 id |
| `amended_by[]` | `amendedBy` | string[] | 이 문서를 개정한 문서 id |
| `related_documents[]` | `relatedDocuments` | object[] | `{ documentId, relationType }` (§6) |
| `language` | `language` | string? | 언어 (기본 `vi`) |
| `summary` | `summary` | string? | 요약 |
| `keywords[]` | `keywords` | string[] | 키워드 |
| `source_url` | `officialUrl` | string? | 원문 URL |

**파이프라인 전용 필드 (V2에서도 유지)**

| 필드 | 설명 |
|---|---|
| `sourceDataset`, `sourceRevision`, `sourceDocumentId` | 출처 추적 |
| `gatewayUrl` | tmquan API URL |
| `rawStatus` | 원본 효력상태 (감사용) |
| `originalText`, `normalizedText`, `searchText`, `contentHash` | 본문/검색 |
| `importedAt` | 정규화 시각 |

**별도 그래프 테이블**

- `RelationshipEdge` / `normalize_relations.py`는 유지하되, 정규화 마지막 단계에서 `relatedDocuments[]` 및 `supersedes`/`supersededBy`/`amends`/`amendedBy` 배열을 **역방향 포함(inverse) 관계까지 materialize**한다.

---

## 3. category[] — 13개 고정 목록

애드덤: "기존 문서 목록 그대로" — **원본 지시문(`CURSOR_INSTRUCTION_LEGAL_RAG_SCHEMA_AND_CURATION.md`)에 정의된 13개 목록이 저장소에 없음.**

현재 샘플 데이터(`legal_area` / `linh_vuc`)에서는 30+ 비표준 값이 관찰됨. 200건 파일럿 전 Ace 승인이 필요:

1. 13개 canonical category 목록 확정
2. `legal_area` / `linh_vuc` / `legal_sectors` → canonical 매핑표
3. 매핑 불가 시 `["Chưa phân loại"]` 또는 hard-fail 정책 결정

---

## 4. authority_weight

정규화 시 `documentType`에서 자동 계산 (랭킹 로직은 이번 단계 미구현):

| document_type (정규화 후) | weight |
|---|---|
| Law / Bộ luật | 100 |
| Decree / Nghị định | 90 |
| Circular / Thông tư | 80 |
| Decision / Quyết định | 60 |
| Resolution / Nghị quyết | 50 |
| 기타 / 미분류 | 30 |

---

## 5. status enum (V2)

애드덤 V2 status (기존 7값 → 5값으로 단순화):

| V2 값 | 설명 |
|---|---|
| `active` | 현재 유효 |
| `not_yet_effective` | `effectiveDate`가 미래 |
| `amended` | 개정됨 |
| `superseded` | 대체됨 |
| `repealed` | 폐지됨 |

**기존 → V2 매핑 (제안)**

| 기존 | V2 |
|---|---|
| `active` | `active` |
| `partially_expired` | `active` (부분실효는 `EffectiveScope`로 처리) |
| `fully_expired` | `repealed` |
| `amended` | `amended` |
| `replaced` | `superseded` |
| `suspended` | `repealed` (또는 별도 enum 추가 — **승인 필요**) |
| `unknown` | `active` + `rawStatus` 보존, 또는 hard-fail — **승인 필요** |

---

## 6. related_documents[] / relation_type

`relatedDocuments` 각 항목: `{ "documentId": "...", "relationType": "..." }`

| relationType | 설명 |
|---|---|
| `implements` | 하위법령이 상위법 시행 |
| `implemented_by` | 역방향 |
| `amends` | 개정 |
| `amended_by` | 역방향 |
| `repeals` | 폐지 |
| `repealed_by` | 역방향 |
| `references` | 인용/참조 |
| `referenced_by` | 역방향 (2차 애드덤) |
| `related_to` | 최후 수단 (남용 금지) |

기존 `RelationType` enum (`replaces`/`supersedes`/`unknown` 등)은 V2 enum으로 통합·매핑 필요.

---

## 7. 정합성 검증 규칙 (hard-fail)

정규화 파이프라인 마지막에 실행. 위반 시 **자동 수정/무시 금지**, 오류 보고 후 해당 문서 제외.

| Rule | 조건 |
|---|---|
| 1 | `supersededBy` 비어있지 않은데 `status == active` |
| 2 | `effectiveDate`가 미래인데 `status == active` → `not_yet_effective`여야 함 (1차 애드덤) / `effectiveDate < issueDate` 위반 (2차: `>=` 허용) |
| 3 | `expiryDate` 존재 시 `expiryDate <= effectiveDate` |
| 4 | `relatedDocuments[]` 및 `supersedes`/`supersededBy`/`amends`/`amendedBy`의 모든 id가 문서 집합에 존재 |
| 5 | `supersedes`/`supersededBy`/`amends`/`amendedBy` 관계에서 순환(A→B→C→A) — `references`/`referenced_by`/`related_to`는 제외 |

---

## 8. 원본 → V2 필드 매핑 (추가분)

| V2 필드 | tmquan/vbpl | th1nhng0 metadata | th1nhng0 legacy |
|---|---|---|---|
| `category` | `legal_area` → canonical 13 | `linh_vuc` → canonical 13 | `legal_sectors` → canonical 13 |
| `publicationDate` | (없음) | `ngay_dang_cong_bao` | (없음) |
| `summary` | `summary` | (없음) | (없음) |
| `language` | 추론 `vi` | 추론 `vi` | 추론 `vi` |
| `keywords` | (없음) | (없음) | (없음) |
| relation arrays | (없음 — relations 파일 후처리) | relationships → materialize | (없음) |

---

## 9. STEP 2 확장 사다리 (참고)

```
200건 파일럿 검증 → (승인) → 1,000건 → (승인) → 3,000건 → (승인) → 10,000건
```

한 번에 3,000~5,000건으로 건너뛰지 않는다.

---

## 10. 작업 순서 (애드덤 준수)

1. **본 문서 + diff 검토** ← **현재 단계**
2. 승인 후 `schema.py`, `normalize_documents.py`, validation 모듈 적용
3. 기존 120건 재정규화
4. 보고: category 분포, authorityWeight 분포, relation 배열 채워진 문서 수, hard-fail 건수
5. 타입체크/린트/테스트 통과 확인
6. **STEP 2 착수 전 Ace 확인**

---

## 11. 장기 목표 (이번 범위 아님)

```
법령 → 시행령 → Circular → 행정지침 → 법무법인 실무노트
  → CHECK → VERIFY → AI 종합판단
```

`case_records` / `expert_corrections`는 Ace 명시 승인 전 착수하지 않는다.
