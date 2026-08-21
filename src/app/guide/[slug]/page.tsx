import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/home/SiteHeader";
import { GuideCaseBody } from "@/components/answers/GuideCaseBody";
import { getPublishedArticleBySlug, listPublishedArticleSlugs } from "@/lib/contentPacks/registry";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return listPublishedArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getPublishedArticleBySlug(slug);
  if (!article) {
    return { title: "가이드를 찾을 수 없습니다 | VFBCAI" };
  }

  return {
    title: `${article.caseLanding.question} | VFBCAI`,
    description: article.metaDescription,
    openGraph: {
      title: article.caseLanding.question,
      description: article.caseLanding.directAnswer,
      type: "article",
    },
  };
}

export default async function GuideCasePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getPublishedArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.caseLanding.qa.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.caseLanding.question,
    description: article.caseLanding.directAnswer,
    dateModified: article.updatedAt,
    author: { "@type": "Organization", name: "VFBCAI" },
  };

  return (
    <div className="min-h-full bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <GuideCaseBody article={article} />
    </div>
  );
}
