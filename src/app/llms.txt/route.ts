import { LANDINGS, landingPath } from "@/lib/landings/registry";
import { listPublishedArticleSlugs, getPublishedArticleBySlug } from "@/lib/contentPacks/registry";
import { guidePath } from "@/lib/contentPacks/paths";
import { getSiteOrigin } from "@/lib/siteOrigin";

export const dynamic = "force-static";

/** AI 검색·답변 엔진용 사이트 안내(llms.txt). 공개 랜딩과 가이드만 나열한다. */
export function GET() {
  const origin = getSiteOrigin();
  const lines: string[] = [
    "# MY VIET CHECK (VFBCAI)",
    "",
    "> 베트남 체류·사업 인허가를 신청하기 전에 비용·절차·가능성을 먼저 확인하는 한국어 AI 진단 서비스.",
    "",
    "## 서비스",
    ...LANDINGS.map((l) => `- [${l.serviceName}](${origin}${landingPath(l.slug)}): ${l.description}`),
    "",
    "## 가이드",
    ...listPublishedArticleSlugs().flatMap((slug) => {
      const a = getPublishedArticleBySlug(slug);
      return a ? [`- [${a.caseLanding.question}](${origin}${guidePath(slug)}): ${a.metaDescription}`] : [];
    }),
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
