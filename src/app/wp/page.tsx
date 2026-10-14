import type { Metadata } from "next";
import WorkPermitLandingClient from "./WorkPermitLandingClient";

export const metadata: Metadata = {
  title: "MY VIET CHECK | 노동허가, 얼마면 받을 수 있을까요?",
  description:
    "정부 비용부터 서류 준비비용, 대행비용까지. 베트남 노동허가(Work Permit)에 내가 실제로 부담할 비용과 받은 견적을 먼저 확인하세요.",
};

export default function WorkPermitLandingPage() {
  return <WorkPermitLandingClient />;
}
