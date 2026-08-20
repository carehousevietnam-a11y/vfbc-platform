import type { Metadata } from "next";
import { getSiteOrigin } from "@/lib/siteOrigin";
import ProtectLandingClient from "./ProtectLandingClient";

const TITLE = "PROTECT 마이페이지 | MY VIET CHECK";
const DESCRIPTION =
  "신청 진행 상황과 서류 제출 현황을 마이페이지에서 확인하고, 문제 발생 전에 미리 점검합니다.";

export async function generateMetadata(): Promise<Metadata> {
  const origin = getSiteOrigin();

  return {
    metadataBase: new URL(origin),
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: "/protect" },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      type: "website",
      url: `${origin}/protect`,
    },
  };
}

export default function ProtectPage() {
  return <ProtectLandingClient />;
}
