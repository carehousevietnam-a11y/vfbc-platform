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
  company: [
    { label: "법인설립 가능 여부를 확인해볼까요?", href: "/register/company" },
    { label: "설립 절차와 필요 서류 확인해볼까요?", href: "/register/company" },
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
