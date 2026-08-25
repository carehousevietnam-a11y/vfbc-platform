import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/siteOrigin";

/** sitemap 위치만 알린다. 기존 페이지 robots 정책을 덮어쓰지 않는다. */
export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
