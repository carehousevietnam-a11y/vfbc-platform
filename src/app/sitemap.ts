import type { MetadataRoute } from "next";
import { getPublishedArticleBySlug, listPublishedArticleSlugs } from "@/lib/contentPacks/registry";
import { guidePath } from "@/lib/contentPacks/paths";
import { getSiteOrigin } from "@/lib/siteOrigin";

/** 공개 색인 대상: /guide slug만. /ai 무쿼리는 noindex 정책이라 넣지 않는다. */
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteOrigin();

  return listPublishedArticleSlugs().flatMap((slug) => {
    const article = getPublishedArticleBySlug(slug);
    if (!article) return [];
    return [
      {
        url: `${origin}${guidePath(slug)}`,
        lastModified: article.updatedAt,
        changeFrequency: "monthly",
        priority: 0.8,
      },
    ];
  });
}
