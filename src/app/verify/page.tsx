import type { Metadata } from "next";
import { getSiteOrigin } from "@/lib/siteOrigin";
import VerifyLandingClient from "./VerifyLandingClient";

const TITLE = "VERIFY · 베트남 법률전문 AI | MY VIET CHECK";
const DESCRIPTION =
  "행정, 부동산, 세무, 사기, 불확실한 서류 등을 계약 전·후에 확인합니다.";

export async function generateMetadata(): Promise<Metadata> {
  const origin = getSiteOrigin();

  return {
    metadataBase: new URL(origin),
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: "/verify" },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      type: "website",
      url: `${origin}/verify`,
    },
  };
}

export default function VerifyPage() {
  return <VerifyLandingClient />;
}
