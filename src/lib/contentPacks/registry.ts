import type { PublishedArticle } from "@/lib/contentPacks/types";
import { TRC_ARTICLES_BY_SLUG } from "@/lib/contentPacks/trcArticles";
import { WP_ARTICLES_BY_SLUG } from "@/lib/contentPacks/wpArticles";

const PUBLISHED_ARTICLES_BY_SLUG: Record<string, PublishedArticle> = {
  ...TRC_ARTICLES_BY_SLUG,
  ...WP_ARTICLES_BY_SLUG,
};

export function getPublishedArticleBySlug(slug: string): PublishedArticle | null {
  return PUBLISHED_ARTICLES_BY_SLUG[slug] ?? null;
}

export function listPublishedArticleSlugs(): string[] {
  return Object.keys(PUBLISHED_ARTICLES_BY_SLUG);
}
