# Dataset Audit Report

## Revision
- `vbpl`: `11c902856b7a389788853fdd39b4998a5effa490`
- `th1nhng0`: `0a39ad7eae8e6c188cb225c4b1443c3b346461d8`

## License
- **vbpl**: CC-BY-4.0 — 원본 vbpl.vn 공개 포털(robots.txt Allow: /), 재배포는 CC-BY-4.0
- **th1nhng0**: 원문: Public Domain (베트남 정보접근법 104/2016/QH13, 법령공포법 64/2025/QH15) / 편집본: CC-BY-4.0 — 편집(스키마·큐레이션) 부분에만 CC-BY-4.0 출처 표시 필요

## 검사한 파일
- 총 5개 파일
  - `data/raw/th1nhng0/sample_content.jsonl` (0.31 MB)
  - `data/raw/th1nhng0/sample_legacy_metadata.jsonl` (0.01 MB)
  - `data/raw/th1nhng0/sample_metadata.jsonl` (0.01 MB)
  - `data/raw/th1nhng0/sample_relationships.jsonl` (0.00 MB)
  - `data/raw/vbpl/sample.jsonl` (4.26 MB)

## 문서 통계
- 전체 문서 수(정체성 소스 기준, content류 join 대상은 중복 집계 안 함): **120**
  - th1nhng0_legacy_metadata: 10
  - th1nhng0_metadata: 10
  - vbpl: 100
- 본문 없는 문서: 21
- Official URL 없는 문서: 0
- 시행일 없는 문서: 0
- 문서번호 형식 정상: 120
- 문서번호 형식 비정상(수동 확인 필요): 0
- 중복 후보(문서번호+시행일 동일): 0

## 효력상태(Status) 분포
- `In effect`: 8
- `Hết hiệu lực toàn bộ`: 5
- `Còn hiệu lực`: 4
- `Unknown`: 1
- `Expired`: 1
- `Chưa xác định`: 1

## 관계(Relationship) 통계
- 총 관계 수: 10
  - `Căn cứ`: 10

## 발행기관 Top 20
- UBND tỉnh Bà Rịa - Vũng Tàu: 25
- UBND Thành phố Hồ Chí Minh: 15
- UBND tỉnh Phú Yên: 8
- HĐND tỉnh Bà Rịa - Vũng Tàu: 6
- Bộ Tư pháp: 5
- UBND Thành phố Hà Nội: 5
- UBND Tỉnh Sơn La: 4
- HĐND tỉnh Bình Phước: 4
- UBND Tỉnh Tây Ninh: 3
- HĐND tỉnh Phú Yên: 3
- Uỷ ban Thường vụ Quốc hội: 3
- UBND Tỉnh Thanh Hóa: 2
- Chính phủ: 2
- HĐND Tỉnh Phú Thọ: 2
- HĐND Tỉnh Thanh Hóa: 2
- Hội đồng bầu cử quốc gia: 1
- Tỉnh Quảng Trị: 1
- Thành phố Hồ Chí Minh: 1
- Tỉnh Lâm Đồng: 1
- Ban Chỉ đạo Trung ương về phát triển khoa học, công nghệ, đổi mới sáng tạo và chuyển đổi số: 1

## SHA256 Manifest
- manifest에 기록된 파일 수: 5

## 메타데이터 필드 존재율
### th1nhng0_content
- `id`: 10
- `content_html`: 10
### th1nhng0_legacy_metadata
- `id`: 10
- `document_number`: 10
- `title`: 10
- `legal_type`: 10
- `legal_sectors`: 10
- `issuing_authority`: 10
- `issuance_date`: 10
- `effect_date`: 10
- `effect_status`: 10
- `signers`: 10
- `effectless_date`: 1
### th1nhng0_metadata
- `id`: 10
- `title`: 10
- `so_ky_hieu`: 10
- `ngay_ban_hanh`: 10
- `loai_van_ban`: 10
- `ngay_co_hieu_luc`: 10
- `linh_vuc`: 10
- `co_quan_ban_hanh`: 10
- `chuc_danh`: 10
- `nguoi_ky`: 10
- `pham_vi`: 10
- `tinh_trang_hieu_luc`: 10
- `nganh`: 6
- `nguon_thu_thap`: 5
- `ngay_het_hieu_luc`: 3
- `ngay_dang_cong_bao`: 1
### th1nhng0_relationships
- `doc_id`: 10
- `other_doc_id`: 10
- `relationship`: 10
### vbpl
- `doc_name`: 100
- `item_id`: 100
- `scope`: 100
- `source`: 100
- `source_url`: 100
- `api_url`: 100
- `title`: 100
- `doc_type`: 100
- `legal_type`: 100
- `legal_area`: 100
- `doc_number`: 100
- `issue_date`: 100
- `year`: 100
- `issuing_authority`: 100
- `num_sections`: 100
- `num_paragraphs`: 100
- `num_sentences`: 100
- `char_len`: 100
- `parser_model`: 100
- `parser_runtime`: 100
- `body_source`: 100
- `parsed_at`: 100
- `structure_json`: 100
- `extracted_json`: 100
- `markdown`: 99
- `text_hash`: 99
