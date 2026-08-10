import type { PublishedArticle } from "@/lib/contentPacks/types";
import { TRC_ARTICLES_BY_SLUG } from "@/lib/contentPacks/trcArticles";

export function getPublishedArticleBySlug(slug: string): PublishedArticle | null {
  return TRC_ARTICLES_BY_SLUG[slug] ?? null;
}

export function listPublishedArticleSlugs(): string[] {
  return Object.keys(TRC_ARTICLES_BY_SLUG);
}
