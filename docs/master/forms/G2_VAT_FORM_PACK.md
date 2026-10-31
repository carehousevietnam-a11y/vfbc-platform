# Form Verification Pack — G2 부가가치세 (방식·주기·01/GTGT 필드) v2 (2026-10-16)

> 이 파일은 이전 G2_VAT_METHOD_AND_PERIOD.md를 대체합니다(v1의 §3 오류 정정 포함).
> 저장 위치: docs/master/forms/G2_VAT_FORM_PACK.md
> 검증 수준: 필드·공식은 TT89 Phụ lục I 전문을 옮긴 2차 출처(vnlawfirm.vn, 다수 매체와 공식 일치)와 대조했습니다. 정부 공보 PDF 대조 전이므로 form_versions.status는 `pending_verification`으로 시드합니다.

## 1. 정정 사항 (v1 대비)
- v1은 "2026-07-01 이후 기간은 TT89 서식"이라고만 적었습니다. 실제로는 이행 규정이 있습니다. TT89 제100조 1항은 2026-07-01 이전 기간에 구 서식을 유지한다고 정하고, QĐ 1934/QĐ-BTC는 세무당국 로드맵 시점(TT89 제99조 2항)까지 납세자가 TT80 서식을 모든 기간에 쓸 수 있다고 허용합니다(2차 출처 MISA 인용). 2026-10-07 공개된 HTKK 5.7.9도 신규 01/GTGT를 아직 반영하지 않았습니다.
- v1의 "신규 설립 법인 판정 미확정"은 NĐ181/2025 제21조 원문으로 상당 부분 해소했습니다(§2).

## 2. 방식 선택 (Luật 48/2024 제10~12조, NĐ181/2025 제21조)
- 공제 방식(01/GTGT): 회계·인보이스·증빙을 갖춘 사업장 중 ① 연 매출 10억 VND 이상, ② 자발적 선택(법 제11조 2항).
- 직접 방식(04/GTGT): 연 매출 10억 VND 미만 법인(자발적 공제 선택 제외) 등(법 제12조 2항).
- 연 매출 판정(NĐ181 제21조 1항 a): 월 신고는 직전 11월~당해 10월, 분기 신고는 직전 4분기~당해 3분기의 「과세 매출 합계」 지표 합산. 한 번 정하면 2년 연속 유지.
- 설립 연도 12개월 미만(제21조 1항 b): 영업 개월 수로 연환산(합계÷개월×12). 10억 이상이면 공제, 미만이면 2년간 직접 방식(자발적 공제 등록 제외).
- 자발적 공제 등록 가능 유형(제21조 2항): 매출 10억 미만이어도 장부·인보이스를 갖춘 기존 법인(a), 투자 프로젝트가 있는 신규 법인(c, d), 신규 법인이 고정자산·기계·설비·공구를 취득하거나 영업장 임대차 계약이 있는 경우(đ), 상설사업장이 있는 외국 조직(e) 등. 신규 한국계 소규모 법인은 đ(임대차 계약)에 해당할 가능성이 높으나 **판정과 등록 절차는 VNK 전문가 확인 사항**입니다.
- 공제 방식 인보이스는 부가가치세 인보이스, 직접 방식은 판매 인보이스. 직접 방식 사업자가 발행한 인보이스는 공제 불가.
- 매입세액 공제 요건: 인보이스 + 비현금 결제 증빙(부가가치세 포함 5백만 VND 이상, NĐ181 제26조). 후불·할부 예외와 [37] 조정은 제26조 2항 g.
- 방식 전환 시 공제→직접 전환 마지막 기간 [37]에 미공제 세액을 조정(TT89 01/GTGT 주석 4).

