import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPublishedArticleBySlug, listPublishedArticleSlugs } from "@/lib/contentPacks/registry";
import { guidePath } from "@/lib/contentPacks/paths";
import { getSiteOrigin } from "@/lib/siteOrigin";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return listPublishedArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const origin = getSiteOrigin();
  const article = getPublishedArticleBySlug(slug);
  const canonicalPath = guidePath(slug);

  if (!article) {
    return {
      metadataBase: new URL(origin),
      title: "가이드를 찾을 수 없습니다 | VFBCAI",
      robots: { index: false, follow: false },
    };
  }

  return {
    metadataBase: new URL(origin),
    title: `${article.caseLanding.question} | VFBCAI`,
    description: article.metaDescription,
    alternates: { canonical: canonicalPath },
    robots: { index: false, follow: true },
  };
}

/** 기존 /answers/* 는 /guide/* 사례형 랜딩으로 보낸다. */
export default async function AnswerGuideRedirectPage({ params }: PageProps) {
  const { slug } = await params;
  const article = getPublishedArticleBySlug(slug);
  if (!article) {
    notFound();
  }
  redirect(guidePath(slug));
}
