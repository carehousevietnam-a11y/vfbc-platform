import type { Metadata } from "next";
import { getSiteOrigin } from "@/lib/siteOrigin";
import { getLanding, landingPath, type LandingEntry } from "./registry";

/** 랜딩 페이지 공통 메타. 자기 자신 canonical, 색인 허용, 소셜 미리보기. */
export function landingMetadata(slug: string): Metadata {
  const l = getLanding(slug);
  const origin = getSiteOrigin();
  const url = `${origin}${landingPath(l.slug)}`;
  return {
    metadataBase: new URL(origin),
    title: l.title,
    description: l.description,
    keywords: l.keywords,
    alternates: { canonical: landingPath(l.slug) },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: "MY VIET CHECK",
      title: l.title,
      description: l.description,
      url,
      images: [{ url: `${origin}${l.ogImage}` }],
    },
    twitter: { card: "summary_large_image", title: l.title, description: l.description, images: [`${origin}${l.ogImage}`] },
  };
}

function graph(l: LandingEntry) {
  const origin = getSiteOrigin();
  const url = `${origin}${landingPath(l.slug)}`;
  const provider = { "@type": "Organization", "@id": `${origin}/#org`, name: "VFBCAI", url: origin };
  return {
    "@context": "https://schema.org",
    "@graph": [
      provider,
      {
        "@type": "WebPage",
        "@id": `${url}#page`,
        url,
        name: l.title,
        description: l.description,
        inLanguage: "ko",
        dateModified: l.updatedAt,
        isPartOf: { "@type": "WebSite", "@id": `${origin}/#site`, name: "MY VIET CHECK", url: origin },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        primaryImageOfPage: `${origin}${l.ogImage}`,
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: l.serviceName,
        serviceType: l.serviceType,
        description: l.description,
        provider: { "@id": provider["@id"] },
        areaServed: { "@type": "Country", name: "Vietnam" },
        audience: { "@type": "Audience", audienceType: "베트남 거주·사업 한국인" },
        url,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "홈", item: origin },
          { "@type": "ListItem", position: 2, name: l.serviceName, item: url },
        ],
      },
    ],
  };
}

/** 구조화 데이터. 화면에 없는 내용(FAQ·가격 등)은 넣지 않는다. */
export function LandingJsonLd({ slug }: { slug: string }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph(getLanding(slug))).replace(/</g, "\\u003c") }}
    />
  );
}
