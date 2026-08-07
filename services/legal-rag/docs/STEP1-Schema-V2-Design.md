# STEP 1 — CanonicalDocument Schema V2 (Merged Design)

**Status: 구현 완료 (STEP1 Schema V2 applied)**

이 문서는 아래 두 애드덤을 병합한 STEP 1 최종 설계안이다.

- `CURSOR_INSTRUCTION_ADDENDUM_STEP1_SCHEMA_V2.md` (1차)
- `CURSOR_INSTRUCTION_ADDENDUM2_STEP1_TIMEVALIDITY.md` (2차)

기존 `CURSOR_INSTRUCTION_LEGAL_RAG_SCHEMA_AND_CURATION.md`의 STEP 2, "이번 범위에 포함 안 되는 것", "절대 준수사항"은 그대로 유지한다.

**v2 갱신**: `CURSOR_REQUEST_STEP1_DESIGN_FIXES.md` 5건 반영 (status 7값, Rule 2 분리, RelationType 11개, relatedDocuments SoT, category 원본값 표).

**v3 갱신**: `CURSOR_REQUEST_CATEGORY_MAPPING_AND_MISSING_SECTIONS.md` — category 매핑안 확정, 120건 샘플 전략 명시, status "7값" 라벨 수정.

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
| `category[]` | `category` | string[] | **13개 canonical 목록만** (아래 §3). 미분류는 `[]` |
| `authority` | `issuingAuthority` | string? | 발행기관명 |
| `authority_weight` | `authorityWeight` | int | `documentType`에서 파생 (§4) |
| `document_number` | `documentNumber` | string[] | 예: `["59/2020/QH14"]` |
| `issued_date` | `issueDate` | date? | 공포일 |
| `effective_date` | `effectiveDate` | date? | 발효일 |
| `expiry_date` | `expiryDate` | date? | 명시적 폐지/만료일 (nullable) |
| `publication_date` | `publicationDate` | date? | 관보(Công báo) 등록일 |
| `status` | `status` | enum | §5 (7값) |
| `supersedes[]` | `supersedes` | string[] | **파생** — §6 |
| `superseded_by[]` | `supersededBy` | string[] | **파생** — §6 |
| `amends[]` | `amends` | string[] | **파생** — §6 |
| `amended_by[]` | `amendedBy` | string[] | **파생** — §6 |
| `related_documents[]` | `relatedDocuments` | object[] | **원본(SoT)** `{ documentId, relationType }` — §6 |
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

- `RelationshipEdge` / `normalize_relations.py`는 **원시 관계 입력(raw edges)** 용으로 유지한다.
- 문서 단위 최종 관계의 **유일한 원본(source of truth)은 `relatedDocuments[]`** 이다 (§6).
- `supersedes` / `supersededBy` / `amends` / `amendedBy`는 `relatedDocuments[]`에서 **읽기 전용으로 파생**한다. 두 곳에 독립적으로 값을 쓰지 않는다.

---

## 3. category[] — 13개 canonical 목록, 매핑안, 원본값 현황

### 3.0 120건 샘플의 역할 (전략)

현재 120건 HF sample/preview는 **비즈니스/외국인 대상으로 큐레이션된 코퍼스가 아니라**, tmquan 중앙·지방 vbpl 문서가 무작위에 가깝게 포함된 데이터다. `legal_area` 30개 값 중 상당수(포상, 평생교육, 수리·제방 등)는 VFBCAI 서비스와 관련이 낮다.

**이 120건에 대한 category 매핑은 "실제 서비스용 최종 배정"이 아니라 "매핑 로직·파이프라인이 정상 동작하는지 확인하는 테스트"로 취급한다.** STEP 2에서 카테고리별 핵심 법전을 이름으로 지정해 큐레이션 수집을 시작하면, 관련성 높은 문서가 유입된다(원래 STEP 2 지시).

### 3.1 Canonical 13 (매핑 목표)

```
Company, Investment, Labor, Immigration, Tax, RealEstate, Licensing,
Customs, Banking, Civil, Commercial, Criminal, Administrative
```

- `Chưa phân loại`(미분류) → **`category: []`**
- 서비스 범위 밖 원본값 → **`category: []`** + 보고서에 **미매핑 사유: 서비스 범위 밖** 기록 (데이터 삭제 아님, 감사 추적)
- 미분류·미매핑 건수는 정규화 보고 시 별도 집계

### 3.2 원본 필드값 분포 (현재 120건 샘플)

데이터 경로: `data/raw/` (2026-03 기준 HF sample/preview)

#### tmquan/vbpl-vn — `legal_area` (100건, 30개 distinct 값)

