import Hero from "@/components/home/Hero";
import CheckSection from "@/components/home/CheckSection";
import DocumentReviewSection from "@/components/home/DocumentReviewSection";
import PermitSection from "@/components/home/PermitSection";
import AdministrativeAISection from "@/components/home/AdministrativeAISection";

export default function Home() {
  return (
    <>
      <Hero />
      <CheckSection />
      <DocumentReviewSection />
      <PermitSection />
      <AdministrativeAISection />
    </>
  );
}
