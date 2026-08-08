# STEP 2 Pilot 3,000 — Collection & Normalization Report

## 1. Category collection vs quota
- **Administrative**: 420 / 420
- **Immigration**: 360 / 360
- **Labor**: 360 / 360
- **Criminal**: 157 / 300
- **RealEstate**: 300 / 300
- **Tax**: 240 / 240
- **Company**: 240 / 240
- **Licensing**: 180 / 180
- **Civil**: 120 / 120
- **Commercial**: 120 / 120
- **Investment**: 120 / 120
- **Banking**: 120 / 120
- **Customs**: 120 / 120

### Shortfalls
- Criminal: 143건 부족

## 2. Spot checks (기존 4항 + 신규 5카테고리)
- **authorityWeight=100**: 145건
- **authorityWeight 분포**: {80: 2055, 90: 657, 100: 145}
- **빈 본문(원본 markdown empty)**: 327건 (11.4%)
- **빈 본문 by category**: {'Tax': 109, 'Company': 46, 'Administrative': 31, 'Banking': 25, 'Investment': 24, 'Licensing': 21, 'RealEstate': 18, 'Customs': 16, 'Labor': 13, 'Immigration': 10, 'Commercial': 6, 'Civil': 4, 'Criminal': 4}
- **청크 0개 문서**: 327건
- **단일 청크 / 다중 청크**: 669 / 1861 (총 청크 43335)
- **10만자+ 단일 청크 (주의)**:
  - ['130/2008/TT-BTC'] (thong_tu, 120456자, 1 chunks)
  - ['28/2004/TT-BTNMT'] (thong_tu, 119492자, 1 chunks)
- **10만자+ 다중 청크 샘플**:
  - ['Không số'] → 195 chunks (106342자)
  - ['58-L/CTN'] → 264 chunks (114711자)
  - ['12/2017/QH14'] → 12 chunks (264322자)
  - ['26/2008/QH12'] → 183 chunks (171636자)
  - ['13/2018/TT-NHNN'] → 74 chunks (115995자)

## 3. 신규 5개 카테고리 quota
- **Commercial**: 120 / 120
- **Civil**: 120 / 120
- **Investment**: 120 / 120
- **Banking**: 120 / 120
- **Customs**: 120 / 120

## 4. 핵심 법전 후보 포함 여부
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

## 5. Validation
- Input: 2857, Passed: 2857, Hard-fail: 0

## 6. Distributions
### status
- `active`: 1217
- `repealed`: 1155
- `amended`: 329
- `unknown`: 139
- `suspended`: 17
### authorityWeight
- 80: 2055
- 90: 657
- 100: 145
### category
- `Administrative`: 420
- `Labor`: 360
- `Immigration`: 360
- `RealEstate`: 300
- `Tax`: 240
- `Company`: 240
- `Licensing`: 180
- `Criminal`: 157
- `Commercial`: 120
- `Banking`: 120
- `Investment`: 120
- `Civil`: 120
- `Customs`: 120
### relationType (relatedDocuments)
- (none — tmquan corpus has no relatedDocuments edges)

## 7. Sample search queries
- **외국인 노동허가 요건** → 0건
- **giấy phép lao động người nước ngoài** → 5건
  - ['23/2017/TT-BLĐTBXH'] | score=15.0 keyword_all_terms | Hướng dẫn thực hiện cấp giấy phép lao động cho người lao độn
  - ['23/2017/TT-BLĐTBXH'] | score=15.0 keyword_all_terms | Hướng dẫn thực hiện cấp giấy phép lao động cho người lao độn
- **베트남 부동산 매매 시 외국인 제한** → 0건
- **quyền sử dụng đất người nước ngoài** → 0건
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
- **152/2020/NĐ-CP** → 3건
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
- **mở tài khoản ngân hàng người nước ngoài** → 0건
- **thủ tục hải quan nhập khẩu** → 5건
  - ['39/2018/TT-BTC'] | score=50.0 keyword_phrase | Sửa đổi, bổ sung một số điều tại của Bộ trưởng Bộ Tài chính 
  - ['39/2018/TT-BTC'] | score=50.0 keyword_phrase | Sửa đổi, bổ sung một số điều tại của Bộ trưởng Bộ Tài chính 