| 값 | 건수 |
|---|---|
| Chưa phân loại | 63 |
| Tổ chức- Biên chế | 3 |
| Tổ chức cán bộ | 3 |
| Đường bộ | 2 |
| Công chức | 2 |
| Đất đai | 2 |
| Môi trường | 2 |
| Chất lượng Nông Lâm sản và Thủy sản | 1 |
| Tin học hóa | 1 |
| Quản lý thị trường | 1 |
| Thi hành án dân sự | 1 |
| Lâm nghiệp | 1 |
| Xuất nhập khẩu | 1 |
| Thi đua khen thưởng | 1 |
| Phát triển đô thị | 1 |
| Đầu tư tại Việt Nam | 1 |
| Quản lý ngân sách nhà nước | 1 |
| Điện | 1 |
| Thành lập và hoạt động của doanh nghiệp | 1 |
| Kiểm soát thủ tục hành chính | 1 |
| Chính sách | 1 |
| Công chức, viên chức | 1 |
| Khiếu nại, tố cáo | 1 |
| Giáo dục thường xuyên | 1 |
| Đào tạo và nghiên cứu y dược | 1 |
| Ngân sách nhà nước | 1 |
| Thủy lợi, đề điều và phòng chống bão lụt | 1 |
| Đường thủy nội địa | 1 |
| Quản lý quỹ ngân sách, quỹ dự trữ nhà nước, và các quỹ tài chính khác của nhà nước | 1 |
| Phát triển nông thôn | 1 |

#### th1nhng0 metadata — `linh_vuc` (10건, 3개 distinct 값)

| 값 | 건수 |
|---|---|
| Chưa phân loại | 8 |
| Đất đai | 1 |
| Chính quyền địa phương | 1 |

#### th1nhng0 legacy — `legal_sectors` (10건, 7개 distinct 값 — 배열 필드, 문서당 1항목)

| 값 | 건수 |
|---|---|
| Administrative apparatus | 4 |
| Education | 1 |
| Real estate, Transport | 1 |
| Employment - Wages, Administrative apparatus | 1 |
| Information technology, Administrative apparatus | 1 |
| Investment | 1 |
| Export & Import | 1 |

### 3.3 미분류(`Chưa phân loại`) 집계

| 소스 | 필드 | 미분류 건수 | 전체 |
|---|---|---|---|
| tmquan/vbpl-vn | `legal_area` | 63 | 100 |
| th1nhng0 metadata | `linh_vuc` | 8 | 10 |
| th1nhng0 legacy | `legal_sectors` | 0 (영문 별도 taxonomy) | 10 |
| **합계** | | **71** | **120** |

→ 120건 중 **59.2%**가 베트남어 `Chưa phân loại` 라벨.

### 3.4 Category 매핑안 (구현 기준 — 승인됨)

#### tmquan/vbpl-vn — `legal_area` → `category[]`

| 원본값 | canonical | 비고 |
|---|---|---|
| Đất đai | RealEstate | |
| Đầu tư tại Việt Nam | Investment | |
| Thành lập và hoạt động của doanh nghiệp | Company | |
| Xuất nhập khẩu | Customs | |
| Quản lý thị trường | Commercial | |
| Thi hành án dân sự | Civil | |
| Phát triển đô thị | RealEstate | |
| Môi trường | Licensing | REGISTER 환경 업종허가와 대응 |
| Chất lượng Nông Lâm sản và Thủy sản | Licensing | |
| Lâm nghiệp | Licensing | |
| Điện | Licensing | |
| Đào tạo và nghiên cứu y dược | Licensing | REGISTER 의료기기 업종허가와 인접 |
| Tổ chức- Biên chế | Administrative | |
| Tổ chức cán bộ | Administrative | |
| Công chức | Administrative | |
| Công chức, viên chức | Administrative | |
| Đường bộ | Administrative | |
| Tin học hóa | Administrative | |
| Kiểm soát thủ tục hành chính | Administrative | |
| Chính sách | Administrative | 매우 포괄적 — 최후수단 배정 |
| Khiếu nại, tố cáo | Administrative | |
| Quản lý ngân sách nhà nước | Administrative | |
| Ngân sách nhà nước | Administrative | |
| Quản lý quỹ ngân sách, quỹ dự trữ nhà nước, và các quỹ tài chính khác của nhà nước | Administrative | |
| Đường thủy nội địa | Administrative | |
| Thủy lợi, đề điều và phòng chống bão lụt | **[]** | 미매핑 — 서비스 범위 밖 |
| Phát triển nông thôn | **[]** | 미매핑 — 서비스 범위 밖 |
| Thi đua khen thưởng | **[]** | 미매핑 — 서비스 범위 밖 |
| Giáo dục thường xuyên | **[]** | 미매핑 — 서비스 범위 밖 |
| Chưa phân loại | **[]** | 미분류 유지 |