## 3. 주기 (NĐ252/2026 제9·10조, 제3조 7항 — 2차 출처)
- 직전 연도 매출 500억 VND 이하이면 분기 신고 선택 가능. 신규 사업자는 분기 신고 선택 가능.
- 신규 사업자 첫해 매출이 500억 이하이면 만 12개월 경과 후 다음 역년부터 직전 연도 매출로 판정, 500억 초과(12개월 미만 포함)이면 다음 역년부터 월 신고.
- 자격 없음을 스스로 발견하면 다음 분기 첫 달부터 월 신고. 세무당국이 발견하면 월 기준으로 세액 재산정.
- 기한: 월=익월 20일, 분기=다음 분기 첫 달 말일, 휴일이면 다음 영업일. **테스트 값: 2026년 3분기=2026-11-02, 2분기=2026-07-31.**
- 월→분기 변경 신청 서식: 01/ĐK-TĐKTT (TT89 목록).

## 4. 서식 버전 관리 (form_versions)
| form_code | 근거 | status | 비고 |
|---|---|---|---|
| 01/GTGT (TT89 Phụ lục I) | TT89/2026/TT-BTC, 2026-07-01 시행 | pending_verification | P5 field_map 대상 |
| 01/GTGT (TT80 구 서식) | TT80/2021, 이행 규정으로 사용 허용 | blocked | field Pack 없음. 구현하지 않음 |
| 04/GTGT (TT89) | 직접 방식 | blocked(플래그 OFF) | 1차 범위 밖 |
- `declarations.portal_form_basis`(TT89 | TT80)는 VNK 전문가가 제출 의뢰 단계에서 기록합니다. 시스템 초안은 TT89 구조만 생성합니다.
- TT80→TT89 변경점(2차 출처): [06], [08], [11a], [23a], [24a], [32a] 명칭 수정, [11b] 삭제, [32b]·[34a] 신설, [27]·[34] 공식 변경, [37]·[38]·[39a] 기재 지침 변경.
- 포털이 TT80만 받는 경우의 매핑(예: [32b]·[34a]가 0인지 확인)은 전문가 확인 사항으로 두고, 시스템이 자동 변환하지 않습니다.

## 5. 01/GTGT 필드표 (TT89 Phụ lục I)
열: V=가액(부가가치세 제외), T=세액, F=표시/문자. 유형: in=시스템 입력(원장·설정에서 집계), calc=공식, exp=전문가 수기(사유 필수), out=P5 범위 밖(필드 미생성).

