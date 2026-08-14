import SiteHeader from "@/components/home/SiteHeader";
import MyVietCheckHero from "@/components/home/MyVietCheckHero";
import CostCheckPromo from "@/components/home/CostCheckPromo";
import CheckSection from "@/components/home/CheckSection";
import DocumentReviewSection from "@/components/home/DocumentReviewSection";
import PermitSection from "@/components/home/PermitSection";
import AdministrativeAISection from "@/components/home/AdministrativeAISection";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <MyVietCheckHero />
      <CostCheckPromo />
      <CheckSection />
      <DocumentReviewSection />
      <PermitSection />
      <AdministrativeAISection />
    </>
  );
}
