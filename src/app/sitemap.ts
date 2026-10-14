import type { MetadataRoute } from "next";
import { getPublishedArticleBySlug, listPublishedArticleSlugs } from "@/lib/contentPacks/registry";
import { guidePath } from "@/lib/contentPacks/paths";
import { getSiteOrigin } from "@/lib/siteOrigin";
import { LANDINGS, landingPath } from "@/lib/landings/registry";

/** 공개 색인 대상: 서비스 랜딩(/slug) + /guide slug. /ai 무쿼리는 noindex 정책이라 넣지 않는다. */
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteOrigin();

  const landings: MetadataRoute.Sitemap = LANDINGS.map((l) => ({
    url: `${origin}${landingPath(l.slug)}`,
    lastModified: l.updatedAt,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const guides: MetadataRoute.Sitemap = listPublishedArticleSlugs().flatMap((slug) => {
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
  return [...landings, ...guides];
}
