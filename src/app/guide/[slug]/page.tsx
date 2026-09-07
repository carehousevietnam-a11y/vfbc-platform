import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/home/SiteHeader";
import { GuideCaseBody } from "@/components/answers/GuideCaseBody";
import {
  MASTER_CHECK_GUIDE_SLUGS,
  MasterCheckGuideDetail,
} from "@/components/cost-check/MasterCheckGuideDetail";
import { parseCheckGuideIntent } from "@/lib/contentPacks/checkGuideIntent";
import { getPublishedArticleBySlug, listPublishedArticleSlugs } from "@/lib/contentPacks/registry";
import { guidePath } from "@/lib/contentPacks/paths";
import { getSiteOrigin } from "@/lib/siteOrigin";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ intent?: string | string[]; q?: string | string[] }>;
};

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export async function generateStaticParams() {
  return listPublishedArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const origin = getSiteOrigin();
  const article = getPublishedArticleBySlug(slug);

  if (!article) {
    return {
      metadataBase: new URL(origin),
      title: "가이드를 찾을 수 없습니다 | VFBCAI",
      robots: { index: false, follow: true },
    };
  }

  const canonicalPath = guidePath(slug);
  const title = `${article.caseLanding.question} | VFBCAI`;
  const description = article.metaDescription;

  return {
    metadataBase: new URL(origin),
    title,
    description,
    alternates: { canonical: canonicalPath },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description: article.caseLanding.directAnswer,
      type: "article",
      url: `${origin}${canonicalPath}`,
      modifiedTime: article.updatedAt,
      authors: ["VFBCAI"],
    },
  };
}

export default async function GuideCasePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const article = getPublishedArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  const origin = getSiteOrigin();
  const canonicalUrl = `${origin}${guidePath(slug)}`;
  const isMasterCheckGuide = MASTER_CHECK_GUIDE_SLUGS.has(slug);
  const intent = parseCheckGuideIntent(firstSearchParam(sp.intent));
  const question = firstSearchParam(sp.q)?.trim() || null;

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
    inLanguage: "ko",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    author: { "@type": "Organization", name: "VFBCAI" },
    publisher: { "@type": "Organization", name: "VFBCAI" },
  };

  return (
    <div
      className={`min-h-full min-w-0 overflow-x-hidden ${
        isMasterCheckGuide ? "bg-white" : "bg-[#fafafa]"
      }`}
    >
      <div className="h-[3px] bg-blue-900" />
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      {isMasterCheckGuide ? (
        <MasterCheckGuideDetail article={article} intent={intent} question={question} />
      ) : (
        <GuideCaseBody article={article} />
      )}
    </div>
  );
}
