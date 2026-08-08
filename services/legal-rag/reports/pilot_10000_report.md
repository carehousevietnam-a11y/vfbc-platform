# STEP 2 Pilot 10,000 — Collection & Normalization Report

## 1. Category collection vs quota
- **Administrative**: 1517 / 1517
- **Immigration**: 661 / 1300
- **Labor**: 1062 / 1300
- **RealEstate**: 590 / 1083
- **Tax**: 867 / 867
- **Company**: 867 / 867
- **Licensing**: 650 / 650
- **Civil**: 255 / 433
- **Commercial**: 408 / 433
- **Investment**: 433 / 433
- **Banking**: 433 / 433
- **Customs**: 433 / 433
- **Criminal**: 151 / 250

### Shortfalls
- Immigration: 639건 부족
- Labor: 238건 부족
- RealEstate: 493건 부족
- Civil: 178건 부족
- Commercial: 25건 부족
- Criminal: 99건 부족 (의도적 — 필터 완화 없이 corpus 한도 존중)

- **수집 합계**: 8327 / 9999

**Immigration Option B**: 472 → **661** (+189 on-topic `quyet_dinh`, `biên giới` 단독 74건 제외). STEP 2 종료: `reports/STEP2_CLOSE.md`

## 2. Spot checks
- **authorityWeight=100**: 218건
- **authorityWeight 분포**: {60: 189, 80: 5926, 90: 1994, 100: 218}
- **빈 본문(원본 markdown empty)**: 500건 (6.0%)
- **빈 본문 by category**: {'Tax': 186, 'Administrative': 56, 'Company': 43, 'Licensing': 41, 'Investment': 34, 'RealEstate': 30, 'Banking': 29, 'Customs': 25, 'Immigration': 18, 'Labor': 16, 'Commercial': 12, 'Civil': 6, 'Criminal': 4}
- **청크 0개 문서**: 500건
- **단일 청크 / 다중 청크**: 1793 / 6034 (총 청크 108597)
- **10만자+ 단일 청크 (주의)**:
  - ['49/2009/TT-BTC'] (thong_tu, 172233자, 1 chunks, structure=prose_no_structure)
  - ['130/2008/TT-BTC'] (thong_tu, 120456자, 1 chunks, structure=section_headers_no_dieu)
  - ['129/2008/TT-BTC'] (thong_tu, 111370자, 1 chunks, structure=section_headers_no_dieu)
  - ['60/2007/TT-BTC'] (thong_tu, 182339자, 1 chunks, structure=section_headers_no_dieu)
  - ['32/2007/TT-BTC'] (thong_tu, 169257자, 1 chunks, structure=section_headers_no_dieu)
  - ['59/2007/TT-BTC'] (thong_tu, 145026자, 1 chunks, structure=muc_sections)
  - ['133/2004/TT-BTC'] (thong_tu, 112054자, 1 chunks, structure=section_headers_no_dieu)
  - ['20/2006/TT-BTC'] (thong_tu, 193648자, 1 chunks, structure=muc_sections)
  - ['120/2003/TT-BTC'] (thong_tu, 160144자, 1 chunks, structure=section_headers_no_dieu)
  - ['113/2005/TT-BTC'] (thong_tu, 113676자, 1 chunks, structure=muc_sections)
- **10만자+ 다중 청크 샘플**:
  - ['Không số'] → 195 chunks (106342자)
  - ['58-L/CTN'] → 264 chunks (114711자)
  - ['12/2017/QH14'] → 12 chunks (264322자)
  - ['26/2008/QH12'] → 183 chunks (171636자)
  - ['13/2018/TT-NHNN'] → 74 chunks (115995자)

## 3. 대형 단일 청크 구조 원인 파악 (수정 없음)
- **10만자+ 단일 청크 건수**: 16
- **구조 유형 분포**: {'section_headers_no_dieu': 7, 'muc_sections': 6, 'prose_no_structure': 3}
- **비고**: 수정하지 않음 — 원인 파악 + 건수 집계만. 단일 청크는 주로 Điều 마커 부재(Thông tư 숫자목록/Mục/산문)에서 발생.

