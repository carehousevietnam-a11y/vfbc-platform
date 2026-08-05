# Schema Validation Report

- 검사한 테이블 수: 7
- 검사한 인덱스 수: 20
- 오류: 0건 / 경고: 0건

## 테이블별 PRIMARY KEY / FOREIGN KEY
### `legal_articles`
- 컬럼 수: 13
- PRIMARY KEY: ['article_id']
  - FK: ['document_id'] -> `legal_documents`(['internal_id'])
  - FK: ['parent_article_id'] -> `legal_articles`(['article_id'])

### `legal_chunks`
- 컬럼 수: 13
- PRIMARY KEY: ['chunk_id']
  - FK: ['document_id'] -> `legal_documents`(['internal_id'])

### `legal_dataset_versions`
- 컬럼 수: 6
- PRIMARY KEY: ['dataset_name', 'revision']

### `legal_documents`
- 컬럼 수: 17
- PRIMARY KEY: ['internal_id']
  - FK: ['source_dataset', 'source_revision'] -> `legal_dataset_versions`(['dataset_name', 'revision'])

### `legal_effective_scopes`
- 컬럼 수: 9
- PRIMARY KEY: ['scope_id']
  - FK: ['document_id'] -> `legal_documents`(['internal_id'])
  - FK: ['relation_id'] -> `legal_relations`(['relation_id'])

### `legal_import_history`
- 컬럼 수: 9
- PRIMARY KEY: ['import_id']
  - FK: ['dataset', 'revision'] -> `legal_dataset_versions`(['dataset_name', 'revision'])

### `legal_relations`
- 컬럼 수: 9
- PRIMARY KEY: ['relation_id']
  - FK: ['source_document_id'] -> `legal_documents`(['internal_id'])
  - FK: ['target_document_id'] -> `legal_documents`(['internal_id'])

## 검사 결과
모든 검증 항목을 통과했습니다. 오류/경고 없음.
