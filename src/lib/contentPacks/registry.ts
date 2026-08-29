import type { PublishedArticle } from "@/lib/contentPacks/types";
import { TRC_ARTICLES_BY_SLUG } from "@/lib/contentPacks/trcArticles";
import { WP_ARTICLES_BY_SLUG } from "@/lib/contentPacks/wpArticles";
import { TAMTRU_ARTICLES_BY_SLUG } from "@/lib/contentPacks/tamtruArticles";
import { DRIVING_LICENSE_ARTICLES_BY_SLUG } from "@/lib/contentPacks/drivingLicenseArticles";
import { REGISTER_ARTICLES_BY_SLUG } from "@/lib/contentPacks/registerArticles";
import { VERIFY_ARTICLES_BY_SLUG } from "@/lib/contentPacks/verifyArticles";

const PUBLISHED_ARTICLES_BY_SLUG: Record<string, PublishedArticle> = {
  ...TRC_ARTICLES_BY_SLUG,
  ...WP_ARTICLES_BY_SLUG,
  ...TAMTRU_ARTICLES_BY_SLUG,
  ...DRIVING_LICENSE_ARTICLES_BY_SLUG,
  ...REGISTER_ARTICLES_BY_SLUG,
  ...VERIFY_ARTICLES_BY_SLUG,
};

export function getPublishedArticleBySlug(slug: string): PublishedArticle | null {
  return PUBLISHED_ARTICLES_BY_SLUG[slug] ?? null;
}

export function listPublishedArticleSlugs(): string[] {
  return Object.keys(PUBLISHED_ARTICLES_BY_SLUG);
}
