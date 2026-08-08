# STEP 2 Pilot 1,000 — Collection & Normalization Report

## 1. Category collection vs quota
- **Administrative**: 175 / 175
- **Immigration**: 150 / 150
- **Labor**: 150 / 150
- **Criminal**: 125 / 125
- **RealEstate**: 125 / 125
- **Tax**: 100 / 100
- **Company**: 100 / 100
- **Licensing**: 75 / 75

## 2. Spot checks (200건 리뷰 재발 방지)
- **authorityWeight=100**: 75건
- **authorityWeight 분포**: {80: 636, 90: 289, 100: 75}
- **빈 본문(원본 markdown empty)**: 116건 (11.6%)
- **빈 본문 by category**: {'Tax': 29, 'Company': 28, 'Administrative': 21, 'RealEstate': 14, 'Licensing': 8, 'Labor': 7, 'Immigration': 7, 'Criminal': 2}
- **청크 0개 문서**: 116건
- **단일 청크 / 다중 청크**: 256 / 628 (총 청크 16988)
- **10만자+ 단일 청크**: 없음
- **10만자+ 다중 청크 샘플**:
  - ['Không số'] → 195 chunks (106342자)
  - ['12/2017/QH14'] → 12 chunks (264322자)
  - ['155/2018/NĐ-CP'] → 158 chunks (137781자)
  - ['38/2019/QH14'] → 152 chunks (200589자)
  - ['45/2019/QH14'] → 222 chunks (189433자)

## 3. Validation
- Input: 1000, Passed: 1000, Hard-fail: 0

## 4. Distributions
### status
- `active`: 447
- `repealed`: 400
- `amended`: 98
- `unknown`: 50
- `suspended`: 5
### authorityWeight
- 80: 636
- 90: 289
- 100: 75
### category
- `Administrative`: 175
- `Labor`: 150
- `Immigration`: 150
- `Criminal`: 125
- `RealEstate`: 125
- `Tax`: 100
- `Company`: 100
- `Licensing`: 75
### relationType (relatedDocuments)
- (none — tmquan corpus has no relatedDocuments edges)

## 5. Sample search queries (10)
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

