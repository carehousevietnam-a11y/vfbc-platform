import type { Metadata } from "next";
import AiPageClient from "./AiPageClient";
import { getSiteOrigin } from "@/lib/siteOrigin";

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim();
  const origin = getSiteOrigin();
  const canonicalPath = query ? `/ai?q=${encodeURIComponent(query)}` : "/ai";
  const title = query
    ? `${query} 확인 | MY VIET CHECK`
    : "MY VIET CHECK | 베트남 행정·법률 비용과 절차를 직접 확인";
  const description = query
    ? `"${query}"에 대한 베트남 정부 공식 비용·절차 기준 확인 결과와 근거를 안내합니다.`
    : "베트남 노동허가·거주증·법인설립 등 정부 공식 비용과 절차를 무료로 확인하세요.";

  return {
    metadataBase: new URL(origin),
    title,
    description,
    alternates: { canonical: canonicalPath },
    robots: { index: Boolean(query), follow: true },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${origin}${canonicalPath}`,
    },
  };
}

export default async function AiPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim();
  const origin = getSiteOrigin();
  const url = `${origin}/ai${query ? `?q=${encodeURIComponent(query)}` : ""}`;
  const name = query ? `${query} 확인 | MY VIET CHECK` : "MY VIET CHECK";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name,
            url,
          }),
        }}
      />
      <AiPageClient />
    </>
  );
}
