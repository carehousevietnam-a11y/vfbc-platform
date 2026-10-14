/**
 * 서비스별 랜딩(대문 페이지) 단일 등록부.
 * 새 랜딩을 붙일 때 여기 한 항목만 추가하면 메타·구조화 데이터·sitemap·llms.txt 가 같이 맞춰진다.
 * 규칙(롱테일): 랜딩마다 제목·설명·주소가 서로 달라야 하고(중복 금지), 자기 자신을 canonical 로 가진다.
 * 제목·설명은 대표가 올린 원본 랜딩의 <title>/설명에서 가져온다(원본 문구 수정 금지).
 */
export type LandingEntry = {
  /** 짧은 마케팅 주소 슬러그. 주소는 `/${slug}` */
  slug: string;
  /** 서비스 이름(구조화 데이터·breadcrumb·llms.txt 용, 검색 결과에 보이는 이름) */
  serviceName: string;
  /** 한 줄 서비스 분류(Service.serviceType) */
  serviceType: string;
  title: string;
  description: string;
  keywords: string[];
  /** 시작 버튼이 가는 퍼널 주소 */
  ctaPath: string;
  /** 소셜·AI 미리보기 이미지(공개 경로) */
  ogImage: string;
  /** 내용이 실제로 바뀐 날(sitemap lastmod). 의미 없는 갱신 금지 */
  updatedAt: string;
};

export const LANDINGS: readonly LandingEntry[] = [
  {
    slug: "company",
    serviceName: "베트남 법인설립 비용·절차 확인",
    serviceType: "베트남 법인설립 (투자등록·기업등록) 사전 진단",
    title: "MY VIET CHECK | 법인설립, 대행사부터 찾지 마세요.",
    description:
      "베트남에서 법인을 만들기 전, 비용과 절차를 먼저 확인하세요. 정부 공식 수수료와 시장 대행 비용은 별개입니다.",
    keywords: ["베트남 법인설립", "베트남 법인설립 비용", "베트남 법인설립 절차", "베트남 투자등록증"],
    ctaPath: "/register/company",
    ogImage: "/lp/company/direct_check_shots/step-01.png",
    updatedAt: "2026-10-14",
  },
  {
    slug: "wp",
    serviceName: "베트남 노동허가(Work Permit) 비용·가능성 확인",
    serviceType: "베트남 노동허가(Work Permit) 사전 진단",
    title: "MY VIET CHECK | 노동허가, 얼마면 받을 수 있을까요?",
    description:
      "정부 비용부터 서류 준비비용, 대행비용까지. 베트남 노동허가(Work Permit)에 내가 실제로 부담할 비용과 받은 견적을 먼저 확인하세요.",
    keywords: ["베트남 노동허가", "베트남 워크퍼밋", "베트남 노동허가 비용", "베트남 노동허가 서류"],
    ctaPath: "/check/wp",
    ogImage: "/lp/wp/direct-check/work-permit-check-01.jpg",
    updatedAt: "2026-10-14",
  },
];

export function landingPath(slug: string): string {
  return `/${slug}`;
}

export function getLanding(slug: string): LandingEntry {
  const found = LANDINGS.find((l) => l.slug === slug);
  if (!found) throw new Error(`landing not registered: ${slug}`);
  return found;
}
