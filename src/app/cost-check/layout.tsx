import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "행정비용 적정성 진단 | VFBCAI",
  description:
    "베트남 땀주·TRC·노동허가·법인설립·공증번역 견적이 적정한지 정부 공식 수수료와 시장 참고 범위로 무료 확인하세요. 회원가입 없이 즉시 이용.",
  openGraph: {
    title: "행정비용 적정성 진단 | VFBCAI",
    description:
      "내 견적이 적정한지 1분 만에 확인 — 정부 수수료·시장 참고 범위 기반 규칙 진단 (무료, 회원가입 불필요)",
    type: "website",
  },
};

export default function CostCheckLayout({ children }: { children: React.ReactNode }) {
  return children;
}
