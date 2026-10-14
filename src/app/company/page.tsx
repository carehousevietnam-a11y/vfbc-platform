import type { Metadata } from "next";
import CompanyLandingClient from "./CompanyLandingClient";

export const metadata: Metadata = {
  title: "MY VIET CHECK | 법인설립, 대행사부터 찾지 마세요.",
  description:
    "베트남에서 법인을 만들기 전, 비용과 절차를 먼저 확인하세요. 정부 공식 수수료와 시장 대행 비용은 별개입니다.",
};

export default function CompanyLandingPage() {
  return <CompanyLandingClient />;
}
