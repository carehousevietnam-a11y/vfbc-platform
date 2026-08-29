import type { PublishedArticle } from "@/lib/contentPacks/types";
import { getRequiredDocuments } from "@/lib/requiredDocuments";
import { getCostCheckService } from "@/lib/costCheck";
import { resolveGuideView } from "@/lib/contentPacks/parseGuideArticleView";
import { GuideCaseHero, GuideCaseVisual } from "@/components/answers/GuideCaseVisual";
import { GuideCaseNextStepCta } from "@/components/answers/GuideCaseNextStepCta";

/**
 * MASTER 「자세히 보기」용 — GuideCaseVisual과 동일한 사건형 UI.
 */
export function GuideCaseFunnelSummary({
  article,
  onFunnelClick,
  showHero = false,
}: {
  article: PublishedArticle;
  onFunnelClick?: () => void;
  /** MASTER 퍼널은 상단에 제목이 있어 Hero를 생략 */
  showHero?: boolean;
}) {
  const landing = article.caseLanding;
  const view = resolveGuideView(article);
  const docs = getRequiredDocuments(article.serviceType);
  const showDocuments = landing.showDocuments !== false;

  return (
    <div className="space-y-8 sm:space-y-10">
      <GuideCaseHero article={article} showHero={showHero} />
      <GuideCaseVisual
        article={article}
        view={view}
        docs={docs}
        showDocuments={showDocuments}
        showHero={showHero}
      />
      <GuideCaseNextStepCta article={article} onFunnelClick={onFunnelClick} />
    </div>
  );
}