#### th1nhng0 metadata — `linh_vuc` → `category[]`

| 원본값 | canonical |
|---|---|
| Đất đai | RealEstate |
| Chính quyền địa phương | Administrative |
| Chưa phân loại | **[]** |

#### th1nhng0 legacy — `legal_sectors` → `category[]`

| 원본값 | canonical | 비고 |
|---|---|---|
| Investment | Investment | |
| Export & Import | Customs | |
| Real estate, Transport | RealEstate | "Transport" 부분은 미매핑 |
| Employment - Wages, Administrative apparatus | **Labor, Administrative** | 배열 — 두 카테고리 동시 배정 |
| Administrative apparatus | Administrative | |
| Information technology, Administrative apparatus | Administrative | |
| Education | **[]** | 미매핑 — 서비스 범위 밖 |

### 3.5 120건 샘플 매핑 예상 결과 (파이프라인 테스트용)

| 구분 | 건수 | 설명 |
|---|---|---|
| canonical 배정됨 | **44** | tmquan 33 + metadata 2 + legacy 9 |
| `Chưa phân loại` → `[]` | **71** | tmquan 63 + metadata 8 |
| 서비스 범위 밖 → `[]` | **5** | tmquan 4 + legacy 1 (Education) |
| **합계** | **120** | |

정규화 보고서 필수 항목: `category:[]` 문서별 **원본값**, **사유**(`미분류` / `서비스 범위 밖`).

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

## 5. status enum (V2 — 7값)

**최종 V2 status enum (7개):**

```
active, not_yet_effective, amended, superseded, repealed, suspended, unknown
```

(`not_yet_effective`는 별도 원본값이 아니라 **`effectiveDate`가 미래일 때 자동 파생**)

| V2 값 | 설명 |
|---|---|
| `active` | 현재 유효 |
| `not_yet_effective` | `effectiveDate` > 오늘 (자동 파생) |
| `amended` | 개정됨 (일부 조항 실효 포함) |
| `superseded` | 대체됨 |
| `repealed` | 전체 폐지/만료 |
| `suspended` | 효력 정지 (repealed와 별개) |
| `unknown` | 상태 정보 없음 — `rawStatus` 보존, 기본 검색 제외, **hard-fail 아님** |

**레거시 7값 → V2 매핑**

| 기존 (레거시) | V2 (최종) |
|---|---|
| `active` | `active` |
| `partially_expired` | `amended` |
| `fully_expired` | `repealed` |
| `amended` | `amended` |
| `replaced` | `superseded` |
| `suspended` | `suspended` |
| `unknown` | `unknown` (+ `rawStatus` 보존) |
| (자동 파생) | `not_yet_effective` — `effectiveDate`가 미래 |

**검색 정책**: `unknown` 문서는 기본 검색 결과에서 제외. 정규화 파이프라인에서는 hard-fail하지 않는다.

---

## 6. related_documents[] / relation_type

### 6.1 Source of truth (SoT) — 구현 의도

```
normalize_relations.py (raw edges)
        ↓
relatedDocuments[]  ← 유일한 원본 (쓰기는 여기만)
        ↓ derive (read-only)
supersedes / supersededBy / amends / amendedBy
```

- **`relatedDocuments[]`가 유일한 원본**이다. `normalize_relations.py`가 raw edge를 V2 `relationType`으로 매핑한 뒤, 역방향(inverse) edge까지 포함해 이 배열에 기록한다.
- **`supersedes` / `supersededBy` / `amends` / `amendedBy`는 파생 필드**다. Rule 1 검증 등에서 빠른 접근용이며, `relatedDocuments[]`에서 deterministic하게 재계산 가능해야 한다.
- 구현 시 **두 곳에 독립적으로 값을 넣지 않는다.** 파생 함수 예: `derive_relation_arrays(relatedDocuments) → { supersedes, supersededBy, amends, amendedBy }`

**이중 기록(dual-write) 시 리스크**

| 리스크 | 설명 |
|---|---|
| 데이터 drift | `relatedDocuments`에는 A→B `amends`가 있는데 `amends[]`에는 B id가 빠지는 불일치 |
| 검증 우회 | Rule 1이 `supersededBy`(파생)만 보고 `relatedDocuments`(원본)와 모순되는 상태를 놓칠 수 있음 |
| 디버깅 비용 | 어느 쪽이 최신/정확한지 추적 불가 |

→ SoT + 파생 패턴으로 구현 가능하며, **권장 방식**이다.

