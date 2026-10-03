/**
 * My Page public link / rolling strip catalog — shared by mypage UI and verify_admin rolling strip.
 */

export const MYPAGE_PUBLIC_LINKS = [
  {
    label: "정부24",
    sub: "주민등록등본, 가족관계증명서 등",
    href: "https://www.gov.kr/",
    iconSrc: "/mypage-icons/kr-gov24.webp",
  },
  {
    label: "영사민원24",
    sub: "공증, 영사확인, 여권 등",
    href: "https://consul.mofa.go.kr/",
    iconSrc: "/mypage-icons/kr-consul.webp",
  },
  {
    label: "법무부",
    sub: "출입국·체류·국적 관련 정보",
    href: "https://www.moj.go.kr/",
    iconSrc: "/mypage-icons/kr-moj.webp",
  },
  {
    label: "하이코리아",
    sub: "외국인 전자민원, 체류 신청 등",
    href: "https://www.hikorea.go.kr/",
    iconSrc: "/mypage-icons/kr-hikorea.webp",
  },
] as const;

export const MYPAGE_VN_PUBLIC_LINKS = [
  {
    label: "베트남 공공서비스 포털",
    href: "https://dichvucong.gov.vn/",
    iconSrc: "/mypage-icons/vn-portal.webp",
  },
  {
    label: "출입국관리기관",
    href: "https://xuatnhapcanh.gov.vn/",
    iconSrc: "/mypage-icons/vn-immigration.webp",
  },
  {
    label: "세무기관",
    href: "https://www.gdt.gov.vn/",
    iconSrc: "/mypage-icons/vn-tax.webp",
  },
  {
    label: "기업등록기관",
    href: "https://dangkykinhdoanh.gov.vn/",
    iconSrc: "/mypage-icons/vn-business.webp",
  },
  {
    label: "노동·고용 기관",
    href: "https://moha.gov.vn/",
    iconSrc: "/mypage-icons/vn-labor.webp",
  },
] as const;

/** VietnamLifeCard life item labels (names only for rolling strip). */
export const MYPAGE_VIETNAM_LIFE_LABELS = [
  "오늘 날씨",
  "환율",
  "은행 휴무",
  "공휴일",
  "행정 공지",
  "내 일정",
] as const;

/** RecommendedServices card titles (existing widget data). */
export const MYPAGE_RECOMMENDED_SERVICE_TITLES = [
  "거주증 갱신 지원",
  "운전면허 전환 확인",
  "사업자 허가 갱신",
  "가족 비자 확인",
] as const;

export type MypageRollingStripItem = {
  id: string;
  label: string;
  href?: string;
  iconSrc?: string;
};

export function buildVerifyAdminRollingStripItems(): MypageRollingStripItem[] {
  const items: MypageRollingStripItem[] = [];

  for (const link of MYPAGE_PUBLIC_LINKS) {
    items.push({
      id: `kr-${link.label}`,
      label: link.label,
      href: link.href,
      iconSrc: link.iconSrc,
    });
  }
  for (const link of MYPAGE_VN_PUBLIC_LINKS) {
    items.push({
      id: `vn-${link.label}`,
      label: link.label,
      href: link.href,
      iconSrc: link.iconSrc,
    });
  }
  for (const label of MYPAGE_VIETNAM_LIFE_LABELS) {
    items.push({ id: `life-${label}`, label });
  }
  for (const title of MYPAGE_RECOMMENDED_SERVICE_TITLES) {
    items.push({ id: `rec-${title}`, label: title });
  }

  return items;
}
