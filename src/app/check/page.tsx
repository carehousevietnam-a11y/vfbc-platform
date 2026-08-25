import type { Metadata } from "next";
import { getSiteOrigin } from "@/lib/siteOrigin";
import CheckLandingClient from "./CheckLandingClient";

const TITLE = "CHECK · 베트남 행정전문 AI | MY VIET CHECK";
const DESCRIPTION =
  "거주증, 거주신고, 노동허가, 운전면허 등 베트남에서 필요한 행정 절차와 진행 비용을 먼저 확인합니다.";

export async function generateMetadata(): Promise<Metadata> {
  const origin = getSiteOrigin();

  return {
    metadataBase: new URL(origin),
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: "/check" },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      type: "website",
      url: `${origin}/check`,
    },
  };
}

export default function CheckPage() {
  return <CheckLandingClient />;
}
