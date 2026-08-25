import type { Metadata } from "next";
import { getSiteOrigin } from "@/lib/siteOrigin";
import RegisterLandingClient from "./RegisterLandingClient";

const TITLE = "REGISTER · 베트남 인허가전문 AI | MY VIET CHECK";
const DESCRIPTION =
  "법인설립, 식당, 소방, 위생, 화장품, 유통, 프랜차이즈 등 사업에 필요한 인허가와 비용을 확인합니다.";

export async function generateMetadata(): Promise<Metadata> {
  const origin = getSiteOrigin();

  return {
    metadataBase: new URL(origin),
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: "/register" },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      type: "website",
      url: `${origin}/register`,
    },
  };
}

export default function RegisterPage() {
  return <RegisterLandingClient />;
}