### 3,000건에서 관측된 Thông tư 2건 재확인
- **['130/2008/TT-BTC']** — Hướng dẫn thi hành một số điều của Luật thuế thu nhập doanh nghiệp số và hướng dẫn thi hành của Chín (120456자, chunks=1)
  - structure_type: `section_headers_no_dieu`
  - marker counts: {'dieu': 0, 'muc': 0, 'chuong': 0, 'phan': 9, 'numbered_1_2': 0, 'roman_section_headers': 0}
  - why: parse_document_structure는 Điều 마커가 없으면 문서 전체를 1개 chunk로 반환함
  - sample lines:
    - `THÔNG TƯ Hướng dẫn thi hành một số điều của Luật Thuế thu nhập doanh nghiệp số 14/2008/QH12 và hướng`
    - `Phần C CĂN CỨ TÍNH THUẾ THU NHẬP DOANH NGHIỆP I. THU NHẬP TÍNH THUẾ Thu nhập tính thuế trong kỳ tính`
    - `Phần C Thông tư này. - Thu nhập được miễn thuế đối với các doanh nghiệp tại điểm này phải đáp ứng đủ`
    - `Phần D NƠI NỘP THUẾ 1. Nguyên tắc xác định Doanh nghiệp nộp thuế tại nơi có trụ sở chính. Trường hợp`
    - `Phần II Tờ khai số 09/TNDN. Khi bàn giao bất động sản, doanh nghiệp phải quyết tóan chính thức thuế `
    - `Phần I Tờ khai số 09/TNDN. 5. Trường hợp tổ chức tín dụng nhận giá trị bất động sản là tài sản bảo đ`
    - `Phần C Thông tư này. b) Thu nhập từ họat động tìm kiếm, thăm dò, khai thác dầu khí và tài nguyên quí`
    - `Phần C Thông tư này nếu hạch tóan riêng được. Các đơn vị sự nghiệp, cơ quan văn phòng thuộc các Tổng`
- **['28/2004/TT-BTNMT']** — Về việc hướng dẫn thực hiện thống kê, kiểm kê đất đai và xây dựng bản đồ hiện trạng sử dụng đất (119492자, chunks=1)
  - structure_type: `prose_no_structure`
  - marker counts: {'dieu': 0, 'muc': 0, 'chuong': 0, 'phan': 0, 'numbered_1_2': 0, 'roman_section_headers': 0}
  - why: parse_document_structure는 Điều 마커가 없으면 문서 전체를 1개 chunk로 반환함
  - sample lines:
    - `THÔNG TƯ Về việc hướng dẫn thực hiện thống kê, kiểm kê đất đai và xây dựng bản đồ hiện trạng sử dụng`

## 4. 신규 5개 카테고리 quota
- **Commercial**: 408 / 433
- **Civil**: 255 / 433
- **Banking**: 433 / 433
- **Investment**: 433 / 433
- **Customs**: 433 / 433

## 5. 핵심 법전 후보 포함 여부
- **Civil** (Bộ luật Dân sự)
  - 후보 doc_number: ['91/2015/QH13']
  - pilot 포함: ['91/2015/QH13']
  - ✓ `['91/2015/QH13']` — Bộ luật Dân sự số
- **Commercial** (Luật Thương mại)
  - 후보 doc_number: ['36/2005/QH11']
  - pilot 포함: ['36/2005/QH11']
  - ✓ `['36/2005/QH11']` — Luật Thương mại số
- **Investment** (Luật Đầu tư)
  - 후보 doc_number: ['61/2020/QH14']
  - pilot 포함: ['61/2020/QH14']
  - ✓ `['61/2020/QH14']` — Luật đầu tư số
- **Banking** (Luật Các tổ chức tín dụng)
  - 후보 doc_number: ['32/2024/QH15', '47/2010/QH12']
  - pilot 포함: ['32/2024/QH15', '47/2010/QH12']
  - ✓ `['32/2024/QH15']` — Luật Các tổ chức tín dụng số
  - ✓ `['47/2010/QH12']` — Luật Các tổ chức tín dụng số