| 코드 | 베트남어 항목(원문 요지) | 한국어 라벨(초안) | 열 | 유형 | 규칙 |
|---|---|---|---|---|---|
| [01a] | Tên hoạt động sản xuất kinh doanh | 사업 활동 구분 | F | in | P5는 「sản xuất kinh doanh thông thường」 고정 |
| [01b] | Kỳ tính thuế (Tháng/Quý) | 신고 기간 | F | in | period_key |
| [02] | Lần đầu | 최초 신고 | F | in | 수정신고가 아니면 표시 |
| [03] | Bổ sung lần thứ | 보정 신고 차수 | F | in | amended 횟수 |
| [04] | Tên người nộp thuế | 납세자명 | F | in | name_official |
| [05] | Mã số thuế | 세금번호 | F | in | tax_code |
| [06][07][08] | 세무 절차 대행 제공자 정보 | 세무 대행자 정보 | F | out | G7 확정 전 미생성 |
| [09][10][11a][11c] | 타 지방 지점·영업장 정보 | 지점 정보 | F | out | 1차 범위 밖 |
| [21] | Không phát sinh hoạt động mua, bán trong kỳ | 거래 없음 | F | in | 매입·매출 모두 없을 때만 X |
| [22] | Thuế GTGT còn được khấu trừ kỳ trước chuyển sang | 전기 이월 공제세액 | T | in | 직전 정기 신고 [43](보정 신고분 제외) |
| [23] | Giá trị hàng hóa, dịch vụ mua vào | 매입 가액 | V | in | 기간 내 매입 합계(국내) |
| [24] | Thuế GTGT của hàng hóa, dịch vụ mua vào | 매입세액 | T | in | [23] 대응 세액 |
| [23a][24a] | Trong đó: hàng hóa nhập khẩu | 수입분 | V,T | out | 수입 거래는 1차 범위 밖 |
| [25] | Thuế GTGT mua vào được khấu trừ kỳ này | 공제 매입세액 | T | in | [24] 중 공제 요건 충족분만. 요건 판정은 G6 확정 전 전문가 확인 플래그 |
| [26] | Bán ra không chịu thuế GTGT | 비과세 매출 | V | in | |
| [27] | Bán ra chịu thuế GTGT | 과세 매출 | V | calc | [29]+[30]+[32]+[32a]−[32b] |
| [28] | Thuế GTGT bán ra chịu thuế | 과세 매출세액 | T | calc | [31]+[33] |
| [29] | Bán ra thuế suất 0% | 0% 매출 | V | in | |
| [30][31] | Bán ra thuế suất 5% | 5% 매출·세액 | V,T | in | |
| [32][33] | Bán ra thuế suất 10% | 10% 매출·세액 | V,T | in | |
| [32a] | Hàng hóa, dịch vụ bán ra không kê khai, tính nộp thuế | 신고·납부 불요 매출 | V | exp | 2차 자료(einvoice.vn) 기준 · TT 89/2026/TT-BTC 부록 I 원문 대조 필요 |
| [32b] | Bán ra không tính vào giá tính thuế | 과세가액 불산입 | V | exp | 기본 0 |
| [34a] | Bán ra không thuộc phạm vi điều chỉnh của pháp luật thuế GTGT | 부가가치세법 적용 범위 외 매출 | V | exp | 기본 0 (NĐ181 제40조 2항 관련) |
| [34] | Tổng doanh thu bán ra | 총 매출 | V | calc | [26]+[27]+[34a] |
| [35] | Tổng thuế GTGT bán ra | 총 매출세액 | T | calc | [28] |
| [36] | Thuế GTGT phát sinh trong kỳ | 당기 발생 세액 | T | calc | [35]−[25] |
| [37] | Điều chỉnh giảm | 이월 공제세액 조정(감소) | T | exp | 사유 코드 필수(§6) |
| [38] | Điều chỉnh tăng | 이월 공제세액 조정(증가) | T | exp | 사유 코드 필수(§6) |
| [39a] | Thuế nhận bàn giao được khấu trừ | 인수 공제세액 | T | out | 1차 범위 밖 |
| [40a] | Thuế phải nộp của hoạt động SXKD | 납부세액(사업 활동) | T | calc | ([36]−[22]+[37]−[38]−[39a]) 가 0 이상일 때만 기재 |
| [40b] | Thuế mua vào của dự án đầu tư được bù trừ | 투자 프로젝트 상계 | T | out | 02/GTGT 연동, 항상 0 |
| [40] | Thuế còn phải nộp trong kỳ | 최종 납부세액 | T | calc | [40a]−[40b] |
| [41] | Thuế chưa khấu trừ hết kỳ này | 미공제 잔액 | T | calc | ([36]−[22]+[37]−[38]−[39a]) 가 0 이하일 때 양수로 기재 |
| [42] | Thuế đề nghị hoàn | 환급 요청액 | T | exp | [42]≤[41], 기본 0 |
| [43] | Thuế còn được khấu trừ chuyển kỳ sau | 차기 이월 공제세액 | T | calc | [41]−[42] → 다음 기간 [22] |

제약: [40]과 [41]은 둘 중 하나만 값을 가집니다. [40b]≤[40a]. [39a]는 P5에서 0 고정.

## 6. [37]·[38] 사유 코드 (TT89 01/GTGT 주석 4)
1. 후불·할부 5백만 VND 이상, 지급 시점에 비현금 증빙 없음 → [37](지급 의무 발생 기간). 이후 증빙 확보 시 [38].
2. 매입세액 오류·누락을 발견한 기간에 처리(세액 감소 또는 이월 증감만 영향, 보정 신고 불필요) → [37] 또는 [38].
3. 조정·대체 인보이스 수령(TT91/2026/TT-BTC 제10조 5항) → 수령 기간 [37] 또는 [38].
4. 공제→직접 방식 전환 → 전환 직전 마지막 기간 [37].
5. 기타(NĐ252 제12조, TT89 Phụ lục II) → 전문가 수기, 근거 조항 입력.
- 사유 코드 없는 [37]·[38] 입력은 저장 불가. 보정 신고가 필요한 오류(세액 증가 등)는 [37]·[38]이 아니라 amended 절차로 보냅니다.

