import SiteHeader from "@/components/home/SiteHeader";
import MyVietCheckHero from "@/components/home/MyVietCheckHero";
import AdministrativeAISection from "@/components/home/AdministrativeAISection";

export default function Home() {
  return (
    <main className="w-full bg-[#faf8f5]">
      <SiteHeader />
      <MyVietCheckHero />
      <AdministrativeAISection />
    </main>
  );
}