- **Customs** (Luật Hải quan)
  - 후보 doc_number: ['54/2014/QH13']
  - pilot 포함: ['54/2014/QH13']
  - ✓ `['54/2014/QH13']` — LUẬT HẢI QUAN SỐ 54/2014/QH13

## 6. Validation
- Input: 8327, Passed: 8327, Hard-fail: 0

## 7. Distributions
### status
- `active`: 3737
- `repealed`: 3426
- `amended`: 843
- `unknown`: 290
- `suspended`: 31
### authorityWeight
- 60: 189
- 80: 5926
- 90: 1994
- 100: 218
### category
- `Administrative`: 1517
- `Labor`: 1062
- `Tax`: 867
- `Company`: 867
- `Immigration`: 661
- `Licensing`: 650
- `RealEstate`: 590
- `Banking`: 433
- `Investment`: 433
- `Customs`: 433
- `Commercial`: 408
- `Civil`: 255
- `Criminal`: 151
### relationType (relatedDocuments)
- (none — tmquan corpus has no relatedDocuments edges)

## 8. Sample search queries
- **외국인 노동허가 요건** → 0건
- **giấy phép lao động người nước ngoài** → 5건
  - ['23/2017/TT-BLĐTBXH'] | score=15.0 keyword_all_terms | Hướng dẫn thực hiện cấp giấy phép lao động cho người lao độn
  - ['23/2017/TT-BLĐTBXH'] | score=15.0 keyword_all_terms | Hướng dẫn thực hiện cấp giấy phép lao động cho người lao độn
- **베트남 부동산 매매 시 외국인 제한** → 0건
- **quyền sử dụng đất người nước ngoài** → 3건
  - ['29/2001/QĐ-BXD'] | score=15.0 keyword_all_terms | Về việc quy định mẫu hợp đồng mua bán nhà ở và mẫu đơn đề ng
  - ['29/2001/QĐ-BXD'] | score=15.0 keyword_all_terms | Về việc quy định mẫu hợp đồng mua bán nhà ở và mẫu đơn đề ng
- **사기 계약 관련 hình sự** → 0건
- **lừa đảo chiếm đoạt tài sản** → 0건
- **đăng ký doanh nghiệp** → 5건
  - ['01/2021/NĐ-CP'] | score=75.0 keyword_phrase | Về đăng ký doanh nghiệp
  - ['01/2021/NĐ-CP'] | score=75.0 keyword_phrase | Về đăng ký doanh nghiệp
- **thuế giá trị gia tăng** → 5건
  - ['13/2008/QH12'] | score=75.0 keyword_phrase | Luật Thuế giá trị gia tăng số
  - ['13/2008/QH12'] | score=75.0 keyword_phrase | Luật Thuế giá trị gia tăng số
- **thủ tục hành chính** → 5건
  - ['45/2020/NĐ-CP'] | score=75.0 keyword_phrase | Về thực hiện thủ tục hành chính trên môi trường điện tử
  - ['45/2020/NĐ-CP'] | score=75.0 keyword_phrase | Về thực hiện thủ tục hành chính trên môi trường điện tử
- **152/2020/NĐ-CP** → 5건
  - ['152/2020/NĐ-CP'] | score=100.0 exact_document_number | Quy định về người lao động nước ngoài làm việc tại Việt Nam 
  - ['70/2023/NĐ-CP'] | score=30.0 keyword_prefix | Sửa đổi, bổ sung một số điều của của Chính phủ quy định về n
- **계약 위반 손해배상** → 0건
- **bồi thường thiệt hại hợp đồng** → 5건
  - ['Không số'] | score=10.0 keyword_all_terms | Bộ luật Lao động số Không số
  - ['Không số'] | score=10.0 keyword_all_terms | Bộ luật Lao động số Không số
- **hợp đồng thương mại** → 5건
  - ['58-L/CTN'] | score=50.0 keyword_phrase | Luật Thương mại số
  - ['58-L/CTN'] | score=50.0 keyword_phrase | Luật Thương mại số
