-- ============================================================================
-- VFBCAI Legal Intelligence Platform — Seed Data (검증용, 합성 데이터)
--
-- ⚠️ 여기 포함된 데이터는 실제 vbpl.vn 크롤링 데이터가 아니라, 이번 저장소의
--    tests/test_integration_pipeline.py에서 사용한 것과 동일한 합성(synthetic)
--    예시다. 목적은 "스키마가 실제 값 형태를 담을 수 있는가"를 확인하는 것이며,
--    실제 Hugging Face 데이터셋을 다운로드해 적재하는 것이 아니다(이번 STEP2에서
--    금지된 범위 — "PostgreSQL 실제 적재"는 실 데이터 적재를 의미하며, 이
--    seed.sql은 스키마 자체를 검증하기 위한 최소 합성 픽스처다).
--
-- 실행 순서: create_schema.sql 실행 후 이 파일을 실행한다.
-- ============================================================================

BEGIN;
SET search_path TO legal_rag, public;

-- 1. Dataset versions (FK 선행 조건)
INSERT INTO legal_rag.legal_dataset_versions
    (dataset_name, revision, download_date, sha256, license, verified)
VALUES
    ('tmquan_vbpl_vn', '11c902856b7a389788853fdd39b4998a5effa490',
     NULL, NULL, 'CC-BY-4.0', false),
    ('th1nhng0_vietnamese_legal', '0a39ad7eae8e6c188cb225c4b1443c3b346461d8',
     NULL, NULL, 'Public Domain (원문) / CC-BY-4.0 (편집본)', false);

-- 2. Documents (tests/test_integration_pipeline.py의 합성 예시와 동일)
INSERT INTO legal_rag.legal_documents (
    internal_id, source_dataset, source_revision, official_document_id,
    official_url, document_number, document_type, title, issuing_authority,
    issue_date, effective_date, expiry_date, status, raw_status, content_hash
) VALUES
    (
        'tmquan:1001', 'tmquan_vbpl_vn', '11c902856b7a389788853fdd39b4998a5effa490',
        '1001', 'https://vbpl.vn/van-ban/chi-tiet/x1',
        ARRAY['152/2020/NĐ-CP'], 'nghi_dinh', 'Quy định về giấy phép lao động',
        'Chính phủ', '2020-12-30', NULL, NULL, 'unknown', NULL,
        '4f455b1e4d71c33efd42072556b4c856cd33930881ce69f717d12fcccd496501'  -- 자릿수 예시(실제 sha256은 64자)
    ),
    (
        'th1nhng0:5002', 'th1nhng0_vietnamese_legal', '0a39ad7eae8e6c188cb225c4b1443c3b346461d8',
        '5002', NULL, ARRAY['99/2019/TT-BLĐTBXH'], 'Thông tư',
        'Một văn bản khác hoàn toàn', 'Bộ Lao động Thương binh và Xã hội',
        '2019-01-01', NULL, NULL, 'fully_expired', 'Hết hiệu lực toàn bộ',
        'ff5f2c46329946ae3eb38f73867735011bd8b7b1e8f3b63ed9fac19080a78230'
    );

-- 3. Articles (계층 예시 — tmquan:1001의 Chương I > Điều 1 / Điều 2)
INSERT INTO legal_rag.legal_articles
    (document_id, parent_article_id, level, chuong_no, dieu_no, heading, path)
VALUES
    ('tmquan:1001', NULL, 'chuong', 'I', NULL, 'QUY ĐỊNH CHUNG', 'Chương I');

-- 방금 생성된 Chương I의 article_id를 참조해 Điều 1/2를 자식으로 연결
INSERT INTO legal_rag.legal_articles
    (document_id, parent_article_id, level, chuong_no, dieu_no, heading, path)
SELECT 'tmquan:1001', article_id, 'dieu', 'I', '1', 'Phạm vi điều chỉnh', 'Chương I > Điều 1'
FROM legal_rag.legal_articles
WHERE document_id = 'tmquan:1001' AND level = 'chuong' AND chuong_no = 'I';

INSERT INTO legal_rag.legal_articles
    (document_id, parent_article_id, level, chuong_no, dieu_no, heading, path)
SELECT 'tmquan:1001', article_id, 'dieu', 'I', '2', 'Đối tượng áp dụng', 'Chương I > Điều 2'
FROM legal_rag.legal_articles
WHERE document_id = 'tmquan:1001' AND level = 'chuong' AND chuong_no = 'I';

