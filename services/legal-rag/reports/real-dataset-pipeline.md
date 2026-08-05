# Real Dataset Pipeline Validation

## 단계별 실행 결과
- ✅ **normalize** (4건) — 4/4행 매핑 성공, 필드 누락={'effectiveDateRaw': 4, 'expiryDateRaw': 4, 'rawStatus': 2, 'gatewayUrl': 3, 'documentNumberRaw': 1, 'issuingAuthority': 1, 'issueDateRaw': 1, 'bodyRaw': 1, 'officialUrl': 2, 'documentType': 2}
- ✅ **dataset_validation** (0건) — official_url 누락=2, content 누락=1, 중복그룹=1
- ✅ **deduplicate** (3건) — 4건 -> 3건 (중복 그룹 1개)
- ✅ **parse_structure** (6건) — 3개 문서 -> 6개 chunk (구조 인식 실패 0건)
- ✅ **parse_structure.khoan_diem_split** (0건) — 장문 조항에서 Khoản/Điểm 분리 확인됨: 3개
- ✅ **relationships** (2건) — 2개 edge 생성, 미분류 라벨 1건
- ✅ **effective_scopes** (6건) — 6건 생성

## 검색 스모크 테스트
- ✅ `search_by_document_number` — query='152/2020/NĐ-CP' -> 1건
- ✅ `search_by_document_id` — query='tmquan:186739' -> 1건
- ✅ `browse_by_status_filter` — status=active -> 0건(0건도 정상일 수 있음)

## 발견된 문제
- ⚠️ 관계 라벨 미분류(수동 매핑 검토 필요): 'Loại quan hệ không xác định XYZ' (1건)