## 7. 단위 테스트 값
- 산식 검증: [22]=15,000,000 / [25]=75,000,000 / [31]=5,000,000 / [33]=74,000,000 이면 [35]=79,000,000, [36]=4,000,000, [40a]=0, [41]=11,000,000, [43]=11,000,000. (MISA 예시를 산식 기준으로 재계산)
- 경계: 값이 0이면 [40a]=[40]=0을 기재하고 [41]=0. 두 값이 동시에 양수이면 오류.
- 기한: §3의 테스트 값.

## 8. 미확정·원문 대조 필요 (게이트 유지)
1. TT89 공보 PDF 대조(필드 코드·공식·주석). 대조 전 field_map 상태는 pending_verification.
2. NĐ144/2026(2026-05-05, NĐ181 개정)과 NĐ359/2025가 제21조에 미치는 영향. NĐ359는 농산물·환급 조건 중심으로 확인, 제21조 변경 여부는 미확인.
3. NĐ252 제9조 정확한 항·점 번호(분기 자격)와 제12조 원문.
4. 자발적 공제 방식 등록 절차와 서식.
5. 8% 감면(NĐ174/2025, 2026-12-31까지) 대상 거래: 매출은 [32]에 기재하고 감면은 별도 부록으로 처리한다는 2차 출처 설명이 있음. P5는 지원하지 않고 전문가 수기로 둡니다.
6. 02/GTGT·05/GTGT, 부록(01-2, 01-6, 01-8 등)은 1차 범위 밖.
7. [06]~[08]·서명란(세무 절차 대행 실무자 성명·자격증 번호)은 G7 확정 후 추가.
8. 매입세액 공제 요건 자동 판정은 G6 확정 전까지 [25]에 전문가 확인 플래그.

## 9. 제품 규칙 (P5 반영)
- `organizations.vat_method`(deduction | direct)와 `vat_method_basis`(revenue_ge_1bn | voluntary | new_company_estimated | below_1bn_direct), `method_locked_until`을 VNK 전문가만 설정. `verified_status='unverified'`로 시드.
- P5는 01/GTGT 초안만 생성. vat_method=direct인 조직은 초안 생성 비활성 + 「전문가 문의」 안내.
- 분기 자격과 방식 자격은 「신고 전 점검」에 경고로만 표시하고 자동 확정·자동 전환하지 않습니다. 문구는 「확인이 필요합니다」.
- 고객 문구: 「공제 방식」「직접 방식」 + 베트남어 병기(phương pháp khấu trừ / phương pháp tính trực tiếp).
- deadline_rules 시드는 §3로 하되 `unverified` 유지.

