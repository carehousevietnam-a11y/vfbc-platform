import SiteHeader from "@/components/home/SiteHeader";
import Hero from "@/components/home/Hero";
import CostCheckPromo from "@/components/home/CostCheckPromo";
import CheckSection from "@/components/home/CheckSection";
import DocumentReviewSection from "@/components/home/DocumentReviewSection";
import PermitSection from "@/components/home/PermitSection";
import AdministrativeAISection from "@/components/home/AdministrativeAISection";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <Hero />
      <CostCheckPromo />
      <CheckSection />
      <DocumentReviewSection />
      <PermitSection />
      <AdministrativeAISection />
    </>
  );
}
