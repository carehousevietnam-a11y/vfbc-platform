import type { ArticleSection, PublishedArticle } from "@/lib/contentPacks/types";

const NARRATIVE_H2 = {
  anxieties: "지금 이런 걱정, 하고 계신가요?",
  caseCheckpoints: "이 사건에서 무엇을 봐야 하나요?",
  beforeAction: "서명·제출·송금 전에 확인할 것",
  afterAction: "이미 진행한 뒤에 확인할 것",
  evidenceWhenProblem: "문제가 생겼다면 지금 확보할 증거",
} as const;

export type GuideCheckpoint = { title: string; body: string };

export type ParsedGuideView = {
  hasNarrative: boolean;
  anxieties: string[];
  caseCheckpoints: GuideCheckpoint[];
  beforeAction: string[];
  afterAction: string[];
  evidenceWhenProblem: string[];
};

export function parseCheckpointBullet(item: string): GuideCheckpoint {
  const sep = item.indexOf(" — ");
  if (sep === -1) return { title: item, body: "" };
  return { title: item.slice(0, sep), body: item.slice(sep + 3) };
}

function collectBulletsAfterH2(sections: ArticleSection[], h2Text: string): string[] {
  const index = sections.findIndex((s) => s.type === "h2" && s.text === h2Text);
  if (index === -1) return [];
  const next = sections[index + 1];
  if (next?.type === "bullets") return next.items;
  return [];
}

export function parseGuideArticleSections(sections: ArticleSection[]): ParsedGuideView {
  const anxieties = collectBulletsAfterH2(sections, NARRATIVE_H2.anxieties);
  const checkpointBullets = collectBulletsAfterH2(sections, NARRATIVE_H2.caseCheckpoints);
  const beforeAction = collectBulletsAfterH2(sections, NARRATIVE_H2.beforeAction);
  const afterAction = collectBulletsAfterH2(sections, NARRATIVE_H2.afterAction);
  const evidenceWhenProblem = collectBulletsAfterH2(sections, NARRATIVE_H2.evidenceWhenProblem);

  const hasNarrative =
    anxieties.length > 0 ||
    checkpointBullets.length > 0 ||
    beforeAction.length > 0 ||
    afterAction.length > 0;

  return {
    hasNarrative,
    anxieties,
    caseCheckpoints: checkpointBullets.map(parseCheckpointBullet),
    beforeAction,
    afterAction,
    evidenceWhenProblem,
  };
}

export function buildGuideViewFallback(article: PublishedArticle): ParsedGuideView {
  const landing = article.caseLanding;
  const checkpoints: GuideCheckpoint[] =
    landing.comparison.length > 0
      ? landing.comparison.slice(0, 4).map((item) => ({ title: item.label, body: item.text }))
      : landing.conditions.slice(0, 4).map((item) => ({ title: item, body: "" }));

  return {
    hasNarrative: false,
    anxieties: [],
    caseCheckpoints: checkpoints,
    beforeAction: landing.process.length > 0 ? landing.process.slice(0, 3) : landing.conditions.slice(0, 3),
    afterAction: landing.cautions.slice(0, 3),
    evidenceWhenProblem: [],
  };
}

export function resolveGuideView(article: PublishedArticle): ParsedGuideView {
  const parsed = parseGuideArticleSections(article.sections);
  if (parsed.hasNarrative && parsed.caseCheckpoints.length > 0) return parsed;
  const fallback = buildGuideViewFallback(article);
  return {
    ...fallback,
    anxieties: parsed.anxieties.length > 0 ? parsed.anxieties : fallback.anxieties,
    caseCheckpoints:
      parsed.caseCheckpoints.length > 0 ? parsed.caseCheckpoints : fallback.caseCheckpoints,
    beforeAction: parsed.beforeAction.length > 0 ? parsed.beforeAction : fallback.beforeAction,
    afterAction: parsed.afterAction.length > 0 ? parsed.afterAction : fallback.afterAction,
    evidenceWhenProblem:
      parsed.evidenceWhenProblem.length > 0
        ? parsed.evidenceWhenProblem
        : fallback.evidenceWhenProblem,
  };
}