### 6.2 RelationType enum (12개)

`relatedDocuments` 각 항목: `{ "documentId": "...", "relationType": "..." }`

```
implements, implemented_by,
amends, amended_by,
supersedes, superseded_by,
repeals, repealed_by,
references, referenced_by,
related_to,
unknown
```

| relationType | 설명 |
|---|---|
| `implements` | 하위법령이 상위법 시행 |
| `implemented_by` | 역방향 |
| `amends` | 개정 |
| `amended_by` | 역방향 |
| `supersedes` | 대체 (구 `replaces`/`supersedes` 매핑) |
| `superseded_by` | 역방향 |
| `repeals` | 폐지 |
| `repealed_by` | 역방향 |
| `references` | 인용/참조 |
| `referenced_by` | 역방향 |
| `related_to` | 최후 수단 (남용 금지 — 비율 높으면 분류 오류로 간주) |
| `unknown` | 미분류 — `related_to`로 자동 승격 금지, 검수 필요 |

**레거시 → V2 매핑**

| 기존 RelationType | V2 |
|---|---|
| `implements` | `implements` |
| `amends` | `amends` |
| `repeals` | `repeals` |
| `replaces` | `supersedes` |
| `supersedes` | `supersedes` |
| `references` | `references` |
| `unknown` | `unknown` (❌ `related_to` 승격 금지) |

---

## 7. 정합성 검증 규칙 (hard-fail)

정규화 파이프라인 마지막에 실행. 위반 시 **자동 수정/무시 금지**, 오류 보고 후 해당 문서 제외.

| Rule | 조건 |
|---|---|
| **1** | `supersededBy`(파생)가 비어있지 않은데 `status == active` |
| **2a** | `effectiveDate`가 미래인데 `status == active` → `not_yet_effective`여야 함 |
| **2b** | `effectiveDate < issueDate` → 오류 (`effectiveDate == issueDate`는 허용) |
| **3** | `expiryDate` 존재 시 `expiryDate <= effectiveDate` → 오류 |
| **4** | `relatedDocuments[]`의 모든 `documentId` 및 파생 배열(`supersedes`/`supersededBy`/`amends`/`amendedBy`)의 id가 문서 집합에 존재 |
| **5** | `supersedes`/`supersededBy`/`amends`/`amendedBy` 관계에서 순환(A→B→C→A) — `references`/`referenced_by`/`related_to`/`unknown`은 제외 |

Rule 1·4·5는 **`relatedDocuments[]`(SoT) 기준**으로 검증하고, 파생 필드는 SoT와 불일치 시 **파생 로직 버그**로 처리한다 (문서 데이터 hard-fail이 아님).

---

## 8. 원본 → V2 필드 매핑 (추가분)

| V2 필드 | tmquan/vbpl | th1nhng0 metadata | th1nhng0 legacy |
|---|---|---|---|
| `category` | `legal_area` → canonical 13 또는 `[]` | `linh_vuc` → canonical 13 또는 `[]` | `legal_sectors` → canonical 13 또는 `[]` |
| `publicationDate` | (없음) | `ngay_dang_cong_bao` | (없음) |
| `summary` | `summary` | (없음) | (없음) |
| `language` | 추론 `vi` | 추론 `vi` | 추론 `vi` |
| `keywords` | (없음) | (없음) | (없음) |
| `relatedDocuments` | (없음 — relations 후처리) | relationships → SoT | (없음) |
| `supersedes` 등 4필드 | — | `relatedDocuments`에서 파생 | — |

---

## 9. STEP 2 확장 사다리 (참고)

```
200건 파일럿 검증 → (승인) → 1,000건 → (승인) → 3,000건 → (승인) → 10,000건
```

한 번에 3,000~5,000건으로 건너뛰지 않는다.

---

## 10. 작업 순서 (애드덤 준수)

1. **본 문서 검토** ← **현재 단계** (v3: category 매핑안 반영 완료)
2. 승인 후 `schema.py`, `normalize_documents.py`, validation 모듈 적용
3. 기존 120건 재정규화
4. 보고: category 분포, authorityWeight 분포, relation(SoT) 채워진 문서 수, 미분류(`category:[]`) 건수, hard-fail 건수
5. 타입체크/린트/테스트 통과 확인
6. **STEP 2 착수 전 Ace 확인**

---

## 11. 장기 목표 (이번 범위 아님)

```
법령 → 시행령 → Circular → 행정지침 → 법무법인 실무노트
  → CHECK → VERIFY → AI 종합판단
```

`case_records` / `expert_corrections`는 Ace 명시 승인 전 착수하지 않는다.
