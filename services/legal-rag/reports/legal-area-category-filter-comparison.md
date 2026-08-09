# legal_area 카테고리 필터 — 스캔 범위·속도·품질 비교

## 데이터 출처

- **legal_area 분포**: `reports/legal-area-distribution.json` (tmquan/vbpl-vn 전체 158,822건, 547종)
- **필터 비교 벤치**: `tests/test_legal_area_search.py` (합성 인덱스, pytest)

## 1단계 — vbpl `legal_area` 분포 요약

| 항목 | 값 |
|------|-----|
| 총 문서 | 158,822 |
| 고유 `legal_area` 값 | 547 |
| `Chưa phân loại` (미분류) | 112,784 (71.1%) |

상위 10개 (전체 코퍼스):

| 건수 | legal_area |
|------|------------|
| 112,784 | Chưa phân loại |
| 2,861 | Đất đai |
| 2,301 | Quản lý thuế, phí, lệ phí và thu khác của ngân sách nhà nước |
| 1,698 | Quản lý thuế, phí và lệ phí |
| 1,673 | Lĩnh vực giá |
| 1,424 | Tổ chức- Biên chế |
| 1,373 | Lao động, tiền lương, tiền công |
| 1,211 | Quản lý ngân sách |
| 1,052 | Quản lý ngân sách nhà nước |
| 951 | Ngân sách nhà nước |

**Pilot 8327 문서**: VPS에 적재된 코퍼스는 정규화 시 `legalArea`가 버려져 **재수집(다운로드) 불필요**, 빌드 호스트에 `data/raw/vbpl` 원본이 남아 있다면 `normalize_documents` + dedup/chunk 파이프라인 **재실행**으로 소급 적용 가능.

## 2단계 — 서비스 ↔ legal_area 매핑

정의 위치: `src/service_category_mapping.py` (`SERVICE_TO_LEGAL_AREAS`)

| 서비스 | 매핑 legal_area (다대다) | 비고 |
|--------|---------------------------|------|
| wp | Kiểm soát thủ tục hành chính, Lao động tiền lương…, Xuất nhập khẩu… | 행정+노동 |
| trc | Kiểm soát thủ tục hành chính, Xuất nhập khẩu, Chính sách | |
| tamtru | Kiểm soát thủ tục hành chính, Chính quyền địa phương… | |
| driving-license | Đường bộ, Đường thủy nội địa… | |
| register_* / permit_company | Thành lập và hoạt động của doanh nghiệp + 업종별 | |
| verify_admin | Kiểm soát thủ tục hành chính, Công chức… | |
| verify_real_estate | Đất đai, Phát triển đô thị… | |
| verify_tax | Ngân sách/Quản lý thuế… (6종+) | |
| verify_fraud | Hình sự, Thi hành án dân sự… | |
| verify_unclear | **필터 없음** (전 코퍼스) | |

## 3단계 — 필터 ON vs OFF (합성 벤치, pytest)

`test_legal_area_filter_reduces_scan_scope` 결과 (로컬 pytest):

- **스캔 범위**: 필터 OFF → 전체 chunk 스캔; 필터 ON → 매칭 `legal_area` 문서의 chunk만 스캔 (문서 수·chunk 수 감소)
- **속도**: 스캔 대상이 줄어 키워드 검색 wall time 감소 (대형 코퍼스에서 O(n) 스캔 절감)
- **품질**: 관련 없는 `legal_area` 문서(예: 세무 문서에서 노동허가 ontology 매치) 상위 노출 감소; **미분류(`Chưa phân loại`) 문서는 매핑에 포함되지 않아 필터 ON 시 검색 범위 밖** — 이는 성능·노이즈 감소에 유리하지만, 미분류 문서에만 근거가 있는 경우 recall 하락 가능

**한계**: `legal_basis` 공백 문제는 evidence→citation 경로 이슈로, 카테고리 필터만으로는 해결되지 않음.
