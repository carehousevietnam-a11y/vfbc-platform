/** G2_VAT_FORM_PACK.md §6 — [37]·[38] 사유 코드 (문구 그대로) */
export const GTGT_ADJUSTMENT_REASON_CODES = [
  {
    id: "1",
    ko:
      "후불·할부 5백만 VND 이상, 지급 시점에 비현금 증빙 없음 → [37](지급 의무 발생 기간). 이후 증빙 확보 시 [38].",
    vi:
      "Trả chậm/trả góp từ 5 triệu VND, không có chứng từ phi tiền mặt khi thanh toán → [37]. Sau khi có chứng từ → [38].",
  },
  {
    id: "2",
    ko: "매입세액 오류·누락을 발견한 기간에 처리(세액 감소 또는 이월 증감만 영향, 보정 신고 불필요) → [37] 또는 [38].",
    vi: "Phát hiện sai/thiếu thuế mua vào trong kỳ xử lý (chỉ ảnh hưởng giảm hoặc điều chỉnh chuyển kỳ) → [37] hoặc [38].",
  },
  {
    id: "3",
    ko: "조정·대체 인보이스 수령(TT91/2026/TT-BTC 제10조 5항) → 수령 기간 [37] 또는 [38].",
    vi: "Nhận hóa đơn điều chỉnh/thay thế (TT91/2026) → [37] hoặc [38] trong kỳ nhận.",
  },
  {
    id: "4",
    ko: "공제→직접 방식 전환 → 전환 직전 마지막 기간 [37].",
    vi: "Chuyển khấu trừ → trực tiếp → [37] kỳ cuối trước chuyển.",
  },
  {
    id: "5",
    ko: "기타(NĐ252 제12조, TT89 Phụ lục II) → 전문가 수기, 근거 조항 입력.",
    vi: "Khác (NĐ252 Đ12, TT89 Phụ lục II) → chuyên gia nhập tay, ghi căn cứ.",
  },
] as const;

export type GtgtReasonCodeId = (typeof GTGT_ADJUSTMENT_REASON_CODES)[number]["id"];