## 10. 출처
[1] Luật Thuế GTGT 48/2024/QH15 제10~12, 14, 16조 — https://thuvienphapluat.vn/van-ban/Thue-Phi-Le-Phi/Luat-Thue-gia-tri-gia-tang-2024-so-48-2024-QH15-556390.aspx
[2] NĐ181/2025/NĐ-CP 제21~26조 — https://thuvienphapluat.vn/van-ban/Thue-Phi-Le-Phi/Nghi-dinh-181-2025-ND-CP-huong-dan-Luat-Thue-gia-tri-gia-tang-646124.aspx
[3] TT89/2026/TT-BTC Phụ lục I, 01/GTGT 전문 — https://vnlawfirm.vn/bieu-mau/mau-to-khai-thue-gia-tri-gia-tang-theo-thong-tu-89/
[4] 01/GTGT 지표별 작성·이행 규정(QĐ 1934/QĐ-BTC, HTKK 5.7.9) — https://asp.misa.vn/tt/kien-thuc/to-khai-thue-gtgt/
[5] TT80 대비 변경점 — https://thuvienphapluat.vn/banan/tin-tuc/tai-to-khai-thue-gtgt-mau-so-01-gtgt-excel-theo-tt89-2026-download-to-khai-thue-gtgt-mau-01-gtgt-lu-52293.html
[6] 서식 목록(01/ĐK-TĐKTT 포함) — https://luatvietnam.vn/bieu-mau/tong-hop-bieu-mau-ve-ho-so-khai-thue-va-quan-ly-thue-tai-thong-tu-89-2026-tt-btc-571-110577-article.html
[7] NĐ252/2026 분기 자격 — https://thuvienphapluat.vn/ma-so-thue/phap-luat-thue/to-khai-thue-gtgt-quy-32026-thay-doi-nhung-gi-va-luu-y-ap-dung-nhu-the-nao-231608.html
[8] NĐ252/2026 기한 — https://thuvienphapluat.vn/phap-luat-doanh-nghiep/bai-viet/han-nop-to-khai-thue-quy-3-2026-thue-gtgt-thue-tncn-va-thue-tndn-23754.html
[9] NĐ252/2026 전문(공보, PDF 대조용) — https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-dinh-252-2026-nd-cp-huong-dan-thi-hanh-luat-quan-ly-thue-119260715155021635.htm

## 11. 추가 대조 기록 (2026-10-16, v2.1)
공보 PDF는 아직 대조하지 못했고, 아래는 2차 출처(thuvienphapluat.vn 해설, ketoananpha.vn)와의 부분 대조입니다. status는 pending_verification 유지.

| 지표 | 대조 결과 |
|---|---|
| [22] | 직전 "정식 신고서"의 [43] 사용, 수정 신고서 수치 사용 금지 — 일치 |
| [25] | 공제 요건을 갖춘 매입세액 합계 — 일치 |
| [32a] | 신고·납부 대상이 아닌 매출 — 일치 |
| [32b] | 부가세 과세표준에 포함하지 않는 가액 — 일치 |
| [34a] | 부가가치세법 적용 범위 밖 매출 — 일치 |
| [37] | 할부·지연 결제 매입 중 비현금 증빙 없는 부분을 의무 발생 기간에 차감 — 일치 |
| [38] | 이후 비현금 증빙을 갖춘 부분을 증빙 확보 기간에 가산 — 일치 |
| [39a] | 투자 프로젝트 소유자·타 납세자 인계, 지점 폐쇄·분할·합병 등으로 인한 미환급 공제세액 — 일치(P5 범위 밖, 0 고정) |
| [40b] | 02/GTGT의 [28a]+[28b]에 이미 신고한 부가세 합계 — 일치(P5 범위 밖, 0 고정) |
| [40], [43] | 명칭 일치 |
| [27][28][34][35][36][40a][40][41][42][43] | 첫 두 해설에는 수식이 없었으나, 독립된 2차 출처 2곳(ketoan.ags-vina.com, asp.misa.vn)이 §5 수식과 **전부 일치**하는 수식을 제시(v2.1 추가 대조). 둘 다 공보 원문 대조는 아님 → **공보 PDF 대조 필요는 유지** |

### NĐ144/2026/NĐ-CP 확인 결과
- 해설 문서 기준으로 NĐ181/2025 **제21조(방식 선택)를 개정한다는 언급은 없음**. 개정 대상은 제4조, 제9조 1항 b, 제23조 2항(특수 공제 사례), 제26조 2항 g(비현금 결제 증빙), 부록 I·II.
- 영향: §1·§6의 "5백만 VND 이상 비현금 증빙"은 NĐ181 제26조 2항 g가 NĐ144로 개정되었으므로 **개정 후 문구 확인 전까지 [37]/[38] 사유 코드 문구를 단정하지 않습니다**(expert_note 필수, 자동 판정 금지 — G6와 연동).
- 제21조 미개정은 해설 문서 부재 기반의 추정이므로 NĐ144 원문 대조 전까지 open item 유지.
