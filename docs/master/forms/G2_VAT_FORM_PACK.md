# G2 — Form Verification Pack: 01/GTGT (부가가치세, khấu trừ)

verified_status: **unverified** (원문 대조·전문가 검증 전)

## §4 서식 버전

| form_code | portal_form_basis | status | feature_enabled |
|-----------|-------------------|--------|-----------------|
| 01/GTGT | TT89 | pending_verification | true |
| 01/GTGT | TT80 | blocked | false |
| 04/GTGT | TT89 | blocked | false |

## §5 field_map (계산·집계 규칙)

금액 단위: VND 정수(bigint). 반올림 없음(이미 정수인 금액만 합산).

| code | source | formula / rule |
|------|--------|----------------|
| 22 | calc | 직전 기간 정식 신고(amended 제외) [43]; 없으면 0 |
| 23 | calc | confirmed purchase+expense `amount_net` 합 |
| 24 | calc | confirmed purchase+expense `vat_amount` 합 |
| 25 | calc | confirmed purchase+expense deductible `vat_amount` 합(현재 스키마는 전액 가정) |
| 26 | input | 비과세 매출; 0%와 구분 코드 없으면 전문가 입력 |
| 29 | calc | confirmed sale, vat_rate=0 → `amount_net` 합 |
| 30 | calc | confirmed sale, vat_rate=5 → `amount_net` 합 |
| 31 | calc | confirmed sale, vat_rate=5 → `vat_amount` 합 |
| 32 | calc | confirmed sale, vat_rate=10 → `amount_net` 합 |
| 33 | calc | confirmed sale, vat_rate=10 → `vat_amount` 합 |
| 32a | calc | declaration_adjustments 합(field_code=32a) |
| 32b | calc | declaration_adjustments 합(field_code=32b) |
| 34a | calc | declaration_adjustments 합(field_code=34a) |
| 34 | calc | [26]+[27]+[32a]+[34a] ([27] 없으면 0) |
| 35 | calc | [28] 없으면 [31]+[32]+[33]+[34a조정없음시 0]; 단순화: [31]+[33]+(sale vat_rate=8 등 기타 vat_amount) — **엔진은 [35]=[31]+[33]+[32_line_vat]+adjust_35**; TT89 기본: [35]=[28] 대용 [31]+[33] |
| 36 | calc | [35]-[25] |
| 37 | expert | adjustments 합; reason_code 필수 |
| 38 | expert | adjustments 합; reason_code 필수 |
| 39a | input | 고정 0(제품 규칙 §9) |
| 40a | calc | max(0, [36]-[22]+[37]-[38]-[39a]) |
| 40b | input | 고정 0(제품 규칙 §9) |
| 40 | calc | [40a]-[40b] |
| 41 | calc | max(0, -([36]-[22]+[37]-[38]-[39a])) |
| 42 | expert | adjustments 합; [42]≤[41] |
| 43 | calc | [41]-[42] |

제약: [40]>0 AND [41]>0 동시 불가. [42]≤[41].

**§5 엔진 단순식 (TT89 2차 출처, Pack 검증 전):**

- `[35] = [31] + [33]` (다른 세율 행·[32] vat 없을 때)
- `[36] = [35] - [25]`
- `net = [36] - [22] + [37] - [38] - [39a]`
- `[40a] = max(0, net)`, `[41] = max(0, -net)`, `[40] = [40a]-[40b]`, `[43]=[41]-[42]`

## §6 reason_code (adjustments)

| code | use |
|------|-----|
| ADJ_DECREASE_PAYABLE | [37] 감소 |
| ADJ_INCREASE_PAYABLE | [38] 증가 |
| ADJ_REFUND_REQUEST | [42] 환급 신청 |
| ADJ_OTHER | 기타(전문가 메모 필수) |

## §7 테스트 값 (단위)

**케이스 A — 미환급·이월**

| field | value |
|-------|------:|
| 22 | 15_000_000 |
| 25 | 75_000_000 |
| 31 | 5_000_000 |
| 33 | 74_000_000 |
| 35 | 79_000_000 |
| 36 | 4_000_000 |
| 40a | 0 |
| 41 | 11_000_000 |
| 43 | 11_000_000 |

**케이스 B — 납부세액**

| field | value |
|-------|------:|
| 22 | 0 |
| 25 | 10_000_000 |
| 31 | 50_000_000 |
| 33 | 0 |
| 35 | 50_000_000 |
| 36 | 40_000_000 |
| 40a | 40_000_000 |
| 40 | 40_000_000 |
| 41 | 0 |
| 43 | 0 |

## §9 제품 규칙

- `[39a]`, `[40b]`는 0 고정(input).
- `vat_method=direct` → 01/GTGT 초안 생성 거부, 코드 `VAT_DIRECT_METHOD_CONTACT_EXPERT`.
- 방식·기간 자격은 자동 확정/전환 없음; warnings 키만.

## §11 대조 기록

- 2026-10-16: 저장소에 Pack 부재로 P5a에서 초안 작성(2차 출처). 원문 TT89 Phụ lục I 대조 **미완**.
