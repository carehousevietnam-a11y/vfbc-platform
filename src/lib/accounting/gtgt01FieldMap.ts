/** G2_VAT_FORM_PACK.md §5 — 01/GTGT (TT89) field_map (out 필드 제외). */

export type GtgtFieldKind = "in" | "calc" | "exp";
export type GtgtColumn = "V" | "T" | "F";

export type GtgtFieldMapEntry = {
  code: string;
  label_ko: string;
  label_vi: string;
  column: GtgtColumn;
  kind: GtgtFieldKind;
  formula?: string;
};

export const GTGT01_TT89_FIELD_MAP: { pack_version: string; fields: GtgtFieldMapEntry[] } = {
  pack_version: "2.1",
  fields: [
    { code: "01a", label_ko: "사업 활동 구분", label_vi: "Tên hoạt động sản xuất kinh doanh", column: "F", kind: "in" },
    { code: "01b", label_ko: "신고 기간", label_vi: "Kỳ tính thuế (Tháng/Quý)", column: "F", kind: "in" },
    { code: "02", label_ko: "최초 신고", label_vi: "Lần đầu", column: "F", kind: "in" },
    { code: "03", label_ko: "보정 신고 차수", label_vi: "Bổ sung lần thứ", column: "F", kind: "in" },
    { code: "04", label_ko: "납세자명", label_vi: "Tên người nộp thuế", column: "F", kind: "in" },
    { code: "05", label_ko: "세금번호", label_vi: "Mã số thuế", column: "F", kind: "in" },
    { code: "21", label_ko: "거래 없음", label_vi: "Không phát sinh hoạt động mua, bán trong kỳ", column: "F", kind: "in" },
    {
      code: "22",
      label_ko: "전기 이월 공제세액",
      label_vi: "Thuế GTGT còn được khấu trừ kỳ trước chuyển sang",
      column: "T",
      kind: "in",
      formula: "prior[43]",
    },
    {
      code: "23",
      label_ko: "매입 가액",
      label_vi: "Giá trị hàng hóa, dịch vụ mua vào",
      column: "V",
      kind: "in",
    },
    {
      code: "24",
      label_ko: "매입세액",
      label_vi: "Thuế GTGT của hàng hóa, dịch vụ mua vào",
      column: "T",
      kind: "in",
    },
    {
      code: "25",
      label_ko: "공제 매입세액",
      label_vi: "Thuế GTGT mua vào được khấu trừ kỳ này",
      column: "T",
      kind: "in",
    },
    {
      code: "26",
      label_ko: "비과세 매출",
      label_vi: "Bán ra không chịu thuế GTGT",
      column: "V",
      kind: "in",
    },
    {
      code: "27",
      label_ko: "과세 매출",
      label_vi: "Bán ra chịu thuế GTGT",
      column: "V",
      kind: "calc",
      formula: "[29]+[30]+[32]+[32a]-[32b]",
    },
    {
      code: "28",
      label_ko: "과세 매출세액",
      label_vi: "Thuế GTGT bán ra chịu thuế",
      column: "T",
      kind: "calc",
      formula: "[31]+[33]",
    },
    {
      code: "29",
      label_ko: "0% 매출",
      label_vi: "Bán ra thuế suất 0%",
      column: "V",
      kind: "in",
    },
    { code: "30", label_ko: "5% 매출", label_vi: "Bán ra thuế suất 5%", column: "V", kind: "in" },
    { code: "31", label_ko: "5% 매출세액", label_vi: "Thuế GTGT bán ra 5%", column: "T", kind: "in" },
    { code: "32", label_ko: "10% 매출", label_vi: "Bán ra thuế suất 10%", column: "V", kind: "in" },
    { code: "33", label_ko: "10% 매출세액", label_vi: "Thuế GTGT bán ra 10%", column: "T", kind: "in" },
    {
      code: "32a",
      label_ko: "신고·납부 불요 매출",
      label_vi: "Bán ra không kê khai tính nộp thuế",
      column: "V",
      kind: "exp",
    },
    {
      code: "32b",
      label_ko: "과세가액 불산입",
      label_vi: "Bán ra không tính vào giá tính thuế",
      column: "V",
      kind: "exp",
    },
    {
      code: "34a",
      label_ko: "부가가치세법 적용 범위 외 매출",
      label_vi: "Bán ra không thuộc phạm vi điều chỉnh của pháp luật thuế GTGT",
      column: "V",
      kind: "exp",
    },
    {
      code: "34",
      label_ko: "총 매출",
      label_vi: "Tổng doanh thu bán ra",
      column: "V",
      kind: "calc",
      formula: "[26]+[27]+[34a]",
    },
    {
      code: "35",
      label_ko: "총 매출세액",
      label_vi: "Tổng thuế GTGT bán ra",
      column: "T",
      kind: "calc",
      formula: "[28]",
    },
    {
      code: "36",
      label_ko: "당기 발생 세액",
      label_vi: "Thuế GTGT phát sinh trong kỳ",
      column: "T",
      kind: "calc",
      formula: "[35]-[25]",
    },
    {
      code: "37",
      label_ko: "이월 공제세액 조정(감소)",
      label_vi: "Điều chỉnh giảm",
      column: "T",
      kind: "exp",
    },
    {
      code: "38",
      label_ko: "이월 공제세액 조정(증가)",
      label_vi: "Điều chỉnh tăng",
      column: "T",
      kind: "exp",
    },
    {
      code: "40a",
      label_ko: "납부세액(사업 활동)",
      label_vi: "Thuế phải nộp của hoạt động SXKD",
      column: "T",
      kind: "calc",
      formula: "max(0,[36]-[22]+[37]-[38])",
    },
    {
      code: "40",
      label_ko: "최종 납부세액",
      label_vi: "Thuế còn phải nộp trong kỳ",
      column: "T",
      kind: "calc",
      formula: "[40a]",
    },
    {
      code: "41",
      label_ko: "미공제 잔액",
      label_vi: "Thuế chưa khấu trừ hết kỳ này",
      column: "T",
      kind: "calc",
      formula: "max(0,-([36]-[22]+[37]-[38]))",
    },
    {
      code: "42",
      label_ko: "환급 요청액",
      label_vi: "Thuế đề nghị hoàn",
      column: "T",
      kind: "exp",
    },
    {
      code: "43",
      label_ko: "차기 이월 공제세액",
      label_vi: "Thuế còn được khấu trừ chuyển kỳ sau",
      column: "T",
      kind: "calc",
      formula: "[41]-[42]",
    },
  ],
};