-- 4. Chunks (src/parse_legal_structure.py 실제 산출물과 동일한 예시)
INSERT INTO legal_rag.legal_chunks (
    chunk_id, document_id, chapter_no, article_no, clause_no, item_no,
    heading, original_text, normalized_text, search_text, status,
    official_url, content_hash
) VALUES
    (
        'tmquan:1001#dieu1', 'tmquan:1001', 'I', '1', NULL, NULL,
        'Chương I QUY ĐỊNH CHUNG > Điều 1 Phạm vi điều chỉnh',
        'Điều 1. Phạm vi điều chỉnh
Nghị định này quy định về giấy phép lao động cho người lao động nước ngoài làm việc tại Việt Nam.',
        'Điều 1. Phạm vi điều chỉnh
Nghị định này quy định về giấy phép lao động cho người lao động nước ngoài làm việc tại Việt Nam.',
        'điều 1. phạm vi điều chỉnh
nghị định này quy định về giấy phép lao động cho người lao động nước ngoài làm việc tại việt nam.',
        'unknown', 'https://vbpl.vn/van-ban/chi-tiet/x1', NULL
    ),
    (
        'tmquan:1001#dieu2', 'tmquan:1001', 'I', '2', NULL, NULL,
        'Chương I QUY ĐỊNH CHUNG > Điều 2 Đối tượng áp dụng',
        'Điều 2. Đối tượng áp dụng
1. Người lao động nước ngoài.
2. Người sử dụng lao động.',
        'Điều 2. Đối tượng áp dụng
1. Người lao động nước ngoài.
2. Người sử dụng lao động.',
        'điều 2. đối tượng áp dụng
1. người lao động nước ngoài.
2. người sử dụng lao động.',
        'unknown', 'https://vbpl.vn/van-ban/chi-tiet/x1', NULL
    ),
    (
        'th1nhng0:5002#dieu1', 'th1nhng0:5002', NULL, '1', NULL, NULL,
        'Điều 1 Nội dung khác...',
        'Điều 1. Nội dung khác...', 'Điều 1. Nội dung khác...',
        'điều 1. nội dung khác...',
        'fully_expired', NULL, NULL
    );

-- 5. Relations (th1nhng0:5002가 th1nhng0:5001을 폐지 — src/normalize_relations.py 예시와 동일.
--    단 이 seed에는 th1nhng0:5001을 별도로 넣지 않았으므로, FK 제약을 만족시키기 위해
--    여기서는 th1nhng0:5001 문서도 함께 최소 삽입한다.)
INSERT INTO legal_rag.legal_documents (
    internal_id, source_dataset, source_revision, official_document_id,
    document_number, title, issuing_authority, issue_date, status, raw_status
) VALUES (
    'th1nhng0:5001', 'th1nhng0_vietnamese_legal', '0a39ad7eae8e6c188cb225c4b1443c3b346461d8',
    '5001', ARRAY['152/2020/NĐ-CP'], 'Quy định về giấy phép lao động',
    'Chính phủ', '2020-12-30', 'active', 'Còn hiệu lực'
);

INSERT INTO legal_rag.legal_relations
    (source_document_id, target_document_id, relation_type, source_article, target_article, verified)
VALUES
    ('th1nhng0:5002', 'th1nhng0:5001', 'repeals', NULL, NULL, false);

-- 6. Effective scopes (관계로부터 파생된 예시)
INSERT INTO legal_rag.legal_effective_scopes
    (document_id, article_no, status, effective_from, effective_to, relation_id)
SELECT 'th1nhng0:5001', NULL, 'active', '2020-12-30', NULL, relation_id
FROM legal_rag.legal_relations
WHERE source_document_id = 'th1nhng0:5002' AND target_document_id = 'th1nhng0:5001';

-- 7. Import history (파이프라인 실행 예시 — 실제 실행 로그 아님, 형식 검증용)
INSERT INTO legal_rag.legal_import_history
    (dataset, revision, started_at, finished_at, success, imported_documents, warnings, errors)
VALUES
    (
        'tmquan_vbpl_vn', '11c902856b7a389788853fdd39b4998a5effa490',
        '2026-08-04T18:00:00Z', '2026-08-04T18:00:05Z', true, 2,
        '[]'::jsonb, '[]'::jsonb
    );

COMMIT;
