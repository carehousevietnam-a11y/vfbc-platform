import WorkPermitLandingClient from "./WorkPermitLandingClient";
import { LandingJsonLd, landingMetadata } from "@/lib/landings/seo";

export const metadata = landingMetadata("wp");

export default function WorkPermitLandingPage() {
  return (
    <>
      <LandingJsonLd slug="wp" />
      <WorkPermitLandingClient />
    </>
  );
}