- **은행 계좌 개설 외국인** → 0건
- **mở tài khoản ngân hàng người nước ngoài** → 0건 **← Banking 질의**
- **thủ tục hải quan nhập khẩu** → 5건
  - ['39/2018/TT-BTC'] | score=50.0 keyword_phrase | Sửa đổi, bổ sung một số điều tại của Bộ trưởng Bộ Tài chính 
  - ['39/2018/TT-BTC'] | score=50.0 keyword_phrase | Sửa đổi, bổ sung một số điều tại của Bộ trưởng Bộ Tài chính 

## 9. Document list (abbreviated — full list in JSON manifest)
- [Administrative] `31/2004/TT-BTC` — 2004/TT-BTC Hướng dẫn thực hiện của Chính phủ quy định xử phạt vi phạm
- [Administrative] `40/2016/TT-BCT` — BAN HÀNH HỆ THỐNG CHỈ TIÊU THỐNG KÊ NGÀNH CÔNG THƯƠNG
- [Administrative] `11/2020/TT-BGTVT` — BGTVT Quy định mã số, tiêu chuẩn chức danh nghề nghiệp và xếp lương vi
- [Administrative] `22/2011/TT-BNNPTNT` — BNNPTNT Sửa đổi, bổ sung một số quy định về thủ tục hành chính trong l
- [Administrative] `21/2011/TT-BNNPTNT` — BNNPTNT Sửa đổi, bổ sung một số quy định về thủ tục hành chính trong l
- [Administrative] `18/2011/TT-BNNPTNT` — BNNPTNT Sửa đổi, bổ sung, bãi bỏ một số quy định về thủ tục hành chính
- [Administrative] `19/2011/TT-BNNPTNT` — BNNPTNT Sửa đổi, bổ sung, bãi bỏ một số quy định về thủ tục hành chính
- [Administrative] `17/2011/TT-BNNPTNT` — BNNPTNT Sửa đổi, bổ sung, bãi bỏ một số quy định về thủ tục hành chính
- [Administrative] `118/2004/TT-BTC` — BTC quy định chế độ công tác phí, chế độ chi hội nghị đối với các cơ q
- [Administrative] `14/2023/TT-BKHCN` — Ban hành Biểu mẫu hồ sơ thực hiện thủ tục hành chính quy định tại một 
- [Administrative] `13/2021/TT-BLĐTBXH` — Ban hành Bộ chỉ tiêu thống kê về tình hình trẻ em và tình hình xâm hại
- [Administrative] `001/2025/TT-BNV` — Ban hành Nội quy và Quy chế tuyển dụng, nâng ngạch, xét thăng hạng côn
- [Administrative] `28/2024/TT-BTNMT` — Ban hành Quy chuẩn kỹ thuật quốc gia về bản đồ hành chính
- [Administrative] `29/2023/TT-BTNMT` — Ban hành Quy chuẩn kỹ thuật quốc gia về bản đồ hành chính
- [Administrative] `06/2023/TT-BNV` — Ban hành Quy chế cập nhật, sử dụng, khai thác dữ liệu, thông tin của C
- [Administrative] `17/2014/TT-BGDĐT` — Ban hành Quy chế quản lý việc ra nước ngoài của cán bộ, công chức và v
- [Administrative] `16/2012/TT-BNV` — Ban hành Quy chế thi tuyển, xét tuyển viên chức; Quy chế tổ chức thi t
- [Administrative] `06/2020/TT-BNV` — Ban hành Quy chế tổ chức thi tuyển, xét tuyển công chức, viên chức, th
- [Administrative] `11/2012/TT-BTP` — Ban hành Quy tắc đạo đức hành nghề công chứng
- [Administrative] `119-CP` — Ban hành Quy định về việc quản lý, sử dụng hồ sơ địa giới, bản đồ địa 
- [Administrative] `85/CP` — Ban hành Quy định về xử phạt vi phạm hành chính trong lĩnh vực quản lý
- [Administrative] `05/2009/TT-BNV` — Ban hành chức danh và mã số các ngạch viên chức kiểm định kỹ thuật an 
- [Administrative] `08/2010/TT-BNV` — Ban hành chức danh, mã số các ngạch viên chức công tác xã hội
- [Administrative] `12/2011/TT-BNV` — Ban hành chức danh, mã số các ngạch viên chức dân số
- [Administrative] `10/2011/TT-BNV` — Ban hành chức danh, mã số các ngạch viên chức dân số
- [Administrative] `06/2011/TT-BNV` — Ban hành chức danh, mã số các ngạch viên chức hộ sinh
- [Administrative] `09/2009/TT-BNV` — Ban hành chức danh, mã số các ngạch viên chức kỹ thuật y học
- [Administrative] `05/2011/TT-BKHCN` — Ban hành mẫu văn bản sử dụng trong hoạt động thanh tra, xử lý vi phạm 
- [Administrative] `16/2014/TT-BVHTTDL` — Ban hành một số Biểu mẫu thủ tục hành chính trong lĩnh vực thể dục, th
- [Administrative] `162/2004/NĐ-CP` — Ban hành quy chế tạm giữ người theo thủ tục hành chính
- [Administrative] `14-CP` — Ban hành quy định về xử phạt vi phạm hành chính trong lĩnh vực quản lý
- [Administrative] `09/2010/TT-BNV` — Ban hành tiêu chuẩn nghiệp vụ các ngạch công chức chuyên ngành kế toán
- [Administrative] `18/2009/TT-BLĐTBXH` — Ban hành tiêu chuẩn nghiệp vụ các ngạch viên chức kiểm định kỹ thuật a
- [Administrative] `23/2009/TT-BYT` — Ban hành tiêu chuẩn nghiệp vụ các ngạch viên chức kỹ thuật y học
- [Administrative] `01/2013/TT-BNV` — Ban hành và hướng dẫn sử dụng biểu mẫu về thủ tục hành chính trong lĩn
- [Administrative] `56/2017/TT-BTNMT` — Ban hành Định mức kinh tế - kỹ thuật thành lập bản đồ hành chính các c
- [Administrative] `02/2020/TT-BGTVT` — Ban hành Định mức kinh tế - kỹ thuật tiêu hao nhiên liệu của phương ti
- [Administrative] `68/2023/TT-BTC` — Bãi bỏ 04 Thông tư do Bộ trưởng Bộ Tài chính ban hành liên quan đến vi
- [Administrative] `45/2023/TT-BTC` — Bãi bỏ các của Bộ Tài chính - Bộ Giáo dục và Đào tạo hướng dẫn thực hi
- [Administrative] `73/2021/TT-BTC` — Bãi bỏ của Bộ Tài chính và Bộ Y tế hướng dẫn nội dung thu, chi và mức 
- [Administrative] `28/2022/TT-BTC` — Bãi bỏ của Bộ Tài chính, Bộ Nội vụ quy định việc quản lý, sử dụng, quy
- [Administrative] `4/2023/TT-BNV` — Bãi bỏ của Bộ trưởng Bộ Nội vụ về việc hướng dẫn thực hiện xét nâng ng
- [Administrative] `26/2024/TT-BTC` — Bãi bỏ của Bộ trưởng Bộ Tài chính hướng dẫn lập dự toán, quản lý, sử d
- [Administrative] `58/2023/TT-BTC` — Bãi bỏ của Bộ trưởng Bộ Tài chính quy định quản lý và sử dụng kinh phí
- [Administrative] `46/2023/TT-BTC` — Bãi bỏ của Bộ trưởng Bộ Tài chính quy định việc quản lý và sử dụng kin
- [Administrative] `100/2022/NĐ-CP` — Bãi bỏ của Thủ tướng Chính phủ quy định danh mục các quyết định hành c
- [Administrative] `22/2023/TT-BTC` — Bãi bỏ hướng dẫn quản lý, sử dụng kinh phí hỗ trợ từ ngân sách nhà nướ
- [Administrative] `12/2018/TT-BNV` — Bãi bỏ một số văn bản quy phạm pháp luật do Bộ trưởng Bộ Nội vụ ban hà
- [Administrative] `12/2024/TT-BTP` — Bãi bỏ một số điều, khoản của các Thông tư do Bộ trưởng Bộ Tư pháp ban
- [Administrative] `06/2013/TT-BNV` — Bãi bỏ Điều 19 của Bộ Nội vụ quy định chi tiết một số điều về tuyển dụ
- … 외 8277건 (manifest JSON 참고)
