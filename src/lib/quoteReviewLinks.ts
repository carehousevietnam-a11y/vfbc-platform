import type { CostCheckServiceId } from "@/lib/costCheck";

export type QuoteNextLink = { label: string; href: string };

const NEXT_LINKS: Record<CostCheckServiceId, QuoteNextLink[]> = {
  wp: [
    { label: "노동허가가 필요한 대상인지 확인해볼까요?", href: "/check/wp" },
    { label: "진행 절차와 필요 서류 확인해볼까요?", href: "/check/wp" },
  ],
  trc: [
    { label: "거주증 발급 가능 여부를 확인해볼까요?", href: "/check/trc" },
    { label: "진행 절차와 필요 서류 확인해볼까요?", href: "/check/trc" },
  ],
  tamtru: [
    { label: "땀주 등록이 필요한지 확인해볼까요?", href: "/check/tamtru" },
    { label: "진행 절차와 필요 서류 확인해볼까요?", href: "/check/tamtru" },
  ],
  "driving-license": [
    { label: "운전면허 전환 가능 여부를 확인해볼까요?", href: "/check/driving-license" },
    { label: "진행 절차와 필요 서류 확인해볼까요?", href: "/check/driving-license" },
  ],
  company: [
    { label: "법인설립 가능 여부를 확인해볼까요?", href: "/register/company" },
    { label: "설립 절차와 필요 서류 확인해볼까요?", href: "/register/company" },
  ],
  restaurant: [
    { label: "식당허가 가능 여부를 확인해볼까요?", href: "/register/restaurant" },
    { label: "진행 절차와 필요 서류 확인해볼까요?", href: "/register/restaurant" },
  ],
  hygiene: [
    { label: "위생허가 가능 여부를 확인해볼까요?", href: "/register/hygiene" },
    { label: "진행 절차와 필요 서류 확인해볼까요?", href: "/register/hygiene" },
  ],
  "fire-safety": [
    { label: "소방허가 가능 여부를 확인해볼까요?", href: "/register/fire-safety" },
    { label: "진행 절차와 필요 서류 확인해볼까요?", href: "/register/fire-safety" },
  ],
  cosmetics: [
    { label: "화장품허가 가능 여부를 확인해볼까요?", href: "/register/cosmetics" },
    { label: "진행 절차와 필요 서류 확인해볼까요?", href: "/register/cosmetics" },
  ],
  environment: [
    { label: "환경허가 가능 여부를 확인해볼까요?", href: "/register/environment" },
    { label: "진행 절차와 필요 서류 확인해볼까요?", href: "/register/environment" },
  ],
  "medical-device": [
    { label: "의료기기허가 가능 여부를 확인해볼까요?", href: "/register/medical-device" },
    { label: "진행 절차와 필요 서류 확인해볼까요?", href: "/register/medical-device" },
  ],
  franchise: [
    { label: "프랜차이즈 등록 가능 여부를 확인해볼까요?", href: "/register/franchise" },
    { label: "진행 절차와 필요 서류 확인해볼까요?", href: "/register/franchise" },
  ],
  admin: [
    { label: "행정문서 검토가 필요한지 확인해볼까요?", href: "/verify/admin" },
    { label: "진행 절차와 필요 서류 확인해볼까요?", href: "/verify/admin" },
  ],
  "real-estate": [
    { label: "부동산 문서 검토가 필요한지 확인해볼까요?", href: "/verify/real-estate" },
    { label: "진행 절차와 필요 서류 확인해볼까요?", href: "/verify/real-estate" },
  ],
  fraud: [
    { label: "사기문서 검토가 필요한지 확인해볼까요?", href: "/verify/fraud" },
    { label: "진행 절차와 필요 서류 확인해볼까요?", href: "/verify/fraud" },
  ],
  tax: [
    { label: "세무문서 검토가 필요한지 확인해볼까요?", href: "/verify/tax" },
    { label: "진행 절차와 필요 서류 확인해볼까요?", href: "/verify/tax" },
  ],
  notary: [
    { label: "서류 검토가 필요한지 확인해볼까요?", href: "/verify/unclear" },
    { label: "공증·번역 절차를 확인해볼까요?", href: "/verify/admin" },
  ],
};

export function getQuoteNextLinks(serviceId: CostCheckServiceId): QuoteNextLink[] {
  return NEXT_LINKS[serviceId].slice(0, 2);
}

export function getQuoteFunnelHref(serviceId: CostCheckServiceId): string {
  const links = NEXT_LINKS[serviceId];
  return links[0]?.href ?? "/check";
}
