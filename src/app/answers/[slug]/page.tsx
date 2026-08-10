import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/answers/ArticleBody";
import { getPublishedArticleBySlug, listPublishedArticleSlugs } from "@/lib/contentPacks/registry";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return listPublishedArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getPublishedArticleBySlug(slug);
  if (!article) {
    return { title: "가이드를 찾을 수 없습니다 | VFBCAI" };
  }

  return {
    title: `${article.title} | VFBCAI`,
    description: article.metaDescription,
    openGraph: {
      title: article.title,
      description: article.metaDescription,
      type: "article",
    },
  };
}

export default async function AnswerGuidePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getPublishedArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  const faqJsonLd =
    article.intentId === "trc-documents"
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "거주증(TRC) 신청에 어떤 서류가 필요한가요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "일반적으로 여권, 비자, 재직증명서, 회사서류가 필요하며, 주소지 관련 자료 등이 추가로 요청될 수 있습니다.",
              },
            },
            {
              "@type": "Question",
              name: "이 안내는 법적 확정 답변인가요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "아닙니다. 참고용 가이드이며, 정확한 확인은 VFBCAI 마이페이지 또는 전문가 상담을 이용해 주세요.",
              },
            },
          ],
        }
      : null;

  return (
    <div className="min-h-full bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <header className="border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold text-blue-900">
            VFBCAI
          </Link>
          <nav className="flex gap-3 text-xs font-medium text-gray-600">
            <Link href="/ai" className="hover:text-blue-900">
              AI 상담
            </Link>
            <Link href={article.funnelHref} className="hover:text-blue-900">
              직접 확인
            </Link>
          </nav>
        </div>
      </header>

      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}

      <ArticleBody article={article} />
    </div>
  );
}