## 8. Document list (abbreviated — full list in JSON manifest)
- [Administrative] `11/2020/TT-BGTVT` — BGTVT Quy định mã số, tiêu chuẩn chức danh nghề nghiệp và xếp lương vi
- [Administrative] `14/2023/TT-BKHCN` — Ban hành Biểu mẫu hồ sơ thực hiện thủ tục hành chính quy định tại một 
- [Administrative] `06/2023/TT-BNV` — Ban hành Quy chế cập nhật, sử dụng, khai thác dữ liệu, thông tin của C
- [Administrative] `02/2020/TT-BGTVT` — Ban hành Định mức kinh tế - kỹ thuật tiêu hao nhiên liệu của phương ti
- [Administrative] `4/2023/TT-BNV` — Bãi bỏ của Bộ trưởng Bộ Nội vụ về việc hướng dẫn thực hiện xét nâng ng
- [Administrative] `07/TT` — Giải thích và hướng dẫn việc sắp xếp và sử dụng hợp lý lực lượng cán b
- [Administrative] `19/2023/TT-BYT` — HƯỚNG DẪN VỀ VỊ TRÍ VIỆC LÀM CÔNG CHỨC NGHIỆP VỤ CHUYÊN NGÀNH Y TẾ
- [Administrative] `34-TC/TNVT` — Hướng dẫn bù giá 6 mặt hàng bán theo định lượng với giá bán lẻ chỉ đạo
- [Administrative] `03-TC/TNVT` — Hướng dẫn bù giá dầu hoả thắp sáng cho cán bộ công nhân viên chức theo
- [Administrative] `29/2020/TT-BTTTT` — Hướng dẫn bổ nhiệm và xếp lương đối với chức danh nghề nghiệp viên chứ
- [Administrative] `30/2020/TT-BTTTT` — Hướng dẫn bổ nhiệm và xếp lương đối với chức danh nghề nghiệp viên chứ
- [Administrative] `01/2006/TT-BNV` — Hướng dẫn chi tiết việc giải quyết khiếu nại quyết định kỷ luật công c
- [Administrative] `152/2007/TT-BQP` — Hướng dẫn chuyển xếp lương đối với sỹ quan; công nhân viên chức quốc p
- [Administrative] `07/2005/TT-BQP` — Hướng dẫn chế độ nâng bậc lương đối với quân nhân chuyên nghiệp và côn
- [Administrative] `03/2009/TT-BNG` — Hướng dẫn dịch Quốc hiệu, tên các cơ quan, đơn vị và chức danh lãnh đạ
- [Administrative] `3/2023/TT-BNV` — Hướng dẫn một số quy định của của Chính phủ về đào tạo, bồi dưỡng cán 
- [Administrative] `03/2023/TT-BNV` — Hướng dẫn một số quy định của của Chính phủ về đào tạo, bồi dưỡng cán 
- [Administrative] `13/2019/TT-BNV` — Hướng dẫn một số quy định về cán bộ, công chức cấp xã và người hoạt độ
- [Administrative] `01/2018/TT-BNV` — Hướng dẫn một số điều của của Chính phủ về đào tạo, bồi dưỡng cán bộ, 
- [Administrative] `03/2006/TT-BNV` — Hướng dẫn thi hành một số điều của của Chính phủ về việc xử lý kỷ luật
- [Administrative] `6-LĐ/TT` — Hướng dẫn thi hành phụ cấp lương cho công nhân, viên chức ngành địa ch
- [Administrative] `06/2005/TT-BQP` — Hướng dẫn thực hiện chuyển xếp lương cũ sang lương mới đối với quân nh
- [Administrative] `03/2007/TT-BNV` — Hướng dẫn thực hiện chế độ kỷ luật công chức cấp xã
- [Administrative] `8/LĐTBXH-TT` — Hướng dẫn thực hiện chế độ nâng bậc lương năm 1991 đối với cán bộ, viê
- [Administrative] `24/2012/TT-BCA` — Hướng dẫn thực hiện chế độ phụ cấp công vụ trong Công an nhân dân
- [Administrative] `06/2005/TT-BNV` — Hướng dẫn thực hiện chế độ phụ cấp lưu động đối với cán bộ, công chức,
- [Administrative] `04/2005/TT-BNV` — Hướng dẫn thực hiện chế độ phụ cấp thâm niên vượt khung đối với cán bộ
- [Administrative] `05/2005/TT-BNV` — Hướng dẫn thực hiện chế độ phụ cấp trách nhiệm công việc đối với cán b
- [Administrative] `26/LĐTBXH-TT` — Hướng dẫn thực hiện chế độ phụ cấp độc hại phóng xạ đối với công chức,
- [Administrative] `07/2005/TT-BNV` — Hướng dẫn thực hiện chế độ phụ cấp độc hại, nguy hiểm đối với cán bộ, 
- [Administrative] `148/2010/TT-BQP` — Hướng dẫn thực hiện chế độ thôi việc đối với công chức trong Quân đội 
- [Administrative] `06/2007/TT-BNV` — Hướng dẫn thực hiện của Chính phủ sửa đổi, bổ sung một số điều của của
- [Administrative] `07/2007/TT-BNV` — Hướng dẫn thực hiện của Chính phủ sửa đổi, bổ sung một số điều của của
- [Administrative] `94/2006/TT-BTC` — Hướng dẫn thực hiện của Thủ tướng Chính phủ về việc ban hành Quy định 
- [Administrative] `06/2007/TT-BTP` — Hướng dẫn thực hiện một số thủ tục hành chính trong hoạt động thi hành
- [Administrative] `14/2008/TT-BQP` — Hướng dẫn thực hiện một số điều của của Chính phủ quy định trách nhiệm
- [Administrative] `04/2007/TT-BNV` — Hướng dẫn thực hiện một số điều của của Chính phủ và của Chính phủ sửa
- [Administrative] `130/2005/TT-BNV` — Hướng dẫn thực hiện một số điều của về chế độ thôi việc, chế độ bồi th
- [Administrative] `03/2008/TT-BNV` — Hướng dẫn thực hiện xét nâng ngạch không qua thi đối với cán bộ, công 
- [Administrative] `19/2009/TT-BQP` — Hướng dẫn thực hiện điều chỉnh mức lương tối thiểu chung đối với quân 
- [Administrative] `98/2006/TT-BTC` — Hướng dẫn việc bồi thường thiệt hại và xử lý kỷ luật đối với cán bộ, c
- [Administrative] `12/2019/TT-BLĐTBXH` — Hướng dẫn việc chuyển xếp lương chức danh nghề nghiệp viên chức chuyên
- [Administrative] `03/2016/TT-BNG` — Hướng dẫn việc cấp, gia hạn, sửa đổi, bổ sung hộ chiếu ngoại giao, hộ 
- [Administrative] `176/2005/TT-BQP` — Hướng dẫn việc giải quyết khiếu nại, tố cáo trong Quân đội
- [Administrative] `17/TT-NH3` — Hướng dẫn việc giải quyết khiếu nại, tố cáo trong ngành Ngân hàng
- [Administrative] `36/2018/TT-BTC` — Hướng dẫn việc lập dự toán, quản lý, sử dụng và quyết toán kinh phí dà
- [Administrative] `05/2007/TT-BLĐTBXH` — Hướng dẫn việc tính mức lương hưu đối với công chức, viên chức ngành h
- [Administrative] `13/TT-BNV` — Hướng dẫn việc xác định cơ cấu ngạch công chức
- [Administrative] `13/2022/TT-BNV` — Hướng dẫn việc xác định cơ cấu ngạch công chức
- [Administrative] `07/2006/TT-BNV` — Hướng dẫn việc xây dựng và thực hiện chỉ tiêu đào tạo, bồi dưỡng cán b
- … 외 2807건 (manifest JSON 참고)
