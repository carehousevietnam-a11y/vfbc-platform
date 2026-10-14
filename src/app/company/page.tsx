import CompanyLandingClient from "./CompanyLandingClient";
import { LandingJsonLd, landingMetadata } from "@/lib/landings/seo";

export const metadata = landingMetadata("company");

export default function CompanyLandingPage() {
  return (
    <>
      <LandingJsonLd slug="company" />
      <CompanyLandingClient />
    </>
  );
}
