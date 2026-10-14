import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/siteOrigin";

/** 공개 페이지는 모두 허용(검색·AI 크롤러 포함). 고객 데이터·관리 영역은 크롤 제외. sitemap 위치를 알린다. */
export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/mypage", "/login", "/r$"],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