## 6. Document list (abbreviated — full list in JSON manifest)
- [Administrative] `34-TC/TNVT` — Hướng dẫn bù giá 6 mặt hàng bán theo định lượng với giá bán lẻ chỉ đạo
- [Administrative] `03-TC/TNVT` — Hướng dẫn bù giá dầu hoả thắp sáng cho cán bộ công nhân viên chức theo
- [Administrative] `152/2007/TT-BQP` — Hướng dẫn chuyển xếp lương đối với sỹ quan; công nhân viên chức quốc p
- [Administrative] `03/2009/TT-BNG` — Hướng dẫn dịch Quốc hiệu, tên các cơ quan, đơn vị và chức danh lãnh đạ
- [Administrative] `13/2019/TT-BNV` — Hướng dẫn một số quy định về cán bộ, công chức cấp xã và người hoạt độ
- [Administrative] `01/2018/TT-BNV` — Hướng dẫn một số điều của của Chính phủ về đào tạo, bồi dưỡng cán bộ, 
- [Administrative] `03/2007/TT-BNV` — Hướng dẫn thực hiện chế độ kỷ luật công chức cấp xã
- [Administrative] `8/LĐTBXH-TT` — Hướng dẫn thực hiện chế độ nâng bậc lương năm 1991 đối với cán bộ, viê
- [Administrative] `26/LĐTBXH-TT` — Hướng dẫn thực hiện chế độ phụ cấp độc hại phóng xạ đối với công chức,
- [Administrative] `06/2007/TT-BNV` — Hướng dẫn thực hiện của Chính phủ sửa đổi, bổ sung một số điều của của
- [Administrative] `07/2007/TT-BNV` — Hướng dẫn thực hiện của Chính phủ sửa đổi, bổ sung một số điều của của
- [Administrative] `06/2007/TT-BTP` — Hướng dẫn thực hiện một số thủ tục hành chính trong hoạt động thi hành
- [Administrative] `14/2008/TT-BQP` — Hướng dẫn thực hiện một số điều của của Chính phủ quy định trách nhiệm
- [Administrative] `04/2007/TT-BNV` — Hướng dẫn thực hiện một số điều của của Chính phủ và của Chính phủ sửa
- [Administrative] `03/2008/TT-BNV` — Hướng dẫn thực hiện xét nâng ngạch không qua thi đối với cán bộ, công 
- [Administrative] `19/2009/TT-BQP` — Hướng dẫn thực hiện điều chỉnh mức lương tối thiểu chung đối với quân 
- [Administrative] `12/2019/TT-BLĐTBXH` — Hướng dẫn việc chuyển xếp lương chức danh nghề nghiệp viên chức chuyên
- [Administrative] `03/2016/TT-BNG` — Hướng dẫn việc cấp, gia hạn, sửa đổi, bổ sung hộ chiếu ngoại giao, hộ 
- [Administrative] `17/TT-NH3` — Hướng dẫn việc giải quyết khiếu nại, tố cáo trong ngành Ngân hàng
- [Administrative] `36/2018/TT-BTC` — Hướng dẫn việc lập dự toán, quản lý, sử dụng và quyết toán kinh phí dà
- [Administrative] `10/2019/TT-BNV` — Hướng dẫn việc xếp lương đối với các ngạch công chức chuyên ngành văn 
- [Administrative] `19/2007/TT-BTC` — Hướng dẫn về quản lý, xử lý tang vật, phương tiện hết thời hạn tạm giữ
- [Administrative] `06-LĐ/TT` — Hướng dẫn về thời giờ làm việc của công nhân, viên chức
- [Administrative] `151/2015/TT-BTC` — Hướng dẫn vỉệc quản lý, sử dụng và quyết toán kỉnh phí bảo đảm thực hi
- [Administrative] `64/2025/QH15` — Luật Ban hành văn bản quy phạm pháp luật số
- [Administrative] `22/2008/QH12` — Luật Cán bộ, công chức số
- [Administrative] `36/2018/QH14` — Luật Phòng, chống tham nhũng số
- [Administrative] `63/2010/QH12` — Luật Sửa đổi, bổ sung một số điều của Luật Bầu cử đại biểu Quốc hội và
- [Administrative] `104/2016/QH13` — Luật Tiếp cận thông tin số
- [Administrative] `25/2018/QH14` — Luật Tố cáo số
- [Administrative] `46/2018/TT-BTC` — Quy định chi tiết chi phí thực tế để in, sao, chụp và gửi thông tin qu
- [Administrative] `1680/2009/TT-TTCP` — Quy định chi tiết danh mục vị trí công tác thanh tra của cán bộ, công 
- [Administrative] `115/2015/NĐ-CP` — Quy định chi tiết một số điều của Luật Bảo hiểm xã hội về bảo hiểm xã 
- [Administrative] `118/2021/NĐ-CP` — Quy định chi tiết một số điều và biện pháp thi hành Luật Xử lý vi phạm
- [Administrative] `31/2019/NĐ-CP` — Quy định chi tiết một số điều và biện pháp tổ chức thi hành Luật Tố cá
- [Administrative] `13/2018/NĐ-CP` — Quy định chi tiết và biện pháp thi hành Luật tiếp cận thông tin
- [Administrative] `21/2009/NĐ-CP` — Quy định chi tiết và hướng dẫn thi hành một số điều của Luật sĩ quan Q
- [Administrative] `25/2019/TT-BQP` — Quy định chế độ bồi dưỡng đối với các đối tượng trong Quân đội làm nhi
- [Administrative] `320/2016/TT-BTC` — Quy định chế độ bồi dưỡng đối với người làm nhiệm vụ tiếp công dân, xử
- [Administrative] `9/TC-HCVX` — Quy định chế độ công tác phí cho công nhân viên chức Nhà nước đi công 
- [Administrative] `48-TC/HCVX` — Quy định chế độ công tác phí cho công nhân viên chức Nhà nước đi công 
- [Administrative] `09-BTC/HCVX` — Quy định chế độ công tác phí cho công nhân, viên chức Nhà nước đi công
- [Administrative] `113/2016/TT-BQP` — Quy định chế độ nghỉ của quân nhân chuyên nghiệp, công nhân và viên ch
- [Administrative] `05-TC/HCVX` — Quy định chế độ phụ cấp cho cán bộ, công nhân, viên chức Nhà nước đi c
- [Administrative] `114/2007/NĐ-CP` — Quy định chế độ phụ cấp đối với cán bộ, viên chức làm việc tại các cơ 
- [Administrative] `157/2007/NĐ-CP` — Quy định chế độ trách nhiệm đối với người đứng đầu cơ quan, tổ chức, đ
- [Administrative] `03/2017/TT-BTP` — Quy định chức danh, mã số ngạch và tiêu chuẩn nghiệp vụ các ngạch công
- [Administrative] `12/2019/TT-NHNN` — Quy định chức danh, mã số ngạch, tiêu chuẩn nghiệp vụ và cách xếp lươn
- [Administrative] `53-CP` — Quy định các biện pháp xử lý đối với cán bộ, viên chức Nhà nước và nhữ
- [Administrative] `170/2016/TT-BQP` — Quy định cấp bậc quân hàm quân nhân chuyên nghiệp tương ứng với mức lư
- … 외 950건 (manifest JSON 참고)
